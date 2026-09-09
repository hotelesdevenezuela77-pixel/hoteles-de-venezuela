import React, { useState } from "react";
import {
  Anchor, Ship, Compass, ShieldCheck, Waves, Fuel,
  CheckCircle2, Clock, Plus, RefreshCw, Building2,
  Wind, MapPin, Gauge, Radio, AlertTriangle, Zap, Droplets,
  DollarSign, Wrench, Search, Filter, Phone, Check, ChevronRight,
  TrendingUp, Calendar, FileText, ArrowLeft, LifeBuoy, Sparkles
} from "lucide-react";
import type {
  MarinaSlip,
  NauticalVessel,
  MarinaZarpeDispatch,
  NauticalFuelSupply,
  VaraderoServiceOrder,
  FuelDispatchLog,
  MarinaClubService
} from "../../types/marinaNautical";
import { ConstellationBackground } from "../ConstellationBackground";

interface MarinaDashboardProps {
  establishment?: {
    id: number;
    name: string;
    slug?: string;
    category_name?: string;
  } | null;
  onSwitchToTraditionalDashboard?: () => void;
}

const INITIAL_SLIPS: MarinaSlip[] = [
  {
    id: "S1",
    slip_code: "Muelle A-01 (VIP)",
    dock_name: "Muelle Principal Norte",
    storage_type: "wet_slip",
    max_length_ft: 75,
    max_beam_ft: 22,
    draft_depth_m: 3.8,
    status: "occupied",
    vessel_name: "Yate Sea Ray 65 'Azul Profundo'",
    vessel_matricula: "ARSH-PE-4912",
    vessel_type: "yate",
    owner_name: "Cap. Carlos Mendoza",
    owner_phone: "+58 414 332 9900",
    contract_type: "anual_socio",
    daily_rate_usd: 150,
    monthly_rate_usd: 1800,
    has_electricity_hookup: true,
    electricity_voltage: "380V_trifasico",
    has_freshwater_hookup: true,
    has_pumpout_service: true
  },
  {
    id: "S2",
    slip_code: "Muelle A-02",
    dock_name: "Muelle Principal Norte",
    storage_type: "wet_slip",
    max_length_ft: 55,
    max_beam_ft: 18,
    draft_depth_m: 3.2,
    status: "vacant",
    contract_type: "transito_diario",
    daily_rate_usd: 95,
    monthly_rate_usd: 1200,
    has_electricity_hookup: true,
    electricity_voltage: "220V",
    has_freshwater_hookup: true,
    has_pumpout_service: true
  },
  {
    id: "S3",
    slip_code: "Muelle B-05",
    dock_name: "Muelle Veleros & Catamaranes",
    storage_type: "wet_slip",
    max_length_ft: 50,
    max_beam_ft: 26,
    draft_depth_m: 2.8,
    status: "occupied",
    vessel_name: "Catamarán Lagoon 450 'Caribe Sol'",
    vessel_matricula: "LR-8820-NA",
    vessel_type: "catamaran",
    owner_name: "Expediciones Roques DMC",
    owner_phone: "+58 412 889 1122",
    contract_type: "mensual",
    daily_rate_usd: 110,
    monthly_rate_usd: 1450,
    has_electricity_hookup: true,
    electricity_voltage: "220V",
    has_freshwater_hookup: true,
    has_pumpout_service: false
  },
  {
    id: "S4",
    slip_code: "Muelle B-06",
    dock_name: "Muelle Veleros & Catamaranes",
    storage_type: "wet_slip",
    max_length_ft: 45,
    max_beam_ft: 15,
    draft_depth_m: 2.5,
    status: "reserved",
    vessel_name: "Velero Beneteau 42 'Viento Libre'",
    vessel_matricula: "TN-4401-VE",
    vessel_type: "velero",
    owner_name: "Dr. Arturo Benítez",
    contract_type: "transito_diario",
    daily_rate_usd: 75,
    monthly_rate_usd: 900,
    has_electricity_hookup: true,
    electricity_voltage: "110V",
    has_freshwater_hookup: true,
    has_pumpout_service: false
  },
  {
    id: "S5",
    slip_code: "Hangar Seco H-04",
    dock_name: "Marina Seca Dry Stack (Racks)",
    storage_type: "dry_stack",
    max_length_ft: 36,
    max_beam_ft: 11,
    draft_depth_m: 1.2,
    status: "occupied",
    vessel_name: "Lancha Deportiva 33ft 'Morrocoy Flyer'",
    vessel_matricula: "TN-9912-AJ",
    vessel_type: "lancha_rapida",
    owner_name: "Inversiones Marítimas C.A.",
    owner_phone: "+58 424 990 4455",
    contract_type: "anual_socio",
    daily_rate_usd: 60,
    monthly_rate_usd: 650,
    has_electricity_hookup: true,
    electricity_voltage: "110V",
    has_freshwater_hookup: true,
    has_pumpout_service: false
  },
  {
    id: "S6",
    slip_code: "Hangar Seco H-05",
    dock_name: "Marina Seca Dry Stack (Racks)",
    storage_type: "dry_stack",
    max_length_ft: 34,
    max_beam_ft: 10,
    draft_depth_m: 1.0,
    status: "vacant",
    contract_type: "mensual",
    daily_rate_usd: 55,
    monthly_rate_usd: 600,
    has_electricity_hookup: false,
    has_freshwater_hookup: true,
    has_pumpout_service: false
  },
  {
    id: "S7",
    slip_code: "Varadero Cuna 02",
    dock_name: "Astillero & Mantenimiento Travelift",
    storage_type: "varadero_yard",
    max_length_ft: 60,
    max_beam_ft: 20,
    draft_depth_m: 3.5,
    status: "maintenance",
    vessel_name: "Yate Hatteras 54 'El Conquistador'",
    vessel_matricula: "ARSH-7721",
    vessel_type: "yate",
    owner_name: "Armando Valera",
    contract_type: "transito_diario",
    daily_rate_usd: 130,
    has_electricity_hookup: true,
    electricity_voltage: "220V",
    has_freshwater_hookup: true,
    has_pumpout_service: true
  }
];

