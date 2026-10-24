import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Pause, Play, Sparkles, Camera } from "lucide-react";
import { type Language } from "../../lib/apartoTranslations";

export interface LocalizedCarouselSlide {
  id: string;
  image: string;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  tag: Record<Language, string>;
  category: Record<Language, string>;
}

export const APARTO_CAROUSEL_SLIDES: LocalizedCarouselSlide[] = [
  {
    id: "piscina-solarium",
    image: "/images/aparto-posada/piscina-cristalina-palmeras.jpg",
    title: {
      es: "Piscina Cristalina & Solárium Tropical",
      en: "Crystal-Clear Pool & Tropical Sun Deck"
    },
    subtitle: {
      es: "El corazón de su descanso con reposeras bajo el sol y palmeras caribeñas en Tucacas",
      en: "The heart of your retreat with poolside loungers and Caribbean palms in Tucacas"
    },
    tag: {
      es: "Instalación Central",
      en: "Central Facility"
    },
    category: {
      es: "Área de Piscina",
      en: "Pool Grounds"
    }
  },
  {
    id: "suite-matrimonial",
    image: "/images/aparto-posada/hab-matrimonial-vigas.jpg",
    title: {
      es: "Suites Matrimoniales con Techo de Vigas",
      en: "Beamed Ceiling King Matrimonial Suites"
    },
    subtitle: {
      es: "Confort íntimo con cama King, aire acondicionado continuo y baño privado impecable",
      en: "Intimate comfort featuring King bed, 24/7 air conditioning, and immaculate private bath"
    },
    tag: {
      es: "Descanso Exclusivo",
      en: "Exclusive Comfort"
    },
    category: {
      es: "Habitaciones VIP",
      en: "VIP Suites"
    }
  },
  {
    id: "vista-balcon",
    image: "/images/aparto-posada/vista-balcon-mar.jpg",
    title: {
      es: "Balcones con Vista Despejada a la Costa",
      en: "Balconies with Unobstructed Coastal Views"
    },
    subtitle: {
      es: "Despierte con la brisa salina y el horizonte hacia el Parque Nacional Morrocoy",
      en: "Wake up to ocean breezes and clear horizons overlooking Morrocoy National Park"
    },
    tag: {
      es: "Vistas Panorámicas",
      en: "Panoramic Views"
    },
    category: {
      es: "Exteriores",
      en: "Scenic Balconies"
    }
  },
  {
    id: "piscina-nocturna",
    image: "/images/aparto-posada/piscina-noche-led-aerea.jpg",
    title: {
      es: "Atmósfera Nocturna con Iluminación LED",
      en: "Night Ambience with Underwater LED Lighting"
    },
    subtitle: {
      es: "Un espejo de agua azul cristalino para disfrutar veladas serenas tras el atardecer",
      en: "A tranquil azure water mirror to enjoy serene evenings after sunset"
    },
    tag: {
      es: "Experiencia Nocturna",
      en: "Night Experience"
    },
    category: {
      es: "Piscina Iluminada",
      en: "Illuminated Pool"
    }
  },
  {
    id: "apartamento-familiar",
    image: "/images/aparto-posada/cocina-apartamento-nevera.jpg",
    title: {
      es: "Apartamentos con Cocina Equipada",
      en: "Apartments with Fully Equipped Kitchen"
    },
    subtitle: {
      es: "La comodidad de cocinar a su ritmo con nevera amplia, utensilios y total privacidad",
      en: "The freedom to cook at your own pace with large refrigerator, cookware, and full privacy"
    },
    tag: {
      es: "Independencia Total",
      en: "Complete Autonomy"
    },
    category: {
      es: "Apartamentos",
      en: "Family Apartments"
    }
  },
  {
    id: "caney-colonial",
    image: "/images/aparto-posada/pozo-agua-artesanal.jpg",
    title: {
      es: "Caney Colonial & Jardines de Descanso",
      en: "Colonial Gazebo & Shaded Rest Gardens"
    },
    subtitle: {
      es: "Parrilleras de carbón y áreas de sombra para compartir en familia al aire libre",
      en: "Charcoal grills and shaded outdoor lounge tables to share memorable moments"
    },
    tag: {
      es: "Zona Social",
      en: "Social Area"
    },
    category: {
      es: "Jardines & Parrilleras",
      en: "Gardens & Grills"
    }
  },
  {
    id: "terraza-mar",
    image: "/images/aparto-posada/terraza-privada-mar.jpg",
    title: {
      es: "Terrazas Privadas al Aire Libre",
      en: "Private Outdoor Terraces"
    },
    subtitle: {
      es: "Espacios reservados frente a la piscina para contemplar el cielo de Morrocoy",
      en: "Reserved outdoor spaces overlooking the pool to gaze at Morrocoy's skies"
    },
    tag: {
      es: "Exclusividad",
      en: "Exclusivity"
    },
    category: {
      es: "Terrazas",
      en: "Terraces"
    }
  }
];

