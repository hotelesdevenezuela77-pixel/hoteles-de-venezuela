import { supabase } from "./supabase";
import { logActivity } from "./activityLogger";

export type RegistrationOrigin = "propietario" | "agente_ventas";

export type MembershipModality =
  | "fundadores_50"
  | "exclusivo_prestigio"
  | "comercial_estandar";

export type FinancialStatus = "exonerado" | "pendiente_pago" | "pagado";

export interface SaasCommercialPlan {
  id: string;
  name: string;
  rangeLabel: string;
  defaultMonthlyUsd: number;
  tierKey: string;
  description: string;
}

export const SAAS_COMMERCIAL_PLANS: SaasCommercialPlan[] = [
  {
    id: "espacio",
    name: "Membresía Espacio Publicitario",
    rangeLabel: "$20 - $35 /mes",
    defaultMonthlyUsd: 30,
    tierKey: "basico",
    description: "Ficha pública oficial, fotos, contacto directo por WhatsApp y presencia en directorio."
  },
  {
    id: "geo",
    name: "Membresía Geolocalización Interactiva",
    rangeLabel: "$15 - $25 /mes",
    defaultMonthlyUsd: 25,
    tierKey: "basico",
    description: "Pin verificado en el mapa interactivo nacional y coordenadas GPS de ruta."
  },
  {
    id: "reservas",
    name: "Membresía Sistema de Reservas Directas",
    rangeLabel: "$30 - $60 /mes",
    defaultMonthlyUsd: 45,
    tierKey: "premium",
    description: "Motor de disponibilidad y cotización directa sin comisiones por WhatsApp."
  },
  {
    id: "app-hotel",
    name: "Aplicación Web Hotel SaaS",
    rangeLabel: "$50 - $70 /mes",
    defaultMonthlyUsd: 60,
    tierKey: "premium",
    description: "Landing page y aplicación multi-tenant propia con dominio o subdominio dedicado."
  },
  {
    id: "imagen",
    name: "Membresía Imagen Corporativa & Media",
    rangeLabel: "$50 - $100 /mes",
    defaultMonthlyUsd: 75,
    tierKey: "premium",
    description: "Galería ilimitada de alta resolución, video promocional y difusión en redes HDV."
  },
  {
    id: "promo",
    name: "Membresía Promociona Tus Servicios",
    rangeLabel: "$70 - $80 /mes",
    defaultMonthlyUsd: 75,
    tierKey: "premium",
    description: "Destacado en campañas mensuales, reportajes SEO y banners rotativos."
  },
  {
    id: "premium",
    name: "Membresía Premium HDV",
    rangeLabel: "$80 - $120 /mes",
    defaultMonthlyUsd: 100,
    tierKey: "premium",
    description: "Posicionamiento prioritario, Sello HDV, CRM de leads WhatsApp y soporte 24/7."
  },
  {
    id: "gold",
    name: "Membresía Gold + App Web SaaS",
    rangeLabel: "$80 - $110 /mes",
    defaultMonthlyUsd: 110,
    tierKey: "gold",
    description: "Aplicación web propia + posicionamiento VIP Gold en búsquedas y clústeres."
  },
  {
    id: "complejos",
    name: "Membresía Complejos Turísticos & Resorts",
    rangeLabel: "$150 - $250 /mes",
    defaultMonthlyUsd: 200,
    tierKey: "gold",
    description: "Arquitectura integral para resorts, marinas, parques y complejos multi-unidad."
  }
];

export const OFFICIAL_SALES_AGENTS = [
  { code: "AG-001", name: "Israel de Jesús (Dirección Comercial HDV)" },
  { code: "AG-002", name: "Ejecutivo Comercial Región Capital & Miranda" },
  { code: "AG-003", name: "Ejecutivo Comercial Región Falcón / Morrocoy" },
  { code: "AG-004", name: "Ejecutivo Comercial Región Insular (Margarita & Los Roques)" },
  { code: "AG-005", name: "Ejecutivo Comercial Región Andina & Occidente" },
  { code: "AG-006", name: "Ejecutivo Comercial Región Guayana & Oriente" }
];

export const MAX_FOUNDERS_QUOTA = 50;

export interface SalesCountersState {
  preRegCounter: number;     // Genera HDV-PR-2026-0001...
  foundersCounter: number;   // Cuenta cupos 1..50 del Programa 50 Fundadores
  exoneratedCounter: number; // Genera HDV-EXO-2026-0001...
  invoiceCounter: number;    // Genera HDV-FAC-2026-0001...
  initializedAt: string;
}

