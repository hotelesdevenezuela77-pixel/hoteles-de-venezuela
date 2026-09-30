import React, { useState } from "react";
import { 
  BedDouble, 
  Layers, 
  Plus, 
  Trash2, 
  Check, 
  Bath, 
  Sparkles, 
  Maximize2, 
  Home,
  CheckCircle2,
  Code
} from "lucide-react";
import type { BedroomGroupConfig, BedDistribution } from "../../types/hdvV13";

interface FlexibleBedroomConfiguratorProps {
  initialBedroomsCount?: number;
  unitName?: string;
  onSave?: (groups: BedroomGroupConfig[]) => void;
}

export function FlexibleBedroomConfigurator({
  initialBedroomsCount = 5,
  unitName = "La Casa Verde",
  onSave
}: FlexibleBedroomConfiguratorProps) {
  const [totalBedrooms, setTotalBedrooms] = useState<number>(initialBedroomsCount);

  // Inicializar con el caso de uso del PDF:
  // - Dormitorio 1 y 2 agrupados (mismo equipamiento)
  // - Dormitorio 3 independiente
  // - Dormitorio 4 y 5 agrupados (mismo equipamiento)
  const [groups, setGroups] = useState<BedroomGroupConfig[]>([
    {
      group_id: "grp_1_2",
      group_label: "Dormitorios 1 y 2 (Mismo equipamiento)",
      bedroom_numbers: [1, 2],
      size_m2: 25,
      bath_type: "private",
      bed_counts: { king_200: 1, queen_180: 1 },
      tags: {
        "C02.1.1.3": true, // Armario
        "C02.1.1.5": true, // Perchero
        "C02.3.1.5": true  // Ducha ras de suelo
      }
    },
    {
      group_id: "grp_3",
      group_label: "Dormitorio 3 (Configuración única)",
      bedroom_numbers: [3],
      size_m2: 20,
      bath_type: "private",
      bed_counts: { single_100: 2 },
      tags: {
        "C02.1.1.3": true, // Armario
        "C02.1.4.4": true, // Zona de estar
        "C02.3.1.5": true  // Ducha ras de suelo
      }
    },
    {
      group_id: "grp_4_5",
      group_label: "Dormitorios 4 y 5 (Mismo equipamiento)",
      bedroom_numbers: [4, 5],
      size_m2: 25,
      bath_type: "shared",
      bed_counts: { bunk_90: 2 },
      tags: {
        "C02.1.1.3": true, // Armario
        "C02.1.1.5": true  // Perchero
      }
    }
  ]);

  const [activeGroupId, setActiveGroupId] = useState<string>("grp_1_2");
  const [showJsonPreview, setShowJsonPreview] = useState<boolean>(false);

  const activeGroup = groups.find(g => g.group_id === activeGroupId) || groups[0];

  // Catálogo de equipamiento común para el configurador V13
  const availableAmenities = [
    { code: "C02.1.1.3", name: "Armario ropero" },
    { code: "C02.1.1.5", name: "Perchero" },
    { code: "C02.1.1.6", name: "Mosquitera" },
    { code: "C02.1.2.1", name: "Aire Acondicionado" },
    { code: "C02.1.4.1", name: "Escritorio / Zona de trabajo" },
    { code: "C02.1.4.4", name: "Zona de estar" },
    { code: "C02.3.1.5", name: "Ducha a ras de suelo" },
    { code: "C02.3.1.7", name: "Jacuzzi / Hidromasaje privado" },
    { code: "C02.3.1.11", name: "Artículos de aseo gratuitos" }
  ];

  const updateActiveGroup = (updates: Partial<BedroomGroupConfig>) => {
    setGroups(prev => prev.map(g => g.group_id === activeGroupId ? { ...g, ...updates } : g));
  };

  const toggleTag = (code: string) => {
    if (!activeGroup) return;
    const currentVal = Boolean(activeGroup.tags[code]);
    const nextTags = { ...activeGroup.tags, [code]: !currentVal };
    updateActiveGroup({ tags: nextTags });
  };

  const updateBedCount = (bedKey: keyof BedDistribution, delta: number) => {
    if (!activeGroup) return;
    const current = activeGroup.bed_counts[bedKey] || 0;
    const nextVal = Math.max(0, current + delta);
    updateActiveGroup({
      bed_counts: {
        ...activeGroup.bed_counts,
        [bedKey]: nextVal
      }
    });
  };

  const createNewGroup = () => {
    const nextId = `grp_${Date.now()}`;
    const newGroup: BedroomGroupConfig = {
      group_id: nextId,
      group_label: `Nuevo Grupo de Dormitorios`,
      bedroom_numbers: [],
      size_m2: 20,
      bath_type: "private",
      bed_counts: { queen_180: 1 },
      tags: { "C02.1.1.3": true, "C02.3.1.5": true }
    };
    setGroups([...groups, newGroup]);
    setActiveGroupId(nextId);
  };

  const removeGroup = (groupId: string) => {
    if (groups.length <= 1) return;
    const remaining = groups.filter(g => g.group_id !== groupId);
    setGroups(remaining);
    if (activeGroupId === groupId) {
      setActiveGroupId(remaining[0].group_id);
    }
  };

  const toggleBedroomInGroup = (bedroomNum: number) => {
    if (!activeGroup) return;
    // Si ya está en este grupo, removerlo
    if (activeGroup.bedroom_numbers.includes(bedroomNum)) {
      updateActiveGroup({
        bedroom_numbers: activeGroup.bedroom_numbers.filter(n => n !== bedroomNum)
      });
      return;
    }
    // Removerlo de cualquier otro grupo donde esté asignado
    const updated = groups.map(g => {
      if (g.group_id === activeGroupId) {
        return {
          ...g,
          bedroom_numbers: [...g.bedroom_numbers, bedroomNum].sort((a, b) => a - b)
        };
      } else {
        return {
          ...g,
          bedroom_numbers: g.bedroom_numbers.filter(n => n !== bedroomNum)
        };
      }
    });
    setGroups(updated);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden text-slate-800">
      
      {/* Header Corporativo HDV */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-[#0e011f] via-[#15062c] to-[#1a0533] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00C8D4]/20 border border-[#00C8D4]/40 text-[#00C8D4] text-xs font-bold uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Especificación V13 • Grupos Dinámicos C01 & C02</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Configuración Flexible de Dormitorios
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Asigna y agrupa recámaras con equipamiento idéntico (ej. Dormitorios 1 y 2) o desglosa individualmente aquellas con características únicas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowJsonPreview(!showJsonPreview)}
            className="px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer"
          >
            <Code className="w-4 h-4 text-[#00C8D4]" />
            <span>{showJsonPreview ? "Ocultar JSONB" : "Ver JSONB"}</span>
          </button>

          <button
            type="button"
            onClick={() => onSave && onSave(groups)}
            className="px-5 py-2.5 rounded-xl bg-[#00C8D4] hover:bg-[#00b2bd] text-slate-950 text-xs font-black transition-all shadow-lg shadow-cyan-900/40 flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Guardar Distribución</span>
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Columna Izquierda: Selector de Dormitorios y Grupos */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Contador de Recámaras Totales */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total de Dormitorios en la Unidad
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTotalBedrooms(Math.max(1, totalBedrooms - 1))}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                >
                  -
                </button>
                <span className="text-sm font-black w-6 text-center text-slate-900">{totalBedrooms}</span>
                <button
                  type="button"
                  onClick={() => setTotalBedrooms(totalBedrooms + 1)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Matriz visual de recámaras */}
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: totalBedrooms }, (_, i) => i + 1).map(num => {
                const assignedGroup = groups.find(g => g.bedroom_numbers.includes(num));
                const isSelectedInActive = activeGroup?.bedroom_numbers.includes(num);

                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => toggleBedroomInGroup(num)}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isSelectedInActive
                        ? "bg-[#00C8D4]/15 border-[#00C8D4] text-[#008f99] shadow-sm ring-2 ring-[#00C8D4]/30"
                        : assignedGroup
                        ? "bg-purple-50 border-purple-200 text-purple-700"
                        : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <BedDouble className="w-4 h-4" />
                    <span>Dorm {num}</span>
                    <span className="text-[9px] font-normal truncate max-w-full">
                      {isSelectedInActive ? "Activo" : assignedGroup ? "Asignado" : "Libre"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Listado de Grupos Definidos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Grupos y Desgloses Configurados
              </h3>
              <button
                type="button"
                onClick={createNewGroup}
                className="text-xs font-bold text-[#FF0096] hover:text-[#d6007e] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Grupo</span>
              </button>
            </div>

            <div className="space-y-2">
              {groups.map(grp => {
                const isActive = grp.group_id === activeGroupId;
                return (
                  <div
                    key={grp.group_id}
                    onClick={() => setActiveGroupId(grp.group_id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.01]"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black ${isActive ? "text-[#00C8D4]" : "text-slate-900"}`}>
                          {grp.group_label}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive ? "bg-white/10 text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          {grp.bedroom_numbers.length} Dorm.
                        </span>
                      </div>
                      <p className={`text-[11px] ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                        Dormitorios: {grp.bedroom_numbers.length > 0 ? grp.bedroom_numbers.join(", ") : "Ninguno asignado"} • {grp.bath_type === "private" ? "Baño Privado" : "Baño Compartido"}
                      </p>
                    </div>

                    {groups.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeGroup(grp.group_id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isActive ? "hover:bg-red-500/20 text-red-400" : "hover:bg-red-50 text-red-500"
                        }`}
                        title="Eliminar grupo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Configuración del Grupo Activo */}
        <div className="lg:col-span-7 space-y-6">
          {activeGroup ? (
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-6">
              
              <div className="border-b border-slate-200/80 pb-4">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Nombre / Etiqueta del Grupo
                </label>
                <input
                  type="text"
                  value={activeGroup.group_label}
                  onChange={(e) => updateActiveGroup({ group_label: e.target.value })}
                  className="w-full text-base font-black text-slate-900 bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              {/* Tamaño y Baño */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Superficie Estimada (m²)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={activeGroup.size_m2 || 20}
                      onChange={(e) => updateActiveGroup({ size_m2: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-800"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">m²</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    Régimen de Baño
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateActiveGroup({ bath_type: "private" })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeGroup.bath_type === "private"
                          ? "bg-[#00C8D4] text-slate-950 border-[#00C8D4]"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Bath className="w-3.5 h-3.5" />
                      <span>Privado</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateActiveGroup({ bath_type: "shared" })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeGroup.bath_type === "shared"
                          ? "bg-[#FF0096] text-white border-[#FF0096]"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Bath className="w-3.5 h-3.5" />
                      <span>Compartido</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Distribución de Camas (C01.3 en Scope UNIDAD) */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  C01.3 Número y Tipo de Camas en este Grupo
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: "king_200" as const, label: "King (200 cm)" },
                    { key: "queen_180" as const, label: "Queen (180 cm)" },
                    { key: "full_150" as const, label: "Full (150 cm)" },
                    { key: "double_135" as const, label: "Doble (135 cm)" },
                    { key: "single_100" as const, label: "Individual (100 cm)" },
                    { key: "bunk_90" as const, label: "Litera (2x 90 cm)" }
                  ].map(bed => (
                    <div key={bed.key} className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">{bed.label}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateBedCount(bed.key, -1)}
                          className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-black w-4 text-center text-slate-900">
                          {activeGroup.bed_counts[bed.key] || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateBedCount(bed.key, 1)}
                          className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipamiento y Amenidades (C02.1 & C02.3) */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Equipamiento Común del Grupo (C02.1 / C02.3)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {availableAmenities.map(amenity => {
                    const isChecked = Boolean(activeGroup.tags[amenity.code]);
                    return (
                      <button
                        key={amenity.code}
                        type="button"
                        onClick={() => toggleTag(amenity.code)}
                        className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? "bg-white border-[#00C8D4] text-slate-900 shadow-sm"
                            : "bg-white/60 border-slate-200 text-slate-500 hover:bg-white"
                        }`}
                      >
                        <span>{amenity.name}</span>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                          isChecked ? "bg-[#00C8D4] text-slate-950" : "bg-slate-100 text-transparent"
                        }`}>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              Selecciona un grupo para configurar su equipamiento.
            </div>
          )}
        </div>

      </div>

      {/* Visor de Estructura JSONB Canónica */}
      {showJsonPreview && (
        <div className="p-6 bg-slate-950 border-t border-slate-800 text-slate-300 font-mono text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#00C8D4] font-bold">Esquema JSONB Generado para PostgreSQL (property_units.bedroom_groups):</span>
            <span className="text-[10px] text-slate-500">Indexado con GIN (features jsonb_path_ops)</span>
          </div>
          <pre className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 overflow-x-auto text-emerald-400">
            {JSON.stringify(
              {
                unit_name: unitName,
                total_bedrooms: totalBedrooms,
                bedroom_groups: groups
              },
              null,
              2
            )}
          </pre>
        </div>
      )}

    </div>
  );
}
