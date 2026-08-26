export interface Room {
  id: string;
  name: string;
  number: number;
  area: string;
  type: 'Matrimonial' | 'Triple' | 'Cuádruple' | 'Apartamento';
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

// Room types for the landing page cards
export const roomTypes: RoomType[] = [
  {
    type: 'Matrimonial',
    description: 'Perfecta para parejas, con cama matrimonial y vista relajante. Un refugio íntimo para disfrutar del mar.',
    basePrice: 85,
    capacity: 2,
    amenities: ['Cama King', 'Vista al Mar', 'A/C', 'WiFi', 'TV', 'Baño Privado', 'Minibar'],
    image: 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-3.jpg'
  },
  {
    type: 'Triple',
    description: 'Ideal para familias pequeñas o grupos de amigos. Espacio cómodo con todo lo necesario.',
    basePrice: 110,
    capacity: 3,
    amenities: ['Cama Doble + Individual', 'Vista al Mar', 'A/C', 'WiFi', 'TV', 'Baño Privado'],
    image: 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-1.jpg'
  },
  {
    type: 'Cuádruple',
    description: 'Amplias habitaciones para familias que buscan comodidad y espacio para compartir momentos especiales.',
    basePrice: 140,
    capacity: 4,
    amenities: ['2 Camas Dobles', 'Vista al Mar', 'A/C', 'WiFi', 'TV', 'Baño Privado', 'Terraza'],
    image: 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-4.jpg'
  },
  {
    type: 'Apartamento',
    description: 'Tu hogar lejos de casa. Espacios completos con cocina, sala y todo para una estadía prolongada.',
    basePrice: 180,
    capacity: 5,
    amenities: ['Sala de Estar', 'Cocina Equipada', 'Vista al Mar', 'A/C', 'WiFi', 'TV', '2 Baños', 'Terraza Privada'],
    image: 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-2.jpg'
  }
];

// Full room inventory based on the spreadsheet
export const rooms: Room[] = [
  // Edificio Principal (A1-A5)
  { id: 'A1', name: 'A1', number: 1, area: 'Edificio Principal', type: 'Matrimonial', capacity: 2, pricePerNight: 85, amenities: ['Cama King', 'Vista al Mar', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  { id: 'A2', name: 'A2', number: 2, area: 'Edificio Principal', type: 'Matrimonial', capacity: 2, pricePerNight: 85, amenities: ['Cama King', 'Vista al Mar', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  { id: 'A3', name: 'A3', number: 3, area: 'Edificio Principal', type: 'Triple', capacity: 3, pricePerNight: 110, amenities: ['Cama Doble + Individual', 'Vista al Mar', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  { id: 'A4', name: 'A4', number: 4, area: 'Edificio Principal', type: 'Cuádruple', capacity: 4, pricePerNight: 140, amenities: ['2 Camas Dobles', 'Vista al Mar', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  { id: 'A5', name: 'A5', number: 5, area: 'Edificio Principal', type: 'Cuádruple', capacity: 4, pricePerNight: 140, amenities: ['2 Camas Dobles', 'Vista al Mar', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  // Edificio de la Piscina (B1-B5)
  { id: 'B1', name: 'B1', number: 6, area: 'Edificio de la Piscina', type: 'Matrimonial', capacity: 2, pricePerNight: 95, amenities: ['Cama King', 'Vista a Piscina', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  { id: 'B2', name: 'B2', number: 7, area: 'Edificio de la Piscina', type: 'Triple', capacity: 3, pricePerNight: 120, amenities: ['Cama Doble + Individual', 'Vista a Piscina', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  { id: 'B3', name: 'B3', number: 8, area: 'Edificio de la Piscina', type: 'Triple', capacity: 3, pricePerNight: 120, amenities: ['Cama Doble + Individual', 'Vista a Piscina', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  { id: 'B4', name: 'B4', number: 9, area: 'Edificio de la Piscina', type: 'Cuádruple', capacity: 4, pricePerNight: 150, amenities: ['2 Camas Dobles', 'Vista a Piscina', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  { id: 'B5', name: 'B5', number: 10, area: 'Edificio de la Piscina', type: 'Cuádruple', capacity: 4, pricePerNight: 150, amenities: ['2 Camas Dobles', 'Vista a Piscina', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  // Edificio de la Piscina (C1-C2) - Apartamentos
  { id: 'C1', name: 'C1', number: 11, area: 'Edificio de la Piscina', type: 'Apartamento', capacity: 5, pricePerNight: 180, amenities: ['Sala de Estar', 'Cocina', 'Vista a Piscina', 'A/C', 'WiFi', 'TV', '2 Baños'], image: '', description: '' },
  { id: 'C2', name: 'C2', number: 12, area: 'Edificio de la Piscina', type: 'Apartamento', capacity: 5, pricePerNight: 180, amenities: ['Sala de Estar', 'Cocina', 'Vista a Piscina', 'A/C', 'WiFi', 'TV', '2 Baños'], image: '', description: '' },
  // Edificio de Recepción (D1-D5)
  { id: 'D1', name: 'D1', number: 13, area: 'Edificio de Recepción', type: 'Matrimonial', capacity: 2, pricePerNight: 80, amenities: ['Cama King', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  { id: 'D2', name: 'D2', number: 14, area: 'Edificio de Recepción', type: 'Triple', capacity: 3, pricePerNight: 105, amenities: ['Cama Doble + Individual', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  { id: 'D3', name: 'D3', number: 15, area: 'Edificio de Recepción', type: 'Triple', capacity: 3, pricePerNight: 105, amenities: ['Cama Doble + Individual', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  { id: 'D4', name: 'D4', number: 16, area: 'Edificio de Recepción', type: 'Cuádruple', capacity: 4, pricePerNight: 135, amenities: ['2 Camas Dobles', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  { id: 'D5', name: 'D5', number: 17, area: 'Edificio de Recepción', type: 'Cuádruple', capacity: 4, pricePerNight: 135, amenities: ['2 Camas Dobles', 'A/C', 'WiFi', 'TV', 'Baño Privado'], image: '', description: '' },
  // Edificio de Recepción (E1-E3) - Apartamentos
  { id: 'E1', name: 'E1', number: 18, area: 'Edificio de Recepción', type: 'Apartamento', capacity: 5, pricePerNight: 175, amenities: ['Sala de Estar', 'Cocina', 'A/C', 'WiFi', 'TV', '2 Baños'], image: '', description: '' },
  { id: 'E2', name: 'E2', number: 19, area: 'Edificio de Recepción', type: 'Apartamento', capacity: 5, pricePerNight: 175, amenities: ['Sala de Estar', 'Cocina', 'A/C', 'WiFi', 'TV', '2 Baños'], image: '', description: '' },
  { id: 'E3', name: 'E3', number: 20, area: 'Edificio de Recepción', type: 'Apartamento', capacity: 5, pricePerNight: 175, amenities: ['Sala de Estar', 'Cocina', 'A/C', 'WiFi', 'TV', '2 Baños'], image: '', description: '' },
];

export const areas = ['Edificio Principal', 'Edificio de la Piscina', 'Edificio de Recepción'];
