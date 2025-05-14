import axios from 'axios';



const POST_URL = 'http://localhost:4000/incidents';



/*Function that returns the user's current geographic location (latitude, longitude, and optionally altitude). 

 * @returns {Promise<{latitude: number, longitude: number, altitude?: number}>} - A promise that resolves to an object containing the user's location
*/


async function getLocation() {
  return new Promise((resolve, reject) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        /**
         * Success callback for geolocation.
         * @param {GeolocationPosition} position - The position object returned by the browser.
         */
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const altitude = position.coords.altitude; // May be null if the device doesn't support altitude

          resolve({ latitude, longitude, altitude });
        },

        /**
         * Error callback for geolocation.
         * @param {GeolocationPositionError} error - The error object describing what went wrong.
         */
        (error) => {
          console.error("Failed to retrieve location:", error.message);
          reject(error);
        },

        {
          enableHighAccuracy: true, // Request high-accuracy location (may take more time and battery)
          timeout: 10000,           // Maximum wait time (in milliseconds)
          maximumAge: 0             // Do not use a cached location
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      reject(new Error("Geolocation is not supported by this browser."));
    }
  });
}
const  DATA  = await getLocation();
/*
* this function posts a new incident to the server with axios
* @param {Object} incident - The incident object to be posted.
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
}export { getLocation, DATA, postIncident };