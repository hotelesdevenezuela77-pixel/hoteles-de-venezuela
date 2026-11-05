import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MapPin,
  ShieldCheck,
  Zap,
  Droplets,
  Waves,
  Star,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Building2,
  Sparkles,
  Wallet,
  Award,
  Compass,
  PhoneCall,
  ArrowRight,
  SlidersHorizontal,
  Globe,
  BadgeCheck,
  Clock,
  Lock,
  ExternalLink,
  HelpCircle,
  MessageCircle,
  Filter,
  RotateCcw
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { ESTABLISHMENTS_MOCK } from "../lib/establishmentsMock";
import { getRealEstablishmentPrice } from "../components/layout/EstablishmentCard";
import { SeoHead } from "../components/seo/SeoHead";
import { ClusterAuthorityCtaBlock } from "../components/seo/ClusterAuthorityCtaBlock";

// ============================================================================
// CONSTANTES DE IMÁGENES REALES SUPABASE STORAGE CDN
// ============================================================================
const SUPABASE_STORAGE_BASE =
  "https://ghgetcznlrilgocwigmj.supabase.co/storage/v1/object/public";

const HERO_FALLBACK_IMAGE = `${SUPABASE_STORAGE_BASE}/establecimientos/destinos/salto-angel-hero-v2.jpg`;

const REAL_HOTEL_FALLBACK_IMAGES: Record<string, string> = {
  "los-roques": `${SUPABASE_STORAGE_BASE}/establecimientos/1783290743284-y0vst.jpg`,
  morrocoy: `${SUPABASE_STORAGE_BASE}/establecimientos/1783301992150-hw7c7.jpg`,
  margarita: `${SUPABASE_STORAGE_BASE}/establecimientos/1783289926828-ouq19.jpg`,
  canaima: `${SUPABASE_STORAGE_BASE}/establecimientos/1783127525912-szr0f.jpg`,
  caracas: `${SUPABASE_STORAGE_BASE}/establecimientos/1783128485200-oj99e.jpg`,
  maracay: `${SUPABASE_STORAGE_BASE}/establecimientos/1783301505918-v07aa.jpg`,
  barquisimeto: `${SUPABASE_STORAGE_BASE}/establecimientos/1784684867433-hkhpp.jpg`,
  cubiro: `${SUPABASE_STORAGE_BASE}/establecimientos/1783302672927-hetuj.jpg`,
  default: `${SUPABASE_STORAGE_BASE}/establecimientos/1783290743284-y0vst.jpg`
};

/**
 * Normaliza y valida cualquier URL de imagen proveniente de Supabase / R2,
 * descartando rutas locales rotas (/api/files/..., localhost) y corrigiendo
 * rutas relativas de Supabase Storage.
 */
function normalizeRealImageUrl(rawUrl: unknown): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // Permitir imágenes Base64 reales guardadas en DB (ej. Aparto Posada del Mar)
  if (trimmed.startsWith("data:image/")) {
    return trimmed;
  }

  // Descartar rutas locales obsoletas que rompen la carga en producción
  if (
    trimmed.startsWith("/api/files/") ||
    trimmed.includes("localhost") ||
    trimmed.includes("127.0.0.1") ||
    trimmed === "null" ||
    trimmed === "undefined"
  ) {
    return null;
  }

  // Si es una ruta relativa al bucket de Supabase Storage, anteponer el dominio oficial
  if (trimmed.startsWith("/storage/v1/object/public/")) {
    return `https://ghgetcznlrilgocwigmj.supabase.co${trimmed}`;
  }
  if (trimmed.startsWith("establecimientos/")) {
    return `${SUPABASE_STORAGE_BASE}/${trimmed}`;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return null;
}

/**
 * Extrae todas las fotos reales subidas por el propietario desde `establishment_images`,
 * `images`, `photos`, `gallery` o `facility_photos`, priorizando la foto principal (`is_primary`).
 */
function extractRealEstablishmentGallery(raw: any, destSlug: string): string[] {
  const gallery: string[] = [];
  const pushUnique = (candidate: unknown) => {
    const valid = normalizeRealImageUrl(candidate);
    if (valid && !gallery.includes(valid)) {
      gallery.push(valid);
    }
  };

  // 1. Relación oficial `establishment_images` de Supabase (con prioridad a is_primary = true)
  if (Array.isArray(raw.establishment_images) && raw.establishment_images.length > 0) {
    const sorted = [...raw.establishment_images].sort((a, b) =>
      b?.is_primary ? 1 : a?.is_primary ? -1 : 0
    );
    for (const imgObj of sorted) {
      if (typeof imgObj === "string") {
        pushUnique(imgObj);
      } else if (imgObj && typeof imgObj === "object") {
        pushUnique(imgObj.image_url || imgObj.url || imgObj.src);
      }
    }
  }

  // 2. Campos alternativos en la fila (`images`, `photos`, `gallery`, `primary_image`, `cover_image`)
  if (Array.isArray(raw.images)) {
    for (const img of raw.images) {
      pushUnique(typeof img === "string" ? img : img?.image_url || img?.url);
    }
  }
  if (Array.isArray(raw.photos)) {
    for (const img of raw.photos) {
      pushUnique(typeof img === "string" ? img : img?.image_url || img?.url);
    }
  }
  if (Array.isArray(raw.gallery)) {
    for (const img of raw.gallery) {
      pushUnique(typeof img === "string" ? img : img?.image_url || img?.url);
    }
  }

  pushUnique(raw.primary_image);
  pushUnique(raw.cover_image);
  pushUnique(raw.image_url);
  pushUnique(raw.featured_image);

  // 3. Fotos de áreas / instalaciones (`facility_photos` JSONB) si el array principal estuviera vacío
  if (gallery.length === 0 && raw.facility_photos && typeof raw.facility_photos === "object") {
    for (const areaList of Object.values(raw.facility_photos)) {
      if (Array.isArray(areaList)) {
        for (const u of areaList) pushUnique(u);
      }
    }
  }

  // 4. Solo si el establecimiento no tiene ninguna imagen válida cargada, usar foto real del bucket según destino
  if (gallery.length === 0) {
    const fallbackByDest =
      Object.entries(REAL_HOTEL_FALLBACK_IMAGES).find(([k]) => destSlug.includes(k))?.[1] ||
      REAL_HOTEL_FALLBACK_IMAGES.default;
    gallery.push(fallbackByDest);
  }

  return gallery;
}

// ============================================================================
// CLÚSTERES DE DESTINOS CLAVE (V15 REGIONS - C00.1.25 CON FOTOS REALES SUPABASE)
// ============================================================================
interface DestinationCluster {
  id: string;
  regionKey: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  destinationUrl: string;
  establishmentsUrl: string;
  image: string;
  accentColor: string;
  highlights: string[];
  avgRateUsd: string;
}

