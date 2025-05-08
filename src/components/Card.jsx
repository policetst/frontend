import React from 'react'
import { Link } from 'react-router-dom'

function Card({textoboton,urlimagen,descripcion, navto, alt}) {
  return (
    <div>
        <div className='flex flex-col items-center gap-6 p-7 rounded-[4px] border-1 w-[240px] py-[1px] shadow-2xl mt-4'>
            <img src={urlimagen} alt={alt} className='rounded-[3px] mt-2'/>
            <Link className='bg-blue-500 mt-4 rounded-[6px] p-[4px] hover:bg-blue-700 text-white p-[]' to={navto}>{textoboton}</Link>
            <p className='mb-[6px]'>{descripcion}</p>
        </div>
    </div>
  )
}

export default Card