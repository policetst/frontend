import React from 'react';

const AtestadoPrintView = ({ atestado, diligencias, onClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      {/* Botones de acción - solo visibles en pantalla */}
      <div className="print:hidden fixed top-4 right-4 flex gap-2 z-10">
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir
        </button>
        <button
          onClick={onClose}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Cerrar
        </button>
      </div>

      {/* Contenido del atestado para imprimir */}
      <div className="max-w-4xl mx-auto p-8 print:p-0">
        {/* Encabezado */}
        <div className="text-center mb-8 print:mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ATESTADO</h1>
          <div className="text-lg text-gray-600">
            Número: <span className="font-semibold">{atestado.numero || 'No especificado'}</span>
          </div>
        </div>

        {/* Información del atestado */}
        <div className="mb-8 print:mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b-2 border-gray-300 pb-2">
            INFORMACIÓN GENERAL
          </h2>
          <div className="grid grid-cols-2 gap-4 print:gap-2">
            <div>
              <span className="font-medium text-gray-700">Fecha:</span>
              <span className="ml-2">{formatDate(atestado.fecha)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Estado:</span>
              <span className="ml-2">{atestado.estado || 'Sin estado'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Fecha de creación:</span>
              <span className="ml-2">{formatDateTime(atestado.created_at)}</span>
            </div>
            {atestado.updated_at && (
              <div>
                <span className="font-medium text-gray-700">Última actualización:</span>
                <span className="ml-2">{formatDateTime(atestado.updated_at)}</span>
              </div>
            )}
          </div>
          {atestado.descripcion && (
            <div className="mt-4">
              <span className="font-medium text-gray-700">Descripción:</span>
              <div className="mt-2 p-3 bg-gray-50 print:bg-transparent print:border border-gray-300 rounded">
                <p className="whitespace-pre-wrap">{atestado.descripcion}</p>
              </div>
            </div>
          )}
        </div>

        {/* Diligencias */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b-2 border-gray-300 pb-2">
            DILIGENCIAS ({diligencias.length})
          </h2>
          
          {diligencias.length === 0 ? (
            <p className="text-gray-500 italic">No hay diligencias registradas.</p>
          ) : (
            <div className="space-y-6 print:space-y-4">
              {diligencias.map((diligencia, index) => (
                <div key={diligencia.id} className="border-l-4 border-blue-500 pl-4 print:border-l-2">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      DILIGENCIA {index + 1}
                    </h3>
                    {diligencia.plantilla_nombre && (
                      <p className="text-sm text-gray-600 mt-1">
                        Plantilla utilizada: {diligencia.plantilla_nombre}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Fecha: {formatDateTime(diligencia.created_at)}
                    </p>
                  </div>
                  
                  <div className="prose max-w-none">
                    <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {diligencia.texto_final || diligencia.content || 'Sin contenido'}
                    </div>
                  </div>
                  
                  {diligencia.valores && diligencia.valores.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 print:border-t">
                      <p className="text-sm font-medium text-gray-700 mb-2">Variables utilizadas:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {diligencia.valores.map((valor, idx) => (
                          <div key={idx} className="flex">
                            <span className="font-medium text-gray-600 min-w-0 flex-shrink-0">
                              {valor.variable}:
                            </span>
                            <span className="ml-2 text-gray-800">{valor.valor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pie de página */}
        <div className="mt-12 print:mt-8 pt-6 border-t border-gray-300 text-center text-sm text-gray-600">
          <p>Documento generado el {formatDateTime(new Date().toISOString())}</p>
        </div>
      </div>

      {/* Estilos de impresión */}
      <style jsx>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          .print\\:mb-6 {
            margin-bottom: 1.5rem !important;
          }
          
          .print\\:mb-4 {
            margin-bottom: 1rem !important;
          }
          
          .print\\:gap-2 {
            gap: 0.5rem !important;
          }
          
          .print\\:space-y-4 > * + * {
            margin-top: 1rem !important;
          }
          
          .print\\:bg-transparent {
            background-color: transparent !important;
          }
          
          .print\\:border {
            border: 1px solid #d1d5db !important;
          }
          
          .print\\:border-l-2 {
            border-left-width: 2px !important;
          }
          
          .print\\:border-t {
            border-top: 1px solid #d1d5db !important;
          }
          
          .print\\:mt-8 {
            margin-top: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AtestadoPrintView;