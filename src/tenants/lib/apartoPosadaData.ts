import { 
  Waves, Flame, Utensils, Compass, Car, Zap, Wifi, ShieldCheck, 
  Bed, Users, Hotel, Sparkles, MapPin, CheckCircle2, Star, Calendar, Clock
} from "lucide-react";
import { type Room } from "../components/RoomCard";

export interface ApartoRoomItem extends Room {
  badgeCategory: 'parejas' | 'familiares' | 'apartamentos';
  badgeLabel: string;
  capacityText: string;
}

export const APARTO_TRUST_ITEMS = [
  {
    icon: Star,
    title: "★ 4.8 en Google Reviews",
    subtitle: "+120 valoraciones de huéspedes reales",
    solidBg: "#FF0096"
  },
  {
    icon: ShieldCheck,
    title: "Contacto Directo 0% Comisiones",
    subtitle: "Tarifa garantizada sin recargos de agencia",
    solidBg: "#00C8D4"
  },
  {
    icon: Zap,
    title: "Planta Eléctrica 100% & Agua Continua",
    subtitle: "Aires split y suministro 24/7 garantizado",
    solidBg: "#9B00CC"
  }
];

export const APARTO_DIFFERENTIALS = [
  {
    number: "01",
    title: "Salida Directa & Cercanía a los Cayos",
    description: "Ubicación estratégica a minutos de las mejores marinas privadas para embarcar directo hacia Cayo Sombrero, Cayo Muerto, Cayo Sal y Varadero sin demoras.",
    solidBg: "#00C8D4",
    icon: Compass
  },
  {
    number: "02",
    title: "Piscina Familiar Impecable & Solárium",
    description: "Piscina cristalina tratada diariamente con área de baja profundidad para niños, solárium con reposeras ergonómicas e iluminación subacuática nocturna.",
    solidBg: "#FF0096",
    icon: Waves
  },
  {
    number: "03",
    title: "Servicios Continuos 100% Garantizados",
    description: "Planta eléctrica automática de capacidad total para energizar todos los aires acondicionados split y suministro continuo de agua potable.",
    solidBg: "#9B00CC",
    icon: Zap
  }
];

export const APARTO_BENTO_TILES = [
  {
    id: "piscina-principal",
    title: "Piscina Cristalina & Solárium",
    subtitle: "Área central de descanso con sombrillas y palmeras",
    image: "/images/aparto-posada/piscina-cristalina-palmeras.jpg",
    tag: "Instalación Destacada",
    className: "col-span-1 md:col-span-2 row-span-2 min-h-[380px] md:min-h-[460px]"
  },
  {
    id: "caney-colonial-jardines",
    title: "Caney Colonial & Jardines",
    subtitle: "Área social decorativa y descanso al aire libre",
    image: "/images/aparto-posada/pozo-agua-artesanal.jpg",
    tag: "Zona de Descanso",
    className: "col-span-1 md:col-span-1 row-span-1 min-h-[220px]"
  },
  {
    id: "vista-balcon-mar",
    title: "Balcones con Vista al Mar",
    subtitle: "Vistas despejadas a las palmeras y costa de Morrocoy",
    image: "/images/aparto-posada/vista-balcon-mar.jpg",
    tag: "Vistas Panorámicas",
    className: "col-span-1 md:col-span-1 row-span-1 min-h-[220px]"
  },
  {
    id: "gastronomia-playa",
    title: "Gastronomía Marina & Empanadas",
    subtitle: "Crujientes sabores playeros servidos al pie de piscina",
    image: "/images/aparto-posada/empanadas-gastronomia-playa.jpg",
    tag: "Sabor Costero",
    className: "col-span-1 md:col-span-1 row-span-1 min-h-[220px]"
  },
  {
    id: "piscina-noche-led",
    title: "Piscina Nocturna Iluminada",
    subtitle: "Espectacular iluminación LED azul y brisa marina",
    image: "/images/aparto-posada/piscina-noche-led-aerea.jpg",
    tag: "Atmósfera Nocturna",
    className: "col-span-1 md:col-span-1 row-span-1 min-h-[220px]"
  }
];

