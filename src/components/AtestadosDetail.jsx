 // pages/AtestadoDetail.jsx
 import React, { useState, useEffect, useMemo, useRef } from 'react';
 import { useParams, Link } from 'react-router-dom';
 import apiService from '../../services/apiService';
 import DraggableDiligencia from './DraggableDiligencia';
 import AtestadoPrintView from './AtestadoPrintView';
 import AtestadoTicketView from './AtestadoTicketView';
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
   const [showTicketView, setShowTicketView] = useState(false);
   const [showReplicateModal, setShowReplicateModal] = useState(false);
   const [replicateValues, setReplicateValues] = useState({});
   const [replicateLoading, setReplicateLoading] = useState(false);
   const [reorderLoading, setReorderLoading] = useState(false);
   const [selectedPlantilla, setSelectedPlantilla] = useState(null);
   const [plantillaValues, setPlantillaValues] = useState({});
   const [showVariablesModal, setShowVariablesModal] = useState(false);
   const [searchPlantillas, setSearchPlantillas] = useState('');
   const [editingDiligencia, setEditingDiligencia] = useState(null);
   const [showEditModal, setShowEditModal] = useState(false);
   const [editValues, setEditValues] = useState({});
   const [showAddDiligenciaModal, setShowAddDiligenciaModal] = useState(false);
   const [showCroquisModal, setShowCroquisModal] = useState(false);
   const [croquisMode, setCroquisMode] = useState('draw');
   const [croquisFile, setCroquisFile] = useState(null);
   const [croquisDescription, setCroquisDescription] = useState('');
   const [croquisLoading, setCroquisLoading] = useState(false);
   const [croquisElements, setCroquisElements] = useState([]);
   const [draggingElementId, setDraggingElementId] = useState(null);
   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
   const [croquisPalette] = useState([
     { id: 'person', label: 'Testigo', emoji: '👤' },
     { id: 'building', label: 'Edificio', emoji: '🏢' },
     { id: 'weapon', label: 'Arma', emoji: '🔫' },
     { id: 'animal', label: 'Animal', emoji: '🐕' },
     { id: 'car', label: 'Vehículo', emoji: '🚗' }
   ]);
   const canvasRef = useRef(null);
   const [isDrawing, setIsDrawing] = useState(false);
   const [drawColor, setDrawColor] = useState('#000000');
   const [brushSize, setBrushSize] = useState(2);
   const [canvasSize, setCanvasSize] = useState({ width: 640, height: 320 });
   const [showUnifiedVariablesModal, setShowUnifiedVariablesModal] = useState(false);
   const [unifiedVariables, setUnifiedVariables] = useState({});
   const [showKeywordValuesModal, setShowKeywordValuesModal] = useState(false);

  // Funciones de utilidad
  const formatDateTime = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleString('es-ES');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    canvas.dataset.lastX = x;
    canvas.dataset.lastY = y;
  };

  const drawOnCanvas = (event) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const previousX = parseFloat(canvas.dataset.lastX || 0);
    const previousY = parseFloat(canvas.dataset.lastY || 0);
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    canvas.dataset.lastX = x;
    canvas.dataset.lastY = y;
  };

  const stopDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const addCroquisElement = (iconId) => {
    const found = croquisPalette.find(el => el.id === iconId);
    if (!found) return;
    const nextId = `${iconId}-${Date.now()}`;
    setCroquisElements(prev => [
      ...prev,
      {
        id: nextId,
        type: found.id,
        icon: found.emoji,
        x: 160,
        y: 120
      }
    ]);
  };

  const startMoveElement = (event, elementId) => {
    const croquisArea = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - croquisArea.left;
    const y = event.clientY - croquisArea.top;
    const element = croquisElements.find(el => el.id === elementId);
    if (!element) return;
    setDraggingElementId(elementId);
    setDragOffset({ x: x - element.x, y: y - element.y });
  };

  const moveElement = (event) => {
    if (!draggingElementId) return;
    const croquisArea = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - croquisArea.left;
    const y = event.clientY - croquisArea.top;
    setCroquisElements(prev => prev.map(el => {
      if (el.id !== draggingElementId) return el;
      return { ...el, x: Math.max(0, Math.min(x - dragOffset.x, canvasSize.width - 32)), y: Math.max(0, Math.min(y - dragOffset.y, canvasSize.height - 32)) };
    }));
  };

  const stopMove = () => {
    setDraggingElementId(null);
  };

  const getCroquisImageFromElements = () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '32px serif';
    croquisElements.forEach(el => {
      ctx.fillText(el.icon, el.x, el.y + 24);
    });
    return canvas.toDataURL('image/png');
  };

  const getCanvasDataUrl = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  };

  const handleCreateCroquisDiligencia = async () => {
    let croquisDataUrl = null;

    if (croquisMode === 'draw') {
      if (croquisElements.length === 0) {
        Swal.fire('Error', 'Agregá al menos un elemento para el croquis.', 'error');
        return;
      }
      croquisDataUrl = getCroquisImageFromElements();
    } else {
      if (!croquisFile) {
        Swal.fire('Error', 'Seleccioná un archivo de croquis antes de guardar.', 'error');
        return;
      }
      croquisDataUrl = await readFileAsBase64(croquisFile);
    }

    setCroquisLoading(true);
    try {
      const diligenciaData = {
        templateId: null,
        values: [],
        previewText: croquisDescription || 'Croquis policial adjunto',
        texto_final: croquisDescription || 'Croquis policial adjunto',
        croquis: croquisDataUrl,
        croquis_descripcion: croquisDescription || 'Croquis policial'
      };

      await apiService.createDiligencia(id, diligenciaData);
      await loadData();
      setShowCroquisModal(false);
      setCroquisFile(null);
      setCroquisDescription('');
      setCroquisMode('draw');
      clearCanvas();

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Croquis policial guardado como diligencia',
        timer: 1800,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error creando croquis diligencia:', error);
      Swal.fire('Error', 'No se pudo guardar el croquis. Intentá de nuevo.', 'error');
    } finally {
      setCroquisLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadPlantillas();
  }, [id]);

  useEffect(() => {
    if (showCroquisModal && croquisMode === 'draw') {
      clearCanvas();
    }
  }, [showCroquisModal, croquisMode]);

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

  const keywordValuesByDiligencia = useMemo(() => {
    const map = {};
    diligencias.forEach((diligencia) => {
      (diligencia.valores || []).forEach((valor) => {
        if (!valor.variable) return;
        if (!map[valor.variable]) map[valor.variable] = [];
        map[valor.variable].push({
          diligenciaId: diligencia.id,
          nombre: diligencia.plantilla_nombre || `Diligencia ${diligencia.id}`,
          valor: valor.valor
        });
      });
    });
    return map;
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

  const handleReplicateAtestado = async () => {
    if (!atestado) return;
    if (!window.confirm('¿Deseas replicar este atestado con los nuevos valores de palabras clave?')) {
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
            <button
              onClick={() => setShowPrintView(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir A4
            </button>
            <button
              onClick={() => setShowTicketView(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Ticket Policial
            </button>
            <Link
              to={`/atestados/${id}/editar`}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Editar
            </Link>
            <Link
              to="/atestados"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
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
            
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setShowAddDiligenciaModal(true)}
                className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 flex items-center justify-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar diligencia
              </button>
              <button
                onClick={() => setShowCroquisModal(true)}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 flex items-center justify-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M5 7v12a2 2 0 002 2h10a2 2 0 002-2V7M9 10h6M9 14h6" />
                </svg>
                Agregar croquis
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
              )}
              <button
                onClick={() => setShowReplicateModal(true)}
                className="px-3 py-2 rounded text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Replicar atestado
              </button>
            </div>

            {isReordering && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
                Arrastra las diligencias para cambiar su orden
                {reorderLoading && <span className="block">Guardando...</span>}
              </div>
            )}

            {Object.keys(allVariables).length > 0 && (
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={handleShowUnifiedVariables}
                  className="w-full bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 flex items-center justify-center gap-2 mt-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Palabras Clave ({Object.keys(allVariables).length})
                </button>
                <button
                  onClick={() => setShowKeywordValuesModal(true)}
                  className="w-full bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700 flex items-center justify-center gap-2 mt-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Ver valores por diligencia
                </button>
              </div>
            )}
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
                        
                        <div className="bg-gray-50 p-6 rounded border-2 border-gray-200">
                          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-justify font-mono text-sm">
                            {diligencia.texto_final || 'Sin contenido'}
                          </div>
                          {diligencia.croquis && (
                            <div className="mt-3 border rounded overflow-hidden bg-white">
                              <img src={diligencia.croquis} alt="Croquis policial" className="w-full h-40 object-cover" />
                            </div>
                          )}
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

      {/* Modal para replicar atestado */}
      {showReplicateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Replicar atestado</h3>
                <p className="text-sm text-gray-600">Ingresa nuevos valores para las palabras clave antes de replicar.</p>
              </div>
              <button onClick={() => setShowReplicateModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              {Object.keys(allVariables).length === 0 ? (
                <p className="text-sm text-gray-500">No se encontraron palabras clave para replicar.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.keys(allVariables).map(variable => (
                    <div key={variable}>
                      <label className="block text-xs font-semibold text-gray-700">{variable}</label>
                      <input
                        type="text"
                        value={replicateValues[variable] || ''}
                        onChange={(e) => setReplicateValues(prev => ({ ...prev, [variable]: e.target.value }))}
                        className="w-full border rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder={`Nuevo valor para ${variable}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => setShowReplicateModal(false)}
                className="px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleReplicateAtestado}
                disabled={replicateLoading}
                className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {replicateLoading ? 'Replicando...' : 'Replicar atestado'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                      <p className="text-sm text-gray-600 mb-2">{plantilla.description}</p>
                    )}
                    
                    <div className="text-xs text-gray-500 line-clamp-2">
                      {plantilla.content || 'Sin contenido'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Croquis Policial */}
      {showCroquisModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Agregar croquis policial</h3>
                <p className="text-sm text-gray-600 mt-1">Dibuja en el croquis o subí una imagen, y guardá como diligencia.</p>
              </div>
              <button onClick={() => setShowCroquisModal(false)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setCroquisMode('draw')}
                  className={`px-3 py-2 rounded ${croquisMode === 'draw' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  Crear croquis
                </button>
                <button
                  onClick={() => setCroquisMode('upload')}
                  className={`px-3 py-2 rounded ${croquisMode === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                  Subir imagen
                </button>
              </div>

              {croquisMode === 'draw' ? (
                <div className="border rounded p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-xs text-gray-600 mr-2">Arrastrá elementos al área y movelos con el mouse.</p>
                    <button onClick={() => setCroquisElements([])} className="px-2 py-1 text-xs bg-red-500 text-white rounded">Limpiar</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {croquisPalette.map(item => (
                      <button
                        key={item.id}
                        onClick={() => addCroquisElement(item.id)}
                        className="border rounded p-2 text-center hover:bg-gray-100"
                      >
                        <div className="text-2xl">{item.emoji}</div>
                        <div className="text-xs text-gray-600">{item.label}</div>
                      </button>
                    ))}
                  </div>
                  <div
                    className="relative border border-gray-300 rounded bg-white h-64"
                    style={{ width: canvasSize.width, height: canvasSize.height }}
                    onMouseMove={moveElement}
                    onMouseUp={stopMove}
                    onMouseLeave={stopMove}
                  >
                    {croquisElements.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">Agregá un elemento para comenzar</div>
                    )}
                    {croquisElements.map(element => (
                      <div
                        key={element.id}
                        style={{ left: element.x, top: element.y }}
                        className="absolute cursor-move select-none"
                        onMouseDown={(e) => startMoveElement(e, element.id)}
                      >
                        <span className="text-2xl">{element.icon}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border rounded p-3 bg-gray-50">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Archivo de croquis (PNG, JPG, SVG)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCroquisFile(e.target.files[0] || null)}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                  {croquisFile && (
                    <div className="mt-2 p-2 bg-white border rounded text-xs text-gray-700">
                      Archivo: {croquisFile.name}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de croquis</label>
                <textarea
                  rows={3}
                  maxLength={700}
                  value={croquisDescription}
                  onChange={(e) => setCroquisDescription(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej. croquis del lugar del siniestro con orientación..."
                />
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCroquisModal(false);
                  setCroquisFile(null);
                  setCroquisDescription('');
                }}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCroquisDiligencia}
                disabled={croquisLoading}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {croquisLoading ? 'Guardando...' : 'Guardar croquis'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para asignar variables unificadas */}
      {showUnifiedVariablesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">Asignar Palabras Clave</h3>
              <p className="text-sm text-gray-600 mt-1">
                Estas variables se aplicarán a todas las diligencias que las contengan
              </p>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {Object.keys(allVariables).map(variable => (
                  <div key={variable}>
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
                      placeholder={`Valor para ${variable}`}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => setShowUnifiedVariablesModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUnifiedVariables}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
              >
                Asignar Variables
              </button>
            </div>
          </div>
        </div>
      )}

      {showKeywordValuesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Valores de palabras clave</h3>
                <p className="text-sm text-gray-600">Muestra los valores asignados y diligencia de origen.</p>
              </div>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowKeywordValuesModal(false)}>✕</button>
            </div>
            <div className="p-4 max-h-76 overflow-y-auto">
              {Object.keys(keywordValuesByDiligencia).length === 0 ? (
                <div className="text-sm text-gray-500">No hay valores de palabras clave asignados en este atestado.</div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(keywordValuesByDiligencia).map(([variable, entries]) => (
                    <div key={variable} className="border rounded p-3 bg-gray-50">
                      <div className="font-semibold text-sm">{variable}</div>
                      <div className="mt-1 text-xs text-gray-700">
                        {entries.map((entry, i) => (
                          <div className="flex justify-between gap-2" key={`${variable}-${entry.diligenciaId}-${i}`}>
                            <span className="font-medium">{entry.nombre}</span>
                            <span className="text-green-700">{entry.valor || '(vacío)'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t text-right">
              <button
                className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                onClick={() => setShowKeywordValuesModal(false)}
              >Cerrar</button>
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