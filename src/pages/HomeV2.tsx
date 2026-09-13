import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { supabase } from "../lib/supabase";
import { ESTABLISHMENTS_MOCK } from "../lib/establishmentsMock";
import { optimizeImageUrl } from "../lib/utils";
import { DESTINOS_MOCK } from "../lib/destinosMock";
import type { Establishment } from "../components/layout/EstablishmentCard";

import { HeroSectionV2 } from "../components/homeV2/HeroSectionV2";
import { BoutiqueEstablishmentCard } from "../components/homeV2/BoutiqueEstablishmentCard";
import { InteractiveDestinationsGallery } from "../components/homeV2/InteractiveDestinationsGallery";
import { AnimatedReviewsSection } from "../components/home/AnimatedReviewsSection";
import { DirectBookingAuthorityBanner } from "../components/homeV2/DirectBookingAuthorityBanner";
import { B2BOwnerBannerV2 } from "../components/homeV2/B2BOwnerBannerV2";
import { SeoHead } from "../components/seo/SeoHead";

import { 
  Sparkles, ArrowRight, Compass, ShieldCheck, Waves, Mountain, Trees, Building2, Flame,
  ChevronRight, BookOpen, Award
} from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  published_at: string;
  reading_time: number;
}

interface TouristSite {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  image_url: string;
  category: string;
  highlights: string;
}

interface Destination {
  id: number;
  slug: string;
  name: string;
  state: string;
  image_url: string | null;
  description: string | null;
  is_featured: boolean;
  status: string;
}

const DEFAULT_BLOGS_MOCK: BlogPost[] = [
  {
    id: 1,
    title: "Morrocoy: Guía definitiva para recorrer sus cayos más hermosos",
    slug: "morrocoy-guia-definitiva-cayos",
    excerpt: "Descubre cómo llegar a Cayo Sombrero, Cayo Muerto y los rincones menos conocidos del Parque Nacional Morrocoy, con recomendaciones para viajar sin intermediarios.",
    featured_image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop",
    published_at: "2026-06-18T10:00:00Z",
    reading_time: 5
  },
  {
    id: 2,
    title: "Canaima y el Salto Ángel: Lo que necesitas saber antes de partir",
    slug: "canaima-salto-angel-guia",
    excerpt: "Todo sobre el equipaje fundamental, el repelente de insectos y cómo reservar posadas y vuelos directos con operadores validados físicamente por nuestro equipo.",
    featured_image: "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=800&auto=format&fit=crop",
    published_at: "2026-06-15T12:00:00Z",
    reading_time: 7
  },
  {
    id: 3,
    title: "Los Roques: ¿Cuál es la mejor época del año para visitarlo?",
    slug: "los-roques-mejor-epoca-del-ano",
    excerpt: "Analizamos los meses con el mar más calmado y las tarifas directas más atractivas de las posadas del archipiélago con el Sello de Verificación Humana.",
    featured_image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop",
    published_at: "2026-06-10T14:30:00Z",
    reading_time: 4
  }
];

const DEFAULT_SITES_MOCK: TouristSite[] = [
  {
    id: 1,
    name: "Cayo Sombrero",
    slug: "cayo-sombrero",
    short_description: "El cayo más emblemático de Morrocoy, famoso por su oleaje suave, palmeras perfectas y aguas de azul turquesa transparente.",
    image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
    category: "Playas",
    highlights: "Snorkel, Restaurantes locales, Palmeras"
  },
  {
    id: 2,
    name: "El Salto Ángel (Kerepakupai Vená)",
    slug: "salto-angel",
    short_description: "La caída de agua más alta del mundo, brotando desde el imponente Auyantepuy en el Parque Nacional Canaima.",
    image_url: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop",
    category: "Cataratas",
    highlights: "Tepuyes, Aventura, Navegación"
  },
  {
    id: 3,
    name: "Cayo de Agua",
    slug: "cayo-de-agua",
    short_description: "Una joya de Los Roques donde dos lenguas de arena blanca se encuentran en medio de aguas turquesas poco profundas.",
    image_url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&fit=crop",
    category: "Cayos",
    highlights: "Paisaje Único, Arena Blanca, Aguas Mansas"
  }
];

