import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Navbar } from "./Navbar";
import { TickerBar } from "./TickerBar";
import { RouteAlertsBanner } from "../alerts/RouteAlertsBanner";
import { BackgroundMusicPlayer } from "./BackgroundMusicPlayer";
import { ChatWidget } from "./ChatWidget";
import {
  MapPin, Phone, PhoneCall, MessageSquare, Send, X, Headphones, Mail
} from "lucide-react";
import { OFFICIAL_PHONE_NUMBERS, OFFICIAL_WHATSAPP_DISPLAY, OFFICIAL_WHATSAPP_URL, SECONDARY_WHATSAPP_DISPLAY, SECONDARY_WHATSAPP_URL } from "@/config/whatsapp";

const DESTINATIONS = [
  { name: "Morrocoy",        slug: "morrocoy" },
  { name: "Los Roques",      slug: "los-roques" },
  { name: "Canaima",         slug: "canaima" },
  { name: "Mérida",          slug: "merida" },
  { name: "Puerto La Cruz",  slug: "puerto-la-cruz" },
  { name: "Lechería",        slug: "lecheria" },
  { name: "Margarita",       slug: "isla-de-margarita" },
  { name: "Médanos de Coro", slug: "medanos-de-coro" },
  { name: "Gran Caracas",    slug: "caracas" },
  { name: "La Guaira",       slug: "la-guaira" },
  { name: "Maracaibo",       slug: "maracaibo" },
  { name: "Maracay",         slug: "maracay" },
  { name: "Valencia",        slug: "valencia" },
  { name: "Barquisimeto",    slug: "barquisimeto" },
  { name: "Punto Fijo",      slug: "punto-fijo" },
  { name: "Apure",           slug: "apure" },
  { name: "Caripe",          slug: "caripe" },
  { name: "Cubiro",          slug: "cubiro" },
  { name: "Sanare",          slug: "sanare" },
  { name: "Bahía de Cata",   slug: "bahia-de-cata" },
  { name: "Choroní",         slug: "choroni" },
  { name: "Colonia Tovar",   slug: "colonia-tovar" },
  { name: "Mochima",         slug: "mochima" },
];

