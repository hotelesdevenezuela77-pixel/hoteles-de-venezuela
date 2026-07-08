import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "../lib/auth";
import { User, Loader2, ArrowLeft, Building2 } from "lucide-react";

export function Registro() {
  const [role, setRole] = useState("user"); // "user" (Turista) o "owner" (Propietario)
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      setErrorMsg("");
      setLoading(true);
      // Guardar el rol temporalmente en localStorage antes de redireccionar a Google OAuth
      localStorage.setItem("hdv_pending_signup_role", role);
      
      const { error } = await loginWithGoogle();
      if (error) {
        setErrorMsg("Error al conectar con Google: " + error.message);
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg("Ocurrió un error inesperado al iniciar sesión con Google.");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 relative bg-gray-50/50 py-12">
      {/* Luces sutiles */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-brand-magenta/5 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-brand-turquesa/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="bg-white border border-gray-100 max-w-md w-full rounded-3xl p-8 md:p-10 shadow-xl relative z-10 text-center">
        
        {/* Volver */}
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

        <h1 className="text-2xl font-black text-gray-800 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          Crea tu Cuenta Premium
        </h1>
        <p className="text-gray-400 text-xs mt-2 mb-8 font-sans">
          Únete a la plataforma oficial de hospedaje y turismo en Venezuela de forma segura.
        </p>

        {errorMsg && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-xs font-semibold text-left mb-6">
            ⚠ {errorMsg}
          </div>
        )}

        <div className="space-y-6 text-left">
          {/* Selector de Rol */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2.5">
              Selecciona tu tipo de cuenta
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("user")}
                className={`py-3.5 px-4 rounded-xl border text-center font-bold text-xs flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  role === "user" 
                    ? "border-brand-magenta bg-magenta-50/5 text-brand-magenta shadow-sm scale-102" 
                    : "border-gray-100 bg-gray-50/50 text-gray-400 hover:bg-gray-50"
                }`}
              >
                <div className={`p-2 rounded-lg ${role === "user" ? "bg-brand-magenta text-white" : "bg-gray-100 text-gray-400"}`}>
                  <User className="w-4 h-4" />
                </div>
                <span>Soy Turista</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`py-3.5 px-4 rounded-xl border text-center font-bold text-xs flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  role === "owner" 
                    ? "border-brand-purple bg-purple-50/5 text-brand-purple shadow-sm scale-102" 
                    : "border-gray-100 bg-gray-50/50 text-gray-400 hover:bg-gray-50"
                }`}
              >
                <div className={`p-2 rounded-lg ${role === "owner" ? "bg-brand-purple text-white" : "bg-gray-100 text-gray-400"}`}>
                  <Building2 className="w-4 h-4" />
                </div>
                <span>Soy Propietario</span>
              </button>
            </div>
          </div>

          {/* Botón de Registro con Google */}
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 border border-gray-100 hover:border-brand-turquesa/30 bg-white rounded-xl font-bold text-sm text-gray-700 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 mt-6"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-brand-turquesa" />
            ) : (
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-brand-turquesa shrink-0">
                <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.41 0-6.177-2.767-6.177-6.177S10.582 6.16 13.991 6.16c1.558 0 2.977.576 4.07 1.526l3.14-3.14C19.273 2.766 16.79 1.6 13.99 1.6 8.252 1.6 3.6 6.252 3.6 12s4.652 10.4 10.39 10.4c5.776 0 10.38-4.232 10.38-10.4 0-.693-.082-1.353-.245-1.715H12.24z"/>
                </svg>
              </span>
            )}
            <span>{loading ? "Conectando con Google..." : "Registrarse con Google"}</span>
          </button>
        </div>

        <p className="text-gray-500 text-xs mt-8">
          ¿Ya posees una cuenta?{" "}
          <Link href="/login" className="text-brand-magenta font-bold hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
