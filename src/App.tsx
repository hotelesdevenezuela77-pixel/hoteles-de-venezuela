import React, { Component, useEffect, lazy, Suspense, type ErrorInfo, type ReactNode } from "react";
import { Switch, Route, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./lib/auth";
import { supabase } from "./lib/supabase";
import { Mantenimiento } from "./pages/Mantenimiento";
import { MainLayout } from "./components/layout/MainLayout";
import { Home } from "./pages/Home";
import { TENANTS_REGISTRY } from "./tenants/tenantContext";
import { AdminLayout } from "./components/admin/AdminLayout";

// Error Boundary para capturar fallos de carga de chunks y JS desactualizado en cliente
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class AppErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AppErrorBoundary capturó un error:", error, errorInfo);
    this.setState({ errorInfo });
    const msg = String(error?.message || "");
    // Si el error es por actualización de chunks de Vite tras despliegue, auto-recargar de forma transparente una vez con cache-buster
    if (
      msg.includes("Failed to fetch dynamically imported module") ||
      msg.includes("Importing a module script failed") ||
      msg.includes("error loading dynamically imported module") ||
      msg.includes("Loading chunk") ||
      msg.includes("is not valid JSON")
    ) {
      const reloadKey = "hdv_chunk_autofix_reload";
      const hasReloaded = typeof window !== "undefined" && sessionStorage.getItem(reloadKey);
      if (!hasReloaded && typeof window !== "undefined") {
        sessionStorage.setItem(reloadKey, "true");
        window.location.href = window.location.origin + window.location.pathname + "?_nocache=" + Date.now();
      }
    }
  }

  handleReload = () => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
      window.location.href = window.location.origin + window.location.pathname + "?_nocache=" + Date.now();
    }
  };

  handleExitImpersonation = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("hdv_impersonate_owner_user_id");
      localStorage.removeItem("hdv_impersonate_owner_user_name");
      localStorage.removeItem("hdv_impersonate_establishment_id");
      sessionStorage.clear();
      window.location.href = window.location.origin + "/admin/asistencia?_t=" + Date.now();
    }
  };

  handleResetAll = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("hdv_impersonate_owner_user_id");
      localStorage.removeItem("hdv_impersonate_owner_user_name");
      localStorage.removeItem("hdv_impersonate_establishment_id");
      sessionStorage.clear();
      window.location.href = window.location.origin + "/?_t=" + Date.now();
    }
  };

  render() {
    if (this.state.hasError) {
      const isImpersonating = typeof window !== "undefined" && (
        localStorage.getItem("hdv_impersonate_owner_user_id") ||
        localStorage.getItem("hdv_impersonate_establishment_id")
      );
      const isChunkError = this.state.error?.message?.includes("dynamically imported module") ||
        this.state.error?.message?.includes("Importing a module") ||
        this.state.error?.message?.includes("Loading chunk");

      return (
        <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2.5rem 1.5rem", textAlign: "center", fontFamily: "Montserrat, system-ui, -apple-system, sans-serif", backgroundColor: "#f8fafc" }}>
          <div style={{ width: "68px", height: "68px", backgroundColor: "#e6f9fa", border: "2px solid #00C8D4", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "#00C8D4", marginBottom: "1.25rem", boxShadow: "0 10px 25px -5px rgba(0, 200, 212, 0.25)" }}>
            <svg style={{ width: "34px", height: "34px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          
          <span style={{ fontSize: "11px", fontWeight: "900", color: "#FF0096", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "0.5rem" }}>
            {isChunkError ? "Actualización de Plataforma" : "Aviso de Seguridad y Carga"}
          </span>
          
          <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#0f172a", marginBottom: "0.75rem", fontFamily: "Playfair Display, serif" }}>
            {isChunkError ? "Sincronizando Nueva Versión de Software" : "Recuperación de Estado del Panel"}
          </h2>
          
          <p style={{ fontSize: "0.875rem", color: "#64748b", maxWidth: "520px", marginBottom: "1.5rem", lineHeight: "1.6" }}>
            {isChunkError 
              ? "Se han desplegado módulos optimizados en la infraestructura. Haz clic en actualizar para cargar los componentes más recientes de manera limpia."
              : (this.state.error?.message || "Se detectó un cambio de estado en la sesión. Puedes reintentar la carga o reiniciar los parámetros de forma segura.")}
          </p>

          <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "10px", justifyContent: "center", maxWidth: "600px" }}>
            <button
              onClick={this.handleReload}
              style={{ padding: "12px 24px", borderRadius: "14px", background: "linear-gradient(135deg, #00C8D4 0%, #0284c7 100%)", color: "#ffffff", fontWeight: "800", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", border: "none", cursor: "pointer", boxShadow: "0 10px 20px -5px rgba(0, 200, 212, 0.4)" }}
            >
              🔄 Reintentar y Cargar
            </button>

            {isImpersonating && (
              <button
                onClick={this.handleExitImpersonation}
                style={{ padding: "12px 24px", borderRadius: "14px", background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)", color: "#ffffff", fontWeight: "800", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", border: "none", cursor: "pointer", boxShadow: "0 10px 20px -5px rgba(255, 0, 150, 0.35)" }}
              >
                🛡️ Salir de Asistencia y Volver al Panel Admin
              </button>
            )}

            <button
              onClick={this.handleResetAll}
              style={{ padding: "12px 20px", borderRadius: "14px", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", color: "#475569", fontWeight: "700", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer" }}
            >
              🧹 Limpiar Caché y Volver al Inicio
            </button>
          </div>

          {/* Detalles técnicos colapsables para diagnóstico */}
          {this.state.error && (
            <details style={{ marginTop: "2rem", maxWidth: "650px", width: "100%", textAlign: "left", backgroundColor: "#0f172a", borderRadius: "12px", padding: "12px 16px", color: "#94a3b8", fontSize: "11px" }}>
              <summary style={{ cursor: "pointer", fontWeight: "bold", color: "#00C8D4" }}>
                Ver Diagnóstico Técnico
              </summary>
              <pre style={{ marginTop: "8px", overflowX: "auto", whiteSpace: "pre-wrap", color: "#f1f5f9" }}>
                {this.state.error.toString()}
                {"\n"}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

// Helper robusto para importaciones dinámicas nombradas con reintento automático e invalidador de caché
function lazyNamed<T extends Record<string, any>>(
  importFn: () => Promise<T>,
  exportName: keyof T
) {
  return lazy(async () => {
    try {
      const module = await importFn();
      if (!module || !module[exportName]) {
        throw new Error(`Modulo ${String(exportName)} no encontrado`);
      }
      return { default: module[exportName] };
    } catch (error) {
      console.error(`Error al cargar módulo dinámico ${String(exportName)}:`, error);
      const key = `hdv_chunk_reload_${String(exportName)}`;
      const alreadyReloaded = typeof window !== "undefined" && sessionStorage.getItem(key);
      
      if (typeof window !== "undefined" && !alreadyReloaded) {
        sessionStorage.setItem(key, "true");
        window.location.href = window.location.origin + window.location.pathname + "?_nocache=" + Date.now();
        return new Promise<never>(() => {});
      }
      
      throw error;
    }
  });
}

// Wrapper para lazy import con autorecuperación en caso de nuevo despliegue
function lazyWithRetry(importFn: () => Promise<any>) {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.error("Error al cargar chunk dinámico:", error);
      if (typeof window !== "undefined" && !sessionStorage.getItem("hdv_chunk_retry")) {
        sessionStorage.setItem("hdv_chunk_retry", "true");
        window.location.href = window.location.origin + window.location.pathname + "?_nocache=" + Date.now();
        return new Promise<never>(() => {});
      }
      throw error;
    }
  });
}

// Importaciones dinámicas (React.lazy) para optimización masiva de rendimiento
const NotFound = lazyNamed(() => import("./pages/NotFound"), "NotFound");
const Login = lazyNamed(() => import("./pages/Login"), "Login");
const Registro = lazyNamed(() => import("./pages/Registro"), "Registro");
const Perfil = lazyNamed(() => import("./pages/Perfil"), "Perfil");
const AdminLogin = lazyNamed(() => import("./pages/AdminLogin"), "AdminLogin");
const Destinos = lazyNamed(() => import("./pages/Destinos"), "Destinos");
const DestinoDetalle = lazyNamed(() => import("./pages/DestinoDetalle"), "DestinoDetalle");
const Establecimientos = lazyNamed(() => import("./pages/Establecimientos"), "Establecimientos");
const EstablecimientoDetalle = lazyNamed(() => import("./pages/EstablecimientoDetalle"), "EstablecimientoDetalle");
const OwnerDashboard = lazyNamed(() => import("./pages/OwnerDashboard"), "OwnerDashboard");
const AndromedaPanel = lazyNamed(() => import("./pages/AndromedaPanel"), "AndromedaPanel");
const InteractiveMap = lazyNamed(() => import("./pages/InteractiveMap"), "InteractiveMap");
const NationalParks = lazyNamed(() => import("./pages/NationalParks"), "NationalParks");
const NationalParkDetail = lazyNamed(() => import("./pages/NationalParkDetail"), "NationalParkDetail");
const B2BMarketplace = lazyNamed(() => import("./pages/B2BMarketplace"), "B2BMarketplace");
const Comparar = lazyNamed(() => import("./pages/Comparar"), "Comparar");
const Membresias = lazyNamed(() => import("./pages/Membresias"), "Membresias");
const ReportarPago = lazyNamed(() => import("./pages/ReportarPago"), "ReportarPago");
const Privacidad = lazyNamed(() => import("./pages/Privacidad"), "Privacidad");
const AdminPagos = lazyNamed(() => import("./pages/admin/AdminPagos"), "AdminPagos");

// Admin Sub-routed Panels
const AdminDashboard = lazyNamed(() => import("./pages/admin/AdminDashboard"), "AdminDashboard");
const AdminAprobaciones = lazyNamed(() => import("./pages/admin/AdminAprobaciones"), "AdminAprobaciones");
const AdminEstablecimientos = lazyNamed(() => import("./pages/admin/AdminEstablecimientos"), "AdminEstablecimientos");
const AdminEstablecimientoNuevo = lazyNamed(() => import("./pages/admin/AdminEstablecimientoNuevo"), "AdminEstablecimientoNuevo");
const AdminPrioridades = lazyNamed(() => import("./pages/admin/AdminPrioridades"), "AdminPrioridades");
const AdminUsuarios = lazyNamed(() => import("./pages/admin/AdminUsuarios"), "AdminUsuarios");
const AdminCategorias = lazyNamed(() => import("./pages/admin/AdminCategorias"), "AdminCategorias");
const AdminDestinos = lazyNamed(() => import("./pages/admin/AdminDestinos"), "AdminDestinos");
const AdminReservas = lazyNamed(() => import("./pages/admin/AdminReservas"), "AdminReservas");
const AdminBlog = lazyNamed(() => import("./pages/admin/AdminBlog"), "AdminBlog");
const AdminPaquetes = lazyNamed(() => import("./pages/admin/AdminPaquetes"), "AdminPaquetes");
const AdminParques = lazyNamed(() => import("./pages/admin/AdminParques"), "AdminParques");
const AdminSitios = lazyNamed(() => import("./pages/admin/AdminSitios"), "AdminSitios");
const AdminTips = lazyNamed(() => import("./pages/admin/AdminTips"), "AdminTips");
const AdminCotizaciones = lazyNamed(() => import("./pages/admin/AdminCotizaciones"), "AdminCotizaciones");
const AdminTasas = lazyNamed(() => import("./pages/admin/AdminTasas"), "AdminTasas");
const AdminContenido = lazyNamed(() => import("./pages/admin/AdminContenido"), "AdminContenido");
const AdminSeoHome = lazyNamed(() => import("./pages/admin/AdminSeoHome"), "AdminSeoHome");
const AdminB2B = lazyNamed(() => import("./pages/admin/AdminB2B"), "AdminB2B");
const AdminComercial = lazyNamed(() => import("./pages/admin/AdminComercial"), "AdminComercial");
const AdminAnaliticas = lazyNamed(() => import("./pages/admin/AdminAnaliticas"), "AdminAnaliticas");
const AdminLinkHub = lazyNamed(() => import("./pages/admin/AdminLinkHub"), "AdminLinkHub");
const AdminConfig = lazyNamed(() => import("./pages/admin/AdminConfig"), "AdminConfig");
const AdminCorreos = lazyNamed(() => import("./pages/admin/AdminCorreos"), "AdminCorreos");
const AdminFinanzas = lazyNamed(() => import("./pages/admin/AdminFinanzas"), "AdminFinanzas");
const AdminSolicitudes = lazyNamed(() => import("./pages/admin/AdminSolicitudes"), "AdminSolicitudes");
const AdminReservasPaquetes = lazyNamed(() => import("./pages/admin/AdminReservasPaquetes"), "AdminReservasPaquetes");
const AdminReseñas = lazyNamed(() => import("./pages/admin/AdminReseñas"), "AdminReseñas");
const AdminClientes = lazyNamed(() => import("./pages/admin/AdminClientes"), "AdminClientes");
const AdminSaaS = lazyNamed(() => import("./pages/admin/AdminSaaS"), "AdminSaaS");
const AdminLogs = lazyNamed(() => import("./pages/admin/AdminLogs"), "AdminLogs");
const AdminGuiones = lazyNamed(() => import("./pages/admin/AdminGuiones"), "AdminGuiones");
const AdminChannelManager = lazyNamed(() => import("./pages/admin/AdminChannelManager"), "AdminChannelManager");
const AdminDashboardsAlfa = lazyNamed(() => import("./pages/admin/AdminDashboardsAlfa"), "AdminDashboardsAlfa");
const AdminKYC = lazyNamed(() => import("./pages/admin/AdminKYC"), "AdminKYC");
const AdminTransfers = lazyNamed(() => import("./pages/admin/AdminTransfers"), "AdminTransfers");
const AdminExperiences = lazyNamed(() => import("./pages/admin/AdminExperiences"), "AdminExperiences");
const AdminAlerts = lazyNamed(() => import("./pages/admin/AdminAlerts"), "AdminAlerts");
const AdminLoyaltyCoupons = lazyNamed(() => import("./pages/admin/AdminLoyaltyCoupons"), "AdminLoyaltyCoupons");
const AdminDynamicPricing = lazyNamed(() => import("./pages/admin/AdminDynamicPricing"), "AdminDynamicPricing");
const AdminAgenda = lazyNamed(() => import("./pages/admin/AdminAgenda"), "AdminAgenda");
const Centauros = lazyNamed(() => import("./pages/Centauros"), "Centauros");
const CustomPageViewer = lazyNamed(() => import("./pages/CustomPageViewer"), "CustomPageViewer");
const Paquetes = lazyNamed(() => import("./pages/Paquetes"), "Paquetes");
const LinkHub = lazyNamed(() => import("./pages/LinkHub"), "LinkHub");
const BlogDetalle = lazyNamed(() => import("./pages/BlogDetalle"), "BlogDetalle");
const SitioDetalle = lazyNamed(() => import("./pages/SitioDetalle"), "SitioDetalle");
const ExcelenciaLanding = lazyNamed(() => import("./pages/ExcelenciaLanding"), "ExcelenciaLanding");
const Top10Hoteles = lazyNamed(() => import("./pages/Top10Hoteles"), "Top10Hoteles");
const LegalUploadResolution = lazyNamed(() => import("./pages/legal/LegalUploadResolution"), "LegalUploadResolution");
const Blog = lazyNamed(() => import("./pages/Blog"), "Blog");
const SitiosTuristicos = lazyNamed(() => import("./pages/SitiosTuristicos"), "SitiosTuristicos");
const PerfilKYC = lazyNamed(() => import("./pages/PerfilKYC"), "PerfilKYC");
const AsistenteViajesIA = lazyNamed(() => import("./pages/AsistenteViajesIA"), "AsistenteViajesIA");
const PublicSupportPage = lazyNamed(() => import("./pages/PublicSupportPage"), "PublicSupportPage");
const AdminIaViajes = lazyNamed(() => import("./pages/admin/AdminIaViajes"), "AdminIaViajes");
const AdminExpedicionRutas = lazyNamed(() => import("./pages/admin/AdminExpedicionRutas"), "AdminExpedicionRutas");
const AdminAsistencia = lazyWithRetry(() => import("./pages/admin/AdminAsistencia"));
const AdminContabilidad = lazyWithRetry(() => import("./pages/admin/AdminContabilidad"));

// Importación del Agente IA sin llaves apuntando a la carpeta admin
const AdminConversacionalIA = lazyWithRetry(() => import("./pages/admin/AdminConversacionalIA"));

// Importación de la arquitectura multi-tenant de los Nodos Cliente
const TenantApp = lazyWithRetry(() => import("./tenants/TenantApp"));

function AdminShell() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/" component={AdminDashboard} />
        <Route path="/admin/aprobaciones" component={AdminAprobaciones} />
        <Route path="/admin/establecimientos" component={AdminEstablecimientos} />
        <Route path="/admin/establecimientos/nuevo" component={AdminEstablecimientoNuevo} />
        <Route path="/admin/establecimientos/:id/editar" component={AdminEstablecimientoNuevo} />
        <Route path="/admin/prioridades" component={AdminPrioridades} />
        <Route path="/admin/usuarios" component={AdminUsuarios} />
        <Route path="/admin/categorias" component={AdminCategorias} />
        <Route path="/admin/destinos" component={AdminDestinos} />
        <Route path="/admin/reservas" component={AdminReservas} />
        <Route path="/admin/blog" component={AdminBlog} />
        <Route path="/admin/paquetes" component={AdminPaquetes} />
        <Route path="/admin/parques" component={AdminParques} />
        <Route path="/admin/sitios" component={AdminSitios} />
        <Route path="/admin/tips" component={AdminTips} />
        <Route path="/admin/cotizaciones" component={AdminCotizaciones} />
        <Route path="/admin/tasas" component={AdminTasas} />
        <Route path="/admin/contenido" component={AdminContenido} />
        <Route path="/admin/seo" component={AdminSeoHome} />
        <Route path="/admin/seo-home" component={AdminSeoHome} />
        <Route path="/admin/b2b" component={AdminB2B} />
        <Route path="/admin/comercial" component={AdminComercial} />
        <Route path="/admin/analiticas" component={AdminAnaliticas} />
        <Route path="/admin/linkhub" component={AdminLinkHub} />
        <Route path="/admin/config" component={AdminConfig} />
        <Route path="/admin/correos" component={AdminCorreos} />
        <Route path="/admin/finanzas" component={AdminFinanzas} />
        <Route path="/admin/pagos" component={AdminPagos} />
        <Route path="/admin/solicitudes" component={AdminSolicitudes} />
        <Route path="/admin/reservas-paquetes" component={AdminReservasPaquetes} />
        <Route path="/admin/reseñas" component={AdminReseñas} />
        <Route path="/admin/ia-conversacional" component={AdminConversacionalIA} />
        <Route path="/admin/asistente-guiones" component={AdminGuiones} />
        <Route path="/admin/clientes" component={AdminClientes} />
        <Route path="/admin/saas" component={AdminSaaS} />
        <Route path="/admin/logs" component={AdminLogs} />
        <Route path="/admin/channel-manager" component={AdminChannelManager} />
        <Route path="/admin/kyc" component={AdminKYC} />
        <Route path="/admin/transfers" component={AdminTransfers} />
        <Route path="/admin/experiences" component={AdminExperiences} />
        <Route path="/admin/alerts" component={AdminAlerts} />
        <Route path="/admin/loyalty-coupons" component={AdminLoyaltyCoupons} />
        <Route path="/admin/dynamic-pricing" component={AdminDynamicPricing} />
        <Route path="/admin/ia-viajes" component={AdminIaViajes} />
        <Route path="/admin/agenda" component={AdminAgenda} />
        <Route path="/admin/expedicion-rutas" component={AdminExpedicionRutas} />
        <Route path="/admin/asistencia" component={AdminAsistencia} />
        <Route path="/admin/contabilidad" component={AdminContabilidad} />
        <Route path="/admin/dashboards-alfa" component={AdminDashboardsAlfa} />
      </Switch>
    </AdminLayout>
  );
}

function App() {
  const [location] = useLocation();
  const { user, profile, trackLocation } = useAuth();

  // 1. Detección y Enrutamiento Multi-tenant (SaaS Tenant Redirect)
  const params = new URLSearchParams(window.location.search);
  const hasTenantParam = params.has("tenant") || params.has("establishment");
  const hostname = window.location.hostname;
  const cleanHost = hostname.toLowerCase().replace(/^www\./, "").trim();
  const isLocal = cleanHost === "localhost" || cleanHost === "127.0.0.1";
  const isMainPlatformDomain = cleanHost === "hotelesdevenezuela.com" || cleanHost === "hoteles-de-venezuela.pages.dev";

  // Si no es el dominio de la plataforma principal ni localhost, o coincide con un tenant registrado
  const isCustomDomain = (!isLocal && !isMainPlatformDomain) || Object.values(TENANTS_REGISTRY).some(
    (t) => {
      if (!t.domain) return false;
      const cleanDomain = t.domain.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].trim();
      return cleanDomain === cleanHost || cleanHost.includes(t.slug.toLowerCase().replace(/-/g, ""));
    }
  );
  const isEnvTenant = !!import.meta.env.VITE_TENANT_SLUG;

  // Manejador estático inmediato para verificación de Meta/Facebook
  if (typeof window !== "undefined" && window.location.pathname.includes("ra4gpl4v796c05gwjx9ort6peoysiz")) {
    return (
      <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
        ra4gpl4v796c05gwjx9ort6peoysiz
      </div>
    );
  }

  // Desviar a la vista del nodo inquilino si aplica
  if (isEnvTenant || hasTenantParam || (isCustomDomain && !isLocal)) {
    return <TenantApp />;
  }


  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Track location changes
  useEffect(() => {
    trackLocation(location);
  }, [location, trackLocation]);

  useEffect(() => {
    async function autoSyncLocalRoomPhotos() {
      try {
        const rawPhotos = localStorage.getItem("hdv_room_photos");
        if (!rawPhotos) return;
        const parsed = JSON.parse(rawPhotos);
        for (const [roomId, photosList] of Object.entries(parsed)) {
          if (Array.isArray(photosList) && photosList.length > 0) {
            const primary = photosList[0];
            await supabase
              .from("rooms")
              .update({
                photos: photosList,
                primary_image: primary,
                cover_image: primary
              })
              .eq("id", roomId);
          }
        }
      } catch (err) {
        console.warn("AutoSync room photos warning:", err);
      }
    }
    autoSyncLocalRoomPhotos();
    if (typeof window !== "undefined") {
      window.addEventListener("hdv_room_photos_updated", autoSyncLocalRoomPhotos);
      return () => window.removeEventListener("hdv_room_photos_updated", autoSyncLocalRoomPhotos);
    }
  }, []);

  const { data: settings = [] } = useQuery<any[]>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("site_settings").select("*");
        if (error) throw error;
        return data || [];
      } catch (e) {
        console.warn("Error cargando configuración pública:", e);
        return [];
      }
    }
  });

  const maintenanceConfig = settings.find(s => {
    const k = s?.setting_key || s?.settingKey || s?.key;
    return k === "maintenance_mode";
  });
  const isMaintenanceMode = (maintenanceConfig?.setting_value ?? maintenanceConfig?.settingValue ?? maintenanceConfig?.value) === "true";
  const isBypassed = user?.email?.toLowerCase() === "hotelesdevenezuela77@gmail.com" || profile?.role === "admin";
  const isAdminRoute = location.startsWith("/admin") || location === "/hdv-acceso-llc2027" || location === "/login";

  if (isMaintenanceMode && !isBypassed && !isAdminRoute) {
    return <Mantenimiento />;
  }

  return (
    <MainLayout>
      <AppErrorBoundary>
        <Suspense fallback={
          <div className="min-h-[60vh] flex flex-col items-center justify-center bg-transparent">
            {/* Subtle loading spinner using official colors */}
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-[#1a0533] opacity-30" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#00C8D4] border-r-[#FF0096] animate-spin" />
            </div>
            <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] mt-4 animate-pulse">
              Cargando Experiencia...
            </p>
          </div>
        }>
          <Switch>
            {/* Rutas Públicas */}
            <Route path="/" component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/registro" component={Registro} />
            <Route path="/perfil" component={Perfil} />
            <Route path="/panel-turista" component={Perfil} />
            <Route path="/perfil/kyc" component={PerfilKYC} />
            <Route path="/hdv-acceso-llc2027" component={AdminLogin} />
            <Route path="/establecimientos" component={Establecimientos} />
            <Route path="/establecimiento/:slug" component={EstablecimientoDetalle} />
            <Route path="/app/:slug" component={EstablecimientoDetalle} />
            <Route path="/hotel/:slug" component={EstablecimientoDetalle} />
            <Route path="/posada/:slug" component={EstablecimientoDetalle} />
            <Route path="/restaurante/:slug" component={EstablecimientoDetalle} />
            <Route path="/destinos" component={Destinos} />
            <Route path="/destinos/:slug" component={DestinoDetalle} />
            <Route path="/mapa" component={InteractiveMap} />
            <Route path="/parques" component={NationalParks} />
            <Route path="/parque/:slug" component={NationalParkDetail} />
            <Route path="/servicios-b2b" component={B2BMarketplace} />
            <Route path="/comparar" component={Comparar} />
            <Route path="/paquetes" component={Paquetes} />
            <Route path="/links" component={LinkHub} />
            <Route path="/blog" component={Blog} />
            <Route path="/sitios-turisticos" component={SitiosTuristicos} />

            <Route path="/membresias" component={Membresias} />
            <Route path="/reportar-pago" component={ReportarPago} />
            <Route path="/privacidad" component={Privacidad} />
            <Route path="/prestigio-2026" component={ExcelenciaLanding} />
            <Route path="/los-10-mejores-hoteles" component={Top10Hoteles} />
            <Route path="/mejores-hoteles-venezuela" component={Top10Hoteles} />
            <Route path="/viaje-ia" component={AsistenteViajesIA} />
            <Route path="/soporte" component={PublicSupportPage} />
            <Route path="/soporte-tecnico" component={PublicSupportPage} />
            <Route path="/contacto" component={PublicSupportPage} />
            <Route path="/legal/upload-resolution" component={LegalUploadResolution} />
            <Route path="/upload-resolution" component={LegalUploadResolution} />

            {/* Dashboards Propietarios */}
            <Route path="/mis-negocios" component={OwnerDashboard} />
            <Route path="/panel-propietario" component={OwnerDashboard} />
            <Route path="/andromeda">
              {() => <AdminLayout><AndromedaPanel /></AdminLayout>}
            </Route>
            
            {/* Rutas del Panel Administrativo Envolvente */}
            <Route path="/admin" component={AdminShell} />
            <Route path="/admin/*" component={AdminShell} />

            {/* Atajos y Catch-all */}
            <Route path="/blog/:slug" component={BlogDetalle} />
            <Route path="/sitio/:slug" component={SitioDetalle} />
            <Route path="/crm">
              {() => <AdminLayout><AdminComercial /></AdminLayout>}
            </Route>
            <Route path="/centaurus">
              {() => <AdminLayout><Centauros /></AdminLayout>}
            </Route>
            <Route path="/:slug" component={CustomPageViewer} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </AppErrorBoundary>
    </MainLayout>
  );
}

export default App;