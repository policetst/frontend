import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../../services/apiService';
import Swal from 'sweetalert2';

const AtestadosDetailSimple = () => {
  const { id } = useParams();
  const [atestado, setAtestado] = useState(null);
  const [diligencias, setDiligencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAtestado(id);
      console.log('📋 Datos cargados:', response);
      
      if (response.atestado) {
        setAtestado(response.atestado);
        setDiligencias(response.diligencias || []);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar el atestado'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, index) => {
    console.log('🚀 DragStart:', index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    console.log('📍 Drop:', { draggedIndex, dropIndex });
    
    if (draggedIndex === dropIndex || isNaN(draggedIndex)) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reordenar localmente
    const newDiligencias = [...diligencias];
    const draggedItem = newDiligencias[draggedIndex];
    
    newDiligencias.splice(draggedIndex, 1);
    newDiligencias.splice(dropIndex, 0, draggedItem);
    
    setDiligencias(newDiligencias);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Preparar datos para backend
    const diligenciasOrder = newDiligencias.map((diligencia, index) => ({
      id: diligencia.id,
      orden: index + 1
    }));

    console.log('📤 Enviando al backend:', diligenciasOrder);

    try {
      await apiService.reorderDiligencias(id, diligenciasOrder);
      console.log('✅ Reordenamiento exitoso');
      
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Orden actualizado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('❌ Error al reordenar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al actualizar el orden'
      });
      // Revertir cambios
      loadData();
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  if (!atestado) {
    return <div className="p-6">Atestado no encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">
            Atestado #{atestado.numero || atestado.id}
          </h1>
          
          <div className="mb-4">
            <button
              onClick={() => setIsReordering(!isReordering)}
              className={`px-4 py-2 rounded ${
                isReordering 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isReordering ? 'Finalizar Reorden' : 'Reordenar Diligencias'}
            </button>
          </div>

          {isReordering && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                🔄 Modo reordenamiento activo. Arrastra las diligencias para cambiar su orden.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              Diligencias ({diligencias.length})
            </h2>
            
            {diligencias.length === 0 ? (
              <p className="text-gray-500">No hay diligencias</p>
            ) : (
              <div className="space-y-2">
                {diligencias.map((diligencia, index) => (
                  <div
                    key={diligencia.id}
                    draggable={isReordering}
                    onDragStart={(e) => isReordering && handleDragStart(e, index)}
                    onDragOver={(e) => isReordering && handleDragOver(e, index)}
                    onDrop={(e) => isReordering && handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`
                      p-4 border rounded-lg transition-all
                      ${isReordering ? 'cursor-move' : 'cursor-default'}
                      ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
                      ${dragOverIndex === index ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}
                      ${isReordering ? 'hover:bg-gray-50' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {isReordering && (
                        <div className="flex flex-col items-center text-gray-400">
                          <div className="w-1 h-1 bg-gray-400 rounded-full mb-1"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full mb-1"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">
                          Diligencia #{index + 1}
                          {diligencia.plantilla_nombre && (
                            <span className="text-sm text-gray-500 ml-2">
                              (Plantilla: {diligencia.plantilla_nombre})
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {diligencia.texto_final || diligencia.content || 'Sin contenido'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtestadosDetailSimple;