import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import {
  Briefcase, Plus, Edit2, Trash2, Mail, Phone, Building2,
  ChevronDown, X, Save, User, DollarSign, Calendar, FileText,
  Send, CheckCircle, Clock, XCircle, AlertCircle, Printer, Loader2
} from "lucide-react";

/* ── types ───────────────────────────────────────────────── */
interface QuoteItem { description: string; qty: number; unitPrice: number; total: number; }
interface Quote {
  id: number; quoteNumber: string; clientName: string; clientEmail: string;
  clientPhone: string; clientCompany: string; title: string; description: string;
  travelDates: string; numTravelers: number; itemsData: string; subtotal: number;
  discountPercent: number; discountAmount: number; taxPercent: number; taxAmount: number;
  total: number; currency: string; validityDays: number; notes: string; terms: string;
  status: string; createdAt: string;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; label: string; Icon: any }> = {
  draft:    { bg: "bg-gray-100",    text: "text-gray-600",   border: "border-gray-200",  label: "Borrador",  Icon: FileText   },
  sent:     { bg: "bg-blue-50",     text: "text-blue-700",   border: "border-blue-200",  label: "Enviada",   Icon: Send       },
  accepted: { bg: "bg-emerald-50",  text: "text-emerald-700",border: "border-emerald-200",label:"Aceptada",  Icon: CheckCircle},
  rejected: { bg: "bg-red-50",      text: "text-red-700",    border: "border-red-200",   label: "Rechazada", Icon: XCircle    },
  expired:  { bg: "bg-orange-50",   text: "text-orange-700", border: "border-orange-200",label: "Expirada",  Icon: AlertCircle},
};

const EMPTY_FORM = {
  clientName: "", clientEmail: "", clientPhone: "", clientCompany: "",
  title: "", description: "", travelDates: "", numTravelers: 1,
  subtotal: 0, discountPercent: 0, discountAmount: 0, taxPercent: 0, taxAmount: 0,
  total: 0, currency: "USD", validityDays: 15, notes: "", terms: "", status: "draft",
  itemsData: "[]",
};

const EMPTY_ITEM: QuoteItem = { description: "", qty: 1, unitPrice: 0, total: 0 };

function parseItems(raw: string): QuoteItem[] {
  try { return JSON.parse(raw ?? "[]"); } catch { return []; }
}

