import React, { useEffect, useState } from "react";
import { 
  MapPin, Phone, Mail, Clock, Star, ShieldCheck, Wifi, Coffee, Compass, 
  Utensils, Car, Sparkles, CheckCircle2, MessageCircle, ExternalLink, Calendar,
  Bed, Users, Award, ChevronDown, Layers, ArrowRight, Heart, Navigation, X
} from "lucide-react";
import { type TenantConfig } from "./tenantContext";
import { createTenantClient } from "./lib/supabaseTenant";
import { RoomCard, type Room } from "./components/RoomCard";
import { RoomDetailModal } from "./components/RoomDetailModal";
import { supabase } from "../lib/supabase";

interface SaaSTenantLandingPageProps {
  config: TenantConfig;
}

const DESTINATION_MAP_INFO: Record<string, { lat: number; lng: number; state: string; name: string }> = {
  "morrocoy": { lat: 10.7933, lng: -68.3214, state: "Falcón", name: "Morrocoy / Tucacas" },
  "tucacas": { lat: 10.7933, lng: -68.3214, state: "Falcón", name: "Tucacas / Morrocoy" },
  "chichiriviche": { lat: 10.8931, lng: -68.2717, state: "Falcón", name: "Chichiriviche / Morrocoy" },
  "roques": { lat: 11.9519, lng: -66.6719, state: "Dependencias Federales", name: "Archipiélago Los Roques" },
  "margarita": { lat: 10.9577, lng: -63.8697, state: "Nueva Esparta", name: "Isla de Margarita" },
  "porlamar": { lat: 10.9577, lng: -63.8697, state: "Nueva Esparta", name: "Porlamar, Margarita" },
  "caracas": { lat: 10.4806, lng: -66.9036, state: "Distrito Capital", name: "Caracas" },
  "guaira": { lat: 10.6015, lng: -66.9346, state: "La Guaira", name: "Estado La Guaira" },
  "maiquetia": { lat: 10.6015, lng: -66.9346, state: "La Guaira", name: "Maiquetía" },
  "merida": { lat: 8.5983, lng: -71.1449, state: "Mérida", name: "Mérida" },
  "mérida": { lat: 8.5983, lng: -71.1449, state: "Mérida", name: "Mérida" },
  "canaima": { lat: 6.2415, lng: -62.8528, state: "Bolívar", name: "Parque Nacional Canaima" },
  "tovar": { lat: 10.4069, lng: -67.2889, state: "Aragua", name: "Colonia Tovar" },
};

