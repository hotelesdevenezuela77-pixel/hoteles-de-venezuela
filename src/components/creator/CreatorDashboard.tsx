import React, { useState } from "react";
import {
  Compass, ShieldCheck, Award, Calendar, Wallet, MapPin,
  RefreshCw, Building2, Activity, Layers, Star, Video
} from "lucide-react";
import { useCreatorInfluencerRealtime } from "../../hooks/useCreatorInfluencerRealtime";
import { CreatorKpiHeader } from "./CreatorKpiHeader";
import { CreatorMapHub } from "./CreatorMapHub";
import { CreatorEditorialCalendar } from "./CreatorEditorialCalendar";
import { CreatorDealsManager } from "./CreatorDealsManager";
import { CreatorRouteExpenses } from "./CreatorRouteExpenses";
import { CreatorAuditHub } from "./CreatorAuditHub";
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

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  establishment,
  onSwitchToTraditionalDashboard
}) => {
  const estId = establishment?.id || 1;
  const creatorName = establishment?.name || "Creador de Contenido & Embajador de Viajes VIP";

  const {
    expeditions,
    waypoints,
    deals,
    deliverables,
    routeExpenses,
    tasks,
    audits,
    kpis,
    loading,
    importWaypoints,
    createDeal,
    addRouteExpense,
    addEditorialTask,
    updateTaskStatus,
    addAudit,
    refresh
  } = useCreatorInfluencerRealtime(estId);

  const [activeTab, setActiveTab] = useState<"rutas" | "editorial" | "marcas" | "gastos" | "auditorias">("rutas");
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
                    ESTACIÓN DE TRABAJO POST-EXPEDICIÓN (DESK HUB)
                  </span>
                  <span className="hidden sm:inline-flex items-center text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <Activity className="w-3 h-3 mr-1 animate-pulse" /> Realtime Sync Active
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  {creatorName}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Trazador de Coordenadas GPS • Calendario Editorial Drag & Drop • Auditorías Técnicas de Posadas
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-white/10 text-xs flex items-center space-x-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-[#00C8D4]" />
                <span>Infraestructura Cloudflare Edge</span>
              </div>

              <button
                onClick={refresh}
                className="p-2.5 rounded-2xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 transition-all"
                title="Sincronizar Datos"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#FF0096]" : ""}`} />
              </button>

              {onSwitchToTraditionalDashboard && (
                <button
                  onClick={onSwitchToTraditionalDashboard}
                  className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 font-semibold text-xs transition-all flex items-center space-x-1.5"
                >
                  <Building2 className="w-4 h-4 text-purple-400" />
                  <span>Vista Posada / Hotel</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* 1. Métricas Superiores (KPIs de Expedición y Contratos) */}
        <CreatorKpiHeader kpis={kpis} />

        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b border-white/10 pb-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("rutas")}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === "rutas"
                ? "bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-white shadow-lg shadow-[#00C8D4]/20"
                : "bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Rutas Satelitales & GPS</span>
          </button>

          <button
            onClick={() => setActiveTab("editorial")}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === "editorial"
                ? "bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white shadow-lg shadow-[#FF0096]/20"
                : "bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Calendario Editorial Drag & Drop</span>
          </button>

          <button
            onClick={() => setActiveTab("marcas")}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === "marcas"
                ? "bg-gradient-to-r from-[#9B00CC] to-[#00C8D4] text-white shadow-lg shadow-[#9B00CC]/20"
                : "bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Acuerdos de Marca & Canjes</span>
          </button>

          <button
            onClick={() => setActiveTab("gastos")}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === "gastos"
                ? "bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-600/20"
                : "bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Gastos de Expedición</span>
          </button>

          <button
            onClick={() => setActiveTab("auditorias")}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === "auditorias"
                ? "bg-gradient-to-r from-[#00C8D4] to-[#FF0096] text-white shadow-lg shadow-[#00C8D4]/20"
                : "bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Auditorías Técnicas (Audit Hub)</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "rutas" && (
          <CreatorMapHub expeditions={expeditions} waypoints={waypoints} onImportWaypoints={importWaypoints} />
        )}

        {activeTab === "editorial" && (
          <CreatorEditorialCalendar tasks={tasks} onAddTask={addEditorialTask} onUpdateStatus={updateTaskStatus} />
        )}

        {activeTab === "marcas" && (
          <CreatorDealsManager deals={deals} onCreateDeal={createDeal} />
        )}

        {activeTab === "gastos" && (
          <CreatorRouteExpenses expenses={routeExpenses} onAddExpense={addRouteExpense} />
        )}

        {activeTab === "auditorias" && (
          <CreatorAuditHub audits={audits} onAddAudit={addAudit} />
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
        onNavigateDeals={() => setActiveTab("marcas")}
        onNavigateExpenses={() => setActiveTab("gastos")}
        onNavigateCalendar={() => setActiveTab("editorial")}
      />
    </div>
  );
};