interface LuxuryHeroCarouselProps {
  onOpenImage?: (imgUrl: string, caption: string) => void;
  language?: Language;
}

export function LuxuryHeroCarousel({ onOpenImage, language = "es" }: LuxuryHeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef<number | null>(null);

  const totalSlides = APARTO_CAROUSEL_SLIDES.length;
  const currentSlide = APARTO_CAROUSEL_SLIDES[currentIndex];

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

  const slideTitle = currentSlide.title[language] || currentSlide.title.es;
  const slideSubtitle = currentSlide.subtitle[language] || currentSlide.subtitle.es;
  const slideTag = currentSlide.tag[language] || currentSlide.tag.es;
  const slideCategory = currentSlide.category[language] || currentSlide.category.es;

  return (
    <div className="w-full max-w-6xl mx-auto mt-10 px-2 sm:px-4 font-roboto">
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
                  alt={slide.title[language]}
                  className="w-full h-full object-cover filter brightness-[1.03] contrast-[1.03] transition-transform duration-[7000ms] ease-out"
                  style={{
                    transform: isActive ? "scale(1.04)" : "scale(1.0)",
                    transitionDuration: "6000ms"
                  }}
                  loading={idx === 0 ? "eager" : "lazy"}
                />
              </div>
            );
          })}
        </div>

        {/* Barra Superior Flotante: Indicador de Slide + Botón Play/Pausa + Botón Ampliar HD */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-20 flex items-center justify-between pointer-events-auto">
          {/* Badge de Categoría */}
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest text-slate-900 bg-white/95 backdrop-blur-md shadow-lg border border-white/80 font-caviar flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#00C8D4] stroke-[2.5]" />
              <span>{slideTag}</span>
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
              className="p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-[#FF0096] transition-all shadow-md backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95 border border-white/60 font-roboto"
              title={isAutoPlaying ? "Pause auto-slide" : "Play auto-slide"}
              aria-label="Pause or play carousel"
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
                onClick={() => onOpenImage(currentSlide.image, slideTitle)}
                className="p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-[#00C8D4] transition-all shadow-md backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95 border border-white/60 flex items-center gap-1.5 text-xs font-semibold font-roboto"
                title="View Full HD"
              >
                <Maximize2 className="w-3.5 h-3.5 stroke-[2.2]" />
                <span className="hidden md:inline text-[11px]">
                  {language === "es" ? "Ver en HD" : "View in HD"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Controles Laterales: Flechas Discretas y Minimalistas */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-[#00C8D4] transition-all duration-300 shadow-xl backdrop-blur-md border border-white/80 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 opacity-80 group-hover:opacity-100"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2]" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-[#00C8D4] transition-all duration-300 shadow-xl backdrop-blur-md border border-white/80 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 opacity-80 group-hover:opacity-100"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6 stroke-[2]" />
        </button>

        {/* Ficha Inferior Flotante con Descripción e Indicadores (Glassmorphism sin tapar la foto) */}
        <div className="absolute bottom-0 inset-x-0 z-20 p-4 sm:p-6 pointer-events-none">
          <div className="max-w-2xl bg-black/40 backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/25 shadow-2xl pointer-events-auto space-y-1.5 text-left">
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#00C8D4] font-caviar">
              <Sparkles className="w-3 h-3 text-[#FF0096]" />
              <span>{slideCategory}</span>
            </div>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white tracking-tight font-montserrat drop-shadow-md leading-tight">
              {slideTitle}
            </h3>

            <p className="text-slate-100 text-xs sm:text-sm font-normal max-w-xl leading-relaxed font-roboto drop-shadow-sm line-clamp-2 sm:line-clamp-none">
              {slideSubtitle}
            </p>

            {/* Puntos Indicadores Inferiores Minimalistas */}
            <div className="flex items-center gap-2 pt-2">
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
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tira de Miniaturas Inferiores con Selector Rápido */}
      <div className="mt-4 hidden md:flex items-center justify-between gap-2.5 overflow-x-auto pb-2 scrollbar-none font-roboto">
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
                  : "border-slate-200/80 hover:border-slate-400 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="relative h-16 w-full overflow-hidden bg-slate-900">
                <img
                  src={slide.image}
                  alt={slide.title[language]}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-transparent group-hover:bg-white/10 transition-colors" />
                <span className="absolute bottom-1 left-2 text-[9px] font-medium text-white drop-shadow truncate max-w-[90%] font-caviar">
                  {slide.tag[language]}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
