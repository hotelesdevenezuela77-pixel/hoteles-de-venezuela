export interface AmenityItem {
  key: string;
  label: string;
  category: "general" | "recreacion" | "gastronomia" | "servicios" | "habitacion";
  iconName: string;
}

export const AMENITY_CATEGORIES = [
  { id: "all", label: "Todas las Amenidades" },
  { id: "general", label: "⚡ General & Confort" },
  { id: "recreacion", label: "🏊 Recreación & Bienestar" },
  { id: "gastronomia", label: "🍽️ Gastronomía & Bares" },
  { id: "servicios", label: "⛵ Servicios & Experiencias" },
  { id: "habitacion", label: "🛏️ Habitación & Confort" },
];

export const MASTER_AMENITIES: AmenityItem[] = [
  // I. Amenidades Populares e Imprescindibles (Quick-view)
  { key: "habitaciones_sin_humo", label: "Habitaciones sin humo", category: "general", iconName: "Ban" },
  { key: "traslado_aeropuerto", label: "Traslado al aeropuerto (Gratis/Pago)", category: "servicios", iconName: "Plane" },
  { key: "adaptado_personas_movilidad_reducida", label: "Adaptado para movilidad reducida", category: "general", iconName: "Accessibility" },
  { key: "wifi", label: "Wi-Fi gratuito (Alta velocidad)", category: "general", iconName: "Wifi" },
  { key: "habitaciones_familiares", label: "Habitaciones familiares", category: "general", iconName: "Users" },
  { key: "ascensor", label: "Ascensor", category: "general", iconName: "ArrowUpSquare" },
  { key: "calefaccion", label: "Calefacción", category: "general", iconName: "Flame" },
  { key: "aire_acondicionado", label: "Aire acondicionado", category: "general", iconName: "Wind" },

  // II. Amenidades de la Habitación y Apartamento (Room Amenities)
  // A. Salud e Higiene (Baño):
  { key: "papel_higienico", label: "Papel higiénico", category: "habitacion", iconName: "FileText" },
  { key: "toallas", label: "Toallas", category: "habitacion", iconName: "Droplets" },
  { key: "ducha", label: "Ducha / Bañera con lluvia premium", category: "habitacion", iconName: "Droplets" },
  { key: "articulos_aseo", label: "Artículos de aseo gratis", category: "habitacion", iconName: "Sparkles" },
  { key: "aseo", label: "Aseo", category: "habitacion", iconName: "Check" },
  { key: "secador_pelo", label: "Secador de pelo profesional", category: "habitacion", iconName: "Wind" },
  { key: "wc_elevado", label: "WC elevado con barras de apoyo", category: "general", iconName: "Accessibility" },

  // B. Equipamiento y Confort (Habitación):
  { key: "ropa_cama", label: "Ropa de cama de algodón egipcio", category: "habitacion", iconName: "Bed" },
  { key: "armario", label: "Armario / Vestidor", category: "habitacion", iconName: "Archive" },
  { key: "zona_estar", label: "Zona de estar / Sofá cama", category: "habitacion", iconName: "Smile" },
  { key: "escritorio", label: "Escritorio / Mesa de trabajo", category: "habitacion", iconName: "Briefcase" },
  { key: "enchufe_cerca", label: "Enchufe cerca de la cama", category: "habitacion", iconName: "Zap" },
  { key: "adaptadores_corriente", label: "Adaptadores de corriente internacionales", category: "habitacion", iconName: "Zap" },
  { key: "espejo_cuerpo", label: "Espejo de cuerpo entero", category: "habitacion", iconName: "Eye" },
  { key: "insonorizacion", label: "Insonorización premium", category: "habitacion", iconName: "VolumeX" },
  { key: "purificador_aire", label: "Purificador de aire / Ventilador", category: "habitacion", iconName: "Wind" },
  { key: "cortinas_blackout", label: "Cortinas opacas (Blackout)", category: "habitacion", iconName: "EyeOff" },

  // C. Cocina y Comedor:
  { key: "cafetera", label: "Cafetera Nespresso / Tetera", category: "habitacion", iconName: "Coffee" },
  { key: "productos_limpieza", label: "Productos de limpieza", category: "habitacion", iconName: "Sparkles" },
  { key: "nevera", label: "Nevera / Minibar", category: "habitacion", iconName: "IceCream" },
  { key: "utensilios_cocina", label: "Utensilios de cocina completos", category: "habitacion", iconName: "ChefHat" },
  { key: "microondas", label: "Microondas / Horno", category: "habitacion", iconName: "ChefHat" },
  { key: "lavavajillas", label: "Lavavajillas", category: "habitacion", iconName: "Droplets" },
  { key: "tostadora", label: "Tostadora / Hervidor", category: "habitacion", iconName: "Coffee" },
  { key: "mesa_comedor", label: "Mesa de comedor", category: "habitacion", iconName: "Utensils" },

  // D. Equipamiento Tecnológico:
  { key: "tv_cable", label: "Smart TV con Netflix & Cable", category: "habitacion", iconName: "Tv" },
  { key: "sistema_sonido", label: "Sistema de sonido Bluetooth", category: "habitacion", iconName: "Music" },
  { key: "consola_juegos", label: "Consola de videojuegos", category: "habitacion", iconName: "Trophy" },

  // E. Extras de Lujo:
  { key: "vino_bienvenida", label: "Vino / Champán de bienvenida", category: "habitacion", iconName: "GlassWater" },
  { key: "fruta_cortesia", label: "Fruta fresca de cortesía", category: "habitacion", iconName: "Apple" },
  { key: "menu_almohadas", label: "Menú de almohadas", category: "habitacion", iconName: "Bed" },
  { key: "albornoces_lujo", label: "Albornoces y zapatillas de lujo", category: "habitacion", iconName: "Shirt" },

  // III. Servicios y Atención al Cliente:
  { key: "registro_privado", label: "Registro de entrada/salida privado", category: "servicios", iconName: "Key" },
  { key: "registro_expres", label: "Registro de entrada/salida exprés", category: "servicios", iconName: "Clock" },
  { key: "recepcion_24h", label: "Recepción 24 horas", category: "general", iconName: "Clock" },
  { key: "consigna_equipaje", label: "Consigna de equipaje / Maletero", category: "servicios", iconName: "Briefcase" },
  { key: "taquillas", label: "Taquillas de seguridad", category: "servicios", iconName: "Lock" },
  { key: "servicio_limpieza", label: "Servicio de limpieza diario", category: "servicios", iconName: "Sparkles" },
  { key: "lavanderia", label: "Servicio de lavandería express", category: "servicios", iconName: "Shirt" },
  { key: "asistente_guiones", label: "Asistente de guiones inteligentes", category: "servicios", iconName: "Sparkles" },
  { key: "cambio_divisa", label: "Cambio de divisa / ATM", category: "servicios", iconName: "DollarSign" },

  // IV. Comida y Bebida:
  { key: "restaurante", label: "Restaurante a la carta / Buffet", category: "gastronomia", iconName: "Utensils" },
  { key: "cafeteria", label: "Cafetería", category: "gastronomia", iconName: "Coffee" },
  { key: "bar", label: "Bar / Lounge nocturno", category: "gastronomia", iconName: "Wine" },
  { key: "room_service", label: "Servicio a la habitación 24 horas", category: "gastronomia", iconName: "ConciergeBell" },
  { key: "menu_infantil", label: "Menú infantil y familiar", category: "gastronomia", iconName: "Smile" },

  // V. Salud, Bienestar y Deportes:
  { key: "piscina", label: "Piscina climatizada (Aire/Cubierta)", category: "recreacion", iconName: "Waves" },
  { key: "spa", label: "Spa & Centro de masajes", category: "recreacion", iconName: "Sparkles" },
  { key: "jacuzzi", label: "Jacuzzi / Tina de hidromasaje", category: "recreacion", iconName: "Bath" },
  { key: "sauna", label: "Sauna / Baño turco (Hamam)", category: "recreacion", iconName: "Flame" },
  { key: "gimnasio", label: "Gimnasio equipado / Fitness Center", category: "recreacion", iconName: "Dumbbell" },
  { key: "cancha_padel", label: "Pistas de tenis y pádel", category: "recreacion", iconName: "Trophy" },

  // VI. Entretenimiento:
  { key: "sala_juegos", label: "Sala de juegos (Billar/Ping-pong)", category: "recreacion", iconName: "Trophy" },
  { key: "parque_infantil", label: "Parque infantil & Club de niños", category: "recreacion", iconName: "Smile" },
  { key: "tiendas", label: "Tiendas en el establecimiento", category: "general", iconName: "Briefcase" },
  { key: "jardin", label: "Jardín / Zona de picnic", category: "recreacion", iconName: "TreePine" },

  // VII. Seguridad y Transporte:
  { key: "extintores", label: "Extintores de incendios", category: "general", iconName: "Flame" },
  { key: "camaras_seguridad", label: "Cámaras de seguridad en zonas comunes", category: "general", iconName: "Eye" },
  { key: "detectores_humo", label: "Detectores de humo / Alarmas", category: "general", iconName: "AlertTriangle" },
  { key: "caja_fuerte", label: "Caja fuerte digital", category: "general", iconName: "Lock" },
  { key: "aparcamiento", label: "Aparcamiento vigilado / Garaje", category: "general", iconName: "Car" },

  // VIII. Accesibilidad:
  { key: "ducha_ras_suelo", label: "Ducha a ras de suelo (Walk-in)", category: "general", iconName: "Droplets" },
  { key: "wc_barras_apoyo", label: "WC con barras de apoyo", category: "general", iconName: "Accessibility" },

  // IX. Idiomas:
  { key: "personal_multilingue", label: "Personal multilingüe (Español/Inglés)", category: "general", iconName: "Globe" },
];

/**
 * Normalizes any services representation (JSON string, comma-separated string, array) into a string array.
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
  const found = MASTER_AMENITIES.find(a => a.key.toLowerCase() === normalized || a.label.toLowerCase() === normalized);
  if (found) return found.label;
  // Capitalize custom string
  return key.charAt(0).toUpperCase() + key.slice(1);
}
