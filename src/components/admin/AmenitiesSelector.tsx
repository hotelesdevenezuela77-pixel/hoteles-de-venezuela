import { useState, useMemo } from "react";
import {
  MASTER_AMENITIES,
  PILLARS_DOCUMENT77,
  AMENITY_SCOPES,
  parseServicesList,
  getAmenityLabel,
  type AmenityItem,
  type AmenityPillar,
  type AmenityScope
} from "@/lib/amenitiesList";
import {
  Sparkles, Search, Check, Plus, Trash2, Zap, Droplets, Wifi, Wind, Car,
  ShieldCheck, Clock, Dog, Accessibility, ArrowUpSquare, Waves, Bath, Palmtree,
  Dumbbell, Flame, TreePine, Smile, Trophy, Utensils, Coffee, Wine,
  ConciergeBell, Plane, Compass, Sun, Briefcase, Shirt, Eye, Tv, ChefHat,
  Lock, AlertTriangle, Building, Home, Bed, UserCheck, GraduationCap, Box, Tent, Ship, Heart, Mountain, FileText, Globe,
  VolumeX, EyeOff, Footprints, IceCream, Ban, Building2, Users
} from "lucide-react";

interface AmenitiesSelectorProps {
  selectedServices: string[];
  onChange: (services: string[]) => void;
  selectedCategory?: string;
}

const getCategoryModule = (categoryStr: string | undefined): {
  type: "barco" | "camping" | "love_hotel" | "montana" | "restaurante" | "general";
  label: string;
  subCategoryFilter: string | null;
} => {
  if (!categoryStr) return { type: "general", label: "Hospedaje General", subCategoryFilter: null };
  const lower = categoryStr.toLowerCase();

  if (lower.includes("barco") || lower.includes("yate") || lower.includes("marina") || lower.includes("catamaran") || lower.includes("houseboat") || lower.includes("velero")) {
    return { type: "barco", label: "⛵ Barcos, Veleros, Yates & Marinas", subCategoryFilter: "Barcos" };
  }
  if (lower.includes("camping") || lower.includes("glamping") || lower.includes("eco-lodge")) {
    return { type: "camping", label: "🏕️ Campings, Glamping & Eco-Lodges", subCategoryFilter: "Campings" };
  }
  if (lower.includes("love") || lower.includes("motel")) {
    return { type: "love_hotel", label: "💖 Love Hotels & Moteles", subCategoryFilter: "Love Hotels" };
  }
  if (lower.includes("chalet") || lower.includes("esqui") || lower.includes("esquí") || lower.includes("nieve") || lower.includes("montaña") || lower.includes("montana")) {
    return { type: "montana", label: "🏔️ Chalets de Montaña & Esquí", subCategoryFilter: "Chalets de Montaña" };
  }
  if (lower.includes("restaurante") || lower.includes("gastronomia") || lower.includes("gastronomía") || lower.includes("bar") || lower.includes("cafeteria") || lower.includes("comida")) {
    return { type: "restaurante", label: "🍽️ Restaurantes & Gastronomía", subCategoryFilter: "Restaurantes" };
  }

  return { type: "general", label: "🏨 Hospedaje General", subCategoryFilter: null };
};

const ICON_MAP: Record<string, any> = {
  Wifi, Wind, Car, Zap, Droplets, ShieldCheck, Clock, Dog, Accessibility, ArrowUpSquare,
  Waves, Bath, Palmtree, Sparkles, Dumbbell, Flame, TreePine, Smile, Trophy, Utensils,
  Coffee, Wine, ConciergeBell, Plane, Compass, Sun, Briefcase, Shirt,
  Eye, Tv, ChefHat, Lock, AlertTriangle, Building, Home, Bed, UserCheck, GraduationCap,
  Box, Tent, Ship, Heart, Mountain, FileText, Globe, VolumeX, EyeOff, Footprints, IceCream, Ban, Building2, Users
};

