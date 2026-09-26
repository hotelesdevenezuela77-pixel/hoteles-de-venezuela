import React, { useState } from "react";
import {
  Wallet, DollarSign, ShieldCheck, Award, TrendingUp,
  Receipt, ArrowUpRight, ArrowDownRight, CreditCard,
  QrCode, CheckCircle2, Star, Calendar, Download, RefreshCw,
  Sparkles, Fuel, Building2, Check, ExternalLink
} from "lucide-react";
import type { 
  CreatorKpiSummary, 
  CreatorMembershipProfile, 
  CreatorDeal, 
  CreatorRouteExpense 
} from "../../types/creatorInfluencer";

interface CreatorFinanceMembershipProps {
  kpis: CreatorKpiSummary;
  membership: CreatorMembershipProfile;
  deals: CreatorDeal[];
  expenses: CreatorRouteExpense[];
  creatorName?: string;
  onUpdateMembership?: (updates: Partial<CreatorMembershipProfile>) => void;
}

import { useBcvExchangeRate } from "@/hooks/useBcvExchangeRate";

const CIAN = "#00C8D4";
const FUCSIA = "#FF0096";
const PURPURA = "#9B00CC";

export const CreatorFinanceMembership: React.FC<CreatorFinanceMembershipProps> = ({
  kpis,
  membership,
  deals,
  expenses,
  creatorName = "Aura Croce",
  onUpdateMembership
}) => {
  const { bcvRate, formatBs } = useBcvExchangeRate();
  const [copiedToken, setCopiedToken] = useState(false);

  // Cálculos consolidados
  const totalBaseHonorarios = kpis.totalBaseFeesUsd || 0;
  const totalViaticos = kpis.totalViaticosUsd || 0;
  const totalCommercialDeals = deals.reduce((acc, d) => acc + (d.monetary_usd || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount_usd || 0), 0);

  const totalGrossIncome = totalBaseHonorarios + totalViaticos + totalCommercialDeals;
  const netEarnings = Math.max(0, totalGrossIncome - totalExpenses);

  const handleCopyPressToken = () => {
    navigator.clipboard.writeText(membership.qr_code_token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 3000);
  };

  return (
    <div className="space-y-8 text-slate-100 font-sans">
      
      {/* ── Banner Principal ── */}
      <div
        className="rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a0533 0%, #0e011f 100%)" }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: CIAN }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: FUCSIA }} />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-[#00C8D4]/15 text-[#00C8D4] border border-[#00C8D4]/30">
              <Wallet className="w-3.5 h-3.5" />
              <span>ESTADOS FINANCIEROS DE CREADOR & CREDENCIAL OFICIAL HDV</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-wide">
              Finanzas de Expedición & Membresía VIP
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Supervisa tus ingresos por <strong className="text-white">Honorarios ($20/viaje)</strong>, viáticos de carretera y contratos comerciales, junto a tu <strong className="text-white">Credencial de Prensa Turística Oficial de Hoteles de Venezuela</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-4 py-2 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center gap-1.5 shadow">
              <CheckCircle2 className="w-4 h-4" />
              <span>Membresía Activa (2026-2027)</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── 4 TARJETAS DE KPIS FINANCIEROS CONSOLIDADOS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Ingresos Brutos Totales */}
        <div className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ingresos Brutos Totales</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ${totalGrossIncome.toFixed(2)} <span className="text-xs font-bold text-slate-400">USD</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
            <span>Honorarios + Viáticos + Pautas</span>
            <span className="text-emerald-400 font-mono">Bs. {formatBs(totalGrossIncome)}</span>
          </div>
        </div>

        {/* KPI 2: Honorarios Base ($20 / Viaje) */}
        <div className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Honorarios de Viaje ($20)</span>
            <div className="w-8 h-8 rounded-xl bg-[#FF0096]/20 text-[#FF0096] flex items-center justify-center">
              <DollarSign className="w-4.5 h-4.5 font-black" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#FF0096]">
            ${totalBaseHonorarios.toFixed(2)} <span className="text-xs font-bold text-slate-400">USD</span>
          </div>
          <div className="text-[10px] text-pink-300 mt-1 flex justify-between">
            <span>Garantizado por HDV</span>
            <span>{kpis.totalTripsCount} viajes</span>
          </div>
        </div>

        {/* KPI 3: Viáticos & Gastos de Ruta */}
        <div className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Viáticos & Gastos</span>
            <div className="w-8 h-8 rounded-xl bg-[#9B00CC]/20 text-[#9B00CC] flex items-center justify-center">
              <Fuel className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#9B00CC]">
            ${totalViaticos.toFixed(2)} <span className="text-xs font-bold text-slate-400">USD</span>
          </div>
          <div className="text-[10px] text-purple-300 mt-1 flex justify-between">
            <span>Gastos carretera: ${totalExpenses.toFixed(2)}</span>
            <span>Rendición OK</span>
          </div>
        </div>

        {/* KPI 4: Utilidad Neta Real */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/60 to-black/80 border border-emerald-500/40 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Margen Neto Real</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-300">
            ${netEarnings.toFixed(2)} <span className="text-xs font-bold text-slate-400">USD</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 flex justify-between">
            <span>Ganancia neta acumulada</span>
            <span>~Bs. {formatBs(netEarnings)}</span>
          </div>
        </div>

      </div>

      {/* ── SECCIÓN DOBLE: CREDENCIAL DE PRENSA & FLUJO FINANCIERO ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMNA 1: CREDENCIAL DE PRENSA HOLOGRÁFICA (Col 5) */}
        <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-[#1a0533] via-[#0e011f] to-[#1a0533] border border-[#00C8D4]/40 p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-2xl opacity-20 bg-[#00C8D4]" />

          <div>
            {/* Header de la Tarjeta */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00C8D4]" />
                <span className="text-xs font-black uppercase tracking-widest text-white">HOTELES DE VENEZUELA PRESS</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#FF0096] text-white">
                OFICIAL
              </span>
            </div>

            {/* Credencial Holográfica */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 border border-white/20 shadow-inner relative overflow-hidden">
              <div className="flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                  alt={creatorName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#00C8D4] shadow-md shrink-0"
                />
                <div>
                  <div className="text-base font-bold text-white font-serif">{creatorName}</div>
                  <div className="text-[11px] text-[#00C8D4] font-mono font-bold">{membership.press_card_number}</div>
                  <div className="text-[10px] text-slate-300 mt-1">{membership.tier_name}</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-400">Vigencia:</div>
                  <div className="text-[11px] font-bold text-emerald-400">{membership.valid_thru}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase font-bold text-slate-400">Verificación QR:</div>
                  <div className="text-[10px] font-mono text-slate-300 truncate max-w-[120px]">{membership.qr_code_token}</div>
                </div>
              </div>
            </div>

            {/* Lista de Beneficios Verificados */}
            <div className="mt-4 space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Beneficios del Pase Creador:</div>
              {membership.benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <Check className="w-3.5 h-3.5 text-[#00C8D4] shrink-0 mt-0.5" />
                  <span className="text-[11px]">{b}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2">
            <button
              onClick={handleCopyPressToken}
              className="flex-1 py-2 px-3 rounded-xl bg-[#00C8D4]/20 hover:bg-[#00C8D4]/30 text-[#00C8D4] border border-[#00C8D4]/40 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedToken ? <Check className="w-3.5 h-3.5" /> : <QrCode className="w-3.5 h-3.5" />}
              <span>{copiedToken ? "¡Token Copiado!" : "Copiar Token QR"}</span>
            </button>
          </div>
        </div>

        {/* COLUMNA 2: FLUJO FINANCIERO & DESGLOSE DE INGRESOS (Col 7) */}
        <div className="lg:col-span-7 rounded-3xl bg-white/5 border border-white/10 p-6 shadow-xl backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white font-serif">Desglose Consolidado de Fuentes de Ingresos</h3>
              <p className="text-xs text-slate-400">Resumen de liquidaciones por honorarios, reembolsos y acuerdos</p>
            </div>
          </div>

          <div className="space-y-3">
            
            {/* Fuente 1: Honorarios de Viaje */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FF0096]/20 text-[#FF0096] flex items-center justify-center">
                  <DollarSign className="w-5 h-5 font-black" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Honorarios Base Garantizados ($20 USD/Viaje)</div>
                  <div className="text-[10px] text-slate-400">{kpis.totalTripsCount} viajes remunerados completados</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-[#FF0096]">${totalBaseHonorarios.toFixed(2)} USD</div>
                <div className="text-[10px] text-slate-400 font-mono">100% Garantizado</div>
              </div>
            </div>

            {/* Fuente 2: Viáticos de Carretera */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#9B00CC]/20 text-[#9B00CC] flex items-center justify-center">
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Viáticos de Carretera & Logística</div>
                  <div className="text-[10px] text-slate-400">Combustible, comidas, peajes y lancheros</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-[#9B00CC]">${totalViaticos.toFixed(2)} USD</div>
                <div className="text-[10px] text-purple-300 font-mono">Reembolsado</div>
              </div>
            </div>

            {/* Fuente 3: Acuerdos Comerciales & Pautas */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#00C8D4]/20 text-[#00C8D4] flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Acuerdos Comerciales con Posadas & Marcas</div>
                  <div className="text-[10px] text-slate-400">{deals.length} contratos comerciales pautados</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-[#00C8D4]">${totalCommercialDeals.toFixed(2)} USD</div>
                <div className="text-[10px] text-emerald-400 font-mono">Pautas Monetarias</div>
              </div>
            </div>

            {/* Fuente 4: Gastos Reportados */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Gastos Deducibles de Expedición</div>
                  <div className="text-[10px] text-slate-400">{expenses.length} gastos reportados en ruta</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-red-400">-${totalExpenses.toFixed(2)} USD</div>
                <div className="text-[10px] text-slate-400 font-mono">Deducciones</div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
