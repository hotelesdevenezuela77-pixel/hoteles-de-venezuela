import { Button } from '@/react-app/components/ui/button';
import { MapPin, Star, Waves } from 'lucide-react';
import { Starfish, ShipWheel, TropicalFish, Seahorse } from './CaribbeanDecorations';

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
  // Parse title to handle "Playa" highlight
  const renderTitle = () => {
    const title = content.title;
    if (title.toLowerCase().includes('playa')) {
      const parts = title.split(/playa/i);
      return (
        <>
          <span className="font-serif italic">{parts[0]}</span>
          <span className="gradient-text-turquoise font-bold">Playa</span>
          {parts[1] && <span>{parts[1]}</span>}
        </>
      );
    }
    return <span className="font-serif italic">{title}</span>;
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1.5 gradient-tropical-bar z-50" />
      
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${content.imageUrl})`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
      </div>

      {/* Gradient fade to next section (white) */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-white/50 to-white" />

      {/* Caribbean decorative elements - well spaced */}
      <div className="absolute top-24 left-4 opacity-[0.08] text-white rotate-12">
        <Starfish className="w-20 h-20" />
      </div>
      <div className="absolute top-32 right-4 opacity-[0.06] text-white -rotate-12">
        <ShipWheel className="w-24 h-24" />
      </div>
      <div className="absolute bottom-36 left-4 opacity-[0.08] text-white rotate-6">
        <TropicalFish className="w-16 h-16" />
      </div>
      <div className="absolute bottom-36 right-4 opacity-[0.07] text-white -rotate-6">
        <Seahorse className="w-18 h-18" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-light text-white mb-4 tracking-tight">
          {renderTitle()}
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
          {content.subtitle}
          <span className="block mt-2 text-cyan-200">{content.highlightText}</span>
        </p>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          <div className="flex items-center gap-2 text-white/80">
            <MapPin className="w-4 h-4 text-cyan-300" />
            <span className="text-sm">Frente al Mar</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">4.9 Calificación</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <Waves className="w-4 h-4 text-cyan-300" />
            <span className="text-sm">Piscina & Playa</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={onReserveClick}
            className="gradient-gold text-white text-lg px-8 py-6 rounded-full shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl border-0 flex items-center gap-2"
          >
            <img src={WHATSAPP_ICON} alt="WhatsApp" className="w-7 h-7 whatsapp-pulse" />
            Reserva!
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-white text-white hover:bg-white/20 text-lg px-8 py-6 rounded-full backdrop-blur-sm"
            onClick={() => document.getElementById('habitaciones')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Ver Habitaciones
          </Button>
        </div>
      </div>
    </section>
  );
}
