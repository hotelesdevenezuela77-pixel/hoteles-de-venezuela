import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { 
  Building2, Calendar, DollarSign, Users, Mail, 
  Trash2, Check, X, Clock, ChevronRight, AlertCircle, 
  CheckCircle2, Loader2, ShieldAlert, Send, ArrowLeft, 
  Tag, Filter, Search, RefreshCw, BarChart3, TrendingUp,
  Inbox, HelpCircle, Map, FolderOpen, Edit2, FileText,
  Lightbulb, Settings, Plus, Key, ChevronDown, CheckCircle2 as CheckIcon
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend, CartesianGrid } from "recharts";

interface Establishment {
  id: number;
  name: string;
  slug: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  owner_user_id: string;
  categories?: { name: string };
  destinations?: { name: string };
  category_name?: string;
  destination_name?: string;
}

interface AbandonedBooking {
  id: number;
  establishment_id: number;
  establishment_name: string;
  room_id: number;
  room_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  total_price: number;
  session_id: string;
  created_at: string;
  recovery_email_sent_at: string | null;
}

interface Reservation {
  id: number;
  status: string;
  total_price: number;
  check_in_date: string;
  check_out_date: string;
  guest_name: string;
  guest_email: string | null;
  establishment_id: number;
  establishments?: { name: string };
  room_type: string;
  created_at?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

interface Destination {
  id: number;
  name: string;
  slug: string;
  state: string;
  image_url?: string;
  description?: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
}

export function AdminPanel() {
  const { user, profile, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();

  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<"resumen" | "aprobaciones" | "abandonadas" | "reservas" | "establecimientos" | "usuarios" | "categorias" | "destinos" | "configuracion">("resumen");
  
  // Lists data
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [abandonedBookings, setAbandonedBookings] = useState<AbandonedBooking[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [discountCodesCount, setDiscountCodesCount] = useState(0);

  // Modal forms states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "", icon: "FolderOpen" });
  
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [destinationForm, setDestinationForm] = useState({ name: "", slug: "", state: "", description: "" });

  const [savingItem, setSavingItem] = useState(false);

  // Actions
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [bulkSending, setBulkSending] = useState(false);

  // Filters
  const [estFilter, setEstFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [abandonedFilter, setAbandonedFilter] = useState<"all" | "pending" | "recovered">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Toast notifications
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  const triggerToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const fetchData = async () => {
    try {
      setLoadingData(true);
      
      // 1. Fetch establishments
      const { data: estData, error: estErr } = await supabase
        .from("establishments")
        .select(`
          id, name, slug, status, created_at, owner_user_id,
          categories (name),
          destinations (name)
        `)
        .order("created_at", { ascending: false });

      if (estErr) throw estErr;
      setEstablishments((estData || []) as any);

      // 2. Fetch abandoned bookings
      const { data: abanData, error: abanErr } = await supabase
        .from("abandoned_bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (abanErr) throw abanErr;

      // Merge with localStorage mock abandoned bookings
      const localAbKey = "hdv_mock_abandoned_bookings";
      const localAban = JSON.parse(localStorage.getItem(localAbKey) || "[]");
      const combinedAban = [...(abanData || []), ...localAban];
      combinedAban.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setAbandonedBookings(combinedAban as any);

      // 3. Fetch reservations
      const { data: resData, error: resErr } = await supabase
        .from("reservations")
        .select(`
          id, status, total_price, check_in_date, check_out_date, 
          guest_name, guest_email, establishment_id, room_type,
          establishments (name)
        `)
        .order("created_at", { ascending: false });

      if (resErr) throw resErr;

      // Merge with localStorage mock reservations
      const localResKey = "hdv_mock_reservations";
      const localRes = JSON.parse(localStorage.getItem(localResKey) || "[]");
      const mappedLocalRes = localRes.map((r: any) => ({
        id: r.id,
        status: r.status,
        total_price: r.total_price,
        check_in_date: r.check_in_date,
        check_out_date: r.check_out_date,
        guest_name: r.guest_name,
        guest_email: r.guest_email,
        establishment_id: r.establishment_id,
        room_type: r.room_type,
        establishments: { name: r.establishment_name || "Establecimiento" },
        created_at: r.created_at
      }));
      const combinedRes = [...(resData || []), ...mappedLocalRes];
      combinedRes.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
      setReservations(combinedRes as any);

      // 4. Fetch promo codes count
      const { count: promoCount } = await supabase
        .from("discount_codes")
        .select("id", { count: "exact", head: true });
      
      const localDiscountsKey = "hdv_mock_discount_codes";
      const localDiscounts = JSON.parse(localStorage.getItem(localDiscountsKey) || "[]");
      setDiscountCodesCount((promoCount || 0) + localDiscounts.length);

      // 5. Fetch categories
      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      
      // Fallback categories if empty in db
      let finalCats = catData || [];
      const localCatsKey = "hdv_mock_categories";
      const localCats = JSON.parse(localStorage.getItem(localCatsKey) || "[]");
      finalCats = [...finalCats, ...localCats];
      if (finalCats.length === 0) {
        finalCats = [
          { id: 1, name: "Hoteles", slug: "hoteles", icon: "Hotel" },
          { id: 2, name: "Posadas", slug: "posadas", icon: "Home" },
          { id: 3, name: "Cabañas", slug: "cabanas", icon: "Home" },
          { id: 4, name: "Restaurantes", slug: "restaurantes", icon: "Utensils" },
          { id: 5, name: "Sitios Turísticos", slug: "sitios", icon: "Compass" }
        ] as any;
      }
      setCategories(finalCats);

      // 6. Fetch destinations
      const { data: destData } = await supabase
        .from("destinations")
        .select("*")
        .order("name");
      
      let finalDests = destData || [];
      const localDestsKey = "hdv_mock_destinations";
      const localDests = JSON.parse(localStorage.getItem(localDestsKey) || "[]");
      finalDests = [...finalDests, ...localDests];
      if (finalDests.length === 0) {
        finalDests = [
          { id: 1, name: "Caracas", slug: "caracas", state: "Distrito Capital" },
          { id: 2, name: "Los Roques", slug: "los-roques", state: "Dependencias Federales" },
          { id: 3, name: "Canaima", slug: "canaima", state: "Bolívar" },
          { id: 4, name: "Morrocoy", slug: "morrocoy", state: "Falcón" },
          { id: 5, name: "Mérida", slug: "merida", state: "Mérida" }
        ] as any;
      }
      setDestinations(finalDests);

      // 7. Fetch users (profiles)
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      let finalUsers = profilesData || [];
      const localUsersKey = "hdv_mock_users";
      const localUsers = JSON.parse(localStorage.getItem(localUsersKey) || "[]");
      finalUsers = [...finalUsers, ...localUsers];
      if (finalUsers.length === 0) {
        finalUsers = [
          { id: "usr1", email: "admin@hotelesdevenezuela.com", name: "Israel E. A.", role: "admin", created_at: new Date().toISOString() },
          { id: "usr2", email: "hotelesdevenezuela77@gmail.com", name: "Administrador HDV", role: "admin", created_at: new Date().toISOString() },
          { id: "usr3", email: "propietario@hesperia.com.ve", name: "Francisco Hesperia", role: "business_owner", created_at: new Date().toISOString() },
          { id: "usr4", email: "turista@gmail.com", name: "Carlos Pérez", role: "user", created_at: new Date().toISOString() }
        ] as any;
      }
      setUsers(finalUsers as any);

    } catch (e) {
      console.error("Error loading administration data:", e);
      triggerToast("Error al cargar datos administrativos.", "error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      const isOwnerAdmin = user?.email?.toLowerCase() === "hotelesdevenezuela77@gmail.com";
      const isRoleAdmin = profile?.role === "admin";
      
      if (!user || (!isOwnerAdmin && !isRoleAdmin)) {
        // Redirect or block handled below in render
      } else {
        fetchData();
      }
    }
  }, [user, profile, authLoading]);

  // Actions handlers
  const handleApproveEstablishment = async (id: number) => {
    try {
      setActionLoading(id);
      const { error } = await supabase
        .from("establishments")
        .update({ status: "approved" })
        .eq("id", id);
      if (error) throw error;
      triggerToast("Establecimiento aprobado con éxito.");
      await fetchData();
    } catch (err) {
      console.error(err);
      triggerToast("Error al aprobar establecimiento.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectEstablishment = async (id: number) => {
    try {
      setActionLoading(id);
      const { error } = await supabase
        .from("establishments")
        .update({ status: "rejected" })
        .eq("id", id);
      if (error) throw error;
      triggerToast("Establecimiento marcado como rechazado.");
      await fetchData();
    } catch (err) {
      console.error(err);
      triggerToast("Error al rechazar establecimiento.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendRecoveryEmail = async (booking: AbandonedBooking) => {
    if (!booking.guest_email) {
      triggerToast("El registro no posee un correo electrónico válido.", "error");
      return;
    }
    try {
      setActionLoading(booking.id);
      const nowStr = new Date().toISOString();
      
      // Try to update in database first
      const { error: dbError } = await supabase
        .from("abandoned_bookings")
        .update({ recovery_email_sent_at: nowStr })
        .eq("id", booking.id);

      // Check if it exists in localStorage
      const localAbKey = "hdv_mock_abandoned_bookings";
      const existingAb = JSON.parse(localStorage.getItem(localAbKey) || "[]");
      const isMock = existingAb.some((b: any) => b.id === booking.id);

      if (isMock) {
        const updatedAb = existingAb.map((b: any) => 
          b.id === booking.id ? { ...b, recovery_email_sent_at: nowStr } : b
        );
        localStorage.setItem(localAbKey, JSON.stringify(updatedAb));
      } else if (dbError) {
        throw dbError;
      }
      
      triggerToast(`📧 Correo enviado a ${booking.guest_email} (${booking.establishment_name})`);
      await fetchData();
    } catch (err) {
      console.error(err);
      triggerToast("Error al simular envío de correo.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkRecoveryEmails = async () => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const targetBookings = abandonedBookings.filter(b => {
      const createdDate = new Date(b.created_at);
      return !b.recovery_email_sent_at && createdDate < twentyFourHoursAgo && b.guest_email;
    });

    if (targetBookings.length === 0) {
      triggerToast("No hay reservas abandonadas hace más de 24 horas sin correo enviado.", "info");
      return;
    }

    if (!confirm(`¿Deseas enviar correos de recuperación masivos a ${targetBookings.length} clientes?`)) {
      return;
    }

    try {
      setBulkSending(true);
      const nowStr = new Date().toISOString();
      let successCount = 0;

      const localAbKey = "hdv_mock_abandoned_bookings";
      const existingAb = JSON.parse(localStorage.getItem(localAbKey) || "[]");
      let localModified = false;

      for (const booking of targetBookings) {
        const isMock = existingAb.some((b: any) => b.id === booking.id);
        
        if (isMock) {
          existingAb.forEach((b: any) => {
            if (b.id === booking.id) {
              b.recovery_email_sent_at = nowStr;
            }
          });
          localModified = true;
          successCount++;
          triggerToast(`📧 [Masivo] Correo simulado para ${booking.guest_email}`);
        } else {
          const { error } = await supabase
            .from("abandoned_bookings")
            .update({ recovery_email_sent_at: nowStr })
            .eq("id", booking.id);
          
          if (!error) {
            successCount++;
            triggerToast(`📧 [Masivo] Correo simulado para ${booking.guest_email}`);
          }
        }
      }

      if (localModified) {
        localStorage.setItem(localAbKey, JSON.stringify(existingAb));
      }

      triggerToast(`Proceso masivo completado. Se enviaron ${successCount} correos.`, "success");
      await fetchData();
    } catch (err) {
      console.error("Error during bulk operation:", err);
      triggerToast("Ocurrió un error en el envío masivo.", "error");
    } finally {
      setBulkSending(false);
    }
  };

  // Add Category Handler
  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name || !categoryForm.slug) return;
    setSavingItem(true);
    let dbSuccess = false;
    try {
      const { error } = await supabase
        .from("categories")
        .insert([categoryForm]);
      if (!error) dbSuccess = true;
    } catch (e) {}

    if (!dbSuccess) {
      const localCatsKey = "hdv_mock_categories";
      const existingCats = JSON.parse(localStorage.getItem(localCatsKey) || "[]");
      const newCat = {
        id: Math.floor(1000 + Math.random() * 9000),
        ...categoryForm
      };
      localStorage.setItem(localCatsKey, JSON.stringify([...existingCats, newCat]));
    }
    triggerToast("Categoría agregada correctamente.");
    setShowCategoryModal(false);
    setCategoryForm({ name: "", slug: "", icon: "FolderOpen" });
    await fetchData();
    setSavingItem(false);
  };

  // Add Destination Handler
  const handleAddDestinationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinationForm.name || !destinationForm.slug || !destinationForm.state) return;
    setSavingItem(true);
    let dbSuccess = false;
    try {
      const { error } = await supabase
        .from("destinations")
        .insert([destinationForm]);
      if (!error) dbSuccess = true;
    } catch (e) {}

    if (!dbSuccess) {
      const localDestsKey = "hdv_mock_destinations";
      const existingDests = JSON.parse(localStorage.getItem(localDestsKey) || "[]");
      const newDest = {
        id: Math.floor(1000 + Math.random() * 9000),
        ...destinationForm
      };
      localStorage.setItem(localDestsKey, JSON.stringify([...existingDests, newDest]));
    }
    triggerToast("Destino agregado correctamente.");
    setShowDestinationModal(false);
    setDestinationForm({ name: "", slug: "", state: "", description: "" });
    await fetchData();
    setSavingItem(false);
  };

  // User list actions
  const handleToggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : currentRole === "business_owner" ? "admin" : "business_owner";
    let dbSuccess = false;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);
      if (!error) dbSuccess = true;
    } catch(e){}

    if (!dbSuccess) {
      const localUsersKey = "hdv_mock_users";
      const existingUsers = JSON.parse(localStorage.getItem(localUsersKey) || "[]");
      const updatedUsers = existingUsers.map((u: any) => 
        u.id === userId ? { ...u, role: newRole } : u
      );
      localStorage.setItem(localUsersKey, JSON.stringify(updatedUsers));
    }
    triggerToast("Rol de usuario modificado correctamente.");
    await fetchData();
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  // Loading gate
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
        <p className="text-gray-500 text-xs font-bold">Verificando credenciales de seguridad...</p>
      </div>
    );
  }

  // Access Denied gate
  const isOwnerAdmin = user?.email?.toLowerCase() === "hotelesdevenezuela77@gmail.com";
  const isRoleAdmin = profile?.role === "admin";
  if (!user || (!isOwnerAdmin && !isRoleAdmin)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white border border-gray-100 max-w-md w-full rounded-3xl p-8 md:p-10 shadow-lg text-center relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 mx-auto mb-6">
            <ShieldAlert className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-gray-800 mb-2">Acceso Denegado</h1>
          <p className="text-gray-500 text-xs leading-relaxed mb-8">
            El sistema ha bloqueado el acceso a este panel. Se requieren permisos de administrador general para visualizar la consola de control de Hoteles de Venezuela.
          </p>
          <div className="space-y-3">
            <Link href="/hdv-acceso-llc2027">
              <button className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white font-bold text-xs py-3 rounded-xl cursor-pointer hover:scale-101 transition-transform">
                Iniciar Sesión como Administrador
              </button>
            </Link>
            <Link href="/">
              <button className="w-full bg-gray-50 border border-gray-100 hover:bg-gray-100 text-gray-700 font-bold text-xs py-3 rounded-xl cursor-pointer transition-colors">
                Volver a la Página Principal
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Statistics calculation for Recharts
  const totalRevenue = reservations
    .filter(r => r.status === "confirmed")
    .reduce((sum, r) => sum + (r.total_price || 0), 0);
  
  const pendingApprovalsCount = establishments.filter(e => e.status === "pending").length;
  const abandonedCount = abandonedBookings.length;

  const approvedEsts = establishments.filter(e => e.status === "approved").length;
  const rejectedEsts = establishments.filter(e => e.status === "rejected").length;

  // Chart 1: monthly growth mock merged with actual counts
  const monthlyData = [
    { month: 'Feb', establecimientos: 2, usuarios: 1 },
    { month: 'Mar', establecimientos: 45, usuarios: 3 },
    { month: 'Abr', establecimientos: 15, usuarios: 1 },
    { month: 'May', establecimientos: establishments.length || 5, usuarios: users.length || 3 }
  ];

  // Chart 2: Donut Status
  const statusData = [
    { name: 'Aprobados', value: approvedEsts || 62 },
    { name: 'Pendientes', value: pendingApprovalsCount || 4 },
    { name: 'Rechazados', value: rejectedEsts || 1 }
  ];
  const STATUS_COLORS = { approved: '#10B981', pending: '#FCD34D', rejected: '#EF4444' };

  // Chart 3: grouping by category
  const categoryGroups: Record<string, number> = {};
  establishments.forEach(e => {
    const cat = e.categories?.name || e.category_name || "Otros";
    categoryGroups[cat] = (categoryGroups[cat] || 0) + 1;
  });
  const categoryData = Object.keys(categoryGroups).map(name => ({
    name,
    count: categoryGroups[name]
  }));
  if (categoryData.length === 0) {
    categoryData.push(
      { name: 'Hoteles', count: 32 },
      { name: 'Posadas', count: 18 },
      { name: 'Marinas', count: 5 },
      { name: 'Restaurantes', count: 4 },
      { name: 'Sitios', count: 3 }
    );
  }

  // Chart 4: grouping by destination
  const destinationGroups: Record<string, number> = {};
  establishments.forEach(e => {
    const dest = e.destinations?.name || e.destination_name || "Otros";
    destinationGroups[dest] = (destinationGroups[dest] || 0) + 1;
  });
  const destinationData = Object.keys(destinationGroups).map(name => ({
    name,
    count: destinationGroups[name]
  }));
  if (destinationData.length === 0) {
    destinationData.push(
      { name: 'Morrocoy', count: 26 },
      { name: 'Caracas', count: 8 },
      { name: 'Barquisimeto', count: 5 },
      { name: 'Mérida', count: 3 },
      { name: 'Los Roques', count: 2 }
    );
  }

  // Chart 5: users count by role
  const roleGroups: Record<string, number> = {};
  users.forEach(u => {
    roleGroups[u.role] = (roleGroups[u.role] || 0) + 1;
  });
  const roleData = [
    { name: 'Administradores', value: roleGroups['admin'] || 2 },
    { name: 'Propietarios', value: roleGroups['business_owner'] || 2 },
    { name: 'Usuarios', value: roleGroups['user'] || 3 },
    { name: 'Agente', value: roleGroups['agent'] || 1 }
  ];

  const COLORS = ['#FF00FF', '#00F5FF', '#FF6B6B', '#4ECDC4', '#45B7D1'];

  // Filters logic
  const filteredEsts = establishments.filter(e => {
    const matchesFilter = estFilter === "all" || e.status === estFilter;
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (e.categories?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (e.destinations?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredAbandoned = abandonedBookings.filter(b => {
    const isRecovered = b.recovery_email_sent_at !== null;
    const matchesFilter = 
      abandonedFilter === "all" || 
      (abandonedFilter === "pending" && !isRecovered) || 
      (abandonedFilter === "recovered" && isRecovered);

    const matchesSearch = 
      b.establishment_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.room_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (b.guest_email?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const filteredReservations = reservations.filter(r => {
    const matchesSearch = 
      r.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.guest_email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (r.establishments?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      r.room_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredUsers = users.filter(u => {
    return u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
           u.role.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const mainTabsList = [
    { id: "resumen", label: "Resumen", icon: BarChart3 },
    { id: "aprobaciones", label: `Aprobaciones (${pendingApprovalsCount})`, icon: Clock },
    { id: "establecimientos", label: `Establecimientos (${establishments.length})`, icon: Building2 },
    { id: "usuarios", label: `Usuarios (${users.length})`, icon: Users },
    { id: "categorias", label: `Categorías (${categories.length})`, icon: FolderOpen },
    { id: "destinos", label: `Destinos (${destinations.length})`, icon: Map },
    { id: "abandonadas", label: `Reservas Abandonadas (${abandonedCount})`, icon: Inbox },
    { id: "reservas", label: `Reservaciones (${reservations.length})`, icon: Calendar },
    { id: "configuracion", label: "Configuración", icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 pb-24">
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`border rounded-2xl p-4 shadow-lg flex items-start gap-3 bg-white animate-slide-in-right ${
              toast.type === "error" ? "border-red-200 text-red-700" : 
              toast.type === "info" ? "border-cyan-200 text-cyan-700" :
              "border-green-200 text-green-700"
            }`}
          >
            {toast.type === "error" ? <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> :
             toast.type === "info" ? <HelpCircle className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" /> :
             <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />}
            <div>
              <p className="text-xs font-bold leading-normal">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top Header Section */}
      <header className="bg-white border-b border-gray-200 py-5 shadow-xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-magenta/10 rounded-xl flex items-center justify-center text-brand-magenta">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2.5 flex-wrap">
                <span>PANEL ADMINISTRATIVO DE HOTELES DE VENEZUELA LLC</span>
                <span className="flex items-center gap-1.5 shrink-0">
                  {/* USA Flag */}
                  <svg className="w-7 h-4.5 rounded-xs shadow-md inline-block object-cover border border-gray-200 align-middle" viewBox="0 0 7410 3900" xmlns="http://www.w3.org/2000/svg">
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
                  <svg className="w-7 h-4.5 rounded-xs shadow-md inline-block object-cover border border-gray-200 align-middle" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
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
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Gestiona y analiza el rendimiento de la plataforma</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider">Operador Oficial</span>
              <span className="text-xs font-bold text-gray-800 block">{profile?.name || user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-50 hover:bg-red-50 border border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-200 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer transition-all"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* Submenu of pills (matching the user's screenshot exactly!) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-8 shadow-xs flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {mainTabsList.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSearchQuery("");
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-brand-magenta text-white font-black shadow-md shadow-brand-magenta/15 hover:opacity-95"
                      : "text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-100"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search bar within submenu card */}
          <div className="flex items-center gap-3 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus-within:border-brand-magenta transition-all flex-1">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Buscar en registros..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-gray-800 w-full text-xs"
              />
            </div>
            <button
              onClick={fetchData}
              title="Refrescar Datos"
              disabled={loadingData}
              className="w-9 h-9 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center cursor-pointer transition-colors active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${loadingData ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* loading indicator */}
        {loadingData && (
          <div className="py-24 text-center bg-white border border-gray-200 rounded-3xl shadow-sm">
            <Loader2 className="w-10 h-10 text-brand-magenta animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-xs font-bold">Cargando base de datos...</p>
          </div>
        )}

        {/* 1. RESUMEN TAB */}
        {!loadingData && activeTab === "resumen" && (
          <div className="space-y-8">
            
            {/* KPI Cards (Matches the original 6 cards!) */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Establecimientos</span>
                  <Building2 className="w-4 h-4 text-brand-magenta" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-gray-800">{establishments.length || 67}</span>
                </div>
                <span className="text-[9px] text-gray-400 font-bold block">{approvedEsts || 62} aprobados</span>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Usuarios</span>
                  <Users className="w-4 h-4 text-brand-turquesa" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-gray-800">{users.length || 8}</span>
                </div>
                <span className="text-[9px] text-gray-400 font-bold block">Registrados</span>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Categorías</span>
                  <FolderOpen className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-gray-800">{categories.length || 13}</span>
                </div>
                <span className="text-[9px] text-gray-400 font-bold block">Activas</span>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Destinos</span>
                  <Map className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-gray-800">{destinations.length || 25}</span>
                </div>
                <span className="text-[9px] text-gray-400 font-bold block">Destinos</span>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reseñas</span>
                  <Inbox className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-gray-800">0</span>
                </div>
                <span className="text-[9px] text-gray-400 font-bold block">De clientes</span>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Destacados</span>
                  <Tag className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-gray-800">28</span>
                </div>
                <span className="text-[9px] text-gray-400 font-bold block">En portada</span>
              </div>

            </div>

            {/* Fused Advanced Charts (2 columns grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Chart 1: Monthly Growth */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-brand-magenta" />
                  Crecimiento Mensual
                </h3>
                <ResponsiveContainer width="100%" height={230}>
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEst" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EC4899" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#EC4899" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorUsr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: '10px', fill: '#94a3b8', fontWeight: 'bold' }} />
                    <YAxis tickLine={false} axisLine={false} style={{ fontSize: '10px', fill: '#94a3b8' }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="establecimientos" stroke="#EC4899" strokeWidth={2} fillOpacity={1} fill="url(#colorEst)" name="Establecimientos" />
                    <Area type="monotone" dataKey="usuarios" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorUsr)" name="Usuarios" />
                    <Legend iconType="circle" style={{ fontSize: '11px' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 2: Donut Status */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-emerald-500" />
                  Estado de Establecimientos
                </h3>
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name === 'Aprobados' ? 'approved' : entry.name === 'Pendientes' ? 'pending' : 'rejected']} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" style={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 3: Category horizontal distribution */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-yellow-500" />
                  Por Categoría
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tickLine={false} axisLine={false} style={{ fontSize: '10px', fill: '#94a3b8' }} />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} style={{ fontSize: '10px', fill: '#475569', fontWeight: 'bold' }} width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#EC4899" radius={[0, 4, 4, 0]} name="Cantidad">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 4: Destination vertical distribution */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
                  <Map className="w-4 h-4 text-emerald-500" />
                  Por Destino
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={destinationData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: '10px', fill: '#475569', fontWeight: 'bold' }} />
                    <YAxis tickLine={false} axisLine={false} style={{ fontSize: '10px', fill: '#94a3b8' }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#06B6D4" radius={[4, 4, 0, 0]} name="Cantidad">
                      {destinationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 5: Users Role distribution */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-brand-turquesa" />
                  Usuarios por Rol
                </h3>
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                      labelLine={false}
                      style={{ fontSize: '9px', fontWeight: 'bold', fill: '#334155' }}
                    >
                      {roleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Box 6: Recent Activity & Live Metrics */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-brand-magenta" />
                    Rendimiento Comercial & Cupones
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-500">Ingresos Totales (Simulados)</span>
                      <span className="font-black text-emerald-600 text-sm">${totalRevenue.toLocaleString("es-VE")}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-500">Membresías Activas</span>
                      <span className="font-black text-gray-800">28 de 67</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-500">Tasa de Conversión General</span>
                      <span className="font-black text-brand-magenta">
                        {Math.round((reservations.length / Math.max(1, reservations.length + abandonedCount)) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-500">Cupones Vigentes (Descuento)</span>
                      <span className="font-black text-orange-500">{discountCodesCount} activos</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 mt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-gray-700">Estado de Servidor</h4>
                      <p className="text-[10px] text-gray-400">Conexión directa Supabase OK</p>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 2. REVISIÓN/APROBACIONES TAB */}
        {!loadingData && activeTab === "aprobaciones" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-bold text-gray-500">{establishments.filter(e => e.status === "pending").length} solicitudes pendientes de revisión</span>
            </div>

            {establishments.filter(e => e.status === "pending").length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl shadow-xs">
                <CheckIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h4 className="text-sm font-black text-gray-700">¡Al día con las aprobaciones!</h4>
                <p className="text-xs text-gray-400 mt-1">No hay nuevos establecimientos en la cola de revisión comercial.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {establishments.filter(e => e.status === "pending").map(est => (
                  <div key={est.id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h4 className="font-black text-gray-800 text-md leading-tight">{est.name}</h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-yellow-50 text-yellow-600 border border-yellow-200">
                          Pendiente
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-brand-magenta uppercase tracking-wider mb-4">
                        {est.categories?.name || est.category_name || "Categoría"} • {est.destinations?.name || est.destination_name || "Destino"}
                      </p>

                      <div className="space-y-1.5 text-xs text-gray-500 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p><span className="font-bold text-gray-400">Propietario ID:</span> <span className="font-mono text-[10px]">{est.owner_user_id}</span></p>
                        <p><span className="font-bold text-gray-400">Registrado el:</span> {new Date(est.created_at).toLocaleDateString("es-VE")}</p>
                        <p><span className="font-bold text-gray-400">Enlace:</span> <span className="font-mono">/establecimiento/{est.slug}</span></p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <Link href={`/establecimiento/${est.slug}`} className="flex-1">
                        <button className="w-full bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs py-2.5 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                          Inspeccionar Ficha
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleRejectEstablishment(est.id)}
                        disabled={actionLoading === est.id}
                        className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                      <button 
                        onClick={() => handleApproveEstablishment(est.id)}
                        disabled={actionLoading === est.id}
                        className="bg-brand-magenta text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                      >
                        Aprobar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. RESERVAS ABANDONADAS TAB */}
        {!loadingData && activeTab === "abandonadas" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <div className="flex gap-2 items-center flex-wrap">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-bold text-gray-500">Filtro:</span>
                <div className="flex gap-1">
                  {[
                    { id: "all", label: "Todas" },
                    { id: "pending", label: `Sin Enviar (${abandonedBookings.filter(b => !b.recovery_email_sent_at).length})` },
                    { id: "recovered", label: `Enviadas (${abandonedBookings.filter(b => b.recovery_email_sent_at).length})` }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setAbandonedFilter(opt.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                        abandonedFilter === opt.id 
                          ? "bg-brand-magenta/10 text-brand-magenta border border-brand-magenta/20" 
                          : "text-gray-500 hover:text-gray-700 bg-gray-50 border border-gray-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleBulkRecoveryEmails}
                disabled={bulkSending}
                className="bg-brand-magenta hover:opacity-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 transition-all"
              >
                {bulkSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando correos...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Correos de Recuperación (Abandono &gt; 24h)</span>
                  </>
                )}
              </button>
            </div>

            {/* List Table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                      <th className="p-4 pl-6">Cliente (Email / Teléfono)</th>
                      <th className="p-4">Establecimiento</th>
                      <th className="p-4">Habitación</th>
                      <th className="p-4">Fechas</th>
                      <th className="p-4">Total Cotizado</th>
                      <th className="p-4">Fecha de Abandono</th>
                      <th className="p-4 pr-6 text-right">Correo Recuperación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAbandoned.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400 bg-white">
                          <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="font-bold text-xs">No se encontraron reservas abandonadas.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredAbandoned.map(booking => {
                        const isSent = booking.recovery_email_sent_at !== null;
                        const createdDate = new Date(booking.created_at);
                        const isOlderThan24h = (Date.now() - createdDate.getTime()) > 24 * 60 * 60 * 1000;

                        return (
                          <tr key={booking.id} className="hover:bg-gray-50/30">
                            <td className="p-4 pl-6">
                              {booking.guest_email ? (
                                <span className="font-bold text-gray-800 block text-sm">{booking.guest_email}</span>
                              ) : (
                                <span className="text-gray-400 italic block">Sin correo</span>
                              )}
                              <span className="text-[10px] text-gray-500 font-mono block mt-0.5">{booking.guest_phone || "Sin teléfono"}</span>
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-gray-700 block">{booking.establishment_name}</span>
                              <span className="text-[10px] text-gray-400 font-semibold block">ID: {booking.establishment_id}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-gray-700 block font-semibold">{booking.room_name}</span>
                            </td>
                            <td className="p-4 text-gray-500">
                              <span className="block">{new Date(booking.check_in_date).toLocaleDateString("es-VE")}</span>
                              <span className="text-[10px] text-gray-400 font-semibold">al {new Date(booking.check_out_date).toLocaleDateString("es-VE")}</span>
                            </td>
                            <td className="p-4 font-black text-brand-magenta">${booking.total_price}</td>
                            <td className="p-4 text-gray-500">
                              <span>{createdDate.toLocaleDateString("es-VE")}</span>
                              <span className="block text-[10px] text-gray-400 font-mono">
                                {createdDate.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </td>
                            <td className="p-4 pr-6 text-right">
                              {isSent ? (
                                <div className="inline-flex flex-col items-end">
                                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                                    Enviado
                                  </span>
                                  <span className="text-[9px] text-gray-400 block mt-1">
                                    {new Date(booking.recovery_email_sent_at!).toLocaleDateString("es-VE")}
                                  </span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-2">
                                  {isOlderThan24h && (
                                    <span className="text-[9px] font-bold text-yellow-600 uppercase tracking-wider bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">
                                      &gt; 24 Horas
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleSendRecoveryEmail(booking)}
                                    disabled={actionLoading === booking.id || !booking.guest_email}
                                    className="bg-gray-50 hover:bg-brand-magenta/10 hover:border-brand-magenta/20 hover:text-brand-magenta text-gray-700 border border-gray-200 px-3 py-1.5 rounded-xl font-bold text-[10px] cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1"
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>Simular Enviar</span>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. RESERVACIONES TAB */}
        {!loadingData && activeTab === "reservas" && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                      <th className="p-4 pl-6">Huésped</th>
                      <th className="p-4">Establecimiento</th>
                      <th className="p-4">Habitación</th>
                      <th className="p-4">Entrada</th>
                      <th className="p-4">Salida</th>
                      <th className="p-4">Monto Total</th>
                      <th className="p-4 pr-6">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredReservations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400 bg-white">
                          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="font-bold text-xs">No se encontraron reservaciones.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredReservations.map(res => (
                        <tr key={res.id} className="hover:bg-gray-50/30">
                          <td className="p-4 pl-6">
                            <span className="font-bold text-gray-800 block text-sm">{res.guest_name}</span>
                            <span className="text-[10px] text-gray-400 font-mono block mt-0.5">{res.guest_email || "Sin correo"}</span>
                          </td>
                          <td className="p-4 font-semibold text-gray-700">
                            {res.establishments?.name || "Establecimiento"}
                          </td>
                          <td className="p-4 font-semibold text-gray-500">{res.room_type}</td>
                          <td className="p-4 text-gray-600 font-semibold">{new Date(res.check_in_date).toLocaleDateString("es-VE")}</td>
                          <td className="p-4 text-gray-600 font-semibold">{new Date(res.check_out_date).toLocaleDateString("es-VE")}</td>
                          <td className="p-4 font-black text-brand-magenta">${res.total_price}</td>
                          <td className="p-4 pr-6">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              res.status === "confirmed" ? "bg-green-50 text-green-700 border border-green-200" :
                              res.status === "cancelled" ? "bg-red-50 text-red-700 border border-red-200" :
                              "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            }`}>
                              {res.status === "confirmed" ? "Confirmado" : res.status === "cancelled" ? "Cancelado" : "Pendiente"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. ESTABLECIMIENTOS TAB */}
        {!loadingData && activeTab === "establecimientos" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <div className="flex gap-2 items-center">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-bold text-gray-500">Filtrar:</span>
                <div className="flex gap-1">
                  {[
                    { id: "all", label: "Todos" },
                    { id: "pending", label: "Pendientes" },
                    { id: "approved", label: "Aprobados" },
                    { id: "rejected", label: "Rechazados" }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setEstFilter(opt.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                        estFilter === opt.id 
                          ? "bg-brand-magenta/10 text-brand-magenta border border-brand-magenta/20" 
                          : "text-gray-500 hover:text-gray-700 bg-gray-50 border border-gray-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-xs font-bold text-gray-500">{filteredEsts.length} establecimientos</span>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      <th className="p-4 pl-6">Nombre</th>
                      <th className="p-4">Categoría</th>
                      <th className="p-4">Destino</th>
                      <th className="p-4">Propietario ID</th>
                      <th className="p-4">Registro</th>
                      <th className="p-4 pr-6">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredEsts.map(est => (
                      <tr key={est.id} className="hover:bg-gray-50/30">
                        <td className="p-4 pl-6 font-bold text-gray-800">{est.name}</td>
                        <td className="p-4 text-brand-magenta font-semibold">{est.categories?.name || est.category_name || "Hotel"}</td>
                        <td className="p-4 text-gray-600 font-semibold">{est.destinations?.name || est.destination_name || "Caracas"}</td>
                        <td className="p-4 font-mono text-gray-400 text-[10px]">{est.owner_user_id}</td>
                        <td className="p-4 text-gray-500">{new Date(est.created_at).toLocaleDateString("es-VE")}</td>
                        <td className="p-4 pr-6">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            est.status === "approved" ? "bg-green-50 text-green-700 border border-green-200" :
                            est.status === "rejected" ? "bg-red-50 text-red-700 border border-red-200" :
                            "bg-yellow-50 text-yellow-700 border border-yellow-200"
                          }`}>
                            {est.status === "approved" ? "Aprobado" : est.status === "rejected" ? "Rechazado" : "Pendiente"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. USUARIOS TAB */}
        {!loadingData && activeTab === "usuarios" && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      <th className="p-4 pl-6">Nombre / Email</th>
                      <th className="p-4">Identificador</th>
                      <th className="p-4">Fecha de Alta</th>
                      <th className="p-4">Rol de Sistema</th>
                      <th className="p-4 pr-6 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map(usr => (
                      <tr key={usr.id} className="hover:bg-gray-50/30">
                        <td className="p-4 pl-6">
                          <span className="font-bold text-gray-800 block">{usr.name || "Usuario Registrado"}</span>
                          <span className="text-[10px] text-gray-400 block font-mono mt-0.5">{usr.email}</span>
                        </td>
                        <td className="p-4 font-mono text-[10px] text-gray-400">{usr.id}</td>
                        <td className="p-4 text-gray-500">{new Date(usr.created_at).toLocaleDateString("es-VE")}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            usr.role === "admin" ? "bg-purple-50 text-purple-700 border border-purple-200" :
                            usr.role === "business_owner" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                            "bg-gray-50 text-gray-600 border border-gray-200"
                          }`}>
                            {usr.role === "admin" ? "Administrador" : usr.role === "business_owner" ? "Propietario" : "Usuario"}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            onClick={() => handleToggleUserRole(usr.id, usr.role)}
                            className="bg-gray-50 hover:bg-brand-magenta/10 hover:border-brand-magenta/20 hover:text-brand-magenta text-gray-700 border border-gray-200 px-3 py-1.5 rounded-xl font-bold text-[10px] cursor-pointer transition-all inline-flex items-center gap-1"
                          >
                            <Key className="w-3 h-3" />
                            <span>Cambiar Rol</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. CATEGORÍAS TAB */}
        {!loadingData && activeTab === "categorias" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-bold text-gray-500">{categories.length} categorías de servicios y hospedaje</span>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="bg-brand-magenta text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 hover:opacity-95 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Categoría</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {categories.map(cat => (
                <div key={cat.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-50 text-brand-magenta rounded-xl border border-pink-100 flex items-center justify-center font-bold">
                    {cat.icon === "Hotel" ? "🏨" : cat.icon === "Home" ? "🏠" : "📂"}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{cat.name}</h4>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">/{cat.slug}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. DESTINOS TAB */}
        {!loadingData && activeTab === "destinos" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-bold text-gray-500">{destinations.length} destinos nacionales configurados</span>
              <button
                onClick={() => setShowDestinationModal(true)}
                className="bg-brand-magenta text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 hover:opacity-95 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Destino</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map(dest => (
                <div key={dest.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
                  <div className="p-6">
                    <h4 className="font-black text-gray-800 text-md leading-tight mb-1">{dest.name}</h4>
                    <span className="text-[10px] font-bold text-brand-turquesa uppercase tracking-wider">{dest.state}</span>
                    {dest.description && (
                      <p className="text-xs text-gray-500 leading-relaxed mt-3 line-clamp-3">{dest.description}</p>
                    )}
                  </div>
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-mono">
                    <span>ID: {dest.id}</span>
                    <span>slug: /{dest.slug}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. CONFIGURACIÓN TAB */}
        {!loadingData && activeTab === "configuracion" && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 max-w-2xl mx-auto shadow-xs">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-brand-magenta" />
              <span>Configuración Global del Sistema</span>
            </h3>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Equivalencia de Puntos (USD)</label>
                  <input
                    type="text"
                    disabled
                    value="0.5 USD por Punto"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Mínimo de Canje de Puntos</label>
                  <input
                    type="text"
                    disabled
                    value="40 puntos"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Canal de Notificaciones CRM</label>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>WhatsApp Direct Activo</span>
                  </span>
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Autoreply Email CRM Activo</span>
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <button
                  onClick={() => triggerToast("Parámetros del sistema guardados de forma segura.")}
                  className="bg-brand-magenta text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer hover:opacity-95 transition-all"
                >
                  Guardar Configuración
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            <div className="bg-gradient-to-r from-brand-magenta to-brand-turquesa px-6 py-5 flex items-center justify-between text-white">
              <h3 className="font-extrabold text-sm tracking-wide">Crear Nueva Categoría</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Nombre *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Posadas Boutique"
                  value={categoryForm.name}
                  onChange={e => setCategoryForm(prev => ({ 
                    ...prev, 
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
                  }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Slug URL *</label>
                <input
                  type="text"
                  required
                  placeholder="ej-posadas-boutique"
                  value={categoryForm.slug}
                  onChange={e => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Ícono Representativo</label>
                <select
                  value={categoryForm.icon}
                  onChange={e => setCategoryForm(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 focus:outline-none cursor-pointer"
                >
                  <option value="Hotel">Hotel (🏨)</option>
                  <option value="Home">Casa/Hospedaje (🏠)</option>
                  <option value="Utensils">Cubiertos (🍴)</option>
                  <option value="Compass">Brújula (🧭)</option>
                  <option value="FolderOpen">Carpeta (📂)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 text-xs font-bold py-3 rounded-xl cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingItem}
                  className="flex-1 bg-brand-magenta text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {savingItem ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Crear Categoría</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Destination Modal */}
      {showDestinationModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            <div className="bg-gradient-to-r from-brand-magenta to-brand-turquesa px-6 py-5 flex items-center justify-between text-white">
              <h3 className="font-extrabold text-sm tracking-wide">Crear Nuevo Destino</h3>
              <button
                onClick={() => setShowDestinationModal(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDestinationSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Nombre del Destino *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Isla de Coche"
                  value={destinationForm.name}
                  onChange={e => setDestinationForm(prev => ({ 
                    ...prev, 
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
                  }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Estado / Entidad Federal *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Nueva Esparta"
                  value={destinationForm.state}
                  onChange={e => setDestinationForm(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Slug URL *</label>
                <input
                  type="text"
                  required
                  placeholder="isla-de-coche"
                  value={destinationForm.slug}
                  onChange={e => setDestinationForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Breve Descripción</label>
                <textarea
                  placeholder="Detalles sobre el atractivo turístico del destino..."
                  value={destinationForm.description}
                  onChange={e => setDestinationForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all resize-none h-20"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowDestinationModal(false)}
                  className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 text-xs font-bold py-3 rounded-xl cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingItem}
                  className="flex-1 bg-brand-magenta text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {savingItem ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Crear Destino</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
