import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { supabase } from "@/lib/supabase";
import { Star, Plus, Edit2, Trash2, Clock, Users, X, Loader2 } from "lucide-react";

interface Package {
  id: number;
  name: string;
  slug: string;
  description: string;
  durationDays: number;
  durationNights: number;
  pricePerPerson: number;
  minPersons: number;
  maxPersons: number;
  includedServices: string;
  featuredImage: string;
  category: string;
  difficultyLevel: string;
  status: string;
  isFeatured: boolean;
  isActive: boolean;
  destinations: string;
  departureLocation: string;
}

const EMPTY = {
  name: "",
  slug: "",
  description: "",
  longDescription: "",
  durationDays: 1,
  durationNights: 1,
  pricePerPerson: 0,
  groupPrice: 0,
  minPersons: 1,
  maxPersons: 20,
  includedServices: "",
  notIncluded: "",
  destinations: "",
  itinerarySummary: "",
  departureLocation: "",
  featuredImage: "",
  category: "playa",
  difficultyLevel: "facil",
  status: "active",
  isFeatured: false,
  isActive: true
};

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const CATS = ["aventura", "cultural", "ecológico", "playa", "montaña", "ciudad", "gastronómico", "familiar"];
const DIFFS = ["facil", "moderado", "difícil", "extremo"];
const DIFF_COLOR: Record<string, string> = { facil: "#16a34a", moderado: "#d97706", "difícil": "#ea580c", extremo: "#dc2626" };

