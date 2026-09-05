import React, { useState } from "react";
import { Award, Plus, DollarSign, Gift, CheckCircle2, Clock, FileText, Sparkles } from "lucide-react";
import type { CreatorDeal, DealType, DealStatus } from "../../types/creatorInfluencer";

interface CreatorDealsManagerProps {
  deals: CreatorDeal[];
  onCreateDeal: (deal: Partial<CreatorDeal>) => Promise<CreatorDeal>;
}

const DEAL_TYPE_BADGES: { [key in DealType]: { label: string; color: string } } = {
  monetario: { label: "💵 Pago Monetario", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  canje: { label: "🎁 Canje Hospedaje / Tour", color: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
  mixto: { label: "⚡ Acuerdo Mixto", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" }
};

export const CreatorDealsManager: React.FC<CreatorDealsManagerProps> = ({
  deals,
  onCreateDeal
}) => {
  const [brandName, setBrandName] = useState("");
  const [dealType, setDealType] = useState<DealType>("mixto");
  const [monetaryUsd, setMonetaryUsd] = useState("500");
  const [barterValueUsd, setBarterValueUsd] = useState("400");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;

    await onCreateDeal({
      brand_name: brandName.trim(),
      deal_type: dealType,
      monetary_usd: parseFloat(monetaryUsd) || 0,
      barter_value_usd: parseFloat(barterValueUsd) || 0,
      notes: notes.trim()
    });

    setBrandName("");
    setNotes("");
  };

  return (
    <div className="rounded-3xl bg-[#1a0533]/80 border border-white/10 p-6 shadow-2xl backdrop-blur-md mb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#9B00CC] flex items-center justify-center shadow-lg shadow-[#9B00CC]/20">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Gestor de Acuerdos de Marca & Media Kit</h3>
            <p className="text-xs text-slate-400">Control de patrocinios monetarios, canjes de posadas y cobro de honorarios</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* FORMULARIO NUEVO CONTRATO / CANJE (Col 5) */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 bg-slate-900/70 p-5 rounded-2xl border border-white/10 space-y-4">
          <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center">
            <Plus className="w-4 h-4 text-[#9B00CC] mr-1.5" /> Registrar Acuerdo Comerciales / Canje
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Marca o Posada Colaboradora
            </label>
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Ej: Posada VIP Gran Sabana Lodge"
              className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-[#9B00CC]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Tipo de Acuerdo
            </label>
            <select
              value={dealType}
              onChange={(e) => setDealType(e.target.value as DealType)}
              className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 px-3 text-white text-xs font-bold"
            >
              <option value="monetario">💵 Pago Monetario en Divisas</option>
              <option value="canje">🎁 Canje (Hospedaje / Comida / Tour)</option>
              <option value="mixto">⚡ Acuerdo Mixto (Pago + Canje)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Pago Monetario ($)</label>
              <input
                type="number"
                value={monetaryUsd}
                onChange={(e) => setMonetaryUsd(e.target.value)}
                placeholder="500"
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Valor Canje ($)</label>
              <input
                type="number"
                value={barterValueUsd}
                onChange={(e) => setBarterValueUsd(e.target.value)}
                placeholder="400"
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Detalles del Acuerdo & Compromisos
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: 3 Noches de hospedaje suite a cambio de 1 Reel 4K y 1 Reseña HDV..."
              className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-[#9B00CC]"
            />
          </div>

          <button
            type="submit"
            disabled={!brandName.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#9B00CC] via-[#FF0096] to-[#00C8D4] text-white font-extrabold text-xs shadow-lg hover:opacity-95 disabled:opacity-50 transition-all uppercase tracking-wider"
          >
            REGISTRAR ACUERDO DE MARCA
          </button>
        </form>

        {/* LISTADO DE ACUERDOS ACTIVOS (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center">
            <Award className="w-4 h-4 text-emerald-400 mr-1.5" /> Alianzas Comerciales Activas ({deals.length})
          </h4>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {deals.map((deal) => {
              const badge = DEAL_TYPE_BADGES[deal.deal_type];

              return (
                <div
                  key={deal.id}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2 hover:border-[#9B00CC]/40 transition-all text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block mb-1 ${badge.color}`}>
                        {badge.label}
                      </span>
                      <h5 className="font-extrabold text-white text-sm">{deal.brand_name}</h5>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-emerald-400 block">${deal.monetary_usd} USD</span>
                      {deal.barter_value_usd > 0 && (
                        <span className="text-[10px] text-purple-300 font-semibold block">+${deal.barter_value_usd} en Canje</span>
                      )}
                    </div>
                  </div>

                  {deal.notes && (
                    <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 text-slate-300 text-[11px]">
                      {deal.notes}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
                    <span className="text-slate-400">Estado de Pago:</span>
                    <span className={`font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                      deal.status === "por_cobrar"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}>
                      {deal.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
