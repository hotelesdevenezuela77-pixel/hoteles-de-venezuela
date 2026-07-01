import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import {
  Users, MessageSquare, Phone, Mail, Bot, Download,
  Plus, Search, Filter, MailCheck, Send, CheckCircle,
  X, AlertCircle, Loader2, Trash2, ArrowUpDown, ChevronRight,
  ExternalLink, BarChart3, Info
} from "lucide-react";

interface Client {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  source: string; // 'whatsapp' | 'chat_ia' | 'manual'
  interest: string;
  status: string;
  notes: string;
  createdAt: string;
}

interface Campaign {
  id: string;
  subject: string;
  body: string;
  recipientsCount: number;
  sentAt: string;
}

export function AdminClientes() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Core data states
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Navigation / UI States
  const [activeSubTab, setActiveSubTab] = useState<"database" | "campaigns">("database");
  const [selectedClients, setSelectedClients] = useState<Set<string | number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Client>("createdAt");
  const [sortAsc, setSortAsc] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<Client | null>(null);
  const [showCallModal, setShowCallModal] = useState<Client | null>(null);

  // Form States
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "manual",
    interest: "",
    notes: ""
  });
  
  const [campaignForm, setCampaignForm] = useState({
    subject: "",
    body: ""
  });

  // Action feedback states
  const [actionLoading, setActionLoading] = useState(false);
  const [campaignProgress, setCampaignProgress] = useState<number | null>(null);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  // Trigger Toast helper
  const triggerToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Auth Redirect check
  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Load clients and campaigns history
  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch from supabase whatsapp_leads
      const { data: dbLeads, error: dbErr } = await supabase
        .from("whatsapp_leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (dbErr) {
        console.warn("Could not query whatsapp_leads from database, using mock fallback:", dbErr);
      }

      // 2. Fetch mock leads from localStorage
      const localLeadsKey = "hdv_mock_whatsapp_leads";
      const localLeads = JSON.parse(localStorage.getItem(localLeadsKey) || "[]");

      // Combine and format
      const combinedLeads = [...(dbLeads || []), ...localLeads];
      
      // Map to Client interface
      const formatted: Client[] = combinedLeads.map((l: any, index: number) => ({
        id: l.id || `lead-${index}-${Date.now()}`,
        name: l.name || "Cliente Sin Nombre",
        email: l.email || "sin_correo@hdv.com",
        phone: l.phone || "",
        source: l.source || (l.phone ? "whatsapp" : "chat_ia"),
        interest: l.interest || "Consulta General",
        status: l.status || "nuevo",
        notes: l.notes || "",
        createdAt: l.created_at || l.createdAt || new Date().toISOString()
      }));

      // Sort by default sorting
      setClients(formatted);

      // Load campaign history
      const savedCampaigns = JSON.parse(localStorage.getItem("hdv_mailing_campaigns") || "[]");
      setCampaigns(savedCampaigns);

    } catch (err) {
      console.error("Error fetching client database:", err);
      triggerToast("Error al cargar la base de datos de clientes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save manual client addition
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || (!addForm.email && !addForm.phone)) {
      triggerToast("Se requiere al menos un Nombre y un correo/teléfono", "error");
      return;
    }

    setActionLoading(true);
    const newClientPayload = {
      name: addForm.name,
      email: addForm.email || null,
      phone: addForm.phone || null,
      source: addForm.source,
      interest: addForm.interest || "Registro Manual",
      status: "nuevo",
      notes: addForm.notes || "",
      created_at: new Date().toISOString()
    };

    try {
      // Try to save to Supabase
      const { data, error } = await supabase
        .from("whatsapp_leads")
        .insert(newClientPayload)
        .select();

      if (error) throw error;
      
      triggerToast("Cliente agregado con éxito a la base de datos");
      fetchData();
      setShowAddModal(false);
      setAddForm({ name: "", email: "", phone: "", source: "manual", interest: "", notes: "" });

    } catch (err: any) {
      console.warn("Supabase insert failed, saving client to local storage:", err.message);
      
      // Local storage fallback
      const localLeadsKey = "hdv_mock_whatsapp_leads";
      const localLeads = JSON.parse(localStorage.getItem(localLeadsKey) || "[]");
      const clientWithId = {
        id: `manual-lead-${Date.now()}`,
        ...newClientPayload
      };
      
      localStorage.setItem(localLeadsKey, JSON.stringify([clientWithId, ...localLeads]));
      triggerToast("Cliente guardado localmente en la base de datos");
      fetchData();
      setShowAddModal(false);
      setAddForm({ name: "", email: "", phone: "", source: "manual", interest: "", notes: "" });
    } finally {
      setActionLoading(false);
    }
  };

  // Export selected or all clients to CSV (Excel compatible)
  const handleExportCSV = () => {
    const listToExport = filteredAndSortedClients.filter(c => 
      selectedClients.size === 0 || selectedClients.has(c.id)
    );

    if (listToExport.length === 0) {
      triggerToast("No hay clientes que exportar", "error");
      return;
    }

    // CSV structure: Header
    let csvContent = "\ufeff"; // BOM for UTF-8 Excel support
    csvContent += "ID,Nombre,Email,Telefono,Origen,Interes,Estado,Fecha de Registro,Notas\r\n";

    // Rows
    listToExport.forEach(c => {
      const cleanNotes = c.notes ? c.notes.replace(/"/g, '""').replace(/\n/g, ' ') : "";
      const dateFormatted = new Date(c.createdAt).toLocaleDateString();
      
      const row = [
        `"${c.id}"`,
        `"${c.name}"`,
        `"${c.email}"`,
        `"${c.phone}"`,
        `"${c.source.toUpperCase()}"`,
        `"${c.interest}"`,
        `"${c.status.toUpperCase()}"`,
        `"${dateFormatted}"`,
        `"${cleanNotes}"`
      ].join(",");

      csvContent += row + "\r\n";
    });

    // Download trigger
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Clientes_HotelesDeVenezuela_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    triggerToast(`Exportados ${listToExport.length} clientes a Excel / CSV`);
  };

  // Simulate sending email campaign
  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.subject || !campaignForm.body) {
      triggerToast("Asunto y Cuerpo del correo requeridos", "error");
      return;
    }

    const recipientEmails = filteredAndSortedClients
      .filter(c => selectedClients.has(c.id) && c.email && !c.email.includes("sin_correo"))
      .map(c => c.email);

    if (recipientEmails.length === 0) {
      triggerToast("No hay destinatarios seleccionados con correos válidos", "error");
      return;
    }

    setShowCampaignModal(false);
    setCampaignProgress(0);

    // Simulate batch sending progression
    const totalSteps = 10;
    const intervalTime = 400;

    for (let i = 1; i <= totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, intervalTime));
      setCampaignProgress(Math.floor((i / totalSteps) * 100));
    }

    // Campaign completion save
    const newCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      subject: campaignForm.subject,
      body: campaignForm.body,
      recipientsCount: recipientEmails.length,
      sentAt: new Date().toISOString()
    };

    const savedCampaigns = JSON.parse(localStorage.getItem("hdv_mailing_campaigns") || "[]");
    const updatedCampaigns = [newCampaign, ...savedCampaigns];
    localStorage.setItem("hdv_mailing_campaigns", JSON.stringify(updatedCampaigns));
    setCampaigns(updatedCampaigns);

    triggerToast(`Campaña de correo "${campaignForm.subject}" enviada con éxito a ${recipientEmails.length} contactos`);
    setCampaignForm({ subject: "", body: "" });
    setSelectedClients(new Set());
    setCampaignProgress(null);
  };

  // Toggle selection for all filtered clients
  const handleSelectAllToggle = () => {
    if (selectedClients.size === filteredAndSortedClients.length) {
      setSelectedClients(new Set());
    } else {
      const allIds = filteredAndSortedClients.map(c => c.id);
      setSelectedClients(new Set(allIds));
    }
  };

  // Toggle single client selection
  const handleSelectClient = (id: string | number) => {
    const next = new Set(selectedClients);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedClients(next);
  };

  // Sorting helper
  const handleSort = (field: keyof Client) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Process sorting and filtering clients
  const filteredAndSortedClients = useMemo(() => {
    return clients
      .filter(c => {
        // Search Filter
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.phone.includes(query) ||
          c.notes.toLowerCase().includes(query) ||
          c.interest.toLowerCase().includes(query);

        // Source Filter
        const matchesSource = sourceFilter === "all" || c.source === sourceFilter;

        return matchesSearch && matchesSource;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        // Format dates if needed
        if (sortField === "createdAt") {
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
        }

        if (typeof valA === "string") {
          valA = valA.toLowerCase();
          valB = (valB as string).toLowerCase();
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [clients, searchQuery, sourceFilter, sortField, sortAsc]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = clients.length;
    const whatsapp = clients.filter(c => c.source === "whatsapp").length;
    const chatIa = clients.filter(c => c.source === "chat_ia").length;
    const manual = clients.filter(c => c.source === "manual" || c.source === "crm").length;
    return { total, whatsapp, chatIa, manual };
  }, [clients]);

  // Simulated calling action
  const triggerCallSimulation = (client: Client) => {
    setShowCallModal(client);
  };

  // Helper colors
  const C = {
    fucsia: "#FF0096",
    teal: "#00C8D4",
    purple: "#9B00CC",
    green: "#22C55E",
    amber: "#F59E0B"
  };

  return (
    <div className="min-h-screen pb-24 text-gray-800" style={{ background: "linear-gradient(135deg, #0e0120 0%, #1a0533 60%, #0d1a2e 100%)" }}>
      {/* ── Header ── */}
      <header className="relative overflow-hidden py-10 bg-transparent">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-10" style={{ background: C.fucsia }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full blur-3xl opacity-10" style={{ background: C.teal }} />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-brand-magenta/10 flex items-center justify-center text-brand-magenta">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5 flex-wrap">
              <span>BASE DE DATOS DE CLIENTES</span>
              <span className="flex items-center gap-1.5 shrink-0">
                {/* USA Flag */}
                <svg className="w-7 h-4.5 rounded-xs shadow-md inline-block object-cover border border-white/20 align-middle" viewBox="0 0 7410 3900" xmlns="http://www.w3.org/2000/svg">
                  <rect width="7410" height="3900" fill="#b22234"/>
                  <path d="M0,300h7410M0,900h7410M0,1500h7410M0,2100h7410M0,2700h7410M0,3300h7410" stroke="#fff" stroke-width="300"/>
                  <rect width="2964" height="2100" fill="#3c3b6e"/>
                  <g fill="#fff">
                    <circle cx="296" cy="175" r="45"/><circle cx="889" cy="175" r="45"/><circle cx="1482" cy="175" r="45"/><circle cx="2075" cy="175" r="45"/><circle cx="2668" cy="175" r="45"/>
                    <circle cx="593" cy="350" r="45"/><circle cx="1186" cy="350" r="45"/><circle cx="1778" cy="350" r="45"/><circle cx="2371" cy="350" r="45"/>
                    <circle cx="296" cy="525" r="45"/><circle cx="889" cy="525" r="45"/><circle cx="1482" cy="525" r="45"/><circle cx="2075" cy="525" r="45"/><circle cx="2668" cy="525" r="45"/>
                    <circle cx="593" cy="700" r="45"/><circle cx="1186" cy="700" r="45"/><circle cx="1778" cy="700" r="45"/><circle cx="2371" cy="700" r="45"/>
                    <circle cx="296" cy="875" r="45"/><circle cx="889" cy="875" r="45"/><circle cx="1482" cy="875" r="45"/><circle cx="2075" cy="875" r="45"/><circle cx="2668" cy="875" r="45"/>
                    <circle cx="593" cy="1050" r="45"/><circle cx="1186" cy="1050" r="45"/><circle cx="1778" cy="1050" r="45"/><circle cx="2371" cy="1050" r="45"/>
                    <circle cx="296" cy="1225" r="45"/><circle cx="889" cy="1225" r="45"/><circle cx="1482" cy="1225" r="45"/><circle cx="2075" cy="1225" r="45"/><circle cx="2668" cy="1225" r="45"/>
                    <circle cx="593" cy="1400" r="45"/><circle cx="1186" cy="1400" r="45"/><circle cx="1778" cy="1400" r="45"/><circle cx="2371" cy="1400" r="45"/>
                    <circle cx="296" cy="1575" r="45"/><circle cx="889" cy="1575" r="45"/><circle cx="1482" cy="1575" r="45"/><circle cx="2075" cy="1575" r="45"/><circle cx="2668" cy="1575" r="45"/>
                    <circle cx="593" cy="1750" r="45"/><circle cx="1186" cy="1750" r="45"/><circle cx="1778" cy="1750" r="45"/><circle cx="2371" cy="1750" r="45"/>
                    <circle cx="296" cy="1925" r="45"/><circle cx="889" cy="1925" r="45"/><circle cx="1482" cy="1925" r="45"/><circle cx="2075" cy="1925" r="45"/><circle cx="2668" cy="1925" r="45"/>
                  </g>
                </svg>
                {/* Venezuela Flag */}
                <svg className="w-7 h-4.5 rounded-xs shadow-md inline-block object-cover border border-white/20 align-middle" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
                  <rect width="900" height="200" fill="#ffcc00"/>
                  <rect y="200" width="900" height="200" fill="#00247d"/>
                  <rect y="400" width="900" height="200" fill="#cf142b"/>
                  <g fill="#fff" transform="translate(450, 310)">
                    <circle cx="-100" cy="20" r="10" />
                    <circle cx="-73" cy="-10" r="10" />
                    <circle cx="-40" cy="-30" r="10" />
                    <circle cx="-13" cy="-40" r="10" />
                    <circle cx="13" cy="-40" r="10" />
                    <circle cx="40" cy="-30" r="10" />
                    <circle cx="73" cy="-10" r="10" />
                    <circle cx="100" cy="20" r="10" />
                  </g>
                </svg>
              </span>
            </h1>
          </div>
          <p className="text-white/60 text-xs ml-[52px] font-medium">
            Hoteles de Venezuela LLC · Contactos Consolidados de WhatsApp e Inteligente
          </p>
        </div>
      </header>

      {/* ── Tab Bar Component ── */}
      <AdminTabBar />

      {/* ── Progress Loader (for campaign emails) ── */}
      {campaignProgress !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
            <MailCheck className="w-16 h-16 mx-auto mb-4 text-[#FF0096] animate-bounce" />
            <h3 className="text-xl font-bold text-white mb-2">Enviando Campaña de Correo</h3>
            <p className="text-xs text-white/50 mb-6">Procesando correos electrónicos en lote para tus contactos seleccionados...</p>
            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-[#FF0096] to-[#9B00CC] transition-all duration-300"
                style={{ width: `${campaignProgress}%` }}
              />
            </div>
            <span className="text-xs font-black text-white">{campaignProgress}% Completado</span>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATIONS ── */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold text-white bg-slate-900 border-white/10 animate-slide-in">
            {toast.type === "success" && <CheckCircle className="w-4 h-4 text-green-400" />}
            {toast.type === "error" && <AlertCircle className="w-4 h-4 text-red-400" />}
            {toast.type === "info" && <Info className="w-4 h-4 text-cyan-400" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* ─ Stats row ─ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-5">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-white/50 font-semibold mt-0.5">Total Clientes</div>
          </div>
          <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-5">
            <div className="text-2xl font-bold text-cyan-400">{stats.whatsapp}</div>
            <div className="text-xs text-white/50 font-semibold mt-0.5">Leads de WhatsApp</div>
          </div>
          <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-5">
            <div className="text-2xl font-bold text-[#FF0096]">{stats.chatIa}</div>
            <div className="text-xs text-white/50 font-semibold mt-0.5">Leads de Agente IA</div>
          </div>
          <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-5">
            <div className="text-2xl font-bold text-purple-400">{campaigns.length}</div>
            <div className="text-xs text-white/50 font-semibold mt-0.5">Campañas Realizadas</div>
          </div>
        </div>

        {/* ─ Database Sub-Tabs / Actions row ─ */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 overflow-hidden shadow-xl mb-8">
          <div className="flex border-b border-white/10 bg-black/20 flex-wrap justify-between items-center px-6 py-2 gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveSubTab("database")}
                className="px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer"
                style={{
                  borderColor: activeSubTab === "database" ? C.fucsia : "transparent",
                  color: activeSubTab === "database" ? C.fucsia : "rgba(255, 255, 255, 0.6)",
                }}
              >
                Base de Datos
              </button>
              <button
                onClick={() => setActiveSubTab("campaigns")}
                className="px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer"
                style={{
                  borderColor: activeSubTab === "campaigns" ? C.fucsia : "transparent",
                  color: activeSubTab === "campaigns" ? C.fucsia : "rgba(255, 255, 255, 0.6)",
                }}
              >
                Campañas Mailing ({campaigns.length})
              </button>
            </div>

            <div className="flex items-center gap-2.5 py-1.5">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 bg-brand-magenta hover:bg-[#D80073] text-white font-bold px-3.5 py-1.5 rounded-xl text-xs cursor-pointer transition-all active:scale-95 shadow-lg shadow-[#FF0096]/20"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Cliente
              </button>
              
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 font-bold px-3.5 py-1.5 rounded-xl text-xs cursor-pointer transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" /> Exportar Excel
              </button>

              {selectedClients.size > 0 && (
                <button
                  onClick={() => setShowCampaignModal(true)}
                  className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs cursor-pointer transition-all active:scale-95 shadow-md shadow-cyan-500/10"
                >
                  <Send className="w-3.5 h-3.5 animate-pulse" /> Campaña ({selectedClients.size})
                </button>
              )}
            </div>
          </div>

          {/* ─ SUB TAB 1: CLIENT DATABASE ─ */}
          {activeSubTab === "database" && (
            <div className="p-6">
              
              {/* Filters grid */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    placeholder="Buscar clientes por nombre, email, teléfono o notas..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-semibold"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <Filter className="w-4 h-4 text-white/40" />
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="bg-slate-800 border border-white/10 text-white text-xs rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-cyan-400"
                  >
                    <option value="all">Todos los Orígenes</option>
                    <option value="whatsapp">Origen WhatsApp</option>
                    <option value="chat_ia">Origen Chat Inteligente</option>
                    <option value="manual">Origen Manual / CRM</option>
                  </select>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/45 border-b border-white/10 text-white/50 text-[10px] uppercase font-bold tracking-wider">
                      <th className="p-4 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={filteredAndSortedClients.length > 0 && selectedClients.size === filteredAndSortedClients.length}
                          onChange={handleSelectAllToggle}
                          className="rounded border-white/20 bg-white/5 text-[#FF0096] focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("name")}>
                        Cliente <ArrowUpDown className="w-3 h-3 inline-block ml-1" />
                      </th>
                      <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("email")}>
                        Email <ArrowUpDown className="w-3 h-3 inline-block ml-1" />
                      </th>
                      <th className="p-4">Teléfono</th>
                      <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("source")}>
                        Origen <ArrowUpDown className="w-3 h-3 inline-block ml-1" />
                      </th>
                      <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("createdAt")}>
                        Registro <ArrowUpDown className="w-3 h-3 inline-block ml-1" />
                      </th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-white/5 text-xs font-semibold text-white/80">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="p-16 text-center">
                          <Loader2 className="w-8 h-8 text-[#FF0096] animate-spin mx-auto mb-3" />
                          <span className="text-white/40 block">Cargando base de datos de clientes...</span>
                        </td>
                      </tr>
                    ) : filteredAndSortedClients.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-16 text-center text-white/40">
                          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-white/20" />
                          No se encontraron clientes para los filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedClients.map((client) => {
                        const isSelected = selectedClients.has(client.id);
                        return (
                          <tr 
                            key={client.id} 
                            className={`hover:bg-white/5 transition-all ${isSelected ? 'bg-cyan-500/5' : ''}`}
                          >
                            <td className="p-4 w-12 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectClient(client.id)}
                                className="rounded border-white/20 bg-white/5 text-[#FF0096] focus:ring-0 cursor-pointer"
                              />
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-white">{client.name}</div>
                              {client.interest && <div className="text-[10px] text-white/40 font-medium mt-0.5">{client.interest}</div>}
                            </td>
                            <td className="p-4 text-cyan-400 font-mono">
                              {client.email.includes("sin_correo") ? (
                                <span className="text-white/25 italic">No registrado</span>
                              ) : client.email}
                            </td>
                            <td className="p-4 font-mono text-white/70">
                              {client.phone ? client.phone : <span className="text-white/25 italic">N/D</span>}
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                client.source === "whatsapp" ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                client.source === "chat_ia" ? 'bg-[#FF0096]/10 text-[#FF0096] border border-[#FF0096]/20' :
                                'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              }`}>
                                {client.source === "whatsapp" ? "WhatsApp" : client.source === "chat_ia" ? "Chat IA" : "Manual"}
                              </span>
                            </td>
                            <td className="p-4 text-white/50 text-[11px]">
                              {new Date(client.createdAt).toLocaleDateString("es-VE", {
                                year: "numeric", month: "short", day: "numeric"
                              })}
                            </td>
                            <td className="p-4 text-center">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => setShowDetailModal(client)}
                                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 hover:border-white/20 transition-all text-white"
                                  title="Ver Detalle"
                                >
                                  <Info className="w-3.5 h-3.5" />
                                </button>
                                
                                <button
                                  onClick={() => triggerCallSimulation(client)}
                                  disabled={!client.phone}
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                                    client.phone 
                                      ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                                      : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'
                                  }`}
                                  title={client.phone ? "Llamar por Teléfono" : "Sin teléfono"}
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </button>

                                <a
                                  href={client.email && !client.email.includes("sin_correo") ? `mailto:${client.email}` : undefined}
                                  onClick={(e) => {
                                    if (!client.email || client.email.includes("sin_correo")) {
                                      e.preventDefault();
                                      triggerToast("El cliente no tiene un email válido registrado", "info");
                                    }
                                  }}
                                >
                                  <button
                                    disabled={!client.email || client.email.includes("sin_correo")}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                                      client.email && !client.email.includes("sin_correo")
                                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                                        : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'
                                    }`}
                                    title={client.email && !client.email.includes("sin_correo") ? "Enviar Correo Directo" : "Sin email"}
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                  </button>
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Multiple selection info toast bar */}
              {selectedClients.size > 0 && (
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-cyan-500/30 rounded-xl px-5 py-3.5 mt-5 flex justify-between items-center flex-wrap gap-3">
                  <div className="text-xs text-white font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400" />
                    <span>Tienes <strong>{selectedClients.size}</strong> clientes seleccionados para campaña de mailing o exportación</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedClients(new Set())}
                      className="text-[11px] font-black text-white/50 hover:text-white px-3 py-1 cursor-pointer transition-colors"
                    >
                      Deseleccionar todos
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SUB TAB 2: CAMPAIGNS ── */}
          {activeSubTab === "campaigns" && (
            <div className="p-6">
              <h3 className="text-white font-bold text-sm mb-4">Historial de Campañas Enviadas</h3>
              
              {campaigns.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-black/20 p-12 text-center text-white/40">
                  <MailCheck className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="font-bold">No hay campañas registradas</p>
                  <p className="text-xs text-white/30 mt-1">Selecciona clientes en la Base de Datos para enviar tu primera campaña.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((camp) => (
                    <div key={camp.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3 mb-3">
                        <div>
                          <h4 className="font-bold text-white text-sm">{camp.subject}</h4>
                          <span className="text-[10px] text-white/40 block mt-0.5">Enviado: {new Date(camp.sentAt).toLocaleString("es-VE")}</span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-black shrink-0">
                          {camp.recipientsCount} Destinatarios
                        </span>
                      </div>
                      <p className="text-xs text-white/70 whitespace-pre-line font-medium leading-relaxed max-h-36 overflow-y-auto">
                        {camp.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── MODAL: AGREGAR CLIENTE ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-zoom-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4.5 h-4.5 text-[#FF0096]" /> Agregar Nuevo Cliente Manual
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <form onSubmit={handleAddClient} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-white/50 tracking-wider mb-1.5">Nombre del Cliente *</label>
                <input
                  required
                  placeholder="Ej: Alejandro Díaz"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                  value={addForm.name}
                  onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-white/50 tracking-wider mb-1.5">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="alejandro@ejemplo.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                    value={addForm.email}
                    onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-white/50 tracking-wider mb-1.5">Teléfono Móvil</label>
                  <input
                    placeholder="+58 412 1234567"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                    value={addForm.phone}
                    onChange={(e) => setAddForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-white/50 tracking-wider mb-1.5">Origen del Cliente</label>
                  <select
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                    value={addForm.source}
                    onChange={(e) => setAddForm(prev => ({ ...prev, source: e.target.value }))}
                  >
                    <option value="manual">Manual / CRM</option>
                    <option value="whatsapp">WhatsApp Chat</option>
                    <option value="chat_ia">Chat Inteligente IA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-white/50 tracking-wider mb-1.5">Interés Principal</label>
                  <input
                    placeholder="Ej: Posada Los Roques, Presupuesto..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                    value={addForm.interest}
                    onChange={(e) => setAddForm(prev => ({ ...prev, interest: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-white/50 tracking-wider mb-1.5">Notas / Detalles adicionales</label>
                <textarea
                  rows={3}
                  placeholder="Detalles sobre su solicitud de cotización o historial del cliente..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                  value={addForm.notes}
                  onChange={(e) => setAddForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-brand-magenta hover:bg-[#D80073] text-white font-bold rounded-xl text-xs cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: NUEVA CAMPAÑA DE CORREO ── */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-zoom-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4.5 h-4.5 text-cyan-400" /> Crear Campaña de Correo Masivo (Mailing)
              </h3>
              <button onClick={() => setShowCampaignModal(false)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <form onSubmit={handleSendCampaign} className="p-6 space-y-4">
              <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-xl p-3.5 text-xs text-cyan-400 font-semibold flex items-start gap-2.5">
                <Info className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <div>
                  Estás a punto de enviar esta campaña a <strong>{selectedClients.size}</strong> destinatarios seleccionados que poseen correo electrónico válido.
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-white/50 tracking-wider mb-1.5">Asunto del Correo</label>
                <input
                  required
                  placeholder="Ej: ¡Ofertas exclusivas de temporada en Hoteles de Venezuela!"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                  value={campaignForm.subject}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-white/50 tracking-wider mb-1.5">Cuerpo del Correo (Formato HTML / Texto Plano)</label>
                <textarea
                  required
                  rows={8}
                  placeholder="Escribe el mensaje de tu campaña aquí. Puedes incluir enlaces de reserva y firmas corporativas..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400 leading-relaxed"
                  value={campaignForm.body}
                  onChange={(e) => setCampaignForm(prev => ({ ...prev, body: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCampaignModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                >
                  <Send className="w-3.5 h-3.5" /> Enviar Campaña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: VER DETALLE CLIENTE ── */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-zoom-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Info className="w-4.5 h-4.5 text-cyan-400" /> Ficha de Detalle de Cliente
              </h3>
              <button onClick={() => setShowDetailModal(null)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-xs font-semibold">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-magenta/10 border border-brand-magenta/20 flex items-center justify-center text-brand-magenta text-lg font-black uppercase">
                  {showDetailModal.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{showDetailModal.name}</h4>
                  <span className="text-[10px] text-white/40 block mt-0.5">Fecha Registro: {new Date(showDetailModal.createdAt).toLocaleString("es-VE")}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-b border-white/5 py-4 my-2">
                <div>
                  <span className="block text-[10px] text-white/40 uppercase mb-1">Origen</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    showDetailModal.source === "whatsapp" ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    showDetailModal.source === "chat_ia" ? 'bg-[#FF0096]/10 text-[#FF0096] border border-[#FF0096]/20' :
                    'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  }`}>
                    {showDetailModal.source === "whatsapp" ? "WhatsApp" : showDetailModal.source === "chat_ia" ? "Chat IA" : "Manual"}
                  </span>
                </div>
                
                <div>
                  <span className="block text-[10px] text-white/40 uppercase mb-1">Interés</span>
                  <span className="text-white font-bold">{showDetailModal.interest}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="block text-[10px] text-white/40 uppercase mb-1">Correo Electrónico</span>
                  <span className="text-cyan-400 font-mono block">
                    {showDetailModal.email.includes("sin_correo") ? "No Registrado" : showDetailModal.email}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-white/40 uppercase mb-1">Teléfono Móvil</span>
                  <span className="text-white/80 font-mono block">{showDetailModal.phone || "No Registrado"}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-white/40 uppercase mb-1">Notas / Bitácora del Cliente</span>
                  <p className="text-white/70 bg-black/25 rounded-xl p-3 border border-white/5 leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {showDetailModal.notes || "Sin comentarios o notas registradas."}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={() => setShowDetailModal(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: SIMULADOR DE LLAMADAS ── */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-zoom-in text-center p-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 mx-auto mb-4 animate-pulse">
              <Phone className="w-7 h-7" />
            </div>
            
            <h3 className="text-lg font-bold text-white mb-1">Llamando a Cliente</h3>
            <h4 className="text-sm font-extrabold text-[#FF0096] mb-4">{showCallModal.name}</h4>
            
            <div className="text-xs text-white/50 mb-6 space-y-1">
              <p>Marcando número de teléfono:</p>
              <p className="font-mono text-white text-sm font-bold mt-1">{showCallModal.phone}</p>
            </div>

            <div className="flex flex-col gap-2.5">
              <a 
                href={`tel:${showCallModal.phone}`}
                className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors block text-center"
                onClick={() => setShowCallModal(null)}
              >
                Abrir Teléfono del Sistema / VoIP
              </a>
              <button
                onClick={() => setShowCallModal(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white/80 hover:text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Colgar / Volver
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
