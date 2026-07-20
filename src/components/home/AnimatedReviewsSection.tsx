import { useState, useEffect } from "react";
import { Star, Quote, CheckCircle2, MessageSquare } from "lucide-react";
import type { FeaturedReview } from "@/lib/reviewsStore";
import { fetchAllFeaturedReviews, DEFAULT_FEATURED_REVIEWS } from "@/lib/reviewsStore";

const DEFAULT_REVIEWS_ROW1: FeaturedReview[] = [
  {
    id: "r1-1",
    user_name: "Mariana Silva",
    user_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    rating: 5,
    location_tag: "Posada Galápagos · Los Roques",
    comment: "Contactamos directamente a la posada desde la plataforma y nos ahorramos un 20% en comisiones de agencias. ¡La atención en Los Roques fue inolvidable!",
    row_position: 1
  },
  {
    id: "r1-2",
    user_name: "Carlos Mendoza",
    user_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    rating: 5,
    location_tag: "Hotel Eurobuilding · Caracas",
    comment: "La confirmación directa por WhatsApp con el gerente fue en menos de 5 minutos. La mejor guía de hospedajes en Venezuela sin duda.",
    row_position: 1
  },
  {
    id: "r1-3",
    user_name: "Elena Rivas",
    user_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    rating: 5,
    location_tag: "Cabañas Cubiro · Lara",
    comment: "Hermosa experiencia en las lomas de Cubiro. El mapa interactivo y el WhatsApp directo hicieron que organizar el viaje familiar fuera facilísimo.",
    row_position: 1
  },
  {
    id: "r1-4",
    user_name: "Guillermo Paredes",
    user_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    rating: 5,
    location_tag: "Campamento Canaima · Bolívar",
    comment: "Nos dio muchísima tranquilidad saber que el campamento estaba auditado con el Sello de Verificación. Recomiendo totalmente Hoteles de Venezuela.",
    row_position: 1
  }
];

const DEFAULT_REVIEWS_ROW2: FeaturedReview[] = [
  {
    id: "r2-1",
    user_name: "Daniela Alarcón",
    user_avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    rating: 5,
    location_tag: "Hotel Sabbia by LD · Margarita",
    comment: "Ubicación espectacular en Pampatar. Reservamos 4 noches directo con la recepción sin recargos. ¡Repetiremos pronto!",
    row_position: 2
  },
  {
    id: "r2-2",
    user_name: "Roberto Zabala",
    user_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    rating: 5,
    location_tag: "Posada La Ardileña · Morrocoy",
    comment: "La salida en lancha directo desde el embarcadero de la posada hacia Cayo Sombrero fue increíble. Excelente curaduría de sitios.",
    row_position: 2
  },
  {
    id: "r2-3",
    user_name: "Sofía Benítez",
    user_avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    rating: 5,
    location_tag: "Posada Casa Sol · Mérida",
    comment: "Frío andino, chocolate caliente y habitaciones espectaculares. Toda la información de la plataforma era 100% exacta.",
    row_position: 2
  },
  {
    id: "r2-4",
    user_name: "Andrés Colmenares",
    user_avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
    rating: 5,
    location_tag: "Cala Boutique Hotel · Margarita",
    comment: "La atención personalizada por WhatsApp nos resolvió todo el itinerario de vuelo y traslado. Una maravilla de servicio.",
    row_position: 2
  }
];

const DEFAULT_REVIEWS_ROW3: FeaturedReview[] = [
  {
    id: "r3-1",
    user_name: "Valeria Gutiérrez",
    user_avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150",
    rating: 5,
    location_tag: "Posada El Encanto · Colonia Tovar",
    comment: "Un fin de semana romántico perfecto. Cotizamos en vivo y la posada nos aceptó Pago Móvil y Zelle sin complicaciones.",
    row_position: 3
  },
  {
    id: "r3-2",
    user_name: "Fernando Machado",
    user_avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    rating: 5,
    location_tag: "Hotel Lidotel · Valencia",
    comment: "Viaje de negocios impecable. Instalaciones impecables y piscina excelente. Es nuestra plataforma de referencia para viajar por Venezuela.",
    row_position: 3
  },
  {
    id: "r3-3",
    user_name: "Patricia Lugo",
    user_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    rating: 5,
    location_tag: "Posada Playa Azul · Choroní",
    comment: "Hermosa posada cerca del malecón de Puerto Colombia. Las imágenes y contactos de la web son totalmente reales y confiables.",
    row_position: 3
  },
  {
    id: "r3-4",
    user_name: "Jesús Enrique Morales",
    user_avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150",
    rating: 5,
    location_tag: "Hato Piñero · Los Llanos",
    comment: "Avistamiento de fauna silvestre único en Venezuela. Reservar por el canal directo oficial fue seguro y súper ágil.",
    row_position: 3
  }
];

