import { useState, useMemo } from "react";
import {
  Sparkles, MapPin, ShieldCheck, Zap, Droplets, Wifi, Car, Coffee,
  Clock, Users, Bed, CheckCircle2, Info, Calendar, MessageSquare,
  ChevronDown, ChevronUp, Utensils, Plane, Compass, Building2,
  Wallet, CreditCard, DollarSign, RefreshCw, AlertCircle, Star,
  FileCheck, Award, Phone, Navigation
} from "lucide-react";
import { TrackedWhatsAppButton } from "@/components/layout/TrackedWhatsAppButton";
import { isOfficialPriceEnabled } from "@/components/layout/EstablishmentCard";
import { getRealEstablishmentBadgesAndTags, getAmenityLabel } from "@/lib/amenitiesList";
import {
  hasValidatedPreRegistration,
  getValidatedPreRegistrationForEstablishment
} from "@/lib/salesDepartmentStore";
import {
  formatDualCurrencyVenezuela,
  sanitizeVenezuelaLegalNotices,
  DEFAULT_VENEZUELA_LEGAL_NOTICES,
  type PropertyWizardV15State
} from "@/lib/v15MasterCatalog";

interface EstablishmentV15DetailSectionsProps {
  establishment: {
    id: number;
    slug: string;
    name: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    destination_name?: string;
    category_name?: string;
    rating_avg?: number;
    review_count?: number;
    whatsapp?: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
    services?: string;
    has_power_plant?: boolean;
    has_water_247?: boolean;
    has_starlink?: boolean;
    is_pet_friendly?: boolean;
    has_hdv_seal?: boolean;
    key_service_pills?: string[];
    badges?: any;
    features?: any;
  };
  rooms: any[];
  surroundings: { category: string; name: string; distance: string }[];
}

