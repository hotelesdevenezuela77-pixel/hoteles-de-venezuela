import React, { useState } from "react";
import { 
  User, 
  Camera, 
  Upload, 
  Lock, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Compass, 
  Check, 
  Sparkles, 
  KeyRound,
  AlertCircle
} from "lucide-react";

interface TouristProfileSettingsProps {
  user: any;
  profile: any;
  onUpdateProfile: (data: { name: string; phone: string; avatarUrl?: string; travelStyle?: string[] }) => Promise<void>;
  onUpdatePassword: (newPassword: string) => Promise<void>;
}

export function TouristProfileSettings({
  user,
  profile,
  onUpdateProfile,
  onUpdatePassword
}: TouristProfileSettingsProps) {
  const [name, setName] = useState(profile?.name || user?.user_metadata?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [city, setCity] = useState("Caracas, Venezuela");
  const [avatarUrl, setAvatarUrl] = useState<string>(
    profile?.avatar_url || user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
  );
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["Playa & Sol", "Ecoturismo", "Gastronomía"]);

  // Estados de carga y feedback
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState("");

  // Avatares predefinidos temáticos de viajeros en Venezuela
  const presetAvatars = [
    { label: "Explorador Élite", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" },
    { label: "Capitán de Catamarán", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
    { label: "Guía de Montaña", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80" },
    { label: "Fotógrafo de Naturaleza", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80" }
  ];

  const travelStylesList = ["Playa & Sol", "Ecoturismo", "Montaña", "Lujo VIP", "Gastronomía", "Aventura Extrema", "Cultura & Historia"];

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      setProfileError("");
      setProfileSuccess(false);

      await onUpdateProfile({
        name,
        phone,
        avatarUrl,
        travelStyle: selectedStyles
      });

      setProfileSuccess(true);
    } catch (err: any) {
      setProfileError("Error al actualizar la información del perfil.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassError("Las contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < 6) {
      setPassError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setPassLoading(true);
      setPassError("");
      setPassSuccess(false);

      await onUpdatePassword(newPassword);

      setPassSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPassError("Error al actualizar la contraseña.");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda: Foto de Perfil / Avatar & Selección */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6 flex flex-col items-center text-center">
        <div className="relative group">
          <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-[#00C8D4] via-[#FF0096] to-[#9B00CC] shadow-lg">
            <img
              src={avatarUrl}
              alt="Avatar de perfil"
              className="w-full h-full object-cover rounded-full border-2 border-white"
            />
          </div>

          <label className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-[#00C8D4] hover:text-slate-950 transition-all">
            <Camera className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <h3 className="font-serif font-bold text-lg text-slate-900">{name || "Viajero HDV"}</h3>
          <p className="text-xs text-slate-500">{user?.email}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00C8D4]/15 text-[#00C8D4] border border-[#00C8D4]/30">
            Perfil de Turista Verificado
          </span>
        </div>

        {/* Galería de Avatares Predefinidos */}
        <div className="w-full pt-4 border-t border-slate-100 space-y-3">
          <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">Avatares de Viajeros HDV</span>
          <div className="grid grid-cols-4 gap-2">
            {presetAvatars.map((av, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAvatarUrl(av.url)}
                className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                  avatarUrl === av.url ? "border-[#FF0096] scale-110 shadow-md" : "border-slate-200 hover:border-slate-400"
                }`}
                title={av.label}
              >
                <img src={av.url} alt={av.label} className="w-full h-full object-cover rounded-full" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Columna Derecha: Formulario de Datos & Estilos de Viaje */}
      <div className="lg:col-span-2 space-y-6">
        {/* Datos Personales */}
        <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-serif uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-[#00C8D4]" />
              Información de Perfil
            </h3>
            {profileSuccess && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Perfil Actualizado
              </span>
            )}
            {profileError && (
              <span className="text-xs text-red-500 font-bold flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {profileError}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00C8D4]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono / WhatsApp</label>
              <input
                type="tel"
                placeholder="+58 412 1234567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00C8D4]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico (No editable)</label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ciudad de Origen</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00C8D4]"
              />
            </div>
          </div>

          {/* Preferencias y Estilos de Viaje */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#FF0096]" />
              Estilo de Viaje Preferido
            </label>
            <div className="flex flex-wrap gap-2">
              {travelStylesList.map((st, i) => {
                const isSelected = selectedStyles.includes(st);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleStyle(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-gradient-to-r from-[#00C8D4] to-[#FF0096] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={profileLoading}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              {profileLoading ? "Guardando..." : "Guardar Cambios de Perfil"}
            </button>
          </div>
        </form>

        {/* Seguridad / Cambio de Contraseña */}
        <form onSubmit={handlePasswordSubmit} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 font-serif uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#9B00CC]" />
              Seguridad y Contraseña
            </h3>
            {passSuccess && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Contraseña Actualizada
              </span>
            )}
            {passError && (
              <span className="text-xs text-red-500 font-bold flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {passError}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nueva Contraseña</label>
              <input
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#9B00CC]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                required
                placeholder="Repite tu nueva contraseña"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#9B00CC]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passLoading}
              className="px-6 py-2.5 rounded-xl bg-[#9B00CC] hover:bg-[#9B00CC]/90 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              {passLoading ? "Actualizando..." : "Actualizar Contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
