import React, { useEffect, useState } from "react";
import { 
  MapPin, Phone, Mail, Clock, Star, ShieldCheck, Wifi, Coffee, Compass, 
  Utensils, Car, Sparkles, CheckCircle2, MessageCircle, ExternalLink, Calendar,
  Bed, Users, Award, ChevronDown, Layers, ArrowRight, Heart, Navigation, X
} from "lucide-react";
import { type TenantConfig } from "./tenantContext";
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

        if (!dbData) {
          const localEsts = JSON.parse(localStorage.getItem("hdv_mock_establishments") || "[]");
          dbData = localEsts.find((e: any) => e.id === config.establishment_id || e.slug === config.slug);
        }

        if (dbData) setEstablishmentDetail(dbData);
      } catch (e) {
        console.warn("Error cargando detalle del establecimiento para SaaS landing:", e);
      }
    }
    fetchDetail();
  }, [config]);

  useEffect(() => {
    function loadAreaPhotos() {
      try {
        const saved = localStorage.getItem("hdv_area_photos");
        if (saved) {
          const parsed = JSON.parse(saved);
          const matched = parsed[config.establishment_id] || 
                          parsed[String(config.establishment_id)] || 
                          (establishmentDetail?.id && parsed[establishmentDetail.id]) ||
                          (establishmentDetail?.id && parsed[String(establishmentDetail.id)]) ||
                          parsed[config.slug] || 
                          (establishmentDetail?.slug && parsed[establishmentDetail.slug]);
          if (matched && Object.keys(matched).length > 0) {
            setAreaPhotos(matched);
            return;
          }

          const anyWithPhotos = Object.values(parsed).find((val: any) => 
            val && typeof val === "object" && Object.values(val).some((arr: any) => Array.isArray(arr) && arr.length > 0)
          );
          if (anyWithPhotos) {
            setAreaPhotos(anyWithPhotos as Record<string, string[]>);
            return;
          }
        }
      } catch (e) {}

      setAreaPhotos({
        piscina: [
          "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&auto=format&fit=crop"
        ],
        restaurante: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop"],
        lobby: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop"],
        fachada: ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&auto=format&fit=crop"],
      });
    }

    loadAreaPhotos();
    window.addEventListener("storage", loadAreaPhotos);
    window.addEventListener("hdv_area_photos_updated", loadAreaPhotos);
    return () => {
      window.removeEventListener("storage", loadAreaPhotos);
      window.removeEventListener("hdv_area_photos_updated", loadAreaPhotos);
    };
  }, [config, establishmentDetail]);

  useEffect(() => {
    async function loadRooms() {
      setLoadingRooms(true);
      try {
        let dbRooms: Room[] = [];
        const currentEstablishmentId = config.establishment_id || establishmentDetail?.id || 1;

        console.log("CARGANDO HABITACIONES - ESTABLECIMIENTO ID:", currentEstablishmentId);

        // 1. Consultar tabla 'rooms'
        try {
          const { data: dataRooms, error: errorRooms } = await supabase
            .from("rooms")
            .select("*")
            .eq("establishment_id", currentEstablishmentId);

          console.log("SUPABASE 'rooms' RESPONSE:", { data: dataRooms, error: errorRooms });
          if (errorRooms) console.error("ERROR SUPABASE 'rooms':", errorRooms);

          if (!errorRooms && dataRooms && dataRooms.length > 0) {
            dbRooms = dataRooms as Room[];
          }
        } catch (err) {
          console.warn("Supabase rooms fetch warning:", err);
        }

        // 2. Si 'rooms' no devolvió registros, consultar tabla alternativa 'habitaciones'
        if (dbRooms.length === 0) {
          try {
            const { data: dataHab, error: errorHab } = await supabase
              .from("habitaciones")
              .select("*");

            console.log("SUPABASE 'habitaciones' RESPONSE:", { data: dataHab, error: errorHab });
            if (errorHab) console.error("ERROR SUPABASE 'habitaciones':", errorHab);

            if (!errorHab && dataHab && dataHab.length > 0) {
              const filteredHab = dataHab.filter((h: any) =>
                Number(h.establishment_id) === Number(currentEstablishmentId) ||
                String(h.establishment_id) === String(currentEstablishmentId) ||
                !h.establishment_id
              );
              dbRooms = (filteredHab.length > 0 ? filteredHab : dataHab) as Room[];
            }
          } catch (e2) {
            console.warn("Error consultando tabla 'habitaciones':", e2);
          }
        }

        console.log("HABITACIONES ENCONTRADAS EN DB:", dbRooms);

        // Leer habitaciones reales guardadas desde el Módulo de Inventario de Habitaciones (hdv_custom_rooms)
        const localRoomsKey = "hdv_custom_rooms";
        let localRooms: any[] = [];
        try {
          const rawLocal = localStorage.getItem(localRoomsKey);
          if (rawLocal) {
            const parsedLocal = JSON.parse(rawLocal);
            if (Array.isArray(parsedLocal) && parsedLocal.length > 0) {
              const filtered = parsedLocal.filter((r: any) => {
                if (r.is_active === false) return false;
                if (Number(r.establishment_id) === Number(currentEstablishmentId) || String(r.establishment_id) === String(currentEstablishmentId)) return true;
                if (config.slug && r.establishment_slug === config.slug) return true;
                if (Number(r.establishment_id) === 1 || Number(r.establishment_id) === 101) return true;
                return false;
              });
              localRooms = filtered.length > 0 ? filtered : parsedLocal.filter((r: any) => r.is_active !== false);
            }
          }
        } catch (e) {}

        // Combinar habitaciones reales de DB y locales evitando duplicados
        const combinedMap = new Map<string, Room>();
        [...dbRooms, ...localRooms].forEach((r: any) => {
          const key = String(r.id || r.nombre || r.title || r.name);
          const roomTitle = r.nombre || r.title || r.name;
          const coverImage = r.cover_image || (r.fotos && r.fotos[0]) || r.primary_image || r.image_url || (r.photos && r.photos[0]);
          const categoryName = r.categoria || r.tipo_unidad || r.category || "Habitación Premium";
          const roomPrice = r.tarifa_base || r.price_usd || r.price_per_night || r.price || r.base_price || 75;
          const roomCapacity = r.capacidad_max || r.max_guests || r.capacity || 2;
          const roomAmenities = r.comodidades || r.amenities || r.features;

          combinedMap.set(key, {
            ...r,
            id: r.id || key,
            name: roomTitle,
            nombre: roomTitle,
            title: roomTitle,
            category: categoryName,
            categoria: categoryName,
            tipo_unidad: categoryName,
            description: r.descripcion || r.description,
            descripcion: r.descripcion || r.description,
            price_per_night: roomPrice,
            tarifa_base: roomPrice,
            price_usd: roomPrice,
            capacity: roomCapacity,
            capacidad_max: roomCapacity,
            max_guests: roomCapacity,
            beds_count: r.beds_count || 1,
            bed_type: r.bed_type || "Matrimonial",
            primary_image: coverImage,
            cover_image: coverImage,
            photos: r.photos || (coverImage ? [coverImage] : []),
            fotos: r.fotos || (coverImage ? [coverImage] : []),
            amenities: roomAmenities,
            comodidades: roomAmenities
          });
        });

        let fetched = Array.from(combinedMap.values());

        // Garantizar inventario si la DB aún no ha sido poblada
        if (fetched.length === 0) {
          fetched = [
            {
              id: "101",
              name: "Apartamento Suite Vista al Mar",
              nombre: "Apartamento Suite Vista al Mar",
              category: "Suite Familiar",
              description: "Espaciosa suite frente a la costa con balcón privado, cama King, aire acondicionado central y cocina equipada.",
              price_per_night: 75,
              capacity: 4,
              beds_count: 2,
              bed_type: "King Size",
              amenities: ["wifi", "aire", "balcon", "vista_mar", "cocina_equipada", "tv_cable"]
            },
            {
              id: "102",
              name: "Habitación Matrimonial Executive",
              nombre: "Habitación Matrimonial Executive",
              category: "Matrimonial VIP",
              description: "Diseñada para parejas buscando descanso absoluto con lencería de hilo de algodón, baño privado con ducha panorámica y frigobar.",
              price_per_night: 55,
              capacity: 2,
              beds_count: 1,
              bed_type: "Matrimonial",
              amenities: ["wifi", "aire", "banio_privado", "nevera", "caja_fuerte"]
            },
            {
              id: "103",
              name: "Apartamento Dúplex Familiar",
              nombre: "Apartamento Dúplex Familiar",
              category: "Apartamento Completo",
              description: "Dos niveles con capacidad hasta 6 personas, ideal para grupos y familias con sala de estar, comedor y terraza.",
              price_per_night: 110,
              capacity: 6,
              beds_count: 3,
              bed_type: "Queen + 2 Individuales",
              amenities: ["wifi", "aire", "balcon", "cocina_equipada", "tv_cable"]
            }
          ];
        }

        const customPhotos = JSON.parse(localStorage.getItem("hdv_room_photos") || "{}");

        const updatedRooms = fetched.map((room, index) => {
          const numericId = String(room.id).replace(/\D/g, "");
          const positionId = String(101 + index);
          const simpleIndex = String(index + 1);

          const keysToTry = [
            room.id,
            String(room.id),
            numericId,
            positionId,
            simpleIndex,
            room.name,
            room.nombre,
            `r${numericId}`
          ];

          let roomCustom: string[] | null = null;
          for (const k of keysToTry) {
            if (k && customPhotos[k] && customPhotos[k].length > 0) {
              roomCustom = customPhotos[k];
              break;
            }
          }

          // Evaluar propiedades de fotos reales subidas en el panel
          const realPhotos =
            roomCustom ||
            (Array.isArray(room.fotos) && room.fotos.length > 0 ? room.fotos : null) ||
            (Array.isArray((room as any).galeria) && (room as any).galeria.length > 0 ? (room as any).galeria : null) ||
            (Array.isArray(room.photos) && room.photos.length > 0 ? room.photos : null) ||
            [(room as any).foto_principal || (room as any).imagen_portada || room.cover_image || room.primary_image || room.image_url || (room as any).imagen || (room as any).foto].filter(Boolean);

          const finalPhotos = realPhotos && realPhotos.length > 0 ? realPhotos : ["/placeholder-hotel.jpg"];

          return {
            ...room,
            primary_image: finalPhotos[0],
            photos: finalPhotos,
            fotos: finalPhotos
          };
        });

        setRooms(updatedRooms);
      } catch (e) {
        console.warn("Error cargando habitaciones:", e);
      } finally {
        setLoadingRooms(false);
      }
    }

    loadRooms();
    window.addEventListener("storage", loadRooms);
    window.addEventListener("hdv_custom_rooms_updated", loadRooms);
    window.addEventListener("hdv_room_photos_updated", loadRooms);
    return () => {
      window.removeEventListener("storage", loadRooms);
      window.removeEventListener("hdv_custom_rooms_updated", loadRooms);
      window.removeEventListener("hdv_room_photos_updated", loadRooms);
    };
  }, [config, establishmentDetail]);

  const bannerImage = config.branding?.banner_url || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1600&auto=format&fit=crop";
  const phone = establishmentDetail?.phone || config.contact?.phone || "+58 412 000 0000";
  const whatsapp = establishmentDetail?.whatsapp || establishmentDetail?.phone || config.contact?.whatsapp || phone;
  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, "");

  const address = establishmentDetail?.address || "Carretera Principal, Sector Tucacas / Morrocoy";
  const description = establishmentDetail?.description || `En ${config.name} nos esmeramos por ofrecer una atención cálida, personalizada y de primer nivel. Nuestras instalaciones combinan la tranquilidad natural con el confort moderno para que su única preocupación sea descansar.`;
  const destName = establishmentDetail?.destinations?.name || establishmentDetail?.destination_name || "Tucacas / Morrocoy";
  const stateName = establishmentDetail?.destinations?.state || establishmentDetail?.state || "Falcón";

  const resolveCoordinates = () => {
    if (establishmentDetail?.latitude && establishmentDetail?.longitude) {
      return {
        lat: Number(establishmentDetail.latitude),
        lng: Number(establishmentDetail.longitude),
        state: stateName,
        name: destName
      };
    }

    const searchKey = `${config.slug} ${config.name} ${destName} ${stateName} ${address}`.toLowerCase();
    for (const [key, val] of Object.entries(DESTINATION_MAP_INFO)) {
      if (searchKey.includes(key)) {
        return val;
      }
    }

    if (searchKey.includes("posada") || searchKey.includes("mar") || searchKey.includes("beach")) {
      return DESTINATION_MAP_INFO["morrocoy"];
    }

    return { lat: 10.7933, lng: -68.3214, state: stateName || "Falcón", name: destName || "Morrocoy" };
  };

  const coords = resolveCoordinates();
  const latStr = coords.lat.toFixed(4);
  const lngStr = Math.abs(coords.lng).toFixed(4);

  const generalWaMsg = encodeURIComponent(
    `Hola ${config.name}, estoy visitando su sitio web oficial (${config.domain}) y deseo solicitar información de reservas. ¿Podrían atenderme?`
  );
  const generalWaUrl = `https://wa.me/${cleanWhatsapp || "584141234567"}?text=${generalWaMsg}`;

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#FF0096] selection:text-white font-sans">
      
      <header className="sticky top-0 z-50 bg-[#0e011f]/95 backdrop-blur-md border-b border-[#9B00CC]/30 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
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

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-300">
            <a href="#inicio" className="hover:text-[#00C8D4] transition-colors">Inicio</a>
            <a href="#habitaciones" className="hover:text-[#00C8D4] transition-colors">Habitaciones & Tarifas</a>
            <a href="#servicios" className="hover:text-[#00C8D4] transition-colors">Servicios</a>
            <a href="#sobre-nosotros" className="hover:text-[#00C8D4] transition-colors">Sobre Nosotros</a>
            <a href="#contacto" className="hover:text-[#00C8D4] transition-colors">Ubicación</a>
          </nav>

          <a
            href={generalWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-black text-white bg-[#25D366] hover:bg-[#20bd5a] transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">WhatsApp Directo</span>
          </a>

        </div>
      </header>

      <section id="inicio" className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-950">
        
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={bannerImage}
            alt={config.name}
            className="w-full h-full object-cover scale-[1.08] filter brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white/70 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center space-y-8 animate-fade-in">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur border border-[#00C8D4]/40 text-[#00C8D4] text-[11px] font-extrabold tracking-[0.25em] uppercase shadow-2xl">
            <Sparkles className="w-3.5 h-3.5 text-[#FF0096]" />
            EL PARAÍSO TE ESPERA • HOSPEDAJE DE EXCELENCIA
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-serif text-white tracking-tight leading-tight drop-shadow-2xl">
            {config.name}
          </h1>

          <div className="flex flex-col items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2.5 p-[2px] rounded-2xl bg-[#FF0096] shadow-2xl animate-pulse hover:scale-105 transition-all">
              <div className="px-5 py-2 rounded-[14px] bg-slate-900/90 backdrop-blur flex items-center gap-2.5">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
                </span>
                <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-amber-300 drop-shadow">
                  🛠️ SITIO WEB EN MANTENIMIENTO
                </span>
              </div>
            </div>

            <p className="text-base sm:text-xl text-white font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
              Más que un Hospedaje, su refugio perfecto. Disfrute de una experiencia inolvidable con atención personalizada y garantía directa de tarifa.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
            <div className="p-3 bg-slate-900/85 backdrop-blur rounded-2xl border border-white/10 text-center shadow-xl">
              <span className="text-lg font-black text-[#00C8D4] block font-serif">⭐ 4.9 / 5</span>
              <span className="text-[10px] text-slate-200 font-medium uppercase">Valoración Huéspedes</span>
            </div>
            <div className="p-3 bg-slate-900/85 backdrop-blur rounded-2xl border border-white/10 text-center shadow-xl">
              <span className="text-lg font-black text-[#FF0096] block font-serif">100%</span>
              <span className="text-[10px] text-slate-200 font-medium uppercase">Garantía Directa</span>
            </div>
            <div className="p-3 bg-slate-900/85 backdrop-blur rounded-2xl border border-white/10 text-center shadow-xl">
              <span className="text-lg font-black text-white block font-serif">24/7</span>
              <span className="text-[10px] text-slate-200 font-medium uppercase">Atención WhatsApp</span>
            </div>
            <div className="p-3 bg-slate-900/85 backdrop-blur rounded-2xl border border-white/10 text-center shadow-xl">
              <span className="text-lg font-black text-[#00C8D4] block font-serif">Starlink</span>
              <span className="text-[10px] text-slate-200 font-medium uppercase">WiFi Ultra Rápido</span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            
            <a
              href="#habitaciones"
              className="px-8 py-4 rounded-2xl font-extrabold text-sm text-white bg-[#00C8D4] hover:bg-[#00b0bc] transition-all shadow-xl active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Ver Habitaciones & Tarifas</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href={generalWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-2xl font-extrabold text-sm text-white bg-[#25D366] hover:bg-[#20bd5a] transition-all shadow-xl active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Reservar Directo por WhatsApp</span>
            </a>

          </div>

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
        
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <span className="text-[11px] tracking-[0.25em] font-extrabold text-[#00C8D4] uppercase block">
            SU REFUGIO DE DESCANSO
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-serif text-slate-900">
            Nuestras Habitaciones & Suites
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed">
            Explore nuestras opciones de hospedaje completamente equipadas. Seleccione la opción ideal para su estadía y consulte disponibilidad en tiempo real.
          </p>
        </div>

        {loadingRooms ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-slate-100 rounded-3xl animate-pulse border border-slate-200"></div>
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

      <section id="servicios" className="py-20 bg-slate-50 border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-[11px] tracking-[0.25em] font-extrabold text-[#FF0096] uppercase block">
              EXPERIENCIA EXCLUSIVA
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-serif text-slate-900">
              Servicios e Instalaciones Incluidas
            </h2>
            <p className="text-slate-600 text-sm font-normal">
              Todo lo que necesita para disfrutar de una estancia cómoda, segura y sin preocupaciones.
            </p>
          </div>

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
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4 group"
              >
                <div className={`w-12 h-12 rounded-2xl ${service.bg} flex items-center justify-center shadow-md shrink-0 group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">{service.title}</h3>
                <p className="text-slate-600 text-xs font-normal leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>

        </div>

      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <span className="text-[11px] tracking-[0.25em] font-extrabold text-[#FF0096] uppercase block">
            INSTALACIONES & ESPACIOS DE DISTINCIÓN
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-serif text-slate-900 leading-tight">
            Nuestras Diversas Áreas
          </h2>
          <p className="text-slate-600 text-sm font-normal">
            Recorra cada rincón de {config.name}. Haz clic en cualquier imagen para ampliarla en alta resolución.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { id: "todas", label: "Todas las Áreas" },
            { id: "piscina", label: "🏊 Piscina & Solárium" },
            { id: "restaurante", label: "🍽️ Restaurante & Gastronomía" },
            { id: "parque", label: "🌳 Parque & Recreación" },
            { id: "fachada", label: "🏛️ Fachada & Exteriores" },
            { id: "lobby", label: "🛋️ Lobby & Recepción" },
            { id: "spa", label: "💆‍♀️ Spa & Bienestar" },
            { id: "eventos", label: "🎭 Salón de Eventos" },
            { id: "deportes", label: "🏋️ Gimnasio & Deportes" },
            { id: "playa", label: "🏖️ Playa & Marina" }
          ].filter(tab => tab.id === "todas" || (areaPhotos[tab.id] && areaPhotos[tab.id].length > 0)).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveAreaTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeAreaTab === tab.id
                  ? "bg-[#00C8D4] text-white font-black shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(areaPhotos)
            .filter(([key]) => activeAreaTab === "todas" || activeAreaTab === key)
            .flatMap(([areaKey, urls]) => urls.map((url, i) => ({ areaKey, url, id: `${areaKey}-${i}` })))
            .map(item => (
              <div 
                key={item.id} 
                onClick={() => setActiveLightboxImg({ url: item.url, category: item.areaKey })}
                className="relative rounded-2xl overflow-hidden aspect-video border border-slate-200 group bg-slate-100 cursor-pointer hover:border-[#00C8D4] shadow-sm hover:shadow-lg transition-all"
              >
                <img src={item.url} alt={item.areaKey} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                  <span className="text-[10px] font-black uppercase text-white tracking-widest bg-[#FF0096] px-2 py-0.5 rounded-md">
                    {item.areaKey}
                  </span>
                  <span className="text-[10px] font-extrabold text-white bg-slate-900/80 px-2 py-0.5 rounded-md">🔍 Ampliar</span>
                </div>
              </div>
            ))}
        </div>
      </section>

      <section id="sobre-nosotros" className="py-24 bg-white border-t border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] tracking-[0.25em] font-extrabold text-[#00C8D4] uppercase block">
              CONOCE NUESTRO ESTABLECIMIENTO
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-serif text-slate-900 leading-tight">
              Más que un Hospedaje, Su Casa en la Playa
            </h2>
            <p className="text-slate-700 text-sm sm:text-base font-normal leading-relaxed">
              {description}
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#00C8D4]" />
                <span>Atención personalizada las 24 horas del día.</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#FF0096]" />
                <span>Ubicación estratégica: {address} ({destName}).</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#9B00CC]" />
                <span>Reserva directa garantizada sin cargos ocultos.</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-xs text-slate-200">
                  <div className="p-2.5 bg-[#00C8D4] rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#00C8D4] font-bold uppercase block">Ubicación GPS Verificada</span>
                    <span className="font-semibold text-white truncate max-w-[200px] block">{address}</span>
                  </div>
                </div>

                <a
                  href={generalWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 border border-white/15 hover:border-[#00C8D4] transition-colors shrink-0"
                >
                  Cómo Llegar
                </a>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-slate-400 font-mono">
                <span>📍 Coordenadas: {latStr}° N, {lngStr}° W</span>
                <span className="text-[#00C8D4] font-bold uppercase">Estado {coords.state}, Venezuela</span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold text-white bg-slate-800 hover:bg-slate-700 border border-white/15 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#00C8D4]" />
                  <span>Google Maps</span>
                </a>
                <a
                  href={`https://www.waze.com/ul?ll=${coords.lat},${coords.lng}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold text-white bg-[#00C8D4] hover:bg-[#00b0bc] transition-all text-center flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-white" />
                  <span>Abrir en Waze</span>
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-2xl bg-white space-y-0">
              
              <div className="p-3 bg-slate-900 border-b border-white/10 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-white font-serif">Mapa Satelital ({destName})</span>
                </div>
                <div className="flex bg-slate-800 rounded-xl p-1 border border-white/10 gap-1">
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
                      mapViewMode === "estandar" ? "bg-[#00C8D4] text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🗺️ Terrestre
                  </button>
                </div>
              </div>

              <div className="relative h-[380px] w-full overflow-hidden bg-slate-100">
                {mapViewMode === "satelite" ? (
                  <div className="w-full h-full relative">
                    <iframe
                      title="Mapa Satelital del Establecimiento"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&t=k&z=17&ie=UTF8&iwloc=&output=embed`}
                      className="w-full h-full filter contrast-105 brightness-95"
                    />
                    <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-xl border border-white/15 text-[10px] text-white font-bold flex items-center gap-2 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-[#00C8D4]" />
                      <span>Vista Aérea Satelital: {destName} ({coords.state})</span>
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
                      src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&t=m&z=15&ie=UTF8&iwloc=&output=embed`}
                      className="w-full h-full"
                    />
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-900 border-t border-white/10 flex items-center justify-between text-white">
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

      {/* ── SECCIÓN DE CIERRE (BOTTOM CTA BANNER ANCHO COMPLETO EN COLORES SÓLIDOS OFICIALES) ── */}
      <section id="contacto" className="w-full m-0 bg-[#FF0096] py-16 sm:py-20 px-4 sm:px-6 shadow-2xl">
        <div className="max-w-4xl mx-auto text-center text-white space-y-6">
          
          <span className="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-pink-100 uppercase block drop-shadow">
            RESERVA DIRECTA Y GARANTIZADA
          </span>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black font-serif leading-tight !text-white drop-shadow-md">
            Comience su Escapada Inolvidable
          </h2>

          <p className="text-sm sm:text-base !text-white font-medium max-w-2xl mx-auto leading-relaxed drop-shadow">
            Consulte disponibilidad en tiempo real directamente con el equipo de recepción de {config.name} y asegure su mejor tarifa sin comisiones.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href={generalWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full font-extrabold text-sm text-[#FF0096] bg-white hover:bg-slate-100 transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-3 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-[#25D366] text-[#25D366]" />
              <span>Contactar recepción por WhatsApp</span>
            </a>
          </div>

        </div>
      </section>

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

      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group">
        
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl border border-white/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
          <span>¡Chatea con Recepción ahora!</span>
        </div>

        <a
          href={generalWaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
          title="Atención Directa vía WhatsApp"
        >
          <span className="absolute -inset-2 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none" />
          
          <MessageCircle className="w-7 h-7 fill-current relative z-10" />

          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
          </span>
        </a>

      </div>

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

      <RoomDetailModal
        room={selectedRoom}
        hotelName={config.name}
        whatsappPhone={whatsapp}
        onClose={() => setSelectedRoom(null)}
      />

    </div>
  );
}
