import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  Building2, MapPin, Users, FileText, Package, BarChart3, Tag,
  Newspaper, Settings, Globe, ShieldCheck, DollarSign, ClipboardList,
  Sparkles, Bot, Network, Shield, Car, Compass, AlertTriangle, Ticket, LayoutDashboard,
  Search, Bell, ChevronLeft, ChevronRight, X, ShieldAlert,
  ArrowUpDown, Receipt, MessageSquare, Star, Mail, Link2, LogOut, ChevronDown,
  Calendar, TrendingUp, Activity, Edit3, Briefcase
} from "lucide-react";

// Colores Oficiales (Sistemas de Contraste)
const FUCSIA = "#FF0096"; // Botones premium y llamados de atención
const CIAN = "#00C8D4";   // Acentos primarios, B2B e ítems recomendados
const PURPURA = "#9B00CC"; // Gradiente secundario

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
}

interface CategoryGroup {
  name: string;
  items: MenuItem[];
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [currentPath] = useLocation();

  // Estados de control de la UI
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("hdv_admin_sidebar_open");
    return saved !== null ? saved === "true" : true;
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const notificationRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Alertas Simuladas en Tiempo Real
  const [notifications, setNotifications] = useState([
    { id: 1, type: "channel", text: "Nueva reserva vía Booking.com en Hesperia Isla Margarita", time: "Hace 2 min", read: false },
    { id: 2, type: "payment", text: "Comisión mensual de $450 por verificar de Posada La Gotera", time: "Hace 15 min", read: false },
    { id: 3, type: "kyc", text: "Socio 'Turismo Canaima C.A.' cargó documentos de registro mercantil", time: "Hace 1 hora", read: true },
  ]);

