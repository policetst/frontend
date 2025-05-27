import React, {useState,useEffect} from 'react'

import { getUsers } from '../funcs/Incidents';

function AgentEstadistic() {
  useEffect(() => {
    const users = getUsers();
    console.log(users);
  }, []);

  return (
    <div>AgentEstadistic</div>
  )
}

export default AgentEstadistic