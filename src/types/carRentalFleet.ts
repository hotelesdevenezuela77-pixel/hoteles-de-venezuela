export type VehicleCategory = 'economico' | 'sedan' | 'suv_4x4' | 'camioneta_pickup' | 'van_ejecutiva' | 'blindado';
export type VehicleStatus = 'disponible' | 'alquilado' | 'mantenimiento' | 'reservado';
export type RentalContractStatus = 'activo' | 'completado' | 'reservado' | 'cancelado';

export interface RentalVehicle {
  id: string;
  plate_number: string; // Placa
  make: string; // Marca
  model: string; // Modelo
  year: number;
  category: VehicleCategory;
  transmission: 'automatico' | 'sincronico';
  daily_rate_usd: number;
  status: VehicleStatus;
  mileage_km: number;
  fuel_level_fraction: number; // 0.0 to 1.0 (ej. 0.75 = 3/4 tanque)
  insurance_policy_number: string;
  image_url?: string;
  color?: string;
}

export interface RentalContract {
  id: string;
  contract_number: string;
  vehicle_id: string;
  vehicle_summary: string;
  customer_name: string;
  customer_id_document: string; // C.I. o Pasaporte
  customer_phone: string;
  start_date: string;
  end_date: string;
  days_count: number;
  total_usd: number;
  security_deposit_usd: number;
  initial_mileage_km: number;
  return_mileage_km?: number;
  initial_fuel_level: string;
  return_fuel_level?: string;
  status: RentalContractStatus;
  created_at: string;
}

export function isCarRentalOrFleet(est?: {
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

  const isExplicitCarRental =
    catName.includes("alquiler de carro") ||
    catName.includes("alquiler de auto") ||
    catName.includes("alquiler de vehículo") ||
    catName.includes("alquiler de vehiculo") ||
    catName.includes("rent a car") ||
    catName.includes("rent-a-car") ||
    catName.includes("rentacar") ||
    catSlug.includes("alquiler-carros") ||
    catSlug.includes("rent-a-car") ||
    propType.includes("car_rental") ||
    slug.includes("rent-a-car") ||
    slug.includes("alquiler-carros") ||
    name.includes("rent a car") ||
    name.includes("alquiler de carros") ||
    name.includes("rentacar");

  return Boolean(isExplicitCarRental);
}
