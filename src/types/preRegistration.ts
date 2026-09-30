/**
 * Tipos y Esquemas Oficiales para la Zona de Pre-Registro (Ficha Pública HDV)
 * Especificación V13 - Hoteles de Venezuela
 */

export interface PreRegistrationBadgeFlags {
  has_power_plant: boolean; // Planta eléctrica 24/7 (Full Power)
  has_water_247: boolean;   // Tanque de Agua continuo
  has_starlink: boolean;    // Conexión Starlink / Satelital
  is_pet_friendly: boolean; // Admisión de mascotas
  has_hdv_seal: boolean;    // Sello de Garantía Legal HDV
}

export interface PreRegistrationPayload {
  // 1. Categoría Principal
  service_category_id: number;
  subcategory_id: number;
  category_name?: string;

  // 2. Nombre de la Propiedad / Establecimiento
  title: string;
  slug?: string;

  // 3. Ubicación / Destino
  destination_name: string; // ej. Morrocoy, Canaima, Los Roques, Margarita, Mérida
  state: string;
  city: string;

  // 4. Insignias / Badges destacados de la tarjeta
  badges: PreRegistrationBadgeFlags;

  // 5. Calificación / Rating
  rating_avg: number; // ej. 4.8 / 5.0

  // 6. Pills / Etiquetas secundarias de servicios clave
  key_service_pills: string[]; // ej. ["Muelle privado", "Lanchas propias", "Gastronomía de mar", "Excursiones", "Confort", "Transporte"]

  // 7. Extracto / Breve descripción comercial (máx 2-3 líneas)
  short_description: string;

  // 8. Precio base visible ("Desde $X / noche")
  base_price_from: number;

  // 9. Botones de acción directos & Media
  whatsapp_number: string;
  primary_image?: string;
  gallery_images?: string[];
}

export type OnboardingStatus = 'PRE_REGISTERED' | 'ONBOARDING_IN_PROGRESS' | 'COMPLETED';
