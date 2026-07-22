import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import {
  FileText, Globe, Layers, Settings, Image, Edit2, X, Check,
  Plus, Trash2, Eye, Save, ExternalLink, ToggleLeft, ToggleRight, Loader2, Upload
} from "lucide-react";

interface SiteSection {
  id?: number; sectionKey: string; title: string | null; subtitle: string | null;
  description: string | null; imageUrl: string | null; buttonText: string | null;
  buttonUrl: string | null; isActive: boolean | null;
}
interface SiteSetting { id: number; settingKey: string; settingValue: string | null; settingLabel: string | null; settingGroup: string | null; }
interface CustomPage { id: number; slug: string; title: string; h1Title: string | null; metaDescription: string | null; metaKeywords: string | null; content: string | null; isPublished: boolean | null; featuredImage: string | null; videoUrl: string | null; galleryImages: string | null; relatedEstablishments: string | null; }

const SECTION_META: Record<string, { label: string; icon: string; color: string }> = {
  hero:                 { label: "Hero Principal",    icon: "🏔️", color: "#FF0096" },
  HERO_BANNER:          { label: "Hero Principal",    icon: "🏔️", color: "#FF0096" },
  hero_banner:          { label: "Hero Principal (Legacy)", icon: "🏔️", color: "#FF0096" },
  about:                { label: "Sobre Nosotros",    icon: "ℹ️", color: "#9B00CC" },
  features:             { label: "Características",   icon: "⭐", color: "#00C8D4" },
  video:                { label: "Video Promocional", icon: "🎥", color: "#EF4444" },
  youtube_video:        { label: "Video Promocional (YouTube)", icon: "🎥", color: "#EF4444" },
  featured_section:     { label: "Negocios Destacados", icon: "⭐", color: "#F59E0B" },
  destinations_section: { label: "Destinos Populares", icon: "📍", color: "#00C8D4" },
  how_it_works:         { label: "Cómo Funciona",     icon: "⚙️", color: "#10B981" },
  cta:                  { label: "Call to Action",    icon: "🚀", color: "#F59E0B" },
  testimonials:         { label: "Testimonios",       icon: "💬", color: "#10B981" },
  partners:             { label: "Nuestros Aliados",  icon: "🤝", color: "#6366F1" },
  prestigio:            { label: "Campaña Prestigio (Alta Gama)", icon: "✨", color: "#FF0096" },
};

const SETTINGS_META: Record<string, { label: string; group: string; type: "text" | "url" | "tel" | "toggle" }> = {
  site_name:            { label: "Nombre del Sitio",       group: "general",  type: "text" },
  site_tagline:         { label: "Tagline",                group: "general",  type: "text" },
  whatsapp_number:      { label: "WhatsApp",               group: "contact",  type: "tel" },
  email_contact:        { label: "Email de Contacto",      group: "contact",  type: "text" },
  instagram_url:        { label: "Instagram URL",          group: "social",   type: "url" },
  facebook_url:         { label: "Facebook URL",           group: "social",   type: "url" },
  andromeda_enabled:    { label: "Módulo Andromeda",       group: "features", type: "toggle" },
  reservations_enabled: { label: "Reservas Online",        group: "features", type: "toggle" },
  maintenance_mode:     { label: "Modo Mantenimiento",     group: "system",   type: "toggle" },
};

const GROUP_LABELS: Record<string, string> = {
  general: "General", contact: "Contacto", social: "Redes Sociales", features: "Funcionalidades", system: "Sistema"
};

type Tab = "site" | "hero" | "sections" | "pages";

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-2 text-sm cursor-pointer transition-transform active:scale-95">
      {checked ? <ToggleRight className="w-9 h-9" style={{ color: "#FF0096" }} /> : <ToggleLeft className="w-9 h-9 text-slate-600" />}
      <span className={`text-xs font-bold uppercase tracking-wider ${checked ? "text-white" : "text-slate-400"}`}>{checked ? "On" : "Off"}</span>
    </button>
  );
}

