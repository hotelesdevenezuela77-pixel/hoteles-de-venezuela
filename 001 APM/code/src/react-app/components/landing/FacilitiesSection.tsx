import { Starfish, ShipWheel, TropicalFish, Seahorse } from './CaribbeanDecorations';

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
    <section id="instalaciones" className="relative py-20 bg-gradient-to-b from-sky-50 to-white overflow-hidden">
      {/* Floating Caribbean decorations */}
      <div className="absolute top-8 left-8 opacity-20">
        <Starfish className="w-16 h-16 text-cyan-500" />
      </div>
      <div className="absolute top-12 right-12 opacity-15">
        <ShipWheel className="w-20 h-20 text-teal-500" />
      </div>
      <div className="absolute bottom-16 left-16 opacity-15">
        <TropicalFish className="w-14 h-14 text-cyan-600" />
      </div>
      <div className="absolute bottom-8 right-8 opacity-20">
        <Seahorse className="w-16 h-16 text-teal-400" />
      </div>

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Starfish className="w-8 h-8 text-cyan-500" />
            <h2 className="text-4xl md:text-5xl font-serif text-sky-900">
              Nuestras Instalaciones
            </h2>
            <Starfish className="w-8 h-8 text-cyan-500" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre todos los espacios que hacen de nuestra posada el lugar perfecto para tus vacaciones
          </p>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {facilities.map((facility) => (
            <div 
              key={facility.id}
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={facility.image} 
                  alt={facility.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-sky-900/80 via-sky-900/20 to-transparent" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-semibold text-white mb-2">{facility.name}</h3>
                <p className="text-white/90 text-sm">{facility.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
