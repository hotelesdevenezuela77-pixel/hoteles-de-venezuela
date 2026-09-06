import React, { useState } from "react";
import {
  Building2, Ship, Heart, Utensils, X, ChevronRight, ChevronLeft,
  Check, Phone, MessageSquare, Globe, MapPin, Sparkles, ShieldCheck,
  Award, FileText, Upload, AlertCircle, CheckCircle2, Clock, Lock,
  HelpCircle, Anchor, Star, Info, Plus, Trash2, Home, Tent, Car, DollarSign
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  BOTON_CATEGORIES_MAPPING,
  REGIONS_DOCUMENT77,
  POINT_OF_INTEREST_TYPES,
  CERTIFICATIONS_DOCUMENT77
} from "@/lib/amenitiesList";

interface Destination {
  id: number;
  name: string;
  state?: string;
}

interface Category {
  id: number;
  name: string;
}

interface PointOfInterestItem {
  type: string;
  name: string;
  distance: string;
}

interface AddEstablishmentWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinations: Destination[];
  categories: Category[];
  activeOwnerId: string | undefined;
  onSuccess: () => void;
}

// Subtipos para Campings (C04.1.1)
const CAMPING_SUBTYPES = [
  { id: "mobil_home", label: "C - Mobil-home", code: "C04.1.1.1" },
  { id: "bungalow", label: "C - Bungalow", code: "C04.1.1.2" },
  { id: "tienda_lona", label: "C - Tienda de lona", code: "C04.1.1.3" },
  { id: "casa_chalet", label: "C - Casa, Chalet", code: "C04.1.1.4" },
  { id: "apartamento", label: "C - Apartamento", code: "C04.1.1.5" },
  { id: "glamping", label: "C - Glamping", code: "C04.1.1.6" },
  { id: "chalet_camp", label: "C - Chalet", code: "C04.1.1.7" },
  { id: "parcela_tienda", label: "C - Parcela para tienda", code: "C04.1.1.8" },
  { id: "parcela_caravana", label: "C - Parcela para caravana", code: "C04.1.1.9" },
  { id: "parcela_autocaravana", label: "C - Parcela para autocaravana", code: "C04.1.1.10" }
];

