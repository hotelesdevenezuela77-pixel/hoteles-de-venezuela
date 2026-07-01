import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import {
  Tag, Plus, Edit2, Trash2, Check, X,
  Briefcase, Car, Sailboat, Ship, Pill, Hotel, Anchor,
  ShoppingCart, TreePine, Waves, Home, Utensils, MapPin,
  Sparkles, Map, Bus, Coffee, Landmark, Building2, Building,
  Star, Camera, Heart, Fish, Tent, Mountain, Bike, Music,
  Globe, Plane, UtensilsCrossed, Truck, Zap, Leaf, Dumbbell, Loader2
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Briefcase, Car, Sailboat, Ship, Pill, Hotel, Anchor,
  ShoppingCart, TreePine, Waves, Home, Utensils, MapPin,
  Sparkles, Map, Bus, Coffee, Landmark, Building2, Building,
  Star, Camera, Heart, Fish, Tent, Mountain, Bike, Music,
  Globe, Plane, UtensilsCrossed, Truck, Zap, Leaf, Dumbbell,
  Tag,
};

const CAT_EMOJIS = ["🏨","🏡","🍽️","🏖️","🌳","💆","🧭","✈️","🚌","⚓","🚗","⛵","⛺","🏔️","🌴","🏊","🎭","🛍️","🎵","🏋️"];

function CategoryIcon({ icon }: { icon: string | null }) {
  if (!icon) return <span className="text-lg">🏨</span>;
  const Comp = ICON_MAP[icon];
  if (Comp) return <Comp className="w-5 h-5" style={{ color: "#9B00CC" }} />;
  return <span className="text-lg leading-none">{icon}</span>;
}

function autoSlug(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}

