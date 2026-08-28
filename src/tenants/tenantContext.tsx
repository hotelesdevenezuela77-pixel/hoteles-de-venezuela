import React, { createContext, useContext, useState, useEffect } from "react";

// Importaciones estáticas para garantizar disponibilidad y robustez en la compilación con Vite
import apartoPosadaConfig from "./instances/aparto-posada-del-mar/config.json";
import perlaNegraConfig from "./instances/perla-negra/config.json";
import myCampersConfig from "./instances/my-campers/config.json";
import oleajeBeachClubConfig from "./instances/oleaje-beach-club/config.json";
import complejoLosRoquesConfig from "./instances/complejo-los-roques/config.json";
import hostalEntre2AguasConfig from "./instances/hostal-entre-2-aguas/config.json";

export interface TenantConfig {
  establishment_id: number;
  slug: string;
  name: string;
  template: "A" | "B";
  business_type?: "hotel" | "restaurant" | string;
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
    tareas?: boolean;
    finanzas?: boolean;
    cms?: boolean;
    analiticas?: boolean;
  };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    instagram: string;
  };
}

import { supabase } from "../lib/supabase";

export const TENANTS_REGISTRY: Record<string, TenantConfig> = {
  "aparto-posada-del-mar": apartoPosadaConfig as TenantConfig,
  "perla-negra": perlaNegraConfig as TenantConfig,
  "my-campers": myCampersConfig as TenantConfig,
  "oleaje-beach-club": oleajeBeachClubConfig as TenantConfig,
  "complejo-los-roques": complejoLosRoquesConfig as TenantConfig,
  "hostal-entre-2-aguas": hostalEntre2AguasConfig as TenantConfig,
};

