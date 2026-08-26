import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  DollarSign,
  Calendar,
  User,
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  Receipt,
} from "lucide-react";

interface Guest {
  id: number;
  name: string;
  phone: string;
  email: string;
}

interface Reservation {
  id: number;
  guest_name: string;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
}

interface AccountReceivable {
  id: number;
  account_type: string;
  guest_id: number | null;
  guest_name?: string;
  company_name: string | null;
  company_contact: string | null;
  company_phone: string | null;
  reservation_id: number | null;
  description: string;
  total_amount: number;
  paid_amount: number;
  currency: string;
  due_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

interface PaymentMethod {
  id: number;
  name: string;
  code: string;
}

export default function ReceivablesPanel() {
  const [accounts, setAccounts] = useState<AccountReceivable[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountReceivable | null>(null);
  const [exchangeRate, setExchangeRate] = useState(45);

  const [formData, setFormData] = useState({
    account_type: "guest",
    guest_id: "",
    company_name: "",
    company_contact: "",
    company_phone: "",
    reservation_id: "",
    description: "",
    total_amount: "",
    currency: "USD",
    due_date: "",
    notes: "",
  });

  const [paymentData, setPaymentData] = useState({
    amount: "",
    payment_method_id: "",
    reference_number: "",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accountsRes, guestsRes, reservationsRes, methodsRes, rateRes] = await Promise.all([
        fetch("/api/finance/receivables"),
        fetch("/api/finance/guests"),
        fetch("/api/finance/reservations-pending"),
        fetch("/api/finance/payment-methods"),
        fetch("/api/finance/exchange-rate"),
      ]);

      if (accountsRes.ok) {
        const data = await accountsRes.json();
        setAccounts(data.accounts || []);
      }
      if (guestsRes.ok) {
        const data = await guestsRes.json();
        setGuests(data.guests || []);
      }
      if (reservationsRes.ok) {
        const data = await reservationsRes.json();
        setReservations(data.reservations || []);
      }
      if (methodsRes.ok) {
        const data = await methodsRes.json();
        setPaymentMethods(data.methods || []);
      }
      if (rateRes.ok) {
        const data = await rateRes.json();
        setExchangeRate(data.rate || 45);
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
      const res = await fetch("/api/finance/receivables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          guest_id: formData.guest_id ? parseInt(formData.guest_id) : null,
          reservation_id: formData.reservation_id ? parseInt(formData.reservation_id) : null,
          total_amount: parseFloat(formData.total_amount),
        }),
      });

      if (res.ok) {
        setShowModal(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error("Error creating account:", error);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    try {
      const res = await fetch(`/api/finance/receivables/${selectedAccount.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(paymentData.amount),
          payment_method_id: paymentData.payment_method_id ? parseInt(paymentData.payment_method_id) : null,
          reference_number: paymentData.reference_number,
          notes: paymentData.notes,
        }),
      });

      if (res.ok) {
        setShowPaymentModal(false);
        setSelectedAccount(null);
        setPaymentData({ amount: "", payment_method_id: "", reference_number: "", notes: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Error registering payment:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      account_type: "guest",
      guest_id: "",
      company_name: "",
      company_contact: "",
      company_phone: "",
      reservation_id: "",
      description: "",
      total_amount: "",
      currency: "USD",
      due_date: "",
      notes: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";
      case "partial":
        return "bg-yellow-100 text-yellow-700";
      case "overdue":
        return "bg-red-100 text-red-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "partial":
        return <Clock className="w-4 h-4" />;
      case "overdue":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      (acc.guest_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (acc.company_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      acc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || acc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totals = {
    total: filteredAccounts.reduce((sum, acc) => sum + acc.total_amount, 0),
    paid: filteredAccounts.reduce((sum, acc) => sum + acc.paid_amount, 0),
    pending: filteredAccounts.reduce((sum, acc) => sum + (acc.total_amount - acc.paid_amount), 0),
  };

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
          <h1 className="text-2xl font-bold text-slate-800">Cuentas por Cobrar</h1>
          <p className="text-slate-500">Gestión de pagos pendientes de huéspedes y empresas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:from-cyan-600 hover:to-teal-600 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nueva Cuenta
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Facturado</p>
              <p className="text-xl font-bold text-slate-800">${totals.total.toFixed(2)}</p>
              <p className="text-xs text-slate-400">Bs. {(totals.total * exchangeRate).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Cobrado</p>
              <p className="text-xl font-bold text-green-600">${totals.paid.toFixed(2)}</p>
              <p className="text-xs text-slate-400">Bs. {(totals.paid * exchangeRate).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pendiente por Cobrar</p>
              <p className="text-xl font-bold text-amber-600">${totals.pending.toFixed(2)}</p>
              <p className="text-xs text-slate-400">Bs. {(totals.pending * exchangeRate).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, empresa o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="partial">Pago Parcial</option>
            <option value="overdue">Vencido</option>
            <option value="paid">Pagado</option>
          </select>
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredAccounts.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No hay cuentas por cobrar registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Cliente</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Descripción</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Vencimiento</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Total</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Pagado</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Saldo</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Estado</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.map((acc) => {
                  const balance = acc.total_amount - acc.paid_amount;
                  return (
                    <tr key={acc.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${acc.account_type === "company" ? "bg-purple-100" : "bg-cyan-100"}`}>
                            {acc.account_type === "company" ? (
                              <Building2 className="w-4 h-4 text-purple-600" />
                            ) : (
                              <User className="w-4 h-4 text-cyan-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {acc.account_type === "company" ? acc.company_name : acc.guest_name || "Sin nombre"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {acc.account_type === "company" ? acc.company_contact : `ID: ${acc.guest_id}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">{acc.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        {acc.due_date ? (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(acc.due_date).toLocaleDateString("es-VE")}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-medium text-slate-800">${acc.total_amount.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-green-600">${acc.paid_amount.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className={`font-semibold ${balance > 0 ? "text-amber-600" : "text-green-600"}`}>
                          ${balance.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(acc.status)}`}>
                          {getStatusIcon(acc.status)}
                          {acc.status === "paid" ? "Pagado" : acc.status === "partial" ? "Parcial" : acc.status === "overdue" ? "Vencido" : "Pendiente"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {acc.status !== "paid" && (
                          <button
                            onClick={() => {
                              setSelectedAccount(acc);
                              setPaymentData({
                                amount: (acc.total_amount - acc.paid_amount).toString(),
                                payment_method_id: "",
                                reference_number: "",
                                notes: "",
                              });
                              setShowPaymentModal(true);
                            }}
                            className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Registrar Pago
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Account Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-slate-800">Nueva Cuenta por Cobrar</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Cuenta</label>
                <select
                  value={formData.account_type}
                  onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="guest">Huésped Individual</option>
                  <option value="company">Empresa / Corporativo</option>
                </select>
              </div>

              {formData.account_type === "guest" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Huésped</label>
                    <select
                      value={formData.guest_id}
                      onChange={(e) => setFormData({ ...formData, guest_id: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">Seleccionar huésped...</option>
                      {guests.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Reservación (Opcional)</label>
                    <select
                      value={formData.reservation_id}
                      onChange={(e) => setFormData({ ...formData, reservation_id: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">Sin reservación asociada</option>
                      {reservations.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.guest_name} - {new Date(r.check_in_date).toLocaleDateString("es-VE")}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de Empresa *</label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
                      required={formData.account_type === "company"}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Contacto</label>
                      <input
                        type="text"
                        value={formData.company_contact}
                        onChange={(e) => setFormData({ ...formData, company_contact: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                      <input
                        type="text"
                        value={formData.company_phone}
                        onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ej: Estadía 3 noches + consumo minibar"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Monto Total *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Moneda</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="USD">USD</option>
                    <option value="VES">Bs</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Vencimiento</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:from-cyan-600 hover:to-teal-600"
                >
                  Crear Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-slate-800">Registrar Pago</h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePayment} className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-500">Cliente</p>
                <p className="font-medium text-slate-800">
                  {selectedAccount.account_type === "company" 
                    ? selectedAccount.company_name 
                    : selectedAccount.guest_name}
                </p>
                <p className="text-sm text-slate-500 mt-2">Saldo Pendiente</p>
                <p className="text-xl font-bold text-amber-600">
                  ${(selectedAccount.total_amount - selectedAccount.paid_amount).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monto a Pagar *</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  max={selectedAccount.total_amount - selectedAccount.paid_amount}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Método de Pago</label>
                <select
                  value={paymentData.payment_method_id}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method_id: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Seleccionar...</option>
                  {paymentMethods.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Número de Referencia</label>
                <input
                  type="text"
                  value={paymentData.reference_number}
                  onChange={(e) => setPaymentData({ ...paymentData, reference_number: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Confirmar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
