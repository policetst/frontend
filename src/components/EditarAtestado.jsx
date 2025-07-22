// pages/EditarAtestado.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';

const EditarAtestado = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [atestado, setAtestado] = useState(null);
  const [formData, setFormData] = useState({
    numero: '',
    descripcion: '',
    fecha: '',
    estado: 'activo'
  });

  useEffect(() => {
    loadAtestado();
  }, [id]);

  const loadAtestado = async () => {
    try {
      const response = await apiService.getAtestado(id);
      const atestadoData = response.atestado || response;
      setAtestado(atestadoData);
      setFormData({
        numero: atestadoData.numero || '',
        descripcion: atestadoData.descripcion || '',
        fecha: atestadoData.fecha ? atestadoData.fecha.split('T')[0] : '',
        estado: atestadoData.estado || 'activo'
      });
    } catch (error) {
      console.error('Error al cargar atestado:', error);
      alert('Error al cargar el atestado');
      navigate('/atestados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.numero.trim()) {
      alert('El número del atestado es obligatorio');
      return;
    }

    setSaving(true);

    try {
      await apiService.updateAtestado(id, formData);
      alert('Atestado actualizado correctamente');
      navigate(`/atestados/${id}`);
    } catch (error) {
      console.error('Error al actualizar atestado:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      alert('Error: ' + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este atestado? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await apiService.deleteAtestado(id);
      alert('Atestado eliminado correctamente');
      navigate('/atestados');
    } catch (error) {
      console.error('Error al eliminar atestado:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      alert('Error: ' + errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Cargando atestado...</div>
      </div>
    );
  }

  if (!atestado) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">Atestado no encontrado</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Editar Atestado #{id}</h1>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Eliminar Atestado
        </button>
      </div>
      
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
            disabled={saving}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/atestados/${id}`)}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarAtestado;