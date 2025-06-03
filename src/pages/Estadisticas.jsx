import React,{useState,useEffect}  from 'react'
import AgentEstadistic from '../components/AgentEstadistic'
import AgentsStatsPanel from '../components/AgentsStatsPanel'
import { getUserInfo, getIncidents } from '../funcs/Incidents';

function Estadisticas() {
  document.title = "SIL Tauste - Estadisticas"
  const [userinfo, setUserInfo] = useState([]);
  document.title = "SIL Tauste - Estadísticas";
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const data = await getUserInfo(localStorage.getItem('username'));
      setUserInfo(data.data);
    };
    const fetchIncidents = async () => {
      const inc = await getIncidents();
      setIncidents(inc.incidents || []);
    };
    fetchUserInfo();
    fetchIncidents();
  }, []);
console.log("userinfo", userinfo);
console.log("incidents", incidents);

  return (
    <div>
      <div className="flex justify-center">
        <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] space-y-8 text-gray-800">

          {/* Titulo en escritorio o tablet */}
          <div className="hidden xl:block">
            <h2 className="text-2xl font-bold">Estadisticas</h2>
            <hr className="border-t border-gray-300 my-4"/>
          </div>
          {/* Titulo en móviles */}
          <div className="block xl:hidden">
            <h2 className="text-2xl font-bold flex justify-center">Estadisticas</h2>
            <hr className="border-t border-gray-300 my-4"/>
          </div>

          <div>
            <AgentEstadistic data={userinfo} />
          </div>
        </div>
      </div>
      <AgentEstadistic data={userinfo} />
      <AgentsStatsPanel incidents={incidents} />
    </div>
    
  )
}

export default Estadisticas