import React, { useState } from "react";
import { 
  Users, Bed, Wifi, Wind, Waves, Utensils, MessageCircle, 
  Eye, ArrowRight, Sparkles, Check, ChevronRight, Layers
} from "lucide-react";
import { APARTO_FEATURED_ROOMS, type ApartoRoomItem } from "../../lib/apartoPosadaData";
import { type Room } from "../RoomCard";

interface RoomsExplorerProps {
  whatsappPhone: string;
  hotelName: string;
  onOpenDetail: (room: Room) => void;
  onOpenAllRooms: () => void;
  onToggleCart?: (room: Room) => void;
  cartRooms?: Room[];
}

type TabType = "todas" | "parejas" | "familiares" | "apartamentos";

export function RoomsExplorer({
  whatsappPhone,
  hotelName,
  onOpenDetail,
  onOpenAllRooms,
  onToggleCart,
  cartRooms = []
}: RoomsExplorerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("todas");

  const filteredRooms = APARTO_FEATURED_ROOMS.filter(room => {
    if (activeTab === "todas") return true;
    return room.badgeCategory === activeTab;
  }).slice(0, 6);

  const cleanWa = whatsappPhone.replace(/\D/g, "");

  const getWaUrl = (room: ApartoRoomItem) => {
    const text = `Hola ${hotelName}, deseo consultar disponibilidad para la "${room.nombre || room.name}" (${room.capacityText}) con tarifa de referencia $${room.price_per_night || room.price_usd}/noche. ¿Tienen fechas disponibles?`;
    return `https://wa.me/${cleanWa}?text=${encodeURIComponent(text)}`;
  };

  return (
    <section id="habitaciones" className="py-20 md:py-28 bg-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Encabezado de Sección */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF0096]/10 border border-[#FF0096]/30 text-[#FF0096] text-[11px] font-extrabold tracking-[0.25em] uppercase font-['Plus_Jakarta_Sans',sans-serif]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF0096]" />
            ESTANCIA PERFECTA & TARIFAS DIRECTAS
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
            Habitaciones, Suites & Apartamentos
          </h2>

          <p className="text-slate-600 text-sm sm:text-base font-normal font-['Inter',sans-serif] max-w-2xl mx-auto">
            Selección exclusiva de nuestras unidades más solicitadas. Reserve directamente sin comisiones de intermediarios con confirmación inmediata por WhatsApp.
          </p>
        </div>

        {/* Componente de Pestañas (Tabs Filter) Interactivo */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {[
            { id: "todas" as TabType, label: "Todas las Opciones" },
            { id: "parejas" as TabType, label: "Parejas / Suites" },
            { id: "familiares" as TabType, label: "Familiares" },
            { id: "apartamentos" as TabType, label: "Apartamentos con Cocina" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer font-['Plus_Jakarta_Sans',sans-serif] ${
                  isActive
                    ? "bg-[#00C8D4] text-white shadow-lg shadow-[#00C8D4]/25 scale-105"
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Grid de MÁXIMO 6 tarjetas destacadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.map((room) => {
            const isInCart = cartRooms.some(r => String(r.id) === String(room.id));
            const price = room.price_per_night || room.price_usd || 85;

            return (
              <div
                key={room.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                {/* Cabecera / Imagen con Badge */}
                <div>
                  <div className="relative h-60 overflow-hidden bg-slate-900">
                    <img
                      src={room.primary_image || room.cover_image}
                      alt={room.nombre || room.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none"></div>

                    {/* Badge de Capacidad */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                      <span className="px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-white bg-[#00C8D4] shadow-md font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>{room.capacityText}</span>
                      </span>
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-slate-900/80 backdrop-blur-md border border-white/20">
                        {room.badgeLabel}
                      </span>
                    </div>

                    {/* Tarifa de Referencia Flotante */}
                    <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/20 shadow-xl text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-300 block">Tarifa Directa</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-[#00C8D4] font-['Plus_Jakarta_Sans',sans-serif]">${price}</span>
                        <span className="text-[11px] text-slate-300 font-medium">USD / noche</span>
                      </div>
                    </div>
                  </div>

                  {/* Cuerpo de la tarjeta */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight group-hover:text-[#00C8D4] transition-colors leading-snug">
                      {room.nombre || room.name}
                    </h3>

                    <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed line-clamp-2 font-['Inter',sans-serif]">
                      {room.description}
                    </p>

                    {/* Comodidades con Iconos Sutiles */}
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl">
                        <Bed className="w-3.5 h-3.5 text-[#00C8D4]" />
                        <span>{room.bed_type || "Cama King"}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl">
                        <Wind className="w-3.5 h-3.5 text-[#FF0096]" />
                        <span>A/C 24/7</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl">
                        <Wifi className="w-3.5 h-3.5 text-[#9B00CC]" />
                        <span>Starlink</span>
                      </span>
                      {room.badgeCategory === "apartamentos" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-xl">
                          <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Cocina</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones de Tarjeta: WhatsApp Verde Directo + Ver Detalles */}
                <div className="p-6 pt-0 space-y-2">
                  <div className="flex items-center gap-2">
                    {/* Botón Principal en Verde Tailwind con WhatsApp */}
                    <a
                      href={getWaUrl(room)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 cursor-pointer font-['Plus_Jakarta_Sans',sans-serif] active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                      <span>Cotizar por WhatsApp</span>
                    </a>

                    {/* Botón Outline Secundario 'Ver detalles' */}
                    <button
                      type="button"
                      onClick={() => onOpenDetail(room)}
                      className="py-3 px-3.5 rounded-2xl border border-slate-300 hover:border-slate-800 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 font-['Plus_Jakarta_Sans',sans-serif]"
                      title="Ver detalles completos de la habitación"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Detalles</span>
                    </button>
                  </div>

                  {onToggleCart && (
                    <button
                      type="button"
                      onClick={() => onToggleCart(room)}
                      className={`w-full py-2 px-3 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isInCart
                          ? "bg-pink-50 text-[#FF0096] border border-[#FF0096]/30"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${isInCart ? "text-[#FF0096]" : "opacity-0"}`} />
                      <span>{isInCart ? "Agregada a solicitud múltiple" : "+ Añadir a cotización múltiple"}</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Botón Central Elegante al Pie: "Ver todas las opciones disponibles" */}
        <div className="pt-6 text-center">
          <button
            type="button"
            onClick={onOpenAllRooms}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-extrabold text-sm text-slate-900 bg-slate-100 hover:bg-slate-200/90 border border-slate-300/80 transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer font-['Plus_Jakarta_Sans',sans-serif]"
          >
            <Layers className="w-4.5 h-4.5 text-[#00C8D4]" />
            <span>Ver todas las opciones disponibles (Catálogo Completo)</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
}
