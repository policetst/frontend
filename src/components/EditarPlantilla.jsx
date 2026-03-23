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
import TableGeneratorModal from './TableGeneratorModal';


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
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'preview'
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
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
                    <button type="button" title="Insertar Tabla" onClick={() => setIsTableModalOpen(true)} className="px-2 py-1.5 hover:bg-slate-50 text-slate-600 rounded flex items-center gap-1.5" >
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

                  <div className="flex bg-slate-200/50 p-1 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setActiveTab('edit')}
                      className={`px-4 py-1.5 text-[10px] font-black tracking-widest rounded-md flex items-center gap-2 transition-all ${activeTab === 'edit' ? 'bg-white text-blue-700 shadow-sm scale-110 z-10' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Edit3 className="w-3 h-3" /> REDACCIÓN
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className={`px-4 py-1.5 text-[10px] font-black tracking-widest rounded-md flex items-center gap-2 transition-all ${activeTab === 'preview' ? 'bg-white text-blue-700 shadow-sm scale-110 z-10' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Eye className="w-3 h-3" /> VISTA PREVIA
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
                        <option value={"[[ DILIGENCIA DE INICIO ]]\n\nEn la localidad de {Poblacion}, siendo las {Hora_Inicio} horas del día {Fecha_Inicio}, el Agente con carné profesional número {Num_Agente}, actuando como Instructor, procede a la apertura del presente atestado por los hechos que se detallarán a continuación.\n"}>📝 Diligencia de Inicio</option>
                        <option value={"\n[[ DILIGENCIA DE CIERRE Y REMISIÓN ]]\n\nY para que conste, se cierra la presente diligencia a las {Hora_Cierre} horas del día {Fecha_Cierre}, procediendo a su remisión al Juzgado de Instrucción en funciones de Guardia de {Localidad_Juzgado}.\n"}>🏁 Cierre y Remisión</option>
                      </optgroup>

                      <optgroup label="--- IDENTIFICACIÓN Y DATOS ---">
                        <option value={"\n--- DATOS PERSONALES ---\nNombre: {Nombre}\nApellidos: {Apellidos}\nDNI/NIE: {Documento_Identidad}\nFecha Nacimiento: {Fecha_Nacimiento}\nNatural de: {Natural_de}\nDomicilio: {Domicilio}\nTeléfono: {Telefono}\n"}>👤 Identificación Persona</option>
                        <option value={"\n--- DATOS VEHÍCULO ---\nMarca: {Marca}\nModelo: {Modelo}\nMatrícula: {Matricula}\nColor: {Color}\nBastidor: {Num_Bastidor}\n"}>🚗 Datos Vehículo</option>
                        <option value={"\n--- UBICACIÓN Y TIEMPO ---\nLugar: {Lugar_Hechos}\nCía/Vía: {Calle_o_Punto_Kilometrico}\nLocalidad: {Poblacion}\nFecha: {Fecha_Hechos}\nHora: {Hora_Hechos}\n"}>📍 Perímetro/Ubicación</option>
                      </optgroup>

                      <optgroup label="--- DECLARACIONES Y DERECHOS ---">
                        <option value={"\n[[ DILIGENCIA DE DECLARACIÓN DE TESTIGO ]]\n\nInstruido de la obligación legal de decir verdad y de las penas con las que la Ley castiga el delito de falso testimonio en causa judicial, manifiesta:\n\nPREGUNTADO: {Pregunta_1}\nRESPUESTA: {Respuesta_1}\n"}>🗣️ Declaración Testigo</option>
                        <option value={"\n[[ OFRECIMIENTO DE ACCIONES (Art. 109 LECrim) ]]\n\nSe informa al ofendido/perjudicado de su derecho a mostrarse parte en el proceso, pudiendo nombrar Abogado y Procurador o solicitar la designación de oficio, así como de su derecho a la restitución de la cosa, reparación del daño e indemnización.\n"}>⚖️ Ofrecimiento Acciones</option>
                        <option value={"\n--- LECTURA DE DERECHOS (Art. 520 LECrim) ---\nSe procede a la lectura de los derechos que le asisten según el Art. 520 de la LECrim:\n1. Derecho a guardar silencio.\n2. Derecho a no declarar contra sí mismo.\n3. Derecho a designar abogado.\n4. Derecho a que se ponga en conocimiento de un familiar el hecho de la detención.\n5. Derecho a ser asistido por intérprete gratuito (si procede).\n"}>🛡️ Lectura Derechos (Detenido)</option>
                      </optgroup>

                      <optgroup label="--- TRAFICO Y ALCOHOLEMIA ---">
                        <option value={"\n[[ PRUEBA DE ALCOHOLEMIA ]]\n\nETILÓMETRO: {Modelo_Etilometro}\nEXPIRA: {Fecha_Calibracion}\n\n1ª PRUEBA: {Resultado_1} mg/l a las {Hora_1}\n2ª PRUEBA: {Resultado_2} mg/l a las {Hora_2}\n\nSÍNTOMS QUE PRESENTA: {Sintomatologia_Detectada}\n"}>🍺 Acta Alcoholemia</option>
                        <option value={"\n[[ DILIGENCIA DE CITACIÓN ]]\n\nPor la presente se cita a D/Dña {Nombre_Citado} para que comparezca el próximo día {Fecha_Cita} a las {Hora_Cita} horas ante {Lugar_Comparecencia} (Juzgado/Dependencia Policial) en relación con las presentes actuaciones.\n"}>📅 Citación Formal</option>
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

              {/* Smart Live Editor Area */}
              <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-white border-t">
                {/* Editor Container Style as a Sheet */}
                <div className="flex-1 overflow-y-auto p-4 flex justify-center bg-slate-100/50 scroll-smooth custom-scrollbar">
                  <div className="w-full max-w-4xl min-h-full bg-white shadow-xl border border-slate-200 relative police-document-sheet p-0 flex flex-col">
                    
                    {/* Toolbar Internal */}
                    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b px-4 py-2 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded uppercase tracking-widest">Editor Inteligente</div>
                        <span className="text-[10px] text-slate-400 font-medium">Autodetectando Markdown...</span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase">
                        <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Variables: {variablesDetectadas.length}</span>
                        <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Caracteres: {formData.content.length}</span>
                      </div>
                    </div>

                    <div className="flex-1 relative bg-white overflow-hidden min-h-[850px] flex flex-col">
                      <div className="flex-1 relative p-12 overflow-y-auto">

                        {activeTab === 'edit' ? (
                          <div className="relative w-full h-full min-h-[600px]">
                            {/* UNDERLAY: The actual textarea */}
                            <Textarea
                              id="content"
                              name="content"
                              ref={textareaRef}
                              value={formData.content}
                              onChange={(e) => updateContent(e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder="Escribe la plantilla de la diligencia aquí..."
                              className="absolute inset-0 w-full h-full resize-none bg-transparent border-none focus:ring-0 text-slate-800 caret-blue-600 z-10"
                              style={{ 
                                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                                fontSize: '16px',
                                lineHeight: '26px',
                                padding: 0,
                                margin: 0,
                                fontVariantLigatures: 'none',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                              }}
                            />

                            {/* OVERLAY: The "Tint" layer with syntax highlights */}
                            <div 
                              className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words text-transparent z-20"
                              aria-hidden="true"
                              style={{ 
                                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                                fontSize: '16px',
                                lineHeight: '26px',
                                padding: 0,
                                margin: 0,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                              }}
                            >
                              {formData.content.split('\n').map((line, i) => {
                                let processed = line
                                  .replace(/&/g, '&amp;')
                                  .replace(/</g, '&lt;')
                                  .replace(/>/g, '&gt;');
                                
                                processed = processed.replace(/\{([^}]+)\}/g, '<span class="bg-blue-400/20 text-blue-800/80">{$1}</span>');
                                processed = processed.replace(/\*\*([^*]+)\*\*/g, '<span class="border-b border-indigo-300">**$1**</span>');
                                processed = processed.replace(/\[\[(.*?)\]\]/g, '<span class="bg-slate-800/10 border border-slate-200">[[ $1 ]]</span>');
                                
                                if (line.startsWith('### ')) {
                                  processed = `<span class="bg-slate-50/50 border-b border-slate-100">${processed}</span>`;
                                }
                                return (
                                  <div key={i} dangerouslySetInnerHTML={{ __html: processed || '&nbsp;' }} style={{ minHeight: '26px' }} />
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="prose prose-slate max-w-none official-markdown-render animate-in fade-in duration-300">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm, remarkBreaks]}
                              components={{
                                p: ({ children }) => {
                                  // Manejar bloques especiales [[ ... ]]
                                  const text = React.Children.toArray(children).join('');
                                  if (text.startsWith('[[') && text.endsWith(']]')) {
                                    return (
                                      <div className="my-6 p-6 border-4 border-gray-900 text-center font-black uppercase tracking-tight bg-gray-50 scale-[1.02] transform transition-transform">
                                        {text.replace(/\[\[|\]\]/g, '')}
                                      </div>
                                    );
                                  }
                                  return <p className="mb-4 leading-relaxed text-gray-800">{children}</p>;
                                },
                                h3: ({ children }) => (
                                  <h3 className="text-xl font-black text-gray-900 border-b-2 border-gray-900 pb-1 mt-8 mb-4 uppercase tracking-tighter italic">
                                    {children}
                                  </h3>
                                ),
                                strong: ({ children }) => <strong className="font-black text-gray-900 decoration-blue-500/30 underline decoration-2">{children}</strong>,
                                hr: () => <hr className="my-8 border-t-2 border-dashed border-gray-300" />,
                                table: ({ children }) => (
                                  <div className="overflow-x-auto my-6 border-2 border-gray-900">
                                    <table className="min-w-full divide-y divide-gray-900">{children}</table>
                                  </div>
                                ),
                                th: ({ children }) => <th className="bg-gray-100 px-4 py-2 text-left text-xs font-black uppercase tracking-widest text-gray-900 border-r border-gray-900">{children}</th>,
                                td: ({ children }) => <td className="px-4 py-2 text-sm border-r border-gray-900 text-gray-800">{children}</td>
                              }}
                            >
                              {formData.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <TableGeneratorModal 
        isOpen={isTableModalOpen} 
        onClose={() => setIsTableModalOpen(false)} 
        onInsert={(markdown) => addFormat(markdown)} 
      />
    </div>

  );
};

export default EditarPlantilla;