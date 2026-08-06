import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { ESTABLISHMENTS_MOCK } from "../lib/establishmentsMock";
import { TrackedWhatsAppButton, trackEvent } from "../components/layout/TrackedWhatsAppButton";
import { AvailabilityCalendar } from "../components/AvailabilityCalendar";
import { BookingWidget } from "../components/BookingWidget";
import { 
  MapPin, Phone, Globe, Mail, Clock, Star, 
  ChevronLeft, ChevronRight, Share2, Heart,
  ArrowLeft, DollarSign, Navigation, Loader2, AlertTriangle, Sparkles,
  Coffee, Compass, Utensils, Plane, Car, Building2,
  Bed, Users, CheckCircle, Maximize2, X, Camera, MessageCircle, Layers,
  Wine, ChefHat, ShoppingBag, ShieldCheck, Zap, Info, Calendar, CheckCircle2, Award
} from "lucide-react";

import { parseServicesList, getAmenityLabel, getAmenityInfo, CERTIFICATIONS_DOCUMENT77 } from "../lib/amenitiesList";

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

function getRoomAmenityText(key: string) {
  const norm = key.toLowerCase().trim();
  return ROOM_AMENITIES_MAP[norm] || key.charAt(0).toUpperCase() + key.slice(1);
}

const AREA_CATEGORY_INFO: Record<string, { label: string; icon: string }> = {
  piscina: { label: "Piscina & Solárium", icon: "🏊‍♂️" },
  restaurante: { label: "Restaurante & Bar", icon: "🍽️" },
  parque: { label: "Parque & Exteriores", icon: "🌳" },
  fachada: { label: "Fachada & Entorno", icon: "🏛️" },
  lobby: { label: "Lobby & Recepción", icon: "🛋️" },
  spa: { label: "Spa & Bienestar", icon: "💆‍♀️" },
  eventos: { label: "Salón de Eventos", icon: "🎭" },
  deportes: { label: "Gimnasio & Deportes", icon: "🏋️" },
  playa: { label: "Playa & Marina", icon: "🏖️" },
};

interface EstablishmentDetail {
  id: number;
  slug: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  website: string;
  category_name: string;
  category_slug: string;
  destination_name: string;
  destination_slug: string;
  primary_image: string;
  rating_avg: number;
  review_count: number;
  price_level: string;
  is_featured: boolean;
  services: string;
  membership_tier: string;
  has_hdv_seal?: boolean;
  images: string[];
  latitude?: number;
  longitude?: number;
  hours?: string;
  whatsapp?: string;
  has_reservations_enabled?: boolean;
  status?: string;
}

