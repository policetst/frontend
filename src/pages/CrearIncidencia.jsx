import React from 'react'
import FormularioIncidencia from '../components/FormularioIncidencia'

function CrearIncidencia() {
  document.title = "Crear Incidencia"
  return (
    <div>
      <h1 className="text-2xl font-bold text-center mt-4">Crear Incidencia</h1>
      <div className="flex justify-center items-center h-screen">
        <FormularioIncidencia />
      </div>
      <button>Tocame</button>


    </div>
  )
}

export default CrearIncidencia