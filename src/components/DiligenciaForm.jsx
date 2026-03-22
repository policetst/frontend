import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Textarea } from './ui/Textarea'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Save, Eye, FileText, Loader2 } from '../utils/Icons'
import { extractVariables, inferFieldType, replaceVariables } from '../utils/types'
import { TemplateSelector } from './TemplateSelector'
import apiService from '../../services/apiService'

export default function DiligenciaForm() {
  const { id: atestadoId } = useParams()
  const navigate = useNavigate()

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

      setPlantillas(response.plantillas || [])
      console.log('Plantillas cargadas:', response.plantillas) // Debug
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
      // Validaciones adicionales
      if (!selectedTemplateId) {
        alert('Por favor selecciona una plantilla')
        return
      }

      if (!selectedTemplate) {
        alert('Plantilla no encontrada')
        return
      }

      const templateValues = variables.map(variable => ({
        variable,
        value: values[variable] || ''
      }))

      const diligenciaData = {
        templateId: selectedTemplateId,
        values: templateValues,
        previewText: previewText
      }

      console.log('Enviando diligencia:', diligenciaData) // Debug
      console.log('AtestadoId:', atestadoId) // Debug
      console.log('SelectedTemplate:', selectedTemplate) // Debug

      const response = await apiService.createDiligencia(atestadoId, diligenciaData)
      console.log('Respuesta:', response) // Debug

      alert('Diligencia creada correctamente')
      navigate(`/atestados/${atestadoId}`)
    } catch (error) {
      console.error('Error completo:', error) // Debug más detallado
      console.error('Error response:', error.response) // Debug de la respuesta
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido'
      alert('Error al guardar diligencia: ' + errorMessage)
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
<<<<<<< Updated upstream
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
=======
                  <div className="mb-2 flex flex-wrap items-center gap-2 border-b pb-2">
                    <Label className="text-xs font-semibold text-gray-700">Herramientas:</Label>
                    <select
                      className="border rounded px-2 py-1 text-sm bg-white"
                      onChange={(e) => { if (e.target.value) { addKeywordToEditor(e.target.value); e.target.value = '' } }}
                      defaultValue=""
                    >
                      <option value="" disabled>Variables...</option>
                      {variables.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <button type="button" onClick={() => addKeywordToEditor(variables[0] || 'variable')} className="text-xs rounded bg-blue-600 text-white px-2 py-1 hover:bg-blue-700 shadow-sm">+ variable</button>
                    <div className="h-4 w-[1px] bg-gray-300 mx-1" />
                    <button type="button" title="Negrita" className="text-xs rounded border border-gray-300 px-2 py-1 hover:bg-gray-100 font-bold" onClick={() => addFormat('**', '**')}>B</button>
                    <button type="button" title="Cursiva" className="text-xs rounded border border-gray-300 px-2 py-1 hover:bg-gray-100 italic" onClick={() => addFormat('*', '*')}>I</button>
                    <button type="button" title="Título" className="text-xs rounded border border-gray-300 px-2 py-1 hover:bg-gray-100 font-bold" onClick={() => addFormat('### ')}>T</button>
                    <div className="h-4 w-[1px] bg-gray-300 mx-1" />
                    <button type="button" title="Lista" className="text-xs rounded border border-gray-300 px-2 py-1 hover:bg-gray-100" onClick={() => addFormat('\n- ')}>• Lista</button>
                    <button type="button" title="Lista numerada" className="text-xs rounded border border-gray-300 px-2 py-1 hover:bg-gray-100" onClick={() => addFormat('\n1. ')}>1. Lista</button>
                    <div className="h-4 w-[1px] bg-gray-300 mx-1" />
                    <button type="button" title="Añadir Tabla" className="text-xs rounded border border-gray-300 px-2 py-1 hover:bg-gray-100" onClick={() => addFormat('\n| Concepto | Información |\n|---|---|\n| {Etiqueta1} | {Valor1} |\n| {Etiqueta2} | {Valor2} |\n')}>田 Tabla</button>
                    <button type="button" title="Bloque de Firma" className="text-xs rounded border border-gray-300 px-2 py-1 hover:bg-gray-100" onClick={() => addFormat('\n\nEL AGENTE (Número {Num}):\t\t\tEL INTERESADO:\n\n\n\n[Firma]\t\t\t\t\t\t[Firma]\n')}>✎ Firma</button>
                    <div className="h-4 w-[1px] bg-gray-300 mx-1" />
                    <button 
                      type="button" 
                      onClick={() => setShowPreview(!showPreview)} 
                      className={`text-xs rounded px-2.5 py-1 flex items-center gap-1 transition-colors ${showPreview ? 'bg-indigo-600 text-white shadow-inner' : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'}`}
                    >
                      {showPreview ? '📝 Editor' : '👁️ Preview'}
                    </button>
                  </div>

                  <div className="h-[60vh] flex flex-col min-h-0 bg-white border rounded overflow-hidden">
                    {!showPreview ? (
                      <textarea
                        ref={richEditorRef}
                        value={editorText}
                        onChange={(e) => setEditorText(e.target.value)}
                        className="flex-1 w-full p-6 font-mono text-sm leading-snug border-none focus:ring-0 resize-none outline-none"
                        style={{ fontVariantLigatures: 'none' }}
                        placeholder="Escribe la diligencia aquí..."
                      />
                    ) : (
                      <div className="flex-1 overflow-y-auto p-8 prose prose-slate max-w-none prose-sm sm:prose-base font-sans bg-gray-50 shadow-inner">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                          components={{
                            table: ({node, ...props}) => (
                              <div className="overflow-x-auto my-4 border rounded">
                                <table className="min-w-full divide-y divide-gray-300 border-collapse" {...props} />
                              </div>
                            ),
                            th: ({node, ...props}) => <th className="bg-gray-100 px-3 py-2 text-left text-xs font-bold text-gray-700 border" {...props} />,
                            td: ({node, ...props}) => <td className="px-3 py-2 text-sm text-gray-800 border" {...props} />,
                            p: ({node, ...props}) => <p className="leading-relaxed mb-4 whitespace-pre-wrap" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                            em: ({node, ...props}) => <em className="italic text-gray-800" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-lg font-bold text-gray-900 border-b-2 border-gray-300 pb-1 mt-6 mb-3" {...props} />,
                          }}
                        >
                          {editorText || '_Sin contenido para mostrar_'}
                        </ReactMarkdown>
                      </div>
                    )}
>>>>>>> Stashed changes
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
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/atestados/${atestadoId}`)}
          >
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