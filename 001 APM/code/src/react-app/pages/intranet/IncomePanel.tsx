import { useState, useEffect } from "react";
import {
  Plus,
  X,
  Search,
  DollarSign,
  CreditCard,
  Calendar,

  ChevronLeft,
  Receipt,
  Check,
} from "lucide-react";

interface Payment {
  id: number;
  reservation_id: number | null;
  payment_method_id: number;
  payment_type: string;
  amount: number;
  currency: string;
  amount_local: number | null;
  exchange_rate: number | null;
  reference_number: string | null;
  payment_date: string;
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
  guest_name?: string;
  room_code?: string;
  method_name?: string;
}

interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  currency: string;
}

interface Reservation {
  id: number;
  guest_name: string;
  room_code: string;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  deposit_amount: number;
}

const PAYMENT_TYPES = [
  { value: "deposit", label: "Abono Inicial", color: "bg-amber-100 text-amber-700" },
  { value: "partial", label: "Pago Parcial", color: "bg-blue-100 text-blue-700" },
  { value: "final_payment", label: "Pago Final", color: "bg-emerald-100 text-emerald-700" },
  { value: "full_payment", label: "Pago Completo", color: "bg-purple-100 text-purple-700" },
  { value: "extra", label: "Cargo Extra", color: "bg-pink-100 text-pink-700" },
];

export default function IncomePanel() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    reservation_id: "",
    payment_method_id: "",
    payment_type: "deposit",
    amount: "",
    currency: "USD",
    amount_local: "",
    reference_number: "",
    payment_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, methodsRes, reservationsRes, rateRes] = await Promise.all([
        fetch("/api/finance/payments"),
        fetch("/api/finance/payment-methods"),
        fetch("/api/finance/reservations-pending"),
        fetch("/api/finance/exchange-rate"),
      ]);

      if (paymentsRes.ok) setPayments(await paymentsRes.json());
      if (methodsRes.ok) setPaymentMethods(await methodsRes.json());
      if (reservationsRes.ok) setReservations(await reservationsRes.json());
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
      const res = await fetch("/api/finance/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          reservation_id: formData.reservation_id ? parseInt(formData.reservation_id) : null,
          payment_method_id: parseInt(formData.payment_method_id),
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
      console.error("Error saving payment:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      reservation_id: "",
      payment_method_id: "",
      payment_type: "deposit",
      amount: "",
      currency: "USD",
      amount_local: "",
      reference_number: "",
      payment_date: new Date().toISOString().split("T")[0],
      notes: "",
    });
  };

  const handleMethodChange = (methodId: string) => {
    const method = paymentMethods.find((m) => m.id === parseInt(methodId));
    setFormData({
      ...formData,
      payment_method_id: methodId,
      currency: method?.currency || "USD",
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

  const getPaymentTypeInfo = (type: string) => {
    return PAYMENT_TYPES.find((t) => t.value === type) || PAYMENT_TYPES[0];
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.room_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || payment.payment_type === filterType;
    const matchesMethod =
      filterMethod === "all" || payment.payment_method_id === parseInt(filterMethod);

    return matchesSearch && matchesType && matchesMethod;
  });

  const totalFiltered = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

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
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Ingresos por Reservas</h1>
            <p className="text-slate-500 text-sm">Registro de pagos de huéspedes</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Registrar Pago</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totalFiltered)}</p>
              <p className="text-xs text-emerald-600">Total Filtrado</p>
            </div>
          </div>
        </div>

        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
              <Receipt className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-700">{filteredPayments.length}</p>
              <p className="text-xs text-cyan-600">Pagos Registrados</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{reservations.length}</p>
              <p className="text-xs text-amber-600">Reservas Pendientes</p>
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
              placeholder="Buscar por huésped, habitación o referencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">Todos los tipos</option>
            {PAYMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">Todos los métodos</option>
            {paymentMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filteredPayments.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredPayments.map((payment) => {
              const typeInfo = getPaymentTypeInfo(payment.payment_type);
              return (
                <div key={payment.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        {payment.room_code && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {payment.room_code}
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-slate-800">
                        {payment.guest_name || "Pago Directo"}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(payment.payment_date).toLocaleDateString("es-VE")}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          {payment.method_name}
                        </span>
                        {payment.reference_number && (
                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                            Ref: {payment.reference_number}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-600">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                      {payment.amount_local && payment.currency === "USD" && (
                        <p className="text-sm text-slate-500">
                          ≈ Bs {payment.amount_local.toLocaleString("es-VE")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">
            <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hay pagos registrados</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Registrar Primer Pago
            </button>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Registrar Pago</h3>
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
              {/* Reservation Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reservación (opcional)
                </label>
                <select
                  value={formData.reservation_id}
                  onChange={(e) => setFormData({ ...formData, reservation_id: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">— Pago directo sin reservación —</option>
                  {reservations.map((res) => (
                    <option key={res.id} value={res.id}>
                      {res.room_code} - {res.guest_name} ({new Date(res.check_in_date).toLocaleDateString("es-VE")})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo de Pago *
                </label>
                <select
                  value={formData.payment_type}
                  onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  required
                >
                  {PAYMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Método de Pago *
                </label>
                <select
                  value={formData.payment_method_id}
                  onChange={(e) => handleMethodChange(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  required
                >
                  <option value="">Seleccionar método...</option>
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name}
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

              {/* Reference Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Número de Referencia
                </label>
                <input
                  type="text"
                  value={formData.reference_number}
                  onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Ej: 12345678"
                />
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fecha de Pago *
                </label>
                <input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
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
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Registrar
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
