// utils/keywordUtils.js
// Utility functions for automatic keyword detection and management in atestados

/**
 * Predefined keyword dictionaries organized by category
 */
export const KEYWORD_DICTIONARIES = {
    delitos: [
        'hurto', 'robo', 'agresión', 'amenaza', 'lesiones', 'homicidio',
        'violencia', 'estafa', 'fraude', 'extorsión', 'secuestro', 'rapto',
        'violación', 'abuso', 'maltrato', 'acoso', 'vandalismo', 'daños',
        'incendio', 'tráfico', 'narcotráfico', 'contrabando', 'falsificación',
        'corrupción', 'soborno', 'cohecho', 'prevaricación', 'usurpación',
        'allanamiento', 'invasión', 'ocupación', 'desorden', 'riña', 'pelea'
    ],

    objetos: [
        'arma', 'pistola', 'revólver', 'escopeta', 'rifle', 'fusil',
        'cuchillo', 'navaja', 'machete', 'hacha', 'palo', 'bate',
        'vehículo', 'coche', 'auto', 'automóvil', 'moto', 'motocicleta',
        'camión', 'furgoneta', 'bicicleta', 'ciclomotor',
        'droga', 'cocaína', 'heroína', 'marihuana', 'cannabis', 'estupefaciente',
        'dinero', 'efectivo', 'billetes', 'monedas', 'joya', 'joyas',
        'oro', 'plata', 'reloj', 'móvil', 'teléfono', 'ordenador',
        'portátil', 'tablet', 'televisor', 'electrodoméstico',
        'documento', 'dni', 'pasaporte', 'carnet', 'tarjeta'
    ],

    acciones: [
        'golpear', 'pegar', 'agredir', 'atacar', 'herir', 'lesionar',
        'amenazar', 'intimidar', 'amedrentar', 'coaccionar',
        'robar', 'hurtar', 'sustraer', 'apropiarse', 'tomar',
        'conducir', 'manejar', 'circular', 'transitar',
        'huir', 'escapar', 'fugarse', 'evadirse',
        'disparar', 'tirar', 'abrir fuego', 'detonar',
        'apuñalar', 'acuchillar', 'cortar', 'herir',
        'forcejear', 'luchar', 'pelear', 'combatir',
        'gritar', 'chillar', 'vociferar', 'insultar',
        'perseguir', 'seguir', 'acosar', 'acechar',
        'detener', 'arrestar', 'capturar', 'aprehender'
    ],

    lugares: [
        'calle', 'avenida', 'carretera', 'autopista', 'vía',
        'domicilio', 'vivienda', 'casa', 'piso', 'apartamento',
        'comercio', 'tienda', 'establecimiento', 'negocio', 'local',
        'supermercado', 'banco', 'farmacia', 'bar', 'restaurante',
        'vía pública', 'espacio público', 'parque', 'plaza',
        'edificio', 'inmueble', 'construcción', 'estructura',
        'parking', 'aparcamiento', 'garaje', 'cochera',
        'intersección', 'cruce', 'rotonda', 'glorieta',
        'acera', 'calzada', 'arcén', 'mediana'
    ],

    personas: [
        'víctima', 'afectado', 'perjudicado', 'lesionado',
        'testigo', 'presencial', 'observador',
        'sospechoso', 'presunto', 'imputado', 'acusado',
        'denunciante', 'querellante', 'demandante',
        'agresor', 'autor', 'perpetrador', 'delincuente',
        'menor', 'niño', 'adolescente', 'joven',
        'adulto', 'anciano', 'persona mayor',
        'hombre', 'varón', 'mujer', 'fémina',
        'agente', 'policía', 'oficial', 'patrulla'
    ],

    tiposAccidente: [
        'colisión', 'choque', 'impacto', 'atropello',
        'alcance', 'embestida', 'vuelco', 'salida de vía',
        'frontal', 'lateral', 'trasero', 'múltiple'
    ],

    evidencias: [
        'sangre', 'mancha', 'fluido', 'resto',
        'huella', 'pisada', 'marca', 'rastro',
        'casquillo', 'proyectil', 'bala', 'munición',
        'fragmento', 'trozo', 'pedazo', 'resto',
        'fotografía', 'vídeo', 'grabación', 'imagen',
        'testigo', 'declaración', 'testimonio'
    ]
};

/**
 * Get all keywords from all dictionaries as a flat array
 */
export const getAllKeywords = () => {
    return Object.values(KEYWORD_DICTIONARIES).flat();
};

/**
 * Normalize text for keyword matching (lowercase, remove accents, etc.)
 */
const normalizeText = (text) => {
    if (!text) return '';
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .trim();
};

