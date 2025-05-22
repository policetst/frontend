import React from 'react'
import FormularioIncidencia from '../components/FormularioIncidencia'

function CrearIncidencia() {
  document.title = "Crear Incidencia"
  return (
    <div>
      {/* Titulo en escritorio o tablets */}
      <div className="hidden md:block">
        <h2 className="text-2xl font-bold mt-4 ml-15">Crear Incidencia</h2>
      </div>
      {/* Titulo en moviles */}
      <div className="block md:hidden">
        <h2 className="text-2xl font-bold flex justify-center">Crear Incidencia</h2>
      </div>
      <div className="flex justify-center items-center mt-5">
        <FormularioIncidencia/>
      </div>
    </div>
  )
}

export default CrearIncidencia