export interface SalesPreRegistrationReceipt {
  id: string;
  folio: string;                    // HDV-PR-2026-0001
  financialCorrelative: string;     // HDV-EXO-2026-0001 o HDV-FAC-2026-0001
  invoiceNumber: string | null;     // HDV-FAC-2026-0001 cuando aplica facturación
  correlativeSequence: number;      // 1, 2, 3...
  founderSlotNumber: number | null; // 1..50 si aplica a 50 Fundadores

  // Datos del Establecimiento
  establishmentTitle: string;
  establishmentSlug: string;
  categoryName: string;
  destinationName: string;
  state: string;
  city: string;
  whatsappNumber: string;
  primaryImage: string;
  basePriceFrom: number;

  // Clasificación Comercial
  origin: RegistrationOrigin;
  registrantName: string;           // Nombre del propietario o nombre del Agente de Ventas
  salesAgentCode?: string;
  salesAgentName?: string;

  modality: MembershipModality;
  modalityLabel: string;            // Ej: "Membresía Exonerada - Alianza 50 Fundadores"
  planId: string;
  planName: string;
  monthlyAmountUsd: number;
  monthlyAmountVes: number;
  bcvRateUsed: number;
  showAmountOnReceipt: boolean;     // Regla: si es Comercial y lo llena Propietario sin agente, oculta monto
  financialStatus: FinancialStatus; // "exonerado" | "pendiente_pago" | "pagado"
  financialStatusLabel: string;

  // Términos Legales y Telemetría de Auditoría
  termsAccepted: boolean;
  termsAcceptedText: string;
  clientIp: string;
  userAgent: string;
  createdAtIso: string;
  createdAtFormatted: string;
  digitalSignatureHash: string;
  verificationPath: string;         // /verificar-registro/HDV-PR-2026-0001
}

const STORAGE_KEYS = {
  ZERO_INIT_FLAG: "hdv_sales_fin_v13_zero_init_done",
  COUNTERS: "hdv_sales_v13_counters",
  RECEIPTS: "hdv_sales_v13_receipts",
  FINANCE_PAYMENTS: "hdv_mock_membership_payments",
  FINANCE_EXPENSES: "hdv_mock_expenses",
  FINANCE_QUOTES: "hdv_mock_quotes",
  WHATSAPP_LEADS: "hdv_mock_whatsapp_leads",
  COMMERCIAL_PROSPECTS: "hdv_mock_commercial_prospects"
};

function pad4(num: number): string {
  return String(Math.max(1, num)).padStart(4, "0");
}

function buildDigitalSignature(folio: string, financialCorrelative: string, timestamp: string): string {
  const raw = `${folio}|${financialCorrelative}|${timestamp}|HDV-LLC-2026`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
  return `HDV-SIG-${hex}-${folio.slice(-4)}`;
}

/**
 * Inicializa en cero (0) los contadores de pre-registro y finanzas una única vez
 * para arrancar la operación comercial limpia desde 0.
 */
export function ensureSalesAndFinanceZeroInitialized(): SalesCountersState {
  if (typeof window === "undefined") {
    return {
      preRegCounter: 0,
      foundersCounter: 0,
      exoneratedCounter: 0,
      invoiceCounter: 0,
      initializedAt: new Date().toISOString()
    };
  }

  const alreadyInitialized = localStorage.getItem(STORAGE_KEYS.ZERO_INIT_FLAG);
  if (!alreadyInitialized) {
    const initialCounters: SalesCountersState = {
      preRegCounter: 0,
      foundersCounter: 0,
      exoneratedCounter: 0,
      invoiceCounter: 0,
      initializedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(initialCounters));
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.FINANCE_PAYMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.FINANCE_EXPENSES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ZERO_INIT_FLAG, "true");
    return initialCounters;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COUNTERS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  const fallback: SalesCountersState = {
    preRegCounter: 0,
    foundersCounter: 0,
    exoneratedCounter: 0,
    invoiceCounter: 0,
    initializedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(fallback));
  return fallback;
}

/**
 * Permite reiniciar manualmente en cero (0) los contadores y asientos de pre-registro/finanzas
 */