/* ── print helper ────────────────────────────────────────── */
function printQuote(q: Quote) {
  const items = parseItems(q.itemsData);
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Cotización ${q.quoteNumber || q.id}</title>
  <style>body{font-family:sans-serif;max-width:800px;margin:40px auto;color:#111;font-size:14px}
  h1{color:#FF0096}table{width:100%;border-collapse:collapse;margin:16px 0}
  th{background:#f3f4f6;padding:8px;text-align:left;font-size:12px}
  td{padding:8px;border-bottom:1px solid #e5e7eb}
  .total{font-weight:bold;font-size:18px;color:#FF0096}.meta{color:#666;font-size:12px}
  .tag{display:inline-block;padding:2px 8px;border-radius:99px;font-size:11px;background:#f3e8ff;color:#7c3aed}
  </style></head><body>
  <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:32px">
    <div><h1>COTIZACIÓN</h1><span class="tag">${q.status}</span></div>
    <div style="text-align:right"><p class="meta">N° ${q.quoteNumber || q.id}</p><p class="meta">${new Date(q.createdAt).toLocaleDateString("es-VE")}</p></div>
  </div>
  <p><strong>Cliente:</strong> ${q.clientName}${q.clientCompany ? ` — ${q.clientCompany}` : ""}</p>
  ${q.clientEmail ? `<p><strong>Email:</strong> ${q.clientEmail}</p>` : ""}
  ${q.clientPhone ? `<p><strong>Teléfono:</strong> ${q.clientPhone}</p>` : ""}
  ${q.travelDates ? `<p><strong>Fechas:</strong> ${q.travelDates} · ${q.numTravelers} viajero(s)</p>` : ""}
  <h3>${q.title || "Detalle de la Cotización"}</h3>
  ${q.description ? `<p>${q.description}</p>` : ""}
  ${items.length > 0 ? `<table><thead><tr><th>Descripción</th><th>Cant.</th><th>Precio Unit.</th><th>Total</th></tr></thead><tbody>
    ${items.map(it => `<tr><td>${it.description}</td><td>${it.qty}</td><td>${q.currency} ${Number(it.unitPrice).toLocaleString()}</td><td>${q.currency} ${Number(it.total).toLocaleString()}</td></tr>`).join("")}
  </tbody></table>` : ""}
  <div style="text-align:right;margin-top:16px">
    ${q.discountAmount > 0 ? `<p>Descuento: -${q.currency} ${Number(q.discountAmount).toLocaleString()}</p>` : ""}
    ${q.taxAmount > 0 ? `<p>IVA: +&nbsp;${q.currency} ${Number(q.taxAmount).toLocaleString()}</p>` : ""}
    <p class="total">TOTAL: ${q.currency} ${Number(q.total).toLocaleString()}</p>
    <p class="meta">Válida por ${q.validityDays} días</p>
  </div>
  ${q.notes ? `<p style="margin-top:24px;color:#666;font-size:12px">Notas: ${q.notes}</p>` : ""}
  ${q.terms ? `<p style="color:#666;font-size:12px">Términos: ${q.terms}</p>` : ""}
  </body></html>`);
  win.document.close(); win.print();
}

export function AdminCotizaciones() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const qc = useQueryClient();

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      nav("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Query to fetch quotes
  const { data: rawQuotes = [], isLoading: loading } = useQuery<any[]>({
    queryKey: ["admin-quotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase quotes fetch failed:", error);
      }

      const localQuotesKey = "hdv_mock_quotes";
      const localQuotes = JSON.parse(localStorage.getItem(localQuotesKey) || "[]");
      const combined = [...(data || []), ...localQuotes];

      return combined.map((q: any) => ({
        id: q.id,
        quoteNumber: q.quote_number ?? q.quoteNumber ?? `COT-${q.id}`,
        clientName: q.client_name ?? q.clientName ?? "",
        clientEmail: q.client_email ?? q.clientEmail ?? "",
        clientPhone: q.client_phone ?? q.clientPhone ?? "",
        clientCompany: q.client_company ?? q.clientCompany ?? "",
        title: q.title ?? "",
        description: q.description ?? "",
        travelDates: q.travel_dates ?? q.travelDates ?? "",
        numTravelers: Number(q.num_travelers ?? q.numTravelers ?? 1),
        itemsData: q.items_data ?? q.itemsData ?? "[]",
        subtotal: Number(q.subtotal ?? 0),
        discountPercent: Number(q.discount_percent ?? q.discountPercent ?? 0),
        discountAmount: Number(q.discount_amount ?? q.discountAmount ?? 0),
        taxPercent: Number(q.tax_percent ?? q.taxPercent ?? 0),
        taxAmount: Number(q.tax_amount ?? q.taxAmount ?? 0),
        total: Number(q.total ?? 0),
        currency: q.currency ?? "USD",
        validityDays: Number(q.validity_days ?? q.validityDays ?? 15),
        notes: q.notes ?? "",
        terms: q.terms ?? "",
        status: q.status ?? "draft",
        createdAt: q.created_at ?? q.createdAt ?? new Date().toISOString()
      }));
    }
  });

  // Save mutation
  const save = useMutation({
    mutationFn: async (d: typeof EMPTY_FORM) => {
      const computedSubtotal = items.reduce((s, i) => s + (i.total || 0), 0);
      const computedDiscount = computedSubtotal * (d.discountPercent / 100);
      const computedTax = (computedSubtotal - computedDiscount) * (d.taxPercent / 100);
      const computedTotal = computedSubtotal - computedDiscount + computedTax;

      const payload = {
        client_name: d.clientName,
        client_email: d.clientEmail,
        client_phone: d.clientPhone,
        client_company: d.clientCompany,
        title: d.title,
        description: d.description,
        travel_dates: d.travelDates,
        num_travelers: d.numTravelers,
        items_data: JSON.stringify(items),
        subtotal: computedSubtotal,
        discount_percent: d.discountPercent,
        discount_amount: computedDiscount,
        tax_percent: d.taxPercent,
        tax_amount: computedTax,
        total: computedTotal,
        currency: d.currency,
        validity_days: d.validityDays,
        notes: d.notes,
        terms: d.terms,
        status: d.status
      };

      const localQuotesKey = "hdv_mock_quotes";
      const localQuotes = JSON.parse(localStorage.getItem(localQuotesKey) || "[]");
      const isEdit = modal === "edit";
      const isMock = editId !== null && (editId >= 10000 || localQuotes.some((q: any) => q.id === editId));

      if (isMock || (isEdit && editId && editId >= 10000)) {
        if (isEdit) {
          const updated = localQuotes.map((q: any) => q.id === editId ? { ...q, ...payload, quote_number: q.quote_number ?? `COT-${q.id}` } : q);
          localStorage.setItem(localQuotesKey, JSON.stringify(updated));
        } else {
          const newId = Date.now();
          localStorage.setItem(localQuotesKey, JSON.stringify([...localQuotes, { id: newId, quote_number: `COT-${newId}`, ...payload, created_at: new Date().toISOString() }]));
        }
        return { success: true };
      }

      try {
        if (isEdit && editId !== null) {
          const { error } = await supabase
            .from("quotes")
            .update(payload)
            .eq("id", editId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("quotes")
            .insert({ ...payload, quote_number: `COT-${Math.floor(1000 + Math.random() * 9000)}` });
          if (error) throw error;
        }
      } catch (err) {
        if (isEdit) {
          const updated = localQuotes.map((q: any) => q.id === editId ? { ...q, ...payload } : q);
          localStorage.setItem(localQuotesKey, JSON.stringify(updated));
        } else {
          const newId = Date.now();
          localStorage.setItem(localQuotesKey, JSON.stringify([...localQuotes, { id: newId, quote_number: `COT-${newId}`, ...payload, created_at: new Date().toISOString() }]));
        }
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-quotes"] });
      setModal(null);
    }
  });

  // Delete mutation
  const del = useMutation({
    mutationFn: async (id: number) => {
      const localQuotesKey = "hdv_mock_quotes";
      const localQuotes = JSON.parse(localStorage.getItem(localQuotesKey) || "[]");
      const hasLocal = localQuotes.some((q: any) => q.id === id);

      if (hasLocal) {
        localStorage.setItem(localQuotesKey, JSON.stringify(localQuotes.filter((q: any) => q.id !== id)));
        return { success: true };
      }

      try {
        const { error } = await supabase
          .from("quotes")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } catch (err) {
        localStorage.setItem(localQuotesKey, JSON.stringify(localQuotes.filter((q: any) => q.id !== id)));
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-quotes"] });
    }
  });

  // Update status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const localQuotesKey = "hdv_mock_quotes";
      const localQuotes = JSON.parse(localStorage.getItem(localQuotesKey) || "[]");
      const hasLocal = localQuotes.some((q: any) => q.id === id);

      if (hasLocal) {
        const updated = localQuotes.map((q: any) => q.id === id ? { ...q, status } : q);
        localStorage.setItem(localQuotesKey, JSON.stringify(updated));
        return { success: true };
      }

      try {
        const { error } = await supabase
          .from("quotes")
          .update({ status })
          .eq("id", id);
        if (error) throw error;
      } catch (err) {
        const updated = localQuotes.map((q: any) => q.id === id ? { ...q, status } : q);
        localStorage.setItem(localQuotesKey, JSON.stringify(updated));
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-quotes"] });
    }
  });

  const setF = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setItems([{ ...EMPTY_ITEM }]);
    setEditId(null);
    setModal("create");
  };

  const openEdit = (q: Quote) => {
    setForm({
      clientName: q.clientName,
      clientEmail: q.clientEmail,
      clientPhone: q.clientPhone,
      clientCompany: q.clientCompany,
      title: q.title,
      description: q.description,
      travelDates: q.travelDates,
      numTravelers: q.numTravelers,
      itemsData: q.itemsData,
      subtotal: q.subtotal,
      discountPercent: q.discountPercent,
      discountAmount: q.discountAmount,
      taxPercent: q.taxPercent,
      taxAmount: q.taxAmount,
      total: q.total,
      currency: q.currency,
      validityDays: q.validityDays,
      notes: q.notes,
      terms: q.terms,
      status: q.status
    });
    setItems(parseItems(q.itemsData));
    setEditId(q.id);
    setModal("edit");
  };

  const updateItem = (i: number, k: keyof QuoteItem, v: any) => {
    setItems(prev =>
      prev.map((it, idx) => {
        if (idx !== i) return it;
        const updated = { ...it, [k]: v };
        updated.total = Number(updated.qty || 0) * Number(updated.unitPrice || 0);
        return updated;
      })
    );
  };

  const addItem = () => setItems(p => [...p, { ...EMPTY_ITEM }]);
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((s, i) => s + (i.total || 0), 0);
  const discount = subtotal * (form.discountPercent / 100);
  const tax = (subtotal - discount) * (form.taxPercent / 100);
  const total = subtotal - discount + tax;

  const quotes = (rawQuotes as Quote[]).filter(q => !filterStatus || q.status === filterStatus);

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
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#00C8D4" }} />
        <div className="max-w-6xl mx-auto px-6 relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#00C8D4]/20">
              <Briefcase className="w-4.5 h-4.5 text-[#00C8D4]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Presupuestos y Cotizaciones</h1>
              <p className="text-white/50 text-xs font-semibold">{rawQuotes.length} presupuestos emitidos a clientes</p>
            </div>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold border border-[#0099A8] cursor-pointer transition-transform hover:scale-102"
            style={{ background: "linear-gradient(90deg, #00C8D4, #0099A8)" }}>
            <Plus className="w-4 h-4" /> Crear Cotización
          </button>
        </div>
      </div>

      <AdminTabBar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Status filter pills */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[{ k: "", label: "Todas", count: rawQuotes.length }, ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ k, label: v.label, count: rawQuotes.filter(q => q.status === k).length }))].map(t => (
            <button key={t.k} onClick={() => setFilterStatus(t.k)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${filterStatus === t.k ? "bg-white shadow-sm text-gray-900 border-cyan-200" : "border-transparent text-gray-400 hover:bg-white"}`}>
              {t.label} <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full text-[9px] font-black">{t.count}</span>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {Array(4).fill(0).map((_, i) => <div key={i} className="bg-white rounded-xl h-20 animate-pulse border" />)}
          </div>
        ) : quotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-xs">
            <Briefcase className="w-10 h-10 text-gray-250 mx-auto mb-3" />
            <p className="text-gray-400 text-xs font-bold mb-4">No hay cotizaciones registradas</p>
            <button onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold cursor-pointer"
              style={{ background: "linear-gradient(90deg, #00C8D4, #0099A8)" }}>
              <Plus className="w-4 h-4" /> Crear primera cotización
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {quotes.map(q => {
              const st = STATUS_CONFIG[q.status] ?? STATUS_CONFIG.draft;
              const StIcon = st.Icon;
              const items_list = parseItems(q.itemsData);
              const exp = expandedId === q.id;
              return (
                <div key={q.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-sm transition-all">
                  <div className="p-4 flex items-start gap-4 cursor-pointer" onClick={() => setExpandedId(exp ? null : q.id)}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${st.bg}`}>
                      <StIcon className={`w-4 h-4 ${st.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${st.bg} ${st.text} ${st.border}`}>{st.label}</span>
                        {q.quoteNumber && <span className="text-[9px] text-gray-400 font-mono font-bold">{q.quoteNumber}</span>}
                        <span className="text-[9px] text-gray-400 font-bold">{new Date(q.createdAt).toLocaleDateString("es-VE")}</span>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">{q.title || `Cotización para ${q.clientName}`}</p>
                      <div className="flex gap-4 mt-1 flex-wrap font-semibold text-xs text-gray-500">
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-gray-300" />{q.clientName}{q.clientCompany ? ` — ${q.clientCompany}` : ""}</span>
                        {q.numTravelers > 1 && <span>{q.numTravelers} viajeros</span>}
                        {q.travelDates && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-300" />{q.travelDates}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-gray-900 text-sm">{q.currency} {Number(q.total).toLocaleString("es-VE", { minimumFractionDigits: 2 })}</p>
                      <p className="text-[9px] text-gray-400 font-bold">Vence en {q.validityDays} días</p>
                      <ChevronDown className={`w-4 h-4 text-gray-300 mt-1 ml-auto transition-transform ${exp ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  {exp && (
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                      <div className="flex gap-4 flex-wrap text-xs font-semibold text-gray-500">
                        {q.clientEmail && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-300" />{q.clientEmail}</span>}
                        {q.clientPhone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-300" />{q.clientPhone}</span>}
                      </div>
                      {q.description && <p className="text-xs text-gray-450 font-semibold leading-relaxed">{q.description}</p>}

                      {items_list.length > 0 && (
                        <div className="bg-gray-50 rounded-xl overflow-hidden border">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b bg-white text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">
                                <th className="p-3">Descripción</th>
                                <th className="p-3 text-center w-12">Cant.</th>
                                <th className="p-3 text-right w-24">P. Unit.</th>
                                <th className="p-3 text-right w-24">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items_list.map((it, i) => (
                                <tr key={i} className="border-b border-gray-100 last:border-0 font-semibold text-gray-700">
                                  <td className="p-3">{it.description}</td>
                                  <td className="p-3 text-center text-gray-550">{it.qty}</td>
                                  <td className="p-3 text-right text-gray-550">{q.currency} {Number(it.unitPrice).toLocaleString("es-VE", { minimumFractionDigits: 2 })}</td>
                                  <td className="p-3 text-right font-black text-gray-800">{q.currency} {Number(it.total).toLocaleString("es-VE", { minimumFractionDigits: 2 })}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="p-3 bg-slate-50 border-t text-right space-y-1 font-bold text-xs">
                            {q.discountAmount > 0 && <p className="text-green-600">Descuento ({q.discountPercent}%): -{q.currency} {Number(q.discountAmount).toLocaleString("es-VE", { minimumFractionDigits: 2 })}</p>}
                            {q.taxAmount > 0 && <p className="text-gray-450">IVA ({q.taxPercent}%): +{q.currency} {Number(q.taxAmount).toLocaleString("es-VE", { minimumFractionDigits: 2 })}</p>}
                            <p className="text-sm font-black text-gray-900">TOTAL: {q.currency} {Number(q.total).toLocaleString("es-VE", { minimumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap items-center pt-2">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mr-1">Cambiar Estado:</span>
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                          <button key={k} onClick={() => updateStatus.mutate({ id: q.id, status: k })} disabled={q.status === k}
                            className={`flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${q.status === k ? `${v.bg} ${v.text} ${v.border}` : "bg-white text-gray-400 border-gray-200 hover:border-gray-300 disabled:opacity-60"}`}>
                            {v.label}
                          </button>
                        ))}
                        <div className="flex-1" />
                        <button onClick={() => printQuote(q)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer">
                          <Printer className="w-3.5 h-3.5" /> Imprimir
                        </button>
                        {q.clientEmail && (
                          <a href={`mailto:${q.clientEmail}?subject=Cotización ${q.quoteNumber || q.id}&body=Estimado ${q.clientName}, adjunto nuestra cotización por ${q.currency} ${Number(q.total).toLocaleString("es-VE")}.`}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-bold cursor-pointer"
                            style={{ background: "#00C8D4" }}>
                            <Send className="w-3 h-3" /> Enviar por Mail
                          </a>
                        )}
                        <button onClick={() => openEdit(q)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 text-xs font-bold text-slate-700 cursor-pointer border border-transparent">
                          <Edit2 className="w-3.5 h-3.5" /> Editar
                        </button>
                        <button onClick={() => { if (confirm("¿Eliminar cotización?")) del.mutate(q.id); }}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-bold text-gray-900 text-base">{modal === "create" ? "Nueva Cotización" : "Editar Cotización"}</h2>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-full bg-gray-100 border flex items-center justify-center cursor-pointer hover:bg-gray-200">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Client */}
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Datos del Cliente</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">Nombre *</label>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-cyan-400 bg-white">
                      <User className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <input value={form.clientName} onChange={e => setF("clientName", e.target.value)} placeholder="Nombre del cliente" className="flex-1 text-xs font-semibold focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">Empresa</label>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-cyan-400 bg-white">
                      <Building2 className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <input value={form.clientCompany} onChange={e => setF("clientCompany", e.target.value)} placeholder="Empresa (opcional)" className="flex-1 text-xs font-semibold focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">Email</label>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-cyan-400 bg-white">
                      <Mail className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <input type="email" value={form.clientEmail} onChange={e => setF("clientEmail", e.target.value)} placeholder="email@ejemplo.com" className="flex-1 text-xs font-semibold focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">Teléfono</label>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-cyan-400 bg-white">
                      <Phone className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <input value={form.clientPhone} onChange={e => setF("clientPhone", e.target.value)} placeholder="+58 412..." className="flex-1 text-xs font-semibold focus:outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote details */}
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Detalles del Servicio</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">Título</label>
                    <input value={form.title} onChange={e => setF("title", e.target.value)} placeholder="Ej: Paquete vacacional Los Roques 3D/2N" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-400 bg-white" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-1 block">Fechas de viaje</label>
                      <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-cyan-400 bg-white">
                        <Calendar className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                        <input value={form.travelDates} onChange={e => setF("travelDates", e.target.value)} placeholder="15-22 julio" className="flex-1 text-xs font-semibold focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-1 block">N° Viajeros</label>
                      <input type="number" min={1} value={form.numTravelers} onChange={e => setF("numTravelers", parseInt(e.target.value) || 1)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-400 bg-white" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-1 block">Moneda</label>
                      <select value={form.currency} onChange={e => setF("currency", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-cyan-400 bg-white">
                        <option value="USD">USD $</option>
                        <option value="VES">VES Bs</option>
                        <option value="EUR">EUR €</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">Descripción general</label>
                    <textarea value={form.description} onChange={e => setF("description", e.target.value)} rows={2} placeholder="Descripción del itinerario o servicios provistos..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-400 resize-none bg-white" />
                  </div>
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Líneas de Detalle</p>
                  <button onClick={addItem} className="flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 font-bold cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /> Agregar línea
                  </button>
                </div>
                <div className="bg-gray-50 rounded-xl overflow-hidden border">
                  <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[9px] font-black text-gray-450 uppercase border-b bg-white">
                    <span className="col-span-5">Descripción</span>
                    <span className="col-span-2 text-center">Cant.</span>
                    <span className="col-span-2 text-right">P. Unit.</span>
                    <span className="col-span-2 text-right">Total</span>
                    <span className="col-span-1" />
                  </div>
                  {items.map((it, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 px-3 py-1.5 border-b border-gray-100 last:border-0 items-center">
                      <input value={it.description} onChange={e => updateItem(i, "description", e.target.value)} placeholder="Descripción del servicio" className="col-span-5 text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-300 bg-white font-semibold" />
                      <input type="number" min={1} value={it.qty} onChange={e => updateItem(i, "qty", parseFloat(e.target.value) || 0)} className="col-span-2 text-xs border border-gray-200 rounded-lg px-2 py-1 text-center focus:outline-none focus:border-cyan-300 bg-white font-semibold" />
                      <input type="number" min={0} value={it.unitPrice} onChange={e => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)} className="col-span-2 text-xs border border-gray-200 rounded-lg px-2 py-1 text-right focus:outline-none focus:border-cyan-300 bg-white font-semibold" />
                      <div className="col-span-2 text-right text-xs font-bold text-gray-700">{form.currency} {Number(it.total).toLocaleString()}</div>
                      <button onClick={() => removeItem(i)} className="col-span-1 w-6 h-6 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center mx-auto cursor-pointer">
                        <X className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">Descuento (%)</label>
                    <input type="number" min={0} max={100} value={form.discountPercent} onChange={e => setF("discountPercent", parseFloat(e.target.value) || 0)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-400 bg-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">IVA (%)</label>
                    <input type="number" min={0} max={30} value={form.taxPercent} onChange={e => setF("taxPercent", parseFloat(e.target.value) || 0)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-400 bg-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">Validez de Oferta (días)</label>
                    <input type="number" min={1} value={form.validityDays} onChange={e => setF("validityDays", parseInt(e.target.value) || 15)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-400 bg-white" />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2 self-start border border-gray-200">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold">{form.currency} {subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && <div className="flex justify-between text-xs font-bold text-green-600"><span>Descuento</span><span>-{form.currency} {discount.toLocaleString()}</span></div>}
                  {tax > 0 && <div className="flex justify-between text-xs font-bold text-gray-400"><span>IVA</span><span>+{form.currency} {tax.toLocaleString()}</span></div>}
                  <div className="flex justify-between font-black text-sm border-t border-gray-200 pt-2 mt-2">
                    <span>TOTAL</span>
                    <span style={{ color: "#00C8D4" }}>{form.currency} {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Notes + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">Notas internas</label>
                  <textarea value={form.notes} onChange={e => setF("notes", e.target.value)} rows={2} placeholder="Comentarios para uso interno del equipo..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-400 resize-none bg-white" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 mb-1 block">Estado inicial</label>
                  <select value={form.status} onChange={e => setF("status", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-cyan-400 bg-white">
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center">
              <p className="text-xs font-bold text-gray-500">Total calculado: <span className="font-black text-gray-900 text-sm">{form.currency} {total.toLocaleString()}</span></p>
              <div className="flex gap-2">
                <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-gray-600 border cursor-pointer">Cancelar</button>
                <button onClick={() => save.mutate(form)} disabled={!form.clientName.trim() || save.isPending}
                  className="px-5 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 cursor-pointer border border-[#0099A8]"
                  style={{ background: "linear-gradient(90deg, #00C8D4, #0099A8)" }}>
                  {save.isPending ? "Guardando..." : <><Save className="w-4 h-4" /> Guardar cotización</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
