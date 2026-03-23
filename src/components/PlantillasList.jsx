// pages/PlantillasList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import Swal from 'sweetalert2';
import { extractVariables } from '../utils/types';
import { ArrowLeft, FileText, Tag, Plus, Search, Calendar, ChevronRight } from 'lucide-react';


const PlantillasList = () => {
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadPlantillas();
  }, []);

  const loadPlantillas = async () => {
    try {
      const response = await apiService.getPlantillas();
      setPlantillas(response.plantillas || response || []);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al cargar las plantillas',
        icon: 'error',
        confirmButtonColor: '#002856',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que quieres eliminar la plantilla "${name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#002856',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await apiService.deletePlantilla(id);
        Swal.fire({
          title: 'Eliminada',
          text: 'Plantilla eliminada correctamente',
          icon: 'success',
          confirmButtonColor: '#002856',
          timer: 1500
        });
        loadPlantillas(); // Recargar la lista
      } catch (error) {
        console.error('Error al eliminar plantilla:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
        Swal.fire({
          title: 'Error',
          text: 'Error: ' + errorMessage,
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

  const truncateText = (text, maxLength = 100) => {
    if (!text) return 'Sin descripción';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Filtrar plantillas
  const plantillasFiltradas = plantillas.filter(plantilla => {
    if (!busqueda) return true;
    const searchLower = busqueda.toLowerCase();
    return (
      plantilla.name?.toLowerCase().includes(searchLower) ||
      plantilla.description?.toLowerCase().includes(searchLower) ||
      plantilla.content?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) return (
    <div className="p-6">
      <div className="text-center">Cargando Diligencias...</div>
    </div>
  );

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
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Diligencias</h1>
            <p className="text-sm text-gray-500 mt-1">Configura las plantillas reutilizables para tus atestados</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 
              bg-[#002856] text-white rounded border border-[#002856]
              hover:bg-blue-700
              transition-all duration-200 shadow-md transform hover:scale-[1.02] active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Diligencia
          </button>
        </div>

        {/* Filtros de búsqueda estilo AtestadosList */}
        <div className="bg-white rounded shadow-sm border mb-6 p-6">
          <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <Search className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Filtros de búsqueda</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Buscar</label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre, descripción o variables..."
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all border-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Estado / Categoría</label>
              <div className="w-full bg-gray-50 border rounded px-3 py-2 text-sm text-gray-400 italic">
                Próximamente filtrado por etiquetas...
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Plantillas */}
        <div className="bg-white rounded shadow-sm border overflow-hidden">
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4" /> Listado de Plantillas
            </h2>
            <span className="text-xs font-bold text-slate-400">Total: {plantillasFiltradas.length}</span>
          </div>

      {plantillasFiltradas.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">
            {plantillas.length === 0 
              ? 'No hay plantillas registradas.' 
              : 'No se encontraron plantillas que coincidan con la búsqueda.'
            }
          </p>
          {plantillas.length === 0 && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Crear Primera Plantilla
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {plantillasFiltradas.map(plantilla => {
            const variables = extractVariables(plantilla.content || '');
            
            return (
              <div key={plantilla.id} className="p-6 hover:bg-blue-50/30 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#002856] transition-colors">
                        <Link to={`/plantillas/${plantilla.id}/editar`} className="flex items-center gap-2">
                          {plantilla.name || 'Sin nombre'}
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all text-[#002856]" />
                        </Link>
                      </h3>
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter border border-blue-100">
                        {variables.length} VARIABLES
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(plantilla.created_at)}
                      </span>
                    </div>
                    
                    {plantilla.description && (
                      <p className="text-gray-600 text-sm mb-4 max-w-2xl italic line-clamp-2">
                        {plantilla.description}
                      </p>
                    )}

                    {/* Variables chips */}
                    {variables.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {variables.slice(0, 6).map((v, i) => (
                          <span key={i} className="px-2 py-0.5 bg-white border border-gray-200 text-gray-500 text-[10px] font-bold rounded shadow-sm">
                            {v}
                          </span>
                        ))}
                        {variables.length > 6 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[10px] font-bold rounded">
                            +{variables.length - 6} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleDelete(plantilla.id, plantilla.name)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all flex-shrink-0"
                      title="Eliminar plantilla"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      )}

        </div>

      {/* Resumen final */}

      <div className="mt-8 pb-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
        <div className="h-px w-8 bg-gray-200"></div>
        Mostrando {plantillasFiltradas.length} plantillas de diligencias
        <div className="h-px w-8 bg-gray-200"></div>
      </div>

      {/* Modal de Datos Básicos */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">
            <div className="bg-[#002856] p-4 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Nueva Plantilla de Diligencia</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setCreating(true);
                try {
                  const response = await apiService.createPlantilla({
                    name: newTemplate.name,
                    description: newTemplate.description,
                    content: 'Nueva Diligencia: ' + newTemplate.name // El contenido es obligatorio en el backend
                  });
                  const plantillaId = response.plantilla?.id || response.id;
                  setIsModalOpen(false);
                  navigate(`/plantillas/${plantillaId}/editar`);
                } catch (error) {
                  console.error('Error al crear plantilla:', error);
                  Swal.fire({
                    title: 'Error',
                    text: 'Error al crear la plantilla: ' + (error.response?.data?.message || error.message),
                    icon: 'error',
                    confirmButtonColor: '#002856',
                  });
                } finally {
                  setCreating(false);
                }
              }} 
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Nombre de la Diligencia <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#002856] focus:border-transparent outline-none transition-all shadow-sm"
                  placeholder="Ej: Diligencia de identificación"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Descripción (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#002856] focus:border-transparent outline-none transition-all shadow-sm"
                  placeholder="Breve descripción de cuándo usar esta plantilla..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors font-medium border border-transparent"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-[#002856] text-white rounded hover:bg-[#003d82] transition-colors font-bold shadow-md hover:shadow-lg active:scale-95 transition-all disabled:bg-gray-400"
                >
                  {creating ? 'Creando...' : 'Continuar al Editor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default PlantillasList;