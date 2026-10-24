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
    title: "Planta Eléctrica 100% y Pozo Propio",
    subtitle: "Aires y agua cristalina continua 24/7",
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
    description: "Planta eléctrica automática de capacidad total para energizar todos los aires acondicionados split y pozo de agua potable propio de flujo ininterrumpido.",
    solidBg: "#9B00CC",
    icon: Zap
  }
];

export const APARTO_BENTO_TILES = [
  {
    id: "piscina-principal",
    title: "Piscina Cristalina & Solárium",
    subtitle: "Área central de descanso y sol todo el año",
    image: "/images/aparto-posada/piscina.jpg",
    tag: "Instalación Destacada",
    className: "col-span-1 md:col-span-2 row-span-2 min-h-[380px] md:min-h-[460px]"
  },
  {
    id: "morrocoy-cayos",
    title: "Parque Nacional Morrocoy",
    subtitle: "Aguas turquesas a pocos minutos de navegación",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&auto=format&fit=crop",
    tag: "Atracción Turística",
    className: "col-span-1 md:col-span-1 row-span-1 min-h-[220px]"
  },
  {
    id: "areas-sociales",
    title: "Balcones & Vista a la Piscina",
    subtitle: "Vistas despejadas y brisa marina relajante",
    image: "/images/aparto-posada/balcon.jpg",
    tag: "Áreas Comunes",
    className: "col-span-1 md:col-span-1 row-span-1 min-h-[220px]"
  },
  {
    id: "gastronomia-playa",
    title: "Gastronomía Marina Fresca",
    subtitle: "Pescados del día y sabores del mar caribeño",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop",
    tag: "Sabor Costero",
    className: "col-span-1 md:col-span-1 row-span-1 min-h-[220px]"
  },
  {
    id: "estacionamiento-seguro",
    title: "Estacionamiento Privado Cerrado",
    subtitle: "Seguridad y portón de acceso interno para su vehículo",
    image: "/images/aparto-posada/estacionamiento.jpg",
    tag: "Seguridad 24/7",
    className: "col-span-1 md:col-span-1 row-span-1 min-h-[220px]"
  }
];

