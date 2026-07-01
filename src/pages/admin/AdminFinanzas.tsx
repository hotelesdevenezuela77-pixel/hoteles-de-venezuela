import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DollarSign, TrendingUp, TrendingDown, Plus, Trash2,
  CreditCard, Users, FileText, BarChart3,
  CheckCircle, Clock, X, Loader2, Wallet, ArrowLeftRight, Percent
} from "lucide-react";

const F = "#FF0096";
const T = "#00C8D4";
const P = "#9B00CC";

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  basico:   { label: "Básico",   color: "#6B7280" },
  premium:  { label: "Premium",  color: T },
  fundador: { label: "Fundador", color: F },
  gold:     { label: "Gold",     color: "#D97706" },
};

const EXPENSE_CATS = [
  "Nómina", "Marketing", "Tecnología", "Oficina", "Legal",
  "Viajes", "Servicios", "Comisiones", "Otros",
];

type Tab = "resumen" | "ingresos" | "egresos" | "nomina" | "cuentas";

export function AdminFinanzas() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("resumen");

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // ── Membership payments (ingresos) ──────────────────────
  const { data: payments = [], isLoading: loadingPayments } = useQuery<any[]>({
    queryKey: ["admin-membership-payments"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("membership_payments")
          .select("*")
          .order("payment_date", { ascending: false });
        
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn("Error cargando pagos de membresía de Supabase, usando locales:", err);
        const localIncomeKey = "hdv_mock_membership_payments";
        const localPay = JSON.parse(localStorage.getItem(localIncomeKey) || "[]");
        if (localPay.length === 0) {
          const defaults = [
            { id: 1, establishment_id: 66, membership_tier: "premium", amount: 150.00, currency: "USD", payment_date: "2026-06-15", payment_method: "zelle", payment_reference: "TXN123456", notes: "Mensualidad Junio" },
            { id: 2, establishment_id: 67, membership_tier: "fundador", amount: 350.00, currency: "USD", payment_date: "2026-06-12", payment_method: "transferencia", payment_reference: "REF7890", notes: "Suscripción anual" },
          ];
          localStorage.setItem(localIncomeKey, JSON.stringify(defaults));
          return defaults;
        }
        return localPay;
      }
    },
  });

  // ── Expenses (egresos) ───────────────────────────────────
  const { data: expenses = [], isLoading: loadingExpenses } = useQuery<any[]>({
    queryKey: ["admin-expenses"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("expenses")
          .select("*")
          .order("expense_date", { ascending: false });
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn("Error cargando egresos de Supabase, usando locales:", err);
        const localExpensesKey = "hdv_mock_expenses";
        const localExp = JSON.parse(localStorage.getItem(localExpensesKey) || "[]");
        if (localExp.length === 0) {
          const defaults = [
            { id: 1, category: "Tecnología", description: "Servidores Cloud Supabase/Vercel", amount: 45.00, expense_date: "2026-06-18", notes: "[CAJA_GENERAL] Servicios SaaS de desarrollo" },
            { id: 2, category: "Marketing", description: "Campaña Ads Redes Sociales", amount: 120.00, expense_date: "2026-06-10", notes: "[META_ADS] Publicidad Hoteles de Venezuela" },
          ];
          localStorage.setItem(localExpensesKey, JSON.stringify(defaults));
          return defaults;
        }
        return localExp;
      }
    },
  });

  // ── Staff (nómina) ───────────────────────────────────────
  const { data: staff = [], isLoading: loadingStaff } = useQuery<any[]>({
    queryKey: ["admin-staff"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("staff")
          .select("*")
          .order("name", { ascending: true });
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn("Error cargando personal, usando mock:", err);
        const localStaffKey = "hdv_mock_staff";
        const localStf = JSON.parse(localStorage.getItem(localStaffKey) || "[]");
        if (localStf.length === 0) {
          const defaults = [
            { id: 1, name: "Israel E. A.", role: "CEO / Administrador", email: "admin@hotelesdevenezuela.com", phone: "+584121234567", roleType: "full-time", salary: 1500.00, isActive: true },
            { id: 2, name: "Valentina Gómez", role: "Soporte al Cliente", email: "valentina@hotelesdevenezuela.com", phone: "+584249876543", roleType: "part-time", salary: 450.00, isActive: true },
          ];
          localStorage.setItem(localStaffKey, JSON.stringify(defaults));
          return defaults;
        }
        return localStf;
      }
    },
  });

  // ── LLC Bank Accounts Config ──────────────────────────────
  const { data: llcConfig = { percentages: { ops: 20, marketing: 30, payroll: 30, profits: 20 }, transfers: [] }, isLoading: loadingLlc } = useQuery<any>({
    queryKey: ["admin-llc-financial-data"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("setting_value")
          .eq("setting_key", "llc_financial_data")
          .maybeSingle();

        if (error) throw error;
        if (data && data.setting_value) {
          return JSON.parse(data.setting_value);
        }
      } catch (e) {
        console.warn("Error cargando configuración financiera LLC, usando local storage:", e);
      }
      const local = localStorage.getItem("hdv_llc_financial_data");
      if (local) return JSON.parse(local);
      return {
        percentages: { ops: 20, marketing: 30, payroll: 30, profits: 20 },
        transfers: []
      };
    }
  });

  const saveLlcConfig = useMutation({
    mutationFn: async (payload: any) => {
      try {
        const { error } = await supabase
          .from("site_settings")
          .upsert({
            setting_key: "llc_financial_data",
            setting_value: JSON.stringify(payload)
          }, { onConflict: "setting_key" });
        if (error) throw error;
      } catch (err) {
        console.warn("No se pudo guardar la configuración LLC en base de datos, usando localStorage:", err);
      }
      localStorage.setItem("hdv_llc_financial_data", JSON.stringify(payload));
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-llc-financial-data"] });
    }
  });

  // ── Form State ───────────────────────────────────────────
  const emptyIncome = { establishment_id: "", membership_tier: "premium", amount: "", currency: "USD", payment_date: new Date().toISOString().slice(0, 10), payment_method: "transferencia", payment_reference: "", notes: "" };
  const emptyExpense = { category: "Nómina", description: "", amount: "", expense_date: new Date().toISOString().slice(0, 10), notes: "", source_account: "ops" };
  
  const [incomeForm, setIncomeForm] = useState(emptyIncome);
  const [expenseForm, setExpenseForm] = useState(emptyExpense);

  // Percentages state
  const [pctOps, setPctOps] = useState(20);
  const [pctMarketing, setPctMarketing] = useState(30);
  const [pctPayroll, setPctPayroll] = useState(30);
  const [pctProfits, setPctProfits] = useState(20);

  // Sync percentages when loaded
  useEffect(() => {
    if (llcConfig?.percentages) {
      setPctOps(llcConfig.percentages.ops ?? 20);
      setPctMarketing(llcConfig.percentages.marketing ?? 30);
      setPctPayroll(llcConfig.percentages.payroll ?? 30);
      setPctProfits(llcConfig.percentages.profits ?? 20);
    }
  }, [llcConfig]);

  // Transfer form state
  const [transferForm, setTransferForm] = useState({
    from: "ops",
    to: "marketing",
    amount: "",
    description: ""
  });

  // ── Mutations execution ──────────────────────────────────
  const addPayment = useMutation({
    mutationFn: async (payload: any) => {
      const localIncomeKey = "hdv_mock_membership_payments";
      const localPay = JSON.parse(localStorage.getItem(localIncomeKey) || "[]");
      const newPayment = { id: Date.now(), ...payload };
      
      try {
        const { error } = await supabase
          .from("membership_payments")
          .insert({
            establishment_id: payload.establishment_id,
            membership_tier: payload.membership_tier,
            amount: payload.amount,
            currency: payload.currency,
            payment_date: payload.payment_date,
            payment_method: payload.payment_method,
            payment_reference: payload.payment_reference,
            notes: payload.notes
          });
        if (error) throw error;
      } catch (err) {
        localStorage.setItem(localIncomeKey, JSON.stringify([...localPay, newPayment]));
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-membership-payments"] });
      setShowAddIncome(false);
      setIncomeForm(emptyIncome);
    },
  });

  const deletePayment = useMutation({
    mutationFn: async (id: number) => {
      const localIncomeKey = "hdv_mock_membership_payments";
      const localPay = JSON.parse(localStorage.getItem(localIncomeKey) || "[]");
      const hasLocal = localPay.some((p: any) => p.id === id);

      if (hasLocal) {
        localStorage.setItem(localIncomeKey, JSON.stringify(localPay.filter((p: any) => p.id !== id)));
        return { success: true };
      }

      try {
        const { error } = await supabase
          .from("membership_payments")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } catch (err) {
        localStorage.setItem(localIncomeKey, JSON.stringify(localPay.filter((p: any) => p.id !== id)));
      }
      return { success: true };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-membership-payments"] }),
  });

  const addExpense = useMutation({
    mutationFn: async (payload: any) => {
      const localExpensesKey = "hdv_mock_expenses";
      const localExp = JSON.parse(localStorage.getItem(localExpensesKey) || "[]");
      const newExpense = { id: Date.now(), ...payload };

      try {
        const { error } = await supabase
          .from("expenses")
          .insert({
            category: payload.category,
            description: payload.description,
            amount: payload.amount,
            expense_date: payload.expense_date,
            notes: payload.notes
          });
        if (error) throw error;
      } catch (err) {
        localStorage.setItem(localExpensesKey, JSON.stringify([...localExp, newExpense]));
      }
      return { success: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-expenses"] });
      setShowAddExpense(false);
      setExpenseForm(emptyExpense);
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: number) => {
      const localExpensesKey = "hdv_mock_expenses";
      const localExp = JSON.parse(localStorage.getItem(localExpensesKey) || "[]");
      const hasLocal = localExp.some((e: any) => e.id === id);

      if (hasLocal) {
        localStorage.setItem(localExpensesKey, JSON.stringify(localExp.filter((e: any) => e.id !== id)));
        return { success: true };
      }

      try {
        const { error } = await supabase
          .from("expenses")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } catch (err) {
        localStorage.setItem(localExpensesKey, JSON.stringify(localExp.filter((e: any) => e.id !== id)));
      }
      return { success: true };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-expenses"] }),
  });

  // ── Helper to parse source accounts from notes ───────────
  const parseNotes = (rawNotes: string) => {
    if (!rawNotes) return { account: "ops", text: "—" };
    if (rawNotes.startsWith("[CAJA_GENERAL]")) return { account: "ops", text: rawNotes.replace("[CAJA_GENERAL]", "").trim() };
    if (rawNotes.startsWith("[META_ADS]")) return { account: "marketing", text: rawNotes.replace("[META_ADS]", "").trim() };
    if (rawNotes.startsWith("[NOMINA]")) return { account: "payroll", text: rawNotes.replace("[NOMINA]", "").trim() };
    if (rawNotes.startsWith("[GANANCIAS]")) return { account: "profits", text: rawNotes.replace("[GANANCIAS]", "").trim() };
    return { account: "ops", text: rawNotes }; // default to general cash
  };

  // ── LLC Calculations ─────────────────────────────────────
  const currentPercentages = llcConfig?.percentages || { ops: 20, marketing: 30, payroll: 30, profits: 20 };
  const currentTransfers = llcConfig?.transfers || [];

  let opsBalance = 0;
  let marketingBalance = 0;
  let payrollBalance = 0;
  let profitsBalance = 0;

  // 1. Process Income (membership_payments)
  payments.forEach((p: any) => {
    const amt = p.amount || 0;
    opsBalance += amt * (currentPercentages.ops / 100);
    marketingBalance += amt * (currentPercentages.marketing / 100);
    payrollBalance += amt * (currentPercentages.payroll / 100);
    profitsBalance += amt * (currentPercentages.profits / 100);
  });

  // 2. Process Expenses (egresos)
  expenses.forEach((e: any) => {
    const amt = e.amount || 0;
    const notesStr = e.notes || "";
    if (notesStr.startsWith("[META_ADS]")) {
      marketingBalance -= amt;
    } else if (notesStr.startsWith("[NOMINA]")) {
      payrollBalance -= amt;
    } else if (notesStr.startsWith("[GANANCIAS]")) {
      profitsBalance -= amt;
    } else {
      opsBalance -= amt;
    }
  });

  // 3. Process Transfers (transferencias internas)
  currentTransfers.forEach((t: any) => {
    const amt = t.amount || 0;
    // Deduct from sender
    if (t.from === "ops") opsBalance -= amt;
    else if (t.from === "marketing") marketingBalance -= amt;
    else if (t.from === "payroll") payrollBalance -= amt;
    else if (t.from === "profits") profitsBalance -= amt;

    // Add to recipient
    if (t.to === "ops") opsBalance += amt;
    else if (t.to === "marketing") marketingBalance += amt;
    else if (t.to === "payroll") payrollBalance += amt;
    else if (t.to === "profits") profitsBalance += amt;
  });

  const handleExecuteTransfer = () => {
    const amt = parseFloat(transferForm.amount);
    if (isNaN(amt) || amt <= 0) {
      alert("Por favor introduce un monto válido");
      return;
    }
    if (transferForm.from === transferForm.to) {
      alert("La cuenta de origen y de destino no pueden ser la misma");
      return;
    }

    const newTransfer = {
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 10),
      from: transferForm.from,
      to: transferForm.to,
      amount: amt,
      description: transferForm.description || "Transferencia interna de fondos"
    };

    saveLlcConfig.mutate({
      percentages: currentPercentages,
      transfers: [newTransfer, ...currentTransfers]
    });
    setTransferForm({ from: "ops", to: "marketing", amount: "", description: "" });
    alert("¡Transferencia ejecutada!");
  };

  const handleDeleteTransfer = (id: string) => {
    if (!confirm("¿Deseas anular esta transferencia interna?")) return;
    saveLlcConfig.mutate({
      percentages: currentPercentages,
      transfers: currentTransfers.filter((t: any) => t.id !== id)
    });
  };

  const handleSavePercentages = () => {
    const total = pctOps + pctMarketing + pctPayroll + pctProfits;
    if (total !== 100) {
      alert(`La suma de los porcentajes debe ser exactamente 100%. (Suma actual: ${total}%)`);
      return;
    }

    saveLlcConfig.mutate({
      percentages: {
        ops: pctOps,
        marketing: pctMarketing,
        payroll: pctPayroll,
        profits: pctProfits
      },
      transfers: currentTransfers
    });
    alert("¡Porcentajes de distribución guardados correctamente!");
  };

  // ── Totals ───────────────────────────────────────────────
  const totalIngresos = payments.reduce((s, p) => s + (p.amount ?? 0), 0);
  const totalEgresos  = expenses.reduce((s, e) => s + (e.amount ?? 0), 0);
  const balance       = totalIngresos - totalEgresos;

  // ── Ingresos by plan ─────────────────────────────────────
  const byTier = payments.reduce((acc: Record<string, number>, p) => {
    const tier = p.membership_tier || p.membershipTier || "basico";
    acc[tier] = (acc[tier] ?? 0) + (p.amount ?? 0);
    return acc;
  }, {});

  // ── Egresos by category ──────────────────────────────────
  const byCategory = expenses.reduce((acc: Record<string, number>, e) => {
    acc[e.category ?? "Otros"] = (acc[e.category ?? "Otros"] ?? 0) + (e.amount ?? 0);
    return acc;
  }, {});

  const TABS = [
    { id: "resumen" as Tab,   label: "Resumen",  icon: BarChart3    },
    { id: "ingresos" as Tab,  label: "Ingresos", icon: TrendingUp   },
    { id: "egresos" as Tab,   label: "Egresos",  icon: TrendingDown },
    { id: "nomina" as Tab,    label: "Nómina",   icon: Users        },
    { id: "cuentas" as Tab,   label: "Cuentas LLC", icon: Wallet    },
  ];

  const getAccountLabel = (key: string) => {
    return {
      ops: "Caja General",
      marketing: "Marketing (Meta Ads)",
      payroll: "Nómina",
      profits: "Ganancias"
    }[key] || key;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
        <p className="text-gray-500 text-xs font-bold">Verificando credenciales de seguridad...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 pb-24 font-sans">
      {/* Header */}
      <div className="relative overflow-hidden py-8" style={{ background: "linear-gradient(135deg, #0e0120, #1a0533)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: F }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-pink-500/20">
              <DollarSign className="w-4.5 h-4.5 text-pink-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight font-sans uppercase">Finanzas & LLC</h1>
              <p className="text-white/50 text-xs font-semibold">Administra ingresos por membresías, egresos, nómina y fondos bancarios LLC</p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Balance Neto:</span>
            <span className={`text-sm font-black px-3 py-1.5 rounded-xl ${balance >= 0 ? "bg-emerald-500/20 text-emerald-350" : "bg-red-500/20 text-red-350"}`}>
              ${balance.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <AdminTabBar />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Ingresos totales",  value: `$${totalIngresos.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`, icon: TrendingUp,   color: "#22C55E", bg: "rgba(34,197,94,0.1)"   },
            { label: "Egresos totales",   value: `$${totalEgresos.toLocaleString("es-VE",  { minimumFractionDigits: 2 })}`, icon: TrendingDown, color: "#EF4444", bg: "rgba(239,68,68,0.1)"   },
            { label: "Balance neto",      value: `$${balance.toLocaleString("es-VE",       { minimumFractionDigits: 2 })}`, icon: DollarSign,   color: balance >= 0 ? "#22C55E" : "#EF4444", bg: balance >= 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)" },
            { label: "Fondo Liquidado (LLC)", value: `$${(opsBalance + marketingBalance + payrollBalance + profitsBalance).toLocaleString("es-VE", { minimumFractionDigits: 2 })}`, icon: Wallet, color: P, bg: "rgba(155,0,204,0.1)" },
          ].map((k, i) => {
            const Icon = k.icon;
            return (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-200 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: k.bg }}>
                  <Icon className="w-5 h-5" style={{ color: k.color }} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{k.label}</p>
                  <p className="text-lg font-black text-gray-900 mt-0.5">{k.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1.5 rounded-2xl bg-gray-150/60 w-fit">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer ${active ? "bg-white text-gray-900 shadow-sm font-bold" : "text-gray-500 hover:text-gray-800"}`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* ═══ RESUMEN ════════════════════════════════════ */}
        {tab === "resumen" && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Ingresos por plan */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
              <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />
                Ingresos por membresía
              </h3>
              {Object.keys(byTier).length === 0 ? (
                <p className="text-gray-400 text-xs font-bold text-center py-8">Sin datos aún</p>
              ) : (
                <div className="space-y-3.5">
                  {Object.entries(byTier).map(([tier, amount]) => {
                    const info = TIER_LABELS[tier] ?? { label: tier, color: "#6B7280" };
                    const pct = totalIngresos > 0 ? ((amount as number) / totalIngresos) * 100 : 0;
                    return (
                      <div key={tier}>
                        <div className="flex justify-between text-xs mb-1.5 font-bold">
                          <span className="text-gray-600">{info.label}</span>
                          <span className="text-gray-900">${(amount as number).toFixed(2)}</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: info.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Egresos por categoría */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
              <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
                <TrendingDown className="w-4.5 h-4.5 text-red-500" />
                Egresos por categoría
              </h3>
              {Object.keys(byCategory).length === 0 ? (
                <p className="text-gray-400 text-xs font-bold text-center py-8">Sin datos aún</p>
              ) : (
                <div className="space-y-3.5">
                  {Object.entries(byCategory).sort((a,b) => (b[1] as number) - (a[1] as number)).map(([cat, amount]) => {
                    const pct = totalEgresos > 0 ? ((amount as number) / totalEgresos) * 100 : 0;
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-xs mb-1.5 font-bold">
                          <span className="text-gray-600">{cat}</span>
                          <span className="text-red-500">${(amount as number).toFixed(2)}</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-red-400 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ INGRESOS ═══════════════════════════════════ */}
        {tab === "ingresos" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-800">Ingresos por Membresías</h2>
              <button
                onClick={() => setShowAddIncome(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold border border-pink-700 cursor-pointer transition-transform hover:scale-102"
                style={{ background: `linear-gradient(90deg,${F},${P})` }}
              >
                <Plus className="w-4 h-4" /> Registrar Pago
              </button>
            </div>

            {showAddIncome && (
              <div className="bg-white rounded-2xl border border-pink-500/10 p-5 shadow-xs space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wide">Nuevo pago de membresía</h3>
                  <button onClick={() => setShowAddIncome(false)} className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer"><X className="w-4 h-4 text-gray-500" /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">ID Establecimiento *</label>
                    <input type="number" placeholder="Ej: 66" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 font-semibold" value={incomeForm.establishment_id} onChange={e => setIncomeForm(f => ({ ...f, establishment_id: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Plan de Suscripción</label>
                    <select className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-bold text-gray-700" value={incomeForm.membership_tier} onChange={e => setIncomeForm(f => ({ ...f, membership_tier: e.target.value }))}>
                      <option value="basico">Básico</option>
                      <option value="premium">Premium</option>
                      <option value="fundador">Fundador</option>
                      <option value="gold">Gold</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Monto (USD) *</label>
                    <input type="number" step="0.01" placeholder="0.00" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 font-semibold" value={incomeForm.amount} onChange={e => setIncomeForm(f => ({ ...f, amount: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Fecha de Pago</label>
                    <input type="date" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 font-semibold" value={incomeForm.payment_date} onChange={e => setIncomeForm(f => ({ ...f, payment_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Método de Pago</label>
                    <select className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-bold text-gray-700" value={incomeForm.payment_method} onChange={e => setIncomeForm(f => ({ ...f, payment_method: e.target.value }))}>
                      <option value="transferencia">Transferencia</option>
                      <option value="zelle">Zelle</option>
                      <option value="paypal">PayPal</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="bolivares">Bolívares</option>
                      <option value="pago_movil">Pago Móvil</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Referencia / ID de Transacción</label>
                    <input placeholder="N° de referencia" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 font-semibold" value={incomeForm.payment_reference} onChange={e => setIncomeForm(f => ({ ...f, payment_reference: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Notas</label>
                    <input placeholder="Observaciones..." className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 font-semibold" value={incomeForm.notes} onChange={e => setIncomeForm(f => ({ ...f, notes: e.target.value }))} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowAddIncome(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer">Cancelar</button>
                  <button
                    disabled={!incomeForm.establishment_id || !incomeForm.amount || addPayment.isPending}
                    onClick={() => addPayment.mutate({ ...incomeForm, establishment_id: Number(incomeForm.establishment_id), amount: parseFloat(incomeForm.amount) })}
                    className="text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border border-pink-700 disabled:opacity-50"
                    style={{ background: `linear-gradient(90deg,${F},${P})` }}
                  >
                    {addPayment.isPending ? "Guardando..." : "Guardar Pago"}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              {loadingPayments ? (
                <div className="p-8 text-center text-gray-400 text-xs font-bold">Cargando pagos...</div>
              ) : payments.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-xs font-bold">
                  <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p>No hay pagos registrados aún</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider text-left">
                        <th className="px-5 py-3">Establecimiento</th>
                        <th className="px-5 py-3">Plan</th>
                        <th className="px-5 py-3">Monto</th>
                        <th className="px-5 py-3">Método</th>
                        <th className="px-5 py-3">Fecha</th>
                        <th className="px-5 py-3">Referencia</th>
                        <th className="px-5 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p: any) => {
                        const tier = p.membership_tier || p.membershipTier || "basico";
                        const info = TIER_LABELS[tier] ?? { label: tier, color: "#6B7280" };
                        return (
                          <tr key={p.id} className="border-b hover:bg-slate-50/50 transition-colors text-xs font-semibold text-gray-700">
                            <td className="px-5 py-3.5">Est. #{p.establishment_id || p.establishmentId}</td>
                            <td className="px-5 py-3.5">
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border" style={{ background: `${info.color}15`, color: info.color, borderColor: `${info.color}25` }}>
                                {info.label}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-emerald-600 font-bold text-sm">${(p.amount ?? 0).toFixed(2)}</td>
                            <td className="px-5 py-3.5 capitalize">{p.payment_method || p.paymentMethod || "—"}</td>
                            <td className="px-5 py-3.5">{p.payment_date || p.paymentDate || "—"}</td>
                            <td className="px-5 py-3.5 font-mono text-gray-400 text-[10px]">{p.payment_reference || p.paymentReference || "—"}</td>
                            <td className="px-5 py-3.5 text-right">
                              <button onClick={() => deletePayment.mutate(p.id)} className="w-8 h-8 rounded-lg bg-gray-50 border hover:bg-red-50 hover:text-red-650 transition-colors text-gray-400 cursor-pointer inline-flex items-center justify-center">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ EGRESOS ════════════════════════════════════ */}
        {tab === "egresos" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-800">Egresos y Gastos Operativos</h2>
              <button
                onClick={() => setShowAddExpense(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold border border-red-700 cursor-pointer bg-red-500 hover:bg-red-600 transition-colors"
              >
                <Plus className="w-4 h-4" /> Registrar Egreso
              </button>
            </div>

            {showAddExpense && (
              <div className="bg-white rounded-2xl border border-red-500/10 p-5 shadow-xs space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wide">Nuevo egreso operativo</h3>
                  <button onClick={() => setShowAddExpense(false)} className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer"><X className="w-4 h-4 text-gray-500" /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Categoría de Gasto</label>
                    <select className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-bold text-gray-700" value={expenseForm.category} onChange={e => setExpenseForm(f => ({ ...f, category: e.target.value }))}>
                      {EXPENSE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Fondo de origen / LLC Account</label>
                    <select className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-bold text-gray-700" value={expenseForm.source_account} onChange={e => setExpenseForm(f => ({ ...f, source_account: e.target.value }))}>
                      <option value="ops">Caja General (Operaciones)</option>
                      <option value="marketing">Marketing (Meta Ads)</option>
                      <option value="payroll">Fondo de Nómina</option>
                      <option value="profits">Fondo de Ganancias</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Monto (USD) *</label>
                    <input type="number" step="0.01" placeholder="0.00" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500 font-semibold" value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Fecha de Egreso</label>
                    <input type="date" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500 font-semibold" value={expenseForm.expense_date} onChange={e => setExpenseForm(f => ({ ...f, expense_date: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Descripción del Gasto *</label>
                    <input placeholder="Ej: Campaña de Ads en Instagram del hotel" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500 font-semibold" value={expenseForm.description} onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Notas / Observaciones</label>
                    <input placeholder="Detalles extra..." className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500 font-semibold" value={expenseForm.notes} onChange={e => setExpenseForm(f => ({ ...f, notes: e.target.value }))} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowAddExpense(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer">Cancelar</button>
                  <button
                    disabled={!expenseForm.description || !expenseForm.amount || addExpense.isPending}
                    onClick={() => {
                      const prefix = {
                        ops: "[CAJA_GENERAL]",
                        marketing: "[META_ADS]",
                        payroll: "[NOMINA]",
                        profits: "[GANANCIAS]"
                      }[expenseForm.source_account] || "[CAJA_GENERAL]";
                      
                      addExpense.mutate({ 
                        ...expenseForm, 
                        amount: parseFloat(expenseForm.amount),
                        notes: `${prefix} ${expenseForm.notes}`
                      });
                    }}
                    className="bg-red-500 hover:bg-red-650 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border border-red-750 disabled:opacity-50"
                  >
                    {addExpense.isPending ? "Guardando..." : "Guardar Egreso"}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              {loadingExpenses ? (
                <div className="p-8 text-center text-gray-400 text-xs font-bold">Cargando egresos...</div>
              ) : expenses.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-xs font-bold">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p>No hay egresos registrados aún</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider text-left">
                        <th className="px-5 py-3">Categoría / Fondo</th>
                        <th className="px-5 py-3">Descripción</th>
                        <th className="px-5 py-3">Monto</th>
                        <th className="px-5 py-3">Fecha</th>
                        <th className="px-5 py-3">Notas</th>
                        <th className="px-5 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((e: any) => {
                        const parsed = parseNotes(e.notes);
                        return (
                          <tr key={e.id} className="border-b hover:bg-slate-50/50 transition-colors text-xs font-semibold text-gray-700">
                            <td className="px-5 py-3.5">
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border bg-slate-100 text-slate-600 border-slate-200 w-fit">
                                  {e.category || "Otros"}
                                </span>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                  💳 {getAccountLabel(parsed.account)}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 font-bold text-gray-800">{e.description ?? "—"}</td>
                            <td className="px-5 py-3.5 text-red-500 font-bold text-sm">${(e.amount ?? 0).toFixed(2)}</td>
                            <td className="px-5 py-3.5">{e.expense_date || e.expenseDate || "—"}</td>
                            <td className="px-5 py-3.5 text-gray-400 text-xs">{parsed.text || "—"}</td>
                            <td className="px-5 py-3.5 text-right">
                              <button onClick={() => deleteExpense.mutate(e.id)} className="w-8 h-8 rounded-lg bg-gray-50 border hover:bg-red-50 hover:text-red-650 transition-colors text-gray-400 cursor-pointer inline-flex items-center justify-center">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ NÓMINA ═════════════════════════════════════ */}
        {tab === "nomina" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-800">Nómina del Personal</h2>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full text-white" style={{ background: P }}>
                {staff.filter((s: any) => s.isActive).length} Activos
              </span>
            </div>

            {loadingStaff ? (
              <div className="p-8 text-center text-gray-400 text-xs font-bold">Cargando personal...</div>
            ) : staff.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-xs font-bold">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>No hay personal registrado aún</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {staff.map((s: any) => {
                  const active = s.isActive ?? true;
                  return (
                    <div key={s.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs flex flex-col justify-between">
                      <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                      <div className="p-4 flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm leading-snug">{s.name}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{s.role}</p>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${active ? "bg-green-50 text-green-600 border border-green-200" : "bg-gray-100 text-gray-400"}`}>
                            {active ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs text-gray-500 mt-3 font-semibold">
                          {s.email && <p>✉️ {s.email}</p>}
                          {s.phone && <p>📱 {s.phone}</p>}
                          {s.roleType && <p>🏷️ {s.roleType}</p>}
                        </div>
                      </div>
                      {s.salary && (
                        <div className="p-4 border-t bg-slate-50/50 flex justify-between items-center">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Salario mensual</span>
                          <span className="font-black text-sm text-purple-600">${s.salary.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {staff.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(155,0,204,0.08)" }}>
                    <DollarSign className="w-5 h-5 text-purple-650" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Total nómina mensual</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{staff.length} empleados activos</p>
                  </div>
                </div>
                <div className="font-black text-xl text-purple-600">
                  ${staff.reduce((sum: number, s: any) => sum + (s.salary ?? 0), 0).toFixed(2)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ CUENTAS LLC (SMART allocation) ══════════════ */}
        {tab === "cuentas" && (
          <div className="space-y-6">
            
            {/* Account balances row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Caja General (Operaciones)", balance: opsBalance, pct: currentPercentages.ops, icon: Wallet, color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
                { name: "Marketing (Meta Ads)", balance: marketingBalance, pct: currentPercentages.marketing, icon: TrendingUp, color: F, bg: "rgba(255,0,150,0.1)" },
                { name: "Fondo de Nómina", balance: payrollBalance, pct: currentPercentages.payroll, icon: Users, color: P, bg: "rgba(155,0,204,0.1)" },
                { name: "Fondo de Ganancias", balance: profitsBalance, pct: currentPercentages.profits, icon: CheckCircle, color: T, bg: "rgba(0,200,212,0.1)" },
              ].map((acc, i) => {
                const Icon = acc.icon;
                return (
                  <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-10" style={{ background: acc.color }} />
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: acc.bg }}>
                        <Icon className="w-5 h-5" style={{ color: acc.color }} />
                      </div>
                      <span className="text-[10px] font-black text-gray-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 flex items-center gap-0.5">
                        <Percent className="w-2.5 h-2.5 text-slate-400" /> {acc.pct}% split
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider leading-none mb-1">{acc.name}</p>
                      <p className="text-xl font-black text-gray-900">${acc.balance.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Split Allocations Configuration */}
            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Configuration panel */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4 lg:col-span-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <Percent className="w-4.5 h-4.5 text-pink-500" />
                    Configuración de Distribución Inteligente
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold mt-1">
                    Define cómo se distribuyen automáticamente los ingresos por membresía cuando se registra un pago.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div>
                    <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-2 block flex justify-between">
                      <span>Caja General (Ops)</span>
                      <span className="text-gray-900 font-mono font-black">{pctOps}%</span>
                    </label>
                    <input 
                      type="range" min="0" max="100" value={pctOps} 
                      onChange={e => setPctOps(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-gray-500" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-black text-pink-500 tracking-wider mb-2 block flex justify-between">
                      <span>Marketing (Meta Ads)</span>
                      <span className="font-mono font-black">{pctMarketing}%</span>
                    </label>
                    <input 
                      type="range" min="0" max="100" value={pctMarketing} 
                      onChange={e => setPctMarketing(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#FF0096]" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-black text-purple-600 tracking-wider mb-2 block flex justify-between">
                      <span>Fondo de Nómina</span>
                      <span className="font-mono font-black">{pctPayroll}%</span>
                    </label>
                    <input 
                      type="range" min="0" max="100" value={pctPayroll} 
                      onChange={e => setPctPayroll(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#9B00CC]" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-black text-cyan-600 tracking-wider mb-2 block flex justify-between">
                      <span>Fondo de Ganancias</span>
                      <span className="font-mono font-black">{pctProfits}%</span>
                    </label>
                    <input 
                      type="range" min="0" max="100" value={pctProfits} 
                      onChange={e => setPctProfits(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#00C8D4]" 
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-gray-500">Suma Total:</span>
                    <span className={`text-sm font-black ${(pctOps + pctMarketing + pctPayroll + pctProfits) === 100 ? "text-emerald-500" : "text-red-500"}`}>
                      {pctOps + pctMarketing + pctPayroll + pctProfits}%
                    </span>
                  </div>
                  <button
                    onClick={handleSavePercentages}
                    disabled={saveLlcConfig.isPending}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer border border-pink-700 hover:opacity-95 transition-all disabled:opacity-50 shrink-0"
                    style={{ background: `linear-gradient(90deg, ${F}, ${P})` }}
                  >
                    {saveLlcConfig.isPending ? "Guardando..." : "Guardar Distribución"}
                  </button>
                </div>
              </div>

              {/* Transfer Form */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <ArrowLeftRight className="w-4.5 h-4.5 text-purple-600" />
                  Mover Fondos (LLC)
                </h3>
                
                <div className="space-y-3.5">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Desde Cuenta</label>
                    <select 
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-bold text-gray-700"
                      value={transferForm.from}
                      onChange={e => setTransferForm(f => ({ ...f, from: e.target.value }))}
                    >
                      <option value="ops">Caja General</option>
                      <option value="marketing">Marketing (Meta Ads)</option>
                      <option value="payroll">Fondo de Nómina</option>
                      <option value="profits">Fondo de Ganancias</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Hacia Cuenta</label>
                    <select 
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-bold text-gray-700"
                      value={transferForm.to}
                      onChange={e => setTransferForm(f => ({ ...f, to: e.target.value }))}
                    >
                      <option value="ops">Caja General</option>
                      <option value="marketing">Marketing (Meta Ads)</option>
                      <option value="payroll">Fondo de Nómina</option>
                      <option value="profits">Fondo de Ganancias</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Monto (USD) *</label>
                    <input 
                      type="number" step="0.01" placeholder="0.00" 
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-semibold"
                      value={transferForm.amount}
                      onChange={e => setTransferForm(f => ({ ...f, amount: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">Concepto / Descripción</label>
                    <input 
                      placeholder="Ej: Inyección de capital a publicidad" 
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-500 font-semibold"
                      value={transferForm.description}
                      onChange={e => setTransferForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>

                  <button
                    onClick={handleExecuteTransfer}
                    disabled={!transferForm.amount || saveLlcConfig.isPending}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer bg-purple-600 hover:bg-purple-700 transition-colors border border-purple-750 disabled:opacity-50"
                  >
                    Ejecutar Transferencia
                  </button>
                </div>
              </div>
            </div>

            {/* Transfer Log */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b bg-slate-50/50">
                <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-gray-400" />
                  Historial de Transferencias Internas (LLC)
                </h3>
              </div>

              {currentTransfers.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs font-bold">No hay transferencias registradas</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50/30 text-[10px] uppercase font-bold text-slate-500 tracking-wider text-left">
                        <th className="px-5 py-3">Fecha</th>
                        <th className="px-5 py-3">Desde</th>
                        <th className="px-5 py-3">Hacia</th>
                        <th className="px-5 py-3">Monto</th>
                        <th className="px-5 py-3">Descripción</th>
                        <th className="px-5 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTransfers.map((t: any) => (
                        <tr key={t.id} className="border-b hover:bg-slate-50/50 transition-colors text-xs font-semibold text-gray-700">
                          <td className="px-5 py-3.5">{t.date}</td>
                          <td className="px-5 py-3.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600 border border-slate-150">
                              {getAccountLabel(t.from)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-50 text-purple-650 border border-purple-150">
                              {getAccountLabel(t.to)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-bold text-purple-600 text-sm">${t.amount.toFixed(2)}</td>
                          <td className="px-5 py-3.5 text-gray-400 text-xs">{t.description}</td>
                          <td className="px-5 py-3.5 text-right">
                            <button 
                              onClick={() => handleDeleteTransfer(t.id)} 
                              className="w-8 h-8 rounded-lg bg-gray-50 border hover:bg-red-50 hover:text-red-650 transition-colors text-gray-400 cursor-pointer inline-flex items-center justify-center"
                              title="Anular transferencia"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
