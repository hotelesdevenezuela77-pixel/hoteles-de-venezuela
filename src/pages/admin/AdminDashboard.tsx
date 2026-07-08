import { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Building2, MapPin, Calendar, Users, FileText,
  Package, BarChart3, Tag, Newspaper, CheckCircle, Clock,
  XCircle, Star, MessageSquare, Settings, Globe,
  ShieldCheck, TrendingUp, Wrench, Eye, Loader2, DollarSign, ClipboardList,
  AlertCircle, Award, Activity
} from "lucide-react";

const C = {
  fucsia:   "#FF0096",
  teal:     "#00C8D4",
  purple:   "#9B00CC",
  green:    "#22C55E",
  amber:    "#F59E0B",
  red:      "#EF4444",
  orange:   "#F97316",
  indigo:   "#6366F1",
};

const STATUS_COLORS  = [C.green,  C.amber,  C.red];
const ROLE_COLORS    = [C.fucsia, C.teal,   C.purple, C.orange, C.indigo];
const BAR_COLORS     = [C.fucsia, C.teal,   C.purple, C.orange, C.indigo, C.green, C.amber, C.red];

const STATUS_ICON: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  approved: { icon: CheckCircle, color: C.green,  label: "Aprobado"  },
  pending:  { icon: Clock,       color: C.amber,  label: "Pendiente" },
  rejected: { icon: XCircle,     color: C.red,    label: "Rechazado" },
};

const NAV_CARDS = [
  { href: "/admin/establecimientos", icon: Building2, label: "Establecimientos", desc: "Hoteles y posadas",       color: C.fucsia },
  { href: "/admin/destinos",         icon: MapPin,    label: "Destinos",          desc: "Destinos turísticos",    color: C.teal   },
  { href: "/admin/reservas",         icon: Calendar,  label: "Reservas",          desc: "Ver y gestionar",        color: C.purple },
  { href: "/admin/blog",             icon: Newspaper, label: "Blog",              desc: "Publicaciones",          color: C.orange },
  { href: "/admin/paquetes",         icon: Package,   label: "Paquetes",          desc: "Tours y paquetes",       color: C.green  },
  { href: "/admin/categorias",       icon: Tag,       label: "Categorías",        desc: "Tipos de establec.",     color: C.amber  },
  { href: "/admin/usuarios",         icon: Users,     label: "Usuarios",          desc: "Cuentas de usuario",     color: C.indigo },
  { href: "/admin/cotizaciones",     icon: FileText,  label: "Cotizaciones",      desc: "Solicitudes de cot.",    color: C.fucsia },
  { href: "/crm",                    icon: MessageSquare, label: "WhatsApp CRM",   desc: "Leads y contactos",      color: C.teal   },
  { href: "/andromeda",              icon: Star,      label: "Andromeda",         desc: "Superadmin analytics",   color: C.purple },
  { href: "/admin/tasas",            icon: TrendingUp, label: "Tasas de Cambio", desc: "Moneda y cambio",        color: C.orange },
  { href: "/admin/seo",              icon: Globe,     label: "SEO & Sitemap",     desc: "Optimización web",       color: C.green  },
  { href: "/admin/finanzas",         icon: DollarSign,    label: "Finanzas",           desc: "Ingresos y egresos",     color: C.purple },
  { href: "/admin/solicitudes",      icon: ClipboardList, label: "Solicitudes",         desc: "Booking requests",       color: C.fucsia },
  { href: "/admin/reservas-paquetes",icon: Package,       label: "Reservas Paquetes",   desc: "Tour package bookings",  color: C.teal   },
  { href: "/admin/reseñas",          icon: Star,          label: "Reseñas",             desc: "Moderar reseñas",        color: C.amber  },
];

const TABS = [
  { id: "resumen",      label: "Resumen"          },
  { id: "estadisticas", label: "Estadísticas"     },
  { id: "gestion",      label: "Gestión Rápida"   },
  { id: "actividad",    label: "Actividad"        },
];

