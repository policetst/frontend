import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload'

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
