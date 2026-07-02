import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { MapPin, Plus, Edit2, Trash2, Star, Eye, X, Loader2, Upload } from "lucide-react";

interface Destination {
  id: number;
  name: string;
  slug: string;
  state: string | null;
  imageUrl: string | null;
  description: string | null;
  isFeatured: boolean | null;
  galleryImages?: string[];
  attractions?: string | null;
}

function autoSlug(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}

const VE_STATES = [
  "Amazonas","Anzoátegui","Apure","Aragua","Barinas","Bolívar","Carabobo","Cojedes",
  "Delta Amacuro","Distrito Capital","Falcón","Guárico","Lara","Mérida","Miranda",
  "Monagas","Nueva Esparta","Portuguesa","Sucre","Táchira","Trujillo","Vargas",
  "Yaracuy","Zulia",
];

async function uploadImageIfNeeded(url: string | null, pathPrefix: string): Promise<string | null> {
  if (!url) return null;
  if (!url.startsWith("data:")) return url;
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const fileName = `destinos/${pathPrefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.jpg`;
    const { error } = await supabase.storage.from("establecimientos").upload(fileName, blob, { contentType: "image/jpeg", upsert: true });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from("establecimientos").getPublicUrl(fileName);
    return publicUrl;
  } catch (err) {
    console.error("Failed to upload image:", err);
    return null;
  }
}

interface DestForm {
  name: string;
  slug: string;
  state: string;
  description: string;
  imageUrl: string;
  isFeatured: boolean;
  galleryImages: string[];
  attractions: string;
}

const EMPTY: DestForm = { name: "", slug: "", state: "", description: "", imageUrl: "", isFeatured: false, galleryImages: [], attractions: "" };

