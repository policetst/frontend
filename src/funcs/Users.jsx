import { getTokenFromCookie } from "./Incidents";
const USERS_URL = import.meta.env.VITE_USERS_UROL || 'http://localhost:4000/users';
import axios from "axios";

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
    return response.data.users || [];
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
};

export const updateUserDetails = async (code, userData) => {
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
