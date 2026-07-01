import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import {
  Briefcase, MessageSquare, Plus, Edit2, Trash2, Phone, Mail, Building2,
  MapPin, X, Save, User, Tag, Calendar, FileText, ChevronDown, Clock, Loader2
} from "lucide-react";

/* ── types ───────────────────────────────────────────────── */
interface Lead {
  id: number; phone: string; name: string; email: string; source: string;
  interest: string; status: string; notes: string; leadType: string;
  businessType: string; assignedTo: string; createdAt: string;
}
interface Prospect {
  id: number; establishmentName: string; contactName: string; phone: string;
  email: string; destinationName: string; zone: string; address: string;
  category: string; status: string; notes: string; priority: string;
  visitDate: string; nextFollowupDate: string; contractUrl: string; createdAt: string;
}

const LEAD_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  nuevo:       { bg: "bg-blue-50",   text: "text-blue-700",   label: "Nuevo" },
  contactado:  { bg: "bg-yellow-50", text: "text-yellow-700", label: "Contactado" },
  interesado:  { bg: "bg-green-50",  text: "text-green-700",  label: "Interesado" },
  negociando:  { bg: "bg-purple-50", text: "text-purple-700", label: "Negociando" },
  cerrado:     { bg: "bg-gray-100",  text: "text-gray-600",   label: "Cerrado" },
  perdido:     { bg: "bg-red-50",    text: "text-red-700",    label: "Perdido" },
};

const PROSPECT_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  por_visitar: { bg: "bg-indigo-50",  text: "text-indigo-700",  label: "Por visitar" },
  visitado:    { bg: "bg-blue-50",    text: "text-blue-700",    label: "Visitado" },
  interesado:  { bg: "bg-green-50",   text: "text-green-700",   label: "Interesado" },
  negociando:  { bg: "bg-yellow-50",  text: "text-yellow-700",  label: "Negociando" },
  contratado:  { bg: "bg-emerald-50", text: "text-emerald-700", label: "Contratado" },
  rechazado:   { bg: "bg-red-50",     text: "text-red-700",     label: "Rechazado" },
};

const PRIORITY_STYLE: Record<string, string> = {
  alta:   "bg-red-50 text-red-600 border-red-200",
  normal: "bg-gray-100 text-gray-500 border-gray-200",
  baja:   "bg-blue-50 text-blue-500 border-blue-200",
};

const TIPO_STYLE: Record<string, string> = {
  turista:     "bg-cyan-50 text-cyan-700",
  propietario: "bg-pink-50 text-pink-700",
  other:       "bg-gray-100 text-gray-500",
};

const EMPTY_PROSPECT = {
  establishmentName: "", contactName: "", phone: "", email: "",
  destinationName: "", zone: "", address: "", category: "",
  status: "por_visitar", notes: "", priority: "normal",
  visitDate: "", nextFollowupDate: "", contractUrl: "",
};

