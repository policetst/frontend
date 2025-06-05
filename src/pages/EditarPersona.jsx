import React from 'react';
import { useParams } from 'react-router-dom';

function EditarPersona() {
    document.title = "SIL Tauste - Editar Persona"; // Esto cambia el título de la pestaña del navegador
    const {dni} = useParams()
    console.log(dni)

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

            </div>
        </div>
    </div>
  );
}

export default EditarPersona;