interface TenantContextType {
  config: TenantConfig;
  isLoading: boolean;
  error: string | null;
  updateConfig: (newConfig: TenantConfig) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function resolveTenant() {
      try {
        let activeTenantsList: TenantConfig[] = [];

        // 1. Intentar consultar en base de datos de Supabase (tabla establishments y establishment_images)
        try {
          const { data: dbEsts, error: dbError } = await supabase
            .from("establishments")
            .select("id, slug, name, website, phone, whatsapp, email, instagram, establishment_images(image_url, is_primary)");

          if (!dbError && dbEsts && dbEsts.length > 0) {
            dbEsts.forEach((est: any) => {
              const primaryImgObj = est.establishment_images?.find((img: any) => img.is_primary) || est.establishment_images?.[0];
              const bannerImg = primaryImgObj?.image_url;

              const matchingStatic = TENANTS_REGISTRY[est.slug];
              const mergedTenant: TenantConfig = {
                establishment_id: est.id,
                slug: est.slug,
                name: est.name || matchingStatic?.name || "Establecimiento",
                template: matchingStatic?.template || "A",
                domain: est.website ? est.website.replace(/^https?:\/\//, "").replace(/\/$/, "").split("/")[0] : matchingStatic?.domain || `${est.slug}.com`,
                branding: {
                  primary_color: matchingStatic?.branding?.primary_color || "#00C8D4",
                  secondary_color: matchingStatic?.branding?.secondary_color || "#9B00CC",
                  accent_color: matchingStatic?.branding?.accent_color || "#FF0096",
                  font_title: matchingStatic?.branding?.font_title || "Playfair Display",
                  font_body: matchingStatic?.branding?.font_body || "Montserrat",
                  logo_url: matchingStatic?.branding?.logo_url || "https://r2.hotelesdevenezuela.com/default/logo.png",
                  banner_url: bannerImg || matchingStatic?.branding?.banner_url || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&auto=format&fit=crop"
                },
                modules: matchingStatic?.modules || {
                  reservas: true,
                  pos: false,
                  galeria: true,
                  contacto: true
                },
                contact: {
                  phone: est.phone || matchingStatic?.contact?.phone || "+58 412 000 0000",
                  whatsapp: est.whatsapp || matchingStatic?.contact?.whatsapp || est.phone || "+58 412 000 0000",
                  email: est.email || matchingStatic?.contact?.email || `contacto@${est.slug}.com`,
                  instagram: est.instagram || matchingStatic?.contact?.instagram || `@${est.slug}`
                }
              };

              activeTenantsList.push(mergedTenant);
            });
            console.log(`[Multi-tenant] ${activeTenantsList.length} establecimientos sincronizados desde Supabase DB.`);
          }
        } catch (dbErr) {
          console.warn("[Multi-tenant] Falló consulta a Supabase (tabla establishments), usando respaldo local:", dbErr);
        }

        // 2. Fusionar siempre las configuraciones guardadas localmente en localStorage (sincronizadas por CMS y AdminSaaS)
        try {
          const localData = localStorage.getItem("hdv_tenants_configurations");
          if (localData) {
            const localList: TenantConfig[] = JSON.parse(localData);
            localList.forEach((localTenant) => {
              const idx = activeTenantsList.findIndex(
                t => t.establishment_id === localTenant.establishment_id || t.slug === localTenant.slug
              );
              if (idx !== -1) {
                activeTenantsList[idx] = { 
                  ...activeTenantsList[idx], 
                  ...localTenant,
                  branding: {
                    ...activeTenantsList[idx].branding,
                    ...localTenant.branding
                  }
                };
              } else {
                activeTenantsList.push(localTenant);
              }
            });
            console.log(`[Multi-tenant] ${localList.length} configuraciones fusionadas desde localStorage.`);
          }
        } catch (localErr) {
          console.error("[Multi-tenant] Error al parsear localStorage:", localErr);
        }

        // 3. Fallback final: Usar el registro estático local de los archivos config.json si no hay ninguno
        if (activeTenantsList.length === 0) {
          activeTenantsList = Object.values(TENANTS_REGISTRY);
          console.log("[Multi-tenant] Usando el registro estático de archivos locales config.json");
        }

        // Mapear el registro activo (incluyendo estáticos de TENANTS_REGISTRY por defecto)
        const activeRegistry: Record<string, TenantConfig> = {
          ...TENANTS_REGISTRY
        };
        activeTenantsList.forEach((t) => {
          activeRegistry[t.slug] = t;
        });

        // ── DETECCIÓN DEL INQUILINO ACTIVO ──

        // A. Detección por variable de entorno de compilación (Vite)
        const envSlug = import.meta.env.VITE_TENANT_SLUG;
        if (envSlug && activeRegistry[envSlug]) {
          console.log(`[Multi-tenant] Cargando desde variable de entorno: ${envSlug}`);
          setConfig(activeRegistry[envSlug]);
          setIsLoading(false);
          return;
        }

        // B. Detección por query parameter (útil en desarrollo local / vistas previas: ?tenant=slug)
        const params = new URLSearchParams(window.location.search);
        const rawQuerySlug = params.get("tenant") || params.get("establishment");
        if (rawQuerySlug) {
          const querySlug = rawQuerySlug.toLowerCase().trim();

          // B1. Coincidencia directa por slug en activeRegistry
          if (activeRegistry[querySlug]) {
            console.log(`[Multi-tenant] Cargando por query parameter exacto: ${querySlug}`);
            setConfig(activeRegistry[querySlug]);
            setIsLoading(false);
            return;
          }

          // B2. Coincidencia por ID o búsqueda parcial en lista activa
          const matchedInList = activeTenantsList.find(t => 
            t.slug.toLowerCase() === querySlug || 
            String(t.establishment_id) === querySlug ||
            t.slug.toLowerCase().includes(querySlug) ||
            querySlug.includes(t.slug.toLowerCase())
          );
          if (matchedInList) {
            console.log(`[Multi-tenant] Cargando por coincidencia en lista activa: ${matchedInList.slug}`);
            setConfig(matchedInList);
            setIsLoading(false);
            return;
          }

          // B3. Alias / variante especial para Oleaje
          if (querySlug.includes("oleaje")) {
            const oleajeConfig = activeRegistry["oleaje-beach-club"] || activeRegistry["oleaje-tucacas"];
            if (oleajeConfig) {
              console.log(`[Multi-tenant] Cargando tenant Oleaje por alias: ${querySlug}`);
              setConfig({ ...oleajeConfig, slug: querySlug });
              setIsLoading(false);
              return;
            }
          }

          // B4. Consulta directa a la base de datos (tabla establishments) para generar TenantConfig dinámico
          try {
            const { data: estData } = await supabase
              .from("establishments")
              .select("*")
              .or(`slug.eq.${querySlug},id.eq.${Number(querySlug) || 0}`)
              .maybeSingle();

            if (estData) {
              console.log(`[Multi-tenant] Generando TenantConfig dinámico para establecimiento DB: ${estData.name}`);
              const dynamicTenantConfig: TenantConfig = {
                establishment_id: estData.id,
                slug: estData.slug,
                name: estData.name,
                template: "B",
                domain: estData.website ? estData.website.replace(/^https?:\/\//, '').split('/')[0] : `${estData.slug}.com`,
                branding: {
                  primary_color: "#00C8D4",
                  secondary_color: "#9B00CC",
                  accent_color: "#FF0096",
                  font_title: "Playfair Display",
                  font_body: "Montserrat",
                  logo_url: "https://r2.hotelesdevenezuela.com/default/logo.png",
                  banner_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&auto=format&fit=crop"
                },
                modules: {
                  reservas: true,
                  pos: true,
                  galeria: true,
                  contacto: true,
                  tareas: true,
                  finanzas: true,
                  cms: true,
                  analiticas: true
                },
                contact: {
                  phone: estData.phone || "+58 412 000 0000",
                  whatsapp: estData.whatsapp || estData.phone || "+58 412 000 0000",
                  email: `contacto@${estData.slug}.com`,
                  instagram: `@${estData.slug}`
                }
              };
              setConfig(dynamicTenantConfig);
              setIsLoading(false);
              return;
            }
          } catch (dbQueryErr) {
            console.warn("[Multi-tenant] Error al consultar establecimiento en DB:", dbQueryErr);
          }
        }

        // C. Detección por Hostname (Producción / Subdominios / Dominios Personalizados)
        const hostname = window.location.hostname;
        const cleanHost = hostname.toLowerCase().replace(/^www\./, "").trim();
        
        // C1. Buscar coincidencia del dominio (normalizando www y http/https)
        const matchedByDomain = Object.values(activeRegistry).find((t) => {
          if (!t.domain) return false;
          const cleanDomain = t.domain.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].trim();
          return cleanDomain === cleanHost;
        });
        if (matchedByDomain) {
          console.log(`[Multi-tenant] Cargando por dominio exacto: ${matchedByDomain.slug}`);
          setConfig(matchedByDomain);
          setIsLoading(false);
          return;
        }

        // C2. Buscar si el hostname contiene el slug (ej. aparto-posada-del-mar.hotelesdevenezuela.com)
        const matchedBySubdomain = Object.values(activeRegistry).find((t) => {
          const cleanSlug = t.slug.toLowerCase().replace(/-/g, "");
          const cleanHostNoHyphens = cleanHost.replace(/-/g, "");
          return cleanHostNoHyphens.includes(cleanSlug) || cleanSlug.includes(cleanHostNoHyphens);
        });
        if (matchedBySubdomain) {
          console.log(`[Multi-tenant] Cargando por subdominio o slug: ${matchedBySubdomain.slug}`);
          setConfig(matchedBySubdomain);
          setIsLoading(false);
          return;
        }

        // D. Fallback para desarrollo local (puerto de Vite local sin slug)
        if (hostname === "localhost" || hostname === "127.0.0.1") {
          console.warn("[Multi-tenant] Ejecutando en localhost. Se cargará Aparto Posada del Mar como tenant por defecto.");
          setConfig(activeRegistry["aparto-posada-del-mar"] || Object.values(activeRegistry)[0]);
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

  // Escuchar cambios en vivo emitidos por el CMS
  useEffect(() => {
    const handleLiveUpdate = (e: any) => {
      const updated: TenantConfig = e.detail;
      if (updated && config && (updated.establishment_id === config.establishment_id || updated.slug === config.slug)) {
        setConfig(updated);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("hdv_tenant_config_updated", handleLiveUpdate);
      return () => window.removeEventListener("hdv_tenant_config_updated", handleLiveUpdate);
    }
  }, [config]);

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

  const updateConfig = (newConfig: TenantConfig) => {
    setConfig(newConfig);
  };

  return (
    <TenantContext.Provider value={{ config, isLoading, error, updateConfig }}>
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
