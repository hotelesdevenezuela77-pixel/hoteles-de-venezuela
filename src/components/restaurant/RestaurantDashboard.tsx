import React, { useState } from "react";
import {
  Utensils, Users, DollarSign, Clock, ChefHat, CheckCircle2,
  AlertCircle, Plus, Sparkles, Building2, ShieldCheck, Flame,
  Coffee, Wine, RefreshCw, CalendarCheck, TrendingUp, Search
} from "lucide-react";
import type { RestaurantTable, MenuItem, RestaurantOrder, TableReservation } from "../../types/restaurantGastronomy";
import { ConstellationBackground } from "../ConstellationBackground";

interface RestaurantDashboardProps {
  establishment?: {
    id: number;
    name: string;
    slug?: string;
    category_name?: string;
  } | null;
  onSwitchToTraditionalDashboard?: () => void;
}

export const RestaurantDashboard: React.FC<RestaurantDashboardProps> = ({
  establishment,
  onSwitchToTraditionalDashboard
}) => {
  const estName = establishment?.name || "Restaurante & Beach Club Gourmet";

  const [activeTab, setActiveTab] = useState<"mesas" | "comandas" | "menu" | "reservas">("mesas");

  // Mock tables
  const [tables, setTables] = useState<RestaurantTable[]>([
    { id: "T1", table_number: "Mesa 01", zone: "salon_principal", capacity: 4, status: "occupied", current_guests: 3, server_name: "Carlos M.", current_total_usd: 85, opened_at: "13:20" },
    { id: "T2", table_number: "Mesa 02", zone: "salon_principal", capacity: 2, status: "available" },
    { id: "T3", table_number: "Terraza 01", zone: "terraza", capacity: 6, status: "occupied", current_guests: 5, server_name: "Valentina R.", current_total_usd: 140, opened_at: "12:45" },
    { id: "T4", table_number: "Terraza 02", zone: "terraza", capacity: 4, status: "reserved", server_name: "Valentina R." },
    { id: "T5", table_number: "Toldo Playa 01", zone: "playa_toldo", capacity: 8, status: "occupied", current_guests: 6, server_name: "Andrés G.", current_total_usd: 210, opened_at: "11:30" },
    { id: "T6", table_number: "VIP Lounge", zone: "area_vip", capacity: 10, status: "available" },
  ]);

  // Mock kitchen orders
  const [orders, setOrders] = useState<RestaurantOrder[]>([
    {
      id: "ORD-101",
      establishment_id: establishment?.id || 1,
      order_number: "CMD-089",
      table_number: "Terraza 01",
      customer_name: "Familia Gómez",
      items: [
        { menu_item_id: "D1", name: "Pargo Frito Playero (800g)", quantity: 2, unit_price_usd: 28, notes: "Tostones extra crujientes" },
        { menu_item_id: "D2", name: "Ceviche Mixto de la Costa", quantity: 1, unit_price_usd: 16 },
        { menu_item_id: "D3", name: "Cocada Natural con Ron Añejo", quantity: 3, unit_price_usd: 8 }
      ],
      total_usd: 108,
      status: "preparing",
      created_at: "13:42"
    },
    {
      id: "ORD-102",
      establishment_id: establishment?.id || 1,
      order_number: "CMD-090",
      table_number: "Toldo Playa 01",
      customer_name: "Alejandro Silva",
      items: [
        { menu_item_id: "D4", name: "Fosforera Margariteña", quantity: 2, unit_price_usd: 18 },
        { menu_item_id: "D5", name: "Balde de Cervezas Nacionales (6 uds)", quantity: 2, unit_price_usd: 15 }
      ],
      total_usd: 66,
      status: "ready",
      created_at: "13:35"
    }
  ]);

  // Mock Menu
  const [menuItems] = useState<MenuItem[]>([
    { id: "D1", name: "Pargo Frito Playero con Tostones y Ensalada", category: "principales", price_usd: 28, available: true, description: "Pargo fresco del día acompañado de tostones caribeños, queso llanero y ensalada rallada." },
    { id: "D2", name: "Ceviche Mixto Tradicional con Ají Dulce", category: "entradas", price_usd: 16, available: true, description: "Pesca blanca, calamar y camarones marinados en limón criollo y toque de ají dulce margariteño." },
    { id: "D3", name: "Cocada Imperial con Ron Añejo", category: "cocteleria", price_usd: 8, available: true, description: "Pulpa de coco natural, leche condensada, canela y shot de ron venezolano." },
    { id: "D4", name: "Fosforera de Mariscos Especial", category: "principales", price_usd: 18, available: true, description: "Tradicional sopa concentrada de mariscos de las costas de Sucre y Nueva Esparta." },
    { id: "D5", name: "Tequeños Gourmet de Queso de Mano (8 uds)", category: "entradas", price_usd: 10, available: true, description: "Servidos con salsa tártara playera y reducción de papelón con maracuyá." }
  ]);

  // Mock Reservations
  const [reservations] = useState<TableReservation[]>([
    { id: "R1", establishment_id: establishment?.id || 1, guest_name: "Dra. Patricia Mendoza", guest_phone: "+58 414-8889900", table_number: "Terraza 02", pax: 4, reservation_time: "15:00", status: "confirmed", special_requests: "Celebración de aniversario, mesa con vista directa al mar" },
    { id: "R2", establishment_id: establishment?.id || 1, guest_name: "Ing. Roberto Alarcón", guest_phone: "+58 412-3334455", table_number: "VIP Lounge", pax: 8, reservation_time: "19:30", status: "confirmed", special_requests: "Menú degustación con maridaje" }
  ]);

  // Quick stats
  const occupiedCount = tables.filter(t => t.status === "occupied").length;
  const occupancyPct = Math.round((occupiedCount / tables.length) * 100);
  const activeSalesUsd = tables.reduce((sum, t) => sum + (t.current_total_usd || 0), 0);

  const handleUpdateOrderStatus = (orderId: string, newStatus: RestaurantOrder["status"]) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const handleToggleTableStatus = (tableId: string) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        const nextStatus: RestaurantTable["status"] = t.status === "occupied" ? "cleaning" : t.status === "cleaning" ? "available" : "occupied";
        return { ...t, status: nextStatus, current_total_usd: nextStatus === "available" ? 0 : t.current_total_usd };
      }
      return t;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-[#FF0096] selection:text-white">
      {/* Hero Header Corporativo */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0e011f] via-[#1a0533] to-[#0e011f] border-b border-white/10 py-10 px-6 sm:px-10">
        <ConstellationBackground />
        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white shadow-md">
                  SUITE GASTRONÓMICA & RESTAURANTES
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00C8D4]/20 text-[#00C8D4] border border-[#00C8D4]/30">
                  Comandero & KDS en Vivo
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black font-serif text-white tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF0096] flex items-center justify-center text-white shadow-lg">
                  <Utensils className="w-5 h-5" />
                </div>
                <span>{estName}</span>
              </h1>
              <p className="text-xs text-slate-300 font-medium max-w-2xl">
                Control de mesas, comandero digital para cocina (KDS), menú con cotización en tiempo real y gestión de reservas gastronómicas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs flex items-center gap-2 text-slate-300 backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-[#00C8D4]" />
                <span>Cloudflare Edge POS</span>
              </div>

              {onSwitchToTraditionalDashboard && (
                <button
                  onClick={onSwitchToTraditionalDashboard}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-90 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-white/20 hover:scale-[1.02]"
                >
                  <Building2 className="w-4 h-4 text-white" />
                  <span>⬅ Volver al Dashboard Matriz</span>
                </button>
              )}
            </div>
          </div>

          {/* KPIs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Ocupación de Mesas</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-white">{occupancyPct}%</span>
                <span className="text-xs text-slate-400">({occupiedCount}/{tables.length} mesas)</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Ventas en Curso (Salón)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#00C8D4]">${activeSalesUsd} USD</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Comandas en Cocina</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-amber-400">{orders.filter(o => o.status === "preparing").length}</span>
                <span className="text-xs text-slate-400">pendientes</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Reservas para Hoy</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#FF0096]">{reservations.length}</span>
                <span className="text-xs text-slate-400">confirmadas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
          {[
            { id: "mesas", label: "Mapa de Mesas & Salón", icon: Users },
            { id: "comandas", label: "Comandero / KDS Cocina", icon: Flame, badge: `${orders.length}` },
            { id: "menu", label: "Menú Digital & Platos", icon: Utensils },
            { id: "reservas", label: "Reservas de Mesas", icon: CalendarCheck, badge: `${reservations.length}` }
          ].map(tab => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 border ${
                  active
                    ? "bg-[#00C8D4] text-slate-950 border-white font-black shadow-lg shadow-[#00C8D4]/20"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${active ? "bg-slate-950 text-white" : "bg-[#FF0096] text-white"}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      <main className="max-w-7xl mx-auto px-6 pt-6">
        {/* MAPA DE MESAS */}
        {activeTab === "mesas" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white font-serif">Mapa de Mesas en Vivo</h3>
                <p className="text-xs text-slate-400">Haz clic sobre una mesa para alternar su estado entre Ocupada, En Limpieza y Disponible.</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Disponible
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FF0096]/20 text-pink-300 border border-[#FF0096]/30">
                  <span className="w-2 h-2 rounded-full bg-[#FF0096]" /> Ocupada
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Limpieza / Reserva
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map(table => {
                const isOccupied = table.status === "occupied";
                const isCleaning = table.status === "cleaning";
                const isReserved = table.status === "reserved";
                return (
                  <div
                    key={table.id}
                    onClick={() => handleToggleTableStatus(table.id)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer hover:scale-[1.02] flex flex-col justify-between gap-4 ${
                      isOccupied
                        ? "bg-gradient-to-br from-[#1a0533] to-[#0e011f] border-[#FF0096]/50 shadow-lg shadow-[#FF0096]/10"
                        : isCleaning
                        ? "bg-amber-950/20 border-amber-500/40"
                        : isReserved
                        ? "bg-purple-950/20 border-purple-500/40"
                        : "bg-white/5 hover:bg-white/10 border-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#00C8D4] tracking-wider block">
                          {table.zone.replace("_", " ")}
                        </span>
                        <h4 className="text-xl font-black text-white mt-0.5">{table.table_number}</h4>
                        <span className="text-xs text-slate-400">Capacidad: {table.capacity} personas</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        isOccupied ? "bg-[#FF0096] text-white" :
                        isCleaning ? "bg-amber-500 text-slate-950" :
                        isReserved ? "bg-purple-500 text-white" :
                        "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}>
                        {table.status}
                      </span>
                    </div>

                    {isOccupied && (
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Mesero / Abierta</span>
                          <span className="font-bold text-white">{table.server_name} · {table.opened_at}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Cuenta Parcial</span>
                          <span className="font-black text-[#00C8D4] text-base">${table.current_total_usd} USD</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* COMANDERO / KDS COCINA */}
        {activeTab === "comandas" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-white font-serif">KDS · Pantalla de Producción de Cocina</h3>
                <p className="text-xs text-slate-400">Gestión de tiempos y despacho de platillos en tiempo real.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.map(order => (
                <div key={order.id} className="bg-gradient-to-br from-[#0e011f] to-[#1a0533] border border-white/15 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <span className="text-[10px] font-black text-[#00C8D4] uppercase tracking-wider block">{order.order_number} · {order.table_number}</span>
                      <h4 className="text-lg font-black text-white font-serif">{order.customer_name}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg">
                      ⏰ {order.created_at}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-[#FF0096] text-white flex items-center justify-center font-black text-[11px] shrink-0">
                              {item.quantity}x
                            </span>
                            <span className="font-bold text-white">{item.name}</span>
                          </div>
                          {item.notes && <p className="text-[10px] text-amber-300 italic pl-7">Nota: {item.notes}</p>}
                        </div>
                        <span className="font-bold text-slate-300 shrink-0">${item.unit_price_usd * item.quantity} USD</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Comanda</span>
                      <span className="text-base font-black text-[#00C8D4]">${order.total_usd} USD</span>
                    </div>

                    <div className="flex gap-2">
                      {order.status === "preparing" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, "ready")}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                        >
                          <ChefHat className="w-4 h-4" />
                          <span>Marcar Listo para Servir</span>
                        </button>
                      )}
                      {order.status === "ready" && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, "delivered")}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Servido en Mesa</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MENÚ DIGITAL */}
        {activeTab === "menu" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-white font-serif">Catálogo de Platillos & Bebidas</h3>
                <p className="text-xs text-slate-400">Configura precios, disponibilidad y descripciones de la carta.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map(dish => (
                <div key={dish.id} className="p-5 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-[#00C8D4]/20 text-[#00C8D4]">
                        {dish.category}
                      </span>
                      <span className="text-base font-black text-[#FF0096]">${dish.price_usd} USD</span>
                    </div>
                    <h4 className="text-md font-bold text-white mt-2 leading-snug">{dish.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{dish.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-emerald-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Disponible en Carta
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESERVAS DE MESA */}
        {activeTab === "reservas" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-white font-serif">Libro de Reservaciones Gastronómicas</h3>
                <p className="text-xs text-slate-400">Recepción de comensales y asignación de zonas VIP y terraza.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservations.map(res => (
                <div key={res.id} className="p-5 rounded-3xl bg-gradient-to-br from-[#0e011f] to-[#1a0533] border border-white/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#00C8D4] block">Mesa Asignada: {res.table_number}</span>
                      <h4 className="text-lg font-black text-white">{res.guest_name}</h4>
                      <span className="text-xs text-slate-400">{res.guest_phone} · {res.pax} Comensales</span>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-[#FF0096] text-white text-xs font-black">
                      ⏰ {res.reservation_time}
                    </span>
                  </div>
                  {res.special_requests && (
                    <p className="text-xs text-amber-300/90 bg-white/5 p-2.5 rounded-xl border border-white/5">
                      📌 Petición: {res.special_requests}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
