import React, { useState } from "react";
import type { Establishment } from "../../types";
import type {
  CharterVessel,
  CharterBooking,
  CharterRoute,
  CharterCrewMember
} from "../../types/yachtCharter";
import {
  Ship,
  Anchor,
  Compass,
  Waves,
  LifeBuoy,
  Wind,
  Navigation,
  Users,
  Fuel,
  CalendarCheck,
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Phone,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  DollarSign,
  MapPin,
  Music,
  Tv,
  Coffee,
  Download,
  Search,
  Check,
  SlidersHorizontal,
  ChevronRight,
  Radio
} from "lucide-react";

interface YachtCharterDashboardProps {
  establishment?: Establishment | null;
  onSwitchToTraditionalDashboard: () => void;
}

const INITIAL_VESSELS: CharterVessel[] = [
  {
    id: "ves-1",
    name: "Yate Sea Ray 520 'Caribe Queen'",
    type: "yacht_flybridge",
    typeName: "Yate Flybridge de Lujo",
    matricula: "ARSH-PE-4912",
    lengthFt: 52,
    maxPassengers: 16,
    cabins: 3,
    bathrooms: 2,
    engines: "Twin Cummins QSC 8.3 600HP Diésel",
    cruisingSpeedKnots: 24,
    baseMarina: "Marina Las Garzas, Lechería / Puerto La Cruz",
    status: "available",
    statusLabel: "Disponible en Muelle",
    hourlyRateUsd: 220,
    fullDayRateUsd: 1450,
    overnightRateUsd: 2200,
    captainIncluded: true,
    crewCount: 2,
    imageUrl: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80",
    amenities: ["A/A Marino Central", "Sonido JL Audio Bluetooth", "Planta Eléctrica Onan 13.5kW", "Parrillera a Gas Popa", "Cava con Hielo Ilimitado", "Ducha de Agua Dulce"],
    waterToys: ["2x Paddle Board SUP", "Equipos de Snorkel (16 pax)", "Flotadores y Donas", "Plataforma de Baño"]
  },
  {
    id: "ves-2",
    name: "Lancha Deportiva 38ft 'Morrocoy Flash'",
    type: "speedboat",
    typeName: "Lancha Rápida Open Center Console",
    matricula: "TN-6701-AJ",
    lengthFt: 38,
    maxPassengers: 12,
    cabins: 1,
    bathrooms: 1,
    engines: "Triple Yamaha 300HP 4 Tiempos",
    cruisingSpeedKnots: 38,
    baseMarina: "Marina Seca La Cuevita, Tucacas (Morrocoy)",
    status: "sailing",
    statusLabel: "En Navegación (Cayo Sombrero)",
    hourlyRateUsd: 160,
    fullDayRateUsd: 950,
    captainIncluded: true,
    crewCount: 2,
    imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Sonido Marino Pro Fusion", "Cava Gigante con Hielo", "Toldo T-Top Extendido", "Ducha de Popa"],
    waterToys: ["Equipos Snorkel (12 pax)", "Dona de Arrastre Inflable", "Chalecos Certificados"]
  },
  {
    id: "ves-3",
    name: "Catamarán Lagoon 450 'Isla Serena'",
    type: "catamaran",
    typeName: "Catamarán a Vela & Motor",
    matricula: "LR-8820-NA",
    lengthFt: 45,
    maxPassengers: 20,
    cabins: 4,
    bathrooms: 4,
    engines: "Twin Yanmar 57HP Diésel",
    cruisingSpeedKnots: 12,
    baseMarina: "Gran Roque, Los Roques",
    status: "booked",
    statusLabel: "Reservado (Pernocta en Francisquí)",
    hourlyRateUsd: 280,
    fullDayRateUsd: 1800,
    overnightRateUsd: 2600,
    captainIncluded: true,
    crewCount: 3,
    imageUrl: "https://images.unsplash.com/photo-1500930287596-c1ecaa373bb2?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Generador 110V 24/7", "Desalinizadora de Agua 100L/h", "Cocina Gourmet Equipada", "Red de Proa para Solarium", "Aire Acondicionado"],
    waterToys: ["2x Kayak Doble", "3x SUP Paddle Boards", "Equipos de Buceo y Snorkel", "Dinghy auxiliar 15HP"]
  }
];

