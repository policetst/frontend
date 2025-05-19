import axios from 'axios';
import Swal from 'sweetalert2';

const INCIDENTS_URL = import.meta.env.VITE_INCIDENTS_URL || 'http://localhost:4000/incidents';

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
    const res = await axios.post(INCIDENTS_URL, incident);
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

/**
 * Function that returns the incidents
 * @returns {Promise<Object>}
 */
async function getIncidents() {
  try {
    const res = await axios.get(INCIDENTS_URL);
    console.log("Response from backend:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return { ok: false, message: 'Error al conectar con el servidor' };
  }
}

/**
 * Function to update an existing incident
 * @param {string|number} code - ID of the incident to update
 * @param {Object} incidentData - Updated incident data
 * @returns {Promise<Object>}
 */
async function updateIncident(code, incidentData) {
  try {
    const res = await axios.put(`${INCIDENTS_URL}/${code}`, incidentData);
    console.log("Response from backend:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error updating incident:", error);
    return { ok: false, message: 'Error al actualizar la incidencia' };
  }
}

/**
 * Function to get incident details including people and vehicles
 * @param {string|number} code - ID of the incident to get details for
 * @returns {Promise<Object>}
 */
async function getIncidentDetails(code) {
  try {
    const res = await axios.get(`${INCIDENTS_URL}/${code}/details`);
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
    const res = await axios.get(`${INCIDENTS_URL}/${code}/details`);
    console.log("Incident data from API:", res.data);
    
    // Check if response contains the incident data structure
    if (res.data && res.data.incident) {
      return {
        ...res.data.incident,
        people: res.data.people || [],
        vehicles: res.data.vehicles || [],
        images: res.data.images || []
      };
    } else if (res.data && !res.data.incident) {
      // Handle case where data is directly in res.data without nested structure
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

/**
 * Function to count how many people are associated with an incident
 * @param {Array} people - Array of people objects
 * @returns {number} - The count of people
 */
const countPeople = (people) => {
  if (!people || !Array.isArray(people)) return 0;
  return people.length;
};

/**
 * Function to count how many vehicles are associated with an incident
 * @param {Array} vehicles - Array of vehicle objects
 * @returns {number} - The count of vehicles
 */
const countVehicles = (vehicles) => {
  if (!vehicles || !Array.isArray(vehicles)) return 0;
  return vehicles.length;
};

export { getLocation, postIncident, getIncidents, updateIncident, getIncidentDetails, getIncident, countPeople, countVehicles };
