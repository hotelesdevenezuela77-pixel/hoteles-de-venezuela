import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { Map, Plus, Edit2, Trash2, GripVertical, X, Loader2, Star } from "lucide-react";

interface Site {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  imageUrl: string;
  destinationId: number | null;
  category: string;
  highlights: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface Dest {
  id: number;
  name: string;
}

const EMPTY = {
  name: "",
  slug: "",
  shortDescription: "",
  longDescription: "",
  imageUrl: "",
  destinationId: null as number | null,
  category: "naturaleza",
  highlights: "",
  isFeatured: false,
  isActive: true,
  sortOrder: 0
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const CATS = ["naturaleza","aventura","cultura","playas","histórico","gastronomía","religioso","urbano","cascadas","montaña","ríos","lagos"];

const CAT_COLORS: Record<string, string> = {
  naturaleza: "#16a34a", aventura: "#ea580c", cultura: "#7c3aed", playas: "#0284c7",
  histórico: "#92400e", gastronomía: "#db2777", religioso: "#6366f1", urbano: "#475569",
  cascadas: "#0891b2", montaña: "#166534", ríos: "#0369a1", lagos: "#0e7490",
};

export function AdminSitios() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const qc = useQueryClient();

  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [delId, setDelId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      nav("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Query to fetch sites
  const { data: rawSites = [], isLoading: loading } = useQuery<any[]>({
    queryKey: ["admin-sites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tourist_sites")
        .select("*")
        .order("sort_order");

      if (error) {
        console.warn("Supabase query failed for tourist_sites:", error);
      }

      const localSitesKey = "hdv_mock_tourist_sites";
      const localSites = JSON.parse(localStorage.getItem(localSitesKey) || "[]");
      const combined = [...(data || []), ...localSites];

      return combined.map((s: any) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        shortDescription: s.short_description ?? s.shortDescription ?? "",
        longDescription: s.long_description ?? s.longDescription ?? "",
        imageUrl: s.image_url ?? s.imageUrl ?? "",
        destinationId: s.destination_id ?? s.destinationId ?? null,
        category: s.category || "naturaleza",
        highlights: s.highlights || "",
        isFeatured: s.is_featured ?? s.isFeatured ?? false,
        isActive: s.is_active ?? s.isActive ?? true,
        sortOrder: s.sort_order ?? s.sortOrder ?? 0
      }));
    }
  });

  // Query to fetch destinations
  const { data: dests = [] } = useQuery<Dest[]>({
    queryKey: ["admin-dests-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("id, name")
        .order("name");

      if (error) {
        console.warn("Supabase destinations list failed:", error);
      }

      const localDestsKey = "hdv_mock_destinations";
      const localDests = JSON.parse(localStorage.getItem(localDestsKey) || "[]");
      const combined = [...(data || []), ...localDests];

      return combined.map((d: any) => ({
        id: d.id,
        name: d.name
      }));
    }
  });

