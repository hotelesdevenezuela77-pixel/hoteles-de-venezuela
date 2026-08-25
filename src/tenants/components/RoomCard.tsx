import React from "react";
import { 
  Users, Bed, Maximize2, CheckCircle2, MessageCircle, Eye, Star
} from "lucide-react";

export interface Room {
  id: string | number;
  name: string;
  category?: string;
  description?: string;
  price_per_night?: number;
  price?: number;
  base_price?: number;
  capacity?: number;
  beds_count?: number;
  bed_type?: string;
  photos?: string[];
  image_url?: string;
  primary_image?: string;
  amenities?: string[];
  features?: string[];
  is_active?: boolean;
}

interface RoomCardProps {
  room: Room;
  hotelName: string;
  whatsappPhone: string;
  onOpenDetail: (room: Room) => void;
}

export function RoomCard({ room, hotelName, whatsappPhone, onOpenDetail }: RoomCardProps) {
  const displayPrice = room.price_per_night || room.price || room.base_price || 60;
  const image = room.primary_image || room.image_url || (room.photos && room.photos[0]) || 
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop";
  
  const category = room.category || "Habitación Premium";
  const capacity = room.capacity || 2;
  const amenitiesList = room.amenities || room.features || [
    "Aire Acondicionado",
    "WiFi de Alta Velocidad",
    "Baño Privado",
    "TV por Cable",
    "Servicio a la Habitación"
  ];

  // Formatear mensaje directo para WhatsApp
  const cleanPhone = whatsappPhone.replace(/[^0-9]/g, "");
  const waText = encodeURIComponent(
    `Hola ${hotelName}, deseo consultar disponibilidad y tarifas para la habitación "${room.name}". ¿Podrían asesorarme?`
  );
  const waUrl = `https://wa.me/${cleanPhone || "584141234567"}?text=${waText}`;

  return (
    <div className="group relative bg-[#1a0533] border border-[#9B00CC]/25 hover:border-[#00C8D4] rounded-3xl overflow-hidden shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      
      {/* IMAGEN DE CABECERA CON BADGES */}
      <div className="relative h-64 overflow-hidden shrink-0 bg-slate-900">
        <img
          src={image}
          alt={room.name}
          loading="lazy"
          className="w-full h-full object-cover scale-[1.03] group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0533] via-transparent to-black/40"></div>

        {/* Badge Categoria (Superior Izquierda) */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#0e011f]/90 backdrop-blur border border-white/10 text-white shadow-lg">
            {category}
          </span>
        </div>

        {/* Badge Precio por Noche en USD (Superior Derecha) */}
        <div className="absolute top-4 right-4">
          <div className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#00C8D4] to-[#0099AA] text-white font-extrabold text-xs shadow-lg flex items-center gap-1">
            <span className="text-[10px] opacity-80 uppercase">Desde</span>
            <span className="text-sm font-black">${displayPrice}</span>
            <span className="text-[10px] opacity-80">/noche</span>
          </div>
        </div>

        {/* Badge de Capacidad & Estrellas (Inferior) */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-200">
          <div className="flex items-center gap-2 bg-[#0e011f]/90 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-white">
            <Users className="w-3.5 h-3.5 text-[#00C8D4]" />
            <span className="font-semibold text-[11px]">{capacity} Huéspedes</span>
          </div>

          <div className="flex items-center gap-1 bg-[#0e011f]/90 backdrop-blur px-2.5 py-1 rounded-full border border-white/10 text-amber-400 font-bold text-[11px]">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>4.9</span>
          </div>
        </div>
      </div>

      {/* CUERPO DE LA TARJETA */}
      <div className="p-6 flex flex-col justify-between flex-1 space-y-4 bg-[#1a0533]">
        
        <div>
          {/* Título de la Habitación en Serif */}
          <h3 className="text-xl md:text-2xl font-black font-serif text-white group-hover:text-[#00C8D4] transition-colors leading-snug">
            {room.name}
          </h3>

          {/* Descripción Corta */}
          {room.description && (
            <p className="text-slate-300 text-xs font-light leading-relaxed mt-2 line-clamp-2">
              {room.description}
            </p>
          )}

          {/* Cápsulas de Amenidades */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {amenitiesList.slice(0, 4).map((amenity, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#0e011f] border border-[#9B00CC]/30 text-slate-200"
              >
                <CheckCircle2 className="w-3 h-3 text-[#FF0096]" />
                {amenity}
              </span>
            ))}
            {amenitiesList.length > 4 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-[#9B00CC]/20 text-[#00C8D4] border border-[#00C8D4]/30">
                +{amenitiesList.length - 4} más
              </span>
            )}
          </div>
        </div>

        {/* BOTONES DE ACCIÓN (DUAL CTA) */}
        <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-2.5">
          
          {/* Botón 1: WhatsApp Directo */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-md active:scale-95 text-center"
            title="Consultar por WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-current shrink-0" />
            <span className="truncate">WhatsApp</span>
          </a>

          {/* Botón 2: Ver Ficha / Reservar */}
          <button
            onClick={() => onOpenDetail(room)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] hover:from-[#00C8D4]/90 hover:to-[#9B00CC]/90 transition-all shadow-md active:scale-95 text-center cursor-pointer"
          >
            <Eye className="w-4 h-4 shrink-0" />
            <span className="truncate">Ver Ficha</span>
          </button>

        </div>

      </div>

    </div>
  );
}
