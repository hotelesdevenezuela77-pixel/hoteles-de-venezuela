import React, { useState } from "react";
import { Wallet, Plus, DollarSign, FileText, AlertTriangle, CheckCircle, Tag } from "lucide-react";
import type { ParkExpense, ExpenseCategory } from "../../types/parkComplex";

interface ParkExpensesModuleProps {
  expenses: ParkExpense[];
  onAddExpense: (expense: Partial<ParkExpense>) => void;
}

const CATEGORY_LABELS: { [key in ExpenseCategory]: { label: string; icon: string; color: string } } = {
  cloro_quimicos: { label: "🧪 Químicos & Cloro Piscinas", icon: "Flask", color: "bg-sky-500/20 text-sky-300 border-sky-500/40" },
  combustible_botes: { label: "⛽ Combustible Lago Botes", icon: "Fuel", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  insumos_cocina: { label: "🥦 Insumos Cocina & Bar", icon: "Utensils", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  reparaciones: { label: "🔧 Reparaciones & Repuestos", icon: "Wrench", color: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
  caja_chica: { label: "💸 Caja Chica & Imprevistos", icon: "Wallet", color: "bg-pink-500/20 text-pink-300 border-pink-500/40" },
  otro: { label: "📦 Otros Gastos Operativos", icon: "Package", color: "bg-slate-500/20 text-slate-300 border-slate-500/40" }
};

export const ParkExpensesModule: React.FC<ParkExpensesModuleProps> = ({
  expenses,
  onAddExpense
}) => {
  const [category, setCategory] = useState<ExpenseCategory>("cloro_quimicos");
  const [description, setDescription] = useState("");
  const [amountUsd, setAmountUsd] = useState<string>("");
  const [loggedBy, setLoggedBy] = useState("Ing. Operaciones");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountUsd);
    if (!description.trim() || isNaN(val) || val <= 0) return;

    onAddExpense({
      category,
      description: description.trim(),
      amount_usd: val,
      logged_by: loggedBy.trim() || "Administración"
    });

    setDescription("");
    setAmountUsd("");
  };

  const totalExpensesUsd = expenses.reduce((acc, e) => acc + (e.amount_usd || 0), 0);

  return (
    <div className="rounded-3xl bg-[#1a0533]/80 border border-white/10 p-6 shadow-2xl backdrop-blur-md mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-5 mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Módulo de Gastos Operativos Inmediatos</h3>
            <p className="text-xs text-slate-400">Carga de egresos de la jornada con afectación directa al balance neto</p>
          </div>
        </div>

        <div className="bg-red-950/40 border border-red-500/30 px-4 py-2 rounded-2xl flex items-center space-x-3">
          <span className="text-xs font-semibold text-red-300">Total Egresos Hoy:</span>
          <span className="text-xl font-extrabold text-red-400">-${totalExpensesUsd} USD</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Formulario de Carga (Col 6) */}
        <form onSubmit={handleSubmit} className="lg:col-span-6 bg-slate-900/70 p-5 rounded-2xl border border-white/10 space-y-4">
          <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center">
            <Plus className="w-4 h-4 text-red-400 mr-1.5" /> Cargar Nuevo Gasto Inmediato
          </h4>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Categoría del Gasto:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-red-500"
            >
              {Object.entries(CATEGORY_LABELS).map(([catKey, catVal]) => (
                <option key={catKey} value={catKey}>
                  {catVal.label}
                </option>
              ))}
            </select>
          </div>

          {/* Motivo / Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Descripción / Motivo del Egreso:
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Compra de 50kg Cloro 90% para piscinas 1 y 2"
              className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Monto y Responsable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Monto en USD ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amountUsd}
                onChange={(e) => setAmountUsd(e.target.value)}
                placeholder="Ej: 120.00"
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 px-3 text-white text-xs font-bold focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Autorizado Por:
              </label>
              <input
                type="text"
                value={loggedBy}
                onChange={(e) => setLoggedBy(e.target.value)}
                placeholder="Ej: Gerencia General"
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!description.trim() || !amountUsd}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-extrabold text-xs shadow-lg hover:opacity-95 disabled:opacity-50 transition-all uppercase tracking-wider"
          >
            REGISTRAR EGRESO Y AFECTAR CAJA
          </button>
        </form>

        {/* Historial de Gastos Recientes (Col 6) */}
        <div className="lg:col-span-6 space-y-4">
          <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center">
            <FileText className="w-4 h-4 text-red-400 mr-1.5" /> Historial de Egresos de la Jornada
          </h4>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {expenses.map((exp) => {
              const catInfo = CATEGORY_LABELS[exp.category] || CATEGORY_LABELS.otro;

              return (
                <div
                  key={exp.id}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 text-xs flex items-center justify-between hover:border-red-500/30 transition-all"
                >
                  <div className="space-y-1 max-w-[70%]">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${catInfo.color}`}>
                      {catInfo.label}
                    </span>
                    <p className="font-bold text-white text-xs leading-snug">{exp.description}</p>
                    <span className="text-[10px] text-slate-400 block">Autorizado por: {exp.logged_by}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-red-400">-${exp.amount_usd} USD</span>
                    <span className="block text-[10px] text-slate-400">
                      {new Date(exp.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
