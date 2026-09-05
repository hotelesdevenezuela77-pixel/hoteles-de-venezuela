import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type {
  CreatorExpedition,
  CreatorWaypoint,
  CreatorDeal,
  CreatorDeliverable,
  CreatorRouteExpense,
  CreatorEditorialTask,
  CreatorEstablishmentAudit,
  CreatorKpiSummary,
  TaskStatus
} from "../types/creatorInfluencer";

const DEFAULT_EXCHANGE_RATE = 36.5;

// Datos de demostración interactivos para Creadores & Influencers de Viajes
const INITIAL_EXPEDITIONS: CreatorExpedition[] = [
  {
    id: "exp-201",
    establishment_id: 1,
    title: "Expedición Gran Sabana 4x4 & Roraima Off-Road",
    destination: "Parque Nacional Canaima / Gran Sabana",
    km_distance: 1420,
    start_date: new Date(Date.now() - 10 * 24 * 3600000).toISOString().split("T")[0],
    end_date: new Date(Date.now() - 2 * 24 * 3600000).toISOString().split("T")[0],
    total_budget_usd: 850,
    status: "completed"
  },
  {
    id: "exp-202",
    establishment_id: 1,
    title: "Ruta Playera Morrocoy & Cayo Agua 360°",
    destination: "Tucacas - Chichiriviche",
    km_distance: 680,
    start_date: new Date(Date.now() + 5 * 24 * 3600000).toISOString().split("T")[0],
    end_date: new Date(Date.now() + 8 * 24 * 3600000).toISOString().split("T")[0],
    total_budget_usd: 400,
    status: "active"
  }
];

const INITIAL_WAYPOINTS: CreatorWaypoint[] = [
  {
    id: "wp-1",
    expedition_id: "exp-201",
    latitude: 5.48512,
    longitude: -61.2145,
    altitude_meters: 1250,
    point_type: "mirador",
    title: "Mirador del Tepuy Kama-Merú",
    description: "Excelente punto fotográfico al amanecer con vista frontal a la caída de agua."
  },
  {
    id: "wp-2",
    expedition_id: "exp-201",
    latitude: 4.88124,
    longitude: -61.1203,
    altitude_meters: 980,
    point_type: "gasolinera",
    title: "Estación de Servicio Santa Elena de Uairén",
    description: "Suministro operativo de Gasolina 95 octanos sin colas prolongadas."
  },
  {
    id: "wp-3",
    expedition_id: "exp-201",
    latitude: 5.12098,
    longitude: -60.7511,
    altitude_meters: 1100,
    point_type: "sendero_offroad",
    title: "Paso del Río Tek (Cruce 4x4)",
    description: "Vado de río profundo. Se requiere doble tracción activada."
  }
];

const INITIAL_DEALS: CreatorDeal[] = [
  {
    id: "deal-301",
    establishment_id: 1,
    brand_name: "Posada VIP Gran Sabana Lodge",
    deal_type: "mixto",
    monetary_usd: 600,
    barter_value_usd: 450,
    status: "por_cobrar",
    notes: "Canje 3N en suite ejecutiva + $600 por Reel colaborativo y mención HDV."
  },
  {
    id: "deal-302",
    establishment_id: 1,
    brand_name: "Marcas de Equipaje & Cauchos Off-Road 4x4",
    deal_type: "monetario",
    monetary_usd: 800,
    barter_value_usd: 0,
    status: "en_produccion",
    notes: "Patrocinio de combustible y prueba de cauchos en ruta Roraima."
  }
];

const INITIAL_DELIVERABLES: CreatorDeliverable[] = [
  {
    id: "del-1",
    deal_id: "deal-301",
    title: "Reel Colaborativo 'Secretos de la Gran Sabana'",
    platform: "instagram_reel",
    due_date: new Date(Date.now() + 2 * 24 * 3600000).toISOString().split("T")[0],
    status: "pending"
  },
  {
    id: "del-2",
    deal_id: "deal-301",
    title: "Reseña Oficial con Auditoría Wi-Fi en Hoteles de Venezuela",
    platform: "hdv_review",
    due_date: new Date(Date.now() + 4 * 24 * 3600000).toISOString().split("T")[0],
    status: "pending"
  }
];

const INITIAL_EXPENSES: CreatorRouteExpense[] = [
  {
    id: "exp-g1",
    establishment_id: 1,
    expedition_id: "exp-201",
    description: "Combustible 120L diésel y bidones para ruta",
    category: "combustible",
    amount_usd: 75,
    amount_bs: 75 * DEFAULT_EXCHANGE_RATE,
    logged_by: "Piloto 4x4"
  },
  {
    id: "exp-g2",
    establishment_id: 1,
    expedition_id: "exp-201",
    description: "Pago de Guía Pemón para cruce de ríos",
    category: "lancheros",
    amount_usd: 50,
    amount_bs: 50 * DEFAULT_EXCHANGE_RATE,
    logged_by: "Creador"
  },
  {
    id: "exp-g3",
    establishment_id: 1,
    expedition_id: "exp-201",
    description: "Víveres de carretera, hielo y agua mineral para 5 días",
    category: "comidas",
    amount_usd: 90,
    amount_bs: 90 * DEFAULT_EXCHANGE_RATE,
    logged_by: "Productor"
  }
];

