import { MapPin, Phone, Mail, Facebook, Instagram, Sparkles } from 'lucide-react';

const LOGO_URL = 'https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/PERLA-NEGRA.png';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white py-16 relative overflow-hidden">
      {/* Decorative corner accents - curved */}
      <div className="absolute top-8 left-8 w-20 h-20 border-l border-t border-amber-500/20 rounded-tl-[2rem]" />
      <div className="absolute top-8 right-8 w-20 h-20 border-r border-t border-amber-500/20 rounded-tr-[2rem]" />
      <div className="absolute bottom-8 left-8 w-20 h-20 border-l border-b border-amber-500/20 rounded-bl-[2rem]" />
      <div className="absolute bottom-8 right-8 w-20 h-20 border-r border-b border-amber-500/20 rounded-br-[2rem]" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <img 
                src={LOGO_URL} 
                alt="Posada Perla Negra" 
                className="h-24 w-auto"
              />
            </div>
            <p className="text-white/70 mb-6 max-w-md leading-relaxed font-cursive text-lg">
              Su refugio en el corazón de Morrocoy. 
              18 años brindando experiencias inolvidables a familias venezolanas.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 border border-amber-500/30 hover:bg-amber-500 hover:border-amber-500 rounded-full flex items-center justify-center transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 border border-amber-500/30 hover:bg-amber-500 hover:border-amber-500 rounded-full flex items-center justify-center transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-luxury mb-4 text-lg text-amber-400">Contacto</h4>
            <div className="space-y-3">
              <a href="tel:+584144815321" className="flex items-center gap-3 text-white/70 hover:text-amber-400 transition-colors">
                <Phone className="w-4 h-4 text-amber-500" />
                +58 424-4242766
              </a>
              <a href="mailto:reservas@posadaperlanegra.com" className="flex items-center gap-3 text-white/70 hover:text-amber-400 transition-colors">
                <Mail className="w-4 h-4 text-amber-500" />
                reservas@posadaperlanegra.com
              </a>
              <div className="flex items-start gap-3 text-white/70">
                <MapPin className="w-4 h-4 text-amber-500 mt-1" />
                <span>Centro de Tucacas,<br />Parque Nacional Morrocoy,<br />Estado Falcón, Venezuela</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-luxury mb-4 text-lg text-amber-400">Enlaces</h4>
            <div className="space-y-3">
              <a href="#habitaciones" className="block text-white/70 hover:text-amber-400 transition-colors">
                Habitaciones
              </a>
              <a href="#reservar" className="block text-white/70 hover:text-amber-400 transition-colors">
                Reservar
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-amber-500/50" />
            <p className="text-white/50 text-sm tracking-wide">
              © 2025 POSADA PERLA NEGRA — TODOS LOS DERECHOS RESERVADOS
            </p>
            <Sparkles className="w-4 h-4 text-amber-500/50" />
          </div>
          <p className="text-white/50 text-sm">
            +58 424-4242766
          </p>
        </div>
      </div>
    </footer>
  );
}
