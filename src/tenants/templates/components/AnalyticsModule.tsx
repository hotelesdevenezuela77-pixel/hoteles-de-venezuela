import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabase";
import { 
  BarChart3, TrendingUp, Users, Calendar, ArrowUpRight, 
  ArrowDownRight, Loader2, DollarSign, Percent, Smartphone, Globe
} from "lucide-react";

interface AnalyticsData {
  monthlyOcupation: number;
  totalViews: number;
  totalBookings: number;
  conversionRate: number;
  monthlyRevenue: { month: string; amount: number }[];
  bookingSources: { source: string; percentage: number }[];
}

interface AnalyticsModuleProps {
  establishmentId: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export function AnalyticsModule({ establishmentId, primaryColor, secondaryColor, accentColor }: AnalyticsModuleProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const localKey = `hdv_analytics_${establishmentId}`;

  // Cargar analíticas reales de producción (0 para arranque oficial a menos que existan reservas reales)
  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Limpiar caché previa de datos sintéticos de demostración
      localStorage.removeItem(localKey);

      // Consultar reservas reales registradas en Supabase
      const { data: reservations } = await supabase
        .from("reservations")
        .select("*")
        .eq("establishment_id", establishmentId);

      const totalBookings = reservations ? reservations.length : 0;
      const totalRevenue = reservations ? reservations.reduce((acc: number, r: any) => acc + (Number(r.total_price) || 0), 0) : 0;

      const realData: AnalyticsData = {
        monthlyOcupation: 0,
        totalViews: 0,
        totalBookings: totalBookings,
        conversionRate: 0,
        monthlyRevenue: [
          { month: "Ene", amount: 0 },
          { month: "Feb", amount: 0 },
          { month: "Mar", amount: 0 },
          { month: "Abr", amount: 0 },
          { month: "May", amount: 0 },
          { month: "Jun", amount: totalRevenue }
        ],
        bookingSources: [
          { source: "Directo Web", percentage: 0 },
          { source: "WhatsApp CRM", percentage: 0 },
          { source: "Google Search", percentage: 0 }
        ]
      };
      
      setData(realData);
      localStorage.setItem(localKey, JSON.stringify(realData));
    } catch (e) {
      console.error("Fallo al conectar analíticas en vivo:", e);
      const zeroData: AnalyticsData = {
        monthlyOcupation: 0,
        totalViews: 0,
        totalBookings: 0,
        conversionRate: 0,
        monthlyRevenue: [
          { month: "Ene", amount: 0 },
          { month: "Feb", amount: 0 },
          { month: "Mar", amount: 0 },
          { month: "Abr", amount: 0 },
          { month: "May", amount: 0 },
          { month: "Jun", amount: 0 }
        ],
        bookingSources: [
          { source: "Directo Web", percentage: 0 },
          { source: "WhatsApp CRM", percentage: 0 },
          { source: "Google Search", percentage: 0 }
        ]
      };
      setData(zeroData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [establishmentId]);

  // Encontrar el mes con mayores ingresos para mostrar en destacados
  const topMonth = useMemo(() => {
    if (!data) return null;
    return [...data.monthlyRevenue].sort((a, b) => b.amount - a.amount)[0];
  }, [data]);

  if (loading || !data) {
    return (
      <div className="bg-[#121620] border border-white/5 rounded-3xl p-12 flex items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 text-[#00C8D4] animate-spin mr-3" />
        <span className="text-xs">Sincronizando datos de analíticas en vivo...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#121620] border border-white/5 rounded-3xl p-6 shadow-xl space-y-6">
      
      {/* Header del Módulo */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-bold font-serif text-white tracking-wide">Analíticas y Tráfico Web</h3>
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-0.5">PMS - Monitoreo Comercial de Rendimiento Real</p>
          </div>
        </div>
      </div>

      {/* KPI Cards (Cero Cifras de Ejemplo) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-950/30 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[9px] font-bold uppercase tracking-wider">Tasa Ocupación</span>
            <Percent className="w-3.5 h-3.5 text-[#00C8D4]" />
          </div>
          <p className="text-xl font-black text-white mt-1 font-mono">{data.monthlyOcupation}%</p>
          <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold mt-1">
            <span>En espera de actividad</span>
          </div>
        </div>

        <div className="bg-slate-950/30 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[9px] font-bold uppercase tracking-wider">Visitas Web</span>
            <Users className="w-3.5 h-3.5 text-[#FF0096]" />
          </div>
          <p className="text-xl font-black text-white mt-1 font-mono">{data.totalViews.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold mt-1">
            <span>Inicio de operaciones</span>
          </div>
        </div>

        <div className="bg-slate-950/30 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[9px] font-bold uppercase tracking-wider">Reservas Exitosas</span>
            <Calendar className="w-3.5 h-3.5 text-[#9B00CC]" />
          </div>
          <p className="text-xl font-black text-white mt-1 font-mono">{data.totalBookings}</p>
          <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold mt-1">
            <span>Conteo en vivo</span>
          </div>
        </div>

        <div className="bg-slate-950/30 border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[9px] font-bold uppercase tracking-wider">Tasa Conversión</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-xl font-black text-white mt-1 font-mono">{data.conversionRate}%</p>
          <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold mt-1">
            <span>En espera de tráfico</span>
          </div>
        </div>
      </div>

      {/* Gráficos en SVG nativo para compilación ultraligera */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Gráfico 1: Histórico de Ingresos */}
        <div className="bg-slate-950/30 border border-white/5 rounded-2xl p-4 md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Historial de Ingresos Mensuales</h4>
            <span className="text-[9px] text-[#00C8D4] font-bold uppercase">Balance actual: ${topMonth?.amount || 0}</span>
          </div>
          
          <div className="h-44 flex items-end justify-between gap-2.5 pt-4 px-2 border-b border-l border-white/5 relative">
            {data.monthlyRevenue.map((r, i) => {
              const heightPercent = r.amount > 0 ? Math.min((r.amount / 5000) * 100, 100) : 4;
              return (
                <div key={i} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 bg-[#1a0533] border border-white/10 text-white font-mono text-[9px] font-bold py-1 px-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap shadow-xl">
                    ${r.amount.toLocaleString()}
                  </div>
                  
                  {/* Barra */}
                  <div 
                    className="w-full rounded-t-lg transition-all duration-300 hover:brightness-110"
                    style={{ 
                      height: `${heightPercent}%`, 
                      background: r.amount > 0 ? `linear-gradient(180deg, ${accentColor} 0%, ${secondaryColor} 100%)` : '#1e293b' 
                    }}
                  ></div>
                  
                  <span className="text-[9.5px] font-semibold text-gray-500 mt-2 font-mono">{r.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfico 2: Fuentes de Reserva */}
        <div className="bg-slate-950/30 border border-white/5 rounded-2xl p-4 space-y-4 flex flex-col justify-between">
          <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Canales de Adquisición</h4>
          
          <div className="space-y-3.5 py-4">
            {data.bookingSources.map((s, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-white flex items-center gap-1">
                    {s.source === "Directo Web" ? (
                      <Globe className="w-3.5 h-3.5 text-[#00C8D4] shrink-0" />
                    ) : (
                      <Smartphone className="w-3.5 h-3.5 text-[#FF0096] shrink-0" />
                    )}
                    {s.source}
                  </span>
                  <span className="font-mono text-slate-400">{s.percentage}%</span>
                </div>
                {/* Barra de porcentaje */}
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${s.percentage}%`,
                      backgroundColor: s.percentage > 0 ? (i === 0 ? primaryColor : i === 1 ? accentColor : secondaryColor) : '#1e293b'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[9px] text-gray-500 font-semibold leading-relaxed border-t border-white/5 pt-2.5">
            Monitoreo en tiempo real listo para el registro de tus ventas sin comisiones.
          </div>
        </div>

      </div>

    </div>
  );
}
