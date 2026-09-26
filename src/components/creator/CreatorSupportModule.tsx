import React, { useState } from "react";
import {
  Wrench, Plus, CheckCircle2, Clock, AlertTriangle, ShieldCheck,
  Send, Sparkles, MessageSquare, Phone, Globe, ExternalLink,
  ChevronRight, ArrowRight, X, Trash2, Tag, Compass, DollarSign, Radio
} from "lucide-react";

export type CreatorSupportCategory = 
  | "satelital_gps" 
  | "permisos_inparques" 
  | "honorarios_viaticos" 
  | "web_builder" 
  | "app_hdv" 
  | "equipamiento";

export type TicketStatus = "abierto" | "en_proceso" | "resuelto";

export interface CreatorSupportTicket {
  id: string;
  establishment_id: number;
  subject: string;
  category: CreatorSupportCategory;
  priority: "alta" | "media" | "urgente";
  status: TicketStatus;
  description: string;
  created_at: string;
  resolution_notes?: string;
}

interface CreatorSupportModuleProps {
  establishmentId: number;
  creatorName: string;
}

const CATEGORY_MAP: Record<CreatorSupportCategory, { label: string; icon: any; color: string }> = {
  satelital_gps: { label: "📡 Conectividad Satelital & GPS en Ruta", icon: Radio, color: "#00C8D4" },
  permisos_inparques: { label: "🎫 Permisos INPARQUES & Vuelo Drone", icon: Compass, color: "#FF0096" },
  honorarios_viaticos: { label: "💵 Liquidación de Honorarios ($20) & Viáticos", icon: DollarSign, color: "#10b981" },
  web_builder: { label: "🌐 Web Builder & Dominio de Creadora", icon: Globe, color: "#9B00CC" },
  app_hdv: { label: "📱 Plataforma HDV & App Móvil", icon: SmartphoneIcon, color: "#6366f1" },
  equipamiento: { label: "🧰 Soporte de Equipos & Acreditación Prensa", icon: ShieldCheck, color: "#eab308" }
};

function SmartphoneIcon(props: any) {
  return <Wrench {...props} />;
}

