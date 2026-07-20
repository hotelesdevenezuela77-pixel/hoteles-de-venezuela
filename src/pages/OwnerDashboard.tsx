import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { 
  Building2, Clock, CheckCircle, XCircle, Plus, 
  MapPin, Loader2, MessageSquare, BarChart3, Calendar, 
  DollarSign, Users, Trash2, X, Phone, Globe, Briefcase, 
  Eye, Check, ListFilter, Tag, Sparkles
} from "lucide-react";
import { ScriptGenerator } from "../components/ScriptGenerator";
import { AmenitiesSelector } from "@/components/admin/AmenitiesSelector";

interface Establishment {
  id: number;
  name: string;
  slug: string;
  status: "pending" | "approved" | "rejected";
  category_name?: string;
  category_id?: number;
  destination_name?: string;
  destination_id?: number;
  rating_avg: number;
  review_count: number;
  created_at: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  description?: string;
  price_level?: string;
  services?: string;
  membership_tier?: string;
  is_circuito_excelencia?: boolean;
}

interface Reservation {
  id: number;
  establishment_name: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  status: string;
  total_price: number;
}

interface WhatsAppLead {
  id: number;
  establishment_name: string;
  visitor_name: string;
  visitor_phone: string;
  message: string;
  created_at: string;
}

