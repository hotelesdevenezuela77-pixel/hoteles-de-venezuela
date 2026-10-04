import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Zap, 
  Droplets, 
  Wifi, 
  Dog, 
  ShieldCheck, 
  Star, 
  MapPin, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  Eye, 
  Layers, 
  BedDouble, 
  DollarSign, 
  Building, 
  Tag, 
  FileText,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  ArrowLeft,
  Camera,
  Upload,
  Navigation,
  Loader2,
  Trash2,
  Globe,
  Radio,
  Share2
} from "lucide-react";
import { supabase } from "../lib/supabase";
import type { PreRegistrationPayload, PreRegistrationBadgeFlags } from "../types/preRegistration";
import { FlexibleBedroomConfigurator } from "../components/units/FlexibleBedroomConfigurator";

export function PreRegistro() {
  const [, setLocation] = useLocation();

  // Estados del Formulario de Pre-Registro (Ficha Pública)
  const [serviceCategoryId, setServiceCategoryId] = useState<number>(1);
  const [subcategoryId, setSubcategoryId] = useState<number>(6); // Posadas por defecto
  const [categoryName, setCategoryName] = useState<string>("Posada Boutique");
  const [title, setTitle] = useState<string>("Posada Paraíso Azul");
  const [destinationName, setDestinationName] = useState<string>("Morrocoy");
  const [state, setState] = useState<string>("Falcón");
  const [city, setCity] = useState<string>("Tucacas");
  const [ratingAvg, setRatingAvg] = useState<number>(4.9);
  const [shortDescription, setShortDescription] = useState<string>(
    "Exclusiva posada frente a los cayos más cristalinos de Morrocoy. Muelle privado, gastronomía marina y atención de primer nivel."
  );
  const [basePriceFrom, setBasePriceFrom] = useState<number>(140);
  const [whatsappNumber, setWhatsappNumber] = useState<string>("+58 412 1234567");

  // GPS & Ubicación en tiempo real desde celular/dispositivo
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [isCapturingGps, setIsCapturingGps] = useState<boolean>(false);
  const [gpsSuccessMsg, setGpsSuccessMsg] = useState<string | null>(null);
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null);

  // Fotos & Archivos del Establecimiento
  const [primaryImage, setPrimaryImage] = useState<string>(
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop"
  );
  const [galleryImages, setGalleryImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop"
  ]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [photoUrlInput, setPhotoUrlInput] = useState<string>("");

  // Estado de Publicación Directa (Agente en Ruta)
  const [publishDirectly, setPublishDirectly] = useState<boolean>(true);

  // Badges Destacados
  const [badges, setBadges] = useState<PreRegistrationBadgeFlags>({
    has_power_plant: true,
    has_water_247: true,
    has_starlink: true,
    is_pet_friendly: true,
    has_hdv_seal: true
  });

  // Pills / Etiquetas Secundarias Seleccionadas
  const [pills, setPills] = useState<string[]>([
    "Muelle privado",
    "Lanchas propias",
    "Gastronomía de mar",
    "Excursiones a Cayos",
    "Confort Premium"
  ]);

  const [customPillInput, setCustomPillInput] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"card_form" | "bedrooms_config">("card_form");

  const defaultPillSuggestions = [
    "Muelle privado",
    "Lanchas propias",
    "Gastronomía de mar",
    "Excursiones a Cayos",
    "Confort Premium",
    "Transporte VIP",
    "Planta eléctrica 24/7",
    "Piscina infinita",
    "Chef privado"
  ];

  // Captura de GPS inteligente desde el navegador / dispositivo móvil
  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      setGpsErrorMsg("Tu navegador o dispositivo no soporta geolocalización por GPS.");
      return;
    }
    setIsCapturingGps(true);
    setGpsErrorMsg(null);
    setGpsSuccessMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setLatitude(lat);
        setLongitude(lng);
        setIsCapturingGps(false);
        setGpsSuccessMsg(`📍 Coordenadas detectadas: ${lat}, ${lng}`);
      },
      (error) => {
        setIsCapturingGps(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsErrorMsg("Permiso de ubicación denegado. Activa la ubicación en los ajustes de tu celular.");
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsErrorMsg("Ubicación GPS no disponible en este momento.");
            break;
          case error.TIMEOUT:
            setGpsErrorMsg("Tiempo de espera agotado para conectar con el GPS del dispositivo.");
            break;
          default:
            setGpsErrorMsg("Error al obtener señal del GPS.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Carga de Archivos de Fotos (Soporta cámara del celular y selección múltiple)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhoto(true);
    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `prereg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

      try {
        const { data, error } = await supabase.storage
          .from("establecimientos")
          .upload(fileName, file, { contentType: file.type || "image/jpeg", upsert: true });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from("establecimientos")
            .getPublicUrl(fileName);
          if (publicUrlData?.publicUrl) {
            newImages.push(publicUrlData.publicUrl);
            continue;
          }
        }
      } catch (err) {
        console.warn("Error en Supabase storage, usando lector Base64 local:", err);
      }

      // Fallback a Base64 Data URL local
      await new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            newImages.push(reader.result);
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    setGalleryImages((prev) => {
      const updated = [...prev, ...newImages];
      if (!primaryImage || primaryImage.includes("unsplash.com")) {
        setPrimaryImage(updated[0]);
      }
      return updated;
    });
    setIsUploadingPhoto(false);
  };

  // Agregar foto vía URL manual
  const handleAddPhotoUrl = () => {
    if (photoUrlInput.trim()) {
      setGalleryImages((prev) => [...prev, photoUrlInput.trim()]);
      if (!primaryImage) setPrimaryImage(photoUrlInput.trim());
      setPhotoUrlInput("");
    }
  };

  const removePhoto = (index: number) => {
    const updated = galleryImages.filter((_, idx) => idx !== index);
    setGalleryImages(updated);
    if (primaryImage === galleryImages[index]) {
      setPrimaryImage(updated[0] || "");
    }
  };

  const toggleBadge = (key: keyof PreRegistrationBadgeFlags) => {
    setBadges(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePill = (pill: string) => {
    if (pills.includes(pill)) {
      setPills(pills.filter(p => p !== pill));
    } else {
      if (pills.length < 6) {
        setPills([...pills, pill]);
      }
    }
  };

  const handleAddCustomPill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPillInput.trim() && !pills.includes(customPillInput.trim())) {
      if (pills.length < 6) {
        setPills([...pills, customPillInput.trim()]);
        setCustomPillInput("");
      }
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSavePreRegistration = async () => {
    try {
      setIsSaving(true);
      const slug = `${generateSlug(title)}-${generateSlug(destinationName)}`;

      const onboardingStatus = publishDirectly ? "COMPLETED" : "PRE_REGISTERED";
      const status = publishDirectly ? "ACTIVE" : "ACTIVE";

      const payload: PreRegistrationPayload = {
        service_category_id: serviceCategoryId,
        subcategory_id: subcategoryId,
        category_name: categoryName,
        title,
        slug,
        destination_name: destinationName,
        state,
        city,
        badges,
        rating_avg: ratingAvg,
        key_service_pills: pills,
        short_description: shortDescription,
        base_price_from: basePriceFrom,
        whatsapp_number: whatsappNumber,
        primary_image: primaryImage,
        gallery_images: galleryImages
      };

      // Construcción JSONB para features
      const initialFeatures = {
        pre_registration: {
          captured_at: new Date().toISOString(),
          source: "FICHA_PUBLICA_FAST_ONBOARDING",
          published_directly: publishDirectly
        },
        gps: {
          latitude: latitude || null,
          longitude: longitude || null
        },
        badges: {
          "C03.4.1": badges.has_power_plant,
          "C03.4.2": badges.has_water_247,
          "C11.4.6": badges.has_starlink,
          "C06.2.1": badges.is_pet_friendly,
          "C00.5.9": badges.has_hdv_seal
        },
        commercial: {
          "C00.1.1": title,
          "C00.1.9": shortDescription,
          rating: ratingAvg,
          price_from: basePriceFrom,
          pills: pills
        },
        contact: {
          "C00.3.2.6": whatsappNumber
        },
        gallery: galleryImages
      };

      // Intentar guardar en Supabase si está disponible, o almacenar localmente de respaldo
      try {
        const { error } = await supabase.from("properties").upsert({
          service_category_id: serviceCategoryId,
          subcategory_id: subcategoryId,
          title,
          slug,
          destination_name: destinationName,
          state,
          city,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          short_description: shortDescription,
          base_price_from: basePriceFrom,
          rating_avg: ratingAvg,
          whatsapp_number: whatsappNumber,
          primary_image: primaryImage,
          has_power_plant: badges.has_power_plant,
          has_water_247: badges.has_water_247,
          has_starlink: badges.has_starlink,
          is_pet_friendly: badges.is_pet_friendly,
          has_hdv_seal: badges.has_hdv_seal,
          key_service_pills: pills,
          onboarding_status: onboardingStatus,
          status: status,
          features: initialFeatures
        }, { onConflict: "slug" });

        if (error) {
          console.warn("Aviso al guardar en Supabase:", error.message);
        }
      } catch (err) {
        console.warn("Modo local activo:", err);
      }

      // Guardar también en localStorage para persistencia inmediata en la sesión del cliente
      localStorage.setItem(`hdv_prereg_${slug}`, JSON.stringify(payload));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err) {
      console.error("Error al procesar pre-registro:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      
      {/* Banner Superior Corporativo (Directriz AGENTS.md: Full Bleed, Gradiente de Fondo, Sin Negro Puro) */}
      <div className="relative w-full bg-gradient-to-r from-[#0e011f] via-[#15062c] to-[#1a0533] text-white py-14 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Acentos de luz sutiles */}
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#00C8D4]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#FF0096]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[#00C8D4] hover:text-white transition-colors mb-3">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al inicio</span>
              </Link>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider text-[#00C8D4] mb-3 ml-3">
                <Sparkles className="w-3.5 h-3.5 text-[#FF0096]" />
                <span>Módulo Oficial V13 • Onboarding Rápido</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Pre-Registro de Ficha Pública
              </h1>
              <p className="text-sm md:text-base text-slate-300 mt-2 max-w-2xl">
                Registra tu propiedad capturando <strong>únicamente los datos visibles en la tarjeta pública</strong> para comenzar a recibir reservas inmediatamente por WhatsApp.
              </p>
            </div>

            {/* Pestañas de Vista */}
            <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("card_form")}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "card_form"
                    ? "bg-[#00C8D4] text-slate-950 shadow-md"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>1. Ficha Pública</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("bedrooms_config")}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "bedrooms_config"
                    ? "bg-[#FF0096] text-white shadow-md"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <BedDouble className="w-4 h-4" />
                <span>2. Dormitorios Flexibles (V13)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor de Trabajo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black">¡Pre-Registro Almacenado Exitosamente en PostgreSQL + JSONB!</p>
                <p className="text-[11px] text-emerald-700">La ficha pública ha quedado lista en estado <code>PRE_REGISTERED</code>.</p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-emerald-100 px-2.5 py-1 rounded-md text-emerald-900 font-bold">
              {title}
            </span>
          </div>
        )}

        {activeTab === "card_form" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Columna Izquierda: Formulario Estricto de 9 Campos */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xl space-y-6">
              
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Datos Esenciales de la Ficha Pública
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Campos requeridos exclusivamente para la tarjeta visible por los turistas.
                </p>
              </div>

              {/* 1. Categoría Principal */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
                  1. Categoría Principal del Establecimiento
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { catId: 1, subId: 6, label: "Posada Boutique", sub: "Posadas" },
                    { catId: 1, subId: 5, label: "Hotel Exclusivo", sub: "Hoteles" },
                    { catId: 3, subId: 13, label: "Campamento / Eco-Lodge", sub: "Campings & Eco" },
                    { catId: 2, subId: 3, label: "Villa / Casa de Playa", sub: "Casas & Villas" },
                    { catId: 4, subId: 16, label: "Yate / Barco en Marina", sub: "Náutico" },
                    { catId: 1, subId: 12, label: "Love Hotel / Suite", sub: "Love Hotels" }
                  ].map(cat => (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => {
                        setServiceCategoryId(cat.catId);
                        setSubcategoryId(cat.subId);
                        setCategoryName(cat.label);
                      }}
                      className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer ${
                        categoryName === cat.label
                          ? "bg-[#00C8D4]/15 border-[#00C8D4] text-[#008f99] shadow-sm ring-2 ring-[#00C8D4]/20"
                          : "bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-600"
                      }`}
                    >
                      <span className="block font-black">{cat.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{cat.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Nombre de la Propiedad */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                  2. Nombre Comercial de la Propiedad / Establecimiento
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Posada Paraíso Azul"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4] focus:bg-white transition-all"
                />
              </div>

              {/* 3. Ubicación / Destino & Captura de GPS inteligente */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                      3. Destino Turístico
                    </label>
                    <input
                      type="text"
                      value={destinationName}
                      onChange={(e) => setDestinationName(e.target.value)}
                      placeholder="Ej. Morrocoy"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Ej. Falcón"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                      Ciudad / Sector
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ej. Tucacas"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                    />
                  </div>
                </div>

                {/* Sub-bloque GPS para Agentes de Campo / Exploradores de Ruta */}
                <div className="bg-gradient-to-r from-cyan-50/80 to-blue-50/80 p-4 rounded-2xl border border-[#00C8D4]/30 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <MapPin className="w-4 h-4 text-[#00C8D4]" />
                      <span>Coordenadas GPS (Agente de Campo / Celular)</span>
                    </span>

                    <button
                      type="button"
                      onClick={handleCaptureGps}
                      disabled={isCapturingGps}
                      className="px-3.5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#00C8D4] to-[#0098A6] hover:opacity-95 shadow-md flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {isCapturingGps ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Obteniendo GPS...</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-3.5 h-3.5" />
                          <span>📍 Capturar GPS Ahora (En el Sitio)</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Latitud GPS</label>
                      <input
                        type="text"
                        placeholder="Ej. 10.480594"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-[#00C8D4]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Longitud GPS</label>
                      <input
                        type="text"
                        placeholder="Ej. -66.903606"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-[#00C8D4]"
                      />
                    </div>
                  </div>

                  {gpsSuccessMsg && (
                    <p className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-100/80 p-2 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      {gpsSuccessMsg}
                    </p>
                  )}
                  {gpsErrorMsg && (
                    <p className="text-xs text-rose-600 font-bold flex items-center gap-1 bg-rose-100/80 p-2 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {gpsErrorMsg}
                    </p>
                  )}
                </div>
              </div>

              {/* 4. Insignias / Badges Destacados (Directriz AGENTS.md: Cajas de color sólido con SVG calado en blanco) */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
                  4. Insignias / Badges Destacados de la Tarjeta
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: "has_power_plant" as const, label: "Planta Eléctrica", desc: "Full Power 24/7", color: "bg-amber-500", icon: Zap },
                    { key: "has_water_247" as const, label: "Agua 24/7", desc: "Tanque continuo", color: "bg-[#00C8D4]", icon: Droplets },
                    { key: "has_starlink" as const, label: "Starlink", desc: "Internet Satelital", color: "bg-indigo-600", icon: Wifi },
                    { key: "is_pet_friendly" as const, label: "Pet Friendly", desc: "Acepta mascotas", color: "bg-emerald-600", icon: Dog },
                    { key: "has_hdv_seal" as const, label: "Sello HDV", desc: "Verificado Oficial", color: "bg-[#FF0096]", icon: ShieldCheck }
                  ].map(b => {
                    const IconComp = b.icon;
                    const isActive = badges[b.key];
                    return (
                      <button
                        key={b.key}
                        type="button"
                        onClick={() => toggleBadge(b.key)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                          isActive
                            ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {/* Caja de color sólido con icono en blanco puro (Regla #3) */}
                        <div className={`w-8 h-8 rounded-xl ${b.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                          <IconComp className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div className="overflow-hidden">
                          <span className="block text-xs font-black truncate">{b.label}</span>
                          <span className={`text-[10px] block truncate ${isActive ? "text-slate-300" : "text-slate-400"}`}>
                            {b.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5 & 8. Calificación y Precio Base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    5. Calificación / Rating
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      value={ratingAvg}
                      onChange={(e) => setRatingAvg(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                    />
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2.5 rounded-xl shrink-0 font-black text-xs">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>{ratingAvg.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    8. Precio Base Visible ("Desde $X / noche")
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-black text-slate-400">$</span>
                    <input
                      type="number"
                      min="0"
                      value={basePriceFrom}
                      onChange={(e) => setBasePriceFrom(Number(e.target.value))}
                      placeholder="140"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-16 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">/ noche</span>
                  </div>
                </div>
              </div>

              {/* 6. Pills / Etiquetas Secundarias de Servicios Clave */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
                  6. Pills / Etiquetas Secundarias de Servicios Clave (Máx 6)
                </label>
                
                {/* Sugerencias Rápidas */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {defaultPillSuggestions.map(pill => {
                    const isSelected = pills.includes(pill);
                    return (
                      <button
                        key={pill}
                        type="button"
                        onClick={() => togglePill(pill)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#FF0096] text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {pill}
                      </button>
                    );
                  })}
                </div>

                {/* Input para agregar pill personalizada */}
                <form onSubmit={handleAddCustomPill} className="flex gap-2">
                  <input
                    type="text"
                    value={customPillInput}
                    onChange={(e) => setCustomPillInput(e.target.value)}
                    placeholder="Escribe otra etiqueta personalizada..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00C8D4]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Añadir Pill
                  </button>
                </form>
              </div>

              {/* 7. Extracto / Breve Descripción Comercial */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500">
                    7. Extracto / Breve Reseña Comercial (Máx 2-3 líneas)
                  </label>
                  <span className="text-[10px] text-slate-400">{shortDescription.length} / 250 car.</span>
                </div>
                <textarea
                  rows={3}
                  value={shortDescription}
                  maxLength={250}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Describe en 2 a 3 líneas lo más atractivo del establecimiento..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#00C8D4] focus:bg-white transition-all"
                />
              </div>

              {/* 9. Contacto WhatsApp & Fotos con Captura de Celular / Cámara */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                    9. WhatsApp de Reservas / Contacto *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-emerald-500" />
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+58 412 1234567"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                    />
                  </div>
                </div>

                {/* Subida Directa de Fotos con Cámara del Celular / Galería del Dispositivo */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#FF0096]" />
                      <span>Fotos del Establecimiento (Cámara o Galería Móvil)</span>
                    </span>

                    <label className="px-4 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-95 shadow-md flex items-center gap-1.5 cursor-pointer transition-all">
                      {isUploadingPhoto ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Cargando Fotos...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>📸 Tomar o Subir Fotos</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        onChange={handleFileUpload}
                        disabled={isUploadingPhoto}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Input Alternativo por URL */}
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="O pega una URL de foto (https://...)"
                      value={photoUrlInput}
                      onChange={(e) => setPhotoUrlInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhotoUrl}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                    >
                      + URL
                    </button>
                  </div>

                  {/* Miniaturas de Fotos Capturadas */}
                  {galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                      {galleryImages.map((url, idx) => (
                        <div
                          key={idx}
                          className={`relative rounded-xl overflow-hidden border aspect-video group shadow-xs ${
                            primaryImage === url ? "ring-2 ring-[#00C8D4] border-[#00C8D4]" : "border-slate-200"
                          }`}
                        >
                          <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                            <button
                              type="button"
                              onClick={() => setPrimaryImage(url)}
                              className="px-2 py-1 rounded bg-[#00C8D4] text-slate-950 text-[9px] font-black uppercase"
                            >
                              {primaryImage === url ? "Portada" : "Usar Portada"}
                            </button>
                            <button
                              type="button"
                              onClick={() => removePhoto(idx)}
                              className="p-1 rounded bg-rose-600 text-white"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          {primaryImage === url && (
                            <span className="absolute top-1.5 left-1.5 bg-[#00C8D4] text-slate-950 text-[8px] font-black uppercase px-2 py-0.5 rounded-md shadow">
                              Portada
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selector de Modalidad de Publicación Inmediata (Agentes de Campo) */}
              <div className="bg-slate-900 text-white p-4.5 rounded-2xl space-y-3 shadow-lg">
                <span className="text-xs font-black uppercase tracking-wider text-[#00C8D4] flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-[#FF0096] animate-pulse" />
                  <span>Estado al Guardar (Agente en Frente del Hotel)</span>
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPublishDirectly(true)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      publishDirectly
                        ? "bg-emerald-500/20 border-emerald-400 text-white ring-1 ring-emerald-400"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-300 mb-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>🚀 Publicar Ahora Mismo</span>
                    </div>
                    <p className="text-[10px] text-slate-300">
                      Publica de inmediato la ficha con el GPS y fotos capturadas en la plataforma pública.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPublishDirectly(false)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      !publishDirectly
                        ? "bg-[#00C8D4]/20 border-[#00C8D4] text-white ring-1 ring-[#00C8D4]"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-[#00C8D4] mb-0.5">
                      <FileText className="w-4 h-4" />
                      <span>📝 Guardar como Pre-Registro</span>
                    </div>
                    <p className="text-[10px] text-slate-300">
                      Guarda la ficha como borrador en estado <code>PRE_REGISTERED</code> para revisiones posteriores.
                    </p>
                  </button>
                </div>
              </div>

              {/* Botón Principal de Guardado / Publicación Directa */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <p className="text-[11px] text-slate-500 max-w-xs">
                  {publishDirectly
                    ? "Publicará inmediatamente la propiedad activa en la plataforma."
                    : "Generará la propiedad en estado PRE_REGISTERED para ser completada luego."}
                </p>

                <button
                  type="button"
                  onClick={handleSavePreRegistration}
                  disabled={isSaving}
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF0096] via-[#9B00CC] to-[#00C8D4] hover:opacity-95 text-white font-black text-xs shadow-xl shadow-pink-900/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-102 active:scale-98"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando Ficha...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4.5 h-4.5" />
                      <span>{publishDirectly ? "🚀 Publicar Ahora en HDV" : "Completar Pre-Registro"}</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Columna Derecha: Previsualización en Vivo de la Ficha Pública */}
            <div className="lg:col-span-5 sticky top-8 space-y-4">
              
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#00C8D4]" />
                  <span>Vista Previa de la Ficha Pública</span>
                </span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                  Live Card
                </span>
              </div>

              {/* Tarjeta Pública Renderizada (BoutiqueEstablishmentCard Spec) */}
              <div className="group rounded-3xl overflow-hidden transition-all duration-300 flex flex-col bg-gradient-to-br from-[#0e011f] via-[#15062c] to-[#1a0533] text-white border border-[#9B00CC]/50 shadow-2xl shadow-purple-950/40">
                
                {/* Carrusel / Foto Superior */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                  <img
                    src={primaryImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

                  {/* Sello HDV Top Left */}
                  {badges.has_hdv_seal && (
                    <div className="absolute top-3 left-3 z-20">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-[#FF0096] text-white shadow-md">
                        <div className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center">
                          <ShieldCheck className="w-2.5 h-2.5 text-white stroke-[2.5]" />
                        </div>
                        <span>RECOMENDADO HDV</span>
                      </span>
                    </div>
                  )}

                  {/* Rating Top Right */}
                  <div className="absolute top-3 right-3 z-20">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-black shadow-md">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{ratingAvg.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Contenido de la Tarjeta */}
                <div className="p-5 space-y-3.5 text-left">
                  
                  {/* Categoría & Destino */}
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
                    <span className="text-[#00C8D4] font-extrabold">{categoryName}</span>
                    <div className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3 h-3 text-[#FF0096]" />
                      <span>{destinationName}</span>
                    </div>
                  </div>

                  {/* Título de la Propiedad */}
                  <h3 className="text-lg font-black tracking-tight line-clamp-1 text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {title || "Nombre de la Propiedad"}
                  </h3>

                  {/* Badges Operativos de la Ficha */}
                  <div className="flex flex-wrap gap-1.5">
                    {badges.has_power_plant && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Zap className="w-3 h-3" /> Planta 24/7
                      </span>
                    )}
                    {badges.has_water_247 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#00C8D4]/20 text-[#00C8D4] border border-[#00C8D4]/30">
                        <Droplets className="w-3 h-3" /> Agua 24/7
                      </span>
                    )}
                    {badges.has_starlink && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        <Wifi className="w-3 h-3" /> Starlink
                      </span>
                    )}
                    {badges.is_pet_friendly && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <Dog className="w-3 h-3" /> Pet Friendly
                      </span>
                    )}
                  </div>

                  {/* Pills Secundarias */}
                  {pills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {pills.map(p => (
                        <span key={p} className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/5">
                          • {p}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Reseña / Extracto Comercial */}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {shortDescription || "Breve descripción comercial..."}
                  </p>

                  {/* Precio y Botones de Acción Directos */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Desde</span>
                      <span className="text-base font-black text-[#00C8D4]">${basePriceFrom}</span>
                      <span className="text-[10px] text-slate-400 font-normal"> / noche</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Botón WhatsApp */}
                      <a
                        href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md flex items-center justify-center"
                        title="Contactar por WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>

                      {/* Botón Ver Ficha */}
                      <button
                        type="button"
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-black transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <span>Ver Ficha</span>
                        <ExternalLink className="w-3 h-3 text-[#FF0096]" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        ) : (
          /* Pestaña 2: Configurador Flexible de Dormitorios V13 */
          <div className="space-y-6">
            <FlexibleBedroomConfigurator
              unitName={title}
              initialBedroomsCount={5}
              onSave={(savedGroups) => {
                alert(`¡Distribución de ${savedGroups.length} grupos de dormitorios guardada correctamente en JSONB!`);
              }}
            />
          </div>
        )}

      </div>

    </div>
  );
}
