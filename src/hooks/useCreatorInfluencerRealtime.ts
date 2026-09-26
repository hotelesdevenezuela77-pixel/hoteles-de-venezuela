import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type {
  CreatorExpedition,
  CreatorWaypoint,
  CreatorDeal,
  CreatorDeliverable,
  CreatorRouteExpense,
  CreatorEditorialTask,
  CreatorEstablishmentAudit,
  CreatorKpiSummary,
  TaskStatus,
  ExpeditionPaymentStatus,
  ExpeditionPaymentMethod,
  ViaticosBreakdown,
  InfluencerTravelAuthorization,
  CreatorVisitedEstablishment,
  CreatorQuote,
  CreatorQuoteItem,
  CreatorMembershipProfile,
  QuoteStatus
} from "../types/creatorInfluencer";

const DEFAULT_EXCHANGE_RATE = 36.5;

// Datos iniciales de demostración con honorarios base de $20 USD y desglose de viáticos
const INITIAL_EXPEDITIONS: CreatorExpedition[] = [
  {
    id: "exp-201",
    establishment_id: 1,
    title: "Expedición Gran Sabana 4x4 & Roraima Off-Road",
    destination: "Parque Nacional Canaima / Gran Sabana",
    km_distance: 1420,
    start_date: new Date(Date.now() - 10 * 24 * 3600000).toISOString().split("T")[0],
    end_date: new Date(Date.now() - 2 * 24 * 3600000).toISOString().split("T")[0],
    total_budget_usd: 850,
    status: "completed",
    base_fee_usd: 20.00,
    viaticos_usd: 215.00,
    viaticos_breakdown: {
      combustible: 75.00,
      guias_lancheros: 50.00,
      comidas: 90.00,
      peajes: 0.00,
      hospedaje: 0.00,
      otros: 0.00
    },
    total_remuneration_usd: 235.00, // $20 honorarios + $215 viáticos
    payment_status: "liquidado",
    payment_method: "pago_movil",
    payment_reference: "REF-BANC-9821443",
    payment_date: new Date(Date.now() - 2 * 24 * 3600000).toISOString().split("T")[0],
    notes: "Honorarios $20.00 + viáticos 100% liquidados tras entrega de material 4K."
  },
  {
    id: "exp-202",
    establishment_id: 1,
    title: "Ruta Playera Morrocoy & Cayo Agua 360°",
    destination: "Tucacas - Chichiriviche",
    km_distance: 680,
    start_date: new Date(Date.now() + 5 * 24 * 3600000).toISOString().split("T")[0],
    end_date: new Date(Date.now() + 8 * 24 * 3600000).toISOString().split("T")[0],
    total_budget_usd: 400,
    status: "active",
    base_fee_usd: 20.00,
    viaticos_usd: 145.00,
    viaticos_breakdown: {
      combustible: 45.00,
      guias_lancheros: 60.00,
      comidas: 30.00,
      peajes: 10.00,
      hospedaje: 0.00,
      otros: 0.00
    },
    total_remuneration_usd: 165.00, // $20 honorarios + $145 viáticos
    payment_status: "aprobado",
    payment_method: "zelle",
    payment_reference: "ZELLE-HDV-55102",
    notes: "Viáticos aprobados para combustible de lancha y traslados. Honorarios $20 asignados."
  },
  {
    id: "exp-203",
    establishment_id: 1,
    title: "Auditoría de Posadas & Ruta Médanos de Coro",
    destination: "Coro & Península de Paraguaná",
    km_distance: 920,
    start_date: new Date(Date.now() + 14 * 24 * 3600000).toISOString().split("T")[0],
    end_date: new Date(Date.now() + 18 * 24 * 3600000).toISOString().split("T")[0],
    total_budget_usd: 520,
    status: "active",
    base_fee_usd: 20.00,
    viaticos_usd: 180.00,
    viaticos_breakdown: {
      combustible: 60.00,
      comidas: 50.00,
      hospedaje: 40.00,
      peajes: 15.00,
      guias_lancheros: 0.00,
      otros: 15.00
    },
    total_remuneration_usd: 200.00, // $20 honorarios + $180 viáticos
    payment_status: "pendiente",
    notes: "Viaje pautado. Pendiente de aprobación de fondos y confirmación de fechas."
  }
];

const INITIAL_WAYPOINTS: CreatorWaypoint[] = [
  {
    id: "wp-1",
    expedition_id: "exp-201",
    latitude: 5.48512,
    longitude: -61.2145,
    altitude_meters: 1250,
    point_type: "mirador",
    title: "Mirador del Tepuy Kama-Merú",
    description: "Excelente punto fotográfico al amanecer con vista frontal a la caída de agua."
  },
  {
    id: "wp-2",
    expedition_id: "exp-201",
    latitude: 4.88124,
    longitude: -61.1203,
    altitude_meters: 980,
    point_type: "gasolinera",
    title: "Estación de Servicio Santa Elena de Uairén",
    description: "Suministro operativo de Gasolina 95 octanos sin colas prolongadas."
  },
  {
    id: "wp-3",
    expedition_id: "exp-201",
    latitude: 5.12098,
    longitude: -60.7511,
    altitude_meters: 1100,
    point_type: "sendero_offroad",
    title: "Paso del Río Tek (Cruce 4x4)",
    description: "Vado de río profundo. Se requiere doble tracción activada."
  }
];

const INITIAL_DEALS: CreatorDeal[] = [
  {
    id: "deal-301",
    establishment_id: 1,
    brand_name: "Posada VIP Gran Sabana Lodge",
    deal_type: "mixto",
    monetary_usd: 600,
    barter_value_usd: 450,
    status: "por_cobrar",
    notes: "Canje 3N en suite ejecutiva + $600 por Reel colaborativo y mención HDV."
  },
  {
    id: "deal-302",
    establishment_id: 1,
    brand_name: "Marcas de Equipaje & Cauchos Off-Road 4x4",
    deal_type: "monetario",
    monetary_usd: 800,
    barter_value_usd: 0,
    status: "en_produccion",
    notes: "Patrocinio de combustible y prueba de cauchos en ruta Roraima."
  }
];

