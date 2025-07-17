// Función para extraer variables de un texto
export function extractVariables(text) {
    const regex = /\{([^}]+)\}/g;
    const variables = [];
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    
    return variables;
  }
  
  // Función para reemplazar variables en un texto
  export function replaceVariables(text, values) {
    let result = text;
    
    Object.entries(values).forEach(([variable, value]) => {
      const regex = new RegExp(`\\{${variable}\\}`, 'g');
      result = result.replace(regex, value || `{${variable}}`);
    });
    
    return result;
  }
  
  // Función para inferir el tipo de campo basado en el nombre de la variable
  export function inferFieldType(variableName) {
    const name = variableName.toLowerCase();
    
    if (name.includes('fecha') || name.includes('date')) {
      return 'date';
    }
    
    if (name.includes('numero') || name.includes('number') || name.includes('cantidad') || name.includes('edad')) {
      return 'number';
    }
    
    if (name.includes('descripcion') || name.includes('observacion') || name.includes('detalle') || name.includes('comentario')) {
      return 'textarea';
    }
    
    return 'text';
  }
  
  // Función para crear preview de variables en texto
  export function createVariablePreview(text) {
    const parts = [];
    const regex = /\{([^}]+)\}/g;
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      // Agregar texto antes de la variable
      if (match.index > lastIndex) {
        parts.push({
          text: text.substring(lastIndex, match.index),
          isVariable: false
        });
      }
      
      // Agregar la variable
      parts.push({
        text: match[1],
        isVariable: true
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Agregar texto restante
    if (lastIndex < text.length) {
      parts.push({
        text: text.substring(lastIndex),
        isVariable: false
      });
    }
    
    return parts;
  }
  
  // Función para validar plantilla
  export function validateTemplate(template) {
    const errors = [];
    
    if (!template.name || template.name.trim() === '') {
      errors.push('El nombre de la plantilla es requerido');
    }
    
    if (!template.content || template.content.trim() === '') {
      errors.push('El contenido de la plantilla es requerido');
    }
    
    // Validar que las llaves estén balanceadas
    const openBraces = (template.content.match(/\{/g) || []).length;
    const closeBraces = (template.content.match(/\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      errors.push('Las llaves { } no están balanceadas en el contenido');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Función para formatear texto con variables
  export function formatTemplateText(text, highlightVariables = true) {
    if (!highlightVariables) return text;
    
    return text.replace(/\{([^}]+)\}/g, '<mark>$1</mark>');
  }
  
  // Función para obtener estadísticas de plantilla
  export function getTemplateStats(template) {
    const variables = extractVariables(template.content);
    const words = template.content.split(/\s+/).length;
    const characters = template.content.length;
    
    return {
      variables: variables.length,
      words,
      characters,
      variableList: variables
    };
  }