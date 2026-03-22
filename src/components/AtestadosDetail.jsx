 // pages/AtestadoDetail.jsx
<<<<<<< Updated upstream
 import React, { useState, useEffect, useMemo } from 'react';
 import { useParams, Link } from 'react-router-dom';
=======
 import React, { useState, useEffect, useMemo, useRef } from 'react';
 import { useParams, Link, useNavigate } from 'react-router-dom';
>>>>>>> Stashed changes
 import apiService from '../../services/apiService';
 import DraggableDiligencia from './DraggableDiligencia';
 import AtestadoPrintView from './AtestadoPrintView';
 import AtestadoTicketView from './AtestadoTicketView';
 import { extractVariables, replaceVariables } from '../utils/types';
 import Swal from 'sweetalert2';
 import './AtestadosDetail.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

 const AtestadoDetail = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const [atestado, setAtestado] = useState(null);
   const [diligencias, setDiligencias] = useState([]);
   const [plantillas, setPlantillas] = useState([]);
   const [loading, setLoading] = useState(true);
   const [isReordering, setIsReordering] = useState(false);
   const [draggedIndex, setDraggedIndex] = useState(null);
   const [dragOverIndex, setDragOverIndex] = useState(null);
   const [showPrintView, setShowPrintView] = useState(false);
   const [showTicketView, setShowTicketView] = useState(false);
   const [reorderLoading, setReorderLoading] = useState(false);
   const [selectedPlantilla, setSelectedPlantilla] = useState(null);
   const [plantillaValues, setPlantillaValues] = useState({});
   const [showVariablesModal, setShowVariablesModal] = useState(false);
   const [searchPlantillas, setSearchPlantillas] = useState('');
   const [editingDiligencia, setEditingDiligencia] = useState(null);
   const [showEditModal, setShowEditModal] = useState(false);
   const [editValues, setEditValues] = useState({});
   const [showAddDiligenciaModal, setShowAddDiligenciaModal] = useState(false);
   const [showUnifiedVariablesModal, setShowUnifiedVariablesModal] = useState(false);
   const [unifiedVariables, setUnifiedVariables] = useState({});
<<<<<<< Updated upstream
=======
       const [showKeywordValuesModal, setShowKeywordValuesModal] = useState(false);
    const [showUsedPreview, setShowUsedPreview] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [finalPreviewDiligencias, setFinalPreviewDiligencias] = useState([]);
