import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { supabase } from "@/lib/supabase";
import {
  Zap, MessageSquare, TrendingUp, CheckCircle2, XCircle,
  Plus, Phone, Mail, User, Building2, MapPin, Calendar,
  X, ChevronDown, Star, Clock, StickyNote, Loader2, Bot
} from "lucide-react";

/* ── colours ── */
const C = { fucsia: "#FF0096", teal: "#00C8D4", purple: "#7C3AED", green: "#10B981", amber: "#F59E0B", red: "#EF4444", blue: "#3B82F6" };

/* ── types ── */
interface Lead {
  id: number; phone: string; name: string; email: string; source: string;
  interest: string; status: string; notes: string; leadType: string;
  businessType: string; createdAt: string;
  ipAddress?: string; timezone?: string;
}
interface Prospect {
  id: number; establishmentName: string; contactName: string; phone: string;
  email: string; destinationName: string; zone: string; category: string;
  status: string; notes: string; priority: string; visitDate: string;
  nextFollowupDate: string; createdAt: string;
}

/* ── lead pipeline ── */
const LEAD_STAGES: { id: string; label: string; color: string; icon: typeof Zap }[] = [
  { id: "nuevo",       label: "Nuevos",       color: C.teal,   icon: Zap         },
  { id: "contactado",  label: "Contactados",  color: C.amber,  icon: MessageSquare },
  { id: "interesado",  label: "Interesados",  color: C.blue,   icon: Star        },
  { id: "negociando",  label: "Negociando",   color: C.purple, icon: TrendingUp  },
  { id: "cerrado",     label: "Cerrados",     color: C.green,  icon: CheckCircle2 },
  { id: "perdido",     label: "Perdidos",     color: C.red,    icon: XCircle     },
];

/* ── prospect pipeline ── */
const PROSPECT_STAGES: { id: string; label: string; color: string; icon: typeof Zap }[] = [
  { id: "por_visitar", label: "Por Visitar",  color: C.blue,   icon: MapPin      },
  { id: "contactado",  label: "Contactados",  color: C.amber,  icon: MessageSquare },
  { id: "negociando",  label: "Negociando",   color: C.purple, icon: TrendingUp  },
  { id: "contratado",  label: "Contratados",  color: C.green,  icon: CheckCircle2 },
  { id: "rechazado",   label: "Rechazados",   color: C.red,    icon: XCircle     },
];

/* ── EMPTY FORMS ── */
const EMPTY_LEAD = { phone: "", name: "", email: "", source: "", interest: "", status: "nuevo", notes: "", leadType: "other", businessType: "" };
const EMPTY_PROSPECT = { establishmentName: "", contactName: "", phone: "", email: "", destinationName: "", zone: "", category: "", status: "por_visitar", notes: "", priority: "normal", visitDate: "", nextFollowupDate: "" };

/* ── helper smaller components ── */
function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto p-5 shadow-2xl">
        <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
          <X className="w-3.5 h-3.5 text-gray-500" />
        </button>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="text-xs text-gray-500 font-bold mb-1.5 block">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 font-semibold text-gray-900" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="text-xs text-gray-500 font-bold mb-1.5 block">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-pink-500 font-bold text-gray-700 bg-white">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function TextareaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-gray-500 font-bold mb-1.5 block">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 font-semibold text-gray-900 resize-none" />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-gray-500 font-bold">
      <Icon className="w-3 h-3 shrink-0" />
      <span className="text-[10px] text-gray-400">{label}:</span>
      <span className="text-[10px] text-gray-700 truncate">{value}</span>
    </div>
  );
}

