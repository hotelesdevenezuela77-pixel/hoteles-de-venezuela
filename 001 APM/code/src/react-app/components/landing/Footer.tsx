import { MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react';
import { Starfish, ShipWheel, TropicalFish, Seahorse } from './CaribbeanDecorations';

const LOGO_URL = 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/2-01.png';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-sky-950 to-blue-950 text-white py-16 relative overflow-hidden">
      {/* Caribbean decorative elements - well spaced in corners */}
      <div className="absolute top-8 left-4 opacity-[0.06] text-white rotate-12">
        <Starfish className="w-20 h-20" />
      </div>
      <div className="absolute top-8 right-4 opacity-[0.06] text-white -rotate-12">
        <ShipWheel className="w-24 h-24" />
      </div>
      <div className="absolute bottom-8 left-4 opacity-[0.06] text-white rotate-6">
        <TropicalFish className="w-16 h-16" />
      </div>
      <div className="absolute bottom-8 right-4 opacity-[0.06] text-white -rotate-6">
        <Seahorse className="w-18 h-18" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <img 
                src={LOGO_URL} 
                alt="Aparto Posada del Mar" 
                className="h-24 w-auto"
              />
            </div>
            <p className="text-white/70 mb-6 max-w-md leading-relaxed">
              Su hogar lejos de casa, donde el mar y la comodidad se encuentran. 
              Más de 20 habitaciones diseñadas para crear recuerdos inolvidables.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-cyan-600 rounded-full flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-cyan-600 rounded-full flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Contacto</h4>
            <div className="space-y-3">
              <a href="tel:+584144815321" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-cyan-400" />
                +58 414-4815321
              </a>
              <a href="mailto:reservas@apartoposadadelmar.net" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-cyan-400" />
                reservas@apartoposadadelmar.net
              </a>
              <div className="flex items-start gap-3 text-white/70">
                <MapPin className="w-4 h-4 text-cyan-400 mt-1" />
                <span>Av. Silva, Diagonal a Plaza el Ancla,<br />Tucacas 2055, Falcón</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Enlaces</h4>
            <div className="space-y-3">
              <a href="#habitaciones" className="block text-white/70 hover:text-white transition-colors">
                Habitaciones
              </a>
              <a href="#reservar" className="block text-white/70 hover:text-white transition-colors">
                Reservar
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Starfish className="w-4 h-4 text-amber-400/50" />
            <p className="text-white/50 text-sm">
              © 2025 TODOS LOS DERECHOS RESERVADOS – APARTO POSADA DEL MAR
            </p>
            <Starfish className="w-4 h-4 text-amber-400/50 scale-x-[-1]" />
          </div>
          <p className="text-white/50 text-sm">
            +58 414-4815321
          </p>
        </div>
      </div>
    </footer>
  );
}