  // Cerrar menús al hacer click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Guardar estado del sidebar en localStorage
  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      const next = !prev;
      localStorage.setItem("hdv_admin_sidebar_open", String(next));
      return next;
    });
  };

  // Atajo de teclado global Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Enfocar buscador al abrir
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      setSelectedIndex(0);
    }
  }, [searchOpen]);

  // Lista de Categorías y Submódulos (Estructura de Información Reorganizada)
  const menuCategories: CategoryGroup[] = [
    {
      name: "Operaciones",
      items: [
        { label: "Resumen", href: "/admin", icon: LayoutDashboard },
        { label: "Establecimientos", href: "/admin/establecimientos", icon: Building2 },
        { label: "Aprobaciones", href: "/admin/aprobaciones", icon: ShieldCheck },
        { label: "Reservas de Hoteles", href: "/admin/reservas", icon: Calendar },
        { label: "Reservas de Paquetes", href: "/admin/reservas-paquetes", icon: Receipt },
        { label: "Solicitudes", href: "/admin/solicitudes", icon: ClipboardList },
        { label: "Channel Manager", href: "/admin/channel-manager", icon: Network },
        { label: "Verificación KYC", href: "/admin/kyc", icon: ShieldAlert },
        { label: "Traslados y Flota", href: "/admin/transfers", icon: Car },
        { label: "Experiencias", href: "/admin/experiences", icon: Compass },
        { label: "Agenda y Calendario", href: "/admin/agenda", icon: Calendar },
        { label: "Expedición de Rutas", href: "/admin/expedicion-rutas", icon: MapPin },
      ]
    },
    {
      name: "Marketing y Ventas",
      items: [
        { label: "Gestión Comercial", href: "/admin/comercial", icon: Briefcase },
        { label: "Paquetes Turísticos", href: "/admin/paquetes", icon: Package },
        { label: "WhatsApp CRM", href: "/crm", icon: MessageSquare },
        { label: "Base de Clientes", href: "/admin/clientes", icon: Users },
        { label: "Club y Cupones", href: "/admin/loyalty-coupons", icon: Ticket },
        { label: "Reseñas y Opiniones", href: "/admin/reseñas", icon: Star },
        { label: "Tips de Turismo", href: "/admin/tips", icon: Compass },
        { label: "Sitios Turísticos", href: "/admin/sitios", icon: MapPin },
        { label: "Parques Nacionales", href: "/admin/parques", icon: Globe },
        { label: "Link Hub", href: "/admin/linkhub", icon: Link2 },
        { label: "Blog Corporativo", href: "/admin/blog", icon: Newspaper },
      ]
    },
    {
      name: "Finanzas",
      items: [
        { label: "Libro de Finanzas", href: "/admin/finanzas", icon: DollarSign },
        { label: "Verificar Pagos", href: "/admin/pagos", icon: Receipt },
        { label: "Cotizaciones", href: "/admin/cotizaciones", icon: FileText },
        { label: "Tasas de Cambio", href: "/admin/tasas", icon: TrendingUp },
        { label: "Transacciones B2B", href: "/admin/b2b", icon: ArrowUpDown },
        { label: "Precios BI Dinámicos", href: "/admin/dynamic-pricing", icon: TrendingUp },
        { label: "Gestión de Planes SaaS", href: "/admin/saas", icon: Building2 },
      ]
    },
    {
      name: "IA y Analítica",
      items: [
        { label: "Centaurus IA", href: "/centaurus", icon: Star },
        { label: "Andromeda Analytics", href: "/andromeda", icon: Sparkles },
        { label: "Agente IA Chat", href: "/admin/ia-conversacional", icon: Bot },
        { label: "Asistente Guiones", href: "/admin/asistente-guiones", icon: Sparkles },
        { label: "Reportes Analíticos", href: "/admin/analiticas", icon: BarChart3 },
        { label: "Auditoría de Logs", href: "/admin/logs", icon: Shield },
        { label: "Monitoreo IA Viajes", href: "/admin/ia-viajes", icon: Activity },
      ]
    },
    {
      name: "Configuración",
      items: [
        { label: "Configuración General", href: "/admin/config", icon: Settings },
        { label: "Editar Home y Portada", href: "/admin/contenido", icon: Edit3 },
        { label: "Páginas SEO", href: "/admin/seo", icon: Globe },
        { label: "SEO Home Editor", href: "/admin/seo-home", icon: Search },
        { label: "Gestión de Usuarios", href: "/admin/usuarios", icon: Users },
        { label: "Categorías de Negocios", href: "/admin/categorias", icon: Tag },
        { label: "Destinos y Regiones", href: "/admin/destinos", icon: MapPin },
        { label: "Plantillas de Correos", href: "/admin/correos", icon: Mail },
        { label: "Alertas del Sistema", href: "/admin/alerts", icon: AlertTriangle },
        { label: "Prioridades de Carga", href: "/admin/prioridades", icon: ArrowUpDown },
      ]
    }
  ];

  // Aplanar todos los subenlaces para el buscador global Ctrl+K
  const flatMenuItems = menuCategories.flatMap(cat =>
    cat.items.map(item => ({ ...item, category: cat.name }))
  );

  // Filtrado reactivo en el buscador
  const filteredMenuItems = flatMenuItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Controlar navegación con teclado en Ctrl+K
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredMenuItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredMenuItems.length) % filteredMenuItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredMenuItems[selectedIndex]) {
        handleNavigate(filteredMenuItems[selectedIndex].href);
      }
    }
  };

  const handleNavigate = (href: string) => {
    setLocation(href);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen text-slate-100 flex font-sans overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0e011f 0%, #17032d 50%, #081124 100%)" }}>

      {/* ── SIDEBAR LATERAL RETRÁCTIL ── */}
      <aside
        className="transition-all duration-300 ease-in-out shrink-0 flex flex-col border-r border-white/5 relative z-30 shadow-2xl"
        style={{
          width: sidebarOpen ? "270px" : "78px",
          backgroundColor: "#1a0533"
        }}
      >
        {/* Cabecera del Sidebar */}
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${FUCSIA}, ${PURPURA})` }}>
              <Building2 className="w-4.5 h-4.5" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="font-serif text-[11px] font-black tracking-widest text-white leading-none">HOTELES DE VENEZUELA</span>
                <span className="text-[8px] font-bold tracking-widest uppercase mt-1" style={{ color: CIAN }}>CONSOLA ADMIN</span>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Atajo de Buscador Lateral */}
        <div className="p-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-left text-slate-400 flex items-center justify-between text-xs transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" style={{ color: CIAN }} />
              {sidebarOpen && <span className="font-semibold text-slate-400">Buscar módulo...</span>}
            </span>
            {sidebarOpen && <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono text-slate-500 font-bold">Ctrl+K</span>}
          </button>
        </div>

        {/* Elementos de Navegación */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 no-scrollbar">
          {menuCategories.map((category, idx) => (
            <div key={idx} className="space-y-1">
              {sidebarOpen && (
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1.5 opacity-60">
                  {category.name}
                </h4>
              )}
              {category.items.map((item, itemIdx) => {
                // Validación flexible de ruta activa
                const active = currentPath === item.href || (item.href !== "/admin" && currentPath.startsWith(item.href));
                return (
                  <Link key={itemIdx} href={item.href}>
                    <button
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer group relative ${active
                          ? "text-white"
                          : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                        }`}
                      style={{
                        background: active ? `linear-gradient(90deg, rgba(255,0,150,0.15), rgba(155,0,204,0.15))` : "transparent",
                        border: active ? `1px solid rgba(255,0,150,0.2)` : "1px solid transparent",
                      }}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all border"
                        style={{
                          backgroundColor: active ? FUCSIA : "rgba(255, 255, 255, 0.05)",
                          borderColor: active ? FUCSIA : "rgba(255, 255, 255, 0.08)",
                          color: "white"
                        }}>
                        <item.icon className="w-3.5 h-3.5" />
                      </div>
                      {sidebarOpen && <span className="truncate">{item.label}</span>}
                      {active && <div className="absolute right-2.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: FUCSIA }} />}
                    </button>
                  </Link>
                );
              })}
              {sidebarOpen && idx < menuCategories.length - 1 && <div className="h-px bg-white/5 my-3 mx-2" />}
            </div>
          ))}
        </div>

        {/* Footer del Sidebar con el Operador */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between gap-2 bg-[#14022a]/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white text-xs font-black"
              style={{ borderLeft: `3px solid ${CIAN}` }}>
              {profile?.name ? profile.name.substring(0, 2).toUpperCase() : "AD"}
            </div>
            {sidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate leading-none mb-0.5">{profile?.name || "Administrador"}</span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">{profile?.role || "admin"}</span>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 cursor-pointer transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ENVOLVENTE ── */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* Cabecera Superior (Top Header) */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#0e011f]/90 backdrop-blur-md relative z-20">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Panel General</span>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-black uppercase text-white tracking-widest">
              {flatMenuItems.find(i => i.href === currentPath)?.label || "Inicio"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Buscador de Cabecera */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all cursor-pointer flex items-center justify-center"
              title="Buscar Módulo (Ctrl+K)"
            >
              <Search className="w-4 h-4" style={{ color: CIAN }} />
            </button>

            {/* Centro de Notificaciones Flotante */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all relative cursor-pointer flex items-center justify-center"
              >
                <Bell className="w-4 h-4" style={{ color: FUCSIA }} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-pulse border border-[#0e011f]"
                    style={{ backgroundColor: CIAN }} />
                )}
              </button>

              {/* Panel Desplegable de Notificaciones */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-white/10 shadow-2xl p-4 z-40 bg-[#1a0533]">
                  <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                    <span className="text-[10px] font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5" style={{ color: FUCSIA }} /> Alertas en Vivo
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[10px] font-bold hover:underline cursor-pointer"
                        style={{ color: CIAN }}
                      >
                        Marcar leído
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-2.5 rounded-xl border text-[11px] leading-relaxed transition-all ${n.read ? "bg-black/10 border-white/5 text-slate-400" : "bg-gradient-to-r from-pink-500/5 to-purple-500/5 border-pink-500/20 text-white"
                        }`}>
                        <div className="flex justify-between items-start gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider shrink-0"
                            style={{
                              backgroundColor: n.type === "channel" ? `${CIAN}15` : `${FUCSIA}15`,
                              color: n.type === "channel" ? CIAN : FUCSIA,
                              border: `1px solid ${n.type === "channel" ? CIAN : FUCSIA}25`
                            }}>
                            {n.type === "channel" ? "Channel" : "Pago"}
                          </span>
                          <span className="text-[9px] text-slate-500 font-bold shrink-0">{n.time}</span>
                        </div>
                        <p className="mt-1 font-semibold text-slate-200">{n.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Datos del Operador */}
            <div className="flex items-center gap-3 pl-3 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <span className="block text-[8px] uppercase font-bold text-slate-500 tracking-wider">Conectado</span>
                <span className="text-xs font-bold text-white block leading-none mt-0.5">{profile?.name || user?.email}</span>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                style={{ background: `linear-gradient(135deg, ${FUCSIA}, ${PURPURA})` }}>
                {profile?.name ? profile.name.substring(0, 1).toUpperCase() : "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Zona del Cuerpo / Ruta Activa */}
        <main className="flex-1 overflow-y-auto relative no-scrollbar">
          {children}
        </main>
      </div>

      {/* ── MODAL DEL BUSCADOR GLOBAL (CTRL+K) ── */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden p-4 space-y-4 bg-[#1a0533]">

            {/* Header del buscador */}
            <div className="flex items-center gap-3 border-b border-white/5 pb-2.5">
              <Search className="w-4.5 h-4.5" style={{ color: CIAN }} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Escribe para buscar un módulo administrativo (ej: reservas, kyc)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                className="flex-1 bg-transparent text-white placeholder-slate-500 text-xs focus:outline-none border-none ring-0 focus:ring-0 focus:border-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Resultados filtrados */}
            <div className="max-h-60 overflow-y-auto space-y-1 pr-1 no-scrollbar">
              {filteredMenuItems.length === 0 ? (
                <p className="text-center text-xs text-slate-500 font-bold py-6">
                  No se encontraron módulos relacionados con tu búsqueda.
                </p>
              ) : (
                filteredMenuItems.map((item, idx) => {
                  const selected = idx === selectedIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleNavigate(item.href)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left cursor-pointer text-xs ${selected
                          ? "bg-white/10 border-white/20 text-white"
                          : "bg-transparent border-transparent text-slate-400"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-white/10"
                          style={{
                            backgroundColor: selected ? FUCSIA : "rgba(255,255,255,0.05)",
                            color: "white"
                          }}>
                          <item.icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className={`font-bold block ${selected ? "text-white" : "text-slate-300"}`}>{item.label}</span>
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{item.category}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  );
                })
              )}
            </div>

            {/* Pie de página con atajos del buscador */}
            <div className="flex items-center justify-between text-[9px] text-slate-500 font-semibold border-t border-white/5 pt-2.5">
              <span>Usa <kbd className="px-1 py-0.5 rounded bg-white/5 font-mono">↑↓</kbd> para navegar y <kbd className="px-1 py-0.5 rounded bg-white/5 font-mono">Enter</kbd> para seleccionar</span>
              <span>Cierra con <kbd className="px-1 py-0.5 rounded bg-white/5 font-mono">ESC</kbd></span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
