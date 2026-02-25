import React, { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
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

const tipos = [
  "Seguridad Ciudadana",
  "Trafico",
  "Animales",
  "Ruidos",
  "Asistencia Colaboración Ciudadana",
  "Ilícito penal",
  "Incidencias Urbanísticas",
  "Juzgados",
  "Otras incidencias no clasificadas"
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

// Parseo seguro sin new Date() para evitar timezone en Render/UTC
const getYear    = d => d ? parseInt(d.substring(0, 4), 10) : null;
const getMonthNum = d => d ? parseInt(d.substring(5, 7), 10) : null;
const getMonthKey = d => d ? d.substring(0, 7) : ""; // "YYYY-MM"
const getDayKey   = d => d ? d.substring(0, 10) : ""; // "YYYY-MM-DD"

const NOMBRES_MES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const formatMonthLabel = (key) => {
  // key = "YYYY-MM"
  const m = parseInt(key.substring(5, 7), 10) - 1;
  const y = key.substring(2, 4);
  return `${NOMBRES_MES[m]} '${y}`;
};

const formatDayLabel = (key) => {
  // key = "YYYY-MM-DD" → "15 Feb"
  const d = key.substring(8, 10);
  const m = parseInt(key.substring(5, 7), 10) - 1;
  return `${parseInt(d)} ${NOMBRES_MES[m]}`;
};

// Tooltip personalizado para el BarChart
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const total = payload.reduce((acc, p) => acc + (p.value || 0), 0);
  return (
    <div className="bg-white border border-gray-200 rounded shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.filter(p => p.value > 0).map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: p.fill }} />
          <span className="text-gray-600">{TIPO_ACRONIMOS[p.dataKey] || p.dataKey}:</span>
          <span className="font-medium">{p.value}</span>
        </div>
      ))}
      <div className="border-t border-gray-200 mt-2 pt-1 font-semibold text-gray-800">
        Total: {total}
      </div>
    </div>
  );
};