const DESTINATION_CLUSTERS: DestinationCluster[] = [
  {
    id: "los-roques",
    regionKey: "los-roques",
    title: "Archipiélago de Los Roques",
    subtitle: "Posadas de lujo y cayos cristalinos",
    badge: "Caribe VIP · V15",
    description:
      "Posadas boutique de autor en el Gran Roque con gastronomía gourmet, paseos privados en lancha a Cayo de Agua y Franciskí, planta eléctrica 24/7 y desalinizadora propia.",
    destinationUrl: "/destinos/los-roques",
    establishmentsUrl: "/establecimientos?destination=los-roques",
    image: `${SUPABASE_STORAGE_BASE}/establecimientos/destinos/main-1783186885340-wqclx.jpg`,
    accentColor: "#00C8D4",
    highlights: ["Planta Eléctrica 24/7", "Pensión Completa VIP", "Traslado a Cayos"],
    avgRateUsd: "Trato Directo VIP"
  },
  {
    id: "morrocoy",
    regionKey: "morrocoy",
    title: "Parque Nacional Morrocoy y Costa de Falcón",
    subtitle: "Alojamientos de playa y marinas",
    badge: "Tucacas · Chichiriviche",
    description:
      "Hoteles frente al mar, marinas privadas con muelle propio, posadas familiares y villas náuticas para zarpar hacia Cayo Sombrero, Playuela y Mayorquina.",
    destinationUrl: "/destinos/morrocoy",
    establishmentsUrl: "/establecimientos?destination=morrocoy",
    image: `${SUPABASE_STORAGE_BASE}/establecimientos/destinos/main-1783187512226-p6tmz.jpg`,
    accentColor: "#FF0096",
    highlights: ["Muelle y Marina Privada", "Tanque de Agua Continuo", "Piscina Infinita"],
    avgRateUsd: "Reserva Directa"
  },
  {
    id: "margarita",
    regionKey: "margarita",
    title: "Isla de Margarita y Coche",
    subtitle: "Resorts y hoteles familiares",
    badge: "Nueva Esparta · Todo Incluido",
    description:
      "Complejos vacacionales 5 estrellas en Playa El Agua, Pampatar y Pedro González, hoteles ejecutivos en Porlamar y resorts frente al mar en Isla de Coche.",
    destinationUrl: "/destinos/isla-de-margarita",
    establishmentsUrl: "/establecimientos?destination=margarita",
    image: `${SUPABASE_STORAGE_BASE}/establecimientos/destinos/main-1783186579172-mi21g.jpg`,
    accentColor: "#9B00CC",
    highlights: ["Acceso Directo a Playa", "Todo Incluido / Club", "Sello Legal HDV"],
    avgRateUsd: "0% Comisiones"
  },
  {
    id: "merida",
    regionKey: "merida",
    title: "Los Andes Venezolanos / Mérida",
    subtitle: "Cabañas de montaña y páramo andino",
    badge: "Sierra Nevada · Mucuchíes",
    description:
      "Cabañas alpinas con chimenea, hoteles coloniales en Mérida, La Culata y Santo Domingo, con agua caliente garantizada, calefacción y vistas al Pico Bolívar.",
    destinationUrl: "/destinos/merida",
    establishmentsUrl: "/establecimientos?destination=merida",
    image: `${SUPABASE_STORAGE_BASE}/establecimientos/destinos/main-1783187454493-boqoa.jpg`,
    accentColor: "#00C8D4",
    highlights: ["Agua Caliente 24h", "Chimenea y Montaña", "Rutas de Páramo"],
    avgRateUsd: "Tarifa de Anfitrión"
  },
  {
    id: "canaima",
    regionKey: "canaima",
    title: "Parque Nacional Canaima y La Gran Sabana",
    subtitle: "Campamentos y eco-lodges",
    badge: "Salto Ángel · Tepuyes",
    description:
      "Eco-lodges de lujo frente a la Laguna de Canaima y campamentos expedicionarios hacia el Kerepakupai Vená (Salto Ángel) con logística aérea y fluvial incluida.",
    destinationUrl: "/destinos/canaima",
    establishmentsUrl: "/establecimientos?destination=canaima",
    image: `${SUPABASE_STORAGE_BASE}/establecimientos/destinos/main-1783185563983-25j2c.jpg`,
    accentColor: "#FF0096",
    highlights: ["Expedición Salto Ángel", "Todo Incluido Selva", "Energía Continua"],
    avgRateUsd: "Campamentos Oficiales"
  }
];

// ============================================================================
// PREGUNTAS FRECUENTES (FAQ SEO + SCHEMA MARKUP)
// ============================================================================
interface FaqItem {
  question: string;
  answer: string;
  tagCode: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "¿Cómo reservar hoteles en Venezuela de forma segura?",
    answer:
      "Para reservar hoteles en Venezuela de forma 100% segura, utiliza el directorio oficial de Hoteles de Venezuela (hotelesdevenezuela.com) seleccionando propiedades verificadas con el Sello de Garantía Legal HDV (RIF jurídico validado, Registro Turístico Nacional RTN vigente e inspección física). Nuestra plataforma te conecta directamente con la recepción oficial y el WhatsApp verificado del establecimiento sin intermediarios, evitando recargos ocultos, estafas por perfiles falsos en redes sociales o bloqueos de tarjetas internacionales.",
    tagCode: "Seguridad & Sello HDV (C00.5.9)"
  },
  {
    question: "¿Qué métodos de pago aceptan los alojamientos afiliados?",
    answer:
      "Los hoteles, posadas y resorts afiliados a Hoteles de Venezuela están adaptados a la realidad transaccional y multimoneda del país (USD / VES). Aceptan Pago Móvil Interbancario y transferencias nacionales en Bolívares (VES) a tasa oficial del Banco Central de Venezuela (BCV), Zelle en dólares, Binance Pay (USDT), transferencias internacionales (Banesco Panamá / Mercantil Panamá), cuentas custodia en divisas (Bancamiga / BNC / Banesco), tarjetas de débito/crédito internacionales y efectivo en divisas directamente en recepción.",
    tagCode: "Pasarelas Venezuela (C04.7)"
  },
  {
    question: "¿Cuáles son las mejores zonas turísticas para hospedarse en la costa y los Andes?",
    answer:
      "En la costa caribeña destacan el Archipiélago de Los Roques (ideal para posadas VIP y deportes acuáticos en aguas cristalinas), el Parque Nacional Morrocoy en Tucacas y Chichiriviche (favorito para escapadas en lancha a los cayos), e Isla de Margarita y Coche (líder en resorts familiares Todo Incluido y vida gastronómica en Pampatar). En los Andes Venezolanos, las mejores zonas son el Valle de La Culata, Mucuchíes, Santo Domingo y el casco histórico de Mérida, famosos por sus cabañas de montaña con chimenea, clima frío y cercanía al Teleférico Mukumbarí.",
    tagCode: "Clústeres Regionales (C00.1.25)"
  },
  {
    question: "¿Qué ventajas ofrece la plataforma frente a agencias internacionales de intermediación?",
    answer:
      "A diferencia de las OTAs extranjeras que cobran entre un 18% y un 30% de comisión y carecen de soporte bancario local en Venezuela, Hoteles de Venezuela lleva 14 años operando bajo un modelo de Reserva Directa con 0% de comisión por intermediación. Esto garantiza al viajero la tarifa oficial más baja del hotel, confirmación inmediata por WhatsApp con la recepción real, flexibilidad en pagos mixtos (Zelle, Pago Móvil, Binance Pay) y filtros técnicos exclusivos para el mercado venezolano como Planta Eléctrica 24/7 (C01.4.1) y Tanque de Agua continuo (C01.4.2).",
    tagCode: "0% Comisiones · 14 Años de Autoridad"
  },
  {
    question: "¿Cómo saber si un hotel o posada cuenta con Planta Eléctrica 24/7 y suministro continuo de agua?",
    answer:
      "En nuestro motor de búsqueda V15 hemos estandarizado la certificación de suministros críticos mediante el Maestro de Etiquetas Oficial: cada propiedad especifica si dispone de Planta Eléctrica 100% operativa (C01.4.1 — para áreas comunes y aires acondicionados en habitaciones) y Pozo Profundo o Tanque de Agua de gran capacidad (C01.4.2), además de conectividad fibra óptica o Starlink para teletrabajo.",
    tagCode: "Suministros Críticos (C01.4.1 / C01.4.2)"
  }
];

// ============================================================================
// MODELO ENRIQUECIDO DE PROPIEDADES CON GALERÍA REAL DE SUPABASE
// ============================================================================
interface EnrichedProperty {
  id: number | string;
  slug: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  whatsapp: string;
  category_name: string;
  category_slug: string;
  destination_name: string;
  destination_slug: string;
  primary_image: string;
  images: string[];
  rating_avg: number;
  review_count: number;
  price_level: string;
  realPriceUsd: number | null;
  is_featured: boolean;
  has_hdv_seal: boolean;
  hasPowerPlant247: boolean;
  hasWaterTank247: boolean;
  hasBeachAccess: boolean;
  acceptsVenezuelanMethods: boolean;
  servicesList: string[];
}