export function EstablishmentV15DetailSections({
  establishment,
  rooms,
  surroundings
}: EstablishmentV15DetailSectionsProps) {
  const [activeNavTab, setActiveNavTab] = useState<string>("vista-general");
  const [currencyMode, setCurrencyMode] = useState<"dual" | "usd" | "ves">("dual");
  const [bcvRate, setBcvRate] = useState<number>(66.50);
  const [nightsCount, setNightsCount] = useState<number>(2);
  const [adultsCount, setAdultsCount] = useState<number>(2);
  const [unitFilter, setUnitFilter] = useState<"all" | "habitaciones" | "suites">("all");
  const [selectedQuantities, setSelectedQuantities] = useState<Record<number, number>>({});
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Load saved V15 Wizard configuration ONLY for this specific property ID (never fallback to a global default)
  const savedWizardConfig: Partial<PropertyWizardV15State> | null = useMemo(() => {
    try {
      const raw = localStorage.getItem(`hdv_wizard_v15_${establishment.id}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // ignore
    }
    return null;
  }, [establishment.id]);

  const checkInFrom = savedWizardConfig?.checkInFrom || "15:00";
  const checkInUntil = savedWizardConfig?.checkInUntil || "00:00";
  const checkOutFrom = savedWizardConfig?.checkOutFrom || "11:00";
  const checkOutUntil = savedWizardConfig?.checkOutUntil || "12:30";
  const minimumCheckInAge = savedWizardConfig?.minimumCheckInAge || 18;

  // Sanitized legal notices (Strictly purges CADIVI and COVID-19)
  const sanitizedCustomLegal = sanitizeVenezuelaLegalNotices(savedWizardConfig?.customLegalNotices || "");

  const officialPricesActive = isOfficialPriceEnabled(establishment);
  const isPreRegVerified = useMemo(() => hasValidatedPreRegistration(establishment), [establishment]);
  const validatedReceipt = useMemo(
    () => getValidatedPreRegistrationForEstablishment(establishment),
    [establishment]
  );
  const realTags = useMemo(() => getRealEstablishmentBadgesAndTags(establishment), [establishment]);

  // REGLA GATEKEEPER ESTRICTA:
  // La tabla de habitaciones se alimenta ÚNICA Y EXCLUSIVAMENTE de habitaciones reales
  // de establecimientos que hayan pasado por el Pre-Registro oficial (HDV-PR-2026-...).
  // CERO plantillas genéricas ("Habitación Doble Deluxe 32 m²", "Suite Junior 48 m²", "Suite Presidencial 65 m²").
  const displayRooms = useMemo(() => {
    if (!isPreRegVerified) return [];

    const receiptRooms = Array.isArray(validatedReceipt?.realRooms)
      ? validatedReceipt.realRooms
      : [];

    const sourceRooms =
      Array.isArray(rooms) && rooms.length > 0
        ? rooms
        : receiptRooms;

    if (sourceRooms.length === 0) return [];

    const rawBaseRooms = sourceRooms
      .filter((r: any) => r && r.name && String(r.name).trim().length > 0)
      .map((r: any, idx: number) => ({
        ...r,
        id: r.id || 1000 + idx,
        price_per_night: officialPricesActive ? Number(r.price_per_night) || 0 : 0
      }));

    // Deduplicar unidades por nombre normalizado y limitar a un máximo limpio de 8 filas
    const uniqueMap = new Map<string, any>();
    for (const item of rawBaseRooms) {
      const key = String(item.name || item.id || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
      if (!key) continue;
      uniqueMap.set(key, { ...(uniqueMap.get(key) || {}), ...item });
    }
    const baseRooms = Array.from(uniqueMap.values()).slice(0, 8);

    if (unitFilter === "habitaciones") {
      return baseRooms.filter(r => !String(r.name || "").toLowerCase().includes("suite"));
    }
    if (unitFilter === "suites") {
      return baseRooms.filter(r => String(r.name || "").toLowerCase().includes("suite"));
    }
    return baseRooms;
  }, [rooms, unitFilter, officialPricesActive, isPreRegVerified, validatedReceipt]);

  const scrollToSection = (tabId: string, elementId: string) => {
    setActiveNavTab(tabId);
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Surroundings grouped by V15 C00.6 categories
  const nearPlaces = surroundings.filter(s => s.category === "cerca" || s.category === "atracciones").slice(0, 6);
  const beachesAndNature = surroundings.filter(s => s.category === "playas").slice(0, 4);
  const transportAndAirports = surroundings.filter(s => s.category === "aeropuertos" || s.category === "transporte").slice(0, 4);
  const gastronomyNear = surroundings.filter(s => s.category === "gastronomia").slice(0, 4);

  const ratingScore = Number(establishment.rating_avg || 8.9) <= 5
    ? Number((Number(establishment.rating_avg || 4.6) * 1.95).toFixed(1))
    : Number(establishment.rating_avg || 8.9);

  const totalSelectedRooms = Object.values(selectedQuantities).reduce((acc, q) => acc + q, 0);
  const totalSelectedUsd = displayRooms.reduce((acc, r) => {
    const qty = selectedQuantities[r.id] || 0;
    const price = officialPricesActive && Number(r.price_per_night) > 0 ? Number(r.price_per_night) : 0;
    return acc + qty * price * nightsCount;
  }, 0);

  const faqsList = [
    {
      q: `¿Qué servicios y comodidades principales ofrece ${establishment.name}?`,
      a:
        realTags.allDisplayTags.length > 0
          ? `${establishment.name} cuenta con los siguientes servicios y atributos registrados en su ficha oficial: ${realTags.allDisplayTags.join(", ")}. Puedes consultar cualquier requerimiento adicional directamente por WhatsApp con el anfitrión.`
          : `Puedes consultar el equipamiento específico por unidad y disponibilidad de servicios directamente por WhatsApp con la recepción de ${establishment.name}.`
    },
    {
      q: `¿Cómo se coordina el pago y la reserva en ${establishment.name}?`,
      a: "Todas las reservas se gestionan mediante trato directo con la recepción oficial del establecimiento por WhatsApp (0% comisiones por intermediación), donde podrás acordar directamente las modalidades de pago habilitadas."
    },
    {
      q: `¿Cuál es el horario de entrada (Check-in) y salida (Check-out)?`,
      a: `El horario referencial de registro de entrada (Check-in) es de ${checkInFrom} a ${checkInUntil}, y el horario de salida (Check-out) es de ${checkOutFrom} a ${checkOutUntil}. Si requieres Early Check-in o Late Check-out, puedes solicitarlo directamente por WhatsApp.`
    },
    {
      q: `¿Qué documentos legales se requieren al momento del Check-in en Venezuela?`,
      a: "Todos los huéspedes mayores de edad deben presentar su Cédula de Identidad laminada o Pasaporte vigente. En caso de viajar con menores de edad sin la presencia de ambos padres, se exige la partida de nacimiento o autorización de viaje conforme a la normativa LOPNNA vigente."
    }
  ];

  const navTabs = [
    { id: "vista-general", label: "Vista general", target: "v15-vista-general" },
    ...(isPreRegVerified && displayRooms.length > 0
      ? [{ id: "info-precios", label: "Habitaciones y tarifas", target: "v15-info-precios" }]
      : []),
    ...(isPreRegVerified && realTags.allDisplayTags.length > 0
      ? [{ id: "servicios", label: "Servicios", target: "v15-servicios" }]
      : []),
    { id: "normas-casa", label: "Normas de la casa", target: "v15-normas-casa" },
    { id: "info-legal", label: "Información legal", target: "v15-info-legal" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 my-10 space-y-12 text-left">

      {/* ── 1. BARRA DE NAVEGACIÓN STICKY DINÁMICA (SOLO PESTAÑAS CON DATOS REALES) ── */}
      <div className="sticky top-[64px] z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-md p-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {navTabs.map((tab) => {
            const isActive = activeNavTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => scrollToSection(tab.id, tab.target)}
                className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center truncate ${isActive
                    ? "bg-[#00C8D4] text-white shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. VISTA GENERAL: DESCRIPCIÓN + PUNTOS FUERTES DEL ALOJAMIENTO + GARANTÍA VENEZUELA 24/7 ── */}
      <section id="v15-vista-general" className="scroll-mt-32 bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Columna Izquierda: Descripción narrativa y Etiquetas Reales del Establecimiento */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/30">
                Ficha Oficial V15 · Verificada
              </span>
              {realTags.hasPowerPlant && (
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-600" />
                  Planta Eléctrica 24/7 (C01.4.1)
                </span>
              )}
              {realTags.hasWater247 && (
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-50 text-cyan-800 border border-cyan-200 flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-[#00C8D4]" />
                  Tanque de Agua Continuo (C01.4.2)
                </span>
              )}
              {realTags.hasStarlink && (
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-50 text-[#9B00CC] border border-purple-200 flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-[#9B00CC]" />
                  Starlink Satelital
                </span>
              )}
              {realTags.isPetFriendly && (
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-pink-50 text-[#FF0096] border border-pink-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FF0096]" />
                  Pet Friendly
                </span>
              )}
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
                Experiencia y Confort en {establishment.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-3">
                {establishment.description ||
                  `${establishment.name} ofrece alojamiento verificado en ${establishment.destination_name || establishment.city || "Venezuela"}, con atención personalizada y trato directo con el anfitrión sin comisiones de intermediación.`}
              </p>
            </div>

            {/* Bloque Diferenciador de Suministros: Se muestra SOLO si el establecimiento tiene Planta Eléctrica o Agua 24/7 realmente activos */}
            {(realTags.hasPowerPlant || realTags.hasWater247) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {realTags.hasPowerPlant && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0e011f] to-[#1a0533] text-white border border-[#00C8D4]/30 flex items-start gap-3.5 shadow-md">
                    <div className="w-10 h-10 rounded-xl bg-[#00C8D4] flex items-center justify-center text-white shrink-0">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#00C8D4] block">
                        Etiqueta Verificada C01.4.1
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white mt-0.5">
                        Planta Eléctrica de Respaldo 24/7
                      </h4>
                      <p className="text-[11px] text-white/75 mt-1 leading-relaxed">
                        Respaldo eléctrico reportado por el establecimiento para garantizar operatividad y confort.
                      </p>
                    </div>
                  </div>
                )}

                {realTags.hasWater247 && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0e011f] to-[#1a0533] text-white border border-[#FF0096]/30 flex items-start gap-3.5 shadow-md">
                    <div className="w-10 h-10 rounded-xl bg-[#FF0096] flex items-center justify-center text-white shrink-0">
                      <Droplets className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#FF0096] block">
                        Etiqueta Verificada C01.4.2
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white mt-0.5">
                        Tanque de Agua Continuo 24/7
                      </h4>
                      <p className="text-[11px] text-white/75 mt-1 leading-relaxed">
                        Reserva hídrica propia reportada por el establecimiento para suministro continuo.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Etiquetas y Servicios Reales del Alojamiento (Solo si el establecimiento pasó por Pre-Registro y tiene etiquetas reales) */}
            {isPreRegVerified && realTags.allDisplayTags.length > 0 && (
              <div className="pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3">
                  Etiquetas y servicios registrados del alojamiento
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {realTags.allDisplayTags.map((tagLabel, idx) => {
                    const lower = tagLabel.toLowerCase();
                    const Icon = lower.includes("planta")
                      ? Zap
                      : lower.includes("agua")
                        ? Droplets
                        : lower.includes("wifi") || lower.includes("starlink")
                          ? Wifi
                          : lower.includes("estacionamiento") || lower.includes("parking")
                            ? Car
                            : lower.includes("restaurante") || lower.includes("gastronom") || lower.includes("chef")
                              ? Utensils
                              : Sparkles;
                    const boxColors = ["bg-[#00C8D4]", "bg-[#FF0096]", "bg-[#9B00CC]", "bg-emerald-500"];
                    const color = boxColors[idx % boxColors.length];
                    return (
                      <div
                        key={tagLabel}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800"
                      >
                        <div className={`w-6 h-6 rounded-lg ${color} flex items-center justify-center text-white shrink-0`}>
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span>{tagLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Columna Derecha: Tarjeta de Trato Directo (Sin reseñas o comentarios inventados) */}
          <div className="lg:col-span-4 space-y-4">
            {validatedReceipt && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pre-Registro Oficial Auditado</span>
                </span>
                <p className="text-xs font-black text-slate-900 font-mono">
                  Folio: {validatedReceipt.folio}
                </p>
                <span className="text-[11px] text-slate-600 font-semibold block">
                  {validatedReceipt.modalityLabel}
                </span>
              </div>
            )}

            {/* Tarjeta: Puntos fuertes del alojamiento */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e011f] to-[#1a0533] text-white space-y-4 shadow-lg border border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00C8D4] block">
                  RESERVA DIRECTA SIN INTERMEDIARIOS
                </span>
                <h3 className="text-base font-serif font-bold text-white mt-0.5">
                  Contacto Directo con el Anfitrión
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#00C8D4] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-white/90 leading-snug">
                    Ubicación en <strong>{establishment.destination_name || establishment.city || "Venezuela"}</strong>.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-white/90 leading-snug">
                    <strong>0% Comisiones:</strong> Cotización y reserva directa por WhatsApp con el establecimiento.
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <TrackedWhatsAppButton
                  whatsappNumber={establishment.whatsapp || establishment.phone}
                  establishmentId={establishment.id}
                  establishmentName={establishment.name}
                  customMessage={`Hola! Quisiera consultar disponibilidad y reservar directamente en ${establishment.name}.`}
                >
                  Consultar precio por WhatsApp
                </TrackedWhatsAppButton>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. INFO Y PRECIOS: SOLO SE RENDERIZA SI EL ESTABLECIMIENTO PASÓ POR PRE-REGISTRO Y TIENE HABITACIONES REALES ── */}
      {isPreRegVerified && displayRooms.length > 0 && (
        <section id="v15-info-precios" className="scroll-mt-32 bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FF0096] block">
                DISPONIBILIDAD Y TRATO DIRECTO · SIN INTERMEDIARIOS
              </span>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mt-0.5">
                {officialPricesActive
                  ? "Asegura tus fechas — Tarifas en Dólares ($ USD) y Bolívares (Bs. VES)"
                  : "Asegura tus fechas — Tarifa directa a consultar con el anfitrión"}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {officialPricesActive
                  ? "Visualización bimonetaria nativa adaptada a Venezuela. Sin recargos ocultos."
                  : "Cotización directa por WhatsApp con la recepción oficial del establecimiento (0% comisiones por intermediación)."}
              </p>
            </div>

            {/* Controles de Dualidad Monetaria USD / VES solo si el propietario activó tarifas oficiales */}
            {officialPricesActive ? (
              <div className="flex flex-wrap items-center gap-2.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-xl border border-slate-200">
                  <RefreshCw className="w-3.5 h-3.5 text-[#00C8D4]" />
                  <span className="text-[11px] font-bold text-slate-600">Tasa BCV:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={bcvRate}
                    onChange={(e) => setBcvRate(Math.max(1, Number(e.target.value) || 66.5))}
                    className="w-16 text-xs font-black text-slate-900 bg-transparent focus:outline-none border-b border-dashed border-slate-300 text-center"
                    title="Ajustar tasa referencial BCV (Bs./USD)"
                  />
                  <span className="text-[10px] font-bold text-slate-400">Bs./$</span>
                </div>

                <div className="flex items-center gap-1">
                  {[
                    { id: "dual", label: "Dual ($ USD + Bs. VES)" },
                    { id: "usd", label: "Solo $ USD" },
                    { id: "ves", label: "Solo Bs. VES" }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setCurrencyMode(m.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${currencyMode === m.id
                          ? "bg-[#0e011f] text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-200/70"
                        }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#00C8D4]/10 border border-[#00C8D4]/30 text-[#0f172a]">
                <ShieldCheck className="w-4 h-4 text-[#00C8D4] shrink-0" />
                <span className="text-xs font-black">Tarifa directa a consultar · 0% Comisiones</span>
              </div>
            )}
          </div>

          {/* Barra selectora de Noches, Huéspedes y Filtros de Unidad */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200">
                <Calendar className="w-4 h-4 text-[#00C8D4]" />
                <span className="text-xs font-bold text-slate-600">Estancia:</span>
                <select
                  value={nightsCount}
                  onChange={(e) => setNightsCount(Number(e.target.value))}
                  className="text-xs font-black text-slate-900 bg-transparent focus:outline-none cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 7, 10, 14].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "noche" : "noches"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200">
                <Users className="w-4 h-4 text-[#FF0096]" />
                <span className="text-xs font-bold text-slate-600">Huéspedes:</span>
                <select
                  value={adultsCount}
                  onChange={(e) => setAdultsCount(Number(e.target.value))}
                  className="text-xs font-black text-slate-900 bg-transparent focus:outline-none cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6].map((a) => (
                    <option key={a} value={a}>
                      {a} {a === 1 ? "adulto" : "adultos"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">Filtrar por:</span>
              {[
                { id: "all", label: "Todas las unidades" },
                { id: "habitaciones", label: "Habitaciones" },
                { id: "suites", label: "Suites" }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setUnitFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${unitFilter === f.id
                      ? "bg-[#00C8D4] text-white border-[#00C8D4]"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla Estructurada estilo PDF Pág. 2-3 */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse min-w-[780px]">
              <thead>
                <tr className="bg-[#0e011f] text-white text-xs font-black uppercase tracking-wider">
                  <th className="p-4 border-r border-white/15 w-[34%]">Tipo de habitación / unidad</th>
                  <th className="p-4 border-r border-white/15 w-[12%] text-center">Capacidad</th>
                  <th className="p-4 border-r border-white/15 w-[22%]">
                    {officialPricesActive
                      ? `Precio por ${nightsCount} ${nightsCount === 1 ? "noche" : "noches"}`
                      : "Modalidad de tarifa"}
                  </th>
                  <th className="p-4 border-r border-white/15 w-[18%]">Tus opciones y métodos de pago</th>
                  <th className="p-4 w-[14%] text-center">Acción directa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {displayRooms.map((room) => {
                  const hasVerifiedRoomPrice = officialPricesActive && Number(room.price_per_night) > 0;
                  const nightlyUsd = hasVerifiedRoomPrice ? Number(room.price_per_night) : 0;
                  const totalStayUsd = nightlyUsd * nightsCount;
                  const dualPrice = formatDualCurrencyVenezuela(totalStayUsd, bcvRate);
                  const nightlyDual = formatDualCurrencyVenezuela(nightlyUsd, bcvRate);
                  const cap = Number(room.capacity || 2);
                  const selectedQty = selectedQuantities[room.id] || 0;

                  const roomAmenityItems = room.amenities
                    ? String(room.amenities)
                      .split(",")
                      .map((a: string) => a.trim())
                      .filter(Boolean)
                    : [];

                  return (
                    <tr key={room.id} className="hover:bg-slate-50/80 transition-colors align-top">
                      {/* Columna 1: Tipo de habitación y equipamiento 100% real */}
                      <td className="p-4 border-r border-slate-200 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-serif font-bold text-[#00C8D4]">
                            {room.name}
                          </h4>
                          {Number(room.size_m2) > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold shrink-0">
                              {room.size_m2} m²
                            </span>
                          )}
                        </div>

                        {room.beds_summary && (
                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                            <Bed className="w-4 h-4 text-[#FF0096] shrink-0" />
                            <span>{room.beds_summary}</span>
                          </div>
                        )}

                        {room.description && (
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            {room.description}
                          </p>
                        )}

                        {roomAmenityItems.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {roomAmenityItems.map((item: string, i: number) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold"
                              >
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                {getAmenityLabel(item)}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Columna 2: Número de personas */}
                      <td className="p-4 border-r border-slate-200 text-center">
                        <div className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-black">
                          <Users className="w-4 h-4 text-[#0e011f]" />
                          <span>× {cap}</span>
                        </div>
                        <span className="block text-[10px] text-slate-500 font-semibold mt-1">
                          Máx. {cap} adultos
                        </span>
                      </td>

                      {/* Columna 3: Tarifa directa a consultar o Precio Oficial verificado */}
                      <td className="p-4 border-r border-slate-200 space-y-1.5">
                        {hasVerifiedRoomPrice ? (
                          <>
                            {(currencyMode === "dual" || currencyMode === "usd") && (
                              <div className="text-lg font-black text-slate-900">
                                {dualPrice.usdFormatted}
                              </div>
                            )}
                            {(currencyMode === "dual" || currencyMode === "ves") && (
                              <div className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg inline-block">
                                {dualPrice.vesFormatted}
                              </div>
                            )}
                            <div className="text-[10px] text-slate-500 font-medium">
                              Equivale a {nightlyDual.usdFormatted} ({nightlyDual.vesFormatted}) / noche
                            </div>
                            <div className="text-[10px] text-emerald-600 font-bold">
                              Incluye impuestos y cargos · 0% comisión
                            </div>
                          </>
                        ) : (
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00C8D4]/10 border border-[#00C8D4]/30 text-[#0f172a] text-xs font-black">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00C8D4]" />
                              Tarifa directa a consultar
                            </span>
                            <p className="text-[10px] text-slate-500 font-semibold leading-snug">
                              Cotización oficial por temporada directamente con recepción.
                            </p>
                            <div className="text-[10px] text-emerald-600 font-bold">
                              Trato directo · 0% comisión por plataforma
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Columna 4: Condiciones de Reserva Directa (Sin métodos de pago ficticios por defecto) */}
                      <td className="p-4 border-r border-slate-200 space-y-2">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00C8D4] shrink-0" />
                          <span>Confirmación directa con recepción</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>0% Comisiones de intermediación</span>
                        </div>
                      </td>

                      {/* Columna 5: Seleccionar unidades */}
                      <td className="p-4 text-center space-y-2">
                        <select
                          value={selectedQty}
                          onChange={(e) =>
                            setSelectedQuantities((prev) => ({
                              ...prev,
                              [room.id]: Number(e.target.value)
                            }))
                          }
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-black text-slate-900 focus:outline-none focus:border-[#00C8D4] cursor-pointer"
                        >
                          {[0, 1, 2, 3, 4, 5].map((q) => (
                            <option key={q} value={q}>
                              {q} {q === 1 ? "unidad" : "unidades"}
                            </option>
                          ))}
                        </select>

                        <TrackedWhatsAppButton
                          whatsappNumber={establishment.whatsapp || establishment.phone}
                          establishmentId={establishment.id}
                          establishmentName={establishment.name}
                          customMessage={
                            hasVerifiedRoomPrice
                              ? `Hola! Quiero consultar y reservar la unidad "${room.name}" por ${nightsCount} noche(s) (${dualPrice.combinedLabel}) en ${establishment.name}.`
                              : `Hola! Quiero consultar precio y disponibilidad para la unidad "${room.name}" por ${nightsCount} noche(s) (${adultsCount} adulto(s)) en ${establishment.name}.`
                          }
                        >
                          Consultar precio por WhatsApp
                        </TrackedWhatsAppButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Barra resumen si el usuario seleccionó cantidades en la tabla */}
          {totalSelectedRooms > 0 && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0e011f] to-[#1a0533] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-[#00C8D4]/40">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00C8D4] block">
                  RESUMEN DE TU SELECCIÓN DIRECTA
                </span>
                <h4 className="text-base font-bold text-white">
                  {totalSelectedRooms} {totalSelectedRooms === 1 ? "habitación seleccionada" : "habitaciones seleccionadas"} por {nightsCount} {nightsCount === 1 ? "noche" : "noches"}
                </h4>
                <p className="text-xs text-white/80 mt-0.5">
                  {officialPricesActive && totalSelectedUsd > 0 ? (
                    <>
                      Total estimado: <strong>{formatDualCurrencyVenezuela(totalSelectedUsd, bcvRate).combinedLabel}</strong> (Tasa BCV: {bcvRate} Bs./$)
                    </>
                  ) : (
                    <>Modalidad activa: <strong>Tarifa directa a consultar</strong> directamente con el propietario</>
                  )}
                </p>
              </div>
              <TrackedWhatsAppButton
                whatsappNumber={establishment.whatsapp || establishment.phone}
                establishmentId={establishment.id}
                establishmentName={establishment.name}
                customMessage={
                  officialPricesActive && totalSelectedUsd > 0
                    ? `Hola! Deseo confirmar la reserva de ${totalSelectedRooms} habitación(es) por ${nightsCount} noche(s) en ${establishment.name}. Total estimado: ${formatDualCurrencyVenezuela(totalSelectedUsd, bcvRate).combinedLabel}.`
                    : `Hola! Deseo consultar precio por WhatsApp para ${totalSelectedRooms} habitación(es) por ${nightsCount} noche(s) en ${establishment.name}.`
                }
              >
                Consultar precio por WhatsApp
              </TrackedWhatsAppButton>
            </div>
          )}
        </section>
      )}

      {/* ── 5. RESOLVEMOS TUS DUDAS EN UN CLIC (PREGUNTAS FRECUENTES) ── */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#9B00CC] block">
            PREGUNTAS FRECUENTES SOBRE {establishment.name.toUpperCase()}
          </span>
          <h2 className="text-2xl font-serif font-bold text-slate-900 mt-0.5">
            Resolvemos tus dudas en un clic
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqsList.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/90 bg-slate-50/60 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/80 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#FF0096] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 6. GUÍA DE LA ZONA: SOLO SE RENDERIZA SI HAY PUNTOS DE INTERÉS REALES GUARDADOS ── */}
      {surroundings.length > 0 && (
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00C8D4] block">
                ENTORNO Y PUNTOS DE INTERÉS CERCANOS
              </span>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mt-0.5">
                Guía de la zona — Alrededores de {establishment.name}
              </h2>
            </div>

            {establishment.latitude && establishment.longitude && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${establishment.latitude},${establishment.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00C8D4] hover:bg-[#00b2bd] text-white text-xs font-extrabold shadow-sm transition-all shrink-0"
              >
                <Navigation className="w-4 h-4 text-white" />
                <span>Ver en el mapa</span>
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nearPlaces.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00C8D4] flex items-center justify-center text-white">
                    <Compass className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    ¿Qué hay cerca?
                  </h4>
                </div>
                <ul className="space-y-2 text-xs">
                  {[...nearPlaces, ...gastronomyNear].slice(0, 6).map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-2 py-1 border-b border-slate-100">
                      <span className="text-slate-700 font-medium">{item.name}</span>
                      <span className="text-slate-500 font-bold shrink-0">{item.distance}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {beachesAndNature.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#9B00CC] flex items-center justify-center text-white">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Playas y Atractivos
                  </h4>
                </div>
                <ul className="space-y-2 text-xs">
                  {beachesAndNature.map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-2 py-1 border-b border-slate-100">
                      <span className="text-slate-700 font-medium">{item.name}</span>
                      <span className="text-slate-500 font-bold shrink-0">{item.distance}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {transportAndAirports.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FF0096] flex items-center justify-center text-white">
                    <Plane className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Aeropuertos y Transporte
                  </h4>
                </div>
                <ul className="space-y-2 text-xs">
                  {transportAndAirports.map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-2 py-1 border-b border-slate-100">
                      <span className="text-slate-700 font-medium">{item.name}</span>
                      <span className="text-slate-500 font-bold shrink-0">{item.distance}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 7. SERVICIOS Y AMENIDADES REALES: SOLO SE RENDERIZA SI EL ESTABLECIMIENTO PASÓ POR PRE-REGISTRO Y TIENE ETIQUETAS REALES ── */}
      {isPreRegVerified && realTags.allDisplayTags.length > 0 && (
        <section id="v15-servicios" className="scroll-mt-32 bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00C8D4] block">
                ATRIBUTOS Y SERVICIOS REALES REGISTRADOS
              </span>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mt-0.5">
                Servicios y Amenidades de {establishment.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Listado fiel a las etiquetas y comodidades activadas en la ficha oficial del establecimiento.
              </p>
            </div>
            {realTags.allDisplayTags.length > 0 && (
              <span className="px-3.5 py-1.5 rounded-full bg-[#0e011f] text-[#00C8D4] border border-[#00C8D4]/30 text-[10px] font-black uppercase tracking-wider shrink-0 self-start sm:self-center">
                {realTags.allDisplayTags.length} {realTags.allDisplayTags.length === 1 ? "Atributo Activo" : "Atributos Activos"}
              </span>
            )}
          </div>

          {realTags.allDisplayTags.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {realTags.allDisplayTags.map((tagLabel, idx) => {
                const lower = tagLabel.toLowerCase();
                const Icon = lower.includes("planta")
                  ? Zap
                  : lower.includes("agua")
                    ? Droplets
                    : lower.includes("wifi") || lower.includes("starlink")
                      ? Wifi
                      : lower.includes("estacionamiento") || lower.includes("parking")
                        ? Car
                        : lower.includes("restaurante") || lower.includes("gastronom") || lower.includes("chef")
                          ? Utensils
                          : Sparkles;
                const boxColors = ["bg-[#00C8D4]", "bg-[#FF0096]", "bg-[#9B00CC]", "bg-emerald-500"];
                const color = boxColors[idx % boxColors.length];

                return (
                  <div
                    key={tagLabel}
                    className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-center gap-3 hover:border-[#00C8D4]/50 transition-all"
                  >
                    <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center text-white shrink-0 shadow-xs`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-slate-900 block truncate">
                        {tagLabel}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Verificado en ficha</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#00C8D4] flex items-center justify-center text-white shrink-0">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Consulta directa de servicios y equipamiento con el anfitrión
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Comunícate por WhatsApp con la recepción de {establishment.name} para conocer en detalle los servicios incluidos según tu reserva.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── 8. NORMAS DE LA CASA (C04) ── */}
      <section id="v15-normas-casa" className="scroll-mt-32 bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF0096] block">
              POLÍTICAS DE OPERACIÓN Y MÉTODOS DE PAGO (C04)
            </span>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mt-0.5">
              Normas de la casa
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {establishment.name} acepta peticiones especiales — añádelas al reservar por WhatsApp.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden text-xs">
          {/* Entrada Check-In */}
          <div className="grid grid-cols-1 md:grid-cols-12 p-4 sm:p-5 gap-3 bg-white">
            <div className="md:col-span-4 flex items-center gap-2.5 font-black text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-[#00C8D4] flex items-center justify-center text-white shrink-0">
                <Clock className="w-3.5 h-3.5 text-white" />
              </div>
              <span>Entrada (Check-in)</span>
            </div>
            <div className="md:col-span-8 space-y-1 text-slate-700">
              <p className="font-bold text-slate-900">De las {checkInFrom} a las {checkInUntil}</p>
              <p className="text-slate-500">
                Los clientes deberán mostrar un documento de identidad válido (Cédula de Identidad laminada o Pasaporte vigente C04.1.9) al realizar el registro de entrada.
              </p>
            </div>
          </div>

          {/* Salida Check-Out */}
          <div className="grid grid-cols-1 md:grid-cols-12 p-4 sm:p-5 gap-3 bg-slate-50/50">
            <div className="md:col-span-4 flex items-center gap-2.5 font-black text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-[#9B00CC] flex items-center justify-center text-white shrink-0">
                <Clock className="w-3.5 h-3.5 text-white" />
              </div>
              <span>Salida (Check-out)</span>
            </div>
            <div className="md:col-span-8 space-y-1 text-slate-700">
              <p className="font-bold text-slate-900">De las {checkOutFrom} a las {checkOutUntil}</p>
              <p className="text-slate-500">
                Posibilidad de Late Check-out sujeta a disponibilidad operativa previa coordinación con recepción.
              </p>
            </div>
          </div>

          {/* Cancelación / prepago */}
          <div className="grid grid-cols-1 md:grid-cols-12 p-4 sm:p-5 gap-3 bg-white">
            <div className="md:col-span-4 flex items-center gap-2.5 font-black text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-[#FF0096] flex items-center justify-center text-white shrink-0">
                <Info className="w-3.5 h-3.5 text-white" />
              </div>
              <span>Cancelación / prepago (C04.4)</span>
            </div>
            <div className="md:col-span-8 text-slate-700">
              Las condiciones de cancelación y de pago por adelantado pueden variar según el tipo de habitación y la temporada. Consulta las condiciones específicas al confirmar tus fechas sin comisiones de intermediación.
            </div>
          </div>

          {/* Condiciones para estancias con niños y cunas (C04.1.6 - C04.1.10) */}
          <div className="grid grid-cols-1 md:grid-cols-12 p-4 sm:p-5 gap-3 bg-slate-50/50">
            <div className="md:col-span-4 flex items-center gap-2.5 font-black text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0">
                <Users className="w-3.5 h-3.5 text-white" />
              </div>
              <span>Niños, camas supletorias y LOPNNA</span>
            </div>
            <div className="md:col-span-8 space-y-2 text-slate-700">
              <p className="font-bold text-slate-900">Se pueden alojar niños de cualquier edad (C04.1.6).</p>
              <p>
                Cunas y camas supletorias sujetas a disponibilidad según la unidad seleccionada.
              </p>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium">
                <strong>Requisito Legal Venezolano (C04.1.10 — LOPNNA):</strong> Para el ingreso de niños, niñas o adolescentes que viajen sin alguno de sus padres o representantes legales, es obligatorio presentar partida de nacimiento o permiso de viaje vigente emitido por la autoridad competente (SAREN / Consejo de Protección).
              </div>
            </div>
          </div>

          {/* Restricción por edad */}
          <div className="grid grid-cols-1 md:grid-cols-12 p-4 sm:p-5 gap-3 bg-white">
            <div className="md:col-span-4 flex items-center gap-2.5 font-black text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-[#00C8D4] flex items-center justify-center text-white shrink-0">
                <FileCheck className="w-3.5 h-3.5 text-white" />
              </div>
              <span>Restricción por edad (C04.1.5)</span>
            </div>
            <div className="md:col-span-8 text-slate-700">
              La edad mínima para realizar el check-in titular es de <strong>{minimumCheckInAge} años</strong>.
            </div>
          </div>

          {/* Mascotas */}
          <div className="grid grid-cols-1 md:grid-cols-12 p-4 sm:p-5 gap-3 bg-slate-50/50">
            <div className="md:col-span-4 flex items-center gap-2.5 font-black text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-[#9B00CC] flex items-center justify-center text-white shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
              </div>
              <span>Mascotas (C04.3)</span>
            </div>
            <div className="md:col-span-8 text-slate-700">
              Consulta directamente con recepción la admisión de mascotas o animales de asistencia según la tipología de unidad.
            </div>
          </div>

          {/* Coordinación de Pago Directo (Sin métodos de pago ficticios por defecto) */}
          <div className="grid grid-cols-1 md:grid-cols-12 p-4 sm:p-5 gap-3 bg-white">
            <div className="md:col-span-4 flex items-center gap-2.5 font-black text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-[#FF0096] flex items-center justify-center text-white shrink-0">
                <CreditCard className="w-3.5 h-3.5 text-white" />
              </div>
              <span>Modalidades de pago y reserva</span>
            </div>
            <div className="md:col-span-8 text-slate-700">
              Coordinación de pago y facturación directamente con la recepción oficial de <strong>{establishment.name}</strong> al confirmar tus fechas por WhatsApp (0% comisiones por intermediación).
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. DATOS CLAVE ANTES DE VIAJAR (A TENER EN CUENTA — INFORMACIÓN LEGAL DEPURADA SIN CADIVI NI COVID) ── */}
      <section id="v15-info-legal" className="scroll-mt-32 bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block">
              INFORMACIÓN LEGAL E IMPORTANTE · NORMATIVA VENEZOLANA VIGENTE
            </span>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mt-0.5">
              Datos clave antes de viajar (A tener en cuenta)
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Condiciones legales transparentes y actualizadas para huéspedes nacionales y extranjeros en Venezuela.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider shrink-0">
            Marco Legal Depurado V15
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEFAULT_VENEZUELA_LEGAL_NOTICES.map((notice, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-[#00C8D4] flex items-center justify-center text-white shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {notice}
              </p>
            </div>
          ))}
        </div>

        {sanitizedCustomLegal.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#00C8D4]/5 border border-[#00C8D4]/25 text-xs text-slate-800 leading-relaxed space-y-1">
            <strong className="block text-slate-900 mb-1">Nota interna del establecimiento:</strong>
            {sanitizedCustomLegal.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