function AgentEstadistic({ data, user_code }) {
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroAnio, setFiltroAnio] = useState("");

  // Solo incidencias del usuario actual
  const userIncidents = useMemo(() => {
    const norm = user_code ? user_code.trim().toUpperCase() : "";
    return data.filter(inc =>
      (inc.creator_user_code && inc.creator_user_code.trim().toUpperCase() === norm) ||
      (inc.team_mate && inc.team_mate.trim().toUpperCase() === norm)
    );
  }, [data, user_code]);

  const years = useMemo(() => {
    const fromData = Array.from(new Set(userIncidents.map(inc => getYear(inc.creation_date)).filter(Boolean)));
    return fromData.sort((a, b) => a - b);
  }, [userIncidents]);

  // Filtrado
  const filteredData = useMemo(() => {
    return userIncidents.filter(inc => {
      const matchTipo = !filtroTipo || inc.type === filtroTipo;
      const matchAnio = !filtroAnio || getYear(inc.creation_date) === Number(filtroAnio);
      const matchMes  = !filtroMes  || getMonthNum(inc.creation_date) === Number(filtroMes);
      return matchTipo && matchAnio && matchMes;
    });
  }, [userIncidents, filtroTipo, filtroAnio, filtroMes]);

  // Vista: si hay año+mes => agrupar por día; si solo año => por mes; si nada => por mes
  const view = (filtroAnio && filtroMes) ? "diario" : "mensual";

  // Agrupar datos para el BarChart apilado
  // Formato: [ { label: "Ene '25", key: "2025-01", SC: 3, TRF: 1, ... }, ... ]
  const chartData = useMemo(() => {
    const groups = {};
    filteredData.forEach(inc => {
      const key  = view === "diario" ? getDayKey(inc.creation_date) : getMonthKey(inc.creation_date);
      const tipo = inc.type || "default";
      if (!groups[key]) groups[key] = { key };
      groups[key][tipo] = (groups[key][tipo] || 0) + 1;
    });

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, vals]) => ({
        ...vals,
        label: view === "diario" ? formatDayLabel(key) : formatMonthLabel(key),
      }));
  }, [filteredData, view]);

  // Tipos que realmente aparecen en los datos filtrados (para no dibujar barras vacías)
  const tiposActivos = useMemo(() => {
    if (filtroTipo) return [filtroTipo];
    const set = new Set(filteredData.map(inc => inc.type).filter(Boolean));
    return tipos.filter(t => set.has(t));
  }, [filteredData, filtroTipo]);

  // Resumen por tipo
  const legendInfo = useMemo(() => {
    const sumas = {};
    filteredData.forEach(inc => {
      if (inc.type) sumas[inc.type] = (sumas[inc.type] || 0) + 1;
    });
    const total = Object.values(sumas).reduce((a, v) => a + v, 0);
    return tiposActivos.map(tipo => ({
      name: tipo,
      acr: TIPO_ACRONIMOS[tipo] || tipo,
      value: sumas[tipo] || 0,
      percent: total ? ((sumas[tipo] || 0) / total * 100).toFixed(1) : "0.0",
    }));
  }, [filteredData, tiposActivos]);

  const total = legendInfo.reduce((acc, e) => acc + e.value, 0);
  const hasActiveFilters = filtroTipo || filtroAnio || filtroMes;

  return (
    <div className="w-full mx-auto">

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-5 justify-center items-end">

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium ml-1">Año</label>
          <select
            className="rounded border px-3 py-1.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={filtroAnio}
            onChange={e => { setFiltroAnio(e.target.value); if (!e.target.value) setFiltroMes(""); }}
          >
            <option value="">Todos los años</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium ml-1">Mes</label>
          <select
            className={`rounded border px-3 py-1.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${!filtroAnio ? "opacity-50 cursor-not-allowed" : ""}`}
            value={filtroMes}
            onChange={e => setFiltroMes(e.target.value)}
            disabled={!filtroAnio}
          >
            {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium ml-1">Tipo</label>
          <select
            className="rounded border px-3 py-1.5 text-sm bg-white shadow-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {tipos.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => { setFiltroAnio(""); setFiltroMes(""); setFiltroTipo(""); }}
            className="rounded border px-3 py-1.5 text-sm bg-red-50 text-red-600 border-red-200 hover:bg-red-100 transition shadow-sm"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tags de filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-3 justify-center">
          {filtroAnio && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">Año: {filtroAnio}</span>}
          {filtroMes  && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">Mes: {MESES.find(m => m.value === filtroMes)?.label}</span>}
          {filtroTipo && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">Tipo: {TIPO_ACRONIMOS[filtroTipo] || filtroTipo}</span>}
        </div>
      )}

      {/* Gráfico */}
      <div className="bg-white rounded shadow p-4">
        {chartData.length === 0 ? (
          <div className="text-gray-500 py-10 text-center">
            {userIncidents.length === 0
              ? "No tienes incidencias registradas."
              : "No hay datos para los filtros seleccionados."}
          </div>
        ) : (
          <>
            <div style={{ width: "100%", height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 20, bottom: 50, left: 0 }}
                  barCategoryGap="30%"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    angle={chartData.length > 8 ? -45 : 0}
                    textAnchor={chartData.length > 8 ? "end" : "middle"}
                    height={chartData.length > 8 ? 60 : 30}
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    width={30}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {tiposActivos.map(tipo => (
                    <Bar
                      key={tipo}
                      dataKey={tipo}
                      stackId="a"
                      fill={COLORS[tipo] || COLORS.default}
                      name={TIPO_ACRONIMOS[tipo] || tipo}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Leyenda de colores */}
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {legendInfo.map(entry => (
                <div key={entry.name} className="flex items-center gap-1.5 bg-gray-50 rounded px-2 py-1 text-sm shadow-sm">
                  <span className="w-3 h-3 rounded-full inline-block flex-shrink-0"
                    style={{ backgroundColor: COLORS[entry.name] || COLORS.default }} />
                  <span className="font-medium text-gray-700">{entry.acr}</span>
                  <span className="text-gray-400 text-xs">({entry.value} · {entry.percent}%)</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Total */}
      {total > 0 && (
        <div className="mt-3 text-center text-gray-600 font-semibold text-sm">
          Total incidencias: <span className="text-blue-700">{total}</span>
        </div>
      )}
    </div>
  );
}

export default AgentEstadistic;
