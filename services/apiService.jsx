// services/apiService.js
import axios from 'axios';

const getTokenFromCookie = () => {
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : '';
};

const API_BASE_URL = 'https://arbadev-back-1.onrender.com';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Agregar token a todas las peticiones
    this.api.interceptors.request.use((config) => {
      const token = getTokenFromCookie();
      
      // DEBUG: Ver qué está pasando
      console.log('🍪 Cookies completas:', document.cookie);
      console.log('🔑 Token extraído:', token);
      console.log('📡 URL completa:', config.baseURL + config.url);
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Header Authorization agregado:', config.headers.Authorization);
      } else {
        console.log('❌ No se encontró token en las cookies');
      }
      
      return config;
    });

    // Debug de respuestas
    this.api.interceptors.response.use(
      (response) => {
        console.log('✅ Respuesta exitosa:', response.status, response.data);
        return response;
      },
      (error) => {
        console.log('❌ Error en respuesta:', error.response?.status, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  // PLANTILLAS
  async getPlantillas() {
    console.log('🚀 Llamando getPlantillas...');
    const response = await this.api.get('/plantillas');
    return response.data;
  }

  async createDiligencia(atestadoId, data) {
    console.log('🚀 Llamando createDiligencia...', { atestadoId, data });
    const response = await this.api.post(`/atestados/${atestadoId}/diligencias`, data);
    return response.data;
  }
}

export default new ApiService();