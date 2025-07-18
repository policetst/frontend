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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Atestados</h1>
        <div className="flex gap-2">
          <Link 
            to="/plantillas" 
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Gestionar Plantillas
          </Link>
          <Link 
            to="/atestados/nuevo" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Nuevo Atestado
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded border mb-6">
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
        </div>
      </div>

      {/* Lista de Atestados */}
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
        <div className="grid gap-4">
          {atestadosFiltrados.map(atestado => (
            <div key={atestado.id} className="bg-white border rounded p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">
                    Atestado #{atestado.numero || atestado.id}
                  </h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadgeClass(atestado.estado)}`}>
                    {atestado.estado || 'Sin estado'}
                  </span>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>Fecha: {formatDate(atestado.fecha)}</p>
                  <p>Creado: {formatDate(atestado.created_at)}</p>
                  {atestado.total_diligencias !== undefined && (
                    <p className="text-blue-600 font-medium">
                      {atestado.total_diligencias} diligencia{atestado.total_diligencias !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
              
              {atestado.descripcion && (
                <p className="text-gray-700 mb-3 line-clamp-2">
                  {atestado.descripcion}
                </p>
              )}
              
              <div className="flex gap-2">
                <Link 
                  to={`/atestados/${atestado.id}`} 
                  className="text-blue-500 hover:text-blue-700 font-medium"
                >
                  Ver Detalles
                </Link>
                <Link 
                  to={`/atestados/${atestado.id}/editar`} 
                  className="text-green-500 hover:text-green-700 font-medium"
                >
                  Editar
                </Link>
                <Link 
                  to={`/atestados/${atestado.id}/diligencias/nueva`} 
                  className="text-purple-500 hover:text-purple-700 font-medium"
                >
                  Nueva Diligencia
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resumen */}
      <div className="mt-6 text-sm text-gray-500 text-center">
        Mostrando {atestadosFiltrados.length} de {atestados.length} atestados
      </div>
    </div>
  );
};

export default AtestadosList;