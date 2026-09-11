import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { 
  Search, MapPin, Building2, Compass, ShieldCheck, Zap, Wifi, Dog, Sparkles, Layers,
  Palmtree, Waves, Mountain, Trees, ChevronDown, Check, Home, Tent
} from "lucide-react";
import { supabase } from "../../lib/supabase";

interface HeroSectionV2Props {
  onSearch?: (destination: string, category: string, experience: string) => void;
}

const DESTINATIONS_LIST = [
  { val: "", label: "Todos los Destinos en Venezuela", icon: MapPin, solidBg: "#00C8D4" },
  { val: "bahia-de-cata", label: "Bahía de Cata (Aragua)", icon: Waves, solidBg: "#00C8D4" },
  { val: "los-roques", label: "Los Roques (Dependencias Federales)", icon: Palmtree, solidBg: "#00C8D4" },
  { val: "morrocoy", label: "Morrocoy & Tucacas (Falcón)", icon: Waves, solidBg: "#00C8D4" },
  { val: "merida", label: "Mérida & Cordillera Andina", icon: Mountain, solidBg: "#10b981" },
  { val: "canaima", label: "Canaima / Salto Ángel (Bolívar)", icon: Trees, solidBg: "#f59e0b" },
  { val: "margarita", label: "Isla de Margarita (Nueva Esparta)", icon: Palmtree, solidBg: "#00C8D4" },
  { val: "colonia-tovar", label: "La Colonia Tovar (Aragua)", icon: Mountain, solidBg: "#10b981" },
  { val: "caracas", label: "Caracas & Distrito Capital", icon: Building2, solidBg: "#9B00CC" },
  { val: "mochima", label: "Mochima (Anzoátegui / Sucre)", icon: Waves, solidBg: "#00C8D4" }
];

const CATEGORIES_LIST = [
  { val: "", label: "Cualquier categoría", icon: Building2, solidBg: "#FF0096" },
  { val: "posadas", label: "Posadas Boutique", icon: Home, solidBg: "#FF0096" },
  { val: "hoteles", label: "Hoteles & Resorts", icon: Building2, solidBg: "#9B00CC" },
  { val: "campamentos", label: "Campamentos & Lodges", icon: Tent, solidBg: "#f59e0b" },
  { val: "glamping", label: "Glamping & Domos", icon: Sparkles, solidBg: "#00C8D4" },
  { val: "casas", label: "Casas & Aptos Vacacionales", icon: Home, solidBg: "#10b981" }
];

const EXPERIENCES_LIST = [
  { val: "", label: "Cualquier experiencia", icon: Compass, solidBg: "#9B00CC" },
  { val: "playa", label: "Playa & Cayos", icon: Palmtree, solidBg: "#00C8D4" },
  { val: "montana", label: "Montaña & Frío", icon: Mountain, solidBg: "#10b981" },
  { val: "selva", label: "Selva & Aventura", icon: Trees, solidBg: "#f59e0b" },
  { val: "ciudad", label: "Ciudad & Negocios", icon: Building2, solidBg: "#9B00CC" },
  { val: "wellness", label: "Relax & Wellness", icon: Sparkles, solidBg: "#FF0096" }
];

