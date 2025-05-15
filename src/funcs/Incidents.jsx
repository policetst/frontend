import axios from 'axios';

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
    console.log("Posting incident:", incident);
    const response = await axios.post(POST_URL, incident);
    return response.data;
  } catch (error) {
    console.error("Failed to post incident:", error);
    throw error;
  }
}

export { getLocation, postIncident };
