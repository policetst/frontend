// pages/AtestadoDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiService from '../../services/apiService';
import DraggableDiligencia from './DraggableDiligencia';
import AtestadoPrintView from './AtestadoPrintView';
import { extractVariables, replaceVariables } from '../utils/types';
import Swal from 'sweetalert2';

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

  useEffect(() => {
    loadData();
    loadPlantillas();
  }, [id]);

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

  // Funciones para drag & drop de plantillas
  const handlePlantillaDragStart = (e, plantilla) => {
    console.log('🚀 Iniciando arrastre de plantilla:', plantilla.name);
    e.dataTransfer.setData('text/plain', JSON.stringify(plantilla));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleAtestadoDrop = (e) => {
    e.preventDefault();
    console.log('📥 Drop detectado en zona de atestado');
    try {
      const plantillaData = JSON.parse(e.dataTransfer.getData('text/plain'));
      console.log('📋 Plantilla recibida:', plantillaData.name);
      setSelectedPlantilla(plantillaData);
      const variables = extractVariables(plantillaData.content || '');
      console.log('🔧 Variables encontradas:', variables.length);
      if (variables.length > 0) {
        setPlantillaValues({});
        setShowVariablesModal(true);
      } else {
        // Si no hay variables, crear diligencia directamente
        createDiligenciaFromPlantilla(plantillaData, {});
      }
    } catch (error) {
      console.error('❌ Error al procesar plantilla:', error);
    }
  };

  const handleAtestadoDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    console.log('🎯 Drag over zona de atestado');
  };

  const createDiligenciaFromPlantilla = async (plantilla, values) => {
    try {
      console.log('🔍 DEBUG Frontend - Creando diligencia:');
      console.log('📋 Plantilla completa:', JSON.stringify(plantilla, null, 2));
      console.log('🆔 plantilla.id:', plantilla.id, 'tipo:', typeof plantilla.id);
      console.log('📝 values recibidos:', values);
      
      const variables = extractVariables(plantilla.content || '');
      console.log('🔧 Variables extraídas:', variables);
      
      const templateValues = variables.map(variable => ({
        variable,
        value: values[variable] || ''
      }));
      console.log('📊 Template values mapeados:', templateValues);

      const diligenciaData = {
        templateId: plantilla.id,
        values: templateValues,
        previewText: replaceVariables(plantilla.content, values)
      };
      
      console.log('📤 Datos a enviar:', JSON.stringify(diligenciaData, null, 2));
      console.log('🎯 Atestado ID:', id);

      await apiService.createDiligencia(id, diligenciaData);
      await loadData(); // Recargar datos
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

  // Función para eliminar diligencia
  const handleDeleteDiligencia = async (diligenciaId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres eliminar esta diligencia?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
      return;
    }
    
    try {
      await apiService.deleteDiligencia(diligenciaId);
      await loadData(); // Recargar datos
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
  };

  // Función para editar diligencia
  const handleEditDiligencia = (diligencia) => {
    setEditingDiligencia(diligencia);
    
    // Si la diligencia tiene valores, los cargamos
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

  // Función para guardar cambios en diligencia
  const handleSaveEditDiligencia = async () => {
    if (!editingDiligencia) return;
    
    try {
      // Obtener variables de la plantilla original si existe
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
      await loadData(); // Recargar datos
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

  // Función para cancelar edición
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingDiligencia(null);
    setEditValues({});
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al actualizar el orden de las diligencias'
      });
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

  // Filtrar plantillas
  const plantillasFiltradas = plantillas.filter(plantilla => {
    if (!searchPlantillas) return true;
    const searchLower = searchPlantillas.toLowerCase();
    return (
      plantilla.name?.toLowerCase().includes(searchLower) ||
      plantilla.description?.toLowerCase().includes(searchLower) ||
      plantilla.content?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">SISTEMA INCIDENCIAS LOCALES</h1>
          <p className="text-gray-600">Atestado #{atestado?.numero || id}</p>
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

      {/* Layout de tres paneles */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel izquierdo - Plantillas de diligencias */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold mb-3">Crear diligencia</h2>
            <input
              type="text"
              placeholder="Buscar plantillas..."
              value={searchPlantillas}
              onChange={(e) => setSearchPlantillas(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {plantillasFiltradas.map(plantilla => {
                const variables = extractVariables(plantilla.content || '');
                return (
                  <div
                    key={plantilla.id}
                    draggable
                    onDragStart={(e) => handlePlantillaDragStart(e, plantilla)}
                    className="p-3 border rounded cursor-move hover:bg-gray-50 hover:border-blue-300 transition-colors"
                  >
                    <h3 className="font-medium text-sm mb-1">{plantilla.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {plantilla.description || 'Sin descripción'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Variables: {variables.length}</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Arrastrar
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

        {/* Panel central - Información del atestado y diligencias */}
        <div 
          className="flex-1 flex flex-col bg-gray-50"
          onDrop={handleAtestadoDrop}
          onDragOver={handleAtestadoDragOver}
        >
          {/* Información básica del atestado */}
          <div className="bg-white p-6 border-b">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">Información del Atestado</h2>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getEstadoBadgeClass(atestado?.estado)}`}>
                  {atestado?.estado || 'Sin estado'}
                </span>
              </div>
              <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded border-2 border-dashed border-blue-300">
                <p className="font-medium text-blue-700">💡 Zona de arrastre</p>
                <p>Arrastra plantillas aquí para crear diligencias</p>
              </div>
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

          {/* Lista de diligencias */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Diligencias ({diligencias.length})
              </h2>
              <div className="flex gap-2">
                {diligencias.length > 1 && (
                  <button
                    onClick={handleReorderToggle}
                    disabled={reorderLoading}
                    className={`px-4 py-2 rounded text-sm font-medium ${
                      isReordering
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    } disabled:opacity-50`}
                  >
                    {isReordering ? 'Finalizar Reorden' : 'Reordenar'}
                  </button>
                )}
                <Link
                  to={`/atestados/${id}/diligencias/nueva`}
                  className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600"
                >
                  + Nueva Diligencia
                </Link>
              </div>
            </div>

            {diligencias.length === 0 ? (
              <div className="text-center py-12 bg-white rounded border-2 border-dashed border-gray-300">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-2">No hay diligencias en este atestado</p>
                <p className="text-sm text-gray-400">Arrastra plantillas desde el panel izquierdo o crea una nueva diligencia</p>
              </div>
            ) : (
              <div className="space-y-4">
                {isReordering && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
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
                      onEdit={handleEditDiligencia}
                      onDelete={handleDeleteDiligencia}
                    />
                  ) : (
                    <div key={diligencia.id} className="bg-white border rounded p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">
                          Diligencia #{index + 1}
                          {diligencia.plantilla_nombre && (
                            <span className="text-sm text-gray-500 ml-2">
                              (Plantilla: {diligencia.plantilla_nombre})
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {formatDateTime(diligencia.created_at)}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditDiligencia(diligencia)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded"
                              title="Editar diligencia"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteDiligencia(diligencia.id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded"
                              title="Eliminar diligencia"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-wrap text-gray-700 text-sm">
                          {diligencia.texto_final || diligencia.content || 'Sin contenido'}
                        </p>
                      </div>
                      {diligencia.valores && Array.isArray(diligencia.valores) && diligencia.valores.length > 0 && diligencia.valores.some(valor => valor && valor.variable) && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-2">Variables utilizadas:</p>
                          <div className="flex flex-wrap gap-1">
                            {diligencia.valores.filter(valor => valor && valor.variable).map((valor, idx) => (
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
        </div>
      </div>



      {/* Modal de edición de diligencia */}
      {showEditModal && editingDiligencia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Editar Diligencia #{diligencias.findIndex(d => d.id === editingDiligencia.id) + 1}
              </h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {editingDiligencia.plantilla_nombre && (
              <div className="mb-4 p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Plantilla:</strong> {editingDiligencia.plantilla_nombre}
                </p>
              </div>
            )}
            
            {/* Variables de la plantilla */}
            {editingDiligencia.plantilla_content && (() => {
              const variables = extractVariables(editingDiligencia.plantilla_content);
              return variables.length > 0 ? (
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-gray-900">Variables de la plantilla:</h4>
                  {variables.map((variable, index) => (
                    <div key={index}>
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
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Valor para ${variable}`}
                      />
                    </div>
                  ))}
                </div>
              ) : null;
            })()}
            
            {/* Vista previa */}
            {editingDiligencia.plantilla_content && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Vista previa:</h4>
                <div className="p-3 bg-gray-50 rounded border min-h-[100px] text-sm">
                  <div className="whitespace-pre-wrap">
                    {replaceVariables(editingDiligencia.plantilla_content, editValues)}
                  </div>
                </div>
              </div>
            )}
            
            {/* Contenido actual si no hay plantilla */}
            {!editingDiligencia.plantilla_content && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Contenido actual:</h4>
                <div className="p-3 bg-gray-50 rounded border min-h-[100px] text-sm">
                  <div className="whitespace-pre-wrap">
                    {editingDiligencia.texto_final || editingDiligencia.content || 'Sin contenido'}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Esta diligencia no tiene plantilla asociada, por lo que no se puede editar el contenido.
                </p>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEditDiligencia}
                disabled={!editingDiligencia.plantilla_content}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de variables para plantilla arrastrada */}
      {showVariablesModal && selectedPlantilla && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Completar Variables - {selectedPlantilla.name}
              </h3>
              <button
                onClick={() => {
                  setShowVariablesModal(false);
                  setSelectedPlantilla(null);
                  setPlantillaValues({});
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-800">
                <strong>Plantilla:</strong> {selectedPlantilla.name}
              </p>
              {selectedPlantilla.description && (
                <p className="text-sm text-blue-600 mt-1">
                  {selectedPlantilla.description}
                </p>
              )}
            </div>
            
            {/* Variables de la plantilla */}
            {(() => {
              const variables = extractVariables(selectedPlantilla.content || '');
              return variables.length > 0 ? (
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium text-gray-900">Completar variables ({variables.length}):</h4>
                  {variables.map((variable, index) => (
                    <div key={index}>
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
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Valor para ${variable}`}
                      />
                    </div>
                  ))}
                </div>
              ) : null;
            })()}
            
            {/* Vista previa */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Vista previa:</h4>
              <div className="p-3 bg-gray-50 rounded border min-h-[100px] text-sm">
                <div className="whitespace-pre-wrap">
                  {replaceVariables(selectedPlantilla.content || '', plantillaValues)}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowVariablesModal(false);
                  setSelectedPlantilla(null);
                  setPlantillaValues({});
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => createDiligenciaFromPlantilla(selectedPlantilla, plantillaValues)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Crear Diligencia
              </button>
            </div>
          </div>
        </div>
      )}

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