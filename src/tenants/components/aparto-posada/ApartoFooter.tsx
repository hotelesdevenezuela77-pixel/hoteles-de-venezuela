import React, { useState } from "react";
import { 
  Globe, Phone, MapPin, MessageCircle, 
  ShieldCheck, Award, ChevronRight, Check, Sparkles 
} from "lucide-react";

function InstagramIcon({ className = "w-4.5 h-4.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function FacebookIcon({ className = "w-4.5 h-4.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

interface ApartoFooterProps {
  phone: string;
  whatsappPhone: string;
  hotelName: string;
  domain: string;
}

export function ApartoFooter({ phone, whatsappPhone, hotelName, domain }: ApartoFooterProps) {
  const [language, setLanguage] = useState<"ES" | "EN">("ES");
  const cleanWa = whatsappPhone.replace(/\D/g, "");

  const generalWaUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
    language === "ES"
      ? `Hola ${hotelName}, deseo solicitar información y consultar tarifas disponibles para mi próxima estadía.`
      : `Hello ${hotelName}, I would like to inquire about availability and rates for an upcoming stay.`
  )}`;

  return (
    <footer 
      className="text-white pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-t border-white/20 relative overflow-hidden shadow-2xl"
      style={{
        background: "linear-gradient(135deg, #0e011f 0%, #1a0533 45%, #2a054d 100%)"
      }}
    >
      {/* Sutiles Destellos de Fondo */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00C8D4]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#FF0096]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Grid de 4 Columnas Profesionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          
          {/* Columna 1: Identidad, Sello Oficial y Selector de Idioma (4 columnas en LG) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-2xl border border-white/60 shadow-xl shrink-0">
                <img
                  src="/images/aparto-posada/logo.png"
                  alt={hotelName}
                  className="w-14 h-14 object-contain"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (!target.src.includes("logo-oficial.png")) {
                      target.src = "/images/aparto-posada/logo-oficial.png";
                    }
                  }}
                />
              </div>
              <div>
                <span className="text-xl font-black text-white font-serif block tracking-wide">
                  {hotelName}
                </span>
                <span className="text-[10px] font-bold text-[#00C8D4] tracking-[0.2em] uppercase block">
                  SELLO OFICIAL DE EXCELENCIA
                </span>
              </div>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm font-normal leading-relaxed font-['Inter',sans-serif] max-w-sm">
              {language === "ES"
                ? "Su refugio vacacional exclusivo en Tucacas. La libertad de un apartamento equipado con la piscina, seguridad y confort de una posada de primera clase."
                : "Your exclusive vacation haven in Tucacas. The comfort of a fully equipped apartment with the swimming pool, security, and warmth of a premier boutique inn."}
            </p>

            {/* Selector de Idioma Funcional y Elegante (ES / EN) */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 p-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <Globe className="w-4 h-4 text-[#00C8D4] ml-2" />
                <button
                  type="button"
                  onClick={() => setLanguage("ES")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer font-['Plus_Jakarta_Sans',sans-serif] ${
                    language === "ES"
                      ? "bg-gradient-to-r from-[#00C8D4] to-[#00aab5] text-white shadow-md scale-105"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  Español (ES)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("EN")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer font-['Plus_Jakarta_Sans',sans-serif] ${
                    language === "EN"
                      ? "bg-gradient-to-r from-[#FF0096] to-[#d90080] text-white shadow-md scale-105"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  English (EN)
                </button>
              </div>
            </div>
          </div>

          {/* Columna 2: Enlaces de Navegación Rápida (2 columnas en LG) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00C8D4]" />
              {language === "ES" ? "Navegación" : "Navigation"}
            </h4>

            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
              <li>
                <a href="#inicio" className="hover:text-[#00C8D4] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-[#00C8D4]" />
                  <span>{language === "ES" ? "Inicio" : "Home"}</span>
                </a>
              </li>
              <li>
                <a href="#experiencia" className="hover:text-[#00C8D4] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-[#00C8D4]" />
                  <span>{language === "ES" ? "Galería Instalaciones" : "Gallery & Grounds"}</span>
                </a>
              </li>
              <li>
                <a href="#habitaciones" className="hover:text-[#00C8D4] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-[#00C8D4]" />
                  <span>{language === "ES" ? "Habitaciones & Tarifas" : "Rooms & Rates"}</span>
                </a>
              </li>
              <li>
                <a href="#servicios" className="hover:text-[#00C8D4] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-[#00C8D4]" />
                  <span>{language === "ES" ? "Servicios & Comodidades" : "Amenities & Services"}</span>
                </a>
              </li>
              <li>
                <a href="#opiniones" className="hover:text-[#00C8D4] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-[#00C8D4]" />
                  <span>{language === "ES" ? "Opiniones de Huéspedes" : "Guest Reviews"}</span>
                </a>
              </li>
              <li>
                <a href="#ubicacion" className="hover:text-[#00C8D4] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-[#00C8D4]" />
                  <span>{language === "ES" ? "Ubicación & Cómo Llegar" : "Location & Directions"}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Experiencias en Morrocoy (3 columnas en LG) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF0096]" />
              {language === "ES" ? "Experiencias" : "Experiences"}
            </h4>

            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
              <li>
                <span className="text-slate-400 block text-[11px]">Parque Nacional Morrocoy:</span>
                <span className="text-white font-semibold">Traslados en Peñero a Cayos</span>
              </li>
              <li>
                <span className="text-slate-400 block text-[11px]">Descanso al Aire Libre:</span>
                <span className="text-white font-semibold">Piscina Cristalina & Solárium</span>
              </li>
              <li>
                <span className="text-slate-400 block text-[11px]">Gastronomía Familiar:</span>
                <span className="text-white font-semibold">Caney & Parrilleras de Carbón</span>
              </li>
              <li>
                <span className="text-slate-400 block text-[11px]">Garantía Ininterrumpida:</span>
                <span className="text-white font-semibold">Planta Eléctrica 100% & Agua Continua</span>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto Directo & Redes Sociales (3 columnas en LG) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00C8D4]" />
              {language === "ES" ? "Atención Directa" : "Direct Contact"}
            </h4>

            <div className="space-y-3 text-xs text-slate-300">
              <a 
                href="tel:+584144815321" 
                className="flex items-center gap-2.5 hover:text-[#00C8D4] transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#00C8D4] group-hover:bg-[#00C8D4] group-hover:text-white transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-white tracking-wide">{phone}</span>
              </a>

              <a 
                href={generalWaUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2.5 hover:text-emerald-400 transition-colors group"
              >
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-white tracking-wide">WhatsApp Recepción 24/7</span>
              </a>

              <div className="flex items-start gap-2.5 pt-1">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-300 text-[11px] leading-relaxed">
                  Tucacas, Municipio Silva, Estado Falcón, Venezuela
                </span>
              </div>
            </div>

            {/* Redes Sociales con Iconos Vectoriales */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 font-['Plus_Jakarta_Sans',sans-serif]">
                {language === "ES" ? "Conéctate con Nosotros" : "Connect With Us"}
              </span>

              <div className="flex items-center gap-2.5">
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 flex items-center justify-center text-white transition-all shadow-sm hover:scale-110 active:scale-95"
                  title="Instagram Oficial"
                >
                  <InstagramIcon className="w-4.5 h-4.5" />
                </a>

                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#1877F2] flex items-center justify-center text-white transition-all shadow-sm hover:scale-110 active:scale-95"
                  title="Facebook Oficial"
                >
                  <FacebookIcon className="w-4.5 h-4.5" />
                </a>

                {/* WhatsApp */}
                <a
                  href={generalWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#25D366] flex items-center justify-center text-white transition-all shadow-sm hover:scale-110 active:scale-95"
                  title="WhatsApp Chat"
                >
                  <MessageCircle className="w-4.5 h-4.5 fill-current" />
                </a>
              </div>
            </div>

          </div>

        </div>

        {/* Barra Inferior (Bottom Bar) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-slate-400">
          <div className="space-y-1">
            <span className="text-white/90 font-medium block">
              © 2026 {hotelName}. Todos los derechos reservados.
            </span>
            <span className="text-[11px] text-slate-500 block">
              Sitio Web Oficial • Operado bajo tecnología SaaS Hoteles de Venezuela
            </span>
          </div>

          {/* Formas de Pago Aceptadas */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 text-[10px] font-bold text-slate-300">
            <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">Zelle</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">Pago Móvil</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">Efectivo USD</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10">Transferencia</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
