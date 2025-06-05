import React from 'react';
import { Link } from 'react-router-dom';
import { CarFront, PencilLine, SwatchBook, IdCard } from 'lucide-react';

function VehicleCard({ brand, model, color, license_plate }) {
  return (
    <div className="max-w-[350px] bg-white border border-gray-300 rounded px-4 py-2 shadow-sm hover:shadow-md transition gap-4">

      {/* Marca, modelo y botón */}
      <div className="flex flex-grow">

        {/* Marca y modelo */}
        <div className="mb-flex flex-col flex-1">
          <h3 className="text-lg font-bold text-gray-900">{brand}</h3>
          <p className="text-sm text-gray-600 flex gap-1">
            <span>{model}</span>
            </p>
        </div>

        {/* Botón para editar vehiculo */}
        <div className="flex flex-col justify-center items-end flex-grow-0">
          <Link
          to={`/editarvehiculo/${license_plate}`}
          className="text-blue-600 hover:text-blue-800"
          >
          <PencilLine className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <hr className="border-t border-gray-300 my-2"/>

        
      {/* Matricula y color */}
      <div className="flex justify-between">
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <CarFront className="w-4 h-4 text-gray-600" />
          <span>{license_plate}</span>
        </p>
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <SwatchBook className="w-4 h-4 text-violet-700" />
          <span>{color}</span>
        </p>
      </div>
        
    </div>

  );
}

export default VehicleCard;


 
//     <div className="bg-white shadow-md rounded-sm overflow-hidden border hover:shadow-md transition">
//         Cabecera
//         <div className="bg-[#1E3A8A] py-1 mb-3">
//             <h3 className="pl-4 text-xl text-white font-bold">{first_name}</h3>
//             <p className="pl-4 text-sm text-gray-200">{last_name1} {last_name2}</p>
//         </div>

//         DNI y personas
//         <div className="flex justify-between text-gray-800 text-sm mb-2 px-4">
//             <p className="flex items-center gap-2">
//                 <IdCard className="w-4 h-4" aria-label="DNI" />
//                 <span>{dni}</span>
//             </p>
//             <p className="flex items-center gap-2">
//                 <Users className="w-4 h-4" aria-label="Personas relacionadas" />
//                 <span>10</span>
//             </p>
//         </div>

//         Teléfono y vehículos
//         <div className="flex justify-between text-gray-800 text-sm mb-5 px-4">
//             <p className="flex items-center gap-2">
//                 <Phone className="w-4 h-4" aria-label="Teléfono" />
//                 <span>{phone_number}</span>
//             </p>
//             <p className="flex items-center gap-2">
//                 <CarFront className="w-4 h-4" aria-label="Vehículos" />
//                 <span>8</span>
//             </p>
//         </div>

//         Botón para editar personas
//         <div className="px-4">
//             <button
//                 type="submit"
//                 className="w-full h-8 bg-[#3B82F6] text-white rounded-sm hover:bg-[#1E40AF] transition mb-4"
//                 >
//                 Editar
//             </button>
//         </div>
//     </div> */}

