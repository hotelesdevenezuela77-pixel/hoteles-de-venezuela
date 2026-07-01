import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import {
  Link2, Plus, Edit2, Trash2, ExternalLink,
  ToggleLeft, ToggleRight, X, Globe, Loader2,
} from "lucide-react";

interface LinkItem {
  id: number; title: string; url: string; description: string;
  iconUrl: string; category: string; isActive: boolean; sortOrder: number;
}

const EMPTY = { title: "", url: "", description: "", iconUrl: "", category: "general", isActive: true, sortOrder: 0 };

const CATS: Record<string, { label: string; color: string; bg: string }> = {
  general:       { label: "General",       color: "#6366F1", bg: "rgba(99,102,241,0.1)" },
  socials:       { label: "Redes Sociales", color: "#FF0096", bg: "rgba(255,0,150,0.1)" },
  partners:      { label: "Aliados",        color: "#00C8D4", bg: "rgba(0,200,212,0.1)" },
  tools:         { label: "Herramientas",   color: "#9B00CC", bg: "rgba(155,0,204,0.1)" },
  documentation: { label: "Documentación", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  resources:     { label: "Recursos",       color: "#10B981", bg: "rgba(16,185,129,0.1)" },
};

function getDomain(url: string) {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
}

export function AdminLinkHub() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [delId, setDelId] = useState<number | null>(null);
  const [filterCat, setFilterCat] = useState("all");

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      nav("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Fetch links query
  const { data: links = [], isLoading: loading } = useQuery<any[]>({
    queryKey: ["corporate-links"],
    queryFn: async () => {
      let dbData: any[] = [];
      try {
        const { data, error } = await supabase
          .from("corporate_links")
          .select("*")
          .order("id");
        if (error) throw error;
        dbData = data || [];
      } catch (err) {
        console.warn("Supabase corporate_links failed, falling back to local storage:", err);
      }

      const localKey = "hdv_mock_corporate_links";
      const fallback = [
        { id: 1, title: "Sitio Web Principal", url: "https://hotelesdevenezuela.com", description: "Enlace al portal público principal.", icon_url: "", category: "general", is_active: true, sort_order: 1 },
        { id: 2, title: "Canal de Instagram", url: "https://instagram.com", description: "Nuestra cuenta de redes sociales oficial.", icon_url: "", category: "socials", is_active: true, sort_order: 2 }
      ];

      let local = localStorage.getItem(localKey);
      if (!local) {
        localStorage.setItem(localKey, JSON.stringify(fallback));
        local = JSON.stringify(fallback);
      }
      const localData = JSON.parse(local);
      const combined = [...dbData, ...localData];

      const seen = new Set();
      const result: any[] = [];
      combined.forEach((item: any) => {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          result.push({
            id: item.id,
            title: item.title,
            url: item.url,
            description: item.description ?? "",
            iconUrl: item.icon_url || item.iconUrl || "",
            category: item.category ?? "general",
            isActive: item.is_active ?? item.isActive ?? true,
            sortOrder: item.sort_order ?? item.sortOrder ?? 0
          });
        }
      });
      return result;
    }
  });

  // Save link mutation
  const save = useMutation({
    mutationFn: async (d: typeof EMPTY) => {
      const isEdit = modal === "edit";
      const payload = {
        title: d.title,
        url: d.url,
        description: d.description,
        icon_url: d.iconUrl,
        category: d.category,
        is_active: d.isActive,
        sort_order: d.sortOrder
      };

      const localKey = "hdv_mock_corporate_links";
      const localData = JSON.parse(localStorage.getItem(localKey) || "[]");
      const isMock = isEdit && editId && (editId >= 10000 || localData.some((item: any) => item.id === editId));

      if (isMock || (isEdit && editId && editId >= 10000)) {
        if (isEdit) {
          const updated = localData.map((item: any) => item.id === editId ? { ...item, ...payload } : item);
          localStorage.setItem(localKey, JSON.stringify(updated));
        } else {
          localStorage.setItem(localKey, JSON.stringify([...localData, { id: Date.now(), ...payload }]));
        }
        return { success: true };
      }

      try {
        if (isEdit && editId) {
          const { error } = await supabase
            .from("corporate_links")
            .update(payload)
            .eq("id", editId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("corporate_links")
            .insert(payload);
          if (error) throw error;
        }
      } catch (err) {
        console.warn("Supabase corporate_links upsert failed, writing locally:", err);
        if (isEdit) {
          const updated = localData.map((item: any) => item.id === editId ? { ...item, ...payload } : item);
          localStorage.setItem(localKey, JSON.stringify(updated));
        } else {
          localStorage.setItem(localKey, JSON.stringify([...localData, { id: Date.now(), ...payload }]));
        }
      }
      return { success: true };
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["corporate-links"] }); setModal(null); },
  });

  // Delete link mutation
  const del = useMutation({
    mutationFn: async (id: number) => {
      const localKey = "hdv_mock_corporate_links";
      const localData = JSON.parse(localStorage.getItem(localKey) || "[]");
      const hasLocal = localData.some((item: any) => item.id === id);

      if (hasLocal) {
        localStorage.setItem(localKey, JSON.stringify(localData.filter((item: any) => item.id !== id)));
        return { success: true };
      }

      try {
        const { error } = await supabase
          .from("corporate_links")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } catch (err) {
        console.warn("Supabase delete failed, deleting locally:", err);
        localStorage.setItem(localKey, JSON.stringify(localData.filter((item: any) => item.id !== id)));
      }
      return { success: true };
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["corporate-links"] }); setDelId(null); },
  });

  // Toggle active state mutation
  const toggle = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const localKey = "hdv_mock_corporate_links";
      const localData = JSON.parse(localStorage.getItem(localKey) || "[]");
      const hasLocal = localData.some((item: any) => item.id === id);

      if (hasLocal) {
        const updated = localData.map((item: any) => item.id === id ? { ...item, is_active: isActive } : item);
        localStorage.setItem(localKey, JSON.stringify(updated));
        return { success: true };
      }

      try {
        const { error } = await supabase
          .from("corporate_links")
          .update({ is_active: isActive })
          .eq("id", id);
        if (error) throw error;
      } catch (err) {
        console.warn("Supabase toggle failed, writing locally:", err);
        const updated = localData.map((item: any) => item.id === id ? { ...item, is_active: isActive } : item);
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
      return { success: true };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["corporate-links"] }),
  });

  const openEdit = (l: LinkItem) => {
    setForm({ title: l.title, url: l.url, description: l.description, iconUrl: l.iconUrl, category: l.category, isActive: l.isActive, sortOrder: l.sortOrder });
    setEditId(l.id); setModal("edit");
  };
  const setF = (k: string, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }));

  const filtered = filterCat === "all" ? links : links.filter(l => l.category === filterCat);
  const activeCats = [...new Set(links.map(l => l.category))];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
        <p className="text-gray-500 text-xs font-bold">Verificando credenciales de seguridad...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="relative overflow-hidden py-8" style={{ background: "linear-gradient(135deg, #0e0120, #1a0533)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#6366F1" }} />
        <div className="container mx-auto px-4 relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.2)" }}>
              <Link2 className="w-4 h-4" style={{ color: "#818CF8" }} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">Link Hub</h1>
              <p className="text-white/50 text-xs font-semibold">Gestiona los enlaces corporativos y recursos del sitio</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-white/50">{links.length} enlace{links.length !== 1 ? "s" : ""}</span>
            <button
              onClick={() => { setForm(EMPTY); setModal("create"); }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium cursor-pointer"
              style={{ background: "linear-gradient(90deg, #6366F1, #9B00CC)" }}>
              <Plus className="w-4 h-4" /> Nuevo Enlace
            </button>
          </div>
        </div>
      </div>

      <AdminTabBar />

      <div className="container mx-auto px-4 py-6">
        {/* Category filter */}
        {activeCats.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-5">
            <button
              onClick={() => setFilterCat("all")}
              className="px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer"
              style={filterCat === "all"
                ? { background: "linear-gradient(90deg, #6366F1, #9B00CC)", color: "#fff" }
                : { background: "#fff", color: "#6B7280", border: "1px solid #E5E7EB" }}>
              Todos ({links.length})
            </button>
            {activeCats.map(cat => {
              const meta = CATS[cat] ?? { label: cat, color: "#6B7280", bg: "#F3F4F6" };
              return (
                <button key={cat} onClick={() => setFilterCat(cat)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer"
                  style={filterCat === cat
                    ? { background: meta.color, color: "#fff" }
                    : { background: "#fff", color: "#6B7280", border: "1px solid #E5E7EB" }}>
                  {meta.label} ({links.filter(l => l.category === cat).length})
                </button>
              );
            })}
          </div>
        )}

        {/* Cards grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-gray-100 shadow-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-2.5 bg-gray-100 rounded w-full mb-1.5" />
                <div className="h-2.5 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl py-20 text-center border border-gray-100 shadow-xs">
            <Link2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-bold">No hay enlaces registrados</p>
            <button onClick={() => { setForm(EMPTY); setModal("create"); }}
              className="mt-4 px-4 py-2 rounded-full text-sm text-white font-medium cursor-pointer"
              style={{ background: "linear-gradient(90deg, #6366F1, #9B00CC)" }}>
              + Agregar primer enlace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(l => {
              const catMeta = CATS[l.category] ?? { label: l.category, color: "#6B7280", bg: "#F3F4F6" };
              return (
                <div key={l.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 transition-shadow hover:shadow-lg"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.07)", opacity: l.isActive ? 1 : 0.6 }}>

                  {/* Top accent bar */}
                  <div className="h-1" style={{ background: catMeta.color }} />

                  <div className="p-4">
                    {/* Icon + title */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                        style={{ background: catMeta.bg }}>
                        {l.iconUrl
                          ? <img src={l.iconUrl} alt="" className="w-7 h-7 object-contain"
                              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          : <Globe className="w-5 h-5" style={{ color: catMeta.color }} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{l.title}</h3>
                        <a href={l.url} target="_blank" rel="noopener noreferrer"
                          className="text-[11px] flex items-center gap-1 mt-0.5 hover:underline truncate font-semibold"
                          style={{ color: catMeta.color }}>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          {getDomain(l.url)}
                        </a>
                      </div>
                    </div>

                    {/* Category badge */}
                    <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-bold mb-2"
                      style={{ background: catMeta.bg, color: catMeta.color }}>
                      {catMeta.label}
                    </span>

                    {/* Description */}
                    {l.description && (
                      <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed font-semibold">{l.description}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-gray-50">
                      <button onClick={() => toggle.mutate({ id: l.id, isActive: !l.isActive })}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                        style={l.isActive
                          ? { background: "rgba(16,185,129,0.08)", color: "#059669" }
                          : { background: "#F3F4F6", color: "#9CA3AF" }}>
                        {l.isActive
                          ? <ToggleRight className="w-3.5 h-3.5" />
                          : <ToggleLeft className="w-3.5 h-3.5" />}
                        {l.isActive ? "Activo" : "Inactivo"}
                      </button>
                      <button onClick={() => openEdit(l)}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-amber-50 hover:text-amber-600 transition-colors text-gray-400 cursor-pointer">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDelId(l.id)}
                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 transition-colors text-gray-400 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="mt-4 text-xs text-gray-400 text-right font-semibold">
            {filtered.length} enlace{filtered.length !== 1 ? "s" : ""}
            {" · "}{links.filter(l => l.isActive).length} activo{links.filter(l => l.isActive).length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* ── MODAL: Crear / Editar ─────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{modal === "create" ? "Nuevo Enlace" : "Editar Enlace"}</h2>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">Título *</label>
                <input value={form.title} onChange={e => setF("title", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 font-semibold" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">URL *</label>
                <input value={form.url} onChange={e => setF("url", e.target.value)} placeholder="https://..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 font-semibold" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">URL del Ícono</label>
                <input value={form.iconUrl} onChange={e => setF("iconUrl", e.target.value)} placeholder="https://... (opcional)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 font-semibold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block font-medium">Categoría</label>
                  <select value={form.category} onChange={e => setF("category", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white font-semibold">
                    {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block font-medium">Orden</label>
                  <input type="number" value={form.sortOrder} onChange={e => setF("sortOrder", parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 font-semibold" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">Descripción</label>
                <textarea value={form.description} onChange={e => setF("description", e.target.value)} rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none font-semibold" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setF("isActive", e.target.checked)}
                  className="w-4 h-4 accent-indigo-600" />
                <span className="text-sm text-gray-700 font-semibold">Enlace activo (visible en el sitio)</span>
              </label>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setModal(null)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 cursor-pointer">
                Cancelar
              </button>
              <button onClick={() => save.mutate(form)} disabled={!form.title || !form.url || save.isPending}
                className="px-5 py-2.5 rounded-xl text-sm text-white font-medium disabled:opacity-50 cursor-pointer"
                style={{ background: "linear-gradient(90deg, #6366F1, #9B00CC)" }}>
                {save.isPending ? "Guardando..." : modal === "create" ? "Crear Enlace" : "Actualizar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Confirmar Eliminar ─────────────────────────────── */}
      {delId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-semibold text-gray-900 mb-1">¿Eliminar enlace?</h3>
            <p className="text-sm text-gray-500 mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDelId(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 cursor-pointer">
                Cancelar
              </button>
              <button onClick={() => del.mutate(delId)} disabled={del.isPending}
                className="px-4 py-2 rounded-xl text-sm text-white font-medium disabled:opacity-50 cursor-pointer"
                style={{ background: "#EF4444" }}>
                {del.isPending ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
