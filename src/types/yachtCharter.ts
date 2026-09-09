export interface CharterVessel {
  id: string;
  name: string;
  type: 'yacht_flybridge' | 'sport_yacht' | 'catamaran' | 'speedboat' | 'sailboat' | 'pontoon' | 'houseboat';
  typeName: string;
  matricula: string;
  lengthFt: number;
  maxPassengers: number;
  cabins: number;
  bathrooms: number;
  engines: string;
  cruisingSpeedKnots: number;
  baseMarina: string;
  status: 'available' | 'sailing' | 'maintenance' | 'booked';
  statusLabel: string;
  hourlyRateUsd: number;
  fullDayRateUsd: number;
  overnightRateUsd?: number;
  captainIncluded: boolean;
  crewCount: number;
  imageUrl: string;
  amenities: string[];
  waterToys: string[];
}

export interface CharterBooking {
  id: string;
  bookingCode: string;
  vesselId: string;
  vesselName: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  date: string;
  departureTime: string;
  returnTime: string;
  charterType: 'hours' | 'full_day' | 'sunset' | 'overnight' | 'event';
  charterTypeLabel: string;
  destinationRoute: string;
  passengerCount: number;
  captainName: string;
  sailorName?: string;
  totalUsd: number;
  advanceDepositUsd: number;
  securityDepositUsd: number;
  paymentStatus: 'paid' | 'partial' | 'pending';
  zarpeStatus: 'draft' | 'requested' | 'approved' | 'in_route' | 'completed';
  passengersList: {
    fullName: string;
    docId: string;
    age: number;
    phone?: string;
  }[];
  cateringNotes?: string;
}

export interface CharterRoute {
  id: string;
  name: string;
  region: string;
  durationHours: number;
  highlights: string[];
  fuelConsumptionEstGal: number;
  recommendedVesselTypes: string[];
}

export interface CharterCrewMember {
  id: string;
  fullName: string;
  role: 'captain' | 'sailor' | 'chef' | 'hostess' | 'mechanic';
  roleLabel: string;
  licenseNumber: string;
  phone: string;
  status: 'active' | 'on_route' | 'off_duty';
  assignedVesselName?: string;
  experienceYears: number;
}

export function isYachtCharterOrBoatRental(est?: {
  category_name?: string;
  category_slug?: string;
  slug?: string;
  name?: string;
  property_type?: string;
} | null): boolean {
  if (!est) return false;

  const rawText = [
    est.category_name,
    est.category_slug,
    est.slug,
    est.name,
    est.property_type
  ].filter(Boolean).join(" ").toLowerCase().trim();

  // Excluir si es explícitamente una marina o club náutico de amarre fijo
  if (
    rawText.includes("marina seca") ||
    rawText.includes("club nautico") ||
    rawText.includes("club náutico") ||
    rawText.includes("pantalanes")
  ) {
    // Si además tiene explícitamente alquiler o charter, dejarlo pasar
    if (!rawText.includes("alquiler") && !rawText.includes("charter") && !rawText.includes("renta")) {
      return false;
    }
  }

  const yachtCharterMatches = [
    "alquiler de yates",
    "alquiler de barcos",
    "alquiler de lanchas",
    "yacht charter",
    "charter nautico",
    "charter náutico",
    "embarcaciones turisticas",
    "embarcaciones turísticas",
    "paseos en lancha",
    "paseos en yate",
    "tours en barco",
    "renta de lanchas",
    "renta de yates",
    "c00.1.15",
    "barcos (veleros, yates, catamaranes o houseboats)"
  ];

  return yachtCharterMatches.some(term => rawText.includes(term));
}
