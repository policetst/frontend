import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { FileText, Hash, Type } from '../utils/Icons'
import { createVariablePreview } from '../utils/types'

export function TemplatePreview({ template, compact = false }) {
  const variableParts = createVariablePreview(template.content)
  
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-500" />
          <span className="font-medium text-sm">{template.name}</span>
          <Badge variant="secondary" className="text-xs">
            <Hash className="h-3 w-3 mr-1" />
            {template.variables.length}
          </Badge>
        </div>
        {template.description && (
          <p className="text-xs text-gray-600 line-clamp-2">{template.description}</p>
        )}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border-l-3 border-l-blue-200 max-h-20 overflow-y-auto">
          {variableParts.map((part, index) => (
            <span key={index} className={part.isVariable ? 'bg-yellow-200 px-1 rounded font-semibold' : ''}>
              {part.isVariable ? `{${part.text}}` : part.text}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {template.name}
        </CardTitle>
        {template.description && (
          <p className="text-sm text-gray-600">{template.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {template.variables.length} variables
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Type className="h-3 w-3" />
              {template.content.length} caracteres
            </Badge>
          </div>
          
          <div className="bg-gray-50 p-3 rounded text-sm leading-relaxed">
            {variableParts.map((part, index) => (
              <span key={index} className={part.isVariable ? 'bg-yellow-200 px-1 rounded font-semibold' : ''}>
                {part.isVariable ? `{${part.text}}` : part.text}
              </span>
            ))}
          </div>
          
          {template.variables.length > 0 && (
            <div className="border-t pt-3">
              <h4 className="text-sm font-medium mb-2">Variables detectadas:</h4>
              <div className="flex flex-wrap gap-2">
                {template.variables.map((variable) => (
                  <Badge key={variable} variant="secondary" className="text-xs">
                    {variable}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}