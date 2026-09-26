import React, { useState } from "react";
import {
  MessageSquare, Phone, User, Calendar, Search, Filter,
  ExternalLink, CheckCircle2, Clock, ShieldCheck, Download,
  Plus, RefreshCw, Send, Sparkles, MessageCircle, AlertCircle,
  Building2, Award, DollarSign, Trash2, X
} from "lucide-react";

export interface CreatorWhatsAppLead {
  id: string;
  sender_name: string;
  sender_phone: string;
  category: "posada_hotel" | "marca_sponsor" | "agencia_tour" | "seguidor_turista" | "otro";
  business_name?: string;
  message: string;
  proposed_budget_usd?: number;
  status: "nuevo" | "en_negociacion" | "pautado" | "archivado";
  created_at: string;
}

interface CreatorWhatsAppCRMModuleProps {
  establishmentId: number;
  creatorName: string;
  whatsappNumber?: string;
}

const CATEGORY_TAGS: Record<string, { label: string; color: string }> = {
  posada_hotel: { label: "🏨 Posada / Hotel (Auditoría)", color: "bg-[#00C8D4]/20 text-[#00C8D4] border-[#00C8D4]/30" },
  marca_sponsor: { label: "⭐ Marca Patrocinadora", color: "bg-[#FF0096]/20 text-[#FF0096] border-[#FF0096]/30" },
  agencia_tour: { label: "🧭 Agencia de Viajes / Tour", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  seguidor_turista: { label: "👤 Seguidor / Comunidad", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  otro: { label: "💬 Consulta General", color: "bg-slate-800 text-slate-300 border-white/10" }
};

export function CreatorWhatsAppCRMModule({
  establishmentId,
  creatorName,
  whatsappNumber = "+584141234567"
}: CreatorWhatsAppCRMModuleProps) {
  const localKey = `hdv_creator_wa_crm_${establishmentId}`;

  const [leads, setLeads] = useState<CreatorWhatsAppLead[]>(() => {
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    return [
      {
        id: "lead-1",
        sender_name: "Gerencia General Posada Los Roques VIP",
        sender_phone: "+584141234567",
        category: "posada_hotel",
        business_name: "Posada Los Roques VIP",
        message: "Hola Aura, vimos tu cobertura en Morrocoy y nos gustaría coordinar una visita a Los Roques con estadía todo incluido para auditoría técnica y 2 Reels.",
        proposed_budget_usd: 850,
        status: "nuevo",
        created_at: new Date(Date.now() - 2 * 3600000).toISOString().split("T")[0]
      },
      {
        id: "lead-2",
        sender_name: "Marketing Ropa & Accesorios 4x4",
        sender_phone: "+584249876543",
        category: "marca_sponsor",
        business_name: "Overland Venezuela 4x4",
        message: "Buenas tardes, queremos patrocinar tu próxima expedición a Roraima con indumentaria técnica impermeable y una pauta de $500 USD por video.",
        proposed_budget_usd: 500,
        status: "en_negociacion",
        created_at: new Date(Date.now() - 24 * 3600000).toISOString().split("T")[0]
      },
      {
        id: "lead-3",
        sender_name: "Restaurante & Bodegón Marino",
        sender_phone: "+584125556677",
        category: "posada_hotel",
        business_name: "La Cabaña de Mochima",
        message: "Hola, queremos invitarte a degustar nuestro menú marino y grabar una reseña en tu canal de Hoteles de Venezuela.",
        proposed_budget_usd: 200,
        status: "pautado",
        created_at: new Date(Date.now() - 48 * 3600000).toISOString().split("T")[0]
      }
    ];
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("todos");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    sender_name: "",
    sender_phone: "",
    category: "posada_hotel" as CreatorWhatsAppLead["category"],
    business_name: "",
    message: "",
    proposed_budget_usd: "300"
  });

  const saveLeads = (newLeads: CreatorWhatsAppLead[]) => {
    setLeads(newLeads);
    localStorage.setItem(localKey, JSON.stringify(newLeads));
  };

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sender_name.trim()) return;

    const newLead: CreatorWhatsAppLead = {
      id: `lead-${Date.now()}`,
      sender_name: formData.sender_name.trim(),
      sender_phone: formData.sender_phone.trim() || "+584140000000",
      category: formData.category,
      business_name: formData.business_name.trim(),
      message: formData.message.trim(),
      proposed_budget_usd: parseFloat(formData.proposed_budget_usd) || 0,
      status: "nuevo",
      created_at: new Date().toISOString().split("T")[0]
    };

    saveLeads([newLead, ...leads]);
    setShowModal(false);
    setFormData({
      sender_name: "",
      sender_phone: "",
      category: "posada_hotel",
      business_name: "",
      message: "",
      proposed_budget_usd: "300"
    });
  };

  const handleStatusChange = (id: string, newStatus: CreatorWhatsAppLead["status"]) => {
    const updated = leads.map(l => (l.id === id ? { ...l, status: newStatus } : l));
    saveLeads(updated);
  };

  const handleDeleteLead = (id: string) => {
    if (!confirm("¿Deseas archivar este contacto comercial?")) return;
    saveLeads(leads.filter(l => l.id !== id));
  };

  const handleOpenWhatsApp = (lead: CreatorWhatsAppLead) => {
    const cleanPhone = lead.sender_phone.replace(/[^\d+]/g, "");
    const text = `Hola ${lead.sender_name}, gracias por escribir al canal de creadora de ${creatorName} en Hoteles de Venezuela. Con gusto coordinamos tu solicitud comercial o auditoría.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const filteredLeads = leads.filter(l => {
    if (filterCategory !== "todos" && l.category !== filterCategory) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = l.sender_name.toLowerCase().includes(q);
      const matchMsg = l.message.toLowerCase().includes(q);
      const matchBiz = (l.business_name || "").toLowerCase().includes(q);
      if (!matchName && !matchMsg && !matchBiz) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* ── BANNER HERO CRM DE CREADOR ── */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1a0533] via-[#0e011f] to-[#1a0533] border border-emerald-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15 bg-emerald-500" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15 bg-[#FF0096]" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>CRM LEADS WHATSAPP & PIPELINE COMERCIAL DE CREADOR</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-wide">
              Bandeja Comercial de Posadas, Hoteles & Marcas
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Recibe y canaliza solicitudes de cobertura, canjes de hospedaje, contratos publicitarios y mensajes directos de negocios turísticos interesados en pautar contigo.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-black text-white shadow-xl hover:scale-103 active:scale-97 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20 shrink-0 bg-gradient-to-r from-emerald-500 to-teal-600"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Lead Manual</span>
          </button>
        </div>
      </div>

      {/* ── BUSCADOR Y FILTROS POR CATEGORÍA ── */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
          {[
            { id: "todos", label: `Todos (${leads.length})` },
            { id: "posada_hotel", label: "Posadas & Hoteles" },
            { id: "marca_sponsor", label: "Marcas Sponsors" },
            { id: "agencia_tour", label: "Agencias & Tours" },
            { id: "seguidor_turista", label: "Seguidores" }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
                filterCategory === cat.id
                  ? "bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-md"
                  : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, posada o mensaje..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {/* ── GRID DE LEADS COMERCIALES ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLeads.map(lead => {
          const catInfo = CATEGORY_TAGS[lead.category] || CATEGORY_TAGS.otro;

          return (
            <div
              key={lead.id}
              className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl backdrop-blur-md flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all text-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${catInfo.color}`}>
                    {catInfo.label}
                  </span>

                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                    className="px-2 py-0.5 rounded-md bg-black/50 border border-white/15 text-[10px] font-bold text-white"
                  >
                    <option value="nuevo">🟢 Nuevo</option>
                    <option value="en_negociacion">🟡 En Negociación</option>
                    <option value="pautado">🟣 Pautado</option>
                    <option value="archivado">⚪ Archivado</option>
                  </select>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm font-serif">{lead.sender_name}</h4>
                  {lead.business_name && (
                    <div className="text-[11px] text-[#00C8D4] font-semibold">{lead.business_name}</div>
                  )}
                  <div className="text-[10px] font-mono text-slate-400">{lead.sender_phone}</div>
                </div>

                <p className="text-slate-300 leading-relaxed bg-black/40 p-3 rounded-2xl border border-white/10 italic text-[11px]">
                  "{lead.message}"
                </p>

                {lead.proposed_budget_usd && lead.proposed_budget_usd > 0 ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                    <span className="text-[10px] uppercase font-bold text-emerald-300">Presupuesto Propuesto:</span>
                    <span className="font-mono font-black text-sm text-emerald-400">${lead.proposed_budget_usd} USD</span>
                  </div>
                ) : null}
              </div>

              {/* Footer Acciones */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <span className="text-[9px] font-mono text-slate-400">📅 {lead.created_at}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenWhatsApp(lead)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleDeleteLead(lead.id)}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 transition cursor-pointer"
                    title="Archivar lead"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredLeads.length === 0 && (
          <div className="col-span-full p-12 text-center rounded-3xl bg-white/5 border border-dashed border-white/15">
            <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No hay leads en esta categoría</h4>
            <p className="text-xs text-slate-400 mt-1">Comparte tu enlace de creador para captar nuevas propuestas comerciales.</p>
          </div>
        )}
      </div>

      {/* ── MODAL AGREGAR LEAD MANUAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1a0533] rounded-3xl w-full max-w-lg shadow-2xl border border-white/15 p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-white">Registrar Lead Comercial</h3>
                  <p className="text-xs text-slate-300">Posada, hotel o marca interesada en pauta</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-4 mt-5 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Nombre del Contacto / Gerente *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sender_name}
                  onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                  placeholder="Ej: Alejandro Suárez"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Posada / Marca / Negocio
                  </label>
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    placeholder="Ej: Posada Los Roques Paradise"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.sender_phone}
                    onChange={(e) => setFormData({ ...formData, sender_phone: e.target.value })}
                    placeholder="+58 414-1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Tipo de Solicitud
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white font-bold"
                  >
                    <option value="posada_hotel">🏨 Posada / Hotel (Auditoría)</option>
                    <option value="marca_sponsor">⭐ Marca Patrocinadora</option>
                    <option value="agencia_tour">🧭 Agencia / Operador de Tour</option>
                    <option value="seguidor_turista">👤 Seguidor / Consulta</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Presupuesto Ofrecido ($ USD)
                  </label>
                  <input
                    type="number"
                    value={formData.proposed_budget_usd}
                    onChange={(e) => setFormData({ ...formData, proposed_budget_usd: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Mensaje / Propuesta Comercial
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Detalles de la invitación, canje o pauta requerida..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-slate-950 font-black shadow-lg"
                >
                  Guardar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
