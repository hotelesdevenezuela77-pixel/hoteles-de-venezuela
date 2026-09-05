export type PointType = 
  | 'spot_fotografico'
  | 'gasolinera'
  | 'mirador'
  | 'posada'
  | 'restaurante'
  | 'alerta_vial'
  | 'sendero_offroad';

export type DealType = 'monetario' | 'canje' | 'mixto';
export type DealStatus = 'pautado' | 'en_produccion' | 'por_cobrar' | 'liquidado';
export type PlatformType = 'instagram_reel' | 'tiktok' | 'instagram_stories' | 'hdv_review' | 'youtube_video' | 'blog_article';
export type TaskStatus = 'todo' | 'editing' | 'review' | 'published';
export type RouteExpenseCategory = 'combustible' | 'peajes' | 'lancheros' | 'comidas' | 'reparaciones' | 'propinas' | 'otros';

export interface CreatorExpedition {
  id: string;
  establishment_id: number;
  title: string;
  destination: string;
  km_distance: number;
  start_date: string;
  end_date: string;
  total_budget_usd?: number;
  status: 'active' | 'completed' | 'archived';
  created_at?: string;
}

export interface CreatorWaypoint {
  id: string;
  expedition_id: string;
  latitude: number;
  longitude: number;
  altitude_meters: number;
  point_type: PointType;
  title: string;
  description?: string;
  photo_url?: string;
  created_at?: string;
}

export interface CreatorDeliverable {
  id: string;
  deal_id: string;
  title: string;
  platform: PlatformType;
  due_date: string;
  status: 'pending' | 'delivered';
  link_url?: string;
}

export interface CreatorDeal {
  id: string;
  establishment_id: number;
  brand_name: string;
  deal_type: DealType;
  monetary_usd: number;
  barter_value_usd: number;
  status: DealStatus;
  notes?: string;
  deliverables?: CreatorDeliverable[];
  created_at?: string;
}

export interface CreatorRouteExpense {
  id: string;
  establishment_id: number;
  expedition_id?: string;
  description: string;
  category: RouteExpenseCategory;
  amount_usd: number;
  amount_bs: number;
  logged_by?: string;
  receipt_url?: string;
  created_at?: string;
}

export interface CreatorEditorialTask {
  id: string;
  establishment_id: number;
  task_name: string;
  platform: PlatformType | string;
  due_date: string;
  status: TaskStatus;
  position_order: number;
  created_at?: string;
}

export interface CreatorEstablishmentAudit {
  id: string;
  establishment_id: number;
  visited_establishment_name: string;
  wifi_speed_mbps: number;
  water_pressure_status: 'excelente' | 'aceptable' | 'deficiente';
  power_generator_status: 'si_automatica' | 'si_manual' | 'no_tiene';
  water_well_status: 'si_pozo_propio' | 'tanque_reserva' | 'no_tiene';
  overall_score: number;
  notes?: string;
  created_at?: string;
}

export interface CreatorKpiSummary {
  expeditionIncomeUsd: number;
  expeditionIncomeBs: number;
  expeditionExpensesUsd: number;
  expeditionExpensesBs: number;
  netExpeditionMarginUsd: number;
  netExpeditionMarginBs: number;

  totalKmTraveled: number;
  totalWaypointsCount: number;

  activeDealsCount: number;
  pendingCollectUsd: number;

  pendingDeliverablesCount: number;
  urgentDeliverablesCount: number;
}

/**
 * Evaluador Condicional Despachador para Creadores de Contenido e Influencers
 */
export function isCreatorOrInfluencer(est?: {
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
    combined.includes("creador") ||
    combined.includes("influencer") ||
    combined.includes("viajero") ||
    combined.includes("embajador") ||
    combined.includes("contenido") ||
    combined.includes("media") ||
    combined.includes("blog") ||
    combined.includes("nomad")
  );
}
