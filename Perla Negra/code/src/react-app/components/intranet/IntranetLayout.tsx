import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet, Navigate } from "react-router";
import { LogOut, Calendar, ClipboardList, Users, Home, FileEdit, Menu, X, DollarSign, Loader2, Wallet, Briefcase, Truck, Receipt, TrendingUp, ArrowUpCircle, ArrowDownCircle, BarChart3 } from "lucide-react";

const LOGO_URL = "https://019dadb9-b77e-7d54-b090-02f504b20f6e.mochausercontent.com/PERLA-NEGRA.png";

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/smarthecosystems" },
  { icon: Calendar, label: "Reservaciones", path: "/smarthecosystems/reservaciones" },
  { icon: ClipboardList, label: "Tareas", path: "/smarthecosystems/tareas" },
  { icon: Users, label: "CRM / Leads", path: "/smarthecosystems/crm" },
  { icon: DollarSign, label: "Precios", path: "/smarthecosystems/precios" },
  { icon: Wallet, label: "Finanzas", path: "/smarthecosystems/finanzas" },
  { icon: ArrowUpCircle, label: "Ingresos", path: "/smarthecosystems/ingresos" },
  { icon: ArrowDownCircle, label: "Gastos", path: "/smarthecosystems/gastos" },
  { icon: Briefcase, label: "Nóminas", path: "/smarthecosystems/nominas" },
  { icon: Truck, label: "Proveedores", path: "/smarthecosystems/proveedores" },
  { icon: Receipt, label: "Cuentas por Cobrar", path: "/smarthecosystems/cuentas-cobrar" },
  { icon: TrendingUp, label: "Tasa de Cambio", path: "/smarthecosystems/tasas" },
  { icon: BarChart3, label: "Reportes P&L", path: "/smarthecosystems/reportes-pl" },
  { icon: FileEdit, label: "Contenido", path: "/smarthecosystems/contenido" },
];

interface AdminUser {
  id: string;
  email: string;
}

export default function IntranetLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  // Check for admin session
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            setAdminUser(data);
          } else {
            setAuthError(true);
          }
        } else {
          setAuthError(true);
        }
      } catch (e) {
        setAuthError(true);
      } finally {
        setIsLoading(false);
      }
    };
    checkAdminSession();
  }, []);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    navigate("/smarthecosystems/logout");
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
      </div>
    );
  }

  // Redirect to login if no user or auth error
  if (!adminUser || authError) {
    return <Navigate to="/smarthecosystems/acceso" replace />;
  }

  const displayEmail = adminUser.email;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <img
          src={LOGO_URL}
          alt="Posada Perla Negra"
          className="h-10 object-contain"
        />
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed h-full z-50 w-64 bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 text-white flex flex-col
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <img
            src={LOGO_URL}
            alt="Posada Perla Negra"
            className="h-14 object-contain"
          />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== "/smarthecosystems" && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "hover:bg-white/5 text-white/70 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-amber-300 font-bold">
                {displayEmail.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                Administrador
              </p>
              <p className="text-xs text-white/50 truncate">{displayEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
