import React from 'react';

function MostrarIncidencia() {
  const incidencias = [
    { id: 1, tipo: 'Animales', descripcion: 'Avistamiento de animales salvajes', estado: 'Abierta' },
    { id: 2, tipo: 'Trafico', descripcion: 'Accidente de tráfico en la A-1', estado: 'Abierta' },
    { id: 3, tipo: 'Colaboracion ciudadana', descripcion: 'Vecinos informan de ruidos sospechosos', estado: 'Cerrada' },
  ];

  document.title = "Mostrar Incidencias";

  const handleEdit = (id) => {
    alert(`Editar incidencia con ID: ${id}`);
    // Aquí puedes implementar la lógica para editar la incidencia
  };

  return (
    <div className="p-4">
      <h3 className="text-2xl font-bold mb-4">Incidencias</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {incidencias.map((incidencia) => (
          <div
            key={incidencia.id}
            className="bg-white shadow-lg rounded-lg p-4 flex flex-col justify-between"
          >
            {/* Indicador de estado */}
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold">{incidencia.tipo}</h4>
              <span
                className={`w-3 h-3 rounded-full ${
                  incidencia.estado === 'Abierta' ? 'bg-green-500' : 'bg-gray-400'
                }`}
                title={incidencia.estado}
              ></span>
            </div>
            {/* Descripción */}
            <p className="text-sm text-gray-600 mt-2">{incidencia.descripcion}</p>
            {/* Botón de editar */}
            <button
              onClick={() => handleEdit(incidencia.id)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              Editar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MostrarIncidencia;