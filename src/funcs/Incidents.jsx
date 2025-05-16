import axios from 'axios';
import Swal from 'sweetalert2';

const POST_URL = 'http://localhost:4000/incidents';

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
    const res = await axios.post(POST_URL, incident);
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


export { getLocation, postIncident };
