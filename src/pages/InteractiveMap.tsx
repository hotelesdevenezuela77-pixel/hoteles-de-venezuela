import { useEffect, useState, useRef, useMemo } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin, Hotel, Utensils, Coffee, Plane, Car, Waves,
  Mountain, TreePine, Tent, Building2, Phone, Star,
  ExternalLink, X, Compass, Filter, Search, Loader2, Sparkles
} from "lucide-react";
import { TrackedWhatsAppButton } from "../components/layout/TrackedWhatsAppButton";
import { ESTABLISHMENTS_MOCK } from "../lib/establishmentsMock";

interface Establishment {
  id: number;
  slug: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  whatsapp: string;
  website: string;
  category_name?: string;
  category_slug?: string;
  destination_name?: string;
  destination_slug?: string;
  primary_image?: string;
  rating_avg: number;
  review_count: number;
  price_level: string;
  is_featured: boolean;
  services: string;
  membership_tier: string;
  has_hdv_seal?: boolean;
  latitude: number | null;
  longitude: number | null;
  dest_latitude?: number | null;
  dest_longitude?: number | null;
}

interface CategoryFilterOption {
  slug: string;
  name: string;
}

interface DestinationFilterOption {
  slug: string;
  name: string;
  state: string;
}

// Centro por defecto de Venezuela
const VENEZUELA_CENTER: [number, number] = [7.5, -66.0];
const VENEZUELA_ZOOM = 6;

// Coordenadas por defecto para destinos si no tienen GPS exacto
const DESTINATION_COORDS_FALLBACK: Record<string, [number, number]> = {
  "Margarita": [10.9577, -63.8697],
  "Los Roques": [11.8549, -66.7593],
  "Caracas": [10.4806, -66.9036],
  "Mérida": [8.5897, -71.1561],
  "Canaima": [6.2442, -62.8544],
  "Morrocoy": [10.8667, -68.2333],
  "Choroní": [10.5069, -67.6167],
  "Puerto La Cruz": [10.2137, -64.6297],
  "Maracaibo": [10.6666, -71.6125],
  "Valencia": [10.1579, -67.9972],
  "Barquisimeto": [10.0678, -69.3472],
  "Tucacas": [10.7928, -68.3169],
  "La Guaira": [10.6031, -66.9344],
  "Colonia Tovar": [10.4089, -67.2875],
  "Punto Fijo": [11.6917, -70.1950],
  "Cumaná": [10.4564, -64.1675],
  "Ciudad Bolívar": [8.1286, -63.5361],
  "Gran Sabana": [5.1000, -61.0000],
  "Barinas": [8.6226, -70.2074],
  "Apure": [7.8833, -67.4667],
  "Amazonas": [3.4167, -65.8333],
  "Lechería": [10.1833, -64.6833],
  "Higuerote": [10.4833, -66.0833]
};

// Configuración de iconos de categorías
const CATEGORY_CONFIG: Record<string, { icon: React.ComponentType<any>; color: string; bgColor: string; label: string }> = {
  "hoteles": { icon: Hotel, color: "#d946ef", bgColor: "bg-fuchsia-500", label: "Hoteles" },
  "posadas": { icon: Building2, color: "#06b6d4", bgColor: "bg-cyan-500", label: "Posadas" },
  "restaurantes": { icon: Utensils, color: "#f59e0b", bgColor: "bg-amber-500", label: "Restaurantes" },
  "cafes": { icon: Coffee, color: "#fb923c", bgColor: "bg-orange-400", label: "Cafés" },
  "agencias-de-viajes": { icon: Plane, color: "#3b82f6", bgColor: "bg-blue-500", label: "Agencias" },
  "rent-a-car": { icon: Car, color: "#22c55e", bgColor: "bg-green-500", label: "Alquiler de Carros" },
  "playas": { icon: Waves, color: "#38bdf8", bgColor: "bg-sky-400", label: "Playas" },
  "montanas": { icon: Mountain, color: "#059669", bgColor: "bg-emerald-600", label: "Montañas" },
  "resorts": { icon: TreePine, color: "#ec4899", bgColor: "bg-pink-500", label: "Resorts" },
  "campamentos": { icon: Tent, color: "#84cc16", bgColor: "bg-lime-500", label: "Campamentos" }
};

const DEFAULT_CONFIG = { icon: MapPin, color: "#8b5cf6", bgColor: "bg-violet-500", label: "Establecimiento" };

// Crear marcador DivIcon de Leaflet
const createMarkerIcon = (color: string) => {
  return L.divIcon({
    className: "custom-marker-div",
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 3px 8px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

export function InteractiveMap() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [categories, setCategories] = useState<CategoryFilterOption[]>([]);
  const [destinations, setDestinations] = useState<DestinationFilterOption[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados de Filtros
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterDestination, setFilterDestination] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Selección de negocio
  const [selectedEst, setSelectedEst] = useState<Establishment | null>(null);

  // Referencias del Mapa Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  const isInitialCenteringDone = useRef(false);

  // Fetch inicial
  useEffect(() => {
    async function fetchMapData() {
      try {
        // 1. Fetch Categories & Destinations
        const [catsRes, destsRes, estsRes] = await Promise.all([
          supabase.from("categories").select("slug, name").order("name"),
          supabase.from("destinations").select("slug, name, state").order("name"),
          supabase.from("establishments")
            .select(`
              *,
              categories (name, slug),
              destinations (name, slug, state, latitude, longitude),
              establishment_images (image_url, is_primary)
            `)
            .eq("status", "approved")
        ]);

        if (catsRes.data && catsRes.data.length > 0) setCategories(catsRes.data);
        if (destsRes.data && destsRes.data.length > 0) setDestinations(destsRes.data);

        if (estsRes.data) {
          const mapped: Establishment[] = estsRes.data.map((item: any) => {
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
              latitude: item.latitude,
              longitude: item.longitude,
              dest_latitude: item.destinations?.latitude,
              dest_longitude: item.destinations?.longitude
            };
          });
          setEstablishments(mapped);
        }
      } catch (err) {
        console.error("Error loading map data from Supabase in background:", err);
      }
    }
    fetchMapData();
  }, []);

  // Inicializar Mapa
  useEffect(() => {
    if (loading || !mapContainerRef.current || mapInstanceRef.current) return;

    // Crear mapa
    const map = L.map(mapContainerRef.current, {
      center: VENEZUELA_CENTER,
      zoom: VENEZUELA_ZOOM,
      zoomControl: true
    });

    // Agregar capa OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Crear grupo para marcadores
    const markersGroup = L.featureGroup().addTo(map);

    mapInstanceRef.current = map;
    markersGroupRef.current = markersGroup;

    // Destructor
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, [loading]);

  // Obtener coordenadas de un establecimiento con dispersión
  const getCoordinates = (est: Establishment): [number, number] | null => {
    if (est.latitude && est.longitude) {
      return [est.latitude, est.longitude];
    }
    
    // Fallback 1: Coordenadas del destino desde base de datos
    if (est.dest_latitude && est.dest_longitude) {
      return [
        est.dest_latitude + (Math.random() - 0.5) * 0.04,
        est.dest_longitude + (Math.random() - 0.5) * 0.04
      ];
    }

    // Fallback 2: Coordenadas locales hardcoded
    if (est.destination_name) {
      const fallback = DESTINATION_COORDS_FALLBACK[est.destination_name];
      if (fallback) {
        return [
          fallback[0] + (Math.random() - 0.5) * 0.04,
          fallback[1] + (Math.random() - 0.5) * 0.04
        ];
      }
    }

    return null;
  };

  const getCategoryConfig = (slug?: string) => {
    if (!slug) return DEFAULT_CONFIG;
    return CATEGORY_CONFIG[slug] || DEFAULT_CONFIG;
  };

  // Fallback para categorías y destinos extraídos dinámicamente si la BD no los tiene
  const finalCategories = useMemo(() => {
    if (categories.length > 0) return categories;
    const unique = new Map<string, string>();
    establishments.forEach(est => {
      if (est.category_slug && est.category_name) {
        unique.set(est.category_slug, est.category_name);
      }
    });
    return Array.from(unique.entries()).map(([slug, name]) => ({ slug, name }));
  }, [categories, establishments]);

  const finalDestinations = useMemo(() => {
    if (destinations.length > 0) return destinations;
    const unique = new Map<string, { name: string; state: string }>();
    establishments.forEach(est => {
      if (est.destination_slug && est.destination_name) {
        unique.set(est.destination_slug, { 
          name: est.destination_name, 
          state: est.address ? est.address.split(",").pop()?.trim() || "" : ""
        });
      }
    });
    return Array.from(unique.entries()).map(([slug, data]) => ({ slug, name: data.name, state: data.state }));
  }, [destinations, establishments]);

  // Filtrado de establecimientos en memoria
  const filteredEstablishments = useMemo(() => {
    return establishments.filter(est => {
      const matchesCategory = filterCategory === "all" || est.category_slug === filterCategory;
      const matchesDestination = filterDestination === "all" || est.destination_slug === filterDestination;
      
      const query = searchQuery.toLowerCase();
      const matchesQuery = !query || 
        est.name.toLowerCase().includes(query) ||
        est.description.toLowerCase().includes(query) ||
        est.address.toLowerCase().includes(query) ||
        est.destination_name?.toLowerCase().includes(query);

      return matchesCategory && matchesDestination && matchesQuery;
    });
  }, [establishments, filterCategory, filterDestination, searchQuery]);

  // Actualizar marcadores en el mapa al cambiar los datos filtrados
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    // Limpiar marcadores anteriores
    markersGroup.clearLayers();

    const validCoordinatesList: L.LatLng[] = [];

    // Dibujar nuevos marcadores
    filteredEstablishments.forEach(est => {
      const coords = getCoordinates(est);
      if (!coords) return;

      const conf = getCategoryConfig(est.category_slug);
      const markerIcon = createMarkerIcon(conf.color);

      const marker = L.marker(coords, { icon: markerIcon });
      
      // Popup simple en hover/click
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
          <h4 style="font-weight: 800; font-size: 12px; margin: 0 0 4px 0; color: #1f2937;">${est.name}</h4>
          <p style="margin: 0 0 2px 0; color: ${conf.color}; font-weight: bold; text-transform: uppercase; font-size: 9px;">
            ${est.category_name}
          </p>
          <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 10px;">
            📍 ${est.destination_name || "Venezuela"}
          </p>
          <a href="/establecimiento/${est.slug}" 
             style="display: block; text-align: center; background: #FF0096; color: white; padding: 4px 8px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 10px;">
             Ver Detalles
          </a>
        </div>
      `);

      // Evento de clic en marcador abre la ficha lateral
      marker.on("click", () => {
        setSelectedEst(est);
      });

      markersGroup.addLayer(marker);
      validCoordinatesList.push(L.latLng(coords[0], coords[1]));
    });

    // Ajustar límites de cámara si hay marcadores
    if (validCoordinatesList.length > 0) {
      const bounds = L.latLngBounds(validCoordinatesList);
      
      // Si es el primer renderizado, centramos. O si se cambiaron los filtros.
      if (!isInitialCenteringDone.current) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
        isInitialCenteringDone.current = true;
      } else if (filterCategory !== "all" || filterDestination !== "all" || searchQuery !== "") {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12, animate: true });
      }
    } else {
      // Si no hay resultados, volver al centro de Venezuela
      map.setView(VENEZUELA_CENTER, VENEZUELA_ZOOM);
    }
  }, [filteredEstablishments]);

  // Selección de establecimiento desde la lista lateral
  const handleEstSelectFromList = (est: Establishment) => {
    setSelectedEst(est);
    const coords = getCoordinates(est);
    const map = mapInstanceRef.current;
    if (coords && map) {
      map.setView(coords, 14, { animate: true });
      
      // Buscar marcador correspondiente para abrir su popup
      if (markersGroupRef.current) {
        markersGroupRef.current.eachLayer((layer: any) => {
          const markerLatLng = layer.getLatLng();
          if (Math.abs(markerLatLng.lat - coords[0]) < 0.0001 && Math.abs(markerLatLng.lng - coords[1]) < 0.0001) {
            layer.openPopup();
          }
        });
      }
    }
  };

  const hasActiveFilters = filterCategory !== "all" || filterDestination !== "all" || searchQuery !== "";

  const resetFilters = () => {
    setFilterCategory("all");
    setFilterDestination("all");
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-3 bg-gray-50/20">
        <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
        <p className="text-gray-400 text-xs font-bold">Iniciando mapa interactivo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/20 flex flex-col">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden py-10 bg-gradient-to-br from-brand-purple-dark via-brand-purple-deep to-black text-white text-center">
        <div className="absolute top-0 left-1/4 w-[400px] h-[200px] bg-brand-magenta/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-brand-turquesa/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-brand-magenta/20 text-brand-magenta border border-brand-magenta/30 mb-2 animate-pulse">
            <Compass className="w-3.5 h-3.5" />
            <span>MAPA INTERACTIVO</span>
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
            Explora Venezuela Visualmente
          </h1>
          <p className="text-gray-300 text-[11px] max-w-xl mx-auto leading-relaxed">
            Localiza hoteles, posadas y restaurantes directamente en el mapa. Selecciona los marcadores para ver la información de contacto y realizar tus reservas.
          </p>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="max-w-7xl mx-auto w-full px-6 -mt-6 relative z-20">
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xl shadow-gray-200/30 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-3 text-gray-400 w-4.5 h-4.5" />
            <input
              type="text"
              placeholder="Buscar hotel, posada, destino..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-gray-700 outline-none focus:border-brand-magenta focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
            
            {/* Category Dropdown */}
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-magenta/10 cursor-pointer"
            >
              <option value="all">Todas las Categorías</option>
              {finalCategories.map(c => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>

            {/* Destination Dropdown */}
            <select
              value={filterDestination}
              onChange={e => setFilterDestination(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-magenta/10 cursor-pointer"
            >
              <option value="all">Todos los Destinos</option>
              {finalDestinations.map(d => (
                <option key={d.slug} value={d.slug}>{d.name} ({d.state})</option>
              ))}
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-4 py-2.5 bg-red-50 border border-red-100 text-red-600 text-xs font-black rounded-2xl hover:bg-red-100/50 cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            )}

            {/* Mobile Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center p-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-600"
            >
              <Filter className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Map Container */}
        <div className="lg:col-span-2 order-2 lg:order-1 flex flex-col">
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-md flex-1 min-h-[450px] md:min-h-[550px] relative z-10 flex flex-col">
            
            {/* Map Header */}
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-magenta" />
                <span className="text-xs font-bold text-gray-700">Mapa Georreferenciado</span>
              </div>
              <span className="text-[10px] bg-brand-turquesa/10 text-brand-turquesa px-2 py-0.5 rounded-full font-black">
                {filteredEstablishments.length} negocios en mapa
              </span>
            </div>

            {/* Div del Mapa Leaflet */}
            <div 
              ref={mapContainerRef} 
              className="flex-1 w-full"
              style={{ minHeight: "400px" }}
            />
          </div>
        </div>

        {/* Right Sidebar Detail / List */}
        <div className="order-1 lg:order-2 flex flex-col">
          
          {/* Card Detalle de Establecimiento Seleccionado */}
          {selectedEst ? (
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-lg sticky top-20 flex flex-col animate-in slide-in-from-right-4 duration-200">
              
              {/* Card Photo / Icon header */}
              {selectedEst.primary_image ? (
                <div className="relative h-44 bg-gray-100 shrink-0">
                  <img 
                    src={selectedEst.primary_image} 
                    alt={selectedEst.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  <button 
                    onClick={() => setSelectedEst(null)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 shadow-md hover:bg-white active:scale-95 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-black text-white text-lg leading-tight drop-shadow-md">{selectedEst.name}</h3>
                  </div>
                </div>
              ) : (
                <div 
                  className="px-5 py-5 text-white relative flex items-center gap-3 shrink-0" 
                  style={{ background: `linear-gradient(135deg, ${getCategoryConfig(selectedEst.category_slug).color}, #00C8D4)` }}
                >
                  <button 
                    onClick={() => setSelectedEst(null)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white active:scale-95 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                    {(() => {
                      const Icon = getCategoryConfig(selectedEst.category_slug).icon;
                      return <Icon className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="font-black text-sm">{selectedEst.name}</h3>
                    <p className="text-[10px] text-white/75 font-semibold uppercase tracking-wider">{selectedEst.category_name}</p>
                  </div>
                </div>
              )}

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  
                  {/* Badges row */}
                  <div className="flex flex-wrap gap-2">
                    <span 
                      className="px-2.5 py-0.5 text-white text-[9px] font-black uppercase tracking-wider rounded-full"
                      style={{ backgroundColor: getCategoryConfig(selectedEst.category_slug).color }}
                    >
                      {selectedEst.category_name}
                    </span>
                    <span className="px-2.5 py-0.5 bg-gray-50 border border-gray-100 text-gray-500 text-[9px] font-bold rounded-full flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-brand-turquesa" />
                      {selectedEst.destination_name || "Venezuela"}
                    </span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded-lg">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-black">{selectedEst.rating_avg > 0 ? selectedEst.rating_avg.toFixed(1) : "Nuevo"}</span>
                    </div>
                    {selectedEst.review_count > 0 && (
                      <span className="text-[10px] text-gray-400 font-bold">({selectedEst.review_count} opiniones)</span>
                    )}
                  </div>

                  {/* Description */}
                  {selectedEst.description && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                      {selectedEst.description}
                    </p>
                  )}
                </div>

                {/* Contact & Link Actions */}
                <div className="pt-4 border-t border-gray-100 space-y-2.5">
                  <div className="flex gap-2">
                    {(selectedEst.whatsapp || selectedEst.phone) ? (
                      <div className="flex-1">
                        <TrackedWhatsAppButton 
                          whatsappNumber={selectedEst.whatsapp || selectedEst.phone}
                          establishmentId={selectedEst.id}
                          establishmentName={selectedEst.name}
                        />
                      </div>
                    ) : null}

                    <Link href={`/establecimiento/${selectedEst.slug}`} className="flex-1">
                      <button className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer">
                        <span>Ver Ficha</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            // Listado de Negocios en Vista Lateral
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-md flex-1 flex flex-col max-h-[550px] sticky top-20">
              
              {/* List Header */}
              <div className="bg-gradient-to-r from-brand-purple-dark to-brand-purple-deep px-5 py-4 text-white shrink-0">
                <h3 className="font-extrabold text-sm tracking-wide">Lista de Establecimientos</h3>
                <p className="text-[10px] text-white/70 mt-0.5">
                  {filteredEstablishments.length > 0 
                    ? "Haz clic en uno para centrarlo en el mapa"
                    : "No se encontraron resultados para tu búsqueda"
                  }
                </p>
              </div>

              {/* List Body */}
              <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
                {filteredEstablishments.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <Compass className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-xs">No hay hospedajes coincidentes. Intenta remover filtros.</p>
                  </div>
                ) : (
                  filteredEstablishments.slice(0, 30).map(est => {
                    const conf = getCategoryConfig(est.category_slug);
                    const CategoryIcon = conf.icon;

                    return (
                      <button
                        key={est.id}
                        onClick={() => handleEstSelectFromList(est)}
                        className="w-full px-5 py-3.5 text-left hover:bg-gray-50/50 flex items-start gap-3 transition-colors border-none bg-transparent cursor-pointer group"
                      >
                        <div 
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: conf.color }}
                        >
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-gray-800 text-xs truncate group-hover:text-brand-magenta transition-colors">
                            {est.name}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-semibold block truncate mt-0.5">
                            📍 {est.destination_name || "Venezuela"}
                          </span>
                        </div>
                        {est.rating_avg > 0 && (
                          <div className="flex items-center gap-0.5 text-amber-500 shrink-0 self-center bg-amber-50/50 px-1.5 py-0.5 rounded border border-amber-100/50">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-[10px] font-black">{est.rating_avg.toFixed(1)}</span>
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
                {filteredEstablishments.length > 30 && (
                  <p className="text-center text-[10px] text-gray-400 font-bold py-3 bg-gray-50/20">
                    + {filteredEstablishments.length - 30} establecimientos más
                  </p>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
