export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories: Category[] = [
  { id: 'all', name: 'Todos', icon: 'home' },
  { id: 'bebidas', name: 'Bebidas', icon: 'wine' },
  { id: 'cocteles', name: 'Cócteles', icon: 'cocktail' },
  { id: 'entradas', name: 'Entradas', icon: 'utensils' },
  { id: 'platos', name: 'Platos Principales', icon: 'fish' },
  { id: 'postres', name: 'Postres', icon: 'cake' },
];

export const menuItems: MenuItem[] = [
  // Bebidas
  { id: 'b1', name: 'Polar Lata 355ml', price: 3.50, category: 'bebidas' },
  { id: 'b2', name: 'Agua Mineral 355ml', price: 2.00, category: 'bebidas' },
  { id: 'b3', name: 'Agua Soda SPRK 355ml', price: 3.00, category: 'bebidas' },
  { id: 'b4', name: '7UP Lata 355ml', price: 3.50, category: 'bebidas' },
  { id: 'b5', name: 'Pepsi Lata 355ml', price: 3.50, category: 'bebidas' },
  { id: 'b6', name: 'Nestea Frappe', price: 3.00, category: 'bebidas' },
  { id: 'b7', name: 'Jugo Natural (Melón, Lechosa, Piña)', price: 3.00, category: 'bebidas' },
  { id: 'b8', name: 'Limonada y Parchita', price: 5.00, category: 'bebidas' },
  { id: 'b9', name: 'Batidos (Melocotón, Fresas)', price: 5.00, category: 'bebidas' },
  
  // Cócteles
  { id: 'c1', name: 'Chelada', price: 4.00, category: 'cocteles' },
  { id: 'c2', name: 'Caipiriña', price: 5.00, category: 'cocteles' },
  { id: 'c3', name: 'Mojitos', price: 5.00, category: 'cocteles' },
  { id: 'c4', name: 'Copa de Verano', price: 6.00, category: 'cocteles' },
  { id: 'c5', name: 'Aperol Spritz', price: 7.00, category: 'cocteles' },
  { id: 'c6', name: 'Margarita', price: 6.00, category: 'cocteles' },
  { id: 'c7', name: 'Daiquiri', price: 5.00, category: 'cocteles' },
  { id: 'c8', name: 'Cuba Libre', price: 5.00, category: 'cocteles' },
  { id: 'c9', name: 'Kaipiroca', price: 6.00, category: 'cocteles' },
  { id: 'c10', name: 'Laguna Beach', price: 6.00, category: 'cocteles' },
  { id: 'c11', name: 'Mocktail Laguna Fresh', price: 6.00, category: 'cocteles' },
  { id: 'c12', name: 'Gin Tonic Vodka Importado', price: 10.00, category: 'cocteles' },
  { id: 'c13', name: 'Gin Tonic Vodka Nacional', price: 6.00, category: 'cocteles' },
  
  // Entradas
  { id: 'e1', name: 'Arepa Rellena de Queso', price: 3.00, category: 'entradas' },
  { id: 'e2', name: 'Ración Arepitas', price: 2.00, category: 'entradas' },
  { id: 'e3', name: 'Casabe Gratinado', price: 4.00, category: 'entradas' },
  { id: 'e4', name: 'Pan al Ajillo', price: 4.00, category: 'entradas' },
  { id: 'e5', name: 'Tequeños', price: 10.50, category: 'entradas' },
  { id: 'e6', name: 'Croquetas de Pescado', price: 10.50, category: 'entradas' },
  { id: 'e7', name: 'Media Tabla de Ceviche', price: 30.00, category: 'entradas' },
  { id: 'e8', name: 'Tender de Pollo', price: 12.00, category: 'entradas' },
  { id: 'e9', name: 'Queso a la Plancha', price: 6.00, category: 'entradas' },
  { id: 'e10', name: 'Queso Crema', price: 6.00, category: 'entradas' },
  
  // Platos Principales
  { id: 'p1', name: 'Ceviche Clásico', price: 24.00, category: 'platos' },
  { id: 'p2', name: 'Ceviche Cóctel de Camarones', price: 24.00, category: 'platos' },
  { id: 'p3', name: 'Ceviche Cremoso de Camarón', price: 24.00, category: 'platos' },
  { id: 'p4', name: 'Ceviche Salpicón de Mariscos', price: 24.00, category: 'platos' },
  { id: 'p5', name: 'Ceviche Tabla de Ceviches', price: 50.00, category: 'platos' },
  { id: 'p6', name: 'Camarón con Champiñones', price: 25.00, category: 'platos' },
  { id: 'p7', name: 'Centro de Lomito al Gusto', price: 28.00, category: 'platos' },
  { id: 'p8', name: 'Caldeirada con Mero y Mariscos', price: 42.00, category: 'platos' },
  { id: 'p9', name: 'Chupe de Camarones', price: 13.00, category: 'platos' },
  { id: 'p10', name: 'Churrasco de Pesca Blanca', price: 35.00, category: 'platos' },
  { id: 'p11', name: 'Filet de Robalo a la Romana', price: 28.00, category: 'platos' },
  { id: 'p12', name: 'Hamburguesa de Carne', price: 15.00, category: 'platos' },
  { id: 'p13', name: 'Hamburguesa de Pollo', price: 15.00, category: 'platos' },
  { id: 'p14', name: 'Lata Caribeña', price: 4.00, category: 'platos' },
  { id: 'p15', name: 'Lomito al Pescador', price: 30.00, category: 'platos' },
  { id: 'p16', name: 'Lomo Robalo al Ajillo', price: 35.00, category: 'platos' },
  { id: 'p17', name: 'Milanesa de Pollo', price: 22.00, category: 'platos' },
  { id: 'p18', name: 'Parrilla de Mar y Tierra', price: 35.00, category: 'platos' },
  { id: 'p19', name: 'Parrilla de Mariscos', price: 36.00, category: 'platos' },
  { id: 'p20', name: 'Pesca del Día al Ajillo', price: 35.00, category: 'platos' },
  { id: 'p21', name: 'Pescado Frito Playero', price: 23.50, category: 'platos' },
  { id: 'p22', name: 'Pasta Carbonara', price: 16.00, category: 'platos' },
  { id: 'p23', name: 'Pasta Mariscos al Óleo', price: 22.00, category: 'platos' },
  { id: 'p24', name: 'Pasta Ragú', price: 26.00, category: 'platos' },
  { id: 'p25', name: 'Pasta a la Boloña', price: 16.00, category: 'platos' },
  { id: 'p26', name: 'Risotto de Camarón', price: 26.00, category: 'platos' },
  { id: 'p27', name: 'Salteado de Mariscos', price: 31.00, category: 'platos' },
  
  // Ensaladas
  { id: 's1', name: 'Ensalada Capresa', price: 15.00, category: 'entradas' },
  { id: 's2', name: 'Ensalada César Clásica', price: 12.00, category: 'entradas' },
  { id: 's3', name: 'Ensalada César con Camarón', price: 20.00, category: 'entradas' },
  { id: 's4', name: 'Ensalada César con Pollo', price: 16.00, category: 'entradas' },
  { id: 's5', name: 'Ensalada Mixta', price: 12.00, category: 'entradas' },
  
  // Postres
  { id: 'd1', name: 'Brownie con Helado', price: 12.00, category: 'postres' },
  { id: 'd2', name: 'Cocada', price: 5.00, category: 'postres' },
  { id: 'd3', name: 'Flan de Coco', price: 6.00, category: 'postres' },
];

export const zones = [
  { id: 'patio', name: 'Patio Central', tables: 6 },
  { id: 'pergolas', name: 'Pérgolas', tables: 8 },
  { id: 'vip', name: 'VIP', tables: 4 },
];
