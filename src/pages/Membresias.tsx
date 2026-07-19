import { useState } from "react";
import { Link } from "wouter";
import {
  Check, X, MapPin, Star, Zap, Crown, Globe, Phone,
  Camera, BarChart3, Calendar, Building2, Megaphone,
  Smartphone, ChevronRight, Users, TrendingUp, Award,
} from "lucide-react";

import { OFFICIAL_WHATSAPP_DISPLAY } from "@/config/whatsapp";

const F = "#FF0096";
const T = "#00C8D4";
const P = "#9B00CC";
const PHONE = OFFICIAL_WHATSAPP_DISPLAY;

const SERVICIOS = [
  {
    id: "espacio",
    icon: Globe,
    color: F,
    bg: "rgba(255,0,150,0.08)",
    border: "rgba(255,0,150,0.25)",
    badge: "bg-pink-100 text-pink-700",
    name: "Espacio Publicitario",
    price: "$20 - $35",
    period: "/mes",
    desc: "Publicidad directa, descripción general, fotos de tu establecimiento, datos de contacto y enlace a tus redes sociales.",
    features: [
      "Foto de perfil publicada",
      "Datos de contacto visibles",
      "Enlace a redes sociales",
      "Aparece en búsquedas generales",
      "Panel de gestión básico",
      "Reseñas de clientes",
    ],
    cta: "Contactar",
  },
  {
    id: "geo",
    icon: MapPin,
    color: "#22C55E",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.25)",
    badge: "bg-green-100 text-green-700",
    name: "Geolocalización",
    price: "$15 - $25",
    period: "/mes",
    desc: "Aparece en el mapa interactivo de la plataforma y en tu ciudad con geolocalización precisa.",
    features: [
      "Ubicación en mapa interactivo",
      "Posición en ciudad/destino",
      "Pin personalizado en mapa",
      "Integración Google Maps",
      "Coordenadas exactas",
      "Visible en búsquedas por zona",
    ],
    cta: "Contactar",
  },
  {
    id: "imagen",
    icon: Camera,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
    badge: "bg-amber-100 text-amber-700",
    name: "Imagen Corporativa",
    price: "$50 - $100",
    period: "/mes",
    desc: "Galería fotográfica profesional, identidad visual completa y posicionamiento de marca para tu establecimiento.",
    features: [
      "Galería ilimitada de fotos",
      "Video de presentación",
      "Logo y branding en perfil",
      "Diseño de identidad visual",
      "Publicaciones en redes HDV",
      "Reporte de imagen mensual",
    ],
    cta: "Contactar",
  },
  {
    id: "app-hotel",
    icon: Smartphone,
    color: T,
    bg: "rgba(0,200,212,0.08)",
    border: "rgba(0,200,212,0.25)",
    badge: "bg-cyan-100 text-cyan-700",
    name: "Aplicación Web Hotel",
    price: "$50 - $70",
    period: "/mes",
    desc: "Dependiendo de la SOLUCIÓN WEB completa para tu hotel. Diseño personalizado, gestión de habitaciones y reservas.",
    features: [
      "App web personalizada",
      "Gestión de habitaciones",
      "Panel de administración",
      "Sistema de reservas propio",
      "Pasarela de pagos integrada",
      "Soporte técnico incluido",
    ],
    highlight: "✅ APLICACIÓN WEB completa para el hotel. Para hoteles con más infraestructura y operaciones",
    cta: "Activar",
  },
  {
    id: "reservas",
    icon: Calendar,
    color: P,
    bg: "rgba(155,0,204,0.08)",
    border: "rgba(155,0,204,0.25)",
    badge: "bg-purple-100 text-purple-700",
    name: "Sistema de Reservas",
    price: "$30 - $60",
    period: "/mes",
    desc: "Implementa un sistema de reservas en tu página web, perfectamente integrado con los canales de HDV.",
    features: [
      "Calendario de disponibilidad",
      "Reservas en línea 24/7",
      "Confirmaciones automáticas",
      "Gestión de pagos online",
      "Panel de control de reservas",
      "Notificaciones por WhatsApp",
    ],
    cta: "Contactar",
  },
  {
    id: "premium",
    icon: Star,
    color: F,
    bg: "rgba(255,0,150,0.06)",
    border: F,
    badge: "bg-pink-100 text-pink-700",
    name: "Membresía Premium",
    price: "$80 - $120",
    period: "/mes",
    desc: "Máxima visibilidad + herramientas avanzadas. Ideal para hoteles y posadas que quieren liderar su destino.",
    features: [
      "Todo lo anterior incluido",
      "Primera posición en búsquedas",
      "Badge verificado ✓",
      "CRM de leads WhatsApp",
      "Panel de analíticas completo",
      "Soporte prioritario 24/7",
    ],
    popular: true,
    cta: "Activar",
  },
  {
    id: "complejos",
    icon: Building2,
    color: "#1E40AF",
    bg: "rgba(30,64,175,0.08)",
    border: "rgba(30,64,175,0.25)",
    badge: "bg-blue-100 text-blue-700",
    name: "Complejos Turísticos",
    price: "$150 - $250",
    period: "/mes",
    desc: "Para resorts, complejos turísticos y hoteles boutique con múltiples servicios y alta demanda.",
    features: [
      "Perfil premium de complejo",
      "Múltiples instalaciones",
      "Galería profesional completa",
      "Tours virtuales 360°",
      "Gestión multi-usuario",
      "Reporte ejecutivo mensual",
    ],
    cta: "Contactar",
  },
  {
    id: "promo",
    icon: Megaphone,
    color: "#EA580C",
    bg: "rgba(234,88,12,0.08)",
    border: "rgba(234,88,12,0.25)",
    badge: "bg-orange-100 text-orange-700",
    name: "Promociona Tus Servicios",
    price: "$70 - $80",
    period: "/mes",
    desc: "Marketing activo para tu establecimiento: campañas, publicaciones en redes sociales y email marketing.",
    features: [
      "Campañas en redes sociales",
      "Email marketing mensual",
      "Publicaciones HDV blog",
      "Banners en Home",
      "Promociones especiales",
      "Reportes de campaña",
    ],
    cta: "Contactar",
  },
  {
    id: "gold",
    icon: Crown,
    color: "#D97706",
    bg: "rgba(217,119,6,0.08)",
    border: "rgba(217,119,6,0.3)",
    badge: "bg-yellow-100 text-yellow-700",
    name: "Membresía Gold + App Web",
    price: "$80 - $110",
    period: "/mes",
    desc: "El plan definitivo: membresía Gold con aplicación web propia integrada al ecosistema HDV.",
    features: [
      "App web propia personalizada",
      "Membresía Gold completa",
      "Primera posición en todo",
      "Badge Gold exclusivo 🌟",
      "Soporte dedicado VIP",
      "Consultor de onboarding",
    ],
    highlight: "✅ APP WEB PROPIA + MEMBRESÍA GOLD. Precio más bajo del mercado",
    cta: "Activar",
  },
];

