import React, { useState } from "react";
import {
  Building2, MapPin, Wifi, Zap, Droplets, Star, Plus,
  ExternalLink, Search, Filter, CheckCircle, Clock,
  Edit2, Trash2, Send, Check, ShieldCheck, Share2, Award,
  Car, Utensils, Anchor, Compass, Globe, Sparkles, X, Eye
} from "lucide-react";
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

export const CreatorVisitedEstablishments: React.FC<CreatorVisitedEstablishmentsProps> = ({
  visitedEstablishments,
  onAddEstablishment,
  onUpdateEstablishment,
  onDeleteEstablishment,
  creatorName = "Aura Croce"
}) => {
  const [activeCategory, setActiveCategory] = useState<EstablishmentCategoryType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEst, setEditingEst] = useState<CreatorVisitedEstablishment | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estado del formulario
  const [form, setForm] = useState({
    name: "",
    destination: "",
    category: "hoteles_posadas" as EstablishmentCategoryType,
    category_label: "Hoteles & Posadas",
    visit_date: new Date().toISOString().split("T")[0],
    status: "auditado" as "auditado" | "en_ruta" | "pautado" | "por_visitar",
    rating: 9.5,
    is_recommended: true,
    wifi_speed_mbps: 50,
    power_generator: "si_automatica" as "si_automatica" | "si_manual" | "no_tiene",
    water_supply: "si_pozo_propio" as "si_pozo_propio" | "tanque_reserva" | "no_tiene",
    water_pressure: "excelente" as "excelente" | "aceptable" | "deficiente",
    deal_type: "canje" as DealType,
    deal_value_usd: 250,
    cover_image: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    social_link: "",
    hdv_slug: "",
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
    setGpsStatusMsg("Obteniendo satélites GPS...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(5));
        const lng = parseFloat(pos.coords.longitude.toFixed(5));
        setForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
        setIsCapturingGps(false);
        setGpsStatusMsg(`GPS fijado: ${lat}, ${lng} (±${Math.round(pos.coords.accuracy)}m)`);
      },
      (err) => {
        setIsCapturingGps(false);
        setGpsStatusMsg("Error al obtener señal GPS: " + err.message);
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
      category: "hoteles_posadas",
      category_label: "Hoteles & Posadas",
      visit_date: new Date().toISOString().split("T")[0],
      status: "auditado",
      rating: 9.5,
      is_recommended: true,
      wifi_speed_mbps: 50,
      power_generator: "si_automatica",
      water_supply: "si_pozo_propio",
      water_pressure: "excelente",
      deal_type: "canje",
      deal_value_usd: 250,
      cover_image: "",
      latitude: undefined,
      longitude: undefined,
      social_link: "",
      hdv_slug: "",
      notes: ""
    });
    setShowModal(true);
  };

  const handleOpenEdit = (est: CreatorVisitedEstablishment) => {
    setEditingEst(est);
    setGpsStatusMsg(est.latitude && est.longitude ? `Coordenadas: ${est.latitude}, ${est.longitude}` : null);
    setForm({
      name: est.name,
      destination: est.destination,
      category: est.category,
      category_label: est.category_label,
      visit_date: est.visit_date,
      status: est.status,
      rating: est.rating,
      is_recommended: est.is_recommended,
      wifi_speed_mbps: est.wifi_speed_mbps,
      power_generator: est.power_generator,
      water_supply: est.water_supply,
      water_pressure: est.water_pressure,
      deal_type: est.deal_type || "canje",
      deal_value_usd: est.deal_value_usd || 200,
      cover_image: est.cover_image || (est.photos && est.photos[0]) || "",
      latitude: est.latitude,
      longitude: est.longitude,
      social_link: est.social_link || "",
      hdv_slug: est.hdv_slug || "",
      notes: est.notes || ""
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const catObj = CATEGORIES.find(c => c.id === form.category);
    const catLabel = catObj ? catObj.label : "Establecimiento";

    const payload = {
      name: form.name.trim(),
      destination: form.destination.trim(),
      category: form.category,
      category_label: catLabel,
      visit_date: form.visit_date,
      status: form.status,
      rating: Number(form.rating),
      is_recommended: form.is_recommended,
      wifi_speed_mbps: Number(form.wifi_speed_mbps),
      power_generator: form.power_generator,
      water_supply: form.water_supply,
      water_pressure: form.water_pressure,
      deal_type: form.deal_type,
      deal_value_usd: Number(form.deal_value_usd),
      cover_image: form.cover_image,
      latitude: form.latitude,
      longitude: form.longitude,
      photos: form.cover_image ? [form.cover_image] : undefined,
      social_link: form.social_link.trim(),
      hdv_slug: form.hdv_slug.trim(),
      notes: form.notes.trim()
    };

    if (editingEst) {
      onUpdateEstablishment(editingEst.id, payload);
    } else {
      onAddEstablishment(payload);
    }

    setShowModal(false);
    setEditingEst(null);
  };

  const handleCopyWhatsAppAudit = (est: CreatorVisitedEstablishment) => {
    const text = `🏆 *AUDITORÍA TÉCNICA OFICIAL HDV* 🇻🇪\n` +
      `👤 *Auditor(a):* ${creatorName} (Creadora Verificada)\n` +
      `🏨 *Establecimiento:* ${est.name}\n` +
      `📍 *Ubicación:* ${est.destination} (${est.category_label})\n` +
      `⭐ *Calificación:* ${est.rating}/10 ${est.is_recommended ? '✅ [RECOMENDADO OFICIAL]' : ''}\n\n` +
      `📡 *SERVICIOS CRÍTICOS Y CONECTIVIDAD:*\n` +
      `• *Velocidad Wi-Fi:* ${est.wifi_speed_mbps} Mbps (Ideal Nómadas Digitales)\n` +
      `• *Planta Eléctrica:* ${est.power_generator === 'si_automatica' ? '100% Automática Insonorizada' : est.power_generator === 'si_manual' ? 'Manual Operativa' : 'No Tiene'}\n` +
      `• *Suministro de Agua:* ${est.water_supply === 'si_pozo_propio' ? 'Pozo Propio Continuo' : 'Tanque de Reserva'}\n` +
      `• *Presión de Agua:* ${est.water_pressure.toUpperCase()}\n\n` +
      `📝 *Notas del Creador:* ${est.notes || 'Excelente servicio y hospitalidad en ruta.'}\n\n` +
      `_Ficha Oficial en Hoteles de Venezuela: https://hotelesdevenezuela.com/establecimiento/${est.hdv_slug || 'venezuela'}_`;

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
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider"
                 style={{ backgroundColor: `${CIAN}15`, color: CIAN, border: `1px solid ${CIAN}30` }}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Inventario de Establecimientos Turísticos Visitados & Auditados</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-wide">
              Establecimientos & Posadas Visitadas
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              En lugar de inventario de habitaciones, este módulo te permite gestionar todos los <strong className="text-white">Hoteles, Posadas, Restaurantes, Marinas, Parques y Rent-a-car</strong> que has auditado en tus viajes, con métricas de Wi-Fi, planta eléctrica y convenios.
            </p>
          </div>

          <div className="w-full lg:w-auto flex items-center justify-start lg:justify-end">
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
          Mostrando <span className="text-[#00C8D4] font-black">{filteredEstablishments.length}</span> establecimientos registrados
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
          <p className="text-xs text-slate-400 mt-1">Registra la primera posada, restaurante o marina que hayas visitado en tu ruta.</p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white text-xs font-bold"
          >
            Registrar Establecimiento
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
                  {/* Badge de Categoría & Rating */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00C8D4]/20 text-[#00C8D4] border border-[#00C8D4]/40">
                      {est.category_label}
                    </span>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{est.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Título & Destino */}
                  <h3 className="text-base font-bold text-white font-serif leading-snug group-hover:text-[#00C8D4] transition">
                    {est.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FF0096] shrink-0" />
                    <span className="truncate">{est.destination}</span>
                  </div>

                  {/* Auditoría Técnica Grid */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Telemetría & Auditoría Técnica:
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5">
                        <Wifi className={`w-3.5 h-3.5 ${hasWifi ? "text-emerald-400" : "text-slate-500"}`} />
                        <span className="text-[11px] font-bold text-slate-200">
                          {hasWifi ? `${est.wifi_speed_mbps} Mbps` : "Sin Wi-Fi"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5">
                        <Zap className={`w-3.5 h-3.5 ${hasGenerator ? "text-amber-400" : "text-slate-500"}`} />
                        <span className="text-[11px] font-bold text-slate-200 truncate">
                          {est.power_generator === "si_automatica" ? "Planta Auto" : est.power_generator === "si_manual" ? "Planta Manual" : "Sin Planta"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5">
                        <Droplets className={`w-3.5 h-3.5 ${hasWell ? "text-[#00C8D4]" : "text-slate-500"}`} />
                        <span className="text-[11px] font-bold text-slate-200 truncate">
                          {est.water_supply === "si_pozo_propio" ? "Pozo Propio" : "Tanque"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5">
                        <Award className="w-3.5 h-3.5 text-[#FF0096]" />
                        <span className="text-[11px] font-bold text-slate-200 uppercase">
                          {est.deal_type || "Canje"}
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

                {/* Acciones de la Tarjeta */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => handleCopyWhatsAppAudit(est)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-w-[120px]"
                    title="Copiar auditoría para WhatsApp"
                  >
                    {copiedId === est.id ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{copiedId === est.id ? "¡Copiado!" : "WhatsApp"}</span>
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
                      title="Editar auditoría"
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

      {/* ── MODAL: REGISTRAR / EDITAR ESTABLECIMIENTO VISITADO ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1a0533] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/15 p-6 md:p-8 text-slate-100">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00C8D4] to-[#9B00CC] flex items-center justify-center text-white shadow-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-serif text-white">
                    {editingEst ? "Editar Establecimiento Visitado" : "Registrar Establecimiento Visitado"}
                  </h3>
                  <p className="text-xs text-slate-300">Auditoría técnica de posada, restaurante, marina o parque en Venezuela</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Nombre del Establecimiento *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ej: Posada Perla Negra"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Destino / Ubicación *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    placeholder="Ej: Tucacas, Falcón / Mochima, Sucre"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>
              </div>

              {/* GPS Geolocation & Photo Capture Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#0e011f] border border-[#00C8D4]/30">
                {/* GPS Capture */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#00C8D4] block">
                    📍 Coordenadas Satelitales GPS
                  </span>
                  <button
                    type="button"
                    onClick={handleGetGpsLocation}
                    disabled={isCapturingGps}
                    className="w-full px-3 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/90 border border-[#00C8D4]/40 text-[#00C8D4] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Compass className={`w-4 h-4 ${isCapturingGps ? "animate-spin" : ""}`} />
                    <span>{isCapturingGps ? "Fijando Satélites..." : "Capturar Mi GPS Ahora"}</span>
                  </button>
                  {gpsStatusMsg && (
                    <p className="text-[10px] text-cyan-300 font-mono truncate">{gpsStatusMsg}</p>
                  )}
                </div>

                {/* Camera / Photo Upload */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FF0096] block">
                    📷 Foto en Sitio / Portada
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 px-3 py-2 rounded-xl bg-[#FF0096]/20 hover:bg-[#FF0096]/30 border border-[#FF0096]/40 text-[#FF0096] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer">
                      <Camera className="w-4 h-4" />
                      <span>{form.cover_image ? "Cambiar Foto" : "Tomar Foto / Subir"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    {form.cover_image && (
                      <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#FF0096] shrink-0 bg-black">
                        <img src={form.cover_image} alt="Thumb" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Categoría HDV</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                  >
                    <option value="hoteles_posadas">🏨 Hoteles & Posadas</option>
                    <option value="restaurantes_gastronomia">🍽️ Restaurantes & Gastronomía</option>
                    <option value="marinas_yates">⚓ Marinas & Yates</option>
                    <option value="rent_a_car">🚗 Rent-a-car & Flota 4x4</option>
                    <option value="parques_complejos">🎢 Parques & Complejos</option>
                    <option value="agencias_viajes">✈️ Agencias de Viajes</option>
                    <option value="sitios_turisticos">🏞️ Sitios Turísticos & Miradores</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Puntuación (1 a 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Fecha de Visita</label>
                  <input
                    type="date"
                    value={form.visit_date}
                    onChange={(e) => setForm({ ...form, visit_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                  />
                </div>
              </div>

              {/* Auditoría Técnica */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="text-xs font-bold text-[#00C8D4] uppercase tracking-wider">
                  Parámetros Técnicos de Infraestructura:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">📡 Wi-Fi Speed (Mbps)</label>
                    <input
                      type="number"
                      value={form.wifi_speed_mbps}
                      onChange={(e) => setForm({ ...form, wifi_speed_mbps: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">⚡ Planta Eléctrica</label>
                    <select
                      value={form.power_generator}
                      onChange={(e) => setForm({ ...form, power_generator: e.target.value as any })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white"
                    >
                      <option value="si_automatica">100% Automática</option>
                      <option value="si_manual">Manual</option>
                      <option value="no_tiene">No tiene</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">💧 Agua / Pozo</label>
                    <select
                      value={form.water_supply}
                      onChange={(e) => setForm({ ...form, water_supply: e.target.value as any })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white"
                    >
                      <option value="si_pozo_propio">Pozo Propio</option>
                      <option value="tanque_reserva">Tanque de Reserva</option>
                      <option value="no_tiene">Sin Reserva</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Tipo de Convenio Comercial</label>
                  <select
                    value={form.deal_type}
                    onChange={(e) => setForm({ ...form, deal_type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                  >
                    <option value="canje">Canje de Hospedaje / Comida</option>
                    <option value="monetario">Pauta Monetaria ($ USD)</option>
                    <option value="mixto">Mixto (Canje + Dinero)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Slug en HDV (Opcional)</label>
                  <input
                    type="text"
                    value={form.hdv_slug}
                    onChange={(e) => setForm({ ...form, hdv_slug: e.target.value })}
                    placeholder="Ej: perla-negra"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Notas de Experiencia / Conclusiones</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Comentarios sobre el servicio, gastronomía, acceso vial y estado de las instalaciones..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-[#FF0096]/20 transition"
                >
                  {editingEst ? "Guardar Cambios" : "Registrar Establecimiento"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
