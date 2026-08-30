import { Palmtree, Sunset, UtensilsCrossed, Sparkles, Heart, Shield } from 'lucide-react';

const EXPERIENCE_IMAGE_1 = 'https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM(1).jpeg';
const EXPERIENCE_IMAGE_2 = 'https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/WhatsApp-Image-2026-04-20-at-9.36.30-PM.jpeg';

const highlights = [
  {
    icon: Palmtree,
    title: 'Ambiente Familiar',
    description: 'Espacio seguro y acogedor para toda la familia'
  },
  {
    icon: Sunset,
    title: 'Ubicación Central',
    description: 'En el corazón de Tucacas, cerca de todo'
  },
  {
    icon: UtensilsCrossed,
    title: 'Cocina Equipada',
    description: 'Apartamentos con todo lo necesario'
  },
  {
    icon: Shield,
    title: 'Seguridad 24/7',
    description: 'Estacionamiento vigilado incluido'
  }
];

export function ExperienceSection() {
  return (
    <section className="relative py-24 overflow-hidden bg-white">
      {/* Decorative line at bottom only */}
      <div className="absolute bottom-0 left-0 w-full h-1 gradient-elegant-bar" />
      
      {/* Decorative corner accents */}
      <div className="absolute top-16 left-8 w-24 h-24 border-l border-t border-amber-400/30" />
      <div className="absolute top-16 right-8 w-24 h-24 border-r border-t border-amber-400/30" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-4 py-2 border border-amber-300 mb-6">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-stone-700 tracking-[0.2em] uppercase">La Experiencia</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <h2 className="text-4xl md:text-6xl font-light text-stone-800 mb-6">
            Más que un <span className="font-serif italic gradient-text-gold">hospedaje</span>
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Ubicados en el corazón de Tucacas, ofrecemos la combinación perfecta entre 
            comodidad, naturaleza y la calidez del Caribe venezolano.
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Image collage */}
          <div className="relative">
            {/* Main image */}
            <div className="relative overflow-hidden shadow-2xl shadow-stone-900/20">
              <img 
                src={EXPERIENCE_IMAGE_1}
                alt="Fachada de noche"
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 to-transparent" />
            </div>
            
            {/* Secondary image - overlapping */}
            <div className="absolute -bottom-8 -right-8 w-2/3 overflow-hidden shadow-2xl shadow-stone-900/30 border-4 border-white">
              <img 
                src={EXPERIENCE_IMAGE_2}
                alt="Habitación"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            
            {/* Floating badge */}
            <div className="absolute top-6 left-6 gradient-gold p-4 shadow-xl">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-stone-900 fill-stone-900" />
                <div>
                  <p className="text-stone-900 font-bold text-lg">18+</p>
                  <p className="text-stone-800 text-xs">Años de experiencia</p>
                </div>
              </div>
            </div>
          </div>

          {/* Text content */}
          <div className="lg:pl-8">
            <h3 className="text-3xl md:text-4xl font-light text-stone-800 mb-6 leading-tight">
              Su <span className="gradient-text-gold font-semibold">refugio en Morrocoy</span>,<br />
              donde cada detalle importa
            </h3>
            
            <p className="text-stone-600 text-lg mb-8 leading-relaxed">
              En Posada Perla Negra, entendemos que sus vacaciones merecen ser perfectas. 
              Por eso hemos creado un espacio donde puede relajarse completamente y 
              estar a pocos pasos del Parque Nacional Morrocoy y sus hermosas playas.
            </p>

            {/* Highlights grid */}
            <div className="grid grid-cols-2 gap-4">
              {highlights.map((item, index) => (
                <div 
                  key={index}
                  className="group p-4 border border-stone-200 hover:border-amber-400 bg-stone-50 hover:bg-amber-50/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 gradient-gold flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <item.icon className="w-5 h-5 text-stone-900" />
                    </div>
                    <div>
                      <h4 className="text-stone-800 font-semibold text-sm mb-1">{item.title}</h4>
                      <p className="text-stone-500 text-xs leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { number: '21', label: 'Habitaciones', suffix: '' },
            { number: '4', label: 'Tipos de Alojamiento', suffix: '' },
            { number: '4.9', label: 'Calificación', suffix: '★' },
            { number: '18', label: 'Años de experiencia', suffix: '+' }
          ].map((stat, index) => (
            <div 
              key={index}
              className="text-center p-6 border border-stone-200 bg-stone-50"
            >
              <p className="text-4xl md:text-5xl font-bold gradient-text-gold">
                {stat.number}{stat.suffix}
              </p>
              <p className="text-stone-500 text-sm mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
