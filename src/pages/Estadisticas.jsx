import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Estadisticas() {
  const data = [
    { id: 1, tipo: 'Animales', count: 5 },
    { id: 2, tipo: 'Trafico', count: 3 },
    { id: 3, tipo: 'Colaboracion ciudadana', count: 9 },
  ];

  return (
    <div>
      <div className="hidden md:block">
        <h2 className="text-2xl font-bold mt-4 ml-15">Estadisticas</h2>
      </div>
      {/* Titulo en moviles */}
      <div className="block md:hidden">
        <h2 className="text-2xl font-bold flex justify-center">Estadisticas</h2>
      </div>
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tipo" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" name="Cantidad" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div>
        {data.map((item) => (
          <div key={item.id} className="bg-white shadow-lg rounded-md p-4 mb-4 w-[150px]">
            <h2 className="text-lg font-semibold">{item.tipo}</h2>
            <p className="text-gray-600">Total: {item.count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Estadisticas;