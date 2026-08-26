import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router";
import { LogOut, Calendar, ClipboardList, Users, Home, FileEdit, Menu, X, DollarSign, Wallet, ChevronDown, ChevronRight, Receipt, CreditCard, UserCheck, HandCoins, FileBarChart, ArrowLeftRight, Building2 } from "lucide-react";
import { Starfish } from "@/react-app/components/landing/CaribbeanDecorations";

const LOGO_URL = "https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/2-01.png";

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  submenu?: { icon: any; label: string; path: string }[];
}

const menuItems: MenuItem[] = [
  { icon: Home, label: "Dashboard", path: "/smarthecosystems" },
  { icon: Calendar, label: "Reservaciones", path: "/smarthecosystems/reservaciones" },
  { 
    icon: Wallet, 
    label: "Finanzas", 
    path: "/smarthecosystems/finanzas",
    submenu: [
      { icon: CreditCard, label: "Ingresos", path: "/smarthecosystems/finanzas/ingresos" },
      { icon: Receipt, label: "Gastos", path: "/smarthecosystems/finanzas/gastos" },
      { icon: UserCheck, label: "Nómina", path: "/smarthecosystems/finanzas/nomina" },
      { icon: HandCoins, label: "Cuentas x Cobrar", path: "/smarthecosystems/finanzas/cuentas" },
      { icon: Building2, label: "Proveedores", path: "/smarthecosystems/finanzas/proveedores" },
      { icon: FileBarChart, label: "Reportes P&L", path: "/smarthecosystems/finanzas/reportes" },
      { icon: ArrowLeftRight, label: "Tasa de Cambio", path: "/smarthecosystems/finanzas/tasas" },
    ]
  },
  { icon: ClipboardList, label: "Tareas", path: "/smarthecosystems/tareas" },
  { icon: Users, label: "CRM / Leads", path: "/smarthecosystems/crm" },
  { icon: DollarSign, label: "Precios", path: "/smarthecosystems/precios" },
  { icon: FileEdit, label: "Contenido", path: "/smarthecosystems/contenido" },
];

interface AdminUser {
  id: string;
  email: string;
}

export default function IntranetLayout() {
  const { user, isPending, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Finanzas"]);

  // Check for admin session
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setAdminUser(data);
        }
      } catch (e) {
        // Not logged in as admin
      } finally {
        setIsCheckingAdmin(false);
      }
    };
    checkAdminSession();
  }, []);

  useEffect(() => {
    // Only redirect if neither Google user nor admin user exists and loading is complete
    if (!user && !adminUser && !isPending && !isCheckingAdmin) {
      navigate("/smarthecosystems/login");
    }
  }, [user, adminUser, isPending, isCheckingAdmin, navigate]);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    if (adminUser) {
      // Admin logout
      await fetch("/api/auth/logout", { method: "POST" });
      setAdminUser(null);
    } else {
      // Google logout
      await logout();
    }
    navigate("/smarthecosystems/login");
  };

  if (isPending || isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-blue-950 flex items-center justify-center">
        <Starfish className="w-16 h-16 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // Get the current user (either Google or admin)
  const currentUser = user || adminUser;

  if (!currentUser) {
    return null;
  }

  // Get display info based on user type
  const isGoogleUser = !!user;
  const displayName = isGoogleUser ? (user.google_user_data.name || user.email) : "Administrador";
  const displayEmail = isGoogleUser ? user.email : adminUser?.email || "";
  const displayPicture = isGoogleUser ? user.google_user_data.picture : null;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 via-sky-950 to-blue-950 text-white px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <img
          src={LOGO_URL}
          alt="Aparto Posada del Mar"
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
        fixed h-full z-50 w-64 bg-gradient-to-b from-slate-900 via-sky-950 to-blue-950 text-white flex flex-col
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <img
            src={LOGO_URL}
            alt="Aparto Posada del Mar"
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
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = expandedMenus.includes(item.label);
            
            return (
              <div key={item.label}>
                <button
                  onClick={() => {
                    if (hasSubmenu) {
                      setExpandedMenus(prev => 
                        prev.includes(item.label) 
                          ? prev.filter(m => m !== item.label)
                          : [...prev, item.label]
                      );
                    } else {
                      navigate(item.path);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "hover:bg-white/5 text-white/70 hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium flex-1 text-left">{item.label}</span>
                  {hasSubmenu && (
                    isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                
                {/* Submenu */}
                {hasSubmenu && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.submenu!.map((sub) => {
                      const isSubActive = location.pathname === sub.path;
                      return (
                        <button
                          key={sub.path}
                          onClick={() => navigate(sub.path)}
                          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                            isSubActive
                              ? "bg-cyan-500/20 text-cyan-300"
                              : "hover:bg-white/5 text-white/60 hover:text-white"
                          }`}
                        >
                          <sub.icon className="w-4 h-4" />
                          <span className="text-sm">{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            {displayPicture ? (
              <img
                src={displayPicture}
                alt={displayName}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-cyan-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-cyan-300 font-bold">
                  {displayEmail.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {displayName}
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
