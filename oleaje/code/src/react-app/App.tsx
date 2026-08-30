import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@/react-app/contexts/AuthContext";
import { ProtectedRoute } from "@/react-app/components/ProtectedRoute";
import LandingPage from "@/react-app/pages/LandingPage";
import LoginPage from "@/react-app/pages/LoginPage";
import TableSelectionPage from "@/react-app/pages/TableSelectionPage";
import POSPage from "@/react-app/pages/POSPage";
import DashboardPage from "@/react-app/pages/DashboardPage";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/mesas" element={<ProtectedRoute><TableSelectionPage /></ProtectedRoute>} />
          <Route path="/pos" element={<ProtectedRoute><POSPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
