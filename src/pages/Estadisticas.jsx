import React,{useState,useEffect}  from 'react'
import AgentEstadistic from '../components/AgentEstadistic'
import AgentsStatsPanel from '../components/AgentsStatsPanel'
import { getUserInfo, getIncidents } from '../funcs/Incidents';

function Estadisticas() {
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
      <AgentEstadistic data={userinfo} />
      <AgentsStatsPanel incidents={incidents} />
    </div>
  )
}

export default Estadisticas