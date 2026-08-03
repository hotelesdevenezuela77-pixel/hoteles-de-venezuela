import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { 
  User, 
  Calendar as CalendarIcon, 
  Heart, 
  Luggage, 
  Ticket, 
  Calculator, 
  Settings, 
  Sparkles, 
  Building2, 
  Bot, 
  LogOut, 
  Compass, 
  MapPin, 
  Star, 
  ArrowRight, 
  MessageSquare,
  ShieldCheck,
  Award
} from "lucide-react";

import { TouristCalendar, TripEvent } from "../components/tourist/TouristCalendar";
import { TouristFavorites, FavoriteHotel } from "../components/tourist/TouristFavorites";
import { TouristPackages, TouristPackageItem } from "../components/tourist/TouristPackages";
import { TouristCouponsPassport } from "../components/tourist/TouristCouponsPassport";
import { TouristBudgetCalculator } from "../components/tourist/TouristBudgetCalculator";
import { TouristProfileSettings } from "../components/tourist/TouristProfileSettings";

export function Perfil() {
  const { user, profile, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Tab activo: "resumen" | "calendario" | "favoritos" | "paquetes" | "cupones" | "presupuesto" | "perfil"
  const [activeTab, setActiveTab] = useState<"resumen" | "calendario" | "favoritos" | "paquetes" | "cupones" | "presupuesto" | "perfil">("resumen");

  // Estado de Eventos del Calendario Drag & Drop
  const [events, setEvents] = useState<TripEvent[]>(() => {
    const saved = localStorage.getItem("hdv_tourist_events");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: "evt_1",
        title: "Check-in Posada Los Roques",
        location: "Gran Roque, Los Roques",
        date: "2026-08-15",
        type: "hotel",
        status: "confirmado",
        cost: 320,
        notes: "Habitación Vista al Mar"
      },
      {
        id: "evt_2",
        title: "Excursión en Catamarán Cayo Francisquí",
        location: "Los Roques",
        date: "2026-08-16",
        type: "excursion",
        status: "reservado",
        cost: 85
      },
      {
        id: "evt_3",
        title: "Tour Teleférico Mukumbarí",
        location: "Mérida, Venezuela",
        date: "2026-09-02",
        type: "activity",
        status: "deseado",
        cost: 45
      }
    ];
  });

  // Estado de Hoteles Preferidos / Favoritos
  const [favorites, setFavorites] = useState<FavoriteHotel[]>(() => {
    const saved = localStorage.getItem("hdv_tourist_favorites");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: 101,
        slug: "posada-natura-viva-los-roques",
        name: "Posada Natura Viva",
        location: "Gran Roque, Los Roques",
        image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80",
        rating: 4.9,
        priceLevel: "$$$",
        category: "Posada de Lujo",
        whatsapp: "+584120000000",
        personalNotes: "Habitación superior recomendada para nuestro aniversario."
      },
      {
        id: 102,
        slug: "hotel-hesperia-isla-margarita",
        name: "Hesperia Isla Margarita",
        location: "Pedro González, Nueva Esparta",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        rating: 4.8,
        priceLevel: "$$$",
        category: "Resort 5 Estrellas",
        whatsapp: "+584120000000",
        personalNotes: "Piscina gigante y acceso privado a la playa."
      },
      {
        id: 103,
        slug: "estancia-la-era-merida",
        name: "Estancia La Era de Mucuchíes",
        location: "Mucuchíes, Mérida",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        rating: 4.9,
        priceLevel: "$$",
        category: "Posada de Montaña",
        whatsapp: "+584120000000",
        personalNotes: "Clima frío ideal y chimenea en la habitación principal."
      }
    ];
  });

  // Estado de Paquetes Turísticos Guardados
  const [packages, setPackages] = useState<TouristPackageItem[]>(() => {
    const saved = localStorage.getItem("hdv_tourist_packages");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: "pkg_1",
        title: "Los Roques VIP Todo Incluido",
        destination: "Archipiélago Los Roques",
        duration: "4 Días / 3 Noches",
        priceUSD: 680,
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
        status: "proximo",
        includedServices: ["Vuelo Chárter", "Posada VIP", "Paseos en Lancha", "Todas las Comidas"],
        departureDate: "2026-08-15"
      },
      {
        id: "pkg_2",
        title: "Expedición Salto Ángel & Canaima",
        destination: "Parque Nacional Canaima",
        duration: "3 Días / 2 Noches",
        priceUSD: 520,
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        status: "deseo",
        includedServices: ["Sobrevuelo Salto Ángel", "Campamento VIP", "Curruca a Isla Orquídea"]
      }
    ];
  });

  // Persistir cambios en localStorage
  useEffect(() => {
    localStorage.setItem("hdv_tourist_events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("hdv_tourist_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("hdv_tourist_packages", JSON.stringify(packages));
  }, [packages]);

  // Si no hay usuario logueado, redirigir a Login o mostrar mensaje de acceso
  if (!user && typeof window !== "undefined") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-white">
        <div className="w-16 h-16 bg-[#00C8D4]/15 border border-[#00C8D4]/30 rounded-2xl flex items-center justify-center text-[#00C8D4] mb-4 shadow-lg">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2 font-serif uppercase tracking-tight">Acceso al Panel de Turista</h2>
        <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
          Inicia sesión o regístrate para acceder a tu planificador de itinerarios, cupones, paquetes guardados y fichas preferidas de hoteles.
        </p>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00C8D4] to-[#FF0096] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/registro"
            className="px-6 py-3 rounded-xl bg-slate-100 text-slate-800 font-black text-xs uppercase tracking-wider hover:bg-slate-200 transition-all"
          >
            Crear Cuenta Gratis
          </Link>
        </div>
      </div>
    );
  }

  // Handlers para eventos del calendario
  const handleAddEvent = (evt: TripEvent) => {
    setEvents(prev => [...prev, evt]);
  };

  const handleUpdateEventDate = (id: string, newDate: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, date: newDate } : e));
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  // Handlers para favoritos
  const handleRemoveFavorite = (id: string | number) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  const handleUpdateFavoriteNote = (id: string | number, note: string) => {
    setFavorites(prev => prev.map(f => f.id === id ? { ...f, personalNotes: note } : f));
  };

  // Handlers para paquetes
  const handleRemovePackage = (id: string | number) => {
    setPackages(prev => prev.filter(p => p.id !== id));
  };

  const handleAddPackage = (pkg: TouristPackageItem) => {
    setPackages(prev => [...prev, pkg]);
  };

  // Handlers para actualizar perfil
  const handleUpdateProfile = async (data: { name: string; phone: string; avatarUrl?: string; travelStyle?: string[] }) => {
    if (!user) return;
    const { error } = await supabase
      .from("user_profiles")
      .update({
        name: data.name,
        phone: data.phone,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id);

    if (error) throw error;
  };

  const handleUpdatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Banner Full-Bleed Oficial (Conforme a AGENTS.md) */}
      <div className="relative w-full overflow-hidden bg-slate-950 min-h-[320px] flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1920&q=80"
          alt="Panel de Turista Venezuela"
          className="absolute inset-0 w-full h-full object-cover scale-[1.08] opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />

        <div className="relative z-10 text-center max-w-4xl px-4 py-12">
          <p className="text-[11px] font-black uppercase text-[#00C8D4] tracking-[0.3em] mb-2 drop-shadow-sm">
            EL PARAÍSO TE ESPERA EN VENEZUELA
          </p>
          <h1 className="text-3xl md:text-5xl font-black font-serif text-slate-950 tracking-tight mb-4 drop-shadow-sm">
            Panel Administrativo de Turista
          </h1>
          <p className="text-xs md:text-sm text-slate-700 max-w-xl mx-auto font-medium leading-relaxed">
            Gestiona tus itinerarios drag & drop, fichas preferidas de hoteles, cupones de descuento y presupuesto de viajes en un solo lugar.
          </p>
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 space-y-8">
        {/* Banner informativo si el usuario también es Propietario */}
        {profile?.role === "owner" && (
          <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00C8D4]/20 text-[#00C8D4] flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-300">
                <strong className="text-white">Modo Turista Activo:</strong> Estás visualizando tu panel personal de viajes. ¿Deseas gestionar tus propiedades registradas?
              </p>
            </div>
            <Link
              href="/mis-negocios"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00C8D4] to-[#FF0096] text-white font-bold text-xs uppercase tracking-wider shrink-0 hover:scale-105 transition-all cursor-pointer"
            >
              Ir al Panel de Propietario
            </Link>
          </div>
        )}

        {/* Barra de Tarjeta de Usuario & Métricas Rápidas */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-tr from-[#00C8D4] via-[#FF0096] to-[#9B00CC] shadow-md shrink-0">
              <img
                src={profile?.avatar_url || user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                alt={profile?.name || "Avatar"}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-serif text-slate-900">{profile?.name || user?.email?.split("@")[0]}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00C8D4]/15 text-[#00C8D4] border border-[#00C8D4]/30">
                  Turista Élite
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            </div>
          </div>

          {/* Mini Métricas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Hoteles Preferidos</span>
              <span className="text-lg font-black text-[#FF0096]">{favorites.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Eventos Agendados</span>
              <span className="text-lg font-black text-[#00C8D4]">{events.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Paquetes Guardados</span>
              <span className="text-lg font-black text-[#9B00CC]">{packages.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Nivel Viajero</span>
              <span className="text-xs font-black text-emerald-600 uppercase">Oro</span>
            </div>
          </div>
        </div>

        {/* Pestañas de Navegación del Panel de Turista */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("resumen")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "resumen"
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Compass className="w-4 h-4 text-[#00C8D4]" />
            Visión General
          </button>

          <button
            onClick={() => setActiveTab("calendario")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "calendario"
                ? "bg-[#00C8D4] text-slate-950 shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Calendario Drag & Drop
          </button>

          <button
            onClick={() => setActiveTab("favoritos")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "favoritos"
                ? "bg-[#FF0096] text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Heart className="w-4 h-4" />
            Fichas Preferidas ({favorites.length})
          </button>

          <button
            onClick={() => setActiveTab("paquetes")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "paquetes"
                ? "bg-[#9B00CC] text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Luggage className="w-4 h-4" />
            Mis Paquetes ({packages.length})
          </button>

          <button
            onClick={() => setActiveTab("cupones")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "cupones"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Ticket className="w-4 h-4" />
            Cupones & Pasaporte
          </button>

          <button
            onClick={() => setActiveTab("presupuesto")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "presupuesto"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Calculator className="w-4 h-4" />
            Presupuesto
          </button>

          <button
            onClick={() => setActiveTab("perfil")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "perfil"
                ? "bg-slate-800 text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Settings className="w-4 h-4" />
            Editar Perfil
          </button>
        </div>

        {/* Contenido de la Pestaña Activa */}
        <div className="space-y-6">
          {/* TAB 1: Visión General */}
          {activeTab === "resumen" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Acceso Rápido Asistente de Viajes IA */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00C8D4]/20 border border-[#00C8D4]/40 text-[#00C8D4] text-[11px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF0096]" />
                    Asistente de Viajes IA HDV
                  </div>
                  <h3 className="text-2xl font-black font-serif text-white">¿Necesitas ayuda para planificar tu próxima escapada?</h3>
                  <p className="text-xs text-slate-300 max-w-xl">
                    Nuestra Inteligencia Artificial analiza tus gustos y te diseña un itinerario completo día por día con posadas recomendadas en Venezuela.
                  </p>
                </div>
                <Link
                  href="/viaje-ia"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00C8D4] via-[#FF0096] to-[#9B00CC] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Bot className="w-5 h-5 text-white" />
                  Diseñar Itinerario con IA
                </Link>
              </div>

              {/* Grid de Resumen Rápido */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vista previa de Calendario */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-[#00C8D4]" />
                      Próximas Fechas Agendadas ({events.length})
                    </h3>
                    <button
                      onClick={() => setActiveTab("calendario")}
                      className="text-xs text-[#00C8D4] font-bold hover:underline"
                    >
                      Ver Calendario Drag & Drop →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {events.slice(0, 3).map(evt => (
                      <div key={evt.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-mono text-[#00C8D4] font-bold">{evt.date}</span>
                          <h4 className="text-xs font-bold text-slate-900">{evt.title}</h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#FF0096]" />
                            {evt.location}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#00C8D4]/15 text-[#00C8D4]">
                          ${evt.cost} USD
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vista previa de Favoritos */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-[#FF0096]" />
                      Hoteles Preferidos Destacados ({favorites.length})
                    </h3>
                    <button
                      onClick={() => setActiveTab("favoritos")}
                      className="text-xs text-[#FF0096] font-bold hover:underline"
                    >
                      Ver Todas las Fichas →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {favorites.slice(0, 3).map(fav => (
                      <div key={fav.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img src={fav.image} alt={fav.name} className="w-12 h-12 rounded-xl object-cover" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{fav.name}</h4>
                            <p className="text-[11px] text-slate-500">{fav.location}</p>
                          </div>
                        </div>
                        <Link
                          href={`/establecimiento/${fav.slug}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-[#00C8D4] hover:text-slate-950 transition-colors"
                        >
                          Ver Detalle
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Calendario Drag & Drop */}
          {activeTab === "calendario" && (
            <TouristCalendar
              events={events}
              onAddEvent={handleAddEvent}
              onUpdateEventDate={handleUpdateEventDate}
              onDeleteEvent={handleDeleteEvent}
            />
          )}

          {/* TAB 3: Fichas Preferidas */}
          {activeTab === "favoritos" && (
            <TouristFavorites
              favorites={favorites}
              onRemoveFavorite={handleRemoveFavorite}
              onUpdateNote={handleUpdateFavoriteNote}
            />
          )}

          {/* TAB 4: Paquetes Turísticos */}
          {activeTab === "paquetes" && (
            <TouristPackages
              packages={packages}
              onRemovePackage={handleRemovePackage}
              onAddPackage={handleAddPackage}
            />
          )}

          {/* TAB 5: Cupones & Pasaporte Turístico */}
          {activeTab === "cupones" && (
            <TouristCouponsPassport />
          )}

          {/* TAB 6: Presupuesto de Viaje */}
          {activeTab === "presupuesto" && (
            <TouristBudgetCalculator />
          )}

          {/* TAB 7: Editar Perfil */}
          {activeTab === "perfil" && (
            <TouristProfileSettings
              user={user}
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onUpdatePassword={handleUpdatePassword}
            />
          )}
        </div>

        {/* Sección de Cierre (Bottom CTA Obligatorio según AGENTS.md) */}
        <div className="rounded-3xl p-8 text-white shadow-xl relative overflow-hidden" style={{ background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)" }}>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-black font-serif">¿Tienes dudas o necesitas atención personalizada?</h3>
              <p className="text-xs text-white/90 max-w-xl">
                Contacta directamente con nuestro equipo oficial de soporte turístico para asesoría en vuelos, posadas verificadas y traslados en toda Venezuela.
              </p>
            </div>
            <a
              href="https://wa.me/584120000000?text=Hola%20Hoteles%20de%20Venezuela%2C%20requiero%20asistencia%20tur%C3%ADstica"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl bg-white text-[#FF0096] font-black text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-current text-[#FF0096]" />
              Atención Directa WhatsApp
            </a>
          </div>
        </div>

        {/* Botón de Cerrar Sesión */}
        <div className="flex justify-center pt-4">
          <button
            onClick={logout}
            className="px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión de Turista
          </button>
        </div>
      </div>
    </div>
  );
}
