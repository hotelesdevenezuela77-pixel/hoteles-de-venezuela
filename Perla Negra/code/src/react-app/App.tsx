import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import HomePage from "@/react-app/pages/Home";
import Login from "@/react-app/pages/Login";
import Logout from "@/react-app/pages/Logout";
import AuthCallback from "@/react-app/pages/AuthCallback";
import IntranetLayout from "@/react-app/components/intranet/IntranetLayout";
import Dashboard from "@/react-app/pages/intranet/Dashboard";
import ReservationsCalendar from "@/react-app/pages/intranet/ReservationsCalendar";
import TasksPanel from "@/react-app/pages/intranet/TasksPanel";
import CRMLeads from "@/react-app/pages/intranet/CRMLeads";
import ContentManager from "@/react-app/pages/intranet/ContentManager";
import SeasonalPricing from "@/react-app/pages/intranet/SeasonalPricing";
import FinancialDashboard from "@/react-app/pages/intranet/FinancialDashboard";
import PayrollDashboard from "@/react-app/pages/intranet/PayrollDashboard";
import SuppliersDashboard from "@/react-app/pages/intranet/SuppliersDashboard";
import AccountsReceivableDashboard from "@/react-app/pages/intranet/AccountsReceivableDashboard";
import ExchangeRateDashboard from "@/react-app/pages/intranet/ExchangeRateDashboard";
import IncomeDashboard from "@/react-app/pages/intranet/IncomeDashboard";
import ExpensesDashboard from "@/react-app/pages/intranet/ExpensesDashboard";
import PLReportDashboard from "@/react-app/pages/intranet/PLReportDashboard";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Navigate to="/smarthecosystems/acceso" replace />} />
          <Route path="/smarthecosystems/login" element={<Navigate to="/smarthecosystems/acceso" replace />} />
          <Route path="/smarthecosystems/acceso" element={<Login />} />
          <Route path="/smarthecosystems/logout" element={<Logout />} />
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
            <Route path="finanzas" element={<FinancialDashboard />} />
            <Route path="nominas" element={<PayrollDashboard />} />
            <Route path="proveedores" element={<SuppliersDashboard />} />
            <Route path="cuentas-cobrar" element={<AccountsReceivableDashboard />} />
            <Route path="tasas" element={<ExchangeRateDashboard />} />
            <Route path="ingresos" element={<IncomeDashboard />} />
            <Route path="gastos" element={<ExpensesDashboard />} />
            <Route path="reportes-pl" element={<PLReportDashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
