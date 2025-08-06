// pages/PlantillasList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/apiService';
import { extractVariables } from '../utils/types';

const PlantillasList = () => {
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    loadPlantillas();
  }, []);

  const loadPlantillas = async () => {
    try {
      const response = await apiService.getPlantillas();
      setPlantillas(response.plantillas || response || []);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar las plantillas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la plantilla "${name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await apiService.deletePlantilla(id);
      alert('Plantilla eliminada correctamente');
      loadPlantillas(); // Recargar la lista
    } catch (error) {
      console.error('Error al eliminar plantilla:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      alert('Error: ' + errorMessage);
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
          <Link 
            to="/plantillas/nueva" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Nueva Diligencia
          </Link>
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
            <Link 
              to="/plantillas/nueva"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Crear Primera Plantilla
            </Link>
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
                  </div>
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

                {/* Vista previa del contenido */}
                <div className="mb-3 p-3 bg-gray-50 rounded text-sm">
                  <p className="text-gray-700 line-clamp-3">
                    {truncateText(plantilla.content, 200)}
                  </p>
                </div>

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
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resumen */}
      <div className="mt-6 text-sm text-gray-500 text-center">
        Mostrando {plantillasFiltradas.length} de {plantillas.length} plantillas
      </div>
    </div>
  );
};

export default PlantillasList;