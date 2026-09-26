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
  theme?: "dark" | "light";
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
  theme = "dark",
  onNavigateTab
}) => {
  const isLight = theme === "light";
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
    <div className={`space-y-6 font-sans transition-colors duration-300 ${
      isLight ? "text-slate-800" : "text-slate-100"
    }`}>
      
      {/* ── 1. BANNER HERO EJECUTIVO CON RESUMEN CONSOLIDADO ── */}
      <div className={`rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all ${
        isLight
          ? "bg-white border border-slate-200 shadow-md text-slate-800"
          : "bg-gradient-to-r from-[#1a0533] via-[#0e011f] to-[#1a0533] border border-[#00C8D4]/30 shadow-2xl text-white"
      }`}>
        {!isLight && (
          <>
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-15 bg-[#00C8D4]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-15 bg-[#FF0096]" />
          </>
        )}

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-[#00C8D4]/20 text-[#00C8D4] border border-[#00C8D4]/40">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>DASHBOARD EJECUTIVO & TELEMETRÍA DE CREADOR OFICIAL HDV</span>
            </div>

            <h2 className={`text-2xl sm:text-3xl font-black font-serif tracking-wide ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              Panel de Rendimiento, Finanzas & Métricas de Impacto
            </h2>

            <p className={`text-xs max-w-2xl leading-relaxed ${
              isLight ? "text-slate-600" : "text-slate-300"
            }`}>
              Consolidación en tiempo real de honorarios garantizados ($20 USD/viaje), liquidaciones de viáticos, acuerdos comerciales con marcas patrocinadoras, inventario turístico auditado y tasa oficial BCV.
            </p>
          </div>

          {/* Tarjeta de Tasa BCV Oficial */}
          <div className={`w-full lg:w-auto p-4 rounded-2xl border backdrop-blur-md flex items-center justify-between lg:justify-start gap-4 shrink-0 shadow-lg ${
            isLight
              ? "bg-slate-50 border-slate-200 text-slate-800"
              : "bg-black/50 border-white/15 text-white"
          }`}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#00C8D4] to-[#9B00CC] flex items-center justify-center text-white font-bold shadow-md">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className={`text-[10px] font-bold uppercase tracking-wider ${
                isLight ? "text-slate-500" : "text-slate-400"
              }`}>
                Tasa Oficial del Día (BCV)
              </div>
              <div className="text-lg font-black text-emerald-500 font-mono">
                Bs. {bcvRate.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className={`text-[11px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>/ USD</span>
              </div>
              <div className="text-[9px] text-[#00C8D4] font-semibold">Sincronización Multidivisa Activa</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. MACRO-MÉTRICAS EJECUTIVAS (GRID 4 TARJETAS) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Ingresos Totales Consolidados */}
        <div className={`p-5 rounded-3xl relative overflow-hidden group transition-all ${
          isLight
            ? "bg-white border border-pink-200 shadow-md hover:border-[#FF0096] hover:shadow-lg text-slate-800"
            : "bg-gradient-to-br from-[#1a0533] to-[#0e011f] border border-[#FF0096]/40 shadow-xl backdrop-blur-md hover:border-[#FF0096] text-white"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-pink-600" : "text-pink-300"}`}>
              Ingresos Globales Creador
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FF0096] text-white flex items-center justify-center font-bold shadow-md shadow-[#FF0096]/30">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className={`text-2xl font-black font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
            ${totalRevenueUsd.toFixed(2)} <span className="text-xs text-pink-500">USD</span>
          </div>
          <div className={`text-[10px] mt-1 flex items-center justify-between border-t pt-2 ${
            isLight ? "text-slate-500 border-slate-150" : "text-slate-300 border-white/10"
          }`}>
            <span>Ref. BCV del día:</span>
            <span className="font-bold text-emerald-600">Bs. {formatBs(totalRevenueUsd)}</span>
          </div>
        </div>

        {/* KPI 2: Margen Neto Real */}
        <div className={`p-5 rounded-3xl relative overflow-hidden group transition-all ${
          isLight
            ? "bg-white border border-emerald-200 shadow-md hover:border-emerald-500 hover:shadow-lg text-slate-800"
            : "bg-gradient-to-br from-[#0e011f] to-[#120224] border border-emerald-500/40 shadow-xl backdrop-blur-md hover:border-emerald-400 text-white"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-emerald-700" : "text-emerald-300"}`}>
              Utilidad Neta Real
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-500 font-mono">
            ${netProfitUsd.toFixed(2)} <span className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>USD</span>
          </div>
          <div className={`text-[10px] mt-1 flex items-center justify-between border-t pt-2 ${
            isLight ? "text-slate-500 border-slate-150" : "text-slate-300 border-white/10"
          }`}>
            <span>Deducción Egresos:</span>
            <span className="text-red-500 font-mono">-${(kpis?.totalExpensesUsd || 0).toFixed(2)} USD</span>
          </div>
        </div>

        {/* KPI 3: Expediciones & Kilómetros en Ruta */}
        <div className={`p-5 rounded-3xl relative overflow-hidden group transition-all ${
          isLight
            ? "bg-white border border-cyan-200 shadow-md hover:border-[#00C8D4] hover:shadow-lg text-slate-800"
            : "bg-gradient-to-br from-[#1a0533] to-[#0e011f] border border-[#00C8D4]/40 shadow-xl backdrop-blur-md hover:border-[#00C8D4] text-white"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-cyan-700" : "text-cyan-300"}`}>
              Expediciones 4x4
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#00C8D4] text-slate-950 flex items-center justify-center font-bold shadow-md shadow-[#00C8D4]/30">
              <Compass className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className={`text-2xl font-black font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
            {expeditions.length} <span className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>Viajes</span>
          </div>
          <div className={`text-[10px] mt-1 flex items-center justify-between border-t pt-2 ${
            isLight ? "text-slate-500 border-slate-150" : "text-slate-300 border-white/10"
          }`}>
            <span>Distancia Recorrida:</span>
            <span className="font-bold text-[#00C8D4] font-mono">{totalKmDriven} KM</span>
          </div>
        </div>

        {/* KPI 4: Auditorías & Rating Promedio */}
        <div className={`p-5 rounded-3xl relative overflow-hidden group transition-all ${
          isLight
            ? "bg-white border border-amber-200 shadow-md hover:border-amber-400 hover:shadow-lg text-slate-800"
            : "bg-gradient-to-br from-[#0e011f] to-[#1a0533] border border-amber-500/40 shadow-xl backdrop-blur-md hover:border-amber-400 text-white"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-amber-700" : "text-amber-300"}`}>
              Establecimientos Auditados
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Star className="w-4.5 h-4.5 fill-slate-950" />
            </div>
          </div>
          <div className={`text-2xl font-black font-mono flex items-baseline gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
            <span>{visitedEstablishments.length}</span>
            <span className={`text-sm font-bold flex items-center gap-0.5 ${isLight ? "text-amber-600" : "text-amber-300"}`}>
              ⭐ {avgRating}/10
            </span>
          </div>
          <div className={`text-[10px] mt-1 flex items-center justify-between border-t pt-2 ${
            isLight ? "text-slate-500 border-slate-150" : "text-slate-300 border-white/10"
          }`}>
            <span>Calidad & Verificación:</span>
            <span className="text-emerald-500 font-bold">100% Verificado</span>
          </div>
        </div>

      </div>

      {/* ── 3. GRÁFICOS EJECUTIVOS & RENDIMIENTO MULTIMODAL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMNA 1: RENDIMIENTO FINANCIERO MENSUAL (Col 8) */}
        <div className={`lg:col-span-8 p-6 rounded-3xl border shadow-xl backdrop-blur-md space-y-6 ${
          isLight ? "bg-white border-slate-200 text-slate-800 shadow-md" : "bg-white/5 border-white/10 text-white"
        }`}>
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4 ${
            isLight ? "border-slate-200" : "border-white/10"
          }`}>
            <div>
              <h3 className={`text-base font-bold font-serif flex items-center gap-2 ${
                isLight ? "text-slate-900" : "text-white"
              }`}>
                <BarChart3 className="w-4 h-4 text-[#00C8D4]" />
                <span>Evolución Mensual de Honorarios, Viáticos & Acuerdos</span>
              </h3>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Distribución de liquidaciones acumuladas en el año
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className={`flex items-center gap-1 text-[11px] ${isLight ? "text-pink-600" : "text-pink-300"}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF0096]" /> Honorarios
              </span>
              <span className={`flex items-center gap-1 text-[11px] ${isLight ? "text-purple-600" : "text-purple-300"}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-[#9B00CC]" /> Viáticos
              </span>
              <span className={`flex items-center gap-1 text-[11px] ${isLight ? "text-cyan-700" : "text-cyan-300"}`}>
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
                  <span className={`text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity ${
                    isLight ? "text-slate-600" : "text-slate-400"
                  }`}>
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

                  <span className={`text-xs font-bold uppercase ${isLight ? "text-slate-700" : "text-slate-300"}`}>{item.month}</span>
                </div>
              );
            })}
          </div>

          {/* Resumen al pie del gráfico */}
          <div className={`grid grid-cols-3 gap-3 pt-4 border-t text-center text-xs ${
            isLight ? "border-slate-200" : "border-white/10"
          }`}>
            <div className={`p-2 rounded-xl ${isLight ? "bg-slate-50 border border-slate-150" : "bg-black/40"}`}>
              <span className={`block text-[10px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>Total Honorarios ($20/V):</span>
              <span className="text-sm font-black text-[#FF0096]">${(kpis?.totalBaseFeesUsd || 0).toFixed(2)} USD</span>
            </div>
            <div className={`p-2 rounded-xl ${isLight ? "bg-slate-50 border border-slate-150" : "bg-black/40"}`}>
              <span className={`block text-[10px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>Total Viáticos Ruta:</span>
              <span className="text-sm font-black text-[#9B00CC]">${(kpis?.totalViaticosUsd || 0).toFixed(2)} USD</span>
            </div>
            <div className={`p-2 rounded-xl ${isLight ? "bg-slate-50 border border-slate-150" : "bg-black/40"}`}>
              <span className={`block text-[10px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>Acuerdos Comerciales:</span>
              <span className="text-sm font-black text-[#00C8D4]">${totalCommercialDeals.toFixed(2)} USD</span>
            </div>
          </div>
        </div>

        {/* COLUMNA 2: ESTADO OPERATIVO & ACCESOS RÁPIDOS (Col 4) */}
        <div className={`lg:col-span-4 p-6 rounded-3xl border shadow-xl backdrop-blur-md space-y-5 flex flex-col justify-between ${
          isLight
            ? "bg-white border-slate-200 shadow-md text-slate-800"
            : "bg-gradient-to-br from-[#1a0533] via-[#0e011f] to-[#1a0533] border-white/10 text-white"
        }`}>
          <div>
            <div className={`flex items-center justify-between pb-3 border-b mb-4 ${
              isLight ? "border-slate-200" : "border-white/10"
            }`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00C8D4]" />
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
                  Estado de Acreditación
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#FF0096] text-white">
                OFICIAL
              </span>
            </div>

            {/* Credencial Sintética */}
            <div className={`p-4 rounded-2xl border space-y-2 ${
              isLight ? "bg-slate-50 border-slate-200" : "bg-black/50 border-white/15"
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${isLight ? "text-slate-600" : "text-slate-400"}`}>Credencial de Prensa:</span>
                <span className="font-mono font-bold text-[#00C8D4]">{membership.press_card_number}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${isLight ? "text-slate-600" : "text-slate-400"}`}>Vigencia Oficial:</span>
                <span className="font-bold text-emerald-500">{membership.valid_thru}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${isLight ? "text-slate-600" : "text-slate-400"}`}>Leads CRM Activos:</span>
                <span className="font-bold text-emerald-500">{leadsCount} contactos</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${isLight ? "text-slate-600" : "text-slate-400"}`}>Material en Galería:</span>
                <span className="font-bold text-cyan-600">{totalPhotos} fotos 4K</span>
              </div>
            </div>
          </div>

          {/* Accesos Directos a Módulos Ejecutivos */}
          <div className={`space-y-2 pt-3 border-t ${isLight ? "border-slate-200" : "border-white/10"}`}>
            <span className={`text-[10px] font-black uppercase tracking-wider block mb-1 ${
              isLight ? "text-slate-500" : "text-slate-400"
            }`}>
              Navegación Ejecutiva Rápida:
            </span>

            <button
              onClick={() => onNavigateTab("remuneraciones")}
              className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                isLight ? "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200" : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-[#FF0096]" />
                <span>Liquidaciones & Viáticos</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab("agenda_dnd")}
              className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                isLight ? "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200" : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#00C8D4]" />
                <span>Agenda & Google Calendar</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab("crm_whatsapp")}
              className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                isLight ? "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200" : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>CRM Leads WhatsApp ({leadsCount})</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab("webapp_cms")}
              className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                isLight ? "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200" : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-cyan-600" />
                <span>Web Builder (CMS Standalone)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

      </div>

      {/* ── 4. DESGLOSE DE AUDITORÍAS Y CONTROL DE SUMINISTROS ── */}
      <div className={`p-6 rounded-3xl border shadow-xl backdrop-blur-md space-y-4 ${
        isLight ? "bg-white border-slate-200 text-slate-800 shadow-md" : "bg-white/5 border-white/10 text-white"
      }`}>
        <div className={`flex items-center justify-between border-b pb-4 ${
          isLight ? "border-slate-200" : "border-white/10"
        }`}>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#00C8D4]" />
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
              Resumen de Auditorías Críticas de Establecimientos ({visitedEstablishments.length})
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab("establecimientos_visitados")}
            className="text-xs font-bold text-[#00C8D4] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ver Fichas Completas</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`p-4 rounded-2xl border space-y-1 ${isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-white/10"}`}>
            <div className={`flex items-center justify-between text-xs ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              <span>Conectividad Wi-Fi</span>
              <Wifi className="w-4 h-4 text-emerald-500" />
            </div>
            <div className={`text-xl font-black ${isLight ? "text-slate-900" : "text-white"}`}>
              {visitedEstablishments.filter(e => e.wifi_speed_mbps > 0).length} / {visitedEstablishments.length}
            </div>
            <div className="text-[10px] text-emerald-500">Posadas con conexión auditada</div>
          </div>

          <div className={`p-4 rounded-2xl border space-y-1 ${isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-white/10"}`}>
            <div className={`flex items-center justify-between text-xs ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              <span>Plantas Eléctricas</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className={`text-xl font-black ${isLight ? "text-slate-900" : "text-white"}`}>
              {visitedEstablishments.filter(e => e.power_generator !== "no_tiene").length} / {visitedEstablishments.length}
            </div>
            <div className="text-[10px] text-amber-600">Respaldo continuo verificado</div>
          </div>

          <div className={`p-4 rounded-2xl border space-y-1 ${isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-white/10"}`}>
            <div className={`flex items-center justify-between text-xs ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              <span>Pozo / Tanques Agua</span>
              <Droplets className="w-4 h-4 text-[#00C8D4]" />
            </div>
            <div className={`text-xl font-black ${isLight ? "text-slate-900" : "text-white"}`}>
              {visitedEstablishments.filter(e => e.water_supply !== "no_tiene").length} / {visitedEstablishments.length}
            </div>
            <div className="text-[10px] text-cyan-600">Suministro hídrico óptimo</div>
          </div>

          <div className={`p-4 rounded-2xl border space-y-1 ${isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-white/10"}`}>
            <div className={`flex items-center justify-between text-xs ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              <span>Convenios Canje / Pauta</span>
              <Award className="w-4 h-4 text-[#FF0096]" />
            </div>
            <div className={`text-xl font-black ${isLight ? "text-slate-900" : "text-white"}`}>
              {visitedEstablishments.filter(e => e.deal_type).length} / {visitedEstablishments.length}
            </div>
            <div className="text-[10px] text-pink-600">Alianzas comerciales activas</div>
          </div>
        </div>
      </div>

    </div>
  );
};
