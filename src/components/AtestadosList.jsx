// pages/AtestadosList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/apiService';

const AtestadosList = () => {
  const [atestados, setAtestados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');

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
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'cerrado':
        return 'bg-red-100 text-red-800';
      case 'archivado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Filtrar atestados
  const atestadosFiltrados = atestados.filter(atestado => {
    const matchEstado = !filtroEstado || atestado.estado === filtroEstado;
    const matchBusqueda = !busqueda || 
      atestado.numero?.toLowerCase().includes(busqueda.toLowerCase()) ||
      atestado.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    
    return matchEstado && matchBusqueda;
  });

  if (loading) return (
    <div className="p-6">
      <div className="text-center">Cargando atestados...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con título del sistema */}
      <div className="bg-gray-800 text-white py-4 px-6">
        <h1 className="text-xl font-bold text-center">SISTEMA INCIDENCIAS LOCALES</h1>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Sección de crear diligencia */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <h2 className="text-lg font-semibold mb-4">Crear diligencia</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nº</label>
              <input
                type="text"
                placeholder="Número"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fecha</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Plantilla diligencia</label>
              <select className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar plantilla</option>
              </select>
            </div>
          </div>
          
          {/* Lista de opciones */}
          <div className="mb-4">
            <ul className="space-y-1 text-sm">
              <li>• Atestado</li>
              <li>• Denuncia</li>
              <li>• Citación</li>
              <li>• Plantilla nueva</li>
            </ul>
          </div>
          
          <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
            Crear diligencia
          </button>
        </div>

        {/* Filtros de búsqueda */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <h2 className="text-lg font-semibold mb-4">Editar diligencia</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium mb-2">Estado</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="cerrado">Cerrado</option>
                <option value="archivado">Archivado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Acciones rápidas</label>
              <div className="flex gap-2">
                <Link 
                  to="/plantillas" 
                  className="bg-purple-500 text-white px-3 py-2 rounded text-sm hover:bg-purple-600"
                >
                  Plantillas
                </Link>
                <Link 
                  to="/atestados/nuevo" 
                  className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
                >
                  Nuevo
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Sección Ver diligencias */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Ver diligencias</h2>
          
          {/* Filtros adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <select className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Buscar por número</option>
              </select>
            </div>
            <div>
              <select className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Fecha</option>
              </select>
            </div>
            <div>
              <select className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Resultado</option>
              </select>
            </div>
            <div>
              <select className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Tipo</option>
              </select>
            </div>
          </div>

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
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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
                    <th className="text-left p-3 font-medium">Número de la diligencia</th>
                    <th className="text-left p-3 font-medium">Fecha</th>
                    <th className="text-left p-3 font-medium">Resultado de la diligencia</th>
                    <th className="text-left p-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {atestadosFiltrados.map(atestado => (
                    <tr key={atestado.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span className="font-medium">Atestado #{atestado.numero || atestado.id}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadgeClass(atestado.estado)}`}>
                            {atestado.estado || 'Sin estado'}
                          </span>
                        </div>
                        {atestado.descripcion && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                            {atestado.descripcion}
                          </p>
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        <div>
                          <p>Fecha: {formatDate(atestado.fecha)}</p>
                          <p>Creado: {formatDate(atestado.created_at)}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          {atestado.total_diligencias !== undefined && (
                            <p className="text-blue-600 font-medium">
                              {atestado.total_diligencias} diligencia{atestado.total_diligencias !== 1 ? 's' : ''}
                            </p>
                          )}
                          <p className="text-gray-600">Estado: {atestado.estado || 'Sin estado'}</p>
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