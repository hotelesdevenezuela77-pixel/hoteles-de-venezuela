import React, { useState } from "react";
import { X, Ship, Users, LifeBuoy, Clock, Play } from "lucide-react";
import type { ParkBoat } from "../../types/parkComplex";

interface ParkBoatDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  boats: ParkBoat[];
  onDispatch: (boatId: string, passengers: number, lifejackets: number) => void;
}

export const ParkBoatDispatchModal: React.FC<ParkBoatDispatchModalProps> = ({
  isOpen,
  onClose,
  boats,
  onDispatch
}) => {
  const dockedBoats = boats.filter((b) => b.status === "docked");
  const [selectedBoatId, setSelectedBoatId] = useState<string>(dockedBoats[0]?.id || boats[0]?.id || "");
  const [passengersCount, setPassengersCount] = useState(3);
  const [lifejacketsCount, setLifejacketsCount] = useState(3);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoatId) return;

    onDispatch(selectedBoatId, passengersCount, lifejacketsCount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#0e011f] border border-[#FF0096]/30 shadow-2xl shadow-[#FF0096]/10">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-gradient-to-r from-[#1a0533] to-[#0e011f]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF0096] flex items-center justify-center shadow-lg shadow-[#FF0096]/20">
              <Ship className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Despachar Bote al Lago</h3>
              <p className="text-xs text-slate-400">Inicio de Temporizador y Asignación de Tripulantes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Seleccionar Bote en Muelle */}
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Seleccionar Embarcación Disponible en Muelle:
            </label>
            {dockedBoats.length === 0 ? (
              <p className="text-amber-400 italic bg-amber-950/40 p-3 rounded-xl border border-amber-500/30">
                No hay botes amarrados libres en muelle en este momento.
              </p>
            ) : (
              <select
                value={selectedBoatId}
                onChange={(e) => setSelectedBoatId(e.target.value)}
                className="w-full bg-slate-900 border border-white/20 rounded-xl py-2.5 px-3 text-white text-xs font-bold focus:outline-none focus:border-[#FF0096]"
              >
                {dockedBoats.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.boat_code} - {b.name} (Cap. {b.max_capacity} pers)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Pasajeros y Chalecos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/10">
              <label className="block text-slate-400 font-semibold mb-1">Pasajeros a Bordo:</label>
              <input
                type="number"
                min="1"
                max="4"
                value={passengersCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setPassengersCount(val);
                  setLifejacketsCount(val);
                }}
                className="w-full bg-slate-950 border border-white/15 rounded-lg py-1.5 px-2 text-white font-bold text-sm"
              />
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/10">
              <label className="block text-slate-400 font-semibold mb-1">Chalecos Entregados:</label>
              <input
                type="number"
                min="1"
                max="4"
                value={lifejacketsCount}
                onChange={(e) => setLifejacketsCount(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-white/15 rounded-lg py-1.5 px-2 text-white font-bold text-sm"
              />
            </div>
          </div>

          <div className="bg-sky-950/40 border border-sky-500/30 p-3 rounded-xl text-sky-200 flex items-center justify-between">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-sky-400" /> Tiempo de Paseo Estándar:
            </span>
            <span className="font-bold font-mono">30 Minutos</span>
          </div>

          <button
            type="submit"
            disabled={dockedBoats.length === 0 || !selectedBoatId}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white font-extrabold text-xs shadow-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>INICIAR NAVEGACIÓN Y TEMPORIZADOR</span>
          </button>
        </form>

      </div>
    </div>
  );
};
