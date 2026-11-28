import { supabase } from "./supabase";
import { logActivity } from "./activityLogger";
import { ESTABLISHMENTS_MOCK } from "./establishmentsMock";

/**
 * Normaliza un nombre comercial ignorando mayúsculas, tildes, puntuación y espacios extra
 * para detección exacta o equivalente sin duplicados.
 */
export function normalizeEstablishmentName(value?: string | null): string {
  if (!value) return "";
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normaliza un número de WhatsApp o teléfono dejando los últimos dígitos significativos
 * (ej. últimos 10 dígitos para comparar +58 412-1234567 con 04121234567 o 584121234567).
 */
export function normalizePhoneKey(value?: string | null): string {
  if (!value) return "";
  const digits = String(value).replace(/\D/g, "");
  if (digits.length < 7) return "";
  return digits.slice(-10);
}

/**
 * Verifica si dos nombres o números de teléfono corresponden al mismo establecimiento/cliente.
 */
export function isSameEstablishmentOrClient(
  a: { name?: string | null; phone?: string | null; whatsapp?: string | null; slug?: string | null },
  b: { name?: string | null; phone?: string | null; whatsapp?: string | null; slug?: string | null }
): boolean {
  if (a.slug && b.slug && a.slug.trim().toLowerCase() === b.slug.trim().toLowerCase()) {
    return true;
  }
  const nameA = normalizeEstablishmentName(a.name);
  const nameB = normalizeEstablishmentName(b.name);
  if (nameA && nameB && nameA === nameB) {
    return true;
  }
  const phoneA = normalizePhoneKey(a.whatsapp || a.phone);
  const phoneB = normalizePhoneKey(b.whatsapp || b.phone);
  // Evitar falsos positivos con el número genérico de ejemplo "+58 412 1234567" si los nombres son distintos
  const isPlaceholderPhone = phoneA === "4121234567" || phoneB === "4121234567";
  if (phoneA && phoneB && phoneA === phoneB && !isPlaceholderPhone) {
    return true;
  }
  return false;
}

export interface ExistingEstablishmentMatch {
  matched: boolean;
  matchReason: "nombre" | "whatsapp" | "slug" | null;
  source: "supabase" | "local" | "mock" | null;
  id?: number | string;
  slug: string;
  name: string;
  categoryName?: string;
  destinationName?: string;
  state?: string;
  city?: string;
  address?: string;
  whatsapp?: string;
  phone?: string;
  description?: string;
  primaryImage?: string;
  galleryImages?: string[];
  ratingAvg?: number;
  services?: string[];
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Busca en Supabase (`establishments` y `properties`), `localStorage` (`hdv_mock_establishments`) y `ESTABLISHMENTS_MOCK`
 * si ya existe un establecimiento con el mismo nombre normalizado o el mismo WhatsApp/teléfono principal.
 */
export async function findExistingEstablishmentMatch(params: {
  title: string;
  whatsappNumber?: string;
  candidateSlug?: string;
}): Promise<ExistingEstablishmentMatch | null> {
  const normTitle = normalizeEstablishmentName(params.title);
  const normPhone = normalizePhoneKey(params.whatsappNumber);
  const isPlaceholderPhone = normPhone === "4121234567";

  if (!normTitle && !normPhone) return null;

  // 1. Buscar en Supabase `establishments`
  try {
    const { data: dbEsts } = await supabase
      .from("establishments")
      .select(`
        *,
        categories (name, slug),
        destinations (name, slug, state),
        establishment_images (image_url, is_primary)
      `);

    if (Array.isArray(dbEsts) && dbEsts.length > 0) {
      for (const item of dbEsts) {
        const itemNameNorm = normalizeEstablishmentName(item.name);
        const itemPhoneNorm = normalizePhoneKey(item.whatsapp || item.phone);
        const bySlug =
          params.candidateSlug &&
          item.slug &&
          String(item.slug).toLowerCase() === params.candidateSlug.toLowerCase();
        const byName = Boolean(normTitle && itemNameNorm && normTitle === itemNameNorm);
        const byPhone = Boolean(
          normPhone &&
            !isPlaceholderPhone &&
            itemPhoneNorm &&
            normPhone === itemPhoneNorm
        );

        if (byName || byPhone || bySlug) {
          const imgs: string[] = Array.isArray(item.establishment_images)
            ? item.establishment_images
                .map((img: any) => img?.image_url)
                .filter(Boolean)
            : [];
          const primary =
            item.establishment_images?.find((img: any) => img?.is_primary)?.image_url ||
            imgs[0] ||
            item.primary_image ||
            "";

          return {
            matched: true,
            matchReason: byName ? "nombre" : byPhone ? "whatsapp" : "slug",
            source: "supabase",
            id: item.id,
            slug: item.slug,
            name: item.name,
            categoryName: item.categories?.name || item.category_name,
            destinationName: item.destinations?.name || item.destination_name,
            state: item.destinations?.state || item.state,
            city: item.city,
            address: item.address,
            whatsapp: item.whatsapp || item.phone,
            phone: item.phone || item.whatsapp,
            description: item.description,
            primaryImage: primary,
            galleryImages: imgs,
            ratingAvg: Number(item.rating_avg) || 4.8,
            services: item.services,
            latitude: item.latitude ?? null,
            longitude: item.longitude ?? null
          };
        }
      }
    }
  } catch (err) {
    console.warn("Aviso consultando establecimientos existentes en Supabase:", err);
  }

  // 2. Buscar en localStorage `hdv_mock_establishments`
  if (typeof window !== "undefined") {
    try {
      const localEsts: any[] = JSON.parse(
        localStorage.getItem("hdv_mock_establishments") || "[]"
      );
      for (const item of localEsts) {
        const itemNameNorm = normalizeEstablishmentName(item.name);
        const itemPhoneNorm = normalizePhoneKey(item.whatsapp || item.phone);
        const bySlug =
          params.candidateSlug &&
          item.slug &&
          String(item.slug).toLowerCase() === params.candidateSlug.toLowerCase();
        const byName = Boolean(normTitle && itemNameNorm && normTitle === itemNameNorm);
        const byPhone = Boolean(
          normPhone &&
            !isPlaceholderPhone &&
            itemPhoneNorm &&
            normPhone === itemPhoneNorm
        );

        if (byName || byPhone || bySlug) {
          return {
            matched: true,
            matchReason: byName ? "nombre" : byPhone ? "whatsapp" : "slug",
            source: "local",
            id: item.id,
            slug: item.slug,
            name: item.name,
            categoryName: item.category_name,
            destinationName: item.destination_name,
            state: item.state,
            city: item.city,
            address: item.address,
            whatsapp: item.whatsapp || item.phone,
            phone: item.phone || item.whatsapp,
            description: item.description,
            primaryImage: item.primary_image,
            galleryImages: Array.isArray(item.images) ? item.images : item.primary_image ? [item.primary_image] : [],
            ratingAvg: Number(item.rating_avg) || 4.8,
            services: item.services,
            latitude: item.latitude ?? null,
            longitude: item.longitude ?? null
          };
        }
      }
    } catch {}
  }

  // 3. Buscar en fichas precargadas de muestra `ESTABLISHMENTS_MOCK`
  for (const item of ESTABLISHMENTS_MOCK) {
    const itemNameNorm = normalizeEstablishmentName(item.name);
    const itemPhoneNorm = normalizePhoneKey(item.whatsapp || item.phone);
    const bySlug =
      params.candidateSlug &&
      item.slug &&
      String(item.slug).toLowerCase() === params.candidateSlug.toLowerCase();
    const byName = Boolean(normTitle && itemNameNorm && normTitle === itemNameNorm);
    const byPhone = Boolean(
      normPhone &&
        !isPlaceholderPhone &&
        itemPhoneNorm &&
        normPhone === itemPhoneNorm
    );

    if (byName || byPhone || bySlug) {
      return {
        matched: true,
        matchReason: byName ? "nombre" : byPhone ? "whatsapp" : "slug",
        source: "mock",
        id: item.id,
        slug: item.slug,
        name: item.name,
        categoryName: item.category_name,
        destinationName: item.destination_name,
        address: item.address,
        whatsapp: item.whatsapp || item.phone,
        phone: item.phone || item.whatsapp,
        description: item.description,
        primaryImage: item.primary_image,
        galleryImages: item.primary_image ? [item.primary_image] : [],
        ratingAvg: Number(item.rating_avg) || 4.8,
        services: item.services as any
      };
    }
  }

  return null;
}

/**
 * Consolida y deduplica una lista de establecimientos (de Supabase + localStorage + mocks)
 * priorizando los registros actualizados desde /pre-registro y evitando tarjetas repetidas
 * por slug, nombre normalizado o número de WhatsApp.
 */
export function consolidateAndDeduplicateEstablishments<T extends {
  id?: number | string;
  slug?: string;
  name?: string;
  phone?: string;
  whatsapp?: string;
}>(items: T[]): T[] {
  const result: T[] = [];
  for (const candidate of items) {
    if (!candidate) continue;
    const existingIdx = result.findIndex((existing) =>
      isSameEstablishmentOrClient(existing, candidate)
    );
    if (existingIdx === -1) {
      result.push(candidate);
    } else {
      // Consolidar: mantener el registro con datos más recientes (el candidato si viene de actualización local/pre-registro)
      result[existingIdx] = {
        ...result[existingIdx],
        ...candidate,
        slug: result[existingIdx].slug || candidate.slug
      };
    }
  }
  return result;
}

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

  // Datos del Establecimiento (Consolidado sin duplicados)
  establishmentId?: number | string | null;
  wasConsolidatedExisting?: boolean;
  consolidatedMatchReason?: "nombre" | "whatsapp" | "slug" | null;
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

  // Metadatos opcionales de Edición Administrativa y Datos Reales de Inventario (No destructivos)
  notes?: string;
  updatedAtIso?: string;
  updatedAtFormatted?: string;
  updatedByEmail?: string;
  officialEmail?: string;
  officialWebsite?: string;
  shortDescription?: string;
  latitude?: string;
  longitude?: string;
  galleryImages?: string[];
  contactPersonName?: string;
  invitationStatus?: "precargado_pendiente" | "confirmado_activo";
  confirmedAtIso?: string;
  confirmedAtFormatted?: string;
  confirmedByIp?: string;
  badges?: {
    has_power_plant?: boolean;
    has_water_247?: boolean;
    has_starlink?: boolean;
    is_pet_friendly?: boolean;
    has_hdv_seal?: boolean;
  };
  keyServicePills?: string[];
  realRooms?: Array<{
    id?: number;
    name: string;
    capacity: number;
    price_per_night?: number;
    size_m2?: number;
    beds_summary?: string;
    amenities?: string;
  }>;
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
 * Garantiza de forma no destructiva que cualquier registro histórico exonerado
 * de "Alianza 50 Fundadores" o "Cliente Exclusivo / Prestigio 2026" conserve su
 * número de cupo (#1/50, #2/50, #3/50...) o reciba su posición correlativa si fue
 * creado como Prestigio antes de unificar el contador, sin alterar ningún cupo ya asignado.
 */
export function ensureUnifiedQuotaSlotsOnReceipts(
  receipts: SalesPreRegistrationReceipt[]
): { receipts: SalesPreRegistrationReceipt[]; changed: boolean } {
  if (!Array.isArray(receipts) || receipts.length === 0) {
    return { receipts: [], changed: false };
  }

  const usedSlots = new Set<number>();
  for (const r of receipts) {
    if (r.invitationStatus === "precargado_pendiente" || r.termsAccepted === false) continue;
    if (typeof r.founderSlotNumber === "number" && r.founderSlotNumber > 0) {
      usedSlots.add(r.founderSlotNumber);
    }
  }

  // Ordenar cronológicamente por secuencia correlativa para asignar en orden estricto si algún Prestigio histórico tenía null
  const chronological = [...receipts].sort(
    (a, b) => (a.correlativeSequence || 0) - (b.correlativeSequence || 0)
  );

  let changed = false;
  const slotByFolio = new Map<string, number>();

  for (const r of chronological) {
    if (r.invitationStatus === "precargado_pendiente" || r.termsAccepted === false) continue;
    const isUnifiedQuotaModality =
      r.modality === "fundadores_50" || r.modality === "exclusivo_prestigio";
    if (!isUnifiedQuotaModality || r.financialStatus !== "exonerado") continue;

    if (typeof r.founderSlotNumber === "number" && r.founderSlotNumber > 0) {
      slotByFolio.set(r.folio, r.founderSlotNumber);
      usedSlots.add(r.founderSlotNumber);
    } else if (usedSlots.size < MAX_FOUNDERS_QUOTA) {
      const candidate =
        r.correlativeSequence &&
        r.correlativeSequence > 0 &&
        r.correlativeSequence <= MAX_FOUNDERS_QUOTA &&
        !usedSlots.has(r.correlativeSequence)
          ? r.correlativeSequence
          : Math.max(0, ...Array.from(usedSlots)) + 1;

      if (candidate <= MAX_FOUNDERS_QUOTA) {
        usedSlots.add(candidate);
        slotByFolio.set(r.folio, candidate);
        changed = true;
      }
    }
  }

  if (!changed) {
    return { receipts, changed: false };
  }

  const normalized = receipts.map((r) => {
    // Una precarga pendiente (aún no confirmada con términos aceptados por el cliente) NO consume cupo hasta su confirmación
    if (r.invitationStatus === "precargado_pendiente" || r.termsAccepted === false) {
      if (r.founderSlotNumber !== null) {
        return {
          ...r,
          founderSlotNumber: null,
          financialStatusLabel:
            r.modality === "comercial_estandar"
              ? "Plan Estándar / HDV Connect — 0% Comisiones por Reserva"
              : "Exonerado ($0.00) — Cliente de Prestigio / Top 50 (Cupo por asignar al confirmar)"
        };
      }
      return r;
    }
    if (typeof r.founderSlotNumber === "number" && r.founderSlotNumber > 0) {
      return r;
    }
    const assignedSlot = slotByFolio.get(r.folio);
    if (!assignedSlot) return r;
    const updatedLabel =
      r.modality === "exclusivo_prestigio"
        ? `Exonerado ($0.00) — Selección Exclusiva Prestigio 2026 [Cupo #${assignedSlot}/${MAX_FOUNDERS_QUOTA}]`
        : `Exonerado ($0.00) — Alianza 50 Fundadores [Cupo #${assignedSlot}/${MAX_FOUNDERS_QUOTA}]`;
    return {
      ...r,
      founderSlotNumber: assignedSlot,
      financialStatusLabel: updatedLabel
    };
  });

  return { receipts: normalized, changed: true };
}

/**
 * Calcula el correlativo global unificado de los 50 cupos de exoneración
 * compartidos entre "Alianza 50 Fundadores" y "Cliente Exclusivo / Prestigio 2026",
 * respetando de forma no destructiva los cupos ya emitidos (#1/50, #2/50, #3/50...).
 */
export function computeUnifiedExoneratedQuotaCount(
  receipts: SalesPreRegistrationReceipt[],
  storedCounter = 0
): number {
  const { receipts: normalized } = ensureUnifiedQuotaSlotsOnReceipts(receipts);
  const confirmedOnly = normalized.filter(
    (r) => r.invitationStatus !== "precargado_pendiente" && r.termsAccepted !== false
  );
  const maxSlotAssigned = confirmedOnly.reduce(
    (max, r) => Math.max(max, typeof r.founderSlotNumber === "number" ? r.founderSlotNumber : 0),
    0
  );
  const totalQuotaReceipts = confirmedOnly.filter(
    (r) =>
      (r.modality === "fundadores_50" || r.modality === "exclusivo_prestigio") &&
      (r.founderSlotNumber !== null || r.financialStatus === "exonerado")
  ).length;

  // Si hay comprobantes confirmados en la lista, el contador real se deriva exclusivamente de los confirmados
  // para que ninguna precarga o visita previa de revisión altere el contador de cupos
  if (confirmedOnly.length > 0) {
    return Math.min(MAX_FOUNDERS_QUOTA, Math.max(maxSlotAssigned, totalQuotaReceipts));
  }

  return Math.min(MAX_FOUNDERS_QUOTA, Math.max(storedCounter || 0, maxSlotAssigned, totalQuotaReceipts));
}

/**
 * Asegura la inicialización de la estructura de contadores preservando estrictamente
 * cualquier registro, folio o comprobante histórico ya existente (Directiva No Destructiva).
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

  try {
    const rawCounters = localStorage.getItem(STORAGE_KEYS.COUNTERS);
    const rawReceipts = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
    const existingReceipts: SalesPreRegistrationReceipt[] = rawReceipts ? JSON.parse(rawReceipts) : [];

    if (rawCounters) {
      const parsed: SalesCountersState = JSON.parse(rawCounters);
      // Asegurar que los contadores nunca sean menores a los comprobantes históricos reales
      const safeCounters: SalesCountersState = {
        preRegCounter: Math.max(parsed.preRegCounter || 0, existingReceipts.length),
        foundersCounter: computeUnifiedExoneratedQuotaCount(existingReceipts, parsed.foundersCounter || 0),
        exoneratedCounter: Math.max(
          parsed.exoneratedCounter || 0,
          existingReceipts.filter((r) => r.financialStatus === "exonerado").length
        ),
        invoiceCounter: Math.max(
          parsed.invoiceCounter || 0,
          existingReceipts.filter((r) => r.invoiceNumber !== null).length
        ),
        initializedAt: parsed.initializedAt || new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.ZERO_INIT_FLAG, "true");
      return safeCounters;
    }

    if (existingReceipts.length > 0) {
      const derivedCounters: SalesCountersState = {
        preRegCounter: existingReceipts.length,
        foundersCounter: computeUnifiedExoneratedQuotaCount(existingReceipts, 0),
        exoneratedCounter: existingReceipts.filter((r) => r.financialStatus === "exonerado").length,
        invoiceCounter: existingReceipts.filter((r) => r.invoiceNumber !== null).length,
        initializedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(derivedCounters));
      localStorage.setItem(STORAGE_KEYS.ZERO_INIT_FLAG, "true");
      return derivedCounters;
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
  if (!localStorage.getItem(STORAGE_KEYS.RECEIPTS)) {
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify([]));
  }
  localStorage.setItem(STORAGE_KEYS.ZERO_INIT_FLAG, "true");
  return fallback;
}

/**
 * Función protegida bajo la Directiva Arquitectónica No Destructiva:
 * En lugar de borrar registros históricos, sincroniza y recalcula los contadores desde Supabase + almacenamiento local
 * preservando el 100% de los folios, comprobantes, pagos y auditorías existentes.
 */
export async function resetAllSalesAndFinanceCountersToZero(): Promise<SalesCountersState> {
  const synced = await syncSalesStateFromSupabase();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("hdv_sales_v13_updated"));
  }
  return synced.counters;
}

export function getSalesCounters(): SalesCountersState {
  return ensureSalesAndFinanceZeroInitialized();
}

export function getSalesReceipts(): SalesPreRegistrationReceipt[] {
  ensureSalesAndFinanceZeroInitialized();
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
    const parsed: SalesPreRegistrationReceipt[] = raw ? JSON.parse(raw) : [];
    const { receipts: normalized, changed } = ensureUnifiedQuotaSlotsOnReceipts(parsed);
    if (changed) {
      localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(normalized));
    }
    return normalized;
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
 * GATEKEEPER DE PRE-REGISTRO OFICIAL (HDV-PR-2026-...):
 * Devuelve el comprobante auditado si el establecimiento ya pasó por la puerta de entrada
 * oficial de /pre-registro (por slug, ID, nombre normalizado o WhatsApp real).
 */
export function getValidatedPreRegistrationForEstablishment(est?: {
  id?: number | string | null;
  slug?: string | null;
  name?: string | null;
  title?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  features?: any;
} | null): SalesPreRegistrationReceipt | null {
  if (!est) return null;
  const receipts = getSalesReceipts();
  if (!Array.isArray(receipts) || receipts.length === 0) return null;

  const slugClean = String(est.slug || "").trim().toLowerCase();
  const nameNorm = normalizeEstablishmentName(est.name || est.title);
  const phoneNorm = normalizePhoneKey(est.whatsapp || est.phone);
  const isPlaceholderPhone = phoneNorm === "4121234567";

  const matched = receipts.find((r) => {
    if (!r || !r.folio || !String(r.folio).toUpperCase().startsWith("HDV-PR-")) return false;
    // Si es una invitación precargada que el cliente aún no ha confirmado con el check de términos,
    // aún no abre el bloque de habitaciones en la ficha pública hasta que pulse "Confirmar y Activar Ficha"
    if (r.invitationStatus === "precargado_pendiente" || r.termsAccepted === false) return false;
    if (slugClean && r.establishmentSlug && r.establishmentSlug.trim().toLowerCase() === slugClean) {
      return true;
    }
    if (est.id && r.establishmentId && String(r.establishmentId) === String(est.id)) {
      return true;
    }
    const rNameNorm = normalizeEstablishmentName(r.establishmentTitle);
    if (nameNorm && rNameNorm && (nameNorm === rNameNorm || slugClean === rNameNorm.replace(/\s+/g, "-"))) {
      return true;
    }
    if (
      phoneNorm &&
      !isPlaceholderPhone &&
      normalizePhoneKey(r.whatsappNumber) === phoneNorm
    ) {
      return true;
    }
    return false;
  });

  return matched || null;
}

/**
 * Determina si un establecimiento ya pasó por el flujo oficial de Pre-Registro auditado.
 * Los establecimientos base del directorio que aún NO han pasado por /pre-registro
 * devuelven `false` para no mostrar datos ficticios ni etiquetas de ejemplo.
 */
export function hasValidatedPreRegistration(est?: any): boolean {
  if (!est) return false;
  if (est.is_prereg_preview === true) return true;
  const folioFromFeatures = est.features?.pre_registration?.folio;
  if (typeof folioFromFeatures === "string" && folioFromFeatures.toUpperCase().startsWith("HDV-PR-")) {
    return true;
  }
  if (typeof window !== "undefined" && est.slug) {
    try {
      const localPrereg = localStorage.getItem(`hdv_prereg_${est.slug}`);
      if (localPrereg) return true;
    } catch {}
  }
  return getValidatedPreRegistrationForEstablishment(est) !== null;
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

      const rawMergedReceipts = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime()
      );
      const { receipts: mergedReceipts } = ensureUnifiedQuotaSlotsOnReceipts(rawMergedReceipts);

      const mergedCounters: SalesCountersState = {
        preRegCounter: Math.max(localCounters.preRegCounter, remoteCounters.preRegCounter, mergedReceipts.length),
        foundersCounter: computeUnifiedExoneratedQuotaCount(
          mergedReceipts,
          Math.max(localCounters.foundersCounter || 0, remoteCounters.foundersCounter || 0)
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
  establishmentId?: number | string | null;
  wasConsolidatedExisting?: boolean;
  consolidatedMatchReason?: "nombre" | "whatsapp" | "slug" | null;
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
  officialEmail?: string;
  officialWebsite?: string;
  shortDescription?: string;
  badges?: {
    has_power_plant?: boolean;
    has_water_247?: boolean;
    has_starlink?: boolean;
    is_pet_friendly?: boolean;
    has_hdv_seal?: boolean;
  };
  keyServicePills?: string[];
  realRooms?: Array<{
    id?: number;
    name: string;
    capacity: number;
    price_per_night?: number;
    size_m2?: number;
    beds_summary?: string;
    amenities?: string;
  }>;
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

  // Regla de Sincronización Correlativa Unificada (50 Cupos Globales = Fundadores + Prestigio 2026):
  // Tanto "Alianza 50 Fundadores" como "Cliente Exclusivo / Prestigio 2026" consumen del mismo
  // contador global de 50 cupos (Cupo #1/50 .. #50/50), continuando desde el #4/50 sin reiniciar.
  // Si ya se completaron los 50 cupos globales, se activa automáticamente la facturación correlativa HDV-FAC.
  if (effectiveModality === "fundadores_50" || effectiveModality === "exclusivo_prestigio") {
    const currentUnifiedUsed = computeUnifiedExoneratedQuotaCount(receipts, counters.foundersCounter);
    if (currentUnifiedUsed < MAX_FOUNDERS_QUOTA) {
      nextFoundersCounter = currentUnifiedUsed + 1;
      founderSlotNumber = nextFoundersCounter;
      nextExoneratedCounter = counters.exoneratedCounter + 1;
      financialCorrelative = `HDV-EXO-2026-${pad4(nextExoneratedCounter)}`;
      invoiceNumber = null;
      financialStatus = "exonerado";
      monthlyAmountUsd = 0;
      showAmountOnReceipt = true;

      if (effectiveModality === "fundadores_50") {
        modalityLabel = "Membresía Exonerada - Alianza 50 Fundadores";
        financialStatusLabel = `Exonerado ($0.00) — Alianza 50 Fundadores [Cupo #${founderSlotNumber}/${MAX_FOUNDERS_QUOTA}]`;
      } else {
        modalityLabel = "Membresía Exonerada - Selección Exclusiva Prestigio 2026";
        financialStatusLabel = `Exonerado ($0.00) — Selección Exclusiva Prestigio 2026 [Cupo #${founderSlotNumber}/${MAX_FOUNDERS_QUOTA}]`;
      }
    } else {
      // Cupo global 50 superado -> Activación Post-50 de Facturación Correlativa
      effectiveModality = "comercial_estandar";
    }
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
    establishmentId: input.establishmentId ?? null,
    wasConsolidatedExisting: Boolean(input.wasConsolidatedExisting),
    consolidatedMatchReason: input.consolidatedMatchReason ?? null,
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
      "Acepto los Términos y Condiciones de Hoteles de Venezuela y autorizo expresamente la publicación y uso promocional de la información comercial, logotipo y fotografías del establecimiento.",
    clientIp,
    userAgent,
    createdAtIso,
    createdAtFormatted,
    digitalSignatureHash,
    verificationPath,
    officialEmail: input.officialEmail?.trim() || undefined,
    officialWebsite: input.officialWebsite?.trim() || undefined,
    shortDescription: input.shortDescription?.trim() || undefined,
    badges: input.badges,
    keyServicePills: input.keyServicePills,
    realRooms: input.realRooms
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

  // 3. SINCRONIZACIÓN AUTOMÁTICA CON BASE DE CLIENTES Y PIPELINE CRM / WHATSAPP CRM (UPSERT SIN DUPLICADOS)
  const consolidationTag = input.wasConsolidatedExisting
    ? `Registro Existente Consolidado (Detectado por ${input.consolidatedMatchReason || "nombre/WhatsApp"})`
    : "Nuevo Registro Oficial";

  const crmNotes = [
    `Folio Pre-Registro: ${folio}`,
    `Documento Financiero: ${financialCorrelative}`,
    `Consolidación: ${consolidationTag}`,
    `Slug Oficial: ${input.establishmentSlug}`,
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

  const targetNameNorm = normalizeEstablishmentName(input.establishmentTitle);
  const targetPhoneNorm = normalizePhoneKey(input.whatsappNumber);
  const isPlaceholderTargetPhone = targetPhoneNorm === "4121234567";

  try {
    if (typeof window !== "undefined") {
      // Upsert sin duplicados en localStorage `hdv_mock_whatsapp_leads`
      const localLeads: any[] = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.WHATSAPP_LEADS) || "[]"
      );
      const filteredLeads = localLeads.filter((l: any) => {
        const lNameNorm = normalizeEstablishmentName(
          String(l.name || "").split("(")[0]
        );
        const lPhoneNorm = normalizePhoneKey(l.phone);
        const sameName = Boolean(targetNameNorm && lNameNorm && targetNameNorm === lNameNorm);
        const samePhone = Boolean(
          targetPhoneNorm &&
            !isPlaceholderTargetPhone &&
            lPhoneNorm &&
            targetPhoneNorm === lPhoneNorm
        );
        return !(sameName || samePhone);
      });
      localStorage.setItem(
        STORAGE_KEYS.WHATSAPP_LEADS,
        JSON.stringify([leadPayload, ...filteredLeads])
      );

      // Upsert sin duplicados en localStorage `hdv_mock_commercial_prospects`
      const localProspects: any[] = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.COMMERCIAL_PROSPECTS) || "[]"
      );
      const filteredProspects = localProspects.filter((p: any) => {
        const pNameNorm = normalizeEstablishmentName(
          p.establishment_name || p.establishmentName
        );
        const pPhoneNorm = normalizePhoneKey(p.phone);
        const sameName = Boolean(targetNameNorm && pNameNorm && targetNameNorm === pNameNorm);
        const samePhone = Boolean(
          targetPhoneNorm &&
            !isPlaceholderTargetPhone &&
            pPhoneNorm &&
            targetPhoneNorm === pPhoneNorm
        );
        return !(sameName || samePhone);
      });
      localStorage.setItem(
        STORAGE_KEYS.COMMERCIAL_PROSPECTS,
        JSON.stringify([prospectPayload, ...filteredProspects])
      );
    }

    // Upsert sin duplicados en Supabase `whatsapp_leads`
    try {
      const { data: existingLeads } = await supabase
        .from("whatsapp_leads")
        .select("id, name, phone");
      const matchedLead = (existingLeads || []).find((l: any) => {
        const lNameNorm = normalizeEstablishmentName(String(l.name || "").split("(")[0]);
        const lPhoneNorm = normalizePhoneKey(l.phone);
        const sameName = Boolean(targetNameNorm && lNameNorm && targetNameNorm === lNameNorm);
        const samePhone = Boolean(
          targetPhoneNorm &&
            !isPlaceholderTargetPhone &&
            lPhoneNorm &&
            targetPhoneNorm === lPhoneNorm
        );
        return sameName || samePhone;
      });

      if (matchedLead?.id) {
        await supabase
          .from("whatsapp_leads")
          .update({
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
          })
          .eq("id", matchedLead.id);
      } else {
        await supabase.from("whatsapp_leads").insert({
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
        });
      }
    } catch {}

    // Upsert sin duplicados en Supabase `commercial_prospects`
    try {
      const { data: existingProspects } = await supabase
        .from("commercial_prospects")
        .select("id, establishment_name, phone");
      const matchedProspect = (existingProspects || []).find((p: any) => {
        const pNameNorm = normalizeEstablishmentName(p.establishment_name);
        const pPhoneNorm = normalizePhoneKey(p.phone);
        const sameName = Boolean(targetNameNorm && pNameNorm && targetNameNorm === pNameNorm);
        const samePhone = Boolean(
          targetPhoneNorm &&
            !isPlaceholderTargetPhone &&
            pPhoneNorm &&
            targetPhoneNorm === pPhoneNorm
        );
        return sameName || samePhone;
      });

      if (matchedProspect?.id) {
        await supabase
          .from("commercial_prospects")
          .update({
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
          .eq("id", matchedProspect.id);
      } else {
        await supabase.from("commercial_prospects").insert({
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
        });
      }
    } catch {}
  } catch (err) {
    console.warn("Aviso sincronizando CRM:", err);
  }

  // 4. REGISTRO EN AUDITORÍA DE LOGS (/admin/logs) CON TELEMETRÍA COMPLETA
  const auditDetails = [
    `Folio: ${folio}`,
    `Finanzas: ${financialCorrelative} (${financialStatusLabel})`,
    `Consolidación: ${consolidationTag}`,
    `Establecimiento: ${input.establishmentTitle} [slug: ${input.establishmentSlug}] (${input.categoryName} - ${input.destinationName})`,
    `Origen: ${registrantName}`,
    `Cláusula Legal Aceptada: "${newReceipt.termsAcceptedText}"`,
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

export interface UpdateSalesReceiptOperationalInput {
  folio: string;
  establishmentTitle: string;
  categoryName: string;
  destinationName: string;
  city: string;
  state: string;
  whatsappNumber: string;
  registrantName: string;
  modality: MembershipModality;
  notes?: string;
  primaryImage?: string;
  updatedByEmail?: string | null;
  updatedByUserId?: string | null;
}

/**
 * Edición Rápida No Destructiva desde /admin/pre-registros:
 * - Actualiza datos operativos (nombre del establecimiento, categoría, destino, ciudad, estado, WhatsApp, originador, modalidad y notas).
 * - Mantiene 100% protegidos e intactos los campos de auditoría originales (folio HDV-PR-2026-..., asiento financiero HDV-EXO/HDV-FAC, cupo #X/50, IP, fecha/hora original y cláusula legal).
 * - Sincroniza mediante upsert/merge seguro con la ficha consolidada del establecimiento en Supabase y localStorage.
 * - Registra la marca de edición (updatedAtFormatted) y el evento en Auditoría de Logs.
 */
export async function updateSalesPreRegistrationReceipt(
  input: UpdateSalesReceiptOperationalInput
): Promise<SalesPreRegistrationReceipt | null> {
  const receipts = getSalesReceipts();
  const target = receipts.find((r) => r.folio === input.folio);
  if (!target) return null;

  const now = new Date();
  const updatedAtIso = now.toISOString();
  const updatedAtFormatted = now.toLocaleString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  const selectedPlan =
    SAAS_COMMERCIAL_PLANS.find((p) => p.id === target.planId) || SAAS_COMMERCIAL_PLANS[6];

  const preservedSlotNumber = target.founderSlotNumber;
  let nextModalityLabel = target.modalityLabel;
  let nextFinancialStatusLabel = target.financialStatusLabel;

  if (input.modality === "fundadores_50") {
    nextModalityLabel = "Membresía Exonerada - Alianza 50 Fundadores";
    if (target.financialStatus === "exonerado") {
      nextFinancialStatusLabel = preservedSlotNumber
        ? `Exonerado ($0.00) — Alianza 50 Fundadores [Cupo #${preservedSlotNumber}/${MAX_FOUNDERS_QUOTA}]`
        : "Exonerado ($0.00) — Alianza 50 Fundadores";
    }
  } else if (input.modality === "exclusivo_prestigio") {
    nextModalityLabel = "Membresía Exonerada - Selección Exclusiva Prestigio 2026";
    if (target.financialStatus === "exonerado") {
      nextFinancialStatusLabel = preservedSlotNumber
        ? `Exonerado ($0.00) — Selección Exclusiva Prestigio 2026 [Cupo #${preservedSlotNumber}/${MAX_FOUNDERS_QUOTA}]`
        : "Exonerado ($0.00) — Selección Exclusiva Prestigio 2026";
    }
  } else if (input.modality === "comercial_estandar") {
    nextModalityLabel = `Membresía Comercial — ${selectedPlan.name}`;
  }

  const updatedReceipt: SalesPreRegistrationReceipt = {
    ...target,
    // Campos de auditoría estrictamente inmutables:
    folio: target.folio,
    financialCorrelative: target.financialCorrelative,
    invoiceNumber: target.invoiceNumber,
    correlativeSequence: target.correlativeSequence,
    founderSlotNumber: preservedSlotNumber,
    clientIp: target.clientIp,
    userAgent: target.userAgent,
    createdAtIso: target.createdAtIso,
    createdAtFormatted: target.createdAtFormatted,
    termsAccepted: target.termsAccepted,
    termsAcceptedText: target.termsAcceptedText,
    digitalSignatureHash: target.digitalSignatureHash,
    verificationPath: target.verificationPath,

    // Campos operativos editables:
    establishmentTitle: input.establishmentTitle.trim() || target.establishmentTitle,
    categoryName: input.categoryName.trim() || target.categoryName,
    destinationName: input.destinationName.trim() || target.destinationName,
    city: input.city.trim() || target.city,
    state: input.state.trim() || target.state,
    whatsappNumber: input.whatsappNumber.trim() || target.whatsappNumber,
    registrantName: input.registrantName.trim() || target.registrantName,
    modality: input.modality,
    modalityLabel: nextModalityLabel,
    financialStatusLabel: nextFinancialStatusLabel,
    primaryImage: input.primaryImage?.trim() || target.primaryImage,
    notes: input.notes !== undefined ? input.notes.trim() : target.notes,
    updatedAtIso,
    updatedAtFormatted,
    updatedByEmail: input.updatedByEmail || target.updatedByEmail || "admin@hotelesdevenezuela.com"
  };

  const updatedList = receipts.map((r) => (r.folio === input.folio ? updatedReceipt : r));

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(updatedList));
  }

  // 1. Sincronizar estado de comprobantes en Supabase (`site_settings`) sin alterar contadores
  try {
    const counters = getSalesCounters();
    await supabase.from("site_settings").upsert(
      {
        setting_key: "hdv_sales_v13_state",
        setting_value: JSON.stringify({
          counters,
          receipts: updatedList.slice(0, 500)
        })
      },
      { onConflict: "setting_key" }
    );
  } catch (err) {
    console.warn("Aviso guardando edición de pre-registro en site_settings:", err);
  }

  // 2. Sincronizar con la ficha consolidada del establecimiento (Upsert/Merge no destructivo)
  const slug = updatedReceipt.establishmentSlug;
  const resolvedTier =
    updatedReceipt.modality === "fundadores_50"
      ? "fundador"
      : updatedReceipt.modality === "exclusivo_prestigio"
      ? "diamante"
      : selectedPlan.tierKey;

  if (typeof window !== "undefined") {
    try {
      const preregKey = `hdv_prereg_${slug}`;
      const existingPreregRaw = localStorage.getItem(preregKey);
      if (existingPreregRaw) {
        const parsedPrereg = JSON.parse(existingPreregRaw);
        localStorage.setItem(
          preregKey,
          JSON.stringify({
            ...parsedPrereg,
            title: updatedReceipt.establishmentTitle,
            category_name: updatedReceipt.categoryName,
            destination_name: updatedReceipt.destinationName,
            city: updatedReceipt.city,
            state: updatedReceipt.state,
            whatsapp_number: updatedReceipt.whatsappNumber,
            primary_image: updatedReceipt.primaryImage || parsedPrereg.primary_image
          })
        );
      }

      const localEstsKey = "hdv_mock_establishments";
      const localEsts: any[] = JSON.parse(localStorage.getItem(localEstsKey) || "[]");
      let foundInLocal = false;
      const updatedLocalEsts = localEsts.map((item: any) => {
        if (!item) return item;
        const sameSlug = item.slug && String(item.slug).toLowerCase() === slug.toLowerCase();
        const sameName =
          normalizeEstablishmentName(item.name) ===
          normalizeEstablishmentName(target.establishmentTitle);
        if (sameSlug || sameName) {
          foundInLocal = true;
          return {
            ...item,
            name: updatedReceipt.establishmentTitle,
            category_name: updatedReceipt.categoryName,
            destination_name: updatedReceipt.destinationName,
            city: updatedReceipt.city,
            state: updatedReceipt.state,
            address: `${updatedReceipt.city}, ${updatedReceipt.state}`,
            phone: updatedReceipt.whatsappNumber,
            whatsapp: updatedReceipt.whatsappNumber,
            membership_tier: resolvedTier,
            primary_image: updatedReceipt.primaryImage || item.primary_image
          };
        }
        return item;
      });

      if (!foundInLocal) {
        updatedLocalEsts.unshift({
          id: updatedReceipt.establishmentId || Date.now(),
          slug,
          name: updatedReceipt.establishmentTitle,
          description: updatedReceipt.notes || "Alojamiento turístico verificado por Hoteles de Venezuela con atención directa y reserva sin comisiones.",
          address: `${updatedReceipt.city}, ${updatedReceipt.state}`,
          city: updatedReceipt.city,
          state: updatedReceipt.state,
          phone: updatedReceipt.whatsappNumber,
          whatsapp: updatedReceipt.whatsappNumber,
          category_name: updatedReceipt.categoryName,
          destination_name: updatedReceipt.destinationName,
          primary_image: updatedReceipt.primaryImage,
          rating_avg: 4.9,
          review_count: 12,
          price_level: "$$$",
          is_featured: true,
          has_hdv_seal: true,
          membership_tier: resolvedTier,
          status: "approved"
        });
      }

      localStorage.setItem(localEstsKey, JSON.stringify(updatedLocalEsts));
    } catch {}
  }

  try {
    await Promise.allSettled([
      supabase
        .from("establishments")
        .update({
          name: updatedReceipt.establishmentTitle,
          address: `${updatedReceipt.city}, ${updatedReceipt.state}`,
          city: updatedReceipt.city,
          state: updatedReceipt.state,
          phone: updatedReceipt.whatsappNumber,
          whatsapp: updatedReceipt.whatsappNumber,
          membership_tier: resolvedTier
        })
        .eq("slug", slug),
      supabase
        .from("properties")
        .update({
          title: updatedReceipt.establishmentTitle,
          destination_name: updatedReceipt.destinationName,
          city: updatedReceipt.city,
          state: updatedReceipt.state,
          whatsapp_number: updatedReceipt.whatsappNumber
        })
        .eq("slug", slug)
    ]);
  } catch (err) {
    console.warn("Aviso sincronizando edición de ficha en Supabase:", err);
  }

  // 3. Registrar evento de edición en Auditoría de Logs
  await logActivity(
    input.updatedByUserId || null,
    input.updatedByEmail || "admin@hotelesdevenezuela.com",
    "EDICION_PRE_REGISTRO_ADMIN",
    `Folio Protegido: ${updatedReceipt.folio} (${updatedReceipt.financialCorrelative}) | Establecimiento Actualizado: ${updatedReceipt.establishmentTitle} (${updatedReceipt.categoryName} - ${updatedReceipt.destinationName}) | WhatsApp: ${updatedReceipt.whatsappNumber} | Originador: ${updatedReceipt.registrantName} | Modalidad: ${updatedReceipt.modalityLabel} | Editado el: ${updatedAtFormatted}`
  );

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("hdv_sales_v13_updated"));
  }

  return updatedReceipt;
}

