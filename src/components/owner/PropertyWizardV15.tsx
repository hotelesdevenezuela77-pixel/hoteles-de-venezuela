import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  COUNTRY_CATEGORIES_V15,
  SERVICE_CATEGORIES_V15,
  SERVICE_SUBCATEGORIES_V15,
  SUBCATEGORY_PARENTS_PIVOT_V15,
  TAG_GROUPS_V15,
  MASTER_TAGS_V15,
  TIPOS_DE_VIA_V15,
  ESTADOS_VENEZUELA_V15,
  DEFAULT_ROOMS_DISTRIBUTION_JSONB_V15,
  isTagAllowedForSubcategoryAndCountry,
  getWizardStepsForSubcategoryV15,
  type CountryCodeV15,
  type MasterTagV15,
  type RoomDistributionUnitJsonbV15,
} from "@/lib/v15MasterCatalog";
import {
  Building2,
  Tent,
  Home,
  Anchor,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  Sparkles,
  Zap,
  Droplets,
  ShieldCheck,
  MapPin,
  Plus,
  Trash2,
  Wallet,
  Check,
  AlertCircle,
  Compass,
  Utensils,
  Car,
  Award,
  BedDouble,
  Database,
} from "lucide-react";

export interface PoiEntryV15 {
  id: string;
  typeCode: string;
  typeLabel: string;
  name: string;
  distanceLabel: string;
}

const POI_TYPES_V15 = [
  { code: "C00.6.1.1", label: "Restaurantes, Bares y Cafeterías" },
  { code: "C00.6.1.2", label: "Servicios (Centros comerciales, mercados, farmacias)" },
  { code: "C00.6.1.3", label: "Playas y Cayos" },
  { code: "C00.6.1.4", label: "Aeropuerto, Terminal o Puerto Marítimo" },
  { code: "C00.6.1.5", label: "Patrimonio Histórico y Museos" },
  { code: "C00.6.1.6", label: "Parques Nacionales y Reservas Naturales" },
  { code: "C00.6.1.7", label: "Atracciones Turísticas y Recreativas" },
  { code: "C00.6.1.8", label: "Hospitales y Clínicas" },
  { code: "C00.6.1.9", label: "Estación de Policía / Seguridad" },
];

interface PropertyWizardV15Props {
  establishmentId?: number | string;
  initialName?: string;
  initialCategoryId?: number;
  autoStartWizard?: boolean;
  onSaveComplete?: (payload: Record<string, any>) => void;
}