/**
 * Extract keywords from a given text using the predefined dictionaries
 * @param {string} text - Text to extract keywords from
 * @returns {Array<string>} - Array of detected keywords
 */
export const extractKeywords = (text) => {
    if (!text || typeof text !== 'string') return [];

    const normalizedText = normalizeText(text);
    const detectedKeywords = new Set();
    const allKeywords = getAllKeywords();

    // Check each keyword in the dictionaries
    allKeywords.forEach(keyword => {
        const normalizedKeyword = normalizeText(keyword);

        // Check for whole word matches using word boundaries
        const regex = new RegExp(`\\b${normalizedKeyword}\\b`, 'i');
        if (regex.test(normalizedText)) {
            detectedKeywords.add(keyword);
        }
    });

    return Array.from(detectedKeywords);
};

/**
 * Detect keywords from an atestado and its diligencias
 * @param {Object} atestado - Atestado object with descripcion, tipo, etc.
 * @param {Array} diligencias - Array of diligencia objects
 * @returns {Array<string>} - Array of unique detected keywords
 */
export const detectKeywordsFromAtestado = (atestado, diligencias = []) => {
    const allKeywords = new Set();

    // Extract from atestado description
    if (atestado?.descripcion) {
        const keywords = extractKeywords(atestado.descripcion);
        keywords.forEach(kw => allKeywords.add(kw));
    }

    // Extract from atestado tipo
    if (atestado?.tipo) {
        const keywords = extractKeywords(atestado.tipo);
        keywords.forEach(kw => allKeywords.add(kw));
    }

    // Extract from atestado ubicacion
    if (atestado?.ubicacion) {
        const keywords = extractKeywords(atestado.ubicacion);
        keywords.forEach(kw => allKeywords.add(kw));
    }

    // Extract from all diligencias
    diligencias.forEach(diligencia => {
        if (diligencia?.texto_final) {
            const keywords = extractKeywords(diligencia.texto_final);
            keywords.forEach(kw => allKeywords.add(kw));
        }
    });

    return Array.from(allKeywords).sort();
};

/**
 * Get the category of a keyword
 * @param {string} keyword - Keyword to categorize
 * @returns {string|null} - Category name or null if not found
 */
export const getKeywordCategory = (keyword) => {
    const normalizedKeyword = normalizeText(keyword);

    for (const [category, keywords] of Object.entries(KEYWORD_DICTIONARIES)) {
        if (keywords.some(kw => normalizeText(kw) === normalizedKeyword)) {
            return category;
        }
    }

    return 'custom'; // For manually added keywords
};

/**
 * Get color for keyword category (for UI display)
 * @param {string} category - Category name
 * @returns {Object} - Object with bg and text color classes
 */
export const getCategoryColors = (category) => {
    const colors = {
        delitos: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
        objetos: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
        acciones: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
        lugares: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
        personas: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
        tiposAccidente: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
        evidencias: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
        custom: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' }
    };

    return colors[category] || colors.custom;
};

/**
 * Get keyword suggestions based on partial input
 * @param {string} input - Partial keyword input
 * @param {number} limit - Maximum number of suggestions
 * @returns {Array<string>} - Array of suggested keywords
 */
export const getKeywordSuggestions = (input, limit = 10) => {
    if (!input || input.length < 2) return [];

    const normalizedInput = normalizeText(input);
    const allKeywords = getAllKeywords();

    const suggestions = allKeywords
        .filter(keyword => normalizeText(keyword).includes(normalizedInput))
        .slice(0, limit);

    return suggestions;
};

/**
 * Merge and deduplicate keyword arrays
 * @param {Array<string>} existing - Existing keywords
 * @param {Array<string>} newKeywords - New keywords to add
 * @returns {Array<string>} - Merged and sorted array
 */
export const mergeKeywords = (existing = [], newKeywords = []) => {
    const merged = new Set([...existing, ...newKeywords]);
    return Array.from(merged).sort();
};

/**
 * Remove a keyword from an array
 * @param {Array<string>} keywords - Keyword array
 * @param {string} keywordToRemove - Keyword to remove
 * @returns {Array<string>} - Updated array
 */
export const removeKeyword = (keywords = [], keywordToRemove) => {
    return keywords.filter(kw =>
        normalizeText(kw) !== normalizeText(keywordToRemove)
    );
};

export default {
    KEYWORD_DICTIONARIES,
    getAllKeywords,
    extractKeywords,
    detectKeywordsFromAtestado,
    getKeywordCategory,
    getCategoryColors,
    getKeywordSuggestions,
    mergeKeywords,
    removeKeyword
};
