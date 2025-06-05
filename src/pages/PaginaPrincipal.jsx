import React from 'react'
import Card from '../components/Card'
function PaginaPrincipal() {
  document.title = "SIL Tauste"


  
  return (
    <div className="flex justify-center items-center sm:mt-25">
      <div className='grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 p-4'>
        


        <Card 
        textoboton="Crear Incidencia"
        urlimagen="/crear-incidencia.jpg" descripcion="Registra una nueva incidencia" 
        navto={"/crear-incidencia"} 
        alt={"Crear Incidencia"} 
        title={"Crear Incidencia"}/>


        <Card 
        descripcion={"Consulta las incidencias registradas"} 
        urlimagen={"/mostrar-incidencias.jpg"} textoboton={"Mostrar Incidencias"} 
        navto={"/incidencia"} 
        alt={"Ver Incidencias"} 
        title={"Mostrar incidencias"}/>


        <Card 
        descripcion={"Consulta las implicaciones en incidencias"}
        urlimagen="/personas.jpg" textoboton="Personas y vehiculos" 
        navto={"/personas"} 
        alt={"Personas"} title={"Personas y vehiculos"}/>


        <Card 
        descripcion={"Visualiza incidencias en el mapa"} 
        urlimagen={"mapa-tauste.png"} textoboton={"Mapa dinamico"}
        navto={"/mapa"} 
        alt={"Mapa"} 
        title={"Mapa dinamico"}/>


        <Card 
        descripcion={"Consulta el estado de las incidencias"} 
        urlimagen={"estadisticas.jpg"} textoboton={"Estadisticas"} 
        navto={"/estadisticas"} 
        alt={"Estadisticas"} 
        title={"Estadisticas"}/>


        <Card 
        descripcion={"Cambia tus credenciales y elige un avatar"} 
        urlimagen={"gestion-de-usuario.jpeg"} 
        textoboton={"Gestion de usuario"}
        navto={"/perfil"} 
        alt={"Gestion de usuario"} 
        title={"Gestion de usuario"}/>
      </div>
    </div>
  )
}

export default PaginaPrincipal