export function SaaSTenantLandingPage({ config }: SaaSTenantLandingPageProps) {
  const [establishmentDetail, setEstablishmentDetail] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [activeAreaTab, setActiveAreaTab] = useState<string>("todas");
  const [mapViewMode, setMapViewMode] = useState<"satelite" | "estandar">("satelite");
  const [activeLightboxImg, setActiveLightboxImg] = useState<{ url: string; category: string } | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(true);
  const [areaPhotos, setAreaPhotos] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function fetchDetail() {
      try {
        let dbData = null;
        if (config.establishment_id) {
          const { data } = await supabase
            .from("establishments")
            .select("*, destinations(name, state), categories(name)")
            .eq("id", config.establishment_id)
            .maybeSingle();
          if (data) dbData = data;
        }

        if (!dbData && config.slug) {
          const { data } = await supabase
            .from("establishments")
            .select("*, destinations(name, state), categories(name)")
            .eq("slug", config.slug)
            .maybeSingle();
          if (data) dbData = data;
        }

        if (dbData) setEstablishmentDetail(dbData);
      } catch (e) {
        console.warn("Error cargando detalle del establecimiento:", e);
      }
    }
    fetchDetail();
  }, [config]);

  useEffect(() => {
    async function loadRooms() {
      setLoadingRooms(true);
      try {
        let fetched: Room[] = [];
        if (config.establishment_id) {
          const { data } = await supabase
            .from("rooms")
            .select("*")
            .eq("establishment_id", config.establishment_id)
            .eq("is_active", true);
          if (data && data.length > 0) fetched = data as Room[];
        }

        const customPhotos = JSON.parse(localStorage.getItem("hdv_room_photos") || "{}");

        if (fetched.length === 0) {
          fetched = [
            {
              id: "r1",
              name: "Suite Vista al Mar",
              category: "Suite Premium",
              description: "Habitación espaciosa con cama King Size, balcón privado vista panorámica al mar y jacuzzi.",
              price_per_night: 120,
              capacity: 2,
              beds_count: 1,
              bed_type: "King Size",
              amenities: ["Aire Acondicionado Split", "WiFi Starlink", "Jacuzzi Privado", "TV Smart 50''", "Desayuno Incluido"]
            },
            {
              id: "r2",
              name: "Habitación Familiar Deluxe",
              category: "Familiar",
              description: "Ideal para familias. Cuenta con 2 camas Queen, cuna disponible y cocineta totalmente equipada.",
              price_per_night: 95,
              capacity: 4,
              beds_count: 2,
              bed_type: "Queen",
              amenities: ["Aire Acondicionado Split", "WiFi Starlink", "Cocineta", "TV Smart 43''", "Estacionamiento"]
            },
            {
              id: "r3",
              name: "Habitación Estándar Confort",
              category: "Estándar",
              description: "Acogedora habitación doble con acabados modernos, baño privado y vista a los jardines.",
              price_per_night: 65,
              capacity: 2,
              beds_count: 1,
              bed_type: "Matrimonial",
              amenities: ["Aire Acondicionado", "WiFi Starlink", "Baño Privado", "TV por Cable"]
            }
          ];
        }

        const updatedRooms = fetched.map((room) => {
          const roomCustom = customPhotos[room.id] || customPhotos[String(room.id)];
          if (roomCustom && roomCustom.length > 0) {
            return {
              ...room,
              photos: roomCustom,
              primary_image: roomCustom[0]
            };
          }
          return room;
        });

        setRooms(updatedRooms);
      } catch (e) {
        console.warn("Error cargando habitaciones:", e);
      } finally {
        setLoadingRooms(false);
      }
    }
    loadRooms();
  }, [config]);

  const bannerImage = config.branding?.banner_url || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&auto=format&fit=crop";
  const phone = establishmentDetail?.phone || config.contact?.phone || "+58 412 000 0000";
  const whatsapp = establishmentDetail?.whatsapp || establishmentDetail?.phone || config.contact?.whatsapp || phone;
  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, "");
  const generalWaMsg = encodeURIComponent(`Hola ${config.name}, deseo consultar disponibilidad.`);
  const generalWaUrl = `https://wa.me/${cleanWhatsapp || "584141234567"}?text=${generalWaMsg}`;

  const address = establishmentDetail?.address || "Carretera Principal, Sector Tucacas / Morrocoy";
  const description = establishmentDetail?.description || `En ${config.name} nos esmeramos por ofrecer una atención cálida.`;
  const destName = establishmentDetail?.destinations?.name || "Tucacas / Morrocoy";
  const stateName = establishmentDetail?.destinations?.state || "Falcón";

  const resolveCoordinates = () => {
    if (establishmentDetail?.latitude && establishmentDetail?.longitude) {
      return { lat: Number(establishmentDetail.latitude), lng: Number(establishmentDetail.longitude), state: stateName, name: destName };
    }
    return { lat: 10.7933, lng: -68.3214, state: "Falcón", name: "Morrocoy" };
  };

  const coords = resolveCoordinates();
  const latStr = coords.lat.toFixed(4);
  const lngStr = Math.abs(coords.lng).toFixed(4);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="sticky top-0 z-50 bg-[#0e011f]/95 backdrop-blur-md border-b border-[#9B00CC]/30 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <span className="text-lg font-black font-serif">{config.name}</span>
          <nav className="hidden md:flex gap-6 text-xs font-bold">
            <a href="#inicio" className="hover:text-[#00C8D4]">Inicio</a>
            <a href="#habitaciones" className="hover:text-[#00C8D4]">Habitaciones</a>
            <a href="#contacto" className="hover:text-[#00C8D4]">Ubicación</a>
          </nav>
        </div>
      </header>

      <section id="inicio" className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden">
        <img src={bannerImage} alt={config.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl md:text-6xl font-black font-serif text-white">{config.name}</h1>
          <p className="mt-4 text-slate-200 text-lg">Su refugio perfecto en {destName}</p>
        </div>
      </section>

      <div className="bg-white border-b border-slate-200/80 py-4 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3 p-2">
            <span className="text-xl">🛡️</span>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Mejor Tarifa Oficial Garantizada</span>
              <span className="text-[11px] text-slate-500 font-medium">Sin comisiones de intermediarios</span>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-3 p-2 border-t sm:border-t-0 sm:border-l border-slate-100">
            <span className="text-xl">⚡</span>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Confirmación Inmediata</span>
              <span className="text-[11px] text-slate-500 font-medium">Vía WhatsApp Oficial directo</span>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-3 p-2 border-t sm:border-t-0 sm:border-l border-slate-100">
            <span className="text-xl">🌟</span>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Atención Personalizada 24/7</span>
              <span className="text-[11px] text-slate-500 font-medium">Atendidos por el equipo del hospedaje</span>
            </div>
          </div>
        </div>
      </div>

      <section id="habitaciones" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} hotelName={config.name} whatsappPhone={whatsapp} onOpenDetail={setSelectedRoom} />
          ))}
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-black font-serif text-center mb-12">Nuestras Instalaciones</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(areaPhotos).flatMap(([areaKey, urls]) => urls.map((url, i) => ({ areaKey, url, id: `${areaKey}-${i}` }))).map(item => (
            <div key={item.id} onClick={() => setActiveLightboxImg({ url: item.url, category: item.areaKey })} className="relative rounded-2xl overflow-hidden aspect-video border border-slate-200 cursor-pointer">
              <img src={item.url} alt={item.areaKey} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      <section id="sobre-nosotros" className="py-24 bg-white border-t border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl font-black font-serif">Más que un Hospedaje</h2>
            <p className="text-slate-700">{description}</p>
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#00C8D4]" />
                <span className="font-semibold text-xs">{address}</span>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                <a href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold bg-slate-800 border border-white/15 text-center">Google Maps</a>
                <a href={`https://www.waze.com/ul?ll=${coords.lat},${coords.lng}&navigate=yes`} target="_blank" rel="noopener noreferrer" className="flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold bg-[#00C8D4] text-center">Abrir en Waze</a>
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 h-96 bg-slate-200 rounded-3xl overflow-hidden">
            <iframe title="map" width="100%" height="100%" src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&t=k&z=17&output=embed`} />
          </div>
        </div>
      </section>

      <section id="contacto" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div 
          className="relative overflow-hidden rounded-3xl p-8 sm:p-14 text-center text-white shadow-2xl shadow-pink-500/30 space-y-6"
          style={{ background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 50%, #4F46E5 100%)" }}
        >
          <span className="text-xs font-extrabold tracking-[0.25em] text-pink-100 uppercase block drop-shadow-sm">
            RESERVA DIRECTA Y GARANTIZADA
          </span>

          <h2 className="text-3xl sm:text-5xl font-black font-serif leading-tight !text-white drop-shadow-md">
            Comience su Escapada Inolvidable
          </h2>

          <p className="text-sm sm:text-base !text-white font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
            Consulte disponibilidad en tiempo real directamente con el equipo de recepción de {config.name} y asegure su mejor tarifa sin comisiones.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href={generalWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-2xl font-extrabold text-sm text-[#FF0096] bg-white hover:bg-slate-100 transition-all shadow-xl active:scale-95 flex items-center gap-2.5 cursor-pointer"
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

      {/* ── BOTÓN FLOTANTE WHATSAPP PULSANTE (MANDATORY CRO TRIGGER) ── */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group">
        
        {/* Tooltip informativo en Hover */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl border border-white/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
          <span>¡Chatea con Recepción ahora!</span>
        </div>

        {/* Pulsating Trigger Floating Button */}
        <a
          href={generalWaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
          title="Atención Directa vía WhatsApp"
        >
          {/* Effect Pulsating Ping Radar */}
          <span className="absolute -inset-2 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none" />
          
          <MessageCircle className="w-7 h-7 fill-current relative z-10" />

          {/* Online Status Badge */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
          </span>
        </a>

      </div>

      {/* MODAL LIGHTBOX DE FOTOS */}
      {activeLightboxImg && (
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in cursor-pointer"
          onClick={() => setActiveLightboxImg(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center space-y-3" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setActiveLightboxImg(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-[#FF0096] text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-black">
              <img src={activeLightboxImg.url} alt={activeLightboxImg.category} className="max-h-[80vh] w-auto object-contain rounded-2xl" />
              <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur px-4 py-2 rounded-xl text-xs font-bold text-white uppercase border border-white/10">
                🏷️ ÁREA: {activeLightboxImg.category}
              </div>
            </div>
          </div>
        </div>
      )}

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
