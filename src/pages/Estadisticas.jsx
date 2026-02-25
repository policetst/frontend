import React, { useState, useEffect } from 'react'
import AgentEstadistic from '../components/AgentEstadistic'
import AgentsStatsPanel from '../components/AgentsStatsPanel'
import { getIncidents } from '../funcs/Incidents';

function SectionHeader({ icon, title, subtitle, color = "blue" }) {
  const colors = {
    blue:   { bar: "bg-blue-500",   icon: "bg-blue-100 text-blue-600",   title: "text-blue-700" },
    purple: { bar: "bg-purple-500", icon: "bg-purple-100 text-purple-600", title: "text-purple-700" },
  };
  const c = colors[color];
  return (
    <div className={`flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm mb-5`}>
      <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${c.bar}`} />
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${c.icon}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <h2 className={`text-base font-bold leading-tight ${c.title}`}>{title}</h2>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function Estadisticas() {
  document.title = "SIL Tauste - Estadísticas";
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncidents = async () => {
      const inc = await getIncidents();
      setIncidents(inc.incidents || []);
      setLoading(false);
    };
    fetchIncidents();
  }, []);

  return (
    <div className="flex justify-center">
      <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] text-gray-800 pb-12">

        {/* ── Cabecera de página ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Estadísticas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Consulta y analiza el registro de incidencias por agente, tipo y período.
          </p>
          <hr className="border-t border-gray-200 mt-4" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 text-sm gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Cargando datos…
          </div>
        ) : (
          <>
            {/* ══ SECCIÓN 1: MIS ESTADÍSTICAS ══ */}
            <section className="mb-12">
              <SectionHeader
                icon="📊"
                color="blue"
                title="Mis estadísticas"
                subtitle="Incidencias registradas por ti, agrupadas por mes o día. Filtra por año, mes y tipo."
              />
              <AgentEstadistic data={incidents} user_code={localStorage.getItem('username')} />
            </section>

            {/* Divisor */}
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dashed border-gray-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gray-50 px-3 text-xs text-gray-400 font-medium">Panel global</span>
              </div>
            </div>

            {/* ══ SECCIÓN 2: ESTADÍSTICAS GLOBALES ══ */}
            <section>
              <SectionHeader
                icon="👥"
                color="purple"
                title="Estadísticas por agente"
                subtitle="Participación, incidencias creadas y cerradas de todos los agentes del sistema."
              />
              <AgentsStatsPanel incidents={incidents} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default Estadisticas