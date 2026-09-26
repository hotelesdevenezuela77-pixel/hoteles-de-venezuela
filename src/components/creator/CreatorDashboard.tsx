import React, { useState } from "react";
import {
  Compass, ShieldCheck, Award, Calendar, Wallet, MapPin,
  RefreshCw, Building2, Activity, Layers, Star, Video, DollarSign, Receipt,
  FileText, Navigation, Tag, Sparkles, Image as ImageIcon, User, Edit3, Camera,
  Phone, Globe, MessageSquare, Wrench, Clipboard, CheckSquare, BarChart3, TrendingUp
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
import { CreatorExecutiveStatsDashboard } from "./CreatorExecutiveStatsDashboard";
import { CreatorTripRemunerationModule } from "./CreatorTripRemunerationModule";
import { CreatorVisitedEstablishments } from "./CreatorVisitedEstablishments";
import { CreatorRouteExplorer } from "./CreatorRouteExplorer";
import { CreatorQuotesManager } from "./CreatorQuotesManager";
import { CreatorFinanceMembership } from "./CreatorFinanceMembership";
import { CreatorTravelGallery } from "./CreatorTravelGallery";
import { CreatorImportRouteModal } from "./CreatorImportRouteModal";
import { CreatorProfileEditModal } from "./CreatorProfileEditModal";
import { ConstellationBackground } from "../ConstellationBackground";

// Módulos Ejecutivos
import { OwnerAgendaModule } from "../owner/OwnerAgendaModule";
import { OwnerWhatsAppCRMModule } from "../owner/OwnerWhatsAppCRMModule";
import { OwnerTechnicalSupportModule } from "../owner/OwnerTechnicalSupportModule";
import { CMSModule } from "../../tenants/templates/components/CMSModule";
import { AdvancedTaskOperationsModule } from "../../tenants/templates/components/AdvancedTaskOperationsModule";
import type { TenantConfig } from "../../tenants/tenantContext";

interface CreatorDashboardProps {
  establishment?: {
    id: number;
    name: string;
    slug?: string;
    category_name?: string;
    phone?: string;
    whatsapp?: string;
  } | null;
  onSwitchToTraditionalDashboard?: () => void;
}

export type CreatorTabType = 
  | "dashboard_ejecutivo"
  | "remuneraciones" 
  | "agenda_dnd"
  | "crm_whatsapp"
  | "soporte_dnd"
  | "webapp_cms"
  | "tareas_saas"
  | "establecimientos_visitados" 
  | "explorador_rutas" 
  | "cotizaciones" 
  | "galeria"
  | "finanzas_membresia";

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
    routeExpenses,
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
    importWaypoints,
    refresh
  } = useCreatorInfluencerRealtime(estId);

  const [activeTab, setActiveTab] = useState<CreatorTabType>("dashboard_ejecutivo");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Contador de leads de WhatsApp (CRM)
  const [leadsCount, setLeadsCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(`hdv_owner_wa_leads_${estId}`);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length > 0) return arr.length;
      }
    } catch (e) {}
    return 10;
  });

  // Configuración WebApp / CMS Builder
  const [tenantConfig, setTenantConfig] = useState<TenantConfig>(() => {
    try {
      const raw = localStorage.getItem("hdv_tenants_configurations");
      if (raw) {
        const list: TenantConfig[] = JSON.parse(raw);
        const match = list.find(t => t.establishment_id === estId || t.slug === (establishment?.slug || "influencer-aura-croce"));
        if (match) return match;
      }
    } catch (e) {}

    return {
      establishment_id: estId,
      slug: establishment?.slug || "influencer-aura-croce",
      name: profileInfo?.name || creatorName,
      template: "A",
      domain: `${(profileInfo?.name || creatorName).toLowerCase().replace(/\s+/g, '')}.hotelesdevenezuela.com`,
      branding: {
        primary_color: "#FF0096",
        secondary_color: "#9B00CC",
        accent_color: "#00C8D4",
        font_title: "Playfair Display",
        font_body: "Montserrat",
        logo_url: profileInfo?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        banner_url: profileInfo?.banner_url || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&auto=format&fit=crop"
      },
      modules: {
        reservas: true,
        pos: false,
        galeria: true,
        contacto: true,
        cms: true
      },
      contact: {
        phone: profileInfo?.phone || establishment?.phone || "+58 414 123 4567",
        whatsapp: profileInfo?.phone || establishment?.whatsapp || "+58 414 123 4567",
        email: "contacto@auracroce.com",
        instagram: profileInfo?.instagram || "@auracroce"
      }
    };
  });

  const handleTenantConfigChange = (updated: TenantConfig) => {
    setTenantConfig(updated);
    try {
      const raw = localStorage.getItem("hdv_tenants_configurations");
      let list: TenantConfig[] = raw ? JSON.parse(raw) : [];
      const idx = list.findIndex(t => t.establishment_id === updated.establishment_id || t.slug === updated.slug);
      if (idx >= 0) list[idx] = updated;
      else list.push(updated);
      localStorage.setItem("hdv_tenants_configurations", JSON.stringify(list));
      window.dispatchEvent(new Event("hdv_tenant_config_changed"));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {}
  };

  const CREATOR_TABS: {
    id: CreatorTabType;
    label: string;
    icon: any;
    badge?: string;
    badgeColor?: string;
    accentGlow: string;
  }[] = [
    {
      id: "dashboard_ejecutivo",
      label: "Dashboard Ejecutivo",
      icon: BarChart3,
      badge: "Estadísticas",
      badgeColor: "bg-[#00C8D4]/20 text-[#00C8D4] border-[#00C8D4]/40",
      accentGlow: "from-[#00C8D4] to-[#9B00CC]"
    },
    {
      id: "remuneraciones",
      label: "Honorarios & Viáticos",
      icon: DollarSign,
      badge: "$20 Base",
      badgeColor: "bg-[#FF0096]/20 text-[#FF0096] border-[#FF0096]/40",
      accentGlow: "from-[#FF0096] via-[#9B00CC] to-[#00C8D4]"
    },
    {
      id: "agenda_dnd",
      label: "Agenda & Calendario",
      icon: Calendar,
      badge: "Drag & Drop",
      badgeColor: "bg-[#00C8D4]/20 text-[#00C8D4] border-[#00C8D4]/40",
      accentGlow: "from-[#00C8D4] to-[#9B00CC]"
    },
    {
      id: "crm_whatsapp",
      label: "CRM Leads WhatsApp",
      icon: MessageSquare,
      badge: `${leadsCount} Leads`,
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      accentGlow: "from-emerald-500 to-teal-600"
    },
    {
      id: "soporte_dnd",
      label: "Soporte Técnico",
      icon: Wrench,
      badge: "Tickets D&D",
      badgeColor: "bg-[#FF0096]/20 text-[#FF0096] border-[#FF0096]/40",
      accentGlow: "from-[#9B00CC] to-[#FF0096]"
    },
    {
      id: "webapp_cms",
      label: "Aplicación Web & CMS",
      icon: Globe,
      badge: "Web Builder",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      accentGlow: "from-[#00C8D4] via-[#FF0096] to-[#9B00CC]"
    },
    {
      id: "tareas_saas",
      label: "Gestión de Tareas",
      icon: Clipboard,
      badge: "SaaS",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
      accentGlow: "from-purple-600 to-indigo-600"
    },
    {
      id: "establecimientos_visitados",
      label: "Establecimientos Auditados",
      icon: Building2,
      badge: `${visitedEstablishments.length} Lugares`,
      badgeColor: "bg-[#00C8D4]/20 text-[#00C8D4] border-[#00C8D4]/40",
      accentGlow: "from-[#00C8D4] to-[#9B00CC]"
    },
    {
      id: "explorador_rutas",
      label: "Explorador GPS Satelital",
      icon: Compass,
      badge: "4K Track",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      accentGlow: "from-[#00C8D4] to-[#FF0096]"
    },
    {
      id: "cotizaciones",
      label: "Cotizaciones & Tarifario",
      icon: FileText,
      badge: `${quotes.length} Pautas`,
      badgeColor: "bg-[#FF0096]/20 text-[#FF0096] border-[#FF0096]/40",
      accentGlow: "from-[#9B00CC] to-[#FF0096]"
    },
    {
      id: "galeria",
      label: "Galería & Bitácora 4K",
      icon: ImageIcon,
      badge: `${galleryAlbums.length} Viajes`,
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      accentGlow: "from-[#00C8D4] via-[#FF0096] to-[#9B00CC]"
    },
    {
      id: "finanzas_membresia",
      label: "Finanzas & Pase VIP",
      icon: Wallet,
      badge: "Prensa HDV",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      accentGlow: "from-[#FF0096] to-[#9B00CC]"
    }
  ];

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
                    SUITE EJECUTIVA DE CREADORA & EXPEDICIONES
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

        {/* ── 2. MENÚ DE ÁREAS Y MÓDULOS MULTI-LÍNEA 100% RESPONSIVE (SIN CORTES NI BOTONES MOCHOS) ── */}
        <div className="space-y-3 p-4 sm:p-5 rounded-3xl bg-[#1a0533]/80 border border-white/10 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00C8D4]" />
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">
                Módulos de Gestión Ejecutiva & Expediciones de Creador
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              12 Áreas Operativas Disponibles
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {CREATOR_TABS.map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between gap-2 cursor-pointer group ${
                    active
                      ? `bg-gradient-to-br ${tab.accentGlow} text-white border-white/40 shadow-xl shadow-[#FF0096]/20 ring-2 ring-white/30 scale-[1.02]`
                      : "bg-[#0e011f]/90 hover:bg-white/10 text-slate-300 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 w-full">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        active ? "bg-black/40 text-white" : "bg-black/50 text-[#00C8D4] border border-white/10"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    {tab.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0 border ${
                          active
                            ? "bg-black/40 text-white border-white/30"
                            : tab.badgeColor
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </div>

                  <span className={`text-xs font-black tracking-tight leading-snug break-words ${
                    active ? "text-white" : "text-slate-200"
                  }`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. CONTENIDO DE CADA PESTAÑA ── */}

        {/* 0. Tab Dashboard Ejecutivo con Estadísticas */}
        {activeTab === "dashboard_ejecutivo" && (
          <CreatorExecutiveStatsDashboard
            creatorName={creatorName}
            profileInfo={profileInfo}
            membership={membership}
            expeditions={expeditions}
            visitedEstablishments={visitedEstablishments}
            quotes={quotes}
            deals={deals}
            expenses={routeExpenses}
            galleryAlbums={galleryAlbums}
            kpis={kpis}
            leadsCount={leadsCount}
            onNavigateTab={(tabId) => setActiveTab(tabId as CreatorTabType)}
          />
        )}

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

        {/* 2. Tab Agenda & Calendario Drag & Drop */}
        {activeTab === "agenda_dnd" && (
          <div className="space-y-6">
            <OwnerAgendaModule
              establishmentId={estId}
              establishmentName={creatorName}
            />
          </div>
        )}

        {/* 3. Tab CRM Leads WhatsApp */}
        {activeTab === "crm_whatsapp" && (
          <div className="space-y-6">
            <OwnerWhatsAppCRMModule
              establishmentId={estId}
              establishmentName={creatorName}
              whatsappNumber={profileInfo?.phone || establishment?.phone || "+584141234567"}
            />
          </div>
        )}

        {/* 4. Tab Soporte Técnico Tickets D&D */}
        {activeTab === "soporte_dnd" && (
          <div className="space-y-6">
            <OwnerTechnicalSupportModule
              establishmentId={estId}
              establishmentName={creatorName}
            />
          </div>
        )}

        {/* 5. Tab Aplicación Web & CMS Web Builder */}
        {activeTab === "webapp_cms" && (
          <div className="space-y-6">
            <CMSModule
              config={tenantConfig}
              onConfigChange={handleTenantConfigChange}
              primaryColor="#FF0096"
              secondaryColor="#9B00CC"
              accentColor="#00C8D4"
            />
          </div>
        )}

        {/* 6. Tab Gestión de Tareas */}
        {activeTab === "tareas_saas" && (
          <div className="space-y-6">
            <AdvancedTaskOperationsModule
              establishmentId={estId}
              primaryColor="#00C8D4"
              secondaryColor="#9B00CC"
              accentColor="#FF0096"
            />
          </div>
        )}

        {/* 7. Tab Establecimientos Visitados */}
        {activeTab === "establecimientos_visitados" && (
          <CreatorVisitedEstablishments
            visitedEstablishments={visitedEstablishments}
            onAddEstablishment={addVisitedEstablishment}
            onUpdateEstablishment={updateVisitedEstablishment}
            onDeleteEstablishment={deleteVisitedEstablishment}
            creatorName={creatorName}
          />
        )}

        {/* 8. Tab Explorador de Rutas & GPS */}
        {activeTab === "explorador_rutas" && (
          <CreatorRouteExplorer
            establishmentId={estId}
            creatorName={creatorName}
            expeditions={expeditions}
            waypoints={waypoints}
            onAddWaypoint={addWaypoint}
          />
        )}

        {/* 9. Tab Cotizaciones & Tarifario */}
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

        {/* 10. Tab Galería & Bitácora de Viajes */}
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

        {/* 11. Tab Finanzas & Membresía VIP */}
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