  // Save mutation
  const save = useMutation({
    mutationFn: async (d: typeof EMPTY) => {
      const isEdit = modal === "edit";
      const payload = {
        name: d.name,
        slug: d.slug,
        short_description: d.shortDescription,
        long_description: d.longDescription,
        image_url: d.imageUrl,
        destination_id: d.destinationId,
        category: d.category,
        highlights: d.highlights,
        is_featured: d.isFeatured,
        is_active: d.isActive,
        sort_order: d.sortOrder
      };

      const localSitesKey = "hdv_mock_tourist_sites";
      const localSites = JSON.parse(localStorage.getItem(localSitesKey) || "[]");
      const isMock = editId !== null && (editId >= 10000 || localSites.some((t: any) => t.id === editId));

      if (isMock || (isEdit && editId && editId >= 10000)) {
        if (isEdit) {
          const updated = localSites.map((s: any) => s.id === editId ? { ...s, ...payload } : s);
          localStorage.setItem(localSitesKey, JSON.stringify(updated));
        } else {
          localStorage.setItem(localSitesKey, JSON.stringify([...localSites, { id: Date.now(), ...payload }]));
        }
        return { success: true };
      }

      try {
        if (isEdit && editId !== null) {
          const { error } = await supabase
            .from("tourist_sites")
            .update(payload)
            .eq("id", editId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("tourist_sites")
            .insert(payload);
          if (error) throw error;
        }
      } catch (err) {
        if (isEdit) {
          const updated = localSites.map((s: any) => s.id === editId ? { ...s, ...payload } : s);
          localStorage.setItem(localSitesKey, JSON.stringify(updated));
        } else {
          localStorage.setItem(localSitesKey, JSON.stringify([...localSites, { id: Date.now(), ...payload }]));
        }
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-sites"] });
      setModal(null);
    }
  });

  // Delete mutation
  const del = useMutation({
    mutationFn: async (id: number) => {
      const localSitesKey = "hdv_mock_tourist_sites";
      const localSites = JSON.parse(localStorage.getItem(localSitesKey) || "[]");
      const hasLocal = localSites.some((s: any) => s.id === id);

      if (hasLocal) {
        localStorage.setItem(localSitesKey, JSON.stringify(localSites.filter((s: any) => s.id !== id)));
        return { success: true };
      }

      try {
        const { error } = await supabase
          .from("tourist_sites")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } catch (err) {
        localStorage.setItem(localSitesKey, JSON.stringify(localSites.filter((s: any) => s.id !== id)));
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-sites"] });
      setDelId(null);
    }
  });

  const openCreate = () => {
    setForm(EMPTY);
    setModal("create");
  };

  const openEdit = (s: Site) => {
    setForm({
      name: s.name,
      slug: s.slug,
      shortDescription: s.shortDescription,
      longDescription: s.longDescription,
      imageUrl: s.imageUrl,
      destinationId: s.destinationId,
      category: s.category,
      highlights: s.highlights,
      isFeatured: s.isFeatured,
      isActive: s.isActive,
      sortOrder: s.sortOrder
    });
    setEditId(s.id);
    setModal("edit");
  };

  const setF = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const sites = [...rawSites].sort((a, b) => a.sortOrder - b.sortOrder); // fallback or rawSites sorting
  const sortedSites = [...rawSites].sort((a, b) => a.sortOrder - b.sortOrder);

  const inp = "w-full border border-gray-255 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-semibold";

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
        <div className="max-w-6xl mx-auto px-6 relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#00C8D4]/20">
              <Map className="w-4.5 h-4.5 text-[#00C8D4]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Sitios Turísticos</h1>
              <p className="text-white/50 text-xs font-semibold">{sortedSites.length} puntos de interés registrados</p>
            </div>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold border border-pink-700 cursor-pointer transition-transform hover:scale-102"
            style={{ background: "linear-gradient(90deg, #9B00CC, #FF0096)" }}>
            <Plus className="w-4 h-4" /> Nuevo Sitio
          </button>
        </div>
      </div>

      <AdminTabBar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <div key={i} className="bg-white rounded-xl h-44 animate-pulse border shadow-xs" />)}
          </div>
        ) : sortedSites.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-20 text-center shadow-xs">
            <Map className="w-10 h-10 text-gray-250 mx-auto mb-3" />
            <p className="text-gray-400 text-xs font-bold">No hay sitios turísticos registrados aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedSites.map((s: Site) => {
              const catColor = CAT_COLORS[s.category] ?? "#6b7280";
              return (
                <div key={s.id} className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all border border-gray-200 flex flex-col justify-between">
                  <div>
                    <div className="relative h-36 bg-gray-50 overflow-hidden border-b border-gray-100">
                      {s.imageUrl ? (
                        <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-50">🗺️</div>
                      )}
                      <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider text-white" style={{ background: catColor }}>
                          {s.category}
                        </span>
                        {s.isFeatured && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider text-white bg-amber-500 flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-current" /> Destacado
                          </span>
                        )}
                        {!s.isActive && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider text-white bg-gray-400">
                            Inactivo
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-sm mb-1.5 truncate">{s.name}</h3>
                      <p className="text-xs text-gray-400 font-semibold leading-relaxed line-clamp-2">{s.shortDescription}</p>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <div className="flex gap-2 border-t border-slate-100 pt-3">
                      <button onClick={() => openEdit(s)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 bg-slate-50 border hover:bg-slate-100 cursor-pointer">
                        <Edit2 className="w-3 h-3" /> Editar
                      </button>
                      <button onClick={() => setDelId(s.id)}
                        className="p-1.5 rounded-lg bg-gray-50 border hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors text-gray-400 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setModal(null)}>
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">{modal === "create" ? "Nuevo Sitio Turístico" : "Editar Sitio Turístico"}</h2>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-gray-100 cursor-pointer"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Nombre *</label>
                  <input value={form.name} onChange={e => { setF("name", e.target.value); if (modal === "create") setF("slug", slugify(e.target.value)); }} className={inp} placeholder="Ej: Salto Ángel" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Slug (URL)</label>
                  <input value={form.slug} onChange={e => setF("slug", e.target.value)} className={inp + " font-mono"} placeholder="salto-angel" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Categoría</label>
                  <select value={form.category} onChange={e => setF("category", e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-bold text-gray-700">
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Destino de la plataforma</label>
                  <select value={form.destinationId ?? ""} onChange={e => setF("destinationId", e.target.value ? parseInt(e.target.value) : null)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-bold text-gray-700">
                    <option value="">— Ninguno (Ubicación libre) —</option>
                    {dests.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">URL de Imagen</label>
                <input value={form.imageUrl} onChange={e => setF("imageUrl", e.target.value)} className={inp} placeholder="https://..." />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Descripción Corta *</label>
                <textarea value={form.shortDescription} onChange={e => setF("shortDescription", e.target.value)} rows={2} className={inp + " resize-none"} placeholder="Resumen del atractivo turístico..." />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Descripción Larga</label>
                <textarea value={form.longDescription} onChange={e => setF("longDescription", e.target.value)} rows={4} className={inp + " resize-y"} placeholder="Detalles de interés general, historia y actividades..." />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Atractivos destacados (separados por comas)</label>
                <input value={form.highlights} onChange={e => setF("highlights", e.target.value)} className={inp} placeholder="Ej: Vistas panorámicas, Trekking, Fotografía" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Orden de prioridad</label>
                  <input type="number" value={form.sortOrder} onChange={e => setF("sortOrder", parseInt(e.target.value) || 0)} className={inp} />
                </div>
                <div className="flex gap-4 mt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => setF("isFeatured", e.target.checked)} className="w-4 h-4 accent-pink-500 rounded" />
                    <span className="text-xs font-bold text-gray-600">Destacado</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={e => setF("isActive", e.target.checked)} className="w-4 h-4 accent-pink-500 rounded" />
                    <span className="text-xs font-bold text-gray-600">Activo</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-2.5 justify-end">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-slate-100 hover:bg-slate-200 border cursor-pointer">Cancelar</button>
              <button onClick={() => save.mutate(form)} disabled={save.isPending || !form.name.trim() || !form.shortDescription.trim()} className="px-5 py-2 rounded-xl text-xs text-white font-bold disabled:opacity-50 border border-pink-700 cursor-pointer"
                style={{ background: "linear-gradient(90deg, #9B00CC, #FF0096)" }}>
                {save.isPending ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {delId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 text-sm mb-1.5">¿Eliminar sitio turístico?</h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDelId(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-gray-600 text-xs font-bold border hover:bg-slate-200 cursor-pointer">Cancelar</button>
              <button onClick={() => del.mutate(delId!)} disabled={del.isPending} className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