const INITIAL_TASKS: CreatorEditorialTask[] = [
  {
    id: "tsk-1",
    establishment_id: 1,
    task_name: "Selección de tomas aéreas con Drone (Roraima)",
    platform: "instagram_reel",
    due_date: new Date(Date.now() + 1 * 24 * 3600000).toISOString().split("T")[0],
    status: "editing",
    position_order: 1
  },
  {
    id: "tsk-2",
    establishment_id: 1,
    task_name: "Edición de audio y diseño sonoro del Reel Gran Sabana",
    platform: "tiktok",
    due_date: new Date(Date.now() + 3 * 24 * 3600000).toISOString().split("T")[0],
    status: "todo",
    position_order: 2
  },
  {
    id: "tsk-3",
    establishment_id: 1,
    task_name: "Revisión final de color con la Posada Patrocinadora",
    platform: "hdv_review",
    due_date: new Date(Date.now() + 5 * 24 * 3600000).toISOString().split("T")[0],
    status: "review",
    position_order: 3
  }
];

const INITIAL_AUDITS: CreatorEstablishmentAudit[] = [
  {
    id: "aud-1",
    establishment_id: 1,
    visited_establishment_name: "Posada VIP Gran Sabana Lodge",
    wifi_speed_mbps: 45.8,
    water_pressure_status: "excelente",
    power_generator_status: "si_automatica",
    water_well_status: "si_pozo_propio",
    overall_score: 9.5,
    notes: "Planta eléctrica insonorizada 100% activa durante corte en el sector. Conexión de fibra ideal para edición y subida de archivos 4K."
  }
];

