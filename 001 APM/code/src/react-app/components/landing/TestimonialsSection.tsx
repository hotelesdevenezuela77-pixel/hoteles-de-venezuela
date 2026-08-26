import { Star, Quote } from 'lucide-react';
import { Starfish, TropicalFish } from './CaribbeanDecorations';

const testimonials = [
  {
    name: 'María González',
    location: 'Caracas, Venezuela',
    rating: 5,
    text: 'Una experiencia maravillosa. La piscina es hermosa, las habitaciones muy limpias y la atención del personal es excelente. Definitivamente volveremos.',
    avatar: 'M'
  },
  {
    name: 'Carlos Rodríguez',
    location: 'Valencia, Venezuela',
    rating: 5,
    text: 'El mejor lugar para descansar en Tucacas. Muy cerca de la playa, estacionamiento seguro y los apartamentos tienen todo lo necesario. 100% recomendado.',
    avatar: 'C'
  },
  {
    name: 'Ana Martínez',
    location: 'Maracay, Venezuela',
    rating: 5,
    text: 'Viajamos en familia y fue perfecto. Los niños disfrutaron mucho la piscina y nosotros la tranquilidad del lugar. El personal muy amable siempre.',
    avatar: 'A'
  }
];

export function TestimonialsSection() {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-background via-amber-50/30 to-background">
      {/* Decorative elements */}
      <div className="absolute top-12 left-8 opacity-15 text-amber-500 rotate-12">
        <Starfish className="w-20 h-20" />
      </div>
      <div className="absolute bottom-12 right-8 opacity-15 text-cyan-500 -rotate-12">
        <TropicalFish className="w-16 h-16" />
      </div>
      
      {/* Subtle gradient orbs */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="text-sm text-amber-600 tracking-wider uppercase font-medium">Testimonios</span>
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-foreground mb-4">
            Lo que dicen nuestros <span className="font-serif italic text-cyan-600">huéspedes</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            La satisfacción de nuestros visitantes es nuestra mayor recompensa
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="relative group"
            >
              {/* Card */}
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full flex flex-col">
                {/* Quote icon */}
                <div className="absolute -top-4 left-8">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-lg">
                    <Quote className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4 mt-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-foreground/80 leading-relaxed flex-grow mb-6 text-[15px]">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-600 to-cyan-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </div>

              {/* Decorative shadow element */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-amber-500/20 rounded-3xl -z-10 translate-y-2 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>

        {/* Trust badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full bg-white shadow-lg border border-gray-100">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-left">
              <p className="font-bold text-foreground">4.9 de 5</p>
              <p className="text-sm text-muted-foreground">Basado en +200 reseñas</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
