import React, { useState } from "react";
import {
  Building2, MapPin, Wifi, Zap, Droplets, Star, Plus,
  Search, Check, ShieldCheck, Award,
  Compass, Sparkles, X, Eye, Edit2, Trash2, Send, Camera, Dog, Phone, ExternalLink
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
  creatorName = "Creador(a) Oficial HDV"
}) => {
  const [activeCategory, setActiveCategory] = useState<EstablishmentCategoryType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEst, setEditingEst] = useState<CreatorVisitedEstablishment | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estado del Pre-Registro Express para Influencers (Corto, práctico y directo)
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
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    notes: ""
  });

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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setForm(prev => ({ ...prev, cover_image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenCreate = () => {
    setEditingEst(null);
    setGpsStatusMsg(null);
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
      latitude: undefined,
      longitude: undefined,
      notes: ""
    });
    setShowModal(true);
  };

  const handleOpenEdit = (est: CreatorVisitedEstablishment) => {
    setEditingEst(est);
    setGpsStatusMsg(est.latitude && est.longitude ? `📍 Coordenadas: ${est.latitude}, ${est.longitude}` : null);
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
      cover_image: est.cover_image || (est.photos && est.photos[0]) || "",
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
    const generatedSlug = `${generateSlug(form.name)}-${generateSlug(form.destination || "venezuela")}`;

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
      cover_image: form.cover_image,
      latitude: form.latitude,
      longitude: form.longitude,
      photos: form.cover_image ? [form.cover_image] : undefined,
      social_link: form.whatsapp.trim(),
      hdv_slug: generatedSlug,
      notes: form.notes.trim()
    };

    if (editingEst) {
      onUpdateEstablishment(editingEst.id, payload);
    } else {
      onAddEstablishment(payload);
    }

    // Guardar simultáneamente como Pre-Registro Express en localStorage y Supabase
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
        primary_image:
          form.cover_image ||
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
        gallery_images: form.cover_image ? [form.cover_image] : []
      };

      localStorage.setItem(`hdv_prereg_${generatedSlug}`, JSON.stringify(preregPayload));

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
          status: "ACTIVE"
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 shadow-md">
        <div className="text-xs font-bold text-slate-300">
          Mostrando <span className="text-[#00C8D4] font-black">{filteredEstablishments.length}</span> establecimientos pre-registrados
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por posada, restaurante, destino..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
          />
        </div>
      </div>

      {/* ── Grid de Fichas de Establecimientos Visitados ── */}
      {filteredEstablishments.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/5 border border-dashed border-white/15">
          <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No hay establecimientos en esta categoría</h4>
          <p className="text-xs text-slate-400 mt-1">Haz clic abajo para abrir el Pre-Registro Rápido.</p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white text-xs font-bold cursor-pointer"
          >
            + Pre-Registrar Establecimiento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEstablishments.map(est => {
            const hasWifi = est.wifi_speed_mbps > 0;
            const hasGenerator = est.power_generator !== "no_tiene";
            const hasWell = est.water_supply !== "no_tiene";

            return (
              <div
                key={est.id}
                className="rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 p-5 shadow-xl backdrop-blur-md flex flex-col justify-between hover:border-[#00C8D4]/60 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00C8D4]/20 text-[#00C8D4] border border-[#00C8D4]/40">
                      {est.category_label}
                    </span>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{(est.rating > 5 ? est.rating / 2 : est.rating).toFixed(1)}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white font-serif leading-snug group-hover:text-[#00C8D4] transition">
                    {est.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FF0096] shrink-0" />
                    <span className="truncate">{est.destination}</span>
                  </div>

                  <div className="mt-4 p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5">
                        <Wifi className={`w-3.5 h-3.5 ${hasWifi ? "text-emerald-400" : "text-slate-500"}`} />
                        <span className="text-[11px] font-bold text-slate-200">
                          {hasWifi ? "Starlink / Wi-Fi" : "Sin Wi-Fi"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5">
                        <Zap className={`w-3.5 h-3.5 ${hasGenerator ? "text-amber-400" : "text-slate-500"}`} />
                        <span className="text-[11px] font-bold text-slate-200 truncate">
                          {hasGenerator ? "Planta Eléctrica" : "Sin Planta"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5">
                        <Droplets className={`w-3.5 h-3.5 ${hasWell ? "text-[#00C8D4]" : "text-slate-500"}`} />
                        <span className="text-[11px] font-bold text-slate-200 truncate">
                          {hasWell ? "Agua 24/7" : " Básico"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5">
                        <Award className="w-3.5 h-3.5 text-[#FF0096]" />
                        <span className="text-[11px] font-bold text-slate-200 uppercase">
                          {est.is_recommended ? "Sello HDV" : "Visitado"}
                        </span>
                      </div>
                    </div>

                    {est.notes && (
                      <p className="text-[11px] text-slate-300 italic pt-1 border-t border-white/10 line-clamp-2">
                        "{est.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => handleCopyWhatsAppAudit(est)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-w-[120px]"
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
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs transition flex items-center justify-center cursor-pointer"
                        title="Ver Ficha Pública en HDV"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => handleOpenEdit(est)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs transition cursor-pointer"
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
                      className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs transition cursor-pointer"
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

      {/* ── MODAL DE PRE-REGISTRO EXPRESS PARA INFLUENCERS (CORTO, PRÁCTICO Y SIN FORMULARIOS EXTENSOS) ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 md:p-8 text-slate-900">
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

              {/* 5. Captura Rápida de GPS y Foto desde el Celular */}
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
                    📷 Foto Principal del Lugar
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 px-3 py-2.5 rounded-xl bg-[#FF0096] hover:bg-[#e00083] text-white text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                      <Camera className="w-4 h-4" />
                      <span>{form.cover_image ? "Cambiar Foto" : "Tomar / Subir Foto"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    {form.cover_image && (
                      <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-[#FF0096] shrink-0">
                        <img src={form.cover_image} alt="Vista previa" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 6. Insignias Rápidas en 1 Clic */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
                  5. Insignias Rápidas (Toca para activar/desactivar)
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
                  6. Breve Reseña o Nota (Opcional)
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
