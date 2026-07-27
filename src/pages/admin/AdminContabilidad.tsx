import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DollarSign, FileText, Search, Printer, Plus,
  Trash2, TrendingUp, TrendingDown, Clock, ShieldAlert,
  Loader2, X, Info, Receipt, Wallet, Calendar
} from "lucide-react";

interface LedgerEntry {
  id: string | number;
  date: string;
  type: "ingreso" | "egreso";
  category: string;
  description: string;
  amount: number;
  reference: string;
  account: "ops" | "marketing" | "payroll" | "profits";
  notes?: string;
}

const FUCSIA = "#FF0096";
const CIAN = "#00C8D4";
const PURPURA = "#9B00CC";

const ACCOUNT_LABELS: Record<string, string> = {
  ops: "Caja General (Ops)",
  marketing: "Marketing (Meta Ads)",
  payroll: "Nómina",
  profits: "Ganancias"
};

const CATEGORIES_EGRESO = [
  "Nómina", "Marketing", "Tecnología", "Oficina", "Legal",
  "Viajes", "Servicios", "Comisiones", "Otros"
];

const CATEGORIES_INGRESO = [
  "Membresía Espacio", "Membresía Geolocalización", "Membresía Imagen", 
  "Membresía App Hotel", "Membresía Reservas", "Membresía Premium", 
  "Membresía Complejos", "Membresía Promo", "Membresía Gold + App",
  "Venta B2B Directa", "Otros Ingresos"
];

