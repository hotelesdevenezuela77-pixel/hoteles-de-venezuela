/**
 * Tipos Canónicos de Características e Infraestructura (C00 a C11)
 * Plataforma: Hoteles de Venezuela (HDV)
 * Mapeo oficial contra esquema JSONB properties.features
 */

export interface PropertyFeaturesCanonical {
  general: PropertyGeneralFeatures;
  address: PropertyAddressFeatures;
  contact: PropertyContactFeatures;
  infrastructure: PropertyInfrastructureFeatures;
  services_and_experiences: PropertyServicesAndExperiencesFeatures;
  payment_methods: PropertyPaymentMethodsFeatures;
  booking_conditions: PropertyBookingConditionsFeatures;
  category_specific_tags: PropertyCategorySpecificTagsFeatures;
}

export interface PropertyGeneralFeatures {
  trade_name: string;
  boat_name?: string | null;
  tourism_license: string;
  website_url?: string | null;
  social_media?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
  commercial_description: string;
  construction_year?: number;
  renovation_year?: number;
  capacity: {
    total_guest_places: number;
    total_rooms?: number | null;
    total_housing_units?: number | null;
    max_diners?: number | null;
  };
  official_ratings_and_awards?: {
    hotel_stars?: number | null;
    michelin_keys?: number | null;
    hostel_stars?: number | null;
    posada_stars?: number | null;
    rural_stars?: number | null;
    repsol_suns?: number | null;
    camping_category?: number | null;
    llaves?: number | null;
    tenedores_oficiales?: number | null;
    michelin_stars?: number | null;
    green_star_michelin?: boolean;
  };
  sustainability_and_certifications?: {
    sustainability_certified?: boolean;
    excellence_circuit?: boolean;
    green_key?: boolean;
    eco_label?: boolean;
    qualidog?: boolean;
    accueil_velo?: boolean;
    tourism_and_disability?: boolean;
    fishing_certified?: boolean;
    hdv_legal_guarantee_seal?: boolean;
  };
  surroundings?: {
    sea?: boolean;
    countryside?: boolean;
    forest?: boolean;
    mountain?: boolean;
    river_or_lake?: boolean;
    urban?: boolean;
    llanos?: boolean;
    savanna?: boolean;
    desert?: boolean;
  };
  points_of_interest?: Array<{
    type_code: string;
    type_label: string;
    place_name: string;
    distance_time: string;
  }>;
}

export interface PropertyAddressFeatures {
  property_location: {
    street_type: string;
    street_name: string;
    number?: string;
    portal?: string | null;
    block?: string | null;
    staircase?: string | null;
    floor_level?: string | null;
    door?: string | null;
    building_type?: string;
    building_name?: string | null;
    sector_urbanization: string;
    parish: string;
    municipality: string;
    city_locality: string;
    state: string;
    province?: string | null;
    country: string;
    postal_code: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    access_instructions?: string;
  };
  marina_or_boat_location?: {
    marina_club_name?: string | null;
    dock_pier_number?: string | null;
    berth_slip_number?: string | null;
    meeting_point_instructions?: string | null;
  };
  fiscal_data: {
    company_legal_name: string;
    owner_name: string;
    tax_id_rif_nif: string;
    billing_email: string;
    fiscal_address?: {
      street_type: string;
      street_name: string;
      number?: string;
      city: string;
      state: string;
      country: string;
      postal_code: string;
    };
  };
}

export interface PropertyContactFeatures {
  hdv_operational: {
    contact_person_name: string;
    contact_person_role: string;
    phone: string;
    business_hours: string;
    email: string;
    whatsapp: string;
  };
  customer_facing: {
    contact_person_name: string;
    contact_person_role: string;
    reception_emergency_phone: string;
    service_hours: string;
    reservations_email: string;
    whatsapp: string;
  };
}

