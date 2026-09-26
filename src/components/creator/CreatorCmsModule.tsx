import React, { useState } from "react";
import {
  Globe, Edit3, Image, Upload, Save, Sparkles, ExternalLink,
  CheckCircle2, Camera, User, Phone, Video, Eye, ShieldCheck, Tag, Star
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
    banner_url: profileInfo?.banner_url || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&auto=format&fit=crop",
    instagram: profileInfo?.instagram || "@auracroce",
    tiktok: profileInfo?.tiktok || "@auracroce_viajes",
    youtube: profileInfo?.youtube || "AuraCroceExpediciones",
    phone: profileInfo?.phone || "+58 414-1234567",
    location: profileInfo?.location || "Caracas / Expediciones Nacionales",
    gear_equipment: profileInfo?.gear_equipment || "DJI Mavic 3 Pro • Sony Alpha 7 IV • Lentes 24-70mm • Starlink Mini"
  });

  const [customDomain, setCustomDomain] = useState(() => {
    return localStorage.getItem(`hdv_creator_domain_${establishmentId}`) || "auracroce.hotelesdevenezuela.com";
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    localStorage.setItem(`hdv_creator_domain_${establishmentId}`, customDomain.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* ── BANNER HERO CMS BUILDER ── */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1a0533] via-[#0e011f] to-[#1a0533] border border-[#00C8D4]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15 bg-[#00C8D4]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15 bg-[#FF0096]" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-[#00C8D4]/20 text-[#00C8D4] border border-[#00C8D4]/40">
              <Globe className="w-3.5 h-3.5" />
              <span>APLICACIÓN WEB STANDALONE & MEDIA KIT DIGITAL DE CREADOR</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-wide">
              Web Builder & Personalización de Perfil Público
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Configura tu sitio web oficial de creador(a), dominio personalizado, biografía profesional, enlaces a redes sociales y tarifario público para posadas y marcas patrocinadoras.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <a
              href={`/establecimiento/influencer-${establishmentId}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-[#00C8D4] hover:bg-[#00b2bd] text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Ver Web Pública</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── FORMULARIO CMS BUILDER & MEDIA KIT ── */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Dominio & Branding Principal */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl backdrop-blur-md space-y-4">
          <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#00C8D4]" />
            <span>Dominio Oficial & Enlaces del Sitio</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                Dominio Personalizado de Creadora
              </label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="ej: auracroce.hotelesdevenezuela.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white font-mono focus:outline-none focus:border-[#00C8D4]"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                Ubicación Base de Operaciones
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Caracas / Expediciones Nacionales"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#00C8D4]"
              />
            </div>
          </div>
        </div>

        {/* Biografía, Titular & Equipo Técnico */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl backdrop-blur-md space-y-4">
          <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
            <User className="w-4 h-4 text-[#FF0096]" />
            <span>Identidad de Creadora, Titular & Media Kit</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Nombre Artístico / Creadora *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#FF0096]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Titular / Especialidad de Viajes
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#FF0096]"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                Equipamiento Técnico de Producción (Cámaras, Drones, Lentes, Conectividad)
              </label>
              <input
                type="text"
                value={formData.gear_equipment}
                onChange={(e) => setFormData({ ...formData, gear_equipment: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white font-mono focus:outline-none focus:border-[#00C8D4]"
              />
            </div>
          </div>
        </div>

        {/* Canales Digitales & WhatsApp */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl backdrop-blur-md space-y-4">
          <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Redes Sociales & Canal Directo de Contratación</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                Instagram Oficial
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white"
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
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                YouTube
              </label>
              <input
                type="text"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                WhatsApp Contrataciones
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white"
              />
            </div>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>¡Sitio Web y Media Kit guardados exitosamente!</span>
            </span>
          )}

          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF0096] to-[#00C8D4] hover:opacity-90 text-white font-black text-xs shadow-lg shadow-[#FF0096]/20 cursor-pointer flex items-center gap-2 hover:scale-[1.02] transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración Web</span>
          </button>
        </div>

      </form>

    </div>
  );
}