function Footer() {
  return (
    <footer className="font-sans text-white">
      {/* Footer principal (Morado Profundo) */}
      <div 
        style={{ background: "linear-gradient(135deg, #1a0533 0%, #2d0d5c 100%)" }} 
        className="px-6 py-14"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6">

          {/* Marca */}
          <div>
            <div className="mb-4">
              <img
                src="/images/logo-hdv-transparent.png"
                alt="Hoteles de Venezuela"
                className="h-12 w-[160px] object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
                loading="lazy"
                width="160"
                height="48"
              />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-xs font-light">
              Tu guía definitiva para descubrir los mejores hoteles, posadas y experiencias turísticas de Venezuela.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                <svg className="w-4 h-4 fill-none stroke-current stroke-2 text-white" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M23.498 6.163c-.272-.98-1.09-1.755-2.115-2.013C19.51 3.75 12 3.75 12 3.75s-7.51 0-9.383.5c-1.025.258-1.843 1.033-2.115 2.013C0 7.962 0 12 0 12s0 4.038.5 5.837c.272.98.109 1.755 2.115 2.013c1.873.5 9.383.5 9.383.5s7.51 0 9.383-.5c1.025-.258 1.843-1.033 2.115-2.013c.5-1.8.5-5.837.5-5.837s0-4.038-.5-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
            <div className="mt-6">
              <Link
                href="/soporte"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-extrabold text-white transition-all shadow-lg hover:shadow-cyan-500/25 hover:scale-105 active:scale-95 border border-white/15 group"
                style={{ background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)" }}
              >
                <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
                  <Headphones className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-pink-200 uppercase font-black tracking-widest leading-none">Centro de Asistencia</span>
                  <span className="text-xs font-black text-white leading-tight">Soporte Técnico 24/7</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Column 2: Explorar & Categorías */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-0.5" style={{ background: "linear-gradient(90deg, #FF0096, #9B00CC)" }} />
              <h4 className="font-bold text-white text-sm tracking-wide">Explorar</h4>
            </div>
            <ul className="space-y-2.5">
              {[
                { href: "/establecimientos?category=hoteles", label: "Hoteles de Venezuela" },
                { href: "/establecimientos?category=posadas", label: "Posadas Boutique" },
                { href: "/establecimientos?category=restaurantes", label: "Restaurantes & Sabor" },
                { href: "/sitios-turisticos", label: "Sitios Turísticos Iconos" },
                { href: "/parques", label: "Parques Nacionales" },
                { href: "/destinos", label: "Todos los Destinos" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-300 text-xs hover:text-pink-400 transition-colors flex items-center gap-1.5 font-medium">
                    <span className="text-pink-500 font-bold">•</span> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Guías & Reportajes SEO */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-0.5" style={{ background: "linear-gradient(90deg, #00C8D4, #FF0096)" }} />
              <h4 className="font-bold text-white text-sm tracking-wide">Guías & Reportajes</h4>
            </div>
            <ul className="space-y-2.5">
              {[
                { href: "/blog/morrocoy-guia-definitiva-cayos", label: "Guía Morrocoy & Cayos" },
                { href: "/blog/canaima-salto-angel-guia", label: "Guía Canaima & Salto Ángel" },
                { href: "/blog/los-roques-mejor-epoca-del-ano", label: "Guía Los Roques" },
                { href: "/blog", label: "Tips de Viaje & 20 Reportajes" },
                { href: "/top-10-hoteles", label: "Top 10 Hoteles Selección" },
                { href: "/prestigio-2026", label: "Colección Prestigio 2026" },
              ].map((l, i) => (
                <li key={i}>
                  <Link href={l.href} className="text-gray-300 text-xs hover:text-cyan-400 transition-colors flex items-center gap-1.5 font-medium">
                    <span className="text-cyan-400 font-bold">•</span> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Para Propietarios & B2B */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-0.5" style={{ background: "linear-gradient(90deg, #9B00CC, #00C8D4)" }} />
              <h4 className="font-bold text-white text-sm tracking-wide">Para Propietarios</h4>
            </div>
            <ul className="space-y-2.5">
              {[
                { href: "/mis-negocios", label: "Registrar mi Negocio (0% Comisiones)" },
                { href: "/50-fundadores", label: "Programa 50 Fundadores" },
                { href: "/alianzas-para-agencias", label: "Alianzas para Agencias" },
                { href: "/membresias", label: "Membresías & Planes" },
                { href: "/reportar-pago", label: "Reportar Pago Local" },
              ].map((l, i) => (
                <li key={i}>
                  <Link href={l.href} className="text-gray-300 text-xs hover:text-purple-400 transition-colors flex items-center gap-1.5 font-medium">
                    <span className="text-purple-400 font-bold">•</span> {l.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href="/soporte"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold text-white transition-all shadow-md hover:scale-105 active:scale-95 border border-[#00C8D4]/40 hover:border-[#00C8D4]"
                  style={{ background: "linear-gradient(135deg, #00C8D4 0%, #1a0533 100%)" }}
                >
                  <div className="w-5 h-5 rounded-lg bg-[#00C8D4] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Headphones className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span>Soporte Técnico 24/7</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Contacto Directo & Líneas Telefónicas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-0.5" style={{ background: "linear-gradient(90deg, #00C8D4, #FF0096)" }} />
              <h4 className="font-bold text-white text-sm tracking-wide">Contacto Directo</h4>
            </div>

            {/* Botones de Llamada Telefónica Directa */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-black text-[#00C8D4] tracking-wider block">
                Líneas Telefónicas Directas:
              </span>
              
              {OFFICIAL_PHONE_NUMBERS.map((phone, idx) => (
                <a
                  key={idx}
                  href={phone.tel}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/[0.08] hover:bg-[#00C8D4]/20 border border-white/10 hover:border-[#00C8D4]/60 text-white transition-all group shadow-sm hover:scale-[1.02] active:scale-98 cursor-pointer"
                  title={`Toca para llamar a ${phone.display}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-[#00C8D4]/20 group-hover:bg-[#00C8D4] text-[#00C8D4] group-hover:text-slate-950 flex items-center justify-center shrink-0 transition-colors shadow-xs">
                      <PhoneCall className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col text-left min-w-0">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-200 tracking-tight truncate">
                        {phone.display}
                      </span>
                      <span className="text-[9px] text-slate-400 group-hover:text-slate-300 font-medium truncate">
                        {phone.label}
                      </span>
                    </div>
                  </div>
                  
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#00C8D4] group-hover:text-white bg-[#00C8D4]/10 group-hover:bg-[#00C8D4]/30 px-2 py-0.5 rounded-md shrink-0 transition-colors">
                    Llamar
                  </span>
                </a>
              ))}
            </div>

            {/* Correos y Dirección */}
            <ul className="space-y-2 pt-2 border-t border-white/10 text-xs text-gray-300">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#FF0096] shrink-0" />
                <a href="mailto:partner@hotelesdevenezuela.com" className="hover:text-pink-300 transition-colors truncate">
                  partner@hotelesdevenezuela.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#00C8D4] shrink-0" />
                <a href="mailto:Hotelesdevenezuela77@gmail.com" className="hover:text-cyan-300 transition-colors truncate">
                  Hotelesdevenezuela77@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2 pt-1 text-[11px] text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>408 W POPLAR ST OLATHE, KS 66061 🇺🇸</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Ciudades en la barra intermedia del Footer (Púrpura Intermedio) */}
      <div style={{ background: "#12022a" }} className="py-8 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center mb-5">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-white text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-brand-magenta" /> Hoteles de Venezuela
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {DESTINATIONS.map((dest) => (
              <Link
                key={dest.slug}
                href={`/destinos/${dest.slug}`}
                className="px-3 py-1.5 rounded-full border border-white/20 text-white text-xs font-semibold hover:border-brand-magenta hover:text-brand-magenta transition-all duration-200"
              >
                {dest.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Barra Inferior de Copyright (Púrpura Más Oscuro) */}
      <div style={{ background: "#0e011f" }} className="py-5 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-400 font-semibold tracking-wide">
          <div className="flex flex-col gap-1 items-center sm:items-start text-center sm:text-left">
            <span className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
              <span>
                © {new Date().getFullYear()} Hoteles de Venezuela LLC<sup className="text-[8px]">®</sup>
              </span>
              <span className="opacity-30">·</span>
              <span>Todos los derechos reservados</span>
              <span className="opacity-30">·</span>
              <span>Hecho con ❤️ en Venezuela</span>
            </span>
            <span className="text-gray-500 text-[10px] mt-0.5">
              Desarrollado por{" "}
              <a 
                href="https://webmasterpro.us" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#00C8D4] hover:text-white font-bold transition-colors"
              >
                Webmasterpro Entertainment
              </a>
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link>
            <span className="text-gray-700">|</span>
            <Link href="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</Link>
            <span className="text-gray-700">|</span>
            <Link href="/sobre-nosotros" className="hover:text-white transition-colors">Sobre Nosotros</Link>
            <span className="text-gray-700">|</span>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <span className="text-gray-700">|</span>
            <Link href="/sitemap" className="hover:text-white transition-colors">Mapa del sitio</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin") || location === "/crm" || location === "/centaurus" || location === "/andromeda";

  // Si nos encontramos dentro de la consola administrativa o dashboards de control,
  // permitimos que AdminLayout tome el 100% del viewport sin barras públicas superpuestas
  if (isAdminRoute) {
    return (
      <div className="h-screen h-[100dvh] w-full overflow-hidden bg-[#0e011f]">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 font-sans">
      <Navbar />
      <TickerBar />
      <RouteAlertsBanner />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ChatWidget />
      <BackgroundMusicPlayer />
    </div>
  );
}

