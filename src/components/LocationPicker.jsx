
import React, { useState } from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function LocationPicker({ onLocationSelect }) {
  const [showMap, setShowMap] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setSelectedPosition(e.latlng);
        if (onLocationSelect) onLocationSelect(e.latlng);
        setShowMap(false);
      },
    });
    return null;
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => setShowMap(true)}
      >
        📍 Seleccionar en mapa
      </button>
      
      {selectedPosition && (
        <div className="mt-2 text-sm text-gray-600">
          Última selección: {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
        </div>
      )}
      
      {showMap && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ 
            width: "90vw", 
            maxWidth: "600px", 
            height: "70vh", 
            background: "#fff", 
            borderRadius: 8, 
            overflow: "hidden",
            position: "relative"
          }}>
            <button
              type="button"
              style={{ 
                position: "absolute", 
                top: 10, 
                right: 10, 
                zIndex: 1001,
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "8px 12px",
                cursor: "pointer"
              }}
              onClick={() => setShowMap(false)}
            >
              ✕ Cerrar
            </button>
            <MapContainer
              center={[41.9170839926252, -1.2461675913711587]}
              zoom={13}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <LocationMarker />
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationPicker;