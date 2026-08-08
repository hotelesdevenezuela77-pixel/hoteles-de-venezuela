import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { supabase } from "../lib/supabase";
import { ESTABLISHMENTS_MOCK } from "../lib/establishmentsMock";
import { EstablishmentCard } from "../components/layout/EstablishmentCard";
import type { Establishment } from "../components/layout/EstablishmentCard";
import { 
  ArrowLeft, Play, Loader2, Image as ImageIcon, Sparkles, X, Compass,
  TrendingUp, Award, ShieldCheck, Zap, BarChart3
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
        <div className="w-full relative py-24 md:py-32 overflow-hidden">
          {/* Background Image of Brand & Beach */}
          <img 
            src="/images/quienes-somos/banner_hv_pareja.jpg" 
            alt="Hoteles de Venezuela Su Guía Turística" 
            className="absolute inset-0 w-full h-full object-cover scale-[1.05] object-center"
          />

          {/* Soft Dark Overlay to ensure image is clearly visible while text pops */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0e0120]/50 via-[#1a0533]/40 to-[#0d1a2e]/65 pointer-events-none" />

          {/* Animated Constellation Canvas */}
          <ConstellationBackground />

          <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "#FF0096" }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "#00C8D4" }} />
          
          {/* Bottom white fade overlay to blend with the white page background */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <p className="text-[#00C8D4] text-[10px] md:text-xs font-black tracking-[0.3em] uppercase mb-3 flex items-center justify-center gap-2 drop-shadow-md">
              <Sparkles className="w-4 h-4 text-[#FF0096]" />
              <span>TECNOLOGÍA DE VANGUARDIA · EL PARAÍSO TE ESPERA</span>
            </p>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-2xl leading-tight mb-3 flex items-center justify-center gap-3 flex-wrap font-serif">
              <span>HOTELES DE VENEZUELA LLC</span>
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
              {page.h1Title || page.title || "QUIÉNES SOMOS - NUESTRO EQUIPO"}
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
        <div className="max-w-6xl mx-auto px-6 mt-12 mb-16 space-y-12">
          {/* Breadcrumb Navigation */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-gray-500 hover:text-brand-magenta transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span>INICIO</span>
            </Link>
          </div>

          {/* Section 1: Quiénes Somos - Texto + Gráficas & Métricas de Tecnología */}
          <div className="grid md:grid-cols-12 gap-8 items-stretch">
            {/* Left 7 Columns: Texto Principal en Tarjeta Elegante */}
            <div className="md:col-span-7 bg-white border border-gray-100 rounded-3xl p-8 md:p-10 shadow-xl text-left space-y-4 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/20 self-start">
                <Sparkles className="w-3.5 h-3.5 text-[#FF0096]" />
                <span>NUESTRA MISIÓN & VISIÓN</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-serif">
                Impulsando el Turismo y la Excelencia Hotelera en Venezuela
              </h2>

              {isHtmlContent ? (
                <div 
                  className="prose max-w-none text-slate-700 text-sm leading-relaxed whitespace-pre-wrap" 
                  dangerouslySetInnerHTML={{ __html: page.content || "" }} 
                />
              ) : (
                <div className="text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {page.content}
                </div>
              )}
            </div>

            {/* Right 5 Columns: Panel de Gráficas e Indicadores de Rendimiento */}
            <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl text-left flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF0096]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00C8D4]/10 rounded-full blur-3xl pointer-events-none" />

              {/* Widget Header */}
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#00C8D4]/15 border border-[#00C8D4]/30 flex items-center justify-center text-[#00C8D4]">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide">Métricas & Alcance</h3>
                      <p className="text-[10px] text-slate-400 font-medium">Estadísticas en Tiempo Real</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    En Vivo
                  </span>
                </div>

                {/* Progress Bars / Gráficas */}
                <div className="space-y-4 pt-2">
                  {/* Metric 1 */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">Posicionamiento Orgánico Google</span>
                      <span className="text-[#00C8D4]">98.4%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] h-full rounded-full w-[98%]" />
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">Retención & Reserva Directa</span>
                      <span className="text-[#FF0096]">94.2%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-[#FF0096] to-[#9B00CC] h-full rounded-full w-[94%]" />
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">Disponibilidad de Red (Uptime)</span>
                      <span className="text-emerald-400">99.9%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-[#00C8D4] h-full rounded-full w-[99%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Metric Badge Grid */}
              <div className="grid grid-cols-2 gap-3 relative z-10 pt-2">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FF0096]/20 flex items-center justify-center text-[#FF0096] shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">#1 Google</span>
                    <span className="text-[9px] text-slate-400">Alcance Orgánico</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00C8D4]/20 flex items-center justify-center text-[#00C8D4] shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Certificado</span>
                    <span className="text-[9px] text-slate-400">Sello de Calidad</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Galería Visual de Destinos 9:16 (Flamenco + Chica Coctel Morrocoy) */}
          <div className="grid md:grid-cols-12 gap-8 items-stretch pt-4">
            {/* Left 5 Columns: Tarjeta de Innovación Ecosistema */}
            <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-8 md:p-10 shadow-2xl border border-slate-800 text-left space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black bg-[#FF0096]/20 text-[#FF0096] border border-[#FF0096]/30 self-start">
                  <Compass className="w-3.5 h-3.5" />
                  <span>ECOSISTEMA TURÍSTICO NACIONAL</span>
                </div>
                
                <h3 className="text-2xl font-black tracking-tight font-serif text-white">
                  La Red de Hospedajes y Destinos Más Amplia del País
                </h3>

                <p className="text-slate-300 text-sm leading-relaxed">
                  Nuestra plataforma conecta a turistas nacionales e internacionales con los mejores hoteles, posadas y complejos turísticos en los destinos más paradisíacos de Venezuela, desde Morrocoy y Los Roques hasta los Andes y Canaima.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-2xl font-black text-[#00C8D4] block">+100</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Establecimientos</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-2xl font-black text-[#FF0096] block">24/7</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Atención Directa</span>
                </div>
              </div>
            </div>

            {/* Right 7 Columns: 2 Vertical Images (Flamenco + Chica Coctel) Both 9:16 Aspect Ratio */}
            <div className="md:col-span-7 grid grid-cols-2 gap-4">
              <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-150 group relative aspect-[9/16] bg-slate-900">
                <img 
                  src="/images/quienes-somos/flamenco_morrocoy_hv.jpg" 
                  alt="Flamenco en Morrocoy Hoteles de Venezuela" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                  onClick={() => setLightboxImage("/images/quienes-somos/flamenco_morrocoy_hv.jpg")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-95 p-5 flex flex-col justify-end text-left">
                  <span className="text-[10px] font-black uppercase text-[#00C8D4] tracking-widest mb-0.5">Fauna & Naturaleza</span>
                  <span className="text-xs font-bold text-white">Parque Nacional Morrocoy</span>
                </div>
              </div>

              <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-150 group relative aspect-[9/16] bg-slate-900">
                <img 
                  src="/images/quienes-somos/chica_coctel_morrocoy_hv.jpg" 
                  alt="Experiencia Caribeña Hoteles de Venezuela" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                  onClick={() => setLightboxImage("/images/quienes-somos/chica_coctel_morrocoy_hv.jpg")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-95 p-5 flex flex-col justify-end text-left">
                  <span className="text-[10px] font-black uppercase text-[#FF0096] tracking-widest mb-0.5">Experiencia Premium</span>
                  <span className="text-xs font-bold text-white">Guía Turística de Venezuela</span>
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