export function AdminCategorias() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("🏨");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Query to fetch categories
  const { data: cats = [], isLoading } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      
      const localCatsKey = "hdv_mock_categories";
      const localCats = JSON.parse(localStorage.getItem(localCatsKey) || "[]");
      return [...(data || []), ...localCats];
    }
  });

  // Mutation to create category
  const createMut = useMutation({
    mutationFn: async (data: { name: string; slug: string; icon: string }) => {
      const { error } = await supabase
        .from("categories")
        .insert(data);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      setNewName("");
      setNewIcon("🏨");
      setShowForm(false);
    }
  });

  // Mutation to update category
  const updateMut = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, string> }) => {
      // Check if it's a mock category (id < 0 or not found in db)
      const isMock = id <= 5; // our fallback ids or custom logic
      const localCatsKey = "hdv_mock_categories";
      const localCats = JSON.parse(localStorage.getItem(localCatsKey) || "[]");
      const hasLocal = localCats.some((c: any) => c.id === id);

      if (hasLocal) {
        const updated = localCats.map((c: any) => c.id === id ? { ...c, ...data } : c);
        localStorage.setItem(localCatsKey, JSON.stringify(updated));
        return { success: true };
      }

      const { error } = await supabase
        .from("categories")
        .update(data)
        .eq("id", id);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      setEditId(null);
    }
  });

  // Mutation to delete category
  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const localCatsKey = "hdv_mock_categories";
      const localCats = JSON.parse(localStorage.getItem(localCatsKey) || "[]");
      const hasLocal = localCats.some((c: any) => c.id === id);

      if (hasLocal) {
        const updated = localCats.filter((c: any) => c.id !== id);
        localStorage.setItem(localCatsKey, JSON.stringify(updated));
        return { success: true };
      }

      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      setConfirmDelete(null);
    }
  });

  const handleCreate = () => {
    if (!newName.trim()) return;
    createMut.mutate({ name: newName.trim(), slug: autoSlug(newName), icon: newIcon });
  };

  const handleUpdate = (id: number) => {
    if (!editName.trim()) return;
    updateMut.mutate({ id, data: { name: editName, slug: autoSlug(editName), icon: editIcon } });
  };

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
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#9B00CC" }} />
        <div className="max-w-3xl mx-auto px-6 relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-500/20">
              <Tag className="w-4.5 h-4.5 text-purple-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Categorías</h1>
              <p className="text-white/50 text-xs font-semibold">Gestiona los tipos de establecimientos disponibles</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold border border-purple-700 cursor-pointer transition-transform hover:scale-102"
            style={{ background: "linear-gradient(90deg, #9B00CC, #FF0096)" }}
          >
            <Plus className="w-4 h-4" /> Nueva Categoría
          </button>
        </div>
      </div>

      <AdminTabBar />

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Create form */}
        {showForm && (
          <div className="bg-white border-2 border-purple-500 rounded-2xl shadow-xs p-5 mb-6">
            <h3 className="font-bold text-gray-900 text-sm mb-4">Crear Nueva Categoría</h3>
            <div className="flex flex-col gap-3">
              <div className="flex gap-4 flex-col sm:flex-row">
                <div className="shrink-0">
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Selecciona un Ícono / Emoji</div>
                  <div className="grid grid-cols-5 gap-1.5 max-w-[200px]">
                    {CAT_EMOJIS.map((e) => (
                      <button key={e}
                        type="button"
                        onClick={() => setNewIcon(e)}
                        className="w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all cursor-pointer border"
                        style={{ 
                          background: newIcon === e ? "rgba(155,0,204,0.08)" : "#f8fafc", 
                          borderColor: newIcon === e ? "#9B00CC" : "#e2e8f0" 
                        }}
                      >{e}</button>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Nombre de Categoría *</div>
                  <input
                    placeholder="Ej: Hoteles Boutique"
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-400 font-semibold"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  />
                  <div className="text-[10px] text-gray-400 font-bold mt-1.5">Slug autogenerado: <code className="text-purple-600 bg-purple-50 px-1 py-0.5 rounded">{autoSlug(newName) || "—"}</code></div>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer">Cancelar</button>
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim() || createMut.isPending}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white border border-purple-750 disabled:opacity-50 cursor-pointer"
                  style={{ background: "linear-gradient(90deg, #9B00CC, #FF0096)" }}
                >
                  {createMut.isPending ? "Guardando..." : "Guardar Categoría"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500" />
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array(4).fill(0).map((_, i) => <div key={i} className="h-14 w-full bg-gray-50 animate-pulse rounded-xl" />)}
            </div>
          ) : cats.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-xs font-bold">No hay categorías registradas</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 font-bold text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="text-left px-5 py-3">Categoría</th>
                  <th className="text-left px-5 py-3">Slug</th>
                  <th className="text-right px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cats.map((cat, idx) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-purple-50/10 border-b border-slate-50 last:border-b-0 transition-colors"
                  >
                    <td className="px-5 py-3">
                      {editId === cat.id ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <div className="flex gap-1 flex-wrap max-w-[160px]">
                            {CAT_EMOJIS.slice(0, 10).map((e) => (
                              <button key={e} onClick={() => setEditIcon(e)}
                                className="w-7 h-7 rounded-lg text-sm flex items-center justify-center border"
                                style={{ 
                                  background: editIcon === e ? "rgba(155,0,204,0.08)" : "#f8fafc", 
                                  borderColor: editIcon === e ? "#9B00CC" : "#e2e8f0" 
                                }}
                              >{e}</button>
                            ))}
                          </div>
                          <input
                            className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-purple-400 font-semibold"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center border"
                            style={{ background: "rgba(155,0,204,0.05)", borderColor: "rgba(155,0,204,0.15)" }}>
                            <CategoryIcon icon={cat.icon} />
                          </div>
                          <span className="font-bold text-gray-800 text-sm">{cat.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-400 font-mono text-xs">{cat.slug}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {editId === cat.id ? (
                          <>
                            <button onClick={() => handleUpdate(cat.id)} disabled={updateMut.isPending}
                              className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center hover:bg-emerald-100 cursor-pointer">
                              <Check className="w-4 h-4 text-emerald-600" />
                            </button>
                            <button onClick={() => setEditId(null)}
                              className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 cursor-pointer">
                              <X className="w-4 h-4 text-gray-500" />
                            </button>
                          </>
                        ) : confirmDelete === cat.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => { deleteMut.mutate(cat.id); setConfirmDelete(null); }}
                              className="px-2.5 py-1 rounded bg-red-600 text-white text-[10px] font-bold cursor-pointer">Eliminar</button>
                            <button onClick={() => setConfirmDelete(null)}
                              className="px-2.5 py-1 rounded bg-slate-250 text-slate-700 text-[10px] font-bold cursor-pointer">No</button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => { setEditId(cat.id); setEditName(cat.name); setEditIcon(cat.icon ?? "🏨"); }}
                              className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-amber-50 cursor-pointer">
                              <Edit2 className="w-3.5 h-3.5 text-gray-500 hover:text-amber-600" />
                            </button>
                            <button onClick={() => setConfirmDelete(cat.id)}
                              className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-red-50 cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-600" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
