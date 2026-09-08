export type AmenityPillar = "C00" | "C01" | "C02" | "C03" | "C04" | "C05" | "C06";
export type AmenityScope = "privado" | "comun" | "servicio" | "especifico" | "general";

export interface AmenityItem {
  key: string;
  code: string;
  label: string;
  pillar: AmenityPillar;
  pillarLabel: string;
  category: "habitacion" | "recreacion" | "gastronomia" | "servicios" | "general" | "especificos";
  subCategory: string;
  scope: AmenityScope;
  iconName: string;
}

export const PILLARS_DOCUMENT77 = [
  { id: "all", label: "Todos los Pilares" },
  { id: "C00", label: "C00. Configuración Inicial & Región", color: "#3B82F6" },
  { id: "C01", label: "C01. Infraestructura Físicas (Tangible)", color: "#00C8D4" },
  { id: "C02", label: "C02. Servicios y Experiencias (Intangibles)", color: "#FF0096" },
  { id: "C03", label: "C03. Gestión, Políticas y Logística (Normas)", color: "#9B00CC" },
  { id: "C04", label: "C04. Instalaciones y Servicios Específicos por Tipología", color: "#10B981" },
  { id: "C06", label: "C06. Categorías de Opiniones de Turistas", color: "#F59E0B" }
];

export const AMENITY_SCOPES = [
  { id: "all", label: "Todos los Ámbitos" },
  { id: "privado", label: "🚪 Privado de la Unidad", color: "#00C8D4" },
  { id: "comun", label: "🏢 Zona Común (Compartido)", color: "#9B00CC" },
  { id: "servicio", label: "✨ Servicio Intangible", color: "#FF0096" },
  { id: "especifico", label: "🏕️ Específico por Tipología", color: "#10B981" },
  { id: "general", label: "🛡️ Normas & Políticas", color: "#64748B" }
];

export const AMENITY_CATEGORIES = [
  { id: "all", label: "Todas las Categorías" },
  { id: "habitacion", label: "🛏️ Unidad Privada" },
  { id: "recreacion", label: "🏊 Zonas Comunes & Relax" },
  { id: "gastronomia", label: "🍽️ Gastronomía & Alimentos" },
  { id: "servicios", label: "⛵ Servicios & Experiencias" },
  { id: "general", label: "🛡️ Accesibilidad & Políticas" },
  { id: "especificos", label: "🏕️ Específicos por Tipología (Campings, Barcos, Love Hotels, Esquí)" },
];

// =========================================================================
// VENTANA PREVIA: LOS 6 BOTONES OFICIALES DE REGISTRO (DOCUMENTO 77 V.10)
// =========================================================================
export interface PropertyButtonGroup {
  id: string;
  btnNumber: number;
  title: string;
  subtitle: string;
  items: string[];
  icon: string;
  status: "active" | "pending";
  accentColor: string;
  gradient: string;
}

export const PROPERTY_BUTTON_GROUPS: PropertyButtonGroup[] = [
  {
    id: "boton1",
    btnNumber: 1,
    title: "Hoteles, Posadas & Albergues",
    subtitle: "Alojamientos con unidades operativas hoteleras",
    items: [
      "Hoteles",
      "Hostales, Posadas, Pensiones y Moteles",
      "Bed and breakfast",
      "Habitaciones en casas particulares",
      "Albergues turísticos",
      "Residencias de estudiantes",
      "Hoteles cápsula"
    ],
    icon: "Building2",
    status: "active",
    accentColor: "#00C8D4",
    gradient: "linear-gradient(135deg, #00C8D4 0%, #0098A6 100%)"
  },
  {
    id: "boton2",
    btnNumber: 2,
    title: "Apartamentos, Casas & Villas",
    subtitle: "Propiedades de alquiler completo o residencial",
    items: [
      "Apartamentos",
      "Apartahotel",
      "Villas",
      "Casas y Chalets rurales",
      "Casas y Chalets de montaña (esquí)"
    ],
    icon: "Home",
    status: "active",
    accentColor: "#FF0096",
    gradient: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)"
  },
  {
    id: "boton3",
    btnNumber: 3,
    title: "Campings, Glampings & Eco-Lodges",
    subtitle: "Alojamiento al aire libre y naturaleza",
    items: [
      "Campings",
      "Glampings & Eco-Lodges",
      "Casas en los árboles",
      "Yurtas y Tiendas safari",
      "Parcelas caravanas/tiendas"
    ],
    icon: "Tent",
    status: "pending",
    accentColor: "#10B981",
    gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)"
  },
  {
    id: "boton4",
    btnNumber: 4,
    title: "Love Hotels & Moteles",
    subtitle: "Establecimientos de intimidad, privacidad y confort erótico",
    items: [
      "Love hotels",
      "Moteles temáticos",
      "Habitaciones por horas con garaje privado"
    ],
    icon: "Heart",
    status: "active",
    accentColor: "#FF0096",
    gradient: "linear-gradient(135deg, #FF0096 0%, #E11D48 100%)"
  },
  {
    id: "boton5",
    btnNumber: 5,
    title: "Barcos & Embarcaciones",
    subtitle: "Alojamiento estático en puerto o navegación diaria incluida",
    items: [
      "Veleros",
      "Yates de lujo",
      "Catamaranes",
      "Houseboats / Casas flotantes"
    ],
    icon: "Ship",
    status: "pending",
    accentColor: "#0EA5E9",
    gradient: "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)"
  },
  {
    id: "boton6",
    btnNumber: 6,
    title: "Restaurantes & Gastronomía",
    subtitle: "Establecimientos gastronómicos, bistrós y salas VIP",
    items: [
      "Restaurantes de alta cocina",
      "Bistrós y Salones",
      "Chef's Tables y Reservados VIP"
    ],
    icon: "Utensils",
    status: "pending",
    accentColor: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
  }
];

// Tipos de establecimiento filtrados para BOTÓN 1
export const BUTTON_1_PROPERTY_TYPES = [
  { id: "hoteles", label: "Hoteles", code: "C00.1.6", icon: "Building2" },
  { id: "hostales_posadas_pensiones", label: "Hostales, Posadas, Pensiones y Moteles", code: "C00.1.7", icon: "Bed" },
  { id: "bed_and_breakfast", label: "Bed and breakfast", code: "C00.1.8", icon: "Coffee" },
  { id: "habitaciones_casas_particulares", label: "Habitaciones en casas particulares", code: "C00.1.9", icon: "UserCheck" },
  { id: "albergues_turisticos", label: "Albergues turísticos", code: "C00.1.10", icon: "Users" },
  { id: "residencias_estudiantes", label: "Residencias de estudiantes", code: "C00.1.11", icon: "GraduationCap" },
  { id: "hoteles_capsula", label: "Hoteles cápsula", code: "C00.1.12", icon: "Box" }
];

// Tipos de establecimiento filtrados para BOTÓN 2
export const BUTTON_2_PROPERTY_TYPES = [
  { id: "apartamentos", label: "Apartamentos", code: "C00.1.1", icon: "Building" },
  { id: "apartahotel", label: "Apartahotel", code: "C00.1.2", icon: "Building2" },
  { id: "villas", label: "Villas", code: "C00.1.3", icon: "Palmtree" },
  { id: "casas_chalets_rurales", label: "Casas y Chalets rurales", code: "C00.1.4", icon: "Home" },
  { id: "casas_chalets_montana", label: "Casas y Chalets de montaña (esquí)", code: "C00.1.5", icon: "Mountain" }
];

// Tipos de establecimiento para BOTÓN 4
export const BUTTON_4_PROPERTY_TYPES = [
  { id: "love_hotels", label: "Love hotels", code: "C00.1.14", icon: "Heart" }
];

// Tipos de establecimiento para BOTÓN 3 (Campings)
export const BUTTON_3_PROPERTY_TYPES = [
  { id: "campings_glampings", label: "Campings, Glampings & Eco-Lodges", code: "C00.1.13", icon: "Tent" }
];

// Tipos de establecimiento para BOTÓN 5 (Barcos)
export const BUTTON_5_PROPERTY_TYPES = [
  { id: "barcos", label: "Barcos (veleros, yates, catamaranes o houseboats)", code: "C00.1.15", icon: "Ship" }
];

// Tipos de establecimiento para BOTÓN 6 (Restaurantes)
export const BUTTON_6_PROPERTY_TYPES = [
  { id: "restaurantes", label: "Restaurantes", code: "C00.1.16", icon: "Utensils" }
];

// C00.1 Catálogo General V.10
export const PROPERTY_TYPES_DOCUMENT77 = [
  { id: "apartamentos", label: "Apartamentos", code: "C00.1.1", icon: "Building" },
  { id: "apartahotel", label: "Apartahotel", code: "C00.1.2", icon: "Building2" },
  { id: "villas", label: "Villas", code: "C00.1.3", icon: "Palmtree" },
  { id: "casas_chalets_rurales", label: "Casas y Chalets rurales", code: "C00.1.4", icon: "Home" },
  { id: "casas_chalets_montana", label: "Casas y Chalets de montaña (esquí)", code: "C00.1.5", icon: "Mountain" },
  { id: "hoteles", label: "Hoteles", code: "C00.1.6", icon: "Building2" },
  { id: "hostales_posadas_pensiones", label: "Hostales, Posadas, Pensiones y Moteles", code: "C00.1.7", icon: "Bed" },
  { id: "bed_and_breakfast", label: "Bed and breakfast", code: "C00.1.8", icon: "Coffee" },
  { id: "habitaciones_casas_particulares", label: "Habitaciones en casas particulares", code: "C00.1.9", icon: "UserCheck" },
  { id: "albergues_turisticos", label: "Albergues turísticos", code: "C00.1.10", icon: "Users" },
  { id: "residencias_estudiantes", label: "Residencias de estudiantes", code: "C00.1.11", icon: "GraduationCap" },
  { id: "hoteles_capsula", label: "Hoteles cápsula", code: "C00.1.12", icon: "Box" },
  { id: "campings_glampings", label: "Campings, Glampings & Eco-Lodges", code: "C00.1.13", icon: "Tent" },
  { id: "love_hotels", label: "Love hotels", code: "C00.1.14", icon: "Heart" },
  { id: "barcos", label: "Barcos (veleros, yates, catamaranes o houseboats)", code: "C00.1.15", icon: "Ship" },
  { id: "restaurantes", label: "Restaurantes", code: "C00.1.16", icon: "Utensils" },
  { id: "resorts_complejos", label: "Resorts & Complejos Vacacionales (Pendiente)", code: "C05.1.17", icon: "Palmtree" },
  { id: "agencias_viaje", label: "Agencias de viaje (Pendiente)", code: "C05.1.18", icon: "Compass" },
  { id: "alquiler_carros", label: "Alquiler de carros (Pendiente)", code: "C05.1.19", icon: "Car" },
  { id: "marinas", label: "Marinas (Pendiente)", code: "C05.1.20", icon: "Waves" }
];