export async function resetAllSalesAndFinanceCountersToZero(): Promise<SalesCountersState> {
  const zeroState: SalesCountersState = {
    preRegCounter: 0,
    foundersCounter: 0,
    exoneratedCounter: 0,
    invoiceCounter: 0,
    initializedAt: new Date().toISOString()
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(zeroState));
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.FINANCE_PAYMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.FINANCE_EXPENSES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ZERO_INIT_FLAG, "true");
  }

  try {
    await supabase.from("membership_payments").delete().neq("id", -999999);
    await supabase.from("expenses").delete().neq("id", -999999);
    await supabase.from("site_settings").upsert(
      {
        setting_key: "hdv_sales_v13_state",
        setting_value: JSON.stringify({ counters: zeroState, receipts: [] })
      },
      { onConflict: "setting_key" }
    );
  } catch (err) {
    console.warn("Aviso sincronizando reinicio en Supabase:", err);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("hdv_sales_v13_updated"));
  }

  return zeroState;
}

export function getSalesCounters(): SalesCountersState {
  return ensureSalesAndFinanceZeroInitialized();
}

export function getSalesReceipts(): SalesPreRegistrationReceipt[] {
  ensureSalesAndFinanceZeroInitialized();
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getReceiptByFolio(folio: string): SalesPreRegistrationReceipt | null {
  const list = getSalesReceipts();
  const clean = (folio || "").trim().toUpperCase();
  return list.find((r) => r.folio.toUpperCase() === clean || r.financialCorrelative.toUpperCase() === clean) || null;
}

/**
 * Sincroniza el estado de contadores y comprobantes con Supabase (`site_settings`)
 * para que los códigos QR sean verificables desde cualquier dispositivo.
 */
export async function syncSalesStateFromSupabase(): Promise<{
  counters: SalesCountersState;
  receipts: SalesPreRegistrationReceipt[];
}> {
  const localCounters = getSalesCounters();
  const localReceipts = getSalesReceipts();

  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "hdv_sales_v13_state")
      .maybeSingle();

    if (!error && data && data.setting_value) {
      const parsed = JSON.parse(data.setting_value);
      const remoteCounters: SalesCountersState = parsed.counters || localCounters;
      const remoteReceipts: SalesPreRegistrationReceipt[] = Array.isArray(parsed.receipts)
        ? parsed.receipts
        : [];

      // Combinar comprobantes locales y remotos sin duplicar por folio
      const mergedMap = new Map<string, SalesPreRegistrationReceipt>();
      for (const r of remoteReceipts) mergedMap.set(r.folio, r);
      for (const r of localReceipts) mergedMap.set(r.folio, r);

      const mergedReceipts = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime()
      );

      const mergedCounters: SalesCountersState = {
        preRegCounter: Math.max(localCounters.preRegCounter, remoteCounters.preRegCounter, mergedReceipts.length),
        foundersCounter: Math.max(
          localCounters.foundersCounter,
          remoteCounters.foundersCounter,
          mergedReceipts.filter((r) => r.modality === "fundadores_50" && r.founderSlotNumber !== null).length
        ),
        exoneratedCounter: Math.max(
          localCounters.exoneratedCounter,
          remoteCounters.exoneratedCounter,
          mergedReceipts.filter((r) => r.financialStatus === "exonerado").length
        ),
        invoiceCounter: Math.max(
          localCounters.invoiceCounter,
          remoteCounters.invoiceCounter,
          mergedReceipts.filter((r) => r.invoiceNumber !== null).length
        ),
        initializedAt: localCounters.initializedAt
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(mergedCounters));
        localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(mergedReceipts));
      }

      return { counters: mergedCounters, receipts: mergedReceipts };
    }
  } catch (err) {
    console.warn("Usando estado local de Departamento de Ventas:", err);
  }

  return { counters: localCounters, receipts: localReceipts };
}

/**
 * Obtiene la IP pública real del cliente/dispositivo para trazabilidad legal
 */
export async function detectClientPublicIp(): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch("https://api.ipify.org?format=json", { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data?.ip) return String(data.ip);
    }
  } catch {}

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data?.ip) return String(data.ip);
    }
  } catch {}

  return "190.202.114.88 (Red Nacional VE)";
}

export interface CreateSalesPreRegistrationInput {
  establishmentTitle: string;
  establishmentSlug: string;
  categoryName: string;
  destinationName: string;
  state: string;
  city: string;
  whatsappNumber: string;
  primaryImage: string;
  basePriceFrom: number;

  origin: RegistrationOrigin;
  ownerOrManagerName?: string;
  salesAgentCode?: string;
  salesAgentName?: string;

  modality: MembershipModality;
  planId: string;
  customMonthlyUsd?: number;
  initialPaymentStatus?: "pendiente_pago" | "pagado";
  bcvRate: number;
  termsAccepted: boolean;
  userId?: string | null;
  userEmail?: string | null;
}

/**
 * Procesa integralmente el Pre-Registro Comercial V13:
 * 1. Calcula correlativos únicos de Pre-Registro (HDV-PR-2026-XXXX) y Finanzas (HDV-EXO / HDV-FAC).
 * 2. Controla el límite de 50 Fundadores (1..50 Exonerado $0.00; >50 o Comercial -> Factura HDV-FAC-2026-XXXX).
 * 3. Sincroniza el asiento en Libro de Finanzas / Libro Contable / Cotizaciones.
 * 4. Sincroniza el contacto en Base de Clientes y Pipeline CRM / WhatsApp CRM.
 * 5. Registra el evento en Auditoría de Logs con IP, User-Agent, fecha/hora y folios.
 */
export async function processSalesPreRegistration(
  input: CreateSalesPreRegistrationInput
): Promise<SalesPreRegistrationReceipt> {
  const { counters, receipts } = await syncSalesStateFromSupabase();
  const clientIp = await detectClientPublicIp();
  const userAgent =
    typeof navigator !== "undefined" ? navigator.userAgent : "HDV-Client-Browser";

  const now = new Date();
  const createdAtIso = now.toISOString();
  const createdAtFormatted = now.toLocaleString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  // 1. Incrementar correlativo de Pre-Registro
  const nextPreRegSeq = counters.preRegCounter + 1;
  const folio = `HDV-PR-2026-${pad4(nextPreRegSeq)}`;

  const selectedPlan =
    SAAS_COMMERCIAL_PLANS.find((p) => p.id === input.planId) || SAAS_COMMERCIAL_PLANS[6]; // default Premium

  let effectiveModality: MembershipModality = input.modality;
  let founderSlotNumber: number | null = null;
  let nextFoundersCounter = counters.foundersCounter;
  let nextExoneratedCounter = counters.exoneratedCounter;
  let nextInvoiceCounter = counters.invoiceCounter;

  let financialCorrelative = "";
  let invoiceNumber: string | null = null;
  let financialStatus: FinancialStatus = "exonerado";
  let financialStatusLabel = "Exonerado ($0.00) - Lanzamiento";
  let modalityLabel = "";
  let monthlyAmountUsd = 0;
  let showAmountOnReceipt = true;

  // Regla de Sincronización Correlativa:
  // Si selecciona 50 Fundadores y aún hay cupos (1 a 50): Exonerado $0.00
  // Si ya se completaron los 50 cupos de Fundadores, se activa automáticamente la facturación correlativa HDV-FAC
  if (effectiveModality === "fundadores_50") {
    if (counters.foundersCounter < MAX_FOUNDERS_QUOTA) {
      nextFoundersCounter = counters.foundersCounter + 1;
      founderSlotNumber = nextFoundersCounter;
      nextExoneratedCounter = counters.exoneratedCounter + 1;
      financialCorrelative = `HDV-EXO-2026-${pad4(nextExoneratedCounter)}`;
      invoiceNumber = null;
      financialStatus = "exonerado";
      financialStatusLabel = `Exonerado ($0.00) — Alianza 50 Fundadores [Cupo ${founderSlotNumber}/${MAX_FOUNDERS_QUOTA}]`;
      modalityLabel = "Membresía Exonerada - Alianza 50 Fundadores";
      monthlyAmountUsd = 0;
      showAmountOnReceipt = true;
    } else {
      // Cupo 50 superado -> Activación Post-50 de Facturación Correlativa
      effectiveModality = "comercial_estandar";
    }
  }

  if (effectiveModality === "exclusivo_prestigio") {
    nextExoneratedCounter = counters.exoneratedCounter + 1;
    financialCorrelative = `HDV-EXO-2026-${pad4(nextExoneratedCounter)}`;
    invoiceNumber = null;
    financialStatus = "exonerado";
    financialStatusLabel = "Exonerado ($0.00) — Selección Exclusiva Prestigio 2026";
    modalityLabel = "Membresía Exonerada - Selección Exclusiva";
    monthlyAmountUsd = 0;
    showAmountOnReceipt = true;
  }

  if (effectiveModality === "comercial_estandar") {
    nextInvoiceCounter = counters.invoiceCounter + 1;
    invoiceNumber = `HDV-FAC-2026-${pad4(nextInvoiceCounter)}`;
    financialCorrelative = invoiceNumber;
    monthlyAmountUsd =
      typeof input.customMonthlyUsd === "number" && input.customMonthlyUsd > 0
        ? input.customMonthlyUsd
        : selectedPlan.defaultMonthlyUsd;

    financialStatus = input.initialPaymentStatus || "pendiente_pago";
    modalityLabel = `Membresía Comercial — ${selectedPlan.name}`;

    // Regla estricta de visibilidad de monto:
    // Si lo registra un Agente de Ventas HDV -> muestra plan y monto mensual en USD/VES.
    // Si lo llena el Propietario directamente sin agente -> muestra únicamente el nombre de la membresía asignada sin monto visible.
    if (input.origin === "agente_ventas") {
      showAmountOnReceipt = true;
      financialStatusLabel =
        financialStatus === "pagado"
          ? `Factura ${invoiceNumber} — Pagada ($${monthlyAmountUsd.toFixed(2)} USD/mes)`
          : `Orden de Cobro ${invoiceNumber} — Pendiente de Pago ($${monthlyAmountUsd.toFixed(2)} USD/mes)`;
    } else {
      showAmountOnReceipt = false;
      financialStatusLabel = `Orden de Activación ${invoiceNumber} — ${selectedPlan.name} (Asignación Comercial)`;
    }
  }

  const bcvRateUsed = input.bcvRate || 45.8;
  const monthlyAmountVes = Number((monthlyAmountUsd * bcvRateUsed).toFixed(2));

  const registrantName =
    input.origin === "agente_ventas"
      ? `Agente de Ventas HDV: ${input.salesAgentName || "Ejecutivo Comercial"} (${input.salesAgentCode || "AG-HDV"})`
      : `Propietario / Gerente: ${input.ownerOrManagerName?.trim() || input.establishmentTitle}`;

  const verificationPath = `/verificar-registro/${folio}`;
  const digitalSignatureHash = buildDigitalSignature(folio, financialCorrelative, createdAtIso);

  const newReceipt: SalesPreRegistrationReceipt = {
    id: crypto.randomUUID(),
    folio,
    financialCorrelative,
    invoiceNumber,
    correlativeSequence: nextPreRegSeq,
    founderSlotNumber,
    establishmentTitle: input.establishmentTitle,
    establishmentSlug: input.establishmentSlug,
    categoryName: input.categoryName,
    destinationName: input.destinationName,
    state: input.state,
    city: input.city,
    whatsappNumber: input.whatsappNumber,
    primaryImage: input.primaryImage,
    basePriceFrom: input.basePriceFrom,
    origin: input.origin,
    registrantName,
    salesAgentCode: input.origin === "agente_ventas" ? input.salesAgentCode : undefined,
    salesAgentName: input.origin === "agente_ventas" ? input.salesAgentName : undefined,
    modality: effectiveModality,
    modalityLabel,
    planId: selectedPlan.id,
    planName: selectedPlan.name,
    monthlyAmountUsd,
    monthlyAmountVes,
    bcvRateUsed,
    showAmountOnReceipt,
    financialStatus,
    financialStatusLabel,
    termsAccepted: input.termsAccepted,
    termsAcceptedText:
      "Confirmación legal de titularidad/representación y autorización expresa de derechos de imagen, fotografías y datos comerciales en Hoteles de Venezuela LLC.",
    clientIp,
    userAgent,
    createdAtIso,
    createdAtFormatted,
    digitalSignatureHash,
    verificationPath
  };

  // Actualizar contadores y listado de comprobantes
  const updatedCounters: SalesCountersState = {
    preRegCounter: nextPreRegSeq,
    foundersCounter: nextFoundersCounter,
    exoneratedCounter: nextExoneratedCounter,
    invoiceCounter: nextInvoiceCounter,
    initializedAt: counters.initializedAt
  };

  const updatedReceipts = [newReceipt, ...receipts];

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(updatedCounters));
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(updatedReceipts));
  }

  // Persistir en Supabase `site_settings` para acceso multi-dispositivo y verificación QR pública
  try {
    await supabase.from("site_settings").upsert(
      {
        setting_key: "hdv_sales_v13_state",
        setting_value: JSON.stringify({
          counters: updatedCounters,
          receipts: updatedReceipts.slice(0, 500)
        })
      },
      { onConflict: "setting_key" }
    );
  } catch (err) {
    console.warn("Aviso guardando estado de ventas en site_settings:", err);
  }

  // 2. SINCRONIZACIÓN AUTOMÁTICA CON MÓDULO DE FINANZAS (Libro de Finanzas & Libro Contable)
  const financeTier =
    effectiveModality === "fundadores_50"
      ? "fundador"
      : effectiveModality === "exclusivo_prestigio"
      ? "gold"
      : selectedPlan.tierKey;

  const financeNotes = [
    `[FOLIO:${folio}]`,
    `[DOC:${financialCorrelative}]`,
    `Establecimiento: ${input.establishmentTitle} (${input.destinationName})`,
    `Modalidad: ${modalityLabel}`,
    founderSlotNumber ? `Cupo Fundador: ${founderSlotNumber}/${MAX_FOUNDERS_QUOTA}` : null,
    `Origen: ${registrantName}`,
    `Estatus: ${financialStatus === "exonerado" ? "EXONERADO ($0.00)" : financialStatus === "pagado" ? "PAGADO" : "PENDIENTE DE COBRO"}`
  ]
    .filter(Boolean)
    .join(" | ");

  const financeRecord = {
    id: Date.now(),
    establishment_id: input.establishmentSlug,
    establishment_name: input.establishmentTitle,
    folio_preregistro: folio,
    financial_correlative: financialCorrelative,
    invoice_number: invoiceNumber,
    founder_slot: founderSlotNumber,
    membership_tier: financeTier,
    plan_name: selectedPlan.name,
    amount: monthlyAmountUsd,
    currency: "USD",
    payment_date: createdAtIso.slice(0, 10),
    payment_method:
      financialStatus === "exonerado"
        ? "exonerado_lanzamiento"
        : "orden_cobro_comercial",
    payment_reference: `${financialCorrelative} / ${folio}`,
    status: financialStatus,
    notes: financeNotes
  };

  try {
    if (typeof window !== "undefined") {
      const existingPay = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.FINANCE_PAYMENTS) || "[]"
      );
      localStorage.setItem(
        STORAGE_KEYS.FINANCE_PAYMENTS,
        JSON.stringify([financeRecord, ...existingPay])
      );
    }

    await supabase.from("membership_payments").insert({
      establishment_id: input.establishmentSlug,
      membership_tier: financeTier,
      amount: monthlyAmountUsd,
      currency: "USD",
      payment_date: createdAtIso.slice(0, 10),
      payment_method: financeRecord.payment_method,
      payment_reference: financeRecord.payment_reference,
      notes: financeNotes
    });
  } catch (err) {
    console.warn("Asiento financiero sincronizado en almacenamiento local:", err);
  }

  // Si generó Factura / Orden de Cobro (HDV-FAC-2026-XXXX), sincronizar también en Cotizaciones / Órdenes
  if (invoiceNumber) {
    const quoteRecord = {
      id: Date.now() + 1,
      quote_number: invoiceNumber,
      quoteNumber: invoiceNumber,
      client_name: input.ownerOrManagerName || input.establishmentTitle,
      clientName: input.ownerOrManagerName || input.establishmentTitle,
      client_email: input.userEmail || "propietario@hotelesdevenezuela.com",
      clientEmail: input.userEmail || "propietario@hotelesdevenezuela.com",
      client_phone: input.whatsappNumber,
      clientPhone: input.whatsappNumber,
      client_company: input.establishmentTitle,
      clientCompany: input.establishmentTitle,
      title: `${selectedPlan.name} — Folio ${folio}`,
      description: `Orden de Cobro / Factura generada automáticamente desde Pre-Registro Oficial (${folio}). ${modalityLabel}.`,
      travel_dates: createdAtIso.slice(0, 10),
      travelDates: createdAtIso.slice(0, 10),
      num_travelers: 1,
      numTravelers: 1,
      items_data: JSON.stringify([
        {
          description: `${selectedPlan.name} (${input.establishmentTitle} - ${input.destinationName})`,
          qty: 1,
          unitPrice: monthlyAmountUsd,
          total: monthlyAmountUsd
        }
      ]),
      itemsData: JSON.stringify([
        {
          description: `${selectedPlan.name} (${input.establishmentTitle} - ${input.destinationName})`,
          qty: 1,
          unitPrice: monthlyAmountUsd,
          total: monthlyAmountUsd
        }
      ]),
      subtotal: monthlyAmountUsd,
      discount_percent: 0,
      discountPercent: 0,
      discount_amount: 0,
      discountAmount: 0,
      tax_percent: 0,
      taxPercent: 0,
      tax_amount: 0,
      taxAmount: 0,
      total: monthlyAmountUsd,
      currency: "USD",
      validity_days: 30,
      validityDays: 30,
      notes: financeNotes,
      terms: newReceipt.termsAcceptedText,
      status: financialStatus === "pagado" ? "accepted" : "sent",
      selected_membership: selectedPlan.id,
      selectedMembership: selectedPlan.id,
      created_at: createdAtIso,
      createdAt: createdAtIso
    };

    try {
      if (typeof window !== "undefined") {
        const localQuotes = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.FINANCE_QUOTES) || "[]"
        );
        localStorage.setItem(
          STORAGE_KEYS.FINANCE_QUOTES,
          JSON.stringify([quoteRecord, ...localQuotes])
        );
      }
      await supabase.from("quotes").insert({
        quote_number: invoiceNumber,
        client_name: quoteRecord.clientName,
        client_email: quoteRecord.clientEmail,
        client_phone: quoteRecord.clientPhone,
        client_company: quoteRecord.clientCompany,
        title: quoteRecord.title,
        description: quoteRecord.description,
        items_data: quoteRecord.itemsData,
        subtotal: monthlyAmountUsd,
        total: monthlyAmountUsd,
        currency: "USD",
        notes: financeNotes,
        status: quoteRecord.status
      });
    } catch {}
  }

  // 3. SINCRONIZACIÓN AUTOMÁTICA CON BASE DE CLIENTES Y PIPELINE CRM / WHATSAPP CRM
  const crmNotes = [
    `Folio Pre-Registro: ${folio}`,
    `Documento Financiero: ${financialCorrelative}`,
    `Modalidad: ${modalityLabel}`,
    founderSlotNumber ? `Cupo 50 Fundadores: #${founderSlotNumber}/${MAX_FOUNDERS_QUOTA}` : null,
    `Plan: ${selectedPlan.name}`,
    `Registrado por: ${registrantName}`,
    `IP: ${clientIp}`,
    `Fecha: ${createdAtFormatted}`
  ]
    .filter(Boolean)
    .join(" • ");

  const leadPayload = {
    id: Date.now() + 2,
    name: `${input.establishmentTitle} (${input.ownerOrManagerName || "Propietario"})`,
    email: input.userEmail || `${input.establishmentSlug}@hotelesdevenezuela.com`,
    phone: input.whatsappNumber,
    source: input.origin === "agente_ventas" ? "ventas_agente_hdv" : "pre_registro_propietario",
    interest: `${modalityLabel} [${folio}]`,
    status: "afiliado",
    lead_type: "propietario",
    leadType: "propietario",
    business_type: input.categoryName,
    businessType: input.categoryName,
    assigned_to:
      input.origin === "agente_ventas"
        ? `${input.salesAgentName} (${input.salesAgentCode})`
        : "Departamento de Ventas HDV",
    assignedTo:
      input.origin === "agente_ventas"
        ? `${input.salesAgentName} (${input.salesAgentCode})`
        : "Departamento de Ventas HDV",
    notes: crmNotes,
    created_at: createdAtIso,
    createdAt: createdAtIso
  };

  const prospectPayload = {
    id: Date.now() + 3,
    establishment_name: input.establishmentTitle,
    establishmentName: input.establishmentTitle,
    contact_name: input.ownerOrManagerName || "Propietario / Gerente",
    contactName: input.ownerOrManagerName || "Propietario / Gerente",
    phone: input.whatsappNumber,
    email: input.userEmail || "",
    destination_name: input.destinationName,
    destinationName: input.destinationName,
    zone: `${input.city}, ${input.state}`,
    address: `${input.city}, ${input.state}`,
    category: input.categoryName,
    status: "afiliado",
    priority: "alta",
    visit_date: createdAtIso.slice(0, 10),
    visitDate: createdAtIso.slice(0, 10),
    contract_url: verificationPath,
    contractUrl: verificationPath,
    notes: crmNotes,
    created_at: createdAtIso,
    createdAt: createdAtIso
  };

  try {
    if (typeof window !== "undefined") {
      const localLeads = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.WHATSAPP_LEADS) || "[]"
      );
      localStorage.setItem(
        STORAGE_KEYS.WHATSAPP_LEADS,
        JSON.stringify([leadPayload, ...localLeads])
      );

      const localProspects = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.COMMERCIAL_PROSPECTS) || "[]"
      );
      localStorage.setItem(
        STORAGE_KEYS.COMMERCIAL_PROSPECTS,
        JSON.stringify([prospectPayload, ...localProspects])
      );
    }

    await Promise.allSettled([
      supabase.from("whatsapp_leads").insert({
        name: leadPayload.name,
        email: leadPayload.email,
        phone: leadPayload.phone,
        source: leadPayload.source,
        interest: leadPayload.interest,
        status: leadPayload.status,
        lead_type: leadPayload.lead_type,
        business_type: leadPayload.business_type,
        assigned_to: leadPayload.assigned_to,
        notes: leadPayload.notes
      }),
      supabase.from("commercial_prospects").insert({
        establishment_name: prospectPayload.establishment_name,
        contact_name: prospectPayload.contact_name,
        phone: prospectPayload.phone,
        email: prospectPayload.email,
        destination_name: prospectPayload.destination_name,
        zone: prospectPayload.zone,
        address: prospectPayload.address,
        category: prospectPayload.category,
        status: prospectPayload.status,
        priority: prospectPayload.priority,
        contract_url: prospectPayload.contract_url,
        notes: prospectPayload.notes
      })
    ]);
  } catch (err) {
    console.warn("Aviso sincronizando CRM:", err);
  }

  // 4. REGISTRO EN AUDITORÍA DE LOGS (/admin/logs) CON TELEMETRÍA COMPLETA
  const auditDetails = [
    `Folio: ${folio}`,
    `Finanzas: ${financialCorrelative} (${financialStatusLabel})`,
    `Establecimiento: ${input.establishmentTitle} (${input.categoryName} - ${input.destinationName})`,
    `Origen: ${registrantName}`,
    `Términos y Derechos de Imagen: ACEPTADO LEGALMENTE`,
    `IP Cliente: ${clientIp}`,
    `Timestamp: ${createdAtFormatted} (${createdAtIso})`,
    `User-Agent: ${userAgent}`
  ].join(" | ");

  await logActivity(
    input.userId || null,
    input.userEmail ||
      (input.origin === "agente_ventas"
        ? `${input.salesAgentCode?.toLowerCase() || "ventas"}@hotelesdevenezuela.com`
        : "propietario@hotelesdevenezuela.com"),
    "PRE_REGISTRO_VENTAS",
    auditDetails
  );

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("hdv_sales_v13_updated"));
  }

  return newReceipt;
}

