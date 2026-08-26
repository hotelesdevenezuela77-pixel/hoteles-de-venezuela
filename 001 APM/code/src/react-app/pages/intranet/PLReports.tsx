import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

interface FinanceSummary {
  income: number;
  expenses: number;
  payroll: number;
  receivables_pending: number;
  net_profit: number;
}

interface CategoryBreakdown {
  name: string;
  amount: number;
  percentage: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export default function PLReports() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState<FinanceSummary>({
    income: 0,
    expenses: 0,
    payroll: 0,
    receivables_pending: 0,
    net_profit: 0,
  });
  const [incomeBreakdown, setIncomeBreakdown] = useState<CategoryBreakdown[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<CategoryBreakdown[]>([]);
  const [, setMonthlyData] = useState<MonthlyData[]>([]);
  const [exchangeRate, setExchangeRate] = useState(45);

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear, period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, rateRes] = await Promise.all([
        fetch(`/api/finance/pl-report?month=${selectedMonth}&year=${selectedYear}&period=${period}`),
        fetch("/api/finance/exchange-rate"),
      ]);

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data.summary || {
          income: 0,
          expenses: 0,
          payroll: 0,
          receivables_pending: 0,
          net_profit: 0,
        });
        setIncomeBreakdown(data.income_breakdown || []);
        setExpenseBreakdown(data.expense_breakdown || []);
        setMonthlyData(data.monthly_data || []);
      }

      if (rateRes.ok) {
        const data = await rateRes.json();
        setExchangeRate(data.rate || 45);
      }
    } catch (error) {
      console.error("Error fetching P&L data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;
  };

  const formatBs = (amount: number) => {
    return `Bs. ${(amount * exchangeRate).toLocaleString("es-VE", { minimumFractionDigits: 0 })}`;
  };

  const getProfitIndicator = (value: number) => {
    if (value > 0) return { icon: ArrowUpRight, color: "text-green-500", bg: "bg-green-100" };
    if (value < 0) return { icon: ArrowDownRight, color: "text-red-500", bg: "bg-red-100" };
    return { icon: Minus, color: "text-slate-500", bg: "bg-slate-100" };
  };

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const profitMargin = summary.income > 0 ? (summary.net_profit / summary.income) * 100 : 0;
  const indicator = getProfitIndicator(summary.net_profit);
  const IndicatorIcon = indicator.icon;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Estado de Pérdidas y Ganancias</h1>
          <p className="text-slate-500">Análisis financiero y rentabilidad</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:from-cyan-600 hover:to-teal-600 transition-all">
          <Download className="w-5 h-5" />
          Exportar PDF
        </button>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-600">Período:</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod("month")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === "month" 
                  ? "bg-cyan-500 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setPeriod("quarter")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === "quarter" 
                  ? "bg-cyan-500 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Trimestral
            </button>
            <button
              onClick={() => setPeriod("year")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === "year" 
                  ? "bg-cyan-500 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Anual
            </button>
          </div>
          
          {period === "month" && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
            >
              {months.map((month, i) => (
                <option key={i} value={i + 1}>{month}</option>
              ))}
            </select>
          )}
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
          >
            {[2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Ingresos Totales</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(summary.income)}</p>
              <p className="text-green-200 text-sm">{formatBs(summary.income)}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Gastos Totales</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(summary.expenses + summary.payroll)}</p>
              <p className="text-red-200 text-sm">{formatBs(summary.expenses + summary.payroll)}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className={`bg-gradient-to-br ${summary.net_profit >= 0 ? 'from-cyan-500 to-blue-600' : 'from-amber-500 to-orange-600'} rounded-xl p-5 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Utilidad Neta</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(summary.net_profit)}</p>
              <p className="text-white/70 text-sm">{formatBs(summary.net_profit)}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">Margen de Utilidad</p>
              <p className={`text-2xl font-bold mt-1 ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitMargin.toFixed(1)}%
              </p>
              <div className="flex items-center gap-1 mt-1">
                <IndicatorIcon className={`w-4 h-4 ${indicator.color}`} />
                <span className={`text-sm ${indicator.color}`}>
                  {summary.net_profit >= 0 ? 'Rentable' : 'Pérdida'}
                </span>
              </div>
            </div>
            <div className={`p-3 ${indicator.bg} rounded-xl`}>
              <PieChart className={`w-6 h-6 ${indicator.color}`} />
            </div>
          </div>
        </div>
      </div>

      {/* P&L Statement */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-500" />
            Estado de Resultados - {period === "month" ? months[selectedMonth - 1] : period === "quarter" ? "Trimestre" : "Año"} {selectedYear}
          </h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Income Section */}
          <div>
            <h3 className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-3">
              INGRESOS
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">Reservaciones y Hospedaje</span>
                <span className="font-medium text-slate-800">{formatCurrency(summary.income)}</span>
              </div>
              {incomeBreakdown.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 pl-4">
                  <span className="text-slate-500 text-sm">{item.name}</span>
                  <span className="text-slate-600">{formatCurrency(item.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-3 bg-green-50 px-4 rounded-lg">
                <span className="font-semibold text-green-700">Total Ingresos</span>
                <span className="font-bold text-green-700">{formatCurrency(summary.income)}</span>
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          <div>
            <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3">
              GASTOS
            </h3>
            <div className="space-y-2">
              {expenseBreakdown.length > 0 ? (
                expenseBreakdown.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-600">{item.name}</span>
                      <span className="text-xs text-slate-400">({item.percentage.toFixed(1)}%)</span>
                    </div>
                    <span className="text-slate-800">{formatCurrency(item.amount)}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Gastos Operativos</span>
                    <span className="text-slate-800">{formatCurrency(summary.expenses)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Nómina y Personal</span>
                    <span className="text-slate-800">{formatCurrency(summary.payroll)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center py-3 bg-red-50 px-4 rounded-lg">
                <span className="font-semibold text-red-700">Total Gastos</span>
                <span className="font-bold text-red-700">{formatCurrency(summary.expenses + summary.payroll)}</span>
              </div>
            </div>
          </div>

          {/* Net Result */}
          <div className={`p-6 rounded-xl ${summary.net_profit >= 0 ? 'bg-gradient-to-r from-cyan-50 to-green-50 border border-cyan-200' : 'bg-gradient-to-r from-amber-50 to-red-50 border border-amber-200'}`}>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-lg font-bold text-slate-800">RESULTADO NETO</span>
                <p className="text-sm text-slate-500 mt-1">
                  {summary.net_profit >= 0 ? 'Utilidad del período' : 'Pérdida del período'}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.net_profit)}
                </p>
                <p className="text-sm text-slate-500">{formatBs(summary.net_profit)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Receivables Note */}
      {summary.receivables_pending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-800">Cuentas por Cobrar Pendientes</p>
              <p className="text-sm text-amber-600">
                Tienes {formatCurrency(summary.receivables_pending)} pendientes de cobro que no están incluidos en los ingresos actuales.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 py-4">
        <p>Tecnología desarrollada por Webmasterpro Entertainment Corporation</p>
        <p>Smarth Eco Systems — Israel de Jesús</p>
      </div>
    </div>
  );
}
