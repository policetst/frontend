import L from 'leaflet';

export const getIconByType = (type) => {
  const basePath = '/icons/';

  const iconMap = {
    'Trafico': 'car.png',
    'Animales': 'dog.png',
    'Ruidos': 'speaker.png',
    'Seguridad Ciudadana': 'police.png',
    'Asistencia Colaboración Ciudadana': 'people.png',
    'Ilícito penal': 'justice.png',
    'Incidencias Urbanísticas': 'construction.png',
    'Otras incidencias no clasificadas': 'question.png',
    'Juzgados': 'juz.png',
  };

  const filename = iconMap[type] || 'question.png';

  return new L.Icon({
    iconUrl: `${basePath}${filename}`,
    iconSize: [30, 35],
    iconAnchor: [15, 35],
    popupAnchor: [0, -30],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
  });
};