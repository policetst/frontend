import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { postIncident, getLocation, getTokenFromCookie, sendIncidentViaEmail } from '../funcs/Incidents';
const INCIDENTS_URL = import.meta.env.VITE_INCIDENTS_URL || 'http://localhost:4000/incidents';
const INCIDENTS_IMAGES_URL = import.meta.env.VITE_IMAGES_URL || 'http://localhost:4000/upload';
import ImageUpload from './ImageUpload';
import axios from 'axios';
import { X as XIcon } from 'lucide-react';
import Mapview from './Map';

const FormularioIncidencia = () => {
  const user_code = localStorage.getItem('username');
  const [cookies] = useCookies(['user']);
  const [location, setLocation] = useState('');
  const [res, setRes] = useState(null);
  const [form, setForm] = useState({
    status: 'Open',
    location: '',
    type: '',
    description: '',
    brigade_field: false,
    creator_user_code: user_code || 'AR00001',
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
  const [nuevoVehiculo, setNuevoVehiculo] = useState({ brand: '', model: '', color: '', license_plate: '' });
  const [selectedImages, setSelectedImages] = useState([]);
  const navigate = useNavigate();

  // Set location on mount and when location changes
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

    for (let i = 0; i < vehiculos.length; i++) {
      const v = vehiculos[i];
      if (!v.brand || !v.model || !v.color || !v.license_plate) {
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

    let uploadedImageUrls = [];
    for (const file of selectedImages) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await axios.post(INCIDENTS_IMAGES_URL, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${cookies.user.token || getTokenFromCookie()}`,
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
      ...form,
      people: personas,
      vehicles: vehiculos,
      images: uploadedImageUrls,
    };

    try {
      const response = await postIncident(formToSend);
      if (response.ok) {
        if (form.brigade_field === true) {
          try {
            await sendIncidentViaEmail('unaicompaired@iesrioarba.es', form.description, form.location, uploadedImageUrls);
          } catch (error) {
            console.error('Error al enviar el correo:', error);
          }
        }
        const Swal = (await import('sweetalert2')).default;
        Swal.fire({
          icon: 'success',
          title: 'Incidencia creada',
          text: 'La incidencia se ha creado correctamente.',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          navigate('/incidencia');
        });
        setForm({
          status: 'Open',
          location: location,
          type: '',
          description: '',
          brigade_field: false,
          creator_user_code: user_code || 'AR00001',
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
    if (nuevoVehiculo.brand && nuevoVehiculo.model && nuevoVehiculo.color && nuevoVehiculo.license_plate) {
      setVehiculos(prev => [...prev, nuevoVehiculo]);
      setNuevoVehiculo({ brand: '', model: '', color: '', license_plate: '' });
    }
  };

  const eliminarPersona = (index) => {
    setPersonas(prev => prev.filter((_, i) => i !== index));
  };

  const eliminarVehiculo = (index) => {
    setVehiculos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] space-y-8">
      <form onSubmit={handleSubmit} className="mx-auto p-4 bg-white rounded-md shadow-md space-y-6">
        {/* Datos de registro */}
        <div>
          <div className="flex justify-center md:justify-end">
            {/* Fecha y hora */}
            <div className="flex items-center h-8">
              <p className="font-semibold mr-2">Fecha y hora:</p>
              <p>{new Date().toLocaleString(
                undefined, {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          <hr className="border-t border-gray-300 my-4" />

          <h3 className="text-xl font-bold mb-4">Datos esenciales</h3>
          <div className="mb-4">
            <label className="block font-medium">Coordenadas</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded"
              placeholder="Latitud, Longitud"
            />
            <Mapview chords={form.location} />
          </div>
          <div className="mb-4">
            <label className="block font-medium">Tipo de incidencia</label>
            <select
              name="type"
              value={form.type}
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
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full mt-1 p-2 border rounded"
              placeholder="Escribe una descripción detallada..."
            />
          </div>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              name="brigade_field"
              checked={form.brigade_field}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-md">Enviar a Brigada</label>
          </div>
        </div>
        <hr className="border-t border-gray-300 my-4" />

        {/* Sección personas */}
        <div>
          <h3 className="text-xl font-bold mb-2">Personas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 mb-2">
            <input
              type="text"
              name="dni"
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
            className="mb-2 mt-2 px-4 py-1 bg-[#002856] text-white rounded hover:bg-[#0092CA] active:bg-[#2374FF]"
          >
            Añadir persona
          </button>
          {personas.length > 0 && (
            <ul className="space-y-2 mt-2 text-sm">
              {personas.map((p, i) => (
                <li key={i}>
                  <div className="flex justify-between items-center bg-gray-100 p-3 rounded">
                    <span className="flex flex-col flex-1 min-w-0">
                      <span className="truncate text-lg font-medium">{p.first_name} {p.last_name1} {p.last_name2}</span>
                      <span className="text-sm">{p.dni} - {p.phone_number}</span>
                    </span>
                    <button
                      onClick={() => eliminarPersona(i)}
                      className="block md:hidden ml-4 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      X
                    </button>
                    <button
                      onClick={() => eliminarPersona(i)}
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

        {/* Sección vehículos */}
        <div>
          <h2 className="text-xl font-bold mb-2">Vehículos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 mb-2">
            <input
              type="text"
              placeholder="Matrícula"
              value={nuevoVehiculo.license_plate}
              onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, license_plate: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="brand"
              value={nuevoVehiculo.brand}
              onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, brand: e.target.value })}
              className="p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Model"
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
            className="mb-2 mt-2 px-4 py-1 bg-[#002856] text-white rounded hover:bg-[#0092CA] active:bg-[#2374FF]"
          >
            Añadir vehículo
          </button>
          {vehiculos.length > 0 && (
            <ul className="space-y-2 mt-2 text-sm">
              {vehiculos.map((v, i) => (
                <li key={i}>
                  <div className="flex justify-between items-center bg-gray-100 p-3 rounded">
                    <span className="flex flex-col flex-1 min-w-0">
                      <span className="truncate text-lg font-medium">{v.brand} {v.model}</span>
                      <span className="text-sm">{v.license_plate} - {v.color}</span>
                    </span>
                    <button
                      onClick={() => eliminarVehiculo(i)}
                      className="block md:hidden ml-4 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      X
                    </button>
                    <button
                      onClick={() => eliminarVehiculo(i)}
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

        {/* Sección de imágenes */}
        <div>
          <h2 className="text-xl font-bold mb-2">Subir imágenes</h2>
          <ImageUpload onImagesChange={handleImagesChange} />
        </div>
        <button
          type="submit"
          className="mb-2 mt-2 px-4 py-1 w-full bg-[#002856] text-white rounded hover:bg-[#0092CA] active:bg-[#2374FF]"
        >
          Crear incidencia
        </button>
      </form>
    </div>
  );
};

export default FormularioIncidencia;
