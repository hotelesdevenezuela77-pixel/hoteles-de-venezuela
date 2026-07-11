import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../lib/auth";
import { useLocation } from "wouter";
import { supabase } from "../../lib/supabase";
import { AdminTabBar } from "../../components/admin/AdminTabBar";
import { 
  Shield, Search, Trash2, ShieldAlert, CheckCircle, 
  Activity, Users, LogIn, Settings, Calendar, Filter, Loader2 
} from "lucide-react";

import { logActivity, type ActivityLog } from "../../lib/activityLogger";

export function AdminLogs() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  // Seguridad: Redirección si no es administrador
  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Cargar Logs
  const loadLogs = async () => {
    try {
      setLoading(true);
      
      // 1. Intentar consultar en base de datos
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false });

      let finalLogs: ActivityLog[] = [];
      const localKey = "hdv_activity_logs";
      const localData = localStorage.getItem(localKey);

      if (error || !data || data.length === 0) {
        if (localData) {
          finalLogs = JSON.parse(localData);
        } else {
          // Inicializar con logs ficticios iniciales de ejemplo
          finalLogs = [
            {
              id: "l1",
              user_id: user?.id || "admin-mock-id",
              email: "hotelesdevenezuela77@gmail.com",
              action: "LOGIN_GOOGLE",
              details: "Inicio de sesión administrativo oficial mediante Google OAuth.",
              created_at: new Date(Date.now() - 300000).toISOString()
            },
            {
              id: "l2",
              user_id: "user-mock-id-1",
              email: "partner@hotelesdevenezuela.com",
              action: "UPDATE_ROLE",
              details: "Cambio de rol del usuario partner@hotelesdevenezuela.com a Propietario.",
              created_at: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: "l3",
              user_id: user?.id || "admin-mock-id",
              email: "hotelesdevenezuela77@gmail.com",
              action: "EDIT_TENANT",
              details: "Modificación de colores de marca y activación de Club POS en Oleaje Beach Club.",
              created_at: new Date(Date.now() - 7200000).toISOString()
            },
            {
              id: "l4",
              user_id: "user-mock-id-2",
              email: "roni.moscovitz@gmail.com",
              action: "REGISTER",
              details: "Nuevo registro e inicio de sesión de usuario en el portal central.",
              created_at: new Date(Date.now() - 86400000).toISOString()
            }
          ];
          localStorage.setItem(localKey, JSON.stringify(finalLogs));
        }
      } else {
        finalLogs = data;
        localStorage.setItem(localKey, JSON.stringify(finalLogs));
      }

      setLogs(finalLogs);
    } catch (e) {
      console.error("Error al cargar logs de auditoría:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Limpiar historial de logs
  const handleClearLogs = () => {
    if (!confirm("¿Está seguro de que desea limpiar todos los logs de auditoría local?")) return;
    
    try {
      localStorage.removeItem("hdv_activity_logs");
      setLogs([]);
      supabase.from("activity_logs").delete().then(() => {
        loadLogs();
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Filtrar y buscar
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = actionFilter === "all" || log.action === actionFilter;
      
      return matchesSearch && matchesFilter;
    });
  }, [logs, searchQuery, actionFilter]);

  // Lista de acciones únicas para el selector de filtro
  const uniqueActions = useMemo(() => {
    const actions = new Set(logs.map(l => l.action));
    return Array.from(actions);
  }, [logs]);

  // Estadísticas rápidas
  const stats = useMemo(() => {
    const total = logs.length;
    const logins = logs.filter(l => l.action.startsWith("LOGIN") || l.action === "REGISTER").length;
    const configChanges = logs.filter(l => l.action.includes("TENANT") || l.action.includes("CONFIG")).length;
    const criticalActions = logs.filter(l => l.action.includes("ROLE") || l.action.includes("DELETE")).length;

    return { total, logins, configChanges, criticalActions };
  }, [logs]);

  const getActionBadgeStyle = (action: string) => {
    if (action.startsWith("LOGIN") || action === "REGISTER") {
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25";
    }
    if (action.includes("TENANT") || action.includes("CONFIG")) {
      return "bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/25";
    }
    if (action.includes("ROLE") || action.includes("DELETE")) {
      return "bg-[#FF0096]/10 text-[#FF0096] border border-[#FF0096]/25";
    }
    return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/25";
  };

  return (
    <div className="min-h-screen pb-20 text-slate-100 font-sans" style={{ backgroundColor: "#0b0c10" }}>
      
      {/* Cabecera Principal */}
      <header className="relative w-full border-b border-white/5 py-10 bg-[#121620]/45 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#FF0096] to-[#9B00CC] flex items-center justify-center shadow-lg shadow-[#FF0096]/10">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white font-serif tracking-wide">LOGS DE AUDITORÍA Y SEGURIDAD</h1>
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-0.5">
                Seguimiento de Operaciones del Staff en Tiempo Real
              </p>
            </div>
          </div>
          <button
            onClick={handleClearLogs}
            className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/25 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-97 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Limpiar Registro
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <AdminTabBar />

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8 animate-fade-in">
        
        {/* KPI Cards de Auditoría */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#121620] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-[#00C8D4]/10 rounded-xl">
              <Activity className="w-5 h-5 text-[#00C8D4]" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Logs Registrados</span>
              <p className="text-xl font-black text-white mt-0.5 font-mono">{stats.total}</p>
            </div>
          </div>

          <div className="bg-[#121620] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <LogIn className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Sesiones / Accesos</span>
              <p className="text-xl font-black text-white mt-0.5 font-mono">{stats.logins}</p>
            </div>
          </div>

          <div className="bg-[#121620] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-[#FF0096]/10 rounded-xl">
              <Settings className="w-5 h-5 text-[#FF0096]" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Cambios de Config</span>
              <p className="text-xl font-black text-white mt-0.5 font-mono">{stats.configChanges}</p>
            </div>
          </div>

          <div className="bg-[#121620] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Acciones Críticas</span>
              <p className="text-xl font-black text-white mt-0.5 font-mono">{stats.criticalActions}</p>
            </div>
          </div>
        </div>

        {/* Sección de Filtros y Tabla */}
        <div className="bg-[#121620] border border-white/5 rounded-3xl p-6 shadow-2xl">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-sm font-bold font-serif uppercase tracking-widest text-[#00C8D4] flex items-center gap-2">
              <Shield className="w-4 h-4" /> Historial de Seguridad y Logs
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:max-w-xl justify-end">
              {/* Selector de Filtro de Acción */}
              <div className="flex items-center gap-2 bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={actionFilter}
                  onChange={e => setActionFilter(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-white cursor-pointer"
                >
                  <option value="all" className="bg-[#121620]">Todas las Acciones</option>
                  {uniqueActions.map(action => (
                    <option key={action} value={action} className="bg-[#121620]">{action}</option>
                  ))}
                </select>
              </div>

              {/* Buscador */}
              <div className="flex items-center gap-2 bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 w-full sm:max-w-xs focus-within:border-[#00C8D4] transition-colors">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar por usuario o detalles..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-white placeholder-gray-600 w-full"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-10 h-10 text-[#00C8D4] animate-spin mb-4" />
              <span className="text-xs">Cargando base de datos de auditoría...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-20 text-center text-slate-600 border border-dashed border-white/10 rounded-2xl">
              <ShieldAlert className="w-12 h-12 text-[#FF0096] mx-auto mb-3" />
              <p className="text-xs font-bold">No se encontraron registros de auditoría en la red.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/30 text-gray-500 font-bold uppercase tracking-wider border-b border-white/5">
                    <th className="py-4 px-4 w-44">Fecha / Hora</th>
                    <th className="py-4 px-4 w-60">Usuario</th>
                    <th className="py-4 px-4 w-44 text-center">Acción</th>
                    <th className="py-4 px-4">Descripción de Actividad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-4 px-4 font-mono text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
                          {new Date(log.created_at).toLocaleString("es-VE")}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-white font-bold">{log.email}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest ${getActionBadgeStyle(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-300 font-light leading-relaxed">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