// ============================================================================
// GENERADOR UNIVERSAL DE PRE-REGISTRO PRECARGADO & VALIDACIÓN 1-CLIC DEL CLIENTE
// ============================================================================

export interface PreloadedInvitationTemplate {
  defaultFolio: string;
  slug: string;
  establishmentId?: number | string | null;
  establishmentTitle: string;
  categoryName: string;
  destinationName: string;
  state: string;
  city: string;
  whatsappNumber: string;
  officialEmail?: string;
  officialWebsite?: string;
  shortDescription: string;
  primaryImage: string;
  galleryImages?: string[];
  latitude?: string;
  longitude?: string;
  contactPersonName: string;
  modality: MembershipModality;
  planId: string;
}

/**
 * Catálogo de Invitaciones Oficiales Precargadas (Expediciones y Clientes VIP):
 * Garantiza que el enlace enviado por WhatsApp o correo funcione de inmediato en
 * cualquier dispositivo móvil o navegador del cliente con 0 datos ficticios.
 */
export const OFFICIAL_PRELOADED_INVITATIONS: PreloadedInvitationTemplate[] = [
  {
    defaultFolio: "HDV-PR-2026-0005",
    slug: "waku-lodge-canaima",
    establishmentId: 99903,
    establishmentTitle: "Wakü Lodge Canaima",
    categoryName: "Campamento / Eco-Lodge",
    destinationName: "Canaima",
    state: "Bolívar",
    city: "Laguna de Canaima",
    whatsappNumber: "+58 414 8882233",
    officialEmail: "",
    officialWebsite: "https://wakulodge.com",
    shortDescription:
      "Campamento y resort ecológico de ultra-lujo frente a la mítica Laguna de Canaima con vistas directas a los saltos y tepuyes.",
    primaryImage:
      "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=800&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=800&auto=format&fit=crop"
    ],
    latitude: "6.244200",
    longitude: "-62.852900",
    contactPersonName: "Lusbelys Castro",
    modality: "exclusivo_prestigio",
    planId: "complejos"
  }
];

