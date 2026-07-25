import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AlertTriangle, Info, ShieldAlert, X } from "lucide-react";
import { useState } from "react";
import type { RouteWeatherAlert } from "@/types/modules";

export function RouteAlertsBanner() {
  const [dismissed, setDismissed] = useState(false);

  // Fetch active warnings & alerts
  const { data: alerts = [] } = useQuery<RouteWeatherAlert[]>({
    queryKey: ["active-route-weather-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("route_weather_alerts")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Failed to fetch alerts:", error.message);
        return [];
      }
      return data || [];
    }
  });

  if (dismissed || alerts.length === 0) return null;

  // Prioritize danger alerts
  const activeAlert = alerts.find(a => a.severity === "danger") || alerts[0];

  const bgColorClass = activeAlert.severity === "danger" 
    ? "bg-gradient-to-r from-[#FF0096] to-[#9B00CC]" 
    : "bg-gradient-to-r from-[#00C8D4] to-blue-600";

  const IconComponent = activeAlert.severity === "danger" 
    ? ShieldAlert 
    : (activeAlert.severity === "warning" ? AlertTriangle : Info);

  return (
    <div className={`w-full ${bgColorClass} text-white px-4 py-3 shadow-md relative transition-all duration-300 z-40 text-left`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Official Icon guidelines: Solid background box with white icon inside */}
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0 border border-white/10 shadow-sm">
            <IconComponent className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black uppercase tracking-wider block">
              {activeAlert.type === "weather" ? "ALERTA METEOROLÓGICA" : "ESTADO DE RUTAS VIALES"} · {activeAlert.affected_area}
            </p>
            <p className="text-[11px] font-bold text-white/95 truncate mt-0.5 leading-snug">
              {activeAlert.title}: {activeAlert.description}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setDismissed(true)}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center shrink-0 cursor-pointer"
          title="Cerrar alerta"
        >
          <X className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </div>
  );
}