export function AdminDestinos() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<DestForm>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Query to fetch destinations
  const { data: dests = [], isLoading } = useQuery<Destination[]>({
    queryKey: ["admin-destinations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .order("name");

      if (error) throw error;

      const localDestsKey = "hdv_mock_destinations";
      const localDests = JSON.parse(localStorage.getItem(localDestsKey) || "[]");
      const combined = [...(data || []), ...localDests];

      return combined.map((d: any) => ({
        id: d.id,
        name: d.name,
        slug: d.slug,
        state: d.state || null,
        imageUrl: d.image_url || null,
        description: d.description || null,
        isFeatured: !!d.is_featured,
        galleryImages: d.gallery_images ? d.gallery_images.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        attractions: d.attractions || null
      }));
    }
  });

  // Mutation to create destination
  const createMut = useMutation({
    mutationFn: async (d: DestForm) => {
      const finalMainImg = await uploadImageIfNeeded(d.imageUrl, "main");
      const finalGalleryUrls = await Promise.all(
        d.galleryImages.map((imgUrl, i) => uploadImageIfNeeded(imgUrl, `gallery-${i}`))
      );
      const galleryString = finalGalleryUrls.filter(Boolean).join(",");

      const payload = {
        name: d.name,
        slug: d.slug,
        state: d.state || null,
        description: d.description || null,
        image_url: finalMainImg,
        is_featured: d.isFeatured,
        gallery_images: galleryString || null,
        attractions: d.attractions || null
      };

      const { error } = await supabase
        .from("destinations")
        .insert(payload);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-destinations"] });
      setShowForm(false);
      setForm(EMPTY);
      setEditId(null);
    }
  });

  // Mutation to update destination
  const updateMut = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: DestForm }) => {
      const localDestsKey = "hdv_mock_destinations";
      const localDests = JSON.parse(localStorage.getItem(localDestsKey) || "[]");
      const hasLocal = localDests.some((d: any) => d.id === id);

      const finalMainImg = await uploadImageIfNeeded(data.imageUrl, "main");
      const finalGalleryUrls = await Promise.all(
        data.galleryImages.map((imgUrl, i) => uploadImageIfNeeded(imgUrl, `gallery-${i}`))
      );
      const galleryString = finalGalleryUrls.filter(Boolean).join(",");

      const payload = {
        name: data.name,
        slug: data.slug,
        state: data.state || null,
        description: data.description || null,
        image_url: finalMainImg,
        is_featured: data.isFeatured,
        gallery_images: galleryString || null,
        attractions: data.attractions || null
      };

      if (hasLocal) {
        const updated = localDests.map((d: any) => d.id === id ? { ...d, ...payload } : d);
        localStorage.setItem(localDestsKey, JSON.stringify(updated));
        return { success: true };
      }

      const { error } = await supabase
        .from("destinations")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-destinations"] });
      setEditId(null);
      setShowForm(false);
      setForm(EMPTY);
    }
  });

  // Mutation to delete destination
  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      const localDestsKey = "hdv_mock_destinations";
      const localDests = JSON.parse(localStorage.getItem(localDestsKey) || "[]");
      const hasLocal = localDests.some((d: any) => d.id === id);

      if (hasLocal) {
        const updated = localDests.filter((d: any) => d.id !== id);
        localStorage.setItem(localDestsKey, JSON.stringify(updated));
        return { success: true };
      }

      const { error } = await supabase
        .from("destinations")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-destinations"] });
      setConfirmDelete(null);
    }
  });

  const featured = dests.filter(d => d.isFeatured);

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (d: Destination) => {
    setEditId(d.id);
    setForm({
      name: d.name,
      slug: d.slug,
      state: d.state ?? "",
      description: d.description ?? "",
      imageUrl: d.imageUrl ?? "",
      isFeatured: !!d.isFeatured,
      galleryImages: d.galleryImages ?? [],
      attractions: d.attractions ?? ""
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const payload = { ...form, slug: form.slug || autoSlug(form.name) };
    if (editId !== null) updateMut.mutate({ id: editId, data: payload });
    else createMut.mutate(payload);
  };

  const busy = createMut.isPending || updateMut.isPending;

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
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#00C8D4" }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#00C8D4]/20">
              <MapPin className="w-4 h-4 text-[#00C8D4]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Destinos</h1>
              <p className="text-white/50 text-xs font-semibold">Gestiona los destinos turísticos nacionales de la plataforma</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/20">
              <Star className="w-3.5 h-3.5 fill-current" /> {featured.length} destacados
            </span>
            <button onClick={openCreate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold border border-[#0099A8] cursor-pointer transition-transform hover:scale-102"
              style={{ background: "linear-gradient(90deg, #00C8D4, #0099A8)" }}>
              <Plus className="w-4 h-4" /> Nuevo Destino
            </button>
          </div>
        </div>
      </div>

      <AdminTabBar />

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Form panel */}
        {showForm && (
          <div className="bg-white border-2 border-[#00C8D4] rounded-2xl p-6 mb-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm">{editId ? "Editar Destino" : "Crear Nuevo Destino"}</h3>
              <button onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY); }}
                className="w-8 h-8 rounded-lg bg-gray-50 border flex items-center justify-center hover:bg-gray-100 cursor-pointer">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Nombre *</label>
                <input placeholder="Ej: Los Roques" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-400 font-semibold" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: autoSlug(e.target.value) }))} />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Slug (URL)</label>
                <input placeholder="los-roques" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-400 font-semibold font-mono" value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Estado de Venezuela</label>
                <select className="w-full h-9 rounded-xl border border-gray-200 px-3 text-xs text-gray-700 bg-white focus:outline-none font-bold"
                  value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}>
                  <option value="">Seleccionar estado...</option>
                  {VE_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Atracciones Turísticas (Separadas por comas)</label>
                <input placeholder="Ej: Cayo Sombrero, Cayo Sal, Ruinas de El Tocuyo" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-400 font-semibold" value={form.attractions}
                  onChange={e => setForm(f => ({ ...f, attractions: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Imagen de Portada (URL o Subir)</label>
                <div className="flex gap-2">
                  <input placeholder="https://..." className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-400 font-semibold font-mono" value={form.imageUrl}
                    onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
                  <label className="flex items-center justify-center px-4 py-2 border border-dashed border-[#00C8D4]/40 bg-[#00C8D4]/5 hover:bg-[#00C8D4]/10 rounded-xl text-xs font-bold uppercase text-[#00C8D4] tracking-wider cursor-pointer transition-colors shrink-0">
                    <Upload className="w-4 h-4 mr-1" /> Subir
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0]; if (!file) return;
                        const r = new FileReader(); r.onload = () => setForm(f => ({ ...f, imageUrl: r.result as string })); r.readAsDataURL(file);
                      }} 
                    />
                  </label>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Descripción</label>
                <textarea rows={3} placeholder="Describe brevemente este destino..." className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-400 font-semibold resize-none"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              
              {/* GALERÍA DE IMÁGENES */}
              <div className="md:col-span-2 border-t border-slate-100 pt-4">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2 block">Galería de Fotos del Destino</label>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-3">
                  {form.galleryImages.map((imgUrl, i) => (
                    <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-gray-50 border border-gray-100 group">
                      <img src={imgUrl} alt={`gallery-${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, galleryImages: f.galleryImages.filter((_, idx) => idx !== i) }))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 hover:bg-red-650 text-white flex items-center justify-center text-xs font-bold cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Eliminar foto"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  {/* Add Image Card */}
                  <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-gray-200 hover:border-[#00C8D4] hover:bg-cyan-50/5 cursor-pointer transition-all text-gray-400 hover:text-[#00C8D4] group">
                    <Plus className="w-5 h-5 mb-0.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Añadir Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]; if (!file) return;
                        const r = new FileReader();
                        r.onload = () => setForm(f => ({ ...f, galleryImages: [...f.galleryImages, r.result as string] }));
                        r.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center mt-2">
                <button type="button" onClick={() => setForm(f => ({ ...f, isFeatured: !f.isFeatured }))}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer"
                  style={form.isFeatured
                    ? { background: "rgba(245,158,11,0.06)", color: "#D97706", borderColor: "rgba(245,158,11,0.3)" }
                    : { background: "#F1F5F9", color: "#64748b", borderColor: "#E2E8F0" }}>
                  <Star className="w-4 h-4" fill={form.isFeatured ? "#D97706" : "none"} stroke={form.isFeatured ? "#D97706" : "currentColor"} />
                  {form.isFeatured ? "Destacado" : "Marcar como destacado"}
                </button>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6 border-t border-slate-100 pt-4">
              <button onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY); }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-slate-150 border border-slate-200 hover:bg-slate-200 cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleSubmit} disabled={!form.name.trim() || busy}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white border border-[#0099A8] disabled:opacity-50 cursor-pointer"
                style={{ background: "linear-gradient(90deg, #00C8D4, #0099A8)" }}>
                {busy ? "Guardando..." : editId ? "Actualizar" : "Crear Destino"}
              </button>
            </div>
          </div>
        )}

        {/* Cards grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse shadow-xs" style={{ height: 220 }} />
            ))}
          </div>
        ) : dests.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-20 text-center shadow-xs">
            <MapPin className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-450 text-xs font-bold">No hay destinos turísticos registrados</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {dests.map(dest => (
                <div key={dest.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden group shadow-xs hover:shadow-sm transition-shadow">
                  {/* Image */}
                  <div className="relative h-36 overflow-hidden bg-slate-50 border-b border-slate-100">
                    {dest.imageUrl ? (
                      <img src={dest.imageUrl} alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-50">🗺️</div>
                    )}
                    {/* Featured badge */}
                    {dest.isFeatured && (
                      <div className="absolute top-2 left-2">
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black text-white"
                          style={{ background: "linear-gradient(90deg, #F59E0B, #D97706)" }}>
                          <Star className="w-2.5 h-2.5 fill-current" /> Destacado
                        </span>
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-12"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.15), transparent)" }} />
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm mb-0.5 truncate">{dest.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold mb-4">
                      <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: "#00C8D4" }} />
                      <span className="truncate text-slate-550 font-semibold">{dest.state ?? "Venezuela"}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 border-t border-slate-100 pt-3">
                      <a href={`/destinos/${dest.slug}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <button className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 bg-slate-50 border hover:bg-slate-100 cursor-pointer">
                          <Eye className="w-3 h-3" /> Ver
                        </button>
                      </a>
                      <button onClick={() => openEdit(dest)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 bg-slate-50 border hover:bg-slate-100 cursor-pointer">
                        <Edit2 className="w-3 h-3" /> Editar
                      </button>
                      {confirmDelete === dest.id ? (
                        <div className="flex gap-1 bg-red-50 border border-red-150 p-0.5 rounded-lg">
                          <button onClick={() => { deleteMut.mutate(dest.id); setConfirmDelete(null); }}
                            className="px-2 py-1 rounded bg-red-600 text-white text-[9px] font-black cursor-pointer">
                            Sí
                          </button>
                          <button onClick={() => setConfirmDelete(null)}
                            className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[9px] font-black cursor-pointer">
                            No
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(dest.id)}
                          className="p-1.5 rounded-lg bg-gray-55 border hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors text-gray-400 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer count */}
            <div className="mt-6 text-xs font-bold text-gray-400 text-right">
              {dests.length} destino{dests.length !== 1 ? "s" : ""} · {featured.length} destacado{featured.length !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
