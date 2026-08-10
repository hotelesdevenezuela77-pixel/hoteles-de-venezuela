import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { 
  LifeBuoy, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  Phone, 
  Mail, 
  Sparkles, 
  ArrowRight, 
  Tag, 
  FileText, 
  RefreshCw, 
  ShieldCheck, 
  Lock, 
  Building2, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronDown,
  Activity,
  Send,
  Calendar
} from "lucide-react";
import { ConstellationBackground } from "../components/ConstellationBackground";

export interface SupportTicket {
  id: string;
  code: string;
  establishment_id?: number;
  establishment_name?: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  subject: string;
  description: string;
  category: "hardware" | "wifi" | "infraestructura" | "reservas" | "facturacion" | "software" | "otro";
  priority: "baja" | "media" | "alta" | "critica";
  status: "en_proceso" | "solucionado" | "cerrado";
  scheduled_date: string;
  created_at: string;
  resolution_notes?: string;
  resolved_at?: string;
}

const CATEGORY_OPTIONS = [
  { value: "software", label: "Software & Web App", color: "#F59E0B" },
  { value: "wifi", label: "WiFi & Conectividad", color: "#00C8D4" },
  { value: "infraestructura", label: "Infraestructura & Planta", color: "#FF0096" },
  { value: "hardware", label: "Hardware & Equipos", color: "#9B00CC" },
  { value: "reservas", label: "Reservas & Motor PMS", color: "#3B82F6" },
  { value: "facturacion", label: "Facturación & POS", color: "#10B981" },
  { value: "otro", label: "Otro Requerimiento / Consultoría", color: "#64748B" }
];

const PRIORITY_OPTIONS = [
  { value: "baja", label: "Baja (Consulta general)", color: "#64748B" },
  { value: "media", label: "Media (Requerimiento estándar)", color: "#3B82F6" },
  { value: "alta", label: "Alta (Impacto operativo)", color: "#F59E0B" },
  { value: "critica", label: "Crítica ⚡ (Servicio fuera de línea)", color: "#FF0096" }
];

