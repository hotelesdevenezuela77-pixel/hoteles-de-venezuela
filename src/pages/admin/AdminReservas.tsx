import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { CalendarDays, CheckCircle, XCircle, Phone, Mail, Inbox, RefreshCw, Send, AlertCircle, Loader2, Clock } from "lucide-react";

interface Reservation {
  id: number;
  establishmentId: number;
  establishmentName: string | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number | null;
  totalPrice: string | null;
  status: string | null;
  notes: string | null;
  createdAt: string;
  roomType?: string;
}

interface AbandonedBooking {
  id: number;
  establishment_id: number;
  establishment_name: string;
  room_id: number;
  room_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  total_price: number;
  session_id: string;
  created_at: string;
  recovery_email_sent_at: string | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pendiente",  color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  confirmed: { label: "Confirmada", color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  cancelled: { label: "Cancelada",  color: "#EF4444", bg: "rgba(239,68,68,0.12)"  },
  completed: { label: "Completada", color: "#00C8D4", bg: "rgba(0,200,212,0.12)"  },
};

export function AdminReservas() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const qc = useQueryClient();

  // Navigation tab inside Reservas page
  const [subTab, setSubTab] = useState<"activas" | "abandonadas">("activas");

  // Filters for active bookings
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Toast notification simulation
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      nav("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // 1. Fetch active reservations from Supabase
  const { data: rawReservations = [], isLoading: loadingReservations } = useQuery<Reservation[]>({
    queryKey: ["admin-reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          id, status, total_price, check_in_date, check_out_date, 
          guest_name, guest_email, guest_phone, establishment_id, room_type,
          created_at,
          establishments (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Merge with mock reservations
      const localResKey = "hdv_mock_reservations";
      const localRes = JSON.parse(localStorage.getItem(localResKey) || "[]");
      const mappedLocal = localRes.map((r: any) => ({
        id: r.id,
        status: r.status || "pending",
        totalPrice: String(r.total_price || ""),
        checkInDate: r.check_in_date,
        checkOutDate: r.check_out_date,
        guestName: r.guest_name,
        guestEmail: r.guest_email || "",
        guestPhone: r.guest_phone || "",
        establishmentId: r.establishment_id,
        establishmentName: r.establishment_name || "Establecimiento Muestra",
        roomType: r.room_type || "Habitación Standard",
        createdAt: r.created_at || new Date().toISOString()
      }));

      const combined = (data || []).map((r: any) => ({
        id: r.id,
        establishmentId: r.establishment_id,
        establishmentName: r.establishments ? r.establishments.name : `Hotel #${r.establishment_id}`,
        guestName: r.guest_name,
        guestEmail: r.guest_email || "",
        guestPhone: r.guest_phone || null,
        checkInDate: r.check_in_date,
        checkOutDate: r.check_out_date,
        guestsCount: null,
        totalPrice: r.total_price ? String(r.total_price) : null,
        status: r.status,
        notes: null,
        createdAt: r.created_at
      }));

      return [...combined, ...mappedLocal].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  });

  // 2. Fetch abandoned bookings from Supabase
  const { data: abandonedBookings = [], isLoading: loadingAbandoned } = useQuery<AbandonedBooking[]>({
    queryKey: ["admin-abandoned-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("abandoned_bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Local storage mock
      const localAbKey = "hdv_mock_abandoned_bookings";
      const localAban = JSON.parse(localStorage.getItem(localAbKey) || "[]");
      const combined = [...(data || []), ...localAban];
      return combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  });

  // Mutation to update reservation status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      // If it's a mock reservation (starts with 999 or similar custom logic)
      if (id >= 10000) {
        const localResKey = "hdv_mock_reservations";
        const localRes = JSON.parse(localStorage.getItem(localResKey) || "[]");
        const updated = localRes.map((r: any) => r.id === id ? { ...r, status } : r);
        localStorage.setItem(localResKey, JSON.stringify(updated));
        return { success: true };
      }

      const { error } = await supabase
        .from("reservations")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reservations"] });
      showToast("Estado de la reservación actualizado correctamente.");
    }
  });

  // Mutation to send recovery email (mock trigger)
  const sendRecoveryEmail = useMutation({
    mutationFn: async (id: number) => {
      const now = new Date().toISOString();

      // Check local storage mock abandoned bookings
      const localAbKey = "hdv_mock_abandoned_bookings";
      const localAban = JSON.parse(localStorage.getItem(localAbKey) || "[]");
      const hasLocal = localAban.some((b: any) => b.id === id);

      if (hasLocal) {
        const updated = localAban.map((b: any) => b.id === id ? { ...b, recovery_email_sent_at: now } : b);
        localStorage.setItem(localAbKey, JSON.stringify(updated));
        return { success: true };
      }

      const { error } = await supabase
        .from("abandoned_bookings")
        .update({ recovery_email_sent_at: now })
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-abandoned-bookings"] });
      showToast("Simulación de correo de recuperación enviado con éxito.");
    }
  });

  // Active reservations filtering
  const filteredReservations = useMemo(() => {
    let result = rawReservations;
    if (statusFilter) {
      result = result.filter(r => r.status === statusFilter);
    }
    if (fromDate) {
      result = result.filter(r => r.checkInDate >= fromDate);
    }
    if (toDate) {
      result = result.filter(r => r.checkOutDate <= toDate);
    }
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.guestName.toLowerCase().includes(lower) || 
        r.guestEmail.toLowerCase().includes(lower) || 
        (r.establishmentName && r.establishmentName.toLowerCase().includes(lower))
      );
    }
    return result;
  }, [rawReservations, statusFilter, fromDate, toDate, searchQuery]);

  // Counts calculate
  const statCounts = useMemo(() => {
    return {
      pending:   rawReservations.filter(r => r.status === "pending").length,
      confirmed: rawReservations.filter(r => r.status === "confirmed").length,
      cancelled: rawReservations.filter(r => r.status === "cancelled").length,
      completed: rawReservations.filter(r => r.status === "completed").length,
    };
  }, [rawReservations]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
        <p className="text-gray-500 text-xs font-bold">Verificando credenciales de seguridad...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 pb-24">
      {/* Header */}
      <div className="relative overflow-hidden py-8" style={{ background: "linear-gradient(135deg, #0e0120, #1a0533)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#FF0096" }} />
        <div className="container mx-auto px-6 relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-brand-magenta/20">
              <CalendarDays className="w-5 h-5 text-brand-magenta" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Gestión de Reservas</h1>
              <p className="text-white/50 text-xs font-semibold font-medium">Administra e interactúa con todas las reservaciones en vivo</p>
            </div>
          </div>
        </div>
      </div>

      <AdminTabBar />

      {/* Local Sub-Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 flex gap-2">
          <button
            onClick={() => setSubTab("activas")}
            className="px-5 py-3.5 text-xs font-bold tracking-wider uppercase border-b-2 cursor-pointer transition-colors"
            style={{
              borderColor: subTab === "activas" ? "#FF0096" : "transparent",
              color: subTab === "activas" ? "#FF0096" : "#64748b",
            }}
          >
            Reservas Activas ({rawReservations.length})
          </button>
          <button
            onClick={() => setSubTab("abandonadas")}
            className="px-5 py-3.5 text-xs font-bold tracking-wider uppercase border-b-2 cursor-pointer transition-colors"
            style={{
              borderColor: subTab === "abandonadas" ? "#FF0096" : "transparent",
              color: subTab === "abandonadas" ? "#FF0096" : "#64748b",
            }}
          >
            Reservas Abandonadas ({abandonedBookings.length})
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Toast alerts */}
        {toastMessage && (
          <div className={`fixed bottom-6 right-6 z-50 p-4 border rounded-2xl shadow-lg flex items-center gap-3 bg-white border-green-200 text-green-700 animate-slide-in-right`}>
            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}

        {/* Tab 1: Reservas Activas */}
        {subTab === "activas" && (
          <div className="space-y-6 animate-fade-in">
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(Object.entries(statCounts) as [string, number][]).map(([key, count]) => {
                const s = STATUS_LABELS[key] ?? { label: key, color: "#94A3B8", bg: "rgba(148,163,184,0.1)" };
                return (
                  <button key={key} onClick={() => setStatusFilter(statusFilter === key ? "" : key)}
                    className="rounded-2xl p-4 text-left border cursor-pointer transition-all hover:scale-101 shadow-xs bg-white"
                    style={{ borderColor: statusFilter === key ? s.color : "#E2E8F0" }}>
                    <p className="text-2xl font-bold" style={{ color: s.color }}>{count}</p>
                    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mt-1">{s.label}</p>
                  </button>
                );
              })}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap gap-4 items-end shadow-xs">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Buscar huésped / hotel</label>
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full h-9 rounded-xl border border-gray-200 px-3 text-xs focus:outline-none focus:border-purple-400 font-semibold"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Estado</label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="h-9 border border-gray-200 rounded-xl px-3 text-xs font-bold bg-white focus:outline-none">
                  <option value="">Todos</option>
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="completed">Completada</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Check-in desde</label>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                  className="h-9 border border-gray-200 rounded-xl px-3 text-xs font-bold bg-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Check-out hasta</label>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                  className="h-9 border border-gray-200 rounded-xl px-3 text-xs font-bold bg-white focus:outline-none" />
              </div>
              {(statusFilter || fromDate || toDate || searchQuery) && (
                <button onClick={() => { setStatusFilter(""); setFromDate(""); setToDate(""); setSearchQuery(""); }}
                  className="h-9 px-4 rounded-xl border border-gray-200 text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer">
                  Limpiar
                </button>
              )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
              {loadingReservations ? (
                <div className="p-12 text-center text-gray-400 text-xs font-bold">Cargando reservaciones...</div>
              ) : filteredReservations.length === 0 ? (
                <div className="p-16 text-center">
                  <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 text-sm font-bold">Sin reservas encontradas</p>
                  <p className="text-gray-400 text-xs mt-1">No hay reservaciones que coincidan con la búsqueda actual</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 font-bold text-[10px] uppercase tracking-wider text-slate-500">
                        <th className="text-left px-5 py-3">Huésped</th>
                        <th className="text-left px-5 py-3">Establecimiento</th>
                        <th className="text-left px-5 py-3">Fechas</th>
                        <th className="text-left px-5 py-3">Total</th>
                        <th className="text-left px-5 py-3">Estado</th>
                        <th className="text-right px-5 py-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReservations.map((res) => {
                        const st = STATUS_LABELS[res.status ?? "pending"] ?? STATUS_LABELS["pending"];
                        return (
                          <tr key={res.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-b-0">
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-gray-900 text-sm">{res.guestName}</div>
                              <div className="text-[10px] text-gray-500 font-semibold flex items-center gap-1 mt-0.5">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />{res.guestEmail}
                              </div>
                              {res.guestPhone && (
                                <div className="text-[10px] text-gray-500 font-semibold flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3.5 h-3.5 text-slate-400" />{res.guestPhone}
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-gray-800 text-sm">
                                {res.establishmentName}
                              </div>
                              <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">ID: {res.establishmentId}</div>
                            </td>
                            <td className="px-5 py-3.5 font-semibold text-xs">
                              <div className="text-gray-800">{res.checkInDate?.slice(0, 10)}</div>
                              <div className="text-gray-400 flex items-center mt-0.5">→ {res.checkOutDate?.slice(0, 10)}</div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="font-black text-gray-900 text-sm">
                                {res.totalPrice
                                  ? `$${Number(res.totalPrice).toLocaleString("es-VE")}`
                                  : "—"}
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border border-white/20"
                                style={{ color: st.color, background: st.bg }}>
                                {st.label}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex justify-end gap-1.5">
                                {res.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() => updateStatus.mutate({ id: res.id, status: "confirmed" })}
                                      disabled={updateStatus.isPending}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-green-200 cursor-pointer"
                                      style={{ background: "rgba(16,185,129,0.06)", color: "#10B981" }}>
                                      <CheckCircle className="w-3.5 h-3.5" /> Confirmar
                                    </button>
                                    <button
                                      onClick={() => updateStatus.mutate({ id: res.id, status: "cancelled" })}
                                      disabled={updateStatus.isPending}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-red-200 cursor-pointer"
                                      style={{ background: "rgba(239,68,68,0.06)", color: "#EF4444" }}>
                                      <XCircle className="w-3.5 h-3.5" /> Cancelar
                                    </button>
                                  </>
                                )}
                                {res.status === "confirmed" && (
                                  <>
                                    <button
                                      onClick={() => updateStatus.mutate({ id: res.id, status: "completed" })}
                                      disabled={updateStatus.isPending}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-cyan-200 cursor-pointer"
                                      style={{ background: "rgba(0,200,212,0.06)", color: "#00C8D4" }}>
                                      <CheckCircle className="w-3.5 h-3.5" /> Completar
                                    </button>
                                    <button
                                      onClick={() => updateStatus.mutate({ id: res.id, status: "cancelled" })}
                                      disabled={updateStatus.isPending}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-red-200 cursor-pointer"
                                      style={{ background: "rgba(239,68,68,0.06)", color: "#EF4444" }}>
                                      <XCircle className="w-3.5 h-3.5" /> Cancelar
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Reservas Abandonadas */}
        {subTab === "abandonadas" && (
          <div className="space-y-6 animate-fade-in">
            {/* Abandoned recovery card summary */}
            <div className="rounded-2xl bg-white border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-slate-200 bg-slate-50">
                  <Inbox className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Consola de Recuperación de Reservas</h3>
                  <p className="text-gray-500 text-xs font-semibold leading-relaxed mt-0.5">
                    Huéspedes que ingresaron sus datos en el motor de reservas pero no completaron el pago.
                  </p>
                </div>
              </div>
              <button
                onClick={() => qc.invalidateQueries({ queryKey: ["admin-abandoned-bookings"] })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-all cursor-pointer shrink-0 align-self-end sm:align-self-center"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Actualizar Lista
              </button>
            </div>

            {/* List */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
              {loadingAbandoned ? (
                <div className="p-12 text-center text-gray-400 text-xs font-bold">Cargando reservas abandonadas...</div>
              ) : abandonedBookings.length === 0 ? (
                <div className="p-16 text-center">
                  <Inbox className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500 font-bold text-sm">No hay reservas abandonadas registradas</p>
                  <p className="text-gray-400 text-xs mt-1">El historial está limpio.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 font-bold text-[10px] uppercase tracking-wider text-slate-500">
                        <th className="text-left px-5 py-3">Huésped Potencial</th>
                        <th className="text-left px-5 py-3">Establecimiento / Habitación</th>
                        <th className="text-left px-5 py-3">Fechas Solicitadas</th>
                        <th className="text-left px-5 py-3">Monto Perdido</th>
                        <th className="text-left px-5 py-3">Recuperación</th>
                        <th className="text-right px-5 py-3">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {abandonedBookings.map((b) => {
                        const isEmailed = b.recovery_email_sent_at !== null;
                        return (
                          <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-b-0">
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-gray-900 text-sm">
                                {b.guest_email ? b.guest_email.split("@")[0] : "Huésped Anónimo"}
                              </div>
                              {b.guest_email && (
                                <div className="text-[10px] text-gray-500 font-semibold flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3.5 h-3.5 text-slate-400" />{b.guest_email}
                                </div>
                              )}
                              {b.guest_phone && (
                                <div className="text-[10px] text-gray-500 font-semibold flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3.5 h-3.5 text-slate-400" />{b.guest_phone}
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-gray-800 text-sm">
                                {b.establishment_name}
                              </div>
                              <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{b.room_name}</div>
                            </td>
                            <td className="px-5 py-3.5 font-semibold text-xs">
                              <div>{b.check_in_date}</div>
                              <div className="text-gray-400 mt-0.5">→ {b.check_out_date}</div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="font-black text-rose-600 text-sm">
                                ${b.total_price.toLocaleString("es-VE")}
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              {isEmailed ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
                                  <CheckCircle className="w-3 h-3" /> Enviado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200">
                                  <Clock className="w-3 h-3" /> Pendiente
                                </span>
                              )}
                              {b.recovery_email_sent_at && (
                                <p className="text-[9px] text-gray-400 font-bold mt-1">
                                  {new Date(b.recovery_email_sent_at).toLocaleDateString("es-VE")}
                                </p>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={() => sendRecoveryEmail.mutate(b.id)}
                                disabled={sendRecoveryEmail.isPending}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer disabled:opacity-50"
                                style={isEmailed
                                  ? { background: "#F8FAFc", color: "#94A3B8", borderColor: "#E2E8F0" }
                                  : { background: "rgba(255,0,150,0.06)", color: "#FF0096", borderColor: "rgba(255,0,150,0.2)" }}
                              >
                                <Send className="w-3.5 h-3.5" /> 
                                {isEmailed ? "Enviar otra vez" : "Enviar recuperación"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
