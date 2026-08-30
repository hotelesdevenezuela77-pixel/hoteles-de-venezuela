import { useState, useEffect } from "react";
import { Plus, X, Phone, Mail, MessageCircle, Clock, User, ChevronRight, Search } from "lucide-react";

interface Lead {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  room_type_interest: string | null;
  check_in_date: string | null;
  check_out_date: string | null;
  status: string;
  assigned_to: string | null;
  notes: string | null;
  last_contact_at: string | null;
  created_at: string;
}

interface LeadHistory {
  id: number;
  lead_id: number;
  action_type: string;
  description: string | null;
  contacted_via: string | null;
  created_by: string | null;
  created_at: string;
}

const LEAD_STATUSES = [
  { value: "nuevo", label: "Nuevo", color: "bg-blue-100 text-blue-700 border-blue-300" },
  { value: "contactado", label: "Contactado", color: "bg-amber-100 text-amber-700 border-amber-300" },
  { value: "interesado", label: "Interesado", color: "bg-purple-100 text-purple-700 border-purple-300" },
  { value: "reservado", label: "Reservado", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  { value: "perdido", label: "Perdido", color: "bg-slate-100 text-slate-500 border-slate-300" },
];

const ROOM_TYPES = [
  { value: "Familiar", label: "Familiar (4 personas)" },
  { value: "Familiar Grande", label: "Familiar Grande (6 personas)" },
  { value: "Extrafamiliar", label: "Extrafamiliar (8 personas)" },
  { value: "Ejecutiva", label: "Ejecutiva (2 personas)" },
];

const WHATSAPP_TEMPLATES = [
  {
    name: "Bienvenida",
    message: "¡Hola {nombre}! 🏖️ Gracias por contactar Posada Perla Negra. ¿En qué fechas te gustaría visitarnos? Tenemos habitaciones familiares en el centro de Tucacas, Morrocoy.",
  },
  {
    name: "Disponibilidad",
    message: "¡Hola {nombre}! 🌴 Te confirmo que tenemos disponibilidad para las fechas {check_in} al {check_out}. ¿Te gustaría que te envíe los precios y fotos de las habitaciones?",
  },
  {
    name: "Precios",
    message: "¡Hola {nombre}! 💰 Nuestros precios por noche son:\n\n🛏️ Familiar (4 pers): $XX\n🛏️ Familiar Grande (6 pers): $XX\n🛏️ Extrafamiliar (8 pers): $XX\n🛏️ Ejecutiva (2 pers): $XX\n\nIncluye WiFi, A/C y estacionamiento. ¿Cuál te interesa?",
  },
  {
    name: "Confirmar Reserva",
    message: "¡Hola {nombre}! ✅ Tu reserva está confirmada:\n\n📅 Check-in: {check_in}\n📅 Check-out: {check_out}\n🏨 Habitación: {tipo_habitacion}\n\n¡Te esperamos en Posada Perla Negra! 🌊",
  },
  {
    name: "Recordatorio",
    message: "¡Hola {nombre}! 🔔 Te recordamos que tu reserva en Posada Perla Negra es el {check_in}. El check-in es a partir de las 2:00 PM. ¿Tienes alguna pregunta?",
  },
  {
    name: "Seguimiento",
    message: "¡Hola {nombre}! 👋 Hace unos días nos contactaste sobre una reserva. ¿Aún estás interesado/a? Tenemos disponibilidad en Posada Perla Negra. 🏖️",
  },
];

export default function CRMLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadHistory, setLeadHistory] = useState<LeadHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewLead, setShowNewLead] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    room_type_interest: "",
    check_in_date: "",
    check_out_date: "",
    notes: "",
  });

  const [historyForm, setHistoryForm] = useState({
    action_type: "llamada",
    description: "",
    contacted_via: "whatsapp",
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    if (selectedLead) {
      fetchLeadHistory(selectedLead.id);
    }
  }, [selectedLead]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadHistory = async (leadId: number) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/history`);
      if (res.ok) {
        const data = await res.json();
        setLeadHistory(data);
      }
    } catch (error) {
      console.error("Error fetching lead history:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowNewLead(false);
        setFormData({
          name: "",
          phone: "",
          email: "",
          room_type_interest: "",
          check_in_date: "",
          check_out_date: "",
          notes: "",
        });
        fetchLeads();
      }
    } catch (error) {
      console.error("Error creating lead:", error);
    }
  };

  const updateLeadStatus = async (leadId: number, status: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchLeads();
        if (selectedLead?.id === leadId) {
          setSelectedLead({ ...selectedLead, status });
        }
      }
    } catch (error) {
      console.error("Error updating lead:", error);
    }
  };

  const addHistoryEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    try {
      const res = await fetch(`/api/leads/${selectedLead.id}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(historyForm),
      });

      if (res.ok) {
        setHistoryForm({ action_type: "llamada", description: "", contacted_via: "whatsapp" });
        fetchLeadHistory(selectedLead.id);
        fetchLeads(); // Refresh to update last_contact_at
      }
    } catch (error) {
      console.error("Error adding history:", error);
    }
  };

  const openWhatsApp = (lead: Lead, template?: typeof WHATSAPP_TEMPLATES[0]) => {
    if (!lead.phone) return;
    
    let message = template?.message || "";
    message = message.replace("{nombre}", lead.name);
    message = message.replace("{check_in}", lead.check_in_date || "[fecha]");
    message = message.replace("{check_out}", lead.check_out_date || "[fecha]");
    message = message.replace("{tipo_habitacion}", lead.room_type_interest || "[tipo]");
    
    const phone = lead.phone.replace(/\D/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const getStatusInfo = (status: string) => {
    return LEAD_STATUSES.find((s) => s.value === status) || LEAD_STATUSES[0];
  };

  const filteredLeads = leads.filter((lead) => {
    if (filterStatus !== "all" && lead.status !== filterStatus) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        lead.name.toLowerCase().includes(search) ||
        lead.phone?.toLowerCase().includes(search) ||
        lead.email?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const statusCounts = LEAD_STATUSES.map((status) => ({
    ...status,
    count: leads.filter((l) => l.status === status.value).length,
  }));

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] lg:h-[calc(100vh-4rem)] -m-4 lg:-m-8">
      {/* Lead List */}
      <div className={`${selectedLead ? 'hidden lg:flex' : 'flex'} w-full lg:w-96 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800">CRM / Leads</h1>
            <button
              onClick={() => setShowNewLead(true)}
              className="p-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg hover:opacity-90"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar lead..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                filterStatus === "all"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Todos ({leads.length})
            </button>
            {statusCounts.map((status) => (
              <button
                key={status.value}
                onClick={() => setFilterStatus(status.value)}
                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap border ${
                  filterStatus === status.value
                    ? status.color
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {status.label} ({status.count})
              </button>
            ))}
          </div>
        </div>

        {/* Lead List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-slate-500">Cargando...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              No hay leads. ¡Crea el primero!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => {
                const statusInfo = getStatusInfo(lead.status);
                return (
                  <button
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                      selectedLead?.id === lead.id ? "bg-amber-50 border-l-4 border-amber-500" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-slate-800">{lead.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    {lead.phone && (
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {lead.phone}
                      </p>
                    )}
                    {lead.room_type_interest && (
                      <p className="text-xs text-slate-400 mt-1">
                        Interés: {lead.room_type_interest}
                      </p>
                    )}
                    {lead.last_contact_at && (
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Último contacto: {new Date(lead.last_contact_at).toLocaleDateString("es-VE")}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Lead Detail */}
      <div className={`${selectedLead ? 'flex' : 'hidden lg:flex'} flex-1 flex-col bg-slate-50`}>
        {selectedLead ? (
          <>
            {/* Lead Header */}
            <div className="bg-white border-b border-slate-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="lg:hidden flex items-center gap-1 text-amber-600 text-sm mb-2"
                  >
                    ← Volver a lista
                  </button>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{selectedLead.name}</h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-slate-500 text-sm">
                    {selectedLead.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" /> {selectedLead.phone}
                      </span>
                    )}
                    {selectedLead.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" /> {selectedLead.email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedLead.phone && (
                    <>
                      <button
                        onClick={() => setShowTemplates(true)}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 text-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>
                    </>
                  )}
                  <select
                    value={selectedLead.status}
                    onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value)}
                    className="px-2 sm:px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                  >
                    {LEAD_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lead Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Interés</p>
                  <p className="text-sm font-medium text-slate-700">
                    {selectedLead.room_type_interest || "No especificado"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Check-in</p>
                  <p className="text-sm font-medium text-slate-700">
                    {selectedLead.check_in_date
                      ? new Date(selectedLead.check_in_date).toLocaleDateString("es-VE")
                      : "No especificado"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Check-out</p>
                  <p className="text-sm font-medium text-slate-700">
                    {selectedLead.check_out_date
                      ? new Date(selectedLead.check_out_date).toLocaleDateString("es-VE")
                      : "No especificado"}
                  </p>
                </div>
              </div>

              {selectedLead.notes && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">{selectedLead.notes}</p>
                </div>
              )}
            </div>

            {/* History */}
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Historial de Contacto</h3>

              {/* Add History Entry */}
              <form onSubmit={addHistoryEntry} className="bg-white rounded-xl p-4 mb-4 border border-slate-200">
                <div className="flex gap-3">
                  <select
                    value={historyForm.contacted_via}
                    onChange={(e) => setHistoryForm({ ...historyForm, contacted_via: e.target.value })}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="llamada">Llamada</option>
                    <option value="email">Email</option>
                    <option value="presencial">Presencial</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Agregar nota de contacto..."
                    value={historyForm.description}
                    onChange={(e) => setHistoryForm({ ...historyForm, description: e.target.value })}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm"
                  >
                    Agregar
                  </button>
                </div>
              </form>

              {/* History List */}
              <div className="space-y-3">
                {leadHistory.length === 0 ? (
                  <p className="text-center text-slate-400 py-8">Sin historial de contacto</p>
                ) : (
                  leadHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-white rounded-xl p-4 border border-slate-200"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            entry.contacted_via === "whatsapp"
                              ? "bg-emerald-100 text-emerald-600"
                              : entry.contacted_via === "llamada"
                              ? "bg-blue-100 text-blue-600"
                              : entry.contacted_via === "email"
                              ? "bg-purple-100 text-purple-600"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {entry.contacted_via === "whatsapp" ? (
                            <MessageCircle className="w-4 h-4" />
                          ) : entry.contacted_via === "llamada" ? (
                            <Phone className="w-4 h-4" />
                          ) : entry.contacted_via === "email" ? (
                            <Mail className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-700">{entry.description}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(entry.created_at).toLocaleString("es-VE")}
                            {entry.created_by && ` • ${entry.created_by}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <User className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Selecciona un lead para ver los detalles</p>
            </div>
          </div>
        )}
      </div>

      {/* New Lead Modal */}
      {showNewLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Nuevo Lead</h3>
              <button
                onClick={() => setShowNewLead(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="+58 414 1234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo de Habitación de Interés
                </label>
                <select
                  value={formData.room_type_interest}
                  onChange={(e) => setFormData({ ...formData, room_type_interest: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Seleccionar...</option>
                  {ROOM_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Check-in</label>
                  <input
                    type="date"
                    value={formData.check_in_date}
                    onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Check-out</label>
                  <input
                    type="date"
                    value={formData.check_out_date}
                    onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                    min={formData.check_in_date}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewLead(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg hover:opacity-90"
                >
                  Crear Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Templates Modal */}
      {showTemplates && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Plantillas WhatsApp</h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {WHATSAPP_TEMPLATES.map((template, index) => (
                <button
                  key={index}
                  onClick={() => {
                    openWhatsApp(selectedLead, template);
                    setShowTemplates(false);
                  }}
                  className="w-full p-4 text-left bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-800">{template.name}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2">{template.message}</p>
                </button>
              ))}

              <button
                onClick={() => {
                  openWhatsApp(selectedLead);
                  setShowTemplates(false);
                }}
                className="w-full p-4 text-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium"
              >
                Abrir WhatsApp sin plantilla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Credit */}
      <div className="text-center py-6 border-t border-slate-200 mt-8">
        <p className="text-slate-400 text-sm">
          Posada Perla Negra — <span className="font-semibold text-amber-600">18 años de experiencia</span>
        </p>
        <p className="text-slate-400 text-sm">
          Centro de Tucacas, Morrocoy — <span className="text-amber-600">Lugar Familiar</span>
        </p>
      </div>
    </div>
  );
}
