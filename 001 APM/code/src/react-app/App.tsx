import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import HomePage from "@/react-app/pages/Home";
import Login from "@/react-app/pages/Login";
import AuthCallback from "@/react-app/pages/AuthCallback";
import IntranetLayout from "@/react-app/components/intranet/IntranetLayout";
import Dashboard from "@/react-app/pages/intranet/Dashboard";
import ReservationsCalendar from "@/react-app/pages/intranet/ReservationsCalendar";
import TasksPanel from "@/react-app/pages/intranet/TasksPanel";
import CRMLeads from "@/react-app/pages/intranet/CRMLeads";
import ContentManager from "@/react-app/pages/intranet/ContentManager";
import SeasonalPricing from "@/react-app/pages/intranet/SeasonalPricing";
import FinanceDashboard from "@/react-app/pages/intranet/FinanceDashboard";
import IncomePanel from "@/react-app/pages/intranet/IncomePanel";
import ExpensesPanel from "@/react-app/pages/intranet/ExpensesPanel";
import PayrollPanel from "@/react-app/pages/intranet/PayrollPanel";
import ReceivablesPanel from "@/react-app/pages/intranet/ReceivablesPanel";
import PLReports from "@/react-app/pages/intranet/PLReports";
import ExchangeRatePanel from "@/react-app/pages/intranet/ExchangeRatePanel";
import SuppliersPanel from "@/react-app/pages/intranet/SuppliersPanel";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Navigate to="/smarthecosystems/login" replace />} />
          <Route path="/smarthecosystems/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/intranet" element={<Navigate to="/smarthecosystems" replace />} />
          <Route path="/intranet/*" element={<Navigate to="/smarthecosystems" replace />} />
          <Route path="/smarthecosystems" element={<IntranetLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="reservaciones" element={<ReservationsCalendar />} />
            <Route path="tareas" element={<TasksPanel />} />
            <Route path="crm" element={<CRMLeads />} />
            <Route path="contenido" element={<ContentManager />} />
            <Route path="precios" element={<SeasonalPricing />} />
            <Route path="finanzas" element={<FinanceDashboard />} />
            <Route path="finanzas/ingresos" element={<IncomePanel />} />
            <Route path="finanzas/gastos" element={<ExpensesPanel />} />
            <Route path="finanzas/nomina" element={<PayrollPanel />} />
            <Route path="finanzas/cuentas" element={<ReceivablesPanel />} />
            <Route path="finanzas/reportes" element={<PLReports />} />
            <Route path="finanzas/tasas" element={<ExchangeRatePanel />} />
            <Route path="finanzas/proveedores" element={<SuppliersPanel />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
