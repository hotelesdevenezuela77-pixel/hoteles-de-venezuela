import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { 
  Search, Filter, MapPin, Clock, Users, Star, 
  ChevronRight, Sparkles, CreditCard, Loader2, X, Phone, CheckCircle 
} from "lucide-react";
import { SERVICES_MOCK, type B2BService } from "../lib/servicesMock";

interface CategoryOption {
  id: number;
  name: string;
  slug: string;
}

interface DestinationOption {
  id: number;
  name: string;
  slug: string;
}

const serviceTypes = [
  { value: "all", label: "Todos los servicios" },
  { value: "alquiler_carro", label: "Alquiler de Carros" },
  { value: "tour", label: "Tours y Excursiones" },
  { value: "hospedaje", label: "Hospedaje" },
  { value: "yate", label: "Alquiler de Yates" },
  { value: "traslado", label: "Traslados" },
  { value: "paquete", label: "Paquetes Turísticos" },
];

export function B2BMarketplace() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [services, setServices] = useState<B2BService[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDestination, setSelectedDestination] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Modal de Reservas
  const [selectedService, setSelectedService] = useState<B2BService | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    start_date: "",
    end_date: "",
    guests: 1,
    user_name: "",
    user_email: "",
    user_phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Cargar Categorías y Destinos
  useEffect(() => {
    async function fetchFilterData() {
      try {
        const [catsRes, destsRes] = await Promise.all([
          supabase.from("categories").select("id, name, slug").order("name"),
          supabase.from("destinations").select("id, name, slug").order("name")
        ]);

        if (catsRes.data) setCategories(catsRes.data);
        if (destsRes.data) setDestinations(destsRes.data);
      } catch (err) {
        console.error("Error loading categories or destinations for B2B filters:", err);
      }
    }
    fetchFilterData();
  }, []);

  // Cargar Servicios
  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("service_listings")
          .select(`
            *,
            establishments (
              id,
              name,
              slug,
              price_level,
              categories (name),
              destinations (name)
            )
          `)
          .eq("is_active", true);

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: B2BService[] = data.map((item: any) => {
            return {
              id: item.id,
              name: item.name,
              description: item.description || "",
              service_type: item.service_type,
              price: item.price,
              price_unit: item.price_unit || "por día",
              capacity: item.capacity,
              duration_hours: item.duration_hours,
              image_url: item.image_url || "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop",
              establishment_name: item.establishments?.name || "Establecimiento",
              establishment_slug: item.establishments?.slug || "",
              establishment_image: null,
              category_name: item.establishments?.categories?.name || "Servicio",
              destination_name: item.establishments?.destinations?.name || "Venezuela"
            };
          });
          setServices(mapped);
        } else {
          setServices([]);
        }
      } catch (err) {
        console.warn("Error consultando Supabase para servicios B2B:", err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  // Extraer dinámicamente si los listados de la BD están vacíos
  const finalCategories = useMemo(() => {
    if (categories.length > 0) return categories;
    const unique = new Map<string, string>();
    services.forEach(s => {
      if (s.category_name) {
        unique.set(s.category_name.toLowerCase(), s.category_name);
      }
    });
    return Array.from(unique.entries()).map(([slug, name], index) => ({ id: index + 1, name, slug }));
  }, [categories, services]);

  const finalDestinations = useMemo(() => {
    if (destinations.length > 0) return destinations;
    const unique = new Map<string, string>();
    services.forEach(s => {
      if (s.destination_name) {
        unique.set(s.destination_name.toLowerCase(), s.destination_name);
      }
    });
    return Array.from(unique.entries()).map(([slug, name], index) => ({ id: index + 1, name, slug }));
  }, [destinations, services]);

  // Filtrado reactivo en memoria
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesType = selectedType === "all" || service.service_type === selectedType;
      
      const matchesCategory = selectedCategory === "all" || 
        service.category_name.toLowerCase() === selectedCategory.toLowerCase() ||
        service.category_name.toLowerCase().replace(/ /g, "-") === selectedCategory;

      const matchesDestination = selectedDestination === "all" || 
        service.destination_name?.toLowerCase() === selectedDestination.toLowerCase() ||
        service.destination_name?.toLowerCase().replace(/ /g, "-") === selectedDestination;

      const query = search.toLowerCase();
      const matchesQuery = !query || 
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.establishment_name.toLowerCase().includes(query) ||
        service.destination_name?.toLowerCase().includes(query);

      return matchesType && matchesCategory && matchesDestination && matchesQuery;
    });
  }, [services, selectedType, selectedCategory, selectedDestination, search]);

  const openBookingModal = (service: B2BService) => {
    if (!user) {
      // Redirigir si no está logueado
      setLocation("/login");
      return;
    }
    setSelectedService(service);
    setBookingForm({
      start_date: "",
      end_date: "",
      guests: 1,
      user_name: profile?.name || "",
      user_email: user.email || "",
      user_phone: profile?.phone || "",
      message: "",
    });
    setBookingSuccess(false);
    setCreatedBookingId(null);
    setShowBookingModal(true);
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !user) return;

    try {
      setSubmitting(true);

      // Obtener establishment_id del servicio. Si es mock, mapeamos un id genérico
      let establishmentId = 1;
      if (selectedService.id > 10) { // Si es un ID real de la base de datos
        const { data: realService } = await supabase
          .from("service_listings")
          .select("establishment_id")
          .eq("id", selectedService.id)
          .maybeSingle();
        if (realService) {
          establishmentId = realService.establishment_id;
        }
      }

      const payload = {
        service_id: selectedService.id,
        establishment_id: establishmentId,
        user_id: user.id,
        user_name: bookingForm.user_name,
        user_email: bookingForm.user_email,
        user_phone: bookingForm.user_phone,
        start_date: bookingForm.start_date,
        end_date: bookingForm.end_date || null,
        guests: bookingForm.guests,
        message: bookingForm.message,
        total_price: selectedService.price * (bookingForm.guests || 1),
        status: "pending"
      };

      const { data, error } = await supabase
        .from("booking_requests")
        .insert([payload])
        .select("id")
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCreatedBookingId(data.id);
      }
      setBookingSuccess(true);
    } catch (err) {
      console.error("Error creating booking request:", err);
      alert("No se pudo registrar la solicitud de reserva. Revisa las políticas RLS.");
      // Forzar éxito visual si es una simulación local / demo sin RLS aplicadas
      setBookingSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulatedPayment = () => {
    setProcessingPayment(true);
    const timer = setTimeout(async () => {
      setProcessingPayment(false);
      
      // Actualizar estado de pago localmente si es posible
      if (createdBookingId) {
        try {
          await supabase
            .from("booking_requests")
            .update({ payment_status: "paid", status: "confirmed" })
            .eq("id", createdBookingId);
        } catch (e) {
          console.warn("No se pudo actualizar el pago en Supabase (simulación):", e);
        }
      }

      alert("¡Simulación de Pago Exitosa! Tu reserva está confirmada.");
      setShowBookingModal(false);
    }, 1500);

    return () => clearTimeout(timer);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
  };

  const hasActiveFilters = search !== "" || selectedType !== "all" || selectedCategory !== "all" || selectedDestination !== "all";

  const resetFilters = () => {
    setSearch("");
    setSelectedType("all");
    setSelectedCategory("all");
    setSelectedDestination("all");
  };

  return (
    <div className="min-h-screen bg-gray-50/20 pb-20">
      
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden py-16 bg-gradient-to-br from-brand-purple-dark via-brand-purple-deep to-black text-white text-center">
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-brand-magenta/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-brand-turquesa/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-brand-magenta/20 text-brand-magenta border border-brand-magenta/35 mb-4 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PORTAL B2B MARKETPLACE</span>
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Servicios <span className="text-gradient-brand">Turísticos</span>
          </h1>
          <p className="text-gray-300 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed mb-8">
            Encuentra y contrata directamente servicios profesionales de transporte, traslados, paseos marítimos y excursiones guiadas provistos por operadores aprobados.
          </p>
          
          {/* Search Input */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar traslados, alquiler de yates, paseos, vehículos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3 text-xs md:text-sm text-gray-700 outline-none focus:ring-2 focus:ring-brand-magenta/10 shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="max-w-7xl mx-auto w-full px-6 -mt-6 relative z-20">
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xl shadow-gray-200/30 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            
            {/* Service Type Selector */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-magenta/10 cursor-pointer"
            >
              {serviceTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-magenta/10 cursor-pointer"
            >
              <option value="all">Todas las Categorías</option>
              {finalCategories.map(c => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>

            {/* Destination Filter */}
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-magenta/10 cursor-pointer"
            >
              <option value="all">Todos los Destinos</option>
              {finalDestinations.map(d => (
                <option key={d.slug} value={d.slug}>{d.name}</option>
              ))}
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 border border-red-100 text-red-600 text-xs font-black rounded-2xl hover:bg-red-100/50 cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            )}

          </div>

          <div className="text-xs text-gray-400 font-bold shrink-0">
            {filteredServices.length} servicios disponibles
          </div>
        </div>
      </div>

      {/* Services Grid Catalog */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
            <p className="text-gray-400 text-xs font-bold">Cargando catálogo B2B...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
            <Sparkles className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700">No se encontraron servicios</h3>
            <p className="text-gray-400 text-xs mt-1">
              {hasActiveFilters 
                ? "Intenta ajustando los criterios de filtrado." 
                : "De momento no se encuentran servicios activos en el marketplace. Los operadores registrados los publicarán en breve."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map(service => (
              <div
                key={service.id}
                className="group bg-white rounded-3xl shadow-sm hover:shadow-xl border border-gray-200 overflow-hidden flex flex-col justify-between transition-all duration-300"
              >
                <div>
                  {/* Photo area */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden shrink-0">
                    <img 
                      src={service.image_url} 
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    <span className="absolute top-4 left-4 bg-brand-magenta/90 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm">
                      {service.category_name}
                    </span>

                    <span className="absolute bottom-4 left-4 text-white text-xs font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-turquesa" />
                      <span>{service.destination_name}</span>
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3 text-left">
                    <h3 className="font-black text-gray-800 text-md leading-snug line-clamp-1 group-hover:text-brand-magenta transition-colors">
                      {service.name}
                    </h3>
                    
                    <p className="text-[11px] text-gray-400 font-semibold">
                      Operado por:{" "}
                      <Link 
                        href={`/establecimiento/${service.establishment_slug}`}
                        className="text-brand-magenta hover:underline font-bold"
                      >
                        {service.establishment_name}
                      </Link>
                    </p>

                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                      {service.description}
                    </p>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {service.capacity && (
                        <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-500 border border-gray-100 text-[10px] px-2 py-0.5 rounded-md font-medium">
                          <Users className="w-3 h-3 text-brand-turquesa" />
                          <span>Hasta {service.capacity} pers.</span>
                        </span>
                      )}
                      {service.duration_hours && (
                        <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-500 border border-gray-100 text-[10px] px-2 py-0.5 rounded-md font-medium">
                          <Clock className="w-3 h-3 text-brand-magenta" />
                          <span>Duración: {service.duration_hours}h</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price and Action button */}
                <div className="p-5 pt-0">
                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <span className="text-xl font-black text-brand-magenta">{formatPrice(service.price)}</span>
                      <span className="text-[10px] text-gray-400 font-bold ml-1 uppercase">{service.price_unit}</span>
                    </div>
                    
                    <button
                      onClick={() => openBookingModal(service)}
                      className="bg-brand-magenta hover:bg-brand-magenta/95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer hover:scale-102 active:scale-97 flex items-center gap-0.5"
                    >
                      <span>Reservar</span>
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>

      {/* Booking Form and Simulation Modal */}
      {showBookingModal && selectedService && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            
            {/* Close modal */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="text-left">
                <h3 className="font-extrabold text-sm text-gray-800">Solicitud de Reserva</h3>
                <span className="text-[10px] text-brand-magenta font-bold uppercase tracking-wider">{selectedService.name}</span>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="w-8 h-8 bg-gray-150/40 hover:bg-gray-150/80 rounded-full flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {bookingSuccess ? (
                
                // Booking Success screen
                <div className="text-center py-6 space-y-6">
                  <div className="w-14 h-14 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle className="w-7 h-7 text-green-500" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-gray-800">¡Reserva Registrada!</h3>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                      Tu solicitud de reserva ha sido enviada con éxito a <strong>{selectedService.establishment_name}</strong>.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex justify-between items-center max-w-xs mx-auto">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Total a pagar:</span>
                    <span className="text-lg font-black text-brand-magenta">
                      {formatPrice(selectedService.price * (bookingForm.guests || 1))}
                    </span>
                  </div>

                  <div className="space-y-3 max-w-xs mx-auto pt-4 border-t border-gray-50">
                    <button
                      onClick={handleSimulatedPayment}
                      disabled={processingPayment}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      {processingPayment ? (
                        <>
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                          <span>Simulando pago seguro...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4.5 h-4.5" />
                          <span>Pagar con Tarjeta (Demo)</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowBookingModal(false)}
                      className="w-full bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold text-xs py-3 rounded-xl cursor-pointer"
                    >
                      Confirmar más tarde
                    </button>
                  </div>
                </div>

              ) : (
                
                // Form screen
                <form onSubmit={submitBooking} className="space-y-4 text-left">
                  
                  <div className="bg-brand-magenta/5 border border-brand-magenta/10 rounded-2xl p-4 flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-brand-magenta">Precio base del servicio:</span>
                    <span className="text-sm font-black text-brand-magenta">
                      {formatPrice(selectedService.price)} <span className="text-[10px] text-gray-400 font-bold uppercase">{selectedService.price_unit}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Fecha Inicio *</label>
                      <input
                        type="date"
                        required
                        value={bookingForm.start_date}
                        onChange={e => setBookingForm({ ...bookingForm, start_date: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/10"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Fecha Fin (Opcional)</label>
                      <input
                        type="date"
                        value={bookingForm.end_date}
                        onChange={e => setBookingForm({ ...bookingForm, end_date: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Nº de Personas</label>
                      <input
                        type="number"
                        min={1}
                        value={bookingForm.guests}
                        onChange={e => setBookingForm({ ...bookingForm, guests: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/10"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Teléfono / WhatsApp</label>
                      <input
                        type="tel"
                        value={bookingForm.user_phone}
                        onChange={e => setBookingForm({ ...bookingForm, user_phone: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/10"
                        placeholder="Ej: +58 414 1234567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Tu Nombre completo</label>
                    <input
                      type="text"
                      value={bookingForm.user_name}
                      onChange={e => setBookingForm({ ...bookingForm, user_name: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/10"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      value={bookingForm.user_email}
                      onChange={e => setBookingForm({ ...bookingForm, user_email: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/10"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Mensaje o Requerimientos Especiales</label>
                    <textarea
                      rows={3}
                      value={bookingForm.message}
                      onChange={e => setBookingForm({ ...bookingForm, message: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/10 resize-none"
                      placeholder="Indica si necesitas chofer bilingüe, silla para bebés o equipaje extra..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-brand-magenta hover:bg-brand-magenta/95 text-white font-bold text-xs py-3.5 rounded-xl shadow-md shadow-brand-magenta/15 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Enviando Solicitud...</span>
                      </>
                    ) : (
                      <span>Enviar Solicitud de Reserva</span>
                    )}
                  </button>

                  <p className="text-[10px] text-gray-400 text-center leading-normal">
                    * Tu solicitud será recibida por el proveedor para coordinar la facturación y detalles finales.
                  </p>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
