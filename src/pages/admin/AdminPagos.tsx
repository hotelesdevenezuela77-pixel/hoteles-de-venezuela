import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { supabase } from "@/lib/supabase";
import { 
  DollarSign, CheckCircle2, XCircle, Clock, Search,
  Phone, Mail, User, Calendar, Receipt, MessageSquare,
  ChevronDown, ChevronUp, Loader2, Eye, ExternalLink, RefreshCw,
  Upload, Trash2, FileText, FileCheck, ShieldCheck, Download, X
} from "lucide-react";

const REASONS: Record<string, string> = {
  membresia: "Membresía",
  reserva_hotel: "Reserva de Hotel",
  reserva_paquete: "Reserva de Paquete",
  otro: "Otro Concepto"
};

const METHODS: Record<string, string> = {
  pago_movil: "Pago Móvil",
  zelle: "Zelle",
  usdt: "Binance USDT",
  paypal: "PayPal"
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pendiente: { label: "Pendiente", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", icon: Clock },
  aprobado: { label: "Aprobado", color: "#22C55E", bg: "rgba(34,197,94,0.1)", icon: CheckCircle2 },
  rechazado: { label: "Rechazado", color: "#EF4444", bg: "rgba(239,68,68,0.1)", icon: XCircle }
};

export function AdminPagos() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("pendiente");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [paymentDocsMap, setPaymentDocsMap] = useState<Record<number, any[]>>({});
  const [selectedTagMap, setSelectedTagMap] = useState<Record<number, string>>({});
  const [viewingDocModal, setViewingDocModal] = useState<any | null>(null);

  const getPaymentDocs = (p: any) => {
    if (paymentDocsMap[p.id]) return paymentDocsMap[p.id];
    
    const localKey = `hdv_payment_docs_${p.id}`;
    const stored = localStorage.getItem(localKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed;
      } catch (e) {
        // fallback
      }
    }
    
    if (p.payment_documents && Array.isArray(p.payment_documents) && p.payment_documents.length > 0) {
      return p.payment_documents;
    }

    if (p.screenshot_url) {
      const isPdf = p.screenshot_url.includes(".pdf") || p.screenshot_url.startsWith("data:application/pdf");
      return [{
        id: `default_${p.id}`,
        name: "Comprobante Principal",
        type: isPdf ? "pdf" : "image",
        url: p.screenshot_url,
        uploadedAt: p.payment_date || p.created_at || "Fecha de Reporte",
        size: "Original",
        docTypeTag: "Capture de Pago"
      }];
    }

    return [];
  };

  const handleUploadDocForPayment = (paymentId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const tag = selectedTagMap[paymentId] || "Capture de Transferencia";
    const currentDocs = getPaymentDocs({ id: paymentId });

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const isPdf = file.type.includes("pdf") || file.name.toLowerCase().endsWith(".pdf");
        const newDoc = {
          id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          type: isPdf ? "pdf" : "image",
          url: base64,
          uploadedAt: new Date().toLocaleDateString("es-VE") + " " + new Date().toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" }),
          size: `${(file.size / 1024).toFixed(1)} KB`,
          docTypeTag: tag
        };

        const updatedDocs = [...currentDocs, newDoc];
        setPaymentDocsMap(prev => ({ ...prev, [paymentId]: updatedDocs }));
        localStorage.setItem(`hdv_payment_docs_${paymentId}`, JSON.stringify(updatedDocs));

        try {
          await supabase.from("reported_payments").update({
            payment_documents: updatedDocs,
            screenshot_url: updatedDocs[0]?.url || base64
          }).eq("id", paymentId);
        } catch (err) {
          console.warn("DB update payment_documents error:", err);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const handleRemoveDocForPayment = async (paymentId: number, docId: string) => {
    const currentDocs = getPaymentDocs({ id: paymentId });
    const updatedDocs = currentDocs.filter((d: any) => d.id !== docId);

    setPaymentDocsMap(prev => ({ ...prev, [paymentId]: updatedDocs }));
    localStorage.setItem(`hdv_payment_docs_${paymentId}`, JSON.stringify(updatedDocs));

    try {
      await supabase.from("reported_payments").update({
        payment_documents: updatedDocs,
        screenshot_url: updatedDocs[0]?.url || null
      }).eq("id", paymentId);
    } catch (err) {
      console.warn("DB remove payment_document error:", err);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Query to fetch reported payments
  const { data: payments = [], isLoading: loading } = useQuery<any[]>({
    queryKey: ["admin-reported-payments"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("reported_payments")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn("Error cargando reportes de pago de Supabase, usando local storage:", err);
        const key = "hdv_reported_payments";
        return JSON.parse(localStorage.getItem(key) || "[]").sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: number; status: string; adminNotes?: string }) => {
      const localKey = "hdv_reported_payments";
      const local = JSON.parse(localStorage.getItem(localKey) || "[]");
      const isMock = local.some((p: any) => p.id === id);

      if (isMock) {
        const updated = local.map((p: any) => p.id === id ? { ...p, status, admin_notes: adminNotes } : p);
        localStorage.setItem(localKey, JSON.stringify(updated));
        return { success: true };
      }

      const { error } = await supabase
        .from("reported_payments")
        .update({ status, admin_notes: adminNotes })
        .eq("id", id);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reported-payments"] });
      alert("El estado del pago ha sido actualizado.");
    },
    onError: (err: any) => {
      alert(`Error al actualizar estado: ${err.message}`);
    }
  });

  const handleApprove = (id: number) => {
    if (window.confirm("¿Está seguro de APROBAR este pago?")) {
      updateStatus.mutate({ id, status: "aprobado", adminNotes: "Aprobado por administración" });
    }
  };

  const handleReject = (id: number) => {
    const reason = window.prompt("Ingrese el motivo del rechazo del pago (ej: Referencia no coincide, fondos insuficientes):");
    if (reason !== null) {
      updateStatus.mutate({ id, status: "rechazado", adminNotes: reason });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
        <p className="text-gray-500 text-xs font-bold">Verificando credenciales de seguridad...</p>
      </div>
    );
  }

  const filtered = payments.filter((p: any) => {
    const matchStatus = filterStatus === "todos" || p.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || 
      (p.client_name ?? "").toLowerCase().includes(q) ||
      (p.client_email ?? "").toLowerCase().includes(q) ||
      (p.reference ?? "").toLowerCase().includes(q) ||
      (p.reason_detail ?? "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    todos: payments.length,
    pendiente: payments.filter((p: any) => p.status === "pendiente").length,
    aprobado: payments.filter((p: any) => p.status === "aprobado").length,
    rechazado: payments.filter((p: any) => p.status === "rechazado").length,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 pb-24 font-sans">
      {/* Header */}
      <div className="relative overflow-hidden py-8" style={{ background: "linear-gradient(135deg, #0e0120, #1a0533)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#00C8D4" }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Verificación de Pagos</h1>
            <p className="text-white/50 text-xs font-semibold">{counts.todos} transacciones reportadas por usuarios</p>
          </div>
          <button 
            onClick={() => qc.invalidateQueries({ queryKey: ["admin-reported-payments"] })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all cursor-pointer self-start"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Recargar
          </button>
        </div>
      </div>

      <AdminTabBar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Filters and search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          {/* Status Tabs */}
          <div className="flex gap-1.5 bg-slate-50 border p-1 rounded-xl w-full md:w-auto overflow-x-auto shrink-0">
            {[
              { id: "pendiente", label: "Pendientes", count: counts.pendiente, color: "text-amber-500 bg-amber-50" },
              { id: "aprobado", label: "Aprobados", count: counts.aprobado, color: "text-emerald-500 bg-emerald-50" },
              { id: "rechazado", label: "Rechazados", count: counts.rechazado, color: "text-red-500 bg-red-50" },
              { id: "todos", label: "Todos", count: counts.todos, color: "text-slate-600 bg-slate-100" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  filterStatus === tab.id 
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                    : "text-slate-450 hover:text-slate-800"
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-slate-200 text-slate-700">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, referencia o banco..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-semibold text-gray-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C8D4] focus:ring-1 focus:ring-[#00C8D4] shadow-xs"
            />
          </div>
        </div>

        {/* List of payments */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
            <p className="text-slate-400 text-xs font-bold">Cargando reportes de pagos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl py-20 text-center shadow-xs">
            <Receipt className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No se encontraron reportes</h3>
            <p className="text-slate-450 text-xs mt-1">No hay transacciones que coincidan con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((p: any) => {
              const Icon = STATUS_CONFIG[p.status]?.icon || Clock;
              const isExpanded = expandedId === p.id;
              
              return (
                <div key={p.id} className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden transition-all duration-300">
                  {/* Collapsed view summary */}
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                    className="p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
                  >
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      {/* Screenshot thumbnail */}
                      {p.screenshot_url ? (
                        <div 
                          className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0 group relative"
                          onClick={(e) => { e.stopPropagation(); setLightboxImage(p.screenshot_url); }}
                          title="Click para ver captura"
                        >
                          <img src={p.screenshot_url} alt="receipt" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[8px] font-black uppercase">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border flex items-center justify-center text-slate-400 shrink-0 text-xs">
                          📷
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-xs md:text-sm">{p.client_name}</span>
                          <span className="text-[10px] text-slate-400 font-bold bg-slate-50 border px-2 py-0.5 rounded-full uppercase">
                            {REASONS[p.payment_reason] || p.payment_reason}
                          </span>
                        </div>
                        <p className="text-slate-450 text-[10px] md:text-xs font-semibold leading-relaxed mt-0.5 truncate">{p.reason_detail}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-3.5 md:pt-0">
                      <div className="text-left md:text-right shrink-0">
                        <div className="text-brand-magenta font-black text-sm md:text-base">
                          {p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {p.currency}
                        </div>
                        <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-0.5 font-mono">
                          {METHODS[p.payment_method] || p.payment_method} · ref: #{p.reference}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span 
                          className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border flex items-center gap-1 shrink-0"
                          style={{
                            color: STATUS_CONFIG[p.status]?.color,
                            borderColor: STATUS_CONFIG[p.status]?.color,
                            backgroundColor: STATUS_CONFIG[p.status]?.bg
                          }}
                        >
                          <Icon className="w-3 h-3" />
                          {STATUS_CONFIG[p.status]?.label || p.status}
                        </span>
                        
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-[#fafcfd]/60 p-5 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Transaction particulars */}
                        <div className="space-y-4 md:col-span-2">
                          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b pb-1.5 flex items-center gap-1">
                            <Receipt className="w-4 h-4 text-[#00C8D4]" /> Detalles del Pago Reportado
                          </h4>
                          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-semibold">
                            <div className="text-slate-400">Concepto / Razón:</div>
                            <div className="text-slate-800">{REASONS[p.payment_reason] || p.payment_reason} — {p.reason_detail}</div>
                            
                            <div className="text-slate-400">Cliente / Titular:</div>
                            <div className="text-slate-800 flex items-center gap-1">
                              <User className="w-3.5 h-3.5 inline text-slate-450" /> {p.client_name}
                            </div>
                            
                            <div className="text-slate-400">Contacto:</div>
                            <div className="text-slate-800 space-y-0.5">
                              <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {p.client_email}</p>
                              <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {p.client_phone}</p>
                            </div>

                            <div className="text-slate-400">Método & Moneda:</div>
                            <div className="text-slate-800 font-bold uppercase">{METHODS[p.payment_method] || p.payment_method} ({p.currency})</div>

                            <div className="text-slate-400">Monto total:</div>
                            <div className="text-brand-magenta font-black">{p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {p.currency}</div>

                            <div className="text-slate-400">Referencia bancaria:</div>
                            <div className="text-slate-800 font-mono font-bold">#{p.reference}</div>

                            <div className="text-slate-400">Fecha del pago:</div>
                            <div className="text-slate-800 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" /> {p.payment_date}
                            </div>
                          </div>

                          {/* Payment-method specific metadata */}
                          {(p.bank_name || p.zelle_email) && (
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 mt-4 text-xs font-semibold">
                              <h5 className="font-bold text-slate-700 text-[10px] uppercase tracking-wider">Datos de Transferencia local</h5>
                              {p.payment_method === "pago_movil" && (
                                <div className="grid grid-cols-2 gap-y-1 text-slate-600">
                                  <span>Banco emisor:</span> <span className="text-slate-800 font-bold">{p.bank_name}</span>
                                  <span>Teléfono emisor:</span> <span className="text-slate-800 font-bold">{p.bank_phone}</span>
                                  <span>Cédula/RIF emisor:</span> <span className="text-slate-800 font-bold">{p.bank_id}</span>
                                </div>
                              )}
                              {p.payment_method === "zelle" && (
                                <div className="grid grid-cols-2 gap-y-1 text-slate-600">
                                  <span>Titular Zelle:</span> <span className="text-slate-800 font-bold">{p.zelle_name}</span>
                                  <span>Email Zelle:</span> <span className="text-slate-800 font-bold">{p.zelle_email}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {p.notes && (
                            <div className="mt-3 p-3 bg-cyan-50/20 border border-cyan-100 rounded-xl text-xs font-semibold text-slate-650 flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-[#00C8D4] shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-slate-700 block mb-0.5">Notas del cliente:</span>
                                {p.notes}
                              </div>
                            </div>
                          )}

                          {p.admin_notes && (
                            <div className="mt-3 p-3 bg-red-50/20 border border-red-100 rounded-xl text-xs font-semibold text-slate-650 flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-slate-700 block mb-0.5">Notas de administración:</span>
                                {p.admin_notes}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Payment Proofs & Documents Column */}
                        <div className="flex flex-col p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3 text-left">
                          {(() => {
                            const docs = getPaymentDocs(p);
                            return (
                              <>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] uppercase font-extrabold text-slate-700 tracking-wider flex items-center gap-1">
                                    <FileCheck className="w-3.5 h-3.5 text-[#00C8D4]" />
                                    Zona de Comprobantes ({docs.length})
                                  </span>
                                  {docs.length > 0 && (
                                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                      Respaldos Verificados
                                    </span>
                                  )}
                                </div>

                                {/* Upload controls for admin */}
                                <div className="space-y-2 pt-1 border-t border-slate-100">
                                  <div className="flex gap-1.5">
                                    <select
                                      value={selectedTagMap[p.id] || "Capture de Transferencia"}
                                      onChange={e => setSelectedTagMap(prev => ({ ...prev, [p.id]: e.target.value }))}
                                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#00C8D4]"
                                    >
                                      <option value="Capture de Transferencia">Capture de Transferencia</option>
                                      <option value="Comprobante Bancario (PDF)">Comprobante Bancario (PDF)</option>
                                      <option value="Confirmación Zelle">Confirmación Zelle</option>
                                      <option value="Recibo Binance USDT">Recibo Binance USDT</option>
                                      <option value="Otro Respaldo">Otro Respaldo</option>
                                    </select>

                                    <label className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold py-1.5 px-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs">
                                      <Upload className="w-3.5 h-3.5 text-[#00C8D4]" />
                                      <span>Adjuntar</span>
                                      <input
                                        type="file"
                                        multiple
                                        accept="image/*,application/pdf"
                                        onChange={e => handleUploadDocForPayment(p.id, e)}
                                        className="hidden"
                                      />
                                    </label>
                                  </div>
                                </div>

                                {/* Documents List */}
                                {docs.length === 0 ? (
                                  <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <Receipt className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                                    <p className="text-[11px] font-bold text-slate-500">No se adjuntaron comprobantes</p>
                                    <p className="text-[9px] text-slate-400 mt-0.5">Usa "Adjuntar" arriba para cargar comprobantes de pago.</p>
                                  </div>
                                ) : (
                                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                    {docs.map((doc: any) => (
                                      <div key={doc.id} className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                                        <div className="flex items-center gap-2 min-w-0">
                                          {doc.type === "image" ? (
                                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-200 shrink-0 border border-gray-300">
                                              <img src={doc.url} alt={doc.name} className="w-full h-full object-cover" />
                                            </div>
                                          ) : (
                                            <div className="w-9 h-9 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0">
                                              <FileText className="w-4 h-4 text-purple-700" />
                                            </div>
                                          )}
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-1">
                                              <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-[#00C8D4]/15 text-slate-800">
                                                {doc.docTypeTag || "Comprobante"}
                                              </span>
                                            </div>
                                            <p className="text-[11px] font-bold text-slate-800 truncate mt-0.5">{doc.name}</p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => setViewingDocModal(doc)}
                                            className="px-2 py-1 bg-[#00C8D4]/15 hover:bg-[#00C8D4] hover:text-white text-slate-800 rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer"
                                            title="Visualizar comprobante"
                                          >
                                            <Eye className="w-3 h-3" />
                                            <span>Ver</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveDocForPayment(p.id, doc.id)}
                                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                            title="Eliminar comprobante"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Actions */}
                      {p.status === "pendiente" && (
                        <div className="border-t border-slate-100 pt-4 flex gap-3 justify-end">
                          <button 
                            onClick={() => handleReject(p.id)}
                            className="px-5 py-2.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-650 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Rechazar Pago
                          </button>
                          <button 
                            onClick={() => handleApprove(p.id)}
                            className="px-6 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer bg-gradient-to-r from-[#00C8D4] to-purple-600 shadow-sm hover:shadow-md"
                          >
                            Aprobar y Confirmar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Image Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-99 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-lg font-bold cursor-pointer transition-colors"
            >
              ×
            </button>
            <img src={lightboxImage} alt="Receipt capture lightbox" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
          </div>
        </div>
      )}

      {/* Lightbox / Document Viewer Modal for Payment Receipts */}
      {viewingDocModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 my-6">
            <div className="bg-gradient-to-r from-brand-purple-dark to-brand-purple-deep px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#00C8D4]/20 border border-[#00C8D4]/30 flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-[#00C8D4]" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm tracking-wide text-white">{viewingDocModal.name}</h3>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-magenta text-white">
                      {viewingDocModal.docTypeTag || "Comprobante de Pago"}
                    </span>
                  </div>
                  <p className="text-white/70 text-[10px] font-semibold mt-0.5">
                    Cargado el: {viewingDocModal.uploadedAt} | Tamaño: {viewingDocModal.size}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingDocModal(null)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 bg-slate-900 flex flex-col items-center justify-center min-h-[400px] max-h-[70vh] overflow-y-auto">
              {viewingDocModal.type === "image" ? (
                <img
                  src={viewingDocModal.url}
                  alt={viewingDocModal.name}
                  className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-2xl border border-slate-700"
                />
              ) : (
                <div className="w-full h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-slate-800 rounded-2xl border border-slate-700">
                  <iframe
                    src={viewingDocModal.url}
                    title={viewingDocModal.name}
                    className="w-full h-full rounded-xl bg-white border-0 mb-3"
                  />
                  <p className="text-xs text-slate-300 font-semibold mb-2">Vista previa de comprobante bancario PDF</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                Respaldo verificado de transacción comercial para Hoteles de Venezuela LLC
              </span>
              <div className="flex gap-2">
                <a
                  href={viewingDocModal.url}
                  download={viewingDocModal.name}
                  className="px-4 py-2 bg-[#00C8D4] hover:bg-cyan-500 text-slate-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar</span>
                </a>
                <button
                  type="button"
                  onClick={() => setViewingDocModal(null)}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
