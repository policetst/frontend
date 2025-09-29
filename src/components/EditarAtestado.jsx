// pages/EditarAtestado.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import Swal from 'sweetalert2';

const EditarAtestado = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [atestado, setAtestado] = useState(null);
  const [formData, setFormData] = useState({
    numero: '',
    descripcion: '',
    fecha: ''
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
        fecha: atestadoData.fecha ? atestadoData.fecha.split('T')[0] : ''
      });
    } catch (error) {
      console.error('Error al cargar atestado:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar el atestado'
      });
      navigate('/atestados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.numero.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'El número del atestado es obligatorio'
      });
      return;
    }

    if (!formData.fecha) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'La fecha del atestado es obligatoria'
      });
      return;
    }

    setSaving(true);

    try {
      await apiService.updateAtestado(id, formData);
      
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Atestado actualizado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
      
      navigate(`/atestados/${id}`);
    } catch (error) {
      console.error('Error al actualizar atestado:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al actualizar el atestado'
      });
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
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el atestado y todas sus diligencias. No se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await apiService.deleteAtestado(id);
        
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'Atestado eliminado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
        
        navigate('/atestados');
      } catch (error) {
        console.error('Error al eliminar atestado:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al eliminar el atestado'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando atestado...</p>
        </div>
      </div>
    );
  }

  if (!atestado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Atestado no encontrado</p>
          <button
            onClick={() => navigate('/atestados')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Editar Atestado #{atestado.numero}</h1>
          <p className="text-gray-600 mt-1">Modifica la información básica del atestado</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Información Básica</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Número del Atestado *
                </label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: 2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descripción general del atestado..."
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar Atestado
              </button>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/atestados/${id}`)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-yellow-800 mb-1">Advertencia</h3>
              <p className="text-sm text-yellow-700">
                Los cambios en la información básica del atestado no afectan a sus diligencias. Al eliminar un atestado se eliminan todas las diligencias que este contenga.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarAtestado;