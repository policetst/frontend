import {getTokenFromCookie} from "./Incidents.jsx";

import axios from "axios";

//* get config for email
const getEmailConfig = async () => {
  try {
    const token = getTokenFromCookie();
    const res = await axios.get(`https://arbadev-back-joq0.onrender.com/config/email`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching email config:", error);
    return null;
  }
}
//* update config for email
const updateEmailConfig = async (config) => {
  try {
    const token = getTokenFromCookie();
    const res = await axios.put(`/config/email`, config, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.message;
  } catch (error) {
    console.error("Error updating email config:", error);
    return null;
  }
}


export {
  getEmailConfig,
  updateEmailConfig
};