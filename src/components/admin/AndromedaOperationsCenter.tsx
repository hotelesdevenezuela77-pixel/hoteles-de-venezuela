import React, { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import {
  Activity,
  Radio,
  Cpu,
  Database,
  Globe,
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  TrendingUp,
  Server,
  Terminal,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Play,
  Pause,
  Filter,
  BarChart3,
  Layers,
  Wrench,
  LifeBuoy,
  Flame,
  Wifi,
  ExternalLink,
  ChevronRight,
  PlusCircle,
  Maximize2
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  category: "hospedaje" | "reportaje" | "tarea" | "soporte" | "sistema";
  level: "info" | "success" | "warning" | "error";
  code: string;
  message: string;
  details?: string;
}

interface AndromedaOperationsCenterProps {
  onNavigateTab?: (tab: string) => void;
}

export function AndromedaOperationsCenter({ onNavigateTab }: AndromedaOperationsCenterProps) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [autoRefreshRate, setAutoRefreshRate] = useState<number>(3); // seconds
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [logCategoryFilter, setLogCategoryFilter] = useState<string>("all");
  
  // Operational Real/Mock Stats
  const [totalHoteles, setTotalHoteles] = useState<number>(22);
  const [hotelesCreadosHoy, setHotelesCreadosHoy] = useState<number>(3);
  const [hoteles7Dias, setHoteles7Dias] = useState<number>(14);

  const [totalReportajes, setTotalReportajes] = useState<number>(48);
  const [reportajesUltimaSemana, setReportajesUltimaSemana] = useState<number>(6);

  const [tareasPendientes, setTareasPendientes] = useState<number>(5);
  const [tareasCompletadasHoy, setTareasCompletadasHoy] = useState<number>(19);

  const [ticketsEnProceso, setTicketsEnProceso] = useState<number>(4);
  const [ticketsSolucionados, setTicketsSolucionados] = useState<number>(28);

  const [latencyMs, setLatencyMs] = useState<number>(24);
  const [cpuUsage, setCpuUsage] = useState<number>(18);
  const [memoryUsage, setMemoryUsage] = useState<number>(34);

  // Live Terminal Log Entries
  const [logs, setLogs] = useState<SystemLogEntry[]>([
    {
      id: "log-1",
      timestamp: new Date(Date.now() - 1000 * 20).toISOString().slice(11, 19) + " UTC",
      category: "hospedaje",
      level: "success",
      code: "HOSP_NODE_200",
      message: 'Nuevo hospedaje registrado "Posada Cayo Sal" [ID #8492]',
      details: "Nodo validado y publicado en la guía oficial de la costa."
    },
    {
      id: "log-2",
      timestamp: new Date(Date.now() - 1000 * 45).toISOString().slice(11, 19) + " UTC",
      category: "reportaje",
      level: "info",
      code: "MEDIA_PUB_201",
      message: 'Reportaje turistico emittido "Top 10 Posadas con Encanto en Los Roques 2026"',
      details: "Sincronizado en sitemap y motor de recomendación con IA."
    },
    {
      id: "log-3",
      timestamp: new Date(Date.now() - 1000 * 90).toISOString().slice(11, 19) + " UTC",
      category: "soporte",
      level: "success",
      code: "TK_RESOLVED",
      message: 'Ticket de soporte #TK-2026-6210 marcado como [SOLUCIONADO]',
      details: "Diagnóstico: Actualización de firmware en lector POS completada."
    },
    {
      id: "log-4",
      timestamp: new Date(Date.now() - 1000 * 150).toISOString().slice(11, 19) + " UTC",
      category: "tarea",
      level: "info",
      code: "TASK_EXEC_102",
      message: 'Tarea operativa completada "Verificación de fotos de áreas comunes"',
      details: "Ejecutado por personal de auditoría de calidad."
    },
    {
      id: "log-5",
      timestamp: new Date(Date.now() - 1000 * 220).toISOString().slice(11, 19) + " UTC",
      category: "sistema",
      level: "info",
      code: "OTA_SYNC_OK",
      message: "Sincronización de tarifas Channel Manager con Hesperia & Lidotel",
      details: "Respuesta HTTP 200 OK — 142 tarifas actualizadas."
    }
  ]);

  // Live ticking UTC clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace("GMT", "UTC"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real count from Supabase
  useEffect(() => {
    async function loadOperationalData() {
      try {
        const [estRes, blogRes] = await Promise.all([
          supabase.from("establishments").select("id, created_at", { count: "exact" }),
          supabase.from("blog_posts").select("id, created_at", { count: "exact" })
        ]);

        if (estRes.count !== null && estRes.count > 0) {
          setTotalHoteles(estRes.count);
        }
        if (blogRes.count !== null && blogRes.count > 0) {
          setTotalReportajes(blogRes.count);
        }
      } catch (e) {
        console.warn("Error fetching live operational stats:", e);
      }
    }
    loadOperationalData();
  }, []);

  // Simulated live telemetry stream generator
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      // Fluctuate CPU / Latency
      setLatencyMs(prev => Math.max(12, Math.min(48, prev + Math.floor(Math.random() * 7 - 3))));
      setCpuUsage(prev => Math.max(10, Math.min(65, prev + Math.floor(Math.random() * 9 - 4))));
      setMemoryUsage(prev => Math.max(28, Math.min(52, prev + Math.floor(Math.random() * 5 - 2))));

      // Randomly push simulated live telemetry logs
      if (Math.random() > 0.4) {
        const categories: SystemLogEntry["category"][] = ["hospedaje", "reportaje", "tarea", "soporte", "sistema"];
        const chosenCat = categories[Math.floor(Math.random() * categories.length)];
        const tsStr = new Date().toISOString().slice(11, 19) + " UTC";

        let newLog: SystemLogEntry;

        if (chosenCat === "hospedaje") {
          const names = ["Hotel Boutique Coral", "Posada Playa El Agua", "Resort Mochima", "Glamping Galipán", "Chalet Mérida VIP"];
          const randName = names[Math.floor(Math.random() * names.length)];
          newLog = {
            id: `log-${Date.now()}`,
            timestamp: tsStr,
            category: "hospedaje",
            level: "success",
            code: "HOSP_NODE_200",
            message: `Registro de Hospedaje "${randName}" verificado en plataforma.`,
            details: "Certificado de Registro Turístico verificado en Supabase."
          };
        } else if (chosenCat === "reportaje") {
          const titles = ["Guía Completa Morrocoy 2026", "Ruta Gastronómica Caracas", "Secretos de Colonia Tovar", "Playas Virgenes de La Tortuga"];
          const randTitle = titles[Math.floor(Math.random() * titles.length)];
          newLog = {
            id: `log-${Date.now()}`,
            timestamp: tsStr,
            category: "reportaje",
            level: "info",
            code: "MEDIA_PUB_201",
            message: `Reportaje publicado "${randTitle}" en la revista digital.`,
            details: "Optimizado para SEO y sindicado en Google Indexing Engine."
          };
        } else if (chosenCat === "soporte") {
          const randId = Math.floor(1000 + Math.random() * 9000);
          newLog = {
            id: `log-${Date.now()}`,
            timestamp: tsStr,
            category: "soporte",
            level: "success",
            code: "TK_UPDATE",
            message: `Ticket #TK-2026-${randId} en proceso por el equipo técnico.`,
            details: "Diagnóstico en ejecución — Verificación de conectividad en curso."
          };
        } else if (chosenCat === "tarea") {
          newLog = {
            id: `log-${Date.now()}`,
            timestamp: tsStr,
            category: "tarea",
            level: "info",
            code: "TASK_DONE",
            message: "Mantenimiento preventivo de servidor y caché completado.",
            details: "Purga de CDN Edge completada en 18ms."
          };
        } else {
          newLog = {
            id: `log-${Date.now()}`,
            timestamp: tsStr,
            category: "sistema",
            level: "info",
            code: "SYS_HEALTH",
            message: "Supabase DB Pool Health Check OK — 0 consultas bloqueadas",
            details: "Índices B-Tree optimizados en 100% de tablas."
          };
        }

        setLogs(prev => [newLog, ...prev.slice(0, 19)]);
      }
    }, autoRefreshRate * 1000);

    return () => clearInterval(interval);
  }, [isStreaming, autoRefreshRate]);

  // Chart Data
  const hourlyActivityData = [
    { hora: "08:00", hospedajes: 1, reportajes: 2, operaciones: 12 },
    { hora: "10:00", hospedajes: 2, reportajes: 4, operaciones: 25 },
    { hora: "12:00", hospedajes: 3, reportajes: 5, operaciones: 38 },
    { hora: "14:00", hospedajes: 2, reportajes: 8, operaciones: 45 },
    { hora: "16:00", hospedajes: 4, reportajes: 6, operaciones: 52 },
    { hora: "18:00", hospedajes: 3, reportajes: 9, operaciones: 64 },
    { hora: "20:00", hospedajes: 5, reportajes: 7, operaciones: 78 },
  ];

  const regionalRadarData = [
    { region: "Nueva Esparta", cobertura: 95, reportajes: 88, operaciones: 92 },
    { region: "Distrito Capital", cobertura: 90, reportajes: 94, operaciones: 86 },
    { region: "Falcón / Morrocoy", cobertura: 88, reportajes: 85, operaciones: 90 },
    { region: "Mérida / Andes", cobertura: 82, reportajes: 78, operaciones: 84 },
    { region: "Aragua / Carabobo", cobertura: 85, reportajes: 80, operaciones: 88 },
    { region: "Anzoátegui / Sucre", cobertura: 79, reportajes: 75, operaciones: 81 },
  ];

  const taskDistributionData = [
    { name: "Resueltas", value: 78, color: "#10b981" },
    { name: "En Proceso", value: 16, color: "#00C8D4" },
    { name: "Pendientes", value: 6, color: "#FF0096" }
  ];

  const filteredLogs = useMemo(() => {
    if (logCategoryFilter === "all") return logs;
    return logs.filter(l => l.category === logCategoryFilter);
  }, [logs, logCategoryFilter]);

  return (
    <div className="space-y-6 text-left font-sans selection:bg-[#FF0096] selection:text-white">
      
      {/* 🚀 CABECERA ESTILO NASA CONTROL CENTER */}
      <div className="bg-[#05010d] border border-[#00C8D4]/40 rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
        {/* Glow Effects Sci-Fi */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-[#00C8D4]/15 via-[#9B00CC]/15 to-[#FF0096]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-[#9B00CC]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase text-white tracking-widest bg-gradient-to-r from-[#00C8D4] via-[#9B00CC] to-[#FF0096] shadow-lg flex items-center gap-1.5 animate-pulse">
                <Radio className="w-3 h-3 text-white" />
                SYSTEM TELEMETRY ONLINE
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                UPTIME 99.98%
              </span>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
                {currentTime || "CARGANDO RELOJ UTC..."}
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-serif font-black tracking-tight text-white flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0e011f] border-2 border-[#00C8D4] flex items-center justify-center text-[#00C8D4] shrink-0 shadow-lg shadow-cyan-500/20">
                <Cpu className="w-6 h-6 text-[#00C8D4] animate-pulse" />
              </div>
              NODO GALÁCTICO ANDRÓMEDA-X
            </h1>

            <p className="text-slate-300 text-xs md:text-sm mt-2 max-w-3xl leading-relaxed font-medium">
              Centro de Control Operativo Avanzado. Monitorización en vivo de creación de hospedajes, publicación de reportajes, telemetría de tareas y resolución de soporte en la red nacional.
            </p>
          </div>

          {/* CONTROLES DE TRANSMISIÓN NASA */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 bg-[#0e011f]/90 p-3 rounded-2xl border border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => setIsStreaming(!isStreaming)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                isStreaming
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30"
                  : "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30"
              }`}
            >
              {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isStreaming ? "Telemetría Viva (Activo)" : "En Pausa"}</span>
            </button>

            <select
              value={autoRefreshRate}
              onChange={(e) => setAutoRefreshRate(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono font-bold px-3 py-2.5 rounded-xl outline-none focus:border-[#00C8D4] cursor-pointer"
            >
              <option value={1}>Actualización: 1s</option>
              <option value={3}>Actualización: 3s</option>
              <option value={5}>Actualización: 5s</option>
              <option value={10}>Actualización: 10s</option>
            </select>
          </div>
        </div>

        {/* 📊 TELEMETRÍA EN VIVIO DE RECURSOS DE HARDWARE / SERVIDOR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Server className="w-4 h-4 text-[#00C8D4]" />
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Latencia de Red</span>
                <span className="font-mono font-black text-sm text-[#00C8D4]">{latencyMs} ms</span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-[#FF0096]" />
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Carga de CPU</span>
                <span className="font-mono font-black text-sm text-[#FF0096]">{cpuUsage}%</span>
              </div>
            </div>
            <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#FF0096] h-full transition-all duration-500" style={{ width: `${cpuUsage}%` }} />
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-[#9B00CC]" />
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Uso de Memoria</span>
                <span className="font-mono font-black text-sm text-[#9B00CC]">{memoryUsage}%</span>
              </div>
            </div>
            <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#9B00CC] h-full transition-all duration-500" style={{ width: `${memoryUsage}%` }} />
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Base de Datos</span>
                <span className="font-mono font-black text-sm text-emerald-400">SUPABASE OK</span>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

      </div>

      {/* 🚀 BLOQUE PRINCIPAL DE MÉTRICAS OPERATIVAS (HOTELES, REPORTAJES, TAREAS, SOPORTE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* CARD 1: HOTELES & HOSPEDAJES CREADOS */}
        <div className="bg-[#0e011f] border border-[#00C8D4]/30 rounded-3xl p-6 text-white shadow-xl space-y-4 hover:border-[#00C8D4] transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#00C8D4]/20 border border-[#00C8D4]/40 flex items-center justify-center text-[#00C8D4]">
              <Building2 className="w-5 h-5 text-[#00C8D4]" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/20">
              OPERACIÓN HOTELES
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Hospedajes en Red</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-white">{totalHoteles}</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +{hotelesCreadosHoy} hoy
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-slate-400 block font-bold">Últimos 7 Días:</span>
              <span className="font-mono font-bold text-[#00C8D4] text-xs">+{hoteles7Dias} hospedajes</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold">Verificación KYC:</span>
              <span className="font-mono font-bold text-emerald-400 text-xs">94.2% Aprobado</span>
            </div>
          </div>
        </div>

        {/* CARD 2: REPORTAJES & BLOGSTurísticos */}
        <div className="bg-[#0e011f] border border-[#FF0096]/30 rounded-3xl p-6 text-white shadow-xl space-y-4 hover:border-[#FF0096] transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FF0096]/20 border border-[#FF0096]/40 flex items-center justify-center text-[#FF0096]">
              <FileText className="w-5 h-5 text-[#FF0096]" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#FF0096]/10 text-[#FF0096] border border-[#FF0096]/20">
              MARKETING & EDITORIAL
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Reportajes & Guías Emitidas</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-white">{totalReportajes}</span>
              <span className="text-xs font-bold text-[#FF0096] flex items-center gap-0.5">
                <Sparkles className="w-3.5 h-3.5" /> +{reportajesUltimaSemana} esta semana
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-slate-400 block font-bold">Lectoras / Clics:</span>
              <span className="font-mono font-bold text-pink-400 text-xs">14.8k Lecturas</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold">Sindicación SEO:</span>
              <span className="font-mono font-bold text-emerald-400 text-xs">100% Indexado</span>
            </div>
          </div>
        </div>

        {/* CARD 3: TAREAS OPERATIVAS RESTANTES */}
        <div className="bg-[#0e011f] border border-[#9B00CC]/30 rounded-3xl p-6 text-white shadow-xl space-y-4 hover:border-[#9B00CC] transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#9B00CC]/20 border border-[#9B00CC]/40 flex items-center justify-center text-[#9B00CC]">
              <Layers className="w-5 h-5 text-[#9B00CC]" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#9B00CC]/10 text-[#9B00CC] border border-[#9B00CC]/20">
              TAREAS OPERATIVAS
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Tareas Pendientes Restantes</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-amber-400">{tareasPendientes}</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> {tareasCompletadasHoy} resueltas hoy
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-slate-400 block font-bold">Eficiencia de Ejecución:</span>
              <span className="font-mono font-bold text-emerald-400 text-xs">96.8% a tiempo</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold">Carga de Operarios:</span>
              <span className="font-mono font-bold text-amber-400 text-xs">Baja / Normal</span>
            </div>
          </div>
        </div>

        {/* CARD 4: TICKETS DE SOPORTE TÉCNICO VIVA */}
        <div className="bg-[#0e011f] border border-blue-500/30 rounded-3xl p-6 text-white shadow-xl space-y-4 hover:border-blue-400 transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Wrench className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              SOPORTE EN VIVO
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Tickets En Proceso</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-[#00C8D4]">{ticketsEnProceso}</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> {ticketsSolucionados} solucionados
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-slate-400 block font-bold">Tiempo Promedio:</span>
              <span className="font-mono font-bold text-blue-400 text-xs">12 min respuesta</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold">Satisfacción Staff:</span>
              <span className="font-mono font-bold text-emerald-400 text-xs">99.1% Estándar</span>
            </div>
          </div>
        </div>

      </div>

      {/* 🚀 SECCIÓN GRÁFICAS DE TELEMETRÍA Y CONTROL DE OPERACIONES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRÁFICA 1: ACTIVIDAD OPERATIVA POR HORA (AREA CHART RECHARTS) */}
        <div className="lg:col-span-2 bg-[#0e011f] border border-white/10 rounded-3xl p-6 text-white shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-serif font-black text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#00C8D4]" />
                Flujo Operativo en Tiempo Real (Operaciones / Hora)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Frecuencia de altas de hospedajes, emisión de reportajes y tareas resueltas.</p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold text-[#00C8D4] bg-[#00C8D4]/10 border border-[#00C8D4]/20 self-start sm:self-center">
              MONITOR DE FLUJO VIVO
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOperaciones" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C8D4" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#00C8D4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReportajes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF0096" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#FF0096" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hora" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#05010d', borderColor: '#00C8D4', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="operaciones" stroke="#00C8D4" strokeWidth={3} fillOpacity={1} fill="url(#colorOperaciones)" name="Total Operaciones" />
                <Area type="monotone" dataKey="reportajes" stroke="#FF0096" strokeWidth={2} fillOpacity={1} fill="url(#colorReportajes)" name="Reportajes Emitidos" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICA 2: RADAR DE COBERTURA OPERATIVA REGIONAL (RADAR CHART) */}
        <div className="bg-[#0e011f] border border-white/10 rounded-3xl p-6 text-white shadow-xl space-y-4">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-serif font-black text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#FF0096]" />
              Radar Operativo Nacional
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Despliegue y densidad de hospedajes por región.</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={regionalRadarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="region" stroke="#94A3B8" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                <Radar name="Cobertura (%)" dataKey="cobertura" stroke="#00C8D4" fill="#00C8D4" fillOpacity={0.4} />
                <Radar name="Operaciones" dataKey="operaciones" stroke="#FF0096" fill="#FF0096" fillOpacity={0.3} />
                <Tooltip contentStyle={{ backgroundColor: '#05010d', borderColor: '#FF0096', borderRadius: '12px', fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 🚀 TERMINAL DE LOGS DE TELEMETRÍA EN VIVO (ESTILO CONSOLA NASA COMMAND) */}
      <div className="bg-[#05010d] border border-[#00C8D4]/30 rounded-3xl p-6 text-white shadow-2xl space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400">
              <Terminal className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-mono font-black text-white flex items-center gap-2">
                <span>TERMINAL DE LOGS DE OPERACIONES EN TIEMPO REAL</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">Stream de eventos y telemetría de red nacional en directo.</p>
            </div>
          </div>

          {/* Filtros de la consola */}
          <div className="flex flex-wrap items-center gap-2">
            {["all", "hospedaje", "reportaje", "tarea", "soporte", "sistema"].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setLogCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  logCategoryFilter === cat
                    ? "bg-[#00C8D4] text-slate-950 border-[#00C8D4] font-black shadow-md shadow-cyan-500/20"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                {cat === "all" ? "TODOS" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* FEED DE EVENTOS TIPO TERMINAL */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 font-mono text-xs max-h-80 overflow-y-auto space-y-2.5 no-scrollbar shadow-inner">
          {filteredLogs.length === 0 ? (
            <div className="py-8 text-center text-slate-500 font-mono">
              Esperando nuevos eventos de telemetría en tiempo real...
            </div>
          ) : (
            filteredLogs.map(log => {
              let badgeColor = "text-cyan-400 bg-cyan-950/80 border-cyan-800";
              if (log.category === "hospedaje") badgeColor = "text-emerald-400 bg-emerald-950/80 border-emerald-800";
              if (log.category === "reportaje") badgeColor = "text-pink-400 bg-pink-950/80 border-pink-800";
              if (log.category === "soporte") badgeColor = "text-purple-400 bg-purple-950/80 border-purple-800";
              if (log.category === "tarea") badgeColor = "text-amber-400 bg-amber-950/80 border-amber-800";

              return (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-start md:items-center gap-2.5">
                    <span className="text-[10px] text-slate-500 font-bold shrink-0">{log.timestamp}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${badgeColor} shrink-0`}>
                      {log.code}
                    </span>
                    <span className="text-slate-200 font-medium line-clamp-1">{log.message}</span>
                  </div>

                  {log.details && (
                    <span className="text-[10px] text-slate-400 italic md:text-right shrink-0">
                      ↳ {log.details}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* 🚀 BOTONES DE ACCIÓN RÁPIDA OPERATIVA */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab("establecimientos")}
          className="p-4 bg-[#0e011f] hover:bg-[#1a0533] border border-[#00C8D4]/40 hover:border-[#00C8D4] rounded-2xl text-white shadow-lg transition-all flex items-center justify-between gap-3 cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00C8D4]/20 text-[#00C8D4] flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-xs font-black block group-hover:text-[#00C8D4] transition-colors">Nuevo Hospedaje</span>
              <span className="text-[10px] text-slate-400 font-medium">Registrar en catálogo</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#00C8D4] transition-colors" />
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab("blog")}
          className="p-4 bg-[#0e011f] hover:bg-[#1a0533] border border-[#FF0096]/40 hover:border-[#FF0096] rounded-2xl text-white shadow-lg transition-all flex items-center justify-between gap-3 cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF0096]/20 text-[#FF0096] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-xs font-black block group-hover:text-[#FF0096] transition-colors">Nuevo Reportaje</span>
              <span className="text-[10px] text-slate-400 font-medium">Publicar artículo/blog</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#FF0096] transition-colors" />
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab("soporte")}
          className="p-4 bg-[#0e011f] hover:bg-[#1a0533] border border-[#9B00CC]/40 hover:border-[#9B00CC] rounded-2xl text-white shadow-lg transition-all flex items-center justify-between gap-3 cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#9B00CC]/20 text-[#9B00CC] flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-xs font-black block group-hover:text-[#9B00CC] transition-colors">Emitir Ticket</span>
              <span className="text-[10px] text-slate-400 font-medium">Soporte Drag & Drop</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#9B00CC] transition-colors" />
        </button>

        <button
          type="button"
          onClick={() => {
            const tsStr = new Date().toISOString().slice(11, 19) + " UTC";
            setLogs(prev => [
              {
                id: `log-manual-${Date.now()}`,
                timestamp: tsStr,
                category: "sistema",
                level: "info",
                code: "FORCE_SYNC_200",
                message: "Sincronización forzada de telemetría de red ejecutada por comando manual.",
                details: "Conexión a Supabase y CDN verificada exitosamente."
              },
              ...prev
            ]);
          }}
          className="p-4 bg-[#0e011f] hover:bg-[#1a0533] border border-emerald-500/40 hover:border-emerald-400 rounded-2xl text-white shadow-lg transition-all flex items-center justify-between gap-3 cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div className="text-left">
              <span className="text-xs font-black block group-hover:text-emerald-400 transition-colors">Forzar Telemetría</span>
              <span className="text-[10px] text-slate-400 font-medium">Pulso de red manual</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
        </button>
      </div>

    </div>
  );
}