const INITIAL_DELIVERABLES: CreatorDeliverable[] = [
  {
    id: "del-1",
    deal_id: "deal-301",
    title: "Reel Colaborativo 'Secretos de la Gran Sabana'",
    platform: "instagram_reel",
    due_date: new Date(Date.now() + 2 * 24 * 3600000).toISOString().split("T")[0],
    status: "pending"
  },
  {
    id: "del-2",
    deal_id: "deal-301",
    title: "Reseña Oficial con Auditoría Wi-Fi en Hoteles de Venezuela",
    platform: "hdv_review",
    due_date: new Date(Date.now() + 4 * 24 * 3600000).toISOString().split("T")[0],
    status: "pending"
  }
];

const INITIAL_EXPENSES: CreatorRouteExpense[] = [
  {
    id: "exp-g1",
    establishment_id: 1,
    expedition_id: "exp-201",
    description: "Combustible 120L diésel y bidones para ruta",
    category: "combustible",
    amount_usd: 75,
    amount_bs: 75 * DEFAULT_EXCHANGE_RATE,
    logged_by: "Piloto 4x4"
  },
  {
    id: "exp-g2",
    establishment_id: 1,
    expedition_id: "exp-201",
    description: "Pago de Guía Pemón para cruce de ríos",
    category: "lancheros",
    amount_usd: 50,
    amount_bs: 50 * DEFAULT_EXCHANGE_RATE,
    logged_by: "Creador"
  },
  {
    id: "exp-g3",
    establishment_id: 1,
    expedition_id: "exp-201",
    description: "Víveres de carretera, hielo y agua mineral para 5 días",
    category: "comidas",
    amount_usd: 90,
    amount_bs: 90 * DEFAULT_EXCHANGE_RATE,
    logged_by: "Productor"
  }
];

const INITIAL_TASKS: CreatorEditorialTask[] = [
  {
    id: "tsk-1",
    establishment_id: 1,
    task_name: "Selección de tomas aéreas con Drone (Roraima)",
    platform: "instagram_reel",
    due_date: new Date(Date.now() + 1 * 24 * 3600000).toISOString().split("T")[0],
    status: "editing",
    position_order: 1
  },
  {
    id: "tsk-2",
    establishment_id: 1,
    task_name: "Edición de audio y diseño sonoro del Reel Gran Sabana",
    platform: "tiktok",
    due_date: new Date(Date.now() + 3 * 24 * 3600000).toISOString().split("T")[0],
    status: "todo",
    position_order: 2
  },
  {
    id: "tsk-3",
    establishment_id: 1,
    task_name: "Revisión final de color con la Posada Patrocinadora",
    platform: "hdv_review",
    due_date: new Date(Date.now() + 5 * 24 * 3600000).toISOString().split("T")[0],
    status: "review",
    position_order: 3
  }
];

const INITIAL_AUDITS: CreatorEstablishmentAudit[] = [
  {
    id: "aud-1",
    establishment_id: 1,
    visited_establishment_name: "Posada VIP Gran Sabana Lodge",
    wifi_speed_mbps: 45.8,
    water_pressure_status: "excelente",
    power_generator_status: "si_automatica",
    water_well_status: "si_pozo_propio",
    overall_score: 9.5,
    notes: "Planta eléctrica insonorizada 100% activa durante corte en el sector. Conexión de fibra ideal para edición y subida de archivos 4K."
  }
];

const LOCAL_AUTH_KEY = "hdv_influencer_travel_authorizations";

const INITIAL_AUTHORIZATIONS: InfluencerTravelAuthorization[] = [
  {
    id: "auth-101",
    influencer_id: 99901,
    influencer_name: "Aura Croce",
    influencer_handle: "@auracroce",
    influencer_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    period_type: "dias",
    title: "Ventana de Expedición - Días 15 al 18 Octubre",
    start_date: "2026-10-15",
    end_date: "2026-10-18",
    allowed_days_count: 4,
    destination_target: "Ruta Playas de Mochima & Golfo de Cariaco (Sucre)",
    authorized_trips_count: 1,
    fee_per_trip_usd: 20.00,
    total_honorarios_usd: 20.00,
    approved_viaticos_budget_usd: 120.00,
    viaticos_budget_breakdown: {
      combustible: 40.00,
      comidas: 35.00,
      hospedaje: 25.00,
      guias_lancheros: 20.00,
      peajes: 0.00,
      otros: 0.00
    },
    status: "habilitado",
    enabled_by_admin: true,
    admin_notes: "Habilitado por Admin HDV. Ruta de 4 días para grabación de posadas y playas.",
    created_at: new Date().toISOString()
  },
  {
    id: "auth-102",
    influencer_id: 99901,
    influencer_name: "Aura Croce",
    influencer_handle: "@auracroce",
    influencer_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    period_type: "semanas",
    assigned_week: "Semana 43 (20 al 26 Octubre)",
    title: "Semana Habilitada - Morrocoy, Cayos & Parque Nacional",
    start_date: "2026-10-20",
    end_date: "2026-10-26",
    allowed_days_count: 7,
    destination_target: "Tucacas, Chichiriviche & Cayo Sal (Falcón)",
    authorized_trips_count: 2,
    fee_per_trip_usd: 20.00,
    total_honorarios_usd: 40.00,
    approved_viaticos_budget_usd: 195.00,
    viaticos_budget_breakdown: {
      combustible: 60.00,
      guias_lancheros: 75.00,
      comidas: 40.00,
      peajes: 20.00,
      hospedaje: 0.00,
      otros: 0.00
    },
    status: "habilitado",
    enabled_by_admin: true,
    admin_notes: "2 viajes autorizados en la semana ($40 total honorarios + $195 viáticos).",
    created_at: new Date().toISOString()
  },
  {
    id: "auth-103",
    influencer_id: 99901,
    influencer_name: "Aura Croce",
    influencer_handle: "@auracroce",
    influencer_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    period_type: "mes",
    assigned_month: "Noviembre 2026",
    title: "Mes Asignado - Circuito Andino Mérida & Pico Espejo",
    start_date: "2026-11-01",
    end_date: "2026-11-30",
    allowed_days_count: 30,
    destination_target: "Mérida, Sierra Nevada & Mucubají",
    authorized_trips_count: 3,
    fee_per_trip_usd: 20.00,
    total_honorarios_usd: 60.00,
    approved_viaticos_budget_usd: 320.00,
    viaticos_budget_breakdown: {
      combustible: 90.00,
      hospedaje: 110.00,
      comidas: 80.00,
      peajes: 20.00,
      guias_lancheros: 20.00,
      otros: 0.00
    },
    status: "programado",
    enabled_by_admin: true,
    admin_notes: "Cupo mensual de 3 viajes asignados para temporada baja andina.",
    created_at: new Date().toISOString()
  }
];

