import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Users,
  Building,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt,
  PiggyBank,
  Clock,
  ChevronRight,
} from "lucide-react";

interface FinanceStats {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  pendingReceivables: number;
  pendingPayables: number;
  occupancyRate: number;
  avgDailyRate: number;
  reservationsThisMonth: number;
}

interface RecentTransaction {
  id: number;
  type: "income" | "expense";
  description: string;
  amount: number;
  date: string;
  category: string;
}

interface CashFlowData {
  period: string;
  income: number;
  expenses: number;
}

type PeriodFilter = "day" | "month" | "year";

export default function FinanceDashboard() {
  const [period, setPeriod] = useState<PeriodFilter>("month");
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  useEffect(() => {
    fetchFinanceData();
  }, [period]);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/finance/dashboard?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentTransactions(data.recentTransactions || []);
        setCashFlowData(data.cashFlow || []);
        setExchangeRate(data.exchangeRate);
      }
    } catch (error) {
      console.error("Error fetching finance data:", error);
      // Set default empty stats
      setStats({
        totalIncome: 0,
        totalExpenses: 0,
        netCashFlow: 0,
        pendingReceivables: 0,
        pendingPayables: 0,
        occupancyRate: 0,
        avgDailyRate: 0,
        reservationsThisMonth: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getPeriodLabel = () => {
    switch (period) {
      case "day":
        return "Hoy";
      case "month":
        return "Este Mes";
      case "year":
        return "Este Año";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">
            Panel Financiero
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Control integral de finanzas y flujo de caja
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex bg-slate-100 rounded-xl p-1">
          {(["day", "month", "year"] as PeriodFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p
                  ? "bg-white text-cyan-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              {p === "day" ? "Día" : p === "month" ? "Mes" : "Año"}
            </button>
          ))}
        </div>
      </div>

      {/* Exchange Rate Banner */}
      {exchangeRate && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-700 font-medium">Tasa del Día</p>
              <p className="text-lg font-bold text-amber-800">
                1 USD = {exchangeRate.toLocaleString("es-VE")} Bs
              </p>
            </div>
          </div>
          <a
            href="/smarthecosystems/tasas"
            className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1"
          >
            Actualizar <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              Ingresos
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-slate-800">
              {formatCurrency(stats?.totalIncome || 0)}
            </p>
            <p className="text-sm text-slate-500 mt-1">{getPeriodLabel()}</p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
              <ArrowDownRight className="w-3 h-3" />
              Gastos
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-slate-800">
              {formatCurrency(stats?.totalExpenses || 0)}
            </p>
            <p className="text-sm text-slate-500 mt-1">{getPeriodLabel()}</p>
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              (stats?.netCashFlow || 0) >= 0 ? "bg-cyan-100" : "bg-orange-100"
            }`}>
              <Wallet className={`w-6 h-6 ${
                (stats?.netCashFlow || 0) >= 0 ? "text-cyan-600" : "text-orange-600"
              }`} />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              (stats?.netCashFlow || 0) >= 0 
                ? "text-cyan-600 bg-cyan-50" 
                : "text-orange-600 bg-orange-50"
            }`}>
              Flujo Neto
            </span>
          </div>
          <div className="mt-4">
            <p className={`text-2xl font-bold ${
              (stats?.netCashFlow || 0) >= 0 ? "text-cyan-600" : "text-orange-600"
            }`}>
              {formatCurrency(stats?.netCashFlow || 0)}
            </p>
            <p className="text-sm text-slate-500 mt-1">{getPeriodLabel()}</p>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              Ocupación
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-slate-800">
              {(stats?.occupancyRate || 0).toFixed(1)}%
            </p>
            <p className="text-sm text-slate-500 mt-1">20 habitaciones</p>
          </div>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Receivables */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-amber-700">
              {formatCurrency(stats?.pendingReceivables || 0)}
            </p>
            <p className="text-xs text-amber-600">Por Cobrar</p>
          </div>
        </div>

        {/* Pending Payables */}
        <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl border border-rose-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
            <Receipt className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-rose-700">
              {formatCurrency(stats?.pendingPayables || 0)}
            </p>
            <p className="text-xs text-rose-600">Por Pagar</p>
          </div>
        </div>

        {/* Average Daily Rate */}
        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl border border-cyan-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
            <PiggyBank className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-cyan-700">
              {formatCurrency(stats?.avgDailyRate || 0)}
            </p>
            <p className="text-xs text-cyan-600">Tarifa Promedio/Noche</p>
          </div>
        </div>

        {/* Reservations This Month */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-indigo-700">
              {stats?.reservationsThisMonth || 0}
            </p>
            <p className="text-xs text-indigo-600">Reservaciones</p>
          </div>
        </div>
      </div>

      {/* Cash Flow Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Visual */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Flujo de Caja</h3>
          
          {cashFlowData.length > 0 ? (
            <div className="space-y-3">
              {cashFlowData.map((data, index) => {
                const maxAmount = Math.max(
                  ...cashFlowData.map((d) => Math.max(d.income, d.expenses))
                );
                const incomeWidth = maxAmount > 0 ? (data.income / maxAmount) * 100 : 0;
                const expenseWidth = maxAmount > 0 ? (data.expenses / maxAmount) * 100 : 0;

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{data.period}</span>
                      <span className={`font-bold ${
                        data.income - data.expenses >= 0 ? "text-emerald-600" : "text-red-600"
                      }`}>
                        {formatCurrency(data.income - data.expenses)}
                      </span>
                    </div>
                    <div className="flex gap-2 h-6">
                      <div
                        className="bg-emerald-400 rounded-l-lg transition-all"
                        style={{ width: `${incomeWidth}%` }}
                        title={`Ingresos: ${formatCurrency(data.income)}`}
                      />
                      <div
                        className="bg-red-400 rounded-r-lg transition-all"
                        style={{ width: `${expenseWidth}%` }}
                        title={`Gastos: ${formatCurrency(data.expenses)}`}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded" />
                  <span className="text-xs text-slate-500">Ingresos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded" />
                  <span className="text-xs text-slate-500">Gastos</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No hay datos de flujo de caja para mostrar</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <a
              href="/smarthecosystems/finanzas/ingresos"
              className="flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-emerald-700">Registrar Pago</span>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="/smarthecosystems/finanzas/gastos"
              className="flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-700">Registrar Gasto</span>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="/smarthecosystems/finanzas/nomina"
              className="flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-700">Nómina</span>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="/smarthecosystems/finanzas/proveedores"
              className="flex items-center justify-between p-3 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-700">Proveedores</span>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="/smarthecosystems/finanzas/reportes"
              className="flex items-center justify-between p-3 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-cyan-600" />
                <span className="font-medium text-cyan-700">Reportes P&L</span>
              </div>
              <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Transacciones Recientes</h3>
        </div>
        
        {recentTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="p-4 hover:bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === "income" ? "bg-emerald-100" : "bg-red-100"
                  }`}>
                    {tx.type === "income" ? (
                      <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{tx.description}</p>
                    <p className="text-sm text-slate-500">
                      {tx.category} · {new Date(tx.date).toLocaleDateString("es-VE")}
                    </p>
                  </div>
                </div>
                <p className={`font-bold ${
                  tx.type === "income" ? "text-emerald-600" : "text-red-600"
                }`}>
                  {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">
            <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hay transacciones recientes</p>
            <p className="text-sm mt-1">Los pagos y gastos aparecerán aquí</p>
          </div>
        )}
      </div>

      {/* Footer Credit */}
      <div className="text-center py-6 border-t border-slate-200">
        <p className="text-slate-400 text-sm">
          Tecnología desarrollada por{" "}
          <span className="font-semibold text-slate-500">Webmasterpro Entertainment Corporation</span>
        </p>
        <p className="text-slate-400 text-sm">
          Smarth Eco Systems — <span className="text-cyan-600">Israel de Jesús</span>
        </p>
      </div>
    </div>
  );
}