const DEFAULT_DESTINOS_MOCK: Destination[] = [
  { id: 1, name: "Los Roques", slug: "los-roques", state: "Dependencias Federales", description: "El archipiélago de coral más exclusivo del Caribe.", image_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500", is_featured: true, status: "approved" },
  { id: 2, name: "Canaima", slug: "canaima", state: "Bolívar", description: "Tierra de tepuyes y la caída de agua más alta del mundo.", image_url: "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=500", is_featured: true, status: "approved" },
  { id: 3, name: "Morrocoy", slug: "morrocoy", state: "Falcón", description: "Cayos de arenas blancas y aguas mansas turquesas.", image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500", is_featured: true, status: "approved" },
  { id: 4, name: "Mérida", slug: "merida", state: "Mérida", description: "Picos nevados y posadas andinas llenas de calidez.", image_url: "https://images.unsplash.com/photo-1548013146-72479768bada?w=500", is_featured: true, status: "approved" },
];

function getCleanedImageUrl(imageUrl: string | null | undefined, title: string): string {
  const defaultImage = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800";
  if (!imageUrl) return defaultImage;
  const isInvalid = imageUrl.startsWith("/") || imageUrl.includes("localhost") || imageUrl.includes("127.0.0.1") || imageUrl.includes("/api/files/");
  if (!isInvalid) return imageUrl;

  const t = title.toLowerCase();
  if (t.includes("salto ángel") || t.includes("salto angel") || t.includes("canaima")) return "https://images.unsplash.com/photo-1548013146-72479768bada?w=800";
  if (t.includes("los roques") || t.includes("roques") || t.includes("cayo de agua")) return "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800";
  if (t.includes("morrocoy") || t.includes("cayo sombrero")) return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800";
  if (t.includes("mérida") || t.includes("merida")) return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800";
  return defaultImage;
}

export function HomeV2({ isMainHome = false }: { isMainHome?: boolean }) {
  const [, setLocation] = useLocation();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>(DEFAULT_DESTINOS_MOCK);
  const [blogs, setBlogs] = useState<BlogPost[]>(DEFAULT_BLOGS_MOCK);
  const [sites, setSites] = useState<TouristSite[]>(DEFAULT_SITES_MOCK);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  const [seoConfig, setSeoConfig] = useState({
    title: "Hoteles de Venezuela | Reservas Directas sin Intermediarios | Guía Turística Oficial",
    description: "Directorio y guía turística oficial de hoteles, posadas boutique, resorts y campamentos en Venezuela. Contacto directo por WhatsApp con los anfitriones y 0% comisiones.",
    keywords: "hoteles venezuela, posadas venezuela, reservas sin intermediarios, turismo venezuela, los roques, canaima, morrocoy, merida, posadas boutique, resorts venezuela, campamentos turismo",
    ogImage: "https://ghgetcznlrilgocwigmj.supabase.co/storage/v1/object/public/establecimientos/destinos/salto-angel-hero-v2.jpg"
  });

  // Concurrent database loading for maximum speed
  useEffect(() => {
    async function loadHomeV2Data() {
      try {
        setLoading(true);
        const [estRes, destRes, sectionRes, blogRes, siteRes, seoRes] = await Promise.all([
          supabase.from("establishments").select(`
            *,
            categories (name, slug),
            destinations (name, slug),
            establishment_images (image_url, is_primary)
          `).eq("status", "approved"),
          supabase.from("destinations").select("id, name, slug, state, image_url, description, is_featured, status"),
          supabase.from("site_sections").select("*").order("id"),
          supabase.from("blog_posts").select("id, title, slug, excerpt, featured_image, published_at, reading_time").order("published_at", { ascending: false }).limit(3),
          supabase.from("tourist_sites").select("id, name, slug, short_description, image_url, category, highlights").order("sort_order").limit(3),
          supabase.from("seo_settings").select("*").in("page_key", ["home-v2", "home"])
        ]);

        if (estRes.data && estRes.data.length > 0) {
          const mapped: Establishment[] = estRes.data.map((item: any) => {
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
              rating_avg: item.rating_avg || 4.8,
              review_count: item.review_count || 12,
              price_level: item.price_level || "$$",
              is_featured: item.is_featured || false,
              services: item.services || "[]",
              membership_tier: item.membership_tier || "basic",
              has_hdv_seal: item.has_hdv_seal || false,
              has_reservations_enabled: item.has_reservations_enabled || false,
              is_ads_enabled: item.is_ads_enabled || false
            };
          });
          setEstablishments(mapped);
        } else {
          setEstablishments(ESTABLISHMENTS_MOCK);
        }

        if (destRes.data && destRes.data.length > 0) {
          setDestinations(destRes.data as Destination[]);
        }
        if (sectionRes.data && sectionRes.data.length > 0) {
          setSections(sectionRes.data);
        }
        if (blogRes.data && blogRes.data.length > 0) {
          setBlogs(blogRes.data as BlogPost[]);
        }
        if (siteRes.data && siteRes.data.length > 0) {
          setSites(siteRes.data as TouristSite[]);
        }
        if (seoRes.data && seoRes.data.length > 0) {
          const match = seoRes.data.find((s: any) => (s.page_key || s.pageKey) === "home-v2") || seoRes.data[0];
          if (match) {
            setSeoConfig(prev => ({
              title: match.page_title || match.pageTitle || prev.title,
              description: match.meta_description || match.metaDescription || prev.description,
              keywords: match.meta_keywords || match.metaKeywords || prev.keywords,
              ogImage: match.og_image || match.ogImage || prev.ogImage
            }));
          }
        }

      } catch (err) {
        console.warn("HomeV2: Usando datos de respaldo para demostración:", err);
        setEstablishments(ESTABLISHMENTS_MOCK);
      } finally {
        setLoading(false);
      }
    }
    loadHomeV2Data();
  }, []);

  // Filter establishments for Tab section
  const filteredEstablishments = React.useMemo(() => {
    if (activeTab === "all") return establishments;
    if (activeTab === "playa") {
      return establishments.filter(est => 
        ["los-roques", "morrocoy", "mochima", "margarita", "coche"].includes(est.destination_slug || "") ||
        est.name.toLowerCase().includes("posada") || est.name.toLowerCase().includes("cayo")
      );
    }
    if (activeTab === "montana") {
      return establishments.filter(est => 
        ["merida", "colonia-tovar", "sanare", "galipan"].includes(est.destination_slug || "") ||
        est.name.toLowerCase().includes("andina") || est.name.toLowerCase().includes("montaña")
      );
    }
    if (activeTab === "selva") {
      return establishments.filter(est => 
        ["canaima", "amazonas"].includes(est.destination_slug || "") ||
        est.name.toLowerCase().includes("campamento") || est.name.toLowerCase().includes("tepuy")
      );
    }
    if (activeTab === "boutique") {
      return establishments.filter(est => est.has_hdv_seal || est.membership_tier === "diamante" || est.rating_avg >= 4.7);
    }
    return establishments;
  }, [establishments, activeTab]);

  // Filter Complexes for Section 1
  const complexes = React.useMemo(() => {
    const list = establishments.filter(e => 
      e.category_slug === "complejos" || 
      e.category_name?.toLowerCase().includes("complejo") ||
      e.category_name?.toLowerCase().includes("resort") ||
      e.name.toLowerCase().includes("resort") ||
      e.name.toLowerCase().includes("complejo") ||
      e.name.toLowerCase().includes("eurobuilding") ||
      e.name.toLowerCase().includes("waku") ||
      e.name.toLowerCase().includes("sabbia")
    );
    return list.length > 0 ? list : establishments;
  }, [establishments]);

  // Prestigio section content from DB or default fallback
  const prestigioSection = React.useMemo(() => {
    const found = sections.find(s => s.section_key === "prestigio" || s.sectionKey === "prestigio");
    return {
      title: found?.title || "Wakü Lodge & Ara Merú",
      subtitle: found?.subtitle || "EL PARAÍSO TE ESPERA",
      description: found?.description || "Una selección exclusiva de hospederías boutique y campamentos de lujo que redefinen la excelencia turística en Venezuela.",
      imageUrl: found?.image_url || found?.imageUrl || "https://images.unsplash.com/photo-1552083375-1447ce886485"
    };
  }, [sections]);

  // Featured destinations mapping
  const featuredDestinations = React.useMemo(() => {
    return (destinations.length > 0 ? destinations : DEFAULT_DESTINOS_MOCK)
      .filter(d => d.is_featured !== false)
      .slice(0, 4)
      .map((d, i) => {
        let img = d.image_url || "";
        if (!img || img.startsWith("/") || img.includes("localhost") || img.includes("127.0.0.1") || img.includes("/api/files/")) {
          const match = DESTINOS_MOCK.find(m => m.slug === d.slug) || DEFAULT_DESTINOS_MOCK.find(m => m.slug === d.slug);
          img = match?.image_url || "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500";
        }
        return {
          name: d.name,
          slug: d.slug,
          desc: d.description || "",
          tag: d.state || "Destino",
          img: img
        };
      });
  }, [destinations]);

  // B2B Programs list
  const programs = [
    {
      name: "Prestigio 2026",
      url: "/prestigio-2026",
      description: "Postula tu hospedaje al sello de calidad más prestigioso del turismo en Venezuela.",
      gradient: "from-[#FF0096] to-[#9B00CC]",
      shadow: "shadow-[#FF0096]/25",
      icon: Award
    },
    {
      name: "50 Fundadores",
      url: "/50-fundadores",
      description: "Asegura tu posición VIP y forma parte del selecto club de hoteles fundadores del portal.",
      gradient: "from-[#00C8D4] to-[#008ba3]",
      shadow: "shadow-[#00C8D4]/25",
      icon: ShieldCheck
    },
    {
      name: "Alianzas para Agencias",
      url: "/alianzas-para-agencias",
      description: "Conecta tu agencia de viajes con la red de hospedajes más grande de Venezuela y obtén beneficios.",
      gradient: "from-[#9B00CC] to-[#4f46e5]",
      shadow: "shadow-[#9B00CC]/25",
      icon: Compass
    }
  ];

  // Complete JSON-LD structured data array for Google & Search Engine Dominance
  const jsonLdSchemas = React.useMemo(() => {
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Hoteles de Venezuela LLC",
      "altName": "Hoteles de Venezuela",
      "url": "https://hotelesdevenezuela.com",
      "logo": "https://hotelesdevenezuela.com/logo.png",
      "description": "Directorio oficial y guía turística de hospedajes verificados en Venezuela. Reservas directas sin intermediarios ni comisiones.",
      "foundingLocation": {
        "@type": "Place",
        "name": "Caracas, Venezuela"
      },
      "sameAs": [
        "https://instagram.com/hotelesdevenezuela",
        "https://facebook.com/hotelesdevenezuela"
      ]
    };

    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Hoteles de Venezuela",
      "url": "https://hotelesdevenezuela.com/",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://hotelesdevenezuela.com/establecimientos?destination={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    };

    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Posadas y Hoteles Destacados en Venezuela",
      "description": "Catálogo auditado de posadas boutique, resorts y hospedajes de selección en Venezuela con contacto directo por WhatsApp.",
      "itemListElement": (establishments.length > 0 ? establishments.slice(0, 6) : ESTABLISHMENTS_MOCK.slice(0, 6)).map((item, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "item": {
          "@type": "Hotel",
          "name": item.name,
          "description": item.description,
          "url": `https://hotelesdevenezuela.com/establecimiento/${item.slug}`,
          "image": item.primary_image || "https://images.unsplash.com/photo-1540555700478-4be289fbecef",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": item.destination_name || "Venezuela",
            "addressCountry": "VE"
          },
          "starRating": {
            "@type": "Rating",
            "ratingValue": item.rating_avg || 4.8
          }
        }
      }))
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "¿Cómo funciona la reserva sin intermediarios en Hoteles de Venezuela?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Hoteles de Venezuela te conecta directamente con el dueño o gerente del hospedaje a través de WhatsApp oficial. No cobramos comisiones de servicio ni recargos por reserva, garantizando la mejor tarifa directa."
          }
        },
        {
          "@type": "Question",
          "name": "¿Qué es el Sello de Verificación e Inspección HDV?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Es una acreditación que certifica que nuestro staff ha visitado presencialmente el hotel o posada, verificando su operatividad, limpieza, planta eléctrica de respaldo y conectividad Starlink."
          }
        },
        {
          "@type": "Question",
          "name": "¿Cuáles son las mejores opciones de alojamiento en Los Roques y Canaima?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "En Los Roques destacan posadas boutique con servicio todo incluido como Posada Galápagos o Macanao Lodge. En Canaima, campamentos de lujo como Wakü Lodge y Ara Merú frente a la laguna de Canaima."
          }
        }
      ]
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Inicio",
          "item": "https://hotelesdevenezuela.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Directorio de Hospedajes V2",
          "item": "https://hotelesdevenezuela.com/home-v2"
        }
      ]
    };

    return [orgSchema, websiteSchema, itemListSchema, faqSchema, breadcrumbSchema];
  }, [establishments]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#00C8D4] selection:text-slate-950">
      
      {/* Dynamic SEO Head with Open Graph & JSON-LD Structured Data */}
      <SeoHead
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        ogImage={seoConfig.ogImage}
        canonicalUrl={isMainHome ? "https://hotelesdevenezuela.com/" : "https://hotelesdevenezuela.com/home-v2"}
        schemas={jsonLdSchemas}
      />

      {/* 1. Hero Section & Buscador Modular (Sección A) */}
      <HeroSectionV2 />

      {/* 2. Sección de Tarjetas Rediseñadas / Listing Cards (Sección B) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        
        {/* Encabezado y Categorías de Filtro */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/20 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SELECCIÓN EXCLUSIVA DE HOSPEDAJES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
              Posadas y Hoteles <span className="text-gradient-brand">Destacados</span>
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl font-medium">
              Fotografía real, servicios operativos verificados y contacto directo por WhatsApp con los anfitriones.
            </p>
          </div>

          {/* Selector de Pestañas de Filtros Rápidos */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-200/60 p-1.5 rounded-2xl border border-slate-200">
            {[
              { id: "all", label: "Todos", icon: Flame, solidBg: "#FF0096" },
              { id: "playa", label: "Playa & Cayos", icon: Waves, solidBg: "#00C8D4" },
              { id: "montana", label: "Montaña & Frío", icon: Mountain, solidBg: "#10b981" },
              { id: "selva", label: "Canaima & Selva", icon: Trees, solidBg: "#f59e0b" },
              { id: "boutique", label: "Sello HDV", icon: ShieldCheck, solidBg: "#9B00CC" }
            ].map(tab => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-slate-900 shadow-md scale-[1.02]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <div 
                    className="w-4 h-4 rounded-md flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: tab.solidBg }}
                  >
                    <IconComp className="w-2.5 h-2.5 text-white stroke-[2.5]" />
                  </div>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid de Tarjetas Luxe (Sección B) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-3xl h-[420px] animate-pulse border border-slate-200 p-4 space-y-4">
                <div className="w-full h-48 bg-slate-200 rounded-2xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-10 bg-slate-200 rounded-xl mt-6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEstablishments.slice(0, 9).map(est => (
              <BoutiqueEstablishmentCard key={est.id} establishment={est} />
            ))}
          </div>
        )}

        {/* CTA Ver Catálogo Completo */}
        <div className="pt-6 text-center">
          <Link
            href="/establecimientos"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider shadow-xl hover:scale-105 transition-all cursor-pointer"
          >
            <span>Ver Todos los Alojamientos (+500)</span>
            <ArrowRight className="w-4 h-4 text-[#00C8D4]" />
          </Link>
        </div>

      </section>

      {/* 3. Sección de Experiencias Reales de Viajeros (Lo que Dicen Nuestros Turistas) */}
      <AnimatedReviewsSection />

      {/* 4. Sección de Destinos / Exploración Interactiva (Sección C) */}
      <InteractiveDestinationsGallery />

      {/* 5. Banner de Autoridad y Trato Directo (Sección E) */}
      <DirectBookingAuthorityBanner />

      {/* ========================================================================= */}
      {/* SECCIONES ADICIONALES SOLICITADAS DE HOME 1 INSERTADAS A CONTINUACIÓN   */}
      {/* ========================================================================= */}

      {/* 6. RESORTS & MULTIACTIVIDAD: COMPLEJOS TURÍSTICOS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF0096]/10 text-[#FF0096] border border-[#FF0096]/20 text-xs font-black uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>Resorts & Multiactividad</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
              Complejos <span className="text-gradient-brand">Turísticos</span>
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl font-medium">
              Instalaciones integrales con parque acuático, marina, múltiples restaurantes y actividades recreativas en un solo lugar.
            </p>
          </div>
          <Link
            href="/establecimientos?category=complejos"
            className="text-xs font-black uppercase tracking-wider text-[#FF0096] hover:text-[#9B00CC] flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <span>Ver todos los complejos</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {complexes.slice(0, 3).map(complex => (
            <BoutiqueEstablishmentCard key={complex.id} establishment={complex} />
          ))}
        </div>
      </section>

      {/* 7. CAMPAÑA PRESTIGIO 2026: EL PARAÍSO TE ESPERA (Wakü Lodge & Ara Merú) */}
      <section className="relative w-full h-[520px] flex items-center justify-center overflow-hidden my-6">
        <img
          src={optimizeImageUrl(prestigioSection.imageUrl, 1200)}
          alt={prestigioSection.title}
          className="absolute inset-0 w-full h-full object-cover scale-[1.08] transition-transform duration-[1500ms] hover:scale-110 pointer-events-none z-0 filter brightness-95"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/40 to-slate-950/80 z-10" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-slate-50 via-slate-50/60 to-transparent z-15 pointer-events-none" />

        <div className="relative z-20 max-w-4xl mx-auto px-6 text-center text-white flex flex-col items-center justify-center h-full space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/25 text-[#00C8D4] text-xs font-black tracking-[0.25em] uppercase shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#00C8D4]" />
            <span>{prestigioSection.subtitle}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white leading-tight tracking-tight drop-shadow-lg">
            {prestigioSection.title}
          </h2>

          <p className="text-slate-200 text-xs sm:text-base max-w-xl mx-auto leading-relaxed font-semibold drop-shadow-md">
            {prestigioSection.description}
          </p>

          <Link href="/prestigio-2026">
            <button className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-[#FF0096] font-black text-xs uppercase tracking-wider shadow-2xl hover:scale-105 transition-all cursor-pointer flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF0096]" />
              <span>Explorar Colección Prestigio</span>
            </button>
          </Link>
        </div>
      </section>

      {/* 8. DESTINOS POPULARES: DESTINOS DE ENSUEÑO (Inspiración para tu Próximo Viaje) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/20 text-xs font-black uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Destinos de Ensueño</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
              Inspiración para tu <span className="text-gradient-brand">Próximo Viaje</span>
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl font-medium">
              Explora los archipiélagos, parques nacionales y valles andinos preferidos por los viajeros este año.
            </p>
          </div>
          <Link
            href="/destinos"
            className="text-xs font-black uppercase tracking-wider text-[#00C8D4] hover:text-[#FF0096] flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <span>Ver todos los destinos</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDestinations.map((dest, i) => (
            <Link
              key={i}
              href={`/destinos/${dest.slug}`}
              className="group rounded-3xl p-6 flex flex-col justify-between h-72 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer relative overflow-hidden block shadow-lg border border-slate-200/50"
            >
              <img
                src={optimizeImageUrl(dest.img, 500)}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none z-0"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/20 z-10" />
              
              <div className="relative z-20 text-left">
                <span className="px-3 py-1 rounded-xl bg-white/20 backdrop-blur-md border border-white/25 text-white text-[10px] font-black uppercase tracking-wider">
                  {dest.tag}
                </span>
                <h3 className="text-xl font-extrabold text-white mt-4 group-hover:text-[#00C8D4] transition-colors">{dest.name}</h3>
                <p className="text-slate-200 text-xs leading-relaxed mt-1.5 line-clamp-2 font-medium">{dest.desc}</p>
              </div>
              <div className="flex justify-between items-center mt-4 relative z-20">
                <span className="text-[10px] text-[#00C8D4] font-black uppercase tracking-widest">Explorar Destino</span>
                <span className="w-7 h-7 rounded-xl bg-white/20 text-white group-hover:bg-[#00C8D4] group-hover:text-slate-950 flex items-center justify-center text-xs font-black transition-all">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="py-20 bg-slate-100/70 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#9B00CC]/10 text-[#9B00CC] border border-[#9B00CC]/20 text-xs font-black uppercase tracking-wider">
                <Mountain className="w-3.5 h-3.5" />
                <span>LUGARES EMBLEMÁTICOS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
                Sitios Turísticos <span className="text-gradient-brand">Recomendados</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm max-w-xl font-medium">
                Un recorrido por los mejores destinos turísticos de nuestro hermoso país, auditados y documentados físicamente por nuestro equipo.
              </p>
            </div>
            <Link
              href="/sitios-turisticos"
              className="text-xs font-black uppercase tracking-wider text-[#9B00CC] hover:text-[#FF0096] flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              <span>Ver todos los sitios turísticos</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site) => (
              <article key={site.id} className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-slate-200/80 text-left flex flex-col justify-between h-full">
                <div>
                  <Link href={`/sitio/${site.slug}`}>
                    <div className="h-48 overflow-hidden relative cursor-pointer">
                      <img 
                        src={optimizeImageUrl(getCleanedImageUrl(site.image_url, site.name), 600)} 
                        alt={site.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600";
                        }}
                      />
                      <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-slate-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl shadow-xs">
                        {site.category}
                      </span>
                    </div>
                  </Link>
                  <div className="p-6">
                    <Link href={`/sitio/${site.slug}`}>
                      <h3 className="font-extrabold text-lg text-slate-900 mb-2 hover:text-[#FF0096] transition-colors cursor-pointer leading-snug">
                        {site.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-600 font-medium line-clamp-3 leading-relaxed">
                      {site.short_description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {(site.highlights || "").split(",").filter(Boolean).slice(0, 3).map((hl, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-[10px] text-slate-600 rounded-xl font-bold">
                        {hl.trim()}
                      </span>
                    ))}
                  </div>
                  <Link href={`/sitio/${site.slug}`}>
                    <button className="w-full bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-95 text-white font-black py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF0096]/20 hover:scale-[1.02] transition-all uppercase tracking-wider">
                      <span>Ver Sitio Turístico</span>
                      <span className="text-sm">→</span>
                    </button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 10. DESCUBRE VENEZUELA: TIPS DE VIAJE & REPORTAJES (Consejos de Turismo & Guías) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/20 text-xs font-black uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>TIPS DE VIAJE & REPORTAJES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
              Consejos de Turismo & <span className="text-gradient-brand">Guías</span>
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl font-medium">
              Reportajes redactados por nuestro equipo sobre playas secretas, equipaje para Canaima y gastronomía regional.
            </p>
          </div>
          <Link
            href="/blog"
            className="text-xs font-black uppercase tracking-wider text-[#00C8D4] hover:text-[#FF0096] flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <span>Ver todos los reportajes</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <article key={blog.id} className="group flex flex-col justify-between bg-white border border-slate-200/80 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full text-left">
              <div>
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={optimizeImageUrl(getCleanedImageUrl(blog.featured_image, blog.title), 600)} 
                    alt={blog.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600";
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-[#00C8D4] text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-xl shadow-xs">
                    {blog.reading_time} Min de lectura
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-extrabold text-base text-slate-900 line-clamp-2 leading-snug group-hover:text-[#FF0096] transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed font-medium">
                    {blog.excerpt}
                  </p>
                </div>
              </div>
              <div className="p-6 pt-0">
                <Link href={`/blog/${blog.slug}`}>
                  <span className="text-xs font-extrabold text-[#FF0096] hover:underline flex items-center gap-1 cursor-pointer">
                    Leer reportaje completo →
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 11. PROGRAMAS Y ALIANZAS: PROGRAMAS Y OPORTUNIDADES */}
      <section className="py-20 bg-slate-100/70 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF0096]/10 text-[#FF0096] border border-[#FF0096]/20 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PROGRAMAS Y ALIANZAS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
              Programas y <span className="text-gradient-brand">Oportunidades</span>
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
              Únete a nuestras iniciativas oficiales para potenciar tu hospedaje, captar clientes y forjar alianzas de valor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((site) => {
              const IconComponent = site.icon;
              return (
                <Link
                  key={site.name}
                  href={site.url}
                  className={`group bg-gradient-to-br ${site.gradient} rounded-3xl p-7 hover:-translate-y-1.5 hover:shadow-2xl ${site.shadow} transition-all duration-300 relative overflow-hidden text-left block border border-white/20`}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-md">
                      <IconComponent className="w-6 h-6 text-white stroke-[2.5]" />
                    </div>
                    <ChevronRight className="w-6 h-6 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-extrabold text-lg text-white mb-2 drop-shadow-xs">
                    {site.name}
                  </h3>
                  <p className="text-xs text-white/95 font-medium leading-relaxed">{site.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 12. Optimización B2B - Propietarios (Sección F) */}
      <B2BOwnerBannerV2 />

    </div>
  );
}
