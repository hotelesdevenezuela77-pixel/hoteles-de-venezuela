import React from "react";
import { useTenant } from "../tenantContext";
import { Menu, X, Hotel, Phone, Compass, MapPin } from "lucide-react";

interface GradientHeaderProps {
  preTitle?: string;
  title?: string;
  subtitle?: string;
  showNav?: boolean;
}

export function GradientHeader({
  preTitle = "EXPERIENCIA EXCLUSIVA",
  title,
  subtitle,
  showNav = true,
}: GradientHeaderProps) {
  const { config } = useTenant();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const headerTitle = title || config.name;
  const headerSubtitle = subtitle || `Descubre el confort y la exclusividad en ${config.name}`;
  
  // Clases dinámicas de tipografía según config
  const titleFontClass = config.branding.font_title === "Cinzel" ? "font-serif tracking-wider" : "font-serif";
  const bodyFontClass = config.branding.font_body === "Outfit" ? "font-sans font-light" : "font-sans";

  return (
    <header className="relative w-full overflow-hidden select-none">
      
      {/* 1. Barra de Navegación Premium con Glassmorphism y Oscuros de Contraste (#0e011f y #1a0533) */}
      {showNav && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0e011f]/80 backdrop-blur-md border-b border-[#1a0533]/50 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              
              {/* Logo / Nombre del Inquilino */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-[#00C8D4] to-[#9B00CC] flex items-center justify-center shadow-lg shadow-[#00C8D4]/10">
                  {/* Icono unicolor en caja sólida con vector blanco puro */}
                  <Hotel className="w-5 h-5 text-white" />
                </div>
                <span className={`text-white text-base font-extrabold tracking-wide ${titleFontClass}`}>
                  {config.name}
                </span>
              </div>

              {/* Enlaces Desktop */}
              <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-300">
                <a href="#inicio" className="hover:text-[#00C8D4] transition-colors duration-200">Inicio</a>
                <a href="#habitaciones" className="hover:text-[#00C8D4] transition-colors duration-200">Habitaciones</a>
                {config.modules.pos && (
                  <a href="#pos" className="hover:text-[#FF0096] transition-colors duration-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF0096] animate-pulse"></span>
                    Club POS
                  </a>
                )}
                <a href="#servicios" className="hover:text-[#00C8D4] transition-colors duration-200">Servicios</a>
                <a href="#galeria" className="hover:text-[#00C8D4] transition-colors duration-200">Galería</a>
                <a href="#contacto" className="hover:text-[#00C8D4] transition-colors duration-200">Contacto</a>
              </div>

              {/* Acciones */}
              <div className="hidden md:flex items-center gap-4">
                <a 
                  href={`https://wa.me/${config.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white text-xs font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-[#FF0096]/20 hover:scale-105 transition-all duration-200"
                >
                  Reservar Ahora
                </a>
              </div>

              {/* Botón menú móvil */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg bg-[#1a0533] text-slate-300 hover:text-white border border-[#9B00CC]/20"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

            </div>
          </div>

          {/* Menú Móvil */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-[#1a0533] border-b border-[#9B00CC]/20 animate-fade-in">
              <div className="px-4 pt-2 pb-6 space-y-3 text-xs font-bold uppercase tracking-wider text-slate-300">
                <a 
                  href="#inicio" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-[#0e011f] hover:text-[#00C8D4]"
                >
                  Inicio
                </a>
                <a 
                  href="#habitaciones" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-[#0e011f] hover:text-[#00C8D4]"
                >
                  Habitaciones
                </a>
                {config.modules.pos && (
                  <a 
                    href="#pos" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg hover:bg-[#0e011f] text-[#FF0096]"
                  >
                    Club POS (Consumos)
                  </a>
                )}
                <a 
                  href="#servicios" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-[#0e011f] hover:text-[#00C8D4]"
                >
                  Servicios
                </a>
                <a 
                  href="#galeria" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-[#0e011f] hover:text-[#00C8D4]"
                >
                  Galería
                </a>
                <a 
                  href="#contacto" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-[#0e011f] hover:text-[#00C8D4]"
                >
                  Contacto
                </a>
                <div className="pt-4 px-3">
                  <a 
                    href={`https://wa.me/${config.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white text-xs font-bold"
                  >
                    Reservar por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}
        </nav>
      )}

      {/* 2. Banner de Portada Full-Bleed (100% de Ancho, Sin Márgenes, Sin Bordes Redondeados) */}
      <div className="relative w-full h-[80vh] md:h-[90vh] bg-[#0e011f] flex items-center justify-center">
        
        {/* Imagen del Banner con clase scale-[1.08] para recortar letterboxes */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img
            src={config.branding.banner_url}
            alt={config.name}
            className="w-full h-full object-cover origin-center scale-[1.08] transition-transform duration-[10s] ease-out hover:scale-100"
          />
          {/* Capa overlay oscura elegante para contraste */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e011f] via-[#0e011f]/40 to-transparent"></div>
        </div>

        {/* Contenido Centrado Vertical y Horizontalmente */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center select-text">
          <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-[0.4em] text-[#00C8D4] drop-shadow-md mb-4 block">
            {preTitle}
          </span>
          <h1 className={`text-4xl md:text-7xl font-black text-white leading-tight drop-shadow-lg mb-6 ${titleFontClass}`}>
            {headerTitle}
          </h1>
          <p className={`text-sm md:text-lg text-slate-200 max-w-2xl mx-auto font-medium drop-shadow ${bodyFontClass}`}>
            {headerSubtitle}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="#habitaciones"
              className="px-8 py-3.5 rounded-full bg-[#00C8D4] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#00b0bd] hover:scale-102 transition-all duration-200 shadow-lg shadow-[#00C8D4]/20"
            >
              Explorar Habitaciones
            </a>
            {config.modules.pos && (
              <a
                href="#pos"
                className="px-8 py-3.5 rounded-full border border-white/30 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:border-white/60 hover:scale-102 transition-all duration-200"
              >
                Módulo Club POS
              </a>
            )}
          </div>
        </div>

        {/* Degradado en la parte inferior para fusionar de forma invisible con el fondo de la página */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0e011f] via-[#0e011f]/50 to-transparent pointer-events-none"></div>

      </div>

      {/* Caja informativa de bienvenida con iconos unicolor en cajas de fondo sólido */}
      <div className="relative z-20 -mt-16 max-w-5xl mx-auto px-4">
        <div className="bg-[#1a0533] border border-[#9B00CC]/20 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/40 grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#00C8D4] rounded-xl flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${titleFontClass}`}>Ubicación Exclusiva</h4>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Acceso privilegiado y entornos naturales protegidos en Venezuela.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#FF0096] rounded-xl flex items-center justify-center shrink-0">
              <Hotel className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${titleFontClass}`}>Hospedaje de Autor</h4>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Cada detalle arquitectónico diseñado para tu máximo descanso y confort.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#9B00CC] rounded-xl flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${titleFontClass}`}>Conserjería Digital</h4>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Atención personalizada inmediata las 24 horas vía WhatsApp.
              </p>
            </div>
          </div>

        </div>
      </div>

    </header>
  );
}
