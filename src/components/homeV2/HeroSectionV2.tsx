import React, { useState } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, Compass, ShieldCheck, Zap, Wifi, Dog, Sparkles } from "lucide-react";

interface HeroSectionV2Props {
  onSearch?: (destination: string, experience: string) => void;
}

export function HeroSectionV2({ onSearch }: HeroSectionV2Props) {
  const [, setLocation] = useLocation();
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(selectedDestination, selectedExperience);
    } else {
      const params = new URLSearchParams();
      if (selectedDestination) params.set("destination", selectedDestination);
      if (selectedExperience) params.set("experience", selectedExperience);
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
    <section className="relative w-full overflow-hidden bg-slate-950 text-white min-h-[620px] lg:min-h-[700px] flex items-center justify-center pt-24 pb-16">
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
        
        {/* Pre-header badge & Title */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#00C8D4] text-xs font-black tracking-widest uppercase shadow-lg animate-pulse">
            <div className="w-5 h-5 rounded-md bg-[#00C8D4] flex items-center justify-center text-slate-950 shrink-0">
              <Compass className="w-3 h-3 text-slate-950 stroke-[2.5]" />
            </div>
            <span>EL PARAÍSO VENEZOLANO A UN CLIC</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-white leading-tight drop-shadow-md">
            Descubre Hospedajes de Selección <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-[#00C8D4] via-[#FF0096] to-amber-300 bg-clip-text text-transparent">
              Directo con sus Anfitriones
            </span>
          </h1>

          <p className="text-slate-200 text-xs sm:text-base font-sans font-medium max-w-2xl mx-auto leading-relaxed opacity-95">
            Posadas boutique, resorts y hoteles en Los Roques, Canaima, Morrocoy y Mérida. Contacto directo por WhatsApp sin comisiones ni intermediarios.
          </p>
        </div>

        {/* Buscador Modular Segmentado Luxe Style */}
        <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-3xl sm:rounded-full border border-white/40 shadow-2xl shadow-cyan-950/40 text-slate-800">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-2 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            
            {/* Segmento 1: Destino */}
            <div className="w-full md:w-1/2 px-4 py-2.5 text-left flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-2xl bg-[#00C8D4]/15 border border-[#00C8D4]/30 flex items-center justify-center text-[#00C8D4] shrink-0 group-hover:scale-105 transition-transform">
                <MapPin className="w-4 h-4 text-[#00C8D4] stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">
                  ¿A dónde quieres ir?
                </label>
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer truncate"
                >
                  <option value="">Todos los Destinos en Venezuela</option>
                  <option value="los-roques">Los Roques (Dependencias Federales)</option>
                  <option value="canaima">Canaima / Salto Ángel (Bolívar)</option>
                  <option value="morrocoy">Morrocoy / Tucacas (Falcón)</option>
                  <option value="merida">Mérida & Andes (Mérida)</option>
                  <option value="caracas">Caracas & Capital (Distrito Capital)</option>
                  <option value="margarita">Isla de Margarita (Nueva Esparta)</option>
                  <option value="colonia-tovar">Colonia Tovar (Aragua)</option>
                  <option value="mochima">Mochima (Anzoátegui / Sucre)</option>
                </select>
              </div>
            </div>

            {/* Segmento 2: Tipo de Experiencia */}
            <div className="w-full md:w-5/12 px-4 py-2.5 text-left flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-2xl bg-[#FF0096]/15 border border-[#FF0096]/30 flex items-center justify-center text-[#FF0096] shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-[#FF0096] stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400">
                  Experiencia o Tipo
                </label>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer truncate"
                >
                  <option value="">Cualquier ambiente</option>
                  <option value="playa">🏝️ Playa & Archipiélagos</option>
                  <option value="montana">⛰️ Montaña & Frío</option>
                  <option value="selva">🌿 Selva & Tepuyes</option>
                  <option value="ciudad">🌆 Ciudad & Negocios</option>
                  <option value="posada">🏡 Posada Boutique</option>
                </select>
              </div>
            </div>

            {/* Segmento 3: Botón de Búsqueda */}
            <div className="w-full md:w-auto p-1 text-right">
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3.5 rounded-2xl sm:rounded-full bg-gradient-to-r from-[#00C8D4] to-[#00b2be] hover:from-[#00b2be] hover:to-[#00C8D4] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00C8D4]/30 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <Search className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>Buscar Alojamientos</span>
              </button>
            </div>
          </form>
        </div>

        {/* Fila Inferior: Pills / Filtros Rápidos de Tendencia */}
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
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md transition-all hover:scale-105 cursor-pointer shadow-xs"
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

        {/* Micro-copy de Confianza Operativa */}
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
