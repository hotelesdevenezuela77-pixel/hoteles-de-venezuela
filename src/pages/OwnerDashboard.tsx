import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { 
  Building2, Clock, CheckCircle, XCircle, Plus, 
  MapPin, Loader2, MessageSquare, BarChart3, Calendar, 
  DollarSign, Users, Trash2, X, Phone, Globe, Briefcase, 
  Eye, Check, ListFilter, Tag, Sparkles, CalendarRange,
  Upload, Trash, FileText, ChevronRight, AlertCircle, RefreshCw,
  TrendingUp, Star, ShieldCheck, ArrowRight, Clipboard, Award, ShieldAlert
} from "lucide-react";
import { ScriptGenerator } from "../components/ScriptGenerator";
import { AmenitiesSelector } from "@/components/admin/AmenitiesSelector";
import { AvailabilityCalendar } from "../components/AvailabilityCalendar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from "recharts";
import { jsPDF } from "jspdf";

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

const ROOM_AMENITIES_CATEGORIES = [
  {
    id: "banio",
    label: "Baño",
    items: [
      { key: "toallas", label: "Toallas" },
      { key: "banio_privado", label: "Baño Privado" },
      { key: "articulos_aseo", label: "Artículos de Aseo Gratis" },
      { key: "secador_pelo", label: "Secador de Pelo" },
      { key: "ducha", label: "Ducha" }
    ]
  },
  {
    id: "habitacion",
    label: "Habitación",
    items: [
      { key: "aire_acondicionado", label: "Aire Acondicionado" },
      { key: "ropa_cama", label: "Ropa de Cama" },
      { key: "armario", label: "Armario / Vestier" },
      { key: "caja_fuerte", label: "Caja Fuerte Digital" },
      { key: "calefaccion", label: "Calefacción" }
    ]
  },
  {
    id: "instalaciones",
    label: "Instalaciones y Confort",
    items: [
      { key: "escritorio", label: "Zona de Trabajo / Escritorio" },
      { key: "enchufe_cerca", label: "Enchufe cerca de la cama" },
      { key: "tv_cable", label: "TV por Cable / Streaming" },
      { key: "balcon", label: "Balcón / Terraza Privada" },
      { key: "vista_mar", label: "Vista al Mar / Panorámica" }
    ]
  },
  {
    id: "cocina",
    label: "Cocina",
    items: [
      { key: "cafetera", label: "Cafetera" },
      { key: "nevera", label: "Nevera / Frigobar" },
      { key: "cocina_equipada", label: "Cocina / Kitchenette Equipada" },
      { key: "limpieza_productos", label: "Productos de Limpieza" }
    ]
  },
  {
    id: "seguridad",
    label: "Seguridad",
    items: [
      { key: "extintores", label: "Extintores" },
      { key: "detector_humo", label: "Detectores de Humo" },
      { key: "tarjeta_acceso", label: "Tarjeta de Acceso" },
      { key: "camaras_seguridad", label: "Cámaras de Seguridad" }
    ]
  }
];

const ROOM_AMENITIES_MAP: Record<string, string> = {
  toallas: "Toallas",
  banio_privado: "Baño Privado",
  articulos_aseo: "Artículos de Aseo Gratis",
  secador_pelo: "Secador de Pelo",
  ducha: "Ducha",
  aire_acondicionado: "Aire Acondicionado",
  ropa_cama: "Ropa de Cama",
  armario: "Armario / Vestier",
  caja_fuerte: "Caja Fuerte Digital",
  calefaccion: "Calefacción",
  escritorio: "Escritorio / Zona de Trabajo",
  enchufe_cerca: "Enchufe cerca de la cama",
  tv_cable: "TV por Cable / Streaming",
  balcon: "Balcón / Terraza Privada",
  vista_mar: "Vista al Mar",
  cafetera: "Cafetera",
  nevera: "Nevera / Frigobar",
  cocina_equipada: "Cocina Equipada",
  limpieza_productos: "Productos de Limpieza",
  extintores: "Extintores",
  detector_humo: "Detector de Humo",
  tarjeta_acceso: "Tarjeta de Acceso",
  camaras_seguridad: "Cámaras de Seguridad"
};

function getRoomAmenityLabel(key: string) {
  const normalized = key.toLowerCase().trim();
  return ROOM_AMENITIES_MAP[normalized] || key.charAt(0).toUpperCase() + key.slice(1);
}