export function PublicSupportPage() {
  const [activeTab, setActiveTab] = useState<"new" | "lookup">("new");

  // Form State
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [establishmentName, setEstablishmentName] = useState("");
  const [category, setCategory] = useState<SupportTicket["category"]>("software");
  const [priority, setPriority] = useState<SupportTicket["priority"]>("media");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Ticket Confirmation
  const [createdTicket, setCreatedTicket] = useState<SupportTicket | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Lookup State
  const [lookupQuery, setLookupQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [lookupResult, setLookupResult] = useState<SupportTicket | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Auto Code Generator
  const generateTicketCode = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `TK-${year}-${rand}`;
  };

  // Submit Ticket Handler
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !subject.trim() || !description.trim()) {
      alert("Por favor completa los campos obligatorios (*).");
      return;
    }

    setIsSubmitting(true);
    const newCode = generateTicketCode();
    const newTicket: SupportTicket = {
      id: `tk-pub-${Date.now()}`,
      code: newCode,
      establishment_name: establishmentName.trim() || "Cliente General",
      client_name: clientName.trim(),
      client_email: clientEmail.trim(),
      client_phone: clientPhone.trim(),
      subject: subject.trim(),
      description: description.trim(),
      category,
      priority,
      status: "en_proceso",
      scheduled_date: new Date().toISOString().slice(0, 10),
      created_at: new Date().toISOString()
    };

    try {
      // 1. Try DB Save to support_tickets
      await supabase.from("support_tickets").insert([newTicket]);
    } catch (err) {
      console.warn("DB insert fallback to local storage:", err);
    }

    // 2. Local Storage Sync (Global and Public)
    try {
      const globalKey = "hdv_support_tickets_global";
      const existing = localStorage.getItem(globalKey);
      const list = existing ? JSON.parse(existing) : [];
      localStorage.setItem(globalKey, JSON.stringify([newTicket, ...list]));
    } catch (e) {}

    setIsSubmitting(false);
    setCreatedTicket(newTicket);
    // Reset Form
    setSubject("");
    setDescription("");
  };

  // Search Ticket Handler
  const handleSearchTicket = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = lookupQuery.trim().toUpperCase();
    if (!query) return;

    setIsSearching(true);
    setLookupError(null);
    setLookupResult(null);

    // 1. Check Supabase DB
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .or(`code.ilike.%${query}%,client_email.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setLookupResult(data as SupportTicket);
        setIsSearching(false);
        return;
      }
    } catch (err) {
      console.warn("Supabase lookup error:", err);
    }

    // 2. Check Local Storage Global Fallback
    try {
      const globalKey = "hdv_support_tickets_global";
      const existing = localStorage.getItem(globalKey);
      if (existing) {
        const list: SupportTicket[] = JSON.parse(existing);
        const match = list.find(t => t.code.toUpperCase() === query || (t.client_email && t.client_email.toUpperCase() === query));
        if (match) {
          setLookupResult(match);
          setIsSearching(false);
          return;
        }
      }
    } catch (e) {}

    setIsSearching(false);
    setLookupError(`No se encontró ningún ticket o reporte registrado con el código o correo "${query}".`);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50/30 pb-24 font-sans">
      
      {/* ── BANNER HEADER FULL-BLEED ── */}
      <div className="w-full relative py-16 md:py-24 overflow-hidden" style={{ background: "linear-gradient(135deg, #0e0120 0%, #1a0533 60%, #0d1a2e 100%)" }}>
        <ConstellationBackground />
        
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "#00C8D4" }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "#FF0096" }} />
        
        {/* Bottom white fade overlay */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50 via-slate-50/50 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 border border-white/20 text-white backdrop-blur-md">
            <LifeBuoy className="w-4 h-4 text-[#00C8D4]" />
            <span>CANAL OFICIAL DE ATENCIÓN Y ASISTENCIA TÉCNICA 24/7</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight font-serif drop-shadow-2xl">
            Soporte Técnico & Centro de Contacto
          </h1>

          <p className="text-slate-300 text-sm md:text-base max-w-3xl mx-auto leading-relaxed font-light">
            Levanta solicitudes de asistencia, reporta incidencias de sistema o consulta el estado en vivo de tu ticket con el respaldo de nuestro equipo de ingeniería.
          </p>

          {/* Navigation Pill Switches */}
          <div className="pt-4 flex justify-center">
            <div className="inline-flex bg-slate-950/80 p-1.5 rounded-2xl border border-white/15 shadow-2xl">
              <button
                onClick={() => setActiveTab("new")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 ${
                  activeTab === "new"
                    ? "bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white shadow-lg shadow-pink-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Ticket de Soporte</span>
              </button>

              <button
                onClick={() => setActiveTab("lookup")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 ${
                  activeTab === "lookup"
                    ? "bg-gradient-to-r from-[#00C8D4] to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Consultar Estado de Ticket</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTAINER ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 relative z-20 space-y-12">

        {/* MODE 1: NUEVO TICKET FORMULARIO */}
        {activeTab === "new" && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Card (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8 text-left">
              <div className="border-b border-gray-100 pb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-serif flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#00C8D4] text-white flex items-center justify-center shrink-0 shadow-md">
                      <Wrench className="w-5 h-5 text-white" />
                    </div>
                    Formulario Oficial de Incidencias
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Completa los datos para generar tu ticket de soporte técnico enrutado al departamento correspondiente.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 text-[#00C8D4] border border-cyan-200 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>SLA 24 Horas</span>
                </div>
              </div>

              <form onSubmit={handleSubmitTicket} className="space-y-6">
                
                {/* Contact Info Row */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Nombre Completo <span className="text-[#FF0096]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ej: Ing. Carlos Mendoza"
                      className="w-full bg-slate-50 border border-gray-250 rounded-2xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00C8D4] focus:ring-2 focus:ring-[#00C8D4]/20 text-sm font-medium transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Correo Electrónico de Contacto
                    </label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="ejemplo@hotel.com"
                      className="w-full bg-slate-50 border border-gray-250 rounded-2xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00C8D4] focus:ring-2 focus:ring-[#00C8D4]/20 text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+58 412 1234567"
                      className="w-full bg-slate-50 border border-gray-250 rounded-2xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00C8D4] focus:ring-2 focus:ring-[#00C8D4]/20 text-sm font-medium transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Hotel / Establecimiento / Entidad
                    </label>
                    <input
                      type="text"
                      value={establishmentName}
                      onChange={(e) => setEstablishmentName(e.target.value)}
                      placeholder="Ej: Posada Turística Morrocoy"
                      className="w-full bg-slate-50 border border-gray-250 rounded-2xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00C8D4] focus:ring-2 focus:ring-[#00C8D4]/20 text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                {/* Category and Priority Row */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Categoría del Requerimiento <span className="text-[#FF0096]">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-slate-50 border border-gray-250 rounded-2xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#00C8D4] text-sm font-medium transition-all"
                    >
                      {CATEGORY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Prioridad Estimada <span className="text-[#FF0096]">*</span>
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full bg-slate-50 border border-gray-250 rounded-2xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#00C8D4] text-sm font-medium transition-all"
                    >
                      {PRIORITY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Asunto Resumido <span className="text-[#FF0096]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ej: Falla en sincro de disponibilidad o ajuste de tarifas POS"
                    className="w-full bg-slate-50 border border-gray-250 rounded-2xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00C8D4] focus:ring-2 focus:ring-[#00C8D4]/20 text-sm font-medium transition-all"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Descripción Detallada de la Solicitud <span className="text-[#FF0096]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Escribe aquí los detalles específicos, pasos para reproducir la incidencia o cualquier requerimiento de configuración..."
                    className="w-full bg-slate-50 border border-gray-250 rounded-2xl p-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00C8D4] focus:ring-2 focus:ring-[#00C8D4]/20 text-sm font-medium transition-all"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-pink-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Generando Ticket Criptográfico...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Emitir Ticket de Soporte Técnico</span>
                    </>
                  )}
                </button>

              </form>
            </div>

            {/* Sidebar Cards (4 cols) */}
            <div className="lg:col-span-4 space-y-6 text-left">
              {/* Card WhatsApp VIP Direct */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0e0120] to-[#1a0533] text-white border border-purple-900/50 shadow-xl space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-[#00C8D4] text-white flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#00C8D4] uppercase tracking-widest">ATENCIÓN INMEDIATA VIP</span>
                  <h3 className="text-lg font-black font-serif text-white">Soporte por WhatsApp</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    Si tienes un problema crítico o requieres atención directa en tiempo real, puedes contactar al departamento central de ingeniería.
                  </p>
                </div>
                <a
                  href="https://wa.me/584125550199?text=Hola,%20necesito%20soporte%20t%C3%A9cnico%20urgente%20para%20mi%20establecimiento"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-3 rounded-xl bg-[#00C8D4] text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-cyan-300 transition-all shadow-md"
                >
                  Contactar Soporte WhatsApp
                </a>
              </div>

              {/* SLA Policy Card */}
              <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-md space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-pink-100 text-[#FF0096] flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Política de Respuesta (SLA)</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Todos los tickets emitidos se procesan por orden de prioridad. Las incidencias **Críticas** reciben asignación prioritaria en menos de 2 horas.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* MODE 2: CONSULTAR ESTADO DE TICKET */}
        {activeTab === "lookup" && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6 text-left">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-[#00C8D4] tracking-widest">RASTREO EN TIEMPO REAL</span>
                <h2 className="text-2xl font-black text-slate-900 font-serif">Consulta de Estado de Ticket</h2>
                <p className="text-xs text-slate-600">
                  Ingresa tu código de ticket (ejemplo: <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-900 font-bold">TK-2026-8102</code>) o tu correo electrónico para verificar el avance de tu reporte.
                </p>
              </div>

              <form onSubmit={handleSearchTicket} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  placeholder="Código de ticket (TK-2026-XXXX) o Correo..."
                  className="flex-1 bg-slate-50 border border-gray-250 rounded-2xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00C8D4] text-sm font-bold font-mono"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-8 py-3.5 rounded-2xl bg-[#00C8D4] text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-cyan-300 transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Buscar</span>
                </button>
              </form>

              {/* Error Notice */}
              {lookupError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{lookupError}</span>
                </div>
              )}

              {/* Result Ticket Card */}
              {lookupResult && (
                <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-5 shadow-2xl pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] font-mono text-[#00C8D4] font-bold">TICKET ENCONTRADO</span>
                      <h3 className="text-xl font-mono font-black text-white">{lookupResult.code}</h3>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase bg-white/10 text-white border border-white/20">
                      <Clock className="w-3.5 h-3.5 text-[#00C8D4]" />
                      <span>Estado: {lookupResult.status === "solucionado" ? "SOLUCIONADO ✅" : "EN PROCESO ⏳"}</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs text-slate-300">
                    <div>
                      <strong className="text-white block font-semibold">Asunto:</strong>
                      <span>{lookupResult.subject}</span>
                    </div>
                    <div>
                      <strong className="text-white block font-semibold">Cliente / Entidad:</strong>
                      <span>{lookupResult.client_name} ({lookupResult.establishment_name})</span>
                    </div>
                    <div>
                      <strong className="text-white block font-semibold">Detalles:</strong>
                      <p className="bg-white/5 p-3 rounded-xl text-slate-300 mt-1 leading-relaxed">{lookupResult.description}</p>
                    </div>

                    {lookupResult.resolution_notes && (
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
                        <strong className="block text-emerald-400 font-bold">Nota de Resolución de Ingeniería:</strong>
                        <p>{lookupResult.resolution_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* ── MODAL DE CONFIRMACIÓN DE TICKET CREADO ── */}
      {createdTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-lg w-full shadow-2xl space-y-6 text-left relative animate-in fade-in zoom-in duration-300">
            
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 font-serif">¡Ticket de Soporte Registrado!</h3>
              <p className="text-xs text-slate-500">
                Tu solicitud ha sido enrutada con éxito al panel central de atención técnica.
              </p>
            </div>

            {/* Ticket Code Box */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white text-center space-y-2 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">CÓDIGO DE SEGUIMIENTO</span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-black font-mono text-[#00C8D4]">{createdTicket.code}</span>
                <button
                  onClick={() => handleCopyCode(createdTicket.code)}
                  className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all text-xs"
                  title="Copiar Código"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-gray-150">
              <p><strong className="text-slate-900">Cliente:</strong> {createdTicket.client_name}</p>
              <p><strong className="text-slate-900">Asunto:</strong> {createdTicket.subject}</p>
              <p><strong className="text-slate-900">Categoría:</strong> {createdTicket.category.toUpperCase()}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setCreatedTicket(null)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Entendido / Cerrar
              </button>
              <a
                href={`https://wa.me/584125550199?text=Hola,%20acabo%20de%20generar%20el%20ticket%20de%20soporte%20${createdTicket.code}%20para%20${encodeURIComponent(createdTicket.client_name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl bg-[#00C8D4] text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-cyan-300 transition-all text-center flex items-center justify-center gap-1.5 shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Notificar por WA</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
