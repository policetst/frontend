import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import { extractVariables, validateTemplate } from '../utils/types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Textarea } from './ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

const CrearPlantilla = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: ''
  });
  const [errors, setErrors] = useState({});
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
    updateContent(formData.content + prefix + suffix);
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
      const plantillaData = {
        ...formData,
        variables: variables
      };

      await apiService.createPlantilla(plantillaData);
      alert('Plantilla creada correctamente');
      navigate('/plantillas');
    } catch (error) {
      console.error('Error al crear plantilla:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      alert('Error: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const variablesDetectadas = extractVariables(formData.content);

  return (
    <div className="min-h-screen p-4 bg-slate-50">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Crear nueva plantilla</h1>
          <p className="text-sm text-gray-500">Escribe tu plantilla con palabras clave entre llaves.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/plantillas')}>Volver</Button>
      </div>

      <Card className="h-[calc(100vh-10rem)]">
        <CardHeader>
          <CardTitle>Editor</CardTitle>
        </CardHeader>
        <CardContent className="h-full p-0 overflow-hidden">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
              <div>
                <Label htmlFor="name">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nombre de la plantilla"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descripción (opcional)"
                  rows={2}
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex flex-col flex-1 overflow-hidden">
              <div className="flex flex-wrap gap-2 mb-2 items-center">
                <Label className="text-xs font-semibold">Insertar:</Label>
                <select
                  className="border rounded px-2 py-1 text-sm"
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
                <button type="button" onClick={() => addKeywordToEditor('palabra')} className="text-xs rounded bg-blue-500 text-white px-2 py-1">+ palabra clave</button>
                <div className="h-4 w-[1px] bg-gray-300 mx-1" />
                <button type="button" className="text-xs rounded bg-gray-200 px-2 py-1" onClick={() => addFormat('**', '**')}>B</button>
                <button type="button" className="text-xs rounded bg-gray-200 px-2 py-1" onClick={() => addFormat('_', '_')}>I</button>
                <button type="button" className="text-xs rounded bg-gray-200 px-2 py-1" onClick={() => addFormat('\n- ')}>Lista</button>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <Textarea
                  id="content"
                  name="content"
                  ref={textareaRef}
                  value={formData.content}
                  onChange={(e) => updateContent(e.target.value)}
                  placeholder="Escribe la plantilla..."
                  className={`flex-1 w-full resize-none ${errors.content ? 'border-red-500' : ''}`}
                />
                {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
              </div>

              <div className="mt-3 flex justify-between items-center">
                <p className="text-xs text-gray-500">Variables detectadas: {variablesDetectadas.length}</p>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => navigate('/plantillas')}>Cancelar</Button>
                  <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Crear plantilla'}</Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrearPlantilla;