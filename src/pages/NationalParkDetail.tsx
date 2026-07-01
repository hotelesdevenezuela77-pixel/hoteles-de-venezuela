import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "wouter";
import { supabase } from "../lib/supabase";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  MapPin, Mountain, Trees, Waves, Bird, Palmtree, ArrowLeft, 
  Calendar, Cloud, Car, Star, Navigation, Loader2,
  ChevronRight, Compass, Info, Heart
} from "lucide-react";
import { NATIONAL_PARKS_MOCK, type NationalPark } from "../lib/nationalParksMock";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  mountain: Mountain,
  tree: Trees,
  waves: Waves,
  bird: Bird,
  palm: Palmtree,
};

export function NationalParkDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [park, setPark] = useState<NationalPark | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Referencias para el mapa satelital incrustado
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    async function fetchPark() {
      if (!slug) return;
      try {
        setLoading(true);
        const { data, error: fetchErr } = await supabase
          .from("national_parks")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (fetchErr) throw fetchErr;

        if (data) {
          const mapped: NationalPark = {
            id: data.id,
            name: data.name,
            slug: data.slug,
            short_description: data.short_description || "",
            long_description: data.long_description || "",
            image_url: data.image_url || "",
            destination_name: data.destination_name || "Venezuela",
            icon_type: (data.icon_type as any) || "mountain",
            highlights: data.highlights || "",
            latitude: data.latitude || "0",
            longitude: data.longitude || "0",
            area: data.area || "",
            climate: data.climate || "",
            how_to_get_there: data.how_to_get_there || "",
            best_time_to_visit: data.best_time_to_visit || "",
            is_featured: data.is_featured || false
          };
          setPark(mapped);
        } else {
          // Fallback a mock local
          const localPark = NATIONAL_PARKS_MOCK.find(p => p.slug === slug);
          if (localPark) {
            setPark(localPark);
          } else {
            setError("Parque no encontrado");
          }
        }
      } catch (err: any) {
        console.warn("Error consultando Supabase para detalle del parque, usando mock local:", err);
        const localPark = NATIONAL_PARKS_MOCK.find(p => p.slug === slug);
        if (localPark) {
          setPark(localPark);
        } else {
          setError(err.message || "Error al cargar la información del parque");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchPark();
  }, [slug]);

  // Inicialización del mapa satelital en la ficha
  useEffect(() => {
    if (loading || !park || !mapContainerRef.current || mapInstanceRef.current) return;

    const lat = parseFloat(park.latitude);
    const lon = parseFloat(park.longitude);

    if (isNaN(lat) || isNaN(lon)) return;

    // Crear mapa
    const map = L.map(mapContainerRef.current, {
      center: [lat, lon],
      zoom: 11,
      zoomControl: true,
      scrollWheelZoom: false // Evitar scroll molesto al bajar la página
    });

    // Capa Satelital de Esri
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri &mdash; Source: Esri"
    }).addTo(map);

    // Superposición de etiquetas y caminos
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}").addTo(map);

    // Icono personalizado
    const markerIcon = L.divIcon({
      className: "custom-park-detail-marker-div",
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: #10b981;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: white;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    L.marker([lat, lon], { icon: markerIcon }).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading, park]);

  const getHighlightsArray = (highlightsStr: string): string[] => {
    if (!highlightsStr) return [];
    return highlightsStr.split(",").map(h => h.trim()).filter(Boolean);
  };

  const openGoogleMaps = () => {
    if (!park) return;
    const lat = parseFloat(park.latitude);
    const lon = parseFloat(park.longitude);
    if (!isNaN(lat) && !isNaN(lon)) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-gray-400 text-xs font-bold">Cargando detalles del parque nacional...</p>
      </div>
    );
  }

  if (error || !park) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <Mountain className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Parque no encontrado</h2>
        <p className="text-gray-400 text-xs mt-1 max-w-xs leading-normal">
          {error || "La reserva silvestre que buscas no está registrada en nuestro sistema."}
        </p>
        <Link href="/parques">
          <button className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Parques</span>
          </button>
        </Link>
      </div>
    );
  }

  const IconComponent = iconMap[park.icon_type] || Mountain;
  const highlights = getHighlightsArray(park.highlights);

  return (
    <div className="min-h-screen bg-gray-50/20 pb-20">
      
      {/* Banner / Hero Section */}
      <section className="relative h-[45vh] md:h-[55vh] overflow-hidden bg-gray-900">
        <img 
          src={park.image_url} 
          alt={park.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Breadcrumb Nav */}
        <div className="absolute top-8 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-6">
            <nav className="flex items-center gap-1.5 text-white/75 text-[11px] font-bold">
              <Link href="/" className="hover:text-white transition-colors cursor-pointer">Inicio</Link>
              <ChevronRight className="w-3.5 h-3.5 text-white/50" />
              <Link href="/parques" className="hover:text-white transition-colors cursor-pointer">Parques Nacionales</Link>
              <ChevronRight className="w-3.5 h-3.5 text-white/50" />
              <span className="text-emerald-300">{park.name}</span>
            </nav>
          </div>
        </div>
        
        {/* Title / Badges content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-7xl mx-auto text-left">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider rounded-lg shadow-md">
                <IconComponent className="w-3.5 h-3.5 shrink-0" />
                <span>Parque Nacional</span>
              </span>
              {park.is_featured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider rounded-lg shadow-md">
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>Destacado</span>
                </span>
              )}
              {park.area && (
                <span className="px-3 py-1 bg-white/20 text-white text-[10px] font-bold rounded-lg backdrop-blur-sm">
                  Área: {park.area}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md mb-2">
              {park.name}
            </h1>
            
            {park.destination_name && (
              <div className="flex items-center gap-1.5 text-white/85 text-sm font-semibold">
                <MapPin className="w-4.5 h-4.5 text-emerald-400" />
                <span>{park.destination_name}, Venezuela</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Central Column */}
          <div className="lg:col-span-2 space-y-8 text-left">
            
            {/* Description Card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-black text-gray-800 tracking-tight mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-500" />
                <span>Información General</span>
              </h2>
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed whitespace-pre-line">
                {park.long_description || park.short_description}
              </p>
            </div>

            {/* Highlights Card */}
            {highlights.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
                <h2 className="text-lg font-black text-gray-800 tracking-tight mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span>Atractivos y Puntos Destacados</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {highlights.map((highlight, idx) => (
                    <span 
                      key={idx}
                      className="px-4 py-2 bg-emerald-50 border border-emerald-100/30 text-emerald-700 text-xs font-bold rounded-xl shadow-sm"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Satellite Map Card */}
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-black text-gray-800 tracking-tight flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-500" />
                  <span>Geolocalización Satelital</span>
                </h2>
                <span className="text-[10px] text-gray-400 font-mono">
                  {parseFloat(park.latitude).toFixed(4)}° N, {Math.abs(parseFloat(park.longitude)).toFixed(4)}° W
                </span>
              </div>
              
              {/* Map container */}
              <div className="h-[350px] relative z-10">
                <div 
                  ref={mapContainerRef} 
                  className="w-full h-full absolute inset-0 bg-gray-100"
                />
              </div>

              <div className="p-4 bg-gray-50/50 flex justify-end">
                <button
                  onClick={openGoogleMaps}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-all"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Abrir en Google Maps</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6 text-left">
            
            {/* Quick Info Box */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-gray-800 tracking-wide uppercase">Ficha Técnica</h3>
              <div className="divide-y divide-gray-100">
                
                {park.climate && (
                  <div className="py-3 flex items-start gap-3">
                    <Cloud className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Clima</p>
                      <p className="text-xs text-gray-600 font-semibold mt-0.5">{park.climate}</p>
                    </div>
                  </div>
                )}

                {park.best_time_to_visit && (
                  <div className="py-3 flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Mejor Época de Visita</p>
                      <p className="text-xs text-gray-600 font-semibold mt-0.5">{park.best_time_to_visit}</p>
                    </div>
                  </div>
                )}

                {park.how_to_get_there && (
                  <div className="py-3 flex items-start gap-3">
                    <Car className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Cómo Llegar</p>
                      <p className="text-xs text-gray-600 font-semibold mt-0.5">{park.how_to_get_there}</p>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Travel CTA Box */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 shadow-md text-white space-y-4">
              <div>
                <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                  <Compass className="w-5 h-5 text-emerald-300" />
                  <span>¿Estás planeando tu viaje?</span>
                </h3>
                <p className="text-white/80 text-[11px] leading-relaxed mt-2">
                  Encuentra los mejores hospedajes premium, posadas ecológicas y paquetes turísticos de aventuras cercanos a este parque nacional.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <Link href={`/establecimientos?destination=${encodeURIComponent(park.destination_name || '')}`}>
                  <button className="w-full text-center px-4 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors text-xs cursor-pointer shadow-sm">
                    Buscar Hospedaje Cercano
                  </button>
                </Link>
                <Link href="/servicios-b2b">
                  <button className="w-full text-center px-4 py-3 bg-emerald-500 text-white border border-emerald-400/50 font-bold rounded-xl hover:bg-emerald-400 transition-colors text-xs cursor-pointer">
                    Ver Excursiones y Tours
                  </button>
                </Link>
              </div>
            </div>

            {/* Back to Parks Link */}
            <Link href="/parques">
              <button className="w-full flex items-center justify-center gap-1.5 px-4 py-3.5 bg-gray-100 hover:bg-gray-200/80 text-gray-600 font-bold text-xs rounded-2xl border border-gray-200 transition-all cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a Parques Nacionales</span>
              </button>
            </Link>

          </div>

        </div>
      </main>

    </div>
  );
}