export function CreatorSupportModule({ establishmentId, creatorName }: CreatorSupportModuleProps) {
  const localKey = `hdv_creator_support_${establishmentId}`;

  const [tickets, setTickets] = useState<CreatorSupportTicket[]>(() => {
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    return [
      {
        id: "tkt-1",
        establishment_id: establishmentId,
        subject: "Acreditación de Permiso Especial de Drone en Los Roques",
        category: "permisos_inparques",
        priority: "alta",
        status: "en_proceso",
        description: "Solicitud de salvoconducto de prensa para vuelo de drone sobre Cayo de Agua y Gran Roque.",
        created_at: new Date(Date.now() - 24 * 3600000).toISOString().split("T")[0],
        resolution_notes: "Permiso en trámite con Capitanía y Autoridad Única."
      },
      {
        id: "tkt-2",
        establishment_id: establishmentId,
        subject: "Conciliación de Viáticos de Gasolina en Expedición Gran Sabana",
        category: "honorarios_viaticos",
        priority: "urgente",
        status: "resuelto",
        description: "Comprobante de tanqueo en estación internacional de Santa Elena por $50 USD.",
        created_at: new Date(Date.now() - 3 * 24 * 3600000).toISOString().split("T")[0],
        resolution_notes: "Aprobado y transferido por Pago Móvil a la tasa BCV del día."
      },
      {
        id: "tkt-3",
        establishment_id: establishmentId,
        subject: "Vinculación de Dominio Personalizado en Web Builder",
        category: "web_builder",
        priority: "media",
        status: "abierto",
        description: "Configuración de DNS para apuntar auracroce.com al portal de creadora HDV.",
        created_at: new Date().toISOString().split("T")[0]
      }
    ];
  });

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    category: "permisos_inparques" as CreatorSupportCategory,
    priority: "alta" as "alta" | "media" | "urgente",
    description: ""
  });

  const saveTickets = (newTkts: CreatorSupportTicket[]) => {
    setTickets(newTkts);
    localStorage.setItem(localKey, JSON.stringify(newTkts));
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim()) return;

    const newTicket: CreatorSupportTicket = {
      id: `tkt-${Date.now()}`,
      establishment_id: establishmentId,
      subject: formData.subject.trim(),
      category: formData.category,
      priority: formData.priority,
      status: "abierto",
      description: formData.description.trim(),
      created_at: new Date().toISOString().split("T")[0]
    };

    saveTickets([newTicket, ...tickets]);
    setShowModal(false);
    setFormData({
      subject: "",
      category: "permisos_inparques",
      priority: "alta",
      description: ""
    });
  };

  const handleStatusChange = (id: string, status: TicketStatus) => {
    const updated = tickets.map(t => (t.id === id ? { ...t, status } : t));
    saveTickets(updated);
  };

  const handleDeleteTicket = (id: string) => {
    if (!confirm("¿Eliminar este ticket de soporte?")) return;
    saveTickets(tickets.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* ── BANNER PRINCIPAL ── */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1a0533] via-[#0e011f] to-[#1a0533] border border-[#FF0096]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15 bg-[#00C8D4]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15 bg-[#FF0096]" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-[#FF0096]/20 text-[#FF0096] border border-[#FF0096]/40">
              <Wrench className="w-3.5 h-3.5" />
              <span>SISTEMA DE SOPORTE TÉCNICO, PERMISOLOGÍA & EXPEDICIONES (D&D)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-wide">
              Mesa de Ayuda & Asistencia para Creadores
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Resuelve incidencias en carretera, tramitación de permisos INPARQUES para vuelo de drone, conciliación bancaria de viáticos y soporte de tu Web Builder con atención prioritaria.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-black text-white shadow-xl hover:scale-103 active:scale-97 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20 shrink-0"
            style={{ background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)" }}
          >
            <Plus className="w-4 h-4" />
            <span>Crear Ticket de Soporte</span>
          </button>
        </div>
      </div>

      {/* ── TICKETS KANBAN / LISTA DE RESOLUCIÓN ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Columna 1: Abiertos */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-amber-500/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">Tickets Abiertos</h3>
            </div>
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-mono font-bold">
              {tickets.filter(t => t.status === "abierto").length}
            </span>
          </div>

          <div className="space-y-3">
            {tickets.filter(t => t.status === "abierto").map(t => renderTicketCard(t))}
            {tickets.filter(t => t.status === "abierto").length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">No hay tickets abiertos</p>
            )}
          </div>
        </div>

        {/* Columna 2: En Proceso */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-[#00C8D4]/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00C8D4]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">En Trámite / Proceso</h3>
            </div>
            <span className="w-5 h-5 rounded-full bg-[#00C8D4]/20 text-[#00C8D4] flex items-center justify-center text-[10px] font-mono font-bold">
              {tickets.filter(t => t.status === "en_proceso").length}
            </span>
          </div>

          <div className="space-y-3">
            {tickets.filter(t => t.status === "en_proceso").map(t => renderTicketCard(t))}
            {tickets.filter(t => t.status === "en_proceso").length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">No hay solicitudes en trámite</p>
            )}
          </div>
        </div>

        {/* Columna 3: Resueltos */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-emerald-500/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">Resueltos / Aprobados</h3>
            </div>
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-mono font-bold">
              {tickets.filter(t => t.status === "resuelto").length}
            </span>
          </div>

          <div className="space-y-3">
            {tickets.filter(t => t.status === "resuelto").map(t => renderTicketCard(t))}
            {tickets.filter(t => t.status === "resuelto").length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">No hay tickets resueltos</p>
            )}
          </div>
        </div>

      </div>

      {/* ── MODAL NUEVO TICKET ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1a0533] rounded-3xl w-full max-w-lg shadow-2xl border border-white/15 p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF0096] to-[#00C8D4] flex items-center justify-center text-white shadow-lg">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-white">Nuevo Ticket de Asistencia</h3>
                  <p className="text-xs text-slate-300">Soporte técnico, permisos de drone o liquidación</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 mt-5 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Asunto del Requerimiento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Ej: Permiso de sobrevuelo drone en Parque Mochima"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Categoría de Soporte
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white font-bold"
                  >
                    {Object.entries(CATEGORY_MAP).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white font-bold"
                  >
                    <option value="urgente">🚨 Urgente (En Ruta / Bloqueante)</option>
                    <option value="alta">⚡ Alta Prioridad</option>
                    <option value="media">✨ Normal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Detalles de la Solicitud
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Indica las fechas de la expedición, locación o número de comprobante..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#00C8D4]"
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#00C8D4] hover:opacity-90 text-white font-black shadow-lg"
                >
                  Enviar Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );

  function renderTicketCard(ticket: CreatorSupportTicket) {
    const catInfo = CATEGORY_MAP[ticket.category] || CATEGORY_MAP.satelital_gps;
    return (
      <div key={ticket.id} className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2.5 shadow-md hover:border-white/20 transition-all text-xs">
        <div className="flex items-center justify-between gap-1.5">
          <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/15">
            {catInfo.label.split(" ")[1]}
          </span>

          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
            ticket.priority === "urgente" ? "bg-red-500/20 text-red-300 border border-red-500/40" : "bg-white/10 text-slate-300"
          }`}>
            {ticket.priority}
          </span>
        </div>

        <h4 className="font-bold text-white leading-snug font-serif">{ticket.subject}</h4>
        <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">{ticket.description}</p>

        {ticket.resolution_notes && (
          <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[10px] text-emerald-300">
            <strong>Respuesta HDV:</strong> {ticket.resolution_notes}
          </div>
        )}

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
          <span>📅 {ticket.created_at}</span>
          <div className="flex items-center gap-1.5">
            {ticket.status !== "resuelto" ? (
              <button
                onClick={() => handleStatusChange(ticket.id, "resuelto")}
                className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-bold hover:bg-emerald-500/30 transition"
              >
                Resolver
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange(ticket.id, "en_proceso")}
                className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-bold hover:bg-amber-500/30 transition"
              >
                Reabrir
              </button>
            )}

            <button
              onClick={() => handleDeleteTicket(ticket.id)}
              className="p-1 rounded text-slate-500 hover:text-red-400 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }
}
