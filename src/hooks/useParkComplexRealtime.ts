import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type {
  ParkCapacity,
  ParkTicket,
  ParkPool,
  ParkBoat,
  ParkOrder,
  ParkExpense,
  ParkKpiSummary,
  QRValidationResult
} from "../types/parkComplex";

const DEFAULT_EXCHANGE_RATE = 36.5; // Tasa USD a VED / BS

// Datos iniciales de demostración en vivo (Ej: El Mundo de los Niños)
const INITIAL_POOLS: ParkPool[] = [
  {
    id: "pool-1",
    establishment_id: 1,
    pool_code: "P-INFANTIL",
    name: "1. Piscina Infantil Splash & Barco Pirata",
    status: "open",
    bathers_count: 145,
    max_capacity: 250,
    saturation_level: "medium",
    lifeguard_name: "Carlos Mendoza"
  },
  {
    id: "pool-2",
    establishment_id: 1,
    pool_code: "P-OLAS",
    name: "2. Piscina Gigante de Olas Central",
    status: "open",
    bathers_count: 320,
    max_capacity: 400,
    saturation_level: "high",
    lifeguard_name: "Ana Rivas & Pedro Ruiz"
  },
  {
    id: "pool-3",
    establishment_id: 1,
    pool_code: "P-TOBOGANES",
    name: "3. Complejo de Toboganes Extremos",
    status: "open",
    bathers_count: 180,
    max_capacity: 200,
    saturation_level: "high",
    lifeguard_name: "José Gutiérrez"
  },
  {
    id: "pool-4",
    establishment_id: 1,
    pool_code: "P-RIO",
    name: "4. Río Lento & Cascadas Tropicales",
    status: "open",
    bathers_count: 95,
    max_capacity: 300,
    saturation_level: "low",
    lifeguard_name: "Mariana Silva"
  },
  {
    id: "pool-5",
    establishment_id: 1,
    pool_code: "P-VIP",
    name: "5. Piscina Relax & Jacuzzis Familiares",
    status: "open",
    bathers_count: 40,
    max_capacity: 80,
    saturation_level: "low",
    lifeguard_name: "David Colmenares"
  }
];

const INITIAL_BOATS: ParkBoat[] = [
  {
    id: "boat-1",
    establishment_id: 1,
    boat_code: "BOT-01",
    name: "Lago #1 - Cisne Blanco",
    status: "sailing",
    max_capacity: 4,
    passengers_count: 4,
    lifejackets_in_use: 4,
    departure_time: new Date(Date.now() - 12 * 60000).toISOString(),
    expected_return_time: new Date(Date.now() + 18 * 60000).toISOString()
  },
  {
    id: "boat-2",
    establishment_id: 1,
    boat_code: "BOT-02",
    name: "Lago #2 - Flamenco Rosa",
    status: "sailing",
    max_capacity: 4,
    passengers_count: 3,
    lifejackets_in_use: 3,
    departure_time: new Date(Date.now() - 5 * 60000).toISOString(),
    expected_return_time: new Date(Date.now() + 25 * 60000).toISOString()
  },
  {
    id: "boat-3",
    establishment_id: 1,
    boat_code: "BOT-03",
    name: "Lago #3 - Dragón Verde",
    status: "docked",
    max_capacity: 4,
    passengers_count: 0,
    lifejackets_in_use: 0
  },
  {
    id: "boat-4",
    establishment_id: 1,
    boat_code: "BOT-04",
    name: "Lago #4 - Patito Dorado",
    status: "docked",
    max_capacity: 4,
    passengers_count: 0,
    lifejackets_in_use: 0
  },
  {
    id: "boat-5",
    establishment_id: 1,
    boat_code: "BOT-05",
    name: "Lago #5 - Caribe Azul",
    status: "maintenance",
    max_capacity: 4,
    passengers_count: 0,
    lifejackets_in_use: 0
  }
];

