import { useEffect, useState } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { BookOpen, Search, Clock, ChevronRight, Loader2, ArrowLeft } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  reading_time: number;
  published_at: string;
}

const DEFAULT_BLOGS_MOCK: BlogPost[] = [
  {
    id: 1,
    title: "GUÍA Completa para Visitar el Salto Ángel en Canaima",
    slug: "guia-salto-angel-canaima",
    excerpt: "Todo lo que necesitas saber para visitar la cascada más alta del mundo: cómo llegar, mejor época, qué llevar y los mejores tours disponibles.",
    featured_image: "https://images.unsplash.com/photo-1552083375-1447ce886485?w=800",
    reading_time: 10,
    published_at: "2026-07-20T12:00:00Z"
  },
  {
    id: 2,
    title: "10 Playas Imperdibles de Venezuela para tus Vacaciones 2026",
    slug: "playas-imperdibles-venezuela-2025",
    excerpt: "Descubre las playas más hermosas de Venezuela: desde los cayos de Los Roques hasta Morrocoy, te presentamos los destinos costeros que no puedes dejar de visitar este año.",
    featured_image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    reading_time: 8,
    published_at: "2026-07-15T12:00:00Z"
  },
  {
    id: 3,
    title: "Gastronomía Venezolana: Platos Típicos que Debes Probar",
    slug: "gastronomia-venezolana-platos-tipicos",
    excerpt: "Un recorrido por los sabores de Venezuela: desde la arepa reina pepiada hasta el pabellón criollo, descubre la riqueza culinaria de cada región del país.",
    featured_image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800",
    reading_time: 7,
    published_at: "2026-07-10T12:00:00Z"
  }
];

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt, featured_image, published_at, reading_time")
          .order("published_at", { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setPosts(data as BlogPost[]);
        } else {
          // Check local storage or defaults
          const local = localStorage.getItem("hdv_mock_blog_posts");
          if (local) {
            setPosts(JSON.parse(local));
          } else {
            setPosts(DEFAULT_BLOGS_MOCK);
          }
        }
      } catch (err) {
        console.warn("Error fetching blog posts, using fallback:", err);
        setPosts(DEFAULT_BLOGS_MOCK);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const filtered = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-xs font-black text-brand-turquesa mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>REPORTAJES & TIPS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 font-serif">
            Blog & Consejos de Turismo
          </h1>
          <p className="text-gray-300 text-xs md:text-sm max-w-xl mx-auto leading-relaxed font-semibold">
            Lee guías exclusivas, recomendaciones locales y reportajes redactados por nuestro equipo sobre playas secretas, picos andinos y gastronomía venezolana.
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
              placeholder="Buscar reportajes por título o palabras clave..."
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
            <p className="text-gray-400 text-xs font-bold">Cargando reportajes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-1">No se encontraron reportajes</h3>
            <p className="text-gray-400 text-xs max-w-sm mx-auto leading-relaxed">
              Prueba modificando los términos de búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((blog) => (
              <article key={blog.id} className="group flex flex-col justify-between bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full text-left">
                <div>
                  <div className="h-48 overflow-hidden relative bg-slate-100">
                    <img 
                      src={blog.featured_image} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800";
                      }}
                    />
                    {blog.reading_time && (
                      <div className="absolute top-4 left-4 bg-brand-turquesa text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-lg">
                        {blog.reading_time} Min de lectura
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-[10px] text-gray-400 font-bold block mb-1">
                      {new Date(blog.published_at).toLocaleDateString("es-VE", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                    <h3 className="font-extrabold text-base text-gray-850 line-clamp-2 leading-tight group-hover:text-brand-magenta transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-gray-455 mt-2 line-clamp-3 leading-relaxed font-semibold">
                      {blog.excerpt}
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <Link href={`/blog/${blog.slug}`}>
                    <span className="text-xs font-bold text-brand-magenta group-hover:underline flex items-center gap-1 cursor-pointer">
                      Leer reportaje <ChevronRight className="w-3.5 h-3.5" />
                    </span>
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
