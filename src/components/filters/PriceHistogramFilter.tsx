import React, { useMemo } from "react";
import { DollarSign, BarChart2, TrendingUp, Sparkles, RefreshCw } from "lucide-react";
import { Establishment, getVirtualPrice } from "../layout/EstablishmentCard";

interface PriceHistogramFilterProps {
  establishments: Establishment[];
  minPrice: number;
  maxPrice: number;
  setMinPrice: (val: number) => void;
  setMaxPrice: (val: number) => void;
}

export function PriceHistogramFilter({
  establishments,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice
}: PriceHistogramFilterProps) {
  // Calculamos los precios reales/virtuales de todo el catálogo
  const prices = useMemo(() => {
    return establishments.map(est => getVirtualPrice(est));
  }, [establishments]);

  const minAvailable = useMemo(() => (prices.length ? Math.min(...prices) : 20), [prices]);
  const maxAvailable = useMemo(() => (prices.length ? Math.max(...prices) : 600), [prices]);

  const avgPrice = useMemo(() => {
    if (!prices.length) return 0;
    const sum = prices.reduce((acc, p) => acc + p, 0);
    return Math.round(sum / prices.length);
  }, [prices]);

  // Construir 12 barras de histograma entre $0 y $600+
  const histogramBins = useMemo(() => {
    const binCount = 12;
    const maxLimit = Math.max(maxAvailable, 500);
    const binWidth = Math.ceil(maxLimit / binCount);

    const bins = Array.from({ length: binCount }, (_, i) => {
      const start = i * binWidth;
      const end = (i + 1) * binWidth;
      return {
        start,
        end,
        count: 0,
        label: `$${start} - $${end}`
      };
    });

    prices.forEach(price => {
      const index = Math.min(Math.floor(price / binWidth), binCount - 1);
      if (bins[index]) {
        bins[index].count += 1;
      }
    });

    const maxCount = Math.max(...bins.map(b => b.count), 1);
    return bins.map(bin => ({
      ...bin,
      heightPercent: Math.max((bin.count / maxCount) * 100, 8)
    }));
  }, [prices, maxAvailable]);

  // Cuántos establecimientos caen dentro del rango actual [minPrice, maxPrice]
  const countInRange = useMemo(() => {
    return prices.filter(p => p >= minPrice && p <= maxPrice).length;
  }, [prices, minPrice, maxPrice]);

  const setPreset = (min: number, max: number) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-[#1a0533] to-[#0e011f] p-4 sm:p-5 rounded-2xl border border-purple-500/20 text-white shadow-xl space-y-4">
      {/* Header con Título e Icono */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#00C8D4]/20 border border-[#00C8D4]/40 flex items-center justify-center text-[#00C8D4]">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black tracking-wider uppercase text-white font-sans">
              Estadística & Rango de Precio
            </h4>
            <p className="text-[10px] text-slate-300 font-medium">Distribución interactiva en dólares ($ / noche)</p>
          </div>
        </div>

        {(minPrice > 0 || maxPrice < 1000) && (
          <button
            type="button"
            onClick={() => setPreset(0, 1000)}
            className="flex items-center gap-1 text-[10px] font-bold text-[#00C8D4] hover:text-white transition-colors cursor-pointer bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md border border-[#00C8D4]/30"
            title="Restablecer precio"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Tarjetas de Métricas de Estadística */}
      <div className="grid grid-cols-3 gap-2 text-center bg-white/5 p-2.5 rounded-xl border border-white/10">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Promedio</span>
          <span className="text-xs font-black text-[#00C8D4]">${avgPrice}</span>
          <span className="text-[8px] text-slate-400 block font-sans">/ noche</span>
        </div>
        <div className="border-x border-white/10">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">En Rango</span>
          <span className="text-xs font-black text-[#FF0096]">{countInRange}</span>
          <span className="text-[8px] text-slate-400 block font-sans">opciones</span>
        </div>
        <div>
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Mín - Máx</span>
          <span className="text-xs font-black text-amber-300">${minAvailable} - ${maxAvailable}</span>
          <span className="text-[8px] text-slate-400 block font-sans">disponibles</span>
        </div>
      </div>

      {/* Histograma Visual de Barras */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-end justify-between gap-1 h-20 px-1 pt-2 pb-1 bg-black/30 rounded-xl border border-white/5">
          {histogramBins.map((bin, idx) => {
            const inRange = bin.end >= minPrice && bin.start <= maxPrice && bin.count > 0;
            return (
              <div
                key={idx}
                onClick={() => setPreset(bin.start, bin.end)}
                className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
              >
                {/* Tooltip Hover */}
                <div className="absolute -top-9 hidden group-hover:flex flex-col items-center z-30 pointer-events-none whitespace-nowrap">
                  <div className="bg-slate-900 text-white text-[9px] font-extrabold px-2 py-1 rounded-md border border-[#00C8D4]/40 shadow-lg">
                    {bin.count} {bin.count === 1 ? "opción" : "opciones"} ({bin.label})
                  </div>
                  <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mt-1 border-r border-b border-[#00C8D4]/40"></div>
                </div>

                {/* Barra */}
                <div
                  style={{ height: `${bin.heightPercent}%` }}
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    inRange
                      ? "bg-gradient-to-t from-[#00C8D4] via-[#9B00CC] to-[#FF0096] shadow-sm shadow-[#00C8D4]/50 group-hover:brightness-125"
                      : "bg-slate-700/50 group-hover:bg-slate-600"
                  }`}
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-between text-[9px] font-bold text-slate-400 px-1">
          <span>$0</span>
          <span>$150</span>
          <span>$300</span>
          <span>$450+</span>
        </div>
      </div>

      {/* Inputs Numéricos de Rango Mín y Máx */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-black">$</span>
            <input
              type="number"
              min={0}
              placeholder="Mín"
              value={minPrice || ""}
              onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-7 pr-2 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#00C8D4] focus:ring-1 focus:ring-[#00C8D4]"
            />
          </div>
          <span className="text-slate-400 font-bold text-xs">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-black">$</span>
            <input
              type="number"
              min={0}
              placeholder="Máx"
              value={maxPrice || ""}
              onChange={(e) => setMaxPrice(Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-7 pr-2 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#FF0096] focus:ring-1 focus:ring-[#FF0096]"
            />
          </div>
        </div>

        {/* Presets Rápidos */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {[
            { label: "Económico", min: 0, max: 50, icon: "💡" },
            { label: "Moderado", min: 50, max: 120, icon: "⭐" },
            { label: "Premium", min: 120, max: 250, icon: "💎" },
            { label: "Lujo", min: 250, max: 1000, icon: "👑" }
          ].map(preset => {
            const isSelected = minPrice === preset.min && maxPrice === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => setPreset(preset.min, preset.max)}
                className={`py-1.5 px-1 rounded-xl text-[9px] font-black uppercase transition-all cursor-pointer border text-center ${
                  isSelected
                    ? "bg-[#FF0096] text-white border-[#FF0096] shadow-md shadow-[#FF0096]/30 scale-[1.02]"
                    : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="block text-[10px]">{preset.icon}</span>
                <span className="truncate block mt-0.5">{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
