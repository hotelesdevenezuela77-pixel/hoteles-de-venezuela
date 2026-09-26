import React, { useState } from "react";
import { X, Camera, Save, User, Phone, Video, MapPin, Sparkles, Upload, Check } from "lucide-react";
import type { CreatorProfileInfo } from "../../types/creatorInfluencer";

const InstagramIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

interface CreatorProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CreatorProfileInfo;
  onSave: (updated: Partial<CreatorProfileInfo>) => void;
}

export const CreatorProfileEditModal: React.FC<CreatorProfileEditModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave
}) => {
  const [formData, setFormData] = useState<CreatorProfileInfo>({ ...profile });
  const [avatarPreview, setAvatarPreview] = useState<string>(profile.avatar_url);
  const [bannerPreview, setBannerPreview] = useState<string>(profile.banner_url || "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setFormData(prev => ({ ...prev, avatar_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setBannerPreview(result);
        setFormData(prev => ({ ...prev, banner_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#1a0533] via-[#0e011f] to-[#120224] border border-[#00C8D4]/40 rounded-3xl p-5 sm:p-8 shadow-2xl text-slate-100 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF0096] to-[#00C8D4] flex items-center justify-center text-white shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF0096]/20 border border-[#FF0096]/40 text-[#FF0096] text-[9px] font-black uppercase tracking-wider">
                Configuración de Creadora
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-white">Editar Perfil & Acreditación</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Photos: Avatar & Banner */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
              Fotos del Perfil (Avatar y Portada)
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Avatar Upload */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#FF0096] shrink-0 bg-slate-800">
                  <img src={avatarPreview || profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </label>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">Foto de Perfil</p>
                  <p className="text-[10px] text-slate-400">JPG/PNG o captura con cámara</p>
                  <label
                    htmlFor="avatar-upload"
                    className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-xl bg-[#FF0096]/20 hover:bg-[#FF0096]/30 border border-[#FF0096]/40 text-[#FF0096] text-[10px] font-extrabold cursor-pointer transition-all"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Cambiar Foto</span>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Banner Upload */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center gap-4">
                <div className="relative w-20 h-16 rounded-xl overflow-hidden border border-[#00C8D4]/50 shrink-0 bg-slate-800">
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px]">Sin Portada</div>
                  )}
                  <label htmlFor="banner-upload" className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </label>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">Foto de Portada</p>
                  <p className="text-[10px] text-slate-400">Banner para perfil público</p>
                  <label
                    htmlFor="banner-upload"
                    className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-xl bg-[#00C8D4]/20 hover:bg-[#00C8D4]/30 border border-[#00C8D4]/40 text-[#00C8D4] text-[10px] font-extrabold cursor-pointer transition-all"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Subir Portada</span>
                  </label>
                  <input
                    id="banner-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Name & Headline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Nombre de Creadora / Artístico
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF0096]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Ubicación Base
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#00C8D4] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.location || ""}
                  onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Caracas / Expediciones Nacionales"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00C8D4]"
                />
              </div>
            </div>
          </div>

          {/* Headline */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Titular / Especialidad Turística
            </label>
            <input
              type="text"
              value={formData.headline}
              onChange={e => setFormData(prev => ({ ...prev, headline: e.target.value }))}
              placeholder="Viajera 4x4, expediciones aéreas con drone y gastronomía"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00C8D4]"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Biografía & Propuesta de Valor
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Describe tus rutas preferidas, audiencia y tipo de cobertura..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF0096] resize-none"
            />
          </div>

          {/* Socials & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                <InstagramIcon className="w-3 h-3 text-[#FF0096]" /> Instagram
              </label>
              <input
                type="text"
                value={formData.instagram || ""}
                onChange={e => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                placeholder="@auracroce"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF0096]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Video className="w-3 h-3 text-cyan-400" /> TikTok
              </label>
              <input
                type="text"
                value={formData.tiktok || ""}
                onChange={e => setFormData(prev => ({ ...prev, tiktok: e.target.value }))}
                placeholder="@auracroce_viajes"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                <YoutubeIcon className="w-3 h-3 text-red-500" /> YouTube
              </label>
              <input
                type="text"
                value={formData.youtube || ""}
                onChange={e => setFormData(prev => ({ ...prev, youtube: e.target.value }))}
                placeholder="Canal de YouTube"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-400" /> WhatsApp
              </label>
              <input
                type="text"
                value={formData.phone || ""}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+58 414-1234567"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Gear Equipment */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#00C8D4]" />
              <span>Equipo Audiovisual & Expedición (Drones, Cámaras, etc.)</span>
            </label>
            <input
              type="text"
              value={formData.gear_equipment || ""}
              onChange={e => setFormData(prev => ({ ...prev, gear_equipment: e.target.value }))}
              placeholder="DJI Mavic 3 Pro • Sony Alpha 7 IV • Lentes 24-70mm • Starlink Mini"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00C8D4]"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold cursor-pointer transition-all text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#00C8D4] hover:opacity-90 text-white text-xs font-black shadow-lg shadow-[#FF0096]/20 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>¡Guardado!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
