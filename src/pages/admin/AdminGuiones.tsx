import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { ScriptGenerator } from "@/components/ScriptGenerator";
import { Sparkles, Loader2 } from "lucide-react";

interface Establishment {
  id: number;
  name: string;
  slug: string;
  status: "pending" | "approved" | "rejected";
  category_name?: string;
  membership_tier?: string;
  is_circuito_excelencia?: boolean;
}

export function AdminGuiones() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirección de seguridad si no es admin
  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      nav("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading, nav]);

  // Cargar todos los establecimientos aprobados
  useEffect(() => {
    async function fetchAllEstablishments() {
      if (!user) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("establishments")
          .select(`
            id,
            name,
            slug,
            status,
            membership_tier,
            is_circuito_excelencia,
            categories (name)
          `)
          .eq("status", "approved")
          .order("name", { ascending: true });

        if (error) throw error;

        const mapped: Establishment[] = (data || []).map((e: any) => ({
          id: e.id,
          name: e.name,
          slug: e.slug,
          status: e.status,
          category_name: e.categories?.name || "Hospedaje",
          membership_tier: e.membership_tier || "basico",
          is_circuito_excelencia: !!e.is_circuito_excelencia
        }));

        setEstablishments(mapped);
      } catch (err) {
        console.error("Error al cargar los establecimientos en el panel admin:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user && !authLoading) {
      fetchAllEstablishments();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0518] text-white">
        <AdminTabBar />
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 text-[#FF0096] animate-spin" />
          <p className="text-slate-400 text-xs font-bold">Cargando base de datos de hoteles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0518] text-slate-100 pb-20">
      <AdminTabBar />

      {/* Encabezado del Módulo */}
      <div className="relative overflow-hidden py-10 bg-gradient-to-br from-[#1a0533] via-[#0e011f] to-black text-white border-b border-white/5">
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-[#FF0096]/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-[#00C8D4]/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black bg-[#FF0096]/20 text-[#FF0096] border border-[#FF0096]/30 mb-2 tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Herramienta de Soporte Administrativo</span>
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-black tracking-tight">
            Asistente de Guiones y Respuestas de Venta
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Genera guiones comerciales persuasivos y estratégicos para responder de forma manual a prospectos o clientes de cualquier hotel miembro de la plataforma.
          </p>
        </div>
      </div>

      {/* Área del Generador */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        <ScriptGenerator establishments={establishments} />
      </main>
    </div>
  );
}