export interface PropertyInfrastructureFeatures {
  wellness_health_relax?: {
    outdoor_pool?: boolean;
    indoor_heated_pool?: boolean;
    spa?: boolean;
    sauna?: boolean;
    turkish_bath_hammam?: boolean;
    gym?: boolean;
    yoga_zone?: boolean;
    solarium?: boolean;
  };
  leisure_and_social_spaces?: {
    common_tv_lounge?: boolean;
    game_room?: boolean;
    library?: boolean;
    bbq_zone?: boolean;
    children_playground?: boolean;
    garden?: boolean;
    water_park?: boolean;
    water_slides?: boolean;
    sports_fields?: boolean;
    tennis_courts?: boolean;
    ping_pong?: boolean;
    minigolf?: boolean;
    educational_farm?: boolean;
    bowling?: boolean;
    fitness_area?: boolean;
    direct_beach_access?: boolean;
    seafront_adjacent?: boolean;
  };
  business_and_events?: {
    meeting_rooms?: boolean;
    printer_scanner?: boolean;
    auditorium_events_hall?: boolean;
    coworking_zones?: boolean;
  };
  resilience_supplies?: {
    generator_24_7_full_power: boolean;
    continuous_water_tank: boolean;
  };
  accessibility_and_security?: {
    wheelchair_accessible_entire_property?: boolean;
    upper_floors_elevator_accessible?: boolean;
    all_on_ground_floor?: boolean;
    lower_public_washbasin?: boolean;
    public_wc_grab_bars?: boolean;
    braille_signage?: boolean;
    auditory_guidance?: boolean;
    cctv_common_areas?: boolean;
    smoke_detectors?: boolean;
    fire_extinguishers?: boolean;
    security_personnel_24h?: boolean;
    electronic_keycards?: boolean;
    reception_main_safe?: boolean;
  };
}

export interface PropertyServicesAndExperiencesFeatures {
  customer_service?: {
    reception_24h?: boolean;
    concierge_service?: boolean;
    luggage_storage?: boolean;
    express_checkin_checkout?: boolean;
    tourist_info_desk?: boolean;
    extra_crib_in_room?: boolean;
  };
  multilingual_staff?: {
    spanish?: boolean;
    english?: boolean;
    german?: boolean;
    french?: boolean;
    portuguese?: boolean;
  };
  internal_hospitality_dining?: {
    restaurant?: boolean;
    bar_cafe?: boolean;
    poolside_bar?: boolean;
    room_service?: boolean;
    special_diet_menus?: boolean;
    breakfast_in_room?: boolean;
    snack_vending_machine?: boolean;
    drink_vending_machine?: boolean;
  };
  housekeeping_and_laundry?: {
    daily_cleaning?: boolean;
    laundry_service?: boolean;
    dry_cleaning?: boolean;
    ironing_service?: boolean;
    self_service_coin_laundry?: boolean;
    soap_detergent_sales?: boolean;
    fabric_softener_sales?: boolean;
  };
  internet?: {
    free_high_speed_wifi: boolean;
    paid_wifi?: boolean;
  };
  mobility_and_transport?: {
    free_covered_private_parking?: boolean;
    free_outdoor_private_parking?: boolean;
    paid_covered_private_parking?: boolean;
    paid_outdoor_private_parking?: boolean;
    parking_reservation_available?: boolean;
    nearby_public_parking?: boolean;
    disabled_parking_spot?: boolean;
    ev_charging_station?: boolean;
    airport_shuttle?: boolean;
    bicycle_rental?: boolean;
    car_rental?: boolean;
  };
  organized_activities_surroundings?: {
    hiking_trails?: boolean;
    cooking_classes?: boolean;
    guided_excursions?: boolean;
    water_sports?: boolean;
    walking_routes?: boolean;
    cycling_routes?: boolean;
    movie_nights?: boolean;
    live_music_shows?: boolean;
    kids_club?: boolean;
    teen_activities_club?: boolean;
    horse_riding?: boolean;
    sport_fishing?: boolean;
    golf?: boolean;
    tree_climbing?: boolean;
    kayak_canoe?: boolean;
    boat_tours_snorkeling?: boolean;
    gastronomic_routes_tastings?: boolean;
  };
}

