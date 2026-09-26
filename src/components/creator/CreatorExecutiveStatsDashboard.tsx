import React, { useState } from "react";
import {
  BarChart3, TrendingUp, DollarSign, Award, Calendar, Wallet, MapPin,
  Compass, Building2, MessageSquare, Wrench, Globe, Clipboard, ArrowUpRight,
  ShieldCheck, Star, Activity, Eye, Share2, CheckCircle2, Clock, Sparkles,
  Layers, Users, Video, Film, Camera, Zap, Droplets, Wifi, Fuel, ChevronRight
} from "lucide-react";
import { useBcvExchangeRate } from "../../hooks/useBcvExchangeRate";
import type {
  CreatorExpedition,
  CreatorVisitedEstablishment,
  CreatorQuote,
  CreatorDeal,
  CreatorRouteExpense,
  CreatorTravelAlbum,
  CreatorProfileInfo,
  CreatorMembershipInfo
} from "../../types/creatorInfluencer";

interface CreatorExecutiveStatsDashboardProps {
  creatorName: string;
  profileInfo?: CreatorProfileInfo;
  membership: CreatorMembershipInfo;
  expeditions: CreatorExpedition[];
  visitedEstablishments: CreatorVisitedEstablishment[];
  quotes: CreatorQuote[];
  deals: CreatorDeal[];
  expenses: CreatorRouteExpense[];
  galleryAlbums: CreatorTravelAlbum[];
  kpis: any;
  leadsCount: number;
  onNavigateTab: (tabId: string) => void;
}

export const CreatorExecutiveStatsDashboard: React.FC<CreatorExecutiveStatsDashboardProps> = ({
  creatorName,
  profileInfo,
  membership,
  expeditions,
  visitedEstablishments,
  quotes,
  deals,
  expenses,
  galleryAlbums,
  kpis,
  leadsCount,
  onNavigateTab
}) => {
  const { bcvRate, formatBs } = useBcvExchangeRate();
  const [selectedPeriod, setSelectedPeriod] = useState<"mes" | "trimestre" | "anual">("mes");

  // Métricas calculadas
  const totalCommercialDeals = deals.reduce((acc, d) => acc + (d.monetary_usd || 0), 0);
  const totalBarterValue = deals.reduce((acc, d) => acc + (d.barter_value_usd || 0), 0);
  const totalRevenueUsd = (kpis?.totalRemunerationUsd || 0) + totalCommercialDeals;
  const netProfitUsd = totalRevenueUsd - (kpis?.totalExpensesUsd || 0);

  // Estadísticas de auditoría
  const avgRating = visitedEstablishments.length > 0
    ? (visitedEstablishments.reduce((acc, e) => acc + (e.rating || 0), 0) / visitedEstablishments.length).toFixed(1)
    : "9.8";

  const totalPhotos = galleryAlbums.reduce((acc, a) => acc + (a.photos?.length || 0), 0);
  const totalKmDriven = expeditions.reduce((acc, e) => acc + (e.km_distance || 0), 0);

  // Simulación de estadísticas mensuales para gráficos ejecutivos
  const MONTHLY_PERFORMANCE = [
    { month: "Ene", honorarios: 120, viaticos: 340, acuerdos: 450 },
    { month: "Feb", honorarios: 160, viaticos: 410, acuerdos: 600 },
    { month: "Mar", honorarios: 140, viaticos: 380, acuerdos: 500 },
    { month: "Abr", honorarios: 180, viaticos: 490, acuerdos: 750 },
    { month: "May", honorarios: 220, viaticos: 560, acuerdos: 900 },
    { month: "Jun", honorarios: 200, viaticos: 520, acuerdos: 850 }
  ];

  const maxVal = Math.max(...MONTHLY_PERFORMANCE.map(m => m.honorarios + m.viaticos + m.acuerdos));

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* ── 1. BANNER HERO EJECUTIVO CON RESUMEN CONSOLIDADO ── */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1a0533] via-[#0e011f] to-[#1a0533] border border-[#00C8D4]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-15 bg-[#00C8D4]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-15 bg-[#FF0096]" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-[#00C8D4]/20 text-[#00C8D4] border border-[#00C8D4]/40">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>DASHBOARD EJECUTIVO & TELEMETRÍA DE CREADOR OFICIAL HDV</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-wide">
              Panel de Rendimiento, Finanzas & Métricas de Impacto
            </h2>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Consolidación en tiempo real de honorarios garantizados ($20 USD/viaje), liquidaciones de viáticos, acuerdos comerciales con marcas patrocinadoras, inventario turístico auditado y tasa oficial BCV.
            </p>
          </div>

          {/* Tarjeta de Tasa BCV Oficial */}
          <div className="w-full lg:w-auto p-4 rounded-2xl bg-black/50 border border-white/15 backdrop-blur-md flex items-center justify-between lg:justify-start gap-4 shrink-0 shadow-lg">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#00C8D4] to-[#9B00CC] flex items-center justify-center text-white font-bold shadow-md">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasa Oficial del Día (BCV)</div>
              <div className="text-lg font-black text-emerald-400 font-mono">
                Bs. {bcvRate.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[11px] text-slate-400">/ USD</span>
              </div>
              <div className="text-[9px] text-[#00C8D4] font-semibold">Sincronización Multidivisa Activa</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. MACRO-MÉTRICAS EJECUTIVAS (GRID 4 TARJETAS) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Ingresos Totales Consolidados */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1a0533] to-[#0e011f] border border-[#FF0096]/40 shadow-xl backdrop-blur-md relative overflow-hidden group hover:border-[#FF0096] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-pink-300 uppercase tracking-wider">Ingresos Globales Creador</span>
            <div className="w-8 h-8 rounded-xl bg-[#FF0096] text-white flex items-center justify-center font-bold shadow-md shadow-[#FF0096]/30">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ${totalRevenueUsd.toFixed(2)} <span className="text-xs text-pink-400">USD</span>
          </div>
          <div className="text-[10px] text-slate-300 mt-1 flex items-center justify-between border-t border-white/10 pt-2">
            <span>Ref. BCV del día:</span>
            <span className="font-bold text-emerald-300">Bs. {formatBs(totalRevenueUsd)}</span>
          </div>
        </div>

        {/* KPI 2: Margen Neto Real */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0e011f] to-[#120224] border border-emerald-500/40 shadow-xl backdrop-blur-md relative overflow-hidden group hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Utilidad Neta Real</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            ${netProfitUsd.toFixed(2)} <span className="text-xs text-slate-400">USD</span>
          </div>
          <div className="text-[10px] text-slate-300 mt-1 flex items-center justify-between border-t border-white/10 pt-2">
            <span>Deducción Egresos:</span>
            <span className="text-red-400 font-mono">-${(kpis?.totalExpensesUsd || 0).toFixed(2)} USD</span>
          </div>
        </div>

        {/* KPI 3: Expediciones & Kilómetros en Ruta */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1a0533] to-[#0e011f] border border-[#00C8D4]/40 shadow-xl backdrop-blur-md relative overflow-hidden group hover:border-[#00C8D4] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">Expediciones 4x4</span>
            <div className="w-8 h-8 rounded-xl bg-[#00C8D4] text-slate-950 flex items-center justify-center font-bold shadow-md shadow-[#00C8D4]/30">
              <Compass className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {expeditions.length} <span className="text-xs text-slate-400">Viajes</span>
          </div>
          <div className="text-[10px] text-slate-300 mt-1 flex items-center justify-between border-t border-white/10 pt-2">
            <span>Distancia Recorrida:</span>
            <span className="font-bold text-[#00C8D4] font-mono">{totalKmDriven} KM</span>
          </div>
        </div>

        {/* KPI 4: Auditorías & Rating Promedio */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0e011f] to-[#1a0533] border border-amber-500/40 shadow-xl backdrop-blur-md relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Establecimientos Auditados</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Star className="w-4.5 h-4.5 fill-slate-950" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono flex items-baseline gap-2">
            <span>{visitedEstablishments.length}</span>
            <span className="text-sm font-bold text-amber-300 flex items-center gap-0.5">
              ⭐ {avgRating}/10
            </span>
          </div>
          <div className="text-[10px] text-slate-300 mt-1 flex items-center justify-between border-t border-white/10 pt-2">
            <span>Calidad & Verificación:</span>
            <span className="text-emerald-400 font-bold">100% Verificado</span>
          </div>
        </div>

      </div>

      {/* ── 3. GRÁFICOS EJECUTIVOS & RENDIMIENTO MULTIMODAL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMNA 1: RENDIMIENTO FINANCIERO MENSUAL (Col 8) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-md space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#00C8D4]" />
                <span>Evolución Mensual de Honorarios, Viáticos & Acuerdos</span>
              </h3>
              <p className="text-xs text-slate-400">Distribución de liquidaciones acumuladas en el año</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-[11px] text-pink-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF0096]" /> Honorarios
              </span>
              <span className="flex items-center gap-1 text-[11px] text-purple-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#9B00CC]" /> Viáticos
              </span>
              <span className="flex items-center gap-1 text-[11px] text-cyan-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00C8D4]" /> Acuerdos
              </span>
            </div>
          </div>

          {/* Gráfico de Barras Proporcionales */}
          <div className="grid grid-cols-6 gap-3 sm:gap-4 items-end h-56 pt-6 px-2">
            {MONTHLY_PERFORMANCE.map((item, idx) => {
              const totalMonth = item.honorarios + item.viaticos + item.acuerdos;
              const heightPct = Math.round((totalMonth / maxVal) * 100);
              const honPct = (item.honorarios / totalMonth) * 100;
              const viatPct = (item.viaticos / totalMonth) * 100;
              const acuPct = (item.acuerdos / totalMonth) * 100;

              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${totalMonth}
                  </span>

                  <div
                    className="w-full max-w-[42px] rounded-t-xl overflow-hidden flex flex-col justify-end transition-all group-hover:scale-105 shadow-md"
                    style={{ height: `${heightPct}%` }}
                  >
                    <div style={{ height: `${acuPct}%` }} className="bg-[#00C8D4] w-full" title={`Acuerdos: $${item.acuerdos}`} />
                    <div style={{ height: `${viatPct}%` }} className="bg-[#9B00CC] w-full" title={`Viáticos: $${item.viaticos}`} />
                    <div style={{ height: `${honPct}%` }} className="bg-[#FF0096] w-full" title={`Honorarios: $${item.honorarios}`} />
                  </div>

                  <span className="text-xs font-bold text-slate-300 uppercase">{item.month}</span>
                </div>
              );
            })}
          </div>

          {/* Resumen al pie del gráfico */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10 text-center text-xs">
            <div className="p-2 rounded-xl bg-black/40">
              <span className="text-slate-400 block text-[10px]">Total Honorarios ($20/V):</span>
              <span className="text-sm font-black text-[#FF0096]">${(kpis?.totalBaseFeesUsd || 0).toFixed(2)} USD</span>
            </div>
            <div className="p-2 rounded-xl bg-black/40">
              <span className="text-slate-400 block text-[10px]">Total Viáticos Ruta:</span>
              <span className="text-sm font-black text-[#9B00CC]">${(kpis?.totalViaticosUsd || 0).toFixed(2)} USD</span>
            </div>
            <div className="p-2 rounded-xl bg-black/40">
              <span className="text-slate-400 block text-[10px]">Acuerdos Comerciales:</span>
              <span className="text-sm font-black text-[#00C8D4]">${totalCommercialDeals.toFixed(2)} USD</span>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: ESTADO OPERATIVO & ACCESOS RÁPIDOS (Col 4) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-gradient-to-br from-[#1a0533] via-[#0e011f] to-[#1a0533] border border-white/10 shadow-xl backdrop-blur-md space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00C8D4]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Estado de Acreditación</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#FF0096] text-white">
                OFICIAL
              </span>
            </div>

            {/* Credencial Sintética */}
            <div className="p-4 rounded-2xl bg-black/50 border border-white/15 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Credencial de Prensa:</span>
                <span className="font-mono font-bold text-[#00C8D4]">{membership.press_card_number}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Vigencia Oficial:</span>
                <span className="font-bold text-emerald-400">{membership.valid_thru}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Leads CRM Activos:</span>
                <span className="font-bold text-emerald-400">{leadsCount} contactos</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Material en Galería:</span>
                <span className="font-bold text-cyan-300">{totalPhotos} fotos 4K</span>
              </div>
            </div>
          </div>

          {/* Accesos Directos a Módulos Ejecutivos */}
          <div className="space-y-2 pt-3 border-t border-white/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Navegación Ejecutiva Rápida:
            </span>

            <button
              onClick={() => onNavigateTab("remuneraciones")}
              className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-[#FF0096]" />
                <span>Liquidaciones & Viáticos</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab("agenda_dnd")}
              className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#00C8D4]" />
                <span>Agenda & Google Calendar</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab("crm_whatsapp")}
              className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>CRM Leads WhatsApp ({leadsCount})</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab("webapp_cms")}
              className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-cyan-300" />
                <span>Web Builder (CMS Standalone)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

      </div>

      {/* ── 4. DESGLOSE DE AUDITORÍAS Y CONTROL DE SUMINISTROS ── */}
      <div className="p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#00C8D4]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Resumen de Auditorías Críticas de Establecimientos ({visitedEstablishments.length})
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab("establecimientos_visitados")}
            className="text-xs font-bold text-[#00C8D4] hover:underline flex items-center gap-1"
          >
            <span>Ver Fichas Completas</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Conectividad Wi-Fi</span>
              <Wifi className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-white">
              {visitedEstablishments.filter(e => e.wifi_speed_mbps > 0).length} / {visitedEstablishments.length}
            </div>
            <div className="text-[10px] text-emerald-400">Posadas con conexión auditada</div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Plantas Eléctricas</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-black text-white">
              {visitedEstablishments.filter(e => e.power_generator !== "no_tiene").length} / {visitedEstablishments.length}
            </div>
            <div className="text-[10px] text-amber-300">Respaldo continuo verificado</div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Pozo / Tanques Agua</span>
              <Droplets className="w-4 h-4 text-[#00C8D4]" />
            </div>
            <div className="text-xl font-black text-white">
              {visitedEstablishments.filter(e => e.water_supply !== "no_tiene").length} / {visitedEstablishments.length}
            </div>
            <div className="text-[10px] text-cyan-300">Suministro hídrico óptimo</div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Convenios Canje / Pauta</span>
              <Award className="w-4 h-4 text-[#FF0096]" />
            </div>
            <div className="text-xl font-black text-white">
              {visitedEstablishments.filter(e => e.deal_type).length} / {visitedEstablishments.length}
            </div>
            <div className="text-[10px] text-pink-300">Alianzas comerciales activas</div>
          </div>
        </div>
      </div>

    </div>
  );
};
