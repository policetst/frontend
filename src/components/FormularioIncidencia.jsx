import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { postIncident, getLocation, getTokenFromCookie, sendIncidentViaEmail, capitalize } from '../funcs/Incidents';
import { validarDniNif, validarMatricula } from '../funcs/Incidents';
const INCIDENTS_URL = import.meta.env.VITE_INCIDENTS_URL;
const INCIDENTS_IMAGES_URL = import.meta.env.VITE_IMAGES_URL;
const API_URL = import.meta.env.VITE_BASE_URL;
import ImageUpload from './ImageUpload';
import axios from 'axios';
import { X as XIcon } from 'lucide-react';
import Mapview from './Map';
import Swal from 'sweetalert2';

const FormularioIncidencia = () => {
  const user_code = localStorage.getItem('username');
  const [cookies] = useCookies(['user']);
  const [location, setLocation] = useState('');
  const [form, setForm] = useState({
    status: 'Open',
    location: '',
    type: '',
    description: '',
    brigade_field: false,
    creator_user_code: user_code,
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
  const [nuevoVehiculo, setNuevoVehiculo] = useState({
    brand: '', model: '', color: '', license_plate: ''
  });
  const navigate = useNavigate();
  const [selectedImages, setSelectedImages] = useState([]);

  const [mostrarFormularioPersona, setMostrarFormularioPersona] = useState(false);
  const [mostrarFormularioVehiculo, setMostrarFormularioVehiculo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      location: location
    }));
  }, [location]);

  const tipos = [
    'Animales',
    'Seguridad Ciudadana',
    'Trafico',
    'Ruidos',
    'Asistencia Colaboración Ciudadana',
    'Ilícito penal',
    'Incidencias Urbanísticas',
    'Juzgados',
    'Otras incidencias no clasificadas',
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'location') {
      setLocation(value);
      setForm(prev => ({ ...prev, location: value }));
    } else if (name === 'brigade_field') {
      setForm(prev => ({ ...prev, brigade_field: checked }));
    } else if (["dni", "first_name", "last_name1", "last_name2", "phone_number"].includes(name)) {
      setNuevaPersona(prev => ({ ...prev, [name]: value }));
    } else {
      setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleImagesChange = (files) => {
    setSelectedImages(files);
  };

  // -------- LOGICA DE GESTION DE PERSONAS Y VEHICULOS --------

  const handleDniBlur = async (e) => {
    const dni = e.target.value.trim().toUpperCase();
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
            setNuevaPersona({
              dni: '',
              first_name: '',
              last_name1: '',
              last_name2: '',
              phone_number: ''
            });
          }
        }
      } catch (err) {
        // No hace nada, usuario puede completar y pulsar "Agregar persona"
      }
    }
  };

  const handleMatriculaBlur = async (e) => {
    const license_plate = e.target.value.trim().toUpperCase();
    if (validarMatricula(license_plate)) {
      try {
        const token = cookies.user?.token || getTokenFromCookie();
        const res = await axios.get(`${API_URL}/vehicles/${license_plate}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.ok && res.data.data) {
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
            setNuevoVehiculo({
              license_plate: '',
              brand: '',
              model: '',
              color: ''
            });
          }
        }
      } catch (err) {
        // No hace nada
      }
    }
  };

  const agregarPersona = async () => {
    const dniInput = nuevaPersona.dni.trim().toUpperCase();
    nuevaPersona.first_name = capitalize(nuevaPersona.first_name.trim());
    nuevaPersona.last_name1 = capitalize(nuevaPersona.last_name1.trim());
    nuevaPersona.last_name2 = capitalize(nuevaPersona.last_name2.trim());
    if (!dniInput || !validarDniNif(dniInput)) {
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
      setIsSubmitting(true);
    }
    
    const phoneRegex = /^(\+34|0034)?[\s\-]?([6|7|8|9]{1}[0-9]{2})[\s\-]?[0-9]{3}[\s\-]?[0-9]{3}$/;
    if (!phoneRegex.test(nuevaPersona.phone_number)) {
      Swal.fire({
        icon: 'warning',
        title: 'Teléfono inválido',
        text: 'Introduce un número de teléfono válido.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    if (personas.some(p => p.dni === dniInput)) {
      Swal.fire({
        icon: 'info',
        title: 'Persona encontrada',
        text: 'Esta persona ya está en la incidencia.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    setPersonas(prev => [...prev, { ...nuevaPersona, dni: dniInput }]);
    setNuevaPersona({
      dni: '',
      first_name: '',
      last_name1: '',
      last_name2: '',
      phone_number: ''
    });
  };

  const agregarVehiculo = async () => {
    const license_plate = nuevoVehiculo.license_plate.trim().toUpperCase();
    nuevoVehiculo.brand = capitalize(nuevoVehiculo.brand.trim());
    nuevoVehiculo.model = capitalize(nuevoVehiculo.model.trim());
    nuevoVehiculo.color = capitalize(nuevoVehiculo.color.trim());
    if (!license_plate || !validarMatricula(license_plate)) {
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
        title: 'Faltan campos obligatorios',
        text: 'Completa todos los datos del vehículo.',
        confirmButtonText: 'Aceptar'
      });
      setIsSubmitting(true);
    }
    if (vehiculos.some(v => v.license_plate === license_plate)) {
      Swal.fire({
        icon: 'info',
        title: 'Vehículo encontrado',
        text: 'Este vehículo ya está en la incidencia.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    setVehiculos(prev => [...prev, { ...nuevoVehiculo, license_plate }]);
    setNuevoVehiculo({ brand: '', model: '', color: '', license_plate: '' });
  };

  const eliminarPersona = (index) => {
    setPersonas(prev => prev.filter((_, i) => i !== index));
  };

  const eliminarVehiculo = (index) => {
    setVehiculos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    if (isSubmitting) return;
    e.preventDefault();
    setIsSubmitting(true);

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
      setIsSubmitting(true);
    }

    // Validación personas
    for (let i = 0; i < personas.length; i++) {
      const p = personas[i];
      if (!p.dni || !p.first_name || !p.last_name1 || !p.last_name2 || !p.phone_number || !validarDniNif(p.dni)) {
        Swal.fire({
          icon: 'warning',
          title: 'Faltan o son inválidos los datos de una persona',
          text: `Revisa la persona ${i + 1}`,
          confirmButtonText: 'Aceptar'
        });
        return;
      }
    }
    // Validación vehículos
    for (let i = 0; i < vehiculos.length; i++) {
      const v = vehiculos[i];
      if (!v.brand || !v.model || !v.color || !v.license_plate || !validarMatricula(v.license_plate)) {
        Swal.fire({
          icon: 'warning',
          title: 'Faltan o son inválidos los datos de un vehículo',
          text: `Revisa el vehículo ${i + 1}`,
          confirmButtonText: 'Aceptar'
        });
        return;
      }
    }

    // Subir imágenes
    let uploadedImageUrls = [];
    for (const file of selectedImages) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await axios.post(INCIDENTS_IMAGES_URL, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${cookies.user?.token || getTokenFromCookie()}`,
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
      console.log("Enviando incidencia...");
      const response = await postIncident(formToSend);
      if (response.ok) {
        console.log("Incidencia creada correctamente");
        if (form.brigade_field === true) {
          try {
            await sendIncidentViaEmail(form.description, form.location, uploadedImageUrls);
          } catch (error) {
            console.error('Error al enviar el correo:', error);
          }
        }
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
      } 
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo registrar la incidencia.',
        confirmButtonText: 'Aceptar'
      });
      return;
    } finally {
      console.log("Envío finalizado");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] space-y-8">
      <form onSubmit={handleSubmit} className="mx-auto p-4 bg-white rounded-md shadow-md space-y-6">
        {/* Datos de registro */}
        <div>
          <div className="flex justify-center md:justify-end">
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
  <LocationPicker 
    onLocationSelect={(coords) => {
      const coordsString = `${coords.lat},${coords.lng}`;
      setLocation(coordsString);
      setForm(prev => ({ ...prev, location: coordsString }));
    }} 
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
                  placeholder="DNI - NIE"
                  value={nuevaPersona.dni}
                  onChange={e => setNuevaPersona({ ...nuevaPersona, dni: e.target.value })}
                  className="p-2 border rounded"
                  onBlur={handleDniBlur}
                />
                <input
                  type="text"
                  name='Nombre'
                  placeholder="Nombre"
                  value={nuevaPersona.first_name}
                  onChange={e => setNuevaPersona({ ...nuevaPersona, first_name: e.target.value })}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  name='1º Apellido'
                  placeholder="1º Apellido"
                  value={nuevaPersona.last_name1}
                  onChange={e => setNuevaPersona({ ...nuevaPersona, last_name1: e.target.value })}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  name='2º Apellido'
                  placeholder="2º Apellido"
                  value={nuevaPersona.last_name2}
                  onChange={e => setNuevaPersona({ ...nuevaPersona, last_name2: e.target.value })}
                  className="p-2 border rounded"
                />
                <input
                  type="text"

                  placeholder="Número de contacto"
                  value={nuevaPersona.phone_number}
                  onChange={e => setNuevaPersona({ ...nuevaPersona, phone_number: e.target.value })}
                  className="p-2 border rounded"
                />
              </div>

              <button
                type="button"
                onClick={agregarPersona}
                className="mt-1 px-3 py-2 bg-[#002856] text-white rounded hover:bg-cyan-600 active:bg-gray-400"
              >
                Agregar persona
              </button>
            </div>
          )}
        </div>
        <div>
          {personas.length > 0 && (
            <ul className="space-y-2 mt-2 text-sm">
              {personas.map((p, i) => (
                <li className="list-none" key={i}>
                  <div className="flex justify-between items-center bg-gray-100 p-3 rounded mt-2">
                    <span className="flex flex-col flex-1 min-w-0">
                      <span className="truncate text-lg font-medium">{p.first_name} {p.last_name1} {p.last_name2}</span>
                      <span className="text-sm"><Link to={`/editarpersona/${p.dni}`} className="text-blue-600 hover:text-blue-700">{p.dni}</Link> - {p.phone_number}</span>
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
        <hr className="border-t border-gray-300 mt-2 mb-4" />

        {/* Sección vehículos */}
        <div>
          <h2 className="text-xl font-bold mb-2">Vehículos</h2>
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
                className="mt-2 px-3 py-2 bg-[#002856] text-white rounded hover:bg-cyan-600 active:bg-gray-400"
              >
                Agregar vehículo
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
        <hr className="border-t border-gray-300 mt-2 mb-4" />

        {/* Sección de imágenes */}
        <div>
          <h2 className="text-xl font-bold mb-2">Subir imágenes</h2>
          <ImageUpload onImagesChange={handleImagesChange} />
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full px-4 py-2 rounded text-white 
            ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
              `}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioIncidencia;
