import React, { useState } from "react";
import {
  Compass, ShieldCheck, Ticket, Package, Wallet, Users,
  RefreshCw, Building2, Activity, Layers, FileCheck, Calendar
} from "lucide-react";
import { useAgencyTourOperatorRealtime } from "../../hooks/useAgencyTourOperatorRealtime";
import { AgencyKpiHeader } from "./AgencyKpiHeader";
import { AgencyPackagingEngine } from "./AgencyPackagingEngine";
import { AgencyItineraryBuilder } from "./AgencyItineraryBuilder";
import { AgencySupplierSettlement } from "./AgencySupplierSettlement";
import { AgencyPassengerManifest } from "./AgencyPassengerManifest";
import { AgencyNewQuoteModal } from "./AgencyNewQuoteModal";
import { AgencyQuickActions } from "./AgencyQuickActions";
import { DashboardAgendaCalendar } from "../agenda/DashboardAgendaCalendar";
import { ConstellationBackground } from "../ConstellationBackground";

interface AgencyDashboardProps {
  establishment?: {
    id: number;
    name: string;
    slug?: string;
    category_name?: string;
  } | null;
  onSwitchToTraditionalDashboard?: () => void;
}

export const AgencyDashboard: React.FC<AgencyDashboardProps> = ({
  establishment,
  onSwitchToTraditionalDashboard
}) => {
  const estId = establishment?.id || 1;
  const estName = establishment?.name || "Agencia de Viajes & Operador Turístico VIP";

  const {
    packages,
    quotes,
    passengers,
    itineraries,
    supplierPayments,
    expeditionExpenses,
    kpis,
    loading,
    createQuote,
    createPackage,
    addPassenger,
    addItineraryDay,
    paySupplier,
    addExpeditionExpense,
    refresh
  } = useAgencyTourOperatorRealtime(estId);

  const [activeTab, setActiveTab] = useState<"paquetes" | "itinerarios" | "liquidaciones" | "manifiesto" | "agenda">("paquetes");
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#0e011f] text-slate-100 font-sans pb-28">
      {/* Dynamic Constellation Background */}
      <ConstellationBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Top Header Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#1a0533] via-[#0e011f] to-[#1a0533] border border-white/10 p-6 shadow-2xl backdrop-blur-md mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00C8D4] via-[#9B00CC] to-[#FF0096] p-0.5 shadow-xl shadow-[#00C8D4]/20 shrink-0">
                <div className="w-full h-full bg-[#0e011f] rounded-[14px] flex items-center justify-center">
                  <Compass className="w-8 h-8 text-[#00C8D4]" />
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-0.5 rounded-full bg-[#00C8D4]/20 border border-[#00C8D4]/40 text-[#00C8D4] text-[10px] font-extrabold uppercase tracking-wider">
                    SUITE AGENCIA DE VIAJES, TOUR OPERADOR & DMC
                  </span>
                  <span className="hidden sm:inline-flex items-center text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <Activity className="w-3 h-3 mr-1 animate-pulse" /> Realtime Sync Active
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                  {estName}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Consola de Operaciones de Campo • Empaquetado Dinámico • Liquidaciones B2B & Manifiesto de Pasajeros
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

        {/* 1. Métricas Superiores (KPIs Comerciales y Logísticos) */}
        <AgencyKpiHeader kpis={kpis} />

        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b border-white/10 pb-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("paquetes")}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === "paquetes"
                ? "bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-white shadow-lg shadow-[#00C8D4]/20"
                : "bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Creador de Paquetes & Markup</span>
          </button>

          <button
            onClick={() => setActiveTab("itinerarios")}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === "itinerarios"
                ? "bg-gradient-to-r from-[#9B00CC] to-[#FF0096] text-white shadow-lg shadow-[#9B00CC]/20"
                : "bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Itinerarios & Voucher Digital</span>
          </button>

          <button
            onClick={() => setActiveTab("liquidaciones")}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === "liquidaciones"
                ? "bg-gradient-to-r from-amber-500 to-amber-700 text-white shadow-lg shadow-amber-500/20"
                : "bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Liquidaciones B2B & Gastos</span>
          </button>

          <button
            onClick={() => setActiveTab("manifiesto")}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === "manifiesto"
                ? "bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white shadow-lg shadow-[#FF0096]/20"
                : "bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Manifiesto de Pasajeros (Rooming)</span>
          </button>

          <button
            onClick={() => setActiveTab("agenda")}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === "agenda"
                ? "bg-gradient-to-r from-[#00C8D4] to-[#FF0096] text-white shadow-lg shadow-[#00C8D4]/20"
                : "bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Agenda & Salidas Drag & Drop</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "paquetes" && (
          <AgencyPackagingEngine packages={packages} onCreatePackage={createPackage} />
        )}

        {activeTab === "itinerarios" && (
          <AgencyItineraryBuilder quotes={quotes} itineraries={itineraries} onAddItineraryDay={addItineraryDay} />
        )}

        {activeTab === "liquidaciones" && (
          <AgencySupplierSettlement payments={supplierPayments} expenses={expeditionExpenses} onPaySupplier={paySupplier} onAddExpense={addExpeditionExpense} />
        )}

        {activeTab === "manifiesto" && (
          <AgencyPassengerManifest passengers={passengers} onAddPassenger={addPassenger} />
        )}

        {activeTab === "agenda" && (
          <DashboardAgendaCalendar establishmentId={estId} portalTitle="Agenda de Salidas, Itinerarios & Operaciones DMC" themeColor="#9B00CC" />
        )}

      </div>

      {/* Modal Nueva Cotización */}
      <AgencyNewQuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        packages={packages}
        onCreateQuote={createQuote}
      />

      {/* Quick Actions Footer */}
      <AgencyQuickActions
        onOpenNewQuoteModal={() => setIsQuoteModalOpen(true)}
        onNavigateItinerary={() => setActiveTab("itinerarios")}
        onEmitVoucher={() => setActiveTab("itinerarios")}
        onOpenPaySupplierModal={() => setActiveTab("liquidaciones")}
      />
    </div>
  );
};
