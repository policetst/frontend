import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function Mapview({ chords }) {
  // Separar y convertir a número
  const [latStr, lngStr] = chords.split(',');
  const lat = Number(latStr);
  const lng = Number(lngStr);

  // Verificación básica de validez
  const isValidCoords = !isNaN(lat) && !isNaN(lng);

  if (!isValidCoords) {
    return <p className="text-red-500">Coordenadas inválidas: {chords}</p>;
  }

  const position = [lat, lng];

  return (
    <div className="mt-4">
      <div className="h-64 w-full rounded-xl overflow-hidden shadow">
        <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{ height: "100%", width: "100%", zIndex: 0 }}>
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              Ubicación de la incidencia
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}

export default Mapview;
