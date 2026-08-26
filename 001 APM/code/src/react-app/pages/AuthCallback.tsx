import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { Starfish, ShipWheel } from "@/react-app/components/landing/CaribbeanDecorations";

export default function AuthCallback() {
  const { exchangeCodeForSessionToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await exchangeCodeForSessionToken();
        navigate("/intranet");
      } catch (err) {
        console.error("Auth error:", err);
        setError("Error al iniciar sesión. Por favor intente de nuevo.");
      }
    };

    handleCallback();
  }, [exchangeCodeForSessionToken, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-blue-950 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center max-w-md">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-blue-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <Starfish className="w-16 h-16 text-cyan-400 animate-spin mx-auto" />
          <ShipWheel className="w-8 h-8 text-amber-400 absolute -bottom-2 -right-2 animate-pulse" />
        </div>
        <h2 className="text-xl text-white/80 font-medium">Iniciando sesión...</h2>
        <p className="text-white/50 mt-2">Por favor espere</p>
      </div>
    </div>
  );
}
