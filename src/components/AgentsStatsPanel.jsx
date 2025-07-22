import React, { useMemo, useState, useEffect } from "react";
import { getUsers } from "../funcs/Incidents";

const TIPO_ACRONIMOS = {
  "Seguridad Ciudadana": "SC",
  "Animales": "ANI",
  "Trafico": "TRF",
  "Incidencias Urbanísticas": "URB",
  "Ruidos": "RDS",
  "Otras incidencias no clasificadas": "OTR",
  "Asistencia Colaboración Ciudadana": "ACC",
  "Ilícito penal": "ILP",
  "Juzgados": "JUZ"
};

function AgentsStatsPanel({ incidents }) {
  const [allUsers, setAllUsers] = useState([]);

  // Obtener todos los usuarios del sistema
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        if (usersData.ok) {
          setAllUsers(usersData.data || []);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Todos los tipos únicos
  const tiposUnicos = useMemo(() => {
    const set = new Set(incidents.map(inc => inc.type));
    return Array.from(set);
  }, [incidents]);

  // Estadísticas por agente (ahora incluye TODOS los usuarios)
  const agentStats = useMemo(() => {
    // Inicializar stats para todos los usuarios
    const stats = {};
    
    // Primero, crear entrada para todos los usuarios con stats en 0
    allUsers.forEach(user => {
      const userCode = user.user_code || user.code || user.username;
      if (userCode) {
        stats[userCode] = { 
          creadas: 0, 
          cerradas: 0, 
          tipos: {}, 
          conBrigada: 0,
          fullName: `${user.first_name || ''} ${user.last_name1 || ''} ${user.last_name2 || ''}`.trim() || userCode
        };
      }
    });

    // Luego, procesar las incidencias para actualizar las estadísticas
    incidents.forEach(inc => {
      // Creador
      const creator = inc.creator_user_code || "Desconocido";
      if (!stats[creator]) {
        stats[creator] = { creadas: 0, cerradas: 0, tipos: {}, conBrigada: 0, fullName: creator };
      }
      stats[creator].creadas += 1;
      stats[creator].tipos[inc.type] = (stats[creator].tipos[inc.type] || 0) + 1;
      if (inc.brigade_field) stats[creator].conBrigada += 1;

      // Team mate (si existe)
      if (inc.team_mate) {
        const teamMate = inc.team_mate;
        if (!stats[teamMate]) {
          stats[teamMate] = { creadas: 0, cerradas: 0, tipos: {}, conBrigada: 0, fullName: teamMate };
        }
        stats[teamMate].creadas += 1;
        stats[teamMate].tipos[inc.type] = (stats[teamMate].tipos[inc.type] || 0) + 1;
        if (inc.brigade_field) stats[teamMate].conBrigada += 1;
      }

      // Cerrador
      if (inc.closure_user_code) {
        const closer = inc.closure_user_code;
        if (!stats[closer]) {
          stats[closer] = { creadas: 0, cerradas: 0, tipos: {}, conBrigada: 0, fullName: closer };
        }
        stats[closer].cerradas += 1;
      }
    });

    // Convertir a array y ordenar por incidencias creadas (luego por nombre)
    return Object.entries(stats)
      .map(([code, st]) => ({ code, name: st.fullName, ...st }))
      .sort((a, b) => {
        // Primero por incidencias creadas (descendente)
        if (b.creadas !== a.creadas) {
          return b.creadas - a.creadas;
        }
        // Si tienen las mismas incidencias creadas, ordenar por nombre
        return a.name.localeCompare(b.name);
      });
  }, [incidents, allUsers]);

  const totalCreadas = agentStats.reduce((acc, ag) => acc + ag.creadas, 0);
  const totalCerradas = agentStats.reduce((acc, ag) => acc + ag.cerradas, 0);

  console.log("All users:", allUsers);
  console.log("Agent stats:", agentStats);

  return (
    <div className="mt-10 w-full mx-auto px-2 sm:px-4">
      <h3 className="text-lg sm:text-xl font-bold mb-4">Estadísticas por agente</h3>
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300 bg-white text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-1 sm:px-3 py-2 text-left font-semibold text-gray-900">#</th>
                  <th className="px-1 sm:px-3 py-2 text-left font-semibold text-gray-900 min-w-[120px]">Agente</th>
                  <th className="px-1 sm:px-3 py-2 text-center font-semibold text-gray-900">Código</th>
                  <th className="px-1 sm:px-3 py-2 text-center font-semibold text-gray-900">Creadas</th>
                  <th className="px-1 sm:px-3 py-2 text-center font-semibold text-gray-900 hidden sm:table-cell">% total</th>
                  <th className="px-1 sm:px-3 py-2 text-center font-semibold text-gray-900">Cerradas</th>
                  <th className="px-1 sm:px-3 py-2 text-center font-semibold text-gray-900 hidden sm:table-cell">% total</th>
                  <th className="px-1 sm:px-3 py-2 text-center font-semibold text-gray-900 hidden md:table-cell">Brigada</th>
                  {tiposUnicos.map(tipo => (
                    <th key={tipo} className="px-1 sm:px-2 py-2 text-center font-semibold text-gray-900 hidden lg:table-cell">
                      <span className="block sm:hidden">{TIPO_ACRONIMOS[tipo]?.substring(0, 2) || tipo.substring(0, 2)}</span>
                      <span className="hidden sm:block">{TIPO_ACRONIMOS[tipo] || tipo}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {agentStats.length === 0 ? (
                  <tr>
                    <td colSpan={8 + tiposUnicos.length} className="text-center text-gray-500 py-8">
                      No hay datos de agentes.
                    </td>
                  </tr>
                ) : (
                  agentStats.map((ag, idx) => (
                    <tr key={ag.code} className={`${ag.creadas > 0 && idx === 0 ? "bg-blue-50 font-semibold" : ag.creadas === 0 ? "bg-gray-50 text-gray-600" : ""} hover:bg-gray-50`}>
                      <td className="px-1 sm:px-3 py-2 whitespace-nowrap">{idx + 1}</td>
                      <td className="px-1 sm:px-3 py-2">
                        <div className="truncate max-w-[120px] sm:max-w-none" title={ag.name}>
                          {ag.name}
                        </div>
                      </td>
                      <td className="px-1 sm:px-3 py-2 text-center whitespace-nowrap text-xs">{ag.code}</td>
                      <td className="px-1 sm:px-3 py-2 text-center whitespace-nowrap font-medium">{ag.creadas}</td>
                      <td className="px-1 sm:px-3 py-2 text-center whitespace-nowrap hidden sm:table-cell">
                        {totalCreadas > 0 ? ((ag.creadas / totalCreadas) * 100).toFixed(1) : 0}%
                      </td>
                      <td className="px-1 sm:px-3 py-2 text-center whitespace-nowrap font-medium">{ag.cerradas}</td>
                      <td className="px-1 sm:px-3 py-2 text-center whitespace-nowrap hidden sm:table-cell">
                        {totalCerradas > 0 ? ((ag.cerradas / totalCerradas) * 100).toFixed(1) : 0}%
                      </td>
                      <td className="px-1 sm:px-3 py-2 text-center whitespace-nowrap hidden md:table-cell">{ag.conBrigada}</td>
                      {tiposUnicos.map(tipo => (
                        <td key={tipo} className="px-1 sm:px-2 py-2 text-center whitespace-nowrap hidden lg:table-cell">
                          {ag.tipos[tipo] || 0}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center sm:text-right text-gray-500 text-xs sm:text-sm space-y-1 sm:space-y-0">
        <div className="sm:inline">
          Total agentes: <span className="font-bold">{agentStats.length}</span>
        </div>
        <div className="sm:inline sm:ml-4">
          Creadas: <span className="font-bold">{totalCreadas}</span>
        </div>
        <div className="sm:inline sm:ml-4">
          Cerradas: <span className="font-bold">{totalCerradas}</span>
        </div>
      </div>
    </div>
  );
}

export default AgentsStatsPanel;