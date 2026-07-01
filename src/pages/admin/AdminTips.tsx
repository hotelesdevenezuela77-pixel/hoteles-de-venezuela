import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { Leaf, Plus, Edit2, Trash2, GripVertical, X, Loader2 } from "lucide-react";

interface Tip {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

const EMPTY = { title: "", content: "", imageUrl: "", icon: "star", sortOrder: 0, isActive: true };
const ICONS = ["star","calendar","file-text","credit-card","shield","map","camera","heart","sun","moon","cloud","wind","compass","anchor","mountain","waves","wifi","smartphone","info","alert-circle"];

export function AdminTips() {
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

  // Query to fetch tips
  const { data: rawTips = [], isLoading: loading } = useQuery<any[]>({
    queryKey: ["admin-tips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tourism_tips")
        .select("*")
        .order("sort_order");

      if (error) {
        console.warn("Supabase query failed, falling back to local storage:", error);
      }

      const localTipsKey = "hdv_mock_tourism_tips";
      const localTips = JSON.parse(localStorage.getItem(localTipsKey) || "[]");
      const combined = [...(data || []), ...localTips];

      return combined.map((t: any) => ({
        id: t.id,
        title: t.title,
        content: t.content,
        imageUrl: t.image_url || t.imageUrl || "",
        icon: t.icon || "star",
        sortOrder: t.sort_order ?? t.sortOrder ?? 0,
        isActive: t.is_active ?? t.isActive ?? true
      }));
    }
  });

