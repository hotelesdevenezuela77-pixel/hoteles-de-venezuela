import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import {
  Building2, Users, Search, ExternalLink, HelpCircle,
  ShieldAlert, Loader2, CheckCircle, Clock
} from "lucide-react";

interface EstablishmentRow {
  id: number;
  name: string;
  slug: string;
  status: string;
  owner_user_id: string;
  owner_name: string;
  owner_email: string;
  category: string;
  destination: string;
}

const FUCSIA = "#FF0096";
const CIAN = "#00C8D4";
const PURPURA = "#9B00CC";

export default function AdminAsistencia() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading, setLocation]);

  const { data: rows = [], isLoading } = useQuery<EstablishmentRow[]>({
    queryKey: ["admin-assistance-establishments"],
    queryFn: async () => {
      // 1. Get establishments
      const { data: ests, error: estErr } = await supabase
        .from("establishments")
        .select(`
          id, name, slug, status, owner_user_id,
          categories (name),
          destinations (name)
        `)
        .order("name", { ascending: true });

      if (estErr) throw estErr;

      // 2. Get user profiles for owners
      const { data: profiles, error: profErr } = await supabase
        .from("user_profiles")
        .select("user_id, email, name");

      if (profErr) {
        console.warn("Could not load user profiles, falling back:", profErr);
      }

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      return (ests || []).map((est: any) => {
        const ownerProf = profileMap.get(est.owner_user_id);
        return {
          id: est.id,
          name: est.name,
          slug: est.slug,
          status: est.status || "pending",
          owner_user_id: est.owner_user_id || "",
          owner_name: ownerProf?.name || "Propietario Sin Nombre",
          owner_email: ownerProf?.email || "sin_correo@hdv.com",
          category: est.categories?.name || "General",
          destination: est.destinations?.name || "Venezuela"
        };
      });
    }
  });

  const handleStartAssistance = (row: EstablishmentRow) => {
    if (!row.owner_user_id) {
      alert("Este establecimiento no posee un Owner User ID válido para asistencia.");
      return;
    }
    // Set local storage variables
    localStorage.setItem("hdv_impersonate_owner_user_id", row.owner_user_id);
    localStorage.setItem("hdv_impersonate_owner_user_name", row.name);
    localStorage.setItem("hdv_impersonate_establishment_id", String(row.id));
    // Redirect to Owner Dashboard (mapped as /mis-negocios)
    setLocation("/mis-negocios");
  };

  const filteredRows = (rows || []).filter(r => {
    if (!r) return false;
    const query = search.toLowerCase();
    const name = r.name ? String(r.name).toLowerCase() : "";
    const ownerName = r.owner_name ? String(r.owner_name).toLowerCase() : "";
    const ownerEmail = r.owner_email ? String(r.owner_email).toLowerCase() : "";
    const destination = r.destination ? String(r.destination).toLowerCase() : "";
    
    return (
      name.includes(query) ||
      ownerName.includes(query) ||
      ownerEmail.includes(query) ||
      destination.includes(query)
    );
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: FUCSIA }} />
        <p className="text-slate-400 text-xs font-bold">Cargando Módulo de Asistencia...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-100 font-sans">
      
      {/* Cabecera / Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 border border-white/5 shadow-2xl"
           style={{ background: "linear-gradient(135deg, #1a0533 0%, #0e011f 100%)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-15" style={{ background: CIAN }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: PURPURA }} />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black tracking-wider uppercase"
                 style={{ backgroundColor: `${CIAN}15`, color: CIAN, border: `1px solid ${CIAN}30` }}>
              <HelpCircle className="w-3 h-3" />
              <span>Soporte Directo B2B</span>
            </div>
            <h1 className="text-3xl font-bold font-serif text-white tracking-wide">
              Asistencia al Propietario
            </h1>
            <p className="text-slate-400 text-xs max-w-xl leading-relaxed">
              Ingresa de manera directa al panel de control de cualquier cliente para asistirle en configuraciones de fotos, textos, cupones o su aplicación web de hotel independiente.
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shrink-0 flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${FUCSIA}20` }}>
              <ShieldAlert className="w-5 h-5" style={{ color: FUCSIA }} />
            </div>
            <div>
              <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Seguridad Matrix</span>
              <span className="text-xs font-bold text-white block">Acceso de Administrador General</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Filtros / Buscador */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl shadow-md">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por hotel, propietario, email o destino..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-turquesa/55 transition-colors focus:ring-0 focus:ring-offset-0"
          />
        </div>
        
        <div className="text-[10px] text-slate-500 font-bold uppercase shrink-0">
          Resultados: <span style={{ color: CIAN }}>{filteredRows.length} establecimientos</span>
        </div>
      </div>

      {/* Tabla de Hoteles */}
      <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Establecimiento</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Propietario / Contacto</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Destino</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-slate-500 font-bold py-16">
                    No se encontraron establecimientos.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Nombre e Icono */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 text-white shrink-0 shadow-inner bg-white/5">
                          <Building2 className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="font-bold text-sm block text-white">{row.name}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{row.category}</span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Propietario e email */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 text-white shrink-0 bg-white/5">
                          <Users className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs block text-slate-200">{row.owner_name}</span>
                          <span className="text-[10px] text-slate-500 font-medium block truncate max-w-[200px]">{row.owner_email}</span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Destino */}
                    <td className="p-4 text-xs font-semibold text-slate-300">
                      {row.destination}
                    </td>
                    
                    {/* Estado */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        row.status === "approved"
                          ? "bg-green-500/10 border-green-500/20 text-green-400"
                          : row.status === "rejected"
                          ? "bg-red-500/10 border-red-500/20 text-red-400"
                          : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                      }`}>
                        {row.status === "approved" ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Aprobado</span>
                          </>
                        ) : row.status === "rejected" ? (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Rechazado</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 animate-pulse" />
                            <span>Pendiente</span>
                          </>
                        )}
                      </span>
                    </td>
                    
                    {/* Botón Acción */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleStartAssistance(row)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-103 active:scale-97 cursor-pointer shadow-lg shadow-pink-500/10"
                        style={{
                          background: `linear-gradient(135deg, ${FUCSIA} 0%, ${PURPURA} 100%)`
                        }}
                      >
                        <span>Asistir Propietario</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
