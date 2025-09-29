// pages/AtestadosList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/apiService';

const AtestadosList = () => {
  const [atestados, setAtestados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

  useEffect(() => {
    loadAtestados();
  }, []);

  const loadAtestados = async () => {
    try {
      const response = await apiService.getAtestados();
      setAtestados(response.atestados || response || []);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar los atestados');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  // Filtrar atestados por texto y fecha
  const atestadosFiltrados = atestados.filter(atestado => {
    const matchBusqueda = !busqueda || 
      atestado.numero?.toLowerCase().includes(busqueda.toLowerCase()) ||
      atestado.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    
    const matchFecha = !filtroFecha || 
      (atestado.fecha && atestado.fecha.includes(filtroFecha));
    
    return matchBusqueda && matchFecha;
  });

  if (loading) return (
    <div className="p-6">
      <div className="text-center">Cargando atestados...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Botones de acción principales */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Atestados</h1>
          <div className="flex gap-3">
            <Link 
              to="/plantillas" 
              className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition-colors"
            >
              Diligencias
            </Link>
            <Link 
              to="/atestados/nuevo" 
              className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
            >
            Crear Atestado
            </Link>
          </div>
        </div>

        {/* Filtros de búsqueda */}
        <div className="bg-white rounded shadow-sm border mb-6 p-6">
          <h2 className="text-lg font-semibold mb-4">Filtros de búsqueda</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por número o descripción..."
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fecha</label>
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Lista de atestados */}
        <div className="bg-white rounded shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Lista de Atestados</h2>
          </div>
          
          {atestadosFiltrados.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold mb-2">No hay atestados</h3>
              <p className="text-gray-400 mb-4">
                {busqueda || filtroFecha ? 'No se encontraron atestados que coincidan con los filtros' : 'Aún no has creado ningún atestado'}
              </p>
              {!busqueda && !filtroFecha && (
                <Link 
                  to="/atestados/nuevo" 
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Crear primer atestado
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {atestadosFiltrados.map(atestado => (
                <div key={atestado.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Atestado #{atestado.numero || atestado.id}
                        </h3>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                          {formatDate(atestado.fecha)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-4">
                          <span>
                            📄 {atestado.total_diligencias || 0} diligencia{(atestado.total_diligencias || 0) !== 1 ? 's' : ''}
                          </span>
                          <span>
                            📅 Creado: {formatDate(atestado.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      {atestado.descripcion && (
                        <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                          {atestado.descripcion}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Link
                        to={`/atestados/${atestado.id}`} 
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Ver
                      </Link>
                      <Link
                        to={`/atestados/${atestado.id}/editar`} 
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Editar
                      </Link>
                      <Link
                        to={`/atestados/${atestado.id}/diligencias/nueva`} 
                        className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                      >
                        + Diligencia
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Mostrando {atestadosFiltrados.length} de {atestados.length} atestados
        </div>
      </div>
    </div>
  );
};

export default AtestadosList;