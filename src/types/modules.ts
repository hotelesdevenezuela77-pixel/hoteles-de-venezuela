export interface ICalSyncConfig {
  id: string;
  establishment_id: number;
  room_id: number;
  sync_url: string;
  sync_name: string;
  direction: 'import' | 'export' | 'both';
  last_synced_at: string | null;
  created_at: string;
}

export interface ICalSyncLog {
  id: string;
  config_id: string;
  status: 'success' | 'failed';
  error_message: string | null;
  items_processed: number;
  created_at: string;
}

export interface Vehicle {
  id: string;
  establishment_id: number | null;
  name: string;
  type: string;
  capacity: number;
  price_per_km: number;
  base_price: number;
  driver_name: string | null;
  whatsapp_contact: string;
  primary_image: string | null;
  is_active: boolean;
}

export interface TransferBooking {
  id: string;
  user_id: string | null;
  vehicle_id: string | null;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  passengers_count: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_price: number;
  whatsapp_contact: string | null;
}

export interface Experience {
  id: string;
  provider_id: string;
  name: string;
  category: string;
  description: string;
  duration_hours: number;
  price_per_person: number;
  location: string;
  highlights: string[];
  included: string[];
  requirements: string | null;
  main_image: string | null;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
}

export interface KYCVerification {
  id: string;
  user_id: string;
  document_type: 'passport' | 'dni' | 'driver_license';
  document_number: string;
  document_image_url: string;
  selfie_image_url: string;
  status: 'pending' | 'approved' | 'rejected';
  verified_at: string | null;
  verifier_id: string | null;
  notes: string | null;
}

export interface RouteWeatherAlert {
  id: string;
  title: string;
  type: 'weather' | 'road_status';
  severity: 'info' | 'warning' | 'danger';
  description: string;
  affected_area: string;
  status: 'active' | 'resolved';
  expires_at: string | null;
  created_at: string;
}

export interface LoyaltyProfile {
  user_id: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  updated_at: string;
}

export interface LastMinuteCoupon {
  id: string;
  establishment_id: number;
  code: string;
  discount_percent: number;
  max_uses: number;
  current_uses: number;
  expires_at: string;
  is_active: boolean;
}

export interface DynamicPricingRule {
  id: string;
  establishment_id: number;
  room_id: number;
  base_price: number;
  demand_factor: number;
  rules_config: {
    occupancy_threshold?: number;
    increase_percent?: number;
    last_minute_discount_hours?: number;
    last_minute_discount_percent?: number;
  };
  is_active: boolean;
}
