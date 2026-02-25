import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Search, X } from "lucide-react";

function parseCoords(value) {
  if (!value) return [41.9170839926252, -1.2461675913711587];
  const [lat, lng] = value.split(",").map(Number);
  if (isNaN(lat) || isNaN(lng)) return [41.9170839926252, -1.2461675913711587];
  return [lat, lng];
}

// Componente para actualizar el centro del mapa
function MapUpdater({ center, marker }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    } else if (marker) {
      map.setView(marker, map.getZoom());
    }
  }, [center, marker, map]);
  return null;
}

function LocationPicker({ value, onLocationSelect }) {
  const [showMap, setShowMap] = useState(false);
  const [marker, setMarker] = useState(parseCoords(value));
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);
  const searchTimeoutRef = useRef(null);

  // Sincroniza el marcador si cambia el valor externo
  useEffect(() => {
    setMarker(parseCoords(value));
  }, [value]);

  // Búsqueda con debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&limit=5&countrycodes=es`
        );
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error("Error searching location:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleResultClick = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setMarker([lat, lng]);
    setMapCenter([lat, lng]);
    if (onLocationSelect) {
      onLocationSelect({ lat, lng });
    }
    setSearchQuery("");
    setSearchResults([]);
  };

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
            {/* Botón cerrar */}
            <div className="absolute top-2 right-2 z-[1001]">
              <button
                type="button"
                className="bg-red-500 hover:bg-red-600 text-white border-none rounded px-3 py-2 text-sm font-medium min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                onClick={() => setShowMap(false)}
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Buscador de ubicaciones */}
            <div className="absolute top-2 left-2 z-[1001] w-[calc(100%-120px)] sm:w-96">
              <div className="bg-white rounded shadow-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar dirección o lugar..."
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Resultados de búsqueda */}
                {searchResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto border-t border-gray-200">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleResultClick(result)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-sm">{result.display_name}</div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Indicador de búsqueda */}
                {isSearching && (
                  <div className="px-4 py-2 text-sm text-gray-500 border-t border-gray-200">
                    Buscando...
                  </div>
                )}

                {/* Sin resultados */}
                {!isSearching && searchQuery.trim().length >= 3 && searchResults.length === 0 && (
                  <div className="px-4 py-2 text-sm text-gray-500 border-t border-gray-200">
                    No se encontraron resultados
                  </div>
                )}
              </div>
            </div>

            {/* Mapa */}
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
                <MapUpdater center={mapCenter} marker={marker} />
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationPicker;