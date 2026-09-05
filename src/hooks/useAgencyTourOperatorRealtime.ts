import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type {
  AgencyPackage,
  AgencyQuote,
  AgencyPassenger,
  AgencyItineraryDay,
  SupplierPayment,
  ExpeditionExpense,
  AgencyKpiSummary,
  QuoteStatus
} from "../types/agencyTourOperator";

const DEFAULT_EXCHANGE_RATE = 36.5;

// Datos de demostración en vivo de Expediciones & Paquetes Turísticos
const INITIAL_PACKAGES: AgencyPackage[] = [
  {
    id: "pkg-101",
    establishment_id: 1,
    title: "Expedición VIP Los Roques (Cayo de Agua & Francisquí)",
    destination: "Archipiélago Los Roques",
    duration_days: 4,
    duration_nights: 3,
    net_cost_usd: 680,
    markup_percentage: 25,
    price_per_person_usd: 850,
    price_per_person_bs: 850 * DEFAULT_EXCHANGE_RATE,
    min_passengers: 2,
    inclusions: [
      "Vuelo Charter ida y vuelta Maiquetía - Gran Roque",
      "Hospedaje 3N Posada VIP con Pensión Completa",
      "Paseos diarios en Peñero a Cayo de Agua, Madrisquí y Francisquí",
      "Cavas con hielo, refrescos, snacks y sombrillas de playa",
      "Asistencia en puerto y tasa aeroportuaria incluida"
    ],
    exclusions: ["Bebidas alcohólicas importadas", "Entrada a Inparques ($20)"],
    status: "active"
  },
  {
    id: "pkg-102",
    establishment_id: 1,
    title: "Full Day Morrocoy & Cayo Sombrero (Todo Incluido)",
    destination: "Parque Nacional Morrocoy",
    duration_days: 1,
    duration_nights: 0,
    net_cost_usd: 60,
    markup_percentage: 33.3,
    price_per_person_usd: 80,
    price_per_person_bs: 80 * DEFAULT_EXCHANGE_RATE,
    min_passengers: 4,
    inclusions: [
      "Transporte terrestre privado ida y vuelta desde Caracas / Valencia",
      "Traslado en Lancha rápida a Cayo Sombrero y Bajo 360°",
      "Almuerzo playero (Pescado frito, tostones y ensalada)",
      "Atención de guía y kit de primeros auxilios"
    ],
    exclusions: ["Propinas opcionales"],
    status: "active"
  },
  {
    id: "pkg-103",
    establishment_id: 1,
    title: "Misterios de Canaima & Salto Ángel 3D/2N",
    destination: "Parque Nacional Canaima",
    duration_days: 3,
    duration_nights: 2,
    net_cost_usd: 720,
    markup_percentage: 22.2,
    price_per_person_usd: 880,
    price_per_person_bs: 880 * DEFAULT_EXCHANGE_RATE,
    min_passengers: 2,
    inclusions: [
      "Vuelo Maiquetía - Canaima - Maiquetía",
      "Expedición en curiara a la base del Salto Ángel",
      "Pernocta en Hamacas con mosquitero frente al Auyantepuy",
      "Todas las comidas y excursión a Laguna de Canaima"
    ],
    exclusions: ["Tasa de impuesto indígena Pemón"],
    status: "active"
  }
];

const INITIAL_QUOTES: AgencyQuote[] = [
  {
    id: "q-7701",
    establishment_id: 1,
    quote_number: "COT-2026-081",
    client_name: "Dr. Roberto Mendoza",
    client_email: "roberto.mendoza@gmail.com",
    client_phone: "+58 414 321 9876",
    package_id: "pkg-101",
    package_title: "Expedición VIP Los Roques (Cayo de Agua & Francisquí)",
    travel_start_date: new Date(Date.now() + 24 * 3600000).toISOString().split("T")[0], // En 24h
    travel_end_date: new Date(Date.now() + 5 * 24 * 3600000).toISOString().split("T")[0],
    adults_count: 2,
    children_count: 1,
    total_sale_usd: 2550,
    total_sale_bs: 2550 * DEFAULT_EXCHANGE_RATE,
    deposit_paid_usd: 1500,
    remaining_balance_usd: 1050,
    payment_deadline: new Date(Date.now() + 12 * 3600000).toISOString(),
    status: "confirmed",
    created_at: new Date(Date.now() - 48 * 3600000).toISOString()
  },
  {
    id: "q-7702",
    establishment_id: 1,
    quote_number: "COT-2026-082",
    client_name: "Empresa Inversiones Alfa C.A.",
    client_email: "eventos@inversionesalfa.com",
    client_phone: "+58 412 987 6543",
    package_id: "pkg-102",
    package_title: "Full Day Morrocoy & Cayo Sombrero (Todo Incluido)",
    travel_start_date: new Date(Date.now() + 7 * 24 * 3600000).toISOString().split("T")[0],
    travel_end_date: new Date(Date.now() + 7 * 24 * 3600000).toISOString().split("T")[0],
    adults_count: 12,
    children_count: 0,
    total_sale_usd: 960,
    total_sale_bs: 960 * DEFAULT_EXCHANGE_RATE,
    deposit_paid_usd: 960,
    remaining_balance_usd: 0,
    status: "paid_in_full",
    created_at: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: "q-7703",
    establishment_id: 1,
    quote_number: "COT-2026-083",
    client_name: "Familia Gómez Rivas",
    client_email: "gomezrivas@hotmail.com",
    client_phone: "+58 416 555 4321",
    package_id: "pkg-103",
    package_title: "Misterios de Canaima & Salto Ángel 3D/2N",
    travel_start_date: new Date(Date.now() + 14 * 24 * 3600000).toISOString().split("T")[0],
    travel_end_date: new Date(Date.now() + 17 * 24 * 3600000).toISOString().split("T")[0],
    adults_count: 2,
    children_count: 2,
    total_sale_usd: 3520,
    total_sale_bs: 3520 * DEFAULT_EXCHANGE_RATE,
    deposit_paid_usd: 0,
    remaining_balance_usd: 3520,
    status: "draft",
    created_at: new Date().toISOString()
  }
];

const INITIAL_PASSENGERS: AgencyPassenger[] = [
  {
    id: "p-1",
    quote_id: "q-7701",
    full_name: "Roberto Mendoza",
    document_type: "Cédula",
    document_number: "V-14.520.310",
    birth_date: "1982-05-14",
    nationality: "Venezolana",
    dietary_restrictions: "Sin mariscos (alergia)",
    medical_conditions: "Ninguna",
    emergency_contact: "Esposa: +58 414 111 2233"
  },
  {
    id: "p-2",
    quote_id: "q-7701",
    full_name: "Mariana Colmenarez de Mendoza",
    document_type: "Cédula",
    document_number: "V-16.890.123",
    birth_date: "1985-09-20",
    nationality: "Venezolana",
    dietary_restrictions: "Vegetariana",
    medical_conditions: "Ninguna",
    emergency_contact: "+58 414 321 9876"
  },
  {
    id: "p-3",
    quote_id: "q-7701",
    full_name: "Santiago Mendoza Colmenarez",
    document_type: "Cédula",
    document_number: "V-32.100.450",
    birth_date: "2015-03-10",
    nationality: "Venezolana",
    dietary_restrictions: "Ninguna",
    medical_conditions: "Asma controlado (lleva inhalador)",
    emergency_contact: "Padre: +58 414 321 9876"
  }
];

const INITIAL_ITINERARIES: AgencyItineraryDay[] = [
  {
    id: "itin-1",
    quote_id: "q-7701",
    day_number: 1,
    time_schedule: "06:00 AM",
    title: "Check-in en Aeropuerto Maiquetía & Vuelo a Gran Roque",
    description: "Encuentro con nuestro agente en el Terminal Nacional. Vuelo charter privado de 35 min a Gran Roque. Coctel de bienvenida en Posada VIP y traslado de equipaje.",
    location_name: "Gran Roque, Los Roques",
    outfit_recommendations: "Ropa fresca de playa, lentes de sol y gorra"
  },
  {
    id: "itin-2",
    quote_id: "q-7701",
    day_number: 1,
    time_schedule: "10:30 AM",
    title: "Zarpe en Peñero Privado a Cayo Francisquí & Snorkeling",
    description: "Navegación de 10 minutos a Francisquí de Arriba. Armado de campamento con sombrilla, cavas frías y almuerzo servido frente al mar. Visita a la piscina natural La Piscinita.",
    location_name: "Cayo Francisquí",
    outfit_recommendations: "Traje de baño, protector solar biodegredable, equipo de snorkel"
  },
  {
    id: "itin-3",
    quote_id: "q-7701",
    day_number: 2,
    time_schedule: "09:00 AM",
    title: "Zarpe Extremo a Cayo de Agua (El Santuario)",
    description: "Navegación de 45 min hacia la famosa manga de arena de Cayo de Agua. Almuerzo de pesca del día, paseo fotográfico y tiempo libre de relax total.",
    location_name: "Cayo de Agua",
    outfit_recommendations: "Camisa manga larga UV, cámara fotográfica impermeable"
  }
];

const INITIAL_PAYMENTS: SupplierPayment[] = [
  {
    id: "sp-1",
    establishment_id: 1,
    quote_id: "q-7701",
    quote_number: "COT-2026-081",
    provider_name: "Posada Sol y Mar (Los Roques)",
    service_category: "posada_hotel",
    amount_usd: 450,
    amount_bs: 450 * DEFAULT_EXCHANGE_RATE,
    payment_deadline: new Date(Date.now() + 36 * 3600000).toISOString().split("T")[0], // Próximas 36h
    status: "pending"
  },
  {
    id: "sp-2",
    establishment_id: 1,
    quote_id: "q-7701",
    quote_number: "COT-2026-081",
    provider_name: "Lanchero Capitán Pedro (Gran Roque)",
    service_category: "lanchero",
    amount_usd: 120,
    amount_bs: 120 * DEFAULT_EXCHANGE_RATE,
    payment_deadline: new Date(Date.now() + 48 * 3600000).toISOString().split("T")[0],
    status: "pending"
  },
  {
    id: "sp-3",
    establishment_id: 1,
    quote_id: "q-7702",
    quote_number: "COT-2026-082",
    provider_name: "Transportes Ejecutivos Morrocoy C.A.",
    service_category: "transporte",
    amount_usd: 280,
    amount_bs: 280 * DEFAULT_EXCHANGE_RATE,
    payment_deadline: new Date(Date.now() - 12 * 3600000).toISOString().split("T")[0],
    status: "paid",
    paid_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    bank_reference: "REF-0098412"
  }
];

const INITIAL_EXPENSES: ExpeditionExpense[] = [
  {
    id: "exp-101",
    establishment_id: 1,
    quote_id: "q-7701",
    description: "Carga de combustible para embarcación peñero extra",
    category: "combustible",
    amount_usd: 40,
    amount_bs: 40 * DEFAULT_EXCHANGE_RATE,
    logged_by: "Guía Principal",
    created_at: new Date(Date.now() - 5 * 3600000).toISOString()
  },
  {
    id: "exp-102",
    establishment_id: 1,
    quote_id: "q-7702",
    description: "Compra de 4 cavas de hielo y 30 litros de agua mineral para grupo",
    category: "snacks_hidratacion",
    amount_usd: 25,
    amount_bs: 25 * DEFAULT_EXCHANGE_RATE,
    logged_by: "Coordinador de Ruta",
    created_at: new Date(Date.now() - 10 * 3600000).toISOString()
  }
];

export function useAgencyTourOperatorRealtime(establishmentId: number = 1) {
  const [packages, setPackages] = useState<AgencyPackage[]>(INITIAL_PACKAGES);
  const [quotes, setQuotes] = useState<AgencyQuote[]>(INITIAL_QUOTES);
  const [passengers, setPassengers] = useState<AgencyPassenger[]>(INITIAL_PASSENGERS);
  const [itineraries, setItineraries] = useState<AgencyItineraryDay[]>(INITIAL_ITINERARIES);
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(INITIAL_PAYMENTS);
  const [expeditionExpenses, setExpeditionExpenses] = useState<ExpeditionExpense[]>(INITIAL_EXPENSES);
  const [loading, setLoading] = useState(true);

  // Carga desde Supabase con fallback local
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const { data: pkgData } = await supabase
        .from("agency_packages")
        .select("*")
        .eq("establishment_id", establishmentId);

      if (pkgData && pkgData.length > 0) setPackages(pkgData);

      const { data: qData } = await supabase
        .from("agency_quotes")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("created_at", { ascending: false });

      if (qData && qData.length > 0) setQuotes(qData);

      const { data: spData } = await supabase
        .from("agency_supplier_payments")
        .select("*")
        .eq("establishment_id", establishmentId);

      if (spData && spData.length > 0) setSupplierPayments(spData);

      const { data: expData } = await supabase
        .from("agency_expedition_expenses")
        .select("*")
        .eq("establishment_id", establishmentId);

      if (expData && expData.length > 0) setExpeditionExpenses(expData);

    } catch (err) {
      console.warn("[AgencyRealtime] Carga Supabase fallback interactivo activo:", err);
    } finally {
      setLoading(false);
    }
  }, [establishmentId]);

  useEffect(() => {
    loadData();

    const channel = supabase.channel(`agency_realtime_${establishmentId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agency_quotes', filter: `establishment_id=eq.${establishmentId}` }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agency_packages', filter: `establishment_id=eq.${establishmentId}` }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agency_supplier_payments', filter: `establishment_id=eq.${establishmentId}` }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [establishmentId, loadData]);

  // Cómputo consolidado de KPIs
  const kpis: AgencyKpiSummary = (() => {
    const validQuotes = quotes.filter(q => q.status === "confirmed" || q.status === "paid_in_full" || q.status === "completed");
    const monthlyGrossSalesUsd = validQuotes.reduce((acc, q) => acc + (q.total_sale_usd || 0), 0);
    const monthlyGrossSalesBs = monthlyGrossSalesUsd * DEFAULT_EXCHANGE_RATE;

    const avgMarkup = 25.0; // 25% margen promedio
    const monthlyNetMarginUsd = Math.round(monthlyGrossSalesUsd * (avgMarkup / 100));
    const monthlyNetMarginBs = monthlyNetMarginUsd * DEFAULT_EXCHANGE_RATE;

    // Viajeros activos en ruta o saliendo < 48h
    const nowTs = Date.now();
    const activeTravelersInRoute = passengers.length;
    const departuresNext48h = quotes.filter(q => {
      const startTs = new Date(q.travel_start_date).getTime();
      return startTs >= nowTs && startTs <= nowTs + 48 * 3600000;
    }).reduce((acc, q) => acc + q.adults_count + q.children_count, 0);

    const quotesCountDraft = quotes.filter(q => q.status === "draft").length;
    const quotesCountConfirmed = quotes.filter(q => q.status === "confirmed").length;
    const quotesCountPaidFull = quotes.filter(q => q.status === "paid_in_full" || q.status === "completed").length;

    const pendingPayables = supplierPayments.filter(sp => sp.status === "pending");
    const pendingSupplierPayablesUsd = pendingPayables.reduce((acc, sp) => acc + sp.amount_usd, 0);
    const pendingSupplierPayablesBs = pendingSupplierPayablesUsd * DEFAULT_EXCHANGE_RATE;

    // Deadlines < 72h
    const urgentDeadlinesCount = pendingPayables.filter(sp => {
      const d = new Date(sp.payment_deadline).getTime();
      return d <= nowTs + 72 * 3600000;
    }).length;

    return {
      monthlyGrossSalesUsd,
      monthlyGrossSalesBs,
      monthlyNetMarginUsd,
      monthlyNetMarginBs,
      averageMarkupPercentage: avgMarkup,
      activeTravelersInRoute,
      departuresNext48h,
      quotesCountDraft,
      quotesCountConfirmed,
      quotesCountPaidFull,
      pendingSupplierPayablesUsd,
      pendingSupplierPayablesBs,
      urgentDeadlinesCount
    };
  })();

  // Acciones CRUD
  const createQuote = async (data: Partial<AgencyQuote>): Promise<AgencyQuote> => {
    const qNum = `COT-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newQuote: AgencyQuote = {
      id: `q-${Date.now()}`,
      establishment_id: establishmentId,
      quote_number: qNum,
      client_name: data.client_name || "Cliente Agencia",
      client_email: data.client_email,
      client_phone: data.client_phone || "+58 414 000 0000",
      package_id: data.package_id,
      package_title: data.package_title || "Paquete a Medida",
      travel_start_date: data.travel_start_date || new Date().toISOString().split("T")[0],
      travel_end_date: data.travel_end_date || new Date(Date.now() + 3 * 24 * 3600000).toISOString().split("T")[0],
      adults_count: data.adults_count || 2,
      children_count: data.children_count || 0,
      total_sale_usd: data.total_sale_usd || 500,
      total_sale_bs: (data.total_sale_usd || 500) * DEFAULT_EXCHANGE_RATE,
      deposit_paid_usd: data.deposit_paid_usd || 0,
      remaining_balance_usd: (data.total_sale_usd || 500) - (data.deposit_paid_usd || 0),
      status: data.deposit_paid_usd && data.deposit_paid_usd >= (data.total_sale_usd || 500) ? "paid_in_full" : "confirmed",
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from("agency_quotes").insert([newQuote]);
    } catch (err) {
      console.warn("Direct quote insert fallback:", err);
    }

    setQuotes(prev => [newQuote, ...prev]);
    return newQuote;
  };

  const createPackage = async (pkgData: Partial<AgencyPackage>): Promise<AgencyPackage> => {
    const net = pkgData.net_cost_usd || 100;
    const markup = pkgData.markup_percentage || 25;
    const priceUsd = Math.round(net * (1 + markup / 100));

    const newPkg: AgencyPackage = {
      id: `pkg-${Date.now()}`,
      establishment_id: establishmentId,
      title: pkgData.title || "Nuevo Paquete Turístico",
      destination: pkgData.destination || "Venezuela",
      duration_days: pkgData.duration_days || 3,
      duration_nights: pkgData.duration_nights || 2,
      net_cost_usd: net,
      markup_percentage: markup,
      price_per_person_usd: priceUsd,
      price_per_person_bs: priceUsd * DEFAULT_EXCHANGE_RATE,
      min_passengers: pkgData.min_passengers || 2,
      inclusions: pkgData.inclusions || ["Hospedaje", "Traslados"],
      exclusions: pkgData.exclusions || ["Impuestos locales"],
      status: "active",
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from("agency_packages").insert([newPkg]);
    } catch (err) {
      console.warn("Direct package insert fallback:", err);
    }

    setPackages(prev => [newPkg, ...prev]);
    return newPkg;
  };

  const addPassenger = (pas: Partial<AgencyPassenger>) => {
    const newPas: AgencyPassenger = {
      id: `p-${Date.now()}`,
      quote_id: pas.quote_id || quotes[0]?.id || "q-7701",
      full_name: pas.full_name || "Pasajero Ejemplo",
      document_type: pas.document_type || "Cédula",
      document_number: pas.document_number || "V-00.000.000",
      birth_date: pas.birth_date,
      nationality: pas.nationality || "Venezolana",
      dietary_restrictions: pas.dietary_restrictions || "Ninguna",
      medical_conditions: pas.medical_conditions || "Ninguna",
      emergency_contact: pas.emergency_contact
    };

    setPassengers(prev => [...prev, newPas]);
  };

  const addItineraryDay = (day: Partial<AgencyItineraryDay>) => {
    const newDay: AgencyItineraryDay = {
      id: `itin-${Date.now()}`,
      quote_id: day.quote_id || quotes[0]?.id || "q-7701",
      day_number: day.day_number || 1,
      time_schedule: day.time_schedule || "08:00 AM",
      title: day.title || "Actividad Programada",
      description: day.description || "Descripción del itinerario de viaje.",
      location_name: day.location_name,
      outfit_recommendations: day.outfit_recommendations
    };

    setItineraries(prev => [...prev, newDay]);
  };

  const paySupplier = (paymentId: string, bankRef: string) => {
    setSupplierPayments(prev => prev.map(sp => {
      if (sp.id === paymentId) {
        return {
          ...sp,
          status: "paid",
          paid_at: new Date().toISOString(),
          bank_reference: bankRef || `REF-${Math.floor(100000 + Math.random() * 900000)}`
        };
      }
      return sp;
    }));
  };

  const addExpeditionExpense = (expense: Partial<ExpeditionExpense>) => {
    const newExp: ExpeditionExpense = {
      id: `exp-${Date.now()}`,
      establishment_id: establishmentId,
      quote_id: expense.quote_id,
      description: expense.description || "Gasto logístico de campo",
      category: expense.category || "imprevistos",
      amount_usd: expense.amount_usd || 0,
      amount_bs: (expense.amount_usd || 0) * DEFAULT_EXCHANGE_RATE,
      logged_by: expense.logged_by || "Agente de Operaciones",
      created_at: new Date().toISOString()
    };

    setExpeditionExpenses(prev => [newExp, ...prev]);
  };

  return {
    packages,
    quotes,
    passengers,
    itineraries,
    supplierPayments,
    expeditionExpenses,
    kpis,
    loading,
    createQuote,
    createPackage,
    addPassenger,
    addItineraryDay,
    paySupplier,
    addExpeditionExpense,
    refresh: loadData
  };
}
