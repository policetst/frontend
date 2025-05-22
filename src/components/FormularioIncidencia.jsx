import React, { useState } from 'react';

const FormularioIncidencia = () => {
  const [form, setForm] = useState({
    coordenadas: '',
    tipo: '',
    descripcion: '',
    contactoBrigada: false,
    personas: [],
    vehiculos: [],
  });

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
    // Aquí puedes hacer la petición a tu backend
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
    <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] p-6 space-y-8">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
        {/* Datos de registro */}
        <div>
          <div className="flex justify-between">
            {/* Fecha y hora */}
            <div className="flex justify-start items-start h-10">
              <p>{new Date().toLocaleString()}</p>
            </div>
            {/* Agente 2 */}
            <div>
              <p>
                AR12345
              </p>
            </div>
          </div>
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

        {/* Sección personas */}
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
              className="p-2 mb-2 border rounded"
            />
          </div>
          <button
            type="button"
            onClick={agregarPersona}
            className="mb-2 px-4 py-1 bg-[#002856] text-white rounded hover:bg-[#0092CA]"
          >
            Añadir persona
          </button>

          {form.personas.length > 0 && (
            <ul className="list-disc list-inside text-sm">
              {form.personas.map((p, i) => (
                <li key={i}>
                  {p.nombre} {p.apellidos} - {p.dni} - {p.contacto}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Sección vehículos */}
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
              className="p-2 mb-2 border rounded"
            />
      
          </div>
          <button
            type="button"
            onClick={agregarVehiculo}
            className="mb-2 px-4 py-1 bg-[#002856] text-white rounded hover:bg-[#0092CA]"
          >
            Añadir vehículo
          </button>

          {form.vehiculos.length > 0 && (
            <ul className="list-disc list-inside text-sm">
              {form.vehiculos.map((v, i) => (
                <li key={i}>{v.marca} {v.modelo}, {v.color}, {v.matricula}</li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-[#002856] text-white py-2 rounded hover:bg-[#0092CA] transition"
        >
          Crear incidencia
        </button>
      </form>
    </div>
  );
};

export default FormularioIncidencia;
