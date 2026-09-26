import React, { useState } from "react";
import {
  Globe, Edit3, Image, Upload, Save, Sparkles, ExternalLink,
  CheckCircle2, Camera, User, Phone, Video, Eye, ShieldCheck, Tag, Star,
  Smartphone, Monitor, Copy, Check, Compass, Award, Share2, Layers, Zap,
  MessageCircle, MapPin
} from "lucide-react";
import type { CreatorProfileInfo } from "../../types/creatorInfluencer";

interface CreatorCmsModuleProps {
  establishmentId: number;
  creatorName: string;
  profileInfo?: CreatorProfileInfo;
  onUpdateProfile: (updated: Partial<CreatorProfileInfo>) => void;
}

export function CreatorCmsModule({
  establishmentId,
  creatorName,
  profileInfo,
  onUpdateProfile
}: CreatorCmsModuleProps) {
  const [formData, setFormData] = useState<CreatorProfileInfo>({
    name: profileInfo?.name || creatorName,
    headline: profileInfo?.headline || "Viajera 4x4, expedicionaria audiovisual & auditora de turismo HDV",
    bio: profileInfo?.bio || "Creadora de contenido especializada en turismo de naturaleza, vuelos de drone 4K y auditoría técnica de posadas y hoteles en Venezuela.",
    avatar_url: profileInfo?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    banner_url: profileInfo?.banner_url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    instagram: profileInfo?.instagram || "@auracroce",
    tiktok: profileInfo?.tiktok || "@auracroce_viajes",
    youtube: profileInfo?.youtube || "AuraCroceExpediciones",
    phone: profileInfo?.phone || "+58 414-1234567",
    location: profileInfo?.location || "Caracas / Expediciones Nacionales",
    gear_equipment: profileInfo?.gear_equipment || "DJI Mavic 3 Pro • Sony Alpha 7 IV • Lentes 24-70mm • Starlink Mini"
  });

  const [selectedTemplate, setSelectedTemplate] = useState<"A" | "B" | "C">("A");
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");
  const [copiedLink, setCopiedLink] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Módulos visibles en el sitio web público
  const [activeModules, setActiveModules] = useState({
    rutas_gps: true,
    tarifario_cotizaciones: true,
    auditorias_calidad: true,
    galeria_4k: true,
    whatsapp_directo: true
  });

  const [customDomain, setCustomDomain] = useState(() => {
    return localStorage.getItem(`hdv_creator_domain_${establishmentId}`) || "auracroce.hotelesdevenezuela.com";
  });

  const livePublicSlug = establishmentId === 99901 || establishmentId === 1 
    ? "aura-croce-viajera-creadora" 
    : `influencer-${establishmentId}`;

  const livePublicUrl = `https://hotelesdevenezuela.com/establecimiento/${livePublicSlug}`;

  // Compresión liviana de imágenes HTML5 Canvas
  const compressImage = (file: File, maxWidth: number, quality: number = 0.82): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => resolve(event.target?.result as string);
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "banner") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "avatar") setIsUploadingAvatar(true);
    else setIsUploadingBanner(true);

    try {
      const maxWidth = type === "banner" ? 1600 : 500;
      const compressed = await compressImage(file, maxWidth, 0.82);
      if (type === "avatar") {
        setFormData(prev => ({ ...prev, avatar_url: compressed }));
      } else {
        setFormData(prev => ({ ...prev, banner_url: compressed }));
      }
    } catch (err) {
      console.error("Error al comprimir imagen:", err);
    } finally {
      if (type === "avatar") setIsUploadingAvatar(false);
      else setIsUploadingBanner(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(livePublicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateProfile(formData);
    localStorage.setItem(`hdv_creator_domain_${establishmentId}`, customDomain.trim());
    localStorage.setItem(`hdv_creator_template_${establishmentId}`, selectedTemplate);
    localStorage.setItem(`hdv_creator_modules_${establishmentId}`, JSON.stringify(activeModules));
    
    // Guardar también en hdv_mock_establishments y perfil global para persistencia total
    try {
      const localKey = `hdv_creator_profile_${establishmentId}`;
      localStorage.setItem(localKey, JSON.stringify(formData));
      localStorage.setItem("hdv_creator_profile_1", JSON.stringify(formData));
      localStorage.setItem("hdv_creator_profile_99901", JSON.stringify(formData));
      window.dispatchEvent(new CustomEvent("hdv_creator_profile_changed", { detail: formData }));
    } catch (err) {}

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* ── BANNER HERO CMS BUILDER ── */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1a0533] via-[#0e011f] to-[#1a0533] border border-[#00C8D4]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15 bg-[#00C8D4]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15 bg-[#FF0096]" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sitio Web & Media Kit Aprobado • 100% Activo</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-[#00C8D4]/20 text-[#00C8D4] border border-[#00C8D4]/30">
                <Zap className="w-3 h-3" />
                <span>Sincronización en Vivo</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-wide">
              Web Builder & Personalización de tu Aplicación Web
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Modifica en tiempo real tu sitio web público de creadora turística, fotos panorámicas, biografía, enlaces de redes sociales y tarifario para marcas y posadas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
              <span>{copiedLink ? "¡Enlace Copiado!" : "Copiar Link Público"}</span>
            </button>

            <a
              href={`/establecimiento/${livePublicSlug}`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-90 text-white font-black text-xs shadow-lg shadow-[#FF0096]/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Ver Web en Vivo</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── CUERPO PRINCIPAL: 2 COLUMNAS (EDITOR + SIMULADOR EN VIVO) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ══ COLUMNA IZQUIERDA: CONTROLES DE EDICIÓN DEL CMS (7 cols) ══ */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. Selector de Plantilla */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00C8D4]" />
                <span>1. Plantilla de Diseño Visual</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Selecciona tu estilo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "A", name: "Cyber Dark Luxe", desc: "Fondo oscuro cósmico con acentos Neón Turquesa & Magenta HDV", badge: "Oficial" },
                { id: "B", name: "Editorial Safari", desc: "Estilo limpio y moderno tipo revista de viajes National Geographic", badge: "Aventura" },
                { id: "C", name: "Golden Sunset", desc: "Degradados cálidos dorados inspirados en atardeceres de Los Roques", badge: "Cálido" }
              ].map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl.id as any)}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative ${
                    selectedTemplate === tpl.id
                      ? "bg-gradient-to-br from-[#FF0096]/20 to-[#9B00CC]/20 border-[#FF0096] shadow-lg shadow-[#FF0096]/20"
                      : "bg-black/30 border-white/10 hover:border-white/20 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-black ${selectedTemplate === tpl.id ? "text-white" : "text-slate-300"}`}>
                      {tpl.name}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/10 text-white font-bold">
                      {tpl.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{tpl.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Banner Panorámico & Foto de Perfil */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl backdrop-blur-md space-y-5">
            <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
              <Image className="w-4 h-4 text-[#FF0096]" />
              <span>2. Portada Panorámica 4K & Foto de Perfil</span>
            </h3>

            {/* Vista previa del Banner actual con botón de carga */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Banner Panorámico de Encabezado (16:9 / Full-Width)
              </label>
              
              <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-white/15 group bg-slate-950">
                <img 
                  src={formData.banner_url} 
                  alt="Banner preview" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <label className="px-4 py-2 bg-[#FF0096] text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer flex items-center gap-2 hover:bg-[#d90080]">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingBanner ? "Procesando..." : "Subir Nuevo Banner"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "banner")} />
                  </label>
                </div>
              </div>

              <input
                type="text"
                value={formData.banner_url}
                onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                placeholder="O pega aquí el enlace directo a la imagen del banner..."
                className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#FF0096]"
              />
            </div>

            {/* Avatar & Foto de Portada */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2 border-t border-white/10">
              <div className="sm:col-span-3 flex justify-center">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#00C8D4] shadow-lg shadow-[#00C8D4]/20 group">
                  <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-4 h-4 text-[#00C8D4]" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "avatar")} />
                  </label>
                </div>
              </div>

              <div className="sm:col-span-9 space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Foto de Perfil Oficial (Avatar Redondo)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="URL de foto de perfil..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#00C8D4]"
                  />
                  <label className="px-3 py-2 rounded-xl bg-[#00C8D4] text-slate-950 font-bold text-xs cursor-pointer flex items-center gap-1 shrink-0 hover:bg-[#00b2bd]">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "avatar")} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Textos, Bio & Equipamiento */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
              <User className="w-4 h-4 text-[#00C8D4]" />
              <span>3. Identidad Pública & Media Kit</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Nombre Artístico / Creadora *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#FF0096]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Titular Destacado / Especialidad
                  </label>
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#FF0096]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Biografía & Propuesta de Valor para Patrocinadores
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#FF0096] leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Equipamiento Audiovisual (Drones, Cámaras, Lentes, Satélite)
                </label>
                <input
                  type="text"
                  value={formData.gear_equipment}
                  onChange={(e) => setFormData({ ...formData, gear_equipment: e.target.value })}
                  placeholder="ej: DJI Mavic 3 Pro • Sony A7IV • Starlink Mini"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white font-mono focus:outline-none focus:border-[#00C8D4]"
                />
              </div>
            </div>
          </div>

          {/* 4. Canales de Contacto & Redes */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>4. Canales Oficiales & Botón WhatsApp</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                  WhatsApp Oficial para Contrataciones
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Instagram Oficial
                </label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#FF0096]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                  TikTok
                </label>
                <input
                  type="text"
                  value={formData.tiktok}
                  onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Canal de YouTube
                </label>
                <input
                  type="text"
                  value={formData.youtube}
                  onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-red-400"
                />
              </div>
            </div>
          </div>

          {/* 5. Módulos Visibles en su Web */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00C8D4]" />
              <span>5. Secciones Activas en tu Web Pública</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { id: "rutas_gps", label: "🗺️ Expediciones & Rutas 4K", desc: "Muestra tus paquetes de cobertura en campo" },
                { id: "tarifario_cotizaciones", label: "💰 Tarifario B2B para Posadas", desc: "Permite cotizar Reels y Stories en línea" },
                { id: "auditorias_calidad", label: "🏨 Sello de Auditoría HDV", desc: "Muestra métricas de Wi-Fi y planta de posadas" },
                { id: "whatsapp_directo", label: "💬 Botón WhatsApp Flotante", desc: "Enlace directo para coordinar viajes" }
              ].map((mod) => (
                <label
                  key={mod.id}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-black/30 border border-white/10 cursor-pointer hover:border-white/20 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={(activeModules as any)[mod.id]}
                    onChange={(e) => setActiveModules({ ...activeModules, [mod.id]: e.target.checked })}
                    className="mt-0.5 w-4 h-4 accent-[#FF0096] rounded"
                  />
                  <div>
                    <div className="font-bold text-white text-xs">{mod.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{mod.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Barra de Guardado */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#0e011f] border border-white/10">
            <div>
              {savedSuccess ? (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Cambios guardados y publicados exitosamente en tu Web!</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">
                  Los cambios se reflejan inmediatamente en tu enlace público y ficha oficial.
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleSave()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#00C8D4] hover:opacity-95 text-white font-black text-xs shadow-lg shadow-[#FF0096]/20 cursor-pointer flex items-center gap-2 hover:scale-105 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Publicar Cambios en Vivo</span>
            </button>
          </div>

        </div>

        {/* ══ COLUMNA DERECHA: SIMULADOR VISUAL EN TIEMPO REAL (5 cols) ══ */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                Simulador en Tiempo Real
              </span>
            </div>

            {/* Toggle Móvil / Desktop */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  previewDevice === "mobile" ? "bg-[#00C8D4] text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
                }`}
                title="Vista Móvil"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  previewDevice === "desktop" ? "bg-[#FF0096] text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
                title="Vista Escritorio"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Marco del Dispositivo (Simulator Frame) */}
          <div className={`mx-auto rounded-[36px] p-3 border-4 border-slate-700 bg-slate-950 shadow-2xl transition-all duration-300 ${
            previewDevice === "mobile" ? "max-w-[340px]" : "w-full max-w-[480px]"
          }`}>
            
            {/* Notch / Speaker */}
            <div className="flex justify-center mb-2">
              <div className="w-20 h-3.5 bg-slate-800 rounded-full" />
            </div>

            {/* Pantalla Interna del Sitio Web Simulado */}
            <div className="rounded-[26px] overflow-hidden bg-[#0e011f] border border-white/10 text-white min-h-[580px] max-h-[640px] overflow-y-auto font-sans shadow-inner scrollbar-thin">
              
              {/* Barra Superior HDV */}
              <div className="px-4 py-2.5 bg-black/60 backdrop-blur border-b border-white/10 flex items-center justify-between sticky top-0 z-20">
                <span className="text-[10px] font-black tracking-widest text-[#00C8D4] uppercase">
                  HOTELES DE VENEZUELA
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#FF0096]/20 text-[#FF0096] font-extrabold border border-[#FF0096]/30">
                  CREADOR VIP
                </span>
              </div>

              {/* Banner Panorámico Simulado */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                <img 
                  src={formData.banner_url} 
                  alt="Banner" 
                  className="w-full h-full object-cover scale-[1.08]" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e011f] via-transparent to-black/30" />
              </div>

              {/* Contenido del Perfil */}
              <div className="p-4 -mt-10 relative z-10 space-y-3.5">
                
                {/* Avatar + Badge */}
                <div className="flex items-end justify-between">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#00C8D4] shadow-xl bg-slate-800">
                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <ShieldCheck className="w-3 h-3" />
                    <span>VERIFICADA</span>
                  </span>
                </div>

                {/* Nombre y Headline */}
                <div>
                  <h4 className="text-base font-serif font-black text-white leading-tight">
                    {formData.name || "Aura Croce"}
                  </h4>
                  <p className="text-[11px] text-[#00C8D4] font-semibold mt-0.5 leading-snug">
                    {formData.headline || "Viajera & Creadora Audiovisual"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#FF0096]" />
                    <span>{formData.location}</span>
                  </p>
                </div>

                {/* Biografía */}
                <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3 bg-white/5 p-2.5 rounded-xl border border-white/5">
                  {formData.bio}
                </p>

                {/* Equipos */}
                {formData.gear_equipment && (
                  <div className="text-[10px] bg-slate-900/90 p-2 rounded-xl border border-[#00C8D4]/20 space-y-1">
                    <span className="font-bold text-[#00C8D4] uppercase text-[9px] flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      <span>Gear de Producción 4K:</span>
                    </span>
                    <p className="text-slate-300 font-mono text-[10px] leading-tight">
                      {formData.gear_equipment}
                    </p>
                  </div>
                )}

                {/* Servicios & Expediciones Simuladas */}
                {activeModules.rutas_gps && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold uppercase tracking-wider text-slate-400">Expediciones Destacadas</span>
                      <span className="text-[#FF0096] font-bold">Ver Tarifas</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">Gran Sabana 4x4</span>
                        <span className="text-[10px] font-mono font-bold text-[#FF0096] bg-[#FF0096]/10 px-1.5 py-0.5 rounded">
                          $20/Viaje + Viáticos
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">1,420 Km mapeados • Vuelo Drone 4K</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">Morrocoy & Cayos</span>
                        <span className="text-[10px] font-mono font-bold text-[#00C8D4] bg-[#00C8D4]/10 px-1.5 py-0.5 rounded">
                          $20/Viaje + Viáticos
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">Auditoría Posadas • Reels Colaborativos</p>
                    </div>
                  </div>
                )}

                {/* Botón WhatsApp Flotante Simulado */}
                {activeModules.whatsapp_directo && (
                  <div className="pt-2">
                    <a
                      href={`https://wa.me/${formData.phone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(formData.name)},%20vi%20tu%20sitio%20web%20en%20Hoteles%20de%20Venezuela%20y%20quiero%20coordinar%20una%20cobertura.`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Contactar por WhatsApp</span>
                    </a>
                  </div>
                )}

              </div>
            </div>

            {/* Home indicator */}
            <div className="flex justify-center mt-2">
              <div className="w-24 h-1 bg-slate-700 rounded-full" />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
