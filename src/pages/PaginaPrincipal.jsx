import React from 'react'
import Card from '../components/Card'
function PaginaPrincipal() {


  // ...existing code...
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-300 p-2">
      <div className='grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 p-4'>
        <Card descripcion={"Consulta las personas implicadas en incidencias"} urlimagen="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.DhFT-QL6-WLs2vyf-ArFtgHaE8%26pid%3DApi&f=1&ipt=bf29d4f88cbe3b2fd50059c0da30256201a3ab7c16a1a3092891ac1f871b739f&ipo=images" textoboton="Personas" navto={"/#/personas"} alt={"Personas"} title={"Personas"}/>


        <Card textoboton="Crear Incidencia" urlimagen="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.iEXABJMUwHti9YTZf1sVrgHaE8%26pid%3DApi&f=1&ipt=7098ea595776febec079ba8440501914e973b81258ce8a4b89314990e7075d36&ipo=images" descripcion="Registrar una nueva incidencia" navto={"/#/crear-incidencia"} alt={"Crear Incidencia"} title={"Crear Incidencia"}/>


        <Card descripcion={"Consulta las incidencias registradas"} urlimagen={"https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%3Fid%3DOIP.3nbamuUBt8toupa6O9OUwAHaEw%26pid%3DApi&f=1&ipt=95dccf1ecd3092c5541066175f24d9d9dda449d85953de690fcc746a326a6e1f&ipo=images"} textoboton={"Mostrar Incidencias"} navto={"/#/incidencia"} alt={"Ver Incidencias"} title={"Incidencias"}/>


        <Card descripcion={"Visualizar incidencias en el mapa"} urlimagen={"https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fmapasmurales.es%2Fwp-content%2Fuploads%2F2014%2F02%2Fcallejero_zaragoza.jpg&f=1&nofb=1&ipt=5d7db9bac51a4c9493e9d46cb4823cf416147b9868fa616fe9c75c913d772a1a"} textoboton={"Mapa"} navto={"/#/mapa"} alt={"Mapa"} title={"Mapa"}/>


        <Card descripcion={"Vista general sobre el estado de las incidencias"} urlimagen={"https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.bmAJ437ej7rTDfmkP4InuwHaHa%26pid%3DApi&f=1&ipt=50c754531ff843e5d335160a2ac13bdf2ca2b9e7a4e90b585ca49d42e1b1a0ee&ipo=images"} textoboton={"Estadisticas"} navto={"/#/estadisticas"} alt={"Estadisticas"} title={"Estadisticas"}/>


        <Card descripcion={"Cambia tus credenciales y elige un avatar"} urlimagen={"https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpng.pngtree.com%2Fpng-vector%2F20190307%2Fourlarge%2Fpngtree-vector-user-management-icon-png-image_780446.jpg&f=1&nofb=1&ipt=ad6e5a9ac735a3c0a74f6ab55e24dfea8a16067aa3d7c3d6cd573955b1ba543f"} textoboton={"Gestion de usuario"} navto={"/#/perfil"} alt={"Gestion de usuario"} title={"Perfil"}/>
      </div>
    </div>
  )
}

export default PaginaPrincipal