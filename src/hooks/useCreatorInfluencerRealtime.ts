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
  TaskStatus,
  ExpeditionPaymentStatus,
  ExpeditionPaymentMethod,
  ViaticosBreakdown,
  InfluencerTravelAuthorization,
  CreatorVisitedEstablishment,
  CreatorQuote,
  CreatorQuoteItem,
  CreatorMembershipProfile,
  CreatorProfileInfo,
  CreatorGalleryAlbum,
  CreatorGalleryItem,
  QuoteStatus
} from "../types/creatorInfluencer";
import { getBcvExchangeRate } from "./useBcvExchangeRate";

const DEFAULT_EXCHANGE_RATE = getBcvExchangeRate();

// Estados iniciales en cero para cada nuevo influencer (100% real e independiente por creador)
const INITIAL_EXPEDITIONS: CreatorExpedition[] = [];
const INITIAL_WAYPOINTS: CreatorWaypoint[] = [];
const INITIAL_DEALS: CreatorDeal[] = [];
const INITIAL_DELIVERABLES: CreatorDeliverable[] = [];
const INITIAL_EXPENSES: CreatorRouteExpense[] = [];
const INITIAL_TASKS: CreatorEditorialTask[] = [];
const INITIAL_AUDITS: CreatorEstablishmentAudit[] = [];

const LOCAL_AUTH_KEY = "hdv_influencer_travel_authorizations_v2";

const INITIAL_AUTHORIZATIONS: InfluencerTravelAuthorization[] = [];
const INITIAL_VISITED_ESTABLISHMENTS: CreatorVisitedEstablishment[] = [];
const INITIAL_QUOTES: CreatorQuote[] = [];

const INITIAL_MEMBERSHIP: CreatorMembershipProfile = {
  tier_name: "Black Creator Pass - Oficial HDV",
  tier_badge: "CREADOR(A) OFICIAL VERIFICADO(A)",
  status: "active",
  member_since: new Date().toISOString().split("T")[0],
  valid_thru: "2027-12-31",
  qr_code_token: "HDV-PRESS-OFICIAL-2027",
  press_card_number: "HDV-PRESS-2026-0001",
  benefits: [
    "Honorarios garantizados de $20.00 USD por cada expedición aprobada",
    "Tarifas 0% comisión de alojamiento en posadas afiliadas en misiones oficiales",
    "Pase de Prensa Turístico digital con QR verificable ante autoridades y parques",
    "Acceso al Trazador Satelital Andrómeda-X y telemetría de rutas GPS",
    "Soporte de grúa y asistencia vial 24/7 en autopistas nacionales",
    "Perfil público verificado en el Directorio Nacional de Creadores HDV"
  ]
};

const INITIAL_PROFILE_INFO: CreatorProfileInfo = {
  name: "Creador(a) Oficial HDV",
  headline: "Creador(a) de contenido audiovisual, expediciones & auditoría turística HDV",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  banner_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  bio: "Documentando los destinos, posadas, hoteles y experiencias turísticas de Venezuela con cobertura oficial para Hoteles de Venezuela.",
  instagram: "",
  tiktok: "",
  youtube: "",
  phone: "",
  gear_equipment: "",
  location: "Venezuela"
};

const INITIAL_GALLERY_ALBUMS: CreatorGalleryAlbum[] = [];

