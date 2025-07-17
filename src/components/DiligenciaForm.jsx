import { useState, useMemo, useEffect } from 'react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Textarea } from './ui/Textarea'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Save, Eye, FileText, Loader2 } from '../utils/Icons'
import { extractVariables, inferFieldType, replaceVariables } from '../utils/types'
import { TemplateSelector } from './TemplateSelector'
import apiService from '..//../services/apiService' // Ajusta la ruta según tu estructura

export function DiligenciaForm({ atestadoId, onSubmit, onCancel }) {
  // Estados para las plantillas
  const [plantillas, setPlantillas] = useState([])
  const [plantillasLoading, setPlantillasLoading] = useState(true)
  const [plantillasError, setPlantillasError] = useState(null)

  // Estados del formulario
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Cargar plantillas al montar el componente
  useEffect(() => {
    loadPlantillas()
  }, [])

  const loadPlantillas = async () => {
    try {
      setPlantillasLoading(true)
      setPlantillasError(null)
      
      console.log('Cargando plantillas...') // Debug
      const response = await apiService.getPlantillas()
      console.log('Respuesta plantillas:', response) // Debug
      
      if (response.ok) {
        setPlantillas(response.plantillas || [])
        console.log('Plantillas cargadas:', response.plantillas) // Debug
      } else {
        throw new Error(response.message || 'Error al cargar plantillas')
      }
    } catch (error) {
      console.error('Error cargando plantillas:', error)
      setPlantillasError(error.message)
    } finally {
      setPlantillasLoading(false)
    }
  }

  const selectedTemplate = plantillas.find(p => p.id === selectedTemplateId)

  const variables = useMemo(() => {
    if (!selectedTemplate) return []
    return extractVariables(selectedTemplate.content)
  }, [selectedTemplate])

  const previewText = useMemo(() => {
    if (!selectedTemplate) return ''
    return replaceVariables(selectedTemplate.content, values)
  }, [selectedTemplate, values])

  const handleTemplateSelect = (template) => {
    setSelectedTemplateId(template.id)
    setValues({})
    setShowPreview(false)
  }

  const updateValue = (variable, value) => {
    setValues(prev => ({ ...prev, [variable]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const templateValues = variables.map(variable => ({
        variable,
        value: values[variable] || ''
      }))

      const diligenciaData = {
        templateId: selectedTemplateId,
        values: templateValues,
        previewText
      }

      if (onSubmit) {
        await onSubmit(diligenciaData)
      } else {
        // Si no hay onSubmit, hacer la petición directamente
        const response = await apiService.createDiligencia(atestadoId, diligenciaData)
        if (response.ok) {
          alert('Diligencia creada correctamente')
          // Redirigir o limpiar formulario
          setSelectedTemplateId('')
          setValues({})
          setShowPreview(false)
        } else {
          throw new Error(response.message || 'Error al crear diligencia')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar diligencia: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const renderField = (variable) => {
    const value = values[variable] || ''
    const fieldType = inferFieldType(variable)

    switch (fieldType) {
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => updateValue(variable, e.target.value)}
            placeholder={`Introduce ${variable.toLowerCase()}`}
          />
        )
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => updateValue(variable, e.target.value)}
            placeholder={`Introduce ${variable.toLowerCase()}`}
          />
        )
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => updateValue(variable, e.target.value)}
            placeholder={`Introduce ${variable.toLowerCase()}`}
            rows={4}
          />
        )
      case 'text':
      default:
        return (
          <Input
            value={value}
            onChange={(e) => updateValue(variable, e.target.value)}
            placeholder={`Introduce ${variable.toLowerCase()}`}
          />
        )
    }
  }

  // Estado de carga de plantillas
  if (plantillasLoading) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Cargando plantillas...</h3>
          <p className="text-gray-600">Por favor espera un momento</p>
        </CardContent>
      </Card>
    )
  }

  // Error al cargar plantillas
  if (plantillasError) {
    return (
      <Card className="text-center py-8 border-red-200">
        <CardContent>
          <div className="text-red-500 mb-4">
            <FileText className="h-12 w-12 mx-auto mb-2" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-red-700">Error al cargar plantillas</h3>
          <p className="text-gray-600 mb-4">{plantillasError}</p>
          <div className="space-x-2">
            <Button onClick={loadPlantillas} variant="outline">
              Reintentar
            </Button>
            <Button onClick={onCancel} variant="outline">
              Volver
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No hay plantillas disponibles
  if (plantillas.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay plantillas disponibles</h3>
          <p className="text-gray-600 mb-4">
            Necesitas crear plantillas de diligencias antes de poder añadir diligencias a un atestado.
          </p>
          <div className="space-x-2">
            <Button onClick={() => window.location.href = '/plantillas/nueva'} variant="default">
              Crear Plantilla
            </Button>
            <Button onClick={onCancel} variant="outline">
              Volver
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Formulario principal
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Nueva Diligencia</h1>
        <p className="text-gray-600">
          Atestado ID: {atestadoId} • {plantillas.length} plantillas disponibles
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <TemplateSelector
          plantillas={plantillas}
          selectedTemplateId={selectedTemplateId}
          onTemplateSelect={handleTemplateSelect}
          placeholder="Buscar plantillas por nombre, descripción o contenido..."
        />

        {selectedTemplate && (
          <>
            {variables.length > 0 && (
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-base">
                      Completar valores de las variables ({variables.length})
                    </span>
                    <Button 
                      type="button" 
                      onClick={() => setShowPreview(!showPreview)} 
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {showPreview ? 'Ocultar' : 'Ver'} Preview
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {variables.map((variable) => (
                      <div key={variable}>
                        <Label className="flex items-center gap-2">
                          {variable}
                          <span className="text-xs text-gray-500">
                            ({inferFieldType(variable)})
                          </span>
                        </Label>
                        {renderField(variable)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {showPreview && (
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="text-base">Preview del texto final</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded text-sm leading-relaxed whitespace-pre-wrap">
                    {previewText || selectedTemplate.content}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Las variables sin completar aparecerán como {'{variable}'}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || !selectedTemplateId}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Guardando...' : 'Guardar diligencia'}
          </Button>
        </div>
      </form>
    </div>
  )
}