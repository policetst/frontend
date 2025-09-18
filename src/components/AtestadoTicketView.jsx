import React from 'react';
import './AtestadosDetail.css';

const AtestadoTicketView = ({ atestado, diligencias, onClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const generateTicketId = () => {
    const numero = atestado?.numero || 'XXX';
    return `TK-${numero}-${Date.now().toString().slice(-6)}`;
  };

  // Debug: Verificar datos recibidos
  console.log('AtestadoTicketView - Datos recibidos:', {
    atestado,
    diligencias,
    atestadoNumero: atestado?.numero,
    diligenciasLength: diligencias?.length
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Controles de impresión */}
        <div className="no-print p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Vista de Ticket Policial</h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              🖨️ Imprimir Ticket
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              ✕ Cerrar
            </button>
          </div>
        </div>

        {/* Contenido del ticket */}
        <div className="ticket-print-mode overflow-y-auto max-h-[70vh]">
          {/* Encabezado del ticket */}
          <div className="police-ticket-header">
            <h1>ATESTADO POLICIAL</h1>
            <div className="ticket-number">N° {atestado?.numero || 'Sin número'}</div>
            <div style={{ fontSize: '8px', marginTop: '2mm' }}>
              TICKET ID: {generateTicketId()}
            </div>
          </div>

          {/* Información básica */}
          <div className="ticket-section">
            <h3>INFORMACIÓN GENERAL</h3>
            <div className="ticket-field">
              <span className="ticket-field-label">NÚMERO:</span>
              <span className="ticket-field-value">{atestado?.numero || 'Sin número'}</span>
            </div>
            <div className="ticket-field">
              <span className="ticket-field-label">FECHA:</span>
              <span className="ticket-field-value">{formatDate(atestado?.fecha)}</span>
            </div>
            <div className="ticket-field">
              <span className="ticket-field-label">CREADO:</span>
              <span className="ticket-field-value">{formatDateTime(atestado?.created_at)}</span>
            </div>
            {atestado?.updated_at && (
              <div className="ticket-field">
                <span className="ticket-field-label">ACTUALIZADO:</span>
                <span className="ticket-field-value">{formatDateTime(atestado.updated_at)}</span>
              </div>
            )}
          </div>

          {/* Descripción */}
          {atestado?.descripcion && (
            <div className="ticket-section">
              <h3>DESCRIPCIÓN</h3>
              <div style={{ fontSize: '8px', textAlign: 'justify', wordWrap: 'break-word' }}>
                {atestado.descripcion}
              </div>
            </div>
          )}

          {/* Diligencias */}
          <div className="ticket-section">
            <h3>DILIGENCIAS ({diligencias?.length || 0})</h3>
            {diligencias && diligencias.length > 0 ? (
              diligencias.map((diligencia, index) => (
                <div key={diligencia?.id || index} className="ticket-diligencia">
                  <div className="ticket-diligencia-header">
                    DILIGENCIA {index + 1}
                    {diligencia?.plantilla_nombre && (
                      <div style={{ fontSize: '8px', fontWeight: 'normal' }}>
                        Plantilla: {diligencia.plantilla_nombre}
                      </div>
                    )}
                  </div>
                  
                  <div className="ticket-diligencia-content">
                    {diligencia?.texto_final || 'Sin contenido'}
                  </div>

                  <div style={{ fontSize: '7px', marginTop: '1mm', color: '#666' }}>
                    Creada: {formatDateTime(diligencia?.created_at)}
                  </div>

                  {/* Palabras clave utilizadas */}
                  {diligencia?.valores && diligencia.valores.length > 0 && (
                    <div className="ticket-variables">
                      <h4>PALABRAS CLAVE:</h4>
                      {diligencia.valores.map((valor, idx) => (
                        <div key={idx} className="ticket-variable-item">
                          <span>{valor?.variable || 'Variable'}:</span>
                          <span>{valor?.valor || '(vacío)'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ fontSize: '8px', textAlign: 'center', color: '#666', padding: '2mm' }}>
                No hay diligencias registradas
              </div>
            )}
          </div>

          {/* Código de barras simulado */}
          <div className="ticket-barcode">
            ||||| |||| | |||| ||||| || ||| ||||
            <div style={{ marginTop: '1mm' }}>
              {atestado?.numero || 'XXX'}-{new Date().getFullYear()}
            </div>
          </div>

          {/* Pie del ticket */}
          <div className="ticket-footer">
            <div>DOCUMENTO OFICIAL</div>
            <div style={{ fontSize: '7px', marginTop: '1mm' }}>
              Generado: {formatDateTime(new Date().toISOString())}
            </div>
            <div style={{ fontSize: '6px', marginTop: '1mm', color: '#666' }}>
              Total hojas: {(diligencias?.length || 0) + 1}
            </div>
          </div>
        </div>

        {/* Información adicional para impresión */}
        <div className="no-print p-4 bg-gray-50 border-t text-sm text-gray-600">
          <div className="mb-2">
            <strong>Instrucciones de impresión:</strong>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Configurar impresora para papel térmico 80mm o 58mm</li>
            <li>Ajustar márgenes a mínimo (0mm si es posible)</li>
            <li>Seleccionar "Ajustar a página" en opciones de impresión</li>
            <li>Desactivar encabezados y pies de página del navegador</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AtestadoTicketView;