/* ── Lead modal ── */
function LeadModal({ lead, stages, onClose, onSave }: { lead: Lead; stages: typeof LEAD_STAGES; onClose: () => void; onSave: (d: Partial<Lead>) => void }) {
  const [form, setForm] = useState({ status: lead.status, notes: lead.notes ?? "", name: lead.name ?? "", interest: lead.interest ?? "" });
  const stage = stages.find(s => s.id === form.status)!;
  return (
    <ModalOverlay onClose={onClose}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${C.teal}18` }}>
          <User className="w-5 h-5" style={{ color: C.teal }} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">{lead.name || lead.phone}</h3>
          <p className="text-[10px] text-gray-400 font-bold">{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("es-VE") : ""}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {lead.phone && <InfoRow icon={Phone} label="Teléfono" value={lead.phone} />}
        {lead.email && <InfoRow icon={Mail} label="Email" value={lead.email} />}
        {lead.source && <InfoRow icon={Zap} label="Fuente" value={lead.source} />}
        {lead.leadType && <InfoRow icon={Building2} label="Tipo" value={lead.leadType === "turista" ? "🌴 Turista" : lead.leadType === "propietario" ? "🏨 Propietario" : lead.leadType} />}
        {lead.ipAddress && <InfoRow icon={MapPin} label="IP" value={lead.ipAddress} />}
        {lead.timezone && <InfoRow icon={Clock} label="Huso Horario" value={lead.timezone} />}
      </div>
      <div className="space-y-3">
        <Field label="Nombre" value={form.name} onChange={v => setForm(f => ({...f, name: v}))} />
        <Field label="Interés" value={form.interest} onChange={v => setForm(f => ({...f, interest: v}))} />
        <div>
          <label className="text-xs text-gray-500 font-bold mb-1.5 block">Etapa</label>
          <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-bold text-gray-700 bg-white" style={{ color: stage?.color }}>
            {stages.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <TextareaField label="Notas" value={form.notes} onChange={v => setForm(f => ({...f, notes: v}))} />
        <div className="flex justify-between pt-1 flex-wrap gap-2">
          {lead.phone ? (
            <a href={`https://wa.me/${lead.phone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90" style={{ background: "#25D366" }}>
              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
            </a>
          ) : <div />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-slate-100 hover:bg-slate-200 border cursor-pointer">Cancelar</button>
            <button onClick={() => onSave(form)} className="px-5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer" style={{ background: C.teal }}>Guardar</button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ── Prospect modal ── */
function ProspectModal({ prospect, stages, onClose, onSave }: { prospect: Prospect; stages: typeof PROSPECT_STAGES; onClose: () => void; onSave: (d: Partial<Prospect>) => void }) {
  const [form, setForm] = useState({
    status: prospect.status, notes: prospect.notes ?? "", priority: prospect.priority ?? "normal",
    contactName: prospect.contactName ?? "", phone: prospect.phone ?? "",
    nextFollowupDate: prospect.nextFollowupDate ?? "", visitDate: prospect.visitDate ?? "",
  });
  return (
    <ModalOverlay onClose={onClose}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${C.purple}18` }}>
          <Building2 className="w-5 h-5" style={{ color: C.purple }} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">{prospect.establishmentName}</h3>
          <p className="text-[10px] text-gray-400 font-bold">{prospect.destinationName}{prospect.zone ? ` · ${prospect.zone}` : ""}</p>
        </div>
      </div>
      <div className="space-y-3">
        <Field label="Contacto" value={form.contactName} onChange={v => setForm(f => ({...f, contactName: v}))} />
        <Field label="Teléfono" value={form.phone} onChange={v => setForm(f => ({...f, phone: v}))} />
        <SelectField label="Etapa" value={form.status} onChange={v => setForm(f => ({...f, status: v}))} options={stages.map(s => ({ value: s.id, label: s.label }))} />
        <SelectField label="Prioridad" value={form.priority} onChange={v => setForm(f => ({...f, priority: v}))} options={[{value:"alta",label:"Alta"},{value:"normal",label:"Normal"},{value:"baja",label:"Baja"}]} />
        <Field label="Fecha de visita" value={form.visitDate} onChange={v => setForm(f => ({...f, visitDate: v}))} type="date" />
        <Field label="Próximo seguimiento" value={form.nextFollowupDate} onChange={v => setForm(f => ({...f, nextFollowupDate: v}))} type="date" />
        <TextareaField label="Notas" value={form.notes} onChange={v => setForm(f => ({...f, notes: v}))} />
        <div className="flex justify-between pt-1 flex-wrap gap-2">
          {form.phone ? (
            <a href={`https://wa.me/${form.phone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90" style={{ background: "#25D366" }}>
              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
            </a>
          ) : <div />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-slate-100 hover:bg-slate-200 border cursor-pointer">Cancelar</button>
            <button onClick={() => onSave(form)} className="px-5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer" style={{ background: C.purple }}>Guardar</button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ── Lead pipeline board ── */
function LeadKanban() {
  const qc = useQueryClient();
  const [dragging, setDragging] = useState<Lead | null>(null);
  const [overCol, setOverCol]   = useState<string | null>(null);
  const [modal, setModal]       = useState<Lead | null>(null);
  const [showNew, setShowNew]   = useState(false);
  const [form, setForm]         = useState(EMPTY_LEAD);

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["whatsapp-leads-all"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("whatsapp_leads")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;

        return (data || []).map((l: any) => ({
          id: l.id,
          phone: l.phone || "",
          name: l.name || "",
          email: l.email || "",
          source: l.source || "",
          interest: l.interest || "",
          status: l.status || "nuevo",
          notes: l.notes || "",
          leadType: l.lead_type || l.leadType || "other",
          businessType: l.business_type || l.businessType || "",
          ipAddress: l.ip_address || l.ipAddress || "",
          timezone: l.timezone || "",
          createdAt: l.created_at || l.createdAt || new Date().toISOString()
        }));
      } catch (err) {
        const localKey = "hdv_mock_whatsapp_leads";
        const local = JSON.parse(localStorage.getItem(localKey) || "[]");
        if (local.length === 0) {
          const defaults = [
            { id: 1, phone: "+584120001122", name: "Esteban López", email: "esteban@hotel.com", source: "Instagram", interest: "Plan Anual Premium", status: "nuevo", notes: "Preguntó por costos de visibilidad destacada.", leadType: "owner", businessType: "Hotel", ipAddress: "190.120.45.67", timezone: "America/Caracas", createdAt: new Date().toISOString() },
            { id: 2, phone: "+584243334455", name: "Glenda Suárez", email: "", source: "WhatsApp", interest: "Registro Gratuito", status: "contactado", notes: "Quiere registrar posada en Morrocoy.", leadType: "owner", businessType: "Posada", ipAddress: "200.74.192.12", timezone: "America/Caracas", createdAt: new Date().toISOString() },
          ];
          localStorage.setItem(localKey, JSON.stringify(defaults));
          return defaults;
        }
        return local.map((l: any) => ({
          id: l.id,
          phone: l.phone || "",
          name: l.name || "",
          email: l.email || "",
          source: l.source || "",
          interest: l.interest || "",
          status: l.status || "nuevo",
          notes: l.notes || "",
          leadType: l.lead_type || l.leadType || "other",
          businessType: l.business_type || l.businessType || "",
          ipAddress: l.ip_address || l.ipAddress || "",
          timezone: l.timezone || "",
          createdAt: l.created_at || l.createdAt || new Date().toISOString()
        }));
      }
    }
  });

  const update = useMutation({
    mutationFn: async ({ id, ...body }: Partial<Lead> & { id: number }) => {
      const localKey = "hdv_mock_whatsapp_leads";
      const local = JSON.parse(localStorage.getItem(localKey) || "[]");
      const isMock = local.some((l: any) => l.id === id);

      if (isMock) {
        const updated = local.map((l: any) => l.id === id ? { ...l, ...body } : l);
        localStorage.setItem(localKey, JSON.stringify(updated));
        return { success: true };
      }

      try {
        const mappedBody: Record<string, any> = {};
        if ("status" in body) mappedBody.status = body.status;
        if ("notes" in body) mappedBody.notes = body.notes;
        if ("name" in body) mappedBody.name = body.name;
        if ("interest" in body) mappedBody.interest = body.interest;

        const { error } = await supabase
          .from("whatsapp_leads")
          .update(mappedBody)
          .eq("id", id);
        if (error) throw error;
      } catch (err) {
        const updated = local.map((l: any) => l.id === id ? { ...l, ...body } : l);
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
      return { success: true };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp-leads-all"] }),
  });

  const create = useMutation({
    mutationFn: async (body: typeof EMPTY_LEAD) => {
      const localKey = "hdv_mock_whatsapp_leads";
      const local = JSON.parse(localStorage.getItem(localKey) || "[]");
      const newLead = { id: Date.now(), ...body, createdAt: new Date().toISOString() };

      try {
        const { error } = await supabase
          .from("whatsapp_leads")
          .insert({
            phone: body.phone,
            name: body.name,
            email: body.email,
            source: body.source,
            interest: body.interest,
            status: body.status,
            notes: body.notes,
            lead_type: body.leadType,
            business_type: body.businessType
          });
        if (error) throw error;
      } catch (err) {
        localStorage.setItem(localKey, JSON.stringify([...local, newLead]));
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["whatsapp-leads-all"] });
      setShowNew(false);
      setForm(EMPTY_LEAD);
    },
  });

  const onDragStart = (e: React.DragEvent, lead: Lead) => { setDragging(lead); e.dataTransfer.effectAllowed = "move"; };
  const onDragOver  = (e: React.DragEvent, col: string)  => { e.preventDefault(); setOverCol(col); };
  const onDrop      = (e: React.DragEvent, col: string)  => { e.preventDefault(); if (dragging && dragging.status !== col) update.mutate({ id: dragging.id, status: col }); setDragging(null); setOverCol(null); };
  const onDragEnd   = () => { setDragging(null); setOverCol(null); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-xs text-gray-500 font-bold">Arrastra las tarjetas entre columnas para cambiar la etapa del embudo de leads</p>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold border border-cyan-600 cursor-pointer"
          style={{ background: `linear-gradient(90deg, ${C.teal}, #0099A8)` }}
        >
          <Plus className="w-3.5 h-3.5" /> Nuevo Lead
        </button>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3" style={{ minWidth: `${LEAD_STAGES.length * 200}px` }}>
          {LEAD_STAGES.map(stage => {
            const cards = leads.filter(l => l.status === stage.id);
            const isOver = overCol === stage.id;
            return (
              <div key={stage.id} className="flex-1 min-w-[180px]"
                onDragOver={e => onDragOver(e, stage.id)}
                onDrop={e => onDrop(e, stage.id)}>
                {/* Column header */}
                <div className="rounded-xl p-2.5 mb-2 flex items-center gap-2" style={{ background: `${stage.color}12` }}>
                  <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: `${stage.color}25` }}>
                    <stage.icon className="w-3.5 h-3.5" style={{ color: stage.color }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: stage.color }}>{stage.label}</span>
                  <span className="ml-auto text-[10px] font-black text-gray-400 bg-white rounded-full px-2 py-0.5 border border-slate-100">{cards.length}</span>
                </div>
                {/* Drop zone */}
                <div className={`space-y-2 min-h-[150px] rounded-xl p-1.5 transition-colors border-2 border-dashed ${isOver ? "bg-slate-100 border-gray-300" : "border-transparent"}`}>
                  {isLoading ? Array(2).fill(0).map((_, i) => <div key={i} className="bg-white rounded-xl h-20 animate-pulse border" />) :
                    cards.length === 0 ? (
                      <div className="text-center py-10 text-gray-300 text-xs font-bold">Sin registros</div>
                    ) : cards.map(lead => (
                      <div key={lead.id}
                        draggable
                        onDragStart={e => onDragStart(e, lead)}
                        onDragEnd={onDragEnd}
                        onClick={() => setModal(lead)}
                        className="bg-white rounded-xl p-3 cursor-grab active:cursor-grabbing shadow-xs hover:shadow-sm transition-shadow border border-gray-200 flex flex-col justify-between"
                        style={dragging?.id === lead.id ? { opacity: 0.4 } : {}}>
                        <div>
                          <p className="text-xs font-bold text-gray-800 truncate">{lead.name || lead.phone}</p>
                          {lead.interest && <p className="text-[10px] text-gray-400 font-semibold truncate mt-1">{lead.interest}</p>}
                        </div>
                        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                          {lead.phone && <span className="flex items-center gap-1 text-[9px] text-gray-400 font-bold"><Phone className="w-2.5 h-2.5" />{lead.phone}</span>}
                          {lead.source && <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-slate-100 border" style={{ color: stage.color }}>{lead.source}</span>}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showNew && (
        <ModalOverlay onClose={() => setShowNew(false)}>
          <h3 className="text-sm font-bold text-gray-900 mb-4">Registrar Nuevo Lead WA</h3>
          <div className="space-y-3">
            <Field label="Teléfono *" value={form.phone} onChange={v => setForm(f => ({...f, phone: v}))} placeholder="+58 412..." />
            <Field label="Nombre Comercial" value={form.name} onChange={v => setForm(f => ({...f, name: v}))} />
            <Field label="Correo Electrónico" value={form.email} onChange={v => setForm(f => ({...f, email: v}))} type="email" />
            <Field label="Interés / Consulta" value={form.interest} onChange={v => setForm(f => ({...f, interest: v}))} />
            <Field label="Fuente de Contacto" value={form.source} onChange={v => setForm(f => ({...f, source: v}))} placeholder="Instagram, Facebook, etc." />
            <SelectField label="Etapa Inicial" value={form.status} onChange={v => setForm(f => ({...f, status: v}))} options={LEAD_STAGES.map(s => ({ value: s.id, label: s.label }))} />
            <TextareaField label="Notas iniciales" value={form.notes} onChange={v => setForm(f => ({...f, notes: v}))} />
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-650 bg-slate-100 hover:bg-slate-200 border cursor-pointer">Cancelar</button>
              <button onClick={() => form.phone && create.mutate(form)} disabled={create.isPending || !form.phone}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50 cursor-pointer border" style={{ background: C.teal, borderColor: C.teal }}>
                {create.isPending ? "Guardando..." : "Crear Lead"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {modal && (
        <LeadModal lead={modal} stages={LEAD_STAGES} onClose={() => setModal(null)}
          onSave={(data) => { update.mutate({ id: modal.id, ...data }); setModal(null); }} />
      )}
    </div>
  );
}

/* ── Prospect pipeline board ── */
function ProspectKanban() {
  const qc = useQueryClient();
  const [dragging, setDragging]   = useState<Prospect | null>(null);
  const [overCol, setOverCol]     = useState<string | null>(null);
  const [modal, setModal]         = useState<Prospect | null>(null);
  const [showNew, setShowNew]     = useState(false);
  const [form, setForm]           = useState(EMPTY_PROSPECT);

  const { data: prospects = [], isLoading } = useQuery<Prospect[]>({
    queryKey: ["commercial-prospects-all"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("commercial_prospects")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;

        return (data || []).map((p: any) => ({
          id: p.id,
          establishmentName: p.establishment_name || p.establishmentName || "",
          contactName: p.contact_name || p.contactName || "",
          phone: p.phone || "",
          email: p.email || "",
          destinationName: p.destination_name || p.destinationName || "",
          zone: p.zone || "",
          category: p.category || "",
          status: p.status || "por_visitar",
          notes: p.notes || "",
          priority: p.priority || "normal",
          visitDate: p.visit_date || p.visitDate || "",
          nextFollowupDate: p.next_follow_date || p.nextFollowupDate || "",
          createdAt: p.created_at || p.createdAt || new Date().toISOString()
        }));
      } catch (err) {
        const localKey = "hdv_mock_commercial_prospects";
        const local = JSON.parse(localStorage.getItem(localKey) || "[]");
        if (local.length === 0) {
          const defaults = [
            { id: 1, establishmentName: "Hotel Hesperia WTC", contactName: "Pedro S.", phone: "+582418240000", email: "pedro@hesperia.com.ve", destinationName: "Valencia", zone: "Naguanagua", category: "Hotel", status: "por_visitar", notes: "Agendado para visita de negociación de API.", priority: "alta", visitDate: "2026-07-10", nextFollowupDate: "2026-07-12", createdAt: new Date().toISOString() },
            { id: 2, establishmentName: "Posada Rancho Grande", contactName: "Marta R.", phone: "+584145558899", email: "", destinationName: "Choroní", zone: "Pueblo", category: "Posada", status: "contactado", notes: "Interesada, pero quiere ver demos de comisiones primero.", priority: "normal", visitDate: "", nextFollowupDate: "2026-06-29", createdAt: new Date().toISOString() },
          ];
          localStorage.setItem(localKey, JSON.stringify(defaults));
          return defaults;
        }
        return local;
      }
    }
  });

  const update = useMutation({
    mutationFn: async ({ id, ...body }: Partial<Prospect> & { id: number }) => {
      const localKey = "hdv_mock_commercial_prospects";
      const local = JSON.parse(localStorage.getItem(localKey) || "[]");
      const isMock = local.some((p: any) => p.id === id);

      if (isMock) {
        const updated = local.map((p: any) => p.id === id ? { ...p, ...body } : p);
        localStorage.setItem(localKey, JSON.stringify(updated));
        return { success: true };
      }

      try {
        const mappedBody: Record<string, any> = {};
        if ("status" in body) mappedBody.status = body.status;
        if ("notes" in body) mappedBody.notes = body.notes;
        if ("priority" in body) mappedBody.priority = body.priority;
        if ("contactName" in body) mappedBody.contact_name = body.contactName;
        if ("phone" in body) mappedBody.phone = body.phone;
        if ("visitDate" in body) mappedBody.visit_date = body.visitDate;
        if ("nextFollowupDate" in body) mappedBody.next_follow_date = body.nextFollowupDate;

        const { error } = await supabase
          .from("commercial_prospects")
          .update(mappedBody)
          .eq("id", id);
        if (error) throw error;
      } catch (err) {
        const updated = local.map((p: any) => p.id === id ? { ...p, ...body } : p);
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
      return { success: true };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["commercial-prospects-all"] }),
  });

  const create = useMutation({
    mutationFn: async (body: typeof EMPTY_PROSPECT) => {
      const localKey = "hdv_mock_commercial_prospects";
      const local = JSON.parse(localStorage.getItem(localKey) || "[]");
      const newProspect = { id: Date.now(), ...body, createdAt: new Date().toISOString() };

      try {
        const { error } = await supabase
          .from("commercial_prospects")
          .insert({
            establishment_name: body.establishmentName,
            contact_name: body.contactName,
            phone: body.phone,
            email: body.email,
            destination_name: body.destinationName,
            zone: body.zone,
            category: body.category,
            status: body.status,
            notes: body.notes,
            priority: body.priority,
            visit_date: body.visitDate,
            next_follow_date: body.nextFollowupDate
          });
        if (error) throw error;
      } catch (err) {
        localStorage.setItem(localKey, JSON.stringify([...local, newProspect]));
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["commercial-prospects-all"] });
      setShowNew(false);
      setForm(EMPTY_PROSPECT);
    },
  });

  const onDragStart = (e: React.DragEvent, p: Prospect) => { setDragging(p); e.dataTransfer.effectAllowed = "move"; };
  const onDragOver  = (e: React.DragEvent, col: string)  => { e.preventDefault(); setOverCol(col); };
  const onDrop      = (e: React.DragEvent, col: string)  => { e.preventDefault(); if (dragging && dragging.status !== col) update.mutate({ id: dragging.id, status: col }); setDragging(null); setOverCol(null); };
  const onDragEnd   = () => { setDragging(null); setOverCol(null); };

  const PRIORITY_COLOR: Record<string, string> = { alta: C.red, normal: C.amber, baja: "#9CA3AF" };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-xs text-gray-500 font-bold">Listado de prospectos de establecimientos para incorporar a Hoteles de Venezuela</p>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold border border-purple-650 cursor-pointer"
          style={{ background: `linear-gradient(90deg, ${C.purple}, #5B21B6)` }}
        >
          <Plus className="w-3.5 h-3.5" /> Nuevo Prospecto
        </button>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3" style={{ minWidth: `${PROSPECT_STAGES.length * 200}px` }}>
          {PROSPECT_STAGES.map(stage => {
            const cards = prospects.filter(p => p.status === stage.id);
            const isOver = overCol === stage.id;
            return (
              <div key={stage.id} className="flex-1 min-w-[180px]"
                onDragOver={e => onDragOver(e, stage.id)}
                onDrop={e => onDrop(e, stage.id)}>
                <div className="rounded-xl p-2.5 mb-2 flex items-center gap-2" style={{ background: `${stage.color}12` }}>
                  <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: `${stage.color}25` }}>
                    <stage.icon className="w-3.5 h-3.5" style={{ color: stage.color }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: stage.color }}>{stage.label}</span>
                  <span className="ml-auto text-[10px] font-black text-gray-400 bg-white rounded-full px-2 py-0.5 border border-slate-100">{cards.length}</span>
                </div>
                <div className={`space-y-2 min-h-[150px] rounded-xl p-1.5 transition-colors border-2 border-dashed ${isOver ? "bg-slate-100 border-gray-300" : "border-transparent"}`}>
                  {isLoading ? Array(2).fill(0).map((_, i) => <div key={i} className="bg-white rounded-xl h-20 animate-pulse border" />) :
                    cards.length === 0 ? (
                      <div className="text-center py-10 text-gray-300 text-xs font-bold">Sin registros</div>
                    ) : cards.map(p => (
                      <div key={p.id}
                        draggable
                        onDragStart={e => onDragStart(e, p)}
                        onDragEnd={onDragEnd}
                        onClick={() => setModal(p)}
                        className="bg-white rounded-xl p-3 cursor-grab active:cursor-grabbing shadow-xs hover:shadow-sm transition-shadow border border-gray-200 flex flex-col justify-between"
                        style={dragging?.id === p.id ? { opacity: 0.4 } : {}}>
                        <div className="flex items-start justify-between gap-1.5">
                          <p className="text-xs font-bold text-gray-800 truncate flex-1 leading-snug">{p.establishmentName}</p>
                          {p.priority && (
                            <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-1" style={{ background: PRIORITY_COLOR[p.priority] ?? C.amber }} title={`Prioridad: ${p.priority}`} />
                          )}
                        </div>
                        {p.contactName && <p className="text-[10px] text-gray-400 font-bold truncate mt-1">{p.contactName}</p>}
                        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                          {p.destinationName && <span className="flex items-center gap-1 text-[9px] text-gray-450 font-bold"><MapPin className="w-2.5 h-2.5 text-gray-400" />{p.destinationName}</span>}
                          {p.category && <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-slate-100 border text-gray-500">{p.category}</span>}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showNew && (
        <ModalOverlay onClose={() => setShowNew(false)}>
          <h3 className="text-sm font-bold text-gray-900 mb-4">Registrar Nuevo Prospecto</h3>
          <div className="space-y-3">
            <Field label="Nombre del Establecimiento *" value={form.establishmentName} onChange={v => setForm(f => ({...f, establishmentName: v}))} />
            <Field label="Nombre del Contacto" value={form.contactName} onChange={v => setForm(f => ({...f, contactName: v}))} />
            <Field label="Teléfono" value={form.phone} onChange={v => setForm(f => ({...f, phone: v}))} placeholder="+58 412..." />
            <Field label="Email" value={form.email} onChange={v => setForm(f => ({...f, email: v}))} type="email" />
            <Field label="Destino (Ciudad)" value={form.destinationName} onChange={v => setForm(f => ({...f, destinationName: v}))} placeholder="Margarita, Los Roques, etc." />
            <Field label="Zona / Dirección Corta" value={form.zone} onChange={v => setForm(f => ({...f, zone: v}))} />
            <Field label="Categoría" value={form.category} onChange={v => setForm(f => ({...f, category: v}))} placeholder="Hotel, Posada, Camping, Marina" />
            <SelectField label="Etapa Inicial" value={form.status} onChange={v => setForm(f => ({...f, status: v}))} options={PROSPECT_STAGES.map(s => ({ value: s.id, label: s.label }))} />
            <SelectField label="Prioridad" value={form.priority} onChange={v => setForm(f => ({...f, priority: v}))} options={[{value:"alta",label:"Alta"},{value:"normal",label:"Normal"},{value:"baja",label:"Baja"}]} />
            <Field label="Fecha Programada de Visita" value={form.visitDate} onChange={v => setForm(f => ({...f, visitDate: v}))} type="date" />
            <Field label="Próximo Seguimiento" value={form.nextFollowupDate} onChange={v => setForm(f => ({...f, nextFollowupDate: v}))} type="date" />
            <TextareaField label="Notas Comerciales" value={form.notes} onChange={v => setForm(f => ({...f, notes: v}))} />
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-650 bg-slate-100 hover:bg-slate-200 border cursor-pointer">Cancelar</button>
              <button onClick={() => form.establishmentName && create.mutate(form)} disabled={create.isPending || !form.establishmentName}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50 cursor-pointer border" style={{ background: C.purple, borderColor: C.purple }}>
                {create.isPending ? "Guardando..." : "Crear Prospecto"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {modal && (
        <ProspectModal prospect={modal} stages={PROSPECT_STAGES} onClose={() => setModal(null)}
          onSave={(data) => { update.mutate({ id: modal.id, ...data }); setModal(null); }} />
      )}
    </div>
  );
}

export function Centauros() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<"leads" | "prospects">("leads");

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
        <p className="text-gray-500 text-xs font-bold">Verificando credenciales de seguridad...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="relative overflow-hidden py-8" style={{ background: "linear-gradient(135deg, #0e0120, #1a0533)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: C.teal }} />
        <div className="absolute bottom-0 left-20 w-48 h-48 rounded-full blur-3xl opacity-10" style={{ background: C.fucsia }} />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,200,212,0.2)" }}>
                  <TrendingUp className="w-4.5 h-4.5" style={{ color: C.teal }} />
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">Centauros CRM</h1>
              </div>
              <p className="text-white/50 text-xs font-semibold ml-12">Consola de seguimiento para incorporar nuevos afiliados y leads</p>
            </div>
            
            {/* Botón de acceso directo a Configuración del Agente IA */}
            <Link href="/admin/ia-conversacional">
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-cyan-600 hover:opacity-90 transition-opacity text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-fuchsia-950/40 border-none">
                <Bot className="w-4.5 h-4.5 animate-pulse text-cyan-200" />
                Configurar Agente IA (WhatsApp)
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="container mx-auto px-6">
          <div className="flex gap-4">
            {[
              { id: "leads",     label: "Leads WhatsApp",        color: C.teal,   icon: MessageSquare },
              { id: "prospects", label: "Prospectos Comerciales", color: C.purple, icon: Building2     },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id as "leads" | "prospects")}
                className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${tab === t.id ? "border-current font-black" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                style={tab === t.id ? { color: t.color } : {}}>
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-6 py-6">
          {tab === "leads" ? <LeadKanban /> : <ProspectKanban />}
        </div>
      </div>
    </>
  );
}
export default Centauros;
