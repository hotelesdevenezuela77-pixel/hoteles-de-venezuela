import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { supabase } from "@/lib/supabase";
import {
  Package, CheckCircle, XCircle, Clock, Search,
  Phone, Mail, Users, Calendar, DollarSign,
  ChevronDown, ChevronUp, MessageSquare, Loader2
} from "lucide-react";

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pendiente",  color: "#F59E0B", bg: "rgba(245,158,11,0.1)"  },
  confirmed: { label: "Confirmado", color: "#22C55E", bg: "rgba(34,197,94,0.1)"   },
  cancelled: { label: "Cancelado",  color: "#EF4444", bg: "rgba(239,68,68,0.1)"   },
  completed: { label: "Completado", color: "#6366F1", bg: "rgba(99,102,241,0.1)"  },
};

const PAY: Record<string, { label: string; color: string }> = {
  pending:   { label: "Pendiente", color: "#F59E0B" },
  paid:      { label: "Pagado",    color: "#22C55E" },
  refunded:  { label: "Reembolso", color: "#6366F1" },
};

export function AdminReservasPaquetes() {
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

  // Query to fetch package bookings
  const { data: bookings = [], isLoading: loading } = useQuery<any[]>({
    queryKey: ["admin-package-bookings"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("tour_package_bookings")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;

        const mapped = (data || []).map((b: any) => ({
          id: b.id,
          status: b.status || "pending",
          paymentStatus: b.payment_status || b.paymentStatus || "pending",
          packageId: b.package_id || b.packageId,
          travelDate: b.travel_date || b.travelDate,
          personsCount: b.persons_count || b.personsCount || 1,
          totalPrice: b.total_price || b.totalPrice || 0,
          guestName: b.guest_name || b.guestName || "Turista",
          guestEmail: b.guest_email || b.guestEmail,
          guestPhone: b.guest_phone || b.guestPhone,
          specialRequests: b.special_requests || b.specialRequests,
          cancellationReason: b.cancellation_reason || b.cancellationReason,
          confirmedAt: b.confirmed_at || b.confirmedAt,
          createdAt: b.created_at || b.createdAt
        }));

        const localBookKey = "hdv_mock_package_bookings";
        const localBookings = JSON.parse(localStorage.getItem(localBookKey) || "[]");
        return [...mapped, ...localBookings];
      } catch (err) {
        const localBookKey = "hdv_mock_package_bookings";
        const localBookings = JSON.parse(localStorage.getItem(localBookKey) || "[]");
        if (localBookings.length === 0) {
          const defaults = [
            { id: 1, guestName: "Carlos Rivas", guestEmail: "carlos@gmail.com", guestPhone: "+584242223344", status: "pending", paymentStatus: "pending", packageId: 10, travelDate: "2026-08-10", personsCount: 4, totalPrice: 800, specialRequests: "Requerimos guía bilingüe.", createdAt: new Date().toISOString() },
            { id: 2, guestName: "Ana Silva", guestEmail: "ana@yahoo.com", guestPhone: "+584128889900", status: "confirmed", paymentStatus: "paid", packageId: 12, travelDate: "2026-07-15", personsCount: 2, totalPrice: 600, specialRequests: "", createdAt: new Date().toISOString() },
          ];
          localStorage.setItem(localBookKey, JSON.stringify(defaults));
          return defaults;
        }
        return localBookings;
      }
    },
    staleTime: 15000,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, ownerNotes }: { id: number; status: string; ownerNotes?: string }) => {
      const localBookKey = "hdv_mock_package_bookings";
      const localBookings = JSON.parse(localStorage.getItem(localBookKey) || "[]");
      const isMock = localBookings.some((b: any) => b.id === id);

      if (isMock) {
        const updated = localBookings.map((b: any) => b.id === id ? { ...b, status, ownerNotes, confirmedAt: status === "confirmed" ? new Date().toISOString() : b.confirmedAt } : b);
        localStorage.setItem(localBookKey, JSON.stringify(updated));
        return { success: true };
      }

      try {
        const { error } = await supabase
          .from("tour_package_bookings")
          .update({ status, owner_notes: ownerNotes, confirmed_at: status === "confirmed" ? new Date().toISOString() : null })
          .eq("id", id);
        if (error) throw error;
      } catch (err) {
        const updated = localBookings.map((b: any) => b.id === id ? { ...b, status, ownerNotes, confirmedAt: status === "confirmed" ? new Date().toISOString() : b.confirmedAt } : b);
        localStorage.setItem(localBookKey, JSON.stringify(updated));
      }
      return { success: true };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-package-bookings"] }),
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
        <p className="text-gray-500 text-xs font-bold">Verificando credenciales de seguridad...</p>
      </div>
    );
  }

  const filtered = bookings.filter(b => {
    const matchStatus = filterStatus === "todos" || b.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || (b.guestName ?? "").toLowerCase().includes(q) ||
      (b.guestEmail ?? "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts: Record<string, number> = { todos: bookings.length };
  bookings.forEach(b => { counts[b.status] = (counts[b.status] ?? 0) + 1; });

  const totalRevenue = bookings
    .filter(b => b.status !== "cancelled")
    .reduce((s, b) => s + (b.totalPrice ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 pb-24 font-sans">
      {/* Header */}
      <div className="relative overflow-hidden py-8" style={{ background: "linear-gradient(135deg, #0e0120, #1a0533)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#00C8D4" }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-cyan-500/20">
              <Package className="w-4.5 h-4.5 text-cyan-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Reservas de Paquetes</h1>
              <p className="text-white/50 text-xs font-semibold">{bookings.length} reservas registradas</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Ingresos Activos</p>
            <p className="text-xl font-black text-green-400">${totalRevenue.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <AdminTabBar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {Object.entries(STATUS).map(([key, st]) => (
            <div key={key} className="bg-white rounded-2xl border border-gray-200 p-4 text-center shadow-xs">
              <p className="text-xl font-black" style={{ color: st.color }}>{counts[key] ?? 0}</p>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mt-1">{st.label}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            {["todos", ...Object.keys(STATUS)].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${filterStatus === s ? "text-white border-transparent" : "bg-white text-gray-655 border-gray-200"}`}
                style={filterStatus === s ? { background: s === "todos" ? "#1a0533" : STATUS[s]?.color ?? "#1a0533" } : {}}
              >
                {s === "todos" ? `Todos (${bookings.length})` : `${STATUS[s].label} (${counts[s] ?? 0})`}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Buscar por nombre..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-pink-500 font-semibold"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="py-20 text-center text-gray-400 text-xs font-bold">Cargando reservas...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-20 text-center shadow-xs">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400 text-xs font-bold">Sin reservas de paquetes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((b: any) => {
              const st = STATUS[b.status] ?? STATUS.pending;
              const pay = PAY[b.paymentStatus] ?? PAY.pending;
              const isOpen = expanded === b.id;
              return (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                    onClick={() => setExpanded(isOpen ? null : b.id)}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: st.bg }}>
                      <Package className="w-4.5 h-4.5" style={{ color: st.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">{b.guestName ?? "Sin nombre"}</span>
                        <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}30` }} className="text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {st.label}
                        </span>
                        <span style={{ background: `${pay.color}15`, color: pay.color }} className="text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {pay.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 font-semibold flex-wrap">
                        <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5 text-gray-400" /> Paquete #{b.packageId}</span>
                        {b.travelDate && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-400" /> {b.travelDate}</span>}
                        {b.personsCount && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-gray-400" /> {b.personsCount} personas</span>}
                        {b.totalPrice && <span className="flex items-center gap-1 text-emerald-605 font-bold"><DollarSign className="w-3 h-3" /> ${b.totalPrice}</span>}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t bg-slate-50/50 p-5 space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-600">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Contacto</p>
                          <div className="space-y-1.5">
                            {b.guestEmail && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gray-400" /> {b.guestEmail}</p>}
                            {b.guestPhone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" /> {b.guestPhone}</p>}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Detalles</p>
                          <div className="space-y-1">
                            <p>ID Reserva: #{b.id}</p>
                            {b.confirmedAt && <p>Confirmado en: {new Date(b.confirmedAt).toLocaleDateString("es-VE")}</p>}
                            {b.cancellationReason && <p className="text-red-500">Motivo de cancelación: {b.cancellationReason}</p>}
                          </div>
                        </div>
                        {b.specialRequests && (
                          <div className="sm:col-span-2">
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-gray-400" /> Solicitudes especiales</p>
                            <p className="bg-white rounded-xl p-3 border border-gray-200 text-gray-700 font-semibold">{b.specialRequests}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                        {b.status === "pending" && (
                          <>
                            <button
                              disabled={updateStatus.isPending}
                              onClick={() => updateStatus.mutate({ id: b.id, status: "confirmed" })}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-green-500 hover:bg-green-600 transition-colors border border-green-650 cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Confirmar
                            </button>
                            <button
                              disabled={updateStatus.isPending}
                              onClick={() => updateStatus.mutate({ id: b.id, status: "cancelled" })}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-550 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Cancelar
                            </button>
                          </>
                        )}
                        {b.status === "confirmed" && (
                          <button
                            disabled={updateStatus.isPending}
                            onClick={() => updateStatus.mutate({ id: b.id, status: "completed" })}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-650 transition-colors border border-indigo-650 cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Completado
                          </button>
                        )}
                        {b.guestPhone && (
                          <a href={`https://wa.me/${b.guestPhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer">
                              📱 WhatsApp
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
