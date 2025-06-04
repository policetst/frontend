import React from 'react';
import { Link } from 'react-router-dom';
import { IdCard, Phone, CarFront, Users } from 'lucide-react';

function PeopleCard({ dni, first_name, last_name1, last_name2, phone_number }) {
  return (
    <div className="bg-white shadow-md rounded-sm overflow-hidden border hover:shadow-md transition">
        {/* Cabecera */}
        <div className="bg-[#1E3A8A] py-1 mb-3">
            <h3 className="pl-4 text-xl text-white font-bold">{first_name}</h3>
            <p className="pl-4 text-sm text-gray-200">{last_name1} {last_name2}</p>
        </div>

        {/* DNI y personas */}
        <div className="flex justify-between text-gray-800 text-sm mb-2 px-4">
            <p className="flex items-center gap-2">
                <IdCard className="w-4 h-4" aria-label="DNI" />
                <span>{dni}</span>
            </p>
            <p className="flex items-center gap-2">
                <Users className="w-4 h-4" aria-label="Personas relacionadas" />
                <span>10</span>
            </p>
        </div>

        {/* Teléfono y vehículos */}
        <div className="flex justify-between text-gray-800 text-sm mb-5 px-4">
            <p className="flex items-center gap-2">
                <Phone className="w-4 h-4" aria-label="Teléfono" />
                <span>{phone_number}</span>
            </p>
            <p className="flex items-center gap-2">
                <CarFront className="w-4 h-4" aria-label="Vehículos" />
                <span>8</span>
            </p>
        </div>

        {/* Botón para editar personas */}
        <div className="px-4">
            <button
                type="submit"
                className="w-full h-8 bg-[#3B82F6] text-white rounded-sm hover:bg-[#1E40AF] transition mb-4"
                >
                Editar
            </button>
        </div>
    </div>

  );
}

export default PeopleCard;