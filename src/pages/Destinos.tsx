import { useEffect, useState } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { DESTINOS_MOCK } from "../lib/destinosMock";
import type { Destination } from "../lib/destinosMock";
import { Search, MapPin, Compass, Loader2, Filter, ArrowRight } from "lucide-react";

export function Destinos() {
  const [destinos, setDestinos] = useState<Destination[]>(DESTINOS_MOCK);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("Todos");

  useEffect(() => {
    async function fetchDestinos() {
      try {
        const { data, error } = await supabase
          .from("destinations")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setDestinos(data as Destination[]);
        }
      } catch (err) {
        console.warn("No se pudo conectar a Supabase, usando datos locales de fallback en segundo plano:", err);
      }
    }

    fetchDestinos();
  }, []);

  // Extraer todos los estados únicos disponibles para filtrar
  const estadosDisponibles = ["Todos", ...Array.from(new Set(destinos.map(d => d.state)))];

  // Filtrar destinos por búsqueda y por estado
  const filteredDestinos = destinos.filter(destino => {
    const matchesSearch = 
      destino.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destino.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destino.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesState = selectedState === "Todos" || destino.state === selectedState;

    return matchesSearch && matchesState;
  });

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      {/* Hero Banner Minimalista Premium */}
      <div className="relative overflow-hidden py-16 bg-gradient-to-br from-brand-purple-dark via-brand-purple-deep to-black text-white text-center">
        {/* Bottom white fade overlay to blend with the white page background */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none z-10" />

        {/* Luces decorativas */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-brand-magenta/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-brand-turquesa/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-brand-magenta/10 text-brand-magenta border border-brand-magenta/25 mb-4 animate-pulse">
            <Compass className="w-3.5 h-3.5" />
            <span>TURISMO NACIONAL</span>
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Explora los Destinos de <span className="text-gradient-brand">Venezuela</span>
          </h1>
          <p className="text-gray-300 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
            Desde las playas vírgenes del Caribe hasta las cumbres nevadas de los Andes y los tepuyes milenarios del Escudo Guayanés. Encuentra tu próximo rincón mágico.
          </p>
        </div>
      </div>

      {/* Panel de Controles: Búsqueda y Filtros */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
        <div className="bg-white border border-gray-100/80 rounded-3xl p-6 shadow-xl shadow-gray-200/50 flex flex-col md:flex-row items-center gap-4">
          
          {/* Barra de búsqueda */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, estado, descripción..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-xs md:text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-brand-magenta focus:bg-white transition-colors"
            />
          </div>

          {/* Selector de Estado */}
          <div className="w-full md:w-64 flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 focus-within:border-brand-magenta focus-within:bg-white transition-all">
            <Filter className="text-gray-400 w-4 h-4 shrink-0" />
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs md:text-sm text-gray-600 font-medium cursor-pointer"
            >
              <option value="Todos">Todos los Estados</option>
              {estadosDisponibles.filter(e => e !== "Todos").map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cuerpo principal - Grid de destinos */}
      <div className="max-w-7xl mx-auto px-6 mt-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
            <p className="text-gray-400 text-xs font-bold">Cargando la magia de Venezuela...</p>
          </div>
        ) : filteredDestinos.length === 0 ? (
          <div className="text-center py-20">
            <Compass className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-1">No se encontraron destinos</h3>
            <p className="text-gray-400 text-xs max-w-md mx-auto">
              Prueba modificando los filtros o escribiendo otra palabra clave en el buscador.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-black text-gray-800 tracking-tight flex items-center gap-2">
                <span>Resultados</span>
                <span className="bg-brand-magenta/10 text-brand-magenta text-[10px] px-2 py-0.5 rounded-full font-black">
                  {filteredDestinos.length}
                </span>
              </h2>
              {searchQuery || selectedState !== "Todos" ? (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedState("Todos");
                  }}
                  className="text-xs text-brand-magenta font-black hover:underline cursor-pointer"
                >
                  Limpiar filtros
                </button>
              ) : null}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDestinos.map(destino => (
                <Link
                  key={destino.id}
                  href={`/destinos/${destino.slug}`}
                  className="group block bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl hover:border-gray-200/50 transition-all duration-300 cursor-pointer flex flex-col h-[420px]"
                >
                  {/* Imagen superior */}
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <img
                      src={
                        (!destino.image_url || destino.image_url.startsWith("/") || destino.image_url.includes("localhost") || destino.image_url.includes("127.0.0.1") || destino.image_url.includes("/api/files/"))
                          ? (DESTINOS_MOCK.find(m => m.slug === destino.slug)?.image_url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80")
                          : destino.image_url
                      }
                      alt={destino.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        // Si falla la imagen del servidor, usar una de Unsplash de respaldo
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                    {/* Badge del Estado */}
                    <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-[10px] font-black text-gray-700 tracking-wide px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-brand-magenta" />
                      <span>{destino.state}</span>
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="text-xl font-black text-gray-800 tracking-tight group-hover:text-brand-magenta transition-colors">
                        {destino.name}
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed mt-2 line-clamp-3">
                        {destino.description}
                      </p>
                    </div>

                    {/* Botón Explorar */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-4">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Explorar Destino
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-600 group-hover:bg-brand-magenta group-hover:text-white flex items-center justify-center transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
