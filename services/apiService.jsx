// services/apiService.js
import axios from 'axios';

const getTokenFromCookie = () => {
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : '';
};

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

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

  // ==================== MÉTODOS PARA ATESTADOS ====================
  
  async getAtestados() {
    console.log('🚀 Llamando getAtestados...');
    const response = await this.api.get('/atestados');
    return response.data;
  }

  async getAtestado(id) {
    console.log('🚀 Llamando getAtestado...', { id });
    const response = await this.api.get(`/atestados/${id}`);
    return response.data;
  }

  async createAtestado(data) {
    console.log('🚀 Llamando createAtestado...', { data });
    const response = await this.api.post('/atestados', data);
    return response.data;
  }

  async updateAtestado(id, data) {
    console.log('🚀 Llamando updateAtestado...', { id, data });
    const response = await this.api.put(`/atestados/${id}`, data);
    return response.data;
  }

  async deleteAtestado(id) {
    console.log('🚀 Llamando deleteAtestado...', { id });
    const response = await this.api.delete(`/atestados/${id}`);
    return response.data;
  }

  async getDiligencias(atestadoId) {
    console.log('🚀 Llamando getDiligencias...', { atestadoId });
    const response = await this.api.get(`/atestados/${atestadoId}/diligencias`);
    return response.data;
  }

  async createDiligencia(atestadoId, data) {
    console.log('🚀 Llamando createDiligencia con:', { atestadoId, data });
    console.log('🔍 DEBUG ApiService - Datos detallados:');
    console.log('🆔 atestadoId:', atestadoId, 'tipo:', typeof atestadoId);
    console.log('📋 data.templateId:', data.templateId, 'tipo:', typeof data.templateId);
    console.log('📊 data.values:', data.values, 'es array:', Array.isArray(data.values));
    console.log('📤 Payload completo:', JSON.stringify(data, null, 2));
    
    const response = await this.api.post(`/atestados/${atestadoId}/diligencias`, data);
    return response.data;
  }

  async updateDiligencia(diligenciaId, data) {
    console.log('🚀 Llamando updateDiligencia...', { diligenciaId, data });
    const response = await this.api.put(`/diligencias/${diligenciaId}`, data);
    return response.data;
  }

  async deleteDiligencia(diligenciaId) {
    console.log('🚀 Llamando deleteDiligencia...', { diligenciaId });
    const response = await this.api.delete(`/diligencias/${diligenciaId}`);
    return response.data;
  }

  async getDiligencia(diligenciaId) {
    console.log('🚀 Llamando getDiligencia...', { diligenciaId });
    const response = await this.api.get(`/diligencias/${diligenciaId}`);
    return response.data;
  }

  // ==================== MÉTODOS PARA PLANTILLAS ====================
  
  async getPlantillas() {
    console.log('🚀 Llamando getPlantillas...');
    const response = await this.api.get('/plantillas');
    return response.data;
  }

  async getPlantilla(id) {
    console.log('🚀 Llamando getPlantilla...', { id });
    const response = await this.api.get(`/plantillas/${id}`);
    return response.data;
  }

  async createPlantilla(data) {
    console.log('🚀 Llamando createPlantilla...', { data });
    const response = await this.api.post('/plantillas', data);
    return response.data;
  }

  async updatePlantilla(id, data) {
    console.log('🚀 Llamando updatePlantilla...', { id, data });
    const response = await this.api.put(`/plantillas/${id}`, data);
    return response.data;
  }

  async deletePlantilla(id) {
    console.log('🚀 Llamando deletePlantilla...', { id });
    const response = await this.api.delete(`/plantillas/${id}`);
    return response.data;
  }

  // Método para reordenar diligencias
  async reorderDiligencias(atestadoId, diligenciasOrder) {
    console.log('🚀 Llamando reorderDiligencias...', { atestadoId, diligenciasOrder });
    console.log('🔍 DEBUG Frontend - Reordenamiento:');
    console.log('🆔 atestadoId:', atestadoId, 'tipo:', typeof atestadoId);
    console.log('📊 diligenciasOrder:', diligenciasOrder, 'es array:', Array.isArray(diligenciasOrder));
    console.log('📏 Longitud del array:', diligenciasOrder ? diligenciasOrder.length : 'undefined');
    console.log('📤 Payload completo:', JSON.stringify({ diligenciasOrder }, null, 2));
    
    const response = await this.api.put(`/atestados/${atestadoId}/reorder-diligencias`, {
      diligenciasOrder
    });
    return response.data;
  }

  // ==================== MÉTODOS PARA ASISTENTE IA ====================

  async chatWithAI(message, conversationHistory = []) {
    console.log('🤖 Llamando chatWithAI...', { message: message.substring(0, 50) + '...' });
    const response = await this.api.post('/ai/chat', {
      message,
      conversationHistory
    });
    return response.data;
  }

  async getAISummary() {
    console.log('🤖 Llamando getAISummary...');
    const response = await this.api.get('/ai/summary');
    return response.data;
  }

  async getAIPatternAnalysis() {
    console.log('🤖 Llamando getAIPatternAnalysis...');
    const response = await this.api.get('/ai/analyze-patterns');
    return response.data;
  }
}

export default new ApiService();