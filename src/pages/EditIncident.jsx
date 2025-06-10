import React, { useState, useEffect} from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { postIncident, getLocation, getIncident, updateIncident, sendIncidentViaEmail, deleteImage } from '../funcs/Incidents';
const INCIDENTS_URL = import.meta.env.VITE_INCIDENTS_URL;
const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api';
const INCIDENTS_IMAGES_URL = import.meta.env.VITE_IMAGES_URL;
import ImageUpload from '../components/ImageUpload';
import { closeIncident, getTokenFromCookie } from '../funcs/Incidents';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Pointer, X as XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Mapview from '../components/Map';
import { validarDniNif,validarMatricula } from '../funcs/Incidents';
import AddTeammate from '../components/AddTeammate';

const EditIncident = () => {
  document.title = "SIL Tauste - Editar Incidencia";
  const USER_CODE = localStorage.getItem('username') || 'AR00001';
  const { code } = useParams();
/*
* Function to close an incident
* @param {string} incident_code - The code of the incident to close
* @param {string} agent_code - The code of the agent closing the incident
* @returns {Promise<void>}
*/
  const closeINC = (incident_code, agent_code) => {
    Swal.fire({
      title: '¿Cerrar incidencia?',
      text: "¿Estás seguro de que deseas cerrar esta incidencia?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await closeIncident(incident_code, agent_code);
        if (response.ok) {
          Swal.fire(
            'Incidencia cerrada',
            'La incidencia ha sido cerrada correctamente.',
            'success'
          );
        } else {
          return;
          Swal.fire(
            'Error',
            response.message || 'No se pudo cerrar la incidencia.',
            'error'
        
          );
        }
      }
    });
  };

  const Navigate = useNavigate();
  console.log('code: '+ code);
  
  const [loading, setLoading] = useState(true);
  
  // Estado para el formulario y datos relacionados
  const [form, setForm] = useState({
    status: 'Open',    
    location: '',
    type: '',
    description: '',
    brigade_field: false,
    creator_user_code: 'AR00001',
  });
  
  const [personas, setPersonas] = useState([]);
  const [teammate, setTeammate] = useState('');
  const [creator_code, setCreatorCode] = useState(null);
  const [vehiculos, setVehiculos] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [location, setLocation] = useState('');
  
  // Estado para el visor de imágenes
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [allImages, setAllImages] = useState([]);
  useEffect(() => {
    setAllImages([...existingImages, ...selectedImages]);
  }, [existingImages, selectedImages]);

  // Función para abrir el lightbox
  const openLightbox = (imageUrl) => {
    setCurrentImage(imageUrl);
    setLightboxOpen(true);
  };

  // Función para cerrar el lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentImage('');
  };

  // Cargar los datos de la incidencia
  useEffect(() => {
    const fetchIncidentData = async () => {
      setLoading(true);
      try {
        const data = await getIncident(code);
        console.log('Datos recibidos de la API:', data);
        
        if (!data || data.ok === false) {
          console.error('Error al cargar la incidencia:', data?.message);
          setLoading(false);
          return;
        }
        
        // Actualizar el formulario con todos los datos de la incidencia
        setTeammate(data.team_mate);
        setCreatorCode(data.creator_user_code);
        console.log('Compañero:', data.team_mate);
        const updatedForm = {
          status: data.status || 'Open',
          location: data.location || '',
          type: data.type || '',
          description: data.description || '',
          brigade_field: data.brigade_field ? true : false, // Asegurarse de que sea booleano and prevent send to brigade_field by default editing
          creator_user_code: 'AR00001',
        };
        console.log('Formulario actualizado:', updatedForm);
        setForm(updatedForm);
        
        // Cargar personas relacionadas
        if (data.people && Array.isArray(data.people)) {
          setPersonas(data.people);
          console.log('Personas cargadas:', data.people);
        }
        
        // Cargar vehículos relacionados
        if (data.vehicles && Array.isArray(data.vehicles)) {
          setVehiculos(data.vehicles);
          console.log('Vehículos cargados:', data.vehicles);
        }
        
        // Cargar imágenes existentes
        if (data.images && Array.isArray(data.images)) {
          // Extraer las URLs de las imágenes del array de objetos
          const imageUrls = data.images.map(img => img.url || img);
          setExistingImages(imageUrls);
          console.log('Imágenes cargadas:', imageUrls);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar la incidencia:', error);
        setLoading(false);
      }
    };
    
    if (code) {
      fetchIncidentData();
    }
  }, [code]);

  // Para verificar que los valores están presentes en el estado del formulario
  useEffect(() => {
    console.log('Estado actual del formulario:', form);
  }, [form]);

  const [nuevaPersona, setNuevaPersona] = useState({
    dni: '',
    first_name: '',
    last_name1: '',
    last_name2: '',
    phone_number: ''
  });
  const [nuevoVehiculo, setNuevoVehiculo] = useState({ brand: '', model: '', color: '', license_plate: '' });

  const tipos = [
    'Animales',
    'Seguridad Ciudadana',
    'Trafico',
    'Ruidos',
    'Asistencia Colaboración Ciudadana',
    'Ilícito penal',
    'Incidencias Urbanísticas',
    'Otras incidencias no clasificadas',
  ];

const handleChange = async (e) => {
  const { name, value, type, checked } = e.target;
  const newValue = type === 'checkbox' ? checked : value;

  // Mostrar alerta si se cambia el estado a "Closed"
  if (name === 'status' && newValue === 'Closed' && form.status !== 'Closed') {
    closeINC(code, USER_CODE);
  }

  setForm({
    ...form,
    [name]: newValue,
  });
};
const handleStatusChange = async (e) => {
  const newStatus = e.target.value;

  if (newStatus === 'Closed' && form.status !== 'Closed') {
    const result = await Swal.fire({
      title: '¿Cerrar incidencia?',
      text: '¿Estás seguro de que deseas cerrar esta incidencia?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    const response = await closeIncident(code, USER_CODE);
    if (response.ok) {
      Swal.fire('Incidencia cerrada', 'La incidencia ha sido cerrada correctamente.', 'success');
      setForm(prev => ({ ...prev, status: 'Closed' }));
    } else {
      Swal.fire('Error', response.message || 'No se pudo cerrar la incidencia.', 'error');
    }
  } else {
    // Si se vuelve a "Open" manualmente
    setForm(prev => ({ ...prev, status: newStatus }));
  }
};

const handleReSend = () => {
  Swal.fire({
    title: 'Reenviar a brigada',
    text: '¿Deseas reenviar esta incidencia a la brigada?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, reenviar',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await sendIncidentViaEmail('unaicc2003@gmail.com', form.description, form.location, allImages);
        Swal.fire('Reenviado', 'La incidencia ha sido reenviada a la brigada.', 'success');
      } catch (error) {
        console.error('Error al enviar el correo:', error);
        Swal.fire('Error', 'No se pudo reenviar la incidencia a la brigada.', 'error');
      }
    }
  });
};


  const handleImagesChange = (files) => {
    setSelectedImages(files);
  };

    const handleDniBlur = async (e) => {
      Swal.fire({
        title: 'Buscando persona...',
        text: 'Por favor, espera un momento.',
        allowOutsideClick: false,
   
      });
      const dni = e.target.value.trim();
    if (validarDniNif(dni)) {
      console.log(`Buscando persona con DNI/NIE: ${dni}`);
      
      try {
        const token =  getTokenFromCookie();
        const res = await axios.get(`${API_URL}/people/${dni}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.ok && res.data.data) {
          setNuevaPersona({
            dni: res.data.data.dni,
            first_name: res.data.data.first_name,
            last_name1: res.data.data.last_name1,
            last_name2: res.data.data.last_name2,
            phone_number: res.data.data.phone_number
          });
        }
      } catch (err) {
     alert('No se pudo encontrar la persona con ese DNI/NIE. Puedes continuar y añadirla manualmente si es necesario.');
        console.error('Error al buscar persona por DNI/NIE:', err);
      }
    }
  };
    const handleMatriculaBlur = async (e) => {
    Swal.fire({
      title: 'Buscando vehículo...',
      text: 'Por favor, espera un momento.',
      allowOutsideClick: false,
   
    });
    const license_plate = e.target.value.trim();
    console.log(`Buscando vehículo con matrícula: ${license_plate}`);
    if (validarMatricula(license_plate)) {
      try {
        const token = getTokenFromCookie();
        const res = await axios.get(`${API_URL}/vehicles/${license_plate}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.ok && res.data.data) {
          console.log('Vehículo encontrado:', res.data.data);
          setNuevoVehiculo({
            license_plate: res.data.data.license_plate,
            brand: res.data.data.brand,
            model: res.data.data.model,
            color: res.data.data.color,
          });
        }
      } catch (err) {
        // No pasa nada si no existe
      }
    }
  };
const handleSubmit = async (e) => {
  e.preventDefault(); // prevent default form submission

  // Mensaje de confirmación
  const Swal = (await import('sweetalert2')).default;
  const result = await Swal.fire({
    title: '¿Deseas actualizar la incidencia?',
    text: 'Esta acción modificará la información actual.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, actualizar',
    cancelButtonText: 'Cancelar'
  });
  Navigate(`/incidencia`);

  if (!result.isConfirmed) return;

  // Validación de campos obligatorios
  const camposObligatorios = [
    { campo: 'type', label: 'Tipo de incidencia' },
    { campo: 'description', label: 'Descripción' },
    { campo: 'location', label: 'Coordenadas' },
  ];
  const campoFaltante = camposObligatorios.find(c => !form[c.campo] || form[c.campo].toString().trim() === '');
  if (campoFaltante) {
    Swal.fire({
      icon: 'warning',
      title: 'Falta un campo obligatorio',
      text: `Por favor, completa el campo: ${campoFaltante.label}`,
      confirmButtonText: 'Aceptar'
    });
    return;
  }

  // Validación de personas
  for (let i = 0; i < personas.length; i++) {
    const p = personas[i];
    if (!p.dni || !p.first_name || !p.last_name1 || !p.last_name2 || !p.phone_number) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos en una persona',
        text: `La persona ${i + 1} debe tener todos los campos completos.`,
        confirmButtonText: 'Aceptar'
      });
      return;
    }
  }

  // Validación de vehículos
  for (let i = 0; i < vehiculos.length; i++) {
    const v = vehiculos[i];
    if (!v.brand || !v.model || !v.color || !v.license_plate) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan datos en un vehículo',
        text: `El vehículo ${i + 1} debe tener todos los campos completos.`,
        confirmButtonText: 'Aceptar'
      });
      return;
    }
  }

  // Mostrar loading
  Swal.fire({
    title: 'Actualizando incidencia...',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  // Subida de images
  let uploadedImageUrls = [];
  for (const file of selectedImages) {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(INCIDENTS_IMAGES_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${getTokenFromCookie()}`
        }
      });
      if (res.data && res.data.file && res.data.file.url) {
        uploadedImageUrls.push(res.data.file.url);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
    }
  }

const formToSend = {
  status: form.status,
  location: form.location,
  type: form.type,
  description: form.description,
  brigade_field: form.brigade_field, 
  creator_user_code: form.creator_user_code,
  people: personas,
  vehicles: vehiculos,
  images: [...existingImages, ...uploadedImageUrls],
};

  try {
    const response = await updateIncident(code, formToSend);
    Swal.close();
    if (response.ok) {
      //! changed to a button to send the email
      if (form.brigade_field === true) {
  try {
    console.log('images to send:', [...existingImages, ...uploadedImageUrls]);
    await  //[...existingImages, ...selectedImages]); this line was modified to include existing images
    console.log('Correo enviado con éxito');
  } catch (error) {
    console.error('Error al enviar el correo:', error);
  }
}
      Swal.fire({
        icon: 'success',
        title: 'Incidencia actualizada',
        text: 'La incidencia se ha actualizado correctamente.',
        confirmButtonText: 'Aceptar'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: response.message || 'No se pudo actualizar la incidencia.',
        confirmButtonText: 'Aceptar'
      });
    }
  } catch (error) {
    Swal.close();
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || 'No se pudo actualizar la incidencia.',
      confirmButtonText: 'Aceptar'
    });
  }
};//pp


  const agregarPersona = () => {
    if (nuevaPersona.dni && nuevaPersona.first_name && nuevaPersona.last_name1) {
      setPersonas(prev => [...prev, nuevaPersona]);
      setNuevaPersona({
        dni: '',
        first_name: '',
        last_name1: '',
        last_name2: '',
        phone_number: ''
      });
    }
  };
  

  const agregarVehiculo = () => {
    if (nuevoVehiculo.brand && nuevoVehiculo.model && nuevoVehiculo.color && nuevoVehiculo.license_plate) {
      setVehiculos(prev => [...prev, nuevoVehiculo]);
      setNuevoVehiculo({ brand: '', model: '', color: '', license_plate: '' });
    }
  };

  const handleDeletePerson = (index) => {
    Swal.fire({
      title: 'Eliminar persona',
      text: '¿Deseas eliminar esta persona de la incidencia?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          eliminarPersona(index);
          Swal.fire('Eliminado', 'Persona eliminada', 'success');
        } catch (error) {
          console.error('Error al eliminar la persona:', error);
          Swal.fire('Error', 'No se pudo elimina la persona.', 'error');
        }
      }
    });
  };

 

  const eliminarPersona = (index) => {
    setPersonas(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteVehicle = (index) => {
    Swal.fire({
      title: 'Eliminar vehiculo',
      text: '¿Deseas eliminar este vehiculo de la incidencia?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          eliminarVehiculo(index);
          Swal.fire('Eliminado', 'Vehiculo eliminado', 'success');
        } catch (error) {
          console.error('Error al eliminar el vehiculo:', error);
          Swal.fire('Error', 'No se pudo elimina el vehiculo.', 'error');
        }
      }
    });
  };

  const eliminarVehiculo = (index) => {
    setVehiculos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex justify-center">
      <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] space-y-8 text-gray-800">

        {/* Titulo en escritorio o tablet */}
        <div className="hidden xl:block">
            <h2 className="text-2xl font-bold">Editar incidencia</h2>
            <hr className="border-t border-gray-300 my-4"/>
        </div>
        {/* Titulo en móviles */}
        <div className="block xl:hidden">
            <h2 className="text-2xl font-bold flex justify-center">Editar incidencia</h2>
            <hr className="border-t border-gray-300 my-4"/>
        </div>

          {/* Incidencia a editar */}
        <div className="flex justify-center items-center">
          <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] space-y-8">
                <AddTeammate incident_code={code} team_mate_code={localStorage.getItem('username')} creator_user_code={creator_code} team_mate={ teammate}/>

            <form onSubmit={handleSubmit} className="mx-auto p-4 bg-white rounded-md shadow-md space-y-6">
              {/* Datos de la incidencia */}
              <div>
                <h2 className="text-xl font-bold mb-2 text-center"> {code}</h2>
                <hr className="border-t border-gray-300 my-4" />
                
                <div className="mb-4">
                  <label className="block font-medium">Estado</label>
                  <select
                    name="status"
                    value={form.status}
                    disabled={form.status === 'Closed'} // Disable if already closed
                    onChange={handleStatusChange}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="Open">Abierta</option>
                    <option value="Closed">Cerrada</option>
                  </select>
                </div>
                
                
                
                <div className="mb-4">
                  <label className="block font-medium">Coordenadas</label>
                  <input
                  disabled
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-md bg-gray-100"
                    placeholder="Latitud, Longitud"
                  />
                  <Mapview chords={form.location} inc_code={code} />
                </div>

                {/* Contador de personas y vehículos */}
                <div className="flex justify-between mb-4">
                  <div className="bg-blue-100 text-blue-800 rounded-lg px-4 py-2 text-sm font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Personas: {personas.length}
                  </div>
                  
                  <div className="bg-green-100 text-green-800 rounded-lg px-4 py-2 text-sm font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6h12" />
                    </svg>
                    Vehículos: {vehiculos.length}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block font-medium">Tipo de incidencia</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className={`w-full mt-1 p-2 border rounded-md ${form.status === 'Closed' ? 'bg-gray-100 cursor-not-allowed' : ''} disabled:cursor-not-allowed`}
                  disabled={form.status === 'Closed' ? true : false}
                  >
                    <option value="">-- Selecciona un tipo --</option>
                    {tipos.map((tipo, idx) => (
                      <option key={idx} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block font-medium">Descripción</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full mt-1 p-2 border rounded-md"
                    placeholder=""
                  />
                </div>

                <div className="flex items-center mb-4 p-4 bg-gray-50 mx-auto">
                  <div className="flex justify-between items-center w-full">

                    <div className="flex items-center justify-center">
                      <input
                          type="checkbox"
                          name="brigade_field"
                          checked={form.brigade_field}
                          onChange={handleChange}
                          disabled
                          className="w-5 h-5 mr-2"
                        />
                        <label className="text-sm sm:text-base">Enviado a Brigada</label>
                    </div>

                    <button
                      type="button"
                      onClick={handleReSend}
                      className={`px-4 py-1 bg-[#002856] text-white rounded hover:bg-[#0092CA] active:bg-[#3AAFA9] ${form.status === 'Closed' ? 'cursor-not-allowed opacity-50' : ''}`}
                      disabled={form.status === 'Closed'}
                    >
                      Reenviar
                    </button>

                  </div>
                </div>
              </div>
              <hr className="border-t border-gray-300 my-4" />

              {/* Sección personas */}
              <div>
                <h2 className="text-xl font-bold mb-2">Personas ({personas.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 mb-3">
                  <input
                    type="text"
                    name="dni"
                    onBlur={handleDniBlur}
                    placeholder="DNI - NIE"
                    value={nuevaPersona.dni}
                    onChange={e => setNuevaPersona({ ...nuevaPersona, dni: e.target.value })}
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={nuevaPersona.first_name}
                    onChange={e => setNuevaPersona({ ...nuevaPersona, first_name: e.target.value })}
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="1º Apellido"
                    value={nuevaPersona.last_name1}
                    onChange={e => setNuevaPersona({ ...nuevaPersona, last_name1: e.target.value })}
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="2º Apellido"
                    value={nuevaPersona.last_name2}
                    onChange={e => setNuevaPersona({ ...nuevaPersona, last_name2: e.target.value })}
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Teléfono"
                    value={nuevaPersona.phone_number}
                    onChange={e => setNuevaPersona({ ...nuevaPersona, phone_number: e.target.value })}
                    className="p-2 border rounded"
                  />
                </div>
                <button
                  type="button"
                  onClick={agregarPersona}
                  className={`mt-2 px-4 py-1 bg-[#002856] text-white rounded hover:bg-[#0092CA] active:bg-[#3AAFA9] ${form.status === 'Closed' ? 'cursor-not-allowed opacity-50' : ''}`}
                  disabled={form.status === 'Closed' ? true : false}
                  >
                  Añadir persona
                </button>

                {personas.length > 0 && (
                  <ul className="list-disc list-inside text-sm">
                    {personas.map((p, i) => (
                      <li className="list-none" key={i}>
                        <div className="flex justify-between items-center bg-gray-100 p-3 rounded mt-4">
                          
                          {/* Los datos de la persona */}
                          <span className="flex flex-col flex-1 min-w-0">
                            <span className="truncate text-lg font-medium">{p.first_name} {p.last_name1} {p.last_name2}</span>
                            <span className="text-sm">{p.dni} - {p.phone_number}</span>
                          </span>
                          
                          {/* Boton para retirar la persona. Version escritorio o tablet */}
                          <button
                            type="button"
                            onClick={() => handleDeletePerson(i)}
                            className="block md:hidden ml-4 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            X
                          </button>
                          
                          {/* Boton para retirar la persona. Version movil */}
                          <button
                            type="button"
                            onClick={() => handleDeletePerson(i)}
                            className="hidden md:block ml-4 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Eliminar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <hr className="border-t border-gray-300 mt-2 mb-4" />

              {/* Sección vehículos */}
              <div>
                <h2 className="text-xl font-bold mb-2">Vehículos{/*({vehiculos.length})*/}</h2> 
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 mb-3">
                  <input
                    type="text"
                    placeholder="Matrícula"
                    onBlur={handleMatriculaBlur}
                    value={nuevoVehiculo.license_plate}
                    onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, license_plate: e.target.value })}
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Marca"
                    value={nuevoVehiculo.brand}
                    onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, brand: e.target.value })}
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Modelo"
                    value={nuevoVehiculo.model}
                    onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, model: e.target.value })}
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Color"
                    value={nuevoVehiculo.color}
                    onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, color: e.target.value })}
                    className="p-2 border rounded"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={agregarVehiculo}
                  className={`mt-2 px-4 py-1 bg-[#002856] text-white rounded hover:bg-[#0092CA] active:bg-[#3AAFA9] ${form.status === 'Closed' ? 'cursor-not-allowed opacity-50' : ''}`}
                  disabled={form.status === 'Closed' ? true : false}
                >
                  Añadir vehículo
                </button>

                {vehiculos.length > 0 && (
                  <ul className="list-disc list-inside text-sm">
                    {vehiculos.map((v, i) => (
                      <li className="list-none" key={i}>
                        <div className="flex justify-between items-center bg-gray-100 p-3 rounded mt-2">

                          {/* Datos de vehiculo añadido */}
                          <span className="flex flex-col flex-1 min-w-0">
                            <span className="truncate text-lg font-medium">{v.brand} {v.model}</span>
                            <span className="text-sm">{v.license_plate} - {v.color}</span>
                          </span>

                          {/* Boton para retirar vehiculo. Version escritorio o tablet */}
                          <button
                            type="button"
                            onClick={() => handleDeleteVehicle(i)} 
                            className="block md:hidden ml-4 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            X
                          </button>

                          {/* Boton para retirar vehiculo. Version movil */}
                          <button
                            type="button"
                            onClick={() => handleDeleteVehicle(i)} 
                            className="hidden md:block ml-4 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Eliminar
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <hr className="border-t border-gray-300 mt-2 mb-4" />
              {/* Sección de imágenes */}
              <div>
                <h2 className="text-xl font-bold mb-2">
                  Imágenes ({existingImages.length + selectedImages.length})
                </h2>
                
                {/* Mostrar imágenes existentes */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    
                    <div className="grid grid-cols-3 gap-4">
                      {existingImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={image} 
                            alt={`Imagen ${index + 1}`} 
                            className="w-full h-40 object-cover rounded-md border border-gray-300 cursor-pointer" 
                            onClick={() => openLightbox(image)}
                          />
                          <div className="absolute top-2 right-2">
                            <button
                              type="button"
                              onClick={() => {
                                setExistingImages(existingImages.filter((_, i) => i !== index));
                                console.log('Imagen eliminada:', image);
                                try{
                                  deleteImage(image)
                                }
                                catch(err){
                                  throw new Error(err)
                                }
                              }}
                              className="bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <XIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                
                <ImageUpload onImagesChange={handleImagesChange} />
              </div>
              <button
                type="submit"
                className={`w-full py-2 bg-[#002856] text-white rounded hover:bg-[#0092CA] active:bg-[#3AAFA9] ${form.status === 'Closed' ? 'cursor-not-allowed opacity-50' : ''}`}
                disabled={form.status === 'Closed' ? true : false}
              >
                Actualizar
              </button>
              
              {/* Lightbox para ver imágenes a tamaño completo */}
              {lightboxOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                  <div className="relative max-w-4xl max-h-[90vh] overflow-auto">
                    <img 
                      src={currentImage} 
                      alt="Imagen ampliada" 
                      className="max-w-full max-h-[80vh] object-contain"
                    />
                    <button
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2"
                      onClick={closeLightbox}
                    >
                      <XIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EditIncident;