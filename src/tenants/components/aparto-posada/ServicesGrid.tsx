import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { APARTO_SERVICES } from "../../lib/apartoPosadaData";
import { type Language, APARTO_TRANSLATIONS } from "../../lib/apartoTranslations";

interface ServicesGridProps {
  language?: Language;
}

export function ServicesGrid({ language = "es" }: ServicesGridProps) {
  const t = APARTO_TRANSLATIONS[language].services;

  return (
    <section id="servicios" className="py-20 md:py-28 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Encabezado Editorial Boutique */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00C8D4]/10 border border-[#00C8D4]/30 text-[#009da7] text-[11px] font-extrabold tracking-[0.25em] uppercase font-['Plus_Jakarta_Sans',sans-serif]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF0096]" />
            {t.badge}
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-serif">
            {t.title}
          </h2>

          <p className="text-slate-600 text-sm sm:text-base font-normal font-['Inter',sans-serif] max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Cuadrícula Limpia con Iconos Minimalistas de Trazo Único (Outline) en Tonos Neutros Elegantes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {APARTO_SERVICES.map((service, idx) => {
            const IconComp = service.icon;
            const item = t.items[idx] || { title: service.title, description: service.description };

            return (
              <div
                key={idx}
                className="bg-slate-50/60 rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-xl hover:bg-white hover:border-[#00C8D4]/40 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div className="space-y-5">
                  {/* Icono Minimalista de Trazo Único (Outline) en Tono Neutro Elegante */}
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-center text-slate-700 group-hover:text-[#00C8D4] group-hover:border-[#00C8D4]/30 group-hover:shadow-md transition-all duration-300">
                    <IconComp className="w-7 h-7 stroke-[1.4]" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight font-serif group-hover:text-[#00C8D4] transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed font-['Inter',sans-serif]">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-6 border-t border-slate-200/60 flex items-center gap-2 text-[11px] font-bold text-emerald-700 font-['Plus_Jakarta_Sans',sans-serif]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.included}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