export const APARTO_FEATURED_ROOMS: ApartoRoomItem[] = [
  {
    id: "apm-matrimonial-b1",
    name: "Suite Matrimonial Vigas de Madera (B1)",
    nombre: "Suite Matrimonial Vigas de Madera (B1)",
    category: "Parejas / Matrimonial VIP",
    categoria: "Parejas / Matrimonial VIP",
    badgeCategory: "parejas",
    badgeLabel: "Parejas & Escapadas",
    capacityText: "Hasta 2 personas",
    capacity: 2,
    price_per_night: 95,
    tarifa_base: 95,
    price_usd: 95,
    beds_count: 1,
    bed_type: "Cama Matrimonial King",
    primary_image: "/images/aparto-posada/hab-matrimonial-vigas.jpg",
    cover_image: "/images/aparto-posada/hab-matrimonial-vigas.jpg",
    photos: [
      "/images/aparto-posada/hab-matrimonial-vigas.jpg",
      "/images/aparto-posada/piscina-cristalina-palmeras.jpg",
      "/images/aparto-posada/vista-balcon-mar.jpg"
    ],
    amenities: ["Cama King", "Techo con Vigas", "A/C 24/7", "WiFi Starlink", "Baño Privado", "Lámparas de Lectura"],
    comodidades: ["Cama King", "Techo con Vigas", "A/C 24/7", "WiFi Starlink", "Baño Privado", "Lámparas de Lectura"],
    description: "Habitación prémium para parejas con techo de vigas de madera rústica, cama matrimonial king, aire acondicionado split continuo y baño privado impecable."
  },
  {
    id: "apm-matrimonial-a1",
    name: "Suite Matrimonial Rústica King (A1)",
    nombre: "Suite Matrimonial Rústica King (A1)",
    category: "Parejas / Matrimonial",
    categoria: "Parejas / Matrimonial",
    badgeCategory: "parejas",
    badgeLabel: "Parejas & Escapadas",
    capacityText: "Hasta 2 personas",
    capacity: 2,
    price_per_night: 85,
    tarifa_base: 85,
    price_usd: 85,
    beds_count: 1,
    bed_type: "Cama King Size",
    primary_image: "/images/aparto-posada/suite-rustica-king.jpg",
    cover_image: "/images/aparto-posada/suite-rustica-king.jpg",
    photos: [
      "/images/aparto-posada/suite-rustica-king.jpg",
      "/images/aparto-posada/hab-matrimonial-beige.jpg",
      "/images/aparto-posada/piscina-dia-caney.jpg"
    ],
    amenities: ["Cama King", "Pared Texturizada", "A/C 24/7", "WiFi Starlink", "Baño Privado", "Nevera Ejecutiva"],
    comodidades: ["Cama King", "Pared Texturizada", "A/C 24/7", "WiFi Starlink", "Baño Privado", "Nevera Ejecutiva"],
    description: "Ambiente íntimo con paredes de textura colonial, cama matrimonial king con lencería fresca, cortinas azules y aire acondicionado ininterrumpido."
  },
  {
    id: "apm-familiar-dos-camas",
    name: "Habitación Familiar Dos Camas (B2)",
    nombre: "Habitación Familiar Dos Camas (B2)",
    category: "Familiares / Triple",
    categoria: "Familiares / Triple",
    badgeCategory: "familiares",
    badgeLabel: "Familiar Pequeña",
    capacityText: "Hasta 3-4 personas",
    capacity: 3,
    price_per_night: 120,
    tarifa_base: 120,
    price_usd: 120,
    beds_count: 2,
    bed_type: "1 Cama Doble + 1 Individual",
    primary_image: "/images/aparto-posada/hab-familiar-dos-camas.jpg",
    cover_image: "/images/aparto-posada/hab-familiar-dos-camas.jpg",
    photos: [
      "/images/aparto-posada/hab-familiar-dos-camas.jpg",
      "/images/aparto-posada/hab-sofa-marinera.jpg",
      "/images/aparto-posada/piscina-cristalina-palmeras.jpg"
    ],
    amenities: ["1 Cama Doble + 1 Individual", "Toallas Blancas", "A/C 24/7", "WiFi Starlink", "Baño Privado", "Mesa Auxiliar"],
    comodidades: ["1 Cama Doble + 1 Individual", "Toallas Blancas", "A/C 24/7", "WiFi Starlink", "Baño Privado", "Mesa Auxiliar"],
    description: "Espaciosa unidad familiar con una cama matrimonial más cama individual marinera, lencería limpia con toallas dobladas y ventana con vista a la vegetación."
  },
  {
    id: "apm-suite-ejecutiva-tv",
    name: "Suite Familiar Ejecutiva con Microondas (B4)",
    nombre: "Suite Familiar Ejecutiva con Microondas (B4)",
    category: "Familiares / Cuádruple",
    categoria: "Familiares / Cuádruple",
    badgeCategory: "familiares",
    badgeLabel: "Familia Estándar",
    capacityText: "Hasta 4 personas",
    capacity: 4,
    price_per_night: 150,
    tarifa_base: 150,
    price_usd: 150,
    beds_count: 2,
    bed_type: "Cama King + Sofá Cama",
    primary_image: "/images/aparto-posada/suite-completa-tv-microondas.jpg",
    cover_image: "/images/aparto-posada/suite-completa-tv-microondas.jpg",
    photos: [
      "/images/aparto-posada/suite-completa-tv-microondas.jpg",
      "/images/aparto-posada/hab-suite-escritorio.jpg",
      "/images/aparto-posada/vista-balcon-mar.jpg"
    ],
    amenities: ["Smart TV", "Microondas", "Nevera Ejecutiva", "A/C 24/7", "WiFi Starlink", "Espejo Decorativo", "Baño Privado"],
    comodidades: ["Smart TV", "Microondas", "Nevera Ejecutiva", "A/C 24/7", "WiFi Starlink", "Espejo Decorativo", "Baño Privado"],
    description: "Habitación de alto confort con TV de pantalla plana en pared, microondas, nevera ejecutiva, clóset abierto con perchas y mesa de trabajo."
  },
  {
    id: "apm-apartamento-c1",
    name: "Apartamento Familiar con Cocina & Terraza (C1)",
    nombre: "Apartamento Familiar con Cocina & Terraza (C1)",
    category: "Apartamentos / Completo",
    categoria: "Apartamentos / Completo",
    badgeCategory: "apartamentos",
    badgeLabel: "Apartamento Completo",
    capacityText: "Hasta 5 personas",
    capacity: 5,
    price_per_night: 180,
    tarifa_base: 180,
    price_usd: 180,
    beds_count: 3,
    bed_type: "1 Cama Queen + 2 Camas Sala",
    primary_image: "/images/aparto-posada/cocina-apartamento-equipada.jpg",
    cover_image: "/images/aparto-posada/cocina-apartamento-equipada.jpg",
    photos: [
      "/images/aparto-posada/cocina-apartamento-equipada.jpg",
      "/images/aparto-posada/terraza-privada-mar.jpg",
      "/images/aparto-posada/sala-comedor-apartamento.jpg",
      "/images/aparto-posada/apartamento-camas-sala.jpg"
    ],
    amenities: ["Cocina Equipada", "Estufa a Gas", "Nevera Grande", "Terraza con Vista al Mar", "Sala-Comedor", "A/C 24/7", "WiFi Starlink"],
    comodidades: ["Cocina Equipada", "Estufa a Gas", "Nevera Grande", "Terraza con Vista al Mar", "Sala-Comedor", "A/C 24/7", "WiFi Starlink"],
    description: "La auténtica experiencia 'Su Casa en la Playa'. Cuenta con cocina equipada completa con estufa y nevera, sala de estar independiente, terraza privada con vista al mar y baldosas de terracota."
  },
  {
    id: "apm-apartamento-parrillera",
    name: "Gran Apartamento con Parrillera Privada (E1)",
    nombre: "Gran Apartamento con Parrillera Privada (E1)",
    category: "Apartamentos / Dúplex",
    categoria: "Apartamentos / Dúplex",
    badgeCategory: "apartamentos",
    badgeLabel: "Apartamento Dúplex",
    capacityText: "Hasta 6 personas",
    capacity: 6,
    price_per_night: 195,
    tarifa_base: 195,
    price_usd: 195,
    beds_count: 4,
    bed_type: "2 Camas Dobles + 2 Individuales",
    primary_image: "/images/aparto-posada/parrillera-terraza-privada.jpg",
    cover_image: "/images/aparto-posada/parrillera-terraza-privada.jpg",
    photos: [
      "/images/aparto-posada/parrillera-terraza-privada.jpg",
      "/images/aparto-posada/cocina-apartamento-panoramica.jpg",
      "/images/aparto-posada/comedor-taburetes-rusticos.jpg",
      "/images/aparto-posada/pasillo-apartamento-cocina.jpg"
    ],
    amenities: ["Parrillera Privada de Ladrillo", "Cocina Panorámica", "Comedor con Taburetes", "Terraza Privada", "A/C Continuo", "WiFi Starlink"],
    comodidades: ["Parrillera Privada de Ladrillo", "Cocina Panorámica", "Comedor con Taburetes", "Terraza Privada", "A/C Continuo", "WiFi Starlink"],
    description: "Máxima amplitud y privacidad. Cuenta con su propia parrillera de ladrillos en terraza privada, cocina completa con ventana panorámica, comedor rústico y capacidad holgada para toda la familia."
  }
];

