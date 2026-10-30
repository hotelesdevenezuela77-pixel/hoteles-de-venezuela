import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Loader2,
  Sparkles,
  User,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  CheckCircle2,
  Clock
} from "lucide-react";

interface CalendarDay {
  date: string;
  rooms: {
    room_id: number;
    room_name: string;
    available: number;
    total: number;
    price: number;
    is_available: boolean;
  }[];
  has_availability: boolean;
  season?: string;
  price_multiplier?: number;
  creatorStatus?: "disponible" | "pendiente" | "reservado";
  creatorEventTitle?: string;
}

export interface InfluencerPublicBooking {
  id: string;
  establishment_id: number;
  influencer_name: string;
  service_id: string;
  service_name: string;
  start_date: string;
  end_date: string;
  days_count: number;
  client_name: string;
  client_brand?: string;
  client_phone: string;
  client_email?: string;
  destination_location?: string;
  notes?: string;
  status: "pendiente" | "confirmada" | "rechazada";
  confirmation_code: string;
  created_at: string;
}

export const INFLUENCER_PUBLIC_SERVICES = [
  {
    id: "cobertura-4k-reels",
    name: "Cobertura Audiovisual 4K & Reels",
    badge: "Redes & Drone",
    description: "Producción en locación con cámara 4K, tomas aéreas con Drone y publicación de Reels colaborativos."
  },
  {
    id: "visita-resena-hdv",
    name: "Visita Oficial & Reseña Verificada",
    badge: "Hoteles & Posadas",
    description: "Relevamiento de experiencia turística, fotografía editorial y reseña destacada para posadas, hoteles y restaurantes."
  },
  {
    id: "expedicion-ruta",
    name: "Expedición Fotográfica & Ruta",
    badge: "Aventura & Destinos",
    description: "Acompañamiento audiovisual en rutas 4x4, paseos náuticos, parques nacionales o circuitos turísticos."
  },
  {
    id: "campana-embajadora",
    name: "Campaña Publicitaria / Embajadora",
    badge: "Alianza Comercial",
    description: "Representación de marca, menciones en historias y creación de contenido UGC para campañas comerciales."
  }
];

interface AvailabilityCalendarProps {
  establishmentId: number;
  establishmentName?: string;
  isCreatorCategory?: boolean;
  whatsapp?: string;
  preselectedServiceId?: string;
}

export function getInfluencerStorageKeys(establishmentId: number): string[] {
  const keys = [`hdv_influencer_bookings_${establishmentId}`];
  // Si es el perfil demo de Aura Croce (99901 o 1), sincronizar ambas claves para que el panel y la vista pública compartan reservas
  if (Number(establishmentId) === 99901 || Number(establishmentId) === 1) {
    if (!keys.includes("hdv_influencer_bookings_99901")) keys.push("hdv_influencer_bookings_99901");
    if (!keys.includes("hdv_influencer_bookings_1")) keys.push("hdv_influencer_bookings_1");
  }
  return keys;
}

export function getCreatorAgendaStorageKeys(establishmentId: number): string[] {
  const keys = [`hdv_creator_agenda_${establishmentId}`];
  if (Number(establishmentId) === 99901 || Number(establishmentId) === 1) {
    if (!keys.includes("hdv_creator_agenda_99901")) keys.push("hdv_creator_agenda_99901");
    if (!keys.includes("hdv_creator_agenda_1")) keys.push("hdv_creator_agenda_1");
  }
  return keys;
}