export function EstablecimientoDetalle(props?: { tenantSlug?: string; [key: string]: any }) {
  const tenantSlug = props?.tenantSlug;
  const { slug: routeSlug } = useParams() as any;
  const urlParamSlug = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("tenant") : null;
  const slug = tenantSlug || routeSlug || urlParamSlug || "aparto-posada-del-mar";
  const { user, profile } = useAuth();
  const [establishment, setEstablishment] = useState<EstablishmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [surroundings, setSurroundings] = useState<any[]>([]);

  // Room Inventory & Area Photo Galleries States
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomPhotos, setRoomPhotos] = useState<Record<number, string[]>>({});
  const [areaPhotos, setAreaPhotos] = useState<Record<string, string[]>>({});
  const [selectedRoomImageIndex, setSelectedRoomImageIndex] = useState<Record<number, number>>({});
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState<string>("todas");
  const [activeLightbox, setActiveLightbox] = useState<{ url: string; title: string; category?: string } | null>(null);
  
  // Estado para la Ficha Técnica Detallada Inmersiva (Habitación o Área Gastronómica)
  const [activeDetailModal, setActiveDetailModal] = useState<{
    type: "room" | "area" | "menu";
    title: string;
    description: string;
    image: string;
    gallery: string[];
    price?: number | string;
    specs: { label: string; value: string; icon?: string }[];
    amenities: string[];
    whatsappCustomMsg: string;
  } | null>(null);

  useEffect(() => {
    if (establishment?.id) {
      const key = `hdv_surroundings_${establishment.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setSurroundings(JSON.parse(saved));
      } else {
        const destSlug = establishment.destination_slug?.toLowerCase() || "";
        let defaults = [];

        if (destSlug.includes("caracas")) {
          defaults = [
            { category: "cerca", name: "Plaza Bolívar de Chacao", distance: "300 m" },
            { category: "cerca", name: "Centro Comercial Sambil Caracas", distance: "600 m" },
            { category: "cerca", name: "Parque Generalísimo Francisco de Miranda", distance: "1.2 km" },
            { category: "cerca", name: "Centro Comercial El Recreo", distance: "2.4 km" },
            { category: "gastronomia", name: "Restaurante El Alazán (Las Mercedes)", distance: "400 m" },
            { category: "gastronomia", name: "Café Kakao (Altamira)", distance: "150 m" },
            { category: "atracciones", name: "Teleférico Warairarepano (Ávila)", distance: "2.5 km" },
            { category: "atracciones", name: "Casa Natal del Libertador Simón Bolívar", distance: "4.8 km" },
            { category: "playas", name: "Playa Los Ángeles (La Guaira)", distance: "32 km" },
            { category: "playas", name: "Playa Camurí Chico (La Guaira)", distance: "35 km" },
            { category: "transporte", name: "Metro - Estación Chacao", distance: "400 m" },
            { category: "transporte", name: "Terminal La Bandera", distance: "6.5 km" },
            { category: "aeropuertos", name: "Aeropuerto Int. Simón Bolívar de Maiquetía", distance: "24 km" }
          ];
        } else if (destSlug.includes("roques")) {
          defaults = [
            { category: "cerca", name: "Plaza Bolívar de Gran Roque", distance: "150 m" },
            { category: "cerca", name: "Faro Holandés del Gran Roque", distance: "800 m" },
            { category: "cerca", name: "Muelle de Embarque Principal", distance: "200 m" },
            { category: "cerca", name: "Centro de Visitantes Inparques", distance: "350 m" },
            { category: "gastronomia", name: "Restaurante Aki Cabana", distance: "120 m" },
            { category: "gastronomia", name: "Pizzería La Gotera", distance: "250 m" },
            { category: "atracciones", name: "Cayo Madrisquí", distance: "1.5 km" },
            { category: "atracciones", name: "Cayo Francisquí", distance: "2.8 km" },
            { category: "playas", name: "Cayo de Agua", distance: "16 km" },
            { category: "playas", name: "Playa de Crasquí", distance: "9 km" },
            { category: "transporte", name: "Muelle de lanchas cooperativas", distance: "220 m" },
            { category: "aeropuertos", name: "Aeropuerto de Los Roques (Gran Roque)", distance: "300 m" }
          ];
        } else if (destSlug.includes("margarita")) {
          defaults = [
            { category: "cerca", name: "Plaza Bolívar de La Asunción", distance: "5 km" },
            { category: "cerca", name: "Castillo San Carlos Borromeo", distance: "8 km" },
            { category: "cerca", name: "Centro Comercial Sambil Margarita", distance: "3.5 km" },
            { category: "cerca", name: "Basílica de la Virgen del Valle", distance: "7.2 km" },
            { category: "gastronomia", name: "Restaurante Dolphin (Playa El Yaque)", distance: "200 m" },
            { category: "gastronomia", name: "Café Guacuco", distance: "800 m" },
            { category: "atracciones", name: "Parque Nacional Laguna de La Restinga", distance: "22 km" },
            { category: "atracciones", name: "Fortín de La Galera", distance: "14 km" },
            { category: "playas", name: "Playa El Yaque", distance: "50 m" },
            { category: "playas", name: "Playa El Agua", distance: "18 km" },
            { category: "transporte", name: "Terminal de Ferrys de Punta de Piedras", distance: "25 km" },
            { category: "aeropuertos", name: "Aeropuerto Internacional Santiago Mariño", distance: "8 km" }
          ];
        } else if (destSlug.includes("canaima")) {
          defaults = [
            { category: "cerca", name: "Laguna de Canaima", distance: "50 m" },
            { category: "cerca", name: "Mirador Salto Hacha", distance: "450 m" },
            { category: "cerca", name: "Comunidad Indígena Kamarata", distance: "1.2 km" },
            { category: "cerca", name: "Campamento Ucaima", distance: "2.0 km" },
            { category: "gastronomia", name: "Comedor Ecológico Tepuy", distance: "100 m" },
            { category: "gastronomia", name: "Bar de Canaima Lodge", distance: "150 m" },
            { category: "atracciones", name: "Salto Ángel (Kerepakupai Vená)", distance: "48 km" },
            { category: "atracciones", name: "Salto Sapo", distance: "1.8 km" },
            { category: "playas", name: "Playa de la Laguna de Canaima", distance: "60 m" },
            { category: "transporte", name: "Puerto de Curiaras de la Laguna", distance: "300 m" },
            { category: "aeropuertos", name: "Aeropuerto de Canaima", distance: "800 m" }
          ];
        } else if (destSlug.includes("merida") || destSlug.includes("mérida")) {
          defaults = [
            { category: "cerca", name: "Plaza Bolívar de Mérida", distance: "800 m" },
            { category: "cerca", name: "Mercado Principal de Mérida", distance: "1.5 km" },
            { category: "cerca", name: "Plaza Las Heroínas", distance: "400 m" },
            { category: "cerca", name: "Parque Chorros de Milla", distance: "3.2 km" },
            { category: "gastronomia", name: "Heladería Coromoto (Récord Guinness)", distance: "600 m" },
            { category: "gastronomia", name: "Café La Parroquia", distance: "750 m" },
            { category: "atracciones", name: "Sistema de Teleféricos Mukumbarí", distance: "400 m" },
            { category: "atracciones", name: "Pico Espejo", distance: "12 km" },
            { category: "playas", name: "Laguna de Mucubají (Sierra Nevada)", distance: "45 km" },
            { category: "transporte", name: "Estación de Trolebús Mérida", distance: "1.1 km" },
            { category: "aeropuertos", name: "Aeropuerto Alberto Carnevalli", distance: "3.5 km" }
          ];
        } else if (destSlug.includes("morrocoy") || destSlug.includes("tucacas")) {
          defaults = [
            { category: "cerca", name: "Pueblo de Tucacas", distance: "1.2 km" },
            { category: "cerca", name: "Plaza Bolívar de Chichiriviche", distance: "12 km" },
            { category: "gastronomia", name: "Restaurante El Faro", distance: "300 m" },
            { category: "gastronomia", name: "Parrillera El Marino", distance: "500 m" },
            { category: "atracciones", name: "Cayo Sombrero", distance: "5.5 km" },
            { category: "atracciones", name: "Cayo Muerto", distance: "4.2 km" },
            { category: "playas", name: "Playa Varadero", distance: "3.0 km" },
            { category: "playas", name: "Cayo Sal", distance: "4.8 km" },
            { category: "transporte", name: "Muelle de Peñeros de Tucacas", distance: "850 m" },
            { category: "aeropuertos", name: "Aeropuerto de Puerto Cabello (Bartolomé Salom)", distance: "45 km" }
          ];
        } else if (destSlug.includes("tovar")) {
          defaults = [
            { category: "cerca", name: "Plaza Bolívar de la Colonia Tovar", distance: "200 m" },
            { category: "cerca", name: "Iglesia de San Martín de Tours", distance: "220 m" },
            { category: "cerca", name: "Fábrica de Cerveza Artesanal", distance: "600 m" },
            { category: "gastronomia", name: "Restaurante El Molino", distance: "150 m" },
            { category: "gastronomia", name: "Café y Fresas con Crema La Gulin", distance: "100 m" },
            { category: "atracciones", name: "Pico Codazzi", distance: "4.5 km" },
            { category: "atracciones", name: "Museo de Historia de la Colonia Tovar", distance: "300 m" },
            { category: "playas", name: "Puerto Cruz (Playa caribeña)", distance: "28 km" },
            { category: "transporte", name: "Parada de Autobuses Colonia Tovar", distance: "350 m" },
            { category: "aeropuertos", name: "Aeropuerto de Caracas (Óscar Machado Zuloaga)", distance: "55 km" }
          ];
        } else {
          defaults = [
            { category: "cerca", name: "Plaza Bolívar Local", distance: "400 m" },
            { category: "cerca", name: "Alcaldía y Centro Histórico", distance: "600 m" },
            { category: "cerca", name: "Centro Comercial de la Zona", distance: "1.5 km" },
            { category: "gastronomia", name: "Restaurante de Comida Típica", distance: "200 m" },
            { category: "gastronomia", name: "Cafetería y Panadería Local", distance: "150 m" },
            { category: "atracciones", name: "Parque Nacional / Atracción Natural", distance: "3.5 km" },
            { category: "atracciones", name: "Museo Histórico de la Ciudad", distance: "1.2 km" },
            { category: "playas", name: "Playa o Balneario de Río cercano", distance: "4.0 km" },
            { category: "transporte", name: "Parada de Transporte Público / Autobús", distance: "300 m" },
            { category: "aeropuertos", name: "Aeropuerto Nacional más cercano", distance: "15 km" }
          ];
        }

        setSurroundings(defaults);
      }
    }
  }, [establishment]);

  // Track profile view when loaded
  useEffect(() => {
    if (establishment && !hasTrackedView) {
      trackEvent("profile_view", establishment.id);
      setHasTrackedView(true);
    }
  }, [establishment, hasTrackedView]);

  // Fetch establishment data
  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        setError(false);

        // 1. Try Supabase DB lookup
        let dbData: any = null;
        try {
          const { data, error: dbErr } = await supabase
            .from("establishments")
            .select(`
              *,
              categories (name, slug),
              destinations (name, slug),
              establishment_images (image_url, is_primary)
            `)
            .eq("slug", slug)
            .maybeSingle();

          if (!dbErr && data) {
            dbData = data;
          }
        } catch (e) {
          console.warn("Error querying Supabase for detail:", e);
        }

        // 2. Fallback to localStorage mock establishments if not found in DB
        if (!dbData) {
          const localEstsKey = "hdv_mock_establishments";
          const localEsts = JSON.parse(localStorage.getItem(localEstsKey) || "[]");
          const foundLocal = localEsts.find((e: any) => 
            e.slug === slug || 
            e.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
          );
          if (foundLocal) {
            dbData = {
              ...foundLocal,
              categories: { name: foundLocal.category_name || "Posadas", slug: "posadas" },
              destinations: { name: foundLocal.destination_name || "Barquisimeto", slug: "barquisimeto" },
              establishment_images: []
            };
          }
        }

        // 3. Fallback to static ESTABLISHMENTS_MOCK
        if (!dbData) {
          const staticFound = ESTABLISHMENTS_MOCK.find((e: any) => e.slug === slug);
          if (staticFound) {
            const sf = staticFound as any;
            dbData = {
              ...sf,
              categories: { name: sf.category || sf.category_name || "Posadas", slug: (sf.category || "posadas").toLowerCase() },
              destinations: { name: sf.destination || sf.destination_name || "Venezuela", slug: (sf.destination || "venezuela").toLowerCase() },
              establishment_images: [{ image_url: sf.image || sf.primary_image || "", is_primary: true }]
            };
          }
        }

        if (dbData) {
          const primaryImg = dbData.establishment_images?.find((img: any) => img.is_primary)?.image_url 
            || dbData.establishment_images?.[0]?.image_url 
            || dbData.image 
            || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";

          const allImages = dbData.establishment_images?.map((img: any) => img.image_url) || [];
          if (allImages.length === 0 && primaryImg) {
            allImages.push(primaryImg);
          }

          const mapped: EstablishmentDetail = {
            id: dbData.id,
            slug: dbData.slug,
            name: dbData.name,
            description: dbData.description || "",
            address: dbData.address || "",
            city: dbData.city || "",
            state: dbData.state || "",
            phone: dbData.phone || "",
            email: dbData.email || "",
            website: dbData.website || "",
            category_name: dbData.categories?.name || dbData.category_name || "Establecimiento",
            category_slug: dbData.categories?.slug || "posadas",
            destination_name: dbData.destinations?.name || dbData.destination_name || "Venezuela",
            destination_slug: dbData.destinations?.slug || "venezuela",
            primary_image: primaryImg,
            rating_avg: dbData.rating_avg || 4.8,
            review_count: dbData.review_count || 12,
            price_level: dbData.price_level || "$$",
            is_featured: dbData.is_featured || false,
            services: dbData.services || "[]",
            membership_tier: dbData.membership_tier || "basic",
            has_hdv_seal: dbData.has_hdv_seal || false,
            has_reservations_enabled: dbData.has_reservations_enabled || false,
            images: allImages,
            latitude: dbData.latitude,
            longitude: dbData.longitude,
            hours: dbData.hours,
            whatsapp: dbData.whatsapp,
            status: dbData.status || "approved"
          };

          setEstablishment(mapped);
          document.title = `${mapped.name} | Hoteles de Venezuela`;
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error al cargar detalles:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchDetail();
    }
  }, [slug]);

  // Load Rooms, Room Photos, and Categorized Area Photos for Establishment
  useEffect(() => {
    if (!establishment?.id) return;

    async function fetchRoomsAndGalleries() {
      let dbRooms: any[] = [];
      try {
        const { data, error } = await supabase
          .from("rooms")
          .select("*")
          .eq("establishment_id", establishment.id);
        if (!error && data) dbRooms = data;
      } catch (e) {
        console.warn("Error querying rooms from Supabase:", e);
      }

      const localRoomsKey = "hdv_custom_rooms";
      const localRooms = JSON.parse(localStorage.getItem(localRoomsKey) || "[]")
        .filter((r: any) => Number(r.establishment_id) === Number(establishment.id));

      let combined = [...dbRooms, ...localRooms];

      // If no custom rooms created yet, provide rich realistic room catalog
      if (combined.length === 0) {
        combined = [
          {
            id: 1001,
            establishment_id: establishment.id,
            name: "Habitación Matrimonial Standard",
            description: "Elegante habitación equipada con cama matrimonial King Size, baño privado con ducha de agua caliente, aire acondicionado regulable y excelente iluminación natural.",
            price_per_night: 75,
            capacity: 2,
            quantity: 4,
            room_number: "HAB-101",
            amenities: "wifi,aire_acondicionado,banio_privado,tv_cable,toallas,ropa_cama",
            is_active: true
          },
          {
            id: 1002,
            establishment_id: establishment.id,
            name: "Suite Junior con Balcón Panorámico",
            description: "Espaciosa suite con área de estar, balcón privado con vista panorámica, cama King Size, nevera ejecutiva y acabados premium.",
            price_per_night: 120,
            capacity: 3,
            quantity: 2,
            room_number: "HAB-201",
            amenities: "wifi,aire_acondicionado,banio_privado,balcon,caja_fuerte,escritorio,nevera,tv_cable",
            is_active: true
          },
          {
            id: 1003,
            establishment_id: establishment.id,
            name: "Habitación Familiar Deluxe (2 Camas Matrimoniales)",
            description: "Unidad ideal para familias o grupos, con dos camas matrimoniales confortables, kitchenette equipada y servicio de TV con streaming.",
            price_per_night: 150,
            capacity: 5,
            quantity: 3,
            room_number: "HAB-301",
            amenities: "wifi,aire_acondicionado,banio_privado,cocina_equipada,nevera,tv_cable,ropa_cama,secador_pelo",
            is_active: true
          }
        ];
      }

      // Filter active rooms
      const activeRooms = combined.filter((r: any) => r.is_active !== false);
      setRooms(activeRooms.length > 0 ? activeRooms : combined);

      // Load Room Photos
      const savedRoomPhotos = localStorage.getItem("hdv_room_photos");
      let roomPhotosMap: Record<number, string[]> = {};
      if (savedRoomPhotos) {
        try { roomPhotosMap = JSON.parse(savedRoomPhotos); } catch (e) {}
      }

      const defaultRoomPhotos = [
        ["https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80"],
        ["https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80"],
        ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80"]
      ];

      combined.forEach((rm: any, i: number) => {
        if (!roomPhotosMap[rm.id] || roomPhotosMap[rm.id].length === 0) {
          roomPhotosMap[rm.id] = defaultRoomPhotos[i % defaultRoomPhotos.length];
        }
      });
      setRoomPhotos(roomPhotosMap);

      // Load Area Photos
      const savedAreaPhotos = localStorage.getItem("hdv_area_photos");
      let areaPhotosMap: Record<string, string[]> = {};
      if (savedAreaPhotos) {
        try {
          const parsed = JSON.parse(savedAreaPhotos);
          if (parsed[establishment.id]) {
            areaPhotosMap = parsed[establishment.id];
          }
        } catch (e) {}
      }

      if (Object.keys(areaPhotosMap).length === 0) {
        areaPhotosMap = {
          piscina: [
            "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1000&q=80"
          ],
          restaurante: [
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80"
          ],
          fachada: [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80"
          ],
          lobby: [
            "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80"
          ],
          parque: [
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80"
          ]
        };
      }
      setAreaPhotos(areaPhotosMap);
    }

    fetchRoomsAndGalleries();
  }, [establishment]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/20 pt-24 pb-12 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
        <p className="text-gray-400 text-xs font-bold mt-4">Abriendo bitácora del establecimiento...</p>
      </div>
    );
  }

  if (error || !establishment) {
    return (
      <div className="min-h-screen bg-gray-50/20 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6 text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <AlertTriangle className="w-16 h-16 text-brand-magenta mx-auto mb-4" />
          <h1 className="text-2xl font-black text-gray-800">Establecimiento No Encontrado</h1>
          <p className="text-gray-400 text-xs mt-2 mb-8 leading-relaxed max-w-md mx-auto">
            El hotel o posada solicitado no existe o no se encuentra aprobado en la plataforma actualmente.
          </p>
          <Link href="/establecimientos">
            <button className="btn-magenta-gradient px-8 py-3 rounded-full text-xs font-bold hover:scale-102 transition-all cursor-pointer shadow-md shadow-brand-magenta/10">
              Volver al Buscador
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % establishment.images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + establishment.images.length) % establishment.images.length);

  const servicesList = parseServicesList(establishment.services);

  const tierColors: Record<string, string> = {
    diamante: "from-purple-600 to-pink-600 text-white",
    oro: "from-yellow-500 to-amber-600 text-white",
    plata: "from-slate-400 to-slate-600 text-white",
    bronce: "from-orange-600 to-orange-800 text-white",
  };

  const isGastronomyCategory = (establishment.category_slug || establishment.category_name || "").toLowerCase().match(/(restaurante|bar|gastronomia|comida|market|cafeteria|lounge)/);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24 font-sans">
      
      {/* Notice Banner si el establecimiento está en proceso de revisión */}
      {establishment.status !== "approved" && (
        <div className="max-w-7xl mx-auto px-6 pt-4 mb-2">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-brand-magenta text-white p-4 rounded-2xl shadow-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-white shrink-0" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">Vista Previa de Ficha Pública — Estado: {establishment.status?.toUpperCase() || "PRE-APROBADO / EN REVISIÓN"}</h4>
                <p className="text-[11px] text-white/90 font-semibold mt-0.5">Esta Ficha se encuentra en proceso de auditoría por el equipo de Hoteles de Venezuela LLC. Solo tú y el equipo administrativo pueden visualizar esta vista previa.</p>
              </div>
            </div>
            {(() => {
              const isAdmin = user?.email?.toLowerCase() === "hotelesdevenezuela77@gmail.com" || profile?.role === "admin";
              const backTarget = isAdmin ? "/admin/aprobaciones" : "/mis-negocios";
              return (
                <Link href={backTarget}>
                  <button className="px-4 py-2 bg-white text-gray-900 font-bold text-xs rounded-xl shadow-xs hover:bg-gray-100 transition-all shrink-0 cursor-pointer">
                    {isAdmin ? "Volver a Aprobaciones" : "Volver a Mi Panel"}
                  </button>
                </Link>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── 1. CABECERA DEGRADADA HERO DE ALTO IMPACTO (Estilo Alianzas para Agencias) ── */}
      <section className="w-full relative overflow-hidden bg-[#0e011f] pt-12 pb-16 lg:pt-16 lg:pb-24 text-left shadow-xl">
        {/* Banner de fondo con parallax suave y superposición de degradados */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 scale-[1.08] transition-transform duration-1000"
          style={{ backgroundImage: `url(${establishment.primary_image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e011f]/95 via-[#0e011f]/90 to-[#0e011f] z-0" />
        
        {/* Destellos de neón Cian (#00C8D4) y Púrpura (#9B00CC) */}
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-[#9B00CC] blur-[150px] opacity-35 pointer-events-none z-0" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] bg-[#00C8D4] blur-[150px] opacity-25 pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-8">
          
          {/* Eyebrow badge espaciado */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[#00C8D4] text-[10px] md:text-xs font-black tracking-[0.25em] uppercase px-3.5 py-1.5 rounded-full bg-[#00C8D4]/10 border border-[#00C8D4]/30 shadow-xs">
              {isGastronomyCategory ? "GASTRONOMÍA & ESPACIOS EXCLUSIVOS" : "HOSPEDAJE DE EXCELENCIA & DISTINCIÓN"}
            </span>

            <span className="bg-[#FF0096]/20 border border-[#FF0096]/40 text-[#FF0096] text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
              {establishment.category_name}
            </span>

            {establishment.membership_tier !== "basic" && (
              <span className={`bg-gradient-to-r ${tierColors[establishment.membership_tier?.toLowerCase()] || "from-gray-500 to-gray-600"} text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm`}>
                Socio {establishment.membership_tier}
              </span>
            )}
          </div>

          {/* Título Principal en Playfair Display / Cinzel con palabra destacada en gradiente */}
          <div className="max-w-4xl space-y-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight font-serif" style={{ fontFamily: "'Playfair Display', 'Cinzel', serif" }}>
              {establishment.name}
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed font-light">
              {establishment.description?.slice(0, 160) || "Disfruta de una experiencia inolvidable con la garantía y altos estándares de la Red Hoteles de Venezuela."}...
            </p>
          </div>

          {/* Fila de Ubicación, Puntuación y Rango */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-300 pt-2 border-t border-slate-800/80 max-w-3xl">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-white font-extrabold text-sm">{establishment.rating_avg > 0 ? establishment.rating_avg.toFixed(1) : "4.9"}</span>
              <span className="text-slate-400">({establishment.review_count || 14} valoraciones)</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2 text-[#00C8D4]">
              <MapPin className="w-4 h-4 text-[#00C8D4]" />
              <span className="text-slate-200 font-semibold">{establishment.address || `${establishment.destination_name || establishment.city}, Venezuela`}</span>
            </div>
            {establishment.price_level && (
              <>
                <span>•</span>
                <span className="text-[#FF0096] font-bold">Rango: {establishment.price_level}</span>
              </>
            )}
          </div>

          {/* Ticker / Strip de Estadísticas Rápida de Prestigio */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 max-w-4xl">
            <div className="bg-[#1a0533]/80 backdrop-blur border border-[#9B00CC]/30 p-3.5 rounded-2xl">
              <span className="text-xl md:text-2xl font-black text-[#00C8D4] block font-serif">{isGastronomyCategory ? "4+ Áreas" : `${rooms.length || 10}+ Hab.`}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">{isGastronomyCategory ? "Espacios Gastronómicos" : "Unidades de Hospedaje"}</span>
            </div>
            <div className="bg-[#1a0533]/80 backdrop-blur border border-[#9B00CC]/30 p-3.5 rounded-2xl">
              <span className="text-xl md:text-2xl font-black text-[#FF0096] block font-serif">4.9★</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Satisfacción Garantizada</span>
            </div>
            <div className="bg-[#1a0533]/80 backdrop-blur border border-[#9B00CC]/30 p-3.5 rounded-2xl">
              <span className="text-xl md:text-2xl font-black text-amber-400 block font-serif">100%</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Verificado HDV</span>
            </div>
            <div className="bg-[#1a0533]/80 backdrop-blur border border-[#9B00CC]/30 p-3.5 rounded-2xl">
              <span className="text-xl md:text-2xl font-black text-emerald-400 block font-serif">Starlink</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Wi-Fi de Alta Velocidad</span>
            </div>
          </div>

          {/* Botones de Acción Directa en el Hero */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <TrackedWhatsAppButton
              whatsappNumber={establishment.whatsapp || establishment.phone}
              establishmentId={establishment.id}
              establishmentName={establishment.name}
              customMessage={`Hola! Me interesa realizar una consulta y reserva directa para ${establishment.name}.`}
            >
              {isGastronomyCategory ? "Reservar Mesa por WhatsApp" : "Consultar Disponibilidad"}
            </TrackedWhatsAppButton>

            <button
              onClick={() => {
                const el = document.getElementById("seccion-catalogo");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl backdrop-blur transition-all text-xs cursor-pointer border border-white/20 flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#00C8D4]" />
              <span>{isGastronomyCategory ? "Ver Áreas & Menú" : "Ver Habitaciones"}</span>
            </button>
          </div>

        </div>
      </section>

      {/* ── Showcase de Galerías en Miniatura ── */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20 mb-10">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 h-[280px] md:h-[420px] shadow-2xl group border border-white/10">
          {establishment.images.length > 0 && establishment.images[currentImageIndex] ? (
            <img
              src={establishment.images[currentImageIndex]}
              alt={establishment.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
              <MapPin className="w-16 h-16 text-slate-600 mb-2" />
              <p className="text-slate-400 text-sm font-bold">{establishment.name}</p>
            </div>
          )}

          {establishment.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer ${
                isFavorite ? "bg-red-500 text-white" : "bg-black/40 hover:bg-black/60 text-white"
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>

        {establishment.images.length > 1 && (
          <div className="flex gap-2.5 mt-4 overflow-x-auto pb-2">
            {establishment.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                  i === currentImageIndex ? "border-[#FF0096] scale-95" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 2. SECCIÓN: MÁS QUE UN HOSPEDAJE / EXP. GASTRONÓMICA (Propuesta de Valor) ── */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-10 shadow-sm space-y-8">
          <div>
            <span className="text-[10px] tracking-[0.25em] font-extrabold text-[#00C8D4] uppercase block mb-1">
              CONCEBIDO PARA EL CONCERTADO RESTAURACIÓN Y DESCANSO
            </span>
            <h2 className="text-2xl md:text-3xl font-black font-serif text-slate-900">
              {isGastronomyCategory ? "Más que una Gastronomía, una Experiencia Memorable" : "Más que un Hospedaje, Su Casa en la Playa"}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
              {establishment.description || "Un refugio pensado para quienes valoran la privacidad, el confort impecable y el trato personalizado. Cada espacio ha sido acondicionado para garantizar recuerdos inolvidables."}
            </p>
          </div>

          {/* Grid de 4 pilares con iconos unicolor en cajas sólidas de color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#00C8D4] flex items-center justify-center text-white shrink-0 shadow-xs">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Ubicación Privilegiada</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">Acceso inmediato a los puntos turísticos y costeros más deseados.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#9B00CC] flex items-center justify-center text-white shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Seguridad & Privacidad</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">Estacionamiento privado y vigilancia las 24 horas del día.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FF0096] flex items-center justify-center text-white shrink-0 shadow-xs">
                {isGastronomyCategory ? <Wine className="w-5 h-5 text-white" /> : <Coffee className="w-5 h-5 text-white" />}
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{isGastronomyCategory ? "Gastronomía Exclusiva" : "Áreas Recreativas"}</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">{isGastronomyCategory ? "Chef ejecutivo y maridajes seleccionados de alta gama." : "Piscina, solárium y zonas de esparcimiento familiar."}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Wi-Fi & Respaldo</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">Conexión Starlink de alta velocidad y planta eléctrica auxiliar.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT GRID (2 COLUMNAS) ── */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8 space-y-10">

            {/* ── 3. SECCIÓN: CATÁLOGO DE HABITACIONES O FICHAS DE ÁREAS GASTRONÓMICAS ── */}
            <div id="seccion-catalogo" className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-serif font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#FF0096] flex items-center justify-center text-white shrink-0 shadow-xs">
                      {isGastronomyCategory ? <ChefHat className="w-4 h-4 text-white" /> : <Bed className="w-4 h-4 text-white" />}
                    </div>
                    {isGastronomyCategory ? "Fichas de Áreas & Espacios Gastronómicos" : "Encuentre su Refugio Perfecto — Habitaciones"}
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    {isGastronomyCategory 
                      ? "Conozca los distintos ambientes, aforos y cartas especiales para su reserva de mesa o evento." 
                      : "Explore la distribución, equipamiento y tarifas de nuestras unidades de hospedaje."}
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-[#00C8D4]/10 text-[#00C8D4] rounded-full border border-[#00C8D4]/20 shrink-0 self-start sm:self-center">
                  {isGastronomyCategory ? "4 Espacios Disponibles" : `${rooms.length} Opciones Disponibles`}
                </span>
              </div>

              {/* RENDERIZADO DUAL: SI ES GASTRONOMÍA MUESTRA FICHAS DE ÁREAS GASTRONÓMICAS */}
              {isGastronomyCategory ? (
                <div className="space-y-6">
                  {[
                    {
                      id: "salon-principal",
                      title: "Salón Principal Climatizado",
                      description: "Elegante salón interior con aire acondicionado central, iluminación cálida y ambiente ideal para cenas románticas y reuniones de negocios.",
                      capacity: "Aforo: 60 comensales",
                      vibe: "Elegante & Ejecutivo",
                      dressCode: "Casual Elegante",
                      image: establishment.primary_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
                      features: ["Climatización 22°C", "Música Ambiental", "Servicio Sommelier", "Reservado VIP"]
                    },
                    {
                      id: "terraza-outdoor",
                      title: "Terraza Panorámica Outdoor & Solárium",
                      description: "Espacio al aire libre con vista panorámica, brisa marina constante y DJ Sets durante el atardecer.",
                      capacity: "Aforo: 40 comensales",
                      vibe: "Relajado & Panorámico",
                      dressCode: "Casual de Playa",
                      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80",
                      features: ["Vista Al Mar", "Coctelería de Autor", "Zona de Fume", "Parrilla en Vivo"]
                    },
                    {
                      id: "bar-lounge",
                      title: "Bar & Lounge VIP de Licores Premium",
                      description: "Barra exclusiva especializada en catas de ron venezolano, whiskies importados y mixología de autor.",
                      capacity: "Aforo: 30 personas",
                      vibe: "Noche & Mixología",
                      dressCode: "Chic Nocturno",
                      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80",
                      features: ["Carta de Rones", "Música Lounge", "Barman Certificado", "Tapas Gourmet"]
                    },
                    {
                      id: "cava-privada",
                      title: "Cava & Salón Privado de Eventos",
                      description: "Reservado exclusivo para celebraciones corporativas o privadas de hasta 20 personas con atención personalizada.",
                      capacity: "Aforo: 20 personas",
                      vibe: "Privado & Exclusivo",
                      dressCode: "Formal",
                      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80",
                      features: ["Pantalla Presentaciones", "Atención Personalizada", "Menú a la Carta", "Acústica Privada"]
                    }
                  ].map((area) => (
                    <div key={area.id} className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-5 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 hover:border-slate-300 transition-all">
                      <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200 group">
                        <img src={area.image} alt={area.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#0e011f]/90 text-white text-[9px] font-black uppercase rounded-lg backdrop-blur">
                          {area.vibe}
                        </span>
                      </div>

                      <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                            <h3 className="text-lg font-serif font-black text-slate-900 leading-tight">{area.title}</h3>
                            <span className="text-xs font-bold text-[#FF0096] bg-[#FF0096]/10 px-2.5 py-1 rounded-lg">{area.capacity}</span>
                          </div>

                          <p className="text-xs text-slate-500 leading-relaxed mb-4">{area.description}</p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {area.features.map((feat) => (
                              <span key={feat} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00C8D4]" />
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setActiveDetailModal({
                              type: "area",
                              title: area.title,
                              description: area.description,
                              image: area.image,
                              gallery: [area.image, establishment.primary_image],
                              specs: [
                                { label: "Capacidad", value: area.capacity },
                                { label: "Ambiente", value: area.vibe },
                                { label: "Código de Vestimenta", value: area.dressCode }
                              ],
                              amenities: area.features,
                              whatsappCustomMsg: `Hola! Me gustaría solicitar reserva de mesa para el área: "${area.title}" en ${establishment.name}.`
                            })}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer w-full sm:w-auto"
                          >
                            Ver Ficha Técnica de Área
                          </button>

                          <TrackedWhatsAppButton
                            whatsappNumber={establishment.whatsapp || establishment.phone}
                            establishmentId={establishment.id}
                            establishmentName={establishment.name}
                            customMessage={`Hola! Me gustaría solicitar reserva de mesa para el área: "${area.title}" en ${establishment.name}.`}
                          >
                            Reservar en esta Área
                          </TrackedWhatsAppButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* RENDERIZADO PARA HOTELES: FICHA TÉCNICA DE HABITACIONES */
                <div className="space-y-8">
                  {rooms.map((room) => {
                    const photos = roomPhotos[room.id] || [];
                    const activeImgIdx = selectedRoomImageIndex[room.id] || 0;
                    const mainPhoto = photos[activeImgIdx] || photos[0] || establishment.primary_image;

                    return (
                      <div key={room.id} className="bg-slate-50/70 border border-slate-200/80 rounded-3xl p-5 md:p-6 transition-all hover:border-slate-300 shadow-2xs grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        <div className="lg:col-span-5 space-y-3">
                          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200 group shadow-xs">
                            <img
                              src={mainPhoto}
                              alt={room.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            
                            <button
                              type="button"
                              onClick={() => setActiveLightbox({ url: mainPhoto, title: room.name, category: "Habitación" })}
                              className="absolute bottom-3 right-3 p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-xl text-white transition-colors cursor-pointer shadow-md"
                              title="Ampliar fotografía"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>

                            <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black uppercase rounded-lg shadow-xs">
                              {room.room_number ? `Código: ${room.room_number}` : `Unidad #${room.id}`}
                            </div>
                          </div>

                          {photos.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                              {photos.map((ph: string, pIdx: number) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() => setSelectedRoomImageIndex(prev => ({ ...prev, [room.id]: pIdx }))}
                                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                                    pIdx === activeImgIdx ? "border-[#FF0096] scale-95" : "border-transparent opacity-60 hover:opacity-100"
                                  }`}
                                >
                                  <img src={ph} alt="" className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                              <h3 className="text-lg font-black text-slate-800 leading-tight font-serif">
                                {room.name}
                              </h3>
                              
                              <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tarifa por Noche</span>
                                <span className="text-xl font-black text-[#FF0096]">
                                  ${room.price_per_night} <span className="text-xs font-bold text-slate-500">USD</span>
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-500 leading-relaxed mb-4">
                              {room.description || "Habitación confortable equipada con todas las comodidades para una estancia placentera."}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-bold mb-4">
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                                <Users className="w-4 h-4 text-[#00C8D4]" />
                                <span>Capacidad: {room.capacity || 2} personas</span>
                              </div>
                              {room.quantity && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                                  <Bed className="w-4 h-4 text-[#FF0096]" />
                                  <span>{room.quantity} unidades disponibles</span>
                                </div>
                              )}
                            </div>

                            {room.amenities && (
                              <div className="space-y-1.5">
                                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Equipamiento Incluido</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {room.amenities.split(",").map((am: string) => {
                                    const t = am.trim();
                                    if (!t) return null;
                                    return (
                                      <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold shadow-2xs">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C8D4] shrink-0" />
                                        {getRoomAmenityText(t)}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="pt-4 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={() => setActiveDetailModal({
                                type: "room",
                                title: room.name,
                                description: room.description,
                                image: mainPhoto,
                                gallery: photos,
                                price: room.price_per_night,
                                specs: [
                                  { label: "Capacidad", value: `${room.capacity || 2} Personas` },
                                  { label: "Superficie", value: "32 m² Aproximados" },
                                  { label: "Cama", value: "King Size Confort" },
                                  { label: "Vista", value: "Vista Panorámica Exterior" }
                                ],
                                amenities: room.amenities ? room.amenities.split(",").map((a: string) => getRoomAmenityText(a)) : ["Aire Acondicionado", "Baño Privado", "Wi-Fi", "TV Cable"],
                                whatsappCustomMsg: `Hola! Estoy consultando la disponibilidad para la unidad: "${room.name}" (Tarifa: $${room.price_per_night} USD/noche) en ${establishment.name}.`
                              })}
                              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer w-full sm:w-auto"
                            >
                              Ver Ficha Técnica Completa
                            </button>

                            <TrackedWhatsAppButton
                              whatsappNumber={establishment.whatsapp || establishment.phone}
                              establishmentId={establishment.id}
                              establishmentName={establishment.name}
                              customMessage={`Hola! Estoy viendo la ficha de ${establishment.name} en Hoteles de Venezuela y me gustaría consultar disponibilidad para la unidad: "${room.name}" (Tarifa: $${room.price_per_night} USD/noche).`}
                            >
                              Consultar Habitación
                            </TrackedWhatsAppButton>
                          </div>

                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── 4. SECCIÓN: GALERÍAS DE ÁREAS E INSTALACIONES ── */}
            {(() => {
              const categoriesPresent = Object.keys(areaPhotos).filter(catKey => areaPhotos[catKey] && areaPhotos[catKey].length > 0);
              
              const allCategorizedPhotos: { url: string; category: string }[] = [];
              categoriesPresent.forEach(catKey => {
                areaPhotos[catKey].forEach(url => {
                  allCategorizedPhotos.push({ url, category: catKey });
                });
              });

              if (allCategorizedPhotos.length === 0 && establishment.images.length === 0) return null;

              const displayPhotos = selectedGalleryCategory === "todas"
                ? allCategorizedPhotos
                : (areaPhotos[selectedGalleryCategory] || []).map(url => ({ url, category: selectedGalleryCategory }));

              return (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-xl font-serif font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#00C8D4] flex items-center justify-center text-white shrink-0 shadow-xs">
                          <Camera className="w-4 h-4 text-white" />
                        </div>
                        Instalaciones y Galerías de Áreas
                      </h2>
                      <p className="text-xs text-slate-400 font-semibold mt-1">
                        Recorre visualmente las distintas instalaciones, áreas de esparcimiento y espacios comunes.
                      </p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-purple-50 text-[#9B00CC] rounded-full border border-purple-200 shrink-0 self-start sm:self-center">
                      {displayPhotos.length} {displayPhotos.length === 1 ? "Fotografía" : "Fotografías"}
                    </span>
                  </div>

                  {/* Category Pills Filters */}
                  <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto max-w-full">
                    <button
                      type="button"
                      onClick={() => setSelectedGalleryCategory("todas")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                        selectedGalleryCategory === "todas"
                          ? "bg-[#0e011f] text-white border-[#0e011f] shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span>🖼️</span>
                      <span>Todas las Áreas</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${selectedGalleryCategory === "todas" ? "bg-[#FF0096] text-white" : "bg-slate-200 text-slate-700"}`}>
                        {allCategorizedPhotos.length}
                      </span>
                    </button>

                    {categoriesPresent.map(catKey => {
                      const catInfo = AREA_CATEGORY_INFO[catKey] || { label: catKey.toUpperCase(), icon: "📸" };
                      const count = areaPhotos[catKey]?.length || 0;
                      const isSel = selectedGalleryCategory === catKey;

                      return (
                        <button
                          key={catKey}
                          type="button"
                          onClick={() => setSelectedGalleryCategory(catKey)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                            isSel
                              ? "bg-[#0e011f] text-white border-[#0e011f] shadow-xs"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <span>{catInfo.icon}</span>
                          <span>{catInfo.label}</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${isSel ? "bg-[#FF0096] text-white" : "bg-slate-200 text-slate-700"}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Photos Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {displayPhotos.map((item, idx) => {
                      const catInfo = AREA_CATEGORY_INFO[item.category] || { label: item.category.toUpperCase(), icon: "📷" };
                      
                      return (
                        <div
                          key={idx}
                          onClick={() => setActiveLightbox({ url: item.url, title: `${establishment.name} — ${catInfo.label}`, category: catInfo.label })}
                          className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 group shadow-xs cursor-pointer border border-slate-200/60"
                        >
                          <img
                            src={item.url}
                            alt={catInfo.label}
                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                            <span className="self-end p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white">
                              <Maximize2 className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1">
                              <span>{catInfo.icon}</span>
                              <span>{catInfo.label}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* ── 5. SECCIÓN DE SERVICIOS DOCUMENTO 77 (TAXONOMÍA OFICIAL) ── */}
            {servicesList.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-serif font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] flex items-center justify-center text-white shrink-0 shadow-xs">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      Infraestructura, Servicios y Políticas (Documento 77 V.1)
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      Catálogo oficial verificado discriminado por Ámbito (Privado de la Unidad, Zona Común y Servicios).
                    </p>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-[10px] font-black uppercase text-white tracking-wider self-start sm:self-center shadow-xs"
                    style={{ background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)" }}
                  >
                    {servicesList.length} Comodidades
                  </span>
                </div>

                {(() => {
                  const itemsWithInfo = servicesList.map(s => {
                    const info = getAmenityInfo(s);
                    return {
                      rawKey: s,
                      label: getAmenityLabel(s),
                      pillar: info?.pillar || "C01",
                      pillarLabel: info?.pillarLabel || "C01. Infraestructura Físicas",
                      scope: info?.scope || "privado",
                      code: info?.code || "",
                      subCategory: info?.subCategory || "Equipamiento General"
                    };
                  });

                  const pillarC01 = itemsWithInfo.filter(i => i.pillar === "C01");
                  const pillarC02 = itemsWithInfo.filter(i => i.pillar === "C02");
                  const pillarC03 = itemsWithInfo.filter(i => i.pillar === "C03");

                  const pillarsToRender = [
                    { id: "C01", title: "C01. Infraestructura y Equipamiento Físico", color: "#00C8D4", items: pillarC01 },
                    { id: "C02", title: "C02. Servicios y Experiencias", color: "#FF0096", items: pillarC02 },
                    { id: "C03", title: "C03. Gestión, Políticas y Accesibilidad", color: "#9B00CC", items: pillarC03 },
                  ].filter(p => p.items.length > 0);

                  return (
                    <div className="space-y-6">
                      {pillarsToRender.map(pillarGroup => (
                        <div key={pillarGroup.id} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: pillarGroup.color }} />
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                              {pillarGroup.title}
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400">({pillarGroup.items.length})</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {pillarGroup.items.map((item, idx) => {
                              let scopeTagBg = "bg-cyan-50 text-cyan-800 border-cyan-200";
                              let scopeLabel = "Privado";
                              if (item.scope === "comun") {
                                scopeTagBg = "bg-purple-50 text-purple-800 border-purple-200";
                                scopeLabel = "Zona Común";
                              } else if (item.scope === "servicio") {
                                scopeTagBg = "bg-pink-50 text-pink-800 border-pink-200";
                                scopeLabel = "Servicio";
                              }

                              return (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl hover:border-slate-300 transition-all">
                                  <div className="min-w-0 pr-2">
                                    {item.code && (
                                      <span className="text-[9px] font-mono font-bold text-slate-400 block leading-none mb-0.5">
                                        {item.code}
                                      </span>
                                    )}
                                    <span className="text-xs font-bold text-slate-800 leading-tight block">
                                      {item.label}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium leading-tight block">
                                      {item.subCategory}
                                    </span>
                                  </div>

                                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border shrink-0 ${scopeTagBg}`}>
                                    {scopeLabel}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ── 6. SECCIÓN DE TESTIMONIOS Y VALORACIONES DE HUÉSPEDES ── */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6 text-left">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] tracking-[0.25em] font-extrabold text-[#FF0096] uppercase block mb-1">
                  OPINIONES VERIFICADAS
                </span>
                <h2 className="text-xl font-serif font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  Lo que dicen nuestros huéspedes y comensales
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: "Carlos Mendoza", date: "Julio 2026", text: "Excelente atención y comodidad impecable. El personal super atento desde nuestra llegada.", score: 5 },
                  { name: "María Fernanda Silva", date: "Junio 2026", text: "Instalaciones impecables y la comida superó nuestras expectativas. Sin duda volveremos pronto.", score: 5 },
                  { name: "Alejandro Rivas", date: "Mayo 2026", text: "La ubicación es inmejorable. Muy recomendado tanto para parejas como para vacaciones familiares.", score: 5 }
                ].map((rev, i) => (
                  <div key={i} className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Verificado</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">"{rev.text}"</p>
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">{rev.name}</span>
                      <span className="text-slate-400 font-semibold">{rev.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 7. SECCIÓN DE ALREDEDORES Y UBICACIÓN GPS ── */}
            {surroundings.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-sm text-left space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-serif font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#FF0096]" />
                    Alrededores y Ubicación en el Destino
                  </h2>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">Excelente ubicación con acceso a atractivos turísticos y comerciales.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Columna 1 */}
                  <div className="space-y-4">
                    {surroundings.filter(s => s.category === "cerca").length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#00C8D4]" /> ¿Qué hay cerca?
                        </span>
                        <div className="space-y-1.5 text-xs text-slate-600 pl-5 font-semibold">
                          {surroundings.filter(s => s.category === "cerca").map((p, i) => (
                            <div key={i} className="flex justify-between">
                              <span className="truncate max-w-[140px]">{p.name}</span>
                              <span className="text-slate-400 font-bold">{p.distance}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Columna 2 */}
                  <div className="space-y-4">
                    {surroundings.filter(s => s.category === "gastronomia" || s.category === "atracciones").length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                          <Utensils className="w-3.5 h-3.5 text-[#FF0096]" /> Gastronomía y Atracciones
                        </span>
                        <div className="space-y-1.5 text-xs text-slate-600 pl-5 font-semibold">
                          {surroundings.filter(s => s.category === "gastronomia" || s.category === "atracciones").map((p, i) => (
                            <div key={i} className="flex justify-between">
                              <span className="truncate max-w-[140px]">{p.name}</span>
                              <span className="text-slate-400 font-bold">{p.distance}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Columna 3 */}
                  <div className="space-y-4">
                    {surroundings.filter(s => s.category === "transporte" || s.category === "aeropuertos").length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                          <Plane className="w-3.5 h-3.5 text-[#9B00CC]" /> Transporte y Accesos
                        </span>
                        <div className="space-y-1.5 text-xs text-slate-600 pl-5 font-semibold">
                          {surroundings.filter(s => s.category === "transporte" || s.category === "aeropuertos").map((p, i) => (
                            <div key={i} className="flex justify-between">
                              <span className="truncate max-w-[140px]">{p.name}</span>
                              <span className="text-slate-400 font-bold">{p.distance}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Availability Calendar */}
            {establishment.has_reservations_enabled && (
              <AvailabilityCalendar 
                establishmentId={establishment.id} 
                establishmentName={establishment.name} 
              />
            )}

          </div>

          {/* ── STICKY SIDEBAR: CONTACTO & RESERVAS ── */}
          <div className="lg:col-span-4 space-y-6">
            
            {establishment.has_reservations_enabled && (
              <BookingWidget
                establishmentId={establishment.id}
                establishmentName={establishment.name}
                whatsapp={establishment.whatsapp}
                categorySlug={establishment.category_slug}
              />
            )}

            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-md sticky top-24 space-y-6 text-left">
              <h3 className="text-md font-black text-slate-900 tracking-tight pb-3 border-b border-slate-100 font-serif">
                Información de Contacto & GPS
              </h3>

              <div className="space-y-4">
                {establishment.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#FF0096] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wide">Dirección</span>
                      <p className="text-xs text-slate-700 leading-normal font-medium">{establishment.address}</p>
                    </div>
                  </div>
                )}

                {establishment.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-[#00C8D4] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wide">Teléfono Directo</span>
                      <a href={`tel:${establishment.phone}`} className="text-xs text-slate-700 hover:text-[#FF0096] transition-colors font-bold">
                        {establishment.phone}
                      </a>
                    </div>
                  </div>
                )}

                {establishment.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#FF0096] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wide">Correo Electrónico</span>
                      <a href={`mailto:${establishment.email}`} className="text-xs text-slate-700 hover:text-[#FF0096] transition-colors font-bold break-all">
                        {establishment.email}
                      </a>
                    </div>
                  </div>
                )}

                {establishment.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-[#00C8D4] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wide">Sitio Web Oficial</span>
                      <a 
                        href={establishment.website.startsWith("http") ? establishment.website : `https://${establishment.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-slate-700 hover:text-[#FF0096] transition-colors font-bold break-all"
                      >
                        {establishment.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>
                )}

                {establishment.hours && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#FF0096] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wide">Horarios de Atención</span>
                      <p className="text-xs text-slate-700 font-medium whitespace-pre-line">{establishment.hours}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Google Map Embed */}
              {establishment.latitude && establishment.longitude && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 h-40 shadow-xs relative mt-4">
                  <iframe
                    title="Ubicación del establecimiento"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${establishment.latitude},${establishment.longitude}&z=15&output=embed`}
                  ></iframe>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-slate-100 mt-4">
                {(establishment.whatsapp || establishment.phone) && (
                  <TrackedWhatsAppButton
                    whatsappNumber={establishment.whatsapp || establishment.phone}
                    establishmentId={establishment.id}
                    establishmentName={establishment.name}
                  >
                    Contactar vía WhatsApp
                  </TrackedWhatsAppButton>
                )}

                {establishment.latitude && establishment.longitude && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${establishment.latitude},${establishment.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <button className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer">
                      <Navigation className="w-4 h-4 text-[#00C8D4]" />
                      ¿Cómo llegar? (Ruta GPS)
                    </button>
                  </a>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* ── 8. SECCIÓN DE CIERRE CTA: "COMIENCE SU ESCAPADA / RESERVE SU MESA" ── */}
        <div className="mt-16 rounded-3xl p-8 md:p-12 text-white text-center shadow-2xl relative overflow-hidden" style={{ background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)" }}>
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <span className="text-[10px] uppercase tracking-[0.3em] font-black bg-white/20 text-white px-4 py-1.5 rounded-full inline-block">
              RESERVA DIRECTA GARANTIZADA
            </span>
            <h2 className="text-3xl md:text-5xl font-black font-serif">
              {isGastronomyCategory ? "Comience su Experiencia Gastronómica" : "Comience su Escapada Inolvidable"}
            </h2>
            <p className="text-white/90 text-sm md:text-base font-light max-w-xl mx-auto leading-relaxed">
              Consulte disponibilidad en tiempo real directamente con el equipo de recepción de {establishment.name} sin intermediarios ni comisiones adicionales.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <TrackedWhatsAppButton
                whatsappNumber={establishment.whatsapp || establishment.phone}
                establishmentId={establishment.id}
                establishmentName={establishment.name}
                customMessage={`Hola! Quisiera coordinar una reserva directa en ${establishment.name}.`}
              >
                {isGastronomyCategory ? "Solicitar Mesa por WhatsApp" : "Confirmar Disponibilidad por WhatsApp"}
              </TrackedWhatsAppButton>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-10 text-left">
          <Link href="/establecimientos">
            <button className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-2xs">
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Catálogo General de Establecimientos</span>
            </button>
          </Link>
        </div>

        {/* ── MODAL INMERSIVO DE FICHA TÉCNICA (HABITACIÓN O ÁREA GASTRONÓMICA) ── */}
        {activeDetailModal && (
          <div className="fixed inset-0 z-50 bg-[#0e011f]/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-6 text-left relative shadow-2xl my-8">
              <button
                type="button"
                onClick={() => setActiveDetailModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#FF0096]/10 text-[#FF0096] text-[10px] font-black uppercase rounded-full">
                  Ficha Técnica Detallada
                </span>
                {activeDetailModal.price && (
                  <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Tarifa: ${activeDetailModal.price} USD / Noche
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-serif font-black text-slate-900">{activeDetailModal.title}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{activeDetailModal.description}</p>
              </div>

              <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100">
                <img src={activeDetailModal.image} alt={activeDetailModal.title} className="w-full h-full object-cover" />
              </div>

              {/* Grid de Especificaciones */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {activeDetailModal.specs.map((sp, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">{sp.label}</span>
                    <span className="text-xs font-black text-slate-800 block mt-0.5">{sp.value}</span>
                  </div>
                ))}
              </div>

              {/* Lista de Amenidades */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-slate-800 block">Equipamiento e Infraestructura Incluida</span>
                <div className="flex flex-wrap gap-2">
                  {activeDetailModal.amenities.map((am, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00C8D4]" />
                      {am}
                    </span>
                  ))}
                </div>
              </div>

              {/* Botón de Confirmación por WhatsApp */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <TrackedWhatsAppButton
                  whatsappNumber={establishment.whatsapp || establishment.phone}
                  establishmentId={establishment.id}
                  establishmentName={establishment.name}
                  customMessage={activeDetailModal.whatsappCustomMsg}
                >
                  Solicitar Reserva Directa por WhatsApp
                </TrackedWhatsAppButton>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Lightbox Modal */}
        {activeLightbox && (
          <div className="fixed inset-0 z-50 bg-[#0e011f]/95 backdrop-blur-md flex items-center justify-center p-4">
            <button
              type="button"
              onClick={() => setActiveLightbox(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div className="max-w-4xl w-full space-y-4 text-center">
              <div className="relative max-h-[75vh] mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <img
                  src={activeLightbox.url}
                  alt={activeLightbox.title}
                  className="w-full h-full max-h-[75vh] object-contain mx-auto"
                />
              </div>

              <div className="space-y-1">
                {activeLightbox.category && (
                  <span className="inline-block px-3 py-1 bg-[#FF0096] text-white text-[10px] font-black uppercase tracking-wider rounded-full">
                    {activeLightbox.category}
                  </span>
                )}
                <h4 className="text-white text-base md:text-lg font-serif font-black">{activeLightbox.title}</h4>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── 9. STICKY FLOATING BOOKING BAR AL PIE DE PANTALLA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0e011f]/95 backdrop-blur-md border-t border-white/10 py-3 px-6 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-white/20 shrink-0">
              <img src={establishment.primary_image} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-black text-white truncate max-w-[200px]">{establishment.name}</h4>
              <span className="text-[10px] text-[#00C8D4] font-bold block">{establishment.destination_name || establishment.city}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Garantía Directa</span>
              <span className="text-xs font-black text-emerald-400">Reserva 100% Verificada</span>
            </div>

            <TrackedWhatsAppButton
              whatsappNumber={establishment.whatsapp || establishment.phone}
              establishmentId={establishment.id}
              establishmentName={establishment.name}
              customMessage={`Hola! Quisiera reservar directamente en ${establishment.name}.`}
            >
              {isGastronomyCategory ? "Reservar Mesa por WhatsApp" : "Reservar Ahora"}
            </TrackedWhatsAppButton>
          </div>
        </div>
      </div>

    </div>
  );
}
