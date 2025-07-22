import React from 'react';
import { Link } from 'react-router-dom';
import { IdCard, Phone, Users, PencilLine } from 'lucide-react';

function PeopleCard({ dni, first_name, last_name1, last_name2, phone_number }) {
  return (
    <div className="max-w-[350px] bg-white border border-gray-300 rounded px-4 py-2 shadow-sm hover:shadow-md transition gap-4">
      
      <div className="flex flex-grow">

        {/* Nombre y apellidos */}
        <div className="flex flex-col flex-1">
            <h3 className="text-lg font-bold text-gray-900">{first_name}</h3>
            <p className="text-sm text-gray-600 flex gap-1">
            <span>{last_name1}</span>
            <span>{last_name2}</span>
            </p>
        </div>

        {/* Botón para editar persona */}
        <div className="flex flex-col justify-center items-end flex-grow-0">
            <Link
            to={`/editarpersona/${dni}`}
            className="text-blue-600 hover:text-blue-800"
            >
            <PencilLine className="w-4 h-4" />
            </Link>
        </div>
      </div>
      <hr className="border-t border-gray-300 my-2"/>

      {/* DNI y teléfono */}
      <div className="flex justify-between">
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <Phone className="w-4 h-4 text-green-600" />
          <span>{phone_number}</span>
        </p>
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <IdCard className="w-4 h-4 text" />
          <span>{dni}</span>
        </p>
      </div>

      
    </div>
  );
}

export default PeopleCard;
