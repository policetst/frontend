import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { FileText, Hash, Eye, Check } from '../utils/Icons'
import { createVariablePreview } from '../utils/types'

export function TemplateCard({ 
  template, 
  isSelected = false, 
  onSelect, 
  onPreview,
  showPreview = false 
}) {
  const variableParts = createVariablePreview(template.content)
  
  return (
    <Card className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
      isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:border-gray-300'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">{template.name}</CardTitle>
              {template.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{template.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Badge variant="secondary" className="text-xs whitespace-nowrap">
              <Hash className="h-3 w-3 mr-1" />
              {template.variables.length}
            </Badge>
            {isSelected && (
              <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border-l-3 border-l-blue-200 max-h-16 overflow-y-auto">
            {variableParts.slice(0, 3).map((part, index) => (
              <span key={index} className={part.isVariable ? 'bg-yellow-200 px-1 rounded font-semibold' : ''}>
                {part.isVariable ? `{${part.text}}` : part.text}
              </span>
            ))}
            {variableParts.length > 3 && (
              <span className="text-gray-400">...</span>
            )}
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-gray-500">
              {template.content.length} caracteres
            </div>
            <div className="flex gap-2">
              {onPreview && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onPreview(template)
                  }}
                  className="text-xs h-7"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
              )}
              {onSelect && (
                <Button
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(template)
                  }}
                  className="text-xs h-7"
                >
                  {isSelected ? 'Seleccionado' : 'Seleccionar'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
