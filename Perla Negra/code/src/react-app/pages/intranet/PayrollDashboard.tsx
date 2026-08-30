import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  DollarSign,
  Calendar,
  Briefcase,
  Phone,
  CreditCard,
  CheckCircle2,
  Clock,
  Pencil,
  Banknote,
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

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  phone: string;
  email: string;
  document_id: string;
  hire_date: string;
  salary: number;
  salary_type: string;
  bank_name: string;
  bank_account: string;
  is_active: number;
  notes: string;
}

interface PayrollPayment {
  id: number;
  employee_id: number;
  employee_name?: string;
  pay_period_start: string;
  pay_period_end: string;
  base_salary: number;
  bonuses: number;
  deductions: number;
  net_amount: number;
  payment_method: string;
  payment_date: string;
  status: string;
  notes: string;
}

export default function PayrollDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payments, setPayments] = useState<PayrollPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: "", position: "", department: "", phone: "", email: "",
    document_id: "", hire_date: "", salary: "", salary_type: "monthly",
    bank_name: "", bank_account: "", notes: "",
  });
  const [newPayment, setNewPayment] = useState({
    employee_id: "", pay_period_start: "", pay_period_end: "",
    base_salary: "", bonuses: "0", deductions: "0",
    payment_method: "transferencia", payment_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [empRes, payRes] = await Promise.all([
        fetch("/api/employees"),
        fetch("/api/payroll"),
      ]);
      if (empRes.ok) {
        const data = await empRes.json();
        setEmployees(data.employees || []);
      }
      if (payRes.ok) {
        const data = await payRes.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error("Error fetching payroll data:", error);
    }
    setIsLoading(false);
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingEmployee ? `/api/employees/${editingEmployee.id}` : "/api/employees";
      const method = editingEmployee ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newEmployee,
          salary: parseFloat(newEmployee.salary) || 0,
        }),
      });
      if (res.ok) {
        setIsEmployeeDialogOpen(false);
        setEditingEmployee(null);
        resetEmployeeForm();
        fetchData();
      }
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPayment,
          employee_id: parseInt(newPayment.employee_id),
          base_salary: parseFloat(newPayment.base_salary) || 0,
          bonuses: parseFloat(newPayment.bonuses) || 0,
          deductions: parseFloat(newPayment.deductions) || 0,
        }),
      });
      if (res.ok) {
        setIsPaymentDialogOpen(false);
        resetPaymentForm();
        fetchData();
      }
    } catch (error) {
      console.error("Error saving payment:", error);
    }
  };

  const resetEmployeeForm = () => {
    setNewEmployee({
      name: "", position: "", department: "", phone: "", email: "",
      document_id: "", hire_date: "", salary: "", salary_type: "monthly",
      bank_name: "", bank_account: "", notes: "",
    });
  };

  const resetPaymentForm = () => {
    setNewPayment({
      employee_id: "", pay_period_start: "", pay_period_end: "",
      base_salary: "", bonuses: "0", deductions: "0",
      payment_method: "transferencia", payment_date: new Date().toISOString().split("T")[0],
      notes: "",
    });
  };

  const openEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setNewEmployee({
      name: emp.name, position: emp.position || "", department: emp.department || "",
      phone: emp.phone || "", email: emp.email || "", document_id: emp.document_id || "",
      hire_date: emp.hire_date || "", salary: emp.salary?.toString() || "",
      salary_type: emp.salary_type || "monthly", bank_name: emp.bank_name || "",
      bank_account: emp.bank_account || "", notes: emp.notes || "",
    });
    setIsEmployeeDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" }).format(amount);
  };

  const totalPayroll = employees.filter(e => e.is_active).reduce((sum, e) => sum + (e.salary || 0), 0);
  const activeEmployees = employees.filter(e => e.is_active).length;
  const pendingPayments = payments.filter(p => p.status === "pending").length;
  const paidThisMonth = payments
    .filter(p => p.status === "paid" && new Date(p.payment_date).getMonth() === new Date().getMonth())
    .reduce((sum, p) => sum + p.net_amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-luxury font-bold text-stone-800">Nóminas</h1>
          <p className="text-stone-500 font-cursive">Gestión de empleados y pagos de sueldos</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">Empleados Activos</p>
              <p className="text-2xl font-bold text-amber-700 mt-1">{activeEmployees}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Nómina Mensual</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(totalPayroll)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Pagos Pendientes</p>
              <p className="text-2xl font-bold text-orange-700 mt-1">{pendingPayments}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 font-medium">Pagado Este Mes</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(paidThisMonth)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="employees" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="bg-stone-100 rounded-full p-1">
            <TabsTrigger value="employees" className="rounded-full px-6">Empleados</TabsTrigger>
            <TabsTrigger value="payments" className="rounded-full px-6">Pagos</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Dialog open={isEmployeeDialogOpen} onOpenChange={(open) => {
              setIsEmployeeDialogOpen(open);
              if (!open) { setEditingEmployee(null); resetEmployeeForm(); }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Empleado
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-luxury text-stone-800">
                    {editingEmployee ? "Editar Empleado" : "Nuevo Empleado"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label>Nombre Completo *</Label>
                      <Input value={newEmployee.name} onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})} required className="border-stone-300" />
                    </div>
                    <div>
                      <Label>Cargo</Label>
                      <Input value={newEmployee.position} onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})} className="border-stone-300" />
                    </div>
                    <div>
                      <Label>Departamento</Label>
                      <Select value={newEmployee.department} onValueChange={(v) => setNewEmployee({...newEmployee, department: v})}>
                        <SelectTrigger className="border-stone-300"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recepcion">Recepción</SelectItem>
                          <SelectItem value="limpieza">Limpieza</SelectItem>
                          <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                          <SelectItem value="cocina">Cocina</SelectItem>
                          <SelectItem value="seguridad">Seguridad</SelectItem>
                          <SelectItem value="administracion">Administración</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Teléfono</Label>
                      <Input value={newEmployee.phone} onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})} className="border-stone-300" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" value={newEmployee.email} onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})} className="border-stone-300" />
                    </div>
                    <div>
                      <Label>Cédula</Label>
                      <Input value={newEmployee.document_id} onChange={(e) => setNewEmployee({...newEmployee, document_id: e.target.value})} className="border-stone-300" />
                    </div>
                    <div>
                      <Label>Fecha de Ingreso</Label>
                      <Input type="date" value={newEmployee.hire_date} onChange={(e) => setNewEmployee({...newEmployee, hire_date: e.target.value})} className="border-stone-300" />
                    </div>
                    <div>
                      <Label>Salario (USD)</Label>
                      <Input type="number" step="0.01" value={newEmployee.salary} onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})} className="border-stone-300" />
                    </div>
                    <div>
                      <Label>Tipo de Pago</Label>
                      <Select value={newEmployee.salary_type} onValueChange={(v) => setNewEmployee({...newEmployee, salary_type: v})}>
                        <SelectTrigger className="border-stone-300"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Mensual</SelectItem>
                          <SelectItem value="biweekly">Quincenal</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Banco</Label>
                      <Input value={newEmployee.bank_name} onChange={(e) => setNewEmployee({...newEmployee, bank_name: e.target.value})} placeholder="Ej: Banesco" className="border-stone-300" />
                    </div>
                    <div>
                      <Label>Cuenta Bancaria</Label>
                      <Input value={newEmployee.bank_account} onChange={(e) => setNewEmployee({...newEmployee, bank_account: e.target.value})} className="border-stone-300" />
                    </div>
                    <div className="col-span-2">
                      <Label>Notas</Label>
                      <Textarea value={newEmployee.notes} onChange={(e) => setNewEmployee({...newEmployee, notes: e.target.value})} className="border-stone-300" rows={2} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full">
                    {editingEmployee ? "Guardar Cambios" : "Registrar Empleado"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 rounded-full">
                  <Banknote className="h-4 w-4 mr-2" />
                  Registrar Pago
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-luxury text-stone-800">Registrar Pago de Nómina</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <Label>Empleado *</Label>
                    <Select value={newPayment.employee_id} onValueChange={(v) => {
                      const emp = employees.find(e => e.id.toString() === v);
                      setNewPayment({...newPayment, employee_id: v, base_salary: emp?.salary?.toString() || ""});
                    }}>
                      <SelectTrigger className="border-stone-300"><SelectValue placeholder="Seleccionar empleado" /></SelectTrigger>
                      <SelectContent>
                        {employees.filter(e => e.is_active).map(emp => (
                          <SelectItem key={emp.id} value={emp.id.toString()}>{emp.name} - {emp.position}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Período Inicio *</Label>
                      <Input type="date" value={newPayment.pay_period_start} onChange={(e) => setNewPayment({...newPayment, pay_period_start: e.target.value})} required className="border-stone-300" />
                    </div>
                    <div>
                      <Label>Período Fin *</Label>
                      <Input type="date" value={newPayment.pay_period_end} onChange={(e) => setNewPayment({...newPayment, pay_period_end: e.target.value})} required className="border-stone-300" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Salario Base</Label>
                      <Input type="number" step="0.01" value={newPayment.base_salary} onChange={(e) => setNewPayment({...newPayment, base_salary: e.target.value})} className="border-stone-300" />
                    </div>
                    <div>
                      <Label>Bonos</Label>
                      <Input type="number" step="0.01" value={newPayment.bonuses} onChange={(e) => setNewPayment({...newPayment, bonuses: e.target.value})} className="border-stone-300" />
                    </div>
                    <div>
                      <Label>Deducciones</Label>
                      <Input type="number" step="0.01" value={newPayment.deductions} onChange={(e) => setNewPayment({...newPayment, deductions: e.target.value})} className="border-stone-300" />
                    </div>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-xl text-center">
                    <p className="text-sm text-amber-600">Monto Neto a Pagar</p>
                    <p className="text-xl font-bold text-amber-700">
                      {formatCurrency((parseFloat(newPayment.base_salary) || 0) + (parseFloat(newPayment.bonuses) || 0) - (parseFloat(newPayment.deductions) || 0))}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Método de Pago</Label>
                      <Select value={newPayment.payment_method} onValueChange={(v) => setNewPayment({...newPayment, payment_method: v})}>
                        <SelectTrigger className="border-stone-300"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transferencia">Transferencia</SelectItem>
                          <SelectItem value="efectivo">Efectivo</SelectItem>
                          <SelectItem value="pago_movil">Pago Móvil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Fecha de Pago</Label>
                      <Input type="date" value={newPayment.payment_date} onChange={(e) => setNewPayment({...newPayment, payment_date: e.target.value})} className="border-stone-300" />
                    </div>
                  </div>
                  <div>
                    <Label>Notas</Label>
                    <Textarea value={newPayment.notes} onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})} className="border-stone-300" rows={2} />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full">
                    Registrar Pago
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Employees Tab */}
        <TabsContent value="employees">
          <Card className="p-6 rounded-3xl border-stone-200">
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center py-12 text-stone-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-stone-300" />
                <p className="font-cursive">No hay empleados registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {employees.map(emp => (
                  <div key={emp.id} className={`flex items-center justify-between p-4 rounded-2xl ${emp.is_active ? "bg-stone-50 hover:bg-stone-100" : "bg-stone-100 opacity-60"} transition-colors`}>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-stone-800">{emp.name}</p>
                        <div className="flex items-center gap-3 text-sm text-stone-500">
                          <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{emp.position || "Sin cargo"}</span>
                          {emp.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{emp.phone}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-amber-600">{formatCurrency(emp.salary || 0)}</p>
                        <p className="text-xs text-stone-500">{emp.salary_type === "monthly" ? "mensual" : emp.salary_type === "biweekly" ? "quincenal" : "semanal"}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => openEditEmployee(emp)} className="rounded-full hover:bg-amber-100">
                        <Pencil className="h-4 w-4 text-amber-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card className="p-6 rounded-3xl border-stone-200">
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-stone-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12 text-stone-500">
                <CreditCard className="h-12 w-12 mx-auto mb-3 text-stone-300" />
                <p className="font-cursive">No hay pagos registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map(pay => (
                  <div key={pay.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl hover:bg-stone-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${pay.status === "paid" ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"}`}>
                        {pay.status === "paid" ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-stone-800">{pay.employee_name || `Empleado #${pay.employee_id}`}</p>
                        <p className="text-sm text-stone-500">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(pay.pay_period_start).toLocaleDateString("es-VE")} - {new Date(pay.pay_period_end).toLocaleDateString("es-VE")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">{formatCurrency(pay.net_amount)}</p>
                      <p className="text-xs text-stone-500">{pay.payment_method} • {new Date(pay.payment_date).toLocaleDateString("es-VE")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

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
