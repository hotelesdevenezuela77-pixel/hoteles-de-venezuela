import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, Phone, Clock, Instagram, Facebook, ChevronDown, Waves, UtensilsCrossed, Users, Star } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://019d7ecf-79c1-7d77-a05b-1ab65717da61.mochausercontent.com/oleaje-logo.jpg" 
              alt="Oleaje"
              className="h-12 w-auto"
            />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('about')}
              className={`text-sm font-medium transition-colors ${scrolled ? 'text-foreground hover:text-[hsl(var(--ocean))]' : 'text-white hover:text-white/80'}`}
            >
              Nosotros
            </button>
            <button 
              onClick={() => scrollToSection('menu')}
              className={`text-sm font-medium transition-colors ${scrolled ? 'text-foreground hover:text-[hsl(var(--ocean))]' : 'text-white hover:text-white/80'}`}
            >
              Menú
            </button>

            <button 
              onClick={() => scrollToSection('contact')}
              className={`text-sm font-medium transition-colors ${scrolled ? 'text-foreground hover:text-[hsl(var(--ocean))]' : 'text-white hover:text-white/80'}`}
            >
              Contacto
            </button>
          </div>
          <button 
            onClick={() => navigate('/mesas')}
            className="px-5 py-2.5 rounded-full bg-[hsl(var(--ocean))] text-white text-sm font-medium hover:bg-[hsl(187,70%,35%)] transition-colors shadow-lg shadow-[hsl(var(--ocean))]/25"
          >
            Sistema POS
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img 
            src="https://019d7ecf-79c1-7d77-a05b-1ab65717da61.mochausercontent.com/IMG-20260415-WA0186.jpg" 
            alt="Vista Oleaje"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/60" />
            <span className="text-white/90 text-sm tracking-[0.3em] uppercase" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Restaurante & Bar</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/60" />
          </div>
          <h1 className="text-5xl md:text-7xl text-white mb-4" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}>
            El Placer de estar
          </h1>
          <p className="text-4xl md:text-6xl text-[hsl(180,80%,75%)] mb-8" style={{ fontFamily: "'Pinyon Script', cursive" }}>
            en el Mar
          </p>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>
            Disfruta de la mejor gastronomía marina en un ambiente único frente al océano. 
            Sabores frescos, atardeceres mágicos y momentos inolvidables.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => scrollToSection('menu')}
              className="px-8 py-4 rounded-full bg-white text-[hsl(var(--ocean))] font-semibold hover:bg-white/90 transition-colors shadow-xl"
            >
              Ver Menú
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="px-8 py-4 rounded-full border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Reservar Mesa
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <button 
          onClick={() => scrollToSection('about')}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 animate-bounce"
        >
          <ChevronDown className="w-8 h-8 text-white/80" />
        </button>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[hsl(var(--ocean))] tracking-[0.2em] uppercase text-sm" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>Nuestra Historia</span>
              <h2 className="text-4xl md:text-5xl mt-3 mb-6" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}>Un rincón <span className="italic">del paraíso</span></h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Oleaje nació de la pasión por el mar y la gastronomía. Desde hace más de una década, 
                hemos sido el destino favorito para quienes buscan disfrutar de mariscos frescos, 
                cócteles artesanales y vistas espectaculares del océano.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Nuestros chefs seleccionan cada día los mejores ingredientes del mar, creando 
                platos que celebran la tradición costera con toques de innovación culinaria.
              </p>
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-3xl font-bold text-[hsl(var(--ocean))]">15+</p>
                  <p className="text-sm text-muted-foreground">Años de experiencia</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[hsl(var(--ocean))]">50k+</p>
                  <p className="text-sm text-muted-foreground">Clientes felices</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[hsl(var(--ocean))]">4.9</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    Rating
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://019d7ecf-79c1-7d77-a05b-1ab65717da61.mochausercontent.com/IMG-20260416-WA0008.jpg" 
                alt="Interior Oleaje"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-[hsl(var(--ocean))] text-white p-6 rounded-xl shadow-xl">
                <UtensilsCrossed className="w-8 h-8 mb-2" />
                <p className="font-bold">Chef's Special</p>
                <p className="text-sm text-white/80">Cada día</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-border/50 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-[hsl(var(--ocean-light))] flex items-center justify-center mb-5">
                <Waves className="w-7 h-7 text-[hsl(var(--ocean))]" />
              </div>
              <h3 className="text-xl mb-3" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>Vista al Mar</h3>
              <p className="text-muted-foreground">
                Disfruta de espectaculares vistas al océano mientras degusts nuestros platillos en nuestras terrazas al aire libre.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-border/50 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-[hsl(var(--ocean-light))] flex items-center justify-center mb-5">
                <UtensilsCrossed className="w-7 h-7 text-[hsl(var(--ocean))]" />
              </div>
              <h3 className="text-xl mb-3" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>Mariscos Frescos</h3>
              <p className="text-muted-foreground">
                Trabajamos con pescadores locales para traerte los mariscos más frescos del día, directamente a tu mesa.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-border/50 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-[hsl(var(--ocean-light))] flex items-center justify-center mb-5">
                <Users className="w-7 h-7 text-[hsl(var(--ocean))]" />
              </div>
              <h3 className="text-xl mb-3" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>Eventos Privados</h3>
              <p className="text-muted-foreground">
                Contamos con espacios VIP perfectos para celebraciones, bodas y eventos corporativos frente al mar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Preview Section */}
      <section id="menu" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[hsl(var(--ocean))] tracking-[0.2em] uppercase text-sm" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>Nuestra Carta</span>
            <h2 className="text-4xl md:text-5xl mt-3 mb-4" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}>Sabores <span className="italic">del Mar</span></h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Descubre nuestra selección de platos preparados con los ingredientes más frescos del océano
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Ceviche Clásico', desc: 'Pescado fresco marinado en limón con cebolla morada y ají', price: '$18.00', image: 'https://019d7ecf-79c1-7d77-a05b-1ab65717da61.mochausercontent.com/IMG-20260410-WA0045.jpg' },
              { name: 'Pulpo a la Parrilla', desc: 'Pulpo tierno a las brasas con chimichurri y papas doradas', price: '$28.00', image: 'https://019d7ecf-79c1-7d77-a05b-1ab65717da61.mochausercontent.com/IMG-20260410-WA0046.jpg' },
              { name: 'Arroz con Mariscos', desc: 'Arroz caldoso con camarones, calamares y mejillones', price: '$24.00', image: 'https://019d7ecf-79c1-7d77-a05b-1ab65717da61.mochausercontent.com/IMG-20260410-WA0047.jpg' },
              { name: 'Langosta Thermidor', desc: 'Media langosta gratinada con salsa cremosa al cognac', price: '$45.00', image: 'https://019d7ecf-79c1-7d77-a05b-1ab65717da61.mochausercontent.com/IMG-20260415-WA0189.jpg' },
              { name: 'Cóctel Blue Lagoon', desc: 'Refrescante cóctel con vodka, curaçao y limón', price: '$12.00', image: 'https://019d7ecf-79c1-7d77-a05b-1ab65717da61.mochausercontent.com/IMG-20260421-WA0003.jpg' },
              { name: 'Sangría Tropical', desc: 'Nuestra famosa sangría con frutas frescas del día', price: '$10.00', image: 'https://019d7ecf-79c1-7d77-a05b-1ab65717da61.mochausercontent.com/IMG-20260421-WA0004.jpg' },
            ].map((dish, index) => (
              <div key={index} className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={dish.image} 
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>{dish.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{dish.desc}</p>
                    </div>
                    <span className="text-lg font-bold text-[hsl(var(--ocean))] whitespace-nowrap">{dish.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button 
              onClick={() => navigate('/mesas')}
              className="px-8 py-4 rounded-full bg-[hsl(var(--ocean))] text-white font-semibold hover:bg-[hsl(187,70%,35%)] transition-colors shadow-lg shadow-[hsl(var(--ocean))]/25"
            >
              Ver Menú Completo
            </button>
          </div>
        </div>
      </section>



      {/* Contact Section */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <span className="text-[hsl(var(--ocean))] tracking-[0.2em] uppercase text-sm" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>Contacto</span>
              <h2 className="text-4xl md:text-5xl mt-3 mb-6" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}><span className="italic">Visítanos</span></h2>
              <p className="text-muted-foreground text-lg mb-10" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Estamos ubicados en la mejor zona costera. Ven a disfrutar de nuestros sabores 
                y la mejor vista del atardecer.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[hsl(var(--ocean-light))] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[hsl(var(--ocean))]" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Dirección</h4>
                    <p className="text-muted-foreground">Av. Costanera 1234, Playa Principal<br/>Zona Costera, CP 12345</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[hsl(var(--ocean-light))] flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[hsl(var(--ocean))]" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Teléfono</h4>
                    <p className="text-muted-foreground">+58 424-4242766</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[hsl(var(--ocean-light))] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[hsl(var(--ocean))]" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Horario</h4>
                    <p className="text-muted-foreground">
                      Lunes a Jueves: 12:00 PM - 10:00 PM<br/>
                      Viernes a Domingo: 11:00 AM - 12:00 AM
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-10">
                <a href="#" className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center hover:bg-[hsl(var(--ocean))] hover:text-white transition-colors">
                  <Instagram size={22} />
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center hover:bg-[hsl(var(--ocean))] hover:text-white transition-colors">
                  <Facebook size={22} />
                </a>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8">
              <h3 className="text-2xl mb-6" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>Reserva tu <span className="italic">Mesa</span></h3>
              <form className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-[hsl(var(--ocean))] focus:ring-2 focus:ring-[hsl(var(--ocean))]/20 outline-none transition-all"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Teléfono</label>
                    <input 
                      type="tel" 
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-[hsl(var(--ocean))] focus:ring-2 focus:ring-[hsl(var(--ocean))]/20 outline-none transition-all"
                      placeholder="+58 424-4242766"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-[hsl(var(--ocean))] focus:ring-2 focus:ring-[hsl(var(--ocean))]/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hora</label>
                    <select className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-[hsl(var(--ocean))] focus:ring-2 focus:ring-[hsl(var(--ocean))]/20 outline-none transition-all">
                      <option>12:00 PM</option>
                      <option>1:00 PM</option>
                      <option>2:00 PM</option>
                      <option>7:00 PM</option>
                      <option>8:00 PM</option>
                      <option>9:00 PM</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Número de personas</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-[hsl(var(--ocean))] focus:ring-2 focus:ring-[hsl(var(--ocean))]/20 outline-none transition-all">
                    <option>2 personas</option>
                    <option>3-4 personas</option>
                    <option>5-6 personas</option>
                    <option>7-10 personas</option>
                    <option>Más de 10 personas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Comentarios (opcional)</label>
                  <textarea 
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-[hsl(var(--ocean))] focus:ring-2 focus:ring-[hsl(var(--ocean))]/20 outline-none transition-all resize-none"
                    rows={3}
                    placeholder="Ocasión especial, preferencias..."
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 rounded-xl bg-[hsl(var(--ocean))] text-white font-semibold hover:bg-[hsl(187,70%,35%)] transition-colors shadow-lg shadow-[hsl(var(--ocean))]/25"
                >
                  Confirmar Reservación
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img 
                src="https://019d7ecf-79c1-7d77-a05b-1ab65717da61.mochausercontent.com/oleaje-logo.jpg" 
                alt="Oleaje"
                className="h-12 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-slate-400 text-sm">
              © 2024 Oleaje Restaurante & Bar. Todos los derechos reservados.
            </p>
            <p className="text-slate-400 text-xl" style={{ fontFamily: "'Pinyon Script', cursive" }}>
              "El Placer de estar en el mar"
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
