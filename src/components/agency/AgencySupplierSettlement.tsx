import React, { useState } from "react";
import { Wallet, AlertTriangle, CheckCircle2, DollarSign, FileText, Plus, ArrowUpRight, ShieldCheck, Tag } from "lucide-react";
import type { SupplierPayment, ExpeditionExpense, ExpenseCategory } from "../../types/agencyTourOperator";

interface AgencySupplierSettlementProps {
  supplierPayments?: SupplierPayment[];
  expeditionExpenses?: ExpeditionExpense[];
  onPaySupplier: (paymentId: string, bankRef: string) => void;
  onAddExpeditionExpense: (expense: Partial<ExpeditionExpense>) => void;
}

const CATEGORY_LABELS: { [key in ExpenseCategory]: string } = {
  combustible: "⛽ Combustible de vehículos / lanchas",
  propinas: "🤝 Propinas a tripulación / choferes",
  entradas_parques: "🎟️ Tasas Inparques / Impuestos",
  snacks_hidratacion: "🧊 Hielo, Bebidas & Snacks",
  peajes: "🚗 Peajes & Estacionamientos",
  imprevistos: "📦 Imprevistos de campo"
};

export const AgencySupplierSettlement: React.FC<AgencySupplierSettlementProps> = ({
  supplierPayments = [],
  expeditionExpenses = [],
  onPaySupplier,
  onAddExpeditionExpense
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"liquidaciones" | "gastos_campo">("liquidaciones");
  
  // State modal pago
  const [selectedPayId, setSelectedPayId] = useState<string | null>(null);
  const [bankRefInput, setBankRefInput] = useState("");

  // State gasto campo
  const [description, setDescription] = useState("");
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>("combustible");
  const [amountUsd, setAmountUsd] = useState("");
  const [loggedBy, setLoggedBy] = useState("Coordinador de Ruta");

  const safePayments = supplierPayments || [];
  const safeExpenses = expeditionExpenses || [];

  const pendingPayments = safePayments.filter((sp) => sp.status === "pending");
  const paidPayments = safePayments.filter((sp) => sp.status === "paid");

  const totalPendingUsd = pendingPayments.reduce((acc, sp) => acc + (sp.amount_usd || 0), 0);
  const totalExpensesUsd = safeExpenses.reduce((acc, exp) => acc + (exp.amount_usd || 0), 0);

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayId) return;

    onPaySupplier(selectedPayId, bankRefInput.trim() || `REF-${Math.floor(100000 + Math.random() * 900000)}`);
    setSelectedPayId(null);
    setBankRefInput("");
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountUsd);
    if (!description.trim() || isNaN(val) || val <= 0) return;

    onAddExpeditionExpense({
      description: description.trim(),
      category: expenseCategory,
      amount_usd: val,
      logged_by: loggedBy.trim()
    });

    setDescription("");
    setAmountUsd("");
  };

  return (
    <div className="rounded-3xl bg-[#1a0533]/80 border border-white/10 p-6 shadow-2xl backdrop-blur-md mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-5 mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Liquidaciones B2B & Libro de Gastos Operativos</h3>
            <p className="text-xs text-slate-400">Control de pagos a posadas, transportistas, lancheros y gastos de campo</p>
          </div>
        </div>

        {/* SubTab switcher */}
        <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveSubTab("liquidaciones")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 ${
              activeSubTab === "liquidaciones"
                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>LIQUIDACIONES A TERCEROS (${totalPendingUsd} PENDIENTES)</span>
          </button>

          <button
            onClick={() => setActiveSubTab("gastos_campo")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 ${
              activeSubTab === "gastos_campo"
                ? "bg-[#FF0096] text-white shadow-lg shadow-[#FF0096]/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>GASTOS DE EXPEDICIÓN (${totalExpensesUsd})</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: LIQUIDACIONES B2B */}
      {activeSubTab === "liquidaciones" && (
        <div className="space-y-6">
          
          {/* Modal Pago Rápido Inline */}
          {selectedPayId && (
            <form onSubmit={handleExecutePayment} className="bg-amber-950/60 border border-amber-500/50 p-4 rounded-2xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center">
                  <ShieldCheck className="w-4 h-4 text-amber-400 mr-1.5" /> Confirmar Liquidación a Proveedor
                </h4>
                <button
                  type="button"
                  onClick={() => setSelectedPayId(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Número de Referencia Bancaria / Transferencia</label>
                  <input
                    type="text"
                    required
                    value={bankRefInput}
                    onChange={(e) => setBankRefInput(e.target.value)}
                    placeholder="Ej: REF-984120031"
                    className="w-full bg-slate-950 border border-white/20 rounded-xl py-2 px-3 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-extrabold text-xs shadow-lg transition-all uppercase"
                  >
                    REGISTRAR PAGO Y LIQUIDAR
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Listado de Pagos Pendientes */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">
              Cuentas por Pagar a Proveedores ({pendingPayments.length} pendientes)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingPayments.map((sp) => {
                const deadlineMs = new Date(sp.payment_deadline).getTime();
                const isUrgent = deadlineMs <= Date.now() + 72 * 3600000;

                return (
                  <div
                    key={sp.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isUrgent
                        ? "bg-red-950/40 border-red-500/50 shadow-lg shadow-red-900/20"
                        : "bg-slate-900/70 border-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-amber-400">{sp.service_category.replace("_", " ")}</span>
                        <h5 className="font-bold text-white text-sm">{sp.provider_name}</h5>
                        <p className="text-[11px] text-slate-400">Reserva #{sp.quote_number}</p>
                      </div>

                      <span className="text-lg font-extrabold text-amber-400">
                        ${sp.amount_usd} USD
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                      <span className={isUrgent ? "text-red-300 font-bold animate-pulse" : "text-slate-400"}>
                        Deadline: {sp.payment_deadline}
                      </span>

                      <button
                        onClick={() => setSelectedPayId(sp.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-[11px] transition-all"
                      >
                        Liquidar Pago
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historial de Pagos Realizados */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <h4 className="font-extrabold text-slate-300 text-xs uppercase tracking-wider">
              Historial de Pagos Liquidados ({paidPayments.length})
            </h4>

            <div className="space-y-2">
              {paidPayments.map((sp) => (
                <div
                  key={sp.id}
                  className="p-3 rounded-xl bg-slate-950/50 border border-emerald-500/30 flex items-center justify-between text-xs text-slate-200"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white">{sp.provider_name}</span>
                      <span className="text-[10px] text-slate-400 block">Ref: {sp.bank_reference}</span>
                    </div>
                  </div>

                  <span className="font-bold text-emerald-400">${sp.amount_usd} USD</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 2: GASTOS DE EXPEDICIÓN */}
      {activeSubTab === "gastos_campo" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <form onSubmit={handleAddExpense} className="lg:col-span-6 bg-slate-900/70 p-5 rounded-2xl border border-white/10 space-y-4">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center">
              <Plus className="w-4 h-4 text-[#FF0096] mr-1.5" /> Registrar Gasto Logístico de Campo
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Categoría del Gasto
              </label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-[#FF0096]"
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
                placeholder="Ej: Carga de 40L combustible lancha"
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-[#FF0096]"
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
                  placeholder="Ej: 40.00"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 px-3 text-white text-xs font-bold focus:outline-none focus:border-[#FF0096]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Responsable de Campo
                </label>
                <input
                  type="text"
                  value={loggedBy}
                  onChange={(e) => setLoggedBy(e.target.value)}
                  placeholder="Ej: Guía de Ruta"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-[#FF0096]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!description.trim() || !amountUsd}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white font-extrabold text-xs shadow-lg hover:opacity-95 disabled:opacity-50 transition-all uppercase tracking-wider"
            >
              ASENTAR GASTO DE CAMPO
            </button>
          </form>

          <div className="lg:col-span-6 space-y-4">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center">
              <FileText className="w-4 h-4 text-[#FF0096] mr-1.5" /> Historial de Egresos de Expedición
            </h4>

            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {safeExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 text-xs flex items-center justify-between hover:border-[#FF0096]/30 transition-all"
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
      )}

    </div>
  );
};
