import React, { useState } from "react";
import { X, Users, Bed, MessageCircle, Eye, Search, Layers, Check } from "lucide-react";
import { APARTO_ALL_ROOMS, type ApartoRoomItem } from "../../lib/apartoPosadaData";
import { type Room } from "../RoomCard";

interface AllRoomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelName: string;
  whatsappPhone: string;
  onOpenDetail: (room: Room) => void;
}

export function AllRoomsModal({
  isOpen,
  onClose,
  hotelName,
  whatsappPhone,
  onOpenDetail
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
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative max-w-6xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-[#00C8D4] text-xs font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Inventario Completo de Alojamiento</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-['Plus_Jakarta_Sans',sans-serif]">
              Catálogo de Unidades • {hotelName}
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
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {[
              { id: "all", label: "Todas" },
              { id: "parejas", label: "Parejas" },
              { id: "familiares", label: "Familiares" },
              { id: "apartamentos", label: "Apartamentos" }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  filterType === tab.id
                    ? "bg-[#00C8D4] text-white font-extrabold shadow-sm"
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
              placeholder="Buscar unidad..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00C8D4]"
            />
          </div>
        </div>

        {/* Lista de Unidades */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(room => {
              const price = room.price_per_night || room.price_usd || 85;
              const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
                `Hola ${hotelName}, deseo consultar disponibilidad para la unidad "${room.nombre || room.name}" ($${price}/noche).`
              )}`;

              return (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 bg-slate-900">
                      <img
                        src={room.primary_image || room.cover_image}
                        alt={room.nombre || room.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#00C8D4]">
                        {room.capacityText}
                      </span>
                      <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-xl text-xs font-black text-white bg-slate-950/85">
                        ${price} USD
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="font-extrabold text-sm text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                        {room.nombre || room.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {room.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex gap-2">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Cotizar</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => { onClose(); onOpenDetail(room); }}
                      className="py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-800 text-slate-700 text-xs font-bold cursor-pointer"
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
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 shrink-0">
          Mostrando {filtered.length} unidades disponibles en {hotelName}. Trato directo sin comisiones.
        </div>
      </div>
    </div>
  );
}
