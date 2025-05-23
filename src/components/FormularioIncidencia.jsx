import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload'

const FormularioIncidencia = () => {
  console.log('FormularioIncidencia');
  
  const [location, setLocation] = useState('');
  const  [res, setRes] = useState(null);
  const [form, setForm] = useState({
    status: 'Open',
    location: '',
    type: '',
    description: '',
    brigade_field: false,
    creator_user_code: 'AR00001',
  });
  const [personas, setPersonas] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [nuevaPersona, setNuevaPersona] = useState({
    dni: '',
    first_name: '',
    last_name1: '',
    last_name2: '',
    phone_number: ''
  });
  const [nuevoVehiculo, setNuevoVehiculo] = useState({ marca: '', modelo: '', color: '', matricula: '' });
  const [selectedImages, setSelectedImages] = useState([]);
//useefect to put the location in the form
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      location: location
    }));
  }, [location]);

  useEffect(() => {
    getLocation()
      .then((loc) => {
        const locString = `${loc.latitude},${loc.longitude}`;
        setLocation(locString);
      })
      .catch((error) => {
        console.error("Failed to get location:", error);
      });
  }, []);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImagesChange = (files) => {
    setSelectedImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // * validation of the required fields
    const camposObligatorios = [
      { campo: 'type', label: 'Tipo de incidencia' },
      { campo: 'description', label: 'Descripción' },
      { campo: 'location', label: 'Coordenadas' },
    ];
    const campoFaltante = camposObligatorios.find(c => !form[c.campo] || form[c.campo].toString().trim() === '');
    if (campoFaltante) {
      const Swal = (await import('sweetalert2')).default;
      Swal.fire({
        icon: 'warning',
        title: 'Falta un campo obligatorio',
        text: `Por favor, completa el campo: ${campoFaltante.label}`,
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    // Validación de campos obligatorios en personas
    for (let i = 0; i < personas.length; i++) {
      const p = personas[i];
      if (!p.dni || !p.first_name || !p.last_name1 || !p.last_name2 || !p.phone_number) {
        const Swal = (await import('sweetalert2')).default;
        Swal.fire({
          icon: 'warning',
          title: 'Faltan datos en una persona',
          text: `La persona ${i + 1} debe tener todos los campos completos.`,
          confirmButtonText: 'Aceptar'
        });
        return;
      }
    }

    // Validación de campos obligatorios en vehículos
    for (let i = 0; i < vehiculos.length; i++) {
      const v = vehiculos[i];
      if (!v.marca || !v.modelo || !v.color || !v.matricula) {
        const Swal = (await import('sweetalert2')).default;
        Swal.fire({
          icon: 'warning',
          title: 'Faltan datos en un vehículo',
          text: `El vehículo ${i + 1} debe tener todos los campos completos.`,
          confirmButtonText: 'Aceptar'
        });
        return;
      }
    }

    // * upload images to /uploads
    let uploadedImageUrls = [];
    for (const file of selectedImages) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await axios.post(INCIDENTS_IMAGES_URL, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data && res.data.file && res.data.file.url) {
          uploadedImageUrls.push(res.data.file.url);
        }
      } catch (err) {
        console.error('Error uploading image:', err);
      }
    }

    // * add images to the existing form
    const formToSend = {
      ...form,
      people: personas,
      vehicles: vehiculos,
      images: uploadedImageUrls,
    };

    try {
      const response = await postIncident(formToSend);
      if (response.ok) {
        // * show success message
        const Swal = (await import('sweetalert2')).default;
        Swal.fire({
          icon: 'success',
          title: 'Incidencia creada',
          text: 'La incidencia se ha creado correctamente.',
          confirmButtonText: 'Aceptar'
        });
        setForm({
          status: 'Open',
          location: location,
          type: '',
          description: '',
          brigade_field: false,
          creator_user_code: 'AR00001',
        });
        setPersonas([]);
        setVehiculos([]);
        setSelectedImages([]);
      } else {
        const Swal = (await import('sweetalert2')).default;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'No se pudo registrar la incidencia.',
          confirmButtonText: 'Aceptar'
        });
      }
    } catch (error) {
      const Swal = (await import('sweetalert2')).default;
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo registrar la incidencia.',
        confirmButtonText: 'Aceptar'
      });
    }
  };

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
    if (nuevoVehiculo.marca && nuevoVehiculo.modelo && nuevoVehiculo.color && nuevoVehiculo.matricula) {
      setVehiculos(prev => [...prev, nuevoVehiculo]);
      setNuevoVehiculo({ marca: '', modelo: '', color: '', matricula: '' });
    }
  };
  const eliminarPersona = (index) => {
    setPersonas(prev => prev.filter((_, i) => i !== index));
  };

  const eliminarVehiculo = (index) => {
    setVehiculos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] p-6 space-y-8">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
        {/* Datos de registro */}
        <div>
          <div className="flex justify-between">

            {/* Fecha y hora */}
            <div className="flex flex-col justify-start items-start h-10 mb-10">
              <p className="font-semibold">Fecha y hora:</p>
              <p>{new Date().toLocaleString()}</p>
            </div>
            
            {/* Agente 2 */}
            <div>
              <p className="font-semibold">Acompañante:</p>
              <input 
                type="text"
                name="compa"
                placeholder="AR12345"
                className="w-23 pl-1 border rounded"
              />
            </div>
          </div>

          <h3 className="text-xl font-bold mb-2">Datos esenciales</h3>

          <div className="mb-4">
            <label className="block font-medium">Ubicacion</label>
            <input
              type="text"
              name="coordenadas"
              value={form.coordenadas}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded"
              placeholder="Latitud, Longitud"
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium">Tipo de incidencia</label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded"
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
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={4}
              className="w-full mt-1 p-2 border rounded"
              placeholder="Escribe una descripción detallada..."
            />
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              name="contactoBrigada"
              checked={form.contactoBrigada}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-md">Envío a brigada</label>
          </div>
        </div>
        <hr className="border-t border-gray-300 my-4" />


        {/* Agregar una persona */}
        <div>
          <h3 className="text-xl font-bold mb-2">Personas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 mb-2">
            <input
              type="text"
              placeholder="DNI"
              value={nuevaPersona.dni}
              onChange={(e) => setNuevaPersona({ ...nuevaPersona, dni: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Nombre"
              value={nuevaPersona.nombre}
              onChange={(e) => setNuevaPersona({ ...nuevaPersona, nombre: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Apellidos"
              value={nuevaPersona.apellidos}
              onChange={(e) => setNuevaPersona({ ...nuevaPersona, apellidos: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Contacto"
              value={nuevaPersona.contacto || ''}
              onChange={(e) => setNuevaPersona({ ...nuevaPersona, contacto: e.target.value })}
              className="p-2 border rounded"
            />
          </div>
          <button
            type="button"
            onClick={agregarPersona}
            className="mb-2 mt-2 px-4 py-1 bg-[#002856] text-white rounded hover:bg-[#0092CA] active:bg-[#2374FF]"
          >
            Añadir persona
          </button>

          {/* Muestra las personas añadiddas */}
          {form.personas.length > 0 && (
            <ul className="space-y-2 mt-2 text-sm">
              {form.personas.map((p, i) => (
                <li key={i}>
                  <div className="flex justify-between items-center bg-gray-100 p-3 rounded">
                    
                    {/* Los datos de la persona */}
                    <span className="flex flex-col flex-1 min-w-0">
                      <span className="truncate text-lg font-medium">{p.nombre} {p.apellidos}</span>
                      <span className="text-sm">{p.dni} - {p.contacto}</span>
                    </span>
                    
                    {/* Boton para retirar la persona. Version escritorio o tablet */}
                    <button
                      onClick={() => {
                        const nuevasPersonas = form.personas.filter((_, idx) => idx !== i);
                        setForm({ ...form, personas: nuevasPersonas });
                      }}
                      className="block md:hidden ml-4 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      X
                    </button>
                    
                    {/* Boton para retirar la persona. Version movil */}
                    <button
                      onClick={() => {
                        const nuevasPersonas = form.personas.filter((_, idx) => idx !== i);
                        setForm({ ...form, personas: nuevasPersonas });
                      }}
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
        <hr className="border-t border-gray-300 my-4" />

        {/* Agregar un vehiculo */}
        <div>
          <h3 className="text-xl font-bold mb-2">Vehículos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 mb-2">
                  <input
              type="text"
              placeholder="Matrícula"
              value={nuevoVehiculo.matricula}
              onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, matricula: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Marca"
              value={nuevoVehiculo.marca}
              onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, marca: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Modelo"
              value={nuevoVehiculo.modelo}
              onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, modelo: e.target.value })}
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
            className="mb-2 mt-2 px-4 py-1 bg-[#002856] text-white rounded hover:bg-[#0092CA] active:bg-[#2374FF]"
          >
            Añadir vehículo
          </button>
          
          {/* Muestra los vehiculos añadidos */}
          {form.vehiculos.length > 0 && (
            <ul className="space-y-2 mt-2 text-sm">
              {form.vehiculos.map((v, i) => (
                <li key={i}>
                  <div className="flex justify-between items-center bg-gray-100 p-3 rounded">

                    {/* Datos de vehiculo añadido */}
                    <span className="flex flex-col flex-1 min-w-0">
                      <span className="truncate text-lg font-medium">{v.marca} {v.modelo}</span>
                      <span className="text-sm">{v.matricula} - {v.color}</span>
                    </span>

                    {/* Boton para retirar vehiculo. Version escritorio o tablet */}
                    <button
                      onClick={() => {
                        const nuevoVehiculo = form.vehiculos.filter((_, idx) => idx !== i);
                        setForm({ ...form, vehiculos: nuevoVehiculo });
                      }}
                      className="block md:hidden ml-4 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      X
                    </button>

                    {/* Boton para retirar vehiculo. Version movil */}
                    <button
                      onClick={() => {
                        const nuevoVehiculo = form.vehiculos.filter((_, idx) => idx !== i);
                        setForm({ ...form, vehiculos: nuevoVehiculo });
                      }}
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
        <hr className="border-t border-gray-300 my-4" />


        {/* Subir una imagen */}
        <div>
          <h3 className="text-xl font-bold mb-2">Subir imagenes</h3>
          <ImageUpload/>
        </div>

        <button
          type="submit"
          className="w-full bg-[#002856] text-white rounded hover:bg-[#0092CA] active:bg-[#2374FF]"
        >
          Crear incidencia
        </button>
      </form>
    </div>
  );
};
export default FormularioIncidencia;