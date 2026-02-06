// components/CroquisElements.jsx
// Highly realistic SVG-based elements for police sketches

import { Circle, Rect, Path, Group, Line, RegularPolygon } from 'react-konva';

export const ELEMENT_CATEGORIES = {
  personas: {
    label: 'Personas',
    icon: '👤',
    color: '#3B82F6'
  },
  vehiculos: {
    label: 'Vehículos',
    icon: '🚗',
    color: '#10B981'
  },
  armas: {
    label: 'Armas',
    icon: '🔫',
    color: '#EF4444'
  },
  ubicacion: {
    label: 'Ubicación',
    icon: '🏢',
    color: '#8B5CF6'
  },
  senalizacion: {
    label: 'Señalización',
    icon: '🚦',
    color: '#F59E0B'
  },
  evidencias: {
    label: 'Evidencias',
    icon: '🔍',
    color: '#EC4899'
  }
};

// Highly realistic SVG Path data
const SVG_PATHS = {
  // Detailed person silhouette with body proportions
  person: 'M12 2C10.34 2 9 3.34 9 5C9 6.66 10.34 8 12 8C13.66 8 15 6.66 15 5C15 3.34 13.66 2 12 2ZM12 9C9.33 9 7 11.33 7 14V16C7 16.55 7.45 17 8 17H9V23C9 23.55 9.45 24 10 24H14C14.55 24 15 23.55 15 23V17H16C16.55 17 17 16.55 17 16V14C17 11.33 14.67 9 12 9Z',
  
  // Realistic car top view with wheels and windows
  car: 'M6 19H5C4.45 19 4 18.55 4 18V12L6.5 6C6.79 5.42 7.37 5 8 5H16C16.63 5 17.21 5.42 17.5 6L20 12V18C20 18.55 19.55 19 19 19H18M6.5 7L5 12H19L17.5 7H6.5M6.5 15.5C6.5 16.33 7.17 17 8 17C8.83 17 9.5 16.33 9.5 15.5C9.5 14.67 8.83 14 8 14C7.17 14 6.5 14.67 6.5 15.5M14.5 15.5C14.5 16.33 15.17 17 16 17C16.83 17 17.5 16.33 17.5 15.5C17.5 14.67 16.83 14 16 14C15.17 14 14.5 14.67 14.5 15.5M7 9H17V11H7V9Z',
  
  // Detailed motorcycle side view
  motorcycle: 'M5 13C3.34 13 2 14.34 2 16C2 17.66 3.34 19 5 19C6.66 19 8 17.66 8 16C8 14.34 6.66 13 5 13M19 13C17.34 13 16 14.34 16 16C16 17.66 17.34 19 19 19C20.66 19 22 17.66 22 16C22 14.34 20.66 13 19 13M17.5 9.5L15 7H13V5H11V7H9L7 9L8.5 10.5L10 9H11V11L9 13H7L5.5 14.5L7 16H9L11 14V16H13V14L15 16H17L18.5 14.5L17 13H15L13 11V9H14L16.5 11L17.5 9.5Z',
  
  // Realistic truck/van top view
  truck: 'M6 19H5C4.45 19 4 18.55 4 18V11L6 5H18L20 11V18C20 18.55 19.55 19 19 19H18M6.5 7L5.5 11H18.5L17.5 7H6.5M6.5 15.5C6.5 16.33 7.17 17 8 17C8.83 17 9.5 16.33 9.5 15.5C9.5 14.67 8.83 14 8 14C7.17 14 6.5 14.67 6.5 15.5M14.5 15.5C14.5 16.33 15.17 17 16 17C16.83 17 17.5 16.33 17.5 15.5C17.5 14.67 16.83 14 16 14C15.17 14 14.5 14.67 14.5 15.5M7 8H17V10H7V8Z',
  
  // Realistic pistol side view
  pistol: 'M20 8H18V6H16V4H14V6H12V8H10V10H8V12H10V14H12V16H14V14H16V12H18V10H20V8M14 8V6H16V8H14M12 10V8H14V10H12M10 12V10H12V12H10Z',
  
  // Detailed knife with blade and handle
  knife: 'M22 1L21 2L19 4L17 6L15 8L13 10L11 12L9 14L7 16L5 18L3 20L1 22L2 23L4 21L6 19L8 17L10 15L12 13L14 11L16 9L18 7L20 5L22 3L23 2L22 1M18 6L17 7L16 8L15 9L14 10L13 11L12 12L11 13L10 14L9 15L8 16L7 17L6 18L7 19L8 18L9 17L10 16L11 15L12 14L13 13L14 12L15 11L16 10L17 9L18 8L19 7L18 6Z',
  
  // Detailed building with windows and structure
  building: 'M19 2H5C3.9 2 3 2.9 3 4V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V4C21 2.9 20.1 2 19 2M7 20H5V18H7V20M7 16H5V14H7V16M7 12H5V10H7V12M7 8H5V6H7V8M7 4H5V4H7V4M11 20H9V18H11V20M11 16H9V14H11V16M11 12H9V10H11V12M11 8H9V6H11V8M11 4H9V4H11V4M15 20H13V18H15V20M15 16H13V14H15V16M15 12H13V10H15V12M15 8H13V6H15V8M15 4H13V4H15V4M19 20H17V18H19V20M19 16H17V14H19V16M19 12H17V10H19V12M19 8H17V6H19V8M19 4H17V4H19V4Z',
  
  // Realistic house with roof and door
  house: 'M12 3L2 12H5V20H11V14H13V20H19V12H22L12 3M12 5.7L17 10.2V18H15V12H9V18H7V10.2L12 5.7Z',
  
  // Detailed traffic light with 3 lights
  trafficLight: 'M12 2C10.9 2 10 2.9 10 4V20C10 21.1 10.9 22 12 22C13.1 22 14 21.1 14 20V4C14 2.9 13.1 2 12 2M12 5C12.83 5 13.5 5.67 13.5 6.5C13.5 7.33 12.83 8 12 8C11.17 8 10.5 7.33 10.5 6.5C10.5 5.67 11.17 5 12 5M12 10C12.83 10 13.5 10.67 13.5 11.5C13.5 12.33 12.83 13 12 13C11.17 13 10.5 12.33 10.5 11.5C10.5 10.67 11.17 10 12 10M12 15C12.83 15 13.5 15.67 13.5 16.5C13.5 17.33 12.83 18 12 18C11.17 18 10.5 17.33 10.5 16.5C10.5 15.67 11.17 15 12 15Z',
  
  // Realistic blood drop
  blood: 'M12 2C9.24 5.85 7 9.36 7 13C7 16.31 9.69 19 13 19C16.31 19 19 16.31 19 13C19 9.36 16.76 5.85 14 2H12M12.5 7C13.04 7.92 13.5 8.78 13.5 10C13.5 11.38 12.38 12.5 11 12.5C9.62 12.5 8.5 11.38 8.5 10C8.5 8.78 8.96 7.92 9.5 7H12.5Z',
  
  // Detailed footprint
  footprint: 'M5.5 16C6.33 16 7 16.67 7 17.5C7 18.33 6.33 19 5.5 19C4.67 19 4 18.33 4 17.5C4 16.67 4.67 16 5.5 16M7 13C7.83 13 8.5 13.67 8.5 14.5C8.5 15.33 7.83 16 7 16C6.17 16 5.5 15.33 5.5 14.5C5.5 13.67 6.17 13 7 13M8 10C8.83 10 9.5 10.67 9.5 11.5C9.5 12.33 8.83 13 8 13C7.17 13 6.5 12.33 6.5 11.5C6.5 10.67 7.17 10 8 10M8.5 7C9.33 7 10 7.67 10 8.5C10 9.33 9.33 10 8.5 10C7.67 10 7 9.33 7 8.5C7 7.67 7.67 7 8.5 7M9 4C9.83 4 10.5 4.67 10.5 5.5C10.5 6.33 9.83 7 9 7C8.17 7 7.5 6.33 7.5 5.5C7.5 4.67 8.17 4 9 4Z',
  
  // Realistic shell casing
  casing: 'M8 2C6.9 2 6 2.9 6 4V5H18V4C18 2.9 17.1 2 16 2H8M6 6V20C6 21.1 6.9 22 8 22H16C17.1 22 18 21.1 18 20V6H6M8 8H16V20H8V8Z',
  
  // Detailed weapon icon
  weapon: 'M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4M20 18H4V6H20V18M6 10H8V14H6V10M10 10H12V14H10V10M14 10H16V14H14V10M18 10H20V14H18V10Z',
  
  // Police car with lights
  policeCar: 'M6 19H5C4.45 19 4 18.55 4 18V12L6.5 6C6.79 5.42 7.37 5 8 5H16C16.63 5 17.21 5.42 17.5 6L20 12V18C20 18.55 19.55 19 19 19H18M6.5 7L5 12H19L17.5 7H6.5M6.5 15.5C6.5 16.33 7.17 17 8 17C8.83 17 9.5 16.33 9.5 15.5C9.5 14.67 8.83 14 8 14C7.17 14 6.5 14.67 6.5 15.5M14.5 15.5C14.5 16.33 15.17 17 16 17C16.83 17 17.5 16.33 17.5 15.5C17.5 14.67 16.83 14 16 14C15.17 14 14.5 14.67 14.5 15.5M7 9H17V11H7V9M10 3H14V5H10V3Z',
  
  // Bicycle top view
  bicycle: 'M5 13C3.34 13 2 14.34 2 16C2 17.66 3.34 19 5 19C6.66 19 8 17.66 8 16C8 14.34 6.66 13 5 13M19 13C17.34 13 16 14.34 16 16C16 17.66 17.34 19 19 19C20.66 19 22 17.66 22 16C22 14.34 20.66 13 19 13M12 11L14 13L16 11L14 9L12 11M10 13L8 15L10 17L12 15L10 13M14 13L16 15L14 17L12 15L14 13Z'
};

