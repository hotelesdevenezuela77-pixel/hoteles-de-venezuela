import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { User, Settings, Mail, Shield, CheckCircle, Loader2, ArrowLeft, Phone } from "lucide-react";

export function Perfil() {
  const { user, profile } = useAuth();
  
  // Estados para formulario de perfil
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Estados para formulario de contraseña
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setProfileLoading(true);
      setProfileError("");
      setProfileSuccess(false);

      const { error } = await supabase
        .from("user_profiles")
        .update({
          name: name,
          phone: phone,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

      if (error) throw error;
      setProfileSuccess(true);
    } catch (err: any) {
      console.error(err);
      setProfileError("No se pudo actualizar la información de perfil.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      setPassError("Las contraseñas no coinciden.");
      return;
    }

    if (newPassword.length < 6) {
      setPassError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setPassLoading(true);
      setPassError("");
      setPassSuccess(false);

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      setPassSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      setPassError(err.message || "Error al cambiar la contraseña.");
    } finally {
      setPassLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <Shield className="w-14 h-14 mx-auto mb-4 text-brand-magenta opacity-30" />
        <h1 className="text-3xl font-black mb-2 text-gray-800">Acceso Restringido</h1>
        <p className="text-gray-400 text-xs mb-8">Debes iniciar sesión para acceder a tu panel de perfil.</p>
        <Link href="/login">
          <button className="btn-magenta-gradient px-8 py-3.5 rounded-full font-bold text-xs hover:scale-105 active:scale-95 transition-all">
            Iniciar Sesión
          </button>
        </Link>
      </div>
    );
  }

  const displayName = profile?.name || user.email?.split("@")[0] || "Usuario";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="bg-white min-h-screen">
      {/* Cabecera Premium en Morado */}
      <div
        className="relative overflow-hidden py-14"
        style={{ background: "linear-gradient(135deg, #1a0533 0%, #2d0d5c 100%)" }}
      >
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl bg-brand-magenta" />
        </div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al inicio</span>
          </Link>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-2xl shrink-0"
              style={{ background: "linear-gradient(135deg, #FF0096, #9B00CC)" }}
            >
              {initials}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                {displayName}
              </h1>
              <p className="text-white/70 flex items-center justify-center sm:justify-start gap-2 mt-1.5 text-sm">
                <Mail className="w-4 h-4 text-brand-turquesa" />
                {user.email}
              </p>
              
              <span
                className="inline-flex items-center gap-1.5 mt-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
                style={{
                  background: profile?.role === "admin" ? "rgba(255,0,150,0.25)" : "rgba(0,200,212,0.25)",
                  border: `1px solid ${profile?.role === "admin" ? "rgba(255,0,150,0.4)" : "rgba(0,200,212,0.4)"}`
                }}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {profile?.role === "admin" ? "Administrador" : profile?.role === "owner" ? "Propietario" : "Turista"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Formularios de Configuración */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Columna 1: Datos Personales */}
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="h-1 bg-gradient-to-r from-brand-magenta to-brand-purple" />
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3.5 mb-6 text-left">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-magenta-50/20 border border-brand-magenta/10">
                  <User className="w-5 h-5 text-brand-magenta" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-base">Datos Personales</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Actualiza tu perfil público</p>
                </div>
              </div>

              {profileError && (
                <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-2.5 text-xs font-semibold mb-4 text-left">
                  ⚠ {profileError}
                </div>
              )}

              {profileSuccess && (
                <div className="bg-green-50 border border-green-100 text-green-600 rounded-xl px-4 py-2.5 text-xs font-semibold mb-4 text-left">
                  ✓ Datos actualizados correctamente.
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4 text-left">
                {/* Nombre */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Nombre Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 outline-none focus:border-brand-magenta transition-colors"
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Teléfono / WhatsApp</label>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 focus-within:border-brand-magenta transition-colors">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="bg-transparent border-none outline-none text-xs text-gray-700 w-full placeholder-gray-400"
                      placeholder="+58 412 0000000"
                    />
                  </div>
                </div>

                {/* Email (Solo lectura) */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Correo Electrónico (No editable)</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-400 outline-none cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full btn-magenta-gradient py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 cursor-pointer mt-6"
                >
                  {profileLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Cambios</span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Columna 2: Seguridad (Contraseña) */}
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="h-1 bg-gradient-to-r from-brand-turquesa to-blue-500" />
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3.5 mb-6 text-left">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-cyan-50/20 border border-brand-turquesa/10">
                  <Settings className="w-5 h-5 text-brand-turquesa" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-base">Seguridad</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Modifica tu contraseña de acceso</p>
                </div>
              </div>

              {passError && (
                <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-2.5 text-xs font-semibold mb-4 text-left">
                  ⚠ {passError}
                </div>
              )}

              {passSuccess && (
                <div className="bg-green-50 border border-green-100 text-green-600 rounded-xl px-4 py-2.5 text-xs font-semibold mb-4 text-left">
                  ✓ Contraseña cambiada con éxito.
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
                {/* Nueva contraseña */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Nueva Contraseña</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 outline-none focus:border-brand-turquesa transition-colors"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Confirmar Contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-700 outline-none focus:border-brand-turquesa transition-colors"
                    placeholder="Repite tu contraseña"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={passLoading}
                  className="w-full btn-cyan-gradient py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 cursor-pointer mt-6"
                >
                  {passLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Actualizando...</span>
                    </>
                  ) : (
                    <span>Actualizar Contraseña</span>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
