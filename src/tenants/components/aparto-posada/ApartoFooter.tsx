import React from "react";
import { 
  Globe, Phone, MapPin, MessageCircle, Mail, Building2,
  ShieldCheck, Award, ChevronRight, Check, Sparkles, Sun, CloudSun, Wind, Droplets
} from "lucide-react";
import { type Language, APARTO_TRANSLATIONS } from "../../lib/apartoTranslations";

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
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function TikTokIcon({ className = "w-4.5 h-4.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3-.002.59.04.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.86-4.48V8.71a8.16 8.16 0 0 0 4.77 1.52V6.78a4.85 4.85 0 0 1-.86-.09z"/>
    </svg>
  );
}

interface ApartoFooterProps {
  phone: string;
  whatsappPhone: string;
  hotelName: string;
  domain: string;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function ApartoFooter({ 
  phone, 
  whatsappPhone, 
  hotelName, 
  domain, 
  language, 
  onLanguageChange 
}: ApartoFooterProps) {
  const t = APARTO_TRANSLATIONS[language].footer;
  const cleanWa = whatsappPhone.replace(/\D/g, "");

  const generalWaUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
    language === "es"
      ? `Hola ${hotelName}, deseo solicitar información sobre disponibilidad y tarifas en Tucacas.`
      : `Hello ${hotelName}, I would like to inquire about availability and rates in Tucacas.`
  )}`;

  return (
    <footer className="relative bg-white pt-0 overflow-hidden">
      
      {/* ── 1. TRANSICIÓN ONDULADA ORGÁNICA SUPERIOR EN BLANCO PURO ── */}
      <div className="w-full overflow-hidden leading-none select-none pointer-events-none relative z-20 -mb-[1px]">
        <svg
          viewBox="0 0 1440 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-12 sm:h-16 md:h-20 object-fill block"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C320,65 640,10 960,50 C1200,85 1360,35 1440,45 L1440,0 L0,0 Z"
            fill="#ffffff"
          />
        </svg>
      </div>

      {/* ── CUERPO PRINCIPAL DEL FOOTER (FONDO DE ARENA BLANCA Y AGUA CRISTALINA DE MORROCOY) ── */}
      <div 
        className="text-white pt-4 sm:pt-8 pb-14 px-4 sm:px-6 lg:px-8 relative shadow-2xl bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/aparto-posada/footer_beach_bg.jpg')"
        }}
      >
        {/* Capa de contraste cristalino de alta gama (permite apreciar la arena blanca y el agua turquesa con perfecta legibilidad) */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(8, 28, 44, 0.70) 0%, rgba(5, 20, 34, 0.82) 45%, rgba(14, 1, 31, 0.94) 100%)",
            backdropFilter: "blur(1.5px)"
          }}
        />

        {/* Destellos de Luz Ambiente Tropical */}
        <div className="absolute top-10 right-1/4 w-96 h-96 bg-[#00C8D4]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#FF0096]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          
          {/* GRID PRINCIPAL DE 4 COLUMNAS CON TARJETAS FROSTED-GLASS DE LUJO */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-6 pb-4">
            
            {/* ── COLUMNA 1: IDENTIDAD, LOGO, SLOGAN Y SELECTOR DE IDIOMA GLOBAL (4 cols) ── */}
            <div className="lg:col-span-4 bg-slate-950/65 backdrop-blur-xl border border-white/20 p-6 sm:p-7 rounded-3xl shadow-2xl space-y-6 hover:border-[#00C8D4]/50 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="bg-white p-2.5 rounded-2xl border border-white/80 shadow-2xl shrink-0 hover:scale-105 transition-transform">
                    <img
                      src="/images/aparto-posada/logo.png"
                      alt={hotelName}
                      className="w-14 sm:w-16 h-14 sm:h-16 object-contain"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (!target.src.includes("logo-oficial.png")) {
                          target.src = "/images/aparto-posada/logo-oficial.png";
                        }
                      }}
                    />
                  </div>
                  <div>
                    <span className="text-xl sm:text-2xl font-black text-white font-serif block tracking-wide">
                      {hotelName}
                    </span>
                    <span className="text-[10px] font-black text-[#00C8D4] tracking-[0.2em] uppercase block">
                      {t.slogan}
                    </span>
                  </div>
                </div>

                <p className="text-slate-200 text-xs sm:text-sm font-normal leading-relaxed font-['Inter',sans-serif]">
                  {t.desc}
                </p>
              </div>

              {/* Selector de Idioma Global Bilingüe (ES / EN) */}
              <div className="pt-2 border-t border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-300 block mb-2 font-['Plus_Jakarta_Sans',sans-serif]">
                  {language === "es" ? "Idioma del Sitio Web" : "Website Language"}
                </span>
                <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-inner">
                  <Globe className="w-4 h-4 text-[#00C8D4] ml-2 shrink-0" />
                  <button
                    type="button"
                    onClick={() => onLanguageChange("es")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer font-['Plus_Jakarta_Sans',sans-serif] ${
                      language === "es"
                        ? "bg-[#00C8D4] text-slate-950 shadow-md font-black"
                        : "text-slate-200 hover:text-white"
                    }`}
                  >
                    Español (ES)
                  </button>
                  <button
                    type="button"
                    onClick={() => onLanguageChange("en")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer font-['Plus_Jakarta_Sans',sans-serif] ${
                      language === "en"
                        ? "bg-[#FF0096] text-white shadow-md font-black"
                        : "text-slate-200 hover:text-white"
                    }`}
                  >
                    English (EN)
                  </button>
                </div>
              </div>
            </div>

            {/* ── COLUMNA 2: CONTACTO OFICIAL & DATOS FISCALES (3 cols) ── */}
            <div className="lg:col-span-3 bg-slate-950/65 backdrop-blur-xl border border-white/20 p-6 sm:p-7 rounded-3xl shadow-2xl space-y-4 hover:border-[#00C8D4]/50 transition-all">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-2 pb-2 border-b border-white/10">
                <span className="w-2 h-2 rounded-full bg-[#00C8D4]" />
                {t.contactHeader}
              </h4>

              <div className="space-y-3.5 text-xs text-slate-200 font-['Inter',sans-serif]">
                {/* Razón Social y RIF Oficial (como la competencia pero con diseño prémium) */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-[#00C8D4] shrink-0 mt-0.5 border border-white/20">
                    <Building2 className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <div>
                    <span className="font-bold text-white block text-xs">{t.companyName}</span>
                    <span className="text-[11px] text-slate-300 font-mono font-medium">{t.rif}</span>
                  </div>
                </div>

                {/* Dirección Física */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-[#FF0096] shrink-0 mt-0.5 border border-white/20">
                    <MapPin className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <span className="text-xs text-slate-200 leading-snug">
                    {t.address}
                  </span>
                </div>

                {/* Teléfono Clickable */}
                <a 
                  href={`tel:${phone.replace(/\D/g, "")}`}
                  className="flex items-center gap-3 hover:text-[#00C8D4] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-emerald-400 group-hover:bg-[#00C8D4] group-hover:text-slate-900 transition-all shrink-0 border border-white/20">
                    <Phone className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-bold">
                      {language === "es" ? "Llamada Directa" : "Direct Phone"}
                    </span>
                    <span className="font-bold text-white text-xs">{t.phone}</span>
                  </div>
                </a>

                {/* Correo Electrónico */}
                <a 
                  href={`mailto:${t.email}`}
                  className="flex items-center gap-3 hover:text-[#00C8D4] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-amber-300 group-hover:bg-[#00C8D4] group-hover:text-slate-900 transition-all shrink-0 border border-white/20">
                    <Mail className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-bold">
                      {language === "es" ? "Email Oficial" : "Official Email"}
                    </span>
                    <span className="font-bold text-white text-xs break-all">{t.email}</span>
                  </div>
                </a>
              </div>
            </div>

            {/* ── COLUMNA 3: ACCESO RÁPIDO (2 cols) ── */}
            <div className="lg:col-span-2 bg-slate-950/65 backdrop-blur-xl border border-white/20 p-6 sm:p-7 rounded-3xl shadow-2xl space-y-4 hover:border-[#00C8D4]/50 transition-all">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-2 pb-2 border-b border-white/10">
                <span className="w-2 h-2 rounded-full bg-[#FF0096]" />
                {t.quickLinksHeader}
              </h4>

              <ul className="space-y-2 text-xs font-semibold font-['Plus_Jakarta_Sans',sans-serif]">
                <li>
                  <a href="#inicio" className="text-slate-200 hover:text-[#00C8D4] transition-colors flex items-center gap-1.5 group">
                    <span className="text-[#00C8D4] group-hover:translate-x-1 transition-transform">▸</span>
                    <span>{t.links.inicio}</span>
                  </a>
                </li>
                <li>
                  <a href="#experiencia" className="text-slate-200 hover:text-[#00C8D4] transition-colors flex items-center gap-1.5 group">
                    <span className="text-[#00C8D4] group-hover:translate-x-1 transition-transform">▸</span>
                    <span>{t.links.posada}</span>
                  </a>
                </li>
                <li>
                  <a href="#habitaciones" className="text-slate-200 hover:text-[#00C8D4] transition-colors flex items-center gap-1.5 group">
                    <span className="text-[#00C8D4] group-hover:translate-x-1 transition-transform">▸</span>
                    <span>{t.links.habitaciones}</span>
                  </a>
                </li>
                <li>
                  <a href="#habitaciones" className="text-slate-200 hover:text-[#00C8D4] transition-colors flex items-center gap-1.5 group">
                    <span className="text-[#00C8D4] group-hover:translate-x-1 transition-transform">▸</span>
                    <span>{t.links.apartamentos}</span>
                  </a>
                </li>
                <li>
                  <a href="#experiencia" className="text-slate-200 hover:text-[#00C8D4] transition-colors flex items-center gap-1.5 group">
                    <span className="text-[#00C8D4] group-hover:translate-x-1 transition-transform">▸</span>
                    <span>{t.links.galeria}</span>
                  </a>
                </li>
                <li>
                  <a href="#servicios" className="text-slate-200 hover:text-[#00C8D4] transition-colors flex items-center gap-1.5 group">
                    <span className="text-[#00C8D4] group-hover:translate-x-1 transition-transform">▸</span>
                    <span>{t.links.servicios}</span>
                  </a>
                </li>
                <li>
                  <a href="#ubicacion" className="text-slate-200 hover:text-[#00C8D4] transition-colors flex items-center gap-1.5 group">
                    <span className="text-[#00C8D4] group-hover:translate-x-1 transition-transform">▸</span>
                    <span>{t.links.ubicacion}</span>
                  </a>
                </li>
                <li>
                  <a href={generalWaUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:text-emerald-200 transition-colors flex items-center gap-1.5 group font-bold">
                    <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">▸</span>
                    <span>{t.links.reservas}</span>
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 group text-[11px]">
                    <span className="text-slate-400 group-hover:translate-x-1 transition-transform">▸</span>
                    <span>{t.links.politicas}</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* ── COLUMNA 4: REDES SOCIALES & WIDGET DEL CLIMA EN TUCACAS (3 cols) ── */}
            <div className="lg:col-span-3 bg-slate-950/65 backdrop-blur-xl border border-white/20 p-6 sm:p-7 rounded-3xl shadow-2xl space-y-5 hover:border-[#00C8D4]/50 transition-all flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                  <span className="w-2 h-2 rounded-full bg-[#00C8D4]" />
                  {t.socialHeader}
                </h4>

                {/* Iconos de Redes Sociales: Facebook, Instagram, TikTok y WhatsApp */}
                <div className="flex items-center gap-2.5">
                  {/* Facebook */}
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/15 hover:bg-[#1877F2] text-white flex items-center justify-center transition-all shadow-md hover:scale-110 active:scale-95 border border-white/25"
                    title="Facebook Oficial"
                    aria-label="Facebook"
                  >
                    <FacebookIcon className="w-4.5 h-4.5" />
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/15 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 text-white flex items-center justify-center transition-all shadow-md hover:scale-110 active:scale-95 border border-white/25"
                    title="Instagram Oficial"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="w-4.5 h-4.5" />
                  </a>

                  {/* TikTok */}
                  <a
                    href="https://tiktok.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/15 hover:bg-black hover:border-[#00C8D4] text-white flex items-center justify-center transition-all shadow-md hover:scale-110 active:scale-95 border border-white/25"
                    title="TikTok Oficial"
                    aria-label="TikTok"
                  >
                    <TikTokIcon className="w-4.5 h-4.5" />
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={generalWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/15 hover:bg-[#25D366] text-white flex items-center justify-center transition-all shadow-md hover:scale-110 active:scale-95 border border-white/25"
                    title="WhatsApp Recepción 24/7"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="w-4.5 h-4.5 fill-current" />
                  </a>
                </div>
              </div>

              {/* ── WIDGET DEL CLIMA EN TUCACAS (SUPERA AL RECTÁNGULO DE LA COMPETENCIA) ── */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 text-slate-900 border border-white/90 shadow-2xl relative overflow-hidden group mt-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
                      {t.weatherCity}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    {t.weatherRegion}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center gap-3">
                    {/* Icono de Sol Radiante y Nube Playera */}
                    <div className="relative">
                      <Sun className="w-10 h-10 text-amber-500 animate-spin-slow stroke-[1.8]" />
                      <CloudSun className="w-6 h-6 text-[#00C8D4] absolute -bottom-1 -right-1" />
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900 font-serif leading-none tracking-tight">
                          {t.weatherTemp}
                        </span>
                        <span className="text-xs font-bold text-amber-600">°C</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 block leading-tight mt-0.5">
                        {t.weatherDesc}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span className="inline-flex items-center gap-1 text-[#008d96]">
                    <Wind className="w-3 h-3 text-[#00C8D4]" />
                    {language === "es" ? "Brisa 14 km/h" : "Breeze 14 km/h"}
                  </span>
                  <span className="text-[#FF0096]">
                    {t.weatherLive}
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* ── BARRA INFERIOR (BOTTOM BAR): COPYRIGHT, CRÉDITOS Y MÉTODOS DE PAGO ── */}
          <div className="bg-slate-950/70 backdrop-blur-xl border border-white/20 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-slate-200">
            <div className="space-y-1">
              <span className="text-white font-medium block">
                {t.rights}
              </span>
              <span className="text-[11px] text-slate-300 block">
                {t.operatedBy}
              </span>
            </div>

            {/* Pastillas de Métodos de Pago Aceptados */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 text-[10px] font-bold text-white">
              {t.payments.map((method, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-md transition-colors"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
