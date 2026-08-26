import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Starfish, ShipWheel, TropicalFish, Seahorse } from "@/react-app/components/landing/CaribbeanDecorations";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

const LOGO_URL = "https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/2-01.png";

// Toggle para habilitar Google Login cuando esté configurado
const GOOGLE_LOGIN_ENABLED = false;

export default function Login() {
  const { redirectToLogin, user, isPending } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Check for admin session on mount
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          navigate("/smarthecosystems");
        }
      } catch (e) {
        // Not logged in as admin
      }
    };
    checkAdminSession();
  }, [navigate]);

  useEffect(() => {
    if (user && !isPending) {
      navigate("/smarthecosystems");
    }
  }, [user, isPending, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
        setIsLoading(false);
        return;
      }

      navigate("/smarthecosystems");
    } catch (err) {
      setError("Error de conexión");
      setIsLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-blue-950 flex items-center justify-center">
        <Starfish className="w-16 h-16 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-blue-950 flex items-center justify-center relative overflow-hidden">
      {/* Decoraciones */}
      <Starfish className="absolute top-10 left-10 w-20 h-20 text-cyan-500/20 animate-pulse pointer-events-none" />
      <ShipWheel className="absolute top-20 right-16 w-16 h-16 text-teal-500/20 animate-spin-slow pointer-events-none" />
      <TropicalFish className="absolute bottom-20 left-20 w-14 h-14 text-cyan-400/15 pointer-events-none" />
      <Seahorse className="absolute bottom-16 right-24 w-18 h-18 text-teal-400/20 pointer-events-none" />

      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 max-w-md w-full mx-4 border border-white/20 shadow-2xl relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src={LOGO_URL}
            alt="Aparto Posada del Mar"
            className="h-28 md:h-32 object-contain"
          />
        </div>

        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Panel de Administración
          </h1>
          <p className="text-white/60">
            Sistema de Gestión Hotelera
          </p>
        </div>

        {/* Formulario de Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              required
              className="w-full bg-white/10 border border-white/20 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              className="w-full bg-white/10 border border-white/20 rounded-xl py-4 pl-12 pr-12 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* Google Login - Oculto hasta que se configure OAuth */}
        {GOOGLE_LOGIN_ENABLED && (
          <div className="mt-6">
            <div className="relative flex items-center justify-center mb-4">
              <div className="border-t border-white/20 w-full"></div>
              <span className="px-4 text-white/40 text-sm bg-transparent">o</span>
              <div className="border-t border-white/20 w-full"></div>
            </div>
            
            <button
              onClick={redirectToLogin}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </button>
          </div>
        )}

        {/* Info */}
        <p className="text-center text-white/40 text-sm mt-6">
          Solo personal autorizado
        </p>

        {/* Volver al sitio */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
          >
            ← Volver al sitio web
          </a>
        </div>
      </div>
    </div>
  );
}
