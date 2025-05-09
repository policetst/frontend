import React from 'react'
import { Link } from 'react-router-dom'

function Card({textoboton,urlimagen,descripcion, navto, alt, title}) {
  return (
    <div>
                           <div className="card p-2 border-1 rounded-[4px]">
                        <img className="w-full h-auto rounded-t-xl md:rounded-t-md " src={urlimagen}
                            alt={alt}/>
                        <div class="card-body">
                            <h3 class="text-lg font-bold text-default-800">{title}</h3>
                            <p class="mt-1 text-default-500">
                                {descripcion}
                            </p>
                            <a class="m-[5px] rounded-2xl btn p-1 bg-blue-500 text-white" href={navto}>
                                {textoboton}
                            </a>
                        </div>
                    </div>
    </div>
  )
}

export default Card