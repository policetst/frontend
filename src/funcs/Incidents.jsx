import { useCookies } from 'react-cookie';

import axios from 'axios';
import Swal from 'sweetalert2';
import emailjs from 'emailjs-com';
import { getEmailConfig } from './Config'

const INCIDENTS_URL = import.meta.env.VITE_INCIDENTS_URL;
const BASE_URL = import.meta.env.VITE_BASE_URL;
const IMAGESD_URL = import.meta.env.VITE_IMAGESD_URL;

const UpdateBrigadeField = async (code, value) => {
  const token = getTokenFromCookie();
  try {
    const res = await axios.put(`${INCIDENTS_URL}/${code}/brigade_field`, { brigade_field: value }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error("Error updating brigade field:", error);
    return { ok: false, message: 'Error al actualizar el campo de brigada' };
  }
};

//*Function to get the user's token from the cookie (sin hooks)
const getTokenFromCookie = () => {
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : '';
};
/**
 * Function to capitalize the first letter of each word in a string
 * @param {String} texto
 * @returns {String}
 */
function capitalize(texto) {
  return texto
    .toLowerCase()
    .replace(/\b\w/g, letra => letra.toUpperCase());
}

/**
 * Function to validate DNI/NIF/Passport
 * @param {String} texto
 * @returns {Boolean}
 */
function validarDniNif(texto) {
  if (!texto) return false;
  const value = texto.toUpperCase().trim();

  const dniPattern = /^(\d{8})([A-Z])$/;
  const niePattern = /^[XYZ]\d{7}[A-Z]$/;

  const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';

  // Validación DNI
  if (dniPattern.test(value)) {
    const [, num, letra] = value.match(dniPattern);
    return letras[num % 23] === letra;
  }

  // Validación NIE
  if (niePattern.test(value)) {
    let nieNum = value.replace('X', '0').replace('Y', '1').replace('Z', '2');
    const num = nieNum.slice(0, 8);
    const letra = nieNum[8];
    return letras[num % 23] === letra;
  }

  // Validación Pasaporte Español: 3 letras + 6 números
  const pasaporteEspanol = /^[A-Z]{3}\d{6}$/;
  if (pasaporteEspanol.test(value)) {
    return true;
  }

  // Validación Pasaportes Extranjeros (formatos comunes):
  // Formato 1: 1-2 letras + 6-9 números
  const pasaporteExtranjero1 = /^[A-Z]{1,2}\d{6,9}$/;
  
  // Formato 2: 6-9 números seguidos de 1-3 letras
  const pasaporteExtranjero2 = /^\d{6,9}[A-Z]{1,3}$/;
  
  // Formato 3: Alfanumérico de 6-12 caracteres (común en muchos países)
  const pasaporteExtranjero3 = /^[A-Z0-9]{6,12}$/;
  
  // Formato 4: Con letras y números intercalados
  const pasaporteExtranjero4 = /^[A-Z]\d{1,3}[A-Z]\d{1,6}$/;
  
  if (pasaporteExtranjero1.test(value) || 
      pasaporteExtranjero2.test(value) || 
      pasaporteExtranjero3.test(value) || 
      pasaporteExtranjero4.test(value)) {
    return true;
  }

  return false;
}
/**
 * Description: Function to validate license plates (Spanish, foreign, special vehicles)
 * @param {String} texto
 * @returns {Boolean}
 */
function validarMatricula(texto) {
  if (!texto || typeof texto !== 'string') return false;
  
  // Eliminar espacios, guiones y pasar a mayúsculas
  const value = texto.toUpperCase().replace(/[\s-]+/g, '');
  
  // Validar longitud mínima y máxima
  if (value.length < 4 || value.length > 10) return false;

  // Formato nuevo español: 4 números + 3 consonantes (sin vocales, Ñ, Q)
  const formatoNuevoEspanol = /^[0-9]{4}[BCDFGHJKLMNPRSTVWXYZ]{3}$/;
  
  // Formato antiguo español: 1-2 letras + 4 números + 1-2 letras (sin vocales, Ñ, Q)
  const formatoAntiguoEspanol = /^[BCDFGHJKLMNPRSTVWXYZ]{1,2}[0-9]{4}[BCDFGHJKLMNPRSTVWXYZ]{1,2}$/;
  
  // Formato muy antiguo español (anterior a 1971): 1-2 letras + 4-6 números
  const formatoMuyAntiguo = /^[A-Z]{1,2}[0-9]{4,6}$/;
  
  // Matrículas de ciclomotores: L + 4 números + 3 letras
  const formatoCiclomotor = /^L[0-9]{4}[A-Z]{3}$/;
  
  // Matrículas de vehículos especiales: E + 4 números + 3 letras
  const formatoEspecial = /^E[0-9]{4}[A-Z]{3}$/;
  
  // Matrículas de remolques: R + 4 números + 3 letras
  const formatoRemolque = /^R[0-9]{4}[A-Z]{3}$/;
  
  // Matrículas diplomáticas: CD + 3-4 números + 1-2 letras
  const formatoDiplomatico = /^CD[0-9]{3,4}[A-Z]{1,2}$/;
  
  // Matrículas de cuerpos consulares: CC + 3-4 números + 1-2 letras
  const formatoConsular = /^CC[0-9]{3,4}[A-Z]{1,2}$/;
  
  // Matrículas extranjeras específicas (más restrictivas)
  // Formato europeo: 1-3 letras + 2-4 números + 1-3 letras (debe tener al menos 1 número)
  const formatoExtranjeroEuropeo = /^[A-Z]{1,3}[0-9]{2,4}[A-Z]{1,3}$/;
  
  // Formato americano: 3 letras + 3-4 números O 3-4 números + 3 letras
  const formatoAmericano1 = /^[A-Z]{3}[0-9]{3,4}$/;
  const formatoAmericano2 = /^[0-9]{3,4}[A-Z]{3}$/;
  
  // Formato mixto: debe contener al menos 1 letra y 1 número, longitud 5-8
  const formatoMixto = /^(?=.*[A-Z])(?=.*[0-9])[A-Z0-9]{5,8}$/;
  
  // Validar contra el texto original para formatos con separadores (más restrictivo)
  const valueOriginal = texto.toUpperCase().trim();
  const formatoConSeparadores = /^[A-Z0-9]{1,3}[\s-][A-Z0-9]{2,4}[\s-]?[A-Z0-9]{1,3}$/;
  
  // Verificar que no sea solo números o solo letras (excepto formatos específicos)
  const soloNumeros = /^[0-9]+$/;
  const soloLetras = /^[A-Z]+$/;
  
  if (soloNumeros.test(value) || soloLetras.test(value)) {
    return false; // Rechazar cadenas que solo contengan números o solo letras
  }
  
  return formatoNuevoEspanol.test(value) || 
         formatoAntiguoEspanol.test(value) ||
         formatoMuyAntiguo.test(value) ||
         formatoCiclomotor.test(value) ||
         formatoEspecial.test(value) ||
         formatoRemolque.test(value) ||
         formatoDiplomatico.test(value) ||
         formatoConsular.test(value) ||
         formatoExtranjeroEuropeo.test(value) ||
         formatoAmericano1.test(value) ||
         formatoAmericano2.test(value) ||
         formatoMixto.test(value) ||
         formatoConSeparadores.test(valueOriginal);
}


/**
 * Function to delete images from server to optimice space
 * @param {any} imageUrl
 * @returns {any}
 */
async function deleteImage(imageUrl){
  await axios.post(`${import.meta.env.VITE_IMAGESD_URL}`, { url: imageUrl }, {
    headers: {
      Authorization: `Bearer ${getTokenFromCookie()}`,
    }
  });
}

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
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;

  } catch (error) {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message;

    console.error(`Error ${status} al crear incidencia:`, errorMessage);

    // Comentado para evitar doble warning cuando faltan campos.
    // await Swal.fire({
    //   icon: 'error',
    //   title: 'Errors',
    //   text: errorMessage || 'No se ha podido crear la incidencia.',
    //   confirmButtonText: 'Aceptar',
    // });

    return { ok: false, message: errorMessage };
  }
}

