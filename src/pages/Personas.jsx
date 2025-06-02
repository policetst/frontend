import React, { useEffect, useState } from 'react';
import PeopleCard from '../components/PeopleCard';

function Personas() {
  document.title = "SIL Tauste - Personas";

  const [people, setPeople] = useState([]);

  // Llamar a la API al cargar
  useEffect(() => {
    fetch('http://localhost:4000/people') // asegúrate de que esta URL apunte a tu backend correctamente
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setPeople(data.data);
        } else {
          console.error('Error al obtener personas:', data.message);
        }
      })
      .catch(err => {
        console.error('Error de red:', err);
      });
  }, []);

  return (
    <div>
      <div className="flex justify-center">
        <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] space-y-8 text-gray-800">

          {/* Titulo en escritorio o tablet */}
          <div className="hidden xl:block">
            <h2 className="text-2xl font-bold">Personas</h2>
            <hr className="border-t border-gray-300 my-4"/>
          </div>
          {/* Titulo en móviles */}
          <div className="block xl:hidden">
            <h2 className="text-2xl font-bold flex justify-center">Personas</h2>
            <hr className="border-t border-gray-300 my-4"/>
          </div>

          {/* Tarjetas */}
          <div className='grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-1 gap-6'>
            {people.map((persona) => (
              <PeopleCard 
                key={persona.dni}
                dni={persona.dni}
                first_name={persona.first_name}
                last_name1={persona.last_name1}
                last_name2={persona.last_name2}
                phone_number={persona.phone_number}
              />
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default Personas;
