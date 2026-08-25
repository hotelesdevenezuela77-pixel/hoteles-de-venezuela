import React from "react";
import { 
  Users, Bed, Maximize2, CheckCircle2, MessageCircle, Eye, Star
} from "lucide-react";

export interface Room {
  id: string | number;
  name?: string;
  nombre?: string;
  title?: string;
  category?: string;
  categoria?: string;
  tipo_unidad?: string;
  description?: string;
  descripcion?: string;
  price_per_night?: number;
  price?: number;
  base_price?: number;
  tarifa_base?: number;
  price_usd?: number;
  capacity?: number;
  capacidad_max?: number;
  max_guests?: number;
  beds_count?: number;
  bed_type?: string;
  photos?: string[];
  fotos?: string[];
  cover_image?: string;
  image_url?: string;
  primary_image?: string;
  amenities?: string[];
  comodidades?: string[];
  features?: string[];
  is_active?: boolean;
}

interface RoomCardProps {
  room: Room;
  hotelName: string;
  whatsappPhone: string;
  onOpenDetail: (room: Room) => void;
}

export function resolveRoomImageUrl(room: any): string {
  if (!room) return "";

  const candidate =
    (Array.isArray(room.fotos) && room.fotos.length > 0 ? room.fotos[0] : null) ||
    (Array.isArray(room.galeria) && room.galeria.length > 0 ? room.galeria[0] : null) ||
    (Array.isArray(room.galeria_fotos) && room.galeria_fotos.length > 0 ? room.galeria_fotos[0] : null) ||
    (Array.isArray(room.photos) && room.photos.length > 0 ? room.photos[0] : null) ||
    room.foto_principal ||
    room.imagen_portada ||
    room.cover_image ||
    room.cover_url ||
    room.primary_image ||
    room.image_url ||
    room.imagen ||
    room.foto;

  if (!candidate) return "";

  if (typeof candidate === "string") {
    if (candidate.startsWith("http://") || candidate.startsWith("https://") || candidate.startsWith("data:")) {
      return candidate;
    }
    const cleanPath = candidate.replace(/^\/+/, "");
    return `https://supabase.co/storage/v1/object/public/${cleanPath}`;
  }

  return "";
}

export function RoomCard({ room, hotelName, whatsappPhone, onOpenDetail }: RoomCardProps) {
  console.log("HABITACION DATA:", room);

  // Title Mapping: room.nombre || room.title || room.name
  const roomTitle = room.nombre || room.title || room.name || "Habitación";

  // Price Mapping: room.tarifa_base || room.price_usd || room.price_per_night || room.price || room.base_price
  const displayPrice = room.tarifa_base || room.price_usd || room.price_per_night || room.price || room.base_price || 70;

  // Lógica dinámica para la foto real de la habitación (arrays y nombres comunes de columnas)
  const image = resolveRoomImageUrl(room);

  // Category Badge Mapping: room.categoria || room.tipo_unidad || room.category
  const category = room.categoria || room.tipo_unidad || room.category || "Habitación Premium";

  // Capacity Mapping: room.capacidad_max || room.max_guests || room.capacity
  const capacity = room.capacidad_max || room.max_guests || room.capacity || 2;

  const AMENITY_MAP: Record<string, string> = {
    "wifi": "WiFi Starlink",
    "aire": "Aire Acondicionado Split",
    "balcon": "Balcón Privado",
    "vista_mar": "Vista Panorámica al Mar",
    "cocina_equipada": "Cocineta Equipada",
    "tv_cable": "TV Smart 50''",
    "banio_privado": "Baño Privado",
    "nevera": "Frigobar / Nevera",
    "caja_fuerte": "Caja Fuerte",
    "jacuzzi": "Jacuzzi Privado",
    "estacionamiento": "Estacionamiento"
  };

  // Amenities Tag Array Mapping: room.comodidades || room.amenities || room.features
  const rawAmenities = room.comodidades || room.amenities || room.features;
  let amenitiesList: string[] = [];
  if (Array.isArray(rawAmenities)) {
    amenitiesList = rawAmenities.map(a => AMENITY_MAP[a] || a);
  } else if (typeof rawAmenities === "string") {
    amenitiesList = (rawAmenities as string).split(",").map(a => a.trim()).map(a => AMENITY_MAP[a] || a.replace(/_/g, " "));
  } else {
    amenitiesList = [
      "Aire Acondicionado Split",
      "WiFi Starlink",
      "Baño Privado",
      "TV Smart",
      "Servicio a la Habitación"
    ];
  }

  // Formatear mensaje directo dinámico para WhatsApp
  const cleanPhone = whatsappPhone.replace(/[^0-9]/g, "");
  const waText = encodeURIComponent(
    `Hola ${hotelName}, deseo consultar disponibilidad y tarifas para la habitación "${roomTitle}". ¿Podrían asesorarme?`
  );
  const waUrl = `https://wa.me/${cleanPhone || "584141234567"}?text=${waText}`;

  return (
    <div className="group relative bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      
      {/* IMAGEN DE CABECERA CON BADGES DINOÁMICOS */}
      <div className="relative h-64 overflow-hidden shrink-0 bg-slate-100">
        <img
          src={image}
          alt={roomTitle}
          loading="lazy"
          className="w-full h-full object-cover scale-[1.03] group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/30"></div>

        {/* Badge Categoría Dinámico (Superior Izquierda) */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#FF0096] text-white shadow-md">
            {category}
          </span>
        </div>

        {/* Badge Precio USD Dinámico (Superior Derecha) */}
        <div className="absolute top-4 right-4">
          <div className="px-3.5 py-1.5 rounded-full bg-[#00C8D4] text-white font-extrabold text-xs shadow-md flex items-center gap-1">
            <span className="text-[10px] opacity-85 uppercase">Desde</span>
            <span className="text-sm font-black">${displayPrice}</span>
            <span className="text-[10px] opacity-85">/noche</span>
          </div>
        </div>

        {/* Badge Capacidad Dinámica (Inferior) */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-200">
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-white">
            <Users className="w-3.5 h-3.5 text-[#00C8D4]" />
            <span className="font-semibold text-[11px]">{capacity} Huéspedes</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur px-2.5 py-1 rounded-full border border-white/10 text-amber-400 font-bold text-[11px]">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>4.9</span>
          </div>
        </div>
      </div>

      {/* CUERPO DE LA TARJETA */}
      <div className="p-6 flex flex-col justify-between flex-1 space-y-4 bg-white">
        
        <div>
          {/* Título de la Habitación Dinámico */}
          <h3 className="text-xl md:text-2xl font-black font-serif text-slate-900 group-hover:text-[#00C8D4] transition-colors leading-snug">
            {roomTitle}
          </h3>

          {/* Descripción Corta Dinámica */}
          {(room.descripcion || room.description) && (
            <p className="text-slate-600 text-xs font-normal leading-relaxed mt-2 line-clamp-2">
              {room.descripcion || room.description}
            </p>
          )}

          {/* Cápsulas de Amenidades Dinámicas */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {amenitiesList.slice(0, 4).map((amenity, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 border border-slate-200/60 text-slate-700"
              >
                <CheckCircle2 className="w-3 h-3 text-[#FF0096]" />
                {amenity}
              </span>
            ))}
            {amenitiesList.length > 4 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#FF0096]/10 text-[#FF0096] border border-[#FF0096]/20">
                +{amenitiesList.length - 4} más
              </span>
            )}
          </div>
        </div>

        {/* BOTONES DE ACCIÓN (DUAL CTA EN COLORES SÓLIDOS OFICIALES) */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2.5">
          
          {/* Botón 1: WhatsApp Directo (Verde Sólido WhatsApp #25D366) */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-[#25D366] hover:bg-[#20bd5a] transition-all shadow-md active:scale-95 text-center cursor-pointer"
            title="Consultar por WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-current shrink-0" />
            <span className="truncate">WhatsApp</span>
          </a>

          {/* Botón 2: Ver Ficha / Reservar (Azul Turquesa Sólido #00C8D4) */}
          <button
            onClick={() => onOpenDetail(room)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-[#00C8D4] hover:bg-[#00b3be] transition-all shadow-md active:scale-95 text-center cursor-pointer"
          >
            <Eye className="w-4 h-4 shrink-0" />
            <span className="truncate">Ver Ficha</span>
          </button>

        </div>

      </div>

    </div>
  );
}
