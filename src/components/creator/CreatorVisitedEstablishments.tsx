import React, { useState } from "react";
import {
  Building2, MapPin, Wifi, Zap, Droplets, Star, Plus,
  Search, Check, ShieldCheck, Award,
  Compass, Sparkles, X, Eye, Edit2, Trash2, Send, Camera, Dog, Phone, ExternalLink, Image as ImageIcon
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import type {
  CreatorVisitedEstablishment,
  EstablishmentCategoryType,
  DealType
} from "../../types/creatorInfluencer";

interface CreatorVisitedEstablishmentsProps {
  visitedEstablishments: CreatorVisitedEstablishment[];
  onAddEstablishment: (est: Partial<CreatorVisitedEstablishment>) => void;
  onUpdateEstablishment: (id: string, updates: Partial<CreatorVisitedEstablishment>) => void;
  onDeleteEstablishment: (id: string) => void;
  creatorName?: string;
  theme?: "dark" | "light";
}

const CIAN = "#00C8D4";
const FUCSIA = "#FF0096";
const PURPURA = "#9B00CC";

const CATEGORIES: { id: EstablishmentCategoryType | "all"; label: string; icon: string }[] = [
  { id: "all", label: "Todos", icon: "🌐" },
  { id: "hoteles_posadas", label: "Hoteles & Posadas", icon: "🏨" },
  { id: "restaurantes_gastronomia", label: "Restaurantes & Gastronomía", icon: "🍽️" },
  { id: "marinas_yates", label: "Marinas & Yates", icon: "⚓" },
  { id: "rent_a_car", label: "Rent-a-car & Flota 4x4", icon: "🚗" },
  { id: "parques_complejos", label: "Parques & Complejos", icon: "🎢" },
  { id: "agencias_viajes", label: "Agencias de Viajes", icon: "✈️" },
  { id: "sitios_turisticos", label: "Sitios Turísticos & Miradores", icon: "🏞️" }
];

const QUICK_PREREG_CATEGORIES: {
  id: EstablishmentCategoryType;
  label: string;
  sub: string;
}[] = [
  { id: "hoteles_posadas", label: "Posada / Hotel", sub: "Alojamiento" },
  { id: "restaurantes_gastronomia", label: "Restaurante / Club", sub: "Gastronomía" },
  { id: "marinas_yates", label: "Marina / Yate", sub: "Náutico" },
  { id: "parques_complejos", label: "Parque / Campamento", sub: "Recreación" },
  { id: "rent_a_car", label: "Rent-a-Car / 4x4", sub: "Transporte" },
  { id: "sitios_turisticos", label: "Sitio Turístico", sub: "Destino" }
];

export const CreatorVisitedEstablishments: React.FC<CreatorVisitedEstablishmentsProps> = ({
  visitedEstablishments,
  onAddEstablishment,
  onUpdateEstablishment,
  onDeleteEstablishment,
  creatorName = "Creador(a) Oficial HDV",
  theme = "dark"
}) => {
  const isLight = theme === "light";
  const [activeCategory, setActiveCategory] = useState<EstablishmentCategoryType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEst, setEditingEst] = useState<CreatorVisitedEstablishment | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estado del Pre-Registro Express para Influencers (con Imagen Principal + Galería Múltiple)
  const [form, setForm] = useState({
    name: "",
    destination: "",
    whatsapp: "",
    category: "hoteles_posadas" as EstablishmentCategoryType,
    rating: 5.0,
    has_power_plant: true,
    has_water_247: true,
    has_starlink: true,
    is_pet_friendly: false,
    has_hdv_seal: true,
    deal_type: "canje" as DealType,
    cover_image: "",
    gallery_images: [] as string[],
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    notes: ""
  });

  const [galleryUrlInput, setGalleryUrlInput] = useState("");
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState<string | null>(null);

  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalización no soportada en este navegador.");
      return;
    }
    setIsCapturingGps(true);
    setGpsStatusMsg("Obteniendo coordenadas GPS...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(5));
        const lng = parseFloat(pos.coords.longitude.toFixed(5));
        setForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
        setIsCapturingGps(false);
        setGpsStatusMsg(`📍 GPS capturado: ${lat}, ${lng}`);
      },
      (err) => {
        setIsCapturingGps(false);
        setGpsStatusMsg("No se pudo obtener GPS: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const readFileAsUrlOrUpload = async (file: File): Promise<string> => {
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
          return publicUrlData.publicUrl;
        }
      }
    } catch {}

    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || "");
      reader.readAsDataURL(file);
    });
  };

  // Subir Imagen Principal (Portada)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingGallery(true);
    const url = await readFileAsUrlOrUpload(file);
    if (url) {
      setForm(prev => ({
        ...prev,
        cover_image: url,
        gallery_images: prev.gallery_images.includes(url) ? prev.gallery_images : [url, ...prev.gallery_images]
      }));
    }
    setIsUploadingGallery(false);
    e.target.value = "";
  };

  // Subir Múltiples Imágenes para la Galería del Establecimiento
  const handleGalleryPhotosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingGallery(true);
    const uploaded: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = await readFileAsUrlOrUpload(files[i]);
      if (url) uploaded.push(url);
    }
    if (uploaded.length > 0) {
      setForm(prev => {
        const merged = [...prev.gallery_images];
        uploaded.forEach(u => {
          if (!merged.includes(u)) merged.push(u);
        });
        return {
          ...prev,
          cover_image: prev.cover_image || merged[0] || "",
          gallery_images: merged
        };
      });
    }
    setIsUploadingGallery(false);
    e.target.value = "";
  };

  const handleAddGalleryUrl = () => {
    const clean = galleryUrlInput.trim();
    if (!clean) return;
    setForm(prev => {
      const nextGallery = prev.gallery_images.includes(clean)
        ? prev.gallery_images
        : [...prev.gallery_images, clean];
      return {
        ...prev,
        cover_image: prev.cover_image || clean,
        gallery_images: nextGallery
      };
    });
    setGalleryUrlInput("");
  };

  const handleRemoveGalleryImage = (imgUrl: string) => {
    setForm(prev => {
      const nextGallery = prev.gallery_images.filter(u => u !== imgUrl);
      const nextCover = prev.cover_image === imgUrl ? (nextGallery[0] || "") : prev.cover_image;
      return {
        ...prev,
        cover_image: nextCover,
        gallery_images: nextGallery
      };
    });
  };

  const handleSetAsCover = (imgUrl: string) => {
    setForm(prev => ({
      ...prev,
      cover_image: imgUrl,
      gallery_images: prev.gallery_images.includes(imgUrl)
        ? prev.gallery_images
        : [imgUrl, ...prev.gallery_images]
    }));
  };

  const handleOpenCreate = () => {
    setEditingEst(null);
    setGpsStatusMsg(null);
    setGalleryUrlInput("");
    setForm({
      name: "",
      destination: "",
      whatsapp: "",
      category: "hoteles_posadas",
      rating: 5.0,
      has_power_plant: true,
      has_water_247: true,
      has_starlink: true,
      is_pet_friendly: false,
      has_hdv_seal: true,
      deal_type: "canje",
      cover_image: "",
      gallery_images: [],
      latitude: undefined,
      longitude: undefined,
      notes: ""
    });
    setShowModal(true);
  };

  const handleOpenEdit = (est: CreatorVisitedEstablishment) => {
    setEditingEst(est);
    setGpsStatusMsg(est.latitude && est.longitude ? `📍 Coordenadas: ${est.latitude}, ${est.longitude}` : null);
    setGalleryUrlInput("");
    const existingPhotos = Array.isArray(est.photos) && est.photos.length > 0
      ? est.photos
      : est.cover_image
        ? [est.cover_image]
        : [];
    setForm({
      name: est.name,
      destination: est.destination,
      whatsapp: est.social_link || "",
      category: est.category,
      rating: est.rating > 5 ? Number((est.rating / 2).toFixed(1)) : est.rating,
      has_power_plant: est.power_generator !== "no_tiene",
      has_water_247: est.water_supply !== "no_tiene",
      has_starlink: (est.wifi_speed_mbps || 0) > 0,
      is_pet_friendly: false,
      has_hdv_seal: est.is_recommended,
      deal_type: est.deal_type || "canje",
      cover_image: est.cover_image || existingPhotos[0] || "",
      gallery_images: existingPhotos,
      latitude: est.latitude,
      longitude: est.longitude,
      notes: est.notes || ""
    });
    setShowModal(true);
  };

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const catObj = CATEGORIES.find(c => c.id === form.category);
    const catLabel = catObj ? catObj.label : "Hoteles & Posadas";
    const generatedSlug = editingEst?.hdv_slug || `${generateSlug(form.name)}-${generateSlug(form.destination || "venezuela")}`;

    const allPhotos: string[] = [];
    if (form.cover_image) allPhotos.push(form.cover_image);
    form.gallery_images.forEach(img => {
      if (img && !allPhotos.includes(img)) allPhotos.push(img);
    });
    const primaryPhoto =
      allPhotos[0] ||
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop";

    const payload: Partial<CreatorVisitedEstablishment> = {
      name: form.name.trim(),
      destination: form.destination.trim() || "Venezuela",
      category: form.category,
      category_label: catLabel,
      visit_date: new Date().toISOString().split("T")[0],
      status: "auditado",
      rating: Number(form.rating) <= 5 ? Number((Number(form.rating) * 2).toFixed(1)) : Number(form.rating),
      is_recommended: form.has_hdv_seal,
      wifi_speed_mbps: form.has_starlink ? 100 : 0,
      power_generator: form.has_power_plant ? "si_automatica" : "no_tiene",
      water_supply: form.has_water_247 ? "si_pozo_propio" : "tanque_reserva",
      water_pressure: "excelente",
      deal_type: form.deal_type,
      deal_value_usd: 0,
      cover_image: primaryPhoto,
      latitude: form.latitude,
      longitude: form.longitude,
      photos: allPhotos.length > 0 ? allPhotos : [primaryPhoto],
      social_link: form.whatsapp.trim(),
      hdv_slug: generatedSlug,
      notes: form.notes.trim()
    };

    if (editingEst) {
      onUpdateEstablishment(editingEst.id, payload);
    } else {
      onAddEstablishment(payload);
    }

    // Guardar simultáneamente como Pre-Registro Express en localStorage, hdv_mock_establishments y Supabase
    try {
      const preregPayload = {
        service_category_id: 1,
        subcategory_id: 6,
        category_name: catLabel,
        title: form.name.trim(),
        slug: generatedSlug,
        destination_name: form.destination.trim() || "Venezuela",
        state: form.destination.trim() || "Venezuela",
        city: form.destination.trim() || "Venezuela",
        badges: {
          has_power_plant: form.has_power_plant,
          has_water_247: form.has_water_247,
          has_starlink: form.has_starlink,
          is_pet_friendly: form.is_pet_friendly,
          has_hdv_seal: form.has_hdv_seal
        },
        rating_avg: Number(form.rating) > 5 ? 5.0 : Number(form.rating),
        key_service_pills: [
          form.has_power_plant ? "Planta Eléctrica" : "",
          form.has_water_247 ? "Agua 24/7" : "",
          form.has_starlink ? "Starlink / Wi-Fi" : "",
          form.is_pet_friendly ? "Pet Friendly" : ""
        ].filter(Boolean),
        short_description:
          form.notes.trim() ||
          `Establecimiento pre-registrado en ruta por ${creatorName} en ${form.destination.trim() || "Venezuela"}.`,
        base_price_from: 0,
        whatsapp_number: form.whatsapp.trim(),
        primary_image: primaryPhoto,
        gallery_images: allPhotos.length > 0 ? allPhotos : [primaryPhoto]
      };

      localStorage.setItem(`hdv_prereg_${generatedSlug}`, JSON.stringify(preregPayload));

      // Sincronizar también en hdv_mock_establishments para visualización pública inmediata con galería completa
      try {
        const mockRaw = localStorage.getItem("hdv_mock_establishments");
        const mockList: any[] = mockRaw ? JSON.parse(mockRaw) : [];
        const estEntry = {
          id: Date.now(),
          name: preregPayload.title,
          slug: generatedSlug,
          category_name: catLabel,
          destination_name: preregPayload.destination_name,
          address: preregPayload.destination_name,
          city: preregPayload.city,
          state: preregPayload.state,
          phone: preregPayload.whatsapp_number,
          whatsapp: preregPayload.whatsapp_number,
          description: preregPayload.short_description,
          primary_image: primaryPhoto,
          images: preregPayload.gallery_images,
          establishment_images: preregPayload.gallery_images.map((url, idx) => ({
            image_url: url,
            is_primary: idx === 0
          })),
          rating_avg: preregPayload.rating_avg,
          services: JSON.stringify(preregPayload.key_service_pills),
          has_hdv_seal: form.has_hdv_seal,
          latitude: form.latitude,
          longitude: form.longitude,
          status: "approved"
        };
        const existingIdx = mockList.findIndex(e => e.slug === generatedSlug);
        if (existingIdx >= 0) {
          mockList[existingIdx] = { ...mockList[existingIdx], ...estEntry };
        } else {
          mockList.unshift(estEntry);
        }
        localStorage.setItem("hdv_mock_establishments", JSON.stringify(mockList));
      } catch {}

      await supabase.from("properties").upsert(
        {
          service_category_id: 1,
          subcategory_id: 6,
          title: preregPayload.title,
          slug: generatedSlug,
          destination_name: preregPayload.destination_name,
          state: preregPayload.state,
          city: preregPayload.city,
          latitude: form.latitude || null,
          longitude: form.longitude || null,
          short_description: preregPayload.short_description,
          base_price_from: 0,
          rating_avg: preregPayload.rating_avg,
          whatsapp_number: preregPayload.whatsapp_number,
          primary_image: preregPayload.primary_image,
          has_power_plant: form.has_power_plant,
          has_water_247: form.has_water_247,
          has_starlink: form.has_starlink,
          is_pet_friendly: form.is_pet_friendly,
          has_hdv_seal: form.has_hdv_seal,
          key_service_pills: preregPayload.key_service_pills,
          onboarding_status: "PRE_REGISTERED",
          status: "ACTIVE",
          features: {
            gallery: preregPayload.gallery_images
          }
        },
        { onConflict: "slug" }
      );
    } catch {}

    setShowModal(false);
    setEditingEst(null);
  };

  const handleCopyWhatsAppAudit = (est: CreatorVisitedEstablishment) => {
    const text =
      `🏆 *PRE-REGISTRO & RESEÑA OFICIAL HDV* 🇻🇪\n` +
      `👤 *Creador(a):* ${creatorName}\n` +
      `🏨 *Establecimiento:* ${est.name}\n` +
      `📍 *Ubicación:* ${est.destination} (${est.category_label})\n` +
      `⭐ *Valoración:* ${est.rating}/10 ${est.is_recommended ? "✅ [SELLO HDV]" : ""}\n` +
      `📝 *Reseña:* ${est.notes || "Excelente atención y hospitalidad en ruta."}\n\n` +
      `_Ficha Oficial en Hoteles de Venezuela: https://hotelesdevenezuela.com/establecimiento/${est.hdv_slug || "venezuela"}_`;

    navigator.clipboard.writeText(text);
    setCopiedId(est.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  // Filtrado
  const filteredEstablishments = visitedEstablishments.filter(est => {
    if (activeCategory !== "all" && est.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = est.name.toLowerCase().includes(q);
      const matchDest = est.destination.toLowerCase().includes(q);
      const matchNotes = (est.notes || "").toLowerCase().includes(q);
      if (!matchName && !matchDest && !matchNotes) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 text-slate-100 font-sans">
      {/* ── Banner Principal ── */}
      <div
        className="rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a0533 0%, #0e011f 100%)" }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: CIAN }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: FUCSIA }} />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider"
              style={{ backgroundColor: `${CIAN}15`, color: CIAN, border: `1px solid ${CIAN}30` }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Pre-Registro Express en Ruta para Influencers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-wide">
              Establecimientos & Posadas Visitadas
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Pre-registra de forma rápida y práctica los <strong className="text-white">Hoteles, Posadas, Restaurantes, Marinas y Parques</strong> que visites en tus viajes sin formularios extensos: solo nombre, destino, GPS, foto y servicios clave.
            </p>
          </div>

          <div className="w-full lg:w-auto flex flex-wrap items-center justify-start lg:justify-end gap-3">
            <button
              onClick={handleOpenCreate}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-black text-white shadow-xl hover:scale-103 active:scale-97 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
              style={{ background: `linear-gradient(135deg, ${FUCSIA} 0%, ${PURPURA} 100%)` }}
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nuevo Establecimiento Visitado</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Filtros por Categoría HDV ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${
                isActive
                  ? "bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-white border-white/30 shadow-lg shadow-[#00C8D4]/20 font-black"
                  : isLight
                  ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-xs"
                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Buscador y Conteo ── */}
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border shadow-md ${
        isLight ? "bg-white border-slate-200 text-slate-800" : "bg-white/5 border-white/10 text-slate-300"
      }`}>
        <div className={`text-xs font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>
          Mostrando <span className="text-[#00C8D4] font-black">{filteredEstablishments.length}</span> establecimientos pre-registrados por {creatorName}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por posada, restaurante, destino..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs focus:outline-none focus:border-[#00C8D4] ${
              isLight
                ? "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                : "bg-black/40 border-white/15 text-white placeholder-slate-500"
            }`}
          />
        </div>
      </div>

      {/* ── Grid de Fichas de Establecimientos Visitados ── */}
      {filteredEstablishments.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border border-dashed ${
          isLight ? "bg-white border-slate-300 text-slate-800 shadow-sm" : "bg-white/5 border-white/15 text-white"
        }`}>
          <div className="w-14 h-14 rounded-2xl bg-[#00C8D4] flex items-center justify-center text-white mx-auto mb-3 shadow-md">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h4 className={`text-base font-bold font-serif ${isLight ? "text-slate-900" : "text-white"}`}>
            Aún no has registrado establecimientos visitados
          </h4>
          <p className={`text-xs mt-1 max-w-md mx-auto ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            Aquí aparecerán únicamente los hoteles, posadas, restaurantes o parques que tú pre-registres en tus rutas, con su foto principal y galería de imágenes.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white text-xs font-bold cursor-pointer shadow-lg hover:scale-103 transition-all"
          >
            + Pre-Registrar Mi Primer Establecimiento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEstablishments.map(est => {
            const hasWifi = est.wifi_speed_mbps > 0;
            const hasGenerator = est.power_generator !== "no_tiene";
            const hasWell = est.water_supply !== "no_tiene";
            const coverImg = est.cover_image || (est.photos && est.photos[0]);
            const photosCount = Array.isArray(est.photos) && est.photos.length > 0 ? est.photos.length : (coverImg ? 1 : 0);

            return (
              <div
                key={est.id}
                className={`rounded-3xl border p-5 shadow-xl flex flex-col justify-between transition-all group ${
                  isLight
                    ? "bg-white border-slate-200 text-slate-900 hover:border-[#00C8D4]"
                    : "bg-gradient-to-b from-white/10 to-white/5 border-white/15 text-white backdrop-blur-md hover:border-[#00C8D4]/60"
                }`}
              >
                <div>
                  {coverImg && (
                    <div className="relative h-40 w-full rounded-2xl overflow-hidden mb-3.5 border border-slate-200/30">
                      <img
                        src={coverImg}
                        alt={est.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-[#0e011f]/80 backdrop-blur-md text-white text-[10px] font-black flex items-center gap-1 border border-white/15">
                        <ImageIcon className="w-3 h-3 text-[#00C8D4]" />
                        <span>{photosCount} {photosCount === 1 ? "Foto" : "Fotos"}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00C8D4]/15 text-[#0099a3] border border-[#00C8D4]/40">
                      {est.category_label}
                    </span>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/30 text-xs font-black">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{(est.rating > 5 ? est.rating / 2 : est.rating).toFixed(1)}</span>
                    </div>
                  </div>

                  <h3 className={`text-base font-bold font-serif leading-snug group-hover:text-[#00C8D4] transition ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}>
                    {est.name}
                  </h3>

                  <div className={`flex items-center gap-1.5 text-xs mt-1.5 ${
                    isLight ? "text-slate-600" : "text-slate-300"
                  }`}>
                    <MapPin className="w-3.5 h-3.5 text-[#FF0096] shrink-0" />
                    <span className="truncate">{est.destination}</span>
                  </div>

                  <div className={`mt-4 p-3.5 rounded-2xl border space-y-2 text-xs ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-white/10"
                  }`}>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`flex items-center gap-2 p-1.5 rounded-lg ${isLight ? "bg-white border border-slate-100" : "bg-white/5"}`}>
                        <Wifi className={`w-3.5 h-3.5 ${hasWifi ? "text-emerald-500" : "text-slate-400"}`} />
                        <span className={`text-[11px] font-bold ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                          {hasWifi ? "Starlink / Wi-Fi" : "Sin Wi-Fi"}
                        </span>
                      </div>

                      <div className={`flex items-center gap-2 p-1.5 rounded-lg ${isLight ? "bg-white border border-slate-100" : "bg-white/5"}`}>
                        <Zap className={`w-3.5 h-3.5 ${hasGenerator ? "text-amber-500" : "text-slate-400"}`} />
                        <span className={`text-[11px] font-bold truncate ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                          {hasGenerator ? "Planta Eléctrica" : "Sin Planta"}
                        </span>
                      </div>

                      <div className={`flex items-center gap-2 p-1.5 rounded-lg ${isLight ? "bg-white border border-slate-100" : "bg-white/5"}`}>
                        <Droplets className={`w-3.5 h-3.5 ${hasWell ? "text-[#00C8D4]" : "text-slate-400"}`} />
                        <span className={`text-[11px] font-bold truncate ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                          {hasWell ? "Agua 24/7" : "Básico"}
                        </span>
                      </div>

                      <div className={`flex items-center gap-2 p-1.5 rounded-lg ${isLight ? "bg-white border border-slate-100" : "bg-white/5"}`}>
                        <Award className="w-3.5 h-3.5 text-[#FF0096]" />
                        <span className={`text-[11px] font-bold uppercase ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                          {est.is_recommended ? "Sello HDV" : "Visitado"}
                        </span>
                      </div>
                    </div>

                    {est.notes && (
                      <p className={`text-[11px] italic pt-1 border-t line-clamp-2 ${
                        isLight ? "text-slate-600 border-slate-200" : "text-slate-300 border-white/10"
                      }`}>
                        "{est.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className={`mt-4 pt-3 border-t flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap ${
                  isLight ? "border-slate-100" : "border-white/10"
                }`}>
                  <button
                    onClick={() => handleCopyWhatsAppAudit(est)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-w-[120px] ${
                      isLight
                        ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40"
                    }`}
                  >
                    {copiedId === est.id ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{copiedId === est.id ? "¡Copiado!" : "Compartir WA"}</span>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {est.hdv_slug && (
                      <a
                        href={`/establecimiento/${est.hdv_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 rounded-xl text-xs transition flex items-center justify-center cursor-pointer ${
                          isLight
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            : "bg-white/10 hover:bg-white/20 text-slate-200"
                        }`}
                        title="Ver Ficha Pública en HDV"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => handleOpenEdit(est)}
                      className={`p-2 rounded-xl text-xs transition cursor-pointer ${
                        isLight
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          : "bg-white/10 hover:bg-white/20 text-slate-200"
                      }`}
                      title="Editar Pre-Registro"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar ${est.name} del inventario visitado?`)) {
                          onDeleteEstablishment(est.id);
                        }
                      }}
                      className={`p-2 rounded-xl text-xs transition cursor-pointer ${
                        isLight
                          ? "bg-red-50 hover:bg-red-100 text-red-600"
                          : "bg-red-500/20 hover:bg-red-500/30 text-red-300"
                      }`}
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL DE PRE-REGISTRO EXPRESS PARA INFLUENCERS (IMAGEN PRINCIPAL + GALERÍA DE MÚLTIPLES IMÁGENES) ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 md:p-8 text-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF0096] to-[#9B00CC] flex items-center justify-center text-white shadow-md shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#00C8D4] block">
                    PRE-REGISTRO EXPRESS DE INFLUENCER
                  </span>
                  <h3 className="text-xl font-bold font-serif text-slate-900 leading-tight">
                    {editingEst ? "Editar Pre-Registro" : "Pre-Registro Rápido de Establecimiento"}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 mt-5">
              {/* 1. Categoría en 1 Clic */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
                  1. Tipo de Establecimiento
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {QUICK_PREREG_CATEGORIES.map(cat => {
                    const isSel = form.category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setForm({ ...form, category: cat.id })}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSel
                            ? "bg-[#00C8D4]/15 border-[#00C8D4] text-[#008f99] ring-2 ring-[#00C8D4]/20"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span className="block text-xs font-black">{cat.label}</span>
                        <span className="text-[10px] text-slate-400">{cat.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Nombre, Destino y WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    2. Nombre del Establecimiento *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Ej: Posada Paraíso Azul"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    3. Destino / Ubicación *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.destination}
                    onChange={e => setForm({ ...form, destination: e.target.value })}
                    placeholder="Ej: Morrocoy, Falcón"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                    4. WhatsApp del Propietario
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={form.whatsapp}
                      onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                      placeholder="+58 412 000 0000"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Captura Rápida de GPS y Foto Principal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#00C8D4] block">
                    📍 Ubicación GPS en 1 Clic
                  </span>
                  <button
                    type="button"
                    onClick={handleGetGpsLocation}
                    disabled={isCapturingGps}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#00C8D4] hover:bg-[#00b2bd] text-white text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Compass className={`w-4 h-4 ${isCapturingGps ? "animate-spin" : ""}`} />
                    <span>{isCapturingGps ? "Capturando GPS..." : "Capturar Mi GPS Aquí"}</span>
                  </button>
                  {gpsStatusMsg && (
                    <p className="text-[10px] text-emerald-700 font-bold truncate">{gpsStatusMsg}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FF0096] block">
                    📷 5A. Imagen Principal (Portada)
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 px-3 py-2.5 rounded-xl bg-[#FF0096] hover:bg-[#e00083] text-white text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                      <Camera className="w-4 h-4" />
                      <span>{form.cover_image ? "Cambiar Portada" : "Subir Imagen Principal"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    {form.cover_image && (
                      <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-[#FF0096] shrink-0">
                        <img src={form.cover_image} alt="Portada" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 5B. Galería de Imágenes del Establecimiento (Múltiples Imágenes) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#9B00CC] block">
                      🖼️ 5B. Galería de Imágenes del Establecimiento (Múltiples Fotos)
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Selecciona varias fotos a la vez desde tu galería o cámara (habitaciones, piscina, restaurante, áreas).
                    </p>
                  </div>

                  <label className="px-3.5 py-2 rounded-xl bg-[#9B00CC] hover:bg-[#8200ab] text-white text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0">
                    <Plus className="w-4 h-4 text-white" />
                    <span>{isUploadingGallery ? "Cargando fotos..." : "Agregar Múltiples Fotos"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryPhotosUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Opción adicional para pegar URL de foto */}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={galleryUrlInput}
                    onChange={e => setGalleryUrlInput(e.target.value)}
                    placeholder="O pega enlace URL de una imagen (https://...)"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#00C8D4]"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryUrl}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold cursor-pointer shrink-0"
                  >
                    + Añadir URL
                  </button>
                </div>

                {/* Miniaturas de la galería */}
                {form.gallery_images.length > 0 ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span>{form.gallery_images.length} {form.gallery_images.length === 1 ? "imagen cargada" : "imágenes cargadas en la galería"}</span>
                      <span className="text-[10px] text-slate-400">Haz clic en "Portada" para elegir la foto principal</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 pt-1">
                      {form.gallery_images.map((imgUrl, idx) => {
                        const isMain = form.cover_image === imgUrl || (!form.cover_image && idx === 0);
                        return (
                          <div
                            key={`${idx}-${imgUrl.slice(0, 24)}`}
                            className={`relative group rounded-xl overflow-hidden border-2 h-20 bg-slate-100 ${
                              isMain ? "border-[#FF0096] ring-2 ring-[#FF0096]/25" : "border-slate-200"
                            }`}
                          >
                            <img src={imgUrl} alt={`Galería ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleSetAsCover(imgUrl)}
                              className={`absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase cursor-pointer ${
                                isMain
                                  ? "bg-[#FF0096] text-white"
                                  : "bg-black/65 text-white hover:bg-[#00C8D4]"
                              }`}
                            >
                              {isMain ? "★ Portada" : "Portada"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(imgUrl)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold shadow hover:bg-red-700 cursor-pointer"
                              title="Quitar imagen"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3 rounded-xl border border-dashed border-slate-300 bg-white text-[11px] text-slate-400">
                    Aún no has agregado fotos a la galería. Puedes seleccionar múltiples imágenes a la vez.
                  </div>
                )}
              </div>

              {/* 6. Insignias Rápidas en 1 Clic */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
                  6. Insignias Rápidas (Toca para activar/desactivar)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: "has_power_plant" as const, label: "Planta Eléctrica", color: "bg-amber-500", icon: Zap },
                    { key: "has_water_247" as const, label: "Agua 24/7", color: "bg-[#00C8D4]", icon: Droplets },
                    { key: "has_starlink" as const, label: "Starlink / Wi-Fi", color: "bg-[#9B00CC]", icon: Wifi },
                    { key: "is_pet_friendly" as const, label: "Pet Friendly", color: "bg-emerald-500", icon: Dog },
                    { key: "has_hdv_seal" as const, label: "Recomendado HDV", color: "bg-[#FF0096]", icon: ShieldCheck }
                  ].map(b => {
                    const IconComp = b.icon;
                    const active = form[b.key];
                    return (
                      <button
                        key={b.key}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, [b.key]: !prev[b.key] }))}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                          active
                            ? "bg-[#0e011f] text-white border-[#0e011f] shadow-sm"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg ${b.color} flex items-center justify-center text-white shrink-0`}>
                          <IconComp className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-[11px] font-bold truncate">{b.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 7. Nota corta opcional */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  7. Breve Reseña o Nota (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Ej: Excelente atención frente al mar, ideal para familias..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#00C8D4] focus:bg-white"
                />
              </div>

              {/* Acciones */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <a
                  href="/pre-registro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-[#00C8D4] hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir Vista Completa de Pre-Registro</span>
                </a>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider shadow-lg cursor-pointer transition-all"
                    style={{ background: `linear-gradient(135deg, ${FUCSIA} 0%, ${PURPURA} 100%)` }}
                  >
                    {editingEst ? "Guardar Cambios" : "Guardar Pre-Registro"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
