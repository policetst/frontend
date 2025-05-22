import React,{useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { getIncidents, countPeople, countVehicles } from '../funcs/Incidents';


function MostrarIncidencia() {
  const navigate = useNavigate();
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
    navigate(`/editincident/${id}`);
  };

  return (
<<<<<<< HEAD
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
                <td className="px-4 py-2 text-center"> {countPeople(incidencia.people)} </td>
                <td className="px-4 py-2 text-center"> {countVehicles(incidencia.vehicles)} </td>
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
=======
    <div>
      {/* Titulo en escritorio o tablet */}
      <div className="hidden md:block">
        <h2 className="text-2xl font-bold mt-4 ml-15 mb-10">Mostrar incidencias</h2>
      </div>
      {/* Titulo en moviles */}
      <div className="block md:hidden">
        <h2 className="text-2xl font-bold flex justify-center mb-10">Mostrar incidencias</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {incidencias.map((incidencia) => (
          <div
            key={incidencia.id}
            className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-between"
          >
            {/* Indicador de estado */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-800">{incidencia.tipo}</h4>
              <span
                className={`w-4 h-4 rounded-full ${
                  incidencia.estado === 'Abierta' ? 'bg-green-500' : 'bg-gray-400'
                }`}
                title={incidencia.estado}
              ></span>
            </div>
            {/* Descripción */}
            <p className="text-sm text-gray-600 mb-2">{incidencia.descripcion}</p>
            {/* Detalles adicionales */}
            <div className="text-sm text-gray-600 mb-4">
              <p><strong>Personas:</strong> {incidencia.personas}</p>
              <p><strong>Vehículos:</strong> {incidencia.vehiculos}</p>
              <p><strong>Brigada:</strong> {incidencia.brigada ? 'Sí' : 'No'}</p>
            </div>
            {/* Botón de editar */}
            <button
              onClick={() => handleEdit(incidencia.id)}
              className="mt-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              Editar
            </button>
          </div>
        ))}
>>>>>>> adjust/front
      </div>
    </div>
  );
}

export default MostrarIncidencia;