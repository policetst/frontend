import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import Swal from 'sweetalert2';
import { extractVariables, validateTemplate } from '../utils/types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Textarea } from './ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { 
  Bold, Italic, Heading, List, ListOrdered, Table, 
  PenTool, Square, Minus, User, Car, Scale, MapPin, 
  Eye, Edit3, Save, X, Trash2, ArrowLeft, Info, HelpCircle,
  Tag, FileText
} from 'lucide-react';

const EditarPlantilla = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plantilla, setPlantilla] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: ''
  });
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    loadPlantilla();
  }, [id]);

  const loadPlantilla = async () => {
    try {
      const response = await apiService.getPlantilla(id);
      const plantillaData = response.plantilla || response;
      setPlantilla(plantillaData);
      setFormData({
        name: plantillaData.name || '',
        description: plantillaData.description || '',
        content: plantillaData.content || ''
      });
    } catch (error) {
      console.error('Error al cargar plantilla:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al cargar la plantilla',
        icon: 'error',
        confirmButtonColor: '#002856',
      });
      navigate('/plantillas');
    } finally {
      setLoading(false);
    }
  };

  const updateContent = (newContent) => {
    setFormData(prev => ({ ...prev, content: newContent }));
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: '' }));
    }
  };

  const addKeywordToEditor = (defaultKeyword = 'palabra') => {
    const input = textareaRef.current;
    if (!input) {
      updateContent(formData.content + `{${defaultKeyword}}`);
      return;
    }

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const content = formData.content;

    if (start !== end) {
      const selected = content.slice(start, end);
      const wrapped = `{${selected}}`;
      const next = content.slice(0, start) + wrapped + content.slice(end);
      updateContent(next);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + wrapped.length, start + wrapped.length);
      }, 0);
      return;
    }

    const before = content.slice(0, start);
    const after = content.slice(start);
    const wordBeforeMatch = before.match(/(\w+)$/);
    const wordAfterMatch = after.match(/^(\w+)/);

    let wordStart = start;
    let wordEnd = start;

    if (wordBeforeMatch) wordStart = start - wordBeforeMatch[1].length;
    if (wordAfterMatch) wordEnd = start + wordAfterMatch[1].length;

    if (wordStart === wordEnd) {
      const wrapped = `{${defaultKeyword}}`;
      const next = content.slice(0, start) + wrapped + content.slice(end);
      updateContent(next);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + wrapped.length, start + wrapped.length);
      }, 0);
    } else {
      const word = content.slice(wordStart, wordEnd);
      const wrapped = `{${word}}`;
      const next = content.slice(0, wordStart) + wrapped + content.slice(wordEnd);
      updateContent(next);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(wordStart + wrapped.length, wordStart + wrapped.length);
      }, 0);
    }
  };

  const addFormat = (prefix, suffix = '') => {
    const input = textareaRef.current;
    if (!input) {
      updateContent(formData.content + prefix + suffix);
      return;
    }

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const content = formData.content;

    if (start !== end) {
      const selected = content.slice(start, end);
      const wrapped = prefix + selected + suffix;
      const next = content.slice(0, start) + wrapped + content.slice(end);
      updateContent(next);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + wrapped.length, start + wrapped.length);
      }, 0);
      return;
    }

    const next = content.slice(0, start) + prefix + suffix + content.slice(end);
    updateContent(next);
    setTimeout(() => {
      input.focus();
      const newPos = start + prefix.length;
      input.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const input = textareaRef.current;
      if (!input) return;

      const start = input.selectionStart;
      const content = formData.content;
      
      const linesBefore = content.slice(0, start).split('\n');
      const currentLine = linesBefore[linesBefore.length - 1];

      const bulletMatch = currentLine.match(/^(\s*)-\s+(.*)/);
      if (bulletMatch) {
        e.preventDefault();
        const indent = bulletMatch[1];
        const text = bulletMatch[2].trim();

        if (text === '') {
          const next = content.slice(0, start - currentLine.length) + '\n' + content.slice(start);
          updateContent(next);
          setTimeout(() => {
            input.focus();
            const newPos = start - currentLine.length + 1;
            input.setSelectionRange(newPos, newPos);
          }, 0);
          return;
        }

        const next = content.slice(0, start) + '\n' + indent + '- ' + content.slice(start);
        updateContent(next);
        setTimeout(() => {
          input.focus();
          const newPos = start + 1 + indent.length + 2;
          input.setSelectionRange(newPos, newPos);
        }, 0);
        return;
      }

      const numberMatch = currentLine.match(/^(\s*)(\d+)\.\s+(.*)/);
      if (numberMatch) {
        e.preventDefault();
        const indent = numberMatch[1];
        const num = parseInt(numberMatch[2], 10);
        const text = numberMatch[3].trim();

        if (text === '') {
          const next = content.slice(0, start - currentLine.length) + '\n' + content.slice(start);
          updateContent(next);
          setTimeout(() => {
            input.focus();
            const newPos = start - currentLine.length + 1;
            input.setSelectionRange(newPos, newPos);
          }, 0);
          return;
        }

        const nextIndicator = `\n${indent}${num + 1}. `;
        const next = content.slice(0, start) + nextIndicator + content.slice(start);
        updateContent(next);
        setTimeout(() => {
          input.focus();
          const newPos = start + nextIndicator.length;
          input.setSelectionRange(newPos, newPos);
        }, 0);
        return;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateTemplate(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const variables = extractVariables(formData.content);
      const plantillaData = {
        ...formData,
        variables: variables
      };

      await apiService.updatePlantilla(id, plantillaData);
      await Swal.fire({
        title: '¡Éxito!',
        text: 'Plantilla actualizada correctamente',
        icon: 'success',
        confirmButtonColor: '#002856',
        timer: 1500
      });
      navigate('/plantillas');
    } catch (error) {
      console.error('Error al actualizar plantilla:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      Swal.fire({
        title: 'Error',
        text: 'Error: ' + errorMessage,
        icon: 'error',
        confirmButtonColor: '#002856',
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
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que quieres eliminar la plantilla "${plantilla.name}"? Esta acción no se puede deshacer.`,
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
        navigate('/plantillas');
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

  if (loading) {
    return (
      <div className="p-6 text-center">Cargando plantilla...</div>
    );
  }

  const variablesDetectadas = extractVariables(formData.content);

  return (
    <div className="p-4 bg-slate-100 min-h-screen">
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/plantillas')}
            className="p-2 transition-colors hover:bg-white rounded-full text-slate-500"
            title="Volver"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Editar Plantilla: {plantilla?.name}</h1>
            <p className="text-xs text-slate-500 mt-0.5">Gestión de contenido dinámico para diligencias policiales</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 border border-red-200 bg-white hover:bg-red-50 rounded shadow-sm transition-all"
          >
            <Trash2 className="w-4 h-4" /> Eliminar
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-[#002856] hover:bg-blue-800 rounded shadow-md hover:shadow-lg transition-all disabled:bg-gray-400"
          >
            {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" /> : <Save className="w-4 h-4" />}
            {saving ? 'Guardando...' : 'Guardar Plantilla'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 h-[calc(100vh-8rem)]">
        <Card className="flex flex-col overflow-hidden border-none shadow-xl bg-white">
          <CardContent className="flex-1 p-0 flex flex-col min-h-0">
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
              {/* Toolbar Section */}
              <div className="bg-slate-50 border-b p-3 space-y-3 shadow-sm z-10">
                {/* Basic Info Inputs */}
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[250px]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Label htmlFor="name" className="text-xs font-bold text-slate-600 uppercase">Nombre de Diligencia</Label>
                    </div>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nombre de la plantilla"
                      className={`h-9 text-sm focus:ring-2 focus:ring-blue-500 transition-all ${errors.name ? 'border-red-500 shadow-sm shadow-red-100' : 'border-slate-200'}`}
                    />
                  </div>
                  <div className="flex-[1.5] min-w-[300px]">
                     <div className="flex items-center gap-2 mb-1.5">
                      <Label htmlFor="description" className="text-xs font-bold text-slate-600 uppercase">Descripción / Uso</Label>
                    </div>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Cuándo se debe usar esta diligencia..."
                      rows={1}
                      className="h-9 min-h-[36px] text-sm resize-none focus:ring-2 focus:ring-blue-500 transition-all border-slate-200"
                    />
                  </div>
                </div>

                {/* Rich Tools */}
                <div className="flex flex-wrap gap-2 items-center border-t pt-3">
                  <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 shadow-sm divide-x divide-slate-100">
                    <button type="button" title="Negrita" onClick={() => addFormat('**', '**')} className="p-1.5 hover:bg-slate-50 text-slate-600 rounded" ><Bold className="w-4 h-4" /></button>
                    <button type="button" title="Cursiva" onClick={() => addFormat('*', '*')} className="p-1.5 hover:bg-slate-50 text-slate-600 rounded" ><Italic className="w-4 h-4" /></button>
                  </div>

                  <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 shadow-sm divide-x divide-slate-100">
                    <button type="button" title="Título" onClick={() => addFormat('### ')} className="p-1.5 hover:bg-slate-50 text-slate-600 rounded" ><Heading className="w-4 h-4" /></button>
                    <button type="button" title="Línea divisoria" onClick={() => addFormat('\n---\n')} className="p-1.5 hover:bg-slate-50 text-slate-600 rounded" ><Minus className="w-4 h-4" /></button>
                  </div>

                  <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 shadow-sm divide-x divide-slate-100">
                    <button type="button" title="Lista" onClick={() => addFormat('\n- ')} className="p-1.5 hover:bg-slate-50 text-slate-600 rounded" ><List className="w-4 h-4" /></button>
                    <button type="button" title="Lista numerada" onClick={() => addFormat('\n1. ')} className="p-1.5 hover:bg-slate-50 text-slate-600 rounded" ><ListOrdered className="w-4 h-4" /></button>
                  </div>

                  <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 shadow-sm">
                    <button type="button" title="Insertar Tabla" onClick={() => addFormat('\n| Concepto | Información |\n|---|---|\n| {Fato_1} | {Respuesta_1} |\n| {Fato_2} | {Respuesta_2} |\n')} className="px-2 py-1.5 hover:bg-slate-50 text-slate-600 rounded flex items-center gap-1.5" >
                      <Table className="w-4 h-4" /> <span className="text-xs font-bold">TABLA</span>
                    </button>
                  </div>

                  <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 shadow-sm">
                    <button type="button" title="Recuadro Central" onClick={() => addFormat('\n[[ {Texto_dentro_del_recuadro} ]]\n')} className="px-2 py-1.5 hover:bg-slate-50 text-slate-600 rounded flex items-center gap-1.5" >
                      <Square className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Recuadro</span>
                    </button>
                  </div>

                  <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 shadow-sm">
                    <button type="button" title="Firmas" onClick={() => addFormat('\n\nEL AGENTE (Número {Num}):\t\t\tEL INTERESADO:\n\n\n\n[Firma]\t\t\t\t\t\t[Firma]\n')} className="px-2 py-1.5 hover:bg-slate-50 text-slate-600 rounded flex items-center gap-1.5" >
                      <PenTool className="w-4 h-4" /> <span className="text-xs font-bold">BLOQUE FIRMA</span>
                    </button>
                  </div>

                  <div className="h-4 w-[1px] bg-slate-200 mx-1" />

                  <div className="flex items-center gap-2">
                    <select
                      className="border border-blue-200 rounded bg-blue-50/50 text-blue-700 text-xs font-bold px-2 py-1.5 h-8 outline-none hover:bg-blue-100 transition-colors"
                      onChange={(e) => {
                        addFormat(e.target.value);
                        e.target.value = '';
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>📋 INSERTAR BLOQUES POLICIALES...</option>
                      
                      <optgroup label="--- PROCEDIMIENTO GENERAL ---">
                        <option value="[[ DILIGENCIA DE INICIO ]]\n\nEn la localidad de {Poblacion}, siendo las {Hora_Inicio} horas del día {Fecha_Inicio}, el Agente con carné profesional número {Num_Agente}, actuando como Instructor, procede a la apertura del presente atestado por los hechos que se detallarán a continuación.\n">📝 Diligencia de Inicio</option>
                        <option value="\n[[ DILIGENCIA DE CIERRE Y REMISIÓN ]]\n\nY para que conste, se cierra la presente diligencia a las {Hora_Cierre} horas del día {Fecha_Cierre}, procediendo a su remisión al Juzgado de Instrucción en funciones de Guardia de {Localidad_Juzgado}.\n">🏁 Cierre y Remisión</option>
                      </optgroup>

                      <optgroup label="--- IDENTIFICACIÓN Y DATOS ---">
                        <option value="\n--- DATOS PERSONALES ---\nNombre: {Nombre}\nApellidos: {Apellidos}\nDNI/NIE: {Documento_Identidad}\nFecha Nacimiento: {Fecha_Nacimiento}\nNatural de: {Natural_de}\nDomicilio: {Domicilio}\nTeléfono: {Telefono}\n">👤 Identificación Persona</option>
                        <option value="\n--- DATOS VEHÍCULO ---\nMarca: {Marca}\nModelo: {Modelo}\nMatrícula: {Matricula}\nColor: {Color}\nBastidor: {Num_Bastidor}\n">🚗 Datos Vehículo</option>
                        <option value="\n--- UBICACIÓN Y TIEMPO ---\nLugar: {Lugar_Hechos}\nCía/Vía: {Calle_o_Punto_Kilometrico}\nLocalidad: {Poblacion}\nFecha: {Fecha_Hechos}\nHora: {Hora_Hechos}\n">📍 Perímetro/Ubicación</option>
                      </optgroup>

                      <optgroup label="--- DECLARACIONES Y DERECHOS ---">
                        <option value="\n[[ DILIGENCIA DE DECLARACIÓN DE TESTIGO ]]\n\nInstruido de la obligación legal de decir verdad y de las penas con las que la Ley castiga el delito de falso testimonio en causa judicial, manifiesta:\n\nPREGUNTADO: {Pregunta_1}\nRESPUESTA: {Respuesta_1}\n">🗣️ Declaración Testigo</option>
                        <option value="\n[[ OFRECIMIENTO DE ACCIONES (Art. 109 LECrim) ]]\n\nSe informa al ofendido/perjudicado de su derecho a mostrarse parte en el proceso, pudiendo nombrar Abogado y Procurador o solicitar la designación de oficio, así como de su derecho a la restitución de la cosa, reparación del daño e indemnización.\n">⚖️ Ofrecimiento Acciones</option>
                        <option value="\n--- LECTURA DE DERECHOS (Art. 520 LECrim) ---\nSe procede a la lectura de los derechos que le asisten según el Art. 520 de la LECrim:\n1. Derecho a guardar silencio.\n2. Derecho a no declarar contra sí mismo.\n3. Derecho a designar abogado.\n4. Derecho a que se ponga en conocimiento de un familiar el hecho de la detención.\n5. Derecho a ser asistido por intérprete gratuito (si procede).\n">🛡️ Lectura Derechos (Detenido)</option>
                      </optgroup>

                      <optgroup label="--- TRAFICO Y ALCOHOLEMIA ---">
                        <option value="\n[[ PRUEBA DE ALCOHOLEMIA ]]\n\nETILÓMETRO: {Modelo_Etilometro}\nEXPIRA: {Fecha_Calibracion}\n\n1ª PRUEBA: {Resultado_1} mg/l a las {Hora_1}\n2ª PRUEBA: {Resultado_2} mg/l a las {Hora_2}\n\nSÍNTOMAS QUE PRESENTA: {Sintomatologia_Detectada}\n">🍺 Acta Alcoholemia</option>
                        <option value="\n[[ DILIGENCIA DE CITACIÓN ]]\n\nPor la presente se cita a D/Dña {Nombre_Citado} para que comparezca el próximo día {Fecha_Cita} a las {Hora_Cita} horas ante {Lugar_Comparecencia} (Juzgado/Dependencia Policial) en relación con las presentes actuaciones.\n">📅 Citación Formal</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    <select
                      className="border border-amber-200 rounded bg-amber-50 text-amber-900 text-xs font-bold px-2 py-1.5 h-8 outline-none hover:bg-amber-100 transition-colors"
                      onChange={(e) => {
                        addKeywordToEditor(e.target.value);
                        e.target.value = '';
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>🏷️ REUTILIZAR VARIABLE...</option>
                      {variablesDetectadas.map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                    <button 
                      type="button" 
                      onClick={() => addKeywordToEditor('nueva_palabra')} 
                      className="flex items-center gap-1.5 text-xs h-8 rounded px-3 bg-slate-800 text-white hover:bg-slate-900 font-bold active:scale-95 transition-all shadow-sm"
                    >
                      <Tag className="w-3.5 h-3.5" /> Nueva Variable
                    </button>
                  </div>
                </div>
              </div>

              {/* Side-by-Side View Toggle */}
              <div className="bg-white border-b px-4 py-1.5 flex justify-end gap-4 items-center h-10 shadow-sm z-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Modo de visualización:</span>
                <div className="flex items-center bg-slate-100 rounded p-1 p-0.5">
                  <button 
                    type="button"
                    onClick={() => setShowPreview(false)}
                    className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded transition-all ${!showPreview ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Editor
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded transition-all ${showPreview ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Ver en Paralelo
                  </button>
                </div>
              </div>

              {/* Editor / Preview Area */}
              <div className="flex flex-1 min-h-0">
                {/* Editor Surface */}
                <div className={`flex flex-col flex-1 border-r transition-all duration-300 ${showPreview ? 'w-1/2' : 'w-full'}`}>
                   <div className="p-4 flex-1 flex flex-col min-h-0 bg-white">
                    <div className="bg-slate-50/80 rounded border border-slate-100 p-2 text-[10px] text-slate-500 mb-2 font-mono flex items-center gap-2">
                       <Info className="w-3 h-3" /> Usa las llaves <strong>{'{'} variable {'}'}</strong> para añadir campos que se preguntarán al usar la diligencia.
                    </div>
                    <Textarea
                      id="content"
                      name="content"
                      ref={textareaRef}
                      value={formData.content}
                      onChange={(e) => updateContent(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Empieza a redactar la diligencia policial..."
                      className={`flex-1 w-full resize-none font-mono text-base leading-relaxed p-4 bg-transparent outline-none focus:ring-0 border-none transition-all placeholder:text-slate-300 ${errors.content ? 'text-red-900' : 'text-slate-800'}`}
                      style={{ fontVariantLigatures: 'none' }}
                    />
                    {errors.content && (
                      <div className="p-2 bg-red-50 border border-red-100 rounded text-red-600 text-[11px] font-bold flex items-center gap-2">
                        <X className="w-3 h-3" /> {errors.content}
                      </div>
                    )}
                   </div>
                   <div className="bg-slate-50 px-4 py-1.5 border-t flex justify-between items-center text-[10px] font-bold text-slate-400">
                     <span className="flex items-center gap-4">
                       <span className="flex items-center gap-1 uppercase tracking-tight"><Tag className="w-3 h-3" /> Variables detectadas: {variablesDetectadas.length}</span>
                       <span className="flex items-center gap-1 uppercase tracking-tight"><FileText className="w-3 h-3" /> Caracteres: {formData.content.length}</span>
                     </span>
                   </div>
                </div>

                {/* Preview Surface */}
                {showPreview && (
                  <div className="w-1/2 bg-[#fdfdfd] overflow-y-auto animate-in slide-in-from-right-1 duration-300">
                    <div className="sticky top-0 bg-[#fdfdfd]/95 backdrop-blur px-6 py-2 border-b flex items-center gap-2 z-10 shadow-sm">
                       <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-[#002856]">Vista Previa en Tiempo Real</span>
                    </div>
                    <div className="p-8 pb-32 prose prose-slate max-w-none prose-sm sm:prose-base font-sans overflow-x-hidden">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={{
                          table: ({node, ...props}) => (
                            <div className="overflow-x-auto my-6">
                              <table className="min-w-full divide-y divide-[#002856]/20 border-collapse border border-[#002856]/20 shadow-sm" {...props} />
                            </div>
                          ),
                          th: ({node, ...props}) => <th className="bg-[#002856]/5 px-4 py-2 text-left text-xs font-bold text-[#002856] border border-[#002856]/20" {...props} />,
                          td: ({node, ...props}) => <td className="px-4 py-2 text-sm text-gray-800 border border-[#002856]/20" {...props} />,
                          p: ({node, children, ...props}) => {
                            // Extraer texto plano
                            const flatten = (items) => {
                              if (!items) return '';
                              return React.Children.toArray(items).reduce((acc, item) => {
                                if (typeof item === 'string') return acc + item;
                                if (item.props && item.props.children) return acc + flatten(item.props.children);
                                return acc;
                              }, '');
                            };
                            
                            const textContent = flatten(children).trim();
                            const isBox = textContent.includes('╔') || textContent.includes('║') || textContent.includes('╚');
                            
                            // Nuevo: Deteción de recuadro estilo [[ texto ]]
                            const isModernBox = textContent.startsWith('[[') && textContent.endsWith(']]');
                            
                            if (isModernBox) {
                              return (
                                <div className="my-8 mx-auto max-w-[80%] p-6 border-2 border-[#002856] rounded shadow-sm bg-white text-center font-bold text-lg text-[#002856] flex items-center justify-center min-h-[80px] whitespace-pre-wrap">
                                   <div className="variables-ready">
                                     {/* Modificamos los hijos para quitar los corchetes [[ ]] visualmente */}
                                     {React.Children.map(children, (child, i) => {
                                       if (typeof child === 'string') {
                                         if (i === 0) return child.replace(/^\[\[/, '');
                                         if (i === React.Children.count(children) - 1) return child.replace(/\]\]$/, '');
                                         return child;
                                       }
                                       return child;
                                     })}
                                   </div>
                                </div>
                              );
                            }

                            if (isBox) {
                              return (
                                <div className="my-6 p-6 border-2 border-[#002856] rounded-md bg-blue-50/10 font-mono text-[11px] leading-tight whitespace-pre overflow-x-auto shadow-sm border-dashed">
                                  {children}
                                </div>
                              );
                            }
                            return <p className="leading-relaxed mb-6 whitespace-pre-wrap text-[#2d3748] text-base" {...props}>{children}</p>;
                          },
                          strong: ({node, ...props}) => <strong className="font-bold text-[#002856] bg-blue-50/30 px-0.5 rounded" {...props} />,
                          em: ({node, ...props}) => <em className="italic text-slate-700" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-xl font-bold text-[#002856] border-b-2 border-[#002856]/10 pb-2 mt-8 mb-4 flex items-center gap-2" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ml-6 my-4 space-y-2 block text-slate-700" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal ml-6 my-4 space-y-2 block text-slate-700" {...props} />,
                          li: ({node, ...props}) => <li className="pl-1" {...props} />,
                          hr: ({node, ...props}) => <hr className="my-8 border-t border-slate-200" {...props} />,
                        }}
                      >
                        {formData.content 
                          ? formData.content
                              .replace(/\\n/g, '\n') // Reemplazar \n literal por salto de línea real
                              .replace(/\{([^}]+)\}/g, '**[$1_VALOR]**') 
                          : '_Sin contenido para mostrar_'}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditarPlantilla;