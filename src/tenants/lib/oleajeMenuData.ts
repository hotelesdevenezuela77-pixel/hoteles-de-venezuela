export interface OleajeDish {
  id: string;
  name: string;
  price: number;
  category: string;
  categoryName: string;
  description: string;
  image: string;
  isPopular?: boolean;
  isRecommended?: boolean;
}

export interface OleajeZone {
  id: string;
  name: string;
  slug: string;
  tableCount: number;
  capacityPerTable: number;
  description: string;
  badge: string;
  image: string;
}

export const OLEAJE_ZONES: OleajeZone[] = [
  {
    id: "z1",
    name: "Pérgolas",
    slug: "pergolas",
    tableCount: 8,
    capacityPerTable: 4,
    description: "Ambiente semi-sombreado rodeado de vegetación tropical y brisa marina constante.",
    badge: "Área Exclusiva",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop"
  },
  {
    id: "z2",
    name: "Patio Central",
    slug: "patio-central",
    tableCount: 8,
    capacityPerTable: 4,
    description: "El corazón del restaurante con iluminación cálida, música en vivo y servicio prioritario.",
    badge: "Zona Principal",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop"
  },
  {
    id: "z3",
    name: "VIP Grande",
    slug: "vip-grande",
    tableCount: 8,
    capacityPerTable: 8,
    description: "Espacios amueblados de lujo para grupos grandes, familias y celebraciones privadas.",
    badge: "Reservado VIP",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop"
  },
  {
    id: "z4",
    name: "VIP Pequeño",
    slug: "vip-pequeno",
    tableCount: 3,
    capacityPerTable: 4,
    description: "Salones íntimos diseñados para cenas románticas y reuniones ejecutivas de alto nivel.",
    badge: "Íntimo Premium",
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&auto=format&fit=crop"
  },
  {
    id: "z5",
    name: "Terraza Mirador",
    slug: "terraza",
    tableCount: 3,
    capacityPerTable: 4,
    description: "Vista panorámica elevada hacia el mar Caribe y atardeceres espectaculares.",
    badge: "Vista al Mar",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop"
  },
  {
    id: "z6",
    name: "Frente a la Playa",
    slug: "playa",
    tableCount: 8,
    capacityPerTable: 4,
    description: "Mesas sobre la arena blanca con servicio de camastros, sombrillas y atención de bar.",
    badge: "Beach Club",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop"
  }
];

export const OLEAJE_CATEGORIES = [
  { id: "all", name: "Todos los Platos", icon: "Utensils" },
  { id: "arroces", name: "Arroces & Paellas", icon: "Flame" },
  { id: "pescados-mariscos", name: "Pescados & Mariscos", icon: "Fish" },
  { id: "ceviches", name: "Ceviches & Mar", icon: "Waves" },
  { id: "carnes-aves", name: "Carnes & Aves", icon: "Beef" },
  { id: "entradas", name: "Entradas & Tapas", icon: "Sparkles" },
  { id: "pastas", name: "Pastas de Autor", icon: "ChefHat" },
  { id: "sopas", name: "Sopas & Asopados", icon: "Soup" },
  { id: "postres", name: "Postres Dulces", icon: "Cake" },
  { id: "cocteles", name: "Cócteles & Bar", icon: "Wine" },
  { id: "bebidas", name: "Bebidas & Refrescos", icon: "Wine" }
];

export const OLEAJE_MENU_ITEMS: OleajeDish[] = [
  // ARROCES Y PAELLAS
  {
    id: "arr1",
    name: "Arroz Fruto del Mar",
    price: 17.00,
    category: "arroces",
    categoryName: "Arroces & Paellas",
    description: "Arroz al estilo marinero salteado con calamares, camarones, pulpo y toques de ají dulce sobre caldo concentrado.",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop",
    isPopular: true,
    isRecommended: true
  },
  {
    id: "arr2",
    name: "Paella Valenciana Oleaje",
    price: 19.00,
    category: "arroces",
    categoryName: "Arroces & Paellas",
    description: "Tradicional paella con azafrán español, mariscos seleccionados, trozos de pollo y pimentón asado.",
    image: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=800&auto=format&fit=crop",
    isRecommended: true
  },
  {
    id: "arr3",
    name: "Risotto de Camarones",
    price: 20.00,
    category: "arroces",
    categoryName: "Arroces & Paellas",
    description: "Cremoso risotto con mantequilla de ajo, vino blanco, queso parmesano y camarones frescos a la plancha.",
    image: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=800&auto=format&fit=crop"
  },
  {
    id: "arr4",
    name: "Fidehuá Marinero Especial",
    price: 19.00,
    category: "arroces",
    categoryName: "Arroces & Paellas",
    description: "Fideos finos dorados al sartén tostado con fondo de pescado, trozos de calamar, langostinos y alioli casero.",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop"
  },

  // PESCADOS Y MARISCOS
  {
    id: "pm1",
    name: "Tabla Oleaje Mariscos (Para 2)",
    price: 35.00,
    category: "pescados-mariscos",
    categoryName: "Pescados & Mariscos",
    description: "Festín de calamares rebozados, camarones al ajillo, filet de pesca blanca y tostones playeros recién hechos.",
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop",
    isPopular: true,
    isRecommended: true
  },
  {
    id: "pm2",
    name: "Caldeirada de Mero con Mariscos",
    price: 28.00,
    category: "pescados-mariscos",
    categoryName: "Pescados & Mariscos",
    description: "Guiso espeso tradicional de mero fresco en reducción de tomate, vino blanco, alcaparras y mariscos surtidos.",
    image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800&auto=format&fit=crop",
    isRecommended: true
  },
  {
    id: "pm3",
    name: "Churrasco de Robalo al Ajillo",
    price: 23.00,
    category: "pescados-mariscos",
    categoryName: "Pescados & Mariscos",
    description: "Corte grueso de robalo a la plancha bañado en emulsión tibia de ajo crujiente, perejil y aceite de oliva extra virgen.",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop"
  },
  {
    id: "pm4",
    name: "Pescado Frito Playero Tradicional",
    price: 18.00,
    category: "pescados-mariscos",
    categoryName: "Pescados & Mariscos",
    description: "Pesca entera del día crujiente por fuera y jugosa por dentro, acompañada de tostones, ensalada de col y limón rendidor.",
    image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=800&auto=format&fit=crop",
    isPopular: true
  },

  // CEVICHES
  {
    id: "cev1",
    name: "Ceviche Clásico Morrocoy",
    price: 15.00,
    category: "ceviches",
    categoryName: "Ceviches & Mar",
    description: "Cubos de pesca blanca marinados en leche de tigre de parchita, cebolla morada, cilantro, camote y canchita salada.",
    image: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=800&auto=format&fit=crop",
    isPopular: true,
    isRecommended: true
  },
  {
    id: "cev2",
    name: "Cóctel de Camarones Tropical",
    price: 16.00,
    category: "ceviches",
    categoryName: "Ceviches & Mar",
    description: "Camarones tiernos blanqueados en salsa golf de la casa con toques de tabasco, aguacate maduro y galletas saladas.",
    image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop"
  },
  {
    id: "cev3",
    name: "Salpicón de Mariscos Caribeño",
    price: 19.00,
    category: "ceviches",
    categoryName: "Ceviches & Mar",
    description: "Mezcla de pulpo, calamar y camarón con pimentones de colores, cebollín y vinagreta cítrica de jengibre.",
    image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop"
  },
  {
    id: "cev4",
    name: "Gran Tabla degustación de Ceviches",
    price: 30.00,
    category: "ceviches",
    categoryName: "Ceviches & Mar",
    description: "Trilogía gourmet: Ceviche clásico de robalo, ceviche cremoso de camarón y salpicón agridulce de mariscos.",
    image: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=800&auto=format&fit=crop",
    isRecommended: true
  },

  // CARNES Y AVES
  {
    id: "ca1",
    name: "Centro de Lomito al Gusto (300g)",
    price: 20.00,
    category: "carnes-aves",
    categoryName: "Carnes & Aves",
    description: "Corte magro de res a la parrilla con salsa de pimienta verde, champiñones o chimichurri casero.",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=800&auto=format&fit=crop",
    isPopular: true
  },
  {
    id: "ca2",
    name: "Suprema de Pollo Marinera",
    price: 22.00,
    category: "carnes-aves",
    categoryName: "Carnes & Aves",
    description: "Pechuga jugosa a la plancha coronada con camarones salteados en crema de vino blanco y queso derretido.",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop"
  },
  {
    id: "ca3",
    name: "Parrilla Mixta Mar y Tierra",
    price: 28.00,
    category: "carnes-aves",
    categoryName: "Carnes & Aves",
    description: "Combinación de lomito, pechuga de pollo, chorizo parrillero, tostones y queso a la plancha.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop",
    isRecommended: true
  },

  // ENTRADAS
  {
    id: "ent1",
    name: "Tequeños Artesanales (6 und)",
    price: 7.00,
    category: "entradas",
    categoryName: "Entradas & Tapas",
    description: "Deditos de queso blanco semiduro crujientes envueltos en masa hojaldrada casera con salsa tártara.",
    image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop",
    isPopular: true
  },
  {
    id: "ent2",
    name: "Camarones al Ajillo",
    price: 15.00,
    category: "entradas",
    categoryName: "Entradas & Tapas",
    description: "Camarones salteados en cazuela de barro con abundante ajo, guindilla suave y pan tostado al ajillo.",
    image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop"
  },
  {
    id: "ent3",
    name: "Pulpo a la Parrilla al Ajillo",
    price: 19.00,
    category: "entradas",
    categoryName: "Entradas & Tapas",
    description: "Tientas de pulpo tierno asadas al carbón marinadas con pimentón de la vera y aceite de oliva purísimo.",
    image: "https://images.unsplash.com/photo-1545247181-516773cae754?w=800&auto=format&fit=crop",
    isRecommended: true
  },

  // PASTAS
  {
    id: "pas1",
    name: "Pasta Mariscos al Óleo",
    price: 22.00,
    category: "pastas",
    categoryName: "Pastas de Autor",
    description: "Fettuccine fresco bañado en aceite de oliva perfumado con ajo, tomates cherry, vino blanco y mariscos.",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop",
    isPopular: true
  },
  {
    id: "pas2",
    name: "Pasta a la Carbonara Clásica",
    price: 16.00,
    category: "pastas",
    categoryName: "Pastas de Autor",
    description: "Spaghetti con guanciale crujiente, yemas de huevo fresco, queso pecorino romano y pimienta negra recién molida.",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&auto=format&fit=crop"
  },

  // POSTRES
  {
    id: "pos1",
    name: "Brownie Templado con Helado",
    price: 12.00,
    category: "postres",
    categoryName: "Postres Dulces",
    description: "Bizcocho denso de chocolate oscuro servido tibio con bola de helado de mantecado y sirope de chocolate.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop",
    isPopular: true
  },
  {
    id: "pos2",
    name: "Flan Cremoso de Coco",
    price: 6.00,
    category: "postres",
    categoryName: "Postres Dulces",
    description: "Receta tradicional con leche de coco natural y caramelo dorado bruñido.",
    image: "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=800&auto=format&fit=crop"
  },

  // CÓCTELES Y BEBIDAS
  {
    id: "coc1",
    name: "Aperol Spritz Premium",
    price: 7.00,
    category: "cocteles",
    categoryName: "Cócteles & Bar",
    description: "Aperol italiano, prosecco bien frío, soda y rodaja de naranja fresca sobre hielo cristalino.",
    image: "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=800&auto=format&fit=crop",
    isPopular: true
  },
  {
    id: "coc2",
    name: "Mojito Cubano Menta Fresca",
    price: 6.00,
    category: "cocteles",
    categoryName: "Cócteles & Bar",
    description: "Ron añejo blanco, menta macerada al instante, jugo de lima recién exprimido y soda burbujeante.",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop"
  },
  {
    id: "coc3",
    name: "Mocktail Laguna Fresh (Sin Alcohol)",
    price: 6.00,
    category: "cocteles",
    categoryName: "Cócteles & Bar",
    description: "Refrescante infusión de frutos azules, pulpa de parchita, hierbabuena y tónica helada.",
    image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800&auto=format&fit=crop"
  }
];