const INITIAL_VARADERO_ORDERS: VaraderoServiceOrder[] = [
  {
    id: "VAR-101",
    vessel_name: "Yate Hatteras 54 'El Conquistador'",
    matricula: "ARSH-7721",
    owner_name: "Armando Valera",
    service_type: "antifouling_paint",
    service_name: "Pintura de Fondo Antifouling (Patente Marina) + Pulitura de Casco",
    scheduled_date: "2026-09-10",
    status: "in_progress",
    travelift_tonnage: 38,
    total_usd: 1450,
    technician_assigned: "Ing. Naval Rafael Quintana"
  },
  {
    id: "VAR-102",
    vessel_name: "Lancha Boston Whaler 32 'Sea Hunter'",
    matricula: "TN-1200-BW",
    owner_name: "Mauricio Ledezma",
    service_type: "pressure_wash",
    service_name: "Izada con Travelift + Lavado de Casco a Presión + Mantenimiento de Pata",
    scheduled_date: "2026-09-11",
    status: "pending",
    travelift_tonnage: 12,
    total_usd: 380,
    technician_assigned: "Téc. Marino José Gregorio"
  }
];

const INITIAL_FUEL_TANKS: NauticalFuelSupply[] = [
  {
    id: "F1",
    fuel_type: "gasolina_marina",
    fuel_name: "Gasolina Marina 95 Octanos (Sin Plomo)",
    tank_capacity_liters: 25000,
    current_level_liters: 17400,
    price_per_liter_usd: 0.85,
    last_delivery_date: "Hace 2 días",
    dispensers_count: 4
  },
  {
    id: "F2",
    fuel_type: "diesel_marino",
    fuel_name: "Diésel Marino Filtrado (Ultra Low Sulfur)",
    tank_capacity_liters: 40000,
    current_level_liters: 31200,
    price_per_liter_usd: 0.70,
    last_delivery_date: "Hace 3 días",
    dispensers_count: 4
  }
];

const INITIAL_FUEL_LOGS: FuelDispatchLog[] = [
  {
    id: "DSP-301",
    vessel_name: "Yate Sea Ray 65 'Azul Profundo'",
    matricula: "ARSH-PE-4912",
    fuel_type: "diesel_marino",
    liters_dispensed: 850,
    price_per_liter_usd: 0.70,
    total_usd: 595,
    date_time: "Hoy 08:30 AM",
    dock_dispenser: "Surtidor Muelle Norte #2",
    slip_code: "Muelle A-01"
  },
  {
    id: "DSP-302",
    vessel_name: "Lancha Deportiva 33ft 'Morrocoy Flyer'",
    matricula: "TN-9912-AJ",
    fuel_type: "gasolina_marina",
    liters_dispensed: 320,
    price_per_liter_usd: 0.85,
    total_usd: 272,
    date_time: "Hoy 09:15 AM",
    dock_dispenser: "Surtidor Gasolina Muelle #1",
    slip_code: "Hangar Seco H-04"
  }
];

