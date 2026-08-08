import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  LifeBuoy, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  ShieldCheck, 
  MessageSquare, 
  Phone, 
  Mail, 
  Sparkles, 
  ArrowRight, 
  Tag, 
  FileText, 
  RefreshCw,
  Kanban,
  ListFilter,
  CheckCircle,
  HelpCircle,
  Building2
} from "lucide-react";

export interface SupportTicket {
  id: string;
  code: string;
  establishment_id: number;
  establishment_name?: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  subject: string;
  description: string;
  category: "hardware" | "wifi" | "infraestructura" | "reservas" | "facturacion" | "software" | "otro";
  priority: "baja" | "media" | "alta" | "critica";
  status: "en_proceso" | "solucionado" | "cerrado";
  scheduled_date: string; // YYYY-MM-DD
  created_at: string;
  resolution_notes?: string;
  resolved_at?: string;
}

const CATEGORY_OPTIONS = [
  { value: "wifi", label: "WiFi & Conectividad", color: "#00C8D4" },
  { value: "infraestructura", label: "Infraestructura & Planta", color: "#FF0096" },
  { value: "hardware", label: "Hardware & Equipos", color: "#9B00CC" },
  { value: "reservas", label: "Reservas & PMS", color: "#3B82F6" },
  { value: "facturacion", label: "Facturación & POS", color: "#10B981" },
  { value: "software", label: "Software & Web App", color: "#F59E0B" },
  { value: "otro", label: "Otro Requerimiento", color: "#64748B" }
];

const PRIORITY_OPTIONS = [
  { value: "baja", label: "Baja", color: "#64748B", bg: "bg-slate-100 text-slate-700" },
  { value: "media", label: "Media", color: "#3B82F6", bg: "bg-blue-100 text-blue-800" },
  { value: "alta", label: "Alta", color: "#F59E0B", bg: "bg-amber-100 text-amber-800 font-bold" },
  { value: "critica", label: "Crítica ⚡", color: "#FF0096", bg: "bg-pink-100 text-pink-800 font-black animate-pulse" }
];

interface OwnerTechnicalSupportModuleProps {
  establishmentId: number;
  establishmentName: string;
}