export function useCreatorInfluencerRealtime(establishmentId: number = 1) {
  const localExpKey = `hdv_creator_expeditions_v2_${establishmentId}`;
  const localVisitedKey = `hdv_creator_visited_est_v2_${establishmentId}`;
  const localQuotesKey = `hdv_creator_quotes_v2_${establishmentId}`;
  const localMembershipKey = `hdv_creator_membership_v2_${establishmentId}`;
  const localProfileKey = `hdv_creator_profile_${establishmentId}`;
  const localGalleryKey = `hdv_creator_gallery_v2_${establishmentId}`;
  const localWaypointsKey = `hdv_creator_waypoints_v2_${establishmentId}`;
  const localDealsKey = `hdv_creator_deals_v2_${establishmentId}`;
  const localDeliverablesKey = `hdv_creator_deliverables_v2_${establishmentId}`;
  const localExpensesKey = `hdv_creator_expenses_v2_${establishmentId}`;
  const localTasksKey = `hdv_creator_editorial_tasks_v2_${establishmentId}`;
  const localAuditsKey = `hdv_creator_audits_v2_${establishmentId}`;

  const [profileInfo, setProfileInfo] = useState<CreatorProfileInfo>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved =
          localStorage.getItem(localProfileKey) ||
          localStorage.getItem(`hdv_creator_profile_info_${establishmentId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.name) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_PROFILE_INFO;
  });

  const [galleryAlbums, setGalleryAlbums] = useState<CreatorGalleryAlbum[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(localGalleryKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_GALLERY_ALBUMS;
  });

  const [bcvRate, setBcvRate] = useState<number>(getBcvExchangeRate);

  useEffect(() => {
    const handleRateChange = (e: any) => {
      if (e.detail && typeof e.detail.rate === "number") {
        setBcvRate(e.detail.rate);
      }
    };
    window.addEventListener("hdv_bcv_rate_changed", handleRateChange);
    return () => window.removeEventListener("hdv_bcv_rate_changed", handleRateChange);
  }, []);

  const [expeditions, setExpeditions] = useState<CreatorExpedition[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(localExpKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_EXPEDITIONS;
  });

  const [travelAuthorizations, setTravelAuthorizations] = useState<InfluencerTravelAuthorization[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(LOCAL_AUTH_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_AUTHORIZATIONS;
  });

  const [visitedEstablishments, setVisitedEstablishments] = useState<CreatorVisitedEstablishment[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(localVisitedKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_VISITED_ESTABLISHMENTS;
  });

  const [quotes, setQuotes] = useState<CreatorQuote[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(localQuotesKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_QUOTES;
  });

  const [membership, setMembership] = useState<CreatorMembershipProfile>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(localMembershipKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.tier_name) return parsed;
        }
      } catch (e) {}
    }
    return {
      ...INITIAL_MEMBERSHIP,
      qr_code_token: `HDV-PRESS-${establishmentId}-2027`,
      press_card_number: `HDV-PRESS-2026-${establishmentId}`
    };
  });

  const [waypoints, setWaypoints] = useState<CreatorWaypoint[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(localWaypointsKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_WAYPOINTS;
  });

  const [deals, setDeals] = useState<CreatorDeal[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(localDealsKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_DEALS;
  });

  const [deliverables, setDeliverables] = useState<CreatorDeliverable[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(localDeliverablesKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_DELIVERABLES;
  });

  const [routeExpenses, setRouteExpenses] = useState<CreatorRouteExpense[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(localExpensesKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_EXPENSES;
  });

  const [tasks, setTasks] = useState<CreatorEditorialTask[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(localTasksKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_TASKS;
  });

  const [audits, setAudits] = useState<CreatorEstablishmentAudit[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(localAuditsKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_AUDITS;
  });

  const [loading, setLoading] = useState(true);

  // Guardar en localStorage cuando cambien las expediciones
  const saveExpeditionsLocally = (newExpeditions: CreatorExpedition[]) => {
    setExpeditions(newExpeditions);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(localExpKey, JSON.stringify(newExpeditions));
        window.dispatchEvent(new CustomEvent("hdv_expeditions_changed", { detail: { establishmentId } }));
      } catch (e) {}
    }
  };

  // Guardar en localStorage establecimientos visitados
  const saveVisitedEstablishmentsLocally = (newList: CreatorVisitedEstablishment[]) => {
    setVisitedEstablishments(newList);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(localVisitedKey, JSON.stringify(newList));
        window.dispatchEvent(new CustomEvent("hdv_visited_est_changed", { detail: newList }));
      } catch (e) {}
    }
  };

  // Guardar en localStorage cotizaciones
  const saveQuotesLocally = (newQuotes: CreatorQuote[]) => {
    setQuotes(newQuotes);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(localQuotesKey, JSON.stringify(newQuotes));
        window.dispatchEvent(new CustomEvent("hdv_quotes_changed", { detail: newQuotes }));
      } catch (e) {}
    }
  };

  // Guardar en localStorage membresía
  const saveMembershipLocally = (newMem: CreatorMembershipProfile) => {
    setMembership(newMem);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(localMembershipKey, JSON.stringify(newMem));
      } catch (e) {}
    }
  };

  // Guardar en localStorage cuando cambien las autorizaciones de viaje del admin
  const saveAuthorizationsLocally = (newAuths: InfluencerTravelAuthorization[]) => {
    setTravelAuthorizations(newAuths);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newAuths));
        window.dispatchEvent(new CustomEvent("hdv_authorizations_changed", { detail: newAuths }));
      } catch (e) {}
    }
  };

  // Escuchar cambios entre pestañas y componentes
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === localExpKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setExpeditions(parsed);
        } catch (err) {}
      }
      if (e.key === LOCAL_AUTH_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setTravelAuthorizations(parsed);
        } catch (err) {}
      }
      if (e.key === localVisitedKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setVisitedEstablishments(parsed);
        } catch (err) {}
      }
      if (e.key === localQuotesKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setQuotes(parsed);
        } catch (err) {}
      }
    };

    const handleCustomAuth = () => {
      try {
        const saved = localStorage.getItem(LOCAL_AUTH_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setTravelAuthorizations(parsed);
        }
      } catch (err) {}
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("hdv_authorizations_changed", handleCustomAuth);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("hdv_authorizations_changed", handleCustomAuth);
    };
  }, [localExpKey, localVisitedKey, localQuotesKey]);

  // Carga desde Supabase con fallback local
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const { data: expData } = await supabase
        .from("creator_expeditions")
        .select("*")
        .eq("establishment_id", establishmentId);

      if (expData && expData.length > 0) {
        setExpeditions(expData);
        if (typeof window !== "undefined") {
          localStorage.setItem(localExpKey, JSON.stringify(expData));
        }
      }

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
  }, [establishmentId, localExpKey]);

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

  // Cómputo consolidado de KPIs incluyendo Honorarios ($20/viaje) y Viáticos
  const kpis: CreatorKpiSummary = (() => {
    const expeditionIncomeUsd = deals.reduce((acc, d) => acc + (d.monetary_usd || 0), 0);
    const expeditionIncomeBs = expeditionIncomeUsd * bcvRate;

    const expeditionExpensesUsd = routeExpenses.reduce((acc, e) => acc + (e.amount_usd || 0), 0);
    const expeditionExpensesBs = expeditionExpensesUsd * bcvRate;

    const netExpeditionMarginUsd = expeditionIncomeUsd - expeditionExpensesUsd;
    const netExpeditionMarginBs = netExpeditionMarginUsd * bcvRate;

    const totalKmTraveled = expeditions.reduce((acc, exp) => acc + (exp.km_distance || 0), 0);
    const totalWaypointsCount = waypoints.length;

    const activeDealsCount = deals.filter(d => d.status === "en_produccion" || d.status === "pautado").length;
    const pendingCollectUsd = deals.filter(d => d.status === "por_cobrar").reduce((acc, d) => acc + (d.monetary_usd || 0), 0);

    const pendingDeliverablesCount = deliverables.filter(del => del.status === "pending").length;
    const urgentDeliverablesCount = deliverables.filter(del => {
      const due = new Date(del.due_date).getTime();
      return del.status === "pending" && due <= Date.now() + 72 * 3600000;
    }).length;

    // Métricas de Remuneración de Viajes ($20 Honorarios + Viáticos)
    const totalTripsCount = expeditions.length;
    const totalBaseFeesUsd = expeditions.reduce((acc, exp) => acc + (exp.base_fee_usd || 20.00), 0);
    const totalBaseFeesBs = totalBaseFeesUsd * bcvRate;
    const totalViaticosUsd = expeditions.reduce((acc, exp) => acc + (exp.viaticos_usd || 0), 0);
    const totalViaticosBs = totalViaticosUsd * bcvRate;
    const totalRemunerationUsd = expeditions.reduce((acc, exp) => acc + (exp.total_remuneration_usd || ((exp.base_fee_usd || 20.00) + (exp.viaticos_usd || 0))), 0);
    const totalRemunerationBs = totalRemunerationUsd * bcvRate;

    const liquidatedRemunerationUsd = expeditions
      .filter(exp => exp.payment_status === "liquidado")
      .reduce((acc, exp) => acc + (exp.total_remuneration_usd || ((exp.base_fee_usd || 20.00) + (exp.viaticos_usd || 0))), 0);

    const pendingRemunerationUsd = expeditions
      .filter(exp => exp.payment_status !== "liquidado")
      .reduce((acc, exp) => acc + (exp.total_remuneration_usd || ((exp.base_fee_usd || 20.00) + (exp.viaticos_usd || 0))), 0);

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
      urgentDeliverablesCount,
      totalTripsCount,
      totalBaseFeesUsd,
      totalBaseFeesBs,
      totalViaticosUsd,
      totalViaticosBs,
      totalRemunerationUsd,
      totalRemunerationBs,
      liquidatedRemunerationUsd,
      pendingRemunerationUsd
    };
  })();

  // Acciones CRUD de Expedición / Viajes Remunerados
  const addExpedition = (data: Partial<CreatorExpedition>) => {
    const baseFee = data.base_fee_usd !== undefined ? Number(data.base_fee_usd) : 20.00;
    const breakdown = data.viaticos_breakdown || {};
    const viaticosTotal = (Number(breakdown.combustible) || 0) +
                          (Number(breakdown.comidas) || 0) +
                          (Number(breakdown.hospedaje) || 0) +
                          (Number(breakdown.peajes) || 0) +
                          (Number(breakdown.guias_lancheros) || 0) +
                          (Number(breakdown.otros) || 0);

    const totalViaticos = data.viaticos_usd !== undefined ? Number(data.viaticos_usd) : viaticosTotal;
    const totalRemun = baseFee + totalViaticos;

    const newExp: CreatorExpedition = {
      id: `exp-${Date.now()}`,
      establishment_id: establishmentId,
      title: data.title || "Nueva Expedición Remunerada",
      destination: data.destination || "Venezuela",
      km_distance: Number(data.km_distance) || 350,
      start_date: data.start_date || new Date().toISOString().split("T")[0],
      end_date: data.end_date || new Date(Date.now() + 3 * 24 * 3600000).toISOString().split("T")[0],
      total_budget_usd: totalRemun,
      status: data.status || "active",
      base_fee_usd: baseFee,
      viaticos_usd: totalViaticos,
      viaticos_breakdown: breakdown,
      total_remuneration_usd: totalRemun,
      payment_status: data.payment_status || "pendiente",
      payment_method: data.payment_method,
      payment_reference: data.payment_reference,
      payment_date: data.payment_date,
      notes: data.notes || `Honorarios $${baseFee.toFixed(2)} + Viáticos $${totalViaticos.toFixed(2)}`,
      created_at: new Date().toISOString()
    };

    saveExpeditionsLocally([newExp, ...expeditions]);
    return newExp;
  };

  const updateExpedition = (expId: string, updates: Partial<CreatorExpedition>) => {
    const updated = expeditions.map(exp => {
      if (exp.id === expId) {
        const merged = { ...exp, ...updates };
        const baseFee = merged.base_fee_usd !== undefined ? Number(merged.base_fee_usd) : 20.00;
        const viaticos = merged.viaticos_usd !== undefined ? Number(merged.viaticos_usd) : 0;
        merged.total_remuneration_usd = baseFee + viaticos;
        return merged;
      }
      return exp;
    });
    saveExpeditionsLocally(updated);
  };

  const updateExpeditionPayment = (
    expId: string,
    status: ExpeditionPaymentStatus,
    method?: ExpeditionPaymentMethod,
    reference?: string,
    date?: string
  ) => {
    const updated = expeditions.map(exp => {
      if (exp.id === expId) {
        return {
          ...exp,
          payment_status: status,
          payment_method: method || exp.payment_method,
          payment_reference: reference !== undefined ? reference : exp.payment_reference,
          payment_date: date || (status === "liquidado" ? new Date().toISOString().split("T")[0] : exp.payment_date)
        };
      }
      return exp;
    });
    saveExpeditionsLocally(updated);
  };

  const deleteExpedition = (expId: string) => {
    const filtered = expeditions.filter(exp => exp.id !== expId);
    saveExpeditionsLocally(filtered);
  };

  // Acciones de Gestión de Autorizaciones de Viaje (Admin HDV)
  const addTravelAuthorization = (authData: Partial<InfluencerTravelAuthorization>) => {
    const fee = authData.fee_per_trip_usd !== undefined ? Number(authData.fee_per_trip_usd) : 20.00;
    const tripsCount = Number(authData.authorized_trips_count) || 1;
    const totalHon = fee * tripsCount;
    const breakdown = authData.viaticos_budget_breakdown || {};
    const viatSum = (Number(breakdown.combustible) || 0) +
                    (Number(breakdown.comidas) || 0) +
                    (Number(breakdown.hospedaje) || 0) +
                    (Number(breakdown.peajes) || 0) +
                    (Number(breakdown.guias_lancheros) || 0) +
                    (Number(breakdown.otros) || 0);
    const approvedViat = authData.approved_viaticos_budget_usd !== undefined ? Number(authData.approved_viaticos_budget_usd) : viatSum;

    const newAuth: InfluencerTravelAuthorization = {
      id: `auth-${Date.now()}`,
      influencer_id: authData.influencer_id || 99901,
      influencer_name: authData.influencer_name || "Creador(a) Oficial HDV",
      influencer_handle: authData.influencer_handle || "@creador_hdv",
      influencer_avatar: authData.influencer_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      period_type: authData.period_type || "dias",
      title: authData.title || "Asignación de Viaje Autorizada",
      assigned_month: authData.assigned_month,
      assigned_week: authData.assigned_week,
      start_date: authData.start_date || new Date().toISOString().split("T")[0],
      end_date: authData.end_date || new Date(Date.now() + 4 * 24 * 3600000).toISOString().split("T")[0],
      allowed_days_count: Number(authData.allowed_days_count) || 4,
      destination_target: authData.destination_target || "Venezuela",
      authorized_trips_count: tripsCount,
      fee_per_trip_usd: fee,
      total_honorarios_usd: totalHon,
      approved_viaticos_budget_usd: approvedViat,
      viaticos_budget_breakdown: breakdown,
      status: authData.status || "habilitado",
      enabled_by_admin: authData.enabled_by_admin !== undefined ? authData.enabled_by_admin : true,
      admin_notes: authData.admin_notes || "Habilitado desde el Panel Central de Hoteles de Venezuela.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    saveAuthorizationsLocally([newAuth, ...travelAuthorizations]);
    return newAuth;
  };

  const updateTravelAuthorization = (authId: string, updates: Partial<InfluencerTravelAuthorization>) => {
    const updated = travelAuthorizations.map(item => {
      if (item.id === authId) {
        const merged = { ...item, ...updates, updated_at: new Date().toISOString() };
        if (updates.authorized_trips_count !== undefined || updates.fee_per_trip_usd !== undefined) {
          const fee = merged.fee_per_trip_usd || 20.00;
          const trips = merged.authorized_trips_count || 1;
          merged.total_honorarios_usd = fee * trips;
        }
        return merged;
      }
      return item;
    });
    saveAuthorizationsLocally(updated);
  };

  const toggleAuthorizationStatus = (authId: string, status: AuthorizationStatus) => {
    updateTravelAuthorization(authId, {
      status,
      enabled_by_admin: status === "habilitado" || status === "en_curso"
    });
  };

  const deleteTravelAuthorization = (authId: string) => {
    const filtered = travelAuthorizations.filter(item => item.id !== authId);
    saveAuthorizationsLocally(filtered);
  };

  // Acciones CRUD de Establecimientos Turísticos Visitados
  const addVisitedEstablishment = (data: Partial<CreatorVisitedEstablishment>) => {
    const newEst: CreatorVisitedEstablishment = {
      id: `est-vis-${Date.now()}`,
      establishment_id: establishmentId,
      name: data.name || "Nuevo Establecimiento Turístico",
      destination: data.destination || "Venezuela",
      category: data.category || "hoteles_posadas",
      category_label: data.category_label || "Hoteles & Posadas",
      visit_date: data.visit_date || new Date().toISOString().split("T")[0],
      status: data.status || "auditado",
      rating: Number(data.rating) || 9.0,
      is_recommended: data.is_recommended !== undefined ? data.is_recommended : true,
      wifi_speed_mbps: Number(data.wifi_speed_mbps) || 30.0,
      power_generator: data.power_generator || "si_automatica",
      water_supply: data.water_supply || "si_pozo_propio",
      water_pressure: data.water_pressure || "excelente",
      coverage_types: data.coverage_types || ["instagram_reel", "hdv_review"],
      social_link: data.social_link,
      hdv_slug: data.hdv_slug,
      deal_type: data.deal_type || "canje",
      deal_value_usd: Number(data.deal_value_usd) || 200,
      photos: data.photos || ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80"],
      notes: data.notes || "Auditoría en sitio completada por el creador.",
      created_at: new Date().toISOString()
    };

    saveVisitedEstablishmentsLocally([newEst, ...visitedEstablishments]);
    return newEst;
  };

  const updateVisitedEstablishment = (id: string, updates: Partial<CreatorVisitedEstablishment>) => {
    const updated = visitedEstablishments.map(item => item.id === id ? { ...item, ...updates } : item);
    saveVisitedEstablishmentsLocally(updated);
  };

  const deleteVisitedEstablishment = (id: string) => {
    const filtered = visitedEstablishments.filter(item => item.id !== id);
    saveVisitedEstablishmentsLocally(filtered);
  };

  // Acciones CRUD de Cotizaciones y Propuestas Comerciales
  const addQuote = (quoteData: Partial<CreatorQuote>) => {
    const items = quoteData.items || [];
    const subtotal = items.reduce((acc, it) => acc + (Number(it.total_usd) || (Number(it.unit_price_usd) * Number(it.quantity))), 0);
    const discount = Number(quoteData.discount_usd) || 0;
    const total = Math.max(0, subtotal - discount);

    const newQuote: CreatorQuote = {
      id: `quote-${Date.now()}`,
      establishment_id: establishmentId,
      quote_number: quoteData.quote_number || `COT-2026-${String(quotes.length + 1).padStart(3, "0")}`,
      client_name: quoteData.client_name || "Cliente / Posada",
      client_contact: quoteData.client_contact || "",
      destination_target: quoteData.destination_target || "Venezuela",
      created_date: quoteData.created_date || new Date().toISOString().split("T")[0],
      valid_until_date: quoteData.valid_until_date || new Date(Date.now() + 30 * 24 * 3600000).toISOString().split("T")[0],
      items,
      subtotal_usd: subtotal,
      discount_usd: discount,
      total_usd: total,
      total_bs: total * bcvRate,
      status: quoteData.status || "borrador",
      notes: quoteData.notes || "",
      converted_to_deal: false,
      created_at: new Date().toISOString()
    };

    saveQuotesLocally([newQuote, ...quotes]);
    return newQuote;
  };

  const updateQuote = (quoteId: string, updates: Partial<CreatorQuote>) => {
    const updated = quotes.map(q => {
      if (q.id === quoteId) {
        const merged = { ...q, ...updates };
        if (updates.items || updates.discount_usd !== undefined) {
          const subtotal = merged.items.reduce((acc, it) => acc + (Number(it.total_usd) || (Number(it.unit_price_usd) * Number(it.quantity))), 0);
          const discount = Number(merged.discount_usd) || 0;
          const total = Math.max(0, subtotal - discount);
          merged.subtotal_usd = subtotal;
          merged.total_usd = total;
          merged.total_bs = total * bcvRate;
        }
        return merged;
      }
      return q;
    });
    saveQuotesLocally(updated);
  };

  const deleteQuote = (quoteId: string) => {
    const filtered = quotes.filter(q => q.id !== quoteId);
    saveQuotesLocally(filtered);
  };

  const convertQuoteToDeal = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;

    // 1. Marcar cotización como aprobada y convertida
    updateQuote(quoteId, {
      status: "aprobada",
      converted_to_deal: true
    });

    // 2. Crear acuerdo comercial automáticamente
    const newDeal: CreatorDeal = {
      id: `deal-${Date.now()}`,
      establishment_id: establishmentId,
      brand_name: quote.client_name,
      deal_type: "monetario",
      monetary_usd: quote.total_usd,
      barter_value_usd: 0,
      status: "en_produccion",
      notes: `Generado desde Cotización ${quote.quote_number}. Destino: ${quote.destination_target || 'Venezuela'}`,
      created_at: new Date().toISOString()
    };
    setDeals(prev => {
      const next = [newDeal, ...prev];
      try { localStorage.setItem(localDealsKey, JSON.stringify(next)); } catch {}
      return next;
    });

    // 3. Crear entregables y tareas editoriales por cada ítem
    quote.items.forEach((item, idx) => {
      const task: CreatorEditorialTask = {
        id: `tsk-q-${Date.now()}-${idx}`,
        establishment_id: establishmentId,
        task_name: `${item.service_name} (${quote.client_name})`,
        platform: item.service_name.toLowerCase().includes("youtube") ? "youtube_video" : "instagram_reel",
        due_date: new Date(Date.now() + (idx + 1) * 3 * 24 * 3600000).toISOString().split("T")[0],
        status: "todo",
        position_order: tasks.length + idx + 1,
        created_at: new Date().toISOString()
      };
      setTasks(prev => {
        const next = [...prev, task];
        try { localStorage.setItem(localTasksKey, JSON.stringify(next)); } catch {}
        return next;
      });
    });
  };

  // Actualización de Membresía
  const updateMembership = (updates: Partial<CreatorMembershipProfile>) => {
    const merged = { ...membership, ...updates };
    saveMembershipLocally(merged);
  };

  // Acciones CRUD adicionales
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

    setWaypoints(prev => {
      const next = [...prev, ...created];
      try { localStorage.setItem(localWaypointsKey, JSON.stringify(next)); } catch {}
      return next;
    });
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

    setDeals(prev => {
      const next = [newDeal, ...prev];
      try { localStorage.setItem(localDealsKey, JSON.stringify(next)); } catch {}
      return next;
    });
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
      amount_bs: (expData.amount_usd || 0) * bcvRate,
      logged_by: expData.logged_by || "Creador",
      created_at: new Date().toISOString()
    };

    setRouteExpenses(prev => {
      const next = [newExp, ...prev];
      try { localStorage.setItem(localExpensesKey, JSON.stringify(next)); } catch {}
      return next;
    });
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

    setTasks(prev => {
      const next = [...prev, newTask];
      try { localStorage.setItem(localTasksKey, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev => {
      const next = prev.map(t => t.id === taskId ? { ...t, status } : t);
      try { localStorage.setItem(localTasksKey, JSON.stringify(next)); } catch {}
      return next;
    });
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

    setAudits(prev => {
      const next = [newAudit, ...prev];
      try { localStorage.setItem(localAuditsKey, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Gestión de Perfil de Creadora
  const updateProfileInfo = (updates: Partial<CreatorProfileInfo>) => {
    const updated = { ...profileInfo, ...updates };
    setProfileInfo(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(localProfileKey, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent("hdv_creator_profile_changed", { detail: updated }));
      } catch (e) {}
    }
  };

  // Gestión de Galería & Bitácora de Expediciones
  const saveGalleryLocally = (newAlbums: CreatorGalleryAlbum[]) => {
    setGalleryAlbums(newAlbums);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(localGalleryKey, JSON.stringify(newAlbums));
        window.dispatchEvent(new CustomEvent("hdv_creator_gallery_changed", { detail: newAlbums }));
      } catch (e) {}
    }
  };

  const addGalleryAlbum = (albumData: Partial<CreatorGalleryAlbum>): CreatorGalleryAlbum => {
    const newAlbum: CreatorGalleryAlbum = {
      id: `alb-${Date.now()}`,
      establishment_id: establishmentId,
      title: albumData.title || "Nueva Expedición",
      destination: albumData.destination || "Venezuela",
      trip_date: albumData.trip_date || new Date().toISOString().split("T")[0],
      cover_url: albumData.cover_url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      notes_for_future_trips: albumData.notes_for_future_trips || "",
      best_lighting_hours: albumData.best_lighting_hours || "07:00 AM - 09:30 AM",
      local_contacts: albumData.local_contacts || "",
      tags: albumData.tags || ["paisaje", "drone"],
      photos: albumData.photos || [],
      created_at: new Date().toISOString()
    };
    const updated = [newAlbum, ...galleryAlbums];
    saveGalleryLocally(updated);
    return newAlbum;
  };

  const updateGalleryAlbum = (albumId: string, updates: Partial<CreatorGalleryAlbum>) => {
    const updated = galleryAlbums.map(a => a.id === albumId ? { ...a, ...updates } : a);
    saveGalleryLocally(updated);
  };

  const deleteGalleryAlbum = (albumId: string) => {
    const updated = galleryAlbums.filter(a => a.id !== albumId);
    saveGalleryLocally(updated);
  };

  const addPhotoToAlbum = (albumId: string, photo: Partial<CreatorGalleryItem>) => {
    const newItem: CreatorGalleryItem = {
      id: `p-${Date.now()}`,
      photo_url: photo.photo_url || "",
      title: photo.title || "Foto de Expedición",
      caption: photo.caption || "",
      tag: photo.tag || "general",
      taken_at: photo.taken_at || new Date().toISOString(),
      latitude: photo.latitude,
      longitude: photo.longitude
    };
    const updated = galleryAlbums.map(a => {
      if (a.id === albumId) {
        return {
          ...a,
          photos: [...a.photos, newItem],
          cover_url: a.cover_url || newItem.photo_url
        };
      }
      return a;
    });
    saveGalleryLocally(updated);
  };

  const deletePhotoFromAlbum = (albumId: string, photoId: string) => {
    const updated = galleryAlbums.map(a => {
      if (a.id === albumId) {
        return {
          ...a,
          photos: a.photos.filter(p => p.id !== photoId)
        };
      }
      return a;
    });
    saveGalleryLocally(updated);
  };

  // Gestión de Waypoints en vivo
  const saveWaypointsLocally = (newWps: CreatorWaypoint[]) => {
    setWaypoints(newWps);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(localWaypointsKey, JSON.stringify(newWps));
      } catch (e) {}
    }
  };

  const addWaypoint = (wpData: Partial<CreatorWaypoint>): CreatorWaypoint => {
    const newWp: CreatorWaypoint = {
      id: `wp-${Date.now()}`,
      expedition_id: wpData.expedition_id || expeditions[0]?.id || "exp-201",
      latitude: wpData.latitude || 10.4806,
      longitude: wpData.longitude || -66.9036,
      altitude_meters: wpData.altitude_meters || 900,
      point_type: wpData.point_type || "spot_fotografico",
      title: wpData.title || "Nuevo Punto GPS",
      description: wpData.description || "",
      photo_url: wpData.photo_url || "",
      created_at: new Date().toISOString()
    };
    const updated = [newWp, ...waypoints];
    saveWaypointsLocally(updated);
    return newWp;
  };

  const updateWaypoint = (wpId: string, updates: Partial<CreatorWaypoint>) => {
    const updated = waypoints.map(w => w.id === wpId ? { ...w, ...updates } : w);
    saveWaypointsLocally(updated);
  };

  const deleteWaypoint = (wpId: string) => {
    const updated = waypoints.filter(w => w.id !== wpId);
    saveWaypointsLocally(updated);
  };

  return {
    expeditions,
    travelAuthorizations,
    visitedEstablishments,
    quotes,
    membership,
    profileInfo,
    galleryAlbums,
    waypoints,
    deals,
    deliverables,
    routeExpenses,
    tasks,
    audits,
    kpis,
    loading,
    addExpedition,
    updateExpedition,
    updateExpeditionPayment,
    deleteExpedition,
    addTravelAuthorization,
    updateTravelAuthorization,
    toggleAuthorizationStatus,
    deleteTravelAuthorization,
    addVisitedEstablishment,
    updateVisitedEstablishment,
    deleteVisitedEstablishment,
    addQuote,
    updateQuote,
    deleteQuote,
    convertQuoteToDeal,
    updateMembership,
    updateProfileInfo,
    addGalleryAlbum,
    updateGalleryAlbum,
    deleteGalleryAlbum,
    addPhotoToAlbum,
    deletePhotoFromAlbum,
    addWaypoint,
    updateWaypoint,
    deleteWaypoint,
    importWaypoints,
    createDeal,
    addRouteExpense,
    addEditorialTask,
    updateTaskStatus,
    addAudit,
    bcvRate,
    refresh: loadData
  };
}
