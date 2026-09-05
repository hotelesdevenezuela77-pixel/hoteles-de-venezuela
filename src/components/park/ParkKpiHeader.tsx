import React from "react";
import { Users, DollarSign, Ticket, Wallet, ShieldCheck, ArrowUpRight, TrendingUp, Sparkles, AlertTriangle } from "lucide-react";
import type { ParkKpiSummary } from "../../types/parkComplex";

interface ParkKpiHeaderProps {
  kpis: ParkKpiSummary;
}

export const ParkKpiHeader: React.FC<ParkKpiHeaderProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. Aforo en Sitio en Tiempo Real */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1a0533]/80 border border-white/10 p-5 shadow-xl backdrop-blur-md transition-all hover:border-[#00C8D4]/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Aforo en Sitio (En Vivo)</span>
          <div className="w-9 h-9 rounded-xl bg-[#00C8D4] flex items-center justify-center shadow-lg shadow-[#00C8D4]/20">
            <Users className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{kpis.totalInPark.toLocaleString()}</span>
          <span className="text-xs text-slate-400 font-medium">/ {kpis.maxCapacity.toLocaleString()} max</span>
        </div>

        {/* Breakdown de Adultos vs Niños */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#00C8D4]"></div>
            <span className="text-slate-300 font-medium">Adultos:</span>
            <span className="text-white font-bold">{kpis.currentAdults}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#FF0096]"></div>
            <span className="text-slate-300 font-medium">Niños:</span>
            <span className="text-white font-bold">{kpis.currentChildren}</span>
          </div>
        </div>

        {/* Progress Bar de Ocupación */}
        <div className="mt-3">
          <div className="flex justify-between text-[11px] font-semibold mb-1">
            <span className="text-slate-400">Capacidad Autorizada</span>
            <span className={kpis.occupancyPercentage > 85 ? "text-amber-400 font-bold" : "text-[#00C8D4]"}>
              {kpis.occupancyPercentage}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                kpis.occupancyPercentage > 90
                  ? "bg-gradient-to-r from-amber-500 to-red-500"
                  : kpis.occupancyPercentage > 75
                  ? "bg-gradient-to-r from-[#00C8D4] to-amber-400"
                  : "bg-gradient-to-r from-[#00C8D4] to-[#9B00CC]"
              }`}
              style={{ width: `${Math.min(100, kpis.occupancyPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Ingresos Brutos del Día (Multimoneda) */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1a0533]/80 border border-white/10 p-5 shadow-xl backdrop-blur-md transition-all hover:border-[#FF0096]/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Ingresos Brutos del Día</span>
          <div className="w-9 h-9 rounded-xl bg-[#FF0096] flex items-center justify-center shadow-lg shadow-[#FF0096]/20">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-extrabold text-white tracking-tight">${kpis.grossIncomeUsd.toLocaleString()}</span>
            <span className="text-xs text-emerald-400 font-bold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" /> USD
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-400 mt-0.5">
            Bs. {kpis.grossIncomeBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Distribución porcentual por canal */}
        <div className="mt-3 space-y-1.5 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-300 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C8D4] mr-1.5"></span> Taquilla:
            </span>
            <span className="text-white font-bold">${kpis.incomeBreakdownUsd.taquilla}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-300 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF0096] mr-1.5"></span> Restaurante F&B:
            </span>
            <span className="text-white font-bold">${kpis.incomeBreakdownUsd.restaurante}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-300 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5"></span> Paseos en Bote:
            </span>
            <span className="text-white font-bold">${kpis.incomeBreakdownUsd.botes}</span>
          </div>
        </div>
      </div>

      {/* 3. Flujo de Tickets (Web vs Ventanilla) */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1a0533]/80 border border-white/10 p-5 shadow-xl backdrop-blur-md transition-all hover:border-[#9B00CC]/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Flujo de Accesos</span>
          <div className="w-9 h-9 rounded-xl bg-[#9B00CC] flex items-center justify-center shadow-lg shadow-[#9B00CC]/20">
            <Ticket className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{kpis.totalTicketsProcessed}</span>
          <span className="text-xs text-slate-400 font-medium">tickets canjeados</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-emerald-950/40 border border-emerald-500/20 p-2.5 rounded-xl text-center">
            <span className="block text-[10px] text-emerald-300 font-semibold uppercase">Compras Web</span>
            <span className="text-lg font-bold text-white">{kpis.webTicketsCount}</span>
          </div>
          <div className="bg-sky-950/40 border border-sky-500/20 p-2.5 rounded-xl text-center">
            <span className="block text-[10px] text-sky-300 font-semibold uppercase">Ventanilla POS</span>
            <span className="text-lg font-bold text-white">{kpis.posTicketsCount}</span>
          </div>
        </div>
      </div>

      {/* 4. Caja Neta y Control de Gastos */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1a0533]/80 border border-white/10 p-5 shadow-xl backdrop-blur-md transition-all hover:border-emerald-500/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Caja Neta Disponible</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Wallet className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">${kpis.netBalanceUsd.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-semibold">USD Neto</span>
          </div>
          <div className="text-xs font-semibold text-slate-400 mt-0.5">
            Bs. {kpis.netBalanceBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="mt-3 bg-red-950/30 border border-red-500/20 p-2.5 rounded-xl flex items-center justify-between text-xs">
          <span className="text-red-300 font-medium">Egresos del Día:</span>
          <span className="text-red-400 font-bold">-${kpis.totalExpensesUsd} USD</span>
        </div>
      </div>
    </div>
  );
};
