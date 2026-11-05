import { useState } from "react";
import { useLocation } from "wouter";
import {
  Building2,
  Home,
  Tent,
  Anchor,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  X,
  ArrowLeft,
} from "lucide-react";
import { SERVICE_CATEGORIES_V15 } from "@/lib/v15MasterCatalog";
import { PropertyWizardV15 } from "@/components/owner/PropertyWizardV15";

interface PropertyRegistrationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGroup?: (groupId: string) => void;
}

export function PropertyRegistrationSelectorModal({
  isOpen,
  onClose,
  onSelectGroup,
}: PropertyRegistrationSelectorModalProps) {
  const [, setLocation] = useLocation();
  const [activeCategoryIdForWizard, setActiveCategoryIdForWizard] = useState<
    number | null
  >(null);

  if (!isOpen) return null;

  const accommodationCards = SERVICE_CATEGORIES_V15.filter(
    (c) => c.isAccommodation
  );

  const renderCategoryIcon = (iconType: string) => {
    switch (iconType) {
      case "hotel":
        return <Building2 className="w-7 h-7 text-white" />;
      case "resort":
        return <Tent className="w-7 h-7 text-white" />;
      case "house":
        return <Home className="w-7 h-7 text-white" />;
      case "boat":
        return <Anchor className="w-7 h-7 text-white" />;
      default:
        return <Building2 className="w-7 h-7 text-white" />;
    }
  };

  const handleOpenAssistant = (categoryId: number) => {
    // Mapear CS-01..CS-04 a los IDs de grupo si el padre tiene un handler personalizado
    if (onSelectGroup) {
      const btnMap: Record<number, string> = {
        1: "boton1",
        2: "boton3",
        3: "boton2",
        4: "boton5",
      };
      onSelectGroup(btnMap[categoryId] || `cs-0${categoryId}`);
      return;
    }
    setActiveCategoryIdForWizard(categoryId);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0e011f]/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden my-6 border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Cabecera Corporativa HDV V15 */}
        <div className="bg-gradient-to-r from-[#0e011f] via-[#1a0533] to-[#0e011f] px-6 sm:px-8 py-6 flex items-start sm:items-center justify-between text-white border-b border-[#00C8D4]/30 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF0096]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00C8D4]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest text-[#00C8D4] bg-[#00C8D4]/15 border border-[#00C8D4]/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#00C8D4]" />
                Documento 77 V15 Oficial · Arquitectura JSONB
              </span>
              <span className="text-[11px] font-semibold text-white/60">
                Asistente Dinámico por Pasos
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-serif">
              {activeCategoryIdForWizard
                ? "Asistente de Configuración de la Propiedad (Wizard V15)"
                : "¿Qué tipo de propiedad deseas registrar o configurar?"}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Selecciona una de las 4 categorías oficiales de alojamiento para abrir el asistente especializado por pasos con guardado progresivo.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-4">
            {activeCategoryIdForWizard && (
              <button
                type="button"
                onClick={() => setActiveCategoryIdForWizard(null)}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-black text-[#00C8D4] flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Ver las 4 Tarjetas</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer hover:scale-105"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido Principal: Las 4 Tarjetas Oficiales V15 o el Wizard V15 Activo */}
        <div className="p-6 sm:p-8 bg-slate-50 overflow-y-auto flex-1">
          {activeCategoryIdForWizard ? (
            <PropertyWizardV15
              initialCategoryId={activeCategoryIdForWizard}
              autoStartWizard={true}
              onSaveComplete={() => {
                // Mantiene al usuario informado sin cerrar abruptamente
              }}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {accommodationCards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleOpenAssistant(card.id)}
                    className="bg-white rounded-3xl p-6 border-2 border-slate-200/80 hover:border-[#00C8D4] transition-all text-left flex flex-col justify-between shadow-lg hover:shadow-xl cursor-pointer hover:-translate-y-1"
                  >
                    <div>
                      {/* Cabecera: Ícono en caja sólida Turquesa + Título en Serif al lado */}
                      <div className="flex items-start gap-3.5 mb-3">
                        <div className="w-13 h-13 rounded-2xl bg-[#009fb0] flex items-center justify-center shrink-0 shadow-md">
                          {renderCategoryIcon(card.iconType)}
                        </div>
                        <h3 className="text-lg font-black text-[#0f172a] font-serif leading-snug">
                          {card.frontTitle}
                        </h3>
                      </div>

                      {/* Insignia DISPONIBLE debajo del título y antes de la descripción */}
                      <div className="mb-3">
                        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-[#008c9b] bg-[#00C8D4]/15 border border-[#00C8D4]/30">
                          {card.badgeText}
                        </span>
                      </div>

                      {/* Descripción */}
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {card.description}
                      </p>

                      {/* Bloque INCLUYE: sin códigos SCS-XX */}
                      <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 space-y-2 mb-6">
                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
                          INCLUYE:
                        </div>
                        {card.includesList.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-xs text-[#0f172a] font-bold leading-tight"
                          >
                            <CheckCircle2 className="w-4 h-4 text-[#00C8D4] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Botón Inferior Abrir Asistente -> */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAssistant(card.id);
                      }}
                      className="w-full py-3.5 px-5 rounded-2xl bg-[#009fb0] hover:bg-[#008896] text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                    >
                      <span>Abrir Asistente</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Nota Informativa al Pie */}
              <div className="mt-6 bg-[#0e011f] rounded-2xl p-4 text-white flex items-center justify-between flex-col sm:flex-row gap-3 border border-[#00C8D4]/20 shadow-md">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-lg bg-[#00C8D4] text-[#0e011f] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      Guardado Progresivo por Pasos y Almacenamiento Nativo JSONB (`rooms_distribution`)
                    </p>
                    <p className="text-[11px] text-slate-300">
                      Cada paso se guarda en la base de datos para que puedas completar la ficha de tu propiedad a tu propio ritmo.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setLocation("/admin/establecimientos/nuevo?btn=boton1");
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-[#00C8D4] transition-all cursor-pointer shrink-0"
                  >
                    Formulario Completo Clásico
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all cursor-pointer shrink-0"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
