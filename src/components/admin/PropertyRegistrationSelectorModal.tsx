import { useState } from "react";
import { useLocation } from "wouter";
import {
  Building2, Home, Tent, Heart, Ship, Utensils,
  Sparkles, CheckCircle2, ArrowRight, X, Clock, Info
} from "lucide-react";
import { PROPERTY_BUTTON_GROUPS, type PropertyButtonGroup } from "@/lib/amenitiesList";

interface PropertyRegistrationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGroup?: (groupId: string) => void;
}

const ICON_COMPONENTS: Record<string, any> = {
  Building2,
  Home,
  Tent,
  Heart,
  Ship,
  Utensils
};

export function PropertyRegistrationSelectorModal({
  isOpen,
  onClose,
  onSelectGroup
}: PropertyRegistrationSelectorModalProps) {
  const [, setLocation] = useLocation();
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelect = (group: PropertyButtonGroup) => {
    if (group.status === "pending") return;
    if (onSelectGroup) {
      onSelectGroup(group.id);
    } else {
      setLocation(`/admin/establecimientos/nuevo?btn=${group.id}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0e011f]/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden my-6 border border-slate-200">
        
        {/* Cabecera Corporativa HDV */}
        <div className="bg-gradient-to-r from-[#0e011f] via-[#1a0533] to-[#0e011f] px-6 sm:px-8 py-6 flex items-start sm:items-center justify-between text-white border-b border-[#00C8D4]/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF0096]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00C8D4]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest text-[#00C8D4] bg-[#00C8D4]/15 border border-[#00C8D4]/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#00C8D4]" />
                Documento 77 V.10 Oficial
              </span>
              <span className="text-[11px] font-semibold text-white/60">Asistente por Secciones</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-serif">
              ¿Qué tipo de propiedad deseas registrar?
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Selecciona una modalidad para abrir el formulario especializado por secciones adaptado a los requerimientos de tu establecimiento.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shrink-0 ml-4 hover:scale-105"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenedor de Botones de Selección */}
        <div className="p-6 sm:p-8 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROPERTY_BUTTON_GROUPS.map((group) => {
              const IconComp = ICON_COMPONENTS[group.icon] || Building2;
              const isActive = group.status === "active";
              const isHovered = hoveredGroup === group.id;

              return (
                <div
                  key={group.id}
                  onMouseEnter={() => setHoveredGroup(group.id)}
                  onMouseLeave={() => setHoveredGroup(null)}
                  onClick={() => isActive && handleSelect(group)}
                  className={`relative rounded-2xl p-5 border transition-all text-left flex flex-col justify-between ${
                    isActive
                      ? "bg-white hover:border-[#00C8D4] hover:shadow-xl cursor-pointer hover:-translate-y-1"
                      : "bg-slate-100 border-slate-200 opacity-80 cursor-not-allowed"
                  } ${isHovered && isActive ? "ring-2 ring-[#00C8D4]/30" : "border-slate-200"}`}
                >
                  {/* Badge de Estado / Botón Número */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs"
                        style={{
                          background: isActive ? group.gradient : "#CBD5E1",
                          color: "#FFFFFF"
                        }}
                      >
                        <IconComp className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                        Botón {group.btnNumber}
                      </span>
                    </div>

                    {isActive ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-[#00C8D4] bg-[#00C8D4]/10 border border-[#00C8D4]/30">
                        Disponible
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-amber-700 bg-amber-100 border border-amber-300 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        En Proceso
                      </span>
                    )}
                  </div>

                  {/* Contenido Principal */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-snug">
                      {group.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-1 mb-3.5 leading-relaxed">
                      {group.subtitle}
                    </p>

                    {/* Lista de Categorías Incluidas */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-150 space-y-1 mb-4">
                      <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                        Incluye:
                      </div>
                      {group.items.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 font-medium leading-tight">
                          <CheckCircle2 className="w-3 h-3 text-[#00C8D4] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                      {group.items.length > 4 && (
                        <div className="text-[10px] text-slate-400 font-bold italic pt-0.5 pl-4.5">
                          + {group.items.length - 4} categorías más...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botón de Acción Inferior */}
                  <div className="pt-2">
                    {isActive ? (
                      <button
                        type="button"
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md group-hover:scale-101"
                        style={{
                          background: group.btnNumber === 1
                            ? "linear-gradient(135deg, #00C8D4 0%, #0098A6 100%)"
                            : group.btnNumber === 2
                            ? "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)"
                            : "linear-gradient(135deg, #FF0096 0%, #E11D48 100%)"
                        }}
                      >
                        <span>Abrir Asistente Botón {group.btnNumber}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </button>
                    ) : (
                      <div className="w-full py-2 px-3 rounded-xl text-[11px] font-bold text-slate-400 bg-slate-200 flex items-center justify-center gap-1.5">
                        <Info className="w-3.5 h-3.5" />
                        <span>Estructura en Proceso de Envío</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nota Informativa al Pie */}
          <div className="mt-6 bg-[#0e011f] rounded-2xl p-4 text-white flex items-center justify-between flex-col sm:flex-row gap-3 border border-[#00C8D4]/20 shadow-md">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-lg bg-[#00C8D4]/20 text-[#00C8D4] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Cada botón abre un formulario especializado por Secciones (Wizard)
                </p>
                <p className="text-[11px] text-slate-300">
                  Garantiza que no dejes campos obligatorios vacíos y estructura tus datos con la taxonomía oficial de Venezuela.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all cursor-pointer shrink-0 self-end sm:self-auto"
            >
              Cancelar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
