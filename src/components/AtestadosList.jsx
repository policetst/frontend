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

  const getEstadoBadgeClass = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'cerrado':
        return 'bg-red-100 text-red-800';
      case 'archivado':
        return 'bg-gray-100 text-gray-800';
      case 'en_proceso':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
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
              className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600 transition-colors"
            >
              Gestionar Diligencias
            </Link>
            <Link 
              to="/atestados/nuevo" 
              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors"
            >
              + Nuevo Atestado
            </Link>
          </div>
        </div>

        {/* Filtros de búsqueda */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <h2 className="text-lg font-semibold mb-4">Filtros de búsqueda</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por número o descripción..."
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fecha</label>
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Botón para limpiar filtros */}
          {(busqueda || filtroFecha) && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setBusqueda('');
                  setFiltroFecha('');
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Lista de atestados */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Lista de Atestados</h2>
          
          {/* Tabla de resultados */}
          {atestadosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                {atestados.length === 0 
                  ? 'No hay atestados registrados.' 
                  : 'No se encontraron atestados que coincidan con los filtros.'
                }
              </p>
              {atestados.length === 0 && (
                <Link 
                  to="/atestados/nuevo"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Crear Primer Atestado
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium">Número del Atestado</th>
                    <th className="text-left p-3 font-medium">Fecha</th>
                    <th className="text-left p-3 font-medium">Estado</th>
                    <th className="text-left p-3 font-medium">Diligencias</th>
                    <th className="text-left p-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {atestadosFiltrados.map(atestado => (
                    <tr key={atestado.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Atestado #{atestado.numero || atestado.id}</span>
                        </div>
                        {atestado.descripcion && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {atestado.descripcion}
                          </p>
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        <div>
                          <p>Fecha: {formatDate(atestado.fecha)}</p>
                          <p className="text-xs text-gray-400">Creado: {formatDate(atestado.created_at)}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadgeClass(atestado.estado)}`}>
                          {atestado.estado || 'Sin estado'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          {atestado.total_diligencias !== undefined ? (
                            <p className="text-blue-600 font-medium">
                              {atestado.total_diligencias} diligencia{atestado.total_diligencias !== 1 ? 's' : ''}
                            </p>
                          ) : (
                            <p className="text-gray-400">Sin diligencias</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Link 
                            to={`/atestados/${atestado.id}`} 
                            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                          >
                            Ver
                          </Link>
                          <Link 
                            to={`/atestados/${atestado.id}/editar`} 
                            className="text-green-500 hover:text-green-700 text-sm font-medium"
                          >
                            Editar
                          </Link>
                          <Link 
                            to={`/atestados/${atestado.id}/diligencias/nueva`} 
                            className="text-purple-500 hover:text-purple-700 text-sm font-medium"
                          >
                            + Diligencia
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Resumen */}
        <div className="mt-6 text-sm text-gray-500 text-center">
          Mostrando {atestadosFiltrados.length} de {atestados.length} atestados
        </div>
      </div>
    </div>
  );
};

export default AtestadosList;