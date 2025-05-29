import React from 'react';

function Personas() {
  document.title = "SIL Tauste - Personas de Interés";
  const people = [
    { id: 1, name: "Juan Pérez", phone: "123456789", incidencias: 3, vehiculos: 1, dni: "12345678A" },
    { id: 2, name: "María López", phone: "987654321", incidencias: 5, vehiculos: 2, dni: "23456789B" },
    { id: 2, name: "María López", phone: "987654321", incidencias: 5, vehiculos: 2, dni: "23456789B" },
    { id: 3, name: "Carlos García", phone: "456789123", incidencias: 2, vehiculos: 0, dni: "34567890C" },
    { id: 4, name: "Ana Martínez", phone: "321654987", incidencias: 4, vehiculos: 1, dni: "45678901D" },
    { id: 5, name: "Luis Fernández", phone: "654321789", incidencias: 1, vehiculos: 3, dni: "56789012E" },
    { id: 6, name: "Laura Sánchez", phone: "789123456", incidencias: 0, vehiculos: 0, dni: "67890123F" },
    { id: 7, name: "Pedro Gómez", phone: "159753486", incidencias: 2, vehiculos: 1, dni: "78901234G" },
    { id: 8, name: "Sofía Torres", phone: "753159864", incidencias: 3, vehiculos: 2, dni: "89012345H" },
    { id: 9, name: "Javier Ramírez", phone: "951753852", incidencias: 4, vehiculos: 0, dni: "90123456I" },
    { id: 10, name: "Isabel Díaz", phone: "852963741", incidencias: 1, vehiculos: 1, dni: "01234567J" },
    { id: 11, name: "Fernando Ruiz", phone: "369258147", incidencias: 5, vehiculos: 2, dni: "12345678K" },
    { id: 12, name: "Clara Morales", phone: "147258369", incidencias: 0, vehiculos: 0 },
    { id: 13, name: "Diego Castro", phone: "258369147", incidencias: 3, vehiculos: 1 },
  ];

  return (
    <div className="p-4">
      <h3 className="text-2xl font-bold mb-6">Personas de Interés</h3>
      <input
        type="text"
        placeholder="Buscar por nombre"
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {people.map((person) => (
          <div
            key={person.id}
            className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-between"
          >
            <h4 className="text-lg font-bold text-gray-800">{person.name}</h4>
            <p className="text-sm text-gray-600">DNI: {person.dni}</p>
            <p className="text-sm text-gray-600">Teléfono: {person.phone}</p>
            <p className="text-sm text-gray-600">Incidencias: {person.incidencias}</p>
            <p className="text-sm text-gray-600">Vehículos: {person.vehiculos}</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
              Editar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Personas;