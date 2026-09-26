import React from "react";
import { DollarSign, MapPin, Sparkles, Clock, TrendingUp, Compass, Award, CheckSquare, Wallet, Fuel } from "lucide-react";
import type { CreatorKpiSummary } from "../../types/creatorInfluencer";

interface CreatorKpiHeaderProps {
  kpis: CreatorKpiSummary;
  theme?: "dark" | "light";
}

export const CreatorKpiHeader: React.FC<CreatorKpiHeaderProps> = ({ kpis, theme = "dark" }) => {
  const isLight = theme === "light";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      
      {/* 1. Remuneraciones de Viaje ($20 Honorarios + Viáticos) */}
      <div className={`relative overflow-hidden rounded-2xl p-5 transition-all ${
        isLight
          ? "bg-white border border-pink-200 shadow-md hover:shadow-lg hover:border-pink-300"
          : "bg-[#1a0533]/80 border border-[#FF0096]/30 shadow-xl backdrop-blur-md hover:border-[#FF0096]/60"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? "text-pink-600" : "text-pink-300"}`}>
            Honorarios & Viáticos
          </span>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#FF0096]/20" style={{ background: "#FF0096" }}>
            <Wallet className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-baseline space-x-1.5">
            <span className={`text-2xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
              ${kpis.totalRemunerationUsd.toFixed(2)}
            </span>
            <span className="text-[10px] text-pink-500 font-bold">USD Total</span>
          </div>
          <div className={`text-[10px] font-semibold mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            ${kpis.totalBaseFeesUsd.toFixed(2)} Honorarios ($20/viaje)
          </div>
        </div>

        <div className={`mt-2.5 p-2 rounded-xl flex items-center justify-between text-[10px] border ${
          isLight ? "bg-slate-50 border-slate-150" : "bg-slate-900/60 border-white/5"
        }`}>
          <span className="text-emerald-500 font-bold">Liquidado: ${kpis.liquidatedRemunerationUsd.toFixed(0)}</span>
          <span className="text-amber-500 font-bold">Pend: ${kpis.pendingRemunerationUsd.toFixed(0)}</span>
        </div>
      </div>

      {/* 2. Rendimiento Financiero del Viaje */}
      <div className={`relative overflow-hidden rounded-2xl p-5 transition-all ${
        isLight
          ? "bg-white border border-slate-200 shadow-md hover:shadow-lg hover:border-[#00C8D4]/50"
          : "bg-[#1a0533]/80 border border-white/10 shadow-xl backdrop-blur-md hover:border-[#00C8D4]/40"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-300"}`}>
            Margen Patrocinios
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#00C8D4] flex items-center justify-center shadow-lg shadow-[#00C8D4]/20">
            <DollarSign className="w-4 h-4 text-slate-950 font-bold" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-baseline space-x-1.5">
            <span className={`text-2xl font-black tracking-tight ${kpis.netExpeditionMarginUsd >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              ${kpis.netExpeditionMarginUsd.toLocaleString()}
            </span>
            <span className={`text-[10px] font-bold ${isLight ? "text-slate-500" : "text-slate-400"}`}>USD Neto</span>
          </div>
          <div className={`text-[10px] font-semibold mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            Bs. {kpis.netExpeditionMarginBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className={`mt-2.5 p-2 rounded-xl flex items-center justify-between text-[10px] border ${
          isLight ? "bg-slate-50 border-slate-150" : "bg-slate-900/60 border-white/5"
        }`}>
          <span className={isLight ? "text-slate-600" : "text-slate-400"}>
            Patrocinios: <strong className={isLight ? "text-slate-900" : "text-white"}>${kpis.expeditionIncomeUsd}</strong>
          </span>
          <span className={isLight ? "text-slate-600" : "text-slate-400"}>
            Gastos: <strong className="text-red-500">-${kpis.expeditionExpensesUsd}</strong>
          </span>
        </div>
      </div>

      {/* 3. Kilómetros & Rutas Trazadas */}
      <div className={`relative overflow-hidden rounded-2xl p-5 transition-all ${
        isLight
          ? "bg-white border border-slate-200 shadow-md hover:shadow-lg hover:border-purple-300"
          : "bg-[#1a0533]/80 border border-white/10 shadow-xl backdrop-blur-md hover:border-[#FF0096]/40"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-300"}`}>
            Rutas & Geodatos
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/20">
            <Compass className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="flex items-baseline space-x-1.5">
          <span className={`text-2xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            {kpis.totalKmTraveled.toLocaleString()}
          </span>
          <span className={`text-[10px] font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>km trazados</span>
        </div>

        <div className={`mt-2.5 p-2 rounded-xl flex items-center justify-between text-[10px] border ${
          isLight ? "bg-sky-50 border-sky-200" : "bg-sky-950/40 border-sky-500/20"
        }`}>
          <span className={`font-medium flex items-center ${isLight ? "text-sky-800" : "text-sky-300"}`}>
            <MapPin className="w-3 h-3 mr-1 text-sky-500 inline" /> Waypoints:
          </span>
          <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{kpis.totalWaypointsCount} pts</span>
        </div>
      </div>

      {/* 4. Contratos & Canjes en Curso */}
      <div className={`relative overflow-hidden rounded-2xl p-5 transition-all ${
        isLight
          ? "bg-white border border-slate-200 shadow-md hover:shadow-lg hover:border-purple-300"
          : "bg-[#1a0533]/80 border border-white/10 shadow-xl backdrop-blur-md hover:border-[#9B00CC]/40"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-300"}`}>
            Marcas & Canjes
          </span>
          <div className="w-8 h-8 rounded-xl bg-[#9B00CC] flex items-center justify-center shadow-lg shadow-[#9B00CC]/20">
            <Award className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="flex items-baseline space-x-1.5">
          <span className={`text-2xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            {kpis.activeDealsCount}
          </span>
          <span className={`text-[10px] font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>marcas activas</span>
        </div>

        <div className={`mt-2.5 p-2 rounded-xl flex items-center justify-between text-[10px] border ${
          isLight ? "bg-slate-50 border-slate-150" : "bg-slate-900/60 border-white/5"
        }`}>
          <span className={isLight ? "text-slate-600" : "text-slate-400"}>Por Cobrar:</span>
          <span className="text-emerald-500 font-bold">${kpis.pendingCollectUsd} USD</span>
        </div>
      </div>

      {/* 5. Entregables Pendientes */}
      <div className={`relative overflow-hidden rounded-2xl p-5 transition-all ${
        isLight
          ? "bg-white border border-slate-200 shadow-md hover:shadow-lg hover:border-amber-300"
          : "bg-[#1a0533]/80 border border-white/10 shadow-xl backdrop-blur-md hover:border-amber-500/40"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-300"}`}>
            Entregables
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <CheckSquare className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="flex items-baseline space-x-1.5">
          <span className={`text-2xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
            {kpis.pendingDeliverablesCount}
          </span>
          <span className={`text-[10px] font-medium ${isLight ? "text-slate-500" : "text-slate-400"}`}>piezas pendientes</span>
        </div>

        <div className={`mt-2.5 p-2 rounded-xl border flex items-center justify-between text-[10px] ${
          kpis.urgentDeliverablesCount > 0
            ? isLight ? "bg-red-50 border-red-200 text-red-800 animate-pulse" : "bg-red-950/50 border-red-500/40 text-red-200 animate-pulse"
            : isLight ? "bg-slate-50 border-slate-150 text-slate-600" : "bg-slate-900/60 border-white/5 text-slate-300"
        }`}>
          <span className="font-medium">Límite &lt; 72h:</span>
          <span className="font-extrabold text-white px-1.5 py-0.5 rounded bg-red-600">
            {kpis.urgentDeliverablesCount} tareas
          </span>
        </div>
      </div>

    </div>
  );
};
