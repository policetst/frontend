// components/RealtimeKeywordDetector.jsx
// Real-time keyword detection component that shows detected keywords while typing
import React, { useState, useEffect, useMemo } from 'react';
import { extractKeywords, getKeywordCategory, getCategoryColors } from '../utils/keywordUtils';
import { Tag, X, Sparkles } from 'lucide-react';

const RealtimeKeywordDetector = ({ 
  text = '', 
  onKeywordsDetected,
  showInline = true,
  autoAdd = false 
}) => {
  const [detectedKeywords, setDetectedKeywords] = useState([]);
  const [addedKeywords, setAddedKeywords] = useState([]);

  // Detect keywords in real-time as user types
  const currentKeywords = useMemo(() => {
    if (!text || text.trim().length < 3) return [];
    
    const keywords = extractKeywords(text);
    return keywords.filter(kw => !addedKeywords.includes(kw));
  }, [text, addedKeywords]);

  useEffect(() => {
    setDetectedKeywords(currentKeywords);
  }, [currentKeywords]);

  // Auto-add keywords if enabled
  useEffect(() => {
    if (autoAdd && currentKeywords.length > 0) {
      const newKeywords = [...addedKeywords, ...currentKeywords];
      setAddedKeywords(newKeywords);
      if (onKeywordsDetected) {
        onKeywordsDetected(newKeywords);
      }
    }
  }, [currentKeywords, autoAdd]);

  const handleAddKeyword = (keyword) => {
    const newKeywords = [...addedKeywords, keyword];
    setAddedKeywords(newKeywords);
    setDetectedKeywords(detectedKeywords.filter(kw => kw !== keyword));
    
    if (onKeywordsDetected) {
      onKeywordsDetected(newKeywords);
    }
  };

  const handleRemoveKeyword = (keyword) => {
    const newKeywords = addedKeywords.filter(kw => kw !== keyword);
    setAddedKeywords(newKeywords);
    
    if (onKeywordsDetected) {
      onKeywordsDetected(newKeywords);
    }
  };

  const handleDismissDetected = (keyword) => {
    setDetectedKeywords(detectedKeywords.filter(kw => kw !== keyword));
  };

  if (!showInline && detectedKeywords.length === 0 && addedKeywords.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Detected keywords (not yet added) */}
      {detectedKeywords.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Palabras clave detectadas ({detectedKeywords.length})
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {detectedKeywords.map((keyword, idx) => {
              const category = getKeywordCategory(keyword);
              const colors = getCategoryColors(category);
              
              return (
                <div
                  key={`${keyword}-${idx}`}
                  className="group flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border-2 border-dashed transition-all hover:scale-105 cursor-pointer"
                  style={{
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                    color: colors.text
                  }}
                  onClick={() => handleAddKeyword(keyword)}
                  title={`Clic para añadir "${keyword}" (${category})`}
                >
                  <Tag className="w-3 h-3" />
                  <span>{keyword}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismissDetected(keyword);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
          
          <p className="text-xs text-blue-700 mt-2">
            💡 Haz clic en una palabra clave para añadirla
          </p>
        </div>
      )}

      {/* Added keywords */}
      {addedKeywords.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">
              Palabras clave añadidas ({addedKeywords.length})
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {addedKeywords.map((keyword, idx) => {
              const category = getKeywordCategory(keyword);
              const colors = getCategoryColors(category);
              
              return (
                <div
                  key={`added-${keyword}-${idx}`}
                  className="group flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                    color: colors.text
                  }}
                >
                  <span>{keyword}</span>
                  <button
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="opacity-60 hover:opacity-100 transition-opacity"
                    title="Eliminar"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeKeywordDetector;
