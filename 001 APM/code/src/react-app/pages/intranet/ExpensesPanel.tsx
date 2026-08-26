import { useState, useEffect } from "react";
import {
  Plus,
  X,
  Search,
  DollarSign,
  Calendar,
  Tag,

  ChevronLeft,
  Receipt,
  Check,
  Trash2,
  Building,
  Zap,
  Droplets,
  Wifi,
  Wrench,
  ShoppingCart,
  Car,
  Shield,
  FileText,
} from "lucide-react";

interface Expense {
  id: number;
  category_id: number;
  supplier_id: number | null;
  description: string;
  amount: number;
  currency: string;
  amount_local: number | null;
  exchange_rate: number | null;
  expense_date: string;
  invoice_number: string | null;
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
  category_name?: string;
  supplier_name?: string;
  is_fixed?: boolean;
}

interface ExpenseCategory {
  id: number;
  name: string;
  code: string;
  is_fixed: boolean;
}

interface Supplier {
  id: number;
  name: string;
}

const CATEGORY_ICONS: Record<string, typeof Building> = {
  rent: Building,
  electricity: Zap,
  water: Droplets,
  internet: Wifi,
  maintenance: Wrench,
  supplies: ShoppingCart,
  transport: Car,
  insurance: Shield,
  taxes: FileText,
  other: Receipt,
};

