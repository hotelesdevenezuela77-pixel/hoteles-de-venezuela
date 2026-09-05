import React, { useState } from "react";
import { Package, Plus, DollarSign, Percent, Sparkles, CheckCircle2, Tag, Layers, Share2 } from "lucide-react";
import type { AgencyPackage, ServiceType } from "../../types/agencyTourOperator";

interface AgencyPackagingEngineProps {
  packages?: AgencyPackage[];
  onCreatePackage: (pkg: Partial<AgencyPackage>) => void;
}

const SERVICE_TYPE_LABELS: { [key in ServiceType]: string } = {
  hospedaje: "🏨 Hospedaje / Posada",
  transporte_terrestre: "🚌 Transporte Terrestre Privado",
  lancha_maritimo: "🚤 Peñero / Lancha Rápida",
  vuelo_charter: "✈️ Vuelo Charter Privado",
  guia: "🤠 Guía Turístico Certificado",
  alimentacion: "🍽️ Pensión Completa / Comidas",
  entradas_parque: "🎟️ Entradas a Parques Nacionales"
};

export const AgencyPackagingEngine: React.FC<AgencyPackagingEngineProps> = ({
  packages = [],
  onCreatePackage
}) => {
  const safePackages = packages || [];
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("Archipiélago Los Roques");
  const [durationDays, setDurationDays] = useState(3);
  const [durationNights, setDurationNights] = useState(2);
  const [netCostUsd, setNetCostUsd] = useState<string>("500");
  const [markupPercentage, setMarkupPercentage] = useState<number>(25);
  const [minPassengers, setMinPassengers] = useState(2);
  const [inclusionsText, setInclusionsText] = useState("Hospedaje VIP, Traslados en Lancha, Cavas de Hielo y Sombrilla");

  // Calculadora en directo
  const net = parseFloat(netCostUsd) || 0;
  const markupAmount = net * (markupPercentage / 100);
  const calculatedPriceUsd = Math.round(net + markupAmount);
  const calculatedPriceBs = calculatedPriceUsd * 36.5;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || net <= 0) return;

    onCreatePackage({
      title: title.trim(),
      destination: destination.trim(),
      duration_days: durationDays,
      duration_nights: durationNights,
      net_cost_usd: net,
      markup_percentage: markupPercentage,
      price_per_person_usd: calculatedPriceUsd,
      min_passengers: minPassengers,
      inclusions: inclusionsText.split(",").map(s => s.trim()).filter(Boolean)
    });

    setTitle("");
    setNetCostUsd("500");
  };

  return (
    <div className="rounded-3xl bg-[#1a0533]/80 border border-white/10 p-6 shadow-2xl backdrop-blur-md mb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#00C8D4] flex items-center justify-center shadow-lg shadow-[#00C8D4]/20">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Creador de Paquetes & Calculadora de Markup</h3>
            <p className="text-xs text-slate-400">Ensamblador dinámico de productos turísticos multisericio</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* FORMULARIO DE ENSAMBLADO (Col 6) */}
        <form onSubmit={handleSubmit} className="lg:col-span-6 bg-slate-900/70 p-5 rounded-2xl border border-white/10 space-y-4">
          <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center">
            <Plus className="w-4 h-4 text-[#00C8D4] mr-1.5" /> Ensamblar Nuevo Paquete
          </h4>

          {/* Nombre y Destino */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Nombre Comercial del Paquete
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Escapada VIP Morrocoy 3D/2N"
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-[#00C8D4]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Destino Principal
              </label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Ej: Archipiélago Los Roques"
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-[#00C8D4]"
              />
            </div>
          </div>

          {/* Días / Noches y Mínimo Pasajeros */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Días</label>
              <input
                type="number"
                min="1"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Noches</label>
              <input
                type="number"
                min="0"
                value={durationNights}
                onChange={(e) => setDurationNights(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Min. Pax</label>
              <input
                type="number"
                min="1"
                value={minPassengers}
                onChange={(e) => setMinPassengers(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs font-bold"
              />
            </div>
          </div>

          {/* CALCULADORA DE MARKUP */}
          <div className="bg-black/40 p-4 rounded-2xl border border-white/10 space-y-3">
            <span className="block text-xs font-extrabold text-[#00C8D4] uppercase tracking-wider flex items-center">
              <Percent className="w-4 h-4 mr-1" /> Calculadora de Costos & Margen (Markup)
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 font-semibold mb-1">Costo Neto Proveedores ($)</label>
                <input
                  type="number"
                  step="1"
                  value={netCostUsd}
                  onChange={(e) => setNetCostUsd(e.target.value)}
                  placeholder="Ej: 500"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 font-semibold mb-1">Margen Agencia (Markup %)</label>
                <select
                  value={markupPercentage}
                  onChange={(e) => setMarkupPercentage(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs font-bold"
                >
                  <option value={15}>15% (Bajo)</option>
                  <option value={20}>20% (Estándar)</option>
                  <option value={25}>25% (Recomendado)</option>
                  <option value={30}>30% (Premium)</option>
                  <option value={35}>35% (Alta Temporada)</option>
                </select>
              </div>
            </div>

            {/* Resultado Tarifa Pública */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="block text-[10px] text-slate-400 font-semibold uppercase">Precio Venta p/p:</span>
                <span className="text-xl font-extrabold text-white">${calculatedPriceUsd} USD</span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-emerald-400 font-semibold">Ganancia Neta Agencia:</span>
                <span className="text-sm font-extrabold text-emerald-300">+${Math.round(markupAmount)} USD</span>
              </div>
            </div>
          </div>

          {/* Inclusiones */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Inclusiones Principales (Separar por comas)
            </label>
            <input
              type="text"
              value={inclusionsText}
              onChange={(e) => setInclusionsText(e.target.value)}
              className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-[#00C8D4]"
            />
          </div>

          <button
            type="submit"
            disabled={!title.trim() || net <= 0}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00C8D4] via-[#9B00CC] to-[#FF0096] text-white font-extrabold text-xs shadow-lg hover:opacity-95 disabled:opacity-50 transition-all uppercase tracking-wider"
          >
            GUARDAR Y PUBLICAR PAQUETE
          </button>
        </form>

        {/* CATÁLOGO DE PAQUETES ACTIVOS (Col 6) */}
        <div className="lg:col-span-6 space-y-4">
          <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center">
            <Layers className="w-4 h-4 text-[#FF0096] mr-1.5" /> Catálogo de Paquetes Activos ({safePackages.length})
          </h4>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {safePackages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2 hover:border-[#00C8D4]/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#00C8D4] font-bold uppercase">{pkg.destination}</span>
                    <h5 className="font-bold text-white text-sm leading-snug">{pkg.title}</h5>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#FF0096]/20 border border-[#FF0096]/40 text-[#FF0096] font-extrabold text-[11px] shrink-0">
                    ${pkg.price_per_person_usd} p/p
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                  <span>⏱️ {pkg.duration_days} Días / {pkg.duration_nights} Noches</span>
                  <span>👥 Mínimo {pkg.min_passengers} pax</span>
                  <span className="text-emerald-400 font-bold">Markup: {pkg.markup_percentage}%</span>
                </div>

                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 text-[11px] text-slate-300">
                  <span className="block text-[10px] opacity-70 font-semibold uppercase mb-1">Incluye:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {pkg.inclusions.map((inc, idx) => (
                      <li key={idx} className="truncate">{inc}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