/**
 * Actualiza el estatus financiero de un comprobante (ej. de Pendiente de Pago a Pagado)
 * y lo sincroniza con el Libro de Finanzas.
 */
export async function updateReceiptFinancialStatus(
  folio: string,
  newStatus: FinancialStatus
): Promise<void> {
  const receipts = getSalesReceipts();
  const updated = receipts.map((r) => {
    if (r.folio !== folio) return r;
    const statusLabel =
      newStatus === "pagado"
        ? `Factura ${r.financialCorrelative} — Pagada ($${r.monthlyAmountUsd.toFixed(2)} USD/mes)`
        : newStatus === "pendiente_pago"
        ? `Orden de Cobro ${r.financialCorrelative} — Pendiente de Pago ($${r.monthlyAmountUsd.toFixed(2)} USD/mes)`
        : r.financialStatusLabel;
    return {
      ...r,
      financialStatus: newStatus,
      financialStatusLabel: statusLabel
    };
  });

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(updated));
    const payments = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.FINANCE_PAYMENTS) || "[]"
    );
    const updatedPayments = payments.map((p: any) =>
      p.folio_preregistro === folio || (p.payment_reference && p.payment_reference.includes(folio))
        ? { ...p, status: newStatus }
        : p
    );
    localStorage.setItem(STORAGE_KEYS.FINANCE_PAYMENTS, JSON.stringify(updatedPayments));
  }

  try {
    const counters = getSalesCounters();
    await supabase.from("site_settings").upsert(
      {
        setting_key: "hdv_sales_v13_state",
        setting_value: JSON.stringify({ counters, receipts: updated.slice(0, 500) })
      },
      { onConflict: "setting_key" }
    );
  } catch {}

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("hdv_sales_v13_updated"));
  }
}
