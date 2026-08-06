export type AmenityPillar = "C01" | "C02" | "C03" | "C04";
export type AmenityScope = "privado" | "comun" | "servicio";

export interface AmenityItem {
  key: string;
  code: string;
  label: string;
  pillar: AmenityPillar;
  pillarLabel: string;
  category: "general" | "recreacion" | "gastronomia" | "servicios" | "habitacion" | "especificos";
  subCategory: string;
  scope: AmenityScope;
  iconName: string;
}

export const PILLARS_DOCUMENT77 = [
  { id: "all", label: "Todos los Pilares" },
  { id: "C01", label: "C01. Infraestructura Físicas (Tangible)", color: "#00C8D4" },
  { id: "C02", label: "C02. Servicios y Experiencias (Intangibles)", color: "#FF0096" },
  { id: "C03", label: "C03. Gestión, Políticas y Logística (Normas)", color: "#9B00CC" },
  { id: "C04", label: "C04. Instalaciones y Servicios Específicos por Tipología", color: "#10B981" },
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
  { id: "especificos", label: "🏕️ Específicos por Tipología (Campings, Barcos, Love Hotels, Esquí)" },
];

export const PROPERTY_TYPES_DOCUMENT77 = [
  { id: "apartamentos", label: "Apartamentos", icon: "Building", code: "C04-1.1" },
  { id: "casas_apartamentos_enteros", label: "Casas y apartamentos enteros", icon: "Home", code: "C04-1.2" },
  { id: "hoteles", label: "Hoteles", icon: "Hotel", code: "C04-1.3" },
  { id: "hostales_pensiones", label: "Hostales y pensiones", icon: "Bed", code: "C04-1.4" },
  { id: "posadas", label: "Posadas", icon: "TreePine", code: "C04-1.5" },
  { id: "habitaciones_casas_particulares", label: "Habitaciones en casas particulares", icon: "UserCheck", code: "C04-1.6" },
  { id: "apartahoteles", label: "Apartahoteles", icon: "Building2", code: "C04-1.7" },
  { id: "albergues_turisticos", label: "Albergues turísticos", icon: "Users", code: "C04-1.8" },
  { id: "bed_and_breakfasts", label: "Bed and breakfasts", icon: "Coffee", code: "C04-1.9" },
  { id: "casas_chalets_rurales", label: "Casas y chalets rurales", icon: "Home", code: "C04-1.10" },
  { id: "residencias_estudiantes", label: "Residencias de estudiantes", icon: "GraduationCap", code: "C04-1.11" },
  { id: "hoteles_capsula", label: "Hoteles cápsula", icon: "Box", code: "C04-1.12" },
  { id: "campings", label: "Campings", icon: "Tent", code: "C04-1.13" },
  { id: "villas", label: "Villas", icon: "Palmtree", code: "C04-1.14" },
  { id: "barcos", label: "Barcos (veleros, yates, catamaranes o houseboats)", icon: "Ship", code: "C04-1.15" },
  { id: "love_hotels", label: "Love hotels", icon: "Heart", code: "C04-1.16" },
  { id: "chalets_montana", label: "Chalets de montaña", icon: "Mountain", code: "C04-1.17" },
];

export const CERTIFICATIONS_DOCUMENT77 = [
  { id: "sostenibilidad", code: "C04.2.1", label: "Certificación de Sostenibilidad", badgeColor: "bg-emerald-500 text-white" },
  { id: "sello_legal_hdv", code: "C04.2.2", label: "Sello de Garantía Legal HDV", badgeColor: "bg-[#00C8D4] text-white" },
  { id: "circuito_excelencia", code: "C04.2.3", label: "Circuito de Excelencia HDV", badgeColor: "bg-[#FF0096] text-white" },
];

export const RATINGS_CATEGORIES_DOCUMENT77 = [
  { id: "C05-1", label: "Inolvidable: 9 o más", minScore: 9.0 },
  { id: "C05-2", label: "Excelente elección: 8 o más", minScore: 8.0 },
  { id: "C05-3", label: "Muy acogedor: 7 o más", minScore: 7.0 },
  { id: "C05-4", label: "Sencillo y funcional: 6 o más", minScore: 6.0 },
];

