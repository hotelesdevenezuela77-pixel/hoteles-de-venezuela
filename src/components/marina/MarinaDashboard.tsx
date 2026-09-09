import React, { useState } from "react";
import {
  Anchor, Ship, Compass, ShieldCheck, Waves, Fuel,
  CheckCircle2, Clock, Plus, RefreshCw, Building2,
  Wind, MapPin, Gauge, Radio, AlertTriangle
} from "lucide-react";
import type { MarinaSlip, NauticalVessel, MarinaZarpeDispatch, NauticalFuelSupply } from "../../types/marinaNautical";
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

export const MarinaDashboard: React.FC<MarinaDashboardProps> = ({
  establishment,
  onSwitchToTraditionalDashboard
}) => {
  const estName = establishment?.name || "Gran Marina & Club Náutico Los Roques";

  const [activeTab, setActiveTab] = useState<"amarres" | "zarpes" | "embarcaciones" | "combustible">("amarres");

  // Mock Slips
  const [slips, setSlips] = useState<MarinaSlip[]>([
    { id: "S1", slip_code: "Muelle A-01", dock_name: "Muelle Principal Norte", max_length_ft: 65, draft_depth_m: 3.5, status: "occupied", vessel_name: "Yate Sirena del Caribe", owner_name: "Cap. Juan D. Rivas", daily_rate_usd: 120, has_electricity_hookup: true, has_freshwater_hookup: true },
    { id: "S2", slip_code: "Muelle A-02", dock_name: "Muelle Principal Norte", max_length_ft: 50, draft_depth_m: 3.0, status: "vacant", daily_rate_usd: 90, has_electricity_hookup: true, has_freshwater_hookup: true },
    { id: "S3", slip_code: "Muelle B-05", dock_name: "Muelle Veleros & Catamaranes", max_length_ft: 45, draft_depth_m: 2.8, status: "occupied", vessel_name: "Catamarán Wind Voyager", owner_name: "Expediciones Roques DMC", daily_rate_usd: 80, has_electricity_hookup: true, has_freshwater_hookup: true },
    { id: "S4", slip_code: "Muelle B-06", dock_name: "Muelle Veleros & Catamaranes", max_length_ft: 40, draft_depth_m: 2.5, status: "reserved", vessel_name: "Velero Albatros", owner_name: "Club Náutico", daily_rate_usd: 70, has_electricity_hookup: true, has_freshwater_hookup: false },
    { id: "S5", slip_code: "Rampa Varadero 01", dock_name: "Área Técnica y Mantenimiento", max_length_ft: 35, draft_depth_m: 1.8, status: "maintenance", daily_rate_usd: 50, has_electricity_hookup: true, has_freshwater_hookup: true }
  ]);

  // Mock Dispatches (Zarpes)
  const [dispatches, setDispatches] = useState<MarinaZarpeDispatch[]>([
    {
      id: "ZRP-501",
      establishment_id: establishment?.id || 1,
      dispatch_number: "ZRP-2026-088",
      vessel_name: "Yate Sirena del Caribe",
      registration_number: "ARSH-FE-1290",
      captain_name: "Cap. Juan D. Rivas",
      pax_count: 8,
      destination_port: "Cayo Francisquí & Madrisquí",
      departure_time: "09:30",
      estimated_return_time: "17:30",
      status: "navegando",
      capitania_clearance_code: "INEA-LRQ-98211",
      created_at: "Hoy"
    },
    {
      id: "ZRP-502",
      establishment_id: establishment?.id || 1,
      dispatch_number: "ZRP-2026-089",
      vessel_name: "Catamarán Wind Voyager",
      registration_number: "ARSH-FE-3341",
      captain_name: "Cap. Carlos Méndez",
      pax_count: 14,
      destination_port: "Crasquí & Cayo de Agua",
      departure_time: "10:15",
      estimated_return_time: "18:00",
      status: "navegando",
      capitania_clearance_code: "INEA-LRQ-98212",
      created_at: "Hoy"
    }
  ]);

  // Mock Fuel Tanks
  const [fuelTanks] = useState<NauticalFuelSupply[]>([
    { id: "F1", fuel_type: "gasolina_marina", tank_capacity_liters: 20000, current_level_liters: 14200, price_per_liter_usd: 0.85, last_delivery_date: "Hace 2 días" },
    { id: "F2", fuel_type: "diesel_marino", tank_capacity_liters: 35000, current_level_liters: 28900, price_per_liter_usd: 0.70, last_delivery_date: "Hace 4 días" }
  ]);

  const occupiedSlips = slips.filter(s => s.status === "occupied").length;
  const slipOccupancyPct = Math.round((occupiedSlips / slips.length) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-[#00C8D4] selection:text-slate-950">
      {/* Hero Header Corporativo */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0e011f] via-[#0d1a2e] to-[#0e011f] border-b border-white/10 py-10 px-6 sm:px-10">
        <ConstellationBackground />
        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-slate-950 font-black shadow-md">
                  SUITE PARA MARINAS & CLUBES NÁUTICOS
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Compass className="w-3 h-3" /> Control de Amarres & Zarpes
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black font-serif text-white tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00C8D4] flex items-center justify-center text-slate-950 shadow-lg">
                  <Anchor className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span>{estName}</span>
              </h1>
              <p className="text-xs text-slate-300 font-medium max-w-2xl">
                Administración de muelles y slips, control de zarpes y arribos marítimos con Capitanía de Puerto, suministro de combustible y varadero.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs flex items-center gap-2 text-slate-300 backdrop-blur-md">
                <Radio className="w-4 h-4 text-[#00C8D4] animate-pulse" />
                <span>VHF Canal 16 / 68 Activo</span>
              </div>

              {onSwitchToTraditionalDashboard && (
                <button
                  onClick={onSwitchToTraditionalDashboard}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-90 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-white/20 hover:scale-[1.02]"
                >
                  <Building2 className="w-4 h-4 text-white" />
                  <span>⬅ Volver al Dashboard Matriz</span>
                </button>
              )}
            </div>
          </div>

          {/* KPIs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Ocupación de Slips / Muelles</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-white">{slipOccupancyPct}%</span>
                <span className="text-xs text-slate-400">({occupiedSlips}/{slips.length} amarrados)</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Embarcaciones Navegando</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#00C8D4]">{dispatches.filter(d => d.status === "navegando").length}</span>
                <span className="text-xs text-slate-400">zarpes activos</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Combustible Disponible</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-amber-400">43,100 L</span>
                <span className="text-xs text-slate-400">(Gasolina + Diesel)</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Condición Marítima</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-base font-black text-emerald-400">Mar 1-2 (Calma)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
          {[
            { id: "amarres", label: "Control de Muelles & Slips", icon: Anchor },
            { id: "zarpes", label: "Registro de Zarpes & Arribos", icon: Compass, badge: `${dispatches.length}` },
            { id: "combustible", label: "Estación de Combustible Náutico", icon: Fuel }
          ].map(tab => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 border ${
                  active
                    ? "bg-[#00C8D4] text-slate-950 border-white font-black shadow-lg shadow-[#00C8D4]/20"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${active ? "bg-slate-950 text-white" : "bg-[#FF0096] text-white"}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-6">
        {/* CONTROL DE AMARRES / SLIPS */}
        {activeTab === "amarres" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-white font-serif">Estado de Slips y Posiciones de Muelle</h3>
                <p className="text-xs text-slate-400">Supervisión de eslora, calado, tomas eléctricas y suministro de agua dulce.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slips.map(slip => {
                const isOccupied = slip.status === "occupied";
                const isVacant = slip.status === "vacant";
                const isReserved = slip.status === "reserved";
                return (
                  <div
                    key={slip.id}
                    className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
                      isOccupied
                        ? "bg-gradient-to-br from-[#0d1a2e] to-[#0e011f] border-[#00C8D4]/40 shadow-lg"
                        : isReserved
                        ? "bg-purple-950/20 border-purple-500/40"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#00C8D4] tracking-wider block">{slip.dock_name}</span>
                          <h4 className="text-xl font-black text-white">{slip.slip_code}</h4>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          isOccupied ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" :
                          isVacant ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                          "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}>
                          {slip.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-white/5 p-3 rounded-2xl">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block">Eslora Máx</span>
                          <span className="font-bold">{slip.max_length_ft} ft</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block">Calado</span>
                          <span className="font-bold">{slip.draft_depth_m} m</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block">Electricidad</span>
                          <span className="font-bold">{slip.has_electricity_hookup ? "✅ 220V / 110V" : "❌ No"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase block">Agua Dulce</span>
                          <span className="font-bold">{slip.has_freshwater_hookup ? "✅ Conexión" : "❌ No"}</span>
                        </div>
                      </div>
                    </div>

                    {isOccupied && (
                      <div className="pt-3 border-t border-white/10 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Embarcación:</span>
                          <span className="font-bold text-white">{slip.vessel_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Capitán / Dueño:</span>
                          <span className="font-bold text-[#00C8D4]">{slip.owner_name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* REGISTRO DE ZARPES */}
        {activeTab === "zarpes" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-white font-serif">Bitácora de Zarpes y Despachos Náuticos</h3>
                <p className="text-xs text-slate-400">Control de salidas de cortesía, charters y expediciones registradas.</p>
              </div>
            </div>

            <div className="space-y-4">
              {dispatches.map(dispatch => (
                <div key={dispatch.id} className="bg-gradient-to-r from-[#0e011f] via-[#0d1a2e] to-[#0e011f] border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#00C8D4] text-slate-950">
                        {dispatch.dispatch_number}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">INEA: {dispatch.capitania_clearance_code}</span>
                    </div>
                    <h4 className="text-xl font-black text-white font-serif">{dispatch.vessel_name} <span className="text-xs font-normal text-slate-400 font-sans">({dispatch.registration_number})</span></h4>
                    <p className="text-xs text-slate-300">
                      Capitán: <strong className="text-white">{dispatch.captain_name}</strong> · Pasajeros: <strong className="text-[#00C8D4]">{dispatch.pax_count} pax</strong> · Destino: <strong className="text-pink-300">{dispatch.destination_port}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-xs">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase block">Horario Zarpe / Retorno</span>
                      <span className="font-bold text-white font-mono">{dispatch.departure_time} ➔ {dispatch.estimated_return_time}</span>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase text-[10px]">
                      Navegando
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMBUSTIBLE NÁUTICO */}
        {activeTab === "combustible" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-white font-serif">Tanques de Combustible Marino</h3>
                <p className="text-xs text-slate-400">Niveles de inventario, despacho de surtidor y precios oficiales.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fuelTanks.map(tank => {
                const pct = Math.round((tank.current_level_liters / tank.tank_capacity_liters) * 100);
                return (
                  <div key={tank.id} className="p-6 rounded-3xl bg-gradient-to-br from-[#0e011f] to-[#1a0533] border border-white/10 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black uppercase text-[#00C8D4] block">Surtidor Muelle Central</span>
                        <h4 className="text-xl font-black text-white uppercase">{tank.fuel_type.replace("_", " ")}</h4>
                      </div>
                      <span className="text-lg font-black text-[#FF0096]">${tank.price_per_liter_usd} / Litro</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400">Nivel del Tanque</span>
                        <span className="text-white">{tank.current_level_liters.toLocaleString()} / {tank.tank_capacity_liters.toLocaleString()} Litros ({pct}%)</span>
                      </div>
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#00C8D4] to-emerald-400 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex justify-between pt-2 border-t border-white/5">
                      <span>Último reabastecimiento cisterna: {tank.last_delivery_date}</span>
                      <span className="text-emerald-400 font-bold">Operativo 24h</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