function ReviewCard({ review }: { review: FeaturedReview }) {
  return (
    <div className="w-[340px] sm:w-[380px] shrink-0 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-pink-300 transition-all duration-300 select-none group relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#FF0096] to-[#00C8D4] opacity-80" />
      
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            {review.user_avatar ? (
              <img
                src={review.user_avatar}
                alt={review.user_name}
                className="w-10 h-10 rounded-full object-cover border-2 border-pink-100"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF0096] to-[#9B00CC] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                {review.user_name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1">
                <h4 className="text-xs font-bold text-gray-900 leading-tight">{review.user_name}</h4>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00C8D4] fill-cyan-50" />
              </div>
              <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                {review.location_tag}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-0.5 bg-amber-50 border border-amber-200/60 px-2 py-1 rounded-full shrink-0">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span className="text-[11px] font-black text-amber-700">5.0</span>
          </div>
        </div>

        <p className="text-xs text-gray-600 font-medium leading-relaxed italic line-clamp-3">
          "{review.comment}"
        </p>
      </div>

      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[9px] font-bold text-gray-400">
        <span className="text-[#FF0096] flex items-center gap-1">
          <Quote className="w-3 h-3 text-[#FF0096]" /> Reserva Directa Verificada
        </span>
        <span className="text-slate-400">Venezuela</span>
      </div>
    </div>
  );
}

export function AnimatedReviewsSection() {
  const [row1, setRow1] = useState<FeaturedReview[]>([]);
  const [row2, setRow2] = useState<FeaturedReview[]>([]);
  const [row3, setRow3] = useState<FeaturedReview[]>([]);

  useEffect(() => {
    async function loadReviews() {
      const allFeatured = await fetchAllFeaturedReviews();
      const r1 = allFeatured.filter(r => Number(r.row_position) === 1);
      const r2 = allFeatured.filter(r => Number(r.row_position) === 2);
      const r3 = allFeatured.filter(r => Number(r.row_position) === 3);

      setRow1(r1.length > 0 ? r1 : DEFAULT_FEATURED_REVIEWS.filter(r => r.row_position === 1));
      setRow2(r2.length > 0 ? r2 : DEFAULT_FEATURED_REVIEWS.filter(r => r.row_position === 2));
      setRow3(r3.length > 0 ? r3 : DEFAULT_FEATURED_REVIEWS.filter(r => r.row_position === 3));
    }

    loadReviews();
  }, []);

  // Duplicamos los elementos para la animación de loop infinito continuo sin saltos
  const list1 = [...row1, ...row1, ...row1, ...row1];
  const list2 = [...row2, ...row2, ...row2, ...row2];
  const list3 = [...row3, ...row3, ...row3, ...row3];

  return (
    <section className="py-20 text-white overflow-hidden relative font-sans" style={{ background: "linear-gradient(135deg, #0e011f 0%, #1a0533 100%)" }}>
      {/* Glow Spots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-20" style={{ background: "#FF0096" }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ background: "#00C8D4" }} />
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 text-center mb-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-black text-[#00C8D4] mb-3 shadow-xs">
          <MessageSquare className="w-3.5 h-3.5 text-[#00C8D4]" />
          <span>EXPERIENCIAS REALES DE VIAJEROS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Lo que Dicen Nuestros Turistas
        </h2>
        <p className="text-white/70 text-xs sm:text-sm font-semibold max-w-xl mx-auto mt-2">
          Más de 50.000 viajeros cotizan y reservan hospedajes en Venezuela sin intermediarios a través de nuestro ecosistema.
        </p>
      </div>

      {/* Contenedor de las 3 filas animadas */}
      <div className="space-y-6 relative z-10">
        {/* Gradiantes laterales de difuminado para un acabado impecable */}
        <div className="absolute top-0 bottom-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-[#0e011f] via-[#0e011f]/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-[#0e011f] via-[#0e011f]/80 to-transparent z-20 pointer-events-none" />

        {/* FILA 1: Movimiento continuo a la DERECHA */}
        <div className="flex overflow-hidden group">
          <div className="flex gap-6 animate-marquee-right group-hover:[animation-play-state:paused] whitespace-nowrap">
            {list1.map((rev, idx) => (
              <ReviewCard key={`r1-${rev.id}-${idx}`} review={rev} />
            ))}
          </div>
        </div>

        {/* FILA 2: Movimiento continuo a la IZQUIERDA */}
        <div className="flex overflow-hidden group">
          <div className="flex gap-6 animate-marquee-left group-hover:[animation-play-state:paused] whitespace-nowrap">
            {list2.map((rev, idx) => (
              <ReviewCard key={`r2-${rev.id}-${idx}`} review={rev} />
            ))}
          </div>
        </div>

        {/* FILA 3: Movimiento continuo a la DERECHA */}
        <div className="flex overflow-hidden group">
          <div className="flex gap-6 animate-marquee-right group-hover:[animation-play-state:paused] whitespace-nowrap">
            {list3.map((rev, idx) => (
              <ReviewCard key={`r3-${rev.id}-${idx}`} review={rev} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