const INITIAL_VISITED_ESTABLISHMENTS: CreatorVisitedEstablishment[] = [
  {
    id: "est-vis-1",
    establishment_id: 1,
    name: "Posada Perla Negra - Morrocoy",
    destination: "Tucacas / Chichiriviche, Falcón",
    category: "hoteles_posadas",
    category_label: "Hoteles & Posadas",
    visit_date: "2026-09-12",
    status: "auditado",
    rating: 9.8,
    is_recommended: true,
    wifi_speed_mbps: 78.5,
    power_generator: "si_automatica",
    water_supply: "si_pozo_propio",
    water_pressure: "excelente",
    coverage_types: ["instagram_reel", "hdv_review", "fotos_4k"],
    social_link: "https://instagram.com/reel/perla_negra_hdv",
    hdv_slug: "perla-negra",
    deal_type: "mixto",
    deal_value_usd: 350,
    photos: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"],
    notes: "Planta eléctrica 100% insonorizada. Excelente gastronomía marina y salida directa a los cayos."
  },
  {
    id: "est-vis-2",
    establishment_id: 1,
    name: "Hostal Entre 2 Aguas",
    destination: "Playa Grande, Choroní, Aragua",
    category: "hoteles_posadas",
    category_label: "Hoteles & Posadas",
    visit_date: "2026-08-20",
    status: "auditado",
    rating: 9.5,
    is_recommended: true,
    wifi_speed_mbps: 45.0,
    power_generator: "si_automatica",
    water_supply: "tanque_reserva",
    water_pressure: "excelente",
    coverage_types: ["instagram_reel", "tiktok", "hdv_review"],
    social_link: "https://instagram.com/reel/entre2aguas_choroni",
    hdv_slug: "hostal-entre-2-aguas",
    deal_type: "canje",
    deal_value_usd: 250,
    photos: ["https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80"],
    notes: "Ambiente colonial caribeño de alta gama. Desayunos criollos con cacao local."
  },
  {
    id: "est-vis-3",
    establishment_id: 1,
    name: "Yilitas Restaurante & Bar de Playa",
    destination: "Playa El Yaque, Isla de Margarita",
    category: "restaurantes_gastronomia",
    category_label: "Restaurantes & Gastronomía",
    visit_date: "2026-08-05",
    status: "auditado",
    rating: 9.2,
    is_recommended: true,
    wifi_speed_mbps: 38.0,
    power_generator: "si_manual",
    water_supply: "tanque_reserva",
    water_pressure: "aceptable",
    coverage_types: ["instagram_reel", "tiktok"],
    social_link: "https://instagram.com/p/yilitas_el_yaque",
    hdv_slug: "yilitas-restaurante-mnie9b8z",
    deal_type: "monetario",
    deal_value_usd: 200,
    photos: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80"],
    notes: "Especialidad en mariscos frescos, fosforera y vista directa a las escuelas de windsurf."
  },
  {
    id: "est-vis-4",
    establishment_id: 1,
    name: "Marina & Yacht Charter Los Roques VIP",
    destination: "Gran Roque / Cayo de Agua, Los Roques",
    category: "marinas_yates",
    category_label: "Marinas & Yates",
    visit_date: "2026-07-18",
    status: "auditado",
    rating: 9.9,
    is_recommended: true,
    wifi_speed_mbps: 92.0,
    power_generator: "si_automatica",
    water_supply: "si_pozo_propio",
    water_pressure: "excelente",
    coverage_types: ["youtube", "instagram_reel", "fotos_4k"],
    deal_type: "monetario",
    deal_value_usd: 600,
    photos: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"],
    notes: "Catamarán de 48ft para expediciones privadas entre cayos. Certificación náutica internacional."
  },
  {
    id: "est-vis-5",
    establishment_id: 1,
    name: "Parque El Mundo de los Niños",
    destination: "Barquisimeto, Lara",
    category: "parques_complejos",
    category_label: "Parques & Complejos",
    visit_date: "2026-06-25",
    status: "auditado",
    rating: 9.0,
    is_recommended: true,
    wifi_speed_mbps: 30.0,
    power_generator: "si_automatica",
    water_supply: "si_pozo_propio",
    water_pressure: "excelente",
    coverage_types: ["youtube", "tiktok"],
    deal_type: "mixto",
    deal_value_usd: 400,
    photos: ["https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=600&q=80"],
    notes: "Complejo recreativo familiar y acuático. Relevamiento de atracciones y áreas temáticas."
  },
  {
    id: "est-vis-6",
    establishment_id: 1,
    name: "Flota 4x4 Aventura Gran Sabana",
    destination: "Santa Elena de Uairén, Bolívar",
    category: "rent_a_car",
    category_label: "Rent-a-car & Flota 4x4",
    visit_date: "2026-09-01",
    status: "auditado",
    rating: 9.7,
    is_recommended: true,
    wifi_speed_mbps: 50.0,
    power_generator: "si_automatica",
    water_supply: "si_pozo_propio",
    water_pressure: "excelente",
    coverage_types: ["youtube", "instagram_reel"],
    deal_type: "mixto",
    deal_value_usd: 500,
    photos: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80"],
    notes: "Vehículos rústicos preparados para vadeo de ríos, cauchos M/T y snorkels para Roraima."
  }
];

const INITIAL_QUOTES: CreatorQuote[] = [
  {
    id: "quote-001",
    establishment_id: 1,
    quote_number: "COT-2026-001",
    client_name: "Posada Perla Negra",
    client_contact: "Antonio (+58 412-555-1234)",
    destination_target: "Morrocoy, Falcón",
    created_date: "2026-09-10",
    valid_until_date: "2026-10-10",
    items: [
      {
        id: "qi-1",
        service_name: "Reel Colaborativo en Instagram (4K Drone)",
        description: "Reel cinematográfico con tomas aéreas y recorrido de suites",
        quantity: 1,
        unit_price_usd: 150,
        total_usd: 150
      },
      {
        id: "qi-2",
        service_name: "Pack de 4 Stories con Enlace a Reservas HDV",
        description: "Historias con swipe-up directo a la ficha en Hoteles de Venezuela",
        quantity: 1,
        unit_price_usd: 80,
        total_usd: 80
      },
      {
        id: "qi-3",
        service_name: "Auditoría Técnica con Sello de Calidad HDV",
        description: "Test de velocidad Wi-Fi, revisión de respaldo eléctrico y reporte oficial",
        quantity: 1,
        unit_price_usd: 120,
        total_usd: 120
      },
      {
        id: "qi-4",
        service_name: "Galería de 15 Fotografías Profesionales",
        description: "Fotografías editadas en alta resolución con derechos de uso para la posada",
        quantity: 1,
        unit_price_usd: 150,
        total_usd: 150
      }
    ],
    subtotal_usd: 500,
    discount_usd: 50,
    total_usd: 450,
    total_bs: 450 * DEFAULT_EXCHANGE_RATE,
    status: "aprobada",
    notes: "Convenio aprobado. Se incluye hospedaje de cortesía para el equipo de filmación.",
    converted_to_deal: true,
    created_at: new Date().toISOString()
  },
  {
    id: "quote-002",
    establishment_id: 1,
    quote_number: "COT-2026-002",
    client_name: "Restaurante Yilitas",
    client_contact: "Yilena (+58 424-888-9900)",
    destination_target: "Playa El Yaque, Margarita",
    created_date: "2026-09-18",
    valid_until_date: "2026-10-18",
    items: [
      {
        id: "qi-5",
        service_name: "Reel Gastronómico 'Ruta del Pescado Fresco'",
        description: "Video dinámico de preparación y degustación en primera fila de playa",
        quantity: 1,
        unit_price_usd: 120,
        total_usd: 120
      },
      {
        id: "qi-6",
        service_name: "TikTok Viral de Experiencia en Playa",
        description: "Formato vertical humor/lifestyle turístico",
        quantity: 1,
        unit_price_usd: 80,
        total_usd: 80
      }
    ],
    subtotal_usd: 200,
    discount_usd: 0,
    total_usd: 200,
    total_bs: 200 * DEFAULT_EXCHANGE_RATE,
    status: "enviada",
    notes: "Propuesta enviada vía WhatsApp pendiente de confirmación de fecha de grabación.",
    created_at: new Date().toISOString()
  }
];

const INITIAL_MEMBERSHIP: CreatorMembershipProfile = {
  tier_name: "Black Creator Pass - Oficial HDV",
  tier_badge: "CREADORA OFICIAL VERIFICADA",
  status: "active",
  member_since: "2025-01-15",
  valid_thru: "2027-12-31",
  qr_code_token: "HDV-PRESS-AURA-CROCE-99901-2027",
  press_card_number: "HDV-PRESS-2026-9901",
  benefits: [
    "Honorarios garantizados de $20.00 USD por cada expedición aprobada",
    "Tarifas 0% comisión de alojamiento en posadas afiliadas en misiones oficiales",
    "Pase de Prensa Turístico digital con QR verificable ante autoridades y parques",
    "Acceso al Trazador Satelital Andrómeda-X y telemetría de rutas GPS",
    "Soporte de grúa y asistencia vial 24/7 en autopistas nacionales",
    "Perfil público verificado en el Directorio Nacional de Creadores HDV"
  ]
};

