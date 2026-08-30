import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";

const LOGO_URL = "https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/PERLA-NEGRA.png";

export default function Logout() {
  const { logout } = useAuth();
  const [status, setStatus] = useState<"clearing" | "done">("clearing");

  useEffect(() => {
    const clearEverything = async () => {
      try {
        // Clear admin session cookie
        await fetch("/api/auth/logout", { method: "POST" });
      } catch (e) {
        // Ignore errors
      }

      try {
        // Clear Google auth session
        await logout();
      } catch (e) {
        // Ignore errors
      }

      // Clear any localStorage items
      try {
        localStorage.clear();
      } catch (e) {}

      // Clear any sessionStorage items
      try {
        sessionStorage.clear();
      } catch (e) {}

      setStatus("done");
    };

    clearEverything();
  }, [logout]);

  const handleGoToLogin = () => {
    // Force a full page reload to clear any React state
    window.location.href = "/smarthecosystems/acceso";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center relative overflow-hidden">
      {/* Decorative corner accents */}
      <div className="absolute top-8 left-8 w-32 h-32 border-l-2 border-t-2 border-amber-500/30" />
      <div className="absolute top-8 right-8 w-32 h-32 border-r-2 border-t-2 border-amber-500/30" />
      <div className="absolute bottom-8 left-8 w-32 h-32 border-l-2 border-b-2 border-amber-500/30" />
      <div className="absolute bottom-8 right-8 w-32 h-32 border-r-2 border-b-2 border-amber-500/30" />

      <div className="bg-stone-900/80 backdrop-blur-sm p-8 md:p-12 max-w-md w-full mx-4 border border-amber-500/20 shadow-2xl relative z-10 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src={LOGO_URL}
            alt="Posada Perla Negra"
            className="h-28 md:h-32 object-contain"
          />
        </div>

        {status === "clearing" ? (
          <>
            <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
            <h1 className="text-xl text-white mb-2">Cerrando sesión...</h1>
            <p className="text-white/50 text-sm">Limpiando datos de sesión</p>
          </>
        ) : (
          <>
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h1 className="text-xl text-white mb-2">Sesión cerrada</h1>
            <p className="text-white/50 text-sm mb-6">Todos los datos de sesión han sido limpiados</p>
            <button
              onClick={handleGoToLogin}
              className="w-full gradient-gold text-stone-900 font-semibold py-4 px-6 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              Ir al Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
