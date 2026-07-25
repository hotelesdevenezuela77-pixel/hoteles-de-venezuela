import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Sparkles, BarChart3, Database, ShieldAlert, Cpu, 
  DollarSign, Activity, Settings, RefreshCw, FileText,
  Percent, Star, Building2, CheckCircle2, ChevronRight,
  TrendingUp, Award, Layers
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, Cell, Legend, AreaChart, Area, CartesianGrid,
  PieChart, Pie
} from "recharts";

// --- Configuración de Estilo Visual Oficial (AGENTS.md) ---
const C = {
  fucsia:   "#FF0096",
  teal:     "#00C8D4",
  purple:   "#9B00CC",
  darkCard: "#1a0533",
  darkBg:   "#0e011f",
  green:    "#22C55E",
  amber:    "#F59E0B",
  red:      "#EF4444"
};

interface TelemetryLog {
  id: number;
  query: string;
  destination: string;
  days: number;
  cost_usd: number;
  tokens_consumed: number;
  cost_tokens_usd: number;
  status: "generado" | "reservado_pagado";
  created_at: string;
}

export function AdminIaViajes() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<TelemetryLog[]>([]);

  // Reglas comerciales configurables
  const [rules, setRules] = useState({
    commissionRate: 15, // Comisión del SaaS por reserva
    prioritizeHdvSeal: true, // Priorizar hoteles con sello HDV
    marginPricing: 1.10, // Margen de incremento de precios base
    aiModel: "google/gemini-1.5-flash",
  });
  const [updatingRules, setUpdatingRules] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Carga de datos de telemetría y logs
  const fetchTelemetryLogs = () => {
    try {
      setLoading(true);
      const key = "hdv_ai_travel_logs";
      const localLogs = JSON.parse(localStorage.getItem(key) || "[]");

      // Carga base de logs mock si está vacío para ilustrar datos históricos al administrador
      if (localLogs.length === 0) {
        const mockLogs: TelemetryLog[] = [
          { id: 10001, query: "Viaje de 3 días a Los Roques con buceo", destination: "Archipiélago de Los Roques", days: 3, cost_usd: 480, tokens_consumed: 1420, cost_tokens_usd: 0.00284, status: "reservado_pagado", created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
          { id: 10002, query: "Itinerario de 5 días en Mérida para senderismo", destination: "Mérida (Páramos)", days: 5, cost_usd: 575, tokens_consumed: 1680, cost_tokens_usd: 0.00336, status: "generado", created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString() },
          { id: 10003, query: "Quiero ir 4 días a Canaima y ver el Salto Ángel", destination: "Parque Nacional Canaima", days: 4, cost_usd: 1120, tokens_consumed: 2150, cost_tokens_usd: 0.00430, status: "reservado_pagado", created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
          { id: 10004, query: "Fin de semana de relax en Morrocoy en posada premium", destination: "Morrocoy", days: 2, cost_usd: 250, tokens_consumed: 1180, cost_tokens_usd: 0.00236, status: "generado", created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString() },
          { id: 10005, query: "Vacaciones de 6 días en Playa El Agua, Margarita", destination: "Isla de Margarita", days: 6, cost_usd: 720, tokens_consumed: 1850, cost_tokens_usd: 0.00370, status: "generado", created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString() },
        ];
        localStorage.setItem(key, JSON.stringify(mockLogs));
        setLogs(mockLogs);
      } else {
        setLogs(localLogs);
      }
    } catch (e) {
      console.error("Failed to load AI logs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetryLogs();
  }, []);

  // Guardar reglas comerciales en localStorage
  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingRules(true);
    setTimeout(() => {
      localStorage.setItem("hdv_ai_business_rules", JSON.stringify(rules));
      setUpdatingRules(false);
      triggerToast("✅ Reglas de negocio actualizadas exitosamente.");
    }, 1000);
  };

  // --- Módulos de Cálculo y Analítica ---
  
  // 1. Embudo de conversión acumulativo (Base Mock + Historial Real)
  const funnelData = useMemo(() => {
    const totalChats = 1480 + logs.length;
    const itineraries = 1006 + logs.filter(l => l.status === "generado" || l.status === "reservado_pagado").length;
    const reservedAndPaid = 178 + logs.filter(l => l.status === "reservado_pagado").length;

    return [
      { name: "1. Chats Iniciados", valor: totalChats, porcentaje: "100%", fill: C.teal },
      { name: "2. Itinerarios Creados", valor: itineraries, porcentaje: `${Math.round((itineraries / totalChats) * 100)}%`, fill: C.purple },
      { name: "3. Reservas Pagadas", valor: reservedAndPaid, porcentaje: `${Math.round((reservedAndPaid / totalChats) * 100)}%`, fill: C.fucsia }
    ];
  }, [logs]);

  // 2. Destinos más sugeridos por la IA
  const destinationData = useMemo(() => {
    const counts: Record<string, number> = {
      "Los Roques": 240,
      "Mérida": 185,
      "Canaima": 150,
      "Morrocoy": 124,
      "Margarita": 98
    };

    logs.forEach(l => {
      let d = l.destination;
      if (d.includes("Roques")) d = "Los Roques";
      if (d.includes("Mérida")) d = "Mérida";
      if (d.includes("Canaima")) d = "Canaima";
      if (d.includes("Morrocoy")) d = "Morrocoy";
      if (d.includes("Margarita")) d = "Margarita";
      counts[d] = (counts[d] || 0) + 1;
    });

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    })).sort((a, b) => b.value - a.value);
  }, [logs]);

  // 3. Telemetría Financiera y Consumo de Tokens de Google Gemini Pro
  const costTelemetry = useMemo(() => {
    const baseTokens = 9845000;
    const addedTokens = logs.reduce((sum, l) => sum + l.tokens_consumed, 0);
    const totalTokens = baseTokens + addedTokens;
    
    // Costo por cada 1M de tokens en Gemini 1.5 Flash (entrada + salida promedio: $0.15 + $0.60 por millón)
    const costPerMillion = 0.50; 
    const costUSD = (totalTokens / 1000000) * costPerMillion;

    const baseRevenue = 15480; // Reservas previas
    const addedRevenue = logs.filter(l => l.status === "reservado_pagado").reduce((sum, l) => sum + l.cost_usd, 0);
    const totalRevenue = baseRevenue + addedRevenue;
    const saasCommission = totalRevenue * (rules.commissionRate / 100);

    return {
      tokens: totalTokens.toLocaleString("es-VE"),
      costUSD: costUSD.toFixed(2),
      revenueUSD: totalRevenue.toLocaleString("es-VE"),
      commissionUSD: saasCommission.toLocaleString("es-VE"),
    };
  }, [logs, rules]);

  return (
    <div className="min-h-screen text-slate-100 p-6 space-y-8"
         style={{ backgroundColor: C.darkBg }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 border rounded-2xl p-4 shadow-2xl bg-white border-green-200 text-green-700 animate-slide-in-right flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* CABECERA DE SECCIÓN */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
           style={{ background: "linear-gradient(135deg, #100224 0%, #1d033a 100%)" }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#00C8D4]/10 blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#FF0096]/10 blur-3xl -z-10" />
        
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00C8D4]">
            Consola Operativa Backoffice
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-black tracking-tight text-white uppercase">
            Monitoreo y Telemetría IA Viajes
          </h1>
          <p className="text-xs text-slate-400 font-semibold max-w-xl leading-relaxed">
            Supervisa el embudo de conversión de los itinerarios inteligentes de Centaurus, audita costos de consumo de tokens y gestiona reglas de facturación automática.
          </p>
        </div>

        <button 
          onClick={fetchTelemetryLogs}
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-xs flex items-center gap-1.5 transition-transform hover:scale-102 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Recargar Datos
        </button>
      </div>

      {/* METRICAS Y COSTOS OPERATIVOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tokens Google Gemini Consumidos", val: costTelemetry.tokens, desc: "Total acumulado de tokens", color: C.teal, icon: Cpu },
          { label: "Costo Total API (USD)", val: `$${costTelemetry.costUSD} USD`, desc: "Estimado por volumen", color: C.red, icon: DollarSign },
          { label: "Volumen de Reservas Planificadas", val: `$${costTelemetry.revenueUSD} USD`, desc: "Itinerarios de IA pagados", color: C.green, icon: TrendingUp },
          { label: "Comisiones SaaS HDV", val: `$${costTelemetry.commissionUSD} USD`, desc: `${rules.commissionRate}% de margen operativo`, color: C.fucsia, icon: Award }
        ].map((k, idx) => (
          <div key={idx} className="rounded-2xl border border-white/5 p-5 relative overflow-hidden transition-all hover:scale-101"
               style={{ backgroundColor: C.darkCard }}>
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-5 blur-xl" style={{ backgroundColor: k.color }} />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                   style={{ backgroundColor: `${k.color}15`, border: `1px solid ${k.color}25` }}>
                <k.icon className="w-4.5 h-4.5" style={{ color: k.color }} />
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{k.label}</span>
            </div>
            <div className="text-xl font-black text-white mt-4">{k.val}</div>
            <div className="text-[9px] text-slate-500 font-bold mt-1.5 flex items-center gap-1">
              <span style={{ color: k.color }}>•</span> {k.desc}
            </div>
          </div>
        ))}
      </div>

      {/* SECCIÓN DE ANALÍTICA GRÁFICA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico 1: Embudo de Conversión Comercial de la IA */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 p-5 space-y-4"
             style={{ backgroundColor: C.darkCard }}>
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <span className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF0096]" /> Embudo de Conversión de Itinerarios IA
            </span>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" barSize={32}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }} width={120} />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2.5 text-center text-xs font-bold pt-2 border-t border-white/5">
            {funnelData.map((f, idx) => (
              <div key={idx} className="p-2 rounded bg-black/15">
                <span className="block text-[8px] uppercase text-slate-500 tracking-wider mb-1">{f.name.substring(3)}</span>
                <span className="text-white block font-black">{f.valor}</span>
                <span className="text-[9px] block mt-0.5" style={{ color: f.fill }}>{f.porcentaje}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico 2: Destinos más sugeridos por Gemini */}
        <div className="rounded-2xl border border-white/5 p-5 space-y-4"
             style={{ backgroundColor: C.darkCard }}>
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <span className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
              <Star className="w-4 h-4 text-[#00C8D4]" /> Destinos Más Sugeridos por IA
            </span>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={destinationData} 
                  cx="50%" cy="50%" 
                  innerRadius={50} outerRadius={70} 
                  dataKey="value"
                >
                  {destinationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={[C.teal, C.purple, C.fucsia, C.green, C.amber][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 text-xs">
            {destinationData.map((d, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px] font-semibold text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: [C.teal, C.purple, C.fucsia, C.green, C.amber][idx % 5] }} />
                  <span className="text-white">{d.name}</span>
                </div>
                <span className="font-bold">{d.value} sugerencias</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECCIÓN CONFIGURACIÓN REGLAS + HISTORIAL LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulario de Configuración de Reglas de Negocio */}
        <div className="rounded-2xl border border-white/5 p-5 space-y-5"
             style={{ backgroundColor: C.darkCard }}>
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <span className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#FF0096]" /> Reglas del SaaS
            </span>
          </div>

          <form onSubmit={handleSaveRules} className="space-y-4 text-xs font-semibold text-slate-450">
            <div>
              <label className="text-slate-400 font-bold block mb-1.5 uppercase text-[9px] tracking-wider">Porcentaje de Comisión SaaS (%)</label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="number"
                  value={rules.commissionRate}
                  onChange={(e) => setRules(prev => ({ ...prev, commissionRate: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8D4] focus:ring-0 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1.5 uppercase text-[9px] tracking-wider">Margen de Precios Itinerario (Multiplicador)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="number"
                  step="0.05"
                  value={rules.marginPricing}
                  onChange={(e) => setRules(prev => ({ ...prev, marginPricing: parseFloat(e.target.value) || 1.0 }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8D4] focus:ring-0 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1.5 uppercase text-[9px] tracking-wider">Modelo Base IA</label>
              <select 
                value={rules.aiModel}
                onChange={(e) => setRules(prev => ({ ...prev, aiModel: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white font-bold bg-[#1a0533] focus:outline-none focus:border-[#00C8D4]"
              >
                <option value="google/gemini-1.5-flash">Google Gemini 1.5 Flash (Recomendado)</option>
                <option value="google/gemini-1.5-pro">Google Gemini 1.5 Pro</option>
                <option value="google/gemini-2.0-flash">Google Gemini 2.0 Flash</option>
              </select>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer select-none transition-colors hover:text-white pt-2.5">
              <input 
                type="checkbox"
                checked={rules.prioritizeHdvSeal}
                onChange={(e) => setRules(prev => ({ ...prev, prioritizeHdvSeal: e.target.checked }))}
                className="mt-0.5 rounded border-white/20 bg-white/5 text-[#FF0096] focus:ring-0 cursor-pointer"
              />
              <div>
                <span className="font-bold text-white block">Priorizar Sello Calidad HDV</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">El algoritmo priorizará hoteles que cuenten con el sello oficial de Hoteles de Venezuela.</span>
              </div>
            </label>

            <button 
              type="submit"
              disabled={updatingRules}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-transform hover:scale-102 cursor-pointer disabled:opacity-50"
            >
              {updatingRules ? "Actualizando..." : "Guardar Configuración"}
            </button>
          </form>
        </div>

        {/* Auditoría de Rutas Generadas (Historial de Logs) */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 p-5 space-y-4"
             style={{ backgroundColor: C.darkCard }}>
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <span className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
              <Database className="w-4 h-4 text-[#00C8D4]" /> Auditoría de Consultas de IA
            </span>
          </div>

          <div className="overflow-x-auto max-h-72 custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse font-semibold">
              <thead>
                <tr className="border-b border-white/5 text-[9px] uppercase font-bold text-slate-500 bg-black/20">
                  <th className="p-3">Destino / Solicitud</th>
                  <th className="p-3 text-center">Tokens</th>
                  <th className="p-3">Costo Itin.</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="text-white font-bold">{log.destination}</span>
                        <span className="text-[9px] text-slate-500 truncate max-w-[200px] mt-0.5" title={log.query}>
                          "{log.query}"
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-center text-[10px] text-slate-400 font-mono">
                      {log.tokens_consumed}
                    </td>
                    <td className="p-3 text-white font-bold">
                      ${log.cost_usd} USD
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        log.status === "reservado_pagado" 
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                          : "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20"
                      }`}>
                        {log.status === "reservado_pagado" ? "Pagado" : "Generado"}
                      </span>
                    </td>
                    <td className="p-3 text-right text-[10px] text-slate-500">
                      {new Date(log.created_at).toLocaleTimeString("es-VE")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
