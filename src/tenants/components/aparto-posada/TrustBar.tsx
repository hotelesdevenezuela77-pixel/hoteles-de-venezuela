import React from "react";
import { Star, ShieldCheck, Zap } from "lucide-react";
import { type Language, APARTO_TRANSLATIONS } from "../../lib/apartoTranslations";

interface TrustBarProps {
  language?: Language;
}

export function TrustBar({ language = "es" }: TrustBarProps) {
  const t = APARTO_TRANSLATIONS[language].trustBar;

  return (
    <div className="w-full max-w-5xl mx-auto mt-4 px-2 font-roboto">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl md:rounded-full border border-slate-200/90 shadow-xl shadow-cyan-950/10 px-4 sm:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        
        {/* Item 1: Google Reviews */}
        <div className="w-full md:w-1/3 flex items-center justify-center md:justify-start gap-3 py-1 md:py-0 md:pr-4">
          <div className="w-8 h-8 rounded-full bg-[#FF0096] flex items-center justify-center text-white shrink-0 shadow-sm">
            <Star className="w-4 h-4 fill-white text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-semibold text-slate-900 font-montserrat tracking-tight">
                {t.googleTitle}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-normal block font-roboto">
              {t.googleSub}
            </span>
          </div>
        </div>

        {/* Item 2: 0% Comisiones */}
        <div className="w-full md:w-1/3 flex items-center justify-center md:justify-start gap-3 py-1 md:py-0 md:px-4">
          <div className="w-8 h-8 rounded-full bg-[#00C8D4] flex items-center justify-center text-white shrink-0 shadow-sm">
            <ShieldCheck className="w-4.5 h-4.5 text-white stroke-[2.5]" />
          </div>
          <div className="text-left">
            <span className="text-xs sm:text-sm font-semibold text-slate-900 font-montserrat tracking-tight block">
              {t.commTitle}
            </span>
            <span className="text-[11px] text-slate-500 font-normal block font-roboto">
              {t.commSub}
            </span>
          </div>
        </div>

        {/* Item 3: Planta Eléctrica & Agua Continua */}
        <div className="w-full md:w-1/3 flex items-center justify-center md:justify-start gap-3 py-1 md:py-0 md:pl-4">
          <div className="w-8 h-8 rounded-full bg-[#9B00CC] flex items-center justify-center text-white shrink-0 shadow-sm">
            <Zap className="w-4.5 h-4.5 text-white fill-white" />
          </div>
          <div className="text-left">
            <span className="text-xs sm:text-sm font-semibold text-slate-900 font-montserrat tracking-tight block">
              {t.powerTitle}
            </span>
            <span className="text-[11px] text-slate-500 font-normal block font-roboto">
              {t.powerSub}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
