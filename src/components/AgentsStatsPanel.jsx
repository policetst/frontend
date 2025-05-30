import React, { useMemo } from "react";

// Helper para colores, igual que antes
const COLORS = {
  "Seguridad Ciudadana": "#0088FE",
  "Animales": "#FFBB28",
  "Trafico": "#FF8042",
  "Incidencias Urbanísticas": "#00C49F",
  "Ruidos": "#FF6666",
  "Otras incidencias no clasificadas": "#8884d8",
  "Asistencia Colaboración Ciudadana": "#00897B",
  "default": "#AAAAAA"
};

const TIPO_ACRONIMOS = {
  "Seguridad Ciudadana": "SC",
  "Animales": "ANI",
  "Trafico": "TRF",
  "Incidencias Urbanísticas": "URB",
  "Ruidos": "RDS",
  "Otras incidencias no clasificadas": "OTR",
  "Asistencia Colaboración Ciudadana": "ACC",
};

function AgentsStatsPanel({ incidents }) {
  // Agrupar incidencias por agente
  const agentStats = useMemo(() => {
    const stats = {};
    incidents.forEach(inc => {
      const ag = inc.creator_user_code || "Desconocido";
      if (!stats[ag]) stats[ag] = { count: 0, tipos: {}, conBrigada: 0 };
      stats[ag].count += 1;
      stats[ag].tipos[inc.type] = (stats[ag].tipos[inc.type] || 0) + 1;
      if (inc.brigade_field) stats[ag].conBrigada += 1;
    });
    // Ranking descendente por incidencias
    return Object.entries(stats)
      .map(([name, st]) => ({ name, ...st }))
      .sort((a, b) => b.count - a.count);
  }, [incidents]);

  const totalIncidencias = useMemo(
    () => incidents.length,
    [incidents]
  );


  const tiposUnicos = useMemo(() => {
    const set = new Set(incidents.map(inc => inc.type));
    return Array.from(set);
  }, [incidents]);

  return (
    <div className="mt-10 max-w-4xl mx-auto">
      <h3 className="text-xl font-bold mb-4">Estadísticas por agente</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-2xl shadow text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Agente</th>
              <th className="px-3 py-2 text-center">Incidencias</th>
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
                <td colSpan={5 + tiposUnicos.length} className="text-center text-gray-500 py-4">
                  No hay datos de agentes.
                </td>
              </tr>
            ) : (
              agentStats.map((ag, idx) => (
                <tr
                  key={ag.name}
                  className={idx === 0 ? "bg-blue-50 font-semibold" : ""}
                >
                  <td className="px-3 py-2">{idx + 1}</td>
                  <td className="px-3 py-2">{ag.name}</td>
                  <td className="px-3 py-2 text-center">{ag.count}</td>
                  <td className="px-3 py-2 text-center">
                    {((ag.count / totalIncidencias) * 100).toFixed(1)}%
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
        Total de incidencias: <span className="font-bold">{totalIncidencias}</span>
      </div>
    </div>
  );
}

export default AgentsStatsPanel;
