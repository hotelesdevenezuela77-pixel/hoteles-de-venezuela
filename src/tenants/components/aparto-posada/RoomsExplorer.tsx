import React, { useState } from "react";
import { 
  Users, Bed, Wifi, Wind, Waves, Utensils, MessageCircle, 
  Eye, ArrowRight, Sparkles, Check, ChevronRight, Layers, Maximize2, ShieldCheck
} from "lucide-react";
import { APARTO_FEATURED_ROOMS, type ApartoRoomItem } from "../../lib/apartoPosadaData";
import { type Room } from "../RoomCard";
import { type Language, APARTO_TRANSLATIONS } from "../../lib/apartoTranslations";

interface RoomsExplorerProps {
  whatsappPhone: string;
  hotelName: string;
  onOpenDetail: (room: Room) => void;
  onOpenAllRooms: () => void;
  onToggleCart?: (room: Room) => void;
  cartRooms?: Room[];
  language?: Language;
}

type TabType = "todas" | "parejas" | "familiares" | "apartamentos";

export function RoomsExplorer({
  whatsappPhone,
  hotelName,
  onOpenDetail,
  onOpenAllRooms,
  onToggleCart,
  cartRooms = [],
  language = "es"
}: RoomsExplorerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("todas");
  const t = APARTO_TRANSLATIONS[language].rooms;

  const filteredRooms = APARTO_FEATURED_ROOMS.filter(room => {
    if (activeTab === "todas") return true;
    return room.badgeCategory === activeTab;
  }).slice(0, 6);

  const cleanWa = whatsappPhone ? whatsappPhone.replace(/\D/g, "") : "584144815321";
  const targetPhone = cleanWa || "584144815321";

  const getWaUrl = (room: ApartoRoomItem) => {
    const text = language === "es"
      ? `Hola ${hotelName}, deseo cotizar ahora mismo la unidad "${room.nombre || room.name}" (${room.capacityText}). ¿Tienen disponibilidad y tarifas para mis fechas?`
      : `Hello ${hotelName}, I would like to get a quote right now for "${room.nombre || room.name}" (${room.capacityText}). Do you have availability for my dates?`;
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
  };

  const getCategoryBadgeStyle = (category?: string) => {
    switch (category) {
      case "parejas":
        return "bg-gradient-to-r from-[#FF0096] to-[#d90080] text-white shadow-md shadow-[#FF0096]/20 border border-white/40";
      case "familiares":
        return "bg-gradient-to-r from-[#9B00CC] to-[#7b00a3] text-white shadow-md shadow-[#9B00CC]/20 border border-white/40";
      case "apartamentos":
        return "bg-gradient-to-r from-[#00C8D4] to-[#009da7] text-white shadow-md shadow-[#00C8D4]/20 border border-white/40";
      default:
        return "bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white shadow-md border border-white/40";
    }
  };

  return (
    <section id="habitaciones" className="py-20 md:py-28 bg-slate-50/60 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 font-roboto">
      <div className="max-w-7xl mx-auto space-y-14">
        
        {/* Encabezado Editorial Boutique */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF0096]/10 border border-[#FF0096]/30 text-[#FF0096] text-[11px] font-bold tracking-[0.25em] uppercase font-caviar">
            <Sparkles className="w-3.5 h-3.5 text-[#FF0096]" />
            {t.badge}
          </div>

          <h2 className="text-3xl sm:text-5xl font-semibold text-slate-900 tracking-tight font-montserrat">
            {t.title}
          </h2>

          <p className="text-slate-600 text-sm sm:text-base font-normal font-roboto max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Componente de Pestañas (Tabs Filter) - Fondo Blanco Radiante */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {[
            { id: "todas" as TabType, label: t.tabs.todas },
            { id: "parejas" as TabType, label: t.tabs.parejas },
            { id: "familiares" as TabType, label: t.tabs.familiares },
            { id: "apartamentos" as TabType, label: t.tabs.apartamentos }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer font-roboto ${
                  isActive
                    ? "bg-[#00C8D4] text-white shadow-lg shadow-[#00C8D4]/30 scale-105"
                    : "bg-white hover:bg-[#00C8D4]/10 text-slate-700 hover:text-[#00C8D4] border border-slate-200/90 shadow-xs"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Grid de Tarjetas Amplias y Espaciosas - Estilo Hotel Boutique de Lujo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-9">
          {filteredRooms.map((room) => {
            const isInCart = cartRooms.some(r => String(r.id) === String(room.id));
            const price = room.price_per_night || room.price_usd || 85;

            return (
              <div
                key={room.id}
                className="bg-white rounded-[2rem] overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-2xl hover:shadow-[#00C8D4]/15 transition-all duration-500 flex flex-col justify-between group hover:-translate-y-1.5 hover:border-[#00C8D4]/40"
              >
                {/* Cabecera / Fotografía de Alta Calidad */}
                <div>
                  <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-100">
                    <img
                      src={room.primary_image || room.cover_image}
                      alt={room.nombre || room.name}
                      className="w-full h-full object-cover filter brightness-[1.02] contrast-[1.02] group-hover:scale-108 transition-transform duration-700 ease-out"
                    />

                    {/* Destello de luz sutil en hover */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="absolute -inset-full top-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full duration-1000 ease-in-out transition-all -skew-x-12" />
                    </div>

                    {/* Badges Superiores */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start z-10">
                      {/* Capacidad en Cristal Esmerilado Blanco Puro */}
                      <span className="px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-slate-900 bg-white/95 backdrop-blur-md shadow-md border border-white/90 font-caviar flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#00C8D4] stroke-[2.2]" />
                        <span>{room.capacityText}</span>
                      </span>

                      {/* Categoría en Color Oficial */}
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-caviar flex items-center gap-1 ${getCategoryBadgeStyle(room.badgeCategory)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        {room.badgeLabel}
                      </span>
                    </div>

                    {/* Badge de Disponibilidad Inmediata Sin Precios */}
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/90 shadow-md text-right z-10 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-800 font-caviar">
                        {language === "es" ? "Disponibilidad Inmediata" : "Instant Availability"}
                      </span>
                    </div>
                  </div>

                  {/* Cuerpo de la tarjeta con Tipografía Elegante */}
                  <div className="p-7 space-y-4">
                    <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 font-montserrat tracking-tight group-hover:text-[#00C8D4] transition-colors leading-snug">
                      {room.nombre || room.name}
                    </h3>

                    <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed line-clamp-2 font-roboto">
                      {room.description}
                    </p>

                    {/* Comodidades con Iconos de Trazo Fino Minimalistas */}
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700 bg-slate-100/80 border border-slate-200/90 px-3 py-1.5 rounded-xl">
                        <Bed className="w-3.5 h-3.5 text-slate-600 stroke-[1.5]" />
                        <span>{room.bed_type || "Cama King"}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700 bg-slate-100/80 border border-slate-200/90 px-3 py-1.5 rounded-xl">
                        <Wind className="w-3.5 h-3.5 text-slate-600 stroke-[1.5]" />
                        <span>A/C 24/7</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700 bg-slate-100/80 border border-slate-200/90 px-3 py-1.5 rounded-xl font-roboto">
                        <Wifi className="w-3.5 h-3.5 text-slate-600 stroke-[1.5]" />
                        <span>Internet</span>
                      </span>
                      {room.badgeCategory === "apartamentos" && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                          <Utensils className="w-3.5 h-3.5 text-emerald-600 stroke-[1.5]" />
                          <span>{language === "es" ? "Cocina" : "Kitchen"}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones de Tarjeta: WhatsApp Directo + Botón Detalles */}
                <div className="p-7 pt-0 space-y-3">
                  <div className="flex items-center gap-2">
                    {/* Botón WhatsApp Oficial Parpadeante */}
                    <a
                      href={getWaUrl(room)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20ba59] hover:to-[#0f7a6e] text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center justify-center gap-2 cursor-pointer font-roboto active:scale-95 group/wa animate-pulse"
                    >
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                      </span>
                      <MessageCircle className="w-4 h-4 fill-white shrink-0 group-hover/wa:scale-110 transition-transform" />
                      <span className="tracking-wide">{t.quoteWa}</span>
                    </a>

                    {/* Botón Detalles Prémium */}
                    <button
                      type="button"
                      onClick={() => onOpenDetail(room)}
                      className="py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 hover:text-[#00C8D4] border border-slate-200 hover:border-[#00C8D4] font-semibold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 font-roboto shadow-xs group/det"
                      title={t.details}
                    >
                      <Eye className="w-4 h-4 text-slate-500 group-hover/det:text-[#00C8D4] transition-colors" />
                      <span className="hidden sm:inline">{t.details}</span>
                    </button>
                  </div>

                  {/* Garantía directa al pie de la tarjeta */}
                  <div className="flex items-center justify-between text-[11px] font-normal text-slate-500 pt-2 border-t border-slate-100 font-roboto">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{t.directBooking}</span>
                    </span>
                    <span className="text-[#00C8D4] font-bold uppercase tracking-wider text-[10px] font-caviar">
                      {t.noCommission}
                    </span>
                  </div>

                  {onToggleCart && (
                    <button
                      type="button"
                      onClick={() => onToggleCart(room)}
                      className={`w-full py-2 px-3 rounded-xl text-[11px] font-normal transition-all flex items-center justify-center gap-1.5 cursor-pointer font-roboto ${
                        isInCart
                          ? "bg-pink-50 text-[#FF0096] border border-[#FF0096]/30 font-semibold"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${isInCart ? "text-[#FF0096]" : "opacity-0"}`} />
                      <span>{isInCart ? (language === "es" ? "Agregada a cotización múltiple" : "Added to multi-booking") : (language === "es" ? "+ Añadir a cotización múltiple" : "+ Add to multi-booking")}</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Botón Central Elegante al Pie: Catálogo Completo */}
        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={onOpenAllRooms}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-sm text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 hover:border-[#00C8D4] transition-all shadow-sm hover:shadow-lg active:scale-95 cursor-pointer font-roboto"
          >
            <Layers className="w-4.5 h-4.5 text-[#00C8D4]" />
            <span>{t.viewAll}</span>
            <ArrowRight className="w-4 h-4 text-[#FF0096] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
}
