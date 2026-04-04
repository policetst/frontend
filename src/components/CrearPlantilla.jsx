// pages/CrearPlantilla.jsx
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate, useBlocker } from 'react-router-dom';

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
import { Tag, FileText, X, ArrowLeft, Save, Bold, Heading, List, ListOrdered, Table, PenTool, Square, Minus, Info, Edit3, Eye, CheckSquare, AlignJustify } from 'lucide-react';


import TableGeneratorModal from './TableGeneratorModal';


const CrearPlantilla = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: ''
  });
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'preview'
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const textareaRef = useRef(null);
  const overlayRef = useRef(null);

  const handleScrollSync = (e) => {
    if (overlayRef.current) {
      overlayRef.current.scrollTop = e.target.scrollTop;
      overlayRef.current.scrollLeft = e.target.scrollLeft;
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateTemplate(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const variables = extractVariables(formData.content);
      const plantillaData = { ...formData, variables: variables };
      await apiService.createPlantilla(plantillaData);
      skipBlockRef.current = true;
      await Swal.fire({
        title: '¡Éxito!',
        text: 'Plantilla creada correctamente',
        icon: 'success',
        confirmButtonColor: '#002856',
        timer: 1500
      });
      navigate('/plantillas');
    } catch (error) {
      console.error('Error al crear plantilla:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      Swal.fire({
        title: 'Error',
        text: 'Error: ' + errorMessage,
        icon: 'error',
        confirmButtonColor: '#002856',
      });
    } finally {
      setLoading(false);
    }
  };

  const variablesDetectadas = useMemo(() => extractVariables(formData.content), [formData.content]);

  const skipBlockRef = useRef(false);
  const hasChanges = formData.name !== '' || formData.description !== '' || formData.content !== '';

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
        text: 'Tienes una plantilla en progreso. Si sales ahora, perderás los cambios.',
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

  const handleBack = () => {
    if (hasChanges) {

      Swal.fire({
        title: '¿Guardar cambios?',
        text: 'Tienes una plantilla en progreso. ¿Deseas guardarla antes de salir?',
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
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleBack}
            className="p-2 transition-colors hover:bg-white rounded-full text-slate-500"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Nueva Plantilla de Diligencia</h1>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-[#002856] hover:bg-blue-800 rounded shadow-md transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Guardando...' : 'Crear Plantilla'}
        </button>
      </div>

      <Card className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden shadow-xl border-none">
        <CardContent className="flex-1 p-0 flex flex-col">
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            {/* Toolbar Area */}
            <div className="bg-slate-50 border-b p-4 space-y-4 shadow-sm z-30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase">Nombre de la Diligencia</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej: Diligencia de Inicio de Atestado"
                    className={`mt-1 h-9 ${errors.name ? 'border-red-500' : ''}`}
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-xs font-bold text-slate-500 uppercase">Descripción / Uso</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Instrucciones para el agente..."
                    className="mt-1 h-9"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 items-center border-t pt-3">
                <div className="flex bg-white border rounded p-0.5 divide-x">
                  <button type="button" onClick={() => addFormat('**', '**')} className="p-1.5 hover:bg-slate-50" title="Negrita"><Bold className="w-4 h-4" /></button>
                  <button type="button" onClick={() => addFormat('### ')} className="p-1.5 hover:bg-slate-50" title="Título"><Heading className="w-4 h-4" /></button>
                </div>
                <div className="flex bg-white border rounded p-0.5 divide-x">
                  <button type="button" onClick={() => addFormat('\n- ')} className="p-1.5 hover:bg-slate-50"><List className="w-4 h-4" /></button>
                  <button type="button" onClick={() => addFormat('\n1. ')} className="p-1.5 hover:bg-slate-50"><ListOrdered className="w-4 h-4" /></button>
                </div>
                <button type="button" onClick={() => setIsTableModalOpen(true)} className="bg-white border px-2 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50"><Table className="w-4 h-4" /> TABLA</button>
                <button type="button" onClick={() => addFormat('\n[[ {Texto_del_recuadro} ]]\n')} className="bg-white border px-2 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50"><Square className="w-4 h-4" /> RECUADRO</button>
                <button type="button" onClick={() => addFormat('\n[ ] SI    [ ] NO\n')} className="bg-white border px-2 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50"><CheckSquare className="w-4 h-4" /> SI/NO</button>



                <div className="ml-4 flex bg-slate-200/50 p-1 rounded-lg border border-slate-200">
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


                
                <div className="ml-auto flex items-center gap-2">
                  <select
                    className="border rounded px-2 py-1.5 text-xs bg-blue-50 text-blue-700 font-bold"
                    onChange={(e) => { addFormat(e.target.value); e.target.value = ''; }}
                    defaultValue=""
                  >
                    <option value="" disabled>INSERTAR BLOQUE...</option>
                    <option value={"\n--- DATOS PERSONALES ---\nNombre: {Nombre}\nApellidos: {Apellidos}\nDNI: {DNI}\n"}>👤 Identificación</option>
                    <option value={"\n[[ DILIGENCIA DE INICIO ]]\nEn la localidad de {Poblacion}, siendo las {Hora} del día {Fecha}...\n"}>📜 Inicio Atestado</option>

                  </select>
                  <button type="button" onClick={() => {
                    Swal.fire({
                      title: 'Guía de Redacción',
                      html: `
                        <div class="text-left text-sm space-y-4 font-serif text-gray-800">
                          <div class="bg-gray-50 border p-3 rounded-lg">
                            <strong class="text-blue-900 flex items-center gap-2 mb-2">1. Formato Rápido (Negritas y Títulos)</strong>
                            <p class="leading-relaxed">Selecciona el texto que desees con el ratón y pulsa los botones de <b>Negrita</b> (B) o <b>Título</b> (H). El sistema añadirá los caracteres de formato alrededor por ti, o puedes añadirlos antes de empezar a escribir.</p>
                          </div>
                          
                          <div class="bg-gray-50 border p-3 rounded-lg">
                            <strong class="text-blue-900 flex items-center gap-2 mb-2">2. Tablas Visibles Policiales</strong>
                            <p class="leading-relaxed mb-2">Una tabla se dibuja separando columnas con espacios (con darle a la barra espaciadora 4 veces es suficiente) o usando la tecla TAB. Los encabezados no llevan guión inicial, pero las filas de debajo sí:</p>
                            <div class="bg-white p-2 border border-blue-200 rounded font-mono text-[11px] leading-relaxed">
                              CONCEPTO    DETALLES<br/>
                              - Fuego    Extinto<br/>
                              - Heridos    Ninguno
                            </div>
                            <p class="text-[11px] text-gray-500 mt-2">* El Generador de Tablas (botón TABLA) lo armará por ti automáticamente.</p>
                          </div>

                          <div class="bg-gray-50 border p-3 rounded-lg">
                            <strong class="text-blue-900 flex items-center gap-2 mb-2">3. Variables Mágicas</strong>
                            <p class="leading-relaxed">Selecciona una palabra, haz clic en <b>+ VARIABLE</b> y la palabra se rodeará con llaves <code>{ }</code>. El sistema detectará automáticamente eso como un dato a rellenar justo antes de imprimir el atestado final.</p>
                          </div>
                        </div>
                      `,
                      confirmButtonColor: '#002856',
                      confirmButtonText: 'Entendido',
                      width: '600px'
                    });
                  }} className="bg-blue-100 text-blue-800 p-1.5 rounded-full hover:bg-blue-200 transition-colors ml-1 mr-1" title="Ayuda sobre redacción">
                    <Info className="w-5 h-5" />
                  </button>

                  <button type="button" onClick={() => addKeywordToEditor('nueva_variable')} className="bg-slate-800 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-slate-900 transition-all"><Tag className="w-3.5 h-3.5" /> + VARIABLE</button>
                </div>
              </div>
            </div>


            {/* Smart Integrated Editor Area */}
            <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-slate-200">
              {/* TOOLBAR FIXED */}
              <div className="z-30 bg-white/95 border-b px-6 py-2 flex justify-between items-center shadow-sm shrink-0">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">Documento (A4)</span>
                <div className="flex gap-4 text-[10px] font-bold text-slate-400">
                  <span>VARIABLES: {variablesDetectadas.length}</span>
                  <span>CARACTERES: {formData.content.length}</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center py-8">
                <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-2xl border border-slate-300 relative flex flex-col shrink-0">
                  
                  <div className="flex-1 relative bg-white flex flex-col min-h-0">
                    <div className={`flex-1 relative px-8 py-10 md:px-[25mm] md:py-[20mm] flex flex-col min-h-0 ${activeTab === 'preview' ? 'overflow-y-auto custom-scrollbar' : ''}`}>

                      {activeTab === 'edit' ? (
                        <div className="relative flex-1 w-full h-full min-h-0">
                          {/* BOTTOM LAYER: Visible editable text */}
                          <Textarea
                            id="content"
                            name="content"
                            ref={textareaRef}
                            value={formData.content}
                            onChange={(e) => updateContent(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onScroll={handleScrollSync}
                            placeholder="Empieza a redactar la diligencia..."
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

                          {/* TOP LAYER: Transparent syntax overlay */}
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

                  {!formData.content && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                      <div className="text-center font-bold text-slate-300">
                        <FileText className="w-16 h-16 mx-auto mb-2 text-slate-400" />
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Editor Policíaco</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <TableGeneratorModal 
        isOpen={isTableModalOpen} 
        onClose={() => setIsTableModalOpen(false)} 
        onInsert={(markdown) => addFormat(markdown)} 
      />
    </div>

  );
};

export default CrearPlantilla;