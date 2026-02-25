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
  "Juzgados": "#9C27B0",
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
  "Ilícito penal": "ILP",
  "Juzgados": "JUZ"
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
  "Juzgados",
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
  { siglas: 'JUZ', significado: 'Juzgados' },
];

const MESES = [
  { value: "", label: "Todos los meses" },
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

const getYear = dateStr => (new Date(dateStr)).getFullYear();
const getMonth = dateStr => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const getMonthNum = dateStr => (new Date(dateStr)).getMonth() + 1;

function AgentEstadistic({ data, user_code }) {
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroAnio, setFiltroAnio] = useState("");
  const [leyend, setLeyend] = useState(false);

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

  // DATOS FILTRADOS por tipo, año y mes
  const filteredData = useMemo(() => {
    return userIncidents.filter(inc => {
      const matchTipo = !filtroTipo || inc.type === filtroTipo;
      const matchAnio = !filtroAnio || getYear(inc.creation_date) === Number(filtroAnio);
      const matchMes = !filtroMes || getMonthNum(inc.creation_date) === Number(filtroMes);
      return matchTipo && matchAnio && matchMes;
    });
  }, [userIncidents, filtroTipo, filtroAnio, filtroMes]);

  // Vista del eje X: si hay mes seleccionado => mostrar días, si año => meses, si nada => meses
  const view = filtroMes && filtroAnio ? "diario" : (filtroAnio ? "mensual" : "mensual-global");

  // Preparar datos para ScatterChart con los datos filtrados
  const scatterData = useMemo(() => {
    return filteredData.map(inc => {
      let x;
      if (view === "diario") {
        const d = new Date(inc.creation_date);
        x = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      } else {
        x = getMonth(inc.creation_date);
      }
      return {
        x,
        y: tipoToY[inc.type],
        type: inc.type,
        fecha: inc.creation_date,
      };
    });
  }, [filteredData, view, tipoToY]);

  // Legend: cuántos de cada tipo en los datos filtrados
  const legendInfo = useMemo(() => {
    const sumas = {};
    tipos.forEach(tipo => sumas[tipo] = 0);
    filteredData.forEach(inc => {
      if (sumas[inc.type] !== undefined) {
        sumas[inc.type] += 1;
      }
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

  const xValues = Array.from(new Set(scatterData.map(d => d.x))).sort((a, b) => {
    if (view === "diario") return a.localeCompare(b);
    return a.localeCompare(b);
  });

  const hasActiveFilters = filtroTipo || filtroAnio || filtroMes;

  return (
    <div className="w-full mx-auto">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-5 justify-center items-center">
        {/* Filtro de año */}
        <div className="flex flex-col items-start gap-1">
          <label className="text-xs text-gray-500 font-medium ml-1">Año</label>
          <select
            className="rounded border px-3 py-1.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={filtroAnio}
            onChange={e => {
              setFiltroAnio(e.target.value);
              // Si quitamos el año, quitamos el mes también
              if (!e.target.value) setFiltroMes("");
            }}
          >
            <option value="">Todos los años</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Filtro de mes (solo si hay año seleccionado) */}
        <div className="flex flex-col items-start gap-1">
          <label className="text-xs text-gray-500 font-medium ml-1">Mes</label>
          <select
            className={`rounded border px-3 py-1.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${!filtroAnio ? "opacity-50 cursor-not-allowed" : ""}`}
            value={filtroMes}
            onChange={e => setFiltroMes(e.target.value)}
            disabled={!filtroAnio}
          >
            {MESES.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Filtro de tipo */}
        <div className="flex flex-col items-start gap-1">
          <label className="text-xs text-gray-500 font-medium ml-1">Tipo de incidencia</label>
          <select
            className="rounded border px-3 py-1.5 text-sm bg-white shadow-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {tipos.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        {/* Botón limpiar filtros */}
        {hasActiveFilters && (
          <div className="flex flex-col items-start gap-1">
            <label className="text-xs text-transparent font-medium ml-1">.</label>
            <button
              onClick={() => { setFiltroAnio(""); setFiltroMes(""); setFiltroTipo(""); }}
              className="rounded border px-3 py-1.5 text-sm bg-red-50 text-red-600 border-red-200 hover:bg-red-100 transition shadow-sm"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Resumen de filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-3 justify-center">
          {filtroAnio && (
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
              Año: {filtroAnio}
            </span>
          )}
          {filtroMes && (
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
              Mes: {MESES.find(m => m.value === filtroMes)?.label}
            </span>
          )}
          {filtroTipo && (
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
              Tipo: {TIPO_ACRONIMOS[filtroTipo] || filtroTipo}
            </span>
          )}
        </div>
      )}

      <div className="bg-white rounded shadow p-4 flex flex-col items-center justify-center">
        {scatterData.length === 0 || legendInfo.length === 0 ? (
          <div className="text-gray-500 py-8">
            {userIncidents.length === 0
              ? "No tienes incidencias registradas."
              : "No hay datos para los filtros seleccionados."}
          </div>
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
                    name={view === "diario" ? "Día" : "Mes"}
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