export const APARTO_ALL_ROOMS: ApartoRoomItem[] = [
  ...APARTO_FEATURED_ROOMS,
  {
    id: "apm-matrimonial-a2",
    name: "Habitación Matrimonial Relax (A2)",
    nombre: "Habitación Matrimonial Relax (A2)",
    category: "Parejas / Matrimonial",
    categoria: "Parejas / Matrimonial",
    badgeCategory: "parejas",
    badgeLabel: "Parejas & Escapadas",
    capacityText: "Hasta 2 personas",
    capacity: 2,
    price_per_night: 85,
    tarifa_base: 85,
    price_usd: 85,
    beds_count: 1,
    bed_type: "Cama Matrimonial King",
    primary_image: "/images/aparto-posada/hab-matrimonial-beige.jpg",
    cover_image: "/images/aparto-posada/hab-matrimonial-beige.jpg",
    photos: [
      "/images/aparto-posada/hab-matrimonial-beige.jpg",
      "/images/aparto-posada/piscina-cristalina-palmeras.jpg"
    ],
    amenities: ["Cama King", "A/C 24/7", "WiFi Starlink", "Baño Privado"],
    comodidades: ["Cama King", "A/C 24/7", "WiFi Starlink", "Baño Privado"],
    description: "Habitación matrimonial tranquila en Edificio Principal con lencería beige y baño privado."
  },
  {
    id: "apm-triple-a3",
    name: "Habitación Triple Familiar Marinera (A3)",
    nombre: "Habitación Triple Familiar Marinera (A3)",
    category: "Familiares / Triple",
    categoria: "Familiares / Triple",
    badgeCategory: "familiares",
    badgeLabel: "Familiar Pequeña",
    capacityText: "Hasta 3 personas",
    capacity: 3,
    price_per_night: 110,
    tarifa_base: 110,
    price_usd: 110,
    beds_count: 2,
    bed_type: "1 Cama Doble + 1 Sofá Marinera",
    primary_image: "/images/aparto-posada/hab-sofa-marinera.jpg",
    cover_image: "/images/aparto-posada/hab-sofa-marinera.jpg",
    photos: [
      "/images/aparto-posada/hab-sofa-marinera.jpg",
      "/images/aparto-posada/hab-familiar-dos-camas.jpg"
    ],
    amenities: ["1 Doble + 1 Marinera", "A/C 24/7", "WiFi Starlink", "Baño Privado"],
    comodidades: ["1 Doble + 1 Marinera", "A/C 24/7", "WiFi Starlink", "Baño Privado"],
    description: "Triple confortable en Edificio Principal con sofá cama marinera para niños y aire continuo."
  },
  {
    id: "apm-cuadruple-a4",
    name: "Habitación Cuádruple Edificio A (A4)",
    nombre: "Habitación Cuádruple Edificio A (A4)",
    category: "Familiares / Cuádruple",
    categoria: "Familiares / Cuádruple",
    badgeCategory: "familiares",
    badgeLabel: "Familia Estándar",
    capacityText: "Hasta 4 personas",
    capacity: 4,
    price_per_night: 140,
    tarifa_base: 140,
    price_usd: 140,
    beds_count: 2,
    bed_type: "2 Camas Dobles",
    primary_image: "/images/aparto-posada/hab-suite-escritorio.jpg",
    cover_image: "/images/aparto-posada/hab-suite-escritorio.jpg",
    photos: [
      "/images/aparto-posada/hab-suite-escritorio.jpg",
      "/images/aparto-posada/suite-completa-tv-microondas.jpg"
    ],
    amenities: ["2 Camas Dobles", "Escritorio & Espejo", "A/C 24/7", "WiFi Starlink", "Baño Privado"],
    comodidades: ["2 Camas Dobles", "Escritorio & Espejo", "A/C 24/7", "WiFi Starlink", "Baño Privado"],
    description: "Cuádruple confortable para grupos familiares con mesa tocador, espejo y ventilación fresca."
  },
  {
    id: "apm-apartamento-c2",
    name: "Apartamento Completo Terraza & Nevera (C2)",
    nombre: "Apartamento Completo Terraza & Nevera (C2)",
    category: "Apartamentos / Completo",
    categoria: "Apartamentos / Completo",
    badgeCategory: "apartamentos",
    badgeLabel: "Apartamento Completo",
    capacityText: "Hasta 5 personas",
    capacity: 5,
    price_per_night: 180,
    tarifa_base: 180,
    price_usd: 180,
    beds_count: 3,
    bed_type: "1 Matrimonial + 2 Individuales",
    primary_image: "/images/aparto-posada/cocina-apartamento-nevera.jpg",
    cover_image: "/images/aparto-posada/cocina-apartamento-nevera.jpg",
    photos: [
      "/images/aparto-posada/cocina-apartamento-nevera.jpg",
      "/images/aparto-posada/terraza-privada-mar.jpg",
      "/images/aparto-posada/sala-comedor-apartamento.jpg"
    ],
    amenities: ["Cocina Completa", "Nevera Grande", "Sala de Estar", "A/C 24/7", "WiFi Starlink"],
    comodidades: ["Cocina Completa", "Nevera Grande", "Sala de Estar", "A/C 24/7", "WiFi Starlink"],
    description: "Apartamento amplio con vista al área de piscina, cocina con nevera de gran capacidad y terraza."
  },
  {
    id: "apm-apartamento-e2",
    name: "Apartamento Familiar Camas Múltiples (E2)",
    nombre: "Apartamento Familiar Camas Múltiples (E2)",
    category: "Apartamentos / Completo",
    categoria: "Apartamentos / Completo",
    badgeCategory: "apartamentos",
    badgeLabel: "Apartamento Completo",
    capacityText: "Hasta 6 personas",
    capacity: 6,
    price_per_night: 175,
    tarifa_base: 175,
    price_usd: 175,
    beds_count: 4,
    bed_type: "1 Matrimonial + 3 Camas Sala",
    primary_image: "/images/aparto-posada/apartamento-camas-sala.jpg",
    cover_image: "/images/aparto-posada/apartamento-camas-sala.jpg",
    photos: [
      "/images/aparto-posada/apartamento-camas-sala.jpg",
      "/images/aparto-posada/comedor-taburetes-rusticos.jpg",
      "/images/aparto-posada/cocina-apartamento-panoramica.jpg"
    ],
    amenities: ["Cocina", "Sala con Camas Adicionales", "Comedor Rústico", "A/C 24/7", "WiFi Starlink"],
    comodidades: ["Cocina", "Sala con Camas Adicionales", "Comedor Rústico", "A/C 24/7", "WiFi Starlink"],
    description: "Excelente para estancias largas en Tucacas con cocina totalmente funcional y capacidad para familias numerosas."
  },
  {
    id: "apm-apartamento-d1",
    name: "Apartamento Sala & Comedor Colonial (D1)",
    nombre: "Apartamento Sala & Comedor Colonial (D1)",
    category: "Apartamentos / Completo",
    categoria: "Apartamentos / Completo",
    badgeCategory: "apartamentos",
    badgeLabel: "Apartamento Completo",
    capacityText: "Hasta 5 personas",
    capacity: 5,
    price_per_night: 185,
    tarifa_base: 185,
    price_usd: 185,
    beds_count: 3,
    bed_type: "1 Cama Queen + 2 Individuales",
    primary_image: "/images/aparto-posada/sala-comedor-apartamento.jpg",
    cover_image: "/images/aparto-posada/sala-comedor-apartamento.jpg",
    photos: [
      "/images/aparto-posada/sala-comedor-apartamento.jpg",
      "/images/aparto-posada/comedor-taburetes-rusticos.jpg"
    ],
    amenities: ["Sala Independiente", "Comedor", "Cocina", "A/C 24/7", "WiFi Starlink"],
    comodidades: ["Sala Independiente", "Comedor", "Cocina", "A/C 24/7", "WiFi Starlink"],
    description: "Pisos de terracota tradicionales, sala de estar independiente y cercanía inmediata a la piscina."
  }
];

