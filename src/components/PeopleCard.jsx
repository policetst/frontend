import React from 'react';
import { Link } from 'react-router-dom';
import { IdCard, Phone, CarFront, Users } from 'lucide-react';

function PeopleCard({ dni, first_name, last_name1, last_name2, phone_number }) {
  return (
    <div className="bg-white shadow-md rounded-sm overflow-hidden border hover:shadow-md transition">
      
        {/* Cabecera */}
        <div className="bg-[#00336d] text-white px-4 py-1 mb-3">
            <h3 className="text-xl font-bold">{first_name}</h3>
            <p className="text-sm">{last_name1} {last_name2}</p>
        </div>

        {/* DNI y teléfono */}
        <div className="flex justify-between text-gray-700 text-sm mb-2 px-4">
            <p className="flex items-center gap-2">
                <IdCard className="w-4 h-4" /> {dni}
            </p>
            <p className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> {phone_number}
            </p>
        </div>

        {/* Personas relacionadas y vehículos */}
        <div className="flex justify-between text-gray-700 text-sm mb-5 px-4">
            <p className="flex items-center gap-2">
                <Users className="w-4 h-4" /> 10
            </p>
            <p className="flex items-center gap-2">
                <CarFront className="w-4 h-4" /> 8
            </p>
        </div>

        {/* Boton para editar personas */}
        <div className="px-4">
            <button
            type="submit"
            className="w-full h-8 bg-[#00336d] text-white rounded-sm hover:bg-[#0092CA] transition mb-5"
            >Editar
            </button>
        </div>
    </div>
  );
}

export default PeopleCard;