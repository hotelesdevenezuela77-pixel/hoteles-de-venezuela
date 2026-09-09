export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';
export type KitchenOrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'paid';
export type DishCategory = 'entradas' | 'principales' | 'bebidas' | 'cocteleria' | 'postres' | 'combos';

export interface RestaurantTable {
  id: string;
  table_number: string;
  zone: 'salon_principal' | 'terraza' | 'area_vip' | 'playa_toldo' | 'barra';
  capacity: number;
  status: TableStatus;
  current_guests?: number;
  server_name?: string;
  current_total_usd?: number;
  opened_at?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: DishCategory;
  price_usd: number;
  price_bs?: number;
  available: boolean;
  description?: string;
  image_url?: string;
}

export interface RestaurantOrder {
  id: string;
  establishment_id: number;
  order_number: string;
  table_number: string;
  customer_name: string;
  items: {
    menu_item_id: string;
    name: string;
    quantity: number;
    unit_price_usd: number;
    notes?: string;
  }[];
  total_usd: number;
  status: KitchenOrderStatus;
  created_at: string;
}

export interface TableReservation {
  id: string;
  establishment_id: number;
  guest_name: string;
  guest_phone: string;
  table_number: string;
  pax: number;
  reservation_time: string;
  status: 'confirmed' | 'seated' | 'cancelled';
  special_requests?: string;
}

export function isRestaurantOrGastronomy(est?: {
  id?: number;
  category_name?: string;
  category_slug?: string;
  slug?: string;
  name?: string;
  property_type?: string;
} | null): boolean {
  if (!est) return false;

  const catName = (est.category_name || '').toLowerCase();
  const catSlug = (est.category_slug || '').toLowerCase();
  const propType = (est.property_type || '').toLowerCase();
  const slug = (est.slug || '').toLowerCase();
  const name = (est.name || '').toLowerCase();

  const isExplicitRestaurant =
    catName.includes("restaurante") ||
    catName.includes("gastronom") ||
    catName.includes("beach club") ||
    catName.includes("cafeter") ||
    catName.includes("bar ") ||
    catName.endsWith("bar") ||
    catSlug.includes("restaurante") ||
    catSlug.includes("gastronomia") ||
    propType.includes("restaurant") ||
    propType.includes("gastronomia") ||
    slug.includes("restaurante") ||
    slug.includes("beach-club") ||
    name.includes("restaurante") ||
    name.includes("beach club");

  return Boolean(isExplicitRestaurant);
}
