import { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Search,
  FileText,
  Phone,
  Mail,
  ChevronRight,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  X,
} from "lucide-react";

interface Supplier {
  id: number;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  category: string | null;
  payment_terms: string | null;
  notes: string | null;
  is_active: number;
}

interface Invoice {
  id: number;
  supplier_id: number;
  supplier_name?: string;
  invoice_number: string | null;
  invoice_date: string;
  due_date: string | null;
  total_amount: number;
  paid_amount: number;
  currency: string;
  status: string;
  notes: string | null;
}

interface Payment {
  id: number;
  amount: number;
  currency: string;
  payment_date: string;
  reference_number: string | null;
  method_name?: string;
}

type ViewMode = "list" | "supplier" | "invoice";

export default function SuppliersPanel() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Modals
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  
  // Form states
  const [supplierForm, setSupplierForm] = useState({
    name: "", contact_name: "", phone: "", email: "", address: "", category: "", payment_terms: "", notes: ""
  });
  const [invoiceForm, setInvoiceForm] = useState({
    invoice_number: "", invoice_date: new Date().toISOString().split("T")[0], due_date: "", total_amount: "", currency: "USD", notes: ""
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: "", payment_date: new Date().toISOString().split("T")[0], reference_number: "", payment_method_id: ""
  });
  const [paymentMethods, setPaymentMethods] = useState<{id: number; name: string}[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [suppliersRes, methodsRes] = await Promise.all([
        fetch("/api/finance/suppliers"),
        fetch("/api/finance/payment-methods"),
      ]);
      
      if (suppliersRes.ok) {
        const data = await suppliersRes.json();
        setSuppliers(data.suppliers || []);
      }
      if (methodsRes.ok) {
        const data = await methodsRes.json();
        setPaymentMethods(data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierInvoices = async (supplierId: number) => {
    try {
      const res = await fetch(`/api/finance/suppliers/${supplierId}/invoices`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const fetchInvoicePayments = async (invoiceId: number) => {
    try {
      const res = await fetch(`/api/finance/invoices/${invoiceId}/payments`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const handleSelectSupplier = async (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setViewMode("supplier");
    await fetchSupplierInvoices(supplier.id);
  };

  const handleSelectInvoice = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewMode("invoice");
    await fetchInvoicePayments(invoice.id);
  };

  const handleBack = () => {
    if (viewMode === "invoice") {
      setViewMode("supplier");
      setSelectedInvoice(null);
    } else {
      setViewMode("list");
      setSelectedSupplier(null);
    }
  };

  const handleSaveSupplier = async () => {
    try {
      const url = editingSupplier 
        ? `/api/finance/suppliers/${editingSupplier.id}`
        : "/api/finance/suppliers";
      const method = editingSupplier ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplierForm),
      });
      
      if (res.ok) {
        setShowSupplierModal(false);
        setEditingSupplier(null);
        setSupplierForm({ name: "", contact_name: "", phone: "", email: "", address: "", category: "", payment_terms: "", notes: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
    }
  };

  const handleSaveInvoice = async () => {
    if (!selectedSupplier) return;
    
    try {
      const res = await fetch("/api/finance/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...invoiceForm,
          supplier_id: selectedSupplier.id,
          total_amount: parseFloat(invoiceForm.total_amount),
        }),
      });
      
      if (res.ok) {
        setShowInvoiceModal(false);
        setInvoiceForm({ invoice_number: "", invoice_date: new Date().toISOString().split("T")[0], due_date: "", total_amount: "", currency: "USD", notes: "" });
        fetchSupplierInvoices(selectedSupplier.id);
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };

  const handleSavePayment = async () => {
    if (!selectedInvoice) return;
    
    try {
      const res = await fetch(`/api/finance/invoices/${selectedInvoice.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentForm,
          amount: parseFloat(paymentForm.amount),
        }),
      });
      
      if (res.ok) {
        setShowPaymentModal(false);
        setPaymentForm({ amount: "", payment_date: new Date().toISOString().split("T")[0], reference_number: "", payment_method_id: "" });
        fetchInvoicePayments(selectedInvoice.id);
        if (selectedSupplier) fetchSupplierInvoices(selectedSupplier.id);
      }
    } catch (error) {
      console.error("Error saving payment:", error);
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    if (currency === "USD") return `$${amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;
    return `Bs. ${amount.toLocaleString("es-VE", { minimumFractionDigits: 0 })}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("es-VE", { day: "numeric", month: "short", year: "numeric" });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
      partial: { bg: "bg-blue-100", text: "text-blue-700", icon: AlertCircle },
      paid: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
      overdue: { bg: "bg-red-100", text: "text-red-700", icon: AlertCircle },
    };
    const style = styles[status] || styles.pending;
    const Icon = style.icon;
    const labels: Record<string, string> = { pending: "Pendiente", partial: "Parcial", paid: "Pagada", overdue: "Vencida" };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {labels[status] || status}
      </span>
    );
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvoices = invoices.filter(inv => 
    statusFilter === "all" || inv.status === statusFilter
  );

  // Calculate totals
  const totalPending = invoices.reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // Invoice Detail View
  if (viewMode === "invoice" && selectedInvoice) {
    const remaining = selectedInvoice.total_amount - selectedInvoice.paid_amount;
    
    return (
      <div className="space-y-6">
        <button onClick={handleBack} className="flex items-center gap-2 text-slate-600 hover:text-cyan-600">
          <ArrowLeft className="w-4 h-4" />
          Volver a {selectedSupplier?.name}
        </button>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Factura #{selectedInvoice.invoice_number || selectedInvoice.id}
              </h1>
              <p className="text-slate-500">{selectedSupplier?.name}</p>
            </div>
            {getStatusBadge(selectedInvoice.status)}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500">Fecha Factura</p>
              <p className="font-semibold text-slate-800">{formatDate(selectedInvoice.invoice_date)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500">Vencimiento</p>
              <p className="font-semibold text-slate-800">{selectedInvoice.due_date ? formatDate(selectedInvoice.due_date) : "—"}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500">Total</p>
              <p className="font-semibold text-slate-800">{formatCurrency(selectedInvoice.total_amount, selectedInvoice.currency)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-500">Pendiente</p>
              <p className={`font-semibold ${remaining > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {formatCurrency(remaining, selectedInvoice.currency)}
              </p>
            </div>
          </div>

          {remaining > 0 && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600"
            >
              <CreditCard className="w-4 h-4" />
              Registrar Pago
            </button>
          )}
        </div>

        {/* Payments List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">Pagos Realizados</h2>
          </div>
          {payments.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <CreditCard className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p>No hay pagos registrados</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {payments.map(payment => (
                <div key={payment.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-800">{formatCurrency(payment.amount, payment.currency)}</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(payment.payment_date)}
                      {payment.reference_number && ` • Ref: ${payment.reference_number}`}
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">Registrar Pago</h3>
                <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Monto</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder={`Pendiente: ${formatCurrency(remaining, selectedInvoice.currency)}`}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={paymentForm.payment_date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Referencia</label>
                  <input
                    type="text"
                    value={paymentForm.reference_number}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })}
                    placeholder="Número de referencia"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Método de Pago</label>
                  <select
                    value={paymentForm.payment_method_id}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_method_id: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="">Seleccionar...</option>
                    {paymentMethods.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setShowPaymentModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">
                  Cancelar
                </button>
                <button onClick={handleSavePayment} className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600">
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Supplier Detail View
  if (viewMode === "supplier" && selectedSupplier) {
    return (
      <div className="space-y-6">
        <button onClick={handleBack} className="flex items-center gap-2 text-slate-600 hover:text-cyan-600">
          <ArrowLeft className="w-4 h-4" />
          Volver a Proveedores
        </button>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{selectedSupplier.name}</h1>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                {selectedSupplier.phone && (
                  <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{selectedSupplier.phone}</span>
                )}
                {selectedSupplier.email && (
                  <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{selectedSupplier.email}</span>
                )}
                {selectedSupplier.category && (
                  <span className="px-2 py-0.5 bg-slate-100 rounded">{selectedSupplier.category}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:from-cyan-600 hover:to-teal-600"
            >
              <Plus className="w-4 h-4" />
              Nueva Factura
            </button>
          </div>

          {totalPending > 0 && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Deuda Pendiente</p>
                <p className="text-amber-600">{formatCurrency(totalPending)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {["all", "pending", "partial", "paid"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                statusFilter === status 
                  ? "bg-cyan-500 text-white" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {status === "all" ? "Todas" : status === "pending" ? "Pendientes" : status === "partial" ? "Parciales" : "Pagadas"}
            </button>
          ))}
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">Facturas</h2>
          </div>
          {filteredInvoices.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No hay facturas</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredInvoices.map(invoice => (
                <div
                  key={invoice.id}
                  onClick={() => handleSelectInvoice(invoice)}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <FileText className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">
                        #{invoice.invoice_number || invoice.id}
                      </p>
                      <p className="text-sm text-slate-500">{formatDate(invoice.invoice_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-slate-800">{formatCurrency(invoice.total_amount, invoice.currency)}</p>
                      {invoice.paid_amount > 0 && invoice.paid_amount < invoice.total_amount && (
                        <p className="text-sm text-amber-600">Pagado: {formatCurrency(invoice.paid_amount, invoice.currency)}</p>
                      )}
                    </div>
                    {getStatusBadge(invoice.status)}
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoice Modal */}
        {showInvoiceModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">Nueva Factura</h3>
                <button onClick={() => setShowInvoiceModal(false)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">N° Factura</label>
                  <input
                    type="text"
                    value={invoiceForm.invoice_number}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_number: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={invoiceForm.invoice_date}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Vencimiento</label>
                  <input
                    type="date"
                    value={invoiceForm.due_date}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Moneda</label>
                  <select
                    value={invoiceForm.currency}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="VES">Bolívares (Bs)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Monto Total</label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoiceForm.total_amount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, total_amount: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Notas</label>
                  <textarea
                    value={invoiceForm.notes}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={() => setShowInvoiceModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">
                  Cancelar
                </button>
                <button onClick={handleSaveInvoice} className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:from-cyan-600 hover:to-teal-600">
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Suppliers List View
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Proveedores y Facturas</h1>
          <p className="text-slate-500">Gestión de proveedores y cuentas por pagar</p>
        </div>
        <button
          onClick={() => { setEditingSupplier(null); setSupplierForm({ name: "", contact_name: "", phone: "", email: "", address: "", category: "", payment_terms: "", notes: "" }); setShowSupplierModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:from-cyan-600 hover:to-teal-600"
        >
          <Plus className="w-4 h-4" />
          Nuevo Proveedor
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar proveedor..."
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Suppliers Grid */}
      {filteredSuppliers.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-slate-500 border border-slate-200">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p>No hay proveedores registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map(supplier => (
            <div
              key={supplier.id}
              onClick={() => handleSelectSupplier(supplier)}
              className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:border-cyan-300 hover:shadow-md cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-cyan-50 rounded-lg">
                  <Building2 className="w-6 h-6 text-cyan-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{supplier.name}</h3>
              {supplier.contact_name && (
                <p className="text-sm text-slate-500 mb-2">{supplier.contact_name}</p>
              )}
              <div className="flex flex-wrap gap-2 text-xs">
                {supplier.category && (
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded">{supplier.category}</span>
                )}
                {supplier.phone && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <Phone className="w-3 h-3" />{supplier.phone}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                {editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}
              </h3>
              <button onClick={() => setShowSupplierModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Contacto</label>
                  <input
                    type="text"
                    value={supplierForm.contact_name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contact_name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Categoría</label>
                <select
                  value={supplierForm.category}
                  onChange={(e) => setSupplierForm({ ...supplierForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Insumos">Insumos</option>
                  <option value="Alimentos">Alimentos</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Dirección</label>
                <input
                  type="text"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Notas</label>
                <textarea
                  value={supplierForm.notes}
                  onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowSupplierModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">
                Cancelar
              </button>
              <button onClick={handleSaveSupplier} disabled={!supplierForm.name} className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:from-cyan-600 hover:to-teal-600 disabled:opacity-50">
                Guardar
              </button>
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
