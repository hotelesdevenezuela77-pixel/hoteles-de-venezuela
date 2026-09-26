import React, { useState } from "react";
import {
  Compass, ShieldCheck, Award, Calendar, Wallet, MapPin,
  RefreshCw, Building2, Activity, Layers, Star, Video, DollarSign, Receipt,
  FileText, Navigation, Tag, Sparkles
} from "lucide-react";
import { useCreatorInfluencerRealtime } from "../../hooks/useCreatorInfluencerRealtime";
import { CreatorKpiHeader } from "./CreatorKpiHeader";
import { CreatorTripRemunerationModule } from "./CreatorTripRemunerationModule";
import { CreatorVisitedEstablishments } from "./CreatorVisitedEstablishments";
import { CreatorRouteExplorer } from "./CreatorRouteExplorer";
import { CreatorQuotesManager } from "./CreatorQuotesManager";
import { CreatorFinanceMembership } from "./CreatorFinanceMembership";
import { DashboardAgendaCalendar } from "../agenda/DashboardAgendaCalendar";
import { CreatorImportRouteModal } from "./CreatorImportRouteModal";
import { CreatorQuickActions } from "./CreatorQuickActions";
import { ConstellationBackground } from "../ConstellationBackground";

interface CreatorDashboardProps {
  establishment?: {
    id: number;
    name: string;
    slug?: string;
    category_name?: string;
  } | null;
  onSwitchToTraditionalDashboard?: () => void;
}

export type CreatorTabType = 
  | "remuneraciones" 
  | "establecimientos_visitados" 
  | "explorador_rutas" 
  | "cotizaciones" 
  | "finanzas_membresia" 
  | "editorial";

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  establishment,
  onSwitchToTraditionalDashboard
}) => {
  const estId = establishment?.id || 1;
  const creatorName = establishment?.name || "Aura Croce";

  const {
    expeditions,
    travelAuthorizations,
    visitedEstablishments,
    quotes,
    membership,
    waypoints,
    deals,
    deliverables,
    routeExpenses,
    tasks,
    audits,
    kpis,
    loading,
    addExpedition,
    updateExpedition,
    updateExpeditionPayment,
    deleteExpedition,
    addVisitedEstablishment,
    updateVisitedEstablishment,
    deleteVisitedEstablishment,
    addQuote,
    updateQuote,
    deleteQuote,
    convertQuoteToDeal,
    updateMembership,
    importWaypoints,
    createDeal,
    addRouteExpense,
    addEditorialTask,
    updateTaskStatus,
    addAudit,
    refresh
  } = useCreatorInfluencerRealtime(estId);

  const [activeTab, setActiveTab] = useState<CreatorTabType>("remuneraciones");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#0e011f] text-slate-100 font-sans pb-28">
      {/* Background Constellation Effect */}
      <ConstellationBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Header Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#1a0533] via-[#0e011f] to-[#1a0533] border border-white/10 p-6 shadow-2xl backdrop-blur-md mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF0096] via-[#00C8D4] to-[#9B00CC] p-0.5 shadow-xl shadow-[#FF0096]/20 shrink-0">
                <div className="w-full h-full bg-[#0e011f] rounded-[14px] flex items-center justify-center">
                  <Compass className="w-8 h-8 text-[#FF0096]" />
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-0.5 rounded-full bg-[#FF0096]/20 border border-[#FF0096]/40 text-[#FF0096] text-[10px] font-extrabold uppercase tracking-wider">
                    SUITE PROFESIONAL DE CREADOR & EXPEDICIONES
                  </span>
                  <span className="hidden sm:inline-flex items-center text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <Activity className="w-3 h-3 mr-1 animate-pulse" /> Realtime Sync Active
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 font-serif">
                  {creatorName}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Honorarios ($20/Viaje) • Inventario de Establecimientos Auditados • Explorador Satelital GPS • Cotizaciones & Membresía
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-white/10 text-xs flex items-center space-x-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-[#00C8D4]" />
                <span>Pase de Prensa HDV Activo</span>
              </div>

              <button
                onClick={refresh}
                className="p-2.5 rounded-2xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 transition-all cursor-pointer"
                title="Sincronizar Datos"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#FF0096]" : ""}`} />
              </button>

              {onSwitchToTraditionalDashboard && (
                <button
                  onClick={onSwitchToTraditionalDashboard}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-90 text-white font-extrabold text-xs shadow-lg transition-all flex items-center space-x-2 cursor-pointer border border-white/20 hover:scale-[1.02]"
                >
                  <Building2 className="w-4 h-4 text-white" />
                  <span>⬅ Volver al Dashboard Matriz</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* 1. Métricas Superiores (KPIs de Remuneración, Expedición y Contratos) */}
        <CreatorKpiHeader kpis={kpis} />

        {/* ── BARRA DE PESTAÑAS PRINCIPALES (REDISEÑO ARQUITECTÓNICO SENIOR) ── */}
        <div className="flex space-x-2.5 border-b border-white/10 pb-4 mb-8 overflow-x-auto no-scrollbar">
          
          {/* 1. Honorarios & Viáticos */}
          <button
            onClick={() => setActiveTab("remuneraciones")}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center space-x-2 shrink-0 cursor-pointer border ${
              activeTab === "remuneraciones"
                ? "bg-gradient-to-r from-[#FF0096] via-[#9B00CC] to-[#00C8D4] text-white border-white/40 shadow-lg shadow-[#FF0096]/20 font-black ring-2 ring-white/30"
                : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <DollarSign className="w-4 h-4 text-amber-300" />
            <span>Honorarios & Viáticos ($20/Viaje)</span>
          </button>

          {/* 2. Establecimientos Visitados (Reemplazo de habitaciones) */}
          <button
            onClick={() => setActiveTab("establecimientos_visitados")}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center space-x-2 shrink-0 cursor-pointer border ${
              activeTab === "establecimientos_visitados"
                ? "bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-white border-white/40 shadow-lg shadow-[#00C8D4]/20 font-black ring-2 ring-white/30"
                : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4 text-[#00C8D4]" />
            <span>Establecimientos Visitados & Auditados</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-black/40 text-white font-mono">
              {visitedEstablishments.length}
            </span>
          </button>

          {/* 3. Explorador de Rutas & GPS */}
          <button
            onClick={() => setActiveTab("explorador_rutas")}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center space-x-2 shrink-0 cursor-pointer border ${
              activeTab === "explorador_rutas"
                ? "bg-gradient-to-r from-[#00C8D4] to-[#FF0096] text-white border-white/40 shadow-lg shadow-[#00C8D4]/20 font-black ring-2 ring-white/30"
                : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <Compass className="w-4 h-4 text-cyan-300" />
            <span>Explorador Satelital & GPS</span>
          </button>

          {/* 4. Cotizaciones & Tarifario */}
          <button
            onClick={() => setActiveTab("cotizaciones")}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center space-x-2 shrink-0 cursor-pointer border ${
              activeTab === "cotizaciones"
                ? "bg-gradient-to-r from-[#9B00CC] to-[#FF0096] text-white border-white/40 shadow-lg shadow-[#9B00CC]/20 font-black ring-2 ring-white/30"
                : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4 text-pink-300" />
            <span>Cotizaciones & Tarifario</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-black/40 text-white font-mono">
              {quotes.length}
            </span>
          </button>

          {/* 5. Finanzas & Membresía VIP */}
          <button
            onClick={() => setActiveTab("finanzas_membresia")}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center space-x-2 shrink-0 cursor-pointer border ${
              activeTab === "finanzas_membresia"
                ? "bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white border-white/40 shadow-lg shadow-[#FF0096]/20 font-black ring-2 ring-white/30"
                : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <Wallet className="w-4 h-4 text-emerald-300" />
            <span>Finanzas & Membresía VIP</span>
          </button>

          {/* 6. Agenda Editorial */}
          <button
            onClick={() => setActiveTab("editorial")}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center space-x-2 shrink-0 cursor-pointer border ${
              activeTab === "editorial"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-white/40 shadow-lg shadow-purple-600/20 font-black ring-2 ring-white/30"
                : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-300" />
            <span>Agenda Editorial</span>
          </button>

        </div>

        {/* ── CONTENIDO DE CADA PESTAÑA ESPECIALIZADA ── */}

        {/* 1. Tab Remuneraciones */}
        {activeTab === "remuneraciones" && (
          <CreatorTripRemunerationModule
            expeditions={expeditions}
            travelAuthorizations={travelAuthorizations}
            kpis={kpis}
            creatorName={creatorName}
            onAddExpedition={addExpedition}
            onUpdateExpedition={updateExpedition}
            onUpdatePayment={updateExpeditionPayment}
            onDeleteExpedition={deleteExpedition}
          />
        )}

        {/* 2. Tab Establecimientos Visitados (Reemplazo de habitaciones) */}
        {activeTab === "establecimientos_visitados" && (
          <CreatorVisitedEstablishments
            visitedEstablishments={visitedEstablishments}
            onAddEstablishment={addVisitedEstablishment}
            onUpdateEstablishment={updateVisitedEstablishment}
            onDeleteEstablishment={deleteVisitedEstablishment}
            creatorName={creatorName}
          />
        )}

        {/* 3. Tab Explorador de Rutas & GPS */}
        {activeTab === "explorador_rutas" && (
          <CreatorRouteExplorer
            creatorName={creatorName}
            expeditions={expeditions}
            waypoints={waypoints}
            onAddWaypoint={importWaypoints ? (wp) => importWaypoints([wp]) : undefined}
          />
        )}

        {/* 4. Tab Cotizaciones & Tarifario */}
        {activeTab === "cotizaciones" && (
          <CreatorQuotesManager
            quotes={quotes}
            onAddQuote={addQuote}
            onUpdateQuote={updateQuote}
            onDeleteQuote={deleteQuote}
            onConvertToDeal={convertQuoteToDeal}
            creatorName={creatorName}
          />
        )}

        {/* 5. Tab Finanzas & Membresía */}
        {activeTab === "finanzas_membresia" && (
          <CreatorFinanceMembership
            kpis={kpis}
            membership={membership}
            deals={deals}
            expenses={routeExpenses}
            creatorName={creatorName}
            onUpdateMembership={updateMembership}
          />
        )}

        {/* 6. Tab Agenda Editorial */}
        {activeTab === "editorial" && (
          <DashboardAgendaCalendar
            establishmentId={estId}
            portalTitle={`Agenda Editorial & Entregables de ${creatorName}`}
            themeColor="#FF0096"
          />
        )}

      </div>

      {/* Modal Importar Ruta */}
      <CreatorImportRouteModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportWaypoints={importWaypoints}
      />

      {/* Quick Actions Footer */}
      <CreatorQuickActions
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onNavigateDeals={() => setActiveTab("cotizaciones")}
        onNavigateExpenses={() => setActiveTab("finanzas_membresia")}
        onNavigateCalendar={() => setActiveTab("editorial")}
      />
    </div>
  );
};
