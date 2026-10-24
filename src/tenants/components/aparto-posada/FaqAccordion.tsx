import React, { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";
import { APARTO_FAQS } from "../../lib/apartoPosadaData";

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const toggleIndex = (idx: number) => {
    setOpenIndex(prev => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-slate-50/70 border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Encabezado */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF0096]/10 border border-[#FF0096]/30 text-[#FF0096] text-[11px] font-extrabold tracking-[0.25em] uppercase font-['Plus_Jakarta_Sans',sans-serif]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF0096]" />
            RESOLVEMOS TUS DUDAS
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
            Preguntas Frecuentes
          </h2>

          <p className="text-slate-600 text-sm sm:text-base font-normal font-['Inter',sans-serif]">
            Todo lo que necesitas conocer antes de confirmar tu reserva en Aparto Posada del Mar.
          </p>
        </div>

        {/* Lista de Acordeón */}
        <div className="space-y-4">
          {APARTO_FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isOpen ? "bg-[#00C8D4] text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <HelpCircle className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <span className="text-base sm:text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
                      {faq.question}
                    </span>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-[#FF0096]/10 text-[#FF0096]" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed font-['Inter',sans-serif] border-t border-slate-100/80 animate-fade-in">
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
