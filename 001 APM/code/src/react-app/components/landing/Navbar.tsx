import { useState, useEffect } from 'react';
import { Button } from '@/react-app/components/ui/button';
import { Menu, X } from 'lucide-react';

const LOGO_URL = 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/2-01.png';
const WHATSAPP_ICON = 'https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/w-removebg-preview.png';

interface NavbarProps {
  onReserveClick: () => void;
}

export function Navbar({ onReserveClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-transparent'
    }`} style={{ marginTop: isScrolled ? 0 : '6px' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <img 
              src={LOGO_URL} 
              alt="Aparto Posada del Mar" 
              className="h-14 w-auto"
            />
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a 
              href="#habitaciones" 
              className={`transition-colors font-medium ${
                isScrolled ? 'text-foreground hover:text-sky-600' : 'text-white/90 hover:text-white'
              }`}
            >
              Habitaciones
            </a>
            <a 
              href="#reservar" 
              className={`transition-colors font-medium ${
                isScrolled ? 'text-foreground hover:text-sky-600' : 'text-white/90 hover:text-white'
              }`}
            >
              Reservar
            </a>
            <Button 
              onClick={onReserveClick}
              className="rounded-full px-6 transition-all gradient-gold text-white border-0 flex items-center gap-2 hover:scale-105 hover:shadow-lg"
            >
              <img src={WHATSAPP_ICON} alt="WhatsApp" className="w-6 h-6 whatsapp-pulse" />
              Reserva!
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 ${isScrolled ? 'text-foreground' : 'text-white'}`}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white rounded-2xl shadow-xl p-6 mb-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col gap-4">
              <a 
                href="#habitaciones" 
                className="text-foreground hover:text-sky-600 py-2 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Habitaciones
              </a>
              <a 
                href="#reservar" 
                className="text-foreground hover:text-sky-600 py-2 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Reservar
              </a>
              <Button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onReserveClick();
                }}
                className="w-full gradient-gold text-white rounded-full mt-2 border-0 flex items-center justify-center gap-2 hover:shadow-lg"
              >
                <img src={WHATSAPP_ICON} alt="WhatsApp" className="w-6 h-6 whatsapp-pulse" />
                Reserva!
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
