// pages/AtestadoDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiService from '../../services/apiService';
import DraggableDiligencia from './DraggableDiligencia';
import AtestadoPrintView from './AtestadoPrintView';

const AtestadoDetail = () => {
  const { id } = useParams();
  const [atestado, setAtestado] = useState(null);
  const [diligencias, setDiligencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [showPrintView, setShowPrintView] = useState(false);
  const [reorderLoading, setReorderLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const response = await apiService.getAtestado(id);
      setAtestado(response.atestado || response);
      setDiligencias(response.diligencias || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar el atestado');
    } finally {
      setLoading(false);
    }
  };

  const handleReorderToggle = () => {
    setIsReordering(!isReordering);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index) => {
    setDragOverIndex(index);
  };

  const handleDrop = async (draggedIndex, dropIndex) => {
    if (draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Crear nueva lista reordenada
    const newDiligencias = [...diligencias];
    const draggedItem = newDiligencias[draggedIndex];

    // Remover el elemento arrastrado
    newDiligencias.splice(draggedIndex, 1);

    // Insertar en la nueva posición
    newDiligencias.splice(dropIndex, 0, draggedItem);

    // Actualizar el estado local inmediatamente
    setDiligencias(newDiligencias);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Preparar datos para el backend
    const diligenciasOrder = newDiligencias.map((diligencia, index) => ({
      id: diligencia.id,
      orden: index + 1
    }));

    try {
      setReorderLoading(true);
      await apiService.reorderDiligencias(id, diligenciasOrder);
      console.log('Orden actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar orden:', error);
      alert('Error al actualizar el orden de las diligencias');
      // Revertir cambios en caso de error
      loadData();
    } finally {
      setReorderLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'cerrado':
        return 'bg-red-100 text-red-800';
      case 'archivado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) return (
    <div className="p-6">
      <div className="text-center">Cargando...</div>
    </div>
  );

  if (!atestado) return (
    <div className="p-6">
      <div className="text-center text-red-500">Atestado no encontrado</div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Atestado #{atestado.numero || id}</h1>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadgeClass(atestado.estado)}`}>
            {atestado.estado || 'Sin estado'}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPrintView(true)}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
          <Link
            to={`/atestados/${id}/editar`}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Editar
          </Link>
          <Link
            to="/atestados"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Volver
          </Link>
        </div>
      </div>

      {/* Información del Atestado */}
      <div className="bg-white p-6 rounded border mb-6">
        <h2 className="text-xl font-semibold mb-4">Información del Atestado</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Número</p>
            <p className="font-medium">{atestado.numero || 'No especificado'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Fecha</p>
            <p className="font-medium">{formatDate(atestado.fecha)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Estado</p>
            <p className="font-medium">{atestado.estado || 'Sin estado'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Creado</p>
            <p className="font-medium">{formatDateTime(atestado.created_at)}</p>
          </div>
          {atestado.updated_at && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Última actualización</p>
              <p className="font-medium">{formatDateTime(atestado.updated_at)}</p>
            </div>
          )}
        </div>
        {atestado.descripcion && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Descripción</p>
            <p className="mt-1 whitespace-pre-wrap">{atestado.descripcion}</p>
          </div>
        )}
      </div>

      {/* Diligencias */}
      <div className="bg-white p-6 rounded border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Diligencias ({diligencias.length})
          </h2>
          <div className="flex gap-2">
            {diligencias.length > 1 && (
              <button
                onClick={handleReorderToggle}
                disabled={reorderLoading}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  isReordering
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                } ${reorderLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {reorderLoading ? 'Guardando...' : isReordering ? 'Finalizar reorden' : 'Reordenar'}
              </button>
            )}
            <Link
              to={`/atestados/${id}/diligencias/nueva`}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
            >
              + Nueva Diligencia
            </Link>
          </div>
        </div>
        
        {diligencias.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No hay diligencias registradas.</p>
            <Link 
              to={`/atestados/${id}/diligencias/nueva`}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Crear Primera Diligencia
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {isReordering && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Modo reordenamiento:</strong> Arrastra y suelta las diligencias para cambiar su orden.
                  {reorderLoading && <span className="ml-2">Guardando cambios...</span>}
                </p>
              </div>
            )}

            {diligencias.map((diligencia, index) => (
              isReordering ? (
                <DraggableDiligencia
                  key={diligencia.id}
                  diligencia={diligencia}
                  index={index}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  formatDateTime={formatDateTime}
                  isDragging={draggedIndex === index}
                  dragOverIndex={dragOverIndex}
                />
              ) : (
                <div key={diligencia.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">
                      Diligencia #{index + 1}
                      {diligencia.plantilla_nombre && (
                        <span className="text-sm text-gray-500 ml-2">
                          (Plantilla: {diligencia.plantilla_nombre})
                        </span>
                      )}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(diligencia.created_at)}
                    </span>
                  </div>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap text-gray-700">
                      {diligencia.texto_final || diligencia.content || 'Sin contenido'}
                    </p>
                  </div>
                  {diligencia.valores && diligencia.valores.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Variables utilizadas:</p>
                      <div className="flex flex-wrap gap-1">
                        {diligencia.valores.map((valor, idx) => (
                          <span key={idx} className="inline-block bg-gray-100 text-xs px-2 py-1 rounded">
                            {valor.variable}: {valor.valor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Vista de impresión */}
      {showPrintView && (
        <AtestadoPrintView
          atestado={atestado}
          diligencias={diligencias}
          onClose={() => setShowPrintView(false)}
        />
      )}
    </div>
  );
};

export default AtestadoDetail;