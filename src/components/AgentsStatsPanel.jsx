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
    <div className="mt-10 w-full mx-auto">
      <h3 className="text-xl font-bold mb-4">Estadísticas por agente</h3>
      <div className="flex justify-center overflow-x-auto">
        <table className="min-w-full bg-white rounded-2xl shadow text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Agente</th>
              <th className="px-3 py-2 text-center">Código</th>
              <th className="px-3 py-2 text-center">Creadas</th>
              <th className="px-3 py-2 text-center">% sobre total</th>
              <th className="px-3 py-2 text-center">Cerradas</th>
              <th className="px-3 py-2 text-center">% sobre total</th>
              <th className="px-3 py-2 text-center">Con Brigada</th>
              {tiposUnicos.map(tipo => (
                <th key={tipo} className="px-2 py-2 text-center">
                  {TIPO_ACRONIMOS[tipo] || tipo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agentStats.length === 0 ? (
              <tr>
                <td colSpan={8 + tiposUnicos.length} className="text-center text-gray-500 py-4">
                  No hay datos de agentes.
                </td>
              </tr>
            ) : (
              agentStats.map((ag, idx) => (
                <tr key={ag.code} className={ag.creadas > 0 && idx === 0 ? "bg-blue-50 font-semibold" : ag.creadas === 0 ? "bg-gray-50 text-gray-600" : ""}>
                  <td className="px-3 py-2">{idx + 1}</td>
                  <td className="px-3 py-2">{ag.name}</td>
                  <td className="px-3 py-2 text-center text-xs">{ag.code}</td>
                  <td className="px-3 py-2 text-center">{ag.creadas}</td>
                  <td className="px-3 py-2 text-center">
                    {totalCreadas > 0 ? ((ag.creadas / totalCreadas) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="px-3 py-2 text-center">{ag.cerradas}</td>
                  <td className="px-3 py-2 text-center">
                    {totalCerradas > 0 ? ((ag.cerradas / totalCerradas) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="px-3 py-2 text-center">{ag.conBrigada}</td>
                  {tiposUnicos.map(tipo => (
                    <td key={tipo} className="px-2 py-2 text-center">
                      {ag.tipos[tipo] || 0}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-right text-gray-500 text-sm">
        Total agentes: <span className="font-bold">{agentStats.length}</span> | 
        Total incidencias creadas: <span className="font-bold">{totalCreadas}</span> | 
        Total cerradas: <span className="font-bold">{totalCerradas}</span>
      </div>
    </div>
  );
}

export default AgentsStatsPanel;