export const APARTO_SERVICES = [
  {
    icon: Waves,
    title: "Piscina & Solárium",
    description: "Piscina cristalina con solárium y reposeras. Iluminación nocturna para disfrutar también después del atardecer.",
    solidBg: "#00C8D4"
  },
  {
    icon: Flame,
    title: "Parrilleras & Caney",
    description: "Área social equipada con parrilleras de carbón, mesas y sombras para compartir asados familiares al aire libre.",
    solidBg: "#FF0096"
  },
  {
    icon: Utensils,
    title: "Cocina Equipada en Apartamentos",
    description: "Nuestras unidades tipo apartamento cuentan con cocina, nevera y utensilios para cocinar su propia comida fresca.",
    solidBg: "#9B00CC"
  },
  {
    icon: Compass,
    title: "Lanchas Privadas para Traslados",
    description: "Asesoría y coordinación directa de traslados náuticos en peñero o yate privado hacia los cayos del Parque Morrocoy.",
    solidBg: "#00C8D4"
  },
  {
    icon: Car,
    title: "Estacionamiento Cerrado y Vigilado",
    description: "Aparcamiento interno privado dentro de las instalaciones con portón de seguridad para la total tranquilidad de su vehículo.",
    solidBg: "#10b981"
  },
  {
    icon: Zap,
    title: "Planta Eléctrica & Agua Continua",
    description: "Respaldo energético 100% automático para todos los aires acondicionados y suministro continuo de agua sin fallas.",
    solidBg: "#f59e0b"
  }
];

