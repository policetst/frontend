// pages/CrearPlantilla.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const CrearPlantilla = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: ''
  });
  const [errors, setErrors] = useState({});
<<<<<<< Updated upstream
=======
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef(null);

  // Función única para actualizar el contenido del editor
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

    // Si hay selección, envuelve la selección
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

    // Sin selección: envuelve la palabra alrededor del cursor
    const before = content.slice(0, start);
    const after = content.slice(start);
    const wordBeforeMatch = before.match(/(\w+)$/);
    const wordAfterMatch = after.match(/^(\w+)/);

    let wordStart = start;
    let wordEnd = start;

    if (wordBeforeMatch) {
      wordStart = start - wordBeforeMatch[1].length;
    }
    if (wordAfterMatch) {
      wordEnd = start + wordAfterMatch[1].length;
    }

    if (wordStart === wordEnd) {
      // No hay palabra, inserta default
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

    // Si no hay selección, simplemente inserta en la posición del cursor
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
      
      // Encontrar el inicio de la línea actual
      const linesBefore = content.slice(0, start).split('\n');
      const currentLine = linesBefore[linesBefore.length - 1];

      // Caso 1: Lista con viñetas (- )
      const bulletMatch = currentLine.match(/^(\s*)-\s+(.*)/);
      if (bulletMatch) {
        e.preventDefault();
        const indent = bulletMatch[1];
        const text = bulletMatch[2].trim();

        if (text === '') {
          // Si el elemento está vacío, borrar el indicador para terminar la lista
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

      // Caso 2: Lista numerada (1. )
      const numberMatch = currentLine.match(/^(\s*)(\d+)\.\s+(.*)/);
      if (numberMatch) {
        e.preventDefault();
        const indent = numberMatch[1];
        const num = parseInt(numberMatch[2], 10);
        const text = numberMatch[3].trim();

        if (text === '') {
          // Si el elemento está vacío, borrar el indicador para terminar la lista
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
>>>>>>> Stashed changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    const validation = validateTemplate(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Extraer variables del contenido
      const variables = extractVariables(formData.content);
      
      const plantillaData = {
        ...formData,
        variables: variables
      };

      await apiService.createPlantilla(plantillaData);
<<<<<<< Updated upstream

      alert('Plantilla creada correctamente');
=======
      await Swal.fire({
        title: '¡Éxito!',
        text: 'Plantilla creada correctamente',
        icon: 'success',
        confirmButtonColor: '#002856',
        timer: 1500
      });
>>>>>>> Stashed changes
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Extraer variables del contenido actual
  const variables = extractVariables(formData.content);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Crear Nueva  Diligencia</h1>
        <Button
          variant="outline"
          onClick={() => navigate('/plantillas')}
        >
          Volver
        </Button>
      </div>
<<<<<<< Updated upstream
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Diligencia</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
=======

      <Card className="h-[calc(100vh-10rem)] flex flex-col">
        <CardHeader>
          <CardTitle>Editor de Plantilla</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-b">
>>>>>>> Stashed changes
              <div>
                <Label htmlFor="name">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nombre de la diligencia"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
<<<<<<< Updated upstream
                  placeholder="Descripción de la diligencia (opcional)"
                  rows={3}
=======
                  placeholder="Descripción (opcional)"
                  rows={1}
                  className="min-h-[38px] resize-none"
>>>>>>> Stashed changes
                />
              </div>

<<<<<<< Updated upstream
              <div>
                <Label htmlFor="content">
                  Contenido <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Contenido de la plantilla. Usa {palabra} para crear Palabra Clave."
                  rows={10}
                  className={errors.content ? 'border-red-500' : ''}
                />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Tip: Usa llaves para crear Palabras clave, por ejemplo: {'{nombre}'}, {'{fecha}'}, {'{descripcion}'}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Creando...' : 'Crear Diligencia'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/plantillas')}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Vista previa */}
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Variables detectadas */}
              <div>
                <h3 className="font-medium mb-2">Palabras clave detectadas ({variables.length})</h3>
                {variables.length === 0 ? (
                  <p className="text-gray-500 text-sm">No se detectaron Palabras clave</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {variables.map((variable, idx) => (
                      <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {variable}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Contenido con variables resaltadas */}
              <div>
                <h3 className="font-medium mb-2">Contenido</h3>
                <div className="p-3 bg-gray-50 rounded border min-h-[200px] text-sm">
                  {formData.content ? (
                    <div className="whitespace-pre-wrap">
                      {formData.content.split(/(\{[^}]+\})/).map((part, idx) => (
                        part.startsWith('{') && part.endsWith('}') ? (
                          <mark key={idx} className="bg-yellow-200 px-1 rounded">
                            {part}
                          </mark>
                        ) : (
                          <span key={idx}>{part}</span>
                        )
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">El contenido aparecerá aquí...</p>
                  )}
=======
            <div className="p-4 flex flex-col flex-1 overflow-hidden">
              <div className="flex flex-wrap gap-2 mb-2 items-center">
                <Label className="text-xs font-semibold text-gray-700">Herramientas:</Label>
                <select
                  className="border rounded px-2 py-1 text-sm bg-white"
                  onChange={(e) => {
                    addKeywordToEditor(e.target.value);
                    e.target.value = '';
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Variables existentes...</option>
                  {variablesDetectadas.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                <button type="button" onClick={() => addKeywordToEditor('palabra')} className="text-xs rounded bg-blue-600 text-white px-2 py-1 hover:bg-blue-700 shadow-sm transition-colors">+ palabra clave</button>
                <div className="h-4 w-[1px] bg-gray-300 mx-1" />
                <button type="button" title="Negrita" className="text-xs rounded border border-gray-300 px-2.5 py-1 hover:bg-gray-100 font-bold" onClick={() => addFormat('**', '**')}>B</button>
                <button type="button" title="Cursiva" className="text-xs rounded border border-gray-300 px-2.5 py-1 hover:bg-gray-100 italic" onClick={() => addFormat('*', '*')}>I</button>
                <button type="button" title="Título" className="text-xs rounded border border-gray-300 px-2.5 py-1 hover:bg-gray-100 font-bold" onClick={() => addFormat('### ')}>T</button>
                <div className="h-4 w-[1px] bg-gray-300 mx-1" />
                <button type="button" title="Lista" className="text-xs rounded border border-gray-300 px-2.5 py-1 hover:bg-gray-100" onClick={() => addFormat('\n- ')}>• Lista</button>
                <button type="button" title="Lista numerada" className="text-xs rounded border border-gray-300 px-2.5 py-1 hover:bg-gray-100" onClick={() => addFormat('\n1. ')}>1. Lista</button>
                <div className="h-4 w-[1px] bg-gray-300 mx-1" />
                <button type="button" title="Añadir Tabla" className="text-xs rounded border border-gray-300 px-2.5 py-1 hover:bg-gray-100" onClick={() => addFormat('\n| Concepto | Información |\n|---|---|\n| {Etiqueta1} | {Valor1} |\n| {Etiqueta2} | {Valor2} |\n')}>田 Tabla</button>
                <button type="button" title="Bloque de Firma" className="text-xs rounded border border-gray-300 px-2.5 py-1 hover:bg-gray-100" onClick={() => addFormat('\n\nEL AGENTE (Número {Num}):\t\t\tEL INTERESADO:\n\n\n\n[Firma]\t\t\t\t\t\t[Firma]\n')}>✎ Firma</button>
                <button type="button" title="Recuadro" className="text-xs rounded border border-gray-300 px-2.5 py-1 hover:bg-gray-100" onClick={() => addFormat('\n╔════════════════════════════════════════╗\n║  {Texto_del_recuadro}                  ║\n╚════════════════════════════════════════╝\n')}>□ Cuadro</button>
                <button type="button" title="Línea" className="text-xs rounded border border-gray-300 px-2.5 py-1 hover:bg-gray-100" onClick={() => addFormat('\n---\n')}>— Divisor</button>
                <div className="h-4 w-[1px] bg-gray-300 mx-1" />
                <select
                  className="border rounded px-2 py-1 text-sm bg-blue-50 text-blue-700 font-medium cursor-pointer hover:bg-blue-100"
                  onChange={(e) => {
                    addFormat(e.target.value);
                    e.target.value = '';
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>📋 Bloques Policiales...</option>
                  <option value="\n--- IDENTIFICACIÓN PERSONA ---\nNombre: {Nombre}\nApellidos: {Apellidos}\nDNI/NIE: {Documento}\nDomicilio: {Domicilio}\n">👤 Identificación Persona</option>
                  <option value="\n--- VEHÍCULO IMPLICADO ---\nMarca: {Marca}\nModelo: {Modelo}\nMatrícula: {Matricula}\nColor: {Color}\n">🚗 Datos Vehículo</option>
                  <option value="\n--- LECTURA DE DERECHOS ---\nSe procede a la lectura de los derechos que le asisten según el Art. 520 de la LECrim:\n1. Derecho a guardar silencio.\n2. Derecho a no declarar contra sí mismo.\n3. Derecho a designar abogado.\n...">⚖️ Lectura Derechos</option>
                  <option value="\n--- UBICACIÓN ---\nLugar: {Lugar_Hechos}\nLocalidad: {Poblacion}\nFecha: {Fecha_Hechos}\nHora: {Hora_Hechos}\n">📍 Ubicación/Fecha</option>
                </select>
                <div className="h-4 w-[1px] bg-gray-300 mx-1" />
                <button 
                  type="button" 
                  onClick={() => setShowPreview(!showPreview)} 
                  className={`text-xs rounded px-2.5 py-1 flex items-center gap-1 transition-colors ${showPreview ? 'bg-indigo-600 text-white shadow-inner' : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'}`}
                >
                  {showPreview ? '📝 Ver Editor' : '👁️ Ver Vista Previa'}
                </button>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                {!showPreview ? (
                  <>
                  <Textarea
                    id="content"
                    name="content"
                    ref={textareaRef}
                    value={formData.content}
                    onChange={(e) => updateContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe la plantilla aquí. Usa {llaves} para variables..."
                    className={`flex-1 w-full resize-none font-mono text-sm leading-snug ${errors.content ? 'border-red-500' : ''}`}
                    style={{ fontVariantLigatures: 'none' }}
                  />
                  {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
                  </>
                ) : (
                  <div className="flex-1 overflow-y-auto bg-gray-50 border rounded p-6 prose prose-slate max-w-none prose-sm sm:prose-base font-sans shadow-inner">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      components={{
                        table: ({node, ...props}) => (
                          <div className="overflow-x-auto my-4">
                            <table className="min-w-full divide-y divide-gray-300 border-collapse border-2 border-gray-400" {...props} />
                          </div>
                        ),
                        th: ({node, ...props}) => <th className="bg-gray-100 px-3 py-2 text-left text-xs font-bold text-gray-700 border-2 border-gray-400" {...props} />,
                        td: ({node, ...props}) => <td className="px-3 py-2 text-sm text-gray-800 border-2 border-gray-400" {...props} />,
                        p: ({node, ...props}) => <p className="leading-relaxed mb-4 whitespace-pre-wrap" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-gray-900" style={{ fontWeight: 'bold' }} {...props} />,
                        em: ({node, ...props}) => <em className="italic text-gray-800" style={{ fontStyle: 'italic' }} {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-300 pb-1 mt-6 mb-3" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc ml-8 my-4 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal ml-8 my-4 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="text-gray-800" {...props} />,
                      }}
                    >
                      {formData.content || '_Sin contenido para mostrar_'}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              <div className="mt-3 flex justify-between items-center border-t pt-3">
                <div className="flex gap-4 items-center">
                  <p className="text-xs text-gray-500">Variables detectadas: <span className="font-bold text-gray-700">{variablesDetectadas.length}</span></p>
                  <p className="text-xs text-gray-500">Caracteres: <span className="font-bold text-gray-700">{formData.content.length}</span></p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => navigate('/plantillas')}>Cancelar</Button>
                  <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                    {loading ? 'Guardando...' : 'Crear plantilla'}
                  </Button>
>>>>>>> Stashed changes
                </div>
              </div>

              {/* Estadísticas */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Caracteres: {formData.content.length}</p>
                <p>Palabras: {formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0}</p>
                <p>Variables: {variables.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CrearPlantilla;