export function AvailabilityCalendar({
  establishmentId,
  establishmentName = "Creador Oficial",
  isCreatorCategory = false,
  whatsapp,
  preselectedServiceId
}: AvailabilityCalendarProps) {
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [rooms, setRooms] = useState<{ id: number; name: string }[]>([]);

  // Estados exclusivos para reserva interactiva de Influencer / Creador (independiente por establishmentId)
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    preselectedServiceId || INFLUENCER_PUBLIC_SERVICES[0].id
  );
  const [selectedStartDate, setSelectedStartDate] = useState<string>("");
  const [selectedEndDate, setSelectedEndDate] = useState<string>("");
  const [clientName, setClientName] = useState<string>("");
  const [clientBrand, setClientBrand] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [destinationLocation, setDestinationLocation] = useState<string>("");
  const [bookingNotes, setBookingNotes] = useState<string>("");
  const [submittingBooking, setSubmittingBooking] = useState<boolean>(false);
  const [createdBooking, setCreatedBooking] = useState<InfluencerPublicBooking | null>(null);

  useEffect(() => {
    if (preselectedServiceId) {
      setSelectedServiceId(preselectedServiceId);
    }
  }, [preselectedServiceId]);

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      setError(null);

      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const startDateStr = startOfMonth.toISOString().split("T")[0];
      const endDateStr = endOfMonth.toISOString().split("T")[0];

      // MODO INFLUENCER / CREADOR DE CONTENIDO (Independiente por establishmentId)
      if (isCreatorCategory) {
        const storageKeys = getInfluencerStorageKeys(establishmentId);
        let allInfluencerBookings: InfluencerPublicBooking[] = [];
        storageKeys.forEach((k) => {
          try {
            const raw = localStorage.getItem(k);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                parsed.forEach((item) => {
                  if (!allInfluencerBookings.some((b) => b.id === item.id)) {
                    allInfluencerBookings.push(item);
                  }
                });
              }
            }
          } catch (e) {}
        });

        // También consultar eventos de la agenda del creador (bloqueos/rodajes confirmados)
        const agendaKeys = getCreatorAgendaStorageKeys(establishmentId);
        let agendaEvents: any[] = [];
        agendaKeys.forEach((k) => {
          try {
            const raw = localStorage.getItem(k);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                agendaEvents = [...agendaEvents, ...parsed];
              }
            }
          } catch (e) {}
        });

        const tempCalendar: CalendarDay[] = [];
        const currentDate = new Date(startOfMonth);
        const end = new Date(endOfMonth);

        while (currentDate <= end) {
          const dateStr = currentDate.toISOString().split("T")[0];

          // Verificar si hay una reserva confirmada o pendiente en este día para este influencer
          const confirmedBooking = allInfluencerBookings.find(
            (b) => b.status === "confirmada" && dateStr >= b.start_date && dateStr <= b.end_date
          );
          const pendingBooking = allInfluencerBookings.find(
            (b) => b.status === "pendiente" && dateStr >= b.start_date && dateStr <= b.end_date
          );
          const busyAgenda = agendaEvents.find((ev) => {
            const evStart = (ev.start_date || "").split("T")[0];
            const evEnd = (ev.end_date || evStart).split("T")[0];
            return evStart && dateStr >= evStart && dateStr <= evEnd && ev.status === "en_progreso";
          });

          let creatorStatus: "disponible" | "pendiente" | "reservado" = "disponible";
          let creatorEventTitle: string | undefined = undefined;

          if (confirmedBooking || busyAgenda) {
            creatorStatus = "reservado";
            creatorEventTitle = confirmedBooking ? "Reservado" : "En Cobertura";
          } else if (pendingBooking) {
            creatorStatus = "pendiente";
            creatorEventTitle = "Solicitado";
          }

          tempCalendar.push({
            date: dateStr,
            rooms: [],
            has_availability: creatorStatus !== "reservado",
            creatorStatus,
            creatorEventTitle
          });

          currentDate.setDate(currentDate.getDate() + 1);
        }

        setCalendar(tempCalendar);
        setLoading(false);
        return;
      }

      // MODO HOTEL / POSADA TRADICIONAL
      const { data: dbRooms, error: roomsErr } = await supabase
        .from("rooms")
        .select("*")
        .eq("establishment_id", establishmentId)
        .eq("is_active", true);

      if (roomsErr) throw roomsErr;

      let finalRooms = dbRooms || [];

      const mappedRooms = finalRooms.map((r) => ({
        id: r.id,
        name: r.name,
        quantity: r.quantity,
        price: r.price_per_night
      }));
      setRooms(mappedRooms);
      if (!selectedRoom && mappedRooms.length > 0) {
        setSelectedRoom(mappedRooms[0].id);
      }

      const { data: dbReservations, error: resErr } = await supabase
        .from("reservations")
        .select("*")
        .eq("establishment_id", establishmentId)
        .in("status", ["pending", "confirmed", "checked_in"])
        .lte("check_in_date", endDateStr)
        .gte("check_out_date", startDateStr);

      if (resErr) throw resErr;

      const localResKey = "hdv_mock_reservations";
      const localReservations = JSON.parse(localStorage.getItem(localResKey) || "[]").filter(
        (r: any) =>
          r.establishment_id === establishmentId &&
          ["pending", "confirmed", "checked_in"].includes(r.status) &&
          r.check_in_date <= endDateStr &&
          r.check_out_date >= startDateStr
      );

      const combinedReservations = [...(dbReservations || []), ...localReservations];

      const { data: dbSeasons, error: seasonsErr } = await supabase
        .from("seasonal_pricing")
        .select("*")
        .eq("establishment_id", establishmentId)
        .eq("is_active", true);

      if (seasonsErr) throw seasonsErr;

      const tempCalendar: CalendarDay[] = [];
      const currentDate = new Date(startOfMonth);
      const end = new Date(endOfMonth);

      while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split("T")[0];

        const activeSeason = (dbSeasons || []).find((s) => {
          return dateStr >= s.start_date && dateStr <= s.end_date;
        });

        const multiplier = activeSeason ? activeSeason.price_multiplier : 1.0;
        const seasonName = activeSeason ? activeSeason.season_name : undefined;

        const roomsData = finalRooms.map((room) => {
          const bookedCount = (combinedReservations || []).filter((r) => {
            return r.room_id === room.id && dateStr >= r.check_in_date && dateStr < r.check_out_date;
          }).length;

          const available = Math.max(0, room.quantity - bookedCount);
          const price = Math.round(room.price_per_night * multiplier * 100) / 100;

          return {
            room_id: room.id,
            room_name: room.name,
            available,
            total: room.quantity,
            price,
            is_available: available > 0
          };
        });

        tempCalendar.push({
          date: dateStr,
          rooms: roomsData,
          has_availability: roomsData.length > 0 ? roomsData.some((r) => r.is_available) : true,
          season: seasonName,
          price_multiplier: multiplier
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      setCalendar(tempCalendar);
    } catch (e) {
      console.error("Error building calendar:", e);
      setError("Error al cargar el calendario de disponibilidad.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (establishmentId) {
      fetchCalendar();
    }
  }, [establishmentId, currentMonth, isCreatorCategory]);

  // Escuchar actualizaciones en tiempo real si el influencer aprueba/rechaza desde su panel
  useEffect(() => {
    const handleUpdate = () => fetchCalendar();
    window.addEventListener("hdv_influencer_booking_updated", handleUpdate);
    return () => window.removeEventListener("hdv_influencer_booking_updated", handleUpdate);
  }, [establishmentId, currentMonth, isCreatorCategory]);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getCalendarGrid = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid: (CalendarDay | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      grid.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayData = calendar.find((d) => d.date === dateStr);
      grid.push(
        dayData || {
          date: dateStr,
          rooms: [],
          has_availability: true,
          creatorStatus: "disponible"
        }
      );
    }

    return grid;
  };

  const getRoomAvailability = (day: CalendarDay | null) => {
    if (!day || !selectedRoom) return null;
    return day.rooms.find((r) => r.room_id === selectedRoom);
  };

  const today = new Date().toISOString().split("T")[0];

  // Manejador de clic en un día del calendario para Influencer
  const handleCreatorDayClick = (day: CalendarDay) => {
    if (!isCreatorCategory) return;
    if (day.date < today) return;
    if (day.creatorStatus === "reservado") return;

    if (!selectedStartDate || (selectedStartDate && selectedEndDate && selectedStartDate !== selectedEndDate)) {
      setSelectedStartDate(day.date);
      setSelectedEndDate(day.date);
    } else if (day.date < selectedStartDate) {
      setSelectedStartDate(day.date);
    } else {
      setSelectedEndDate(day.date);
    }
    setCreatedBooking(null);
  };

  const calculateCreatorDaysCount = () => {
    if (!selectedStartDate) return 0;
    const endStr = selectedEndDate || selectedStartDate;
    const s = new Date(selectedStartDate + "T00:00:00");
    const e = new Date(endStr + "T00:00:00");
    const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const handleSubmitCreatorBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStartDate) {
      alert("Por favor selecciona al menos un día disponible en el calendario.");
      return;
    }
    if (!clientName.trim() || !clientPhone.trim()) {
      alert("Por favor ingresa tu nombre y número de WhatsApp / teléfono.");
      return;
    }

    setSubmittingBooking(true);
    try {
      const serviceObj =
        INFLUENCER_PUBLIC_SERVICES.find((s) => s.id === selectedServiceId) || INFLUENCER_PUBLIC_SERVICES[0];
      const finalEnd = selectedEndDate || selectedStartDate;
      const daysCount = calculateCreatorDaysCount();
      const code = `HDV-INF-${Math.floor(100000 + Math.random() * 900000)}`;

      const newBooking: InfluencerPublicBooking = {
        id: `inf-bk-${Date.now()}`,
        establishment_id: establishmentId,
        influencer_name: establishmentName,
        service_id: serviceObj.id,
        service_name: serviceObj.name,
        start_date: selectedStartDate,
        end_date: finalEnd,
        days_count: daysCount,
        client_name: clientName.trim(),
        client_brand: clientBrand.trim() || undefined,
        client_phone: clientPhone.trim(),
        client_email: clientEmail.trim() || undefined,
        destination_location: destinationLocation.trim() || undefined,
        notes: bookingNotes.trim() || undefined,
        status: "pendiente",
        confirmation_code: code,
        created_at: new Date().toISOString()
      };

      // 1. Guardar en las claves independientes de este influencer en localStorage
      const storageKeys = getInfluencerStorageKeys(establishmentId);
      storageKeys.forEach((key) => {
        try {
          const existing = JSON.parse(localStorage.getItem(key) || "[]");
          localStorage.setItem(key, JSON.stringify([newBooking, ...existing]));
        } catch (err) {}
      });

      // 2. Guardar también en hdv_mock_reservations para trazabilidad global por establishment_id
      try {
        const globalResKey = "hdv_mock_reservations";
        const existingGlobal = JSON.parse(localStorage.getItem(globalResKey) || "[]");
        existingGlobal.unshift({
          id: Math.floor(100000 + Math.random() * 900000),
          establishment_id: establishmentId,
          establishment_name: establishmentName,
          guest_name: clientBrand.trim() ? `${clientName.trim()} (${clientBrand.trim()})` : clientName.trim(),
          guest_email: clientEmail.trim() || null,
          guest_phone: clientPhone.trim(),
          check_in_date: selectedStartDate,
          check_out_date: finalEnd,
          guests_count: daysCount,
          room_type: serviceObj.name,
          total_price: 0,
          notes: `Servicio: ${serviceObj.name}. Ubicación: ${destinationLocation || "Por definir"}. ${bookingNotes || ""}`,
          status: "pending",
          source: "influencer_public_webapp",
          confirmation_code: code,
          created_at: new Date().toISOString()
        });
        localStorage.setItem(globalResKey, JSON.stringify(existingGlobal));
      } catch (err) {}

      // 3. Intentar registro en Supabase
      try {
        await supabase.from("reservations").insert([
          {
            establishment_id: establishmentId,
            guest_name: clientBrand.trim() ? `${clientName.trim()} (${clientBrand.trim()})` : clientName.trim(),
            guest_email: clientEmail.trim() || null,
            guest_phone: clientPhone.trim(),
            check_in_date: selectedStartDate,
            check_out_date: finalEnd,
            guests_count: daysCount,
            room_type: serviceObj.name,
            total_price: 0,
            notes: bookingNotes.trim() || null,
            status: "pending",
            source: "influencer_webapp",
            confirmation_code: code
          }
        ]);
      } catch (err) {}

      window.dispatchEvent(new CustomEvent("hdv_influencer_booking_updated"));
      setCreatedBooking(newBooking);
      await fetchCalendar();
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-3xl border border-red-100 p-6 text-center shadow-sm">
        <CalendarIcon className="w-12 h-12 text-red-300 mx-auto mb-3" />
        <p className="text-red-500 text-xs font-bold leading-normal">{error}</p>
      </div>
    );
  }

  return (
    <div id="calendario-reservas-publico" className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm text-left">
      {/* Header */}
      <div className="bg-slate-50/70 p-5 sm:p-6 border-b border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF0096] flex items-center justify-center text-white shrink-0 shadow-xs">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif font-black text-slate-900 text-base sm:text-lg">
                {isCreatorCategory
                  ? "Calendario de Disponibilidad & Reserva de Servicios"
                  : "Calendario de Disponibilidad"}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isCreatorCategory
                  ? "Selecciona el servicio y haz clic en los días disponibles para agendar directamente con el creador"
                  : "Verifica tarifas y plazas libres en tiempo real"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              type="button"
              onClick={prevMonth}
              className="w-9 h-9 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-extrabold text-xs sm:text-sm text-slate-800 min-w-[130px] text-center">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-9 h-9 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selector de Servicios para Influencer */}
        {isCreatorCategory && (
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
              1. Elige el Servicio a Reservar:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {INFLUENCER_PUBLIC_SERVICES.map((srv) => {
                const isSel = selectedServiceId === srv.id;
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                      isSel
                        ? "bg-[#00C8D4]/10 border-[#00C8D4] ring-2 ring-[#00C8D4]/20"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block">{srv.name}</span>
                      <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 block">{srv.description}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${
                        isSel ? "bg-[#00C8D4] text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {srv.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selector de Habitaciones para Hoteles */}
        {!isCreatorCategory && rooms.length > 1 && (
          <div className="flex gap-1.5 flex-wrap">
            {rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => setSelectedRoom(room.id)}
                className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedRoom === room.id
                    ? "bg-[#FF0096] text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {room.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Calendar grid */}
      <div className="p-5 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF0096]" />
          </div>
        ) : (
          <>
            {isCreatorCategory && (
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  2. Haz clic en el día de inicio y fin en el calendario:
                </span>
                {selectedStartDate && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStartDate("");
                      setSelectedEndDate("");
                    }}
                    className="text-[11px] font-bold text-[#FF0096] hover:underline cursor-pointer"
                  >
                    Limpiar fechas seleccionadas
                  </button>
                )}
              </div>
            )}

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-[10px] font-black uppercase text-[#00C8D4] py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {getCalendarGrid().map((day, index) => {
                if (!day) {
                  return <div key={index} className="aspect-square" />;
                }

                const isPast = day.date < today;
                const isToday = day.date === today;

                // Renderizado interactivo para Influencer / Creador
                if (isCreatorCategory) {
                  const status = day.creatorStatus || "disponible";
                  const isSelected =
                    selectedStartDate &&
                    day.date >= selectedStartDate &&
                    day.date <= (selectedEndDate || selectedStartDate);

                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={isPast || status === "reservado"}
                      onClick={() => handleCreatorDayClick(day)}
                      className={`aspect-square p-1.5 sm:p-2 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                        isPast
                          ? "bg-slate-100/60 border-transparent opacity-40 cursor-not-allowed"
                          : isSelected
                          ? "bg-[#00C8D4] border-[#00C8D4] text-white shadow-md scale-[0.98]"
                          : status === "reservado"
                          ? "bg-rose-50 border-rose-200 text-rose-600 cursor-not-allowed"
                          : status === "pendiente"
                          ? "bg-amber-50 border-amber-200 hover:bg-amber-100/70 cursor-pointer"
                          : "bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/70 hover:border-[#00C8D4] cursor-pointer"
                      } ${isToday && !isSelected ? "ring-2 ring-[#FF0096]" : ""}`}
                    >
                      <span
                        className={`text-[11px] sm:text-xs font-black ${
                          isSelected
                            ? "text-white"
                            : isToday
                            ? "text-[#FF0096]"
                            : isPast
                            ? "text-slate-400"
                            : "text-slate-800"
                        }`}
                      >
                        {parseInt(day.date.split("-")[2])}
                      </span>

                      {!isPast && (
                        <div className="flex flex-col items-center justify-center flex-1">
                          {isSelected ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              <span className="text-[8px] sm:text-[9px] text-white font-black uppercase tracking-tight">
                                Elegido
                              </span>
                            </>
                          ) : status === "reservado" ? (
                            <>
                              <X className="w-3.5 h-3.5 text-rose-500" />
                              <span className="text-[8px] sm:text-[9px] text-rose-600 font-extrabold truncate max-w-full">
                                Reservado
                              </span>
                            </>
                          ) : status === "pendiente" ? (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span className="text-[8px] sm:text-[9px] text-amber-700 font-extrabold truncate max-w-full">
                                Solicitado
                              </span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-[8px] sm:text-[9px] text-emerald-700 font-extrabold truncate max-w-full">
                                Libre
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </button>
                  );
                }

                // Renderizado tradicional para Hoteles
                const roomData = getRoomAvailability(day);
                const hasAvailability = roomData ? roomData.is_available : day.has_availability;

                return (
                  <div
                    key={index}
                    className={`aspect-square p-1.5 rounded-2xl border transition-all ${
                      isPast
                        ? "bg-slate-100/50 border-transparent opacity-40 select-none"
                        : hasAvailability
                        ? "bg-emerald-50/70 border-emerald-200 hover:bg-emerald-50"
                        : "bg-red-50/70 border-red-200 hover:bg-red-50"
                    } ${isToday ? "ring-2 ring-[#FF0096] bg-white border-[#FF0096]" : ""}`}
                  >
                    <div className="h-full flex flex-col justify-between text-left">
                      <span
                        className={`text-[10px] font-black ${
                          isToday ? "text-[#FF0096]" : isPast ? "text-slate-400" : "text-[#00C8D4]"
                        }`}
                      >
                        {parseInt(day.date.split("-")[2])}
                      </span>
                      {!isPast && roomData && (
                        <div className="flex flex-col items-center justify-center flex-1">
                          {hasAvailability ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-[9px] text-emerald-600 font-extrabold">
                                {roomData.available} lib.
                              </span>
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5 text-red-400" />
                              <span className="text-[9px] text-red-500 font-extrabold">Agotado</span>
                            </>
                          )}
                          {roomData.price > 0 && roomData.price !== 100 && (
                            <span className="text-[9px] text-slate-700 font-black mt-0.5">${roomData.price}</span>
                          )}
                        </div>
                      )}
                      {day.season && !isPast && (
                        <span className="text-[8px] text-amber-600 truncate text-center block w-full font-bold uppercase tracking-wider scale-90">
                          {day.season}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-5 mt-6 pt-5 border-t border-slate-100 text-[10px] font-bold">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <div className="w-4 h-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-emerald-600" />
            </div>
            <span>Disponible</span>
          </div>
          {isCreatorCategory && (
            <>
              <div className="flex items-center gap-1.5 text-[#009fb0]">
                <div className="w-4 h-4 rounded-lg bg-[#00C8D4] flex items-center justify-center">
                  <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                </div>
                <span>Fechas Seleccionadas</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-700">
                <div className="w-4 h-4 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <Clock className="w-2.5 h-2.5 text-amber-500" />
                </div>
                <span>Solicitud Pendiente</span>
              </div>
            </>
          )}
          <div className="flex items-center gap-1.5 text-rose-600">
            <div className="w-4 h-4 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center">
              <X className="w-2.5 h-2.5 text-rose-500" />
            </div>
            <span>{isCreatorCategory ? "Reservado / En Rodaje" : "Agotado"}</span>
          </div>
        </div>

        {/* Formulario de Solicitud de Reserva de Servicios y Fechas para el Influencer */}
        {isCreatorCategory && (
          <div className="mt-6 pt-6 border-t border-slate-200/80">
            {createdBooking ? (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                    SOLICITUD REGISTRADA • CÓDIGO {createdBooking.confirmation_code}
                  </span>
                  <h4 className="text-lg font-serif font-bold text-slate-900">
                    ¡Fechas Solicitadas en la Agenda de {establishmentName}!
                  </h4>
                  <p className="text-xs text-slate-600 max-w-lg mx-auto">
                    Tu solicitud para <strong>{createdBooking.service_name}</strong> del{" "}
                    <strong>{createdBooking.start_date}</strong> al <strong>{createdBooking.end_date}</strong> (
                    {createdBooking.days_count} {createdBooking.days_count === 1 ? "día" : "días"}) ya fue enviada al
                    panel de {establishmentName} para su confirmación.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {whatsapp && (
                    <button
                      type="button"
                      onClick={() => {
                        const cleanPhone = whatsapp.replace(/\D/g, "");
                        const msg = encodeURIComponent(
                          `¡Hola ${establishmentName}! Acabo de agendar en tu calendario público de Hoteles de Venezuela (Código: ${createdBooking.confirmation_code}):\n• Servicio: ${createdBooking.service_name}\n• Fechas: ${createdBooking.start_date} al ${createdBooking.end_date} (${createdBooking.days_count} días)\n• Cliente/Marca: ${createdBooking.client_name} ${createdBooking.client_brand ? `(${createdBooking.client_brand})` : ""}\n• Destino: ${createdBooking.destination_location || "Por coordinar"}`
                        );
                        window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank", "noopener,noreferrer");
                      }}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <MessageCircle className="w-4 h-4 text-white" />
                      <span>Confirmar Ahora por WhatsApp Directo</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setCreatedBooking(null);
                      setSelectedStartDate("");
                      setSelectedEndDate("");
                    }}
                    className="px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all"
                  >
                    Agendar Otra Fecha
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitCreatorBooking} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF0096]" />
                    <h4 className="text-sm font-serif font-bold text-slate-900">
                      3. Completa tu Reserva de Servicio con {establishmentName}
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-[#00C8D4]">
                    {selectedStartDate
                      ? `Del ${selectedStartDate} al ${selectedEndDate || selectedStartDate} (${calculateCreatorDaysCount()} día${calculateCreatorDaysCount() > 1 ? "s" : ""})`
                      : "Haz clic arriba en un día disponible del calendario"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Fecha Inicio *
                    </label>
                    <input
                      type="date"
                      required
                      min={today}
                      value={selectedStartDate}
                      onChange={(e) => {
                        setSelectedStartDate(e.target.value);
                        if (!selectedEndDate || e.target.value > selectedEndDate) {
                          setSelectedEndDate(e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00C8D4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Fecha Fin *
                    </label>
                    <input
                      type="date"
                      required
                      min={selectedStartDate || today}
                      value={selectedEndDate || selectedStartDate}
                      onChange={(e) => setSelectedEndDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00C8D4]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Tu Nombre Completo *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="Ej: Carlos Méndez"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C8D4]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Hotel, Posada o Marca (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Posada Perla Negra / Agencia"
                      value={clientBrand}
                      onChange={(e) => setClientBrand(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C8D4]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      WhatsApp / Teléfono *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      <input
                        type="tel"
                        required
                        placeholder="+58 414 1234567"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C8D4]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      <input
                        type="email"
                        placeholder="contacto@marca.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C8D4]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Destino / Locación
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Ej: Morrocoy, Canaima..."
                        value={destinationLocation}
                        onChange={(e) => setDestinationLocation(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C8D4]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                    Detalles de la Cobertura, Pauta o Expedición
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Cuéntanos sobre tu proyecto, objetivos de grabación o fechas de campaña..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#00C8D4] resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Al enviar, el influencer recibirá tu reserva en su panel para aprobar y bloquear las fechas.
                  </span>
                  <button
                    type="submit"
                    disabled={submittingBooking}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-white text-xs font-black uppercase tracking-wider shadow-lg cursor-pointer transition-all hover:scale-[1.02] flex items-center justify-center gap-2 shrink-0"
                    style={{ background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)" }}
                  >
                    {submittingBooking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Procesando Reserva...</span>
                      </>
                    ) : (
                      <>
                        <CalendarIcon className="w-4 h-4 text-white" />
                        <span>Reservar Fechas y Servicio</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
