import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
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
  const [atestado, setAtestado] = useState(null)
  const [atestadoKeywordValues, setAtestadoKeywordValues] = useState({})
  const [agentVerified, setAgentVerified] = useState(false)
  const [atestadoDiligencias, setAtestadoDiligencias] = useState([])
  const onCancel = () => navigate(`/atestados/${atestadoId}`)

  // Estados para las plantillas
  const [plantillas, setPlantillas] = useState([])
  const [plantillasLoading, setPlantillasLoading] = useState(true)
  const [plantillasError, setPlantillasError] = useState(null)

  // Estados del formulario
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(false)
  const [useRichEditor, setUseRichEditor] = useState(true)
  const [editorText, setEditorText] = useState('')
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [showAssignedKeywordsModal, setShowAssignedKeywordsModal] = useState(false)
  const [matchCandidates, setMatchCandidates] = useState([])
  const [selectedMatchVariables, setSelectedMatchVariables] = useState({})
  const [pendingSubmitData, setPendingSubmitData] = useState(null)
  const variableInputRefs = useRef({})
  const richEditorRef = useRef(null)

  const addKeywordAtCursor = (variable, defaultKeyword = 'palabra') => {
    const input = variableInputRefs.current[variable]
    if (!input) return

    const start = input.selectionStart ?? 0
    const end = input.selectionEnd ?? 0
    const original = values[variable] || ''

    if (start !== end) {
      // Si hay selección, envuelve la selección
      const selected = original.slice(start, end) || defaultKeyword
      const wrapped = `{${selected}}`
      const next = `${original.slice(0, start)}${wrapped}${original.slice(end)}`
      setValues(prev => ({ ...prev, [variable]: next }))
      setTimeout(() => {
        input.focus()
        input.setSelectionRange(start + wrapped.length, start + wrapped.length)
      }, 0)
      return
    }

    // Sin selección: envuelve la palabra alrededor del cursor
    const before = original.slice(0, start)
    const after = original.slice(start)
    const wordBeforeMatch = before.match(/(\w+)$/)
    const wordAfterMatch = after.match(/^(\w+)/)

    let wordStart = start
    let wordEnd = start
    if (wordBeforeMatch) {
      wordStart = start - wordBeforeMatch[1].length
      wordEnd = start
    }
    if (wordAfterMatch) {
      wordEnd = start + wordAfterMatch[1].length
    }

    if (wordStart === wordEnd) {
      // No hay palabra, inserta default
      const wrapped = `{${defaultKeyword}}`
      const next = `${original.slice(0, start)}${wrapped}${original.slice(end)}`
      setValues(prev => ({ ...prev, [variable]: next }))
      setTimeout(() => {
        input.focus()
        input.setSelectionRange(start + wrapped.length, start + wrapped.length)
      }, 0)
      return
    }

    const word = original.slice(wordStart, wordEnd)
    const wrapped = `{${word}}`
    const next = `${original.slice(0, wordStart)}${wrapped}${original.slice(wordEnd)}`
    setValues(prev => ({ ...prev, [variable]: next }))

    setTimeout(() => {
      input.focus()
      input.setSelectionRange(wordStart + wrapped.length, wordStart + wrapped.length)
    }, 0)
  }

  const addKeywordToEditor = (defaultKeyword = 'palabra') => {
    const input = richEditorRef.current;
    if (!input) {
      const keyword = `{${defaultKeyword}}`
      setEditorText((prev) => prev + keyword)
      return;
    }

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const content = editorText;

    if (start !== end) {
      const selected = content.slice(start, end);
      const wrapped = `{${selected}}`;
      const next = content.slice(0, start) + wrapped + content.slice(end);
      setEditorText(next);
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
      setEditorText(next);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + wrapped.length, start + wrapped.length);
      }, 0);
    } else {
      const word = content.slice(wordStart, wordEnd);
      const wrapped = `{${word}}`;
      const next = content.slice(0, wordStart) + wrapped + content.slice(wordEnd);
      setEditorText(next);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(wordStart + wrapped.length, wordStart + wrapped.length);
      }, 0);
    }
  }

  const updateEditorWithTemplate = (content) => {
    setEditorText(content || '')
  }

  // Cargar datos de plantillas y atestado
  useEffect(() => {
    loadPlantillas()
    loadAtestado()
  }, [])

  const loadAtestado = async () => {
    try {
      const response = await apiService.getAtestado(atestadoId)
      setAtestado(response.atestado || response)
      setAtestadoDiligencias(response.diligencias || [])
      const keywordMap = {};
      (response.diligencias || []).forEach(d => {
        (d.valores || []).forEach(v => {
          if (v.variable && v.valor) {
            keywordMap[v.variable] = keywordMap[v.variable] || v.valor
          }
        })
      })
      setAtestadoKeywordValues(keywordMap)
    } catch (error) {
      console.error('Error cargando atestado:', error)
    }
  }

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

  const sharedVariables = useMemo(() => {
    if (!selectedTemplate) return []
    return variables.filter(variable => variable in atestadoKeywordValues)
  }, [variables, atestadoKeywordValues])

  const assignedKeywordDetails = useMemo(() => {
    const map = {}
    atestadoDiligencias.forEach((d) => {
      (d.valores || []).forEach((v) => {
        if (!v.variable) return
        if (!map[v.variable]) map[v.variable] = []
        map[v.variable].push({
          diligenciaId: d.id,
          diligenciaNombre: d.plantilla_nombre || `Diligencia ${d.id}`,
          valor: v.valor
        })
      })
    })
    return map
  }, [atestadoDiligencias])

  const previewText = useMemo(() => {
    if (!selectedTemplate) return ''
    return replaceVariables(selectedTemplate.content, values)
  }, [selectedTemplate, values])

  const handleVerifyAndAutocomplete = async () => {
    if (!sharedVariables.length) {
      Swal.fire('Información', 'No hay palabras clave que coincidan con el atestado.', 'info')
      return
    }

    const result = await Swal.fire({
      title: 'Verificación del agente',
      text: '¿Confirmas que el agente verificó los datos y desea autocompletar las variables coincidentes?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, autocompletar',
      cancelButtonText: 'No'
    })

    if (!result.isConfirmed) return

    setValues((prev) => {
      const next = { ...prev }
      sharedVariables.forEach((variable) => {
        next[variable] = atestadoKeywordValues[variable] || next[variable] || ''
      })
      return next
    })
    setAgentVerified(true)
    Swal.fire('Listo', 'Se autocompletaron las variables coincidentes con el atestado.', 'success')
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplateId(template.id)
    setValues({})
    updateEditorWithTemplate(template.content || '')
  }

  const updateValue = (variable, value) => {
    setValues(prev => ({ ...prev, [variable]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!selectedTemplateId) {
        Swal.fire('Atención', 'Por favor selecciona una plantilla.', 'warning')
        setLoading(false)
        return
      }

      if (!selectedTemplate) {
        Swal.fire('Atención', 'Plantilla no encontrada.', 'warning')
        setLoading(false)
        return
      }

      const templateValues = variables.map(variable => ({
        variable,
        value: values[variable] || ''
      }))

      const matches = variables
        .filter(variable => atestadoKeywordValues[variable])
        .map(variable => ({
          variable,
          current: values[variable] || '',
          replicate: atestadoKeywordValues[variable]
        }))

      if (matches.length > 0) {
        const initialSelection = {}
        matches.forEach(m => { initialSelection[m.variable] = true })

        setMatchCandidates(matches)
        setSelectedMatchVariables(initialSelection)
        setPendingSubmitData({ templateValues, previewText, variables })
        setShowMatchModal(true)
        setLoading(false)
        return
      }

      const finalText = useRichEditor ? editorText : previewText
      const diligenciaData = {
        templateId: selectedTemplateId,
        values: templateValues,
        previewText: finalText,
        texto_final: finalText
      }

      await apiService.createDiligencia(atestadoId, diligenciaData)
      Swal.fire('Éxito', 'Diligencia creada correctamente.', 'success')
      navigate(`/atestados/${atestadoId}`)
    } catch (error) {
      console.error('Error completo:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido'
      Swal.fire('Error', 'Error al guardar diligencia: ' + errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmMatchedValues = async () => {
    if (!pendingSubmitData) return

    setLoading(true)
    try {
      const confirmed = { ...values }
      Object.entries(selectedMatchVariables).forEach(([variable, selected]) => {
        if (selected && atestadoKeywordValues[variable]) {
          confirmed[variable] = atestadoKeywordValues[variable]
        }
      })

      const finalValues = pendingSubmitData.variables.map(variable => ({
        variable,
        value: confirmed[variable] || ''
      }))

      const finalText = useRichEditor
        ? editorText
        : replaceVariables(selectedTemplate.content, confirmed)
      const data = {
        templateId: selectedTemplateId,
        values: finalValues,
        previewText: finalText,
        texto_final: finalText
      }

      await apiService.createDiligencia(atestadoId, data)
      setShowMatchModal(false)
      setPendingSubmitData(null)
      setMatchCandidates([])
      Swal.fire('Éxito', 'Diligencia creada con valores confirmados.', 'success')
      navigate(`/atestados/${atestadoId}`)
    } catch (error) {
      console.error('Error al confirmar variables:', error)
      Swal.fire('Error', 'Error al crear diligencia con confirmación.', 'error')
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
          <div className="space-y-1">
            <Textarea
              value={value}
              onChange={(e) => updateValue(variable, e.target.value)}
              placeholder={`Introduce ${variable.toLowerCase()}`}
              rows={4}
              ref={(ref) => { variableInputRefs.current[variable] = ref }}
            />
            <button
              type="button"
              onClick={() => addKeywordAtCursor(variable)}
              className="text-xs bg-blue-500 text-white rounded px-2 py-1 hover:bg-blue-600"
            >Añadir palabra clave</button>
          </div>
        )
      case 'text':
      default:
        return (
          <div className="space-y-1">
            <Input
              value={value}
              onChange={(e) => updateValue(variable, e.target.value)}
              placeholder={`Introduce ${variable.toLowerCase()}`}
              ref={(ref) => { variableInputRefs.current[variable] = ref }}
            />
            <button
              type="button"
              onClick={() => addKeywordAtCursor(variable)}
              className="text-xs bg-blue-500 text-white rounded px-2 py-1 hover:bg-blue-600"
            >Añadir palabra clave</button>
          </div>
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
    <div className="min-h-screen max-w-6xl mx-auto p-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Nueva Diligencia</h1>
        <p className="text-gray-600 mb-2">
          Atestado ID: {atestadoId} • {plantillas.length} plantillas disponibles
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setUseRichEditor(prev => !prev)}
            className="px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
          >
            {useRichEditor ? 'Usar modo variables' : 'Usar editor de texto enriquecido'}
          </button>
          <span className="text-xs text-gray-500">{useRichEditor ? 'Editor full screen activo. No se mostrará la vista previa.' : 'Completa variables y genera texto final.'}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <TemplateSelector
          plantillas={plantillas}
          selectedTemplateId={selectedTemplateId}
          onTemplateSelect={handleTemplateSelect}
          placeholder="Buscar plantillas por nombre, descripción o contenido..."
        />

        {selectedTemplate && sharedVariables.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-yellow-800">Variables encontradas en atestado</p>
                <p className="text-xs text-yellow-700">Se encontraron variables con el mismo nombre en el atestado actual.</p>
                <div className="mt-1 text-xs text-gray-700">
                  {sharedVariables.map(variable => `${variable} → ${atestadoKeywordValues[variable] || 'vacío'}`).join(', ')}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={handleVerifyAndAutocomplete}
                  variant="outline"
                  size="sm"
                >
                  {agentVerified ? 'Verificado ✅' : 'Verificar y autocompletar'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowAssignedKeywordsModal(true)}
                  variant="outline"
                  size="sm"
                >
                  Palabras clave asignadas
                </Button>
              </div>
            </div>
            {Object.keys(assignedKeywordDetails).length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-700">Valores por diligencia:</p>
                <ul className="mt-1 text-xs text-gray-600 space-y-1">
                  {Object.entries(assignedKeywordDetails).map(([variable, entries]) => (
                    <li key={variable}>
                      <span className="font-semibold">{variable}:</span> {entries.map(e => `${e.diligenciaNombre}(${e.valor})`).join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {selectedTemplate && (
          <>
            {useRichEditor ? (
              <Card className="border-l-4 border-l-indigo-500">
                <CardHeader>
                  <CardTitle className="text-base">Editor de texto enriquecido (pantalla completa)</CardTitle>
                </CardHeader>
                <CardContent>
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Label className="text-xs">Insertar palabra clave:</Label>
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      onChange={(e) => { if (e.target.value) { addKeywordToEditor(e.target.value); e.target.value = '' } }}
                      defaultValue=""
                    >
                      <option value="" disabled>Selecciona variable...</option>
                      {variables.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <button
                      type="button"
                      onClick={() => addKeywordToEditor(variables[0] || 'variable')}
                      className="text-xs bg-blue-500 text-white rounded px-2 py-1 hover:bg-blue-600"
                    >
                      Añadir palabra clave
                    </button>
                  </div>
                  <div className="h-[60vh] bg-white border rounded overflow-hidden p-2">
                    <div className="mb-2 flex gap-2">
                      <button type="button" onClick={() => setEditorText(prev => prev + ' **bold** ')} className="text-xs rounded bg-gray-200 px-2 py-1">B</button>
                      <button type="button" onClick={() => setEditorText(prev => prev + ' _italic_ ')} className="text-xs rounded bg-gray-200 px-2 py-1">I</button>
                      <button type="button" onClick={() => setEditorText(prev => prev + '\n- ')} className="text-xs rounded bg-gray-200 px-2 py-1">List</button>
                    </div>
                    <textarea
                      ref={richEditorRef}
                      value={editorText}
                      onChange={(e) => setEditorText(e.target.value)}
                      className="w-full h-[50vh] border border-gray-300 rounded p-2 resize-none"
                      placeholder="Escribe tu diligencia (markdown simple)"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {variables.length > 0 && (
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-base">
                          Completar valores de las variables ({variables.length})
                        </span>
                        <span className="text-xs text-gray-600">Modo editor completo activo</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {variables.map((variable) => (
                          <div key={variable}>
                            <Label className="flex items-center gap-2">
                              {variable}
                              <span className="text-xs text-gray-500">({inferFieldType(variable)})</span>
                            </Label>
                            {renderField(variable)}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

        
              </>
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

      {showMatchModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xl w-full shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Confirmar replicar palabras clave</h3>
                <p className="text-xs text-gray-500">Marca las variables que quieres replicar desde el atestado.</p>
              </div>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowMatchModal(false)}>✕</button>
            </div>
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
              {matchCandidates.map(candidate => (
                <label key={candidate.variable} className="flex items-start gap-2 p-2 border rounded">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={selectedMatchVariables[candidate.variable] || false}
                    onChange={(e) => setSelectedMatchVariables(prev => ({
                      ...prev,
                      [candidate.variable]: e.target.checked
                    }))}
                  />
                  <div>
                    <div className="text-sm font-semibold">{candidate.variable}</div>
                    <div className="text-xs text-gray-500">Diligencia actual: {candidate.current || '(vacío)'}</div>
                    <div className="text-xs text-green-700 font-semibold">Replicar: {candidate.replicate}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                className="px-3 py-2 border rounded text-sm text-gray-700 hover:bg-gray-100"
                type="button"
                onClick={() => setShowMatchModal(false)}
              >
                Cancelar
              </button>
              <button
                className="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                type="button"
                onClick={handleConfirmMatchedValues}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Confirmar y guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssignedKeywordsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Palabras clave ya asignadas</h3>
                <p className="text-xs text-gray-500">Muestra los valores y a qué diligencia pertenecen.</p>
              </div>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowAssignedKeywordsModal(false)}>✕</button>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              {Object.keys(assignedKeywordDetails).length === 0 ? (
                <p className="text-sm text-gray-500">No se encontraron palabras clave asignadas aún.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(assignedKeywordDetails).map(([variable, entries]) => (
                    <div key={variable} className="border rounded p-3 bg-gray-50">
                      <div className="font-semibold text-sm mb-1">{variable}</div>
                      <div className="text-xs text-gray-600">
                        {entries.map((entry, idx) => (
                          <div key={`${variable}-${idx}`} className="mb-1">
                            <span className="font-medium text-gray-700">{entry.diligenciaNombre}:</span> {entry.valor || '(vacío)'}
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
                className="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                onClick={() => setShowAssignedKeywordsModal(false)}
              >Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}