export const MASTER_AMENITIES: AmenityItem[] = [
  // ==========================================
  // C01. INFRAESTRUCTURA Y EQUIPAMIENTO FÍSICO
  // ==========================================
  // C01.1. Equipamiento de la Unidad Privada - Descanso y Confort
  { key: "ropa_cama", code: "C01.1.1.1", label: "Ropa de cama", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Bed" },
  { key: "almohadas_a_la_carta", code: "C01.1.1.2", label: "Almohadas a la carta", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Bed" },
  { key: "armario", code: "C01.1.1.3", label: "Armario", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Archive" },
  { key: "perchero", code: "C01.1.1.4", label: "Perchero", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Shirt" },
  { key: "mosquitera", code: "C01.1.1.5", label: "Mosquitera", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "ShieldCheck" },
  { key: "insonorizacion", code: "C01.1.1.6", label: "Insonorización", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "VolumeX" },
  { key: "cortinas_blackout", code: "C01.1.1.7", label: "Cortinas opacas / persianas", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "EyeOff" },
  { key: "plancha", code: "C01.1.1.8", label: "Plancha / Utensilios de planchado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Shirt" },
  { key: "suelo_ceramica", code: "C01.1.1.9a", label: "Suelo de cerámica", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Home" },
  { key: "suelo_madera", code: "C01.1.1.9b", label: "Suelo de madera / parquet", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Home" },
  { key: "suelo_moqueta", code: "C01.1.1.10", label: "Suelo de moqueta hipoalergénica", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Home" },
  { key: "tendedero", code: "C01.1.1.11", label: "Tendedero de ropa", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Descanso y Confort", scope: "privado", iconName: "Shirt" },

  // C01.1.2. Distribución de las camas
  { key: "dos_camas_individuales", code: "C01.1.2.1", label: "2 Camas individuales", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Distribución de Camas", scope: "privado", iconName: "Bed" },
  { key: "una_cama_doble", code: "C01.1.2.2", label: "1 Cama doble", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Distribución de Camas", scope: "privado", iconName: "Bed" },
  { key: "dos_camas_dobles", code: "C01.1.2.3", label: "2 Camas dobles", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Distribución de Camas", scope: "privado", iconName: "Bed" },
  { key: "cuna_adicional", code: "C01.1.2.4", label: "Cuna adicional", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Distribución de Camas", scope: "privado", iconName: "Smile" },

  // C01.1.3. Baño Privado
  { key: "papel_higienico", code: "C01.1.3.1", label: "Papel higiénico", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado", scope: "privado", iconName: "FileText" },
  { key: "toallas", code: "C01.1.3.2", label: "Toallas", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado", scope: "privado", iconName: "Droplets" },
  { key: "ducha_ras_suelo", code: "C01.1.3.3", label: "Ducha a ras de suelo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado", scope: "privado", iconName: "Droplets" },
  { key: "banera", code: "C01.1.3.4", label: "Bañera", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado", scope: "privado", iconName: "Bath" },
  { key: "secador_pelo", code: "C01.1.3.5", label: "Secador de pelo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado", scope: "privado", iconName: "Wind" },
  { key: "jacuzzi_privado", code: "C01.1.3.6", label: "Jacuzzis/hidromasaje privado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado", scope: "privado", iconName: "Bath" },
  { key: "albornoz", code: "C01.1.3.7", label: "Albornoz", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado", scope: "privado", iconName: "Shirt" },
  { key: "zapatillas", code: "C01.1.3.8", label: "Zapatillas", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado", scope: "privado", iconName: "Footprints" },
  { key: "articulos_aseo", code: "C01.1.3.9", label: "Artículos de aseo gratuitos", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado", scope: "privado", iconName: "Sparkles" },
  { key: "bidet", code: "C01.1.3.10", label: "Bidet", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado", scope: "privado", iconName: "Droplets" },
  { key: "ducha_higienica", code: "C01.1.3.11", label: "Ducha higiénica", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Privado", scope: "privado", iconName: "Droplets" },

  // C01.1.4. Baño Privado Adaptado a personas de movilidad reducida (PMR)
  { key: "lavamanos_bajo", code: "C01.1.4.1", label: "Lavamanos más bajo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "Accessibility" },
  { key: "wc_elevado", code: "C01.1.4.2", label: "WC elevado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "Accessibility" },
  { key: "wc_barras_apoyo", code: "C01.1.4.3", label: "WC con barras de apoyo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "Accessibility" },
  { key: "ducha_adaptada_silla", code: "C01.1.4.4", label: "Ducha adaptada para sillas de ruedas", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "Accessibility" },
  { key: "banera_adaptada_silla", code: "C01.1.4.5", label: "Bañera a ras de suelo adaptada con silla", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "Accessibility" },
  { key: "cuerda_emergencia_bano", code: "C01.1.4.6", label: "Cuerda de emergencia en el baño", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "AlertTriangle" },
  { key: "senalizacion_braille", code: "C01.1.4.7", label: "Señalización en braille", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "Accessibility" },
  { key: "guiado_auditivo", code: "C01.1.4.8", label: "Guiado auditivo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Baño Adaptado PMR", scope: "privado", iconName: "Accessibility" },

  // C01.1.5. Cocina y Menaje (Privado)
  { key: "mesa_comedor", code: "C01.1.5.1", label: "Mesa de comedor", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "Utensils" },
  { key: "cafetera", code: "C01.1.5.2", label: "Cafetera", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "Coffee" },
  { key: "tostadora", code: "C01.1.5.3", label: "Tostadora", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "Coffee" },
  { key: "hervidor_electrico", code: "C01.1.5.4", label: "Hervidor eléctrico", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "Coffee" },
  { key: "placa_vitro", code: "C01.1.5.5", label: "Placa vitro de cocina", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "ChefHat" },
  { key: "microondas", code: "C01.1.5.6", label: "Microondas", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "ChefHat" },
  { key: "horno", code: "C01.1.5.7", label: "Horno", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "ChefHat" },
  { key: "nevera_completa", code: "C01.1.5.8", label: "Nevera completa", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "IceCream" },
  { key: "nevera", code: "C01.1.5.9", label: "Nevera/minibar", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "IceCream" },
  { key: "lavavajillas", code: "C01.1.5.10", label: "Lavavajillas", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "Droplets" },
  { key: "lavadora_privada", code: "C01.1.5.11", label: "Lavadora", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "Shirt" },
  { key: "utensilios_cocina", code: "C01.1.5.12", label: "Utensilios de cocina", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "ChefHat" },
  { key: "vajilla", code: "C01.1.5.13", label: "Vajilla", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "Utensils" },
  { key: "productos_limpieza", code: "C01.1.5.14", label: "Productos de limpieza", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Cocina y Menaje", scope: "privado", iconName: "Sparkles" },

  // C01.1.6. Climatización y Suministros (Privado)
  { key: "aire_acondicionado", code: "C01.1.6.1", label: "Aire Acondicionado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros", scope: "privado", iconName: "Wind" },
  { key: "calefaccion", code: "C01.1.6.2", label: "Calefacción", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros", scope: "privado", iconName: "Flame" },
  { key: "chimenea", code: "C01.1.6.3", label: "Chimenea", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros", scope: "privado", iconName: "Flame" },
  { key: "ventilador_techo", code: "C01.1.6.4", label: "Ventiladores de techo", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros", scope: "privado", iconName: "Wind" },
  { key: "enchufe_cerca", code: "C01.1.6.5", label: "Enchufe cerca de la cama", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros", scope: "privado", iconName: "Zap" },
  { key: "cargadores_usb", code: "C01.1.6.6", label: "Cargadores USB integrados", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Climatización y Suministros", scope: "privado", iconName: "Zap" },

  // C01.1.7. Tecnología y Entretenimiento (Privado)
  { key: "tv_cable", code: "C01.1.7.1", label: "TV pantalla plana", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento", scope: "privado", iconName: "Tv" },
  { key: "servicios_streaming", code: "C01.1.7.2", label: "Servicios de streaming (Netflix, HBO, etc.)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento", scope: "privado", iconName: "Tv" },
  { key: "altavoces_bluetooth", code: "C01.1.7.3", label: "Altavoces Bluetooth", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento", scope: "privado", iconName: "Music" },
  { key: "consola_juegos", code: "C01.1.7.4", label: "Consola de videojuegos", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento", scope: "privado", iconName: "Trophy" },
  { key: "canales_cable", code: "C01.1.7.6", label: "Canales por cable", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento", scope: "privado", iconName: "Tv" },
  { key: "canales_satelite", code: "C01.1.7.7", label: "Canales vía satélite", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento", scope: "privado", iconName: "Tv" },
  { key: "canales_pago", code: "C01.1.7.8", label: "Canales de pago", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Tecnología y Entretenimiento", scope: "privado", iconName: "Tv" },

  // C01.1.8. Zona de Trabajo y Estar (Privado)
  { key: "escritorio", code: "C01.1.8.1", label: "Escritorio", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Zona de Trabajo y Estar", scope: "privado", iconName: "Briefcase" },
  { key: "silla_ergonomica", code: "C01.1.8.2", label: "Silla ergonómica", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Zona de Trabajo y Estar", scope: "privado", iconName: "Briefcase" },
  { key: "sofa", code: "C01.1.8.3", label: "Sofá", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Zona de Trabajo y Estar", scope: "privado", iconName: "Smile" },
  { key: "zona_estar", code: "C01.1.8.4", label: "Zona de estar", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Zona de Trabajo y Estar", scope: "privado", iconName: "Smile" },
  { key: "caja_fuerte", code: "C01.1.8.5", label: "Caja fuerte (tamaño portátil)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Zona de Trabajo y Estar", scope: "privado", iconName: "Lock" },

  // C01.2. Exteriores Privados (Integrados en la unidad)
  { key: "balcon", code: "C01.2.1.1", label: "Balcón", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Sun" },
  { key: "terraza_privada", code: "C01.2.1.2", label: "Terraza privada", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Sun" },
  { key: "patio_privado", code: "C01.2.1.3", label: "Patio interior privado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "TreePine" },
  { key: "jardin_privado", code: "C01.2.1.4", label: "Jardín privado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "TreePine" },
  { key: "barbacoa_privada", code: "C01.2.1.5", label: "Barbacoa privada", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Flame" },
  { key: "mobiliario_exterior_privado", code: "C01.2.1.6", label: "Mobiliario exterior privado", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "habitacion", subCategory: "Exteriores Privados", scope: "privado", iconName: "Sun" },

  // C01.3. Zonas Comunes e Instalaciones del Establecimiento - Bienestar, Salud y Relax (Compartido)
  { key: "piscina", code: "C01.3.1.1", label: "Piscina exterior", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Waves" },
  { key: "piscina_interior", code: "C01.3.1.2", label: "Piscina interior (climatizada)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Waves" },
  { key: "spa", code: "C01.3.1.3", label: "Spa", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Sparkles" },
  { key: "sauna", code: "C01.3.1.4", label: "Sauna", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Flame" },
  { key: "bano_turco", code: "C01.3.1.5", label: "Baño turco / hammam", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Flame" },
  { key: "gimnasio", code: "C01.3.1.6", label: "Gimnasio", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Dumbbell" },
  { key: "zona_yoga", code: "C01.3.1.7", label: "Zona de Yoga", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Smile" },
  { key: "solarium", code: "C01.3.1.8", label: "Solárium", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Bienestar, Salud y Relax", scope: "comun", iconName: "Sun" },

  // C01.3.2. Ocio y Espacios Sociales (Compartido)
  { key: "salon_tv_comun", code: "C01.3.2.1", label: "Salón de uso común con TV", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Tv" },
  { key: "sala_juegos", code: "C01.3.2.2", label: "Sala de juegos (Billar, Dardos, Futbolín)", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Trophy" },
  { key: "biblioteca", code: "C01.3.2.3", label: "Biblioteca", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Archive" },
  { key: "cocina_compartida", code: "C01.3.2.4", label: "Cocina compartida equipada", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "ChefHat" },
  { key: "barbacoa_compartida", code: "C01.3.2.5", label: "Zona de barbacoa compartida", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Flame" },
  { key: "parque_infantil", code: "C01.3.2.6", label: "Parque infantil", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Smile" },
  { key: "jardin", code: "C01.3.2.7", label: "Jardín compartido", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "TreePine" },
  { key: "parque_acuatico", code: "C01.3.2.8", label: "Parque acuático", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Waves" },
  { key: "toboganes_agua", code: "C01.3.2.9", label: "Toboganes de agua", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Waves" },
  { key: "campos_polideportivos", code: "C01.3.2.10", label: "Campos de fútbol, polideportivos", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Trophy" },
  { key: "pistas_tenis", code: "C01.3.2.11", label: "Pistas de tenis", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Trophy" },
  { key: "ping_pong", code: "C01.3.2.12", label: "Ping Pong", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Trophy" },
  { key: "acceso_directo_playa", code: "C01.3.2.13", label: "Acceso directo a la playa", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Sun" },
  { key: "junto_al_mar", code: "C01.3.2.14", label: "Junto al mar", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "recreacion", subCategory: "Ocio y Espacios Sociales", scope: "comun", iconName: "Waves" },

  // C01.3.3. Infraestructuras de Negocios y Eventos
  { key: "salas_reuniones", code: "C01.3.3.1", label: "Salas de reuniones", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "servicios", subCategory: "Negocios y Eventos", scope: "comun", iconName: "Briefcase" },
  { key: "impresora_centro_negocios", code: "C01.3.3.2", label: "Impresora / Centro de negocios", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "servicios", subCategory: "Negocios y Eventos", scope: "comun", iconName: "Briefcase" },
  { key: "salon_actos", code: "C01.3.3.3", label: "Salón de actos/eventos", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "servicios", subCategory: "Negocios y Eventos", scope: "comun", iconName: "Briefcase" },
  { key: "zonas_coworking", code: "C01.3.3.4", label: "Zonas coworking", pillar: "C01", pillarLabel: "C01. Infraestructura Físicas", category: "servicios", subCategory: "Negocios y Eventos", scope: "comun", iconName: "Briefcase" },

  // ==========================================
  // C02. SERVICIOS Y EXPERIENCIAS (Intangibles)
  // ==========================================
  // C02.1. Servicios de Atención y Recepción
  { key: "recepcion_24h", code: "C02.1.1.1", label: "Recepción 24h", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención al Cliente", scope: "servicio", iconName: "Clock" },
  { key: "servicio_conserjeria", code: "C02.1.1.2", label: "Servicio de conserjería", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención al Cliente", scope: "servicio", iconName: "ConciergeBell" },
  { key: "consigna_equipaje", code: "C02.1.1.3", label: "Guarda-equipaje", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención al Cliente", scope: "servicio", iconName: "Briefcase" },
  { key: "registro_expres", code: "C02.1.1.4", label: "Registro de entrada/salida exprés", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención al Cliente", scope: "servicio", iconName: "Clock" },
  { key: "informacion_turistica", code: "C02.1.1.5", label: "Mostrador de información turística", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención al Cliente", scope: "servicio", iconName: "Compass" },

  // C02.1.2. Atención Multilingüe
  { key: "atencion_espanol", code: "C02.1.2.3", label: "Atención en Español", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención Multilingüe", scope: "servicio", iconName: "Globe" },
  { key: "atencion_ingles", code: "C02.1.2.2", label: "Atención en Inglés", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención Multilingüe", scope: "servicio", iconName: "Globe" },
  { key: "atencion_aleman", code: "C02.1.2.1", label: "Atención en Alemán", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención Multilingüe", scope: "servicio", iconName: "Globe" },
  { key: "atencion_frances", code: "C02.1.2.4", label: "Atención en Francés", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención Multilingüe", scope: "servicio", iconName: "Globe" },
  { key: "atencion_portugues", code: "C02.1.2.5", label: "Atención en Portugués", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Atención Multilingüe", scope: "servicio", iconName: "Globe" },

  // C02.2. Gastronomía y Alimentos
  { key: "restaurante", code: "C02.2.1.1", label: "Restaurante", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Gastronomía y Alimentos", scope: "comun", iconName: "Utensils" },
  { key: "cafeteria", code: "C02.2.1.2", label: "Bar/Cafetería", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Gastronomía y Alimentos", scope: "comun", iconName: "Coffee" },
  { key: "bar_piscina", code: "C02.2.1.3", label: "Bar en la piscina", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Gastronomía y Alimentos", scope: "comun", iconName: "Wine" },
  { key: "room_service", code: "C02.2.1.4", label: "Servicio de habitaciones", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Gastronomía y Alimentos", scope: "servicio", iconName: "ConciergeBell" },
  { key: "menus_dietas_especiales", code: "C02.2.1.5", label: "Menús para dietas especiales", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Gastronomía y Alimentos", scope: "servicio", iconName: "Utensils" },
  { key: "desayuno_habitacion", code: "C02.2.1.6", label: "Desayuno en la habitación", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Gastronomía y Alimentos", scope: "servicio", iconName: "Coffee" },
  { key: "maquina_expendedora_aperitivos", code: "C02.2.1.7", label: "Máquina expendedora (aperitivos)", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Gastronomía y Alimentos", scope: "comun", iconName: "Coffee" },
  { key: "maquina_expendedora_bebidas", code: "C02.2.1.8", label: "Máquina expendedora (bebidas)", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "gastronomia", subCategory: "Gastronomía y Alimentos", scope: "comun", iconName: "Wine" },

  // C02.3. Limpieza y Mantenimiento
  { key: "servicio_limpieza", code: "C02.3.1.1", label: "Servicio de limpieza diaria", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Limpieza y Mantenimiento", scope: "servicio", iconName: "Sparkles" },
  { key: "lavanderia", code: "C02.3.1.2", label: "Servicio de lavandería", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Limpieza y Mantenimiento", scope: "servicio", iconName: "Shirt" },
  { key: "limpieza_en_seco", code: "C02.3.1.3", label: "Limpieza en seco", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Limpieza y Mantenimiento", scope: "servicio", iconName: "Shirt" },
  { key: "servicio_planchado", code: "C02.3.1.4", label: "Servicio de planchado", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Limpieza y Mantenimiento", scope: "servicio", iconName: "Shirt" },

  // C02.4. Conectividad y Movilidad
  { key: "wifi", code: "C02.4.1.1a", label: "Wifi gratis", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Conectividad y Movilidad", scope: "servicio", iconName: "Wifi" },
  { key: "wifi_pago", code: "C02.4.1.1b", label: "Wifi de pago", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Conectividad y Movilidad", scope: "servicio", iconName: "Wifi" },
  { key: "parking_cubierto_gratis", code: "C02.4.2.1a", label: "Parking privado cubierto gratis", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Conectividad y Movilidad", scope: "comun", iconName: "Car" },
  { key: "parking_descubierto_gratis", code: "C02.4.2.1b", label: "Parking privado descubierto gratis", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Conectividad y Movilidad", scope: "comun", iconName: "Car" },
  { key: "parking_cubierto_pago", code: "C02.4.2.1c", label: "Parking privado cubierto de pago", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Conectividad y Movilidad", scope: "comun", iconName: "Car" },
  { key: "parking_descubierto_pago", code: "C02.4.2.1d", label: "Parking privado descubierto de pago", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Conectividad y Movilidad", scope: "comun", iconName: "Car" },
  { key: "reserva_parking", code: "C02.4.2.1e", label: "Posibilidad de reservar Parking", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Conectividad y Movilidad", scope: "servicio", iconName: "Car" },
  { key: "parking_publico_cercano", code: "C02.4.2.1f", label: "Parking público cercano", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Conectividad y Movilidad", scope: "comun", iconName: "Car" },
  { key: "parking_adaptado_pmr", code: "C02.4.2.1g", label: "Parking adaptado para personas de movilidad reducida", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Conectividad y Movilidad", scope: "comun", iconName: "Accessibility" },
  { key: "estacion_carga_ev", code: "C02.4.2.1h", label: "Estación de carga de vehículos eléctricos", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Conectividad y Movilidad", scope: "comun", iconName: "Zap" },
  { key: "traslado_aeropuerto", code: "C02.4.2.1i", label: "Servicio de traslado al aeropuerto", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Conectividad y Movilidad", scope: "servicio", iconName: "Plane" },
  { key: "alquiler_bicicletas", code: "C02.4.2.1j", label: "Alquiler de bicicletas", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Conectividad y Movilidad", scope: "servicio", iconName: "Compass" },
  { key: "alquiler_coches", code: "C02.4.2.1k", label: "Alquiler de coches", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "servicios", subCategory: "Conectividad y Movilidad", scope: "servicio", iconName: "Car" },

  // C02.5. Actividades y Entretenimiento Organizado
  { key: "rutas_senderismo", code: "C02.5.1.1", label: "Rutas de senderismo", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Actividades Organizadas", scope: "servicio", iconName: "TreePine" },
  { key: "clases_cocina", code: "C02.5.1.2", label: "Clases de cocina", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Actividades Organizadas", scope: "servicio", iconName: "ChefHat" },
  { key: "visitas_guiadas", code: "C02.5.1.3", label: "Visitas guiadas", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Actividades Organizadas", scope: "servicio", iconName: "Compass" },
  { key: "deportes_acuaticos", code: "C02.5.1.4", label: "Deportes acuáticos", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Actividades Organizadas", scope: "servicio", iconName: "Waves" },
  { key: "tours_a_pie", code: "C02.5.1.5", label: "Tours a pie", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Actividades Organizadas", scope: "servicio", iconName: "Compass" },
  { key: "tours_en_bici", code: "C02.5.1.6", label: "Tours en bici", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Actividades Organizadas", scope: "servicio", iconName: "Compass" },
  { key: "noches_de_cine", code: "C02.5.1.7", label: "Noches de cine", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Actividades Organizadas", scope: "servicio", iconName: "Tv" },
  { key: "musica_en_directo", code: "C02.5.1.8", label: "Música/espectáculos en directo", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Actividades Organizadas", scope: "servicio", iconName: "Music" },
  { key: "club_infantil", code: "C02.5.1.9a", label: "Club infantil", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Actividades Organizadas", scope: "servicio", iconName: "Smile" },
  { key: "club_adolescentes", code: "C02.5.1.9b", label: "Club de adolescentes y actividades", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Actividades Organizadas", scope: "servicio", iconName: "Smile" },
  { key: "equitacion", code: "C02.5.1.9c", label: "Equitación", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Actividades Organizadas", scope: "servicio", iconName: "Trophy" },
  { key: "pesca", code: "C02.5.1.9d", label: "Pesca", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Actividades Organizadas", scope: "servicio", iconName: "Waves" },
  { key: "golf", code: "C02.5.1.9e", label: "Golf", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Actividades Organizadas", scope: "servicio", iconName: "Trophy" },
  { key: "escalada_arboles", code: "C02.5.1.9f", label: "Escalada de árboles", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Actividades Organizadas", scope: "servicio", iconName: "TreePine" },
  { key: "kayak_canoa", code: "C02.5.1.9g", label: "Kayak en Canoa", pillar: "C02", pillarLabel: "C02. Servicios y Experiencias", category: "recreacion", subCategory: "Actividades Organizadas", scope: "servicio", iconName: "Waves" },

  // ==========================================
  // C03. GESTIÓN, POLÍTICAS Y LOGÍSTICA
  // ==========================================
  // C03.1. Accesibilidad e Inclusión
  { key: "accesible_silla_ruedas", code: "C03.1.1.1", label: "Todo el alojamiento accesible en silla de ruedas", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "servicio", iconName: "Accessibility" },
  { key: "ascensor", code: "C03.1.1.2", label: "Acceso a pisos superiores o inferiores en ascensor", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "comun", iconName: "ArrowUpSquare" },
  { key: "todo_planta_baja", code: "C03.1.1.3", label: "Todo en planta baja", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "comun", iconName: "Home" },
  { key: "lavamanos_publico_bajo", code: "C03.1.1.4", label: "Lavamanos público más bajo", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "comun", iconName: "Accessibility" },
  { key: "wc_publico_barras", code: "C03.1.1.5", label: "WC público con barras de apoyo", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "comun", iconName: "Accessibility" },
  { key: "senalizacion_braille_comun", code: "C03.1.1.6", label: "Señalización en braille", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "comun", iconName: "Accessibility" },
  { key: "guiado_auditivo_comun", code: "C03.1.1.7", label: "Guiado auditivo", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Accesibilidad e Inclusión", scope: "comun", iconName: "Accessibility" },

  // C03.2. Seguridad y Protección
  { key: "camaras_seguridad", code: "C03.2.1.1", label: "Cámaras de seguridad en las zonas comunes", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Seguridad y Protección", scope: "comun", iconName: "Eye" },
  { key: "detectores_humo", code: "C03.2.1.2", label: "Detectores de humo", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Seguridad y Protección", scope: "comun", iconName: "AlertTriangle" },
  { key: "extintores", code: "C03.2.1.3", label: "Extintores", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Seguridad y Protección", scope: "comun", iconName: "Flame" },
  { key: "personal_seguridad_24h", code: "C03.2.1.4", label: "Personal de Seguridad 24 horas", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Seguridad y Protección", scope: "servicio", iconName: "ShieldCheck" },
  { key: "tarjetas_acceso", code: "C03.2.1.5", label: "Tarjetas de acceso electrónicas", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Seguridad y Protección", scope: "servicio", iconName: "Lock" },
  { key: "caja_fuerte_recepcion", code: "C03.2.1.6", label: "Caja fuerte principal en recepción", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Seguridad y Protección", scope: "servicio", iconName: "Lock" },

  // C03.3. Políticas y Normas de la Propiedad
  { key: "horario_checkin", code: "C03.3.3.1a", label: "Horario de Check-in (Admisión)", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas y Normas", scope: "servicio", iconName: "Clock" },
  { key: "horario_checkout", code: "C03.3.3.1b", label: "Horario de Check-out (Salida)", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas y Normas", scope: "servicio", iconName: "Clock" },
  { key: "late_checkout", code: "C03.3.3.1c", label: "Posibilidad de Late Check-out", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas y Normas", scope: "servicio", iconName: "Clock" },
  { key: "admision_mascotas_gratis", code: "C03.3.2.1", label: "Admisión de mascotas gratis", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas de Mascotas", scope: "servicio", iconName: "Dog" },
  { key: "admision_mascotas_suplemento", code: "C03.3.2.2", label: "Admisión de mascotas con suplemento", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas de Mascotas", scope: "servicio", iconName: "Dog" },
  { key: "camas_mascotas", code: "C03.3.2.3", label: "Camas para mascotas", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas de Mascotas", scope: "servicio", iconName: "Dog" },
  { key: "no_mascotas", code: "C03.3.2.4", label: "No se admiten mascotas", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas de Mascotas", scope: "servicio", iconName: "Dog" },
  { key: "apto_familias", code: "C03.3.3.1", label: "Apto para familias", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Perfil de Huésped", scope: "servicio", iconName: "Users" },
  { key: "solo_adultos", code: "C03.3.3.2", label: "Solo para adultos", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Perfil de Huésped", scope: "servicio", iconName: "UserCheck" },
  /* Travel Proud LGTB+ is strictly excluded per directive */

  { key: "prohibido_fumar", code: "C03.3.4.1", label: "Prohibido fumar en todo el alojamiento", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Normas de la Propiedad", scope: "servicio", iconName: "Ban" },
  { key: "zonas_fumadores", code: "C03.3.4.2", label: "Zonas habilitadas para fumadores", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Normas de la Propiedad", scope: "comun", iconName: "Flame" },
  { key: "prohibido_fiestas", code: "C03.3.4.3", label: "Prohibida la celebración de fiestas/eventos", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Normas de la Propiedad", scope: "servicio", iconName: "Ban" },
  { key: "horarios_silencio", code: "C03.3.4.4", label: "Minimización de ruido en horarios nocturnos", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Normas de la Propiedad", scope: "servicio", iconName: "VolumeX" },

  { key: "entrada_salida_discreta", code: "C03.3.5.1.1", label: "Entrada/Salida discreta o automatizada", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas Especiales", scope: "servicio", iconName: "Lock" },
  { key: "alquiler_por_horas", code: "C03.3.5.1.2", label: "Alquiler por horas", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas Especiales", scope: "servicio", iconName: "Clock" },
  { key: "toque_de_queda", code: "C03.3.5.2.1", label: "Hora de toque de queda", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas Especiales", scope: "servicio", iconName: "Clock" },
  { key: "edad_minima", code: "C03.3.5.2.2", label: "Edad mínima requerida", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Políticas Especiales", scope: "servicio", iconName: "UserCheck" },

  { key: "pago_tarjeta", code: "C03.3.6.1", label: "Acepta Pago con Tarjeta", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Métodos de Pago", scope: "servicio", iconName: "Zap" },
  { key: "pago_bizum", code: "C03.3.6.2", label: "Acepta Pago con Bizum", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Métodos de Pago", scope: "servicio", iconName: "Zap" },
  { key: "pago_crypto", code: "C03.3.6.3", label: "Acepta Pago con Criptomonedas", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Métodos de Pago", scope: "servicio", iconName: "Zap" },

  { key: "con_cocina", code: "C03.3.7.1", label: "Con cocina", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Régimen de Estancia", scope: "servicio", iconName: "Utensils" },
  { key: "desayuno_incluido", code: "C03.3.7.2", label: "Desayuno incluido", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Régimen de Estancia", scope: "servicio", iconName: "Coffee" },
  { key: "todas_comidas_incluidas", code: "C03.3.7.3", label: "Todas las comidas incluidas (Pensión completa)", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Régimen de Estancia", scope: "servicio", iconName: "Utensils" },
  { key: "desayuno_cena_incluidos", code: "C03.3.7.4", label: "Desayuno y cena incluidos (Media pensión)", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Régimen de Estancia", scope: "servicio", iconName: "Utensils" },

  { key: "cancelacion_gratis", code: "C03.3.8.1a", label: "Cancelación gratis", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Condiciones de Reserva", scope: "servicio", iconName: "Check" },
  { key: "reserva_sin_tarjeta", code: "C03.3.8.1b", label: "Reservas sin tarjeta de crédito", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Condiciones de Reserva", scope: "servicio", iconName: "Check" },

  { key: "ninos_cualquier_edad", code: "C03.3.9.1a", label: "Se pueden alojar niños de cualquier edad", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Estancia de Niños", scope: "servicio", iconName: "Smile" },
  { key: "ninos_tarifa_adulto", code: "C03.3.9.1b", label: "Niños pagan como adultos a partir de edad especificada", pillar: "C03", pillarLabel: "C03. Gestión, Políticas y Logística", category: "general", subCategory: "Estancia de Niños", scope: "servicio", iconName: "Smile" },

  // ==========================================
  // C04. INSTALACIONES Y SERVICIOS ESPECÍFICOS POR TIPOLOGÍA
  // ==========================================
  // Campings
  { key: "c_mobil_home", code: "C04.1.1.1", label: "Mobil-home", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Campings", scope: "privado", iconName: "Tent" },
  { key: "c_bungalow", code: "C04.1.1.2", label: "Bungalow", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Campings", scope: "privado", iconName: "Home" },
  { key: "c_tienda_lona", code: "C04.1.1.3", label: "Tienda de lona", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Campings", scope: "privado", iconName: "Tent" },
  { key: "c_glamping", code: "C04.1.1.6", label: "Glamping de lujo", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Campings", scope: "privado", iconName: "Tent" },
  { key: "c_parcela_tienda", code: "C04.1.1.8", label: "Parcela para tienda", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Campings", scope: "comun", iconName: "Tent" },
  { key: "c_parcela_caravana", code: "C04.1.1.9", label: "Parcela para caravana / autocaravana", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Campings", scope: "comun", iconName: "Car" },
  { key: "c_supermercado", code: "C04.1.2.2", label: "Panadería / Supermercado del camping", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Campings", scope: "comun", iconName: "Coffee" },

  // Barcos y Embarcaciones
  { key: "b_puente_mando", code: "C04.1.1", label: "Puente de mando", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Barcos", scope: "comun", iconName: "Ship" },
  { key: "b_solarium_proa", code: "C04.1.2", label: "Solárium en proa", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Barcos", scope: "comun", iconName: "Sun" },
  { key: "b_camarote_doble", code: "C04.1.3", label: "Camarote doble", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Barcos", scope: "privado", iconName: "Bed" },
  { key: "b_desalinizadora", code: "C04.1.18", label: "Desalinizadora / potabilizadora de agua", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Barcos", scope: "comun", iconName: "Droplets" },
  { key: "b_inversor_12v_220v", code: "C04.1.19", label: "Inversor de corriente (12V a 220V)", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Barcos", scope: "comun", iconName: "Zap" },
  { key: "b_plataforma_bano_popa", code: "C04.1.27", label: "Plataforma de baño en popa", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Barcos", scope: "comun", iconName: "Waves" },
  { key: "b_patron_incluido", code: "C04.1.38", label: "Servicio de Patrón / Capitán privado incluido", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Barcos", scope: "servicio", iconName: "UserCheck" },
  { key: "b_chef_a_bordo", code: "C04.1.41", label: "Servicio de Chef / Cocinero a bordo", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Barcos", scope: "servicio", iconName: "ChefHat" },
  { key: "b_starlink_alta_mar", code: "C04.1.43", label: "Wi-Fi satelital / Starlink para navegación en alta mar", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Barcos", scope: "servicio", iconName: "Wifi" },

  // Love Hotels
  { key: "lh_cama_reforzada", code: "C04.2.1.1", label: "Cama King/Queen Size con colchón reforzado", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Love Hotels", scope: "privado", iconName: "Heart" },
  { key: "lh_sillon_tantra", code: "C04.2.1.2", label: "Sillón Tantra", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Love Hotels", scope: "privado", iconName: "Heart" },
  { key: "lh_espejos_estrategicos", code: "C04.2.1.3", label: "Espejos estratégicos", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Love Hotels", scope: "privado", iconName: "Heart" },
  { key: "lh_jacuzzi_xl", code: "C04.2.2.1", label: "Jacuzzi XL / Hidromasaje privado en la habitación", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Love Hotels", scope: "privado", iconName: "Bath" },
  { key: "lh_ducha_cristal_transparente", code: "C04.2.2.2", label: "Ducha de cristal transparente vista desde la cama", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Love Hotels", scope: "privado", iconName: "Droplets" },
  { key: "lh_kits_cosmetica_erotica", code: "C04.2.2.3", label: "Kits de higiene íntima y cosmética erótica", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Love Hotels", scope: "privado", iconName: "Sparkles" },
  { key: "lh_iluminacion_led_colores", code: "C04.2.3.1", label: "Iluminación LED regulable por zonas y colores", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Love Hotels", scope: "privado", iconName: "Zap" },
  { key: "lh_insonorizacion_reforzada", code: "C04.2.3.2", label: "Insonorización acústica reforzada", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Love Hotels", scope: "privado", iconName: "VolumeX" },
  { key: "lh_canales_adultos_x", code: "C04.2.4.1", label: "Canales de contenido adultos (X/Erótico) incluido", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Love Hotels", scope: "privado", iconName: "Tv" },
  { key: "lh_terraza_screens_opacos", code: "C04.2.5.1", label: "Terraza con Jacuzzi o piscina privada sin visibilidad exterior (screens opacos)", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Love Hotels", scope: "privado", iconName: "ShieldCheck" },
  { key: "lh_garaje_puerta_automatica", code: "C04.2.6.1", label: "Garaje privado individual con puerta automática (Check-in sin bajarte del coche)", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Love Hotels", scope: "privado", iconName: "Car" },
  { key: "lh_pass_through_box", code: "C04.2.6.2", label: "Torno / 'Pass-through Box' de entrega anónimo", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Love Hotels", scope: "privado", iconName: "Box" },
  { key: "lh_accesos_independientes", code: "C04.2.6.3", label: "Entrada y salida por accesos independientes", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Love Hotels", scope: "privado", iconName: "Lock" },
  { key: "lh_checkin_automatizado", code: "C04.2.7.1", label: "Check-in / Check-out automatizado", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Love Hotels", scope: "servicio", iconName: "Clock" },
  { key: "lh_facturacion_anonima", code: "C04.2.7.2", label: "Facturación y cobro 100% anónimo", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Love Hotels", scope: "servicio", iconName: "Lock" },

  // Chalets de Montaña / Esquí
  { key: "ch_chimenea_lena", code: "C04.3.1.1", label: "Chimenea de leña", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Chalets de Montaña", scope: "privado", iconName: "Flame" },
  { key: "ch_estufa_pellets", code: "C04.3.1.2", label: "Estufa de pellets o casete térmico", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Chalets de Montaña", scope: "privado", iconName: "Flame" },
  { key: "ch_ropa_cama_termica", code: "C04.3.1.3", label: "Ropa de cama térmica/nórdica y mantas extra", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Chalets de Montaña", scope: "privado", iconName: "Bed" },
  { key: "ch_hot_tub_exterior", code: "C04.3.5.1", label: "Jacuzzi exterior / Bañera nórdica (Hot Tub) al aire libre", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Chalets de Montaña", scope: "privado", iconName: "Bath" },
  { key: "ch_guardaesquis_ski_room", code: "C04.3.6.1", label: "Guardaesquís (Ski Room) y secador de botas", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Chalets de Montaña", scope: "comun", iconName: "Mountain" },
  { key: "ch_acceso_ski_in_out", code: "C04.3.6.4", label: "Acceso Ski-in / Ski-out", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Chalets de Montaña", scope: "servicio", iconName: "Mountain" },
  { key: "ch_shuttle_telecabinas", code: "C04.3.7.1", label: "Shuttle privado a telecabinas / entrega de forfaits", pillar: "C04", pillarLabel: "C04. Específicos por Tipología", category: "especificos", subCategory: "Chalets de Montaña", scope: "servicio", iconName: "Car" },
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