const INITIAL_TICKETS: ParkTicket[] = [
  {
    id: "t-101",
    establishment_id: 1,
    ticket_code: "HDV-MN-7701",
    guest_name: "Familia Pérez Colmenarez",
    adults_count: 2,
    children_count: 2,
    has_boat_ride: true,
    has_food_package: true,
    vip_access: true,
    purchase_source: "web",
    price_usd: 48,
    price_bs: 48 * DEFAULT_EXCHANGE_RATE,
    status: "used",
    created_at: new Date().toISOString(),
    used_at: new Date(Date.now() - 45 * 60000).toISOString()
  },
  {
    id: "t-102",
    establishment_id: 1,
    ticket_code: "HDV-MN-7702",
    guest_name: "Alejandro Torrealba",
    adults_count: 3,
    children_count: 1,
    has_boat_ride: true,
    has_food_package: false,
    vip_access: false,
    purchase_source: "web",
    price_usd: 35,
    price_bs: 35 * DEFAULT_EXCHANGE_RATE,
    status: "used",
    created_at: new Date().toISOString(),
    used_at: new Date(Date.now() - 20 * 60000).toISOString()
  },
  {
    id: "t-103",
    establishment_id: 1,
    ticket_code: "HDV-MN-7703",
    guest_name: "María Fernanda López",
    adults_count: 1,
    children_count: 2,
    has_boat_ride: false,
    has_food_package: true,
    vip_access: false,
    purchase_source: "taquilla",
    price_usd: 25,
    price_bs: 25 * DEFAULT_EXCHANGE_RATE,
    status: "used",
    created_at: new Date().toISOString(),
    used_at: new Date(Date.now() - 5 * 60000).toISOString()
  },
  {
    id: "t-104",
    establishment_id: 1,
    ticket_code: "HDV-MN-7704",
    guest_name: "Gabriel Castillo (Boleto Web Pendiente)",
    adults_count: 2,
    children_count: 1,
    has_boat_ride: true,
    has_food_package: true,
    vip_access: false,
    purchase_source: "web",
    price_usd: 32,
    price_bs: 32 * DEFAULT_EXCHANGE_RATE,
    status: "valid",
    created_at: new Date().toISOString()
  }
];

const INITIAL_EXPENSES: ParkExpense[] = [
  {
    id: "exp-1",
    establishment_id: 1,
    category: "cloro_quimicos",
    description: "Recarga de Cloro granulado 90% y Sulfato de Aluminio (Piscinas 1 a 5)",
    amount_usd: 120,
    amount_bs: 120 * DEFAULT_EXCHANGE_RATE,
    logged_by: "Ing. Operaciones",
    created_at: new Date(Date.now() - 180 * 60000).toISOString()
  },
  {
    id: "exp-2",
    establishment_id: 1,
    category: "combustible_botes",
    description: "Combustible 40L para bombas del Lago de Botes",
    amount_usd: 35,
    amount_bs: 35 * DEFAULT_EXCHANGE_RATE,
    logged_by: "Encargado Muelle",
    created_at: new Date(Date.now() - 120 * 60000).toISOString()
  }
];

const INITIAL_ORDERS: ParkOrder[] = [
  {
    id: "ord-101",
    establishment_id: 1,
    order_number: "CMD-001",
    location_type: "choza",
    location_identifier: "Choza VIP #04",
    customer_name: "Familia Pérez",
    items: [
      { id: "i1", name: "Combo Pescado Frito + Tobo Soles", quantity: 2, unit_price_usd: 18 },
      { id: "i2", name: "Helados de Barquilla Infantil", quantity: 2, unit_price_usd: 3.5 }
    ],
    total_usd: 43,
    total_bs: 43 * DEFAULT_EXCHANGE_RATE,
    status: "delivered",
    created_at: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: "ord-102",
    establishment_id: 1,
    order_number: "CMD-002",
    location_type: "toldo",
    location_identifier: "Toldo de Playa #12",
    customer_name: "Alejandro Torrealba",
    items: [
      { id: "i3", name: "Nuggets de Pollo con Papas", quantity: 2, unit_price_usd: 8 },
      { id: "i4", name: "Refrescos 600ml", quantity: 3, unit_price_usd: 2 }
    ],
    total_usd: 22,
    total_bs: 22 * DEFAULT_EXCHANGE_RATE,
    status: "preparing",
    created_at: new Date(Date.now() - 10 * 60000).toISOString()
  }
];

