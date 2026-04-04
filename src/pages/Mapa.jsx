import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getIncidents } from '../funcs/Incidents';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { getIconByType } from '../utils/iconByType';

function Mapa() {
  document.title = 'SIL Tauste - Mapa';

  const [search, setSearch] = useState('');
  const [incidents, setIncidents] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');

  const [addressSearch, setAddressSearch] = useState("");
  const [addressResults, setAddressResults] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const searchTimeoutRef = useRef(null);
  const mapRef = useRef(null);
  const flyingTimeoutRef = useRef(null);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (addressSearch.trim().length < 3) {
      setAddressResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearchingAddress(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            addressSearch
          )}&limit=5&countrycodes=es`
        );
        const data = await response.json();
        setAddressResults(data);
      } catch (error) {
        console.error("Error searching location:", error);
        setAddressResults([]);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [addressSearch]);

  const handleAddressSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 17);
    }
    setAddressSearch("");
    setAddressResults([]);
  };

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

  const lowerSearch = search.toLowerCase();
  const filteredIncidents = incidents.filter(i => {
    const matchType = (selectedType === '' || i.type === selectedType);
    if (!matchType) return false;

    // Filter by Date (From - To)
    const incDate = i.creation_date ? i.creation_date.split('T')[0] : '';
    const matchStartDate = (filtroFechaInicio === '' || incDate >= filtroFechaInicio);
    const matchEndDate = (filtroFechaFin === '' || incDate <= filtroFechaFin);
    if (!matchStartDate || !matchEndDate) return false;

    // Filter by text search
    if (search.trim() === '') return true;
    const inCode = i.code?.toString().toLowerCase().includes(lowerSearch);
    const inDesc = i.description?.toLowerCase().includes(lowerSearch);
    const inJSON = JSON.stringify(i).toLowerCase().includes(lowerSearch);

    return inCode || inDesc || inJSON;
  });

  useEffect(() => {
    if (flyingTimeoutRef.current) clearTimeout(flyingTimeoutRef.current);
    
    if (search.trim().length > 0 && filteredIncidents.length > 0 && mapRef.current) {
      flyingTimeoutRef.current = setTimeout(() => {
        const lats = [];
        const lngs = [];
        filteredIncidents.forEach(inc => {
          if (!inc.location) return;
          const parts = inc.location.split(',');
          if (parts.length === 2) {
            const lat = parseFloat(parts[0]);
            const lng = parseFloat(parts[1]);
            if (!isNaN(lat) && !isNaN(lng)) {
              lats.push(lat);
              lngs.push(lng);
            }
          }
        });

        if (lats.length === 1) {
           mapRef.current.flyTo([lats[0], lngs[0]], 17);
        } else if (lats.length > 1 && lats.length <= 15) {
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);
          
          if (minLat === maxLat && minLng === maxLng) {
            mapRef.current.flyTo([minLat, minLng], 17);
          } else {
            const latDiff = maxLat - minLat;
            const lngDiff = maxLng - minLng;
            if (latDiff < 0.04 && lngDiff < 0.04) {
              const pad = 0.002;
              mapRef.current.flyToBounds([
                [minLat - pad, minLng - pad],
                [maxLat + pad, maxLng + pad]
              ]);
            }
          }
        }
      }, 600);
    }
    
    return () => {
      if (flyingTimeoutRef.current) clearTimeout(flyingTimeoutRef.current);
    };
  }, [search, filteredIncidents]);

  return (
    <div>
      <div className="flex justify-center">
        <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] space-y-6 text-gray-800">

          {/* Titulo */}
          <div className="hidden xl:block">
              <h2 className="text-2xl font-bold">Mapa Operativo</h2>
              <hr className="border-t border-gray-300 my-4"/>
          </div>
          <div className="block xl:hidden">
              <h2 className="text-2xl font-bold flex justify-center">Mapa Operativo</h2>
              <hr className="border-t border-gray-300 my-4"/>
          </div>

          {/* Panel de Filtros */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Buscar por ID, descripcion o palabras clave..."
                value={search}
                onChange={handleSearchChange}
                className="flex-1 p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002856] text-sm"
              />

              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Buscar dirección en el mapa para centrar..."
                  value={addressSearch}
                  onChange={(e) => setAddressSearch(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002856] text-sm h-full"
                />
                {addressSearch && (
                  <button
                    type="button"
                    onClick={() => { setAddressSearch(""); setAddressResults([]); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    ✕
                  </button>
                )}
                
                {(addressResults.length > 0 || isSearchingAddress) && (
                  <div className="absolute top-[100%] left-0 right-0 z-[1000] mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto w-full">
                    {isSearchingAddress ? (
                      <div className="p-3 text-sm text-gray-500">Buscando...</div>
                    ) : (
                      addressResults.map((res, i) => (
                        <div 
                          key={i} 
                          onClick={() => handleAddressSelect(res)}
                          className="p-3 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0 border-gray-200"
                        >
                          {res.display_name}
                        </div>
                      ))
                    )}
                    {!isSearchingAddress && addressResults.length === 0 && addressSearch.trim().length >= 3 && (
                      <div className="p-3 text-sm text-gray-500">No se encontraron calles.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 flex gap-2 items-center">
                <span className="text-sm font-bold text-gray-600">Desde:</span>
                <input 
                  type="date"
                  value={filtroFechaInicio}
                  onChange={(e) => setFiltroFechaInicio(e.target.value)}
                  className="flex-1 p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002856] text-sm"
                />
              </div>
              <div className="flex-1 flex gap-2 items-center">
                <span className="text-sm font-bold text-gray-600">Hasta:</span>
                <input 
                  type="date"
                  value={filtroFechaFin}
                  onChange={(e) => setFiltroFechaFin(e.target.value)}
                  className="flex-1 p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002856] text-sm"
                />
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="flex-1 p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#002856] text-sm bg-white"
              >
                <option value="">Todos los Tipos</option>
                {[...new Set(incidents.map(i => i.type))].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider text-right">
              Mostrando {filteredIncidents.length} de {incidents.length} incidencias registradas
            </div>
          </div>

          <div className="w-full h-[700px] border border-gray-400 rounded-lg relative z-0 overflow-hidden shadow-md">
            <MapContainer
              ref={mapRef}
              center={[41.98, -1.27]}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a> | SIL Tauste'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />

              {filteredIncidents.map((incident) => {
                if (!incident.location) return null;
                const [lat, lng] = incident.location.split(',').map(Number);
                if (isNaN(lat) || isNaN(lng)) return null;

                const icon = getIconByType(incident.type);            

                return (
                  <Marker key={incident.id} position={[lat, lng]} icon={icon} alt={incident.type}>
                    <Popup>
                      <strong>
                        Incidencia{' '}
                        <Link to={`/editincident/${incident.code}`} className="text-blue-600 hover:text-blue-800 underline">
                          {incident.code}
                        </Link>
                      </strong>
                      <br />
                      <span className="font-semibold text-gray-700">{incident.type}</span>
                      <br />
                      {incident.creation_date && (
                         <span className="text-xs text-gray-500">{incident.creation_date.split('T')[0]}</span>
                      )}
                      <br />
                      <div className="mt-1 text-sm">{incident.description}</div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Mapa;