export const APARTO_REVIEWS = [
  {
    name: "Alejandro Mendoza",
    role: "Local Guide • 42 opiniones en Google",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop",
    rating: 5,
    date: "Hace 2 semanas",
    verified: true,
    content: "Excelente experiencia en Aparto Posada del Mar. La piscina impecable a cualquier hora, la planta eléctrica funcionó perfecto sin un solo parpadeo y la atención de los anfitriones fue de primera clase. Los apartamentos con cocina son comodísimos si vas con niños. Volvemos sin duda."
  },
  {
    name: "Valentina Rivas de Colmenares",
    role: "Huésped Verificada • Google Business",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop",
    rating: 5,
    date: "Hace 1 mes",
    verified: true,
    content: "Nos quedamos en la suite matrimonial frente a la piscina. Todo súper limpio, lencería impecable y el WiFi Starlink vuela. Además, la posada nos ayudó a coordinar la lancha directa a Cayo Sombrero sin enredos ni sobreprecios. 100% recomendados."
  },
  {
    name: "Ing. Carlos Eduardo Gómez",
    role: "Local Guide • 34 opiniones",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop",
    rating: 5,
    date: "Hace 1 mes",
    verified: true,
    content: "El mejor punto para descansar en Morrocoy si buscas tranquilidad y seguridad. Estacionamiento cerrado cerrado dentro de la posada, suministro de agua que garantiza presión continua y atención directa por WhatsApp sin comisiones abusivas de agencias."
  }
];