const INITIAL_BOOKINGS: CharterBooking[] = [
  {
    id: "bk-101",
    bookingCode: "CHR-2026-891",
    vesselId: "ves-2",
    vesselName: "Lancha Deportiva 38ft 'Morrocoy Flash'",
    clientName: "Alejandro Carrillo (Grupo Familiar)",
    clientPhone: "+58 414 322 8899",
    clientEmail: "acarrillo@inversiones.com",
    date: "2026-09-09",
    departureTime: "09:30 AM",
    returnTime: "05:30 PM",
    charterType: "full_day",
    charterTypeLabel: "Full Day Cayos",
    destinationRoute: "Ruta Cayos Morrocoy: Cayo Sombrero ➔ Los Juanes ➔ Bajo Caimán",
    passengerCount: 10,
    captainName: "Cap. Roberto Mendoza (Lic. INEA #4410)",
    sailorName: "Carlos Gómez (Deckhand)",
    totalUsd: 950,
    advanceDepositUsd: 950,
    securityDepositUsd: 200,
    paymentStatus: "paid",
    zarpeStatus: "in_route",
    passengersList: [
      { fullName: "Alejandro Carrillo", docId: "V-14.882.112", age: 44, phone: "+58 414 322 8899" },
      { fullName: "Mariana Delgado de Carrillo", docId: "V-16.104.992", age: 41 },
      { fullName: "Santiago Carrillo Delgado", docId: "V-29.330.111", age: 19 },
      { fullName: "Valeria Carrillo Delgado", docId: "V-31.554.210", age: 16 },
      { fullName: "Eduardo Mendoza", docId: "V-15.300.990", age: 46 }
    ],
    cateringNotes: "Incluye 3 bolsas de hielo extra, cava surtida de agua y refrescos. Pasajeros llevan su comida y parrillada."
  },
  {
    id: "bk-102",
    bookingCode: "CHR-2026-892",
    vesselId: "ves-1",
    vesselName: "Yate Sea Ray 520 'Caribe Queen'",
    clientName: "Valeria Santoro & Amigos",
    clientPhone: "+58 412 889 4411",
    clientEmail: "valeria.santoro@eventos.ve",
    date: "2026-09-10",
    departureTime: "04:30 PM",
    returnTime: "08:30 PM",
    charterType: "sunset",
    charterTypeLabel: "Sunset Cruise Bahía & Brindis",
    destinationRoute: "Bahía de Pozuelos ➔ Isla El Borracho ➔ Puesta de Sol Lechería",
    passengerCount: 14,
    captainName: "Cap. Marcos Vallenilla",
    sailorName: "Jesús Moreno",
    totalUsd: 880,
    advanceDepositUsd: 500,
    securityDepositUsd: 300,
    paymentStatus: "partial",
    zarpeStatus: "approved",
    passengersList: [
      { fullName: "Valeria Santoro", docId: "V-20.199.302", age: 32, phone: "+58 412 889 4411" },
      { fullName: "Guillermo Rivas", docId: "V-19.882.771", age: 34 }
    ],
    cateringNotes: "Celebración de cumpleaños. Solicitan tabla de quesos y copas de champaña a bordo."
  }
];

