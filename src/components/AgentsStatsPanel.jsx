import React, { useMemo, useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
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

// Parseo seguro sin new Date() para evitar problemas de timezone (UTC vs local)
const getYear     = d => d ? parseInt(d.substring(0, 4), 10) : null;
const getMonthNum = d => d ? parseInt(d.substring(5, 7), 10) : null;

// Mini badge de número con color
function StatBadge({ value, color = "blue" }) {
  const colors = {
    blue:   "bg-blue-100 text-blue-800",
    green:  "bg-green-100 text-green-800",
    orange: "bg-orange-100 text-orange-800",
    gray:   "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${colors[color]}`}>
      {value}
    </span>
  );
}

function AgentsStatsPanel({ incidents }) {
  const [allUsers, setAllUsers] = useState([]);
  const [filtroAnio, setFiltroAnio] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

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

  const years = useMemo(() => {
    return Array.from(new Set(incidents.map(inc => getYear(inc.creation_date)).filter(Boolean)))
      .sort((a, b) => a - b);
  }, [incidents]);

  const tiposUnicos = useMemo(() => {
    const set = new Set(incidents.map(inc => inc.type).filter(Boolean));
    return Array.from(set);
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const matchAnio = !filtroAnio || getYear(inc.creation_date) === Number(filtroAnio);
      const matchMes  = !filtroMes  || getMonthNum(inc.creation_date) === Number(filtroMes);
      const matchTipo = !filtroTipo || inc.type === filtroTipo;
      return matchAnio && matchMes && matchTipo;
    });
  }, [incidents, filtroAnio, filtroMes, filtroTipo]);

  // Estadísticas por agente
  // - creadas:       incidencias donde es el creator_user_code
  // - participadas:  incidencias donde es creator_user_code O team_mate
  // - cerradas:      incidencias donde es el closure_user_code
  const agentStats = useMemo(() => {
    const stats = {};

    // Inicializar todos los usuarios del sistema
    allUsers.forEach(user => {
      const userCode = user.user_code || user.code || user.username;
      if (userCode) {
        stats[userCode] = {
          creadas: 0,
          participadas: 0,
          cerradas: 0,
          conBrigada: 0,
          tipos: {},
          fullName: `${user.first_name || ''} ${user.last_name1 || ''} ${user.last_name2 || ''}`.trim() || userCode
        };
      }
    });

    filteredIncidents.forEach(inc => {
      const creator = inc.creator_user_code;
      const teamMate = inc.team_mate;
      const closer = inc.closure_user_code;

      // Creador
      if (creator) {
        if (!stats[creator]) {
          stats[creator] = { creadas: 0, participadas: 0, cerradas: 0, conBrigada: 0, tipos: {}, fullName: creator };
        }
        stats[creator].creadas += 1;
        stats[creator].participadas += 1;
        stats[creator].tipos[inc.type] = (stats[creator].tipos[inc.type] || 0) + 1;
        if (inc.brigade_field) stats[creator].conBrigada += 1;
      }

      // Acompañante (solo suma participadas, no creadas)
      if (teamMate && teamMate !== creator) {
        if (!stats[teamMate]) {
          stats[teamMate] = { creadas: 0, participadas: 0, cerradas: 0, conBrigada: 0, tipos: {}, fullName: teamMate };
        }
        stats[teamMate].participadas += 1;
        stats[teamMate].tipos[inc.type] = (stats[teamMate].tipos[inc.type] || 0) + 1;
        if (inc.brigade_field) stats[teamMate].conBrigada += 1;
      }

      // Cerrador
      if (closer) {
        if (!stats[closer]) {
          stats[closer] = { creadas: 0, participadas: 0, cerradas: 0, conBrigada: 0, tipos: {}, fullName: closer };
        }
        stats[closer].cerradas += 1;
      }
    });

    return Object.entries(stats)
      .map(([code, st]) => ({ code, ...st }))
      .filter(ag => ag.creadas > 0 || ag.participadas > 0 || ag.cerradas > 0)
      .sort((a, b) => {
        if (b.creadas !== a.creadas) return b.creadas - a.creadas;
        return (a.fullName || a.code).localeCompare(b.fullName || b.code);
      });
  }, [filteredIncidents, allUsers]);

  const totalIncidencias = filteredIncidents.length;
  const totalCreadas     = agentStats.reduce((acc, ag) => acc + ag.creadas, 0);
  const totalCerradas    = agentStats.reduce((acc, ag) => acc + ag.cerradas, 0);
  const totalBrigada     = agentStats.reduce((acc, ag) => acc + ag.conBrigada, 0);
  const agentesActivos   = agentStats.filter(ag => ag.creadas > 0).length;

  // Datos para el donut de tipos
  const TIPO_COLORS = [
    "#3b82f6", "#f59e0b", "#ef4444", "#10b981",
    "#8b5cf6", "#06b6d4", "#f97316", "#ec4899", "#6366f1"
  ];

  const tiposData = useMemo(() => {
    const counts = {};
    filteredIncidents.forEach(inc => {
      const tipo = inc.type || "Sin tipo";
      counts[tipo] = (counts[tipo] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, acr: TIPO_ACRONIMOS[name] || name }))
      .sort((a, b) => b.value - a.value);
  }, [filteredIncidents]);

  const topTipo = tiposData[0] || null;

  const hasActiveFilters = filtroAnio || filtroMes || filtroTipo;

  return (
    <div className="mt-10 w-full mx-auto px-2 sm:px-0">
      <h3 className="text-lg sm:text-xl font-bold mb-5">Estadísticas por agente</h3>

      {/* ── Filtros ── */}
      <div className="flex flex-wrap gap-3 mb-5 items-end">
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
          <label className="text-xs text-gray-500 font-medium ml-1">Tipo de incidencia</label>
          <select
            className="rounded border px-3 py-1.5 text-sm bg-white shadow-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {tiposUnicos.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-transparent">.</label>
            <button
              onClick={() => { setFiltroAnio(""); setFiltroMes(""); setFiltroTipo(""); }}
              className="rounded border px-3 py-1.5 text-sm bg-red-50 text-red-600 border-red-200 hover:bg-red-100 transition shadow-sm"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Tags de filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filtroAnio && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">Año: {filtroAnio}</span>}
          {filtroMes  && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">Mes: {MESES.find(m => m.value === filtroMes)?.label}</span>}
          {filtroTipo && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">Tipo: {TIPO_ACRONIMOS[filtroTipo] || filtroTipo}</span>}
        </div>
      )}

      {/* ── Tarjetas resumen ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total incidencias", value: totalIncidencias, color: "border-blue-200 bg-blue-50",      text: "text-blue-700" },
          { label: "Cerradas",          value: totalCerradas,    color: "border-green-200 bg-green-50",    text: "text-green-700" },
          { label: "Con brigada",       value: totalBrigada,     color: "border-orange-200 bg-orange-50",  text: "text-orange-700" },
        ].map(card => (
          <div key={card.label} className={`rounded-xl border p-3 text-center ${card.color}`}>
            <p className={`text-2xl font-bold ${card.text}`}>{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* ── Gráfico de tipos ── */}
      {tiposData.length > 0 && (
        <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h4 className="text-sm font-semibold text-gray-600 mb-4">Distribución por tipo de incidencia</h4>
          <div className="flex flex-col sm:flex-row items-center gap-6">

            {/* Donut */}
            <div className="relative flex-shrink-0" style={{ width: 200, height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tiposData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={tiposData.length > 1 ? 2 : 0}
                    dataKey="value"
                    strokeWidth={1}
                  >
                    {tiposData.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={TIPO_COLORS[i % TIPO_COLORS.length]}
                        opacity={i === 0 ? 1 : 0.75}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} (${totalIncidencias > 0 ? ((value / totalIncidencias) * 100).toFixed(1) : 0}%)`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Centro del donut */}
              {topTipo && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-gray-800">
                    {totalIncidencias > 0 ? ((topTipo.value / totalIncidencias) * 100).toFixed(0) : 0}%
                  </span>
                  <span className="text-xs text-gray-500 font-medium text-center leading-tight mt-0.5 px-2">
                    {topTipo.acr}
                  </span>
                </div>
              )}
            </div>

            {/* Leyenda */}
            <div className="flex-1 w-full space-y-2">
              {tiposData.map((entry, i) => {
                const pct = totalIncidencias > 0 ? ((entry.value / totalIncidencias) * 100) : 0;
                const color = TIPO_COLORS[i % TIPO_COLORS.length];
                const isTop = i === 0;
                return (
                  <div key={entry.name} className={`p-2 rounded-lg ${isTop ? "bg-gray-50 border border-gray-200" : ""}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className={`text-xs truncate ${isTop ? "font-semibold text-gray-800" : "text-gray-600"}`}>
                          {entry.name}
                        </span>
                        {isTop && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                            #1
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-xs font-bold text-gray-700">{entry.value}</span>
                        <span className="text-xs text-gray-400 w-10 text-right">{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    {/* Barra de progreso */}
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Tabla ── */}
      {agentStats.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-white rounded-xl border">
          No hay datos para los filtros seleccionados.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full bg-white text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">#</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Agente</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <span title="Incidencias registradas como creador">Creadas</span>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                  <span title="Incidencias donde participó (creador + acompañante)">Particip.</span>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <span title="Incidencias cerradas por el agente">Cerradas</span>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                  <span title="Incidencias con intervención de brigada">Brigada</span>
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                  <span title="% de incidencias en las que participó el agente (como creador o acompañante)">% Particip.</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {agentStats.map((ag, idx) => {
                const pct = totalIncidencias > 0 ? ((ag.participadas / totalIncidencias) * 100).toFixed(1) : "0.0";
                const isTop = idx === 0 && ag.creadas > 0;
                return (
                  <tr
                    key={ag.code}
                    className={`hover:bg-gray-50 transition-colors ${isTop ? "bg-blue-50" : ""}`}
                  >
                    {/* # */}
                    <td className="px-3 py-3 text-gray-400 text-xs font-medium">{idx + 1}</td>

                    {/* Agente */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${isTop ? "bg-blue-500" : "bg-gray-400"}`}>
                          {(ag.fullName || ag.code).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 leading-tight">{ag.fullName || ag.code}</p>
                          <p className="text-xs text-gray-400">{ag.code}</p>
                        </div>
                        {isTop && (
                          <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium hidden sm:inline">
                            #1
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Creadas */}
                    <td className="px-3 py-3 text-center">
                      <StatBadge value={ag.creadas} color={ag.creadas > 0 ? "blue" : "gray"} />
                    </td>

                    {/* Participadas */}
                    <td className="px-3 py-3 text-center hidden sm:table-cell">
                      <StatBadge value={ag.participadas} color={ag.participadas > 0 ? "orange" : "gray"} />
                    </td>

                    {/* Cerradas */}
                    <td className="px-3 py-3 text-center">
                      <StatBadge value={ag.cerradas} color={ag.cerradas > 0 ? "green" : "gray"} />
                    </td>

                    {/* Brigada */}
                    <td className="px-3 py-3 text-center hidden md:table-cell">
                      <StatBadge value={ag.conBrigada} color={ag.conBrigada > 0 ? "orange" : "gray"} />
                    </td>

                    {/* % Total */}
                    <td className="px-3 py-3 text-center hidden sm:table-cell">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 hidden lg:block">
                          <div
                            className="bg-blue-400 h-1.5 rounded-full"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 font-medium">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Leyenda de columnas */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
        <span><span className="font-medium text-blue-600">Creadas:</span> incidencias donde el agente es el redactor</span>
        <span className="hidden sm:inline"><span className="font-medium text-orange-500">Particip.:</span> incluye también cuando actúa como acompañante</span>
        <span><span className="font-medium text-green-600">Cerradas:</span> incidencias que el agente ha cerrado</span>
      </div>

      {/* Pie */}
      <div className="mt-4 text-right text-gray-400 text-xs">
        {agentesActivos} agente{agentesActivos !== 1 ? "s" : ""} con actividad · {totalIncidencias} incidencia{totalIncidencias !== 1 ? "s" : ""} en el período
      </div>
    </div>
  );
}

export default AgentsStatsPanel;