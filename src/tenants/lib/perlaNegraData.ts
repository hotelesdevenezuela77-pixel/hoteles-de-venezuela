export interface PerlaNegraRoom {
  id: string;
  code: string;
  name: string;
  number: number;
  building: string;
  room_type: string;
  type: 'Familiar' | 'Familiar Grande' | 'Extrafamiliar' | 'Ejecutiva';
  capacity: number;
  price_per_night: number;
  price_usd: number;
  amenities: string[];
  primary_image: string;
  photos: string[];
  description: string;
}

export interface PerlaNegraRoomTypeSummary {
  type: string;
  title: string;
  description: string;
  basePrice: number;
  capacity: number;
  availableCount: number;
  amenities: string[];
  image: string;
}

export const PERLA_NEGRA_ROOM_TYPES: PerlaNegraRoomTypeSummary[] = [
  {
    type: 'Familiar',
    title: 'Habitación Familiar Estándar',
    description: 'Habitación cómoda ideal para familias pequeñas. Ambiente acogedor equipado con aire acondicionado split, WiFi Starlink, TV HD y baño privado.',
    basePrice: 60,
    capacity: 4,
    availableCount: 10,
    amenities: ['Camas Dobles', 'Aire Acondicionado', 'WiFi Starlink', 'TV HD', 'Baño Privado', 'Agua Caliente'],
    image: '/images/perla-negra/room_1.jpg'
  },
  {
    type: 'Familiar Grande',
    title: 'Habitación Familiar Grande',
    description: 'Espaciosa unidad diseñada para familias numerosas o grupos. Cuenta con mayor espacio interior, múltiples camas y ambiente aclimatado 24/7.',
    basePrice: 80,
    capacity: 6,
    availableCount: 8,
    amenities: ['Camas Múltiples', 'Aire Acondicionado', 'WiFi Starlink', 'TV HD', 'Baño Privado', 'Espacio Extra', 'Nevera Ejecutiva'],
    image: '/images/perla-negra/room_2.jpg'
  },
  {
    type: 'Extrafamiliar',
    title: 'Habitación Extrafamiliar',
    description: 'Diseñada para grupos grandes o varias familias integradas. Dispone de amplio espacio con múltiples ambientes, baños adicionales y zona de estar.',
    basePrice: 100,
    capacity: 8,
    availableCount: 2,
    amenities: ['Múltiples Camas', 'Aire Acondicionado', 'WiFi Starlink', 'Smart TV', 'Baños Múltiples', 'Sala Común'],
    image: '/images/perla-negra/room_3.jpg'
  },
  {
    type: 'Ejecutiva',
    title: 'Suite Ejecutiva VIP',
    description: 'Nuestra habitación premium con acabados de lujo y vista privilegiada a las instalaciones. Perfecta para parejas o viajeros exigentes.',
    basePrice: 120,
    capacity: 2,
    availableCount: 1,
    amenities: ['Cama King Size', 'Aire Acondicionado VIP', 'WiFi Ultra Rápido', 'Smart TV 55"', 'Baño de Lujo', 'Minibar', 'Balcón Privado'],
    image: '/images/perla-negra/room_1.jpg'
  }
];

