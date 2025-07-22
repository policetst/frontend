import { useState, useMemo } from 'react'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog'
import { Search, Filter, X, FileText, Hash, SortAsc, SortDesc } from '../utils/Icons'
import { TemplateCard } from './TemplateCard'
import { TemplatePreview } from './TemplatePreview'

export function TemplateSelector({ 
  plantillas, 
  selectedTemplateId, 
  onTemplateSelect,
  placeholder = "Buscar plantillas..."
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVariableCount, setSelectedVariableCount] = useState(null)
  const [sortBy, setSortBy] = useState('name-asc')
  const [previewTemplate, setPreviewTemplate] = useState(null)

  // Obtener conteos únicos de variables para filtros
  const variableCounts = useMemo(() => {
    const counts = new Set(plantillas.map(p => p.variables.length))
    return Array.from(counts).sort((a, b) => a - b)
  }, [plantillas])

  // Filtrar y ordenar plantillas
  const filteredAndSortedPlantillas = useMemo(() => {
    let filtered = plantillas.filter(plantilla => {
      const matchesSearch = plantilla.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           plantilla.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           plantilla.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           plantilla.variables.some(v => v.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesVariableCount = selectedVariableCount === null || 
                                 plantilla.variables.length === selectedVariableCount
      
      return matchesSearch && matchesVariableCount
    })

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'variables-asc':
          return a.variables.length - b.variables.length
        case 'variables-desc':
          return b.variables.length - a.variables.length
        default:
          return 0
      }
    })

    return filtered
  }, [plantillas, searchQuery, selectedVariableCount, sortBy])

  const selectedTemplate = plantillas.find(p => p.id === selectedTemplateId)

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedVariableCount(null)
    setSortBy('name-asc')
  }

  return (
    <div className="space-y-4">
      {/* Plantilla seleccionada actualmente */}
      {selectedTemplate && (
        <Card className="border-l-4 border-l-green-500 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-green-800">
              Plantilla seleccionada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TemplatePreview template={selectedTemplate} compact />
          </CardContent>
        </Card>
      )}

      {/* Controles de búsqueda y filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Seleccionar plantilla
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtros y ordenación */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Variables:</span>
                {variableCounts.map(count => (
                  <Badge
                    key={count}
                    variant={selectedVariableCount === count ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedVariableCount(
                      selectedVariableCount === count ? null : count
                    )}
                  >
                    <Hash className="h-3 w-3 mr-1" />
                    {count}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortBy(sortBy === 'name-asc' ? 'name-desc' : 'name-asc')}
                >
                  {sortBy.startsWith('name') ? (
                    sortBy === 'name-asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  ) : (
                    <SortAsc className="h-4 w-4" />
                  )}
                  <span className="ml-1">Nombre</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortBy(sortBy === 'variables-asc' ? 'variables-desc' : 'variables-asc')}
                >
                  {sortBy.startsWith('variables') ? (
                    sortBy === 'variables-asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  ) : (
                    <SortAsc className="h-4 w-4" />
                  )}
                  <Hash className="h-3 w-3 ml-1" />
                </Button>
              </div>

              {(searchQuery || selectedVariableCount !== null) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="ml-2"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>

            {/* Resultados */}
            <div className="text-sm text-gray-600">
              {filteredAndSortedPlantillas.length} de {plantillas.length} plantillas
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de plantillas */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredAndSortedPlantillas.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron plantillas que coincidan con los criterios.</p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Mostrar todas las plantillas
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedPlantillas.map((plantilla) => (
            <TemplateCard
              key={plantilla.id}
              template={plantilla}
              isSelected={plantilla.id === selectedTemplateId}
              onSelect={onTemplateSelect}
              onPreview={setPreviewTemplate}
            />
          ))
        )}
      </div>

      {/* Dialog de preview */}
      <Dialog open={previewTemplate !== null} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview de plantilla</DialogTitle>
          </DialogHeader>
          {previewTemplate && <TemplatePreview template={previewTemplate} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}