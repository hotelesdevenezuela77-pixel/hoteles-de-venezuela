import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { 
  Compass, 
  Umbrella, 
  Flame, 
  Trees, 
  Mountain, 
  Clock, 
  Users, 
  Check, 
  Search, 
  Calendar, 
  Info,
  ChevronRight,
  AlertCircle,
  MapPin
} from "lucide-react";

interface Package {
  id: number;
  name: string;
  slug: string;
  description: string;
  durationDays: number;
  durationNights: number;
  pricePerPerson: number;
  minPersons: number;
  maxPersons: number;
  includedServices: string;
  featuredImage: string;
  category: string;
  difficultyLevel: string;
  status: string;
  isFeatured: boolean;
  isActive: boolean;
  destinations: string;
  departureLocation: string;
}

const CATEGORIES = [
  { id: "todos", label: "Todos", icon: Compass, color: "#FF0096" },
  { id: "playa", label: "Playa & Sol", icon: Umbrella, color: "#00C8D4" },
  { id: "aventura", label: "Aventura", icon: Flame, color: "#F59E0B" },
  { id: "ecológico", label: "Ecológico", icon: Trees, color: "#10B981" },
  { id: "montaña", label: "Montaña", icon: Mountain, color: "#8B5CF6" }
];

export function Paquetes() {
  const { user } = useAuth();
  const [selectedCat, setSelectedCat] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  
  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    guestName: user?.user_metadata?.name || "",
    guestEmail: user?.email || "",
    guestPhone: "",
    travelDate: "",
    personsCount: 2,
    specialRequests: ""
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Fetch packages matching the admin's database schema and local storage fallback
  const { data: packages = [], isLoading } = useQuery<Package[]>({
    queryKey: ["tour-packages-public"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("tour_packages")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });
        if (error) throw error;

        const mapped = (data || []).map((p: any) => ({
          id: p.id,
          name: p.name || "",
          slug: p.slug || "",
          description: p.description || "",
          durationDays: p.duration_days || p.durationDays || 1,
          durationNights: p.duration_nights || p.durationNights || 1,
          pricePerPerson: p.price_per_person || p.pricePerPerson || 0,
          minPersons: p.min_persons || p.minPersons || 1,
          maxPersons: p.max_persons || p.maxPersons || 10,
          includedServices: p.included_services || p.includedServices || "",
          featuredImage: p.featured_image || p.image_url || p.featuredImage || "",
          category: p.category || "playa",
          difficultyLevel: p.difficulty_level || p.difficultyLevel || "facil",
          status: p.status || "active",
          isFeatured: p.is_featured !== undefined ? p.is_featured : (p.isFeatured !== undefined ? p.isFeatured : false),
          isActive: p.is_active !== undefined ? p.is_active : (p.isActive !== undefined ? p.isActive : true),
          destinations: p.destinations || "",
          departureLocation: p.departure_location || p.departureLocation || ""
        }));

        const localPackKey = "hdv_mock_tour_packages";
        const localPacks = JSON.parse(localStorage.getItem(localPackKey) || "[]").filter((p: any) => p.isActive);
        return [...mapped, ...localPacks];
      } catch (err) {
        const localPackKey = "hdv_mock_tour_packages";
        const localPacks = JSON.parse(localStorage.getItem(localPackKey) || "[]").filter((p: any) => p.isActive);
        if (localPacks.length === 0) {
          const defaults = [
            { id: 1, name: "Escapada Romántica Los Roques", slug: "los-roques-escapada", description: "Vuelo ida y vuelta, estadía en posada premium, paseo a cayos de coral y exquisitas comidas incluidas en posada caribeña.", durationDays: 3, durationNights: 2, pricePerPerson: 450, minPersons: 2, maxPersons: 6, includedServices: "Vuelos, Posada Boutique, Pensión completa, Paseos en lancha a cayos", featuredImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80", category: "playa", difficultyLevel: "facil", status: "active", isFeatured: true, isActive: true, destinations: "Los Roques", departureLocation: "Maiquetía" },
            { id: 2, name: "Aventura Selva Canaima", slug: "aventura-canaima", description: "Excursión de 4 días al majestuoso Salto Ángel con navegación en curiara y pernocta en hamacas frente a la caída de agua más alta del planeta.", durationDays: 4, durationNights: 3, pricePerPerson: 650, minPersons: 1, maxPersons: 12, includedServices: "Vuelos charter, Comidas completas, Guías indígenas, Traslados fluviales", featuredImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80", category: "aventura", difficultyLevel: "moderado", status: "active", isFeatured: true, isActive: true, destinations: "Canaima", departureLocation: "Puerto Ordaz" },
            { id: 3, name: "Escápate a las Playas de Morrocoy", slug: "morrocoy-todo-incluido", description: "Estadía premium en posada con piscina, traslados privados a Cayo Sombrero y Cayo Pescadores, y deliciosos almuerzos marineros a la orilla del mar.", durationDays: 3, durationNights: 2, pricePerPerson: 195, minPersons: 2, maxPersons: 10, includedServices: "Hospedaje, Desayunos y Cenas, Traslado diario en lancha, Coctel de bienvenida", featuredImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", category: "playa", difficultyLevel: "facil", status: "active", isFeatured: false, isActive: true, destinations: "Morrocoy", departureLocation: "Tucacas" },
            { id: 4, name: "Tour Andino Mérida Extrema", slug: "tour-andino-merida", description: "Sube al teleférico Mukumbarí, visita el pintoresco pueblo de Los Nevados y recorre las lagunas glaciares en vehículos de tracción integral.", durationDays: 5, durationNights: 4, pricePerPerson: 280, minPersons: 2, maxPersons: 8, includedServices: "Hotel boutique, Desayunos andinos, Tickets de teleférico, Guía de montaña", featuredImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80", category: "montaña", difficultyLevel: "moderado", status: "active", isFeatured: false, isActive: true, destinations: "Mérida", departureLocation: "Mérida" }
          ];
          localStorage.setItem(localPackKey, JSON.stringify(defaults));
          return defaults;
        }
        return localPacks;
      }
    }
  });

  // Booking mutation that stores request in DB or localStorage fallback
  const createBooking = useMutation({
    mutationFn: async (bookingData: any) => {
      const payload = {
        package_id: selectedPkg?.id,
        guest_name: bookingData.guestName,
        guest_email: bookingData.guestEmail,
        guest_phone: bookingData.guestPhone,
        travel_date: bookingData.travelDate,
        persons_count: bookingData.personsCount,
        total_price: (selectedPkg?.pricePerPerson || 0) * bookingData.personsCount,
        special_requests: bookingData.specialRequests,
        status: "pending",
        payment_status: "pending"
      };

      try {
        const { error } = await supabase
          .from("tour_package_bookings")
          .insert(payload);
        if (error) throw error;
        return { success: true };
      } catch (err) {
        const localBookKey = "hdv_mock_package_bookings";
        const localBookings = JSON.parse(localStorage.getItem(localBookKey) || "[]");
        const newBooking = {
          id: Date.now(),
          packageId: selectedPkg?.id,
          createdAt: new Date().toISOString(),
          ...payload
        };
        localBookings.push(newBooking);
        localStorage.setItem(localBookKey, JSON.stringify(localBookings));
        return { success: true };
      }
    },
    onSuccess: () => {
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedPkg(null);
        setBookingForm({
          guestName: user?.user_metadata?.name || "",
          guestEmail: user?.email || "",
          guestPhone: "",
          travelDate: "",
          personsCount: 2,
          specialRequests: ""
        });
      }, 3000);
    }
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.guestName || !bookingForm.guestEmail || !bookingForm.guestPhone || !bookingForm.travelDate) {
      alert("Por favor completa los campos requeridos.");
      return;
    }
    createBooking.mutate(bookingForm);
  };

  const filteredPkgs = packages.filter(p => {
    const matchesCat = selectedCat === "todos" || p.category === selectedCat;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.destinations.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      
      {/* ── HERO BANNER DEGRADADO ── */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28 px-6" 
        style={{ background: "linear-gradient(135deg, #0e0120 0%, #1a0533 60%, #0d1a2e 100%)" }}>
        
        {/* Glow Spots */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-20" style={{ background: "#FF0096" }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ background: "#00C8D4" }} />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-5 border bg-purple-500/10 border-purple-500/30 text-purple-400">
            <Compass className="w-3.5 h-3.5" />
            <span>Planes Todo Incluido</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-4 uppercase">
            Paquetes <br/>
            <span className="bg-gradient-to-r from-[#FF0096] to-[#00C8D4] bg-clip-text text-transparent">Turísticos Exclusivos</span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl mb-10 font-medium">
            Planifica tu próxima aventura con todo resuelto. Vuelos, posadas VIP, excursiones guiadas y comidas locales integradas para tu máxima tranquilidad.
          </p>

          {/* Search bar inside hero */}
          <div className="w-full max-w-lg bg-white/5 border border-white/10 rounded-full p-2 flex items-center shadow-2xl backdrop-blur-md">
            <Search className="w-5 h-5 text-slate-400 ml-3.5 shrink-0" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar destino (Los Roques, Canaima, Mérida...)" 
              className="w-full bg-transparent outline-none px-3 text-sm font-bold text-white placeholder-slate-400"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Category filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className="flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer border"
                style={{
                  background: isSelected ? `linear-gradient(135deg, ${cat.color}, ${cat.color}dd)` : "rgba(255, 255, 255, 0.03)",
                  borderColor: isSelected ? cat.color : "rgba(255, 255, 255, 0.08)",
                  color: isSelected ? "#fff" : "#94a3b8",
                  boxShadow: isSelected ? `0 4px 15px ${cat.color}33` : "none"
                }}
              >
                <cat.icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Packages Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-t-purple-500 border-r-transparent border-slate-700 rounded-full animate-spin mx-auto mb-3" />
            <span className="text-xs uppercase font-bold text-slate-400 tracking-widest">Cargando experiencias...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPkgs.map(pkg => (
              <div key={pkg.id} className="bg-slate-900/60 rounded-3xl border border-white/5 overflow-hidden flex flex-col transition-all duration-300 hover:border-purple-500/20 group hover:shadow-xl hover:shadow-purple-950/20">
                {/* Image & Badges wrapper */}
                <div className="h-56 overflow-hidden relative">
                  <img 
                    src={pkg.featuredImage || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80"} 
                    alt={pkg.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {/* Category badge */}
                  <span className="absolute top-4 left-4 bg-[#FF0096] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                    {pkg.category}
                  </span>

                  {/* Price overlay */}
                  <div className="absolute bottom-4 left-4">
                    <span className="text-[10px] uppercase font-bold text-slate-300 block">Desde</span>
                    <span className="text-xl font-black text-white">${pkg.pricePerPerson} <span className="text-xs font-semibold text-slate-300">USD/pax</span></span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header items */}
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-400 uppercase mb-3">
                      <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{pkg.durationDays}D / {pkg.durationNights}N</span>
                      </span>
                      <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{pkg.destinations}</span>
                      </span>
                    </div>

                    <h3 className="text-base font-black text-white mb-2 leading-tight uppercase group-hover:text-purple-400 transition-colors">{pkg.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-semibold mb-5 line-clamp-3">{pkg.description}</p>
                  </div>

                  <div>
                    {/* Included Services preview */}
                    <div className="border-t border-white/5 pt-4 mb-5">
                      <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block mb-2">Servicios Incluidos:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {pkg.includedServices.split(",").slice(0, 3).map((serv, index) => (
                          <span key={index} className="inline-flex items-center gap-1 text-[9px] font-bold bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20">
                            <Check className="w-2.5 h-2.5" />
                            <span>{serv.trim()}</span>
                          </span>
                        ))}
                        {pkg.includedServices.split(",").length > 3 && (
                          <span className="text-[9px] font-bold text-slate-500 px-1 py-0.5">+ {pkg.includedServices.split(",").length - 3} más</span>
                        )}
                      </div>
                    </div>

                    {/* Book Action Button */}
                    <button 
                      onClick={() => setSelectedPkg(pkg)}
                      className="w-full py-3 bg-gradient-to-r from-[#9B00CC] to-[#FF0096] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-950/40 active:scale-97 cursor-pointer"
                    >
                      Reservar Experiencia
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredPkgs.length === 0 && (
          <div className="text-center py-24 bg-white/5 border border-white/10 rounded-3xl p-8 max-w-md mx-auto">
            <Info className="w-10 h-10 text-slate-400 mx-auto mb-4" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">No se encontraron paquetes</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">No se detectaron planes que coincidan con la categoría o términos buscados. Intenta cambiar los criterios de búsqueda.</p>
          </div>
        )}
      </div>

      {/* ── BOOKING REQUEST MODAL ── */}
      {selectedPkg && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#9B00CC] to-[#FF0096]" />
            
            <div className="flex justify-between items-start mb-5">
              <div>
                <span className="text-[9px] uppercase font-black tracking-widest text-[#FF0096] bg-[#FF0096]/10 px-2.5 py-0.5 rounded-full border border-[#FF0096]/20">Solicitud de Reserva</span>
                <h3 className="text-base font-black text-white mt-1.5 uppercase leading-tight">{selectedPkg.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedPkg(null)} 
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-black uppercase text-white tracking-wider mb-2">¡Solicitud Registrada!</h4>
                <p className="text-xs text-slate-300 max-w-xs leading-relaxed font-medium">Hemos registrado tu interés en el paquete. Un agente comercial de Hoteles de Venezuela te contactará en breve.</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs">
                  <div className="flex justify-between font-bold text-slate-300">
                    <span>Precio Unitario:</span>
                    <span>${selectedPkg.pricePerPerson} USD</span>
                  </div>
                  <div className="flex justify-between font-black text-white mt-1 text-sm pt-2 border-t border-white/5">
                    <span>Total Estimado:</span>
                    <span>${selectedPkg.pricePerPerson * bookingForm.personsCount} USD</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">Nombre Completo *</label>
                  <input 
                    type="text"
                    required
                    value={bookingForm.guestName}
                    onChange={e => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 focus:border-[#FF0096] p-3 rounded-xl text-xs font-bold text-white outline-none" 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">Email de Contacto *</label>
                    <input 
                      type="email"
                      required
                      value={bookingForm.guestEmail}
                      onChange={e => setBookingForm({ ...bookingForm, guestEmail: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 focus:border-[#FF0096] p-3 rounded-xl text-xs font-bold text-white outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">WhatsApp / Teléfono *</label>
                    <input 
                      type="tel"
                      required
                      placeholder="+58 414-0000000"
                      value={bookingForm.guestPhone}
                      onChange={e => setBookingForm({ ...bookingForm, guestPhone: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 focus:border-[#FF0096] p-3 rounded-xl text-xs font-bold text-white outline-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">Fecha de Viaje *</label>
                    <input 
                      type="date"
                      required
                      value={bookingForm.travelDate}
                      onChange={e => setBookingForm({ ...bookingForm, travelDate: e.target.value })}
                      className="w-full bg-slate-950 border border-white/10 focus:border-[#FF0096] p-3 rounded-xl text-xs font-bold text-white outline-none" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">Nº de Pasajeros *</label>
                    <input 
                      type="number"
                      required
                      min={selectedPkg.minPersons}
                      max={selectedPkg.maxPersons}
                      value={bookingForm.personsCount}
                      onChange={e => setBookingForm({ ...bookingForm, personsCount: parseInt(e.target.value) || 1 })}
                      className="w-full bg-slate-950 border border-white/10 focus:border-[#FF0096] p-3 rounded-xl text-xs font-bold text-white outline-none" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">Peticiones Especiales (Opcional)</label>
                  <textarea 
                    rows={2}
                    value={bookingForm.specialRequests}
                    onChange={e => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
                    placeholder="Detalles sobre intolerancias alimenticias, guía bilingüe, traslados especiales..."
                    className="w-full bg-slate-950 border border-white/10 focus:border-[#FF0096] p-3 rounded-xl text-xs font-bold text-white outline-none resize-none" 
                  />
                </div>

                <button 
                  type="submit"
                  disabled={createBooking.isPending}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {createBooking.isPending ? (
                    <span>Procesando...</span>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>Confirmar Solicitud de Reserva</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Icon helper wrapper to avoid missing icon components
function XCircle(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
  );
}
