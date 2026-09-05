export type PurchaseSource = 'web' | 'taquilla';
export type TicketStatus = 'valid' | 'used' | 'cancelled';
export type PoolStatus = 'open' | 'closed' | 'maintenance';
export type SaturationLevel = 'low' | 'medium' | 'high' | 'full';
export type BoatStatus = 'docked' | 'sailing' | 'maintenance';
export type LocationType = 'mesa' | 'kiosco' | 'toldo' | 'choza';
export type OrderStatus = 'pending' | 'preparing' | 'delivered' | 'paid';
export type ExpenseCategory = 'cloro_quimicos' | 'combustible_botes' | 'insumos_cocina' | 'reparaciones' | 'caja_chica' | 'otro';

export interface ParkTicket {
  id: string;
  establishment_id: number;
  ticket_code: string;
  guest_name: string;
  guest_email?: string;
  guest_phone?: string;
  adults_count: number;
  children_count: number;
  has_boat_ride: boolean;
  has_food_package: boolean;
  vip_access: boolean;
  purchase_source: PurchaseSource;
  price_usd: number;
  price_bs: number;
  status: TicketStatus;
  created_at: string;
  used_at?: string;
  used_by_staff?: string;
}

export interface ParkCapacity {
  id?: string;
  establishment_id: number;
  max_capacity: number;
  current_adults: number;
  current_children: number;
  updated_at?: string;
}

export interface ParkPool {
  id: string;
  establishment_id: number;
  pool_code: string;
  name: string;
  status: PoolStatus;
  bathers_count: number;
  max_capacity: number;
  saturation_level: SaturationLevel;
  lifeguard_name: string;
  updated_at?: string;
}

export interface ParkBoat {
  id: string;
  establishment_id: number;
  boat_code: string;
  name: string;
  status: BoatStatus;
  max_capacity: number;
  passengers_count: number;
  lifejackets_in_use: number;
  departure_time?: string;
  expected_return_time?: string;
  updated_at?: string;
}

export interface ParkOrderItem {
  id: string;
  name: string;
  quantity: number;
  unit_price_usd: number;
}

export interface ParkOrder {
  id: string;
  establishment_id: number;
  order_number: string;
  location_type: LocationType;
  location_identifier: string;
  customer_name: string;
  items: ParkOrderItem[];
  total_usd: number;
  total_bs: number;
  status: OrderStatus;
  created_at: string;
}

export interface ParkExpense {
  id: string;
  establishment_id: number;
  category: ExpenseCategory;
  description: string;
  amount_usd: number;
  amount_bs: number;
  receipt_url?: string;
  logged_by?: string;
  created_at: string;
}

export interface QRValidationResult {
  success: boolean;
  error_code?: 'NOT_FOUND' | 'ALREADY_USED' | 'CANCELLED' | 'UNKNOWN';
  message: string;
  used_at?: string;
  ticket?: ParkTicket;
}

export interface ParkKpiSummary {
  currentAdults: number;
  currentChildren: number;
  totalInPark: number;
  maxCapacity: number;
  occupancyPercentage: number;
  
  grossIncomeUsd: number;
  grossIncomeBs: number;
  incomeBreakdownUsd: {
    taquilla: number;
    restaurante: number;
    botes: number;
  };
  
  webTicketsCount: number;
  posTicketsCount: number;
  totalTicketsProcessed: number;
  
  totalExpensesUsd: number;
  totalExpensesBs: number;
  netBalanceUsd: number;
  netBalanceBs: number;
}

/**
 * Función Despachadora Condicional
 * Identifica si un establecimiento es un Complejo Turístico, Parque Acuático o Centro de Recreación.
 */
export function isTouristComplexOrWaterPark(est?: {
  id?: number;
  category_name?: string;
  category_slug?: string;
  slug?: string;
  name?: string;
  property_type?: string;
} | null): boolean {
  if (!est) return false;
  const combined = `${est.category_name || ''} ${est.category_slug || ''} ${est.slug || ''} ${est.name || ''} ${est.property_type || ''}`.toLowerCase();
  return (
    combined.includes("parque") ||
    combined.includes("complejo") ||
    combined.includes("acuatico") ||
    combined.includes("acuático") ||
    combined.includes("recreacion") ||
    combined.includes("recreación") ||
    combined.includes("mundo de los niños") ||
    combined.includes("waterpark") ||
    combined.includes("amusement")
  );
}