// =========================================================================
// DESPLEGABLE TIPO DE VÍA EN FORMULARIO (85+ TIPOS OFICIALES DOC 77 V.10)
// =========================================================================
export const ROAD_TYPES_V10 = [
  "ACCESO", "AGREGADO", "ALDEA", "ALAMEDA", "ANDADOR", "AREA", "ARRABAL", "ARROYO",
  "ASENTAMIENTO", "AUTOPISTA", "AUTOVIA", "AVENIDA", "BAJADA", "BARRANCO", "BARRIO",
  "BLOQUE", "BULEVAR", "CALLE", "CALLEJA", "CALLEJON", "CALZADA", "CAMINO", "CAMPA",
  "CAMPING", "CASCO CENTRAL/HISTÓRICO", "CASERIO", "CIGARRAL", "CANAL", "CAÑADA",
  "CARRETERA", "CARRERA", "CASA", "CENTRO COMERCIAL", "CENTRO EMPRESARIAL", "CERRADA",
  "CHALET", "CINTURON", "CIRCUITO", "CIRCUNVALACIÓN", "COLONIA", "COMUNIDAD",
  "CONCEJO", "CONJUNTO", "CONJUNTO CERRADO", "CONJUNTO RESIDENCIAL", "CUESTA/COSTANILLA",
  "DETRÁS", "DIAGONAL", "DISEMINADOS", "DISTRIBUIDOR", "EDIFICIO", "ESCALERAS/ESCALINATA",
  "ESQUINA", "ETAPA", "FASE", "FINCA", "FUNDO", "GLORIETA", "GRAN VIA", "GRANJA",
  "GRUPO", "HACIENDA", "HATO", "JARDINES", "LADERA", "LOMA", "LOTE", "MANZANA",
  "MALECON", "MERCADO", "MONTE", "MUELLE", "MUNICIPIO", "PARCELA", "PARQUE",
  "PARTIDA", "PASADIZO", "PASAJE", "PASARELA", "PASEO", "PASEO DEL MAR", "PASEO MARITIMO",
  "PEATONAL", "PERIMETRAL", "PLAZA", "PLAZUELA", "POBLADO", "POLIGONO", "PRIVADA",
  "PROLONGACION", "PUENTE", "QUINTA", "RAMAL", "RAMBLA", "RAMPA", "REDOMA",
  "RESIDENCIA", "RETORNO", "RINCON/RINCONADA", "RONDA", "ROTONDA", "RUA", "SECTOR",
  "SENDA", "SOLAR", "SUBIDA", "TERRENOS", "TORRE", "TORRENTE", "TRANSVERSAL",
  "TRAVESIA", "TROCHA", "URBANIZACION", "VEREDA", "VIA", "VIADUCTO", "VIA PEATONAL",
  "VIVIENDA", "ZONA INDUSTRIAL", "AÑADIR OTRO"
];

export const STREET_TYPES_V9 = ROAD_TYPES_V10;

// =========================================================================
// C00.2. CERTIFICACIONES OFICIALES (DOC 77 V.10 - 11 CERTIFICACIONES)
// =========================================================================
export const CERTIFICATIONS_DOCUMENT77 = [
  { id: "sostenibilidad", code: "C00.2.1", label: "Certificación de sostenibilidad", badgeColor: "bg-emerald-500 text-white" },
  { id: "sello_legal_hdv", code: "C00.2.2", label: "Sello de garantía Legal HDV", badgeColor: "bg-[#00C8D4] text-[#0e011f]" },
  { id: "circuito_excelencia", code: "C00.2.3", label: "Circuito de Excelencia", badgeColor: "bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white" },
  { id: "estrellas_michelin", code: "C00.2.4", label: "Estrellas Michelin", badgeColor: "bg-amber-500 text-slate-900" },
  { id: "llave_verde", code: "C00.2.5", label: "Llave verde", badgeColor: "bg-green-600 text-white" },
  { id: "etiqueta_ecologica", code: "C00.2.6", label: "Etiqueta ecológica", badgeColor: "bg-teal-600 text-white" },
  { id: "etiqueta_qualidog", code: "C00.2.7", label: "Etiqueta Qualidog", badgeColor: "bg-orange-500 text-white" },
  { id: "reconocimiento_accueil_velo", code: "C00.2.8", label: "Reconocimiento Accueil Vélo", badgeColor: "bg-blue-600 text-white" },
  { id: "turismo_discapacidad", code: "C00.2.9", label: "Turismo y discapacidad", badgeColor: "bg-indigo-600 text-white" },
  { id: "marca_destination_excellence", code: "C00.2.10", label: "Marca Destination d'Excellence", badgeColor: "bg-purple-600 text-white" },
  { id: "alojamiento_pesca", code: "C00.2.11", label: "Alojamiento para la pesca", badgeColor: "bg-cyan-700 text-white" },
];

export const CERTIFICATIONS_V10 = CERTIFICATIONS_DOCUMENT77;

// =========================================================================
// C00.3. CATEGORÍA DEL ESTABLECIMIENTO (POR ESTRELLAS)
// =========================================================================
export const STAR_CATEGORIES_DOCUMENT77 = [
  { stars: 1, code: "C00.3.1", label: "1 estrella" },
  { stars: 2, code: "C00.3.2", label: "2 estrellas" },
  { stars: 3, code: "C00.3.3", label: "3 estrellas" },
  { stars: 4, code: "C00.3.4", label: "4 estrellas" },
  { stars: 5, code: "C00.3.5", label: "5 estrellas / Lujo" },
];

// =========================================================================
// C00.4. REGIÓN (DOC 77 V.10 - 9 REGIONES)
// =========================================================================
export const REGIONS_DOCUMENT77 = [
  { id: "mar", code: "C00.4.1", label: "Mar", icon: "Waves" },
  { id: "campana", code: "C00.4.2", label: "Campaña", icon: "TreePine" },
  { id: "bosque", code: "C00.4.3", label: "Bosque", icon: "TreePine" },
  { id: "montana", code: "C00.4.4", label: "Montaña", icon: "Mountain" },
  { id: "rio_lago", code: "C00.4.5", label: "Río o lago", icon: "Waves" },
  { id: "zona_urbana", code: "C00.4.6", label: "Zona urbana", icon: "Building2" },
  { id: "llanos", code: "C00.4.7", label: "Llanos", icon: "Sun" },
  { id: "sabana", code: "C00.4.8", label: "Sabana", icon: "Sun" },
  { id: "desierto", code: "C00.4.9", label: "Desierto", icon: "Sun" }
];

export const REGIONS_V10 = REGIONS_DOCUMENT77;

// =========================================================================
// C00.5. LUGARES DE INTERÉS (DOC 77 V.10)
// =========================================================================
export const POI_TYPES_V10 = [
  { id: "restaurantes_bares_cafeterias", code: "C00.5.1.1", label: "Restaurantes, Bares y Cafeterías" },
  { id: "centros_comerciales_mercados", code: "C00.5.1.2", label: "Centros comerciales / mercados" },
  { id: "playas", code: "C00.5.1.3", label: "Playas" },
  { id: "aeropuerto_estacion", code: "C00.5.1.4", label: "Aeropuerto, estación de tren/autobús" },
  { id: "patrimonio_historico", code: "C00.5.1.5", label: "Patrimonio histórico (Edificios históricos, restos arqueológicos)" },
  { id: "museos", code: "C00.5.1.6", label: "Museos" },
  { id: "parques_naturales", code: "C00.5.1.7", label: "Parques naturales" },
  { id: "resto_atracciones", code: "C00.5.1.8", label: "Resto de atracciones turísticas (Zoológicos, parques recreativos)" },
  { id: "hospitales_clinicas", code: "C00.5.1.9", label: "Hospitales, clínicas, centros médicos" },
  { id: "estacion_policia", code: "C00.5.1.10", label: "Estación de policía" }
];

export const POINT_OF_INTEREST_TYPES = POI_TYPES_V10;

export const CAMPING_SUBTYPES_V9 = [
  { id: "mobil_home", label: "Mobil-home", code: "C04.1.1.1" },
  { id: "bungalow", label: "Bungalow", code: "C04.1.1.2" },
  { id: "tienda_lona", label: "Tienda de lona", code: "C04.1.1.3" },
  { id: "tiendas_safari", label: "Tiendas safari", code: "C04.1.1.4" },
  { id: "tiendas_tipi", label: "Tiendas tipi", code: "C04.1.1.5" },
  { id: "casas_arboles", label: "Casas en los árboles", code: "C04.1.1.6" },
  { id: "yurtas", label: "Yurtas", code: "C04.1.1.7" },
  { id: "cg_casa_chalet_cabana", label: "C/G Casa, Chalet, Cabaña", code: "C04.1.1.8" },
  { id: "cg_apartamento", label: "C - Apartamento", code: "C04.1.1.9" },
  { id: "parcela_tienda", label: "Parcela para tienda", code: "C04.1.1.10" },
  { id: "parcela_caravana", label: "Parcela para caravana", code: "C04.1.1.11" },
  { id: "parcela_autocaravana", label: "Parcela para autocaravana", code: "C04.1.1.12" }
];

export const ONLINE_PAYMENT_METHODS_V9 = [
  { id: "tarjeta_visa_mc", code: "C03.3.6.1", label: "Tarjeta (VISA, MC)" },
  { id: "bizum_espana", code: "C03.3.6.2", label: "Bizum (España)" },
  { id: "binance_usdt_crypto", code: "C03.3.6.3", label: "Binance USDT / Crypto" },
  { id: "pago_movil_ves", code: "C03.3.6.4", label: "Pago Móvil (Bs. VES)" },
  { id: "zelle_usd_venezuela", code: "C03.3.6.5", label: "Zelle (USD) (Venezuela)" }
];

export const BOTON_CATEGORIES_MAPPING = {
  boton1: [
    { id: "hoteles", label: "Hoteles", code: "C00.1.6" },
    { id: "hostales_posadas_pensiones", label: "Hostales, Posadas, Pensiones y Moteles", code: "C00.1.7" },
    { id: "bed_and_breakfast", label: "Bed and breakfast", code: "C00.1.8" },
    { id: "habitaciones_casas_particulares", label: "Habitaciones en casas particulares", code: "C00.1.9" },
    { id: "albergues_turisticos", label: "Albergues turísticos", code: "C00.1.10" },
    { id: "residencias_estudiantes", label: "Residencias de estudiantes", code: "C00.1.11" },
    { id: "hoteles_capsula", label: "Hoteles cápsula", code: "C00.1.12" },
  ],
  boton2: [
    { id: "apartamentos", label: "Apartamentos", code: "C00.1.1" },
    { id: "apartahotel", label: "Apartahotel", code: "C00.1.2" },
    { id: "villas", label: "Villas", code: "C00.1.3" },
    { id: "casas_chalets_rurales", label: "Casas y Chalets rurales", code: "C00.1.4" },
    { id: "casas_chalets_montana", label: "Casas y Chalets de montaña (esquí)", code: "C00.1.5" },
  ],
  boton3: [
    { id: "campings_glampings", label: "Campings, Glampings & Eco-Lodges", code: "C00.1.13" },
  ],
  boton4: [
    { id: "love_hotels", label: "Love hotels", code: "C00.1.14" },
  ],
  boton5: [
    { id: "barcos", label: "Barcos (veleros, yates, catamaranes o houseboats)", code: "C00.1.15" },
  ],
  boton6: [
    { id: "restaurantes", label: "Restaurantes", code: "C00.1.16" },
  ],
};

