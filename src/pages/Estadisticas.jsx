import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Estadisticas() {
  const data = [
    { id: 1, tipo: 'Animales', count: 5 },
    { id: 2, tipo: 'Trafico', count: 3 },
    { id: 3, tipo: 'Colaboracion ciudadana', count: 9 },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gráfico de Incidencias</h1>
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
    </div>
  );
}

export default Estadisticas;