>>>>>>> Stashed changes

  // Funciones de utilidad
  const formatDateTime = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleString('es-ES');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  useEffect(() => {
    loadData();
    loadPlantillas();
  }, [id]);

  // Calcular variables unificadas
  const allVariables = useMemo(() => {
    if (!diligencias.length) return {};

    const variablesMap = new Map();
    diligencias.forEach((diligencia) => {
      if (diligencia.plantilla_content) {
        const variables = extractVariables(diligencia.plantilla_content);
        variables.forEach(variable => {
          if (!variablesMap.has(variable)) {
            variablesMap.set(variable, '');
          }
        });
      }
    });

    return Object.fromEntries(variablesMap);
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
      setPlantillas(response.plantillas || response || []);
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
    }
  };

  const handleReorderToggle = async () => {
    if (isReordering) {
      // Finalizar reordenamiento
      setIsReordering(false);
      setDraggedIndex(null);
      setDragOverIndex(null);
    } else {
      // Iniciar reordenamiento
      setIsReordering(true);
    }
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index) => {
    setDragOverIndex(index);
  };

  const handleDrop = async (draggedIndex, dropIndex) => {
    if (draggedIndex === dropIndex) return;

    setReorderLoading(true);
    try {
      const newDiligencias = [...diligencias];
      const [draggedItem] = newDiligencias.splice(draggedIndex, 1);
      newDiligencias.splice(dropIndex, 0, draggedItem);

      const diligenciasOrder = newDiligencias.map((diligencia, index) => ({
        id: diligencia.id,
        orden: index + 1
      }));

      await apiService.reorderDiligencias(id, diligenciasOrder);
      await loadData();

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Orden actualizado correctamente',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al reordenar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al actualizar el orden'
      });
    } finally {
      setReorderLoading(false);
      setDraggedIndex(null);
      setDragOverIndex(null);
    }
  };

  const handleAddDiligencia = () => {
    setShowAddDiligenciaModal(true);
  };

  const createDiligenciaFromPlantilla = async () => {
    if (!selectedPlantilla) return;

    try {
      const variables = extractVariables(selectedPlantilla.content || '');
      const templateValues = variables.map(variable => ({
        variable,
        value: plantillaValues[variable] || ''
      }));

      const diligenciaData = {
        templateId: selectedPlantilla.id,
        values: templateValues,
        previewText: replaceVariables(selectedPlantilla.content || '', plantillaValues)
      };

      await apiService.createDiligencia(id, diligenciaData);
      await loadData();

      setShowVariablesModal(false);
      setShowAddDiligenciaModal(false);
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
          title: 'Eliminada',
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
    
    if (diligencia.plantilla_content) {
      const variables = extractVariables(diligencia.plantilla_content);
      const currentValues = {};
      
      if (diligencia.valores) {
        diligencia.valores.forEach(valor => {
          currentValues[valor.variable] = valor.valor;
        });
      }
      
      setEditValues(currentValues);
    }
    
    setShowEditModal(true);
  };

  const handleSaveEditDiligencia = async () => {
    try {
      const variables = extractVariables(editingDiligencia.plantilla_content || '');
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

<<<<<<< Updated upstream
=======

  const handleApplyUnifiedVariables = () => {
    const processed = diligencias.map(d => {
      const content = d.plantilla_content || d.content || d.texto_final || '';
      const finalContent = replaceVariables(content, unifiedVariables);
      return { ...d, texto_final: finalContent };
    });
    setFinalPreviewDiligencias(processed);
    setShowUnifiedVariablesModal(false);
    setShowUsedPreview(true);
  };

  const handleConfirmFinalAtestado = async () => {
    if (!atestado) return;
    setIsFinalizing(true);
    try {
      const newAtestado = {
        numero: `${atestado.numero || 'AT'}-U-${Date.now().toString().slice(-6)}`,
        tipo: atestado.tipo || '',
        descripcion: atestado.descripcion || '',
        fecha: new Date().toISOString().split('T')[0],
        is_final: true,
        id_template_original: atestado.id
      };
      const created = await apiService.createAtestado(newAtestado);
      const newAtestadoId = created.atestado?.id || created.id;
      for (const d of finalPreviewDiligencias) {
        const payload = {
          templateId: d.plantilla_id || d.templateId || null,
          values: Object.entries(unifiedVariables).filter(([k]) => (d.plantilla_content || '').includes(`{${k}}`)).map(([variable, value]) => ({ variable, value })),
          previewText: d.texto_final,
          texto_final: d.texto_final,
          croquis: d.croquis || null,
          croquis_descripcion: d.croquis_descripcion || null
        };
        await apiService.createDiligencia(newAtestadoId, payload);
      }
      Swal.fire({ 
        icon: 'success', 
        title: 'Atestado Finalizado', 
        text: 'Se ha creado el documento en la sección de usados.',
        confirmButtonColor: '#002856',
        timer: 1500
      }).then(() => { 
        localStorage.setItem('atestados_active_tab', 'used');
        navigate(`/atestados`); 
      });
    } catch (error) { console.error('Error al finalizar:', error); Swal.fire('Error', 'No se pudo finalizar el atestado', 'error'); } finally { setIsFinalizing(false); }
  };

  const handleReplicateAtestado = async () => {
    if (!atestado) return;
    const confirmRep = await Swal.fire({
      title: '¿Replicar atestado?',
      text: '¿Deseas replicar este atestado con los nuevos valores de palabras clave?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#002856',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, replicar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmRep.isConfirmed) {
      return;
    }

    setReplicateLoading(true);
    try {
      const newAtestado = {
        numero: `${atestado.numero || 'AT'} - copia`,
        tipo: atestado.tipo || '',
        descripcion: atestado.descripcion || '',
        fecha: new Date().toISOString().split('T')[0]
      };

      const created = await apiService.createAtestado(newAtestado);
      const newAtestadoId = created.atestado?.id || created.id;

      for (const diligencia of diligencias) {
        const variableMap = {};
        (diligencia.valores || []).forEach((v) => {
          variableMap[v.variable] = replicateValues[v.variable]?.trim() || v.valor || '';
        });

        const replacedPreview = replaceVariables(diligencia.previewText || '', replicateValues);
        const replacedTextoFinal = replaceVariables(diligencia.texto_final || diligencia.previewText || '', replicateValues);

        const replicatePayload = {
          templateId: diligencia.plantilla_id || diligencia.templateId || null,
          values: Object.entries(variableMap).map(([variable, value]) => ({ variable, value })),
          previewText: replacedPreview || diligencia.previewText || '',
          texto_final: replacedTextoFinal || diligencia.texto_final || '',
          croquis: diligencia.croquis || null,
          croquis_descripcion: diligencia.croquis_descripcion || ''
        };

        await apiService.createDiligencia(newAtestadoId, replicatePayload);
      }

      setShowReplicateModal(false);
      setReplicateValues({});
      Swal.fire({
        icon: 'success',
        title: 'Atestado replicado',
        text: 'Se ha replicado el atestado con las nuevas palabras clave.',
        timer: 2000,
        showConfirmButton: false
      });
      navigate(`/atestados/${newAtestadoId}`);
    } catch (error) {
      console.error('Error al replicar atestado:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo replicar el atestado. Intenta nuevamente.'
      });
    } finally {
      setReplicateLoading(false);
    }
  };

>>>>>>> Stashed changes
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

  if (showTicketView) {
    return (
      <AtestadoTicketView
        atestado={atestado}
        diligencias={diligencias}
        onClose={() => setShowTicketView(false)}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
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
            {!(atestado?.is_final || atestado?.numero?.includes('-U-')) && (
              <Link
                to={`/atestados/${id}/editar`}
                className="bg-white text-green-600 px-4 py-2 rounded border border-green-600 hover:bg-green-600 hover:text-white transition-all font-bold"
              >
                Editar Información
              </Link>
            )}
            <Link
              to="/atestados"
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-black transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </Link>
          </div>
        </div>
      </div>

      {/* Layout principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Barra lateral izquierda - Hojas del atestado */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Hojas del Atestado</h2>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                {diligencias.length + 1}
              </span>
            </div>
            
<<<<<<< Updated upstream
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setShowAddDiligenciaModal(true)}
                className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 flex items-center justify-center gap-1 transition-colors"
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
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    isReordering
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:opacity-50`}
                >
                  {isReordering ? 'Finalizar' : 'Reordenar'}
                </button>
=======
            <div className="flex flex-col gap-3 mb-3">
              {!atestado?.is_final && (
                <div className="flex gap-2 mb-1">
                  <button
                    onClick={() => setShowAddDiligenciaModal(true)}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 flex items-center justify-center gap-1 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Diligencia
                  </button>
                  <button
                    onClick={() => setShowCroquisModal(true)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center gap-1 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M5 7v12a2 2 0 002 2h10a2 2 0 002-2V7M9 10h6M9 14h6" />
                    </svg>
                    Croquis
                  </button>
                </div>
              )}

              {!(atestado?.is_final || atestado?.numero?.includes('-U-')) && diligencias.length > 0 && (
                <div className="flex flex-col gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <h4 className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Acciones de plantilla</h4>
                  <button
                    onClick={() => setShowUnifiedVariablesModal(true)}
                    className="w-full bg-indigo-600 text-white px-3 py-3 rounded text-sm font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                  >
                    🚀 USAR ESTE ATESTADO
                  </button>
                  {diligencias.length > 1 && (
                    <button
                      onClick={handleReorderToggle}
                      disabled={reorderLoading}
                      className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
                        isReordering ? 'bg-yellow-600 text-white' : 'bg-white text-blue-700 border border-blue-200'
                      }`}
                    >
                      {isReordering ? 'Finalizar' : '🔃 Reordenar'}
                    </button>
                  )}
                </div>
              )}

              {(atestado?.is_final || atestado?.numero?.includes('-U-')) && (
                <div className="flex flex-col gap-2 p-3 bg-[#002856]/5 border border-[#002856]/10 rounded-lg">
                  <h4 className="text-[10px] font-bold text-[#002856] uppercase tracking-wider">Documento finalizado</h4>
                  <button
                    onClick={() => setShowPrintView(true)}
                    className="w-full bg-[#002856] text-white px-3 py-3 rounded text-sm font-bold hover:bg-[#002856]/90 flex items-center justify-center gap-2 transition-colors"
                  >
                    🖨️ Imprimir Atestado
                  </button>
                  <button
                    onClick={() => setShowTicketView(true)}
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded text-sm font-bold hover:bg-gray-900 flex items-center justify-center gap-2 transition-colors"
                  >
                    🎫 Ticket Rápido
                  </button>
                </div>
>>>>>>> Stashed changes
              )}
            </div>

            {isReordering && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
                Arrastra las diligencias para cambiar su orden
                {reorderLoading && <span className="block">Guardando...</span>}
              </div>
            )}

