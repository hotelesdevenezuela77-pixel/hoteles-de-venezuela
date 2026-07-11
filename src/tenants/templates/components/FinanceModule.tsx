import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../lib/supabase";
import { 
  TrendingUp, TrendingDown, DollarSign, Plus, Trash2, 
  Loader2, ArrowUpRight, ArrowDownRight, Tag, Calendar
} from "lucide-react";

interface Transaction {
  id: string;
  establishment_id: number;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  created_at: string;
}

interface FinanceModuleProps {
  establishmentId: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export function FinanceModule({ establishmentId, primaryColor, secondaryColor, accentColor }: FinanceModuleProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para nueva transacción
  const [showAddForm, setShowAddForm] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Insumos");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const localKey = `hdv_finances_${establishmentId}`;

  // Cargar transacciones financieras (Supabase + Fallback LocalStorage)
  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("hotel_finance_transactions")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("created_at", { ascending: false });

      if (error || !data) throw new Error("Tabla no disponible");
      
      setTransactions(data);
      localStorage.setItem(localKey, JSON.stringify(data));
    } catch (e) {
      console.warn("[PMS Finanzas] Falló consulta remota, cargando de almacenamiento local seguro.");
      const localData = localStorage.getItem(localKey);
      if (localData) {
        setTransactions(JSON.parse(localData));
      } else {
        // Valores mock iniciales de prueba (para ver estadísticas)
        const mockTransactions: Transaction[] = [
          {
            id: "f1",
            establishment_id: establishmentId,
            type: "income",
            amount: 850.00,
            category: "Reservas",
            description: "Reserva Suite 204 - 3 noches (Google Pay)",
            created_at: new Date(Date.now() - 18000000).toISOString()
          },
          {
            id: "f2",
            establishment_id: establishmentId,
            type: "expense",
            amount: 320.00,
            category: "Nómina",
            description: "Pago día extra personal de limpieza",
            created_at: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: "f3",
            establishment_id: establishmentId,
            type: "income",
            amount: 120.00,
            category: "Club POS",
            description: "Consumo Restaurante Beach Club - Suite 102",
            created_at: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: "f4",
            establishment_id: establishmentId,
            type: "expense",
            amount: 150.00,
            category: "Mantenimiento",
            description: "Repuestos bomba de piscina de agua salada",
            created_at: new Date(Date.now() - 259200000).toISOString()
          }
        ];
        setTransactions(mockTransactions);
        localStorage.setItem(localKey, JSON.stringify(mockTransactions));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [establishmentId]);

  // Totales calculados en tiempo real
  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    
    transactions.forEach(t => {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    });
    
    return {
      income,
      expense,
      balance: income - expense
    };
  }, [transactions]);

  // Agregar Transacción
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    setIsSubmitting(true);
    const newTx: Transaction = {
      id: crypto.randomUUID(),
      establishment_id: establishmentId,
      type,
      amount: Number(amount),
      category,
      description: description || `Transacción de ${category}`,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from("hotel_finance_transactions").insert([newTx]);
      if (error) throw error;
      
      const updated = [newTx, ...transactions];
      setTransactions(updated);
      localStorage.setItem(localKey, JSON.stringify(updated));
    } catch (err) {
      console.warn("[PMS Finanzas] Guardando transacción en almacenamiento local:", err);
      const updated = [newTx, ...transactions];
      setTransactions(updated);
      localStorage.setItem(localKey, JSON.stringify(updated));
    } finally {
      setIsSubmitting(false);
      setShowAddForm(false);
      setAmount("");
      setDescription("");
      setCategory("Insumos");
    }
  };

  // Eliminar Transacción
  const handleDeleteTransaction = async (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    localStorage.setItem(localKey, JSON.stringify(updated));

    try {
      await supabase
        .from("hotel_finance_transactions")
        .delete()
        .eq("id", id)
        .eq("establishment_id", establishmentId);
    } catch (err) {
      console.warn("[PMS Finanzas] Falló borrado remoto de transacción.");
    }
  };

  return (
    <div className="bg-[#121620] border border-white/5 rounded-3xl p-6 shadow-xl space-y-6">
      
      {/* Header del Módulo */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-bold font-serif text-white tracking-wide">Cuentas y Control de Finanzas</h3>
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-0.5">PMS - Flujo de Caja Interno</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-[#0b0c10] transition-transform active:scale-97 cursor-pointer"
          style={{ backgroundColor: accentColor }}
        >
          <Plus className="w-4 h-4" /> Registrar Gasto/Ingreso
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950/30 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Ingresos Totales</span>
            <p className="text-lg font-black text-emerald-400 mt-1 font-mono">${summary.income.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        <div className="bg-slate-950/30 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Gastos / Egresos</span>
            <p className="text-lg font-black text-rose-400 mt-1 font-mono">${summary.expense.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl">
            <TrendingDown className="w-5 h-5 text-rose-500" />
          </div>
        </div>

        <div className="bg-slate-950/30 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Utilidad / Caja</span>
            <p className={`text-lg font-black mt-1 font-mono ${summary.balance >= 0 ? "text-[#00C8D4]" : "text-rose-500"}`}>
              ${summary.balance.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-[#00C8D4]/10 rounded-xl">
            <DollarSign className="w-5 h-5 text-[#00C8D4]" />
          </div>
        </div>
      </div>

      {/* Formulario de Transacción */}
      {showAddForm && (
        <form onSubmit={handleAddTransaction} className="bg-slate-950/40 border border-white/10 rounded-2xl p-5 space-y-4 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Tipo de Movimiento</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
              >
                <option value="expense" className="bg-[#121620]">Egreso / Gasto (Salida)</option>
                <option value="income" className="bg-[#121620]">Ingreso (Entrada)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Monto ($ USD)</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Categoría</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
              >
                {type === "expense" ? (
                  <>
                    <option value="Nómina" className="bg-[#121620]">Nómina / Sueldos</option>
                    <option value="Insumos" className="bg-[#121620]">Insumos / Alimentos</option>
                    <option value="Mantenimiento" className="bg-[#121620]">Mantenimiento</option>
                    <option value="Servicios" className="bg-[#121620]">Servicios (Agua/Luz/Net)</option>
                    <option value="Otros Gastos" className="bg-[#121620]">Otros Gastos</option>
                  </>
                ) : (
                  <>
                    <option value="Reservas" className="bg-[#121620]">Reservas Alojamiento</option>
                    <option value="Club POS" className="bg-[#121620]">Consumos POS / Restaurant</option>
                    <option value="Servicios VIP" className="bg-[#121620]">Servicios VIP</option>
                    <option value="Otros Ingresos" className="bg-[#121620]">Otros Ingresos</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[9px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Concepto / Descripción</label>
            <input
              type="text"
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ej: Pago de luz de la posada correspondiente a Julio"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-[#0b0c10] uppercase flex items-center gap-1.5 active:scale-97 cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Registrar Movimiento</span>
            </button>
          </div>
        </form>
      )}

      {/* Historial de Transacciones */}
      {loading ? (
        <div className="py-12 flex justify-center text-slate-500">
          <Loader2 className="w-6 h-6 text-[#00C8D4] animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-12 text-center text-slate-600 border border-dashed border-white/10 rounded-2xl">
          <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-20" />
          <p className="text-xs">No hay registros financieros para este establecimiento.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-slate-950/40 text-gray-500 font-bold uppercase tracking-wider border-b border-white/5">
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Concepto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4 text-center">Tipo</th>
                <th className="py-3 px-4 text-right">Monto</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-white/2 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      {new Date(t.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-white font-semibold">{t.description}</td>
                  <td className="py-3.5 px-4 text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#00C8D4]/60" />
                      {t.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider ${
                      t.type === "income" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    }`}>
                      {t.type === "income" ? "Ingreso" : "Egreso"}
                    </span>
                  </td>
                  <td className={`py-3.5 px-4 text-right font-mono font-bold text-xs ${
                    t.type === "income" ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteTransaction(t.id)}
                      className="p-1 hover:bg-rose-500/15 text-gray-500 hover:text-rose-500 rounded-lg transition-all cursor-pointer"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
