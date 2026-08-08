import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { Link, useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Building2, ArrowLeft, MapPin, Navigation, Plus, Trash2,
  Star, Image as ImageIcon, ExternalLink, Loader2, Upload,
  Sparkles, Wand2, Search, CheckCircle2, ChevronRight, ChevronLeft,
  FileText, ShieldCheck, Phone, Mail, Clock, DollarSign, Award, Compass, Heart, Mountain, Tent, Ship
} from "lucide-react";
import { fetchEstablishmentFromGoogleAi } from "@/lib/services/googleAiFillService";
import { AmenitiesSelector } from "@/components/admin/AmenitiesSelector";
import { parseServicesList, PROPERTY_TYPES_DOCUMENT77 } from "@/lib/amenitiesList";

interface Category { id: number; name: string; }
interface Destination { id: number; name: string; }
interface PhotoEntry { url: string; isPrimary: boolean; }

const PRICE_LEVELS = [
  { value: "economico", label: "Económico ($)" },
  { value: "moderado", label: "Moderado ($$)" },
  { value: "premium", label: "Premium ($$$)" },
  { value: "lujo", label: "Lujo ($$$$)" },
];

const VE_STATES = [
  "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar", "Carabobo", "Cojedes",
  "Delta Amacuro", "Distrito Capital", "Falcón", "Guárico", "Lara", "Mérida", "Miranda",
  "Monagas", "Nueva Esparta", "Portuguesa", "Sucre", "Táchira", "Trujillo", "Vargas",
  "Yaracuy", "Zulia",
];