const PASOS = [
  { n: "1", icon: Phone, title: "Contacta", desc: "Whatsapp o llamada, en 1-2 días te orientamos sobre el plan ideal." },
  { n: "2", icon: Star, title: "Elige tu Plan", desc: "Te asesoramos y seleccionas el servicio que mejor se adapta a tu negocio." },
  { n: "3", icon: Zap, title: "Activación", desc: "5 a 20 días hábiles. En tu negocio y empieza a funcionar." },
  { n: "4", icon: Users, title: "Reservas", desc: "Empieza a recibir clientes y aumentar tus reservaciones." },
];

const WEB_COMPARACION = {
  tradicional: [
    "No se actualiza fácilmente",
    "Sin sistema de gestión",
    "Sin reservas en línea",
    "Sin panel de control",
    "Soporte técnico costoso",
    "Sin analíticas integradas",
  ],
  hdv: [
    "Actualización en tiempo real",
    "Panel de administración propio",
    "Sistema de reservas integrado",
    "Control total de tu perfil",
    "Soporte técnico incluido",
    "Analíticas de visitas y clics",
  ],
};

export function Membresias() {
  const [openCard] = useState<string | null>(null);

  return (
    <>

      {/* ── BANNER URGENCIA ────────────────────────────────── */}
      <div className="py-2.5 text-center text-white text-xs font-semibold" style={{ background: "linear-gradient(90deg,#e53e3e,#F59E0B)" }}>
        ⚡ ¡CUPO LIMITADO! — Lleva el límite de clientes sin el precio de una membresía tradicional.{" "}
        <a href={`https://wa.me/${PHONE.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" className="underline ml-1">
          Contáctanos ahora →
        </a>
      </div>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20" style={{ background: "linear-gradient(135deg, #0e0120 0%, #1a0533 60%, #0d1a2e 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-20" style={{ background: F }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ background: T }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: "rgba(255,0,150,0.15)", color: F, border: "1px solid rgba(255,0,150,0.3)" }}>
            <Zap className="w-3.5 h-3.5" /> Para propietarios de hoteles, posadas y negocios turísticos
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Tu Hotel en el{" "}
            <span style={{ background: `linear-gradient(90deg,${F},${T})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              #1 de Google
            </span>
            <br />+ Aplicación Web Propia
          </h1>
          <p className="text-white/60 text-lg mb-4 max-w-2xl mx-auto">
            Hoteles de Venezuela está posicionado #1 en Google. <br />
            <span className="text-white/80 font-medium">¿Quieres que tu Hotel aparezca en el #1? Al-CLICA AQUÍ WEB</span>
          </p>

          {/* Dos bloques principales */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mt-8 mb-8">
            <div className="rounded-2xl p-6 text-left" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Globe className="w-7 h-7 mb-3" style={{ color: F }} />
              <h3 className="text-white font-bold text-lg mb-1">Espacio en el #1 de Google</h3>
              <p className="text-white/50 text-sm mb-3">Aparecer donde te buscan tus futuros clientes sin costosas campañas.</p>
              <p className="text-2xl font-bold" style={{ color: F }}>Desde <span>$19</span><span className="text-base font-normal text-white/50">/mes</span></p>
            </div>
            <div className="rounded-2xl p-6 text-left" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Smartphone className="w-7 h-7 mb-3" style={{ color: T }} />
              <h3 className="text-white font-bold text-lg mb-1">Aplicación Web Completa</h3>
              <p className="text-white/50 text-sm mb-3">Tu propio sistema de reservas, panel de gestión y app web personalizada.</p>
              <p className="text-2xl font-bold" style={{ color: T }}>Desde <span>$30</span><span className="text-base font-normal text-white/50">/mes</span></p>
            </div>
          </div>

          <a href={`https://wa.me/${PHONE.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white text-base mb-4 transition-all hover:opacity-90 shadow-md"
            style={{ background: `linear-gradient(90deg,${F},${P})` }}>
            <Phone className="w-4 h-4" /> {PHONE}
          </a>
        </div>
      </section>

      {/* ── PROCESO ───────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Proceso Simple — Empieza Hoy Mismo</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {PASOS.map((paso, i) => {
              const Icon = paso.icon;
              return (
                <div key={i} className="text-center relative">
                  {i < PASOS.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[calc(50%+28px)] right-0 h-0.5" style={{ background: `linear-gradient(90deg,${F},${T})` }} />
                  )}
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10"
                    style={{ background: `linear-gradient(135deg,${F},${P})` }}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-xs font-bold mb-1" style={{ color: F }}>Paso {paso.n}</div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{paso.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{paso.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SERVICIOS GRID ────────────────────────────────── */}
      <section id="planes" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Nuestros Servicios</h2>
            <p className="text-gray-500 text-lg">Elige el plan o servicio que mejor se adapte a tu negocio turístico</p>
          </div>

          <div className="flex flex-col md:grid md:grid-cols-3 gap-6">
            {SERVICIOS.map((s) => {
              const Icon = s.icon;
              const isPopular = s.popular;
              return (
                <div
                  key={s.id}
                  className={`relative rounded-3xl border p-7 flex flex-col shadow-sm transition-shadow duration-300 ${
                    isPopular 
                      ? "text-white border-[#FF0096]/40 shadow-xl" 
                      : "bg-white text-slate-800 border-slate-100 hover:shadow-md"
                  }`}
                  style={isPopular ? { background: "linear-gradient(135deg, #0e011f 0%, #1a0533 100%)" } : {}}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-bold text-white whitespace-nowrap uppercase tracking-widest shadow-md"
                      style={{ background: F }}>
                      Recomendado
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: isPopular ? "rgba(255, 0, 150, 0.15)" : s.bg }}>
                      <Icon className="w-6 h-6" style={{ color: isPopular ? F : s.color }} />
                    </div>
                    <div>
                      <h3 className={`font-bold text-base leading-tight font-serif ${isPopular ? "text-white" : "text-slate-900"}`}>{s.name}</h3>
                      <div className="flex items-end gap-1 mt-1">
                        <span className="text-2xl font-bold font-sans" style={{ color: isPopular ? T : s.color }}>{s.price}</span>
                        <span className={`text-xs ${isPopular ? "text-slate-400" : "text-gray-400"} mb-0.5`}>{s.period}</span>
                      </div>
                    </div>
                  </div>

                  <p className={`text-sm mb-5 leading-relaxed ${isPopular ? "text-slate-300" : "text-gray-500"}`}>{s.desc}</p>

                  {s.highlight && (
                    <div className="text-xs font-semibold mb-5 p-3 rounded-xl" style={{ background: isPopular ? "rgba(0, 200, 212, 0.1)" : s.bg, color: isPopular ? T : s.color }}>
                      {s.highlight}
                    </div>
                  )}

                  <ul className="space-y-3 mb-6 flex-1">
                    {s.features.map((f, i) => (
                      <li key={i} className={`flex items-start gap-2.5 text-xs ${isPopular ? "text-white/90" : "text-slate-650"}`}>
                        <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: isPopular ? "#FFFFFF" : s.color }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={`https://wa.me/${PHONE.replace(/\D/g,"")}?text=Hola, estoy interesado en el servicio de ${encodeURIComponent(s.name)} para mi establecimiento.`}
                    target="_blank" rel="noreferrer"
                    className="w-full py-3.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 transition-all hover:opacity-95 shadow-md active:scale-98"
                    style={{ background: isPopular ? `linear-gradient(90deg, ${F}, ${P})` : `linear-gradient(90deg, ${s.color}, ${P})` }}
                  >
                    {s.cta} <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              );
            })}
          </div>

          {/* BANNER MÉTODOS DE PAGO LOCALES DE VENEZUELA */}
          <div className="mt-14 max-w-4xl mx-auto rounded-3xl p-6 md:p-8 text-center border-2 border-dashed border-[#00C8D4]/30 bg-cyan-50/5 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-gray-900 mb-2">🇻🇪 Métodos de Pago Locales y Alternativos</h3>
              <p className="text-gray-500 text-sm mb-5 max-w-2xl mx-auto">
                ¿No puedes pagar con tarjeta de crédito internacional a través de Stripe? No te preocupes. Aceptamos <strong>Pago Móvil (Bs.), Zelle, USDT (Binance Pay) y PayPal</strong>. 
                Realiza tu transferencia y reporta el pago con tu captura de pantalla en nuestro módulo de verificación.
              </p>
              <Link href="/reportar-pago" className="inline-block px-6 py-3 bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer text-center">
                Reportar Pago Realizado →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── ESTADÍSTICAS ──────────────────────────────────── */}
      <section className="py-16" style={{ background: "linear-gradient(135deg,#0e0120,#1a0533)" }}>
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-white/60 text-sm mb-8 italic">
            💡 Mientras lo piensas, tu competencia ya está captando clientes
          </p>
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: "10,000+", label: "Turistas Registrados", icon: Users },
              { value: "32.5%", label: "Crecimiento mensual en búsquedas", icon: TrendingUp },
              { value: "12", label: "Ciudades activas en la plataforma", icon: MapPin },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i}>
                  <Icon className="w-7 h-7 mx-auto mb-3 opacity-60" style={{ color: i === 0 ? F : i === 1 ? T : P }} />
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-white/50 text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <a href={`https://wa.me/${PHONE.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-bold text-white text-sm transition-all hover:opacity-90 shadow-md"
              style={{ background: `linear-gradient(90deg,${F},${P})` }}>
              COMENZAR AHORA →
            </a>
          </div>
        </div>
      </section>

      {/* ── COMPARACIÓN ───────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">¿Página Web o Aplicación Web?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border-2 border-gray-200 p-7 bg-gray-50">
              <h3 className="font-bold text-gray-700 text-lg mb-5 flex items-center gap-2">
                <X className="w-5 h-5 text-red-500" /> Página Web Tradicional
              </h3>
              <ul className="space-y-3">
                {WEB_COMPARACION.tradicional.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-500">
                    <X className="w-4 h-4 text-red-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 p-7" style={{ borderColor: F, background: "rgba(255,0,150,0.03)" }}>
              <h3 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
                <Check className="w-5 h-5" style={{ color: F }} /> Aplicación Web HDV
              </h3>
              <ul className="space-y-3">
                {WEB_COMPARACION.hdv.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-800">
                    <Check className="w-4 h-4 shrink-0" style={{ color: F }} />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-4 border-t" style={{ borderColor: "rgba(255,0,150,0.2)" }}>
                <p className="text-sm font-bold" style={{ color: F }}>Desde $30/mes (incluye mantenimiento)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DOS CTAs ──────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Turista */}
          <div className="rounded-2xl p-8" style={{ background: "linear-gradient(135deg,#0e0120,#1a0533)" }}>
            <Award className="w-10 h-10 mb-4" style={{ color: T }} />
            <h3 className="text-white font-bold text-xl mb-3">¿Eres Turista?</h3>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              Explora Hoteles de Venezuela y descubre los mejores hoteles, posadas y destinos turísticos del país.
            </p>
            <Link href="/establecimientos" className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 shadow-md"
              style={{ background: `linear-gradient(90deg,${T},#0891B2)` }}>
              Explorar destinos →
            </Link>
          </div>

          {/* Propietario */}
          <div className="rounded-2xl p-8" style={{ background: `linear-gradient(135deg,${F}22,${P}22)`, border: `2px solid ${F}40` }}>
            <Zap className="w-10 h-10 mb-4" style={{ color: F }} />
            <h3 className="font-bold text-gray-900 text-xl mb-3">¿Listo para Empezar?</h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Registra tu hotel, posada o negocio turístico y empieza a recibir clientes desde el primer día.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/registro-negocio" className="w-full px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 flex items-center justify-center shadow-md"
                style={{ background: `linear-gradient(90deg,${F},${P})` }}>
                Registrar mi negocio →
              </Link>
              <a href={`https://wa.me/${PHONE.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
                className="w-full px-6 py-3 rounded-xl font-semibold text-sm border-2 transition-all hover:opacity-90 flex items-center justify-center"
                style={{ borderColor: F, color: F }}>
                📱 {PHONE}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFICIOS ADICIONALES ────────────────────────── */}
      <section className="py-16" style={{ background: `linear-gradient(135deg,${F},${P},${T})` }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Crown className="w-12 h-12 mx-auto mb-4 text-white opacity-80" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Tu competencia ya está en la plataforma
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Cada día que pasa sin estar en HDV es un cliente más para tu competencia. Comienza hoy.
          </p>
          <a href={`https://wa.me/${PHONE.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
            className="inline-flex items-center justify-center px-10 py-4 bg-white rounded-full font-bold text-sm hover:shadow-xl transition-all"
            style={{ color: F }}>
            Hablar con un asesor ahora →
          </a>
        </div>
      </section>
    </>
  );
}
