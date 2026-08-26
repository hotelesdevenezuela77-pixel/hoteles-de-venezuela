import { Palmtree, Sunset, UtensilsCrossed, Sparkles, Heart, Shield } from 'lucide-react';
import { Starfish, Seahorse } from './CaribbeanDecorations';

const EXPERIENCE_IMAGE_1 = 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-5.jpg';
const EXPERIENCE_IMAGE_2 = 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/apm-7.jpg';

const highlights = [
  {
    icon: Palmtree,
    title: 'Ambiente Tropical',
    description: 'Rodeado de palmeras y brisa marina'
  },
  {
    icon: Sunset,
    title: 'Atardeceres Únicos',
    description: 'Vistas espectaculares desde la piscina'
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
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-amber-400 to-cyan-400 opacity-60" />
      
      {/* Floating decorations - turquoise on white */}
      <div className="absolute top-20 right-10 opacity-15 text-cyan-500">
        <Starfish className="w-32 h-32" />
      </div>
      <div className="absolute bottom-20 left-10 opacity-15 text-teal-500">
        <Seahorse className="w-28 h-28" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 border border-cyan-200 mb-6">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-cyan-700 tracking-wider uppercase">La Experiencia</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-light text-slate-800 mb-6">
            Más que un <span className="font-serif italic text-cyan-600">hospedaje</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Ubicados en el corazón de Tucacas, ofrecemos la combinación perfecta entre 
            comodidad, naturaleza y la calidez del Caribe venezolano.
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Image collage */}
          <div className="relative">
            {/* Main image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-cyan-900/20">
              <img 
                src={EXPERIENCE_IMAGE_1}
                alt="Piscina de noche"
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/30 to-transparent" />
            </div>
            
            {/* Secondary image - overlapping */}
            <div className="absolute -bottom-8 -right-8 w-2/3 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-900/30 border-4 border-white">
              <img 
                src={EXPERIENCE_IMAGE_2}
                alt="Áreas comunes"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            
            {/* Floating badge */}
            <div className="absolute top-6 left-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-white fill-white" />
                <div>
                  <p className="text-white font-bold text-lg">+500</p>
                  <p className="text-white/90 text-xs">Huéspedes felices</p>
                </div>
              </div>
            </div>
          </div>

          {/* Text content */}
          <div className="lg:pl-8">
            <h3 className="text-3xl md:text-4xl font-light text-slate-800 mb-6 leading-tight">
              Su <span className="text-amber-500 font-semibold">casa en la playa</span>,<br />
              donde cada detalle importa
            </h3>
            
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              En Aparto Posada del Mar, entendemos que sus vacaciones merecen ser perfectas. 
              Por eso hemos creado un espacio donde puede relajarse completamente, disfrutar 
              de nuestra hermosa piscina, y estar a pocos pasos de las mejores playas de Falcón.
            </p>

            {/* Highlights grid */}
            <div className="grid grid-cols-2 gap-4">
              {highlights.map((item, index) => (
                <div 
                  key={index}
                  className="group p-4 rounded-2xl bg-cyan-50 border border-cyan-100 hover:bg-cyan-100 hover:border-cyan-300 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-slate-800 font-semibold text-sm mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-xs leading-relaxed">{item.description}</p>
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
            { number: '20', label: 'Habitaciones', suffix: '' },
            { number: '5', label: 'Edificios', suffix: '' },
            { number: '4.9', label: 'Calificación', suffix: '★' },
            { number: '10', label: 'Años de experiencia', suffix: '+' }
          ].map((stat, index) => (
            <div 
              key={index}
              className="text-center p-6 rounded-2xl bg-cyan-50 border border-cyan-100"
            >
              <p className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-500">
                {stat.number}{stat.suffix}
              </p>
              <p className="text-slate-500 text-sm mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
