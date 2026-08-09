import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { supabase } from "../lib/supabase";
import { ESTABLISHMENTS_MOCK } from "../lib/establishmentsMock";
import { EstablishmentCard } from "../components/layout/EstablishmentCard";
import type { Establishment } from "../components/layout/EstablishmentCard";
import { 
  ArrowLeft, Play, Loader2, Image as ImageIcon, Sparkles, X, Compass,
  TrendingUp, Award, ShieldCheck, Zap, BarChart3, Server, Cpu, Smartphone,
  Monitor, Tablet, Layers, Lock, CheckCircle2, Database, MessageSquare,
  CalendarCheck, CreditCard, Users, ExternalLink, Activity,
  Globe, Building2, Check, Briefcase
} from "lucide-react";
import { ConstellationBackground } from "../components/ConstellationBackground";

interface CustomPage {
  id: number;
  slug: string;
  title: string;
  h1Title: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  content: string | null;
  isPublished: boolean | null;
  featuredImage: string | null;
  videoUrl: string | null;
  galleryImages: string | null;
  relatedEstablishments: string | null;
}

function getEmbedUrl(url: string): string {
  if (!url) return "";
  if (url.includes("/embed/")) return url;
  
  // YouTube Watch link or short URL
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
  }
  
  // Vimeo URL
  const vimeoMatch = url.match(/(?:vimeo\.com\/)([^&\s?]+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  return url;
}

export function CustomPageViewer() {
  const [, params] = useRoute("/:slug");
  const slug = (params as any)?.slug;

  const [page, setPage] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedEsts, setRelatedEsts] = useState<Establishment[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    async function loadPageData() {
      if (!slug) return;
      try {
        setLoading(true);
        let dbData: any = null;

        // Try querying Supabase
        try {
          const { data, error } = await supabase
            .from("custom_pages")
            .select("*")
            .eq("slug", slug)
            .maybeSingle();
          if (!error) {
            dbData = data;
          }
        } catch (e) {
          console.warn("Supabase query error for custom page:", e);
        }

        // Check local storage fallback
        const localKey = "hdv_mock_custom_pages";
        const local = localStorage.getItem(localKey);
        const localData = local ? JSON.parse(local) : [];

        // Match page
        let matched = dbData;
        if (!matched) {
          matched = localData.find((p: any) => p.slug === slug);
        }

        if (matched) {
          const mapped: CustomPage = {
            id: matched.id,
            slug: matched.slug,
            title: matched.title,
            h1Title: matched.h1_title ?? matched.h1Title ?? "",
            metaDescription: matched.meta_description ?? matched.metaDescription ?? "",
            metaKeywords: matched.meta_keywords ?? matched.metaKeywords ?? "",
            content: matched.content ?? "",
            isPublished: matched.is_published ?? matched.isPublished ?? false,
            featuredImage: matched.featured_image ?? matched.featuredImage ?? "",
            videoUrl: matched.video_url ?? matched.videoUrl ?? "",
            galleryImages: matched.gallery_images ?? matched.galleryImages ?? "",
            relatedEstablishments: matched.related_establishments ?? matched.relatedEstablishments ?? ""
          };
          setPage(mapped);
        } else {
          setPage(null);
        }
      } catch (err) {
        console.error("Error loading custom page:", err);
        setPage(null);
      } finally {
        setLoading(false);
      }
    }

    loadPageData();
  }, [slug]);

  // Update document metadata for SEO dynamically
  useEffect(() => {
    if (!page) return;

    // Save initial meta descriptors to restore if page changes
    const originalTitle = document.title;
    
    // Set title
    document.title = `${page.title} | Hoteles de Venezuela`;

    // Helper to update/create meta tags
    const updateMetaTag = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute("name", name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    if (page.metaDescription) {
      updateMetaTag("description", page.metaDescription);
    }
    if (page.metaKeywords) {
      updateMetaTag("keywords", page.metaKeywords);
    }

    return () => {
      document.title = originalTitle;
    };
  }, [page]);

  // Load related establishments
  useEffect(() => {
    if (!page) return;
    
    const ids = page.relatedEstablishments
      ? page.relatedEstablishments.split(",").map(id => id.trim()).filter(Boolean)
      : [];

    async function fetchRelated() {
      if (ids.length === 0) {
        setRelatedEsts([]);
        return;
      }
      try {
        const { data: estData, error } = await supabase
          .from("establishments")
          .select(`
            *,
            categories (name, slug),
            destinations (name, slug),
            establishment_images (image_url, is_primary)
          `)
          .in("id", ids)
          .eq("status", "approved");

        if (error) throw error;

        let mapped: Establishment[] = [];
        if (estData && estData.length > 0) {
          mapped = estData.map((item: any) => {
            const primaryImg = item.establishment_images?.find((img: any) => img.is_primary)?.image_url 
              || item.establishment_images?.[0]?.image_url 
              || "";
            return {
              id: item.id,
              slug: item.slug,
              name: item.name,
              description: item.description || "",
              address: item.address || "",
              phone: item.phone || "",
              whatsapp: item.whatsapp || "",
              website: item.website || "",
              category_name: item.categories?.name || "Establecimiento",
              category_slug: item.categories?.slug || "",
              destination_name: item.destinations?.name || "",
              destination_slug: item.destinations?.slug || "",
              primary_image: primaryImg,
              rating_avg: item.rating_avg || 0,
              review_count: item.review_count || 0,
              price_level: item.price_level || "",
              is_featured: item.is_featured || false,
              services: item.services || "[]",
              membership_tier: item.membership_tier || "basic",
              has_hdv_seal: item.has_hdv_seal || false
            };
          });
        }

        setRelatedEsts(mapped);
      } catch (err) {
        console.warn("Failed to load establishments from Supabase:", err);
        setRelatedEsts([]);
      }
    }

    fetchRelated();
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
        <p className="text-gray-400 text-xs font-bold font-sans">Cargando página personalizada...</p>
      </div>
    );
  }

  // If page does not exist or isn't found
  if (!page) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-magenta/10 flex items-center justify-center border border-brand-magenta/25 mx-auto mb-6">
          <Compass className="w-8 h-8 text-brand-magenta animate-pulse" />
        </div>
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">Página no encontrada</h1>
        <p className="text-gray-400 text-xs max-w-md mt-2">
          La página que buscas no existe o está temporalmente fuera de servicio.
        </p>
        <Link href="/" className="mt-6 btn-magenta-gradient px-6 py-3 rounded-xl font-bold text-xs shadow-md">
          Ir al Inicio
        </Link>
      </div>
    );
  }

  // Parse custom gallery images URLs
  const galleryArray = page.galleryImages
    ? page.galleryImages.split(/[\n,]+/).map(img => img.trim()).filter(Boolean)
    : [];

  const isHtmlContent = /<[a-z][\s\S]*>/i.test(page.content || "");
  const embedVideoUrl = getEmbedUrl(page.videoUrl || "");

  return (
    <div className="min-h-screen bg-gray-50/20 pb-24 font-sans">
      {/* Borrador notice banner if applicable */}
      {!page.isPublished && (
        <div className="bg-amber-500 text-slate-900 text-xs font-bold py-2.5 px-4 text-center sticky top-0 z-50 flex items-center justify-center gap-1.5 shadow-md">
          <span>⚠️ MODO VISTA PREVIA:</span>
          <span className="font-medium">Esta página es un Borrador. Solo los administradores pueden verla actualmente.</span>
        </div>
      )}

      {/* Main Cover Header - Full Width Bleed */}
      {slug === "quienes-somos" ? (
        <div className="w-full relative py-20 md:py-28 overflow-hidden" style={{ background: "linear-gradient(135deg, #0e0120 0%, #1a0533 60%, #0d1a2e 100%)" }}>
          {/* Background Image of Brand & Beach */}
          <img 
            src="/images/quienes-somos/banner_hv_pareja.jpg" 
            alt="Hoteles de Venezuela Su Guía Turística" 
            className="absolute inset-0 w-full h-full object-cover scale-[1.05] object-top opacity-35"
          />

          {/* Dark Overlay for Contrast and Space Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0e0120]/70 via-[#1a0533]/60 to-[#0d1a2e]/80 pointer-events-none" />

          {/* Animated Constellation Canvas */}
          <ConstellationBackground />

          <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "#FF0096" }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "#00C8D4" }} />
          
          {/* Bottom white fade overlay to blend with the white page background */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 bg-white/10 border border-white/20 text-white backdrop-blur-md">
              <Building2 className="w-3.5 h-3.5 text-[#00C8D4]" />
              <span>HOTELES DE VENEZUELA LLC · CORREO: HOTELESDEVENEZUELA77@GMAIL.COM</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-2xl leading-tight mb-3 flex items-center justify-center gap-3 flex-wrap font-serif">
              <span>PANEL ADMINISTRATIVO CENTRAL: EL CORAZÓN DE HOTELES DE VENEZUELA LLC</span>
              <span className="flex items-center gap-2 shrink-0">
                {/* USA Flag */}
                <svg className="w-8 h-5 rounded-xs shadow-md inline-block object-cover border border-white/20 align-middle" viewBox="0 0 7410 3900" xmlns="http://www.w3.org/2000/svg">
                  <rect width="7410" height="3900" fill="#b22234"/>
                  <path d="M0,300h7410M0,900h7410M0,1500h7410M0,2100h7410M0,2700h7410M0,3300h7410" stroke="#fff" strokeWidth="300"/>
                  <rect width="2964" height="2100" fill="#3c3b6e"/>
                  <g fill="#fff">
                    <circle cx="296" cy="175" r="45"/><circle cx="889" cy="175" r="45"/><circle cx="1482" cy="175" r="45"/><circle cx="2075" cy="175" r="45"/><circle cx="2668" cy="175" r="45"/>
                    <circle cx="593" cy="350" r="45"/><circle cx="1186" cy="350" r="45"/><circle cx="1778" cy="350" r="45"/><circle cx="2371" cy="350" r="45"/>
                    <circle cx="296" cy="525" r="45"/><circle cx="889" cy="525" r="45"/><circle cx="1482" cy="525" r="45"/><circle cx="2075" cy="525" r="45"/><circle cx="2668" cy="525" r="45"/>
                    <circle cx="593" cy="700" r="45"/><circle cx="1186" cy="700" r="45"/><circle cx="1778" cy="700" r="45"/><circle cx="2371" cy="700" r="45"/>
                    <circle cx="296" cy="875" r="45"/><circle cx="889" cy="875" r="45"/><circle cx="1482" cy="875" r="45"/><circle cx="2075" cy="875" r="45"/><circle cx="2668" cy="875" r="45"/>
                    <circle cx="593" cy="1050" r="45"/><circle cx="1186" cy="1050" r="45"/><circle cx="1778" cy="1050" r="45"/><circle cx="2371" cy="1050" r="45"/>
                    <circle cx="296" cy="1225" r="45"/><circle cx="889" cy="1225" r="45"/><circle cx="1482" cy="1225" r="45"/><circle cx="2075" cy="1225" r="45"/><circle cx="2668" cy="1225" r="45"/>
                    <circle cx="593" cy="1400" r="45"/><circle cx="1186" cy="1400" r="45"/><circle cx="1778" cy="1400" r="45"/><circle cx="2371" cy="1400" r="45"/>
                    <circle cx="296" cy="1575" r="45"/><circle cx="889" cy="1575" r="45"/><circle cx="1482" cy="1575" r="45"/><circle cx="2075" cy="1575" r="45"/><circle cx="2668" cy="1575" r="45"/>
                    <circle cx="593" cy="1750" r="45"/><circle cx="1186" cy="1750" r="45"/><circle cx="1778" cy="1750" r="45"/><circle cx="2371" cy="1750" r="45"/>
                    <circle cx="296" cy="1925" r="45"/><circle cx="889" cy="1925" r="45"/><circle cx="1482" cy="1925" r="45"/><circle cx="2075" cy="1925" r="45"/><circle cx="2668" cy="1925" r="45"/>
                  </g>
                </svg>
                {/* Venezuela Flag */}
                <svg className="w-8 h-5 rounded-xs shadow-md inline-block object-cover border border-white/20 align-middle" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
                  <rect width="900" height="200" fill="#ffcc00"/>
                  <rect y="200" width="900" height="200" fill="#00247d"/>
                  <rect y="400" width="900" height="200" fill="#cf142b"/>
                  <g fill="#fff" transform="translate(450, 310)">
                    <circle cx="-100" cy="20" r="10" />
                    <circle cx="-73" cy="-10" r="10" />
                    <circle cx="-40" cy="-30" r="10" />
                    <circle cx="-13" cy="-40" r="10" />
                    <circle cx="13" cy="-40" r="10" />
                    <circle cx="40" cy="-30" r="10" />
                    <circle cx="73" cy="-10" r="10" />
                    <circle cx="100" cy="20" r="10" />
                  </g>
                </svg>
              </span>
            </h1>
            
            <p className="text-base md:text-xl font-serif text-white/90 font-bold tracking-widest mt-2 uppercase drop-shadow-md">
              QUIÉNES SOMOS - NUESTRO ECOSISTEMA
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full relative h-[400px] md:h-[500px] overflow-hidden">
          {page.featuredImage ? (
            <img 
              src={page.featuredImage} 
              alt={page.title} 
              className="w-full h-full object-cover scale-[1.08]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&q=80";
              }}
            />
          ) : (
            <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #0e0120, #1a0533, #0a1628)" }} />
          )}

          {/* Top/Middle dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-transparent pointer-events-none" />

          {/* Bottom white fade overlay to blend with the white page background */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />

          {/* Center-aligned info overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <p className="text-white/80 text-[10px] md:text-xs font-black tracking-[0.3em] uppercase mb-3 drop-shadow-md">
              EL PARAÍSO TE ESPERA
            </p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-2xl leading-tight max-w-4xl playfair">
              {page.h1Title || page.title}
            </h1>
          </div>
        </div>
      )}

      {/* Rich Page Body Content */}
      {slug === "quienes-somos" ? (
        <div className="max-w-7xl mx-auto px-6 mt-12 mb-20 space-y-16">
          {/* Breadcrumb Navigation */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-gray-500 hover:text-brand-magenta transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span>INICIO</span>
            </Link>
          </div>

          {/* ── SECCIÓN 1: EL CEREBRO OPERATIVO (DASHBOARD CENTRALIZADO) ── */}
          <div className="space-y-6">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/20">
                <Cpu className="w-3.5 h-3.5 text-[#FF0096]" />
                <span>NÚCLEO TECNOLÓGICO CENTRAL</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight font-serif">
                El Cerebro Operativo: Control Centralizado en Tiempo Real
              </h2>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                Nuestra plataforma no es solo un portal estático; es una infraestructura viva impulsada por software de nivel corporativo que gestiona reservas, inventarios y análisis predictivo sin comisiones intermedias.
              </p>
            </div>

            {/* Dashboard Mockup Grid con Punteros Flotantes y Sidecard de Métricas */}
            <div className="grid lg:grid-cols-12 gap-8 items-stretch">
              {/* Main Interactive Dashboard View (8 cols) */}
              <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                {/* Floating Pointer 1 */}
                <div className="absolute top-6 left-6 z-20 hidden sm:flex items-center gap-2 bg-[#00C8D4]/90 backdrop-blur-md text-slate-950 text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg border border-[#00C8D4]">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>[CONTROL DE INVENTARIO EN TIEMPO REAL]</span>
                </div>

                {/* Floating Pointer 2 */}
                <div className="absolute top-6 right-6 z-20 hidden sm:flex items-center gap-2 bg-[#FF0096]/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg border border-[#FF0096]">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>[VERIFICACIÓN OPERATIVA]</span>
                </div>

                {/* Floating Pointer 3 */}
                <div className="absolute bottom-6 left-6 z-20 hidden sm:flex items-center gap-2 bg-[#9B00CC]/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg border border-[#9B00CC]">
                  <span className="w-2 h-2 rounded-full bg-white animate-bounce" />
                  <span>[ANÁLISIS DE MERCADO Y DEMANDA]</span>
                </div>

                {/* Mockup Top Bar */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 relative z-10 pt-8 sm:pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-xs font-mono text-slate-400 font-bold hidden sm:inline">hdv-core.admin.console-v4.2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      CONEXIÓN ENCRIPTADA TLS 1.3
                    </span>
                  </div>
                </div>

                {/* Mockup Dashboard Content Grid */}
                <div className="grid sm:grid-cols-3 gap-4 relative z-10 my-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-left">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Establecimientos Activos</span>
                      <Building2 className="w-4 h-4 text-[#00C8D4]" />
                    </div>
                    <span className="text-2xl font-black text-white block">450 En Gestión</span>
                    <span className="text-[10px] text-emerald-400 font-bold">↑ 100% Verificados</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-left">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Reservas Directas</span>
                      <CalendarCheck className="w-4 h-4 text-[#FF0096]" />
                    </div>
                    <span className="text-2xl font-black text-white block">10,248 Mes</span>
                    <span className="text-[10px] text-[#FF0096] font-bold">0% Comisiones Intermedias</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-left">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Telemetría NASA & Oleaje</span>
                      <Activity className="w-4 h-4 text-[#9B00CC]" />
                    </div>
                    <span className="text-2xl font-black text-white block">24/7 Monitoreo</span>
                    <span className="text-[10px] text-[#00C8D4] font-bold">Sincronización Satelital</span>
                  </div>
                </div>

                {/* Graph Representation */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 relative z-10 space-y-3 mt-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Flujo de Reservas & Ocupación Nacional</span>
                    <span className="text-[#00C8D4]">Tiempo Real</span>
                  </div>
                  <div className="h-24 flex items-end justify-between gap-2 pt-4">
                    {[40, 65, 55, 80, 70, 95, 85, 90, 100, 92, 98].map((h, i) => (
                      <div key={i} className="w-full bg-slate-800 rounded-t-md relative group">
                        <div 
                          className="bg-gradient-to-t from-[#9B00CC] via-[#FF0096] to-[#00C8D4] rounded-t-md transition-all duration-500"
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidecard de Métricas Operativas en Vivo (4 cols) */}
              <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col justify-between text-left space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#FF0096]/20 border border-[#FF0096]/30 flex items-center justify-center text-[#FF0096]">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Métricas Operativas</h3>
                        <p className="text-[10px] text-slate-400 font-medium">Panel de Estado Global</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    {/* Metric 1 */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-300">Nivel de Reserva Global</span>
                        <span className="text-[#00C8D4]">98.4%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] h-full rounded-full w-[98%]" />
                      </div>
                    </div>

                    {/* Metric 2 */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-300">Tasa de Ocupación Promedio</span>
                        <span className="text-[#FF0096]">92.8%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#FF0096] to-[#9B00CC] h-full rounded-full w-[93%]" />
                      </div>
                    </div>

                    {/* Metric 3 */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-300">Huéspedes Activos</span>
                        <span className="text-white font-mono font-bold">3,420+</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Turistas en tránsito en todo el país</div>
                    </div>

                    {/* Metric 4 */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-300">Uptime del Sistema</span>
                        <span className="text-emerald-400 font-bold">99.99%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full w-[100%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── SECCIÓN 2: EL ECOSISTEMA TECH EN ACCIÓN (SHOWCASE DE APPS Y SOFTWARE) ── */}
          <div className="space-y-8 pt-6">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black bg-[#FF0096]/10 text-[#FF0096] border border-[#FF0096]/20">
                <Layers className="w-3.5 h-3.5 text-[#00C8D4]" />
                <span>SUITE TECNOLÓGICA PROPIETARIA</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight font-serif">
                El Ecosistema Tech en Acción
              </h2>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                Desarrollamos soluciones digitales nativas para cada actor del sector turístico: desde el huésped hasta el gerente de hotel.
              </p>
            </div>

            {/* Grid de Vitrina (3 Columnas de Mockups) */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Tarjeta 1: Native App B2C */}
              <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xl space-y-4 hover:shadow-2xl transition-all group flex flex-col justify-between text-left">
                <div className="space-y-3">
                  <div className="aspect-[9/14] bg-slate-900 rounded-2xl overflow-hidden relative border border-slate-800 shadow-md">
                    <img 
                      src="/images/quienes-somos/chica_coctel_morrocoy_hv.jpg" 
                      alt="App Móvil B2C" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent p-5 flex flex-col justify-end">
                      <span className="text-[10px] font-black uppercase text-[#00C8D4] tracking-widest">NATIVE APP B2C</span>
                      <span className="text-sm font-bold text-white">App Móvil para Viajeros</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 font-serif">APP MÓVIL PROPIETARIA (B2C)</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Reserva directa, mensajería integrada con el hotel y guías turísticas interactiva en tiempo real.
                  </p>
                </div>
              </div>

              {/* Tarjeta 2: Hotel PMS & Booking Engine B2B */}
              <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xl space-y-4 hover:shadow-2xl transition-all group flex flex-col justify-between text-left">
                <div className="space-y-3">
                  <div className="aspect-[9/14] bg-slate-900 rounded-2xl overflow-hidden relative border border-slate-800 shadow-md flex items-center justify-center p-4">
                    <div className="w-full h-full rounded-xl bg-slate-950 p-4 border border-slate-800 text-left space-y-3 flex flex-col justify-between">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-[#00C8D4]">HOTEL PMS PANEL</span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">EN VIVO</span>
                      </div>
                      <div className="space-y-2">
                        <div className="p-2 rounded bg-white/5 text-[10px] text-slate-300">Habitación 104 - Confirmada ($120/noche)</div>
                        <div className="p-2 rounded bg-white/5 text-[10px] text-slate-300">Habitación 201 - Check-in Automático</div>
                        <div className="p-2 rounded bg-white/5 text-[10px] text-slate-300">Tarifas Dinámicas - Temporada Alta</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#FF0096]/15 border border-[#FF0096]/30 text-[10px] text-[#FF0096] font-bold text-center">
                        0% COMISIÓN POR RESERVA
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 font-serif">HOTEL PMS & BOOKING ENGINE (B2B)</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Gestión de inventario centralizada, calendario inteligente y motor de reservas sin comisiones por intermediarios.
                  </p>
                </div>
              </div>

              {/* Tarjeta 3: POS & CRM Integrado */}
              <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xl space-y-4 hover:shadow-2xl transition-all group flex flex-col justify-between text-left">
                <div className="space-y-3">
                  <div className="aspect-[9/14] bg-slate-900 rounded-2xl overflow-hidden relative border border-slate-800 shadow-md">
                    <img 
                      src="/images/quienes-somos/flamenco_morrocoy_hv.jpg" 
                      alt="POS de Servicios & CRM" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent p-5 flex flex-col justify-end">
                      <span className="text-[10px] font-black uppercase text-[#FF0096] tracking-widest">POS & WHATSAPP CRM</span>
                      <span className="text-sm font-bold text-white">Gestión Integrada de Servicios</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 font-serif">POS DE SERVICIOS & CRM INTEGRADO</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Control de restaurantes, servicios adicionales, reservas de tours y atención automatizada vía WhatsApp.
                  </p>
                </div>
              </div>
            </div>

            {/* Subsección Tech Stack (Listado Icónico con cajas sólidas de color y icono blanco calado) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white border border-gray-150 shadow-md flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-[#FF0096] flex items-center justify-center text-white shrink-0 shadow-md">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">SISTEMAS AVANZADOS POS</h4>
                  <p className="text-[10px] text-slate-500">Cobros e integración de caja</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-gray-150 shadow-md flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-[#00C8D4] flex items-center justify-center text-white shrink-0 shadow-md">
                  <CalendarCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">MOTORES DE RESERVA A MEDIDA</h4>
                  <p className="text-[10px] text-slate-500">Checkout rápido y seguro</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-gray-150 shadow-md flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-md">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">CRM WHATSAPP INTEGRADO</h4>
                  <p className="text-[10px] text-slate-500">Atención cliente en tiempo real</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-gray-150 shadow-md flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-[#9B00CC] flex items-center justify-center text-white shrink-0 shadow-md">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">DATOS PREDICTIVOS</h4>
                  <p className="text-[10px] text-slate-500">IA de optimización tarifaria</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── SECCIÓN 3: CONFIANZA Y ALCANCE CORPORATIVO ── */}
          <div className="space-y-8 pt-6">
            {/* Badges de Verificación Institucional */}
            <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-10 shadow-2xl border border-slate-800 text-center space-y-6">
              <div className="max-w-2xl mx-auto space-y-2">
                <span className="text-[10px] font-black uppercase text-[#00C8D4] tracking-widest">RESPALDO LEGAL Y CORPORATIVO</span>
                <h3 className="text-2xl md:text-3xl font-black font-serif">Certificación Institucional Internacional</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF0096]/20 border border-[#FF0096]/40 flex items-center justify-center text-[#FF0096] shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Verificación LLC Internacional</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Empresa constituida legalmente bajo la razón social Hoteles de Venezuela LLC (USA & VZLA).</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-[#00C8D4]/20 border border-[#00C8D4]/40 flex items-center justify-center text-[#00C8D4] shrink-0">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Seguridad de Datos Protegidos</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Encriptación SSL de 256 bits, cumplimiento de privacidad y protección de transacciones.</p>
                  </div>
                </div>
              </div>

              {/* Ticker Infinito de Partners Tecnológicos */}
              <div className="pt-4 border-t border-slate-800">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Infraestructura y Partners Globales de Datos</p>
                <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 text-slate-400 font-mono text-xs font-bold">
                  <span className="hover:text-white transition-colors">SUPABASE CLOUD</span>
                  <span>•</span>
                  <span className="hover:text-white transition-colors">AWS AMAZON</span>
                  <span>•</span>
                  <span className="hover:text-white transition-colors">STRIPE PAYMENTS</span>
                  <span>•</span>
                  <span className="hover:text-white transition-colors">WHATSAPP CLOUD API</span>
                  <span>•</span>
                  <span className="hover:text-white transition-colors">VISA / MASTERCARD</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── SECCIÓN 4: LIDERAZGO Y EQUIPO TÉCNICO ── */}
          <div className="space-y-8 pt-6">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black bg-[#9B00CC]/10 text-[#9B00CC] border border-[#9B00CC]/20">
                <Users className="w-3.5 h-3.5 text-[#FF0096]" />
                <span>EQUIPO DE ALTO RENDIMIENTO</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight font-serif">
                Liderazgo y Equipo Tecnológico
              </h2>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                Profesionales enfocados en el desarrollo de software, arquitectura cloud y la excelencia en operaciones turísticas.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Perfil 1 */}
              <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-lg text-center space-y-4 hover:shadow-xl transition-all">
                <div className="w-20 h-20 rounded-full bg-slate-900 mx-auto border-2 border-[#00C8D4] overflow-hidden shadow-md flex items-center justify-center text-white text-xl font-bold font-serif">
                  AR
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Ing. Alexis Rodríguez</h3>
                  <p className="text-xs text-[#00C8D4] font-bold">Líder de Arquitectura Cloud</p>
                  <p className="text-[11px] text-slate-500 mt-2">Especialista en infraestructura distribuida, alta disponibilidad e integración de bases de datos.</p>
                </div>
              </div>

              {/* Perfil 2 */}
              <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-lg text-center space-y-4 hover:shadow-xl transition-all">
                <div className="w-20 h-20 rounded-full bg-slate-900 mx-auto border-2 border-[#FF0096] overflow-hidden shadow-md flex items-center justify-center text-white text-xl font-bold font-serif">
                  MT
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Lcda. María Elena Torres</h3>
                  <p className="text-xs text-[#FF0096] font-bold">Líder de Desarrollo & PMS Engine</p>
                  <p className="text-[11px] text-slate-500 mt-2">Diseñadora de la experiencia de usuario y arquitectura del motor de reservas sin comisiones.</p>
                </div>
              </div>

              {/* Perfil 3 */}
              <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-lg text-center space-y-4 hover:shadow-xl transition-all">
                <div className="w-20 h-20 rounded-full bg-slate-900 mx-auto border-2 border-[#9B00CC] overflow-hidden shadow-md flex items-center justify-center text-white text-xl font-bold font-serif">
                  CM
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Lic. Carlos Mendoza</h3>
                  <p className="text-xs text-[#9B00CC] font-bold">Director de Operaciones Turísticas</p>
                  <p className="text-[11px] text-slate-500 mt-2">Gestor de alianzas estratégicas con hoteles, posadas y operadores turísticos en todo el país.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-6 mt-12 mb-16">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-gray-500 hover:text-brand-magenta transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span>INICIO</span>
            </Link>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-lg shadow-gray-250/20 text-left">
            {isHtmlContent ? (
              <div 
                className="prose max-w-none text-gray-700 text-sm leading-relaxed whitespace-pre-wrap" 
                dangerouslySetInnerHTML={{ __html: page.content || "" }} 
              />
            ) : (
              <div className="text-gray-750 text-base leading-relaxed whitespace-pre-line">
                {page.content}
              </div>
            )}
          </div>
        </div>
      )}

      {/* YouTube Video Section */}
      {embedVideoUrl && (
        <div className="max-w-4xl mx-auto px-6 mt-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-brand-magenta/10 border border-brand-magenta/20 px-3.5 py-1.5 rounded-full text-xs font-black text-brand-magenta mb-3">
              <Play className="w-4 h-4 text-brand-magenta fill-brand-magenta" />
              <span>MULTIMEDIA RECOMENDADO</span>
            </div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Video Promocional</h2>
            <p className="text-gray-400 text-xs mt-1">Disfruta de una mirada en video sobre esta maravillosa experiencia.</p>
          </div>
          
          <div className="bg-black border border-gray-150 rounded-3xl overflow-hidden aspect-video shadow-2xl relative">
            <iframe 
              src={embedVideoUrl} 
              title={page.title} 
              allowFullScreen
              className="w-full h-full border-none"
            />
          </div>
        </div>
      )}

      {/* Image Gallery Grid Section */}
      {galleryArray.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-brand-purples/10 border border-brand-purple/20 px-3.5 py-1.5 rounded-full text-xs font-black text-brand-purple mb-3">
              <ImageIcon className="w-3.5 h-3.5 text-brand-purple" />
              <span>GALERÍA DE FOTOS</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">Galería Fotográfica</h2>
            <p className="text-gray-400 text-xs mt-1">Imágenes espectaculares seleccionadas especialmente.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {galleryArray.map((imgUrl, idx) => (
              <div 
                key={idx} 
                className="group relative rounded-3xl overflow-hidden shadow-md h-64 bg-gray-100 border border-gray-100 cursor-pointer"
                onClick={() => setLightboxImage(imgUrl)}
              >
                <img 
                  src={imgUrl} 
                  alt={`${page.title} Galería ${idx + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] text-white font-black tracking-widest uppercase bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20">
                    Ampliar Imagen
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Establishments / Recommendations Section */}
      {relatedEsts.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-20">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-magenta/10 border border-brand-magenta/20 text-xs font-black text-brand-magenta mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>RECOMENDACIONES REALEZAS HDV</span>
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">Hospedajes Relacionados Recomendados</h2>
            <p className="text-gray-400 text-xs mt-1">Reserva directo sin comisiones con los mejores hospedajes de la zona.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedEsts.map((est) => (
              <EstablishmentCard key={est.id} establishment={est} />
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Pop-up Overlay */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="max-w-5xl max-h-[85vh] overflow-hidden rounded-2xl relative" onClick={e => e.stopPropagation()}>
            <img 
              src={lightboxImage} 
              alt="Ampliada" 
              className="w-full max-h-[85vh] object-contain rounded-2xl" 
            />
          </div>
        </div>
      )}
    </div>
  );
}