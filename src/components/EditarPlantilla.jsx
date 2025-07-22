// pages/EditarPlantilla.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import { extractVariables, validateTemplate } from '../utils/types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Textarea } from './ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

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
      alert('Error al cargar la plantilla');
      navigate('/plantillas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    const validation = validateTemplate(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      // Extraer variables del contenido
      const variables = extractVariables(formData.content);
      
      const plantillaData = {
        ...formData,
        variables: variables
      };

      await apiService.updatePlantilla(id, plantillaData);
      alert('Plantilla actualizada correctamente');
      navigate('/plantillas');
    } catch (error) {
      console.error('Error al actualizar plantilla:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      alert('Error: ' + errorMessage);
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
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la plantilla "${plantilla.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await apiService.deletePlantilla(id);
      alert('Plantilla eliminada correctamente');
      navigate('/plantillas');
    } catch (error) {
      console.error('Error al eliminar plantilla:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      alert('Error: ' + errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Cargando plantilla...</div>
      </div>
    );
  }

  if (!plantilla) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">Plantilla no encontrada</div>
      </div>
    );
  }

  // Extraer variables del contenido actual
  const variables = extractVariables(formData.content);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Editar Plantilla: {plantilla.name}</h1>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Eliminar
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/plantillas')}
          >
            Volver
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Plantilla</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Descripción de la plantilla (opcional)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">
                  Contenido <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Contenido de la plantilla. Usa {variable} para crear variables."
                  rows={10}
                  className={errors.content ? 'border-red-500' : ''}
                />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Tip: Usa llaves para crear variables, por ejemplo: {'{nombre}'}, {'{fecha}'}, {'{descripcion}'}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
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
              {/* Información de la plantilla */}
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>ID:</strong> {plantilla.id}</p>
                <p><strong>Creada:</strong> {new Date(plantilla.created_at).toLocaleDateString('es-ES')}</p>
                {plantilla.updated_at && (
                  <p><strong>Actualizada:</strong> {new Date(plantilla.updated_at).toLocaleDateString('es-ES')}</p>
                )}
              </div>

              {/* Variables detectadas */}
              <div>
                <h3 className="font-medium mb-2">Variables detectadas ({variables.length})</h3>
                {variables.length === 0 ? (
                  <p className="text-gray-500 text-sm">No se detectaron variables</p>
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

export default EditarPlantilla;