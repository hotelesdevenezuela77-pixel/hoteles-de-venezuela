import React, { useState } from "react";
import {
  Compass, ShieldCheck, Award, Calendar, Wallet, MapPin,
  RefreshCw, Building2, Activity, Layers, Star, Video, DollarSign, Receipt,
  FileText, Navigation, Tag, Sparkles, Image as ImageIcon, User, Edit3, Camera,
  Phone, Globe
} from "lucide-react";

const InstagramIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);
import { useCreatorInfluencerRealtime } from "../../hooks/useCreatorInfluencerRealtime";
import { CreatorKpiHeader } from "./CreatorKpiHeader";
import { CreatorTripRemunerationModule } from "./CreatorTripRemunerationModule";
import { CreatorVisitedEstablishments } from "./CreatorVisitedEstablishments";
import { CreatorRouteExplorer } from "./CreatorRouteExplorer";
import { CreatorQuotesManager } from "./CreatorQuotesManager";
import { CreatorFinanceMembership } from "./CreatorFinanceMembership";
import { CreatorTravelGallery } from "./CreatorTravelGallery";
import { DashboardAgendaCalendar } from "../agenda/DashboardAgendaCalendar";
import { CreatorImportRouteModal } from "./CreatorImportRouteModal";
import { CreatorProfileEditModal } from "./CreatorProfileEditModal";
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
  | "galeria"
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
    profileInfo,
    galleryAlbums,
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
    updateProfileInfo,
    addGalleryAlbum,
    updateGalleryAlbum,
    deleteGalleryAlbum,
    addPhotoToAlbum,
    deletePhotoFromAlbum,
    addWaypoint,
    updateWaypoint,
    deleteWaypoint,
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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#0e011f] text-slate-100 font-sans pb-16">
      {/* Background Constellation Effect */}
      <ConstellationBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        
        {/* ── HEADER BANNER CON PERFIL DE CREADORA ── */}
        <div className="rounded-3xl bg-gradient-to-r from-[#1a0533] via-[#0e011f] to-[#1a0533] border border-white/10 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            
            {/* Creator Photo + Identity */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative group shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#FF0096] shadow-xl shadow-[#FF0096]/20 bg-slate-900">
                  <img
                    src={profileInfo?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                    alt={profileInfo?.name || creatorName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-xl bg-gradient-to-tr from-[#FF0096] to-[#00C8D4] text-white shadow-md hover:scale-110 transition-all cursor-pointer"
                  title="Cambiar Foto / Editar Perfil"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FF0096]/20 border border-[#FF0096]/40 text-[#FF0096] text-[9px] font-black uppercase tracking-wider">
                    SUITE DE CREADORA & EXPEDICIONES
                  </span>
                  <span className="inline-flex items-center text-[9px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <Activity className="w-2.5 h-2.5 mr-1 animate-pulse" /> Sincronización en Vivo
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight font-serif truncate">
                  {profileInfo?.name || creatorName}
                </h1>
                
                <p className="text-xs text-slate-300 font-medium line-clamp-1">
                  {profileInfo?.headline || "Viajera 4x4, expedicionaria audiovisual & auditora de turismo HDV"}
                </p>

                {/* Social Badges */}
                <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px]">
                  {profileInfo?.instagram && (
                    <span className="px-2 py-0.5 rounded-lg bg-pink-950/60 border border-pink-500/30 text-pink-300 font-bold flex items-center gap-1">
                      <InstagramIcon className="w-3 h-3 text-[#FF0096]" />
                      {profileInfo.instagram}
                    </span>
                  )}
                  {profileInfo?.tiktok && (
                    <span className="px-2 py-0.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-bold flex items-center gap-1">
                      <Video className="w-3 h-3 text-cyan-400" />
                      {profileInfo.tiktok}
                    </span>
                  )}
                  {profileInfo?.location && (
                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#00C8D4]" />
                      {profileInfo.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions & Navigation Controls */}
            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10 flex-wrap">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02]"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#00C8D4]" />
                <span>Editar Perfil</span>
              </button>

              <button
                onClick={refresh}
                className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 transition-all cursor-pointer flex items-center justify-center"
                title="Sincronizar Datos"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#FF0096]" : ""}`} />
              </button>

              {onSwitchToTraditionalDashboard && (
                <button
                  onClick={onSwitchToTraditionalDashboard}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-90 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer border border-white/20 hover:scale-[1.02]"
                >
                  <Building2 className="w-4 h-4 text-white" />
                  <span>⬅ Dashboard Matriz</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* ── 1. MÉTRICAS SUPERIORES (KPIs) ── */}
        <CreatorKpiHeader kpis={kpis} />

        {/* ── 2. BARRA DE PESTAÑAS 100% RESPONSIVE (SIN DESBORDAMIENTOS) ── */}
        <div className="relative border-b border-white/10 pb-3 -mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-nowrap">
            
            {/* 1. Honorarios & Viáticos */}
            <button
              onClick={() => setActiveTab("remuneraciones")}
              className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                activeTab === "remuneraciones"
                  ? "bg-gradient-to-r from-[#FF0096] via-[#9B00CC] to-[#00C8D4] text-white border-white/40 shadow-lg shadow-[#FF0096]/20 font-black ring-2 ring-white/30"
                  : "bg-slate-900/80 hover:bg-slate-800 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              <DollarSign className="w-4 h-4 text-amber-300" />
              <span>Honorarios ($20/Viaje)</span>
            </button>

            {/* 2. Establecimientos Visitados */}
            <button
              onClick={() => setActiveTab("establecimientos_visitados")}
              className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                activeTab === "establecimientos_visitados"
                  ? "bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-white border-white/40 shadow-lg shadow-[#00C8D4]/20 font-black ring-2 ring-white/30"
                  : "bg-slate-900/80 hover:bg-slate-800 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              <Building2 className="w-4 h-4 text-[#00C8D4]" />
              <span>Establecimientos Visitados</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-white font-mono">
                {visitedEstablishments.length}
              </span>
            </button>

            {/* 3. Explorador de Rutas & GPS */}
            <button
              onClick={() => setActiveTab("explorador_rutas")}
              className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                activeTab === "explorador_rutas"
                  ? "bg-gradient-to-r from-[#00C8D4] to-[#FF0096] text-white border-white/40 shadow-lg shadow-[#00C8D4]/20 font-black ring-2 ring-white/30"
                  : "bg-slate-900/80 hover:bg-slate-800 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              <Compass className="w-4 h-4 text-cyan-300" />
              <span>Explorador Satelital GPS</span>
            </button>

            {/* 4. Cotizaciones & Tarifario */}
            <button
              onClick={() => setActiveTab("cotizaciones")}
              className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                activeTab === "cotizaciones"
                  ? "bg-gradient-to-r from-[#9B00CC] to-[#FF0096] text-white border-white/40 shadow-lg shadow-[#9B00CC]/20 font-black ring-2 ring-white/30"
                  : "bg-slate-900/80 hover:bg-slate-800 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4 text-pink-300" />
              <span>Cotizaciones & Tarifario</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-white font-mono">
                {quotes.length}
              </span>
            </button>

            {/* 5. Galería & Bitácora de Viajes */}
            <button
              onClick={() => setActiveTab("galeria")}
              className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                activeTab === "galeria"
                  ? "bg-gradient-to-r from-[#00C8D4] via-[#FF0096] to-[#9B00CC] text-white border-white/40 shadow-lg shadow-[#00C8D4]/20 font-black ring-2 ring-white/30"
                  : "bg-slate-900/80 hover:bg-slate-800 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              <ImageIcon className="w-4 h-4 text-emerald-300" />
              <span>Galería & Bitácora de Viajes</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 text-white font-mono">
                {galleryAlbums.length}
              </span>
            </button>

            {/* 6. Finanzas & Membresía VIP */}
            <button
              onClick={() => setActiveTab("finanzas_membresia")}
              className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                activeTab === "finanzas_membresia"
                  ? "bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white border-white/40 shadow-lg shadow-[#FF0096]/20 font-black ring-2 ring-white/30"
                  : "bg-slate-900/80 hover:bg-slate-800 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              <Wallet className="w-4 h-4 text-emerald-300" />
              <span>Finanzas & Membresía VIP</span>
            </button>

            {/* 7. Agenda Editorial */}
            <button
              onClick={() => setActiveTab("editorial")}
              className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                activeTab === "editorial"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-white/40 shadow-lg shadow-purple-600/20 font-black ring-2 ring-white/30"
                  : "bg-slate-900/80 hover:bg-slate-800 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              <Calendar className="w-4 h-4 text-indigo-300" />
              <span>Agenda Editorial</span>
            </button>

          </div>
        </div>

        {/* ── 3. CONTENIDO DE CADA PESTAÑA ESPECIALIZADA ── */}

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

        {/* 2. Tab Establecimientos Visitados */}
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
            establishmentId={estId}
            creatorName={creatorName}
            expeditions={expeditions}
            waypoints={waypoints}
            onAddWaypoint={addWaypoint}
          />
        )}

        {/* 4. Tab Cotizaciones & Tarifario */}
        {activeTab === "cotizaciones" && (
          <CreatorQuotesManager
            quotes={quotes}
            creatorName={creatorName}
            onAddQuote={addQuote}
            onUpdateQuote={updateQuote}
            onDeleteQuote={deleteQuote}
            onConvertToDeal={convertQuoteToDeal}
          />
        )}

        {/* 5. Tab Galería & Bitácora de Viajes */}
        {activeTab === "galeria" && (
          <CreatorTravelGallery
            albums={galleryAlbums}
            creatorName={creatorName}
            onAddAlbum={addGalleryAlbum}
            onUpdateAlbum={updateGalleryAlbum}
            onDeleteAlbum={deleteGalleryAlbum}
            onAddPhoto={addPhotoToAlbum}
            onDeletePhoto={deletePhotoFromAlbum}
          />
        )}

        {/* 6. Tab Finanzas & Membresía VIP */}
        {activeTab === "finanzas_membresia" && (
          <CreatorFinanceMembership
            kpis={kpis}
            membership={membership}
            expeditions={expeditions}
            deals={deals}
            expenses={routeExpenses}
            creatorName={creatorName}
            onUpdateMembership={updateMembership}
          />
        )}

        {/* 7. Tab Agenda Editorial */}
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

      {/* Modal Editar Perfil & Fotos */}
      <CreatorProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profileInfo}
        onSave={updateProfileInfo}
      />

    </div>
  );
};
