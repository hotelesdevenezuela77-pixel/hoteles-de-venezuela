export type AmenityPillar = 
  | "C00" 
  | "C01" 
  | "C02" 
  | "C03" 
  | "C04" 
  | "C05" 
  | "C06" 
  | "C07" 
  | "C08" 
  | "C09" 
  | "C10";

export type AmenityScope = "privado" | "comun" | "servicio" | "especifico" | "general";

export interface AmenityItem {
  key: string;
  code: string;
  label: string;
  pillar: AmenityPillar;
  pillarLabel: string;
  category: "habitacion" | "recreacion" | "gastronomia" | "servicios" | "general" | "especificos" | "configuracion";
  subCategory: string;
  scope: AmenityScope;
  iconName: string;
  isCompletable?: boolean; // Subrayado en azul turquesa en Documento 77 V.11 (Campo completable no marcable)
  placeholder?: string;
}

export const PILLARS_DOCUMENT77 = [
  { id: "all", label: "Todos los Pilares" },
  { id: "C00", label: "C00. Configuración Inicial, Datos Fiscales & Contacto", color: "#3B82F6" },
  { id: "C01", label: "C01. Distribución, Infraestructura y Equipamiento Físico", color: "#00C8D4" },
  { id: "C02", label: "C02. Servicios del Establecimiento y Experiencias", color: "#FF0096" },
  { id: "C03", label: "C03. Accesibilidad y Seguridad", color: "#9B00CC" },
  { id: "C04", label: "C04. Políticas y Normas de la Propiedad", color: "#64748B" },
  { id: "C05", label: "C05. Específicos Agrupación Unidades (Campings/Glampings)", color: "#10B981" },
  { id: "C06", label: "C06. Específicos Love Hotels & Moteles", color: "#EC4899" },
  { id: "C07", label: "C07. Específicos Casas y Chalets de Montaña (Esquí)", color: "#0284C7" },
  { id: "C08", label: "C08. Específicos Barcos Alojamiento Estático en Puerto", color: "#0EA5E9" },
  { id: "C09", label: "C09. Específicos Barcos Alojamiento + Navegación Diaria", color: "#2563EB" },
  { id: "C10", label: "C10. Específicos Restaurantes & Gastronomía", color: "#F59E0B" }
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
  { id: "configuracion", label: "📋 Configuración Inicial (C00)" },
  { id: "habitacion", label: "🛏️ Unidad Privada (C01)" },
  { id: "recreacion", label: "🏊 Zonas Comunes & Relax (C01)" },
  { id: "servicios", label: "⛵ Servicios & Experiencias (C02)" },
  { id: "general", label: "🛡️ Accesibilidad, Seguridad & Políticas (C03-C04)" },
  { id: "especificos", label: "🏕️ Específicos por Tipología (C05-C10)" },
];

// =========================================================================
// DOCUMENTO 77 V.11: CATEGORÍAS DE SERVICIOS 1-20
// =========================================================================
export const SERVICE_CATEGORIES_1_20_V11 = [
  { id: 1, name: "Alojamiento tipo Hotel", code: "CAT.01" },
  { id: 2, name: "Alojamiento tipo Casa", code: "CAT.02" },
  { id: 3, name: "Alojamiento tipo Agrupación de unidades habitacionales", code: "CAT.03" },
  { id: 4, name: "Embarcaciones y Servicios Náuticos", code: "CAT.04" },
  { id: 5, name: "Gastronomía", code: "CAT.05" },
  { id: 6, name: "Ambiente nocturno", code: "CAT.06" },
  { id: 7, name: "Atracciones turísticas", code: "CAT.07" },
  { id: 8, name: "Alquiler de medios de transporte", code: "CAT.08" },
  { id: 9, name: "Servicios turísticos", code: "CAT.09" }
];

// =========================================================================
// DOCUMENTO 77 V.11: SUBCATEGORÍAS DE SERVICIOS 21-100
// =========================================================================
export const SERVICE_SUBCATEGORIES_21_100_V11 = [
  { id: 21, name: "Apartamentos", parentCategoryId: 2 },
  { id: 22, name: "Apartahoteles", parentCategoryId: 1 },
  { id: 23, name: "Casas, Chalets y Villas (Playa, rurales, Urbanas, Eco-Lujo)", parentCategoryId: 2 },
  { id: 24, name: "Casas y Chalets de montaña / esquí", parentCategoryId: 2 },
  { id: 25, name: "Hoteles", parentCategoryId: 1 },
  { id: 26, name: "Hostales, Posadas, Pensiones y Moteles", parentCategoryId: 1 },
  { id: 27, name: "Bed and breakfast", parentCategoryId: 1 },
  { id: 28, name: "Habitaciones en casas particulares", parentCategoryId: 2 },
  { id: 29, name: "Albergues turísticos", parentCategoryId: 1 },
  { id: 30, name: "Residencias de estudiantes", parentCategoryId: 1 },
  { id: 31, name: "Hoteles cápsula", parentCategoryId: 1 },
  { id: 32, name: "Love hotels", parentCategoryId: 1 },
  { id: 33, name: "Campings, Glampings & Eco-Lodges", parentCategoryId: 3 },
  { id: 34, name: "Resorts & Complejos Vacacionales", parentCategoryId: 1 },
  { id: 35, name: "Marinas", parentCategoryId: 4 },
  { id: 36, name: "Barco con alojamiento estático en puerto (veleros, yates, catamaranes o houseboats)", parentCategoryId: 4 },
  { id: 37, name: "Barco con alojamiento y navegación diaria incluida (veleros, yates, catamaranes o houseboats)", parentCategoryId: 4 },
  { id: 38, name: "Restaurantes", parentCategoryId: 5 },
  { id: 39, name: "Cafeterías y Bares de tapas", parentCategoryId: 5 },
  { id: 40, name: "Tabernas & Tascas", parentCategoryId: 5 },
  { id: 41, name: "Discotecas y bares nocturnos", parentCategoryId: 6 },
  { id: 42, name: "Parques de atracciones (tradicionales, temáticos, acuáticos, aventura y naturaleza, entretenimiento familiar y educativos o culturales)", parentCategoryId: 7 },
  { id: 43, name: "Parques nacionales", parentCategoryId: 7 },
  { id: 44, name: "Agencias de viaje", parentCategoryId: 9 },
  { id: 45, name: "Influencers", parentCategoryId: 9 },
  { id: 46, name: "Alquiler de coches (carros)", parentCategoryId: 8 },
  { id: 47, name: "Alquiler de motocicletas", parentCategoryId: 8 },
  { id: 48, name: "Alquiler de motos de agua", parentCategoryId: 8 },
  { id: 49, name: "Alquiler de quads", parentCategoryId: 8 }
];

// =========================================================================
// DOCUMENTO 77 V.11: TABLA PIVOTE 1 - TIPO DE ESTANCIA EN AGRUPACIÓN (50-62)
// =========================================================================
export const PIVOT_HABITATIONAL_UNITS_50_62_V11 = [
  { id: 50, name: "Mobil-home", code: "PIVOT.50" },
  { id: 51, name: "Bungalow", code: "PIVOT.51" },
  { id: 52, name: "Tienda de lona", code: "PIVOT.52" },
  { id: 53, name: "Tienda safari", code: "PIVOT.53" },
  { id: 54, name: "Tienda tipi", code: "PIVOT.54" },
  { id: 55, name: "Casa en los árboles", code: "PIVOT.55" },
  { id: 56, name: "Yurta", code: "PIVOT.56" },
  { id: 57, name: "Casa, Chalet, Cabaña (en complejo)", code: "PIVOT.57" },
  { id: 58, name: "Apartamento (en complejo)", code: "PIVOT.58" },
  { id: 59, name: "Parcela para tienda", code: "PIVOT.59" },
  { id: 60, name: "Parcela para caravana", code: "PIVOT.60" },
  { id: 61, name: "Parcela para autocaravana", code: "PIVOT.61" },
  { id: 62, name: "Habitaciones en complejos", code: "PIVOT.62" }
];

// =========================================================================
// VENTANA PREVIA: LOS 6 BOTONES OFICIALES DE REGISTRO (DOCUMENTO 77 V.11)
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
    subtitle: "Alojamientos con unidades operativas hoteleras (Subcats 22, 25-32, 34)",
    items: [
      "Hoteles",
      "Apartahoteles",
      "Hostales, Posadas, Pensiones y Moteles",
      "Bed and breakfast",
      "Albergues turísticos",
      "Residencias de estudiantes",
      "Hoteles cápsula",
      "Love hotels",
      "Resorts & Complejos Vacacionales"
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
    subtitle: "Propiedades de alquiler completo o residencial (Subcats 21, 23, 24, 28)",
    items: [
      "Apartamentos",
      "Casas, Chalets y Villas (Playa, rurales, Urbanas, Eco-Lujo)",
      "Casas y Chalets de montaña / esquí",
      "Habitaciones en casas particulares"
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
    subtitle: "Agrupación de unidades habitacionales al aire libre (Subcat 33 + Pivotes 50-62)",
    items: [
      "Campings, Glampings & Eco-Lodges",
      "Mobil-homes & Bungalows",
      "Tiendas Safari, Tipi y Lona",
      "Casas en los árboles & Yurta",
      "Parcelas caravanas/tiendas"
    ],
    icon: "Tent",
    status: "active",
    accentColor: "#10B981",
    gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)"
  },
  {
    id: "boton4",
    btnNumber: 4,
    title: "Love Hotels & Moteles",
    subtitle: "Establecimientos de intimidad, privacidad y confort erótico (Subcat 32)",
    items: [
      "Love hotels",
      "Moteles temáticos",
      "Habitaciones por horas con garaje privado individual"
    ],
    icon: "Heart",
    status: "active",
    accentColor: "#FF0096",
    gradient: "linear-gradient(135deg, #FF0096 0%, #E11D48 100%)"
  },
  {
    id: "boton5",
    btnNumber: 5,
    title: "Barcos & Embarcaciones Náuticas",
    subtitle: "Alojamiento estático en puerto o navegación diaria (Subcats 35, 36, 37)",
    items: [
      "Marinas",
      "Barco con alojamiento estático en puerto",
      "Barco con alojamiento y navegación diaria incluida"
    ],
    icon: "Ship",
    status: "active",
    accentColor: "#0EA5E9",
    gradient: "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)"
  },
  {
    id: "boton6",
    btnNumber: 6,
    title: "Restaurantes & Gastronomía",
    subtitle: "Establecimientos gastronómicos, bistrós y salas VIP (Subcats 38, 39, 40)",
    items: [
      "Restaurantes",
      "Cafeterías y Bares de tapas",
      "Tabernas & Tascas",
      "Chef's Tables y Reservados VIP"
    ],
    icon: "Utensils",
    status: "active",
    accentColor: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
  }
];

