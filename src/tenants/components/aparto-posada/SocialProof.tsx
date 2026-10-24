import React from "react";
import { Star, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { APARTO_REVIEWS } from "../../lib/apartoPosadaData";

export function SocialProof() {
  return (
    <section id="opiniones" className="py-20 md:py-28 bg-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Encabezado */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00C8D4]/10 border border-[#00C8D4]/30 text-[#009da7] text-[11px] font-extrabold tracking-[0.25em] uppercase font-['Plus_Jakarta_Sans',sans-serif]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF0096]" />
            EXPERIENCIAS REALES & CONFIANZA TOTAL
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
            Opiniones de Nuestros Huéspedes
          </h2>

          <div className="flex items-center justify-center gap-3 pt-1">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              4.8 de 5 en Google Reviews
            </span>
            <span className="text-xs text-slate-400 font-medium">
              (+120 evaluaciones)
            </span>
          </div>
        </div>

        {/* Grid de 3 Tarjetas estilo Google Maps / Google Business */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {APARTO_REVIEWS.map((review, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative"
            >
              <div className="space-y-4">
                {/* Cabecera del Testimonio: Avatar + Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-sm text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                          {review.name}
                        </h4>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00C8D4] fill-[#00C8D4]/20" />
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium block font-['Inter',sans-serif]">
                        {review.role}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-semibold font-mono">
                    {review.date}
                  </span>
                </div>

                {/* Estrellas Doradas */}
                <div className="flex items-center gap-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Reseña Textual */}
                <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed font-['Inter',sans-serif] italic">
                  "{review.content}"
                </p>
              </div>

              {/* Footer de Tarjeta con Sello Google */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-medium">Publicado en Google Maps</span>
                <span className="text-[#00C8D4] font-bold">Opinión Verificada</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