export const CROQUIS_ELEMENTS = {
  personas: [
    {
      id: 'persona-victima',
      name: 'Víctima',
      category: 'personas',
      svgPath: SVG_PATHS.person,
      color: '#EF4444',
      strokeColor: '#991B1B',
      width: 50,
      height: 60,
      label: 'VÍCTIMA',
      labelColor: '#fff'
    },
    {
      id: 'persona-sospechoso',
      name: 'Sospechoso',
      category: 'personas',
      svgPath: SVG_PATHS.person,
      color: '#DC2626',
      strokeColor: '#7F1D1D',
      width: 50,
      height: 60,
      label: 'SOSPECHOSO',
      labelColor: '#fff'
    },
    {
      id: 'persona-testigo',
      name: 'Testigo',
      category: 'personas',
      svgPath: SVG_PATHS.person,
      color: '#3B82F6',
      strokeColor: '#1E40AF',
      width: 50,
      height: 60,
      label: 'TESTIGO',
      labelColor: '#fff'
    },
    {
      id: 'persona-agente',
      name: 'Agente',
      category: 'personas',
      svgPath: SVG_PATHS.person,
      color: '#1E40AF',
      strokeColor: '#1E3A8A',
      width: 50,
      height: 60,
      label: 'AGENTE',
      labelColor: '#fff'
    },
    {
      id: 'persona-civil',
      name: 'Civil',
      category: 'personas',
      svgPath: SVG_PATHS.person,
      color: '#6B7280',
      strokeColor: '#374151',
      width: 50,
      height: 60,
      label: 'CIVIL',
      labelColor: '#fff'
    }
  ],

  vehiculos: [
    {
      id: 'vehiculo-coche',
      name: 'Coche',
      category: 'vehiculos',
      svgPath: SVG_PATHS.car,
      color: '#10B981',
      strokeColor: '#047857',
      width: 80,
      height: 60,
      label: 'COCHE',
      labelColor: '#fff'
    },
    {
      id: 'vehiculo-moto',
      name: 'Moto',
      category: 'vehiculos',
      svgPath: SVG_PATHS.motorcycle,
      color: '#059669',
      strokeColor: '#065F46',
      width: 70,
      height: 50,
      label: 'MOTO',
      labelColor: '#fff'
    },
    {
      id: 'vehiculo-camion',
      name: 'Camión',
      category: 'vehiculos',
      svgPath: SVG_PATHS.truck,
      color: '#047857',
      strokeColor: '#064E3B',
      width: 100,
      height: 70,
      label: 'CAMIÓN',
      labelColor: '#fff'
    },
    {
      id: 'vehiculo-bicicleta',
      name: 'Bicicleta',
      category: 'vehiculos',
      svgPath: SVG_PATHS.bicycle,
      color: '#34D399',
      strokeColor: '#059669',
      width: 60,
      height: 45,
      label: 'BICI',
      labelColor: '#000'
    },
    {
      id: 'vehiculo-policia',
      name: 'Vehículo Policial',
      category: 'vehiculos',
      svgPath: SVG_PATHS.policeCar,
      color: '#1E40AF',
      strokeColor: '#1E3A8A',
      width: 80,
      height: 60,
      label: 'POLICÍA',
      labelColor: '#fff'
    }
  ],

  armas: [
    {
      id: 'arma-pistola',
      name: 'Pistola',
      category: 'armas',
      svgPath: SVG_PATHS.pistol,
      color: '#DC2626',
      strokeColor: '#991B1B',
      width: 60,
      height: 40,
      label: 'PISTOLA',
      labelColor: '#fff'
    },
    {
      id: 'arma-cuchillo',
      name: 'Arma Blanca',
      category: 'armas',
      svgPath: SVG_PATHS.knife,
      color: '#B91C1C',
      strokeColor: '#7F1D1D',
      width: 55,
      height: 35,
      label: 'CUCHILLO',
      labelColor: '#fff'
    },
    {
      id: 'arma-contundente',
      name: 'Objeto Contundente',
      category: 'armas',
      svgPath: SVG_PATHS.weapon,
      color: '#991B1B',
      strokeColor: '#7F1D1D',
      width: 60,
      height: 30,
      label: 'OBJETO',
      labelColor: '#fff'
    }
  ],

  ubicacion: [
    {
      id: 'ubicacion-edificio',
      name: 'Edificio',
      category: 'ubicacion',
      svgPath: SVG_PATHS.building,
      color: '#8B5CF6',
      strokeColor: '#6D28D9',
      width: 80,
      height: 100,
      label: 'EDIFICIO',
      labelColor: '#fff'
    },
    {
      id: 'ubicacion-casa',
      name: 'Casa',
      category: 'ubicacion',
      svgPath: SVG_PATHS.house,
      color: '#7C3AED',
      strokeColor: '#5B21B6',
      width: 70,
      height: 70,
      label: 'CASA',
      labelColor: '#fff'
    },
    {
      id: 'ubicacion-calle',
      name: 'Calle',
      category: 'ubicacion',
      shape: 'line',
      color: '#6D28D9',
      strokeColor: '#5B21B6',
      width: 200,
      height: 10,
      label: 'CALLE',
      labelColor: '#fff'
    },
    {
      id: 'ubicacion-arbol',
      name: 'Árbol',
      category: 'ubicacion',
      shape: 'circle',
      color: '#059669',
      strokeColor: '#047857',
      width: 40,
      height: 40,
      label: '🌳',
      labelColor: '#000'
    },
    {
      id: 'ubicacion-banco',
      name: 'Banco',
      category: 'ubicacion',
      shape: 'rect',
      color: '#92400E',
      strokeColor: '#78350F',
      width: 50,
      height: 30,
      label: 'BANCO',
      labelColor: '#fff'
    }
  ],

  senalizacion: [
    {
      id: 'senal-semaforo',
      name: 'Semáforo',
      category: 'senalizacion',
      svgPath: SVG_PATHS.trafficLight,
      color: '#F59E0B',
      strokeColor: '#D97706',
      width: 30,
      height: 70,
      label: '',
      labelColor: '#000'
    },
    {
      id: 'senal-stop',
      name: 'Señal STOP',
      category: 'senalizacion',
      shape: 'polygon',
      sides: 8,
      color: '#DC2626',
      strokeColor: '#991B1B',
      width: 50,
      height: 50,
      label: 'STOP',
      labelColor: '#fff'
    },
    {
      id: 'senal-paso-peatones',
      name: 'Paso de Peatones',
      category: 'senalizacion',
      shape: 'striped-rect',
      color: '#ffffff',
      strokeColor: '#000000',
      width: 80,
      height: 50,
      label: '',
      labelColor: '#000'
    },
    {
      id: 'senal-trafico',
      name: 'Señal de Tráfico',
      category: 'senalizacion',
      shape: 'triangle',
      color: '#F59E0B',
      strokeColor: '#D97706',
      width: 50,
      height: 50,
      label: '⚠️',
      labelColor: '#000'
    }
  ],

  evidencias: [
    {
      id: 'evidencia-sangre',
      name: 'Mancha de Sangre',
      category: 'evidencias',
      svgPath: SVG_PATHS.blood,
      color: '#DC2626',
      strokeColor: '#991B1B',
      width: 40,
      height: 40,
      label: '',
      labelColor: '#fff'
    },
    {
      id: 'evidencia-casquillo',
      name: 'Casquillo',
      category: 'evidencias',
      svgPath: SVG_PATHS.casing,
      color: '#D97706',
      strokeColor: '#92400E',
      width: 25,
      height: 35,
      label: '',
      labelColor: '#fff'
    },
    {
      id: 'evidencia-huella',
      name: 'Huella',
      category: 'evidencias',
      svgPath: SVG_PATHS.footprint,
      color: '#6B7280',
      strokeColor: '#374151',
      width: 30,
      height: 45,
      label: '',
      labelColor: '#000'
    },
    {
      id: 'evidencia-objeto',
      name: 'Objeto/Evidencia',
      category: 'evidencias',
      shape: 'rect',
      color: '#EC4899',
      strokeColor: '#BE185D',
      width: 40,
      height: 40,
      label: 'E',
      labelColor: '#fff'
    },
    {
      id: 'evidencia-marcador',
      name: 'Marcador Numérico',
      category: 'evidencias',
      shape: 'circle',
      color: '#FBBF24',
      strokeColor: '#D97706',
      width: 35,
      height: 35,
      label: '1',
      labelColor: '#000'
    }
  ]
};

/**
 * Get all elements from all categories
 */
export const getAllElements = () => {
  return Object.values(CROQUIS_ELEMENTS).flat();
};

/**
 * Get elements by category
 */
export const getElementsByCategory = (category) => {
  return CROQUIS_ELEMENTS[category] || [];
};

/**
 * Get element by ID
 */
export const getElementById = (id) => {
  return getAllElements().find(el => el.id === id);
};

/**
 * Create a new element instance with position
 */
export const createElementInstance = (elementId, x, y) => {
  const template = getElementById(elementId);
  if (!template) return null;

  return {
    ...template,
    instanceId: `${elementId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    x,
    y,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    customLabel: template.label,
    draggable: true
  };
};

export default {
  ELEMENT_CATEGORIES,
  CROQUIS_ELEMENTS,
  getAllElements,
  getElementsByCategory,
  getElementById,
  createElementInstance
};
