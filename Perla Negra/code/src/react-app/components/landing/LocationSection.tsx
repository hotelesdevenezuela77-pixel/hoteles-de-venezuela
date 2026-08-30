import { MapPin, Clock, Car, Umbrella, Waves, Fish, Sparkles } from 'lucide-react';

const nearbyAttractions = [
  {
    icon: Umbrella,
    name: 'Playa Tucacas',
    distance: '5 min caminando'
  },
  {
    icon: Fish,
    name: 'Parque Nacional Morrocoy',
    distance: '10 min en lancha'
  },
  {
    icon: Waves,
    name: 'Cayos de Morrocoy',
    distance: '15-20 min en lancha'
  },
  {
    icon: Car,
    name: 'Centro de Tucacas',
    distance: '3 min caminando'
  }
];

export function LocationSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-white to-stone-100" />
      
      {/* Decorative corner accents */}
      <div className="absolute top-12 left-8 w-24 h-24 border-l border-t border-amber-400/30" />
      <div className="absolute top-12 right-8 w-24 h-24 border-r border-t border-amber-400/30" />
      <div className="absolute bottom-12 left-8 w-24 h-24 border-l border-b border-amber-400/30" />
      <div className="absolute bottom-12 right-8 w-24 h-24 border-r border-b border-amber-400/30" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-amber-400" />
            <MapPin className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-stone-600 tracking-[0.2em] uppercase font-medium">Ubicación</span>
            <div className="h-px w-8 bg-amber-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-foreground mb-4">
            En el corazón de <span className="font-serif italic gradient-text-gold">Tucacas</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ubicación privilegiada con fácil acceso a las mejores playas y cayos del Parque Nacional Morrocoy
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Map placeholder with styled container */}
          <div className="relative">
            <div className="relative overflow-hidden shadow-2xl border-4 border-white">
              {/* Google Maps embed */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1500!2d-68.31935609682579!3d10.79079269095667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ3JzI2LjkiTiA2OMKwMTknMDkuNyJX!5e0!3m2!1ses!2s!4v1699999999999!5m2!1ses!2s"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
              
              {/* Overlay with address */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone-900 via-stone-900/90 to-transparent p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 gradient-gold flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-stone-900" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Posada Perla Negra</p>
                    <p className="text-white/80 text-sm">Centro de Tucacas</p>
                    <p className="text-white/80 text-sm">Estado Falcón, Venezuela</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 gradient-gold p-4 shadow-xl">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-stone-900" />
                <div>
                  <p className="text-stone-900 font-bold text-sm">3.5 horas</p>
                  <p className="text-stone-800 text-xs">desde Caracas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Nearby attractions */}
          <div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              Todo cerca de usted
            </h3>
            <p className="text-muted-foreground mb-8">
              Disfrute de las mejores atracciones de la zona sin complicaciones
            </p>

            <div className="space-y-4">
              {nearbyAttractions.map((attraction, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 bg-white shadow-md hover:shadow-lg transition-shadow border border-stone-200 group"
                >
                  <div className="w-14 h-14 bg-stone-100 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                    <attraction.icon className="w-7 h-7 text-amber-600" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-foreground">{attraction.name}</h4>
                    <p className="text-sm text-muted-foreground">{attraction.distance}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 p-6 bg-gradient-to-br from-stone-900 to-stone-800 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="font-semibold">¿Necesita indicaciones?</h4>
              </div>
              <p className="text-white/70 text-sm mb-4">
                Contáctenos y le enviaremos la ubicación exacta por WhatsApp
              </p>
              <a 
                href="https://wa.me/584244242766?text=Hola,%20necesito%20indicaciones%20para%20llegar%20a%20Posada%20Perla%20Negra"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 gradient-gold text-stone-900 font-semibold transition-all hover:scale-105 text-sm"
              >
                <MapPin className="w-4 h-4" />
                Solicitar ubicación
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
