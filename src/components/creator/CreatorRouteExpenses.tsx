import React, { useState } from "react";
import { Wallet, Plus, DollarSign, FileText, Fuel, Car, Utensils, Wrench } from "lucide-react";
import type { CreatorRouteExpense, RouteExpenseCategory } from "../../types/creatorInfluencer";


interface CreatorRouteExpensesProps {
  expenses: CreatorRouteExpense[];
  onAddExpense: (expense: Partial<CreatorRouteExpense>) => void;
}

const CATEGORY_LABELS: { [key in RouteExpenseCategory]: string } = {
  combustible: "⛽ Combustible 4x4 / Lancha",
  peajes: "🚗 Peajes & Estacionamientos",
  lancheros: "🚤 Pagos Lancheros / Guías",
  comidas: "🍽️ Alimentos & Hidratación Ruta",
  reparaciones: "🔧 Reparaciones Mecánicas",
  propinas: "🤝 Propinas de Carretera",
  otros: "📦 Gastos Varios"
};

export const CreatorRouteExpenses: React.FC<CreatorRouteExpensesProps> = ({
  expenses,
  onAddExpense
}) => {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<RouteExpenseCategory>("combustible");
  const [amountUsd, setAmountUsd] = useState("");
  const [loggedBy, setLoggedBy] = useState("Creador");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountUsd);
    if (!description.trim() || isNaN(val) || val <= 0) return;

    onAddExpense({
      description: description.trim(),
      category,
      amount_usd: val,
      logged_by: loggedBy.trim()
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
            <h3 className="text-lg font-extrabold text-white">Libro de Caja & Gastos de Carretera</h3>
            <p className="text-xs text-slate-400">Cuadre financiero inmediato de desembolsos por expedición</p>
          </div>
        </div>

        <div className="bg-red-950/40 border border-red-500/30 px-4 py-2 rounded-2xl flex items-center space-x-3">
          <span className="text-xs font-semibold text-red-300">Total Egresos Ruta:</span>
          <span className="text-xl font-extrabold text-red-400">-${totalExpensesUsd} USD</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Formulario Cargar Gasto (Col 6) */}
        <form onSubmit={handleSubmit} className="lg:col-span-6 bg-slate-900/70 p-5 rounded-2xl border border-white/10 space-y-4">
          <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center">
            <Plus className="w-4 h-4 text-red-400 mr-1.5" /> Registrar Gasto de Expedición
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Categoría del Gasto
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as RouteExpenseCategory)}
              className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-red-500"
            >
              {Object.entries(CATEGORY_LABELS).map(([catKey, catVal]) => (
                <option key={catKey} value={catKey}>
                  {catVal}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Descripción del Egreso
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Combustible 100L en Estación Gran Sabana"
              className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Monto USD ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amountUsd}
                onChange={(e) => setAmountUsd(e.target.value)}
                placeholder="Ej: 45.00"
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 px-3 text-white text-xs font-bold focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Registrado Por
              </label>
              <input
                type="text"
                value={loggedBy}
                onChange={(e) => setLoggedBy(e.target.value)}
                placeholder="Ej: Creador"
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

        {/* Historial Egresos (Col 6) */}
        <div className="lg:col-span-6 space-y-4">
          <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center">
            <FileText className="w-4 h-4 text-red-400 mr-1.5" /> Historial de Egresos de Carretera
          </h4>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 text-xs flex items-center justify-between hover:border-red-500/30 transition-all"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">{CATEGORY_LABELS[exp.category]}</span>
                  <p className="font-bold text-white leading-snug">{exp.description}</p>
                  <span className="text-[10px] text-slate-400">Por: {exp.logged_by}</span>
                </div>

                <span className="text-base font-extrabold text-red-400 shrink-0">
                  -${exp.amount_usd} USD
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
