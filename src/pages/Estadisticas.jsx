import React,{useState,useEffect}  from 'react'
import AgentEstadistic from '../components/AgentEstadistic'
import { getUserInfo } from '../funcs/Incidents';

function Estadisticas() {
  const [userinfo, setUserInfo] = useState([]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const data = await getUserInfo(localStorage.getItem('username'));
      setUserInfo(data.data);
    };
    fetchUserInfo();
  }, []);
console.log("userinfo", userinfo);

  return (
    <div>
      <AgentEstadistic data={userinfo} />
    </div>
  )
}

export default Estadisticas