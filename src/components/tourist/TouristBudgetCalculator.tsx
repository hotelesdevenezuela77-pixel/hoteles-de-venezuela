import React, { useState } from "react";
import { 
  Calculator, 
  DollarSign, 
  Users, 
  Luggage, 
  Utensils, 
  Compass, 
  Car, 
  Sparkles, 
  PieChart, 
  RefreshCw 
} from "lucide-react";

export function TouristBudgetCalculator() {
  const [numPeople, setNumPeople] = useState(2);
  const [numDays, setNumDays] = useState(4);
  
  // Gastos estimados por persona por día
  const [accommodationPerNight, setAccommodationPerNight] = useState(90);
  const [transportTotal, setTransportTotal] = useState(120);
  const [foodPerDay, setFoodPerDay] = useState(35);
  const [toursTotal, setToursTotal] = useState(150);
  const [extrasTotal, setExtrasTotal] = useState(50);

  const [currency, setCurrency] = useState<"USD" | "BS" | "EUR">("USD");
  const exchangeRateBS = 42; // Tasa referencial sim

  // Cálculos totales
  const totalAccommodation = accommodationPerNight * (numDays - 1);
  const totalFood = foodPerDay * numDays * numPeople;
  const totalTransport = transportTotal * numPeople;
  const totalTours = toursTotal * numPeople;
  const totalExtras = extrasTotal * numPeople;

  const grandTotalUSD = totalAccommodation + totalFood + totalTransport + totalTours + totalExtras;
  const perPersonUSD = Math.round(grandTotalUSD / Math.max(1, numPeople));

  const formatCurrency = (amountUSD: number) => {
    if (currency === "BS") {
      return `Bs. ${(amountUSD * 42).toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;
    }
    if (currency === "EUR") {
      return `€${(amountUSD * 0.92).toFixed(2)}`;
    }
    return `$${amountUSD.toLocaleString("en-US")} USD`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900">Calculadora de Presupuesto de Viaje</h2>
            <p className="text-xs text-slate-500">Proyecta y calcula de forma precisa tus gastos de alojamiento, comidas, transporte y tours.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setCurrency("USD")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${currency === "USD" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}
          >
            $ USD
          </button>
          <button
            onClick={() => setCurrency("BS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${currency === "BS" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}
          >
            Bs. VES
          </button>
          <button
            onClick={() => setCurrency("EUR")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${currency === "EUR" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}
          >
            € EUR
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Parámetros */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#00C8D4]" />
                Número de Viajeros
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={numPeople}
                onChange={e => setNumPeople(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Luggage className="w-4 h-4 text-[#FF0096]" />
                Duración del Viaje (Días)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={numDays}
                onChange={e => setNumDays(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF0096]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Desglose de Costos Estimados</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Alojamiento por noche ($ USD)</label>
                <input
                  type="number"
                  value={accommodationPerNight}
                  onChange={e => setAccommodationPerNight(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Transporte / Vuelo p/p ($ USD)</label>
                <input
                  type="number"
                  value={transportTotal}
                  onChange={e => setTransportTotal(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Comida diaria p/p ($ USD)</label>
                <input
                  type="number"
                  value={foodPerDay}
                  onChange={e => setFoodPerDay(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tours / Excursiones p/p ($ USD)</label>
                <input
                  type="number"
                  value={toursTotal}
                  onChange={e => setToursTotal(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fondo de Imprevistos / Compras p/p ($ USD)</label>
                <input
                  type="number"
                  value={extrasTotal}
                  onChange={e => setExtrasTotal(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00C8D4]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Resumen Total & Tarjeta de Totales */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-[#00C8D4]" />
                Resumen del Presupuesto
              </h3>
              <span className="text-[10px] text-slate-400">{numPeople} {numPeople === 1 ? "persona" : "personas"} / {numDays} días</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Alojamiento ({numDays - 1} noches):</span>
                <span className="font-bold text-white">{formatCurrency(totalAccommodation)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Alimentación ({numDays} días):</span>
                <span className="font-bold text-white">{formatCurrency(totalFood)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Transporte & Traslados:</span>
                <span className="font-bold text-white">{formatCurrency(totalTransport)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tours & Actividades:</span>
                <span className="font-bold text-white">{formatCurrency(totalTours)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Imprevistos / Extras:</span>
                <span className="font-bold text-white">{formatCurrency(totalExtras)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-400">Costo Total Estimado:</span>
              <span className="text-2xl font-black text-[#00C8D4]">{formatCurrency(grandTotalUSD)}</span>
            </div>

            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-slate-300">Estimado por Persona:</span>
              <span className="font-bold text-[#FF0096]">{formatCurrency(perPersonUSD)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
