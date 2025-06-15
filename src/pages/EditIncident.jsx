import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getIncident,
  updateIncident,
  sendIncidentViaEmail,
  deleteImage,
  closeIncident,
  getTokenFromCookie,
  validarDniNif,
  validarMatricula
} from '../funcs/Incidents';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import Swal from 'sweetalert2';
import { X as XIcon } from 'lucide-react';
import Mapview from '../components/Map';
import ImageUpload from '../components/ImageUpload';
import AddTeammate from '../components/AddTeammate';

const INCIDENTS_IMAGES_URL = import.meta.env.VITE_IMAGES_URL;
const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api';

const EditIncident = () => {
  document.title = "SIL Tauste - Editar Incidencia";
  const USER_CODE = localStorage.getItem('username') || 'AR00001';
  const { code } = useParams();
  const navigate = useNavigate();
  const [cookies] = useCookies(['user']);

  const [mostrarFormularioPersona, setMostrarFormularioPersona] = useState(false);
  const [mostrarFormularioVehiculo, setMostrarFormularioVehiculo] = useState(false);

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
  const [form, setForm] = useState({
    status: 'Open',
    location: '',
    type: '',
    description: '',
    brigade_field: false,
    creator_user_code: USER_CODE,
  });
  const [personas, setPersonas] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [teammate, setTeammate] = useState('');
  const [creator_code, setCreatorCode] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // Lightbox imágenes
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [allImages, setAllImages] = useState([]);
  useEffect(() => {
    setAllImages([...existingImages, ...selectedImages]);
  }, [existingImages, selectedImages]);

  // Datos incidencia iniciales
  useEffect(() => {
    const fetchIncidentData = async () => {
      setLoading(true);
      try {
        const data = await getIncident(code);
        if (!data || data.ok === false) {
          setLoading(false);
          return;
        }
        setTeammate(data.team_mate);
        setCreatorCode(data.creator_user_code);
        setForm({
          status: data.status || 'Open',
          location: data.location || '',
          type: data.type || '',
          description: data.description || '',
          brigade_field: !!data.brigade_field,
          creator_user_code: USER_CODE,
        });
        setPersonas(Array.isArray(data.people) ? data.people : []);
        setVehiculos(Array.isArray(data.vehicles) ? data.vehicles : []);
        setExistingImages(
          Array.isArray(data.images)
            ? data.images.map(img => img.url || img)
            : []
        );
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    if (code) fetchIncidentData();
  }, [code]);

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

  // Estados para nueva persona y vehículo
  const [nuevaPersona, setNuevaPersona] = useState({
    dni: '',
    first_name: '',
    last_name1: '',
    last_name2: '',
    phone_number: ''
  });
  const [nuevoVehiculo, setNuevoVehiculo] = useState({
    brand: '',
    model: '',
    color: '',
    license_plate: ''
  });

  // --- AUTOCOMPLETADO POR BLUR ---
const handleDniBlur = async (e) => {
  const dni = e.target.value.trim();
  if (validarDniNif(dni)) {
    try {
      const token = cookies.user?.token || getTokenFromCookie();
      const res = await axios.get(`${API_URL}/people/${dni}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.ok && res.data.data) {
        // Comprobar si ya está en la lista
        if (!personas.some(p => p.dni === dni)) {
          setPersonas(prev => [
            ...prev,
            {
              dni: res.data.data.dni,
              first_name: res.data.data.first_name,
              last_name1: res.data.data.last_name1,
              last_name2: res.data.data.last_name2,
              phone_number: res.data.data.phone_number
            }
          ]);
          Swal.fire({
            icon: 'warning',
            title: 'Persona encontrada',
            text: `Se ha añadido automáticamente a la incidencia.`,
            confirmButtonText: 'Aceptar'
          });
        }
        // Limpia el formulario
        setNuevaPersona({
          dni: '',
          first_name: '',
          last_name1: '',
          last_name2: '',
          phone_number: ''
        });
      }
    } catch (err) {
      // No hace nada, usuario puede completar y pulsar "Añadir persona"
    }
  }
};


const handleMatriculaBlur = async (e) => {
  const license_plate = e.target.value.trim();
  if (validarMatricula(license_plate)) {
    try {
      const token = cookies.user?.token || getTokenFromCookie();
      const res = await axios.get(`${API_URL}/vehicles/${license_plate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.ok && res.data.data) {
        // Comprobar si ya está en la lista
        if (!vehiculos.some(v => v.license_plate === license_plate)) {
          setVehiculos(prev => [
            ...prev,
            {
              license_plate: res.data.data.license_plate,
              brand: res.data.data.brand,
              model: res.data.data.model,
              color: res.data.data.color,
            }
          ]);
          Swal.fire({
            icon: 'warning',
            title: 'Vehículo encontrado',
            text: `Se ha añadido automáticamente a la incidencia.`,
            confirmButtonText: 'Aceptar'
          });
        }
        // Limpia el formulario
        setNuevoVehiculo({
          license_plate: '',
          brand: '',
          model: '',
          color: ''
        });
      }
    } catch (err) {
      // No hace nada, usuario puede completar y pulsar "Añadir vehículo"
    }
  }
};


  // --- AÑADIR PERSONA ---
  const agregarPersona = async () => {
    if (!nuevaPersona.dni || !validarDniNif(nuevaPersona.dni)) {
      Swal.fire({
        icon: 'warning',
        title: 'DNI/NIE inválido',
        text: 'Introduce un DNI o NIE válido para la persona.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    if (!nuevaPersona.first_name || !nuevaPersona.last_name1 || !nuevaPersona.last_name2 || !nuevaPersona.phone_number) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan campos',
        text: 'Completa todos los datos de la persona.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    if (personas.some(p => p.dni === nuevaPersona.dni)) {
      Swal.fire({
        icon: 'info',
        title: 'Ya añadida',
        text: 'Esta persona ya está en la incidencia.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    setPersonas(prev => [...prev, nuevaPersona]);
    setNuevaPersona({
      dni: '',
      first_name: '',
      last_name1: '',
      last_name2: '',
      phone_number: ''
    });
  };

  // --- AÑADIR VEHÍCULO ---
  const agregarVehiculo = async () => {
    if (!nuevoVehiculo.license_plate || !validarMatricula(nuevoVehiculo.license_plate)) {
      Swal.fire({
        icon: 'warning',
        title: 'Matrícula inválida',
        text: 'Introduce una matrícula válida.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    if (!nuevoVehiculo.brand || !nuevoVehiculo.model || !nuevoVehiculo.color) {
      Swal.fire({
        icon: 'warning',
        title: 'Faltan campos',
        text: 'Completa todos los datos del vehículo.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    if (vehiculos.some(v => v.license_plate === nuevoVehiculo.license_plate)) {
      Swal.fire({
        icon: 'info',
        title: 'Ya añadido',
        text: 'Este vehículo ya está en la incidencia.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    setVehiculos(prev => [...prev, nuevoVehiculo]);
    setNuevoVehiculo({ brand: '', model: '', color: '', license_plate: '' });
  };

  // --- ELIMINAR PERSONA/VEHÍCULO ---
  const eliminarPersona = (index) => setPersonas(prev => prev.filter((_, i) => i !== index));
  const eliminarVehiculo = (index) => setVehiculos(prev => prev.filter((_, i) => i !== index));
  const handleDeletePerson = (index) => {
    Swal.fire({
      title: 'Eliminar persona',
      text: '¿Deseas eliminar esta persona de la incidencia?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) eliminarPersona(index);
    });
  };
  const handleDeleteVehicle = (index) => {
    Swal.fire({
      title: 'Eliminar vehículo',
      text: '¿Deseas eliminar este vehículo de la incidencia?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) eliminarVehiculo(index);
    });
  };

  // --- SUBIDA IMÁGENES ---
  const handleImagesChange = (files) => {
    setSelectedImages(files);
  };

  // --- LIGHTBOX ---
  const openLightbox = (imageUrl) => {
    setCurrentImage(imageUrl);
    setLightboxOpen(true);
  };
  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentImage('');
  };

  // --- ESTADO, RESEND y SUBMIT ---
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
          await sendIncidentViaEmail(form.description, form.location, allImages);
          Swal.fire('Reenviado', 'La incidencia ha sido reenviada a la brigada.', 'success');
        } catch (error) {
          Swal.fire('Error', 'No se pudo reenviar la incidencia a la brigada.', 'error');
        }
      }
    });
  };

  // --- SUBMIT (ACTUALIZAR) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: '¿Deseas actualizar la incidencia?',
      text: 'Esta acción modificará la información actual.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar'
    });
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
    // Validación personas y vehículos
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

    Swal.fire({
      title: 'Actualizando incidencia...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading()
    });

    // Subida de imágenes nuevas
    let uploadedImageUrls = [];
    for (const file of selectedImages) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await axios.post(INCIDENTS_IMAGES_URL, formData, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${getTokenFromCookie()}` }
        });
        if (res.data && res.data.file && res.data.file.url) {
          uploadedImageUrls.push(res.data.file.url);
        }
      } catch (err) {}
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
        Swal.fire({
          icon: 'success',
          title: 'Incidencia actualizada',
          text: 'La incidencia se ha actualizado correctamente.',
          confirmButtonText: 'Aceptar'
        }).then(() => navigate('/incidencia'));
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
  };

  return (
    <div className="flex justify-center">
      <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] space-y-8 text-gray-800">
        {/* Encabezados */}
        <div className="hidden xl:block">
          <h2 className="text-2xl font-bold">Editar incidencia</h2>
          <hr className="border-t border-gray-300 my-4"/>
        </div>
        <div className="block xl:hidden">
          <h2 className="text-2xl font-bold flex justify-center">Editar incidencia</h2>
          <hr className="border-t border-gray-300 my-4"/>
        </div>
        {/* Formulario principal */}
        <div className="flex justify-center items-center">
          <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] space-y-8">
            
            <form onSubmit={handleSubmit} className="mx-auto p-4 bg-white rounded-md shadow-md space-y-6">
              <div>
                <div>
                  <h2 className="text-xl font-bold mb-2 text-center">{code}</h2>
                  <div className='text-center'>
                    <AddTeammate 
                      incident_code={code} 
                      team_mate_code={USER_CODE} 
                      creator_user_code={creator_code} 
                      team_mate={teammate}
                    />
                  </div>
                </div>
                <hr className="border-t border-gray-300 my-4" />
                <div className="mb-4">
                  <label className="block font-medium">Estado</label>
                  <select
                    name="status"
                    value={form.status}
                    disabled={form.status === 'Closed'}
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
                    onChange={() => {}}
                    className="w-full mt-1 p-2 border rounded-md bg-gray-100"
                    placeholder="Latitud, Longitud"
                  />
                  <Mapview chords={form.location} inc_code={code} />
                </div>
                {/* Contadores */}
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
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    className={`w-full mt-1 p-2 border rounded-md ${form.status === 'Closed' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    disabled={form.status === 'Closed'}
                  >
                    <option value="">-- Selecciona un tipo --</option>
                    {tipos.map((tipo, idx) => (
                      <option key={idx} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block font-medium">Descripción</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    className="w-full mt-1 p-2 border rounded-md"
                  />
                </div>
                <div className="flex items-center mb-4 p-4 bg-gray-50 mx-auto">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        name="brigade_field"
                        checked={form.brigade_field}
                        onChange={() => {}}
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
                <h3 className="text-xl font-bold mb-2">Personas</h3>
                
                <button
                  type="button"
                  onClick={() => setMostrarFormularioPersona(prev => !prev)}
                  className={`px-3 py-1 rounded text-white 
                    ${mostrarFormularioPersona 
                      ? 'bg-gray-400 hover:bg-gray-700' 
                      : 'bg-[#002856] hover:bg-cyan-600'}
                  `}
                >
                  {mostrarFormularioPersona ? 'Ocultar' : 'Nueva persona'}
                </button>

              </div>
              <div className="mt-4">
                {mostrarFormularioPersona && (
                  <div>
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
                        type="number"
                        placeholder="643 321 177 4"
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
                </div>
                )}
              </div>
              
              <div>
                {personas.length > 0 && (
                  <ul className="list-disc list-inside text-sm">
                    {personas.map((p, i) => (
                      <li className="list-none" key={i}>
                        <div className="flex justify-between items-center bg-gray-100 p-3 rounded mt-4">
                          <span className="flex flex-col flex-1 min-w-0">
                            <span className="truncate text-lg font-medium">{p.first_name} {p.last_name1} {p.last_name2}</span>
                            <span className="text-sm"><Link to={`/editarpersona/${p.dni}`} className="text-blue-600 hover:text-blue-700">{p.dni}</Link> - {p.phone_number}</span>
                          </span>
                          
                          {/* Boton para retirar la persona. Version movil */}
                          <button
                            type="button"
                            onClick={() => handleDeletePerson(i)}
                            className="block md:hidden ml-4 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            X
                          </button>
                          
                          {/* Boton para retirar la persona. Version escritorio o tablet */}
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
                <button
                  type="button"
                  onClick={() => setMostrarFormularioVehiculo(prev => !prev)}
                  className={`px-3 py-1 rounded text-white 
                    ${mostrarFormularioVehiculo 
                      ? 'bg-gray-400 hover:bg-gray-700' 
                      : 'bg-[#002856] hover:bg-cyan-600'}
                  `}
                >
                  {mostrarFormularioVehiculo ? 'Ocultar' : 'Nuevo vehículo'}
                </button>
              </div>
                
              <div className="mt-4">
                {mostrarFormularioVehiculo && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 mb-3">
                    <input
                      type="text"
                      placeholder="4704JBN"
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
                </div>
                )}
              </div>

              <div>
                {vehiculos.length > 0 && (
                  <ul className="list-disc list-inside text-sm">
                    {vehiculos.map((v, i) => (
                      <li className="list-none" key={i}>
                        <div className="flex justify-between items-center bg-gray-100 p-3 rounded mt-2">
                          <span className="flex flex-col flex-1 min-w-0">
                            <span className="truncate text-lg font-medium">{v.brand} {v.model}</span>
                            <span className="text-sm"><Link to={`/editarvehiculo/${v.license_plate}`} className="text-blue-600 hover:text-blue-700">{v.license_plate}</Link> - {v.color}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteVehicle(i)}
                            className="ml-4 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
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
                                try { deleteImage(image); } catch (err) {}
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
                <ImageUpload onImagesChange={handleImagesChange} disabled={form.status} />
              </div>
              <button
                type="submit"
                className={`w-full py-2 bg-[#002856] text-white rounded hover:bg-[#0092CA] active:bg-[#3AAFA9] ${form.status === 'Closed' ? 'cursor-not-allowed opacity-50' : ''}`}
                disabled={form.status === 'Closed'}
              >
                Actualizar
              </button>
              {/* Lightbox imágenes */}
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
