import React, { useState } from "react";
import { X, Users, Bed, MessageCircle, Eye, Search, Layers, Check } from "lucide-react";
import { APARTO_ALL_ROOMS, type ApartoRoomItem } from "../../lib/apartoPosadaData";
import { type Room } from "../RoomCard";
import { type Language } from "../../lib/apartoTranslations";

interface AllRoomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelName: string;
  whatsappPhone: string;
  onOpenDetail: (room: Room) => void;
  language?: Language;
}

export function AllRoomsModal({
  isOpen,
  onClose,
  hotelName,
  whatsappPhone,
  onOpenDetail,
  language = "es"
}: AllRoomsModalProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  if (!isOpen) return null;

  const cleanWa = whatsappPhone.replace(/\D/g, "");

  const filtered = APARTO_ALL_ROOMS.filter(r => {
    if (filterType !== "all" && r.badgeCategory !== filterType) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const match = (r.nombre || r.name || "").toLowerCase().includes(q) ||
                    (r.description || "").toLowerCase().includes(q) ||
                    (r.bed_type || "").toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto font-roboto"
      onClick={onClose}
    >
      <div 
        className="relative max-w-6xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col font-roboto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0e011f] to-[#1a0533] text-white flex items-center justify-between shrink-0 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-[#00C8D4] text-xs font-bold uppercase tracking-wider font-caviar">
              <Layers className="w-4 h-4 text-[#00C8D4]" />
              <span>{language === "es" ? "Inventario Completo de Alojamiento" : "Complete Lodging Inventory"}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold font-montserrat text-white">
              {language === "es" ? "Catálogo de Unidades" : "Units Catalog"} • {hotelName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-[#FF0096] text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 font-roboto">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {[
              { id: "all", label: language === "es" ? "Todas" : "All" },
              { id: "parejas", label: language === "es" ? "Parejas" : "Couples" },
              { id: "familiares", label: language === "es" ? "Familiares" : "Family" },
              { id: "apartamentos", label: language === "es" ? "Apartamentos" : "Apartments" }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filterType === tab.id
                    ? "bg-[#00C8D4] text-white font-bold shadow-sm"
                    : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === "es" ? "Buscar unidad..." : "Search unit..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00C8D4] font-roboto"
            />
          </div>
        </div>

        {/* Lista de Unidades */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 font-roboto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(room => {
              const targetPhone = cleanWa || "584144815321";
              const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(
                language === "es"
                  ? `Hola ${hotelName}, deseo cotizar ahora mismo la unidad "${room.nombre || room.name}". ¿Tienen disponibilidad y tarifas para mis fechas?`
                  : `Hello ${hotelName}, I would like to get a quote right now for "${room.nombre || room.name}". Do you have availability for my dates?`
              )}`;

              return (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div>
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <img
                        src={room.primary_image || room.cover_image}
                        alt={room.nombre || room.name}
                        className="w-full h-full object-cover filter brightness-[1.02] contrast-[1.02] group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-900 bg-white/95 backdrop-blur-md shadow-md border border-white/80 font-caviar">
                        {room.capacityText}
                      </span>
                      <div className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-full text-[10px] font-bold text-slate-800 bg-white/95 backdrop-blur-md shadow-md border border-white/80 flex items-center gap-1.5 font-caviar">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{language === "es" ? "Disponible" : "Available"}</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="font-semibold text-base text-slate-900 font-montserrat group-hover:text-[#00C8D4] transition-colors">
                        {room.nombre || room.name}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 font-roboto">
                        {room.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex gap-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20ba59] hover:to-[#0f7a6e] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg transition-all font-roboto animate-pulse"
                    >
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      <MessageCircle className="w-3.5 h-3.5 fill-white shrink-0" />
                      <span>{language === "es" ? "Cotiza ahora mismo" : "Get a Quote Now"}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => { onClose(); onOpenDetail(room); }}
                      className="py-2.5 px-3 rounded-xl bg-white hover:bg-[#00C8D4] text-[#00C8D4] hover:text-white border border-[#00C8D4]/40 font-semibold text-xs cursor-pointer transition-all flex items-center justify-center font-roboto"
                      title={language === "es" ? "Ver detalles" : "View details"}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 shrink-0 font-roboto">
          {language === "es"
            ? `Mostrando ${filtered.length} unidades disponibles en ${hotelName}. Trato directo sin comisiones.`
            : `Showing ${filtered.length} units available at ${hotelName}. Direct booking without intermediaries.`}
        </div>
      </div>
    </div>
  );
}