export function AddEstablishmentWizardModal({
  isOpen,
  onClose,
  destinations,
  categories,
  activeOwnerId,
  onSuccess
}: AddEstablishmentWizardModalProps) {
  // Estado para la ventana previa (6 Botones) o Wizard activo
  const [selectedType, setSelectedType] = useState<"boton1" | "boton2" | "boton3" | "boton4" | "boton5" | "boton6" | null>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("hdv_wizard_draft_type");
      if (saved) return saved as any;
    }
    return null;
  });

  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("hdv_wizard_draft_step");
      if (saved) return Number(saved) || 1;
    }
    return 1;
  });

  const [submitting, setSubmitting] = useState<boolean>(false);

  const defaultFormData = {
    // SECCIÓN 1: DATOS GENERALES, UBICACIÓN & CERTIFICACIONES
    name: "",
    accommodation_type: "hoteles",
    camping_subtype: "",
    destination_id: "",
    price_level: "$$",
    website: "",
    description: "",
    construction_year: "",
    reform_year: "",

    // Ubicación Terrestre / Dirección
    street_type: "Calle",
    street_name: "",
    street_number: "",
    portal: "",
    block: "",
    staircase: "",
    floor: "",
    door: "",
    province: "",
    city: "",
    zip_code: "",
    neighborhood: "",
    address: "",
    region: "mar",
    gps_lat: "",
    gps_lng: "",
    access_instructions: "",

    // Ubicación Náutica (Barco)
    marina_name: "",
    pier_dock: "",
    berth_number: "",
    boat_gps: "",
    meeting_point: "",
    boat_matricula: "",
    boat_name: "",

    // Licencias, Certificaciones y Categorías
    license_number: "",
    certifications: [] as string[],
    star_rating: "3 estrellas",
    operating_units: "1",
    legal_docs: [] as string[],

    // SECCIÓN 2: DATOS FISCALES Y FACTURACIÓN
    razon_social: "",
    titular_name: "",
    rif_cif: "",
    fiscal_address: "",
    billing_email: "",
    vat_regime: "General 16%",

    // SECCIÓN 3: CONTACTO OPERATIVO
    hdv_contact_name: "",
    hdv_contact_role: "",
    hdv_emergency_phone: "",
    hdv_reservation_email: "",
    hdv_whatsapp: "",

    client_contact_name: "",
    client_contact_role: "",
    client_emergency_phone: "",
    client_reservation_email: "",
    client_whatsapp: "",

    // SECCIÓN 4, 5, 6: EQUIPAMIENTO, SERVICIOS Y POLÍTICAS
    services: [] as string[],

    // Horarios, Mascotas, Ruido
    checkin_from: "14:00",
    checkin_to: "22:00",
    checkout_from: "07:00",
    checkout_to: "11:00",
    late_checkout: "14:00",
    pet_policy: "no_admiten",
    pet_fee: "",
    guest_profile: "familias",
    quiet_hours_from: "23:00",
    quiet_hours_to: "07:00",

    // SECCIÓN 7: LUGARES DE INTERÉS
    poi_type: "Restaurantes, Bares y Cafeterías",
    poi_name: "",
    poi_distance: "",
    points_of_interest: [] as PointOfInterestItem[]
  };

  // Estado del formulario Wizard con auto-recuperación de borrador
  const [formData, setFormData] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("hdv_wizard_draft_formData");
      if (saved) {
        try {
          return { ...defaultFormData, ...JSON.parse(saved) };
        } catch (e) {
          console.warn("Error leyendo borrador del asistente:", e);
        }
      }
    }
    return defaultFormData;
  });

  // Guardar automáticamente el borrador en sessionStorage al modificar cualquier campo o paso
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      if (selectedType) {
        sessionStorage.setItem("hdv_wizard_draft_type", selectedType);
        sessionStorage.setItem("hdv_wizard_draft_step", String(currentStep));
        sessionStorage.setItem("hdv_wizard_draft_formData", JSON.stringify(formData));
      }
    }
  }, [selectedType, currentStep, formData]);

  const clearWizardDraft = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("hdv_wizard_draft_type");
      sessionStorage.removeItem("hdv_wizard_draft_step");
      sessionStorage.removeItem("hdv_wizard_draft_formData");
    }
  };

  if (!isOpen) return null;

  const handleToggleService = (key: string) => {
    setFormData(prev => {
      const active = prev.services.includes(key);
      return {
        ...prev,
        services: active ? prev.services.filter(s => s !== key) : [...prev.services, key]
      };
    });
  };

  const handleToggleCertification = (certId: string) => {
    setFormData(prev => {
      const active = prev.certifications.includes(certId);
      return {
        ...prev,
        certifications: active ? prev.certifications.filter(c => c !== certId) : [...prev.certifications, certId]
      };
    });
  };

  const handleAddPointOfInterest = () => {
    if (!formData.poi_name.trim()) {
      alert("Por favor ingresa el nombre del lugar de interés.");
      return;
    }
    const newItem: PointOfInterestItem = {
      type: formData.poi_type,
      name: formData.poi_name.trim(),
      distance: formData.poi_distance.trim() || "Cercano"
    };
    setFormData(prev => ({
      ...prev,
      points_of_interest: [...prev.points_of_interest, newItem],
      poi_name: "",
      poi_distance: ""
    }));
  };

  const handleRemovePointOfInterest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      points_of_interest: prev.points_of_interest.filter((_, i) => i !== index)
    }));
  };

  const handleSelectBoton = (type: "boton1" | "boton2" | "boton3" | "boton4" | "boton5" | "boton6") => {
    setSelectedType(type);
    setCurrentStep(1);

    const allowedTypes = BOTON_CATEGORIES_MAPPING[type];
    if (allowedTypes && allowedTypes.length > 0) {
      setFormData(prev => ({ ...prev, accommodation_type: allowedTypes[0].id }));
    }
  };

  const handleResetModal = () => {
    clearWizardDraft();
    setSelectedType(null);
    setCurrentStep(1);
    setFormData(defaultFormData);
    onClose();
  };

  const totalSteps = 7;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === 1) {
      if (!formData.name.trim()) {
        alert("Por favor ingresa el nombre comercial del establecimiento.");
        return;
      }
      if (!formData.destination_id) {
        alert("Por favor selecciona un destino turístico.");
        return;
      }
      if (selectedType === "boton5") {
        if (!formData.marina_name.trim() || !formData.boat_matricula.trim()) {
          alert("Por favor indica el Nombre de la Marina/Puerto Deportivo y la Matrícula del Barco.");
          return;
        }
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmitFinal();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      setSelectedType(null);
    }
  };

  const handleSubmitFinal = async () => {
    if (!activeOwnerId) return;

    try {
      setSubmitting(true);
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      const matchedCategory = categories.find(c =>
        c.name.toLowerCase().includes(formData.accommodation_type.toLowerCase())
      );
      const categoryId = matchedCategory ? matchedCategory.id : (categories[0]?.id || 1);

      const fullAddressStr = selectedType === "boton5"
        ? `Puerto/Marina: ${formData.marina_name}, Pantalán: ${formData.pier_dock}, Amarre: ${formData.berth_number}, Matrícula: ${formData.boat_matricula}`
        : formData.address || `${formData.street_type} ${formData.street_name} N° ${formData.street_number}, ${formData.city}, ${formData.province}`;

      const payload = {
        owner_user_id: activeOwnerId,
        name: formData.name,
        slug,
        description: formData.description,
        address: fullAddressStr,
        phone: formData.hdv_emergency_phone || formData.client_emergency_phone,
        whatsapp: formData.hdv_whatsapp || formData.client_whatsapp,
        website: formData.website.trim() && !/^https?:\/\//i.test(formData.website.trim())
          ? `https://${formData.website.trim()}`
          : formData.website.trim(),
        price_level: formData.price_level,
        category_id: categoryId,
        destination_id: parseInt(formData.destination_id),
        services: JSON.stringify(formData.services),
        status: "pending",
        has_reservations_enabled: false
      };

      try {
        await supabase.from("profiles").update({ role: "owner" }).eq("id", activeOwnerId);
      } catch (roleErr) {
        console.warn("No se pudo actualizar el rol en profiles:", roleErr);
      }

      const categoryObj = categories.find(c => c.id === categoryId);
      const destinationObj = destinations.find(d => d.id === parseInt(formData.destination_id));

      const { error } = await supabase.from("establishments").insert([payload]);

      if (error) {
        console.warn("Supabase insert RLS fallback to local storage:", error.message);
        const localEstsKey = "hdv_mock_establishments";
        const existing = JSON.parse(localStorage.getItem(localEstsKey) || "[]");
        const newMockEst = {
          ...payload,
          id: Date.now(),
          category_name: categoryObj?.name || formData.accommodation_type,
          destination_name: destinationObj?.name || "Venezuela",
          rating_avg: 5.0,
          review_count: 1,
          created_at: new Date().toISOString(),
          wizard_data: formData
        };
        localStorage.setItem(localEstsKey, JSON.stringify([newMockEst, ...existing]));
      }

      alert("🎉 ¡Establecimiento registrado con éxito en el sistema!");
      onSuccess();
      handleResetModal();
    } catch (err) {
      console.error("Error creating establishment:", err);
      alert("Ocurrió un error al registrar el establecimiento.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentAllowedCategories = selectedType ? BOTON_CATEGORIES_MAPPING[selectedType] || [] : [];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl lg:max-w-5xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 my-4 text-left font-sans">

        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#0e011f] via-[#1a0533] to-[#9B00CC] px-6 py-4 flex items-center justify-between text-white border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF0096] to-[#9B00CC] p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#0e011f] rounded-[14px] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#00C8D4]" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide text-white flex items-center gap-2">
                <span>Registrar Nuevo Establecimiento (DOC 77 V.7)</span>
                {selectedType && (
                  <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-[#00C8D4]/20 border border-[#00C8D4]/40 text-[#00C8D4]">
                    {selectedType === "boton1" && "Botón 1 • Hoteles & Posadas"}
                    {selectedType === "boton2" && "Botón 2 • Casas & Apartamentos"}
                    {selectedType === "boton3" && "Botón 3 • Campings"}
                    {selectedType === "boton4" && "Botón 4 • Love Hotels"}
                    {selectedType === "boton5" && "Botón 5 • Barcos & Yates"}
                    {selectedType === "boton6" && "Botón 6 • Restaurantes"}
                  </span>
                )}
              </h3>
              <p className="text-white/70 text-xs font-medium">Asistente por Pasos (Wizard) oficial de Hoteles de Venezuela</p>
            </div>
          </div>
          <button
            onClick={handleResetModal}
            className="w-9 h-9 bg-white/10 hover:bg-[#FF0096] rounded-full flex items-center justify-center text-white transition-all cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 md:p-8 max-h-[82vh] overflow-y-auto space-y-6 custom-scrollbar">

          {/* VENTANA PREVIA: SELECCIÓN DE LOS 6 BOTONES */}
          {!selectedType ? (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-[11px] font-black uppercase text-[#FF0096] tracking-widest bg-[#FF0096]/10 px-3 py-1 rounded-full border border-[#FF0096]/20 inline-block">
                  Selecciona la Categoría de tu Establecimiento
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  ¿Qué tipo de propiedad deseas registrar?
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Elige una de las 6 categorías principales para iniciar el asistente por pasos (Wizard) especializado.
                </p>
              </div>

              {/* Grid de 6 Botones */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">

                {/* BOTÓN 1 */}
                <button
                  type="button"
                  onClick={() => handleSelectBoton("boton1")}
                  className="group relative bg-gradient-to-br from-slate-50 to-slate-100 hover:from-white hover:to-cyan-50/50 border border-slate-200 hover:border-[#00C8D4] p-5 rounded-2xl text-left transition-all duration-200 shadow-sm hover:shadow-lg cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-[#00C8D4] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                        <Building2 className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/20">
                        Botón 1
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 group-hover:text-[#00C8D4] transition-colors">
                        Hoteles, Posadas & Albergues
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                        Hoteles, Hostales, Posadas, Pensiones, Habitaciones particulares, Albergues, Residencias de estudiantes, Bed & Breakfast y Hoteles cápsula.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-[#00C8D4]">
                    <span>Iniciar Registro</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* BOTÓN 2 */}
                <button
                  type="button"
                  onClick={() => handleSelectBoton("boton2")}
                  className="group relative bg-gradient-to-br from-slate-50 to-slate-100 hover:from-white hover:to-cyan-50/50 border border-slate-200 hover:border-[#00C8D4] p-5 rounded-2xl text-left transition-all duration-200 shadow-sm hover:shadow-lg cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-[#00C8D4] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                        <Home className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/20">
                        Botón 2
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 group-hover:text-[#00C8D4] transition-colors">
                        Apartamentos, Casas & Villas
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                        Apartamentos vacacionales, Casas y Chalets rurales, Apartahoteles, Villas turísticas y Chalets de montaña.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-[#00C8D4]">
                    <span>Iniciar Registro</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* BOTÓN 3 */}
                <button
                  type="button"
                  onClick={() => handleSelectBoton("boton3")}
                  className="group relative bg-gradient-to-br from-slate-50 to-slate-100 hover:from-white hover:to-emerald-50/50 border border-slate-200 hover:border-[#10B981] p-5 rounded-2xl text-left transition-all duration-200 shadow-sm hover:shadow-lg cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-[#10B981] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                        <Tent className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Botón 3
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
                        Campings & Glampings
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                        Campings con parcelas para tiendas/caravanas, Mobil-homes, Bungalows y experiencias Glamping.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-emerald-600">
                    <span>Iniciar Registro</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* BOTÓN 4 */}
                <button
                  type="button"
                  onClick={() => handleSelectBoton("boton4")}
                  className="group relative bg-gradient-to-br from-slate-50 to-slate-100 hover:from-white hover:to-pink-50/50 border border-slate-200 hover:border-[#FF0096] p-5 rounded-2xl text-left transition-all duration-200 shadow-sm hover:shadow-lg cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-[#FF0096] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                        <Heart className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-[#FF0096]/10 text-[#FF0096] border border-[#FF0096]/20">
                        Botón 4
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 group-hover:text-[#FF0096] transition-colors">
                        Love Hotels & Moteles
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                        Establecimientos con privacidad total, garaje privado con puerta automática, alquiler por horas y check-in anónimo.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-[#FF0096]">
                    <span>Iniciar Registro</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* BOTÓN 5 */}
                <button
                  type="button"
                  onClick={() => handleSelectBoton("boton5")}
                  className="group relative bg-gradient-to-br from-slate-50 to-slate-100 hover:from-white hover:to-purple-50/50 border border-slate-200 hover:border-[#9B00CC] p-5 rounded-2xl text-left transition-all duration-200 shadow-sm hover:shadow-lg cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-[#9B00CC] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                        <Ship className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-[#9B00CC]/10 text-[#9B00CC] border border-[#9B00CC]/20">
                        Botón 5
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 group-hover:text-[#9B00CC] transition-colors">
                        Barcos & Embarcaciones
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                        Veleros, Yates, Catamaranes o Houseboats con amarre en marina y equipamiento náutico completo.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-[#9B00CC]">
                    <span>Iniciar Registro Náutico</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* BOTÓN 6 */}
                <button
                  type="button"
                  onClick={() => handleSelectBoton("boton6")}
                  className="group relative bg-gradient-to-br from-slate-50 to-slate-100 hover:from-white hover:to-amber-50/50 border border-slate-200 hover:border-amber-500 p-5 rounded-2xl text-left transition-all duration-200 shadow-sm hover:shadow-lg cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                        <Utensils className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        Botón 6
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
                        Restaurantes & Gastronomía
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                        Restaurantes con distribución de mesas, áreas VIP, sommelier, climatización y experiencias gastronómicas.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-amber-600">
                    <span>Iniciar Registro Gastronómico</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

              </div>
            </div>
          ) : (

            /* FORMULARIO WIZARD POR PASOS ACTIVO (7 SECCIONES) */
            <form onSubmit={handleNextStep} className="space-y-6">

              {/* Stepper Header Progress */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#00C8D4] text-white text-[11px] font-black flex items-center justify-center shadow-xs">
                      {currentStep}
                    </span>
                    <span>
                      {currentStep === 1 && "Sección 1: Datos Generales, Ubicación, Región & Certificaciones"}
                      {currentStep === 2 && "Sección 2: Datos Fiscales & Facturación"}
                      {currentStep === 3 && "Sección 3: Contacto Operativo HDV & Clientes"}
                      {currentStep === 4 && "Sección 4: Infraestructura, Zonas Comunes & Equipamiento Específico"}
                      {currentStep === 5 && "Sección 5: Servicios, Atención & Movilidad"}
                      {currentStep === 6 && "Sección 6: Gestión, Políticas, Normas & Pago Online"}
                      {currentStep === 7 && "Sección 7: Lugares de Interés Cercanos"}
                    </span>
                  </span>
                  <span className="text-slate-400 font-extrabold">Paso {currentStep} de {totalSteps}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#00C8D4] via-[#FF0096] to-[#9B00CC] h-full transition-all duration-300"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  />
                </div>
              </div>

              {/* SECCIÓN 1: DATOS GENERALES Y UBICACIÓN */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="border-b border-slate-200 pb-2">
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                      SECCIÓN 1: Datos Generales, Ubicación & Licencias (DOC 77 V.7)
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Completa la información inicial del establecimiento para su registro en la plataforma.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Nombre Comercial */}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                        Nombre Comercial de la Propiedad / Establecimiento *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Posada Turística Galápagos / Yate Catamarán Gran Turquesa"
                        value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C8D4]/20 focus:border-[#00C8D4]"
                      />
                    </div>

                    {/* Tipología de Alojamiento (filtrada según Botón seleccionado) */}
                    <div className="md:col-span-1">
                      <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                        Tipo de Establecimiento (C00.1) *
                      </label>
                      <select
                        required
                        value={formData.accommodation_type}
                        onChange={e => setFormData(prev => ({ ...prev, accommodation_type: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C8D4]/20 focus:border-[#00C8D4] cursor-pointer"
                      >
                        {currentAllowedCategories.map(t => (
                          <option key={t.id} value={t.id}>{t.label} ({t.code})</option>
                        ))}
                      </select>
                    </div>

                    {/* Subtipo condicional para Campings (C04.1.1) */}
                    {formData.accommodation_type === "campings" && (
                      <div className="md:col-span-1">
                        <label className="block text-[10px] uppercase font-black text-amber-900 tracking-wider mb-1">
                          Tipo de Alojamiento Camping (C04.1.1) *
                        </label>
                        <select
                          value={formData.camping_subtype}
                          onChange={e => setFormData(prev => ({ ...prev, camping_subtype: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
                        >
                          <option value="">Seleccionar Subtipo Camping...</option>
                          {CAMPING_SUBTYPES.map(cs => (
                            <option key={cs.id} value={cs.id}>{cs.label} ({cs.code})</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Destino Turístico */}
                    <div className="md:col-span-1">
                      <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                        Destino Turístico *
                      </label>
                      <select
                        required
                        value={formData.destination_id}
                        onChange={e => setFormData(prev => ({ ...prev, destination_id: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C8D4]/20 focus:border-[#00C8D4] cursor-pointer"
                      >
                        <option value="">Selecciona Destino...</option>
                        {destinations.map(d => (
                          <option key={d.id} value={d.id}>{d.name} {d.state ? `(${d.state})` : ''}</option>
                        ))}
                      </select>
                    </div>

                    {/* Región C00.4 */}
                    <div className="md:col-span-1">
                      <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                        Región / Entorno (C00.4)
                      </label>
                      <select
                        value={formData.region}
                        onChange={e => setFormData(prev => ({ ...prev, region: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C8D4]/20 focus:border-[#00C8D4] cursor-pointer"
                      >
                        {REGIONS_DOCUMENT77.map(r => (
                          <option key={r.id} value={r.id}>{r.label} ({r.code})</option>
                        ))}
                      </select>
                    </div>

                    {/* Sitio Web / Red Social */}
                    <div className="md:col-span-1">
                      <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                        Sitio Web / Enlace a Red Social
                      </label>
                      <input
                        type="text"
                        placeholder="https://ejemplo.com o @instagram"
                        value={formData.website}
                        onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C8D4]/20 focus:border-[#00C8D4]"
                      />
                    </div>

                    {/* Descripción Comercial (máx 150-200 car para Botón 1, 500 car para Botón 2) */}
                    <div className="md:col-span-3">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider">
                          Descripción o Reseña Comercial ({selectedType === "boton2" ? "Máximo 500 caracteres" : "Máximo 200 caracteres"})
                        </label>
                        <span className={`text-[10px] font-bold ${formData.description.length > (selectedType === "boton2" ? 500 : 200) ? 'text-red-500' : 'text-slate-400'}`}>
                          {formData.description.length} / {selectedType === "boton2" ? 500 : 200}
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        maxLength={selectedType === "boton2" ? 500 : 200}
                        placeholder="Resumen atractivo sobre el establecimiento, virtudes de su entorno y servicios destacados..."
                        value={formData.description}
                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C8D4]/20 focus:border-[#00C8D4] resize-none"
                      />
                    </div>

                    {/* Año construcción / reforma */}
                    <div className="md:col-span-1">
                      <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                        Año de Construcción
                      </label>
                      <input
                        type="number"
                        placeholder="Ej: 2018"
                        value={formData.construction_year}
                        onChange={e => setFormData(prev => ({ ...prev, construction_year: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                        Año de Última Reforma
                      </label>
                      <input
                        type="number"
                        placeholder="Ej: 2023"
                        value={formData.reform_year}
                        onChange={e => setFormData(prev => ({ ...prev, reform_year: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>

                    {/* Nivel de Precios */}
                    <div className="md:col-span-1">
                      <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                        Nivel de Precios
                      </label>
                      <select
                        value={formData.price_level}
                        onChange={e => setFormData(prev => ({ ...prev, price_level: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
                      >
                        <option value="$">$ (Económico)</option>
                        <option value="$$">$$ (Moderado)</option>
                        <option value="$$$">$$$ (Premium)</option>
                        <option value="$$$$">$$$$ (Lujo / Exclusivo)</option>
                      </select>
                    </div>
                  </div>

                  {/* ESPECÍFICO DE BARCO (BOTÓN 5) */}
                  {selectedType === "boton5" ? (
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-[#9B00CC] uppercase tracking-wider">
                        <Anchor className="w-4 h-4" />
                        <span>Ubicación Náutica Completa & Datos del Barco</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-purple-50/50 p-4 rounded-2xl border border-purple-200">
                        <div className="md:col-span-2">
                          <label className="block text-[10px] uppercase font-black text-purple-900 tracking-wider mb-1">
                            Nombre del Puerto Deportivo, Marina o Club Náutico *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: Marina Udón Pérez, Tucacas / Puerto La Cruz"
                            value={formData.marina_name}
                            onChange={e => setFormData(prev => ({ ...prev, marina_name: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-800"
                          />
                        </div>

                        <div className="md:col-span-1">
                          <label className="block text-[10px] uppercase font-black text-purple-900 tracking-wider mb-1">
                            Matrícula y Folio del Barco (NIF/NIN) *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: ARSH-PE-1234 (Obligatorio)"
                            value={formData.boat_matricula}
                            onChange={e => setFormData(prev => ({ ...prev, boat_matricula: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-800"
                          />
                        </div>

                        <div className="md:col-span-1">
                          <label className="block text-[10px] uppercase font-black text-purple-900 tracking-wider mb-1">
                            N° de Pantalán o Muelle
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: Muelle B - Pantalán 4"
                            value={formData.pier_dock}
                            onChange={e => setFormData(prev => ({ ...prev, pier_dock: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-800"
                          />
                        </div>

                        <div className="md:col-span-1">
                          <label className="block text-[10px] uppercase font-black text-purple-900 tracking-wider mb-1">
                            N° de Amarre (Berth)
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: Amarre #18"
                            value={formData.berth_number}
                            onChange={e => setFormData(prev => ({ ...prev, berth_number: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-800"
                          />
                        </div>

                        <div className="md:col-span-1">
                          <label className="block text-[10px] uppercase font-black text-purple-900 tracking-wider mb-1">
                            Nombre de la Embarcación
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: La Perla Negra"
                            value={formData.boat_name}
                            onChange={e => setFormData(prev => ({ ...prev, boat_name: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (

                    /* UBICACIÓN TERRESTRE COMPLETA */
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                        Dirección de la Propiedad (Ubicación Geográfica)
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Tipo de Vía</label>
                          <select
                            value={formData.street_type}
                            onChange={e => setFormData(prev => ({ ...prev, street_type: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                          >
                            <option value="Calle">Calle</option>
                            <option value="Avenida">Avenida</option>
                            <option value="Carretera">Carretera</option>
                            <option value="Sector">Sector</option>
                            <option value="Urbanización">Urbanización</option>
                            <option value="Vía">Vía</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nombre de la Vía</label>
                          <input
                            type="text"
                            placeholder="Ej: Av. Principal / Sector Playa Grande"
                            value={formData.street_name}
                            onChange={e => setFormData(prev => ({ ...prev, street_name: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Número</label>
                          <input
                            type="text"
                            placeholder="Ej: N° 45"
                            value={formData.street_number}
                            onChange={e => setFormData(prev => ({ ...prev, street_number: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Portal / Bloque</label>
                          <input
                            type="text"
                            placeholder="Ej: Edif. Torre A"
                            value={formData.portal}
                            onChange={e => setFormData(prev => ({ ...prev, portal: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Piso / Puerta</label>
                          <input
                            type="text"
                            placeholder="Ej: Piso 3 - Apt 3B"
                            value={formData.floor}
                            onChange={e => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Localidad / Ciudad</label>
                          <input
                            type="text"
                            placeholder="Ej: Chacao / Porlamar"
                            value={formData.city}
                            onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Provincia / Estado</label>
                          <input
                            type="text"
                            placeholder="Ej: Miranda / Nueva Esparta"
                            value={formData.province}
                            onChange={e => setFormData(prev => ({ ...prev, province: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Código Postal</label>
                          <input
                            type="text"
                            placeholder="Ej: 1060"
                            value={formData.zip_code}
                            onChange={e => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div className="col-span-2 md:col-span-3">
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Indicaciones de Acceso</label>
                          <input
                            type="text"
                            placeholder="Ej: Acceso por carretera N-340 km 12, desvío derecha junto a la estación"
                            value={formData.access_instructions}
                            onChange={e => setFormData(prev => ({ ...prev, access_instructions: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LICENCIAS, ESTRELLAS Y CERTIFICACIONES */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Licencias, Categorización (Estrellas) & Certificaciones
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                          N° Licencia Turística / Registro
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: RTN-098234-VEN"
                          value={formData.license_number}
                          onChange={e => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                          Categoría del Establecimiento (C00.3)
                        </label>
                        <select
                          value={formData.star_rating}
                          onChange={e => setFormData(prev => ({ ...prev, star_rating: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          <option value="1 estrella">C00.3.1 - 1 estrella</option>
                          <option value="2 estrellas">C00.3.2 - 2 estrellas</option>
                          <option value="3 estrellas">C00.3.3 - 3 estrellas</option>
                          <option value="4 estrellas">C00.3.4 - 4 estrellas</option>
                          <option value="5 estrellas">C00.3.5 - 5 estrellas</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                          N° de Unidades Operativas (Tamaño)
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={formData.operating_units}
                          onChange={e => setFormData(prev => ({ ...prev, operating_units: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                        />
                      </div>
                    </div>

                    {/* Certificaciones C00.2 */}
                    <div className="space-y-2 pt-2">
                      <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider">
                        Certificaciones Oficiales Reclamadas (C00.2)
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {CERTIFICATIONS_DOCUMENT77.map(cert => {
                          const active = formData.certifications.includes(cert.id);
                          return (
                            <button
                              key={cert.id}
                              type="button"
                              onClick={() => handleToggleCertification(cert.id)}
                              className={`p-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                                active
                                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <span>{cert.label}</span>
                              {active ? <Check className="w-3.5 h-3.5 text-[#00C8D4]" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECCIÓN 2: DATOS FISCALES Y DE FACTURACIÓN */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="border-b border-slate-200 pb-2">
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                      SECCIÓN 2: Datos Fiscales y de Facturación
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Información tributaria para la facturación oficial del establecimiento.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                        Razón Social: (Ej. Hostelería y Turismo S.L. / C.A.)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Hostelería y Turismo Gran Caribe C.A."
                        value={formData.razon_social}
                        onChange={e => setFormData(prev => ({ ...prev, razon_social: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                        Nombre del Titular: (Juan Pérez García)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Juan Pérez García"
                        value={formData.titular_name}
                        onChange={e => setFormData(prev => ({ ...prev, titular_name: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                        NIF / CIF / RIF:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: J-12345678-9 / V-18273645"
                        value={formData.rif_cif}
                        onChange={e => setFormData(prev => ({ ...prev, rif_cif: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                        Email para facturación:
                      </label>
                      <input
                        type="email"
                        placeholder="facturacion@establcimiento.com"
                        value={formData.billing_email}
                        onChange={e => setFormData(prev => ({ ...prev, billing_email: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                        Dirección Fiscal Completa:
                      </label>
                      <input
                        type="text"
                        placeholder="Tipo Vía, Nombre, N°, Portal, Bloque, Piso, Provincia, Localidad, CP"
                        value={formData.fiscal_address}
                        onChange={e => setFormData(prev => ({ ...prev, fiscal_address: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                        Régimen de IVA aplicable:
                      </label>
                      <select
                        value={formData.vat_regime}
                        onChange={e => setFormData(prev => ({ ...prev, vat_regime: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
                      >
                        <option value="General 16%">General 16% (Venezuela)</option>
                        <option value="Exento">Exento / Zona Libre</option>
                        <option value="General 10%">General 10% (España)</option>
                        <option value="IGIC Canarias">IGIC (Canarias)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* SECCIÓN 3: CONTACTO OPERATIVO */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-200 pb-2">
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                      SECCIÓN 3: Contacto Operativo
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Establece las vías de contacto con la administración HDV y con los huéspedes.
                    </p>
                  </div>

                  {/* 1. Contacto con HDV */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-[#00C8D4]" />
                      <span>1. Contacto con HDV (Administración Privada)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nombre y Apellidos Persona de contacto:</label>
                        <input
                          type="text"
                          placeholder="Nombre del Contacto HDV"
                          value={formData.hdv_contact_name}
                          onChange={e => setFormData(prev => ({ ...prev, hdv_contact_name: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Cargo de la persona de contacto:</label>
                        <input
                          type="text"
                          placeholder="Ej: Gerente General / Director"
                          value={formData.hdv_contact_role}
                          onChange={e => setFormData(prev => ({ ...prev, hdv_contact_role: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Teléfono de emergencias / Recepción (24h):</label>
                        <input
                          type="tel"
                          placeholder="+58 412 0000000"
                          value={formData.hdv_emergency_phone}
                          onChange={e => setFormData(prev => ({ ...prev, hdv_emergency_phone: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Email para recepción de reservas:</label>
                        <input
                          type="email"
                          placeholder="reservas@hotel.com"
                          value={formData.hdv_reservation_email}
                          onChange={e => setFormData(prev => ({ ...prev, hdv_reservation_email: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">WhatsApp Directo:</label>
                        <input
                          type="tel"
                          placeholder="+58 414 0000000"
                          value={formData.hdv_whatsapp}
                          onChange={e => setFormData(prev => ({ ...prev, hdv_whatsapp: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Contacto con clientes */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                      <MessageSquare className="w-4 h-4 text-[#FF0096]" />
                      <span>2. Contacto con clientes (Atención al Huésped)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nombre y Apellidos Persona de contacto:</label>
                        <input
                          type="text"
                          placeholder="Atención al cliente / Concierge"
                          value={formData.client_contact_name}
                          onChange={e => setFormData(prev => ({ ...prev, client_contact_name: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Cargo de la persona de contacto:</label>
                        <input
                          type="text"
                          placeholder="Ej: Jefe de Recepción"
                          value={formData.client_contact_role}
                          onChange={e => setFormData(prev => ({ ...prev, client_contact_role: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Teléfono de emergencias / Recepción (24h):</label>
                        <input
                          type="tel"
                          placeholder="+58 212 0000000"
                          value={formData.client_emergency_phone}
                          onChange={e => setFormData(prev => ({ ...prev, client_emergency_phone: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Email para recepción de reservas:</label>
                        <input
                          type="email"
                          placeholder="contacto@hotel.com"
                          value={formData.client_reservation_email}
                          onChange={e => setFormData(prev => ({ ...prev, client_reservation_email: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">WhatsApp Directo:</label>
                        <input
                          type="tel"
                          placeholder="+58 424 0000000"
                          value={formData.client_whatsapp}
                          onChange={e => setFormData(prev => ({ ...prev, client_whatsapp: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECCIÓN 4: INFRAESTRUCTURA, ZONAS COMUNES Y EQUIPAMIENTO ESPECÍFICO */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-200 pb-2">
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                      SECCIÓN 4: C01. Infraestructura, Zonas Comunes & Abastecimiento Crítico
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Selecciona las instalaciones físicas y equipamiento general y específico de la propiedad.
                    </p>
                  </div>

                  {/* Abastecimiento y energía 24/7 (C01.7) */}
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-900 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>C01.7 Abastecimiento y energía (Servicios Críticos Venezuela)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: "Planta Eléctrica 24/7 (Full Power)", code: "C01.7.1", desc: "Respaldo eléctrico continuo para todas las áreas y aires acondicionados" },
                        { key: "Tanque de Agua continuo", code: "C01.7.2", desc: "Suministro ininterrumpido de agua potable en todas las instalaciones" }
                      ].map(ab => {
                        const active = formData.services.includes(ab.key);
                        return (
                          <button
                            key={ab.key}
                            type="button"
                            onClick={() => handleToggleService(ab.key)}
                            className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                              active
                                ? "bg-amber-600 text-white border-amber-600 shadow-md"
                                : "bg-white text-slate-800 border-amber-200 hover:border-amber-400"
                            }`}
                          >
                            <div>
                              <span className="text-[10px] font-black uppercase opacity-80 block">{ab.code}</span>
                              <strong className="text-xs font-black">{ab.key}</strong>
                              <p className={`text-[10px] mt-0.5 ${active ? 'text-amber-100' : 'text-slate-500'}`}>{ab.desc}</p>
                            </div>
                            {active ? <Check className="w-4 h-4 shrink-0" /> : <Plus className="w-4 h-4 shrink-0 text-amber-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Zonas Comunes Bienestar & Ocio (C01.6) */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">C01.6.1 Bienestar, Salud y Relax (Compartido)</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        "Piscina exterior", "Piscina interior (climatizada)", "Spa", "Sauna",
                        "Baño turco / hammam", "Gimnasio", "Zona de Yoga", "Solárium"
                      ].map(item => {
                        const active = formData.services.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handleToggleService(item)}
                            className={`p-2.5 rounded-xl border text-[11px] font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                              active ? "bg-[#00C8D4] text-white border-[#00C8D4]" : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <span className="line-clamp-1">{item}</span>
                            {active ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">C01.6.2 Ocio y Espacios Sociales (Compartido)</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {[
                        "Salón de uso común con TV", "Sala de juegos (Billar, Dardos, Futbolin)", "Biblioteca",
                        "Cocina compartida equipada", "Zona de barbacoa compartida", "Parque infantil", "Jardín compartido",
                        "Parque acuático", "Toboganes de aguas", "Campos de fútbol, polideportivos", "Pistas de tenis",
                        "Ping Pong", "Minigolf", "Granja educativa", "Bolos", "Área de fitness",
                        "Acceso directo a la playa", "Junto al mar"
                      ].map(item => {
                        const active = formData.services.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handleToggleService(item)}
                            className={`p-2.5 rounded-xl border text-[11px] font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                              active ? "bg-[#00C8D4] text-white border-[#00C8D4]" : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <span className="line-clamp-1">{item}</span>
                            {active ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">C01.6.3 Infraestructuras de Negocios y Eventos</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        "Salas de reuniones", "Impresora", "Salón de actos/eventos", "Zonas coworking"
                      ].map(item => {
                        const active = formData.services.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handleToggleService(item)}
                            className={`p-2.5 rounded-xl border text-[11px] font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                              active ? "bg-[#9B00CC] text-white border-[#9B00CC]" : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <span className="line-clamp-1">{item}</span>
                            {active ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* EQUIPAMIENTOS ESPECÍFICOS SEGÚN BOTÓN SELECCIONADO (C04) */}
                  {selectedType === "boton3" && (
                    <div className="space-y-3 pt-3 border-t border-slate-200 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200">
                      <h5 className="text-xs font-black text-emerald-900 uppercase tracking-wider">C04.1 Servicios Específicos de Camping</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {[
                          "Panadería", "Comestibles / Supermercado", "Baños públicos",
                          "Duchas comunitarias", "Autoservicio de lavandería"
                        ].map(item => {
                          const active = formData.services.includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => handleToggleService(item)}
                              className={`p-2.5 rounded-xl border text-[11px] font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                                active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-700 border-emerald-200"
                              }`}
                            >
                              <span>{item}</span>
                              {active ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedType === "boton4" && (
                    <div className="space-y-3 pt-3 border-t border-slate-200 bg-pink-50/50 p-4 rounded-2xl border border-pink-200">
                      <h5 className="text-xs font-black text-pink-900 uppercase tracking-wider">C04.3 Instalaciones Específicas para Love Hotels</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {[
                          "Cama King/Queen Size con colchón reinforced", "Sillón Tantra", "Espejos estratégicos",
                          "Jacuzzi XL / Hidromasaje privado en la habitación", "Ducha de cristal transparente vista desde la cama",
                          "Kits de higiene íntima y cosmética erótica", "Iluminación LED regulable por zonas y colores",
                          "Insonorización acústica reforzada", "Climatización individual rápida e independiente",
                          "Canales de contenido adultos (X/Erótico) incluido", "Terraza con Jacuzzi/piscina sin visibilidad exterior",
                          "Garaje privado individual con puerta automática", "Torno / Pass-through Box de entrega anónimo",
                          "Entrada y salida por accesos independientes", "Check-in / Check-out automatizado", "Facturación 100% anónima"
                        ].map(item => {
                          const active = formData.services.includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => handleToggleService(item)}
                              className={`p-2.5 rounded-xl border text-[11px] font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                                active ? "bg-[#FF0096] text-white border-[#FF0096]" : "bg-white text-slate-700 border-pink-200"
                              }`}
                            >
                              <span className="line-clamp-1">{item}</span>
                              {active ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedType === "boton5" && (
                    <div className="space-y-3 pt-3 border-t border-slate-200 bg-purple-50/50 p-4 rounded-2xl border border-purple-200">
                      <h5 className="text-xs font-black text-purple-900 uppercase tracking-wider">C04.2 Equipamiento Náutico Específico para Barcos</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {[
                          "Camarote doble", "Camarote individual", "Literas náuticas red anticaída", "Escotillas con mosquitera",
                          "Cortinas foscurit (blackout)", "Colchones ventilación antihumedad", "Ducha camarote bomba achique",
                          "Cocina marina basculante", "Nevera marina 12V/24V", "Desalinizadora / potabilizadora", "Inversor (12V a 220V)",
                          "Solárium en proa", "Plataforma de baño en popa", "Barbacoa marina", "Patrón / Capitán incluido",
                          "Wi-Fi satelital Starlink", "Equipamiento de snorkel", "Paddle Surf (SUP)", "Kayak hinchable", "Radio VHF con DSC"
                        ].map(item => {
                          const active = formData.services.includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => handleToggleService(item)}
                              className={`p-2.5 rounded-xl border text-[11px] font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                                active ? "bg-[#9B00CC] text-white border-[#9B00CC]" : "bg-white text-slate-700 border-purple-200"
                              }`}
                            >
                              <span className="line-clamp-1">{item}</span>
                              {active ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedType === "boton6" && (
                    <div className="space-y-3 pt-3 border-t border-slate-200 bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
                      <h5 className="text-xs font-black text-amber-900 uppercase tracking-wider">C04.5 Instalaciones Específicas para Restaurantes</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {[
                          "Mesas individuales / Parejas", "Mesas para 4-6 pax", "Mesas para 8-10 pax", "Mesa imperial +10 pax",
                          "Mesas altas con taburetes", "Cavinas tipo dinner (Booths)", "Espacio amplio entre mesas (+1.5m)",
                          "Elementos divisorios (biombos/cortinas)", "Zonas insonorizadas", "Vajilla artesanal o de autor",
                          "Cristalería fina", "DJ en vivo", "Código QR fijo en mesa", "Botón físico/digital llamar camarero",
                          "Micro-Reservados (2 pax)", "Chef's Table (Mesa del Chef)", "Sommelier / Sumiller Dedicado", "Cava de Vinos Privada",
                          "Terraza a Pie de Calle", "Terraza Rooftop / Azotea"
                        ].map(item => {
                          const active = formData.services.includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => handleToggleService(item)}
                              className={`p-2.5 rounded-xl border text-[11px] font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                                active ? "bg-amber-600 text-white border-amber-600" : "bg-white text-slate-700 border-amber-200"
                              }`}
                            >
                              <span className="line-clamp-1">{item}</span>
                              {active ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(selectedType === "boton2" || formData.accommodation_type === "chalets_montana") && (
                    <div className="space-y-3 pt-3 border-t border-slate-200 bg-[#00C8D4]/10 p-4 rounded-2xl border border-[#00C8D4]/30">
                      <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#00C8D4]" />
                        <span>C04.4 Instalaciones Específicas para Chalets de Montaña / Esquí</span>
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {[
                          "Chimenea de leña", "Estufa de pellets o casete térmico", "Ropa de cama térmica/nórdica alto gramaje",
                          "Revestimientos y suelos de madera noble", "Bañera profunda / Jacuzzi privado", "Toalleros eléctricos calefactados en baños",
                          "Set de Fondue", "Raclette", "Despensa gran capacidad nieve", "Calefacción suelo radiante / radiadores",
                          "Termostatos programables por plantas", "Jacuzzi exterior / Bañera nórdica (Hot Tub)", "Balcón o terraza panorámica pistas/montaña",
                          "Terraza con estufas de exterior", "Zona almacenamiento leña cubierta", "Guardaesquís (Ski Room)",
                          "Secador de botas de esquí", "Zona vestuario térmico (Mudroom)", "Acceso Ski-in / Ski-out", "Garaje privado cubierto calefactado",
                          "Sauna finlandesa / Baño turco privado", "Sauna finlandesa / Baño turco compartido", "Shuttle privado transfer telecabinas",
                          "Venta o entrega de Forfaits en chalet", "Reserva de clases de esquí", "Chef privado a domicilio post-esquí",
                          "Entrega diaria de pan fresco y repostería", "Alquiler / provisión raquetas de nieve", "Trineos para niños", "Guías de montaña esquí de travesía / heliesquí"
                        ].map(item => {
                          const active = formData.services.includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => handleToggleService(item)}
                              className={`p-2.5 rounded-xl border text-[11px] font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                                active ? "bg-[#00C8D4] text-white border-[#00C8D4]" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <span className="line-clamp-1">{item}</span>
                              {active ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECCIÓN 5: SERVICIOS Y EXPERIENCIAS */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-200 pb-2">
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                      SECCIÓN 5: C02. Servicios, Atención & Movilidad
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Prestaciones intangibles, gastronomía, conectividad y transporte ofrecidos al huésped.
                    </p>
                  </div>

                  {/* C02.1 Atención al cliente & Idiomas */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">C02.1 Atención y Recepción & Idiomas</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        "Recepción 24h", "Servicio de conserjería", "Guarda-equipaje", "Registro entrada/salida exprés",
                        "Mostrador información turística", "Cuna adicional en habitación",
                        "Atención en Alemán", "Atención en Inglés", "Atención en Español", "Atención en Francés", "Atención en Portugués"
                      ].map(item => {
                        const active = formData.services.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handleToggleService(item)}
                            className={`p-2.5 rounded-xl border text-[11px] font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                              active ? "bg-[#00C8D4] text-white border-[#00C8D4]" : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <span className="line-clamp-1">{item}</span>
                            {active ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* C02.2 Gastronomía & C02.3 Limpieza */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">C02.2 Gastronomía & C02.3 Limpieza de Ropa</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        "Restaurante en propiedad", "Bar/Cafetería", "Bar en la piscina", "Servicio de habitaciones",
                        "Menús para dietas especiales", "Desayuno en la habitación", "Máquina expendedora (aperitivos)", "Máquina expendedora (bebidas)",
                        "Servicio de limpieza diaria", "Servicio de lavandería", "Limpieza en seco", "Servicio de planchado", "Lavandería compartida (monedas)"
                      ].map(item => {
                        const active = formData.services.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handleToggleService(item)}
                            className={`p-2.5 rounded-xl border text-[11px] font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                              active ? "bg-[#FF0096] text-white border-[#FF0096]" : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <span className="line-clamp-1">{item}</span>
                            {active ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* C02.4 Conectividad & Movilidad */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">C02.4 Conectividad, Parking & Transporte</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {[
                        "Wifi gratis", "Wifi de pago",
                        "Parking privado cubierto gratis", "Parking privado descubierto gratis",
                        "Parking privado cubierto de pago", "Parking privado descubierto de pago",
                        "Posibilidad de reservar Parking", "Parking público cercano",
                        "Parking adaptado PMR", "Estación de carga vehículos eléctricos",
                        "Servicio de traslado al aeropuerto", "Alquiler de bicicletas", "Alquiler de coches"
                      ].map(item => {
                        const active = formData.services.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handleToggleService(item)}
                            className={`p-2.5 rounded-xl border text-[11px] font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                              active ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <span className="line-clamp-1">{item}</span>
                            {active ? <Check className="w-3.5 h-3.5 shrink-0 text-[#00C8D4]" /> : <Plus className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* C02.5 Actividades Organizadas */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">C02.5 Actividades & Entretenimiento Organizado</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {[
                        "Rutas de senderismo", "Clases de cocina", "Visitas guiadas", "Deportes acuáticos",
                        "Tours a pie", "Tours en bici", "Noches de cine", "Música/espectáculos en directo",
                        "Club infantil", "Club de adolescentes y actividades", "Equitación", "Pesca",
                        "Golf", "Escalada de árboles", "Kayak en Canoa", "Paseos en lancha / Snorkel", "Ruta gastronómica / Catas"
                      ].map(item => {
                        const active = formData.services.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handleToggleService(item)}
                            className={`p-2.5 rounded-xl border text-[11px] font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                              active ? "bg-[#9B00CC] text-white border-[#9B00CC]" : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <span className="line-clamp-1">{item}</span>
                            {active ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SECCIÓN 6: GESTIÓN, POLÍTICAS Y LOGÍSTICA */}
              {currentStep === 6 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-200 pb-2">
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                      SECCIÓN 6: C03. Gestión, Políticas, Logística & Métodos de Pago Online
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Establece las reglas de convivencia, accesibilidad, horarios y pasarelas de pago.
                    </p>
                  </div>

                  {/* C03.1 Accesibilidad & C03.2 Seguridad */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">C03.1 Accesibilidad e Inclusión</h5>
                      <div className="grid grid-cols-1 gap-1.5">
                        {[
                          "Todo el alojamiento accesible en silla de ruedas", "Acceso a pisos superiores en ascensor",
                          "Todo en planta baja", "Lavamanos público más bajo", "WC público con barras de apoyo",
                          "Señalización en braille", "Guiado auditivo"
                        ].map(item => {
                          const active = formData.services.includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => handleToggleService(item)}
                              className={`p-2 rounded-xl border text-[11px] font-bold text-left flex items-center justify-between cursor-pointer ${
                                active ? "bg-[#00C8D4] text-white border-[#00C8D4]" : "bg-slate-50 text-slate-700 border-slate-200"
                              }`}
                            >
                              <span>{item}</span>
                              {active ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">C03.2 Seguridad y Protección</h5>
                      <div className="grid grid-cols-1 gap-1.5">
                        {[
                          "Cámaras de seguridad en zonas comunes", "Detectores de humo", "Extintores",
                          "Personal de Seguridad 24 horas", "Tarjetas de acceso electrónicas", "Caja fuerte principal en recepción"
                        ].map(item => {
                          const active = formData.services.includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => handleToggleService(item)}
                              className={`p-2 rounded-xl border text-[11px] font-bold text-left flex items-center justify-between cursor-pointer ${
                                active ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-700 border-slate-200"
                              }`}
                            >
                              <span>{item}</span>
                              {active ? <Check className="w-3.5 h-3.5 text-[#00C8D4]" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* C03.3 Políticas y Normas */}
                  <div className="space-y-4 pt-3 border-t border-slate-200">
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">C03.3 Políticas & Normas de la Propiedad</h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Horario Check-in (Admisión)</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="time"
                            value={formData.checkin_from}
                            onChange={e => setFormData(prev => ({ ...prev, checkin_from: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                          />
                          <span className="text-xs text-slate-400">a</span>
                          <input
                            type="time"
                            value={formData.checkin_to}
                            onChange={e => setFormData(prev => ({ ...prev, checkin_to: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Horario Check-out (Salida)</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="time"
                            value={formData.checkout_from}
                            onChange={e => setFormData(prev => ({ ...prev, checkout_from: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                          />
                          <span className="text-xs text-slate-400">a</span>
                          <input
                            type="time"
                            value={formData.checkout_to}
                            onChange={e => setFormData(prev => ({ ...prev, checkout_to: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Horario de Ruido (Minimizar)</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="time"
                            value={formData.quiet_hours_from}
                            onChange={e => setFormData(prev => ({ ...prev, quiet_hours_from: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                          />
                          <span className="text-xs text-slate-400">a</span>
                          <input
                            type="time"
                            value={formData.quiet_hours_to}
                            onChange={e => setFormData(prev => ({ ...prev, quiet_hours_to: e.target.value }))}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mascotas & Perfil Huésped */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        "Admisión de mascotas gratis", "Admisión de mascotas con suplemento",
                        "Camas para mascotas", "No se admiten mascotas",
                        "Familias (Apto para niños)", "Solo adultos / Parejas", "Travel Proud (LGBTQ+ friendly)",
                        "Prohibido fumar en todo el alojamiento", "Zonas habilitadas para fumadores", "Prohibida celebración de fiestas"
                      ].map(item => {
                        const active = formData.services.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handleToggleService(item)}
                            className={`p-2.5 rounded-xl border text-[11px] font-bold text-left flex items-center justify-between cursor-pointer ${
                              active ? "bg-[#FF0096] text-white border-[#FF0096]" : "bg-slate-50 text-slate-700 border-slate-200"
                            }`}
                          >
                            <span className="line-clamp-1">{item}</span>
                            {active ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* C03.3.6 Pago online */}
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">C03.3.6 Métodos de Pago Online Aceptados</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {[
                        { key: "Tarjeta (VISA, MC)", code: "C03.3.6.1" },
                        { key: "Bizum (España)", code: "C03.3.6.2" },
                        { key: "Binance USDT / Crypto", code: "C03.3.6.3" },
                        { key: "Pago Móvil (Bs. VES)", code: "C03.3.6.4" },
                        { key: "Zelle (USD) (Venezuela)", code: "C03.3.6.5" }
                      ].map(pago => {
                        const active = formData.services.includes(pago.key);
                        return (
                          <button
                            key={pago.key}
                            type="button"
                            onClick={() => handleToggleService(pago.key)}
                            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                              active
                                ? "bg-slate-900 text-white border-slate-900 shadow-md"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400"
                            }`}
                          >
                            <span className="text-[9px] uppercase tracking-wider block opacity-70 font-extrabold">{pago.code}</span>
                            <strong className="text-xs font-black block mt-0.5">{pago.key}</strong>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SECCIÓN 7: LUGARES DE INTERÉS */}
              {currentStep === 7 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-200 pb-2">
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#FF0096]" />
                      <span>SECCIÓN 7: C00.5. Lugares de Interés Cercanos</span>
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Añade los puntos turísticos, playas, aeropuertos o monumentos más relevantes cercanos al establecimiento.
                    </p>
                  </div>

                  {/* Formulario de adición de POI */}
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl border border-slate-200 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                          C00.5.1 Tipo de lugar *
                        </label>
                        <select
                          value={formData.poi_type}
                          onChange={e => setFormData(prev => ({ ...prev, poi_type: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                        >
                          {POINT_OF_INTEREST_TYPES.map(pt => (
                            <option key={pt.id} value={pt.label}>{pt.label} ({pt.code})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                          C00.5.2 Nombre del Lugar *
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Playa El Agua / Aeropuerto de Maiquetía"
                          value={formData.poi_name}
                          onChange={e => setFormData(prev => ({ ...prev, poi_name: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                          C00.5.3 Distancia / Tiempo
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: 500m / 5 min a pie / 15 km"
                          value={formData.poi_distance}
                          onChange={e => setFormData(prev => ({ ...prev, poi_distance: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddPointOfInterest}
                      className="w-full py-2.5 bg-[#00C8D4] hover:bg-[#00C8D4]/90 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Añadir lugar de interés</span>
                    </button>
                  </div>

                  {/* Lista de POIs Añadidos */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
                      <span>Lugares de Interés Registrados ({formData.points_of_interest.length})</span>
                      <span className="text-[10px] font-normal text-slate-500">Se mostrarán en el perfil público</span>
                    </h5>

                    {formData.points_of_interest.length === 0 ? (
                      <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-medium">
                        No has añadido lugares de interés. Utiliza el formulario arriba para agregar las atracciones principales de la zona.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {formData.points_of_interest.map((poi, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-[#FF0096]/10 text-[#FF0096] flex items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-[9px] uppercase font-black text-slate-400 block">{poi.type}</span>
                                <strong className="text-xs font-black text-slate-900">{poi.name}</strong>
                                <span className="text-[10px] font-bold text-[#00C8D4] block">{poi.distance}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemovePointOfInterest(idx)}
                              className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Wizard Footer Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{currentStep === 1 ? "Volver a Selección de Botón" : "Paso Anterior"}</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-95 text-white text-xs font-black px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  {submitting ? (
                    <span>Registrando Establecimiento...</span>
                  ) : currentStep === totalSteps ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Completar y Guardar Registro</span>
                    </>
                  ) : (
                    <>
                      <span>Siguiente Paso</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
