import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';

import apiService from '../../services/apiService';
import Swal from 'sweetalert2';
import { extractVariables, validateTemplate, parseCustomTable } from '../utils/types';
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
  Tag, FileText, CheckSquare, AlignJustify
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
  const [showMetaFields, setShowMetaFields] = useState(false);
  const textareaRef = useRef(null);
  const overlayRef = useRef(null);

  const handleScrollSync = (e) => {
    if (overlayRef.current) {
      overlayRef.current.scrollTop = e.target.scrollTop;
      overlayRef.current.scrollLeft = e.target.scrollLeft;
    }
  };



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
      skipBlockRef.current = true;
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
        skipBlockRef.current = true;
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

  const variablesDetectadas = extractVariables(formData.content);

  const skipBlockRef = useRef(false);
  const hasChanges = 
    formData.name !== (plantilla?.name || '') || 
    formData.description !== (plantilla?.description || '') || 
    formData.content !== (plantilla?.content || '');

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges && !skipBlockRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  let blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasChanges && !skipBlockRef.current && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === 'blocked') {
      Swal.fire({
        title: '¿Salir sin guardar?',
        text: 'Has modificado la plantilla. Si sales ahora, perderás los cambios.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, salir sin guardar',
        cancelButtonText: 'No, quedarme',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
      }).then((result) => {
        if (result.isConfirmed) {
          blocker.proceed();
        } else {
          blocker.reset();
        }
      });
    }
  }, [blocker]);

  if (loading) {
    return (
      <div className="p-6 text-center">Cargando plantilla...</div>
    );
  }

  const handleBack = () => {
    if (hasChanges) {
      Swal.fire({
        title: '¿Guardar cambios?',
        text: 'Has modificado la plantilla. ¿Deseas guardar los cambios antes de salir?',
        icon: 'warning',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: 'Sí, guardar',
        denyButtonText: 'Salir sin guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#002856',
        denyButtonColor: '#d33'
      }).then((result) => {
        if (result.isConfirmed) {
          handleSubmit({ preventDefault: () => {} });
        } else if (result.isDenied) {
          navigate('/plantillas');
        }
      });
    } else {
      navigate('/plantillas');
    }
  };

  return (
    <div className="p-4 bg-slate-100 min-h-screen">
      <div className="grid grid-cols-1 gap-4 h-[calc(100vh-2rem)] flex-1 min-h-0">
        <Card className="flex flex-col overflow-hidden border-none shadow-xl bg-white h-full">
          <CardContent className="flex-1 p-0 flex flex-col min-h-0">
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
              {/* Nuevo Toolbar Unificado */}
              <div className="bg-slate-50 border-b p-3 space-y-3 shadow-sm z-20">
                {/* Cabecera Principal */}
                <div className="flex justify-between items-center pb-2">
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={handleBack}
                      className="p-2 transition-colors hover:bg-slate-200 rounded-full text-slate-500"
                      title="Volver"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-slate-800">Plantilla: {plantilla?.name}</h1>
                        <button 
                          type="button"
                          onClick={() => setShowMetaFields(!showMetaFields)}
                          className={`p-1.5 hover:bg-white rounded-md text-slate-500 hover:text-blue-600 transition-colors shadow-sm bg-slate-200/50 border border-transparent hover:border-slate-300 ${showMetaFields ? 'bg-white border-slate-300 text-blue-600' : ''}`}
                          title="Editar datos de la plantilla"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Gestión de contenido dinámico para diligencias policiales</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button 
                      type="button"
                      onClick={handleDelete}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 border border-red-200 bg-white hover:bg-red-50 rounded shadow-sm transition-all"
                    >
                      <Trash2 className="w-4 h-4" /> Eliminar
                    </button>
                    <button 
                      type="submit"
                      onClick={handleSubmit} 
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-[#002856] hover:bg-blue-800 rounded shadow-md hover:shadow-lg transition-all disabled:bg-gray-400"
                    >
                      {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" /> : <Save className="w-4 h-4" />}
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </div>

                {/* Campos para editar datos de plantilla (condicionales) */}
                {showMetaFields && (
                  <div className="flex flex-wrap gap-4 pt-2 pb-1 border-t border-slate-200 animate-in slide-in-from-top duration-300">
                    <div className="flex-1 min-w-[250px]">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Label htmlFor="name" className="text-xs font-bold text-slate-600 uppercase tracking-widest">Nombre de la Plantilla</Label>
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
                )}

                {/* Rich Tools */}
                <div className="flex flex-wrap gap-2 items-center border-t border-slate-200 pt-3">
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
                    <button type="button" title="Insertar Selector SI/NO" onClick={() => addFormat('\n[ ] SI    [ ] NO\n')} className="px-2 py-1.5 hover:bg-slate-50 text-slate-600 rounded flex items-center gap-1.5" >
                      <CheckSquare className="w-4 h-4" /> <span className="text-xs font-bold uppercase">SI/NO</span>
                    </button>
                  </div>

                  <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 shadow-sm">
                    <button type="button" title="Líneas de escritura" onClick={() => {
                      Swal.fire({
                        title: 'Líneas de escritura',
                        text: '¿Qué tamaño de líneas necesitas?',
                        showDenyButton: true,
                        showCancelButton: true,
                        confirmButtonText: 'Frase/Párrafo',
                        denyButtonText: 'Palabra (Corta)',
                        cancelButtonText: 'Cancelar',
                        confirmButtonColor: '#002856',
                        denyButtonColor: '#475569'
                      }).then((result) => {
                        if (result.isConfirmed) {
                          addFormat('\n.......................................................................\n.......................................................................\n.......................................................................\n');
                        } else if (result.isDenied) {
                          addFormat(' ......................... ');
                        }
                      });
                    }} className="px-2 py-1.5 hover:bg-slate-50 text-slate-600 rounded flex items-center gap-1.5" >
                      <AlignJustify className="w-4 h-4" /> <span className="text-xs font-bold uppercase">LÍNEAS ESCRITURA</span>
                    </button>
                  </div>

                  <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 shadow-sm">
                    <button type="button" title="Firmas" onClick={() => addFormat('\n\nEL AGENTE (Número {Num}):\t\t\tEL INTERESADO:\n\n\n\n[Firma]\t\t\t\t\t\t[Firma]\n')} className="px-2 py-1.5 hover:bg-slate-50 text-slate-600 rounded flex items-center gap-1.5" >

                      <PenTool className="w-4 h-4" /> <span className="text-xs font-bold">BLOQUE FIRMA</span>
                    </button>
                  </div>

                  <div className="flex bg-slate-200/50 p-1 rounded-lg border border-slate-200 ml-auto mr-4">
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

                  <div className="flex items-center gap-2 ml-auto">
                    <button type="button" onClick={() => addKeywordToEditor('nueva_variable')} className="bg-slate-800 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-slate-900 transition-all shadow-sm">
                      <Tag className="w-3.5 h-3.5" /> + VARIABLE
                    </button>
                    
                    <button type="button" onClick={() => {
                      Swal.fire({
                        title: 'Guía de Redacción',
                        html: `
                          <div class="text-left text-sm space-y-4 font-serif text-gray-800">
                            <div class="bg-gray-50 border p-3 rounded-lg">
                              <strong class="text-blue-900 flex items-center gap-2 mb-2"><span class="text-lg">⌨️</span> 1. Formato Rápido (Negritas y Títulos)</strong>
                              <p class="leading-relaxed">Selecciona el texto que desees con el ratón y pulsa los botones de <b>Negrita</b> (B) o <b>Título</b> (H). El sistema añadirá los caracteres de formato alrededor por ti, o puedes añadirlos antes de empezar a escribir.</p>
                            </div>
                            
                            <div class="bg-gray-50 border p-3 rounded-lg">
                              <strong class="text-blue-900 flex items-center gap-2 mb-2"><span class="text-lg">📊</span> 2. Tablas Visibles Policiales</strong>
                              <p class="leading-relaxed mb-2">Una tabla se dibuja separando columnas con espacios (con darle a la barra espaciadora 4 veces es suficiente) o usando la tecla TAB. Los encabezados no llevan guión inicial, pero las filas de debajo sí:</p>
                              <div class="bg-white p-2 border border-blue-200 rounded font-mono text-[11px] leading-relaxed">
                                CONCEPTO    DETALLES<br/>
                                - Fuego    Extinto<br/>
                                - Heridos    Ninguno
                              </div>
                              <p class="text-[11px] text-gray-500 mt-2">* El Generador de Tablas (botón TABLA) lo armará por ti automáticamente.</p>
                            </div>
  
                            <div class="bg-gray-50 border p-3 rounded-lg">
                              <strong class="text-blue-900 flex items-center gap-2 mb-2"><span class="text-lg">🏷️</span> 3. Variables Mágicas</strong>
                              <p class="leading-relaxed">Selecciona una palabra, haz clic en <b>+ VARIABLE</b> y la palabra se rodeará con llaves <code>{ }</code>. El sistema detectará automáticamente eso como un dato a rellenar justo antes de imprimir el atestado final.</p>
                            </div>
                          </div>
                        `,
                        confirmButtonColor: '#002856',
                        confirmButtonText: 'Entendido',
                        width: '600px'
                      });
                    }} className="bg-blue-100 text-blue-800 p-1.5 rounded-full hover:bg-blue-200 transition-colors ml-1" title="Ayuda sobre redacción">
                      <Info className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Smart Live Editor Area */}
              <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-slate-200 border-t">
                {/* TOOLBAR FIXED */}
                <div className="z-30 bg-white/95 backdrop-blur-sm border-b px-6 py-2 flex items-center justify-between shadow-sm shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded uppercase tracking-widest">Documento (A4)</div>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase">
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Variables: {variablesDetectadas.length}</span>
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Caracteres: {formData.content.length}</span>
                  </div>
                </div>

                {/* Editor Container Style as a Sheet */}
                <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center py-8">
                  <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-2xl border border-slate-300 relative flex flex-col shrink-0">
                    
                    <div className="flex-1 relative bg-white flex flex-col min-h-0">
                      <div className={`flex-1 relative px-8 py-10 md:px-[25mm] md:py-[20mm] flex flex-col min-h-0 ${activeTab === 'preview' ? 'overflow-y-auto custom-scrollbar' : ''}`}>

                        {activeTab === 'edit' ? (
                          <div className="relative flex-1 w-full h-full min-h-0">
                            {/* UNDERLAY: The actual textarea */}
                            <Textarea
                              id="content"
                              name="content"
                              ref={textareaRef}
                              value={formData.content}
                              onChange={(e) => updateContent(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onScroll={handleScrollSync}
                              placeholder="Escribe la plantilla de la diligencia aquí..."
                              className="absolute inset-0 w-full h-full resize-none bg-transparent border-none focus:ring-0 text-slate-800 caret-blue-600 z-10 overflow-y-auto custom-scrollbar"
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
                              ref={overlayRef}
                              className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words text-transparent z-20 overflow-y-auto scrollbar-invisible"
                              aria-hidden="true"
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
                              {parseCustomTable(formData.content)}
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