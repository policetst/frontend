import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function parseCoords(value) {
  if (!value) return [41.9170839926252, -1.2461675913711587];
  const [lat, lng] = value.split(",").map(Number);
  if (isNaN(lat) || isNaN(lng)) return [41.9170839926252, -1.2461675913711587];
  return [lat, lng];
}

function LocationPicker({ value, onLocationSelect }) {
  const [showMap, setShowMap] = useState(false);
  const [marker, setMarker] = useState(parseCoords(value));

  // Sincroniza el marcador si cambia el valor externo
  useEffect(() => {
    setMarker(parseCoords(value));
  }, [value]);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setMarker([e.latlng.lat, e.latlng.lng]);
        if (onLocationSelect) onLocationSelect(e.latlng);
        setShowMap(false);
      },
    });
    return marker ? <Marker position={marker} /> : null;
  }

  return (
    <div className="mt-1">
      <button
        type="button"
        className="bg-blue-900 text-white border rounded-sm px-4 py-2 hover:bg-cyan-600"
        onClick={() => setShowMap(true)}
      >
      Seleccionar ubicación
      </button>
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
              center={marker}
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