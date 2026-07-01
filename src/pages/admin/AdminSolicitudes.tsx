import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { supabase } from "@/lib/supabase";
import {
  ClipboardList, CheckCircle, XCircle, Clock, Search,
  Phone, Mail, Users, Calendar, DollarSign, MessageSquare,
  Building2, ChevronDown, ChevronUp, Loader2
} from "lucide-react";

const STATUS: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pendiente:  { label: "Pendiente",  color: "#F59E0B", bg: "rgba(245,158,11,0.1)",  icon: Clock        },
  confirmado: { label: "Confirmado", color: "#22C55E", bg: "rgba(34,197,94,0.1)",   icon: CheckCircle  },
  cancelado:  { label: "Cancelado",  color: "#EF4444", bg: "rgba(239,68,68,0.1)",   icon: XCircle      },
  completado: { label: "Completado", color: "#6366F1", bg: "rgba(99,102,241,0.1)",  icon: CheckCircle  },
};

const PAY: Record<string, { label: string; color: string }> = {
  pendiente:  { label: "Sin pagar", color: "#F59E0B" },
  pagado:     { label: "Pagado",    color: "#22C55E" },
  reembolsado:{ label: "Reembolso", color: "#6366F1" },
};

export function AdminSolicitudes() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Query to fetch booking requests
  const { data: requests = [], isLoading: loading } = useQuery<any[]>({
    queryKey: ["admin-booking-requests"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("booking_requests")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        
        const mapped = (data || []).map((r: any) => ({
          id: r.id,
          status: r.status || "pendiente",
          paymentStatus: r.payment_status || r.paymentStatus || "pendiente",
          establishmentId: r.establishment_id || r.establishmentId,
          startDate: r.start_date || r.startDate,
          endDate: r.end_date || r.endDate,
          guests: r.guests_count || r.guests || 1,
          totalPrice: r.total_price || r.totalPrice,
          userName: r.user_name || r.userName || "Cliente",
          userEmail: r.user_email || r.userEmail,
          userPhone: r.user_phone || r.userPhone,
          commissionAmount: r.commission_amount || r.commissionAmount,
          commissionRate: r.commission_rate || r.commissionRate,
          message: r.message,
          createdAt: r.created_at || r.createdAt
        }));

        const localReqKey = "hdv_mock_booking_requests";
        const localReq = JSON.parse(localStorage.getItem(localReqKey) || "[]");
        return [...mapped, ...localReq];
      } catch (err) {
        const localReqKey = "hdv_mock_booking_requests";
        const localReq = JSON.parse(localStorage.getItem(localReqKey) || "[]");
        if (localReq.length === 0) {
          const defaults = [
            { id: 1, userName: "Juan Pérez", userEmail: "juan@gmail.com", userPhone: "+584125556677", status: "pendiente", paymentStatus: "pendiente", establishmentId: 2, startDate: "2026-07-01", endDate: "2026-07-05", guests: 2, totalPrice: 240, commissionAmount: 24, commissionRate: 10, message: "Quisiera habitación con vista al mar.", createdAt: new Date().toISOString() },
            { id: 2, userName: "María Delgado", userEmail: "maria@outlook.com", userPhone: "+584241112233", status: "confirmado", paymentStatus: "pagado", establishmentId: 5, startDate: "2026-06-25", endDate: "2026-06-28", guests: 3, totalPrice: 450, commissionAmount: 45, commissionRate: 10, message: "", createdAt: new Date().toISOString() },
          ];
          localStorage.setItem(localReqKey, JSON.stringify(defaults));
          return defaults;
        }
        return localReq;
      }
    },
    staleTime: 15000,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, ownerNotes }: { id: number; status: string; ownerNotes?: string }) => {
      const localReqKey = "hdv_mock_booking_requests";
      const localReq = JSON.parse(localStorage.getItem(localReqKey) || "[]");
      const isMock = localReq.some((r: any) => r.id === id);

      if (isMock) {
        const updated = localReq.map((r: any) => r.id === id ? { ...r, status, ownerNotes } : r);
        localStorage.setItem(localReqKey, JSON.stringify(updated));
        return { success: true };
      }

      try {
        const { error } = await supabase
          .from("booking_requests")
          .update({ status, owner_notes: ownerNotes })
          .eq("id", id);
        if (error) throw error;
      } catch (err) {
        const updated = localReq.map((r: any) => r.id === id ? { ...r, status, ownerNotes } : r);
        localStorage.setItem(localReqKey, JSON.stringify(updated));
      }
      return { success: true };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-booking-requests"] }),
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
        <p className="text-gray-500 text-xs font-bold">Verificando credenciales de seguridad...</p>
      </div>
    );
  }

  const filtered = requests.filter(r => {
    const matchStatus = filterStatus === "todos" || r.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || (r.userName ?? "").toLowerCase().includes(q) ||
      (r.userEmail ?? "").toLowerCase().includes(q) ||
      String(r.establishmentId).includes(q);
    return matchStatus && matchSearch;
  });

  const counts = {
    todos: requests.length,
    pendiente: requests.filter(r => r.status === "pendiente").length,
    confirmado: requests.filter(r => r.status === "confirmado").length,
    cancelado: requests.filter(r => r.status === "cancelado").length,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 pb-24 font-sans">
      {/* Header */}
      <div className="relative overflow-hidden py-8" style={{ background: "linear-gradient(135deg, #0e0120, #1a0533)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#FF0096" }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-pink-500/20">
              <ClipboardList className="w-4.5 h-4.5 text-pink-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Solicitudes de Reserva</h1>
              <p className="text-white/50 text-xs font-semibold">{requests.length} solicitudes registradas</p>
            </div>
          </div>
        </div>
      </div>

      <AdminTabBar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filtros */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            {(["todos", "pendiente", "confirmado", "cancelado"] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${filterStatus === s ? "text-white border-transparent" : "bg-white text-gray-650 border-gray-200 hover:border-gray-400"}`}
                style={filterStatus === s ? { background: s === "todos" ? "#1a0533" : STATUS[s]?.color ?? "#1a0533", borderColor: "transparent" } : {}}
              >
                {s === "todos" ? "Todos" : STATUS[s].label} ({counts[s as keyof typeof counts] ?? 0})
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Buscar cliente..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-pink-500 font-semibold"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="py-20 text-center text-gray-400 text-xs font-bold">Cargando solicitudes...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-20 text-center shadow-xs">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400 text-xs font-bold">No hay solicitudes{filterStatus !== "todos" ? ` con estado "${STATUS[filterStatus]?.label}"` : ""}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req: any) => {
              const st = STATUS[req.status] ?? STATUS.pendiente;
              const StIcon = st.icon;
              const pay = PAY[req.paymentStatus] ?? PAY.pendiente;
              const isOpen = expanded === req.id;
              return (
                <div key={req.id} className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                  {/* Row */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                    onClick={() => setExpanded(isOpen ? null : req.id)}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: st.bg }}>
                      <StIcon className="w-4.5 h-4.5" style={{ color: st.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">{req.userName ?? "Sin nombre"}</span>
                        <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}30` }} className="text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {st.label}
                        </span>
                        <span style={{ background: `${pay.color}15`, color: pay.color }} className="text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {pay.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 font-semibold flex-wrap">
                        <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-gray-400" /> Est. #{req.establishmentId}</span>
                        {req.startDate && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-400" /> {req.startDate}</span>}
                        {req.guests && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-gray-400" /> {req.guests} huéspedes</span>}
                        {req.totalPrice && <span className="flex items-center gap-1 text-emerald-600 font-bold"><DollarSign className="w-3 h-3" /> ${req.totalPrice}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-gray-400 font-bold hidden sm:block">
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString("es-VE") : "—"}
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="border-t bg-slate-50/50 p-5 space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-600">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Contacto del cliente</p>
                          <div className="space-y-1.5">
                            {req.userEmail && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gray-400" /> {req.userEmail}</p>}
                            {req.userPhone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" /> {req.userPhone}</p>}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Detalles del Servicio</p>
                          <div className="space-y-1">
                            {req.endDate && <p>Salida (Check-out): {req.endDate}</p>}
                            {req.commissionAmount && <p>Comisión HDV: ${req.commissionAmount} ({req.commissionRate}%)</p>}
                          </div>
                        </div>
                        {req.message && (
                          <div className="sm:col-span-2">
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-gray-400" /> Mensaje / Requerimientos Especiales</p>
                            <p className="bg-white rounded-xl p-3 border border-gray-200 text-gray-700 font-semibold">{req.message}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                        {req.status === "pendiente" && (
                          <>
                            <button
                              disabled={updateStatus.isPending}
                              onClick={() => updateStatus.mutate({ id: req.id, status: "confirmado" })}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-green-500 hover:bg-green-600 transition-colors border border-green-600 cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Confirmar
                            </button>
                            <button
                              disabled={updateStatus.isPending}
                              onClick={() => updateStatus.mutate({ id: req.id, status: "cancelado" })}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Rechazar / Cancelar
                            </button>
                          </>
                        )}
                        {req.status === "confirmado" && (
                          <button
                            disabled={updateStatus.isPending}
                            onClick={() => updateStatus.mutate({ id: req.id, status: "completado" })}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors border border-indigo-600 cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Marcar completado
                          </button>
                        )}
                        {req.userPhone && (
                          <a href={`https://wa.me/${req.userPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer">
                              📱 Chat WhatsApp
                            </button>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