export interface PropertyPaymentMethodsFeatures {
  venezuela_local: {
    pago_movil: boolean;
    national_pos_debit_credit: boolean;
    cash_usd: boolean;
    cash_ves: boolean;
    cash_eur?: boolean;
    cash_cop?: boolean;
    zelle: boolean;
    binance_pay_usdt: boolean;
    banesco_panama?: boolean;
    mercantil_panama?: boolean;
    forex_custody_accounts?: boolean;
    international_cards?: boolean;
  };
  spain_and_international?: {
    bank_cards_visa_mc_amex?: boolean;
    apple_pay?: boolean;
    google_pay?: boolean;
    paypal?: boolean;
    bizum?: boolean;
    instant_bank_transfer?: boolean;
    pay_by_link?: boolean;
    cash_eur?: boolean;
    bnpl_klarna?: boolean;
    crypto_pos?: boolean;
  };
}

export interface PropertyBookingConditionsFeatures {
  schedule_and_checkin: {
    checkin_time_range: string;
    checkout_time_range: string;
    early_checkin_free?: boolean;
    early_checkin_surcharge?: boolean;
    late_checkout_free?: boolean;
    late_checkout_surcharge?: boolean;
    checkin_24_7?: boolean;
    automated_self_checkin?: boolean;
    id_passport_mandatory: boolean;
    minors_legal_authorization_mandatory: boolean;
  };
  pets_policy?: {
    pets_allowed_free?: boolean;
    pets_allowed_surcharge?: boolean;
    pet_surcharge_amount?: number;
    pet_beds_provided?: boolean;
    no_pets_allowed?: boolean;
  };
  guest_profile?: {
    families_children_friendly?: boolean;
    adults_couples_only?: boolean;
    lgbt_travel_proud?: boolean;
  };
  smoking_and_noise?: {
    no_smoking_throughout_property?: boolean;
    designated_smoking_areas?: boolean;
    parties_events_strictly_forbidden?: boolean;
    quiet_hours_range?: string;
  };
  special_policies?: {
    discrete_automated_entry?: boolean;
    hourly_rentals?: boolean;
    curfew_time?: string | null;
    minimum_admission_age?: number;
  };
  board_basis?: {
    room_with_kitchen?: boolean;
    breakfast_criollo_included?: boolean;
    breakfast_buffet_included?: boolean;
    breakfast_american_included?: boolean;
    breakfast_continental_included?: boolean;
    breakfast_english_included?: boolean;
    breakfast_mediterranean_included?: boolean;
    all_inclusive?: boolean;
    half_board_dinner_included?: boolean;
    on_site_restaurant_available?: boolean;
  };
  guarantee_and_cancellation: {
    prepayment_50_percent?: boolean;
    prepayment_100_percent?: boolean;
    security_deposit_required?: boolean;
    credit_card_guarantee_only?: boolean;
    free_date_change?: boolean;
    free_cancellation_policy?: string;
    non_refundable?: boolean;
    credit_voucher_3_months?: boolean;
    credit_voucher_6_months?: boolean;
    no_show_penalty_50_percent?: boolean;
    no_show_penalty_100_percent?: boolean;
    booking_without_credit_card?: boolean;
    fully_anonymous_billing?: boolean;
  };
  children_stay_conditions?: {
    children_all_ages_allowed?: boolean;
    adult_pricing_age_threshold?: number;
  };
}

export interface PropertyCategorySpecificTagsFeatures {
  c07_housing_complexes_and_campings?: Record<string, boolean | string | number>;
  c08_love_hotels?: Record<string, boolean | string | number>;
  c09_mountain_ski_chalets?: Record<string, boolean | string | number>;
  c10_c11_nautical_and_boats?: {
    cabins_and_interiors?: Record<string, boolean>;
    deck_and_exterior?: Record<string, boolean>;
    berth_and_mooring?: Record<string, boolean>;
    nautical_services_crew?: Record<string, boolean>;
    maritime_safety?: Record<string, boolean>;
    boat_rules_and_fuel?: Record<string, boolean>;
  };
}
