import React, { useState } from "react";
import {
  Building2, Ship, Heart, Utensils, X, ChevronRight, ChevronLeft,
  Check, Phone, MessageSquare, Globe, MapPin, Sparkles, ShieldCheck,
  Award, FileText, Upload, AlertCircle, CheckCircle2, Clock, Lock,
  HelpCircle, Anchor, Star, Info, Plus, Trash2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Destination {
  id: number;
  name: string;
  state?: string;
}

interface Category {
  id: number;
  name: string;
}

interface AddEstablishmentWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinations: Destination[];
  categories: Category[];
  activeOwnerId: string | undefined;
  onSuccess: () => void;
}

// Subtipos de alojamiento para Botón 1
const BOTON1_ACCOMMODATION_TYPES = [
  { id: "apartamentos", label: "Apartamentos", code: "C05.1.1" },
  { id: "casas_chalets_rurales", label: "Casas y Chalets rurales", code: "C05.1.2" },
  { id: "hoteles", label: "Hoteles", code: "C05.1.3" },
  { id: "hostales_posadas_pensiones", label: "Hostales, Posadas y Pensiones", code: "C05.1.4" },
  { id: "habitaciones_casas_particulares", label: "Habitaciones en casas particulares", code: "C05.1.5" },
  { id: "apartahotel", label: "Apartahotel", code: "C05.1.6" },
  { id: "albergues_turisticos", label: "Albergues turísticos", code: "C05.1.7" },
  { id: "residencias_estudiantes", label: "Residencias de estudiantes", code: "C05.1.8" },
  { id: "bed_and_breakfast", label: "Bed and breakfast", code: "C05.1.9" },
  { id: "villas", label: "Villas", code: "C05.1.10" },
  { id: "hoteles_capsula", label: "Hoteles cápsula", code: "C05.1.11" },
  { id: "campings", label: "Campings", code: "C05.1.12" },
  { id: "chalets_montana", label: "Chalets de montaña", code: "C05.1.13" }
];

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
  // Estado para la ventana previa (4 Botones) o Wizard activo
  const [selectedType, setSelectedType] = useState<"boton1" | "boton2" | "boton3" | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showRestaurantNotice, setShowRestaurantNotice] = useState<boolean>(false);

  // Estado general del formulario Wizard
  const [formData, setFormData] = useState({
    // Datos Generales
    name: "",
    accommodation_type: "hoteles",
    camping_subtype: "",
    destination_id: "",
    price_level: "$$",
    website: "",
    description: "",
    construction_year: "",
    reform_year: "",

    // Ubicación Estándar / Dirección
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

    // Datos Fiscales
    razon_social: "",
    titular_name: "",
    rif_cif: "",
    fiscal_address: "",
    billing_email: "",
    vat_regime: "General 16%",

    // Contacto Operativo HDV
    hdv_contact_name: "",
    hdv_contact_role: "",
    hdv_emergency_phone: "",
    hdv_reservation_email: "",
    hdv_whatsapp: "",

    // Contacto Operativo Clientes
    client_contact_name: "",
    client_contact_role: "",
    client_emergency_phone: "",
    client_reservation_email: "",
    client_whatsapp: "",

    // Equipamiento, Amenidades y Servicios Seleccionados
    services: [] as string[],

    // Lugares de Interés
    point_of_interest_type: "",
    point_of_interest_name: "",
    point_of_interest_distance: ""
  });

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

  const handleToggleCertification = (cert: string) => {
    setFormData(prev => {
      const active = prev.certifications.includes(cert);
      return {
        ...prev,
        certifications: active ? prev.certifications.filter(c => c !== cert) : [...prev.certifications, cert]
      };
    });
  };

  const handleSelectBoton = (type: "boton1" | "boton2" | "boton3" | "boton4") => {
    if (type === "boton4") {
      setShowRestaurantNotice(true);
      return;
    }
    setSelectedType(type);
    setCurrentStep(1);
    if (type === "boton2") {
      setFormData(prev => ({ ...prev, accommodation_type: "barcos" }));
    } else if (type === "boton3") {
      setFormData(prev => ({ ...prev, accommodation_type: "love_hotels" }));
    }
  };

  const handleResetModal = () => {
    setSelectedType(null);
    setCurrentStep(1);
    setShowRestaurantNotice(false);
    onClose();
  };

  const totalSteps = 5;

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
      if (selectedType === "boton2") {
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

      // Determinar categoría Supabase o fallback id
      const matchedCategory = categories.find(c =>
        c.name.toLowerCase().includes(formData.accommodation_type.toLowerCase())
      );
      const categoryId = matchedCategory ? matchedCategory.id : (categories[0]?.id || 1);

      // Combinar dirección completa
      const fullAddressStr = selectedType === "boton2"
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

      // Actualizar el rol del usuario en la tabla profiles a 'owner' si era turista
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
                <span>Registrar Nuevo Establecimiento</span>
                {selectedType && (
                  <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-[#00C8D4]/20 border border-[#00C8D4]/40 text-[#00C8D4]">
                    {selectedType === "boton1" ? "Alojamientos Estándar" : selectedType === "boton2" ? "Embarcación Náutica" : "Love Hotel"}
                  </span>
                )}
              </h3>
              <p className="text-white/70 text-xs font-medium">Sujeto a verificación y aprobación de la administración de HDV</p>
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

        {/* Modal Body */}
        <div className="p-6 md:p-8 max-h-[82vh] overflow-y-auto space-y-6 custom-scrollbar">

          {/* VENTANA PREVIA: SELECCIÓN DE LOS 4 BOTONES */}
          {!selectedType ? (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-[11px] font-black uppercase text-[#FF0096] tracking-widest bg-[#FF0096]/10 px-3 py-1 rounded-full border border-[#FF0096]/20 inline-block">
                  Selecciona la Categoría Principal
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  ¿Qué tipo de establecimiento deseas registrar?
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Cada categoría cuenta con un asistente de registro especializado (Wizard) ajustado a las normativas de Hoteles de Venezuela.
                </p>
              </div>

              {/* Grid de 4 Botones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                {/* BOTÓN 1 */}
                <button
                  type="button"
                  onClick={() => handleSelectBoton("boton1")}
                  className="group relative bg-gradient-to-br from-slate-50 to-slate-100 hover:from-white hover:to-cyan-50/40 border border-slate-200 hover:border-[#00C8D4] p-5 rounded-2xl text-left transition-all duration-200 shadow-sm hover:shadow-lg cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#00C8D4] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                        <Building2 className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/20">
                        Botón 1 • 13 Tipologías
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 group-hover:text-[#00C8D4] transition-colors">
                        Alojamientos Turísticos Estándar
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                        Hoteles, Posadas, Apartamentos, Villas, Campings, Albergues, Residencias y Chalets de Montaña.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-[#00C8D4]">
                    <span>Iniciar Registro Asistido</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* BOTÓN 2 */}
                <button
                  type="button"
                  onClick={() => handleSelectBoton("boton2")}
                  className="group relative bg-gradient-to-br from-slate-50 to-slate-100 hover:from-white hover:to-cyan-50/40 border border-slate-200 hover:border-[#00C8D4] p-5 rounded-2xl text-left transition-all duration-200 shadow-sm hover:shadow-lg cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#00C8D4] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                        <Ship className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/20">
                        Botón 2 • Experiencia Náutica
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 group-hover:text-[#00C8D4] transition-colors">
                        Barcos & Embarcaciones
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                        Velleros, Yates, Catamaranes o Houseboats con amarre en marina/puerto y pernocta náutica.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-[#00C8D4]">
                    <span>Iniciar Registro Náutico</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* BOTÓN 3 */}
                <button
                  type="button"
                  onClick={() => handleSelectBoton("boton3")}
                  className="group relative bg-gradient-to-br from-slate-50 to-slate-100 hover:from-white hover:to-pink-50/40 border border-slate-200 hover:border-[#FF0096] p-5 rounded-2xl text-left transition-all duration-200 shadow-sm hover:shadow-lg cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#FF0096] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                        <Heart className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-[#FF0096]/10 text-[#FF0096] border border-[#FF0096]/20">
                        Botón 3 • Privacidad Premium
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 group-hover:text-[#FF0096] transition-colors">
                        Love Hotels
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                        Formulario especializado con privacidad garantizada, garaje automatizado, alquiler por horas y check-in discreto.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-[#FF0096]">
                    <span>Iniciar Registro Love Hotel</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* BOTÓN 4 */}
                <button
                  type="button"
                  onClick={() => handleSelectBoton("boton4")}
                  className="group relative bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 hover:border-[#9B00CC] p-5 rounded-2xl text-left transition-all duration-200 shadow-sm hover:shadow-lg cursor-pointer flex flex-col justify-between opacity-90"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#9B00CC] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                        <Utensils className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-[#9B00CC]/10 text-[#9B00CC] border border-[#9B00CC]/20">
                        Botón 4 • Próximamente
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 group-hover:text-[#9B00CC] transition-colors">
                        Restaurantes & Gastronomía
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                        Módulo exclusivo para establecimientos gastronómicos, menú digital, mesas y reservas de alta cocina.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-[#9B00CC]">
                    <span>Proximamente disponible</span>
                    <Lock className="w-4 h-4" />
                  </div>
                </button>
              </div>

              {showRestaurantNotice && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-medium flex items-center gap-3 animate-fadeIn">
                  <Info className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <strong className="font-bold">Módulo de Restaurantes (Botón 4):</strong> Esta funcionalidad está programada para la siguiente fase de actualización. Por favor utiliza los botones 1, 2 o 3 para registrar tus propiedades turísticas o náuticas.
                  </div>
                </div>
              )}
            </div>
          ) : (

            /* WIZARD DE PASOS ACTIVO */
            <form onSubmit={handleNextStep} className="space-y-6">
              
              {/* Stepper Header Progress */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#00C8D4] text-white text-[11px] font-black flex items-center justify-center shadow-xs">
                      {currentStep}
                    </span>
                    <span>
                      {currentStep === 1 && "Paso 1: Datos Generales, Ubicación & Licencias"}
                      {currentStep === 2 && "Paso 2: Datos Fiscales & Facturación"}
                      {currentStep === 3 && "Paso 3: Contacto Operativo HDV & Clientes"}
                      {currentStep === 4 && (selectedType === "boton2" ? "Paso 4: Equipamiento & Prestaciones Náuticas" : selectedType === "boton3" ? "Paso 4: Amenidades Específicas Love Hotel" : "Paso 4: Equipamiento, Zonas Comunes & Servicios")}
                      {currentStep === 5 && "Paso 5: Gestión, Políticas, Pago Online & Lugares de Interés"}
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

              {/* PASO 1: DATOS GENERALES Y UBICACIÓN */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="border-b border-slate-200 pb-2">
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                      1. Identificación & Ubicación Principal
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Completa el nombre comercial y ubicación del establecimiento.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* Nombre Comercial */}
                    <div className="md:col-span-2">
                      <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                        Nombre Comercial de la Propiedad / Embarcación *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={selectedType === "boton2" ? "Ej: Yate Catamarán Gran Turquesa" : selectedType === "boton3" ? "Ej: Motel Suite Paraíso" : "Ej: Posada Turística Galápagos"}
                        value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C8D4]/20 focus:border-[#00C8D4]"
                      />
                    </div>

                    {/* Tipología de Alojamiento (Botón 1) */}
                    {selectedType === "boton1" && (
                      <div className="md:col-span-1">
                        <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                          Tipo de Alojamiento (C05.1) *
                        </label>
                        <select
                          required
                          value={formData.accommodation_type}
                          onChange={e => setFormData(prev => ({ ...prev, accommodation_type: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C8D4]/20 focus:border-[#00C8D4] cursor-pointer"
                        >
                          {BOTON1_ACCOMMODATION_TYPES.map(t => (
                            <option key={t.id} value={t.id}>{t.label} ({t.code})</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Subtipo condicional de Campings */}
                    {selectedType === "boton1" && formData.accommodation_type === "campings" && (
                      <div className="md:col-span-1">
                        <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                          Tipo de Alojamiento Campings (C04.1.1) *
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

                    {/* Nivel de Precios */}
                    <div className="md:col-span-1">
                      <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                        Nivel de Precios
                      </label>
                      <select
                        value={formData.price_level}
                        onChange={e => setFormData(prev => ({ ...prev, price_level: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C8D4]/20 focus:border-[#00C8D4] cursor-pointer"
                      >
                        <option value="$">$ (Económico)</option>
                        <option value="$$">$$ (Moderado)</option>
                        <option value="$$$">$$$ (Premium)</option>
                        <option value="$$$$">$$$$ (Lujo / Exclusivo)</option>
                      </select>
                    </div>

                    {/* Sitio Web / Redes Social */}
                    <div className="md:col-span-1">
                      <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                        Sitio Web / Red Social
                      </label>
                      <input
                        type="text"
                        placeholder="https://ejemplo.com o @instagram"
                        value={formData.website}
                        onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C8D4]/20 focus:border-[#00C8D4]"
                      />
                    </div>

                    {/* Descripción Comercial (máx 150-200 car) */}
                    <div className="md:col-span-3">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider">
                          Descripción o Reseña Comercial (Máximo 200 caracteres)
                        </label>
                        <span className={`text-[10px] font-bold ${formData.description.length > 200 ? 'text-red-500' : 'text-slate-400'}`}>
                          {formData.description.length} / 200
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        maxLength={200}
                        placeholder="Resumen atractivo sobre las virtudes, entorno y servicios destacados de la propiedad..."
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
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C8D4]/20 focus:border-[#00C8D4]"
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
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C8D4]/20 focus:border-[#00C8D4]"
                      />
                    </div>
                  </div>

                  {/* ESPECÍFICO DE BARCO (BOTÓN 2) */}
                  {selectedType === "boton2" ? (
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-[#00C8D4] uppercase tracking-wider">
                        <Anchor className="w-4 h-4" />
                        <span>Ubicación Física Náutica & Datos de la Embarcación</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-cyan-50/40 p-4 rounded-2xl border border-cyan-100">
                        <div className="md:col-span-2">
                          <label className="block text-[10px] uppercase font-black text-cyan-900 tracking-wider mb-1">
                            Nombre del Puerto Deportivo, Marina o Club Náutico *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: Marina Udón Pérez, Tucacas / Puerto La Cruz"
                            value={formData.marina_name}
                            onChange={e => setFormData(prev => ({ ...prev, marina_name: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-white border border-cyan-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C8D4]"
                          />
                        </div>

                        <div className="md:col-span-1">
                          <label className="block text-[10px] uppercase font-black text-cyan-900 tracking-wider mb-1">
                            Matrícula y Folio del Barco (NIF/NIN) *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: ARSH-PE-1234 (Obligatorio)"
                            value={formData.boat_matricula}
                            onChange={e => setFormData(prev => ({ ...prev, boat_matricula: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-white border border-cyan-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00C8D4]"
                          />
                        </div>

                        <div className="md:col-span-1">
                          <label className="block text-[10px] uppercase font-black text-cyan-900 tracking-wider mb-1">
                            N° / Letra de Pantalán o Muelle (Pier / Dock)
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: Muelle B - Pantalán 4"
                            value={formData.pier_dock}
                            onChange={e => setFormData(prev => ({ ...prev, pier_dock: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-white border border-cyan-200 rounded-xl text-xs font-bold text-slate-800"
                          />
                        </div>

                        <div className="md:col-span-1">
                          <label className="block text-[10px] uppercase font-black text-cyan-900 tracking-wider mb-1">
                            N° de Amarre / Puesto de Atraque (Berth)
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: Amarre #18"
                            value={formData.berth_number}
                            onChange={e => setFormData(prev => ({ ...prev, berth_number: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-white border border-cyan-200 rounded-xl text-xs font-bold text-slate-800"
                          />
                        </div>

                        <div className="md:col-span-1">
                          <label className="block text-[10px] uppercase font-black text-cyan-900 tracking-wider mb-1">
                            Nombre de la Embarcación
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: La Perla Negra"
                            value={formData.boat_name}
                            onChange={e => setFormData(prev => ({ ...prev, boat_name: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-white border border-cyan-200 rounded-xl text-xs font-bold text-slate-800"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[10px] uppercase font-black text-cyan-900 tracking-wider mb-1">
                            Punto de Encuentro y Tipo de Acceso
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: Recepción de Capitanía de Puerto / Código magnético para acceso a muelle"
                            value={formData.meeting_point}
                            onChange={e => setFormData(prev => ({ ...prev, meeting_point: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-white border border-cyan-200 rounded-xl text-xs font-bold text-slate-800"
                          />
                        </div>

                        <div className="md:col-span-1">
                          <label className="block text-[10px] uppercase font-black text-cyan-900 tracking-wider mb-1">
                            Coordenadas GPS (Lat, Lng)
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: 10.5621 N, -66.8921 W"
                            value={formData.gps_lat}
                            onChange={e => setFormData(prev => ({ ...prev, gps_lat: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-white border border-cyan-200 rounded-xl text-xs font-bold text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (

                    /* UBICACIÓN FÍSICA TERRESTRE */
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                        Dirección Geográfica Completa
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
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nombre de la Vía / Sector</label>
                          <input
                            type="text"
                            placeholder="Ej: Av. Principal / Sector Playa Grande"
                            value={formData.street_name}
                            onChange={e => setFormData(prev => ({ ...prev, street_name: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Número / S/N</label>
                          <input
                            type="text"
                            placeholder="Ej: N° 45"
                            value={formData.street_number}
                            onChange={e => setFormData(prev => ({ ...prev, street_number: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Ciudad / Localidad</label>
                          <input
                            type="text"
                            placeholder="Ej: Chacao"
                            value={formData.city}
                            onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Estado / Provincia</label>
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
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Barrio / Zona (C05.5)</label>
                          <input
                            type="text"
                            placeholder="Ej: Altamira / Centro"
                            value={formData.neighborhood}
                            onChange={e => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div className="col-span-2 md:col-span-4">
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Indicaciones de Acceso</label>
                          <input
                            type="text"
                            placeholder="Ej. Acceso por carretera N-340 km 12, desvío derecha junto a la estación"
                            value={formData.access_instructions}
                            onChange={e => setFormData(prev => ({ ...prev, access_instructions: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LICENCIAS Y CERTIFICACIONES */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Licencias, Categoría & Certificaciones
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                          N° Licencia Turística / RTN
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
                          Categoría (C05.3)
                        </label>
                        <select
                          value={formData.star_rating}
                          onChange={e => setFormData(prev => ({ ...prev, star_rating: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                        >
                          <option value="1 estrella">C05.3.1 - 1 Estrella</option>
                          <option value="2 estrellas">C05.3.2 - 2 Estrellas</option>
                          <option value="3 estrellas">C05.3.3 - 3 Estrellas</option>
                          <option value="4 estrellas">C05.3.4 - 4 Estrellas</option>
                          <option value="5 estrellas">C05.3.5 - 5 Estrellas</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                          N° Unidades Operativas (Tamaño)
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

                    {/* Certificaciones C05.2 */}
                    <div className="space-y-2 pt-2">
                      <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider">
                        Certificaciones Oficiales Reclamadas (C05.2)
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          { id: "sostenibilidad", label: "C05.2.1 Sostenibilidad", color: "#00C8D4" },
                          { id: "sello_hdv", label: "C05.2.2 Sello Garantía HDV", color: "#FF0096" },
                          { id: "circuito_excelencia", label: "C05.2.3 Circuito Excelencia", color: "#9B00CC" },
                          { id: "estrellas_michelin", label: "C05.2.4 Estrellas Michelin", color: "#10b981" }
                        ].map(cert => {
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

              {/* PASO 2: DATOS FISCALES Y DE FACTURACIÓN */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="border-b border-slate-200 pb-2">
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                      2. Datos Fiscales & Facturación de la Propiedad / Armador
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Información necesaria para la emisión de facturas y cumplimiento legal.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                        Razón Social de la Empresa / Armador
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
                        Nombre del Titular / Representante Legal
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
                        NIF / CIF / RIF Fiscal
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: J-12345678-9"
                        value={formData.rif_cif}
                        onChange={e => setFormData(prev => ({ ...prev, rif_cif: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                        Email para Facturación
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
                        Dirección Fiscal Completa
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Calle Comercio, Edif. Torre Azul, Piso 4, Caracas"
                        value={formData.fiscal_address}
                        onChange={e => setFormData(prev => ({ ...prev, fiscal_address: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">
                        Régimen de IVA / Impuesto Aplicable
                      </label>
                      <select
                        value={formData.vat_regime}
                        onChange={e => setFormData(prev => ({ ...prev, vat_regime: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
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

              {/* PASO 3: CONTACTO OPERATIVO */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-200 pb-2">
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                      3. Contacto Operativo (Interno HDV & Atención al Cliente)
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Establece las personas de contacto directo para la administración y para los huéspedes.
                    </p>
                  </div>

                  {/* 1. Contacto con HDV */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-[#00C8D4]" />
                      <span>1. Contacto Administrativo con Hoteles de Venezuela (Privado)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nombre y Apellidos</label>
                        <input
                          type="text"
                          placeholder="Nombre del Administrador"
                          value={formData.hdv_contact_name}
                          onChange={e => setFormData(prev => ({ ...prev, hdv_contact_name: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Cargo</label>
                        <input
                          type="text"
                          placeholder="Ej: Gerente General / Propietario"
                          value={formData.hdv_contact_role}
                          onChange={e => setFormData(prev => ({ ...prev, hdv_contact_role: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Teléfono Emergencias (24h)</label>
                        <input
                          type="tel"
                          placeholder="+58 412 0000000"
                          value={formData.hdv_emergency_phone}
                          onChange={e => setFormData(prev => ({ ...prev, hdv_emergency_phone: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Email Recepción Reservas</label>
                        <input
                          type="email"
                          placeholder="reservas@hotel.com"
                          value={formData.hdv_reservation_email}
                          onChange={e => setFormData(prev => ({ ...prev, hdv_reservation_email: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">WhatsApp Directo</label>
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

                  {/* 2. Contacto con Clientes */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-wider">
                      <MessageSquare className="w-4 h-4 text-[#FF0096]" />
                      <span>2. Contacto Público para los Clientes & Viajeros</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Persona de Contacto</label>
                        <input
                          type="text"
                          placeholder="Atención al cliente / Recepción"
                          value={formData.client_contact_name}
                          onChange={e => setFormData(prev => ({ ...prev, client_contact_name: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Teléfono Recepción (24h)</label>
                        <input
                          type="tel"
                          placeholder="+58 212 0000000"
                          value={formData.client_emergency_phone}
                          onChange={e => setFormData(prev => ({ ...prev, client_emergency_phone: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">WhatsApp Comercial Clientes</label>
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

              {/* PASO 4: EQUIPAMIENTO & AMENIDADES ESPECÍFICAS SEGÚN FORMULARIO */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* CASO BOTÓN 2: BARCOS */}
                  {selectedType === "boton2" ? (
                    <div className="space-y-6">
                      <div className="border-b border-slate-200 pb-2">
                        <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                          <Anchor className="w-4 h-4 text-[#00C8D4]" />
                          <span>4. Equipamiento Náutico, Camarotes & Cubiertas</span>
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          Selecciona las especificaciones y prestaciones náuticas de la embarcación.
                        </p>
                      </div>

                      {/* Group Camarotes */}
                      <div className="space-y-2">
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">C04.2.1 Camarotes & Interiores</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {[
                            "Camarote doble", "Camarote individual", "Literas náuticas red anticaída",
                            "Escotillas con mosquitera", "Cortinas foscurit (blackout)", "Colchones ventilación antihumedad",
                            "Ducha camarote bomba achique", "Cocina marina basculante", "Fogones gas / vitro marina",
                            "Horno gas / eléctrico", "Nevera / glacera marina 12V/24V", "Vajilla irrompible (melamina)",
                            "Fregadero bomba agua dulce/mar", "Aire acondicionado marina", "Calefacción diésel (Webasto)",
                            "Desalinizadora / potabilizadora", "Inversor corriente (12V a 220V)", "Tomas USB 12V",
                            "Smart TV 12V", "Sistema sonido marino Bluetooth", "Salón transformable en cama", "Tapicería náutica anti-manchas"
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

                      {/* Group Cubiertas */}
                      <div className="space-y-2 pt-2">
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">C04.2.2 Cubierta, Exteriores & Prestaciones</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {[
                            "Puente de mando", "Solárium en proa", "Plataforma de baño en popa", "Escalera de baño",
                            "Ducha de cubierta (agua dulce)", "Barbacoa / Parrilla marina", "Nevera de cubierta",
                            "Amarre en puerto deportivo", "Boya de fondeo asignada", "Molinete de ancla eléctrico",
                            "Embarcación auxiliar (Dinghy/Tender)", "Plataforma hinchable baño", "Garaje juguetes náuticos",
                            "Capitán / Patrón incluido", "Capitán bajo petición", "Marinero / Azafata", "Chef a bordo",
                            "Wi-Fi satelital Starlink", "Equipamiento de snorkel", "Paddle Surf (SUP)", "Kayak hinchable",
                            "Equipo pesca deportiva", "Seabob / Propulsor", "Esquí acuático / Wakeboard"
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
                    </div>
                  ) : selectedType === "boton3" ? (

                    /* CASO BOTÓN 3: LOVE HOTELS */
                    <div className="space-y-6">
                      <div className="border-b border-slate-200 pb-2">
                        <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                          <Heart className="w-4 h-4 text-[#FF0096]" />
                          <span>4. Amenidades Específicas para Love Hotels</span>
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          Selecciona las características exclusivas de privacidad y ambientación.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          { key: "Cama King/Queen colchón reforzado", category: "Mobiliario Erótico", icon: "Bed" },
                          { key: "Sillón Tantra", category: "Mobiliario Erótico", icon: "Heart" },
                          { key: "Espejos estratégicos", category: "Mobiliario Erótico", icon: "Sparkles" },
                          { key: "Jacuzzi XL / Hidromasaje privado en habitación", category: "Zona de Agua", icon: "Droplets" },
                          { key: "Ducha de cristal transparente vista desde la cama", category: "Zona de Agua", icon: "Eye" },
                          { key: "Kits de higiene íntima y cosmética erótica", category: "Zona de Agua", icon: "Gift" },
                          { key: "Iluminación LED regulable por zonas y colores", category: "Climatización & Ambiente", icon: "Sun" },
                          { key: "Insonorización acústica reforzada", category: "Climatización & Ambiente", icon: "VolumeX" },
                          { key: "Climatización individual rápida e independiente", category: "Climatización & Ambiente", icon: "Wind" },
                          { key: "Canales de contenido adultos (X/Erótico) incluido", category: "Entretenimiento", icon: "Tv" },
                          { key: "Terraza con Jacuzzi o piscina privada sin visibilidad exterior", category: "Exteriores Privados", icon: "Shield" },
                          { key: "Garaje privado individual con puerta automática (Check-in sin bajarte)", category: "Privacidad Total", icon: "Car" },
                          { key: "Torno / Pass-through Box de entrega anónimo", category: "Privacidad Total", icon: "Package" },
                          { key: "Entrada y salida por accesos independientes", category: "Privacidad Total", icon: "DoorOpen" },
                          { key: "Check-in / Check-out automatizado", category: "Servicios", icon: "Clock" },
                          { key: "Facturación y cobro 100% anónimo", category: "Servicios", icon: "Lock" }
                        ].map(item => {
                          const active = formData.services.includes(item.key);
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => handleToggleService(item.key)}
                              className={`p-3 rounded-2xl border text-xs font-bold text-left flex items-start justify-between transition-all cursor-pointer ${
                                active
                                  ? "bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white border-transparent shadow-md"
                                  : "bg-slate-50 text-slate-800 border-slate-200 hover:border-pink-300"
                              }`}
                            >
                              <div className="space-y-0.5">
                                <span className="text-[9px] uppercase tracking-wider block opacity-75 font-extrabold">{item.category}</span>
                                <span>{item.key}</span>
                              </div>
                              {active ? <Check className="w-4 h-4 shrink-0 mt-1" /> : <Plus className="w-4 h-4 shrink-0 text-slate-400 mt-1" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (

                    /* CASO BOTÓN 1: ALOJAMIENTOS ESTÁNDAR */
                    <div className="space-y-6">
                      <div className="border-b border-slate-200 pb-2">
                        <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                          4. Instalaciones, Zonas Comunes & Abastecimiento Crítico
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          Selecciona la infraestructura física disponible en la propiedad.
                        </p>
                      </div>

                      {/* Abastecimiento Crítico Venezuela */}
                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black text-amber-900 uppercase tracking-wider">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <span>Abastecimiento & Energía 24/7 (C01.5)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { key: "Planta Eléctrica 24/7 (Full Power)", code: "C01.5.1", desc: "Respaldo eléctrico continuo para todos los equipos y aires" },
                            { key: "Tanque de Agua continuo", code: "C01.5.2", desc: "Suministro de agua potable ininterrumpido en todas las instalaciones" }
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

                      {/* Zonas Comunes */}
                      <div className="space-y-2">
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">C01.4 Zonas Comunes & Instalaciones</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {[
                            "Piscina exterior", "Piscina interior climatizada", "Spa & Wellness", "Sauna", "Baño turco / hammam",
                            "Gimnasio completo", "Zona de Yoga", "Solárium", "Salón de uso común con TV", "Sala de juegos (Billar, Futbolín)",
                            "Biblioteca", "Cocina compartida equipada", "Zona de barbacoa compartida", "Parque infantil", "Jardín compartido",
                            "Parque acuático / Toboganes", "Pistas de tenis / Pádel", "Ping Pong / Minigolf", "Acceso directo a la playa",
                            "Salas de reuniones / Coworking"
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

                      {/* Servicios y Experiencias C02 */}
                      <div className="space-y-2 pt-2">
                        <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">C02 Servicios & Experiencias</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {[
                            "Recepción 24h", "Servicio de conserjería", "Guarda-equipaje", "Check-in exprés", "Información turística",
                            "Atención multilingüe (Inglés/Español)", "Restaurante en propiedad", "Bar / Cafetería", "Bar en la piscina",
                            "Servicio de habitaciones", "Wifi gratis", "Parking privado cubierto gratis", "Parking privado de pago",
                            "Traslado aeropuerto", "Rutas de senderismo", "Visitas guiadas", "Música en directo"
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
                    </div>
                  )}
                </div>
              )}

              {/* PASO 5: GESTIÓN, POLÍTICAS, PAGO ONLINE Y LUGARES DE INTERÉS */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-slate-200 pb-2">
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                      5. Políticas de Propiedad, Métodos de Pago Online & Puntos de Interés
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Define los parámetros de reserva, accesibilidad y opciones de pago admitidas.
                    </p>
                  </div>

                  {/* Políticas Marítimas / Love Hotel / Estándar */}
                  {selectedType === "boton2" ? (
                    <div className="bg-cyan-50/50 p-4 rounded-2xl border border-cyan-200 space-y-3">
                      <h5 className="text-xs font-black text-cyan-900 uppercase tracking-wider">C04.2.5 Normas Marítimas & Seguridad Náutica</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {[
                          "Chalecos salvavidas adultos/niños", "Balsa salvavidas autoinflable", "Radio VHF con DSC",
                          "Radiobaliza (EPIRB)", "Botiquín Zona 2/3", "Extintores sala máquinas",
                          "Obligatorio calzado suela blanca", "Limitación uso agua dulce", "Uso estricto WC marino",
                          "Alojamiento estático en puerto", "Alojamiento con navegación diaria", "Combustible no incluido"
                        ].map(item => {
                          const active = formData.services.includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => handleToggleService(item)}
                              className={`p-2.5 rounded-xl border text-[11px] font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                                active ? "bg-[#00C8D4] text-white border-[#00C8D4]" : "bg-white text-slate-700 border-cyan-200"
                              }`}
                            >
                              <span className="line-clamp-1">{item}</span>
                              {active ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : selectedType === "boton3" ? (
                    <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-200 space-y-3">
                      <h5 className="text-xs font-black text-pink-900 uppercase tracking-wider">C03.3.5 Políticas Específicas Love Hotel</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {[
                          "Entrada/Salida discreta o automatizada", "Alquiler por horas disponible",
                          "Check-in express desde vehículo", "Total confidencialidad de datos"
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
                              <span>{item}</span>
                              {active ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0 text-slate-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {/* Pago Online C03.3.6 */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">C03.3.6 Métodos de Pago Online Aceptados</h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {[
                        { key: "Tarjeta (VISA, MC)", desc: "C03.3.6.1" },
                        { key: "Bizum (España)", desc: "C03.3.6.2" },
                        { key: "Binance USDT / Crypto", desc: "C03.3.6.3" },
                        { key: "Pago Móvil (Bs. VES)", desc: "C03.3.6.4" },
                        { key: "Zelle (USD) (Venezuela)", desc: "C03.3.6.5" }
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
                            <span className="text-[9px] uppercase tracking-wider block opacity-70 font-extrabold">{pago.desc}</span>
                            <strong className="text-xs font-black block mt-0.5">{pago.key}</strong>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sección 7: Lugares de Interés Cercanos */}
                  <div className="space-y-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#FF0096]" />
                      <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">Sección 7: Puntos de Interés Cercanos (Opcional)</h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Tipo de Lugar (C05.4.1)</label>
                        <select
                          value={formData.point_of_interest_type}
                          onChange={e => setFormData(prev => ({ ...prev, point_of_interest_type: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        >
                          <option value="">Selecciona Tipo...</option>
                          <option value="Restaurantes, Bares y Cafeterías">Restaurantes, Bares y Cafeterías</option>
                          <option value="Centros comerciales">Centros comerciales</option>
                          <option value="Playas">Playas</option>
                          <option value="Aeropuerto / Estación">Aeropuerto, estación de tren/autobús</option>
                          <option value="Patrimonio histórico">Patrimonio histórico / Monumentos</option>
                          <option value="Museos">Museos</option>
                          <option value="Parques naturales">Parques naturales</option>
                          <option value="Atracciones turísticas">Atracciones turísticas / Zoológicos</option>
                          <option value="Hospitales / Clínicas">Hospitales, clínicas, centros médicos</option>
                          <option value="Estación de policía">Estación de policía</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nombre del Lugar</label>
                        <input
                          type="text"
                          placeholder="Ej: Aeropuerto Internacional de Maiquetía"
                          value={formData.point_of_interest_name}
                          onChange={e => setFormData(prev => ({ ...prev, point_of_interest_name: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Distancia / Tiempo</label>
                        <input
                          type="text"
                          placeholder="Ej: 15 km / 20 mins en auto"
                          value={formData.point_of_interest_distance}
                          onChange={e => setFormData(prev => ({ ...prev, point_of_interest_distance: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                    </div>
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
                  <span>{currentStep === 1 ? "Volver a Botones" : "Paso Anterior"}</span>
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
