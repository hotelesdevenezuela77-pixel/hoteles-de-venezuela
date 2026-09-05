import React from "react";
import { DollarSign, Compass, Ticket, AlertTriangle, TrendingUp, Users, Clock, ShieldCheck } from "lucide-react";
import type { AgencyKpiSummary } from "../../types/agencyTourOperator";

interface AgencyKpiHeaderProps {
  kpis: AgencyKpiSummary;
}

export const AgencyKpiHeader: React.FC<AgencyKpiHeaderProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      {/* 1. Volumen de Ventas & Margen Neta Markup */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1a0533]/80 border border-white/10 p-5 shadow-xl backdrop-blur-md transition-all hover:border-[#00C8D4]/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Ventas & Margen Neta</span>
          <div className="w-9 h-9 rounded-xl bg-[#00C8D4] flex items-center justify-center shadow-lg shadow-[#00C8D4]/20">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-extrabold text-white tracking-tight">${kpis.monthlyGrossSalesUsd.toLocaleString()}</span>
            <span className="text-xs text-emerald-400 font-bold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" /> Bruto
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-400 mt-0.5">
            Bs. {kpis.monthlyGrossSalesBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Breakdown de Ganancia Neta (Markup %) */}
        <div className="mt-3 bg-emerald-950/40 border border-emerald-500/20 p-2.5 rounded-xl flex items-center justify-between text-xs">
          <span className="text-emerald-300 font-medium">Margen Neta ({kpis.averageMarkupPercentage}%):</span>
          <span className="text-emerald-400 font-bold">+${kpis.monthlyNetMarginUsd.toLocaleString()} USD</span>
        </div>
      </div>

      {/* 2. Viajeros Activos en Ruta */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1a0533]/80 border border-white/10 p-5 shadow-xl backdrop-blur-md transition-all hover:border-[#FF0096]/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Viajeros en Ruta</span>
          <div className="w-9 h-9 rounded-xl bg-[#FF0096] flex items-center justify-center shadow-lg shadow-[#FF0096]/20">
            <Compass className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{kpis.activeTravelersInRoute}</span>
          <span className="text-xs text-slate-400 font-medium">turistas registrados</span>
        </div>

        <div className="mt-3 bg-sky-950/40 border border-sky-500/20 p-2.5 rounded-xl flex items-center justify-between text-xs">
          <span className="text-sky-300 font-medium flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 text-sky-400 inline" /> Salidas próximas 48h:
          </span>
          <span className="text-white font-bold">{kpis.departuresNext48h} pax</span>
        </div>
      </div>

      {/* 3. Paquetes & Embudo de Cotizaciones */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1a0533]/80 border border-white/10 p-5 shadow-xl backdrop-blur-md transition-all hover:border-[#9B00CC]/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Embudo Comercial</span>
          <div className="w-9 h-9 rounded-xl bg-[#9B00CC] flex items-center justify-center shadow-lg shadow-[#9B00CC]/20">
            <Ticket className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{kpis.quotesCountConfirmed + kpis.quotesCountPaidFull}</span>
          <span className="text-xs text-slate-400 font-medium">reservas cerradas</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900/60 border border-white/5 p-2 rounded-xl text-center">
            <span className="block text-[10px] text-amber-300 font-semibold uppercase">Seña Pagada</span>
            <span className="text-base font-bold text-white">{kpis.quotesCountConfirmed}</span>
          </div>
          <div className="bg-slate-900/60 border border-white/5 p-2 rounded-xl text-center">
            <span className="block text-[10px] text-emerald-300 font-semibold uppercase">100% Liquidadas</span>
            <span className="text-base font-bold text-white">{kpis.quotesCountPaidFull}</span>
          </div>
        </div>
      </div>

      {/* 4. Cuentas por Pagar a Proveedores (Deadlines) */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1a0533]/80 border border-white/10 p-5 shadow-xl backdrop-blur-md transition-all hover:border-amber-500/40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Por Pagar Proveedores</span>
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-extrabold text-amber-400 tracking-tight">${kpis.pendingSupplierPayablesUsd.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-semibold">USD</span>
          </div>
          <div className="text-xs font-semibold text-slate-400 mt-0.5">
            Bs. {kpis.pendingSupplierPayablesBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className={`mt-3 p-2.5 rounded-xl border flex items-center justify-between text-xs ${
          kpis.urgentDeadlinesCount > 0
            ? "bg-red-950/50 border-red-500/40 text-red-200 animate-pulse"
            : "bg-slate-900/60 border-white/5 text-slate-300"
        }`}>
          <span className="font-medium">Vencimientos &lt; 72h:</span>
          <span className="font-extrabold text-white px-2 py-0.5 rounded bg-red-600">
            {kpis.urgentDeadlinesCount} pagos
          </span>
        </div>
      </div>

    </div>
  );
};
