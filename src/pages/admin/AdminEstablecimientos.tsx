import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import {
  PlusCircle, Search, Building2, Eye, Edit2, Trash2,
  Star, Award, Calendar, Megaphone, MessageSquare,
  CheckCircle, Clock, XCircle, MapPin, Mail, Loader2
} from "lucide-react";

interface AdminEst {
  id: number;
  name: string;
  slug: string;
  status: string;
  isFeatured: boolean | null;
  hasHdvSeal: boolean | null;
  hasReservationsEnabled: boolean | null;
  isAdsEnabled: boolean | null;
  membershipTier: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  whatsapp: string | null;
  ownerEmail: string;
  ratingAvg: number | null;
  reviewCount: number | null;
  createdAt: string | null;
  categoryName: string | null;
  destinationName: string | null;
}

const C = { fucsia: "#FF0096" };

const STATUS_NEXT: Record<string, string> = {
  approved: "pending",
  pending: "rejected",
  rejected: "approved",
};

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string; label: string; Icon: typeof CheckCircle }> = {
  approved: { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0", label: "Aprobado",  Icon: CheckCircle },
  pending:  { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", label: "Pendiente", Icon: Clock       },
  rejected: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", label: "Rechazado", Icon: XCircle     },
};

const STATUS_TABS = [
  { id: "",         label: "Todos"      },
  { id: "pending",  label: "Pendientes" },
  { id: "approved", label: "Aprobados"  },
  { id: "rejected", label: "Rechazados" },
];

function FeaturePill({
  active, activeColor, activeBg, icon: Icon, label, onClick, disabled,
}: {
  active: boolean; activeColor: string; activeBg: string;
  icon: typeof Star; label: string; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-101 border cursor-pointer disabled:opacity-40"
      style={{
        background: active ? activeBg : "#F1F5F9",
        color: active ? activeColor : "#94A3B8",
        borderColor: active ? activeColor + "30" : "#E2E8F0",
      }}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}

export function AdminEstablecimientos() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const qc = useQueryClient();

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  const { data: ests = [], isLoading } = useQuery<AdminEst[]>({
    queryKey: ["admin-establishments", search, statusTab],
    queryFn: async () => {
      const { data: estData, error: estErr } = await supabase
        .from("establishments")
        .select(`
          id, name, slug, status, is_featured, has_hdv_seal, 
          has_reservations_enabled, is_ads_enabled, membership_tier, 
          city, state, phone, whatsapp, owner_user_id, rating_avg, 
          review_count, created_at,
          categories (name),
          destinations (name)
        `)
        .order("created_at", { ascending: false });

      if (estErr) throw estErr;

      const { data: profilesData } = await supabase
        .from("user_profiles")
        .select("user_id, email");

      const emailMap = new Map((profilesData || []).map(p => [p.user_id, p.email]));

      const mapped: AdminEst[] = (estData || []).map(est => {
        const catName = est.categories ? (est.categories as any).name : null;
        const destName = est.destinations ? (est.destinations as any).name : null;

        return {
          id: est.id,
          name: est.name,
          slug: est.slug,
          status: est.status,
          isFeatured: est.is_featured,
          hasHdvSeal: est.has_hdv_seal,
          hasReservationsEnabled: est.has_reservations_enabled,
          isAdsEnabled: est.is_ads_enabled,
          membershipTier: est.membership_tier,
          city: est.city || destName,
          state: est.state,
          phone: est.phone,
          whatsapp: est.whatsapp,
          ownerEmail: emailMap.get(est.owner_user_id) || est.owner_user_id || "Propietario",
          ratingAvg: est.rating_avg,
          reviewCount: est.review_count,
          createdAt: est.created_at,
          categoryName: catName,
          destinationName: destName
        };
      });

      let filtered = mapped;
      if (statusTab) {
        filtered = filtered.filter(e => e.status === statusTab);
      }
      if (search) {
        const lower = search.toLowerCase();
        filtered = filtered.filter(e => 
          e.name.toLowerCase().includes(lower) || 
          (e.categoryName && e.categoryName.toLowerCase().includes(lower)) || 
          e.ownerEmail.toLowerCase().includes(lower)
        );
      }
      return filtered;
    }
  });

  const patchMut = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, any> }) => {
      const mappedData: Record<string, any> = {};
      if ("status" in data) {
        mappedData.status = data.status;
        if (data.status !== "approved") {
          mappedData.homepage_priority = null;
          mappedData.is_featured = false;
        }
      }
      if ("isFeatured" in data) mappedData.is_featured = data.isFeatured;
      if ("hasHdvSeal" in data) mappedData.has_hdv_seal = data.hasHdvSeal;
      if ("hasReservationsEnabled" in data) mappedData.has_reservations_enabled = data.hasReservationsEnabled;
      if ("isAdsEnabled" in data) mappedData.is_ads_enabled = data.isAdsEnabled;

      const { error } = await supabase
        .from("establishments")
        .update(mappedData)
        .eq("id", id);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-establishments"] });
    }
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("establishments")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-establishments"] });
    }
  });

  const pending = ests.filter((e) => e.status === "pending").length;

  const patch = (id: number, fields: Record<string, any>) =>
    patchMut.mutate({ id, data: fields });

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
      <div className="relative overflow-hidden py-8" style={{ background: "linear-gradient(135deg, #0e0120, #1a0533)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#FF0096" }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-brand-magenta/20">
              <Building2 className="w-4 h-4 text-brand-magenta" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Establecimientos</h1>
              <p className="text-white/50 text-xs font-semibold">
                {ests.length} mostrados · {pending} pendientes de revisión
              </p>
            </div>
          </div>
          <Link href="/admin/establecimientos/nuevo">
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold border border-pink-700 cursor-pointer transition-transform hover:scale-102"
              style={{ background: "linear-gradient(90deg, #FF0096, #9B00CC)" }}
            >
              <PlusCircle className="w-4 h-4" /> Agregar Establecimiento
            </button>
          </Link>
        </div>
      </div>

      <AdminTabBar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_TABS.map((t) => {
              const active = statusTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setStatusTab(t.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer"
                  style={{
                    background: active ? `linear-gradient(135deg, ${C.fucsia}, #D80073)` : "white",
                    color: active ? "white" : "#64748b",
                    borderColor: active ? C.fucsia : "#e2e8f0"
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Buscar por nombre, categoria o dueño..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-purple-400 font-semibold"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-24 w-full bg-white border border-gray-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : ests.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-xs">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-bold text-sm">Sin resultados</p>
            <p className="text-gray-400 text-xs mt-1">No se encontraron establecimientos con los criterios seleccionados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ests.map((est) => {
              const st = STATUS_STYLE[est.status] ?? STATUS_STYLE.pending;
              const StatusIcon = st.Icon;
              const busy = patchMut.isPending;
              const deleting = confirmDelete === est.id;

              return (
                <div
                  key={est.id}
                  className="bg-white rounded-2xl p-5 border shadow-xs transition-shadow hover:shadow-sm"
                  style={{ borderColor: deleting ? "#FECACA" : "#E2E8F0" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{ background: `${st.color}15`, borderColor: `${st.color}30` }}
                    >
                      <Building2 className="w-5 h-5" style={{ color: st.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="font-bold text-gray-900 text-base leading-tight">{est.name}</div>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {est.categoryName && (
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
                                {est.categoryName}
                              </span>
                            )}
                            {(est.city || est.state) && (
                              <span className="text-[11px] text-gray-500 font-semibold flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {[est.city, est.state].filter(Boolean).join(", ")}
                              </span>
                            )}
                            <span className="text-[11px] text-gray-500 font-semibold flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {est.ownerEmail}
                            </span>
                            {est.createdAt && (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {new Date(est.createdAt).toLocaleDateString("es-VE")}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => patch(est.id, { status: STATUS_NEXT[est.status] ?? "pending" })}
                          disabled={busy}
                          title="Click para cambiar estado"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-102 border cursor-pointer disabled:opacity-50 shrink-0"
                          style={{ background: st.bg, color: st.color, borderColor: st.border }}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{st.label}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-4 flex-wrap border-t border-slate-100 pt-3">
                        <FeaturePill
                          active={!!est.isFeatured} activeColor="#D97706" activeBg="#FEF3C7"
                          icon={Star} label="Destacado"
                          onClick={() => patch(est.id, { isFeatured: !est.isFeatured })}
                          disabled={busy}
                        />
                        <FeaturePill
                          active={!!est.hasHdvSeal} activeColor="#FF0096" activeBg="#FCE7F3"
                          icon={Award} label="Sello HDV"
                          onClick={() => patch(est.id, { hasHdvSeal: !est.hasHdvSeal })}
                          disabled={busy}
                        />
                        <FeaturePill
                          active={!!est.hasReservationsEnabled} activeColor="#00A3C4" activeBg="#E0FDFE"
                          icon={Calendar} label="Reservas"
                          onClick={() => patch(est.id, { hasReservationsEnabled: !est.hasReservationsEnabled })}
                          disabled={busy}
                        />
                        <FeaturePill
                          active={!!est.isAdsEnabled} activeColor="#7C3AED" activeBg="#F5F3FF"
                          icon={Megaphone} label="Ads"
                          onClick={() => patch(est.id, { isAdsEnabled: !est.isAdsEnabled })}
                          disabled={busy}
                        />

                        <div className="flex-grow" />

                        <div className="flex items-center gap-1.5 self-end mt-2 sm:mt-0">
                          <Link href={`/establecimiento/${est.slug}`}>
                            <button
                              className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-200 hover:bg-slate-100 cursor-pointer"
                              title="Ver establecimiento en vivo"
                            >
                              <Eye className="w-4 h-4 text-gray-500" />
                            </button>
                          </Link>

                          {(est.whatsapp || est.phone) && (
                            <a
                              href={`https://wa.me/${(est.whatsapp || est.phone)?.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <button
                                className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-200 hover:bg-emerald-50 cursor-pointer"
                                title="Chat WhatsApp"
                              >
                                <MessageSquare className="w-4 h-4 text-gray-500 hover:text-emerald-600" />
                              </button>
                            </a>
                          )}

                          <Link href={`/admin/establecimientos/${est.id}/editar`}>
                            <button
                              className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-200 hover:bg-amber-50 cursor-pointer"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-gray-500 hover:text-amber-600" />
                            </button>
                          </Link>

                          {!deleting ? (
                            <button
                              className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-200 hover:bg-red-50 cursor-pointer"
                              title="Eliminar"
                              onClick={() => setConfirmDelete(est.id)}
                            >
                              <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 bg-red-50 border border-red-200 p-0.5 rounded-lg">
                              <button
                                className="px-2 py-1 rounded bg-red-600 text-white text-[10px] font-bold cursor-pointer"
                                onClick={() => { deleteMut.mutate(est.id); setConfirmDelete(null); }}
                                disabled={deleteMut.isPending}
                              >
                                Sí
                              </button>
                              <button
                                className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                                onClick={() => setConfirmDelete(null)}
                              >
                                No
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}