import React from "react";
import { Star, ShieldCheck, Zap } from "lucide-react";

export function TrustBar() {
  return (
    <div className="w-full max-w-5xl mx-auto mt-4 px-2">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl md:rounded-full border border-slate-200/90 shadow-xl shadow-cyan-950/10 px-4 sm:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        
        {/* Item 1: Google Reviews */}
        <div className="w-full md:w-1/3 flex items-center justify-center md:justify-start gap-3 py-1 md:py-0 md:pr-4">
          <div className="w-8 h-8 rounded-full bg-[#FF0096] flex items-center justify-center text-white shrink-0 shadow-sm">
            <Star className="w-4 h-4 fill-white text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
                ★ 4.8 en Google Reviews
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block font-['Inter',sans-serif]">
              +120 valoraciones de huéspedes
            </span>
          </div>
        </div>

        {/* Item 2: 0% Comisiones */}
        <div className="w-full md:w-1/3 flex items-center justify-center md:justify-start gap-3 py-1 md:py-0 md:px-4">
          <div className="w-8 h-8 rounded-full bg-[#00C8D4] flex items-center justify-center text-white shrink-0 shadow-sm">
            <ShieldCheck className="w-4.5 h-4.5 text-white stroke-[2.5]" />
          </div>
          <div className="text-left">
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight block">
              Contacto Directo 0% Comisiones
            </span>
            <span className="text-[11px] text-slate-500 font-medium block font-['Inter',sans-serif]">
              Trato directo con los anfitriones
            </span>
          </div>
        </div>

        {/* Item 3: Planta Eléctrica & Agua Continua */}
        <div className="w-full md:w-1/3 flex items-center justify-center md:justify-start gap-3 py-1 md:py-0 md:pl-4">
          <div className="w-8 h-8 rounded-full bg-[#9B00CC] flex items-center justify-center text-white shrink-0 shadow-sm">
            <Zap className="w-4.5 h-4.5 text-white fill-white" />
          </div>
          <div className="text-left">
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight block">
              Planta Eléctrica 100% & Agua Continua
            </span>
            <span className="text-[11px] text-slate-500 font-medium block font-['Inter',sans-serif]">
              Aires split y suministro 24/7 garantizado
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
