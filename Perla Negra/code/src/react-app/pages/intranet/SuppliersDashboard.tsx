import { useState, useEffect } from "react";
import {
  Truck,
  Plus,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  Clock,
  Pencil,
  DollarSign,
  Calendar,
  AlertCircle,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/react-app/components/ui/tabs";
import { Textarea } from "@/react-app/components/ui/textarea";

interface Supplier {
  id: number;
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  tax_id: string;
  payment_terms: string;
  notes: string;
  is_active: number;
}

interface SupplierInvoice {
  id: number;
  supplier_id: number;
  supplier_name?: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  amount: number;
  amount_paid: number;
  status: string;
  payment_date: string;
  payment_method: string;
  description: string;
  notes: string;
}

export default function SuppliersDashboard() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [invoices, setInvoices] = useState<SupplierInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<SupplierInvoice | null>(null);
  const [newSupplier, setNewSupplier] = useState({
    name: "", contact_name: "", phone: "", email: "", address: "",
    category: "", tax_id: "", payment_terms: "", notes: "",
  });
  const [newInvoice, setNewInvoice] = useState({
    supplier_id: "", invoice_number: "", invoice_date: new Date().toISOString().split("T")[0],
    due_date: "", amount: "", description: "", notes: "",
  });
  const [paymentData, setPaymentData] = useState({
    amount: "", payment_method: "transferencia", payment_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [supRes, invRes] = await Promise.all([
        fetch("/api/suppliers"),
        fetch("/api/supplier-invoices"),
      ]);
      if (supRes.ok) {
        const data = await supRes.json();
        setSuppliers(data.suppliers || []);
      }
      if (invRes.ok) {
        const data = await invRes.json();
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error("Error fetching suppliers data:", error);
    }
    setIsLoading(false);
  };

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSupplier ? `/api/suppliers/${editingSupplier.id}` : "/api/suppliers";
      const method = editingSupplier ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSupplier),
      });
      if (res.ok) {
        setIsSupplierDialogOpen(false);
        setEditingSupplier(null);
        resetSupplierForm();
        fetchData();
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
    }
  };

  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/supplier-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newInvoice,
          supplier_id: parseInt(newInvoice.supplier_id),
          amount: parseFloat(newInvoice.amount) || 0,
        }),
      });
      if (res.ok) {
        setIsInvoiceDialogOpen(false);
        resetInvoiceForm();
        fetchData();
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };

  const handlePayInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;
    try {
      const res = await fetch(`/api/supplier-invoices/${payingInvoice.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(paymentData.amount) || 0,
          payment_method: paymentData.payment_method,
          payment_date: paymentData.payment_date,
        }),
      });
      if (res.ok) {
        setIsPayDialogOpen(false);
        setPayingInvoice(null);
        setPaymentData({ amount: "", payment_method: "transferencia", payment_date: new Date().toISOString().split("T")[0] });
        fetchData();
      }
    } catch (error) {
      console.error("Error paying invoice:", error);
    }
  };

  const resetSupplierForm = () => {
    setNewSupplier({
      name: "", contact_name: "", phone: "", email: "", address: "",
      category: "", tax_id: "", payment_terms: "", notes: "",
    });
  };

  const resetInvoiceForm = () => {
    setNewInvoice({
      supplier_id: "", invoice_number: "", invoice_date: new Date().toISOString().split("T")[0],
      due_date: "", amount: "", description: "", notes: "",
    });
  };

  const openEditSupplier = (sup: Supplier) => {
    setEditingSupplier(sup);
    setNewSupplier({
      name: sup.name, contact_name: sup.contact_name || "", phone: sup.phone || "",
      email: sup.email || "", address: sup.address || "", category: sup.category || "",
      tax_id: sup.tax_id || "", payment_terms: sup.payment_terms || "", notes: sup.notes || "",
    });
    setIsSupplierDialogOpen(true);
  };

  const openPayInvoice = (inv: SupplierInvoice) => {
    setPayingInvoice(inv);
    const remaining = inv.amount - (inv.amount_paid || 0);
    setPaymentData({ ...paymentData, amount: remaining.toString() });
    setIsPayDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" }).format(amount);
  };

  const activeSuppliers = suppliers.filter(s => s.is_active).length;
  const pendingInvoices = invoices.filter(i => i.status === "pending" || i.status === "partial");
  const totalPending = pendingInvoices.reduce((sum, i) => sum + (i.amount - (i.amount_paid || 0)), 0);
  const overdueInvoices = pendingInvoices.filter(i => i.due_date && new Date(i.due_date) < new Date()).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-luxury font-bold text-stone-800">Proveedores</h1>
          <p className="text-stone-500 font-cursive">Gestión de suplidores y facturas</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">Proveedores Activos</p>
              <p className="text-2xl font-bold text-amber-700 mt-1">{activeSuppliers}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Truck className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Facturas Pendientes</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">{pendingInvoices.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-red-50 to-red-100 border-red-200 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Total por Pagar</p>
              <p className="text-2xl font-bold text-red-700 mt-1">{formatCurrency(totalPending)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Vencidas</p>
              <p className="text-2xl font-bold text-orange-700 mt-1">{overdueInvoices}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="suppliers" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="bg-stone-100 rounded-full p-1">
            <TabsTrigger value="suppliers" className="rounded-full px-6">Proveedores</TabsTrigger>
            <TabsTrigger value="invoices" className="rounded-full px-6">Facturas</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Dialog open={isSupplierDialogOpen} onOpenChange={(open) => {
              setIsSupplierDialogOpen(open);
              if (!open) { setEditingSupplier(null); resetSupplierForm(); }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Proveedor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-luxury text-stone-800">
                    {editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSupplierSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label>Nombre de Empresa *</Label>
                      <Input value={newSupplier.name} onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})} required className="border-stone-300" />
                    </div>
                    <div>
                      <Label>Contacto</Label>
                      <Input value={newSupplier.contact_name} onChange={(e) => setNewSupplier({...newSupplier, contact_name: e.target.value})} className="border-stone-300" />
                    </div>
                    <div>
                      <Label>RIF / Cédula</Label>
                      <Input value={newSupplier.tax_id} onChange={(e) => setNewSupplier({...newSupplier, tax_id: e.target.value})} className="border-stone-300" />
                    </div>
                    <div>
                      <Label>Teléfono</Label>
                      <Input value={newSupplier.phone} onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})} className="border-stone-300" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" value={newSupplier.email} onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})} className="border-stone-300" />
                    </div>
                    <div className="col-span-2">
                      <Label>Dirección</Label>
                      <Input value={newSupplier.address} onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})} className="border-stone-300" />
                    </div>
                    <div>
                      <Label>Categoría</Label>
                      <Select value={newSupplier.category} onValueChange={(v) => setNewSupplier({...newSupplier, category: v})}>
                        <SelectTrigger className="border-stone-300"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alimentos">Alimentos</SelectItem>
                          <SelectItem value="bebidas">Bebidas</SelectItem>
                          <SelectItem value="limpieza">Limpieza</SelectItem>
                          <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                          <SelectItem value="servicios">Servicios</SelectItem>
                          <SelectItem value="equipos">Equipos</SelectItem>
                          <SelectItem value="otros">Otros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Términos de Pago</Label>
                      <Select value={newSupplier.payment_terms} onValueChange={(v) => setNewSupplier({...newSupplier, payment_terms: v})}>
                        <SelectTrigger className="border-stone-300"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contado">Contado</SelectItem>
                          <SelectItem value="15_dias">15 días</SelectItem>
                          <SelectItem value="30_dias">30 días</SelectItem>
                          <SelectItem value="60_dias">60 días</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label>Notas</Label>
                      <Textarea value={newSupplier.notes} onChange={(e) => setNewSupplier({...newSupplier, notes: e.target.value})} className="border-stone-300" rows={2} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full">
                    {editingSupplier ? "Guardar Cambios" : "Registrar Proveedor"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 rounded-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Nueva Factura
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-luxury text-stone-800">Registrar Factura</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleInvoiceSubmit} className="space-y-4">
                  <div>
                    <Label>Proveedor *</Label>
                    <Select value={newInvoice.supplier_id} onValueChange={(v) => setNewInvoice({...newInvoice, supplier_id: v})}>
                      <SelectTrigger className="border-stone-300"><SelectValue placeholder="Seleccionar proveedor" /></SelectTrigger>
                      <SelectContent>
                        {suppliers.filter(s => s.is_active).map(sup => (
                          <SelectItem key={sup.id} value={sup.id.toString()}>{sup.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Nº Factura</Label>
                      <Input value={newInvoice.invoice_number} onChange={(e) => setNewInvoice({...newInvoice, invoice_number: e.target.value})} className="border-stone-300" />
                    </div>
                    <div>
                      <Label>Monto (USD) *</Label>
                      <Input type="number" step="0.01" value={newInvoice.amount} onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})} required className="border-stone-300" />
                    </div>
                    <div>
                      <Label>Fecha Factura *</Label>
                      <Input type="date" value={newInvoice.invoice_date} onChange={(e) => setNewInvoice({...newInvoice, invoice_date: e.target.value})} required className="border-stone-300" />
                    </div>
                    <div>
                      <Label>Fecha Vencimiento</Label>
                      <Input type="date" value={newInvoice.due_date} onChange={(e) => setNewInvoice({...newInvoice, due_date: e.target.value})} className="border-stone-300" />
                    </div>
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Input value={newInvoice.description} onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})} className="border-stone-300" />
                  </div>
                  <div>
                    <Label>Notas</Label>
                    <Textarea value={newInvoice.notes} onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})} className="border-stone-300" rows={2} />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full">
                    Registrar Factura
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers">
          <Card className="p-6 rounded-3xl border-stone-200">
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : suppliers.length === 0 ? (
              <div className="text-center py-12 text-stone-500">
                <Truck className="h-12 w-12 mx-auto mb-3 text-stone-300" />
                <p className="font-cursive">No hay proveedores registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {suppliers.map(sup => (
                  <div key={sup.id} className={`flex items-center justify-between p-4 rounded-2xl ${sup.is_active ? "bg-stone-50 hover:bg-stone-100" : "bg-stone-100 opacity-60"} transition-colors`}>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
                        {sup.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-stone-800">{sup.name}</p>
                        <div className="flex items-center gap-3 text-sm text-stone-500 flex-wrap">
                          {sup.category && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs">{sup.category}</span>}
                          {sup.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{sup.phone}</span>}
                          {sup.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{sup.email}</span>}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => openEditSupplier(sup)} className="rounded-full hover:bg-amber-100">
                      <Pencil className="h-4 w-4 text-amber-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card className="p-6 rounded-3xl border-stone-200">
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-stone-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12 text-stone-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-stone-300" />
                <p className="font-cursive">No hay facturas registradas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map(inv => {
                  const remaining = inv.amount - (inv.amount_paid || 0);
                  const isOverdue = inv.due_date && new Date(inv.due_date) < new Date() && inv.status !== "paid";
                  return (
                    <div key={inv.id} className={`flex items-center justify-between p-4 rounded-2xl ${isOverdue ? "bg-red-50" : "bg-stone-50"} hover:bg-stone-100 transition-colors`}>
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          inv.status === "paid" ? "bg-emerald-100 text-emerald-600" : 
                          isOverdue ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                        }`}>
                          {inv.status === "paid" ? <CheckCircle2 className="h-5 w-5" /> : 
                           isOverdue ? <AlertCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-stone-800">{inv.supplier_name || `Proveedor #${inv.supplier_id}`}</p>
                          <div className="flex items-center gap-2 text-sm text-stone-500">
                            {inv.invoice_number && <span>#{inv.invoice_number}</span>}
                            <span>•</span>
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(inv.invoice_date).toLocaleDateString("es-VE")}</span>
                            {inv.due_date && (
                              <>
                                <span>•</span>
                                <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                                  Vence: {new Date(inv.due_date).toLocaleDateString("es-VE")}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-stone-800">{formatCurrency(inv.amount)}</p>
                          {inv.status !== "paid" && remaining > 0 && (
                            <p className="text-xs text-red-600">Pendiente: {formatCurrency(remaining)}</p>
                          )}
                        </div>
                        {inv.status !== "paid" && (
                          <Button size="sm" onClick={() => openPayInvoice(inv)} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full">
                            Pagar
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pay Invoice Dialog */}
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-luxury text-stone-800">Registrar Pago</DialogTitle>
          </DialogHeader>
          {payingInvoice && (
            <form onSubmit={handlePayInvoice} className="space-y-4">
              <div className="bg-amber-50 p-3 rounded-xl">
                <p className="text-sm text-amber-600">Factura #{payingInvoice.invoice_number || payingInvoice.id}</p>
                <p className="font-semibold text-amber-700">{payingInvoice.supplier_name}</p>
                <p className="text-xs text-stone-500">Pendiente: {formatCurrency(payingInvoice.amount - (payingInvoice.amount_paid || 0))}</p>
              </div>
              <div>
                <Label>Monto a Pagar (USD)</Label>
                <Input type="number" step="0.01" value={paymentData.amount} onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})} required className="border-stone-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Método</Label>
                  <Select value={paymentData.payment_method} onValueChange={(v) => setPaymentData({...paymentData, payment_method: v})}>
                    <SelectTrigger className="border-stone-300"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="pago_movil">Pago Móvil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fecha</Label>
                  <Input type="date" value={paymentData.payment_date} onChange={(e) => setPaymentData({...paymentData, payment_date: e.target.value})} className="border-stone-300" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full">
                Confirmar Pago
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

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
