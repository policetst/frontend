import { useCookies } from 'react-cookie';
import axios from 'axios';
import Swal from 'sweetalert2';


const INCIDENTS_URL = import.meta.env.VITE_INCIDENTS_URL || 'http://localhost:4000/incidents';


//*Function to get the user's token from the cookie
//*Function to get the user's token from the cookie (sin hooks)
const getTokenFromCookie = () => {
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : '';
};


//* function to close an incident
const closeIncident = async (code, userCode) => {
  const token = getTokenFromCookie();
  try {
    const res = await axios.put(
      `${INCIDENTS_URL}/${code}/${userCode}/close`,
      {}, // cuerpo vacío
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error closing incident:", error);
    return { ok: false, message: 'Error al cerrar la incidencia' };
  }
};


/**
 * Function to get the token directly from document.cookie
 */

/**
 * Function to get the user's location automatically.
 * @returns {Promise<{latitude: number, longitude: number, altitude?: number}>}
 */
async function getLocation() {
  return new Promise((resolve, reject) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, altitude } = position.coords;
          resolve({ latitude, longitude, altitude });
        },
        (error) => {
          console.error("Failed to retrieve location:", error.message);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      reject(new Error("Geolocation is not supported by this browser."));
    }
  });
}

/**
 * function to post an incident to the backend
 * @param {Object} incident - object to send to the backend
 * @returns {Promise<Object>}
 */
async function postIncident(incident) {
  try {
    const token = getTokenFromCookie();
    const res = await axios.post(INCIDENTS_URL, incident, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("Response from backend:", res.data);
    const { ok, message } = res.data;

    if (ok === true) {
      Swal.fire({
        icon: 'success',
        title: 'Incidencia creada',
        text: 'La incidencia se ha creado correctamente.',
        confirmButtonText: 'Aceptar'
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message || 'Hubo un problema al crear la incidencia.',
        confirmButtonText: 'Aceptar'
      });
    }

    return res.data;
  } catch (error) {
    console.error("Error posting incident:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se ha podido crear la incidencia.',
      confirmButtonText: 'Aceptar'
    });
    return { ok: false, message: 'Error al conectar con el servidor' };
  }
}

async function getIncidents() {
  const token = getTokenFromCookie();
  try {
    const res = await axios.get(INCIDENTS_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("Response from backend:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return { ok: false, message: 'Error al conectar con el servidor' };
  }
}

async function updateIncident(code, incidentData) {
  try {
    const token = getTokenFromCookie();
    const res = await axios.put(`${INCIDENTS_URL}/${code}`, incidentData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("Response from backend:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error updating incident:", error);
    return { ok: false, message: 'Error al actualizar la incidencia' };
  }
}

async function getIncidentDetails(code) {
  try {
    const token = getTokenFromCookie();
    const res = await axios.get(`${INCIDENTS_URL}/${code}/details`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("Incident details:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error fetching incident details:", error);
    return {
      ok: false,
      message: 'Error al obtener los detalles de la incidencia',
      incident: null,
      people: [],
      vehicles: []
    };
  }
}

const getIncident = async (code) => {
  try {
    const token = getTokenFromCookie();
    const res = await axios.get(`${INCIDENTS_URL}/${code}/details`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("Incident data from API:", res.data);

    if (res.data && res.data.incident) {
      return {
        ...res.data.incident,
        people: res.data.people || [],
        vehicles: res.data.vehicles || [],
        images: res.data.images || []
      };
    } else if (res.data && !res.data.incident) {
      return {
        ...res.data,
        people: res.data.people || [],
        vehicles: res.data.vehicles || [],
        images: res.data.images || []
      };
    }

    return res.data;
  } catch (error) {
    console.error("Error fetching incident:", error);
    return {
      ok: false,
      message: 'Error al obtener los detalles de la incidencia',
      status: 'Open',
      location: '',
      type: '',
      description: '',
      brigade_field: false,
      creator_user_code: '',
      people: [],
      vehicles: [],
      images: []
    };
  }
}

const countPeople = async (code) => {
  try {
    const token = getTokenFromCookie();
    const res = await axios.get(`${INCIDENTS_URL}/${code}/peoplecount`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data.count || 0;
  } catch (error) {
    console.error("Error counting people:", error);
    return 0;
  }
};

const countVehicles = async (code) => {
  try {
    const token = getTokenFromCookie();
    const res = await axios.get(`${INCIDENTS_URL}/${code}/vehiclescount`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data.count || 0;
  } catch (error) {
    console.error("Error counting vehicles:", error);
    return 0;
  }
};

export {
  getLocation,
  postIncident,
  getIncidents,
  updateIncident,
  getIncidentDetails,
  getIncident,
  countPeople,
  countVehicles,
  closeIncident,
  getTokenFromCookie
};
