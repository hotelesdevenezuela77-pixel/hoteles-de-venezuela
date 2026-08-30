import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'María González',
    location: 'Caracas, Venezuela',
    rating: 5,
    text: 'Una experiencia maravillosa. Las habitaciones muy limpias y la atención del personal es excelente. Definitivamente volveremos.',
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
    text: 'Viajamos en familia y fue perfecto. Los niños disfrutaron mucho y nosotros la tranquilidad del lugar. El personal muy amable siempre.',
    avatar: 'A'
  }
];

export function TestimonialsSection() {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-stone-50 via-white to-stone-50">
      {/* Decorative corner accents - curved */}
      <div className="absolute top-12 left-8 w-24 h-24 border-l border-t border-amber-400/20 rounded-tl-[2rem]" />
      <div className="absolute top-12 right-8 w-24 h-24 border-r border-t border-amber-400/20 rounded-tr-[2rem]" />
      <div className="absolute bottom-12 left-8 w-24 h-24 border-l border-b border-amber-400/20 rounded-bl-[2rem]" />
      <div className="absolute bottom-12 right-8 w-24 h-24 border-r border-b border-amber-400/20 rounded-br-[2rem]" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-amber-400" />
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="text-sm text-stone-600 tracking-[0.2em] uppercase font-medium">Testimonios</span>
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <div className="h-px w-8 bg-amber-400" />
          </div>
          <h2 className="text-4xl md:text-5xl text-foreground mb-4 font-luxury">
            Lo que dicen nuestros <span className="italic gradient-text-gold">huéspedes</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-cursive text-xl">
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
              <div className="bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-stone-200 h-full flex flex-col rounded-3xl">
                {/* Quote icon */}
                <div className="absolute -top-4 left-8">
                  <div className="w-10 h-10 gradient-gold flex items-center justify-center shadow-lg rounded-full">
                    <Quote className="w-5 h-5 text-stone-900" />
                  </div>
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4 mt-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-foreground/80 leading-relaxed flex-grow mb-6 text-[15px] font-cursive text-base">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-stone-200">
                  <div className="w-12 h-12 gradient-gold flex items-center justify-center rounded-full">
                    <span className="text-stone-900 font-bold text-lg">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-luxury text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-white shadow-lg border border-stone-200 rounded-full">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <div className="w-px h-8 bg-stone-200" />
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