// Tipos de establecimiento filtrados por botón en V.11
export const BUTTON_1_PROPERTY_TYPES = [
  { id: "hoteles", label: "Hoteles", code: "SUBCAT.25", icon: "Building2" },
  { id: "apartahoteles", label: "Apartahoteles", code: "SUBCAT.22", icon: "Building" },
  { id: "hostales_posadas_pensiones", label: "Hostales, Posadas, Pensiones y Moteles", code: "SUBCAT.26", icon: "Bed" },
  { id: "bed_and_breakfast", label: "Bed and breakfast", code: "SUBCAT.27", icon: "Coffee" },
  { id: "albergues_turisticos", label: "Albergues turísticos", code: "SUBCAT.29", icon: "Users" },
  { id: "residencias_estudiantes", label: "Residencias de estudiantes", code: "SUBCAT.30", icon: "GraduationCap" },
  { id: "hoteles_capsula", label: "Hoteles cápsula", code: "SUBCAT.31", icon: "Box" },
  { id: "resorts_complejos", label: "Resorts & Complejos Vacacionales", code: "SUBCAT.34", icon: "Palmtree" }
];

export const BUTTON_2_PROPERTY_TYPES = [
  { id: "apartamentos", label: "Apartamentos", code: "SUBCAT.21", icon: "Building" },
  { id: "casas_villas", label: "Casas, Chalets y Villas (Playa, rurales, Urbanas, Eco-Lujo)", code: "SUBCAT.23", icon: "Home" },
  { id: "casas_chalets_montana", label: "Casas y Chalets de montaña / esquí", code: "SUBCAT.24", icon: "Mountain" },
  { id: "habitaciones_casas_particulares", label: "Habitaciones en casas particulares", code: "SUBCAT.28", icon: "UserCheck" }
];

export const BUTTON_3_PROPERTY_TYPES = [
  { id: "campings_glampings", label: "Campings, Glampings & Eco-Lodges", code: "SUBCAT.33", icon: "Tent" }
];

export const BUTTON_4_PROPERTY_TYPES = [
  { id: "love_hotels", label: "Love hotels", code: "SUBCAT.32", icon: "Heart" }
];

export const BUTTON_5_PROPERTY_TYPES = [
  { id: "marinas", label: "Marinas", code: "SUBCAT.35", icon: "Waves" },
  { id: "barco_estatico", label: "Barco con alojamiento estático en puerto", code: "SUBCAT.36", icon: "Ship" },
  { id: "barco_navegacion", label: "Barco con alojamiento y navegación diaria incluida", code: "SUBCAT.37", icon: "Ship" }
];

export const BUTTON_6_PROPERTY_TYPES = [
  { id: "restaurantes", label: "Restaurantes", code: "SUBCAT.38", icon: "Utensils" },
  { id: "cafeterias_bares", label: "Cafeterías y Bares de tapas", code: "SUBCAT.39", icon: "Coffee" },
  { id: "tabernas_tascas", label: "Tabernas & Tascas", code: "SUBCAT.40", icon: "Wine" }
];

// C00.1 Catálogo General V.11
export const PROPERTY_TYPES_DOCUMENT77 = [
  ...BUTTON_1_PROPERTY_TYPES,
  ...BUTTON_2_PROPERTY_TYPES,
  ...BUTTON_3_PROPERTY_TYPES,
  ...BUTTON_4_PROPERTY_TYPES,
  ...BUTTON_5_PROPERTY_TYPES,
  ...BUTTON_6_PROPERTY_TYPES,
  { id: "discotecas_bares_nocturnos", label: "Discotecas y bares nocturnos", code: "SUBCAT.41", icon: "Music" },
  { id: "parques_atracciones", label: "Parques de atracciones", code: "SUBCAT.42", icon: "Sparkles" },
  { id: "parques_nacionales", label: "Parques nacionales", code: "SUBCAT.43", icon: "TreePine" },
  { id: "agencias_viaje", label: "Agencias de viaje", code: "SUBCAT.44", icon: "Compass" },
  { id: "influencers", label: "Influencers", code: "SUBCAT.45", icon: "UserCheck" },
  { id: "alquiler_coches", label: "Alquiler de coches (carros)", code: "SUBCAT.46", icon: "Car" },
  { id: "alquiler_motocicletas", label: "Alquiler de motocicletas", code: "SUBCAT.47", icon: "Car" },
  { id: "alquiler_motos_agua", label: "Alquiler de motos de agua", code: "SUBCAT.48", icon: "Waves" },
  { id: "alquiler_quads", label: "Alquiler de quads", code: "SUBCAT.49", icon: "Car" }
];

// =========================================================================
// DESPLEGABLE TIPO DE VÍA EN FORMULARIO (C00.1.14.1 DOC 77 V.11)
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
// C00.5. CERTIFICACIONES AMBIENTALES, SOSTENIBILIDAD Y NICHO (DOC 77 V.11)
// =========================================================================
export const CERTIFICATIONS_DOCUMENT77 = [
  { id: "sostenibilidad", code: "C00.5.1", label: "Certificación de Sostenibilidad", badgeColor: "bg-emerald-500 text-white" },
  { id: "circuito_excelencia", code: "C00.5.2", label: "Circuito de Excelencia", badgeColor: "bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white" },
  { id: "llave_verde", code: "C00.5.3", label: "Llave verde", badgeColor: "bg-green-600 text-white" },
  { id: "etiqueta_ecologica", code: "C00.5.4", label: "Etiqueta ecológica", badgeColor: "bg-teal-600 text-white" },
  { id: "etiqueta_qualidog", code: "C00.5.5", label: "Etiqueta Qualidog", badgeColor: "bg-orange-500 text-white" },
  { id: "reconocimiento_accueil_velo", code: "C00.5.6", label: "Reconocimiento Accueil Vélo", badgeColor: "bg-blue-600 text-white" },
  { id: "turismo_discapacidad", code: "C00.5.7", label: "Turismo y discapacidad", badgeColor: "bg-indigo-600 text-white" },
  { id: "alojamiento_pesca", code: "C00.5.8", label: "Alojamiento / Servicio para la pesca", badgeColor: "bg-cyan-700 text-white" },
  { id: "sello_legal_hdv", code: "C00.5.9", label: "Sello de garantía Legal HDV", badgeColor: "bg-[#00C8D4] text-[#0e011f]" },
];

export const CERTIFICATIONS_V10 = CERTIFICATIONS_DOCUMENT77;

// =========================================================================
// C00.4. CALIFICACIONES OFICIALES Y DISTINCIONES GASTRONÓMICAS (DOC 77 V.11)
// =========================================================================
export const STAR_CATEGORIES_DOCUMENT77 = [
  { stars: 1, code: "C00.4.1", label: "1 Estrellas Hoteleras" },
  { stars: 2, code: "C00.4.1", label: "2 Estrellas Hoteleras" },
  { stars: 3, code: "C00.4.1", label: "3 Estrellas Hoteleras" },
  { stars: 4, code: "C00.4.1", label: "4 Estrellas Hoteleras" },
  { stars: 5, code: "C00.4.1", label: "5 Estrellas Hoteleras / Lujo" },
];

export const GASTRONOMIC_DISTINCTIONS_V11 = [
  { id: "tenedores_oficiales", code: "C00.4.2", label: "Tenedores Oficiales" },
  { id: "estrellas_michelin", code: "C00.4.3", label: "Estrellas Michelin" },
  { id: "green_star_michelin", code: "C00.4.4", label: "Green Star Michelin" },
  { id: "soles_repsol", code: "C00.4.5", label: "Soles Repsol" }
];

// =========================================================================
// C00.1.20. REGIÓN (DOC 77 V.11 - 9 REGIONES)
// =========================================================================
export const REGIONS_DOCUMENT77 = [
  { id: "mar", code: "C00.1.20.1", label: "Mar", icon: "Waves" },
  { id: "campana", code: "C00.1.20.2", label: "Campiña", icon: "TreePine" },
  { id: "bosque", code: "C00.1.20.3", label: "Bosque", icon: "TreePine" },
  { id: "montana", code: "C00.1.20.4", label: "Montaña", icon: "Mountain" },
  { id: "rio_lago", code: "C00.1.20.5", label: "Río o lago", icon: "Waves" },
  { id: "zona_urbana", code: "C00.1.20.6", label: "Zona urbana", icon: "Building2" },
  { id: "llanos", code: "C00.1.20.7", label: "Llanos", icon: "Sun" },
  { id: "sabana", code: "C00.1.20.8", label: "Sabana", icon: "Sun" },
  { id: "desierto", code: "C00.1.20.9", label: "Desierto", icon: "Sun" }
];

export const REGIONS_V10 = REGIONS_DOCUMENT77;

// =========================================================================
// C00.6. DISTANCIA A LUGARES DE INTERÉS (DOC 77 V.11)
// =========================================================================
export const POI_TYPES_V10 = [
  { id: "restaurantes_bares", code: "C00.6.1.1", label: "Restaurantes, Bares y Cafeterías" },
  { id: "servicios_centros_comerciales", code: "C00.5.1.1", label: "Servicios (Centros comerciales / mercados / lavanderías externas / Peluquerías, centros de belleza, cambio de moneda, alquiler de coches)" },
  { id: "playas", code: "C00.6.1.2", label: "Playas" },
  { id: "aeropuerto_estacion", code: "C00.6.1.3", label: "Aeropuerto, estación de tren/autobús" },
  { id: "patrimonio_historico", code: "C00.6.1.4", label: "Patrimonio histórico (Edificios históricos, restos arqueológicos)" },
  { id: "museos", code: "C00.6.1.5", label: "Museos" },
  { id: "parques_naturales", code: "C00.6.1.6", label: "Parques naturales" },
  { id: "resto_atracciones", code: "C00.6.1.7", label: "Resto de atracciones turísticas (Zoológicos, parques recreativos)" },
  { id: "hospitales_clinicas", code: "C00.6.1.8", label: "Hospitales, clínicas, centros médicos" },
  { id: "estacion_policia", code: "C00.6.1.9", label: "Estación de policía" }
];

export const POINT_OF_INTEREST_TYPES = POI_TYPES_V10;

export const CAMPING_SUBTYPES_V9 = PIVOT_HABITATIONAL_UNITS_50_62_V11.map(p => ({
  id: p.name.toLowerCase().replace(/[^a-z0-0]/g, "_"),
  label: p.name,
  code: p.code
}));

export const ONLINE_PAYMENT_METHODS_V9 = [
  { id: "tarjeta_visa_mc", code: "C04.6.1", label: "Tarjeta (VISA, MC)" },
  { id: "bizum_espana", code: "C04.6.2", label: "Bizum (España)" },
  { id: "binance_usdt_crypto", code: "C04.6.3", label: "Binance USDT / Crypto" },
  { id: "pago_movil_ves", code: "C04.6.4", label: "Pago Móvil (Bs. VES)" },
  { id: "zelle_usd_venezuela", code: "C04.6.5", label: "Zelle (USD) (Venezuela)" }
];

