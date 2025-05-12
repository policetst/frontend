import React, { useState } from 'react';

function Mapa() {
  const [search, setSearch] = useState('');

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Mapa Page</h1>
      <input
        type="text"
        placeholder="Buscar por número de incidencia"
        value={search}
        onChange={handleSearchChange}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="mt-6">
        <iframe
          src="https://www.google.com/maps/d/embed?mid=1GJ5J5J5J5J5J5J5J5J5J5J5J5J5"
          width="100%"
          height="500"
          title="Mapa de España"
          className="border rounded-md"
        ></iframe>
      </div>
    </div>
  );
}

export default Mapa;