export function AdminContabilidad() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading, setLocation]);

  // UI Filter States
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "ingreso" | "egreso">("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntryType, setNewEntryType] = useState<"ingreso" | "egreso">("egreso");
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: "Otros",
    description: "",
    amount: "",
    reference: "",
    account: "ops" as "ops" | "marketing" | "payroll" | "profits",
    notes: ""
  });

  // Query Inflows (membership_payments)
  const { data: payments = [], isLoading: loadingPayments } = useQuery<any[]>({
    queryKey: ["admin-accounting-payments"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("membership_payments")
          .select("*")
          .order("payment_date", { ascending: false });
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn("DB Inflows error, fetching mock data:", err);
        const localKey = "hdv_mock_membership_payments";
        return JSON.parse(localStorage.getItem(localKey) || "[]");
      }
    }
  });

  // Query Outflows (expenses)
  const { data: expenses = [], isLoading: loadingExpenses } = useQuery<any[]>({
    queryKey: ["admin-accounting-expenses"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("expenses")
          .select("*")
          .order("expense_date", { ascending: false });
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn("DB Outflows error, fetching mock data:", err);
        const localKey = "hdv_mock_expenses";
        return JSON.parse(localStorage.getItem(localKey) || "[]");
      }
    }
  });

  // Helper to resolve account from notes prefix
  const resolveAccountFromNotes = (notesStr: string): "ops" | "marketing" | "payroll" | "profits" => {
    if (!notesStr) return "ops";
    if (notesStr.startsWith("[NOMINA]")) return "payroll";
    if (notesStr.startsWith("[META_ADS]")) return "marketing";
    if (notesStr.startsWith("[GANANCIAS]")) return "profits";
    if (notesStr.startsWith("[CAJA_GENERAL]")) return "ops";
    return "ops";
  };

  // Combine datasets chronologically
  const consolidatedLedger: LedgerEntry[] = useMemo(() => {
    const list: LedgerEntry[] = [];

    // Process payments (inflows)
    payments.forEach((p: any) => {
      list.push({
        id: `in-${p.id}`,
        date: p.payment_date || new Date().toISOString().slice(0, 10),
        type: "ingreso",
        category: p.membership_tier ? `Membresía ${p.membership_tier.toUpperCase()}` : "Ingreso",
        description: `Pago de membresía / establecimiento #${p.establishment_id || "N/A"}. Ref: ${p.payment_reference || "Sin ref"}`,
        amount: parseFloat(p.amount) || 0,
        reference: p.payment_reference || "",
        account: "ops", // Inflows go to ops by default (then distributed)
        notes: p.notes || ""
      });
    });

    // Process expenses (outflows)
    expenses.forEach((e: any) => {
      list.push({
        id: `out-${e.id}`,
        date: e.expense_date || new Date().toISOString().slice(0, 10),
        type: "egreso",
        category: e.category || "Otros",
        description: e.description || "Gasto general",
        amount: parseFloat(e.amount) || 0,
        reference: "",
        account: resolveAccountFromNotes(e.notes || ""),
        notes: e.notes || ""
      });
    });

    // Sort descending by date, then by ID
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments, expenses]);

  // Filters logic
  const filteredLedger = useMemo(() => {
    return consolidatedLedger.filter(entry => {
      // 1. Search text filter
      if (search) {
        const query = search.toLowerCase();
        const matchesText =
          entry.description.toLowerCase().includes(query) ||
          entry.category.toLowerCase().includes(query) ||
          entry.reference.toLowerCase().includes(query) ||
          (entry.notes && entry.notes.toLowerCase().includes(query));
        if (!matchesText) return false;
      }

      // 2. Type filter
      if (typeFilter !== "all" && entry.type !== typeFilter) {
        return false;
      }

      // 3. Account filter
      if (accountFilter !== "all" && entry.account !== accountFilter) {
        return false;
      }

      // 4. Start date filter
      if (startDate && entry.date < startDate) {
        return false;
      }

      // 5. End date filter
      if (endDate && entry.date > endDate) {
        return false;
      }

      return true;
    });
  }, [consolidatedLedger, search, typeFilter, accountFilter, startDate, endDate]);

  // Total summary calculations
  const totals = useMemo(() => {
    let ingresos = 0;
    let egresos = 0;
    filteredLedger.forEach(entry => {
      if (entry.type === "ingreso") ingresos += entry.amount;
      else egresos += entry.amount;
    });
    return {
      ingresos,
      egresos,
      balance: ingresos - egresos
    };
  }, [filteredLedger]);

  // Mutations to save manual entry
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(formData.amount);
    if (!formData.description || isNaN(amountVal) || amountVal <= 0) {
      alert("Por favor rellene los campos obligatorios con montos correctos.");
      return;
    }

    setSubmitting(true);
    let dbSuccess = false;

    try {
      if (newEntryType === "egreso") {
        // Build notes prefix representing account
        const accountPrefix = {
          ops: "[CAJA_GENERAL]",
          marketing: "[META_ADS]",
          payroll: "[NOMINA]",
          profits: "[GANANCIAS]"
        }[formData.account];
        const combinedNotes = `${accountPrefix} ${formData.notes}`.trim();

        const payload = {
          category: formData.category,
          description: formData.description,
          amount: amountVal,
          expense_date: formData.date,
          notes: combinedNotes
        };

        const { error } = await supabase.from("expenses").insert([payload]);
        if (!error) dbSuccess = true;
      } else {
        // Ingreso
        const payload = {
          amount: amountVal,
          currency: "USD",
          payment_date: formData.date,
          payment_method: "transferencia",
          payment_reference: formData.reference || `MANUAL-${Date.now().toString().slice(-6)}`,
          notes: `[INGRESO_DIARIO] ${formData.description}. ${formData.notes}`.trim(),
          establishment_id: null,
          membership_tier: "Venta Directa"
        };

        const { error } = await supabase.from("membership_payments").insert([payload]);
        if (!error) dbSuccess = true;
      }
    } catch (err) {
      console.warn("Could not insert transaction to DB, falling back to local:", err);
    }

    // Fallback local storage
    if (!dbSuccess) {
      if (newEntryType === "egreso") {
        const localKey = "hdv_mock_expenses";
        const list = JSON.parse(localStorage.getItem(localKey) || "[]");
        const accountPrefix = {
          ops: "[CAJA_GENERAL]",
          marketing: "[META_ADS]",
          payroll: "[NOMINA]",
          profits: "[GANANCIAS]"
        }[formData.account];
        list.unshift({
          id: Math.floor(Math.random() * 99999),
          category: formData.category,
          description: formData.description,
          amount: amountVal,
          expense_date: formData.date,
          notes: `${accountPrefix} ${formData.notes}`.trim()
        });
        localStorage.setItem(localKey, JSON.stringify(list));
      } else {
        const localKey = "hdv_mock_membership_payments";
        const list = JSON.parse(localStorage.getItem(localKey) || "[]");
        list.unshift({
          id: Math.floor(Math.random() * 99999),
          amount: amountVal,
          currency: "USD",
          payment_date: formData.date,
          payment_method: "transferencia",
          payment_reference: formData.reference || `MANUAL-${Date.now().toString().slice(-6)}`,
          notes: `[INGRESO_DIARIO] ${formData.description}. ${formData.notes}`.trim(),
          establishment_id: null,
          membership_tier: "Venta Directa"
        });
        localStorage.setItem(localKey, JSON.stringify(list));
      }
    }

    qc.invalidateQueries({ queryKey: ["admin-accounting-payments"] });
    qc.invalidateQueries({ queryKey: ["admin-accounting-expenses"] });

    // Reset Form
    setFormData({
      date: new Date().toISOString().slice(0, 10),
      category: "Otros",
      description: "",
      amount: "",
      reference: "",
      account: "ops",
      notes: ""
    });
    setSubmitting(false);
    setShowAddModal(false);
  };

  // Mutation to delete an entry
  const handleDeleteEntry = async (entry: LedgerEntry) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar este registro (${entry.category} - $${entry.amount})?`)) return;

    const realId = entry.id.toString().split("-")[1];
    let dbSuccess = false;

    try {
      if (entry.type === "egreso") {
        const { error } = await supabase.from("expenses").delete().eq("id", realId);
        if (!error) dbSuccess = true;
      } else {
        const { error } = await supabase.from("membership_payments").delete().eq("id", realId);
        if (!error) dbSuccess = true;
      }
    } catch (err) {
      console.warn("Could not delete from DB, checking local:", err);
    }

    if (!dbSuccess) {
      if (entry.type === "egreso") {
        const localKey = "hdv_mock_expenses";
        const list = JSON.parse(localStorage.getItem(localKey) || "[]");
        const filtered = list.filter((e: any) => e.id.toString() !== realId);
        localStorage.setItem(localKey, JSON.stringify(filtered));
      } else {
        const localKey = "hdv_mock_membership_payments";
        const list = JSON.parse(localStorage.getItem(localKey) || "[]");
        const filtered = list.filter((p: any) => p.id.toString() !== realId);
        localStorage.setItem(localKey, JSON.stringify(filtered));
      }
    }

    qc.invalidateQueries({ queryKey: ["admin-accounting-payments"] });
    qc.invalidateQueries({ queryKey: ["admin-accounting-expenses"] });
  };

  // PDF / Window Print Helper
  const handlePrintLedger = () => {
    const win = window.open("", "_blank");
    if (!win) return;

    const dateRangeStr = startDate || endDate
      ? `Filtrado desde ${startDate || "inicio"} hasta ${endDate || "hoy"}`
      : "Todos los registros consolidados";

    const rowsHtml = filteredLedger.map((row, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
        <td style="padding: 10px; font-weight: 600; color: #475569;">${idx + 1}</td>
        <td style="padding: 10px; font-weight: 500;">${row.date}</td>
        <td style="padding: 10px; font-weight: 850; text-transform: uppercase; color: ${row.type === "ingreso" ? "#0d9488" : "#e11d48"};">
          ${row.type}
        </td>
        <td style="padding: 10px; font-weight: 600; color: #1e293b;">${row.category}</td>
        <td style="padding: 10px; color: #475569;">${row.description}</td>
        <td style="padding: 10px; font-weight: 600; text-transform: uppercase; font-size: 10px; color: #64748b;">
          ${ACCOUNT_LABELS[row.account] || row.account}
        </td>
        <td style="padding: 10px; font-weight: 700; text-align: right; color: ${row.type === "ingreso" ? "#0f766e" : "#be123c"};">
          ${row.type === "ingreso" ? "+" : "-"}$${row.amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
        </td>
      </tr>
    `).join("");

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Libro Contable - Hoteles de Venezuela</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;750;900&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
    
    body {
      font-family: 'Montserrat', sans-serif;
      max-width: 950px;
      margin: 40px auto;
      color: #0f172a;
      background-color: #ffffff;
      padding: 20px;
    }
    
    .ledger-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    
    .logo-container {
      display: flex;
      flex-direction: column;
    }
    
    .logo-main {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 1px;
      color: #0e011f;
    }
    
    .logo-sub {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 2px;
      color: #00c8d4;
      text-transform: uppercase;
      margin-top: 4px;
    }
    
    .document-title {
      text-align: right;
    }
    
    .document-title h1 {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      margin: 0;
      color: #FF0096;
    }
    
    .document-title p {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      margin: 5px 0 0 0;
    }
    
    .meta-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }
    
    .meta-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 15px;
      border-radius: 12px;
    }
    
    .meta-box h3 {
      font-size: 10px;
      font-weight: 750;
      text-transform: uppercase;
      color: #64748b;
      margin-top: 0;
      margin-bottom: 10px;
      letter-spacing: 0.5px;
    }
    
    .meta-item {
      font-size: 12px;
      margin-bottom: 6px;
      color: #334155;
    }
    
    .meta-item strong {
      color: #0f172a;
    }
    
    .totals-box {
      background-color: #0e011f;
      border: 1px solid #1a0533;
      padding: 15px;
      border-radius: 12px;
      color: #ffffff;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 8px;
      font-weight: 600;
      color: #cbd5e1;
    }
    
    .total-row.grand-total {
      margin-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 12px;
      font-size: 15px;
      font-weight: 900;
      color: #ffffff;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 40px;
    }
    
    th {
      background-color: #0f172a;
      color: #ffffff;
      padding: 12px 10px;
      font-size: 10px;
      font-weight: 750;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    tr:nth-child(even) {
      background-color: #f8fafc;
    }
    
    .print-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 15px;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      font-weight: 600;
      color: #94a3b8;
    }
    
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  
  <div class="ledger-header">
    <div class="logo-container">
      <span class="logo-main">HOTELES DE VENEZUELA</span>
      <span class="logo-sub">Consola General Administrativa</span>
    </div>
    <div class="document-title">
      <h1>Libro Contable General</h1>
      <p>Control Interno y Auditoría Financiera</p>
    </div>
  </div>
  
  <div class="meta-grid">
    <div class="meta-box">
      <h3>Detalle del Reporte</h3>
      <div class="meta-item"><strong>Filtro aplicado:</strong> ${dateRangeStr}</div>
      <div class="meta-item"><strong>Fecha de Emisión:</strong> ${new Date().toLocaleDateString("es-VE")}</div>
      <div class="meta-item"><strong>Operador Responsable:</strong> ${profile?.name || "Administrador General"} (${profile?.email || user?.email})</div>
    </div>
    
    <div class="totals-box">
      <h3>Balance del Rango</h3>
      <div class="total-row">
        <span>Total Ingresos:</span>
        <span style="color: #00c8d4;">+$${totals.ingresos.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</span>
      </div>
      <div class="total-row">
        <span>Total Egresos:</span>
        <span style="color: #FF0096;">-$${totals.egresos.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</span>
      </div>
      <div class="total-row grand-total">
        <span>Balance Neto:</span>
        <span>$${totals.balance.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th style="width: 4%; text-align: left; padding: 12px 10px;">#</th>
        <th style="width: 12%; text-align: left; padding: 12px 10px;">Fecha</th>
        <th style="width: 10%; text-align: left; padding: 12px 10px;">Tipo</th>
        <th style="width: 20%; text-align: left; padding: 12px 10px;">Categoría</th>
        <th style="width: 30%; text-align: left; padding: 12px 10px;">Descripción</th>
        <th style="width: 12%; text-align: left; padding: 12px 10px;">Cuenta</th>
        <th style="width: 12%; text-align: right; padding: 12px 10px;">Monto</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
  
  <div class="print-footer">
    <span>Hoteles de Venezuela S.A. - Consola Administrativa Central Matrix</span>
    <span>Página 1 de 1</span>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    }
  </script>
</body>
</html>`);
    win.document.close();
  };

  if (authLoading || loadingPayments || loadingExpenses) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: FUCSIA }} />
        <p className="text-slate-400 text-xs font-bold">Cargando Libro Contable...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-slate-100 font-sans">
      
      {/* Cabecera / Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 border border-white/5 shadow-2xl"
           style={{ background: "linear-gradient(135deg, #1a0533 0%, #0e011f 100%)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-15" style={{ background: CIAN }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: PURPURA }} />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black tracking-wider uppercase"
                 style={{ backgroundColor: `${FUCSIA}15`, color: FUCSIA, border: `1px solid ${FUCSIA}30` }}>
              <FileText className="w-3 h-3" />
              <span>Contabilidad Centralizada</span>
            </div>
            <h1 className="text-3xl font-bold font-serif text-white tracking-wide">
              Libro Contable General
            </h1>
            <p className="text-slate-400 text-xs max-w-xl leading-relaxed">
              Consolida ingresos por suscripción B2B, egresos generales de la plataforma y pagos de nómina en un libro diario. Filtra por rango de fechas, cuentas LLC, y exporta formalmente en PDF.
            </p>
          </div>
          
          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => {
                setNewEntryType("egreso");
                setShowAddModal(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Transacción</span>
            </button>

            <button
              onClick={handlePrintLedger}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-103 active:scale-97 cursor-pointer flex items-center gap-1.5 shadow-lg shadow-pink-500/10"
              style={{ background: `linear-gradient(135deg, ${FUCSIA} 0%, ${PURPURA} 100%)` }}
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Libro Diario</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 shadow-md flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${CIAN}15` }}>
            <TrendingUp className="w-6 h-6" style={{ color: CIAN }} />
          </div>
          <div>
            <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Total Ingresos</span>
            <span className="text-2xl font-black text-white">${totals.ingresos.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="absolute right-0 bottom-0 translate-y-2 translate-x-2 text-white/[0.02] font-black font-sans text-6xl">+$</div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 shadow-md flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${FUCSIA}15` }}>
            <TrendingDown className="w-6 h-6" style={{ color: FUCSIA }} />
          </div>
          <div>
            <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Total Egresos</span>
            <span className="text-2xl font-black text-white">${totals.egresos.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="absolute right-0 bottom-0 translate-y-2 translate-x-2 text-white/[0.02] font-black font-sans text-6xl">-$</div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 shadow-md flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" 
               style={{ backgroundColor: totals.balance >= 0 ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)" }}>
            <Wallet className="w-6 h-6" style={{ color: totals.balance >= 0 ? "#10B981" : "#EF4444" }} />
          </div>
          <div>
            <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold">Balance Neto</span>
            <span className={`text-2xl font-black ${totals.balance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              ${totals.balance.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

      </div>

      {/* Caja de Control de Filtros */}
      <div className="bg-white/5 border border-white/5 p-5 rounded-2xl space-y-4 shadow-md">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Controles de Filtro</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {/* 1. Buscador */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar descripción, categoría, referencia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-turquesa/50"
            />
          </div>

          {/* 2. Tipo */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#1a0533] border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-brand-turquesa/50"
            >
              <option value="all">Todos los Tipos</option>
              <option value="ingreso">Solo Ingresos (+)</option>
              <option value="egreso">Solo Egresos (-)</option>
            </select>
          </div>

          {/* 3. Cuenta */}
          <div>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#1a0533] border border-white/10 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-brand-turquesa/50"
            >
              <option value="all">Todas las Cuentas</option>
              <option value="ops">Caja General (Ops)</option>
              <option value="marketing">Marketing (Meta Ads)</option>
              <option value="payroll">Nómina</option>
              <option value="profits">Ganancias</option>
            </select>
          </div>

          {/* 4. Rango Fechas */}
          <div className="flex gap-2 items-center md:col-span-1">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Fecha Inicio"
              className="w-full px-2 py-2 bg-black/20 border border-white/10 rounded-xl text-[10px] text-slate-400 focus:outline-none"
            />
            <span className="text-[10px] text-slate-600 font-bold">A</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="Fecha Fin"
              className="w-full px-2 py-2 bg-black/20 border border-white/10 rounded-xl text-[10px] text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {(startDate || endDate || search || typeFilter !== "all" || accountFilter !== "all") && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setSearch("");
                setTypeFilter("all");
                setAccountFilter("all");
                setStartDate("");
                setEndDate("");
              }}
              className="text-[10px] font-bold text-pink-400 hover:text-pink-300 cursor-pointer"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </div>

      {/* Tabla del Libro Diario */}
      <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Categoría</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Descripción</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cuenta</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Monto</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Eliminar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-slate-500 font-bold py-16">
                    No se encontraron registros de contabilidad.
                  </td>
                </tr>
              ) : (
                filteredLedger.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Fecha */}
                    <td className="p-4 text-xs font-semibold text-slate-300">
                      {row.date}
                    </td>

                    {/* Tipo */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        row.type === "ingreso"
                          ? "bg-teal-500/10 border-teal-500/20 text-teal-400"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}>
                        {row.type === "ingreso" ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                        <span>{row.type}</span>
                      </span>
                    </td>

                    {/* Categoría */}
                    <td className="p-4 text-xs font-bold text-slate-200">
                      {row.category}
                    </td>

                    {/* Descripción */}
                    <td className="p-4 text-xs text-slate-400 font-semibold max-w-[280px] truncate" title={row.description}>
                      {row.description}
                    </td>

                    {/* Cuenta */}
                    <td className="p-4 text-xs font-semibold text-slate-350">
                      {ACCOUNT_LABELS[row.account] || row.account}
                    </td>

                    {/* Monto */}
                    <td className={`p-4 text-xs font-bold text-right ${row.type === "ingreso" ? "text-teal-400" : "text-red-400"}`}>
                      {row.type === "ingreso" ? "+" : "-"}${row.amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                    </td>

                    {/* Eliminar */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteEntry(row)}
                        className="p-1 rounded bg-white/5 hover:bg-red-550/20 hover:text-red-400 text-slate-500 transition-colors cursor-pointer"
                        title="Eliminar Registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REGISTRAR TRANSACCION */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-6 bg-[#1a0533] space-y-4">
            
            {/* Header del Modal */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h2 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2">
                <Receipt className="w-4 h-4" style={{ color: CIAN }} />
                <span>Registrar Transacción Manual</span>
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Toggle Tipo */}
            <div className="flex bg-black/30 rounded-xl p-1 border border-white/5">
              <button
                type="button"
                onClick={() => {
                  setNewEntryType("egreso");
                  setFormData(prev => ({ ...prev, category: "Otros" }));
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                  newEntryType === "egreso"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Egreso (-)
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewEntryType("ingreso");
                  setFormData(prev => ({ ...prev, category: "Otros Ingresos" }));
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                  newEntryType === "ingreso"
                    ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Ingreso (+)
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSaveEntry} className="space-y-4 text-xs">
              
              {/* Fecha y Monto */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Fecha</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-turquesa/50"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Monto (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-turquesa/50"
                  />
                </div>
              </div>

              {/* Categoría y Cuenta / Referencia */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold block">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#1a0533] border border-white/10 rounded-xl text-slate-300 focus:outline-none"
                  >
                    {newEntryType === "egreso" ? (
                      CATEGORIES_EGRESO.map(c => <option key={c} value={c}>{c}</option>)
                    ) : (
                      CATEGORIES_INGRESO.map(c => <option key={c} value={c}>{c}</option>)
                    )}
                  </select>
                </div>
                
                <div className="space-y-1">
                  {newEntryType === "egreso" ? (
                    <>
                      <label className="text-slate-400 font-bold block">Cuenta LLC Origen</label>
                      <select
                        value={formData.account}
                        onChange={(e) => setFormData(prev => ({ ...prev, account: e.target.value as any }))}
                        className="w-full px-3 py-2 bg-[#1a0533] border border-white/10 rounded-xl text-slate-300 focus:outline-none"
                      >
                        <option value="ops">Caja General</option>
                        <option value="marketing">Marketing (Meta Ads)</option>
                        <option value="payroll">Nómina</option>
                        <option value="profits">Ganancias</option>
                      </select>
                    </>
                  ) : (
                    <>
                      <label className="text-slate-400 font-bold block">Referencia Pago</label>
                      <input
                        type="text"
                        placeholder="Zelle / REF#"
                        value={formData.reference}
                        onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-turquesa/50"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Descripción Principal</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Servidores de base de datos Vercel o Pago mensual de membresía"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-turquesa/50"
                />
              </div>

              {/* Notas Adicionales */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold block">Notas de Auditoría</label>
                <textarea
                  placeholder="Detalles específicos para control de finanzas..."
                  value={formData.notes}
                  rows={2}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-brand-turquesa/50 resize-none"
                />
              </div>

              {/* Botón Guardar */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl font-bold text-white transition-all hover:scale-101 active:scale-99 cursor-pointer flex items-center justify-center gap-1.5"
                  style={{
                    background: `linear-gradient(135deg, ${FUCSIA} 0%, ${PURPURA} 100%)`
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registrando Transacción...</span>
                    </>
                  ) : (
                    <span>Registrar en Libro Contable</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
