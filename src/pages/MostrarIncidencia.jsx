import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIncidents, countPeople, countVehicles } from '../funcs/Incidents';

function MostrarIncidencia() {
  document.title = "SIL Tauste -  Mostrar Incidencias";
  const navigate = useNavigate();
  const [incidencias, setIncidencias] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState("");         
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState(""); 
  const [busqueda, setBusqueda] = useState("");               

  useEffect(() => {
    const fetchIncidents = async () => {
      const data = await getIncidents();
      if (data.ok) {
        // sort incidents by creation_date in descending order
        const sortedIncidents = data.incidents.sort((a, b) => 
          new Date(b.creation_date) - new Date(a.creation_date)
        );
        setIncidencias(sortedIncidents);      
      } 
        else {
        console.error("Error fetching incidents:", data.message);
      }
    };
    fetchIncidents();
  }, []);

  // const loadCounts = async (incidents) => { ... }

  const handleEdit = (id) => {
    navigate(`/editincident/${id}`);
  };

  incidencias ? <span className="text-gray-500">Cargando incidencias...</span> : null;
  if (!incidencias || incidencias.length === 0) {
    return <span className="text-gray-500">No hay incidencias disponibles</span>;
  }
  const tiposUnicos = Array.from(new Set(incidencias.map(i => i.type))).filter(Boolean);

  // Filtro con el nuevo filtro de status
const incidenciasFiltradas = incidencias.filter(incidencia => {
  const fechaOk = !filtroFecha || (incidencia.creation_date && incidencia.creation_date.startsWith(filtroFecha));
  const tipoOk = !filtroTipo || incidencia.type === filtroTipo;
  const statusOk = !filtroStatus || incidencia.status === filtroStatus;

  const texto = busqueda.trim().toLowerCase();
  // Allow to search across multiple fields 
  const fieldsToSearch = [
    incidencia.code,
    incidencia.creator_user_code,
    incidencia.closure_user_code,
    incidencia.type,
    incidencia.description,
    incidencia.status,
    incidencia.brigade_field ? 'brigada' : '',
    incidencia.creation_date
    // Agrega aquí más campos si tienes más
  ].filter(Boolean).join(' ').toLowerCase();

  const busquedaOk = !texto || fieldsToSearch.includes(texto);

  return fechaOk && tipoOk && statusOk && busquedaOk;
});


  return (
    <div>
      <div className="flex justify-center">
        <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] space-y-8 text-gray-800">
          {/* Titulo */}
          <div className="hidden xl:block">
            <h2 className="text-2xl font-bold">Incidencias</h2>
            <hr className="border-t border-gray-300 my-4"/>
          </div>
          <div className="block xl:hidden">
            <h2 className="text-2xl font-bold flex justify-center">Incidencias</h2>
            <hr className="border-t border-gray-300 my-4"/>
          </div>
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
            <select
              value={filtroStatus}
              onChange={e => setFiltroStatus(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value=""> estados</option>
              <option value="Open">Abiertas</option>
              <option value="Closed">Cerradas</option>
            </select>
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="border rounded px-2 py-1"
              placeholder="Buscar por palabras clave"
            />
          </div>
          {/* Lista de incidencias */}
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
                    {incidencia.status === 'Open' ? 'Abierta' : 'Cerrada'}
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
<div></div>
                  <span>{incidencia.brigade_field ? '🔧 Brigada' : '—'}</span>
                </div>
                <button
                  onClick={() => handleEdit(incidencia.code)}
                  className="w-full mt-2 px-4 py-1 bg-[#002856] text-white rounded hover:bg-[#0092CA] active:bg-[#3AAFA9]"
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
      </div>
    </div>
  );
}

export default MostrarIncidencia;