/**
 * Construye la URL directa de Revisión y Validación de Ficha Oficial para enviar al cliente.
 */
export function buildPreloadedClientReviewUrl(
  receiptOrParams: {
    folio: string;
    establishmentSlug?: string;
    contactPersonName?: string;
    modality?: MembershipModality;
  },
  baseOrigin = "https://hotelesdevenezuela.com"
): string {
  const params = new URLSearchParams();
  params.set("folio", receiptOrParams.folio);
  if (receiptOrParams.establishmentSlug) {
    params.set("slug", receiptOrParams.establishmentSlug);
  }
  if (receiptOrParams.contactPersonName) {
    params.set("contacto", receiptOrParams.contactPersonName);
  }
  if (receiptOrParams.modality) {
    params.set(
      "nivel",
      receiptOrParams.modality === "comercial_estandar" ? "estandar_connect" : "prestigio_top50"
    );
  }
  return `${baseOrigin.replace(/\/$/, "")}/pre-registro?${params.toString()}`;
}

export interface CreateOrUpdatePreloadedInvitationInput {
  targetFolio?: string;
  establishmentId?: number | string | null;
  establishmentTitle: string;
  establishmentSlug: string;
  categoryName: string;
  destinationName: string;
  state: string;
  city: string;
  whatsappNumber: string;
  officialEmail?: string;
  officialWebsite?: string;
  shortDescription?: string;
  primaryImage: string;
  galleryImages?: string[];
  latitude?: string;
  longitude?: string;
  contactPersonName: string;
  benefitLevel: "prestigio_top50" | "estandar_connect";
  modality?: MembershipModality;
  planId?: string;
  createdByEmail?: string | null;
  createdByUserId?: string | null;
}

/**
 * Crea o actualiza de forma no destructiva una Invitación de Pre-Registro Precargado
 * para cualquier establecimiento del directorio o prospecto B2B:
 * - Toma únicamente los datos reales verificados (0 habitaciones ficticias, 0 etiquetas no confirmadas).
 * - Si el establecimiento o folio ya tiene un registro en `receipts`, lo reutiliza/actualiza sin duplicar folios ni alterar cupos.
 * - Reserva su folio único `HDV-PR-2026-XXXX` y su posición en los primeros 50 aliados si es Top 50 / Prestigio.
 */
export async function createOrUpdatePreloadedInvitation(
  input: CreateOrUpdatePreloadedInvitationInput
): Promise<SalesPreRegistrationReceipt> {
  const { counters, receipts } = await syncSalesStateFromSupabase();
  const cleanTargetFolio = (input.targetFolio || "").trim().toUpperCase();
  const cleanSlug = (input.establishmentSlug || "").trim().toLowerCase();
  const normTitle = normalizeEstablishmentName(input.establishmentTitle);

  // 1. Verificar si ya existe un comprobante/precarga para este folio o establecimiento (Idempotente / Anti-Duplicados)
  const existingReceipt = receipts.find((r) => {
    if (cleanTargetFolio && r.folio.toUpperCase() === cleanTargetFolio) return true;
    if (cleanSlug && r.establishmentSlug && r.establishmentSlug.trim().toLowerCase() === cleanSlug) {
      return true;
    }
    if (normTitle && normalizeEstablishmentName(r.establishmentTitle) === normTitle) {
      return true;
    }
    return false;
  });

  const now = new Date();
  const nowIso = now.toISOString();
  const nowFormatted = now.toLocaleString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  const effectiveModality: MembershipModality =
    input.benefitLevel === "estandar_connect"
      ? "comercial_estandar"
      : input.modality === "fundadores_50"
      ? "fundadores_50"
      : "exclusivo_prestigio";

  const selectedPlan =
    SAAS_COMMERCIAL_PLANS.find((p) => p.id === (input.planId || "premium")) ||
    SAAS_COMMERCIAL_PLANS[6];

  if (existingReceipt) {
    // Actualizar precarga existente sin duplicar folio ni incrementar el contador de cupos:
    // Si sigue en estado "precargado_pendiente" (termsAccepted === false), founderSlotNumber permanece en null
    // hasta que el cliente confirme y acepte términos.
    const isAlreadyConfirmed =
      existingReceipt.invitationStatus === "confirmado_activo" &&
      existingReceipt.termsAccepted === true;

    const preservedSlot = isAlreadyConfirmed ? existingReceipt.founderSlotNumber : null;

    const modalityLabel =
      effectiveModality === "exclusivo_prestigio"
        ? "Cliente de Prestigio / Aliado Fundador (Top 50) — 0% Comisiones"
        : effectiveModality === "fundadores_50"
        ? "Membresía Exonerada - Alianza 50 Fundadores (Top 50) — 0% Comisiones"
        : "Plan Estándar / HDV Connect (0% Comisiones)";

    const financialStatus: FinancialStatus = "exonerado";

    const financialStatusLabel =
      effectiveModality === "comercial_estandar"
        ? "Plan Estándar / HDV Connect — 0% Comisiones por Reserva"
        : isAlreadyConfirmed && preservedSlot
        ? `Exonerado ($0.00) — Cliente de Prestigio / Top 50 [Cupo #${preservedSlot}/${MAX_FOUNDERS_QUOTA}]`
        : "Exonerado ($0.00) — Cliente de Prestigio / Top 50 (Cupo por asignar al confirmar)";

    const updatedExisting: SalesPreRegistrationReceipt = {
      ...existingReceipt,
      establishmentTitle: input.establishmentTitle.trim() || existingReceipt.establishmentTitle,
      establishmentSlug: cleanSlug || existingReceipt.establishmentSlug,
      categoryName: input.categoryName.trim() || existingReceipt.categoryName,
      destinationName: input.destinationName.trim() || existingReceipt.destinationName,
      state: input.state.trim() || existingReceipt.state,
      city: input.city.trim() || existingReceipt.city,
      whatsappNumber: input.whatsappNumber.trim() || existingReceipt.whatsappNumber,
      officialEmail:
        input.officialEmail !== undefined
          ? input.officialEmail.trim()
          : existingReceipt.officialEmail,
      officialWebsite:
        input.officialWebsite !== undefined
          ? input.officialWebsite.trim()
          : existingReceipt.officialWebsite,
      shortDescription:
        input.shortDescription !== undefined
          ? input.shortDescription.trim()
          : existingReceipt.shortDescription,
      primaryImage: input.primaryImage.trim() || existingReceipt.primaryImage,
      galleryImages: input.galleryImages || existingReceipt.galleryImages,
      latitude: input.latitude ?? existingReceipt.latitude,
      longitude: input.longitude ?? existingReceipt.longitude,
      contactPersonName:
        input.contactPersonName.trim() || existingReceipt.contactPersonName || "Gerencia General",
      registrantName: `Propietario / Gerente: ${
        input.contactPersonName.trim() ||
        existingReceipt.contactPersonName ||
        existingReceipt.establishmentTitle
      }`,
      modality: effectiveModality,
      modalityLabel,
      founderSlotNumber: preservedSlot,
      financialStatus,
      financialStatusLabel,
      updatedAtIso: nowIso,
      updatedAtFormatted: nowFormatted
    };

    const updatedReceipts = receipts.map((r) =>
      r.folio === existingReceipt.folio ? updatedExisting : r
    );
    const updatedCounters: SalesCountersState = {
      ...counters,
      foundersCounter: computeUnifiedExoneratedQuotaCount(updatedReceipts, counters.foundersCounter)
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(updatedCounters));
      localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(updatedReceipts));
    }

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
    } catch {}

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("hdv_sales_v13_updated"));
    }

    return updatedExisting;
  }

  // 2. Es una nueva precarga: generar folio correlativo (o respetar el targetFolio si no está ocupado),
  // pero SIN consumir cupo del contador de 50 aliados hasta que el cliente marque términos y confirme.
  let nextPreRegSeq = Math.max(counters.preRegCounter, receipts.length) + 1;
  if (cleanTargetFolio.startsWith("HDV-PR-2026-")) {
    const parsedNum = parseInt(cleanTargetFolio.replace("HDV-PR-2026-", ""), 10);
    if (!Number.isNaN(parsedNum) && parsedNum >= nextPreRegSeq) {
      nextPreRegSeq = parsedNum;
    }
  }
  const folio = `HDV-PR-2026-${pad4(nextPreRegSeq)}`;

  const nextExoneratedCounter = counters.exoneratedCounter + 1;
  const financialCorrelative = `HDV-EXO-2026-${pad4(nextExoneratedCounter)}`;

  const modalityLabel =
    effectiveModality === "exclusivo_prestigio"
      ? "Cliente de Prestigio / Aliado Fundador (Top 50) — 0% Comisiones"
      : effectiveModality === "fundadores_50"
      ? "Membresía Exonerada - Alianza 50 Fundadores (Top 50) — 0% Comisiones"
      : "Plan Estándar / HDV Connect (0% Comisiones)";

  const financialStatusLabel =
    effectiveModality === "comercial_estandar"
      ? "Plan Estándar / HDV Connect — 0% Comisiones por Reserva"
      : "Exonerado ($0.00) — Cliente de Prestigio / Top 50 (Cupo por asignar al confirmar)";

  const verificationPath = `/verificar-registro/${folio}`;
  const digitalSignatureHash = buildDigitalSignature(folio, financialCorrelative, nowIso);

  const preloadedReceipt: SalesPreRegistrationReceipt = {
    id: crypto.randomUUID(),
    folio,
    financialCorrelative,
    invoiceNumber: null,
    correlativeSequence: nextPreRegSeq,
    // Regla de Seguridad: founderSlotNumber queda en null mientras está precargado_pendiente
    // para que crear o abrir el enlace antes de confirmar NUNCA altere el contador de 50 cupos.
    founderSlotNumber: null,
    establishmentId: input.establishmentId ?? null,
    wasConsolidatedExisting: true,
    consolidatedMatchReason: "slug",
    establishmentTitle: input.establishmentTitle.trim(),
    establishmentSlug: cleanSlug,
    categoryName: input.categoryName.trim(),
    destinationName: input.destinationName.trim(),
    state: input.state.trim(),
    city: input.city.trim(),
    whatsappNumber: input.whatsappNumber.trim(),
    primaryImage: input.primaryImage.trim(),
    galleryImages:
      input.galleryImages && input.galleryImages.length > 0
        ? input.galleryImages
        : input.primaryImage
        ? [input.primaryImage]
        : [],
    latitude: input.latitude || "",
    longitude: input.longitude || "",
    basePriceFrom: 0,
    origin: "propietario",
    contactPersonName: input.contactPersonName.trim() || "Gerencia General",
    registrantName: `Propietario / Gerente: ${
      input.contactPersonName.trim() || input.establishmentTitle.trim()
    }`,
    modality: effectiveModality,
    modalityLabel,
    planId: selectedPlan.id,
    planName: selectedPlan.name,
    monthlyAmountUsd: 0,
    monthlyAmountVes: 0,
    bcvRateUsed: 45.8,
    showAmountOnReceipt: true,
    financialStatus: "exonerado",
    financialStatusLabel,
    // Regla estricta: inicia con termsAccepted = false e invitationStatus = "precargado_pendiente"
    // hasta que el cliente abra su enlace, marque el check obligatorio y pulse "Confirmar y Activar Ficha"
    termsAccepted: false,
    termsAcceptedText:
      "Acepto los Términos y Condiciones de Hoteles de Venezuela y autorizo expresamente la publicación y uso promocional de la información comercial, logotipo y fotografías del establecimiento.",
    clientIp: "Pendiente de validación por el cliente",
    userAgent: "Precarga Oficial HDV Operaciones",
    createdAtIso: nowIso,
    createdAtFormatted: nowFormatted,
    digitalSignatureHash,
    verificationPath,
    invitationStatus: "precargado_pendiente",
    officialEmail: input.officialEmail?.trim() || "",
    officialWebsite: input.officialWebsite?.trim() || "",
    shortDescription: input.shortDescription?.trim() || "",
    // Regla estricta de cero datos inventados: 0 etiquetas no confirmadas y 0 habitaciones ficticias
    badges: {
      has_power_plant: false,
      has_water_247: false,
      has_starlink: false,
      is_pet_friendly: false,
      has_hdv_seal: true
    },
    keyServicePills: [],
    realRooms: []
  };

  const updatedReceipts = [preloadedReceipt, ...receipts];

  const updatedCounters: SalesCountersState = {
    preRegCounter: Math.max(counters.preRegCounter, nextPreRegSeq),
    // foundersCounter NO se incrementa al crear la precarga; sólo al confirmar los términos
    foundersCounter: computeUnifiedExoneratedQuotaCount(updatedReceipts, counters.foundersCounter),
    exoneratedCounter: Math.max(counters.exoneratedCounter, nextExoneratedCounter),
    invoiceCounter: counters.invoiceCounter,
    initializedAt: counters.initializedAt
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(updatedCounters));
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(updatedReceipts));
  }

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
    console.warn("Aviso guardando precarga de pre-registro en site_settings:", err);
  }

  await logActivity(
    input.createdByUserId || null,
    input.createdByEmail || "operaciones@hotelesdevenezuela.com",
    "PRECARGA_PRE_REGISTRO_VIP",
    `Folio Precargado: ${folio} (${financialCorrelative}) | Establecimiento: ${preloadedReceipt.establishmentTitle} (${preloadedReceipt.destinationName}) | Contacto: ${preloadedReceipt.contactPersonName} | Nivel: ${modalityLabel}`
  );

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("hdv_sales_v13_updated"));
  }

  return preloadedReceipt;
}