export function AdminContenido() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("hero");
  const [editSection, setEditSection] = useState<SiteSection | null>(null);
  const [editPage, setEditPage] = useState<Partial<CustomPage> | null>(null);
  const [pageModal, setPageModal] = useState<"create" | "edit" | null>(null);
  const [settingsDraft, setSettingsDraft] = useState<Record<string, string>>({});
  const [savedKeys, setSavedKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      nav("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  const { data: sections = [], isLoading: loadingSections } = useQuery<any[]>({
    queryKey: ["site-sections"],
    queryFn: async () => {
      const { data } = await supabase.from("site_sections").select("*").order("id");
      return (data || []).map((item: any) => ({
        id: item.id, sectionKey: item.section_key || item.sectionKey, title: item.title, subtitle: item.subtitle,
        description: item.description, imageUrl: item.image_url || item.imageUrl, buttonText: item.button_text || item.buttonText,
        buttonUrl: item.button_url || item.buttonUrl, isActive: item.is_active ?? item.isActive ?? true
      }));
    }
  });

  const { data: settings = [], isLoading: loadingSettings } = useQuery<any[]>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").order("id");
      return (data || []).map((item: any) => ({
        id: item.id, settingKey: item.setting_key || item.settingKey, settingValue: item.setting_value ?? item.settingValue ?? "",
        settingLabel: item.setting_label ?? item.settingLabel ?? "", settingGroup: item.setting_group ?? item.settingGroup ?? "general"
      }));
    }
  });

  useEffect(() => {
    if (settings.length > 0) {
      const map: Record<string, string> = {};
      settings.forEach((s: SiteSetting) => { if (s.settingKey) map[s.settingKey] = s.settingValue ?? ""; });
      setSettingsDraft(map);
    }
  }, [settings]);

  const { data: pages = [], isLoading: loadingPages } = useQuery<any[]>({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const { data } = await supabase.from("custom_pages").select("*").order("id");
      return (data || []).map((item: any) => ({
        id: item.id, slug: item.slug, title: item.title, h1Title: item.h1_title ?? item.h1Title ?? "",
        metaDescription: item.meta_description ?? item.metaDescription ?? "", metaKeywords: item.meta_keywords ?? item.metaKeywords ?? "",
        content: item.content ?? "", isPublished: item.is_published ?? item.isPublished ?? false,
        featuredImage: item.featured_image ?? item.featuredImage ?? "", videoUrl: item.video_url ?? item.videoUrl ?? "",
        galleryImages: item.gallery_images ?? item.galleryImages ?? "", relatedEstablishments: item.related_establishments ?? item.relatedEstablishments ?? ""
      }));
    }
  });

  const updateSection = useMutation({
    mutationFn: async (s: SiteSection) => {
      let finalImageUrl = s.imageUrl;
      if (finalImageUrl && finalImageUrl.startsWith("data:")) {
        const response = await fetch(finalImageUrl);
        const blob = await response.blob();
        const fileName = `contenido/${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage.from("establecimientos").upload(fileName, blob, { contentType: "image/jpeg", upsert: true });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("establecimientos").getPublicUrl(fileName);
        finalImageUrl = publicUrl;
      }
      const payload = {
        section_key: s.sectionKey, title: s.title, subtitle: s.subtitle, description: s.description,
        image_url: finalImageUrl, button_text: s.buttonText, button_url: s.buttonUrl, is_active: s.isActive
      };
      const { error } = await supabase.from("site_sections").upsert(payload, { onConflict: 'section_key' });
      if (error) throw error;
    },
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["site-sections"] }); 
      setEditSection(null); 
      alert("¡Sincronizado con éxito!"); 
    },
    onError: (err: any) => { alert(`Error al guardar: ${err.message}`); }
  });

  const saveSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const payload = { setting_key: key, setting_value: value };
      await supabase.from("site_settings").upsert(payload, { onConflict: 'setting_key' });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      setSavedKeys(p => ({ ...p, [vars.key]: true }));
      setTimeout(() => setSavedKeys(p => { const n = { ...p }; delete n[vars.key]; return n; }), 2000);
    }
  });

  const savePage = useMutation({
    mutationFn: async (p: Partial<CustomPage>) => {
      let finalFeaturedImage = p.featuredImage;
      if (finalFeaturedImage && finalFeaturedImage.startsWith("data:")) {
        const response = await fetch(finalFeaturedImage);
        const blob = await response.blob();
        const fileName = `contenido/page-${Date.now()}.jpg`;
        await supabase.storage.from("establecimientos").upload(fileName, blob, { contentType: "image/jpeg", upsert: true });
        const { data: { publicUrl } } = supabase.storage.from("establecimientos").getPublicUrl(fileName);
        finalFeaturedImage = publicUrl;
      }
      const payload = {
        slug: p.slug || "", title: p.title || "", h1_title: p.h1Title || null, meta_description: p.metaDescription || null,
        meta_keywords: p.metaKeywords || null, content: p.content || "", is_published: p.isPublished ?? false,
        featured_image: finalFeaturedImage || null, video_url: p.videoUrl || null, gallery_images: p.galleryImages || null, related_establishments: p.relatedEstablishments || null
      };
      if (pageModal === "edit" && p.id) {
        await supabase.from("custom_pages").update(payload).eq("id", p.id);
      } else {
        await supabase.from("custom_pages").insert(payload);
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-pages"] }); setPageModal(null); setEditPage(null); }
  });

  const deletePage = useMutation({
    mutationFn: async (id: number) => { await supabase.from("custom_pages").delete().eq("id", id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-pages"] })
  });

  const settingsMap: Record<string, string> = {};
  settings.forEach(s => { if (s.settingKey) settingsMap[s.settingKey] = s.settingValue ?? ""; });
  
  const heroSection = sections.find(s => s.sectionKey === "hero" || s.sectionKey === "HERO_BANNER");
  
  const groupedSettings = Object.entries(SETTINGS_META).reduce<Record<string, string[]>>((acc, [key, meta]) => {
    if (!acc[meta.group]) acc[meta.group] = [];
    acc[meta.group].push(key);
    return acc;
  }, {});

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "hero",      label: "Héroe Principal",         icon: <Image className="w-4 h-4" /> },
    { id: "sections", label: "Secciones Core",       icon: <Layers className="w-4 h-4" /> },
    { id: "site",      label: "Configuración Core",    icon: <Settings className="w-4 h-4" /> },
    { id: "pages",    label: "Páginas Personalizadas",icon: <Globe className="w-4 h-4" /> }
  ];

  if (authLoading || loadingSections || loadingSettings || loadingPages) {
    return (
      <div className="min-h-screen bg-[#070211] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-brand-magenta animate-spin" style={{ color: "#FF0096" }} />
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Centaurus System Initialization...</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden border-b border-slate-800/60 bg-gradient-to-b from-[#110626] to-[#0a0318] py-9">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[140px] opacity-20 pointer-events-none" style={{ background: "linear-gradient(90deg, #9B00CC, #FF0096)" }} />
        <div className="container mx-auto px-6 relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#9B00CC] to-[#FF0096] p-[1px] shadow-lg shadow-purple-900/30">
            <div className="w-full h-full bg-[#0a0318] rounded-[15px] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#FF0096]" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-wider font-sans">Engine de Contenido</h1>
            <p className="text-slate-400 text-[11px] font-bold tracking-wide uppercase mt-0.5">Control semántico y visual de Hoteles de Venezuela</p>
          </div>
        </div>
      </div>

      <AdminTabBar />

      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-2.5 mb-8">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer active:scale-95"
              style={tab === t.id ? { background: "linear-gradient(90deg, #9B00CC, #FF0096)", color: "#fff", boxShadow: "0 6px 20px rgba(255,0,150,0.25)" } : { background: "#110a24", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.04)" }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: HERO CONTROL */}
        {tab === "hero" && (
          <div className="bg-[#100921] border border-slate-800/80 rounded-2xl p-7 max-w-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#9B00CC] to-[#FF0096]" />
            <h2 className="font-black text-white text-xs uppercase tracking-widest mb-6 flex items-center gap-2"><Image className="w-4 h-4 text-[#FF0096]" /> Configuración del Banner de Impacto</h2>
            
            {editSection && (editSection.sectionKey === "hero" || editSection.sectionKey === "HERO_BANNER") ? (
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] uppercase font-black text-slate-400 block mb-1.5 tracking-widest">Título Supreme</label>
                  <input value={editSection.title || ""} onChange={e => setEditSection({ ...editSection, title: e.target.value })} className="w-full bg-[#170e2e] border border-slate-800 focus:border-[#FF0096] rounded-xl px-4 py-3 text-xs font-bold text-white outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-slate-400 block mb-1.5 tracking-widest">Subtítulo Descriptivo</label>
                  <input value={editSection.subtitle || ""} onChange={e => setEditSection({ ...editSection, subtitle: e.target.value })} className="w-full bg-[#170e2e] border border-slate-800 focus:border-[#FF0096] rounded-xl px-4 py-3 text-xs font-bold text-white outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-slate-400 block mb-1.5 tracking-widest">Activo Digital / Imagen de Fondo</label>
                  <div className="flex gap-2">
                    <input value={editSection.imageUrl || ""} onChange={e => setEditSection({ ...editSection, imageUrl: e.target.value })} className="flex-1 bg-[#170e2e] border border-slate-800 focus:border-[#FF0096] rounded-xl px-4 py-3 text-xs font-bold text-white outline-none" placeholder="https://url-de-la-imagen.jpg" />
                    <label className="flex items-center justify-center px-4 py-3 border border-dashed border-purple-500/40 bg-[#1e123a] hover:bg-[#251747] rounded-xl text-xs font-black uppercase text-white tracking-wider cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 text-[#FF0096] mr-1" /> Subir Archivo
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0]; if (!file) return;
                        const r = new FileReader(); r.onload = () => setEditSection({ ...editSection, imageUrl: r.result as string }); r.readAsDataURL(file);
                      }} />
                    </label>
                  </div>
                  {editSection.imageUrl && (
                    <div className="mt-3 relative inline-block">
                      <img src={editSection.imageUrl} alt="preview" className="h-20 w-auto object-cover rounded-xl border border-slate-800" />
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-3">
                  <button type="button" onClick={() => setEditSection(null)} className="flex-1 py-3 bg-[#170e2e] hover:bg-[#221544] border border-slate-800 rounded-xl text-xs font-black uppercase text-slate-300 tracking-wider transition-colors">Cancelar</button>
                  <button type="button" onClick={() => updateSection.mutate(editSection)} className="flex-1 py-3 text-white rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#9B00CC] to-[#FF0096]">Sincronizar Cambios</button>
                </div>
              </div>
            ) : heroSection ? (
              <div className="space-y-6">
                <div className="p-5 bg-[#0a0418] border border-slate-900 rounded-xl space-y-3">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wide"><strong>Título Actual:</strong> <span className="text-white ml-2">{heroSection.title}</span></p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wide"><strong>Subtítulo:</strong> <span className="text-white ml-2">{heroSection.subtitle}</span></p>
                  {heroSection.imageUrl && (
                    <div className="pt-2">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wide block mb-1.5">Fondo Activo:</span>
                      <img src={heroSection.imageUrl} alt="Fondo Hero" className="h-24 w-auto object-cover rounded-xl border border-slate-800" />
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => setEditSection({ ...heroSection })} className="w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-[#FF0096] to-[#9B00CC] cursor-pointer">Desplegar Consola de Edición</button>
              </div>
            ) : (
              <div className="text-center py-10 bg-[#0a0418] rounded-xl border border-slate-900/60 p-6">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">No se detectó registro para el Banner en la base de datos.</p>
                <button type="button" onClick={() => setEditSection({
                  sectionKey: "HERO_BANNER",
                  title: "Hoteles de Venezuela",
                  subtitle: "Reserva Sin Intermediarios ¡Simplemente Maravilloso!",
                  description: "Encuentra los mejores hoteles y posadas.",
                  imageUrl: "",
                  buttonText: "Ver Destinos",
                  buttonUrl: "/destinos",
                  isActive: true
                })} className="px-5 py-3 bg-gradient-to-r from-[#9B00CC] to-[#FF0096] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer">
                  Forzar Apertura y Crear Formulario
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CORE SECTIONS */}
        {tab === "sections" && (
          <div className="space-y-5 max-w-3xl">
            {sections.filter(s => s.sectionKey !== "hero" && s.sectionKey !== "HERO_BANNER").map(s => {
              const meta = SECTION_META[s.sectionKey] ?? { label: s.sectionKey, icon: "📄", color: "#6B7280" };
              const isEditing = editSection?.sectionKey === s.sectionKey;
              return (
                <div key={s.sectionKey} className="bg-[#100921] rounded-2xl p-6 border border-slate-800/80 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-[3px] h-full" style={{ background: meta.color }} />
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{meta.icon}</span>
                      <h3 className="font-black text-xs text-white uppercase tracking-widest">{meta.label}</h3>
                    </div>
                    {!isEditing && <button type="button" onClick={() => setEditSection({ ...s })} className="px-3.5 py-1.5 bg-[#170e2e] hover:bg-[#251747] border border-slate-800 rounded-xl text-[10px] font-black uppercase text-purple-400 tracking-wider">Modificar</button>}
                  </div>
                  {isEditing && editSection ? (
                    <div className="space-y-4 mt-3 bg-[#0a0418] p-5 rounded-xl border border-slate-900">
                      <div>
                        <label className="text-[10px] uppercase font-black text-slate-400 block mb-1 tracking-widest">Título</label>
                        <input 
                          value={editSection.title || ""} 
                          onChange={e => setEditSection({ ...editSection, title: e.target.value })} 
                          className="w-full bg-[#170e2e] border border-slate-800 focus:border-[#FF0096] p-3 rounded-xl text-xs font-bold text-white outline-none" 
                        />
                      </div>
                      
                      {(editSection.sectionKey.includes("video") || editSection.sectionKey.includes("hero") || editSection.subtitle !== null) && (
                        <div>
                          <label className="text-[10px] uppercase font-black text-slate-400 block mb-1 tracking-widest">Subtítulo</label>
                          <input 
                            value={editSection.subtitle || ""} 
                            onChange={e => setEditSection({ ...editSection, subtitle: e.target.value })} 
                            className="w-full bg-[#170e2e] border border-slate-800 focus:border-[#FF0096] p-3 rounded-xl text-xs font-bold text-white outline-none" 
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-[10px] uppercase font-black text-slate-400 block mb-1 tracking-widest">Descripción</label>
                        <textarea 
                          value={editSection.description || ""} 
                          onChange={e => setEditSection({ ...editSection, description: e.target.value })} 
                          className="w-full bg-[#170e2e] border border-slate-800 focus:border-[#FF0096] p-3 rounded-xl text-xs font-bold text-white outline-none h-20 resize-none" 
                        />
                      </div>

                      {(editSection.sectionKey.includes("video") || editSection.sectionKey.includes("cta") || editSection.buttonUrl !== null) && (
                        <div>
                          <label className="text-[10px] uppercase font-black text-slate-400 block mb-1 tracking-widest">
                            {editSection.sectionKey.includes("video") ? "Enlace del Video de YouTube" : "Enlace del Botón"}
                          </label>
                          <input 
                            value={editSection.buttonUrl || ""} 
                            onChange={e => setEditSection({ ...editSection, buttonUrl: e.target.value })} 
                            placeholder={editSection.sectionKey.includes("video") ? "Ej: https://www.youtube.com/watch?v=HeVUUQgwjvA" : "Ej: /destinos o https://..."}
                            className="w-full bg-[#170e2e] border border-slate-800 focus:border-[#FF0096] p-3 rounded-xl text-xs font-bold text-white outline-none" 
                          />
                        </div>
                      )}

                      {(editSection.buttonText !== null || editSection.sectionKey.includes("video") || editSection.sectionKey.includes("featured") || editSection.sectionKey.includes("destinations")) && (
                        <div>
                          <label className="text-[10px] uppercase font-black text-slate-400 block mb-1 tracking-widest">Texto del Botón</label>
                          <input 
                            value={editSection.buttonText || ""} 
                            onChange={e => setEditSection({ ...editSection, buttonText: e.target.value })} 
                            className="w-full bg-[#170e2e] border border-slate-800 focus:border-[#FF0096] p-3 rounded-xl text-xs font-bold text-white outline-none" 
                          />
                        </div>
                      )}

                      {(editSection.sectionKey.includes("video") || editSection.sectionKey.includes("hero") || editSection.imageUrl !== null) && (
                        <div>
                          <label className="text-[10px] uppercase font-black text-slate-400 block mb-1.5 tracking-widest">Imagen / Miniatura</label>
                          <div className="flex gap-2">
                            <input 
                              value={editSection.imageUrl || ""} 
                              onChange={e => setEditSection({ ...editSection, imageUrl: e.target.value })} 
                              className="flex-1 bg-[#170e2e] border border-slate-800 focus:border-[#FF0096] rounded-xl px-4 py-3 text-xs font-bold text-white outline-none" 
                              placeholder="https://url-de-la-imagen.jpg" 
                            />
                            <label className="flex items-center justify-center px-4 py-3 border border-dashed border-purple-500/40 bg-[#1e123a] hover:bg-[#251747] rounded-xl text-xs font-black uppercase text-white tracking-wider cursor-pointer transition-colors">
                              <Upload className="w-4 h-4 text-[#FF0096] mr-1" /> Subir
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0]; if (!file) return;
                                  const r = new FileReader(); r.onload = () => setEditSection({ ...editSection, imageUrl: r.result as string }); r.readAsDataURL(file);
                                }} 
                              />
                            </label>
                          </div>
                          {editSection.imageUrl && (
                            <div className="mt-3 relative inline-block">
                              <img src={editSection.imageUrl} alt="preview" className="h-16 w-auto object-cover rounded-xl border border-slate-800" />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setEditSection(null)} className="flex-1 py-3 bg-[#170e2e] hover:bg-[#221544] border border-slate-800 rounded-xl text-xs font-black uppercase text-slate-300 tracking-wider transition-colors">Cancelar</button>
                        <button type="button" onClick={() => updateSection.mutate(editSection)} className="flex-1 py-3 text-white rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-pink-500 to-purple-600">Sincronizar</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 font-medium bg-[#0a0418] p-4 rounded-xl border border-slate-900/50 line-clamp-2">{s.title || "Sin registros semánticos"}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: SITE PARAMETERS */}
        {tab === "site" && (
          <div className="space-y-5 max-w-3xl">
            {Object.entries(groupedSettings).map(([group, keys]) => (
              <div key={group} className="bg-[#100921] rounded-2xl p-6 border border-gray-800/80 shadow-lg relative overflow-hidden">
                <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-500 mb-5">{GROUP_LABELS[group] ?? group}</h3>
                <div className="space-y-5">
                  {keys.map(key => {
                    const meta = SETTINGS_META[key]!;
                    const currentVal = settingsDraft[key] ?? settingsMap[key] ?? "";
                    if (meta.type === "toggle") {
                      return (
                        <div key={key} className="flex justify-between items-center py-3 border-b border-slate-800/40 last:border-0">
                          <div><div className="text-xs font-black text-white uppercase tracking-wider">{meta.label}</div><div className="text-[9px] font-mono text-slate-500 mt-0.5">{key}</div></div>
                          <ToggleSwitch checked={currentVal === "true"} onChange={v => { const val = v ? "true" : "false"; setSettingsDraft(d => ({ ...d, [key]: val })); saveSetting.mutate({ key, value: val }); }} />
                        </div>
                      );
                    }
                    return (
                      <div key={key} className="flex items-end gap-3">
                        <div className="flex-1">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">{meta.label}</label>
                          <input type={meta.type} value={currentVal} onChange={e => setSettingsDraft(d => ({ ...d, [key]: e.target.value }))} className="w-full bg-[#170e2e] border border-slate-800 focus:border-[#FF0096] rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none" />
                        </div>
                        <button type="button" onClick={() => saveSetting.mutate({ key, value: currentVal })} className="px-5 py-3 bg-gradient-to-r from-[#9B00CC] to-[#FF0096] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-transform active:scale-95">Salvar</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: CUSTOM PAGES */}
        {tab === "pages" && (
          <div className="max-w-3xl">
            <div className="flex justify-between items-center mb-6">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{pages.length} Páginas Registradas</div>
              <button type="button" onClick={() => { setEditPage({ slug: "", title: "", h1Title: "", metaDescription: "", content: "", isPublished: false }); setPageModal("create"); }} className="px-4 py-2.5 bg-gradient-to-r from-[#9B00CC] to-[#FF0096] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md"><Plus className="w-4 h-4 inline mr-1" /> Añadir Entrada</button>
            </div>
            <div className="space-y-3">
              {pages.map(p => (
                <div key={p.id} className="bg-[#100921] rounded-2xl p-4 border border-slate-800/80 shadow-sm flex justify-between items-center transition-all hover:border-purple-900/40">
                  <div><div className="font-black text-xs text-white uppercase tracking-wider">{p.title}</div><div className="text-[10px] text-purple-400 font-mono mt-0.5">/{p.slug}</div></div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setEditPage({ ...p }); setPageModal("edit"); }} className="p-2 bg-[#170e2e] hover:bg-purple-950/40 border border-slate-800 rounded-xl text-purple-400"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => deletePage.mutate(p.id!)} className="p-2 bg-[#170e2e] hover:bg-red-950/40 border border-slate-800 rounded-xl text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {pageModal && editPage && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#100921] border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#9B00CC] to-[#FF0096]" />
            <h2 className="text-xs font-black uppercase tracking-widest text-white mb-5">{pageModal === "create" ? "Nueva Entrada Custom" : "Modificar Entrada"}</h2>
            <div className="space-y-4">
              <input placeholder="Título de la Página" value={editPage.title || ""} onChange={e => setEditPage({ ...editPage, title: e.target.value })} className="w-full bg-[#170e2e] border border-slate-800 focus:border-[#FF0096] p-3 rounded-xl text-xs font-bold text-white outline-none" />
              <input placeholder="Slug Enlace" value={editPage.slug || ""} onChange={e => setEditPage({ ...editPage, slug: e.target.value })} className="w-full bg-[#170e2e] border border-slate-800 focus:border-[#FF0096] p-3 rounded-xl text-xs font-mono text-white outline-none" />
              <textarea placeholder="Contenido HTML o Texto Pleno" rows={6} value={editPage.content || ""} onChange={e => setEditPage({ ...editPage, content: e.target.value })} className="w-full bg-[#170e2e] border border-slate-800 focus:border-[#FF0096] p-3 rounded-xl text-xs font-mono text-white outline-none resize-y" />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setPageModal(null)} className="px-4 py-2 bg-[#170e2e] rounded-xl text-xs font-black uppercase text-slate-400">Abortar</button>
              <button type="button" onClick={() => savePage.mutate(editPage)} className="px-5 py-2 text-white rounded-xl text-xs font-black uppercase bg-gradient-to-r from-[#9B00CC] to-[#FF0096] tracking-wider">Guardar Nodo</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}