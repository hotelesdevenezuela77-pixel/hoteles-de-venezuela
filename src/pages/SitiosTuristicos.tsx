import { useEffect, useState } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { Mountain, Search, ChevronRight, Loader2, ArrowLeft } from "lucide-react";

interface TouristSite {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  image_url: string;
  category: string;
  highlights: string;
}

const DEFAULT_SITES_MOCK: TouristSite[] = [
  {
    id: 1,
    name: "Récord Guinness Relámpago del Catatumbo",
    slug: "relampago-del-catatumbo",
    short_description: "El Relámpago del Catatumbo: El Faro Eterno de Venezuela y el Mayor Espectáculo de Luces de la Tierra. Existe un rincón en el oeste de Venezuela donde la noche se niega a quedar a oscuras.",
    image_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800",
    category: "Naturaleza",
    highlights: "Fenómeno único, Relámpago, Lago de Maracaibo"
  },
  {
    id: 2,
    name: "No es África es Los Llanos Venezolanos",
    slug: "los-llanos-venezolanos",
    short_description: "Los Llanos Venezolanos: Crónica en la «Pequeña África» de América del Sur. Cuando el horizonte deja de ser una línea y se convierte en un infinito de tierra y cielo, sabes que has llegado.",
    image_url: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
    category: "Safari / Fauna",
    highlights: "Observación de aves, Chigüires, Hatos coloniales"
  },
  {
    id: 3,
    name: "Salto Ángel: La más alta del mundo llamado el Mundo Perdido",
    slug: "salto-angel-new",
    short_description: "El Salto Ángel se encuentra dentro del Parque Nacional Canaima, Patrimonio de la Humanidad por la UNESCO en el año 1994. El Salto Ángel (Kerepakupai Merú) el gigante de la selva.",
    image_url: "https://images.unsplash.com/photo-1552083375-1447ce886485?w=800",
    category: "Tepuyes / Selva",
    highlights: "Aventura, Patrimonio UNESCO, Kerepakupai Merú"
  }
];

export function SitiosTuristicos() {
  const [sites, setSites] = useState<TouristSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchSites() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("tourist_sites")
          .select("id, name, slug, short_description, image_url, category, highlights")
          .order("sort_order");

        if (error) throw error;

        if (data && data.length > 0) {
          setSites(data as TouristSite[]);
        } else {
          // Fallback to mock
          setSites(DEFAULT_SITES_MOCK);
        }
      } catch (err) {
        console.warn("Error fetching tourist sites, using fallback:", err);
        setSites(DEFAULT_SITES_MOCK);
      } finally {
        setLoading(false);
      }
    }
    fetchSites();
  }, []);

  const filtered = sites.filter(site => 
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20 font-sans">
      {/* Header */}
      <div className="relative overflow-hidden py-16 text-center text-white" style={{ background: "linear-gradient(135deg, #0e0120 0%, #1a0533 100%)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "#FF0096" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: "#00C8D4" }} />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <Link href="/">
            <button className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-bold mb-6 transition-colors cursor-pointer bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl">
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al Inicio
            </button>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-xs font-black text-brand-purple mb-4">
            <Mountain className="w-3.5 h-3.5" />
            <span>LUGARES EMBLEMÁTICOS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 font-serif">
            Sitios Turísticos Recomendados
          </h1>
          <p className="text-gray-300 text-xs md:text-sm max-w-xl mx-auto leading-relaxed font-semibold">
            Descubre los atractivos naturales, maravillas de la UNESCO y parajes históricos más extraordinarios de Venezuela, validados por nuestro equipo de expediciones.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xl shadow-gray-200/40">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar atractivos por nombre, categoría o palabras clave..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-xs md:text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-brand-magenta focus:bg-white transition-colors font-bold"
            />
          </div>
        </div>
      </div>

      {/* Listing */}
      <div className="max-w-7xl mx-auto px-6 mt-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
            <p className="text-gray-400 text-xs font-bold">Cargando atractivos turísticos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <Mountain className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-1">No se encontraron sitios turísticos</h3>
            <p className="text-gray-400 text-xs max-w-sm mx-auto leading-relaxed">
              Prueba modificando la búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((site) => (
              <article key={site.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 text-left flex flex-col justify-between h-full">
                <div>
                  <Link href={`/sitio/${site.slug}`}>
                    <div className="h-48 overflow-hidden relative cursor-pointer bg-slate-100">
                      <img 
                        src={site.image_url} 
                        alt={site.name} 
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800";
                        }}
                      />
                      <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-gray-750 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                        {site.category}
                      </span>
                    </div>
                  </Link>
                  <div className="p-5">
                    <Link href={`/sitio/${site.slug}`}>
                      <h3 className="font-extrabold text-base text-gray-800 mb-2 hover:text-brand-magenta transition-colors cursor-pointer leading-snug">
                        {site.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-455 line-clamp-3 leading-relaxed font-semibold">
                      {site.short_description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(site.highlights || "").split(",").filter(Boolean).slice(0, 3).map((hl, i) => (
                      <span key={i} className="px-2.5 py-0.5 bg-gray-50 border border-gray-100 text-[9px] text-gray-450 rounded-full font-bold">
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
        )}
      </div>
    </div>
  );
}
