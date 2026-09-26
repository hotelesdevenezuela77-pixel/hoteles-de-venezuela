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

export type ExpeditionPaymentStatus = 'pendiente' | 'aprobado' | 'liquidado';
export type ExpeditionPaymentMethod = 'pago_movil' | 'zelle' | 'efectivo' | 'transferencia' | 'binance_usdt';

export interface ViaticosBreakdown {
  combustible?: number;
  comidas?: number;
  hospedaje?: number;
  peajes?: number;
  guias_lancheros?: number;
  otros?: number;
}

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

  // Remuneración de Viajes (Honorarios $20 USD + Viáticos)
  base_fee_usd: number; // Por defecto $20.00 USD
  viaticos_usd: number; // Suma total de viáticos
  viaticos_breakdown?: ViaticosBreakdown;
  total_remuneration_usd: number; // base_fee_usd + viaticos_usd
  payment_status: ExpeditionPaymentStatus;
  payment_method?: ExpeditionPaymentMethod;
  payment_reference?: string;
  payment_date?: string;
  notes?: string;
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

  // Remuneraciones por Viaje ($20 Honorarios + Viáticos)
  totalTripsCount: number;
  totalBaseFeesUsd: number; // N viajes × $20
  totalBaseFeesBs: number;
  totalViaticosUsd: number;
  totalViaticosBs: number;
  totalRemunerationUsd: number; // Honorarios + Viáticos
  totalRemunerationBs: number;
  liquidatedRemunerationUsd: number;
  pendingRemunerationUsd: number;
}

export type PeriodType = 'dias' | 'semanas' | 'mes';
export type AuthorizationStatus = 'habilitado' | 'programado' | 'en_curso' | 'completado' | 'pausado';

export interface InfluencerTravelAuthorization {
  id: string;
  influencer_id: number;
  influencer_name: string;
  influencer_handle?: string;
  influencer_avatar?: string;
  period_type: PeriodType;
  title: string;
  assigned_month?: string; // Ej: "Octubre 2026"
  assigned_week?: string; // Ej: "Semana 42 (19-25 Oct)"
  start_date: string;
  end_date: string;
  allowed_days_count: number;
  destination_target: string;
  authorized_trips_count: number;
  fee_per_trip_usd: number; // $20.00 USD
  total_honorarios_usd: number; // authorized_trips_count * fee_per_trip_usd
  approved_viaticos_budget_usd: number;
  viaticos_budget_breakdown?: ViaticosBreakdown;
  status: AuthorizationStatus;
  enabled_by_admin: boolean;
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InfluencerProfileSummary {
  id: number;
  name: string;
  handle: string;
  email: string;
  category: string;
  destination: string;
  avatar_url: string;
  bio: string;
  status: 'active' | 'inactive';
  honorarios_rate_usd: number; // $20.00
  total_expeditions_completed: number;
  total_authorizations_active: number;
  total_paid_usd: number;
  total_pending_usd: number;
}

export type EstablishmentCategoryType = 
  | 'hoteles_posadas'
  | 'restaurantes_gastronomia'
  | 'marinas_yates'
  | 'rent_a_car'
  | 'parques_complejos'
  | 'agencias_viajes'
  | 'sitios_turisticos'
  | 'otros';

export interface CreatorVisitedEstablishment {
  id: string;
  establishment_id: number;
  name: string;
  destination: string;
  category: EstablishmentCategoryType;
  category_label: string;
  visit_date: string;
  status: 'auditado' | 'en_ruta' | 'pautado' | 'por_visitar';
  rating: number; // 1 to 10
  is_recommended: boolean;
  
  // Auditoría técnica para nómadas y viajeros
  wifi_speed_mbps: number;
  power_generator: 'si_automatica' | 'si_manual' | 'no_tiene';
  water_supply: 'si_pozo_propio' | 'tanque_reserva' | 'no_tiene';
  water_pressure: 'excelente' | 'aceptable' | 'deficiente';
  
  // Cobertura mediática
  coverage_types?: ('instagram_reel' | 'tiktok' | 'youtube' | 'hdv_review' | 'fotos_4k')[];
  social_link?: string;
  hdv_slug?: string;
  deal_type?: DealType;
  deal_value_usd?: number;
  
  photos?: string[];
  cover_image?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  created_at?: string;
}

export interface CreatorProfileInfo {
  name: string;
  headline: string;
  avatar_url: string;
  banner_url?: string;
  bio: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  phone?: string;
  gear_equipment?: string;
  location?: string;
}

export interface CreatorGalleryItem {
  id: string;
  photo_url: string;
  title: string;
  caption?: string;
  tag?: 'drone' | 'gastronomia' | 'hospedaje' | '4x4' | 'paisaje' | 'detras_camara' | 'general';
  taken_at?: string;
  latitude?: number;
  longitude?: number;
}

export interface CreatorGalleryAlbum {
  id: string;
  establishment_id: number;
  title: string;
  destination: string;
  trip_date: string;
  cover_url: string;
  notes_for_future_trips?: string;
  best_lighting_hours?: string;
  local_contacts?: string;
  tags?: string[];
  photos: CreatorGalleryItem[];
  created_at?: string;
}

export type QuoteStatus = 'borrador' | 'enviada' | 'aprobada' | 'cobrada' | 'rechazada';

export interface CreatorQuoteItem {
  id: string;
  service_name: string;
  description?: string;
  quantity: number;
  unit_price_usd: number;
  total_usd: number;
}

export interface CreatorQuote {
  id: string;
  establishment_id: number;
  quote_number: string; // ej: "COT-2026-001"
  client_name: string;
  client_contact?: string;
  destination_target?: string;
  created_date: string;
  valid_until_date: string;
  items: CreatorQuoteItem[];
  subtotal_usd: number;
  discount_usd: number;
  total_usd: number;
  total_bs: number;
  status: QuoteStatus;
  notes?: string;
  converted_to_deal?: boolean;
  created_at?: string;
}

export interface CreatorMembershipProfile {
  tier_name: string;
  tier_badge: string;
  status: 'active' | 'pending_renewal' | 'expired';
  member_since: string;
  valid_thru: string;
  qr_code_token: string;
  benefits: string[];
  press_card_number: string;
}

export function isCreatorOrInfluencer(est?: {
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

  // 1. Verificación explícita de categoría o tipo de propiedad especializado
  const isExplicitCreatorCategory =
    catName.includes("creadores de contenido") ||
    catName.includes("creador de contenido") ||
    catName.includes("influencers") ||
    catName.includes("influencer") ||
    catSlug === "creadores-de-contenido" ||
    catSlug === "influencers" ||
    propType === "creador_contenido" ||
    propType === "influencer";

  if (isExplicitCreatorCategory) return true;

  // 2. Verificación por slug/nombre de creadores conocidos
  const isKnownCreator =
    slug.includes("aura-croce") ||
    slug.includes("viajera-creadora") ||
    name.includes("aura croce") ||
    (name.includes("creadora de contenido") || name.includes("creador de contenido"));

  return isKnownCreator;
}


