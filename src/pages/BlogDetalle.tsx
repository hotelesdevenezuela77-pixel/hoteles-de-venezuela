import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { supabase } from "../lib/supabase";
import { 
  ArrowLeft, Clock, User, Calendar, Loader2, Compass, MessageSquare 
} from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  authorName: string;
  readingTime: number;
  status: string;
  publishedAt: string;
}

export function BlogDetalle() {
  const [, params] = useRoute("/blog/:slug");
  const slug = (params as any)?.slug;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPostData() {
      if (!slug) return;
      try {
        setLoading(true);
        let dbData: any = null;

        // Try querying Supabase
        try {
          const { data, error } = await supabase
            .from("blog_posts")
            .select("*")
            .eq("slug", slug)
            .maybeSingle();
          if (!error) {
            dbData = data;
          }
        } catch (e) {
          console.warn("Supabase query error for blog post:", e);
        }

        // Check local storage fallback
        const localKey = "hdv_mock_blog_posts";
        const local = localStorage.getItem(localKey);
        const localData = local ? JSON.parse(local) : [];

        // Match post
        let matched = dbData;
        if (!matched) {
          // Check if there are default mock blogs
          const defaults = [
            {
              id: 1,
              title: "Morrocoy: Guía definitiva para recorrer sus cayos más hermosos",
              slug: "morrocoy-guia-definitiva-cayos",
              excerpt: "Descubre cómo llegar a Cayo Sombrero, Cayo Muerto y los rincones menos conocidos del Parque Nacional Morrocoy, con recomendaciones para viajar sin intermediarios.",
              content: `Morrocoy es uno de los parques nacionales más espectaculares de Venezuela. Con sus cayos de arena blanca y aguas cristalinas de poca profundidad, es el destino ideal para los amantes del sol y la playa.

              ### ¿Cómo llegar?
              Para llegar a Morrocoy, debes viajar al estado Falcón. Las principales puertas de entrada son Tucacas y Chichiriviche. Desde allí, puedes tomar lanchas (peñeros) cooperativas que te llevarán a los diferentes cayos.

              ### Cayos recomendados:
              1. **Cayo Sombrero:** Es el más grande y popular. Cuenta con servicios de comida, alquiler de toldos y dos playas espectaculares bordeadas por cocoteros.
              2. **Cayo Muerto:** Muy cercano a Chichiriviche, ideal para un viaje rápido.
              3. **Bajo de las Estrellas:** Una piscina natural en medio del mar donde podrás ver estrellas de mar en su hábitat natural (recuerda no tocarlas ni sacarlas del agua).
              4. **Cayo Sal:** Posee una salina natural detrás de la playa que puedes visitar caminando.

              ### Consejos útiles para tu viaje:
              * Lleva protector solar biodegradable para proteger la vida marina.
              * No tires basura en las playas ni en los cayos. Conservar este paraíso depende de todos.
              * Contrata siempre operadores autorizados para tus traslados en lancha.`,
              featuredImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&auto=format&fit=crop",
              authorName: "Equipo HDV",
              readingTime: 5,
              status: "published",
              publishedAt: "2026-06-18T10:00:00Z"
            },
            {
              id: 2,
              title: "Canaima y el Salto Ángel: Lo que necesitas saber antes de partir",
              slug: "canaima-salto-angel-guia",
              excerpt: "Todo sobre el equipaje fundamental, el repelente de insectos y cómo reservar posadas y vuelos directos con operadores validados físicamente por nuestro equipo.",
              content: `Visitar el Salto Ángel y el Parque Nacional Canaima es una experiencia transformadora. Estar frente a la caída de agua más alta del mundo, rodeado de los milenarios tepuyes, es algo que todo viajero debe hacer al menos una vez en la vida.

              ### Preparación del viaje
              Para viajar a Canaima, debes tomar un vuelo de conexión, generalmente desde Caracas o Puerto Ordaz, en aeronaves de hélice preparadas para la pista de aterrizaje del parque nacional.

              ### Equipaje imprescindible:
              * Calzado con buen agarre (zapatos de trekking) que se puedan mojar.
              * Capa impermeable de buena calidad. La llovizna cerca del salto es constante.
              * Repelente fuerte para insectos (preferiblemente con DEET).
              * Linterna y cargador portátil (power bank), ya que la electricidad en los campamentos de río puede ser limitada.

              ### La travesía al Salto
              El recorrido hacia el Salto Ángel se realiza en curiara (canoa indígena motorizada) navegando los ríos Carrao y Churún. Toma aproximadamente 4 a 5 horas y solo es posible durante la temporada de lluvias (junio a noviembre), cuando el nivel de los ríos es lo suficientemente alto.`,
              featuredImage: "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=1200&auto=format&fit=crop",
              authorName: "Equipo HDV",
              readingTime: 7,
              status: "published",
              publishedAt: "2026-06-15T12:00:00Z"
            },
            {
              id: 3,
              title: "Los Roques: ¿Cuál es la mejor época del año para visitarlo?",
              slug: "los-roques-mejor-epoca-del-ano",
              excerpt: "Analizamos los meses con el mar más calmado y las tarifas directas más atractivas de las posadas del archipiélago con el Sello de Verificación Humana.",
              content: `El Archipiélago de Los Roques es un Parque Nacional marino que alberga uno de los arrecifes de coral más diversos y conservados de todo el Caribe. Elegir cuándo visitarlo puede influir en tu experiencia general.

              ### Clima y Oleaje
              Los Roques tiene la ventaja de estar fuera de la zona de huracanes, por lo que su clima es excelente casi todo el año.
              
              ### Análisis por temporadas:
              * **Febrero a Mayo (Recomendada):** El oleaje es extremadamente bajo, ideal para navegación y snorkel. Los vientos alisios disminuyen gradualmente, regalando aguas cristalinas tipo espejo.
              * **Septiembre a Noviembre:** Época de menor afluencia de turistas. Es posible encontrar tarifas de hospedaje promocionales en el Gran Roque.
              * **Julio y Agosto / Diciembre y Enero:** Temporada alta. Es indispensable reservar con meses de anticipación tanto vuelos como posadas.`,
              featuredImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&auto=format&fit=crop",
              authorName: "Equipo HDV",
              readingTime: 4,
              status: "published",
              publishedAt: "2026-06-10T14:30:00Z"
            }
          ];

          const combined = [...localData];
          defaults.forEach(d => {
            if (!combined.some(c => c.slug === d.slug)) {
              combined.push(d);
            }
          });

          matched = combined.find((p: any) => p.slug === slug);
        }

        if (matched) {
          const mapped: BlogPost = {
            id: matched.id,
            title: matched.title,
            slug: matched.slug,
            excerpt: matched.excerpt || "",
            content: matched.content || "",
            featuredImage: matched.featured_image || matched.featuredImage || matched.image_url || "",
            authorName: matched.author_name || matched.authorName || "Equipo HDV",
            readingTime: matched.reading_time || matched.readingTime || 5,
            status: matched.status || "published",
            publishedAt: matched.published_at || matched.publishedAt || matched.created_at || new Date().toISOString()
          };
          setPost(mapped);
        } else {
          setPost(null);
        }
      } catch (err) {
        console.error("Error loading blog post:", err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    }

    loadPostData();
  }, [slug]);

  // Update SEO metadata dynamically
  useEffect(() => {
    if (!post) return;
    const originalTitle = document.title;
    document.title = `${post.title} | Blog Hoteles de Venezuela`;

    return () => {
      document.title = originalTitle;
    };
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-[#FF0096] animate-spin" />
        <p className="text-gray-400 text-xs font-bold font-sans">Cargando artículo...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#FF0096]/10 flex items-center justify-center border border-[#FF0096]/25 mx-auto mb-6">
          <Compass className="w-8 h-8 text-[#FF0096] animate-pulse" />
        </div>
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">Artículo no encontrado</h1>
        <p className="text-gray-400 text-xs max-w-md mt-2">
          El reportaje que buscas no existe o ha sido movido a otro enlace permanente.
        </p>
        <Link href="/" className="mt-6 inline-block bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-95 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all">
          Ir al Inicio
        </Link>
      </div>
    );
  }

  const isHtmlContent = /<[a-z][\s\S]*>/i.test(post.content || "");

  return (
    <div className="min-h-screen bg-gray-50/20 pb-24 font-sans text-[#1e293b]">
      
      {/* Portada en Cabecera (Full-Bleed) */}
      <div className="w-full relative h-[400px] md:h-[500px] overflow-hidden">
        {post.featuredImage ? (
          <img 
            src={post.featuredImage} 
            alt={post.title} 
            className="w-full h-full object-cover scale-[1.08]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop";
            }}
          />
        ) : (
          <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #0e011f, #1a0533)" }} />
        )}

        {/* Degradados de portadas oficiales */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />

        {/* Título y Categoría Centrados */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-[#00C8D4] text-[10px] md:text-xs font-black tracking-[0.3em] uppercase mb-4 drop-shadow-md">
            EL PARAÍSO TE ESPERA · REPORTAJE
          </p>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-2xl leading-tight max-w-4xl playfair">
            {post.title}
          </h1>
        </div>
      </div>

      {/* Cuerpo del Artículo */}
      <div className="max-w-4xl mx-auto px-6 mt-8 mb-16">
        
        {/* Enlace de regreso y metadatos */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-gray-500 hover:text-[#FF0096] transition-colors cursor-pointer self-start">
            <ArrowLeft className="w-4 h-4" />
            <span>VOLVER AL INICIO</span>
          </Link>
          
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-semibold">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#00C8D4]" /> {post.authorName}
            </span>
            <span className="opacity-30">•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#9B00CC]" /> {new Date(post.publishedAt).toLocaleDateString("es-VE", { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="opacity-30">•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#FF0096]" /> {post.readingTime} Min de lectura
            </span>
          </div>
        </div>

        {/* Caja de contenido de alta gama */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-lg shadow-gray-200/20 text-left">
          {isHtmlContent ? (
            <div 
              className="prose max-w-none text-gray-800 text-sm leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: post.content || "" }} 
            />
          ) : (
            <div className="text-gray-850 text-sm md:text-base leading-relaxed whitespace-pre-line font-medium space-y-4">
              {post.content}
            </div>
          )}
        </div>
      </div>

      {/* CTA de Cierre - WhatsApp (Directrices del Consumidor) */}
      <div className="max-w-4xl mx-auto px-6 mt-16">
        <div 
          className="rounded-3xl p-8 md:p-10 text-center text-white relative overflow-hidden shadow-xl"
          style={{ background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)" }}
        >
          {/* Brillos de fondo */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-black/10 rounded-full blur-2xl" />

          <h3 className="text-xl md:text-2xl font-black mb-3 relative z-10 playfair">
            ¿Planeas tu viaje al paraíso?
          </h3>
          <p className="text-white/80 text-xs md:text-sm font-medium max-w-lg mx-auto mb-6 relative z-10 leading-relaxed">
            Escríbenos directamente y te pondremos en contacto con los hospedajes y operadores verificados de la zona para que reserves al mejor precio garantizado.
          </p>
          
          <a 
            href="https://wa.me/584145069774" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#FF0096] hover:bg-gray-50 transition-all font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg hover:scale-102 active:scale-98 cursor-pointer relative z-10"
          >
            <MessageSquare className="w-4 h-4 fill-current text-[#FF0096]" />
            <span>Consultar por WhatsApp</span>
          </a>
        </div>
      </div>

    </div>
  );
}
