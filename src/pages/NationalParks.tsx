import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Search, MapPin, Mountain, Trees, Waves, Bird, Palmtree, 
  X, Navigation, ExternalLink, Loader2, Compass, Star 
} from "lucide-react";
import { NATIONAL_PARKS_MOCK, type NationalPark } from "../lib/nationalParksMock";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  mountain: Mountain,
  tree: Trees,
  waves: Waves,
  bird: Bird,
  palm: Palmtree,
};

export function NationalParks() {
  const [parks, setParks] = useState<NationalPark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParkForMap, setSelectedParkForMap] = useState<NationalPark | null>(null);

  // Referencias para el mapa modal
  const modalMapContainerRef = useRef<HTMLDivElement>(null);
  const modalMapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    async function fetchParks() {
      try {
        setLoading(true);
        const { data, error: fetchErr } = await supabase
          .from("national_parks")
          .select("*")
          .order("name");

        if (fetchErr) throw fetchErr;

        if (data && data.length > 0) {
          const mapped: NationalPark[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            short_description: item.short_description || "",
            long_description: item.long_description || "",
            image_url: item.image_url || "",
            destination_name: item.destination_name || "Venezuela",
            icon_type: (item.icon_type as any) || "mountain",
            highlights: item.highlights || "",
            latitude: item.latitude || "0",
            longitude: item.longitude || "0",
            area: item.area || "",
            climate: item.climate || "",
            how_to_get_there: item.how_to_get_there || "",
            best_time_to_visit: item.best_time_to_visit || "",
            is_featured: item.is_featured || false
          }));
          setParks(mapped);
        } else {
          setParks(NATIONAL_PARKS_MOCK);
        }
      } catch (err) {
        console.warn("Error consultando Supabase para parques nacionales, usando mock local:", err);
        setParks(NATIONAL_PARKS_MOCK);
      } finally {
        setLoading(false);
      }
    }
    fetchParks();
  }, []);

  // Inicialización del mapa satelital del modal
  useEffect(() => {
    if (!selectedParkForMap || !modalMapContainerRef.current) return;

    const timer = setTimeout(() => {
      if (!modalMapContainerRef.current) return;

      const lat = parseFloat(selectedParkForMap.latitude);
      const lon = parseFloat(selectedParkForMap.longitude);

      if (isNaN(lat) || isNaN(lon)) return;

      // Crear mapa
      const map = L.map(modalMapContainerRef.current, {
        center: [lat, lon],
        zoom: 11,
        zoomControl: true
      });

      // Capa Satelital de Esri
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS, and the GIS User Community"
      }).addTo(map);

      // Superposición de etiquetas y fronteras
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}").addTo(map);

      // Icono personalizado verde para parques
      const markerIcon = L.divIcon({
        className: "custom-park-marker-div",
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
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      // Agregar marcador
      L.marker([lat, lon], { icon: markerIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 11px; padding: 2px; text-align: center;">
            <strong style="font-size:12px; display:block; margin-bottom: 2px;">${selectedParkForMap.name}</strong>
            <span style="color:#6b7280;">${selectedParkForMap.destination_name}</span>
          </div>
        `)
        .openPopup();

      modalMapInstanceRef.current = map;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (modalMapInstanceRef.current) {
        modalMapInstanceRef.current.remove();
        modalMapInstanceRef.current = null;
      }
    };
  }, [selectedParkForMap]);

  const filteredParks = parks.filter(park => 
    park.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    park.destination_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    park.short_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getHighlightsArray = (highlightsStr: string): string[] => {
    if (!highlightsStr) return [];
    return highlightsStr.split(",").map(h => h.trim()).filter(Boolean);
  };

  const openGoogleMaps = (parkItem: NationalPark) => {
    const lat = parseFloat(parkItem.latitude);
    const lon = parseFloat(parkItem.longitude);
    if (!isNaN(lat) && !isNaN(lon)) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/20 pb-20">
      
      {/* Map Modal */}
      {selectedParkForMap && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
              <div>
                <h3 className="text-lg font-black tracking-tight">{selectedParkForMap.name}</h3>
                <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-200" />
                  <span>{selectedParkForMap.destination_name} • {selectedParkForMap.area}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedParkForMap(null)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Map Container */}
            <div className="flex-1 min-h-[350px] md:min-h-[450px] relative">
              <div 
                ref={modalMapContainerRef} 
                className="w-full h-full absolute inset-0"
              />
            </div>
            
            {/* Modal Footer */}
            <div className="p-5 bg-gray-50 border-t flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-gray-500">
              <div>
                <span className="font-bold text-gray-400">Coordenadas: </span> 
                {parseFloat(selectedParkForMap.latitude).toFixed(4)}°N, {Math.abs(parseFloat(selectedParkForMap.longitude)).toFixed(4)}°W
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={() => openGoogleMaps(selectedParkForMap)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold transition-all text-xs cursor-pointer shadow-sm shadow-emerald-700/10"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Google Maps</span>
                </button>
                <Link
                  href={`/parque/${selectedParkForMap.slug}`}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-bold transition-all text-xs cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver Ficha Completa</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 bg-gradient-to-br from-emerald-800 via-teal-700 to-cyan-900 text-white text-center">
        {/* Bottom white fade overlay to blend with the white page background */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none z-10" />

        <div className="absolute top-0 left-1/4 w-[400px] h-[200px] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-cyan-400/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-4 animate-pulse">
            <Mountain className="w-3.5 h-3.5" />
            <span>PATRIMONIO NATURAL</span>
          </span>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Parques Nacionales de <span className="text-emerald-300">Venezuela</span>
          </h1>
          <p className="text-gray-200 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed mb-8">
            Descubre la majestuosidad de nuestra geografía: desde playas de coral cristalinas y densos manglares costeros, hasta selvas misteriosas bordeadas de tepuyes y picos andinos con nieves perpetuas.
          </p>
          
          {/* Search */}
          <div className="max-w-xl mx-auto relative z-20">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar parque nacional por nombre, ubicación, atractivos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-xs md:text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-emerald-50/50 border-b border-emerald-100/30 text-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-black text-emerald-600">43</p>
              <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">Parques Nacionales</p>
            </div>
            <div className="text-center border-l border-gray-100">
              <p className="text-3xl font-black text-teal-600">15%</p>
              <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">del Territorio Nacional</p>
            </div>
            <div className="text-center border-l border-gray-100">
              <p className="text-3xl font-black text-cyan-600">1,300+</p>
              <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">Especies de Aves</p>
            </div>
            <div className="text-center border-l border-gray-100">
              <p className="text-3xl font-black text-emerald-600">21,000+</p>
              <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">Especies de Plantas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Parks Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-xl font-black text-gray-800 tracking-tight">
                Explorar Santuarios Naturales
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {filteredParks.length} áreas silvestres encontradas
              </p>
            </div>
          </div>

          {filteredParks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
              <Mountain className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-700">No se encontraron parques</h3>
              <p className="text-gray-400 text-xs mt-1">Prueba ingresando otro término de búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredParks.map((park) => {
                const IconComponent = iconMap[park.icon_type] || Mountain;
                const highlights = getHighlightsArray(park.highlights);
                return (
                  <div 
                    key={park.id}
                    className="group bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Photo Section */}
                      <Link 
                        href={`/parque/${park.slug}`}
                        className="block relative h-52 overflow-hidden bg-gray-100"
                      >
                        <img 
                          src={park.image_url} 
                          alt={park.name}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                        
                        <div className="absolute top-4 left-4 flex gap-1.5 items-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider rounded-lg shadow-md">
                            <IconComponent className="w-3.5 h-3.5 shrink-0" />
                            <span>Parque Nacional</span>
                          </span>
                          {park.is_featured && (
                            <span className="inline-flex items-center gap-0.5 px-2.5 py-1 bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider rounded-lg shadow-md">
                              <Star className="w-3 h-3 fill-white" />
                              <span>Destacado</span>
                            </span>
                          )}
                        </div>
                        
                        {park.area && (
                          <span className="absolute top-4 right-4 px-2 py-0.5 bg-black/40 text-white text-[10px] font-bold rounded-lg backdrop-blur-sm">
                            {park.area}
                          </span>
                        )}

                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-lg font-black text-white leading-tight mb-1 group-hover:text-emerald-300 transition-colors">
                            {park.name}
                          </h3>
                          <div className="flex items-center gap-1 text-white/90 text-xs font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{park.destination_name}</span>
                          </div>
                        </div>
                      </Link>

                      {/* Content Section */}
                      <div className="p-5 space-y-4 text-left">
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                          {park.short_description}
                        </p>
                        
                        {highlights.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {highlights.slice(0, 3).map((highlight, idx) => (
                              <span 
                                key={idx}
                                className="px-2.5 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 text-[10px] rounded-full font-medium"
                              >
                                {highlight}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-5 pb-5">
                      <div className="flex gap-2.5 pt-4 border-t border-gray-50">
                        <button
                          onClick={() => setSelectedParkForMap(park)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-600/95 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Mapa Satelital</span>
                        </button>
                        <Link
                          href={`/parque/${park.slug}`}
                          className="flex-1"
                        >
                          <button className="w-full inline-flex items-center justify-center gap-1 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs rounded-xl transition-all cursor-pointer">
                            <span>Ver Detalles</span>
                          </button>
                        </Link>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-black mb-4">
            ¿Planeando tu próxima gran aventura natural?
          </h2>
          <p className="text-xs md:text-sm text-white/80 max-w-xl mx-auto leading-relaxed mb-8">
            Encuentra hospedajes ecológicos, posadas locales y guías turísticos cerca de los parques nacionales.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/establecimientos"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors text-xs"
            >
              <Search className="w-4 h-4 mr-1.5" />
              <span>Buscar Alojamiento</span>
            </Link>
            <Link
              href="/servicios-b2b"
              className="inline-flex items-center justify-center px-6 py-3 bg-emerald-500 text-white border border-emerald-400 font-bold rounded-xl hover:bg-emerald-400 transition-colors text-xs"
            >
              <span>Ver Servicios Turísticos</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
