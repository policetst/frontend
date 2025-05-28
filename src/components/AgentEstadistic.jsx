import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";

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

function AgentEstadistic({ data }) {
  const totalCreadas = data.length;
  const incidenciasPorTipo = {};
  data.forEach(inc => {
    incidenciasPorTipo[inc.type] = (incidenciasPorTipo[inc.type] || 0) + 1;
  });
  const incidenciasTipoData = Object.entries(incidenciasPorTipo)
    .map(([name, value]) => ({ name, value }));

  const conBrigada = data.filter(inc => inc.brigade_field).length;
  const fechas = data.map(inc => new Date(inc.creation_date)).sort((a, b) => a - b);
  const primerDia = fechas[0] ? fechas[0].toLocaleDateString() : "—";
  const ultimoDia = fechas.at(-1) ? fechas.at(-1).toLocaleDateString() : "—";

  const logros = [
    { name: "Reportero", desc: "Has creado al menos 1 incidencia.", unlocked: totalCreadas >= 1 },
    { name: "Veterano", desc: "Has creado más de 10 incidencias.", unlocked: totalCreadas >= 10 },
    { name: "Brigada Master", desc: "Has generado incidencias con brigada.", unlocked: conBrigada > 0 },
    { name: "Cazador de Animales", desc: "Has informado sobre animales.", unlocked: !!incidenciasPorTipo["Animales"] },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Tus estadísticas</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {/* BarChart incidencias por tipo */}
        <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center justify-center">
          <h3 className="font-semibold text-lg mb-2 text-center">Tipos de incidencia</h3>
          <div style={{ width: "100%", maxWidth: 550, height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={incidenciasTipoData}
                layout="vertical"
                margin={{ top: 20, right: 40, left: 0, bottom: 5 }}
              >
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={160} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Cantidad" isAnimationActive={true}>
                  {incidenciasTipoData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.name] || COLORS["default"]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="bg-white rounded-2xl shadow p-4 flex flex-col justify-center">
          <div className="mb-2">Incidencias creadas: <span className="font-bold">{totalCreadas}</span></div>
          <div className="mb-2">Con brigada: <span className="font-bold">{conBrigada}</span></div>
          <div className="mb-2">Primer día: <span className="font-bold">{primerDia}</span></div>
          <div className="mb-2">Última incidencia: <span className="font-bold">{ultimoDia}</span></div>
        </div>
      </div>
      {/* Logros */}
      <div className="bg-white rounded-2xl shadow p-4 mt-6">
        <h3 className="font-semibold text-lg mb-4">Tus logros</h3>
        <ul className="space-y-2">
          {logros.map(l => (
            <li key={l.name} className={l.unlocked ? "text-green-700 font-semibold" : "text-gray-400"}>
              <span className="mr-2">{l.unlocked ? "🏅" : "🔒"}</span>
              <span>{l.name}</span> — <span className="text-sm">{l.desc}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AgentEstadistic;
