export interface MyCampersRoom {
  id: string;
  code: string;
  name: string;
  title: string;
  number: number;
  building: string;
  room_type: string;
  category: string;
  tipo_unidad: string;
  capacity: number;
  capacidad_max: number;
  max_guests: number;
  price_per_night: number;
  tarifa_base: number;
  price_usd: number;
  amenities: string[];
  comodidades: string[];
  primary_image: string;
  cover_image: string;
  photos: string[];
  fotos: string[];
  description: string;
  descripcion: string;
}

export const MY_CAMPERS_ROOMS: MyCampersRoom[] = [
  {
    id: "MC-101",
    code: "C1",
    name: "Camper VIP Kombi (Experiencia Vintage)",
    title: "Camper VIP Kombi (Experiencia Vintage)",
    number: 1,
    building: "Área Campers",
    room_type: "Camper VIP",
    category: "Camper VIP",
    tipo_unidad: "Camper VIP",
    capacity: 2,
    capacidad_max: 2,
    max_guests: 2,
    price_per_night: 55,
    tarifa_base: 55,
    price_usd: 55,
    amenities: ["wifi", "aire", "cocina_equipada", "balcon", "estacionamiento"],
    comodidades: ["wifi", "aire", "cocina_equipada", "balcon", "estacionamiento"],
    primary_image: "/images/my-campers/camper_1.jpg",
    cover_image: "/images/my-campers/camper_1.jpg",
    photos: [
      "/images/my-campers/camper_1.jpg",
      "/images/my-campers/camper_2.jpg",
      "/images/my-campers/camper_3.jpg",
      "/images/my-campers/camper_4.jpg"
    ],
    fotos: [
      "/images/my-campers/camper_1.jpg",
      "/images/my-campers/camper_2.jpg",
      "/images/my-campers/camper_3.jpg",
      "/images/my-campers/camper_4.jpg"
    ],
    description: "Auténtico Camper Kombi totalmente acondicionado en el clima fresco de las montañas de Cubiro. Cama matrimonial confort, kitchenette retro, luz cálida, calefacción y vista privilegiada al valle.",
    descripcion: "Auténtico Camper Kombi totalmente acondicionado en el clima fresco de las montañas de Cubiro. Cama matrimonial confort, kitchenette retro, luz cálida, calefacción y vista privilegiada al valle."
  },
  {
    id: "MC-102",
    code: "S1",
    name: "Suite Matrimonial VIP (Vista al Valle)",
    title: "Suite Matrimonial VIP (Vista al Valle)",
    number: 2,
    building: "Módulo Principal",
    room_type: "Suite Matrimonial",
    category: "Suite Matrimonial",
    tipo_unidad: "Suite Matrimonial",
    capacity: 2,
    capacidad_max: 2,
    max_guests: 2,
    price_per_night: 75,
    tarifa_base: 75,
    price_usd: 75,
    amenities: ["wifi", "aire", "balcon", "banio_privado", "caja_fuerte", "nevera"],
    comodidades: ["wifi", "aire", "balcon", "banio_privado", "caja_fuerte", "nevera"],
    primary_image: "/images/my-campers/camper_5.jpg",
    cover_image: "/images/my-campers/camper_5.jpg",
    photos: [
      "/images/my-campers/camper_5.jpg",
      "/images/my-campers/camper_6.jpg",
      "/images/my-campers/camper_7.jpg",
      "/images/my-campers/camper_8.jpg"
    ],
    fotos: [
      "/images/my-campers/camper_5.jpg",
      "/images/my-campers/camper_6.jpg",
      "/images/my-campers/camper_7.jpg",
      "/images/my-campers/camper_8.jpg"
    ],
    description: "Elegante suite de montaña con ventanales panorámicos de piso a techo, cama King Size, balcón privado, lencería de hilo de algodón y baño privado con agua caliente 24/7.",
    descripcion: "Elegante suite de montaña con ventanales panorámicos de piso a techo, cama King Size, balcón privado, lencería de hilo de algodón y baño privado con agua caliente 24/7."
  },
  {
    id: "MC-103",
    code: "A1",
    name: "Apartamento Dúplex Familiar Cubiro",
    title: "Apartamento Dúplex Familiar Cubiro",
    number: 3,
    building: "Módulo Dúplex",
    room_type: "Apartamento Completo",
    category: "Apartamento Completo",
    tipo_unidad: "Apartamento Completo",
    capacity: 6,
    capacidad_max: 6,
    max_guests: 6,
    price_per_night: 110,
    tarifa_base: 110,
    price_usd: 110,
    amenities: ["wifi", "aire", "cocina_equipada", "balcon", "tv_cable", "estacionamiento"],
    comodidades: ["wifi", "aire", "cocina_equipada", "balcon", "tv_cable", "estacionamiento"],
    primary_image: "/images/my-campers/camper_9.jpg",
    cover_image: "/images/my-campers/camper_9.jpg",
    photos: [
      "/images/my-campers/camper_9.jpg",
      "/images/my-campers/camper_10.jpg",
      "/images/my-campers/camper_11.jpg",
      "/images/my-campers/camper_12.jpg"
    ],
    fotos: [
      "/images/my-campers/camper_9.jpg",
      "/images/my-campers/camper_10.jpg",
      "/images/my-campers/camper_11.jpg",
      "/images/my-campers/camper_12.jpg"
    ],
    description: "Residencia espaciosa de 2 niveles ideal para grupos y familias hasta 6 personas. Cocina completamente equipada, sala de estar, comedor privado, 2 baños y balcón.",
    descripcion: "Residencia espaciosa de 2 niveles ideal para grupos y familias hasta 6 personas. Cocina completamente equipada, sala de estar, comedor privado, 2 baños y balcón."
  },
  {
    id: "MC-104",
    code: "P1",
    name: "Suite Presidencial Panorama (Neblina & Estrellas)",
    title: "Suite Presidencial Panorama (Neblina & Estrellas)",
    number: 4,
    building: "Módulo VIP",
    room_type: "Suite Premium VIP",
    category: "Suite Premium VIP",
    tipo_unidad: "Suite Premium VIP",
    capacity: 4,
    capacidad_max: 4,
    max_guests: 4,
    price_per_night: 140,
    tarifa_base: 140,
    price_usd: 140,
    amenities: ["wifi", "aire", "jacuzzi", "balcon", "vista_mar", "tv_cable"],
    comodidades: ["wifi", "aire", "jacuzzi", "balcon", "vista_mar", "tv_cable"],
    primary_image: "/images/my-campers/camper_13.jpg",
    cover_image: "/images/my-campers/camper_13.jpg",
    photos: [
      "/images/my-campers/camper_13.jpg",
      "/images/my-campers/camper_14.jpg",
      "/images/my-campers/camper_15.jpg",
      "/images/my-campers/camper_16.jpg"
    ],
    fotos: [
      "/images/my-campers/camper_13.jpg",
      "/images/my-campers/camper_14.jpg",
      "/images/my-campers/camper_15.jpg",
      "/images/my-campers/camper_16.jpg"
    ],
    description: "Máximo confort en las lomas de Cubiro con terraza de 180°, jacuzzi con vista al horizonte, cama King VIP, chimenea/zona de fogata privada y atención personalizada.",
    descripcion: "Máximo confort en las lomas de Cubiro con terraza de 180°, jacuzzi con vista al horizonte, cama King VIP, chimenea/zona de fogata privada y atención personalizada."
  },
  {
    id: "MC-105",
    code: "CB1",
    name: "Cabaña Alpina Familiar (El Refugio)",
    title: "Cabaña Alpina Familiar (El Refugio)",
    number: 5,
    building: "Sector Cabañas",
    room_type: "Cabaña Privada",
    category: "Cabaña Privada",
    tipo_unidad: "Cabaña Privada",
    capacity: 5,
    capacidad_max: 5,
    max_guests: 5,
    price_per_night: 85,
    tarifa_base: 85,
    price_usd: 85,
    amenities: ["wifi", "aire", "cocina_equipada", "estacionamiento", "banio_privado"],
    comodidades: ["wifi", "aire", "cocina_equipada", "estacionamiento", "banio_privado"],
    primary_image: "/images/my-campers/camper_17.jpg",
    cover_image: "/images/my-campers/camper_17.jpg",
    photos: [
      "/images/my-campers/camper_17.jpg",
      "/images/my-campers/camper_18.jpg",
      "/images/my-campers/camper_19.jpg",
      "/images/my-campers/camper_20.jpg"
    ],
    fotos: [
      "/images/my-campers/camper_17.jpg",
      "/images/my-campers/camper_18.jpg",
      "/images/my-campers/camper_19.jpg",
      "/images/my-campers/camper_20.jpg"
    ],
    description: "Acogedora cabaña rodeada de naturaleza y neblina. Dispone de 2 habitaciones independientes, cocina completa, porche de madera con hamacas y área privada para fogata.",
    descripcion: "Acogedora cabaña rodeada de naturaleza y neblina. Dispone de 2 habitaciones independientes, cocina completa, porche de madera con hamacas y área privada para fogata."
  },
  {
    id: "MC-106",
    code: "G1",
    name: "Camper Glamping Executive (Doble Confort)",
    title: "Camper Glamping Executive (Doble Confort)",
    number: 6,
    building: "Área Glamping",
    room_type: "Camper Glamping",
    category: "Camper Glamping",
    tipo_unidad: "Camper Glamping",
    capacity: 4,
    capacidad_max: 4,
    max_guests: 4,
    price_per_night: 65,
    tarifa_base: 65,
    price_usd: 65,
    amenities: ["wifi", "aire", "estacionamiento", "banio_privado", "nevera"],
    comodidades: ["wifi", "aire", "estacionamiento", "banio_privado", "nevera"],
    primary_image: "/images/my-campers/camper_21.jpg",
    cover_image: "/images/my-campers/camper_21.jpg",
    photos: [
      "/images/my-campers/camper_21.jpg",
      "/images/my-campers/camper_22.jpg",
      "/images/my-campers/camper_23.jpg",
      "/images/my-campers/camper_24.jpg"
    ],
    fotos: [
      "/images/my-campers/camper_21.jpg",
      "/images/my-campers/camper_22.jpg",
      "/images/my-campers/camper_23.jpg",
      "/images/my-campers/camper_24.jpg"
    ],
    description: "Experiencia de glamping elevada en Cubiro. Equipado con 2 camas confortables, terraza exterior, acceso a zona de fogata nocturna, baño privado y WiFi Starlink.",
    descripcion: "Experiencia de glamping elevada en Cubiro. Equipado con 2 camas confortables, terraza exterior, acceso a zona de fogata nocturna, baño privado y WiFi Starlink."
  }
];