<<<<<<< Updated upstream
            {Object.keys(allVariables).length > 0 && (
              <button
                onClick={handleShowUnifiedVariables}
                className="w-full bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 flex items-center justify-center gap-2 mt-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Palabras Clave ({Object.keys(allVariables).length})
              </button>
            )}
=======
>>>>>>> Stashed changes
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Hoja de información básica del atestado */}
            <div className="p-3">
              <div className="police-document-sheet bg-white border border-gray-300 rounded p-4 mb-3 shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-700 text-white rounded flex items-center justify-center text-sm font-bold">
                      📋
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">INFORMACIÓN BÁSICA</h3>
                      <p className="text-xs text-gray-600">Datos del atestado</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Número:</span>
                    <span className="text-gray-900 font-bold">{atestado?.numero || 'No especificado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Fecha:</span>
                    <span className="text-gray-900">{formatDate(atestado?.fecha)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Creado:</span>
                    <span className="text-gray-900">{formatDateTime(atestado?.created_at)}</span>
                  </div>
                </div>
                
                {atestado?.descripcion && (
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600 font-medium mb-1">Descripción:</p>
                    <p className="text-xs text-gray-800 line-clamp-2">{atestado.descripcion}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Diligencias como hojas */}
            {diligencias.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">No hay diligencias</p>
                <p className="text-xs text-gray-400 mt-1">Haz clic en "Agregar" para crear una</p>
              </div>
            ) : (
              <div className="p-3 space-y-3">
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
                    isFinal={atestado?.is_final}
                    compact={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel central - Vista de documento oficial */}
        <div className="flex-1 flex flex-col bg-gray-100">
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="max-w-4xl mx-auto">
              {/* Documento oficial del atestado */}
              <div className="police-full-document bg-white shadow-lg border border-gray-300 overflow-hidden">
                {/* Encabezado oficial */}
                <div className="bg-gray-800 text-white p-6 text-center">
                  <h1 className="text-2xl font-bold mb-2">ATESTADO POLICIAL</h1>
                  <div className="text-lg font-semibold">Nº {atestado?.numero || 'Sin número'}</div>
                  <div className="text-sm opacity-90 mt-2">
                    Fecha: {formatDate(atestado?.fecha)}
                  </div>
                </div>

                {/* Información básica como primera hoja */}
                <div className="p-8 border-b-2 border-gray-300 bg-white">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gray-700 text-white rounded flex items-center justify-center text-lg">
                      📋
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">INFORMACIÓN BÁSICA</h2>
                      <p className="text-gray-700">Datos generales del atestado</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <label className="block text-sm font-bold text-gray-800 mb-1">NÚMERO DE ATESTADO</label>
                        <div className="text-lg font-bold text-gray-900">{atestado?.numero || 'No especificado'}</div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <label className="block text-sm font-bold text-gray-800 mb-1">FECHA</label>
                        <div className="text-lg font-bold text-gray-900">{formatDate(atestado?.fecha)}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <label className="block text-sm font-bold text-gray-800 mb-1">FECHA DE CREACIÓN</label>
                        <div className="text-lg font-bold text-gray-900">{formatDateTime(atestado?.created_at)}</div>
                      </div>
                      
                      {atestado?.updated_at && (
                        <div className="bg-gray-50 p-4 rounded border border-gray-200">
                          <label className="block text-sm font-bold text-gray-800 mb-1">ÚLTIMA MODIFICACIÓN</label>
                          <div className="text-lg font-bold text-gray-900">{formatDateTime(atestado?.updated_at)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {atestado?.descripcion && (
                    <div className="bg-gray-50 p-4 rounded border border-gray-200">
                      <label className="block text-sm font-bold text-gray-800 mb-2">DESCRIPCIÓN</label>
                      <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{atestado.descripcion}</div>
                    </div>
                  )}
                </div>

                {/* Diligencias como hojas numeradas */}
                {diligencias.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-xl font-semibold mb-2">Atestado sin diligencias</h3>
                    <p className="text-gray-400">Agrega diligencias para completar el atestado</p>
                  </div>
                ) : (
                  <div className="divide-y-2 divide-gray-300">
                    {diligencias.map((diligencia, index) => (
                      <div key={diligencia.id} className="p-8 bg-white">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 bg-gray-700 text-white rounded flex items-center justify-center text-lg font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">DILIGENCIA {index + 1}</h2>
                            <div className="flex items-center gap-4 text-gray-700">
                              {diligencia.plantilla_nombre && (
                                <span className="font-medium">Plantilla: {diligencia.plantilla_nombre}</span>
                              )}
                              <span className="text-sm">Fecha: {formatDateTime(diligencia.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-8 rounded border-2 border-gray-200 prose prose-slate max-w-none prose-sm sm:prose-base font-sans mt-2">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm, remarkBreaks]}
                            components={{
                              table: ({node, ...props}) => (
                                <div className="overflow-x-auto my-4 border rounded">
                                  <table className="min-w-full divide-y divide-gray-300 border-collapse" {...props} />
                                </div>
                              ),
                              th: ({node, ...props}) => <th className="bg-gray-100 px-3 py-2 text-left text-xs font-bold text-gray-700 border" {...props} />,
                              td: ({node, ...props}) => <td className="px-3 py-2 text-sm text-gray-800 border" {...props} />,
                              p: ({node, ...props}) => <p className="leading-relaxed mb-4 whitespace-pre-wrap" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-bold text-gray-900" style={{ fontWeight: 'bold' }} {...props} />,
                              em: ({node, ...props}) => <em className="italic text-gray-800" style={{ fontStyle: 'italic' }} {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-300 pb-1 mt-6 mb-3" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc ml-8 my-4 space-y-2 block" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal ml-8 my-4 space-y-2 block" {...props} />,
                              li: ({node, ...props}) => <li className="text-gray-800 pl-1" {...props} />,
                            }}
                          >
                            {diligencia.texto_final || 'Sin contenido'}
<<<<<<< Updated upstream
                          </div>
=======
                          </ReactMarkdown>
                          {diligencia.croquis && (
                            <div className="mt-3 border rounded overflow-hidden bg-white">
                              <img src={diligencia.croquis} alt="Croquis policial" className="w-full h-40 object-cover" />
                            </div>
                          )}
>>>>>>> Stashed changes
                        </div>

                        {diligencia.valores && diligencia.valores.length > 0 && (
                          <div className="mt-4 bg-gray-100 p-4 rounded border border-gray-300">
                            <h4 className="text-sm font-bold text-gray-800 mb-2">Palabras clave utilizadas:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {diligencia.valores.map((valor, idx) => (
                                <div key={idx} className="bg-white p-2 rounded border border-gray-200">
                                  <span className="text-xs font-bold text-gray-700">{valor.variable}:</span>
                                  <span className="text-sm text-gray-900 ml-2">{valor.valor || '(vacío)'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pie del documento */}
                <div className="bg-gray-200 p-6 text-center border-t-2 border-gray-400">
                  <p className="text-sm text-gray-700 font-medium">
                    Documento generado el {formatDateTime(new Date().toISOString())}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Total de hojas: {diligencias.length + 1} (1 información básica + {diligencias.length} diligencias)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para agregar diligencia - SIN VARIABLES */}
      {showAddDiligenciaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Seleccionar Plantilla</h3>
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
                {plantillasFiltradas.map(plantilla => (
                  <div
                    key={plantilla.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={async () => {
                      try {
                        const diligenciaData = {
                          templateId: plantilla.id,
                          values: [],
                          previewText: plantilla.content || ''
                        };

                        await apiService.createDiligencia(id, diligenciaData);
                        await loadData();

                        setShowAddDiligenciaModal(false);
                        setSearchPlantillas('');

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
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{plantilla.name}</h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {extractVariables(plantilla.content || '').length} variables
                      </span>
                    </div>
                    
                    {plantilla.description && (
                      <p className="text-sm text-gray-600">{plantilla.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para asignar variables unificadas */}
      {showUnifiedVariablesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] h-[90vh] overflow-hidden flex flex-col scale-in-center">
            <div className="p-4 border-b bg-indigo-600 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Preparar Atestado Final</h3>
                  <p className="text-xs text-indigo-100">Completa las variables y revisa el resultado en tiempo real</p>
                </div>
              </div>
              <button onClick={() => setShowUnifiedVariablesModal(false)} className="text-white/80 hover:text-white transition-colors p-2">✕</button>
            </div>
            
            <div className="flex-1 flex overflow-hidden bg-gray-100">
              {/* Columna Izquierda: Entradas */}
              <div className="w-1/3 border-r bg-white flex flex-col shadow-inner">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center shrink-0">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Variables ({Object.keys(allVariables).length})</span>
                  <button 
                    onClick={() => setUnifiedVariables({})}
                    className="text-[10px] text-indigo-600 hover:underline font-bold"
                  >
                    LIMPIAR TODO
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  {Object.keys(allVariables).length === 0 ? (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-700 text-sm italic">
                      Este atestado no contiene palabras clave detectadas. Puedes continuar directamente a la vista previa.
                    </div>
                  ) : (
                    Object.keys(allVariables).map(variable => (
                      <div key={variable} className="group animate-in slide-in-from-left-2 duration-200">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 group-focus-within:text-indigo-600 transition-colors px-1">
                          {variable.replace(/_/g, ' ')}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={unifiedVariables[variable] || ''}
                            onChange={(e) => setUnifiedVariables(prev => ({
                              ...prev,
                              [variable]: e.target.value
                            }))}
                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                            placeholder={`Ingresa ${variable.toLowerCase()}...`}
                          />
                          {unifiedVariables[variable] && (
                            <button 
                              onClick={() => setUnifiedVariables(prev => ({ ...prev, [variable]: '' }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Columna Derecha: Vista Previa en Vivo */}
              <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar bg-gray-200/50">
                <div className="max-w-2xl mx-auto space-y-8">
                  <div className="bg-white p-10 shadow-xl border border-gray-300 relative rounded-sm">

                    <div className="text-center mb-8">
                      <h1 className="text-xl font-black text-gray-900 mb-1 uppercase tracking-widest">Atestado Policial</h1>
                      <div className="w-12 h-0.5 bg-gray-800 mx-auto"></div>
                    </div>
                    
                    <div className="space-y-12">
                      {diligencias.map((d, idx) => {
                        const content = d.plantilla_content || d.content || d.texto_final || '';
                        const liveFinalContent = replaceVariables(content, unifiedVariables);
                        
                        return (
                          <div key={idx} className="relative">
                            <div className="absolute -left-10 top-0 text-[10px] font-black text-gray-300 transform -rotate-90 origin-right whitespace-nowrap">
                              DILIGENCIA {idx + 1}
                            </div>
                            <div className="prose prose-sm max-w-none text-[13px] leading-relaxed font-serif text-gray-800">
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm, remarkBreaks]}
                                components={{
                                  table: ({node, ...props}) => (
                                    <div className="overflow-x-auto my-4 border rounded">
                                      <table className="min-w-full divide-y divide-gray-200 border-collapse" {...props} />
                                    </div>
                                  ),
                                  th: ({node, ...props}) => <th className="bg-gray-50 px-2 py-1 text-left text-[10px] font-bold text-gray-600 border uppercase tracking-wider" {...props} />,
                                  td: ({node, ...props}) => <td className="px-2 py-1 text-[11px] text-gray-700 border border-gray-50" {...props} />,
                                  p: ({node, ...props}) => <p className="mb-4 whitespace-pre-wrap" {...props} />,
                                  strong: ({node, ...props}) => {
                                    const isVariable = typeof props.children === 'string' && props.children.startsWith('{') && props.children.endsWith('}');
                                    return <strong className={`${isVariable ? 'text-amber-600' : 'text-gray-950'} font-bold`} style={{ fontWeight: 'bold' }} {...props} />;
                                  },
                                  em: ({node, ...props}) => <em className="italic text-gray-900 bg-amber-50" style={{ fontStyle: 'italic' }} {...props} />,
                                  h3: ({node, ...props}) => <h3 className="text-sm font-black text-gray-900 border-b border-gray-800 pb-1 mt-6 mb-4 uppercase tracking-tight" {...props} />
                                }}
                              >
                                {liveFinalContent}
                              </ReactMarkdown>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t bg-white flex justify-end items-center gap-6 shrink-0 shadow-lg px-8">
              <div className="flex-1 text-xs text-gray-400 font-medium italic">
                * Los cambios realizados aquí solo se aplicarán al atestado final generado. El documento se guardará en la sección de "Atestados Usados".
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUnifiedVariablesModal(false)}
                  className="px-6 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors font-bold border border-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleApplyUnifiedVariables}
                  className="bg-indigo-600 text-white px-10 py-3 rounded-lg hover:bg-indigo-700 transition-all font-bold shadow-xl shadow-indigo-100 flex items-center gap-2 active:scale-95"
                >
                  Continuar a Finalización
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Vista Previa Final */}
      {showUsedPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[95vh] animate-in zoom-in-95 duration-300">
            <div className="bg-[#002856] p-5 text-white flex justify-between items-center shrink-0 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Vista Previa del Documento</h3>
                  <p className="text-blue-100 text-xs">Revisa que toda la información es correcta antes de finalizar</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setShowUsedPreview(false); setShowUnifiedVariablesModal(true); }} 
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/20 flex items-center gap-2"
                >
                  🔙 Corregir valores
                </button>
                <button onClick={() => setShowUsedPreview(false)} className="text-white/60 hover:text-white text-2xl px-2">✕</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-14 bg-gray-100 custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-12">
                <div className="bg-white shadow-2xl border border-gray-300 p-16 text-center relative document-preview-page">

                   <h1 className="text-3xl font-black text-gray-900 mb-2 font-serif uppercase tracking-widest">Atestado Policial</h1>
                   <div className="w-24 h-1 bg-gray-800 mx-auto mb-6"></div>
                   <p className="text-2xl font-bold text-gray-800">Nº {atestado?.numero}</p>
                   <p className="mt-4 text-gray-500 font-medium">{atestado?.tipo} • {formatDate(new Date())}</p>
                </div>

                {finalPreviewDiligencias.map((d, idx) => (
                  <div key={idx} className="bg-white shadow-2xl border border-gray-300 p-16 relative document-preview-page min-h-[500px]">
                    <div className="mb-10 flex justify-between items-center text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] border-b border-gray-50 pb-4">
                      <span>Diligencia {idx + 1} de {finalPreviewDiligencias.length}</span>
                      <span>{d.plantilla_nombre || 'General'}</span>
                    </div>
                    
                    <div className="prose prose-sm max-w-none text-gray-800 font-serif leading-relaxed">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={{
                          table: ({node, ...props}) => (
                            <div className="overflow-x-auto my-6 border-2 border-gray-100 rounded-lg">
                              <table className="min-w-full divide-y-2 divide-gray-100 border-collapse" {...props} />
                            </div>
                          ),
                          th: ({node, ...props}) => <th className="bg-gray-50 px-4 py-3 text-left text-xs font-black text-gray-600 border uppercase tracking-wider" {...props} />,
                          td: ({node, ...props}) => <td className="px-4 py-3 text-sm text-gray-700 border border-gray-50" {...props} />,
                          p: ({node, ...props}) => <p className="mb-6 whitespace-pre-wrap leading-[1.8]" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-gray-950" style={{ fontWeight: 'bold' }} {...props} />,
                          em: ({node, ...props}) => <em className="italic text-gray-900 bg-yellow-50/50" style={{ fontStyle: 'italic' }} {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-xl font-black text-gray-900 border-b-2 border-gray-800 pb-2 mt-10 mb-6 uppercase tracking-tight" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ml-10 mb-6 space-y-3" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal ml-10 mb-6 space-y-3" {...props} />,
                          li: ({node, ...props}) => <li className="pl-2" {...props} />,
                        }}
                      >
                        {d.texto_final}
                      </ReactMarkdown>
                    </div>

                    {d.croquis && (
                      <div className="mt-10 border-4 border-gray-50 p-4 rounded-xl bg-white shadow-inner">
                        <img src={d.croquis} alt="Croquis" className="max-w-full h-auto mx-auto rounded-lg" />
                        <p className="text-center text-[10px] font-bold text-gray-400 mt-3 uppercase tracking-widest text-balance italic">Croquis policial adjunto a la diligencia</p>
                      </div>
                    )}
                    
                    <div className="mt-20 pt-10 border-t border-dashed border-gray-200 flex justify-between items-end grayscale opacity-50">
                      <div className="text-center">
                        <div className="w-48 h-px bg-gray-300 mb-2"></div>
                        <p className="text-[9px] font-bold uppercase">Sello de la Dependencia</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-serif italic mb-1">Diligenciada por el Agente {atestado?.usuario_nombre || ''}</p>
                        <p className="text-[9px] font-black uppercase tracking-tighter">Página {idx + 2}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-white border-t flex flex-col md:flex-row items-center gap-6 shrink-0 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.1)]">
              <div className="flex-1 flex items-start gap-4 text-amber-800 bg-amber-50 p-4 rounded-xl border border-amber-100/50 max-w-2xl">
                <div className="bg-amber-100 p-2 rounded-full mt-0.5">
                  <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="text-xs font-medium leading-relaxed">
                  <p className="font-bold mb-1">Nota importante:</p>
                  Al confirmar, se generará una <span className="underline decoration-amber-300 underline-offset-2">copia inmutable</span> de este documento. La plantilla original permanecerá intacta para futuros usos, pero el atestado resultante aparecerá en la sección de <strong>Atestados Usados</strong> listo para su impresión oficial.
                </div>
              </div>
              
              <div className="flex gap-3 w-full md:w-auto shrink-0">
                <button
                  onClick={() => setShowUsedPreview(false)}
                  className="flex-1 md:flex-none px-8 py-3 text-gray-500 hover:bg-gray-100 rounded-xl transition-all font-bold border border-gray-200"
                  disabled={isFinalizing}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmFinalAtestado}
                  disabled={isFinalizing}
                  className="flex-1 md:flex-none px-12 py-4 bg-[#002856] text-white rounded-xl hover:bg-black transition-all font-black shadow-xl shadow-blue-900/10 flex items-center justify-center gap-3 disabled:bg-gray-400 active:scale-[0.98]"
                >
                  {isFinalizing ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                      PROCESANDO...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      CREAR DOCUMENTO FINAL
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar diligencia */}
      {showEditModal && editingDiligencia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">Editar Diligencia</h3>
              <p className="text-sm text-gray-600 mt-1">
                {editingDiligencia.plantilla_nombre || 'Diligencia sin plantilla'}
              </p>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              {editingDiligencia.plantilla_content ? (
                <div className="space-y-4">
                  {extractVariables(editingDiligencia.plantilla_content).map(variable => (
                    <div key={variable}>
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
                        placeholder={`Valor para ${variable}`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Esta diligencia no tiene variables para editar</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEditDiligencia}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
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