import { useState, useMemo } from "react";
import { MASTER_AMENITIES, AMENITY_CATEGORIES, parseServicesList, getAmenityLabel, AmenityItem } from "@/lib/amenitiesList";
import {
  Sparkles, Search, Check, Plus, Trash2, Zap, Droplets, Wifi, Wind, Car,
  ShieldCheck, Clock, Dog, Accessibility, ArrowUpSquare, Waves, Bath, Palmtree,
  Dumbbell, Flame, TreePine, Smile, Trophy, Utensils, Coffee, Wine, GlassWater,
  ConciergeBell, Plane, Compass, Sun, Briefcase, Shirt, Eye, Tv, ChefHat,
  ThermometerSun, Lock, CheckSquare, Square
} from "lucide-react";

interface AmenitiesSelectorProps {
  selectedServices: string[];
  onChange: (services: string[]) => void;
}

const ICON_MAP: Record<string, any> = {
  Wifi, Wind, Car, Zap, Droplets, ShieldCheck, Clock, Dog, Accessibility, ArrowUpSquare,
  Waves, Bath, Palmtree, Sparkles, Dumbbell, Flame, TreePine, Smile, Trophy, Utensils,
  Coffee, Wine, GlassWater, ConciergeBell, Plane, Compass, Sun, Briefcase, Shirt,
  Eye, Tv, ChefHat, ThermometerSun, Lock
};

export function AmenitiesSelector({ selectedServices, onChange }: AmenitiesSelectorProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [customInput, setCustomInput] = useState<string>("");

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
    const basics = ["wifi", "aire_acondicionado", "estacionamiento", "planta_electrica", "tanque_agua", "restaurante"];
    const merged = Array.from(new Set([...currentList, ...basics]));
    onChange(merged);
  };

  const clearAll = () => {
    onChange([]);
  };

  // Filter master amenities by tab and search
  const filteredAmenities = useMemo(() => {
    return MASTER_AMENITIES.filter(item => {
      const matchesTab = activeTab === "all" || item.category === activeTab;
      const matchesSearch = !search.trim() ||
        item.label.toLowerCase().includes(search.toLowerCase()) ||
        item.key.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, search]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-500/10 text-[#00C8D4]">
              <Sparkles className="w-4.5 h-4.5 text-[#00C8D4]" />
            </div>
            <h2 className="font-bold text-gray-900 text-sm tracking-tight">Servicios y Amenidades</h2>
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white tracking-wider"
              style={{ background: "#FF0096" }}
            >
              {currentList.length} seleccionadas
            </span>
          </div>
          <p className="text-gray-500 text-xs mt-1">
            Selecciona las comodidades que ofrece tu establecimiento para destacarlo en búsquedas y comparativas.
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

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar amenidad (ej. Piscina, Planta Eléctrica, Pet Friendly...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-900 placeholder-slate-400 focus:outline-none focus:border-[#00C8D4] font-semibold"
          />
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {AMENITY_CATEGORIES.map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Master Amenities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
        {filteredAmenities.map((item) => {
          const isSelected = standardKeysSet.has(item.key.toLowerCase());
          const IconComp = ICON_MAP[item.iconName] || Sparkles;

          return (
            <div
              key={item.key}
              onClick={() => toggleAmenity(item.key)}
              className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none ${
                isSelected
                  ? "bg-cyan-50/80 border-[#00C8D4] text-slate-900 shadow-xs ring-1 ring-[#00C8D4]/30"
                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50/80"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-[#00C8D4] text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{item.label}</span>
              </div>

              <div className="shrink-0">
                {isSelected ? (
                  <div className="w-5 h-5 rounded-md bg-[#00C8D4] text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-md border border-gray-300 bg-white" />
                )}
              </div>
            </div>
          );
        })}

        {filteredAmenities.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-slate-400 font-medium">
            No se encontraron amenidades que coincidan con "{search}".
          </div>
        )}
      </div>

      {/* Add Custom Amenity Input */}
      <div className="pt-4 border-t border-gray-100 space-y-3">
        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
          ¿No encuentras una amenidad? Agrégala manualmente:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ej: Vista al Ávila, Helipuerto, Cancha de Pádel..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomService();
              }
            }}
            className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 font-semibold text-gray-900"
          />
          <button
            type="button"
            onClick={addCustomService}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
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