const INITIAL_ROUTES: CharterRoute[] = [
  {
    id: "rt-1",
    name: "Cayos VIP Morrocoy (Cayo Sombrero + Los Juanes)",
    region: "Parque Nacional Morrocoy, Falcón",
    durationHours: 8,
    highlights: ["Piscina natural Los Juanes", "Aguas cristalinas Cayo Sombrero", "Snorkel en Bajo Caimán", "Muelle de mariscos flotante"],
    fuelConsumptionEstGal: 45,
    recommendedVesselTypes: ["Lancha Deportiva", "Yate Flybridge"]
  },
  {
    id: "rt-2",
    name: "Islas del Parque Nacional Mochima (Playa Blanca + Isla Larga)",
    region: "Parque Nacional Mochima, Anzoátegui / Sucre",
    durationHours: 7,
    highlights: ["Avistamiento de delfines en Canal de Mochima", "Aguas calmas Playa Blanca", "Arrecifes de coral Isla Larga"],
    fuelConsumptionEstGal: 35,
    recommendedVesselTypes: ["Yate a Motor", "Catamarán", "Lancha Rápida"]
  },
  {
    id: "rt-3",
    name: "Travesía Los Roques (Cayo de Agua + Francisquí + Madrisquí)",
    region: "Archipiélago Los Roques",
    durationHours: 9,
    highlights: ["Istmo de Cayo de Agua", "Piscinas naturales Francisquí", "Kitesurf y Snorkel con tortugas"],
    fuelConsumptionEstGal: 60,
    recommendedVesselTypes: ["Catamarán de Lujo", "Yate de Altura"]
  },
  {
    id: "rt-4",
    name: "Costa de Aragua (La Ciénaga de Ocumare + Bahía de Cata)",
    region: "Costa de Aragua",
    durationHours: 8,
    highlights: ["Santuario marino La Ciénaga", "Túnel de manglares", "Playa de aguas mansas para fondear"],
    fuelConsumptionEstGal: 40,
    recommendedVesselTypes: ["Lancha Rápida", "Yate Sport"]
  }
];

const INITIAL_CREW: CharterCrewMember[] = [
  {
    id: "cr-1",
    fullName: "Cap. Roberto Mendoza",
    role: "captain",
    roleLabel: "Capitán de Yate / Patrón INEA",
    licenseNumber: "INEA-CAP-44109-VE",
    phone: "+58 414 901 2233",
    status: "on_route",
    assignedVesselName: "Lancha Deportiva 38ft 'Morrocoy Flash'",
    experienceYears: 18
  },
  {
    id: "cr-2",
    fullName: "Cap. Marcos Vallenilla",
    role: "captain",
    roleLabel: "Capitán de Altura",
    licenseNumber: "INEA-CAP-28901-VE",
    phone: "+58 424 811 7700",
    status: "active",
    assignedVesselName: "Yate Sea Ray 520 'Caribe Queen'",
    experienceYears: 22
  },
  {
    id: "cr-3",
    fullName: "Carlos Gómez",
    role: "sailor",
    roleLabel: "Primer Oficial / Marinero",
    licenseNumber: "INEA-MAR-77102",
    phone: "+58 412 300 4455",
    status: "on_route",
    assignedVesselName: "Lancha Deportiva 38ft 'Morrocoy Flash'",
    experienceYears: 8
  },
  {
    id: "cr-4",
    fullName: "Chef Daniel Salazar",
    role: "chef",
    roleLabel: "Chef Especialista en Cocina Marina",
    licenseNumber: "CERT-GASTR-9912",
    phone: "+58 414 772 0011",
    status: "active",
    experienceYears: 12
  }
];