export const APARTO_FEATURED_ROOMS: ApartoRoomItem[] = [
  {
    id: "apm-matrimonial-b1",
    name: "Suite Matrimonial Vista Piscina (B1)",
    nombre: "Suite Matrimonial Vista Piscina (B1)",
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
    bed_type: "Cama King Size",
    primary_image: "/images/aparto-posada/suite-principal.jpg",
    cover_image: "/images/aparto-posada/suite-principal.jpg",
    photos: [
      "/images/aparto-posada/suite-principal.jpg",
      "/images/aparto-posada/piscina.jpg",
      "/images/aparto-posada/balcon.jpg"
    ],
    amenities: ["Cama King", "Vista a Piscina", "A/C 24/7", "WiFi Starlink", "Baño Privado", "TV Cable", "Nevera Ejecutiva"],
    comodidades: ["Cama King", "Vista a Piscina", "A/C 24/7", "WiFi Starlink", "Baño Privado", "TV Cable", "Nevera Ejecutiva"],
    description: "Habitación prémium diseñada para parejas con vista directa al solárium y la piscina. Dispone de cama King de alta comodidad, lencería de hilo, aire acondicionado split continuo y baño privado impecable."
  },
  {
    id: "apm-matrimonial-a1",
    name: "Habitación Matrimonial Clásica (A1)",
    nombre: "Habitación Matrimonial Clásica (A1)",
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
    primary_image: "/images/aparto-posada/suite-matrimonial.jpg",
    cover_image: "/images/aparto-posada/suite-matrimonial.jpg",
    photos: [
      "/images/aparto-posada/suite-matrimonial.jpg",
      "/images/aparto-posada/piscina.jpg",
      "/images/aparto-posada/balcon.jpg"
    ],
    amenities: ["Cama King", "A/C 24/7", "WiFi Starlink", "Baño Privado", "TV por Cable", "Nevera"],
    comodidades: ["Cama King", "A/C 24/7", "WiFi Starlink", "Baño Privado", "TV por Cable", "Nevera"],
    description: "Ambiente sereno y silencioso en el Edificio Principal. Ideal para reconectar y descansar confortablemente tras un día explorando las playas de Morrocoy."
  },
  {
    id: "apm-triple-b2",
    name: "Habitación Triple Solárium (B2)",
    nombre: "Habitación Triple Solárium (B2)",
    category: "Familiares / Triple",
    categoria: "Familiares / Triple",
    badgeCategory: "familiares",
    badgeLabel: "Familiar Pequeña",
    capacityText: "Hasta 3 personas",
    capacity: 3,
    price_per_night: 120,
    tarifa_base: 120,
    price_usd: 120,
    beds_count: 2,
    bed_type: "1 Cama Doble + 1 Individual",
    primary_image: "https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-1.jpg",
    cover_image: "https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-1.jpg",
    photos: [
      "https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-1.jpg",
      "/images/aparto-posada/piscina.jpg",
      "/images/aparto-posada/balcon.jpg"
    ],
    amenities: ["1 Doble + 1 Individual", "Vista a Piscina", "A/C 24/7", "WiFi Starlink", "Baño Privado", "Nevera"],
    comodidades: ["1 Doble + 1 Individual", "Vista a Piscina", "A/C 24/7", "WiFi Starlink", "Baño Privado", "Nevera"],
    description: "Unidad luminosa con balcón y vista panorámica a la piscina. Configurada con una cama matrimonial más una cama individual, perfecta para parejas con un hijo."
  },
  {
    id: "apm-cuadruple-b4",
    name: "Habitación Cuádruple Superior (B4)",
    nombre: "Habitación Cuádruple Superior (B4)",
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
    bed_type: "2 Camas Dobles Queen",
    primary_image: "https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-4.jpg",
    cover_image: "https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-4.jpg",
    photos: [
      "https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-4.jpg",
      "/images/aparto-posada/balcon.jpg",
      "/images/aparto-posada/piscina.jpg"
    ],
    amenities: ["2 Camas Dobles", "Vista a Piscina", "A/C 24/7", "WiFi Starlink", "Baño Privado", "Terraza Privada"],
    comodidades: ["2 Camas Dobles", "Vista a Piscina", "A/C 24/7", "WiFi Starlink", "Baño Privado", "Terraza Privada"],
    description: "Habitación amplia y ventilada con dos camas matrimoniales completas. Excelente para 4 huéspedes, con acceso a terraza exterior y baño de gran capacidad."
  },
  {
    id: "apm-apartamento-c1",
    name: "Apartamento Familiar con Cocina (C1)",
    nombre: "Apartamento Familiar con Cocina (C1)",
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
    bed_type: "1 Cama Queen + 3 Camas Individuales",
    primary_image: "/images/aparto-posada/apartamento-cocina.jpg",
    cover_image: "/images/aparto-posada/apartamento-cocina.jpg",
    photos: [
      "/images/aparto-posada/apartamento-cocina.jpg",
      "/images/aparto-posada/piscina.jpg",
      "/images/aparto-posada/balcon.jpg",
      "/images/aparto-posada/estacionamiento.jpg"
    ],
    amenities: ["Cocina Equipada", "Sala de Estar", "Nevera Grande", "Vista a Piscina", "A/C Central", "WiFi Starlink", "2 Baños Privados"],
    comodidades: ["Cocina Equipada", "Sala de Estar", "Nevera Grande", "Vista a Piscina", "A/C Central", "WiFi Starlink", "2 Baños Privados"],
    description: "La auténtica experiencia 'Su Casa en la Playa'. Cuenta con cocina equipada con estufa, nevera y utensilios, sala de estar independiente, 2 salas de baño y capacidad hasta 5 personas."
  },
  {
    id: "apm-apartamento-e1",
    name: "Gran Apartamento Dúplex Familiar (E1)",
    nombre: "Gran Apartamento Dúplex Familiar (E1)",
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
    bed_type: "2 Camas Dobles + 2 Camas Individuales",
    primary_image: "/images/aparto-posada/apartamento-cocina.jpg",
    cover_image: "/images/aparto-posada/apartamento-cocina.jpg",
    photos: [
      "/images/aparto-posada/apartamento-cocina.jpg",
      "/images/aparto-posada/balcon.jpg",
      "/images/aparto-posada/estacionamiento.jpg"
    ],
    amenities: ["Cocina Integral", "Sala & Comedor", "2 Baños Privados", "A/C Continuo", "WiFi Starlink", "TV Smart", "Terraza Balcón"],
    comodidades: ["Cocina Integral", "Sala & Comedor", "2 Baños Privados", "A/C Continuo", "WiFi Starlink", "TV Smart", "Terraza Balcón"],
    description: "Máxima amplitud y privacidad. Dos niveles integrados con cocina integral completa, espacioso comedor, dos baños modernos y capacidad holgada para familias numerosas."
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
    primary_image: "https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-3.jpg",
    cover_image: "https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-3.jpg",
    amenities: ["Cama King", "A/C 24/7", "WiFi Starlink", "Baño Privado"],
    description: "Habitación matrimonial tranquila en Edificio Principal."
  },
  {
    id: "apm-triple-a3",
    name: "Habitación Triple Familiar (A3)",
    nombre: "Habitación Triple Familiar (A3)",
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
    bed_type: "1 Cama Doble + 1 Individual",
    primary_image: "https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-1.jpg",
    cover_image: "https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-1.jpg",
    amenities: ["1 Doble + 1 Individual", "A/C 24/7", "WiFi Starlink", "Baño Privado"],
    description: "Triple espaciosa en Edificio Principal."
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
    primary_image: "https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-4.jpg",
    cover_image: "https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-4.jpg",
    amenities: ["2 Camas Dobles", "A/C 24/7", "WiFi Starlink", "Baño Privado"],
    description: "Cuádruple confortable para grupos familiares."
  },
  {
    id: "apm-apartamento-c2",
    name: "Apartamento Completo Terraza (C2)",
    nombre: "Apartamento Completo Terraza (C2)",
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
    primary_image: "https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-2.jpg",
    cover_image: "https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-2.jpg",
    amenities: ["Cocina Completa", "Sala de Estar", "A/C 24/7", "WiFi Starlink", "2 Baños"],
    description: "Apartamento amplio con vista al área de piscina y cocina propia."
  },
  {
    id: "apm-apartamento-e2",
    name: "Apartamento Familiar Suite (E2)",
    nombre: "Apartamento Familiar Suite (E2)",
    category: "Apartamentos / Completo",
    categoria: "Apartamentos / Completo",
    badgeCategory: "apartamentos",
    badgeLabel: "Apartamento Completo",
    capacityText: "Hasta 5 personas",
    capacity: 5,
    price_per_night: 175,
    tarifa_base: 175,
    price_usd: 175,
    beds_count: 3,
    bed_type: "1 Matrimonial + 2 Individuales",
    primary_image: "https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-2.jpg",
    cover_image: "https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-2.jpg",
    amenities: ["Cocina", "Sala de Estar", "A/C 24/7", "WiFi Starlink", "2 Baños"],
    description: "Excelente para estancias largas en Tucacas con cocina totalmente funcional."
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
    title: "Planta Eléctrica & Pozo Continuo",
    description: "Respaldo energético 100% automático para todos los aires acondicionados y pozo de agua propio sin fallas.",
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
    content: "El mejor punto para descansar en Morrocoy si buscas tranquilidad y seguridad. Estacionamiento cerrado cerrado dentro de la posada, pozo de agua que garantiza presión continua y atención directa por WhatsApp sin comisiones abusivas de agencias."
  }
];

export const APARTO_FAQS = [
  {
    question: "¿Cuentan con planta eléctrica y suministro de agua continuo?",
    answer: "Sí, absolutamente. Contamos con una planta eléctrica industrial de respaldo 100% que alimenta todas las áreas, incluyendo los aires acondicionados de todas las habitaciones las 24 horas del día. Además, disponemos de pozo de agua propio de flujo continuo, garantizando agua dulce limpia y sin racionamientos durante toda su estancia."
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
    answer: "Aceptamos mascotas de razas pequeñas y educadas bajo solicitud previa y condiciones especiales de convivencia, principalmente en nuestras unidades tipo apartamento y planta baja. Por favor infórmenos al momento de cotizar para asignarle la unidad ideal para usted y su mascota."
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
