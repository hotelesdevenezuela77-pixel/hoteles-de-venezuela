import React, { useState } from "react";
import { 
  MapPin, Navigation, Copy, Check, ExternalLink, MessageCircle, 
  Sparkles, ShieldCheck, Compass, Award 
} from "lucide-react";
import { APARTO_LOCATION } from "../../lib/apartoPosadaData";

interface LocationSectionProps {
  whatsappPhone: string;
  hotelName: string;
}

export function LocationSection({ whatsappPhone, hotelName }: LocationSectionProps) {
  const [mapMode, setMapMode] = useState<"satelite" | "estandar">("satelite");
  const [copied, setCopied] = useState<boolean>(false);

  const cleanWa = whatsappPhone.replace(/\D/g, "");
  const coords = APARTO_LOCATION.coords;

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${coords.lat}, ${coords.lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const ctaWaUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
    `Hola ${hotelName}, deseo cotizar una estancia directa y consultar disponibilidad. ¿Podrían orientarme con las mejores opciones y fechas?`
  )}`;

  return (
    <section id="ubicacion" className="py-20 md:py-28 bg-white px-4 sm:px-6 lg:px-8 space-y-20">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Encabezado */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00C8D4]/10 border border-[#00C8D4]/30 text-[#009da7] text-[11px] font-extrabold tracking-[0.25em] uppercase font-['Plus_Jakarta_Sans',sans-serif]">
            <Compass className="w-3.5 h-3.5 text-[#00C8D4]" />
            ACCESO ESTRATÉGICO A PLAYAS Y CAYOS
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
            Ubicación & Cómo Llegar
          </h2>

          <p className="text-slate-600 text-sm sm:text-base font-normal font-['Inter',sans-serif] max-w-2xl mx-auto">
            {APARTO_LOCATION.address}
          </p>
        </div>

        {/* Bloque Grid: Instrucciones de Llegada + Mapa Interactivo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Columna Izquierda: Instrucciones de Ruta Paso a Paso */}
          <div className="lg:col-span-5 bg-slate-50/90 rounded-3xl p-6 sm:p-8 border border-slate-200/90 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 font-['Plus_Jakarta_Sans',sans-serif]">
                <Navigation className="w-4 h-4 text-[#00C8D4]" />
                <span>Instrucciones Claras de Llegada</span>
              </div>

              <div className="space-y-5">
                {APARTO_LOCATION.drivingInstructions.map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#00C8D4]/15 border border-[#00C8D4]/40 text-[#00C8D4] font-black text-xs flex items-center justify-center shrink-0 font-mono">
                      {step.step}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-['Inter',sans-serif]">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enlaces y Coordenadas */}
            <div className="pt-4 border-t border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Coordenadas GPS:</span>
                <button
                  type="button"
                  onClick={handleCopyCoords}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00C8D4] hover:text-[#009da7] cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "¡Copiadas!" : `${coords.lat}, ${coords.lng}`}</span>
                </button>
              </div>

              <div className="flex gap-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>Google Maps</span>
                </a>
                <a
                  href={`https://waze.com/ul?ll=${coords.lat},${coords.lng}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#00C8D4]/15 hover:bg-[#00C8D4]/25 border border-[#00C8D4]/40 text-[#009da7] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#00C8D4]" />
                  <span>Abrir en Waze</span>
                </a>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Mapa Interactivo con Switch Satélite/Estándar */}
          <div className="lg:col-span-7 bg-[#0e011f] rounded-3xl overflow-hidden border border-slate-200 shadow-xl flex flex-col min-h-[420px]">
            {/* Header del Mapa */}
            <div className="p-4 bg-gradient-to-r from-[#0e011f] via-[#1a0533] to-[#0e011f] text-white flex items-center justify-between shrink-0 border-b border-white/10">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00C8D4]" />
                <span className="text-xs font-extrabold uppercase tracking-wider font-['Plus_Jakarta_Sans',sans-serif]">
                  Vista Satelital & Terrestre Morrocoy
                </span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMapMode("satelite")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                    mapMode === "satelite" ? "bg-[#00C8D4] text-white shadow-xs" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Satélite
                </button>
                <button
                  type="button"
                  onClick={() => setMapMode("estandar")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                    mapMode === "estandar" ? "bg-[#00C8D4] text-white shadow-xs" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Mapa
                </button>
              </div>
            </div>

            {/* Contenedor Iframe */}
            <div className="flex-1 w-full min-h-[340px] relative bg-slate-900">
              <iframe
                title="Mapa de Ubicación de Aparto Posada del Mar"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&t=${mapMode === "satelite" ? "k" : "m"}&z=15&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full min-h-[340px]"
              />
              <div className="absolute top-4 left-4 bg-[#0e011f]/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/20 text-[10px] text-white font-black flex items-center gap-2 shadow-2xl pointer-events-none">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00C8D4] animate-pulse" />
                <span>ACCESO VERIFICADO • TUCACAS / MORROCOY</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── BANNER FINAL DE CIERRE (CTA OFICIAL EN GRADIENTE MAGENTA / PÚRPURA CON BOTÓN BLANCO PER AGENTS.MD) ── */}
      <div className="max-w-6xl mx-auto">
        <div 
          className="rounded-3xl p-8 sm:p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl"
          style={{ background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)" }}
        >
          {/* Elementos decorativos de fondo */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 rounded-full bg-black/15 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 space-y-6 max-w-3xl mx-auto flex flex-col items-center">
            <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-3xl border border-white/40 shadow-2xl hover:scale-105 transition-transform duration-300">
              <img
                src="/images/aparto-posada/logo.png"
                alt={hotelName}
                className="w-24 sm:w-28 h-auto object-contain drop-shadow-sm"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.src.includes("logo-oficial.png")) {
                    target.src = "/images/aparto-posada/logo-oficial.png";
                  }
                }}
              />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-extrabold tracking-[0.25em] uppercase font-['Plus_Jakarta_Sans',sans-serif]">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              RESERVA DIRECTA GARANTIZADA 0% COMISIONES
            </div>

            <h3 className="text-3xl sm:text-5xl md:text-6xl font-black font-['Plus_Jakarta_Sans',sans-serif] tracking-tight leading-[1.1] text-white drop-shadow-md">
              Planifique su Próxima Escapada a Morrocoy
            </h3>

            <p className="text-sm sm:text-base md:text-lg text-white/95 font-normal leading-relaxed font-['Inter',sans-serif] max-w-2xl mx-auto drop-shadow-xs">
              Consulte tarifas oficiales y disponibilidad en tiempo real directamente con el equipo anfitrión de {hotelName}. Sin cobros ocultos ni intermediarios.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              {/* Botón oficial de acción blanco con texto magenta según AGENTS.md */}
              <a
                href={ctaWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-9 py-4 rounded-full font-extrabold text-sm sm:text-base text-[#FF0096] bg-white hover:bg-slate-100 transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-3 cursor-pointer font-['Plus_Jakarta_Sans',sans-serif]"
              >
                <MessageCircle className="w-5 h-5 fill-[#25D366] text-[#25D366]" />
                <span>Contactar Recepción por WhatsApp</span>
              </a>
            </div>

            <div className="pt-2 flex items-center justify-center gap-6 text-xs text-white/90 font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                Respuesta Inmediata
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                Garantía de Mejor Tarifa
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
