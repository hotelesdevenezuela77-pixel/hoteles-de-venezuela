import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { Construction } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  icon?: React.ElementType;
}

export function AdminComingSoon({ title, description, icon: Icon = Construction }: Props) {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
        <p className="text-gray-500 text-xs font-bold">Verificando acceso...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 pb-24">
      {/* Header */}
      <div className="relative overflow-hidden py-8"
        style={{ background: "linear-gradient(135deg, #0e0120, #1a0533)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#FF0096" }} />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-brand-magenta/20">
              <Icon className="w-4.5 h-4.5 text-brand-magenta" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
              <p className="text-white/50 text-xs font-semibold">{description ?? "Módulo del panel administrativo"}</p>
            </div>
          </div>
        </div>
      </div>

      <AdminTabBar />

      <div className="max-w-md mx-auto px-6 py-16 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 border border-pink-200"
          style={{ background: "linear-gradient(135deg, rgba(255,0,150,0.08), rgba(0,200,212,0.08))" }}>
          <Construction className="w-9 h-9 text-[#FF0096]" />
        </div>
        <h2 className="text-base font-bold text-gray-900 mb-2">Módulo en Desarrollo</h2>
        <p className="text-gray-500 text-xs font-semibold leading-relaxed mb-6">
          El módulo de <strong>{title}</strong> se encuentra actualmente en fase de migración de base de datos desde Replit. Pronto estará disponible en producción.
        </p>
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-magenta animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
