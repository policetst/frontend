import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getIncidents } from '../funcs/Incidents';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';

function Mapa() {
  document.title = 'SIL Tauste - Mapa';
  const [search, setSearch] = useState('');
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const fetchIncidents = async () => {
      const data = await getIncidents();
      setIncidents(data.incidents || []);
    };
    fetchIncidents();
  }, []);
  console.log('incidents', incidents);
  

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const filteredIncidents = incidents.filter(i =>
    i.code.toString().includes(search)
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mt-4 text-center">Mapa</h2>

      <input
        type="text"
        placeholder="Buscar por número de incidencia"
        value={search}
        onChange={handleSearchChange}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
      />

      <div className="mt-6 h-[500px] w-full">
        <MapContainer center={[41.98, -1.27]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredIncidents.map((incident) => {
            const [lat, lng] = incident.location.split(',').map(Number);
            const isValidCoords = !isNaN(lat) && !isNaN(lng);
            if (!isValidCoords) {
              return <p key={incident.id} className="text-red-500">Coordenadas inválidas: {incident.location}</p>;
            }
            return (
              <Marker key={incident.id} position={[lat, lng]} icon={new L.Icon({
                iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
                shadowSize: [41, 41]
              })}>
                <Popup>
                  <strong>Incidencia <Link to={`http://localhost:5173/editincident/${incident.code}`}>{incident.code}</Link></strong><br />
                  {incident.description}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

export default Mapa;
