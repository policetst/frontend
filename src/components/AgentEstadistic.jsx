import React, { useMemo, useState } from "react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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

const TIPO_ACRONIMOS = {
  "Seguridad Ciudadana": "SC",
  "Animales": "ANI",
  "Trafico": "TRF",
  "Incidencias Urbanísticas": "URB",
  "Ruidos": "RDS",
  "Otras incidencias no clasificadas": "OTR",
  "Asistencia Colaboración Ciudadana": "ACC",
};

const getYear = dateStr => (new Date(dateStr)).getFullYear();
const getMonth = dateStr => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

function AgentEstadistic({ data }) {
  const [view, setView] = useState("mensual");

  const years = useMemo(() => (
    Array.from(new Set(data.map(inc => getYear(inc.creation_date))))
      .sort((a, b) => a - b)
  ), [data]);
  const months = useMemo(() => (
    Array.from(new Set(data.map(inc => getMonth(inc.creation_date))))
      .sort((a, b) => a.localeCompare(b))
  ), [data]);

  const tipos = useMemo(() => {
    const set = new Set(data.map(inc => inc.type));
    return Array.from(set);
  }, [data]);

  const tipoToY = useMemo(() => (
    Object.fromEntries(tipos.map((tipo, i) => [tipo, i + 1]))
  ), [tipos]);

  // Preparar datos para ScatterChart
  const scatterData = useMemo(() => {
    return data.map(inc => ({
      x: view === "mensual" ? getMonth(inc.creation_date) : getYear(inc.creation_date),
      y: tipoToY[inc.type],
      type: inc.type,
      fecha: inc.creation_date,
    }));
  }, [data, view, tipoToY]);

  // Legend: cuántos de cada tipo
  const legendInfo = useMemo(() => {
    const sumas = {};
    tipos.forEach(tipo => sumas[tipo] = 0);
    data.forEach(inc => {
      sumas[inc.type] += 1;
    });
    const total = Object.values(sumas).reduce((acc, val) => acc + val, 0);
    return tipos.map(tipo => ({
      name: tipo,
      acr: TIPO_ACRONIMOS[tipo] || tipo,
      value: sumas[tipo],
      percent: total ? ((sumas[tipo] / total) * 100).toFixed(1) : 0,
    })).filter(entry => entry.value > 0);
  }, [data, tipos]);

  const total = legendInfo.reduce((acc, curr) => acc + curr.value, 0);
  const xValues = view === "mensual" ? months : years;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Incidencias individuales ({view === "mensual" ? "mensual" : "anual"})
      </h2>
      <div className="flex flex-wrap gap-3 mb-5 justify-center items-center">
        <select
          className="rounded-xl border px-3 py-1"
          value={view}
          onChange={e => setView(e.target.value)}
        >
          <option value="mensual">Mensual</option>
          <option value="anual">Anual</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center justify-center">
        {scatterData.length === 0 || legendInfo.length === 0 ? (
          <div className="text-gray-500">No hay datos para mostrar.</div>
        ) : (
          <>
            <div style={{ width: "100%", height: 380 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 10, right: 30, bottom: 20, left: 30 }}
                >
                  <CartesianGrid />
                  <XAxis
                    dataKey="x"
                    type="category"
                    name={view === "mensual" ? "Mes" : "Año"}
                    ticks={xValues}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    ticks={tipos.map((_, i) => i + 1)}
                    tickFormatter={y => TIPO_ACRONIMOS[tipos[y - 1]] || tipos[y - 1]}
                    domain={[0, tipos.length + 1]}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(_, __, { payload }) =>
                      [`${TIPO_ACRONIMOS[payload.type] || payload.type}`, "Tipo"]
                    }
                    labelFormatter={(_, payload) =>
                      payload && payload[0] ? `Fecha: ${payload[0].payload.fecha}` : ""
                    }
                  />
                  {tipos.map(tipo => (
                    <Scatter
                      key={tipo}
                      name={TIPO_ACRONIMOS[tipo] || tipo}
                      data={scatterData.filter(d => d.type === tipo)}
                      fill={COLORS[tipo] || COLORS.default}
                      shape="circle"
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            {/* Legend Tailwind */}
            <div className="mt-6 w-full flex flex-wrap justify-center gap-4">
              {legendInfo.map((entry) => (
                <div
                  key={entry.name}
                  className="flex items-center bg-gray-50 rounded-lg px-3 py-1 shadow-sm"
                >
                  <span
                    className="inline-block w-4 h-4 rounded-full mr-2"
                    style={{
                      backgroundColor: COLORS[entry.name] || COLORS.default,
                    }}
                  />
                  <span className="font-medium">{entry.acr}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({entry.value} - {entry.percent}%)
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {legendInfo.length > 0 && (
        <div className="mt-4 text-center text-gray-600 font-semibold">
          Total de incidencias: <span className="text-blue-700">{total}</span>
        </div>
      )}
    </div>
  );
}

export default AgentEstadistic;
