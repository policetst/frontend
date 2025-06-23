import React, { useEffect, useState } from 'react';
import VehicleCard from '../components/VehicleCard';
import PeopleCard from '../components/PeopleCard'; 
import { CarFront, Users, Search } from 'lucide-react';

function Vehiculos() {
  document.title = "SIL Tauste - Vehículos";

  const [vehicles, setVehicles] = useState([]);
  const [people, setPeople] = useState([]);
  const [showVehicles, setShowVehicles] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('https://arbadev-back-joq0.onrender.com/vehicles') 
      .then(res => res.json())
      .then(data => data.ok ? setVehicles(data.data) : console.error('Error al obtener vehículos:', data.message))
      .catch(err => console.error('Error de red al obtener vehículos:', err));

    fetch('https://arbadev-back-joq0.onrender.com/people') 
      .then(res => res.json())
      .then(data => data.ok ? setPeople(data.data) : console.error('Error al obtener personas:', data.message))
      .catch(err => console.error('Error de red al obtener personas:', err));
  }, []);

  // Filtrar vehículos
  const filteredVehicles = vehicles.filter((v) =>
    `${v.brand} ${v.model} ${v.color} ${v.license_plate}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrar personas
  const filteredPeople = people.filter((p) =>
    `${p.first_name} ${p.last_name1} ${p.last_name2} ${p.dni} ${p.phone_number}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex justify-center">
      <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] space-y-10 text-gray-800">

        {/* Titulo en escritorio o tablet */}
        <div className="hidden xl:block">
          <h2 className="text-2xl font-bold">Personas y vehiculos</h2>
          <hr className="border-t border-gray-300 my-4"/>
        </div>
        {/* Titulo en móviles */}
        <div className="block xl:hidden">
          <h2 className="text-2xl font-bold flex justify-center">Personas y vehiculos</h2>
          <hr className="border-t border-gray-300 my-4"/>
        </div>

        {/* Botones de conmutación */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setShowVehicles(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md border transition ${
              !showVehicles ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4" /> Personas
          </button>
          <button
            onClick={() => setShowVehicles(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md border transition ${
              showVehicles ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
            }`}
          >
            <CarFront className="w-4 h-4" /> Vehículos
          </button>
        </div>

        {/* Campo de búsqueda */}
        <div className="flex items-center gap-2 px-2">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder={`Buscar en ${showVehicles ? 'vehículos' : 'personas'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
            
        {/* Personas */}
        {!showVehicles && (
          <div>
            <h2 className="text-2xl font-bold text-center xl:text-left">Personas</h2>
            <hr className="border-t border-gray-300 mt-4 mb-6" />
            <div className="grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 gap-6 ml-2.5 sm:ml-0">
              {filteredPeople.map((persona) => (
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
        )}

        {/* Vehículos */}
        {showVehicles && (
          <div>
            <h2 className="text-2xl font-bold text-center xl:text-left">Vehículos</h2>
            <hr className="border-t border-gray-300 mt-4 mb-6"/>
            <div className="grid lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 gap-6 ml-2.5 sm:ml-0">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.license_plate}
                  brand={vehicle.brand}
                  model={vehicle.model}
                  color={vehicle.color}
                  license_plate={vehicle.license_plate}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Vehiculos;