export function AdminPaquetes() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Query to fetch packages
  const { data: pkgs = [], isLoading: loading } = useQuery<Package[]>({
    queryKey: ["admin-packages"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("tour_packages")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;

        const mapped = (data || []).map((p: any) => ({
          id: p.id,
          name: p.name || "",
          slug: p.slug || "",
          description: p.description || "",
          durationDays: p.duration_days || p.durationDays || 1,
          durationNights: p.duration_nights || p.durationNights || 1,
          pricePerPerson: p.price_per_person || p.pricePerPerson || 0,
          minPersons: p.min_persons || p.minPersons || 1,
          maxPersons: p.max_persons || p.maxPersons || 10,
          includedServices: p.included_services || p.includedServices || "",
          featuredImage: p.featured_image || p.image_url || p.featuredImage || "",
          category: p.category || "playa",
          difficultyLevel: p.difficulty_level || p.difficultyLevel || "facil",
          status: p.status || "active",
          isFeatured: p.is_featured !== undefined ? p.is_featured : (p.isFeatured !== undefined ? p.isFeatured : false),
          isActive: p.is_active !== undefined ? p.is_active : (p.isActive !== undefined ? p.isActive : true),
          destinations: p.destinations || "",
          departureLocation: p.departure_location || p.departureLocation || ""
        }));

        const localPackKey = "hdv_mock_tour_packages";
        const localPacks = JSON.parse(localStorage.getItem(localPackKey) || "[]");
        return [...mapped, ...localPacks];
      } catch (err) {
        const localPackKey = "hdv_mock_tour_packages";
        const localPacks = JSON.parse(localStorage.getItem(localPackKey) || "[]");
        if (localPacks.length === 0) {
          const defaults = [
            { id: 1, name: "Escapada Romántica Los Roques", slug: "los-roques-escapada", description: "Vuelo ida y vuelta, estadía en posada premium, paseo a cayos y comidas incluidas.", durationDays: 3, durationNights: 2, pricePerPerson: 450, minPersons: 2, maxPersons: 6, includedServices: "Vuelos, Posada, Comidas, Paseo en lancha", featuredImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80", category: "playa", difficultyLevel: "facil", status: "active", isFeatured: true, isActive: true, destinations: "Los Roques", departureLocation: "Maiquetía" },
            { id: 2, name: "Aventura Selva Canaima", slug: "aventura-canaima", description: "Excursión de 4 días al Salto Ángel con pernocta en hamacas frente a la caída de agua más alta.", durationDays: 4, durationNights: 3, pricePerPerson: 650, minPersons: 1, maxPersons: 12, includedServices: "Vuelo charter, comidas completas, traslados, curiara", featuredImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80", category: "aventura", difficultyLevel: "moderado", status: "active", isFeatured: false, isActive: true, destinations: "Canaima", departureLocation: "Puerto Ordaz" },
          ];
          localStorage.setItem(localPackKey, JSON.stringify(defaults));
          return defaults;
        }
        return localPacks;
      }
    },
    staleTime: 15000,
  });

  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [delId, setDelId] = useState<number | null>(null);

  const save = useMutation({
    mutationFn: async (d: typeof EMPTY) => {
      const localPackKey = "hdv_mock_tour_packages";
      const localPacks = JSON.parse(localStorage.getItem(localPackKey) || "[]");
      const isEdit = modal === "edit";

      if (isEdit && editId) {
        const hasLocal = localPacks.some((p: any) => p.id === editId);
        if (hasLocal) {
          const updated = localPacks.map((p: any) => p.id === editId ? { ...p, ...d } : p);
          localStorage.setItem(localPackKey, JSON.stringify(updated));
          return { success: true };
        }

        try {
          const { error } = await supabase
            .from("tour_packages")
            .update({
              name: d.name,
              slug: d.slug,
              description: d.description,
              duration_days: d.durationDays,
              duration_nights: d.durationNights,
              price_per_person: d.pricePerPerson,
              min_persons: d.minPersons,
              max_persons: d.maxPersons,
              included_services: d.includedServices,
              featured_image: d.featuredImage,
              category: d.category,
              difficulty_level: d.difficultyLevel,
              status: d.status,
              is_featured: d.isFeatured,
              is_active: d.isActive,
              destinations: d.destinations,
              departure_location: d.departureLocation
            })
            .eq("id", editId);
          if (error) throw error;
        } catch (err) {
          const updated = localPacks.map((p: any) => p.id === editId ? { ...p, ...d } : p);
          localStorage.setItem(localPackKey, JSON.stringify(updated));
        }
      } else {
        const newId = Date.now();
        const newPkg = { id: newId, ...d };

        try {
          const { error } = await supabase
            .from("tour_packages")
            .insert({
              name: d.name,
              slug: d.slug,
              description: d.description,
              duration_days: d.durationDays,
              duration_nights: d.durationNights,
              price_per_person: d.pricePerPerson,
              min_persons: d.minPersons,
              max_persons: d.maxPersons,
              included_services: d.includedServices,
              featured_image: d.featuredImage,
              category: d.category,
              difficulty_level: d.difficultyLevel,
              status: d.status,
              is_featured: d.isFeatured,
              is_active: d.isActive,
              destinations: d.destinations,
              departure_location: d.departureLocation
            });
          if (error) throw error;
        } catch (err) {
          localStorage.setItem(localPackKey, JSON.stringify([...localPacks, newPkg]));
        }
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-packages"] });
      setModal(null);
    },
  });

  const del = useMutation({
    mutationFn: async (id: number) => {
      const localPackKey = "hdv_mock_tour_packages";
      const localPacks = JSON.parse(localStorage.getItem(localPackKey) || "[]");
      const hasLocal = localPacks.some((p: any) => p.id === id);

      if (hasLocal) {
        localStorage.setItem(localPackKey, JSON.stringify(localPacks.filter((p: any) => p.id !== id)));
        return { success: true };
      }

      try {
        const { error } = await supabase
          .from("tour_packages")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } catch (err) {
        localStorage.setItem(localPackKey, JSON.stringify(localPacks.filter((p: any) => p.id !== id)));
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-packages"] });
      setDelId(null);
    },
  });

  const openEdit = (p: Package) => {
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description,
      longDescription: "",
      durationDays: p.durationDays,
      durationNights: p.durationNights,
      pricePerPerson: p.pricePerPerson,
      groupPrice: 0,
      minPersons: p.minPersons,
      maxPersons: p.maxPersons,
      includedServices: p.includedServices,
      notIncluded: "",
      destinations: p.destinations,
      itinerarySummary: "",
      departureLocation: p.departureLocation,
      featuredImage: p.featuredImage,
      category: p.category,
      difficultyLevel: p.difficultyLevel,
      status: p.status,
      isFeatured: p.isFeatured,
      isActive: p.isActive
    });
    setEditId(p.id);
    setModal("edit");
  };

  const setF = (k: string, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }));
  const inp = "w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 font-semibold text-gray-900";

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
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-pink-500/20">
              <Star className="w-4.5 h-4.5 text-pink-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Paquetes Turísticos</h1>
              <p className="text-white/50 text-xs font-semibold">{pkgs.length} paquetes registrados en la plataforma</p>
            </div>
          </div>
          <button
            onClick={() => { setForm(EMPTY); setModal("create"); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold border border-pink-700 cursor-pointer transition-transform hover:scale-102"
            style={{ background: "linear-gradient(90deg, #FF0096, #9B00CC)" }}
          >
            <Plus className="w-4 h-4" /> Nuevo Paquete
          </button>
        </div>
      </div>

      <AdminTabBar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-gray-200 shadow-xs" />)}
          </div>
        ) : pkgs.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-20 text-center shadow-xs">
            <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-xs font-bold">No hay paquetes turísticos registrados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pkgs.map(p => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between">
                <div>
                  {p.featuredImage ? (
                    <div className="h-40 overflow-hidden bg-slate-50 border-b">
                      <img src={p.featuredImage} alt={p.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-4xl bg-slate-50 border-b">🏖️</div>
                  )}
                  <div className="p-4">
                    <div className="flex flex-wrap gap-1.5 mb-2 font-bold text-[9px] uppercase tracking-wider">
                      <span className={`px-2 py-0.5 rounded-full ${p.status === "active" ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-gray-500 bg-gray-100"}`}>{p.status === "active" ? "Activo" : "Inactivo"}</span>
                      <span className="px-2 py-0.5 rounded-full text-pink-700 bg-pink-50 border border-pink-200">{p.category}</span>
                      {p.isFeatured && <span className="px-2 py-0.5 rounded-full text-yellow-700 bg-yellow-50 border border-yellow-200">★ Destacado</span>}
                      <span className="px-2 py-0.5 rounded-full text-white" style={{ background: DIFF_COLOR[p.difficultyLevel] ?? "#6b7280" }}>{p.difficultyLevel}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1.5 line-clamp-2 leading-snug">{p.name}</h3>
                    <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-3 leading-relaxed">{p.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-550 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-400" />{p.durationDays}D / {p.durationNights}N</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-gray-400" />{p.minPersons}–{p.maxPersons} pax</span>
                      <span className="font-black text-emerald-600">${p.pricePerPerson} USD</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => setDelId(p.id)}
                    className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-red-50 hover:text-red-550 transition-colors text-slate-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setModal(null)}>
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-900">{modal === "create" ? "Nuevo Paquete Turístico" : "Editar Paquete Turístico"}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Nombre *</label>
                  <input value={form.name} onChange={e => { setF("name", e.target.value); if (modal === "create") setF("slug", slugify(e.target.value)); }} className={inp} />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Slug (URL)</label>
                  <input value={form.slug} onChange={e => setF("slug", e.target.value)} className={inp + " font-mono text-pink-650 bg-slate-50"} />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">URL de Imagen Principal</label>
                <input value={form.featuredImage} onChange={e => setF("featuredImage", e.target.value)} className={inp} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Categoría</label>
                  <select value={form.category} onChange={e => setF("category", e.target.value)} className={inp}>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Dificultad</label>
                  <select value={form.difficultyLevel} onChange={e => setF("difficultyLevel", e.target.value)} className={inp}>
                    {DIFFS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Días</label>
                  <input type="number" value={form.durationDays} onChange={e => setF("durationDays", parseInt(e.target.value) || 1)} className={inp} />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Noches</label>
                  <input type="number" value={form.durationNights} onChange={e => setF("durationNights", parseInt(e.target.value) || 1)} className={inp} />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Mín Personas</label>
                  <input type="number" value={form.minPersons} onChange={e => setF("minPersons", parseInt(e.target.value) || 1)} className={inp} />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Máx Personas</label>
                  <input type="number" value={form.maxPersons} onChange={e => setF("maxPersons", parseInt(e.target.value) || 20)} className={inp} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Precio por Persona (USD) *</label>
                  <input type="number" value={form.pricePerPerson} onChange={e => setF("pricePerPerson", parseFloat(e.target.value) || 0)} className={inp} />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Ubicación de Salida</label>
                  <input value={form.departureLocation} onChange={e => setF("departureLocation", e.target.value)} className={inp} placeholder="Maiquetía, Caracas..." />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Destinos Incluidos</label>
                <input value={form.destinations} onChange={e => setF("destinations", e.target.value)} className={inp} placeholder="Los Roques, Morrocoy, Canaima..." />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Descripción Corta</label>
                <textarea value={form.description} onChange={e => setF("description", e.target.value)} rows={2} className={inp + " resize-none"} />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Servicios Incluidos</label>
                <textarea value={form.includedServices} onChange={e => setF("includedServices", e.target.value)} rows={2} className={inp + " resize-none"} placeholder="Hospedaje, desayunos, paseos..." />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">No Incluido</label>
                <textarea value={form.notIncluded} onChange={e => setF("notIncluded", e.target.value)} rows={2} className={inp + " resize-none"} placeholder="Propinas, almuerzos..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Estado</label>
                  <select value={form.status} onChange={e => setF("status", e.target.value)} className={inp}>
                    <option value="active">Activo (Visible)</option>
                    <option value="inactive">Inactivo (Oculto)</option>
                    <option value="draft">Borrador</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-gray-700">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => setF("isFeatured", e.target.checked)} className="w-4 h-4 accent-pink-500 rounded cursor-pointer" />
                    <span>Destacar paquete en la página de inicio</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 flex gap-3 justify-end">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer">Cancelar</button>
              <button
                onClick={() => save.mutate(form)}
                disabled={save.isPending}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white border border-pink-700 disabled:opacity-50 cursor-pointer"
                style={{ background: "linear-gradient(90deg, #FF0096, #9B00CC)" }}
              >
                {save.isPending ? "Guardando..." : "Guardar Paquete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {delId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 mb-2">¿Eliminar este paquete?</h3>
            <p className="text-xs text-gray-400 font-semibold mb-5">Esta acción es permanente y no se podrá deshacer.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDelId(null)} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold cursor-pointer border border-slate-200">Cancelar</button>
              <button onClick={() => del.mutate(delId)} disabled={del.isPending} className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer border border-red-750">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