export function useCreatorInfluencerRealtime(establishmentId: number = 1) {
  const localExpKey = `hdv_creator_expeditions_${establishmentId}`;
  const localVisitedKey = `hdv_creator_visited_est_${establishmentId}`;
  const localQuotesKey = `hdv_creator_quotes_${establishmentId}`;
  const localMembershipKey = `hdv_creator_membership_${establishmentId}`;

  const [expeditions, setExpeditions] = useState<CreatorExpedition[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(localExpKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_EXPEDITIONS;
  });

  const [travelAuthorizations, setTravelAuthorizations] = useState<InfluencerTravelAuthorization[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(LOCAL_AUTH_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_AUTHORIZATIONS;
  });

  const [visitedEstablishments, setVisitedEstablishments] = useState<CreatorVisitedEstablishment[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(localVisitedKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_VISITED_ESTABLISHMENTS;
  });

  const [quotes, setQuotes] = useState<CreatorQuote[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(localQuotesKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_QUOTES;
  });

  const [membership, setMembership] = useState<CreatorMembershipProfile>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(localMembershipKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.tier_name) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_MEMBERSHIP;
  });

  const [waypoints, setWaypoints] = useState<CreatorWaypoint[]>(INITIAL_WAYPOINTS);
  const [deals, setDeals] = useState<CreatorDeal[]>(INITIAL_DEALS);
  const [deliverables, setDeliverables] = useState<CreatorDeliverable[]>(INITIAL_DELIVERABLES);
  const [routeExpenses, setRouteExpenses] = useState<CreatorRouteExpense[]>(INITIAL_EXPENSES);
  const [tasks, setTasks] = useState<CreatorEditorialTask[]>(INITIAL_TASKS);
  const [audits, setAudits] = useState<CreatorEstablishmentAudit[]>(INITIAL_AUDITS);
  const [loading, setLoading] = useState(true);

  // Guardar en localStorage cuando cambien las expediciones
  const saveExpeditionsLocally = (newExpeditions: CreatorExpedition[]) => {
    setExpeditions(newExpeditions);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(localExpKey, JSON.stringify(newExpeditions));
        window.dispatchEvent(new CustomEvent("hdv_expeditions_changed", { detail: { establishmentId } }));
      } catch (e) {}
    }
  };

  // Guardar en localStorage establecimientos visitados
  const saveVisitedEstablishmentsLocally = (newList: CreatorVisitedEstablishment[]) => {
    setVisitedEstablishments(newList);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(localVisitedKey, JSON.stringify(newList));
        window.dispatchEvent(new CustomEvent("hdv_visited_est_changed", { detail: newList }));
      } catch (e) {}
    }
  };

  // Guardar en localStorage cotizaciones
  const saveQuotesLocally = (newQuotes: CreatorQuote[]) => {
    setQuotes(newQuotes);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(localQuotesKey, JSON.stringify(newQuotes));
        window.dispatchEvent(new CustomEvent("hdv_quotes_changed", { detail: newQuotes }));
      } catch (e) {}
    }
  };

  // Guardar en localStorage membresía
  const saveMembershipLocally = (newMem: CreatorMembershipProfile) => {
    setMembership(newMem);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(localMembershipKey, JSON.stringify(newMem));
      } catch (e) {}
    }
  };

  // Guardar en localStorage cuando cambien las autorizaciones de viaje del admin
  const saveAuthorizationsLocally = (newAuths: InfluencerTravelAuthorization[]) => {
    setTravelAuthorizations(newAuths);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newAuths));
        window.dispatchEvent(new CustomEvent("hdv_authorizations_changed", { detail: newAuths }));
      } catch (e) {}
    }
  };

  // Escuchar cambios entre pestañas y componentes
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === localExpKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setExpeditions(parsed);
        } catch (err) {}
      }
      if (e.key === LOCAL_AUTH_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setTravelAuthorizations(parsed);
        } catch (err) {}
      }
      if (e.key === localVisitedKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setVisitedEstablishments(parsed);
        } catch (err) {}
      }
      if (e.key === localQuotesKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setQuotes(parsed);
        } catch (err) {}
      }
    };

    const handleCustomAuth = () => {
      try {
        const saved = localStorage.getItem(LOCAL_AUTH_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setTravelAuthorizations(parsed);
        }
      } catch (err) {}
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("hdv_authorizations_changed", handleCustomAuth);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("hdv_authorizations_changed", handleCustomAuth);
    };
  }, [localExpKey, localVisitedKey, localQuotesKey]);

  // Carga desde Supabase con fallback local
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const { data: expData } = await supabase
        .from("creator_expeditions")
        .select("*")
        .eq("establishment_id", establishmentId);

      if (expData && expData.length > 0) {
        setExpeditions(expData);
        if (typeof window !== "undefined") {
          localStorage.setItem(localExpKey, JSON.stringify(expData));
        }
      }

      const { data: wpData } = await supabase
        .from("creator_waypoints")
        .select("*");

      if (wpData && wpData.length > 0) setWaypoints(wpData);

      const { data: dealData } = await supabase
        .from("creator_deals")
        .select("*")
        .eq("establishment_id", establishmentId);

      if (dealData && dealData.length > 0) setDeals(dealData);

      const { data: expensData } = await supabase
        .from("creator_route_expenses")
        .select("*")
        .eq("establishment_id", establishmentId);

      if (expensData && expensData.length > 0) setRouteExpenses(expensData);

      const { data: tskData } = await supabase
        .from("creator_editorial_tasks")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("position_order", { ascending: true });

      if (tskData && tskData.length > 0) setTasks(tskData);

    } catch (err) {
      console.warn("[CreatorRealtime] Fallback interactivo local activo:", err);
    } finally {
      setLoading(false);
    }
  }, [establishmentId, localExpKey]);

  useEffect(() => {
    loadData();

    const channel = supabase.channel(`creator_realtime_${establishmentId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'creator_deals', filter: `establishment_id=eq.${establishmentId}` }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'creator_editorial_tasks', filter: `establishment_id=eq.${establishmentId}` }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [establishmentId, loadData]);

  // Cómputo consolidado de KPIs incluyendo Honorarios ($20/viaje) y Viáticos
  const kpis: CreatorKpiSummary = (() => {
    const expeditionIncomeUsd = deals.reduce((acc, d) => acc + (d.monetary_usd || 0), 0);
    const expeditionIncomeBs = expeditionIncomeUsd * DEFAULT_EXCHANGE_RATE;

    const expeditionExpensesUsd = routeExpenses.reduce((acc, e) => acc + (e.amount_usd || 0), 0);
    const expeditionExpensesBs = expeditionExpensesUsd * DEFAULT_EXCHANGE_RATE;

    const netExpeditionMarginUsd = expeditionIncomeUsd - expeditionExpensesUsd;
    const netExpeditionMarginBs = netExpeditionMarginUsd * DEFAULT_EXCHANGE_RATE;

    const totalKmTraveled = expeditions.reduce((acc, exp) => acc + (exp.km_distance || 0), 0);
    const totalWaypointsCount = waypoints.length;

    const activeDealsCount = deals.filter(d => d.status === "en_produccion" || d.status === "pautado").length;
    const pendingCollectUsd = deals.filter(d => d.status === "por_cobrar").reduce((acc, d) => acc + (d.monetary_usd || 0), 0);

    const pendingDeliverablesCount = deliverables.filter(del => del.status === "pending").length;
    const urgentDeliverablesCount = deliverables.filter(del => {
      const due = new Date(del.due_date).getTime();
      return del.status === "pending" && due <= Date.now() + 72 * 3600000;
    }).length;

    // Métricas de Remuneración de Viajes ($20 Honorarios + Viáticos)
    const totalTripsCount = expeditions.length;
    const totalBaseFeesUsd = expeditions.reduce((acc, exp) => acc + (exp.base_fee_usd || 20.00), 0);
    const totalBaseFeesBs = totalBaseFeesUsd * DEFAULT_EXCHANGE_RATE;
    const totalViaticosUsd = expeditions.reduce((acc, exp) => acc + (exp.viaticos_usd || 0), 0);
    const totalViaticosBs = totalViaticosUsd * DEFAULT_EXCHANGE_RATE;
    const totalRemunerationUsd = expeditions.reduce((acc, exp) => acc + (exp.total_remuneration_usd || ((exp.base_fee_usd || 20.00) + (exp.viaticos_usd || 0))), 0);
    const totalRemunerationBs = totalRemunerationUsd * DEFAULT_EXCHANGE_RATE;

    const liquidatedRemunerationUsd = expeditions
      .filter(exp => exp.payment_status === "liquidado")
      .reduce((acc, exp) => acc + (exp.total_remuneration_usd || ((exp.base_fee_usd || 20.00) + (exp.viaticos_usd || 0))), 0);

    const pendingRemunerationUsd = expeditions
      .filter(exp => exp.payment_status !== "liquidado")
      .reduce((acc, exp) => acc + (exp.total_remuneration_usd || ((exp.base_fee_usd || 20.00) + (exp.viaticos_usd || 0))), 0);

    return {
      expeditionIncomeUsd,
      expeditionIncomeBs,
      expeditionExpensesUsd,
      expeditionExpensesBs,
      netExpeditionMarginUsd,
      netExpeditionMarginBs,
      totalKmTraveled,
      totalWaypointsCount,
      activeDealsCount,
      pendingCollectUsd,
      pendingDeliverablesCount,
      urgentDeliverablesCount,
      totalTripsCount,
      totalBaseFeesUsd,
      totalBaseFeesBs,
      totalViaticosUsd,
      totalViaticosBs,
      totalRemunerationUsd,
      totalRemunerationBs,
      liquidatedRemunerationUsd,
      pendingRemunerationUsd
    };
  })();

  // Acciones CRUD de Expedición / Viajes Remunerados
  const addExpedition = (data: Partial<CreatorExpedition>) => {
    const baseFee = data.base_fee_usd !== undefined ? Number(data.base_fee_usd) : 20.00;
    const breakdown = data.viaticos_breakdown || {};
    const viaticosTotal = (Number(breakdown.combustible) || 0) +
                          (Number(breakdown.comidas) || 0) +
                          (Number(breakdown.hospedaje) || 0) +
                          (Number(breakdown.peajes) || 0) +
                          (Number(breakdown.guias_lancheros) || 0) +
                          (Number(breakdown.otros) || 0);

    const totalViaticos = data.viaticos_usd !== undefined ? Number(data.viaticos_usd) : viaticosTotal;
    const totalRemun = baseFee + totalViaticos;

    const newExp: CreatorExpedition = {
      id: `exp-${Date.now()}`,
      establishment_id: establishmentId,
      title: data.title || "Nueva Expedición Remunerada",
      destination: data.destination || "Venezuela",
      km_distance: Number(data.km_distance) || 350,
      start_date: data.start_date || new Date().toISOString().split("T")[0],
      end_date: data.end_date || new Date(Date.now() + 3 * 24 * 3600000).toISOString().split("T")[0],
      total_budget_usd: totalRemun,
      status: data.status || "active",
      base_fee_usd: baseFee,
      viaticos_usd: totalViaticos,
      viaticos_breakdown: breakdown,
      total_remuneration_usd: totalRemun,
      payment_status: data.payment_status || "pendiente",
      payment_method: data.payment_method,
      payment_reference: data.payment_reference,
      payment_date: data.payment_date,
      notes: data.notes || `Honorarios $${baseFee.toFixed(2)} + Viáticos $${totalViaticos.toFixed(2)}`,
      created_at: new Date().toISOString()
    };

    saveExpeditionsLocally([newExp, ...expeditions]);
    return newExp;
  };

  const updateExpedition = (expId: string, updates: Partial<CreatorExpedition>) => {
    const updated = expeditions.map(exp => {
      if (exp.id === expId) {
        const merged = { ...exp, ...updates };
        const baseFee = merged.base_fee_usd !== undefined ? Number(merged.base_fee_usd) : 20.00;
        const viaticos = merged.viaticos_usd !== undefined ? Number(merged.viaticos_usd) : 0;
        merged.total_remuneration_usd = baseFee + viaticos;
        return merged;
      }
      return exp;
    });
    saveExpeditionsLocally(updated);
  };

  const updateExpeditionPayment = (
    expId: string,
    status: ExpeditionPaymentStatus,
    method?: ExpeditionPaymentMethod,
    reference?: string,
    date?: string
  ) => {
    const updated = expeditions.map(exp => {
      if (exp.id === expId) {
        return {
          ...exp,
          payment_status: status,
          payment_method: method || exp.payment_method,
          payment_reference: reference !== undefined ? reference : exp.payment_reference,
          payment_date: date || (status === "liquidado" ? new Date().toISOString().split("T")[0] : exp.payment_date)
        };
      }
      return exp;
    });
    saveExpeditionsLocally(updated);
  };

  const deleteExpedition = (expId: string) => {
    const filtered = expeditions.filter(exp => exp.id !== expId);
    saveExpeditionsLocally(filtered);
  };

  // Acciones de Gestión de Autorizaciones de Viaje (Admin HDV)
  const addTravelAuthorization = (authData: Partial<InfluencerTravelAuthorization>) => {
    const fee = authData.fee_per_trip_usd !== undefined ? Number(authData.fee_per_trip_usd) : 20.00;
    const tripsCount = Number(authData.authorized_trips_count) || 1;
    const totalHon = fee * tripsCount;
    const breakdown = authData.viaticos_budget_breakdown || {};
    const viatSum = (Number(breakdown.combustible) || 0) +
                    (Number(breakdown.comidas) || 0) +
                    (Number(breakdown.hospedaje) || 0) +
                    (Number(breakdown.peajes) || 0) +
                    (Number(breakdown.guias_lancheros) || 0) +
                    (Number(breakdown.otros) || 0);
    const approvedViat = authData.approved_viaticos_budget_usd !== undefined ? Number(authData.approved_viaticos_budget_usd) : viatSum;

    const newAuth: InfluencerTravelAuthorization = {
      id: `auth-${Date.now()}`,
      influencer_id: authData.influencer_id || 99901,
      influencer_name: authData.influencer_name || "Aura Croce",
      influencer_handle: authData.influencer_handle || "@auracroce",
      influencer_avatar: authData.influencer_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      period_type: authData.period_type || "dias",
      title: authData.title || "Asignación de Viaje Autorizada",
      assigned_month: authData.assigned_month,
      assigned_week: authData.assigned_week,
      start_date: authData.start_date || new Date().toISOString().split("T")[0],
      end_date: authData.end_date || new Date(Date.now() + 4 * 24 * 3600000).toISOString().split("T")[0],
      allowed_days_count: Number(authData.allowed_days_count) || 4,
      destination_target: authData.destination_target || "Venezuela",
      authorized_trips_count: tripsCount,
      fee_per_trip_usd: fee,
      total_honorarios_usd: totalHon,
      approved_viaticos_budget_usd: approvedViat,
      viaticos_budget_breakdown: breakdown,
      status: authData.status || "habilitado",
      enabled_by_admin: authData.enabled_by_admin !== undefined ? authData.enabled_by_admin : true,
      admin_notes: authData.admin_notes || "Habilitado desde el Panel Central de Hoteles de Venezuela.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    saveAuthorizationsLocally([newAuth, ...travelAuthorizations]);
    return newAuth;
  };

  const updateTravelAuthorization = (authId: string, updates: Partial<InfluencerTravelAuthorization>) => {
    const updated = travelAuthorizations.map(item => {
      if (item.id === authId) {
        const merged = { ...item, ...updates, updated_at: new Date().toISOString() };
        if (updates.authorized_trips_count !== undefined || updates.fee_per_trip_usd !== undefined) {
          const fee = merged.fee_per_trip_usd || 20.00;
          const trips = merged.authorized_trips_count || 1;
          merged.total_honorarios_usd = fee * trips;
        }
        return merged;
      }
      return item;
    });
    saveAuthorizationsLocally(updated);
  };

  const toggleAuthorizationStatus = (authId: string, status: AuthorizationStatus) => {
    updateTravelAuthorization(authId, {
      status,
      enabled_by_admin: status === "habilitado" || status === "en_curso"
    });
  };

  const deleteTravelAuthorization = (authId: string) => {
    const filtered = travelAuthorizations.filter(item => item.id !== authId);
    saveAuthorizationsLocally(filtered);
  };

  // Acciones CRUD de Establecimientos Turísticos Visitados
  const addVisitedEstablishment = (data: Partial<CreatorVisitedEstablishment>) => {
    const newEst: CreatorVisitedEstablishment = {
      id: `est-vis-${Date.now()}`,
      establishment_id: establishmentId,
      name: data.name || "Nuevo Establecimiento Turístico",
      destination: data.destination || "Venezuela",
      category: data.category || "hoteles_posadas",
      category_label: data.category_label || "Hoteles & Posadas",
      visit_date: data.visit_date || new Date().toISOString().split("T")[0],
      status: data.status || "auditado",
      rating: Number(data.rating) || 9.0,
      is_recommended: data.is_recommended !== undefined ? data.is_recommended : true,
      wifi_speed_mbps: Number(data.wifi_speed_mbps) || 30.0,
      power_generator: data.power_generator || "si_automatica",
      water_supply: data.water_supply || "si_pozo_propio",
      water_pressure: data.water_pressure || "excelente",
      coverage_types: data.coverage_types || ["instagram_reel", "hdv_review"],
      social_link: data.social_link,
      hdv_slug: data.hdv_slug,
      deal_type: data.deal_type || "canje",
      deal_value_usd: Number(data.deal_value_usd) || 200,
      photos: data.photos || ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"],
      notes: data.notes || "Auditoría en sitio completada por el creador.",
      created_at: new Date().toISOString()
    };

    saveVisitedEstablishmentsLocally([newEst, ...visitedEstablishments]);
    return newEst;
  };

  const updateVisitedEstablishment = (id: string, updates: Partial<CreatorVisitedEstablishment>) => {
    const updated = visitedEstablishments.map(item => item.id === id ? { ...item, ...updates } : item);
    saveVisitedEstablishmentsLocally(updated);
  };

  const deleteVisitedEstablishment = (id: string) => {
    const filtered = visitedEstablishments.filter(item => item.id !== id);
    saveVisitedEstablishmentsLocally(filtered);
  };

  // Acciones CRUD de Cotizaciones y Propuestas Comerciales
  const addQuote = (quoteData: Partial<CreatorQuote>) => {
    const items = quoteData.items || [];
    const subtotal = items.reduce((acc, it) => acc + (Number(it.total_usd) || (Number(it.unit_price_usd) * Number(it.quantity))), 0);
    const discount = Number(quoteData.discount_usd) || 0;
    const total = Math.max(0, subtotal - discount);

    const newQuote: CreatorQuote = {
      id: `quote-${Date.now()}`,
      establishment_id: establishmentId,
      quote_number: quoteData.quote_number || `COT-2026-${String(quotes.length + 1).padStart(3, "0")}`,
      client_name: quoteData.client_name || "Cliente / Posada",
      client_contact: quoteData.client_contact || "",
      destination_target: quoteData.destination_target || "Venezuela",
      created_date: quoteData.created_date || new Date().toISOString().split("T")[0],
      valid_until_date: quoteData.valid_until_date || new Date(Date.now() + 30 * 24 * 3600000).toISOString().split("T")[0],
      items,
      subtotal_usd: subtotal,
      discount_usd: discount,
      total_usd: total,
      total_bs: total * DEFAULT_EXCHANGE_RATE,
      status: quoteData.status || "borrador",
      notes: quoteData.notes || "",
      converted_to_deal: false,
      created_at: new Date().toISOString()
    };

    saveQuotesLocally([newQuote, ...quotes]);
    return newQuote;
  };

  const updateQuote = (quoteId: string, updates: Partial<CreatorQuote>) => {
    const updated = quotes.map(q => {
      if (q.id === quoteId) {
        const merged = { ...q, ...updates };
        if (updates.items || updates.discount_usd !== undefined) {
          const subtotal = merged.items.reduce((acc, it) => acc + (Number(it.total_usd) || (Number(it.unit_price_usd) * Number(it.quantity))), 0);
          const discount = Number(merged.discount_usd) || 0;
          const total = Math.max(0, subtotal - discount);
          merged.subtotal_usd = subtotal;
          merged.total_usd = total;
          merged.total_bs = total * DEFAULT_EXCHANGE_RATE;
        }
        return merged;
      }
      return q;
    });
    saveQuotesLocally(updated);
  };

  const deleteQuote = (quoteId: string) => {
    const filtered = quotes.filter(q => q.id !== quoteId);
    saveQuotesLocally(filtered);
  };

  const convertQuoteToDeal = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;

    // 1. Marcar cotización como aprobada y convertida
    updateQuote(quoteId, {
      status: "aprobada",
      converted_to_deal: true
    });

    // 2. Crear acuerdo comercial automáticamente
    const newDeal: CreatorDeal = {
      id: `deal-${Date.now()}`,
      establishment_id: establishmentId,
      brand_name: quote.client_name,
      deal_type: "monetario",
      monetary_usd: quote.total_usd,
      barter_value_usd: 0,
      status: "en_produccion",
      notes: `Generado desde Cotización ${quote.quote_number}. Destino: ${quote.destination_target || 'Venezuela'}`,
      created_at: new Date().toISOString()
    };
    setDeals(prev => [newDeal, ...prev]);

    // 3. Crear entregables y tareas editoriales por cada ítem
    quote.items.forEach((item, idx) => {
      const task: CreatorEditorialTask = {
        id: `tsk-q-${Date.now()}-${idx}`,
        establishment_id: establishmentId,
        task_name: `${item.service_name} (${quote.client_name})`,
        platform: item.service_name.toLowerCase().includes("youtube") ? "youtube_video" : "instagram_reel",
        due_date: new Date(Date.now() + (idx + 1) * 3 * 24 * 3600000).toISOString().split("T")[0],
        status: "todo",
        position_order: tasks.length + idx + 1,
        created_at: new Date().toISOString()
      };
      setTasks(prev => [...prev, task]);
    });
  };

  // Actualización de Membresía
  const updateMembership = (updates: Partial<CreatorMembershipProfile>) => {
    const merged = { ...membership, ...updates };
    saveMembershipLocally(merged);
  };

  // Acciones CRUD adicionales
  const importWaypoints = (newPoints: Partial<CreatorWaypoint>[]) => {
    const created: CreatorWaypoint[] = newPoints.map((pt, idx) => ({
      id: `wp-${Date.now()}-${idx}`,
      expedition_id: pt.expedition_id || expeditions[0]?.id || "exp-201",
      latitude: pt.latitude || 5.123,
      longitude: pt.longitude || -61.456,
      altitude_meters: pt.altitude_meters || 900,
      point_type: pt.point_type || "spot_fotografico",
      title: pt.title || `Waypoint #${waypoints.length + idx + 1}`,
      description: pt.description || "Punto de interés georreferenciado.",
      created_at: new Date().toISOString()
    }));

    setWaypoints(prev => [...prev, ...created]);
  };

  const createDeal = async (dealData: Partial<CreatorDeal>): Promise<CreatorDeal> => {
    const newDeal: CreatorDeal = {
      id: `deal-${Date.now()}`,
      establishment_id: establishmentId,
      brand_name: dealData.brand_name || "Marca Patrocinadora",
      deal_type: dealData.deal_type || "canje",
      monetary_usd: dealData.monetary_usd || 0,
      barter_value_usd: dealData.barter_value_usd || 0,
      status: "en_produccion",
      notes: dealData.notes || "Acuerdo comercial de expedición.",
      created_at: new Date().toISOString()
    };

    setDeals(prev => [newDeal, ...prev]);
    return newDeal;
  };

  const addRouteExpense = (expData: Partial<CreatorRouteExpense>) => {
    const newExp: CreatorRouteExpense = {
      id: `exp-${Date.now()}`,
      establishment_id: establishmentId,
      expedition_id: expData.expedition_id || expeditions[0]?.id,
      description: expData.description || "Gasto de carretera",
      category: expData.category || "otros",
      amount_usd: expData.amount_usd || 0,
      amount_bs: (expData.amount_usd || 0) * DEFAULT_EXCHANGE_RATE,
      logged_by: expData.logged_by || "Creador",
      created_at: new Date().toISOString()
    };

    setRouteExpenses(prev => [newExp, ...prev]);
  };

  const addEditorialTask = (taskData: Partial<CreatorEditorialTask>) => {
    const newTask: CreatorEditorialTask = {
      id: `tsk-${Date.now()}`,
      establishment_id: establishmentId,
      task_name: taskData.task_name || "Tarea Editorial",
      platform: taskData.platform || "instagram_reel",
      due_date: taskData.due_date || new Date(Date.now() + 3 * 24 * 3600000).toISOString().split("T")[0],
      status: "todo",
      position_order: tasks.length + 1,
      created_at: new Date().toISOString()
    };

    setTasks(prev => [...prev, newTask]);
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };

  const addAudit = (auditData: Partial<CreatorEstablishmentAudit>) => {
    const newAudit: CreatorEstablishmentAudit = {
      id: `aud-${Date.now()}`,
      establishment_id: establishmentId,
      visited_establishment_name: auditData.visited_establishment_name || "Posada Visitada",
      wifi_speed_mbps: auditData.wifi_speed_mbps || 30,
      water_pressure_status: auditData.water_pressure_status || "excelente",
      power_generator_status: auditData.power_generator_status || "si_automatica",
      water_well_status: auditData.water_well_status || "si_pozo_propio",
      overall_score: auditData.overall_score || 9.0,
      notes: auditData.notes || "Auditoría completada por el creador.",
      created_at: new Date().toISOString()
    };

    setAudits(prev => [newAudit, ...prev]);
  };

  return {
    expeditions,
    travelAuthorizations,
    visitedEstablishments,
    quotes,
    membership,
    waypoints,
    deals,
    deliverables,
    routeExpenses,
    tasks,
    audits,
    kpis,
    loading,
    addExpedition,
    updateExpedition,
    updateExpeditionPayment,
    deleteExpedition,
    addTravelAuthorization,
    updateTravelAuthorization,
    toggleAuthorizationStatus,
    deleteTravelAuthorization,
    addVisitedEstablishment,
    updateVisitedEstablishment,
    deleteVisitedEstablishment,
    addQuote,
    updateQuote,
    deleteQuote,
    convertQuoteToDeal,
    updateMembership,
    importWaypoints,
    createDeal,
    addRouteExpense,
    addEditorialTask,
    updateTaskStatus,
    addAudit,
    refresh: loadData
  };
}
