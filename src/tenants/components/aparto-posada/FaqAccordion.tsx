import React, { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";
import { type Language, APARTO_TRANSLATIONS } from "../../lib/apartoTranslations";

interface FaqAccordionProps {
  language?: Language;
}

export function FaqAccordion({ language = "es" }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default
  const t = APARTO_TRANSLATIONS[language].faq;

  const toggleIndex = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-14">
        
        {/* Encabezado Editorial Boutique */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00C8D4]/10 border border-[#00C8D4]/30 text-[#009da7] text-[11px] font-extrabold tracking-[0.25em] uppercase font-['Plus_Jakarta_Sans',sans-serif]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF0096]" />
            {t.badge}
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-serif">
            {t.title}
          </h2>

          <p className="text-slate-600 text-sm sm:text-base font-normal font-['Inter',sans-serif] leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Lista de Acordeón Limpia y Organizada con Estilo Hotel Boutique */}
        <div className="space-y-4">
          {t.items.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className={`rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "bg-slate-50/80 border-[#00C8D4]/50 shadow-md ring-1 ring-[#00C8D4]/20"
                    : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/40 shadow-xs"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(idx)}
                  className="w-full p-5 sm:p-7 text-left flex items-center justify-between gap-4 cursor-pointer transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-4">
                    {/* Icono de Trazo Fino Minimalista */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isOpen
                          ? "bg-[#00C8D4] text-white shadow-sm"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <HelpCircle className="w-4.5 h-4.5 stroke-[1.5]" />
                    </div>

                    <span className="text-base sm:text-lg font-bold text-slate-900 font-serif tracking-tight">
                      {faq.question}
                    </span>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? "rotate-180 bg-[#00C8D4]/15 text-[#008d96]"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 stroke-[2]" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-7 pb-7 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed font-['Inter',sans-serif] border-t border-slate-200/60 animate-fade-in pl-18">
                    <p className="pt-2">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
