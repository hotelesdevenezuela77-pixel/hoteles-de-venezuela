import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { Lock, Mail, Loader2, ShieldAlert } from "lucide-react";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingForm, setLoadingForm] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const [, setLocation] = useLocation();

  const handleGoogleLogin = async () => {
    try {
      setErrorMsg("");
      setLoadingForm(true);
      
      // Especificamos la redirección directa al Panel de Administración (/admin)
      const { error } = await loginWithGoogle(window.location.origin + "/admin");
      
      if (error) {
        setErrorMsg("Error al conectar con Google: " + error.message);
        setLoadingForm(false);
      }
    } catch (err) {
      setErrorMsg("Ocurrió un error inesperado al iniciar sesión con Google.");
      console.error(err);
      setLoadingForm(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Ingresa las credenciales requeridas.");
      return;
    }

    const emailLower = email.toLowerCase();
    const isAdminGeneral = emailLower === "hotelesdevenezuela77@gmail.com" || emailLower.includes("admin");

    try {
      setErrorMsg("");
      setLoadingForm(true);

      // 1. Verificar primero si el usuario es realmente administrador antes de iniciar sesión
      // (Consultar en la base de datos pública de perfiles)
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("email", emailLower)
        .maybeSingle();

      const isUserAdmin = profileData?.role === "admin";

      if (!isAdminGeneral && !isUserAdmin) {
        setErrorMsg("Acceso denegado. Este portal es exclusivo para personal administrativo oficial.");
        setLoadingForm(false);
        return;
      }

      // 2. Si es administrador, proceder con la autenticación en Supabase
      const { error } = await login(email, password);

      if (error) {
        setErrorMsg("Credenciales administrativas inválidas.");
      } else {
        // Redirigir directamente al panel general de administración
        setLocation("/admin");
      }
    } catch (err) {
      setErrorMsg("Error al conectar con la puerta de enlace de seguridad.");
      console.error(err);
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative py-12" style={{ backgroundColor: "#0b0c10" }}>
      {/* Glow de seguridad de alta gama (Rojo y Morado) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-brand-purple/5 rounded-full blur-[90px] pointer-events-none"></div>

      <div className="bg-[#121620] border border-white/5 max-w-md w-full rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 text-center text-white">
        
        {/* Icono de Seguridad */}
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 mx-auto mb-6">
          <ShieldAlert className="w-7 h-7 text-red-500" />
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white">Puerta de Enlace Oficial</h1>
        <p className="text-gray-400 text-xs mt-1 mb-8">
          Acceso LLC 2027 · Conexión Encriptada
        </p>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl px-4 py-3 text-xs font-semibold text-left mb-6">
            ⚠ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Email */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Email del Administrador</label>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-red-500 transition-colors">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="email" 
                placeholder="admin@hotelesdevenezuela.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-white w-full placeholder-gray-600"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Código de Acceso (Contraseña)</label>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-red-500 transition-colors">
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-white w-full placeholder-gray-600"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit"
            disabled={loadingForm}
            className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 hover:scale-101 transition-all mt-6 disabled:opacity-50 shadow-lg shadow-red-950/20"
          >
            {loadingForm ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando Credenciales...</span>
              </>
            ) : (
              <span>Autenticar Administrador</span>
            )}
          </button>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="px-3 text-[10px] text-gray-500 uppercase tracking-widest">O</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loadingForm}
            className="w-full bg-[#1e2230] border border-white/10 hover:border-red-500/50 text-white py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-3 cursor-pointer active:scale-98 hover:scale-101 transition-all disabled:opacity-50"
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-md bg-red-600 shrink-0">
              <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.41 0-6.177-2.767-6.177-6.177S10.582 6.16 13.991 6.16c1.558 0 2.977.576 4.07 1.526l3.14-3.14C19.273 2.766 16.79 1.6 13.99 1.6 8.252 1.6 3.6 6.252 3.6 12s4.652 10.4 10.39 10.4c5.776 0 10.38-4.232 10.38-10.4 0-.693-.082-1.353-.245-1.715H12.24z"/>
              </svg>
            </span>
            <span>Iniciar Sesión con Google Admin</span>
          </button>
        </form>

        <div className="text-[10px] text-gray-500 mt-8">
          Acceso registrado con IP y geolocalización. Las intrusiones serán bloqueadas.
        </div>
      </div>
    </div>
  );
}
