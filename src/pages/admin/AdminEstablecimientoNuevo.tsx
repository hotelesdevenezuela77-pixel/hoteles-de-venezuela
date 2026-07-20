import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { Link, useLocation, useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { supabase } from "@/lib/supabase";
import {
  Building2, ArrowLeft, MapPin, Navigation, Plus, Trash2,
  Star, Image as ImageIcon, ExternalLink, Loader2, Upload,
  Sparkles, Wand2, Search
} from "lucide-react";
import { fetchEstablishmentFromGoogleAi } from "@/lib/services/googleAiFillService";

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

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [priceLevel, setPriceLevel] = useState("moderado");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");

  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [photoUrl, setPhotoUrl] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

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
      if (data.description) setDescription(data.description);
      if (data.latitude) setLatitude(data.latitude);
      if (data.longitude) setLongitude(data.longitude);

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
          id, owner_user_id, category_id, destination_id, name, slug, 
          description, address, phone, whatsapp, email, website, 
          instagram, facebook, hours, price_level, latitude, longitude, 
          services, status, is_featured, rating_avg, review_count, 
          membership_tier, city, state, has_reservations_enabled, 
          has_hdv_seal, homepage_priority, is_ads_enabled, created_at, 
          updated_at,
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

      try {
        if (establishment?.establishment_images && Array.isArray(establishment.establishment_images)) {
          const sortedImgs = [...establishment.establishment_images].sort(
            (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
          );
          setPhotos(sortedImgs.map((img: any) => ({
            url: img.image_url || "",
            isPrimary: !!img.is_primary
          })));
        } else {
          setPhotos([]);
        }
      } catch (err) {
        console.error("Bloqueo seguro: Fallo en mapeo relacional omitido:", err);
        setPhotos([]);
      }
    }
  }, [establishment]);

  const autoSlug = (val: string) =>
    val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

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
      (err) => {
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
      if (!name.trim() || !categoryId) {
        throw new Error("Nombre y Categoría son campos obligatorios.");
      }

      setToastMessage("Procesando y subiendo imágenes secuencialmente...");
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
          console.error(`Error subiendo la foto #${index + 1}:`, uploadFailErr.message);
          throw new Error(`Fallo en Storage: ${uploadFailErr.message}`);
        }
      }

      const payload: Record<string, any> = {
        name,
        slug: slug || autoSlug(name),
        category_id: parseInt(categoryId),
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
        description,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
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
      // CORRECCIÓN RADICAL: Forzamos salida limpia inmediata de la vista antes del re-fetch
      setLocation("/admin/establecimientos");
    },
    onError: (err: any) => {
      console.error("Error real interceptado:", err);
      alert(`⚠️ Error en la operación de Supabase:\n${err.message || "Revisa la consola de desarrollador"}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  const hasCoords = latitude && longitude;
  const busy = saveMutation.isPending || catLoading || destLoading || estLoading;

  if (authLoading || (editId && estLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
        <p className="text-gray-500 text-xs font-bold">Cargando datos relacionales de seguridad...</p>
      </div>
    );
  }

  const inp = "w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 font-semibold text-gray-900";
  const lbl = "text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 pb-24 font-sans">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl">
          {toastMessage}
        </div>
      )}

      <div className="relative overflow-hidden py-8" style={{ background: "linear-gradient(135deg, #0e0120, #1a0533)" }}>
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ background: "#FF0096" }} />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <Link href="/admin/establecimientos">
            <button className="flex items-center gap-1.5 text-white/60 text-xs mb-4 hover:text-white transition-colors cursor-pointer font-bold">
              <ArrowLeft className="w-4 h-4" /> Volver a Establecimientos
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-pink-500/20">
              <Building2 className="w-4.5 h-4.5 text-pink-350" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                {editId ? "Editar Establecimiento" : "Nuevo Establecimiento"}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          {/* Card de Autocompletado por Google AI */}
          <div
            className="rounded-2xl p-6 border shadow-lg relative overflow-hidden text-white"
            style={{
              background: "linear-gradient(135deg, #0e011f 0%, #1a0533 100%)",
              borderColor: "#00C8D4"
            }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: "#00C8D4" }} />
            
            <div className="flex items-center justify-between gap-3 mb-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#00C8D4] text-white shrink-0 shadow-md">
                  <Sparkles className="w-5 h-5 text-white stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-white text-sm tracking-tight">Autocompletar con Google AI</h2>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-white tracking-wider" style={{ background: "#FF0096" }}>
                      IA Inteligente
                    </span>
                  </div>
                  <p className="text-white/60 text-xs mt-0.5 font-medium">
                    Escribe el nombre de un hotel o posada en Venezuela y la IA extraerá los datos reales en segundos.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 mt-4 relative z-10">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ej: Posada Galápagos Los Roques, Hotel Lidotel Valencia..."
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00C8D4] font-semibold"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAiAutoFill();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleAiAutoFill}
                disabled={aiLoading}
                className="px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-transform hover:scale-102 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 shadow-md cursor-pointer select-none relative z-10"
                style={{ background: "linear-gradient(90deg, #00C8D4 0%, #9B00CC 100%)", cursor: "pointer" }}
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Buscando en Google...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>✨ Autocompletar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-gray-900 text-sm pb-2 border-b flex items-center gap-2">
              <Building2 className="w-4 h-4 text-pink-500" /> Información Básica
            </h2>
            <div className="space-y-3">
              <div>
                <label className={lbl}>Nombre del establecimiento *</label>
                <input
                  required
                  placeholder="Ej: Posada Galápagos"
                  className={inp}
                  autoComplete="off"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug || slug === autoSlug(name)) {
                      setSlug(autoSlug(e.target.value));
                    }
                  }}
                />
              </div>

              <div>
                <label className={lbl}>Slug (URL de navegación)</label>
                <input
                  placeholder="posada-galapagos"
                  className={inp + " font-mono text-pink-650 bg-slate-50"}
                  autoComplete="off"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Categoría *</label>
                  <select
                    required
                    className={inp}
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={lbl}>Destino Principal</label>
                  <select
                    className={inp}
                    value={destinationId}
                    onChange={(e) => setDestinationId(e.target.value)}
                  >
                    <option value="">Ninguno / Sin destino</option>
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={lbl}>Nivel de Precios</label>
                <select
                  className={inp}
                  value={priceLevel}
                  onChange={(e) => setPriceLevel(e.target.value)}
                >
                  {PRICE_LEVELS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={lbl}>Descripción Comercial</label>
                <textarea
                  rows={3}
                  placeholder="Describe los servicios..."
                  className={inp + " resize-none"}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-gray-900 text-sm pb-2 border-b flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-500" /> Ubicación y Coordenadas
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Ciudad</label>
                  <input placeholder="Ej: Gran Roque" className={inp} autoComplete="off" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>

                <div>
                  <label className={lbl}>Estado de Venezuela</label>
                  <select className={inp} value={state} onChange={(e) => setState(e.target.value)}>
                    <option value="">Seleccionar estado...</option>
                    {VE_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={lbl}>Dirección física completa</label>
                <input placeholder="Calle única..." className={inp} autoComplete="off" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>

              <div className="rounded-2xl border-2 border-dashed p-4 space-y-3">
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={gpsLoading}
                  className="w-full py-2 rounded-xl text-white text-xs font-bold bg-cyan-600"
                >
                  {gpsLoading ? "Detectando..." : "Detectar Coordenadas"}
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" step="any" placeholder="Latitud" className={inp} value={latitude} onChange={(e) => setLatitude(e.target.value)} />
                  <input type="number" step="any" placeholder="Longitud" className={inp} value={longitude} onChange={(e) => setLongitude(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-gray-900 text-sm pb-2 border-b flex items-center gap-2">📞 Contacto & Redes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input placeholder="Teléfono" className={inp} autoComplete="off" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input placeholder="WhatsApp" className={inp} autoComplete="off" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              <input type="email" placeholder="Correo" className={inp} autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input placeholder="Página Web" className={inp} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              <input placeholder="Instagram" className={inp} autoComplete="off" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-gray-900 text-sm pb-2 border-b flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-purple-500" /> Galería de Fotos
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
                <button
                  type="button"
                  onClick={addPhoto}
                  className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl"
                >
                  + URL
                </button>
                <label
                  className="px-4 py-2 bg-pink-600 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Archivos</span>
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
                            newPhotos.push({
                              url,
                              isPrimary: photos.length === 0 && newPhotos.length === 0
                            });
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

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
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
                      <button 
                        type="button" 
                        onClick={() => setPrimary(i)} 
                        className="w-7 h-7 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-amber-500 shadow-md active:scale-90 transition-transform cursor-pointer"
                        title="Hacer Principal"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}
                    <button 
                      type="button" 
                      onClick={() => removePhoto(i)} 
                      className="w-7 h-7 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-red-500 shadow-md active:scale-90 transition-transform cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Link href="/admin/establecimientos" className="flex-1">
              <button type="button" className="w-full h-11 rounded-xl text-xs font-bold text-gray-500 bg-white border border-gray-200">
                Cancelar
              </button>
            </Link>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 h-11 rounded-xl text-white text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-600 border border-pink-700 disabled:opacity-50"
            >
              {busy ? "Sincronizando..." : editId ? "Confirmar Cambios" : "Guardar Establecimiento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}