const compressImage = (base64Str: string, maxWidth = 1000, maxHeight = 1000, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

export function AdminEstablecimientoNuevo() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/admin/establecimientos/:id/editar");
  const editId = match ? (params as any)?.id : null;
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  const { data: categories = [], isLoading: catLoading } = useQuery<Category[]>({
    queryKey: ["admin-categories-list"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("categories").select("id, name").order("name");
        if (error) throw error;
        return data || [];
      } catch {
        const localCats = JSON.parse(localStorage.getItem("hdv_mock_categories") || "[]");
        return localCats;
      }
    }
  });

  const { data: destinations = [], isLoading: destLoading } = useQuery<Destination[]>({
    queryKey: ["admin-destinations-list"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("destinations").select("id, name").order("name");
        if (error) throw error;
        return data || [];
      } catch {
        const localDests = JSON.parse(localStorage.getItem("hdv_mock_destinations") || "[]");
        return localDests;
      }
    }
  });

  // Step 1: General & Location Data
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [propertyType, setPropertyType] = useState("hoteles");
  const [categoryId, setCategoryId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [description, setDescription] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [yearRenovated, setYearRenovated] = useState("");
  const [roadType, setRoadType] = useState("Calle");
  const [roadName, setRoadName] = useState("");
  const [roadNumber, setRoadNumber] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [accessDirections, setAccessDirections] = useState("");
  const [priceLevel, setPriceLevel] = useState("moderado");

  // Step 2: Fiscal Data & Billing
  const [taxName, setTaxName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [taxAddress, setTaxAddress] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [vatRegime, setVatRegime] = useState("General 16%");

  // Step 3: Operational Contact
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  // Step 4 to 6 & 8: Services & Documento 77 Amenities
  const [services, setServices] = useState<string[]>([]);

  // Step 7: Places of Interest
  const [nearbyPoints, setNearbyPoints] = useState("");

  // Media
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [photoUrl, setPhotoUrl] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const isSpecificType = ["campings", "glamping", "barcos", "love_hotels", "chalets_montana"].includes(propertyType);

  const autoSlug = (val: string) =>
    val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  const handleAiAutoFill = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiQuery.trim()) {
      triggerToast("⚠️ Escribe el nombre de un hotel o posada para buscar.");
      return;
    }

    setAiLoading(true);
    triggerToast("🔍 Consultando Google AI y datos de Venezuela...");

    try {
      const data = await fetchEstablishmentFromGoogleAi(aiQuery);

      setName(data.name || aiQuery);
      setSlug(autoSlug(data.name || aiQuery));
      if (data.city) setCity(data.city);
      if (data.state && VE_STATES.includes(data.state)) setState(data.state);
      if (data.address) setAddress(data.address);
      if (data.phone) setPhone(data.phone);
      if (data.whatsapp) setWhatsapp(data.whatsapp);
      if (data.email) setEmail(data.email);
      if (data.website) setWebsite(data.website);
      if (data.instagram) setInstagram(data.instagram);
      if (data.price_level) setPriceLevel(data.price_level);
      if (data.description) setDescription(data.description.slice(0, 200));
      if (data.latitude) setLatitude(data.latitude);
      if (data.longitude) setLongitude(data.longitude);
      if (data.services && Array.isArray(data.services) && data.services.length > 0) {
        setServices(data.services);
      }

      triggerToast(`✨ ¡Formulario autocompletado con éxito para "${data.name}"!`);
    } catch (err: any) {
      triggerToast("⚠️ Error al autocompletar. Puedes rellenar los datos manualmente.");
    } finally {
      setAiLoading(false);
    }
  };

  const { data: establishment, isLoading: estLoading } = useQuery({
    queryKey: ["admin-establishment", editId],
    queryFn: async () => {
      if (!editId) return null;
      const numericId = parseInt(editId);
      if (isNaN(numericId)) throw new Error("ID inválido");

      const { data, error } = await supabase
        .from("establishments")
        .select(`
          *,
          establishment_images (*)
        `)
        .eq("id", numericId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!editId,
  });

  useEffect(() => {
    if (establishment) {
      setName(establishment.name || "");
      setSlug(establishment.slug || "");
      setCategoryId(establishment.category_id ? String(establishment.category_id) : "");
      setDestinationId(establishment.destination_id ? String(establishment.destination_id) : "");
      setCity(establishment.city || "");
      setState(establishment.state || "");
      setAddress(establishment.address || "");
      setPhone(establishment.phone || "");
      setWhatsapp(establishment.whatsapp || "");
      setEmail(establishment.email || "");
      setWebsite(establishment.website || "");
      setInstagram(establishment.instagram || "");
      setPriceLevel(establishment.price_level || "moderado");
      setDescription(establishment.description || "");
      setLatitude(establishment.latitude ? String(establishment.latitude) : "");
      setLongitude(establishment.longitude ? String(establishment.longitude) : "");
      if (establishment.services) {
        setServices(parseServicesList(establishment.services));
      }

      try {
        if (establishment?.establishment_images && Array.isArray(establishment.establishment_images)) {
          const sortedImgs = [...establishment.establishment_images].sort(
            (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
          );
          setPhotos(sortedImgs.map((img: any) => ({
            url: img.image_url,
            isPrimary: !!img.is_primary
          })));
        }
      } catch (err) {
        console.error("Fallo en mapeo de fotos:", err);
      }
    }
  }, [establishment]);

  const detectLocation = () => {
    if (!navigator.geolocation) { setGpsError("Tu dispositivo no soporta geolocalización"); return; }
    setGpsLoading(true); setGpsError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(String(pos.coords.latitude));
        setLongitude(String(pos.coords.longitude));
        setGpsLoading(false);
        triggerToast(`Ubicación detectada: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
      },
      () => {
        setGpsLoading(false);
        setGpsError("No se pudo obtener la ubicación física.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const addPhoto = () => {
    const url = photoUrl.trim();
    if (!url) return;
    const isFirst = photos.length === 0;
    setPhotos((prev) => [...prev, { url, isPrimary: isFirst }]);
    setPhotoUrl("");
    setTimeout(() => photoInputRef.current?.focus(), 50);
  };

  const removePhoto = (i: number) => {
    setPhotos((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      if (next.length > 0 && !next.some((p) => p.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });
  };

  const setPrimary = (i: number) => {
    setPhotos((prev) => prev.map((p, idx) => ({ ...p, isPrimary: idx === i })));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) {
        throw new Error("El Nombre del establecimiento es obligatorio.");
      }

      setToastMessage("Sincronizando información y fotos...");
      const cleanPhotosUrls: PhotoEntry[] = [];

      for (const [index, photo] of photos.entries()) {
        if (!photo.url.startsWith("data:")) {
          cleanPhotosUrls.push(photo);
          continue;
        }

        try {
          const response = await fetch(photo.url);
          const blob = await response.blob();
          const fileExt = "jpg";
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("establecimientos")
            .upload(filePath, blob, {
              contentType: "image/jpeg",
              upsert: true
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("establecimientos")
            .getPublicUrl(filePath);

          cleanPhotosUrls.push({
            url: publicUrl,
            isPrimary: photo.isPrimary
          });
        } catch (uploadFailErr: any) {
          console.error(`Error subiendo foto #${index + 1}:`, uploadFailErr.message);
          throw new Error(`Fallo en Storage: ${uploadFailErr.message}`);
        }
      }

      const payload: Record<string, any> = {
        name,
        slug: slug || autoSlug(name),
        category_id: categoryId ? parseInt(categoryId) : 1,
        destination_id: destinationId ? parseInt(destinationId) : null,
        city,
        state,
        address,
        phone,
        whatsapp,
        email,
        website,
        instagram,
        price_level: priceLevel,
        description: description.slice(0, 200),
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        services: JSON.stringify(services),
        status: "approved"
      };

      let establishmentId: number;

      if (editId) {
        establishmentId = parseInt(editId);
        const { error } = await supabase
          .from("establishments")
          .update(payload)
          .eq("id", establishmentId);

        if (error) throw error;
        await supabase.from("establishment_images").delete().eq("establishment_id", establishmentId);
      } else {
        const { data, error } = await supabase
          .from("establishments")
          .insert({
            ...payload,
            has_reservations_enabled: false,
            created_at: new Date().toISOString()
          })
          .select("id")
          .single();

        if (error) throw error;
        if (!data?.id) throw new Error("No se obtuvo el ID del nuevo establecimiento.");
        establishmentId = data.id;
      }

      if (cleanPhotosUrls.length > 0) {
        const insertPayload = cleanPhotosUrls.map((p, i) => ({
          establishment_id: establishmentId,
          image_url: p.url,
          is_primary: p.isPrimary,
          sort_order: i
        }));

        const { error: imgErr } = await supabase
          .from("establishment_images")
          .insert(insertPayload);

        if (imgErr) throw imgErr;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-establishments"] });
      setLocation("/admin/establecimientos");
    },
    onError: (err: any) => {
      console.error("Error al guardar:", err);
      alert(`⚠️ Error en Supabase:\n${err.message || "Revisa la consola"}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  const busy = saveMutation.isPending || catLoading || destLoading || estLoading;

  if (authLoading || (editId && estLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
        <p className="text-gray-500 text-xs font-bold">Cargando datos de seguridad...</p>
      </div>
    );
  }

  const inp = "w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 font-semibold text-gray-900";
  const lbl = "text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block";

  const WIZARD_STEPS = [
    { id: 1, title: "1. Datos Generales & Ubicación" },
    { id: 2, title: "2. Datos Fiscales" },
    { id: 3, title: "3. Contacto Operativo" },
    { id: 4, title: "4. Zonas Comunes (C01.3)" },
    { id: 5, title: "5. Servicios (C02)" },
    { id: 6, title: "6. Políticas & Accesibilidad (C03)" },
    { id: 7, title: "7. Lugares de Interés" },
    { id: 8, title: "8. Específicos (C04)", conditional: true }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 pb-24 font-sans">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden py-8" style={{ background: "linear-gradient(135deg, #0e0120, #1a0533)" }}>
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: "#FF0096" }} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <Link href="/admin/establecimientos">
            <button className="flex items-center gap-1.5 text-white/60 text-xs mb-4 hover:text-white transition-colors cursor-pointer font-bold">
              <ArrowLeft className="w-4 h-4" /> Volver a Establecimientos
            </button>
          </Link>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-pink-500/20 text-[#FF0096]">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-[#00C8D4] tracking-wider">Documento 77 V.1 — Asistente Guiado</span>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {editId ? "Editar Ficha de Alta" : "Ficha de Alta / Configuración de Propiedad"}
                </h1>
              </div>
            </div>
            <span className="px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-full border border-white/20">
              Paso {currentStep} de 8
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        
        {/* Wizard Step Bar (Cluster de Pasos 1 a 8) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Pasos del Asistente (Wizard)</span>
            <span className="text-[10px] font-bold text-slate-500">Garantiza completar todos los campos clave</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
            {WIZARD_STEPS.map((s) => {
              const active = currentStep === s.id;
              const isCompleted = currentStep > s.id;
              const isPaso8Hidden = s.id === 8 && !isSpecificType;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentStep(s.id)}
                  className={`p-2 rounded-xl text-left transition-all text-[11px] font-bold flex flex-col justify-between border cursor-pointer ${
                    active
                      ? "bg-[#0e011f] text-white border-[#FF0096] shadow-sm"
                      : isCompleted
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : isPaso8Hidden
                      ? "bg-slate-100 text-slate-400 border-slate-200 opacity-60"
                      : "bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[9px] uppercase font-black tracking-wider">Paso {s.id}</span>
                    {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                  </div>
                  <span className="truncate mt-1 font-sans">{s.title.replace(/^\d+\.\s*/, "")}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Main Container */}
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          
          {/* Card de Autocompletado por Google AI */}
          {currentStep === 1 && (
            <div className="rounded-2xl p-6 border shadow-lg relative overflow-hidden text-white" style={{ background: "linear-gradient(135deg, #0e011f 0%, #1a0533 100%)", borderColor: "#00C8D4" }}>
              <div className="flex items-center justify-between gap-3 mb-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#00C8D4] text-white shrink-0 shadow-md">
                    <Sparkles className="w-5 h-5 text-white stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-sm tracking-tight">Autocompletar con Google AI</h2>
                    <p className="text-white/60 text-xs mt-0.5 font-medium">Extrae datos reales en segundos rellenando el nombre.</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 mt-4 relative z-10">
                <input
                  type="text"
                  placeholder="Ej: Posada Galápagos Los Roques, Hotel Lidotel Valencia..."
                  className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00C8D4] font-semibold"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAiAutoFill}
                  disabled={aiLoading}
                  className="px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md"
                  style={{ background: "linear-gradient(90deg, #00C8D4 0%, #9B00CC 100%)" }}
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  <span>Autocompletar</span>
                </button>
              </div>
            </div>
          )}

          {/* PASO 1: DATOS GENERALES / UBICACIÓN / TAMAÑO */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <h2 className="font-bold text-gray-900 text-sm pb-2 border-b flex items-center gap-2">
                <Building2 className="w-4 h-4 text-pink-500" /> PASO 1: Datos Generales, Categorización & Ubicación
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={lbl}>Nombre Comercial de la Propiedad *</label>
                  <input
                    required
                    placeholder="Ej: Posada Galápagos"
                    className={inp}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!slug || slug === autoSlug(name)) setSlug(autoSlug(e.target.value));
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Tipo de Alojamiento (Documento 77 C04.1) *</label>
                    <select
                      className={inp}
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                    >
                      {PROPERTY_TYPES_DOCUMENT77.map((pt) => (
                        <option key={pt.id} value={pt.id}>{pt.label} ({pt.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={lbl}>Licencia Turística / Registro No.</label>
                    <input placeholder="Ej: RT-123456" className={inp} value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className={lbl}>Descripción o Reseña Comercial (Máximo 150 - 200 caracteres)</label>
                  <textarea
                    rows={3}
                    maxLength={200}
                    placeholder="Reseña corta y persuasiva..."
                    className={inp + " resize-none"}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <span className="text-[10px] text-slate-400 font-bold block text-right">{description.length}/200 caracteres</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Año de Construcción</label>
                    <input placeholder="Ej: 2018" className={inp} value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} />
                  </div>
                  <div>
                    <label className={lbl}>Año de Última Reforma</label>
                    <input placeholder="Ej: 2024" className={inp} value={yearRenovated} onChange={(e) => setYearRenovated(e.target.value)} />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#00C8D4]" /> Dirección Detallada de la Propiedad
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className={lbl}>Tipo de Vía</label>
                      <input placeholder="Calle / Av." className={inp} value={roadType} onChange={(e) => setRoadType(e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <label className={lbl}>Nombre de la Vía</label>
                      <input placeholder="Nombre de vía..." className={inp} value={roadName} onChange={(e) => setRoadName(e.target.value)} />
                    </div>
                    <div>
                      <label className={lbl}>Número</label>
                      <input placeholder="No." className={inp} value={roadNumber} onChange={(e) => setRoadNumber(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={lbl}>Estado de Venezuela</label>
                      <select className={inp} value={state} onChange={(e) => setState(e.target.value)}>
                        <option value="">Seleccionar...</option>
                        {VE_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Localidad / Ciudad</label>
                      <input placeholder="Ej: Gran Roque" className={inp} value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                    <div>
                      <label className={lbl}>Código Postal</label>
                      <input placeholder="Ej: 1010" className={inp} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Dirección física completa</label>
                    <input placeholder="Dirección completa..." className={inp} value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Sitio Web / Red Social</label>
                    <input placeholder="https://..." className={inp} value={website} onChange={(e) => setWebsite(e.target.value)} />
                  </div>
                  <div>
                    <label className={lbl}>Indicaciones de acceso</label>
                    <input placeholder="Ej: Acceso por carretera N-340 km 12" className={inp} value={accessDirections} onChange={(e) => setAccessDirections(e.target.value)} />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <button type="button" onClick={detectLocation} disabled={gpsLoading} className="w-full py-2 rounded-xl text-white text-xs font-bold bg-[#00C8D4]">
                    {gpsLoading ? "Detectando..." : "Detectar Coordenadas GPS"}
                  </button>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <input type="number" step="any" placeholder="Latitud" className={inp} value={latitude} onChange={(e) => setLatitude(e.target.value)} />
                    <input type="number" step="any" placeholder="Longitud" className={inp} value={longitude} onChange={(e) => setLongitude(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: DATOS FISCALES Y DE FACTURACIÓN */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <h2 className="font-bold text-gray-900 text-sm pb-2 border-b flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" /> PASO 2: Datos Fiscales y de Facturación
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Razón Social / Nombre del Titular</label>
                    <input placeholder="Ej: Hostelería y Turismo S.A." className={inp} value={taxName} onChange={(e) => setTaxName(e.target.value)} />
                  </div>
                  <div>
                    <label className={lbl}>NIF / CIF / RIF Fiscal</label>
                    <input placeholder="Ej: J-12345678-9" className={inp} value={taxId} onChange={(e) => setTaxId(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className={lbl}>Dirección Fiscal Completa</label>
                  <input placeholder="Dirección registrada en el RIF/Registro..." className={inp} value={taxAddress} onChange={(e) => setTaxAddress(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Email para Facturación</label>
                    <input type="email" placeholder="facturacion@hotel.com" className={inp} value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className={lbl}>Datos de Pago / Cuenta Bancaria / Zelle</label>
                    <input placeholder="Cuenta / Zelle / Pago Móvil..." className={inp} value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className={lbl}>Régimen de IVA Aplicable</label>
                  <select className={inp} value={vatRegime} onChange={(e) => setVatRegime(e.target.value)}>
                    <option value="General 16%">General 16%</option>
                    <option value="Exento">Exento de IVA</option>
                    <option value="Reducido">Reducido Especial</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: CONTACTO OPERATIVO */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <h2 className="font-bold text-gray-900 text-sm pb-2 border-b flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500" /> PASO 3: Contacto Operativo & Recepción
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Nombre y Apellidos de Persona de Contacto</label>
                    <input placeholder="Ej: Juan Pérez" className={inp} value={contactName} onChange={(e) => setContactName(e.target.value)} />
                  </div>
                  <div>
                    <label className={lbl}>Cargo de la Persona de Contacto</label>
                    <input placeholder="Ej: Gerente General / Recepcionista" className={inp} value={contactRole} onChange={(e) => setContactRole(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={lbl}>Teléfono Emergencias / Recepción 24h</label>
                    <input placeholder="+58 412..." className={inp} value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div>
                    <label className={lbl}>Email para Recepción de Reservas</label>
                    <input type="email" placeholder="reservas@hotel.com" className={inp} value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <label className={lbl}>WhatsApp Directo</label>
                    <input placeholder="+58 424..." className={inp} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 4: ZONAS COMUNES E INSTALACIONES */}
          {currentStep === 4 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <h2 className="font-bold text-gray-900 text-sm pb-2 border-b flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00C8D4]" /> PASO 4: Zonas Comunes e Instalaciones del Establecimiento (C01.3)
              </h2>
              <AmenitiesSelector selectedServices={services} onChange={setServices} />
            </div>
          )}

          {/* PASO 5: SERVICIOS Y EXPERIENCIAS */}
          {currentStep === 5 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <h2 className="font-bold text-gray-900 text-sm pb-2 border-b flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF0096]" /> PASO 5: Servicios y Experiencias (C02)
              </h2>
              <AmenitiesSelector selectedServices={services} onChange={setServices} />
            </div>
          )}

          {/* PASO 6: GESTIÓN, POLÍTICAS Y LOGÍSTICA */}
          {currentStep === 6 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <h2 className="font-bold text-gray-900 text-sm pb-2 border-b flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#9B00CC]" /> PASO 6: Gestión, Políticas y Logística (C03)
              </h2>
              <AmenitiesSelector selectedServices={services} onChange={setServices} />
            </div>
          )}

          {/* PASO 7: LUGARES DE INTERÉS */}
          {currentStep === 7 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <h2 className="font-bold text-gray-900 text-sm pb-2 border-b flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-500" /> PASO 7: Lugares de Interés y Distancias
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={lbl}>Puntos de Interés Cercanos (Playas, Parques, Aeropuertos)</label>
                  <textarea
                    rows={4}
                    placeholder="Ej: A 5 min de la playa, A 10 km del Aeropuerto Internacional..."
                    className={inp + " resize-none"}
                    value={nearbyPoints}
                    onChange={(e) => setNearbyPoints(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASO 8: INSTALACIONES Y SERVICIOS ESPECÍFICOS (CONDICIONAL) */}
          {currentStep === 8 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <h2 className="font-bold text-gray-900 text-sm pb-2 border-b flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" /> PASO 8: Instalaciones y Servicios Específicos por Tipología (C04)
              </h2>
              {isSpecificType ? (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold">
                    ✨ Opciones específicas activadas para la tipología elegida en el Paso 1: <span className="uppercase">{propertyType.replace("_", " ")}</span>.
                  </div>
                  <AmenitiesSelector selectedServices={services} onChange={setServices} />
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <p className="text-xs font-bold text-slate-600">
                    Este paso aplica únicamente para las tipologías: Campings, Barcos, Love Hotels o Chalets de Montaña.
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Para la tipología actual ({propertyType}) puedes continuar directamente al guardado final.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Galería de Fotos (Disponible al final) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-gray-900 text-sm pb-2 border-b flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-purple-500" /> Galería de Fotos e Imágenes Principales
            </h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                ref={photoInputRef}
                placeholder="Pegar enlace (URL) de imagen..."
                className={inp + " flex-1"}
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
              />
              <div className="flex gap-2">
                <button type="button" onClick={addPhoto} className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl">
                  + URL
                </button>
                <label className="px-4 py-2 bg-pink-600 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Fotos</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple={true}
                    className="hidden"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      const newPhotos: PhotoEntry[] = [];
                      for (const file of Array.from(files)) {
                        await new Promise<void>((resolve) => {
                          const reader = new FileReader();
                          reader.onload = async () => {
                            const rawUrl = reader.result as string;
                            const url = await compressImage(rawUrl);
                            newPhotos.push({ url, isPrimary: photos.length === 0 && newPhotos.length === 0 });
                            resolve();
                          };
                          reader.readAsDataURL(file);
                        });
                      }
                      setPhotos((prev) => [...prev, ...newPhotos]);
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {photos.map((photo, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden border-2" style={{ borderColor: photo.isPrimary ? "#9B00CC" : "#E5E7EB" }}>
                  <img src={photo.url} className="w-full h-24 object-cover" />
                  {photo.isPrimary && (
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[9px] font-black text-white bg-purple-600 z-10">
                      Principal
                    </span>
                  )}
                  <div className="absolute top-1.5 right-1.5 flex gap-1.5 z-10">
                    {!photo.isPrimary && (
                      <button type="button" onClick={() => setPrimary(i)} className="w-7 h-7 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-amber-500 shadow-md">
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}
                    <button type="button" onClick={() => removePhoto(i)} className="w-7 h-7 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-red-500 shadow-md">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>

            {currentStep < 8 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(8, prev + 1))}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#00C8D4] hover:bg-[#00b2be] flex items-center gap-1 cursor-pointer shadow-md"
              >
                <span>Siguiente Paso</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={busy}
                className="px-8 py-2.5 rounded-xl text-white text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-600 border border-pink-700 disabled:opacity-50 shadow-lg cursor-pointer"
              >
                {busy ? "Sincronizando..." : editId ? "Confirmar Cambios" : "Guardar Ficha Oficial"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}