const INITIAL_DISPATCHES: MarinaZarpeDispatch[] = [
  {
    id: "ZRP-501",
    establishment_id: 1,
    dispatch_number: "ZRP-2026-088",
    vessel_name: "Yate Sirena del Caribe",
    registration_number: "ARSH-FE-1290",
    captain_name: "Cap. Juan D. Rivas",
    pax_count: 8,
    destination_port: "Cayo Francisquí & Madrisquí",
    departure_time: "09:30 AM",
    estimated_return_time: "05:30 PM",
    status: "navegando",
    capitania_clearance_code: "INEA-LRQ-98211",
    created_at: "Hoy"
  },
  {
    id: "ZRP-502",
    establishment_id: 1,
    dispatch_number: "ZRP-2026-089",
    vessel_name: "Catamarán Wind Voyager",
    registration_number: "ARSH-FE-3341",
    captain_name: "Cap. Carlos Méndez",
    pax_count: 14,
    destination_port: "Crasquí & Cayo de Agua",
    departure_time: "10:15 AM",
    estimated_return_time: "06:00 PM",
    status: "navegando",
    capitania_clearance_code: "INEA-LRQ-98212",
    created_at: "Hoy"
  }
];

const MARINA_CLUB_SERVICES: MarinaClubService[] = [
  {
    id: "srv-1",
    name: "Suministro de Hielo en Cubos y Bloques para Cavas",
    category: "dockside",
    description: "Fábrica de hielo grado alimenticio disponible 24/7 para cavas y embarcaciones.",
    available: true,
    price_info: "$3.50 / bolsa 10kg · $8.00 / bloque 25kg"
  },
  {
    id: "srv-2",
    name: "Servicio de Varadero & Travelift (Izada y Botadura 50T)",
    category: "shipyard",
    description: "Grúa pórtico Travelift para izadas de inspección de casco, limpieza y aplicación de patente.",
    available: true,
    price_info: "$8.00 por pie de eslora (Izada + Botadura)"
  },
  {
    id: "srv-3",
    name: "Capitanes & Crew Lounge Climatizado",
    category: "clubhouse",
    description: "Salón VIP para capitanes y marineros con duchas de agua caliente, vestidores, WiFi Pro y lavandería.",
    available: true,
    price_info: "Incluido para socios y tránsitos"
  },
  {
    id: "srv-4",
    name: "Tienda Náutica / Ship Chandler & Pesca",
    category: "dockside",
    description: "Venta de cabos marinos, defensas, chalecos salvavidas certificados, bengalas y lubricantes náuticos.",
    available: true,
    price_info: "Precios de catálogo oficial"
  },
  {
    id: "srv-5",
    name: "Muelle Bar & Grill / Restaurante Náutico",
    category: "clubhouse",
    description: "Gastronomía marina, mariscos frescos, coctelería y atención directa al muelle / amarre.",
    available: true,
    price_info: "A la carta con descuento para socios"
  },
  {
    id: "srv-6",
    name: "Vigilancia Náutica 24/7 & Cámaras Térmicas",
    category: "security",
    description: "Monitoreo constante del canal de acceso, guardias en pantalanes y sistema de alarma marina.",
    available: true,
    price_info: "Seguridad integrada en cuota de atraque"
  }
];