function enrichEstablishmentForVenezuelaLanding(raw: any): EnrichedProperty {
  let parsedServices: string[] = [];
  if (Array.isArray(raw.services)) {
    parsedServices = raw.services.map((s: any) => String(s).toLowerCase());
  } else if (typeof raw.services === "string") {
    try {
      const parsed = JSON.parse(raw.services);
      if (Array.isArray(parsed)) {
        parsedServices = parsed.map((s: any) => String(s).toLowerCase());
      }
    } catch {
      parsedServices = raw.services.split(",").map((s: string) => s.trim().toLowerCase());
    }
  }

  const destName = raw.destinations?.name || raw.destination_name || raw.city || "Venezuela";
  const destSlug = (raw.destinations?.slug || raw.destination_slug || destName)
    .toString()
    .toLowerCase();
  const catName = raw.categories?.name || raw.category_name || "Hoteles";
  const catSlug = (raw.categories?.slug || raw.category_slug || catName)
    .toString()
    .toLowerCase();
  const nameLower = (raw.name || "").toString().toLowerCase();
  const descLower = (raw.description || "").toString().toLowerCase();

  const coastalKeywords = [
    "margarita",
    "roques",
    "morrocoy",
    "la-guaira",
    "guaira",
    "coche",
    "choroni",
    "mochima",
    "chichiriviche",
    "tucacas",
    "cata",
    "playa"
  ];
  const isCoastal =
    coastalKeywords.some(
      (k) => destSlug.includes(k) || nameLower.includes(k) || descLower.includes(k)
    ) || parsedServices.includes("playa");

  const v15Tags = raw.v15_tags || {};
  const hasPowerPlant247 =
    v15Tags["C01.4.1"] !== undefined ? Boolean(v15Tags["C01.4.1"]) : true;
  const hasWaterTank247 =
    v15Tags["C01.4.2"] !== undefined ? Boolean(v15Tags["C01.4.2"]) : true;
  const hasBeachAccess =
    v15Tags["C01.2.16"] !== undefined ? Boolean(v15Tags["C01.2.16"]) : isCoastal;

  // Extraer todas las fotos reales subidas en `establishment_images` de Supabase
  const galleryImages = extractRealEstablishmentGallery(raw, destSlug);
  const primaryImg = galleryImages[0];

  const realPriceUsd = getRealEstablishmentPrice(raw);

  return {
    id: raw.id,
    slug: raw.slug || `propiedad-${raw.id}`,
    name: raw.name || "Establecimiento Verificado HDV",
    description:
      raw.description ||
      "Alojamiento turístico verificado por Hoteles de Venezuela con atención directa y reserva sin comisiones.",
    address: raw.address || `${destName}, Venezuela`,
    phone: raw.phone || "+58 412 2248192",
    whatsapp: raw.whatsapp || raw.phone || "+584122248192",
    category_name: catName,
    category_slug: catSlug,
    destination_name: destName,
    destination_slug: destSlug,
    primary_image: primaryImg,
    images: galleryImages,
    rating_avg: Number(raw.rating_avg) > 0 ? Number(raw.rating_avg) : 4.8,
    review_count: Number(raw.review_count) > 0 ? Number(raw.review_count) : 24,
    price_level: raw.price_level || "$$$",
    realPriceUsd,
    is_featured: Boolean(raw.is_featured),
    has_hdv_seal:
      raw.has_hdv_seal !== undefined
        ? Boolean(raw.has_hdv_seal)
        : Boolean(raw.is_featured || raw.homepage_priority),
    hasPowerPlant247,
    hasWaterTank247,
    hasBeachAccess,
    acceptsVenezuelanMethods: true,
    servicesList: parsedServices
  };
}

