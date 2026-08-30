import { Button } from '@/react-app/components/ui/button';
import { MapPin, Star, Clock, Sparkles } from 'lucide-react';

const WHATSAPP_ICON = 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/w-removebg-preview.png';

interface BannerContent {
  imageUrl: string;
  title: string;
  subtitle: string;
  highlightText: string;
}

interface HeroProps {
  onReserveClick: () => void;
  content: BannerContent;
}

export function Hero({ onReserveClick, content }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Elegant gold bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1 gradient-elegant-bar z-50" />
      
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("${content.imageUrl}")`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      </div>

      {/* Decorative corner accents - curved style */}
      <div className="absolute top-20 left-8 w-24 h-24 border-l-2 border-t-2 border-amber-400/30 rounded-tl-3xl" />
      <div className="absolute top-20 right-8 w-24 h-24 border-r-2 border-t-2 border-amber-400/30 rounded-tr-3xl" />
      <div className="absolute bottom-32 left-8 w-24 h-24 border-l-2 border-b-2 border-amber-400/30 rounded-bl-3xl" />
      <div className="absolute bottom-32 right-8 w-24 h-24 border-r-2 border-b-2 border-amber-400/30 rounded-br-3xl" />

      {/* Gradient fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-stone-50/50 to-stone-50" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
        {/* Decorative element */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400" />
          <Sparkles className="w-5 h-5 text-amber-400" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400" />
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl text-white mb-6 tracking-wide font-luxury">
          {content.title}
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-white/90 mb-4 max-w-2xl mx-auto font-cursive text-[1.4rem] md:text-[1.7rem] leading-relaxed">
          {content.subtitle}
        </p>
        <p className="text-lg text-amber-300 mb-10 font-elegant font-medium tracking-wide">
          {content.highlightText}
        </p>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="text-sm tracking-wide">Centro de Tucacas</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-sm tracking-wide">18 Años de Experiencia</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm tracking-wide">Lugar Familiar</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={onReserveClick}
            className="gradient-gold text-stone-900 font-semibold text-lg px-10 py-6 rounded-full shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl border-0 flex items-center gap-3"
          >
            <img src={WHATSAPP_ICON} alt="WhatsApp" className="w-7 h-7 whatsapp-pulse" />
            Reservar Ahora
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-amber-400 text-amber-400 hover:bg-amber-400/20 text-lg px-10 py-6 rounded-full backdrop-blur-sm font-medium tracking-wide"
            onClick={() => document.getElementById('habitaciones')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Ver Habitaciones
          </Button>
        </div>
      </div>
    </section>
  );
}
