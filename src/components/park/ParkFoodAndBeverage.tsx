import React, { useState } from "react";
import { Utensils, Coffee, Plus, Check, Clock, MapPin, DollarSign, Send, ShoppingBag } from "lucide-react";
import type { ParkOrder, LocationType, ParkOrderItem } from "../../types/parkComplex";

interface ParkFoodAndBeverageProps {
  orders: ParkOrder[];
  onCreateOrder: (order: Partial<ParkOrder>) => void;
}

const MENU_ITEMS = [
  { id: "m1", name: "Combo Pescado Frito + Tobo Soles", priceUsd: 18, category: "comida" },
  { id: "m2", name: "Nuggets de Pollo Infantil + Papas", priceUsd: 8, category: "infantil" },
  { id: "m3", name: "Hamburguesa Doble de Carne + Refresco", priceUsd: 10, category: "comida" },
  { id: "m4", name: "Tobo de Cerveza Solera (6 unid)", priceUsd: 12, category: "bebidas" },
  { id: "m5", name: "Helado Barquilla Tropical", priceUsd: 3.5, category: "postres" },
  { id: "m6", name: "Refresco / Jugo Natural 600ml", priceUsd: 2, category: "bebidas" }
];

export const ParkFoodAndBeverage: React.FC<ParkFoodAndBeverageProps> = ({
  orders,
  onCreateOrder
}) => {
  const [locationType, setLocationType] = useState<LocationType>("toldo");
  const [locationIdentifier, setLocationIdentifier] = useState("Toldo #05");
  const [customerName, setCustomerName] = useState("");
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});

  const handleQuantityChange = (itemId: string, delta: number) => {
    setSelectedItems((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const calculateTotalUsd = () => {
    return Object.entries(selectedItems).reduce((sum, [itemId, qty]) => {
      const item = MENU_ITEMS.find((m) => m.id === itemId);
      return sum + (item ? item.priceUsd * qty : 0);
    }, 0);
  };

  const handleSendOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const totalUsd = calculateTotalUsd();
    if (totalUsd <= 0) return;

    const items: ParkOrderItem[] = Object.entries(selectedItems).map(([itemId, qty]) => {
      const item = MENU_ITEMS.find((m) => m.id === itemId)!;
      return {
        id: itemId,
        name: item.name,
        quantity: qty,
        unit_price_usd: item.priceUsd
      };
    });

    onCreateOrder({
      location_type: locationType,
      location_identifier: locationIdentifier.trim() || `${locationType.toUpperCase()} #1`,
      customer_name: customerName.trim() || "Visitante",
      items,
      total_usd: totalUsd
    });

    // Reset Form
    setSelectedItems({});
    setCustomerName("");
  };

  return (
    <div className="rounded-3xl bg-[#1a0533]/80 border border-white/10 p-6 shadow-2xl backdrop-blur-md mb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF0096] flex items-center justify-center shadow-lg shadow-[#FF0096]/20">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Alimentos & Bebidas (Comanda a Mesas/Toldos/Chozas)</h3>
            <p className="text-xs text-slate-400">Pedidos directos a cocina y barra del parque acuático</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* FORMULARIO DE NUEVA COMANDA (Col 7) */}
        <div className="lg:col-span-7 space-y-5">
          <form onSubmit={handleSendOrder} className="bg-slate-900/70 p-5 rounded-2xl border border-white/10 space-y-4">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center">
              <Plus className="w-4 h-4 text-[#FF0096] mr-1.5" /> Generar Nueva Comanda
            </h4>

            {/* Selector de Tipo de Ubicación */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Asociar Pedido a Ubicación en el Complejo:
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                {[
                  { id: "toldo", label: "☂️ Toldo" },
                  { id: "choza", label: "🏕️ Choza" },
                  { id: "mesa", label: "🍽️ Mesa" },
                  { id: "kiosco", label: "🥤 Kiosco" }
                ].map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      setLocationType(loc.id as LocationType);
                      setLocationIdentifier(`${loc.label.split(" ")[1]} #01`);
                    }}
                    className={`py-2 px-2 rounded-xl border transition-all text-center ${
                      locationType === loc.id
                        ? "bg-[#FF0096] border-[#FF0096] text-white shadow-lg shadow-[#FF0096]/20"
                        : "bg-slate-950/60 border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Número / Identificador y Nombre */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Identificador Ubicación</label>
                <input
                  type="text"
                  required
                  value={locationIdentifier}
                  onChange={(e) => setLocationIdentifier(e.target.value)}
                  placeholder="Ej: Toldo #12 / Choza VIP #04"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-[#FF0096]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nombre del Cliente / Garzón</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej: Familia Pérez"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-[#FF0096]"
                />
              </div>
            </div>

            {/* Menú de Selección */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Seleccionar Platillos y Bebidas:
              </label>
              <div className="space-y-2">
                {MENU_ITEMS.map((item) => {
                  const qty = selectedItems[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                        qty > 0 ? "bg-[#FF0096]/10 border-[#FF0096]/40 text-white" : "bg-slate-950/40 border-white/10 text-slate-300"
                      }`}
                    >
                      <div>
                        <span className="font-bold block">{item.name}</span>
                        <span className="text-[10px] text-slate-400">${item.priceUsd} USD</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-bold text-white text-sm">{qty}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-[#FF0096] text-white font-bold hover:opacity-90 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total y Botón Despachar */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="block text-[10px] text-slate-400 font-semibold uppercase">Total Comanda</span>
                <span className="text-2xl font-extrabold text-white">${calculateTotalUsd()} USD</span>
              </div>

              <button
                type="submit"
                disabled={calculateTotalUsd() <= 0}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white font-extrabold text-xs shadow-lg hover:opacity-95 disabled:opacity-50 transition-all flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>DESPACHAR A COCINA</span>
              </button>
            </div>
          </form>
        </div>

        {/* LISTADO DE COMANDAS ACTIVAS (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center">
            <Clock className="w-4 h-4 text-[#00C8D4] mr-1.5" /> Monitor de Comandas Activas
          </h4>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 text-xs space-y-2 hover:border-[#FF0096]/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#FF0096]">{ord.order_number}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    ord.status === "delivered"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : ord.status === "preparing"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                      : "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                  }`}>
                    {ord.status === "delivered" ? "Entregado" : ord.status === "preparing" ? "En Preparación" : "Pendiente"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-white">
                  <span className="font-bold flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-[#00C8D4] mr-1 inline" /> {ord.location_identifier}
                  </span>
                  <span className="text-slate-400 font-medium">{ord.customer_name}</span>
                </div>

                <div className="bg-black/30 p-2 rounded-xl text-[11px] space-y-1">
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-slate-300">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="font-bold">${it.unit_price_usd * it.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center font-bold text-white pt-1">
                  <span>Total:</span>
                  <span className="text-emerald-400 text-sm">${ord.total_usd} USD</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
