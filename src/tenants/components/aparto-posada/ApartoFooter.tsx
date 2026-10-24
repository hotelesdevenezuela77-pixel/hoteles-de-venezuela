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
    <footer className="relative bg-white pt-0 overflow-hidden font-roboto">
      
      {/* ── 1. TRANSICIÓN ONDULADA ORGÁNICA SUPERIOR EN BLANCO PURO ── */}
      <div className="w-full overflow-hidden leading-none select-none pointer-events-none relative z-20 -mb-[1px]">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-10 sm:h-14 md:h-18 object-fill block"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C320,55 640,10 960,40 C1200,70 1360,25 1440,35 L1440,0 L0,0 Z"
            fill="#ffffff"
          />
        </svg>
      </div>

      {/* ── CUERPO PRINCIPAL DEL FOOTER (FOTO NATURAL DE ORILLA DE PLAYA, ARENA BLANCA Y AGUAS TURQUESA SIN FILTROS) ── */}
      <div 
        className="pt-2 sm:pt-6 pb-12 px-4 sm:px-6 lg:px-8 relative bg-cover bg-center bg-no-repeat shadow-inner"
        style={{
          backgroundImage: "url('/images/aparto-posada/footer_beach_natural.jpg')"
        }}
      >
        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          
          {/* GRID PRINCIPAL DE 4 COLUMNAS CON TARJETAS TRANSPARENTES GLASSMORPHISM */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 lg:gap-6 pb-2">
            
            {/* ── COLUMNA 1: IDENTIDAD, LOGO, SLOGAN Y SELECTOR DE IDIOMA GLOBAL (4 cols) ── */}
            <div className="lg:col-span-4 bg-white/45 hover:bg-white/55 backdrop-blur-xl border border-white/60 p-6 sm:p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_12px_36px_rgb(0,0,0,0.1)] transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="bg-white/70 backdrop-blur-md p-2.5 rounded-2xl border border-white/80 shadow-sm shrink-0 hover:scale-105 transition-transform">
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
                    <span className="text-xl sm:text-2xl font-bold text-slate-900 font-montserrat block tracking-tight leading-tight">
                      {hotelName}
                    </span>
                    <span className="text-[10px] font-bold text-[#009da7] font-caviar tracking-[0.2em] uppercase block mt-0.5">
                      {t.slogan}
                    </span>
                  </div>
                </div>

                <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed font-roboto">
                  {t.desc}
                </p>
              </div>

              {/* Selector de Idioma Global Bilingüe (ES / EN) */}
              <div className="pt-3 border-t border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2 font-caviar tracking-wider">
                  {language === "es" ? "Idioma del Sitio Web" : "Website Language"}
                </span>
                <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/70 shadow-xs">
                  <Globe className="w-4 h-4 text-[#009da7] ml-2 shrink-0" />
                  <button
                    type="button"
                    onClick={() => onLanguageChange("es")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer font-roboto ${
                      language === "es"
                        ? "bg-[#00C8D4] text-white shadow-xs"
                        : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    Español (ES)
                  </button>
                  <button
                    type="button"
                    onClick={() => onLanguageChange("en")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer font-roboto ${
                      language === "en"
                        ? "bg-[#FF0096] text-white shadow-xs"
                        : "text-slate-700 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    English (EN)
                  </button>
                </div>
              </div>
            </div>

            {/* ── COLUMNA 2: CONTACTO OFICIAL & DATOS FISCALES (3 cols) ── */}
            <div className="lg:col-span-3 bg-white/45 hover:bg-white/55 backdrop-blur-xl border border-white/60 p-6 sm:p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_12px_36px_rgb(0,0,0,0.1)] transition-all space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-montserrat flex items-center gap-2 pb-2 border-b border-slate-200/60">
                <span className="w-2 h-2 rounded-full bg-[#00C8D4]" />
                {t.contactHeader}
              </h4>

              <div className="space-y-3.5 text-xs text-slate-800 font-roboto">
                {/* Razón Social y RIF Oficial */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#00C8D4]/20 flex items-center justify-center text-[#009da7] shrink-0 mt-0.5 border border-[#00C8D4]/30 backdrop-blur-xs">
                    <Building2 className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs font-roboto">{t.companyName}</span>
                    <span className="text-[11px] text-slate-600 font-mono font-medium">{t.rif}</span>
                  </div>
                </div>

                {/* Dirección Física */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FF0096]/20 flex items-center justify-center text-[#FF0096] shrink-0 mt-0.5 border border-[#FF0096]/30 backdrop-blur-xs">
                    <MapPin className="w-4 h-4 stroke-[2]" />
                  </div>
                  <span className="text-xs text-slate-700 font-medium leading-snug font-roboto">
                    {t.address}
                  </span>
                </div>

                {/* Teléfono Clickable */}
                <a 
                  href={`tel:${phone.replace(/\D/g, "")}`}
                  className="flex items-center gap-3 hover:text-[#009da7] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-700 group-hover:bg-[#00C8D4] group-hover:text-white transition-all shrink-0 border border-emerald-500/30 backdrop-blur-xs">
                    <Phone className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold font-caviar">
                      {language === "es" ? "Llamada Directa" : "Direct Phone"}
                    </span>
                    <span className="font-bold text-slate-900 text-xs font-roboto">{t.phone}</span>
                  </div>
                </a>

                {/* Correo Electrónico */}
                <a 
                  href={`mailto:${t.email}`}
                  className="flex items-center gap-3 hover:text-[#009da7] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700 group-hover:bg-[#00C8D4] group-hover:text-white transition-all shrink-0 border border-amber-500/30 backdrop-blur-xs">
                    <Mail className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold font-caviar">
                      {language === "es" ? "Email Oficial" : "Official Email"}
                    </span>
                    <span className="font-bold text-slate-900 text-xs break-all font-roboto">{t.email}</span>
                  </div>
                </a>
              </div>
            </div>

            {/* ── COLUMNA 3: ACCESO RÁPIDO (2 cols) ── */}
            <div className="lg:col-span-2 bg-white/45 hover:bg-white/55 backdrop-blur-xl border border-white/60 p-6 sm:p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_12px_36px_rgb(0,0,0,0.1)] transition-all space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-montserrat flex items-center gap-2 pb-2 border-b border-slate-200/60">
                <span className="w-2 h-2 rounded-full bg-[#FF0096]" />
                {t.quickLinksHeader}
              </h4>

              <ul className="space-y-1.5 text-xs font-semibold font-roboto">
                <li>
                  <a href="#inicio" className="text-slate-700 hover:text-[#009da7] hover:bg-white/40 px-2 py-1 -mx-2 rounded-lg transition-all flex items-center gap-1.5 group">
                    <span className="text-[#00C8D4] font-bold group-hover:translate-x-1 transition-transform">▸</span>
                    <span>{t.links.inicio}</span>
                  </a>
                </li>
                <li>
                  <a href="#experiencia" className="text-slate-700 hover:text-[#009da7] hover:bg-white/40 px-2 py-1 -mx-2 rounded-lg transition-all flex items-center gap-1.5 group">
                    <span className="text-[#00C8D4] font-bold group-hover:translate-x-1 transition-transform">▸</span>
                    <span>{t.links.posada}</span>
                  </a>
                </li>
                <li>
                  <a href="#habitaciones" className="text-slate-700 hover:text-[#009da7] hover:bg-white/40 px-2 py-1 -mx-2 rounded-lg transition-all flex items-center gap-1.5 group">
                    <span className="text-[#00C8D4] font-bold group-hover:translate-x-1 transition-transform">▸</span>
                    <span>{t.links.habitaciones}</span>
                  </a>
                </li>
                <li>
                  <a href="#habitaciones" className="text-slate-700 hover:text-[#009da7] hover:bg-white/40 px-2 py-1 -mx-2 rounded-lg transition-all flex items-center gap-1.5 group">
                    <span className="text-[#00C8D4] font-bold group-hover:translate-x-1 transition-transform">▸</span>
                    <span>{t.links.apartamentos}</span>
                  </a>
                </li>
                <li>
                  <a href="#experiencia" className="text-slate-700 hover:text-[#009da7] hover:bg-white/40 px-2 py-1 -mx-2 rounded-lg transition-all flex items-center gap-1.5 group">
                    <span className="text-[#00C8D4] font-bold group-hover:translate-x-1 transition-transform">▸</span>
                    <span>{t.links.galeria}</span>
                  </a>
                </li>
                <li>
                  <a href="#servicios" className="text-slate-700 hover:text-[#009da7] hover:bg-white/40 px-2 py-1 -mx-2 rounded-lg transition-all flex items-center gap-1.5 group">
                    <span className="text-[#00C8D4] font-bold group-hover:translate-x-1 transition-transform">▸</span>
                    <span>{t.links.servicios}</span>
                  </a>
                </li>
                <li>
                  <a href="#ubicacion" className="text-slate-700 hover:text-[#009da7] hover:bg-white/40 px-2 py-1 -mx-2 rounded-lg transition-all flex items-center gap-1.5 group">
                    <span className="text-[#00C8D4] font-bold group-hover:translate-x-1 transition-transform">▸</span>
                    <span>{t.links.ubicacion}</span>
                  </a>
                </li>
                <li>
                  <a href={generalWaUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/50 px-2 py-1 -mx-2 rounded-lg transition-all flex items-center gap-1.5 group font-bold">
                    <span className="text-emerald-600 font-bold group-hover:translate-x-1 transition-transform">▸</span>
                    <span>{t.links.reservas}</span>
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-slate-500 hover:text-slate-800 hover:bg-white/40 px-2 py-1 -mx-2 rounded-lg transition-all flex items-center gap-1.5 group text-[11px]">
                    <span className="text-slate-400 font-bold group-hover:translate-x-1 transition-transform">▸</span>
                    <span>{t.links.politicas}</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* ── COLUMNA 4: REDES SOCIALES & WIDGET DEL CLIMA EN TUCACAS (3 cols) ── */}
            <div className="lg:col-span-3 bg-white/45 hover:bg-white/55 backdrop-blur-xl border border-white/60 p-6 sm:p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_12px_36px_rgb(0,0,0,0.1)] transition-all flex flex-col justify-between space-y-5">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-montserrat flex items-center gap-2 mb-3 pb-2 border-b border-slate-200/60">
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
                    className="w-10 h-10 rounded-full bg-white/60 hover:bg-[#1877F2] text-slate-700 hover:text-white flex items-center justify-center transition-all shadow-xs hover:scale-110 active:scale-95 border border-white/80 backdrop-blur-xs"
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
                    className="w-10 h-10 rounded-full bg-white/60 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 text-slate-700 hover:text-white flex items-center justify-center transition-all shadow-xs hover:scale-110 active:scale-95 border border-white/80 backdrop-blur-xs"
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
                    className="w-10 h-10 rounded-full bg-white/60 hover:bg-slate-900 text-slate-700 hover:text-white flex items-center justify-center transition-all shadow-xs hover:scale-110 active:scale-95 border border-white/80 backdrop-blur-xs"
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
                    className="w-10 h-10 rounded-full bg-white/60 hover:bg-[#25D366] text-emerald-700 hover:text-white flex items-center justify-center transition-all shadow-xs hover:scale-110 active:scale-95 border border-white/80 backdrop-blur-xs"
                    title="WhatsApp Recepción 24/7"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="w-4.5 h-4.5 fill-current" />
                  </a>
                </div>
              </div>

              {/* ── WIDGET DEL CLIMA EN TUCACAS TRANSPARENTE ── */}
              <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 text-slate-900 border border-white/70 shadow-sm relative overflow-hidden group mt-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/50">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-montserrat">
                      {t.weatherCity}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 font-caviar">
                    {t.weatherRegion}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Sun className="w-10 h-10 text-amber-500 animate-spin-slow stroke-[1.8]" />
                      <CloudSun className="w-6 h-6 text-[#00C8D4] absolute -bottom-1 -right-1" />
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-900 font-montserrat leading-none tracking-tight">
                          {t.weatherTemp}
                        </span>
                        <span className="text-xs font-extrabold text-amber-600">°C</span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-600 block leading-tight mt-0.5 font-roboto">
                        {t.weatherDesc}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-600 font-bold uppercase tracking-wider font-roboto">
                  <span className="inline-flex items-center gap-1 text-[#009da7]">
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

          {/* ── BARRA INFERIOR (BOTTOM BAR): COPYRIGHT, CRÉDITOS Y MÉTODOS DE PAGO TRANSPARENTE ── */}
          <div className="bg-white/45 hover:bg-white/55 backdrop-blur-xl border border-white/60 p-4 sm:p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-slate-700 font-roboto transition-all">
            <div className="space-y-0.5">
              <span className="text-slate-900 font-semibold block">
                {t.rights}
              </span>
              <span className="text-[11px] text-slate-500 block font-caviar">
                {t.operatedBy}
              </span>
            </div>

            {/* Pastillas de Métodos de Pago Aceptados */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 text-[10px] font-bold text-slate-800">
              {t.payments.map((method, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-white/60 hover:bg-white/90 border border-white/80 backdrop-blur-xs transition-colors font-roboto shadow-2xs"
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
