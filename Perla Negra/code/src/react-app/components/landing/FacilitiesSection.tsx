import { Sparkles } from 'lucide-react';

interface FacilityItem {
  id: number;
  name: string;
  description: string;
  image: string;
}

interface FacilitiesSectionProps {
  facilities: FacilityItem[];
}

export function FacilitiesSection({ facilities }: FacilitiesSectionProps) {
  return (
    <section id="instalaciones" className="relative py-20 bg-gradient-to-b from-stone-50 to-white overflow-hidden">
      {/* Decorative elements - curved */}
      <div className="absolute top-12 left-8 w-24 h-24 border-l border-t border-amber-400/20 rounded-tl-[2rem]" />
      <div className="absolute top-12 right-8 w-24 h-24 border-r border-t border-amber-400/20 rounded-tr-[2rem]" />
      <div className="absolute bottom-12 left-8 w-24 h-24 border-l border-b border-amber-400/20 rounded-bl-[2rem]" />
      <div className="absolute bottom-12 right-8 w-24 h-24 border-r border-b border-amber-400/20 rounded-br-[2rem]" />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500" />
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500" />
          </div>
          <h2 className="text-4xl md:text-5xl font-luxury text-stone-800 mb-4">
            Nuestras Instalaciones
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-cursive text-xl">
            Descubre todos los espacios que hacen de nuestra posada el lugar perfecto para tus vacaciones
          </p>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {facilities.map((facility) => (
            <div 
              key={facility.id}
              className="group relative overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={facility.image} 
                  alt={facility.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/30 to-transparent" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-px bg-amber-400" />
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </div>
                <h3 className="text-2xl font-luxury text-white mb-2">{facility.name}</h3>
                <p className="text-white/80 text-sm font-cursive text-base">{facility.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