export const BOTON_CATEGORIES_MAPPING = {
  boton1: BUTTON_1_PROPERTY_TYPES,
  boton2: BUTTON_2_PROPERTY_TYPES,
  boton3: BUTTON_3_PROPERTY_TYPES,
  boton4: BUTTON_4_PROPERTY_TYPES,
  boton5: BUTTON_5_PROPERTY_TYPES,
  boton6: BUTTON_6_PROPERTY_TYPES,
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
// MASTER AMENITIES LIST (DOCUMENTO 77 V.11 - CATÁLOGO EXHAUSTIVO OFICIAL)
// =========================================================================
export const MASTER_AMENITIES: AmenityItem[] = [

  // ==========================================
  // C00. CONFIGURACIÓN INICIAL & DATOS GENERALES
  // ==========================================
  { key: "nombre_comercial", code: "C00.1.1", label: "Nombre comercial del negocio/propiedad", pillar: "C00", pillarLabel: "C00. Configuración Inicial", category: "configuracion", subCategory: "Información General", scope: "general", iconName: "Building", isCompletable: true, placeholder: "Ej. Posada Paraguaná Lujo" },
  { key: "nombre_embarcacion", code: "C00.1.2", label: "Nombre de la Embarcación", pillar: "C00", pillarLabel: "C00. Configuración Inicial", category: "configuracion", subCategory: "Información General", scope: "general", iconName: "Ship", isCompletable: true, placeholder: "Ej. Perla Negra Yacht" },
  { key: "licencia_turistica", code: "C00.1.3", label: "Número de Licencia Turística / Registro", pillar: "C00", pillarLabel: "C00. Configuración Inicial", category: "configuracion", subCategory: "Información General", scope: "general", iconName: "FileText", isCompletable: true, placeholder: "Ej. RTN-198273" },
  { key: "sitio_web", code: "C00.1.4", label: "Sitio Web", pillar: "C00", pillarLabel: "C00. Configuración Inicial", category: "configuracion", subCategory: "Información General", scope: "general", iconName: "Globe", isCompletable: true, placeholder: "https://www.mihotel.com" },
  { key: "enlace_facebook", code: "C00.1.5", label: "Enlace FACEBOOK", pillar: "C00", pillarLabel: "C00. Configuración Inicial", category: "configuracion", subCategory: "Redes Sociales", scope: "general", iconName: "Globe", isCompletable: true },
  { key: "enlace_instagram", code: "C00.1.6", label: "Enlace INSTAGRAM", pillar: "C00", pillarLabel: "C00. Configuración Inicial", category: "configuracion", subCategory: "Redes Sociales", scope: "general", iconName: "Globe", isCompletable: true },
  { key: "enlace_tiktok", code: "C00.1.7", label: "Enlace TIKTOK", pillar: "C00", pillarLabel: "C00. Configuración Inicial", category: "configuracion", subCategory: "Redes Sociales", scope: "general", iconName: "Globe", isCompletable: true },
  { key: "enlace_youtube", code: "C00.1.8", label: "Enlace YOUTUBE", pillar: "C00", pillarLabel: "C00. Configuración Inicial", category: "configuracion", subCategory: "Redes Sociales", scope: "general", iconName: "Globe", isCompletable: true },
  { key: "descripcion_comercial", code: "C00.1.9", label: "Descripción o Reseña Comercial (Máx 500 car.)", pillar: "C00", pillarLabel: "C00. Configuración Inicial", category: "configuracion", subCategory: "Información General", scope: "general", iconName: "FileText", isCompletable: true },
  { key: "ano_construccion", code: "C00.1.10", label: "Año de construcción", pillar: "C00", pillarLabel: "C00. Configuración Inicial", category: "configuracion", subCategory: "Información General", scope: "general", iconName: "Clock", isCompletable: true },
  { key: "ano_ultima_reforma", code: "C00.1.11", label: "Año de última reforma", pillar: "C00", pillarLabel: "C00. Configuración Inicial", category: "configuracion", subCategory: "Información General", scope: "general", iconName: "Clock", isCompletable: true },
  { key: "num_unidades_habitacionales", code: "C00.1.12", label: "Número de unidades habitacionales", pillar: "C00", pillarLabel: "C00. Configuración Inicial", category: "configuracion", subCategory: "Información General", scope: "general", iconName: "Bed", isCompletable: true },
  { key: "num_maximo_comensales", code: "C00.1.13", label: "Número máximo de comensales", pillar: "C00", pillarLabel: "C00. Configuración Inicial", category: "configuracion", subCategory: "Información General", scope: "general", iconName: "Utensils", isCompletable: true },

  // ==========================================
  // C01. DISTRIBUCIÓN, INFRAESTRUCTURA Y EQUIPAMIENTO FÍSICO
  // ==========================================

  // C01.1. Distribución (HOTEL) & C01.2. Alquiler Íntegro
  { key: "num_banos_hotel", code: "C01.1.3", label: "Número de baños", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Distribución Hotel", scope: "privado", isCompletable: true },
  { key: "tamano_recamara_1", code: "C01.1.4", label: "Tamaño de la Recámara 1 en m2", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Distribución Hotel", scope: "privado", isCompletable: true },
  { key: "tamano_recamara_2", code: "C01.1.5", label: "Tamaño de la Recámara 2 en m2", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Distribución Hotel", scope: "privado", isCompletable: true },
  { key: "num_dormitorios", code: "C01.2.1", label: "Número de dormitorios", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Alquiler Íntegro (Casas/Apartamentos/Barcos)", scope: "privado", isCompletable: true },
  { key: "num_camarotes", code: "C01.2.2", label: "Número de camarotes", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Alquiler Íntegro (Casas/Apartamentos/Barcos)", scope: "privado", isCompletable: true },
  { key: "num_banos_privados", code: "C01.2.3", label: "Número de baños privados", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Alquiler Íntegro (Casas/Apartamentos/Barcos)", scope: "privado", isCompletable: true },
  { key: "num_banos_compartidos", code: "C01.2.4", label: "Número de baños compartidos", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Alquiler Íntegro (Casas/Apartamentos/Barcos)", scope: "comun", isCompletable: true },
  { key: "tamano_dormitorio_m2", code: "C01.2.5", label: "Tamaño del dormitorio en m2", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Alquiler Íntegro (Casas/Apartamentos/Barcos)", scope: "privado", isCompletable: true },
  { key: "tamano_camarote_m2", code: "C01.2.6", label: "Tamaño del camarote en m2", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Alquiler Íntegro (Casas/Apartamentos/Barcos)", scope: "privado", isCompletable: true },

  // C01.3. Camas por unidad
  { key: "camas_individuales_100", code: "C01.3.1", label: "Número de camas individuales 100 cm", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Número y Tipo de Camas", scope: "privado", isCompletable: true },
  { key: "camas_king_size_200", code: "C01.3.2", label: "Número de camas doble King Size 200 cm", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Número y Tipo de Camas", scope: "privado", isCompletable: true },
  { key: "camas_queen_size_180", code: "C01.3.3", label: "Número de camas doble Queen Size 180 cm", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Número y Tipo de Camas", scope: "privado", isCompletable: true },
  { key: "camas_full_150", code: "C01.3.5", label: "Número de camas doble Full 150 cm", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Número y Tipo de Camas", scope: "privado", isCompletable: true },
  { key: "num_literas", code: "C01.3.5.2", label: "Número de Literas (2 camas de 90cm)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Número y Tipo de Camas", scope: "privado", isCompletable: true },

  // C01.4.1. Descanso y Confort Privado
  { key: "ropa_cama", code: "C01.4.1.1", label: "Ropa de cama", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Bed" },
  { key: "almohadas_a_la_carta", code: "C01.4.1.2", label: "Almohadas a la carta", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Bed" },
  { key: "armario", code: "C01.4.1.3", label: "Armario", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Archive" },
  { key: "walking_closet", code: "C01.4.1.4", label: "Walking closed", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Archive" },
  { key: "perchero", code: "C01.4.1.5", label: "Perchero", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Shirt" },
  { key: "mosquitera", code: "C01.4.1.6", label: "Mosquitera", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "ShieldCheck" },
  { key: "insonorizacion", code: "C01.4.1.7", label: "Insonorización", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "VolumeX" },
  { key: "cortinas_opacas", code: "C01.4.1.8", label: "Cortinas opacas / persianas", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "EyeOff" },
  { key: "plancha", code: "C01.4.1.9", label: "Plancha / Utensilios de planchado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Shirt" },
  { key: "suelo_ceramica", code: "C01.4.1.10", label: "Suelo de cerámica", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Home" },
  { key: "suelo_madera", code: "C01.4.1.11", label: "Suelo de madera / parquet", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Home" },
  { key: "suelo_moqueta", code: "C01.4.1.12", label: "Suelo de Moqueta hipoalergénica", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Home" },
  { key: "tendedero", code: "C01.4.1.13", label: "Tendedero de ropa", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Shirt" },
  { key: "habitaciones_sin_humo", code: "C01.4.1.14", label: "Habitaciones sin humo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Ban" },

  // C01.4.2. Climatización y Suministros (Privado)
  { key: "aire_acondicionado", code: "C01.4.2.1", label: "Aire Acondicionado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros", scope: "privado", iconName: "Wind" },
  { key: "calefaccion", code: "C01.4.2.2", label: "Calefacción", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros", scope: "privado", iconName: "Flame" },
  { key: "chimenea_electrica", code: "C01.4.2.3", label: "Chimenea eléctrica", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros", scope: "privado", iconName: "Flame" },
  { key: "ventiladores_techo", code: "C01.4.2.4", label: "Ventiladores de techo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros", scope: "privado", iconName: "Wind" },
  { key: "enchufe_cerca_cama", code: "C01.4.2.5", label: "Enchufe cerca de la cama", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros", scope: "privado", iconName: "Zap" },
  { key: "cargadores_usb", code: "C01.4.2.6", label: "Cargadores USB integrados", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros", scope: "privado", iconName: "Zap" },

  // C01.4.3. Tecnología y Entretenimiento (Privado)
  { key: "tv_pantalla_plana", code: "C01.4.3.1", label: "TV pantalla plana", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento", scope: "privado", iconName: "Tv" },
  { key: "servicios_streaming", code: "C01.4.3.2", label: "Servicios de streaming (Netflix, HBO, etc.)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento", scope: "privado", iconName: "Tv" },
  { key: "altavoces_bluetooth", code: "C01.4.3.3", label: "Altavoces Bluetooth", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento", scope: "privado", iconName: "Music" },
  { key: "consola_videojuegos", code: "C01.4.3.4", label: "Consola de videojuegos", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento", scope: "privado", iconName: "Trophy" },
  { key: "canales_cable", code: "C01.4.3.5", label: "Canales por cable", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento", scope: "privado", iconName: "Tv" },
  { key: "canales_satelite", code: "C01.4.3.6", label: "Canales vía satélite", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento", scope: "privado", iconName: "Tv" },
  { key: "canales_pago", code: "C01.4.3.7", label: "Canales de pago", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento", scope: "privado", iconName: "Tv" },
  { key: "canales_adultos", code: "C01.4.3.8", label: "Canales de contenido adultos (X/Erótico) incluido (Love hotels)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento", scope: "privado", iconName: "Heart" },

  // C01.4.4. Zona de Trabajo y Estar (Privado)
  { key: "escritorio", code: "C01.4.4.1", label: "Escritorio", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Zona de Trabajo y Estar", scope: "privado", iconName: "Briefcase" },
  { key: "silla_ergonomica", code: "C01.4.4.2", label: "Silla ergonómica", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Zona de Trabajo y Estar", scope: "privado", iconName: "Briefcase" },
  { key: "sofa", code: "C01.4.4.3", label: "Sofá", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Zona de Trabajo y Estar", scope: "privado", iconName: "Smile" },
  { key: "zona_estar", code: "C01.4.4.4", label: "Zona de estar", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Zona de Trabajo y Estar", scope: "privado", iconName: "Smile" },
  { key: "caja_fuerte", code: "C01.4.4.5", label: "Caja fuerte (tamaño portátil)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Zona de Trabajo y Estar", scope: "privado", iconName: "Lock" },

  // C01.5. Exteriores Privados
  { key: "balcon", code: "C01.5.1", label: "Balcón", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Sun" },
  { key: "terraza_privada", code: "C01.5.2", label: "Terraza privada", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Sun" },
  { key: "terraza_cubierta", code: "C01.5.3", label: "Terraza privada cubierta (o semicubierta)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Sun" },
  { key: "patio_interior_privado", code: "C01.5.4", label: "Patio interior privado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "TreePine" },
  { key: "jardin_privado", code: "C01.5.5", label: "Jardín privado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "TreePine" },
  { key: "barbacoa_privada", code: "C01.5.6", label: "Barbacoa privada", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Flame" },
  { key: "mobiliario_exterior_privado", code: "C01.5.7", label: "Mobiliario exterior privado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Sun" },
  { key: "terraza_jacuzzi_piscina_privada_opaca", code: "C01.5.8", label: "Terraza con Jacuzzi o piscina privada sin visibilidad exterior (pantallas opacas)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Bath" },

  // C01.6. Equipamiento de Baños y Cocinas
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

  // C01.6.3. Baño Adaptado PMR
  { key: "lavamanos_bajo", code: "C01.6.3.1", label: "Lavamanos más bajo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "Accessibility" },
  { key: "wc_elevado", code: "C01.6.3.2", label: "WC elevado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "Accessibility" },
  { key: "wc_barras_apoyo", code: "C01.6.3.3", label: "WC con barras de apoyo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "Accessibility" },
  { key: "ducha_adaptada_silla", code: "C01.6.3.4", label: "Ducha adaptada para sillas de ruedas", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "Accessibility" },
  { key: "banera_adaptada_silla", code: "C01.6.3.5", label: "Bañera a ras de suelo adaptada con silla", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "Accessibility" },
  { key: "cuerda_emergencia_bano", code: "C01.6.3.6", label: "Cuerda de emergencia en el baño", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "AlertTriangle" },
  { key: "senalizacion_braille_bano", code: "C01.6.3.7", label: "Señalización en braille", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "Accessibility" },
  { key: "guiado_auditivo_bano", code: "C01.6.3.8", label: "Guiado auditivo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "Accessibility" },

  // C01.6.4 & C01.6.5. Cocina y Amenidades
  { key: "cocina_privada", code: "C01.6.4.1", label: "Cocina privada (dentro de la unidad habitacional)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Opciones de Cocina", scope: "privado", iconName: "ChefHat" },
  { key: "mini_cocina_privada", code: "C01.6.4.2", label: "Mini cocina privada en habitación", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Opciones de Cocina", scope: "privado", iconName: "ChefHat" },
  { key: "cocina_compartida", code: "C01.6.4.3", label: "Cocina compartida con otros huéspedes", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Opciones de Cocina", scope: "comun", iconName: "ChefHat" },
  { key: "mesa_comedor", code: "C01.6.5.1", label: "Mesa de comedor", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Cocina", scope: "privado", iconName: "Utensils" },
  { key: "cafetera", code: "C01.6.5.2", label: "Cafetera", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Cocina", scope: "privado", iconName: "Coffee" },
  { key: "tostadora", code: "C01.6.5.3", label: "Tostadora", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Cocina", scope: "privado", iconName: "Coffee" },
  { key: "hervidor_electrico", code: "C01.6.5.4", label: "Hervidor eléctrico", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Cocina", scope: "privado", iconName: "Coffee" },
  { key: "placa_vitro", code: "C01.6.5.5", label: "Placa vitro de cocina", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Cocina", scope: "privado", iconName: "ChefHat" },
  { key: "microondas", code: "C01.6.5.6", label: "Microondas", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Cocina", scope: "privado", iconName: "ChefHat" },
  { key: "horno", code: "C01.6.5.7", label: "Horno", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Cocina", scope: "privado", iconName: "ChefHat" },
  { key: "nevera_completa", code: "C01.6.5.8", label: "Nevera completa", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Cocina", scope: "privado", iconName: "IceCream" },
  { key: "nevera_minibar", code: "C01.6.5.9", label: "Nevera/minibar", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Cocina", scope: "privado", iconName: "IceCream" },
  { key: "lavavajillas", code: "C01.6.5.10", label: "Lavavajillas", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Cocina", scope: "privado", iconName: "Droplets" },
  { key: "lavadora", code: "C01.6.5.11", label: "Lavadora", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Cocina", scope: "privado", iconName: "Shirt" },
  { key: "utensilios_cocina", code: "C01.6.5.12", label: "Utensilios de cocina", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Cocina", scope: "privado", iconName: "ChefHat" },
  { key: "vajilla", code: "C01.6.5.13", label: "Vajilla", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Cocina", scope: "privado", iconName: "Utensils" },
  { key: "productos_limpieza", code: "C01.6.5.14", label: "Productos de limpieza", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Amenidades de Cocina", scope: "privado", iconName: "Sparkles" },

  // C01.7. Zonas Comunes e Instalaciones
  { key: "piscina_exterior", code: "C01.7.1.1", label: "Piscina exterior", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Waves" },
  { key: "piscina_interior", code: "C01.7.1.2", label: "Piscina interior (climatizada)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Waves" },
  { key: "spa", code: "C01.7.1.3", label: "Spa", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Sparkles" },
  { key: "sauna", code: "C01.7.1.4", label: "Sauna", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Flame" },
  { key: "bano_turco_hammam", code: "C01.7.1.5", label: "Baño turco / hammam", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Flame" },
  { key: "gimnasio", code: "C01.7.1.6", label: "Gimnasio", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Dumbbell" },
  { key: "zona_yoga", code: "C01.7.1.7", label: "Zona de Yoga", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Smile" },
  { key: "solarium", code: "C01.7.1.8", label: "Solárium", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Sun" },

  // C01.7.2 Ocio y Espacios Sociales
  { key: "salon_tv_comun", code: "C01.7.2.1", label: "Salón de uso común con TV", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Tv" },
  { key: "sala_juegos", code: "C01.7.2.2", label: "Sala de juegos (Billar, Dardos, Futbolin)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Trophy" },
  { key: "biblioteca", code: "C01.7.2.3", label: "Biblioteca", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Archive" },
  { key: "cocina_equipada_comun", code: "C01.7.2.4", label: "Cocina equipada", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "ChefHat" },
  { key: "zona_barbacoa", code: "C01.7.2.5", label: "Zona de barbacoa", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Flame" },
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

  // C01.7.3 & C01.8. Infraestructuras de Negocios & Abastecimiento
  { key: "salas_reuniones", code: "C01.7.3.1", label: "Salas de reuniones", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "servicios", subCategory: "Infraestructuras de Negocios y Eventos", scope: "comun", iconName: "Briefcase" },
  { key: "impresora", code: "C01.7.3.2", label: "Impresora", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "servicios", subCategory: "Infraestructuras de Negocios y Eventos", scope: "comun", iconName: "Briefcase" },
  { key: "salon_actos_eventos", code: "C01.7.3.3", label: "Salón de actos/eventos", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "servicios", subCategory: "Infraestructuras de Negocios y Eventos", scope: "comun", iconName: "Briefcase" },
  { key: "zonas_coworking", code: "C01.7.3.4", label: "Zonas coworking", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "servicios", subCategory: "Infraestructuras de Negocios y Eventos", scope: "comun", iconName: "Briefcase" },
  { key: "planta_electrica_24_7", code: "C01.8.1", label: "Planta Eléctrica 24/7 (Full Power)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "general", subCategory: "Abastecimiento y Energía", scope: "comun", iconName: "Zap" },
  { key: "tanque_agua_continuo", code: "C01.8.2", label: "Tanque de Agua continuo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "general", subCategory: "Abastecimiento y Energía", scope: "comun", iconName: "Droplets" },

  // ==========================================
  // C02. SERVICIOS DEL ESTABLECIMIENTO Y EXPERIENCIAS
  // ==========================================
  { key: "recepcion_24h", code: "C02.1.1", label: "Recepción 24h", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención al Cliente", scope: "servicio", iconName: "Clock" },
  { key: "servicio_conserjeria", code: "C02.1.2", label: "Servicio de conserjería", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención al Cliente", scope: "servicio", iconName: "ConciergeBell" },
  { key: "guarda_equipaje", code: "C02.1.3", label: "Guarda-equipaje", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención al Cliente", scope: "servicio", iconName: "Briefcase" },
  { key: "registro_expres", code: "C02.1.4", label: "Registro de entrada/salida exprés", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención al Cliente", scope: "servicio", iconName: "Clock" },
  { key: "mostrador_turistico", code: "C02.1.5", label: "Mostrador de información turística", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención al Cliente", scope: "servicio", iconName: "Compass" },
  { key: "cuna_adicional", code: "C02.1.6", label: "Cuna adicional en la habitación", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención al Cliente", scope: "servicio", iconName: "Smile" },

  // C02.2. Multilingüe
  { key: "idioma_aleman", code: "C02.2.1", label: "Alemán", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención Multilingüe", scope: "servicio", iconName: "Globe" },
  { key: "idioma_ingles", code: "C02.2.2", label: "Inglés", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención Multilingüe", scope: "servicio", iconName: "Globe" },
  { key: "idioma_espanol", code: "C02.2.3", label: "Español", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención Multilingüe", scope: "servicio", iconName: "Globe" },
  { key: "idioma_frances", code: "C02.2.4", label: "Francés", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención Multilingüe", scope: "servicio", iconName: "Globe" },
  { key: "idioma_portugues", code: "C02.2.5", label: "Portugués", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención Multilingüe", scope: "servicio", iconName: "Globe" },

  // C02.3. Hostelería Interna
  { key: "restaurante", code: "C02.3.1", label: "Restaurante", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Hostelería interna", scope: "comun", iconName: "Utensils" },
  { key: "bar_cafeteria", code: "C02.3.2", label: "Bar/Cafetería", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Hostelería interna", scope: "comun", iconName: "Coffee" },
  { key: "bar_piscina", code: "C02.3.3", label: "Bar en la piscina", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Hostelería interna", scope: "comun", iconName: "Wine" },
  { key: "servicio_habitaciones", code: "C02.3.4", label: "Servicio de habitaciones", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Hostelería interna", scope: "servicio", iconName: "ConciergeBell" },
  { key: "menus_dietas_especiales", code: "C02.3.5", label: "Menús para dietas especiales", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Hostelería interna", scope: "servicio", iconName: "Utensils" },
  { key: "desayuno_habitacion", code: "C02.3.6", label: "Desayuno en la habitación", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Hostelería interna", scope: "servicio", iconName: "Coffee" },

  // C02.4. Mantenimiento & Limpieza
  { key: "limpieza_diaria", code: "C02.4.1", label: "Servicio de limpieza diaria", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Mantenimiento y Limpieza", scope: "servicio", iconName: "Sparkles" },
  { key: "servicio_lavanderia", code: "C02.4.2", label: "Servicio de lavandería", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Mantenimiento y Limpieza", scope: "servicio", iconName: "Shirt" },
  { key: "limpieza_seco", code: "C02.4.3", label: "Limpieza en seco", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Mantenimiento y Limpieza", scope: "servicio", iconName: "Shirt" },
  { key: "servicio_planchado", code: "C02.4.4", label: "Servicio de planchado", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Mantenimiento y Limpieza", scope: "servicio", iconName: "Shirt" },
  { key: "lavanderia_monedas", code: "C02.4.5", label: "Lavandería compartida (de monedas)", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Mantenimiento y Limpieza", scope: "comun", iconName: "Shirt" },

  // C02.5 & C02.6. Internet & Movilidad
  { key: "wifi_gratis", code: "C02.5.1", label: "Wifi gratis", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Conexión a Internet", scope: "servicio", iconName: "Wifi" },
  { key: "wifi_pago", code: "C02.5.2", label: "Wifi de pago", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Conexión a Internet", scope: "servicio", iconName: "Wifi" },
  { key: "parking_cubierto_gratis", code: "C02.6.1", label: "Parking privado cubierto gratis", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Movilidad y Transporte", scope: "comun", iconName: "Car" },
  { key: "parking_descubierto_gratis", code: "C02.6.2", label: "Parking privado descubierto gratis", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Movilidad y Transporte", scope: "comun", iconName: "Car" },
  { key: "parking_cubierto_pago", code: "C02.6.3", label: "Parking privado cubierto de pago (precio)", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Movilidad y Transporte", scope: "comun", isCompletable: true },
  { key: "parking_descubierto_pago", code: "C02.6.4", label: "Parking privado descubierto de pago (precio)", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Movilidad y Transporte", scope: "comun", isCompletable: true },
  { key: "reservar_parking", code: "C02.6.5", label: "Posibilidad de reservar Parking", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Movilidad y Transporte", scope: "servicio", iconName: "Car" },
  { key: "parking_publico_cercano", code: "C02.6.6", label: "Parking público cercano", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Movilidad y Transporte", scope: "comun", iconName: "Car" },
  { key: "parking_adaptado_pmr", code: "C02.6.7", label: "Parking adaptado para personas de movilidad reducida", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Movilidad y Transporte", scope: "comun", iconName: "Accessibility" },
  { key: "carga_ev", code: "C02.6.8", label: "Estación de carga de vehículos eléctricos", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Movilidad y Transporte", scope: "comun", iconName: "Zap" },
  { key: "traslado_aeropuerto", code: "C02.6.9", label: "Servicio de traslado al aeropuerto", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Movilidad y Transporte", scope: "servicio", iconName: "Plane" },
  { key: "alquiler_bicicletas", code: "C02.6.10", label: "Alquiler de bicicletas", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Movilidad y Transporte", scope: "servicio", iconName: "Compass" },
  { key: "alquiler_coches", code: "C02.6.11", label: "Alquiler de coches", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Movilidad y Transporte", scope: "servicio", iconName: "Car" },

  // C02.7. Actividades y Entretenimiento
  { key: "rutas_senderismo", code: "C02.7.1", label: "Rutas de senderismo", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "TreePine" },
  { key: "clases_cocina", code: "C02.7.2", label: "Clases de cocina", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "ChefHat" },
  { key: "visitas_guiadas", code: "C02.7.3", label: "Visitas guiadas", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Compass" },
  { key: "deportes_acuaticos", code: "C02.7.4", label: "Deportes acuáticos", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Waves" },
  { key: "tours_a_pie", code: "C02.7.5", label: "Tours a pie", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Compass" },
  { key: "tours_en_bici", code: "C02.7.6", label: "Tours en bici", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Compass" },
  { key: "noches_cine", code: "C02.7.7", label: "Noches de cine", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Tv" },
  { key: "musica_espectaculos_directo", code: "C02.7.8", label: "Música/espectáculos en directo", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Music" },
  { key: "club_infantil", code: "C02.7.9", label: "Club infantil", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Smile" },
  { key: "club_adolescentes", code: "C02.7.10", label: "Club de adolescentes y actividades", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Smile" },
  { key: "equitacion", code: "C02.7.11", label: "Equitación", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Trophy" },
  { key: "pesca", code: "C02.7.12", label: "Pesca", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Waves" },
  { key: "golf", code: "C02.7.13", label: "Golf", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Trophy" },
  { key: "escalada_arboles", code: "C02.7.14", label: "Escalada de árboles", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "TreePine" },
  { key: "kayak_canoa", code: "C02.7.15", label: "Kayak en Canoa", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Waves" },
  { key: "paseos_lancha_snorkel", code: "C02.7.16", label: "Paseos en lancha / Snorkel", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Waves" },
  { key: "ruta_gastronomica_catas", code: "C02.7.17", label: "Ruta gastronómica / Catas", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Experiencias en alrededores", scope: "servicio", iconName: "Utensils" },

  // ==========================================
  // C03. ACCESIBILIDAD Y SEGURIDAD
  // ==========================================
  { key: "accesible_silla_ruedas_100", code: "C03.1.1", label: "Todo el alojamiento accesible en silla de ruedas", pillar: "C03", pillarLabel: "C03. Accesibilidad y Seguridad", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "comun", iconName: "Accessibility" },
  { key: "ascensor_pisos", code: "C03.1.2", label: "Acceso a pisos superiores o inferiores en ascensor", pillar: "C03", pillarLabel: "C03. Accesibilidad y Seguridad", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "comun", iconName: "ArrowUpSquare" },
  { key: "todo_planta_baja", code: "C03.1.3", label: "Todo en planta baja", pillar: "C03", pillarLabel: "C03. Accesibilidad y Seguridad", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "comun", iconName: "Home" },
  { key: "lavamanos_publico_bajo", code: "C03.1.4", label: "Lavamanos público más bajo", pillar: "C03", pillarLabel: "C03. Accesibilidad y Seguridad", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "comun", iconName: "Accessibility" },
  { key: "wc_publico_barras", code: "C03.1.5", label: "WC público con barras de apoyo", pillar: "C03", pillarLabel: "C03. Accesibilidad y Seguridad", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "comun", iconName: "Accessibility" },
  { key: "senalizacion_braille_publica", code: "C03.1.6", label: "Señalización en braille", pillar: "C03", pillarLabel: "C03. Accesibilidad y Seguridad", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "comun", iconName: "Accessibility" },
  { key: "guiado_auditivo_publico", code: "C03.1.7", label: "Guiado auditivo", pillar: "C03", pillarLabel: "C03. Accesibilidad y Seguridad", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "comun", iconName: "Accessibility" },

  // C03.2. Seguridad
  { key: "camaras_seguridad", code: "C03.2.1", label: "Cámaras de seguridad en las zonas comunes", pillar: "C03", pillarLabel: "C03. Accesibilidad y Seguridad", category: "general", subCategory: "Seguridad y Protección", scope: "comun", iconName: "Eye" },
  { key: "detectores_humo", code: "C03.2.2", label: "Detectores de humo", pillar: "C03", pillarLabel: "C03. Accesibilidad y Seguridad", category: "general", subCategory: "Seguridad y Protección", scope: "comun", iconName: "AlertTriangle" },
  { key: "extintores", code: "C03.2.3", label: "Extintores", pillar: "C03", pillarLabel: "C03. Accesibilidad y Seguridad", category: "general", subCategory: "Seguridad y Protección", scope: "comun", iconName: "Flame" },
  { key: "personal_seguridad_24h", code: "C03.2.4", label: "Personal de Seguridad 24 horas", pillar: "C03", pillarLabel: "C03. Accesibilidad y Seguridad", category: "general", subCategory: "Seguridad y Protección", scope: "servicio", iconName: "ShieldCheck" },
  { key: "tarjetas_acceso_electronicas", code: "C03.2.5", label: "Tarjetas de acceso electrónicas", pillar: "C03", pillarLabel: "C03. Accesibilidad y Seguridad", category: "general", subCategory: "Seguridad y Protección", scope: "servicio", iconName: "Lock" },
  { key: "caja_fuerte_principal_recepcion", code: "C03.2.6", label: "Caja fuerte principal en recepción", pillar: "C03", pillarLabel: "C03. Accesibilidad y Seguridad", category: "general", subCategory: "Seguridad y Protección", scope: "servicio", iconName: "Lock" },

  // ==========================================
  // C04. POLÍTICAS Y NORMAS DE LA PROPIEDAD
  // ==========================================
  { key: "horario_checkin", code: "C04.1.1", label: "Horario de Check-in (Admisión) Desde/hasta", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Horarios", scope: "general", isCompletable: true },
  { key: "horario_checkout", code: "C04.1.2", label: "Horario de Check-out (Salida) Desde/hasta", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Horarios", scope: "general", isCompletable: true },
  { key: "late_checkout_hasta", code: "C04.1.3", label: "Posibilidad de Late Check-out Hasta", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Horarios", scope: "general", isCompletable: true },

  // C04.2. Mascotas
  { key: "admision_mascotas_gratis", code: "C04.2.1", label: "Admisión de mascotas gratis", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Mascotas", scope: "general", iconName: "Dog" },
  { key: "admision_mascotas_suplemento", code: "C04.2.2", label: "Admisión de mascotas con suplemento. Precio:", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Mascotas", scope: "general", isCompletable: true },
  { key: "camas_mascotas", code: "C04.2.3", label: "Camas para mascotas", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Mascotas", scope: "general", iconName: "Dog" },
  { key: "no_se_admiten_mascotas", code: "C04.2.4", label: "No se admiten mascotas", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Mascotas", scope: "general", iconName: "Ban" },

  // C04.3. Perfil de Huésped & C04.4. Tabaco y Fiestas
  { key: "familias_apto_ninos", code: "C04.3.1", label: "Familias (Apto para niños)", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Perfil de Huésped", scope: "general", iconName: "Users" },
  { key: "solo_adultos_parejas", code: "C04.3.2", label: "Solo para adultos / Parejas", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Perfil de Huésped", scope: "general", iconName: "UserCheck" },
  { key: "travel_proud_lgtb", code: "C04.3.3", label: "Travel Proud (LGTB + friendly)", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Perfil de Huésped", scope: "general", iconName: "Heart" },
  { key: "prohibido_fumar", code: "C04.4.1", label: "Prohibido fumar en todo el alojamiento", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Tabaco y Fiestas", scope: "general", iconName: "Ban" },
  { key: "zonas_fumadores", code: "C04.4.2", label: "Zonas habilitadas para fumadores", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Tabaco y Fiestas", scope: "comun", iconName: "Flame" },
  { key: "prohibido_fiestas", code: "C04.4.3", label: "Prohibida la celebración de fiestas/eventos", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Tabaco y Fiestas", scope: "general", iconName: "Ban" },
  { key: "minimizar_ruido_horario", code: "C04.4.4", label: "Los clientes deben minimizar el ruido de ___h a ___h", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Tabaco y Fiestas", scope: "general", isCompletable: true },

  // C04.5. Políticas Especiales
  { key: "love_hotels_entrada_salida_discreta", code: "C04.5.1", label: "Entrada/Salida discreta o automatizada (Love hoteles)", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Políticas Especiales", scope: "general", iconName: "Lock" },
  { key: "love_hotels_alquiler_horas", code: "C04.5.2", label: "Alquiler por horas (Love hoteles)", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Políticas Especiales", scope: "general", iconName: "Clock" },
  { key: "albergues_hora_toque_queda", code: "C04.5.3", label: "Hora de toque de queda: ___ (Campings, Residencias y albergues)", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Políticas Especiales", scope: "general", isCompletable: true },
  { key: "albergues_edad_minima_admision", code: "C04.5.4", label: "Edad mínima de admisión ___ años (Campings, Residencias y Alberges)", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Políticas Especiales", scope: "general", isCompletable: true },

  // C04.6. Pago Online
  { key: "pago_tarjeta_visa_mc", code: "C04.6.1", label: "Tarjeta (VISA, MC)", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Pago online", scope: "general", iconName: "Zap" },
  { key: "pago_bizum_espana", code: "C04.6.2", label: "Bizum (España)", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Pago online", scope: "general", iconName: "Zap" },
  { key: "pago_binance_usdt", code: "C04.6.3", label: "Binance USDT / Crypto", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Pago online", scope: "general", iconName: "Zap" },
  { key: "pago_movil_ves", code: "C04.6.4", label: "Pago Móvil (Bs. VES)", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Pago online", scope: "general", iconName: "Zap" },
  { key: "pago_zelle_usd", code: "C04.6.5", label: "Zelle (USD) (Venezuela)", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Pago online", scope: "general", iconName: "Zap" },

  // C04.7. Régimen & Condiciones Reserva
  { key: "regimen_con_cocina", code: "C04.7.1", label: "Con cocina", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Régimen de Estancia", scope: "general", iconName: "ChefHat" },
  { key: "regimen_desayuno_incluido", code: "C04.7.2", label: "Desayuno incluido", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Régimen de Estancia", scope: "general", iconName: "Coffee" },
  { key: "regimen_todas_comidas_incluidas", code: "C04.7.3", label: "Todas las comidas incluidas", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Régimen de Estancia", scope: "general", iconName: "Utensils" },
  { key: "regimen_desayuno_cena_incluidos", code: "C04.7.4", label: "Desayuno y cena incluidos", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Régimen de Estancia", scope: "general", iconName: "Utensils" },
  { key: "restaurante_en_propiedad", code: "C04.7.5", label: "Restaurante en la propiedad", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Régimen de Estancia", scope: "general", iconName: "Utensils" },
  { key: "cancelacion_gratis", code: "C04.8.1", label: "Cancelación gratis", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Condiciones de la reserva", scope: "general", iconName: "Check" },
  { key: "reservas_sin_tarjeta", code: "C04.8.2", label: "Reservas sin tarjeta de crédito", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Condiciones de la reserva", scope: "general", iconName: "Check" },
  { key: "ninos_cualquier_edad", code: "C04.9.1", label: "Se pueden alojar niños de cualquier edad.", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Condiciones para estancia de niños", scope: "general", iconName: "Smile" },
  { key: "ninos_pagan_adulto_desde_x_anos", code: "C04.9.2", label: "Los niños a partir de X años pagan como adultos en este alojamiento.", pillar: "C04", pillarLabel: "C04. Políticas y Normas", category: "general", subCategory: "Condiciones para estancia de niños", scope: "general", isCompletable: true },

  // ==========================================
  // C05. ESPECÍFICOS: AGRUPACIÓN DE UNIDADES HABITACIONALES (Campings/Glampings)
  // ==========================================
  { key: "camping_panaderia", code: "C05.1", label: "Panadería", pillar: "C05", pillarLabel: "C05. Específicos Agrupación Unidades", category: "especificos", subCategory: "Campings & Eco-Lodges", scope: "especifico", iconName: "Coffee" },
  { key: "camping_comestibles_supermercado", code: "C05.2", label: "Comestibles / Supermercado", pillar: "C05", pillarLabel: "C05. Específicos Agrupación Unidades", category: "especificos", subCategory: "Campings & Eco-Lodges", scope: "especifico", iconName: "Coffee" },
  { key: "camping_banos_publicos", code: "C05.3", label: "Baños públicos", pillar: "C05", pillarLabel: "C05. Específicos Agrupación Unidades", category: "especificos", subCategory: "Campings & Eco-Lodges", scope: "especifico", iconName: "Droplets" },
  { key: "camping_duchas_comunitarias", code: "C05.4", label: "Duchas comunitarias", pillar: "C05", pillarLabel: "C05. Específicos Agrupación Unidades", category: "especificos", subCategory: "Campings & Eco-Lodges", scope: "especifico", iconName: "Droplets" },
  { key: "camping_autoservicio_lavanderia", code: "C05.5", label: "Autoservicio de lavandería", pillar: "C05", pillarLabel: "C05. Específicos Agrupación Unidades", category: "especificos", subCategory: "Campings & Eco-Lodges", scope: "especifico", iconName: "Shirt" },
  { key: "camping_aparcamiento_recinto", code: "C05.6", label: "Aparcamiento en el recinto", pillar: "C05", pillarLabel: "C05. Específicos Agrupación Unidades", category: "especificos", subCategory: "Campings & Eco-Lodges", scope: "especifico", iconName: "Car" },
  { key: "camping_conexion_electrica_parcela", code: "C05.7", label: "Posibilidad de conexión eléctrica en parcela", pillar: "C05", pillarLabel: "C05. Específicos Agrupación Unidades", category: "especificos", subCategory: "Campings & Eco-Lodges", scope: "especifico", iconName: "Zap" },
  { key: "camping_conexion_agua_parcela", code: "C05.8", label: "Posibilidad de conexión de agua en parcela", pillar: "C05", pillarLabel: "C05. Específicos Agrupación Unidades", category: "especificos", subCategory: "Campings & Eco-Lodges", scope: "especifico", iconName: "Droplets" },
  { key: "camping_descarga_agua_parcela", code: "C05.9", label: "Posibilidad de descarga de agua en parcela", pillar: "C05", pillarLabel: "C05. Específicos Agrupación Unidades", category: "especificos", subCategory: "Campings & Eco-Lodges", scope: "especifico", iconName: "Droplets" },

  // ==========================================
  // C06. ESPECÍFICOS: LOVE HOTELS & MOTELES
  // ==========================================
  { key: "love_cama_colchon_reforzado", code: "C06.1.1", label: "Cama King/Queen Size con colchón reforzado", pillar: "C06", pillarLabel: "C06. Específicos Love Hotels", category: "especificos", subCategory: "Descanso y Mobiliario Erótico", scope: "especifico", iconName: "Bed" },
  { key: "love_sillon_tantra", code: "C06.1.2", label: "Sillón Tantra", pillar: "C06", pillarLabel: "C06. Específicos Love Hotels", category: "especificos", subCategory: "Descanso y Mobiliario Erótico", scope: "especifico", iconName: "Heart" },
  { key: "love_espejos_estrategicos", code: "C06.1.3", label: "Espejos estratégicos", pillar: "C06", pillarLabel: "C06. Específicos Love Hotels", category: "especificos", subCategory: "Descanso y Mobiliario Erótico", scope: "especifico", iconName: "Eye" },
  { key: "love_ducha_cristal_vista_cama", code: "C06.2.1", label: "Ducha de cristal transparente vista desde la cama", pillar: "C06", pillarLabel: "C06. Específicos Love Hotels", category: "especificos", subCategory: "Baño Privado y Zona de Agua", scope: "especifico", iconName: "Droplets" },
  { key: "love_kits_higiene_cosmetica_erotica", code: "C06.2.2", label: "Kits de higiene íntima y cosmética erótica", pillar: "C06", pillarLabel: "C06. Específicos Love Hotels", category: "especificos", subCategory: "Baño Privado y Zona de Agua", scope: "especifico", iconName: "Sparkles" },
  { key: "love_iluminacion_led_regulable", code: "C06.3.1", label: "Iluminación LED regulable por zonas y colores", pillar: "C06", pillarLabel: "C06. Específicos Love Hotels", category: "especificos", subCategory: "Climatización y Ambientación", scope: "especifico", iconName: "Sparkles" },
  { key: "love_insonorizacion_acustica_reforzada", code: "C06.3.2", label: "Insonorización acústica reforzada", pillar: "C06", pillarLabel: "C06. Específicos Love Hotels", category: "especificos", subCategory: "Climatización y Ambientación", scope: "especifico", iconName: "VolumeX" },
  { key: "love_garaje_privado_puerta_automatica", code: "C06.4.1", label: "Garaje privado individual con puerta automática (Check-in sin bajarte del coche)", pillar: "C06", pillarLabel: "C06. Específicos Love Hotels", category: "especificos", subCategory: "Acceso e Infraestructura de Privacidad", scope: "especifico", iconName: "Car" },
  { key: "love_torno_pass_through_box", code: "C06.4.2", label: "Torno / 'Pass-through Box' de entrega anónimo", pillar: "C06", pillarLabel: "C06. Específicos Love Hotels", category: "especificos", subCategory: "Acceso e Infraestructura de Privacidad", scope: "especifico", iconName: "Lock" },
  { key: "love_entrada_salida_independientes", code: "C06.4.3", label: "Entrada y salida por accesos independientes", pillar: "C06", pillarLabel: "C06. Específicos Love Hotels", category: "especificos", subCategory: "Acceso e Infraestructura de Privacidad", scope: "especifico", iconName: "Lock" },
  { key: "love_checkin_checkout_automatizado", code: "C06.5.1", label: "Check-in / Check-out automatizado", pillar: "C06", pillarLabel: "C06. Específicos Love Hotels", category: "especificos", subCategory: "Servicios de Atención", scope: "especifico", iconName: "Clock" },
  { key: "love_horario_24_365", code: "C06.5.2", label: "Horario 24/365", pillar: "C06", pillarLabel: "C06. Específicos Love Hotels", category: "especificos", subCategory: "Servicios de Atención", scope: "especifico", iconName: "Clock" },
  { key: "love_facturacion_cobro_anonimo", code: "C06.5.3", label: "Facturación y cobro 100% anónimo", pillar: "C06", pillarLabel: "C06. Específicos Love Hotels", category: "especificos", subCategory: "Servicios de Atención", scope: "especifico", iconName: "ShieldCheck" },

  // ==========================================
  // C07. ESPECÍFICOS: CASAS Y CHALETS DE MONTAÑA (ESQUÍ)
  // ==========================================
  { key: "esqui_chimenea_lena", code: "C07.1.1", label: "Chimenea de leña", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Descanso y Confort Térmico", scope: "especifico", iconName: "Flame" },
  { key: "esqui_estufa_pellets", code: "C07.1.2", label: "Estufa de pellets o casete térmico (leña de cortesía)", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Descanso y Confort Térmico", scope: "especifico", iconName: "Flame" },
  { key: "esqui_ropa_cama_termica", code: "C07.1.3", label: "Ropa de cama térmica/nórdica alto gramaje y mantas extra", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Descanso y Confort Térmico", scope: "especifico", iconName: "Bed" },
  { key: "esqui_set_fondue", code: "C07.2.1", label: "Set de Fondue", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Cocina y Menaje de Montaña", scope: "especifico", iconName: "ChefHat" },
  { key: "esqui_raclette", code: "C07.2.2", label: "Raclette", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Cocina y Menaje de Montaña", scope: "especifico", iconName: "ChefHat" },
  { key: "esqui_despensa_nieve", code: "C07.2.3", label: "Despensa de gran capacidad para estancias de nieve", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Cocina y Menaje de Montaña", scope: "especifico", iconName: "Archive" },
  { key: "esqui_suelo_radiante", code: "C07.3.1", label: "Calefacción suelo radiante o radiadores de alta eficiencia", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Climatización y Suministros", scope: "especifico", iconName: "Flame" },
  { key: "esqui_termostatos_programables", code: "C07.3.2", label: "Termostatos programables por zonas/plantas", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Climatización y Suministros", scope: "especifico", iconName: "Flame" },
  { key: "esqui_jacuzzi_exterior_hot_tub", code: "C07.4.1", label: "Jacuzzi exterior / Bañera nórdica (Hot Tub)", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Exteriores Privados en Montaña", scope: "especifico", iconName: "Bath" },
  { key: "esqui_balcon_vistas_pistas", code: "C07.4.2", label: "Balcón o terraza panorámica con vistas a las pistas/montaña", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Exteriores Privados en Montaña", scope: "especifico", iconName: "Mountain" },
  { key: "esqui_terraza_estufas", code: "C07.4.3", label: "Terraza con estufas de exterior (setas de gas/braseros)", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Exteriores Privados en Montaña", scope: "especifico", iconName: "Flame" },
  { key: "esqui_almacenamiento_lena_cubierta", code: "C07.4.4", label: "Zona de almacenamiento exterior para leña cubierta.", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Exteriores Privados en Montaña", scope: "especifico", iconName: "Archive" },
  { key: "esqui_guardaesquis_ski_room", code: "C07.5.1", label: "Guardaesquís (Ski Room)", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Instalaciones de Esquí", scope: "especifico", iconName: "Mountain" },
  { key: "esqui_secador_botas", code: "C07.5.2", label: "Secador de botas de esquí", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Instalaciones de Esquí", scope: "especifico", iconName: "Wind" },
  { key: "esqui_mudroom_vestuario", code: "C07.5.3", label: "Zona de vestuario térmico (Mudroom)", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Instalaciones de Esquí", scope: "especifico", iconName: "Shirt" },
  { key: "esqui_acceso_ski_in_out", code: "C07.5.4", label: "Acceso Ski-in / Ski-out", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Instalaciones de Esquí", scope: "especifico", iconName: "Mountain" },
  { key: "esqui_garaje_calefactado", code: "C07.5.5", label: "Garaje privado cubierto y calefactado", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Instalaciones de Esquí", scope: "especifico", iconName: "Car" },
  { key: "esqui_sauna_privada", code: "C07.5.6", label: "Sauna finlandesa o Baño turco privado", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Instalaciones de Esquí", scope: "especifico", iconName: "Flame" },
  { key: "esqui_sauna_compartida", code: "C07.5.7", label: "Sauna finlandesa o Baño turco compartido", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Instalaciones de Esquí", scope: "comun", iconName: "Flame" },
  { key: "esqui_shuttle_telecabinas", code: "C07.6.1", label: "Servicio de Shuttle privado o transfer diario a las telecabinas", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Servicios y Transporte", scope: "especifico", iconName: "Car" },
  { key: "esqui_venta_forfaits", code: "C07.6.2", label: "Venta o entrega de Forfaits directamente en el chalet", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Servicios y Transporte", scope: "especifico", iconName: "Check" },
  { key: "esqui_reserva_clases", code: "C07.6.3", label: "Servicio de reserva de clases de esquí", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Servicios y Transporte", scope: "especifico", iconName: "Smile" },
  { key: "esqui_chef_privado_domicilio", code: "C07.7.1", label: "Servicio de Chef privado a domicilio para cenas tras el esquí.", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Hostelería / Catering", scope: "especifico", iconName: "ChefHat" },
  { key: "esqui_entrega_diaria_pan", code: "C07.7.2", label: "Servicio de entrega diaria de pan fresco y repostería", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Hostelería / Catering", scope: "especifico", iconName: "Coffee" },
  { key: "esqui_alquiler_raquetas_nieve", code: "C07.8.1", label: "Alquiler o provisión de raquetas de nieve", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Actividades Organizadas", scope: "especifico", iconName: "Mountain" },
  { key: "esqui_trineos_ninos", code: "C07.8.2", label: "Trineos para niños", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Actividades Organizadas", scope: "especifico", iconName: "Smile" },
  { key: "esqui_guias_montana_heliesqui", code: "C07.8.3", label: "Guías de montaña para esquí de travesía o heliesquí", pillar: "C07", pillarLabel: "C07. Específicos Montaña / Esquí", category: "especificos", subCategory: "Actividades Organizadas", scope: "especifico", iconName: "Compass" },

  // ==========================================
  // C08 & C09. ESPECÍFICOS: EMBARCACIONES & BARCOS
  // ==========================================
  { key: "barco_camarote_doble", code: "C09.1.1", label: "Camarote doble", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Equipamiento de Camarotes e Interiores", scope: "especifico", iconName: "Bed" },
  { key: "barco_camarote_individual", code: "C09.1.2", label: "Camarote individual", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Equipamiento de Camarotes e Interiores", scope: "especifico", iconName: "Bed" },
  { key: "barco_literas_nauticas_red", code: "C09.1.3", label: "Literas náuticas con red anticaída", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Equipamiento de Camarotes e Interiores", scope: "especifico", iconName: "Bed" },
  { key: "barco_escotillas_mosquitera", code: "C09.1.4", label: "Escotillas con mosquitera", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Equipamiento de Camarotes e Interiores", scope: "especifico", iconName: "ShieldCheck" },
  { key: "barco_cortinas_foscurit", code: "C09.1.5", label: "Cortinas/escotillas con foscurit (blackout)", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Equipamiento de Camarotes e Interiores", scope: "especifico", iconName: "EyeOff" },
  { key: "barco_colchones_antihumedad", code: "C09.1.6", label: "Colchones con ventilación antihumedad.", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Equipamiento de Camarotes e Interiores", scope: "especifico", iconName: "Bed" },
  { key: "barco_ducha_bomba_achique", code: "C09.1.7", label: "Ducha en camarote con bomba de achique", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Equipamiento de Camarotes e Interiores", scope: "especifico", iconName: "Droplets" },
  { key: "barco_cocina_basculante_cardan", code: "C09.1.8", label: "Cocina marina basculante (cardán con tope de seguridad)", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Equipamiento de Camarotes e Interiores", scope: "especifico", iconName: "ChefHat" },
  { key: "barco_fogones_gas_vitro", code: "C09.1.9", label: "Fogones de gas/vitrocerámica marina", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Equipamiento de Camarotes e Interiores", scope: "especifico", iconName: "Flame" },
  { key: "barco_horno_gas_electrico", code: "C09.1.10", label: "Horno de gas/eléctrico", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Equipamiento de Camarotes e Interiores", scope: "especifico", iconName: "ChefHat" },
  { key: "barco_nevera_12v_24v", code: "C09.1.11", label: "Nevera / glacera marina de 12V/24V congelador integrado", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Equipamiento de Camarotes e Interiores", scope: "especifico", iconName: "IceCream" },
  { key: "barco_vajilla_irrompible", code: "C09.1.12", label: "Vajilla /cristalería irrompible (melamina / policarbonato)", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Equipamiento de Camarotes e Interiores", scope: "especifico", iconName: "Utensils" },
  { key: "barco_fregadero_bomba_agua_mar", code: "C09.1.13", label: "Fregadero con bomba de agua dulce y de agua de mar", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Equipamiento de Camarotes e Interiores", scope: "especifico", iconName: "Droplets" },
  { key: "barco_aire_acondicionado_marina", code: "C09.1.14", label: "Aire acondicionado de marina (con toma de puerto)", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Equipamiento de Camarotes e Interiores", scope: "especifico", iconName: "Wind" },
  { key: "barco_calefaccion_diesel_webasto", code: "C09.1.15", label: "Calefacción diésel (tipo Webasto/Eberspächer)", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Equipamiento de Camarotes e Interiores", scope: "especifico", iconName: "Flame" },
  { key: "barco_desalinizadora", code: "C09.1.16", label: "Desalinizadora / potabilizadora de agua", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Equipamiento de Camarotes e Interiores", scope: "especifico", iconName: "Droplets" },
  { key: "barco_inversor_corriente_220v", code: "C09.1.17", label: "Inversor de corriente (12V a 220V)", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Equipamiento de Camarotes e Interiores", scope: "especifico", iconName: "Zap" },

  // Cubierta & Prestaciones Náuticas
  { key: "barco_puente_mando", code: "C09.2.1", label: "Puente de mando", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Cubierta y Zonas Exteriores", scope: "especifico", iconName: "Ship" },
  { key: "barco_solarium_proa", code: "C09.2.2", label: "Solárium en proa", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Cubierta y Zonas Exteriores", scope: "especifico", iconName: "Sun" },
  { key: "barco_plataforma_bano_popa", code: "C09.2.3", label: "Plataforma de baño en popa", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Cubierta y Zonas Exteriores", scope: "especifico", iconName: "Waves" },
  { key: "barco_amarre_marina_privada", code: "C09.3.1", label: "Amarre en puerto deportivo/marina privada", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Zonas Comunes e Instalaciones", scope: "especifico", iconName: "Anchor" },
  { key: "barco_capitan_privado_incluido", code: "C09.4.1", label: "Servicio de Patrón / Capitán privado incluido", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Prestaciones Náuticas", scope: "especifico", iconName: "UserCheck" },
  { key: "barco_wifi_starlink", code: "C09.4.6", label: "Wi-Fi satelital / Starlink para navegación en alta mar", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Prestaciones Náuticas", scope: "especifico", iconName: "Wifi" },
  { key: "barco_equipamiento_snorkel", code: "C09.4.8", label: "Equipamiento de snorkel (gafas, tubo, aletas)", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Prestaciones Náuticas", scope: "especifico", iconName: "Waves" },
  { key: "barco_paddle_surf", code: "C09.4.9", label: "Tablas de Paddle Surf (SUP)", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Prestaciones Náuticas", scope: "especifico", iconName: "Waves" },
  { key: "barco_chalecos_salvavidas", code: "C09.5.1", label: "Chalecos salvavidas para adultos y niños", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Medidas de Seguridad Marítima", scope: "especifico", iconName: "ShieldCheck" },
  { key: "barco_radio_vhf_dsc", code: "C09.5.4", label: "Radio VHF con DSC", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Medidas de Seguridad Marítima", scope: "especifico", iconName: "Zap" },
  { key: "barco_epirb_radiobaliza", code: "C09.5.5", label: "Radiobaliza (EPIRB)", pillar: "C09", pillarLabel: "C09. Específicos Barcos & Náutica", category: "especificos", subCategory: "Medidas de Seguridad Marítima", scope: "especifico", iconName: "AlertTriangle" },

  // ==========================================
  // C10. ESPECÍFICOS: RESTAURANTES & GASTRONOMÍA
  // ==========================================
  { key: "rest_mesas_individuales_parejas", code: "C10.1.1", label: "Mesas individuales / Parejas", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Tipología y Formato de las Mesas", scope: "especifico", iconName: "Utensils" },
  { key: "rest_mesas_4_6_pax", code: "C10.1.2", label: "Mesas para 4-6 pax", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Tipología y Formato de las Mesas", scope: "especifico", iconName: "Utensils" },
  { key: "rest_mesas_8_10_pax", code: "C10.1.3", label: "Mesas para 8-10 pax", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Tipología y Formato de las Mesas", scope: "especifico", iconName: "Utensils" },
  { key: "rest_mesa_imperial_fija_10", code: "C10.1.4", label: "Mesa imperial fija +10 comensales", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Tipología y Formato de las Mesas", scope: "especifico", iconName: "Utensils" },
  { key: "rest_mesas_altas_taburetes", code: "C10.1.5", label: "Mesas altas con taburetes", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Tipología y Formato de las Mesas", scope: "especifico", iconName: "Utensils" },
  { key: "rest_booths_dinner_americano", code: "C10.1.8", label: "Cavinas tipo dinner americano (Booths)", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Tipología y Formato de las Mesas", scope: "especifico", iconName: "Utensils" },
  { key: "rest_espacio_amplio_mesas_privacidad", code: "C10.2.2", label: "Espacio amplio entre mesas (alta privacidad +1,5m)", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Distribución y Privacidad en Sala", scope: "especifico", iconName: "Smile" },
  { key: "rest_elementos_divisorios_biombos", code: "C10.2.6", label: "Elementos divisorios entre mesas (biombos, paneles, cortinas, plantas)", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Distribución y Privacidad en Sala", scope: "especifico", iconName: "EyeOff" },
  { key: "rest_hilo_musical_jazz_clasica", code: "C10.4.5", label: "Hilo musical ambiente, jazz/clásica/electrónica", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Ambiente, Acústica y Climatización", scope: "especifico", iconName: "Music" },
  { key: "rest_dj_en_vivo", code: "C10.4.6", label: "DJ en vivo", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Ambiente, Acústica y Climatización", scope: "especifico", iconName: "Music" },
  { key: "rest_purificadores_aire", code: "C10.4.9", label: "Purificadores de aire", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Ambiente, Acústica y Climatización", scope: "especifico", iconName: "Wind" },
  { key: "rest_enchufes_220v_mesa", code: "C10.5.1", label: "Enchufes 220v bajo o junto a la mesa", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Integración Tecnológica en la Mesa", scope: "especifico", iconName: "Zap" },
  { key: "rest_puertos_usb_mesa", code: "C10.5.2", label: "Puerto de carga USB integrados en la mesa", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Integración Tecnológica en la Mesa", scope: "especifico", iconName: "Zap" },
  { key: "rest_codigo_qr_fijo_mesa", code: "C10.5.3", label: "Código QR fijo en la mesa para carta", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Integración Tecnológica en la Mesa", scope: "especifico", iconName: "Globe" },
  { key: "rest_botons_llamar_camarero", code: "C10.5.4", label: "Botón físico o digital para llamar al camarero", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Integración Tecnológica en la Mesa", scope: "especifico", iconName: "ConciergeBell" },
  { key: "rest_ganchos_bolsos_tablero", code: "C10.5.6", label: "Ganchos cuelga-bolsos bajo el tablero", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Integración Tecnológica en la Mesa", scope: "especifico", iconName: "Shirt" },

  // Reservados VIP & Protocolo Anti-Paparazzi
  { key: "rest_micro_reservados_2_pax", code: "C10.6.1.1", label: "Micro-Reservados Comedores privados exclusivos para 2 personas (peticiones de mano, aniversarios)", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Espacios Exclusivos VIP", scope: "especifico", iconName: "Heart" },
  { key: "rest_reservados_medios_4_10_pax", code: "C10.6.1.2", label: "Reservados Medios (4 a 10 pax)", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Espacios Exclusivos VIP", scope: "especifico", iconName: "Users" },
  { key: "rest_salon_privado_10_40_pax", code: "C10.6.1.3", label: "Salón Privado Grande (10 a 40 pax)", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Espacios Exclusivos VIP", scope: "especifico", iconName: "Users" },
  { key: "rest_acceso_directo_aparcamiento", code: "C10.6.2.2", label: "Acceso directo desde aparcamiento", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Accesibilidad y Discreción VIP", scope: "especifico", iconName: "Car" },
  { key: "rest_banos_privados_exclusivos_reservado", code: "C10.6.2.3", label: "Baños privados exclusivos dentro del reservado", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Accesibilidad y Discreción VIP", scope: "especifico", iconName: "Droplets" },
  { key: "rest_checkin_cobro_anonimo_pseudonimo", code: "C10.6.2.4", label: "Check-in y Cobro Anónimo: Gestión de reserva bajo seudónimo", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Accesibilidad y Discreción VIP", scope: "especifico", iconName: "ShieldCheck" },
  { key: "rest_protocolo_anti_paparazzi", code: "C10.6.2.5", label: "Protocolo Anti-Paparazzi / Medidas de Privacidad: Prohibición de cámaras, cristales unidireccionales o tintados", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Accesibilidad y Discreción VIP", scope: "especifico", iconName: "EyeOff" },
  { key: "rest_mesa_del_chef", code: "C10.6.3.1", label: "Mesa del Chef (Chef's Table)", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Experiencias Exclusivas Cocina", scope: "especifico", iconName: "ChefHat" },
  { key: "rest_sommelier_dedicado", code: "C10.6.3.3", label: "Sommelier / Sumiller Dedicado", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Experiencias Exclusivas Cocina", scope: "especifico", iconName: "Wine" },
  { key: "rest_personal_sala_dedicado_maitre", code: "C10.6.3.4", label: "Personal de Sala Dedicado: Camarero y maître asignados en exclusiva", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Experiencias Exclusivas Cocina", scope: "especifico", iconName: "ConciergeBell" },

  // Terrazas & Exteriores
  { key: "rest_terraza_pie_calle", code: "C10.2.1.1", label: "Terraza a Pie de Calle", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Terrazas y Exteriores", scope: "especifico", iconName: "Sun" },
  { key: "rest_terraza_rooftop_azotea", code: "C10.2.1.2", label: "Terraza en Azotea / Rooftop", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Terrazas y Exteriores", scope: "especifico", iconName: "Sun" },
  { key: "rest_chiringuito_zona_playa", code: "C10.2.1.7", label: "Chiringuito / Zona de Playa (sobre la arena)", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Terrazas y Exteriores", scope: "especifico", iconName: "Sun" },
  { key: "rest_vistas_atardecer", code: "C10.2.1.8", label: "Vistas al atardecer/puesta de sol", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Terrazas y Exteriores", scope: "especifico", iconName: "Sun" },
  { key: "rest_nebulizadores_agua_fresca", code: "C10.2.4.1", label: "Nebulizadores de agua fresca (microclima por aspersión de agua)", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Climatización de Terrazas", scope: "especifico", iconName: "Wind" },
  { key: "rest_camas_balinesas_daybeds", code: "C10.2.5.3", label: "Camas Balinesas y Daybeds (exterior exclusivo consumición mínima)", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Mobiliario y Asientos Exterior", scope: "especifico", iconName: "Sun" },
  { key: "rest_barra_cocteleria_exterior", code: "C10.2.6.1", label: "Barra de Coctelería / Bar de Exterior", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Instalaciones Exclusivas Exterior", scope: "especifico", iconName: "Wine" },
  { key: "rest_cocina_exterior_parrilla_vista", code: "C10.2.6.2", label: "Cocina de Exterior / Parrilla a la Vista (Barbacoa, Horno leña, Espetos)", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Instalaciones Exclusivas Exterior", scope: "especifico", iconName: "Flame" },

  // Baños e Infantil Restaurante
  { key: "rest_secado_textil_alta_gama", code: "C10.3.3.1", label: "Secado Textil - Alta Gama (Toallas de tela individuales de un solo uso en cestas)", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Equipamiento en Baños Restaurante", scope: "especifico", iconName: "Sparkles" },
  { key: "rest_amenidades_colonias_perfumes_marca", code: "C10.3.4.3", label: "Colonias, fragancias o perfumes de marca a disposición de cortesía", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Equipamiento en Baños Restaurante", scope: "especifico", iconName: "Sparkles" },
  { key: "rest_tronas_bebes", code: "C10.4.1.1", label: "Tronas para bebes", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Infraestructura Familiar e Infantil", scope: "especifico", iconName: "Smile" },
  { key: "rest_manteles_individuales_colorear", code: "C10.4.1.5", label: "Manteles individuales para colorear con ceras/rotuladores lavables incluidos", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Infraestructura Familiar e Infantil", scope: "especifico", iconName: "Smile" },
  { key: "rest_servicio_triturado_alimentos_gratis", code: "C10.4.2.3", label: "Servicio de triturado de alimentos del propio menú de la carta sin coste adicional", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Infraestructura Familiar e Infantil", scope: "especifico", iconName: "Utensils" },
  { key: "rest_kids_corner_juegos", code: "C10.4.3.1", label: "Rincón de Juegos Interior (Kid's Corner)", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Infraestructura Familiar e Infantil", scope: "especifico", iconName: "Smile" },
  { key: "rest_servicio_cuidador_en_sala", code: "C10.4.3.1.2", label: "Servicio de Cuidador en Sala (para atender a los niños durante o después de la comida)", pillar: "C10", pillarLabel: "C10. Específicos Restaurantes", category: "gastronomia", subCategory: "Infraestructura Familiar e Infantil", scope: "especifico", iconName: "UserCheck" }
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
    configuracion: matched.filter(a => a.pillar === "C00"),
    infraestructuraPrivada: matched.filter(a => a.pillar === "C01" && (a.scope === "privado" || a.category === "habitacion")),
    zonasComunes: matched.filter(a => a.pillar === "C01" && (a.scope === "comun" || a.category === "recreacion" || a.subCategory.includes("Abastecimiento"))),
    serviciosExperiencias: matched.filter(a => a.pillar === "C02"),
    accesibilidadSeguridad: matched.filter(a => a.pillar === "C03"),
    normasPoliticas: matched.filter(a => a.pillar === "C04"),
    especificosCampings: matched.filter(a => a.pillar === "C05"),
    especificosLoveHotels: matched.filter(a => a.pillar === "C06"),
    especificosMontana: matched.filter(a => a.pillar === "C07"),
    especificosBarcos: matched.filter(a => a.pillar === "C08" || a.pillar === "C09"),
    especificosRestaurantes: matched.filter(a => a.pillar === "C10"),
    otros: matched.filter(a => !["C00", "C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10"].includes(a.pillar))
  };
}
