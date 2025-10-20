// pages/CrearAtestado.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import { ArrowLeft } from 'lucide-react';

const CrearAtestado = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    numero: '',
    tipo: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.numero.trim()) {
      alert('El número del atestado es obligatorio');
      return;
    }

    if (!formData.fecha) {
      alert('La fecha del atestado es obligatoria');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.createAtestado(formData);
      const atestadoId = response.atestado?.id || response.id;
      navigate(`/atestados/${atestadoId}`);
    } catch (error) {
      console.error('Error al crear atestado:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      alert('Error: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const tipos = [
    'Accidente de tráfico',
    'Agresiones o amenazas',
    'Desorden público',
    'Robo a particular',
    'Robo a comercio',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          {/* 
          Tomar el número de atestado que le vaya a corresponder 
          */}
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

          <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Atestado</h1>
          <p className="text-gray-600 mt-1">Rellena información primordial del atestado</p>
        </div>
        
        
        <div className="mx-auto p-4 bg-white border border-gray-400 rounded-sm shadow-md space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800"><p>Atestado: </p><p>2024-002</p></h2>
            <hr className="border-t border-gray-300 my-4" />
          </div>
          
          <form onSubmit={handleSubmit} className="">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nombre del atestado
                </label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-500 rounded px-3 py-2"
                  placeholder="Ej: 2024-001"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tipo de atestado
                </label>
                <select
                  type="text"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-500 rounded px-3 py-2"
                  placeholder="Ej: 2024-001"
                >
                  <option value="">
                    
                  </option>
                  {tipos.map((tipo, idx) => (
                    <option key={idx} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-500 rounded px-3 py-2"
                placeholder="Descripción general del atestado..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate('/atestados')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-1 rounded
                ${loading ? 'bg-gray-100 border border-black text-black cursor-not-allowed' : 'bg-[#002856] text-white rounded border hover:bg-gray-300 hover:text-black hover:border-[#002856]'}
                  `}
                >
                {loading ? 'Creando...' : 'Crear Atestado'}
              </button>
              
            </div>
          </form>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-blue-800 mb-1">Información</h3>
              <p className="text-sm text-blue-700">
                Una vez creado el atestado, podrás agregar diligencias y asignar las claves necesarias.
                El número del atestado debe ser único y seguir el formato establecido por su organización.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearAtestado;