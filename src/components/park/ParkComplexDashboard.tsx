import React, { useState } from "react";
import {
  Waves, ShieldCheck, QrCode, ShoppingBag, Ship, Wallet,
  Utensils, RefreshCw, Sparkles, Building2, ExternalLink, Activity, Calendar
} from "lucide-react";
import { useParkComplexRealtime } from "../../hooks/useParkComplexRealtime";
import { ParkKpiHeader } from "./ParkKpiHeader";
import { ParkQRValidationModal } from "./ParkQRValidationModal";
import { ParkPOSTaquillaModal } from "./ParkPOSTaquillaModal";
import { ParkAttractionsMonitor } from "./ParkAttractionsMonitor";
import { ParkFoodAndBeverage } from "./ParkFoodAndBeverage";
import { ParkExpensesModule } from "./ParkExpensesModule";
import { ParkBoatDispatchModal } from "./ParkBoatDispatchModal";
import { ParkQuickActions } from "./ParkQuickActions";
import { DashboardAgendaCalendar } from "../agenda/DashboardAgendaCalendar";
import { ConstellationBackground } from "../ConstellationBackground";

interface ParkComplexDashboardProps {
  establishment?: {
    id: number;
    name: string;
    slug?: string;
    category_name?: string;
  } | null;
  onSwitchToTraditionalDashboard?: () => void;
}

export const ParkComplexDashboard: React.FC<ParkComplexDashboardProps> = ({
  establishment,
  onSwitchToTraditionalDashboard
}) => {
  const estId = establishment?.id || 1;
  const estName = establishment?.name || "El Mundo de los Niños - Parque Acuático & Complejo Turístico";

  const {
    capacity,
    tickets,
    pools,
    boats,
    orders,
    expenses,
    kpis,
    loading,
    validateQrTicket,
    issuePosTicket,
    updatePoolStatus,
    dispatchBoat,
    dockBoat,
    createFoodOrder,
    addExpense,
    refresh
  } = useParkComplexRealtime(estId);

  // Modals visibility state
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [isBoatModalOpen, setIsBoatModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<"operaciones" | "restaurante" | "gastos" | "agenda">("operaciones");

  return (
    <div className="relative min-h-screen bg-[#0e011f] text-slate-100 font-sans pb-28">
      {/* Background Constellation Effect */}
      <ConstellationBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Top Corporate Branding & Infrastructure Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#1a0533] via-[#0e011f] to-[#1a0533] border border-white/10 p-6 shadow-2xl backdrop-blur-md mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF0096] via-[#9B00CC] to-[#00C8D4] p-0.5 shadow-xl shadow-[#FF0096]/20 shrink-0">
                <div className="w-full h-full bg-[#0e011f] rounded-[14px] flex items-center justify-center">
                  <Waves className="w-8 h-8 text-[#00C8D4]" />
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-0.5 rounded-full bg-[#FF0096]/20 border border-[#FF0096]/40 text-[#FF0096] text-[10px] font-extrabold uppercase tracking-wider">
                    SUITE DE PARQUE ACUÁTICO & COMPLEJO TURÍSTICO
                  </span>
                  <span className="hidden sm:inline-flex items-center text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <Activity className="w-3 h-3 mr-1 animate-pulse" /> Supabase Realtime Active
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  {estName}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Panel de Operaciones en Vivo • Taquilla Inteligente • Monitor de Piscinas & Lago de Botes
                </p>
              </div>
            </div>

            {/* Infrastructure & View Switcher */}
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
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#00C8D4]" : ""}`} />
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

        {/* 1. Tarjetas Superiores de Métricas (KPIs Operativos en Vivo) */}
        <ParkKpiHeader kpis={kpis} />

        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b border-white/10 pb-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("operaciones")}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === "operaciones"
                ? "bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-white shadow-lg shadow-[#00C8D4]/20"
                : "bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <Waves className="w-4 h-4" />
            <span>Atracciones & Piscinas</span>
          </button>

          <button
            onClick={() => setActiveTab("restaurante")}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === "restaurante"
                ? "bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white shadow-lg shadow-[#FF0096]/20"
                : "bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Alimentos & Bebidas (Restaurante)</span>
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
            <span>Control de Gastos & Cajas</span>
          </button>

          <button
            onClick={() => setActiveTab("agenda")}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === "agenda"
                ? "bg-gradient-to-r from-[#9B00CC] to-[#00C8D4] text-white shadow-lg shadow-[#9B00CC]/20"
                : "bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Agenda & Eventos Drag & Drop</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "operaciones" && (
          <ParkAttractionsMonitor
            pools={pools}
            boats={boats}
            onUpdatePool={updatePoolStatus}
            onDispatchBoat={(boatId) => dispatchBoat(boatId, 4, 4)}
            onDockBoat={dockBoat}
          />
        )}

        {activeTab === "restaurante" && (
          <ParkFoodAndBeverage orders={orders} onCreateOrder={createFoodOrder} />
        )}

        {activeTab === "gastos" && (
          <ParkExpensesModule expenses={expenses} onAddExpense={addExpense} />
        )}

        {activeTab === "agenda" && (
          <DashboardAgendaCalendar establishmentId={estId} portalTitle="Agenda de Eventos & Operaciones del Parque Acuático" themeColor="#00C8D4" />
        )}

      </div>

      {/* Modales Interactivos */}
      <ParkQRValidationModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onValidate={validateQrTicket}
        recentTickets={tickets}
      />

      <ParkPOSTaquillaModal
        isOpen={isPosModalOpen}
        onClose={() => setIsPosModalOpen(false)}
        onIssueTicket={issuePosTicket}
      />

      <ParkBoatDispatchModal
        isOpen={isBoatModalOpen}
        onClose={() => setIsBoatModalOpen(false)}
        boats={boats}
        onDispatch={dispatchBoat}
      />

      {/* Acciones Rápidas Inferiores (Floating Footer Actions) */}
      <ParkQuickActions
        onOpenScanModal={() => setIsQrModalOpen(true)}
        onOpenPosModal={() => setIsPosModalOpen(false || setIsPosModalOpen(true))}
        onOpenBoatModal={() => setIsBoatModalOpen(true)}
        onOpenExpenseModal={() => {
          setActiveTab("gastos");
        }}
      />
    </div>
  );
};
