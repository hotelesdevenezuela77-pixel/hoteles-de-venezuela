import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Banknote,
  Building2,
  Plus,
  Download,
  Filter,
  Receipt,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Link2,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Card } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/react-app/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/react-app/components/ui/dialog";
import { Textarea } from "@/react-app/components/ui/textarea";
import FinancialCharts from "@/react-app/components/intranet/FinancialCharts";

interface Transaction {
  id: number;
  transaction_type: string;
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  reference_number: string;
  reservation_id: number | null;
  transaction_date: string;
  created_by: string;
  notes: string;
  // Linked reservation info
  reservation_check_in?: string;
  reservation_check_out?: string;
  guest_name?: string;
  room_code?: string;
}

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  pendingPayments: number;
  incomeByMethod: Record<string, number>;
  expensesByCategory: Record<string, number>;
}

interface ExpenseCategory {
  id: number;
  name: string;
  description: string;
}

interface DailyTrend {
  date: string;
  income: number;
  expenses: number;
}

export default function FinancialDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [dailyTrends, setDailyTrends] = useState<DailyTrend[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    pendingPayments: 0,
    incomeByMethod: {},
    expensesByCategory: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("month");
  const [newTransaction, setNewTransaction] = useState({
    transaction_type: "income",
    category: "",
    description: "",
    amount: "",
    payment_method: "efectivo",
    reference_number: "",
    transaction_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, [dateFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [transRes, catRes, summaryRes, trendsRes] = await Promise.all([
        fetch(`/api/financial/transactions?period=${dateFilter}`),
        fetch("/api/financial/categories"),
        fetch(`/api/financial/summary?period=${dateFilter}`),
        fetch(`/api/financial/trends?period=${dateFilter}`),
      ]);
      
      if (transRes.ok) {
        const data = await transRes.json();
        setTransactions(data.transactions || []);
      }
      if (catRes.ok) {
        const data = await catRes.json();
        setCategories(data.categories || []);
      }
      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
      }
      if (trendsRes.ok) {
        const data = await trendsRes.json();
        setDailyTrends(data.trends || []);
      }
    } catch (error) {
      console.error("Error fetching financial data:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/financial/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTransaction,
          amount: parseFloat(newTransaction.amount),
        }),
      });
      if (res.ok) {
        setIsDialogOpen(false);
        setNewTransaction({
          transaction_type: "income",
          category: "",
          description: "",
          amount: "",
          payment_method: "efectivo",
          reference_number: "",
          transaction_date: new Date().toISOString().split("T")[0],
          notes: "",
        });
        fetchData();
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "efectivo":
        return <Banknote className="h-4 w-4" />;
      case "transferencia":
        return <Building2 className="h-4 w-4" />;
      case "tarjeta":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const incomeCategories = [
    "Reservación",
    "Depósito",
    "Pago adicional",
    "Servicio extra",
    "Otro ingreso",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-luxury font-bold text-stone-800">
            Módulo Financiero
          </h1>
          <p className="text-stone-500 font-cursive">
            Control de ingresos, gastos y flujo de caja
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-40 border-amber-200 focus:ring-amber-500">
              <Filter className="h-4 w-4 mr-2 text-amber-600" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Transacción
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-luxury text-stone-800">
                  Registrar Transacción
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={newTransaction.transaction_type === "income" ? "default" : "outline"}
                    className={newTransaction.transaction_type === "income" 
                      ? "bg-emerald-500 hover:bg-emerald-600" 
                      : "border-stone-300"}
                    onClick={() => setNewTransaction({ ...newTransaction, transaction_type: "income", category: "" })}
                  >
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Ingreso
                  </Button>
                  <Button
                    type="button"
                    variant={newTransaction.transaction_type === "expense" ? "default" : "outline"}
                    className={newTransaction.transaction_type === "expense" 
                      ? "bg-red-500 hover:bg-red-600" 
                      : "border-stone-300"}
                    onClick={() => setNewTransaction({ ...newTransaction, transaction_type: "expense", category: "" })}
                  >
                    <ArrowDownRight className="h-4 w-4 mr-2" />
                    Gasto
                  </Button>
                </div>

                <div>
                  <Label>Categoría</Label>
                  <Select
                    value={newTransaction.category}
                    onValueChange={(v) => setNewTransaction({ ...newTransaction, category: v })}
                  >
                    <SelectTrigger className="border-stone-300">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {newTransaction.transaction_type === "income"
                        ? incomeCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))
                        : categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Descripción</Label>
                  <Input
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                    placeholder="Descripción de la transacción"
                    className="border-stone-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Monto (USD)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                      placeholder="0.00"
                      className="border-stone-300"
                      required
                    />
                  </div>
                  <div>
                    <Label>Fecha</Label>
                    <Input
                      type="date"
                      value={newTransaction.transaction_date}
                      onChange={(e) => setNewTransaction({ ...newTransaction, transaction_date: e.target.value })}
                      className="border-stone-300"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Método de Pago</Label>
                  <Select
                    value={newTransaction.payment_method}
                    onValueChange={(v) => setNewTransaction({ ...newTransaction, payment_method: v })}
                  >
                    <SelectTrigger className="border-stone-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="pago_movil">Pago Móvil</SelectItem>
                      <SelectItem value="zelle">Zelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Referencia (opcional)</Label>
                  <Input
                    value={newTransaction.reference_number}
                    onChange={(e) => setNewTransaction({ ...newTransaction, reference_number: e.target.value })}
                    placeholder="Número de referencia"
                    className="border-stone-300"
                  />
                </div>

                <div>
                  <Label>Notas (opcional)</Label>
                  <Textarea
                    value={newTransaction.notes}
                    onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                    placeholder="Notas adicionales"
                    className="border-stone-300"
                    rows={2}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full"
                >
                  Guardar Transacción
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 font-medium">Ingresos</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                {formatCurrency(summary.totalIncome)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-red-50 to-red-100 border-red-200 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Gastos</p>
              <p className="text-2xl font-bold text-red-700 mt-1">
                {formatCurrency(summary.totalExpenses)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">Balance Neto</p>
              <p className={`text-2xl font-bold mt-1 ${summary.netBalance >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                {formatCurrency(summary.netBalance)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <PiggyBank className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Por Cobrar</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {formatCurrency(summary.pendingPayments)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <FinancialCharts
        incomeByMethod={summary.incomeByMethod}
        expensesByCategory={summary.expensesByCategory}
        totalIncome={summary.totalIncome}
        totalExpenses={summary.totalExpenses}
        dailyTrends={dailyTrends}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2 p-6 rounded-3xl border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-luxury font-semibold text-stone-800">
              Transacciones Recientes
            </h2>
            <Button variant="outline" size="sm" className="rounded-full border-amber-300 text-amber-700">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-stone-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              <Receipt className="h-12 w-12 mx-auto mb-3 text-stone-300" />
              <p className="font-cursive">No hay transacciones en este período</p>
              <p className="text-sm mt-1">Registra tu primera transacción</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl hover:bg-stone-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      tx.transaction_type === "income" 
                        ? "bg-emerald-100 text-emerald-600" 
                        : "bg-red-100 text-red-600"
                    }`}>
                      {tx.transaction_type === "income" 
                        ? <ArrowUpRight className="h-5 w-5" />
                        : <ArrowDownRight className="h-5 w-5" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-stone-800">
                        {tx.description || tx.category}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-stone-500 flex-wrap">
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          {getPaymentMethodIcon(tx.payment_method)}
                          {tx.payment_method}
                        </span>
                        {tx.reservation_id && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-amber-600">
                              <Link2 className="h-3 w-3" />
                              Reservación #{tx.reservation_id}
                              {tx.room_code && ` - Hab. ${tx.room_code}`}
                            </span>
                          </>
                        )}
                      </div>
                      {tx.reservation_id && tx.guest_name && (
                        <p className="text-xs text-stone-400 mt-1">
                          {tx.guest_name}
                          {tx.reservation_check_in && tx.reservation_check_out && (
                            <> • {new Date(tx.reservation_check_in).toLocaleDateString("es-VE")} - {new Date(tx.reservation_check_out).toLocaleDateString("es-VE")}</>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      tx.transaction_type === "income" ? "text-emerald-600" : "text-red-600"
                    }`}>
                      {tx.transaction_type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </p>
                    <p className="text-xs text-stone-500">
                      {new Date(tx.transaction_date).toLocaleDateString("es-VE")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Payment Methods & Categories */}
        <div className="space-y-6">
          {/* Income by Payment Method */}
          <Card className="p-6 rounded-3xl border-stone-200">
            <h3 className="text-lg font-luxury font-semibold text-stone-800 mb-4">
              Ingresos por Método
            </h3>
            <div className="space-y-3">
              {Object.entries(summary.incomeByMethod).length === 0 ? (
                <p className="text-stone-500 text-sm font-cursive">Sin datos</p>
              ) : (
                Object.entries(summary.incomeByMethod).map(([method, amount]) => (
                  <div key={method} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(method)}
                      <span className="text-stone-700 capitalize">{method}</span>
                    </div>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Expenses by Category */}
          <Card className="p-6 rounded-3xl border-stone-200">
            <h3 className="text-lg font-luxury font-semibold text-stone-800 mb-4">
              Gastos por Categoría
            </h3>
            <div className="space-y-3">
              {Object.entries(summary.expensesByCategory).length === 0 ? (
                <p className="text-stone-500 text-sm font-cursive">Sin datos</p>
              ) : (
                Object.entries(summary.expensesByCategory).map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-stone-700">{category}</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-stone-200 pt-4 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-stone-500">
          <p className="font-cursive">Posada Perla Negra — 18 años de experiencia</p>
          <p className="font-cursive">Centro de Tucacas, Morrocoy — Lugar Familiar</p>
        </div>
      </div>
    </div>
  );
}
