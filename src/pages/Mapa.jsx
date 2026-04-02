import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Rectangle, Polygon, Tooltip } from 'react-leaflet';
import { getIncidents } from '../funcs/Incidents';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { getIconByType } from '../utils/iconByType';
import L from 'leaflet';

function Mapa() {
  document.title = 'SIL Tauste - Mapa';

  const cross = (o, a, b) => {
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  };

  const convexHull = (points) => {
    if (points.length < 3) return points;
    const sorted = [...points].sort((a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]);
    const lower = [];
    for (let i = 0; i < sorted.length; i++) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], sorted[i]) <= 0) lower.pop();
        lower.push(sorted[i]);
    }
    const upper = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], sorted[i]) <= 0) upper.pop();
        upper.push(sorted[i]);
    }
    upper.pop();
    lower.pop();
    return lower.concat(upper);
  };

  const [search, setSearch] = useState('');
  const [incidents, setIncidents] = useState([]);
  const [selectedType, setSelectedType] = useState('');

  const [topZonas, setTopZonas] = useState([]);
  const [loadingTop, setLoadingTop] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);

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
            
            // Solo hacemos auto-ajuste si los puntos no están extremadamente separados en la ciudad.
            // Esto evita que al buscar de forma generalizada haga un "zoom out" gigante.
            if (latDiff < 0.04 && lngDiff < 0.04) {
              const pad = 0.002;
              mapRef.current.flyToBounds([
                [minLat - pad, minLng - pad],
                [maxLat + pad, maxLng + pad]
              ]);
            }
          }
        }
      }, 600); // 600ms de retardo para no marear al usuario mientras teclea
    }
    
    return () => {
      if (flyingTimeoutRef.current) clearTimeout(flyingTimeoutRef.current);
    };
  }, [search, filteredIncidents]);

  const calculateTopZonas = async (currentIncidents) => {
    setLoadingTop(true);
    setHasAnalyzed(true);
    
    const groups = {};
    currentIncidents.forEach(inc => {
      const parts = inc.location.split(',');
      if (parts.length !== 2) return;
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (isNaN(lat) || isNaN(lng)) return;

      // Agrupamos inteligentemente por proximidad geográfica (aprox 300-400 metros)
      // Y POR TIPO DE INCIDENCIA para identificar concentraciones específicas de un mismo M.O.
      let addedToCluster = false;
      const mergeDist = 0.004; // Aprox 400m radius

      for (const [key, cluster] of Object.entries(groups)) {
        // Compute distance to cluster center
        const latDiff = Math.abs(cluster.lat - lat);
        const lngDiff = Math.abs(cluster.lng - lng);
        
        // Agrupamos únicamente por cercanía para evitar cuadrantes solapados
        if (latDiff < mergeDist && lngDiff < mergeDist) {
          cluster.count++;
          cluster.points.push([lat, lng]);
          cluster.types[inc.type] = (cluster.types[inc.type] || 0) + 1;
          
          // Mover el centro de gravedad del cluster ligeramente
          cluster.lat = (cluster.lat * (cluster.count - 1) + lat) / cluster.count;
          cluster.lng = (cluster.lng * (cluster.count - 1) + lng) / cluster.count;
          
          addedToCluster = true;
          break;
        }
      }

      if (!addedToCluster) {
        const newKey = `cluster-${lat}-${lng}`;
        groups[newKey] = { lat, lng, count: 1, types: { [inc.type]: 1 }, points: [[lat, lng]] };
      }
    });

    const sortedGroups = Object.values(groups)
      .filter(group => group.count > 1)
      .sort((a, b) => b.count - a.count)
      .slice(0, 25);

    const finalResults = sortedGroups.map((group, idx) => {
      const sortedTypes = Object.entries(group.types).sort((a,b) => b[1] - a[1]);
      const mainTypes = sortedTypes.slice(0, 2).map(t => t[0]).join(' y ');
      return { 
        name: `Sector de ${mainTypes}`, 
        count: group.count, 
        types: group.types, 
        lat: group.lat, 
        lng: group.lng, 
        points: group.points 
      };
    });

    setTopZonas(finalResults);
    setLoadingTop(false);
  };

  useEffect(() => {
    if (incidents.length > 0 && !hasAnalyzed) {
      calculateTopZonas(filteredIncidents);
    }
  }, [incidents, hasAnalyzed]);

  const getRecommendation = (count) => {
    if (count >= 50) return { label: "🔴 CÓDIGO NEGRO - Prioridad Máxima. Aumentar efectivos", color: "bg-red-900 text-white border-red-500", mapColor: "#ef4444" };
    if (count >= 20) return { label: "🟠 RIESGO ALTO - Reforzar vigilancia recurrente", color: "bg-orange-900 text-white border-orange-500", mapColor: "#f97316" };
    if (count >= 5) return { label: "🟡 RIESGO MEDIO - Mantener presencia habitual", color: "bg-yellow-900 text-yellow-100 border-yellow-500", mapColor: "#eab308" };
    return { label: "🔵 RIESGO BAJO - Monitorizar de forma rutinaria", color: "bg-blue-900 text-blue-100 border-blue-500", mapColor: "#3b82f6" };
  };

  const getColorByType = (type) => {
    const colors = {
      'Trafico': '#3b82f6', // blue
      'Animales': '#10b981', // green
      'Ruidos': '#eab308', // yellow
      'Seguridad Ciudadana': '#ef4444', // red
      'Asistencia Colaboración Ciudadana': '#f97316', // orange
      'Ilícito penal': '#8b5cf6', // purple
      'Incidencias Urbanísticas': '#ec4899', // pink
      'Otras incidencias no clasificadas': '#64748b', // slate
      'Juzgados': '#14b8a6', // teal
    };
    return colors[type] || '#94a3b8';
  };

  return (
    <div>
      <div className="flex justify-center">
        <div className="w-full sm:w-3/4 md:w-[750px] lg:w-[960px] xl:w-[960px] space-y-8 text-gray-800">

          {/* Titulo en escritorio o tablet */}
          <div className="hidden xl:block">
              <h2 className="text-2xl font-bold">Mapa</h2>
              <hr className="border-t border-gray-300 my-4"/>
          </div>
          {/* Titulo en móviles */}
          <div className="block xl:hidden">
              <h2 className="text-2xl font-bold flex justify-center">Mapa</h2>
              <hr className="border-t border-gray-300 my-4"/>
          </div>

        <div className="flex flex-col md:flex-row gap-3 w-full mt-4">
          <input
            type="text"
            placeholder="Buscar por ID, descripcion, persona o vehiculo..."
            value={search}
            onChange={handleSearchChange}
            className="flex-1 p-3 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          />

          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar calle o dirección en el mapa..."
              value={addressSearch}
              onChange={(e) => setAddressSearch(e.target.value)}
              className="w-full p-3 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base h-full"
            />
            {addressSearch && (
              <button
                type="button"
                onClick={() => { setAddressSearch(""); setAddressResults([]); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold hover:text-gray-800"
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
          <button 
            type="button" 
            onClick={() => calculateTopZonas(filteredIncidents)}
            className="w-full md:w-auto px-6 py-3 bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-base rounded-md hover:bg-slate-200 shadow-sm transition-all flex items-center justify-center whitespace-nowrap"
          >
            {'Recalcular Análisis'}
          </button>
          <button 
            type="button" 
            onClick={() => setShowHotspots(!showHotspots)}
            className={`w-full md:w-auto px-6 py-3 font-semibold text-base rounded-md shadow-sm transition-all flex items-center justify-center whitespace-nowrap border ${showHotspots ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'}`}
          >
            {showHotspots ? 'Ocultar Cuadrantes' : 'Mostrar Cuadrantes'}
          </button>
        </div>
        
        <select
          value={selectedType}
          onChange={(e) => {
             setSelectedType(e.target.value);
             // When filter changes we might want to let them click btn to recalculate manually
          }}
          className="w-full p-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2 bg-white"
          >
          <option value="">Filtrar por tipo</option>
            {[...new Set(incidents.map(i => i.type))].map(type => (
          <option key={type} value={type}>{type}</option>
          ))}
        </select>


        <div className="flex flex-col lg:flex-row gap-6 mt-6 w-full h-[800px] lg:h-[750px]">
          {/* Mapa a la izquierda */}
          <div className="lg:w-3/4 h-full border border-gray-400 rounded relative z-0">
            <MapContainer
              ref={mapRef}
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
            attribution='&copy; <a href="https://carto.com/">CARTO</a> | SIL Tauste'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* Cuadrantes perimetrales y Áreas calientes por tipo */}
          {showHotspots && topZonas.map((zona, idx) => {
            const rec = getRecommendation(zona.count);
            
            const pad = 0.00015;
            let polyPoints = [];
            if (zona.points.length < 3) {
              const boundsLat = zona.points[0] ? zona.points[0][0] : zona.lat;
              const boundsLng = zona.points[0] ? zona.points[0][1] : zona.lng;
              polyPoints = [
                [boundsLat - pad, boundsLng - pad],
                [boundsLat + pad, boundsLng - pad],
                [boundsLat + pad, boundsLng + pad],
                [boundsLat - pad, boundsLng + pad]
              ];
            } else {
              const hull = convexHull(zona.points);
              const centerLat = hull.reduce((sum, p) => sum + p[0], 0) / hull.length;
              const centerLng = hull.reduce((sum, p) => sum + p[1], 0) / hull.length;
              
              polyPoints = hull.map(p => {
                const latDiff = p[0] - centerLat;
                const lngDiff = p[1] - centerLng;
                return [p[0] + latDiff * 0.1, p[1] + lngDiff * 0.1]; // 10% outward expansion para que abrace los puntos holgadamente
              });
            }

            // Identificar el tipo principal
            const sortedTypes = Object.entries(zona.types).sort((a,b) => b[1] - a[1]);
            const topType = sortedTypes.length > 0 ? sortedTypes[0][0] : null;

            return (
              <Polygon 
                key={`quadrant-${idx}`}
                positions={polyPoints} 
                pathOptions={{ 
                  color: rec.mapColor, 
                  fillColor: rec.mapColor, 
                  fillOpacity: 0.1, 
                  weight: 3, 
                  className: 'animate-pulse'
                }}
              >
                <Tooltip direction="top" opacity={0.9}>
                  <div className="min-w-[150px] max-w-[200px]">
                    <div className="font-bold text-sm text-center mb-1 pb-1 border-b border-gray-200">
                      {zona.name}
                    </div>
                    <div className="flex flex-col gap-1">
                      {sortedTypes.map(([tipo, qty]) => (
                        <div key={tipo} className="flex justify-between items-center text-xs font-semibold">
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getColorByType(tipo) }}></span>
                            <span className="truncate" style={{ color: getColorByType(tipo) }}>{tipo}</span>
                          </div>
                          <span className="bg-gray-100 text-gray-800 px-1.5 rounded">{qty}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-gray-400 text-[10px] mt-2 border-t border-gray-100 pt-1">
                      Total: {zona.count} incidencias
                    </div>
                  </div>
                </Tooltip>
              </Polygon>
            );
          })}

          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={60}
            showCoverageOnHover={false}
          >
            {filteredIncidents.map((incident) => {
              const [lat, lng] = incident.location.split(',').map(Number);
              if (isNaN(lat) || isNaN(lng)) return null;

              const icon = getIconByType(incident.type);            

              return (
                <Marker key={incident.id} position={[lat, lng]} icon={icon} alt={incident.type}>
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
          </MarkerClusterGroup>
          </MapContainer>
        </div>

          {/* Panel Lateral de Análisis Detallado (CompStat) */}
          <div className="lg:w-1/4 h-full overflow-y-auto bg-[#0a192f] border border-slate-800 rounded-lg shadow-xl p-4 flex flex-col text-slate-300">
            <h3 className="text-xl font-bold mb-4 text-white border-b border-slate-700 pb-3 flex items-center gap-2 tracking-wide uppercase">
              <span className="text-red-500 text-2xl">⌖</span> CompStat Táctico
            </h3>

            {loadingTop ? (
              <div className="text-sm text-slate-400 animate-pulse text-center mt-6">Computando densidad geoespacial...</div>
            ) : topZonas.length > 0 ? (
              <div className="flex flex-col gap-4">
                {topZonas.map((zona, idx) => {
                  const rec = getRecommendation(zona.count);
                  return (
                    <div 
                      key={idx} 
                      onClick={() => {
                        if (mapRef.current) {
                          mapRef.current.flyTo([zona.lat, zona.lng], 16);
                        }
                      }}
                      className="group flex flex-col gap-2 p-3.5 rounded-md bg-[#112240] border border-slate-700 hover:border-blue-400 cursor-pointer transition-all shadow-md relative overflow-hidden"
                    >
                      {/* Borde superior de color indicador */}
                      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: rec.mapColor }}></div>

                      <div className="flex items-start gap-3 border-b border-slate-700 pb-2">
                        <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-slate-900 font-bold text-sm shadow-inner" style={{ backgroundColor: rec.mapColor }}>
                           {idx + 1}
                        </div>
                        <div className="flex flex-col flex-1">
                          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Sector Hotspot</div>
                          <div className="text-sm font-bold text-white leading-tight">
                            {zona.name}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                           <div className="text-[20px] font-black text-white leading-none">{zona.count}</div>
                           <div className="text-[9px] text-slate-400 uppercase">Incidentes</div>
                        </div>
                      </div>
                      
                      {(() => {
                        const sortedTypes = Object.entries(zona.types).sort((a,b) => b[1] - a[1]);
                        if (sortedTypes.length === 0) return null;
                        
                        return (
                          <div className="flex flex-col gap-1 mt-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500">Desglose de tipologías:</span>
                            <div className="flex flex-col gap-1 max-h-32 overflow-y-auto pr-1">
                              {sortedTypes.map(([tipo, qty]) => (
                                <div key={tipo} className="flex justify-between items-center bg-[#0a192f] p-1.5 rounded border border-slate-800">
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getColorByType(tipo) }}></span>
                                    <span className="text-xs font-semibold text-slate-300 truncate" title={tipo}>{tipo}</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-white bg-slate-700 px-2 py-0.5 rounded ml-2">{qty}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      <div className="mt-2 p-2 rounded text-[10px] font-bold text-center uppercase tracking-wide border border-transparent" style={{ backgroundColor: `${rec.mapColor}15`, color: rec.mapColor, borderColor: `${rec.mapColor}40` }}>
                        Despliegue: {rec.label.split(' - ')[1] || rec.label}
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
               <div className="text-sm text-slate-500 text-center mt-6">Sin actividad detectada en el sector.</div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default Mapa;
