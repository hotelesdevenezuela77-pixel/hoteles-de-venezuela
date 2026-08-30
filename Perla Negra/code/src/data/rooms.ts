export interface Room {
  id: string;
  name: string;
  number: number;
  area: string;
  type: 'Familiar' | 'Familiar Grande' | 'Extrafamiliar' | 'Ejecutiva';
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  image: string;
  description: string;
}

export interface RoomType {
  type: string;
  description: string;
  basePrice: number;
  capacity: number;
  amenities: string[];
  image: string;
}

// Room types for Posada Perla Negra landing page
export const roomTypes: RoomType[] = [
  {
    type: 'Familiar',
    description: 'Habitación cómoda ideal para familias pequeñas. Ambiente acogedor con todas las comodidades para una estadía placentera.',
    basePrice: 60,
    capacity: 4,
    amenities: ['Camas Dobles', 'A/C', 'WiFi', 'TV', 'Baño Privado', 'Ventilador'],
    image: 'https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM.jpeg'
  },
  {
    type: 'Familiar Grande',
    description: 'Espaciosa habitación para familias numerosas. Mayor espacio y comodidad para compartir momentos especiales.',
    basePrice: 80,
    capacity: 6,
    amenities: ['Camas Múltiples', 'A/C', 'WiFi', 'TV', 'Baño Privado', 'Ventilador', 'Espacio Extra'],
    image: 'https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM.jpeg'
  },
  {
    type: 'Extrafamiliar',
    description: 'Diseñada para grupos grandes o varias familias. Amplio espacio con múltiples ambientes.',
    basePrice: 100,
    capacity: 8,
    amenities: ['Múltiples Camas', 'A/C', 'WiFi', 'TV', 'Baños Múltiples', 'Sala Común', 'Cocina Básica'],
    image: 'https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM.jpeg'
  },
  {
    type: 'Ejecutiva',
    description: 'Nuestra habitación premium con acabados de lujo y servicios exclusivos. Perfecta para viajeros exigentes.',
    basePrice: 120,
    capacity: 2,
    amenities: ['Cama King', 'A/C Premium', 'WiFi Alta Velocidad', 'Smart TV', 'Baño de Lujo', 'Minibar', 'Vista Privilegiada'],
    image: 'https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM.jpeg'
  }
];