export function YachtCharterDashboard({
  establishment,
  onSwitchToTraditionalDashboard
}: YachtCharterDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "fleet" | "bookings" | "zarpes" | "crew" | "routes">("overview");
  const [vessels, setVessels] = useState<CharterVessel[]>(INITIAL_VESSELS);
  const [bookings, setBookings] = useState<CharterBooking[]>(INITIAL_BOOKINGS);
  const [crew, setCrew] = useState<CharterCrewMember[]>(INITIAL_CREW);
  const [selectedBookingForZarpe, setSelectedBookingForZarpe] = useState<CharterBooking | null>(INITIAL_BOOKINGS[0]);
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [showNewVesselModal, setShowNewVesselModal] = useState(false);

  // Stats calculation
  const totalFleetCount = vessels.length;
  const sailingCount = vessels.filter(v => v.status === "sailing").length;
  const availableCount = vessels.filter(v => v.status === "available").length;
  const totalBookingsValue = bookings.reduce((sum, b) => sum + b.totalUsd, 0);

  const toggleVesselStatus = (vesselId: string) => {
    setVessels(prev => prev.map(v => {
      if (v.id === vesselId) {
        const nextStatus = v.status === "available" ? "sailing" : v.status === "sailing" ? "maintenance" : "available";
        const nextLabel = nextStatus === "available" ? "Disponible en Muelle" : nextStatus === "sailing" ? "En Navegación" : "En Mantenimiento";
        return { ...v, status: nextStatus, statusLabel: nextLabel };
      }
      return v;
    }));
  };

  const updateBookingZarpeStatus = (bookingId: string, nextStatus: CharterBooking["zarpeStatus"]) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, zarpeStatus: nextStatus } : b));
    if (selectedBookingForZarpe?.id === bookingId) {
      setSelectedBookingForZarpe(prev => prev ? { ...prev, zarpeStatus: nextStatus } : null);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 font-sans pb-16">
      {/* Top Banner de Suite Náutica & Botón Volver a Matriz */}
      <div className="bg-gradient-to-r from-[#0e011f] via-[#1a0533] to-[#0a192f] text-white p-6 md:p-8 rounded-3xl shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C8D4]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#FF0096]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00C8D4]/20 border border-[#00C8D4]/40 text-[#00C8D4]">
                <Ship className="w-3.5 h-3.5" />
                SUITE CHARTER · ALQUILER DE YATES & EMBARCACIONES
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/90 border border-white/10">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                VHF Canal 16 Capitanía Activo
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight font-serif text-white">
              {establishment?.name || "Empresa de Alquiler de Yates & Veleros"}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Consola operativa para armadores y empresas de charter turístico. Gestiona tu flota de yates, catamaranes y lanchas deportivas, itinerarios por horas o full day, tripulación certificada, amenidades a bordo y manifiestos de zarpe INEA.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={onSwitchToTraditionalDashboard}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-black transition-all border border-white/20 cursor-pointer shadow-md hover:scale-[1.02]"
            >
              <ArrowLeft className="w-4 h-4 text-[#00C8D4]" />
              <span>Volver al Dashboard Matriz</span>
            </button>
            <button
              onClick={() => setShowNewBookingModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:from-[#FF0096]/90 hover:to-[#9B00CC]/90 text-white rounded-2xl text-xs font-black transition-all shadow-lg hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nuevo Charter / Reserva</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Cluster */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-6 pt-6 border-t border-white/10">
          {[
            { id: "overview", label: "Resumen Live Ops", icon: Waves },
            { id: "fleet", label: `Flota Charter (${vessels.length})`, icon: Ship },
            { id: "bookings", label: `Reservas & Salidas (${bookings.length})`, icon: CalendarCheck },
            { id: "zarpes", label: "Manifiestos & INEA", icon: FileText },
            { id: "crew", label: `Tripulación (${crew.length})`, icon: Users },
            { id: "routes", label: `Rutas & Destinos (${INITIAL_ROUTES.length})`, icon: Compass }
          ].map(tab => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer border ${
                  active
                    ? "bg-[#00C8D4] text-slate-950 border-white shadow-lg font-black scale-[1.02]"
                    : "bg-white/5 hover:bg-white/10 text-white/90 border-white/10"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Métricas clave */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Flota Total</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{totalFleetCount}</p>
                <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {availableCount} listos para zarpar
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#00C8D4] flex items-center justify-center text-white shadow-md">
                <Ship className="w-6 h-6 stroke-[2.5]" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">En Navegación Ahora</p>
                <p className="text-3xl font-black text-[#00C8D4] mt-1">{sailingCount}</p>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">Cayos & Bahías activas</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#0e011f] flex items-center justify-center text-[#00C8D4] shadow-md">
                <Navigation className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Charters Activos</p>
                <p className="text-3xl font-black text-[#FF0096] mt-1">{bookings.length}</p>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">Full Day & Sunset</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#FF0096] flex items-center justify-center text-white shadow-md">
                <CalendarCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Facturación Programada</p>
                <p className="text-3xl font-black text-slate-900 mt-1">${totalBookingsValue.toLocaleString()}</p>
                <p className="text-[11px] text-purple-700 font-bold mt-1">Garantías y depósitos al día</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#9B00CC] flex items-center justify-center text-white shadow-md">
                <DollarSign className="w-6 h-6 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Salidas en Vivo de Hoy & Resumen de Flota */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#00C8D4] animate-ping" />
                  <h3 className="font-black text-lg text-slate-900 font-serif">Salidas Programadas & En Curso</h3>
                </div>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className="text-xs font-bold text-[#FF0096] hover:underline flex items-center gap-1"
                >
                  Ver todas <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3.5">
                {bookings.map(bk => (
                  <div
                    key={bk.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/30">
                          {bk.bookingCode}
                        </span>
                        <span className="text-xs font-black text-slate-800">{bk.vesselName}</span>
                        <span className="text-[10px] font-bold text-slate-400">• {bk.charterTypeLabel}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {bk.destinationRoute}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Cliente: <strong className="text-slate-800">{bk.clientName}</strong> ({bk.passengerCount} pasajeros) · {bk.departureTime} a {bk.returnTime}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                        bk.zarpeStatus === "in_route"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : bk.zarpeStatus === "approved"
                          ? "bg-blue-100 text-blue-800 border border-blue-300"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                      }`}>
                        {bk.zarpeStatus === "in_route" ? "🌊 En Navegación" : bk.zarpeStatus === "approved" ? "✅ Zarpe Aprobado" : "⏳ Pendiente"}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedBookingForZarpe(bk);
                          setActiveTab("zarpes");
                        }}
                        className="px-3 py-1.5 bg-[#0e011f] hover:bg-[#1a0533] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Manifiesto
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions & Security Banner */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-[#0e011f] to-[#1a0533] text-white p-6 rounded-3xl shadow-md border border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00C8D4] flex items-center justify-center text-slate-950">
                    <LifeBuoy className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-white">Seguridad & Normativa INEA</h4>
                    <p className="text-[10px] text-slate-300">Capitanía de Puertos de Venezuela</p>
                  </div>
                </div>
                <div className="text-xs text-slate-300 space-y-2 border-t border-white/10 pt-3 font-medium">
                  <p className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00C8D4]" />
                    <span>100% chalecos salvavidas verificados</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00C8D4]" />
                    <span>Permiso de navegación y matrículas vigentes</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#00C8D4]" />
                    <span>Póliza de Responsabilidad Civil Marítima</span>
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3">
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-400">Acciones Rápidas</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowNewVesselModal(true)}
                    className="p-3 bg-slate-50 hover:bg-[#00C8D4]/10 hover:text-[#00C8D4] border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 transition-all text-left flex flex-col gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#00C8D4]" />
                    <span>Añadir Embarcación</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("crew")}
                    className="p-3 bg-slate-50 hover:bg-[#FF0096]/10 hover:text-[#FF0096] border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 transition-all text-left flex flex-col gap-1.5 cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-[#FF0096]" />
                    <span>Asignar Capitanes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FLEET MATRIX */}
      {activeTab === "fleet" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 font-serif">Flota de Embarcaciones en Alquiler</h3>
              <p className="text-xs text-slate-500">Yates a motor, lanchas deportivas, catamaranes y veleros disponibles para charter turístico.</p>
            </div>
            <button
              onClick={() => setShowNewVesselModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-white rounded-2xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer hover:scale-[1.02] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Embarcación</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vessels.map(ves => (
              <div
                key={ves.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={ves.imageUrl}
                      alt={ves.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-[#0e011f]/85 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white border border-white/20">
                      {ves.lengthFt} ft · {ves.typeName}
                    </div>
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => toggleVesselStatus(ves.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer border shadow-sm ${
                          ves.status === "available"
                            ? "bg-emerald-500 text-white border-emerald-400"
                            : ves.status === "sailing"
                            ? "bg-[#00C8D4] text-slate-950 border-white font-black"
                            : "bg-amber-500 text-white border-amber-400"
                        }`}
                        title="Click para alternar estado"
                      >
                        {ves.status === "available" ? "● Disponible" : ves.status === "sailing" ? "🌊 En Navegación" : "🔧 Mantenimiento"}
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-xl">
                      <p className="text-white font-black text-sm">{ves.name}</p>
                      <p className="text-[10px] text-slate-300 font-mono">Matrícula: {ves.matricula}</p>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Specs Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center py-2 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400">Capacidad</p>
                        <p className="text-xs font-black text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                          <Users className="w-3 h-3 text-[#FF0096]" />
                          {ves.maxPassengers} Pax
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400">Camarotes</p>
                        <p className="text-xs font-black text-slate-800 mt-0.5">{ves.cabins} Cab / {ves.bathrooms} Baños</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400">Velocidad</p>
                        <p className="text-xs font-black text-slate-800 mt-0.5">{ves.cruisingSpeedKnots} nudos</p>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 font-medium">
                      <p><strong className="text-slate-900">Motores:</strong> {ves.engines}</p>
                      <p><strong className="text-slate-900">Marina Base:</strong> {ves.baseMarina}</p>
                    </div>

                    {/* Amenidades y Water Toys */}
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Servicios & Juguetes a Bordo</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ves.amenities.slice(0, 3).map((am, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-purple-50 text-purple-800 border border-purple-100">
                            ✨ {am}
                          </span>
                        ))}
                        {ves.waterToys.slice(0, 2).map((wt, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-100">
                            🏄 {wt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tarifas y Botón de Acción */}
                <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-3 mt-2">
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400">Tarifa Full Day</p>
                    <p className="text-lg font-black text-[#FF0096]">${ves.fullDayRateUsd} <span className="text-xs text-slate-400 font-normal">/ día</span></p>
                  </div>
                  <button
                    onClick={() => {
                      setShowNewBookingModal(true);
                    }}
                    className="px-4 py-2 bg-[#0e011f] hover:bg-[#1a0533] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    Crear Charter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CHARTER BOOKINGS */}
      {activeTab === "bookings" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 font-serif">Reservas & Despachos de Charter</h3>
              <p className="text-xs text-slate-500">Historial y próximas salidas programadas con itinerarios y tripulación asignada.</p>
            </div>
            <button
              onClick={() => setShowNewBookingModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white rounded-2xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer hover:scale-[1.02] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nueva Salida</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                    <th className="p-4 pl-6">Código / Fecha</th>
                    <th className="p-4">Embarcación & Modalidad</th>
                    <th className="p-4">Cliente & Pasajeros</th>
                    <th className="p-4">Ruta / Destino</th>
                    <th className="p-4">Capitán Asignado</th>
                    <th className="p-4">Total USD</th>
                    <th className="p-4">Estado Zarpe</th>
                    <th className="p-4 pr-6">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {bookings.map(bk => (
                    <tr key={bk.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-6">
                        <span className="font-mono font-black text-slate-900 block">{bk.bookingCode}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{bk.date} ({bk.departureTime})</span>
                      </td>
                      <td className="p-4">
                        <strong className="text-slate-900 block">{bk.vesselName}</strong>
                        <span className="text-[10px] text-[#FF0096] font-bold">{bk.charterTypeLabel}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800 block">{bk.clientName}</span>
                        <span className="text-[10px] text-slate-400">{bk.passengerCount} Pax · {bk.clientPhone}</span>
                      </td>
                      <td className="p-4 text-slate-600 max-w-xs truncate" title={bk.destinationRoute}>
                        {bk.destinationRoute}
                      </td>
                      <td className="p-4 text-slate-600">
                        {bk.captainName}
                      </td>
                      <td className="p-4 font-black text-[#FF0096] text-sm">
                        ${bk.totalUsd}
                      </td>
                      <td className="p-4">
                        <select
                          value={bk.zarpeStatus}
                          onChange={(e) => updateBookingZarpeStatus(bk.id, e.target.value as any)}
                          className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase border border-slate-200 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#00C8D4]"
                        >
                          <option value="draft">Borrador</option>
                          <option value="requested">Zarpe Solicitado</option>
                          <option value="approved">Zarpe Aprobado</option>
                          <option value="in_route">En Navegación</option>
                          <option value="completed">Finalizado / En Puerto</option>
                        </select>
                      </td>
                      <td className="p-4 pr-6">
                        <button
                          onClick={() => {
                            setSelectedBookingForZarpe(bk);
                            setActiveTab("zarpes");
                          }}
                          className="px-3 py-1.5 bg-[#00C8D4]/10 hover:bg-[#00C8D4]/20 text-[#00C8D4] border border-[#00C8D4]/30 rounded-xl font-black text-[10px] uppercase tracking-wider cursor-pointer"
                        >
                          Manifiesto INEA
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ZARPES & INEA COMPLIANCE */}
      {activeTab === "zarpes" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/30">
                  DOCUMENTO OFICIAL DE NAVEGACIÓN · INEA
                </span>
                <h3 className="text-2xl font-black text-slate-900 font-serif mt-1">
                  Manifiesto de Pasajeros & Despacho de Zarpe
                </h3>
                <p className="text-xs text-slate-500">
                  Generador de rol de tripulación y lista de pasajeros conforme a la normativa marítima nacional.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert("📄 Generando PDF del Manifiesto de Zarpe INEA con código QR oficial...")}
                  className="px-4 py-2.5 bg-[#0e011f] hover:bg-[#1a0533] text-white rounded-2xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4 text-[#00C8D4]" />
                  <span>Descargar / Imprimir Manifiesto</span>
                </button>
              </div>
            </div>

            {selectedBookingForZarpe ? (
              <div className="space-y-6">
                {/* Datos del Zarpe Header */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">Embarcación & Matrícula:</span>
                    <strong className="text-slate-900">{selectedBookingForZarpe.vesselName}</strong>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">Ruta Autorizada:</span>
                    <span className="text-slate-700 font-semibold">{selectedBookingForZarpe.destinationRoute}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">Capitán / Patrón:</span>
                    <strong className="text-slate-900">{selectedBookingForZarpe.captainName}</strong>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">Horario de Travesía:</span>
                    <span className="text-slate-700 font-semibold">{selectedBookingForZarpe.date} ({selectedBookingForZarpe.departureTime} a {selectedBookingForZarpe.returnTime})</span>
                  </div>
                </div>

                {/* Pasajeros Declarados */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm text-slate-900">Lista de Pasajeros a Bordo ({selectedBookingForZarpe.passengersList.length} Pax)</h4>
                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Chalecos y seguro activo
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-500">
                        <tr>
                          <th className="p-3 pl-4">#</th>
                          <th className="p-3">Nombre Completo del Pasajero</th>
                          <th className="p-3">Documento (Cédula / Pasaporte)</th>
                          <th className="p-3">Edad</th>
                          <th className="p-3 pr-4">Contacto de Emergencia</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedBookingForZarpe.passengersList.map((p, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-3 pl-4 font-bold text-slate-400">{idx + 1}</td>
                            <td className="p-3 font-bold text-slate-800">{p.fullName}</td>
                            <td className="p-3 font-mono font-semibold text-slate-600">{p.docId}</td>
                            <td className="p-3 text-slate-600">{p.age} años</td>
                            <td className="p-3 pr-4 text-slate-500">{p.phone || "En archivo principal"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notas de Catering y Aprovisionamiento */}
                {selectedBookingForZarpe.cateringNotes && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 space-y-1">
                    <strong className="block font-black uppercase tracking-wider text-[10px]">Aprovisionamiento & Solicitudes Especiales:</strong>
                    <p>{selectedBookingForZarpe.cateringNotes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Selecciona una reservación para consultar su manifiesto de zarpe.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: CREW & SKIPPERS */}
      {activeTab === "crew" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 font-serif">Tripulación & Patrones Certificados</h3>
              <p className="text-xs text-slate-500">Capitanes con licencia INEA, marineros de cubierta, chefs a bordo y azafatas náuticas.</p>
            </div>
            <button
              onClick={() => alert("Añadir nuevo miembro de tripulación")}
              className="px-4 py-2.5 bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-white rounded-2xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Marino / Capitán</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {crew.map(member => (
              <div key={member.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#0e011f] flex items-center justify-center text-[#00C8D4] font-black text-sm">
                    <Anchor className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    member.status === "on_route"
                      ? "bg-blue-100 text-blue-800"
                      : member.status === "active"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {member.status === "on_route" ? "🌊 En Mar" : member.status === "active" ? "🟢 En Guardia" : "Libre"}
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-slate-900 text-sm">{member.fullName}</h4>
                  <p className="text-[11px] font-bold text-[#FF0096]">{member.roleLabel}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Lic: {member.licenseNumber}</p>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1 border-t border-slate-100 pt-2 font-medium">
                  <p>Experiencia: <strong>{member.experienceYears} años</strong></p>
                  <p>Contacto: <strong>{member.phone}</strong></p>
                  {member.assignedVesselName && (
                    <p className="text-[10px] text-slate-500 truncate">Asignado: {member.assignedVesselName}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: ROUTES & DESTINATIONS */}
      {activeTab === "routes" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div>
            <h3 className="text-xl font-black text-slate-900 font-serif">Catálogo de Rutas Náuticas de Venezuela</h3>
            <p className="text-xs text-slate-500">Destinos más solicitados por turistas para paseos en yate, catamarán y lanchas deportivas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INITIAL_ROUTES.map(rt => (
              <div key={rt.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/30">
                      {rt.region}
                    </span>
                    <h4 className="text-lg font-black text-slate-900 font-serif mt-1">{rt.name}</h4>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-xs font-black">
                    ⏱ {rt.durationHours} Horas
                  </span>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Puntos Destacados del Paseo</p>
                  <ul className="space-y-1 text-xs text-slate-600 font-medium">
                    {rt.highlights.map((hl, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-400">Consumo Estimado de Combustible</p>
                    <p className="font-black text-slate-800 flex items-center gap-1 mt-0.5">
                      <Fuel className="w-3.5 h-3.5 text-amber-600" /> ~{rt.fuelConsumptionEstGal} Galones Marinos
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowNewBookingModal(true);
                    }}
                    className="px-3 py-1.5 bg-[#FF0096] hover:bg-[#FF0096]/90 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                  >
                    Cotizar Ruta
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: NUEVO CHARTER / RESERVA */}
      {showNewBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-lg text-slate-900 font-serif">Nuevo Charter / Reserva Náutica</h3>
              <button onClick={() => setShowNewBookingModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Embarcación Asignada</label>
                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                  {vessels.map(v => (
                    <option key={v.id} value={v.id}>{v.name} (${v.fullDayRateUsd}/día - {v.maxPassengers} Pax)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre del Cliente / Titular</label>
                  <input type="text" placeholder="Ej: Roberto García" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teléfono / WhatsApp</label>
                  <input type="text" placeholder="+58 414 000 0000" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fecha de Salida</label>
                  <input type="date" defaultValue={new Date().toISOString().split("T")[0]} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hora Salida</label>
                  <input type="text" defaultValue="09:00 AM" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Modalidad</label>
                  <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                    <option value="full_day">Full Day (8h)</option>
                    <option value="sunset">Sunset (4h)</option>
                    <option value="overnight">Pernocta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ruta y Destino</label>
                <input type="text" placeholder="Ej: Cayo Sombrero ➔ Los Juanes" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowNewBookingModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  alert("🎉 ¡Charter programado con éxito!");
                  setShowNewBookingModal(false);
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white rounded-xl font-black text-xs cursor-pointer shadow-md"
              >
                Guardar Reserva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA EMBARCACIÓN */}
      {showNewVesselModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-lg text-slate-900 font-serif">Registrar Embarcación en la Flota</h3>
              <button onClick={() => setShowNewVesselModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre del Yate / Bote</label>
                  <input type="text" placeholder="Ej: Yate Azimut 48 'Sol Caribe'" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Matrícula INEA</label>
                  <input type="text" placeholder="Ej: ARSH-PE-8812" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Eslora (Pies)</label>
                  <input type="number" placeholder="45" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Pasajeros</label>
                  <input type="number" placeholder="14" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tarifa Full Day ($)</label>
                  <input type="number" placeholder="1200" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowNewVesselModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  alert("🎉 ¡Embarcación registrada en la flota de charter!");
                  setShowNewVesselModal(false);
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-white rounded-xl font-black text-xs cursor-pointer shadow-md"
              >
                Registrar Embarcación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