export const APARTO_FAQS = [
  {
    question: "¿Cuentan con planta eléctrica y suministro de agua continuo?",
    answer: "Sí, absolutamente. Contamos con una planta eléctrica industrial de respaldo 100% que alimenta todas las áreas, incluyendo los aires acondicionados de todas las habitaciones las 24 horas del día. Además, disponemos de sistema de reserva de agua de gran capacidad con suministro continuo, garantizando agua dulce limpia y sin racionamientos durante toda su estancia."
  },
  {
    question: "¿Tienen planes de traslados en lancha a los cayos de Morrocoy?",
    answer: "Sí. Brindamos asesoría y enlace directo con capitanes y marinas aliadas de confianza para organizar paseos en peñero o yates privados hacia Cayo Sombrero, Cayo Muerto, Cayo Sal, Playuela y los mejores rincones del Parque Nacional Morrocoy, con zarpe prioritario y tarifas justas sin intermediarios."
  },
  {
    question: "¿Cuáles son las políticas de check-in y check-out?",
    answer: "El horario regular de Check-in es a partir de las 3:00 PM y el Check-out se realiza a la 1:00 PM. Si necesita ingresar antes o salir más tarde (Early Check-in o Late Check-out), puede consultarlo directamente con recepción al momento de confirmar su reserva por WhatsApp, sujeto a disponibilidad."
  },
  {
    question: "¿Aceptan mascotas en las instalaciones?",
    answer: "Con el propósito de garantizar el máximo descanso, confort y los estrictos estándares de higiene y control de alérgenos de todos nuestros huéspedes, lamentablemente no nos es posible admitir mascotas en nuestras instalaciones. Agradecemos profundamente su valiosa comprensión y nos encantará recibirle para brindarle unas vacaciones inolvidables."
  },
  {
    question: "¿Cuáles son los métodos de pago aceptados?",
    answer: "Para su máxima comodidad aceptamos múltiples modalidades: Pago Móvil y transferencias bancarias en Bolívares (a la tasa oficial BCV del día), Zelle, transferencias internacionales, efectivo en divisas (USD / EUR) y depósitos en cuentas nacionales en custodia de divisas."
  }
];

export const APARTO_LOCATION = {
  title: "Ubicación Privilegiada en Morrocoy",
  address: "Sector Las Delicias, cercanías de la carretera nacional Morrocoy - Tucacas / Chichiriviche, Estado Falcón, Venezuela.",
  coords: { lat: 10.7933, lng: -68.3214 },
  drivingInstructions: [
    {
      step: "01",
      title: "Desde Caracas / Valencia / Autopista Regional del Centro",
      desc: "Toma la autopista hacia Puerto Cabello y empalma con la Carretera Nacional Morón - Coro en dirección a Tucacas."
    },
    {
      step: "02",
      title: "Llegada al arco de entrada de Tucacas",
      desc: "Continúa 3 km en dirección al Parque Nacional Morrocoy pasando el puente principal de acceso."
    },
    {
      step: "03",
      title: "Acceso seguro a Aparto Posada del Mar",
      desc: "Gira hacia la derecha en la señalización del sector turístico; portón cerrado con acceso privado vigilado para huéspedes."
    }
  ]
};
