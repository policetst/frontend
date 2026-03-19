// pages/AtestadosList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import { ArrowLeft, FileText, Eye } from 'lucide-react';

const AtestadosList = () => {
  const navigate = useNavigate();
  const [atestados, setAtestados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAtestado, setNewAtestado] = useState({
    numero: '',
    tipo: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  const tipos = [
    'Accidente de tráfico',
    'Agresiones o amenazas',
    'Desorden público',
    'Robo a particular',
    'Robo a comercio',
  ];

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

  const fetchDiligenciasOnHover = async (atestadoId) => {
    const atestado = atestados.find(a => a.id === atestadoId);
    // Si ya tenemos las diligencias o ya estamos cargando (opcional), no hacemos nada
    if (atestado && (!atestado.diligencias || atestado.diligencias.length === 0)) {
      try {
        const response = await apiService.getAtestado(atestadoId);
        const diligencias = response.diligencias || [];
        
        setAtestados(prevAtestados => 
          prevAtestados.map(a => 
            a.id === atestadoId ? { ...a, diligencias: diligencias, fetched: true } : a
          )
        );
      } catch (error) {
        console.error('Error fetching diligencias detail:', error);
      }
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newAtestado.numero.trim()) {
      alert('El nombre/número del atestado es obligatorio');
      return;
    }
    
    setCreating(true);
    try {
      const response = await apiService.createAtestado(newAtestado);
      const atestadoId = response.atestado?.id || response.id;
      setIsModalOpen(false);
      navigate(`/atestados/${atestadoId}`);
    } catch (error) {
      console.error('Error al crear atestado:', error);
      alert('Error al crear el atestado: ' + (error.response?.data?.message || error.message));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este atestado?')) {
      try {
        await apiService.deleteAtestado(id);
        setAtestados(atestados.filter(a => a.id !== id));
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el atestado');
      }
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
      <div className="max-w-4xl mx-auto p-6">
        
        {/* Cabecera */}
        <div className='mb-4'>
          <div className='flex items-center'>
            <button
            onClick={() => window.history.back()}
            className='bg-gray-100 p-1 border border-gray-500 rounded '
            >
            <ArrowLeft/>
            </button>
            <p className='ml-3 text-lg'>Atrás</p>
          </div>
        </div>
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Atestados</h1>
          <div className="flex gap-3">
            <Link 
              to="/plantillas" 
              className="mt-2 px-4 py-2 
                bg-[#002856] text-white rounded border
                hover:bg-gray-300 hover:text-black hover:border-[#002856]
                active:bg-gray-100 active:text-black  active:border-gray-800"
            >
              Diligencias
            </Link>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-2 px-4 py-2 
                bg-[#002856] text-white rounded border
                hover:bg-gray-300 hover:text-black hover:border-[#002856]
                active:bg-gray-100 active:text-black  active:border-gray-800"
            >
              Crear Atestado
            </button>
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
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Crear primer atestado
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {atestadosFiltrados.map(atestado => (
                <div key={atestado.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <Link to={`/atestados/${atestado.id}`} className="flex-1 group">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          Atestado #{atestado.numero || atestado.id}
                        </h3>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                          {formatDate(atestado.fecha)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4 opacity-50" />
                              <div 
                                className="relative group/tooltip cursor-help border-b border-transparent hover:border-dotted hover:border-[#002856] transition-colors"
                                onMouseEnter={() => fetchDiligenciasOnHover(atestado.id)}
                              >
                                <span className="text-gray-700 font-medium">
                                  {atestado.total_diligencias || 0} diligencia{(atestado.total_diligencias || 0) !== 1 ? 's' : ''}
                                </span>
                                
                                {/* Tooltip dinámico */}
                                <div className="absolute left-0 top-full mt-1 hidden group-hover/tooltip:block
                                  bg-white border border-gray-200 text-gray-800 text-[11px] p-3 rounded-lg shadow-xl z-50 min-w-[200px]
                                  animate-in fade-in slide-in-from-top-2 duration-150">
                                  <div className="font-bold mb-2 border-b border-gray-100 pb-1 text-[#002856] flex items-center gap-2">
                                    <span className="w-1 h-3 bg-[#002856] rounded-full"></span>
                                    Diligencias del atestado:
                                  </div>
                                  
                                  {!atestado.fetched ? (
                                    <div className="py-2 text-center text-gray-400 italic">Cargando títulos...</div>
                                  ) : atestado.diligencias && atestado.diligencias.length > 0 ? (
                                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                                      {atestado.diligencias.map((d, i) => (
                                        <div key={i} className="flex gap-2 items-start border-b border-gray-50 pb-1 last:border-0">
                                          <span className="text-[#002856] font-mono font-bold opacity-30">{(i + 1)}</span>
                                          <span className="flex-1 leading-tight">{d.plantilla_nombre || d.nombre || 'Sin título'}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="py-2 text-center text-gray-400">Este atestado no tiene diligencias.</div>
                                  )}
                                  
                                  <div className="absolute bottom-full left-4 border-8 border-transparent border-b-white"></div>
                                </div>
                              </div>
                            </div>
                            <span className="flex items-center gap-1">
                              📅 Creado: {formatDate(atestado.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {atestado.descripcion && (
                        <p className="text-gray-700 text-sm line-clamp-2 mb-0">
                          {atestado.descripcion}
                        </p>
                      )}
                    </Link>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleDelete(atestado.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded border border-red-700
                        hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen */}
        {/* <div className="mt-6 text-center text-sm text-gray-600">
          Mostrando {atestadosFiltrados.length} de {atestados.length} atestados
        </div> */}
      </div>
      {/* Modal de Creación */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#002856] p-4 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Nuevo Atestado</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Nombre/Número del atestado
                </label>
                <input
                  type="text"
                  required
                  value={newAtestado.numero}
                  onChange={(e) => setNewAtestado({...newAtestado, numero: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#002856] focus:border-transparent outline-none transition-all"
                  placeholder="Ej: 2024-001"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Tipo de atestado
                </label>
                <select
                  required
                  value={newAtestado.tipo}
                  onChange={(e) => setNewAtestado({...newAtestado, tipo: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#002856] focus:border-transparent outline-none transition-all appearance-none bg-no-repeat bg-[right_10px_center]"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundSize: '1.5em' }}
                >
                  <option value="">Selecciona un tipo...</option>
                  {tipos.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={newAtestado.descripcion}
                  onChange={(e) => setNewAtestado({...newAtestado, descripcion: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#002856] focus:border-transparent outline-none transition-all"
                  placeholder="Breve descripción de los hechos..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors font-medium"
                  disabled={creating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-[#002856] text-white rounded hover:bg-[#003d82] transition-colors font-bold shadow-md disabled:bg-gray-400"
                >
                  {creating ? 'Creando...' : 'Crear Atestado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AtestadosList;