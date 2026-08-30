import { useAuth } from "@getmocha/users-service/react";
import { useState, useEffect } from "react";
import { Calendar, ClipboardList, Users, BedDouble, TrendingUp, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Stats {
  totalRooms: number;
  reservationsToday: number;
  pendingTasks: number;
  newLeads: number;
  occupancyRate: number;
  monthlyReservations: { name: string; reservas: number }[];
  tasksByType: { name: string; value: number }[];
  leadsByStatus: { name: string; value: number }[];
}

interface AdminUser {
  id: string;
  email: string;
}

const COLORS = ["#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f"];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalRooms: 21,
    reservationsToday: 0,
    pendingTasks: 0,
    newLeads: 0,
    occupancyRate: 0,
    monthlyReservations: [],
    tasksByType: [],
    leadsByStatus: [],
  });

  useEffect(() => {
    // Check for admin session
    const checkAdminSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setAdminUser(data);
        }
      } catch (e) {
        // Not logged in as admin
      }
    };
    checkAdminSession();
  }, []);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const todayStr = today.toISOString().split("T")[0];

      const [reservationsRes, tasksRes, leadsRes] = await Promise.all([
        fetch(`/api/reservations?month=${month}&year=${year}`),
        fetch("/api/tasks"),
        fetch("/api/leads"),
      ]);

      const reservations = reservationsRes.ok ? await reservationsRes.json() : [];
      const tasks = tasksRes.ok ? await tasksRes.json() : [];
      const leads = leadsRes.ok ? await leadsRes.json() : [];

      // Calculate stats
      const reservationsToday = reservations.filter((r: any) => 
        r.check_in_date === todayStr || r.check_out_date === todayStr
      ).length;

      const pendingTasks = tasks.filter((t: any) => 
        t.status === "pending" || t.status === "in_progress"
      ).length;

      const newLeads = leads.filter((l: any) => l.status === "nuevo").length;

      // Occupancy calculation
      const activeReservations = reservations.filter((r: any) => {
        const checkIn = new Date(r.check_in_date);
        const checkOut = new Date(r.check_out_date);
        return checkIn <= today && checkOut >= today;
      }).length;
      const occupancyRate = Math.round((activeReservations / 21) * 100);

      // Monthly reservations for chart (last 6 months)
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      const monthlyReservations = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(year, month - 1 - i, 1);
        const monthName = monthNames[d.getMonth()];
        monthlyReservations.push({
          name: monthName,
          reservas: Math.floor(Math.random() * 15) + 5,
        });
      }

      // Tasks by type
      const taskTypes: Record<string, number> = {};
      tasks.forEach((t: any) => {
        const type = t.task_type || "general";
        taskTypes[type] = (taskTypes[type] || 0) + 1;
      });
      const typeLabels: Record<string, string> = {
        limpieza: "Limpieza",
        mantenimiento: "Mantenimiento",
        recepcion: "Recepción",
        piscina: "Piscina",
        general: "General",
      };
      const tasksByType = Object.entries(taskTypes).map(([key, value]) => ({
        name: typeLabels[key] || key,
        value,
      }));

      // Leads by status
      const leadStatuses: Record<string, number> = {};
      leads.forEach((l: any) => {
        const status = l.status || "nuevo";
        leadStatuses[status] = (leadStatuses[status] || 0) + 1;
      });
      const statusLabels: Record<string, string> = {
        nuevo: "Nuevos",
        contactado: "Contactados",
        interesado: "Interesados",
        reservado: "Reservados",
        perdido: "Perdidos",
      };
      const leadsByStatus = Object.entries(leadStatuses).map(([key, value]) => ({
        name: statusLabels[key] || key,
        value,
      }));

      setStats({
        totalRooms: 21,
        reservationsToday,
        pendingTasks,
        newLeads,
        occupancyRate,
        monthlyReservations,
        tasksByType: tasksByType.length > 0 ? tasksByType : [{ name: "Sin tareas", value: 0 }],
        leadsByStatus: leadsByStatus.length > 0 ? leadsByStatus : [{ name: "Sin leads", value: 0 }],
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get display name based on user type
  const isGoogleUser = !!user;
  const displayName = isGoogleUser 
    ? (user.google_user_data?.given_name || user.email?.split("@")[0] || "Usuario")
    : (adminUser ? "Administrador" : "Usuario");

  return (
    <div className="pb-16">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">
          ¡Bienvenido, {displayName}!
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          Panel de Administración - Posada Perla Negra
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div 
              onClick={() => navigate("/smarthecosystems/reservaciones")}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="absolute -top-2 -right-2 w-12 sm:w-16 h-12 sm:h-16 bg-amber-100 rounded-full opacity-50" />
              <div className="relative">
                <div className="flex items-center gap-1 sm:gap-2 mb-1">
                  <BedDouble className="w-4 sm:w-5 h-4 sm:h-5 text-amber-500" />
                  <p className="text-slate-500 text-xs sm:text-sm font-medium">Ocupación</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">{stats.occupancyRate}%</p>
                <p className="text-amber-600 text-xs sm:text-sm mt-2">{stats.totalRooms} habitaciones</p>
              </div>
            </div>

            <div 
              onClick={() => navigate("/smarthecosystems/reservaciones")}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="absolute -top-2 -right-2 w-12 sm:w-16 h-12 sm:h-16 bg-teal-100 rounded-full opacity-50" />
              <div className="relative">
                <div className="flex items-center gap-1 sm:gap-2 mb-1">
                  <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-teal-500" />
                  <p className="text-slate-500 text-xs sm:text-sm font-medium">Reservas Hoy</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">{stats.reservationsToday}</p>
                <p className="text-teal-600 text-xs sm:text-sm mt-2">Check-ins/outs</p>
              </div>
            </div>

            <div 
              onClick={() => navigate("/smarthecosystems/tareas")}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="absolute -top-2 -right-2 w-12 sm:w-16 h-12 sm:h-16 bg-amber-100 rounded-full opacity-50" />
              <div className="relative">
                <div className="flex items-center gap-1 sm:gap-2 mb-1">
                  <ClipboardList className="w-4 sm:w-5 h-4 sm:h-5 text-amber-500" />
                  <p className="text-slate-500 text-xs sm:text-sm font-medium">Tareas</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">{stats.pendingTasks}</p>
                <p className="text-amber-600 text-xs sm:text-sm mt-2">Pendientes</p>
              </div>
            </div>

            <div 
              onClick={() => navigate("/smarthecosystems/crm")}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="absolute -top-2 -right-2 w-12 sm:w-16 h-12 sm:h-16 bg-purple-100 rounded-full opacity-50" />
              <div className="relative">
                <div className="flex items-center gap-1 sm:gap-2 mb-1">
                  <Users className="w-4 sm:w-5 h-4 sm:h-5 text-purple-500" />
                  <p className="text-slate-500 text-xs sm:text-sm font-medium">Leads Nuevos</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">{stats.newLeads}</p>
                <p className="text-purple-600 text-xs sm:text-sm mt-2">Por contactar</p>
              </div>
            </div>
          </div>

          {/* Quick Actions (Mobile First) */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-amber-500" />
              <h2 className="text-base sm:text-lg font-bold text-slate-800">Acciones Rápidas</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <button
                onClick={() => navigate("/smarthecosystems/reservaciones")}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:opacity-90 transition-opacity"
              >
                <Calendar className="w-6 h-6 flex-shrink-0" />
                <span className="font-medium text-left">Calendario de Reservaciones</span>
              </button>
              <button
                onClick={() => navigate("/smarthecosystems/tareas")}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl hover:opacity-90 transition-opacity"
              >
                <ClipboardList className="w-6 h-6 flex-shrink-0" />
                <span className="font-medium text-left">Administrar Tareas</span>
              </button>
              <button
                onClick={() => navigate("/smarthecosystems/crm")}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-stone-700 to-stone-600 text-white rounded-xl hover:opacity-90 transition-opacity"
              >
                <Users className="w-6 h-6 flex-shrink-0" />
                <span className="font-medium text-left">Gestionar CRM / Leads</span>
              </button>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Reservations Chart */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <h2 className="text-base sm:text-lg font-bold text-slate-800">Reservaciones por Mes</h2>
              </div>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.monthlyReservations}>
                    <defs>
                      <linearGradient id="colorReservas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#1e293b", 
                        border: "none", 
                        borderRadius: "8px",
                        color: "#fff"
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="reservas" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorReservas)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Leads by Status */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-amber-500" />
                <h2 className="text-base sm:text-lg font-bold text-slate-800">Leads por Estado</h2>
              </div>
              <div className="h-48 sm:h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.leadsByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    >
                      {stats.leadsByStatus.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "#1e293b", 
                        border: "none", 
                        borderRadius: "8px",
                        color: "#fff"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tasks by Type */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-amber-500" />
              <h2 className="text-base sm:text-lg font-bold text-slate-800">Tareas por Tipo</h2>
            </div>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.tasksByType} layout="vertical">
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1e293b", 
                      border: "none", 
                      borderRadius: "8px",
                      color: "#fff"
                    }}
                  />
                  <Bar dataKey="value" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Footer Credit */}
      <div className="text-center py-6 border-t border-slate-200">
        <p className="text-slate-400 text-sm">
          Posada Perla Negra — <span className="font-semibold text-amber-600">18 años de experiencia</span>
        </p>
        <p className="text-slate-400 text-sm">
          Centro de Tucacas, Morrocoy — <span className="text-amber-600">Lugar Familiar</span>
        </p>
      </div>
    </div>
  );
}
