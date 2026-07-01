import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { TreePine, Plus, Edit2, Trash2, GripVertical, X, Loader2, Star, MapPin } from "lucide-react";

interface Park {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  imageUrl: string;
  destinationName: string;
  highlights: string;
  latitude: string;
  longitude: string;
  area: string;
  climate: string;
  howToGetThere: string;
  bestTimeToVisit: string;
  galleryImages: string;
  isFeatured: boolean;
  status: string;
}

const EMPTY = {
  name: "",
  slug: "",
  shortDescription: "",
  longDescription: "",
  imageUrl: "",
  destinationName: "",
  highlights: "",
  latitude: "",
  longitude: "",
  area: "",
  climate: "",
  howToGetThere: "",
  bestTimeToVisit: "",
  galleryImages: "",
  isFeatured: false,
  status: "active"
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function AdminParques() {
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

  // Query to fetch national parks
  const { data: rawParks = [], isLoading: loading } = useQuery<any[]>({
    queryKey: ["admin-parks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("national_parks")
        .select("*")
        .order("name");

      if (error) {
        console.warn("Supabase query failed for national_parks:", error);
      }

      const localParksKey = "hdv_mock_national_parks";
      const localParks = JSON.parse(localStorage.getItem(localParksKey) || "[]");
      const combined = [...(data || []), ...localParks];

      return combined.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        shortDescription: p.short_description ?? p.shortDescription ?? "",
        longDescription: p.long_description ?? p.longDescription ?? "",
        imageUrl: p.image_url ?? p.imageUrl ?? "",
        destinationName: p.destination_name ?? p.destinationName ?? "",
        highlights: p.highlights || "",
        latitude: p.latitude || "",
        longitude: p.longitude || "",
        area: p.area || "",
        climate: p.climate || "",
        howToGetThere: p.how_to_get_there ?? p.howToGetThere ?? "",
        bestTimeToVisit: p.best_time_to_visit ?? p.bestTimeToVisit ?? "",
        galleryImages: p.gallery_images ?? p.galleryImages ?? "",
        isFeatured: p.is_featured ?? p.isFeatured ?? false,
        status: p.status || "active"
      }));
    }
  });

  // Save national park mutation
  const save = useMutation({
    mutationFn: async (d: typeof EMPTY) => {
      const isEdit = modal === "edit";
      const payload = {
        name: d.name,
        slug: d.slug,
        short_description: d.shortDescription,
        long_description: d.longDescription,
        image_url: d.imageUrl,
        destination_name: d.destinationName,
        highlights: d.highlights,
        latitude: d.latitude,
        longitude: d.longitude,
        area: d.area,
        climate: d.climate,
        how_to_get_there: d.howToGetThere,
        best_time_to_visit: d.bestTimeToVisit,
        gallery_images: d.galleryImages,
        is_featured: d.isFeatured,
        status: d.status
      };

      const localParksKey = "hdv_mock_national_parks";
      const localParks = JSON.parse(localStorage.getItem(localParksKey) || "[]");
      const isMock = editId !== null && (editId >= 10000 || localParks.some((t: any) => t.id === editId));

      if (isMock || (isEdit && editId && editId >= 10000)) {
        if (isEdit) {
          const updated = localParks.map((p: any) => p.id === editId ? { ...p, ...payload } : p);
          localStorage.setItem(localParksKey, JSON.stringify(updated));
        } else {
          localStorage.setItem(localParksKey, JSON.stringify([...localParks, { id: Date.now(), ...payload }]));
        }
        return { success: true };
      }

      try {
        if (isEdit && editId !== null) {
          const { error } = await supabase
            .from("national_parks")
            .update(payload)
            .eq("id", editId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("national_parks")
            .insert(payload);
          if (error) throw error;
        }
      } catch (err) {
        if (isEdit) {
          const updated = localParks.map((p: any) => p.id === editId ? { ...p, ...payload } : p);
          localStorage.setItem(localParksKey, JSON.stringify(updated));
        } else {
          localStorage.setItem(localParksKey, JSON.stringify([...localParks, { id: Date.now(), ...payload }]));
        }
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-parks"] });
      setModal(null);
    }
  });

  // Delete national park mutation
  const del = useMutation({
    mutationFn: async (id: number) => {
      const localParksKey = "hdv_mock_national_parks";
      const localParks = JSON.parse(localStorage.getItem(localParksKey) || "[]");
      const hasLocal = localParks.some((p: any) => p.id === id);

      if (hasLocal) {
        localStorage.setItem(localParksKey, JSON.stringify(localParks.filter((p: any) => p.id !== id)));
        return { success: true };
      }

      try {
        const { error } = await supabase
          .from("national_parks")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } catch (err) {
        localStorage.setItem(localParksKey, JSON.stringify(localParks.filter((p: any) => p.id !== id)));
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-parks"] });
      setDelId(null);
    }
  });

  const openCreate = () => {
    setForm(EMPTY);
    setModal("create");
  };

  const openEdit = (p: Park) => {
    setForm({
      name: p.name,
      slug: p.slug,
      shortDescription: p.shortDescription,
      longDescription: p.longDescription,
      imageUrl: p.imageUrl,
      destinationName: p.destinationName,
      highlights: p.highlights,
      latitude: p.latitude,
      longitude: p.longitude,
      area: p.area,
      climate: p.climate,
      howToGetThere: p.howToGetThere,
      bestTimeToVisit: p.bestTimeToVisit,
      galleryImages: p.galleryImages,
      isFeatured: p.isFeatured,
      status: p.status
    });
    setEditId(p.id);
    setModal("edit");
  };

  const setF = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const sortedParks = [...rawParks].sort((a, b) => a.name.localeCompare(b.name));

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
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/20">
              <TreePine className="w-4.5 h-4.5 text-emerald-450" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Parques Nacionales</h1>
              <p className="text-white/50 text-xs font-semibold">{sortedParks.length} reservas y parques nacionales registrados</p>
            </div>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold border border-pink-700 cursor-pointer transition-transform hover:scale-102"
            style={{ background: "linear-gradient(90deg, #9B00CC, #FF0096)" }}>
            <Plus className="w-4 h-4" /> Nuevo Parque
          </button>
        </div>
      </div>

      <AdminTabBar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <div key={i} className="bg-white rounded-xl h-44 animate-pulse border shadow-xs" />)}
          </div>
        ) : sortedParks.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-20 text-center shadow-xs">
            <TreePine className="w-10 h-10 text-gray-255 mx-auto mb-3" />
            <p className="text-gray-400 text-xs font-bold">No hay parques registrados aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedParks.map((p: Park) => (
              <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all border border-gray-200 flex flex-col justify-between">
                <div>
                  <div className="relative h-36 bg-emerald-50/10 overflow-hidden border-b border-gray-100">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-50">🌿</div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {p.isFeatured && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider text-white bg-amber-500 flex items-center gap-0.5 shadow-sm">
                          <Star className="w-2.5 h-2.5 fill-current" /> Destacado
                        </span>
                      )}
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider text-white ${p.status === "active" ? "bg-emerald-500" : "bg-gray-400"}`}>
                        {p.status === "active" ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">{p.name}</h3>
                    {p.destinationName && (
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase mb-2">
                        <MapPin className="w-3 h-3 text-emerald-500 shrink-0" /> {p.destinationName}
                      </div>
                    )}
                    <p className="text-xs text-gray-450 font-semibold leading-relaxed line-clamp-2">{p.shortDescription}</p>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <div className="flex gap-2 border-t border-slate-100 pt-3">
                    <button onClick={() => openEdit(p)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 bg-slate-50 border hover:bg-slate-100 cursor-pointer">
                      <Edit2 className="w-3 h-3" /> Editar
                    </button>
                    <button onClick={() => setDelId(p.id)}
                      className="p-1.5 rounded-lg bg-gray-55 border hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors text-gray-400 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setModal(null)}>
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">{modal === "create" ? "Nuevo Parque Nacional" : "Editar Parque Nacional"}</h2>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-gray-100 cursor-pointer"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Nombre del Parque *</label>
                  <input value={form.name} onChange={e => { setF("name", e.target.value); if (modal === "create") setF("slug", slugify(e.target.value)); }} className={inp} placeholder="Ej: Archipiélago Los Roques" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Slug (URL)</label>
                  <input value={form.slug} onChange={e => setF("slug", e.target.value)} className={inp + " font-mono"} placeholder="los-roques" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">URL de Imagen Principal</label>
                <input value={form.imageUrl} onChange={e => setF("imageUrl", e.target.value)} className={inp} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Ubicación / Región</label>
                  <input value={form.destinationName} onChange={e => setF("destinationName", e.target.value)} className={inp} placeholder="Ej: Falcón" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Área aproximada</label>
                  <input value={form.area} onChange={e => setF("area", e.target.value)} className={inp} placeholder="Ej: 221.120 ha" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Latitud (Coordenadas)</label>
                  <input value={form.latitude} onChange={e => setF("latitude", e.target.value)} className={inp} placeholder="11.85" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Longitud (Coordenadas)</label>
                  <input value={form.longitude} onChange={e => setF("longitude", e.target.value)} className={inp} placeholder="-66.75" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Descripción Corta *</label>
                <textarea value={form.shortDescription} onChange={e => setF("shortDescription", e.target.value)} rows={2} className={inp + " resize-none"} placeholder="Resumen para catálogos..." />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Descripción Larga</label>
                <textarea value={form.longDescription} onChange={e => setF("longDescription", e.target.value)} rows={4} className={inp + " resize-y"} placeholder="Historia, ecosistema, reglamento y actividades permitidas..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Clima dominante</label>
                  <input value={form.climate} onChange={e => setF("climate", e.target.value)} className={inp} placeholder="Ej: Cálido xerófilo" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Mejor época para visitar</label>
                  <input value={form.bestTimeToVisit} onChange={e => setF("bestTimeToVisit", e.target.value)} className={inp} placeholder="Ej: Diciembre a Abril" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">¿Cómo llegar?</label>
                <textarea value={form.howToGetThere} onChange={e => setF("howToGetThere", e.target.value)} rows={2} className={inp + " resize-none"} placeholder="Instrucciones de acceso marítimo, aéreo o terrestre..." />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Atractivos (separados por coma)</label>
                <input value={form.highlights} onChange={e => setF("highlights", e.target.value)} className={inp} placeholder="Cayo de Agua, Gran Roque, Bajo Fabián" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Estado</label>
                  <select value={form.status} onChange={e => setF("status", e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-bold text-gray-700">
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
                <div className="flex gap-4 mt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => setF("isFeatured", e.target.checked)} className="w-4 h-4 accent-pink-500 rounded" />
                    <span className="text-xs font-bold text-gray-600">Destacado en Home</span>
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
            <h3 className="font-bold text-gray-900 text-sm mb-1.5">¿Eliminar parque nacional?</h3>
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
