import { useEffect, useState } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { ESTABLISHMENTS_MOCK } from "../lib/establishmentsMock";
import type { Establishment } from "../components/layout/EstablishmentCard";
import { EstablishmentCard, EstablishmentListItem, getVirtualPrice } from "../components/layout/EstablishmentCard";
import { Search, MapPin, ChevronDown, X, Filter, Grid, List, Compass, Loader2, Wifi, Car, Waves, Wind, Palmtree, Zap, Droplets, Dog, Star, Sparkles } from "lucide-react";

interface Category {
  id: number;
  slug: string;
  name: string;
  icon: string;
}

interface Destination {
  id: number;
  slug: string;
  name: string;
  state: string;
}

export function Establecimientos() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"category" | "destination" | null>(null);
  const [comparedIds, setComparedIds] = useState<number[]>([]);

  // Advanced Filter States
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [minRating, setMinRating] = useState<number>(0);
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [selectedSubtype, setSelectedSubtype] = useState<string>("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedAccessibility, setSelectedAccessibility] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [smartQuery, setSmartQuery] = useState<string>("");

  const availableAmenities = [
    { key: "wifi", label: "WiFi Gratis", icon: <Wifi className="w-3.5 h-3.5" /> },
    { key: "piscina", label: "Piscina", icon: <Waves className="w-3.5 h-3.5" /> },
    { key: "estacionamiento", label: "Estacionamiento", icon: <Car className="w-3.5 h-3.5" /> },
    { key: "aire_acondicionado", label: "Aire Acondicionado", icon: <Wind className="w-3.5 h-3.5" /> },
    { key: "playa_privada", label: "Playa Privada", icon: <Palmtree className="w-3.5 h-3.5" /> },
    { key: "planta_electrica", label: "Planta Eléctrica", icon: <Zap className="w-3.5 h-3.5" /> },
    { key: "tanque_agua", label: "Tanque de Agua", icon: <Droplets className="w-3.5 h-3.5" /> },
    { key: "pet_friendly", label: "Mascotas", icon: <Dog className="w-3.5 h-3.5" /> },
  ];

  const availableAccessibility = [
    { key: "planta_baja", label: "Toda la unidad en planta baja" },
    { key: "silla_ruedas", label: "Accesible en silla de ruedas" },
    { key: "ascensor", label: "Acceso en ascensor" },
    { key: "wc_barras", label: "WC con barras de apoyo" },
    { key: "braille", label: "Apoyo visual: Braille" },
    { key: "guiado_auditivo", label: "Guiado auditivo / visual" },
  ];

  const availableActivities = [
    { key: "solo_adultos", label: "Solo para adultos" },
    { key: "tours_pie", label: "Tours a pie" },
    { key: "tours_bici", label: "Tours en bicicleta" },
    { key: "alquiler_bici", label: "Alquiler de bicicletas" },
    { key: "ruta_bares", label: "Ruta de bares" },
  ];

  const getSubtype = (est: Establishment) => {
    const nameLower = est.name.toLowerCase();
    if (nameLower.includes("posada") || nameLower.includes("boutique")) return "posada_boutique";
    if (nameLower.includes("resort") || nameLower.includes("complex") || nameLower.includes("hesperia")) return "resort";
    if (nameLower.includes("hotel") || nameLower.includes("suites")) return "hotel_familiar";
    return "otros";
  };

  const getVirtualCapacity = (est: Establishment) => {
    const category = est.category_slug || "";
    if (category === "restaurantes") return 20;
    return category === "posadas" ? 2 + (est.id % 4) : 4 + (est.id % 6);
  };

  const toggleAmenityFilter = (key: string) => {
    setSelectedAmenities(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Load compared hotels on mount
  useEffect(() => {
    const stored = localStorage.getItem("hdv_compare_list");
    if (stored) setComparedIds(JSON.parse(stored));
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
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

  // Read URL search params on mount
  const searchParams = new URLSearchParams(window.location.search);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedDestination, setSelectedDestination] = useState(searchParams.get("destination") || "");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  // Update URL search params
  const updateURLParams = (category: string, destination: string, query: string) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (destination) params.set("destination", destination);
    if (query) params.set("q", query);

    const paramStr = params.toString();
    const newPath = window.location.pathname + (paramStr ? `?${paramStr}` : "");
    window.history.pushState(null, "", newPath);
  };

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    updateURLParams(slug, selectedDestination, searchQuery);
    setActiveDropdown(null);
  };

  const handleDestinationChange = (slug: string) => {
    setSelectedDestination(slug);
    updateURLParams(selectedCategory, slug, searchQuery);
    setActiveDropdown(null);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    updateURLParams(selectedCategory, selectedDestination, val);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedDestination("");
    setSearchQuery("");
    setMinPrice(0);
    setMaxPrice(1000);
    setMinRating(0);
    setAdults(1);
    setChildren(0);
    setSelectedSubtype("");
    setSelectedAmenities([]);
    setSelectedStars([]);
    setSelectedAccessibility([]);
    setSelectedActivities([]);
    setSmartQuery("");
    updateURLParams("", "", "");
  };

  const handleSmartSearch = (phrase: string) => {
    if (!phrase.trim()) return;
    const phraseLower = phrase.toLowerCase();
    
    // Limpiar todos los filtros antes de aplicar la búsqueda inteligente
    setSelectedCategory("");
    setSelectedDestination("");
    setSearchQuery("");
    setMinPrice(0);
    setMaxPrice(1000);
    setMinRating(0);
    setAdults(1);
    setChildren(0);
    setSelectedSubtype("");
    setSelectedAmenities([]);
    setSelectedStars([]);
    setSelectedAccessibility([]);
    setSelectedActivities([]);
    updateURLParams("", "", "");
    
    setSmartQuery(phrase);

    // Detección inteligente de servicios
    const newAmenities: string[] = [];
    if (phraseLower.includes("piscina") || phraseLower.includes("alberca")) newAmenities.push("piscina");
    if (phraseLower.includes("wifi") || phraseLower.includes("internet") || phraseLower.includes("wi-fi")) newAmenities.push("wifi");
    if (phraseLower.includes("planta") || phraseLower.includes("generador") || phraseLower.includes("luz")) newAmenities.push("planta_electrica");
    if (phraseLower.includes("tanque") || phraseLower.includes("agua")) newAmenities.push("tanque_agua");
    if (phraseLower.includes("mascota") || phraseLower.includes("perro") || phraseLower.includes("gato") || phraseLower.includes("pet")) newAmenities.push("pet_friendly");
    if (phraseLower.includes("playa")) newAmenities.push("playa_privada");
    if (phraseLower.includes("estacionamiento") || phraseLower.includes("parking") || phraseLower.includes("estacionar")) newAmenities.push("estacionamiento");
    if (phraseLower.includes("aire") || phraseLower.includes("acondicionado") || phraseLower.includes("clima")) newAmenities.push("aire_acondicionado");
    if (newAmenities.length > 0) setSelectedAmenities(newAmenities);

    // Detección de accesibilidad
    const newAccess: string[] = [];
    if (phraseLower.includes("silla") || phraseLower.includes("ruedas") || phraseLower.includes("rampa") || phraseLower.includes("discapacitado")) newAccess.push("silla_ruedas");
    if (phraseLower.includes("planta baja") || phraseLower.includes("planta-baja") || phraseLower.includes("primer piso")) newAccess.push("planta_baja");
    if (phraseLower.includes("ascensor") || phraseLower.includes("elevador")) newAccess.push("ascensor");
    if (phraseLower.includes("wc") || phraseLower.includes("baño adaptado") || phraseLower.includes("barras") || phraseLower.includes("apoyo")) newAccess.push("wc_barras");
    if (phraseLower.includes("braille") || phraseLower.includes("ciego")) newAccess.push("braille");
    if (phraseLower.includes("audio") || phraseLower.includes("guiado")) newAccess.push("guiado_auditivo");
    if (newAccess.length > 0) setSelectedAccessibility(newAccess);

    // Detección de estrellas
    if (phraseLower.includes("5 estrellas") || phraseLower.includes("cinco estrellas") || phraseLower.includes("lujo")) {
      setSelectedStars([5]);
    } else if (phraseLower.includes("4 estrellas") || phraseLower.includes("cuatro estrellas")) {
      setSelectedStars([4]);
    } else if (phraseLower.includes("3 estrellas") || phraseLower.includes("tres estrellas")) {
      setSelectedStars([3]);
    }

    // Detección de actividades/tipo de grupo
    const newAct: string[] = [];
    if (phraseLower.includes("adulto") || phraseLower.includes("adults")) newAct.push("solo_adultos");
    if (phraseLower.includes("tour") || phraseLower.includes("paseo") || phraseLower.includes("caminar")) newAct.push("tours_pie");
    if (phraseLower.includes("bicicleta") || phraseLower.includes("bici")) newAct.push("tours_bici");
    if (phraseLower.includes("bar") || phraseLower.includes("bares") || phraseLower.includes("bebidas") || phraseLower.includes("tragos")) newAct.push("ruta_bares");
    if (newAct.length > 0) setSelectedActivities(newAct);

    // Detección de destino
    if (phraseLower.includes("caracas")) handleDestinationChange("caracas");
    if (phraseLower.includes("roques")) handleDestinationChange("los-roques");
    if (phraseLower.includes("margarita")) handleDestinationChange("margarita");
    if (phraseLower.includes("canaima")) handleDestinationChange("canaima");
    if (phraseLower.includes("merida") || phraseLower.includes("mérida")) handleDestinationChange("merida");
  };

  // Fetch Categories & Destinations
  useEffect(() => {
    async function fetchFilters() {
      try {
        const [catsRes, destsRes] = await Promise.all([
          supabase.from("categories").select("*").order("name"),
          supabase.from("destinations").select("id, slug, name, state").order("name")
        ]);

        if (catsRes.data) setCategories(catsRes.data as Category[]);
        if (destsRes.data) setDestinations(destsRes.data as Destination[]);
      } catch (err) {
        console.error("Error fetching filter options:", err);
      }
    };
    fetchFilters();
  }, []);

  // Fetch Establishments
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("establishments")
          .select(`
            *,
            categories (name, slug),
            destinations (name, slug),
            establishment_images (image_url, is_primary)
          `)
          .eq("status", "approved");

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: Establishment[] = data.map((item: any) => {
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
              has_reservations_enabled: item.has_reservations_enabled || false,
              is_ads_enabled: item.is_ads_enabled || false
            };
          });
          setEstablishments(mapped);
        } else {
          setEstablishments(ESTABLISHMENTS_MOCK);
        }
      } catch (err) {
        console.warn("Error consultando Supabase para establecimientos, usando datos de demostración:", err);
        setEstablishments(ESTABLISHMENTS_MOCK);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter in-memory
  const filtered = establishments.filter(est => {
    const matchesCategory = !selectedCategory || est.category_slug === selectedCategory;
    const matchesDestination = !selectedDestination || est.destination_slug === selectedDestination;
    const matchesQuery = !searchQuery || 
      est.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      est.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      est.address.toLowerCase().includes(searchQuery.toLowerCase());

    // Advanced filters logic
    const price = getVirtualPrice(est);
    const matchesPrice = price >= minPrice && price <= maxPrice;
    const matchesRating = est.rating_avg >= minRating;
    const matchesCapacity = (adults + children) <= getVirtualCapacity(est);
    const matchesSubtype = !selectedSubtype || getSubtype(est) === selectedSubtype;
    
    // Parse services in establishment
    let estServices: string[] = [];
    try {
      if (est.services) {
        if (Array.isArray(est.services)) {
          estServices = est.services.map(s => String(s).toLowerCase().trim());
        } else if (typeof est.services === "string") {
          const trimmed = est.services.trim();
          if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            estServices = JSON.parse(trimmed).map((s: any) => String(s).toLowerCase().trim());
          } else {
            estServices = trimmed.split(",").map(s => s.toLowerCase().trim());
          }
        }
      }
    } catch (e) {
      console.warn("Error parsing services for filtering:", e);
    }
    
    // Enriquecer dinámicamente servicios para simular accesibilidad y actividades en el mock
    const nameLower = est.name.toLowerCase();
    if (est.id % 2 === 0 && !estServices.includes("planta_baja")) estServices.push("planta_baja");
    if (est.id % 3 === 0) {
      if (!estServices.includes("silla_ruedas")) estServices.push("silla_ruedas");
      if (!estServices.includes("wc_barras")) estServices.push("wc_barras");
    }
    if ((nameLower.includes("hotel") || nameLower.includes("resort") || nameLower.includes("intercontinental")) && !estServices.includes("ascensor")) {
      estServices.push("ascensor");
    }
    if (est.id % 5 === 0) {
      if (!estServices.includes("braille")) estServices.push("braille");
      if (!estServices.includes("guiado_auditivo")) estServices.push("guiado_auditivo");
    }

    // Actividades automáticas en el mock
    if ((nameLower.includes("adult") || nameLower.includes("humboldt") || est.id % 4 === 0) && !estServices.includes("solo_adultos")) {
      estServices.push("solo_adultos");
    }

    if ((nameLower.includes("posada") || est.destination_slug === "los-roques") && !estServices.includes("tours_pie")) {
      estServices.push("tours_pie");
    }
    if (est.id % 2 === 1) {
      if (!estServices.includes("tours_bici")) estServices.push("tours_bici");
      if (!estServices.includes("alquiler_bici")) estServices.push("alquiler_bici");
    }
    if ((nameLower.includes("bar") || nameLower.includes("restaurante") || est.id % 6 === 0) && !estServices.includes("ruta_bares")) {
      estServices.push("ruta_bares");
    }

    const matchesAmenities = selectedAmenities.every(amenity => 
      estServices.includes(amenity.toLowerCase())
    );

    // Stars logic (est.stars or estimated from tier / name)
    const getStarsCount = () => {
      if ((est as any).stars) return Number((est as any).stars);
      if (nameLower.includes("resort") || nameLower.includes("intercontinental") || nameLower.includes("cayena") || est.membership_tier === "diamante") return 5;
      if (nameLower.includes("boutique") || est.rating_avg >= 4.7) return 4;
      if (nameLower.includes("posada") || nameLower.includes("hotel") || est.rating_avg >= 4.3) return 3;
      return 2;
    };
    const starsCount = getStarsCount();
    const matchesStars = selectedStars.length === 0 || selectedStars.includes(starsCount);

    const matchesAccessibility = selectedAccessibility.every(acc => 
      estServices.includes(acc.toLowerCase())
    );

    const matchesActivities = selectedActivities.every(act => 
      estServices.includes(act.toLowerCase())
    );

    return matchesCategory && matchesDestination && matchesQuery && matchesPrice && matchesRating && matchesCapacity && matchesSubtype && matchesAmenities && matchesStars && matchesAccessibility && matchesActivities;
  });

  const getCategoryName = (slug: string) => categories.find(c => c.slug === slug)?.name || slug;
  const getDestinationName = (slug: string) => destinations.find(d => d.slug === slug)?.name || slug;

  const activeFiltersCount = 
    (selectedCategory ? 1 : 0) + 
    (selectedDestination ? 1 : 0) + 
    (minPrice > 0 ? 1 : 0) + 
    (maxPrice < 1000 ? 1 : 0) + 
    (minRating > 0 ? 1 : 0) + 
    (adults > 1 || children > 0 ? 1 : 0) + 
    (selectedSubtype ? 1 : 0) + 
    (selectedAmenities.length) +
    (selectedStars.length) +
    (selectedAccessibility.length) +
    (selectedActivities.length) +
    (smartQuery ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden py-20 md:py-28 w-full text-white text-center flex items-center justify-center">
        {/* Imagen del Banner con clase scale-[1.08] */}
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
          alt="Explora Establecimientos"
          className="absolute inset-0 w-full h-full object-cover scale-[1.08] pointer-events-none"
        />
        
        {/* Capa de contraste oscuro (sin negro puro, usando los morados profundos oficiales) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e011f]/85 via-[#1a0533]/80 to-transparent z-10" />

        {/* Degradado inferior blanco para fundir con el fondo de la página */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50/30 via-gray-50/15 to-transparent z-15" />

        <div className="max-w-4xl mx-auto px-6 relative z-20 flex flex-col items-center justify-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black bg-brand-magenta/25 text-brand-magenta border border-brand-magenta/40 mb-4 tracking-widest uppercase animate-pulse">
            <Compass className="w-3.5 h-3.5" />
            <span>EL PARAÍSO TE ESPERA</span>
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-4 text-white drop-shadow-md">
            Explora Hoteles y <span className="text-gradient-brand">Hospedajes</span>
          </h1>
          <p className="text-gray-150 text-xs md:text-sm font-sans max-w-2xl mx-auto leading-relaxed opacity-95 drop-shadow-xs">
            Descubre los mejores hospedajes, posadas boutique y restaurantes en toda Venezuela. Comunícate directamente con los dueños sin pagar cargos por intermediación.
          </p>
        </div>
      </div>

      {/* Contenedor Principal con Diseño de 2 Columnas (Sidebar Filtros Izquierdo + Resultados Derecho) */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* COLUMNA IZQUIERDA: Filtros (Fijo en desktop, colapsable en móvil) */}
          <aside className={`w-full lg:w-80 shrink-0 bg-white border border-gray-100 rounded-3xl p-6 shadow-xl shadow-gray-200/40 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto transition-all duration-300 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-sm font-black text-gray-800 tracking-tight flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-magenta" />
                <span>Filtros de Búsqueda</span>
              </h3>
              {/* Botón para cerrar filtros en móvil */}
              <button 
                onClick={() => setShowFilters(false)}
                className="lg:hidden p-1.5 rounded-xl hover:bg-gray-50 text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6 text-left">
              {/* 1. Categoría */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Categoría</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-700 outline-none focus:border-brand-magenta cursor-pointer"
                >
                  <option value="">Todas las Categorías</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* 2. Destino */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Destino</label>
                <select
                  value={selectedDestination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-700 outline-none focus:border-brand-magenta cursor-pointer"
                >
                  <option value="">Todos los Destinos</option>
                  {destinations.map((dest) => (
                    <option key={dest.id} value={dest.slug}>{dest.name} ({dest.state})</option>
                  ))}
                </select>
              </div>

              {/* 3. Rango de Precios */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Precio por Noche (USD)</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2 text-gray-400 text-xs font-bold">$</span>
                    <input
                      type="number"
                      placeholder="Mín"
                      value={minPrice || ""}
                      onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-6 pr-2 py-2.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#00C8D4]"
                    />
                  </div>
                  <span className="text-gray-450 text-xs">—</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2 text-gray-400 text-xs font-bold">$</span>
                    <input
                      type="number"
                      placeholder="Máx"
                      value={maxPrice || ""}
                      onChange={(e) => setMaxPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-6 pr-2 py-2.5 text-xs font-semibold text-gray-700 outline-none focus:border-[#00C8D4]"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Calificación Mínima */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Calificación Mínima</label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-750 outline-none focus:border-[#00C8D4] cursor-pointer"
                >
                  <option value="0">Cualquier Puntuación</option>
                  <option value="4.5">★ 4.5+ Excelente</option>
                  <option value="4.0">★ 4.0+ Muy Bueno</option>
                  <option value="3.5">★ 3.5+ Bueno</option>
                </select>
              </div>

              {/* 5. Huéspedes / Capacidad */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Huéspedes / Capacidad</label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                    <span className="text-[11px] text-gray-500 font-bold">Adultos</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={adults <= 1}
                        onClick={() => setAdults(adults - 1)}
                        className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-black text-gray-550 hover:bg-gray-50 disabled:opacity-40 select-none cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-gray-750 min-w-[12px] text-center">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults(adults + 1)}
                        className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-black text-gray-550 hover:bg-gray-50 select-none cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                    <span className="text-[11px] text-gray-500 font-bold">Niños</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={children <= 0}
                        onClick={() => setChildren(children - 1)}
                        className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-black text-gray-550 hover:bg-gray-50 disabled:opacity-40 select-none cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-gray-755 min-w-[12px] text-center">{children}</span>
                      <button
                        type="button"
                        onClick={() => setChildren(children + 1)}
                        className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-black text-gray-550 hover:bg-gray-50 select-none cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Subtipo de Alojamiento */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Subtipo de Alojamiento</label>
                <select
                  value={selectedSubtype}
                  onChange={(e) => setSelectedSubtype(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-750 outline-none focus:border-[#00C8D4] cursor-pointer"
                >
                  <option value="">Cualquier subtipo</option>
                  <option value="posada_boutique">Posada Boutique / Encanto</option>
                  <option value="resort">Resort / Complejo Vacacional</option>
                  <option value="hotel_familiar">Hotel Familiar o de Ciudad</option>
                  <option value="otros">Otros tipos de hospedaje</option>
                </select>
              </div>

              {/* 7. Servicios y Amenidades Clave */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Servicios Clave</label>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
                  {availableAmenities.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity.key);
                    return (
                      <button
                        key={amenity.key}
                        type="button"
                        onClick={() => toggleAmenityFilter(amenity.key)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none justify-start ${
                          isSelected
                            ? "bg-cyan-50 border-[#00C8D4] text-[#00C8D4] shadow-xs"
                            : "bg-white border-gray-150 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span className={isSelected ? "text-[#00C8D4]" : "text-gray-400"}>
                          {amenity.icon}
                        </span>
                        <span className="truncate">{amenity.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 8. Estrellas del Alojamiento */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Categoría del Alojamiento</label>
                <div className="flex flex-col gap-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const isSelected = selectedStars.includes(stars);
                    return (
                      <label key={stars} className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedStars(prev =>
                              prev.includes(stars) ? prev.filter(s => s !== stars) : [...prev, stars]
                            );
                          }}
                          className="rounded text-brand-magenta focus:ring-brand-magenta border-gray-300 w-3.5 h-3.5 cursor-pointer accent-[#FF0096]"
                        />
                        <span className="flex items-center gap-0.5 text-amber-500 font-extrabold">
                          {Array.from({ length: stars }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                          <span className="text-[10px] text-gray-500 font-semibold ml-1">
                            ({stars} {stars === 1 ? 'estrella' : 'estrellas'})
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 9. Accesibilidad del Alojamiento */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Accesibilidad (Urb. y Habitaciones)</label>
                <div className="flex flex-col gap-2">
                  {availableAccessibility.map((acc) => {
                    const isSelected = selectedAccessibility.includes(acc.key);
                    return (
                      <label key={acc.key} className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedAccessibility(prev =>
                              prev.includes(acc.key) ? prev.filter(k => k !== acc.key) : [...prev, acc.key]
                            );
                          }}
                          className="rounded text-brand-turquesa focus:ring-brand-turquesa border-gray-300 w-3.5 h-3.5 cursor-pointer accent-[#00C8D4]"
                        />
                        <span className="truncate leading-tight text-gray-500 hover:text-gray-700">{acc.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 10. Actividades y Tipo de Grupo */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Ideal Para y Actividades</label>
                <div className="flex flex-col gap-2">
                  {availableActivities.map((act) => {
                    const isSelected = selectedActivities.includes(act.key);
                    return (
                      <label key={act.key} className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedActivities(prev =>
                              prev.includes(act.key) ? prev.filter(k => k !== act.key) : [...prev, act.key]
                            );
                          }}
                          className="rounded text-[#9B00CC] focus:ring-[#9B00CC] border-gray-300 w-3.5 h-3.5 cursor-pointer accent-[#9B00CC]"
                        />
                        <span className="truncate leading-tight text-gray-500 hover:text-gray-700">{act.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Restablecer Filtros */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-650 border border-red-100 rounded-xl text-xs font-black transition-colors cursor-pointer select-none mt-2"
                >
                  <X className="w-4 h-4" />
                  <span>Limpiar Filtros</span>
                </button>
              )}
            </div>
          </aside>

          {/* COLUMNA DERECHA: Buscador superior y resultados reactivos */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Panel de Control de Búsqueda y Visualización */}
            <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-xl shadow-gray-200/40 flex flex-col md:flex-row items-center gap-4">
              
              {/* Input principal de búsqueda */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, servicios o palabras clave..."
                  value={searchQuery}
                  onChange={e => handleSearchChange(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-xs md:text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-brand-magenta focus:bg-white transition-colors font-semibold"
                />
              </div>

              {/* Controles para Móviles y Visualización */}
              <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
                
                {/* Botón para abrir filtros en móvil */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center justify-center gap-2 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold bg-white text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-xs shrink-0 select-none"
                >
                  <Filter className="w-4 h-4 text-brand-magenta" />
                  <span>Filtros</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-brand-magenta text-white text-[10px] font-black flex items-center justify-center leading-none">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Info de resultados encontrados */}
                <div className="text-xs font-bold text-gray-500 whitespace-nowrap px-1">
                  Encontrados: <span className="text-brand-magenta font-black">{filtered.length}</span>
                </div>

                {/* Selector de modo de vista */}
                <div className="flex items-center gap-1 bg-gray-50 border border-gray-150 rounded-2xl p-1 shrink-0">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${viewMode === "grid" ? "bg-white text-brand-magenta shadow-xs font-bold" : "text-gray-400 hover:text-gray-600"}`}
                    title="Vista Cuadrícula"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${viewMode === "list" ? "bg-white text-brand-magenta shadow-xs font-bold" : "text-gray-400 hover:text-gray-600"}`}
                    title="Vista Lista"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filtros Inteligentes (Lote 3) */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl shadow-gray-200/35 text-left space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#00C8D4] flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-800 tracking-tight leading-none">Filtros inteligentes</h3>
                  <span className="text-[10px] text-gray-400 font-semibold mt-1 block">Búsqueda avanzada con procesamiento de lenguaje</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">¿Qué estás buscando?</label>
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Ejemplo: Quiero una posada con piscina, planta eléctrica y pet friendly en Los Roques"
                    value={smartQuery}
                    onChange={(e) => setSmartQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSmartSearch(smartQuery);
                      }
                    }}
                    className="flex-1 bg-gray-50 border border-gray-150 rounded-2xl px-4 py-3 text-xs md:text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-brand-turquesa focus:bg-white transition-all font-semibold"
                  />
                  <button
                    onClick={() => handleSmartSearch(smartQuery)}
                    className="bg-[#00C8D4] hover:bg-[#00b0ba] text-white text-xs font-black px-6 py-3 rounded-2xl transition-all cursor-pointer shadow-md shadow-cyan-400/10 active:scale-98 shrink-0 select-none"
                  >
                    Buscar alojamientos
                  </button>
                </div>
              </div>

              {smartQuery && activeFiltersCount > 0 && (
                <div className="flex items-center flex-wrap gap-2 pt-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Filtro Activo:</span>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-150 text-[#00C8D4] text-[10px] font-black">
                    <span>"{smartQuery}"</span>
                    <button
                      onClick={() => {
                        setSmartQuery("");
                        clearFilters();
                      }}
                      className="hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Listado de Resultados */}
            <div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
                  <p className="text-gray-400 text-xs font-bold">Cargando establecimientos premium...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                  <Compass className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-750 mb-1">No se encontraron establecimientos</h3>
                  <p className="text-gray-450 text-xs max-w-sm mx-auto leading-relaxed">
                    Prueba modificando la búsqueda o quitando los filtros aplicados en el panel izquierdo.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-6 btn-magenta-gradient px-6 py-2.5 rounded-xl text-xs font-bold hover:scale-102 transition-all cursor-pointer shadow-md shadow-brand-magenta/10"
                  >
                    Restablecer Búsqueda
                  </button>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filtered.map((est) => (
                    <EstablishmentCard 
                      key={est.id} 
                      establishment={est} 
                      isComparing={comparedIds.includes(est.id)}
                      onCompareToggle={() => handleCompareToggle(est.id)}
                      isPriority={est.is_featured}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {filtered.map((est) => (
                    <EstablishmentListItem 
                      key={est.id} 
                      establishment={est} 
                      isComparing={comparedIds.includes(est.id)}
                      onCompareToggle={() => handleCompareToggle(est.id)}
                      isPriority={est.is_featured}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Floating Compare Bar */}
      {comparedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-full px-6 py-4 flex items-center gap-6 shadow-2xl text-white max-w-[90vw] md:max-w-max">
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
