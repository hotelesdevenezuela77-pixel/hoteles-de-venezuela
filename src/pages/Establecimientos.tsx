import { useEffect, useState } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { ESTABLISHMENTS_MOCK } from "../lib/establishmentsMock";
import type { Establishment } from "../components/layout/EstablishmentCard";
import { EstablishmentCard, EstablishmentListItem } from "../components/layout/EstablishmentCard";
import { Search, MapPin, ChevronDown, X, Filter, Grid, List, Compass, Loader2 } from "lucide-react";

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
  const [comparedIds, setComparedIds] = useState<number[]>([]);

  // Load compared hotels on mount
  useEffect(() => {
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
  };

  const handleDestinationChange = (slug: string) => {
    setSelectedDestination(slug);
    updateURLParams(selectedCategory, slug, searchQuery);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    updateURLParams(selectedCategory, selectedDestination, val);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedDestination("");
    setSearchQuery("");
    updateURLParams("", "", "");
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

        if (data) {
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
              has_hdv_seal: item.has_hdv_seal || false
            };
          });
          setEstablishments(mapped);
        }
      } catch (err) {
        console.warn("Error consultando Supabase para establecimientos en segundo plano:", err);
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

    return matchesCategory && matchesDestination && matchesQuery;
  });

  const getCategoryName = (slug: string) => categories.find(c => c.slug === slug)?.name || slug;
  const getDestinationName = (slug: string) => destinations.find(d => d.slug === slug)?.name || slug;

  const hasActiveFilters = selectedCategory || selectedDestination || searchQuery;

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden py-16 bg-gradient-to-br from-brand-purple-dark via-brand-purple-deep to-black text-white text-center">
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-brand-magenta/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-brand-turquesa/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-brand-magenta/10 text-brand-magenta border border-brand-magenta/25 mb-4 animate-pulse">
            <Compass className="w-3.5 h-3.5" />
            <span>GUÍA EXCLUSIVA</span>
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Explora Hoteles y <span className="text-gradient-brand">Hospedajes</span>
          </h1>
          <p className="text-gray-300 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
            Descubre los mejores hospedajes, posadas boutique y restaurantes en toda Venezuela. Comunícate directamente con los dueños sin pagar cargos por intermediación.
          </p>
        </div>
      </div>

      {/* Control Panel: Search & Desktop filters */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl shadow-gray-200/40 space-y-4">
          
          {/* Main Search Input */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre del hotel, servicios, palabras clave..."
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-xs md:text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-brand-magenta focus:bg-white transition-colors"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center gap-2 border border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-brand-magenta rounded-full" />
              )}
            </button>
          </div>

          {/* Filters Row */}
          <div className={`pt-2 flex-wrap items-center gap-3 ${showFilters ? "flex" : "hidden md:flex"}`}>
            
            {/* Category Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100/80 border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 transition-all cursor-pointer">
                <span>Categoría: {selectedCategory ? getCategoryName(selectedCategory) : "Todas"}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              
              <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-50 p-2 z-30 min-w-[200px] opacity-0 scale-95 origin-top-left pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200">
                <button
                  onClick={() => handleCategoryChange("")}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-gray-50 font-bold ${!selectedCategory ? "text-brand-magenta bg-magenta-50/10" : "text-gray-500"}`}
                >
                  Todas las categorías
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-gray-50 font-bold ${selectedCategory === cat.slug ? "text-brand-magenta bg-magenta-50/10" : "text-gray-500"}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100/80 border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 transition-all cursor-pointer">
                <MapPin className="w-4 h-4 text-brand-turquesa" />
                <span>Destino: {selectedDestination ? getDestinationName(selectedDestination) : "Todos"}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              
              <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-50 p-2 z-30 min-w-[220px] max-h-60 overflow-y-auto opacity-0 scale-95 origin-top-left pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200">
                <button
                  onClick={() => handleDestinationChange("")}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-gray-50 font-bold ${!selectedDestination ? "text-brand-magenta bg-magenta-50/10" : "text-gray-500"}`}
                >
                  Todos los destinos
                </button>
                {destinations.map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => handleDestinationChange(dest.slug)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-gray-50 font-bold ${selectedDestination === dest.slug ? "text-brand-magenta bg-magenta-50/10" : "text-gray-500"}`}
                  >
                    <span>{dest.name}</span>
                    <span className="text-[10px] text-gray-400 font-normal ml-1.5">{dest.state}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100/80 border border-red-100/50 rounded-2xl text-xs font-black text-red-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Limpiar filtros</span>
              </button>
            )}

            {/* Layout Mode Toggle */}
            <div className="ml-auto hidden md:flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-2xl p-1 shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-xl transition-all cursor-pointer ${viewMode === "grid" ? "bg-white text-brand-magenta shadow-sm font-bold" : "text-gray-400 hover:text-gray-600"}`}
                title="Vista Cuadrícula"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-xl transition-all cursor-pointer ${viewMode === "list" ? "bg-white text-brand-magenta shadow-sm font-bold" : "text-gray-400 hover:text-gray-600"}`}
                title="Vista Lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main Results Body */}
      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-black text-gray-800 tracking-tight flex items-center gap-2">
            <span>Establecimientos</span>
            <span className="bg-brand-magenta/10 text-brand-magenta text-[10px] px-2.5 py-0.5 rounded-full font-black">
              {filtered.length}
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
            <p className="text-gray-400 text-xs font-bold">Cargando establecimientos premium...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <Compass className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-1">No se encontraron establecimientos</h3>
            <p className="text-gray-400 text-xs max-w-sm mx-auto leading-relaxed">
              Prueba modificando la búsqueda o quitando los filtros aplicados.
            </p>
            <button
              onClick={clearFilters}
              className="mt-6 btn-magenta-gradient px-6 py-2.5 rounded-xl text-xs font-bold hover:scale-102 transition-all cursor-pointer shadow-md shadow-brand-magenta/10"
            >
              Restablecer Búsqueda
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((est) => (
              <EstablishmentCard 
                key={est.id} 
                establishment={est} 
                isComparing={comparedIds.includes(est.id)}
                onCompareToggle={() => handleCompareToggle(est.id)}
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
              />
            ))}
          </div>
        )}
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
