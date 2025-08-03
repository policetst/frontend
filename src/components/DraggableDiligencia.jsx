import React from 'react';

const DraggableDiligencia = ({ 
  diligencia, 
  index, 
  onDragStart, 
  onDragOver, 
  onDrop, 
  formatDateTime,
  isDragging,
  dragOverIndex,
  onEdit,
  onDelete
}) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', index.toString());
    onDragStart(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    onDragOver(index);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
    onDrop(draggedIndex, index);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        border-l-4 border-blue-500 pl-4 py-2 cursor-move transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${dragOverIndex === index ? 'bg-blue-50 border-blue-300' : ''}
        hover:bg-gray-50
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center text-gray-400">
            <div className="w-1 h-1 bg-gray-400 rounded-full mb-1"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full mb-1"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
          <h3 className="font-medium text-gray-900">
            Diligencia #{index + 1}
            {diligencia.plantilla_nombre && (
              <span className="text-sm text-gray-500 ml-2">
                (Plantilla: {diligencia.plantilla_nombre})
              </span>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {formatDateTime(diligencia.created_at)}
          </span>
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(diligencia);
              }}
              className="text-blue-600 hover:text-blue-800 p-1 rounded"
              title="Editar diligencia"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(diligencia.id);
              }}
              className="text-red-600 hover:text-red-800 p-1 rounded"
              title="Eliminar diligencia"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="prose max-w-none">
        <p className="whitespace-pre-wrap text-gray-700">
          {diligencia.texto_final || diligencia.content || 'Sin contenido'}
        </p>
      </div>
      {diligencia.valores && Array.isArray(diligencia.valores) && diligencia.valores.length > 0 && diligencia.valores.some(valor => valor && valor.variable) && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Variables utilizadas:</p>
          <div className="flex flex-wrap gap-1">
            {diligencia.valores.filter(valor => valor && valor.variable).map((valor, idx) => (
              <span key={idx} className="inline-block bg-gray-100 text-xs px-2 py-1 rounded">
                {valor.variable}: {valor.valor}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DraggableDiligencia;