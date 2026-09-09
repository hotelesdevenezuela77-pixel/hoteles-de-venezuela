import React, { useState } from "react";
import {
  Building2, Calendar, BedDouble, DollarSign, Coffee, Globe,
  Plus, Search, Filter, CheckCircle2, Clock, Users, Sparkles,
  ArrowUpRight, ChevronRight, Layers, Sliders, RefreshCw,
  Eye, Edit3, ShieldCheck, Tag, Zap, MessageSquare, Utensils
} from "lucide-react";

const FUCSIA = "#FF0096";
const CIAN = "#00C8D4";
const PURPURA = "#9B00CC";
const OSCURO_FONDO = "#0e011f";
const OSCURO_CARD = "#1a0533";

interface HotelPMSDashboardProps {
  establishment?: {
    id?: number;
    name?: string;
    slug?: string;
    category_name?: string;
  };
  onSwitchToTraditionalDashboard?: () => void;
}

export function HotelPMSDashboard({
  establishment = {
    id: 101,
    name: "Hotel Boutique & Posada Vista Mar",
    slug: "hotel-boutique-vista-mar",
    category_name: "Hoteles & Posadas"
  },
  onSwitchToTraditionalDashboard
}: HotelPMSDashboardProps) {
  const [activeTab, setActiveTab] = useState<"calendario" | "habitaciones" | "pms_timeline" | "pos" | "cms">("calendario");
  const [selectedSeason, setSelectedSeason] = useState<"alta" | "media" | "baja">("alta");
  const [currency, setCurrency] = useState<"USD" | "BS">("USD");

  const [roomsList, setRoomsList] = useState([
    {
      id: 1,
      name: "Suite Presidencial Vista al Mar",
      code: "HAB-301",
      type: "Suite Deluxe",
      capacity: 4,
      priceUSD: 160,
      status: "disponible",
      amenities: ["Jacuzzi Privado", "Cama King", "Balcón", "A/C Inverter", "Wifi Starlink"],
      cleaningStatus: "limpia"
    },
    {
      id: 2,
      name: "Habitación Matrimonial Superior",
      code: "HAB-202",
      type: "Matrimonial",
      capacity: 2,
      priceUSD: 85,
      status: "ocupada",
      guest: "Carlos Mendoza",
      checkOut: "Mañana 12:00 PM",
      amenities: ["Cama Queen", "A/C", "TV Smart", "Desayuno Incluido"],
      cleaningStatus: "en_uso"
    },
    {
      id: 3,
      name: "Villa Familiar 2 Ambientes",
      code: "VIL-104",
      type: "Villa",
      capacity: 6,
      priceUSD: 210,
      status: "reservada",
      guest: "Familia Gómez",
      checkIn: "Hoy 3:00 PM",
      amenities: ["Cocina Equipada", "2 Baños", "Terraza", "Piscina Compartida"],
      cleaningStatus: "limpia"
    },
    {
      id: 4,
      name: "Domo Glamping Panorámico",
      code: "GLAMP-01",
      type: "Glamping Eco",
      capacity: 2,
      priceUSD: 120,
      status: "disponible",
      amenities: ["Cama King", "Deck Privado", "Fogata", "Telescopio"],
      cleaningStatus: "limpia"
    }
  ]);

  const [reservations, setReservations] = useState([
    {
      id: "RES-8821",
      guest: "Mariana Velásquez",
      room: "HAB-301 · Suite Presidencial",
      dates: "12 Mar - 15 Mar (3 Noches)",
      pax: 2,
      total: 480,
      paid: 480,
      status: "confirmada",
      origin: "Motor Web Directo"
    },
    {
      id: "RES-8822",
      guest: "Ricardo Páez",
      room: "HAB-202 · Matrimonial Superior",
      dates: "14 Mar - 16 Mar (2 Noches)",
      pax: 2,
      total: 170,
      paid: 85,
      status: "check_in",
      origin: "WhatsApp Concierge"
    },
    {
      id: "RES-8823",
      guest: "Valeria Castillo",
      room: "VIL-104 · Villa Familiar",
      dates: "18 Mar - 21 Mar (3 Noches)",
      pax: 5,
      total: 630,
      paid: 630,
      status: "confirmada",
      origin: "OTA Booking.com"
    }
  ]);

  const [posOrders, setPosOrders] = useState([
    { id: "POS-101", room: "HAB-202", items: "2x Cóctel Coco Loco, 1x Ceviche Playero", total: 38, status: "cargado_habitacion" },
    { id: "POS-102", room: "HAB-301", items: "1x Desayuno Criollo Especial, 2x Café Espresso", total: 22, status: "cargado_habitacion" },
    { id: "POS-103", room: "Mesa 4 (Piscina)", items: "4x Cerveza Polar, 1x Tequeños Gourmet", total: 18, status: "pagado" }
  ]);

  return (
    <div className="space-y-6 font-sans text-slate-800">
      
      {/* Cabecera Suite Hotelera HDV */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 border border-white/10 text-white shadow-2xl"
           style={{ background: `linear-gradient(135deg, ${OSCURO_FONDO} 0%, ${OSCURO_CARD} 100%)` }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: FUCSIA }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: CIAN }} />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black tracking-wider uppercase"
                 style={{ backgroundColor: `${FUCSIA}15`, color: FUCSIA, border: `1px solid ${FUCSIA}30` }}>
              <Building2 className="w-3.5 h-3.5" />
              <span>Suite Hotelera & PMS Pro · C00.1</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif text-white tracking-wide">
              {establishment.name || "Hotel & Posada Vista Mar"}
            </h1>
            <p className="text-slate-400 text-xs max-w-xl leading-relaxed">
              Consola operativa para hoteles, posadas y glampings. Administra disponibilidad, tarifas por temporada, folios de huéspedes, asignación de limpieza y cobros gastronómicos POS.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-center gap-3 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm" style={{ backgroundColor: `${CIAN}20` }}>
                <BedDouble className="w-5 h-5" style={{ color: CIAN }} />
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Ocupación Hoy</span>
                <span className="text-sm font-black text-white">75% (3 de 4 ocupadas)</span>
              </div>
            </div>

            {onSwitchToTraditionalDashboard && (
              <button
                type="button"
                onClick={onSwitchToTraditionalDashboard}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer"
              >
                Volver a Matriz
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin border-b border-slate-200">
        {[
          { id: "calendario", label: "Tarifas & Temporadas", icon: DollarSign, badge: "Tarifario" },
          { id: "habitaciones", label: "Inventario Habitaciones", icon: BedDouble, count: roomsList.length },
          { id: "pms_timeline", label: "Recepción & Timeline", icon: Calendar, count: reservations.length },
          { id: "pos", label: "Club POS Restaurante", icon: Coffee, count: posOrders.length },
          { id: "cms", label: "Motor Web & Landing", icon: Globe, badge: "Web Builder" }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                isActive
                  ? "bg-slate-900 text-white shadow-md scale-102"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${isActive ? "bg-[#FF0096] text-white" : "bg-pink-100 text-pink-700"}`}>
                  {tab.badge}
                </span>
              )}
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? "bg-[#00C8D4] text-slate-950" : "bg-slate-200 text-slate-700"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* PESTAÑA 1: TARIFAS & TEMPORADAS */}
      {activeTab === "calendario" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tarifa Media Diaria (ADR)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">$143.75</span>
                <span className="text-[10px] text-emerald-600 font-bold">+12% vs mes anterior</span>
              </div>
              <p className="text-[11px] text-slate-500">Calculado sobre habitaciones vendidas en temporada alta.</p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">RevPAR (Ingreso por Habitación)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900" style={{ color: CIAN }}>$107.81</span>
                <span className="text-[10px] text-emerald-600 font-bold">Rendimiento Óptimo</span>
              </div>
              <p className="text-[11px] text-slate-500">Ocupación promedio de 75% combinada con tarifa base.</p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Canal Principal de Venta</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-900" style={{ color: FUCSIA }}>Directo Web (68%)</span>
              </div>
              <p className="text-[11px] text-slate-500">Ahorro de $142 en comisiones de OTAs mediante HDV SaaS.</p>
            </div>
          </div>

          {/* Tabla de Tarifas por Tipo de Habitación */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 font-serif">Tarifario de Habitaciones y Glampings</h3>
                <p className="text-xs text-slate-500">Ajusta precios por noche para venta directa y canales sincronizados.</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                  {(["alta", "media", "baja"] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSeason(s)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        selectedSeason === s ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {s === "alta" ? "🔥 Alta" : s === "media" ? "⚡ Media" : "🌱 Baja"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    <th className="p-4">Habitación / Código</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4">Capacidad</th>
                    <th className="p-4">Tarifa Regular (USD)</th>
                    <th className="p-4">Tarifa Temporada ({selectedSeason.toUpperCase()})</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roomsList.map(r => {
                    const multiplier = selectedSeason === "alta" ? 1.25 : selectedSeason === "baja" ? 0.85 : 1.0;
                    const seasonalPrice = Math.round(r.priceUSD * multiplier);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <strong className="text-slate-900 block font-bold">{r.name}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">{r.code}</span>
                        </td>
                        <td className="p-4 text-slate-600 font-semibold">{r.type}</td>
                        <td className="p-4 text-slate-700">
                          <span className="inline-flex items-center gap-1 font-bold">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {r.capacity} personas
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-900">${r.priceUSD} / noche</td>
                        <td className="p-4 font-mono font-black" style={{ color: FUCSIA }}>
                          ${seasonalPrice} / noche
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            r.status === "disponible"
                              ? "bg-emerald-100 text-emerald-800"
                              : r.status === "ocupada"
                              ? "bg-pink-100 text-pink-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => alert(`Editar tarifa para ${r.name}`)}
                            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                            title="Editar tarifas"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: INVENTARIO HABITACIONES */}
      {activeTab === "habitaciones" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="flex justify-between items-center gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 font-serif">Inventario Físico y Unidades</h3>
              <p className="text-xs text-slate-500">Gestiona comodidades, fotos y estado de camareras/limpieza.</p>
            </div>
            <button
              type="button"
              onClick={() => alert("Modal de añadir nueva habitación o domo glamping")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white cursor-pointer shadow-md"
              style={{ background: `linear-gradient(135deg, ${FUCSIA} 0%, ${PURPURA} 100%)` }}
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Habitación / Domo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roomsList.map(r => (
              <div key={r.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono block">{r.code}</span>
                    <h4 className="text-base font-black text-slate-900 font-serif">{r.name}</h4>
                    <span className="text-xs text-slate-500 font-medium">{r.type} · Hasta {r.capacity} huéspedes</span>
                  </div>
                  <span className="text-lg font-black text-slate-900 font-mono">${r.priceUSD}<span className="text-[10px] text-slate-400 font-normal">/noche</span></span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {r.amenities.map((am, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-[10px] font-semibold">
                      {am}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Camarera:</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      r.cleaningStatus === "limpia" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {r.cleaningStatus === "limpia" ? "✨ Lista para Check-in" : "🧹 En Limpieza"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => alert(`Configuración de ${r.name}`)}
                    className="text-xs font-bold hover:underline cursor-pointer"
                    style={{ color: CIAN }}
                  >
                    Editar Ficha & Fotos →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA 3: RECEPCIÓN & PMS TIMELINE */}
      {activeTab === "pms_timeline" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 font-serif">Folios de Huéspedes & Reservas Activas</h3>
                <p className="text-xs text-slate-500">Historial de reservas directas, check-ins y cobros pendientes.</p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>PMS En Vivo Sincronizado</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {reservations.map(res => (
                <div key={res.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-400">{res.id}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{res.guest}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-100 text-indigo-700">
                        {res.origin}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{res.room} · {res.dates} ({res.pax} Personas)</p>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-center">
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 font-mono">${res.total} USD</span>
                      <span className={`block text-[10px] font-bold ${res.paid === res.total ? "text-emerald-600" : "text-amber-600"}`}>
                        {res.paid === res.total ? "Pagado 100%" : `Pendiente $${res.total - res.paid}`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert(`Ver Folio Completo de ${res.guest}`)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer"
                    >
                      Ver Folio
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 4: CLUB POS RESTAURANTE */}
      {activeTab === "pos" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 font-serif">Comandas & Cargos a la Habitación (POS)</h3>
                <p className="text-xs text-slate-500">Carga consumos de restaurante, bar y piscina directo a la cuenta del huésped.</p>
              </div>

              <button
                type="button"
                onClick={() => alert("Abrir terminal POS táctil")}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                + Nueva Comanda
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {posOrders.map(ord => (
                <div key={ord.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-slate-400">{ord.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-pink-100 text-pink-700">
                      {ord.room}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold">{ord.items}</p>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
                    <span className="font-mono font-black text-slate-900">${ord.total} USD</span>
                    <span className="text-[10px] font-bold text-emerald-600">✓ {ord.status === "cargado_habitacion" ? "Cargado al Folio" : "Cobrado"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 5: CMS & MOTOR DIRECTO */}
      {activeTab === "cms" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900 font-serif">Motor de Reservas Directo & Landing Page</h3>
              <p className="text-xs text-slate-500">Tu propio sitio web independiente bajo el ecosistema Hoteles de Venezuela.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Enlace Público de tu Posada</span>
                <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-700">
                  <Globe className="w-4 h-4 text-[#00C8D4] shrink-0" />
                  <span className="truncate">https://hotelesdevenezuela.com/establecimiento/{establishment.slug || "posada-vista-mar"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => window.open(`/establecimiento/${establishment.slug || "hostal-entre-2-aguas"}`, "_blank")}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${CIAN} 0%, #0284c7 100%)` }}
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver Ficha Pública en Vivo</span>
                </button>
              </div>

              <div className="space-y-3 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Integración con WhatsApp Directo</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Los huéspedes pueden cotizar en línea y enviar el voucher de solicitud directo al WhatsApp oficial de tu posada sin intermediarios ni comisiones de terceros.
                </p>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <MessageSquare className="w-4 h-4" />
                  <span>Canal Directo Activo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
