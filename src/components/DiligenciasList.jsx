// pages/DiligenciasList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/apiService';

const DiligenciasList = () => {
  const [diligencias, setDiligencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroResultado, setFiltroResultado] = useState('');

  useEffect(() => {
    loadDiligencias();
  }, []);

  const loadDiligencias = async () => {
    try {
      // Aquí necesitarías implementar un endpoint para obtener todas las diligencias
      // Por ahora usamos un array vacío como placeholder
      setDiligencias([]);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar las diligencias');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrar diligencias
  const diligenciasFiltradas = diligencias.filter(diligencia => {
    const matchBusqueda = !busqueda || 
      diligencia.numero?.toString().toLowerCase().includes(busqueda.toLowerCase()) ||
      diligencia.content?.toLowerCase().includes(busqueda.toLowerCase()) ||
      diligencia.plantilla_nombre?.toLowerCase().includes(busqueda.toLowerCase());
    
    const matchTipo = !filtroTipo || diligencia.tipo === filtroTipo;
    const matchResultado = !filtroResultado || diligencia.resultado === filtroResultado;
    
    return matchBusqueda && matchTipo && matchResultado;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Cargando diligencias...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">SISTEMA INCIDENCIAS LOCALES</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo - Crear diligencia */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Crear diligencia</h2>
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Número</label>
              <input
                type="text"
                placeholder="Número de diligencia"
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

        {/* Panel central - Editar diligencia */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Editar diligencia</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por número, contenido..."
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
            <div>
              <label className="block text-sm font-medium mb-2">Plantilla</label>
              <select 
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las plantillas</option>
                <option value="atestado">Atestado</option>
                <option value="denuncia">Denuncia</option>
                <option value="citacion">Citación</option>
              </select>
            </div>
          </div>
        </div>

        {/* Panel derecho - Información adicional */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Información</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Total de diligencias</p>
              <p className="text-2xl font-bold text-blue-600">{diligencias.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Diligencias filtradas</p>
              <p className="text-xl font-semibold text-gray-800">{diligenciasFiltradas.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección Ver diligencias */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
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
            <select 
              value={filtroResultado}
              onChange={(e) => setFiltroResultado(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Resultado</option>
              <option value="completada">Completada</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En proceso</option>
            </select>
          </div>
          <div>
            <select className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tipo</option>
              <option value="atestado">Atestado</option>
              <option value="denuncia">Denuncia</option>
              <option value="citacion">Citación</option>
            </select>
          </div>
        </div>

        {/* Tabla de resultados */}
        {diligenciasFiltradas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No hay diligencias que coincidan con los filtros.</p>
            <Link 
              to="/plantillas/nueva"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Crear Primera Diligencia
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                    Número de diligencia
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                    Fecha
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                    Plantilla
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                    Resultado
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {diligenciasFiltradas.map((diligencia) => (
                  <tr key={diligencia.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      <span className="font-medium text-blue-600">
                        #{diligencia.numero || diligencia.id}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                      {formatDateTime(diligencia.created_at)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {diligencia.plantilla_nombre || 'Sin plantilla'}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        diligencia.resultado === 'completada' ? 'bg-green-100 text-green-800' :
                        diligencia.resultado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        diligencia.resultado === 'en_proceso' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {diligencia.resultado || 'Sin estado'}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex gap-2">
                        <Link 
                          to={`/diligencias/${diligencia.id}`} 
                          className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                        >
                          Ver
                        </Link>
                        <Link 
                          to={`/diligencias/${diligencia.id}/editar`} 
                          className="text-green-500 hover:text-green-700 text-sm font-medium"
                        >
                          Editar
                        </Link>
                        <button 
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                          onClick={() => {
                            if (confirm('¿Estás seguro de que quieres eliminar esta diligencia?')) {
                              // Implementar eliminación
                              console.log('Eliminar diligencia:', diligencia.id);
                            }
                          }}
                        >
                          Eliminar
                        </button>
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
        Mostrando {diligenciasFiltradas.length} de {diligencias.length} diligencias
      </div>
    </div>
  );
};

export default DiligenciasList;