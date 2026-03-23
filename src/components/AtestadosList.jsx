// pages/AtestadosList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/apiService';
import Swal from 'sweetalert2';
import { ArrowLeft, FileText, Eye } from 'lucide-react';

const AtestadosList = () => {
  const [atestados, setAtestados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [activeTab, setActiveTab] = useState(localStorage.getItem('atestados_active_tab') || 'templates');
  
  useEffect(() => {
    localStorage.setItem('atestados_active_tab', activeTab);
  }, [activeTab]);
  
  
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
      Swal.fire({
        title: 'Error',
        text: 'Error al cargar los atestados',
        icon: 'error',
        confirmButtonColor: '#002856',
      });
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
      Swal.fire({
        title: 'Campo obligatorio',
        text: 'El nombre/número del atestado es obligatorio',
        icon: 'warning',
        confirmButtonColor: '#002856',
      });
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
      Swal.fire({
        title: 'Error',
        text: 'Error al crear el atestado: ' + (error.response?.data?.message || error.message),
        icon: 'error',
        confirmButtonColor: '#002856',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Estás seguro de que deseas eliminar este atestado?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#002856',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await apiService.deleteAtestado(id);
        setAtestados(atestados.filter(a => a.id !== id));
        Swal.fire({
          title: 'Eliminado',
          text: 'El atestado ha sido eliminado correctamente',
          icon: 'success',
          confirmButtonColor: '#002856',
        });
      } catch (error) {
        console.error('Error al eliminar:', error);
        Swal.fire({
          title: 'Error',
          text: 'Error al eliminar el atestado',
          icon: 'error',
          confirmButtonColor: '#002856',
        });
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
    
    // Si es 'templates', filtramos los que NO son finales. Si es 'used', los que SÍ son finales.
    // Usamos la propiedad 'is_final' que asignaremos al "usar" un atestado.
    const isFinal = atestado.is_final === true || atestado.is_final === 1 || atestado.is_final === '1' || atestado.numero?.includes('-U-');
    const matchTab = (activeTab === 'templates') ? !isFinal : isFinal;
    
    return matchBusqueda && matchFecha && matchTab;
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
            {activeTab === 'templates' && (
              <>
                <Link 
                  to="/plantillas" 
                  className="mt-2 px-4 py-2 
                    bg-white text-[#002856] rounded border border-[#002856]
                    hover:bg-[#002856] hover:text-white
                    transition-all duration-200 shadow-sm"
                >
                  Gestión de Diligencias
                </Link>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-2 px-4 py-2 
                    bg-[#002856] text-white rounded border border-[#002856]
                    hover:bg-blue-700
                    transition-all duration-200 shadow-md transform hover:scale-[1.02] active:scale-95"
                >
                  + Crear Atestado
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sistema de Pestañas */}
        <div className="flex mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 text-sm font-bold transition-all ${
              activeTab === 'templates'
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📋 ATESTADOS (Diligencias)
          </button>
          <button
            onClick={() => setActiveTab('used')}
            className={`px-6 py-3 text-sm font-bold transition-all ${
              activeTab === 'used'
                ? 'border-b-4 border-[#002856] text-[#002856]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ATESTADOS USADOS (Finalizados)
          </button>
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
              {!busqueda && !filtroFecha && activeTab === 'templates' && (
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
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 hover:text-[#002856] transition-colors">
                          <Link to={`/atestados/${atestado.id}`}>
                            Atestado #{atestado.numero || atestado.id}
                          </Link>
                        </h3>
                        {atestado.is_final ? (
                          <span className="bg-[#002856]/10 text-[#002856] px-2 py-1 rounded text-xs font-bold ring-1 ring-[#002856]/20">
                            FINALIZADO
                          </span>
                        ) : null}
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                          {formatDate(atestado.fecha)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-4">
                          <Link 
                            to={`/atestados/${atestado.id}`}
                            className="hover:text-[#002856] transition-colors flex items-center gap-1"
                          >
                            📄 {atestado.total_diligencias || 0} diligencia{(atestado.total_diligencias || 0) !== 1 ? 's' : ''}
                          </Link>
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
                      
                      <button
                        onClick={() => handleDelete(atestado.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                        title="Eliminar atestado"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
    </div>
  );
};

export default AtestadosList;