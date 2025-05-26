import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getIncidents } from '../funcs/Incidents';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { getIconByType } from '../utils/iconByType';
import L from 'leaflet';

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
        <MapContainer
          center={[41.98, -1.27]}
          zoom={13}
          scrollWheelZoom={true}
          style={{
            height: '100%',
            width: '100%',
            zIndex: 0,
            borderRadius: '0.5rem',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredIncidents.map((incident) => {
            const [lat, lng] = incident.location.split(',').map(Number);
            if (isNaN(lat) || isNaN(lng)) return null;

            const icon = getIconByType(incident.type);

            return (
              <Marker key={incident.id} position={[lat, lng]} icon={icon}>
                <Popup>
                  <strong>
                    Incidencia{' '}
                    <Link to={`/editincident/${incident.code}`}>
                      {incident.code}
                    </Link>
                  </strong>
                  <br />
                  <span className="font-semibold">{incident.type}</span>
                  <br />
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
