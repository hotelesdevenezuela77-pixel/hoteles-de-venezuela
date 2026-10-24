import React, { useState } from "react";
import { 
  Users, Bed, Wifi, Wind, Waves, Utensils, MessageCircle, 
  Eye, ArrowRight, Sparkles, Check, ChevronRight, Layers, Maximize2, ShieldCheck
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

  // Helper para insignias de categoría corporativas vibrantes (Cero gris, cero negro)
  const getCategoryBadgeStyle = (category?: string) => {
    switch (category) {
      case "parejas":
        return "bg-gradient-to-r from-[#FF0096] to-[#d90080] text-white shadow-md shadow-[#FF0096]/30 border border-white/30";
      case "familiares":
        return "bg-gradient-to-r from-[#9B00CC] to-[#7b00a3] text-white shadow-md shadow-[#9B00CC]/30 border border-white/30";
      case "apartamentos":
        return "bg-gradient-to-r from-[#00C8D4] to-[#009da7] text-white shadow-md shadow-[#00C8D4]/30 border border-white/30";
      default:
        return "bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white shadow-md border border-white/30";
    }
  };

  return (
    <section id="habitaciones" className="py-20 md:py-28 bg-slate-50/50 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
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

        {/* Componente de Pestañas (Tabs Filter) Interactivo - Fondo Blanco Radiante */}
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
                    ? "bg-gradient-to-r from-[#00C8D4] to-[#00aab5] text-white shadow-lg shadow-[#00C8D4]/30 scale-105"
                    : "bg-white hover:bg-[#00C8D4]/10 text-slate-700 hover:text-[#00C8D4] border border-slate-200/90 shadow-xs"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Grid de MÁXIMO 6 tarjetas destacadas - Estilo Luxury Resort */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.map((room) => {
            const isInCart = cartRooms.some(r => String(r.id) === String(room.id));
            const price = room.price_per_night || room.price_usd || 85;

            return (
              <div
                key={room.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-2xl hover:shadow-[#00C8D4]/15 transition-all duration-500 flex flex-col justify-between group hover:-translate-y-1.5 hover:border-[#00C8D4]/50"
              >
                {/* Cabecera / Imagen Nítida Sin Filtro Oscuro */}
                <div>
                  <div className="relative h-64 overflow-hidden bg-slate-100">
                    <img
                      src={room.primary_image || room.cover_image}
                      alt={room.nombre || room.name}
                      className="w-full h-full object-cover filter brightness-[1.02] contrast-[1.02] saturate-[1.03] group-hover:scale-110 transition-transform duration-700 ease-out"
                    />

                    {/* Destello de luz en hover */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full duration-1000 ease-in-out transition-all -skew-x-12" />
                    </div>

                    {/* Badges Superiores: Capacidad en Cristal Blanco + Categoría en Color Corporativo */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start z-10">
                      {/* Capacidad en Cristal Esmerilado Blanco Puro */}
                      <span className="px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-slate-900 bg-white/95 backdrop-blur-md shadow-md border border-white/90 font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#00C8D4] stroke-[2.5]" />
                        <span>{room.capacityText}</span>
                      </span>

                      {/* Categoría en Degradado Oficial (Cian / Magenta / Púrpura) - CERO GRIS */}
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-1 ${getCategoryBadgeStyle(room.badgeCategory)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        {room.badgeLabel}
                      </span>
                    </div>

                    {/* Tarifa de Referencia Flotante en Cristal Blanco Brillante (CERO GRIS) */}
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/90 shadow-xl text-right group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300 z-10">
                      <div className="flex items-center justify-end gap-1.5 mb-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C8D4] animate-pulse" />
                        <span className="text-[10px] uppercase font-black tracking-wider text-[#00C8D4] font-['Plus_Jakarta_Sans',sans-serif]">
                          Tarifa Directa
                        </span>
                      </div>
                      <div className="flex items-baseline justify-end gap-1 font-['Plus_Jakarta_Sans',sans-serif]">
                        <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                          ${price}
                        </span>
                        <span className="text-xs font-black text-[#FF0096]">USD</span>
                        <span className="text-[11px] text-slate-500 font-semibold font-['Inter',sans-serif]">/ noche</span>
                      </div>
                    </div>
                  </div>

                  {/* Cuerpo de la tarjeta */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] tracking-tight group-hover:text-[#00C8D4] transition-colors leading-snug">
                      {room.nombre || room.name}
                    </h3>

                    <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed line-clamp-2 font-['Inter',sans-serif]">
                      {room.description}
                    </p>

                    {/* Comodidades con Pastillas de Color Vivas (Cero Fondos Grises Tristes) */}
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#008d96] bg-[#00C8D4]/10 border border-[#00C8D4]/30 px-3 py-1.5 rounded-xl">
                        <Bed className="w-3.5 h-3.5 text-[#00C8D4] stroke-[2.2]" />
                        <span>{room.bed_type || "Cama King"}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#d90080] bg-[#FF0096]/10 border border-[#FF0096]/30 px-3 py-1.5 rounded-xl">
                        <Wind className="w-3.5 h-3.5 text-[#FF0096] stroke-[2.2]" />
                        <span>A/C 24/7</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8200ab] bg-[#9B00CC]/10 border border-[#9B00CC]/30 px-3 py-1.5 rounded-xl">
                        <Wifi className="w-3.5 h-3.5 text-[#9B00CC] stroke-[2.2]" />
                        <span>Starlink</span>
                      </span>
                      {room.badgeCategory === "apartamentos" && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl">
                          <Utensils className="w-3.5 h-3.5 text-emerald-600 stroke-[2.2]" />
                          <span>Cocina</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones de Tarjeta: WhatsApp Verde Directo + Botón Detalles Prémium */}
                <div className="p-6 pt-0 space-y-3">
                  <div className="flex items-center gap-2">
                    {/* Botón WhatsApp Oficial Verde Esmeralda Vibrante */}
                    <a
                      href={getWaUrl(room)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20ba59] hover:to-[#0f7a6e] text-white font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer font-['Plus_Jakarta_Sans',sans-serif] active:scale-95 group/wa"
                    >
                      <MessageCircle className="w-4 h-4 fill-white shrink-0 group-hover/wa:scale-110 transition-transform" />
                      <span>Cotizar WhatsApp</span>
                    </a>

                    {/* Botón Detalles Prémium */}
                    <button
                      type="button"
                      onClick={() => onOpenDetail(room)}
                      className="py-3.5 px-4 rounded-2xl bg-white hover:bg-[#00C8D4] text-slate-800 hover:text-white border-2 border-slate-200 hover:border-[#00C8D4] font-black text-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 font-['Plus_Jakarta_Sans',sans-serif] shadow-xs hover:shadow-md group/det"
                      title="Ver detalles completos de la habitación"
                    >
                      <Eye className="w-4 h-4 text-[#00C8D4] group-hover/det:text-white transition-colors" />
                      <span className="hidden sm:inline">Detalles</span>
                    </button>
                  </div>

                  {/* Garantía directa al pie de la tarjeta */}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Reserva Directa</span>
                    </span>
                    <span className="text-[#00C8D4] font-bold uppercase tracking-wider text-[10px]">
                      Sin Comisiones
                    </span>
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
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-black text-sm text-slate-900 bg-white hover:bg-gradient-to-r hover:from-[#00C8D4]/10 hover:to-[#FF0096]/10 border-2 border-[#00C8D4]/40 hover:border-[#00C8D4] transition-all shadow-md hover:shadow-xl active:scale-95 cursor-pointer font-['Plus_Jakarta_Sans',sans-serif]"
          >
            <Layers className="w-4.5 h-4.5 text-[#00C8D4]" />
            <span>Ver todas las opciones disponibles (Catálogo Completo)</span>
            <ArrowRight className="w-4 h-4 text-[#FF0096] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
}
