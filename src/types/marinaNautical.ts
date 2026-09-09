export type SlipStatus = 'vacant' | 'occupied' | 'reserved' | 'maintenance';
export type VesselType = 'yate' | 'velero' | 'catamaran' | 'lancha_rapida' | 'pesca_deportiva' | 'jetski' | 'houseboat';
export type FuelType = 'gasolina_marina' | 'diesel_marino';
export type DispatchStatus = 'en_muelle' | 'zarpe_aprobado' | 'navegando' | 'arribado' | 'varado';
export type StorageType = 'wet_slip' | 'dry_stack' | 'varadero_yard' | 'rampa';

export interface MarinaSlip {
  id: string;
  slip_code: string; // E.g. Muelle A-12, Hangar Seco H-04
  dock_name: string;
  storage_type: StorageType;
  max_length_ft: number;
  max_beam_ft?: number;
  draft_depth_m: number; // Calado
  status: SlipStatus;
  vessel_name?: string;
  vessel_matricula?: string;
  vessel_type?: VesselType;
  owner_name?: string;
  owner_phone?: string;
  contract_type: 'transito_diario' | 'mensual' | 'anual_socio';
  daily_rate_usd: number;
  monthly_rate_usd?: number;
  has_electricity_hookup: boolean;
  electricity_voltage?: '110V' | '220V' | '380V_trifasico';
  has_freshwater_hookup: boolean;
  has_pumpout_service?: boolean;
  notes?: string;
}

export interface VaraderoServiceOrder {
  id: string;
  vessel_name: string;
  matricula: string;
  owner_name: string;
  service_type: 'travelift_haulout' | 'antifouling_paint' | 'pressure_wash' | 'naval_mechanic' | 'hull_polishing' | 'launch_rampa';
  service_name: string;
  scheduled_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  travelift_tonnage?: number;
  total_usd: number;
  technician_assigned: string;
}

export interface NauticalVessel {
  id: string;
  registration_number: string; // Matrícula
  name: string;
  vessel_type: VesselType;
  length_ft: number;
  beam_m: number;
  draft_m: number;
  captain_name: string;
  captain_phone: string;
  assigned_slip?: string;
}

export interface MarinaZarpeDispatch {
  id: string;
  establishment_id: number;
  dispatch_number: string;
  vessel_name: string;
  registration_number: string;
  captain_name: string;
  pax_count: number;
  destination_port: string;
  departure_time: string;
  estimated_return_time: string;
  status: DispatchStatus;
  capitania_clearance_code?: string;
  created_at: string;
}

export interface NauticalFuelSupply {
  id: string;
  fuel_type: FuelType;
  fuel_name: string;
  tank_capacity_liters: number;
  current_level_liters: number;
  price_per_liter_usd: number;
  last_delivery_date: string;
  dispensers_count: number;
}

export interface FuelDispatchLog {
  id: string;
  vessel_name: string;
  matricula: string;
  fuel_type: FuelType;
  liters_dispensed: number;
  price_per_liter_usd: number;
  total_usd: number;
  date_time: string;
  dock_dispenser: string;
  slip_code?: string;
}

export interface MarinaClubService {
  id: string;
  name: string;
  category: 'bunkering' | 'shipyard' | 'dockside' | 'clubhouse' | 'security';
  description: string;
  available: boolean;
  price_info: string;
}

export function isMarinaOrNauticalClub(est?: {
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

  const isExplicitMarina =
    catName.includes("marina") ||
    catName.includes("puerto deportivo") ||
    catName.includes("club náutico") ||
    catName.includes("club nautico") ||
    catName.includes("muelle") ||
    catSlug.includes("marina") ||
    catSlug.includes("puerto-deportivo") ||
    catSlug.includes("nautico") ||
    propType.includes("marina") ||
    propType.includes("nautico") ||
    slug.includes("marina") ||
    slug.includes("puerto") ||
    name.includes("marina") ||
    name.includes("club náutico") ||
    name.includes("club nautico");

  return Boolean(isExplicitMarina);
}