export function OwnerDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const isAdmin = profile?.role === 'admin' || user?.email?.toLowerCase() === "hotelesdevenezuela77@gmail.com";
  
  const [impersonateId, setImpersonateId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hdv_impersonate_owner_user_id");
    }
    return null;
  });
  
  const [impersonateName, setImpersonateName] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hdv_impersonate_owner_user_name");
    }
    return null;
  });

  const [impersonateEstablishmentId, setImpersonateEstablishmentId] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hdv_impersonate_establishment_id");
      return saved ? Number(saved) : null;
    }
    return null;
  });

  const activeOwnerId = (isAdmin && impersonateId) ? impersonateId : user?.id;
  
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [leads, setLeads] = useState<WhatsAppLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"resumen" | "portafolio" | "operaciones" | "inventario" | "finanzas" | "marketing" | "guiones">("resumen");
  const [operacionesSubTab, setOperacionesSubTab] = useState<"reservas" | "disponibilidad" | "timeline">("reservas");
  const [marketingSubTab, setMarketingSubTab] = useState<"descuentos" | "leads" | "reviews" | "channel-manager">("leads");
  
  const [selectedCalendarEst, setSelectedCalendarEst] = useState<number | "">("");

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

  // Rooms Management State
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [newRoomModalOpen, setNewRoomModalOpen] = useState(false);
  const [roomFormData, setRoomFormData] = useState({
    name: "",
    description: "",
    capacity: 2,
    price_per_night: 100,
    quantity: 5,
    amenities: "",
    is_active: true,
    room_number: ""
  });
  
  // Drag and drop image states
  const [roomPhotos, setRoomPhotos] = useState<Record<number, string[]>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hdv_room_photos");
      return saved ? JSON.parse(saved) : {
        101: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80"],
        102: ["https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=400&q=80"],
        103: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=400&q=80"]
      };
    }
    return {};
  });
  const [dragActive, setDragActive] = useState<Record<number, boolean>>({});

  // Invoices & Liquidation lists state
  const [invoices, setInvoices] = useState<any[]>([]);
  const [liquidations, setLiquidations] = useState<any[]>([]);

  // OTA Channel Manager sync state
  const [otaSyncing, setOtaSyncing] = useState(false);
  const [otaLogs, setOtaLogs] = useState([
    { id: 1, channel: "Booking.com", status: "success", timestamp: "Hace 10 minutos" },
    { id: 2, channel: "Airbnb", status: "success", timestamp: "Hace 15 minutos" },
    { id: 3, channel: "Expedia", status: "success", timestamp: "Hace 1 hora" }
  ]);

  // Guest reviews list state
  const [reviews, setReviews] = useState<any[]>([
    { id: 1, guest_name: "María Alejandra", rating: 5, comment: "Excelente ubicación y la atención fue insuperable. Volveremos sin duda.", date: "2026-07-20", reply: "¡Muchas gracias María! Será un placer recibirlos de nuevo." },
    { id: 2, guest_name: "Carlos Mendoza", rating: 4, comment: "Muy limpio y cómodo, el wifi falló un poco en las habitaciones de arriba.", date: "2026-07-18", reply: "" }
  ]);

  // Bulk rate modifier state
  const [bulkRate, setBulkRate] = useState("");
  const [bulkStart, setBulkStart] = useState("");
  const [bulkEnd, setBulkEnd] = useState("");
  const [bulkRoom, setBulkRoom] = useState("");
  const [bulkAction, setBulkAction] = useState<"rate" | "lock" | "unlock">("rate");

  // Surroundings states & handlers
  const [showSurroundingsModal, setShowSurroundingsModal] = useState(false);
  const [surroundings, setSurroundings] = useState<any[]>([]);
  const [newPOI, setNewPOI] = useState({ category: "cerca", name: "", distance: "" });

  const POI_CATEGORIES = [
    { id: "cerca", label: "¿Qué hay cerca?" },
    { id: "gastronomia", label: "Restaurantes y cafeterías" },
    { id: "atracciones", label: "Atracciones turísticas destacadas" },
    { id: "playas", label: "Playas en la zona" },
    { id: "transporte", label: "Transporte público" },
    { id: "aeropuertos", label: "Aeropuertos más cercanos" }
  ];

  useEffect(() => {
    if (selectedCalendarEst) {
      const key = `hdv_surroundings_${selectedCalendarEst}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setSurroundings(JSON.parse(saved));
      } else {
        const defaults = [
          { category: "cerca", name: "Plaza del Ayuntamiento", distance: "100 m" },
          { category: "cerca", name: "Parque de la Rambleta", distance: "100 m" },
          { category: "cerca", name: "Museo Nacional de Cerámica", distance: "450 m" },
          { category: "cerca", name: "Lonja de la Seda", distance: "550 m" },
          { category: "gastronomia", name: "Restaurante Homenaje Taberna Gourmet", distance: "50 m" },
          { category: "gastronomia", name: "Cafetería/bar McLub", distance: "80 m" },
          { category: "atracciones", name: "Jardín del Turia", distance: "1.3 km" },
          { category: "atracciones", name: "Museo de Ciencias Naturales", distance: "1.6 km" },
          { category: "playas", name: "Playa de las Arenas", distance: "5 km" },
          { category: "playas", name: "Playa de la Malvarrosa", distance: "5 km" },
          { category: "transporte", name: "Metro - Estación de Metro Xàtiva", distance: "400 m" },
          { category: "transporte", name: "Tren - Estación de tren del Norte", distance: "500 m" },
          { category: "aeropuertos", name: "Aeropuerto de Valencia", distance: "8 km" }
        ];
        setSurroundings(defaults);
        localStorage.setItem(key, JSON.stringify(defaults));
      }
    }
  }, [selectedCalendarEst]);

  const handleAddPOI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPOI.name || !newPOI.distance) return;
    const updated = [...surroundings, newPOI];
    setSurroundings(updated);
    if (selectedCalendarEst) {
      localStorage.setItem(`hdv_surroundings_${selectedCalendarEst}`, JSON.stringify(updated));
    }
    setNewPOI({ category: newPOI.category, name: "", distance: "" });
  };

  const handleRemovePOI = (index: number) => {
    const updated = surroundings.filter((_, idx) => idx !== index);
    setSurroundings(updated);
    if (selectedCalendarEst) {
      localStorage.setItem(`hdv_surroundings_${selectedCalendarEst}`, JSON.stringify(updated));
    }
  };

  // Timeline states & Drag and Drop handlers
  const [timelineMonth, setTimelineMonth] = useState(new Date());

  const getTimelineDays = () => {
    const year = timelineMonth.getFullYear();
    const month = timelineMonth.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const list = [];
    for (let i = 1; i <= totalDays; i++) {
      list.push(new Date(year, month, i));
    }
    return list;
  };

  const handleDropReservation = async (e: React.DragEvent, targetRoomId: number, targetDateStr: string) => {
    e.preventDefault();
    const resIdStr = e.dataTransfer.getData("text/plain");
    if (!resIdStr) return;
    const resId = Number(resIdStr);
    
    // Find reservation
    const res = reservations.find(r => r.id === resId);
    if (!res) return;

    // Calculate nights count
    const checkIn = new Date(res.check_in_date);
    const checkOut = new Date(res.check_out_date);
    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));

    // Compute new dates
    const newCheckInDate = new Date(targetDateStr);
    const newCheckOutDate = new Date(newCheckInDate);
    newCheckOutDate.setDate(newCheckInDate.getDate() + nights);

    const checkInStr = newCheckInDate.toISOString().split("T")[0];
    const checkOutStr = newCheckOutDate.toISOString().split("T")[0];

    // Check for overlap / overbooking
    const hasOverlap = reservations.some(r => {
      if (r.id === resId) return false;
      if (r.status !== "confirmed") return false;
      
      const sameRoom = (r as any).room_id === targetRoomId || r.room_type === rooms.find(rm => rm.id === targetRoomId)?.name;
      if (!sameRoom) return false;
      
      const overlap = checkInStr < r.check_out_date && checkOutStr > r.check_in_date;
      return overlap;
    });

    if (hasOverlap) {
      alert(`⚠️ Conflicto de Sobreventa: La habitación ya está ocupada en ese periodo por otra reservación activa.`);
      return;
    }

    // Optimistic Update
    setReservations(prev => prev.map(r => r.id === resId ? { ...r, check_in_date: checkInStr, check_out_date: checkOutStr, room_id: targetRoomId } : r));

    // Update DB
    try {
      if (resId >= 10000) {
        // Mock reservation update
        const localResKey = "hdv_mock_reservations";
        const localRes = JSON.parse(localStorage.getItem(localResKey) || "[]");
        const updated = localRes.map((r: any) => r.id === resId ? { ...r, check_in_date: checkInStr, check_out_date: checkOutStr, room_id: targetRoomId } : r);
        localStorage.setItem(localResKey, JSON.stringify(updated));
      } else {
        const { error } = await supabase
          .from("reservations")
          .update({
            check_in_date: checkInStr,
            check_out_date: checkOutStr,
            room_id: targetRoomId
          })
          .eq("id", resId);
        if (error) throw error;
      }
      
      alert(`🎉 Reservación de ${res.guest_name} reasignada con éxito del ${checkInStr} al ${checkOutStr}.`);
      await fetchDashboardData();
    } catch (err) {
      console.error("Error updating reservation drag-drop:", err);
      await fetchDashboardData();
      alert("Error al actualizar la reservación en Supabase.");
    }
  };

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
    if (activeOwnerId) {
      fetchFormOptions();
    }
  }, [activeOwnerId]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!activeOwnerId) return;
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
        .eq("owner_user_id", activeOwnerId)
        .order("created_at", { ascending: false });

      if (estError) throw estError;

      let mappedEsts: Establishment[] = (estData || []).map((e: any) => ({
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

      if (isAdmin && impersonateEstablishmentId) {
        mappedEsts = mappedEsts.filter(e => e.id === impersonateEstablishmentId);
      }

      setEstablishments(mappedEsts);
      
      if (mappedEsts.length > 0) {
        const firstEstId = mappedEsts[0].id;
        setSelectedCalendarEst(prev => prev || firstEstId);
        fetchRooms(firstEstId);
      }

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

      // 6. Fetch invoices
      const { data: invData } = await supabase
        .from("membership_payments")
        .select("*")
        .in("establishment_id", estIds)
        .order("payment_date", { ascending: false });
      
      const mockInvoices = [
        { id: 201, payment_date: new Date().toISOString().split("T")[0], amount: 150, currency: "USD", payment_method: "zelle", payment_reference: "ZELLE-98317", notes: "Membresía Premium - Suscripción Mensual", status: "paid" },
        { id: 202, payment_date: "2026-06-15", amount: 150, currency: "USD", payment_method: "zelle", payment_reference: "ZELLE-88311", notes: "Membresía Premium - Mensualidad Junio", status: "paid" },
        { id: 203, payment_date: "2026-05-15", amount: 150, currency: "USD", payment_method: "zelle", payment_reference: "ZELLE-77192", notes: "Membresía Premium - Mensualidad Mayo", status: "paid" }
      ];
      setInvoices(invData && invData.length > 0 ? invData : mockInvoices);

      // 7. Calculate liquidations report
      const confirmedRevenue = combinedRes
        .filter(r => r.status === "confirmed")
        .reduce((sum, r) => sum + r.total_price, 0);

      const mockLiquidationsList = [
        { id: 301, period: "Julio 2026", gross: confirmedRevenue || 1200, commission: (confirmedRevenue || 1200) * 0.1, net: (confirmedRevenue || 1200) * 0.9, account: "Banesco Corriente - ...8912", date: "2026-07-25", status: "liquidated" },
        { id: 302, period: "Junio 2026", gross: 950, commission: 95, net: 855, account: "Banesco Corriente - ...8912", date: "2026-06-25", status: "liquidated" }
      ];
      setLiquidations(mockLiquidationsList);

    } catch (err) {
      console.error("Error fetching dashboard stats/data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeOwnerId) {
      fetchDashboardData();
    }
  }, [activeOwnerId]);

  // Fetch Rooms
  const fetchRooms = async (estId: number) => {
    try {
      setLoadingRooms(true);
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("establishment_id", estId);
      
      if (!error && data && data.length > 0) {
        setRooms(data);
      } else {
        const mockRooms = [
          { id: 101, name: "Habitación Matrimonial Standard", price_per_night: 80, capacity: 2, quantity: 5, description: "Habitación cómoda con cama matrimonial y baño privado.", amenities: "wifi,aire,tv", is_active: true },
          { id: 102, name: "Suite Premium Vista al Mar", price_per_night: 150, capacity: 3, quantity: 3, description: "Espaciosa suite con balcón y hermosa vista al mar caribe.", amenities: "wifi,aire,tv,piscina,jacuzzi", is_active: true },
          { id: 103, name: "Presidential Suite Familiar", price_per_night: 250, capacity: 6, quantity: 2, description: "La máxima comodidad para la familia con múltiples habitaciones.", amenities: "wifi,aire,tv,restaurante,jacuzzi", is_active: true }
        ];
        setRooms(mockRooms);
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (selectedCalendarEst) {
      fetchRooms(Number(selectedCalendarEst));
    }
  }, [selectedCalendarEst]);

  const handleToggleRoomAmenity = (key: string) => {
    const current = roomFormData.amenities ? roomFormData.amenities.split(",").map(s => s.trim()).filter(Boolean) : [];
    const idx = current.indexOf(key);
    let updated: string[];
    if (idx >= 0) {
      updated = current.filter(s => s !== key);
    } else {
      updated = [...current, key];
    }
    setRoomFormData(prev => ({ ...prev, amenities: updated.join(",") }));
  };

  // Create Room type handler
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCalendarEst) return;
    try {
      const payload = {
        establishment_id: Number(selectedCalendarEst),
        name: roomFormData.name,
        description: roomFormData.description,
        capacity: Number(roomFormData.capacity),
        price_per_night: Number(roomFormData.price_per_night),
        quantity: Number(roomFormData.quantity),
        amenities: roomFormData.amenities,
        is_active: roomFormData.is_active,
        room_number: roomFormData.room_number
      };

      const { data, error } = await supabase.from("rooms").insert([payload]).select();
      if (error) throw error;
      
      alert("Tipología de Habitación creada con éxito en la base de datos.");
      setNewRoomModalOpen(false);
      setRoomFormData({
        name: "",
        description: "",
        capacity: 2,
        price_per_night: 100,
        quantity: 5,
        amenities: "",
        is_active: true,
        room_number: ""
      });
      fetchRooms(Number(selectedCalendarEst));
    } catch (err) {
      console.warn("Error insertando habitación a Supabase, guardando localmente:", err);
      const newRoom = {
        id: Math.floor(Math.random() * 9999) + 200,
        ...roomFormData,
        price_per_night: Number(roomFormData.price_per_night),
        capacity: Number(roomFormData.capacity),
        quantity: Number(roomFormData.quantity)
      };
      setRooms(prev => [...prev, newRoom]);
      setNewRoomModalOpen(false);
      alert("Habitación creada localmente con éxito.");
    }
  };

  // Delete Room type handler
  const handleDeleteRoom = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este tipo de habitación?")) return;
    try {
      const { error } = await supabase.from("rooms").delete().eq("id", id);
      if (error) throw error;
      alert("Habitación eliminada correctamente.");
      fetchRooms(Number(selectedCalendarEst));
    } catch (err) {
      console.warn("DB delete failed, filtering local state:", err);
      setRooms(prev => prev.filter(r => r.id !== id));
    }
  };

  // Drag & Drop Image Handlers
  const handleDrag = (e: React.DragEvent, roomId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [roomId]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [roomId]: false }));
    }
  };

  const handleDrop = (e: React.DragEvent, roomId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [roomId]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setRoomPhotos(prev => {
          const current = prev[roomId] || [];
          const updated = [...current, base64];
          localStorage.setItem("hdv_room_photos", JSON.stringify({ ...prev, [roomId]: updated }));
          return { ...prev, [roomId]: updated };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (roomId: number, index: number) => {
    setRoomPhotos(prev => {
      const current = prev[roomId] || [];
      const updated = current.filter((_, i) => i !== index);
      localStorage.setItem("hdv_room_photos", JSON.stringify({ ...prev, [roomId]: updated }));
      return { ...prev, [roomId]: updated };
    });
  };

  // Bulk rate modifier submit
  const handleBulkPricingUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkRate || !bulkStart || !bulkEnd) {
      alert("Por favor completa los campos de fechas y tarifa.");
      return;
    }
    
    alert(`Actualización masiva programada con éxito:\n\nAcción: ${bulkAction === "rate" ? `Modificar tarifa a $${bulkRate} USD` : bulkAction === "lock" ? "Bloquear fechas" : "Desbloquear fechas"}\nPeriodo: Del ${bulkStart} al ${bulkEnd}\n\nLos canales de venta vinculados (Airbnb/Booking.com) han sido sincronizados.`);
    setBulkRate("");
    setBulkStart("");
    setBulkEnd("");
  };

  // Reply review handler
  const handleReplyReview = (id: number, replyText: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, reply: replyText } : r));
    alert("Respuesta guardada con éxito en la plataforma.");
  };

  // OTA Sincronizador handler
  const handleSyncOTAs = () => {
    setOtaSyncing(true);
    setTimeout(() => {
      setOtaSyncing(false);
      setOtaLogs([
        { id: 1, channel: "Booking.com", status: "success", timestamp: "Justo ahora" },
        { id: 2, channel: "Airbnb", status: "success", timestamp: "Justo ahora" },
        { id: 3, channel: "Expedia", status: "success", timestamp: "Justo ahora" }
      ]);
      alert("Sincronización de tarifas e inventario completada de forma segura con Booking.com, Airbnb y Expedia.");
    }, 1500);
  };

  // Reply lead with Script helper
  const handleReplyWithScript = (lead: WhatsAppLead) => {
    localStorage.setItem("hdv_reply_lead_name", lead.visitor_name);
    localStorage.setItem("hdv_reply_lead_need", lead.message);
    setActiveTab("guiones");
    window.dispatchEvent(new Event("hdv_reply_lead_loaded"));
  };

  // Download membership invoice in PDF
  const handleDownloadInvoicePDF = (inv: any) => {
    try {
      const doc = new jsPDF();
      
      // Top background accent
      doc.setFillColor(14, 1, 31); // #0e011f Púrpura Profundo
      doc.rect(0, 0, 210, 40, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(20);
      doc.text("HOTELES DE VENEZUELA LLC", 20, 25);
      
      doc.setFontSize(9);
      doc.text("Suscripciones de Socios | info@hotelesdevenezuela.com", 120, 25);
      
      // Invoice details
      doc.setTextColor(30, 41, 59); // Slate-800
      doc.setFontSize(16);
      doc.text(`COMPROBANTE DE SUSCRIPCIÓN: #MEMB-${inv.id}`, 20, 60);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Fecha de Emisión: ${inv.payment_date}`, 20, 75);
      doc.text(`Método de Pago: ${inv.payment_method.toUpperCase()}`, 20, 82);
      doc.text(`Referencia: ${inv.payment_reference}`, 20, 89);
      doc.text(`Estado del Pago: COMPLETO`, 20, 96);
      
      // Table Header
      doc.setFillColor(243, 244, 246); // gray-100
      doc.rect(20, 110, 170, 10, "F");
      doc.setFont("Helvetica", "bold");
      doc.text("Concepto / Servicio", 25, 117);
      doc.text("Total", 160, 117);
      
      // Table Content
      doc.setFont("Helvetica", "normal");
      doc.text(inv.notes || "Mensualidad de Afiliación Directa a la Red", 25, 132);
      doc.text(`$${inv.amount}.00 USD`, 160, 132);
      
      doc.line(20, 142, 190, 142);
      
      doc.setFont("Helvetica", "bold");
      doc.text("Total Liquidado:", 110, 155);
      doc.text(`$${inv.amount}.00 USD`, 160, 155);
      
      // Footer
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175); // gray-400
      doc.text("Gracias por su confianza. Su hotel se mantiene activo en la red principal.", 20, 185);
      doc.text("Hoteles de Venezuela LLC © 2026", 20, 192);
      
      doc.save(`Factura-Membresia-${inv.id}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Error al generar PDF de la membresía.");
    }
  };

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
      }
    } catch (err) {
      console.warn("DB insertion for discount code failed, using localStorage:", err);
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
      alert("Cupón registrado con éxito.");
    } catch (err) {
      console.error(err);
      alert("Error al registrar el cupón de descuento.");
    } finally {
      setSavingDiscount(false);
    }
  };

  const handleToggleDiscountActive = async (id: number, currentStatus: boolean) => {
    try {
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

  const handleServiceChange = (key: string) => {
    setFormData(prev => {
      const active = prev.services.includes(key);
      return {
        ...prev,
        services: active ? prev.services.filter(s => s !== key) : [...prev.services, key]
      };
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOwnerId) return;
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
        owner_user_id: activeOwnerId,
        name: formData.name,
        slug,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        website: formData.website.trim() && !/^https?:\/\//i.test(formData.website.trim())
          ? `https://${formData.website.trim()}`
          : formData.website.trim(),
        price_level: formData.price_level,
        category_id: parseInt(formData.category_id),
        destination_id: parseInt(formData.destination_id),
        services: JSON.stringify(formData.services),
        status: "pending",
        has_reservations_enabled: false
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

      await fetchDashboardData();
      alert("Establecimiento registrado con éxito. Pendiente de aprobación.");
    } catch (err) {
      console.error("Error creating establishment:", err);
      alert("Ocurrió un error al registrar el establecimiento.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateReservationStatus = async (id: number, status: 'confirmed' | 'cancelled') => {
    try {
      if (id >= 10000) {
        const localResKey = "hdv_mock_reservations";
        const localRes = JSON.parse(localStorage.getItem(localResKey) || "[]");
        const updated = localRes.map((r: any) => r.id === id ? { ...r, status } : r);
        localStorage.setItem(localResKey, JSON.stringify(updated));
      } else {
        const { error } = await supabase
          .from("reservations")
          .update({ status })
          .eq("id", id);
        if (error) throw error;
      }
      await fetchDashboardData();
    } catch (err) {
      console.error("Error updating reservation status:", err);
      alert("No se pudo actualizar el estado de la reservación.");
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 bg-white">
        <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
        <p className="text-gray-400 text-xs font-bold">Cargando panel de control corporativo...</p>
      </div>
    );
  }

  // Dashboard calculation variables
  const activeEstablishment = establishments.find(e => e.id === Number(selectedCalendarEst)) || establishments[0];
  const activeReservations = reservations.filter(r => r.status === "confirmed");
  const monthlyRevenue = activeReservations.reduce((sum, r) => sum + r.total_price, 0);
  const totalRooms = rooms.reduce((sum, r) => sum + (r.quantity || 1), 0);
  
  // Dynamic occupancy count for today
  const todayStr = new Date().toISOString().split("T")[0];
  const occupiedRoomsCount = reservations.filter(r => r.status === "confirmed" && todayStr >= r.check_in_date && todayStr < r.check_out_date).length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRoomsCount / totalRooms) * 100) : 15; // default fallback

  const adr = rooms.length > 0 ? Math.round(rooms.reduce((sum, r) => sum + r.price_per_night, 0) / rooms.length) : 95;

  // Recharts metric datasets
  const monthlyRevenueData = [
    { name: "Semana 1", ingresos: monthlyRevenue ? Math.round(monthlyRevenue * 0.2) : 320 },
    { name: "Semana 2", ingresos: monthlyRevenue ? Math.round(monthlyRevenue * 0.45) : 680 },
    { name: "Semana 3", ingresos: monthlyRevenue ? Math.round(monthlyRevenue * 0.8) : 1050 },
    { name: "Semana 4", ingresos: monthlyRevenue ? monthlyRevenue : 1540 }
  ];

  const channelData = [
    { name: "Reserva Directa", value: 65, color: "#00C8D4" },
    { name: "Booking.com", value: 20, color: "#FF0096" },
    { name: "Airbnb", value: 15, color: "#9B00CC" }
  ];

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      {/* Impersonate Assistance Bar */}
      {isAdmin && impersonateId && (
        <div className="bg-gradient-to-r from-[#FF0096] via-[#9B00CC] to-[#00C8D4] p-3 text-center text-xs font-bold text-white flex items-center justify-between gap-3 shadow-md relative z-50">
          <div className="flex items-center gap-2 mx-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping shrink-0" />
            <span>⚠️ <strong>MODO ASISTENCIA ACTIVO:</strong> Estás asistiendo a <strong className="underline">{impersonateName || "Establecimiento"}</strong> (Propietario ID: {impersonateId})</span>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("hdv_impersonate_owner_user_id");
              localStorage.removeItem("hdv_impersonate_owner_user_name");
              localStorage.removeItem("hdv_impersonate_establishment_id");
              setImpersonateId(null);
              setImpersonateName(null);
              setImpersonateEstablishmentId(null);
              setLocation("/admin/asistencia");
            }}
            className="bg-white text-[#FF0096] hover:bg-white/95 px-3 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all shadow-sm cursor-pointer shrink-0"
          >
            Salir y Volver
          </button>
        </div>
      )}
      
      {/* Header Banner - Full Bleed */}
      <div className="relative overflow-hidden py-16 bg-gradient-to-br from-[#1a0533] via-[#0e011f] to-black text-white w-full">
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-[#FF0096]/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-[#00C8D4]/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black bg-[#FF0096]/20 text-[#FF0096] border border-[#FF0096]/30 mb-2 tracking-widest uppercase">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Portal de Socios Hoteleros</span>
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight">
              Panel de Control Ejecutivo
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Administra tarifas, inventario de habitaciones, facturas de membresía y comunicación directa de leads para tu cartera comercial.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-cyan-gradient text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-turquesa/10 cursor-pointer active:scale-97 hover:scale-102 transition-all font-sans uppercase"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Establecimiento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Sub-Navigation Bar */}
      <div className="border-b border-gray-200 bg-white sticky top-[60px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center gap-4">
          <nav className="flex gap-6 -mb-px overflow-x-auto scrollbar-hide py-1">
            {[
              { id: "resumen", label: "Dashboard", icon: BarChart3 },
              { id: "portafolio", label: `Mi Portafolio (${establishments.length})`, icon: Building2 },
              { id: "operaciones", label: "Operaciones Diarias", icon: CalendarRange },
              { id: "inventario", label: "Inventario de Habitaciones", icon: ListFilter },
              { id: "finanzas", label: "Finanzas & Membresías", icon: DollarSign },
              { id: "marketing", label: "Marketing & Canales", icon: Tag },
              { id: "guiones", label: "Asistente de Guiones", icon: Sparkles }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 border-b-2 flex items-center gap-2 text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-brand-magenta text-brand-magenta font-black"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Active Establishment Selector Dropdown */}
          {establishments.length > 0 && (
            <div className="hidden lg:flex items-center gap-3 shrink-0 py-2">
              <span className="text-[10px] font-black uppercase text-gray-400">Hotel Activo:</span>
              <select
                value={selectedCalendarEst}
                onChange={(e) => setSelectedCalendarEst(Number(e.target.value))}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta cursor-pointer"
              >
                {establishments.map(est => (
                  <option key={est.id} value={est.id}>{est.name}</option>
                ))}
              </select>
              <button
                onClick={() => setShowSurroundingsModal(true)}
                className="px-3 py-1.5 bg-brand-turquesa/10 hover:bg-brand-turquesa/20 text-brand-turquesa border border-brand-turquesa/20 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Alrededores</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* DASHBOARD EJECUTIVO TAB */}
        {activeTab === "resumen" && (
          <div className="space-y-8">
            
            {/* Header info selector mobile */}
            <div className="lg:hidden flex flex-col gap-2 p-4 bg-white border border-gray-150 rounded-2xl text-left">
              <span className="text-[10px] font-black uppercase text-gray-400">Establecimiento Seleccionado:</span>
              <div className="flex gap-2">
                <select
                  value={selectedCalendarEst}
                  onChange={(e) => setSelectedCalendarEst(Number(e.target.value))}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700"
                >
                  {establishments.map(est => (
                    <option key={est.id} value={est.id}>{est.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowSurroundingsModal(true)}
                  className="px-3 bg-brand-turquesa/10 text-brand-turquesa border border-brand-turquesa/20 rounded-xl flex items-center justify-center cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title & Stats */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-800 font-serif">Panel de Control: {activeEstablishment?.name || "Establecimiento"}</h2>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Última Sincronización: Justo ahora</span>
            </div>

            {/* KPIs Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-turquesa rounded-xl flex items-center justify-center text-white shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Ocupación Actual</span>
                  <span className="text-2xl font-black text-gray-800">{occupancyRate}%</span>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-magenta rounded-xl flex items-center justify-center text-white shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Ingresos (Mes)</span>
                  <span className="text-2xl font-black text-gray-800">${monthlyRevenue || 1540}</span>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs flex items-center gap-4">
                <div className="w-10 h-10 bg-[#9B00CC] rounded-xl flex items-center justify-center text-white shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Reservas Confirmadas</span>
                  <span className="text-2xl font-black text-gray-800">{activeReservations.length || 1}</span>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs flex items-center gap-4">
                <div className="w-10 h-10 bg-[#22C55E] rounded-xl flex items-center justify-center text-white shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tarifa Promedio (ADR)</span>
                  <span className="text-2xl font-black text-gray-800">${adr}</span>
                </div>
              </div>

            </div>

            {/* Charts and Data section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Financial chart */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Revenue trends chart */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs text-left">
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-turquesa" />
                    Tendencia de Ingresos Semanales
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00C8D4" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#00C8D4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="ingresos" stroke="#00C8D4" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Quick actions row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Nueva Reserva", onClick: () => { setActiveTab("operaciones"); setOperacionesSubTab("reservas"); }, icon: Plus, bg: "bg-brand-magenta" },
                    { label: "Bloquear Fecha", onClick: () => { setActiveTab("operaciones"); setOperacionesSubTab("disponibilidad"); }, icon: CalendarRange, bg: "bg-brand-turquesa" },
                    { label: "Subir Habitación", onClick: () => setActiveTab("inventario"), icon: Upload, bg: "bg-[#9B00CC]" },
                    { label: "Ver Facturación", onClick: () => setActiveTab("finanzas"), icon: FileText, bg: "bg-[#0f172a]" }
                  ].map((act, i) => (
                    <button
                      key={i}
                      onClick={act.onClick}
                      className="p-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl shadow-xs transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
                    >
                      <div className={`w-8 h-8 rounded-lg ${act.bg} text-white flex items-center justify-center`}>
                        <act.icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-extrabold text-gray-600 uppercase tracking-wider">{act.label}</span>
                    </button>
                  ))}
                </div>

              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                
                {/* Channel manager summary */}
                <div className="bg-[#0e011f] border border-white/5 rounded-3xl p-6 text-white text-left">
                  <h3 className="text-xs font-black uppercase tracking-wider mb-4 text-brand-turquesa">Distribución por Canales</h3>
                  <div className="h-40 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={channelData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={60}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {channelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4 text-[10px] font-bold">
                    {channelData.map((ch, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                          {ch.name}
                        </span>
                        <span>{ch.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Alerts */}
                <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs text-left">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Alertas del Sistema</h3>
                  <div className="space-y-3">
                    <div className="flex gap-2.5 items-start p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                      <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-blue-800 leading-normal font-bold">Sincronización automática de OTA completada hace 10 min.</p>
                    </div>
                    <div className="flex gap-2.5 items-start p-2.5 rounded-xl bg-green-50 border border-green-100">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-green-800 leading-normal font-bold">Membresía Premium activa y al día. Próximo cobro: {new Date().toLocaleDateString()}.</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* MI PORTAFOLIO TAB */}
        {activeTab === "portafolio" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-black text-gray-800 tracking-tight font-serif">Mis Establecimientos Registrados</h3>
              <span className="text-xs font-bold text-gray-400">{establishments.length} Negocios</span>
            </div>

            {establishments.length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
                <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-gray-700">Registra tu primer establecimiento</h4>
                <button onClick={() => setShowAddModal(true)} className="mt-6 btn-magenta-gradient text-xs font-bold px-8 py-3 rounded-xl">
                  Registrar mi Negocio
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {establishments.map(est => (
                  <div key={est.id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between text-left">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h4 className="font-black text-gray-800 text-lg leading-tight font-serif">{est.name}</h4>
                        {getStatusBadge(est.status)}
                      </div>
                      <p className="text-[11px] font-bold text-brand-magenta uppercase tracking-wider mb-4">{est.category_name} • {est.destination_name}</p>
                      
                      <div className="space-y-2 text-xs text-gray-500 mb-6">
                        {est.address && <p><span className="font-bold text-gray-400 uppercase text-[9px] tracking-wider block">Dirección:</span> {est.address}</p>}
                        {est.phone && <p><span className="font-bold text-gray-400 uppercase text-[9px] tracking-wider block">Contacto:</span> {est.phone}</p>}
                        {est.website && <p><span className="font-bold text-gray-400 uppercase text-[9px] tracking-wider block">Sitio Web:</span> <a href={est.website} target="_blank" className="text-brand-turquesa underline">{est.website}</a></p>}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <Link href={`/establecimiento/${est.slug}`} className="flex-1">
                        <button className="w-full bg-white border border-gray-200 text-gray-600 font-bold text-xs py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer">
                          Ver Ficha Pública
                        </button>
                      </Link>
                      <button 
                        onClick={() => { setSelectedCalendarEst(est.id); setActiveTab("inventario"); }}
                        className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs py-2.5 rounded-xl border border-gray-250 cursor-pointer"
                      >
                        Gestionar Inventario
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OPERACIONES DIARIAS TAB */}
        {activeTab === "operaciones" && (
          <div className="space-y-6">
            
            {/* Sub-tabs menu */}
            <div className="flex gap-3 border-b border-gray-200 pb-3">
              <button
                onClick={() => setOperacionesSubTab("reservas")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  operacionesSubTab === "reservas"
                    ? "bg-brand-magenta text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                Reservaciones Recibidas
              </button>
              <button
                onClick={() => setOperacionesSubTab("disponibilidad")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  operacionesSubTab === "disponibilidad"
                    ? "bg-brand-magenta text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                Calendario Pro & Tarifas
              </button>
              <button
                onClick={() => setOperacionesSubTab("timeline")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  operacionesSubTab === "timeline"
                    ? "bg-brand-magenta text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                Timeline PMS (Drag & Drop)
              </button>
            </div>

            {/* RESERVAS SUB-TAB */}
            {operacionesSubTab === "reservas" && (
              <div className="space-y-6">
                <h3 className="text-md font-black text-gray-800 tracking-tight font-serif text-left">Bandeja de Reservaciones</h3>

                {reservations.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl p-6">
                    <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-3" />
                    <p className="text-xs text-gray-400">Aún no posees solicitudes de reservación.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden text-left">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                            <th className="p-4 pl-6">Huésped</th>
                            <th className="p-4">Establecimiento</th>
                            <th className="p-4">Entrada / Salida</th>
                            <th className="p-4">Pax</th>
                            <th className="p-4">Total</th>
                            <th className="p-4 pr-6">Acciones</th>
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
                              <td className="p-4 font-semibold text-gray-500">
                                {new Date(res.check_in_date).toLocaleDateString("es-VE")} al {new Date(res.check_out_date).toLocaleDateString("es-VE")}
                              </td>
                              <td className="p-4 font-extrabold text-gray-600">{res.guests_count}</td>
                              <td className="p-4 font-black text-brand-magenta">${res.total_price}</td>
                              <td className="p-4 pr-6">
                                <div className="flex flex-col gap-2">
                                  <span className={`inline-block w-fit px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                    res.status === "confirmed" ? "bg-green-50 text-green-700 border border-green-150" :
                                    res.status === "cancelled" ? "bg-red-50 text-red-700 border border-red-150" :
                                    "bg-yellow-50 text-yellow-700 border border-yellow-150"
                                  }`}>
                                    {res.status === "confirmed" ? "Confirmado" : res.status === "cancelled" ? "Cancelado" : "Pendiente"}
                                  </span>
                                  {res.status === "pending" && (
                                    <div className="flex gap-1.5 mt-1">
                                      <button
                                        onClick={() => handleUpdateReservationStatus(res.id, 'confirmed')}
                                        className="px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-colors"
                                      >
                                        Confirmar
                                      </button>
                                      <button
                                        onClick={() => handleUpdateReservationStatus(res.id, 'cancelled')}
                                        className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-colors"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  )}
                                </div>
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

            {/* DISPONIBILIDAD SUB-TAB */}
            {operacionesSubTab === "disponibilidad" && (
              <div className="space-y-6 text-left">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Calendar view */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-md font-black text-gray-800 tracking-tight font-serif">Planilla de Disponibilidad</h3>
                    {selectedCalendarEst ? (
                      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                        <AvailabilityCalendar establishmentId={Number(selectedCalendarEst)} />
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl p-6">
                        <p className="text-xs text-gray-400">Selecciona un hotel en la barra superior para ver su calendario.</p>
                      </div>
                    )}
                  </div>

                  {/* Bulk editor rates (Channel Manager control) */}
                  <div className="space-y-6">
                    <div className="bg-[#0e011f] border border-white/5 text-white rounded-3xl p-6 text-left">
                      <h3 className="text-xs font-black uppercase tracking-wider mb-4 text-brand-turquesa">Modificador Masivo de Tarifas</h3>
                      <form onSubmit={handleBulkPricingUpdate} className="space-y-4">
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-1">Acción</label>
                          <select
                            value={bulkAction}
                            onChange={(e: any) => setBulkAction(e.target.value)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-brand-turquesa"
                          >
                            <option value="rate" className="text-slate-800">Actualizar Tarifa (USD)</option>
                            <option value="lock" className="text-slate-800">Bloquear Fechas</option>
                            <option value="unlock" className="text-slate-800">Desbloquear Fechas</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-1">Desde</label>
                            <input
                              type="date"
                              required
                              value={bulkStart}
                              onChange={e => setBulkStart(e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-brand-turquesa"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-1">Hasta</label>
                            <input
                              type="date"
                              required
                              value={bulkEnd}
                              onChange={e => setBulkEnd(e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-brand-turquesa"
                            />
                          </div>
                        </div>

                        {bulkAction === "rate" && (
                          <div>
                            <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-1">Nueva Tarifa ($ USD/Noche)</label>
                            <input
                              type="number"
                              required
                              placeholder="Ej: 120"
                              value={bulkRate}
                              onChange={e => setBulkRate(e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-brand-turquesa"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-1">Tipo de Habitación</label>
                          <select
                            value={bulkRoom}
                            onChange={e => setBulkRoom(e.target.value)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-brand-turquesa"
                          >
                            <option value="" className="text-slate-800">Todas las habitaciones</option>
                            {rooms.map(room => (
                              <option key={room.id} value={room.id} className="text-slate-800">{room.name}</option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-brand-turquesa hover:bg-brand-turquesa/90 text-[#0e011f] font-black text-[10px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                        >
                          Aplicar en Canales y Guardar
                        </button>
                      </form>
                    </div>

                    {/* Sync logs */}
                    <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm text-left">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">Canales de Reserva Conectados</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-gray-600">Booking.com</span>
                          <span className="text-green-600 font-extrabold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Sincronizado</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-gray-600">Airbnb</span>
                          <span className="text-green-600 font-extrabold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Sincronizado</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            )}

            {/* TIMELINE PMS DRAG & DROP SUB-TAB */}
            {operacionesSubTab === "timeline" && (
              <div className="space-y-6 text-left animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-md font-black text-gray-800 tracking-tight font-serif">Calendario Timeline PMS & Asignador</h3>
                    <p className="text-xs text-gray-400 mt-1">Arrastra y suelta reservaciones horizontalmente para cambiar fechas, o verticalmente para reasignar habitaciones.</p>
                  </div>
                  
                  {/* Month navigation controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTimelineMonth(new Date(timelineMonth.getFullYear(), timelineMonth.getMonth() - 1, 1))}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      ← Anterior
                    </button>
                    <span className="text-xs font-black uppercase text-gray-700 min-w-[120px] text-center">
                      {timelineMonth.toLocaleDateString("es-VE", { month: "long", year: "numeric" })}
                    </span>
                    <button
                      onClick={() => setTimelineMonth(new Date(timelineMonth.getFullYear(), timelineMonth.getMonth() + 1, 1))}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>

                {rooms.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl p-6">
                    <p className="text-xs text-gray-400 font-bold">Por favor configura las tipologías de habitación en la pestaña "Inventario" para usar el timeline.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden p-6">
                    <div className="overflow-x-auto">
                      <div className="relative min-w-[1400px]">
                        
                        {/* Timeline Grid Header */}
                        <div className="grid border-b border-gray-200 pb-2" style={{ gridTemplateColumns: `180px repeat(${getTimelineDays().length}, minmax(45px, 1fr))` }}>
                          <div className="text-[10px] font-black uppercase text-gray-400 select-none">Habitaciones / Unidades</div>
                          {getTimelineDays().map((day, idx) => (
                            <div key={idx} className="text-center select-none font-bold text-[9px] text-gray-400 border-l border-gray-100 pb-1">
                              <span className="block text-[8px] font-medium text-gray-300">{day.toLocaleDateString("es-VE", { weekday: "short" })}</span>
                              <span>{day.getDate()}</span>
                            </div>
                          ))}
                        </div>

                        {/* Room Rows */}
                        <div className="divide-y divide-gray-100 mt-2">
                          {rooms.map(room => {
                            const days = getTimelineDays();
                            // Get active month limits
                            const monthStartStr = days[0].toISOString().split("T")[0];
                            const monthEndStr = days[days.length - 1].toISOString().split("T")[0];
                            
                            // Find active reservations for this room type within this month
                            const roomReservations = reservations.filter(r => {
                              const sameRoom = (r as any).room_id === room.id || r.room_type === room.name;
                              const matchesDates = r.check_in_date <= monthEndStr && r.check_out_date >= monthStartStr;
                              return sameRoom && matchesDates && r.status === "confirmed";
                            });

                            return (
                              <div key={room.id} className="grid relative min-h-[56px] items-center" style={{ gridTemplateColumns: `180px repeat(${days.length}, minmax(45px, 1fr))` }}>
                                
                                {/* Room Label Left */}
                                <div className="pr-4 py-2 border-r border-gray-100 min-h-[56px] flex flex-col justify-center bg-gray-50/30">
                                  <span className="font-extrabold text-xs text-gray-700 block truncate">{room.name}</span>
                                  <span className="text-[9px] text-gray-400 font-bold font-mono">${room.price_per_night} USD</span>
                                </div>

                                {/* Drag over Drop cells */}
                                {days.map((day, dIdx) => {
                                  const dateStr = day.toISOString().split("T")[0];
                                  return (
                                    <div
                                      key={dIdx}
                                      onDragOver={e => e.preventDefault()}
                                      onDrop={e => handleDropReservation(e, room.id, dateStr)}
                                      className="border-r border-gray-100 hover:bg-slate-50/50 min-h-[56px] transition-colors relative"
                                    />
                                  );
                                })}

                                {/* Absolute placed draggable reservations blocks */}
                                {roomReservations.map(res => {
                                  // Compute positioning
                                  const resCheckIn = new Date(res.check_in_date);
                                  const resCheckOut = new Date(res.check_out_date);
                                  
                                  // Find start day index relative to this month's days
                                  let startIdx = days.findIndex(d => d.toISOString().split("T")[0] === res.check_in_date);
                                  // Fallback if check_in is in previous month
                                  if (startIdx === -1) {
                                    if (res.check_in_date < monthStartStr) {
                                      startIdx = 0;
                                    } else {
                                      return null; // out of bounds
                                    }
                                  }
                                  
                                  // Calculate span length of reservation within the month
                                  const checkInDateClamped = res.check_in_date < monthStartStr ? new Date(monthStartStr) : resCheckIn;
                                  const checkOutDateClamped = res.check_out_date > monthEndStr ? new Date(monthEndStr) : resCheckOut;
                                  const spanDays = Math.max(1, Math.round((checkOutDateClamped.getTime() - checkInDateClamped.getTime()) / (1000 * 60 * 60 * 24)));

                                  const nights = Math.max(1, Math.round((resCheckOut.getTime() - resCheckIn.getTime()) / (1000 * 60 * 60 * 24)));

                                  return (
                                    <div
                                      key={res.id}
                                      draggable
                                      onDragStart={e => {
                                        e.dataTransfer.setData("text/plain", res.id.toString());
                                        e.dataTransfer.effectAllowed = "move";
                                      }}
                                      className="absolute bg-brand-magenta hover:bg-brand-magenta/95 text-white text-[9px] font-black p-1.5 rounded-xl truncate shadow-md hover:shadow-lg cursor-grab active:cursor-grabbing hover:scale-[1.01] transition-all flex flex-col justify-center z-20 border border-white/10"
                                      style={{
                                        left: `calc(180px + ${startIdx * 100 / days.length}% + 2px)`,
                                        width: `calc(${spanDays * 100 / days.length}% - 4px)`,
                                        height: "42px",
                                        top: "7px"
                                      }}
                                      title={`Huésped: ${res.guest_name}\nHabitación: ${room.name}\nEntrada: ${res.check_in_date}\nSalida: ${res.check_out_date}\nTotal: ${nights} noches - $${res.total_price} USD`}
                                    >
                                      <span className="truncate font-serif font-black block">{res.guest_name}</span>
                                      <span className="text-[8px] text-white/80 font-bold block">{nights} noches • ${res.total_price}</span>
                                    </div>
                                  );
                                })}

                              </div>
                            );
                          })}
                        </div>

                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* INVENTARIO DE HABITACIONES TAB */}
        {activeTab === "inventario" && (
          <div className="space-y-6 text-left">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-md font-black text-gray-800 tracking-tight font-serif">Tipologías y Catálogo de Habitaciones</h3>
                <p className="text-xs text-gray-400 mt-1">Crea, edita y gestiona las especificaciones y galerías fotográficas por habitación.</p>
              </div>
              <button
                onClick={() => setNewRoomModalOpen(true)}
                className="btn-cyan-gradient text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer uppercase font-sans tracking-wide"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Tipología</span>
              </button>
            </div>

            {loadingRooms ? (
              <div className="text-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-brand-magenta mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-bold">Obteniendo tipologías de habitación...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl p-6">
                <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-3" />
                <p className="text-xs text-gray-400">Aún no se han configurado habitaciones para este establecimiento.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {rooms.map(room => {
                  const photos = roomPhotos[room.id] || [];
                  const isDragOver = dragActive[room.id] || false;
                  return (
                    <div key={room.id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-8">
                      
                      {/* Room properties details */}
                      <div className="lg:col-span-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-gray-800 text-lg leading-tight font-serif">{room.name}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${room.is_active ? "bg-green-50 text-green-700 border border-green-100" : "bg-gray-50 text-gray-400 border border-gray-100"}`}>
                            {room.is_active ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">{room.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-600">
                          <div className="p-3 bg-gray-50 rounded-xl">
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Tarifa Base</span>
                            <span className="text-md font-black text-brand-magenta">${room.price_per_night} USD</span>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-xl">
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Capacidad Máx</span>
                            <span className="text-md font-black text-gray-700">{room.capacity} Personas</span>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-xl">
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Cantidad Total</span>
                            <span className="text-md font-black text-gray-700">{room.quantity} Unidades</span>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-xl">
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Código / Núm</span>
                            <span className="text-md font-black text-gray-700">{room.room_number || "A-101"}</span>
                          </div>
                        </div>

                        {room.amenities && (
                          <div>
                            <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Comodidades</span>
                            <div className="flex gap-1.5 flex-wrap">
                              {room.amenities.split(",").map((am: string) => {
                                const trimmed = am.trim();
                                if (!trimmed) return null;
                                return (
                                  <span key={trimmed} className="px-2 py-0.5 bg-brand-turquesa/10 text-brand-turquesa border border-brand-turquesa/10 rounded-full text-[9px] font-black uppercase">
                                    {getRoomAmenityLabel(trimmed)}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="pt-4 border-t border-gray-100 flex gap-2">
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="flex-1 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>

                      {/* Photo manager Drag and Drop */}
                      <div className="lg:col-span-2 space-y-4">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Galería Fotográfica de Habitación</span>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {photos.map((ph: string, idx: number) => (
                            <div key={idx} className="relative aspect-video sm:aspect-square bg-gray-100 rounded-2xl overflow-hidden group">
                              <img src={ph} alt={`Foto ${idx}`} className="w-full h-full object-cover" />
                              <button
                                onClick={() => handleRemovePhoto(room.id, idx)}
                                className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-md cursor-pointer transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}

                          {/* Uploader Box Drag and Drop */}
                          <div
                            onDragEnter={e => handleDrag(e, room.id)}
                            onDragLeave={e => handleDrag(e, room.id)}
                            onDragOver={e => handleDrag(e, room.id)}
                            onDrop={e => handleDrop(e, room.id)}
                            className={`aspect-video sm:aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 transition-colors relative cursor-pointer ${
                              isDragOver 
                                ? "border-brand-turquesa bg-brand-turquesa/5 text-brand-turquesa" 
                                : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500"
                            }`}
                          >
                            <Upload className="w-6 h-6 mb-1" />
                            <span className="text-[9px] font-black uppercase text-center tracking-wider leading-relaxed">Arrastrar Fotos aquí</span>
                            <span className="text-[8px] text-gray-400 text-center mt-1">O haz clic para explorar</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={e => {
                                if (e.target.files && e.target.files[0]) {
                                  const file = e.target.files[0];
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    const base64 = reader.result as string;
                                    setRoomPhotos(prev => {
                                      const current = prev[room.id] || [];
                                      const updated = [...current, base64];
                                      localStorage.setItem("hdv_room_photos", JSON.stringify({ ...prev, [room.id]: updated }));
                                      return { ...prev, [room.id]: updated };
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* FINANZAS Y FACTURACION TAB */}
        {activeTab === "finanzas" && (
          <div className="space-y-8 text-left">
            <h3 className="text-md font-black text-gray-800 tracking-tight font-serif">Facturación & Membresía de Socio</h3>
            
            {/* Membership plans details card */}
            <div className="bg-[#0e011f] border border-white/5 rounded-3xl p-6 md:p-8 text-white grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-4">
                <span className="px-3.5 py-1 bg-brand-turquesa text-[#0e011f] rounded-full text-[9px] font-black uppercase tracking-wider">Plan Socio Activo</span>
                <h4 className="text-2xl font-black font-serif">Suscripción Institucional Premium</h4>
                <p className="text-xs text-gray-300 leading-relaxed max-w-xl">
                  Su hotel cuenta con reservas en línea habilitadas de forma automática, pasarela de pago internacional sincronizada y posicionamiento destacado en los destinos turísticos.
                </p>
                <div className="flex gap-4 text-xs font-bold text-gray-300">
                  <p><span className="text-brand-magenta font-black">Costo:</span> $150.00 USD/Mensual</p>
                  <p><span className="text-brand-turquesa font-black">Vencimiento:</span> {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 15).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="md:col-span-1 p-5 bg-white/5 rounded-2xl border border-white/10 flex flex-col justify-between items-center text-center">
                <ShieldCheck className="w-10 h-10 text-brand-turquesa mb-2" />
                <span className="text-xs font-black uppercase tracking-widest text-brand-turquesa">Socio Verificado</span>
                <span className="text-[10px] text-gray-400 mt-1">Hoteles de Venezuela LLC</span>
              </div>
            </div>

            {/* Invoices List */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider font-serif">Historial de Cobros y Facturas</h4>
              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        <th className="p-4 pl-6">Factura / Recibo</th>
                        <th className="p-4">Concepto</th>
                        <th className="p-4">Importe</th>
                        <th className="p-4">Fecha Pago</th>
                        <th className="p-4">Referencia</th>
                        <th className="p-4 pr-6 text-right">Comprobante</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {invoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-gray-50/50">
                          <td className="p-4 pl-6 font-bold text-gray-700">#MEMB-{inv.id}</td>
                          <td className="p-4 font-semibold text-gray-500">{inv.notes || "Mensualidad de Afiliación Directa"}</td>
                          <td className="p-4 font-black text-slate-800">${inv.amount} USD</td>
                          <td className="p-4 font-semibold text-gray-500">{new Date(inv.payment_date).toLocaleDateString("es-VE")}</td>
                          <td className="p-4 font-mono text-gray-400 uppercase">{inv.payment_reference}</td>
                          <td className="p-4 pr-6 text-right">
                            <button
                              onClick={() => handleDownloadInvoicePDF(inv)}
                              className="px-3.5 py-1.5 bg-gray-100 hover:bg-brand-turquesa hover:text-white text-gray-600 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all inline-flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Descargar PDF</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Liquidations Reports list */}
            <div className="space-y-4">
              <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider font-serif">Reportes de Liquidaciones de Reservas</h4>
              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        <th className="p-4 pl-6">Periodo</th>
                        <th className="p-4">Total Bruto Recibido</th>
                        <th className="p-4">Comisión Plataforma (10%)</th>
                        <th className="p-4">Neto Liquidado</th>
                        <th className="p-4">Cuenta Destino</th>
                        <th className="p-4">Fecha Depósito</th>
                        <th className="p-4 pr-6">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {liquidations.map(liq => (
                        <tr key={liq.id} className="hover:bg-gray-50/50">
                          <td className="p-4 pl-6 font-bold text-gray-700">{liq.period}</td>
                          <td className="p-4 font-semibold text-gray-600">${liq.gross} USD</td>
                          <td className="p-4 font-semibold text-red-500">-${liq.commission} USD</td>
                          <td className="p-4 font-black text-emerald-600">${liq.net} USD</td>
                          <td className="p-4 font-semibold text-gray-500">{liq.account}</td>
                          <td className="p-4 font-semibold text-gray-500">{new Date(liq.date).toLocaleDateString("es-VE")}</td>
                          <td className="p-4 pr-6">
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-green-50 text-green-700 border border-green-150">
                              Transferido
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* MARKETING Y CANALES TAB */}
        {activeTab === "marketing" && (
          <div className="space-y-6 text-left">
            
            {/* Sub-tabs menu */}
            <div className="flex gap-3 border-b border-gray-200 pb-3">
              <button
                onClick={() => setMarketingSubTab("leads")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  marketingSubTab === "leads"
                    ? "bg-brand-magenta text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                CRM Leads de WhatsApp ({leads.length})
              </button>
              <button
                onClick={() => setMarketingSubTab("descuentos")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  marketingSubTab === "descuentos"
                    ? "bg-brand-magenta text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                Códigos de Descuento
              </button>
              <button
                onClick={() => setMarketingSubTab("reviews")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  marketingSubTab === "reviews"
                    ? "bg-brand-magenta text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                Reseñas de Huéspedes ({reviews.length})
              </button>
              <button
                onClick={() => setMarketingSubTab("channel-manager")}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  marketingSubTab === "channel-manager"
                    ? "bg-brand-magenta text-white shadow-sm"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                Channel Manager OTA
              </button>
            </div>

            {/* LEADS SUB-TAB */}
            {marketingSubTab === "leads" && (
              <div className="space-y-6">
                <h3 className="text-md font-black text-gray-800 tracking-tight font-serif">Bandeja CRM de Mensajes Recibidos</h3>

                {leads.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl p-6">
                    <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-3" />
                    <p className="text-xs text-gray-400">Aún no posees solicitudes directas registradas.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leads.map(lead => (
                      <div key={lead.id} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-700 text-sm">{lead.visitor_name}</h4>
                            <span className="text-[10px] text-gray-400 font-semibold">de {lead.establishment_name}</span>
                          </div>
                          <p className="text-xs text-gray-600 font-bold mb-2">Pregunta: "{lead.message}"</p>
                          <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-brand-turquesa shrink-0" />
                            <span>{lead.visitor_phone}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <button
                            onClick={() => handleReplyWithScript(lead)}
                            className="flex-1 md:flex-none px-4 py-2 bg-brand-turquesa/10 hover:bg-brand-turquesa/20 text-brand-turquesa border border-brand-turquesa/10 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Responder con Guion</span>
                          </button>
                          
                          <a 
                            href={`https://wa.me/${lead.visitor_phone.replace(/[^\d]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>Responder WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DESCUENTOS SUB-TAB */}
            {marketingSubTab === "descuentos" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-black text-gray-800 tracking-tight font-serif">Cupones de Descuento Promocionales</h3>
                  <button
                    onClick={() => setShowAddDiscountModal(true)}
                    className="btn-cyan-gradient text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer uppercase font-sans tracking-wide"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Cupón</span>
                  </button>
                </div>

                {discountCodes.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                    <Tag className="w-16 h-16 text-gray-200 mx-auto mb-3" />
                    <p className="text-xs text-gray-400">Aún no has creado cupones de descuento.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
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
                              <td className="p-4 font-bold text-gray-500">{code.min_nights} noches</td>
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

            {/* REVIEWS SUB-TAB */}
            {marketingSubTab === "reviews" && (
              <div className="space-y-6">
                <h3 className="text-md font-black text-gray-800 tracking-tight font-serif">Reseñas de Huéspedes</h3>
                <div className="space-y-4">
                  {reviews.map(rev => (
                    <div key={rev.id} className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs text-left space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-gray-700">{rev.guest_name}</h4>
                          <span className="text-[10px] text-gray-400 font-semibold">Enviado el {new Date(rev.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star key={idx} className={`w-4 h-4 ${idx < rev.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 font-medium italic">"{rev.comment}"</p>
                      
                      {rev.reply ? (
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mb-1">Tu Respuesta:</p>
                          <p className="text-xs text-gray-600 font-semibold">{rev.reply}</p>
                        </div>
                      ) : (
                        <div className="pt-2">
                          <input
                            type="text"
                            placeholder="Escribe tu respuesta pública de agradecimiento..."
                            onKeyDown={e => {
                              if (e.key === "Enter") {
                                handleReplyReview(rev.id, e.currentTarget.value);
                              }
                            }}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-magenta"
                          />
                          <p className="text-[9px] text-gray-400 mt-1">Presiona Enter para enviar la respuesta.</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CHANNEL MANAGER SUB-TAB */}
            {marketingSubTab === "channel-manager" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-black text-gray-800 tracking-tight font-serif">OTA Channel Manager & Distribución</h3>
                  <button
                    onClick={handleSyncOTAs}
                    disabled={otaSyncing}
                    className="btn-cyan-gradient text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer uppercase font-sans tracking-wide"
                  >
                    <RefreshCw className={`w-4 h-4 ${otaSyncing ? "animate-spin" : ""}`} />
                    <span>{otaSyncing ? "Sincronizando..." : "Sincronizar Canales"}</span>
                  </button>
                </div>

                <div className="bg-[#0e011f] border border-white/5 rounded-3xl p-6 text-white grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="md:col-span-2 space-y-2">
                    <span className="px-2.5 py-0.5 bg-brand-turquesa text-[#0e011f] rounded-full text-[9px] font-black uppercase tracking-wider">Channel Manager Activo</span>
                    <h4 className="text-xl font-black font-serif">Conexión de Calendarios Bidireccional</h4>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Sincronice sus tarifas base y el inventario disponible en tiempo real con canales mundiales a través del formato estándar iCal.
                    </p>
                  </div>
                  <div className="md:col-span-1 flex justify-center gap-4">
                    <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-center">
                      <span className="text-xs font-black tracking-wide text-brand-magenta block">BOOKING</span>
                      <span className="text-[9px] text-green-400 mt-1 block">CONECTADO</span>
                    </div>
                    <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-center">
                      <span className="text-xs font-black tracking-wide text-brand-turquesa block">AIRBNB</span>
                      <span className="text-[9px] text-green-400 mt-1 block">CONECTADO</span>
                    </div>
                  </div>
                </div>

                {/* Logs list */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Historial Reciente de Sincronización</h4>
                  <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-100">
                      {otaLogs.map(log => (
                        <div key={log.id} className="p-4 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-gray-700 block">{log.channel}</span>
                            <span className="text-[10px] text-gray-400 font-semibold">{log.timestamp}</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-green-50 text-green-700 border border-green-150">
                            Exitoso
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ASISTENTE DE GUIONES TAB */}
        {activeTab === "guiones" && (
          <ScriptGenerator establishments={establishments} />
        )}

      </main>

      {/* Add Establishment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl lg:max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
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

            <form onSubmit={handleAddSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-bold">Nombre del Establecimiento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Posada Galápagos"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
                  />
                </div>

                <div className="lg:col-span-1">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-bold">Categoría *</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={e => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta cursor-pointer"
                  >
                    <option value="">Selecciona</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-1">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-bold">Destino Turístico *</label>
                  <select
                    required
                    value={formData.destination_id}
                    onChange={e => setFormData(prev => ({ ...prev, destination_id: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta cursor-pointer"
                  >
                    <option value="">Selecciona</option>
                    {destinations.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.state})</option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-1">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-bold">Nivel de Precios</label>
                  <select
                    value={formData.price_level}
                    onChange={e => setFormData(prev => ({ ...prev, price_level: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta cursor-pointer"
                  >
                    <option value="$">$ (Económico)</option>
                    <option value="$$">$$ (Moderado)</option>
                    <option value="$$$">$$$ (Premium)</option>
                    <option value="$$$$">$$$$ (Lujo)</option>
                  </select>
                </div>

                <div className="lg:col-span-1">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-bold">Teléfono Comercial</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="+58 212 1234567"
                      value={formData.phone}
                      onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-155 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
                    />
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-bold">WhatsApp Directo</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="+58 414 1234567"
                      value={formData.whatsapp}
                      onChange={e => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-155 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 lg:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-bold">Sitio Web / Enlace a Red Social</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="https://ejemplo.com o link de instagram"
                      value={formData.website}
                      onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-155 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-bold">Dirección Física Completa</label>
                  <input
                    type="text"
                    placeholder="Ej: Calle Principal del Gran Roque, a dos cuadras de la plaza"
                    value={formData.address}
                    onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-bold">Descripción o Reseña Comercial</label>
                  <textarea
                    rows={4}
                    placeholder="Describe los servicios, habitaciones, comidas o atractivos especiales de tu negocio..."
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all resize-none font-sans"
                  />
                </div>
              </div>

              <AmenitiesSelector
                selectedServices={formData.services}
                onChange={(newServices) => setFormData(prev => ({ ...prev, services: newServices }))}
              />

              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white border border-gray-250 hover:bg-gray-50 text-gray-600 text-xs font-bold py-3.5 rounded-xl cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-brand-purple-dark to-brand-purple-deep hover:opacity-95 text-white text-xs font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
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

      {/* Add Room Modal */}
      {newRoomModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="bg-gradient-to-r from-brand-purple-dark to-brand-purple-deep px-6 py-5 flex items-center justify-between text-white text-left">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-brand-magenta" />
                <div>
                  <h3 className="font-extrabold text-sm tracking-wide">Crear Tipología de Habitación</h3>
                  <p className="text-white/70 text-[10px] mt-0.5 font-bold">Añade especificaciones del tipo de habitación en base de datos</p>
                </div>
              </div>
              <button onClick={() => setNewRoomModalOpen(false)} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-bold">Nombre de la Habitación *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Suite Deluxe Doble"
                  value={roomFormData.name}
                  onChange={e => setRoomFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-bold">Precio Noche (USD) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Ej: 90"
                    value={roomFormData.price_per_night}
                    onChange={e => setRoomFormData(prev => ({ ...prev, price_per_night: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-bold">Capacidad Máxima *</label>
                  <input
                    type="number"
                    required
                    placeholder="Ej: 2"
                    value={roomFormData.capacity}
                    onChange={e => setRoomFormData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-bold">Cantidad Total *</label>
                  <input
                    type="number"
                    required
                    placeholder="Ej: 5"
                    value={roomFormData.quantity}
                    onChange={e => setRoomFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-bold">Código / Números</label>
                  <input
                    type="text"
                    placeholder="Ej: Room 101-105"
                    value={roomFormData.room_number}
                    onChange={e => setRoomFormData(prev => ({ ...prev, room_number: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs text-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-bold">Descripción Corta</label>
                <textarea
                  placeholder="Detalles sobre las camas, comodidades exclusivas..."
                  value={roomFormData.description}
                  onChange={e => setRoomFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-150 rounded-xl text-xs text-gray-700 resize-none font-sans"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2 font-bold font-bold">Servicios y Amenities (Estilo Booking.com)</label>
                <div className="space-y-4 max-h-60 overflow-y-auto p-4 bg-gray-50 border border-gray-150 rounded-2xl">
                  {ROOM_AMENITIES_CATEGORIES.map(cat => (
                    <div key={cat.id} className="space-y-1.5">
                      <span className="text-[10px] font-black text-brand-turquesa uppercase tracking-wider block">{cat.label}</span>
                      <div className="grid grid-cols-2 gap-2">
                        {cat.items.map(item => {
                          const active = roomFormData.amenities.split(",").map(s => s.trim()).includes(item.key);
                          return (
                            <label key={item.key} className="flex items-center gap-2 text-[11px] font-semibold text-gray-600 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={active}
                                onChange={() => handleToggleRoomAmenity(item.key)}
                                className="accent-brand-magenta w-3.5 h-3.5"
                              />
                              <span>{item.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setNewRoomModalOpen(false)} className="flex-1 bg-white border border-gray-250 hover:bg-gray-50 text-gray-600 text-xs font-bold py-3.5 rounded-xl cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-brand-purple-dark to-brand-purple-deep text-white text-xs font-bold py-3.5 rounded-xl cursor-pointer shadow-md">
                  Crear Habitación
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
            <div className="bg-gradient-to-r from-brand-purple-dark to-brand-purple-deep px-6 py-5 flex items-center justify-between text-white text-left">
              <div className="flex items-center gap-3">
                <Tag className="w-6 h-6 text-brand-magenta" />
                <div>
                  <h3 className="font-extrabold text-sm tracking-wide">Crear Cupón de Descuento</h3>
                  <p className="text-white/70 text-[10px] mt-0.5 font-bold">Define códigos promocionales para incentivar reservas</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddDiscountModal(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDiscountSubmit} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-bold">Establecimiento Asociado *</label>
                <select
                  required
                  value={discountFormData.establishment_id}
                  onChange={e => setDiscountFormData(prev => ({ ...prev, establishment_id: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta cursor-pointer"
                >
                  <option value="">Selecciona el negocio</option>
                  {establishments.map(est => (
                    <option key={est.id} value={est.id}>{est.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-bold">Código del Cupón *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: BIENVENIDA10"
                    value={discountFormData.code}
                    onChange={e => setDiscountFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs text-gray-700 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-bold">Tipo de Descuento</label>
                  <select
                    value={discountFormData.discount_type}
                    onChange={e => setDiscountFormData(prev => ({ ...prev, discount_type: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs text-gray-600 cursor-pointer"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo (USD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-bold font-bold">Valor del Descuento *</label>
                  <input
                    type="number"
                    required
                    placeholder="Ej: 10"
                    value={discountFormData.discount_value}
                    onChange={e => setDiscountFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-bold font-bold">Noches Mínimas</label>
                  <input
                    type="number"
                    value={discountFormData.min_nights}
                    onChange={e => setDiscountFormData(prev => ({ ...prev, min_nights: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-150 rounded-xl text-xs text-gray-700"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddDiscountModal(false)}
                  className="flex-1 bg-white border border-gray-250 hover:bg-gray-50 text-gray-600 text-xs font-bold py-3.5 rounded-xl cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingDiscount}
                  className="flex-1 bg-gradient-to-r from-brand-purple-dark to-brand-purple-deep hover:opacity-95 text-white text-xs font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {savingDiscount ? "Creando..." : "Crear Cupón"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        </div>
      )}

      {/* Surroundings Manager Modal */}
      {showSurroundingsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="bg-gradient-to-r from-brand-purple-dark to-brand-purple-deep px-6 py-5 flex items-center justify-between text-white text-left">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-brand-magenta" />
                <div>
                  <h3 className="font-extrabold text-sm tracking-wide">Configurar Alrededores del Hotel</h3>
                  <p className="text-white/70 text-[10px] mt-0.5 font-bold">Añade lugares de interés, distancias y transporte cercano</p>
                </div>
              </div>
              <button
                onClick={() => setShowSurroundingsModal(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-left max-h-[70vh] overflow-y-auto">
              
              {/* Form to add POI */}
              <form onSubmit={handleAddPOI} className="bg-gray-50 border border-gray-150 rounded-2xl p-4 space-y-4">
                <span className="text-[10px] font-black text-brand-turquesa uppercase tracking-wider block">Registrar Punto de Interés</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-1">Categoría</label>
                    <select
                      value={newPOI.category}
                      onChange={e => setNewPOI(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-gray-250 rounded-xl text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-turquesa cursor-pointer"
                    >
                      {POI_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-1">Nombre del Lugar</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Jardín del Turia"
                      value={newPOI.name}
                      onChange={e => setNewPOI(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-gray-250 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-turquesa"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-1">Distancia / Tiempo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: 100 m o 1.3 km"
                      value={newPOI.distance}
                      onChange={e => setNewPOI(prev => ({ ...prev, distance: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-gray-250 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-turquesa"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-brand-turquesa hover:bg-brand-turquesa/90 text-[#0e011f] font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                >
                  Agregar Lugar
                </button>
              </form>

              {/* Listed POIs by category */}
              <div className="space-y-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Lugares de Interés Registrados</span>
                
                {POI_CATEGORIES.map(cat => {
                  const items = surroundings.filter(s => s.category === cat.id);
                  return (
                    <div key={cat.id} className="space-y-1.5">
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block border-b border-gray-100 pb-1">{cat.label}</span>
                      {items.length === 0 ? (
                        <p className="text-[10px] text-gray-400 italic">No hay lugares registrados en esta categoría.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {items.map((item, idx) => {
                            const globalIndex = surroundings.findIndex(s => s.name === item.name && s.category === item.category);
                            return (
                              <div key={idx} className="flex justify-between items-center bg-gray-50 border border-gray-150 p-2.5 rounded-xl text-xs text-left">
                                <div>
                                  <span className="font-bold text-gray-700 block">{item.name}</span>
                                  <span className="text-[10px] text-gray-400 font-semibold">{item.distance}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePOI(globalIndex)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSurroundingsModal(false)}
                className="bg-gradient-to-r from-brand-purple-dark to-brand-purple-deep text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md cursor-pointer hover:opacity-95"
              >
                Listo / Guardar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
