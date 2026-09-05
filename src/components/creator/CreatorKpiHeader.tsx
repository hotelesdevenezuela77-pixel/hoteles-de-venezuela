import React from "react";
import { DollarSign, MapPin, Sparkles, Clock, TrendingUp, Compass, Award, CheckSquare } from "lucide-react";
import type { CreatorKpiSummary } from "../../types/creatorInfluencer";

interface CreatorKpiHeaderProps {
  kpis: CreatorKpiSummary;
}

export const CreatorKpiHeader: React.FC<CreatorKpiHeaderProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      {/* 1. Rendimiento Financiero del Viaje */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1a0533]/80 border border-white/10 p-5 shadow-xl backdrop-blur-md transition-all hover:border-[#00C8D4]/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Margen Neto Expedición</span>
          <div className="w-9 h-9 rounded-xl bg-[#00C8D4] flex items-center justify-center shadow-lg shadow-[#00C8D4]/20">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-baseline space-x-1.5">
            <span className={`text-3xl font-extrabold tracking-tight ${kpis.netExpeditionMarginUsd >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              ${kpis.netExpeditionMarginUsd.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-bold">USD Neto</span>
          </div>
          <div className="text-xs font-semibold text-slate-400 mt-0.5">
            Bs. {kpis.netExpeditionMarginBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="mt-3 bg-slate-900/60 border border-white/5 p-2 rounded-xl flex items-center justify-between text-xs">
          <span className="text-slate-400">Ingresos Patrocinios: <strong className="text-white">${kpis.expeditionIncomeUsd}</strong></span>
          <span className="text-slate-400">Gastos: <strong className="text-red-400">-${kpis.expeditionExpensesUsd}</strong></span>
        </div>
      </div>

      {/* 2. Kilómetros & Rutas Trazadas */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1a0533]/80 border border-white/10 p-5 shadow-xl backdrop-blur-md transition-all hover:border-[#FF0096]/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Rutas & Geodatos</span>
          <div className="w-9 h-9 rounded-xl bg-[#FF0096] flex items-center justify-center shadow-lg shadow-[#FF0096]/20">
            <Compass className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{kpis.totalKmTraveled.toLocaleString()}</span>
          <span className="text-xs text-slate-400 font-medium">km recorridos</span>
        </div>

        <div className="mt-3 bg-sky-950/40 border border-sky-500/20 p-2.5 rounded-xl flex items-center justify-between text-xs">
          <span className="text-sky-300 font-medium flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-sky-400 inline" /> Waypoints GPS fijados:
          </span>
          <span className="text-white font-bold">{kpis.totalWaypointsCount} pts</span>
        </div>
      </div>

      {/* 3. Contratos & Canjes en Curso */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1a0533]/80 border border-white/10 p-5 shadow-xl backdrop-blur-md transition-all hover:border-[#9B00CC]/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Contratos & Canjes</span>
          <div className="w-9 h-9 rounded-xl bg-[#9B00CC] flex items-center justify-center shadow-lg shadow-[#9B00CC]/20">
            <Award className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{kpis.activeDealsCount}</span>
          <span className="text-xs text-slate-400 font-medium">marcas activas</span>
        </div>

        <div className="mt-3 bg-slate-900/60 border border-white/5 p-2 rounded-xl flex items-center justify-between text-xs">
          <span className="text-slate-400">Por Cobrar:</span>
          <span className="text-emerald-400 font-bold">${kpis.pendingCollectUsd} USD</span>
        </div>
      </div>

      {/* 4. Entregables Pendientes */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1a0533]/80 border border-white/10 p-5 shadow-xl backdrop-blur-md transition-all hover:border-amber-500/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Entregables Contrato</span>
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{kpis.pendingDeliverablesCount}</span>
          <span className="text-xs text-slate-400 font-medium">piezas por entregar</span>
        </div>

        <div className={`mt-3 p-2.5 rounded-xl border flex items-center justify-between text-xs ${
          kpis.urgentDeliverablesCount > 0
            ? "bg-red-950/50 border-red-500/40 text-red-200 animate-pulse"
            : "bg-slate-900/60 border-white/5 text-slate-300"
        }`}>
          <span className="font-medium">Fecha Límite &lt; 72h:</span>
          <span className="font-extrabold text-white px-2 py-0.5 rounded bg-red-600">
            {kpis.urgentDeliverablesCount} tareas
          </span>
        </div>
      </div>

    </div>
  );
};
