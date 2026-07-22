import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { supabase } from "../lib/supabase";
import { ESTABLISHMENTS_MOCK } from "../lib/establishmentsMock";
import { DESTINOS_MOCK } from "../lib/destinosMock";
import { EstablishmentCard } from "../components/layout/EstablishmentCard";
import type { Establishment } from "../components/layout/EstablishmentCard";
import { AnimatedReviewsSection } from "../components/home/AnimatedReviewsSection";
import { 
  Search, 
  MapPin, 
  Compass, 
  ShieldCheck, 
  Award, 
  Globe, 
  ExternalLink, 
  Play, 
  BookOpen, 
  Mountain, 
  Sparkles, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Eye,
  HeartHandshake,
  MessageSquare,
  Waves,
  Utensils
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

const DEFAULT_BLOGS_MOCK = [
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

const DEFAULT_SITES_MOCK = [
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

const DEFAULT_DESTINOS_MOCK: Destination[] = [
  { id: 1, name: "Los Roques", slug: "los-roques", state: "Dependencias Federales", description: "El archipiélago de coral más exclusivo del Caribe.", image_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500", is_featured: true, status: "approved" },
  { id: 2, name: "Canaima", slug: "canaima", state: "Bolívar", description: "Tierra de tepuyes y la caída de agua más alta del mundo.", image_url: "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=500", is_featured: true, status: "approved" },
  { id: 3, name: "Morrocoy", slug: "morrocoy", state: "Falcón", description: "Cayos de arenas blancas y aguas mansas turquesas.", image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500", is_featured: true, status: "approved" },
  { id: 4, name: "Mérida", slug: "merida", state: "Mérida", description: "Picos nevados y posadas andinas llenas de calidez.", image_url: "https://images.unsplash.com/photo-1548013146-72479768bada?w=500", is_featured: true, status: "approved" },
];

function getEmbedUrl(url: string): string {
  if (!url) return "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1";
  if (url.includes("/embed/")) return url;
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}?rel=0&modestbranding=1`;
  }
  return url;
}

function getCleanedImageUrl(imageUrl: string | null | undefined, title: string): string {
  const defaultImage = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800";
  if (!imageUrl) return defaultImage;
  
  const isInvalid = imageUrl.startsWith("/") || 
                    imageUrl.includes("localhost") || 
                    imageUrl.includes("127.0.0.1") || 
                    imageUrl.includes("/api/files/");
                    
  if (!isInvalid) return imageUrl;

  const t = title.toLowerCase();
  
  if (t.includes("salto ángel") || t.includes("salto angel") || t.includes("canaima") || t.includes("auyantepuy") || t.includes("kerepakupai")) {
    return "https://images.unsplash.com/photo-1548013146-72479768bada?w=800";
  }
  if (t.includes("los roques") || t.includes("roques") || t.includes("cayo de agua") || t.includes("archipiélago")) {
    return "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800";
  }
  if (t.includes("morrocoy") || t.includes("cayo sombrero") || t.includes("sombrero") || t.includes("tucacas") || t.includes("chichiriviche")) {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800";
  }
  if (t.includes("mérida") || t.includes("merida") || t.includes("picos") || t.includes("andes") || t.includes("teleférico") || t.includes("teleferico")) {
    return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800";
  }
  if (t.includes("médanos") || t.includes("medanos") || t.includes("coro") || t.includes("desierto")) {
    return "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800";
  }
  if (t.includes("llanos") || t.includes("apure") || t.includes("hato")) {
    return "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800";
  }
  if (t.includes("catatumbo") || t.includes("relámpago") || t.includes("relampago") || t.includes("rayo")) {
    return "https://images.unsplash.com/photo-1461088945293-0c17689e48ac?w=800";
  }
  if (t.includes("gastronomía") || t.includes("platos") || t.includes("comida") || t.includes("receta") || t.includes("probar")) {
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";
  }
  if (t.includes("margarita") || t.includes("sabbia") || t.includes("pampatar")) {
    return "https://images.unsplash.com/photo-1589979482837-e74f2e145060?w=800";
  }
  if (t.includes("glamping") || t.includes("lujo silvestre")) {
    return "https://images.unsplash.com/photo-1533577116850-9ac66abc8f98?w=800";
  }
  if (t.includes("nómadas") || t.includes("coworking") || t.includes("hub")) {
    return "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800";
  }
  if (t.includes("peaje") || t.includes("raya") || t.includes("ruta") || t.includes("seguridad") || t.includes("viajero")) {
    return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800";
  }
  if (t.includes("sostenible") || t.includes("ecoturismo") || t.includes("naturaleza") || t.includes("aviturismo")) {
    return "https://images.unsplash.com/photo-1511497584788-876760111969?w=800";
  }
  
  return defaultImage;
}

export function Home() {
  const [, setLocation] = useLocation();
  const [searchCategory, setSearchCategory] = useState("");
  const [searchDestination, setSearchDestination] = useState("");
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [locationSearchInput, setLocationSearchInput] = useState("");

  const handleSelectDestination = (slug: string, name: string) => {
    setSearchDestination(slug);
    setLocationSearchInput(name);
    setIsLocationDropdownOpen(false);
  };

  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>(DEFAULT_DESTINOS_MOCK);
  const [comparedIds, setComparedIds] = useState<number[]>([]);

  // Load compared hotels on mount
  useEffect(() => {
    document.title = "Hoteles de Venezuela | Reservas sin Intermediarios | Guía Turística";
    const stored = localStorage.getItem("hdv_compare_list");
    if (stored) setComparedIds(JSON.parse(stored));
  }, []);

  // Sync compare list across events
  useEffect(() => {
    const handleSync = () => {
      const stored = localStorage.getItem("hdv_compare_list");
      if (stored) setComparedIds(JSON.parse(stored));
    };
    window.addEventListener("hdv_compare_updated", handleSync);
    return () => window.removeEventListener("hdv_compare_updated", handleSync);
  }, []);

  const handleCompareToggle = (id: number) => {
    setComparedIds(prev => {
      let next;
      if (prev.includes(id)) {
        next = prev.filter(item => item !== id);
      } else {
        if (prev.length >= 3) {
          alert("Puedes comparar hasta un máximo de 3 establecimientos simultáneamente.");
          return prev;
        }
        next = [...prev, id];
      }
      localStorage.setItem("hdv_compare_list", JSON.stringify(next));
      window.dispatchEvent(new Event("hdv_compare_updated"));
      return next;
    });
  };

  const filteredDestinations = destinations.filter(d => 
    d.name.toLowerCase().includes(locationSearchInput.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest(".location-dropdown-container")) {
        setIsLocationDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const [blogs, setBlogs] = useState<BlogPost[]>(DEFAULT_BLOGS_MOCK);
  const [sites, setSites] = useState<TouristSite[]>(DEFAULT_SITES_MOCK);
  const [sections, setSections] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>(() => {
    try {
      const localCats = JSON.parse(localStorage.getItem("hdv_mock_categories") || "[]");
      if (localCats && localCats.length > 0) return localCats;
    } catch (e) {}
    return [
      { id: 1, name: "Hoteles", slug: "hoteles" },
      { id: 2, name: "Posadas", slug: "posadas" },
      { id: 3, name: "Restaurantes", slug: "restaurantes" },
      { id: 4, name: "Parques Nacionales", slug: "parques" },
      { id: 5, name: "Complejos Turísticos", slug: "complejos" }
    ];
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        // Consultas concurrentes en paralelo para velocidad óptima (UX instantánea)
        const [estRes, destRes, sectionRes, blogRes, siteRes, catsRes] = await Promise.all([
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
          supabase.from("categories").select("id, name, slug").order("name")
        ]);

        if (estRes.data) {
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
              rating_avg: item.rating_avg || 0,
              review_count: item.review_count || 0,
              price_level: item.price_level || "",
              is_featured: item.is_featured || false,
              services: item.services || "[]",
              membership_tier: item.membership_tier || "basic",
              has_hdv_seal: item.has_hdv_seal || false,
              homepage_priority: item.homepage_priority
            };
          });
          setEstablishments(mapped);
        }

        if (destRes.data && destRes.data.length > 0) {
          setDestinations(destRes.data as Destination[]);
        }

        if (sectionRes.data && sectionRes.data.length > 0) {
          const BARCOS_IMAGE_URL = "https://images.unsplash.com/photo-1540555700478-4be289fbecef";
          const seen = new Set();
          const result: any[] = [];

          sectionRes.data.forEach((item: any) => {
            const k = item.section_key || item.sectionKey;
            const img = item.image_url || item.imageUrl;

            if (img && img.includes(BARCOS_IMAGE_URL)) return;

            if (k && !seen.has(k)) {
              seen.add(k);
              result.push({
                sectionKey: k,
                title: item.title,
                subtitle: item.subtitle,
                description: item.description,
                imageUrl: img,
                buttonText: item.button_text || item.buttonText,
                buttonUrl: item.button_url || item.buttonUrl,
                isActive: item.is_active ?? item.isActive ?? true
              });
            }
          });
          setSections(result);
        }

        if (blogRes.data && blogRes.data.length > 0) {
          setBlogs(blogRes.data as BlogPost[]);
        }

        if (siteRes.data && siteRes.data.length > 0) {
          setSites(siteRes.data as TouristSite[]);
        }

        if (catsRes.data && catsRes.data.length > 0) {
          setCategories(catsRes.data);
        }
      } catch (err) {
        console.warn("Error consultando base de datos en segundo plano:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  // ... (El resto de la lógica de renderizado se mantiene intacta)
  const dbHoteles = establishments.filter(e => 
    e.category_slug === "hoteles" || 
    e.category_name?.toLowerCase().includes("hotel")
  );
  const dbPosadas = establishments.filter(e => 
    e.category_slug === "posadas" || 
    e.category_name?.toLowerCase().includes("posada")
  );
  const dbComplexes = establishments.filter(e => 
    e.category_slug === "complejos" || 
    e.category_name?.toLowerCase().includes("complejo") || 
    e.category_name?.toLowerCase().includes("resort")
  );

  const getCategorizedItems = (dbItems: Establishment[]) => {
    if (!dbItems || dbItems.length === 0) return [];

    const prioritized = dbItems.filter(e => e.homepage_priority !== null && e.homepage_priority !== undefined && e.homepage_priority >= 1);
    
    if (prioritized.length > 0) {
      const slots = new Array<Establishment | null>(6).fill(null);
      prioritized.forEach(item => {
        const pos = item.homepage_priority;
        if (pos && pos >= 1 && pos <= 6) {
          slots[pos - 1] = item;
        }
      });
      const filledSlots = slots.filter((item): item is Establishment => item !== null);
      if (filledSlots.length > 0) return filledSlots;
    }

    return dbItems.slice(0, 6);
  };

  const hotels = getCategorizedItems(dbHoteles);
  const posadas = getCategorizedItems(dbPosadas);
  const complexes = getCategorizedItems(dbComplexes);

  const featuredDestinations = (destinations.length > 0 ? destinations : DEFAULT_DESTINOS_MOCK)
    .filter(d => d.is_featured !== false)
    .slice(0, 4)
    .map((d, i) => {
      const colors = [
        "from-cyan-500/20 to-blue-600/5",
        "from-emerald-500/20 to-teal-600/5",
        "from-pink-500/20 to-rose-600/5",
        "from-amber-500/20 to-orange-600/5"
      ];
      
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
        color: colors[i % colors.length],
        img: img
      };
    });

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCategory) params.set("category", searchCategory);
    if (searchDestination) params.set("destination", searchDestination);
    setLocation(`/establecimientos?${params.toString()}`);
  };

  const heroSection = sections.find(s => s.sectionKey === "HERO_BANNER" || s.sectionKey === "hero") || {
    title: "Hoteles de Venezuela",
    subtitle: "Reserva Sin Intermediarios Simplemente Maravilloso!",
    description: "Tu guía de alojamiento premium en Venezuela.",
    buttonText: "Buscar",
    buttonUrl: "",
    imageUrl: "",
    isActive: true
  };
  const aboutSection = sections.find(s => s.sectionKey === "about") || {
    title: "Ecosistema Hoteles de Venezuela",
    subtitle: "RED DE SITIOS OFICIAL",
    description: "Nuestra red de portales conecta a miles de turistas cada día directamente con los hoteleros locales.",
    isActive: true
  };
  const featuresSection = sections.find(s => s.sectionKey === "features") || {
    title: "Ventajas / ¿Qué hacemos?",
    subtitle: "VENTAJAS",
    description: "Promovemos el turismo real verificado sin comisiones.",
    isActive: true
  };
  const videoSection = sections.find(s => s.sectionKey === "video" || s.sectionKey === "youtube_video") || {
    title: "El valor del turismo real verificado",
    subtitle: "NUESTRO VIDEO PRESENTACIÓN",
    description: "Descubre en este video cómo nuestro equipo de auditoría recorre cada rincón de Venezuela para validar la hospitalidad nacional, sin intermediarios.",
    buttonUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1",
    isActive: true
  };
  const ctaSection = sections.find(s => s.sectionKey === "cta") || {
    title: "¿Eres propietario de un Hotel o Posada en Venezuela?",
    description: "Únete a la guía más prestigiosa del país. Publica tu negocio, recibe contactos directos de viajeros por WhatsApp y gestiona tus servicios a través del panel Andromeda.",
    buttonText: "Registrar mi negocio",
    buttonUrl: "/mis-negocios",
    isActive: true
  };

  // Determinar el fondo de forma reactiva y limpia para evitar el parpadeo del banner (flicker)
  const overlay = "linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.6))";
  const isValidLandscapeImage = (url: string) => {
    if (!url || typeof url !== "string") return false;
    const lower = url.toLowerCase();
    if (lower.includes("logo") || lower.includes("brand") || lower.includes("icon") || lower.includes("avatar") || lower.includes("hv_") || lower.includes("svg")) {
      return false;
    }
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const heroStyle = (() => {
    // Si hay una imagen landscape cargada de la base de datos (personalizada), la mostramos con el overlay oscuro
    if (!loading && isValidLandscapeImage(heroSection.imageUrl)) {
      return {
        backgroundImage: `${overlay}, url(${heroSection.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      };
    }
    // Por defecto (cargando o si no hay imagen personalizada), usamos el degradado morado de membresías
    return {
      background: "linear-gradient(135deg, #0e0120 0%, #1a0533 60%, #0d1a2e 100%)"
    };
  })();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      {/* 1. HERO BANNER PRINCIPAL */}
      <section 
        className="relative pt-24 pb-28 md:pt-32 md:pb-36 px-4 hero-banner-bg flex flex-col items-center justify-center text-center overflow-hidden"
        style={heroStyle}
      >
        {/* Bottom white fade overlay to blend with the white page background */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none z-10" />

        {/* Glow Spots (sólo visibles cuando se usa el degradado morado de fondo) */}
        {(!heroSection.imageUrl || loading) && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-25" style={{ background: "#FF0096" }} />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: "#00C8D4" }} />
          </div>
        )}
        <div className="max-w-5xl mx-auto relative z-10 w-full">
          
          <h1 className="text-4xl sm:text-7xl font-extrabold text-white leading-tight tracking-tight mb-4 font-sans">
            {heroSection.title.includes("Venezuela") ? (
              <>
                {heroSection.title.split("Venezuela")[0]}
                <span className="bg-gradient-to-r from-brand-magenta to-brand-turquesa bg-clip-text text-transparent">Venezuela</span>
                {heroSection.title.split("Venezuela")[1]}
              </>
            ) : heroSection.title}
          </h1>

          <p className="text-white text-base sm:text-xl font-medium tracking-wide mb-10 opacity-95">
            {heroSection.subtitle}
          </p>

          <form onSubmit={handleSearchSubmit} className="bg-white rounded-3xl sm:rounded-full p-3 shadow-2xl max-w-4xl mx-auto flex flex-col sm:flex-row gap-2 items-center animate-search-glow">
            
            <div className="w-full sm:w-1/2 flex items-center gap-2.5 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-100">
              <Search className="text-brand-magenta w-5 h-5 shrink-0" />
              <div className="text-left w-full">
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">¿Qué buscas?</label>
                <select 
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-gray-700 outline-none w-full cursor-pointer appearance-none"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="w-full sm:w-1/2 flex items-center gap-2.5 px-4 py-3 relative location-dropdown-container">
              <MapPin className="text-brand-turquesa w-5 h-5 shrink-0" />
              <div className="text-left w-full relative">
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">¿Dónde?</label>
                <div className="flex items-center justify-between w-full">
                  <input 
                    type="text"
                    placeholder="Elige un destino (ej. Los Roques)"
                    value={locationSearchInput}
                    onChange={(e) => {
                      setLocationSearchInput(e.target.value);
                      setIsLocationDropdownOpen(true);
                      const match = destinations.find(d => d.name.toLowerCase() === e.target.value.toLowerCase());
                      if (match) {
                        setSearchDestination(match.slug);
                      } else {
                        setSearchDestination(e.target.value);
                      }
                    }}
                    onFocus={() => setIsLocationDropdownOpen(true)}
                    className="bg-transparent text-sm font-semibold text-gray-700 outline-none w-full placeholder-gray-400 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLocationDropdownOpen(!isLocationDropdownOpen);
                    }}
                    className="text-gray-450 hover:text-gray-650 cursor-pointer px-1 focus:outline-none flex items-center"
                  >
                    {isLocationDropdownOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>

                {isLocationDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 max-h-60 overflow-y-auto select-none scrollbar-thin">
                    <button
                      type="button"
                      onClick={() => handleSelectDestination("", "")}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-left hover:bg-gray-50 text-gray-500 transition-colors border-b border-gray-50"
                    >
                      <MapPin className="text-brand-turquesa w-4 h-4 shrink-0" />
                      <span>Cualquier ubicación</span>
                    </button>

                    {filteredDestinations.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-gray-400 text-center font-semibold">
                        No se encontraron destinos
                      </div>
                    ) : (
                      filteredDestinations.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => handleSelectDestination(d.slug, d.name)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-left transition-colors hover:bg-gray-50 ${
                            searchDestination === d.slug ? "text-brand-magenta bg-magenta-50/5" : "text-gray-700"
                          }`}
                        >
                          <MapPin className="text-brand-turquesa w-4 h-4 shrink-0" />
                          <div className="flex flex-col">
                            <span>{d.name}</span>
                            {d.state && (
                              <span className="text-[9px] text-gray-400 font-normal">{d.state}</span>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <button type="submit" className="btn-cyan-gradient w-full sm:w-auto flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-2xl sm:rounded-full hover:scale-102 active:scale-98 transition-all shrink-0 cursor-pointer shadow-md shadow-brand-turquesa/10">
              <Search className="w-4 h-4" />
              <span>{heroSection.buttonText || "Buscar"}</span>
            </button>
          </form>

          <div className="flex justify-center gap-12 mt-12 text-white">
            <div className="text-center">
              <p className="text-4xl font-extrabold tracking-tight">24</p>
              <p className="text-xs uppercase font-bold tracking-wider text-white/70 mt-1">Estados</p>
            </div>
            <div className="border-r border-white/20 h-10 my-auto"></div>
            <div className="text-center">
              <p className="text-4xl font-extrabold tracking-tight">50K+</p>
              <p className="text-xs uppercase font-bold tracking-wider text-white/70 mt-1">Viajeros</p>
            </div>
          </div>

        </div>
      </section>

      {/* 1.5. SELLOS DE GARANTÍA Y CONFIANZA (TRUST BADGES) */}
      <div className="bg-white border-y border-gray-100 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          <div className="flex items-center gap-4 px-4 py-2">
            <div className="w-11 h-11 rounded-full bg-[#00C8D4] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#00C8D4]/10">
              <Eye className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">100% Auditados en Persona</h4>
              <p className="text-[10px] text-gray-400 font-bold mt-0.5 leading-snug">Cada establecimiento ha sido visitado y verificado físicamente por nuestro staff.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-4 py-2 border-t md:border-t-0 md:border-x border-gray-100">
            <div className="w-11 h-11 rounded-full bg-[#FF0096] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#FF0096]/10">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Reserva Sin Intermediarios</h4>
              <p className="text-[10px] text-gray-400 font-bold mt-0.5 leading-snug">Comisión cero. Trato directo con el propietario del hotel o posada para el mejor precio.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-4 py-2 border-t md:border-t-0 border-gray-100">
            <div className="w-11 h-11 rounded-full bg-[#9B00CC] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#9B00CC]/10">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Atención Directa y Segura</h4>
              <p className="text-[10px] text-gray-400 font-bold mt-0.5 leading-snug">Contacto instantáneo por WhatsApp con agentes locales para resolver dudas.</p>
            </div>
          </div>

        </div>
      </div>

      {/* 1.8. ACCESO RÁPIDO POR ESTILOS DE VIAJE / EXPERIENCIAS */}
      <section className="py-16 px-4 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-brand-magenta text-xs font-black uppercase tracking-widest block mb-2">Encuentra tu Inspiración</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-800">Estilos de Viaje & Experiencias</h2>
            <p className="text-gray-400 text-xs mt-2 max-w-md mx-auto">
              Elige tu atmósfera ideal y explora los destinos y alojamientos recomendados en todo el territorio nacional.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link href="/establecimientos?destination=morrocoy" className="group p-6 rounded-3xl bg-gradient-to-br from-[#00C8D4]/10 to-blue-500/5 border border-cyan-100/50 hover:shadow-xl hover:shadow-cyan-900/5 hover:-translate-y-1.5 transition-all duration-300 text-left block cursor-pointer">
              <div className="w-10 h-10 rounded-2xl bg-[#00C8D4]/10 flex items-center justify-center border border-[#00C8D4]/20 group-hover:scale-110 transition-transform mb-4">
                <Waves className="w-5 h-5 text-[#00C8D4]" />
              </div>
              <h3 className="font-extrabold text-sm text-gray-800 group-hover:text-brand-turquesa transition-colors mb-1">
                🏝️ Playas y Cayos
              </h3>
              <p className="text-[10px] text-gray-450 leading-relaxed font-bold">
                Morrocoy, Los Roques y costas de arena blanca.
              </p>
            </Link>

            <Link href="/parques" className="group p-6 rounded-3xl bg-gradient-to-br from-[#9B00CC]/10 to-indigo-500/5 border border-purple-100/50 hover:shadow-xl hover:shadow-purple-900/5 hover:-translate-y-1.5 transition-all duration-300 text-left block cursor-pointer">
              <div className="w-10 h-10 rounded-2xl bg-[#9B00CC]/10 flex items-center justify-center border border-[#9B00CC]/20 group-hover:scale-110 transition-transform mb-4">
                <Mountain className="w-5 h-5 text-[#9B00CC]" />
              </div>
              <h3 className="font-extrabold text-sm text-gray-800 group-hover:text-brand-purple transition-colors mb-1">
                ⛰️ Aventura y Tepuyes
              </h3>
              <p className="text-[10px] text-gray-450 leading-relaxed font-bold">
                Canaima, el Salto Ángel y selvas milenarias.
              </p>
            </Link>

            <Link href="/establecimientos?category=restaurantes" className="group p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-rose-500/5 border border-amber-100/50 hover:shadow-xl hover:shadow-amber-900/5 hover:-translate-y-1.5 transition-all duration-300 text-left block cursor-pointer">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform mb-4">
                <Utensils className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-extrabold text-sm text-gray-800 group-hover:text-amber-600 transition-colors mb-1">
                🍷 Gastronomía & Sabor
              </h3>
              <p className="text-[10px] text-gray-450 leading-relaxed font-bold">
                Sabores locales, catas y posadas de autor.
              </p>
            </Link>

            <Link href="/prestigio-2026" className="group p-6 rounded-3xl bg-gradient-to-br from-[#FF0096]/10 to-[#9B00CC]/5 border border-pink-100/50 hover:shadow-xl hover:shadow-pink-900/5 hover:-translate-y-1.5 transition-all duration-300 text-left block cursor-pointer">
              <div className="w-10 h-10 rounded-2xl bg-[#FF0096]/10 flex items-center justify-center border border-[#FF0096]/20 group-hover:scale-110 transition-transform mb-4">
                <Sparkles className="w-5 h-5 text-[#FF0096]" />
              </div>
              <h3 className="font-extrabold text-sm text-gray-800 group-hover:text-brand-magenta transition-colors mb-1">
                ✨ Lujo & Prestigio
              </h3>
              <p className="text-[10px] text-gray-450 leading-relaxed font-bold">
                Hospedajes de alta gama certificados bajo la campaña 2026.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. HOTELES DESTACADOS (HOSPEDAJES ÉLITE DE PRIMERO PARA EL TURISTA) */}
      <section className="py-20 px-4 bg-gray-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="text-left">
              <span className="text-brand-magenta text-xs font-black uppercase tracking-widest block mb-2">Hospedajes Elite</span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-800">Hoteles Destacados</h2>
            </div>
            <Link href="/establecimientos?category=hoteles" className="text-brand-magenta text-xs font-bold hover:underline flex items-center gap-1">
              Ver todos los hoteles <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-72 bg-gray-100 rounded-3xl" />
              ))}
            </div>
          ) : hotels.length === 0 ? (
            <div className="text-center py-10 bg-white border border-gray-100 rounded-3xl">
              <p className="text-gray-400 text-xs font-bold">No hay hoteles destacados registrados.</p>
            </div>
          ) : (
            <div className={hotels.length < 3 ? "flex flex-wrap justify-center gap-8" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"}>
              {hotels.map((hotel) => (
                <div key={hotel.id} className={hotels.length < 3 ? "w-full max-w-sm flex" : ""}>
                  <EstablishmentCard 
                    establishment={hotel} 
                    isComparing={comparedIds.includes(hotel.id)}
                    onCompareToggle={() => handleCompareToggle(hotel.id)}
                    isPriority={hotel.is_featured}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. RESEÑAS ANIMADAS EN 3 FILAS (EN MEDIO DE HOTELES DESTACADOS Y POSADAS DESTACADAS) */}
      <AnimatedReviewsSection />

      {/* 4. POSADAS DESTACADAS */}
      <section className="py-20 px-4 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="text-left">
              <span className="text-brand-magenta text-xs font-black uppercase tracking-widest block mb-2">Boutique & Encanto</span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-800">Posadas Destacadas</h2>
            </div>
            <Link href="/establecimientos?category=posadas" className="text-brand-magenta text-xs font-bold hover:underline flex items-center gap-1">
              Ver todos las posadas <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-72 bg-gray-100 rounded-3xl" />
              ))}
            </div>
          ) : posadas.length === 0 ? (
            <div className="text-center py-10 bg-white border border-gray-100 rounded-3xl">
              <p className="text-gray-400 text-xs font-bold">No hay posadas destacadas registradas.</p>
            </div>
          ) : (
            <div className={posadas.length < 3 ? "flex flex-wrap justify-center gap-8" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"}>
              {posadas.map((posada) => (
                <div key={posada.id} className={posadas.length < 3 ? "w-full max-w-sm flex" : ""}>
                  <EstablishmentCard 
                    establishment={posada} 
                    isComparing={comparedIds.includes(posada.id)}
                    onCompareToggle={() => handleCompareToggle(posada.id)}
                    isPriority={posada.is_featured}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. COMPLEJOS TURÍSTICOS */}
      <section className="py-20 px-4 bg-gray-50/50 border-t border-gray-150">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="text-left">
              <span className="text-brand-magenta text-xs font-black uppercase tracking-widest block mb-2">Resorts & Multiactividad</span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-800">Complejos Turísticos</h2>
            </div>
            <Link href="/establecimientos?category=complejos" className="text-brand-magenta text-xs font-bold hover:underline flex items-center gap-1">
              Ver todos los complejos <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-72 bg-gray-100 rounded-3xl" />
              ))}
            </div>
          ) : complexes.length === 0 ? (
            <div className="text-center py-10 bg-white border border-gray-100 rounded-3xl">
              <p className="text-gray-400 text-xs font-bold">No hay complejos turísticos destacados registrados.</p>
            </div>
          ) : (
            <div className={complexes.length < 3 ? "flex flex-wrap justify-center gap-8" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"}>
              {complexes.map((complex) => (
                <div key={complex.id} className={complexes.length < 3 ? "w-full max-w-sm flex" : ""}>
                  <EstablishmentCard 
                    establishment={complex} 
                    isComparing={comparedIds.includes(complex.id)}
                    onCompareToggle={() => handleCompareToggle(complex.id)}
                    isPriority={complex.is_featured}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4.5. CAMPAÑA DE PRESTIGIO 2026 (ALTA GAMA / FULL-BLEED) */}
      <section className="relative w-full h-[520px] flex items-center justify-center overflow-hidden">
        {/* Background Image scaling 1.08 to prevent black borders/letterbox */}
        <div 
          className="absolute inset-0 bg-cover bg-center scale-[1.08] transition-transform duration-[1500ms] hover:scale-110"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1552083375-1447ce886485?w=1600&auto=format&fit=crop')` }}
        />
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/45 z-10" />

        {/* Bottom white fade overlay to blend invisible with the page background */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/50 to-transparent z-15 pointer-events-none" />

        {/* Centered Content */}
        <div className="relative z-20 max-w-4xl mx-auto px-6 text-center text-white flex flex-col items-center justify-center h-full">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-brand-turquesa mb-4 drop-shadow-sm">
            EL PARAÍSO TE ESPERA
          </span>
          <h2 className="text-3xl sm:text-5xl font-black mb-6 leading-tight tracking-tight font-serif drop-shadow-sm">
            Wakü Lodge & Ara Merú
          </h2>
          <p className="text-gray-150 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed mb-8 font-semibold drop-shadow-sm">
            Descubre los alojamientos exclusivos y de alta gama certificados bajo el Sello de Calidad y Prestigio 2026. Hospitalidad de nivel mundial en el corazón de Canaima.
          </p>
          <Link href="/prestigio-2026">
            <button className="bg-white hover:bg-gray-50 text-[#FF0096] font-extrabold px-8 py-3.5 rounded-full text-xs shadow-lg hover:scale-103 active:scale-97 transition-all cursor-pointer flex items-center gap-1.5 border border-white/20">
              <Sparkles className="w-4 h-4 text-[#FF0096]" />
              <span>Explorar Colección Prestigio</span>
            </button>
          </Link>
        </div>
      </section>

      {/* 5. DESTINOS POPULARES */}
      <section className="py-20 px-4 bg-white relative border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="text-left">
              <span className="text-brand-magenta text-xs font-black uppercase tracking-widest block mb-2">Destinos de Ensueño</span>
              <h2 className="text-3xl font-black text-gray-800">Inspiración para tu Próximo Viaje</h2>
            </div>
            <Link href="/destinos" className="text-brand-magenta text-xs font-bold hover:underline flex items-center gap-1">
              Ver todos los destinos <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDestinations.map((dest, i) => (
              <Link
                key={i}
                href={`/destinos/${dest.slug}`}
                className="group rounded-3xl p-6 flex flex-col justify-between h-64 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden block shadow-md border border-white/10"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${dest.img})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/25 z-10" />
                
                <div className="relative z-20 text-left">
                  <span className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                    {dest.tag}
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-4 group-hover:text-brand-turquesa transition-colors">{dest.name}</h3>
                  <p className="text-white/80 text-xs leading-relaxed mt-2 line-clamp-2">{dest.desc}</p>
                </div>
                <div className="flex justify-between items-center mt-6 relative z-20">
                  <span className="text-[10px] text-brand-turquesa font-extrabold uppercase tracking-widest">Explorar Destino</span>
                  <span className="w-6 h-6 rounded-lg bg-white/20 text-white group-hover:bg-brand-turquesa group-hover:text-slate-950 flex items-center justify-center text-xs font-bold transition-all">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SITIOS TURÍSTICOS RECOMENDADOS */}
      <section className="py-20 px-4 bg-gray-50/30 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 bg-brand-purple/10 border border-brand-purple/20 text-xs font-black text-brand-purple px-3 py-1 rounded-full mb-3">
                <Mountain className="w-3.5 h-3.5" />
                <span>LUGARES EMBLEMÁTICOS</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">
                Sitios Turísticos Recomendados
              </h2>
              <p className="text-gray-400 text-xs mt-1.5 max-w-xl leading-relaxed">
                Puntos geográficos icónicos verificados físicamente por nuestro staff en cada una de sus expediciones.
              </p>
            </div>
            <Link href="/sitios-turisticos" className="text-brand-magenta text-xs font-bold hover:underline flex items-center gap-1 shrink-0">
              Ver todos los sitios turísticos <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {sites.map((site) => (
              <article key={site.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 text-left flex flex-col justify-between h-full">
                <div>
                  <Link href={`/sitio/${site.slug}`}>
                    <div className="h-44 overflow-hidden relative cursor-pointer">
                      <img 
                        src={getCleanedImageUrl(site.image_url, site.name)} 
                        alt={site.name} 
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800";
                        }}
                      />
                      <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-gray-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg">
                        {site.category}
                      </span>
                    </div>
                  </Link>
                  <div className="p-5">
                    <Link href={`/sitio/${site.slug}`}>
                      <h3 className="font-extrabold text-base text-gray-800 mb-2 hover:text-brand-magenta transition-colors cursor-pointer">
                        {site.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                      {site.short_description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="flex flex-wrap gap-1 mb-4 col-span-3">
                    {(site.highlights || "").split(",").filter(Boolean).slice(0, 3).map((hl, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-50 border border-gray-100 text-[9px] text-gray-400 rounded-full font-bold">
                        {hl.trim()}
                      </span>
                    ))}
                  </div>
                  <Link href={`/sitio/${site.slug}`}>
                    <button className="w-full bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-90 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-102 transition-all">
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

      {/* 8. NUESTRO VIDEO */}
      {videoSection.isActive && (
        <section 
          className="py-16 text-white relative overflow-hidden px-4"
          style={{ background: "linear-gradient(135deg, #0e0120 0%, #1a0533 60%, #0d1a2e 100%)" }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-20" style={{ background: "#FF0096" }} />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ background: "#00C8D4" }} />
          </div>
          
          <div className="max-w-5xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-xs font-bold text-white mb-4">
              <Play className="w-4 h-4 fill-white text-white" />
              <span>{videoSection.subtitle || "NUESTRO VIDEO PRESENTACIÓN"}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-white">
              {videoSection.title}
            </h2>
            <p className="text-slate-300 text-xs max-w-xl mx-auto leading-relaxed mb-10">
              {videoSection.description}
            </p>

            <div className="max-w-3xl mx-auto bg-black/50 border border-white/15 rounded-3xl overflow-hidden aspect-video shadow-2xl relative">
              <iframe 
                src={getEmbedUrl(videoSection.buttonUrl)} 
                title="Hoteles de Venezuela LLC Video"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </section>
      )}

      {/* 9. REPORTAJES / TIPS DE VIAJE */}
      <section className="py-20 px-4 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-black text-brand-turquesa mb-3">
                <BookOpen className="w-3.5 h-3.5" />
                <span>TIPS DE VIAJE & REPORTAJES</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">
                Consejos de Turismo & Guías
              </h2>
              <p className="text-gray-400 text-xs mt-1.5 max-w-xl leading-relaxed">
                Lee los reportajes redactados por nuestro equipo sobre playas secretas, picos andinos y gastronomía.
              </p>
            </div>
            <Link href="/blog" className="text-brand-magenta text-xs font-bold hover:underline flex items-center gap-1 shrink-0 font-semibold">
              Ver todos los reportajes <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <article key={blog.id} className="group flex flex-col justify-between bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full text-left">
                <div>
                  <div className="h-44 overflow-hidden relative">
                    <img 
                      src={getCleanedImageUrl(blog.featured_image, blog.title)} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800";
                      }}
                    />
                    <div className="absolute top-4 left-4 bg-brand-turquesa text-white text-[9px] font-black uppercase px-2 py-1 rounded-lg">
                      {blog.reading_time} Min de lectura
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-extrabold text-base text-gray-850 line-clamp-2 leading-tight group-hover:text-brand-magenta transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <Link href={`/blog/${blog.slug}`}>
                    <span className="text-xs font-bold text-brand-magenta group-hover:underline flex items-center gap-1 cursor-pointer">
                      Leer reportaje →
                    </span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 10. SECCIÓN B2B: PROGRAMAS Y OPORTUNIDADES (AL FINAL ANTES DEL FOOTER) */}
      {aboutSection.isActive && (() => {
        const sectionSubtitle = aboutSection.subtitle === "RED DE SITIOS OFICIAL" ? "PROGRAMAS Y ALIANZAS" : aboutSection.subtitle;
        const sectionTitle = aboutSection.title === "Ecosistema Hoteles de Venezuela" ? "Programas y Oportunidades" : aboutSection.title;
        const sectionDescription = aboutSection.description === "Nuestra red de portales conecta a miles de turistas cada día directamente con los hoteleros locales." 
          ? "Únete a nuestras iniciativas oficiales para potenciar tu hospedaje, captar clientes y forjar alianzas de valor." 
          : aboutSection.description;
        
        return (
          <section className="py-16 bg-gray-50 border-b border-gray-100 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-magenta/10 border border-brand-magenta/20 text-xs font-black text-brand-magenta mb-4">
                  {sectionSubtitle === "PROGRAMAS Y ALIANZAS" ? <Sparkles className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                  <span>{sectionSubtitle}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">
                  {sectionTitle}
                </h2>
                <p className="text-gray-400 text-xs mt-2 max-w-lg mx-auto">
                  {sectionDescription}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {programs.map((site) => {
                  const IconComponent = site.icon;
                  return (
                    <Link
                      key={site.name}
                      href={site.url}
                      className={`group bg-gradient-to-br ${site.gradient} rounded-2xl p-6 hover:-translate-y-1.5 hover:shadow-2xl ${site.shadow} transition-all duration-300 relative overflow-hidden text-left block border border-white/10`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white border border-white/10">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="font-extrabold text-base text-white mb-1 drop-shadow-xs">
                        {site.name}
                      </h3>
                      <p className="text-xs text-white/90 leading-relaxed">{site.description}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })()}

      {/* 11. SECCIÓN B2B: VENTAJAS Y SELLO HDV (AL FINAL ANTES DEL FOOTER) */}
      {featuresSection.isActive && (
        <section className="py-16 bg-white border-b border-gray-100 px-4">
          <div className="max-w-7xl mx-auto">
            {featuresSection.title !== "Ventajas / ¿Qué hacemos?" && (
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">{featuresSection.title}</h2>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col gap-3 text-center items-center bg-gradient-to-br from-pink-50/40 to-white border border-pink-100/50 rounded-3xl p-8 hover:shadow-xl hover:shadow-pink-900/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[4px] bg-[#FF0096]" />
                <div className="w-12 h-12 rounded-2xl bg-[#FF0096]/10 flex items-center justify-center border border-[#FF0096]/20 shadow-xs group-hover:scale-110 transition-transform">
                  <Compass className="w-6 h-6 text-[#FF0096]" />
                </div>
                <h3 className="text-base font-extrabold text-gray-800">Curaduría Experta</h3>
                <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
                  Seleccionamos minuciosamente cada hotel, posada y restaurante para garantizar una hospitalidad de primer nivel en Venezuela.
                </p>
              </div>

              <div className="flex flex-col gap-3 text-center items-center bg-gradient-to-br from-purple-50/40 to-white border border-purple-100/50 rounded-3xl p-8 hover:shadow-xl hover:shadow-purple-900/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[4px] bg-[#9B00CC]" />
                <div className="w-12 h-12 rounded-2xl bg-[#9B00CC]/10 flex items-center justify-center border border-[#9B00CC]/20 shadow-xs group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6 text-[#9B00CC]" />
                </div>
                <h3 className="text-base font-extrabold text-gray-800">Sello de Calidad HDV</h3>
                <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
                  Nuestros establecimientos con sello de oro representan la máxima garantía de confort, servicio y fiabilidad para tus viajes.
                </p>
              </div>

              <div className="flex flex-col gap-3 text-center items-center bg-gradient-to-br from-cyan-50/40 to-white border border-cyan-100/50 rounded-3xl p-8 hover:shadow-xl hover:shadow-cyan-900/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[4px] bg-[#00C8D4]" />
                <div className="w-12 h-12 rounded-2xl bg-[#00C8D4]/10 flex items-center justify-center border border-[#00C8D4]/20 shadow-xs group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-[#00C8D4]" />
                </div>
                <h3 className="text-base font-extrabold text-gray-800">Conexión Directa</h3>
                <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
                  Te conectamos sin comisiones intermediarias con los propietarios vía WhatsApp para cotizar y reservar de manera segura.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}



      {/* 11. CTA PROPIETARIOS & MEMBRESÍAS */}
      {ctaSection.isActive && (
        <section className="py-20 px-4 bg-white relative overflow-hidden">
          <div className="max-w-5xl mx-auto rounded-3xl bg-gray-50 border border-gray-100 p-8 md:p-14 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-6">
              {ctaSection.title}
            </h2>
            <p className="text-gray-500 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed mb-8">
              {ctaSection.description}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href={ctaSection.buttonUrl || "/mis-negocios"}
                className="btn-magenta-gradient font-bold px-8 py-3.5 rounded-full hover:scale-105 active:scale-95 transition-all text-xs shadow-md shadow-brand-magenta/10 cursor-pointer"
              >
                {ctaSection.buttonText || "Registrar mi negocio"}
              </Link>
              <Link 
                href="/membresias"
                className="border border-gray-200 hover:border-brand-magenta hover:bg-magenta-50/5 text-gray-600 font-bold px-8 py-3.5 rounded-full hover:scale-105 active:scale-95 transition-all text-xs cursor-pointer"
              >
                Ver Membresías
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Floating Compare Bar */}
      {comparedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-full px-6 py-4 flex items-center gap-6 shadow-2xl text-white max-w-[90vw] md:max-w-max animate-fade-in">
          <div className="flex items-center gap-4">
            <span className="text-[11px] md:text-xs font-bold whitespace-nowrap">
              Comparando <span className="text-brand-magenta font-black">{comparedIds.length}</span> de 3
            </span>
            <div className="flex -space-x-2 flex-wrap">
              {comparedIds.map(id => {
                const hotel = establishments.find(e => e.id === id);
                if (!hotel) return null;
                return (
                  <img
                    key={id}
                    src={hotel.primary_image || "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=100"}
                    alt={hotel.name}
                    className="w-7 h-7 rounded-full border-2 border-slate-900 object-cover shrink-0"
                    title={hotel.name}
                  />
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                localStorage.setItem("hdv_compare_list", "[]");
                setComparedIds([]);
                window.dispatchEvent(new Event("hdv_compare_updated"));
              }}
              className="text-white/60 hover:text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-white/5 transition-all cursor-pointer"
            >
              Limpiar
            </button>
            <Link href="/comparar">
              <button className="btn-magenta-gradient text-xs font-black px-4 py-2 rounded-full cursor-pointer hover:scale-103 transition-transform shadow-md">
                Comparar
              </button>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}