export function HeroSectionV2({ onSearch }: HeroSectionV2Props) {
  const [, setLocation] = useLocation();
  const [destination, setDestination] = useState("");
  const [category, setCategory] = useState("");
  const [experience, setExperience] = useState("");

  const [destOpen, setDestOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [expOpen, setExpOpen] = useState(false);

  const destRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const expRef = useRef<HTMLDivElement>(null);

  const [heroConfig, setHeroConfig] = useState({
    badge: "EL PARAÍSO VENEZOLANO A UN CLIC",
    titleLine1: "Descubre Hospedajes de Selección",
    titleLine2: "Directo con sus Anfitriones",
    subtitle: "Posadas boutique, resorts y hoteles en Los Roques, Canaima, Morrocoy y Mérida. Contacto directo por WhatsApp sin comisiones ni intermediarios.",
    bgImage: "https://ghgetcznlrilgocwigmj.supabase.co/storage/v1/object/public/establecimientos/destinos/salto-angel-hero-v2.jpg"
  });

  useEffect(() => {
    async function loadHeroConfig() {
      try {
        const { data, error } = await supabase
          .from("site_sections")
          .select("*")
          .eq("section_key", "hero_v2")
          .single();

        if (!error && data) {
          setHeroConfig(prev => ({
            badge: data.button_text || prev.badge,
            titleLine1: data.title || prev.titleLine1,
            titleLine2: data.subtitle || prev.titleLine2,
            subtitle: data.description || prev.subtitle,
            bgImage: data.image_url || prev.bgImage
          }));
        }
      } catch (err) {
        console.warn("HeroSectionV2: Usando configuración Hero por defecto:", err);
      }
    }
    loadHeroConfig();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (destRef.current && !destRef.current.contains(e.target as Node)) setDestOpen(false);
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
      if (expRef.current && !expRef.current.contains(e.target as Node)) setExpOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const selectedDestObj = DESTINATIONS_LIST.find(d => d.val === destination) || DESTINATIONS_LIST[0];
  const selectedCatObj = CATEGORIES_LIST.find(c => c.val === category) || CATEGORIES_LIST[0];
  const selectedExpObj = EXPERIENCES_LIST.find(e => e.val === experience) || EXPERIENCES_LIST[0];

  const SelectedDestIcon = selectedDestObj.icon;
  const SelectedCatIcon = selectedCatObj.icon;
  const SelectedExpIcon = selectedExpObj.icon;

  return (
    <section className="relative w-full bg-slate-950 text-white min-h-[560px] lg:min-h-[620px] flex items-center justify-center pt-20 pb-12">
      
      {/* Background Image full-bleed con lazy loading y scale */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={heroConfig.bgImage}
          alt="Salto Ángel - Parque Nacional Canaima"
          loading="lazy"
          className="w-full h-full object-cover scale-[1.08] filter brightness-105 transition-transform duration-1000"
        />
        {/* Capa de degradado ligera y cristalina para máxima visibilidad de la imagen del Salto Ángel */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/20 to-slate-950/80 z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-15" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-20 w-full text-center space-y-4 sm:space-y-6">
        
        {/* Pre-header badge & Titular Optimizado (Máximo 2 líneas, sin saturación) */}
        <div className="max-w-3xl mx-auto space-y-2.5 mb-2 sm:mb-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-950/50 backdrop-blur-md border border-white/25 text-[#00C8D4] text-[11px] font-black tracking-widest uppercase shadow-lg">
            <div className="w-4 h-4 rounded-md bg-[#00C8D4] flex items-center justify-center text-slate-950 shrink-0">
              <Compass className="w-2.5 h-2.5 text-slate-950 stroke-[2.5]" />
            </div>
            <span>{heroConfig.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-display font-extrabold tracking-tight leading-tight md:leading-[1.15] drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            <span className="text-white block">{heroConfig.titleLine1}</span>
            <span className="bg-gradient-to-r from-[#00C8D4] via-cyan-300 to-[#FF0096] bg-clip-text text-transparent block mt-1 drop-shadow-lg">
              {heroConfig.titleLine2}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-100 font-sans font-semibold max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] pt-0.5">
            {heroConfig.subtitle}
          </p>
        </div>

        {/* BARRA DE BÚSQUEDA FLOTANTE UNIFICADA CON DESPLEGABLES INTERACTIVOS DE ICONOS UNICOLOR */}
        <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-xl p-2.5 sm:p-3.5 rounded-2xl md:rounded-full border border-white/50 shadow-2xl shadow-cyan-950/30 text-slate-800 relative z-40">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-2 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            
            {/* SEGMENTO 1: ¿A DÓNDE QUIERES IR? (Ubicación) */}
            <div ref={destRef} className="w-full md:w-[38%] px-3.5 py-2 text-left relative">
              <button
                type="button"
                onClick={() => { setDestOpen(!destOpen); setCatOpen(false); setExpOpen(false); }}
                className="w-full flex items-center gap-3 group text-left cursor-pointer"
              >
                <div className="w-9 h-9 rounded-2xl bg-[#00C8D4]/15 border border-[#00C8D4]/30 flex items-center justify-center text-[#00C8D4] shrink-0 group-hover:scale-105 transition-transform">
                  <SelectedDestIcon className="w-4.5 h-4.5 text-[#00C8D4] stroke-[2.2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400 cursor-pointer">
                    ¿A DÓNDE?
                  </label>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-extrabold text-slate-900 truncate">
                      {selectedDestObj.label}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${destOpen ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </button>

              {/* Menu Desplegable Segmento 1 */}
              {destOpen && (
                <div className="absolute top-full left-0 mt-2.5 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl shadow-slate-950/40 border border-slate-200/90 py-2 z-[100] max-h-96 overflow-y-auto">
                  {DESTINATIONS_LIST.map((item) => {
                    const IconC = item.icon;
                    const isSelected = destination === item.val;
                    return (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => { setDestination(item.val); setDestOpen(false); }}
                        className={`w-full px-4 py-3 flex items-center justify-between text-xs font-bold transition-all text-left ${
                          isSelected ? "bg-[#00C8D4]/10 text-[#00C8D4] font-extrabold" : "text-slate-900 hover:bg-slate-100/80"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs" style={{ backgroundColor: item.solidBg }}>
                            <IconC className="w-4 h-4 text-white stroke-[2.5]" />
                          </div>
                          <span className="truncate">{item.label}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#00C8D4] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SEGMENTO 2: ¿QUÉ BUSCAS? (Categoría / Tipo de Alojamiento) */}
            <div ref={catRef} className="w-full md:w-[32%] px-3.5 py-2 text-left relative">
              <button
                type="button"
                onClick={() => { setCatOpen(!catOpen); setDestOpen(false); setExpOpen(false); }}
                className="w-full flex items-center gap-3 group text-left cursor-pointer"
              >
                <div className="w-9 h-9 rounded-2xl bg-[#FF0096]/15 border border-[#FF0096]/30 flex items-center justify-center text-[#FF0096] shrink-0 group-hover:scale-105 transition-transform">
                  <SelectedCatIcon className="w-4.5 h-4.5 text-[#FF0096] stroke-[2.2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400 cursor-pointer">
                    TIPO DE ALOJAMIENTO
                  </label>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-extrabold text-slate-900 truncate">
                      {selectedCatObj.label}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${catOpen ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </button>

              {/* Menu Desplegable Segmento 2 */}
              {catOpen && (
                <div className="absolute top-full left-0 md:left-1/2 md:-translate-x-1/2 mt-2.5 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl shadow-slate-950/40 border border-slate-200/90 py-2 z-[100] overflow-hidden">
                  {CATEGORIES_LIST.map((item) => {
                    const IconC = item.icon;
                    const isSelected = category === item.val;
                    return (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => { setCategory(item.val); setCatOpen(false); }}
                        className={`w-full px-4 py-3 flex items-center justify-between text-xs font-bold transition-all text-left ${
                          isSelected ? "bg-[#FF0096]/10 text-[#FF0096] font-extrabold" : "text-slate-900 hover:bg-slate-100/80"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs" style={{ backgroundColor: item.solidBg }}>
                            <IconC className="w-4 h-4 text-white stroke-[2.5]" />
                          </div>
                          <span className="truncate">{item.label}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#FF0096] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SEGMENTO 3: EXPERIENCIA / AMBIENTE (CON ICONOS UNICOLOR DESPLEGABLES) */}
            <div ref={expRef} className="w-full md:w-[30%] px-3.5 py-2 text-left relative">
              <button
                type="button"
                onClick={() => { setExpOpen(!expOpen); setDestOpen(false); setCatOpen(false); }}
                className="w-full flex items-center gap-3 group text-left cursor-pointer"
              >
                <div className="w-9 h-9 rounded-2xl bg-[#9B00CC]/15 border border-[#9B00CC]/30 flex items-center justify-center text-[#9B00CC] shrink-0 group-hover:scale-105 transition-transform">
                  <SelectedExpIcon className="w-4.5 h-4.5 text-[#9B00CC] stroke-[2.2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400 cursor-pointer">
                    EXPERIENCIA
                  </label>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-extrabold text-slate-900 truncate">
                      {selectedExpObj.label}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${expOpen ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </button>

              {/* Menu Desplegable Segmento 3 con Iconos Unicolor */}
              {expOpen && (
                <div className="absolute top-full left-0 md:left-auto md:right-0 mt-2.5 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl shadow-slate-950/40 border border-slate-200/90 py-2 z-[100] overflow-hidden">
                  {EXPERIENCES_LIST.map((item) => {
                    const IconC = item.icon;
                    const isSelected = experience === item.val;
                    return (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => { setExperience(item.val); setExpOpen(false); }}
                        className={`w-full px-4 py-3 flex items-center justify-between text-xs font-bold transition-all text-left ${
                          isSelected ? "bg-[#9B00CC]/10 text-[#9B00CC] font-extrabold" : "text-slate-900 hover:bg-slate-100/80"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs" style={{ backgroundColor: item.solidBg }}>
                            <IconC className="w-4 h-4 text-white stroke-[2.5]" />
                          </div>
                          <span className="truncate">{item.label}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#9B00CC] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
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
