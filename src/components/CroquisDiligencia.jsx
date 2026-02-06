// components/CroquisDiligencia.jsx
// Component to insert croquis as a diligencia in the atestado
import React, { useState, useRef } from 'react';
import CroquisPolicial from './CroquisPolicial';
import { Map, Save, X } from 'lucide-react';
import Swal from 'sweetalert2';

const CroquisDiligencia = ({ 
  atestadoId, 
  onSave, 
  onCancel,
  initialCroquisData = null 
}) => {
  const [croquisData, setCroquisData] = useState(initialCroquisData);
  const [saving, setSaving] = useState(false);
  const croquisRef = useRef(null);

  const handleSaveCroquis = (data) => {
    setCroquisData(data);
  };

  const handleInsertAsDiligencia = async () => {
    if (!croquisData || !croquisData.elements || croquisData.elements.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Croquis vacío',
        text: 'Por favor, añade elementos al croquis antes de guardarlo como diligencia'
      });
      return;
    }

    setSaving(true);

    try {
      // Export croquis as image
      const stage = croquisRef.current?.stageRef?.current;
      let imageDataUrl = null;
      
      if (stage) {
        imageDataUrl = stage.toDataURL({
          pixelRatio: 2 // Higher quality
        });
      }

      // Create diligencia text with croquis description
      const elementCount = croquisData.elements.length;
      const elementsByCategory = {};
      
      croquisData.elements.forEach(el => {
        if (!elementsByCategory[el.category]) {
          elementsByCategory[el.category] = [];
        }
        elementsByCategory[el.category].push(el.name);
      });

      let diligenciaText = '=== CROQUIS POLICIAL ===\n\n';
      diligenciaText += `Fecha de elaboración: ${new Date().toLocaleString('es-ES')}\n\n`;
      diligenciaText += `DESCRIPCIÓN DEL CROQUIS:\n\n`;
      diligenciaText += `El presente croquis policial contiene ${elementCount} elemento(s) que representan la escena del incidente:\n\n`;
      
      Object.entries(elementsByCategory).forEach(([category, elements]) => {
        const categoryLabels = {
          personas: 'PERSONAS',
          vehiculos: 'VEHÍCULOS',
          armas: 'ARMAS Y OBJETOS',
          ubicacion: 'UBICACIÓN Y ENTORNO',
          senalizacion: 'SEÑALIZACIÓN',
          evidencias: 'EVIDENCIAS'
        };
        
        diligenciaText += `${categoryLabels[category] || category.toUpperCase()}:\n`;
        elements.forEach(el => {
          diligenciaText += `  - ${el}\n`;
        });
        diligenciaText += '\n';
      });

      diligenciaText += `OBSERVACIONES:\n`;
      diligenciaText += `El croquis adjunto representa de forma gráfica la disposición de los elementos en la escena del incidente. `;
      diligenciaText += `Los elementos han sido posicionados de acuerdo con las declaraciones recogidas y las observaciones realizadas en el lugar de los hechos.\n\n`;
      diligenciaText += `El agente que suscribe certifica que el presente croquis refleja fielmente la situación observada.\n\n`;
      diligenciaText += `[IMAGEN DEL CROQUIS ADJUNTA]`;

      // Prepare diligencia data
      const diligenciaData = {
        templateId: null, // No template, custom diligencia
        values: [],
        previewText: diligenciaText,
        croquis_data: croquisData,
        croquis_image: imageDataUrl,
        tipo: 'croquis' // Special type for croquis diligencias
      };

      if (onSave) {
        await onSave(diligenciaData);
      }

      Swal.fire({
        icon: 'success',
        title: 'Croquis guardado',
        text: 'El croquis se ha añadido como diligencia al atestado',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Error al guardar croquis:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el croquis como diligencia'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Map className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Crear Croquis Policial</h2>
              <p className="text-sm text-blue-100">Añadir croquis como diligencia al atestado</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <CroquisPolicial
            ref={croquisRef}
            initialData={croquisData}
            onSave={handleSaveCroquis}
            readOnly={false}
          />
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {croquisData?.elements?.length > 0 ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {croquisData.elements.length} elemento(s) en el croquis
              </span>
            ) : (
              <span className="text-gray-400">Añade elementos al croquis para continuar</span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              onClick={handleInsertAsDiligencia}
              disabled={saving || !croquisData?.elements?.length}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all ${
                saving || !croquisData?.elements?.length
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
              }`}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar como Diligencia'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CroquisDiligencia;
