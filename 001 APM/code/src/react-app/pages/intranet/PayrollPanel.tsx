import { useState, useEffect } from "react";
import {
  X,
  Search,
  Users,
  Calendar,
  ChevronLeft,
  Check,
  DollarSign,
  Briefcase,
  Phone,
  Mail,
  UserPlus,
  Wallet,
  Edit2,
  Trash2,
} from "lucide-react";

interface Employee {
  id: number;
  name: string;
  document_id: string | null;
  phone: string | null;
  email: string | null;
  position: string | null;
  department: string | null;
  hire_date: string | null;
  base_salary: number | null;
  salary_currency: string;
  is_active: number;
  notes: string | null;
}

interface PayrollRecord {
  id: number;
  employee_id: number;
  period_month: number;
  period_year: number;
  base_amount: number;
  bonuses: number;
  deductions: number;
  total_amount: number;
  currency: string;
  is_paid: number;
  paid_date: string | null;
  notes: string | null;
  employee_name?: string;
}

const DEPARTMENTS = [
  "Recepción",
  "Limpieza",
  "Mantenimiento",
  "Administración",
  "Cocina",
  "Seguridad",
  "Piscina",
  "Jardinería",
];

const POSITIONS = [
  "Gerente",
  "Recepcionista",
  "Camarero/a",
  "Personal de Limpieza",
  "Mantenimiento",
  "Cocinero/a",
  "Seguridad",
  "Jardinero/a",
  "Piscinero/a",
  "Administrador/a",
];

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function PayrollPanel() {
  const [activeTab, setActiveTab] = useState<"employees" | "payroll">("employees");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showPayrollForm, setShowPayrollForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    document_id: "",
    phone: "",
    email: "",
    position: "",
    department: "",
    hire_date: "",
    base_salary: "",
    salary_currency: "USD",
    notes: "",
  });

  const [payrollForm, setPayrollForm] = useState({
    employee_id: "",
    period_month: new Date().getMonth() + 1,
    period_year: new Date().getFullYear(),
    base_amount: "",
    bonuses: "0",
    deductions: "0",
    currency: "USD",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, payRes, rateRes] = await Promise.all([
        fetch("/api/employees"),
        fetch("/api/payroll"),
        fetch("/api/finance/exchange-rate"),
      ]);

      if (empRes.ok) setEmployees(await empRes.json());
      if (payRes.ok) setPayrollRecords(await payRes.json());
      if (rateRes.ok) {
        const data = await rateRes.json();
        setExchangeRate(data.rate);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingEmployee ? `/api/employees/${editingEmployee.id}` : "/api/employees";
      const method = editingEmployee ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...employeeForm,
          base_salary: employeeForm.base_salary ? parseFloat(employeeForm.base_salary) : null,
        }),
      });

      if (res.ok) {
        setShowEmployeeForm(false);
        setEditingEmployee(null);
        resetEmployeeForm();
        fetchData();
      }
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  const handlePayrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const baseAmount = parseFloat(payrollForm.base_amount) || 0;
      const bonuses = parseFloat(payrollForm.bonuses) || 0;
      const deductions = parseFloat(payrollForm.deductions) || 0;
      const totalAmount = baseAmount + bonuses - deductions;

      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payrollForm,
          employee_id: parseInt(payrollForm.employee_id),
          base_amount: baseAmount,
          bonuses,
          deductions,
          total_amount: totalAmount,
        }),
      });

      if (res.ok) {
        setShowPayrollForm(false);
        resetPayrollForm();
        fetchData();
      }
    } catch (error) {
      console.error("Error saving payroll:", error);
    }
  };

  const handleMarkPaid = async (payrollId: number) => {
    try {
      const res = await fetch(`/api/payroll/${payrollId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paid_date: new Date().toISOString().split("T")[0] }),
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error marking as paid:", error);
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este empleado?")) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const resetEmployeeForm = () => {
    setEmployeeForm({
      name: "",
      document_id: "",
      phone: "",
      email: "",
      position: "",
      department: "",
      hire_date: "",
      base_salary: "",
      salary_currency: "USD",
      notes: "",
    });
  };

  const resetPayrollForm = () => {
    setPayrollForm({
      employee_id: "",
      period_month: new Date().getMonth() + 1,
      period_year: new Date().getFullYear(),
      base_amount: "",
      bonuses: "0",
      deductions: "0",
      currency: "USD",
      notes: "",
    });
  };

  const openEditEmployee = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmployeeForm({
      name: emp.name,
      document_id: emp.document_id || "",
      phone: emp.phone || "",
      email: emp.email || "",
      position: emp.position || "",
      department: emp.department || "",
      hire_date: emp.hire_date || "",
      base_salary: emp.base_salary?.toString() || "",
      salary_currency: emp.salary_currency || "USD",
      notes: emp.notes || "",
    });
    setShowEmployeeForm(true);
  };

  const openPayrollForEmployee = (emp: Employee) => {
    setPayrollForm({
      ...payrollForm,
      employee_id: emp.id.toString(),
      base_amount: emp.base_salary?.toString() || "",
    });
    setShowPayrollForm(true);
  };

  const formatCurrency = (amount: number, currency = "USD") => {
    if (currency === "VES") {
      return `Bs ${amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.document_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDepartment === "all" || emp.department === filterDepartment;
    return matchesSearch && matchesDept && emp.is_active;
  });

  const filteredPayroll = payrollRecords.filter(
    (p) => p.period_month === filterMonth && p.period_year === filterYear
  );

  const totalPayroll = filteredPayroll.reduce((sum, p) => sum + p.total_amount, 0);
  const pendingPayroll = filteredPayroll.filter((p) => !p.is_paid);
  const paidPayroll = filteredPayroll.filter((p) => p.is_paid);

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
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Nómina y Empleados</h1>
            <p className="text-slate-500 text-sm">Gestión de personal y pagos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingEmployee(null);
              resetEmployeeForm();
              setShowEmployeeForm(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl hover:opacity-90 transition-opacity"
          >
            <UserPlus className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">Nuevo Empleado</span>
          </button>
          <button
            onClick={() => {
              resetPayrollForm();
              setShowPayrollForm(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-800 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Wallet className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">Registrar Nómina</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1 flex gap-1">
        <button
          onClick={() => setActiveTab("employees")}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === "employees"
              ? "bg-cyan-500 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          Empleados ({employees.filter((e) => e.is_active).length})
        </button>
        <button
          onClick={() => setActiveTab("payroll")}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === "payroll"
              ? "bg-amber-500 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Wallet className="w-4 h-4" />
          Nómina ({MONTHS[filterMonth - 1]})
        </button>
      </div>

      {/* EMPLOYEES TAB */}
      {activeTab === "employees" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
              <Users className="w-5 h-5 text-cyan-600 mb-2" />
              <p className="text-2xl font-bold text-cyan-700">{employees.filter((e) => e.is_active).length}</p>
              <p className="text-xs text-cyan-600">Empleados Activos</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <DollarSign className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-2xl font-bold text-emerald-700">
                {formatCurrency(employees.reduce((sum, e) => sum + (e.base_salary || 0), 0))}
              </p>
              <p className="text-xs text-emerald-600">Salarios Base/Mes</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <Briefcase className="w-5 h-5 text-purple-600 mb-2" />
              <p className="text-2xl font-bold text-purple-700">
                {new Set(employees.map((e) => e.department).filter(Boolean)).size}
              </p>
              <p className="text-xs text-purple-600">Departamentos</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <Calendar className="w-5 h-5 text-amber-600 mb-2" />
              <p className="text-2xl font-bold text-amber-700">{pendingPayroll.length}</p>
              <p className="text-xs text-amber-600">Pagos Pendientes</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, cargo o cédula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">Todos los departamentos</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Employees List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {filteredEmployees.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <div key={emp.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-800">{emp.name}</span>
                          {emp.department && (
                            <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded">
                              {emp.department}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{emp.position || "Sin cargo asignado"}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-2">
                          {emp.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {emp.phone}
                            </span>
                          )}
                          {emp.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {emp.email}
                            </span>
                          )}
                          {emp.document_id && (
                            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                              C.I.: {emp.document_id}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          {emp.base_salary && (
                            <>
                              <p className="text-lg font-bold text-emerald-600">
                                {formatCurrency(emp.base_salary, emp.salary_currency)}
                              </p>
                              <p className="text-xs text-slate-500">/mes</p>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => openPayrollForEmployee(emp)}
                          className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                          title="Registrar nómina"
                        >
                          <Wallet className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditEmployee(emp)}
                          className="p-2 bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay empleados registrados</p>
                <button
                  onClick={() => setShowEmployeeForm(true)}
                  className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  Agregar Primer Empleado
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* PAYROLL TAB */}
      {activeTab === "payroll" && (
        <>
          {/* Period Filter */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <span className="text-slate-600 font-medium">Período:</span>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                {MONTHS.map((month, idx) => (
                  <option key={idx} value={idx + 1}>{month}</option>
                ))}
              </select>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                {[2024, 2025, 2026, 2027].map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payroll Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-700">{formatCurrency(totalPayroll)}</p>
                  <p className="text-xs text-amber-600">Total Nómina {MONTHS[filterMonth - 1]}</p>
                </div>
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-700">{paidPayroll.length}</p>
                  <p className="text-xs text-emerald-600">Pagados</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-700">{pendingPayroll.length}</p>
                  <p className="text-xs text-red-600">Pendientes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payroll List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {filteredPayroll.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {filteredPayroll.map((record) => (
                  <div key={record.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-800">{record.employee_name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            record.is_paid
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {record.is_paid ? "Pagado" : "Pendiente"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-1">
                          <span>Base: {formatCurrency(record.base_amount)}</span>
                          {record.bonuses > 0 && (
                            <span className="text-emerald-600">+Bonos: {formatCurrency(record.bonuses)}</span>
                          )}
                          {record.deductions > 0 && (
                            <span className="text-red-600">-Deduc.: {formatCurrency(record.deductions)}</span>
                          )}
                        </div>
                        {record.paid_date && (
                          <p className="text-xs text-slate-400 mt-1">
                            Pagado el {new Date(record.paid_date).toLocaleDateString("es-VE")}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xl font-bold text-slate-800">
                            {formatCurrency(record.total_amount, record.currency)}
                          </p>
                          {exchangeRate && record.currency === "USD" && (
                            <p className="text-xs text-slate-500">
                              ≈ Bs {(record.total_amount * exchangeRate).toLocaleString("es-VE")}
                            </p>
                          )}
                        </div>
                        {!record.is_paid && (
                          <button
                            onClick={() => handleMarkPaid(record.id)}
                            className="px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1"
                          >
                            <Check className="w-4 h-4" />
                            <span className="hidden sm:inline">Marcar Pagado</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay registros de nómina para {MONTHS[filterMonth - 1]} {filterYear}</p>
                <button
                  onClick={() => setShowPayrollForm(true)}
                  className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Registrar Nómina
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Employee Form Modal */}
      {showEmployeeForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                {editingEmployee ? "Editar Empleado" : "Nuevo Empleado"}
              </h3>
              <button
                onClick={() => {
                  setShowEmployeeForm(false);
                  setEditingEmployee(null);
                  resetEmployeeForm();
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleEmployeeSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={employeeForm.name}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cédula</label>
                  <input
                    type="text"
                    value={employeeForm.document_id}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, document_id: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    placeholder="V-12345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={employeeForm.phone}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
                  <select
                    value={employeeForm.department}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Seleccionar...</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
                  <select
                    value={employeeForm.position}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Seleccionar...</option>
                    {POSITIONS.map((pos) => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Ingreso</label>
                  <input
                    type="date"
                    value={employeeForm.hire_date}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, hire_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Salario Base (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={employeeForm.base_salary}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, base_salary: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                <textarea
                  value={employeeForm.notes}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmployeeForm(false);
                    setEditingEmployee(null);
                    resetEmployeeForm();
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {editingEmployee ? "Guardar Cambios" : "Crear Empleado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payroll Form Modal */}
      {showPayrollForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Registrar Nómina</h3>
              <button
                onClick={() => {
                  setShowPayrollForm(false);
                  resetPayrollForm();
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handlePayrollSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Empleado *</label>
                <select
                  value={payrollForm.employee_id}
                  onChange={(e) => {
                    const emp = employees.find((em) => em.id === parseInt(e.target.value));
                    setPayrollForm({
                      ...payrollForm,
                      employee_id: e.target.value,
                      base_amount: emp?.base_salary?.toString() || payrollForm.base_amount,
                    });
                  }}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  required
                >
                  <option value="">Seleccionar empleado...</option>
                  {employees.filter((e) => e.is_active).map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.position || "Sin cargo"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mes *</label>
                  <select
                    value={payrollForm.period_month}
                    onChange={(e) => setPayrollForm({ ...payrollForm, period_month: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    {MONTHS.map((month, idx) => (
                      <option key={idx} value={idx + 1}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Año *</label>
                  <select
                    value={payrollForm.period_year}
                    onChange={(e) => setPayrollForm({ ...payrollForm, period_year: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    {[2024, 2025, 2026, 2027].map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monto Base (USD) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    value={payrollForm.base_amount}
                    onChange={(e) => setPayrollForm({ ...payrollForm, base_amount: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bonos (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={payrollForm.bonuses}
                    onChange={(e) => setPayrollForm({ ...payrollForm, bonuses: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Deducciones (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={payrollForm.deductions}
                    onChange={(e) => setPayrollForm({ ...payrollForm, deductions: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Total Preview */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-700 mb-1">Total a Pagar:</p>
                <p className="text-2xl font-bold text-amber-800">
                  {formatCurrency(
                    (parseFloat(payrollForm.base_amount) || 0) +
                    (parseFloat(payrollForm.bonuses) || 0) -
                    (parseFloat(payrollForm.deductions) || 0)
                  )}
                </p>
                {exchangeRate && (
                  <p className="text-sm text-amber-600">
                    ≈ Bs {(
                      ((parseFloat(payrollForm.base_amount) || 0) +
                      (parseFloat(payrollForm.bonuses) || 0) -
                      (parseFloat(payrollForm.deductions) || 0)) * exchangeRate
                    ).toLocaleString("es-VE")}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                <textarea
                  value={payrollForm.notes}
                  onChange={(e) => setPayrollForm({ ...payrollForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPayrollForm(false);
                    resetPayrollForm();
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-800 rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Registrar Nómina
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
