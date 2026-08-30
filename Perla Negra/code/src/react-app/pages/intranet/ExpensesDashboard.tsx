import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DollarSign,
  TrendingDown,
  CreditCard,
  Banknote,
  Building2,
  Download,
  Calendar,
  Plus,
  Zap,
  Droplets,
  Wifi,
  ShoppingCart,
  Wrench,
  Users,
  Truck,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Card } from "@/react-app/components/ui/card";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import { Textarea } from "@/react-app/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/react-app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/react-app/components/ui/select";

interface ExpenseTransaction {
  id: number;
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  reference_number: string;
  transaction_date: string;
  created_by: string;
  notes: string;
}

interface ExchangeRate {
  id: number;
  rate_date: string;
  rate: number;
  source: string;
}

// Expense categories with fixed/variable classification
const EXPENSE_CATEGORIES: Record<string, { label: string; icon: typeof DollarSign; type: "fixed" | "variable" }> = {
  electricity: { label: "Electricidad", icon: Zap, type: "fixed" },
  water: { label: "Agua", icon: Droplets, type: "fixed" },
  internet: { label: "Internet/Teléfono", icon: Wifi, type: "fixed" },
  payroll: { label: "Nómina", icon: Users, type: "fixed" },
  supplies: { label: "Suministros", icon: ShoppingCart, type: "variable" },
  maintenance: { label: "Mantenimiento", icon: Wrench, type: "variable" },
  suppliers: { label: "Proveedores", icon: Truck, type: "variable" },
  other: { label: "Otros", icon: MoreHorizontal, type: "variable" },
};

const PAYMENT_METHODS: Record<string, { label: string; icon: typeof DollarSign }> = {
  cash: { label: "Efectivo", icon: Banknote },
  transfer: { label: "Transferencia", icon: Building2 },
  card: { label: "Tarjeta", icon: CreditCard },
  mobile: { label: "Pago Móvil", icon: DollarSign },
  zelle: { label: "Zelle", icon: DollarSign },
};

