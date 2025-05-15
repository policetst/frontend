import React, { useState, useEffect } from 'react';
import { postIncident, getLocation } from '../funcs/Incidents';
import ImageUpload from './ImageUpload';
import axios from 'axios';
import { X as XIcon } from 'lucide-react';


const FormularioIncidencia = () => {
  const [location, setLocation] = useState('');
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

    // Subir imágenes a /uploads
    let uploadedImageUrls = [];
    for (const file of selectedImages) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await axios.post('http://localhost:4000/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data && res.data.file && res.data.file.url) {
          uploadedImageUrls.push(res.data.file.url);
        }
      } catch (err) {
        console.error('Error uploading image:', err);
      }
    }

    // add images to the existing form
    const formToSend = {
      ...form,
      people: personas,
      vehicles: vehiculos,
      images: uploadedImageUrls,
    };

    postIncident(formToSend)
      .then(response => {
        console.log('Incidencia creada:', response);
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
      });
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
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
      {/* Datos de la incidencia */}
      <div>
        <h2 className="text-xl font-bold mb-2">Incidencia</h2>
        <div className="mb-4">
          <label className="block font-medium">Coordenadas</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md"
            placeholder="Latitud, Longitud"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium">Tipo de incidencia</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-md"
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
          <label className="text-sm">Contacto con brigada</label>
        </div>
      </div>

      {/* Sección personas */}
      <div>
        <h2 className="text-xl font-bold mb-2">Personas</h2>
        <div className="grid grid-cols-5 gap-2 mb-2">
          <input
            type="text"
            placeholder="DNI"
            value={nuevaPersona.dni}
            onChange={e => setNuevaPersona({ ...nuevaPersona, dni: e.target.value })}
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            placeholder="Nombre"
            value={nuevaPersona.first_name}
            onChange={e => setNuevaPersona({ ...nuevaPersona, first_name: e.target.value })}
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            placeholder="1º Apellido"
            value={nuevaPersona.last_name1}
            onChange={e => setNuevaPersona({ ...nuevaPersona, last_name1: e.target.value })}
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            placeholder="2º Apellido"
            value={nuevaPersona.last_name2}
            onChange={e => setNuevaPersona({ ...nuevaPersona, last_name2: e.target.value })}
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={nuevaPersona.phone_number}
            onChange={e => setNuevaPersona({ ...nuevaPersona, phone_number: e.target.value })}
            className="p-2 border rounded-md"
          />
        </div>
        <button
          type="button"
          onClick={agregarPersona}
          className="mb-2 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Añadir persona
        </button>

        {personas.length > 0 && (
          <ul className="list-disc list-inside text-sm">
            {personas.map((p, i) => (
              <li key={i} className="flex justify-start items-center">
                {p.dni} - {p.first_name} {p.last_name1} {p.last_name2} - {p.phone_number} <XIcon className="h-4 w-4 text-red-600" onClick={() => eliminarPersona(i)} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Sección vehículos */}
      <div>
        <h2 className="text-xl font-bold mb-2">Vehículos</h2>
        <div className="grid grid-cols-4 gap-2 mb-2">
          <input
            type="text"
            placeholder="Matrícula"
            value={nuevoVehiculo.matricula}
            onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, matricula: e.target.value })}
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            placeholder="Marca"
            value={nuevoVehiculo.marca}
            onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, marca: e.target.value })}
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            placeholder="Modelo"
            value={nuevoVehiculo.modelo}
            onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, modelo: e.target.value })}
            className="p-2 border rounded-md"
          />
          <input
            type="text"
            placeholder="Color"
            value={nuevoVehiculo.color}
            onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, color: e.target.value })}
            className="p-2 border rounded-md"
          />
        </div>
        <button
          type="button"
          onClick={agregarVehiculo}
          className="mb-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Añadir vehículo
        </button>

        {vehiculos.length > 0 && (
          <ul className="list-disc list-inside text-sm">
            {vehiculos.map((v, i) => (
              <li key={v.matricula} className="flex justify-start items-center">
                {v.marca} {v.modelo}, {v.color}, {v.matricula}
                <XIcon className="h-4 w-4 text-red-600" onClick={() => eliminarVehiculo(i)} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <hr />
      {/* Sección de imágenes */}
      <div>
        <h2 className="text-xl font-bold mb-2">Imágenes</h2>
        <ImageUpload onImagesChange={handleImagesChange} />
      </div>
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
      >
        Enviar
      </button>
    </form>
  );
};
export default FormularioIncidencia;