export function AdminComercial() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const qc = useQueryClient();

  const [tab, setTab] = useState<"leads" | "prospects">("leads");
  const [prospectModal, setProspectModal] = useState<"create" | "edit" | null>(null);
  const [editProspect, setEditProspect] = useState<Prospect | null>(null);
  const [form, setForm] = useState<typeof EMPTY_PROSPECT>(EMPTY_PROSPECT);
  const [expandedLead, setExpandedLead] = useState<number | null>(null);
  const [leadNote, setLeadNote] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      nav("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Query Leads from Supabase
  const { data: rawLeads = [], isLoading: loadingLeads } = useQuery<any[]>({
    queryKey: ["whatsapp-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase query failed for whatsapp_leads:", error);
      }

      const localLeadsKey = "hdv_mock_whatsapp_leads";
      const localLeads = JSON.parse(localStorage.getItem(localLeadsKey) || "[]");
      const combined = [...(data || []), ...localLeads];

      return combined.map((l: any) => ({
        id: l.id,
        phone: l.phone || "",
        name: l.name || "",
        email: l.email || "",
        source: l.source || "",
        interest: l.interest || "",
        status: l.status || "nuevo",
        notes: l.notes || "",
        leadType: l.lead_type ?? l.leadType ?? "",
        businessType: l.business_type ?? l.businessType ?? "",
        assignedTo: l.assigned_to ?? l.assignedTo ?? "",
        createdAt: l.created_at ?? l.createdAt ?? new Date().toISOString()
      }));
    }
  });

  // Query Prospects from Supabase
  const { data: rawProspects = [], isLoading: loadingProspects } = useQuery<any[]>({
    queryKey: ["commercial-prospects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commercial_prospects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase query failed for commercial_prospects:", error);
      }

      const localPropsKey = "hdv_mock_commercial_prospects";
      const localProps = JSON.parse(localStorage.getItem(localPropsKey) || "[]");
      const combined = [...(data || []), ...localProps];

      return combined.map((p: any) => ({
        id: p.id,
        establishmentName: p.establishment_name ?? p.establishmentName ?? "",
        contactName: p.contact_name ?? p.contactName ?? "",
        phone: p.phone || "",
        email: p.email || "",
        destinationName: p.destination_name ?? p.destinationName ?? "",
        zone: p.zone || "",
        address: p.address || "",
        category: p.category || "",
        status: p.status || "por_visitar",
        notes: p.notes || "",
        priority: p.priority || "normal",
        visitDate: p.visit_date ?? p.visitDate ?? "",
        nextFollowupDate: p.next_followup_date ?? p.nextFollowupDate ?? "",
        contractUrl: p.contract_url ?? p.contractUrl ?? "",
        createdAt: p.created_at ?? p.createdAt ?? new Date().toISOString()
      }));
    }
  });

  // Update Lead Mutation
  const updateLead = useMutation({
    mutationFn: async (d: { id: number; data: Partial<Lead> }) => {
      const localLeadsKey = "hdv_mock_whatsapp_leads";
      const localLeads = JSON.parse(localStorage.getItem(localLeadsKey) || "[]");
      const isMock = localLeads.some((l: any) => l.id === d.id);

      const payload: Record<string, any> = {};
      if (d.data.status !== undefined) payload.status = d.data.status;
      if (d.data.notes !== undefined) payload.notes = d.data.notes;

      if (isMock || d.id >= 10000) {
        const updated = localLeads.map((l: any) => l.id === d.id ? { ...l, ...payload } : l);
        localStorage.setItem(localLeadsKey, JSON.stringify(updated));
        return { success: true };
      }

      try {
        const { error } = await supabase
          .from("whatsapp_leads")
          .update(payload)
          .eq("id", d.id);
        if (error) throw error;
      } catch (err) {
        const updated = localLeads.map((l: any) => l.id === d.id ? { ...l, ...payload } : l);
        localStorage.setItem(localLeadsKey, JSON.stringify(updated));
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["whatsapp-leads"] });
    }
  });

  // Save Prospect Mutation
  const saveProspect = useMutation({
    mutationFn: async (d: typeof EMPTY_PROSPECT) => {
      const isEdit = prospectModal === "edit" && editProspect !== null;
      const payload = {
        establishment_name: d.establishmentName,
        contact_name: d.contactName,
        phone: d.phone,
        email: d.email,
        destination_name: d.destinationName,
        zone: d.zone,
        address: d.address,
        category: d.category,
        status: d.status,
        notes: d.notes,
        priority: d.priority,
        visit_date: d.visitDate || null,
        next_followup_date: d.nextFollowupDate || null,
        contract_url: d.contractUrl
      };

      const localPropsKey = "hdv_mock_commercial_prospects";
      const localProps = JSON.parse(localStorage.getItem(localPropsKey) || "[]");
      const isMock = editProspect !== null && (editProspect.id >= 10000 || localProps.some((p: any) => p.id === editProspect.id));

      if (isMock || (isEdit && editProspect && editProspect.id >= 10000)) {
        if (isEdit && editProspect) {
          const updated = localProps.map((p: any) => p.id === editProspect.id ? { ...p, ...payload } : p);
          localStorage.setItem(localPropsKey, JSON.stringify(updated));
        } else {
          localStorage.setItem(localPropsKey, JSON.stringify([...localProps, { id: Date.now(), ...payload }]));
        }
        return { success: true };
      }

      try {
        if (isEdit && editProspect !== null) {
          const { error } = await supabase
            .from("commercial_prospects")
            .update(payload)
            .eq("id", editProspect.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("commercial_prospects")
            .insert(payload);
          if (error) throw error;
        }
      } catch (err) {
        if (isEdit && editProspect) {
          const updated = localProps.map((p: any) => p.id === editProspect.id ? { ...p, ...payload } : p);
          localStorage.setItem(localPropsKey, JSON.stringify(updated));
        } else {
          localStorage.setItem(localPropsKey, JSON.stringify([...localProps, { id: Date.now(), ...payload }]));
        }
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["commercial-prospects"] });
      setProspectModal(null);
    }
  });

  // Delete Prospect Mutation
  const deleteProspect = useMutation({
    mutationFn: async (id: number) => {
      const localPropsKey = "hdv_mock_commercial_prospects";
      const localProps = JSON.parse(localStorage.getItem(localPropsKey) || "[]");
      const hasLocal = localProps.some((p: any) => p.id === id);

      if (hasLocal) {
        localStorage.setItem(localPropsKey, JSON.stringify(localProps.filter((p: any) => p.id !== id)));
        return { success: true };
      }

      try {
        const { error } = await supabase
          .from("commercial_prospects")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } catch (err) {
        localStorage.setItem(localPropsKey, JSON.stringify(localProps.filter((p: any) => p.id !== id)));
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["commercial-prospects"] });
    }
  });

  const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => {
    setForm(EMPTY_PROSPECT);
    setEditProspect(null);
    setProspectModal("create");
  };

  const openEdit = (p: Prospect) => {
    setForm({
      establishmentName: p.establishmentName,
      contactName: p.contactName ?? "",
      phone: p.phone ?? "",
      email: p.email ?? "",
      destinationName: p.destinationName ?? "",
      zone: p.zone ?? "",
      address: p.address ?? "",
      category: p.category ?? "",
      status: p.status,
      notes: p.notes ?? "",
      priority: p.priority ?? "normal",
      visitDate: p.visitDate ?? "",
      nextFollowupDate: p.nextFollowupDate ?? "",
      contractUrl: p.contractUrl ?? ""
    });
    setEditProspect(p);
    setProspectModal("edit");
  };

  const leads = rawLeads;
  const prospects = rawProspects;

  const newLeads = leads.filter(l => l.status === "nuevo").length;
  const newProspects = prospects.filter(p => p.status === "por_visitar").length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
        <p className="text-gray-500 text-xs font-bold">Verificando credenciales de seguridad...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 pb-24 font-sans">
      {/* Header */}
      <div className="relative overflow-hidden py-8" style={{ background: "linear-gradient(135deg, #0e0120, #1a0533)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#FF0096" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-pink-500/20">
              <Briefcase className="w-4.5 h-4.5 text-pink-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Gestión Comercial (CRM)</h1>
              <p className="text-white/50 text-xs font-semibold">Gestiona la prospección comercial de hoteles y los prospectos en pipeline</p>
            </div>
          </div>
          {tab === "prospects" && (
            <button onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold border border-pink-700 cursor-pointer transition-transform hover:scale-102"
              style={{ background: "linear-gradient(90deg, #9B00CC, #FF0096)" }}>
              <Plus className="w-4 h-4" /> Nuevo Prospecto
            </button>
          )}
        </div>
      </div>

      <AdminTabBar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1.5 rounded-2xl bg-gray-150/60 w-fit mb-6">
          {[
            { id: "leads" as const, label: "Leads Chat / WhatsApp", count: leads.length, badge: newLeads },
            { id: "prospects" as const, label: "Prospectos Comerciales", count: prospects.length, badge: newProspects },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>
              {t.label} <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full text-[9px] font-black">{t.count}</span>
            </button>
          ))}
        </div>

        {/* ═══ LEADS TAB ═══ */}
        {tab === "leads" && (
          <div className="space-y-3">
            {loadingLeads ? (
              <div className="text-center py-20 text-gray-400 text-xs font-bold">Cargando leads...</div>
            ) : leads.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-xs">
                <MessageSquare className="w-10 h-10 text-gray-250 mx-auto mb-3" />
                <p className="text-gray-400 text-xs font-bold">No hay leads registrados aún</p>
              </div>
            ) : (
              leads.map((l: Lead) => {
                const st = LEAD_STATUS[l.status] ?? LEAD_STATUS.nuevo;
                const tipo = TIPO_STYLE[l.leadType] ?? TIPO_STYLE.other;
                const expanded = expandedLead === l.id;
                return (
                  <div key={l.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-sm transition-all">
                    <div className="p-4 flex items-start gap-4 cursor-pointer" onClick={() => setExpandedLead(expanded ? null : l.id)}>
                      <div className="w-9 h-9 rounded-xl bg-gray-50 border flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                          {l.leadType && <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${tipo}`}>{l.leadType}</span>}
                          {l.source && <span className="text-[9px] font-bold text-gray-400 bg-slate-50 px-2 py-0.5 rounded-full uppercase border">origen: {l.source.replace("_", " ")}</span>}
                          <span className="text-[9px] text-gray-400 font-bold ml-auto flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-300" />{new Date(l.createdAt).toLocaleDateString("es-VE")}
                          </span>
                        </div>
                        <p className="font-bold text-gray-900 text-sm">{l.name || <span className="text-gray-400 italic font-semibold">Huésped sin identificar</span>}</p>
                        <div className="flex items-center gap-4 mt-1 flex-wrap font-semibold text-xs text-gray-500">
                          {l.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-350" />{l.phone}</span>}
                          {l.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-350" />{l.email}</span>}
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-300 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </div>

                    {expanded && (
                      <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Cambiar estado del lead:</span>
                          <div className="flex gap-1.5 flex-wrap">
                            {Object.entries(LEAD_STATUS).map(([k, v]) => (
                              <button key={k} onClick={() => updateLead.mutate({ id: l.id, data: { status: k } })}
                                disabled={l.status === k || updateLead.isPending}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer ${l.status === k ? `${v.bg} ${v.text} border-current` : "bg-white text-gray-400 border-gray-200 hover:border-gray-300 disabled:opacity-50"}`}>
                                {v.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {l.notes && (
                          <div className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3 border font-semibold">
                            <strong>Notas / Seguimiento:</strong> {l.notes}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <input value={expandedLead === l.id ? leadNote : ""}
                            onChange={e => setLeadNote(e.target.value)}
                            placeholder="Añadir comentario o bitácora de contacto..."
                            className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-300 bg-white font-semibold" />
                          <button onClick={() => { updateLead.mutate({ id: l.id, data: { notes: leadNote } }); setLeadNote(""); }}
                            disabled={!leadNote.trim() || updateLead.isPending}
                            className="px-4 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                            style={{ background: "#FF0096" }}>
                            Guardar nota
                          </button>
                        </div>

                        <div className="flex gap-2 pt-1">
                          {l.phone && (
                            <a href={`https://wa.me/${l.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm"
                              style={{ background: "#25D366" }}>
                              <Phone className="w-3.5 h-3.5" /> Abrir WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ═══ PROSPECTS TAB ═══ */}
        {tab === "prospects" && (
          <div className="space-y-3">
            {loadingProspects ? (
              <div className="text-center py-20 text-gray-400 text-xs font-bold">Cargando prospectos comerciales...</div>
            ) : prospects.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-xs">
                <Building2 className="w-10 h-10 text-gray-250 mx-auto mb-3" />
                <p className="text-gray-400 text-xs font-bold mb-4">No hay prospectos comerciales registrados aún</p>
                <button onClick={openCreate}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold cursor-pointer"
                  style={{ background: "linear-gradient(90deg, #FF0096, #9B00CC)" }}>
                  <Plus className="w-4 h-4" /> Agregar primer prospecto
                </button>
              </div>
            ) : (
              prospects.map((p: Prospect) => {
                const st = PROSPECT_STATUS[p.status] ?? PROSPECT_STATUS.por_visitar;
                const prio = PRIORITY_STYLE[p.priority] ?? PRIORITY_STYLE.normal;
                return (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs hover:shadow-sm transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center shrink-0 border">
                        <Building2 className="w-4 h-4 text-pink-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${prio}`}>{p.priority}</span>
                              {p.category && <span className="text-[9px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-full">{p.category}</span>}
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm leading-snug">{p.establishmentName}</h3>
                            {p.contactName && <p className="text-xs text-gray-500 font-semibold mt-0.5">Contacto: {p.contactName}</p>}
                            <div className="flex flex-wrap gap-4 mt-2 font-semibold text-xs text-gray-400">
                              {p.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-300" />{p.phone}</span>}
                              {p.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-300" />{p.email}</span>}
                              {p.destinationName && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-300" />{p.destinationName}</span>}
                            </div>
                            {p.visitDate && (
                              <p className="text-xs text-gray-450 mt-2 flex items-center gap-1 font-semibold">
                                <Calendar className="w-3.5 h-3.5 text-slate-350" /> Fecha visita: {p.visitDate}
                              </p>
                            )}
                            {p.nextFollowupDate && (
                              <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1 font-bold">
                                <Clock className="w-3.5 h-3.5 text-amber-500" /> Seguimiento comercial: {p.nextFollowupDate}
                              </p>
                            )}
                            {p.notes && <p className="text-xs text-gray-400 mt-2.5 italic border-l-2 border-pink-200 pl-2">{p.notes}</p>}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                            {p.phone && (
                              <a href={`https://wa.me/${p.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50 border border-green-200 hover:bg-green-100 transition-colors">
                                <Phone className="w-3.5 h-3.5 text-green-600" />
                              </a>
                            )}
                            <button onClick={() => openEdit(p)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 border border-gray-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-colors cursor-pointer">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => { if (confirm("¿Eliminar prospecto comercial?")) deleteProspect.mutate(p.id); }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* PROSPECT MODAL */}
      {prospectModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setProspectModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="font-bold text-gray-900 text-base">{prospectModal === "create" ? "Nuevo Prospecto Comercial" : "Editar Prospecto"}</h2>
              <button onClick={() => setProspectModal(null)} className="w-8 h-8 rounded-full bg-gray-100 border flex items-center justify-center cursor-pointer hover:bg-gray-200">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">Nombre del Establecimiento *</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-pink-400 bg-white">
                    <Building2 className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    <input value={form.establishmentName} onChange={e => setF("establishmentName", e.target.value)}
                      placeholder="Posada, Hotel, Club..." className="flex-1 text-xs font-semibold focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">Contacto (Propietario / Gerente)</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-pink-400 bg-white">
                    <User className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    <input value={form.contactName} onChange={e => setF("contactName", e.target.value)}
                      placeholder="Nombre del contacto" className="flex-1 text-xs font-semibold focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">Teléfono de contacto</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-pink-400 bg-white">
                    <Phone className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    <input value={form.phone} onChange={e => setF("phone", e.target.value)}
                      placeholder="+58 412..." type="tel" className="flex-1 text-xs font-semibold focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">Email corporativo</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-pink-400 bg-white">
                    <Mail className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    <input value={form.email} onChange={e => setF("email", e.target.value)}
                      placeholder="email@hotel.com" type="email" className="flex-1 text-xs font-semibold focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">Destino</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-pink-400 bg-white">
                    <MapPin className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    <input value={form.destinationName} onChange={e => setF("destinationName", e.target.value)}
                      placeholder="Mérida, Falcón..." className="flex-1 text-xs font-semibold focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">Municipio / Zona</label>
                  <input value={form.zone} onChange={e => setF("zone", e.target.value)}
                    placeholder="Ej: Chichiriviche" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-pink-400 bg-white" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">Categoría de servicio</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-pink-400 bg-white">
                    <Tag className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    <input value={form.category} onChange={e => setF("category", e.target.value)}
                      placeholder="Hotel Boutique" className="flex-1 text-xs font-semibold focus:outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 mb-1 block">Dirección física</label>
                <input value={form.address} onChange={e => setF("address", e.target.value)}
                  placeholder="Dirección completa del prospecto..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-pink-400 bg-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">Estado del Lead</label>
                  <select value={form.status} onChange={e => setF("status", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-pink-400 bg-white">
                    {Object.entries(PROSPECT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">Prioridad de Cierre</label>
                  <select value={form.priority} onChange={e => setF("priority", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-pink-400 bg-white">
                    <option value="alta">🔴 Alta</option>
                    <option value="normal">🟡 Normal</option>
                    <option value="baja">🔵 Baja</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">Fecha de Visita Comercial</label>
                  <input type="date" value={form.visitDate} onChange={e => setF("visitDate", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-pink-400 bg-white" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">Próxima Fecha de Seguimiento</label>
                  <input type="date" value={form.nextFollowupDate} onChange={e => setF("nextFollowupDate", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-pink-400 bg-white" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 mb-1 block">Contrato de Afiliación URL (PDF drive...)</label>
                <input value={form.contractUrl} onChange={e => setF("contractUrl", e.target.value)}
                  placeholder="https://docs.google.com/..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-pink-400 bg-white" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 mb-1 block">Notas de Negociación</label>
                <textarea value={form.notes} onChange={e => setF("notes", e.target.value)} rows={3}
                  placeholder="Escribe comentarios, respuestas del cliente y acuerdos alcanzados..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-pink-400 resize-none bg-white" />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-2.5 rounded-b-2xl">
              <button onClick={() => setProspectModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-gray-600 border cursor-pointer">
                Cancelar
              </button>
              <button onClick={() => saveProspect.mutate(form)} disabled={!form.establishmentName.trim() || saveProspect.isPending}
                className="px-5 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer border border-pink-700"
                style={{ background: "linear-gradient(90deg, #9B00CC, #FF0096)" }}>
                {saveProspect.isPending ? "Guardando..." : <><Save className="w-4 h-4" /> Guardar prospecto</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
