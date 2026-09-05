export type ServiceType = 
  | 'hospedaje'
  | 'transporte_terrestre'
  | 'lancha_maritimo'
  | 'vuelo_charter'
  | 'guia'
  | 'alimentacion'
  | 'entradas_parque';

export type QuoteStatus = 'draft' | 'confirmed' | 'paid_in_full' | 'completed' | 'cancelled';
export type SupplierCategory = 'posada_hotel' | 'transporte' | 'lanchero' | 'guia' | 'restaurante' | 'charter';
export type ExpenseCategory = 'combustible' | 'propinas' | 'entradas_parques' | 'snacks_hidratacion' | 'peajes' | 'imprevistos';

export interface PackageServiceItem {
  id: string;
  package_id?: string;
  service_type: ServiceType;
  provider_name: string;
  description: string;
  net_cost_usd: number;
}

export interface AgencyPackage {
  id: string;
  establishment_id: number;
  title: string;
  destination: string;
  duration_days: number;
  duration_nights: number;
  net_cost_usd: number;
  markup_percentage: number;
  price_per_person_usd: number;
  price_per_person_bs: number;
  min_passengers: number;
  inclusions: string[];
  exclusions: string[];
  services?: PackageServiceItem[];
  status: 'active' | 'draft' | 'archived';
  created_at?: string;
}

export interface AgencyQuote {
  id: string;
  establishment_id: number;
  quote_number: string;
  client_name: string;
  client_email?: string;
  client_phone: string;
  package_id?: string;
  package_title: string;
  travel_start_date: string;
  travel_end_date: string;
  adults_count: number;
  children_count: number;
  total_sale_usd: number;
  total_sale_bs: number;
  deposit_paid_usd: number;
  remaining_balance_usd: number;
  payment_deadline?: string;
  status: QuoteStatus;
  created_at: string;
}

export interface AgencyPassenger {
  id: string;
  quote_id: string;
  full_name: string;
  document_type: string;
  document_number: string;
  birth_date?: string;
  nationality?: string;
  dietary_restrictions?: string;
  medical_conditions?: string;
  emergency_contact?: string;
}

export interface AgencyItineraryDay {
  id: string;
  quote_id: string;
  day_number: number;
  time_schedule: string;
  title: string;
  description: string;
  location_name?: string;
  outfit_recommendations?: string;
}

export interface SupplierPayment {
  id: string;
  establishment_id: number;
  quote_id: string;
  quote_number?: string;
  provider_name: string;
  service_category: SupplierCategory;
  amount_usd: number;
  amount_bs: number;
  payment_deadline: string;
  status: 'pending' | 'paid';
  paid_at?: string;
  bank_reference?: string;
  receipt_url?: string;
}

export interface ExpeditionExpense {
  id: string;
  establishment_id: number;
  quote_id?: string;
  description: string;
  category: ExpenseCategory;
  amount_usd: number;
  amount_bs: number;
  logged_by?: string;
  created_at: string;
}

export interface AgencyKpiSummary {
  monthlyGrossSalesUsd: number;
  monthlyGrossSalesBs: number;
  monthlyNetMarginUsd: number;
  monthlyNetMarginBs: number;
  averageMarkupPercentage: number;

  activeTravelersInRoute: number;
  departuresNext48h: number;

  quotesCountDraft: number;
  quotesCountConfirmed: number;
  quotesCountPaidFull: number;

  pendingSupplierPayablesUsd: number;
  pendingSupplierPayablesBs: number;
  urgentDeadlinesCount: number; // Pagos vencen < 72h
}

/**
 * Evaluador Condicional Despachador para Agencias de Viajes, Tour Operadores y DMCs
 */
export function isTravelAgencyOrTourOperator(est?: {
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
    combined.includes("agencia") ||
    combined.includes("agencia_viajes") ||
    combined.includes("tour") ||
    combined.includes("operador") ||
    combined.includes("dmc") ||
    combined.includes("expedicion") ||
    combined.includes("expedición") ||
    combined.includes("charter") ||
    combined.includes("travel")
  );
}
