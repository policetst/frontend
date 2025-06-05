import React from 'react';

function EditarPersona() {
  document.title = "SIL Tauste - Editar Persona"; // Esto cambia el título de la pestaña del navegador

  return (
    <div>
        <div className="flex justify-center">
            <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] space-y-8 text-gray-800">

                {/* Titulo en escritorio o tablet */}
                <div className="hidden xl:block">
                    <h2 className="text-2xl font-bold">Editar Persona</h2>
                    <hr className="border-t border-gray-300 my-4"/>
                </div>
                {/* Titulo en móviles */}
                <div className="block xl:hidden">
                    <h2 className="text-2xl font-bold flex justify-center">Editar Persona</h2>
                    <hr className="border-t border-gray-300 my-4"/>
                </div>

                {/* Contenido */}

                <div className="max-w-4xl mx-auto p-4">
                    {/* Botón conmutador */}
                    <div className="flex justify-center gap-4 mb-6">
                        <button
                        onClick={() => setView('editar')}
                        className={`px-4 py-2 rounded-md border ${
                            view === 'editar'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                        }`}
                        >
                        Editar Persona
                        </button>
                        <button
                        onClick={() => setView('relaciones')}
                        className={`px-4 py-2 rounded-md border ${
                            view === 'relaciones'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                        }`}
                        >
                        Ver Relaciones
                        </button>
                    </div>

                    {/* Contenido según vista */}
                    {view === 'editar' ? (
                        <form className="space-y-4 bg-white p-6 rounded shadow">
                        <div>
                            <label className="block text-sm font-medium">Nombre</label>
                            <input type="text" className="w-full border px-3 py-2 rounded" />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                            <label className="block text-sm font-medium">Apellido 1</label>
                            <input type="text" className="w-full border px-3 py-2 rounded" />
                            </div>
                            <div className="flex-1">
                            <label className="block text-sm font-medium">Apellido 2</label>
                            <input type="text" className="w-full border px-3 py-2 rounded" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Teléfono</label>
                            <input type="text" className="w-full border px-3 py-2 rounded" />
                        </div>
                        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Guardar</button>
                        </form>
                    ) : (
                        <div className="bg-white p-6 rounded shadow space-y-4">
                        <h3 className="text-lg font-bold">Relaciones</h3>

                        {/* Simulación de relaciones */}
                        <div>
                            <h4 className="font-semibold text-gray-700">Personas relacionadas</h4>
                            <ul className="list-disc list-inside text-sm text-gray-700">
                            <li>Juan Pérez (Incidencia #123)</li>
                            <li>Laura Gómez (Incidencia #128)</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-700">Vehículos asociados</h4>
                            <ul className="list-disc list-inside text-sm text-gray-700">
                            <li>Seat León - 1234ABC (Incidencia #123)</li>
                            <li>Ford Focus - 9876XYZ (Incidencia #128)</li>
                            </ul>
                        </div>
                        </div>
                    )}
                    </div>
            </div>
        </div>
    </div>
  );
}

export default EditarPersona;
