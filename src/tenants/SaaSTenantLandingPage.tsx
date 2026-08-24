import React, { useEffect, useState } from "react";
import { 
  MapPin, Phone, Mail, Clock, Star, ShieldCheck, Wifi, Coffee, Compass, 
  Utensils, Car, Sparkles, CheckCircle2, MessageCircle, ExternalLink, Calendar,
  Bed, Users, Award, ChevronDown, Layers, ArrowRight, Heart
} from "lucide-react";
import { type TenantConfig } from "./tenantContext";
import { createTenantClient } from "./lib/supabaseTenant";
import { RoomCard, type Room } from "./components/RoomCard";
import { RoomDetailModal } from "./components/RoomDetailModal";
import { supabase } from "../lib/supabase";

interface SaaSTenantLandingPageProps {
  config: TenantConfig;
}

export function SaaSTenantLandingPage({ config }: SaaSTenantLandingPageProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [mapViewMode, setMapViewMode] = useState<"satelite" | "estandar">("satelite");
  const [activeAreaTab, setActiveAreaTab] = useState<string>("todas");

  // Cargar fotos por áreas (Piscina, Restaurante, Lobby, Fachada, Playa, Spa)
  const [areaPhotos, setAreaPhotos] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem("hdv_area_photos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[config.establishment_id]) return parsed[config.establishment_id];
      }
    } catch (e) {}
    return {
      piscina: ["https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&auto=format&fit=crop"],
      restaurante: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop"],
      lobby: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop"],
      fachada: ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop"],
    };
  });

  const primaryColor = config.branding?.primary_color || "#00C8D4";
  const secondaryColor = config.branding?.secondary_color || "#9B00CC";
  const accentColor = config.branding?.accent_color || "#FF0096";

  const bannerImage = config.branding?.banner_url || 
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&auto=format&fit=crop";

  const phone = config.contact?.phone || "+58 414 123 4567";
  const whatsapp = config.contact?.whatsapp || phone;
  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, "");

  // Cargar habitaciones reales desde Supabase + localStorage + Fallback
  useEffect(() => {
    async function loadRooms() {
      setLoadingRooms(true);
      try {
        let dbRooms: any[] = [];
        
        // 1. Intentar consultar por establishment_id en Supabase
        if (config.establishment_id) {
          const { data, error } = await supabase
            .from("rooms")
            .select("*")
            .eq("establishment_id", config.establishment_id);
          if (!error && data) dbRooms = data;
        }

        // 2. Consultar en localStorage
        const localRoomsKey = "hdv_custom_rooms";
        const localRooms = JSON.parse(localStorage.getItem(localRoomsKey) || "[]")
          .filter((r: any) => !dbRooms.some(d => d.id === r.id) && (Number(r.establishment_id) === Number(config.establishment_id) || String(r.establishment_id) === String(config.establishment_id)));

        let combined = [...dbRooms, ...localRooms];

        if (combined.length > 0) {
          const formatted: Room[] = combined.map((r) => ({
            id: r.id,
            name: r.name || r.room_type || "Habitación Estándar",
            category: r.category || r.room_type || "Habitación Premium",
            description: r.description || "Espaciosa habitación equipada con todas las comodidades para una estadía inolvidable.",
            price_per_night: r.price_per_night || r.price || r.base_price || 60,
            capacity: r.capacity || r.max_guests || 2,
            primary_image: r.primary_image || r.image_url || (r.photos && r.photos[0]) || bannerImage,
            photos: r.photos || [r.primary_image || bannerImage],
            amenities: r.amenities || r.features || [
              "Aire Acondicionado",
              "WiFi de Alta Velocidad",
              "Baño Privado",
              "TV por Cable",
              "Servicio de Limpieza"
            ]
          }));
          setRooms(formatted);
        } else {
          // Fallback de habitaciones atractivas predeterminadas para el establecimiento
          setRooms([
            {
              id: "room-1",
              name: "Apartamento Suite Vista al Mar",
              category: "Suite Familiar",
              description: "Espaciosa suite frente a la costa con balcón privado, cama King, aire acondicionado central y cocina equipada.",
              price_per_night: 75,
              capacity: 4,
              primary_image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop",
              photos: [
                "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop"
              ],
              amenities: ["Vista al Mar", "Balcón Privado", "Cocina Equipada", "WiFi 200MB", "A/C Central", "TV 55\" Smart"]
            },
            {
              id: "room-2",
              name: "Habitación Matrimonial Executive",
              category: "Matrimonial VIP",
              description: "Diseñada para parejas buscando descanso absoluto con lencería de hilo de algodón, baño privado con ducha panorámica y frigobar.",
              price_per_night: 55,
              capacity: 2,
              primary_image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&auto=format&fit=crop",
              photos: [
                "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&auto=format&fit=crop"
              ],
              amenities: ["Cama King Size", "Baño Privado", "Frigobar", "WiFi Gratis", "Caja Fuerte", "A/C Split"]
            },
            {
              id: "room-3",
              name: "Apartamento Dúplex Familiar",
              category: "Apartamento Completo",
              description: "Dos niveles con capacidad hasta 6 personas, ideal para grupos y familias con sala de estar, comedor y terraza.",
              price_per_night: 110,
              capacity: 6,
              primary_image: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&auto=format&fit=crop",
              photos: [
                "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&auto=format&fit=crop"
              ],
              amenities: ["Dos Niveles", "2 Baños Privados", "Terraza Privada", "Cocina Gourmet", "Estacionamiento", "WiFi"]
            }
          ]);
        }
      } catch (e) {
        console.warn("Error cargando habitaciones del tenant:", e);
      } finally {
        setLoadingRooms(false);
      }
    }
    loadRooms();
  }, [config]);

  // Mensaje general para WhatsApp
  const generalWaMsg = encodeURIComponent(
    `Hola ${config.name}, estoy visitando su sitio web oficial (${config.domain}) y deseo solicitar información de reservas. ¿Podrían atenderme?`
  );
  const generalWaUrl = `https://wa.me/${cleanWhatsapp || "584141234567"}?text=${generalWaMsg}`;

  return (
    <div className="min-h-screen bg-[#0e011f] text-slate-100 selection:bg-[#FF0096] selection:text-white font-sans">
      
      {/* ── BARRA DE NAVEGACIÓN CORPORATIVA FLOTANTE ── */}
      <header className="sticky top-0 z-50 bg-[#0e011f]/90 backdrop-blur-md border-b border-[#9B00CC]/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo / Nombre del Establecimiento */}
          <a href="#inicio" className="flex items-center gap-3 group">
            {config.branding?.logo_url ? (
              <img
                src={config.branding.logo_url}
                alt={config.name}
                className="h-10 w-auto object-contain max-w-[160px]"
              />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00C8D4] to-[#9B00CC] flex items-center justify-center text-white font-black font-serif text-lg shadow-lg">
                {config.name.charAt(0)}
              </div>
            )}
            <div>
              <span className="text-lg font-black font-serif text-white tracking-wide group-hover:text-[#00C8D4] transition-colors block leading-tight">
                {config.name}
              </span>
              <span className="text-[10px] text-[#00C8D4] font-bold tracking-widest uppercase block">
                Sello Oficial de Excelencia
              </span>
            </div>
          </a>

          {/* Menú de Navegación */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-300">
            <a href="#inicio" className="hover:text-[#00C8D4] transition-colors">Inicio</a>
            <a href="#habitaciones" className="hover:text-[#00C8D4] transition-colors">Habitaciones & Tarifas</a>
            <a href="#servicios" className="hover:text-[#00C8D4] transition-colors">Servicios</a>
            <a href="#sobre-nosotros" className="hover:text-[#00C8D4] transition-colors">Sobre Nosotros</a>
            <a href="#contacto" className="hover:text-[#00C8D4] transition-colors">Ubicación</a>
          </nav>

          {/* Botón WhatsApp Flotante Header */}
          <a
            href={generalWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg active:scale-95 shrink-0"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">WhatsApp Directo</span>
          </a>

        </div>
      </header>

      {/* ── HERO BANNER FULL-BLEED (ESTILO IMAGEN 2) ── */}
      <section id="inicio" className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden">
        
        {/* Imagen de Fondo Full-Bleed con Scale 1.08 */}
        <div className="absolute inset-0 z-0">
          <img
            src={bannerImage}
            alt={config.name}
            className="w-full h-full object-cover scale-[1.08] filter brightness-95"
          />
          {/* Overlay de Degradado Continuo Suave */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e011f] via-[#0e011f]/65 to-black/40"></div>
        </div>

        {/* Contenido Central Persuasivo */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center space-y-8 animate-fade-in">
          
          {/* Pre-título en Mayúsculas Espaciadas */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0e011f]/80 backdrop-blur border border-[#00C8D4]/40 text-[#00C8D4] text-[11px] font-extrabold tracking-[0.25em] uppercase shadow-2xl">
            <Sparkles className="w-3.5 h-3.5 text-[#FF0096]" />
            HOSPEDAJE DE EXCELENCIA & DISTINCIÓN
          </div>

          {/* Título Principal Centrado en Tipografía Serif */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-serif text-white tracking-tight leading-tight drop-shadow-2xl">
            {config.name}
          </h1>

          {/* Botón Resaltado: Web en Mantenimiento */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2.5 p-[2px] rounded-2xl bg-gradient-to-r from-[#FF0096] via-amber-400 to-[#00C8D4] shadow-2xl animate-pulse hover:scale-105 transition-all">
              <div className="px-5 py-2 rounded-[14px] bg-[#0e011f]/90 backdrop-blur flex items-center gap-2.5">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
                </span>
                <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-amber-300 drop-shadow">
                  🛠️ SITIO WEB EN MANTENIMIENTO
                </span>
              </div>
            </div>

            {/* Subtítulo Persuasivo */}
            <p className="text-base sm:text-xl text-slate-200 font-light max-w-3xl mx-auto leading-relaxed drop-shadow">
              Más que un Hospedaje, su refugio perfecto. Disfrute de una experiencia inolvidable con atención personalizada y garantía directa de tarifa.
            </p>
          </div>

          {/* Barra de Estadísticas y Confianza */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
            <div className="p-3 bg-[#1a0533]/80 backdrop-blur rounded-2xl border border-white/10 text-center">
              <span className="text-lg font-black text-[#00C8D4] block font-serif">⭐ 4.9 / 5</span>
              <span className="text-[10px] text-slate-300 font-medium uppercase">Valoración Huéspedes</span>
            </div>
            <div className="p-3 bg-[#1a0533]/80 backdrop-blur rounded-2xl border border-white/10 text-center">
              <span className="text-lg font-black text-[#FF0096] block font-serif">100%</span>
              <span className="text-[10px] text-slate-300 font-medium uppercase">Garantía Directa</span>
            </div>
            <div className="p-3 bg-[#1a0533]/80 backdrop-blur rounded-2xl border border-white/10 text-center">
              <span className="text-lg font-black text-white block font-serif">24/7</span>
              <span className="text-[10px] text-slate-300 font-medium uppercase">Atención WhatsApp</span>
            </div>
            <div className="p-3 bg-[#1a0533]/80 backdrop-blur rounded-2xl border border-white/10 text-center">
              <span className="text-lg font-black text-[#00C8D4] block font-serif">Starlink</span>
              <span className="text-[10px] text-slate-300 font-medium uppercase">WiFi Ultra Rápido</span>
            </div>
          </div>

          {/* Botones de Acción Principales (Dual Call to Action) */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            
            <a
              href="#habitaciones"
              className="px-8 py-4 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] hover:from-[#00C8D4]/90 hover:to-[#9B00CC]/90 transition-all shadow-xl shadow-cyan-500/20 active:scale-95 flex items-center gap-2"
            >
              <span>Ver Habitaciones & Tarifas</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href={generalWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 transition-all shadow-xl shadow-emerald-900/30 active:scale-95 flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Reservar Directo por WhatsApp</span>
            </a>

          </div>

        </div>

        {/* Indicador de Desplazamiento */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <a href="#habitaciones" className="text-slate-400 hover:text-white transition-colors">
            <ChevronDown className="w-6 h-6" />
          </a>
        </div>

      </section>

      {/* ── SECCIÓN DE FICHAS DE HABITACIONES (IMAGEN 3) ── */}
      <section id="habitaciones" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <span className="text-[11px] tracking-[0.25em] font-extrabold text-[#00C8D4] uppercase block">
            SU REFUGIO DE DESCANSO
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-serif text-white">
            Nuestras Habitaciones & Suites
          </h2>
          <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed">
            Explore nuestras opciones de hospedaje completamente equipadas. Seleccione la opción ideal para su estadía y consulte disponibilidad en tiempo real.
          </p>
        </div>

        {/* GRID DE FICHAS DE HABITACIONES */}
        {loadingRooms ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-[#1a0533] rounded-3xl animate-pulse border border-white/5"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                hotelName={config.name}
                whatsappPhone={whatsapp}
                onOpenDetail={(r) => setSelectedRoom(r)}
              />
            ))}
          </div>
        )}

      </section>

      {/* ── SECCIÓN: SERVICIOS Y COMODIDADES (ICONOS UNICOLOR EN CAJAS SÓLIDAS) ── */}
      <section id="servicios" className="py-20 bg-[#1a0533]/40 border-y border-[#9B00CC]/15 px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-[11px] tracking-[0.25em] font-extrabold text-[#FF0096] uppercase block">
              EXPERIENCIA EXCLUSIVA
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-serif text-white">
              Servicios e Instalaciones Incluidas
            </h2>
            <p className="text-slate-300 text-sm font-light">
              Todo lo que necesita para disfrutar de una estancia cómoda, segura y sin preocupaciones.
            </p>
          </div>

          {/* Grilla de Servicios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Wifi className="w-6 h-6 text-white" />,
                title: "Conexión Starlink High Speed",
                desc: "WiFi de alta velocidad libre en todas las habitaciones y áreas comunes.",
                bg: "bg-[#00C8D4]"
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-white" />,
                title: "Seguridad & Planta Eléctrica",
                desc: "Vigilancia 24 horas y respaldo eléctrico continuo durante su estancia.",
                bg: "bg-[#9B00CC]"
              },
              {
                icon: <Coffee className="w-6 h-6 text-white" />,
                title: "Atención de Desayunos",
                desc: "Opciones gastronómicas locales y frescas servidas a diario.",
                bg: "bg-[#FF0096]"
              },
              {
                icon: <Car className="w-6 h-6 text-white" />,
                title: "Estacionamiento Privado",
                desc: "Espacio de aparcamiento cómodo y seguro dentro de las instalaciones.",
                bg: "bg-emerald-600"
              }
            ].map((service, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#0e011f] border border-white/10 hover:border-[#00C8D4]/40 transition-all duration-300 space-y-4 group"
              >
                {/* Caja de Icono Sólida de Color con Vector Blanco Puro (Regla del Sistema) */}
                <div className={`w-12 h-12 rounded-2xl ${service.bg} flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-white font-serif">{service.title}</h3>
                <p className="text-slate-300 text-xs font-light leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>

        </div>

      </section>

      {/* ── SECCIÓN: ÁREAS E INSTALACIONES DEL ESTABLECIMIENTO ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <span className="text-[11px] tracking-[0.25em] font-extrabold text-[#FF0096] uppercase block">
            INSTALACIONES & ESPACIOS DE DISTINCIÓN
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-serif text-white leading-tight">
            Nuestras Diversas Áreas
          </h2>
          <p className="text-slate-300 text-sm font-light">
            Recorra cada rincón de {config.name}. Diseñado para brindarle máximo confort en cada espacio.
          </p>
        </div>

        {/* Selector de Áreas */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { id: "todas", label: "Todas las Áreas" },
            { id: "piscina", label: "🏊 Piscina & Solárium" },
            { id: "restaurante", label: "🍽️ Restaurante & Gastronomía" },
            { id: "lobby", label: "🏢 Lobby & Recepción" },
            { id: "fachada", label: "🌿 Fachada & Jardines" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveAreaTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeAreaTab === tab.id
                  ? "bg-[#00C8D4] text-slate-950 font-black shadow-lg shadow-cyan-500/20"
                  : "bg-[#1a0533] text-slate-300 hover:text-white border border-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grilla de Fotos por Áreas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(areaPhotos)
            .filter(([key]) => activeAreaTab === "todas" || activeAreaTab === key)
            .flatMap(([areaKey, urls]) => urls.map((url, i) => ({ areaKey, url, id: `${areaKey}-${i}` })))
            .map(item => (
              <div key={item.id} className="relative rounded-2xl overflow-hidden aspect-video border border-white/10 group bg-slate-900">
                <img src={item.url} alt={item.areaKey} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-[10px] font-black uppercase text-white tracking-widest bg-[#FF0096] px-2 py-0.5 rounded-md">
                    {item.areaKey}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* ── SECCIÓN: SOBRE NOSOTROS Y UBICACIÓN CON MAPA SATELITAL ── */}
      <section id="sobre-nosotros" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] tracking-[0.25em] font-extrabold text-[#00C8D4] uppercase block">
              CONOCE NUESTRO ESTABLECIMIENTO
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-serif text-white leading-tight">
              Más que un Hospedaje, Su Casa en la Playa
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed">
              En <strong className="text-white font-semibold">{config.name}</strong> nos esmeramos por ofrecer una atención cálida, personalizada y de primer nivel. Nuestras instalaciones combinan la tranquilidad natural con el confort moderno para que su única preocupación sea descansar.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#00C8D4]" />
                <span>Atención personalizada las 24 horas del día.</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#FF0096]" />
                <span>Ubicación estratégica cerca de atractivos principales.</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#9B00CC]" />
                <span>Reserva directa garantizada sin cargos ocultos.</span>
              </div>
            </div>

            {/* Dirección Badge & Coordenadas GPS */}
            <div className="p-4 rounded-2xl bg-[#1a0533] border border-white/10 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-xs text-slate-200">
                  <div className="p-2.5 bg-[#00C8D4] rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#00C8D4] font-bold uppercase block">Ubicación GPS Verificada</span>
                    <span className="font-semibold text-white">Dominio Oficial: {config.domain}</span>
                  </div>
                </div>

                <a
                  href={generalWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#0e011f] border border-white/15 hover:border-[#00C8D4] transition-colors shrink-0"
                >
                  Cómo Llegar
                </a>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-slate-400 font-mono">
                <span>📍 Coordenadas: 10.6015° N, 66.9346° W</span>
                <span className="text-[#00C8D4] font-bold uppercase">Estado La Guaira, Venezuela</span>
              </div>
            </div>
          </div>

          {/* MAPA SATELITAL INTERACTIVO DEL ESTABLECIMIENTO */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border border-[#00C8D4]/40 shadow-2xl bg-[#0e011f] space-y-0">
              
              {/* Barra de Control del Mapa Satelital */}
              <div className="p-3 bg-[#1a0533] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-white font-serif">Mapa Satelital en Tiempo Real</span>
                </div>
                <div className="flex bg-slate-900 rounded-xl p-1 border border-white/10 gap-1">
                  <button
                    onClick={() => setMapViewMode("satelite")}
                    className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                      mapViewMode === "satelite" ? "bg-[#FF0096] text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🛰️ Satélite
                  </button>
                  <button
                    onClick={() => setMapViewMode("estandar")}
                    className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                      mapViewMode === "estandar" ? "bg-[#00C8D4] text-slate-950" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🗺️ Terrestre
                  </button>
                </div>
              </div>

              {/* Contenedor del Mapa Satelital */}
              <div className="relative h-[380px] w-full overflow-hidden bg-slate-950">
                {mapViewMode === "satelite" ? (
                  <div className="w-full h-full relative">
                    <iframe
                      title="Mapa Satelital del Establecimiento"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      src="https://maps.google.com/maps?q=10.6015,-66.9346&t=k&z=17&ie=UTF8&iwloc=&output=embed"
                      className="w-full h-full filter contrast-105 brightness-95"
                    />
                    <div className="absolute top-4 left-4 bg-[#0e011f]/90 backdrop-blur px-3 py-1.5 rounded-xl border border-white/15 text-[10px] text-white font-bold flex items-center gap-2 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-[#00C8D4]" />
                      <span>Vista Aérea Satelital (Alta Resolución)</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    <iframe
                      title="Mapa Terrestre del Establecimiento"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      src="https://maps.google.com/maps?q=10.6015,-66.9346&t=m&z=15&ie=UTF8&iwloc=&output=embed"
                      className="w-full h-full"
                    />
                  </div>
                )}
              </div>

              <div className="p-4 bg-[#0e011f] border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Sello de Calidad</span>
                  <span className="text-xs font-bold text-white">{config.name} • Red Oficial Hoteles de Venezuela</span>
                </div>
                <Award className="w-5 h-5 text-[#FF0096]" />
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── SECCIÓN DE CIERRE (BOTTOM CTA REGULARES DEL SISTEMA) ── */}
      <section id="contacto" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div 
          className="relative overflow-hidden rounded-3xl p-8 sm:p-14 text-center text-white shadow-2xl space-y-6"
          style={{ background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)" }}
        >
          <span className="text-xs font-extrabold tracking-[0.25em] text-pink-200 uppercase block">
            RESERVA DIRECTA Y GARANTIZADA
          </span>

          <h2 className="text-3xl sm:text-5xl font-black font-serif leading-tight">
            Comience su Escapada Inolvidable
          </h2>

          <p className="text-sm sm:text-base text-white font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
            Consulte disponibilidad en tiempo real directamente con el equipo de recepción de {config.name} y asegure su mejor tarifa sin comisiones.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href={generalWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-2xl font-extrabold text-sm text-[#FF0096] bg-white hover:bg-slate-100 transition-all shadow-xl active:scale-95 flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Contactar recepción por WhatsApp</span>
            </a>
          </div>

        </div>
      </section>

      {/* ── PIE DE PÁGINA CORPORATIVO ── */}
      <footer className="bg-[#080112] border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          
          <div>
            <span className="text-sm font-bold text-white font-serif block">{config.name}</span>
            <span className="text-[11px] text-slate-400">Sitio Web Oficial • Operado bajo tecnología SaaS Hoteles de Venezuela</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
            <span>Teléfono: {phone}</span>
            <span>•</span>
            <span>Dominio: {config.domain}</span>
          </div>

          <div className="text-[10px] text-slate-400">
            © 2026 {config.name}. Todos los derechos reservados.
          </div>

        </div>
      </footer>

      {/* MODAL DETALLE HABITACIÓN */}
      <RoomDetailModal
        room={selectedRoom}
        hotelName={config.name}
        whatsappPhone={whatsapp}
        onClose={() => setSelectedRoom(null)}
      />

    </div>
  );
}
