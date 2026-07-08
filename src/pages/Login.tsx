import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { Mail, Lock, Loader2, ArrowLeft } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingForm, setLoadingForm] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Por favor, ingresa tu correo y contraseña.");
      return;
    }

    const emailLower = email.toLowerCase();

    try {
      setErrorMsg("");
      setLoadingForm(true);

      // 1. Verificar si la cuenta es administrativa antes de autenticar
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("email", emailLower)
        .maybeSingle();

      const isUserAdmin = profileData?.role === "admin" || emailLower === "hotelesdevenezuela77@gmail.com";

      if (isUserAdmin) {
        setErrorMsg("Acceso administrativo denegado en este portal. Utiliza la puerta de enlace de seguridad oficial.");
        setLoadingForm(false);
        return;
      }

      // 2. Si no es admin, proceder a autenticar
      const { error } = await login(email, password);
      
      if (error) {
        setErrorMsg("Credenciales incorrectas o cuenta inexistente.");
      } else {
        // Redirigir según el rol de usuario normal
        if (profileData?.role === "owner") {
          setLocation("/mis-negocios");
        } else {
          setLocation("/perfil");
        }
      }
    } catch (err) {
      setErrorMsg("Ocurrió un error inesperado al iniciar sesión.");
      console.error(err);
    } finally {
      setLoadingForm(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setErrorMsg("");
      const { error } = await loginWithGoogle();
      if (error) {
        setErrorMsg("Error al conectar con Google: " + error.message);
      }
    } catch (err) {
      setErrorMsg("Ocurrió un error inesperado al iniciar sesión con Google.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 relative bg-gray-50/50 py-12">
      {/* Círculos de brillo sutiles de fondo */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-brand-magenta/5 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-brand-turquesa/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="bg-white border border-gray-100 max-w-md w-full rounded-3xl p-8 md:p-10 shadow-xl relative z-10 text-center">
        {/* Enlace para volver */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-6 self-start">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al inicio</span>
        </Link>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src="/images/logo-hdv-transparent.png" 
            alt="Hoteles de Venezuela" 
            className="h-12 w-auto object-contain"
          />
        </div>

        <h1 className="text-2xl font-black text-gray-800 tracking-tight">¡Bienvenido de Nuevo!</h1>
        <p className="text-gray-400 text-xs mt-1 mb-8">
          Ingresa a tu cuenta para gestionar tus reservas o establecimientos.
        </p>

        {errorMsg && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-xs font-semibold text-left mb-6 animate-in fade-in duration-200">
            ⚠ {errorMsg}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Email */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Correo Electrónico</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 focus-within:border-brand-magenta transition-colors">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="email" 
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-gray-700 w-full placeholder-gray-400"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Contraseña</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 focus-within:border-brand-magenta transition-colors">
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-gray-700 w-full placeholder-gray-400"
                required
              />
            </div>
          </div>

          {/* Botón de Submit */}
          <button 
            type="submit"
            disabled={loadingForm}
            className="w-full btn-magenta-gradient py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-magenta/10 cursor-pointer active:scale-98 hover:scale-101 transition-all mt-6 disabled:opacity-50"
          >
            {loadingForm ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Iniciando Sesión...</span>
              </>
            ) : (
              <span>Iniciar Sesión</span>
            )}
          </button>
        </form>

        {/* Separador */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <span className="relative bg-white px-4 text-[10px] uppercase font-bold text-gray-400 tracking-wider z-10">O continuar con</span>
        </div>

        {/* Botón de Google */}
        <button 
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-100 hover:border-brand-turquesa/30 bg-white rounded-xl font-bold text-xs text-gray-700 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-brand-turquesa shrink-0">
            <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.41 0-6.177-2.767-6.177-6.177S10.582 6.16 13.991 6.16c1.558 0 2.977.576 4.07 1.526l3.14-3.14C19.273 2.766 16.79 1.6 13.99 1.6 8.252 1.6 3.6 6.252 3.6 12s4.652 10.4 10.39 10.4c5.776 0 10.38-4.232 10.38-10.4 0-.693-.082-1.353-.245-1.715H12.24z"/>
            </svg>
          </span>
          <span>Google</span>
        </button>

        <p className="text-gray-500 text-xs mt-8">
          ¿No tienes una cuenta aún?{" "}
          <Link href="/registro" className="text-brand-magenta font-bold hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
