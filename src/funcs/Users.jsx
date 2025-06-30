import { getTokenFromCookie } from "./Incidents";
import bcrypt from "bcryptjs";
const USERS_URL = "https://arbadev-back-joq0.onrender.com/users";
import axios from "axios";
import Swal from "sweetalert2";

/**
 * Function to get a user's role by their code
 * @param {string} code - The user's code
 * @returns {Promise<string|null>} - The user's role or null if not found
 */
export const getUserRole = async (code) => {
  try {
    const token = getTokenFromCookie();
    const response = await axios.get(`${USERS_URL}/role/${code}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.role || null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};
/**
 * Function to get a user's details by their code
 * @param {string} code - The user's code
 * @returns {Promise<Object|null>} - The user's details or null if not found
 */
export const getUserDetails = async (code) => {
  try {
    const token = getTokenFromCookie();
    const response = await axios.get(`${USERS_URL}/${code}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data || null;
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
};
/**
 * Function to update a user's details
 * @param {string} code - The user's code
 * @param {Object} userData - The data to update the user with
 * @returns {Promise<Object>} - The updated user data or an error message
 */
/**
 * Function to get all users
 * @returns {Promise<Array>} - An array of user objects
 */
export const getAllUsers = async () => {
  try {
    const token = getTokenFromCookie();
    const response = await axios.get(`${USERS_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
};

export const updateUserDetails = async (code, userData) => {
  userData.password = bcrypt.hashSync(userData.password, 10); // Hash the password before sending it
  try {
    const token = getTokenFromCookie();
    const response = await axios.put(`${USERS_URL}/${code}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data || null;
  } catch (error) {
    console.error("Error updating user details:", error);
    return null;
  }
};
export const changeCredentials = async (code, credentials) => {
  // Paso 1: Confirmación
  const { isConfirmed } = await Swal.fire({
    title: 'Cambiar credenciales',
    text: '¿Estás seguro de que deseas cambiar tus credenciales?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cambiar',
    cancelButtonText: 'No, cancelar'
  });

  // Si cancela, cortamos aquí.
  if (!isConfirmed) return null;

  // Paso 2: Loading mientras procesa
  Swal.fire({
    title: 'Actualizando...',
    text: 'Por favor espera mientras se actualizan tus credenciales.',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  // Paso 3: Hasheamos la contraseña (si es necesario)
  try {
    const token = getTokenFromCookie();
    const response = await axios.put(
      `${USERS_URL}/${code}/passwordd`,
      credentials,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );

    // Cerramos el loading
    Swal.close();

    // Feedback éxito
    await Swal.fire({
      title: '¡Credenciales actualizadas!',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });

    return response.data || null;
  } catch (error) {
    // Cerramos el loading en caso de error
    Swal.close();

    // Feedback error
    await Swal.fire({
      title: 'Error al cambiar credenciales',
      text: error.response?.data?.message || 'Ha ocurrido un error inesperado.',
      icon: 'error',
      confirmButtonText: 'Cerrar'
    });

    return null;
  }
};

/**
 * Function to create a new user
 * @param {Object} userData - The data for the new user
 * @returns {Promise<Object>} - The created user data or an error message
 */
export const createUser = async (userData) => {
  userData.password = bcrypt.hashSync(userData.password, 10); // Hash the password before sending it
  try {
    const token = getTokenFromCookie();
    const response = await axios.post(`${USERS_URL}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data || null;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
};
export const checkLoginStatus = async (code) => {
  try {
    const token = getTokenFromCookie();
    const response = await axios.post(`${USERS_URL}/loginstate`, { code }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data || null;
  } catch (error) {
    console.error("Error checking login stats:", error);
    return null;
  }
}