export interface ConfirmPreloadedPreRegistrationInput {
  folio: string;
  establishmentId?: number | string | null;
  establishmentTitle: string;
  establishmentSlug: string;
  categoryName: string;
  destinationName: string;
  state: string;
  city: string;
  whatsappNumber: string;
  officialEmail?: string;
  officialWebsite?: string;
  shortDescription?: string;
  primaryImage: string;
  galleryImages?: string[];
  latitude?: string;
  longitude?: string;
  basePriceFrom: number;
  contactPersonName?: string;
  modality: MembershipModality;
  planId: string;
  bcvRate: number;
  termsAccepted: boolean;
  badges?: {
    has_power_plant?: boolean;
    has_water_247?: boolean;
    has_starlink?: boolean;
    is_pet_friendly?: boolean;
    has_hdv_seal?: boolean;
  };
  keyServicePills?: string[];
  realRooms?: Array<{
    id?: number;
    name: string;
    capacity: number;
    price_per_night?: number;
    size_m2?: number;
    beds_summary?: string;
    amenities?: string;
  }>;
  userId?: string | null;
  userEmail?: string | null;
}

/**
 * Confirma y Activa en 1 clic un Pre-Registro Precargado o Existente (`?folio=HDV-PR-2026-...`):
 * - Mantiene 100% protegido e inalterable el folio original (`HDV-PR-2026-...`) y su correlativo financiero.
 * - Registra la marca de tiempo de confirmación, IP pública del cliente y aceptación legal de términos.
 * - Si es miembro de los primeros 50 (Fundador o Prestigio), confirma su cupo en el contador unificado de 50 sin duplicar ni incrementar dos veces.
 */
