import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { CheckCircle, XCircle, Clock, Building2, Eye, Search, Loader2 } from "lucide-react";

interface PendingEst {
  id: number;
  name: string;
  slug: string;
  status: string;
  city: string | null;
  state: string | null;
  ownerEmail: string;
  categoryName: string | null;
  phone: string | null;
  createdAt: string | null;
}

export function AdminAprobaciones() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Query to fetch pending establishments
  const { data: ests = [], isLoading } = useQuery<PendingEst[]>({
    queryKey: ["admin-pending", search],
    queryFn: async () => {
      // 1. Fetch pending establishments
      const { data: estData, error: estErr } = await supabase
        .from("establishments")
        .select(`
          id, name, slug, status, created_at, owner_user_id,
          categories (name),
          destinations (name, state)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (estErr) throw estErr;

      // 2. Fetch profiles to link owner emails
      const { data: profilesData } = await supabase
        .from("user_profiles")
        .select("user_id, email");

      const emailMap = new Map((profilesData || []).map(p => [p.user_id, p.email]));

      const mapped: PendingEst[] = (estData || []).map(est => {
        const catName = est.categories ? (est.categories as any).name : null;
        const dest = est.destinations ? (est.destinations as any) : null;

        return {
          id: est.id,
          name: est.name,
          slug: est.slug,
          status: est.status,
          city: dest?.name || null,
          state: dest?.state || null,
          ownerEmail: emailMap.get(est.owner_user_id) || est.owner_user_id || "Propietario",
          categoryName: catName,
          phone: null,
          createdAt: est.created_at
        };
      });

      // Filter on search
      if (!search) return mapped;
      const lower = search.toLowerCase();
      return mapped.filter(e => 
        e.name.toLowerCase().includes(lower) || 
        (e.categoryName && e.categoryName.toLowerCase().includes(lower)) || 
        e.ownerEmail.toLowerCase().includes(lower)
      );
    }
  });

  // Mutation to approve/reject
  const patchMut = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const updateData: any = { status };
      if (status !== "approved") {
        updateData.homepage_priority = null;
        updateData.is_featured = false;
      }
      const { error } = await supabase
        .from("establishments")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pending"] });
    }
  });

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
      <div className="relative overflow-hidden py-8"
        style={{ background: "linear-gradient(135deg, #0e0120, #1a0533)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#FF0096" }} />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-brand-magenta/20">
              <CheckCircle className="w-4.5 h-4.5 text-brand-magenta" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Aprobaciones</h1>
              <p className="text-white/50 text-xs font-semibold">Revisa y aprueba establecimientos pendientes en la plataforma</p>
            </div>
          </div>
        </div>
      </div>

      <AdminTabBar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pendientes de revisión:</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black text-white" style={{ background: "#F59E0B" }}>
              {ests.length}
            </span>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Buscar por nombre o propietario..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-purple-400 font-semibold"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-24 w-full bg-white border border-gray-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : ests.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-200 p-16 text-center shadow-xs">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
            <p className="text-gray-500 font-bold">Todo al día</p>
            <p className="text-gray-400 text-xs mt-1">No hay establecimientos pendientes de aprobación</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ests.map((est) => (
              <div key={est.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-amber-200"
                    style={{ background: "rgba(245,158,11,0.1)" }}>
                    <Building2 className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{est.name}</div>
                    <div className="text-[11px] font-bold text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                      {est.categoryName && <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">{est.categoryName}</span>}
                      {(est.city || est.state) && <span className="text-slate-600 font-semibold">{[est.city, est.state].filter(Boolean).join(", ")}</span>}
                      <span className="text-gray-400 font-normal">· Owner: {est.ownerEmail}</span>
                    </div>
                    {est.createdAt && (
                      <div className="text-[10px] text-gray-400 font-semibold mt-1.5">
                        Registrado: {new Date(est.createdAt).toLocaleDateString("es-VE")}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <a href={`/establecimiento/${est.slug}`} target="_blank" rel="noopener noreferrer">
                    <button className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 cursor-pointer" title="Ver detalle">
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                  </a>
                  <button
                    onClick={() => patchMut.mutate({ id: est.id, status: "rejected" })}
                    disabled={patchMut.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:bg-red-50 border border-red-200 cursor-pointer disabled:opacity-50"
                    style={{ background: "rgba(239,68,68,0.05)", color: "#dc2626" }}
                  >
                    <XCircle className="w-3.5 h-3.5" /> Rechazar
                  </button>
                  <button
                    onClick={() => patchMut.mutate({ id: est.id, status: "approved" })}
                    disabled={patchMut.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 cursor-pointer border border-green-700 disabled:opacity-50"
                    style={{ background: "linear-gradient(90deg, #22c55e, #16a34a)" }}
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Aprobar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
