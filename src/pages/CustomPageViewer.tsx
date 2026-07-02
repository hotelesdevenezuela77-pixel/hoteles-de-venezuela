import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { supabase } from "../lib/supabase";
import { ESTABLISHMENTS_MOCK } from "../lib/establishmentsMock";
import { EstablishmentCard } from "../components/layout/EstablishmentCard";
import type { Establishment } from "../components/layout/EstablishmentCard";
import { 
  ArrowLeft, Play, Loader2, Image as ImageIcon, Sparkles, X, Compass
} from "lucide-react";

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
          .in("id", ids);

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

        // Supplement with mock database items if offline or mock IDs used
        const mockMatches = ESTABLISHMENTS_MOCK.filter(e => ids.includes(String(e.id)));
        const combined = [...mapped];
        for (const mock of mockMatches) {
          if (!combined.some(c => c.id === mock.id)) {
            combined.push(mock);
          }
        }
        setRelatedEsts(combined);
      } catch (err) {
        console.warn("Failed to load establishments from Supabase, resolving from mock:", err);
        const mockMatches = ESTABLISHMENTS_MOCK.filter(e => ids.includes(String(e.id)));
        setRelatedEsts(mockMatches);
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
      <div className="w-full relative h-[400px] md:h-[550px] overflow-hidden">
        {page.featuredImage ? (
          <img 
            src={page.featuredImage} 
            alt={page.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&q=80";
            }}
          />
        ) : (
          <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #0e0120, #1a0533, #0a1628)" }} />
        )}

        {/* overlay shade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

        {/* info overlay - aligned content */}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl w-full mx-auto px-6 pb-12 md:pb-16 text-white text-left">
            <span className="inline-flex items-center gap-1.5 bg-brand-magenta text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase shadow-lg shadow-brand-magenta/25 mb-4">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Explorar Venezuela</span>
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-lg leading-tight max-w-4xl">
              {page.h1Title || page.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Rich Page Body Content */}
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