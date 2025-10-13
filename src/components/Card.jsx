import React from 'react';
import { Link } from 'react-router-dom'; //* link its a react co,mponent that allows us to navigate between pages without reloading the page

function Card({ textoboton, urlimagen, descripcion, navto, alt, title }) { //* desestructuring props to get the values of the props
  return (
    <div className="w-80 bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Imagen */}
      <img
        className="w-full h-48 object-cover"
        src={urlimagen}
        alt={alt}
      />
      {/* Contenido de la carta*/}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <p className="mt-2 text-gray-600">{descripcion}</p>
        <div className="flex justify-center">
          <Link
            to={navto}
            className="inline-block text-center mt-5 px-6 py-2 w-50 
            bg-[#002856] text-white rounded border
            hover:bg-gray-300 hover:text-black hover:border-[#002856]
            active:bg-gray-100 active:text-black  active:border-gray-800">
            {textoboton}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Card;
