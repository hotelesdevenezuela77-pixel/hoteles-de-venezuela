import React, { createContext, useContext, useState, useEffect } from "react";

// Importaciones estáticas para garantizar disponibilidad y robustez en la compilación con Vite
import apartoPosadaConfig from "./instances/aparto-posada-del-mar/config.json";
import perlaNegraConfig from "./instances/perla-negra/config.json";
import myCampersConfig from "./instances/my-campers/config.json";
import oleajeBeachClubConfig from "./instances/oleaje-beach-club/config.json";
import complejoLosRoquesConfig from "./instances/complejo-los-roques/config.json";

export interface TenantConfig {
  establishment_id: number;
  slug: string;
  name: string;
  template: "A" | "B";
  domain: string;
  branding: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    font_title: string;
    font_body: string;
    logo_url: string;
    banner_url: string;
  };
  modules: {
    reservas: boolean;
    pos: boolean;
    vip_zones?: boolean;
    galeria: boolean;
    contacto: boolean;
  };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    instagram: string;
  };
}

export const TENANTS_REGISTRY: Record<string, TenantConfig> = {
  "aparto-posada-del-mar": apartoPosadaConfig as TenantConfig,
  "perla-negra": perlaNegraConfig as TenantConfig,
  "my-campers": myCampersConfig as TenantConfig,
  "oleaje-beach-club": oleajeBeachClubConfig as TenantConfig,
  "complejo-los-roques": complejoLosRoquesConfig as TenantConfig,
};

interface TenantContextType {
  config: TenantConfig;
  isLoading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function resolveTenant() {
      try {
        // 1. Detección por variable de entorno de compilación (Vite)
        const envSlug = import.meta.env.VITE_TENANT_SLUG;
        if (envSlug && TENANTS_REGISTRY[envSlug]) {
          console.log(`[Multi-tenant] Cargando desde variable de entorno: ${envSlug}`);
          setConfig(TENANTS_REGISTRY[envSlug]);
          setIsLoading(false);
          return;
        }

        // 2. Detección por query parameter (útil en desarrollo local: ?tenant=slug)
        const params = new URLSearchParams(window.location.search);
        const querySlug = params.get("tenant") || params.get("establishment");
        if (querySlug && TENANTS_REGISTRY[querySlug]) {
          console.log(`[Multi-tenant] Cargando desde query parameter: ${querySlug}`);
          setConfig(TENANTS_REGISTRY[querySlug]);
          setIsLoading(false);
          return;
        }

        // 3. Detección por Hostname (Producción / Subdominios)
        const hostname = window.location.hostname;
        
        // Buscar coincidencia exacta del dominio
        const matchedByDomain = Object.values(TENANTS_REGISTRY).find(
          (t) => t.domain.toLowerCase() === hostname.toLowerCase()
        );
        if (matchedByDomain) {
          console.log(`[Multi-tenant] Cargando por dominio exacto: ${matchedByDomain.slug}`);
          setConfig(matchedByDomain);
          setIsLoading(false);
          return;
        }

        // Buscar si el hostname contiene el slug (ej. aparto-posada-del-mar.hotelesdevenezuela.com)
        const matchedBySubdomain = Object.values(TENANTS_REGISTRY).find((t) =>
          hostname.toLowerCase().includes(t.slug.toLowerCase())
        );
        if (matchedBySubdomain) {
          console.log(`[Multi-tenant] Cargando por subdominio: ${matchedBySubdomain.slug}`);
          setConfig(matchedBySubdomain);
          setIsLoading(false);
          return;
        }

        // 4. Fallback para desarrollo local (puerto de Vite local sin slug)
        if (hostname === "localhost" || hostname === "127.0.0.1") {
          console.warn("[Multi-tenant] Ejecutando en localhost. Se cargará Aparto Posada del Mar como tenant por defecto.");
          setConfig(TENANTS_REGISTRY["aparto-posada-del-mar"]);
          setIsLoading(false);
          return;
        }

        // Si no se encuentra ningún tenant
        setError(`No se pudo resolver la configuración para el host: ${hostname}`);
        setIsLoading(false);
      } catch (err: any) {
        setError(err?.message || "Error desconocido resolviendo el Tenant");
        setIsLoading(false);
      }
    }

    resolveTenant();
  }, []);

  // Inyectar variables de estilos dinámicos de Tailwind en base al theme del Tenant
  useEffect(() => {
    if (config) {
      const root = document.documentElement;
      root.style.setProperty("--color-tenant-primary", config.branding.primary_color);
      root.style.setProperty("--color-tenant-secondary", config.branding.secondary_color);
      root.style.setProperty("--color-tenant-accent", config.branding.accent_color);
      
      // Aplicar tipografía
      root.style.setProperty("--font-tenant-title", config.branding.font_title);
      root.style.setProperty("--font-tenant-body", config.branding.font_body);

      // Cambiar título del documento dinámicamente
      document.title = `${config.name} | Reservas`;
    }
  }, [config]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e011f] flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C8D4]"></div>
        <p className="mt-4 text-xs tracking-widest text-[#00C8D4] font-semibold uppercase">
          Iniciando nodo del establecimiento...
        </p>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-[#0e011f] flex flex-col items-center justify-center px-6 text-center text-white">
        <div className="w-16 h-16 bg-[#FF0096]/20 rounded-full flex items-center justify-center mb-4 border border-[#FF0096]">
          <span className="text-[#FF0096] text-2xl font-bold">!</span>
        </div>
        <h1 className="text-xl font-bold font-serif mb-2">Error de Enrutamiento SaaS</h1>
        <p className="text-gray-400 text-xs max-w-md leading-relaxed">
          {error || "El establecimiento solicitado no pertenece a la red de Hoteles de Venezuela o no está configurado."}
        </p>
        <div className="mt-6 text-xs text-gray-500">
          Intente acceder con un parámetro de prueba: <br />
          <code className="text-[#00C8D4] bg-[#1a0533] px-2 py-1 rounded inline-block mt-2 font-mono">
            {window.location.origin}/?tenant=aparto-posada-del-mar
          </code>
        </div>
      </div>
    );
  }

  return (
    <TenantContext.Provider value={{ config, isLoading, error }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant debe ser usado dentro de un TenantProvider");
  }
  return context;
}