export function PropertyWizardV15({
  establishmentId = "default",
  initialName = "",
  initialCategoryId,
  autoStartWizard = false,
  onSaveComplete,
}: PropertyWizardV15Props) {
  const storageKey = `hdv_wizard_v15_${establishmentId}`;

  // Estado principal del Wizard V15
  const [countryIso, setCountryIso] = useState<CountryCodeV15>("VE");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    initialCategoryId || 1
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number>(1);
  const [wizardStarted, setWizardStarted] = useState<boolean>(autoStartWizard);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  // Distribución nativa JSONB de Unidades Habitacionales (`rooms_distribution`)
  const [roomsDistribution, setRoomsDistribution] = useState<
    RoomDistributionUnitJsonbV15[]
  >(DEFAULT_ROOMS_DISTRIBUTION_JSONB_V15);

  // Valores de las etiquetas (code -> string | number | boolean)
  const [tagValues, setTagValues] = useState<Record<string, any>>({
    "C00.1.1": initialName || "",
    "C01.4.1": true, // Planta Eléctrica 24/7 por defecto destacada en VE
    "C01.4.2": true, // Tanque de Agua continuo
    "C02.5.1": true, // Wi-Fi gratis
    "C04.7.1.1": true, // Pago Móvil
    "C04.7.2.1": true, // Efectivo USD
    "C04.7.3.1": true, // Zelle
    "C04.7.3.2": true, // Binance Pay USDT
    "C04.1.9": true, // Cédula/Pasaporte obligatorio
    "C04.1.10": true, // LOPNNA menores
    "C04.9.1": true, // Prepago 50%
    "C04.10.1": true, // Niños bienvenidos
  });

  // Unidades Hijas seleccionadas de la Tabla Pivote 1 (SCS-17 a SCS-30)
  const [selectedPivotUnitIds, setSelectedPivotUnitIds] = useState<number[]>([
    18, 24, 27,
  ]);

  // Lista dinámica de Puntos de Interés Cercanos (C00.6)
  const [poiList, setPoiList] = useState<PoiEntryV15[]>([
    {
      id: "poi-1",
      typeCode: "C00.6.1.3",
      typeLabel: "Playas y Cayos",
      name: "Playa Principal / Embarcadero",
      distanceLabel: "300 metros (4 min a pie)",
    },
    {
      id: "poi-2",
      typeCode: "C00.6.1.4",
      typeLabel: "Aeropuerto, Terminal o Puerto Marítimo",
      name: "Aeropuerto Nacional / Internacional",
      distanceLabel: "15 km (20 min en vehículo)",
    },
  ]);

  const [newPoiType, setNewPoiType] = useState<string>("C00.6.1.3");
  const [newPoiName, setNewPoiName] = useState<string>("");
  const [newPoiDistance, setNewPoiDistance] = useState<string>("");
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Cargar borrador guardado en localStorage al iniciar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.countryIso) setCountryIso(parsed.countryIso);
        if (parsed.selectedCategoryId) setSelectedCategoryId(parsed.selectedCategoryId);
        if (parsed.selectedSubcategoryId) setSelectedSubcategoryId(parsed.selectedSubcategoryId);
        if (parsed.tagValues) {
          setTagValues((prev) => ({
            ...prev,
            ...parsed.tagValues,
            "C00.1.1": parsed.tagValues["C00.1.1"] || initialName || "",
          }));
        }
        if (Array.isArray(parsed.selectedPivotUnitIds)) {
          setSelectedPivotUnitIds(parsed.selectedPivotUnitIds);
        }
        if (Array.isArray(parsed.poiList)) {
          setPoiList(parsed.poiList);
        }
        if (Array.isArray(parsed.roomsDistribution) && parsed.roomsDistribution.length > 0) {
          setRoomsDistribution(parsed.roomsDistribution);
        }
      }
    } catch (e) {
      console.warn("Error leyendo borrador Wizard V15:", e);
    }
  }, [storageKey, initialName]);

  // Subcategorías padre disponibles para la categoría seleccionada
  const availableSubcategories = useMemo(() => {
    if (!selectedCategoryId) return [];
    return SERVICE_SUBCATEGORIES_V15.filter(
      (s) => s.serviceCategoryId === selectedCategoryId && s.isParent
    );
  }, [selectedCategoryId]);

  // Pasos dinámicos según categoría y subcategoría
  const steps = useMemo(() => {
    return getWizardStepsForSubcategoryV15(
      selectedCategoryId || 1,
      selectedSubcategoryId || 1
    );
  }, [selectedCategoryId, selectedSubcategoryId]);

  const currentStep = steps[currentStepIdx] || steps[0];

  // Etiquetas filtradas para el paso actual, la subcategoría activa y el país ("VE" | "ES")
  const currentStepTagsByGroup = useMemo(() => {
    if (!currentStep) return [];
    return currentStep.tagGroupIds
      .map((groupId) => {
        const groupInfo = TAG_GROUPS_V15.find((g) => g.id === groupId);
        const tags = MASTER_TAGS_V15.filter(
          (t) =>
            t.tagGroupId === groupId &&
            isTagAllowedForSubcategoryAndCountry(
              t,
              selectedSubcategoryId,
              countryIso
            )
        );
        return {
          group: groupInfo || {
            id: groupId,
            code: `G-${groupId}`,
            name: `Grupo #${groupId}`,
          },
          tags,
        };
      })
      .filter((item) => item.tags.length > 0);
  }, [currentStep, selectedSubcategoryId, countryIso]);

  // Unidades hijas de la Tabla Pivote 1 para la subcategoría padre actual (7, 8, 9 o 10)
  const availablePivotChildren = useMemo(() => {
    return SUBCATEGORY_PARENTS_PIVOT_V15.filter(
      (p) => p.parentId === selectedSubcategoryId
    ).map((p) => {
      const sub = SERVICE_SUBCATEGORIES_V15.find(
        (s) => s.id === p.childSubcategoryId
      );
      return {
        ...p,
        name: sub?.name || p.description,
        code: sub?.code || `SCS-${p.childSubcategoryId}`,
      };
    });
  }, [selectedSubcategoryId]);

  const handleTagChange = (code: string, value: any) => {
    setValidationError(null);
    setTagValues((prev) => ({
      ...prev,
      [code]: value,
    }));
  };

  const handleSaveStepProgress = async (
    showNotification = true,
    overrideCatId?: number,
    overrideSubcatId?: number
  ) => {
    const activeCatId = overrideCatId ?? selectedCategoryId ?? 1;
    const activeSubId = overrideSubcatId ?? selectedSubcategoryId ?? 1;

    const payload = {
      countryIso,
      countryCategoryId: countryIso === "VE" ? 1 : 2,
      selectedCategoryId: activeCatId,
      selectedSubcategoryId: activeSubId,
      currentStepIdx,
      tagValues,
      roomsDistribution,
      selectedPivotUnitIds,
      poiList,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
      // Sincronizar en la clave global para que la Ficha de Detalle pública lo lea en tiempo real
      localStorage.setItem("hdv_v15_active_property_config", JSON.stringify(payload));
    } catch (e) {
      console.warn("Error guardando progreso local Wizard V15:", e);
    }

    // Persistencia asíncrona en Supabase (JSONB nativo: rooms_distribution, v15_tags_values, points_of_interest)
    if (establishmentId && establishmentId !== "default") {
      try {
        await supabase
          .from("establishments")
          .update({
            country_category_id: countryIso === "VE" ? 1 : 2,
            service_category_id: activeCatId,
            subcategory_id: activeSubId,
            rooms_distribution: roomsDistribution,
            v15_tags_values: tagValues,
            points_of_interest: poiList,
            v15_wizard_state: {
              currentStepIdx,
              selectedPivotUnitIds,
              updatedAt: payload.updatedAt,
            },
          })
          .eq("id", establishmentId);
      } catch (dbErr) {
        console.warn("Persistencia local activa (sincronización Supabase diferida):", dbErr);
      }
    }

    if (showNotification) {
      setSaveBanner(
        `Progreso del ${currentStep.title} y estructura JSONB (rooms_distribution) guardados correctamente.`
      );
      setTimeout(() => setSaveBanner(null), 4000);
    }
    if (onSaveComplete) {
      onSaveComplete(payload);
    }
  };

  const validateCurrentStep = (): boolean => {
    const missingRequired: string[] = [];
    for (const groupBlock of currentStepTagsByGroup) {
      for (const tag of groupBlock.tags) {
        if (tag.isRequired) {
          const val = tagValues[tag.code];
          if (
            val === undefined ||
            val === null ||
            (typeof val === "string" && val.trim() === "")
          ) {
            missingRequired.push(`${tag.name} (${tag.code})`);
          }
        }
      }
    }
    if (missingRequired.length > 0) {
      setValidationError(
        `Por favor completa los campos obligatorios (*) antes de avanzar: ${missingRequired
          .slice(0, 3)
          .join(", ")}${missingRequired.length > 3 ? "..." : ""}`
      );
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleNextStep = () => {
    if (!validateCurrentStep()) return;
    handleSaveStepProgress(false);
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
      window.scrollTo({ top: 180, behavior: "smooth" });
    } else {
      handleSaveStepProgress(true);
    }
  };

  const handleAddPoi = () => {
    if (!newPoiName.trim() || !newPoiDistance.trim()) return;
    const foundType =
      POI_TYPES_V15.find((t) => t.code === newPoiType) || POI_TYPES_V15[0];
    setPoiList((prev) => [
      ...prev,
      {
        id: `poi-${Date.now()}`,
        typeCode: foundType.code,
        typeLabel: foundType.label,
        name: newPoiName.trim(),
        distanceLabel: newPoiDistance.trim(),
      },
    ]);
    setNewPoiName("");
    setNewPoiDistance("");
  };

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
      case "gastronomy":
        return <Utensils className="w-7 h-7 text-white" />;
      case "transport":
        return <Car className="w-7 h-7 text-white" />;
      default:
        return <Compass className="w-7 h-7 text-white" />;
    }
  };

  // ============================================================================
  // VISTA 1: SELECCIÓN DE PAÍS Y LAS 4 TARJETAS OFICIALES DE ALOJAMIENTO V15
  // ============================================================================
  if (!wizardStarted) {
    const accommodationCards = SERVICE_CATEGORIES_V15.filter(
      (c) => c.isAccommodation
    );

    return (
      <div className="space-y-8 font-sans text-[#1e293b]">
        {/* Cabecera Corporativa V15 */}
        <div
          className="rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl border border-white/10"
          style={{
            background: "linear-gradient(135deg, #0e011f 0%, #1a0533 100%)",
          }}
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#00C8D4]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#FF0096]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 mb-4">
                <span className="w-5 h-5 rounded-md bg-[#00C8D4] flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00C8D4]">
                  SISTEMA DE CONFIGURACIÓN DE PROPIEDADES · DOCUMENTO 77 V15
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-white playfair leading-tight">
                Panel de Configuración del Establecimiento
              </h2>
              <p className="text-slate-300 text-xs md:text-sm mt-2 leading-relaxed">
                Configura tu propiedad paso a paso con guardado automático por etapa. Adaptado 100% a la realidad operativa y financiera de Venezuela (Planta Eléctrica 24/7, Tanque de Agua, Pago Móvil, Zelle y Binance Pay).
              </p>
            </div>

            {/* Selector de País (CP-1 Venezuela / CP-2 España) */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00C8D4] block mb-2">
                1. ELIGE EL PAÍS DE OPERACIÓN:
              </span>
              <div className="flex items-center gap-2">
                {COUNTRY_CATEGORIES_V15.map((c) => {
                  const active = countryIso === c.iso;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCountryIso(c.iso)}
                      className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-2 ${
                        active
                          ? "bg-[#00C8D4] text-[#0e011f] shadow-lg"
                          : "bg-white/5 text-white hover:bg-white/15"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          active ? "text-[#0e011f]" : "text-white/40"
                        }`}
                      />
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
              <span className="text-[10px] text-slate-300 mt-2 block">
                {countryIso === "VE"
                  ? "Moneda Dual Activa: $ USD / Bs. VES (Etiquetas exclusivas ES ocultas)"
                  : "Moneda Activa: € EUR (Configuración Europa)"}
              </span>
            </div>
          </div>
        </div>

        {/* Las 4 Tarjetas Oficiales de Categoría de Alojamiento (Diseño exacto de las capturas V15) */}
        <div>
          <div className="mb-5">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#00C8D4] block">
              2. ELIGE UNA CATEGORÍA DE ALOJAMIENTO (SERVICE_CATEGORY)
            </span>
            <h3 className="text-xl md:text-2xl font-black text-[#0f172a] playfair mt-1">
              Selecciona el Tipo de Propiedad para Abrir el Asistente
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {accommodationCards.map((card) => {
              const isSelected = selectedCategoryId === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => {
                    setSelectedCategoryId(card.id);
                    const firstSub = SERVICE_SUBCATEGORIES_V15.find(
                      (s) => s.serviceCategoryId === card.id && s.isParent
                    );
                    if (firstSub) setSelectedSubcategoryId(firstSub.id);
                  }}
                  className={`bg-white rounded-3xl p-6 flex flex-col justify-between transition-all cursor-pointer border-2 shadow-lg hover:shadow-xl ${
                    isSelected
                      ? "border-[#00C8D4] ring-4 ring-[#00C8D4]/15"
                      : "border-slate-200/80 hover:border-[#00C8D4]/50"
                  }`}
                >
                  <div>
                    {/* Cabecera: Ícono en caja sólida Turquesa + Título en Serif al lado (Sin códigos CS/SCS) */}
                    <div className="flex items-start gap-3.5 mb-3">
                      <div className="w-13 h-13 rounded-2xl bg-[#009fb0] flex items-center justify-center shrink-0 shadow-md">
                        {renderCategoryIcon(card.iconType)}
                      </div>
                      <h4 className="text-lg font-black text-[#0f172a] playfair leading-snug">
                        {card.frontTitle}
                      </h4>
                    </div>

                    {/* Insignia "DISPONIBLE" debajo del título antes del bloque explicativo */}
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#00C8D4]/15 border border-[#00C8D4]/30 text-[#008c9b] text-[10px] font-black uppercase tracking-widest">
                        {card.badgeText}
                      </span>
                    </div>

                    {/* Bloque de Descripción */}
                    <p className="text-slate-600 text-xs leading-relaxed mb-4">
                      {card.description}
                    </p>

                    {/* Caja de Contenido "INCLUYE:" sin prefijos de código SCS-XX */}
                    <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 mb-6">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2.5">
                        INCLUYE:
                      </span>
                      <ul className="space-y-2">
                        {card.includesList.map((itemText, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-xs font-bold text-[#0f172a]"
                          >
                            <CheckCircle2 className="w-4 h-4 text-[#00C8D4] shrink-0 mt-0.5" />
                            <span>{itemText}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Botón Abrir Asistente -> */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategoryId(card.id);
                      const firstSub = SERVICE_SUBCATEGORIES_V15.find(
                        (s) => s.serviceCategoryId === card.id && s.isParent
                      );
                      const nextSubId = firstSub ? firstSub.id : 1;
                      setSelectedSubcategoryId(nextSubId);
                      setCurrentStepIdx(0);
                      setWizardStarted(true);
                      handleSaveStepProgress(false, card.id, nextSubId);
                    }}
                    className="w-full py-3.5 px-5 rounded-2xl bg-[#009fb0] hover:bg-[#008896] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <span>Abrir Asistente</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selector de Subcategoría Específica (SCS-01 a SCS-16) antes de entrar o directamente al abrir */}
        {selectedCategoryId && availableSubcategories.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF0096] block">
                  3. SUBCATEGORÍA ESPECÍFICA (SUBCATEGORY_ID)
                </span>
                <h4 className="text-lg font-black text-[#0f172a] playfair mt-0.5">
                  Afina la Tipología Exacta de tu Alojamiento
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCurrentStepIdx(0);
                  setWizardStarted(true);
                  handleSaveStepProgress(false);
                }}
                className="px-6 py-3 rounded-2xl text-white font-black text-xs flex items-center gap-2 shadow-lg cursor-pointer self-start md:self-auto"
                style={{
                  background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)",
                }}
              >
                <span>Iniciar Configuración Paso a Paso</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableSubcategories.map((sub) => {
                const active = selectedSubcategoryId === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedSubcategoryId(sub.id)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      active
                        ? "bg-[#0e011f] text-white border-[#00C8D4] shadow-md"
                        : "bg-slate-50 hover:bg-slate-100 text-[#1e293b] border-slate-200"
                    }`}
                  >
                    <div>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider block ${
                          active ? "text-[#00C8D4]" : "text-slate-400"
                        }`}
                      >
                        {sub.code}
                      </span>
                      <span className="text-xs font-extrabold block mt-0.5">
                        {sub.name}
                      </span>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        active ? "bg-[#00C8D4] text-[#0e011f]" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // VISTA 2: ASISTENTE MULTI-PASOS DINÁMICO (WIZARD V15 DE 6 A 8 PASOS)
  // ============================================================================
  const activeSubcategoryObj = SERVICE_SUBCATEGORIES_V15.find(
    (s) => s.id === selectedSubcategoryId
  );
  const activeCategoryObj = SERVICE_CATEGORIES_V15.find(
    (c) => c.id === selectedCategoryId
  );

  return (
    <div className="space-y-6 font-sans text-[#1e293b]">
      {/* Barra Superior del Wizard con Progreso y Selector Rápido de Subcategoría */}
      <div
        className="rounded-3xl p-6 md:p-8 text-white shadow-xl border border-white/10"
        style={{
          background: "linear-gradient(135deg, #0e011f 0%, #1a0533 100%)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <button
            type="button"
            onClick={() => setWizardStarted(false)}
            className="inline-flex items-center gap-2 text-xs font-black text-[#00C8D4] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cambiar Categoría Principal ({activeCategoryObj?.frontTitle})</span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-white">
              País: <strong className="text-[#00C8D4]">{countryIso === "VE" ? "Venezuela (CP-1)" : "España (CP-2)"}</strong>
            </span>
            <select
              value={selectedSubcategoryId}
              onChange={(e) => {
                setSelectedSubcategoryId(Number(e.target.value));
                setCurrentStepIdx(0);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold focus:outline-none focus:border-[#00C8D4]"
            >
              {availableSubcategories.map((s) => (
                <option key={s.id} value={s.id} className="text-slate-900">
                  {s.code} · {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stepper Horizontal Interactivo */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
          {steps.map((step, idx) => {
            const isCurrent = idx === currentStepIdx;
            const isCompleted = idx < currentStepIdx;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStepIdx(idx)}
                className={`p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                  isCurrent
                    ? "bg-[#00C8D4] text-[#0e011f] border-[#00C8D4] shadow-lg font-black"
                    : isCompleted
                    ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/40 font-bold"
                    : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-black">
                    Paso {step.stepNumber}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
                </div>
                <p className="text-[11px] leading-tight line-clamp-2">
                  {step.title.replace(/^Paso \d+ · /, "")}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notificaciones de Guardado o Validación */}
      {saveBanner && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold">{saveBanner}</p>
        </div>
      )}

      {validationError && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-[#FF0096] text-white flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold">{validationError}</p>
        </div>
      )}

      {/* Tarjeta Destacada Especial en el Paso 3: Abastecimiento y Energía Continua (C01.4.1 y C01.4.2) */}
      {currentStep?.tagGroupIds.includes(24) && countryIso === "VE" && (
        <div
          className="rounded-3xl p-6 md:p-8 text-white shadow-xl border-2 border-[#00C8D4]"
          style={{
            background: "linear-gradient(135deg, #0e011f 0%, #1a0533 100%)",
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00C8D4] text-[#0e011f] text-[10px] font-black uppercase tracking-widest mb-2">
                <Zap className="w-3.5 h-3.5" />
                DIFERENCIADOR CRÍTICO EN VENEZUELA · PESO DE BÚSQUEDA 100/100
              </span>
              <h3 className="text-xl md:text-2xl font-black text-white playfair">
                C01.4 · Autonomía Energética e Hídrica 24/7
              </h3>
              <p className="text-slate-300 text-xs mt-1">
                Estos dos atributos posicionan tu propiedad en el filtro principal del buscador de Hoteles de Venezuela.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                tagValues["C01.4.1"]
                  ? "bg-[#00C8D4]/15 border-[#00C8D4] text-white"
                  : "bg-white/5 border-white/15 text-slate-300"
              }`}
            >
              <input
                type="checkbox"
                checked={Boolean(tagValues["C01.4.1"])}
                onChange={(e) => handleTagChange("C01.4.1", e.target.checked)}
                className="mt-1 w-5 h-5 accent-[#00C8D4]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#00C8D4] text-[#0e011f] flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-black text-white">
                    Planta Eléctrica 24/7 (Full Power) · C01.4.1
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Respaldo eléctrico total para aires acondicionados, iluminación, tomacorrientes y áreas comunes ante cualquier eventualidad.
                </p>
              </div>
            </label>

            <label
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                tagValues["C01.4.2"]
                  ? "bg-[#00C8D4]/15 border-[#00C8D4] text-white"
                  : "bg-white/5 border-white/15 text-slate-300"
              }`}
            >
              <input
                type="checkbox"
                checked={Boolean(tagValues["C01.4.2"])}
                onChange={(e) => handleTagChange("C01.4.2", e.target.checked)}
                className="mt-1 w-5 h-5 accent-[#00C8D4]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#FF0096] text-white flex items-center justify-center">
                    <Droplets className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-black text-white">
                    Tanque de Agua Continuo 24/7 · C01.4.2
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Sistema hidroneumático y reserva de agua potable permanente en todas las habitaciones, duchas y servicios.
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Renderizado de Grupos de Etiquetas del Paso Actual */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
        <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF0096] block">
              {activeSubcategoryObj?.code} · {activeSubcategoryObj?.name}
            </span>
            <h3 className="text-xl md:text-2xl font-black text-[#0f172a] playfair mt-1">
              {currentStep?.title}
            </h3>
            <p className="text-slate-500 text-xs mt-1">{currentStep?.subtitle}</p>
          </div>

          <button
            type="button"
            onClick={() => handleSaveStepProgress(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-[#00C8D4]/15 text-[#0f172a] border border-slate-200 font-black text-xs transition-all cursor-pointer shrink-0"
          >
            <Save className="w-4 h-4 text-[#00C8D4]" />
            <span>Guardar Paso</span>
          </button>
        </div>

        {currentStepTagsByGroup.map(({ group, tags }) => {
          const booleanTags = tags.filter((t) => t.dataType === "boolean");
          const inputTags = tags.filter((t) => t.dataType !== "boolean");

          return (
            <div
              key={group.id}
              className="border border-slate-200/80 rounded-2xl p-5 md:p-6 bg-slate-50/40 space-y-5"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-[#0e011f] text-[#00C8D4] text-[10px] font-black uppercase tracking-wider">
                    {group.code}
                  </span>
                  <h4 className="text-sm md:text-base font-black text-[#0f172a]">
                    {group.name}
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  tag_group_id: {group.id}
                </span>
              </div>

              {/* Campos tipo String / Integer / Range */}
              {inputTags.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inputTags.map((tag: MasterTagV15) => {
                    const val = tagValues[tag.code] ?? "";

                    // Desplegable especial para Tipo de Vía (C00.1.18.1)
                    if (tag.code === "C00.1.18.1") {
                      return (
                        <div key={tag.tagId} className="space-y-1.5">
                          <label className="block text-xs font-extrabold text-slate-700">
                            {tag.name}{" "}
                            {tag.isRequired && (
                              <span className="text-[#FF0096] font-black">*</span>
                            )}
                            <span className="text-[10px] text-slate-400 ml-1">
                              ({tag.code})
                            </span>
                          </label>
                          <select
                            value={val}
                            onChange={(e) =>
                              handleTagChange(tag.code, e.target.value)
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C8D4]"
                          >
                            <option value="">Selecciona tipo de vía...</option>
                            {TIPOS_DE_VIA_V15.map((via) => (
                              <option key={via} value={via}>
                                {via}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    // Desplegable especial para Estado de Venezuela (C00.1.18.12)
                    if (tag.code === "C00.1.18.12") {
                      return (
                        <div key={tag.tagId} className="space-y-1.5">
                          <label className="block text-xs font-extrabold text-slate-700">
                            {tag.name}{" "}
                            {tag.isRequired && (
                              <span className="text-[#FF0096] font-black">*</span>
                            )}
                            <span className="text-[10px] text-slate-400 ml-1">
                              ({tag.code})
                            </span>
                          </label>
                          <select
                            value={val}
                            onChange={(e) =>
                              handleTagChange(tag.code, e.target.value)
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C8D4]"
                          >
                            <option value="">Selecciona Estado...</option>
                            {ESTADOS_VENEZUELA_V15.map((est) => (
                              <option key={est} value={est}>
                                {est}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    // Textarea para Descripción Comercial (C00.1.9)
                    if (tag.code === "C00.1.9") {
                      return (
                        <div
                          key={tag.tagId}
                          className="space-y-1.5 md:col-span-2 lg:col-span-3"
                        >
                          <label className="block text-xs font-extrabold text-slate-700">
                            {tag.name}{" "}
                            {tag.isRequired && (
                              <span className="text-[#FF0096] font-black">*</span>
                            )}
                            <span className="text-[10px] text-slate-400 ml-1">
                              ({tag.code} · {String(val).length}/500 car.)
                            </span>
                          </label>
                          <textarea
                            rows={3}
                            maxLength={500}
                            value={val}
                            placeholder={tag.placeholder}
                            onChange={(e) =>
                              handleTagChange(tag.code, e.target.value)
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00C8D4]"
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={tag.tagId} className="space-y-1.5">
                        <label className="block text-xs font-extrabold text-slate-700">
                          {tag.name}{" "}
                          {tag.isRequired && (
                            <span className="text-[#FF0096] font-black">*</span>
                          )}
                          <span className="text-[10px] text-slate-400 ml-1">
                            ({tag.code})
                          </span>
                        </label>
                        <input
                          type={tag.dataType === "integer" ? "number" : "text"}
                          value={val}
                          placeholder={
                            tag.placeholder ||
                            (tag.dataType === "range"
                              ? "Ej. 15:00 - 22:00"
                              : "")
                          }
                          onChange={(e) =>
                            handleTagChange(
                              tag.code,
                              tag.dataType === "integer"
                                ? e.target.value === ""
                                  ? ""
                                  : Number(e.target.value)
                                : e.target.value
                            )
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C8D4]"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Campos tipo Boolean (Checkboxes interactivos) */}
              {booleanTags.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {booleanTags.map((tag: MasterTagV15) => {
                    const checked = Boolean(tagValues[tag.code]);
                    return (
                      <label
                        key={tag.tagId}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          checked
                            ? "bg-[#00C8D4]/10 border-[#00C8D4] text-[#0f172a]"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            handleTagChange(tag.code, e.target.checked)
                          }
                          className="mt-0.5 w-4 h-4 accent-[#00C8D4] shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold block leading-snug">
                            {tag.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {tag.code}
                            {tag.isSearchFilter
                              ? ` · Filtro B2C (Peso ${tag.searchWeight})`
                              : ""}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Constructor Dinámico de Lugares de Interés Cercanos (C00.6.1, C00.6.2 y C00.6.3) en Paso 2 */}
        {currentStep?.includesPoiBuilder && (
          <div className="border-2 border-[#00C8D4]/40 rounded-2xl p-6 bg-[#00C8D4]/5 space-y-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <span className="px-2.5 py-1 rounded-lg bg-[#00C8D4] text-[#0e011f] text-[10px] font-black uppercase tracking-wider">
                  C00.6 · SISTEMA DINÁMICO DE ALREDEDORES
                </span>
                <h4 className="text-base font-black text-[#0f172a] mt-1.5">
                  Distancia desde el Establecimiento a Lugares de Interés (C00.6.1, C00.6.2 y C00.6.3)
                </h4>
                <p className="text-xs text-slate-600">
                  Agrega playas, aeropuertos, parques nacionales, centros comerciales o restaurantes cercanos que se mostrarán en la Guía de la Zona de tu ficha.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-4 space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700 block">
                  C00.6.1 Tipología de Lugar
                </label>
                <select
                  value={newPoiType}
                  onChange={(e) => setNewPoiType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                >
                  {POI_TYPES_V15.map((t) => (
                    <option key={t.code} value={t.code}>
                      {t.code} · {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700 block">
                  C00.6.2 Nombre del Lugar de Interés
                </label>
                <input
                  type="text"
                  value={newPoiName}
                  onChange={(e) => setNewPoiName(e.target.value)}
                  placeholder="Ej. Cayo Sombrero / Centro San Ignacio"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-extrabold text-slate-700 block">
                  C00.6.3 Distancia / Tiempo
                </label>
                <input
                  type="text"
                  value={newPoiDistance}
                  onChange={(e) => setNewPoiDistance(e.target.value)}
                  placeholder="Ej. 1.2 km / 10 min en lancha"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div className="md:col-span-1">
                <button
                  type="button"
                  onClick={handleAddPoi}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#00C8D4] hover:bg-[#00b0bc] text-[#0e011f] font-black text-xs flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                  title="Agregar Punto de Interés"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {poiList.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {poiList.map((poi) => (
                  <div
                    key={poi.id}
                    className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-[#9B00CC] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                      </span>
                      <div className="min-w-0">
                        <span className="text-[10px] font-black text-[#9B00CC] uppercase block">
                          {poi.typeLabel}
                        </span>
                        <span className="text-xs font-extrabold text-slate-800 block truncate">
                          {poi.name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          Distancia: {poi.distanceLabel}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setPoiList((prev) => prev.filter((p) => p.id !== poi.id))
                      }
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tabla Pivote 1: Selección de Unidades Habitacionales Hijas (SCS-17 a SCS-30) para CS-02 */}
        {currentStep?.includesPivotUnits && availablePivotChildren.length > 0 && (
          <div className="border-2 border-[#9B00CC]/30 rounded-2xl p-6 bg-purple-50/30 space-y-4">
            <div>
              <span className="px-2.5 py-1 rounded-lg bg-[#9B00CC] text-white text-[10px] font-black uppercase tracking-wider">
                TABLA PIVOTE 1 · SUBCATEGORY_PARENTS (SCS-17 A SCS-30)
              </span>
              <h4 className="text-base font-black text-[#0f172a] mt-1.5">
                Tipos de Unidades de Alojamiento Disponibles Dentro del Complejo
              </h4>
              <p className="text-xs text-slate-600">
                Selecciona las unidades habitacionales hijas que forman parte de tu {activeSubcategoryObj?.name}:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availablePivotChildren.map((child) => {
                const isSelected = selectedPivotUnitIds.includes(
                  child.childSubcategoryId
                );
                return (
                  <label
                    key={`${child.parentId}-${child.childSubcategoryId}`}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? "bg-[#9B00CC] text-white border-[#9B00CC] shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:border-[#9B00CC]/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPivotUnitIds((prev) => [
                            ...prev,
                            child.childSubcategoryId,
                          ]);
                        } else {
                          setSelectedPivotUnitIds((prev) =>
                            prev.filter((id) => id !== child.childSubcategoryId)
                          );
                        }
                      }}
                      className="w-4 h-4 accent-[#00C8D4]"
                    />
                    <div>
                      <span className="text-xs font-extrabold block">
                        {child.name}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          isSelected ? "text-purple-200" : "text-slate-400"
                        }`}
                      >
                        {child.code} · {child.description}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Constructor Nativo JSONB: Distribución de Unidades Habitacionales (`rooms_distribution`) */}
        {currentStep?.includesRoomsDistributionJsonb && (
          <div className="border-2 border-[#00C8D4]/50 rounded-3xl p-6 md:p-8 bg-[#0e011f] text-white space-y-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/15 pb-5">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00C8D4]/20 border border-[#00C8D4]/40 text-[#00C8D4] text-[10px] font-black uppercase tracking-widest mb-2">
                  <Database className="w-3.5 h-3.5" />
                  <span>ARQUITECTURA POSTGRESQL + JSONB NATIVO (`rooms_distribution`)</span>
                </div>
                <h4 className="text-lg md:text-xl font-black text-white playfair">
                  Unidades de Alojamiento Configuradas en `rooms_distribution` (C05 & C06)
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Administra tus habitaciones, suites, cabañas, camarotes o alquileres íntegros directamente en el arreglo JSONB nativo sin necesidad de tablas relacionales hijas adicionales.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const defaultType =
                    selectedCategoryId === 4
                      ? "Camarote / Charter"
                      : selectedCategoryId === 3
                      ? "Alquiler Íntegro"
                      : selectedCategoryId === 2
                      ? "Bungalow / Cabaña"
                      : "Habitación / Suite";
                  setRoomsDistribution((prev) => [
                    ...prev,
                    {
                      id: `unit-v15-${Date.now()}`,
                      unitName: `${defaultType} #${prev.length + 1}`,
                      unitType: defaultType,
                      quantity: 1,
                      maxOccupancy: 2,
                      sizeSqm: 35,
                      bedroomsCount: 1,
                      privateBathroom: true,
                      privateKitchen: selectedCategoryId === 3 ? "full_kitchen" : "none",
                      kingBeds: 1,
                      queenBeds: 0,
                      singleBeds: 0,
                      sofaBeds: 0,
                      pricePerNightUsd: 95,
                      unitAmenitiesCodes: ["C06.1.2.1", "C06.1.3.1", "C06.3.1.8"],
                    },
                  ]);
                }}
                className="px-5 py-3 rounded-2xl bg-[#00C8D4] hover:bg-[#00b4c0] text-[#0e011f] font-black text-xs flex items-center gap-2 cursor-pointer shrink-0 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir Unidad a `rooms_distribution`</span>
              </button>
            </div>

            <div className="space-y-4">
              {roomsDistribution.map((unit, uIdx) => (
                <div
                  key={unit.id}
                  className="bg-[#1a0533] border border-white/15 rounded-2xl p-5 space-y-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-[#00C8D4] text-[#0e011f] flex items-center justify-center font-black text-xs">
                        <BedDouble className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#00C8D4] block">
                          UNIDAD JSONB #{uIdx + 1} · ID: {unit.id}
                        </span>
                        <span className="text-sm font-black text-white">
                          {unit.unitName || "Unidad sin nombre"}
                        </span>
                      </div>
                    </div>
                    {roomsDistribution.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setRoomsDistribution((prev) =>
                            prev.filter((item) => item.id !== unit.id)
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-300 block mb-1">
                        Nombre de la Unidad (C05.1)
                      </label>
                      <input
                        type="text"
                        value={unit.unitName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRoomsDistribution((prev) =>
                            prev.map((item) =>
                              item.id === unit.id ? { ...item, unitName: val } : item
                            )
                          );
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white focus:outline-none focus:border-[#00C8D4]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-300 block mb-1">
                        Cantidad Disponible
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={unit.quantity}
                        onChange={(e) => {
                          const val = Math.max(1, Number(e.target.value) || 1);
                          setRoomsDistribution((prev) =>
                            prev.map((item) =>
                              item.id === unit.id ? { ...item, quantity: val } : item
                            )
                          );
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white focus:outline-none focus:border-[#00C8D4]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-300 block mb-1">
                        Ocupación Máx. Huéspedes (C05.5)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={unit.maxOccupancy}
                        onChange={(e) => {
                          const val = Math.max(1, Number(e.target.value) || 1);
                          setRoomsDistribution((prev) =>
                            prev.map((item) =>
                              item.id === unit.id ? { ...item, maxOccupancy: val } : item
                            )
                          );
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white focus:outline-none focus:border-[#00C8D4]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-300 block mb-1">
                        Superficie m² (C05.6)
                      </label>
                      <input
                        type="number"
                        min={5}
                        value={unit.sizeSqm}
                        onChange={(e) => {
                          const val = Math.max(5, Number(e.target.value) || 20);
                          setRoomsDistribution((prev) =>
                            prev.map((item) =>
                              item.id === unit.id ? { ...item, sizeSqm: val } : item
                            )
                          );
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white focus:outline-none focus:border-[#00C8D4]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-300 block mb-1">
                        Camas King Size (C05.23)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={unit.kingBeds}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value) || 0);
                          setRoomsDistribution((prev) =>
                            prev.map((item) =>
                              item.id === unit.id ? { ...item, kingBeds: val } : item
                            )
                          );
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white focus:outline-none focus:border-[#00C8D4]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-300 block mb-1">
                        Camas Queen Size (C05.24)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={unit.queenBeds}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value) || 0);
                          setRoomsDistribution((prev) =>
                            prev.map((item) =>
                              item.id === unit.id ? { ...item, queenBeds: val } : item
                            )
                          );
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white focus:outline-none focus:border-[#00C8D4]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-300 block mb-1">
                        Camas Individuales (C05.22)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={unit.singleBeds}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value) || 0);
                          setRoomsDistribution((prev) =>
                            prev.map((item) =>
                              item.id === unit.id ? { ...item, singleBeds: val } : item
                            )
                          );
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white focus:outline-none focus:border-[#00C8D4]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-[#00C8D4] block mb-1">
                        Tarifa Base / Noche ($ USD)
                      </label>
                      <input
                        type="number"
                        min={10}
                        value={unit.pricePerNightUsd}
                        onChange={(e) => {
                          const val = Math.max(1, Number(e.target.value) || 50);
                          setRoomsDistribution((prev) =>
                            prev.map((item) =>
                              item.id === unit.id
                                ? { ...item, pricePerNightUsd: val }
                                : item
                            )
                          );
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-[#00C8D4]/15 border border-[#00C8D4] text-xs font-black text-[#00C8D4] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controles Inferiores de Navegación del Wizard */}
        <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            disabled={currentStepIdx === 0}
            onClick={() => {
              setCurrentStepIdx((prev) => Math.max(0, prev - 1));
              window.scrollTo({ top: 180, behavior: "smooth" });
            }}
            className="px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 font-black text-xs flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Paso Anterior</span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleSaveStepProgress(true)}
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-[#0f172a] font-black text-xs flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#00C8D4]" />
              <span>Guardar y Continuar Después</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="px-7 py-3.5 rounded-2xl text-white font-black text-xs flex items-center gap-2 shadow-lg cursor-pointer"
              style={{
                background:
                  currentStepIdx === steps.length - 1
                    ? "linear-gradient(135deg, #00C8D4 0%, #008c9b 100%)"
                    : "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)",
              }}
            >
              <span>
                {currentStepIdx === steps.length - 1
                  ? "Finalizar y Publicar Configuración V15"
                  : `Guardar y Avanzar al Paso ${currentStepIdx + 2}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

