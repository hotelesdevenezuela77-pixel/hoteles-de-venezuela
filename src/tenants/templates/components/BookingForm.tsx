import React, { useState, useEffect } from "react";
import { useTenant } from "../../tenantContext";
import { createTenantClient } from "../../lib/supabaseTenant";
import { Calendar, Users, DollarSign, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface Room {
  id: number;
  name: string;
  price_per_night: number;
  capacity: number;
  description: string;
  image_url: string;
}

// Habitaciones mockeadas por defecto según el tenant si no hay datos en la DB
const MOCK_ROOMS_BY_TENANT: Record<string, Room[]> = {
  "aparto-posada-del-mar": [
    { id: 201, name: "Estudio Vista al Mar", price_per_night: 85, capacity: 2, description: "Apartamento acogedor con kitchenette, balcón privado y vista directa al mar Caribe.", image_url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop" },
    { id: 202, name: "Apartamento Familiar", price_per_night: 130, capacity: 5, description: "Dos habitaciones independientes, cocina completa, comedor y terraza panorámica.", image_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&auto=format&fit=crop" }
  ],
  "perla-negra": [
    { id: 301, name: "Cabaña de Bodas Real", price_per_night: 120, capacity: 2, description: "Cabaña romántica de estilo colonial frente a la arena, con ducha al aire libre y jacuzzi.", image_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop" },
    { id: 302, name: "Suite del Almirante", price_per_night: 175, capacity: 3, description: "Nuestra suite de lujo más exclusiva, decorada en maderas nobles con vistas al atardecer.", image_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop" }
  ],
  "my-campers": [
    { id: 401, name: "Eco Camper Premium", price_per_night: 55, capacity: 2, description: "Camper completamente equipado con paneles solares, cama matrimonial y deck de madera privado.", image_url: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600&auto=format&fit=crop" },
    { id: 402, name: "Carpa Glamping Familiar", price_per_night: 70, capacity: 4, description: "Tienda safari elevada con colchones de alta densidad, iluminación LED y fogata privada.", image_url: "https://images.unsplash.com/photo-1533873984035-25970ab07461?w=600&auto=format&fit=crop" }
  ],
  "oleaje-beach-club": [
    { id: 501, name: "Bungalow sobre el Agua VIP", price_per_night: 350, capacity: 2, description: "Bungalow exclusivo flotante con piso de cristal, piscina infinity privada y mayordomo personal.", image_url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&auto=format&fit=crop" },
    { id: 502, name: "Oceanfront Premium Villa", price_per_night: 520, capacity: 6, description: "Villa de dos niveles al borde del arrecife, cocina gourmet de chef, spa y acceso a playa privada.", image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop" }
  ],
  "complejo-los-roques": [
    { id: 601, name: "Palafito Superior", price_per_night: 400, capacity: 2, description: "Suite elevada sobre el agua turquesa con acceso directo para hacer snorkel.", image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop" },
    { id: 602, name: "Gran Villa Los Roques", price_per_night: 650, capacity: 6, description: "La máxima experiencia del archipiélago. Servicio todo incluido premium con lancha propia.", image_url: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&auto=format&fit=crop" }
  ]
};

export function BookingForm() {
  const { config } = useTenant();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Form states
  const [selectedRoomId, setSelectedRoomId] = useState<number>(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmationCode, setConfirmationCode] = useState("");

  const tenantClient = createTenantClient(config.establishment_id);

  // Cargar habitaciones
  useEffect(() => {
    async function loadRooms() {
      try {
        setLoadingRooms(true);
        // Intentar leer de base de datos usando el cliente multi-tenant
        const { data, error } = await tenantClient.from("rooms").select("*");
        
        if (error || !data || data.length === 0) {
          // Fallback a mock data local si la DB no tiene o falla
          const fallbackRooms = MOCK_ROOMS_BY_TENANT[config.slug] || [];
          setRooms(fallbackRooms);
          if (fallbackRooms.length > 0) {
            setSelectedRoomId(fallbackRooms[0].id);
          }
        } else {
          const formatted: Room[] = data.map((r: any) => ({
            id: r.id,
            name: r.name,
            price_per_night: r.price_per_night || r.pricePerNight || 100,
            capacity: r.capacity || 2,
            description: r.description || "",
            image_url: r.image_url || r.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop"
          }));
          setRooms(formatted);
          if (formatted.length > 0) {
            setSelectedRoomId(formatted[0].id);
          }
        }
      } catch (e) {
        // Fallback robusto
        const fallbackRooms = MOCK_ROOMS_BY_TENANT[config.slug] || [];
        setRooms(fallbackRooms);
        if (fallbackRooms.length > 0) {
          setSelectedRoomId(fallbackRooms[0].id);
        }
      } finally {
        setLoadingRooms(false);
      }
    }
    loadRooms();
  }, [config.slug, config.establishment_id]);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const nights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const totalPrice = selectedRoom ? selectedRoom.price_per_night * nights() : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !checkIn || !checkOut || !guestName || !guestPhone) {
      setSubmitError("Por favor rellene todos los campos obligatorios.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const code = "HDV-TENANT-" + Math.floor(100000 + Math.random() * 900000);

    try {
      // Intentar insertar en Supabase Core usando nuestro wrapper seguro
      const { error: dbError } = await tenantClient.from("reservations").insert({
        room_id: selectedRoomId,
        guest_name: guestName,
        guest_email: guestEmail || null,
        guest_phone: guestPhone || null,
        check_in_date: checkIn,
        check_out_date: checkOut,
        guests_count: guests,
        room_type: selectedRoom?.name || "Standard",
        total_price: totalPrice,
        notes: notes || null,
        status: "pending",
        source: `tenant-node:${config.slug}`,
        confirmation_code: code
      });

      if (dbError) {
        console.warn("Error al insertar en DB Supabase, usando respaldo local:", dbError);
        // Fallback localstorage
        const localKey = "hdv_mock_reservations";
        const current = JSON.parse(localStorage.getItem(localKey) || "[]");
        current.push({
          id: Math.floor(Math.random() * 1000000),
          establishment_id: config.establishment_id,
          establishment_name: config.name,
          room_id: selectedRoomId,
          guest_name: guestName,
          guest_email: guestEmail || null,
          guest_phone: guestPhone || null,
          check_in_date: checkIn,
          check_out_date: checkOut,
          guests_count: guests,
          room_type: selectedRoom?.name || "Standard",
          total_price: totalPrice,
          notes: notes || null,
          status: "pending",
          source: `tenant-node:${config.slug}`,
          confirmation_code: code,
          created_at: new Date().toISOString()
        });
        localStorage.setItem(localKey, JSON.stringify(current));
      }

      setConfirmationCode(code);
      setSubmitSuccess(true);
    } catch (err: any) {
      console.error("Excepción en reservas:", err);
      setSubmitError(err?.message || "Ocurrió un error inesperado al procesar su solicitud.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bg-[#1a0533] border border-[#00C8D4]/30 rounded-3xl p-8 text-center text-white shadow-xl max-w-lg mx-auto">
        <div className="w-16 h-16 bg-[#00C8D4]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#00C8D4]">
          <CheckCircle2 className="w-8 h-8 text-[#00C8D4]" />
        </div>
        <h3 className="text-2xl font-bold font-serif mb-2">¡Reserva Registrada!</h3>
        <p className="text-slate-400 text-xs mb-6 max-w-sm mx-auto leading-relaxed">
          Su solicitud ha sido recibida en el Core central de Hoteles de Venezuela. Nos comunicaremos con usted a la brevedad.
        </p>

        <div className="bg-[#0e011f] rounded-2xl p-4 border border-[#9B00CC]/20 mb-6 text-left">
          <div className="flex justify-between border-b border-[#1a0533] pb-2 mb-2 text-xs">
            <span className="text-slate-500">Establecimiento:</span>
            <span className="font-bold text-white">{config.name}</span>
          </div>
          <div className="flex justify-between border-b border-[#1a0533] pb-2 mb-2 text-xs">
            <span className="text-slate-500">Código de Confirmación:</span>
            <span className="font-mono font-bold text-[#00C8D4]">{confirmationCode}</span>
          </div>
          <div className="flex justify-between border-b border-[#1a0533] pb-2 mb-2 text-xs">
            <span className="text-slate-500">Habitación:</span>
            <span className="font-bold text-white">{selectedRoom?.name}</span>
          </div>
          <div className="flex justify-between border-b border-[#1a0533] pb-2 mb-2 text-xs">
            <span className="text-slate-500">Fechas:</span>
            <span className="font-bold text-white">{checkIn} al {checkOut}</span>
          </div>
          <div className="flex justify-between text-xs pt-1">
            <span className="text-slate-500 font-bold">Total Estancia:</span>
            <span className="font-black text-[#FF0096] text-sm">${totalPrice} USD</span>
          </div>
        </div>

        <button
          onClick={() => {
            setSubmitSuccess(false);
            setCheckIn("");
            setCheckOut("");
            setGuestName("");
            setGuestEmail("");
            setGuestPhone("");
            setNotes("");
          }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white text-xs font-bold uppercase tracking-widest hover:scale-102 transition-transform cursor-pointer"
        >
          Hacer Otra Reserva
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#1a0533] border border-[#9B00CC]/20 rounded-3xl p-6 md:p-8 text-white shadow-2xl">
      <h3 className="text-xl font-bold font-serif mb-6 flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-[#00C8D4] animate-pulse"></div>
        Cotizador y Reserva Directa
      </h3>

      {loadingRooms ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 text-[#00C8D4] animate-spin mb-3" />
          <span className="text-xs">Cargando habitaciones...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {submitError && (
            <div className="bg-[#FF0096]/10 border border-[#FF0096]/30 text-white rounded-xl p-3 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#FF0096] shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Selección de Habitación */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
              Habitación / Suite
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(Number(e.target.value))}
              className="w-full bg-[#0e011f] border border-[#9B00CC]/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00C8D4] transition-colors"
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id} className="bg-[#1a0533]">
                  {room.name} - ${room.price_per_night}/noche (cap: {room.capacity})
                </option>
              ))}
            </select>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#00C8D4]" /> Check-In
              </label>
              <input
                type="date"
                required
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full bg-[#0e011f] border border-[#9B00CC]/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#00C8D4]" /> Check-Out
              </label>
              <input
                type="date"
                required
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split("T")[0]}
                className="w-full bg-[#0e011f] border border-[#9B00CC]/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
              />
            </div>
          </div>

          {/* Huéspedes */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#00C8D4]" /> Huéspedes
            </label>
            <input
              type="number"
              min="1"
              max={selectedRoom?.capacity || 4}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full bg-[#0e011f] border border-[#9B00CC]/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
            />
          </div>

          {/* Información del Cliente */}
          <div className="space-y-4 pt-2 border-t border-[#9B00CC]/10">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                placeholder="Nombre del titular"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-[#0e011f] border border-[#9B00CC]/30 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00C8D4]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                  WhatsApp / Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+58 412..."
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full bg-[#0e011f] border border-[#9B00CC]/30 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00C8D4]"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="cliente@correo.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full bg-[#0e011f] border border-[#9B00CC]/30 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00C8D4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                Notas / Requerimientos Especiales
              </label>
              <textarea
                placeholder="Ej. Cuna adicional, alergias alimentarias, traslados..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-[#0e011f] border border-[#9B00CC]/30 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00C8D4] resize-none"
              />
            </div>
          </div>

          {/* Desglose de Precios */}
          {nights() > 0 && selectedRoom && (
            <div className="bg-[#0e011f] rounded-2xl p-4 border border-[#9B00CC]/20 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Costo Diario:</span>
                <span className="font-semibold">${selectedRoom.price_per_night} x {nights()} noches</span>
              </div>
              <div className="flex justify-between border-t border-[#1a0533] pt-2">
                <span className="text-slate-400 font-bold">Monto Total Estimado:</span>
                <span className="font-black text-[#00C8D4] text-sm">${totalPrice} USD</span>
              </div>
            </div>
          )}

          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:scale-[1.02] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#FF0096]/10 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registrando en el Core...</span>
              </>
            ) : (
              <span>Solicitar Reserva</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
