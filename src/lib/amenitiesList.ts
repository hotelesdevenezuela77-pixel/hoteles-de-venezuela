export type AmenityPillar = "C01" | "C02" | "C03";
export type AmenityScope = "privado" | "comun" | "servicio";

export interface AmenityItem {
  key: string;
  code: string;
  label: string;
  pillar: AmenityPillar;
  pillarLabel: string;
  category: "general" | "recreacion" | "gastronomia" | "servicios" | "habitacion";
  subCategory: string;
  scope: AmenityScope;
  iconName: string;
}

export const PILLARS_DOCUMENT77 = [
  { id: "all", label: "Todos los Pilares" },
  { id: "C01", label: "C01. Infraestructura Físicas (Tangible)", color: "#00C8D4" },
  { id: "C02", label: "C02. Servicios y Experiencias (Intangibles)", color: "#FF0096" },
  { id: "C03", label: "C03. Gestión, Políticas y Logística (Normas)", color: "#9B00CC" },
];

export const AMENITY_SCOPES = [
  { id: "all", label: "Todos los Ámbitos" },
  { id: "privado", label: "🚪 Privado de la Unidad", color: "#00C8D4" },
  { id: "comun", label: "🏢 Zona Común (Compartido)", color: "#9B00CC" },
  { id: "servicio", label: "✨ Servicio Intangible", color: "#FF0096" },
];

export const AMENITY_CATEGORIES = [
  { id: "all", label: "Todas las Categorías" },
  { id: "habitacion", label: "🛏️ Unidad Privada" },
  { id: "recreacion", label: "🏊 Zonas Comunes & Relax" },
  { id: "gastronomia", label: "🍽️ Gastronomía & Alimentos" },
  { id: "servicios", label: "⛵ Servicios & Experiencias" },
  { id: "general", label: "🛡️ Accesibilidad & Políticas" },
];

export const PROPERTY_TYPES_DOCUMENT77 = [
  { id: "apartamentos", label: "Apartamentos", icon: "Building" },
  { id: "casas_apartamentos_enteros", label: "Casas y apartamentos enteros", icon: "Home" },
  { id: "hoteles", label: "Hoteles", icon: "Hotel" },
  { id: "hostales_pensiones", label: "Hostales y pensiones", icon: "Bed" },
  { id: "posadas", label: "Posadas", icon: "TreePine" },
  { id: "habitaciones_casas_particulares", label: "Habitaciones en casas particulares", icon: "UserCheck" },
  { id: "apartahoteles", label: "Apartahoteles", icon: "Building2" },
  { id: "albergues", label: "Albergues", icon: "Users" },
  { id: "bed_and_breakfasts", label: "Bed and breakfasts", icon: "Coffee" },
  { id: "casas_chalets", label: "Casas y chalets", icon: "Home" },
  { id: "residencias_estudiantes", label: "Residencias de estudiantes", icon: "GraduationCap" },
  { id: "hoteles_capsula", label: "Hoteles cápsula", icon: "Box" },
  { id: "campings", label: "Campings", icon: "Tent" },
  { id: "villas", label: "Villas", icon: "Palmtree" },
  { id: "barcos", label: "Barcos / Yates", icon: "Ship" },
  { id: "love_hotels", label: "Love hotels", icon: "Heart" },
  { id: "chalets_montana", label: "Chalets de montaña", icon: "Mountain" },
];

export const CERTIFICATIONS_DOCUMENT77 = [
  { id: "sostenibilidad", code: "C04.2.1", label: "Certificación de Sostenibilidad", badgeColor: "bg-emerald-500 text-white" },
  { id: "sello_legal_hdv", code: "C04.2.2", label: "Sello de Garantía Legal HDV", badgeColor: "bg-[#00C8D4] text-white" },
  { id: "circuito_excelencia", code: "C04.2.3", label: "Circuito de Excelencia HDV", badgeColor: "bg-[#FF0096] text-white" },
];

export const RATINGS_CATEGORIES_DOCUMENT77 = [
  { id: "C05.1.1", label: "Inolvidable", minScore: 9.0 },
  { id: "C05.1.2", label: "Excelente elección", minScore: 8.0 },
  { id: "C05.1.3", label: "Muy acogedor", minScore: 7.0 },
  { id: "C05.1.4", label: "Sencillo y funcional", minScore: 6.0 },
];