export function useParkComplexRealtime(establishmentId: number = 1) {
  const [capacity, setCapacity] = useState<ParkCapacity>({
    establishment_id: establishmentId,
    max_capacity: 3500,
    current_adults: 480,
    current_children: 310
  });

  const [tickets, setTickets] = useState<ParkTicket[]>(INITIAL_TICKETS);
  const [pools, setPools] = useState<ParkPool[]>(INITIAL_POOLS);
  const [boats, setBoats] = useState<ParkBoat[]>(INITIAL_BOATS);
  const [orders, setOrders] = useState<ParkOrder[]>(INITIAL_ORDERS);
  const [expenses, setExpenses] = useState<ParkExpense[]>(INITIAL_EXPENSES);
  const [loading, setLoading] = useState<boolean>(true);

  // Cargar datos iniciales desde Supabase o fallback local
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Intentar cargar capacidad
      const { data: capData } = await supabase
        .from("park_capacity")
        .select("*")
        .eq("establishment_id", establishmentId)
        .maybeSingle();

      if (capData) setCapacity(capData);

      // Intentar cargar tickets
      const { data: tixData } = await supabase
        .from("park_tickets")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("created_at", { ascending: false });

      if (tixData && tixData.length > 0) setTickets(tixData);

      // Intentar cargar piscinas
      const { data: poolData } = await supabase
        .from("park_pools")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("pool_code", { ascending: true });

      if (poolData && poolData.length > 0) setPools(poolData);

      // Intentar cargar botes
      const { data: boatData } = await supabase
        .from("park_boats")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("boat_code", { ascending: true });

      if (boatData && boatData.length > 0) setBoats(boatData);

      // Intentar cargar órdenes F&B
      const { data: orderData } = await supabase
        .from("park_orders")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("created_at", { ascending: false });

      if (orderData && orderData.length > 0) setOrders(orderData);

      // Intentar cargar gastos
      const { data: expData } = await supabase
        .from("park_expenses")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("created_at", { ascending: false });

      if (expData && expData.length > 0) setExpenses(expData);

    } catch (err) {
      console.warn("[ParkRealtime] Usando datos interactivos de reserva:", err);
    } finally {
      setLoading(false);
    }
  }, [establishmentId]);

  useEffect(() => {
    loadData();

    // Suscripción a cambios en tiempo real
    const channel = supabase.channel(`park_realtime_${establishmentId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'park_capacity', filter: `establishment_id=eq.${establishmentId}` }, (payload) => {
        if (payload.new) setCapacity(payload.new as ParkCapacity);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'park_tickets', filter: `establishment_id=eq.${establishmentId}` }, () => {
        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'park_pools', filter: `establishment_id=eq.${establishmentId}` }, () => {
        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'park_boats', filter: `establishment_id=eq.${establishmentId}` }, () => {
        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'park_orders', filter: `establishment_id=eq.${establishmentId}` }, () => {
        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'park_expenses', filter: `establishment_id=eq.${establishmentId}` }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [establishmentId, loadData]);

  // Cálculo consolidado de KPIs en tiempo real
  const kpis: ParkKpiSummary = (() => {
    const totalInPark = capacity.current_adults + capacity.current_children;
    const maxCapacity = capacity.max_capacity || 3500;
    const occupancyPercentage = Math.min(100, Math.round((totalInPark / maxCapacity) * 100));

    // Entradas vendidas / canjeadas
    const usedTickets = tickets.filter(t => t.status === "used");
    const taquillaIncomeUsd = usedTickets.reduce((acc, t) => acc + (t.price_usd || 0), 0);
    const boatIncomeUsd = usedTickets.filter(t => t.has_boat_ride).length * 8; // 8$ pase bote
    
    // Alimentos & Bebidas (Órdenes pagadas o entregadas)
    const fnbIncomeUsd = orders.reduce((acc, o) => acc + (o.total_usd || 0), 0);

    const grossIncomeUsd = taquillaIncomeUsd + fnbIncomeUsd + boatIncomeUsd;
    const grossIncomeBs = grossIncomeUsd * DEFAULT_EXCHANGE_RATE;

    const webTicketsCount = tickets.filter(t => t.purchase_source === "web" && t.status === "used").length;
    const posTicketsCount = tickets.filter(t => t.purchase_source === "taquilla" && t.status === "used").length;

    const totalExpensesUsd = expenses.reduce((acc, e) => acc + (e.amount_usd || 0), 0);
    const totalExpensesBs = totalExpensesUsd * DEFAULT_EXCHANGE_RATE;

    const netBalanceUsd = grossIncomeUsd - totalExpensesUsd;
    const netBalanceBs = netBalanceUsd * DEFAULT_EXCHANGE_RATE;

    return {
      currentAdults: capacity.current_adults,
      currentChildren: capacity.current_children,
      totalInPark,
      maxCapacity,
      occupancyPercentage,
      grossIncomeUsd,
      grossIncomeBs,
      incomeBreakdownUsd: {
        taquilla: taquillaIncomeUsd,
        restaurante: fnbIncomeUsd,
        botes: boatIncomeUsd
      },
      webTicketsCount,
      posTicketsCount,
      totalTicketsProcessed: webTicketsCount + posTicketsCount,
      totalExpensesUsd,
      totalExpensesBs,
      netBalanceUsd,
      netBalanceBs
    };
  })();

  // Acción: Validación atómica QR Anti-Fraude
  const validateQrTicket = async (ticketCode: string): Promise<QRValidationResult> => {
    const cleanCode = ticketCode.trim().toUpperCase();

    try {
      // 1. Intentar mediante RPC atómica Supabase
      const { data, error } = await supabase.rpc('validate_and_redeem_park_ticket', {
        p_ticket_code: cleanCode,
        p_establishment_id: establishmentId
      });

      if (!error && data) {
        if (data.success) {
          loadData();
        }
        return data as QRValidationResult;
      }
    } catch (rpcErr) {
      console.warn("[ParkRealtime] Fallback de validación RPC local:", rpcErr);
    }

    // Fallback interactivo en cliente si la tabla/RPC no está creada en Supabase aún
    const foundIndex = tickets.findIndex(t => t.ticket_code.toUpperCase() === cleanCode);
    if (foundIndex === -1) {
      return {
        success: false,
        error_code: "NOT_FOUND",
        message: `¡TICKET NO ENCONTRADO! El código QR "${cleanCode}" no existe en la base de datos de taquilla.`
      };
    }

    const ticket = tickets[foundIndex];
    if (ticket.status === "used") {
      return {
        success: false,
        error_code: "ALREADY_USED",
        message: `¡ALERTA ANTIFRAUDE! Este ticket ya fue canjeado en taquilla previamente.`,
        used_at: ticket.used_at || new Date(Date.now() - 30 * 60000).toISOString(),
        ticket
      };
    }

    if (ticket.status === "cancelled") {
      return {
        success: false,
        error_code: "CANCELLED",
        message: `¡ALERTA! El ticket está marcado como anulado por la administración.`,
        ticket
      };
    }

    // Canje exitoso
    const updatedTicket: ParkTicket = {
      ...ticket,
      status: "used",
      used_at: new Date().toISOString()
    };

    setTickets(prev => prev.map((t, idx) => idx === foundIndex ? updatedTicket : t));
    
    // Incrementar aforo
    setCapacity(prev => ({
      ...prev,
      current_adults: prev.current_adults + ticket.adults_count,
      current_children: prev.current_children + ticket.children_count
    }));

    return {
      success: true,
      message: `¡PASE VALIDADO EXITOSAMENTE! Acceso autorizado para ${ticket.guest_name}.`,
      ticket: updatedTicket
    };
  };

  // Acción: Emisión de Ticket en Taquilla (POS)
  const issuePosTicket = async (ticketData: Partial<ParkTicket>): Promise<ParkTicket> => {
    const newCode = `HDV-POS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: ParkTicket = {
      id: `pos-${Date.now()}`,
      establishment_id: establishmentId,
      ticket_code: newCode,
      guest_name: ticketData.guest_name || "Cliente Ventanilla",
      adults_count: ticketData.adults_count || 1,
      children_count: ticketData.children_count || 0,
      has_boat_ride: !!ticketData.has_boat_ride,
      has_food_package: !!ticketData.has_food_package,
      vip_access: !!ticketData.vip_access,
      purchase_source: "taquilla",
      price_usd: ticketData.price_usd || 15,
      price_bs: (ticketData.price_usd || 15) * DEFAULT_EXCHANGE_RATE,
      status: "used", // Se canjea de inmediato al venderse en ventanilla
      created_at: new Date().toISOString(),
      used_at: new Date().toISOString()
    };

    try {
      await supabase.from("park_tickets").insert([newTicket]);
    } catch (err) {
      console.warn("Direct insert fallback:", err);
    }

    setTickets(prev => [newTicket, ...prev]);
    setCapacity(prev => ({
      ...prev,
      current_adults: prev.current_adults + newTicket.adults_count,
      current_children: prev.current_children + newTicket.children_count
    }));

    return newTicket;
  };

  // Acción: Actualizar Piscina
  const updatePoolStatus = (poolId: string, updates: Partial<ParkPool>) => {
    setPools(prev => prev.map(p => p.id === poolId ? { ...p, ...updates } : p));
  };

  // Acción: Despachar Bote
  const dispatchBoat = (boatId: string, passengers: number, lifejackets: number) => {
    const depTime = new Date().toISOString();
    const retTime = new Date(Date.now() + 30 * 60000).toISOString();

    setBoats(prev => prev.map(b => {
      if (b.id === boatId) {
        return {
          ...b,
          status: "sailing",
          passengers_count: passengers,
          lifejackets_in_use: lifejackets,
          departure_time: depTime,
          expected_return_time: retTime
        };
      }
      return b;
    }));
  };

  // Acción: Acarrearse / Amarrar Bote en Muelle
  const dockBoat = (boatId: string) => {
    setBoats(prev => prev.map(b => {
      if (b.id === boatId) {
        return {
          ...b,
          status: "docked",
          passengers_count: 0,
          lifejackets_in_use: 0,
          departure_time: undefined,
          expected_return_time: undefined
        };
      }
      return b;
    }));
  };

  // Acción: Registrar Comanda F&B
  const createFoodOrder = (orderData: Partial<ParkOrder>) => {
    const newOrder: ParkOrder = {
      id: `ord-${Date.now()}`,
      establishment_id: establishmentId,
      order_number: `CMD-${Math.floor(100 + Math.random() * 900)}`,
      location_type: orderData.location_type || "mesa",
      location_identifier: orderData.location_identifier || "Mesa #1",
      customer_name: orderData.customer_name || "Visitante",
      items: orderData.items || [],
      total_usd: orderData.total_usd || 0,
      total_bs: (orderData.total_usd || 0) * DEFAULT_EXCHANGE_RATE,
      status: "pending",
      created_at: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
  };

  // Acción: Cargar Gasto Operativo
  const addExpense = (expData: Partial<ParkExpense>) => {
    const newExpense: ParkExpense = {
      id: `exp-${Date.now()}`,
      establishment_id: establishmentId,
      category: expData.category || "otro",
      description: expData.description || "Gasto operativo",
      amount_usd: expData.amount_usd || 0,
      amount_bs: (expData.amount_usd || 0) * DEFAULT_EXCHANGE_RATE,
      receipt_url: expData.receipt_url,
      logged_by: expData.logged_by || "Administración",
      created_at: new Date().toISOString()
    };

    setExpenses(prev => [newExpense, ...prev]);
  };

  return {
    capacity,
    tickets,
    pools,
    boats,
    orders,
    expenses,
    kpis,
    loading,
    validateQrTicket,
    issuePosTicket,
    updatePoolStatus,
    dispatchBoat,
    dockBoat,
    createFoodOrder,
    addExpense,
    refresh: loadData
  };
}
