import { useState, useEffect } from "react";
import {
  Receipt,
  Plus,
  Phone,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  AlertCircle,
  User,
  CreditCard,
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

interface AccountReceivable {
  id: number;
  guest_id: number;
  guest_name?: string;
  guest_phone?: string;
  reservation_id: number;
  room_code?: string;
  description: string;
  amount: number;
  amount_paid: number;
  due_date: string;
  status: string;
  notes: string;
  created_at: string;
}

interface Guest {
  id: number;
  name: string;
  phone: string;
}

interface Reservation {
  id: number;
  guest_id: number;
  room_id: number;
  room_code?: string;
  check_in: string;
  check_out: string;
}

export default function AccountsReceivableDashboard() {
  const [accounts, setAccounts] = useState<AccountReceivable[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [payingAccount, setPayingAccount] = useState<AccountReceivable | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [newAccount, setNewAccount] = useState({
    guest_id: "",
    reservation_id: "",
    description: "",
    amount: "",
    due_date: "",
    notes: "",
  });

  const [paymentData, setPaymentData] = useState({
    amount: "",
    payment_method: "transferencia",
    payment_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [accRes, guestRes, resRes] = await Promise.all([
        fetch("/api/accounts-receivable"),
        fetch("/api/guests"),
        fetch("/api/reservations"),
      ]);
      if (accRes.ok) {
        const data = await accRes.json();
        setAccounts(data.accounts || []);
      }
      if (guestRes.ok) {
        const data = await guestRes.json();
        setGuests(data.guests || []);
      }
      if (resRes.ok) {
        const data = await resRes.json();
        setReservations(data.reservations || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/accounts-receivable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_id: parseInt(newAccount.guest_id) || null,
          reservation_id: parseInt(newAccount.reservation_id) || null,
          description: newAccount.description,
          amount: parseFloat(newAccount.amount) || 0,
          due_date: newAccount.due_date || null,
          notes: newAccount.notes,
        }),
      });
      if (res.ok) {
        setIsAddDialogOpen(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error("Error saving account:", error);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingAccount) return;
    try {
      const res = await fetch(`/api/accounts-receivable/${payingAccount.id}/pay`, {
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
        setPayingAccount(null);
        setPaymentData({
          amount: "",
          payment_method: "transferencia",
          payment_date: new Date().toISOString().split("T")[0],
        });
        fetchData();
      }
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  };

  const resetForm = () => {
    setNewAccount({
      guest_id: "",
      reservation_id: "",
      description: "",
      amount: "",
      due_date: "",
      notes: "",
    });
  };

  const openPayDialog = (acc: AccountReceivable) => {
    setPayingAccount(acc);
    const remaining = acc.amount - (acc.amount_paid || 0);
    setPaymentData({ ...paymentData, amount: remaining.toString() });
    setIsPayDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" }).format(amount);
  };

  const filteredAccounts = accounts.filter(acc => {
    if (filterStatus === "all") return true;
    if (filterStatus === "pending") return acc.status === "pending" || acc.status === "partial";
    if (filterStatus === "overdue") {
      const isOverdue = acc.due_date && new Date(acc.due_date) < new Date();
      return (acc.status === "pending" || acc.status === "partial") && isOverdue;
    }
    return acc.status === filterStatus;
  });

  const pendingAccounts = accounts.filter(a => a.status === "pending" || a.status === "partial");
  const totalPending = pendingAccounts.reduce((sum, a) => sum + (a.amount - (a.amount_paid || 0)), 0);
  const overdueAccounts = pendingAccounts.filter(a => a.due_date && new Date(a.due_date) < new Date());
  const overdueTotal = overdueAccounts.reduce((sum, a) => sum + (a.amount - (a.amount_paid || 0)), 0);
  const paidThisMonth = accounts.filter(a => {
    if (a.status !== "paid") return false;
    const now = new Date();
    const updated = new Date(a.created_at);
    return updated.getMonth() === now.getMonth() && updated.getFullYear() === now.getFullYear();
  }).reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-luxury font-bold text-stone-800">Cuentas por Cobrar</h1>
          <p className="text-stone-500 font-cursive">Gestión de pagos pendientes de huéspedes</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cuenta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-luxury text-stone-800">Registrar Cuenta por Cobrar</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Huésped</Label>
                <Select value={newAccount.guest_id} onValueChange={(v) => setNewAccount({...newAccount, guest_id: v})}>
                  <SelectTrigger className="border-stone-300"><SelectValue placeholder="Seleccionar huésped" /></SelectTrigger>
                  <SelectContent>
                    {guests.map(g => (
                      <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Reservación (opcional)</Label>
                <Select value={newAccount.reservation_id} onValueChange={(v) => setNewAccount({...newAccount, reservation_id: v})}>
                  <SelectTrigger className="border-stone-300"><SelectValue placeholder="Seleccionar reservación" /></SelectTrigger>
                  <SelectContent>
                    {reservations.slice(0, 50).map(r => (
                      <SelectItem key={r.id} value={r.id.toString()}>
                        {r.room_code} - {new Date(r.check_in).toLocaleDateString("es-VE")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Monto (USD) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newAccount.amount}
                    onChange={(e) => setNewAccount({...newAccount, amount: e.target.value})}
                    required
                    className="border-stone-300"
                  />
                </div>
                <div>
                  <Label>Fecha Vencimiento</Label>
                  <Input
                    type="date"
                    value={newAccount.due_date}
                    onChange={(e) => setNewAccount({...newAccount, due_date: e.target.value})}
                    className="border-stone-300"
                  />
                </div>
              </div>
              <div>
                <Label>Descripción *</Label>
                <Input
                  value={newAccount.description}
                  onChange={(e) => setNewAccount({...newAccount, description: e.target.value})}
                  placeholder="Ej: Saldo pendiente reservación"
                  required
                  className="border-stone-300"
                />
              </div>
              <div>
                <Label>Notas</Label>
                <Textarea
                  value={newAccount.notes}
                  onChange={(e) => setNewAccount({...newAccount, notes: e.target.value})}
                  className="border-stone-300"
                  rows={2}
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full">
                Registrar Cuenta
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">Cuentas Pendientes</p>
              <p className="text-2xl font-bold text-amber-700 mt-1">{pendingAccounts.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Receipt className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total por Cobrar</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(totalPending)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-red-50 to-red-100 border-red-200 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Vencidas ({overdueAccounts.length})</p>
              <p className="text-2xl font-bold text-red-700 mt-1">{formatCurrency(overdueTotal)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 font-medium">Cobrado Este Mes</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(paidThisMonth)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48 border-stone-300 rounded-full">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="overdue">Vencidas</SelectItem>
            <SelectItem value="paid">Pagadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Accounts List */}
      <Card className="p-6 rounded-3xl border-stone-200">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            <Receipt className="h-12 w-12 mx-auto mb-3 text-stone-300" />
            <p className="font-cursive">No hay cuentas por cobrar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAccounts.map(acc => {
              const remaining = acc.amount - (acc.amount_paid || 0);
              const isOverdue = acc.due_date && new Date(acc.due_date) < new Date() && acc.status !== "paid";
              const isPaid = acc.status === "paid";

              return (
                <div
                  key={acc.id}
                  className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl gap-4 ${
                    isPaid ? "bg-emerald-50" : isOverdue ? "bg-red-50" : "bg-stone-50"
                  } hover:bg-stone-100 transition-colors`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        isPaid
                          ? "bg-emerald-100 text-emerald-600"
                          : isOverdue
                          ? "bg-red-100 text-red-600"
                          : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : isOverdue ? (
                        <AlertCircle className="h-6 w-6" />
                      ) : (
                        <Clock className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-stone-800 flex items-center gap-2">
                        <User className="h-4 w-4 text-stone-400" />
                        {acc.guest_name || `Huésped #${acc.guest_id}`}
                        {acc.room_code && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            {acc.room_code}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-stone-600">{acc.description}</p>
                      <div className="flex items-center gap-3 text-xs text-stone-500 mt-1 flex-wrap">
                        {acc.guest_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {acc.guest_phone}
                          </span>
                        )}
                        {acc.due_date && (
                          <span className={`flex items-center gap-1 ${isOverdue && !isPaid ? "text-red-600 font-medium" : ""}`}>
                            <Calendar className="h-3 w-3" />
                            Vence: {new Date(acc.due_date).toLocaleDateString("es-VE")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-auto">
                    <div className="text-right">
                      <p className="font-semibold text-stone-800">{formatCurrency(acc.amount)}</p>
                      {!isPaid && remaining > 0 && remaining < acc.amount && (
                        <p className="text-xs text-amber-600">Abonado: {formatCurrency(acc.amount_paid)}</p>
                      )}
                      {!isPaid && (
                        <p className="text-xs text-red-600">Pendiente: {formatCurrency(remaining)}</p>
                      )}
                    </div>
                    {!isPaid && (
                      <Button
                        size="sm"
                        onClick={() => openPayDialog(acc)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full"
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Cobrar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Payment Dialog */}
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-luxury text-stone-800">Registrar Cobro</DialogTitle>
          </DialogHeader>
          {payingAccount && (
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="bg-amber-50 p-3 rounded-xl">
                <p className="text-sm text-amber-600">{payingAccount.description}</p>
                <p className="font-semibold text-amber-700">{payingAccount.guest_name}</p>
                <p className="text-xs text-stone-500">
                  Pendiente: {formatCurrency(payingAccount.amount - (payingAccount.amount_paid || 0))}
                </p>
              </div>
              <div>
                <Label>Monto a Cobrar (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  required
                  className="border-stone-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Método</Label>
                  <Select
                    value={paymentData.payment_method}
                    onValueChange={(v) => setPaymentData({ ...paymentData, payment_method: v })}
                  >
                    <SelectTrigger className="border-stone-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="pago_movil">Pago Móvil</SelectItem>
                      <SelectItem value="zelle">Zelle</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={paymentData.payment_date}
                    onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
                    className="border-stone-300"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full"
              >
                Confirmar Cobro
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