export const MASTER_AMENITIES: AmenityItem[] = [
  // ==========================================
  // C01. INFRAESTRUCTURA Y EQUIPAMIENTO FÍSICO
  // ==========================================
  // C01.1. Equipamiento de la Unidad Privada
  // Descanso y Confort
  { key: "ropa_cama", code: "C01.1.1.1", label: "Ropa de cama premium", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Bed" },
  { key: "almohadas_a_la_carta", code: "C01.1.1.2", label: "Almohadas a la carta", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Bed" },
  { key: "armario", code: "C01.1.1.3", label: "Armario / Vestidor", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Archive" },
  { key: "perchero", code: "C01.1.1.4", label: "Perchero", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Shirt" },
  { key: "mosquitera", code: "C01.1.1.5", label: "Mosquitera", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "ShieldCheck" },
  { key: "insonorizacion", code: "C01.1.1.6", label: "Insonorización", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "VolumeX" },
  { key: "cortinas_blackout", code: "C01.1.1.7", label: "Cortinas opacas / persianas (Blackout)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "EyeOff" },
  { key: "plancha", code: "C01.1.1.8", label: "Plancha / Utensilios de planchado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Shirt" },
  { key: "tendedero", code: "C01.1.1.11", label: "Tendedero de ropa", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Shirt" },

  // Baño Privado
  { key: "papel_higienico", code: "C01.1.3.1", label: "Papel higiénico", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado", scope: "privado", iconName: "FileText" },
  { key: "toallas", code: "C01.1.3.2", label: "Toallas", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado", scope: "privado", iconName: "Droplets" },
  { key: "ducha_ras_suelo", code: "C01.1.3.3", label: "Ducha a ras de suelo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado", scope: "privado", iconName: "Droplets" },
  { key: "banera", code: "C01.1.3.4", label: "Bañera", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado", scope: "privado", iconName: "Bath" },
  { key: "secador_pelo", code: "C01.1.3.5", label: "Secador de pelo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado", scope: "privado", iconName: "Wind" },
  { key: "jacuzzi_privado", code: "C01.1.3.6", label: "Jacuzzi / hidromasaje privado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado", scope: "privado", iconName: "Bath" },
  { key: "albornoz", code: "C01.1.3.7", label: "Albornoz de baño", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado", scope: "privado", iconName: "Shirt" },
  { key: "zapatillas", code: "C01.1.3.8", label: "Zapatillas de baño", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado", scope: "privado", iconName: "Footprints" },
  { key: "articulos_aseo", code: "C01.1.3.9", label: "Artículos de aseo gratuitos (Amenities)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado", scope: "privado", iconName: "Sparkles" },
  { key: "bidet", code: "C01.1.3.10", label: "Bidet", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado", scope: "privado", iconName: "Droplets" },
  { key: "ducha_higienica", code: "C01.1.3.11", label: "Ducha higiénica", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado", scope: "privado", iconName: "Droplets" },

  // Baño Privado Adaptado (Accesibilidad Privada)
  { key: "lavamanos_bajo", code: "C01.1.4.1", label: "Lavamanos más bajo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado Adaptado", scope: "privado", iconName: "Accessibility" },
  { key: "wc_elevado", code: "C01.1.4.2", label: "WC elevado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado Adaptado", scope: "privado", iconName: "Accessibility" },
  { key: "wc_barras_apoyo", code: "C01.1.4.3", label: "WC con barras de apoyo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado Adaptado", scope: "privado", iconName: "Accessibility" },
  { key: "ducha_adaptada_silla", code: "C01.1.4.4", label: "Ducha adaptada para silla de ruedas", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado Adaptado", scope: "privado", iconName: "Accessibility" },
  { key: "cuerda_emergencia_bano", code: "C01.1.4.6", label: "Cuerda de emergencia en el baño", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado Adaptado", scope: "privado", iconName: "AlertTriangle" },

  // Cocina y Menaje Privado
  { key: "mesa_comedor", code: "C01.1.5.1", label: "Mesa de comedor privada", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "Utensils" },
  { key: "cafetera", code: "C01.1.5.2", label: "Cafetera en la unidad", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "Coffee" },
  { key: "tostadora", code: "C01.1.5.3", label: "Tostadora", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "Coffee" },
  { key: "hervidor_electrico", code: "C01.1.5.4", label: "Hervidor eléctrico", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "Coffee" },
  { key: "placa_vitro", code: "C01.1.5.5", label: "Placa vitrocerámica / fogones", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "ChefHat" },
  { key: "microondas", code: "C01.1.5.6", label: "Microondas", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "ChefHat" },
  { key: "horno", code: "C01.1.5.7", label: "Horno", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "ChefHat" },
  { key: "nevera_completa", code: "C01.1.5.8", label: "Nevera completa", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "IceCream" },
  { key: "nevera", code: "C01.1.5.9", label: "Nevera / Minibar", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "IceCream" },
  { key: "lavavajillas", code: "C01.1.5.10", label: "Lavavajillas privado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "Droplets" },
  { key: "lavadora_privada", code: "C01.1.5.11", label: "Lavadora privada", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "Shirt" },
  { key: "utensilios_cocina", code: "C01.1.5.12", label: "Utensilios de cocina completos", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "ChefHat" },
  { key: "vajilla", code: "C01.1.5.13", label: "Vajilla completa", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "Utensils" },
  { key: "productos_limpieza", code: "C01.1.5.14", label: "Productos de limpieza", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "Sparkles" },

  // Climatización y Suministros (Privado)
  { key: "aire_acondicionado", code: "C01.1.6.1", label: "Aire acondicionado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros", scope: "privado", iconName: "Wind" },
  { key: "calefaccion", code: "C01.1.6.2", label: "Calefacción", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros", scope: "privado", iconName: "Flame" },
  { key: "chimenea", code: "C01.1.6.3", label: "Chimenea privada", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros", scope: "privado", iconName: "Flame" },
  { key: "ventilador_techo", code: "C01.1.6.4", label: "Ventiladores de techo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros", scope: "privado", iconName: "Wind" },
  { key: "enchufe_cerca", code: "C01.1.6.5", label: "Enchufe cerca de la cama", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros", scope: "privado", iconName: "Zap" },
  { key: "cargadores_usb", code: "C01.1.6.6", label: "Cargadores USB integrados", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros", scope: "privado", iconName: "Zap" },

  // Tecnología y Entretenimiento (Privado)
  { key: "tv_cable", code: "C01.1.7.1", label: "TV pantalla plana / Smart TV", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento", scope: "privado", iconName: "Tv" },
  { key: "servicios_streaming", code: "C01.1.7.2", label: "Servicios de streaming (Netflix, HBO, Disney+)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento", scope: "privado", iconName: "Tv" },
  { key: "altavoces_bluetooth", code: "C01.1.7.3", label: "Altavoces Bluetooth", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento", scope: "privado", iconName: "Music" },
  { key: "consola_juegos", code: "C01.1.7.4", label: "Consola de videojuegos", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento", scope: "privado", iconName: "Trophy" },

  // Zona de Trabajo y Estar (Privado)
  { key: "escritorio", code: "C01.1.8.1", label: "Escritorio / Mesa de trabajo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Zona de Trabajo y Estar", scope: "privado", iconName: "Briefcase" },
  { key: "silla_ergonomica", code: "C01.1.8.2", label: "Silla ergonómica", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Zona de Trabajo y Estar", scope: "privado", iconName: "Briefcase" },
  { key: "sofa", code: "C01.1.8.3", label: "Sofá", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Zona de Trabajo y Estar", scope: "privado", iconName: "Smile" },
  { key: "zona_estar", code: "C01.1.8.4", label: "Zona de estar privada", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Zona de Trabajo y Estar", scope: "privado", iconName: "Smile" },
  { key: "caja_fuerte", code: "C01.1.8.5", label: "Caja fuerte portátil", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Zona de Trabajo y Estar", scope: "privado", iconName: "Lock" },

  // C01.2. Exteriores Privados (Integrados en la unidad)
  { key: "balcon", code: "C01.2.1.1", label: "Balcón privado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Sun" },
  { key: "terraza_privada", code: "C01.2.1.2", label: "Terraza privada", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Sun" },
  { key: "patio_privado", code: "C01.2.1.3", label: "Patio interior privado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "TreePine" },
  { key: "jardin_privado", code: "C01.2.1.4", label: "Jardín privado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "TreePine" },
  { key: "barbacoa_privada", code: "C01.2.1.5", label: "Barbacoa privada", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Flame" },
  { key: "mobiliario_exterior_privado", code: "C01.2.1.6", label: "Mobiliario exterior privado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Sun" },

  // C01.3. Zonas Comunes e Instalaciones del Establecimiento
  // Bienestar, Salud y Relax (Compartido)
  { key: "piscina", code: "C01.3.1.1", label: "Piscina exterior compartida", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Waves" },
  { key: "piscina_interior", code: "C01.3.1.2", label: "Piscina interior (climatizada)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Waves" },
  { key: "spa", code: "C01.3.1.3", label: "Spa & Wellness", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Sparkles" },
  { key: "sauna", code: "C01.3.1.4", label: "Sauna", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Flame" },
  { key: "bano_turco", code: "C01.3.1.5", label: "Baño turco / Hammam", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Flame" },
  { key: "gimnasio", code: "C01.3.1.6", label: "Gimnasio / Centro de fitness", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Dumbbell" },
  { key: "zona_yoga", code: "C01.3.1.7", label: "Zona de Yoga", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Smile" },
  { key: "solarium", code: "C01.3.1.8", label: "Solárium", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Sun" },

  // Ocio y Espacios Sociales (Compartido)
  { key: "salon_tv_comun", code: "C01.3.2.1", label: "Salón de uso común con TV", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Tv" },
  { key: "sala_juegos", code: "C01.3.2.2", label: "Sala de juegos (Billar, Dardos, Futbolín)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Trophy" },
  { key: "biblioteca", code: "C01.3.2.3", label: "Biblioteca", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Archive" },
  { key: "cocina_compartida", code: "C01.3.2.4", label: "Cocina compartida equipada", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "ChefHat" },
  { key: "barbacoa_compartida", code: "C01.3.2.5", label: "Zona de barbacoa compartida", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Flame" },
  { key: "parque_infantil", code: "C01.3.2.6", label: "Parque infantil", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Smile" },
  { key: "jardin", code: "C01.3.2.7", label: "Jardín compartido", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "TreePine" },

  // Negocios y Eventos
  { key: "salas_reuniones", code: "C01.3.3.1", label: "Salas de reuniones", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "servicios", subCategory: "Infraestructuras de Negocios", scope: "comun", iconName: "Briefcase" },
  { key: "impresora_centro_negocios", code: "C01.3.3.2", label: "Centro de negocios / Impresora", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "servicios", subCategory: "Infraestructuras de Negocios", scope: "comun", iconName: "Briefcase" },
  { key: "salon_actos", code: "C01.3.3.3", label: "Salón de actos / eventos", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "servicios", subCategory: "Infraestructuras de Negocios", scope: "comun", iconName: "Briefcase" },
  { key: "zonas_coworking", code: "C01.3.3.4", label: "Zonas de coworking", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "servicios", subCategory: "Infraestructuras de Negocios", scope: "comun", iconName: "Briefcase" },

  // Instalaciones Singulares (Por tipología)
  { key: "zona_acampada_camping", code: "C01.3.4.1", label: "Zona de acampada (Campings)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "general", subCategory: "Instalaciones Singulares", scope: "comun", iconName: "Tent" },
  { key: "amarre_barco", code: "C01.3.4.2", label: "Amarre / Solárium de proa (Barcos)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "general", subCategory: "Instalaciones Singulares", scope: "comun", iconName: "Ship" },
  { key: "espejos_techo_tantra", code: "C01.3.4.3", label: "Espejos en techo / Sillón tantra (Love Hotels)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "general", subCategory: "Instalaciones Singulares", scope: "privado", iconName: "Heart" },
  { key: "guardaesquis_secador_botas", code: "C01.3.4.4", label: "Guardaesquís / Secador de botas (Chalets/Esquí)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "general", subCategory: "Instalaciones Singulares", scope: "comun", iconName: "Mountain" },

  // ==========================================
  // C02. SERVICIOS Y EXPERIENCIAS (Intangibles)
  // ==========================================
  // Atención y Recepción
  { key: "recepcion_24h", code: "C02.1.1.1", label: "Recepción 24 horas", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención al Cliente", scope: "servicio", iconName: "Clock" },
  { key: "servicio_conserjeria", code: "C02.1.1.2", label: "Servicio de conserjería", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención al Cliente", scope: "servicio", iconName: "ConciergeBell" },
  { key: "consigna_equipaje", code: "C02.1.1.3", label: "Guarda-equipaje / Maletero", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención al Cliente", scope: "servicio", iconName: "Briefcase" },
  { key: "registro_expres", code: "C02.1.1.4", label: "Registro de entrada/salida exprés", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención al Cliente", scope: "servicio", iconName: "Clock" },
  { key: "informacion_turistica", code: "C02.1.1.5", label: "Mostrador de información turística", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención al Cliente", scope: "servicio", iconName: "Compass" },

  // Atención Multilingüe
  { key: "personal_multilingue", code: "C02.1.2.0", label: "Personal Multilingüe", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención Multilingüe", scope: "servicio", iconName: "Globe" },

  // Gastronomía y Alimentos
  { key: "restaurante", code: "C02.2.1.1", label: "Restaurante en el hotel", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Gastronomía", scope: "comun", iconName: "Utensils" },
  { key: "cafeteria", code: "C02.2.1.2", label: "Bar / Cafetería", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Gastronomía", scope: "comun", iconName: "Coffee" },
  { key: "bar_piscina", code: "C02.2.1.3", label: "Bar en la piscina", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Gastronomía", scope: "comun", iconName: "Wine" },
  { key: "room_service", code: "C02.2.1.4", label: "Servicio de habitaciones (Room Service)", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Gastronomía", scope: "servicio", iconName: "ConciergeBell" },
  { key: "menus_dietas_especiales", code: "C02.2.1.5", label: "Menús para dietas especiales", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Gastronomía", scope: "servicio", iconName: "Utensils" },
  { key: "desayuno_habitacion", code: "C02.2.1.6", label: "Desayuno en la habitación", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Gastronomía", scope: "servicio", iconName: "Coffee" },

  // Limpieza y Mantenimiento
  { key: "servicio_limpieza", code: "C02.3.1.1", label: "Servicio de limpieza diaria", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Limpieza y Mantenimiento", scope: "servicio", iconName: "Sparkles" },
  { key: "lavanderia", code: "C02.3.1.2", label: "Servicio de lavandería", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Limpieza y Mantenimiento", scope: "servicio", iconName: "Shirt" },
  { key: "limpieza_en_seco", code: "C02.3.1.3", label: "Limpieza en seco", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Limpieza y Mantenimiento", scope: "servicio", iconName: "Shirt" },
  { key: "servicio_planchado", code: "C02.3.1.4", label: "Servicio de planchado", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Limpieza y Mantenimiento", scope: "servicio", iconName: "Shirt" },

  // Conectividad y Movilidad
  { key: "wifi", code: "C02.4.1.1", label: "Wi-Fi gratis (Alta velocidad)", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Conectividad y Movilidad", scope: "servicio", iconName: "Wifi" },
  { key: "aparcamiento", code: "C02.4.2.1", label: "Parking privado cubierto / descubierto", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Conectividad y Movilidad", scope: "comun", iconName: "Car" },
  { key: "estacion_carga_ev", code: "C02.4.2.8", label: "Estación de carga para vehículos eléctricos", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Conectividad y Movilidad", scope: "comun", iconName: "Zap" },
  { key: "traslado_aeropuerto", code: "C02.4.2.9", label: "Servicio de traslado al aeropuerto", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Conectividad y Movilidad", scope: "servicio", iconName: "Plane" },
  { key: "alquiler_bicicletas", code: "C02.4.2.10", label: "Alquiler de bicicletas", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Conectividad y Movilidad", scope: "servicio", iconName: "Compass" },

  // Actividades y Entretenimiento
  { key: "rutas_senderismo", code: "C02.5.1.1", label: "Rutas de senderismo / Excursiones", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Actividades Organizadas", scope: "servicio", iconName: "TreePine" },
  { key: "visitas_guiadas", code: "C02.5.1.3", label: "Visitas guiadas", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Actividades Organizadas", scope: "servicio", iconName: "Compass" },
  { key: "deportes_acuaticos", code: "C02.5.1.4", label: "Deportes acuáticos", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Actividades Organizadas", scope: "servicio", iconName: "Waves" },
  { key: "musica_en_directo", code: "C02.5.1.8", label: "Música / espectáculos en directo", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Actividades Organizadas", scope: "servicio", iconName: "Music" },
  { key: "club_infantil", code: "C02.5.1.9", label: "Club infantil", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Actividades Organizadas", scope: "servicio", iconName: "Smile" },

  // ==========================================
  // C03. GESTIÓN, POLÍTICAS Y LOGÍSTICA
  // ==========================================
  // Accesibilidad e Inclusión
  { key: "adaptado_personas_movilidad_reducida", code: "C03.1.1.1", label: "Alojamiento 100% accesible en silla de ruedas", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "servicio", iconName: "Accessibility" },
  { key: "ascensor", code: "C03.1.1.2", label: "Acceso a pisos superiores en ascensor", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "comun", iconName: "ArrowUpSquare" },

  // Seguridad y Protección
  { key: "camaras_seguridad", code: "C03.2.1.1", label: "Cámaras de seguridad CCTV en zonas comunes", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Seguridad y Protección", scope: "comun", iconName: "Eye" },
  { key: "detectores_humo", code: "C03.2.1.2", label: "Detectores de humo", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Seguridad y Protección", scope: "comun", iconName: "AlertTriangle" },
  { key: "extintores", code: "C03.2.1.3", label: "Extintores de incendios", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Seguridad y Protección", scope: "comun", iconName: "Flame" },
  { key: "personal_seguridad_24h", code: "C03.2.1.4", label: "Personal de Seguridad 24 horas", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Seguridad y Protección", scope: "servicio", iconName: "ShieldCheck" },
  { key: "tarjetas_acceso", code: "C03.2.1.5", label: "Tarjetas de acceso electrónicas", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Seguridad y Protección", scope: "servicio", iconName: "Lock" },

  // Políticas y Normas
  { key: "admision_mascotas_gratis", code: "C03.3.2.1", label: "Admisión de mascotas gratis (Pet Friendly)", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas y Normas", scope: "servicio", iconName: "Dog" },
  { key: "apto_familias", code: "C03.3.3.1", label: "Apto para familias con niños", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Perfil de Huésped", scope: "servicio", iconName: "Users" },
  { key: "solo_adultos", code: "C03.3.3.2", label: "Solo para adultos (Adults Only)", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Perfil de Huésped", scope: "servicio", iconName: "UserCheck" },
  { key: "prohibido_fumar", code: "C03.3.4.1", label: "Prohibido fumar en todo el alojamiento", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Normas de la Propiedad", scope: "servicio", iconName: "Ban" },
  { key: "entrada_salida_discreta", code: "C03.3.5.1.1", label: "Entrada/Salida discreta o automatizada (Love Hotels)", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas Especiales", scope: "servicio", iconName: "Key" },
  { key: "alquiler_por_horas", code: "C03.3.5.1.2", label: "Alquiler por horas disponible", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas Especiales", scope: "servicio", iconName: "Clock" },
  { key: "pago_tarjeta", code: "C03.3.6.1", label: "Acepta Pago Online con Tarjeta", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Métodos de Pago", scope: "servicio", iconName: "Zap" },
  { key: "pago_crypto", code: "C03.3.6.3", label: "Acepta Pago con Criptomonedas", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Métodos de Pago", scope: "servicio", iconName: "Zap" },
  { key: "cancelacion_gratis", code: "C03.3.8.1", label: "Cancelación gratuita disponible", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Condiciones de Reserva", scope: "servicio", iconName: "Check" },
];

/**
 * Normalizes any services representation into a string array.
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
        // Fallback to comma split if JSON parse fails
      }
    }
    return trimmed.split(",").map(s => s.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Gets human readable label for an amenity key or custom string
 */
export function getAmenityLabel(key: string): string {
  const normalized = key.toLowerCase().trim();
  const found = MASTER_AMENITIES.find(a => a.key.toLowerCase() === normalized || a.label.toLowerCase() === normalized || a.code.toLowerCase() === normalized);
  if (found) return found.label;
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
}

/**
 * Gets full amenity item info
 */
export function getAmenityInfo(key: string): AmenityItem | undefined {
  const normalized = key.toLowerCase().trim();
  return MASTER_AMENITIES.find(a => a.key.toLowerCase() === normalized || a.label.toLowerCase() === normalized || a.code.toLowerCase() === normalized);
}
