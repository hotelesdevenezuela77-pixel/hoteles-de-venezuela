import React, { useState, useEffect } from "react";
import { Waves, Ship, ShieldCheck, AlertCircle, Clock, Anchor, Users, LifeBuoy, RefreshCw, Power } from "lucide-react";
import type { ParkPool, ParkBoat, SaturationLevel } from "../../types/parkComplex";

interface ParkAttractionsMonitorProps {
  pools: ParkPool[];
  boats: ParkBoat[];
  onUpdatePool: (poolId: string, updates: Partial<ParkPool>) => void;
  onDispatchBoat: (boatId: string) => void;
  onDockBoat: (boatId: string) => void;
}

export const ParkAttractionsMonitor: React.FC<ParkAttractionsMonitorProps> = ({
  pools,
  boats,
  onUpdatePool,
  onDispatchBoat,
  onDockBoat
}) => {
  const [activeTab, setActiveTab] = useState<"piscinas" | "botes">("piscinas");
  const [now, setNow] = useState<number>(Date.now());

  // Timer tick cada 10 segundos para actualizar tiempo de botes navegando
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const getSaturationBadge = (level: SaturationLevel) => {
    switch (level) {
      case "low":
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold uppercase">Saturación Baja</span>;
      case "medium":
        return <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-extrabold uppercase">Saturación Media</span>;
      case "high":
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold uppercase">Saturación Alta</span>;
      case "full":
        return <span className="px-2.5 py-1 rounded-full bg-red-600 text-white border border-red-400 text-[10px] font-extrabold uppercase animate-pulse">¡Aforo Máximo!</span>;
    }
  };

  const calculateSailingMinutes = (departureTime?: string) => {
    if (!departureTime) return 0;
    const dep = new Date(departureTime).getTime();
    const diffMs = now - dep;
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  return (
    <div className="rounded-3xl bg-[#1a0533]/80 border border-white/10 p-6 shadow-2xl backdrop-blur-md mb-8">
      
      {/* Header Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-5 mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#00C8D4] flex items-center justify-center shadow-lg shadow-[#00C8D4]/20">
            {activeTab === "piscinas" ? (
              <Waves className="w-6 h-6 text-white" />
            ) : (
              <Ship className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Monitor de Atracciones & Seguridad Náutica</h3>
            <p className="text-xs text-slate-400">Control operativo en vivo de las 5 piscinas y la flota del lago</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab("piscinas")}
            className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 ${
              activeTab === "piscinas"
                ? "bg-[#00C8D4] text-white shadow-lg shadow-[#00C8D4]/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Waves className="w-4 h-4" />
            <span>5 PISCINAS ({pools.filter(p => p.status === "open").length} OPERATIVAS)</span>
          </button>

          <button
            onClick={() => setActiveTab("botes")}
            className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 ${
              activeTab === "botes"
                ? "bg-[#FF0096] text-white shadow-lg shadow-[#FF0096]/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Ship className="w-4 h-4" />
            <span>FLOTA LAGO DE BOTES ({boats.filter(b => b.status === "sailing").length} NAVEGANDO)</span>
          </button>
        </div>
      </div>

      {/* VISTA 1: MONITOR DE LAS 5 PISCINAS */}
      {activeTab === "piscinas" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pools.map((pool) => {
            const occPercentage = Math.round((pool.bathers_count / pool.max_capacity) * 100);

            return (
              <div
                key={pool.id}
                className={`rounded-2xl border p-5 transition-all ${
                  pool.status === "closed"
                    ? "bg-slate-950/60 border-red-500/30 opacity-75"
                    : "bg-slate-900/70 border-white/10 hover:border-[#00C8D4]/40"
                }`}
              >
                {/* Status bar */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-[#00C8D4] uppercase">{pool.pool_code}</span>
                  {getSaturationBadge(pool.saturation_level)}
                </div>

                <h4 className="font-bold text-white text-sm mb-2">{pool.name}</h4>

                {/* Bathers count */}
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs text-slate-400">Bañistas Actuales:</span>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-xl font-extrabold text-white">{pool.bathers_count}</span>
                    <span className="text-xs text-slate-400">/ {pool.max_capacity}</span>
                  </div>
                </div>

                {/* Saturation progress bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full transition-all duration-500 ${
                      occPercentage > 90
                        ? "bg-red-500"
                        : occPercentage > 70
                        ? "bg-amber-400"
                        : "bg-[#00C8D4]"
                    }`}
                    style={{ width: `${Math.min(100, occPercentage)}%` }}
                  />
                </div>

                {/* Lifeguard info */}
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-xs mb-4">
                  <span className="text-slate-400 flex items-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 mr-1.5 inline" /> Salvavidas:
                  </span>
                  <span className="text-white font-bold">{pool.lifeguard_name}</span>
                </div>

                {/* Quick actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      onUpdatePool(pool.id, {
                        bathers_count: Math.min(pool.max_capacity, pool.bathers_count + 10),
                        saturation_level:
                          pool.bathers_count + 10 >= pool.max_capacity * 0.85
                            ? "high"
                            : pool.bathers_count + 10 >= pool.max_capacity * 0.5
                            ? "medium"
                            : "low"
                      })
                    }
                    disabled={pool.status === "closed"}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] transition-all disabled:opacity-50"
                  >
                    +10 Bañistas
                  </button>

                  <button
                    onClick={() =>
                      onUpdatePool(pool.id, {
                        status: pool.status === "open" ? "closed" : "open"
                      })
                    }
                    className={`px-3 py-2 rounded-xl font-bold text-[11px] transition-all flex items-center space-x-1 ${
                      pool.status === "open"
                        ? "bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900/60"
                        : "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60"
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{pool.status === "open" ? "Cerrar" : "Abrir"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VISTA 2: GESTIÓN NÁUTICA DEL LAGO DE BOTES */}
      {activeTab === "botes" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boats.map((boat) => {
              const sailingMins = calculateSailingMinutes(boat.departure_time);

              return (
                <div
                  key={boat.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    boat.status === "sailing"
                      ? "bg-sky-950/40 border-sky-500/40 shadow-lg shadow-sky-900/20"
                      : boat.status === "maintenance"
                      ? "bg-slate-950/60 border-amber-500/30 opacity-75"
                      : "bg-slate-900/70 border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-[#FF0096]">{boat.boat_code}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      boat.status === "sailing"
                        ? "bg-sky-500 text-white animate-pulse"
                        : boat.status === "docked"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}>
                      {boat.status === "sailing" ? "En Navegación" : boat.status === "docked" ? "En Muelle" : "Mantenimiento"}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-base mb-3">{boat.name}</h4>

                  {/* Detalle tripulación */}
                  <div className="space-y-2 text-xs bg-black/30 p-3 rounded-xl border border-white/5 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center">
                        <Users className="w-3.5 h-3.5 mr-1.5 text-sky-400" /> Pasajeros a bordo:
                      </span>
                      <span className="text-white font-bold">{boat.passengers_count} / {boat.max_capacity}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center">
                        <LifeBuoy className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> Chalecos en uso:
                      </span>
                      <span className="text-white font-bold">{boat.lifejackets_in_use}</span>
                    </div>

                    {boat.status === "sailing" && (
                      <div className="flex justify-between items-center text-amber-300 pt-1 border-t border-white/10 font-mono">
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Tiempo en agua:
                        </span>
                        <span className="font-bold">{sailingMins} min</span>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div>
                    {boat.status === "docked" ? (
                      <button
                        onClick={() => onDispatchBoat(boat.id)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center space-x-2"
                      >
                        <Ship className="w-4 h-4" />
                        <span>DESPACHAR BOTE AL LAGO</span>
                      </button>
                    ) : boat.status === "sailing" ? (
                      <button
                        onClick={() => onDockBoat(boat.id)}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center space-x-2"
                      >
                        <Anchor className="w-4 h-4" />
                        <span>AMARRAR EN MUELLE (REMAR)</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs cursor-not-allowed"
                      >
                        EN REPARACIÓN TÉCNICA
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