function StatCard({
  icon: Icon, label, value, color, loading,
}: { icon: any; label: string; value: number | string; color: string; loading: boolean }) {
  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-md overflow-hidden border border-white/10">
      <div className="h-1" style={{ background: color }} />
      <div className="p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-white/5"
          style={{ background: `${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <div className="text-2xl font-bold text-white">
            {loading ? <div className="h-7 w-16 bg-white/10 animate-pulse rounded" /> : value}
          </div>
          <div className="text-xs text-white/50 font-semibold mt-0.5">{label}</div>
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-xl shadow-lg p-3 border border-white/10 text-xs">
      <p className="font-semibold text-white mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export function AdminDashboard() {
  const { user, profile, loading: authLoading, onlineUsers } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("resumen");
  
  // Data loading states
  const [loading, setLoading] = useState(true);
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [reviewsCount, setReviewsCount] = useState(0);

  // Compute real-time online stats
  const onlineStats = useMemo(() => {
    const counts = {
      total: 0,
      logged: 0,
      visitors: 0,
      admin: 0,
      owner: 0, // 'owner' or 'business_owner'
      tourist: 0, // 'user'
      agent: 0, // 'agent'
    };

    const uniqueKeys = new Set<string>();
    const list: any[] = [];

    onlineUsers.forEach((u) => {
      const key = u.user_id ? `auth:${u.user_id}` : u.presenceKey;
      if (!uniqueKeys.has(key)) {
        uniqueKeys.add(key);
        list.push(u);
      }
    });

    list.forEach((u) => {
      counts.total++;
      if (u.user_id) {
        counts.logged++;
        if (u.role === "admin" || u.role === "superadmin") {
          counts.admin++;
        } else if (u.role === "owner" || u.role === "business_owner") {
          counts.owner++;
        } else if (u.role === "user") {
          counts.tourist++;
        } else if (u.role === "agent") {
          counts.agent++;
        }
      } else {
        counts.visitors++;
      }
    });

    return {
      counts,
      usersList: list,
    };
  }, [onlineUsers]);

  // Maintenance mode
  const [maintenanceOn, setMaintenanceOn] = useState(false);
  const [updatingMaintenance, setUpdatingMaintenance] = useState(false);
  const [checklist, setChecklist] = useState({
    backup: false,
    cloudflare: false,
    notifications: false,
    logs: false
  });

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch establishments
      const { data: estData } = await supabase
        .from("establishments")
        .select("id, name, status, category_id, destination_id, created_at, is_featured")
        .order("created_at", { ascending: false });
      setEstablishments(estData || []);

      // Fetch users
      const { data: profilesData } = await supabase
        .from("user_profiles")
        .select("user_id, role, created_at")
        .order("created_at", { ascending: false });
      
      let finalUsers = (profilesData || []).map((u: any) => ({
        id: u.user_id,
        role: u.role,
        created_at: u.created_at
      }));
      const localUsersKey = "hdv_mock_users";
      const localUsers = JSON.parse(localStorage.getItem(localUsersKey) || "[]");
      setUsers([...finalUsers, ...localUsers]);

      // Fetch categories
      const { data: catData } = await supabase.from("categories").select("id, name");
      setCategories(catData || []);

      // Fetch destinations
      const { data: destData } = await supabase.from("destinations").select("id, name");
      setDestinations(destData || []);

      // Fetch reservations
      const { data: resData } = await supabase.from("reservations").select("id, status, total_price, check_in_date, created_at");
      setReservations(resData || []);

      // Fetch maintenance setting
      const { data: settingData } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", "maintenance_mode")
        .single();
      
      if (settingData) {
        setMaintenanceOn(settingData.setting_value === "true");
      }

    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleMaintenance = async () => {
    try {
      setUpdatingMaintenance(true);
      const nextValue = !maintenanceOn;

      // Fetch existing settings to find the id of maintenance_mode or compute a safe new id
      const { data: allSettings } = await supabase
        .from("site_settings")
        .select("id, setting_key");
      
      const existing = allSettings?.find(s => s.setting_key === "maintenance_mode");
      const payload: any = {
        setting_key: "maintenance_mode",
        setting_value: nextValue ? "true" : "false",
        setting_label: "Modo Mantenimiento",
        setting_group: "system"
      };

      if (existing) {
        payload.id = existing.id;
      } else {
        const maxId = allSettings?.reduce((max, s) => s.id > max ? s.id : max, 0) || 0;
        payload.id = maxId + 1;
      }

      const { error } = await supabase
        .from("site_settings")
        .upsert(payload, { onConflict: "setting_key" });

      if (error) throw error;
      setMaintenanceOn(nextValue);
    } catch (err) {
      console.error("Error updating maintenance settings:", err);
      alert("Error al actualizar la configuración de mantenimiento: " + (err as any).message);
    } finally {
      setUpdatingMaintenance(false);
    }
  };

  // KPI counts
  const counts = useMemo(() => {
    const total = establishments.length;
    const approved = establishments.filter(e => e.status === "approved").length;
    const pending = establishments.filter(e => e.status === "pending").length;
    const rejected = establishments.filter(e => e.status === "rejected").length;
    const featured = establishments.filter(e => e.is_featured).length;

    return {
      establishments: total,
      approved,
      pending,
      rejected,
      featured,
      users: users.length,
      categories: categories.length,
      destinations: destinations.length,
      reviews: reviewsCount
    };
  }, [establishments, users, categories, destinations, reviewsCount]);

  // Chart 1: monthly growth mock merged with actual counts
  const monthlyData = useMemo(() => {
    return [
      { month: 'Feb', Establecimientos: 2, Usuarios: 1 },
      { month: 'Mar', Establecimientos: 45, Usuarios: 3 },
      { month: 'Abr', Establecimientos: 15, Usuarios: 1 },
      { month: 'May', Establecimientos: establishments.length || 5, Usuarios: users.length || 3 }
    ];
  }, [establishments, users]);

  // Chart 2: Status Pie/Donut
  const byStatusData = useMemo(() => {
    return [
      { name: 'Aprobados', value: counts.approved || 62 },
      { name: 'Pendientes', value: counts.pending || 4 },
      { name: 'Rechazados', value: counts.rejected || 1 }
    ];
  }, [counts]);

  // Chart 3: categories grouping
  const byCategoryData = useMemo(() => {
    if (establishments.length === 0) {
      return [
        { name: 'Hoteles', value: 32 },
        { name: 'Posadas', value: 18 },
        { name: 'Marinas', value: 5 },
        { name: 'Restaurantes', value: 4 },
        { name: 'Sitios', value: 3 }
      ];
    }
    const map: Record<string, number> = {};
    establishments.forEach(e => {
      const cat = categories.find(c => c.id === e.category_id)?.name || "Otros";
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.keys(map).map(name => ({ name, value: map[name] }));
  }, [establishments, categories]);

  // Chart 4: destinations grouping
  const byDestinationData = useMemo(() => {
    if (establishments.length === 0) {
      return [
        { name: 'Morrocoy', value: 26 },
        { name: 'Caracas', value: 8 },
        { name: 'Barquisimeto', value: 5 },
        { name: 'Mérida', value: 3 },
        { name: 'Los Roques', value: 2 }
      ];
    }
    const map: Record<string, number> = {};
    establishments.forEach(e => {
      const dest = destinations.find(d => d.id === e.destination_id)?.name || "Otros";
      map[dest] = (map[dest] || 0) + 1;
    });
    return Object.keys(map).map(name => ({ name, value: map[name] }));
  }, [establishments, destinations]);

  // Chart 5: users count by role
  const byRoleData = useMemo(() => {
    const map: Record<string, number> = {};
    users.forEach(u => {
      map[u.role] = (map[u.role] || 0) + 1;
    });
    return [
      { name: 'Administradores', value: map['admin'] || 2 },
      { name: 'Propietarios', value: map['business_owner'] || map['owner'] || 2 },
      { name: 'Usuarios', value: map['user'] || 3 },
      { name: 'Agentes', value: map['agent'] || 1 }
    ];
  }, [users]);

  // Recent activity list
  const recentActivity = useMemo(() => {
    return establishments.slice(0, 5).map(e => ({
      id: e.id,
      name: e.name,
      status: e.status,
      category: categories.find(c => c.id === e.category_id)?.name || "Establecimiento",
      createdAt: e.created_at
    }));
  }, [establishments, categories]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
        <p className="text-gray-500 text-xs font-bold">Verificando credenciales de seguridad...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 text-gray-800" style={{ background: "linear-gradient(135deg, #0e0120 0%, #1a0533 60%, #0d1a2e 100%)" }}>
      {/* ── Header ── */}
      <header className="relative overflow-hidden py-10 bg-transparent">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-10" style={{ background: C.fucsia }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full blur-3xl opacity-10" style={{ background: C.teal }} />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-brand-magenta/10 flex items-center justify-center text-brand-magenta">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5 flex-wrap">
              <span>PANEL ADMINISTRATIVO DE HOTELES DE VENEZUELA LLC</span>
              <span className="flex items-center gap-1.5 shrink-0">
                {/* USA Flag */}
                <svg className="w-7 h-4.5 rounded-xs shadow-md inline-block object-cover border border-white/20 align-middle" viewBox="0 0 7410 3900" xmlns="http://www.w3.org/2000/svg">
                  <rect width="7410" height="3900" fill="#b22234"/>
                  <path d="M0,300h7410M0,900h7410M0,1500h7410M0,2100h7410M0,2700h7410M0,3300h7410" stroke="#fff" stroke-width="300"/>
                  <rect width="2964" height="2100" fill="#3c3b6e"/>
                  <g fill="#fff">
                    <circle cx="296" cy="175" r="45"/><circle cx="889" cy="175" r="45"/><circle cx="1482" cy="175" r="45"/><circle cx="2075" cy="175" r="45"/><circle cx="2668" cy="175" r="45"/>
                    <circle cx="593" cy="350" r="45"/><circle cx="1186" cy="350" r="45"/><circle cx="1778" cy="350" r="45"/><circle cx="2371" cy="350" r="45"/>
                    <circle cx="296" cy="525" r="45"/><circle cx="889" cy="525" r="45"/><circle cx="1482" cy="525" r="45"/><circle cx="2075" cy="525" r="45"/><circle cx="2668" cy="525" r="45"/>
                    <circle cx="593" cy="700" r="45"/><circle cx="1186" cy="700" r="45"/><circle cx="1778" cy="700" r="45"/><circle cx="2371" cy="700" r="45"/>
                    <circle cx="296" cy="875" r="45"/><circle cx="889" cy="875" r="45"/><circle cx="1482" cy="875" r="45"/><circle cx="2075" cy="875" r="45"/><circle cx="2668" cy="875" r="45"/>
                    <circle cx="593" cy="1050" r="45"/><circle cx="1186" cy="1050" r="45"/><circle cx="1778" cy="1050" r="45"/><circle cx="2371" cy="1050" r="45"/>
                    <circle cx="296" cy="1225" r="45"/><circle cx="889" cy="1225" r="45"/><circle cx="1482" cy="1225" r="45"/><circle cx="2075" cy="1225" r="45"/><circle cx="2668" cy="1225" r="45"/>
                    <circle cx="593" cy="1400" r="45"/><circle cx="1186" cy="1400" r="45"/><circle cx="1778" cy="1400" r="45"/><circle cx="2371" cy="1400" r="45"/>
                    <circle cx="296" cy="1575" r="45"/><circle cx="889" cy="1575" r="45"/><circle cx="1482" cy="1575" r="45"/><circle cx="2075" cy="1575" r="45"/><circle cx="2668" cy="1575" r="45"/>
                    <circle cx="593" cy="1750" r="45"/><circle cx="1186" cy="1750" r="45"/><circle cx="1778" cy="1750" r="45"/><circle cx="2371" cy="1750" r="45"/>
                    <circle cx="296" cy="1925" r="45"/><circle cx="889" cy="1925" r="45"/><circle cx="1482" cy="1925" r="45"/><circle cx="2075" cy="1925" r="45"/><circle cx="2668" cy="1925" r="45"/>
                  </g>
                </svg>
                {/* Venezuela Flag */}
                <svg className="w-7 h-4.5 rounded-xs shadow-md inline-block object-cover border border-white/20 align-middle" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
                  <rect width="900" height="200" fill="#ffcc00"/>
                  <rect y="200" width="900" height="200" fill="#00247d"/>
                  <rect y="400" width="900" height="200" fill="#cf142b"/>
                  <g fill="#fff" transform="translate(450, 310)">
                    <circle cx="-100" cy="20" r="10" />
                    <circle cx="-73" cy="-10" r="10" />
                    <circle cx="-40" cy="-30" r="10" />
                    <circle cx="-13" cy="-40" r="10" />
                    <circle cx="13" cy="-40" r="10" />
                    <circle cx="40" cy="-30" r="10" />
                    <circle cx="73" cy="-10" r="10" />
                    <circle cx="100" cy="20" r="10" />
                  </g>
                </svg>
              </span>
            </h1>
          </div>
          <p className="text-white/60 text-xs ml-[52px] font-medium">
            Consola Principal · Conexión Encriptada · <span className="text-cyan-400 font-bold">{user?.email}</span>
          </p>
        </div>
      </header>

      {/* ── Tab Bar Component ── */}
      <AdminTabBar />

      {/* ── Dashboard Sub-Tabs ── */}
      <div className="bg-slate-950/20 border-b border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="px-5 py-3.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer"
                style={{
                  borderColor: activeTab === t.id ? C.fucsia : "transparent",
                  color: activeTab === t.id ? C.fucsia : "rgba(255, 255, 255, 0.6)",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* ─ Tab: Resumen ─ */}
        {activeTab === "resumen" && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard icon={Building2}  label="Establecimientos" value={counts.establishments} color={C.fucsia} loading={loading} />
              <StatCard icon={CheckCircle} label="Aprobados"         value={counts.approved} color={C.green}  loading={loading} />
              <StatCard icon={Clock}       label="Pendientes"        value={counts.pending} color={C.amber}  loading={loading} />
              <StatCard icon={Users}       label="Usuarios"          value={counts.users} color={C.teal}   loading={loading} />
              <StatCard icon={Tag}         label="Categorías"        value={counts.categories} color={C.purple} loading={loading} />
              <StatCard icon={Star}        label="Destacados"        value={counts.featured} color={C.orange} loading={loading} />
            </div>

            {/* ── Monitoreo en Tiempo Real (Telemetría en Vivo) ── */}
            <div className="rounded-2xl border border-white/10 overflow-hidden shadow-xl" style={{ background: "linear-gradient(135deg, #0e011f 0%, #1a0533 100%)" }}>
              <div className="p-6">
                
                {/* Header de Monitoreo */}
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#00C8D4] flex items-center justify-center text-white shrink-0 shadow-md">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        Monitoreo en Tiempo Real
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      </h2>
                      <p className="text-[10px] text-white/50 font-bold uppercase mt-0.5">Usuarios conectados en la plataforma actualmente</p>
                    </div>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-wider text-white flex items-center gap-2">
                    <span className="text-[#00C8D4] animate-pulse">•</span> {onlineStats.counts.total} personas online
                  </div>
                </div>

                {/* Grid de Contadores de Conexión */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {/* Card 1: Total en Línea */}
                  <div className="rounded-xl p-4 bg-white/5 border border-white/5 flex items-center gap-3 hover:bg-white/8 transition-all">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[#00C8D4] shadow-sm">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-white leading-none">{onlineStats.counts.total}</div>
                      <div className="text-[9px] text-white/50 font-black uppercase tracking-wider mt-1.5">En Línea</div>
                    </div>
                  </div>

                  {/* Card 2: Visitantes Anónimos */}
                  <div className="rounded-xl p-4 bg-white/5 border border-white/5 flex items-center gap-3 hover:bg-white/8 transition-all">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[#9B00CC] shadow-sm">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-white leading-none">{onlineStats.counts.visitors}</div>
                      <div className="text-[9px] text-white/50 font-black uppercase tracking-wider mt-1.5">Visitantes</div>
                    </div>
                  </div>

                  {/* Card 3: Turistas Logeados */}
                  <div className="rounded-xl p-4 bg-white/5 border border-white/5 flex items-center gap-3 hover:bg-white/8 transition-all">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[#FF0096] shadow-sm">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-white leading-none">{onlineStats.counts.tourist}</div>
                      <div className="text-[9px] text-white/50 font-black uppercase tracking-wider mt-1.5">Turistas</div>
                    </div>
                  </div>

                  {/* Card 4: Propietarios y Admins */}
                  <div className="rounded-xl p-4 bg-white/5 border border-white/5 flex items-center gap-3 hover:bg-white/8 transition-all">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500 shadow-sm">
                      <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-white leading-none">{onlineStats.counts.admin + onlineStats.counts.owner}</div>
                      <div className="text-[9px] text-white/50 font-black uppercase tracking-wider mt-1.5">Propietarios / Admins</div>
                    </div>
                  </div>
                </div>

                {/* Lista detallada de usuarios en línea */}
                <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                  <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Detalle de Sesiones Activas</h3>
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Actualización Automática</span>
                  </div>
                  <div className="overflow-x-auto max-h-60 custom-scrollbar">
                    {onlineStats.usersList.length === 0 ? (
                      <div className="p-8 text-center text-xs text-white/40 font-bold uppercase">
                        Ninguna sesión detectada en este momento
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-white/50 text-[10px] uppercase font-bold tracking-wider bg-black/10">
                            <th className="p-4">Usuario / Sesión</th>
                            <th className="p-4">Rol</th>
                            <th className="p-4">Página Visitada</th>
                            <th className="p-4 text-right">Activo Desde</th>
                          </tr>
                        </thead>
                        <tbody>
                          {onlineStats.usersList.map((u, i) => {
                            let badgeStyle = { bg: "bg-slate-500/10 text-slate-400 border-slate-500/20", label: "Visitante" };
                            if (u.user_id) {
                              if (u.role === "admin" || u.role === "superadmin") {
                                badgeStyle = { bg: "bg-purple-500/10 text-[#9B00CC] border-purple-500/20", label: "Administrador" };
                              } else if (u.role === "owner" || u.role === "business_owner") {
                                badgeStyle = { bg: "bg-cyan-500/10 text-[#00C8D4] border-cyan-500/20", label: "Propietario" };
                              } else if (u.role === "user") {
                                badgeStyle = { bg: "bg-pink-500/10 text-[#FF0096] border-pink-500/20", label: "Turista" };
                              } else if (u.role === "agent") {
                                badgeStyle = { bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "Agente" };
                              }
                            }

                            return (
                              <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors text-white font-semibold">
                                <td className="p-4">
                                  <div className="flex flex-col">
                                    <span className="text-xs text-white font-bold">{u.name}</span>
                                    {u.email && <span className="text-[10px] text-white/55 font-medium mt-0.5">{u.email}</span>}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${badgeStyle.bg}`}>
                                    {badgeStyle.label}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <code className="px-2 py-1 rounded bg-black/30 border border-white/5 text-[#00C8D4] text-[10px] font-mono break-all inline-block max-w-[250px] truncate" title={u.pathname || "/"}>
                                    {u.pathname || "/"}
                                  </code>
                                </td>
                                <td className="p-4 text-right text-[10px] text-white/50">
                                  {new Date(u.online_at).toLocaleTimeString("es-VE")}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* ─ Maintenance mode toggle ─ */}
            <div className="rounded-2xl overflow-hidden shadow-xs border border-white/10"
              style={{ background: maintenanceOn ? "linear-gradient(135deg, #1e1b4b, #311042)" : "linear-gradient(135deg, #FF0096, #9B00CC)" }}>
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/10"
                    style={{ background: "rgba(255,255,255,0.2)" }}>
                    {maintenanceOn ? (
                      <Wrench key="maintenance-wrench" className="w-5 h-5 text-white" />
                    ) : (
                      <Eye key="maintenance-eye" className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Modo Mantenimiento Global</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          color: "#ffffff",
                        }}>
                        {maintenanceOn ? "ACTIVO" : "DESACTIVADO"}
                      </span>
                    </div>
                    <p className="text-white/90 text-xs mt-0.5 font-medium">
                      {maintenanceOn
                        ? "El sitio está cerrado temporalmente — solo los administradores pueden visualizar la plataforma."
                        : "El sitio está abierto al público — todos los visitantes pueden navegar con normalidad."}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
                  <button
                    onClick={handleToggleMaintenance}
                    disabled={updatingMaintenance || (!maintenanceOn && !Object.values(checklist).some(Boolean))}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-102 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    style={{
                      background: maintenanceOn
                        ? "linear-gradient(90deg, #22c55e, #16a34a)"
                        : "linear-gradient(90deg, #FF0096, #9B00CC)",
                    }}
                  >
                    {updatingMaintenance ? (
                      <span key="maint-updating" className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Procesando...</span>
                    ) : maintenanceOn ? (
                      <span key="maint-open" className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Abrir Plataforma</span>
                    ) : (
                      <span key="maint-close" className="flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" /> Cerrar por Mantenimiento</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Checklist rendering if maintenance is off */}
              {!maintenanceOn && (
                <div className="px-5 pb-5 pt-3 border-t border-white/5 bg-black/10">
                  <h4 className="text-white/90 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5 text-brand-magenta" /> Checklist de Despliegue en Cloudflare / Activación Oficial
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-white/70 text-xs">
                    <label className="flex items-start gap-2.5 cursor-pointer hover:text-white select-none transition-colors">
                      <input 
                        type="checkbox" 
                        checked={checklist.backup} 
                        onChange={(e) => setChecklist(prev => ({ ...prev, backup: e.target.checked }))}
                        className="mt-0.5 rounded border-white/20 bg-white/5 text-[#FF0096] focus:ring-0" 
                      />
                      <div>
                        <span className="font-bold block text-white/90">Resguardo de Base de Datos (Backup)</span>
                        <span className="text-[10px] text-white/40 block mt-0.5">Respaldar la base de datos Supabase Postgres antes del corte.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer hover:text-white select-none transition-colors">
                      <input 
                        type="checkbox" 
                        checked={checklist.cloudflare} 
                        onChange={(e) => setChecklist(prev => ({ ...prev, cloudflare: e.target.checked }))}
                        className="mt-0.5 rounded border-white/20 bg-white/5 text-[#FF0096] focus:ring-0" 
                      />
                      <div>
                        <span className="font-bold block text-white/90">Redirección en DNS Cloudflare</span>
                        <span className="text-[10px] text-white/40 block mt-0.5">Configurar las reglas de página (Page Rules) en Cloudflare.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer hover:text-white select-none transition-colors">
                      <input 
                        type="checkbox" 
                        checked={checklist.notifications} 
                        onChange={(e) => setChecklist(prev => ({ ...prev, notifications: e.target.checked }))}
                        className="mt-0.5 rounded border-white/20 bg-white/5 text-[#FF0096] focus:ring-0" 
                      />
                      <div>
                        <span className="font-bold block text-white/90">Notificar a los Socios/Hoteleros</span>
                        <span className="text-[10px] text-white/40 block mt-0.5">Enviar correo preventivo informando la ventana de mantenimiento.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer hover:text-white select-none transition-colors">
                      <input 
                        type="checkbox" 
                        checked={checklist.logs} 
                        onChange={(e) => setChecklist(prev => ({ ...prev, logs: e.target.checked }))}
                        className="mt-0.5 rounded border-white/20 bg-white/5 text-[#FF0096] focus:ring-0" 
                      />
                      <div>
                        <span className="font-bold block text-white/90">Auditoría de Logs Andromeda</span>
                        <span className="text-[10px] text-white/40 block mt-0.5">Verificar transacciones pendientes de cobro y saldo de comisiones.</span>
                      </div>
                    </label>
                  </div>
                  {!Object.values(checklist).some(Boolean) && (
                    <div className="mt-3.5 text-[10px] text-amber-400 font-bold bg-amber-950/20 border border-amber-900/30 rounded-lg p-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Debe marcar al menos un requisito de la lista para poder activar la pantalla de mantenimiento.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Monthly growth + Status donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Area chart */}
              <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <h3 className="text-xs uppercase font-bold tracking-wider text-white/50 mb-5">Crecimiento Mensual</h3>
                {loading ? (
                  <div className="h-48 w-full bg-white/5 animate-pulse rounded-xl" />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorEsts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={C.fucsia} stopOpacity={0.2}/>
                          <stop offset="95%" stopColor={C.fucsia} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={C.teal} stopOpacity={0.2}/>
                          <stop offset="95%" stopColor={C.teal} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.6)" }} />
                      <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.6)" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10, fontWeight: "bold", color: "#ffffff" }} />
                      <Area type="monotone" name="Establecimientos" dataKey="Establecimientos" stroke={C.fucsia} fillOpacity={1} fill="url(#colorEsts)" strokeWidth={2} />
                      <Area type="monotone" name="Usuarios" dataKey="Usuarios" stroke={C.teal} fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Status donut */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <h3 className="text-xs uppercase font-bold tracking-wider text-white/50 mb-5">Estado de Establecimientos</h3>
                {loading ? (
                  <div className="h-40 w-40 rounded-full bg-white/5 animate-pulse mx-auto" />
                ) : (
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={byStatusData}
                        cx="50%" cy="50%"
                        innerRadius={45} outerRadius={60}
                        dataKey="value" nameKey="name"
                      >
                        {byStatusData.map((_, i) => (
                          <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="flex flex-col gap-2 mt-4">
                  {byStatusData.map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[i] }} />
                        <span className="text-white/60 font-semibold">{s.name}</span>
                      </div>
                      <span className="font-bold text-white">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* By category + By destination */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <h3 className="text-xs uppercase font-bold tracking-wider text-white/50 mb-5">Por Categoría</h3>
                {loading ? <div className="h-56 w-full bg-white/5 animate-pulse rounded-xl" /> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={byCategoryData} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.6)" }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.8)", fontWeight: "bold" }} width={80} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Establecimientos" radius={[0, 4, 4, 0]}>
                        {byCategoryData.map((_, i) => (
                          <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <h3 className="text-xs uppercase font-bold tracking-wider text-white/50 mb-5">Por Destino</h3>
                {loading ? <div className="h-56 w-full bg-white/5 animate-pulse rounded-xl" /> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={byDestinationData} margin={{ bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.8)", fontWeight: "bold" }} angle={-25} textAnchor="end" interval={0} />
                      <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.6)" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Establecimientos" radius={[4, 4, 0, 0]}>
                        {byDestinationData.map((_, i) => (
                          <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Role pie + activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <h3 className="text-xs uppercase font-bold tracking-wider text-white/50 mb-5">Usuarios por Rol</h3>
                {loading ? <div className="h-40 w-full bg-white/5 animate-pulse rounded-xl" /> : (
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={byRoleData} cx="50%" cy="50%" outerRadius={60}
                        dataKey="value" nameKey="name">
                        {byRoleData.map((_, i) => (
                          <Cell key={i} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="flex flex-col gap-1.5 mt-2">
                  {byRoleData.map((r, i) => (
                    <div key={r.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: ROLE_COLORS[i % ROLE_COLORS.length] }} />
                        <span className="text-white/60 font-semibold">{r.name}</span>
                      </div>
                      <span className="font-bold text-white">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity feed */}
              <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <h3 className="text-xs uppercase font-bold tracking-wider text-white/50 mb-5">Actividad Reciente</h3>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-12 w-full bg-white/5 animate-pulse rounded-xl" />)}
                  </div>
                ) : recentActivity.length === 0 ? (
                  <p className="text-xs text-white/40 text-center py-8 font-semibold">Sin actividad reciente registrada</p>
                ) : (
                  <div className="space-y-2.5">
                    {recentActivity.map((item) => {
                      const st = STATUS_ICON[item.status] ?? STATUS_ICON.pending;
                      const StatusI = st.icon;
                      return (
                        <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/20"
                            style={{ background: `${st.color}18` }}>
                            <StatusI className="w-4 h-4" style={{ color: st.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{item.name}</p>
                            <p className="text-[10px] text-white/50 font-semibold uppercase">{item.category}</p>
                          </div>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0"
                            style={{ background: `${st.color}18`, color: st.color }}>
                            {st.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─ Tab: Estadísticas ─ */}
        {activeTab === "estadisticas" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: "Total Establecimientos", value: counts.establishments, color: C.fucsia, icon: Building2 },
                { label: "Aprobados",             value: counts.approved,       color: C.green,  icon: CheckCircle },
                { label: "Pendientes",            value: counts.pending,        color: C.amber,  icon: Clock },
                { label: "Rechazados",            value: counts.rejected,       color: C.red,    icon: XCircle },
                { label: "Destacados",            value: counts.featured,       color: C.orange, icon: Star },
                { label: "Usuarios Registrados",  value: counts.users,          color: C.teal,   icon: Users },
                { label: "Categorías",            value: counts.categories,     color: C.purple, icon: Tag },
                { label: "Destinos Creados",      value: counts.destinations,   color: C.indigo, icon: MapPin },
              ].map((s) => (
                <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value ?? 0} color={s.color} loading={loading} />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <h3 className="text-xs uppercase font-bold tracking-wider text-white/50 mb-5">Por Categoría (Detalle)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={byCategoryData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.6)" }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.8)", fontWeight: "bold" }} width={90} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Establecimientos" radius={[0, 4, 4, 0]} fill={C.fucsia} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <h3 className="text-xs uppercase font-bold tracking-wider text-white/50 mb-5">Por Destino (Detalle)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={byDestinationData} margin={{ bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.8)", fontWeight: "bold" }} angle={-30} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.6)" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Establecimientos" radius={[4, 4, 0, 0]} fill={C.teal} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ─ Tab: Gestión Rápida ─ */}
        {activeTab === "gestion" && (
          <div className="animate-fade-in">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Accesos Directos a Módulos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {NAV_CARDS.map((card) => (
                <Link key={card.href} href={card.href}>
                  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 hover:bg-white/10 transition-all group cursor-pointer h-full">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 border border-white/10"
                      style={{ background: `${card.color}20` }}>
                      <card.icon className="w-6 h-6" style={{ color: card.color }} />
                    </div>
                    <div className="font-bold text-white text-sm mb-0.5">{card.label}</div>
                    <div className="text-xs text-white/50 font-semibold leading-relaxed">{card.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ─ Tab: Actividad ─ */}
        {activeTab === "actividad" && (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 max-w-2xl animate-fade-in text-white">
            <h2 className="text-xs uppercase font-bold tracking-wider text-white/50 mb-6">Últimos Registros del Sistema</h2>
            {loading ? (
              <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-14 w-full bg-white/5 animate-pulse rounded-xl" />)}</div>
            ) : recentActivity.length === 0 ? (
              <p className="text-xs text-white/40 text-center py-12 font-bold">Sin actividad registrada en la base de datos</p>
            ) : (
              <div className="space-y-2.5">
                {recentActivity.map((item) => {
                  const st = STATUS_ICON[item.status] ?? STATUS_ICON.pending;
                  const StatusI = st.icon;
                  return (
                    <Link key={item.id} href={`/establecimientos/${item.id}`}>
                      <div className="flex items-center gap-3 p-4 rounded-xl border border-white/5 hover:border-pink-500/30 hover:bg-white/5 transition-all cursor-pointer">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-white/10"
                          style={{ background: `${st.color}18` }}>
                          <StatusI className="w-4.5 h-4.5" style={{ color: st.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{item.name}</p>
                          <p className="text-[10px] text-white/40 font-semibold uppercase">{item.category}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                            style={{ background: `${st.color}18`, color: st.color }}>
                            {st.label}
                          </span>
                          <p className="text-[9px] font-bold text-white/40 mt-1.5">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString("es-VE") : ""}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