export async function confirmPreloadedPreRegistration(
  input: ConfirmPreloadedPreRegistrationInput
): Promise<SalesPreRegistrationReceipt> {
  const { counters, receipts } = await syncSalesStateFromSupabase();
  const clientIp = await detectClientPublicIp();
  const userAgent =
    typeof navigator !== "undefined" ? navigator.userAgent : "HDV-Client-Browser";

  const now = new Date();
  const confirmedAtIso = now.toISOString();
  const confirmedAtFormatted = now.toLocaleString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  const cleanFolio = (input.folio || "").trim().toUpperCase();
  const cleanSlug = (input.establishmentSlug || "").trim().toLowerCase();

  let targetReceipt =
    receipts.find((r) => r.folio.toUpperCase() === cleanFolio) ||
    receipts.find(
      (r) => cleanSlug && r.establishmentSlug && r.establishmentSlug.toLowerCase() === cleanSlug
    ) ||
    null;

  // Si el cliente abrió el enlace desde otro dispositivo antes de que la precarga estuviera en su storage local,
  // la sembramos en el acto con su folio original protegido sin duplicar contadores.
  if (!targetReceipt) {
    targetReceipt = await createOrUpdatePreloadedInvitation({
      targetFolio: cleanFolio || undefined,
      establishmentId: input.establishmentId,
      establishmentTitle: input.establishmentTitle,
      establishmentSlug: input.establishmentSlug,
      categoryName: input.categoryName,
      destinationName: input.destinationName,
      state: input.state,
      city: input.city,
      whatsappNumber: input.whatsappNumber,
      officialEmail: input.officialEmail,
      officialWebsite: input.officialWebsite,
      shortDescription: input.shortDescription,
      primaryImage: input.primaryImage,
      galleryImages: input.galleryImages,
      latitude: input.latitude,
      longitude: input.longitude,
      contactPersonName: input.contactPersonName || input.establishmentTitle,
      benefitLevel:
        input.modality === "comercial_estandar" ? "estandar_connect" : "prestigio_top50",
      modality: input.modality,
      planId: input.planId
    });
  }

  const latestReceipts = getSalesReceipts();
  const latestCounters = getSalesCounters();

  let preservedSlot = targetReceipt.founderSlotNumber;
  let nextFoundersCounter = latestCounters.foundersCounter;

  if (
    (input.modality === "exclusivo_prestigio" || input.modality === "fundadores_50") &&
    !preservedSlot
  ) {
    const currentUsed = computeUnifiedExoneratedQuotaCount(
      latestReceipts,
      latestCounters.foundersCounter
    );
    if (currentUsed < MAX_FOUNDERS_QUOTA) {
      preservedSlot = currentUsed + 1;
      nextFoundersCounter = preservedSlot;
    }
  }

  const modalityLabel =
    input.modality === "fundadores_50"
      ? "Membresía Exonerada - Alianza 50 Fundadores"
      : input.modality === "exclusivo_prestigio"
      ? "Membresía Exonerada - Selección Exclusiva Prestigio 2026"
      : "Plan Estándar / HDV Connect (0% Comisiones)";

  const financialStatusLabel =
    input.modality === "fundadores_50"
      ? `Exonerado ($0.00) — Alianza 50 Fundadores [Cupo #${preservedSlot || 1}/${MAX_FOUNDERS_QUOTA}]`
      : input.modality === "exclusivo_prestigio"
      ? `Exonerado ($0.00) — Selección Exclusiva Prestigio 2026 [Cupo #${preservedSlot || 1}/${MAX_FOUNDERS_QUOTA}]`
      : "Plan Estándar / HDV Connect — 0% Comisiones por Reserva";

  const contactName =
    input.contactPersonName?.trim() ||
    targetReceipt.contactPersonName ||
    targetReceipt.registrantName.replace(/^Propietario \/ Gerente:\s*/i, "") ||
    input.establishmentTitle;

  const confirmedReceipt: SalesPreRegistrationReceipt = {
    ...targetReceipt,
    // Folio y correlativo estrictamente inmutables
    folio: targetReceipt.folio,
    financialCorrelative: targetReceipt.financialCorrelative,
    correlativeSequence: targetReceipt.correlativeSequence,
    founderSlotNumber: preservedSlot,

    // Datos validados y/o editados por el cliente
    establishmentId: input.establishmentId ?? targetReceipt.establishmentId ?? null,
    wasConsolidatedExisting: true,
    establishmentTitle: input.establishmentTitle.trim(),
    establishmentSlug: input.establishmentSlug.trim(),
    categoryName: input.categoryName.trim(),
    destinationName: input.destinationName.trim(),
    state: input.state.trim(),
    city: input.city.trim(),
    whatsappNumber: input.whatsappNumber.trim(),
    officialEmail: input.officialEmail?.trim() || "",
    officialWebsite: input.officialWebsite?.trim() || "",
    shortDescription: input.shortDescription?.trim() || "",
    primaryImage: input.primaryImage.trim(),
    galleryImages: input.galleryImages || targetReceipt.galleryImages,
    latitude: input.latitude ?? targetReceipt.latitude,
    longitude: input.longitude ?? targetReceipt.longitude,
    basePriceFrom: input.basePriceFrom,
    contactPersonName: contactName,
    registrantName: `Propietario / Gerente: ${contactName}`,
    modality: input.modality,
    modalityLabel,
    financialStatusLabel,

    // Confirmación legal y telemetría de aceptación del cliente
    termsAccepted: true,
    termsAcceptedText:
      "Acepto los Términos y Condiciones de Hoteles de Venezuela y autorizo expresamente la publicación y uso promocional de la información comercial, logotipo y fotografías del establecimiento.",
    clientIp:
      targetReceipt.clientIp &&
      !targetReceipt.clientIp.toLowerCase().includes("pendiente")
        ? targetReceipt.clientIp
        : clientIp,
    userAgent,
    invitationStatus: "confirmado_activo",
    confirmedAtIso,
    confirmedAtFormatted,
    confirmedByIp: clientIp,
    updatedAtIso: confirmedAtIso,
    updatedAtFormatted: confirmedAtFormatted,
    badges: input.badges,
    keyServicePills: input.keyServicePills || [],
    realRooms: input.realRooms || []
  };

  const existsInList = latestReceipts.some((r) => r.folio === confirmedReceipt.folio);
  const updatedReceipts = existsInList
    ? latestReceipts.map((r) => (r.folio === confirmedReceipt.folio ? confirmedReceipt : r))
    : [confirmedReceipt, ...latestReceipts];

  const updatedCounters: SalesCountersState = {
    ...latestCounters,
    preRegCounter: Math.max(
      latestCounters.preRegCounter,
      confirmedReceipt.correlativeSequence || updatedReceipts.length
    ),
    foundersCounter: computeUnifiedExoneratedQuotaCount(
      updatedReceipts,
      Math.max(latestCounters.foundersCounter, nextFoundersCounter)
    )
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(updatedCounters));
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(updatedReceipts));
  }

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
    console.warn("Aviso guardando confirmación de ficha en site_settings:", err);
  }

  await logActivity(
    input.userId || null,
    input.userEmail || input.officialEmail || "propietario@hotelesdevenezuela.com",
    "CONFIRMACION_FICHA_PRECARGADA",
    `Folio Confirmado: ${confirmedReceipt.folio} (${confirmedReceipt.financialCorrelative}) | Establecimiento: ${confirmedReceipt.establishmentTitle} (${confirmedReceipt.destinationName}) | Responsable: ${contactName} | Cupo: ${
      confirmedReceipt.founderSlotNumber
        ? `#${confirmedReceipt.founderSlotNumber}/${MAX_FOUNDERS_QUOTA}`
        : "Estándar"
    } | Habitaciones Reales Cargadas: ${confirmedReceipt.realRooms?.length || 0} | IP Confirmación: ${clientIp} | Fecha: ${confirmedAtFormatted}`
  );

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("hdv_sales_v13_updated"));
  }

  return confirmedReceipt;
}

/**
 * Garantiza de forma no destructiva que el primer caso de prueba oficial:
 * "Wakü Lodge" (Canaima — Contacto: Lusbelys Castro, Cliente de Prestigio con exoneración)
 * esté disponible y precargado en el sistema respetando intactos los 4 pre-registros previos.
 */
export async function ensureWakuLodgePreloadedInvitation(): Promise<SalesPreRegistrationReceipt> {
  const wakuTemplate = OFFICIAL_PRELOADED_INVITATIONS[0];
  const receipts = getSalesReceipts();
  const existingWaku = receipts.find(
    (r) =>
      r.establishmentSlug?.toLowerCase() === wakuTemplate.slug ||
      normalizeEstablishmentName(r.establishmentTitle).includes("waku lodge")
  );
  if (existingWaku) {
    return existingWaku;
  }

  return createOrUpdatePreloadedInvitation({
    targetFolio: wakuTemplate.defaultFolio,
    establishmentId: wakuTemplate.establishmentId,
    establishmentTitle: wakuTemplate.establishmentTitle,
    establishmentSlug: wakuTemplate.slug,
    categoryName: wakuTemplate.categoryName,
    destinationName: wakuTemplate.destinationName,
    state: wakuTemplate.state,
    city: wakuTemplate.city,
    whatsappNumber: wakuTemplate.whatsappNumber,
    officialEmail: wakuTemplate.officialEmail,
    officialWebsite: wakuTemplate.officialWebsite,
    shortDescription: wakuTemplate.shortDescription,
    primaryImage: wakuTemplate.primaryImage,
    galleryImages: wakuTemplate.galleryImages,
    latitude: wakuTemplate.latitude,
    longitude: wakuTemplate.longitude,
    contactPersonName: wakuTemplate.contactPersonName,
    benefitLevel: "prestigio_top50",
    modality: "exclusivo_prestigio",
    planId: wakuTemplate.planId
  });
}
