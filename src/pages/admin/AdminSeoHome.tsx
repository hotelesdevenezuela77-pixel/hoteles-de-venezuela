import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { Search, Plus, Edit2, X, ExternalLink, Globe, CheckCircle, Loader2 } from "lucide-react";

interface SeoSetting {
  id: number; pageKey: string;
  pageTitle: string; metaDescription: string; metaKeywords: string; ogImage: string;
}

const PAGE_LABELS: Record<string, { label: string; url: string; emoji: string }> = {
  home:           { label: "Página Principal",     url: "/",                emoji: "🏠" },
  destinations:   { label: "Destinos",             url: "/destinos",        emoji: "🗺️" },
  establishments: { label: "Establecimientos",     url: "/establecimientos",emoji: "🏨" },
  blog:           { label: "Blog",                 url: "/blog",            emoji: "📝" },
  packages:       { label: "Paquetes Turísticos",  url: "/paquetes",        emoji: "✈️" },
  parks:          { label: "Parques Nacionales",   url: "/parques",         emoji: "🌿" },
  sites:          { label: "Sitios Turísticos",    url: "/sitios-turisticos",emoji: "📍"},
  contact:        { label: "Contacto",             url: "/contacto",        emoji: "📧" },
  about:          { label: "Nosotros",             url: "/nosotros",        emoji: "ℹ️" },
};

const EMPTY_FORM = { pageTitle: "", metaDescription: "", metaKeywords: "", ogImage: "" };

function charColor(len: number, max: number) {
  const pct = len / max;
  if (pct > 0.9) return "#EF4444";
  if (pct > 0.75) return "#F59E0B";
  return "#10B981";
}

