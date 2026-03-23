// pages/DiligenciasList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/apiService';
import Swal from 'sweetalert2';
import { FileText, Calendar, Trash2, Tag, Info, ArrowLeft, Search, Plus, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const DiligenciasList = () => {
  const [diligencias, setDiligencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroResultado, setFiltroResultado] = useState('');
  const navigate = useNavigate();


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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        
        {/* Cabecera / Atrás */}
        <div className='mb-4'>
          <div className='flex items-center'>
            <button
              onClick={() => navigate('/atestados')}
              className='bg-gray-100 p-1 border border-gray-500 rounded hover:bg-white transition-colors'
            >
              <ArrowLeft className="w-5 h-5"/>
            </button>
            <p className='ml-3 text-lg font-medium text-gray-600'>Volver a Atestados</p>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Historial de Diligencias</h1>
            <p className="text-sm text-gray-500 mt-1">Registro completo de todas las diligencias emitidas</p>
          </div>
          <button 
            onClick={() => navigate('/plantillas')}
            className="px-4 py-2 
              bg-[#002856] text-white rounded border border-[#002856]
              hover:bg-blue-700
              transition-all duration-200 shadow-md transform hover:scale-[1.02] active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Gestionar Plantillas
          </button>
        </div>

        {/* Filtros de búsqueda estilo AtestadosList */}
        <div className="bg-white rounded shadow-sm border mb-6 p-6">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Search className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Filtros de búsqueda</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Buscar</label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Número, contenido..."
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Fecha</label>
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipo de Plantilla</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-200"
              >
                <option value="">Todas</option>
                <option value="atestado">Atestado</option>
                <option value="denuncia">Denuncia</option>
                <option value="citacion">Citación</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Diligencias */}
        <div className="bg-white rounded shadow-sm border overflow-hidden">
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4" /> Registro de Actuaciones
            </h2>
            <span className="text-xs font-bold text-slate-400">Total: {diligenciasFiltradas.length}</span>
          </div>

          {!diligenciasFiltradas.length ? (
            <div className="p-16 text-center text-gray-500">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <FileText className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Sin diligencias registradas</h3>
              <p className="text-gray-400 text-sm max-w-xs mx-auto mb-6">
                No se han encontrado diligencias que coincidan con los criterios de búsqueda.
              </p>
              <button 
                onClick={() => navigate('/plantillas')}
                className="bg-[#002856] text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-700 transition-all font-bold text-sm"
              >
                Crear Diligencia (desde Plantillas)
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {diligenciasFiltradas.map((diligencia) => (
                <div key={diligencia.id} className="p-6 hover:bg-slate-50 transition-all group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link to={`/diligencias/${diligencia.id}`} className="text-lg font-bold text-gray-900 group-hover:text-[#002856] transition-colors flex items-center gap-2">
                          Diligencia #{diligencia.numero || diligencia.id}
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all text-[#002856]" />
                        </Link>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${
                          diligencia.resultado === 'completada' ? 'bg-green-50 text-green-700 border-green-100' :
                          diligencia.resultado === 'pendiente' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                          'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {diligencia.resultado || 'SIN ESTADO'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {formatDateTime(diligencia.created_at)}
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <Tag className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-700">
                            {diligencia.plantilla_nombre || 'Sin plantilla'}
                          </span>
                        </div>
                      </div>
                      
                      {diligencia.content && (
                        <p className="text-gray-600 text-sm italic line-clamp-1 bg-gray-50 px-3 py-2 rounded border border-gray-100">
                          {diligencia.content.substring(0, 120)}...
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button 
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all flex-shrink-0"
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
                            Swal.fire({
                              title: 'Información',
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

        {/* Resumen final */}
        <div className="mt-8 pb-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
          <div className="h-px w-8 bg-gray-200"></div>
          Mostrando {diligenciasFiltradas.length} de {diligencias.length} diligencias
          <div className="h-px w-8 bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
};

export default DiligenciasList;
