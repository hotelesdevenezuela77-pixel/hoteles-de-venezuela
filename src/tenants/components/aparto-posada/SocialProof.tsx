import React, { useState, useEffect, useRef } from "react";
import { Star, ShieldCheck, Sparkles, CheckCircle2, ChevronLeft, ChevronRight, MapPin, Quote } from "lucide-react";
import { APARTO_REVIEWS } from "../../lib/apartoPosadaData";
import { type Language, APARTO_TRANSLATIONS } from "../../lib/apartoTranslations";

interface SocialProofProps {
  language?: Language;
}

export function SocialProof({ language = "es" }: SocialProofProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const t = APARTO_TRANSLATIONS[language].reviews;

  const totalReviews = APARTO_REVIEWS.length;

  // Auto-play cada 5 segundos con pause al hover
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalReviews);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, totalReviews]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalReviews) % totalReviews);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalReviews);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) handleNext();
    if (diff < -50) handlePrev();
    touchStartX.current = null;
  };

  const visibleReview = APARTO_REVIEWS[currentIndex];
  const nextReview = APARTO_REVIEWS[(currentIndex + 1) % totalReviews];

  return (
    <section id="opiniones" className="py-20 md:py-28 bg-slate-50/50 border-b border-slate-200/80 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Encabezado Editorial Boutique */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00C8D4]/10 border border-[#00C8D4]/30 text-[#009da7] text-[11px] font-extrabold tracking-[0.25em] uppercase font-['Plus_Jakarta_Sans',sans-serif]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF0096]" />
            {t.badge}
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-serif">
            {t.title}
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              {t.ratingText}
            </span>
          </div>
        </div>

        {/* Carrusel Dinámico y Moderno de Testimonios */}
        <div
          className="relative max-w-5xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Tarjetas de Testimonios (Grid 1 en móvil / 2 en desktop para dinamismo visual) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Tarjeta Principal */}
            <div className="bg-white rounded-3xl p-8 sm:p-9 border border-slate-200/90 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col justify-between relative group hover:-translate-y-1">
              <Quote className="absolute top-6 right-6 w-12 h-12 text-slate-100 group-hover:text-[#00C8D4]/15 transition-colors pointer-events-none stroke-[1]" />
              
              <div className="space-y-6 relative z-10">
                {/* Cabecera del Huésped */}
                <div className="flex items-center gap-4">
                  <img
                    src={visibleReview.avatar}
                    alt={visibleReview.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-[#00C8D4]/20"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-base text-slate-900 font-serif">
                        {visibleReview.name}
                      </h4>
                      <CheckCircle2 className="w-4 h-4 text-[#00C8D4] fill-[#00C8D4]/15" />
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1 text-[#FF0096] font-semibold text-[11px]">
                        <MapPin className="w-3 h-3" />
                        {visibleReview.location}
                      </span>
                      <span>•</span>
                      <span className="text-slate-400 text-[11px]">{visibleReview.date}</span>
                    </div>
                  </div>
                </div>

                {/* Estrellas Doradas */}
                <div className="flex items-center gap-1">
                  {[...Array(visibleReview.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Texto del Testimonio */}
                <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed font-['Inter',sans-serif] italic">
                  "{visibleReview.content}"
                </p>
              </div>

              {/* Pie de Tarjeta */}
              <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-['Plus_Jakarta_Sans',sans-serif]">
                <span className="text-[11px] font-medium">{visibleReview.role}</span>
                <span className="text-[#00C8D4] font-bold text-[11px] bg-[#00C8D4]/10 px-2.5 py-0.5 rounded-full">
                  Google Maps Oficial
                </span>
              </div>
            </div>

            {/* Segunda Tarjeta (Desktop) */}
            <div className="hidden md:flex bg-white/90 rounded-3xl p-8 sm:p-9 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-500 flex-col justify-between relative group hover:-translate-y-1">
              <Quote className="absolute top-6 right-6 w-12 h-12 text-slate-100 group-hover:text-[#FF0096]/15 transition-colors pointer-events-none stroke-[1]" />
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4">
                  <img
                    src={nextReview.avatar}
                    alt={nextReview.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-[#FF0096]/20"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-base text-slate-900 font-serif">
                        {nextReview.name}
                      </h4>
                      <CheckCircle2 className="w-4 h-4 text-[#00C8D4] fill-[#00C8D4]/15" />
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1 text-[#FF0096] font-semibold text-[11px]">
                        <MapPin className="w-3 h-3" />
                        {nextReview.location}
                      </span>
                      <span>•</span>
                      <span className="text-slate-400 text-[11px]">{nextReview.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(nextReview.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed font-['Inter',sans-serif] italic">
                  "{nextReview.content}"
                </p>
              </div>

              <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-['Plus_Jakarta_Sans',sans-serif]">
                <span className="text-[11px] font-medium">{nextReview.role}</span>
                <span className="text-[#00C8D4] font-bold text-[11px] bg-[#00C8D4]/10 px-2.5 py-0.5 rounded-full">
                  Google Maps Oficial
                </span>
              </div>
            </div>
          </div>

          {/* Controles de Navegación y Paginación del Carrusel */}
          <div className="flex items-center justify-between mt-8 pt-2">
            {/* Botón Anterior */}
            <button
              type="button"
              onClick={handlePrev}
              className="w-11 h-11 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-[#00C8D4] border border-slate-200 shadow-sm flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
              aria-label="Opinión anterior"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Puntos Indicadores */}
            <div className="flex items-center gap-2">
              {APARTO_REVIEWS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex
                      ? "w-8 bg-[#00C8D4]"
                      : "w-2 bg-slate-200 hover:bg-slate-300"
                  }`}
                  aria-label={`Ver testimonio ${idx + 1}`}
                />
              ))}
            </div>

            {/* Botón Siguiente */}
            <button
              type="button"
              onClick={handleNext}
              className="w-11 h-11 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-[#00C8D4] border border-slate-200 shadow-sm flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
              aria-label="Opinión siguiente"
            >
              <ChevronRight className="w-5 h-5 stroke-[2]" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