export function OwnerTechnicalSupportModule({ establishmentId, establishmentName }: OwnerTechnicalSupportModuleProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"kanban" | "calendar" | "list">("kanban");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Modal States
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  
  // Form States
  const [formCode, setFormCode] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formClientName, setFormClientName] = useState("");
  const [formClientEmail, setFormClientEmail] = useState("");
  const [formClientPhone, setFormClientPhone] = useState("");
  const [formCategory, setFormCategory] = useState<SupportTicket["category"]>("wifi");
  const [formPriority, setFormPriority] = useState<SupportTicket["priority"]>("media");
  const [formStatus, setFormStatus] = useState<SupportTicket["status"]>("en_proceso");
  const [formScheduledDate, setFormScheduledDate] = useState(new Date().toISOString().slice(0, 10));
  const [formResolutionNotes, setFormResolutionNotes] = useState("");

  // Drag and Drop Dragged Item
  const [draggedTicket, setDraggedTicket] = useState<SupportTicket | null>(null);

  const localKey = `hdv_support_tickets_${establishmentId}`;

  // Helper code generator
  const generateCode = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `TK-${year}-${rand}`;
  };

  useEffect(() => {
    fetchTickets();
  }, [establishmentId]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      // 1. Try DB fetch
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setTickets(data as SupportTicket[]);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn("DB Support tickets fetch error, using local storage fallback", err);
    }

    // 2. Fallback to localStorage
    const saved = localStorage.getItem(localKey);
    if (saved) {
      try {
        setTickets(JSON.parse(saved));
        setLoading(false);
        return;
      } catch (e) {}
    }

    // 3. Demo Initial Data if empty
    const nowStr = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    const initialDemos: SupportTicket[] = [
      {
        id: "tk-demo-1",
        code: "TK-2026-8102",
        establishment_id: establishmentId,
        establishment_name: establishmentName,
        client_name: "Habitación 104 - Roberto Gómez",
        client_phone: "+58 414 5550192",
        client_email: "roberto@ejemplo.com",
        subject: "Falla de señal WiFi en router de pasillo oeste",
        description: "El huésped indica fluctuación de velocidad en el enlace inalámbrico 5GHz durante la tarde.",
        category: "wifi",
        priority: "alta",
        status: "en_proceso",
        scheduled_date: nowStr,
        created_at: new Date().toISOString()
      },
      {
        id: "tk-demo-2",
        code: "TK-2026-7491",
        establishment_id: establishmentId,
        establishment_name: establishmentName,
        client_name: "Recepción Principal",
        client_phone: "+58 212 9998822",
        subject: "Ajuste de termostato en salón VIP de eventos",
        description: "Revisar sistema de climatización central 22°C para conferencia nocturna.",
        category: "infraestructura",
        priority: "media",
        status: "en_proceso",
        scheduled_date: tomorrowStr,
        created_at: new Date().toISOString()
      },
      {
        id: "tk-demo-3",
        code: "TK-2026-6210",
        establishment_id: establishmentId,
        establishment_name: establishmentName,
        client_name: "Administración / Elena Silva",
        client_phone: "+58 412 3334411",
        subject: "Actualización de POS y lector de tarjetas internacional",
        description: "Mantenimiento preventivo e instalación de controladores para terminal de pagos.",
        category: "facturacion",
        priority: "baja",
        status: "solucionado",
        scheduled_date: nowStr,
        created_at: new Date().toISOString(),
        resolution_notes: "Firmware actualizado correctamente. Pruebas de transacción exitosas.",
        resolved_at: new Date().toISOString()
      }
    ];

    setTickets(initialDemos);
    localStorage.setItem(localKey, JSON.stringify(initialDemos));
    setLoading(false);
  };

  const saveTicketsState = (updatedList: SupportTicket[]) => {
    setTickets(updatedList);
    localStorage.setItem(localKey, JSON.stringify(updatedList));

    // Async sync to Supabase if table exists
    (async () => {
      try {
        await supabase.from("support_tickets").upsert(updatedList);
      } catch (e) {}
    })();
  };

  // Open modal for New Ticket
  const handleOpenNewModal = () => {
    setSelectedTicket(null);
    setFormCode(generateCode());
    setFormSubject("");
    setFormDescription("");
    setFormClientName("");
    setFormClientEmail("");
    setFormClientPhone("");
    setFormCategory("wifi");
    setFormPriority("media");
    setFormStatus("en_proceso");
    setFormScheduledDate(new Date().toISOString().slice(0, 10));
    setFormResolutionNotes("");
    setModalOpen(true);
  };

  // Open modal for Editing Ticket
  const handleOpenEditModal = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setFormCode(ticket.code);
    setFormSubject(ticket.subject);
    setFormDescription(ticket.description);
    setFormClientName(ticket.client_name);
    setFormClientEmail(ticket.client_email || "");
    setFormClientPhone(ticket.client_phone || "");
    setFormCategory(ticket.category);
    setFormPriority(ticket.priority);
    setFormStatus(ticket.status);
    setFormScheduledDate(ticket.scheduled_date || new Date().toISOString().slice(0, 10));
    setFormResolutionNotes(ticket.resolution_notes || "");
    setModalOpen(true);
  };

  // Save / Update Ticket
  const handleSaveTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim() || !formClientName.trim()) return;

    if (selectedTicket) {
      // Update
      const updated = tickets.map(t => {
        if (t.id === selectedTicket.id) {
          const isResolving = formStatus === "solucionado" && t.status !== "solucionado";
          return {
            ...t,
            code: formCode || t.code,
            subject: formSubject,
            description: formDescription,
            client_name: formClientName,
            client_email: formClientEmail,
            client_phone: formClientPhone,
            category: formCategory,
            priority: formPriority,
            status: formStatus,
            scheduled_date: formScheduledDate,
            resolution_notes: formResolutionNotes,
            resolved_at: isResolving ? new Date().toISOString() : t.resolved_at
          };
        }
        return t;
      });
      saveTicketsState(updated);
    } else {
      // Create
      const newTicket: SupportTicket = {
        id: `tk-${Date.now()}`,
        code: formCode || generateCode(),
        establishment_id: establishmentId,
        establishment_name: establishmentName,
        client_name: formClientName,
        client_email: formClientEmail,
        client_phone: formClientPhone,
        subject: formSubject,
        description: formDescription,
        category: formCategory,
        priority: formPriority,
        status: formStatus,
        scheduled_date: formScheduledDate,
        created_at: new Date().toISOString(),
        resolution_notes: formResolutionNotes,
        resolved_at: formStatus === "solucionado" ? new Date().toISOString() : undefined
      };
      saveTicketsState([newTicket, ...tickets]);
    }

    setModalOpen(false);
  };

  // Delete ticket
  const handleDeleteTicket = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este ticket de soporte técnico?")) {
      const updated = tickets.filter(t => t.id !== id);
      saveTicketsState(updated);
    }
  };

  // Drag & Drop Status Change (Kanban Drop)
  const handleDropStatus = (targetStatus: SupportTicket["status"]) => {
    if (!draggedTicket) return;
    if (draggedTicket.status === targetStatus) {
      setDraggedTicket(null);
      return;
    }

    const updated = tickets.map(t => {
      if (t.id === draggedTicket.id) {
        return {
          ...t,
          status: targetStatus,
          resolved_at: targetStatus === "solucionado" ? new Date().toISOString() : t.resolved_at
        };
      }
      return t;
    });

    saveTicketsState(updated);
    setDraggedTicket(null);
  };

  // Drag & Drop Calendar Date Change
  const handleDropCalendarDate = (targetDateStr: string) => {
    if (!draggedTicket) return;
    if (draggedTicket.scheduled_date === targetDateStr) {
      setDraggedTicket(null);
      return;
    }

    const updated = tickets.map(t => {
      if (t.id === draggedTicket.id) {
        return {
          ...t,
          scheduled_date: targetDateStr
        };
      }
      return t;
    });

    saveTicketsState(updated);
    setDraggedTicket(null);
  };

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = !searchQuery.trim() || 
        t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter]);

  // Statistics
  const totalCount = tickets.length;
  const inProgressCount = tickets.filter(t => t.status === "en_proceso").length;
  const solvedCount = tickets.filter(t => t.status === "solucionado").length;
  const highPriorityCount = tickets.filter(t => t.priority === "alta" || t.priority === "critica").length;

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <div className="space-y-6 text-left">
      
      {/* HEADER PRINCIPAL B2B / OWNER */}
      <div className="bg-gradient-to-r from-[#0e011f] via-[#1a0533] to-[#0e011f] border border-[#00C8D4]/30 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#00C8D4]/10 to-[#FF0096]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase text-white tracking-widest bg-gradient-to-r from-[#FF0096] to-[#9B00CC] shadow-xs">
                MÓDULO DE GESTIÓN OPERATIVA
              </span>
              <span className="text-xs text-slate-300 font-bold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#00C8D4]" /> {establishmentName}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-black tracking-tight text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00C8D4]/20 border border-[#00C8D4]/40 flex items-center justify-center text-[#00C8D4] shrink-0 shadow-md">
                <Wrench className="w-5 h-5 text-[#00C8D4]" />
              </div>
              Soporte Técnico & Tickets Drag & Drop
            </h1>

            <p className="text-slate-300 text-xs md:text-sm mt-2 max-w-2xl leading-relaxed">
              Administra reportes técnicos y solicitudes con código único (`TK-2026-XXXX`). Organiza la resolución en el calendario y cambia estados arrastrando de <span className="text-[#00C8D4] font-bold">En Proceso</span> a <span className="text-emerald-400 font-bold">Solucionado</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleOpenNewModal}
              className="px-5 py-3 bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] hover:opacity-95 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-lg hover:shadow-cyan-500/25 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nuevo Ticket de Soporte</span>
            </button>
          </div>
        </div>

        {/* TARJETAS DE KPIS / METRICAS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <LifeBuoy className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Tickets</span>
              <span className="text-xl font-black text-white">{totalCount}</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00C8D4]/20 text-[#00C8D4] flex items-center justify-center shrink-0">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">En Proceso</span>
              <span className="text-xl font-black text-[#00C8D4]">{inProgressCount}</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Solucionados</span>
              <span className="text-xl font-black text-emerald-400">{solvedCount}</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF0096]/20 text-[#FF0096] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Prioridad Alta / Crítica</span>
              <span className="text-xl font-black text-[#FF0096]">{highPriorityCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE HERRAMIENTAS: BÚSQUEDA, FILTROS Y CAMBIO DE VISTA (KANBAN / CALENDARIO / LISTA) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Buscador */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código (TK-...), cliente o asunto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-[#00C8D4]"
          />
        </div>

        {/* Filtros Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer focus:border-[#00C8D4]"
          >
            <option value="all">Todos los Estados</option>
            <option value="en_proceso">⏳ En Proceso</option>
            <option value="solucionado">✅ Solucionados</option>
            <option value="cerrado">📁 Cerrados</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none cursor-pointer focus:border-[#00C8D4]"
          >
            <option value="all">Todas las Prioridades</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica ⚡</option>
          </select>

          {/* Vistas Selector Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "kanban" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Kanban className="w-3.5 h-3.5 text-[#00C8D4]" />
              <span>Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "calendar" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#FF0096]" />
              <span>Calendario</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "list" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5 text-[#9B00CC]" />
              <span>Lista</span>
            </button>
          </div>
        </div>
      </div>

      {/* VISTA 1: KANBAN DRAG & DROP BOARD */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* COLUMNA 1: EN PROCESO */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDropStatus("en_proceso")}
            className="bg-slate-50/80 border-2 border-dashed border-[#00C8D4]/40 rounded-3xl p-4 min-h-[500px] flex flex-col space-y-3 transition-colors"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 px-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#00C8D4] animate-ping" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#00C8D4]" />
                  <span>En Proceso / Pendientes</span>
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/20">
                {filteredTickets.filter(t => t.status === "en_proceso").length}
              </span>
            </div>

            <div className="flex-1 space-y-3">
              {filteredTickets.filter(t => t.status === "en_proceso").length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl">
                  Arrastra aquí o presiona "+ Nuevo Ticket"
                </div>
              ) : (
                filteredTickets.filter(t => t.status === "en_proceso").map(ticket => (
                  <RenderKanbanCard
                    key={ticket.id}
                    ticket={ticket}
                    onDragStart={() => setDraggedTicket(ticket)}
                    onEdit={() => handleOpenEditModal(ticket)}
                    onDelete={() => handleDeleteTicket(ticket.id)}
                    onQuickResolve={() => {
                      const updated = tickets.map(t => t.id === ticket.id ? { ...t, status: "solucionado" as const, resolved_at: new Date().toISOString() } : t);
                      saveTicketsState(updated);
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* COLUMNA 2: SOLUCIONADOS */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDropStatus("solucionado")}
            className="bg-slate-50/80 border-2 border-dashed border-emerald-300 rounded-3xl p-4 min-h-[500px] flex flex-col space-y-3 transition-colors"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 px-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Solucionados</span>
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200">
                {filteredTickets.filter(t => t.status === "solucionado").length}
              </span>
            </div>

            <div className="flex-1 space-y-3">
              {filteredTickets.filter(t => t.status === "solucionado").length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl">
                  Arrastra tarjetas aquí para marcar como resueltas
                </div>
              ) : (
                filteredTickets.filter(t => t.status === "solucionado").map(ticket => (
                  <RenderKanbanCard
                    key={ticket.id}
                    ticket={ticket}
                    onDragStart={() => setDraggedTicket(ticket)}
                    onEdit={() => handleOpenEditModal(ticket)}
                    onDelete={() => handleDeleteTicket(ticket.id)}
                    onQuickReopen={() => {
                      const updated = tickets.map(t => t.id === ticket.id ? { ...t, status: "en_proceso" as const } : t);
                      saveTicketsState(updated);
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* COLUMNA 3: CERRADOS / ARCHIVADOS */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDropStatus("cerrado")}
            className="bg-slate-50/80 border-2 border-dashed border-purple-300 rounded-3xl p-4 min-h-[500px] flex flex-col space-y-3 transition-colors"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 px-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                  <span>Cerrados & Archivados</span>
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-700">
                {filteredTickets.filter(t => t.status === "cerrado").length}
              </span>
            </div>

            <div className="flex-1 space-y-3">
              {filteredTickets.filter(t => t.status === "cerrado").length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl">
                  Arrastra aquí tickets finalizados
                </div>
              ) : (
                filteredTickets.filter(t => t.status === "cerrado").map(ticket => (
                  <RenderKanbanCard
                    key={ticket.id}
                    ticket={ticket}
                    onDragStart={() => setDraggedTicket(ticket)}
                    onEdit={() => handleOpenEditModal(ticket)}
                    onDelete={() => handleDeleteTicket(ticket.id)}
                  />
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* VISTA 2: CALENDARIO INTERACTIVO DRAG & DROP */}
      {viewMode === "calendar" && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          
          {/* Header del Calendario */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-lg font-serif font-black text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#FF0096]" />
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Días de la Semana */}
          <div className="grid grid-cols-7 text-center font-bold text-slate-400 text-[10px] uppercase tracking-wider py-1 border-b border-slate-100">
            <div>Dom</div>
            <div>Lun</div>
            <div>Mar</div>
            <div>Mié</div>
            <div>Jue</div>
            <div>Vie</div>
            <div>Sáb</div>
          </div>

          {/* Grid de Días del Mes */}
          <div className="grid grid-cols-7 gap-2">
            {/* Espacios vacíos del inicio del mes */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[110px] bg-slate-50/50 rounded-2xl p-2 opacity-30" />
            ))}

            {/* Días del mes */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayTickets = filteredTickets.filter(t => t.scheduled_date === dateStr);
              const isToday = new Date().toISOString().slice(0, 10) === dateStr;

              return (
                <div
                  key={dayNum}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropCalendarDate(dateStr)}
                  className={`min-h-[110px] rounded-2xl p-2 border transition-all flex flex-col justify-between ${
                    isToday 
                      ? "bg-cyan-50/40 border-[#00C8D4] shadow-xs" 
                      : "bg-white border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className={`text-xs font-black ${isToday ? "text-[#00C8D4] bg-[#00C8D4]/10 w-6 h-6 rounded-full flex items-center justify-center" : "text-slate-700"}`}>
                      {dayNum}
                    </span>
                    {dayTickets.length > 0 && (
                      <span className="text-[9px] font-black text-slate-400">
                        {dayTickets.length} ticket{dayTickets.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5 my-1.5 overflow-y-auto max-h-[85px] no-scrollbar">
                    {dayTickets.map(t => {
                      let statusBadge = "bg-[#00C8D4] text-white";
                      if (t.status === "solucionado") statusBadge = "bg-emerald-500 text-white";
                      if (t.status === "cerrado") statusBadge = "bg-slate-400 text-white";

                      return (
                        <div
                          key={t.id}
                          draggable
                          onDragStart={() => setDraggedTicket(t)}
                          onClick={() => handleOpenEditModal(t)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-grab active:cursor-grabbing transition-all text-left shadow-2xs group"
                        >
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className={`text-[8px] font-black px-1 rounded ${statusBadge}`}>
                              {t.code}
                            </span>
                            <span className="text-[8px] font-bold text-slate-400 truncate">
                              {t.priority}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-800 line-clamp-1 group-hover:text-[#00C8D4] transition-colors">
                            {t.subject}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISTA 3: LISTA FILTRABLE */}
      {viewMode === "list" && (
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="p-4 pl-6">Código / Fecha</th>
                  <th className="p-4">Asunto / Cliente</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Prioridad</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 pr-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-xs font-medium">
                      No se encontraron tickets con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map(t => {
                    const catObj = CATEGORY_OPTIONS.find(c => c.value === t.category);
                    const prioObj = PRIORITY_OPTIONS.find(p => p.value === t.priority);

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 pl-6 font-mono">
                          <span className="font-black text-slate-900 block">{t.code}</span>
                          <span className="text-[10px] text-slate-400 font-sans block mt-0.5">{t.scheduled_date}</span>
                        </td>
                        <td className="p-4 max-w-xs">
                          <span className="font-bold text-slate-900 block truncate">{t.subject}</span>
                          <span className="text-[10px] text-slate-500 block truncate mt-0.5">{t.client_name}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: `${catObj?.color}15`, color: catObj?.color }}>
                            {catObj?.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${prioObj?.bg}`}>
                            {prioObj?.label}
                          </span>
                        </td>
                        <td className="p-4">
                          {t.status === "en_proceso" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00C8D4] animate-ping" />
                              En Proceso
                            </span>
                          )}
                          {t.status === "solucionado" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Solucionado
                            </span>
                          )}
                          {t.status === "cerrado" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200">
                              Cerrado
                            </span>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(t)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Editar ticket"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTicket(t.id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar ticket"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR TICKET */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl space-y-6 text-left border border-slate-200 relative animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-[#00C8D4] tracking-widest block">SOPORTE TÉCNICO V.2</span>
                <h3 className="text-lg font-serif font-black text-slate-900">
                  {selectedTicket ? `Editar Ticket ${formCode}` : "Crear Nuevo Ticket de Soporte"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTicket} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Código Único de Ticket</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:border-[#00C8D4]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Fecha Programada / Resolución *</label>
                  <input
                    type="date"
                    value={formScheduledDate}
                    onChange={(e) => setFormScheduledDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#00C8D4]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Asunto / Título del Requerimiento *</label>
                <input
                  type="text"
                  placeholder="Ej: Falla de router WiFi en habitación 204"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#00C8D4]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Nombre Cliente / Ámbito *</label>
                  <input
                    type="text"
                    placeholder="Ej: Carlos Mendoza (Habitación 102)"
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#00C8D4]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Teléfono de Contacto</label>
                  <input
                    type="text"
                    placeholder="Ej: +58 412 1234567"
                    value={formClientPhone}
                    onChange={(e) => setFormClientPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#00C8D4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Categoría</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer focus:border-[#00C8D4]"
                  >
                    {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Prioridad</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer focus:border-[#00C8D4]"
                  >
                    {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Estado *</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer focus:border-[#00C8D4]"
                  >
                    <option value="en_proceso">⏳ En Proceso</option>
                    <option value="solucionado">✅ Solucionado</option>
                    <option value="cerrado">📁 Cerrado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Descripción del Problema</label>
                <textarea
                  rows={3}
                  placeholder="Detalles del reporte de soporte..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 outline-none focus:border-[#00C8D4] resize-none"
                />
              </div>

              {formStatus === "solucionado" && (
                <div>
                  <label className="text-[10px] uppercase font-bold text-emerald-600 block mb-1">Notas de Solución / Diagnóstico</label>
                  <textarea
                    rows={2}
                    placeholder="Escribe cómo fue solucionado este ticket..."
                    value={formResolutionNotes}
                    onChange={(e) => setFormResolutionNotes(e.target.value)}
                    className="w-full bg-emerald-50/50 border border-emerald-200 rounded-xl p-3 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  {selectedTicket ? "Guardar Cambios" : "Emitir Ticket de Soporte"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Tarjeta Kanban reutilizable con HTML5 Drag & Drop
function RenderKanbanCard({
  ticket,
  onDragStart,
  onEdit,
  onDelete,
  onQuickResolve,
  onQuickReopen
}: {
  ticket: SupportTicket;
  onDragStart: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onQuickResolve?: () => void;
  onQuickReopen?: () => void;
}) {
  const catObj = CATEGORY_OPTIONS.find(c => c.value === ticket.category);
  const prioObj = PRIORITY_OPTIONS.find(p => p.value === ticket.priority);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing text-left space-y-3 group"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-mono font-bold tracking-wider shadow-xs">
          {ticket.code}
        </span>

        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${prioObj?.bg}`}>
          {prioObj?.label}
        </span>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-[#00C8D4] transition-colors">
          {ticket.subject}
        </h4>
        <p className="text-[10px] text-slate-500 font-medium mt-1 line-clamp-2">
          {ticket.description || "Sin descripción adicional."}
        </p>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
        <span className="font-bold text-slate-700 truncate max-w-[130px]">
          👤 {ticket.client_name}
        </span>

        <span className="font-semibold text-slate-400 flex items-center gap-1">
          <CalendarIcon className="w-3 h-3 text-[#00C8D4]" />
          {ticket.scheduled_date}
        </span>
      </div>

      {ticket.resolution_notes && (
        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[10px] text-emerald-800 font-medium">
          <span className="font-bold block text-emerald-900 mb-0.5">Diagnóstico / Solución:</span>
          {ticket.resolution_notes}
        </div>
      )}

      {/* Botones Rápidos de la Tarjeta */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1">
          {onQuickResolve && (
            <button
              type="button"
              onClick={onQuickResolve}
              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[9px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              title="Marcar como Solucionado"
            >
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Solucionar</span>
            </button>
          )}

          {onQuickReopen && (
            <button
              type="button"
              onClick={onQuickReopen}
              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[9px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              title="Reabrir a En Proceso"
            >
              <Clock className="w-3 h-3 text-blue-600" />
              <span>Reabrir</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
            title="Editar ticket"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
            title="Eliminar ticket"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
