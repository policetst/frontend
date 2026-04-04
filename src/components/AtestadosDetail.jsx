// pages/AtestadoDetail.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
 import apiService from '../../services/apiService';
 import DraggableDiligencia from './DraggableDiligencia';
 import AtestadoPrintView from './AtestadoPrintView';
 import AtestadoTicketView from './AtestadoTicketView';
 import { extractVariables, replaceVariables, parseCustomTable } from '../utils/types';
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
    const [showKeywordValuesModal, setShowKeywordValuesModal] = useState(false);
    const [showUsedPreview, setShowUsedPreview] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [finalPreviewDiligencias, setFinalPreviewDiligencias] = useState([]);
    const [showEditAtestadoModal, setShowEditAtestadoModal] = useState(false);
    const [editAtestadoValues, setEditAtestadoValues] = useState({ numero: '', descripcion: '', fecha: '', tipo: '' });

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


  const handleApplyUnifiedVariables = async () => {
    const processed = diligencias.map(d => {
      const content = d.plantilla_content || d.content || d.texto_final || '';
      const finalContent = replaceVariables(content, unifiedVariables);
      return { ...d, texto_final: finalContent };
    });
    setShowUnifiedVariablesModal(false);
    await handleConfirmFinalAtestado(processed);
  };

  const handleConfirmFinalAtestado = async (diligenciasToProcess = finalPreviewDiligencias) => {
    if (!atestado) return;
    setIsFinalizing(true);
    try {
      const relevantKeywords = Object.entries(unifiedVariables)
        .filter(([k, v]) => v && v.trim() !== '')
        .slice(0, 5)
        .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
        .join(' | ');

      const finalDesc = relevantKeywords.length > 0 
        ? (atestado.descripcion ? `${atestado.descripcion}\n@KW@${relevantKeywords}` : `@KW@${relevantKeywords}`)
        : atestado.descripcion || '';

      const newAtestado = {
        numero: `${atestado.numero || 'AT'}-U-${Date.now().toString().slice(-6)}`,
        tipo: atestado.tipo || '',
        descripcion: finalDesc,
        fecha: new Date().toISOString().split('T')[0],
        is_final: true,
        id_template_original: atestado.id
      };
      const created = await apiService.createAtestado(newAtestado);
      const newAtestadoId = created.atestado?.id || created.id;
      for (const d of diligenciasToProcess) {
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
  const handleSaveAtestadoInfo = async (e) => {
    e.preventDefault();
    if (!editAtestadoValues.numero?.trim() || !editAtestadoValues.fecha) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'El número y la fecha son obligatorios' });
      return;
    }
    try {
      await apiService.updateAtestado(id, editAtestadoValues);
      setAtestado(prev => ({ ...prev, ...editAtestadoValues }));
      setShowEditAtestadoModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Atestado actualizado correctamente',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al actualizar atestado:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el atestado' });
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
          <div className="flex gap-3 items-center">
            {!(atestado?.is_final || atestado?.numero?.includes('-U-')) && diligencias.length > 0 && (
              <button
                onClick={() => setShowUnifiedVariablesModal(true)}
                className="px-4 py-2 text-sm font-bold bg-[#002856] text-white border border-[#002856] rounded hover:bg-blue-800 transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
              >
                USAR ESTE ATESTADO
              </button>
            )}
            {!(atestado?.is_final || atestado?.numero?.includes('-U-')) && (
              <button
                onClick={() => {
                  setEditAtestadoValues({
                    numero: atestado.numero || '',
                    descripcion: atestado.descripcion || '',
                    fecha: atestado.fecha ? atestado.fecha.split('T')[0] : '',
                    tipo: atestado.tipo || ''
                  });
                  setShowEditAtestadoModal(true);
                }}
                className="px-4 py-2 text-sm font-bold bg-white text-[#002856] border border-[#002856] rounded hover:bg-[#002856] hover:text-white transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
              >
                Editar Información
              </button>
            )}
            <Link
              to="/atestados"
              className="px-4 py-2 text-sm font-bold bg-white text-[#002856] border border-[#002856] rounded hover:bg-[#002856] hover:text-white transition-all duration-200 shadow-sm flex items-center justify-center gap-2"
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
            
            <div className="flex flex-col gap-3 mb-3">
              {!(atestado?.is_final || atestado?.numero?.includes('-U-')) && diligencias.length > 1 && (
                <div className="flex flex-col gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <h4 className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Organización</h4>
                  <button
                    onClick={handleReorderToggle}
                    disabled={reorderLoading}
                    className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
                      isReordering ? 'bg-yellow-600 text-white' : 'bg-white text-blue-700 border border-blue-200'
                    }`}
                  >
                    {isReordering ? 'Finalizar Reordenamiento' : '🔃 Reordenar Diligencias'}
                  </button>
                </div>
              )}

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
              )}
            </div>

            {isReordering && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
                Arrastra las diligencias para cambiar su orden
                {reorderLoading && <span className="block">Guardando...</span>}
              </div>
            )}


          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Hoja de página principal del atestado */}
            <div className="p-3">
              <div className="police-document-sheet bg-white border border-gray-300 rounded p-4 mb-3 shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-700 text-white rounded flex items-center justify-center text-sm font-bold">
                      📋
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">PÁGINA PRINCIPAL</h3>
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
                    <p className="text-xs text-gray-800 line-clamp-2">
                       {atestado.descripcion.includes('@KW@') ? atestado.descripcion.split('@KW@')[0] : atestado.descripcion}
                    </p>
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
                    onNavigate={(id) => {
                      const el = document.getElementById(`diligencia-view-${id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel central - Vista de documento oficial estilo "hojas reales" */}
        <div className="flex-1 flex flex-col bg-gray-200 overflow-y-auto custom-scrollbar">
          <div className="py-8 px-4 flex flex-col items-center">
            
            {/* HOJA 1: PÁGINA PRINCIPAL DEL ATESTADO */}
            <div className="atestado-page shadow-2xl">
              <div className="atestado-page-header">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Dependencia Policial</span>
                  <h1 className="text-xl font-black text-gray-900 leading-none">ATESTADO POLICIAL</h1>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Número</span>
                  <span className="text-lg font-black text-blue-900 leading-none">#{atestado?.numero}</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center py-10">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-2xl mx-auto w-full">
                  <div className="space-y-6">
                    <div className="border-l-4 border-gray-100 pl-4 py-1">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">FECHA DEL HECHO</label>
                      <div className="text-lg font-bold text-gray-800">{formatDate(atestado?.fecha)}</div>
                    </div>
                    
                    <div className="border-l-4 border-gray-100 pl-4 py-1">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">FECHA DE APERTURA</label>
                      <div className="text-lg font-bold text-gray-800">{formatDateTime(atestado?.created_at)}</div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="border-l-4 border-gray-100 pl-4 py-1">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">TOTAL DILIGENCIAS</label>
                      <div className="text-lg font-bold text-gray-800">{diligencias.length} Documentos</div>
                    </div>
                    
                    <div className="border-l-4 border-gray-100 pl-4 py-1">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">TIPO DE ATESTADO</label>
                      <div className="text-lg font-bold text-blue-800 italic">{atestado?.tipo || "General"}</div>
                    </div>
                  </div>
                </div>

                {atestado?.descripcion && (
                  <div className="mt-16 bg-gray-50/50 p-8 border border-gray-100 rounded-sm italic">
                    <label className="block text-[9px] font-black text-gray-400 uppercase mb-3 not-italic">RESUMEN / DESCRIPCIÓN:</label>
                    <p className="text-gray-700 leading-relaxed text-center text-lg">&ldquo;{atestado.descripcion}&rdquo;</p>
                  </div>
                )}
              </div>

              <div className="atestado-page-footer">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                  <span className="font-bold">INICIO DEL EXPEDIENTE</span>
                </div>
                <div className="font-black text-gray-900">Página 1 de {diligencias.length + 1}</div>
              </div>
            </div>

            {/* DILIGENCIAS: CADA UNA EN SU HOJA */}
            {diligencias.map((diligencia, index) => (
              <div key={diligencia.id} id={`diligencia-view-${diligencia.id}`} className="atestado-page shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="atestado-page-header">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Atestado #{atestado?.numero}</span>
                    <h2 className="text-xl font-black text-gray-900 leading-none">DILIGENCIA {index + 1}</h2>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Referencia</span>
                    <span className="text-[11px] font-bold text-gray-600 truncate max-w-[150px]">{diligencia.plantilla_nombre || 'General'}</span>
                  </div>
                </div>

                <div className="flex-1 py-4">
                  <div className="official-text-clean">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      components={{
                        table: ({node, ...props}) => (
                          <div className="overflow-x-auto my-6 border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-300 border-collapse" {...props} />
                          </div>
                        ),
                        th: ({node, ...props}) => <th className="bg-gray-50 px-3 py-2 text-left text-[11px] font-black text-gray-600 border uppercase tracking-widest" {...props} />,
                        td: ({node, ...props}) => <td className="px-3 py-2 text-sm text-gray-800 border" {...props} />,
                        p: ({node, ...props}) => <p className="mb-4 whitespace-pre-wrap" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-gray-950" style={{ fontWeight: 'bold' }} {...props} />,
                        em: ({node, ...props}) => <em className="italic text-gray-800" style={{ fontStyle: 'italic' }} {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-base font-black text-gray-900 border-b border-gray-900 pb-1 mt-8 mb-4 uppercase" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc ml-8 my-4 space-y-2 block" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal ml-8 my-4 space-y-2 block" {...props} />,
                        li: ({node, ...props}) => <li className="pl-1" {...props} />,
                      }}
                    >
                      {parseCustomTable(diligencia.texto_final || 'Sin contenido')}
                    </ReactMarkdown>

                    {diligencia.croquis && (
                      <div className="mt-8 border-2 border-gray-100 p-2 rounded bg-gray-50/50">
                        <img src={diligencia.croquis} alt="Croquis Policial" className="max-w-full h-auto mx-auto shadow-sm" />
                        <div className="text-center text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Documento Gráfico Adjunto</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-12 pt-10 grid grid-cols-2 gap-8 mb-10 opacity-30 grayscale pointer-events-none">
                  <div className="text-center">
                    <div className="h-0.5 w-full bg-gray-400 mb-2"></div>
                    <span className="text-[8px] font-black uppercase">Firma del Agente / Sello</span>
                  </div>
                  <div className="text-center">
                    <div className="h-0.5 w-full bg-gray-400 mb-2"></div>
                    <span className="text-[8px] font-black uppercase">Vº Bº Superior</span>
                  </div>
                </div>

                <div className="atestado-page-footer">
                  <span className="font-bold">FECHA: {formatDate(atestado?.fecha)} • REF: {diligencia.id}</span>
                  <div className="font-black text-gray-900">Página {index + 2} de {diligencias.length + 1}</div>
                </div>
              </div>
            ))}

            {diligencias.length === 0 && (
              <div className="text-center py-20 opacity-20">
                <span className="text-8xl">📭</span>
                <p className="mt-4 font-black">EXPEDIENTE SIN DILIGENCIAS ADJUNTAS</p>
              </div>
            )}

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
                                {parseCustomTable(liveFinalContent)}
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
                  disabled={isFinalizing}
                  className="bg-indigo-600 text-white px-10 py-3 rounded-lg hover:bg-indigo-700 transition-all font-bold shadow-xl shadow-indigo-100 flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFinalizing ? 'Procesando...' : 'Finalizar'}
                  {!isFinalizing && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
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

      {/* Modal para editar página principal del atestado */}
      {showEditAtestadoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Editar Atestado</h3>
              <button onClick={() => setShowEditAtestadoModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveAtestadoInfo} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Título / Número *</label>
                <input
                  type="text"
                  required
                  value={editAtestadoValues.numero}
                  onChange={(e) => setEditAtestadoValues({ ...editAtestadoValues, numero: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Descripción</label>
                <textarea
                  rows={4}
                  value={editAtestadoValues.descripcion}
                  onChange={(e) => setEditAtestadoValues({ ...editAtestadoValues, descripcion: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditAtestadoModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AtestadoDetail;