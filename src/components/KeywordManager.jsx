// components/KeywordManager.jsx
import React, { useState, useEffect } from 'react';
import { 
  getKeywordCategory, 
  getCategoryColors, 
  getKeywordSuggestions,
  removeKeyword as removeKeywordUtil
} from '../utils/keywordUtils';
import { X, Plus, RefreshCw, Tag } from 'lucide-react';

const KeywordManager = ({ 
  keywords = [], 
  onKeywordsChange, 
  onAutoDetect,
  readOnly = false 
}) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  // Update suggestions when input changes
  useEffect(() => {
    if (newKeyword.length >= 2) {
      const sug = getKeywordSuggestions(newKeyword, 8);
      setSuggestions(sug);
      setShowSuggestions(sug.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [newKeyword]);

  const handleAddKeyword = (keyword) => {
    const trimmed = keyword.trim().toLowerCase();
    if (trimmed && !keywords.includes(trimmed)) {
      onKeywordsChange([...keywords, trimmed].sort());
    }
    setNewKeyword('');
    setShowSuggestions(false);
  };

  const handleRemoveKeyword = (keyword) => {
    const updated = removeKeywordUtil(keywords, keyword);
    onKeywordsChange(updated);
  };

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    try {
      await onAutoDetect();
    } finally {
      setIsDetecting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0 && showSuggestions) {
        handleAddKeyword(suggestions[0]);
      } else {
        handleAddKeyword(newKeyword);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Group keywords by category
  const groupedKeywords = keywords.reduce((acc, keyword) => {
    const category = getKeywordCategory(keyword);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(keyword);
    return acc;
  }, {});

  const categoryLabels = {
    delitos: 'Delitos',
    objetos: 'Objetos',
    acciones: 'Acciones',
    lugares: 'Lugares',
    personas: 'Personas',
    tiposAccidente: 'Tipos de Accidente',
    evidencias: 'Evidencias',
    custom: 'Personalizadas'
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Palabras Clave</h3>
          <span className="text-sm text-gray-500">({keywords.length})</span>
        </div>
        
        {!readOnly && onAutoDetect && (
          <button
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
            {isDetecting ? 'Detectando...' : 'Auto-detectar'}
          </button>
        )}
      </div>

      {/* Add keyword input */}
      {!readOnly && (
        <div className="relative">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Añadir palabra clave..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto">
                  {suggestions.map((suggestion, idx) => {
                    const category = getKeywordCategory(suggestion);
                    const colors = getCategoryColors(category);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAddKeyword(suggestion)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                      >
                        <span>{suggestion}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                          {categoryLabels[category]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            <button
              onClick={() => handleAddKeyword(newKeyword)}
              disabled={!newKeyword.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Añadir
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Escribe y presiona Enter, o selecciona de las sugerencias
          </p>
        </div>
      )}

      {/* Keywords display */}
      {keywords.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Tag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No hay palabras clave</p>
          {!readOnly && (
            <p className="text-sm mt-1">
              Usa el botón "Auto-detectar" o añade manualmente
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(groupedKeywords).map(([category, categoryKeywords]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">
                {categoryLabels[category] || category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {categoryKeywords.map((keyword, idx) => {
                  const colors = getCategoryColors(category);
                  return (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border ${colors.bg} ${colors.text} ${colors.border}`}
                    >
                      {keyword}
                      {!readOnly && (
                        <button
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                          title="Eliminar palabra clave"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
        <p className="font-medium mb-1">💡 Sobre las palabras clave</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Las palabras clave se detectan automáticamente de la descripción y diligencias</li>
          <li>Puedes añadir palabras clave personalizadas manualmente</li>
          <li>Usa las palabras clave para buscar y filtrar atestados</li>
          <li>Los colores indican la categoría de cada palabra clave</li>
        </ul>
      </div>
    </div>
  );
};

export default KeywordManager;
