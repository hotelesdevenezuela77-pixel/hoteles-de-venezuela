import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { B2BScriptGenerator } from "@/components/B2BScriptGenerator";
import { Sparkles, Loader2 } from "lucide-react";

export function AdminGuiones() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, nav] = useLocation();

  // Redirección de seguridad si no es admin
  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      nav("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading, nav]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0518] text-white">
        <AdminTabBar />
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 text-[#FF0096] animate-spin" />
          <p className="text-slate-400 text-xs font-bold">Verificando credenciales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0518] text-slate-100 pb-20">
      <AdminTabBar />

      {/* Encabezado del Módulo (Full-Bleed, 100% width) */}
      <div className="relative overflow-hidden py-12 bg-gradient-to-br from-[#1a0533] via-[#0e011f] to-black text-white border-b border-white/5 w-full">
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-[#FF0096]/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-[#00C8D4]/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black bg-[#FF0096]/20 text-[#FF0096] border border-[#FF0096]/30 mb-2 tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Centro de Ventas & Prospección B2B</span>
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-black tracking-tight">
            Asistente de Guiones Comerciales
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed font-medium">
            Genera guiones comerciales persuasivos y estratégicos para captar, afiliar y fidelizar nuevos socios y aliados comerciales en la plataforma.
          </p>
        </div>
      </div>

      {/* Área del Generador */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        <B2BScriptGenerator />
      </main>
    </div>
  );
}