export function useCreatorInfluencerRealtime(establishmentId: number = 1) {
  const [expeditions, setExpeditions] = useState<CreatorExpedition[]>(INITIAL_EXPEDITIONS);
  const [waypoints, setWaypoints] = useState<CreatorWaypoint[]>(INITIAL_WAYPOINTS);
  const [deals, setDeals] = useState<CreatorDeal[]>(INITIAL_DEALS);
  const [deliverables, setDeliverables] = useState<CreatorDeliverable[]>(INITIAL_DELIVERABLES);
  const [routeExpenses, setRouteExpenses] = useState<CreatorRouteExpense[]>(INITIAL_EXPENSES);
  const [tasks, setTasks] = useState<CreatorEditorialTask[]>(INITIAL_TASKS);
  const [audits, setAudits] = useState<CreatorEstablishmentAudit[]>(INITIAL_AUDITS);
  const [loading, setLoading] = useState(true);

  // Carga desde Supabase con fallback local
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const { data: expData } = await supabase
        .from("creator_expeditions")
        .select("*")
        .eq("establishment_id", establishmentId);

      if (expData && expData.length > 0) setExpeditions(expData);

      const { data: wpData } = await supabase
        .from("creator_waypoints")
        .select("*");

      if (wpData && wpData.length > 0) setWaypoints(wpData);

      const { data: dealData } = await supabase
        .from("creator_deals")
        .select("*")
        .eq("establishment_id", establishmentId);

      if (dealData && dealData.length > 0) setDeals(dealData);

      const { data: expensData } = await supabase
        .from("creator_route_expenses")
        .select("*")
        .eq("establishment_id", establishmentId);

      if (expensData && expensData.length > 0) setRouteExpenses(expensData);

      const { data: tskData } = await supabase
        .from("creator_editorial_tasks")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("position_order", { ascending: true });

      if (tskData && tskData.length > 0) setTasks(tskData);

    } catch (err) {
      console.warn("[CreatorRealtime] Fallback interactivo local activo:", err);
    } finally {
      setLoading(false);
    }
  }, [establishmentId]);

  useEffect(() => {
    loadData();

    const channel = supabase.channel(`creator_realtime_${establishmentId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'creator_deals', filter: `establishment_id=eq.${establishmentId}` }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'creator_editorial_tasks', filter: `establishment_id=eq.${establishmentId}` }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [establishmentId, loadData]);

  // Cómputo consolidado de KPIs
  const kpis: CreatorKpiSummary = (() => {
    const expeditionIncomeUsd = deals.reduce((acc, d) => acc + (d.monetary_usd || 0), 0);
    const expeditionIncomeBs = expeditionIncomeUsd * DEFAULT_EXCHANGE_RATE;

    const expeditionExpensesUsd = routeExpenses.reduce((acc, e) => acc + (e.amount_usd || 0), 0);
    const expeditionExpensesBs = expeditionExpensesUsd * DEFAULT_EXCHANGE_RATE;

    const netExpeditionMarginUsd = expeditionIncomeUsd - expeditionExpensesUsd;
    const netExpeditionMarginBs = netExpeditionMarginUsd * DEFAULT_EXCHANGE_RATE;

    const totalKmTraveled = expeditions.reduce((acc, exp) => acc + (exp.km_distance || 0), 0);
    const totalWaypointsCount = waypoints.length;

    const activeDealsCount = deals.filter(d => d.status === "en_produccion" || d.status === "pautado").length;
    const pendingCollectUsd = deals.filter(d => d.status === "por_cobrar").reduce((acc, d) => acc + (d.monetary_usd || 0), 0);

    const pendingDeliverablesCount = deliverables.filter(del => del.status === "pending").length;
    const urgentDeliverablesCount = deliverables.filter(del => {
      const due = new Date(del.due_date).getTime();
      return del.status === "pending" && due <= Date.now() + 72 * 3600000;
    }).length;

    return {
      expeditionIncomeUsd,
      expeditionIncomeBs,
      expeditionExpensesUsd,
      expeditionExpensesBs,
      netExpeditionMarginUsd,
      netExpeditionMarginBs,
      totalKmTraveled,
      totalWaypointsCount,
      activeDealsCount,
      pendingCollectUsd,
      pendingDeliverablesCount,
      urgentDeliverablesCount
    };
  })();

  // Acciones CRUD
  const importWaypoints = (newPoints: Partial<CreatorWaypoint>[]) => {
    const created: CreatorWaypoint[] = newPoints.map((pt, idx) => ({
      id: `wp-${Date.now()}-${idx}`,
      expedition_id: pt.expedition_id || expeditions[0]?.id || "exp-201",
      latitude: pt.latitude || 5.123,
      longitude: pt.longitude || -61.456,
      altitude_meters: pt.altitude_meters || 900,
      point_type: pt.point_type || "spot_fotografico",
      title: pt.title || `Waypoint #${waypoints.length + idx + 1}`,
      description: pt.description || "Punto de interés georreferenciado.",
      created_at: new Date().toISOString()
    }));

    setWaypoints(prev => [...prev, ...created]);
  };

  const createDeal = async (dealData: Partial<CreatorDeal>): Promise<CreatorDeal> => {
    const newDeal: CreatorDeal = {
      id: `deal-${Date.now()}`,
      establishment_id: establishmentId,
      brand_name: dealData.brand_name || "Marca Patrocinadora",
      deal_type: dealData.deal_type || "canje",
      monetary_usd: dealData.monetary_usd || 0,
      barter_value_usd: dealData.barter_value_usd || 0,
      status: "en_produccion",
      notes: dealData.notes || "Acuerdo comercial de expedición.",
      created_at: new Date().toISOString()
    };

    setDeals(prev => [newDeal, ...prev]);
    return newDeal;
  };

  const addRouteExpense = (expData: Partial<CreatorRouteExpense>) => {
    const newExp: CreatorRouteExpense = {
      id: `exp-${Date.now()}`,
      establishment_id: establishmentId,
      expedition_id: expData.expedition_id || expeditions[0]?.id,
      description: expData.description || "Gasto de carretera",
      category: expData.category || "otros",
      amount_usd: expData.amount_usd || 0,
      amount_bs: (expData.amount_usd || 0) * DEFAULT_EXCHANGE_RATE,
      logged_by: expData.logged_by || "Creador",
      created_at: new Date().toISOString()
    };

    setRouteExpenses(prev => [newExp, ...prev]);
  };

  const addEditorialTask = (taskData: Partial<CreatorEditorialTask>) => {
    const newTask: CreatorEditorialTask = {
      id: `tsk-${Date.now()}`,
      establishment_id: establishmentId,
      task_name: taskData.task_name || "Tarea Editorial",
      platform: taskData.platform || "instagram_reel",
      due_date: taskData.due_date || new Date(Date.now() + 3 * 24 * 3600000).toISOString().split("T")[0],
      status: "todo",
      position_order: tasks.length + 1,
      created_at: new Date().toISOString()
    };

    setTasks(prev => [...prev, newTask]);
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };

  const addAudit = (auditData: Partial<CreatorEstablishmentAudit>) => {
    const newAudit: CreatorEstablishmentAudit = {
      id: `aud-${Date.now()}`,
      establishment_id: establishmentId,
      visited_establishment_name: auditData.visited_establishment_name || "Posada Visitada",
      wifi_speed_mbps: auditData.wifi_speed_mbps || 30,
      water_pressure_status: auditData.water_pressure_status || "excelente",
      power_generator_status: auditData.power_generator_status || "si_automatica",
      water_well_status: auditData.water_well_status || "si_pozo_propio",
      overall_score: auditData.overall_score || 9.0,
      notes: auditData.notes || "Auditoría completada por el creador.",
      created_at: new Date().toISOString()
    };

    setAudits(prev => [newAudit, ...prev]);
  };

  return {
    expeditions,
    waypoints,
    deals,
    deliverables,
    routeExpenses,
    tasks,
    audits,
    kpis,
    loading,
    importWaypoints,
    createDeal,
    addRouteExpense,
    addEditorialTask,
    updateTaskStatus,
    addAudit,
    refresh: loadData
  };
}
