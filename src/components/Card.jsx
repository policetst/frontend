import React from 'react';
import { Link } from 'react-router-dom'; //* link its a react co,mponent that allows us to navigate between pages without reloading the page

function Card({ textoboton, urlimagen, descripcion, navto, alt, title }) { //* desestructuring props to get the values of the props
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
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
        <Link
          to={navto}
          className="inline-block mt-4 px-6 py-2 bg-[#002856] text-white rounded hover:bg-[#0092CA] active:bg-[#2374FF]">
          {textoboton}
        </Link>
      </div>
    </div>
  );
}

export default Card;
/* <div class="card">
                        <img class="w-full h-auto rounded-t-xl" src="assets/images/small/img-4.jpg"
                            alt="Image Description">
                        <div class="card-body">
                            <h3 class="text-lg font-bold text-default-800">Card title</h3>
                            <p class="mt-1 text-default-500">
                                Some quick example text to build on the card title and make up the bulk of the
                                card's
                                content.
                            </p>
                            <a class="mt-2 btn bg-primary text-white" href="#">
                                Go somewhere
                            </a>
                        </div>
                    </div>*/