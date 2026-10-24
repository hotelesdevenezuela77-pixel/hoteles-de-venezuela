import React from "react";
import { Compass, Waves, Zap, Sparkles, ArrowUpRight, Camera, Maximize2, Eye, ShieldCheck, HeartHandshake } from "lucide-react";
import { APARTO_DIFFERENTIALS, APARTO_BENTO_TILES } from "../../lib/apartoPosadaData";
import { LuxuryHeroCarousel } from "./LuxuryHeroCarousel";

interface ExperienceBentoProps {
  onOpenImage?: (imgUrl: string, caption: string) => void;
}

export function ExperienceBento({ onOpenImage }: ExperienceBentoProps) {
  return (
    <section id="experiencia" className="py-16 md:py-24 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Encabezado de Storytelling de Alto Impacto con Logo Oficial (INTOCABLE) */}
        <div className="text-center space-y-5 max-w-3xl mx-auto flex flex-col items-center">
          <div className="relative group">
            <div className="absolute -inset-3 bg-gradient-to-r from-[#00C8D4]/25 via-[#FF0096]/20 to-[#9B00CC]/25 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>
            <img
              src="/images/aparto-posada/logo.png"
              alt="Aparto Posada del Mar - Logo Oficial"
              className="relative w-36 sm:w-44 md:w-52 h-auto object-contain drop-shadow-lg hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.src.includes("logo-oficial.png")) {
                  target.src = "/images/aparto-posada/logo-oficial.png";
                }
              }}
            />
          </div>

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

        {/* ── NUEVO COMPONENTE: CARRUSEL DE IMÁGENES ANIMADO (ALTA GAMA) ── */}
        <LuxuryHeroCarousel onOpenImage={onOpenImage} />

        {/* 3 Pilares de Hospitalidad Boutique con Iconos Minimalistas de Trazo Fino */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {APARTO_DIFFERENTIALS.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/70 rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-xl hover:bg-white hover:border-[#00C8D4]/40 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    {/* Icono minimalista de trazo fino */}
                    <div className="w-13 h-13 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-center text-slate-800 group-hover:text-[#00C8D4] group-hover:border-[#00C8D4]/30 transition-all">
                      <IconComp className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <span className="text-xs font-black tracking-widest text-slate-300 font-mono">
                      {item.number}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-serif group-hover:text-[#00C8D4] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed font-['Inter',sans-serif]">
                    {item.description}
                  </p>
                </div>

                <div className="pt-5 mt-6 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                  <span className="font-['Plus_Jakarta_Sans',sans-serif] tracking-wider uppercase text-[10px]">Estándar de Calidad</span>
                  <ArrowUpRight className="w-4 h-4 text-[#00C8D4]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bento Grid Moderno (5 Imágenes) - 100% Nítido, Sin Filtros Oscuros, Animado y Ultra-Premium */}
        <div className="space-y-5">
          {/* Barra Superior de la Galería */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 px-1 border-b border-slate-200/90 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#00C8D4] font-['Plus_Jakarta_Sans',sans-serif]">
                <Camera className="w-3.5 h-3.5 text-[#FF0096]" />
                GALERÍA VISUAL DESTACADA
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif] mt-0.5">
                Instalaciones Reales & Entorno Natural
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-3.5 py-1.5 rounded-full border border-slate-200/90 shadow-sm w-fit">
              <Sparkles className="w-3.5 h-3.5 text-[#00C8D4]" />
              <span>Colores 100% Nítidos y Reales • Toca para Ampliar en HD</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[240px]">
            {/* Tile 1: Piscina Hero (2x2) */}
            <div
              onClick={() => onOpenImage && onOpenImage(APARTO_BENTO_TILES[0].image, APARTO_BENTO_TILES[0].title)}
              className="col-span-1 md:col-span-2 row-span-2 min-h-[360px] md:min-h-[496px] rounded-3xl overflow-hidden relative group cursor-pointer shadow-md hover:shadow-2xl hover:shadow-[#00C8D4]/20 transition-all duration-500 border border-slate-200/90 hover:border-[#00C8D4]/60 bg-slate-100"
            >
              {/* Imagen 100% Nítida y Real (Sin filtros oscuros ni capas negras) */}
              <img
                src={APARTO_BENTO_TILES[0].image}
                alt={APARTO_BENTO_TILES[0].title}
                className="w-full h-full object-cover filter brightness-[1.02] contrast-[1.02] saturate-[1.04] group-hover:scale-108 transition-transform duration-700 ease-out"
              />

              {/* Animación: Destello de luz diagonal (Sheen Sweep) */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full duration-1000 ease-in-out transition-all -skew-x-12" />
              </div>

              {/* Badge Superior Izquierdo con Micro-Pulso */}
              <div className="absolute top-4 left-4 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white bg-[#00C8D4] shadow-md border border-white/30 font-['Plus_Jakarta_Sans',sans-serif]">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {APARTO_BENTO_TILES[0].tag}
                </span>
              </div>

              {/* Botón Flotante Superior Derecho: Ver en HD */}
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-bold shadow-lg border border-white/60 hover:bg-[#00C8D4] hover:text-white transition-colors">
                  <Maximize2 className="w-3.5 h-3.5 text-[#00C8D4] group-hover:text-white" />
                  <span>Ver en HD</span>
                </span>
              </div>

              {/* Tarjeta Flotante Inferior en Glassmorphism (Sin tapar la foto con negro) */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-10">
                <div className="bg-white/92 backdrop-blur-md border border-white/80 rounded-2xl p-4 sm:p-5 shadow-lg group-hover:shadow-2xl group-hover:bg-white/98 group-hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-black text-[#00C8D4] uppercase tracking-wider font-['Plus_Jakarta_Sans',sans-serif]">
                          Instalación Central
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-[11px] font-semibold text-slate-500 font-['Inter',sans-serif]">
                          Agua 100% Cristalina
                        </span>
                      </div>
                      <h4 className="text-xl sm:text-2xl font-black font-['Plus_Jakarta_Sans',sans-serif] tracking-tight text-slate-900 group-hover:text-[#00C8D4] transition-colors">
                        {APARTO_BENTO_TILES[0].title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium font-['Inter',sans-serif] mt-0.5">
                        {APARTO_BENTO_TILES[0].subtitle}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#00C8D4]/10 text-[#00C8D4] flex items-center justify-center shrink-0 group-hover:bg-[#00C8D4] group-hover:text-white transition-all shadow-sm">
                      <Maximize2 className="w-5 h-5 stroke-[2.2]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tile 2: Caney Colonial & Jardines Decorativos (1x1) */}
            <div
              onClick={() => onOpenImage && onOpenImage(APARTO_BENTO_TILES[1].image, APARTO_BENTO_TILES[1].title)}
              className="col-span-1 md:col-span-1 row-span-1 rounded-3xl overflow-hidden relative group cursor-pointer shadow-md hover:shadow-xl hover:shadow-[#FF0096]/20 transition-all duration-500 border border-slate-200/90 hover:border-[#FF0096]/60 bg-slate-100"
            >
              <img
                src={APARTO_BENTO_TILES[1].image}
                alt={APARTO_BENTO_TILES[1].title}
                className="w-full h-full object-cover filter brightness-[1.02] contrast-[1.02] saturate-[1.04] group-hover:scale-108 transition-transform duration-700 ease-out"
              />

              {/* Destello de luz en hover */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full duration-1000 ease-in-out transition-all -skew-x-12" />
              </div>

              {/* Tag Superior Izquierdo */}
              <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-white bg-[#FF0096] shadow-md border border-white/30 font-['Plus_Jakarta_Sans',sans-serif]">
                  <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                  {APARTO_BENTO_TILES[1].tag}
                </span>
              </div>

              {/* Botón lupa flotante */}
              <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
                <span className="w-7 h-7 rounded-full bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center text-slate-700 group-hover:bg-[#FF0096] group-hover:text-white transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Tarjeta Flotante Inferior */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
                <div className="bg-white/92 backdrop-blur-md border border-white/80 rounded-xl px-3 py-2 shadow-md group-hover:shadow-xl group-hover:bg-white group-hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-black font-['Plus_Jakarta_Sans',sans-serif] tracking-tight text-slate-900 truncate group-hover:text-[#FF0096] transition-colors">
                        {APARTO_BENTO_TILES[1].title}
                      </h4>
                      <p className="text-[11px] text-slate-600 font-medium font-['Inter',sans-serif] truncate">
                        {APARTO_BENTO_TILES[1].subtitle}
                      </p>
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 group-hover:bg-[#FF0096] group-hover:text-white transition-all shadow-xs">
                      <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tile 3: Balcones con Vista al Mar (1x1) */}
            <div
              onClick={() => onOpenImage && onOpenImage(APARTO_BENTO_TILES[2].image, APARTO_BENTO_TILES[2].title)}
              className="col-span-1 md:col-span-1 row-span-1 rounded-3xl overflow-hidden relative group cursor-pointer shadow-md hover:shadow-xl hover:shadow-[#9B00CC]/20 transition-all duration-500 border border-slate-200/90 hover:border-[#9B00CC]/60 bg-slate-100"
            >
              <img
                src={APARTO_BENTO_TILES[2].image}
                alt={APARTO_BENTO_TILES[2].title}
                className="w-full h-full object-cover filter brightness-[1.02] contrast-[1.02] saturate-[1.04] group-hover:scale-108 transition-transform duration-700 ease-out"
              />

              {/* Destello de luz en hover */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full duration-1000 ease-in-out transition-all -skew-x-12" />
              </div>

              {/* Tag Superior Izquierdo */}
              <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-white bg-[#9B00CC] shadow-md border border-white/30 font-['Plus_Jakarta_Sans',sans-serif]">
                  <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                  {APARTO_BENTO_TILES[2].tag}
                </span>
              </div>

              {/* Botón lupa flotante */}
              <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
                <span className="w-7 h-7 rounded-full bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center text-slate-700 group-hover:bg-[#9B00CC] group-hover:text-white transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Tarjeta Flotante Inferior */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
                <div className="bg-white/92 backdrop-blur-md border border-white/80 rounded-xl px-3 py-2 shadow-md group-hover:shadow-xl group-hover:bg-white group-hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-black font-['Plus_Jakarta_Sans',sans-serif] tracking-tight text-slate-900 truncate group-hover:text-[#9B00CC] transition-colors">
                        {APARTO_BENTO_TILES[2].title}
                      </h4>
                      <p className="text-[11px] text-slate-600 font-medium font-['Inter',sans-serif] truncate">
                        {APARTO_BENTO_TILES[2].subtitle}
                      </p>
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 group-hover:bg-[#9B00CC] group-hover:text-white transition-all shadow-xs">
                      <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tile 4: Gastronomía Marina & Empanadas (1x1) */}
            <div
              onClick={() => onOpenImage && onOpenImage(APARTO_BENTO_TILES[3].image, APARTO_BENTO_TILES[3].title)}
              className="col-span-1 md:col-span-1 row-span-1 rounded-3xl overflow-hidden relative group cursor-pointer shadow-md hover:shadow-xl hover:shadow-[#00C8D4]/20 transition-all duration-500 border border-slate-200/90 hover:border-[#00C8D4]/60 bg-slate-100"
            >
              <img
                src={APARTO_BENTO_TILES[3].image}
                alt={APARTO_BENTO_TILES[3].title}
                className="w-full h-full object-cover filter brightness-[1.02] contrast-[1.02] saturate-[1.04] group-hover:scale-108 transition-transform duration-700 ease-out"
              />

              {/* Destello de luz en hover */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full duration-1000 ease-in-out transition-all -skew-x-12" />
              </div>

              {/* Tag Superior Izquierdo */}
              <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-white bg-[#00C8D4] shadow-md border border-white/30 font-['Plus_Jakarta_Sans',sans-serif]">
                  <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                  {APARTO_BENTO_TILES[3].tag}
                </span>
              </div>

              {/* Botón lupa flotante */}
              <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
                <span className="w-7 h-7 rounded-full bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center text-slate-700 group-hover:bg-[#00C8D4] group-hover:text-white transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Tarjeta Flotante Inferior */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
                <div className="bg-white/92 backdrop-blur-md border border-white/80 rounded-xl px-3 py-2 shadow-md group-hover:shadow-xl group-hover:bg-white group-hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-black font-['Plus_Jakarta_Sans',sans-serif] tracking-tight text-slate-900 truncate group-hover:text-[#00C8D4] transition-colors">
                        {APARTO_BENTO_TILES[3].title}
                      </h4>
                      <p className="text-[11px] text-slate-600 font-medium font-['Inter',sans-serif] truncate">
                        {APARTO_BENTO_TILES[3].subtitle}
                      </p>
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 group-hover:bg-[#00C8D4] group-hover:text-white transition-all shadow-xs">
                      <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tile 5: Piscina Nocturna Iluminada (1x1) */}
            <div
              onClick={() => onOpenImage && onOpenImage(APARTO_BENTO_TILES[4].image, APARTO_BENTO_TILES[4].title)}
              className="col-span-1 md:col-span-1 row-span-1 rounded-3xl overflow-hidden relative group cursor-pointer shadow-md hover:shadow-xl hover:shadow-[#FF0096]/20 transition-all duration-500 border border-slate-200/90 hover:border-[#FF0096]/60 bg-slate-100"
            >
              <img
                src={APARTO_BENTO_TILES[4].image}
                alt={APARTO_BENTO_TILES[4].title}
                className="w-full h-full object-cover filter brightness-[1.02] contrast-[1.02] saturate-[1.04] group-hover:scale-108 transition-transform duration-700 ease-out"
              />

              {/* Destello de luz en hover */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full duration-1000 ease-in-out transition-all -skew-x-12" />
              </div>

              {/* Tag Superior Izquierdo */}
              <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-white bg-[#FF0096] shadow-md border border-white/30 font-['Plus_Jakarta_Sans',sans-serif]">
                  <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                  {APARTO_BENTO_TILES[4].tag}
                </span>
              </div>

              {/* Botón lupa flotante */}
              <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
                <span className="w-7 h-7 rounded-full bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center text-slate-700 group-hover:bg-[#FF0096] group-hover:text-white transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Tarjeta Flotante Inferior */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
                <div className="bg-white/92 backdrop-blur-md border border-white/80 rounded-xl px-3 py-2 shadow-md group-hover:shadow-xl group-hover:bg-white group-hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-black font-['Plus_Jakarta_Sans',sans-serif] tracking-tight text-slate-900 truncate group-hover:text-[#FF0096] transition-colors">
                        {APARTO_BENTO_TILES[4].title}
                      </h4>
                      <p className="text-[11px] text-slate-600 font-medium font-['Inter',sans-serif] truncate">
                        {APARTO_BENTO_TILES[4].subtitle}
                      </p>
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 group-hover:bg-[#FF0096] group-hover:text-white transition-all shadow-xs">
                      <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
