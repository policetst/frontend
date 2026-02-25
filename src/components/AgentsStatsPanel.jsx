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
const getMonthNum = dateStr => (new Date(dateStr)).getMonth() + 1;

function AgentsStatsPanel({ incidents }) {
  const [allUsers, setAllUsers] = useState([]);
  const [filtroAnio, setFiltroAnio] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

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

  // Años disponibles — forzamos el año actual siempre presente
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const fromData = Array.from(new Set(incidents.map(inc => getYear(inc.creation_date)).filter(Boolean)));
    if (!fromData.includes(currentYear)) fromData.push(currentYear);
    return fromData.sort((a, b) => a - b);
  }, [incidents]);

  // Todos los tipos únicos
  const tiposUnicos = useMemo(() => {
    const set = new Set(incidents.map(inc => inc.type));
    return Array.from(set);
  }, [incidents]);

  // Incidencias filtradas por año, mes y tipo
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const matchAnio = !filtroAnio || getYear(inc.creation_date) === Number(filtroAnio);
      const matchMes = !filtroMes || getMonthNum(inc.creation_date) === Number(filtroMes);
      const matchTipo = !filtroTipo || inc.type === filtroTipo;
      return matchAnio && matchMes && matchTipo;
    });
  }, [incidents, filtroAnio, filtroMes, filtroTipo]);

  // Estadísticas por agente (con las incidencias ya filtradas)
  const agentStats = useMemo(() => {
    const stats = {};

    // Inicializar para todos los usuarios
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

    // Procesar incidencias filtradas
    filteredIncidents.forEach(inc => {
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

    return Object.entries(stats)
      .map(([code, st]) => ({ code, name: st.fullName, ...st }))
      .sort((a, b) => {
        if (b.creadas !== a.creadas) return b.creadas - a.creadas;
        return a.name.localeCompare(b.name);
      });
  }, [filteredIncidents, allUsers]);

  // El total real es el número de incidencias (no la suma de participaciones, que doble-cuenta)
  const totalIncidencias = filteredIncidents.length;
  const totalCerradas = agentStats.reduce((acc, ag) => acc + ag.cerradas, 0);

  const hasActiveFilters = filtroAnio || filtroMes || filtroTipo;

  return (
    <div className="mt-10 w-full mx-auto px-2 sm:px-4">
      <h3 className="text-lg sm:text-xl font-bold mb-4">Estadísticas por agente</h3>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        {/* Filtro de año */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium ml-1">Año</label>
          <select
            className="rounded border px-3 py-1.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={filtroAnio}
            onChange={e => {
              setFiltroAnio(e.target.value);
              if (!e.target.value) setFiltroMes("");
            }}
          >
            <option value="">Todos los años</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Filtro de mes */}
        <div className="flex flex-col gap-1">
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
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium ml-1">Tipo de incidencia</label>
          <select
            className="rounded border px-3 py-1.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {tiposUnicos.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        {/* Limpiar filtros */}
        {hasActiveFilters && (
          <div className="flex flex-col gap-1">
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

      {/* Tags de filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-3">
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

      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300 bg-white text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-1 sm:px-3 py-2 text-left font-semibold text-gray-900">#</th>
                  <th className="px-1 sm:px-3 py-2 text-left font-semibold text-gray-900 min-w-[120px]">Agente</th>
                  <th className="px-1 sm:px-3 py-2 text-center font-semibold text-gray-900">Código</th>
                  <th className="px-1 sm:px-3 py-2 text-center font-semibold text-gray-900" title="Incidencias en las que participó (como creador o compañero)">Particip.</th>
                  <th className="px-1 sm:px-3 py-2 text-center font-semibold text-gray-900 hidden sm:table-cell" title="Porcentaje sobre el total de incidencias">%</th>
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
                        {totalIncidencias > 0 ? ((ag.creadas / totalIncidencias) * 100).toFixed(1) : 0}%
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
          Total agentes activos: <span className="font-bold">{agentStats.filter(ag => ag.creadas > 0).length}</span>
        </div>
        <div className="sm:inline sm:ml-4">
          Total incidencias: <span className="font-bold">{totalIncidencias}</span>
        </div>
        <div className="sm:inline sm:ml-4">
          Cerradas: <span className="font-bold">{totalCerradas}</span>
        </div>
      </div>
    </div>
  );
}

export default AgentsStatsPanel;