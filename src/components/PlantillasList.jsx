// pages/PlantillasList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import Swal from 'sweetalert2';
import { extractVariables } from '../utils/types';

const PlantillasList = () => {
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadPlantillas();
  }, []);

  const loadPlantillas = async () => {
    try {
      const response = await apiService.getPlantillas();
      setPlantillas(response.plantillas || response || []);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al cargar las plantillas',
        icon: 'error',
        confirmButtonColor: '#002856',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que quieres eliminar la plantilla "${name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#002856',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await apiService.deletePlantilla(id);
        Swal.fire({
          title: 'Eliminada',
          text: 'Plantilla eliminada correctamente',
          icon: 'success',
          confirmButtonColor: '#002856',
          timer: 1500
        });
        loadPlantillas(); // Recargar la lista
      } catch (error) {
        console.error('Error al eliminar plantilla:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
        Swal.fire({
          title: 'Error',
          text: 'Error: ' + errorMessage,
          icon: 'error',
          confirmButtonColor: '#002856',
        });
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return 'Sin descripción';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Filtrar plantillas
  const plantillasFiltradas = plantillas.filter(plantilla => {
    if (!busqueda) return true;
    const searchLower = busqueda.toLowerCase();
    return (
      plantilla.name?.toLowerCase().includes(searchLower) ||
      plantilla.description?.toLowerCase().includes(searchLower) ||
      plantilla.content?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) return (
    <div className="p-6">
      <div className="text-center">Cargando Diligencias...</div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Diligencias</h1>
        <div className="flex gap-2">
          <Link 
            to="/atestados" 
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Volver a Atestados
          </Link>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Nueva Diligencia
          </button>
        </div>
      </div>

      {/* Filtro de búsqueda */}
      <div className="bg-white p-4 rounded border mb-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium mb-2">Buscar Diligencias</label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, descripción o contenido..."
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Lista de Plantillas */}
      {plantillasFiltradas.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            {plantillas.length === 0 
              ? 'No hay plantillas registradas.' 
              : 'No se encontraron plantillas que coincidan con la búsqueda.'
            }
          </p>
          {plantillas.length === 0 && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Crear Primera Plantilla
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {plantillasFiltradas.map(plantilla => {
            const variables = extractVariables(plantilla.content || '');
            
            return (
              <div key={plantilla.id} className="bg-white border rounded p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {plantilla.name || 'Sin nombre'}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {truncateText(plantilla.description)}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Variables: {variables.length}</span>
                      <span>Creada: {formatDate(plantilla.created_at)}</span>
                      {plantilla.updated_at && plantilla.updated_at !== plantilla.created_at && (
                        <span>Actualizada: {formatDate(plantilla.updated_at)}</span>
                      )}
                    </div>
<<<<<<< Updated upstream
                  </div>
=======
                  </Link>
                  <button
                    onClick={() => handleDelete(plantilla.id, plantilla.name)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                    title="Eliminar plantilla"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
>>>>>>> Stashed changes
                </div>

                {/* Variables */}
                {variables.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Palabras clave disponibles:</p>
                    <div className="flex flex-wrap gap-1">
                      {variables.slice(0, 5).map((variable, idx) => (
                        <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {variable}
                        </span>
                      ))}
                      {variables.length > 5 && (
                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          +{variables.length - 5} más
                        </span>
                      )}
                    </div>
                  </div>
                )}


<<<<<<< Updated upstream
                {/* Acciones */}
                <div className="flex gap-2">
                  <Link 
                    to={`/plantillas/${plantilla.id}/editar`} 
                    className="text-green-500 hover:text-green-700 font-medium"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(plantilla.id, plantilla.name)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Eliminar
                  </button>
=======

>>>>>>> Stashed changes
                </div>
            );
          })}
        </div>
      )}

      {/* Resumen */}
      <div className="mt-6 text-sm text-gray-500 text-center">
        Mostrando {plantillasFiltradas.length} de {plantillas.length} plantillas
      </div>
      {/* Modal de Datos Básicos */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">
            <div className="bg-[#002856] p-4 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Nueva Plantilla de Diligencia</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setCreating(true);
                try {
                  const response = await apiService.createPlantilla({
                    name: newTemplate.name,
                    description: newTemplate.description,
                    content: 'Nueva Diligencia: ' + newTemplate.name // El contenido es obligatorio en el backend
                  });
                  const plantillaId = response.plantilla?.id || response.id;
                  setIsModalOpen(false);
                  navigate(`/plantillas/${plantillaId}/editar`);
                } catch (error) {
                  console.error('Error al crear plantilla:', error);
                  Swal.fire({
                    title: 'Error',
                    text: 'Error al crear la plantilla: ' + (error.response?.data?.message || error.message),
                    icon: 'error',
                    confirmButtonColor: '#002856',
                  });
                } finally {
                  setCreating(false);
                }
              }} 
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Nombre de la Diligencia <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#002856] focus:border-transparent outline-none transition-all shadow-sm"
                  placeholder="Ej: Diligencia de identificación"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Descripción (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#002856] focus:border-transparent outline-none transition-all shadow-sm"
                  placeholder="Breve descripción de cuándo usar esta plantilla..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors font-medium border border-transparent"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-[#002856] text-white rounded hover:bg-[#003d82] transition-colors font-bold shadow-md hover:shadow-lg active:scale-95 transition-all disabled:bg-gray-400"
                >
                  {creating ? 'Creando...' : 'Continuar al Editor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantillasList;