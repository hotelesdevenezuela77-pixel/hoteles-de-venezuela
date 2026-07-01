export interface B2BService {
  id: number;
  name: string;
  description: string;
  service_type: string;
  price: number;
  price_unit: string;
  capacity: number | null;
  duration_hours: number | null;
  image_url: string;
  establishment_name: string;
  establishment_slug: string;
  establishment_image: string | null;
  category_name: string;
  destination_name: string | null;
}

export const SERVICES_MOCK: B2BService[] = [
  {
    id: 1,
    name: "Alquiler de Toyota Land Cruiser Prado 4x4",
    description: "Vehículo rústico todoterreno de lujo, ideal para recorrer los paisajes más exigentes del país con total comodidad y aire acondicionado de alta potencia.",
    service_type: "alquiler_carro",
    price: 95,
    price_unit: "por día",
    capacity: 7,
    duration_hours: 24,
    image_url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop",
    establishment_name: "Tamanaco Rent-a-Car",
    establishment_slug: "hotel-tamanaco-intercontinental",
    establishment_image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
    category_name: "Rent-a-Car",
    destination_name: "Caracas"
  },
  {
    id: 2,
    name: "Paseo de Full Day en Yate de Lujo Intermarine 42'",
    description: "Navega por los cayos más exclusivos del Parque Nacional Morrocoy a bordo de un yate privado de 42 pies con capitán, ayudante, cava con hielo, sonido bluetooth y cabina con aire acondicionado.",
    service_type: "yate",
    price: 750,
    price_unit: "por día",
    capacity: 12,
    duration_hours: 8,
    image_url: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&auto=format&fit=crop",
    establishment_name: "Yates Morrocoy Charters",
    establishment_slug: "hotel-hesperia-margarita",
    establishment_image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop",
    category_name: "Alquiler de Yates",
    destination_name: "Morrocoy"
  },
  {
    id: 3,
    name: "Tour de Snorkel de Día Completo en Los Roques",
    description: "Visita los arrecifes de coral de cayo Sebastopol y cayo Bajo de Cote. Incluye equipo de snorkel, guía certificado, almuerzo en caja térmica y bebidas sin alcohol.",
    service_type: "tour",
    price: 65,
    price_unit: "por persona",
    capacity: 8,
    duration_hours: 7,
    image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop",
    establishment_name: "Posada La Cigala Excursiones",
    establishment_slug: "posada-la-cigala",
    establishment_image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop",
    category_name: "Tours y Excursiones",
    destination_name: "Los Roques"
  },
  {
    id: 4,
    name: "Traslado Privado Aeropuerto Caracas - Maiquetía (Rústico)",
    description: "Servicio de transporte VIP en camioneta SUV blindada de Las Mercedes o Altamira hacia el Aeropuerto de Maiquetía. Incluye chofer de seguridad y maletero.",
    service_type: "traslado",
    price: 45,
    price_unit: "por trayecto",
    capacity: 4,
    duration_hours: 1,
    image_url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop",
    establishment_name: "Tamanaco VIP Express",
    establishment_slug: "hotel-tamanaco-intercontinental",
    establishment_image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
    category_name: "Traslados",
    destination_name: "Caracas"
  },
  {
    id: 5,
    name: "Excursión en Curiara Indígena al Salto Ángel",
    description: "Navegación tradicional a motor por los ríos Carrao y Churún hasta la base del Salto Ángel. Incluye pernocta en hamaca frente al salto, cena criolla y caminata al mirador Laime.",
    service_type: "tour",
    price: 280,
    price_unit: "por persona",
    capacity: 10,
    duration_hours: 36,
    image_url: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=800&auto=format&fit=crop",
    establishment_name: "Canaima Jungle Tours",
    establishment_slug: "campamento-canaima",
    establishment_image: "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=800&auto=format&fit=crop",
    category_name: "Tours y Excursiones",
    destination_name: "Canaima"
  }
];
