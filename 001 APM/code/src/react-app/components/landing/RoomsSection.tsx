import { RoomCard } from './RoomCard';
import { Starfish, TropicalFish, ShipWheel, Seahorse } from './CaribbeanDecorations';

interface RoomsSectionContent {
  sectionTitle: string;
  sectionSubtitle: string;
  sectionDescription: string;
}

interface RoomDisplayItem {
  id: number;
  title: string;
  description: string;
  image: string;
  images: string[];
  capacity: number;
}

interface RoomsSectionProps {
  onReserve: (roomType: string) => void;
  content: RoomsSectionContent;
  roomsDisplay: RoomDisplayItem[];
}

export function RoomsSection({ onReserve, content, roomsDisplay }: RoomsSectionProps) {
  return (
    <section id="habitaciones" className="py-20 relative overflow-hidden">
      {/* Gradient background - same as BookingForm */}
      <div className="absolute inset-0 gradient-tropical" />
      {/* Decorative blurs */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-64 h-64 bg-cyan-300 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
      </div>
      {/* Bottom transition to white */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent" />
      {/* Floating Caribbean decorations - white, well spaced */}
      <div className="absolute top-8 left-4 opacity-10 text-white rotate-12">
        <Starfish className="w-16 h-16" />
      </div>
      <div className="absolute top-8 right-4 opacity-10 text-white -rotate-12">
        <ShipWheel className="w-20 h-20" />
      </div>
      <div className="absolute bottom-8 left-4 opacity-10 text-white rotate-6">
        <TropicalFish className="w-14 h-14" />
      </div>
      <div className="absolute bottom-8 right-4 opacity-10 text-white -rotate-6">
        <Seahorse className="w-14 h-14" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-3 text-white/80 mb-4">
            <Starfish className="w-5 h-5" />
            <span className="text-sm font-medium tracking-widest uppercase">{content.sectionSubtitle}</span>
            <Starfish className="w-5 h-5 scale-x-[-1]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
            <span className="font-serif italic">{content.sectionTitle}</span>
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">
            {content.sectionDescription}
          </p>
          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/50" />
            <Starfish className="w-4 h-4 text-amber-400" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/50" />
          </div>
        </div>

        {/* Room Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roomsDisplay.map((room) => (
            <RoomCard 
              key={room.id} 
              room={room} 
              onReserve={onReserve}
            />
          ))}
        </div>

        {/* Features highlight */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <FeatureItem 
            icon={<Starfish className="w-8 h-8 text-amber-500" />}
            title="Vista al Mar" 
            description="Todas nuestras habitaciones ofrecen vistas privilegiadas al océano o la piscina."
          />
          <FeatureItem 
            icon={<ShipWheel className="w-8 h-8 text-cyan-600" />}
            title="Atención 24/7" 
            description="Nuestro equipo está siempre disponible para hacer su estadía inolvidable."
          />
          <FeatureItem 
            icon={<TropicalFish className="w-8 h-8 text-teal-500" />}
            title="Ubicación Privilegiada" 
            description="A pasos de la playa y cerca de restaurantes, tiendas y atracciones locales."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/70 text-sm">{description}</p>
    </div>
  );
}
