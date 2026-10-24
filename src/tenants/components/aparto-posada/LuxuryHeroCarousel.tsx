import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Pause, Play, Sparkles, Camera } from "lucide-react";

export interface CarouselSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  tag: string;
  category: string;
}

export const APARTO_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: "piscina-solarium",
    image: "/images/aparto-posada/piscina-cristalina-palmeras.jpg",
    title: "Piscina Cristalina & Solárium Tropical",
    subtitle: "El corazón de su descanso con reposeras bajo el sol y palmeras caribeñas en Tucacas",
    tag: "Instalación Central",
    category: "Área de Piscina"
  },
  {
    id: "suite-matrimonial",
    image: "/images/aparto-posada/hab-matrimonial-vigas.jpg",
    title: "Suites Matrimoniales con Techo de Vigas",
    subtitle: "Confort íntimo con cama King, aire acondicionado continuo y baño privado impecable",
    tag: "Descanso Exclusivo",
    category: "Habitaciones VIP"
  },
  {
    id: "vista-balcon",
    image: "/images/aparto-posada/vista-balcon-mar.jpg",
    title: "Balcones con Vista Despejada a la Costa",
    subtitle: "Despierte con la brisa salina y el horizonte hacia el Parque Nacional Morrocoy",
    tag: "Vistas Panorámicas",
    category: "Exteriores"
  },
  {
    id: "piscina-nocturna",
    image: "/images/aparto-posada/piscina-noche-led-aerea.jpg",
    title: "Atmósfera Nocturna con Iluminación LED",
    subtitle: "Un espejo de agua azul cristalino para disfrutar veladas serenas tras el atardecer",
    tag: "Experiencia Nocturna",
    category: "Piscina Iluminada"
  },
  {
    id: "apartamento-familiar",
    image: "/images/aparto-posada/cocina-apartamento-nevera.jpg",
    title: "Apartamentos con Cocina Equipada",
    subtitle: "La comodidad de cocinar a su ritmo con nevera amplia, utensilios y total privacidad",
    tag: "Independencia Total",
    category: "Apartamentos"
  },
  {
    id: "caney-colonial",
    image: "/images/aparto-posada/pozo-agua-artesanal.jpg",
    title: "Caney Colonial & Jardines de Descanso",
    subtitle: "Parrilleras de carbón y áreas de sombra para compartir en familia al aire libre",
    tag: "Zona Social",
    category: "Jardines & Parrilleras"
  },
  {
    id: "terraza-mar",
    image: "/images/aparto-posada/terraza-privada-mar.jpg",
    title: "Terrazas Privadas al Aire Libre",
    subtitle: "Espacios reservados frente a la piscina para contemplar el cielo de Morrocoy",
    tag: "Exclusividad",
    category: "Terrazas"
  }
];

interface LuxuryHeroCarouselProps {
  onOpenImage?: (imgUrl: string, caption: string) => void;
}

