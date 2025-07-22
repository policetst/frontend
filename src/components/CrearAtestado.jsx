// pages/CrearAtestado.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';

const CrearAtestado = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    numero: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    estado: 'activo'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.numero.trim()) {
      alert('El número del atestado es obligatorio');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.createAtestado(formData);
      const atestadoId = response.atestado?.id || response.id;
      navigate(`/atestados/${atestadoId}`);
    } catch (error) {
      console.error('Error al crear atestado:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      alert('Error: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Atestado</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded border max-w-2xl">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Número del Atestado <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: AT-2024-001"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Fecha <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Estado</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="activo">Activo</option>
            <option value="cerrado">Cerrado</option>
            <option value="archivado">Archivado</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Descripción</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Descripción del atestado..."
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Crear Atestado'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/atestados')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearAtestado;