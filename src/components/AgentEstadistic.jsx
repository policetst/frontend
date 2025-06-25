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
  "Ilícito penal": "#AB47BC",
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
  "Ilícito penal": "ILP"
};

// Lista fija de tipos, SIEMPRE aparece en el filtro:
const tipos = [
  "Animales",
  "Seguridad Ciudadana",
  "Trafico",
  "Ruidos",
  "Asistencia Colaboración Ciudadana",
  "Ilícito penal",
  "Incidencias Urbanísticas",
  "Otras incidencias no clasificadas"
];

const datos = [
  { siglas: 'OTR', significado: 'Otras incidencias no clasificadas' },
  { siglas: 'URB', significado: 'Incidencias urbanísticas' },
  { siglas: 'ILP', significado: 'Ilícito penal' },
  { siglas: 'ACC', significado: 'Asistencia colaboración ciudadana' },
  { siglas: 'RDS', significado: 'Ruidos' },
  { siglas: 'TRF', significado: 'Tráfico' },
  { siglas: 'SC', significado: 'Seguridad ciudadana' },
  { siglas: 'ANI', significado: 'Animales' },
];



const getYear = dateStr => (new Date(dateStr)).getFullYear();
const getMonth = dateStr => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

function AgentEstadistic({ data, user_code }) {
  const [view, setView] = useState("mensual");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroAnio, setFiltroAnio] = useState("");
  const [leyend, setLeyend] = useState();

  // Solo incidencias donde el usuario es creador o compañero (normalizado)
  const userIncidents = useMemo(() => {
    const userCodeNorm = user_code ? user_code.trim().toUpperCase() : "";
    return data.filter(
      inc =>
        (inc.creator_user_code && inc.creator_user_code.trim().toUpperCase() === userCodeNorm) ||
        (inc.team_mate && inc.team_mate.trim().toUpperCase() === userCodeNorm)
    );
  }, [data, user_code]);

  const years = useMemo(() => (
    Array.from(new Set(userIncidents.map(inc => getYear(inc.creation_date))))
      .sort((a, b) => a - b)
  ), [userIncidents]);

  // Prepara mapping de tipo a eje Y:
  const tipoToY = useMemo(() => (
    Object.fromEntries(tipos.map((tipo, i) => [tipo, i + 1]))
  ), []);

  // DATOS FILTRADOS por tipo y año
  const filteredData = useMemo(() => {
    return userIncidents.filter(inc => (
      (!filtroTipo || inc.type === filtroTipo) &&
      (!filtroAnio || getYear(inc.creation_date) === Number(filtroAnio))
    ));
  }, [userIncidents, filtroTipo, filtroAnio]);

  // Preparar datos para ScatterChart con los datos filtrados
  const scatterData = useMemo(() => {
    return filteredData.map(inc => ({
      x: view === "mensual" ? getMonth(inc.creation_date) : getYear(inc.creation_date),
      y: tipoToY[inc.type],
      type: inc.type,
      fecha: inc.creation_date,
    }));
  }, [filteredData, view, tipoToY]);

  // Legend: cuántos de cada tipo en los datos filtrados
  const legendInfo = useMemo(() => {
    const sumas = {};
    tipos.forEach(tipo => sumas[tipo] = 0);
    filteredData.forEach(inc => {
      sumas[inc.type] += 1;
    });
    const total = Object.values(sumas).reduce((acc, val) => acc + val, 0);
    return tipos.map(tipo => ({
      name: tipo,
      acr: TIPO_ACRONIMOS[tipo] || tipo,
      value: sumas[tipo],
      percent: total ? ((sumas[tipo] / total) * 100).toFixed(1) : 0,
    })).filter(entry => entry.value > 0);
  }, [filteredData]);

  const total = legendInfo.reduce((acc, curr) => acc + curr.value, 0);
  const xValues = view === "mensual"
    ? Array.from(new Set(filteredData.map(inc => getMonth(inc.creation_date))))
        .sort((a, b) => a.localeCompare(b))
    : Array.from(new Set(filteredData.map(inc => getYear(inc.creation_date))))
        .sort((a, b) => a - b);

  return (
    <div className="w-full mx-auto">
      {/* <h2 className="text-2xl font-bold mb-6 text-center">
        Incidencias individuales ({view === "mensual" ? "mensual" : "anual"})
      </h2> */}
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-5 justify-center items-center">
        <select
          className="rounded border px-3 py-1 w-38"
          value={view}
          onChange={e => setView(e.target.value)}
        >
          <option value="mensual">Todos los meses</option>
          <option value="anual">Enero</option>
          <option>Febrero</option>
          <option>Marzo</option>
          <option>Abril</option>
          <option>Mayo</option>
          <option>Junio</option>
          <option>Julio</option>
          <option>Agosto</option>
          <option>Septiembre</option>
          <option>Octubre</option>
          <option>Noviembre</option>
          <option>Diciembre</option>
        </select>
        
        <select
          className="rounded border px-3 py-1 w-39"
          value={filtroAnio}
          onChange={e => setFiltroAnio(e.target.value)}
        >
          <option value="">Todos los años</option>
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select
          className="rounded border px-3 py-1 w-80"
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          {tipos.map(tipo => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded shadow p-4 flex flex-col items-center justify-center">
        {scatterData.length === 0 || legendInfo.length === 0 ? (
          <div className="text-gray-500">No hay datos para mostrar.</div>
        ) : (
          <>
            <div style={{ width: "100%", height: 380 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 5, right: 5, bottom: 20, left: 0 }}
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
            <button 
                onClick={() => setLeyend(prev => !prev)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border transition ${
                  leyend ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {leyend ? 'Ocultar leyenda' : 'Ver leyenda'}
              </button>
            <div className="flex justify-center mt-5">
              {leyend && (
                <div>
                  <table className="table-auto border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Siglas</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Significado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datos.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">{item.siglas}</td>
                          <td className="border border-gray-300 px-4 py-2">{item.significado}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Legend Tailwind */}
            <div className="mt-6 w-full flex flex-wrap justify-center gap-4">
              {legendInfo.map((entry) => (
                <div
                  key={entry.name}
                  className="flex items-center bg-gray-50 rounded-md px-3 py-1 shadow-sm"
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
