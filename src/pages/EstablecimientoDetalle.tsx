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
  Bed, Users, CheckCircle, Maximize2, X, Camera, MessageCircle, Layers
} from "lucide-react";

import { parseServicesList, getAmenityLabel } from "../lib/amenitiesList";

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

export function EstablecimientoDetalle() {
  const { slug } = useParams() as any;
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

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      
      {/* Status Notice Banner if establishment is preapproved / pending */}
      {establishment.status !== "approved" && (
        <div className="max-w-7xl mx-auto px-6 mb-6">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-brand-magenta text-white p-4 rounded-2xl shadow-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-white shrink-0" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">Vista Previa de Ficha Pública — Estado: {establishment.status?.toUpperCase() || "PRE-APROBADO / EN REVISIÓN"}</h4>
                <p className="text-[11px] text-white/90 font-semibold mt-0.5">Esta Ficha se encuentra en proceso de auditoría y verificación por el equipo de Hoteles de Venezuela LLC. Solo tú y el equipo administrativo pueden visualizar esta vista previa.</p>
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

      {/* Image Gallery Showcase */}
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div className="relative rounded-3xl overflow-hidden bg-gray-100 h-[300px] md:h-[450px] shadow-lg group">
          {establishment.images.length > 0 && establishment.images[currentImageIndex] ? (
            <img
              src={establishment.images[currentImageIndex]}
              alt={establishment.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-magenta-50/10 to-brand-turquesa/10">
              <MapPin className="w-16 h-16 text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm font-bold">{establishment.name}</p>
            </div>
          )}

          {/* Gallery navigation controls */}
          {establishment.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Badges overlay */}
          <div className="absolute top-4 left-4 flex gap-2">
            {establishment.is_featured && (
              <span className="bg-brand-magenta text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md">
                ★ Destacado
              </span>
            )}
          </div>

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

        {/* Thumbnail indicators */}
        {establishment.images.length > 1 && (
          <div className="flex gap-2.5 mt-4 overflow-x-auto pb-2">
            {establishment.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                  i === currentImageIndex ? "border-brand-magenta scale-95" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Info Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-brand-magenta/10 text-brand-magenta text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                  {establishment.category_name}
                </span>
                {establishment.membership_tier !== "basic" && (
                  <span className={`bg-gradient-to-r ${tierColors[establishment.membership_tier?.toLowerCase()] || "from-gray-500 to-gray-600"} text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg`}>
                    Socio {establishment.membership_tier}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <h1 className="text-3xl font-black text-gray-800 leading-tight">
                  {establishment.name}
                </h1>
                {establishment.has_hdv_seal && (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-black text-amber-700 uppercase tracking-wider shrink-0 self-start sm:self-center shadow-sm">
                    <img src="/images/sello-hdv.png" alt="Sello HDV" className="w-5 h-5 object-contain" />
                    <span>Calidad Garantizada HDV</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-400">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-gray-700 font-extrabold">{establishment.rating_avg > 0 ? establishment.rating_avg.toFixed(1) : "Nuevo"}</span>
                  {establishment.review_count > 0 && (
                    <span>({establishment.review_count} valoraciones)</span>
                  )}
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-brand-turquesa" />
                  <span className="text-gray-600">{establishment.destination_name || establishment.city}</span>
                </div>
                {establishment.price_level && (
                  <>
                    <span>•</span>
                    <div className="flex items-center text-brand-magenta">
                      <span>Rango: {establishment.price_level}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
              <h2 className="text-lg font-black text-gray-800 tracking-tight mb-4">
                Acerca del Establecimiento
              </h2>
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed whitespace-pre-line">
                {establishment.description || "Este establecimiento aún no cuenta con una descripción detallada en nuestra guía."}
              </p>
            </div>

            {/* Services Card */}
            {servicesList.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <h2 className="text-lg font-black text-gray-800 tracking-tight mb-4">
                  Servicios y Comodidades
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {servicesList.map((service, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "#00C8D4" }} />
                      <span className="text-xs font-bold text-slate-700">{getAmenityLabel(service)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 1. SECCIÓN DE HABITACIONES AGREGADAS (CATÁLOGO DE UNIDADES OPERATIVAS) */}
            {rooms.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-xl font-serif font-black text-gray-800 tracking-tight flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-brand-magenta flex items-center justify-center text-white shrink-0 shadow-sm">
                        <Bed className="w-4 h-4 text-white" />
                      </div>
                      Unidades y Tipologías de Habitación
                    </h2>
                    <p className="text-xs text-gray-400 font-semibold mt-1">
                      Explora las opciones de hospedaje disponibles, tarifas por noche y comodidades incluidas.
                    </p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-brand-turquesa/10 text-brand-turquesa rounded-full border border-brand-turquesa/20 shrink-0 self-start sm:self-center">
                    {rooms.length} {rooms.length === 1 ? "Opción Disponible" : "Opciones Disponibles"}
                  </span>
                </div>

                {/* Rooms Cards List */}
                <div className="space-y-8">
                  {rooms.map((room) => {
                    const photos = roomPhotos[room.id] || [];
                    const activeImgIdx = selectedRoomImageIndex[room.id] || 0;
                    const mainPhoto = photos[activeImgIdx] || photos[0] || establishment.primary_image;

                    return (
                      <div key={room.id} className="bg-gray-50/50 border border-gray-200/80 rounded-3xl p-5 md:p-6 transition-all hover:border-gray-300 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Room Image Showcase Column */}
                        <div className="lg:col-span-5 space-y-3">
                          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-200 group shadow-sm">
                            <img
                              src={mainPhoto}
                              alt={room.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            
                            {/* Lightbox Trigger Icon */}
                            <button
                              type="button"
                              onClick={() => setActiveLightbox({ url: mainPhoto, title: room.name, category: "Habitación" })}
                              className="absolute bottom-3 right-3 p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-xl text-white transition-colors cursor-pointer shadow-md"
                              title="Ampliar fotografía"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>

                            {/* Code badge */}
                            <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black uppercase rounded-lg shadow-sm">
                              {room.room_number ? `Código: ${room.room_number}` : `Unidad #${room.id}`}
                            </div>
                          </div>

                          {/* Thumbnails list if multiple photos */}
                          {photos.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                              {photos.map((ph: string, pIdx: number) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() => setSelectedRoomImageIndex(prev => ({ ...prev, [room.id]: pIdx }))}
                                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                                    pIdx === activeImgIdx ? "border-brand-magenta scale-95" : "border-transparent opacity-60 hover:opacity-100"
                                  }`}
                                >
                                  <img src={ph} alt="" className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Room Content & Amenities Details Column */}
                        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                              <h3 className="text-lg font-black text-gray-800 leading-tight font-serif">
                                {room.name}
                              </h3>
                              
                              {/* Price Tag */}
                              <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-gray-400 block">Tarifa por Noche</span>
                                <span className="text-xl font-black text-brand-magenta">
                                  ${room.price_per_night} <span className="text-xs font-bold text-gray-500">USD</span>
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-gray-500 leading-relaxed mb-4">
                              {room.description || "Habitación confortable equipada con todas las comodidades para una estancia placentera."}
                            </p>

                            {/* Specs Pill List */}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 font-bold mb-4">
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl">
                                <Users className="w-4 h-4 text-brand-turquesa" />
                                <span>Capacidad: {room.capacity || 2} personas</span>
                              </div>
                              {room.quantity && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl">
                                  <Bed className="w-4 h-4 text-brand-magenta" />
                                  <span>{room.quantity} unidades disponibles</span>
                                </div>
                              )}
                            </div>

                            {/* Amenities Badges */}
                            {room.amenities && (
                              <div className="space-y-1.5">
                                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block">Equipamiento Incluido</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {room.amenities.split(",").map((am: string) => {
                                    const t = am.trim();
                                    if (!t) return null;
                                    return (
                                      <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-slate-700 border border-gray-200 rounded-lg text-[10px] font-bold shadow-2xs">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-turquesa shrink-0" />
                                        {getRoomAmenityText(t)}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="pt-4 border-t border-gray-200/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="text-[11px] text-gray-400 font-bold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Confirmación directa con el establecimiento</span>
                            </div>

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
              </div>
            )}

            {/* 2. SECCIÓN DE GALERÍAS Y FOTOS DE ÁREAS E INSTALACIONES (Piscina, Restaurante, Parque, Fachada, etc.) */}
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
                <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                      <h2 className="text-xl font-serif font-black text-gray-800 tracking-tight flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-brand-turquesa flex items-center justify-center text-white shrink-0 shadow-sm">
                          <Camera className="w-4 h-4 text-white" />
                        </div>
                        Instalaciones y Galerías de Áreas
                      </h2>
                      <p className="text-xs text-gray-400 font-semibold mt-1">
                        Recorre visualmente las distintas instalaciones, áreas de esparcimiento y espacios comunes.
                      </p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-purple-50 text-[#9B00CC] rounded-full border border-purple-200 shrink-0 self-start sm:self-center">
                      {displayPhotos.length} {displayPhotos.length === 1 ? "Fotografía" : "Fotografías"}
                    </span>
                  </div>

                  {/* Category Pills Filters */}
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setSelectedGalleryCategory("todas")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                        selectedGalleryCategory === "todas"
                          ? "bg-[#0e011f] text-white border-[#0e011f] shadow-sm"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <span>🖼️</span>
                      <span>Todas las Áreas</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${selectedGalleryCategory === "todas" ? "bg-brand-magenta text-white" : "bg-gray-200 text-gray-700"}`}>
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
                              ? "bg-[#0e011f] text-white border-[#0e011f] shadow-sm"
                              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <span>{catInfo.icon}</span>
                          <span>{catInfo.label}</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${isSel ? "bg-brand-magenta text-white" : "bg-gray-200 text-gray-700"}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Categorized Photos Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
                    {displayPhotos.map((item, idx) => {
                      const catInfo = AREA_CATEGORY_INFO[item.category] || { label: item.category.toUpperCase(), icon: "📷" };
                      
                      return (
                        <div
                          key={idx}
                          onClick={() => setActiveLightbox({ url: item.url, title: `${establishment.name} — ${catInfo.label}`, category: catInfo.label })}
                          className="relative aspect-4/3 rounded-2xl overflow-hidden bg-gray-100 group shadow-xs cursor-pointer border border-gray-200/60"
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

            {/* Alrededores del Hotel Card */}
            {surroundings.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm text-left space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-xl font-serif font-black text-gray-800 tracking-tight flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-brand-magenta" />
                    Alrededores del hotel
                  </h2>
                  <p className="text-[11px] text-gray-400 font-semibold mt-1">¡A los clientes les encantó pasear por la urbanización! Ubicación excelente</p>
                </div>

                {/* Centro Histórico Alert-like Box */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-150 rounded-2xl relative">
                  <div className="w-8 h-8 rounded-lg bg-brand-turquesa flex items-center justify-center text-[#0e011f] shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="block text-xs font-black text-gray-700 uppercase tracking-wider">Está en el centro histórico</span>
                    <p className="text-[11px] text-gray-500 mt-1 leading-normal font-medium">
                      En el centro histórico podrás visitar un sinfín de iglesias, palacios y plazas, todo ello rodeado de una atmósfera colonial y sutil.
                    </p>
                  </div>
                </div>

                {/* 3 Column Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Column 1: ¿Qué hay cerca? & Restaurantes */}
                  <div className="space-y-6">
                    {/* ¿Qué hay cerca? */}
                    {surroundings.filter(s => s.category === "cerca").length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-700 tracking-wider">
                          <div className="w-6 h-6 bg-brand-turquesa rounded-lg flex items-center justify-center shrink-0">
                            <MapPin className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span>¿Qué hay cerca?</span>
                        </div>
                        <div className="space-y-2 pl-8">
                          {surroundings.filter(s => s.category === "cerca").map((poi, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs text-gray-600 font-semibold">
                              <span className="truncate max-w-[150px]">{poi.name}</span>
                              <span className="text-gray-400 shrink-0 font-bold">{poi.distance}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Restaurantes y Cafeterías */}
                    {surroundings.filter(s => s.category === "gastronomia").length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-700 tracking-wider">
                          <div className="w-6 h-6 bg-brand-magenta rounded-lg flex items-center justify-center shrink-0">
                            <Utensils className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span>Restaurantes y café</span>
                        </div>
                        <div className="space-y-2 pl-8">
                          {surroundings.filter(s => s.category === "gastronomia").map((poi, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs text-gray-600 font-semibold">
                              <span className="truncate max-w-[150px]">{poi.name}</span>
                              <span className="text-gray-400 shrink-0 font-bold">{poi.distance}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column 2: Atracciones & Playas */}
                  <div className="space-y-6">
                    {/* Atracciones destacadas */}
                    {surroundings.filter(s => s.category === "atracciones").length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-700 tracking-wider">
                          <div className="w-6 h-6 bg-[#9B00CC] rounded-lg flex items-center justify-center shrink-0">
                            <Compass className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span>Atracciones</span>
                        </div>
                        <div className="space-y-2 pl-8">
                          {surroundings.filter(s => s.category === "atracciones").map((poi, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs text-gray-600 font-semibold">
                              <span className="truncate max-w-[150px]">{poi.name}</span>
                              <span className="text-gray-400 shrink-0 font-bold">{poi.distance}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Playas en la zona */}
                    {surroundings.filter(s => s.category === "playas").length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-700 tracking-wider">
                          <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span>Playas en la zona</span>
                        </div>
                        <div className="space-y-2 pl-8">
                          {surroundings.filter(s => s.category === "playas").map((poi, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs text-gray-600 font-semibold">
                              <span className="truncate max-w-[150px]">{poi.name}</span>
                              <span className="text-gray-400 shrink-0 font-bold">{poi.distance}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column 3: Transporte & Aeropuertos */}
                  <div className="space-y-6">
                    {/* Transporte público */}
                    {surroundings.filter(s => s.category === "transporte").length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-700 tracking-wider">
                          <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                            <Car className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span>Transporte público</span>
                        </div>
                        <div className="space-y-2 pl-8">
                          {surroundings.filter(s => s.category === "transporte").map((poi, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs text-gray-600 font-semibold">
                              <span className="truncate max-w-[150px]">{poi.name}</span>
                              <span className="text-gray-400 shrink-0 font-bold">{poi.distance}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Aeropuertos más cercanos */}
                    {surroundings.filter(s => s.category === "aeropuertos").length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-700 tracking-wider">
                          <div className="w-6 h-6 bg-sky-500 rounded-lg flex items-center justify-center shrink-0">
                            <Plane className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span>Aeropuertos</span>
                        </div>
                        <div className="space-y-2 pl-8">
                          {surroundings.filter(s => s.category === "aeropuertos").map((poi, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs text-gray-600 font-semibold">
                              <span className="truncate max-w-[150px]">{poi.name}</span>
                              <span className="text-gray-400 shrink-0 font-bold">{poi.distance}</span>
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

          {/* Sticky Sidebar Info Card */}
          <div className="space-y-6">
            
            {/* Booking Widget */}
            {establishment.has_reservations_enabled && (
              <BookingWidget
                establishmentId={establishment.id}
                establishmentName={establishment.name}
                whatsapp={establishment.whatsapp}
                categorySlug={establishment.category_slug}
              />
            )}

            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-md sticky top-24 space-y-6 text-left">
              <h3 className="text-md font-black text-gray-800 tracking-tight pb-3 border-b border-gray-50">
                Información de Contacto
              </h3>

              <div className="space-y-4">
                {establishment.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-brand-magenta shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-wide">Dirección</span>
                      <p className="text-xs text-gray-600 leading-normal font-medium">{establishment.address}</p>
                    </div>
                  </div>
                )}

                {establishment.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-brand-turquesa shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-wide">Teléfono</span>
                      <a href={`tel:${establishment.phone}`} className="text-xs text-gray-600 hover:text-brand-magenta transition-colors font-bold">
                        {establishment.phone}
                      </a>
                    </div>
                  </div>
                )}

                {establishment.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-brand-magenta shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-wide">Correo Electrónico</span>
                      <a href={`mailto:${establishment.email}`} className="text-xs text-gray-600 hover:text-brand-magenta transition-colors font-bold break-all">
                        {establishment.email}
                      </a>
                    </div>
                  </div>
                )}

                {establishment.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-brand-turquesa shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-wide">Sitio Web</span>
                      <a 
                        href={establishment.website.startsWith("http") ? establishment.website : `https://${establishment.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-gray-600 hover:text-brand-magenta transition-colors font-bold break-all"
                      >
                        {establishment.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>
                )}

                {establishment.hours && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-brand-magenta shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-wide">Horarios de Atención</span>
                      <p className="text-xs text-gray-600 font-medium whitespace-pre-line">{establishment.hours}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Static / Interactive Google Map Iframe (Saves leaf-let package dependencies) */}
              {establishment.latitude && establishment.longitude && (
                <div className="rounded-2xl overflow-hidden border border-gray-200 h-40 shadow-sm relative mt-4">
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
              <div className="space-y-3 pt-4 border-t border-gray-50 mt-4">
                {(establishment.whatsapp || establishment.phone) && (
                  <TrackedWhatsAppButton
                    whatsappNumber={establishment.whatsapp || establishment.phone}
                    establishmentId={establishment.id}
                    establishmentName={establishment.name}
                  >
                    Contactar vía WhatsApp
                  </TrackedWhatsAppButton>
                )}

                {establishment.phone && (
                  <button
                    onClick={() => {
                      window.location.href = `tel:${establishment.phone}`;
                    }}
                    className="w-full bg-white border border-brand-magenta hover:bg-magenta-50/5 text-brand-magenta text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    Llamar al Establecimiento
                  </button>
                )}

                {establishment.latitude && establishment.longitude && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${establishment.latitude},${establishment.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <button className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer">
                      <Navigation className="w-4 h-4" />
                      ¿Cómo llegar?
                    </button>
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Back Link Button */}
        <div className="mt-10 text-left">
          <Link href="/establecimientos">
            <button className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm">
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Guía de Establecimientos</span>
            </button>
          </Link>
        </div>

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
                  <span className="inline-block px-3 py-1 bg-brand-magenta text-white text-[10px] font-black uppercase tracking-wider rounded-full">
                    {activeLightbox.category}
                  </span>
                )}
                <h4 className="text-white text-base md:text-lg font-serif font-black">{activeLightbox.title}</h4>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
