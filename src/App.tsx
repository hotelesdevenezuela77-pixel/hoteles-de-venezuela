import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./lib/auth";
import { supabase } from "./lib/supabase";
import { Mantenimiento } from "./pages/Mantenimiento";
import { MainLayout } from "./components/layout/MainLayout";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { Login } from "./pages/Login";
import { Registro } from "./pages/Registro";
import { Perfil } from "./pages/Perfil";
import { AdminLogin } from "./pages/AdminLogin";
import { Destinos } from "./pages/Destinos";
import { DestinoDetalle } from "./pages/DestinoDetalle";
import { Establecimientos } from "./pages/Establecimientos";
import { EstablecimientoDetalle } from "./pages/EstablecimientoDetalle";
import { OwnerDashboard } from "./pages/OwnerDashboard";
import { AndromedaPanel } from "./pages/AndromedaPanel";
import { InteractiveMap } from "./pages/InteractiveMap";
import { NationalParks } from "./pages/NationalParks";
import { NationalParkDetail } from "./pages/NationalParkDetail";
import { B2BMarketplace } from "./pages/B2BMarketplace";
import { Comparar } from "./pages/Comparar";
import { Membresias } from "./pages/Membresias";
import { ReportarPago } from "./pages/ReportarPago";
import { AdminPagos } from "./pages/admin/AdminPagos";

// Admin Sub-routed Panels
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminAprobaciones } from "./pages/admin/AdminAprobaciones";
import { AdminEstablecimientos } from "./pages/admin/AdminEstablecimientos";
import { AdminEstablecimientoNuevo } from "./pages/admin/AdminEstablecimientoNuevo";
import { AdminPrioridades } from "./pages/admin/AdminPrioridades";
import { AdminUsuarios } from "./pages/admin/AdminUsuarios";
import { AdminCategorias } from "./pages/admin/AdminCategorias";
import { AdminDestinos } from "./pages/admin/AdminDestinos";
import { AdminReservas } from "./pages/admin/AdminReservas";
import { AdminBlog } from "./pages/admin/AdminBlog";
import { AdminPaquetes } from "./pages/admin/AdminPaquetes";
import { AdminParques } from "./pages/admin/AdminParques";
import { AdminSitios } from "./pages/admin/AdminSitios";
import { AdminTips } from "./pages/admin/AdminTips";
import { AdminCotizaciones } from "./pages/admin/AdminCotizaciones";
import { AdminTasas } from "./pages/admin/AdminTasas";
import { AdminContenido } from "./pages/admin/AdminContenido";
import { AdminSeoHome } from "./pages/admin/AdminSeoHome";
import { AdminB2B } from "./pages/admin/AdminB2B";
import { AdminComercial } from "./pages/admin/AdminComercial";
import { AdminAnaliticas } from "./pages/admin/AdminAnaliticas";
import { AdminLinkHub } from "./pages/admin/AdminLinkHub";
import { AdminConfig } from "./pages/admin/AdminConfig";
import { AdminCorreos } from "./pages/admin/AdminCorreos";
import { AdminFinanzas } from "./pages/admin/AdminFinanzas";
import { AdminSolicitudes } from "./pages/admin/AdminSolicitudes";
import { AdminReservasPaquetes } from "./pages/admin/AdminReservasPaquetes";
import { AdminReseñas } from "./pages/admin/AdminReseñas";
import { AdminClientes } from "./pages/admin/AdminClientes";
import { AdminSaaS } from "./pages/admin/AdminSaaS";
import { AdminLogs } from "./pages/admin/AdminLogs";
import { Centauros } from "./pages/Centauros";
import { CustomPageViewer } from "./pages/CustomPageViewer";
import { Paquetes } from "./pages/Paquetes";
import { LinkHub } from "./pages/LinkHub";
import { BlogDetalle } from "./pages/BlogDetalle";
import { SitioDetalle } from "./pages/SitioDetalle";
import { ExcelenciaLanding } from "./pages/ExcelenciaLanding";

// Importación del Agente IA sin llaves apuntando a la carpeta admin
import AdminConversacionalIA from "./pages/admin/AdminConversacionalIA";

// Importación de la arquitectura multi-tenant de los Nodos Cliente
import TenantApp from "./tenants/TenantApp";
import { TENANTS_REGISTRY } from "./tenants/tenantContext";

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
      <Switch>
        {/* Rutas Públicas */}
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/registro" component={Registro} />
        <Route path="/perfil" component={Perfil} />
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

        <Route path="/membresias" component={Membresias} />
        <Route path="/reportar-pago" component={ReportarPago} />
        <Route path="/prestigio-2026" component={ExcelenciaLanding} />

        {/* Dashboards Propietarios */}
        <Route path="/mis-negocios" component={OwnerDashboard} />
        <Route path="/andromeda" component={AndromedaPanel} />
        
        {/* Rutas del Panel Administrativo */}
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
        <Route path="/admin/clientes" component={AdminClientes} />
        <Route path="/admin/saas" component={AdminSaaS} />
        <Route path="/admin/logs" component={AdminLogs} />

        {/* Atajos y Catch-all */}
        <Route path="/blog/:slug" component={BlogDetalle} />
        <Route path="/sitio/:slug" component={SitioDetalle} />
        <Route path="/crm" component={AdminComercial} />
        <Route path="/centaurus" component={Centauros} />
        <Route path="/:slug" component={CustomPageViewer} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

export default App;