import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { supabase } from "../lib/supabase";
import { OFFICIAL_WHATSAPP_NUMBER } from "@/config/whatsapp";
import { ESTABLISHMENTS_MOCK } from "../lib/establishmentsMock";
import { EstablishmentCard } from "../components/layout/EstablishmentCard";
import type { Establishment } from "../components/layout/EstablishmentCard";
import { 
  ArrowLeft, Compass, Sparkles, Loader2, MessageSquare, MapPin, Tag, Star
} from "lucide-react";

interface TouristSite {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  imageUrl: string;
  destinationId: number | null;
  category: string;
  highlights: string;
  isFeatured: boolean;
  isActive: boolean;
}

export function SitioDetalle() {
  const [, params] = useRoute("/sitio/:slug");
  const slug = (params as any)?.slug;

  const [site, setSite] = useState<TouristSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedEsts, setRelatedEsts] = useState<Establishment[]>([]);
  const [destinationName, setDestinationName] = useState<string>("");

  useEffect(() => {
    async function loadSiteData() {
      if (!slug) return;
      try {
        setLoading(true);
        let dbData: any = null;

        // Try querying Supabase
        try {
          const { data, error } = await supabase
            .from("tourist_sites")
            .select("*")
            .eq("slug", slug)
            .maybeSingle();
          if (!error) {
            dbData = data;
          }
        } catch (e) {
          console.warn("Supabase query error for tourist site:", e);
        }

        // Fallback to local storage or defaults
        const localKey = "hdv_mock_tourist_sites";
        const local = localStorage.getItem(localKey);
        const localData = local ? JSON.parse(local) : [];

        // Match site
        let matched = dbData;
        if (!matched) {
          const defaults = [
            {
              id: 1,
              name: "Cayo Sombrero",
              slug: "cayo-sombrero",
              short_description: "El cayo más emblemático de Morrocoy, famoso por su oleaje suave, palmeras perfectas y aguas de azul turquesa transparente.",
              long_description: "Cayo Sombrero es el cayo más famoso y concurrido del Parque Nacional Morrocoy en Falcón, Venezuela. Cuenta con dos playas de gran extensión de arena blanca, aguas cristalinas y un bosque de cocoteros que ofrece sombra natural a los visitantes.\n\nEs ideal para la práctica de snorkel gracias a sus formaciones coralinas poco profundas. También cuenta con vendedores locales que ofrecen exquisitos platos a base de mariscos frescos y ostras.",
              image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop",
              destination_id: 10, // Morrocoy
              category: "Playas",
              highlights: "Snorkel, Restaurantes locales, Palmeras, Aguas mansas",
              is_featured: true,
              is_active: true
            },
            {
              id: 2,
              name: "El Salto Ángel (Kerepakupai Vená)",
              slug: "salto-angel",
              short_description: "La caída de agua más alta del mundo, brotando desde el imponente Auyantepuy en el Parque Nacional Canaima.",
              long_description: "El Salto Ángel, con sus 979 metros de altura libre, es la cascada más alta del planeta. Se encuentra ubicado en el Parque Nacional Canaima, en el estado Bolívar, Venezuela. Esta caída de agua brota desde la cima del Auyantepuy, uno de los tepuyes más macizos y misteriosos del Escudo Guayanés.\n\nLa única forma de aproximarse de cerca es reservando una travesía fluvial navegando los ríos Carrao y Churún a bordo de una curiara indígena, culminando con una elogiada caminata a través de la selva tropical lluviosa hasta el mirador de la cascada.",
              image_url: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&auto=format&fit=crop",
              destination_id: 2, // Canaima
              category: "Cataratas",
              highlights: "Tepuyes, Aventura, Selva tropical, Navegación",
              is_featured: true,
              is_active: true
            },
            {
              id: 3,
              name: "Cayo de Agua",
              slug: "cayo-de-agua",
              short_description: "Una joya de Los Roques donde dos lenguas de arena blanca se encuentran en medio de aguas turquesas poco profundas.",
              long_description: "Cayo de Agua es uno de los cayos más bellos del Archipiélago de Los Roques. Su atractivo singular es un istmo natural o estrecha franja de arena blanca que conecta dos porciones de tierra a través de aguas turquesas de muy poca profundidad.\n\nAl no tener servicios turísticos de gran envergadura (como restaurantes o toldos comerciales), conserva una pureza visual virgen, convirtiéndolo en un refugio de paz ideal para la observación de aves, snorkel en sus aguas mansas y fotografía de paisaje.",
              image_url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&auto=format&fit=crop",
              destination_id: 6, // Los Roques
              category: "Cayos",
              highlights: "Istmo natural, Arena blanca, Snorkel, Aguas tranquilas",
              is_featured: true,
              is_active: true
            }
          ];

          const combined = [...localData];
          defaults.forEach(d => {
            if (!combined.some(c => c.slug === d.slug)) {
              combined.push(d);
            }
          });

          matched = combined.find((p: any) => p.slug === slug);
        }

        if (matched) {
          const mapped: TouristSite = {
            id: matched.id,
            name: matched.name,
            slug: matched.slug,
            shortDescription: matched.short_description || matched.shortDescription || "",
            longDescription: matched.long_description || matched.longDescription || matched.short_description || "",
            imageUrl: matched.image_url || matched.imageUrl || "",
            destinationId: matched.destination_id ?? matched.destinationId ?? null,
            category: matched.category || "naturaleza",
            highlights: matched.highlights || "",
            isFeatured: matched.is_featured ?? matched.isFeatured ?? false,
            isActive: matched.is_active ?? matched.isActive ?? true
          };
          setSite(mapped);
        } else {
          setSite(null);
        }
      } catch (err) {
        console.error("Error loading tourist site:", err);
        setSite(null);
      } finally {
        setLoading(false);
      }
    }

    loadSiteData();
  }, [slug]);

  // Load related establishments and destination details
  useEffect(() => {
    if (!site) return;

    // Load destination name dynamically
    async function loadDestination() {
      if (site.destinationId) {
        try {
          const { data, error } = await supabase
            .from("destinations")
            .select("name")
            .eq("id", site.destinationId)
            .maybeSingle();
          if (!error && data) {
            setDestinationName(data.name);
          } else {
            // Local fallback
            const names: Record<number, string> = { 1: "Caracas", 2: "Maracaibo", 3: "Valencia", 6: "Los Roques", 7: "Canaima", 9: "Mérida", 10: "Morrocoy" };
            setDestinationName(names[site.destinationId] || "");
          }
        } catch (e) {
          const names: Record<number, string> = { 1: "Caracas", 2: "Maracaibo", 3: "Valencia", 6: "Los Roques", 7: "Canaima", 9: "Mérida", 10: "Morrocoy" };
          setDestinationName(names[site.destinationId] || "");
        }
      }
    }

    async function loadRelated() {
      if (!site.destinationId) return;
      try {
        const { data, error } = await supabase
          .from("establishments")
          .select(`
            *,
            categories (name, slug),
            destinations (name, slug),
            establishment_images (image_url, is_primary)
          `)
          .eq("destination_id", site.destinationId)
          .eq("status", "approved")
          .limit(3);

        if (error) throw error;

        let mapped: Establishment[] = [];
        if (data && data.length > 0) {
          mapped = data.map((item: any) => {
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

        setRelatedEsts(mapped.slice(0, 3));
      } catch (err) {
        console.warn("Error fetching related establishments:", err);
        setRelatedEsts([]);
      }
    }

    loadDestination().then(() => loadRelated());
  }, [site, destinationName]);

  // Update SEO Title dynamically
  useEffect(() => {
    if (!site) return;
    const originalTitle = document.title;
    document.title = `${site.name} | Sitios Turísticos de Venezuela`;

    return () => {
      document.title = originalTitle;
    };
  }, [site]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-[#FF0096] animate-spin" />
        <p className="text-gray-400 text-xs font-bold font-sans">Cargando sitio de interés...</p>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#FF0096]/10 flex items-center justify-center border border-[#FF0096]/25 mx-auto mb-6">
          <Compass className="w-8 h-8 text-[#FF0096] animate-pulse" />
        </div>
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">Lugar no encontrado</h1>
        <p className="text-gray-400 text-xs max-w-md mt-2">
          El sitio turístico que buscas no se encuentra en nuestra base de datos.
        </p>
        <Link href="/" className="mt-6 inline-block bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-95 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all">
          Ir al Inicio
        </Link>
      </div>
    );
  }

  const highlightTags = site.highlights
    ? site.highlights.split(",").map(tag => tag.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-gray-50/20 pb-24 font-sans text-[#1e293b]">
      
      {/* Portada Cover Image (Full-Bleed) */}
      <div className="w-full relative h-[400px] md:h-[500px] overflow-hidden">
        {site.imageUrl ? (
          <img 
            src={site.imageUrl} 
            alt={site.name} 
            className="w-full h-full object-cover scale-[1.08]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop";
            }}
          />
        ) : (
          <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #0e011f, #1a0533)" }} />
        )}

        {/* Brand visual gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />

        {/* Centered Title */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-[#00C8D4] text-[10px] md:text-xs font-black tracking-[0.3em] uppercase mb-4 drop-shadow-md">
            EL PARAÍSO TE ESPERA · LUGARES EMBLEMÁTICOS
          </p>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-2xl leading-tight max-w-4xl playfair">
            {site.name}
          </h1>
        </div>
      </div>

      {/* Main Section */}
      <div className="max-w-4xl mx-auto px-6 mt-8 mb-16">
        
        {/* Back navigation and category */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-gray-500 hover:text-[#FF0096] transition-colors cursor-pointer self-start">
            <ArrowLeft className="w-4 h-4" />
            <span>VOLVER AL INICIO</span>
          </Link>
          
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-semibold">
            {destinationName && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#00C8D4]" />
                <span className="text-gray-600 font-bold">{destinationName}</span>
              </span>
            )}
            <span className="opacity-30">•</span>
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#9B00CC]" />
              <span className="bg-purple-50 text-[#9B00CC] border border-purple-100 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                {site.category}
              </span>
            </span>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-lg shadow-gray-200/20 text-left">
          <h2 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight mb-4 playfair">
            Sobre este atractivo natural
          </h2>
          <div className="text-gray-750 text-sm md:text-base leading-relaxed whitespace-pre-line font-medium space-y-4">
            {site.longDescription || site.shortDescription}
          </div>

          {/* Highlights tags */}
          {highlightTags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h4 className="text-xs uppercase font-black text-gray-400 tracking-wider mb-3">
                Características del sitio
              </h4>
              <div className="flex flex-wrap gap-2">
                {highlightTags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-50 border border-gray-150"
                  >
                    <Star className="w-3 h-3 text-[#00C8D4] fill-current" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Hotels (B2C conversion) */}
      {relatedEsts.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-20">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00C8D4]/10 border border-[#00C8D4]/20 text-xs font-black text-[#00C8D4] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SOCIOS RECOMENDADOS HDV</span>
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">Hospedajes Cercanos</h2>
            <p className="text-gray-400 text-xs mt-1">Reserva de forma directa con los mejores hospedajes en {destinationName}.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedEsts.map((est) => (
              <EstablishmentCard key={est.id} establishment={est} />
            ))}
          </div>
        </div>
      )}

      {/* CTA de Cierre - WhatsApp */}
      <div className="max-w-4xl mx-auto px-6 mt-20">
        <div 
          className="rounded-3xl p-8 md:p-10 text-center text-white relative overflow-hidden shadow-xl"
          style={{ background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)" }}
        >
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-black/10 rounded-full blur-2xl" />

          <h3 className="text-xl md:text-2xl font-black mb-3 relative z-10 playfair">
            ¿Quieres visitar {site.name}?
          </h3>
          <p className="text-white/80 text-xs md:text-sm font-medium max-w-lg mx-auto mb-6 relative z-10 leading-relaxed">
            Te asesoramos gratuitamente sobre traslados fluviales/marítimos, peñeros autorizados y las mejores opciones de hospedaje local en {destinationName}.
          </p>
          
          <a 
            href={`https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=Hola,%20quisiera%20informacion%20para%20visitar%20${encodeURIComponent(site.name)}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#FF0096] hover:bg-gray-50 transition-all font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg hover:scale-102 active:scale-98 cursor-pointer relative z-10"
          >
            <MessageSquare className="w-4 h-4 fill-current text-[#FF0096]" />
            <span>Consultar Asesor de Viajes</span>
          </a>
        </div>
      </div>

    </div>
  );
}
