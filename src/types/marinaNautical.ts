export type SlipStatus = 'vacant' | 'occupied' | 'reserved' | 'maintenance';
export type VesselType = 'yate' | 'velero' | 'catamaran' | 'lancha_rapida' | 'pesca_deportiva' | 'jetski' | 'houseboat';
export type FuelType = 'gasolina_marina' | 'diesel_marino';
export type DispatchStatus = 'en_muelle' | 'zarpe_aprobado' | 'navegando' | 'arribado' | 'varado';

export interface MarinaSlip {
  id: string;
  slip_code: string; // E.g. Muelle A-12
  dock_name: string;
  max_length_ft: number;
  draft_depth_m: number; // Calado
  status: SlipStatus;
  vessel_name?: string;
  owner_name?: string;
  daily_rate_usd: number;
  has_electricity_hookup: boolean;
  has_freshwater_hookup: boolean;
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
  tank_capacity_liters: number;
  current_level_liters: number;
  price_per_liter_usd: number;
  last_delivery_date: string;
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
