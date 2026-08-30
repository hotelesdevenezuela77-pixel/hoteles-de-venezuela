import { RoomCard } from './RoomCard';
import { Sparkles, Users, Clock, MapPin } from 'lucide-react';

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
      {/* Elegant dark background */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900" />
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      {/* Bottom transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-50 via-stone-50/50 to-transparent" />
      
      {/* Decorative corner accents - curved */}
      <div className="absolute top-12 left-8 w-32 h-32 border-l border-t border-amber-500/20 rounded-tl-[3rem]" />
      <div className="absolute top-12 right-8 w-32 h-32 border-r border-t border-amber-500/20 rounded-tr-[3rem]" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-3 text-amber-400 mb-4">
            <div className="h-px w-8 bg-amber-400" />
            <span className="text-sm font-medium tracking-[0.3em] uppercase">{content.sectionSubtitle}</span>
            <div className="h-px w-8 bg-amber-400" />
          </div>
          <h2 className="text-4xl md:text-5xl text-white mb-4 font-luxury">
            {content.sectionTitle}
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-lg font-cursive text-xl">
            {content.sectionDescription}
          </p>
          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/50" />
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/50" />
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
            icon={<Users className="w-8 h-8 text-amber-400" />}
            title="Lugar Familiar" 
            description="Un ambiente acogedor y seguro para disfrutar con toda su familia."
          />
          <FeatureItem 
            icon={<Clock className="w-8 h-8 text-amber-400" />}
            title="18 Años de Experiencia" 
            description="Brindando hospitalidad y servicio de calidad desde 2007."
          />
          <FeatureItem 
            icon={<MapPin className="w-8 h-8 text-amber-400" />}
            title="Centro de Tucacas" 
            description="Ubicación privilegiada cerca de restaurantes, tiendas y el muelle."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center p-6 border border-amber-500/20 bg-stone-800/50 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-300 rounded-3xl">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-luxury text-white mb-2">{title}</h3>
      <p className="text-white/60 text-sm font-cursive text-base">{description}</p>
    </div>
  );
}
