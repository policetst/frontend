import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIncidents, countPeople, countVehicles } from '../funcs/Incidents';

function MostrarIncidencia() {
  document.title = "SIL Tauste -  Mostrar Incidencias";
  const navigate = useNavigate();
  const [incidencias, setIncidencias] = useState([]);
  const [counts, setCounts] = useState({});
  const [filtroFecha, setFiltroFecha] = useState("");         
    const [filtroTipo, setFiltroTipo] = useState("");
        const [busqueda, setBusqueda] = useState("");               

useEffect(() => {
  const fetchIncidents = async () => {
    const data = await getIncidents();
    if (data.ok) {
//sort by creation_date in descending order
      const sortedIncidents = data.incidents.sort((a, b) => 
        new Date(b.creation_date) - new Date(a.creation_date)
      );
      setIncidencias(sortedIncidents);
      loadCounts(sortedIncidents);
    } else {
      console.error("Error fetching incidents:", data.message);
    }
  };
  fetchIncidents();
}, []);


  const loadCounts = async (incidents) => {
    const newCounts = {};
    for (const incident of incidents) {
      const code = incident.code;
      newCounts[code] = {
        people: await countPeople(code),
        vehicles: await countVehicles(code),
      };
    }
    setCounts(newCounts);
  };

  const handleEdit = (id) => {
    navigate(`/editincident/${id}`);
  };

  // identify the unique types of incidents for the filter dropdown
  incidencias ? <span className="text-gray-500">Cargando incidencias...</span> : null;
  if (!incidencias || incidencias.length === 0) { // if there are no incidents, show a message
    return <span className="text-gray-500">No hay incidencias disponibles</span>;
  }
  const tiposUnicos = Array.from(new Set(incidencias.map(i => i.type))).filter(Boolean);

  // Filtrado según los criterios
  const incidenciasFiltradas = incidencias.filter(incidencia => {
    // Filtro por fecha
    const fechaOk = !filtroFecha || (incidencia.creation_date && incidencia.creation_date.startsWith(filtroFecha));
    // Filtro por tipo
    const tipoOk = !filtroTipo || incidencia.type === filtroTipo;
    // Búsqueda por código o usuario
    const texto = busqueda.trim().toLowerCase();
    const busquedaOk = !texto || (
      (incidencia.code && incidencia.code.toLowerCase().includes(texto)) ||
      (incidencia.creator_user_code && incidencia.creator_user_code.toLowerCase().includes(texto))
    );
    return fechaOk && tipoOk && busquedaOk;
  });

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold mb-6">Incidencias</h3>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="date"
          value={filtroFecha}
          onChange={e => setFiltroFecha(e.target.value)}
          className="border rounded px-2 py-1"
          placeholder="Filtrar por fecha"
        />
        <select
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Todos los tipos</option>
          {tiposUnicos.map(tipo => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="border rounded px-2 py-1"
          placeholder="Buscar por agente o código"
        />
      </div>

      {/* incident filter */}
      <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-4">
        {incidenciasFiltradas.map((incidencia) => (
          <div
            key={incidencia.id}
            className="bg-white shadow-md rounded-xl p-4 border hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">
                {incidencia.creation_date ? incidencia.creation_date.split('T')[0] : ''}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full font-semibold ${incidencia.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                {incidencia.status}
              </span>
            </div>
            <h4 className="text-lg font-semibold mb-1">Código: {incidencia.code}</h4>
            <p className="text-sm text-gray-700 mb-2"><strong>Tipo:</strong> {incidencia.type}</p>
            <p className="text-sm text-gray-700 mb-2" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><strong>Descripción:</strong> {incidencia.description}</p>
            <div className="text-sm text-gray-600 mb-2">
              <p><strong>Creado por:</strong> {incidencia.creator_user_code}</p>
              <p><strong>Cerrado por:</strong> {incidencia.closure_user_code || '—'}</p>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-700 mb-2">
              <span>👥 {counts[incidencia.code]?.people ?? '...'}</span>
              <span>🚗 {counts[incidencia.code]?.vehicles ?? '...'}</span>
              <span>{incidencia.brigade_field ? '🔧 Brigada' : '—'}</span>
            </div>
            <button
              onClick={() => handleEdit(incidencia.code)}
              className="w-full mt-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Editar
            </button>
          </div>
        ))}
        {incidenciasFiltradas.length === 0 && (
          <div className="col-span-full text-center text-gray-400">No hay incidencias que coincidan.</div>
        )}
      </div>
    </div>

  );
}

export default MostrarIncidencia;
