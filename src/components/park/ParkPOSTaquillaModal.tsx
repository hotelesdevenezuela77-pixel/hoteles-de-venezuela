import React, { useState } from "react";
import { X, ShoppingBag, Plus, Minus, CreditCard, DollarSign, UserCheck, Ship, Utensils, Sparkles, Check } from "lucide-react";
import type { ParkTicket } from "../../types/parkComplex";

interface ParkPOSTaquillaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIssueTicket: (data: Partial<ParkTicket>) => Promise<ParkTicket>;
}

const EXCHANGE_RATE = 36.5;

export const ParkPOSTaquillaModal: React.FC<ParkPOSTaquillaModalProps> = ({
  isOpen,
  onClose,
  onIssueTicket
}) => {
  const [guestName, setGuestName] = useState("");
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(1);
  const [hasBoatRide, setHasBoatRide] = useState(false);
  const [hasFoodPackage, setHasFoodPackage] = useState(false);
  const [vipAccess, setVipAccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"efectivo_usd" | "punto_de_venta" | "pago_movil" | "zelle">("punto_de_venta");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastIssued, setLastIssued] = useState<ParkTicket | null>(null);

  if (!isOpen) return null;

  // Calculo de precios en directo
  const priceAdult = 12; // $12 por adulto
  const priceChild = 6;  // $6 por niño
  const priceBoat = 8;   // $8 pase bote por persona
  const priceFood = 10;  // $10 combo comida por persona

  const totalPeople = adultsCount + childrenCount;
  const baseTotal = (adultsCount * priceAdult) + (childrenCount * priceChild);
  const boatTotal = hasBoatRide ? totalPeople * priceBoat : 0;
  const foodTotal = hasFoodPackage ? totalPeople * priceFood : 0;
  const vipTotal = vipAccess ? totalPeople * 15 : 0;

  const totalUsd = baseTotal + boatTotal + foodTotal + vipTotal;
  const totalBs = totalUsd * EXCHANGE_RATE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || totalPeople <= 0) return;

    setIsSubmitting(true);
    try {
      const ticket = await onIssueTicket({
        guest_name: guestName.trim(),
        adults_count: adultsCount,
        children_count: childrenCount,
        has_boat_ride: hasBoatRide,
        has_food_package: hasFoodPackage,
        vip_access: vipAccess,
        price_usd: totalUsd,
        price_bs: totalBs
      });
      
      setLastIssued(ticket);
      setGuestName("");
      setAdultsCount(2);
      setChildrenCount(1);
      setHasBoatRide(false);
      setHasFoodPackage(false);
      setVipAccess(false);
    } catch (err) {
      console.error("Error al emitir ticket POS:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-[#0e011f] border border-[#FF0096]/30 shadow-2xl shadow-[#FF0096]/10">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-[#1a0533] via-[#0e011f] to-[#1a0533]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF0096] flex items-center justify-center shadow-lg shadow-[#FF0096]/20">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Venta Rápida en Taquilla POS</h3>
              <p className="text-xs text-slate-400">Emisión de Pases y Brazaletes para Visitantes en Sitio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Éxito de Emisión Previa */}
          {lastIssued && (
            <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-100 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-sm">Brazalete Emitido: {lastIssued.ticket_code}</h4>
                  <p className="text-xs opacity-90">{lastIssued.guest_name} • {lastIssued.adults_count} Adultos, {lastIssued.children_count} Niños</p>
                </div>
              </div>
              <button
                onClick={() => setLastIssued(null)}
                className="text-xs px-3 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white"
              >
                Cerrar
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre del visitante */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Nombre del Titular / Responsables del Grupo
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Ej: Familia Ramírez / Carlos Silva"
                className="w-full bg-slate-900/90 border border-white/20 rounded-2xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[#FF0096] transition-all"
              />
            </div>

            {/* Selector Cantidad de Personas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Adultos */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="block font-bold text-white text-sm">Adultos ($12 c/u)</span>
                  <span className="text-[11px] text-slate-400">Pase general a piscinas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                    className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-white text-base">{adultsCount}</span>
                  <button
                    type="button"
                    onClick={() => setAdultsCount(adultsCount + 1)}
                    className="w-8 h-8 rounded-xl bg-[#00C8D4] text-white font-bold hover:opacity-90 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Niños */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="block font-bold text-white text-sm">Niños ($6 c/u)</span>
                  <span className="text-[11px] text-slate-400">Hasta 12 años cumplidos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                    className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-white text-base">{childrenCount}</span>
                  <button
                    type="button"
                    onClick={() => setChildrenCount(childrenCount + 1)}
                    className="w-8 h-8 rounded-xl bg-[#FF0096] text-white font-bold hover:opacity-90 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Extras Adicionales */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Paquetes Extras e Inclusiones
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setHasBoatRide(!hasBoatRide)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    hasBoatRide
                      ? "bg-[#00C8D4]/20 border-[#00C8D4] text-white"
                      : "bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Ship className="w-5 h-5 text-[#00C8D4]" />
                    {hasBoatRide && <Check className="w-4 h-4 text-[#00C8D4]" />}
                  </div>
                  <span className="block font-bold text-xs">Paseos en Bote</span>
                  <span className="text-[10px] opacity-75">+$8 / persona</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHasFoodPackage(!hasFoodPackage)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    hasFoodPackage
                      ? "bg-[#FF0096]/20 border-[#FF0096] text-white"
                      : "bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Utensils className="w-5 h-5 text-[#FF0096]" />
                    {hasFoodPackage && <Check className="w-4 h-4 text-[#FF0096]" />}
                  </div>
                  <span className="block font-bold text-xs">Combo Almuerzo</span>
                  <span className="text-[10px] opacity-75">+$10 / persona</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVipAccess(!vipAccess)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    vipAccess
                      ? "bg-amber-500/20 border-amber-500 text-white"
                      : "bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    {vipAccess && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <span className="block font-bold text-xs">Acceso Área VIP</span>
                  <span className="text-[10px] opacity-75">+$15 / persona</span>
                </button>
              </div>
            </div>

            {/* Métodos de Pago */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Método de Cobro
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
                {[
                  { id: "punto_de_venta", label: "Punto de Venta" },
                  { id: "efectivo_usd", label: "Efectivo USD" },
                  { id: "pago_movil", label: "Pago Móvil BS" },
                  { id: "zelle", label: "Zelle / Transfer" }
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all ${
                      paymentMethod === m.id
                        ? "bg-[#9B00CC] border-purple-400 text-white font-bold shadow-lg"
                        : "bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Total a Pagar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1a0533] to-[#0e011f] border border-white/15 flex items-center justify-between">
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase">Total a Cobrar</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-white">${totalUsd}</span>
                  <span className="text-xs text-slate-400">USD</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-xs font-semibold text-emerald-400">En Bolívares (BCV)</span>
                <span className="text-base font-bold text-white">
                  Bs. {totalBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Botón Acción */}
            <button
              type="submit"
              disabled={isSubmitting || !guestName.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF0096] via-[#9B00CC] to-[#00C8D4] text-white font-extrabold text-sm shadow-xl shadow-[#FF0096]/20 hover:opacity-95 disabled:opacity-50 transition-all uppercase tracking-wider flex items-center justify-center space-x-2"
            >
              <UserCheck className="w-5 h-5" />
              <span>EMITIR BRAZALETE Y REGISTRAR AFORO</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
