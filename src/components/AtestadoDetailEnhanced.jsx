// components/AtestadoDetailEnhanced.jsx
// Enhanced version with Croquis and Keywords tabs
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiService from '../../services/apiService';
import CroquisPolicial from './CroquisPolicial';
import KeywordManager from './KeywordManager';
import { detectKeywordsFromAtestado } from '../utils/keywordUtils';
import { FileText, Map, Tag, Printer } from 'lucide-react';
import Swal from 'sweetalert2';

const AtestadoDetailEnhanced = () => {
  const { id } = useParams();
  const [atestado, setAtestado] = useState(null);
  const [diligencias, setDiligencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info'); // info, croquis, keywords
  const [keywords, setKeywords] = useState([]);
  const [croquisData, setCroquisData] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const response = await apiService.getAtestado(id);
      const atestadoData = response.atestado || response;
      const diligenciasData = response.diligencias || [];
      
      setAtestado(atestadoData);
      setDiligencias(diligenciasData);
      setKeywords(atestadoData.palabras_clave || []);
      setCroquisData(atestadoData.croquis_data || null);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar el atestado'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoDetectKeywords = async () => {
    const detected = detectKeywordsFromAtestado(atestado, diligencias);
    const merged = Array.from(new Set([...keywords, ...detected])).sort();
    setKeywords(merged);
    
    // Save to backend
    try {
      await apiService.updateAtestado(id, { palabras_clave: merged });
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: `Se detectaron ${detected.length} palabras clave`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al guardar palabras clave:', error);
    }
  };

  const handleKeywordsChange = async (newKeywords) => {
    setKeywords(newKeywords);
    
    // Save to backend
    try {
      await apiService.updateAtestado(id, { palabras_clave: newKeywords });
    } catch (error) {
      console.error('Error al guardar palabras clave:', error);
    }
  };

  const handleSaveCroquis = async (data) => {
    setCroquisData(data);
    
    // Save to backend
    try {
      await apiService.updateAtestado(id, { croquis_data: data });
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Croquis guardado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al guardar croquis:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar el croquis'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando atestado...</p>
        </div>
      </div>
    );
  }

  if (!atestado) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Atestado no encontrado</p>
        <Link to="/atestados" className="text-blue-500 hover:underline mt-2 inline-block">
          Volver a la lista
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'info', label: 'Información', icon: FileText },
    { id: 'croquis', label: 'Croquis Policial', icon: Map },
    { id: 'keywords', label: 'Palabras Clave', icon: Tag }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Atestado #{atestado.numero}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {atestado.tipo && `${atestado.tipo} • `}
                {new Date(atestado.fecha).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
              <Link
                to={`/atestados/${id}/editar`}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Editar
              </Link>
              <Link
                to="/atestados"
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Volver
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 border-b">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 font-medium'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'info' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Información del Atestado</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <div className="text-lg font-semibold text-gray-900">{atestado.numero}</div>
              </div>
              
              {atestado.tipo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <div className="text-lg text-gray-900">{atestado.tipo}</div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <div className="text-lg text-gray-900">
                  {new Date(atestado.fecha).toLocaleDateString('es-ES')}
                </div>
              </div>
              
              {atestado.ubicacion && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                  <div className="text-lg text-gray-900">{atestado.ubicacion}</div>
                </div>
              )}
            </div>

            {atestado.descripcion && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <p className="text-gray-800 whitespace-pre-wrap">{atestado.descripcion}</p>
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Diligencias ({diligencias.length})
                </label>
                <Link
                  to={`/atestados/${id}/detail`}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Gestionar Diligencias
                </Link>
              </div>
              {diligencias.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <p className="text-yellow-800 text-sm">
                    No hay diligencias asociadas. 
                    <Link to={`/atestados/${id}/detail`} className="font-medium underline ml-1">
                      Haz clic aquí para añadir diligencias
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {diligencias.map((diligencia, idx) => (
                    <div key={diligencia.id} className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="font-medium text-gray-900">
                        Diligencia {idx + 1}: {diligencia.plantilla_nombre}
                      </div>
                      <div className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {diligencia.texto_final}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'croquis' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <CroquisPolicial
              initialData={croquisData}
              onSave={handleSaveCroquis}
              readOnly={false}
            />
          </div>
        )}

        {activeTab === 'keywords' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <KeywordManager
              keywords={keywords}
              onKeywordsChange={handleKeywordsChange}
              onAutoDetect={handleAutoDetectKeywords}
              readOnly={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AtestadoDetailEnhanced;