// Barrios por Ciudad
export const NEIGHBORHOODS_BY_CITY: Record<string, string[]> = {
  "Caracas": [
    "Altamira", "Las Mercedes", "Chacao", "El Rosal", "La Castellana", "Los Palos Grandes",
    "Campo Alegre", "Sabana Grande", "El Hatillo", "Plaza Venezuela", "Centro Histórico", "La Candelaria"
  ],
  "Margarita": [
    "Playa El Yaque", "Playa El Agua", "Pampatar", "Porlamar", "Playa Guacuco", "Juan Griego", "Playa Caribe"
  ],
  "Lechería": [
    "Playa Mansa", "Playa Lido", "Playa Cangrejo", "Morro I", "Morro II", "Casco Central Lechería", "Plaza Mayor"
  ],
  "Mérida": [
    "Centro Histórico", "La Parroquia", "Tabay", "Los Chorros de Milla", "La Hechicera", "Páramo La Culata"
  ],
  "Madrid": [
    "Sol / Gran Vía", "Barrio de las Letras", "Huertas", "Madrid de los Austrias", "Malasaña",
    "Chueca", "Lavapiés", "La Latina", "Triángulo del Arte", "Distrito de Salamanca",
    "Distrito de Moncloa-Aravaca", "Distrito de Chamberí", "Distrito de Retiro", "Distrito de Tetuán",
    "Barajas y San Blas-Canillejas"
  ],
  "Barcelona": [
    "Ciutat Vella", "Barrio Gótico", "El Raval", "El Born", "La Barceloneta",
    "La Dreta de l'Eixample", "La Nova Esquerra", "La Sagrada Família", "Sant Antoni",
    "Ramblas", "Gracia", "Distrito de Sant Martí", "Distrito de Sants-Montjuïc"
  ],
  "Valencia": [
    "Ciutat Vella", "El Carme", "El Mercat", "Sant Francesc", "La Seu", "Xerea",
    "El Cabanyal-Canyamelar", "El Grau", "Ruzafa", "Poblados marítimos", "Extramurs",
    "Eixample", "Camins al Grau", "Quatre Carreres", "Benicalap", "La Saïdia",
    "Patraix", "Algirós", "Olivereta", "Rascanya", "El Pla del Real", "Jesús", "Campanar", "Benimaclet"
  ],
  "Zaragoza": [
    "Casco Antiguo", "Centro", "El Arrabal", "Barrio Jesús", "Delicias", "Romareda"
  ],
  "Sevilla": [
    "Centro histórico de Sevilla", "Santa Cruz", "El Arenal", "Alfalfa", "Encarnación - Regina",
    "San Bartolomé", "San Lorenzo y Alameda", "Triana", "Nervión", "San Bernardo",
    "Los Remedios", "San Pablo-Santa Justa", "Macarena", "Sur", "Este", "Macarena Norte",
    "Bellavista - Palmera", "Cerro - Amate", "Isla de La Cartuja"
  ]
};

// C06. Categorías por Opiniones de Turistas
export const RATINGS_CATEGORIES_DOCUMENT77 = [
  { id: "C06-1", code: "C06.1", label: "Inolvidable: 9 o más", minScore: 9.0 },
  { id: "C06-2", code: "C06.2", label: "Excelente elección: 8 o más", minScore: 8.0 },
  { id: "C06-3", code: "C06.3", label: "Muy acogedor: 7 o más", minScore: 7.0 },
  { id: "C06-4", code: "C06.4", label: "Sencillo y funcional: 6 o más", minScore: 6.0 },
];

export const REVIEW_RATING_CRITERIA = [
  { id: "personal", code: "C06.2.1", label: "Personal", min: 1, max: 10 },
  { id: "instalaciones_servicios", code: "C06.2.2", label: "Instalaciones y Servicios", min: 1, max: 10 },
  { id: "limpieza", code: "C06.2.3", label: "Limpieza", min: 1, max: 10 },
  { id: "confort", code: "C06.2.4", label: "Confort", min: 1, max: 10 },
  { id: "calidad_precio", code: "C06.2.5", label: "Relación Calidad Precio", min: 1, max: 10 },
  { id: "ubicacion", code: "C06.2.6", label: "Ubicación", min: 1, max: 10 },
  { id: "wifi_gratis", code: "C06.2.7", label: "Wifi Gratis", min: 1, max: 10 },
  { id: "desayuno", code: "C06.2.8", label: "Desayuno", min: 1, max: 10 },
];