export const MarinaDashboard: React.FC<MarinaDashboardProps> = ({
  establishment,
  onSwitchToTraditionalDashboard
}) => {
  const estName = establishment?.name || "Gran Marina & Club Náutico Los Roques";

  const [activeTab, setActiveTab] = useState<"amarres" | "varadero" | "combustible" | "vts_capitania" | "servicios_club" | "cotizador">("amarres");
  const [slips, setSlips] = useState<MarinaSlip[]>(INITIAL_SLIPS);
  const [filterStorageType, setFilterStorageType] = useState<"all" | "wet_slip" | "dry_stack" | "varadero_yard">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "vacant" | "occupied" | "reserved" | "maintenance">("all");
  const [dispatches, setDispatches] = useState<MarinaZarpeDispatch[]>(INITIAL_DISPATCHES);
  const [fuelTanks] = useState<NauticalFuelSupply[]>(INITIAL_FUEL_TANKS);
  const [fuelLogs] = useState<FuelDispatchLog[]>(INITIAL_FUEL_LOGS);
  const [varaderoOrders, setVaraderoOrders] = useState<VaraderoServiceOrder[]>(INITIAL_VARADERO_ORDERS);

  // Quote Calculator State
  const [calcLengthFt, setCalcLengthFt] = useState<number>(45);
  const [calcStayType, setCalcStayType] = useState<"daily" | "monthly" | "annual">("monthly");
  const [calcStorageType, setCalcStorageType] = useState<"wet_slip" | "dry_stack">("wet_slip");
  const [calcIncludeElectricity, setCalcIncludeElectricity] = useState<boolean>(true);

  // Stats calculation
  const totalSlips = slips.length;
  const occupiedSlips = slips.filter(s => s.status === "occupied").length;
  const vacantSlips = slips.filter(s => s.status === "vacant").length;
  const occupancyPct = Math.round((occupiedSlips / totalSlips) * 100);
  const totalFuelLiters = fuelTanks.reduce((sum, t) => sum + t.current_level_liters, 0);

  const toggleSlipStatus = (slipId: string) => {
    setSlips(prev => prev.map(s => {
      if (s.id === slipId) {
        const nextStatus = s.status === "vacant" ? "occupied" : s.status === "occupied" ? "reserved" : "vacant";
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  // Quote calculation logic
  const baseRatePerFtMonth = calcStorageType === "wet_slip" ? 28 : 18; // $/ft/month
  const baseRatePerFtDay = calcStorageType === "wet_slip" ? 2.2 : 1.5; // $/ft/day
  let calculatedQuoteUsd = 0;
  if (calcStayType === "daily") {
    calculatedQuoteUsd = Math.round(calcLengthFt * baseRatePerFtDay * 7); // 1 semana aprox
  } else if (calcStayType === "monthly") {
    calculatedQuoteUsd = Math.round(calcLengthFt * baseRatePerFtMonth + (calcIncludeElectricity ? 120 : 0));
  } else {
    calculatedQuoteUsd = Math.round(calcLengthFt * baseRatePerFtMonth * 12 * 0.85); // 15% desc anual
  }

  const filteredSlips = slips.filter(s => {
    const matchesStorage = filterStorageType === "all" || s.storage_type === filterStorageType;
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    return matchesStorage && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-[#00C8D4] selection:text-slate-950 font-sans">
      {/* Hero Header Corporativo */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0e011f] via-[#0d1a2e] to-[#0e011f] border-b border-white/10 py-8 px-6 sm:px-10">
        <ConstellationBackground />
        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-slate-950 shadow-md">
                  SUITE PARA MARINAS, MUELLES & CLUBES NÁUTICOS
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Compass className="w-3 h-3" /> Control de Pantalanes, Varadero & Bunkering
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black font-serif text-white tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00C8D4] flex items-center justify-center text-slate-950 shadow-lg">
                  <Anchor className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span>{estName}</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-300 font-medium max-w-3xl leading-relaxed">
                Consola integral para administración de puestos de amarre (Wet Slips), hangares de marina seca, operaciones de varadero con Travelift, suministro de combustible marino (Bunkering) y torre de control VTS con Capitanía de Puertos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs flex items-center gap-2 text-slate-300 backdrop-blur-md">
                <Radio className="w-4 h-4 text-[#00C8D4] animate-pulse" />
                <span>VHF Canal 16 & 68 Activos</span>
              </div>

              {onSwitchToTraditionalDashboard && (
                <button
                  onClick={onSwitchToTraditionalDashboard}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-90 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-white/20 hover:scale-[1.02]"
                >
                  <Building2 className="w-4 h-4 text-white" />
                  <span>Volver al Dashboard Matriz</span>
                </button>
              )}
            </div>
          </div>

          {/* KPIs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Ocupación de Amarres / Slips</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-white">{occupancyPct}%</span>
                <span className="text-xs text-slate-400">({occupiedSlips}/{totalSlips} amarrados)</span>
              </div>
              <p className="text-[10px] text-emerald-400 font-bold mt-1">● {vacantSlips} puestos disponibles</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Embarcaciones Navegando</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#00C8D4]">{dispatches.filter(d => d.status === "navegando").length}</span>
                <span className="text-xs text-slate-400">zarpes activos</span>
              </div>
              <p className="text-[10px] text-cyan-300 font-semibold mt-1">Retornos previstos 17:30 - 18:30</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Combustible en Tanques</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-amber-400">{totalFuelLiters.toLocaleString()} L</span>
                <span className="text-xs text-slate-400">disponibles</span>
              </div>
              <p className="text-[10px] text-amber-300/80 font-semibold mt-1">Surtidores 100% operativos</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Varadero & Astillero</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#FF0096]">{varaderoOrders.length}</span>
                <span className="text-xs text-slate-400">órdenes en curso</span>
              </div>
              <p className="text-[10px] text-pink-300 font-semibold mt-1">Travelift 50T disponible</p>
            </div>
          </div>

          {/* Tab Navigation Cluster */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-4 border-t border-white/10">
            {[
              { id: "amarres", label: `Pantalanes & Slips (${slips.length})`, icon: Anchor },
              { id: "varadero", label: `Varadero & Travelift (${varaderoOrders.length})`, icon: Wrench },
              { id: "combustible", label: "Combustible Marino", icon: Fuel },
              { id: "vts_capitania", label: `Torre VTS & INEA (${dispatches.length})`, icon: Radio },
              { id: "servicios_club", label: `Servicios & Club (${MARINA_CLUB_SERVICES.length})`, icon: Sparkles },
              { id: "cotizador", label: "Cotizador de Amarre", icon: DollarSign }
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
      </div>

      {/* BODY CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-8">
        {/* TAB 1: AMARRES Y PANTALANES */}
        {activeTab === "amarres" && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            {/* Filter Bar */}
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-2">
                  <Filter className="w-3.5 h-3.5 text-[#00C8D4]" /> Filtrar Espacios:
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {(["all", "wet_slip", "dry_stack", "varadero_yard"] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterStorageType(type)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        filterStorageType === type
                          ? "bg-[#00C8D4] text-slate-950 font-black shadow-sm"
                          : "bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {type === "all" ? "Todos los Espacios" : type === "wet_slip" ? "Pantalanes / Wet Slips" : type === "dry_stack" ? "Marina Seca Racks" : "Astillero / Cunas"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {(["all", "vacant", "occupied", "reserved", "maintenance"] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      filterStatus === st
                        ? "bg-[#FF0096] text-white font-black"
                        : "bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    {st === "all" ? "Estado: Todos" : st === "vacant" ? "Disponibles" : st === "occupied" ? "Ocupados" : st === "reserved" ? "Reservados" : "Varados"}
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix of Slips */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSlips.map(slip => (
                <div
                  key={slip.id}
                  className={`border rounded-3xl p-6 transition-all flex flex-col justify-between ${
                    slip.status === "occupied"
                      ? "bg-slate-900/90 border-cyan-500/30 shadow-lg shadow-cyan-950/20"
                      : slip.status === "vacant"
                      ? "bg-slate-900/70 border-emerald-500/30 hover:border-emerald-500/60"
                      : slip.status === "reserved"
                      ? "bg-slate-900/70 border-purple-500/30"
                      : "bg-slate-900/70 border-amber-500/30"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header Puesto */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-white font-mono">{slip.slip_code}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/10 text-slate-300">
                            {slip.storage_type === "wet_slip" ? "Muelle Húmedo" : slip.storage_type === "dry_stack" ? "Marina Seca" : "Varadero"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-semibold">{slip.dock_name}</p>
                      </div>

                      <button
                        onClick={() => toggleSlipStatus(slip.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer border shadow-sm transition-all ${
                          slip.status === "occupied"
                            ? "bg-cyan-500/20 text-[#00C8D4] border-cyan-500/40"
                            : slip.status === "vacant"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : slip.status === "reserved"
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                        }`}
                        title="Hacer clic para alternar estado"
                      >
                        {slip.status === "occupied" ? "● Ocupado" : slip.status === "vacant" ? "○ Libre" : slip.status === "reserved" ? "⏳ Reservado" : "🔧 Varado"}
                      </button>
                    </div>

                    {/* Dimensiones Técnicas */}
                    <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-black/30 rounded-2xl border border-white/5 text-center">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Eslora Max</span>
                        <span className="text-xs font-black text-white">{slip.max_length_ft} ft</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Manga Max</span>
                        <span className="text-xs font-black text-white">{slip.max_beam_ft || 18} ft</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Calado</span>
                        <span className="text-xs font-black text-[#00C8D4]">{slip.draft_depth_m} m</span>
                      </div>
                    </div>

                    {/* Embarcación Amarrada (si aplica) */}
                    {slip.status === "occupied" && (
                      <div className="p-3.5 bg-gradient-to-r from-cyan-950/40 to-slate-900 rounded-2xl border border-cyan-500/20 space-y-1 text-xs">
                        <span className="text-[9px] font-black uppercase text-[#00C8D4] tracking-wider block">Embarcación en Puesto:</span>
                        <strong className="text-white block text-sm">{slip.vessel_name}</strong>
                        <p className="text-slate-300 font-mono text-[10px]">Matrícula: {slip.vessel_matricula}</p>
                        <p className="text-slate-400 text-[11px]">Armador / Capitán: <span className="text-white font-medium">{slip.owner_name}</span> ({slip.owner_phone})</p>
                      </div>
                    )}

                    {/* Conexiones de Pedestal */}
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Pedestal en Muelle:</span>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                          slip.has_electricity_hookup ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" : "bg-white/5 text-slate-500"
                        }`}>
                          <Zap className="w-3 h-3" /> {slip.electricity_voltage || "110V/220V"}
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                          slip.has_freshwater_hookup ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30" : "bg-white/5 text-slate-500"
                        }`}>
                          <Droplets className="w-3 h-3" /> Agua Dulce Continua
                        </span>
                        {slip.has_pumpout_service && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                            <Waves className="w-3 h-3" /> Pump-out
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tarifas y Contrato */}
                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Tarifa de Atraque:</span>
                      <strong className="text-white font-black text-sm">${slip.daily_rate_usd} <span className="text-xs font-normal text-slate-400">/día</span></strong>
                      {slip.monthly_rate_usd && <span className="text-[10px] text-slate-400 block">${slip.monthly_rate_usd} /mes</span>}
                    </div>

                    <button
                      onClick={() => alert(`Gestionar contrato y asignación para puesto ${slip.slip_code}`)}
                      className="px-3.5 py-2 bg-white/10 hover:bg-[#00C8D4] hover:text-slate-950 text-white rounded-xl font-black text-xs transition-all cursor-pointer border border-white/10"
                    >
                      Gestionar Puesto
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: VARADERO & TRAVELIFT */}
        {activeTab === "varadero" && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-white font-serif">Astillero, Varadero & Operaciones Travelift</h3>
                <p className="text-xs text-slate-300">Izadas con grúa pórtico de 50 Toneladas, pintura de fondo antifouling, lavado a presión y mecánica naval.</p>
              </div>

              <button
                onClick={() => alert("Nueva orden de servicio de varadero")}
                className="px-4 py-2.5 bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white rounded-2xl text-xs font-black shadow-lg flex items-center gap-2 cursor-pointer hover:scale-[1.02] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Programar Izada / Varada</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Órdenes de Mantenimiento Activas */}
              <div className="lg:col-span-2 space-y-4">
                {varaderoOrders.map(ord => (
                  <div key={ord.id} className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-md space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-[#FF0096]/20 text-[#FF0096] border border-[#FF0096]/30">
                            {ord.id}
                          </span>
                          <strong className="text-base text-white font-serif">{ord.vessel_name}</strong>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 font-mono">Matrícula: {ord.matricula} · Armador: {ord.owner_name}</p>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        ord.status === "in_progress" ? "bg-cyan-500/20 text-[#00C8D4] border border-cyan-500/40 animate-pulse" : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      }`}>
                        {ord.status === "in_progress" ? "🔧 Trabajo en Curso" : "⏳ Programado"}
                      </span>
                    </div>

                    <div className="p-3.5 bg-black/30 rounded-2xl border border-white/5 text-xs text-slate-300 space-y-1">
                      <span className="text-[10px] font-black uppercase text-[#00C8D4] block">Servicio Solicitado:</span>
                      <p className="text-white font-medium">{ord.service_name}</p>
                      <p className="text-slate-400 text-[11px]">Responsable: <strong className="text-slate-200">{ord.technician_assigned}</strong> · Capacidad Travelift: <strong>{ord.travelift_tonnage} T</strong></p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Fecha Programada:</span>
                        <span className="text-slate-200 font-bold">{ord.scheduled_date}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Monto Total USD:</span>
                        <strong className="text-base font-black text-[#FF0096]">${ord.total_usd}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Especificaciones Técnicas del Astillero */}
              <div className="bg-gradient-to-br from-[#0e011f] to-[#1a0533] border border-white/10 rounded-3xl p-6 text-white space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#00C8D4] flex items-center justify-center text-slate-950 font-black">
                  <Wrench className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h4 className="text-lg font-black font-serif">Equipamiento Técnico del Varadero</h4>
                <div className="space-y-2.5 text-xs text-slate-300 border-t border-white/10 pt-3">
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00C8D4] shrink-0" />
                    <span><strong>Grúa Travelift Marine 50T</strong> (Manga máx 22ft)</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00C8D4] shrink-0" />
                    <span><strong>Montacargas Forklift Marino 12T</strong> para racks secos</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00C8D4] shrink-0" />
                    <span><strong>Rampa de botadura rápida</strong> de hormigón estriado</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00C8D4] shrink-0" />
                    <span><strong>Lavacasco Kärcher Industrial 500 Bar</strong></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00C8D4] shrink-0" />
                    <span>Cabina de pintura y taller de fibra de vidrio</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COMBUSTIBLE MARINO (BUNKERING) */}
        {activeTab === "combustible" && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fuelTanks.map(tank => {
                const fillPct = Math.round((tank.current_level_liters / tank.tank_capacity_liters) * 100);
                return (
                  <div key={tank.id} className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-md space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                          <Fuel className="w-6 h-6 stroke-[2.5]" />
                        </div>
                        <div>
                          <h4 className="text-base font-black text-white font-serif">{tank.fuel_name}</h4>
                          <p className="text-xs text-slate-400 font-mono">Tanque {tank.id} · {tank.dispensers_count} Surtidores en Muelle</p>
                        </div>
                      </div>
                      <span className="text-lg font-black text-[#00C8D4]">${tank.price_per_liter_usd} <span className="text-xs text-slate-400">/L</span></span>
                    </div>

                    {/* Progress Level Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400">Nivel de Almacenamiento:</span>
                        <span className="text-white">{tank.current_level_liters.toLocaleString()} L / {tank.tank_capacity_liters.toLocaleString()} L ({fillPct}%)</span>
                      </div>
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            fillPct > 40 ? "bg-gradient-to-r from-emerald-500 to-[#00C8D4]" : "bg-gradient-to-r from-amber-500 to-red-500"
                          }`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
                      <span>Última recarga: {tank.last_delivery_date}</span>
                      <button
                        onClick={() => alert(`Registrar despacho de ${tank.fuel_name}`)}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl cursor-pointer transition-all"
                      >
                        Despachar a Muelle
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Historial de Despachos Recientes */}
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-sm space-y-4">
              <h4 className="text-lg font-black text-white font-serif">Últimos Despachos de Combustible en Muelle</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/30 text-[10px] font-black uppercase text-slate-400">
                    <tr>
                      <th className="p-3 pl-4">Código / Hora</th>
                      <th className="p-3">Embarcación & Matrícula</th>
                      <th className="p-3">Combustible</th>
                      <th className="p-3">Litros</th>
                      <th className="p-3">Total USD</th>
                      <th className="p-3 pr-4">Surtidor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {fuelLogs.map(log => (
                      <tr key={log.id} className="hover:bg-white/5">
                        <td className="p-3 pl-4 font-mono font-bold text-white">{log.id}<span className="block text-[10px] text-slate-400">{log.date_time}</span></td>
                        <td className="p-3 font-bold text-white">{log.vessel_name}<span className="block text-[10px] text-slate-400 font-mono">{log.matricula}</span></td>
                        <td className="p-3 text-cyan-300">{log.fuel_type === "diesel_marino" ? "Diésel Marino" : "Gasolina 95"}</td>
                        <td className="p-3 font-bold text-white">{log.liters_dispensed} L</td>
                        <td className="p-3 font-black text-[#FF0096] text-sm">${log.total_usd}</td>
                        <td className="p-3 pr-4 text-slate-400">{log.dock_dispenser}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TORRE VTS & CAPITANÍA */}
        {activeTab === "vts_capitania" && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bitácora de Despachos y Arribos */}
              <div className="lg:col-span-2 bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-xl font-black text-white font-serif">Control de Tráfico Marítimo (Zarpes & Arribos)</h3>
                    <p className="text-xs text-slate-400">Despachos autorizados con Capitanía de Puerto e INEA.</p>
                  </div>
                  <button
                    onClick={() => alert("Registrar nuevo zarpe / arribo")}
                    className="px-3.5 py-2 bg-[#00C8D4] text-slate-950 font-black rounded-xl text-xs cursor-pointer hover:scale-[1.02] transition-all"
                  >
                    + Registrar Zarpe
                  </button>
                </div>

                <div className="space-y-3">
                  {dispatches.map(dsp => (
                    <div key={dsp.id} className="p-4 bg-black/30 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-[#00C8D4]">{dsp.dispatch_number}</span>
                          <strong className="text-white text-sm">{dsp.vessel_name}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">({dsp.registration_number})</span>
                        </div>
                        <p className="text-slate-300">Capitán: <strong className="text-white">{dsp.captain_name}</strong> · {dsp.pax_count} Pax · Destino: <span className="text-cyan-300">{dsp.destination_port}</span></p>
                        <p className="text-[10px] text-slate-400">Salida: {dsp.departure_time} · Retorno Estimado: {dsp.estimated_return_time} · Despacho: {dsp.capitania_clearance_code}</p>
                      </div>

                      <span className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                        🌊 En Navegación
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estación Meteorológica en Vivo */}
              <div className="bg-gradient-to-br from-[#0e011f] to-[#1a0533] border border-white/10 rounded-3xl p-6 text-white space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00C8D4] flex items-center justify-center text-slate-950">
                    <Wind className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm">Estación Meteorológica Marina</h4>
                    <p className="text-[10px] text-slate-300">Condiciones de Navegación en Vivo</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Viento</span>
                    <strong className="text-lg text-white font-black">14 Nudos</strong>
                    <span className="text-[10px] text-emerald-400 block">Dirección ENE</span>
                  </div>
                  <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Marea</span>
                    <strong className="text-lg text-[#00C8D4] font-black">+0.65 m</strong>
                    <span className="text-[10px] text-slate-300 block">Pleamar 15:40</span>
                  </div>
                  <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Altura Olas</span>
                    <strong className="text-lg text-white font-black">0.8 m</strong>
                    <span className="text-[10px] text-emerald-400 block">Mar Rizada / Buena</span>
                  </div>
                  <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Barómetro</span>
                    <strong className="text-lg text-amber-300 font-black">1014 hPa</strong>
                    <span className="text-[10px] text-slate-300 block">Estable</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SERVICIOS Y CLUB HOUSE */}
        {activeTab === "servicios_club" && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div>
              <h3 className="text-2xl font-black text-white font-serif">Servicios para Armadores, Capitanes y Socios</h3>
              <p className="text-xs text-slate-300">Comodidades de muelle, abastecimiento de hielo, lounge de tripulaciones, tienda náutica y seguridad.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MARINA_CLUB_SERVICES.map(srv => (
                <div key={srv.id} className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-md space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {srv.category === "bunkering" ? "Combustible" : srv.category === "shipyard" ? "Astillero" : srv.category === "dockside" ? "Muelle" : srv.category === "clubhouse" ? "Club House" : "Seguridad"}
                      </span>
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Activo
                      </span>
                    </div>

                    <h4 className="text-base font-black text-white font-serif">{srv.name}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{srv.description}</p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Tarifa Oficial:</span>
                      <strong className="text-xs font-black text-[#FF0096]">{srv.price_info}</strong>
                    </div>
                    <button
                      onClick={() => alert(`Solicitud de servicio: ${srv.name}`)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-[#00C8D4] hover:text-slate-950 text-white font-black text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Solicitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: COTIZADOR DE AMARRE EN VIVO */}
        {activeTab === "cotizador" && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-2 pb-4 border-b border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF0096] to-[#9B00CC] flex items-center justify-center text-white mx-auto shadow-lg">
                  <DollarSign className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h3 className="text-2xl font-black text-white font-serif">Calculadora Oficial de Amarre & Marina Seca</h3>
                <p className="text-xs text-slate-300 max-w-lg mx-auto">
                  Genera una cotización instantánea de estadía para yates, veleros o lanchas deportivas según eslora y tipo de resguardo.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">Eslora de la Embarcación: <strong className="text-[#00C8D4] text-sm">{calcLengthFt} Pies (ft)</strong></label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={calcLengthFt}
                    onChange={(e) => setCalcLengthFt(Number(e.target.value))}
                    className="w-full accent-[#00C8D4] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>20 ft (Lancha)</span>
                    <span>50 ft (Yate Mediano)</span>
                    <span>100 ft (Mega Yate)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1.5">Tipo de Espacio</label>
                    <select
                      value={calcStorageType}
                      onChange={(e) => setCalcStorageType(e.target.value as any)}
                      className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-bold cursor-pointer focus:ring-1 focus:ring-[#00C8D4]"
                    >
                      <option value="wet_slip">Pantalán Húmedo (Muelle / Wet Slip)</option>
                      <option value="dry_stack">Marina Seca Techada (Racks Verticales)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1.5">Modalidad de Contrato</label>
                    <select
                      value={calcStayType}
                      onChange={(e) => setCalcStayType(e.target.value as any)}
                      className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-bold cursor-pointer focus:ring-1 focus:ring-[#00C8D4]"
                    >
                      <option value="daily">Tránsito Temporal (Semana)</option>
                      <option value="monthly">Contrato Mensual</option>
                      <option value="annual">Contrato Anual de Socio (15% Descuento)</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={calcIncludeElectricity}
                      onChange={(e) => setCalcIncludeElectricity(e.target.checked)}
                      className="accent-[#00C8D4] w-4 h-4 rounded"
                    />
                    <span className="font-bold text-slate-200">Incluir Conexión de Electricidad & Agua Dulce en Muelle</span>
                  </label>
                </div>
              </div>

              {/* Resultado de Cotización */}
              <div className="p-6 bg-gradient-to-r from-cyan-950/60 to-purple-950/60 border border-cyan-500/30 rounded-3xl text-center space-y-2">
                <span className="text-[10px] font-black uppercase text-[#00C8D4] tracking-widest block">Tarifa Estimada de Atraque</span>
                <p className="text-4xl font-black text-white">${calculatedQuoteUsd.toLocaleString()} <span className="text-sm text-slate-300 font-normal">USD {calcStayType === "annual" ? "/ año" : calcStayType === "monthly" ? "/ mes" : "/ semana"}</span></p>
                <p className="text-xs text-slate-300 font-medium">Incluye vigilancia náutica 24/7, acceso a muelle, bombas de agua dulce y uso de Capitanes Lounge.</p>
                <button
                  onClick={() => alert(`🎉 Cotización enviada a recepción de marina para embarcación de ${calcLengthFt} ft.`)}
                  className="mt-3 px-6 py-3 bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-slate-950 font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
                >
                  Confirmar Reserva de Atraque
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
