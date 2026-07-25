import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Loader2, 
  Check, 
  ShieldAlert, 
  Info,
  Clock,
  X
} from "lucide-react";
import type { RouteWeatherAlert } from "@/types/modules";

export function AdminAlerts() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const qc = useQueryClient();

  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<'weather' | 'road_status'>('road_status');
  const [severity, setSeverity] = useState<'info' | 'warning' | 'danger'>('warning');
  const [description, setDescription] = useState("");
  const [affectedArea, setAffectedArea] = useState("");
  const [expiryHours, setExpiryHours] = useState<number>(24);

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      nav("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Query alerts
  const { data: alerts = [], isLoading } = useQuery<RouteWeatherAlert[]>({
    queryKey: ["admin-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("route_weather_alerts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Create alert
  const createAlert = useMutation({
    mutationFn: async () => {
      if (!title || !description || !affectedArea) {
        alert("Todos los campos obligatorios deben ser llenados.");
        return;
      }
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + Number(expiryHours));

      const { error } = await supabase.from("route_weather_alerts").insert({
        title,
        type,
        severity,
        description,
        affected_area: affectedArea,
        status: 'active',
        created_by: user?.id,
        expires_at: expiresAt.toISOString()
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-alerts"] });
      qc.invalidateQueries({ queryKey: ["active-route-weather-alerts"] });
      setModal(false);
      setTitle("");
      setDescription("");
      setAffectedArea("");
    }
  });

  // Resolve alert (status = 'resolved')
  const resolveAlert = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("route_weather_alerts").update({ status: 'resolved' }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-alerts"] });
      qc.invalidateQueries({ queryKey: ["active-route-weather-alerts"] });
    }
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e011f] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#00C8D4]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      <AdminTabBar />

      {/* Hero Header */}
      <section className="relative w-full h-48 flex items-center justify-center overflow-hidden bg-[#0e011f] mb-10 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0e011f] to-[#1a0533] opacity-90 z-10" />
        <div className="relative z-20 text-center text-white px-4">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00C8D4] mb-3 block">
            ALERTAS Y SEGURIDAD VIAL
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-black text-white">
            Gestor de Alertas de Ruta y Clima
          </h1>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        
        <div className="flex justify-between items-center gap-4 mb-8">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-gray-900">Alertas Activas e Historial</h2>
            <p className="text-xs text-gray-400 font-bold mt-0.5">Controla las notificaciones de alerta que se emiten en toda la web.</p>
          </div>
          <button 
            onClick={() => setModal(true)}
            className="btn-magenta-gradient text-white text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#FF0096]/15"
          >
            <Plus className="w-4 h-4 text-white" /> Emitir Nueva Alerta
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-[#00C8D4]" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-xs text-gray-400 font-bold">No hay alertas de clima o rutas registradas.</p>
          </div>
        ) : (
          <div className="space-y-4 text-left">
            {alerts.map((item) => {
              const active = item.status === "active" && (!item.expires_at || new Date(item.expires_at) > new Date());
              const severityColor = item.severity === 'danger' 
                ? 'border-l-[#FF0096] bg-[#FF0096]/5' 
                : (item.severity === 'warning' ? 'border-l-amber-500 bg-amber-50/30' : 'border-l-[#00C8D4] bg-[#00C8D4]/5');
              
              const IconComponent = item.severity === 'danger' 
                ? ShieldAlert 
                : (item.severity === 'warning' ? AlertTriangle : Info);

              return (
                <div key={item.id} className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${severityColor} p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-100 shadow-sm shrink-0">
                      <IconComponent className={`w-5 h-5 ${item.severity === 'danger' ? 'text-[#FF0096]' : (item.severity === 'warning' ? 'text-amber-500' : 'text-[#00C8D4]')}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-gray-900">{item.title}</span>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                          {active ? 'Activa' : 'Resuelta'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">Área afectada: {item.affected_area} · Tipo: {item.type === 'weather' ? 'Clima' : 'Vía'}</p>
                      <p className="text-xs text-gray-600 font-semibold mt-2 leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  {active && (
                    <button 
                      onClick={() => resolveAlert.mutate(item.id)}
                      className="border border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-extrabold px-4 py-2 rounded-xl text-[10px] cursor-pointer transition-colors shrink-0"
                    >
                      Marcar Resuelta
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Emit Alert Modal */}
      {modal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative border border-gray-100 animate-scale-up text-left">
            <button 
              onClick={() => setModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-base text-gray-900 uppercase tracking-wider mb-6">Emitir Alerta Crítica</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Título de la Alerta</label>
                <input 
                  type="text" 
                  placeholder="ej. Derrumbe en Paso Vial" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Tipo</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors bg-white cursor-pointer"
                  >
                    <option value="road_status">Estado de la Vía</option>
                    <option value="weather">Reporte del Clima</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Gravedad</label>
                  <select 
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors bg-white cursor-pointer"
                  >
                    <option value="info">Informativa (Cyan)</option>
                    <option value="warning">Precaución (Amarillo)</option>
                    <option value="danger">Peligro Crítico (Fucsia)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Área o Ruta Afectada</label>
                <input 
                  type="text" 
                  placeholder="ej. Autopista Caracas-La Guaira" 
                  value={affectedArea}
                  onChange={(e) => setAffectedArea(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Duración Activa (Horas)</label>
                <input 
                  type="number" 
                  value={expiryHours}
                  onChange={(e) => setExpiryHours(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Descripción del Suceso</label>
                <textarea 
                  placeholder="Describe la situación actual de forma detallada..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#00C8D4] transition-colors resize-none"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setModal(false)}
                className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 font-extrabold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={() => createAlert.mutate()}
                className="flex-1 btn-magenta-gradient text-white font-extrabold py-3 px-4 rounded-xl text-xs hover:scale-102 transition-transform cursor-pointer shadow-md shadow-[#FF0096]/10"
              >
                Publicar Alerta
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
