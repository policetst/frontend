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
        className="px-4 py-2 min-h-[4px] touch-manipulation text-sm sm:text-base
        bg-[#002856] text-white rounded border
        hover:bg-gray-300 hover:text-black hover:border-[#002856]
        active:bg-gray-100 active:text-black  active:border-gray-800"
        onClick={() => setShowMap(true)}
      >
      Seleccionar ubicación
      </button>
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-2">
          <div className="w-full max-w-4xl h-[85vh] sm:h-[80vh] bg-white rounded-lg overflow-hidden relative shadow-xl">
            <div className="absolute top-2 right-2 z-[1001]">
              <button
                type="button"
                className="bg-red-500 hover:bg-red-600 text-white border-none rounded px-3 py-2 text-sm font-medium min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                onClick={() => setShowMap(false)}
              >
                ✕ Cerrar
              </button>
            </div>
            <div className="w-full h-full">
              <MapContainer
                center={marker}
                zoom={13}
                style={{ width: "100%", height: "100%" }}
                className="z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <LocationMarker />
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationPicker;