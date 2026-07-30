import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { supabase } from "../lib/supabase";
import { ESTABLISHMENTS_MOCK } from "../lib/establishmentsMock";
import { TrackedWhatsAppButton, trackEvent } from "../components/layout/TrackedWhatsAppButton";
import { AvailabilityCalendar } from "../components/AvailabilityCalendar";
import { BookingWidget } from "../components/BookingWidget";
import { 
  MapPin, Phone, Globe, Mail, Clock, Star, 
  ChevronLeft, ChevronRight, Share2, Heart,
  ArrowLeft, DollarSign, Navigation, Loader2, AlertTriangle, Sparkles,
  Coffee, Compass, Utensils, Plane, Car, Building2
} from "lucide-react";

import { parseServicesList, getAmenityLabel } from "../lib/amenitiesList";

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
}

export function EstablecimientoDetalle() {
  const { slug } = useParams() as any;
  const [establishment, setEstablishment] = useState<EstablishmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const [surroundings, setSurroundings] = useState<any[]>([]);

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
        } else if (destSlug.includes("morrocoy")) {
          defaults = [
            { category: "cerca", name: "Embarcadero de Tucacas", distance: "800 m" },
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
          // Destino general en Venezuela
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
        const { data, error } = await supabase
          .from("establishments")
          .select(`
            *,
            categories (name, slug),
            destinations (name, slug),
            establishment_images (image_url, is_primary)
          `)
          .eq("slug", slug)
          .eq("status", "approved")
          .maybeSingle();

        if (error) throw error;

        if (data) {
          const primaryImg = data.establishment_images?.find((img: any) => img.is_primary)?.image_url 
            || data.establishment_images?.[0]?.image_url 
            || "";

          const allImages = data.establishment_images?.map((img: any) => img.image_url) || [];
          if (allImages.length === 0 && primaryImg) {
            allImages.push(primaryImg);
          }

          const mapped: EstablishmentDetail = {
            id: data.id,
            slug: data.slug,
            name: data.name,
            description: data.description || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            phone: data.phone || "",
            email: data.email || "",
            website: data.website || "",
            category_name: data.categories?.name || "Establecimiento",
            category_slug: data.categories?.slug || "",
            destination_name: data.destinations?.name || "",
            destination_slug: data.destinations?.slug || "",
            primary_image: primaryImg,
            rating_avg: data.rating_avg || 0,
            review_count: data.review_count || 0,
            price_level: data.price_level || "",
            is_featured: data.is_featured || false,
            services: data.services || "[]",
            membership_tier: data.membership_tier || "basic",
            has_hdv_seal: data.has_hdv_seal || false,
            has_reservations_enabled: data.has_reservations_enabled || false,
            images: allImages,
            latitude: data.latitude,
            longitude: data.longitude,
            hours: data.hours,
            whatsapp: data.whatsapp
          };

          setEstablishment(mapped);
          document.title = `${mapped.name} | Hoteles de Venezuela`;
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error al cargar detalles de Supabase:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchDetail();
    }
  }, [slug]);

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
      
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
          <Link href="/" className="hover:text-brand-magenta transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/establecimientos" className="hover:text-brand-magenta transition-colors">Explorar</Link>
          <span>/</span>
          <span className="text-gray-600 truncate max-w-[200px]">{establishment.name}</span>
        </div>
      </div>

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

      </div>
    </div>
  );
}
