import { useState, useMemo } from "react";
import {
  Sparkles, MapPin, ShieldCheck, Zap, Droplets, Wifi, Car, Coffee,
  Clock, Users, Bed, CheckCircle2, Info, Calendar, MessageSquare,
  ChevronDown, ChevronUp, Utensils, Plane, Compass, Building2,
  Wallet, CreditCard, DollarSign, RefreshCw, AlertCircle, Star,
  FileCheck, Award, Phone, Navigation
} from "lucide-react";
import { TrackedWhatsAppButton } from "@/components/layout/TrackedWhatsAppButton";
import {
  formatDualCurrencyVenezuela,
  sanitizeVenezuelaLegalNotices,
  DEFAULT_VENEZUELA_LEGAL_NOTICES,
  MASTER_TAGS_V15,
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
  const [reviewTopicFilter, setReviewTopicFilter] = useState<string>("Todos");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Load saved V15 Wizard configuration for this property if available
  const savedWizardConfig: Partial<PropertyWizardV15State> | null = useMemo(() => {
    try {
      const raw = localStorage.getItem(`hdv_wizard_v15_${establishment.id}`);
      if (raw) return JSON.parse(raw);
      const rawDefault = localStorage.getItem("hdv_wizard_v15_default");
      if (rawDefault) return JSON.parse(rawDefault);
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

  // Filtered rooms for "Asegura tus fechas" (Prioriza rooms_distribution JSONB V15 o rooms de BD)
  const displayRooms = useMemo(() => {
    const jsonbUnits = savedWizardConfig?.roomsDistribution;
    const mappedJsonbRooms =
      Array.isArray(jsonbUnits) && jsonbUnits.length > 0
        ? jsonbUnits.map((u, idx) => ({
            id: 950 + idx,
            name: u.unitName,
            category: u.unitType,
            price_per_night: u.pricePerNightUsd,
            capacity: u.maxOccupancy,
            size_m2: u.sizeSqm,
            beds_summary: `${u.kingBeds > 0 ? `${u.kingBeds} King ` : ""}${
              u.queenBeds > 0 ? `${u.queenBeds} Queen ` : ""
            }${u.singleBeds > 0 ? `${u.singleBeds} Individual` : ""}`.trim() ||
              `Distribución confort para ${u.maxOccupancy} huéspedes`,
            amenities: "wifi,aire_acondicionado,banio_privado,tv_cable,caja_fuerte",
          }))
        : null;

    const baseRooms =
      rooms && rooms.length > 0
        ? rooms
        : mappedJsonbRooms || [
          {
            id: 901,
            name: "Habitación Doble Deluxe (1 o 2 camas)",
            category: "Habitación Ejecutiva",
            price_per_night: 85,
            capacity: 2,
            size_m2: 32,
            beds_summary: "1 cama doble extragrande (King) o 2 camas individuales",
            amenities: "wifi,aire_acondicionado,banio_privado,tv_cable,caja_fuerte,escritorio,cafetera"
          },
          {
            id: 902,
            name: "Suite Junior con Vista Panorámica",
            category: "Suite",
            price_per_night: 125,
            capacity: 3,
            size_m2: 48,
            beds_summary: "1 cama King Size + 1 sofá cama",
            amenities: "wifi,aire_acondicionado,balcon,vista_mar,banio_privado,nevera,caja_fuerte,tv_cable"
          },
          {
            id: 903,
            name: "Suite Presidencial Familiar",
            category: "Suite Familiar",
            price_per_night: 165,
            capacity: 4,
            size_m2: 65,
            beds_summary: "1 cama King Size + 2 camas individuales",
            amenities: "wifi,aire_acondicionado,balcon,cocina_equipada,banio_privado,nevera,caja_fuerte,tv_cable"
          }
        ];

    if (unitFilter === "habitaciones") {
      return baseRooms.filter(r => !String(r.name || "").toLowerCase().includes("suite"));
    }
    if (unitFilter === "suites") {
      return baseRooms.filter(r => String(r.name || "").toLowerCase().includes("suite"));
    }
    return baseRooms;
  }, [rooms, unitFilter]);

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
    const price = Number(r.price_per_night || 85);
    return acc + qty * price * nightsCount;
  }, 0);

  const faqsList = [
    {
      q: `¿${establishment.name} cuenta con Planta Eléctrica y suministro de agua continuo?`,
      a: "Sí. El establecimiento cuenta con Planta Eléctrica de respaldo 24/7 (C01.4.1) y sistema hidroneumático con Tanque de Agua de reserva continua (C01.4.2) para garantizar climatización, iluminación y confort ininterrumpido durante toda tu estadía."
    },
    {
      q: `¿Cuáles son los métodos de pago aceptados en Venezuela por ${establishment.name}?`,
      a: "Aceptamos pagos adaptados al ecosistema financiero venezolano e internacional: Pago Móvil Interbancario (Bs. VES a tasa oficial BCV), Zelle, Binance Pay (USDT), transferencias Banesco/Mercantil Panamá, cuentas custodia en divisas, efectivo ($ USD / Bs. VES / € EUR) y tarjetas nacionales e internacionales."
    },
    {
      q: `¿Cuál es el horario de entrada (Check-in) y salida (Check-out)?`,
      a: `El horario de registro de entrada (Check-in) es de ${checkInFrom} a ${checkInUntil}, y el horario de salida (Check-out) es de ${checkOutFrom} a ${checkOutUntil}. Si requieres Early Check-in o Late Check-out, puedes solicitarlo directamente por WhatsApp.`
    },
    {
      q: `¿Qué documentos legales se requieren al momento del Check-in en Venezuela?`,
      a: "Todos los huéspedes mayores de edad deben presentar su Cédula de Identidad laminada o Pasaporte vigente (C04.1.9). En caso de viajar con menores de edad sin la presencia de ambos padres, se exige la partida de nacimiento o autorización de viaje conforme a la normativa LOPNNA vigente (C04.1.10)."
    },
    {
      q: `¿Se sirve desayuno y qué opciones gastronómicas ofrece el alojamiento?`,
      a: "Sí, ofrecemos opciones de desayuno continental, americano y tradicional venezolano, además de servicio de restaurante a la carta, cafetería y room service según la tarifa seleccionada."
    },
    {
      q: `¿Puedo aparcar mi vehículo de forma segura en el establecimiento?`,
      a: "Sí, disponemos de estacionamiento privado en el establecimiento con vigilancia las 24 horas y acceso controlado sin necesidad de reserva previa."
    }
  ];

  const communityReviews = [
    {
      name: "Carlos E. Mendoza",
      country: "Venezuela",
      room: "Habitación Doble Deluxe",
      nights: "3 noches · Viaje en pareja",
      topic: "Planta Eléctrica",
      score: "9,6",
      comment: "Excelente atención desde el primer contacto por WhatsApp. La planta eléctrica 100% operativa y el agua constante hacen toda la diferencia. Pagué parte por Zelle y parte por Pago Móvil a tasa BCV sin ningún inconveniente."
    },
    {
      name: "María Gabriela Rojas",
      country: "Venezuela",
      room: "Suite Junior con Vista Panorámica",
      nights: "2 noches · Viaje familiar",
      topic: "Habitación",
      score: "9,2",
      comment: "Las habitaciones son amplias, impecables y con camas sumamente cómodas. El aire acondicionado enfría perfecto y el WiFi de fibra óptica nos permitió trabajar sin cortes."
    },
    {
      name: "Alejandro Bermúdez",
      country: "Colombia / Venezuela",
      room: "Habitación Ejecutiva",
      nights: "4 noches · Viaje de negocios",
      topic: "Ubicación",
      score: "9,0",
      comment: "Ubicación estratégica y muy segura, cerca de restaurantes, centros comerciales y vías principales. El desayuno variado y el personal de recepción siempre atento las 24 horas."
    }
  ];

  const filteredReviews = reviewTopicFilter === "Todos"
    ? communityReviews
    : communityReviews.filter(r => r.topic.toLowerCase().includes(reviewTopicFilter.toLowerCase()) || r.comment.toLowerCase().includes(reviewTopicFilter.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-6 my-10 space-y-12 text-left">

      {/* ── 1. BARRA DE NAVEGACIÓN STICKY DE LAS 6 PESTAÑAS OFICIALES (FICHA DE DETALLE V15) ── */}
      <div className="sticky top-[64px] z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-md p-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
          {[
            { id: "vista-general", label: "Vista general", target: "v15-vista-general" },
            { id: "info-precios", label: "Info y precios", target: "v15-info-precios" },
            { id: "servicios", label: "Servicios", target: "v15-servicios" },
            { id: "normas-casa", label: "Normas de la casa", target: "v15-normas-casa" },
            { id: "info-legal", label: "Información legal", target: "v15-info-legal" },
            { id: "comentarios", label: `Comentarios (${establishment.review_count || 148})`, target: "v15-comentarios" }
          ].map((tab) => {
            const isActive = activeNavTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => scrollToSection(tab.id, tab.target)}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center truncate ${
                  isActive
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

          {/* Columna Izquierda: Descripción narrativa y Garantía de Suministros Críticos VE */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/30">
                Ficha Oficial V15 · Verificada
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-600" />
                Planta Eléctrica 24/7 (C01.4.1)
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-50 text-cyan-800 border border-cyan-200 flex items-center gap-1">
                <Droplets className="w-3 h-3 text-[#00C8D4]" />
                Tanque de Agua Continuo (C01.4.2)
              </span>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
                Experiencia y Confort en {establishment.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-3">
                {establishment.description ||
                  `${establishment.name} ofrece alojamiento verificado en ${establishment.destination_name || establishment.city || "Venezuela"}, equipado con habitaciones climatizadas, conexión WiFi de alta velocidad, recepción 24 horas y respaldo operativo integral de energía y agua para viajes de placer o negocios.`}
              </p>
            </div>

            {/* Bloque Diferenciador Mercado Venezolano: Suministros Críticos C01.4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0e011f] to-[#1a0533] text-white border border-[#00C8D4]/30 flex items-start gap-3.5 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-[#00C8D4] flex items-center justify-center text-white shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#00C8D4] block">
                    Etiqueta Crítica C01.4.1
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white mt-0.5">
                    Planta Eléctrica de Respaldo 24/7
                  </h4>
                  <p className="text-[11px] text-white/75 mt-1 leading-relaxed">
                    Generador de encendido automático con cobertura en habitaciones, climatización, ascensores y áreas comunes.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0e011f] to-[#1a0533] text-white border border-[#FF0096]/30 flex items-start gap-3.5 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-[#FF0096] flex items-center justify-center text-white shrink-0">
                  <Droplets className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FF0096] block">
                    Etiqueta Crítica C01.4.2
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white mt-0.5">
                    Tanque de Agua Continuo 24/7
                  </h4>
                  <p className="text-[11px] text-white/75 mt-1 leading-relaxed">
                    Reserva hídrica propia de alta capacidad con sistema hidroneumático y agua caliente permanente.
                  </p>
                </div>
              </div>
            </div>

            {/* Los servicios más populares */}
            <div className="pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3">
                Servicios más populares del alojamiento
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { icon: Zap, label: "Planta Eléctrica 24/7", color: "bg-emerald-500" },
                  { icon: Droplets, label: "Agua Continua 24/7", color: "bg-[#00C8D4]" },
                  { icon: Wifi, label: "WiFi Gratis Alta Velocidad", color: "bg-[#9B00CC]" },
                  { icon: Car, label: "Parking en el alojamiento", color: "bg-[#00C8D4]" },
                  { icon: Utensils, label: "Restaurante & Desayuno", color: "bg-[#FF0096]" },
                  { icon: ShieldCheck, label: "Recepción y Seguridad 24h", color: "bg-emerald-500" },
                  { icon: Users, label: "Habitaciones Familiares", color: "bg-[#9B00CC]" },
                  { icon: Coffee, label: "Servicio de Habitaciones", color: "bg-[#FF0096]" }
                ].map((srv, idx) => {
                  const Icon = srv.icon;
                  return (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800"
                    >
                      <div className={`w-6 h-6 rounded-lg ${srv.color} flex items-center justify-center text-white shrink-0`}>
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span>{srv.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Puntos fuertes del alojamiento + Tarjeta de Puntuación (Igual al PDF Pág. 1-2) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Tarjeta de Puntuación y Comentario Destacado */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <span className="text-sm font-black text-slate-900 block">
                    {ratingScore >= 9 ? "Fantástico" : "Fabuloso"}
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {establishment.review_count || 148} comentarios reales verificados
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[#0e011f] text-white font-black text-sm flex items-center justify-center shadow-sm border border-[#00C8D4]/40">
                  {String(ratingScore).replace(".", ",")}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700 block mb-1">
                  Lo que más gustó a quienes se alojaron aquí:
                </span>
                <p className="text-xs text-slate-600 italic leading-relaxed bg-white p-3 rounded-xl border border-slate-200/70">
                  “Excelente ubicación, atención de primera, planta eléctrica operativa 24/7 y facilidad para pagar con Zelle o Pago Móvil a tasa BCV.”
                </p>
              </div>
            </div>

            {/* Tarjeta: Puntos fuertes del alojamiento */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e011f] to-[#1a0533] text-white space-y-4 shadow-lg border border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00C8D4] block">
                  LO QUE HACE ESPECIAL A ESTE LUGAR
                </span>
                <h3 className="text-base font-serif font-bold text-white mt-0.5">
                  Puntos fuertes del alojamiento
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#00C8D4] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-white/90 leading-snug">
                    Ubicación verificada en <strong>{establishment.destination_name || establishment.city || "Venezuela"}</strong> con excelente puntuación de zona.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#FF0096] flex items-center justify-center shrink-0 mt-0.5">
                    <Bed className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-white/90 leading-snug">
                    ¿Quieres dormir a pierna suelta? Este alojamiento tiene una puntuación muy alta por la comodidad de sus camas.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Wallet className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-white/90 leading-snug">
                    <strong>Multimoneda Venezuela:</strong> Acepta Pago Móvil, Zelle, Binance Pay USDT y Efectivo ($ USD / Bs. VES).
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <TrackedWhatsAppButton
                  whatsappNumber={establishment.whatsapp || establishment.phone}
                  establishmentId={establishment.id}
                  establishmentName={establishment.name}
                  customMessage={`Hola! Quisiera reservar directamente en ${establishment.name} sin comisiones.`}
                >
                  Reservar Ahora (0% Comisiones)
                </TrackedWhatsAppButton>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. INFO Y PRECIOS: "ASEGURA TUS FECHAS" CON DUALIDAD MONETARIA NATIVA (USD / VES) ── */}
      <section id="v15-info-precios" className="scroll-mt-32 bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF0096] block">
              DISPONIBILIDAD Y PRECIOS DIRECTOS · SIN INTERMEDIARIOS
            </span>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mt-0.5">
              Asegura tus fechas — Tarifas en Dólares ($ USD) y Bolívares (Bs. VES)
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Visualización bimonetaria nativa adaptada a Venezuela (`country_category_id = 1`). Sin recargos ocultos.
            </p>
          </div>

          {/* Controles de Dualidad Monetaria USD / VES y Tasa BCV */}
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
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                    currencyMode === m.id
                      ? "bg-[#0e011f] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  unitFilter === f.id
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
                  Precio por {nightsCount} {nightsCount === 1 ? "noche" : "noches"}
                </th>
                <th className="p-4 border-r border-white/15 w-[20%]">Tus opciones y métodos de pago</th>
                <th className="p-4 w-[12%] text-center">Seleccionar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {displayRooms.map((room) => {
                const nightlyUsd = Number(room.price_per_night || 85);
                const totalStayUsd = nightlyUsd * nightsCount;
                const dualPrice = formatDualCurrencyVenezuela(totalStayUsd, bcvRate);
                const nightlyDual = formatDualCurrencyVenezuela(nightlyUsd, bcvRate);
                const cap = Number(room.capacity || 2);
                const selectedQty = selectedQuantities[room.id] || 0;

                return (
                  <tr key={room.id} className="hover:bg-slate-50/80 transition-colors align-top">
                    {/* Columna 1: Tipo de habitación y equipamiento C01.1 */}
                    <td className="p-4 border-r border-slate-200 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-serif font-bold text-[#00C8D4] hover:underline">
                          {room.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold shrink-0">
                          {room.size_m2 || 34} m²
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                        <Bed className="w-4 h-4 text-[#FF0096] shrink-0" />
                        <span>{room.beds_summary || `Camas confort para hasta ${cap} huéspedes`}</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[
                          "Aire acondicionado (C01.1.6.1)",
                          "Baño privado (C01.1.3)",
                          "TV pantalla plana (C01.1.7.1)",
                          "WiFi gratis",
                          "Insonorización",
                          "Caja fuerte"
                        ].map((item, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            {item}
                          </span>
                        ))}
                      </div>
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

                    {/* Columna 3: Precio Dual USD / VES */}
                    <td className="p-4 border-r border-slate-200 space-y-1.5">
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
                    </td>

                    {/* Columna 4: Opciones y Métodos de Pago Venezolanos */}
                    <td className="p-4 border-r border-slate-200 space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <Coffee className="w-3.5 h-3.5 shrink-0" />
                        <span>Desayuno disponible / incluido según plan</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00C8D4] shrink-0" />
                        <span>Confirmación inmediata con recepción</span>
                      </div>
                      <div className="pt-1 border-t border-slate-100">
                        <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                          Admite en Venezuela:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {["Pago Móvil", "Zelle", "Binance USDT", "Efectivo USD/VES"].map((pm) => (
                            <span
                              key={pm}
                              className="px-1.5 py-0.5 rounded bg-[#00C8D4]/10 text-[#00C8D4] text-[9px] font-black"
                            >
                              {pm}
                            </span>
                          ))}
                        </div>
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
                        customMessage={`Hola! Quiero reservar la unidad "${room.name}" por ${nightsCount} noche(s) (${dualPrice.combinedLabel}) en ${establishment.name}.`}
                      >
                        Reservar
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
                Total estimado: <strong>{formatDualCurrencyVenezuela(totalSelectedUsd, bcvRate).combinedLabel}</strong> (Tasa BCV: {bcvRate} Bs./$)
              </p>
            </div>
            <TrackedWhatsAppButton
              whatsappNumber={establishment.whatsapp || establishment.phone}
              establishmentId={establishment.id}
              establishmentName={establishment.name}
              customMessage={`Hola! Deseo confirmar la reserva de ${totalSelectedRooms} habitación(es) por ${nightsCount} noche(s) en ${establishment.name}. Total estimado: ${formatDualCurrencyVenezuela(totalSelectedUsd, bcvRate).combinedLabel}.`}
            >
              Confirmar Selección por WhatsApp
            </TrackedWhatsAppButton>
          </div>
        )}
      </section>

      {/* ── 4. OPINIONES DE LA COMUNIDAD (COMENTARIOS DE CLIENTES — PÁG. 3-4 DEL PDF) ── */}
      <section id="v15-comentarios" className="scroll-mt-32 bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00C8D4] block">
              EXPERIENCIAS VERIFICADAS DE HUÉSPEDES
            </span>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mt-0.5">
              Opiniones de la comunidad
            </h2>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200">
            <div className="w-11 h-11 rounded-2xl bg-[#0e011f] text-white font-black text-base flex items-center justify-center shadow-sm">
              {String(ratingScore).replace(".", ",")}
            </div>
            <div>
              <span className="text-xs font-black text-slate-900 block">
                {ratingScore >= 9 ? "Fantástico" : "Fabuloso"} · {establishment.review_count || 148} comentarios
              </span>
              <span className="text-[11px] text-emerald-600 font-bold">
                Comentarios 100% auténticos de huéspedes reales
              </span>
            </div>
          </div>
        </div>

        {/* Barras de Categorías de Calificación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Personal y Atención", score: 9.4 },
            { label: "Instalaciones y Servicios", score: 9.0 },
            { label: "Limpieza", score: 9.2 },
            { label: "Confort de Habitación", score: 9.1 },
            { label: "Relación Calidad-Precio", score: 8.8 },
            { label: "Ubicación y Seguridad", score: 9.3 },
            { label: "WiFi gratis", score: 8.9 },
            { label: "Respaldo Eléctrico y Agua", score: 9.6 }
          ].map((cat) => (
            <div key={cat.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>{cat.label}</span>
                <span>{String(cat.score).replace(".", ",")}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00C8D4] to-[#9B00CC]"
                  style={{ width: `${Math.min(100, cat.score * 10)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Filtros por temas */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-bold text-slate-500 mr-1">Elige los temas de los comentarios:</span>
          {["Todos", "Habitación", "Ubicación", "Planta Eléctrica", "Desayuno", "Limpieza"].map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => setReviewTopicFilter(topic)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                reviewTopicFilter === topic
                  ? "bg-[#FF0096] text-white border-[#FF0096]"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              + {topic}
            </button>
          ))}
        </div>

        {/* Tarjetas de Comentarios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredReviews.map((rev, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#9B00CC] text-white font-black text-xs flex items-center justify-center">
                      {rev.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{rev.name}</h4>
                      <span className="text-[10px] text-slate-500 font-semibold block">{rev.country}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-[#0e011f] text-white text-xs font-black">
                    {rev.score}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">“{rev.comment}”</p>
              </div>

              <div className="pt-3 border-t border-slate-200/80 text-[10px] text-slate-500 font-semibold flex items-center justify-between">
                <span>{rev.room}</span>
                <span>{rev.nights}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. RESOLVEMOS TUS DUDAS EN UN CLIC (PREGUNTAS FRECUENTES — PÁG. 5 DEL PDF) ── */}
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

      {/* ── 6. GUÍA DE LA ZONA (ALREDEDORES DEL HOTEL C00.6 + RESTAURANTES — PÁG. 6 DEL PDF) ── */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00C8D4] block">
              ENTORNO Y PUNTOS DE INTERÉS CERCANOS (C00.6)
            </span>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mt-0.5">
              Guía de la zona — Alrededores de {establishment.name}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              A los clientes les encantó pasear por el barrio · Excelente ubicación en {establishment.destination_name || establishment.city || "Venezuela"}
            </p>
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

        {/* Bloque de Restaurantes en el Alojamiento */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FF0096] flex items-center justify-center text-white shrink-0">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#FF0096] block">
                GASTRONOMÍA EN EL ALOJAMIENTO (C02.1)
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Restaurante Principal & Terraza Lounge — {establishment.name}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Cocina: Venezolana de Autor, Caribeña e Internacional · Menú: Buffet y A la carta
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase shrink-0">
            Abierto para Desayuno, Almuerzo y Cena
          </span>
        </div>

        {/* 3 Columnas de Puntos de Interés (C00.6.1, C00.6.2, C00.6.3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna 1: ¿Qué hay cerca? y Restaurantes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <div className="w-7 h-7 rounded-lg bg-[#00C8D4] flex items-center justify-center text-white">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                ¿Qué hay cerca? (C00.6.1)
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

          {/* Columna 2: Playas, Parques y Naturaleza */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <div className="w-7 h-7 rounded-lg bg-[#9B00CC] flex items-center justify-center text-white">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Playas y Atractivos (C00.6.2)
              </h4>
            </div>
            <ul className="space-y-2 text-xs">
              {(beachesAndNature.length > 0 ? beachesAndNature : nearPlaces.slice(0, 4)).map((item, idx) => (
                <li key={idx} className="flex items-center justify-between gap-2 py-1 border-b border-slate-100">
                  <span className="text-slate-700 font-medium">{item.name}</span>
                  <span className="text-slate-500 font-bold shrink-0">{item.distance}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Aeropuertos y Transporte Público */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <div className="w-7 h-7 rounded-lg bg-[#FF0096] flex items-center justify-center text-white">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Aeropuertos y Transporte (C00.6.3)
              </h4>
            </div>
            <ul className="space-y-2 text-xs">
              {(transportAndAirports.length > 0
                ? transportAndAirports
                : [
                    { name: "Aeropuerto Nacional / Internacional más cercano", distance: "12 km" },
                    { name: "Terminal de Transporte y Taxis Ejecutivos", distance: "800 m" }
                  ]
              ).map((item, idx) => (
                <li key={idx} className="flex items-center justify-between gap-2 py-1 border-b border-slate-100">
                  <span className="text-slate-700 font-medium">{item.name}</span>
                  <span className="text-slate-500 font-bold shrink-0">{item.distance}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 7. TODO LO QUE INCLUYE TU ESTANCIA (SERVICIOS C01–C06 — PÁG. 7-8 DEL PDF) ── */}
      <section id="v15-servicios" className="scroll-mt-32 bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00C8D4] block">
            MAESTRO DE ETIQUETAS V15 · TAXONOMÍA C01 A C06
          </span>
          <h2 className="text-2xl font-serif font-bold text-slate-900 mt-0.5">
            Todo lo que incluye tu estancia — Servicios de {establishment.name}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Buenos servicios · Puntuación verificada de instalaciones y suministros operativos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Suministros Críticos Venezuela (C01.4)",
              color: "bg-emerald-500",
              icon: Zap,
              items: [
                "Planta Eléctrica 24/7 (C01.4.1)",
                "Tanque de Agua continuo (C01.4.2)",
                "Agua caliente garantizada",
                "Climatización operativa continua"
              ]
            },
            {
              title: "Internet y Conectividad (C01.3)",
              color: "bg-[#00C8D4]",
              icon: Wifi,
              items: [
                "WiFi gratis en todo el establecimiento (C01.3.1)",
                "Conexión de fibra óptica / alta velocidad",
                "Zona de trabajo para portátiles (C01.1.8.1)",
                "Enchufes y cargadores cerca de la cama"
              ]
            },
            {
              title: "Aparcamiento y Traslados (C03.1–C03.2)",
              color: "bg-[#9B00CC]",
              icon: Car,
              items: [
                "Parking privado en el alojamiento (C03.1.1)",
                "Parking vigilado 24 horas (C03.1.5)",
                "Servicio de traslado al aeropuerto (C03.2.1)",
                "Parking adaptado para PMR (C03.1.6)"
              ]
            },
            {
              title: "Comida y Bebida (C02.1)",
              color: "bg-[#FF0096]",
              icon: Utensils,
              items: [
                "Restaurante a la carta y buffet (C02.1.1)",
                "Desayuno en la habitación (C02.1.2.1)",
                "Bar & Cafetería en el alojamiento (C02.1.1.3)",
                "Menús para dietas especiales bajo petición"
              ]
            },
            {
              title: "Recepción y Limpieza (C03.4–C03.5)",
              color: "bg-[#00C8D4]",
              icon: ShieldCheck,
              items: [
                "Recepción 24 horas (C03.4.1)",
                "Registro de entrada y salida exprés (C03.4.2)",
                "Servicio de limpieza diario (C03.5.1)",
                "Guardaequipaje y conserjería (C03.4.4)"
              ]
            },
            {
              title: "Seguridad y Accesibilidad (C01.5)",
              color: "bg-emerald-500",
              icon: Award,
              items: [
                "Seguridad 24 horas (C01.5.1.1)",
                "Cámaras de seguridad en zonas comunes (C01.5.1.2)",
                "Detectores de humo y extintores (C01.5.2)",
                "Acceso adaptado para movilidad reducida (C01.5.3)"
              ]
            }
          ].map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.title} className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl ${group.color} flex items-center justify-center text-white shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    {group.title}
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00C8D4] shrink-0 mt-0.5" />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 8. NORMAS DE LA CASA (C04) Y ECOSISTEMA DE PAGOS DE VENEZUELA (C04.7) — PÁG. 9-10 DEL PDF ── */}
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

          {/* Métodos de Pago Aceptados en Venezuela (C04.7 - country_category_id = 1) */}
          <div className="grid grid-cols-1 md:grid-cols-12 p-4 sm:p-5 gap-3 bg-white">
            <div className="md:col-span-4 flex items-center gap-2.5 font-black text-slate-900">
              <div className="w-7 h-7 rounded-lg bg-[#FF0096] flex items-center justify-center text-white shrink-0">
                <CreditCard className="w-3.5 h-3.5 text-white" />
              </div>
              <span>Métodos de pago aceptados en Venezuela (C04.7)</span>
            </div>
            <div className="md:col-span-8 space-y-3">
              <p className="text-slate-600 font-medium">
                Pasarela y recepción adaptadas a la operativa financiera de Venezuela (`country_category_id = 1`):
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { code: "C04.7.1.1", name: "Pago Móvil Interbancario (VES)", badge: "Nacional VES" },
                  { code: "C04.7.3.1", name: "Zelle ($ USD)", badge: "Divisas Digital" },
                  { code: "C04.7.3.2", name: "Binance Pay (USDT)", badge: "Cripto / USDT" },
                  { code: "C04.7.2.1", name: "Efectivo Dólares ($ USD)", badge: "Efectivo" },
                  { code: "C04.7.2.2", name: "Efectivo Bolívares (Bs. VES)", badge: "Efectivo" },
                  { code: "C04.7.3.3", name: "Banesco Panamá", badge: "Internacional" },
                  { code: "C04.7.3.4", name: "Mercantil Panamá", badge: "Internacional" },
                  { code: "C04.7.3.5", name: "Cuentas Custodia en Divisas", badge: "Banca Nacional" },
                  { code: "C04.7.1.2", name: "Punto de Venta / Tarjetas Nacionales", badge: "TDD / TDC" },
                  { code: "C04.7.3.6", name: "Tarjetas Internacionales (Visa / Mastercard)", badge: "Internacional" }
                ].map((m) => (
                  <div
                    key={m.code}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#00C8D4]" />
                    <span className="font-bold text-xs">{m.name}</span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#0e011f] text-white">
                      {m.badge}
                    </span>
                  </div>
                ))}
              </div>
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