export default function ExpensesDashboard() {
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: "",
    description: "",
    amount: "",
    payment_method: "transfer",
    reference_number: "",
    notes: "",
    transaction_date: new Date().toISOString().split("T")[0],
  });

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

  // Fetch expense transactions
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ["expense-transactions", startDate, endDate],
    queryFn: async () => {
      const res = await fetch(`/api/financial/transactions?start=${startDate}&end=${endDate}&type=expense`);
      if (!res.ok) throw new Error("Error fetching transactions");
      return res.json();
    },
  });

  const transactions: ExpenseTransaction[] = transactionsData?.transactions || [];

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (expense: typeof newExpense) => {
      const res = await fetch("/api/financial/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...expense,
          transaction_type: "expense",
          amount: parseFloat(expense.amount),
        }),
      });
      if (!res.ok) throw new Error("Error creating expense");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-transactions"] });
      setIsNewExpenseOpen(false);
      setNewExpense({
        category: "",
        description: "",
        amount: "",
        payment_method: "transfer",
        reference_number: "",
        notes: "",
        transaction_date: new Date().toISOString().split("T")[0],
      });
    },
  });

  // Calculate totals
  const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
  const fixedExpenses = transactions
    .filter((t) => EXPENSE_CATEGORIES[t.category]?.type === "fixed")
    .reduce((sum, t) => sum + t.amount, 0);
  const variableExpenses = transactions
    .filter((t) => EXPENSE_CATEGORIES[t.category]?.type === "variable" || !EXPENSE_CATEGORIES[t.category])
    .reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const byCategory = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" }).format(amount);

  const formatBs = (amount: number) => {
    if (!currentRate) return "—";
    const bs = amount * currentRate.rate;
    return `Bs ${new Intl.NumberFormat("es-VE").format(bs)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.category || !newExpense.amount || !newExpense.description) return;
    createExpenseMutation.mutate(newExpense);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 -m-4 lg:-m-8 p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-luxury text-amber-100">Gastos Operativos</h1>
          <p className="text-stone-400 font-cursive text-lg">Control de egresos fijos y variables</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isNewExpenseOpen} onOpenChange={setIsNewExpenseOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Gasto
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-stone-900 border-amber-500/30">
              <DialogHeader>
                <DialogTitle className="text-amber-100 font-luxury">Registrar Gasto</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-stone-300">Categoría</Label>
                    <Select value={newExpense.category} onValueChange={(v) => setNewExpense({ ...newExpense, category: v })}>
                      <SelectTrigger className="bg-stone-800/50 border-stone-700 text-amber-100">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-800 border-stone-700">
                        {Object.entries(EXPENSE_CATEGORIES).map(([key, { label, type }]) => (
                          <SelectItem key={key} value={key} className="text-stone-200">
                            {label} <span className="text-stone-500 text-xs ml-1">({type === "fixed" ? "Fijo" : "Variable"})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-stone-300">Fecha</Label>
                    <Input
                      type="date"
                      value={newExpense.transaction_date}
                      onChange={(e) => setNewExpense({ ...newExpense, transaction_date: e.target.value })}
                      className="bg-stone-800/50 border-stone-700 text-amber-100"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-stone-300">Descripción</Label>
                  <Input
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="Ej: Factura CORPOELEC Enero"
                    className="bg-stone-800/50 border-stone-700 text-amber-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-stone-300">Monto (USD)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      placeholder="0.00"
                      className="bg-stone-800/50 border-stone-700 text-amber-100"
                    />
                  </div>
                  <div>
                    <Label className="text-stone-300">Método de Pago</Label>
                    <Select value={newExpense.payment_method} onValueChange={(v) => setNewExpense({ ...newExpense, payment_method: v })}>
                      <SelectTrigger className="bg-stone-800/50 border-stone-700 text-amber-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-stone-800 border-stone-700">
                        {Object.entries(PAYMENT_METHODS).map(([key, { label }]) => (
                          <SelectItem key={key} value={key} className="text-stone-200">{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-stone-300">Referencia</Label>
                  <Input
                    value={newExpense.reference_number}
                    onChange={(e) => setNewExpense({ ...newExpense, reference_number: e.target.value })}
                    placeholder="Número de factura o referencia"
                    className="bg-stone-800/50 border-stone-700 text-amber-100"
                  />
                </div>
                <div>
                  <Label className="text-stone-300">Notas</Label>
                  <Textarea
                    value={newExpense.notes}
                    onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                    placeholder="Observaciones adicionales"
                    className="bg-stone-800/50 border-stone-700 text-amber-100"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={createExpenseMutation.isPending}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400"
                >
                  {createExpenseMutation.isPending ? "Guardando..." : "Registrar Gasto"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Date Filters */}
      <Card className="bg-stone-900/50 border-amber-500/20 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-stone-400 text-sm mb-1 block">Desde</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-stone-800/50 border-stone-700 text-amber-100 w-40"
            />
          </div>
          <div>
            <label className="text-stone-400 text-sm mb-1 block">Hasta</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-stone-800/50 border-stone-700 text-amber-100 w-40"
            />
          </div>
          {currentRate && (
            <div className="ml-auto text-right">
              <p className="text-stone-500 text-xs">Tasa actual</p>
              <p className="text-amber-400 font-semibold">
                1 USD = {currentRate.rate.toLocaleString("es-VE")} Bs
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-500/30 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-red-300/70 text-sm font-medium">Total Gastos</p>
              <p className="text-3xl font-bold text-red-100 mt-1">{formatCurrency(totalExpenses)}</p>
              <p className="text-red-400/60 text-sm mt-1">{formatBs(totalExpenses)}</p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-xl">
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 border-orange-500/30 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-orange-300/70 text-sm font-medium">Gastos Fijos</p>
              <p className="text-3xl font-bold text-orange-100 mt-1">{formatCurrency(fixedExpenses)}</p>
              <p className="text-orange-400/60 text-sm mt-1">{formatBs(fixedExpenses)}</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <Zap className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border-yellow-500/30 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-yellow-300/70 text-sm font-medium">Gastos Variables</p>
              <p className="text-3xl font-bold text-yellow-100 mt-1">{formatCurrency(variableExpenses)}</p>
              <p className="text-yellow-400/60 text-sm mt-1">{formatBs(variableExpenses)}</p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="bg-stone-900/50 border-amber-500/20 p-6">
        <h2 className="text-lg font-luxury text-amber-200 mb-4">Por Categoría</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(EXPENSE_CATEGORIES).map(([key, { label, icon: Icon, type }]) => (
            <div key={key} className="bg-stone-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-amber-400" />
                <span className="text-stone-300 text-sm">{label}</span>
              </div>
              <p className="text-amber-100 font-semibold">{formatCurrency(byCategory[key] || 0)}</p>
              <span className={`text-xs ${type === "fixed" ? "text-orange-400" : "text-yellow-400"}`}>
                {type === "fixed" ? "Fijo" : "Variable"}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-stone-900/50 border-amber-500/20 overflow-hidden">
        <div className="p-4 border-b border-stone-800">
          <h2 className="text-lg font-luxury text-amber-200">Detalle de Gastos</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-stone-500">Cargando...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-stone-500">No hay gastos en este período</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase">Categoría</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase">Método</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase">Monto USD</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase">Monto Bs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {transactions.map((t) => {
                  const category = EXPENSE_CATEGORIES[t.category] || { label: t.category, icon: MoreHorizontal, type: "variable" };
                  const CategoryIcon = category.icon;
                  const method = PAYMENT_METHODS[t.payment_method];
                  const MethodIcon = method?.icon || DollarSign;
                  return (
                    <tr key={t.id} className="hover:bg-stone-800/30 transition-colors">
                      <td className="px-4 py-3 text-sm text-stone-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-stone-500" />
                          {new Date(t.transaction_date).toLocaleDateString("es-VE")}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="w-4 h-4 text-amber-400" />
                          <span className="text-sm text-amber-200">{category.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-amber-100">{t.description}</p>
                        {t.reference_number && <p className="text-xs text-stone-500">Ref: {t.reference_number}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          category.type === "fixed" 
                            ? "bg-orange-500/20 text-orange-300" 
                            : "bg-yellow-500/20 text-yellow-300"
                        }`}>
                          {category.type === "fixed" ? "Fijo" : "Variable"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MethodIcon className="w-4 h-4 text-amber-400" />
                          <span className="text-sm text-stone-300">{method?.label || t.payment_method}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-red-400 font-semibold">{formatCurrency(t.amount)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-stone-400">{formatBs(t.amount)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
