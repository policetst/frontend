// pages/AtestadoDetail.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiService from '../../services/apiService';
import DraggableDiligencia from './DraggableDiligencia';
import AtestadoPrintView from './AtestadoPrintView';
import { extractVariables, replaceVariables } from '../utils/types';
import Swal from 'sweetalert2';
import './AtestadosDetail.css';

const AtestadoDetail = () => {
  const { id } = useParams();
  const [atestado, setAtestado] = useState(null);
  const [diligencias, setDiligencias] = useState([]);
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [showPrintView, setShowPrintView] = useState(false);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [selectedPlantilla, setSelectedPlantilla] = useState(null);
  const [plantillaValues, setPlantillaValues] = useState({});
  const [showVariablesModal, setShowVariablesModal] = useState(false);
  const [searchPlantillas, setSearchPlantillas] = useState('');
  const [editingDiligencia, setEditingDiligencia] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editValues, setEditValues] = useState({});
  
  // Nuevos estados para la funcionalidad mejorada
  // Funciones de utilidad
  const formatDateTime = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleString('es-ES');
  };

  const [showAddDiligenciaModal, setShowAddDiligenciaModal] = useState(false);
  const [showUnifiedVariablesModal, setShowUnifiedVariablesModal] = useState(false);
  const [unifiedVariables, setUnifiedVariables] = useState({});
  const [previewContent, setPreviewContent] = useState('');

  useEffect(() => {
    loadData();
    loadPlantillas();
  }, [id]);

  // Calcular variables unificadas y contenido de previsualización
  const { allVariables, fullPreview } = useMemo(() => {
    if (!diligencias.length) return { allVariables: {}, fullPreview: '' };

    const variablesMap = new Map();
    let preview = '';

    diligencias.forEach((diligencia, index) => {
      // Agregar título de diligencia
      preview += `\n=== DILIGENCIA ${index + 1} ===\n`;
      if (diligencia.plantilla_nombre) {
        preview += `Plantilla: ${diligencia.plantilla_nombre}\n`;
      }
      preview += `Fecha: ${formatDateTime(diligencia.created_at)}\n\n`;

      // Extraer variables del contenido
      if (diligencia.plantilla_content) {
        const variables = extractVariables(diligencia.plantilla_content);
        variables.forEach(variable => {
          if (!variablesMap.has(variable)) {
            variablesMap.set(variable, '');
          }
        });
        preview += diligencia.plantilla_content + '\n\n';
      } else {
        preview += diligencia.texto_final + '\n\n';
      }
    });

    return {
      allVariables: Object.fromEntries(variablesMap),
      fullPreview: preview
    };
  }, [diligencias]);

  const loadData = async () => {
    try {
      const response = await apiService.getAtestado(id);
      setAtestado(response.atestado || response);
      setDiligencias(response.diligencias || []);
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

  const loadPlantillas = async () => {
    try {
      const response = await apiService.getPlantillas();
      setPlantillas(response.plantillas || []);
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
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
    const reorderData = newDiligencias.map((diligencia, index) => ({
      id: diligencia.id,
      orden: index + 1
    }));

    try {
      setReorderLoading(true);
      await apiService.reorderDiligencias(id, reorderData);
      
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Orden actualizado correctamente',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al reordenar:', error);
      // Revertir cambios en caso de error
      await loadData();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al actualizar el orden'
      });
    } finally {
      setReorderLoading(false);
    }
  };

  const handleAddDiligencia = (plantilla) => {
    setSelectedPlantilla(plantilla);
    const variables = extractVariables(plantilla.content || '');
    if (variables.length > 0) {
      setPlantillaValues({});
      setShowVariablesModal(true);
    } else {
      createDiligenciaFromPlantilla(plantilla, {}); // El objeto vacío se convertirá en array vacío en la función
    }
    setShowAddDiligenciaModal(false);
  };

  const createDiligenciaFromPlantilla = async (plantilla, values) => {
    try {
      console.log('🔍 DEBUG Frontend - Creando diligencia:');
      console.log('📋 plantilla:', plantilla);
      console.log('📝 values:', values);
      console.log('🆔 plantilla.id:', plantilla.id, 'tipo:', typeof plantilla.id);

      const templateValues = Object.entries(values).map(([variable, value]) => ({
        variable,
        value: value || ''
      }));

      const previewText = replaceVariables(plantilla.content || '', values);

      const diligenciaData = {
        templateId: plantilla.id,  // Cambiado de plantillaId a templateId
        values: templateValues,
        previewText
      };

      console.log('📤 Enviando diligenciaData:', JSON.stringify(diligenciaData, null, 2));

      await apiService.createDiligencia(id, diligenciaData);
      await loadData();
      setShowVariablesModal(false);
      setSelectedPlantilla(null);
      setPlantillaValues({});

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Diligencia creada correctamente',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al crear diligencia:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al crear la diligencia'
      });
    }
  };

  const handleDeleteDiligencia = async (diligenciaId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await apiService.deleteDiligencia(diligenciaId);
        await loadData();
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'Diligencia eliminada correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error al eliminar diligencia:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al eliminar la diligencia'
        });
      }
    }
  };

  const handleEditDiligencia = (diligencia) => {
    setEditingDiligencia(diligencia);
    
    const initialValues = {};
    if (diligencia.valores && Array.isArray(diligencia.valores)) {
      diligencia.valores.forEach(valor => {
        if (valor && valor.variable) {
          initialValues[valor.variable] = valor.valor || '';
        }
      });
    }
    setEditValues(initialValues);
    setShowEditModal(true);
  };

  const handleSaveEditDiligencia = async () => {
    if (!editingDiligencia) return;
    
    try {
      let variables = [];
      if (editingDiligencia.plantilla_content) {
        variables = extractVariables(editingDiligencia.plantilla_content);
      }
      
      const templateValues = variables.map(variable => ({
        variable,
        value: editValues[variable] || ''
      }));
      
      const updatedData = {
        values: templateValues,
        previewText: editingDiligencia.plantilla_content ? 
          replaceVariables(editingDiligencia.plantilla_content, editValues) : 
          editingDiligencia.texto_final
      };
      
      await apiService.updateDiligencia(editingDiligencia.id, updatedData);
      await loadData();
      setShowEditModal(false);
      setEditingDiligencia(null);
      setEditValues({});
      
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Diligencia actualizada correctamente',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al actualizar diligencia:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al actualizar la diligencia'
      });
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingDiligencia(null);
    setEditValues({});
  };

  const handleShowUnifiedVariables = () => {
    setUnifiedVariables({ ...allVariables });
    setShowUnifiedVariablesModal(true);
  };

  const handleSaveUnifiedVariables = async () => {
    try {
      // Actualizar todas las diligencias que tengan variables
      const updatePromises = diligencias.map(async (diligencia) => {
        if (diligencia.plantilla_content) {
          const variables = extractVariables(diligencia.plantilla_content);
          const hasVariables = variables.some(variable => variable in unifiedVariables);
          
          if (hasVariables) {
            const templateValues = variables.map(variable => ({
              variable,
              value: unifiedVariables[variable] || ''
            }));
            
            const updatedData = {
              values: templateValues,
              previewText: replaceVariables(diligencia.plantilla_content, unifiedVariables)
            };
            
            return apiService.updateDiligencia(diligencia.id, updatedData);
          }
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
      await loadData();
      setShowUnifiedVariablesModal(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Variables asignadas correctamente a todas las diligencias',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al actualizar variables:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al actualizar las variables'
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'cerrado':
        return 'bg-gray-100 text-gray-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const plantillasFiltradas = plantillas.filter(plantilla =>
    plantilla.name?.toLowerCase().includes(searchPlantillas.toLowerCase()) ||
    plantilla.description?.toLowerCase().includes(searchPlantillas.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando atestado...</p>
        </div>
      </div>
    );
  }

  if (!atestado) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Atestado no encontrado</p>
        <Link to="/atestados" className="text-blue-500 hover:underline mt-2 inline-block">
          Volver a la lista
        </Link>
      </div>
    );
  }

  if (showPrintView) {
    return (
      <AtestadoPrintView
        atestado={atestado}
        diligencias={diligencias}
        onClose={() => setShowPrintView(false)}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Atestado #{atestado.numero}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {formatDate(atestado.fecha)} • {diligencias.length} diligencias
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPrintView(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
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
      </div>

      {/* Layout principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Barra lateral izquierda - Diligencias ordenadas */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Diligencias</h2>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                {diligencias.length}
              </span>
            </div>
            
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setShowAddDiligenciaModal(true)}
                className="flex-1 bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar
              </button>
              
              {diligencias.length > 1 && (
                <button
                  onClick={handleReorderToggle}
                  disabled={reorderLoading}
                  className={`px-3 py-2 rounded text-sm font-medium ${
                    isReordering
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  } disabled:opacity-50`}
                >
                  {isReordering ? 'Finalizar' : 'Reordenar'}
                </button>
              )}
            </div>

            {isReordering && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
                Arrastra las diligencias para cambiar su orden
                {reorderLoading && <span className="block">Guardando...</span>}
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {diligencias.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">No hay diligencias</p>
                <p className="text-xs text-gray-400 mt-1">Haz clic en "Agregar" para crear una</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {diligencias.map((diligencia, index) => (
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
                    onEdit={handleEditDiligencia}
                    onDelete={handleDeleteDiligencia}
                    isReordering={isReordering}
                    compact={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel central - Previsualización del contenido */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Información básica del atestado */}
          <div className="bg-white p-6 border-b">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">Información del Atestado</h2>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getEstadoBadgeClass(atestado?.estado)}`}>
                  {atestado?.estado || 'Sin estado'}
                </span>
              </div>
              
              {Object.keys(allVariables).length > 0 && (
                <button
                  onClick={handleShowUnifiedVariables}
                  className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Asignar Variables ({Object.keys(allVariables).length})
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Número</p>
                <p className="font-medium">{atestado?.numero || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha</p>
                <p className="font-medium">{formatDate(atestado?.fecha)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Creado</p>
                <p className="font-medium">{formatDateTime(atestado?.created_at)}</p>
              </div>
            </div>
            
            {atestado?.descripcion && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Descripción</p>
                <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{atestado.descripcion}</p>
              </div>
            )}
          </div>

          {/* Previsualización del contenido completo */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Previsualización del Atestado</h3>
                <p className="text-sm text-gray-600">Vista completa del contenido con todas las diligencias</p>
              </div>
              
              <div className="p-6">
                {diligencias.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg mb-2">Atestado vacío</p>
                    <p className="text-sm text-gray-400">Agrega diligencias para ver el contenido aquí</p>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <div className="mb-6 p-4 bg-gray-50 rounded">
                      <h4 className="text-lg font-semibold mb-2">ATESTADO #{atestado.numero}</h4>
                      <p className="text-sm text-gray-600">Fecha: {formatDate(atestado.fecha)}</p>
                      {atestado.descripcion && (
                        <p className="text-sm mt-2">{atestado.descripcion}</p>
                      )}
                    </div>

                    {diligencias.map((diligencia, index) => (
                      <div key={diligencia.id} className="mb-6 p-4 border-l-4 border-blue-500 bg-blue-50">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-semibold text-blue-900">
                            DILIGENCIA {index + 1}
                            {diligencia.plantilla_nombre && (
                              <span className="text-sm font-normal text-blue-700 ml-2">
                                ({diligencia.plantilla_nombre})
                              </span>
                            )}
                          </h5>
                          <span className="text-xs text-blue-600">
                            {formatDateTime(diligencia.created_at)}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {diligencia.texto_final || 'Sin contenido'}
                        </div>

                        {diligencia.valores && diligencia.valores.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <p className="text-xs text-blue-600 mb-2">Variables utilizadas:</p>
                            <div className="flex flex-wrap gap-1">
                              {diligencia.valores.map((valor, idx) => (
                                <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                  {valor.variable}: {valor.valor || '(vacío)'}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para agregar diligencia */}
      {showAddDiligenciaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Seleccionar Plantilla</h3>
                <button
                  onClick={() => setShowAddDiligenciaModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <input
                type="text"
                placeholder="Buscar plantillas..."
                value={searchPlantillas}
                onChange={(e) => setSearchPlantillas(e.target.value)}
                className="w-full mt-3 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {plantillasFiltradas.map(plantilla => {
                  const variables = extractVariables(plantilla.content || '');
                  return (
                    <div
                      key={plantilla.id}
                      onClick={() => handleAddDiligencia(plantilla)}
                      className="p-3 border rounded cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-colors"
                    >
                      <h4 className="font-medium text-sm mb-1">{plantilla.name}</h4>
                      <p className="text-xs text-gray-600 mb-2">
                        {plantilla.description || 'Sin descripción'}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Variables: {variables.length}</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          Seleccionar
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {plantillasFiltradas.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No se encontraron plantillas</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal para variables de plantilla individual */}
      {showVariablesModal && selectedPlantilla && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Completar Variables</h3>
              <p className="text-sm text-gray-600">Plantilla: {selectedPlantilla.name}</p>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              {extractVariables(selectedPlantilla.content || '').map(variable => (
                <div key={variable} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {variable}
                  </label>
                  <input
                    type="text"
                    value={plantillaValues[variable] || ''}
                    onChange={(e) => setPlantillaValues(prev => ({
                      ...prev,
                      [variable]: e.target.value
                    }))}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Ingrese valor para ${variable}`}
                  />
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowVariablesModal(false);
                  setSelectedPlantilla(null);
                  setPlantillaValues({});
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => createDiligenciaFromPlantilla(selectedPlantilla, plantillaValues)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Crear Diligencia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para variables unificadas */}
      {showUnifiedVariablesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Asignar Variables Globales</h3>
              <p className="text-sm text-gray-600">
                Estas variables se aplicarán a todas las diligencias que las contengan
              </p>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              {Object.keys(allVariables).map(variable => (
                <div key={variable} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {variable}
                  </label>
                  <input
                    type="text"
                    value={unifiedVariables[variable] || ''}
                    onChange={(e) => setUnifiedVariables(prev => ({
                      ...prev,
                      [variable]: e.target.value
                    }))}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={`Ingrese valor para ${variable}`}
                  />
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowUnifiedVariablesModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUnifiedVariables}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Aplicar a Todas las Diligencias
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar diligencia */}
      {showEditModal && editingDiligencia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Editar Diligencia</h3>
              <p className="text-sm text-gray-600">
                {editingDiligencia.plantilla_nombre || 'Diligencia personalizada'}
              </p>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              {editingDiligencia.plantilla_content ? (
                extractVariables(editingDiligencia.plantilla_content).map(variable => (
                  <div key={variable} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {variable}
                    </label>
                    <input
                      type="text"
                      value={editValues[variable] || ''}
                      onChange={(e) => setEditValues(prev => ({
                        ...prev,
                        [variable]: e.target.value
                      }))}
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Ingrese valor para ${variable}`}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Esta diligencia no tiene variables editables</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEditDiligencia}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AtestadoDetail;