//* Function to get the incidents from the backend
async function getIncidents() {
  const token = getTokenFromCookie();  try {
    const res = await axios.get(INCIDENTS_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return { ok: false, message: 'Error al conectar con el servidor' };
  }
}
//* Function to update an incident
async function updateIncident(code, incidentData) {
  try {
    const token = getTokenFromCookie();
    const res = await axios.put(`${INCIDENTS_URL}/${code}`, incidentData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error("Error updating incident:", error);
    return { ok: false, message: 'Error al actualizar la incidencia' };
  }
}
//* Function to get details of one incident
async function getIncidentDetails(code) {
  try {
    const token = getTokenFromCookie();
    const res = await axios.get(`${INCIDENTS_URL}/${code}/details`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
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



/**
 * Function to send an incident via email using EmailJS to notify the brigade if necessary.
 * @param {string} to
 * @param {string} descripcion
 * @param {string} ubicacion
 * @param {string[]} imagenes
 * @returns {Promise<any>}
 */
const sendIncidentViaEmail = async(descripcion, ubicacion, imagenes, code) => {
  //* get email 
  const email = await getEmailConfig();
  const brigadeEmail = email.data.brigade_field;
  //change brigade field value to !upgrade(esta mal puesto)


  // check and set images to array
  if (!Array.isArray(imagenes)) imagenes = [];

  //html element of images
  const imagesHTML = imagenes
    .filter(url => typeof url === 'string' && url.trim())
    .map(url => `<img src="${url}" style="width: 200px; margin: 10px; border-radius: 5px;" />`)
    .join('');

  // Full body of email
  const htmlContent = `
    <h3>📌 Incidencia reportada</h3>
    <p><strong>📝 Descripción:</strong> ${descripcion}</p>
    <p><strong>📍 Ubicación:</strong> ${ubicacion}</p>
    ${imagenes.length > 0 ? `<h4>📷 Imágenes:</h4>${imagesHTML}` : '<p><em>No se adjuntaron imágenes.</em></p>'}
  `;

  // Parámetrs 
emailjs.send("service_2oua2y5","template_w7rd2z8",{
to_name: "brigada",
message: htmlContent,
to_email: brigadeEmail,
email: "renderpolice333@gmail.com",
},
 "DZjuMjjhaQImO7ZAl"
);
};

//* get users for estadistics
const getUsers = async () => {
  try {
    const token = getTokenFromCookie();
    const res =  await axios.get(BASE_URL+'/users', {
      
headers: {
  Authorization: `Bearer ${token}` //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2RlIjoiQVIwMTQ5MiIsInJvbGUiOiJTdGFuZGFyZCIsImlhdCI6MTc0ODQzNzUwNCwiZXhwIjoxNzQ4NDY2MzA0fQ.nae4Dt9BArAFL6vit9XTINKWliy7qj6L5PLE5sbkP2Y
}

    });
     return res.data ;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};
const getUserInfo = async (code) => {
  try {
    const token = getTokenFromCookie();
    const res = await axios.get(`${BASE_URL}/user/${code}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
};
const getOpenIncidents = async () => {
  try {
    const token = getTokenFromCookie();
    const res = await axios.get(`${INCIDENTS_URL}/open`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data.incidents || [];
  } catch (error) {
    console.error("Error fetching open incidents:", error);
    return [];
  }
};

export {
  getOpenIncidents,
  validarDniNif,
  validarMatricula,
  getUserInfo,
  getUsers,
  deleteImage,
  sendIncidentViaEmail,
  getLocation,
  postIncident,
  getIncidents,
  updateIncident,
  getIncidentDetails,
  getIncident,
  countPeople,
  countVehicles,
  closeIncident,
  getTokenFromCookie,
  capitalize,
  UpdateBrigadeField
};
