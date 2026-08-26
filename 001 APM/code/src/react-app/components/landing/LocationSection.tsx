import { MapPin, Clock, Car, Umbrella, Waves, Fish } from 'lucide-react';
import { Seahorse, ShipWheel } from './CaribbeanDecorations';

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
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-cyan-50" />
      
      {/* Decorative elements */}
      <div className="absolute top-16 right-12 opacity-15 text-cyan-500">
        <ShipWheel className="w-24 h-24" />
      </div>
      <div className="absolute bottom-16 left-12 opacity-15 text-teal-500">
        <Seahorse className="w-20 h-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-cyan-600" />
            <span className="text-sm text-cyan-600 tracking-wider uppercase font-medium">Ubicación</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-foreground mb-4">
            En el corazón de <span className="font-serif italic text-cyan-600">Tucacas</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ubicación privilegiada con fácil acceso a las mejores playas y cayos del Parque Nacional Morrocoy
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Map placeholder with styled container */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
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
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-sky-900 via-sky-900/90 to-transparent p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Aparto Posada del Mar</p>
                    <p className="text-white/80 text-sm">Av. Silva, Diagonal a Plaza el Ancla</p>
                    <p className="text-white/80 text-sm">Tucacas 2055, Estado Falcón</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-white" />
                <div>
                  <p className="text-white font-bold text-sm">3.5 horas</p>
                  <p className="text-white/90 text-xs">desde Caracas</p>
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
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-md hover:shadow-lg transition-shadow border border-gray-100 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-100 to-sky-100 flex items-center justify-center group-hover:from-cyan-500 group-hover:to-teal-500 transition-colors">
                    <attraction.icon className="w-7 h-7 text-cyan-600 group-hover:text-white transition-colors" />
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
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-sky-900 to-blue-950 text-white">
              <h4 className="font-semibold mb-2">¿Necesita indicaciones?</h4>
              <p className="text-white/80 text-sm mb-4">
                Contáctenos y le enviaremos la ubicación exacta por WhatsApp
              </p>
              <a 
                href="https://wa.me/584144815321?text=Hola,%20necesito%20indicaciones%20para%20llegar%20a%20la%20posada"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-sm font-medium"
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
