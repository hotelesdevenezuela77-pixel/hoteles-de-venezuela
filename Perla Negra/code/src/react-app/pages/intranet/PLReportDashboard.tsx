import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  Download,
  BarChart3,
  PieChart,
  DollarSign,
  Percent,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Card } from "@/react-app/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/react-app/components/ui/select";

interface ExchangeRate {
  id: number;
  rate_date: string;
  rate: number;
  source: string;
}

type PeriodType = "monthly" | "quarterly" | "yearly";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const QUARTERS = ["Q1 (Ene-Mar)", "Q2 (Abr-Jun)", "Q3 (Jul-Sep)", "Q4 (Oct-Dic)"];

export default function PLReportDashboard() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  const [periodType, setPeriodType] = useState<PeriodType>("monthly");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(currentMonth / 3));

  // Calculate date range based on period type
  const getDateRange = () => {
    let startDate: string, endDate: string;
    
    if (periodType === "monthly") {
      const start = new Date(selectedYear, selectedMonth, 1);
      const end = new Date(selectedYear, selectedMonth + 1, 0);
      startDate = start.toISOString().split("T")[0];
      endDate = end.toISOString().split("T")[0];
    } else if (periodType === "quarterly") {
      const startMonth = selectedQuarter * 3;
      const start = new Date(selectedYear, startMonth, 1);
      const end = new Date(selectedYear, startMonth + 3, 0);
      startDate = start.toISOString().split("T")[0];
      endDate = end.toISOString().split("T")[0];
    } else {
      startDate = `${selectedYear}-01-01`;
      endDate = `${selectedYear}-12-31`;
    }
    
    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  // Fetch current exchange rate
  const { data: rateData } = useQuery({
    queryKey: ["exchange-rate-current"],
    queryFn: async () => {
      const res = await fetch("/api/exchange-rates/current");
      if (!res.ok) return { rate: null };
      return res.json();
    },
  });

  const currentRate: ExchangeRate | null = rateData?.rate || null;

  // Fetch income transactions
  const { data: incomeData } = useQuery({
    queryKey: ["pl-income", startDate, endDate],
    queryFn: async () => {
      const res = await fetch(`/api/financial/transactions?start=${startDate}&end=${endDate}&type=income`);
      if (!res.ok) return { transactions: [] };
      return res.json();
    },
  });

  // Fetch expense transactions
  const { data: expenseData } = useQuery({
    queryKey: ["pl-expenses", startDate, endDate],
    queryFn: async () => {
      const res = await fetch(`/api/financial/transactions?start=${startDate}&end=${endDate}&type=expense`);
      if (!res.ok) return { transactions: [] };
      return res.json();
    },
  });

  const incomeTransactions = incomeData?.transactions || [];
  const expenseTransactions = expenseData?.transactions || [];

  // Calculate totals
  const totalIncome = incomeTransactions.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);
  const totalExpenses = expenseTransactions.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  // Group expenses by category
  const expensesByCategory = expenseTransactions.reduce((acc: Record<string, number>, t: { category: string; amount: number }) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  // Group income by category/source
  const incomeBySource = incomeTransactions.reduce((acc: Record<string, number>, t: { reservation_id: number | null; category: string; amount: number }) => {
    const key = t.reservation_id ? "reservations" : (t.category || "other");
    acc[key] = (acc[key] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" }).format(amount);

  const formatBs = (amount: number) => {
    if (!currentRate) return "—";
    const bs = amount * currentRate.rate;
    return `Bs ${new Intl.NumberFormat("es-VE").format(bs)}`;
  };

  const getPeriodLabel = () => {
    if (periodType === "monthly") return `${MONTHS[selectedMonth]} ${selectedYear}`;
    if (periodType === "quarterly") return `${QUARTERS[selectedQuarter]} ${selectedYear}`;
    return `Año ${selectedYear}`;
  };

  const EXPENSE_LABELS: Record<string, string> = {
    electricity: "Electricidad",
    water: "Agua",
    internet: "Internet/Teléfono",
    payroll: "Nómina",
    supplies: "Suministros",
    maintenance: "Mantenimiento",
    suppliers: "Proveedores",
    other: "Otros",
  };

  const INCOME_LABELS: Record<string, string> = {
    reservations: "Reservaciones",
    other: "Otros Ingresos",
  };

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 -m-4 lg:-m-8 p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-luxury text-amber-100">Estado de Pérdidas y Ganancias</h1>
          <p className="text-stone-400 font-cursive text-lg">Reporte P&L — {getPeriodLabel()}</p>
        </div>
        <Button variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* Period Selector */}
      <Card className="bg-stone-900/50 border-amber-500/20 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-stone-400 text-sm mb-1 block">Período</label>
            <Select value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
              <SelectTrigger className="bg-stone-800/50 border-stone-700 text-amber-100 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-stone-800 border-stone-700">
                <SelectItem value="monthly" className="text-stone-200">Mensual</SelectItem>
                <SelectItem value="quarterly" className="text-stone-200">Trimestral</SelectItem>
                <SelectItem value="yearly" className="text-stone-200">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-stone-400 text-sm mb-1 block">Año</label>
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="bg-stone-800/50 border-stone-700 text-amber-100 w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-stone-800 border-stone-700">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()} className="text-stone-200">{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {periodType === "monthly" && (
            <div>
              <label className="text-stone-400 text-sm mb-1 block">Mes</label>
              <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                <SelectTrigger className="bg-stone-800/50 border-stone-700 text-amber-100 w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-stone-800 border-stone-700">
                  {MONTHS.map((month, i) => (
                    <SelectItem key={i} value={i.toString()} className="text-stone-200">{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {periodType === "quarterly" && (
            <div>
              <label className="text-stone-400 text-sm mb-1 block">Trimestre</label>
              <Select value={selectedQuarter.toString()} onValueChange={(v) => setSelectedQuarter(parseInt(v))}>
                <SelectTrigger className="bg-stone-800/50 border-stone-700 text-amber-100 w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-stone-800 border-stone-700">
                  {QUARTERS.map((q, i) => (
                    <SelectItem key={i} value={i.toString()} className="text-stone-200">{q}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {currentRate && (
            <div className="ml-auto text-right">
              <p className="text-stone-500 text-xs">Tasa de cambio</p>
              <p className="text-amber-400 font-semibold">
                1 USD = {currentRate.rate.toLocaleString("es-VE")} Bs
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border-emerald-500/30 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-emerald-300/70 text-sm font-medium">Ingresos Totales</p>
              <p className="text-2xl font-bold text-emerald-100 mt-1">{formatCurrency(totalIncome)}</p>
              <p className="text-emerald-400/60 text-sm mt-1">{formatBs(totalIncome)}</p>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-500/30 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-red-300/70 text-sm font-medium">Gastos Totales</p>
              <p className="text-2xl font-bold text-red-100 mt-1">{formatCurrency(totalExpenses)}</p>
              <p className="text-red-400/60 text-sm mt-1">{formatBs(totalExpenses)}</p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-xl">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
          </div>
        </Card>

        <Card className={`bg-gradient-to-br ${netProfit >= 0 
          ? "from-amber-900/40 to-amber-800/20 border-amber-500/30" 
          : "from-rose-900/40 to-rose-800/20 border-rose-500/30"} p-6`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`${netProfit >= 0 ? "text-amber-300/70" : "text-rose-300/70"} text-sm font-medium`}>
                {netProfit >= 0 ? "Utilidad Neta" : "Pérdida Neta"}
              </p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-amber-100" : "text-rose-100"} mt-1`}>
                {formatCurrency(Math.abs(netProfit))}
              </p>
              <p className={`${netProfit >= 0 ? "text-amber-400/60" : "text-rose-400/60"} text-sm mt-1`}>
                {formatBs(Math.abs(netProfit))}
              </p>
            </div>
            <div className={`p-3 ${netProfit >= 0 ? "bg-amber-500/20" : "bg-rose-500/20"} rounded-xl`}>
              <DollarSign className={`w-5 h-5 ${netProfit >= 0 ? "text-amber-400" : "text-rose-400"}`} />
            </div>
          </div>
        </Card>

        <Card className={`bg-gradient-to-br ${profitMargin >= 0 
          ? "from-blue-900/40 to-blue-800/20 border-blue-500/30" 
          : "from-rose-900/40 to-rose-800/20 border-rose-500/30"} p-6`}>
          <div className="flex items-start justify-between">
            <div>
              <p className={`${profitMargin >= 0 ? "text-blue-300/70" : "text-rose-300/70"} text-sm font-medium`}>
                Margen de Utilidad
              </p>
              <p className={`text-2xl font-bold ${profitMargin >= 0 ? "text-blue-100" : "text-rose-100"} mt-1`}>
                {profitMargin.toFixed(1)}%
              </p>
              <p className={`${profitMargin >= 0 ? "text-blue-400/60" : "text-rose-400/60"} text-sm mt-1`}>
                {profitMargin >= 20 ? "Saludable" : profitMargin >= 10 ? "Moderado" : "Bajo"}
              </p>
            </div>
            <div className={`p-3 ${profitMargin >= 0 ? "bg-blue-500/20" : "bg-rose-500/20"} rounded-xl`}>
              <Percent className={`w-5 h-5 ${profitMargin >= 0 ? "text-blue-400" : "text-rose-400"}`} />
            </div>
          </div>
        </Card>
      </div>

      {/* P&L Statement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Breakdown */}
        <Card className="bg-stone-900/50 border-amber-500/20 overflow-hidden">
          <div className="p-4 border-b border-stone-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-luxury text-amber-200">Ingresos</h2>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(incomeBySource).length === 0 ? (
              <p className="text-stone-500 text-center py-4">Sin ingresos en este período</p>
            ) : (
              <>
                {Object.entries(incomeBySource).map(([key, amount]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-stone-800/50">
                    <span className="text-stone-300">{INCOME_LABELS[key] || key}</span>
                    <div className="text-right">
                      <p className="text-emerald-400 font-semibold">{formatCurrency(amount as number)}</p>
                      <p className="text-stone-500 text-xs">{formatBs(amount as number)}</p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 border-t-2 border-emerald-500/30">
                  <span className="text-emerald-200 font-semibold">Total Ingresos</span>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold text-lg">{formatCurrency(totalIncome)}</p>
                    <p className="text-emerald-500/60 text-sm">{formatBs(totalIncome)}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Expenses Breakdown */}
        <Card className="bg-stone-900/50 border-amber-500/20 overflow-hidden">
          <div className="p-4 border-b border-stone-800 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-luxury text-amber-200">Gastos</h2>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(expensesByCategory).length === 0 ? (
              <p className="text-stone-500 text-center py-4">Sin gastos en este período</p>
            ) : (
              <>
                {Object.entries(expensesByCategory).map(([key, amount]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-stone-800/50">
                    <span className="text-stone-300">{EXPENSE_LABELS[key] || key}</span>
                    <div className="text-right">
                      <p className="text-red-400 font-semibold">{formatCurrency(amount as number)}</p>
                      <p className="text-stone-500 text-xs">{formatBs(amount as number)}</p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 border-t-2 border-red-500/30">
                  <span className="text-red-200 font-semibold">Total Gastos</span>
                  <div className="text-right">
                    <p className="text-red-400 font-bold text-lg">{formatCurrency(totalExpenses)}</p>
                    <p className="text-red-500/60 text-sm">{formatBs(totalExpenses)}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Net Result */}
      <Card className={`border-2 ${netProfit >= 0 ? "border-amber-500/40 bg-gradient-to-r from-amber-900/30 to-stone-900/50" : "border-rose-500/40 bg-gradient-to-r from-rose-900/30 to-stone-900/50"} p-6`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${netProfit >= 0 ? "bg-amber-500/20" : "bg-rose-500/20"}`}>
              {netProfit >= 0 ? (
                <TrendingUp className="w-8 h-8 text-amber-400" />
              ) : (
                <TrendingDown className="w-8 h-8 text-rose-400" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-luxury text-amber-100">
                {netProfit >= 0 ? "Resultado del Período: UTILIDAD" : "Resultado del Período: PÉRDIDA"}
              </h3>
              <p className="text-stone-400 font-cursive">{getPeriodLabel()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-4xl font-bold ${netProfit >= 0 ? "text-amber-400" : "text-rose-400"}`}>
              {netProfit >= 0 ? "+" : "-"}{formatCurrency(Math.abs(netProfit))}
            </p>
            <p className="text-stone-400 text-lg">{formatBs(Math.abs(netProfit))}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