  // Save tip mutation
  const save = useMutation({
    mutationFn: async (d: typeof EMPTY) => {
      const isEdit = modal === "edit";
      const payload = {
        title: d.title,
        content: d.content,
        image_url: d.imageUrl,
        icon: d.icon,
        sort_order: d.sortOrder,
        is_active: d.isActive
      };

      const localTipsKey = "hdv_mock_tourism_tips";
      const localTips = JSON.parse(localStorage.getItem(localTipsKey) || "[]");
      const isMock = editId !== null && (editId >= 10000 || localTips.some((t: any) => t.id === editId));

      if (isMock || (isEdit && editId && editId >= 10000)) {
        if (isEdit) {
          const updated = localTips.map((t: any) => t.id === editId ? { ...t, ...payload } : t);
          localStorage.setItem(localTipsKey, JSON.stringify(updated));
        } else {
          localStorage.setItem(localTipsKey, JSON.stringify([...localTips, { id: Date.now(), ...payload }]));
        }
        return { success: true };
      }

      try {
        if (isEdit && editId !== null) {
          const { error } = await supabase
            .from("tourism_tips")
            .update(payload)
            .eq("id", editId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("tourism_tips")
            .insert(payload);
          if (error) throw error;
        }
      } catch (err) {
        // Fallback to local storage if supabase fails
        if (isEdit) {
          const updated = localTips.map((t: any) => t.id === editId ? { ...t, ...payload } : t);
          localStorage.setItem(localTipsKey, JSON.stringify(updated));
        } else {
          localStorage.setItem(localTipsKey, JSON.stringify([...localTips, { id: Date.now(), ...payload }]));
        }
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-tips"] });
      setModal(null);
    }
  });

  // Delete tip mutation
  const del = useMutation({
    mutationFn: async (id: number) => {
      const localTipsKey = "hdv_mock_tourism_tips";
      const localTips = JSON.parse(localStorage.getItem(localTipsKey) || "[]");
      const hasLocal = localTips.some((t: any) => t.id === id);

      if (hasLocal) {
        localStorage.setItem(localTipsKey, JSON.stringify(localTips.filter((t: any) => t.id !== id)));
        return { success: true };
      }

      try {
        const { error } = await supabase
          .from("tourism_tips")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } catch (err) {
        localStorage.setItem(localTipsKey, JSON.stringify(localTips.filter((t: any) => t.id !== id)));
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-tips"] });
      setDelId(null);
    }
  });

  const openCreate = () => {
    setForm(EMPTY);
    setModal("create");
  };

  const openEdit = (t: Tip) => {
    setForm({
      title: t.title,
      content: t.content,
      imageUrl: t.imageUrl,
      icon: t.icon,
      sortOrder: t.sortOrder,
      isActive: t.isActive
    });
    setEditId(t.id);
    setModal("edit");
  };

  const setF = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const tips = [...rawTips].sort((a, b) => a.sortOrder - b.sortOrder);

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
        <div className="max-w-4xl mx-auto px-6 relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-brand-magenta/20">
              <Leaf className="w-4.5 h-4.5 text-brand-magenta" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Tips de Turismo</h1>
              <p className="text-white/50 text-xs font-semibold">{tips.length} consejos de viaje para usuarios</p>
            </div>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold border border-pink-700 cursor-pointer transition-transform hover:scale-102"
            style={{ background: "linear-gradient(90deg, #9B00CC, #FF0096)" }}>
            <Plus className="w-4 h-4" /> Nuevo Tip
          </button>
        </div>
      </div>

      <AdminTabBar />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="space-y-3">
            {Array(4).fill(0).map((_, i) => <div key={i} className="bg-white rounded-xl h-20 animate-pulse border" />)}
          </div>
        ) : tips.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-20 text-center shadow-xs">
            <Leaf className="w-10 h-10 text-gray-250 mx-auto mb-3" />
            <p className="text-gray-400 text-xs font-bold">No hay tips registrados aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tips.map((t: Tip) => (
              <div key={t.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-start gap-4 shadow-xs hover:shadow-sm transition-all">
                <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black text-white"
                  style={{ background: "linear-gradient(135deg, #9B00CC, #FF0096)" }}>{t.sortOrder}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${t.isActive ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-gray-500 bg-gray-100"}`}>
                      {t.isActive ? "Activo" : "Inactivo"}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold bg-slate-50 border px-2 py-0.5 rounded-full">icono: {t.icon}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">{t.title}</h3>
                  <p className="text-xs text-gray-400 font-semibold leading-relaxed mt-1">{t.content}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => openEdit(t)} className="w-8 h-8 rounded-lg bg-gray-50 border hover:bg-amber-50 hover:text-amber-600 transition-colors text-gray-400 flex items-center justify-center cursor-pointer">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDelId(t.id)} className="w-8 h-8 rounded-lg bg-gray-50 border hover:bg-red-50 hover:text-red-500 transition-colors text-gray-400 flex items-center justify-center cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setModal(null)}>
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">{modal === "create" ? "Nuevo Tip de Turismo" : "Editar Tip de Turismo"}</h2>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-gray-100 cursor-pointer"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Título *</label>
                <input value={form.title} onChange={e => setF("title", e.target.value)} className={inp} placeholder="Ej: Lleva siempre repelente" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Contenido *</label>
                <textarea value={form.content} onChange={e => setF("content", e.target.value)} rows={4} className={inp + " resize-none"} placeholder="Descripción del consejo..." />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Imagen URL</label>
                <input value={form.imageUrl} onChange={e => setF("imageUrl", e.target.value)} className={inp} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Ícono</label>
                  <select value={form.icon} onChange={e => setF("icon", e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-bold text-gray-700">
                    {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Orden de prioridad</label>
                  <input type="number" value={form.sortOrder} onChange={e => setF("sortOrder", parseInt(e.target.value) || 0)} className={inp} />
                </div>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer mt-2">
                <input type="checkbox" checked={form.isActive} onChange={e => setF("isActive", e.target.checked)} className="w-4 h-4 accent-pink-500 rounded" />
                <span className="text-xs font-bold text-gray-600">Activo (visible en la plataforma)</span>
              </label>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-2.5 justify-end">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-slate-100 hover:bg-slate-200 border cursor-pointer">Cancelar</button>
              <button onClick={() => save.mutate(form)} disabled={save.isPending || !form.title.trim() || !form.content.trim()} className="px-5 py-2 rounded-xl text-xs text-white font-bold disabled:opacity-50 border border-pink-700 cursor-pointer"
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
            <h3 className="font-bold text-gray-900 text-sm mb-1.5">¿Eliminar este tip?</h3>
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
