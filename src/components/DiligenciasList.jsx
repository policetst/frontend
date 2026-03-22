// pages/DiligenciasList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/apiService';
import Swal from 'sweetalert2';
import { FileText, Calendar, Trash2, Tag, Info } from 'lucide-react';

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
      Swal.fire({
        title: 'Error',
        text: 'Error al cargar las diligencias',
        icon: 'error',
        confirmButtonColor: '#002856',
      });
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

        {/* Sección Ver diligencias redesigned */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Ver diligencias</h2>
          
          {/* Lista de diligencias como tarjetas */}
        {diligenciasFiltradas.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-lg border">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No hay diligencias</h3>
            <p className="text-gray-400 mb-4">
              {busqueda || filtroFecha || filtroResultado ? 'No se encontraron diligencias que coincidan con los filtros' : 'Aún no se han registrado diligencias'}
            </p>
            {!busqueda && !filtroFecha && (
              <Link 
                to="/plantillas"
                className="bg-[#002856] text-white px-6 py-2 rounded shadow-md hover:bg-blue-700 transition-all font-bold"
              >
                Crear Diligencia (desde Plantillas)
              </Link>
            )}
          </div>
        ) : (
<<<<<<< Updated upstream
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
=======
          <div className="grid grid-cols-1 gap-4">
            {diligenciasFiltradas.map((diligencia) => (
              <div key={diligencia.id} className="bg-white rounded-lg shadow-sm border p-5 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link to={`/diligencias/${diligencia.id}`} className="text-lg font-bold text-[#002856] hover:underline decoration-2">
                        Diligencia #{diligencia.numero || diligencia.id}
                      </Link>
                      <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ring-1 ${
                        diligencia.resultado === 'completada' ? 'bg-green-100 text-green-800 ring-green-600/20' :
                        diligencia.resultado === 'pendiente' ? 'bg-yellow-100 text-yellow-800 ring-yellow-600/20' :
                        'bg-blue-100 text-blue-800 ring-blue-600/20'
                      }`}>
                        {diligencia.resultado || 'Sin estado'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2 font-medium">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDateTime(diligencia.created_at)}
>>>>>>> Stashed changes
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs border border-slate-200">
                          {diligencia.plantilla_nombre || 'Sin plantilla'}
                        </span>
                      </div>
                    </div>
                    
                    {diligencia.content && (
                      <p className="mt-3 text-xs text-gray-500 line-clamp-1 italic bg-slate-50 p-2 rounded border border-slate-100">
                        {diligencia.content.substring(0, 100)}...
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button 
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                      title="Eliminar diligencia"
                      onClick={async () => {
                        const result = await Swal.fire({
                          title: '¿Estás seguro?',
                          text: 'Se eliminará esta diligencia de forma permanente.',
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#002856',
                          cancelButtonColor: '#d33',
                          confirmButtonText: 'Sí, eliminar',
                          cancelButtonText: 'Cancelar'
                        });

                        if (result.isConfirmed) {
                          // Implementar eliminación real aquí
                          console.log('Eliminar diligencia:', diligencia.id);
                          Swal.fire({
                            title: 'Eliminada',
                            text: 'Funcionalidad de borrado en desarrollo',
                            icon: 'info',
                            confirmButtonColor: '#002856'
                          });
                        }
                      }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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