export function AmenitiesSelector({ selectedServices, onChange, selectedCategory }: AmenitiesSelectorProps) {
  const [activePillar, setActivePillar] = useState<string>("all");
  const [activeScope, setActiveScope] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [customInput, setCustomInput] = useState<string>("");

  const activeModule = useMemo(() => getCategoryModule(selectedCategory), [selectedCategory]);

  const currentList = useMemo(() => parseServicesList(selectedServices), [selectedServices]);

  // Separate standard key selections from custom text selections
  const standardKeysSet = useMemo(() => {
    const set = new Set<string>();
    const masterKeys = new Set(MASTER_AMENITIES.map(a => a.key.toLowerCase()));
    currentList.forEach(item => {
      const lower = item.toLowerCase();
      if (masterKeys.has(lower)) {
        set.add(lower);
      }
    });
    return set;
  }, [currentList]);

  const customServices = useMemo(() => {
    const masterKeys = new Set(MASTER_AMENITIES.map(a => a.key.toLowerCase()));
    const masterLabels = new Set(MASTER_AMENITIES.map(a => a.label.toLowerCase()));
    return currentList.filter(item => {
      const lower = item.toLowerCase();
      return !masterKeys.has(lower) && !masterLabels.has(lower);
    });
  }, [currentList]);

  const toggleAmenity = (key: string) => {
    const lowerKey = key.toLowerCase();
    let updated: string[];
    if (standardKeysSet.has(lowerKey)) {
      updated = currentList.filter(s => s.toLowerCase() !== lowerKey);
    } else {
      updated = [...currentList, lowerKey];
    }
    onChange(updated);
  };

  const addCustomService = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    const exists = currentList.some(s => s.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      onChange([...currentList, trimmed]);
    }
    setCustomInput("");
  };

  const removeCustomService = (serviceToRemove: string) => {
    const updated = currentList.filter(s => s.toLowerCase() !== serviceToRemove.toLowerCase());
    onChange(updated);
  };

  const selectBasicEssentials = () => {
    const basics = ["wifi", "aire_acondicionado", "aparcamiento", "recepcion_24h", "ropa_cama", "papel_higienico", "toallas"];
    const merged = Array.from(new Set([...currentList, ...basics]));
    onChange(merged);
  };

  const clearAll = () => {
    onChange([]);
  };

  // Filter master amenities by pillar, scope, search term, and smart category module (C04)
  const filteredAmenities = useMemo(() => {
    return MASTER_AMENITIES.filter(item => {
      const matchesPillar = activePillar === "all" || item.pillar === activePillar;
      const matchesScope = activeScope === "all" || item.scope === activeScope;
      const searchLower = search.trim().toLowerCase();
      const matchesSearch = !searchLower ||
        item.label.toLowerCase().includes(searchLower) ||
        item.key.toLowerCase().includes(searchLower) ||
        item.code.toLowerCase().includes(searchLower) ||
        item.subCategory.toLowerCase().includes(searchLower);

      // Smart Category Filtering for C04 Specifics:
      // If a specific category is selected (e.g. Barco, Camping, Love Hotel, Chalet, Restaurante),
      // ONLY show the C04 items that match this category's subCategory!
      let matchesCategoryModule = true;
      if (item.pillar === "C04" && activeModule.subCategoryFilter) {
        matchesCategoryModule = item.subCategory === activeModule.subCategoryFilter;
      }

      return matchesPillar && matchesScope && matchesSearch && matchesCategoryModule;
    });
  }, [activePillar, activeScope, search, activeModule]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
      {/* Banner de Módulo Inteligente por Categoría */}
      {activeModule.subCategoryFilter && (
        <div className="bg-gradient-to-r from-[#00C8D4]/10 via-[#FF0096]/10 to-[#9B00CC]/10 border border-[#00C8D4]/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00C8D4] to-[#9B00CC] text-white flex items-center justify-center font-bold text-base shadow-md shrink-0">
              ⚡
            </div>
            <div className="text-left">
              <span className="text-[10px] font-black uppercase text-[#00C8D4] tracking-widest block">Módulo Dinámico Adaptativo Documento 77 V.5</span>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">{activeModule.label}</h4>
              <p className="text-[11px] text-slate-500 font-medium">Formulario inteligente configurado automáticamente. Se muestran instalaciones específicas para esta tipología.</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-white text-[#FF0096] text-[10px] font-black uppercase rounded-full border border-[#FF0096]/30 shadow-xs shrink-0 self-start sm:self-center">
            Filtrado Activo
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#00C8D4]/10 text-[#00C8D4]">
              <Sparkles className="w-4.5 h-4.5 text-[#00C8D4]" />
            </div>
            <h2 className="font-bold text-slate-900 text-sm tracking-tight">Estándar Documento 77 V.5 - Taxonomía Oficial HDV</h2>
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white tracking-wider shadow-xs"
              style={{ background: "#FF0096" }}
            >
              {currentList.length} seleccionadas
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Clasificación estructurada en 3 Niveles (Infraestructura Físicas, Servicios e Intangibles, Gestión y Normas) con etiquetado por Ámbito.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={selectBasicEssentials}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#00C8D4] bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 transition-colors cursor-pointer"
          >
            ⚡ Marcar Básicas
          </button>
          {currentList.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* 3 Pillars Tabs */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {PILLARS_DOCUMENT77.map((pillar) => {
            const isActive = activePillar === pillar.id;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setActivePillar(pillar.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {pillar.label}
              </button>
            );
          })}
        </div>

        {/* Scope Pill Filters & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código (ej. C01.1.3), nombre o subcategoría..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00C8D4] font-semibold"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {AMENITY_SCOPES.map((sc) => {
              const isActive = activeScope === sc.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setActiveScope(sc.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#00C8D4] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {sc.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Master Amenities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-96 overflow-y-auto pr-1">
        {filteredAmenities.map((item) => {
          const isSelected = standardKeysSet.has(item.key.toLowerCase());
          const IconComp = ICON_MAP[item.iconName] || Sparkles;

          let scopeBadgeBg = "bg-cyan-100 text-cyan-800";
          let scopeText = "Privado";
          if (item.scope === "comun") {
            scopeBadgeBg = "bg-purple-100 text-purple-800";
            scopeText = "Zona Común";
          } else if (item.scope === "servicio") {
            scopeBadgeBg = "bg-pink-100 text-pink-800";
            scopeText = "Servicio";
          }

          return (
            <div
              key={item.key}
              onClick={() => toggleAmenity(item.key)}
              className={`flex flex-col justify-between p-3 rounded-xl border text-xs transition-all cursor-pointer select-none relative group ${
                isSelected
                  ? "bg-cyan-50/80 border-[#00C8D4] text-slate-900 shadow-xs ring-1 ring-[#00C8D4]/30"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/80"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-[#00C8D4] text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 block leading-none">
                      {item.code}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 leading-tight block">
                      {item.subCategory}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 mt-0.5">
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-md bg-[#00C8D4] text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-md border border-slate-300 bg-white" />
                  )}
                </div>
              </div>

              <span className="leading-tight text-[11px] sm:text-xs text-slate-850 font-bold mb-2 break-words">
                {item.label}
              </span>

              <div className="flex items-center justify-between mt-auto pt-1 border-t border-slate-100">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${scopeBadgeBg}`}>
                  {scopeText}
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">
                  {item.pillar}
                </span>
              </div>
            </div>
          );
        })}

        {filteredAmenities.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-slate-400 font-medium">
            No se encontraron amenidades que coincidan con la búsqueda o filtros aplicados.
          </div>
        )}
      </div>

      {/* Add Custom Amenity Input */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block pt-1.5 leading-normal">
          ¿No encuentras una amenidad en el catálogo del Documento 77? Agrégala manualmente:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ej: Helipuerto privado, Cancha de Pádel vista al Ávila..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomService();
              }
            }}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 font-semibold text-slate-900"
          />
          <button
            type="button"
            onClick={addCustomService}
            className="px-4 py-2 bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar</span>
          </button>
        </div>

        {/* Display Custom Added Amenities */}
        {customServices.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {customServices.map((custom) => (
              <span
                key={custom}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200"
              >
                <span>{getAmenityLabel(custom)}</span>
                <button
                  type="button"
                  onClick={() => removeCustomService(custom)}
                  className="w-4 h-4 rounded-full hover:bg-pink-200 flex items-center justify-center text-pink-700 cursor-pointer"
                  title="Eliminar amenidad personalizada"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
