import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIncidents, countPeople, countVehicles } from '../funcs/Incidents';

function MostrarIncidencia() {
  const navigate = useNavigate();
  const [incidencias, setIncidencias] = useState([]);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const fetchIncidents = async () => {
      const data = await getIncidents();
      if (data.ok) {
        setIncidencias(data.incidents);
        loadCounts(data.incidents);
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

  document.title = "Mostrar Incidencias";

  const handleEdit = (id) => {
    navigate(`/editincident/${id}`);
  };

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold mb-6">Incidencias</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {incidencias.map((incidencia) => (
          <div
            key={incidencia.id}
            className="bg-white shadow-md rounded-xl p-4 border hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">{incidencia.creation_date.split('T')[0]}</span>
              <span className={`px-2 py-1 text-xs rounded-full font-semibold ${incidencia.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                {incidencia.status}
              </span>
            </div>
            <h4 className="text-lg font-semibold mb-1">Código: {incidencia.code}</h4>
            <p className="text-sm text-gray-700 mb-2"><strong>Tipo:</strong> {incidencia.type}</p>
            <p className="text-sm text-gray-700 mb-2"><strong>Descripción:</strong> {incidencia.description}</p>
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
      </div>
    </div>
  );
}

export default MostrarIncidencia;