export function AdminSeoHome() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [showNew, setShowNew] = useState(false);
  const [newKey, setNewKey] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      nav("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Fetch settings query
  const { data: settings = [], isLoading: loading } = useQuery<any[]>({
    queryKey: ["seo-settings"],
    queryFn: async () => {
      let dbData: any[] = [];
      try {
        const { data, error } = await supabase
          .from("seo_settings")
          .select("*")
          .order("id");
        if (error) throw error;
        dbData = data || [];
      } catch (err) {
        console.warn("Supabase seo_settings failed, falling back to local storage:", err);
      }

      const localKey = "hdv_mock_seo_settings";
      const fallback = [
        { id: 1, page_key: "home", page_title: "Hoteles de Venezuela | Directorio de Alojamientos", meta_description: "Directorio oficial de hoteles y posadas de Venezuela. Encuentra y reserva tu estadía.", meta_keywords: "hoteles venezuela, posadas, turismo", og_image: "" },
        { id: 2, page_key: "destinations", page_title: "Destinos en Venezuela | Dónde viajar", meta_description: "Explora los mejores destinos turísticos de Venezuela desde las playas hasta los Andes.", meta_keywords: "destinos, turismo venezuela, playas", og_image: "" },
        { id: 3, page_key: "establishments", page_title: "Establecimientos | Dónde Hospedarse", meta_description: "Catálogo completo de hoteles, resorts, posadas y cabañas en toda Venezuela.", meta_keywords: "hoteles, hospedaje, posadas, alojamiento", og_image: "" }
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
        const k = item.page_key || item.pageKey;
        if (k && !seen.has(k)) {
          seen.add(k);
          result.push({
            id: item.id,
            pageKey: k,
            pageTitle: item.page_title ?? item.pageTitle ?? "",
            metaDescription: item.meta_description ?? item.metaDescription ?? "",
            metaKeywords: item.meta_keywords ?? item.metaKeywords ?? "",
            ogImage: item.og_image ?? item.ogImage ?? ""
          });
        }
      });
      return result;
    }
  });

  // Update setting mutation
  const update = useMutation({
    mutationFn: async ({ key, ...body }: { key: string } & typeof EMPTY_FORM) => {
      const payload = {
        page_key: key,
        page_title: body.pageTitle,
        meta_description: body.metaDescription,
        meta_keywords: body.metaKeywords,
        og_image: body.ogImage
      };

      const localKey = "hdv_mock_seo_settings";
      const localData = JSON.parse(localStorage.getItem(localKey) || "[]");
      const isMock = localData.some((item: any) => (item.page_key || item.pageKey) === key);

      if (isMock) {
        const updated = localData.map((item: any) => {
          const k = item.page_key || item.pageKey;
          if (k === key) {
            return { ...item, ...payload };
          }
          return item;
        });
        localStorage.setItem(localKey, JSON.stringify(updated));
        return { success: true };
      }

      try {
        const { error } = await supabase
          .from("seo_settings")
          .upsert(payload, { onConflict: 'page_key' });
        if (error) throw error;
      } catch (err) {
        console.warn("Supabase upsert failed, saving setting locally:", err);
        const updated = localData.map((item: any) => {
          const k = item.page_key || item.pageKey;
          if (k === key) {
            return { ...item, ...payload };
          }
          return item;
        });
        localStorage.setItem(localKey, JSON.stringify(updated));
      }
      return { success: true };
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["seo-settings"] }); setEditKey(null); setShowNew(false); setNewKey(""); },
  });

  const knownKeys = Object.keys(PAGE_LABELS);
  const sorted = [...settings].sort((a, b) => {
    const ai = knownKeys.indexOf(a.pageKey);
    const bi = knownKeys.indexOf(b.pageKey);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  const openEdit = (s: SeoSetting) => {
    setEditKey(s.pageKey);
    setShowNew(false);
    setEditForm({ pageTitle: s.pageTitle ?? "", metaDescription: s.metaDescription ?? "", metaKeywords: s.metaKeywords ?? "", ogImage: s.ogImage ?? "" });
  };

  const seoScore = (s: SeoSetting) => {
    let score = 0;
    if (s.pageTitle?.length >= 30 && s.pageTitle?.length <= 60) score++;
    if (s.metaDescription?.length >= 120 && s.metaDescription?.length <= 160) score++;
    if (s.metaKeywords?.length > 0) score++;
    if (s.ogImage?.length > 0) score++;
    return score;
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
    <>
      {/* Header */}
      <div className="relative overflow-hidden py-8" style={{ background: "linear-gradient(135deg, #0e0120, #1a0533)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#10B981" }} />
        <div className="container mx-auto px-4 relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.2)" }}>
              <Search className="w-4 h-4" style={{ color: "#10B981" }} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">SEO — Metadatos</h1>
              <p className="text-white/50 text-xs">Título, descripción y palabras clave por página</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-white/50">{sorted.length} página{sorted.length !== 1 ? "s" : ""}</span>
            <button
              onClick={() => { setShowNew(true); setEditKey(null); setEditForm(EMPTY_FORM); setNewKey(""); }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium cursor-pointer"
              style={{ background: "linear-gradient(90deg, #10B981, #059669)" }}>
              <Plus className="w-4 h-4" /> Nueva página
            </button>
          </div>
        </div>
      </div>

      <AdminTabBar />

      <div className="container mx-auto px-4 py-6 max-w-4xl">

        {/* New form */}
        {showNew && (
          <div className="bg-white rounded-2xl p-6 mb-5 border-2 border-green-500 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Nueva configuración SEO</h3>
              <button onClick={() => setShowNew(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">Clave de página (ej: home, blog, about)</label>
                <input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="home"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 font-mono font-semibold" />
              </div>
              <SeoFormFields form={editForm} setForm={setEditForm} />
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-xl bg-gray-100 text-sm text-gray-600 cursor-pointer">Cancelar</button>
                <button onClick={() => newKey.trim() && update.mutate({ key: newKey.trim(), ...editForm })}
                  disabled={update.isPending || !newKey.trim()}
                  className="px-5 py-2 rounded-xl text-sm text-white font-medium disabled:opacity-50 cursor-pointer"
                  style={{ background: "linear-gradient(90deg, #10B981, #059669)" }}>
                  {update.isPending ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cards list */}
        {loading ? (
          <div className="space-y-3">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-gray-100 shadow-xs">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="bg-white rounded-2xl py-20 text-center border border-gray-100 shadow-xs">
            <Globe className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm mb-4">No hay ajustes SEO configurados</p>
            <button onClick={() => { setShowNew(true); setEditForm(EMPTY_FORM); setNewKey(""); }}
              className="px-5 py-2.5 rounded-full text-sm text-white font-medium cursor-pointer"
              style={{ background: "linear-gradient(90deg, #10B981, #059669)" }}>
              + Agregar primera página
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(s => {
              const meta = PAGE_LABELS[s.pageKey];
              const score = seoScore(s);
              const isEditing = editKey === s.pageKey;
              return (
                <div key={s.pageKey} className="bg-white rounded-2xl overflow-hidden border border-gray-100 transition-shadow hover:shadow-md"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
                  {isEditing ? (
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{meta?.emoji ?? "📄"}</span>
                          <span className="font-semibold text-gray-900">{meta?.label ?? s.pageKey}</span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{s.pageKey}</span>
                        </div>
                        <button onClick={() => setEditKey(null)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer">
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      <SeoFormFields form={editForm} setForm={setEditForm} />
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setEditKey(null)} className="px-4 py-2 rounded-xl bg-gray-100 text-sm text-gray-600 cursor-pointer">Cancelar</button>
                        <button onClick={() => update.mutate({ key: s.pageKey, ...editForm })} disabled={update.isPending}
                          className="px-5 py-2 rounded-xl text-sm text-white font-medium disabled:opacity-50 cursor-pointer"
                          style={{ background: "linear-gradient(90deg, #10B981, #059669)" }}>
                          {update.isPending ? "Guardando..." : "Actualizar"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 flex items-start gap-4">
                      {/* Page icon */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 bg-gray-50">
                        {meta?.emoji ?? "📄"}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="font-semibold text-gray-900 text-sm">{meta?.label ?? s.pageKey}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-400">{s.pageKey}</span>
                          {meta?.url && (
                            <a href={meta.url} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] flex items-center gap-0.5 hover:underline font-semibold"
                              style={{ color: "#10B981" }}>
                              <ExternalLink className="w-2.5 h-2.5" />{meta.url}
                            </a>
                          )}
                        </div>
                        {s.pageTitle && <p className="text-xs font-bold text-gray-700 truncate">{s.pageTitle}</p>}
                        {s.metaDescription && <p className="text-xs text-gray-400 line-clamp-1 mt-0.5 font-semibold">{s.metaDescription}</p>}
                        {/* SEO score */}
                        <div className="flex items-center gap-1 mt-2">
                          {Array(4).fill(0).map((_, i) => (
                            <div key={i} className="h-1 w-6 rounded-full" style={{ background: i < score ? "#10B981" : "#E5E7EB" }} />
                          ))}
                          <span className="text-[10px] text-gray-400 ml-1 font-semibold">{score}/4 campos</span>
                          {score === 4 && <CheckCircle className="w-3 h-3 ml-0.5" style={{ color: "#10B981" }} />}
                        </div>
                      </div>

                      {/* Edit button */}
                      <button onClick={() => openEdit(s)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-green-50 hover:text-green-600 transition-colors text-gray-400 shrink-0 cursor-pointer">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function SeoFormFields({ form, setForm }: { form: typeof EMPTY_FORM; setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>> }) {
  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-500 font-medium">Título de página</label>
          <span className="text-[10px] font-mono" style={{ color: charColor(form.pageTitle.length, 60) }}>
            {form.pageTitle.length}/60
          </span>
        </div>
        <input value={form.pageTitle} onChange={e => setForm(f => ({ ...f, pageTitle: e.target.value }))} maxLength={60}
          placeholder="Hoteles de Venezuela | Directorio Turístico"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 font-semibold" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-500 font-medium">Meta descripción</label>
          <span className="text-[10px] font-mono" style={{ color: charColor(form.metaDescription.length, 160) }}>
            {form.metaDescription.length}/160
          </span>
        </div>
        <textarea value={form.metaDescription} onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))} maxLength={160} rows={2}
          placeholder="Descripción que aparece en Google (120–160 caracteres ideales)"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 resize-none font-semibold" />
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block font-medium">Palabras clave (separadas por coma)</label>
        <input value={form.metaKeywords} onChange={e => setForm(f => ({ ...f, metaKeywords: e.target.value }))}
          placeholder="hoteles venezuela, posadas, turismo"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 font-semibold" />
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block font-medium">OG Image URL (imagen social)</label>
        <input value={form.ogImage} onChange={e => setForm(f => ({ ...f, ogImage: e.target.value }))}
          placeholder="https://..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 font-semibold" />
      </div>
    </div>
  );
}