export default function ExpensesPanel() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const [formData, setFormData] = useState({
    category_id: "",
    supplier_id: "",
    description: "",
    amount: "",
    currency: "USD",
    amount_local: "",
    expense_date: new Date().toISOString().split("T")[0],
    invoice_number: "",
    notes: "",
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    code: "",
    is_fixed: false,
  });

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expensesRes, categoriesRes, suppliersRes, rateRes] = await Promise.all([
        fetch(`/api/finance/expenses?start=${dateRange.start}&end=${dateRange.end}`),
        fetch("/api/finance/expense-categories"),
        fetch("/api/finance/suppliers"),
        fetch("/api/finance/exchange-rate"),
      ]);

      if (expensesRes.ok) setExpenses(await expensesRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
      if (suppliersRes.ok) setSuppliers(await suppliersRes.json());
      if (rateRes.ok) {
        const rateData = await rateRes.json();
        setExchangeRate(rateData.rate);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/finance/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          category_id: parseInt(formData.category_id),
          supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null,
          amount: parseFloat(formData.amount),
          amount_local: formData.amount_local ? parseFloat(formData.amount_local) : null,
          exchange_rate: exchangeRate,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/finance/expense-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });

      if (res.ok) {
        setShowCategoryForm(false);
        setCategoryForm({ name: "", code: "", is_fixed: false });
        fetchData();
      }
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este gasto?")) return;
    try {
      await fetch(`/api/finance/expenses/${id}`, { method: "DELETE" });
      fetchData();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: "",
      supplier_id: "",
      description: "",
      amount: "",
      currency: "USD",
      amount_local: "",
      expense_date: new Date().toISOString().split("T")[0],
      invoice_number: "",
      notes: "",
    });
  };

  const calculateLocalAmount = (usdAmount: string) => {
    if (exchangeRate && usdAmount) {
      const local = parseFloat(usdAmount) * exchangeRate;
      setFormData({
        ...formData,
        amount: usdAmount,
        amount_local: local.toFixed(2),
      });
    } else {
      setFormData({ ...formData, amount: usdAmount });
    }
  };

  const formatCurrency = (amount: number, currency = "USD") => {
    if (currency === "VES") {
      return `Bs ${amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const getCategoryIcon = (code: string) => {
    const IconComponent = CATEGORY_ICONS[code] || Receipt;
    return IconComponent;
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === "all" || expense.category_id === parseInt(filterCategory);
    const matchesType =
      filterType === "all" ||
      (filterType === "fixed" && expense.is_fixed) ||
      (filterType === "variable" && !expense.is_fixed);

    return matchesSearch && matchesCategory && matchesType;
  });

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const fixedTotal = filteredExpenses.filter((e) => e.is_fixed).reduce((sum, e) => sum + e.amount, 0);
  const variableTotal = filteredExpenses.filter((e) => !e.is_fixed).reduce((sum, e) => sum + e.amount, 0);

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
        <div className="flex items-center gap-3">
          <a
            href="/smarthecosystems/finanzas"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-500" />
          </a>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Gastos Operativos</h1>
            <p className="text-slate-500 text-sm">Control de egresos y costos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryForm(true)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Tag className="w-4 h-4" />
            <span className="hidden sm:inline">Categoría</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Registrar Gasto</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(totalFiltered)}</p>
              <p className="text-xs text-red-600">Total Gastos</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Building className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{formatCurrency(fixedTotal)}</p>
              <p className="text-xs text-amber-600">Gastos Fijos</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{formatCurrency(variableTotal)}</p>
              <p className="text-xs text-purple-600">Gastos Variables</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por descripción o factura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 text-sm"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 text-sm"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">Todos</option>
            <option value="fixed">Fijos</option>
            <option value="variable">Variables</option>
          </select>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filteredExpenses.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredExpenses.map((expense) => {
              const IconComponent = getCategoryIcon(expense.category_name?.toLowerCase().replace(/\s/g, "_") || "other");
              return (
                <div key={expense.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        expense.is_fixed ? "bg-amber-100" : "bg-purple-100"
                      }`}>
                        <IconComponent className={`w-5 h-5 ${
                          expense.is_fixed ? "text-amber-600" : "text-purple-600"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            expense.is_fixed 
                              ? "bg-amber-100 text-amber-700" 
                              : "bg-purple-100 text-purple-700"
                          }`}>
                            {expense.is_fixed ? "Fijo" : "Variable"}
                          </span>
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {expense.category_name}
                          </span>
                        </div>
                        <p className="font-medium text-slate-800">{expense.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(expense.expense_date).toLocaleDateString("es-VE")}
                          </span>
                          {expense.supplier_name && (
                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                              {expense.supplier_name}
                            </span>
                          )}
                          {expense.invoice_number && (
                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                              Fact: {expense.invoice_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-red-600">
                          -{formatCurrency(expense.amount, expense.currency)}
                        </p>
                        {expense.amount_local && expense.currency === "USD" && (
                          <p className="text-sm text-slate-500">
                            ≈ Bs {expense.amount_local.toLocaleString("es-VE")}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">
            <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hay gastos registrados en este período</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Registrar Primer Gasto
            </button>
          </div>
        )}
      </div>

      {/* Expense Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Registrar Gasto</h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Categoría *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  required
                >
                  <option value="">Seleccionar categoría...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.is_fixed ? "Fijo" : "Variable"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descripción *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Ej: Pago servicio eléctrico marzo"
                  required
                />
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Proveedor (opcional)
                </label>
                <select
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">— Sin proveedor —</option>
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Monto (USD) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => calculateLocalAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                {exchangeRate && formData.amount && (
                  <p className="text-sm text-slate-500 mt-1">
                    ≈ Bs {(parseFloat(formData.amount) * exchangeRate).toLocaleString("es-VE", { minimumFractionDigits: 2 })} (Tasa: {exchangeRate.toLocaleString("es-VE")})
                  </p>
                )}
              </div>

              {/* Invoice Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Número de Factura
                </label>
                <input
                  type="text"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Ej: FAC-001234"
                />
              </div>

              {/* Expense Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fecha de Gasto *
                </label>
                <input
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  rows={2}
                  placeholder="Observaciones adicionales..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Nueva Categoría</h3>
              <button
                onClick={() => setShowCategoryForm(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Ej: Electricidad"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  value={categoryForm.code}
                  onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value.toLowerCase() })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Ej: electricity"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_fixed"
                  checked={categoryForm.is_fixed}
                  onChange={(e) => setCategoryForm({ ...categoryForm, is_fixed: e.target.checked })}
                  className="w-4 h-4 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500"
                />
                <label htmlFor="is_fixed" className="text-sm text-slate-700">
                  Es gasto fijo (recurrente mensualmente)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCategoryForm(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                >
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
