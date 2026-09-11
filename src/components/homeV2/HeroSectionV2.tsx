import React, { useState } from "react";
import { useLocation } from "wouter";
import { 
  Search, MapPin, Building2, Compass, ShieldCheck, Zap, Wifi, Dog, Sparkles, Layers 
} from "lucide-react";

interface HeroSectionV2Props {
  onSearch?: (destination: string, category: string, experience: string) => void;
}

export function HeroSectionV2({ onSearch }: HeroSectionV2Props) {
  const [, setLocation] = useLocation();
  const [destination, setDestination] = useState("");
  const [category, setCategory] = useState("");
  const [experience, setExperience] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(destination, category, experience);
    } else {
      const params = new URLSearchParams();
      if (destination) params.set("destination", destination);
      if (category) params.set("category", category);
      if (experience) params.set("experience", experience);
      setLocation(`/establecimientos?${params.toString()}`);
    }
  };

  const handleQuickFilter = (type: "dest" | "filter", val: string) => {
    if (type === "dest") {
      setLocation(`/establecimientos?destination=${val}`);
    } else {
      setLocation(`/establecimientos?q=${val}`);
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-slate-950 text-white min-h-[640px] lg:min-h-[720px] flex items-center justify-center pt-24 pb-16">
      
      {/* Background Image full-bleed con lazy loading y scale */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85"
          alt="Playas y Posadas de Venezuela"
          loading="lazy"
          className="w-full h-full object-cover scale-[1.08] filter brightness-90 transition-transform duration-1000"
        />
        {/* Capa de degradado con tonos morados de marca y fundido suave */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e011f]/90 via-[#1a0533]/75 to-slate-950 z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-15" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-20 w-full text-center space-y-8">
        
        {/* Pre-header badge & Titular con Alto Impacto */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#00C8D4] text-xs font-black tracking-widest uppercase shadow-lg animate-pulse">
            <div className="w-5 h-5 rounded-md bg-[#00C8D4] flex items-center justify-center text-slate-950 shrink-0">
              <Compass className="w-3 h-3 text-slate-950 stroke-[2.5]" />
            </div>
            <span>EL PARAÍSO VENEZOLANO A UN CLIC</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-white leading-tight drop-shadow-md">
            Descubre Hospedajes de Selección <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-[#00C8D4] via-[#FF0096] to-amber-300 bg-clip-text text-transparent uppercase">
              DIRECTO CON SUS ANFITRIONES
            </span>
          </h1>

          <p className="text-slate-200 text-xs sm:text-base font-sans font-medium max-w-2xl mx-auto leading-relaxed opacity-95">
            Posadas boutique, resorts y hoteles en Los Roques, Canaima, Morrocoy y Mérida. Contacto directo por WhatsApp sin comisiones ni intermediarios.
          </p>
        </div>

        {/* BARRA DE BÚSQUEDA FLOTANTE UNIFICADA (3 SEGMENTOS INTEGRADOS) */}
        <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-xl p-2.5 sm:p-3.5 rounded-2xl md:rounded-full border border-white/50 shadow-2xl shadow-cyan-950/30 text-slate-800">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-2 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            
            {/* SEGMENTO 1: ¿A DÓNDE QUIERES IR? (Ubicación) */}
            <div className="w-full md:w-[38%] px-3.5 py-2 text-left flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-2xl bg-[#00C8D4]/15 border border-[#00C8D4]/30 flex items-center justify-center text-[#00C8D4] shrink-0 group-hover:scale-105 transition-transform">
                <MapPin className="w-4.5 h-4.5 text-[#00C8D4] stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">
                  ¿A DÓNDE?
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-transparent text-xs font-extrabold text-slate-900 outline-none cursor-pointer truncate"
                >
                  <option value="">Todos los Destinos en Venezuela</option>
                  <option value="los-roques">Los Roques (Dependencias Federales)</option>
                  <option value="morrocoy">Morrocoy & Tucacas (Falcón)</option>
                  <option value="merida">Mérida & Cordillera Andina</option>
                  <option value="canaima">Canaima / Salto Ángel (Bolívar)</option>
                  <option value="margarita">Isla de Margarita (Nueva Esparta)</option>
                  <option value="colonia-tovar">La Colonia Tovar (Aragua)</option>
                  <option value="caracas">Caracas & Distrito Capital</option>
                  <option value="mochima">Mochima (Anzoátegui / Sucre)</option>
                  <option value="barinas">Gran Sabana & Llanos</option>
                </select>
              </div>
            </div>

            {/* SEGMENTO 2: ¿QUÉ BUSCAS? (Categoría / Tipo de Alojamiento) */}
            <div className="w-full md:w-[32%] px-3.5 py-2 text-left flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-2xl bg-[#FF0096]/15 border border-[#FF0096]/30 flex items-center justify-center text-[#FF0096] shrink-0 group-hover:scale-105 transition-transform">
                <Building2 className="w-4.5 h-4.5 text-[#FF0096] stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">
                  TIPO DE ALOJAMIENTO
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-transparent text-xs font-extrabold text-slate-900 outline-none cursor-pointer truncate"
                >
                  <option value="">Cualquier categoría</option>
                  <option value="posadas">Posadas Boutique</option>
                  <option value="hoteles">Hoteles & Resorts</option>
                  <option value="campamentos">Campamentos & Lodges</option>
                  <option value="glamping">Glamping & Domos</option>
                  <option value="casas">Casas & Aptos Vacacionales</option>
                </select>
              </div>
            </div>

            {/* SEGMENTO 3: EXPERIENCIA / AMBIENTE */}
            <div className="w-full md:w-[30%] px-3.5 py-2 text-left flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-2xl bg-[#9B00CC]/15 border border-[#9B00CC]/30 flex items-center justify-center text-[#9B00CC] shrink-0 group-hover:scale-105 transition-transform">
                <Compass className="w-4.5 h-4.5 text-[#9B00CC] stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">
                  EXPERIENCIA
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-transparent text-xs font-extrabold text-slate-900 outline-none cursor-pointer truncate"
                >
                  <option value="">Cualquier experiencia</option>
                  <option value="playa">🏝️ Playa & Cayos</option>
                  <option value="montana">⛰️ Montaña & Frío</option>
                  <option value="selva">🌿 Selva & Aventura</option>
                  <option value="ciudad">🌆 Ciudad & Negocios</option>
                  <option value="wellness">🧘 Relax & Wellness</option>
                </select>
              </div>
            </div>

            {/* BOTÓN DE ACCIÓN CTA DESTACADO */}
            <div className="w-full md:w-auto p-1 text-right shrink-0">
              <button
                type="submit"
                className="w-full md:w-auto px-7 py-3.5 rounded-xl md:rounded-full bg-gradient-to-r from-[#00C8D4] to-[#00b2be] hover:from-[#00b2be] hover:to-[#00C8D4] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00C8D4]/30 hover:scale-[1.03] transition-all cursor-pointer"
              >
                <Search className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>Buscar</span>
              </button>
            </div>

          </form>
        </div>

        {/* FILA INFERIOR: PILLS / FILTROS RÁPIDOS DE TENDENCIA */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 mr-1 hidden sm:inline">
            Filtros Populares:
          </span>

          {[
            { label: "Los Roques", type: "dest", val: "los-roques", solidBg: "#00C8D4" },
            { label: "Morrocoy", type: "dest", val: "morrocoy", solidBg: "#00C8D4" },
            { label: "Colonia Tovar", type: "dest", val: "colonia-tovar", solidBg: "#10b981" },
            { label: "Planta Eléctrica", type: "filter", val: "planta", icon: Zap, solidBg: "#f59e0b" },
            { label: "WiFi Starlink", type: "filter", val: "wifi", icon: Wifi, solidBg: "#9B00CC" },
            { label: "Pet Friendly", type: "filter", val: "pet", icon: Dog, solidBg: "#FF0096" }
          ].map((pill, idx) => {
            const IconComp = pill.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickFilter(pill.type as any, pill.val)}
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md transition-all hover:scale-105 cursor-pointer shadow-xs"
              >
                {IconComp && (
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: pill.solidBg }}
                  >
                    <IconComp className="w-2.5 h-2.5 text-white stroke-[2.5]" />
                  </div>
                )}
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>

        {/* MICRO-COPY DE CONFIANZA OPERATIVA */}
        <div className="pt-2 flex items-center justify-center gap-2 text-xs font-semibold text-slate-300">
          <div className="w-6 h-6 rounded-lg bg-[#00C8D4] flex items-center justify-center text-white shrink-0 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-white stroke-[2.2]" />
          </div>
          <span>
            +500 posadas y hoteles verificados con <strong className="text-white">contacto directo y 0% comisiones</strong>
          </span>
        </div>

      </div>
    </section>
  );
}