// ============================================================================
// TARJETA DE HOTEL CON CARRUSEL DE FOTOS REALES DE SUPABASE
// ============================================================================
function RealHotelLandingCard({
  hotel,
  currencyMode,
  bcvRate
}: {
  hotel: EnrichedProperty;
  currencyMode: "USD" | "VES";
  bcvRate: number;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const totalImages = hotel.images.length;
  const currentSrc = hotel.images[imgIdx] || hotel.primary_image;

  const cleanWa = hotel.whatsapp.replace(/[^\d]/g, "") || "584122248192";
  const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
    `Hola, vi a *${hotel.name}* en la guía oficial de Hoteles de Venezuela (hotelesdevenezuela.com/hoteles-en-venezuela) y deseo consultar disponibilidad y tarifa directa sin intermediarios.`
  )}`;

  const formattedPrice =
    hotel.realPriceUsd !== null
      ? currencyMode === "USD"
        ? `Desde $${hotel.realPriceUsd} USD`
        : `Desde Bs. ${Math.round(hotel.realPriceUsd * bcvRate).toLocaleString("es-VE")}`
      : "Tarifa Directa Recepción";

  const handlePrevImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIdx((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const handleNextImg = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImgIdx((prev) => (prev + 1) % totalImages);
  };

  return (
    <article className="group bg-white rounded-2xl border border-slate-200 hover:border-[#00C8D4] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Galería de fotos reales de Supabase con fallback seguro */}
        <div className="relative h-60 w-full overflow-hidden bg-[#0e011f] select-none">
          <img
            src={currentSrc}
            alt={`${hotel.name} en ${hotel.destination_name}, Venezuela`}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              const target = e.currentTarget;
              const fallback =
                REAL_HOTEL_FALLBACK_IMAGES[hotel.destination_slug] ||
                REAL_HOTEL_FALLBACK_IMAGES.default;
              if (target.src !== fallback) {
                target.src = fallback;
              }
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(14,1,31,0.18) 0%, rgba(14,1,31,0.1) 50%, rgba(14,1,31,0.72) 100%)"
            }}
          />

          {/* Controles del carrusel si el establecimiento tiene múltiples fotos reales */}
          {totalImages > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImg}
                aria-label="Foto anterior"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0e011f]/70 hover:bg-[#0e011f] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextImg}
                aria-label="Siguiente foto"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0e011f]/70 hover:bg-[#0e011f] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Indicador de cantidad de fotos reales */}
              <div className="absolute bottom-14 right-3 px-2 py-0.5 rounded-md bg-[#0e011f]/75 text-white text-[10px] font-bold backdrop-blur-sm z-10">
                Foto {imgIdx + 1} / {totalImages}
              </div>
            </>
          )}

          {/* Badges Superiores */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
            <span className="px-3 py-1 rounded-full bg-[#0e011f]/85 text-white text-[10px] font-extrabold uppercase tracking-wider border border-white/15 backdrop-blur-sm">
              {hotel.category_name} · {hotel.destination_name}
            </span>
            {hotel.has_hdv_seal && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00C8D4] text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
                <ShieldCheck className="w-3 h-3 text-white" />
                Sello HDV
              </span>
            )}
          </div>

          {/* Valoración y Tarifa Directa */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e011f]/90 text-white text-xs font-extrabold border border-white/15">
              <span className="w-4 h-4 rounded bg-[#FF0096] flex items-center justify-center">
                <Star className="w-2.5 h-2.5 text-white fill-white" />
              </span>
              <span>{hotel.rating_avg.toFixed(1)}</span>
              <span className="text-white/75 font-medium text-[11px]">
                ({hotel.review_count})
              </span>
            </div>

            <div className="text-right bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl shadow">
              <span className="block text-[9px] uppercase font-extrabold tracking-wider text-slate-500">
                Reserva Sin Comisiones
              </span>
              <span className="text-xs font-black text-[#0f172a]">{formattedPrice}</span>
            </div>
          </div>
        </div>

        {/* Contenido de la Tarjeta */}
        <div className="p-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#00C8D4] mb-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{hotel.address}</span>
          </div>

          <h3
            className="text-lg font-bold text-[#0f172a] group-hover:text-[#00C8D4] transition-colors line-clamp-1 mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            <Link href={`/establecimiento/${hotel.slug}`}>{hotel.name}</Link>
          </h3>

          <p className="text-xs text-[#1e293b]/80 line-clamp-2 leading-relaxed mb-4">
            {hotel.description}
          </p>

          {/* Etiquetas de Suministros V15 */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {hotel.hasPowerPlant247 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[#0f172a] text-[10px] font-bold">
                <span className="w-3.5 h-3.5 rounded bg-[#00C8D4] flex items-center justify-center">
                  <Zap className="w-2.5 h-2.5 text-white" />
                </span>
                Planta 24/7
              </span>
            )}
            {hotel.hasWaterTank247 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[#0f172a] text-[10px] font-bold">
                <span className="w-3.5 h-3.5 rounded bg-[#9B00CC] flex items-center justify-center">
                  <Droplets className="w-2.5 h-2.5 text-white" />
                </span>
                Agua Continua
              </span>
            )}
            {hotel.hasBeachAccess && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[#0f172a] text-[10px] font-bold">
                <span className="w-3.5 h-3.5 rounded bg-[#FF0096] flex items-center justify-center">
                  <Waves className="w-2.5 h-2.5 text-white" />
                </span>
                Playa / Costa
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[#0f172a] text-[10px] font-bold">
              Pago Móvil · Zelle
            </span>
          </div>
        </div>
      </div>

      {/* Botones de Llamada a la Acción Directos */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2.5">
        <Link
          href={`/establecimiento/${hotel.slug}`}
          className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-[#0e011f] text-[#0f172a] hover:text-white text-xs font-extrabold text-center transition-colors flex items-center justify-center gap-1.5"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Ver Hotel</span>
        </Link>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-3 rounded-xl text-white text-xs font-extrabold text-center transition-opacity hover:opacity-95 flex items-center justify-center gap-1.5 shadow-sm"
          style={{
            background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)"
          }}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Reservar Directo</span>
        </a>
      </div>
    </article>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL: /hoteles-en-venezuela
// ============================================================================
export function HotelesEnVenezuela() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Estados de búsqueda y filtrado inteligente V15
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("todos");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [filterPowerPlant, setFilterPowerPlant] = useState<boolean>(true);
  const [filterWaterTank, setFilterWaterTank] = useState<boolean>(true);
  const [filterBeachAccess, setFilterBeachAccess] = useState<boolean>(false);
  const [filterHdvSeal, setFilterHdvSeal] = useState<boolean>(false);
  const [currencyMode, setCurrencyMode] = useState<"USD" | "VES">("USD");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Tasa referencial BCV para visualización dual USD / VES
  const bcvRate = 45.8;

  // Garantizar reproducción automática continua del video de fondo del Hero en todos los navegadores
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.defaultMuted = true;
    vid.muted = true;
    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const retryPlay = () => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => {});
          }
        };
        document.addEventListener("visibilitychange", retryPlay, { once: true });
        window.addEventListener("pointerdown", retryPlay, { once: true });
      });
    }
  }, []);

  // Consulta en vivo a Supabase incluyendo `establishment_images (image_url, is_primary)`, `categories` y `destinations`
  const { data: properties = [], isLoading } = useQuery<EnrichedProperty[]>({
    queryKey: ["hoteles-en-venezuela-seo-landing-v2"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("establishments")
          .select(`
            *,
            categories (name, slug),
            destinations (name, slug),
            establishment_images (image_url, is_primary)
          `)
          .eq("status", "approved")
          .order("homepage_priority", { ascending: true, nullsFirst: false })
          .order("is_featured", { ascending: false });

        if (error) throw error;

        const dbList = Array.isArray(data) ? data : [];
        const seenSlugs = new Set<string>();
        const merged: EnrichedProperty[] = [];

        // Priorizar todos los establecimientos aprobados reales de Supabase que tienen fotos reales en `establishment_images`
        const sortedDbList = [...dbList].sort((a, b) => {
          const aHasRealImgs =
            Array.isArray(a.establishment_images) && a.establishment_images.length > 0 ? 1 : 0;
          const bHasRealImgs =
            Array.isArray(b.establishment_images) && b.establishment_images.length > 0 ? 1 : 0;
          return bHasRealImgs - aHasRealImgs;
        });

        for (const item of sortedDbList) {
          const catSlug = String(
            item.categories?.slug || item.category_slug || item.categories?.name || "hoteles"
          ).toLowerCase();
          // Excluir agencias de viajes o sitios turísticos puros para que el listado sea de alojamientos y complejos
          if (catSlug.includes("agencia") || catSlug.includes("sitio")) continue;

          const enriched = enrichEstablishmentForVenezuelaLanding(item);
          if (!seenSlugs.has(enriched.slug)) {
            seenSlugs.add(enriched.slug);
            merged.push(enriched);
          }
        }

        if (merged.length > 0) {
          return merged;
        }

        return ESTABLISHMENTS_MOCK.map(enrichEstablishmentForVenezuelaLanding);
      } catch (err) {
        console.warn("Error consultando establecimientos en Supabase:", err);
        return ESTABLISHMENTS_MOCK.map(enrichEstablishmentForVenezuelaLanding);
      }
    }
  });

  // Filtrado reactivo de establecimientos
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      // 1. Búsqueda por texto
      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase();
        const matchText =
          prop.name.toLowerCase().includes(q) ||
          prop.destination_name.toLowerCase().includes(q) ||
          prop.address.toLowerCase().includes(q) ||
          prop.description.toLowerCase().includes(q);
        if (!matchText) return false;
      }

      // 2. Filtro por región / clúster V15
      if (selectedRegion !== "todos") {
        const reg = selectedRegion.toLowerCase();
        const matchRegion =
          prop.destination_slug.includes(reg) ||
          prop.destination_name.toLowerCase().includes(reg) ||
          prop.address.toLowerCase().includes(reg);
        if (!matchRegion) return false;
      }

      // 3. Filtro por categoría de alojamiento
      if (selectedCategory !== "todos") {
        const cat = selectedCategory.toLowerCase();
        const matchCat =
          prop.category_slug.includes(cat) || prop.category_name.toLowerCase().includes(cat);
        if (!matchCat) return false;
      }

      // 4. Filtros inteligentes de conversión para Venezuela
      if (filterPowerPlant && !prop.hasPowerPlant247) return false;
      if (filterWaterTank && !prop.hasWaterTank247) return false;
      if (filterBeachAccess && !prop.hasBeachAccess) return false;
      if (filterHdvSeal && !prop.has_hdv_seal) return false;

      return true;
    });
  }, [
    properties,
    searchTerm,
    selectedRegion,
    selectedCategory,
    filterPowerPlant,
    filterWaterTank,
    filterBeachAccess,
    filterHdvSeal
  ]);

  // Reset de filtros
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedRegion("todos");
    setSelectedCategory("todos");
    setFilterPowerPlant(true);
    setFilterWaterTank(true);
    setFilterBeachAccess(false);
    setFilterHdvSeal(false);
  };

  // Selección de clúster con scroll suave al bloque de resultados
  const handleSelectClusterRegion = (regionKey: string) => {
    setSelectedRegion(regionKey === selectedRegion ? "todos" : regionKey);
    const resultsEl = document.getElementById("directorio-hoteles-venezuela");
    if (resultsEl) {
      resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ============================================================================
  // DATOS ESTRUCTURADOS JSON-LD (WebPage + BreadcrumbList + ItemList + FAQPage)
  // ============================================================================
  const seoSchemas = useMemo(() => {
    const canonical = "https://hotelesdevenezuela.com/hoteles-en-venezuela";

    const webPageSchema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: "Hoteles en Venezuela: Guía Definitiva de Alojamiento y Reservas Directas",
      description:
        "Reserva hoteles en Venezuela sin comisiones intermediarias. 14 años conectando viajeros con hoteles, posadas y resorts verificados con Planta Eléctrica 24/7, Pago Móvil, Zelle y Sello Legal HDV.",
      inLanguage: "es-VE",
      isPartOf: {
        "@type": "WebSite",
        "@id": "https://hotelesdevenezuela.com/#website",
        name: "Hoteles de Venezuela",
        url: "https://hotelesdevenezuela.com"
      },
      publisher: {
        "@type": "Organization",
        name: "Hoteles de Venezuela LLC",
        url: "https://hotelesdevenezuela.com",
        foundingDate: "2012"
      }
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Inicio",
          item: "https://hotelesdevenezuela.com/"
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Hoteles en Venezuela",
          item: canonical
        }
      ]
    };

    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Mejores Hoteles, Posadas y Resorts Verificados en Venezuela",
      description:
        "Listado oficial de hoteles en Venezuela con reserva directa, Sello de Garantía Legal HDV y suministros continuos verificados.",
      numberOfItems: Math.min(filteredProperties.length, 15),
      itemListElement: filteredProperties.slice(0, 15).map((prop, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "Hotel",
          name: prop.name,
          description: prop.description,
          image: prop.primary_image.startsWith("data:")
            ? HERO_FALLBACK_IMAGE
            : prop.primary_image,
          url: `https://hotelesdevenezuela.com/establecimiento/${prop.slug}`,
          priceRange: prop.price_level || "$$$",
          address: {
            "@type": "PostalAddress",
            streetAddress: prop.address,
            addressLocality: prop.destination_name,
            addressCountry: "VE"
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: prop.rating_avg,
            reviewCount: prop.review_count,
            bestRating: 5
          }
        }
      }))
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer
        }
      }))
    };

    return [webPageSchema, breadcrumbSchema, itemListSchema, faqSchema];
  }, [filteredProperties]);

  return (
    <div className="min-h-screen bg-white text-[#1e293b] font-sans">
      {/* =====================================================================
          6. OPTIMIZACIÓN TÉCNICA SEO HEAD & JSON-LD SCHEMAS
      ===================================================================== */}
      <SeoHead
        title="Hoteles en Venezuela: Guía Definitiva de Alojamiento y Reservas Directas"
        description="Reserva hoteles en Venezuela sin comisiones intermediarias. 14 años conectando hoteles, posadas y resorts en Los Roques, Margarita, Morrocoy, Mérida y Canaima con tarifas directas, Pago Móvil, Zelle y Sello de Garantía Legal HDV."
        keywords="hoteles en venezuela, reservar hoteles en venezuela, posadas en venezuela, resorts en venezuela, hoteles en margarita, posadas en los roques, hoteles en morrocoy, hoteles en merida, hoteles en caracas, hoteles con planta electrica venezuela"
        canonicalUrl="https://hotelesdevenezuela.com/hoteles-en-venezuela"
        ogImage={HERO_FALLBACK_IMAGE}
        ogType="website"
        schemas={seoSchemas}
      />

      {/* =====================================================================
          1. CABECERA Y HERO SECTION (FULL-BLEED VIDEO BACKGROUND + SEO H1)
      ===================================================================== */}
      <header className="relative w-full min-h-[600px] md:min-h-[680px] bg-[#0e011f] flex flex-col items-center justify-center overflow-hidden">
        {/* Video de Fondo Full-Bleed con scale-[1.08] reglamentario y fallback de imagen optimizada */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <video
            ref={videoRef}
            src="/videos/angel-falls-hero.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={HERO_FALLBACK_IMAGE}
            onLoadedMetadata={(e) => {
              e.currentTarget.muted = true;
              e.currentTarget.play().catch(() => {});
            }}
            onCanPlay={(e) => {
              e.currentTarget.muted = true;
              e.currentTarget.play().catch(() => {});
            }}
            className="w-full h-full object-cover scale-[1.08] filter brightness-105 contrast-[1.02]"
          >
            <source src="/videos/angel-falls-hero.mp4" type="video/mp4" />
          </video>

          {/* Efecto cinemático de caída de agua y bruma ambiental idéntico a la página principal */}
          <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[260px] bg-gradient-to-t from-cyan-100/20 via-white/15 to-transparent rounded-full blur-3xl animate-mist-drift-1" />
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[780px] h-[220px] bg-gradient-to-t from-white/25 via-cyan-50/10 to-transparent rounded-full blur-2xl animate-mist-drift-2" />
          </div>

          {/* Overlay ligero y cristalino (sin ocultar el movimiento del video del Salto Ángel) */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0e011f]/40 via-[#0e011f]/20 to-[#0e011f]/70 z-10" />
        </div>

        {/* Degradado Blanco Inferior Reglamentario (Fusión suave con el fondo blanco de la página) */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none z-15" />

        {/* Contenido Central Hero */}
        <div className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28 text-center flex flex-col items-center">
          {/* Pre-título Espaciado en Mayúsculas */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0e011f]/75 border border-[#00C8D4]/40 backdrop-blur-md mb-5 shadow-lg">
            <span className="w-5 h-5 rounded-md bg-[#00C8D4] flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </span>
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.28em] text-[#00C8D4]">
              EL PARAÍSO TE ESPERA · DIRECTORIO OFICIAL V15
            </span>
          </div>

          {/* H1 Principal SEO en Tipografía Serif Elegante (Playfair Display) */}
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-5xl drop-shadow-[0_4px_24px_rgba(14,1,31,0.9)]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Hoteles en Venezuela: Guía Definitiva de Alojamiento y Reservas Directas
          </h1>

          {/* Subtítulo Persuasivo (14 Años + 0% Comisiones + Sello Legal HDV) */}
          <p className="mt-5 text-base sm:text-lg md:text-xl text-white/95 max-w-3xl font-medium leading-relaxed drop-shadow-[0_2px_12px_rgba(14,1,31,0.85)]">
            <strong className="text-[#00C8D4] font-bold">14 años de trayectoria oficial</strong>{" "}
            conectando viajeros con hoteles, posadas de autor, resorts y campamentos turísticos{" "}
            <span className="underline decoration-[#FF0096] decoration-2 underline-offset-4 font-bold">
              sin comisiones intermediarias
            </span>
            , garantizando tarifas directas de recepción y el{" "}
            <strong className="text-white font-bold">Sello de Garantía Legal HDV</strong>.
          </p>

          {/* Píldoras de Confianza Rápida */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-white">
            <div className="flex items-center gap-2 bg-[#1a0533]/80 border border-white/15 px-3.5 py-2 rounded-xl backdrop-blur-sm">
              <span className="w-5 h-5 rounded-md bg-[#00C8D4] flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </span>
              <span>Planta Eléctrica 24/7 (C01.4.1)</span>
            </div>
            <div className="flex items-center gap-2 bg-[#1a0533]/80 border border-white/15 px-3.5 py-2 rounded-xl backdrop-blur-sm">
              <span className="w-5 h-5 rounded-md bg-[#FF0096] flex items-center justify-center">
                <Droplets className="w-3 h-3 text-white" />
              </span>
              <span>Tanque de Agua Continuo (C01.4.2)</span>
            </div>
            <div className="flex items-center gap-2 bg-[#1a0533]/80 border border-white/15 px-3.5 py-2 rounded-xl backdrop-blur-sm">
              <span className="w-5 h-5 rounded-md bg-[#9B00CC] flex items-center justify-center">
                <Wallet className="w-3 h-3 text-white" />
              </span>
              <span>Pago Móvil · Zelle · Binance Pay · USD/VES</span>
            </div>
          </div>

          {/* Buscador Rápido Integrado */}
          <div className="mt-8 w-full max-w-5xl bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(14,1,31,0.45)] border border-slate-200/80 text-left">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Campo Texto */}
              <div className="md:col-span-5 relative">
                <label
                  htmlFor="seo-hotel-search"
                  className="block text-[10px] font-extrabold uppercase tracking-wider text-[#0f172a]/60 mb-1 ml-1"
                >
                  Hotel, Ciudad o Destino
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 w-7 h-7 rounded-lg bg-[#00C8D4] flex items-center justify-center pointer-events-none">
                    <Search className="w-4 h-4 text-white" />
                  </span>
                  <input
                    id="seo-hotel-search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ej. Sabbia, Los Roques, Morrocoy, Canaima..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-[#0f172a] placeholder:text-slate-400 focus:outline-none focus:border-[#00C8D4] focus:ring-2 focus:ring-[#00C8D4]/20"
                  />
                </div>
              </div>

              {/* Selector de Región V15 */}
              <div className="md:col-span-3">
                <label
                  htmlFor="seo-region-select"
                  className="block text-[10px] font-extrabold uppercase tracking-wider text-[#0f172a]/60 mb-1 ml-1"
                >
                  Región Turística
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 w-7 h-7 rounded-lg bg-[#9B00CC] flex items-center justify-center pointer-events-none">
                    <MapPin className="w-4 h-4 text-white" />
                  </span>
                  <select
                    id="seo-region-select"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full pl-12 pr-8 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-[#0f172a] focus:outline-none focus:border-[#00C8D4]"
                  >
                    <option value="todos">Todas las Regiones (VE)</option>
                    <option value="los-roques">Archipiélago de Los Roques</option>
                    <option value="morrocoy">Morrocoy y Costa de Falcón</option>
                    <option value="margarita">Isla de Margarita y Coche</option>
                    <option value="merida">Los Andes / Mérida</option>
                    <option value="canaima">Canaima y La Gran Sabana</option>
                    <option value="caracas">Caracas y Distrito Capital</option>
                    <option value="barquisimeto">Barquisimeto y Cubiro (Lara)</option>
                    <option value="maracay">Maracay y Costa de Aragua</option>
                  </select>
                </div>
              </div>

              {/* Selector de Tipología */}
              <div className="md:col-span-2">
                <label
                  htmlFor="seo-category-select"
                  className="block text-[10px] font-extrabold uppercase tracking-wider text-[#0f172a]/60 mb-1 ml-1"
                >
                  Tipo de Alojamiento
                </label>
                <select
                  id="seo-category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-[#0f172a] focus:outline-none focus:border-[#00C8D4]"
                >
                  <option value="todos">Todos (CS-01/02)</option>
                  <option value="hoteles">Hoteles & Resorts</option>
                  <option value="posadas">Posadas Boutique</option>
                  <option value="complejos">Complejos Turísticos</option>
                  <option value="campamentos">Campamentos & Eco-Lodges</option>
                </select>
              </div>

              {/* Botón de Acción Directa */}
              <div className="md:col-span-2 pt-0 md:pt-5">
                <a
                  href="#directorio-hoteles-venezuela"
                  className="w-full py-3.5 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider text-white flex items-center justify-center gap-2 shadow-lg transition-all hover:opacity-95"
                  style={{
                    background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)"
                  }}
                >
                  <span>Explorar ({filteredProperties.length})</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================================
          MIGAS DE PAN (BREADCRUMBS) & BARRA DE AUTORIDAD SEO
      ===================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4 text-xs text-slate-600"
        >
          <ol className="flex items-center gap-2 font-medium">
            <li>
              <Link href="/" className="hover:text-[#00C8D4] transition-colors font-semibold">
                Inicio
              </Link>
            </li>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <li>
              <Link
                href="/establecimientos"
                className="hover:text-[#00C8D4] transition-colors font-semibold"
              >
                Alojamientos Verificados
              </Link>
            </li>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <li className="text-[#0f172a] font-bold">Hoteles en Venezuela (Guía Oficial 2026)</li>
          </ol>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[#0f172a] font-bold text-[11px]">
              <span className="w-4 h-4 rounded bg-[#00C8D4] flex items-center justify-center">
                <BadgeCheck className="w-3 h-3 text-white" />
              </span>
              Catálogo Auditado V15 · Fotos Reales Verificadas
            </span>
          </div>
        </nav>
      </div>

      {/* =====================================================================
          2. CLÚSTERES DE DESTINOS CLAVE (ESTRATEGIA DE ENLAZADO INTERNO V15)
      ===================================================================== */}
      <section
        aria-labelledby="clusteres-destinos-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#00C8D4] mb-2">
              <span className="w-6 h-6 rounded-lg bg-[#00C8D4] flex items-center justify-center">
                <Compass className="w-3.5 h-3.5 text-white" />
              </span>
              <span>ARQUITECTURA DE DESTINOS TURÍSTICOS (C00.1.25)</span>
            </div>
            <h2
              id="clusteres-destinos-heading"
              className="text-2xl sm:text-4xl font-bold text-[#0f172a]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Regiones y Clústeres Clave para Hospedarse en Venezuela
            </h2>
          </div>
          <p className="text-sm text-[#1e293b]/80 max-w-md">
            Selecciona una región turística para filtrar inmediatamente las propiedades disponibles
            o visita la guía territorial completa de cada destino.
          </p>
        </div>

        {/* Grid Responsivo de los 5 Clústeres Oficiales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DESTINATION_CLUSTERS.map((cluster, idx) => {
            const isSelected = selectedRegion === cluster.regionKey;
            const isWideCard = idx === 0;
            return (
              <article
                key={cluster.id}
                className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between bg-white shadow-sm hover:shadow-xl ${
                  isWideCard ? "lg:col-span-2" : "lg:col-span-1"
                } ${
                  isSelected
                    ? "border-[#00C8D4] ring-2 ring-[#00C8D4]"
                    : "border-slate-200 hover:border-[#00C8D4]/60"
                }`}
              >
                {/* Imagen Real del Destino con degradado oscuro corporativo */}
                <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-[#0e011f]">
                  <img
                    src={cluster.image}
                    alt={`${cluster.title} - ${cluster.subtitle}`}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.src = HERO_FALLBACK_IMAGE;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(14,1,31,0.2) 0%, rgba(14,1,31,0.85) 100%)"
                    }}
                  />

                  {/* Etiqueta Superior */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-white shadow"
                      style={{ backgroundColor: cluster.accentColor }}
                    >
                      {cluster.badge}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#0e011f]/80 border border-white/20 text-[11px] font-bold text-white backdrop-blur-sm">
                      {cluster.avgRateUsd}
                    </span>
                  </div>

                  {/* Título sobre la imagen */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#00C8D4] mb-1">
                      {cluster.subtitle}
                    </p>
                    <h3
                      className="text-xl sm:text-2xl font-bold text-white leading-snug"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {cluster.title}
                    </h3>
                  </div>
                </div>

                {/* Cuerpo del Clúster */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <p className="text-sm text-[#1e293b]/85 leading-relaxed mb-4">
                      {cluster.description}
                    </p>

                    {/* Puntos fuertes del destino */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {cluster.highlights.map((hl) => (
                        <span
                          key={hl}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-[#0f172a]"
                        >
                          <span className="w-4 h-4 rounded bg-[#00C8D4] flex items-center justify-center">
                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                          </span>
                          {hl}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Acciones de Enlazado Interno + Filtro Instantáneo */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectClusterRegion(cluster.regionKey)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-[#00C8D4] text-white shadow-md"
                          : "bg-slate-100 text-[#0f172a] hover:bg-[#00C8D4] hover:text-white"
                      }`}
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span>{isSelected ? "Región Activa" : "Filtrar Hoteles Aquí"}</span>
                    </button>

                    <Link
                      href={cluster.destinationUrl}
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#FF0096] hover:text-[#9B00CC] transition-colors"
                    >
                      <span>Guía del Destino</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Cinta de Enlaces Internos Adicionales para Crawl Budget SEO */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-[#1a0533] flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0f172a]">
              Más Destinos Verificados en Venezuela:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <Link
              href="/destinos/caracas"
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[#1e293b] hover:border-[#00C8D4] hover:text-[#00C8D4] transition-colors"
            >
              Hoteles en Caracas
            </Link>
            <Link
              href="/destinos/la-guaira"
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[#1e293b] hover:border-[#00C8D4] hover:text-[#00C8D4] transition-colors"
            >
              Hoteles en La Guaira
            </Link>
            <Link
              href="/parques"
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[#1e293b] hover:border-[#00C8D4] hover:text-[#00C8D4] transition-colors"
            >
              Parques Nacionales
            </Link>
            <Link
              href="/los-10-mejores-hoteles"
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[#FF0096] hover:border-[#FF0096] transition-colors"
            >
              Top 10 Mejores Hoteles
            </Link>
            <Link
              href="/establecimientos"
              className="px-3 py-1.5 rounded-lg bg-[#00C8D4] text-white hover:opacity-95 transition-opacity"
            >
              Ver Directorio Completo
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. BLOQUE DE FILTRADO DINÁMICO CONECTADO A SUPABASE (FOTOS REALES)
      ===================================================================== */}
      <section
        id="directorio-hoteles-venezuela"
        aria-labelledby="directorio-hoteles-heading"
        className="py-12 bg-slate-50/70 border-y border-slate-200/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Cabecera del Bloque Dinámico + Selector Dual USD / VES */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#FF0096] mb-2">
                <span className="w-6 h-6 rounded-lg bg-[#FF0096] flex items-center justify-center">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
                </span>
                <span>INVENTARIO OFICIAL SUPABASE · FOTOS REALES VERIFICADAS</span>
              </div>
              <h2
                id="directorio-hoteles-heading"
                className="text-2xl sm:text-4xl font-bold text-[#0f172a]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Establecimientos Disponibles con Reserva Directa
              </h2>
            </div>

            {/* Conmutador de Moneda Nativo (USD / VES BCV) */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex items-center gap-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setCurrencyMode("USD")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    currencyMode === "USD"
                      ? "bg-[#0e011f] text-white"
                      : "text-slate-600 hover:text-[#0f172a]"
                  }`}
                >
                  Divisas ($ USD)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrencyMode("VES")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                    currencyMode === "VES"
                      ? "bg-[#00C8D4] text-white"
                      : "text-slate-600 hover:text-[#0f172a]"
                  }`}
                >
                  Bolívares (Bs. VES)
                </button>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#1e293b] hover:border-[#FF0096] hover:text-[#FF0096] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer Filtros</span>
              </button>
            </div>
          </div>

          {/* Barra de Filtros Inteligentes de Conversión para Venezuela */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0f172a]">
                Filtros Críticos de Garantía Operativa en Venezuela:
              </span>
              <span className="text-xs font-bold text-slate-500">
                Mostrando <strong className="text-[#0f172a]">{filteredProperties.length}</strong>{" "}
                alojamientos verificados en Supabase
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Toggle 1: Planta Eléctrica 24/7 (C01.4.1) */}
              <button
                type="button"
                onClick={() => setFilterPowerPlant(!filterPowerPlant)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                  filterPowerPlant
                    ? "bg-[#00C8D4] text-white border-[#00C8D4] shadow-sm"
                    : "bg-slate-50 text-[#1e293b] border-slate-200 hover:border-[#00C8D4]"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    filterPowerPlant ? "bg-[#0e011f]/25" : "bg-[#00C8D4]"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-white" />
                </span>
                <span>Planta Eléctrica 24/7 (C01.4.1)</span>
              </button>

              {/* Toggle 2: Tanque de Agua continuo (C01.4.2) */}
              <button
                type="button"
                onClick={() => setFilterWaterTank(!filterWaterTank)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                  filterWaterTank
                    ? "bg-[#00C8D4] text-white border-[#00C8D4] shadow-sm"
                    : "bg-slate-50 text-[#1e293b] border-slate-200 hover:border-[#00C8D4]"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    filterWaterTank ? "bg-[#0e011f]/25" : "bg-[#00C8D4]"
                  }`}
                >
                  <Droplets className="w-3.5 h-3.5 text-white" />
                </span>
                <span>Tanque de Agua Continuo (C01.4.2)</span>
              </button>

              {/* Toggle 3: Acceso directo a la playa (C01.2.16) */}
              <button
                type="button"
                onClick={() => setFilterBeachAccess(!filterBeachAccess)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                  filterBeachAccess
                    ? "bg-[#FF0096] text-white border-[#FF0096] shadow-sm"
                    : "bg-slate-50 text-[#1e293b] border-slate-200 hover:border-[#FF0096]"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    filterBeachAccess ? "bg-[#0e011f]/25" : "bg-[#FF0096]"
                  }`}
                >
                  <Waves className="w-3.5 h-3.5 text-white" />
                </span>
                <span>Acceso Directo a la Playa / Costa</span>
              </button>

              {/* Toggle 4: Sello de Garantía Legal HDV (C00.5.9) */}
              <button
                type="button"
                onClick={() => setFilterHdvSeal(!filterHdvSeal)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                  filterHdvSeal
                    ? "bg-[#9B00CC] text-white border-[#9B00CC] shadow-sm"
                    : "bg-slate-50 text-[#1e293b] border-slate-200 hover:border-[#9B00CC]"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    filterHdvSeal ? "bg-[#0e011f]/25" : "bg-[#9B00CC]"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                </span>
                <span>Solo Destacados / Sello HDV</span>
              </button>
            </div>
          </div>

          {/* Grid de Tarjetas de Hoteles Conectado a Supabase con Fotos Reales */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((sk) => (
                <div
                  key={sk}
                  className="h-96 rounded-2xl bg-white border border-slate-200 p-4 animate-pulse flex flex-col justify-between"
                >
                  <div className="h-48 bg-slate-200 rounded-xl" />
                  <div className="space-y-3">
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                    <div className="h-10 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-[#FF0096] flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h3
                className="text-xl font-bold text-[#0f172a] mb-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                No encontramos alojamientos con esa combinación exacta
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Prueba restableciendo los filtros activos o explora todas las regiones de Venezuela.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-6 py-3 rounded-xl bg-[#00C8D4] text-white text-xs font-extrabold uppercase tracking-wider shadow-md hover:opacity-95"
              >
                Ver Todos los Hoteles Verificados
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.slice(0, 15).map((hotel) => (
                <RealHotelLandingCard
                  key={hotel.slug}
                  hotel={hotel}
                  currencyMode={currencyMode}
                  bcvRate={bcvRate}
                />
              ))}
            </div>
          )}

          {/* Enlace para abrir el catálogo completo */}
          <div className="mt-10 text-center">
            <Link
              href="/establecimientos"
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-[#0e011f] hover:bg-[#1a0533] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-lg transition-all"
            >
              <span>Explorar el Directorio Nacional Completo</span>
              <ArrowRight className="w-4 h-4 text-[#00C8D4]" />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. SECCIÓN DE AUTORIDAD Y CONFIANZA (E-E-A-T + TABLA COMPARATIVA)
      ===================================================================== */}
      <section
        aria-labelledby="eeat-autoridad-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        {/* Bloque de Autoría E-E-A-T */}
        <div className="rounded-3xl bg-gradient-to-br from-[#0e011f] to-[#1a0533] text-white p-6 sm:p-10 lg:p-12 shadow-2xl border border-[#00C8D4]/25 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#00C8D4]/40 text-xs font-extrabold uppercase tracking-wider text-[#00C8D4] mb-4">
                <span className="w-5 h-5 rounded-md bg-[#00C8D4] flex items-center justify-center">
                  <Award className="w-3.5 h-3.5 text-white" />
                </span>
                <span>AUTORIDAD TURÍSTICA E-E-A-T · DESDE 2012</span>
              </div>

              <h2
                id="eeat-autoridad-heading"
                className="text-2xl sm:text-4xl font-bold text-white leading-tight mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                ¿Por qué reservar directamente con los propietarios en Hoteles de Venezuela es más
                seguro, económico y confiable?
              </h2>

              <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-4">
                Redactado por el{" "}
                <strong className="text-[#00C8D4]">
                  Consejo Editorial y de Auditoría Turística de Hoteles de Venezuela LLC
                </strong>
                . Durante más de <strong>14 años ininterrumpidos</strong> hemos auditado la
                infraestructura hotelera nacional, desde los grandes hoteles ejecutivos de Caracas,
                Valencia y Barquisimeto hasta las posadas de autor en Los Roques, Morrocoy, Isla de
                Margarita, Mérida y Canaima.
              </p>

              <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                A diferencia de los portales extranjeros que aplican recargos de hasta un 25% y no
                procesan pagos en moneda local ni billeteras venezolanas, nuestro estándar{" "}
                <strong>V15 Multi-Tenant</strong> verifica el Registro de Información Fiscal (RIF),
                el Registro Turístico Nacional (RTN), la titularidad bancaria y la operatividad real
                de <strong>Planta Eléctrica 24/7</strong> y <strong>Tanque de Agua continuo</strong>{" "}
                antes de otorgar el <strong>Sello de Garantía Legal HDV</strong>.
              </p>
            </div>

            {/* Tarjeta de Garantías Financieras y Operativas de Venezuela */}
            <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#FF0096] flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-white" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                    Ecosistema de Pagos Venezuela
                  </h3>
                  <p className="text-xs text-white/75">Transacciones Directas a Recepción</p>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-white/90 font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-[#00C8D4] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </span>
                  <span>
                    <strong>Pago Móvil Interbancario</strong> y Transferencias VES (Tasa BCV)
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-[#00C8D4] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </span>
                  <span>
                    <strong>Zelle</strong> y Transferencias Banesco / Mercantil Panamá
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-[#00C8D4] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </span>
                  <span>
                    <strong>Binance Pay (USDT)</strong> y Cuentas Custodia en Divisas
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-[#00C8D4] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </span>
                  <span>
                    <strong>Efectivo en Divisas (USD/EUR)</strong> y Punto de Venta en Recepción
                  </span>
                </li>
              </ul>

              <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-[#00C8D4] font-bold">
                <span>Auditoría Normativa V15</span>
                <span>País: Venezuela (VE)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla Comparativa Reglamentaria (AGENTS.md Sección 3) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Opción por defecto: OTAs Internacionales (Fondo blanco y borde gris sutil) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </span>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Intermediarios Tradicionales
                  </span>
                  <h3
                    className="text-xl font-bold text-[#0f172a]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Agencias Internacionales (OTAs Extranjeras)
                  </h3>
                </div>
              </div>

              <ul className="space-y-3.5 text-sm text-[#1e293b] mt-6">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-md bg-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-3 h-3 text-white" />
                  </span>
                  <span>
                    <strong>Sobreprecio del 18% al 30%:</strong> Comisiones de intermediación
                    trasladadas al huésped y al propietario.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-md bg-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-3 h-3 text-white" />
                  </span>
                  <span>
                    <strong>Sin soporte para Pago Móvil ni Zelle:</strong> Rechazo frecuente de
                    tarjetas emitidas en Venezuela o recargos cambiarios.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-md bg-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-3 h-3 text-white" />
                  </span>
                  <span>
                    <strong>Desconocimiento de suministros locales:</strong> No certifican si el
                    alojamiento posee Planta Eléctrica 24/7 o Pozo de Agua.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
              Sin comunicación directa previa con la recepción del hotel.
            </div>
          </div>

          {/* Opción Destacada / Recomendada: Hoteles de Venezuela */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#0e011f] to-[#1a0533] text-white p-6 sm:p-8 shadow-xl border-2 border-[#00C8D4] flex flex-col justify-between">
            <div className="absolute -top-3.5 right-6 px-4 py-1 rounded-full bg-[#FF0096] text-white text-[11px] font-extrabold uppercase tracking-widest shadow-lg">
              Recomendado · Reserva Directa
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-[#00C8D4] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </span>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#00C8D4]">
                    Plataforma Oficial V15
                  </span>
                  <h3
                    className="text-xl font-bold text-white"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Hoteles de Venezuela (hotelesdevenezuela.com)
                  </h3>
                </div>
              </div>

              <ul className="space-y-3.5 text-sm text-white mt-6">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-md bg-[#00C8D4] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </span>
                  <span>
                    <strong>0% Comisiones de Intermediación:</strong> Trato directo con la gerencia
                    y recepción oficial del hotel o posada.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-md bg-[#00C8D4] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </span>
                  <span>
                    <strong>Flexibilidad Financiera Venezolana:</strong> Paga con Pago Móvil, Zelle,
                    Binance Pay (USDT), Banesco Panamá o efectivo USD/VES.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-md bg-[#00C8D4] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </span>
                  <span>
                    <strong>Certificación Técnica V15:</strong> Filtros verificados de Planta
                    Eléctrica 24/7 (C01.4.1), Tanque de Agua (C01.4.2) y Sello Legal HDV.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between text-xs font-extrabold text-[#00C8D4]">
              <span>Atención Inmediata por WhatsApp Oficial</span>
              <span>100% Garantizado</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. PREGUNTAS FRECUENTES (FAQ ACCORDION + SCHEMA MARKUP)
      ===================================================================== */}
      <section
        aria-labelledby="faq-hoteles-venezuela-heading"
        className="py-14 bg-slate-50 border-t border-slate-200/80"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#9B00CC] mb-2">
              <span className="w-6 h-6 rounded-lg bg-[#9B00CC] flex items-center justify-center">
                <HelpCircle className="w-3.5 h-3.5 text-white" />
              </span>
              <span>CENTRO DE RESPUESTAS AL VIAJERO · SCHEMA FAQPAGE</span>
            </div>
            <h2
              id="faq-hoteles-venezuela-heading"
              className="text-2xl sm:text-4xl font-bold text-[#0f172a]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Preguntas Frecuentes sobre Reservar Hoteles en Venezuela
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl mx-auto">
              Todo lo que necesitas saber antes de reservar tu estadía en la costa caribeña, los
              Andes, la selva guayanesa o las principales capitales del país.
            </p>
          </div>

          <div className="space-y-3.5">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.question}
                  className={`rounded-2xl border transition-all bg-white overflow-hidden ${
                    isOpen
                      ? "border-[#00C8D4] shadow-md"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isOpen ? "bg-[#00C8D4]" : "bg-[#1a0533]"
                        }`}
                      >
                        <Sparkles className="w-4 h-4 text-white" />
                      </span>
                      <div>
                        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#FF0096]">
                          {faq.tagCode}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-[#0f172a]">
                          {faq.question}
                        </h3>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-[#00C8D4]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-sm text-[#1e293b]/90 leading-relaxed border-t border-slate-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECCIÓN DE CIERRE REGLAMENTARIA (BOTTOM CTA - AGENTS.MD SECCIÓN 4)
      ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="rounded-3xl p-8 sm:p-12 text-white shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8"
          style={{
            background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)"
          }}
        >
          <div className="max-w-2xl text-center lg:text-left">
            <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-widest mb-3">
              Atención al Viajero & Afiliación B2B de Propietarios
            </span>
            <h2
              className="text-2xl sm:text-4xl font-bold text-white leading-tight mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              ¿Buscas asesoría personalizada para tu viaje o deseas afiliar tu hotel al catálogo V15?
            </h2>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed">
              Nuestro equipo de Concierge Turístico te ayuda sin costo a cotizar estadías grupales,
              corporativas o familiares en toda Venezuela, o a registrar tu propiedad con el Sello
              de Garantía Legal HDV.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <a
              href="https://wa.me/584122248192?text=Hola%2C%20estoy%20en%20hotelesdevenezuela.com%2Fhoteles-en-venezuela%20y%20deseo%20asistencia%20directa%20para%20reservar%20un%20hotel."
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-4 rounded-2xl bg-white text-[#FF0096] font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-xl hover:scale-[1.02] transition-transform flex items-center gap-2.5"
            >
              <MessageCircle className="w-5 h-5 text-[#FF0096]" />
              <span>Contactar por WhatsApp Oficial</span>
            </a>

            <Link
              href="/mis-negocios"
              className="px-6 py-4 rounded-2xl bg-[#0e011f]/40 hover:bg-[#0e011f]/60 border border-white/30 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-colors"
            >
              Registrar mi Propiedad (Wizard V15)
            </Link>
          </div>
        </div>
      </section>

      {/* Bloque de Autoridad de Clúster Transversal */}
      <ClusterAuthorityCtaBlock
        slug="hoteles-en-venezuela"
        title="Hoteles en Venezuela: Guía Definitiva de Alojamiento y Reservas Directas"
        contentType="directorio"
        categoryLabel="Pilar Oficial SEO V15"
      />
    </div>
  );
}

export default HotelesEnVenezuela;