export const PERLA_NEGRA_ROOMS: PerlaNegraRoom[] = [
  // 10 Habitaciones Familiares (F1-F10)
  {
    id: 'F1',
    code: 'A1',
    name: 'Habitación Familiar F1',
    number: 1,
    building: 'Planta Baja',
    room_type: 'Familiar',
    type: 'Familiar',
    capacity: 4,
    price_per_night: 60,
    price_usd: 60,
    amenities: ['Camas Dobles', 'Aire Acondicionado', 'WiFi Starlink', 'TV HD', 'Baño Privado'],
    primary_image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop',
    photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop'],
    description: 'Habitación acogedora en Planta Baja equipada con dos camas dobles confortables, ideal para 4 huéspedes.'
  },
  {
    id: 'F2',
    code: 'A2',
    name: 'Habitación Familiar F2',
    number: 2,
    building: 'Planta Baja',
    room_type: 'Familiar',
    type: 'Familiar',
    capacity: 4,
    price_per_night: 60,
    price_usd: 60,
    amenities: ['Camas Dobles', 'Aire Acondicionado', 'WiFi Starlink', 'TV HD', 'Baño Privado'],
    primary_image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop',
    photos: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop'],
    description: 'Habitación familiar en Planta Baja cercana a las áreas de descanso y jardín tropical.'
  },
  {
    id: 'F3',
    code: 'A3',
    name: 'Habitación Familiar F3',
    number: 3,
    building: 'Planta Baja',
    room_type: 'Familiar',
    type: 'Familiar',
    capacity: 4,
    price_per_night: 60,
    price_usd: 60,
    amenities: ['Camas Dobles', 'Aire Acondicionado', 'WiFi Starlink', 'TV HD', 'Baño Privado'],
    primary_image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&auto=format&fit=crop',
    photos: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&auto=format&fit=crop'],
    description: 'Habitación cómoda de fácil acceso en Planta Baja con baño impecable y climatización constante.'
  },
  {
    id: 'F4',
    code: 'A4',
    name: 'Habitación Familiar F4',
    number: 4,
    building: 'Planta Baja',
    room_type: 'Familiar',
    type: 'Familiar',
    capacity: 4,
    price_per_night: 60,
    price_usd: 60,
    amenities: ['Camas Dobles', 'Aire Acondicionado', 'WiFi Starlink', 'TV HD', 'Baño Privado'],
    primary_image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&auto=format&fit=crop',
    photos: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&auto=format&fit=crop'],
    description: 'Unidad familiar acogedora con espacio para 4 personas y excelente ventilación.'
  },
  {
    id: 'F5',
    code: 'A5',
    name: 'Habitación Familiar F5',
    number: 5,
    building: 'Planta Baja',
    room_type: 'Familiar',
    type: 'Familiar',
    capacity: 4,
    price_per_night: 60,
    price_usd: 60,
    amenities: ['Camas Dobles', 'Aire Acondicionado', 'WiFi Starlink', 'TV HD', 'Baño Privado'],
    primary_image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop',
    photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop'],
    description: 'Habitación de gran confort en Planta Baja, ideal para estadías de descanso en Morrocoy.'
  },
  {
    id: 'F6',
    code: 'B1',
    name: 'Habitación Familiar F6',
    number: 6,
    building: 'Planta Alta',
    room_type: 'Familiar',
    type: 'Familiar',
    capacity: 4,
    price_per_night: 60,
    price_usd: 60,
    amenities: ['Camas Dobles', 'Aire Acondicionado', 'WiFi Starlink', 'TV HD', 'Baño Privado'],
    primary_image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop',
    photos: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop'],
    description: 'Habitación en Planta Alta con brisa fresca marina y vista hacia el patio interno.'
  },
  {
    id: 'F7',
    code: 'B2',
    name: 'Habitación Familiar F7',
    number: 7,
    building: 'Planta Alta',
    room_type: 'Familiar',
    type: 'Familiar',
    capacity: 4,
    price_per_night: 60,
    price_usd: 60,
    amenities: ['Camas Dobles', 'Aire Acondicionado', 'WiFi Starlink', 'TV HD', 'Baño Privado'],
    primary_image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&auto=format&fit=crop',
    photos: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&auto=format&fit=crop'],
    description: 'Habitación iluminada en Planta Alta con excelentes comodidades para la familia.'
  },
  {
    id: 'F8',
    code: 'B3',
    name: 'Habitación Familiar F8',
    number: 8,
    building: 'Planta Alta',
    room_type: 'Familiar',
    type: 'Familiar',
    capacity: 4,
    price_per_night: 60,
    price_usd: 60,
    amenities: ['Camas Dobles', 'Aire Acondicionado', 'WiFi Starlink', 'TV HD', 'Baño Privado'],
    primary_image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&auto=format&fit=crop',
    photos: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&auto=format&fit=crop'],
    description: 'Tranquila habitación en Planta Alta para disfrutar del descanso tras un día de playa.'
  },
  {
    id: 'F9',
    code: 'B4',
    name: 'Habitación Familiar F9',
    number: 9,
    building: 'Planta Alta',
    room_type: 'Familiar',
    type: 'Familiar',
    capacity: 4,
    price_per_night: 60,
    price_usd: 60,
    amenities: ['Camas Dobles', 'Aire Acondicionado', 'WiFi Starlink', 'TV HD', 'Baño Privado'],
    primary_image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop',
    photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop'],
    description: 'Espacio confortable en Planta Alta con decoración cálida y aire acondicionado Split.'
  },
  {
    id: 'F10',
    code: 'B5',
    name: 'Habitación Familiar F10',
    number: 10,
    building: 'Planta Alta',
    room_type: 'Familiar',
    type: 'Familiar',
    capacity: 4,
    price_per_night: 60,
    price_usd: 60,
    amenities: ['Camas Dobles', 'Aire Acondicionado', 'WiFi Starlink', 'TV HD', 'Baño Privado'],
    primary_image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop',
    photos: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop'],
    description: 'Décima habitación familiar de nuestro inventario, garantizando comodidad absoluta.'
  },

  // 8 Habitaciones Familiares Grandes (G1-G8)
  {
    id: 'G1',
    code: 'G1',
    name: 'Familiar Grande G1',
    number: 11,
    building: 'Edificio B - Piscina',
    room_type: 'Familiar Grande',
    type: 'Familiar Grande',
    capacity: 6,
    price_per_night: 80,
    price_usd: 80,
    amenities: ['Camas Múltiples', 'Aire Acondicionado', 'WiFi Starlink', 'TV HD', 'Baño Privado', 'Espacio Extra'],
    primary_image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&auto=format&fit=crop',
    photos: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&auto=format&fit=crop'],
    description: 'Amplia habitación con capacidad para 6 personas, ideal para grupos familiares en Edificio B.'
  },
  {
    id: 'G2',
    code: 'G2',
    name: 'Familiar Grande G2',
    number: 12,
    building: 'Edificio B - Piscina',
    room_type: 'Familiar Grande',
    type: 'Familiar Grande',
    capacity: 6,
    price_per_night: 80,
    price_usd: 80,
    amenities: ['Camas Múltiples', 'Aire Acondicionado', 'WiFi Starlink', 'TV HD', 'Baño Privado', 'Espacio Extra'],
    primary_image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&auto=format&fit=crop',
    photos: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&auto=format&fit=crop'],
    description: 'Unidad de gran tamaño cerca de la piscina iluminada con excelente distribución.'
  },
  {
    id: 'G3',
    code: 'G3',
    name: 'Familiar Grande G3',
    number: 13,
    building: 'Edificio B - Piscina',
    room_type: 'Familiar Grande',
    type: 'Familiar Grande',
    capacity: 6,
    price_per_night: 80,
    price_usd: 80,
    amenities: ['Camas Múltiples', 'Aire Acondicionado', 'WiFi Starlink', 'TV HD', 'Baño Privado', 'Espacio Extra'],
    primary_image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop',
    photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop'],
    description: 'Habitación familiar espaciosa con acabados confortables y baño privado completo.'
  },
  {
    id: 'G4',
    code: 'G4',
    name: 'Familiar Grande G4',
    number: 14,
    building: 'Edificio B - Piscina',
    room_type: 'Familiar Grande',
    type: 'Familiar Grande',
    capacity: 6,
    price_per_night: 80,
    price_usd: 80,
    amenities: ['Camas Múltiples', 'Aire Acondicionado', 'WiFi Starlink', 'TV HD', 'Baño Privado', 'Espacio Extra'],
    primary_image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop',
    photos: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop'],
    description: 'Habitación de 6 puestos para familias que buscan descansar juntas en un mismo ambiente.'
  },
  {
    id: 'G5',
    code: 'G5',
    name: 'Familiar Grande G5',
    number: 15,
    building: 'Edificio B - Piscina',
    room_type: 'Familiar Grande',
    type: 'Familiar Grande',
    capacity: 6,
    price_per_night: 80,
    price_usd: 80,
    amenities: ['Camas Múltiples', 'Aire Acondicionado', 'WiFi Starlink', 'TV HD', 'Baño Privado', 'Espacio Extra'],
    primary_image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&auto=format&fit=crop',
    photos: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&auto=format&fit=crop'],
    description: 'Habitación confortable con camas amplias, aire split y vista exterior.'
  },
  {
    id: 'G6',
    code: 'G6',
    name: 'Familiar Grande G6',
    number: 16,
    building: 'Edificio B - Piscina',
    room_type: 'Familiar Grande',
    type: 'Familiar Grande',
    capacity: 6,
    price_per_night: 80,
    price_usd: 80,
    amenities: ['Camas Múltiples', 'Aire Acondicionado', 'WiFi Starlink', 'TV HD', 'Baño Privado', 'Espacio Extra'],
    primary_image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&auto=format&fit=crop',
    photos: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&auto=format&fit=crop'],
    description: 'Espacio familiar de 6 personas en Edificio B con alta velocidad de conexión Starlink.'
  },
  {
    id: 'G7',
    code: 'G7',
    name: 'Familiar Grande G7',
    number: 17,
    building: 'Edificio B - Piscina',
    room_type: 'Familiar Grande',
    type: 'Familiar Grande',
    capacity: 6,
    price_per_night: 80,
    price_usd: 80,
    amenities: ['Camas Múltiples', 'Aire Acondicionado', 'WiFi Starlink', 'TV HD', 'Baño Privado', 'Espacio Extra'],
    primary_image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop',
    photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop'],
    description: 'Habitación espaciosa con iluminación natural y ambiente relajante.'
  },
  {
    id: 'G8',
    code: 'G8',
    name: 'Familiar Grande G8',
    number: 18,
    building: 'Edificio B - Piscina',
    room_type: 'Familiar Grande',
    type: 'Familiar Grande',
    capacity: 6,
    price_per_night: 80,
    price_usd: 80,
    amenities: ['Camas Múltiples', 'Aire Acondicionado', 'WiFi Starlink', 'TV HD', 'Baño Privado', 'Espacio Extra'],
    primary_image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop',
    photos: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop'],
    description: 'Octava habitación familiar grande en Posada Perla Negra, ideal para 6 adultos/niños.'
  },

  // 2 Habitaciones Extrafamiliares (X1-X2)
  {
    id: 'X1',
    code: 'X1',
    name: 'Extrafamiliar X1',
    number: 19,
    building: 'Edificio C - Gran Capacidad',
    room_type: 'Extrafamiliar',
    type: 'Extrafamiliar',
    capacity: 8,
    price_per_night: 100,
    price_usd: 100,
    amenities: ['Múltiples Camas', 'Aire Acondicionado', 'WiFi Starlink', 'TV HD', 'Baños Múltiples', 'Sala Común'],
    primary_image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop',
    photos: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop'],
    description: 'Magnífica habitación extrafamiliar para 8 huéspedes con áreas integradas y máximo confort.'
  },
  {
    id: 'X2',
    code: 'X2',
    name: 'Extrafamiliar X2',
    number: 20,
    building: 'Edificio C - Gran Capacidad',
    room_type: 'Extrafamiliar',
    type: 'Extrafamiliar',
    capacity: 8,
    price_per_night: 100,
    price_usd: 100,
    amenities: ['Múltiples Camas', 'Aire Acondicionado', 'WiFi Starlink', 'TV HD', 'Baños Múltiples', 'Sala Común'],
    primary_image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop',
    photos: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop'],
    description: 'Unidad de gran formato para grupos o familias numerosas con todas las facilidades de la posada.'
  },

  // 1 Habitación Ejecutiva (E1)
  {
    id: 'E1',
    code: 'E1',
    name: 'Suite Ejecutiva E1',
    number: 21,
    building: 'Edificio Principal',
    room_type: 'Ejecutiva',
    type: 'Ejecutiva',
    capacity: 2,
    price_per_night: 120,
    price_usd: 120,
    amenities: ['Cama King Size', 'Aire Acondicionado VIP', 'WiFi Ultra Rápido', 'Smart TV 55"', 'Baño de Lujo', 'Minibar', 'Balcón Privado'],
    primary_image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&auto=format&fit=crop',
    photos: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&auto=format&fit=crop'],
    description: 'Nuestra Suite Ejecutiva estrella con lencería fina, cama King, minibar y balcón privado hacia los jardines.'
  }
];