export function LuxuryHeroCarousel({ onOpenImage }: LuxuryHeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef<number | null>(null);

  const totalSlides = APARTO_CAROUSEL_SLIDES.length;
  const currentSlide = APARTO_CAROUSEL_SLIDES[currentIndex];

  // Auto-play timer (4.5s) con pausa al hover
  useEffect(() => {
    if (!isAutoPlaying || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 4500);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isPaused, totalSlides]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
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

  return (
    <div className="w-full max-w-6xl mx-auto mt-10 px-2 sm:px-4">
      {/* Marco Principal del Carrusel */}
      <div
        className="relative rounded-3xl sm:rounded-[2.5rem] overflow-hidden bg-slate-900 border border-slate-200/90 shadow-2xl group select-none transition-all duration-300"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ minHeight: "380px" }}
      >
        {/* Imagen del Slide con Transición Suave */}
        <div className="relative h-[420px] sm:h-[500px] md:h-[560px] w-full overflow-hidden">
          {APARTO_CAROUSEL_SLIDES.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105 pointer-events-none"
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover filter brightness-[1.03] contrast-[1.03] transition-transform duration-[7000ms] ease-out"
                  style={{
                    transform: isActive ? "scale(1.04)" : "scale(1.0)",
                    transitionDuration: "6000ms"
                  }}
                  loading={idx === 0 ? "eager" : "lazy"}
                />

                {/* Sutil gradiente para asegurar legibilidad impecable sin apagar la imagen */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e011f]/90 via-[#0e011f]/30 to-transparent pointer-events-none" />
              </div>
            );
          })}
        </div>

        {/* Barra Superior Flotante: Indicador de Slide + Botón Play/Pausa + Botón Ampliar HD */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20 flex items-center justify-between pointer-events-auto">
          {/* Badge de Categoría */}
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-900 bg-white/95 backdrop-blur-md shadow-lg border border-white/80 font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#00C8D4] stroke-[2.5]" />
              <span>{currentSlide.tag}</span>
            </span>

            {/* Contador de Slide Elegante */}
            <span className="hidden sm:inline-flex px-3 py-1.5 rounded-full text-[11px] font-bold text-white bg-black/40 backdrop-blur-md border border-white/20 font-mono">
              {String(currentIndex + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
            </span>
          </div>

          {/* Acciones Superiores: Pausa/Play y Zoom HD */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-[#FF0096] transition-all shadow-md backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95 border border-white/60"
              title={isAutoPlaying ? "Pausar reproducción automática" : "Reanudar reproducción automática"}
              aria-label="Pausar o reanudar carrusel"
            >
              {isAutoPlaying && !isPaused ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
            </button>

            {onOpenImage && (
              <button
                type="button"
                onClick={() => onOpenImage(currentSlide.image, currentSlide.title)}
                className="p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-[#00C8D4] transition-all shadow-md backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95 border border-white/60 flex items-center gap-1.5 text-xs font-bold"
                title="Ampliar en pantalla completa"
              >
                <Maximize2 className="w-3.5 h-3.5 stroke-[2.2]" />
                <span className="hidden md:inline text-[11px] font-['Plus_Jakarta_Sans',sans-serif]">Ver en HD</span>
              </button>
            )}
          </div>
        </div>

        {/* Controles Laterales: Flechas Discretas y Minimalistas */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-[#00C8D4] transition-all duration-300 shadow-xl backdrop-blur-md border border-white/80 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 opacity-80 group-hover:opacity-100"
          aria-label="Imagen anterior"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2]" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-[#00C8D4] transition-all duration-300 shadow-xl backdrop-blur-md border border-white/80 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 opacity-80 group-hover:opacity-100"
          aria-label="Imagen siguiente"
        >
          <ChevronRight className="w-6 h-6 stroke-[2]" />
        </button>

        {/* Ficha Inferior Flotante con Descripción e Indicadores */}
        <div className="absolute bottom-0 inset-x-0 z-20 p-5 sm:p-8 bg-gradient-to-t from-[#0e011f] via-[#0e011f]/85 to-transparent">
          <div className="max-w-3xl space-y-2 text-left">
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-[#00C8D4] font-['Plus_Jakarta_Sans',sans-serif]">
              <Sparkles className="w-3 h-3 text-[#FF0096]" />
              <span>{currentSlide.category}</span>
            </div>

            <h3 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight font-serif drop-shadow-md leading-tight">
              {currentSlide.title}
            </h3>

            <p className="text-slate-200 text-xs sm:text-sm font-normal max-w-2xl leading-relaxed font-['Inter',sans-serif] drop-shadow-sm line-clamp-2 sm:line-clamp-none">
              {currentSlide.subtitle}
            </p>
          </div>

          {/* Puntos Indicadores Inferiores Minimalistas */}
          <div className="flex items-center gap-2 pt-4">
            {APARTO_CAROUSEL_SLIDES.map((_, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                    isSelected
                      ? "w-8 bg-gradient-to-r from-[#00C8D4] to-[#FF0096] shadow-md shadow-[#00C8D4]/50"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Ir a imagen ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Tira de Miniaturas Inferiores con Selector Rápido */}
      <div className="mt-4 hidden md:flex items-center justify-between gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {APARTO_CAROUSEL_SLIDES.map((slide, idx) => {
          const isSelected = idx === currentIndex;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`group flex-1 min-w-[120px] rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer text-left relative ${
                isSelected
                  ? "border-[#00C8D4] shadow-lg shadow-[#00C8D4]/20 scale-[1.02] ring-2 ring-[#00C8D4]/30"
                  : "border-slate-200/80 hover:border-slate-400 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="relative h-16 w-full overflow-hidden bg-slate-900">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors" />
                <span className="absolute bottom-1 left-2 text-[9px] font-bold text-white drop-shadow truncate max-w-[90%] font-['Plus_Jakarta_Sans',sans-serif]">
                  {slide.tag}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
