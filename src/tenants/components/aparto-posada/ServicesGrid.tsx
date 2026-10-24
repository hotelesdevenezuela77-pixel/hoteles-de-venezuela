import React from "react";
import { Sparkles } from "lucide-react";
import { APARTO_SERVICES } from "../../lib/apartoPosadaData";

export function ServicesGrid() {
  return (
    <section id="servicios" className="py-20 md:py-28 bg-slate-50/70 border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Encabezado */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#9B00CC]/10 border border-[#9B00CC]/30 text-[#9B00CC] text-[11px] font-extrabold tracking-[0.25em] uppercase font-['Plus_Jakarta_Sans',sans-serif]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF0096]" />
            COMODIDADES & BIENESTAR COMPLETO
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
            Servicios e Instalaciones
          </h2>

          <p className="text-slate-600 text-sm sm:text-base font-normal font-['Inter',sans-serif] max-w-2xl mx-auto">
            Diseñadas para maximizar el confort familiar y garantizar una estadía libre de preocupaciones en el Parque Nacional Morrocoy.
          </p>
        </div>

        {/* Tarjetas Minimalistas de Servicios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {APARTO_SERVICES.map((service, idx) => {
            const IconComp = service.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div className="space-y-4">
                  {/* Caja de color sólido con icono SVG en blanco puro per AGENTS.md */}
                  <div
                    className="w-13 h-13 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: service.solidBg }}
                  >
                    <IconComp className="w-6 h-6 text-white stroke-[2.2]" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif] group-hover:text-[#00C8D4] transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed font-['Inter',sans-serif]">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] font-bold text-emerald-600 font-['Plus_Jakarta_Sans',sans-serif]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Servicio Incluido en la Estadía</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