export function OwnerDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [leads, setLeads] = useState<WhatsAppLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"resumen" | "establecimientos" | "reservas" | "leads" | "descuentos" | "guiones">("resumen");

  const [discountCodes, setDiscountCodes] = useState<any[]>([]);
  const [showAddDiscountModal, setShowAddDiscountModal] = useState(false);
  const [savingDiscount, setSavingDiscount] = useState(false);
  const [discountFormData, setDiscountFormData] = useState({
    establishment_id: "",
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    min_nights: "1",
    max_uses: "",
    start_date: "",
    end_date: "",
    is_active: true
  });

  // Filter dropdown state
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [destinations, setDestinations] = useState<{ id: number; name: string; state: string }[]>([]);

  // Add Establishment Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    whatsapp: "",
    website: "",
    price_level: "$$",
    category_id: "",
    destination_id: "",
    services: [] as string[]
  });

  const availableServices = [
    { key: "wifi", label: "WiFi Gratis" },
    { key: "estacionamiento", label: "Estacionamiento" },
    { key: "piscina", label: "Piscina" },
    { key: "restaurante", label: "Restaurante" },
    { key: "jardin", label: "Jardín / Áreas Verdes" },
    { key: "gimnasio", label: "Gimnasio" },
    { key: "spa", label: "Spa / Bienestar" }
  ];

  // Stats
  const [stats, setStats] = useState({
    views: 0,
    clicks: 0,
    reservationsCount: 0
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  // Fetch filter options (categories, destinations)
  useEffect(() => {
    async function fetchFormOptions() {
      try {
        const [catsRes, destsRes] = await Promise.all([
          supabase.from("categories").select("id, name").order("name"),
          supabase.from("destinations").select("id, name, state").eq("status", "approved").order("name")
        ]);
        if (catsRes.data) setCategories(catsRes.data);
        if (destsRes.data) setDestinations(destsRes.data);
      } catch (e) {
        console.error("Error loading categories or destinations:", e);
      }
    }
    if (user) {
      fetchFormOptions();
    }
  }, [user]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      // 1. Get establishments owned by this user
      const { data: estData, error: estError } = await supabase
        .from("establishments")
        .select(`
          *,
          categories (name),
          destinations (name)
        `)
        .eq("owner_user_id", user.id);

      if (estError) throw estError;

      const mappedEsts: Establishment[] = (estData || []).map((e: any) => ({
        id: e.id,
        name: e.name,
        slug: e.slug,
        status: e.status,
        category_name: e.categories?.name || "",
        category_id: e.category_id,
        destination_name: e.destinations?.name || "",
        destination_id: e.destination_id,
        rating_avg: e.rating_avg || 0,
        review_count: e.review_count || 0,
        created_at: e.created_at,
        address: e.address,
        phone: e.phone,
        whatsapp: e.whatsapp,
        website: e.website,
        description: e.description,
        price_level: e.price_level,
        services: e.services,
        membership_tier: e.membership_tier || "basico",
        is_circuito_excelencia: !!e.is_circuito_excelencia
      }));
      setEstablishments(mappedEsts);

      if (mappedEsts.length === 0) {
        setLoading(false);
        return;
      }

      const estIds = mappedEsts.map(e => e.id);

      // 2. Fetch reservations for these establishments
      const { data: resData } = await supabase
        .from("reservations")
        .select("*")
        .in("establishment_id", estIds)
        .order("created_at", { ascending: false });

      const mappedRes: Reservation[] = (resData || []).map((r: any) => {
        const est = mappedEsts.find(e => e.id === r.establishment_id);
        return {
          id: r.id,
          establishment_name: est?.name || "Establecimiento",
          guest_name: r.guest_name,
          guest_email: r.guest_email || "",
          guest_phone: r.guest_phone || "",
          check_in_date: r.check_in_date,
          check_out_date: r.check_out_date,
          guests_count: r.guests_count || 1,
          status: r.status || "pending",
          total_price: r.total_price || 0,
          created_at: r.created_at
        };
      });

      // Merge with localStorage mock reservations
      const localResKey = "hdv_mock_reservations";
      const localRes = JSON.parse(localStorage.getItem(localResKey) || "[]")
        .filter((r: any) => estIds.includes(r.establishment_id));
      
      const mappedLocalRes: Reservation[] = localRes.map((r: any) => {
        const est = mappedEsts.find(e => e.id === r.establishment_id);
        return {
          id: r.id,
          establishment_name: est?.name || r.establishment_name || "Establecimiento",
          guest_name: r.guest_name,
          guest_email: r.guest_email || "",
          guest_phone: r.guest_phone || "",
          check_in_date: r.check_in_date,
          check_out_date: r.check_out_date,
          guests_count: r.guests_count || 1,
          status: r.status || "pending",
          total_price: r.total_price || 0,
          created_at: r.created_at
        };
      });

      const combinedRes = [...mappedRes, ...mappedLocalRes];
      combinedRes.sort((a: any, b: any) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
      setReservations(combinedRes);

      // 3. Fetch WhatsApp leads
      const { data: leadData } = await supabase
        .from("establishment_whatsapp_leads")
        .select("*")
        .in("establishment_id", estIds)
        .order("created_at", { ascending: false });

      const mappedLeads: WhatsAppLead[] = (leadData || []).map((l: any) => {
        const est = mappedEsts.find(e => e.id === l.establishment_id);
        return {
          id: l.id,
          establishment_name: est?.name || l.establishment_name || "Establecimiento",
          visitor_name: l.visitor_name,
          visitor_phone: l.visitor_phone,
          message: l.message || "",
          created_at: l.created_at
        };
      });
      setLeads(mappedLeads);

      // 4. Fetch Stats (analytics events)
      const [viewsCount, clicksCount] = await Promise.all([
        supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_type", "profile_view").in("establishment_id", estIds),
        supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_type", "whatsapp_click").in("establishment_id", estIds)
      ]);

      setStats({
        views: viewsCount.count || 0,
        clicks: clicksCount.count || 0,
        reservationsCount: combinedRes.length
      });

      // 5. Fetch discount codes
      const { data: discountData } = await supabase
        .from("discount_codes")
        .select(`
          *,
          establishments (name)
        `)
        .in("establishment_id", estIds)
        .order("created_at", { ascending: false });

      // Merge with localStorage mock discount codes
      const localDiscountsKey = "hdv_mock_discount_codes";
      const localDiscounts = JSON.parse(localStorage.getItem(localDiscountsKey) || "[]")
        .filter((d: any) => estIds.includes(d.establishment_id));

      const mappedLocalDiscounts = localDiscounts.map((d: any) => {
        const est = mappedEsts.find(e => e.id === d.establishment_id);
        return {
          ...d,
          establishments: { name: est?.name || "Establecimiento" }
        };
      });

      const combinedDiscounts = [...(discountData || []), ...mappedLocalDiscounts];
      setDiscountCodes(combinedDiscounts);

    } catch (err) {
      console.error("Error fetching dashboard stats/data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleAddDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountFormData.establishment_id || !discountFormData.code || !discountFormData.discount_value) {
      alert("Por favor completa los campos requeridos.");
      return;
    }
    setSavingDiscount(true);
    let dbSuccess = false;
    try {
      const { error } = await supabase
        .from("discount_codes")
        .insert([{
          establishment_id: parseInt(discountFormData.establishment_id),
          code: discountFormData.code.toUpperCase().trim(),
          description: discountFormData.description,
          discount_type: discountFormData.discount_type,
          discount_value: parseFloat(discountFormData.discount_value),
          min_nights: parseInt(discountFormData.min_nights) || 1,
          max_uses: discountFormData.max_uses ? parseInt(discountFormData.max_uses) : null,
          start_date: discountFormData.start_date || null,
          end_date: discountFormData.end_date || null,
          is_active: discountFormData.is_active
        }]);

      if (!error) {
        dbSuccess = true;
      } else {
        console.warn("DB insert for discount code failed, falling back to localStorage:", error);
      }
    } catch (err) {
      console.warn("DB exception for discount code, falling back to localStorage:", err);
    }

    try {
      if (!dbSuccess) {
        const localDiscountsKey = "hdv_mock_discount_codes";
        const existingDiscounts = JSON.parse(localStorage.getItem(localDiscountsKey) || "[]");
        const newDiscount = {
          id: Math.floor(100000 + Math.random() * 900000),
          establishment_id: parseInt(discountFormData.establishment_id),
          code: discountFormData.code.toUpperCase().trim(),
          description: discountFormData.description,
          discount_type: discountFormData.discount_type,
          discount_value: parseFloat(discountFormData.discount_value),
          min_nights: parseInt(discountFormData.min_nights) || 1,
          max_uses: discountFormData.max_uses ? parseInt(discountFormData.max_uses) : null,
          current_uses: 0,
          start_date: discountFormData.start_date || null,
          end_date: discountFormData.end_date || null,
          is_active: discountFormData.is_active,
          created_at: new Date().toISOString()
        };
        localStorage.setItem(localDiscountsKey, JSON.stringify([newDiscount, ...existingDiscounts]));
      }

      setShowAddDiscountModal(false);
      setDiscountFormData({
        establishment_id: "",
        code: "",
        description: "",
        discount_type: "percentage",
        discount_value: "",
        min_nights: "1",
        max_uses: "",
        start_date: "",
        end_date: "",
        is_active: true
      });
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert("Error al registrar el cupón de descuento.");
    } finally {
      setSavingDiscount(false);
    }
  };

  const handleToggleDiscountActive = async (id: number, currentStatus: boolean) => {
    try {
      // Check if it's a local storage discount code
      const localDiscountsKey = "hdv_mock_discount_codes";
      const existingDiscounts = JSON.parse(localStorage.getItem(localDiscountsKey) || "[]");
      const isMock = existingDiscounts.some((d: any) => d.id === id);

      if (isMock) {
        const updatedDiscounts = existingDiscounts.map((d: any) => 
          d.id === id ? { ...d, is_active: !currentStatus } : d
        );
        localStorage.setItem(localDiscountsKey, JSON.stringify(updatedDiscounts));
        await fetchDashboardData();
      } else {
        const { error } = await supabase
          .from("discount_codes")
          .update({ is_active: !currentStatus })
          .eq("id", id);
        if (error) throw error;
        await fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDiscount = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este código de descuento?")) return;
    try {
      // Check if it's a local storage discount code
      const localDiscountsKey = "hdv_mock_discount_codes";
      const existingDiscounts = JSON.parse(localStorage.getItem(localDiscountsKey) || "[]");
      const isMock = existingDiscounts.some((d: any) => d.id === id);

      if (isMock) {
        const updatedDiscounts = existingDiscounts.filter((d: any) => d.id !== id);
        localStorage.setItem(localDiscountsKey, JSON.stringify(updatedDiscounts));
        await fetchDashboardData();
      } else {
        const { error } = await supabase
          .from("discount_codes")
          .delete()
          .eq("id", id);
        if (error) throw error;
        await fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle service checkbox changes
  const handleServiceChange = (key: string) => {
    setFormData(prev => {
      const active = prev.services.includes(key);
      return {
        ...prev,
        services: active ? prev.services.filter(s => s !== key) : [...prev.services, key]
      };
    });
  };

  // Submit new establishment
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.name || !formData.category_id || !formData.destination_id) {
      alert("Por favor completa los campos requeridos.");
      return;
    }

    try {
      setSubmitting(true);
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      const payload = {
        owner_user_id: user.id,
        name: formData.name,
        slug,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        website: formData.website,
        price_level: formData.price_level,
        category_id: parseInt(formData.category_id),
        destination_id: parseInt(formData.destination_id),
        services: JSON.stringify(formData.services),
        status: "pending", // Admin approval required
        has_reservations_enabled: false // Admin authorization required
      };

      const { error } = await supabase.from("establishments").insert([payload]);

      if (error) throw error;

      setShowAddModal(false);
      setFormData({
        name: "",
        description: "",
        address: "",
        phone: "",
        whatsapp: "",
        website: "",
        price_level: "$$",
        category_id: "",
        destination_id: "",
        services: []
      });

      // Reload
      await fetchDashboardData();
    } catch (err) {
      console.error("Error creating establishment:", err);
      alert("Ocurrió un error al registrar el establecimiento.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            <CheckCircle className="w-3.5 h-3.5" />
            Aprobado
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            <XCircle className="w-3.5 h-3.5" />
            Rechazado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            Pendiente
          </span>
        );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
        <p className="text-gray-400 text-xs font-bold">Cargando panel de control...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden py-12 bg-gradient-to-br from-brand-purple-dark via-brand-purple-deep to-black text-white">
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-brand-magenta/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-brand-turquesa/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-brand-magenta/20 text-brand-magenta border border-brand-magenta/30 mb-2">
              <Briefcase className="w-3 h-3" />
              <span>PORTAL DE PROPIETARIOS</span>
            </span>
            <h1 className="text-3xl font-black tracking-tight">
              Panel de Control de {profile?.name || user?.email?.split("@")[0]}
            </h1>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-cyan-gradient text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-turquesa/10 cursor-pointer active:scale-97 hover:scale-102 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Establecimiento</span>
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-4 -mb-px">
            {[
              { id: "resumen", label: "Resumen General", icon: BarChart3 },
              { id: "establecimientos", label: `Mis Negocios (${establishments.length})`, icon: Building2 },
              { id: "reservas", label: `Reservaciones (${reservations.length})`, icon: Calendar },
              { id: "leads", label: `Leads de WhatsApp (${leads.length})`, icon: MessageSquare },
              { id: "descuentos", label: `Descuentos (${discountCodes.length})`, icon: Tag },
              { id: "guiones", label: "Asistente de Guiones", icon: Sparkles }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 border-b-2 flex items-center gap-2 text-xs font-bold cursor-pointer transition-colors ${
                  activeTab === tab.id
                    ? "border-brand-magenta text-brand-magenta font-black"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* RESUMEN GENERAL TAB */}
        {activeTab === "resumen" && (
          <div className="space-y-8">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-5">
                <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center border border-pink-100 shrink-0">
                  <Eye className="w-6 h-6 text-brand-magenta" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Vistas de Perfil</span>
                  <span className="text-3xl font-black text-gray-800">{stats.views}</span>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-5">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shrink-0">
                  <MessageSquare className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Clics de WhatsApp</span>
                  <span className="text-3xl font-black text-gray-800">{stats.clicks}</span>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-5">
                <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center border border-cyan-100 shrink-0">
                  <Calendar className="w-6 h-6 text-brand-turquesa" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Reservaciones Totales</span>
                  <span className="text-3xl font-black text-gray-800">{stats.reservationsCount}</span>
                </div>
              </div>

            </div>

            {/* Quick List & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Establishments Status */}
              <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-md font-black text-gray-800 tracking-tight">Establecimientos Recientes</h3>
                  <button onClick={() => setActiveTab("establecimientos")} className="text-xs font-bold text-brand-magenta hover:underline">Ver todos →</button>
                </div>

                {establishments.length === 0 ? (
                  <div className="text-center py-10">
                    <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-xs text-gray-400">Aún no registras establecimientos en tu perfil.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {establishments.slice(0, 4).map(est => (
                      <div key={est.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                        <div>
                          <h4 className="font-bold text-gray-700 text-sm">{est.name}</h4>
                          <span className="text-[10px] text-gray-400 font-semibold">{est.category_name} • {est.destination_name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(est.status)}
                          <Link href={`/establecimiento/${est.slug}`}>
                            <button className="text-[11px] font-bold text-brand-turquesa hover:underline cursor-pointer">Ver Ficha</button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Info Box */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-md font-black text-gray-800 tracking-tight mb-2">Portal Andromeda</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    ¿Sabías que puedes ganar puntos y cobrar dinero real sugiriendo Sitios Turísticos o redactando Tips de Viaje?
                  </p>
                </div>
                <div className="pt-6 border-t border-gray-50 mt-6">
                  <Link href="/andromeda">
                    <button className="w-full btn-magenta-gradient text-xs font-bold py-3 rounded-xl shadow-md shadow-brand-magenta/10 cursor-pointer text-center">
                      Ir al Panel Andromeda
                    </button>
                  </Link>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ESTABLECIMIENTOS TAB */}
        {activeTab === "establecimientos" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-black text-gray-800 tracking-tight">Listado de Establecimientos</h3>
              <span className="text-xs font-bold text-gray-400">{establishments.length} negocios</span>
            </div>

            {establishments.length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
                <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-gray-700">Registra tu primer establecimiento</h4>
                <p className="text-gray-400 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
                  Agrega tu hotel, posada boutique o restaurante a la guía oficial. Una vez aprobado por administración, aparecerá públicamente.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-6 btn-magenta-gradient text-xs font-bold px-8 py-3 rounded-xl shadow-md shadow-brand-magenta/10 cursor-pointer"
                >
                  Registrar mi Negocio
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {establishments.map(est => (
                  <div key={est.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h4 className="font-black text-gray-800 text-lg leading-tight">{est.name}</h4>
                        {getStatusBadge(est.status)}
                      </div>
                      <p className="text-[11px] font-bold text-brand-magenta uppercase tracking-wider mb-3">{est.category_name} • {est.destination_name}</p>
                      
                      <div className="space-y-1.5 text-xs text-gray-500 mb-6">
                        {est.address && <p className="truncate"><span className="font-bold text-gray-400">Dir:</span> {est.address}</p>}
                        {est.phone && <p><span className="font-bold text-gray-400">Tlf:</span> {est.phone}</p>}
                        {est.whatsapp && <p><span className="font-bold text-gray-400">WhatsApp:</span> {est.whatsapp}</p>}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-50">
                      <Link href={`/establecimiento/${est.slug}`} className="flex-1">
                        <button className="w-full bg-white border border-gray-200 text-gray-500 font-bold text-xs py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer">
                          Ver Ficha
                        </button>
                      </Link>
                      <button 
                        onClick={() => alert("Función para editar información del negocio en desarrollo para el Módulo 9.")} 
                        className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs py-2.5 rounded-xl border border-gray-100 cursor-pointer"
                      >
                        Editar Datos
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RESERVAS TAB */}
        {activeTab === "reservas" && (
          <div className="space-y-6">
            <h3 className="text-md font-black text-gray-800 tracking-tight">Control de Reservaciones</h3>

            {reservations.length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl p-6">
                <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-3" />
                <p className="text-xs text-gray-400">Aún no posees solicitudes de reservación registradas.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        <th className="p-4 pl-6">Huésped</th>
                        <th className="p-4">Establecimiento</th>
                        <th className="p-4">Entrada</th>
                        <th className="p-4">Salida</th>
                        <th className="p-4">Pax</th>
                        <th className="p-4">Total</th>
                        <th className="p-4 pr-6">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reservations.map(res => (
                        <tr key={res.id} className="hover:bg-gray-50/50">
                          <td className="p-4 pl-6">
                            <span className="font-bold text-gray-700 block">{res.guest_name}</span>
                            <span className="text-[10px] text-gray-400 font-mono block">{res.guest_phone || res.guest_email}</span>
                          </td>
                          <td className="p-4 font-semibold text-gray-600">{res.establishment_name}</td>
                          <td className="p-4 font-semibold text-gray-500">{new Date(res.check_in_date).toLocaleDateString("es-VE")}</td>
                          <td className="p-4 font-semibold text-gray-500">{new Date(res.check_out_date).toLocaleDateString("es-VE")}</td>
                          <td className="p-4 font-extrabold text-gray-600">{res.guests_count}</td>
                          <td className="p-4 font-black text-brand-magenta">${res.total_price}</td>
                          <td className="p-4 pr-6">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              res.status === "confirmed" ? "bg-green-50 text-green-700 border border-green-100" :
                              res.status === "cancelled" ? "bg-red-50 text-red-700 border border-red-100" :
                              "bg-yellow-50 text-yellow-700 border border-yellow-100"
                            }`}>
                              {res.status === "confirmed" ? "Confirmado" : res.status === "cancelled" ? "Cancelado" : "Pendiente"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LEADS TAB */}
        {activeTab === "leads" && (
          <div className="space-y-6">
            <h3 className="text-md font-black text-gray-800 tracking-tight">Leads y Contactos vía WhatsApp</h3>

            {leads.length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl p-6">
                <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-3" />
                <p className="text-xs text-gray-400">Aún no tienes contactos directos registrados.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leads.map(lead => (
                  <div key={lead.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-700 text-sm">{lead.visitor_name}</h4>
                        <span className="text-[10px] text-gray-400 font-semibold">para {lead.establishment_name}</span>
                      </div>
                      <p className="text-xs text-gray-500 font-bold flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-brand-turquesa shrink-0" />
                        <span>{lead.visitor_phone}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-gray-400 font-semibold">{new Date(lead.created_at).toLocaleDateString("es-VE")}</span>
                      <a 
                        href={`https://wa.me/${lead.visitor_phone.replace(/[^\d]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Responder
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DESCUENTOS TAB */}
        {activeTab === "descuentos" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-black text-gray-800 tracking-tight">Códigos de Descuento Promocionales</h3>
              <button
                onClick={() => setShowAddDiscountModal(true)}
                className="btn-cyan-gradient text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-turquesa/10 cursor-pointer active:scale-97 hover:scale-102 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Cupón</span>
              </button>
            </div>

            {discountCodes.length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <Tag className="w-16 h-16 text-gray-200 mx-auto mb-3" />
                <p className="text-xs text-gray-400">Aún no has creado cupones de descuento para tus negocios.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        <th className="p-4 pl-6">Código / Negocio</th>
                        <th className="p-4">Descripción</th>
                        <th className="p-4">Descuento</th>
                        <th className="p-4">Noches Mín.</th>
                        <th className="p-4">Usos (Restantes)</th>
                        <th className="p-4">Vigencia</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4 pr-6 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {discountCodes.map(code => (
                        <tr key={code.id} className="hover:bg-gray-50/50">
                          <td className="p-4 pl-6">
                            <span className="font-mono font-black text-brand-magenta text-sm block uppercase">{code.code}</span>
                            <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">{code.establishments?.name || "Establecimiento"}</span>
                          </td>
                          <td className="p-4 text-gray-500 font-medium">{code.description || "-"}</td>
                          <td className="p-4 font-black text-gray-700">
                            {code.discount_type === "percentage" ? `${code.discount_value}%` : `$${code.discount_value} USD`}
                          </td>
                          <td className="p-4 font-bold text-gray-500">{code.min_nights} noche{code.min_nights !== 1 ? "s" : ""}</td>
                          <td className="p-4 text-gray-500 font-semibold">
                            {code.current_uses} {code.max_uses ? `/ ${code.max_uses}` : "(ilimitados)"}
                          </td>
                          <td className="p-4 text-gray-500 font-medium">
                            {code.start_date || code.end_date ? (
                              <span>{code.start_date ? new Date(code.start_date).toLocaleDateString("es-VE") : "∞"} al {code.end_date ? new Date(code.end_date).toLocaleDateString("es-VE") : "∞"}</span>
                            ) : "Siempre activo"}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleDiscountActive(code.id, code.is_active)}
                              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                                code.is_active 
                                  ? "bg-green-50 text-green-700 border border-green-150" 
                                  : "bg-red-50 text-red-700 border border-red-150"
                              }`}
                            >
                              {code.is_active ? "Activo" : "Inactivo"}
                            </button>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button
                              onClick={() => handleDeleteDiscount(code.id)}
                              className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-xl transition-all cursor-pointer inline-flex"
                              title="Eliminar cupón"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* GUIONES TAB */}
        {activeTab === "guiones" && (
          <ScriptGenerator establishments={establishments} />
        )}

      </main>

      {/* Add Establishment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-brand-purple-dark to-brand-purple-deep px-6 py-5 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-brand-magenta" />
                <div className="text-left">
                  <h3 className="font-extrabold text-sm tracking-wide">Registrar Nuevo Establecimiento</h3>
                  <p className="text-white/70 text-[10px] mt-0.5">Sujeto a verificación y aprobación de la administración</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-4 text-left">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Name */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Nombre del Establecimiento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Posada Galápagos"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Categoría *</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={e => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all cursor-pointer"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Destino */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Destino *</label>
                  <select
                    required
                    value={formData.destination_id}
                    onChange={e => setFormData(prev => ({ ...prev, destination_id: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all cursor-pointer"
                  >
                    <option value="">Selecciona un destino</option>
                    {destinations.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.state})</option>
                    ))}
                  </select>
                </div>

                {/* Precio Promedio */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Rango de Precios</label>
                  <select
                    value={formData.price_level}
                    onChange={e => setFormData(prev => ({ ...prev, price_level: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all cursor-pointer"
                  >
                    <option value="$">Económico ($)</option>
                    <option value="$$">Moderado ($$)</option>
                    <option value="$$$">Lujo ($$$)</option>
                    <option value="$$$$">Ultra Lujo ($$$$)</option>
                  </select>
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Teléfono de Reservas</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="+58 212 1234567"
                      value={formData.phone}
                      onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
                    />
                  </div>
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">WhatsApp Directo</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="+58 414 1234567"
                      value={formData.whatsapp}
                      onChange={e => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
                    />
                  </div>
                </div>

                {/* Sitio Web */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Sitio Web / Enlace a Red Social</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      placeholder="https://ejemplo.com o link de instagram"
                      value={formData.website}
                      onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
                    />
                  </div>
                </div>

                {/* Dirección */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Dirección Física Completa</label>
                  <input
                    type="text"
                    placeholder="Ej: Calle Principal del Gran Roque, a dos cuadras de la plaza"
                    value={formData.address}
                    onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
                  />
                </div>

                {/* Descripción */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Descripción o Reseña Comercial</label>
                  <textarea
                    rows={4}
                    placeholder="Describe los servicios, habitaciones, comidas o atractivos especiales de tu negocio..."
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all resize-none"
                  />
                </div>

              </div>

              {/* Servicios & Amenidades Component */}
              <AmenitiesSelector
                selectedServices={formData.services}
                onChange={(newServices) => setFormData(prev => ({ ...prev, services: newServices }))}
              />

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 text-xs font-bold py-3.5 rounded-xl cursor-pointer transition-all text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-brand-purple-dark to-brand-purple-deep hover:opacity-95 text-white text-xs font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-brand-purple-dark/10"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <span>Registrar Negocio</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Add Discount Code Modal */}
      {showAddDiscountModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-brand-purple-dark to-brand-purple-deep px-6 py-5 flex items-center justify-between text-white text-left">
              <div className="flex items-center gap-3">
                <Tag className="w-6 h-6 text-brand-magenta" />
                <div>
                  <h3 className="font-extrabold text-sm tracking-wide">Crear Cupón de Descuento</h3>
                  <p className="text-white/70 text-[10px] mt-0.5">Define códigos promocionales para incentivar reservas</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddDiscountModal(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddDiscountSubmit} className="p-6 space-y-4 text-left">
              
              {/* Negocio Selection */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Establecimiento Asociado *</label>
                <select
                  required
                  value={discountFormData.establishment_id}
                  onChange={e => setDiscountFormData(prev => ({ ...prev, establishment_id: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta cursor-pointer"
                >
                  <option value="">Selecciona el negocio</option>
                  {establishments.map(est => (
                    <option key={est.id} value={est.id}>{est.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Code */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Código del Cupón *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: BIENVENIDA10"
                    value={discountFormData.code}
                    onChange={e => setDiscountFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 uppercase focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta"
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Tipo de Descuento</label>
                  <select
                    value={discountFormData.discount_type}
                    onChange={e => setDiscountFormData(prev => ({ ...prev, discount_type: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta cursor-pointer"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo (USD)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Valor del Descuento *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Ej: 10 o 50"
                    value={discountFormData.discount_value}
                    onChange={e => setDiscountFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta"
                  />
                </div>

                {/* Min Nights */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Noches Mínimas</label>
                  <input
                    type="number"
                    min="1"
                    value={discountFormData.min_nights}
                    onChange={e => setDiscountFormData(prev => ({ ...prev, min_nights: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta"
                  />
                </div>

                {/* Max Uses */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-bold">Límite de Usos (Opcional)</label>
                  <input
                    type="number"
                    placeholder="Sin límite"
                    value={discountFormData.max_uses}
                    onChange={e => setDiscountFormData(prev => ({ ...prev, max_uses: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta"
                  />
                </div>

                {/* Active check */}
                <div className="flex items-center pt-6 pl-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={discountFormData.is_active}
                      onChange={e => setDiscountFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="accent-brand-magenta w-4 h-4"
                    />
                    <span>Activar de Inmediato</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Vigente Desde (Opcional)</label>
                  <input
                    type="date"
                    value={discountFormData.start_date}
                    onChange={e => setDiscountFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-650 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Vigente Hasta (Opcional)</label>
                  <input
                    type="date"
                    value={discountFormData.end_date}
                    onChange={e => setDiscountFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-650 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-bold">Descripción Interna</label>
                <input
                  type="text"
                  placeholder="Ej: Descuento 10% por inauguración"
                  value={discountFormData.description}
                  onChange={e => setDiscountFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowAddDiscountModal(false)}
                  className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 text-xs font-bold py-3.5 rounded-xl cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingDiscount}
                  className="flex-1 bg-gradient-to-r from-brand-purple-dark to-brand-purple-deep hover:opacity-95 text-white text-xs font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-purple-dark/10"
                >
                  {savingDiscount ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creando Cupón...</span>
                    </>
                  ) : (
                    <span>Crear Cupón</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
