import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { Newspaper, Plus, Edit2, Trash2, X, Loader2, Globe, Search, Upload } from "lucide-react";

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  authorName: string;
  readingTime: number;
  status: string;
  publishedAt: string;
}

const EMPTY: Omit<Post, "id" | "publishedAt"> = { title: "", slug: "", excerpt: "", content: "", featuredImage: "", authorName: "", readingTime: 5, status: "draft" };
const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function AdminBlog() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const qc = useQueryClient();

  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [delId, setDelId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      nav("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Query to fetch blog posts
  const { data: posts = [], isLoading: loading } = useQuery<Post[]>({
    queryKey: ["admin-blog"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const dbPosts = (data || []).map((p: any) => ({
          id: p.id,
          title: p.title || "",
          slug: p.slug || "",
          excerpt: p.excerpt || "",
          content: p.content || "",
          featuredImage: p.featured_image || p.image_url || "",
          authorName: p.author_name || "Admin",
          readingTime: p.reading_time || 5,
          status: p.status || "draft",
          publishedAt: p.published_at || p.created_at
        }));

        return dbPosts;
      } catch (err) {
        console.warn("Error cargando artículos de Supabase, usando local storage:", err);
        const localBlogKey = "hdv_mock_blog_posts";
        const localPosts = JSON.parse(localStorage.getItem(localBlogKey) || "[]");
        if (localPosts.length === 0) {
          const defaults = [
            {
              id: 1,
              title: "Las 5 mejores playas de Morrocoy",
              slug: "playas-morrocoy",
              excerpt: "Un recorrido por los cayos más hermosos y cristalinos del Parque Nacional Morrocoy.",
              content: "Contenido del artículo de Morrocoy...",
              featuredImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
              authorName: "Admin",
              readingTime: 4,
              status: "published",
              publishedAt: new Date().toISOString()
            }
          ];
          localStorage.setItem(localBlogKey, JSON.stringify(defaults));
          return defaults;
        }
        return localPosts;
      }
    }
  });

  // Mutation to save post (create/edit)
  const save = useMutation({
    mutationFn: async (d: typeof EMPTY) => {
      const isEdit = modal === "edit";
      const localBlogKey = "hdv_mock_blog_posts";
      const localPosts = JSON.parse(localStorage.getItem(localBlogKey) || "[]");

      let finalImageUrl = d.featuredImage;
      if (finalImageUrl && finalImageUrl.startsWith("data:")) {
        const response = await fetch(finalImageUrl);
        const blob = await response.blob();
        const fileName = `blog/main-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage.from("establecimientos").upload(fileName, blob, { contentType: "image/jpeg", upsert: true });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("establecimientos").getPublicUrl(fileName);
        finalImageUrl = publicUrl;
      }

      const payload = {
        title: d.title,
        slug: d.slug,
        excerpt: d.excerpt,
        content: d.content,
        featuredImage: finalImageUrl,
        authorName: d.authorName,
        readingTime: d.readingTime,
        status: d.status
      };

      if (isEdit && editId) {
        // Update mock or database
        const hasLocal = localPosts.some((p: any) => p.id === editId);
        if (hasLocal) {
          const updated = localPosts.map((p: any) => p.id === editId ? { ...p, ...payload } : p);
          localStorage.setItem(localBlogKey, JSON.stringify(updated));
          return { success: true };
        }

        try {
          const { error } = await supabase
            .from("blog_posts")
            .update({
              title: d.title,
              slug: d.slug,
              excerpt: d.excerpt,
              content: d.content,
              featured_image: finalImageUrl,
              author_name: d.authorName,
              reading_time: d.readingTime,
              status: d.status
            })
            .eq("id", editId);
          if (error) throw error;
        } catch {
          // If update fails, update locally
          const updated = localPosts.map((p: any) => p.id === editId ? { ...p, ...payload } : p);
          localStorage.setItem(localBlogKey, JSON.stringify(updated));
        }
      } else {
        // Create new
        const newId = Date.now();
        const newPost = {
          id: newId,
          ...payload,
          publishedAt: new Date().toISOString()
        };

        try {
          const { error } = await supabase
            .from("blog_posts")
            .insert({
              title: d.title,
              slug: d.slug,
              excerpt: d.excerpt,
              content: d.content,
              featured_image: finalImageUrl,
              author_name: d.authorName,
              reading_time: d.readingTime,
              status: d.status
            });
          if (error) throw error;
        } catch {
          // Save locally if insert fails
          localStorage.setItem(localBlogKey, JSON.stringify([...localPosts, newPost]));
        }
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
      setModal(null);
    }
  });

  // Mutation to delete post
  const del = useMutation({
    mutationFn: async (id: number) => {
      const localBlogKey = "hdv_mock_blog_posts";
      const localPosts = JSON.parse(localStorage.getItem(localBlogKey) || "[]");
      const hasLocal = localPosts.some((p: any) => p.id === id);

      if (hasLocal) {
        const updated = localPosts.filter((p: any) => p.id !== id);
        localStorage.setItem(localBlogKey, JSON.stringify(updated));
        return { success: true };
      }

      try {
        const { error } = await supabase
          .from("blog_posts")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } catch {
        const updated = localPosts.filter((p: any) => p.id !== id);
        localStorage.setItem(localBlogKey, JSON.stringify(updated));
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-blog"] });
      setDelId(null);
    }
  });

  const openCreate = () => {
    setForm(EMPTY);
    setModal("create");
  };

  const openEdit = (p: Post) => {
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      featuredImage: p.featuredImage,
      authorName: p.authorName,
      readingTime: p.readingTime,
      status: p.status
    });
    setEditId(p.id);
    setModal("edit");
  };

  const setF = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  const inp = "w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-pink-500 font-semibold";

  // Filter posts based on search term
  const filtered = posts.filter(p => {
    const q = search.toLowerCase();
    return p.title.toLowerCase().includes(q) || 
           p.excerpt.toLowerCase().includes(q) || 
           p.authorName.toLowerCase().includes(q);
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
      <div className="relative overflow-hidden py-7" style={{ background: "linear-gradient(135deg, #0e0120, #1a0533)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#FF0096" }} />
        <div className="container mx-auto px-6 relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-brand-magenta/20">
              <Newspaper className="w-4 h-4 text-brand-magenta" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight font-sans uppercase">Panel de Artículos</h1>
              <p className="text-white/50 text-xs font-semibold">{posts.length} artículos publicados en total</p>
            </div>
          </div>
        </div>
      </div>

      <AdminTabBar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Blog Title & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">Blog</h2>
            <p className="text-xs text-gray-500 font-semibold mt-1">Gestiona los artículos del blog</p>
          </div>
          <button 
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shrink-0 transition-all hover:scale-102 cursor-pointer shadow-md shadow-pink-100"
            style={{ background: "linear-gradient(90deg, #FF0096, #cc007a)" }}
          >
            <Plus className="w-4 h-4" /> Nuevo Artículo
          </button>
        </div>

        {/* Search bar */}
        <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-200 shadow-xs">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar artículo por título, autor o extracto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs text-gray-700 placeholder-gray-400 outline-none focus:border-brand-magenta focus:bg-white font-semibold transition-all"
            />
          </div>
        </div>

        {/* Table of articles */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-20 text-center shadow-xs">
            <Loader2 className="w-10 h-10 animate-spin text-brand-magenta mx-auto mb-3" />
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Cargando artículos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-20 text-center shadow-xs">
            <Newspaper className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">No se encontraron artículos</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs mb-8">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Artículo</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider w-48">Autor</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider w-32">Lectura</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider w-36">Estado</th>
                    <th className="text-center px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider w-36">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex gap-4 items-center">
                          {p.featuredImage ? (
                            <img 
                              src={p.featuredImage} 
                              alt={p.title} 
                              className="w-16 h-12 rounded-lg object-cover shrink-0 border border-slate-100 shadow-sm" 
                              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : (
                            <div className="w-16 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-150">
                              <Newspaper className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-gray-800 text-xs block leading-snug">{p.title}</span>
                            <span className="text-[10px] text-slate-400 font-bold block mt-1 line-clamp-1 leading-normal">{p.excerpt}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600 block">{p.authorName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                          <span>⏱️ {p.readingTime} min</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          p.status === "published"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}>
                          {p.status === "published" ? "Publicado" : "Borrador"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <a 
                            href={`/blog/${p.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-brand-magenta transition-colors cursor-pointer"
                            title="Ver en la web"
                          >
                            <Globe className="w-4 h-4" />
                          </a>
                          <button 
                            onClick={() => openEdit(p)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                            title="Editar artículo"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDelId(p.id)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Eliminar artículo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setModal(null)}>
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-900">{modal === "create" ? "Crear Nuevo Artículo" : "Editar Artículo"}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Título *</label>
                <input value={form.title} onChange={e => { setF("title", e.target.value); if (modal === "create") setF("slug", slugify(e.target.value)); }} className={inp} placeholder="Ej: Las maravillas del Salto Ángel" /></div>
              <div><label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Slug (URL)</label>
                <input value={form.slug} onChange={e => setF("slug", e.target.value)} className={inp + " font-mono text-pink-600 bg-slate-50"} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Autor</label>
                  <input value={form.authorName} onChange={e => setF("authorName", e.target.value)} className={inp} /></div>
                <div><label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Tiempo de Lectura (minutos)</label>
                  <input type="number" value={form.readingTime} onChange={e => setF("readingTime", parseInt(e.target.value) || 5)} className={inp} /></div>
              </div>
              <div><label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">URL de Imagen Principal (o Subir)</label>
                <div className="flex gap-2">
                  <input value={form.featuredImage} onChange={e => setF("featuredImage", e.target.value)} className={inp + " flex-1"} placeholder="https://..." />
                  <label className="flex items-center justify-center px-4 py-2 border border-dashed border-[#00C8D4]/40 bg-[#00C8D4]/5 hover:bg-[#00C8D4]/10 rounded-xl text-xs font-bold uppercase text-[#00C8D4] tracking-wider cursor-pointer transition-colors shrink-0">
                    <Upload className="w-4 h-4 mr-1" /> Subir
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0]; if (!file) return;
                        const r = new FileReader(); r.onload = () => setF("featuredImage", r.result as string); r.readAsDataURL(file);
                      }} 
                    />
                  </label>
                </div>
              </div>
              <div><label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Estado de Publicación</label>
                <select value={form.status} onChange={e => setF("status", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none font-bold">
                  <option value="draft">Borrador (Oculto)</option>
                  <option value="published">Publicado (Visible)</option>
                </select>
              </div>
              <div><label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Extracto / Resumen</label>
                <textarea value={form.excerpt} onChange={e => setF("excerpt", e.target.value)} rows={2} className={inp + " resize-none"} placeholder="Breve resumen para la lista del blog..." /></div>
              <div><label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Contenido del Artículo</label>
                <textarea value={form.content} onChange={e => setF("content", e.target.value)} rows={8} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-pink-500 font-semibold resize-y" placeholder="Escribe el cuerpo del artículo..." /></div>
            </div>
            <div className="p-5 border-t border-gray-200 flex gap-3 justify-end">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer">Cancelar</button>
              <button onClick={() => save.mutate(form)} disabled={save.isPending} className="px-5 py-2 rounded-xl text-xs font-bold text-white border border-pink-700 disabled:opacity-50 cursor-pointer"
                style={{ background: "linear-gradient(90deg, #FF0096, #cc007a)" }}>
                {save.isPending ? "Guardando..." : "Guardar Artículo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {delId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 mb-2">¿Eliminar artículo?</h3>
            <p className="text-xs text-gray-500 font-semibold mb-5">Esta acción es permanente y no se podrá deshacer.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDelId(null)} className="px-4 py-2 rounded-xl bg-slate-100 border text-slate-700 text-xs font-bold cursor-pointer">Cancelar</button>
              <button onClick={() => del.mutate(delId)} disabled={del.isPending} className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer border border-red-700">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
