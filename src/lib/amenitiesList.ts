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
  // General & Confort
  { key: "wifi", label: "WiFi Gratis de Alta Velocidad", category: "general", iconName: "Wifi" },
  { key: "aire_acondicionado", label: "Aire Acondicionado", category: "general", iconName: "Wind" },
  { key: "estacionamiento", label: "Estacionamiento Gratuito / Privado", category: "general", iconName: "Car" },
  { key: "planta_electrica", label: "Planta Eléctrica / Generador 100%", category: "general", iconName: "Zap" },
  { key: "tanque_agua", label: "Tanque de Agua Continuo 24/7", category: "general", iconName: "Droplets" },
  { key: "seguridad", label: "Seguridad Privada 24/7", category: "general", iconName: "ShieldCheck" },
  { key: "recepcion_24h", label: "Recepción 24 Horas", category: "general", iconName: "Clock" },
  { key: "pet_friendly", label: "Pet Friendly (Mascotas Permitidas)", category: "general", iconName: "Dog" },
  { key: "accesible", label: "Acceso para Personas con Movilidad Reducida", category: "general", iconName: "Accessibility" },
  { key: "ascensor", label: "Ascensor", category: "general", iconName: "ArrowUpSquare" },

  // Recreación & Bienestar
  { key: "piscina", label: "Piscina principal / Infinity Pool", category: "recreacion", iconName: "Waves" },
  { key: "piscina_infantil", label: "Piscina Infantil", category: "recreacion", iconName: "Waves" },
  { key: "jacuzzi", label: "Jacuzzi / Hidromasaje", category: "recreacion", iconName: "Bath" },
  { key: "playa_privada", label: "Frente al Mar / Playa Privada", category: "recreacion", iconName: "Palmtree" },
  { key: "spa", label: "Spa & Centro de Masajes", category: "recreacion", iconName: "Sparkles" },
  { key: "gimnasio", label: "Gimnasio Equipado / Fitness Center", category: "recreacion", iconName: "Dumbbell" },
  { key: "sauna", label: "Sauna / Baño Turco", category: "recreacion", iconName: "Flame" },
  { key: "jardin", label: "Jardines & Áreas Verdes", category: "recreacion", iconName: "TreePine" },
  { key: "parque_infantil", label: "Zona Infantil / Parque de Juegos", category: "recreacion", iconName: "Smile" },
  { key: "cancha_padel", label: "Cancha de Pádel / Tenis", category: "recreacion", iconName: "Trophy" },

  // Gastronomía & Bares
  { key: "restaurante", label: "Restaurante Gourmet", category: "gastronomia", iconName: "Utensils" },
  { key: "desayuno", label: "Desayuno Incluido", category: "gastronomia", iconName: "Coffee" },
  { key: "bar", label: "Bar / Lounge Nocturno", category: "gastronomia", iconName: "Wine" },
  { key: "pool_bar", label: "Bar en la Piscina (Pool Bar)", category: "gastronomia", iconName: "GlassWater" },
  { key: "room_service", label: "Servicio a la Habitación (Room Service)", category: "gastronomia", iconName: "ConciergeBell" },
  { key: "parrillera", label: "Área de Parrillera / Barbacoa", category: "gastronomia", iconName: "Flame" },

  // Servicios & Experiencias
  { key: "traslado", label: "Traslado Aeropuerto / Transfer Privado", category: "servicios", iconName: "Plane" },
  { key: "excursiones", label: "Excursiones / Paseos en Lancha", category: "servicios", iconName: "Compass" },
  { key: "toldos_playa", label: "Toldos y Sillas de Playa Incluidos", category: "servicios", iconName: "Sun" },
  { key: "eventos", label: "Salón de Eventos & Conferencias", category: "servicios", iconName: "Briefcase" },
  { key: "lavanderia", label: "Servicio de Lavandería", category: "servicios", iconName: "Shirt" },

  // Habitación & Confort
  { key: "vista_mar", label: "Vista al Mar / Vista Panorámica", category: "habitacion", iconName: "Eye" },
  { key: "balcon", label: "Balcón / Terraza Privada", category: "habitacion", iconName: "Sun" },
  { key: "tv_cable", label: "TV por Cable / Streaming (Netflix)", category: "habitacion", iconName: "Tv" },
  { key: "cocina", label: "Cocina / Kitchenette Equipada", category: "habitacion", iconName: "ChefHat" },
  { key: "agua_caliente", label: "Agua Caliente", category: "habitacion", iconName: "ThermometerSun" },
  { key: "caja_fuerte", label: "Caja Fuerte Digital", category: "habitacion", iconName: "Lock" },
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