// Full room inventory for Posada Perla Negra (21 habitaciones)
export const rooms: Room[] = [
  // 10 Habitaciones Familiares (F1-F10)
  { id: 'F1', name: 'Familiar 1', number: 1, area: 'Planta Baja', type: 'Familiar', capacity: 4, pricePerNight: 60, amenities: ['Camas Dobles', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  { id: 'F2', name: 'Familiar 2', number: 2, area: 'Planta Baja', type: 'Familiar', capacity: 4, pricePerNight: 60, amenities: ['Camas Dobles', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  { id: 'F3', name: 'Familiar 3', number: 3, area: 'Planta Baja', type: 'Familiar', capacity: 4, pricePerNight: 60, amenities: ['Camas Dobles', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  { id: 'F4', name: 'Familiar 4', number: 4, area: 'Planta Baja', type: 'Familiar', capacity: 4, pricePerNight: 60, amenities: ['Camas Dobles', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  { id: 'F5', name: 'Familiar 5', number: 5, area: 'Planta Baja', type: 'Familiar', capacity: 4, pricePerNight: 60, amenities: ['Camas Dobles', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  { id: 'F6', name: 'Familiar 6', number: 6, area: 'Planta Alta', type: 'Familiar', capacity: 4, pricePerNight: 60, amenities: ['Camas Dobles', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  { id: 'F7', name: 'Familiar 7', number: 7, area: 'Planta Alta', type: 'Familiar', capacity: 4, pricePerNight: 60, amenities: ['Camas Dobles', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  { id: 'F8', name: 'Familiar 8', number: 8, area: 'Planta Alta', type: 'Familiar', capacity: 4, pricePerNight: 60, amenities: ['Camas Dobles', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  { id: 'F9', name: 'Familiar 9', number: 9, area: 'Planta Alta', type: 'Familiar', capacity: 4, pricePerNight: 60, amenities: ['Camas Dobles', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  { id: 'F10', name: 'Familiar 10', number: 10, area: 'Planta Alta', type: 'Familiar', capacity: 4, pricePerNight: 60, amenities: ['Camas Dobles', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  
  // 8 Habitaciones Familiares Grandes (G1-G8)
  { id: 'G1', name: 'Familiar Grande 1', number: 11, area: 'Edificio B', type: 'Familiar Grande', capacity: 6, pricePerNight: 80, amenities: ['Camas Múltiples', 'A/C', 'WiFi', 'TV', 'Baño Privado', 'Espacio Extra'], image: '', description: '' },
  { id: 'G2', name: 'Familiar Grande 2', number: 12, area: 'Edificio B', type: 'Familiar Grande', capacity: 6, pricePerNight: 80, amenities: ['Camas Múltiples', 'A/C', 'WiFi', 'TV', 'Baño Privado', 'Espacio Extra'], image: '', description: '' },
  { id: 'G3', name: 'Familiar Grande 3', number: 13, area: 'Edificio B', type: 'Familiar Grande', capacity: 6, pricePerNight: 80, amenities: ['Camas Múltiples', 'A/C', 'WiFi', 'TV', 'Baño Privado', 'Espacio Extra'], image: '', description: '' },
  { id: 'G4', name: 'Familiar Grande 4', number: 14, area: 'Edificio B', type: 'Familiar Grande', capacity: 6, pricePerNight: 80, amenities: ['Camas Múltiples', 'A/C', 'WiFi', 'TV', 'Baño Privado', 'Espacio Extra'], image: '', description: '' },
  { id: 'G5', name: 'Familiar Grande 5', number: 15, area: 'Edificio B', type: 'Familiar Grande', capacity: 6, pricePerNight: 80, amenities: ['Camas Múltiples', 'A/C', 'WiFi', 'TV', 'Baño Privado', 'Espacio Extra'], image: '', description: '' },
  { id: 'G6', name: 'Familiar Grande 6', number: 16, area: 'Edificio B', type: 'Familiar Grande', capacity: 6, pricePerNight: 80, amenities: ['Camas Múltiples', 'A/C', 'WiFi', 'TV', 'Baño Privado', 'Espacio Extra'], image: '', description: '' },
  { id: 'G7', name: 'Familiar Grande 7', number: 17, area: 'Edificio B', type: 'Familiar Grande', capacity: 6, pricePerNight: 80, amenities: ['Camas Múltiples', 'A/C', 'WiFi', 'TV', 'Baño Privado', 'Espacio Extra'], image: '', description: '' },
  { id: 'G8', name: 'Familiar Grande 8', number: 18, area: 'Edificio B', type: 'Familiar Grande', capacity: 6, pricePerNight: 80, amenities: ['Camas Múltiples', 'A/C', 'WiFi', 'TV', 'Baño Privado', 'Espacio Extra'], image: '', description: '' },
  
  // 2 Habitaciones Extrafamiliares (X1-X2)
  { id: 'X1', name: 'Extrafamiliar 1', number: 19, area: 'Edificio C', type: 'Extrafamiliar', capacity: 8, pricePerNight: 100, amenities: ['Múltiples Camas', 'A/C', 'WiFi', 'TV', 'Baños Múltiples', 'Sala Común'], image: '', description: '' },
  { id: 'X2', name: 'Extrafamiliar 2', number: 20, area: 'Edificio C', type: 'Extrafamiliar', capacity: 8, pricePerNight: 100, amenities: ['Múltiples Camas', 'A/C', 'WiFi', 'TV', 'Baños Múltiples', 'Sala Común'], image: '', description: '' },
  
  // 1 Habitación Ejecutiva (E1)
  { id: 'E1', name: 'Ejecutiva', number: 21, area: 'Edificio Principal', type: 'Ejecutiva', capacity: 2, pricePerNight: 120, amenities: ['Cama King', 'A/C Premium', 'WiFi', 'Smart TV', 'Baño de Lujo', 'Minibar'], image: '', description: '' },
];

export const areas = ['Planta Baja', 'Planta Alta', 'Edificio B', 'Edificio C', 'Edificio Principal'];
