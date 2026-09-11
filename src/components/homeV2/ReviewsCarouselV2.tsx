import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Star, ChevronLeft, ChevronRight, MessageSquareQuote, ShieldCheck, Heart, MapPin } from "lucide-react";
import { supabase } from "../../lib/supabase";

export interface Review {
  id: number;
  author: string;
  location: string;
  avatar: string;
  rating: number;
  date: string;
  establishmentName: string;
  establishmentSlug: string;
  establishmentImage: string;
  comment: string;
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 1,
    author: "Valeria & Carlos M.",
    location: "Caracas, Venezuela",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop",
    rating: 5,
    date: "Agosto 2026",
    establishmentName: "Posada La Ardileña",
    establishmentSlug: "posada-la-ardilena",
    establishmentImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400",
    comment: "Contactamos al dueño directo por WhatsApp a través de la plataforma. La posada en Morrocoy tenía la planta eléctrica encendida 100% y la comida fue espectacular. Sin ningún cobro extra ni sorpresas."
  },
  {
    id: 2,
    author: "Ing. Roberto Benítez",
    location: "Valencia, Carabobo",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop",
    rating: 5,
    date: "Julio 2026",
    establishmentName: "Campamento Canaima Sello HDV",
    establishmentSlug: "campamento-canaima",
    establishmentImage: "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=400",
    comment: "Pudimos coordinar todo el paquete de vuelo y excursión al Salto Ángel con el operador directo. Excelente atención y la garantía de estar tratando con el equipo real."
  },
  {
    id: 3,
    author: "Dra. Sofía Alarcón",
    location: "Barquisimeto, Lara",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop",
    rating: 5,
    date: "Agosto 2026",
    establishmentName: "Posada Galipán Boutique",
    establishmentSlug: "posada-galipan",
    establishmentImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
    comment: "La mejor experiencia para desconectarse en El Ávila. La reservación fue instantánea por WhatsApp y la posada tenía Starlink super rápido para teletrabajo."
  },
  {
    id: 4,
    author: "Gabriel & Daniela",
    location: "Mérida, Venezuela",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop",
    rating: 5,
    date: "Junio 2026",
    establishmentName: "Sabbia by LD Hoteles",
    establishmentSlug: "sabbia-ld-hoteles",
    establishmentImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400",
    comment: "Impresionante la posada en Los Roques. Todo el equipo muy profesional y al reservar directamente ahorramos comisiones que invertimos en los paseos a Cayo de Agua."
  }
];

export function ReviewsCarouselV2() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS);
  const [headerConfig, setHeaderConfig] = useState({
    badge: "TESTIMONIOS VERIFICADOS",
    title: "Experiencias de Viajeros Reales",
    subtitle: "Descubre las historias de personas que planificaron sus vacaciones en Venezuela contactando directo a las posadas."
  });

  useEffect(() => {
    async function loadReviewsSection() {
      try {
        const { data, error } = await supabase
          .from("site_sections")
          .select("*")
          .eq("section_key", "reviews_v2")
          .single();

        if (!error && data) {
          setHeaderConfig({
            badge: data.button_text || "TESTIMONIOS VERIFICADOS",
            title: data.title || "Experiencias de Viajeros Reales",
            subtitle: data.description || "Descubre las historias de personas que planificaron sus vacaciones en Venezuela contactando directo a las posadas."
          });

          if (data.button_url) {
            try {
              const parsed = JSON.parse(data.button_url);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setReviews(parsed);
              }
            } catch (e) {
              console.warn("ReviewsCarouselV2: No se pudo parsear JSON de testimonios:", e);
            }
          }
        }
      } catch (err) {
        console.warn("ReviewsCarouselV2: Usando configuración de testimonios por defecto:", err);
      }
    }
    loadReviewsSection();
  }, []);

  const nextReview = () => {
    if (reviews.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    if (reviews.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + reviews.length) % reviews.length);
  };

  const currentReview = reviews[currentIndex] || DEFAULT_REVIEWS[0];

  return (
    <section className="py-20 bg-slate-50 text-slate-800 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-12">
        
        {/* Header */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF0096]/10 text-[#FF0096] border border-[#FF0096]/20 text-xs font-black uppercase tracking-wider">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>{headerConfig.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
            {headerConfig.title}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            {headerConfig.subtitle}
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-4xl mx-auto">
          
          {/* Main Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-8 text-left relative overflow-hidden transition-all duration-500">
            
            {/* Left Image & Establishment Tag */}
            <div className="w-full md:w-5/12 shrink-0 space-y-3">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
                <img
                  src={currentReview.establishmentImage}
                  alt={currentReview.establishmentName}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-[#00C8D4] text-slate-950 shadow-sm flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-slate-950" />
                  <span>Posada Verificada</span>
                </span>
              </div>

              <Link
                href={`/establecimiento/${currentReview.establishmentSlug}`}
                className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900 hover:text-[#00C8D4] transition-colors truncate"
              >
                <div className="w-4 h-4 rounded-full bg-[#FF0096] flex items-center justify-center text-white shrink-0 shadow-xs">
                  <MapPin className="w-2.5 h-2.5 text-white stroke-[2.5]" />
                </div>
                <span>{currentReview.establishmentName}</span>
              </Link>
            </div>

            {/* Right Quote & Author */}
            <div className="flex-1 space-y-5">
              
              {/* Stars */}
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: currentReview.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
                <span className="ml-2 text-xs font-black text-slate-700">{currentReview.rating ? currentReview.rating.toFixed(1) : "5.0"} / 5.0 Excelente</span>
              </div>

              {/* Comment */}
              <blockquote className="text-sm sm:text-base font-medium text-slate-700 leading-relaxed italic">
                "{currentReview.comment}"
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <img
                  src={currentReview.avatar}
                  alt={currentReview.author}
                  className="w-11 h-11 rounded-full object-cover border-2 border-[#00C8D4] shadow-xs"
                />
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">
                    {currentReview.author}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {currentReview.location} • {currentReview.date}
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={prevReview}
                className="w-10 h-10 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                title="Anterior testimonio"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>
              <button
                type="button"
                onClick={nextReview}
                className="w-10 h-10 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                title="Siguiente testimonio"
              >
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </button>
            </div>

            {/* Dots */}
            <div className="flex gap-1.5">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === currentIndex ? "w-6 bg-[#00C8D4]" : "w-2 bg-slate-300"
                  }`}
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
