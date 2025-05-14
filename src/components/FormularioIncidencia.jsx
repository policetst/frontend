import React, { useState, useEffect } from 'react';
import { DATA, postIncident } from '../funcs/Incidents';

const FormularioIncidencia = () => {

      const Location = DATA.latitude + ',' + DATA.longitude; // format: "latitude,longitude"
  const [location, setLocation] = useState(Location); 
  useEffect(() => {
  }, [DATA]);

  const [form, setForm] = useState({
    status: 'Open',
    location: location,
    type: '',
    description: '',
    brigade_field: false,
  creator_user_code: 'AR00001',
  });
  const [personas, setPersonas] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);

  const [nuevaPersona, setNuevaPersona] = useState({ nombre: '', apellidos: '', dni: '' });
  const [nuevoVehiculo, setNuevoVehiculo] = useState({ marca: '', modelo: '', color: '', matricula: '' });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Formulario completo enviado:', form);
    //* post data to server
    postIncident(form)
      .then(response => {
        console.log('Incidencia creada:', response);
        setForm({
          status: 'Open',
          location: location,
          type: '',
          descrifalse,
          creator_user_code: 'AR00001',
        });
      });
  };

  const agregarPersona = () => {
    if (nuevaPersona.nombre && nuevaPersona.apellidos && nuevaPersona.dni) {
      setForm(prev => ({
        ...prev,
        personas: [...prev.personas, nuevaPersona],
      }));
      setNuevaPersona({ nombre: '', apellidos: '', dni: '' });
    }
  };

  const agregarVehiculo = () => {
    if (nuevoVehiculo.marca && nuevoVehiculo.modelo && nuevoVehiculo.color && nuevoVehiculo.matricula) {
      setForm(prev => ({
        ...prev,
        vehiculos: [...prev.vehiculos, nuevoVehiculo],
      }));
      setNuevoVehiculo({ marca: '', modelo: '', color: '', matricula: '' });
    }
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
  <div className="grid grid-cols-4 gap-2 mb-2">
    <input
      type="text"
      placeholder="DNI"
      value={nuevaPersona.dni}
      onChange={(e) => setNuevaPersona({ ...nuevaPersona, dni: e.target.value })}
      className="p-2 border rounded-md"
    />
    <input
      type="text"
      placeholder="Nombre"
      value={nuevaPersona.nombre}
      onChange={(e) => setNuevaPersona({ ...nuevaPersona, nombre: e.target.value })}
      className="p-2 border rounded-md"
    />
    <input
      type="text"
      placeholder="Apellidos"
      value={nuevaPersona.apellidos}
      onChange={(e) => setNuevaPersona({ ...nuevaPersona, apellidos: e.target.value })}
      className="p-2 border rounded-md"
    />
    <input
      type="text"
      placeholder="Contacto"
      value={nuevaPersona.contacto || ''}
      onChange={(e) => setNuevaPersona({ ...nuevaPersona, contacto: e.target.value })}
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
        <li key={i}>
          {p.nombre} {p.apellidos} - {p.dni} - {p.contacto}
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
              <li key={i}>{v.marca} {v.modelo}, {v.color}, {v.matricula}</li>
            ))}
          </ul>
        )}
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
