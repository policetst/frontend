import React,{useState, useEffect} from 'react';
import { getIncidents } from '../funcs/Incidents';


function MostrarIncidencia() {
  const [incidencias, setIncidencias] = useState([]);

  useEffect(() => {  
    const fetchIncidents = async () => {
      const data = await getIncidents();
      if (data.ok) {
        setIncidencias(data.incidents);
        console.log("Incidencias:", data);
      } else {
        console.error("Error fetching incidents:", data.message);
      }
    };
    fetchIncidents();
  }, []);

  document.title = "Mostrar Incidencias";

  const handleEdit = (id) => {
    alert(`Editar incidencia con ID: ${id}`);
  };

  return (
       <div className="p-4">
      <h3 className="text-2xl font-bold mb-4">Incidencias</h3>
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Código</th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Creada por</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Descripción</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Personas</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Vehículos</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Brigada</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {incidencias.map((incidencia, idx) => (
              <tr
                key={incidencia.id}
                className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="px-4 py-2 font-mono text-xs">{incidencia.code}</td>
                <td className="px-4 py-2 font-mono text-xs">{incidencia.creator_user_code}</td>
                <td className="px-4 py-2">{incidencia.type}</td>
                <td className="px-4 py-2">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 align-middle ${
                    incidencia.status === 'Open' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></span>
                  {incidencia.status}
                </td>
                <td className="px-4 py-2 text-sm">{incidencia.description}</td>
                <td className="px-4 py-2 text-center"> {/* Personas */} </td>
                <td className="px-4 py-2 text-center"> {/* Vehículos */} </td>
                <td className="px-4 py-2 text-center">{incidencia.brigade_field ? 'Sí' : 'No'}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleEdit(incidencia.code)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs shadow"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MostrarIncidencia;