// =========================================================================
// MASTER AMENITIES LIST (DOCUMENTO 77 V.10 - CATÁLOGO COMPLETO Y EXHAUSTIVO)
// =========================================================================
export const MASTER_AMENITIES: AmenityItem[] = [
  // ==========================================
  // C01. DISTRIBUCIÓN, INFRAESTRUCTURA Y EQUIPAMIENTO FÍSICO
  // ==========================================
  
  // C01.4. Equipamiento de la Unidad Privada - C01.4.1. Descanso y Confort
  { key: "ropa_cama", code: "C01.4.1.1", label: "Ropa de cama", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Bed" },
  { key: "almohadas_a_la_carta", code: "C01.4.1.2", label: "Almohadas a la carta", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Bed" },
  { key: "armario", code: "C01.4.1.3", label: "Armario", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Archive" },
  { key: "walk_in_closet", code: "C01.4.1.4", label: "Walk-in closet", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Archive" },
  { key: "perchero", code: "C01.4.1.5", label: "Perchero", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Shirt" },
  { key: "mosquitera", code: "C01.4.1.6", label: "Mosquitera", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "ShieldCheck" },
  { key: "insonorizacion", code: "C01.4.1.7", label: "Insonorización", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "VolumeX" },
  { key: "cortinas_opacas", code: "C01.4.1.8", label: "Cortinas opacas / persianas", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "EyeOff" },
  { key: "plancha", code: "C01.4.1.9", label: "Plancha / Utensilios de planchado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Shirt" },
  { key: "suelo_ceramica", code: "C01.4.1.10", label: "Suelo de cerámica", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Home" },
  { key: "suelo_madera", code: "C01.4.1.11", label: "Suelo de madera / parquet", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Home" },
  { key: "suelo_madera_noble", code: "C01.4.1.12", label: "Revestimientos y suelos de madera noble", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Home" },
  { key: "suelo_moqueta", code: "C01.4.1.13", label: "Suelo de Moqueta hipoalergénica", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Home" },
  { key: "tendedero", code: "C01.4.1.14", label: "Tendedero de ropa", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Shirt" },
  { key: "habitaciones_sin_humo", code: "C01.4.1.15", label: "Habitaciones sin humo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Ban" },
  { key: "ropa_cama_termica_nordica", code: "C01.4.1.16", label: "Ropa de cama térmica/nórdica alto gramaje y mantas extra", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Bed" },

  // C01.4.2. Cocina y Menaje (Privado)
  { key: "mesa_comedor", code: "C01.4.2.1", label: "Mesa de comedor", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje (Privado)", scope: "privado", iconName: "Utensils" },
  { key: "cafetera", code: "C01.4.2.2", label: "Cafetera", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje (Privado)", scope: "privado", iconName: "Coffee" },
  { key: "tostadora", code: "C01.4.2.3", label: "Tostadora", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje (Privado)", scope: "privado", iconName: "Coffee" },
  { key: "hervidor_electrico", code: "C01.4.2.4", label: "Hervidor eléctrico", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje (Privado)", scope: "privado", iconName: "Coffee" },
  { key: "placa_vitro", code: "C01.4.2.5", label: "Placa vitro de cocina", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje (Privado)", scope: "privado", iconName: "ChefHat" },
  { key: "microondas", code: "C01.4.2.6", label: "Microondas", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje (Privado)", scope: "privado", iconName: "ChefHat" },
  { key: "horno", code: "C01.4.2.7", label: "Horno", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje (Privado)", scope: "privado", iconName: "ChefHat" },
  { key: "nevera_completa", code: "C01.4.2.8", label: "Nevera completa", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje (Privado)", scope: "privado", iconName: "IceCream" },
  { key: "nevera_minibar", code: "C01.4.2.9", label: "Nevera/minibar", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje (Privado)", scope: "privado", iconName: "IceCream" },
  { key: "lavavajillas", code: "C01.4.2.10", label: "Lavavajillas", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje (Privado)", scope: "privado", iconName: "Droplets" },
  { key: "lavadora_privada", code: "C01.4.2.11", label: "Lavadora", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje (Privado)", scope: "privado", iconName: "Shirt" },
  { key: "utensilios_cocina", code: "C01.4.2.12", label: "Utensilios de cocina", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje (Privado)", scope: "privado", iconName: "ChefHat" },
  { key: "vajilla", code: "C01.4.2.13", label: "Vajilla", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje (Privado)", scope: "privado", iconName: "Utensils" },
  { key: "productos_limpieza", code: "C01.4.2.14", label: "Productos de limpieza", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje (Privado)", scope: "privado", iconName: "Sparkles" },
  { key: "despensa_nieve", code: "C01.4.2.15", label: "Despensa de gran capacidad para estancias de nieve", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje (Privado)", scope: "privado", iconName: "Archive" },

  // C01.4.3. Climatización y Suministros (Privado)
  { key: "aire_acondicionado", code: "C01.4.3.1", label: "Aire Acondicionado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros (Privado)", scope: "privado", iconName: "Wind" },
  { key: "calefaccion", code: "C01.4.3.2", label: "Calefacción", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros (Privado)", scope: "privado", iconName: "Flame" },
  { key: "chimenea", code: "C01.4.3.3", label: "Chimenea", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros (Privado)", scope: "privado", iconName: "Flame" },
  { key: "ventiladores_techo", code: "C01.4.3.4", label: "Ventiladores de techo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros (Privado)", scope: "privado", iconName: "Wind" },
  { key: "enchufe_cerca_cama", code: "C01.4.3.5", label: "Enchufe cerca de la cama", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros (Privado)", scope: "privado", iconName: "Zap" },
  { key: "cargadores_usb", code: "C01.4.3.6", label: "Cargadores USB integrados", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros (Privado)", scope: "privado", iconName: "Zap" },
  { key: "chimenea_lena", code: "C01.4.3.7", label: "Chimenea de leña", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros (Privado)", scope: "privado", iconName: "Flame" },
  { key: "estufa_pellets", code: "C01.4.3.8", label: "Estufa de pellets o casete térmico (leña de cortesía)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros (Privado)", scope: "privado", iconName: "Flame" },
  { key: "suelo_radiante", code: "C01.4.3.9", label: "Calefacción por suelo radiante o radiadores de alta eficiencia", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros (Privado)", scope: "privado", iconName: "Flame" },
  { key: "termostatos_programables", code: "C01.4.3.10", label: "Termostatos programables por zonas/plantas", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros (Privado)", scope: "privado", iconName: "Flame" },

  // C01.4.4. Tecnología y Entretenimiento (Privado)
  { key: "tv_pantalla_plana", code: "C01.4.4.1", label: "TV pantalla plana", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento (Privado)", scope: "privado", iconName: "Tv" },
  { key: "servicios_streaming", code: "C01.4.4.2", label: "Servicios de streaming (Netflix, HBO, etc.)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento (Privado)", scope: "privado", iconName: "Tv" },
  { key: "altavoces_bluetooth", code: "C01.4.4.3", label: "Altavoces Bluetooth", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento (Privado)", scope: "privado", iconName: "Music" },
  { key: "consola_videojuegos", code: "C01.4.4.4", label: "Consola de videojuegos", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento (Privado)", scope: "privado", iconName: "Trophy" },
  { key: "canales_cable", code: "C01.4.4.5", label: "Canales por cable", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento (Privado)", scope: "privado", iconName: "Tv" },
  { key: "canales_satelite", code: "C01.4.4.6", label: "Canales vía satélite", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento (Privado)", scope: "privado", iconName: "Tv" },
  { key: "canales_pago", code: "C01.4.4.7", label: "Canales de pago", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento (Privado)", scope: "privado", iconName: "Tv" },

  // C01.4.5. Zona de Trabajo y Estar (Privado)
  { key: "escritorio", code: "C01.4.5.1", label: "Escritorio", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Zona de Trabajo y Estar (Privado)", scope: "privado", iconName: "Briefcase" },
  { key: "silla_ergonomica", code: "C01.4.5.2", label: "Silla ergonómica", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Zona de Trabajo y Estar (Privado)", scope: "privado", iconName: "Briefcase" },
  { key: "sofa", code: "C01.4.5.3", label: "Sofá", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Zona de Trabajo y Estar (Privado)", scope: "privado", iconName: "Smile" },
  { key: "zona_estar", code: "C01.4.5.4", label: "Zona de estar", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Zona de Trabajo y Estar (Privado)", scope: "privado", iconName: "Smile" },
  { key: "caja_fuerte", code: "C01.4.5.5", label: "Caja fuerte (tamaño portátil)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Zona de Trabajo y Estar (Privado)", scope: "privado", iconName: "Lock" },

  // C01.5. Exteriores Privados (Integrados en la unidad privada)
  { key: "balcon", code: "C01.5.1", label: "Balcón", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Sun" },
  { key: "terraza_privada", code: "C01.5.2", label: "Terraza privada", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Sun" },
  { key: "terraza_cubierta", code: "C01.5.3", label: "Terraza privada cubierta (o semicubierta)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Sun" },
  { key: "patio_interior_privado", code: "C01.5.4", label: "Patio interior privado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "TreePine" },
  { key: "jardin_privado", code: "C01.5.5", label: "Jardín privado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "TreePine" },
  { key: "barbacoa_privada", code: "C01.5.6", label: "Barbacoa privada", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Flame" },
  { key: "mobiliario_exterior_privado", code: "C01.5.7", label: "Mobiliario exterior privado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Sun" },
  { key: "hot_tub_madera_exterior", code: "C01.5.8", label: "Jacuzzi exterior / Bañera nórdica (Hot Tub) de madera", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Bath" },
  { key: "balcon_vistas_montana", code: "C01.5.9", label: "Balcón o terraza panorámica con vistas a las pistas/montaña", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Mountain" },
  { key: "estufas_exterior_terraza", code: "C01.5.10", label: "Terraza con estufas de exterior (setas de gas/braseros)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Flame" },
  { key: "almacenamiento_lena_cubierta", code: "C01.5.11", label: "Zona de almacenamiento exterior para leña cubierta", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Archive" },

  // C01.6. Equipamiento de los Baños (Privado o Compartido)
  { key: "papel_higienico", code: "C01.6.2.1", label: "Papel higiénico", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Baño", scope: "privado", iconName: "FileText" },
  { key: "papel_manos", code: "C01.6.2.2", label: "Papel de manos", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Baño", scope: "privado", iconName: "FileText" },
  { key: "toallas_bano", code: "C01.6.2.3", label: "Toallas en baño", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Baño", scope: "privado", iconName: "Droplets" },
  { key: "toallas_habitacion", code: "C01.6.2.4", label: "Toallas en habitación (baño compartido)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Baño", scope: "comun", iconName: "Droplets" },
  { key: "ducha_ras_suelo", code: "C01.6.2.5", label: "Ducha ras de suelo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Baño", scope: "privado", iconName: "Droplets" },
  { key: "banera_profunda", code: "C01.6.2.6", label: "Bañera profunda", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Baño", scope: "privado", iconName: "Bath" },
  { key: "jacuzzis_hidromasaje_privado", code: "C01.6.2.7", label: "Jacuzzis/hidromasaje privado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Baño", scope: "privado", iconName: "Bath" },
  { key: "secador_pelo", code: "C01.6.2.8", label: "Secador de pelo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Baño", scope: "privado", iconName: "Wind" },
  { key: "albornoz", code: "C01.6.2.9", label: "Albornoz", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Baño", scope: "privado", iconName: "Shirt" },
  { key: "zapatillas", code: "C01.6.2.10", label: "Zapatillas", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Baño", scope: "privado", iconName: "Footprints" },
  { key: "articulos_aseo", code: "C01.6.2.11", label: "Artículos de aseo gratuitos", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Baño", scope: "privado", iconName: "Sparkles" },
  { key: "bidet", code: "C01.6.2.12", label: "Bidet", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Baño", scope: "privado", iconName: "Droplets" },
  { key: "ducha_higienica", code: "C01.6.2.13", label: "Ducha higiénica", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Baño", scope: "privado", iconName: "Droplets" },
  { key: "toalleros_electricos_calefactados", code: "C01.6.2.14", label: "Toalleros eléctricos calefactados en todos los baños", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Baño", scope: "privado", iconName: "Flame" },

  // C01.6.3. Baño Adaptado PMR (Privado o Compartido)
  { key: "lavamanos_bajo", code: "C01.6.3.1", label: "Lavamanos más bajo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "Accessibility" },
  { key: "wc_elevado", code: "C01.6.3.2", label: "WC elevado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "Accessibility" },
  { key: "wc_barras_apoyo", code: "C01.6.3.3", label: "WC con barras de apoyo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "Accessibility" },
  { key: "ducha_adaptada_silla", code: "C01.6.3.4", label: "Ducha adaptada para sillas de ruedas", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "Accessibility" },
  { key: "banera_adaptada_silla", code: "C01.6.3.5", label: "Bañera a ras de suelo adaptada con silla", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "Accessibility" },
  { key: "cuerda_emergencia_bano", code: "C01.6.3.6", label: "Cuerda de emergencia en el baño", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "AlertTriangle" },
  { key: "senalizacion_braille_bano", code: "C01.6.3.7", label: "Señalización en braille", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "Accessibility" },
  { key: "guiado_auditivo_bano", code: "C01.6.3.8", label: "Guiado auditivo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "Accessibility" },

  // C01.7. ZONAS COMUNES E INSTALACIONES DEL ESTABLECIMIENTO
  // C01.7.1 Bienestar, Salud y Relax
  { key: "piscina_exterior", code: "C01.7.1.1", label: "Piscina exterior", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Waves" },
  { key: "piscina_interior", code: "C01.7.1.2", label: "Piscina interior (climatizada)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Waves" },
  { key: "spa", code: "C01.7.1.3", label: "Spa", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Sparkles" },
  { key: "sauna", code: "C01.7.1.4", label: "Sauna", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Flame" },
  { key: "bano_turco_hammam", code: "C01.7.1.5", label: "Baño turco / hammam", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Flame" },
  { key: "gimnasio", code: "C01.7.1.6", label: "Gimnasio", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Dumbbell" },
  { key: "zona_yoga", code: "C01.7.1.7", label: "Zona de Yoga", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Smile" },
  { key: "solarium", code: "C01.7.1.8", label: "Solárium", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Sun" },

  // C01.7.2. Ocio y Espacios Sociales
  { key: "salon_tv_comun", code: "C01.7.2.1", label: "Salón de uso común con TV", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Tv" },
  { key: "sala_juegos", code: "C01.7.2.2", label: "Sala de juegos (Billar, Dardos, Futbolin)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Trophy" },
  { key: "biblioteca", code: "C01.7.2.3", label: "Biblioteca", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Archive" },
  { key: "cocina_equipada_comun", code: "C01.7.2.4", label: "Cocina equipada / compartida", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "ChefHat" },
  { key: "zona_barbacoa_comun", code: "C01.7.2.5", label: "Zona de barbacoa", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Flame" },
  { key: "parque_infantil", code: "C01.7.2.6", label: "Parque infantil", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Smile" },
  { key: "jardin_comun", code: "C01.7.2.7", label: "Jardín", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "TreePine" },
  { key: "parque_acuatico", code: "C01.7.2.8", label: "Parque acuático", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Waves" },
  { key: "toboganes_aguas", code: "C01.7.2.9", label: "Toboganes de aguas", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Waves" },
  { key: "campos_futbol_polideportivos", code: "C01.7.2.10", label: "Campos de fútbol, polideportivos", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Trophy" },
  { key: "pistas_tenis", code: "C01.7.2.11", label: "Pistas de tenis", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Trophy" },
  { key: "ping_pong", code: "C01.7.2.12", label: "Ping Pong", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Trophy" },
  { key: "minigolf", code: "C01.7.2.13", label: "Minigolf", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Trophy" },
  { key: "granja_educativa", code: "C01.7.2.14", label: "Granja educativa", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "TreePine" },
  { key: "bolos", code: "C01.7.2.15", label: "Bolos", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Trophy" },
  { key: "area_fitness", code: "C01.7.2.16", label: "Área de fitness", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Dumbbell" },
  { key: "acceso_directo_playa", code: "C01.7.2.17", label: "Acceso directo a la playa", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Sun" },
  { key: "junto_al_mar", code: "C01.7.2.18", label: "Junto al mar", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Waves" },

  // C01.7.3. Infraestructuras de Negocios y Eventos
  { key: "salas_reuniones", code: "C01.7.3.1", label: "Salas de reuniones", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "servicios", subCategory: "Infraestructuras de Negocios y Eventos", scope: "comun", iconName: "Briefcase" },
  { key: "impresora", code: "C01.7.3.2", label: "Impresora", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "servicios", subCategory: "Infraestructuras de Negocios y Eventos", scope: "comun", iconName: "Briefcase" },
  { key: "salon_actos_eventos", code: "C01.7.3.3", label: "Salón de actos/eventos", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "servicios", subCategory: "Infraestructuras de Negocios y Eventos", scope: "comun", iconName: "Briefcase" },
  { key: "zonas_coworking", code: "C01.7.3.4", label: "Zonas coworking", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "servicios", subCategory: "Infraestructuras de Negocios y Eventos", scope: "comun", iconName: "Briefcase" },

  // C01.8. Abastecimiento y Energía
  { key: "planta_electrica_24_7", code: "C01.8.1", label: "Planta Eléctrica 24/7 (Full Power)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "general", subCategory: "Abastecimiento y Energía", scope: "comun", iconName: "Zap" },
  { key: "tanque_agua_continuo", code: "C01.8.2", label: "Tanque de Agua continuo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "general", subCategory: "Abastecimiento y Energía", scope: "comun", iconName: "Droplets" },

  // ==========================================
  // C02. SERVICIOS Y EXPERIENCIAS (Intangibles)
  // ==========================================
  
  // C02.1. Servicios de Atención y Recepción
  { key: "recepcion_24h", code: "C02.1.1.1", label: "Recepción 24h", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención al Cliente", scope: "servicio", iconName: "Clock" },
  { key: "servicio_conserjeria", code: "C02.1.1.2", label: "Servicio de conserjería", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención al Cliente", scope: "servicio", iconName: "ConciergeBell" },
  { key: "guarda_equipaje", code: "C02.1.1.3", label: "Guarda-equipaje", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención al Cliente", scope: "servicio", iconName: "Briefcase" },
  { key: "registro_entrada_salida_expres", code: "C02.1.1.4", label: "Registro de entrada/salida exprés", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención al Cliente", scope: "servicio", iconName: "Clock" },
  { key: "mostrador_info_turistica", code: "C02.1.1.5", label: "Mostrador de información turística", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención al Cliente", scope: "servicio", iconName: "Compass" },
  { key: "cuna_adicional_habitacion", code: "C02.1.1.9", label: "Cuna adicional en la habitación", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención al Cliente", scope: "servicio", iconName: "Smile" },

  // C02.1.2. Atención Multilingüe
  { key: "idioma_aleman", code: "C02.1.2.1", label: "Alemán", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención Multilingüe", scope: "servicio", iconName: "Globe" },
  { key: "idioma_ingles", code: "C02.1.2.2", label: "Inglés", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención Multilingüe", scope: "servicio", iconName: "Globe" },
  { key: "idioma_espanol", code: "C02.1.2.3", label: "Español", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención Multilingüe", scope: "servicio", iconName: "Globe" },
  { key: "idioma_frances", code: "C02.1.2.4", label: "Francés", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención Multilingüe", scope: "servicio", iconName: "Globe" },
  { key: "idioma_portugues", code: "C02.1.2.5", label: "Portugués", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención Multilingüe", scope: "servicio", iconName: "Globe" },

  // C02.2. Gastronomía y Alimentos - Hostelería interna
  { key: "restaurante", code: "C02.2.1.1", label: "Restaurante", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Hostelería interna", scope: "comun", iconName: "Utensils" },
  { key: "bar_cafeteria", code: "C02.2.1.2", label: "Bar/Cafetería", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Hostelería interna", scope: "comun", iconName: "Coffee" },
  { key: "bar_en_piscina", code: "C02.2.1.3", label: "Bar en la piscina", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Hostelería interna", scope: "comun", iconName: "Wine" },
  { key: "servicio_habitaciones", code: "C02.2.1.4", label: "Servicio de habitaciones", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Hostelería interna", scope: "servicio", iconName: "ConciergeBell" },
  { key: "menus_dietas_especiales", code: "C02.2.1.5", label: "Menús para dietas especiales", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Hostelería interna", scope: "servicio", iconName: "Utensils" },
  { key: "desayuno_en_habitacion", code: "C02.2.1.6", label: "Desayuno en la habitación", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Hostelería interna", scope: "servicio", iconName: "Coffee" },
  { key: "maquina_expendedora_aperitivos", code: "C02.2.1.7", label: "Máquina expendedora (aperitivos)", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Hostelería interna", scope: "comun", iconName: "Coffee" },
  { key: "maquina_expendedora_bebidas", code: "C02.2.1.8", label: "Máquina expendedora (bebidas)", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Hostelería interna", scope: "comun", iconName: "Wine" },

  // C02.3. Mantenimiento habitaciones y limpieza de ropa
  { key: "servicio_limpieza_diaria", code: "C02.3.1", label: "Servicio de limpieza diaria", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Mantenimiento y Limpieza", scope: "servicio", iconName: "Sparkles" },
  { key: "servicio_lavanderia", code: "C02.3.2", label: "Servicio de lavandería", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Mantenimiento y Limpieza", scope: "servicio", iconName: "Shirt" },
  { key: "limpieza_en_seco", code: "C02.3.3", label: "Limpieza en seco", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Mantenimiento y Limpieza", scope: "servicio", iconName: "Shirt" },
  { key: "servicio_planchado", code: "C02.3.4", label: "Servicio de planchado", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Mantenimiento y Limpieza", scope: "servicio", iconName: "Shirt" },
  { key: "lavanderia_compartida_monedas", code: "C02.3.5", label: "Lavandería compartida (de monedas)", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Mantenimiento y Limpieza", scope: "comun", iconName: "Shirt" },

  // C02.4. Conectividad y Movilidad
  { key: "wifi_gratis", code: "C02.4.1.1", label: "Wifi gratis", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Conexión a Internet", scope: "servicio", iconName: "Wifi" },
  { key: "wifi_de_pago", code: "C02.4.1.2", label: "Wifi de pago", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Conexión a Internet", scope: "servicio", iconName: "Wifi" },
  { key: "parking_cubierto_gratis", code: "C02.4.2.1", label: "Parking privado cubierto gratis", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Movilidad y Transporte", scope: "comun", iconName: "Car" },
  { key: "parking_descubierto_gratis", code: "C02.4.2.2", label: "Parking privado descubierto gratis", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Movilidad y Transporte", scope: "comun", iconName: "Car" },
  { key: "parking_cubierto_pago", code: "C02.4.2.3", label: "Parking privado cubierto de pago (precio)", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Movilidad y Transporte", scope: "comun", iconName: "Car" },
  { key: "parking_descubierto_pago", code: "C02.4.2.4", label: "Parking privado descubierto de pago (precio)", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Movilidad y Transporte", scope: "comun", iconName: "Car" },
  { key: "posibilidad_reservar_parking", code: "C02.4.2.5", label: "Posibilidad de reservar Parking", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Movilidad y Transporte", scope: "servicio", iconName: "Car" },
  { key: "parking_publico_cercano", code: "C02.4.2.6", label: "Parking público cercano", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Movilidad y Transporte", scope: "comun", iconName: "Car" },
  { key: "parking_adaptado_pmr", code: "C02.4.2.7", label: "Parking adaptado para personas de movilidad reducida", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Movilidad y Transporte", scope: "comun", iconName: "Accessibility" },
  { key: "estacion_carga_ev", code: "C02.4.2.8", label: "Estación de carga de vehículos eléctricos", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Movilidad y Transporte", scope: "comun", iconName: "Zap" },
  { key: "traslado_aeropuerto", code: "C02.4.2.9", label: "Servicio de traslado al aeropuerto", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Movilidad y Transporte", scope: "servicio", iconName: "Plane" },
  { key: "alquiler_bicicletas", code: "C02.4.2.10", label: "Alquiler de bicicletas", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Movilidad y Transporte", scope: "servicio", iconName: "Compass" },
  { key: "alquiler_coches", code: "C02.4.2.11", label: "Alquiler de coches", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Movilidad y Transporte", scope: "servicio", iconName: "Car" },

  // C02.5. Actividades y Entretenimiento Organizado
  { key: "rutas_senderismo", code: "C02.5.1.1", label: "Rutas de senderismo", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "TreePine" },
  { key: "clases_cocina", code: "C02.5.1.2", label: "Clases de cocina", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "ChefHat" },
  { key: "visitas_guiadas", code: "C02.5.1.3", label: "Visitas guiadas", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Compass" },
  { key: "deportes_acuaticos", code: "C02.5.1.4", label: "Deportes acuáticos", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Waves" },
  { key: "tours_a_pie", code: "C02.5.1.5", label: "Tours a pie", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Compass" },
  { key: "tours_en_bici", code: "C02.5.1.6", label: "Tours en bici", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Compass" },
  { key: "noches_de_cine", code: "C02.5.1.7", label: "Noches de cine", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Tv" },
  { key: "musica_espectaculos_directo", code: "C02.5.1.8", label: "Música/espectáculos en directo", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Music" },
  { key: "club_infantil", code: "C02.5.1.9", label: "Club infantil", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Smile" },
  { key: "club_adolescentes_actividades", code: "C02.5.1.10", label: "Club de adolescentes y actividades", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Smile" },
  { key: "equitacion", code: "C02.5.1.11", label: "Equitación", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Trophy" },
  { key: "pesca", code: "C02.5.1.12", label: "Pesca", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Waves" },
  { key: "golf", code: "C02.5.1.13", label: "Golf", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Trophy" },
  { key: "escalada_arboles", code: "C02.5.1.14", label: "Escalada de árboles", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "TreePine" },
  { key: "kayak_en_canoa", code: "C02.5.1.15", label: "Kayak en Canoa", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Waves" },
  { key: "paseos_lancha_snorkel", code: "C02.5.1.16", label: "Paseos en lancha / Snorkel", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Waves" },
  { key: "ruta_gastronomica_catas", code: "C02.5.1.17", label: "Ruta gastronómica / Catas", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Utensils" },

  // ==========================================
  // C03. GESTIÓN, POLÍTICAS Y LOGÍSTICA (Normas y Accesibilidad)
  // ==========================================
  
  // C03.1. Accesibilidad e Inclusión (Adaptabilidad)
  { key: "accesible_silla_ruedas", code: "C03.1.1", label: "Todo el alojamiento accesible en silla de ruedas", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "servicio", iconName: "Accessibility" },
  { key: "ascensor", code: "C03.1.2", label: "Acceso a pisos superiores o inferiores en ascensor", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "comun", iconName: "ArrowUpSquare" },
  { key: "todo_en_planta_baja", code: "C03.1.3", label: "Todo en planta baja", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "comun", iconName: "Home" },
  { key: "lavamanos_publico_bajo", code: "C03.1.4", label: "Lavamanos público más bajo", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "comun", iconName: "Accessibility" },
  { key: "wc_publico_barras", code: "C03.1.5", label: "WC público con barras de apoyo", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "comun", iconName: "Accessibility" },
  { key: "senalizacion_braille_publica", code: "C03.1.6", label: "Señalización en braille", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "comun", iconName: "Accessibility" },
  { key: "guiado_auditivo_publico", code: "C03.1.7", label: "Guiado auditivo", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "comun", iconName: "Accessibility" },

  // C03.2. Seguridad y Protección
  { key: "camaras_seguridad", code: "C03.2.1", label: "Cámaras de seguridad en las zonas comunes", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Seguridad y Protección", scope: "comun", iconName: "Eye" },
  { key: "detectores_humo", code: "C03.2.2", label: "Detectores de humo", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Seguridad y Protección", scope: "comun", iconName: "AlertTriangle" },
  { key: "extintores", code: "C03.2.3", label: "Extintores", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Seguridad y Protección", scope: "comun", iconName: "Flame" },
  { key: "personal_seguridad_24h", code: "C03.2.4", label: "Personal de Seguridad 24 horas", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Seguridad y Protección", scope: "servicio", iconName: "ShieldCheck" },
  { key: "tarjetas_acceso_electronicas", code: "C03.2.5", label: "Tarjetas de acceso electrónicas", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Seguridad y Protección", scope: "servicio", iconName: "Lock" },
  { key: "caja_fuerte_principal_recepcion", code: "C03.2.6", label: "Caja fuerte principal en recepción", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Seguridad y Protección", scope: "servicio", iconName: "Lock" },

  // C03.3. Políticas y Normas de la Propiedad
  // Horarios
  { key: "horario_checkin_admision", code: "C03.3.1.1", label: "Horario de Check-in (Admisión) Desde/hasta", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas y Normas", scope: "general", iconName: "Clock" },
  { key: "horario_checkout_salida", code: "C03.3.1.2", label: "Horario de Check-out (Salida) Desde/hasta", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas y Normas", scope: "general", iconName: "Clock" },
  { key: "posibilidad_late_checkout", code: "C03.3.1.3", label: "Posibilidad de Late Check-out Hasta", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas y Normas", scope: "general", iconName: "Clock" },

  // Mascotas
  { key: "admision_mascotas_gratis", code: "C03.3.2.1", label: "Admisión de mascotas gratis", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas y Normas", scope: "general", iconName: "Dog" },
  { key: "admision_mascotas_suplemento", code: "C03.3.2.2", label: "Admisión de mascotas con suplemento. Precio", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas y Normas", scope: "general", iconName: "Dog" },
  { key: "camas_mascotas", code: "C03.3.2.3", label: "Camas para mascotas", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas y Normas", scope: "general", iconName: "Dog" },
  { key: "no_se_admiten_mascotas", code: "C03.3.2.4", label: "No se admiten mascotas", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas y Normas", scope: "general", iconName: "Ban" },

  // Perfil de Huésped
  { key: "familias_apto_ninos", code: "C03.3.3.1", label: "Familias (Apto para niños)", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas y Normas", scope: "general", iconName: "Users" },
  { key: "solo_adultos_parejas", code: "C03.3.3.2", label: "Solo para adultos / Parejas", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas y Normas", scope: "general", iconName: "UserCheck" },
  { key: "travel_proud_lgtb", code: "C03.3.3.3", label: "Travel Proud (LGTB + friendly)", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas y Normas", scope: "general", iconName: "Heart" },

  // Tabaco y Fiestas
  { key: "prohibido_fumar_todo_alojamiento", code: "C03.3.4.1", label: "Prohibido fumar en todo el alojamiento", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas y Normas", scope: "general", iconName: "Ban" },
  { key: "zonas_habilitadas_fumadores", code: "C03.3.4.2", label: "Zonas habilitadas para fumadores", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas y Normas", scope: "comun", iconName: "Flame" },
  { key: "prohibida_celebracion_fiestas", code: "C03.3.4.3", label: "Prohibida la celebración de fiestas/eventos", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas y Normas", scope: "general", iconName: "Ban" },
  { key: "minimizar_ruido_nocturno", code: "C03.3.4.4", label: "Los clientes deben minimizar el ruido de ___h a ___h", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas y Normas", scope: "general", iconName: "VolumeX" },

  // Políticas Especiales
  { key: "love_hotels_entrada_salida_discreta", code: "C03.3.5.1", label: "Entrada/Salida discreta o automatizada (Love hoteles)", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas Especiales", scope: "general", iconName: "Lock" },
  { key: "love_hotels_alquiler_horas", code: "C03.3.5.2", label: "Alquiler por horas (Love hoteles)", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas Especiales", scope: "general", iconName: "Clock" },
  { key: "albergues_toque_queda", code: "C03.3.5.3", label: "Hora de toque de queda (Residencias y albergues)", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas Especiales", scope: "general", iconName: "Clock" },
  { key: "albergues_edad_minima", code: "C03.3.5.4", label: "Edad mínima de admisión (Residencias y Albergues)", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas Especiales", scope: "general", iconName: "UserCheck" },

  // Pago online
  { key: "pago_tarjeta", code: "C03.3.6.1", label: "Tarjeta (VISA, MC)", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Pago online", scope: "general", iconName: "Zap" },
  { key: "pago_bizum", code: "C03.3.6.2", label: "Bizum (España)", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Pago online", scope: "general", iconName: "Zap" },
  { key: "pago_crypto", code: "C03.3.6.3", label: "Binance USDT / Crypto", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Pago online", scope: "general", iconName: "Zap" },
  { key: "pago_movil", code: "C03.3.6.4", label: "Pago Móvil (Bs. VES)", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Pago online", scope: "general", iconName: "Zap" },
  { key: "pago_zelle", code: "C03.3.6.5", label: "Zelle (USD) (Venezuela)", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Pago online", scope: "general", iconName: "Zap" },

  // Régimen de Estancia
  { key: "regimen_con_cocina", code: "C03.3.7.1", label: "Con cocina", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Régimen de Estancia", scope: "general", iconName: "Utensils" },
  { key: "regimen_desayuno_incluido", code: "C03.3.7.2", label: "Desayuno incluido", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Régimen de Estancia", scope: "general", iconName: "Coffee" },
  { key: "regimen_todas_comidas_incluidas", code: "C03.3.7.3", label: "Todas las comidas incluidas", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Régimen de Estancia", scope: "general", iconName: "Utensils" },
  { key: "regimen_desayuno_cena_incluidos", code: "C03.3.7.4", label: "Desayuno y cena incluidos", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Régimen de Estancia", scope: "general", iconName: "Utensils" },
  { key: "restaurante_en_propiedad", code: "C03.3.7.5", label: "Restaurante en la propiedad", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Régimen de Estancia", scope: "general", iconName: "Utensils" },

  // Condiciones de la reserva
  { key: "cancelacion_gratis", code: "C03.3.8.1", label: "Cancelación gratis", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Condiciones de la reserva", scope: "general", iconName: "Check" },
  { key: "reservas_sin_tarjeta", code: "C03.3.8.2", label: "Reservas sin tarjeta de crédito", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Condiciones de la reserva", scope: "general", iconName: "Check" },

  // Condiciones para estancia de niños
  { key: "ninos_cualquier_edad", code: "C03.3.9.1", label: "Se pueden alojar niños de cualquier edad.", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Condiciones para estancia de niños", scope: "general", iconName: "Smile" },
  { key: "ninos_pagan_adulto_desde_edad", code: "C03.3.9.2", label: "Los niños a partir de X años pagan como adultos en este alojamiento.", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Condiciones para estancia de niños", scope: "general", iconName: "Smile" },

  // ==========================================
  // C04. INSTALACIONES Y SERVICIOS ESPECÍFICOS POR TIPOLOGÍA
  // ==========================================
  
  // C04.3. LOVE HOTELS & MOTELES (BOTÓN 4)
  // C04.3.1. Descanso y Mobiliario Erótico
  { key: "love_cama_reforzada", code: "C04.3.1.1", label: "Cama King/Queen Size con colchón reforzado", pillar: "C04", pillarLabel: "C04. Específicos Love Hotels", category: "especificos", subCategory: "Love Hotels - Descanso y Mobiliario Erótico", scope: "especifico", iconName: "Bed" },
  { key: "love_sillon_tantra", code: "C04.3.1.2", label: "Sillón Tantra", pillar: "C04", pillarLabel: "C04. Específicos Love Hotels", category: "especificos", subCategory: "Love Hotels - Descanso y Mobiliario Erótico", scope: "especifico", iconName: "Heart" },
  { key: "love_espejos_estrategicos", code: "C04.3.1.3", label: "Espejos estratégicos", pillar: "C04", pillarLabel: "C04. Específicos Love Hotels", category: "especificos", subCategory: "Love Hotels - Descanso y Mobiliario Erótico", scope: "especifico", iconName: "Eye" },

  // C04.3.2. Baño Privado y Zona de Agua
  { key: "love_jacuzzi_xl_habitacion", code: "C04.3.2.1", label: "Jacuzzi XL / Hidromasaje privado en la habitación", pillar: "C04", pillarLabel: "C04. Específicos Love Hotels", category: "especificos", subCategory: "Love Hotels - Baño y Zona de Agua", scope: "especifico", iconName: "Bath" },
  { key: "love_ducha_cristal_vista", code: "C04.3.2.2", label: "Ducha de cristal transparente vista desde la cama", pillar: "C04", pillarLabel: "C04. Específicos Love Hotels", category: "especificos", subCategory: "Love Hotels - Baño y Zona de Agua", scope: "especifico", iconName: "Droplets" },
  { key: "love_kits_higiene_erotica", code: "C04.3.2.3", label: "Kits de higiene íntima y cosmética erótica", pillar: "C04", pillarLabel: "C04. Específicos Love Hotels", category: "especificos", subCategory: "Love Hotels - Baño y Zona de Agua", scope: "especifico", iconName: "Sparkles" },

  // C04.3.3. Climatización y Ambientación
  { key: "love_led_regulable_colores", code: "C04.3.3.1", label: "Iluminación LED regulable por zonas y colores", pillar: "C04", pillarLabel: "C04. Específicos Love Hotels", category: "especificos", subCategory: "Love Hotels - Climatización y Ambientación", scope: "especifico", iconName: "Sparkles" },
  { key: "love_insonorizacion_reforzada", code: "C04.3.3.2", label: "Insonorización acústica reforzada", pillar: "C04", pillarLabel: "C04. Específicos Love Hotels", category: "especificos", subCategory: "Love Hotels - Climatización y Ambientación", scope: "especifico", iconName: "VolumeX" },
  { key: "love_climatizacion_rapida", code: "C04.3.3.3", label: "Climatización individual rápida e independiente", pillar: "C04", pillarLabel: "C04. Específicos Love Hotels", category: "especificos", subCategory: "Love Hotels - Climatización y Ambientación", scope: "especifico", iconName: "Wind" },

  // C04.3.4. Tecnología y Entretenimiento
  { key: "love_canales_adultos", code: "C04.3.4.1", label: "Canales de contenido adultos (X/Erótico) incluido", pillar: "C04", pillarLabel: "C04. Específicos Love Hotels", category: "especificos", subCategory: "Love Hotels - Tecnología", scope: "especifico", iconName: "Tv" },

  // C04.3.5. Exteriores Privados
  { key: "love_terraza_jacuzzi_opaco", code: "C04.3.5.1", label: "Terraza con Jacuzzi o piscina privada sin visibilidad exterior (pantallas opacas)", pillar: "C04", pillarLabel: "C04. Específicos Love Hotels", category: "especificos", subCategory: "Love Hotels - Exteriores Privados", scope: "especifico", iconName: "Sun" },

  // C04.3.6. Acceso e Infraestructura de Privacidad
  { key: "love_garaje_individual_automatico", code: "C04.3.6.1", label: "Garaje privado individual con puerta automática (Check-in sin bajarte del coche)", pillar: "C04", pillarLabel: "C04. Específicos Love Hotels", category: "especificos", subCategory: "Love Hotels - Privacidad y Acceso", scope: "especifico", iconName: "Car" },
  { key: "love_torno_pass_through_box", code: "C04.3.6.2", label: "Torno / 'Pass-through Box' de entrega anónimo", pillar: "C04", pillarLabel: "C04. Específicos Love Hotels", category: "especificos", subCategory: "Love Hotels - Privacidad y Acceso", scope: "especifico", iconName: "Lock" },
  { key: "love_entradas_salidas_independientes", code: "C04.3.6.3", label: "Entrada y salida por accesos independientes", pillar: "C04", pillarLabel: "C04. Específicos Love Hotels", category: "especificos", subCategory: "Love Hotels - Privacidad y Acceso", scope: "especifico", iconName: "Lock" },

  // C04.3.7. Servicios de Atención
  { key: "love_checkin_automatizado", code: "C04.3.7.1", label: "Check-in / Check-out automatizado", pillar: "C04", pillarLabel: "C04. Específicos Love Hotels", category: "especificos", subCategory: "Love Hotels - Servicios de Atención", scope: "especifico", iconName: "Clock" },
  { key: "love_horario_24_365", code: "C04.3.7.2", label: "Horario 24/365", pillar: "C04", pillarLabel: "C04. Específicos Love Hotels", category: "especificos", subCategory: "Love Hotels - Servicios de Atención", scope: "especifico", iconName: "Clock" },
  { key: "love_facturacion_anonima", code: "C04.3.7.3", label: "Facturación y cobro 100% anónimo", pillar: "C04", pillarLabel: "C04. Específicos Love Hotels", category: "especificos", subCategory: "Love Hotels - Servicios de Atención", scope: "especifico", iconName: "ShieldCheck" },

  // C04.4. CHALETS DE MONTAÑA / ESQUÍ (BOTÓN 2)
  // C04.4.1. Interiores del Chalet
  { key: "esqui_chimenea_lena", code: "C04.4.1.1.1", label: "Chimenea de leña", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Descanso Térmico", scope: "especifico", iconName: "Flame" },
  { key: "esqui_estufa_pellets", code: "C04.4.1.1.2", label: "Estufa de pellets o casete térmico (leña de cortesía)", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Descanso Térmico", scope: "especifico", iconName: "Flame" },
  { key: "esqui_ropa_cama_termica", code: "C04.4.1.1.3", label: "Ropa de cama térmica/nórdica alto gramaje y mantas extra", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Descanso Térmico", scope: "especifico", iconName: "Bed" },
  { key: "esqui_suelos_madera_noble", code: "C04.4.1.1.4", label: "Revestimientos y suelos de madera noble", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Descanso Térmico", scope: "especifico", iconName: "Home" },

  // C04.4.1.2 Baño Privado/Compartido
  { key: "esqui_jacuzzi_recuperacion", code: "C04.4.1.2.1", label: "Jacuzzi privado para recuperación muscular", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Baño", scope: "especifico", iconName: "Bath" },
  { key: "esqui_toalleros_electricos", code: "C04.4.1.2.2", label: "Toalleros eléctricos calefactados en todos los baños", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Baño", scope: "especifico", iconName: "Flame" },

  // C04.4.1.3 Cocina y Menaje
  { key: "esqui_set_fondue", code: "C04.4.1.3.1", label: "Set de Fondue", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Cocina", scope: "especifico", iconName: "ChefHat" },
  { key: "esqui_raclette", code: "C04.4.1.3.2", label: "Raclette", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Cocina", scope: "especifico", iconName: "ChefHat" },
  { key: "esqui_despensa_nieve", code: "C04.4.1.3.3", label: "Despensa de gran capacidad para estancias de nieve", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Cocina", scope: "especifico", iconName: "Archive" },

  // C04.4.1.4 Climatización y Suministros
  { key: "esqui_suelo_radiante", code: "C04.4.1.4.1", label: "Calefacción suelo radiante o radiadores de alta eficiencia", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Climatización", scope: "especifico", iconName: "Flame" },
  { key: "esqui_termostatos_programables", code: "C04.4.1.4.2", label: "Termostatos programables por zonas/plantas", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Climatización", scope: "especifico", iconName: "Flame" },

  // C04.4.1.5 Exteriores Privados
  { key: "esqui_hot_tub_madera", code: "C04.4.1.5.1", label: "Jacuzzi exterior / Bañera nórdica (Hot Tub)", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Exteriores", scope: "especifico", iconName: "Bath" },
  { key: "esqui_balcon_vistas_pistas", code: "C04.4.1.5.2", label: "Balcón o terraza panorámica con vistas a las pistas/montaña", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Exteriores", scope: "especifico", iconName: "Mountain" },
  { key: "esqui_estufas_exterior", code: "C04.4.1.5.3", label: "Terraza con estufas de exterior (setas de gas/braseros)", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Exteriores", scope: "especifico", iconName: "Flame" },
  { key: "esqui_almacen_lena_cubierta", code: "C04.4.1.5.4", label: "Zona de almacenamiento exterior para leña cubierta", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Exteriores", scope: "especifico", iconName: "Archive" },

  // C04.4.1.6 Instalaciones Específicas de Esquí y Montaña
  { key: "esqui_guardaesquis_ski_room", code: "C04.4.1.6.1", label: "Guardaesquís (Ski Room)", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Esquí", scope: "especifico", iconName: "Mountain" },
  { key: "esqui_secador_botas", code: "C04.4.1.6.2", label: "Secador de botas de esquí", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Esquí", scope: "especifico", iconName: "Wind" },
  { key: "esqui_mudroom_vestuario", code: "C04.4.1.6.3", label: "Zona de vestuario térmico (Mudroom)", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Esquí", scope: "especifico", iconName: "Shirt" },
  { key: "esqui_acceso_ski_in_out", code: "C04.4.1.6.4", label: "Acceso Ski-in / Ski-out", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Esquí", scope: "especifico", iconName: "Mountain" },
  { key: "esqui_garaje_calefactado", code: "C04.4.1.6.5", label: "Garaje privado cubierto y calefactado", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Esquí", scope: "especifico", iconName: "Car" },
  { key: "esqui_sauna_privada", code: "C04.4.1.6.6", label: "Sauna finlandesa o Baño turco privado", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Esquí", scope: "especifico", iconName: "Flame" },
  { key: "esqui_sauna_compartida", code: "C04.4.1.6.7", label: "Sauna finlandesa o Baño turco compartido", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Esquí", scope: "comun", iconName: "Flame" },

  // C04.4.1.7 Servicios de Atención y Transporte
  { key: "esqui_shuttle_telecabinas", code: "C04.4.1.7.1", label: "Servicio de Shuttle privado o transfer diario a las telecabinas", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Servicios y Transporte", scope: "especifico", iconName: "Car" },
  { key: "esqui_venta_forfaits", code: "C04.4.1.7.2", label: "Venta o entrega de Forfaits directamente en el chalet", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Servicios y Transporte", scope: "especifico", iconName: "Check" },
  { key: "esqui_reserva_clases", code: "C04.4.1.7.3", label: "Servicio de reserva de clases de esquí", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Servicios y Transporte", scope: "especifico", iconName: "Trophy" },

  // C04.4.1.8 Hostelería / Catering de Montaña
  { key: "esqui_chef_privado", code: "C04.4.1.8.1", label: "Servicio de Chef privado a domicilio para cenas tras el esquí", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Catering", scope: "especifico", iconName: "ChefHat" },
  { key: "esqui_entrega_pan_fresco", code: "C04.4.1.8.2", label: "Servicio de entrega diaria de pan fresco y repostería", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Catering", scope: "especifico", iconName: "Coffee" },

  // C04.4.1.9 Actividades Organizadas
  { key: "esqui_raquetas_nieve", code: "C04.4.1.9.1", label: "Alquiler o provisión de raquetas de nieve", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Actividades", scope: "especifico", iconName: "Compass" },
  { key: "esqui_trineos_ninos", code: "C04.4.1.9.2", label: "Trineos para niños", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Actividades", scope: "especifico", iconName: "Smile" },
  { key: "esqui_guias_heliesqui", code: "C04.4.1.9.3", label: "Guías de montaña para esquí de travesía o heliesquí", pillar: "C04", pillarLabel: "C04. Específicos Chalets Montaña/Esquí", category: "especificos", subCategory: "Chalets Montaña - Actividades", scope: "especifico", iconName: "Mountain" },

  // C04.1. CAMPINGS / GLAMPINGS (BOTÓN 3)
  { key: "c_mobil_home", code: "C04.1.1.1", label: "Mobil-home", pillar: "C04", pillarLabel: "C04. Específicos Campings", category: "especificos", subCategory: "Campings - Tipo Alojamiento", scope: "especifico", iconName: "Tent" },
  { key: "c_bungalow", code: "C04.1.1.2", label: "Bungalow", pillar: "C04", pillarLabel: "C04. Específicos Campings", category: "especificos", subCategory: "Campings - Tipo Alojamiento", scope: "especifico", iconName: "Home" },
  { key: "c_tienda_lona", code: "C04.1.1.3", label: "Tienda de lona", pillar: "C04", pillarLabel: "C04. Específicos Campings", category: "especificos", subCategory: "Campings - Tipo Alojamiento", scope: "especifico", iconName: "Tent" },
  { key: "c_tiendas_safari", code: "C04.1.1.4", label: "Tiendas safari", pillar: "C04", pillarLabel: "C04. Específicos Campings", category: "especificos", subCategory: "Campings - Tipo Alojamiento", scope: "especifico", iconName: "Tent" },
  { key: "c_tiendas_tipi", code: "C04.1.1.5", label: "Tiendas tipi", pillar: "C04", pillarLabel: "C04. Específicos Campings", category: "especificos", subCategory: "Campings - Tipo Alojamiento", scope: "especifico", iconName: "Tent" },
  { key: "c_casas_arboles", code: "C04.1.1.6", label: "Casas en los árboles", pillar: "C04", pillarLabel: "C04. Específicos Campings", category: "especificos", subCategory: "Campings - Tipo Alojamiento", scope: "especifico", iconName: "TreePine" },
  { key: "c_yurtas", code: "C04.1.1.7", label: "Yurtas", pillar: "C04", pillarLabel: "C04. Específicos Campings", category: "especificos", subCategory: "Campings - Tipo Alojamiento", scope: "especifico", iconName: "Tent" },
  { key: "c_parcela_tienda", code: "C04.1.1.10", label: "Parcela para tienda", pillar: "C04", pillarLabel: "C04. Específicos Campings", category: "especificos", subCategory: "Campings - Tipo Alojamiento", scope: "especifico", iconName: "Tent" },
  { key: "c_parcela_caravana", code: "C04.1.1.11", label: "Parcela para caravana", pillar: "C04", pillarLabel: "C04. Específicos Campings", category: "especificos", subCategory: "Campings - Tipo Alojamiento", scope: "especifico", iconName: "Car" },
  { key: "c_parcela_autocaravana", code: "C04.1.1.12", label: "Parcela para autocaravana", pillar: "C04", pillarLabel: "C04. Específicos Campings", category: "especificos", subCategory: "Campings - Tipo Alojamiento", scope: "especifico", iconName: "Car" },
  { key: "c_panaderia", code: "C04.1.2.1", label: "Panadería", pillar: "C04", pillarLabel: "C04. Específicos Campings", category: "especificos", subCategory: "Campings - Servicios", scope: "especifico", iconName: "Coffee" },
  { key: "c_supermercado", code: "C04.1.2.2", label: "Comestibles / Supermercado", pillar: "C04", pillarLabel: "C04. Específicos Campings", category: "especificos", subCategory: "Campings - Servicios", scope: "especifico", iconName: "Coffee" },
  { key: "c_banos_publicos", code: "C04.1.2.3", label: "Baños públicos", pillar: "C04", pillarLabel: "C04. Específicos Campings", category: "especificos", subCategory: "Campings - Servicios", scope: "especifico", iconName: "Droplets" },
  { key: "c_duchas_comunitarias", code: "C04.1.2.4", label: "Duchas comunitarias", pillar: "C04", pillarLabel: "C04. Específicos Campings", category: "especificos", subCategory: "Campings - Servicios", scope: "especifico", iconName: "Droplets" },
  { key: "c_autoservicio_lavanderia", code: "C04.1.2.5", label: "Autoservicio de lavandería", pillar: "C04", pillarLabel: "C04. Específicos Campings", category: "especificos", subCategory: "Campings - Servicios", scope: "especifico", iconName: "Shirt" },
  { key: "c_aparcamiento_recinto", code: "C04.1.2.6", label: "Aparcamiento en el recinto", pillar: "C04", pillarLabel: "C04. Específicos Campings", category: "especificos", subCategory: "Campings - Servicios", scope: "especifico", iconName: "Car" },
  { key: "c_conexion_electrica_parcela", code: "C04.1.3.1", label: "Posibilidad de conexión eléctrica en parcela", pillar: "C04", pillarLabel: "C04. Específicos Campings", category: "especificos", subCategory: "Campings - Servicios Parcela", scope: "especifico", iconName: "Zap" },
  { key: "c_conexion_agua_parcela", code: "C04.1.3.2", label: "Posibilidad de conexión de agua en parcela", pillar: "C04", pillarLabel: "C04. Específicos Campings", category: "especificos", subCategory: "Campings - Servicios Parcela", scope: "especifico", iconName: "Droplets" },
  { key: "c_descarga_agua_parcela", code: "C04.1.3.3", label: "Posibilidad de descarga de agua en parcela", pillar: "C04", pillarLabel: "C04. Específicos Campings", category: "especificos", subCategory: "Campings - Servicios Parcela", scope: "especifico", iconName: "Droplets" },

  // C04.2. BARCOS & EMBARCACIONES (BOTÓN 5)
  { key: "barco_camarote_doble", code: "C04.2.1.1", label: "Camarote doble", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Camarotes", scope: "especifico", iconName: "Bed" },
  { key: "barco_camarote_individual", code: "C04.2.1.2", label: "Camarote individual", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Camarotes", scope: "especifico", iconName: "Bed" },
  { key: "barco_literas_nauticas", code: "C04.2.1.3", label: "Literas náuticas con red anticaída", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Camarotes", scope: "especifico", iconName: "Bed" },
  { key: "barco_escotillas_mosquitera", code: "C04.2.1.4", label: "Escotillas con mosquitera", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Camarotes", scope: "especifico", iconName: "ShieldCheck" },
  { key: "barco_cortinas_foscurit", code: "C04.2.1.5", label: "Cortinas/escotillas con foscurit (blackout)", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Camarotes", scope: "especifico", iconName: "EyeOff" },
  { key: "barco_colchones_antihumedad", code: "C04.2.1.6", label: "Colchones con ventilación antihumedad", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Camarotes", scope: "especifico", iconName: "Bed" },
  { key: "barco_ducha_bomba_achique", code: "C04.2.1.7", label: "Ducha en camarote con bomba de achique", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Camarotes", scope: "especifico", iconName: "Droplets" },
  { key: "barco_cocina_marina_cardan", code: "C04.2.1.8", label: "Cocina marina basculante (cardán con tope de seguridad)", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Cocina", scope: "especifico", iconName: "ChefHat" },
  { key: "barco_fogones_gas_vitro", code: "C04.2.1.9", label: "Fogones de gas/vitrocerámica marina", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Cocina", scope: "especifico", iconName: "ChefHat" },
  { key: "barco_horno_marino", code: "C04.2.1.10", label: "Horno de gas/eléctrico marino", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Cocina", scope: "especifico", iconName: "ChefHat" },
  { key: "barco_nevera_12v_24v", code: "C04.2.1.11", label: "Nevera / glacera marina de 12V/24V congelador integrado", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Cocina", scope: "especifico", iconName: "IceCream" },
  { key: "barco_vajilla_irrompible", code: "C04.2.1.12", label: "Vajilla /cristalería irrompible (melamina / policarbonato)", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Cocina", scope: "especifico", iconName: "Utensils" },
  { key: "barco_fregadero_agua_mar_dulce", code: "C04.2.1.13", label: "Fregadero con bomba de agua dulce y de agua de mar", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Cocina", scope: "especifico", iconName: "Droplets" },
  { key: "barco_ac_marina", code: "C04.2.1.14", label: "Aire acondicionado de marina (con toma de puerto)", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Confort", scope: "especifico", iconName: "Wind" },
  { key: "barco_calefaccion_diesel", code: "C04.2.1.15", label: "Calefacción diésel (tipo Webasto/Eberspächer)", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Confort", scope: "especifico", iconName: "Flame" },
  { key: "barco_desalinizadora", code: "C04.2.1.16", label: "Desalinizadora / potabilizadora de agua", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Confort", scope: "especifico", iconName: "Droplets" },
  { key: "barco_inversor_corriente", code: "C04.2.1.17", label: "Inversor de corriente (12V a 220V)", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Confort", scope: "especifico", iconName: "Zap" },
  { key: "barco_usb_12v_camarotes", code: "C04.2.1.18", label: "Tomas USB de 12V en camarotes", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Confort", scope: "especifico", iconName: "Zap" },
  { key: "barco_wifi_starlink", code: "C04.2.4.6", label: "Wi-Fi satelital / Starlink para navegación en alta mar", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Prestaciones Náuticas", scope: "especifico", iconName: "Wifi" },
  { key: "barco_patron_capitan_incluido", code: "C04.2.4.1", label: "Servicio de Patrón / Capitán privado incluido", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Prestaciones Náuticas", scope: "especifico", iconName: "Ship" },
  { key: "barco_tender_dinghy", code: "C04.2.3.4", label: "Embarcación auxiliar (Dinghy / Tender) con motor fuera de borda", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Cubierta", scope: "especifico", iconName: "Ship" },
  { key: "barco_snorkel_equipo", code: "C04.2.4.8", label: "Equipamiento de snorkel (gafas, tubo, aletas)", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Prestaciones Náuticas", scope: "especifico", iconName: "Waves" },
  { key: "barco_paddle_surf", code: "C04.2.4.9", label: "Tablas de Paddle Surf (SUP)", pillar: "C04", pillarLabel: "C04. Específicos Barcos", category: "especificos", subCategory: "Barcos - Prestaciones Náuticas", scope: "especifico", iconName: "Waves" },

  // C04.5. RESTAURANTES & GASTRONOMÍA (BOTÓN 6)
  { key: "rest_mesas_individuales", code: "C04.5.1.1", label: "Mesas individuales / Parejas", pillar: "C04", pillarLabel: "C04. Específicos Restaurantes", category: "especificos", subCategory: "Restaurantes - Mesas", scope: "especifico", iconName: "Utensils" },
  { key: "rest_mesas_4_6", code: "C04.5.1.2", label: "Mesas para 4-6 pax", pillar: "C04", pillarLabel: "C04. Específicos Restaurantes", category: "especificos", subCategory: "Restaurantes - Mesas", scope: "especifico", iconName: "Utensils" },
  { key: "rest_mesas_8_10", code: "C04.5.1.3", label: "Mesas para 8-10 pax", pillar: "C04", pillarLabel: "C04. Específicos Restaurantes", category: "especificos", subCategory: "Restaurantes - Mesas", scope: "especifico", iconName: "Utensils" },
  { key: "rest_mesa_imperial", code: "C04.5.1.4", label: "Mesa imperial fija +10 comensales", pillar: "C04", pillarLabel: "C04. Específicos Restaurantes", category: "especificos", subCategory: "Restaurantes - Mesas", scope: "especifico", iconName: "Utensils" },
  { key: "rest_booths_americanos", code: "C04.5.1.8", label: "Cabinas tipo diner americano (Booths)", pillar: "C04", pillarLabel: "C04. Específicos Restaurantes", category: "especificos", subCategory: "Restaurantes - Mesas", scope: "especifico", iconName: "Utensils" },
  { key: "rest_chefs_table", code: "C04.5.6.3.1", label: "Mesa del Chef (Chef's Table)", pillar: "C04", pillarLabel: "C04. Específicos Restaurantes", category: "especificos", subCategory: "Restaurantes - VIP", scope: "especifico", iconName: "ChefHat" },
  { key: "rest_sommelier_dedicado", code: "C04.5.6.3.3", label: "Sommelier / Sumiller Dedicado", pillar: "C04", pillarLabel: "C04. Específicos Restaurantes", category: "especificos", subCategory: "Restaurantes - VIP", scope: "especifico", iconName: "Wine" },
  { key: "rest_cava_vinos_privada", code: "C04.5.6.4.3", label: "Cava de Vinos Privada", pillar: "C04", pillarLabel: "C04. Específicos Restaurantes", category: "especificos", subCategory: "Restaurantes - VIP", scope: "especifico", iconName: "Wine" },
  { key: "rest_terraza_rooftop", code: "C04.5.7.1.2", label: "Terraza en Azotea / Rooftop", pillar: "C04", pillarLabel: "C04. Específicos Restaurantes", category: "especificos", subCategory: "Restaurantes - Terrazas", scope: "especifico", iconName: "Sun" },
  { key: "rest_vistas_atardecer", code: "C04.5.7.1.8", label: "Vistas al atardecer / puesta de sol", pillar: "C04", pillarLabel: "C04. Específicos Restaurantes", category: "especificos", subCategory: "Restaurantes - Terrazas", scope: "especifico", iconName: "Sun" }
];

/**
 * Normaliza y parsea arreglos o cadenas JSON de servicios.
 */
export function parseServicesList(servicesInput: any): string[] {
  if (!servicesInput) return [];
  if (Array.isArray(servicesInput)) {
    return servicesInput.map(s => String(s).trim()).filter(Boolean);
  }
  if (typeof servicesInput === "string") {
    const trimmed = servicesInput.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(s => String(s).trim()).filter(Boolean);
        }
      } catch {
        // Fallback a división por comas
      }
    }
    return trimmed.split(",").map(s => s.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Devuelve la etiqueta legible de una comodidad o clave.
 */
export function getAmenityLabel(key: string): string {
  const normalized = key.toLowerCase().trim();
  const found = MASTER_AMENITIES.find(a => 
    a.key.toLowerCase() === normalized || 
    a.label.toLowerCase() === normalized || 
    a.code.toLowerCase() === normalized
  );
  if (found) return found.label;
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
}

/**
 * Devuelve la información completa del catálogo de una comodidad.
 */
export function getAmenityInfo(key: string): AmenityItem | undefined {
  const normalized = key.toLowerCase().trim();
  return MASTER_AMENITIES.find(a => 
    a.key.toLowerCase() === normalized || 
    a.label.toLowerCase() === normalized || 
    a.code.toLowerCase() === normalized
  );
}

/**
 * Agrupa una lista de comodidades en los bloques estructurados de la Ficha Pública
 */
export function groupAmenitiesForDetail(servicesList: string[]) {
  const normalized = parseServicesList(servicesList);
  const matched = normalized.map(s => getAmenityInfo(s) || {
    key: s,
    code: "EXTRA",
    label: getAmenityLabel(s),
    pillar: "C02" as AmenityPillar,
    pillarLabel: "Servicios Generales",
    category: "servicios" as const,
    subCategory: "Otros Servicios",
    scope: "servicio" as AmenityScope,
    iconName: "Sparkles"
  });

  return {
    infraestructuraPrivada: matched.filter(a => a.pillar === "C01" && (a.scope === "privado" || a.category === "habitacion")),
    zonasComunes: matched.filter(a => a.pillar === "C01" && (a.scope === "comun" || a.category === "recreacion" || a.subCategory.includes("Abastecimiento"))),
    serviciosExperiencias: matched.filter(a => a.pillar === "C02"),
    normasPoliticas: matched.filter(a => a.pillar === "C03"),
    especificos: matched.filter(a => a.pillar === "C04"),
    otros: matched.filter(a => !["C01", "C02", "C03", "C04"].includes(a.pillar))
  };
}
