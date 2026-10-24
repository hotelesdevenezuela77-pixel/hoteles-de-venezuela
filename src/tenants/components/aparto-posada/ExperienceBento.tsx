import React from "react";
import { Compass, Waves, Zap, Sparkles, ArrowUpRight } from "lucide-react";
import { APARTO_DIFFERENTIALS, APARTO_BENTO_TILES } from "../../lib/apartoPosadaData";

interface ExperienceBentoProps {
  onOpenImage?: (imgUrl: string, caption: string) => void;
}

export function ExperienceBento({ onOpenImage }: ExperienceBentoProps) {
  return (
    <section id="experiencia" className="py-20 md:py-28 bg-slate-50/70 border-b border-slate-200/80 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Encabezado de Storytelling de Alto Impacto */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00C8D4]/10 border border-[#00C8D4]/30 text-[#009da7] text-[11px] font-extrabold tracking-[0.25em] uppercase font-['Plus_Jakarta_Sans',sans-serif]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF0096]" />
            EXPERIENCIA & HOSPITALIDAD EXCLUSIVA EN MORROCOY
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] font-['Plus_Jakarta_Sans',sans-serif]">
            Su Casa en las Playas de Morrocoy
          </h2>

          <p className="text-slate-600 text-sm sm:text-base md:text-lg font-normal leading-relaxed font-['Inter',sans-serif] max-w-2xl mx-auto">
            Disfrute de la independencia de un apartamento totalmente equipado con la calidez, piscina cristalina y seguridad de una posada vacacional de primera línea.
          </p>
        </div>

        {/* 3 Valores Diferenciales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {APARTO_DIFFERENTIALS.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-7 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: item.solidBg }}
                    >
                      <IconComp className="w-6 h-6 text-white stroke-[2.2]" />
                    </div>
                    <span className="text-xs font-black tracking-widest text-slate-300 font-mono">
                      {item.number}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif] group-hover:text-[#00C8D4] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed font-['Inter',sans-serif]">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                  <span className="font-['Plus_Jakarta_Sans',sans-serif] tracking-wider uppercase text-[10px]">Garantía Certificada</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#00C8D4]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bento Grid Moderno (5 Imágenes) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 font-['Plus_Jakarta_Sans',sans-serif]">
              Galería Visual Destacada
            </span>
            <span className="text-xs font-semibold text-[#00C8D4] font-['Inter',sans-serif]">
              Instalaciones & Entorno Natural
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[220px]">
            {/* Tile 1: Piscina Hero (2x2) */}
            <div
              onClick={() => onOpenImage && onOpenImage(APARTO_BENTO_TILES[0].image, APARTO_BENTO_TILES[0].title)}
              className="col-span-1 md:col-span-2 row-span-2 rounded-3xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-200/80 bg-slate-900"
            >
              <img
                src={APARTO_BENTO_TILES[0].image}
                alt={APARTO_BENTO_TILES[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
              
              <div className="absolute top-4 left-4">
                <span className="px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white bg-[#00C8D4] shadow-md font-['Plus_Jakarta_Sans',sans-serif]">
                  {APARTO_BENTO_TILES[0].tag}
                </span>
              </div>

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <h4 className="text-xl sm:text-2xl font-black font-['Plus_Jakarta_Sans',sans-serif] tracking-tight text-white drop-shadow">
                  {APARTO_BENTO_TILES[0].title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 font-normal font-['Inter',sans-serif] drop-shadow">
                  {APARTO_BENTO_TILES[0].subtitle}
                </p>
              </div>
            </div>

            {/* Tile 2: Morrocoy Cayos (1x1) */}
            <div
              onClick={() => onOpenImage && onOpenImage(APARTO_BENTO_TILES[1].image, APARTO_BENTO_TILES[1].title)}
              className="col-span-1 md:col-span-1 row-span-1 rounded-3xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-200/80 bg-slate-900"
            >
              <img
                src={APARTO_BENTO_TILES[1].image}
                alt={APARTO_BENTO_TILES[1].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent"></div>
              
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-white bg-[#FF0096] shadow-md font-['Plus_Jakarta_Sans',sans-serif]">
                  {APARTO_BENTO_TILES[1].tag}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h4 className="text-sm font-extrabold font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
                  {APARTO_BENTO_TILES[1].title}
                </h4>
                <p className="text-[11px] text-slate-200 font-normal font-['Inter',sans-serif] line-clamp-1">
                  {APARTO_BENTO_TILES[1].subtitle}
                </p>
              </div>
            </div>

            {/* Tile 3: Caney y Parrilleras (1x1) */}
            <div
              onClick={() => onOpenImage && onOpenImage(APARTO_BENTO_TILES[2].image, APARTO_BENTO_TILES[2].title)}
              className="col-span-1 md:col-span-1 row-span-1 rounded-3xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-200/80 bg-slate-900"
            >
              <img
                src={APARTO_BENTO_TILES[2].image}
                alt={APARTO_BENTO_TILES[2].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent"></div>
              
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-white bg-[#9B00CC] shadow-md font-['Plus_Jakarta_Sans',sans-serif]">
                  {APARTO_BENTO_TILES[2].tag}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h4 className="text-sm font-extrabold font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
                  {APARTO_BENTO_TILES[2].title}
                </h4>
                <p className="text-[11px] text-slate-200 font-normal font-['Inter',sans-serif] line-clamp-1">
                  {APARTO_BENTO_TILES[2].subtitle}
                </p>
              </div>
            </div>

            {/* Tile 4: Gastronomía Marina (1x1) */}
            <div
              onClick={() => onOpenImage && onOpenImage(APARTO_BENTO_TILES[3].image, APARTO_BENTO_TILES[3].title)}
              className="col-span-1 md:col-span-1 row-span-1 rounded-3xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-200/80 bg-slate-900"
            >
              <img
                src={APARTO_BENTO_TILES[3].image}
                alt={APARTO_BENTO_TILES[3].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent"></div>
              
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-white bg-[#00C8D4] shadow-md font-['Plus_Jakarta_Sans',sans-serif]">
                  {APARTO_BENTO_TILES[3].tag}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h4 className="text-sm font-extrabold font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
                  {APARTO_BENTO_TILES[3].title}
                </h4>
                <p className="text-[11px] text-slate-200 font-normal font-['Inter',sans-serif] line-clamp-1">
                  {APARTO_BENTO_TILES[3].subtitle}
                </p>
              </div>
            </div>

            {/* Tile 5: Noche y Piscina Iluminada (1x1) */}
            <div
              onClick={() => onOpenImage && onOpenImage(APARTO_BENTO_TILES[4].image, APARTO_BENTO_TILES[4].title)}
              className="col-span-1 md:col-span-1 row-span-1 rounded-3xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-200/80 bg-slate-900"
            >
              <img
                src={APARTO_BENTO_TILES[4].image}
                alt={APARTO_BENTO_TILES[4].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent"></div>
              
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-white bg-[#FF0096] shadow-md font-['Plus_Jakarta_Sans',sans-serif]">
                  {APARTO_BENTO_TILES[4].tag}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h4 className="text-sm font-extrabold font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
                  {APARTO_BENTO_TILES[4].title}
                </h4>
                <p className="text-[11px] text-slate-200 font-normal font-['Inter',sans-serif] line-clamp-1">
                  {APARTO_BENTO_TILES[4].subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
