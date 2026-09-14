import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  MessageSquare, Phone, User, Calendar, Search, Filter, 
  ExternalLink, CheckCircle2, Clock, ShieldCheck, Download, 
  Plus, RefreshCw, Send, Sparkles, MessageCircle, AlertCircle
} from "lucide-react";

export interface WhatsAppLeadItem {
  id: string | number;
  establishment_id: number;
  establishment_name?: string;
  visitor_name: string;
  visitor_phone: string;
  message?: string;
  source_page?: string;
  status?: "nuevo" | "en_gestion" | "reservado" | "descartado";
  created_at: string;
}

interface OwnerWhatsAppCRMModuleProps {
  establishmentId: number;
  establishmentName?: string;
  whatsappNumber?: string;
}

export function OwnerWhatsAppCRMModule({
  establishmentId,
  establishmentName = "Tu Establecimiento",
  whatsappNumber = ""
}: OwnerWhatsAppCRMModuleProps) {
  const [leads, setLeads] = useState<WhatsAppLeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [dateFilter, setDateFilter] = useState<"todos" | "hoy" | "7dias" | "30dias">("todos");
  const [selectedLead, setSelectedLead] = useState<WhatsAppLeadItem | null>(null);
  
  // Estado para añadir lead manual
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadMsg, setNewLeadMsg] = useState("");
  const [savingLead, setSavingLead] = useState(false);

  // Cargar leads desde Supabase con fallback a localStorage
  const loadLeads = async () => {
    try {
      setLoading(true);
      const localKey = `hdv_owner_wa_leads_${establishmentId}`;

      // 1. Fetch de Supabase
      const { data, error } = await supabase
        .from("establishment_whatsapp_leads")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("created_at", { ascending: false });

      let fetchedLeads: WhatsAppLeadItem[] = [];

      if (!error && data && data.length > 0) {
        fetchedLeads = data.map((item: any) => ({
          id: item.id,
          establishment_id: item.establishment_id,
          establishment_name: item.establishment_name || establishmentName,
          visitor_name: item.visitor_name || "Cliente Interesado",
          visitor_phone: item.visitor_phone || "",
          message: item.message || "",
          source_page: item.source_page || "",
          status: item.status || "nuevo",
          created_at: item.created_at || new Date().toISOString()
        }));
      }

      // 2. Fusionar con leads locales (simulados/guardados)
      const rawLocal = localStorage.getItem(localKey);
      let localLeads: WhatsAppLeadItem[] = [];
      if (rawLocal) {
        try {
          localLeads = JSON.parse(rawLocal);
        } catch (e) {
          console.warn("Error leyendo leads locales de WhatsApp:", e);
        }
      }

      // Si no hay leads ni en DB ni en local, generar ejemplos orientativos iniciales
      if (fetchedLeads.length === 0 && localLeads.length === 0) {
        localLeads = [
          {
            id: "demo-1",
            establishment_id: establishmentId,
            establishment_name: establishmentName,
            visitor_name: "María Alejandra Pérez",
            visitor_phone: "+584141234567",
            message: "Hola, me gustaría cotizar una habitación matrimonial para este fin de semana con desayuno incluido.",
            source_page: "https://hotelesdevenezuela.com/establecimiento/posada-perla-negra",
            status: "nuevo",
            created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
          },
          {
            id: "demo-2",
            establishment_id: establishmentId,
            establishment_name: establishmentName,
            visitor_name: "Carlos Eduardo Mendoza",
            visitor_phone: "+584249876543",
            message: "Buenas tardes, ¿tienen disponibilidad para 4 adultos en temporada de vacaciones?",
            source_page: "https://hotelesdevenezuela.com/establecimiento/posada-perla-negra",
            status: "en_gestion",
            created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
          }
        ];
        localStorage.setItem(localKey, JSON.stringify(localLeads));
      }

      // Combinar sin duplicar
      const combined = [...fetchedLeads];
      localLeads.forEach(loc => {
        if (!combined.some(c => String(c.id) === String(loc.id))) {
          combined.push(loc);
        }
      });

      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setLeads(combined);
      if (combined.length > 0 && !selectedLead) {
        setSelectedLead(combined[0]);
      }
    } catch (err) {
      console.error("Error al cargar leads de WhatsApp:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [establishmentId]);

  // Actualizar estado de un lead
  const handleUpdateStatus = async (leadId: string | number, newStatus: "nuevo" | "en_gestion" | "reservado" | "descartado") => {
    const updated = leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l);
    setLeads(updated);
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }

    // Persistir en local
    const localKey = `hdv_owner_wa_leads_${establishmentId}`;
    localStorage.setItem(localKey, JSON.stringify(updated));

    // Intentar actualizar en Supabase si no es demo
    if (typeof leadId === "number") {
      try {
        await supabase
          .from("establishment_whatsapp_leads")
          .update({ status: newStatus })
          .eq("id", leadId);
      } catch (e) {
        console.warn("No se pudo actualizar el estado en Supabase:", e);
      }
    }
  };

  // Crear lead manual
  const handleCreateManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadPhone) return;

    setSavingLead(true);
    const newLead: WhatsAppLeadItem = {
      id: `manual-${Date.now()}`,
      establishment_id: establishmentId,
      establishment_name: establishmentName,
      visitor_name: newLeadName.trim(),
      visitor_phone: newLeadPhone.trim(),
      message: newLeadMsg.trim() || "Contacto registrado manualmente por el propietario.",
      source_page: "Panel Administrativo / Registro Manual",
      status: "nuevo",
      created_at: new Date().toISOString()
    };

    try {
      // Intentar guardar en Supabase
      const { data, error } = await supabase
        .from("establishment_whatsapp_leads")
        .insert([{
          establishment_id: establishmentId,
          establishment_name: establishmentName,
          visitor_name: newLead.visitor_name,
          visitor_phone: newLead.visitor_phone,
          message: newLead.message,
          source_page: newLead.source_page
        }])
        .select();

      if (!error && data && data.length > 0) {
        newLead.id = data[0].id;
      }
    } catch (err) {
      console.warn("Guardado manual en Supabase falló, guardando en local:", err);
    }

    const updated = [newLead, ...leads];
    setLeads(updated);
    setSelectedLead(newLead);
    const localKey = `hdv_owner_wa_leads_${establishmentId}`;
    localStorage.setItem(localKey, JSON.stringify(updated));

    setNewLeadName("");
    setNewLeadPhone("");
    setNewLeadMsg("");
    setShowAddModal(false);
    setSavingLead(false);
  };

  // Abrir chat directo en WhatsApp Web / App
  const openWhatsAppChat = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("58") ? cleanPhone : `58${cleanPhone.replace(/^0/, "")}`;
    const defaultMsg = `Hola ${name}, gracias por escribir a ${establishmentName} a través de Hoteles de Venezuela. ¿En qué fechas deseas cotizar o reservar tu estadía? 🏖️`;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(defaultMsg)}`;
    window.open(url, "_blank");
  };

  // Exportar lista de leads a CSV
  const exportToCSV = () => {
    if (leads.length === 0) return;
    const headers = ["ID", "Nombre", "Telefono", "Mensaje", "Estado", "Fecha Registro"];
    const rows = leads.map(l => [
      l.id,
      `"${l.visitor_name.replace(/"/g, '""')}"`,
      `"${l.visitor_phone}"`,
      `"${(l.message || "").replace(/"/g, '""')}"`,
      l.status || "nuevo",
      new Date(l.created_at).toLocaleString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Leads_WhatsApp_${establishmentName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrado de leads
  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.visitor_phone.includes(searchTerm) ||
      (l.message && l.message.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "todos" || l.status === statusFilter;

    let matchesDate = true;
    const leadDate = new Date(l.created_at).getTime();
    const now = Date.now();
    if (dateFilter === "hoy") {
      matchesDate = now - leadDate <= 24 * 3600 * 1000;
    } else if (dateFilter === "7dias") {
      matchesDate = now - leadDate <= 7 * 24 * 3600 * 1000;
    } else if (dateFilter === "30dias") {
      matchesDate = now - leadDate <= 30 * 24 * 3600 * 1000;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Métricas rápidas
  const totalLeads = leads.length;
  const nuevosCount = leads.filter(l => !l.status || l.status === "nuevo").length;
  const reservadosCount = leads.filter(l => l.status === "reservado").length;
  const conversionRate = totalLeads > 0 ? ((reservadosCount / totalLeads) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6 font-sans text-[#1e293b] text-left">
      {/* HEADER PRINCIPAL */}
      <div className="bg-gradient-to-r from-[#0e011f] via-[#1a0533] to-[#9B00CC] p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C8D4]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF0096]/20 border border-[#FF0096]/40 rounded-full text-xs font-bold text-[#FF0096] uppercase tracking-wider mb-3">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>CRM Conversacional Exclusivo</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-serif tracking-tight">
              Leads & Contactos Directos de WhatsApp
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl mt-1">
              Gestiona todos los turistas e interesados que hacen clic en el botón de WhatsApp directo en la ficha pública de <strong className="text-white font-bold">{establishmentName}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-[#FF0096] hover:bg-[#FF0096]/90 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-pink-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Lead Manual</span>
            </button>
            <button
              onClick={loadLeads}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Actualizar lista"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#00C8D4] text-white flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Total Leads</span>
            <span className="text-xl font-black text-slate-800">{totalLeads}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#FF0096] text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Nuevos Sin Atender</span>
            <span className="text-xl font-black text-[#FF0096]">{nuevosCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Reservados</span>
            <span className="text-xl font-black text-emerald-600">{reservadosCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#9B00CC] text-white flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Tasa Conversión</span>
            <span className="text-xl font-black text-[#9B00CC]">{conversionRate}%</span>
          </div>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o mensaje..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#00C8D4]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filtro Estado */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {[
              { id: "todos", label: "Todos" },
              { id: "nuevo", label: "Nuevos" },
              { id: "en_gestion", label: "En Gestión" },
              { id: "reservado", label: "Reservados" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-[#0e011f] text-white shadow-sm font-black"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={exportToCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ml-auto"
            title="Exportar lista a CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* PANEL DIVIDIDO: LISTA DE LEADS Y DETALLE DE CHAT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA IZQUIERDA: LISTA DE CONTACTOS */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[520px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-black text-slate-500 uppercase tracking-wider">
            <span>Bandeja de Entrada ({filteredLeads.length})</span>
            <span>Fecha</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-16 px-4">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">No se encontraron leads de WhatsApp.</p>
                <p className="text-[11px] text-slate-400 mt-1">Los clicks registrados en el botón WhatsApp de tu hotel aparecerán aquí.</p>
              </div>
            ) : (
              filteredLeads.map(lead => {
                const isSelected = selectedLead?.id === lead.id;
                const statusBg = 
                  lead.status === "reservado" ? "bg-emerald-100 text-emerald-700" :
                  lead.status === "en_gestion" ? "bg-amber-100 text-amber-700" :
                  lead.status === "descartado" ? "bg-slate-100 text-slate-600" : "bg-pink-100 text-pink-700";

                const statusLabel = 
                  lead.status === "reservado" ? "Reservado" :
                  lead.status === "en_gestion" ? "En Gestión" :
                  lead.status === "descartado" ? "Descartado" : "Nuevo";

                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`p-4 cursor-pointer transition-all hover:bg-slate-50 ${
                      isSelected ? "bg-cyan-50/70 border-l-4 border-l-[#00C8D4]" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-xs text-slate-900 truncate">{lead.visitor_name}</span>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">
                        {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] text-slate-500 font-mono font-bold flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {lead.visitor_phone || "Sin teléfono"}
                      </span>
                      <span className={`ml-auto px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${statusBg}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                      "{lead.message || "Sin mensaje previo"}"
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: DETALLE DEL LEAD SELECCIONADO */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6 min-h-[520px]">
          {selectedLead ? (
            <div className="space-y-6">
              {/* CABECERA DEL DETALLE */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00C8D4] to-[#9B00CC] text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md">
                    {selectedLead.visitor_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedLead.visitor_name}</h3>
                    <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-[#00C8D4]" />
                      <span>{selectedLead.visitor_phone}</span>
                    </p>
                  </div>
                </div>

                {/* BOTÓN PRINCIPAL ACCIÓN WHATSAPP */}
                <button
                  onClick={() => openWhatsAppChat(selectedLead.visitor_phone, selectedLead.visitor_name)}
                  className="w-full sm:w-auto px-5 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4 fill-white" />
                  <span>Abrir Chat en WhatsApp</span>
                </button>
              </div>

              {/* CAMBIAR ESTADO RÁPIDO */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                  Estado de la Solicitud / Embudo de Ventas:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: "nuevo", label: "Nuevo Lead", color: "hover:border-pink-500 text-pink-700 bg-pink-50" },
                    { id: "en_gestion", label: "En Gestión", color: "hover:border-amber-500 text-amber-700 bg-amber-50" },
                    { id: "reservado", label: "Reserva Confirmada", color: "hover:border-emerald-500 text-emerald-700 bg-emerald-50" },
                    { id: "descartado", label: "Descartado", color: "hover:border-slate-400 text-slate-700 bg-slate-100" }
                  ].map(st => (
                    <button
                      key={st.id}
                      onClick={() => handleUpdateStatus(selectedLead.id, st.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${st.color} ${
                        selectedLead.status === st.id ? "ring-2 ring-offset-1 ring-[#00C8D4] border-transparent font-black" : "border-slate-200"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* DETALLES DE LA SOLICITUD */}
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                    Mensaje / Consulta Inicial del Turista:
                  </span>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans">
                    "{selectedLead.message || "El turista no ingresó un mensaje de texto previo; hizo clic directo en el botón de WhatsApp desde tu ficha pública."}"
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Fecha y Hora de Registro</span>
                    <span className="font-bold text-slate-700">
                      {new Date(selectedLead.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Página de Origen</span>
                    <span className="font-bold text-slate-700 truncate block" title={selectedLead.source_page}>
                      {selectedLead.source_page || "Ficha del Hotel (Directo)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECCIÓN RECOMENDADA DE PLANTILLA DE RESPUESTA */}
              <div className="bg-gradient-to-br from-[#0e011f] to-[#1a0533] p-5 rounded-2xl text-white space-y-3">
                <div className="flex items-center gap-2 text-[#00C8D4] text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#FF0096]" />
                  <span>Sugerencia Comercial de Respuesta Rápidas</span>
                </div>
                <p className="text-xs text-slate-300">
                  Responde de inmediato para maximizar tu tasa de conversión. Recomendamos enviar fotos de la habitación y detalles de los servicios incluidos.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 text-slate-400">
              <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-600">Selecciona un lead de la lista para ver el detalle del contacto y abrir el chat.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL PARA CREAR LEAD MANUAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#FF0096]">
                <User className="w-5 h-5 text-[#FF0096]" />
                <h3 className="font-bold font-serif text-base text-slate-900">Registrar Lead Manual</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualLead} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">Nombre Completo del Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pedro Alvarado"
                  value={newLeadName}
                  onChange={e => setNewLeadName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div>
                <label className="block mb-1">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ej: +58 414 1234567"
                  value={newLeadPhone}
                  onChange={e => setNewLeadPhone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div>
                <label className="block mb-1">Notas / Consulta Inicial</label>
                <textarea
                  rows={3}
                  placeholder="Ej: Cliente llamó por teléfono pidiendo presupuesto para 2 noches..."
                  value={newLeadMsg}
                  onChange={e => setNewLeadMsg(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingLead}
                  className="w-1/2 py-2.5 bg-[#FF0096] hover:bg-[#FF0096]/90 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {savingLead && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar Lead</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
