import React, { useEffect, useState } from "react";
import { 
  MapPin, Phone, Mail, Clock, Star, ShieldCheck, Wifi, Coffee, Compass, 
  Utensils, Car, Sparkles, CheckCircle2, MessageCircle, ExternalLink, Calendar,
  Bed, Users, Award, ChevronDown, Layers, ArrowRight, Heart, Navigation, X, ShoppingBag,
  ChefHat, Flame, Fish, Waves, Beef, Wine, Cake, Soup, Plus, Minus, Search
} from "lucide-react";
import { type TenantConfig } from "./tenantContext";
import { RoomCard, type Room } from "./components/RoomCard";
import { RoomDetailModal } from "./components/RoomDetailModal";
import { supabase } from "../lib/supabase";
import { OLEAJE_CATEGORIES, OLEAJE_MENU_ITEMS, OLEAJE_ZONES, type OleajeDish, type OleajeZone } from "./lib/oleajeMenuData";
import { PERLA_NEGRA_ROOMS, PERLA_NEGRA_ROOM_TYPES } from "./lib/perlaNegraData";
import { POSModule } from "./templates/components/POSModule";

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
  const [cartRooms, setCartRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(true);
  const [areaPhotos, setAreaPhotos] = useState<Record<string, string[]>>({});

  const isRestaurant = config.business_type === "restaurant" || (config.slug && config.slug.toLowerCase().includes("oleaje"));
  const isPerlaNegra = (config.slug && config.slug.toLowerCase().includes("perla-negra")) || config.establishment_id === 102 || (config.name && config.name.toLowerCase().includes("perla negra"));
  const isMyCampers = (config.slug && config.slug.toLowerCase().includes("my-campers")) || config.establishment_id === 103 || (config.name && config.name.toLowerCase().includes("my campers"));
  const [activeMenuCategory, setActiveMenuCategory] = useState<string>("all");
  const [orderCart, setOrderCart] = useState<{ dish: OleajeDish; count: number }[]>([]);

  const addDishToCart = (dish: OleajeDish) => {
    setOrderCart(prev => {
      const idx = prev.findIndex(item => item.dish.id === dish.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], count: updated[idx].count + 1 };
        return updated;
      }
      return [...prev, { dish, count: 1 }];
    });
  };

  const removeDishFromCart = (dishId: string) => {
    setOrderCart(prev => {
      const existing = prev.find(item => item.dish.id === dishId);
      if (existing && existing.count > 1) {
        return prev.map(item => item.dish.id === dishId ? { ...item, count: item.count - 1 } : item);
      }
      return prev.filter(item => item.dish.id !== dishId);
    });
  };

  const totalOrderPrice = orderCart.reduce((sum, i) => sum + i.dish.price * i.count, 0);

  const toggleCartRoom = (room: Room) => {
    setCartRooms(prev => {
      const exists = prev.some(r => String(r.id) === String(room.id));
      if (exists) return prev.filter(r => String(r.id) !== String(room.id));
      return [...prev, room];
    });
  };

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
      // 1. Priorizar fotos de instalaciones reales guardadas en Supabase DB para este establecimiento
      const dbFacilityPhotos = establishmentDetail?.facility_photos;
      if (dbFacilityPhotos && typeof dbFacilityPhotos === "object" && Object.keys(dbFacilityPhotos).length > 0) {
        const hasAnyPhoto = Object.values(dbFacilityPhotos).some((arr: any) => Array.isArray(arr) && arr.length > 0);
        if (hasAnyPhoto) {
          setAreaPhotos(dbFacilityPhotos as Record<string, string[]>);
          return;
        }
      }

      // 2. Probar estado local si está en el mismo dominio
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

      if (isMyCampers) {
        setAreaPhotos({
          piscina: ["/images/my-campers/camper_1.jpg", "/images/my-campers/camper_2.jpg", "/images/my-campers/camper_3.jpg", "/images/my-campers/camper_4.jpg", "/images/my-campers/camper_5.jpg"],
          restaurante: ["/images/my-campers/camper_6.jpg", "/images/my-campers/camper_7.jpg", "/images/my-campers/camper_8.jpg", "/images/my-campers/camper_9.jpg", "/images/my-campers/camper_10.jpg"],
          lobby: ["/images/my-campers/camper_11.jpg", "/images/my-campers/camper_12.jpg", "/images/my-campers/camper_13.jpg"],
          fachada: ["/images/my-campers/banner.jpg", "/images/my-campers/camper_14.jpg", "/images/my-campers/camper_15.jpg"],
        });
        return;
      }

      if (isPerlaNegra) {
        setAreaPhotos({
          piscina: ["/images/perla-negra/facade.jpg", "/images/perla-negra/room_1.jpg", "/images/perla-negra/room_2.jpg", "/images/perla-negra/room_3.jpg"],
          restaurante: ["/images/perla-negra/room_1.jpg", "/images/perla-negra/room_2.jpg"],
          lobby: ["/images/perla-negra/facade.jpg"],
          fachada: ["/images/perla-negra/facade.jpg"],
        });
        return;
      }

      if (isRestaurant) {
        setAreaPhotos({
          piscina: [
            "/images/oleaje/oleaje_1.jpg",
            "/images/oleaje/oleaje_2.jpg",
            "/images/oleaje/oleaje_6.jpg",
            "/images/oleaje/oleaje_7.jpg"
          ],
          restaurante: [
            "/images/oleaje/oleaje_3.jpg",
            "/images/oleaje/oleaje_4.jpg",
            "/images/oleaje/oleaje_5.jpg",
            "/images/oleaje/oleaje_8.jpg",
            "/images/oleaje/oleaje_9.jpg",
            "/images/oleaje/oleaje_10.jpg",
            "/images/oleaje/oleaje_11.jpg",
            "/images/oleaje/oleaje_12.jpg"
          ],
          lobby: [
            "/images/oleaje/oleaje_13.jpg",
            "/images/oleaje/oleaje_14.jpg",
            "/images/oleaje/oleaje_15.jpg"
          ],
          fachada: [
            "/images/oleaje/oleaje_1.jpg",
            "/images/oleaje/oleaje_2.jpg"
          ]
        });
        return;
      }

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

          console.log("DATOS REALES DE HABITACIONES:", dataRooms);
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

            console.log("DATOS REALES DE HABITACIONES (habitaciones):", dataHab);
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

        console.log("DATOS REALES DE HABITACIONES (COMBINADOS):", dbRooms);

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
                if (Number(r.establishment_id) === 1 || Number(r.establishment_id) === 2 || Number(r.establishment_id) === 101) return true;
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

        if (isPerlaNegra) {
          fetched = PERLA_NEGRA_ROOMS as any[];
        }

        // Garantizar inventario dinámico de 6 unidades para las aplicaciones SaaS
        if (fetched.length < 6) {
          const defaultCatalog = [
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
            },
            {
              id: "104",
              name: "Suite Presidencial Panorama Mar",
              nombre: "Suite Presidencial Panorama Mar",
              category: "Suite Premium VIP",
              description: "Máximo confort costero con terraza panorámica de 180°, jacuzzi privado, área de estar y servicio preferencial.",
              price_per_night: 140,
              capacity: 4,
              beds_count: 2,
              bed_type: "King Size + Sofa Cama",
              amenities: ["wifi", "aire", "jacuzzi", "vista_mar", "balcon", "tv_cable"]
            },
            {
              id: "105",
              name: "Habitación Doble Deluxe",
              nombre: "Habitación Doble Deluxe",
              category: "Doble Confort",
              description: "Equipada con dos camas Queen, ambiente climatizado, escritorio de trabajo y vista directa a las áreas de descanso.",
              price_per_night: 65,
              capacity: 4,
              beds_count: 2,
              bed_type: "Queen Size",
              amenities: ["wifi", "aire", "banio_privado", "tv_cable", "nevera"]
            },
            {
              id: "106",
              name: "Cabaña Familiar Vista al Jardín",
              nombre: "Cabaña Familiar Vista al Jardín",
              category: "Cabaña Privada",
              description: "Ubicada entre áreas verdes con ambiente tranquilo, porche privado, hamacas y cocineta totalmente equipada.",
              price_per_night: 95,
              capacity: 5,
              beds_count: 3,
              bed_type: "Matrimonial + 2 Individuales",
              amenities: ["wifi", "aire", "cocina_equipada", "estacionamiento", "tv_cable"]
            }
          ];

          // Combinar registros manteniendo prioridad de los creados/modificados
          const existingIds = new Set(fetched.map(r => String(r.id)));
          defaultCatalog.forEach(item => {
            if (!existingIds.has(item.id)) {
              fetched.push(item as any);
            }
          });
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

          // Evaluar propiedades de fotos reales subidas en el panel o base de datos Supabase
          const realPhotos =
            roomCustom ||
            (Array.isArray(room.photos) && room.photos.length > 0 && !room.photos[0].includes("unsplash") ? room.photos : null) ||
            (Array.isArray(room.fotos) && room.fotos.length > 0 && !room.fotos[0].includes("unsplash") ? room.fotos : null) ||
            (Array.isArray((room as any).galeria) && (room as any).galeria.length > 0 ? (room as any).galeria : null) ||
            [(room as any).foto_principal || (room as any).imagen_portada || room.cover_image || room.primary_image || room.image_url || (room as any).imagen || (room as any).foto].filter(p => p && !p.includes("unsplash"));

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
  const phone = establishmentDetail?.phone || config.contact?.phone || "+584144815321";
  const whatsapp = establishmentDetail?.whatsapp || establishmentDetail?.phone || config.contact?.whatsapp || "584144815321";
  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, "") || "584144815321";

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

          {isRestaurant ? (
            <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-300">
              <a href="#inicio" className="hover:text-[#00C8D4] transition-colors">Inicio</a>
              <a href="#menu" className="hover:text-[#00C8D4] transition-colors">Carta Gastronómica</a>
              <a href="#zonas" className="hover:text-[#00C8D4] transition-colors">Zonas & Mesas</a>
              <a href="#pos-demo" className="hover:text-[#00C8D4] transition-colors">Punto de Venta POS</a>
              <a href="#galeria" className="hover:text-[#00C8D4] transition-colors">Galería & Experiencias</a>
              <a href="#contacto" className="hover:text-[#00C8D4] transition-colors">Ubicación</a>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-300">
              <a href="#inicio" className="hover:text-[#00C8D4] transition-colors">Inicio</a>
              <a href="#habitaciones" className="hover:text-[#00C8D4] transition-colors">Habitaciones & Tarifas</a>
              <a href="#galeria" className="hover:text-[#00C8D4] transition-colors">Galería Instalaciones</a>
              <a href="#servicios" className="hover:text-[#00C8D4] transition-colors">Servicios</a>
              <a href="#sobre-nosotros" className="hover:text-[#00C8D4] transition-colors">Sobre Nosotros</a>
              <a href="#contacto" className="hover:text-[#00C8D4] transition-colors">Ubicación</a>
            </nav>
          )}

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

        {isRestaurant ? (
          <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center space-y-8 animate-fade-in">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur border border-[#00C8D4]/40 text-[#00C8D4] text-[11px] font-extrabold tracking-[0.25em] uppercase shadow-2xl">
              <Sparkles className="w-3.5 h-3.5 text-[#FF0096]" />
              EL PARAÍSO GASTRONÓMICO DE TUCACAS • RESTAURANTE DE ALTA GAMA & CLUB DE PLAYA
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-serif text-white tracking-tight leading-tight drop-shadow-2xl">
              Oleaje Tucacas.
            </h1>

            <div className="flex flex-col items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2.5 p-[2px] rounded-2xl bg-gradient-to-r from-[#FF0096] via-[#9B00CC] to-[#00C8D4] shadow-2xl animate-pulse hover:scale-105 transition-all">
                <div className="px-5 py-2 rounded-[14px] bg-slate-900/90 backdrop-blur flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
                  </span>
                  <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-amber-300 drop-shadow">
                    🛠️ EN MANTENIMIENTO PROGRAMADO • PLATAFORMA WEB EN CONSTRUCCIÓN
                  </span>
                </div>
              </div>

              <p className="text-base sm:text-xl text-white font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-serif">
                Gastronomía marina de autor, ceviches frescos, paellas valencianas, cortes de carne premium y coctelería de autor frente al mar de Morrocoy.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
              <div className="p-3 bg-[#00C8D4]/25 backdrop-blur-md rounded-2xl border border-[#00C8D4]/50 text-center shadow-2xl hover:bg-[#00C8D4]/35 transition-all">
                <span className="text-lg font-black text-white block font-serif drop-shadow-sm">⭐ 4.9 / 5</span>
                <span className="text-[10px] text-white font-bold uppercase tracking-wider">Alta Gastronomía</span>
              </div>
              <div className="p-3 bg-[#00C8D4]/25 backdrop-blur-md rounded-2xl border border-[#00C8D4]/50 text-center shadow-2xl hover:bg-[#00C8D4]/35 transition-all">
                <span className="text-lg font-black text-white block font-serif drop-shadow-sm">6 Zonas</span>
                <span className="text-[10px] text-white font-bold uppercase tracking-wider">Pérgolas, VIP, Playa</span>
              </div>
              <div className="p-3 bg-[#00C8D4]/25 backdrop-blur-md rounded-2xl border border-[#00C8D4]/50 text-center shadow-2xl hover:bg-[#00C8D4]/35 transition-all">
                <span className="text-lg font-black text-white block font-serif drop-shadow-sm">POS Directo</span>
                <span className="text-[10px] text-white font-bold uppercase tracking-wider">Gestión de Pedidos</span>
              </div>
              <div className="p-3 bg-[#00C8D4]/25 backdrop-blur-md rounded-2xl border border-[#00C8D4]/50 text-center shadow-2xl hover:bg-[#00C8D4]/35 transition-all">
                <span className="text-lg font-black text-white block font-serif drop-shadow-sm">Planta Eléctrica</span>
                <span className="text-[10px] text-white font-bold uppercase tracking-wider">Respaldo Automático</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              
              <a
                href="#menu"
                className="px-8 py-4 rounded-2xl font-extrabold text-sm text-white bg-[#00C8D4] hover:bg-[#00b0bc] transition-all shadow-xl active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Utensils className="w-4 h-4" />
                <span>Ver Carta Gastronómica</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={generalWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-2xl font-extrabold text-sm text-white bg-[#25D366] hover:bg-[#20bd5a] transition-all shadow-xl active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Reservar Mesa por WhatsApp</span>
              </a>

            </div>

          </div>
        ) : (
          <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center space-y-8 animate-fade-in">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur border border-[#00C8D4]/40 text-[#00C8D4] text-[11px] font-extrabold tracking-[0.25em] uppercase shadow-2xl">
              <Sparkles className="w-3.5 h-3.5 text-[#FF0096]" />
              {isMyCampers ? "DONDE EL SILENCIO SE VUELVE MÚSICA • CUBIRO, LARA" : isPerlaNegra ? "BIENVENIDOS A MORROCOY • POSADA PERLA NEGRA" : "EL PARAÍSO TE ESPERA • HOSPEDAJE DE EXCELENCIA"}
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-serif text-white tracking-tight leading-tight drop-shadow-2xl">
              {config.name}
            </h1>

            <div className="flex flex-col items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2.5 p-[2px] rounded-2xl bg-gradient-to-r from-[#FF0096] via-[#9B00CC] to-[#00C8D4] shadow-2xl animate-pulse hover:scale-105 transition-all">
                <div className="px-5 py-2 rounded-[14px] bg-slate-900/90 backdrop-blur flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
                  </span>
                  <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-amber-300 drop-shadow">
                    🛠️ EN MANTENIMIENTO PROGRAMADO • PLATAFORMA WEB EN CONSTRUCCIÓN
                  </span>
                </div>
              </div>

              <p className="text-base sm:text-xl text-white font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-serif">
                {isMyCampers
                  ? "Vive la experiencia de hospedarte en un Camper exclusivo rodeado del clima fresco y paisajes icónicos de Cubiro, Estado Lara. Confort de alta gama, fogatas nocturnas, vistas impresionantes y tranquilidad absoluta."
                  : isPerlaNegra 
                    ? "Descubra el verdadero significado de descansar en Morrocoy. 21 habitaciones confortables con aire acondicionado 24/7, piscina iluminada, WiFi Starlink, planta eléctrica y paseos directos a los cayos."
                    : "Más que un Hospedaje, su refugio perfecto. Disfrute de una experiencia inolvidable con atención personalizada y garantía directa de tarifa."
                }
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
              <div className="p-3 bg-[#00C8D4]/25 backdrop-blur-md rounded-2xl border border-[#00C8D4]/50 text-center shadow-2xl hover:bg-[#00C8D4]/35 transition-all">
                <span className="text-lg font-black text-white block font-serif drop-shadow-sm">
                  {isPerlaNegra ? "21 Unidades" : "⭐ 4.9 / 5"}
                </span>
                <span className="text-[10px] text-white font-bold uppercase tracking-wider">
                  {isPerlaNegra ? "4 Tipos de Habitación" : "Valoración Huéspedes"}
                </span>
              </div>
              <div className="p-3 bg-[#00C8D4]/25 backdrop-blur-md rounded-2xl border border-[#00C8D4]/50 text-center shadow-2xl hover:bg-[#00C8D4]/35 transition-all">
                <span className="text-lg font-black text-white block font-serif drop-shadow-sm">100%</span>
                <span className="text-[10px] text-white font-bold uppercase tracking-wider">Planta Eléctrica 24/7</span>
              </div>
              <div className="p-3 bg-[#00C8D4]/25 backdrop-blur-md rounded-2xl border border-[#00C8D4]/50 text-center shadow-2xl hover:bg-[#00C8D4]/35 transition-all">
                <span className="text-lg font-black text-white block font-serif drop-shadow-sm">Piscina</span>
                <span className="text-[10px] text-white font-bold uppercase tracking-wider">Iluminación Nocturna</span>
              </div>
              <div className="p-3 bg-[#00C8D4]/25 backdrop-blur-md rounded-2xl border border-[#00C8D4]/50 text-center shadow-2xl hover:bg-[#00C8D4]/35 transition-all">
                <span className="text-lg font-black text-white block font-serif drop-shadow-sm">Cayos Morrocoy</span>
                <span className="text-[10px] text-white font-bold uppercase tracking-wider">Paseos en Peñero/Yate</span>
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
        )}

      </section>

      <div className="bg-white border-b border-slate-200/80 py-4 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3 p-2">
            <span className="text-xl">🛡️</span>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                {isRestaurant ? "Insumos Marinos Frescos del Día" : "Mejor Tarifa Oficial Garantizada"}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Sin comisiones de intermediarios</span>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-3 p-2 border-t sm:border-t-0 sm:border-l border-slate-100">
            <span className="text-xl">⚡</span>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                {isRestaurant ? "Reserva de Mesas en Vivo" : "Confirmación Inmediata"}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Vía WhatsApp Oficial directo</span>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-3 p-2 border-t sm:border-t-0 sm:border-l border-slate-100">
            <span className="text-xl">🌟</span>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                {isRestaurant ? "Experiencia Gourmet Frente al Mar" : "Atención Personalizada"}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Atendidos por el equipo del establecimiento</span>
            </div>
          </div>
        </div>
      </div>

      {isRestaurant ? (
        <>
          {/* ── SECCIÓN 1: CARTA GASTRONÓMICA DE ALTA GAMA ── */}
          <section id="menu" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
              <span className="text-[11px] tracking-[0.25em] font-extrabold text-[#00C8D4] uppercase block">
                GASTRONOMÍA MARINA DE AUTOR
              </span>
              <h2 className="text-3xl sm:text-5xl font-black font-serif text-slate-900">
                Nuestra Carta Gastronómica
              </h2>
              <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed">
                Selección de especialidades preparadas con pescados y mariscos frescos de Morrocoy, acompañados de maridaje exclusivo y alta coctelería.
              </p>
            </div>

            {/* Barra de Filtros por Categoría */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {OLEAJE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveMenuCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                    activeMenuCategory === cat.id
                      ? "bg-[#00C8D4] text-white shadow-lg scale-105"
                      : "bg-[#00C8D4]/10 text-[#009da7] hover:bg-[#00C8D4]/20 border border-[#00C8D4]/30"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Grid de Platos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {OLEAJE_MENU_ITEMS
                .filter((item) => activeMenuCategory === "all" || item.category === activeMenuCategory)
                .map((dish) => (
                  <div
                    key={dish.id}
                    className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative h-56 overflow-hidden bg-slate-900">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase text-white bg-[#00C8D4] shadow-md">
                            {dish.categoryName}
                          </span>
                          {dish.isRecommended && (
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase text-white bg-[#FF0096] shadow-md">
                              Recomendado
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-4 right-4 bg-slate-950/85 backdrop-blur px-4 py-1.5 rounded-2xl border border-white/20 shadow-xl">
                          <span className="text-base font-black text-[#00C8D4] font-serif">${dish.price.toFixed(2)} USD</span>
                        </div>
                      </div>

                      <div className="p-6 space-y-3">
                        <h3 className="text-xl font-bold font-serif text-slate-900 group-hover:text-[#00C8D4] transition-colors">
                          {dish.name}
                        </h3>
                        <p className="text-slate-600 text-xs font-normal leading-relaxed line-clamp-3">
                          {dish.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => addDishToCart(dish)}
                          className="flex-1 py-3 px-4 rounded-2xl bg-[#00C8D4]/15 hover:bg-[#00C8D4] text-[#009da7] hover:text-white border border-[#00C8D4]/40 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Agregar al Pedido</span>
                        </button>

                        <a
                          href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                            `Hola Oleaje Tucacas, me interesa pedir el plato "${dish.name}" ($${dish.price.toFixed(2)} USD). ¿Podrían tomar mi orden?`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          title="Pedir por WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4 fill-current" />
                          <span className="hidden sm:inline">Pedir</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* ── SECCIÓN 2: ZONAS DEL RESTAURANTE & RESERVA DE MESAS ── */}
          <section id="zonas" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100 bg-slate-50/50">
            <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
              <span className="text-[11px] tracking-[0.25em] font-extrabold text-[#FF0096] uppercase block">
                ESPACIOS Y AMBIENTES DE DISTINCIÓN
              </span>
              <h2 className="text-3xl sm:text-5xl font-black font-serif text-slate-900">
                Zonas Exclusivas & Reserva de Mesas
              </h2>
              <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed">
                Seleccione la zona ideal para su visita. Contamos con 38 mesas distribuidas entre pérgolas, salones VIP, terraza panorámica y servicio frente a la playa.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {OLEAJE_ZONES.map((zone) => (
                <div
                  key={zone.id}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-60 overflow-hidden bg-slate-900">
                      <img
                        src={zone.image}
                        alt={zone.name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase text-white bg-[#FF0096] shadow-md">
                          {zone.badge}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-slate-950/80 backdrop-blur px-4 py-2 rounded-2xl border border-white/20">
                        <span className="text-xs font-bold text-white">Mesas Disponibles: {zone.tableCount}</span>
                        <span className="text-xs font-bold text-[#00C8D4]">Capacidad: {zone.capacityPerTable} pers/mesa</span>
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <h3 className="text-xl font-bold font-serif text-slate-900 group-hover:text-[#FF0096] transition-colors">
                        Zona {zone.name}
                      </h3>
                      <p className="text-slate-600 text-xs font-normal leading-relaxed">
                        {zone.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <a
                      href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                        `Hola Oleaje Tucacas, me gustaría solicitar una reserva de mesa en la zona "${zone.name}". Somos un grupo de personas. ¿Tienen disponibilidad?`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:from-[#e00084] hover:to-[#8800b5] text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98"
                    >
                      <Calendar className="w-4 h-4 text-white" />
                      <span>Reservar Mesa en {zone.name}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── SECCIÓN 3: PUNTO DE VENTA POS INTEGRADO (SISTEMA DEMO OLEAJE) ── */}
          <section id="pos-demo" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
            <POSModule customConfig={config} />
          </section>
        </>
      ) : (
        <section id="habitaciones" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <span className="text-[11px] tracking-[0.25em] font-extrabold text-[#00C8D4] uppercase block">
              {isPerlaNegra ? "PLANTA BAJA & PLANTA ALTA (10 HABITACIONES)" : "SU REFUGIO DE DESCANSO (BLOQUE 1)"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-serif text-slate-900">
              {isPerlaNegra ? "Habitaciones Familiares Estándar (F1 a F6)" : "Nuestras Habitaciones & Suites (Edificio Principal)"}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed">
              {isPerlaNegra ? "Habitaciones acogedoras para 4 personas equipadas con aire acondicionado split, WiFi Starlink, TV HD y baño privado." : "Explore nuestras opciones de hospedaje completamente equipadas. Seleccione las habitaciones ideales para su grupo o familia."}
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
              {rooms.slice(0, 6).map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  hotelName={config.name}
                  whatsappPhone={whatsapp}
                  onOpenDetail={(r) => setSelectedRoom(r)}
                  onToggleCart={toggleCartRoom}
                  isInCart={cartRooms.some(cr => String(cr.id) === String(room.id))}
                />
              ))}
            </div>
          )}

        </section>
      )}

      {/* ── INTERSECCIÓN 1: SERVICIOS Y EXPERIENCIA EXCLUSIVA ── */}
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

      {/* ── BLOQUE 2 DE HABITACIONES (EDIFICIO DE LA PISCINA) ── */}
      {rooms.length > 6 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <span className="text-[11px] tracking-[0.25em] font-extrabold text-[#00C8D4] uppercase block">
              {isPerlaNegra ? "EDIFICIO B - VISTA PISCINA (HABITACIONES F7-F10 Y G1-G2)" : "ÁREA PISCINA & CONFORT (BLOQUE 2)"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-serif text-slate-900">
              {isPerlaNegra ? "Habitaciones Familiares & Grandes (F7-F10 / G1-G2)" : "Habitaciones & Apartamentos (Edificio Piscina)"}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed">
              {isPerlaNegra ? "Unidades de 4 a 6 puestos cercanas a la piscina iluminada de noche y áreas de solárium." : "Unidades acogedoras frente al solárium y la piscina con vistas privilegiadas."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.slice(6, 12).map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                hotelName={config.name}
                whatsappPhone={whatsapp}
                onOpenDetail={(r) => setSelectedRoom(r)}
                onToggleCart={toggleCartRoom}
                isInCart={cartRooms.some(cr => String(cr.id) === String(room.id))}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── INTERSECCIÓN 2: MOSAICO Y GALERÍA DE INSTALACIONES ── */}
      <section id="galeria" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <span className="text-[11px] tracking-[0.25em] font-extrabold text-[#FF0096] uppercase block">
            INSTALACIONES & ESPACIOS DE DISTINCIÓN
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-serif text-slate-900 leading-tight">
            Mosaico & Galería de Instalaciones
          </h2>
          <p className="text-slate-600 text-sm font-normal">
            Recorra cada rincón de {config.name}. Haz clic en cualquier imagen del collage para abrir la vista panorámica en alta resolución.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { id: "todas", label: "✨ Todas las Áreas" },
            { id: "piscina", label: "🏊 Piscina & Solárium" },
            { id: "restaurante", label: "🍽️ Restaurante & Bar" },
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
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeAreaTab === tab.id
                  ? "bg-[#00C8D4] text-white shadow-lg scale-102"
                  : "bg-[#00C8D4]/20 text-[#009da7] hover:bg-[#00C8D4]/30 border border-[#00C8D4]/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Mosaic / Collage Layout Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[220px]">
          {Object.entries(areaPhotos)
            .filter(([key]) => activeAreaTab === "todas" || activeAreaTab === key)
            .flatMap(([areaKey, urls]) => urls.map((url, i) => ({ areaKey, url, id: `${areaKey}-${i}` })))
            .map((item, idx) => {
              const isHeroTile = idx === 0 && activeAreaTab === "todas";
              const isWideTile = idx % 5 === 3;
              const isTallTile = idx % 7 === 2;

              let spanClasses = "col-span-1 row-span-1";
              if (isHeroTile) {
                spanClasses = "sm:col-span-2 sm:row-span-2 min-h-[440px]";
              } else if (isWideTile) {
                spanClasses = "sm:col-span-2 row-span-1";
              } else if (isTallTile) {
                spanClasses = "col-span-1 sm:row-span-2 min-h-[440px]";
              }

              const categoryLabels: Record<string, string> = {
                piscina: "Piscina & Solárium",
                restaurante: "Restaurante & Bar",
                fachada: "Fachada & Exteriores",
                lobby: "Lobby & Recepción",
                parque: "Parque & Recreación",
                playa: "Playa & Marina",
                spa: "Spa & Bienestar",
                eventos: "Salón de Eventos",
                deportes: "Gimnasio & Deportes"
              };

              return (
                <div 
                  key={item.id} 
                  onClick={() => setActiveLightboxImg({ url: item.url, category: categoryLabels[item.areaKey] || item.areaKey })}
                  className={`relative rounded-3xl overflow-hidden border border-slate-200/90 group bg-slate-900 cursor-pointer hover:border-[#00C8D4] shadow-md hover:shadow-2xl transition-all duration-300 ${spanClasses}`}
                >
                  <img src={item.url} alt={item.areaKey} loading="lazy" className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity flex flex-col justify-between p-4">
                    <div className="flex justify-end">
                      <span className="text-[10px] font-black uppercase text-white tracking-widest bg-[#00C8D4]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        🔍 Ampliar
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase text-white tracking-wider bg-[#00C8D4]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-white/30">
                        {categoryLabels[item.areaKey] || item.areaKey}
                      </span>
                      <span className="text-xs text-white/90 font-bold font-serif hidden sm:inline">
                        {config.name}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* ── BLOQUE 3 DE HABITACIONES (EDIFICIO DE RECEPCIÓN & APARTAMENTOS FAMILIARES) ── */}
      {rooms.length > 12 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <span className="text-[11px] tracking-[0.25em] font-extrabold text-[#9B00CC] uppercase block">
              {isPerlaNegra ? "EDIFICIO B, C & PRINCIPAL (G3-G8, EXTRAFAMILIARES X1-X2 & EJECUTIVA E1)" : "EDIFICIO RECEPCIÓN & APARTAMENTOS (BLOQUE 3)"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-serif text-slate-900">
              {isPerlaNegra ? "Habitaciones Grandes, Extrafamiliares & Suite Ejecutiva" : "Habitaciones & Apartamentos de Gran Capacidad"}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed">
              {isPerlaNegra ? "Habitaciones de gran espacio para 6 a 8 personas y nuestra Suite Ejecutiva con balcón privado." : "Unidades amplias diseñadas para familias grandes y grupos en estadías prolongadas."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.slice(12).map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                hotelName={config.name}
                whatsappPhone={whatsapp}
                onOpenDetail={(r) => setSelectedRoom(r)}
                onToggleCart={toggleCartRoom}
                isInCart={cartRooms.some(cr => String(cr.id) === String(room.id))}
              />
            ))}
          </div>
        </section>
      )}

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
                <span>Atención personalizada y directa.</span>
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

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#00C8D4] to-[#009da7] text-white space-y-3 shadow-xl border border-[#00C8D4]/30">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-xs text-white">
                  <div className="p-2.5 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] text-white font-extrabold uppercase block tracking-wider">Ubicación GPS Verificada</span>
                    <span className="font-extrabold text-white truncate max-w-[200px] block">{address}</span>
                  </div>
                </div>

                <a
                  href={generalWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl text-xs font-black text-[#009da7] bg-white hover:bg-slate-50 transition-colors shrink-0 shadow-md"
                >
                  Cómo Llegar
                </a>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/20 text-[10px] text-white/90 font-mono font-semibold">
                <span>📍 Coordenadas: {latStr}° N, {lngStr}° W</span>
                <span className="text-white font-black uppercase">Estado {coords.state}, Venezuela</span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/20">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-black text-white bg-white/20 hover:bg-white/30 border border-white/30 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <MapPin className="w-3.5 h-3.5 text-white" />
                  <span>Google Maps</span>
                </a>
                <a
                  href={`https://www.waze.com/ul?ll=${coords.lat},${coords.lng}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-black text-[#009da7] bg-white hover:bg-slate-50 transition-all text-center flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#009da7]" />
                  <span>Abrir en Waze</span>
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border border-[#00C8D4]/40 shadow-2xl bg-white space-y-0">
              
              <div className="p-3 bg-[#00C8D4] border-b border-white/20 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  <span className="text-xs font-extrabold text-white font-serif uppercase tracking-wider">Mapa Satelital ({destName})</span>
                </div>
                <div className="flex bg-[#009da7] rounded-xl p-1 border border-white/20 gap-1">
                  <button
                    onClick={() => setMapViewMode("satelite")}
                    className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                      mapViewMode === "satelite" ? "bg-[#FF0096] text-white shadow-md" : "text-white/80 hover:text-white"
                    }`}
                  >
                    🛰️ Satélite
                  </button>
                  <button
                    onClick={() => setMapViewMode("estandar")}
                    className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                      mapViewMode === "estandar" ? "bg-white text-[#009da7] shadow-md" : "text-white/80 hover:text-white"
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
                    <div className="absolute top-4 left-4 bg-[#00C8D4]/95 backdrop-blur px-3 py-1.5 rounded-xl border border-white/30 text-[10px] text-white font-black flex items-center gap-2 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-white" />
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

              <div className="p-4 bg-[#00C8D4] border-t border-white/20 flex items-center justify-between text-white">
                <div>
                  <span className="text-[10px] text-white/80 uppercase font-extrabold block tracking-wider">Sello de Calidad</span>
                  <span className="text-xs font-black text-white">{config.name} • Red Oficial Hoteles de Venezuela</span>
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

      {/* ── BARRA FLOTANTE DE PEDIDO GASTRONÓMICO (RESTAURANTE) ── */}
      {orderCart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-[99999] bg-[#0e011f]/95 backdrop-blur-xl border-t border-[#00C8D4]/50 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#FF0096] rounded-2xl shrink-0 shadow-lg animate-bounce">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-sm font-black block">
                  🍽️ {orderCart.reduce((acc, i) => acc + i.count, 0)} {orderCart.reduce((acc, i) => acc + i.count, 0) === 1 ? 'Plato Seleccionado' : 'Platos Seleccionados'} para Orden
                </span>
                <span className="text-xs text-[#00C8D4] font-extrabold">
                  Total Estimado: ${totalOrderPrice.toFixed(2)} USD
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 max-h-24 overflow-y-auto">
              {orderCart.map(({ dish, count }) => (
                <span key={dish.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-white/10 border border-white/20 text-white shadow-sm">
                  {dish.name} (x{count}) - ${(dish.price * count).toFixed(2)}
                  <button onClick={() => removeDishFromCart(dish.id)} className="hover:text-[#FF0096] font-black text-sm ml-1 cursor-pointer">✕</button>
                </span>
              ))}
            </div>

            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                `Hola ${config.name}, deseo realizar el siguiente pedido gastronómico:\n\n` +
                orderCart.map((i, idx) => `${idx + 1}. ${i.dish.name} (x${i.count}) - $${(i.dish.price * i.count).toFixed(2)} USD`).join('\n') +
                `\n\nTotal estimado: $${totalOrderPrice.toFixed(2)} USD.\n\nPor favor confirmen la recepción y tiempo estimado de preparación o mesa.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl font-black text-xs text-white bg-[#25D366] hover:bg-[#20bd5a] transition-all shadow-xl flex items-center gap-2 shrink-0 cursor-pointer uppercase tracking-wider hover:scale-105 active:scale-95 text-center"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Enviar Pedido (${totalOrderPrice.toFixed(2)} USD) por WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* ── BARRA FLOTANTE DE MULTI-RESERVA ADAPTATIVA ── */}
      {cartRooms.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-[99999] bg-slate-900/95 backdrop-blur-xl border-t border-[#00C8D4]/50 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-white">
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#FF0096] rounded-2xl shrink-0 shadow-lg animate-bounce">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-sm font-black block">
                  🛒 {cartRooms.length} {cartRooms.length === 1 ? 'Habitación Seleccionada' : 'Habitaciones Seleccionadas'} para Reserva
                </span>
                <span className="text-xs text-[#00C8D4] font-extrabold">
                  Total Estimado: ${cartRooms.reduce((sum, r) => sum + (r.price_per_night || r.tarifa_base || r.price || 70), 0)} / noche
                </span>
              </div>
            </div>

            {/* Pastillas de habitaciones elegidas */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 max-h-24 overflow-y-auto">
              {cartRooms.map(r => (
                <span key={r.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-white/10 border border-white/20 text-white shadow-sm">
                  {r.nombre || r.name || r.title} (${r.price_per_night || r.price || 70})
                  <button onClick={() => toggleCartRoom(r)} className="hover:text-[#FF0096] font-black text-sm ml-1 cursor-pointer">✕</button>
                </span>
              ))}
            </div>

            {/* Botón Acción Checkout WhatsApp */}
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                `Hola ${config.name}, deseo consultar disponibilidad para la siguiente combinación de ${cartRooms.length} habitaciones:\n\n` +
                cartRooms.map((r, idx) => `${idx + 1}. ${r.nombre || r.name} (Capacidad: ${r.capacity || 2} pers) - $${r.price_per_night || r.price || 70}/noche`).join('\n') +
                `\n\nTotal estimado: $${cartRooms.reduce((sum, r) => sum + (r.price_per_night || r.tarifa_base || r.price || 70), 0)}/noche.\n\nPor favor asesórenme sobre las fechas disponibles.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl font-black text-xs text-white bg-[#25D366] hover:bg-[#20bd5a] transition-all shadow-xl flex items-center gap-2 shrink-0 cursor-pointer uppercase tracking-wider hover:scale-105 active:scale-95 text-center"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Reservar {cartRooms.length} Habitaciones por WhatsApp</span>
            </a>

          </div>
        </div>
      )}

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
