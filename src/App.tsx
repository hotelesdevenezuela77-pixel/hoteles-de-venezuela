import { useEffect, lazy, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./lib/auth";
import { supabase } from "./lib/supabase";
import { Mantenimiento } from "./pages/Mantenimiento";
import { MainLayout } from "./components/layout/MainLayout";
import { Home } from "./pages/Home";
import { TENANTS_REGISTRY } from "./tenants/tenantContext";
import { AdminLayout } from "./components/admin/AdminLayout";

// Helper para importaciones dinámicas de exportaciones nombradas (named exports)
function lazyNamed<T extends Record<string, any>>(
  importFn: () => Promise<T>,
  exportName: keyof T
) {
  return lazy(() => importFn().then((module) => ({ default: module[exportName] })));
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
const AdminKYC = lazyNamed(() => import("./pages/admin/AdminKYC"), "AdminKYC");
const AdminTransfers = lazyNamed(() => import("./pages/admin/AdminTransfers"), "AdminTransfers");
const AdminExperiences = lazyNamed(() => import("./pages/admin/AdminExperiences"), "AdminExperiences");
const AdminAlerts = lazyNamed(() => import("./pages/admin/AdminAlerts"), "AdminAlerts");
const AdminLoyaltyCoupons = lazyNamed(() => import("./pages/admin/AdminLoyaltyCoupons"), "AdminLoyaltyCoupons");
const AdminDynamicPricing = lazyNamed(() => import("./pages/admin/AdminDynamicPricing"), "AdminDynamicPricing");
const Centauros = lazyNamed(() => import("./pages/Centauros"), "Centauros");
const CustomPageViewer = lazyNamed(() => import("./pages/CustomPageViewer"), "CustomPageViewer");
const Paquetes = lazyNamed(() => import("./pages/Paquetes"), "Paquetes");
const LinkHub = lazyNamed(() => import("./pages/LinkHub"), "LinkHub");
const BlogDetalle = lazyNamed(() => import("./pages/BlogDetalle"), "BlogDetalle");
const SitioDetalle = lazyNamed(() => import("./pages/SitioDetalle"), "SitioDetalle");
const ExcelenciaLanding = lazyNamed(() => import("./pages/ExcelenciaLanding"), "ExcelenciaLanding");
const Blog = lazyNamed(() => import("./pages/Blog"), "Blog");
const SitiosTuristicos = lazyNamed(() => import("./pages/SitiosTuristicos"), "SitiosTuristicos");
const PerfilKYC = lazyNamed(() => import("./pages/PerfilKYC"), "PerfilKYC");

// Importación del Agente IA sin llaves apuntando a la carpeta admin
const AdminConversacionalIA = lazy(() => import("./pages/admin/AdminConversacionalIA"));

// Importación de la arquitectura multi-tenant de los Nodos Cliente
const TenantApp = lazy(() => import("./tenants/TenantApp"));

function App() {
  const [location] = useLocation();
  const { user, profile, trackLocation } = useAuth();

  // 1. Detección y Enrutamiento Multi-tenant (SaaS Tenant Redirect)
  const params = new URLSearchParams(window.location.search);
  const hasTenantParam = params.has("tenant") || params.has("establishment");
  const hostname = window.location.hostname;
  const isCustomDomain = Object.values(TENANTS_REGISTRY).some(
    (t) => t.domain.toLowerCase() === hostname.toLowerCase() || hostname.toLowerCase().includes(t.slug.toLowerCase())
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
  if (isEnvTenant || hasTenantParam || (isCustomDomain && hostname !== "localhost" && hostname !== "127.0.0.1")) {
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

  const isMaintenanceMode = settings.find(s => s.setting_key === "maintenance_mode" || s.settingKey === "maintenance_mode")?.setting_value === "true";
  const isBypassed = user?.email?.toLowerCase() === "hotelesdevenezuela77@gmail.com" || profile?.role === "admin";
  const isAdminRoute = location.startsWith("/admin") || location === "/hdv-acceso-llc2027" || location === "/login";

  if (isMaintenanceMode && !isBypassed && !isAdminRoute) {
    return <Mantenimiento />;
  }

  return (
    <MainLayout>
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
          <Route path="/perfil/kyc" component={PerfilKYC} />
          <Route path="/hdv-acceso-llc2027" component={AdminLogin} />
          <Route path="/establecimientos" component={Establecimientos} />
          <Route path="/establecimiento/:slug" component={EstablecimientoDetalle} />
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

          {/* Dashboards Propietarios */}
          <Route path="/mis-negocios" component={OwnerDashboard} />
          <Route path="/andromeda">
            {() => <AdminLayout><AndromedaPanel /></AdminLayout>}
          </Route>
          
          {/* Rutas del Panel Administrativo Envolvente */}
          <Route path="/admin">
            {() => <AdminLayout><AdminDashboard /></AdminLayout>}
          </Route>
          <Route path="/admin/:wildcard*">
            {() => (
              <AdminLayout>
                <Switch>
                  <Route path="/admin" component={AdminDashboard} />
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
                </Switch>
              </AdminLayout>
            )}
          </Route>

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
    </MainLayout>
  );
}

export default App;