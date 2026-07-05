import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { 
  ArrowUpDown, 
  Star, 
  Building2, 
  Loader2, 
  Check, 
  Plus, 
  Search,
  Sparkles,
  ChevronDown,
  MapPin
} from "lucide-react";

interface Establishment {
  id: number;
  name: string;
  slug: string;
  categoryName: string;
  categorySlug: string;
  destinationName: string;
  state: string;
  status: string;
  isFeatured: boolean;
  homepagePriority: number | null;
}

export function AdminPrioridades() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      nav("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Query to fetch all establishments with their destinations and categories
  const { data: ests = [], isLoading: loading } = useQuery<Establishment[]>({
    queryKey: ["admin-establishments-all"],
    queryFn: async () => {
      const { data: estData, error: estErr } = await supabase
        .from("establishments")
        .select(`
          id, name, slug, status, is_featured, homepage_priority,
          categories (name, slug),
          destinations (name, state)
        `)
        .order("name", { ascending: true });

      if (estErr) throw estErr;

      return (estData || []).map(est => {
        const catName = est.categories ? (est.categories as any).name : "Otros";
        const catSlug = est.categories ? (est.categories as any).slug : "";
        const dest = est.destinations ? (est.destinations as any) : null;
        
        return {
          id: est.id,
          name: est.name,
          slug: est.slug,
          categoryName: catName,
          categorySlug: catSlug,
          destinationName: dest?.name || "Otros",
          state: dest?.state || dest?.name || "Otros",
          status: est.status,
          isFeatured: !!est.is_featured,
          homepagePriority: est.homepage_priority
        };
      });
    }
  });

  // Mutation to patch homepage priority toggle
  const patchPriority = useMutation({
    mutationFn: async ({ id, homepagePriority }: { id: number; homepagePriority: number | null }) => {
      const { error } = await supabase
        .from("establishments")
        .update({ homepage_priority: homepagePriority })
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-establishments-all"] });
    }
  });

  // Mutation to patch featured status
  const patchFeatured = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: number; isFeatured: boolean }) => {
      const { error } = await supabase
        .from("establishments")
        .update({ is_featured: isFeatured })
        .eq("id", id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-establishments-all"] });
    }
  });

  // Filter establishments based on search term
  const filtered = ests.filter(e => {
    const q = search.toLowerCase();
    return e.name.toLowerCase().includes(q) || 
           e.categoryName.toLowerCase().includes(q) || 
           e.destinationName.toLowerCase().includes(q) ||
           e.state.toLowerCase().includes(q);
  });

  // Sort: active homepage_priority first, then by name
  const sorted = [...filtered].sort((a, b) => {
    if (a.homepagePriority !== null && b.homepagePriority === null) return -1;
    if (a.homepagePriority === null && b.homepagePriority !== null) return 1;
    if (a.homepagePriority !== null && b.homepagePriority !== null) {
      return a.homepagePriority - b.homepagePriority;
    }
    return a.name.localeCompare(b.name);
  });

  const totalFeatured = ests.filter(e => e.isFeatured).length;
  const totalWithPriority = ests.filter(e => e.homepagePriority !== null).length;

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
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-brand-magenta/20">
              <ArrowUpDown className="w-4 h-4 text-brand-magenta" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight font-sans uppercase">Prioridades en Home</h1>
              <p className="text-white/50 text-xs font-semibold">Controla la visualización directa de tus clientes en la página principal</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: "rgba(255,0,150,0.2)", color: "#FF0096" }}>
              <Sparkles className="w-3.5 h-3.5 fill-current" /> {totalWithPriority} en home
            </span>
          </div>
        </div>
      </div>

      <AdminTabBar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Table Title and Instructions */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 backdrop-blur-md">
          <h2 className="text-white font-black text-xs uppercase tracking-widest mb-1">Mostrar en Homepage</h2>
          <p className="text-white/60 text-[11px] font-bold uppercase tracking-wider">Activa o desactiva la prioridad para destacar establecimientos en la página principal.</p>
        </div>

        {/* Search input */}
        <div className="bg-white rounded-2xl shadow-xs p-4 mb-6 border border-gray-200">
          <div className="relative w-full">
            <Search className="absolute left-4 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nombre, categoría, estado..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs text-gray-700 placeholder-gray-400 outline-none focus:border-brand-magenta focus:bg-white font-semibold transition-all"
            />
          </div>
        </div>

        {/* Table of Establishments */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-20 text-center shadow-xs">
            <Loader2 className="w-10 h-10 animate-spin text-brand-magenta mx-auto mb-3" />
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Cargando establecimientos...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-20 text-center shadow-xs">
            <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">No se encontraron establecimientos</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs mb-8">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-center px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider w-24">Élite</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Establecimiento</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Categoría</th>
                    <th className="text-center px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider w-28">Boutique</th>
                    <th className="text-center px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider w-36">Ficha Destacada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sorted.map(item => (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50/50 transition-colors ${item.homepagePriority !== null ? "bg-emerald-50/20" : ""}`}
                    >
                      <td className="px-6 py-4 text-center">
                        {(item.categorySlug === 'hoteles' || item.categorySlug === 'complejos') ? (
                          <button
                            onClick={() => patchPriority.mutate({ 
                              id: item.id, 
                              homepagePriority: item.homepagePriority !== null ? null : 1 
                            })}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer mx-auto ${
                              item.homepagePriority !== null 
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-100 hover:bg-emerald-600" 
                                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                            }`}
                            title={item.homepagePriority !== null ? "Quitar de Hospedajes Élite" : "Destacar en Hospedajes Élite"}
                          >
                            {item.homepagePriority !== null ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </button>
                        ) : (
                          <span className="text-slate-300 text-xs font-semibold">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-[#9B00CC]" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-800 text-xs block leading-snug">{item.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wide flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#00C8D4]" />
                              {item.state}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{item.categoryName || "-"}</td>
                      <td className="px-6 py-4 text-center">
                        {item.categorySlug === 'posadas' ? (
                          <button
                            onClick={() => patchPriority.mutate({ 
                              id: item.id, 
                              homepagePriority: item.homepagePriority !== null ? null : 1 
                            })}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer mx-auto ${
                              item.homepagePriority !== null 
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-100 hover:bg-emerald-600" 
                                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                            }`}
                            title={item.homepagePriority !== null ? "Quitar de Boutique & Encanto" : "Destacar en Boutique & Encanto"}
                          >
                            {item.homepagePriority !== null ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </button>
                        ) : (
                          <span className="text-slate-300 text-xs font-semibold">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => patchFeatured.mutate({
                            id: item.id,
                            isFeatured: !item.isFeatured
                          })}
                          className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full cursor-pointer transition-all duration-200 shadow-sm ${
                            item.isFeatured 
                              ? "bg-[#FF0096] text-white hover:bg-[#e00084] border border-[#FF0096]" 
                              : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                          }`}
                          title={item.isFeatured ? "Quitar de Fichas Destacadas" : "Hacer Ficha Destacada"}
                        >
                          <Star className={`w-3 h-3 ${item.isFeatured ? "fill-white text-white" : "text-slate-400"}`} />
                          <span>{item.isFeatured ? "Destacado" : "Normal"}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-100/50 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-800">{totalFeatured}</p>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Destacados</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-100/50 flex items-center justify-center shrink-0">
              <ArrowUpDown className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-800">{totalWithPriority}</p>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">En Homepage</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-800">{ests.length}</p>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Total Registrados</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
