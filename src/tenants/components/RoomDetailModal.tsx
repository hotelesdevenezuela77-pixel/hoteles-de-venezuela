import React, { useState } from "react";
import { 
  X, Users, Bed, Calendar, CheckCircle2, MessageCircle, Star, Sparkles, DollarSign, Clock, ShieldCheck
} from "lucide-react";
import { type Room } from "./RoomCard";

interface RoomDetailModalProps {
  room: Room | null;
  hotelName: string;
  whatsappPhone: string;
  onClose: () => void;
}

export function RoomDetailModal({ room, hotelName, whatsappPhone, onClose }: RoomDetailModalProps) {
  if (!room) return null;

  const displayPrice = room.price_per_night || room.price || room.base_price || 60;
  const rawModalPhotos =
    (Array.isArray(room.fotos) && room.fotos.length > 0 ? room.fotos : null) ||
    (Array.isArray((room as any).galeria) && (room as any).galeria.length > 0 ? (room as any).galeria : null) ||
    (Array.isArray(room.photos) && room.photos.length > 0 ? room.photos : null) ||
    [(room as any).foto_principal || (room as any).imagen_portada || room.cover_image || room.primary_image || room.image_url || (room as any).imagen || (room as any).foto].filter(Boolean);

  const photos = rawModalPhotos && rawModalPhotos.length > 0 ? rawModalPhotos : ["/placeholder-hotel.jpg"];

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestsCount, setGuestsCount] = useState(1);

  // Calcular número de noches
  let nights = 1;
  if (checkIn && checkOut) {
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    if (diff > 0) {
      nights = Math.ceil(diff / (1000 * 3600 * 24));
    }
  }

  const totalPrice = displayPrice * nights;

  const cleanPhone = whatsappPhone.replace(/[^0-9]/g, "");
  const waMsg = encodeURIComponent(
    `Hola, deseo reservar la unidad: ${room.name} en ${hotelName}.\n` +
    `📅 Check-in: ${checkIn || "Por definir"}\n` +
    `📅 Check-out: ${checkOut || "Por definir"}\n` +
    `👥 Huéspedes: ${guestsCount}\n` +
    `💵 Estimado: $${totalPrice} USD (${nights} noche${nights > 1 ? "s" : ""})\n\n` +
    `¿Tienen disponibilidad disponible para estas fechas?`
  );
  const waUrl = `https://wa.me/${cleanPhone || "584141234567"}?text=${waMsg}`;

  const AMENITY_MAP: Record<string, string> = {
    "wifi": "WiFi Starlink High-Speed",
    "aire": "Aire Acondicionado Split 18.000 BTU",
    "balcon": "Balcón Privado Vista al Mar",
    "vista_mar": "Vista Panorámica al Mar",
    "cocina_equipada": "Cocineta Equipada",
    "tv_cable": "TV por Cable / Smart TV 43''",
    "banio_privado": "Baño Privado con Agua Caliente",
    "nevera": "Nevera Ejecutiva",
    "caja_fuerte": "Caja Fuerte Digital",
    "jacuzzi": "Jacuzzi Privado",
    "estacionamiento": "Estacionamiento Privado"
  };

  const rawAmenities = room.amenities || room.features;
  let amenitiesList: string[] = [];
  if (Array.isArray(rawAmenities)) {
    amenitiesList = rawAmenities.map(a => AMENITY_MAP[a] || a);
  } else if (typeof rawAmenities === "string") {
    amenitiesList = (rawAmenities as string).split(",").map(a => a.trim()).map(a => AMENITY_MAP[a] || a.replace(/_/g, " "));
  } else {
    amenitiesList = [
      "Aire Acondicionado Split 18.000 BTU",
      "WiFi Fibra Óptica High-Speed",
      "Baño Privado con Agua Caliente 24/7",
      "TV por Cable / Smart TV 43''",
      "Lencería de Algodón 400 Hilos",
      "Nevera Ejecutiva & Cocineta Equipada",
      "Caja Fuerte Digital",
      "Servicio de Limpieza Diario"
    ];
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/75 backdrop-blur-md animate-fade-in">
      
      <div className="relative w-full max-w-4xl bg-white border border-slate-200/80 rounded-3xl shadow-2xl overflow-hidden text-slate-900 my-8">
        
        {/* BOTÓN CERRAR */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-100/90 text-slate-700 hover:text-white hover:bg-[#FF0096] transition-colors border border-slate-200 shadow-md cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[85vh] overflow-y-auto">
          
          {/* COLUMNA IZQUIERDA: GALERÍA DE FOTOS & DETALLES */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-slate-100">
            
            {/* Foto Principal */}
            <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-100">
              <img
                src={photos[activePhotoIdx]}
                alt={room.name}
                className="w-full h-full object-cover transition-all duration-500"
              />
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-full border border-white/10 text-xs font-bold text-[#00C8D4]">
                {room.category || "Habitación Premium"}
              </div>
            </div>

            {/* Miniaturas Carousel */}
            {photos.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activePhotoIdx === idx ? "border-[#00C8D4] scale-105 shadow-md" : "border-slate-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Información Principal */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-2xl sm:text-3xl font-black font-serif text-slate-900">{room.name}</h2>
                <div className="text-right shrink-0">
                  <span className="text-[#00C8D4] text-2xl font-black">${displayPrice}</span>
                  <span className="text-slate-500 text-xs block font-semibold">/ noche</span>
                </div>
              </div>

              {room.description && (
                <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed mt-3">
                  {room.description}
                </p>
              )}
            </div>

            {/* Ficha Técnica Detallada */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-[#00C8D4]" />
                <span>Camas: {room.beds_count || 1} ({room.bed_type || "Matrimonial / Queen"})</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FF0096]" />
                <span>Capacidad: hasta {room.capacity || 2} huéspedes</span>
              </div>
            </div>

            {/* Equipamiento Completo */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#FF0096] mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#00C8D4]" /> Equipamiento & Comodidades Incluidas
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {amenitiesList.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                    <CheckCircle2 className="w-4 h-4 text-[#00C8D4] shrink-0" />
                    <span className="text-slate-800 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA: CALCULADORA Y SOLICITUD WHATSAPP */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-slate-50 flex flex-col justify-between space-y-6">
            
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-[#00C8D4] font-black block">
                  🛡️ GARANTÍA DE TARIFA DIRECTA
                </span>
                <p className="text-xs text-slate-600 font-medium">
                  Reserva directamente sin comisiones de intermediarios y con confirmación inmediata vía WhatsApp.
                </p>
              </div>

              {/* Selector de Fechas */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Fecha de Llegada (Check-in)</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Fecha de Salida (Check-out)</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Número de Huéspedes</label>
                  <select
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#00C8D4]"
                  >
                    {[...Array(room.capacity || 4)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? "Huésped" : "Huéspedes"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Resumen de Tarifas */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Precio por noche</span>
                  <span className="font-bold text-slate-900">${displayPrice} USD</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Estadía estimada</span>
                  <span className="font-bold text-slate-900">{nights} noche{nights > 1 ? "s" : ""}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-extrabold text-slate-900">
                  <span>Total Estimado</span>
                  <span className="text-[#00C8D4] text-xl font-black">${totalPrice} USD</span>
                </div>
              </div>
            </div>

            {/* BOTÓN WHATSAPP PRE-FILLED EN VERDE SÓLIDO */}
            <div>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl font-extrabold text-white bg-[#25D366] hover:bg-[#20bd5a] transition-all shadow-xl active:scale-95 text-center text-xs sm:text-sm cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-current shrink-0" />
                <span>Reservar esta Habitación por WhatsApp</span>
              </a>
              <span className="text-[10px] text-slate-500 text-center block mt-2 font-medium">
                Respuesta inmediata por el equipo de recepción en menos de 5 min.
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
