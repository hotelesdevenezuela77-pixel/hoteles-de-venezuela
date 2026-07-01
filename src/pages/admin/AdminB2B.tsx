import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { Repeat2, ShoppingBag, DollarSign, Loader2, ArrowUpDown } from "lucide-react";

interface B2BTransaction {
  id: number;
  bookingId: number;
  totalAmount: number;
  commissionRate: number;
  commissionAmount: number;
  businessAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentReference: string;
  createdAt: string;
}

interface BookingRequest {
  id: number;
  userName: string;
  userEmail: string;
  startDate: string;
  endDate: string;
  guests: number;
  status: string;
  totalPrice: number;
  commissionAmount: number;
  commissionRate: number;
  paymentStatus: string;
  createdAt: string;
}

const STATUS_STYLE: Record<string, string> = {
  pending: "text-amber-700 bg-amber-50 border border-amber-200",
  confirmed: "text-emerald-700 bg-emerald-50 border border-emerald-200",
  completed: "text-cyan-700 bg-cyan-50 border border-cyan-200",
  cancelled: "text-red-700 bg-red-50 border border-red-200",
  paid: "text-emerald-700 bg-emerald-50 border border-emerald-200",
  unpaid: "text-gray-500 bg-gray-55 border",
};

export function AdminB2B() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, nav] = useLocation();

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      nav("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Query B2B transactions
  const { data: rawTx = [], isLoading: loadingTx } = useQuery<any[]>({
    queryKey: ["admin-b2b-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("b2b_transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase query failed for b2b_transactions:", error);
      }

      const localTxKey = "hdv_mock_b2b_transactions";
      const localTx = JSON.parse(localStorage.getItem(localTxKey) || "[]");
      const combined = [...(data || []), ...localTx];

      return combined.map((t: any) => ({
        id: t.id,
        bookingId: t.booking_id ?? t.bookingId ?? 0,
        totalAmount: Number(t.total_amount ?? t.totalAmount ?? 0),
        commissionRate: Number(t.commission_rate ?? t.commissionRate ?? 10),
        commissionAmount: Number(t.commission_amount ?? t.commissionAmount ?? 0),
        businessAmount: Number(t.business_amount ?? t.businessAmount ?? 0),
        paymentStatus: t.payment_status ?? t.paymentStatus ?? "unpaid",
        paymentMethod: t.payment_method ?? t.paymentMethod ?? "",
        paymentReference: t.payment_reference ?? t.paymentReference ?? "",
        createdAt: t.created_at ?? t.createdAt ?? new Date().toISOString()
      }));
    }
  });

  // Query Booking requests
  const { data: rawRequests = [], isLoading: loadingReq } = useQuery<any[]>({
    queryKey: ["admin-b2b-booking-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase query failed for booking_requests:", error);
      }

      const localReqKey = "hdv_mock_booking_requests";
      const localReq = JSON.parse(localStorage.getItem(localReqKey) || "[]");
      const combined = [...(data || []), ...localReq];

      return combined.map((r: any) => ({
        id: r.id,
        userName: r.user_name ?? r.userName ?? "Huésped B2B",
        userEmail: r.user_email ?? r.userEmail ?? "",
        startDate: r.start_date ?? r.startDate ?? "",
        endDate: r.end_date ?? r.endDate ?? "",
        guests: Number(r.guests ?? 1),
        status: r.status ?? "pending",
        totalPrice: Number(r.total_price ?? r.totalPrice ?? 0),
        commissionAmount: Number(r.commission_amount ?? r.commissionAmount ?? 0),
        commissionRate: Number(r.commission_rate ?? r.commissionRate ?? 10),
        paymentStatus: r.payment_status ?? r.paymentStatus ?? "unpaid",
        createdAt: r.created_at ?? r.createdAt ?? new Date().toISOString()
      }));
    }
  });

  const transactions = rawTx;
  const requests = rawRequests;

  const totalRevenue = transactions.reduce((s, t) => s + t.totalAmount, 0);
  const totalCommissions = transactions.reduce((s, t) => s + t.commissionAmount, 0);

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
        <div className="max-w-6xl mx-auto px-6 relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-pink-500/20">
              <Repeat2 className="w-4.5 h-4.5 text-pink-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Transacciones B2B</h1>
              <p className="text-white/50 text-xs font-semibold">Concilia reservas directas y comisiones generadas por hoteles afiliados</p>
            </div>
          </div>
        </div>
      </div>

      <AdminTabBar />

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Transacciones", value: transactions.length.toString(), icon: Repeat2, color: "#9B00CC", bg: "rgba(155,0,204,0.08)" },
            { label: "Solicitudes directas", value: requests.length.toString(), icon: ShoppingBag, color: "#00C8D4", bg: "rgba(0,200,212,0.08)" },
            { label: "Volumen B2B total", value: `$${totalRevenue.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "#10B981", bg: "rgba(16,185,129,0.08)" },
            { label: "Comisiones netas", value: `$${totalCommissions.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "#FF0096", bg: "rgba(255,0,150,0.08)" },
          ].map((k, i) => {
            const Icon = k.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: k.bg }}>
                  <Icon className="w-5 h-5" style={{ color: k.color }} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{k.label}</p>
                  <p className="text-lg font-black text-gray-900 mt-0.5">{k.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Requests */}
          <div className="space-y-4">
            <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-pink-500" /> Solicitudes de Reserva
            </h2>
            {loadingReq ? (
              <div className="bg-white rounded-2xl border p-12 text-center text-gray-400 text-xs font-bold shadow-xs">Cargando solicitudes...</div>
            ) : requests.length === 0 ? (
              <div className="bg-white border rounded-2xl py-12 text-center text-gray-400 text-xs font-bold shadow-xs">Sin solicitudes registradas</div>
            ) : (
              <div className="space-y-3">
                {requests.map((r: BookingRequest) => (
                  <div key={r.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${STATUS_STYLE[r.status] || "bg-gray-100"}`}>{r.status}</span>
                          <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${STATUS_STYLE[r.paymentStatus] || "bg-gray-100"}`}>{r.paymentStatus}</span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm mt-2">{r.userName}</h4>
                        <p className="text-[10px] text-gray-400 font-semibold">{r.userEmail}</p>
                        <p className="text-[10px] text-gray-500 font-bold mt-2">
                          {r.startDate} → {r.endDate} · {r.guests} huésped{r.guests !== 1 ? "es" : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-900 text-sm">${r.totalPrice.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</p>
                        {r.commissionAmount > 0 && (
                          <p className="text-[10px] text-emerald-600 font-bold mt-1">Comisión: ${r.commissionAmount.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transactions */}
          <div className="space-y-4">
            <h2 className="text-sm font-black text-gray-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" /> Transacciones de Comisión
            </h2>
            {loadingTx ? (
              <div className="bg-white rounded-2xl border p-12 text-center text-gray-400 text-xs font-bold shadow-xs">Cargando transacciones...</div>
            ) : transactions.length === 0 ? (
              <div className="bg-white border rounded-2xl py-12 text-center text-gray-400 text-xs font-bold shadow-xs">Sin transacciones conciliadas</div>
            ) : (
              <div className="space-y-3">
                {transactions.map((t: B2BTransaction) => (
                  <div key={t.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${STATUS_STYLE[t.paymentStatus] || "bg-gray-100"}`}>{t.paymentStatus}</span>
                        <h4 className="font-bold text-gray-900 text-sm mt-2">Conciliación Reserva #{t.bookingId}</h4>
                        {t.paymentMethod && (
                          <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase">
                            {t.paymentMethod} {t.paymentReference ? `· REF: ${t.paymentReference}` : ""}
                          </p>
                        )}
                        <p className="text-[9px] text-gray-450 font-bold mt-1">{new Date(t.createdAt).toLocaleDateString("es-VE")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-gray-900 text-sm">${t.totalAmount.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</p>
                        <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Com: ${t.commissionAmount.toFixed(2)} ({t.commissionRate}%)</p>
                        <p className="text-[9px] text-gray-400 font-bold">Líquido negocio: ${t.businessAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
