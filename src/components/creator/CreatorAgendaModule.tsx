import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  getInfluencerStorageKeys,
  getCreatorAgendaStorageKeys,
  type InfluencerPublicBooking
} from "@/components/AvailabilityCalendar";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Loader2, 
  Check, 
  Trash2, 
  Sparkles, 
  Globe, 
  RefreshCw, 
  AlertTriangle,
  MapPin,
  PhoneCall,
  CalendarCheck2,
  CalendarDays,
  CalendarRange,
  Video,
  Film,
  Camera,
  Compass,
  Award,
  Edit3,
  Share2,
  CheckCircle2,
  Building2,
  DollarSign
} from "lucide-react";

export interface CreatorAgendaEvent {
  id: string;
  establishment_id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  event_type: "rodaje" | "drone_luz" | "auditoria_posada" | "reunion_marca" | "expedicion_ruta" | "edicion_post" | "publicacion_redes" | "permisos_inparques";
  status: "pendiente" | "en_progreso" | "completado";
  color: string;
  location_target?: string;
  brand_sponsor?: string;
}

const EVENT_TYPES = [
  { value: "rodaje", label: "🎬 Rodaje & Grabación 4K", color: "#FF0096", icon: Video },
  { value: "drone_luz", label: "🛸 Vuelo de Drone / Hora Dorada", color: "#00C8D4", icon: Camera },
  { value: "auditoria_posada", label: "🏨 Auditoría Técnica de Posada/Hotel", color: "#9B00CC", icon: Building2 },
  { value: "reunion_marca", label: "🤝 Reunión Comercial / Pauta Marca", color: "#10b981", icon: Award },
  { value: "expedicion_ruta", label: "🚙 Expedición 4x4 / Traslado en Ruta", color: "#eab308", icon: Compass },
  { value: "edicion_post", label: "✂️ Edición & Post-Producción", color: "#6366f1", icon: Film },
  { value: "publicacion_redes", label: "🚀 Lanzamiento / Publicación HDV", color: "#ec4899", icon: Share2 },
  { value: "permisos_inparques", label: "⚠️ Trámites & Permisos INPARQUES", color: "#ef4444", icon: AlertTriangle }
];

interface CreatorAgendaModuleProps {
  establishmentId: number;
  creatorName: string;
}

export function CreatorAgendaModule({ establishmentId, creatorName }: CreatorAgendaModuleProps) {
  const [events, setEvents] = useState<CreatorAgendaEvent[]>([]);
  const [publicBookings, setPublicBookings] = useState<InfluencerPublicBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Sincronización Google Calendar
  const [googleConnected, setGoogleConnected] = useState<boolean>(() => {
    return localStorage.getItem(`hdv_google_cal_creator_${establishmentId}`) === "true";
  });

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<CreatorAgendaEvent | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formType, setFormType] = useState<CreatorAgendaEvent["event_type"]>("rodaje");
  const [formStatus, setFormStatus] = useState<CreatorAgendaEvent["status"]>("pendiente");
  const [formColor, setFormColor] = useState("#FF0096");
  const [formLocation, setFormLocation] = useState("");
  const [formSponsor, setFormSponsor] = useState("");

  // Drag and Drop State
  const [draggedEvent, setDraggedEvent] = useState<CreatorAgendaEvent | null>(null);

  const localKey = `hdv_creator_agenda_${establishmentId}`;

  const fetchPublicBookings = () => {
    const keys = getInfluencerStorageKeys(establishmentId);
    let combined: InfluencerPublicBooking[] = [];
    keys.forEach((k) => {
      try {
        const raw = localStorage.getItem(k);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((b) => {
              if (!combined.some((item) => item.id === b.id)) {
                combined.push(b);
              }
            });
          }
        }
      } catch (e) {}
    });
    setPublicBookings(combined);
  };

  useEffect(() => {
    fetchEvents();
    fetchPublicBookings();
    const onBookingUpdate = () => fetchPublicBookings();
    window.addEventListener("hdv_influencer_booking_updated", onBookingUpdate);
    return () => window.removeEventListener("hdv_influencer_booking_updated", onBookingUpdate);
  }, [establishmentId]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const raw = localStorage.getItem(localKey);
      let localEvents: CreatorAgendaEvent[] = [];
      if (raw) {
        try {
          localEvents = JSON.parse(raw);
        } catch (e) {}
      }

      if (localEvents.length === 0) {
        const todayStr = new Date().toISOString().split("T")[0];
        const tomorrowStr = new Date(Date.now() + 24 * 3600000).toISOString().split("T")[0];
        const nextWeekStr = new Date(Date.now() + 5 * 24 * 3600000).toISOString().split("T")[0];

        localEvents = [
          {
            id: "evt-cr-1",
            establishment_id: establishmentId,
            title: "🌅 Rodaje Golden Hour & Drone 4K en Cayo Sombrero",
            description: "Captura de tomas aéreas a 60fps con luz de amanecer y tomas subacuáticas con arrecife.",
            start_date: `${todayStr}T06:00`,
            end_date: `${todayStr}T09:30`,
            event_type: "drone_luz",
            status: "en_progreso",
            color: "#00C8D4",
            location_target: "Parque Nacional Morrocoy",
            brand_sponsor: "Posada Perla Negra"
          },
          {
            id: "evt-cr-2",
            establishment_id: establishmentId,
            title: "🏨 Auditoría de Wi-Fi, Planta Eléctrica & Convenio",
            description: "Prueba de velocidad de Starlink 120Mbps, inspección de insonorización y grabación de reseña.",
            start_date: `${todayStr}T11:00`,
            end_date: `${todayStr}T14:00`,
            event_type: "auditoria_posada",
            status: "pendiente",
            color: "#9B00CC",
            location_target: "Posada Gran Sabana Lodge",
            brand_sponsor: "Alianza HDV"
          },
          {
            id: "evt-cr-3",
            establishment_id: establishmentId,
            title: "🤝 Firma de Acuerdo Comercial de Pauta",
            description: "Presentación de tarifario y propuesta de cobertura en redes para paquete de 3 Reels + Reseña.",
            start_date: `${tomorrowStr}T16:00`,
            end_date: `${tomorrowStr}T17:30`,
            event_type: "reunion_marca",
            status: "pendiente",
            color: "#10b981",
            location_target: "Caracas / Zoom",
            brand_sponsor: "Marca Outdoor 4x4"
          },
          {
            id: "evt-cr-4",
            establishment_id: establishmentId,
            title: "✂️ Edición de Reel 4K '5 Secretos de Morrocoy'",
            description: "Corrección de color LUT cinematográfico, sincronización de audio y exportación en formato 9:16.",
            start_date: `${nextWeekStr}T09:00`,
            end_date: `${nextWeekStr}T13:00`,
            event_type: "edicion_post",
            status: "pendiente",
            color: "#6366f1",
            location_target: "Estudio de Producción",
            brand_sponsor: "Hoteles de Venezuela"
          }
        ];
        localStorage.setItem(localKey, JSON.stringify(localEvents));
      }

      setEvents(localEvents);
    } catch (err) {
      console.warn("Error cargando agenda de creadora:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveEventsLocally = (newEvents: CreatorAgendaEvent[]) => {
    setEvents(newEvents);
    const agendaKeys = getCreatorAgendaStorageKeys(establishmentId);
    agendaKeys.forEach((k) => {
      localStorage.setItem(k, JSON.stringify(newEvents));
    });
    window.dispatchEvent(new CustomEvent("hdv_influencer_booking_updated"));
  };

  // Aprobar o Rechazar una Reserva Pública desde el Panel del Influencer
  const handleUpdatePublicBookingStatus = (
    booking: InfluencerPublicBooking,
    newStatus: "confirmada" | "rechazada"
  ) => {
    const updatedList = publicBookings.map((b) =>
      b.id === booking.id ? { ...b, status: newStatus } : b
    );
    setPublicBookings(updatedList);

    const keys = getInfluencerStorageKeys(establishmentId);
    keys.forEach((k) => {
      localStorage.setItem(k, JSON.stringify(updatedList));
    });

    // Si el influencer aprueba la reserva, agregarla automáticamente a su calendario de rodajes/agenda
    if (newStatus === "confirmada") {
      const alreadyInAgenda = events.some((ev) => ev.id === `pub-${booking.id}`);
      if (!alreadyInAgenda) {
        const newAgendaEvt: CreatorAgendaEvent = {
          id: `pub-${booking.id}`,
          establishment_id: establishmentId,
          title: `🎬 Reserva Web: ${booking.service_name} (${booking.client_brand || booking.client_name})`,
          description: `Cliente: ${booking.client_name} (${booking.client_phone}). Código: ${booking.confirmation_code}. ${booking.notes || ""}`,
          start_date: `${booking.start_date}T09:00`,
          end_date: `${booking.end_date}T18:00`,
          event_type: "rodaje",
          status: "en_progreso",
          color: "#FF0096",
          location_target: booking.destination_location || "Locación Confirmada",
          brand_sponsor: booking.client_brand || booking.client_name
        };
        saveEventsLocally([newAgendaEvt, ...events]);
      }
    }

    window.dispatchEvent(new CustomEvent("hdv_influencer_booking_updated"));
  };

  const handleOpenModal = (eventToEdit?: CreatorAgendaEvent, defaultDateStr?: string) => {
    if (eventToEdit) {
      setSelectedEvent(eventToEdit);
      setFormTitle(eventToEdit.title);
      setFormDescription(eventToEdit.description || "");
      setFormStart(eventToEdit.start_date || "");
      setFormEnd(eventToEdit.end_date || "");
      setFormType(eventToEdit.event_type || "rodaje");
      setFormStatus(eventToEdit.status || "pendiente");
      setFormColor(eventToEdit.color || "#FF0096");
      setFormLocation(eventToEdit.location_target || "");
      setFormSponsor(eventToEdit.brand_sponsor || "");
    } else {
      setSelectedEvent(null);
      setFormTitle("");
      setFormDescription("");
      const now = defaultDateStr ? `${defaultDateStr}T09:00` : new Date().toISOString().slice(0, 16);
      const oneHourLater = defaultDateStr ? `${defaultDateStr}T11:00` : new Date(Date.now() + 7200000).toISOString().slice(0, 16);
      setFormStart(now);
      setFormEnd(oneHourLater);
      setFormType("rodaje");
      setFormStatus("pendiente");
      setFormColor("#FF0096");
      setFormLocation("");
      setFormSponsor("");
    }
    setModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (selectedEvent) {
      const updated = events.map(ev => {
        if (ev.id === selectedEvent.id) {
          return {
            ...ev,
            title: formTitle.trim(),
            description: formDescription.trim(),
            start_date: formStart,
            end_date: formEnd,
            event_type: formType,
            status: formStatus,
            color: formColor,
            location_target: formLocation.trim(),
            brand_sponsor: formSponsor.trim()
          };
        }
        return ev;
      });
      saveEventsLocally(updated);
    } else {
      const newEvent: CreatorAgendaEvent = {
        id: `evt-${Date.now()}`,
        establishment_id: establishmentId,
        title: formTitle.trim(),
        description: formDescription.trim(),
        start_date: formStart,
        end_date: formEnd,
        event_type: formType,
        status: formStatus,
        color: formColor,
        location_target: formLocation.trim(),
        brand_sponsor: formSponsor.trim()
      };
      saveEventsLocally([...events, newEvent]);
    }

    setModalOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    if (!confirm("¿Deseas eliminar este evento de producción de tu agenda?")) return;
    const filtered = events.filter(e => e.id !== id);
    saveEventsLocally(filtered);
    setModalOpen(false);
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, eventItem: CreatorAgendaEvent) => {
    setDraggedEvent(eventItem);
    e.dataTransfer.setData("text/plain", eventItem.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropOnDate = (dateStr: string) => {
    if (!draggedEvent) return;
    const timePartStart = draggedEvent.start_date.split("T")[1] || "09:00";
    const timePartEnd = draggedEvent.end_date.split("T")[1] || "11:00";

    const updated = events.map(ev => {
      if (ev.id === draggedEvent.id) {
        return {
          ...ev,
          start_date: `${dateStr}T${timePartStart}`,
          end_date: `${dateStr}T${timePartEnd}`
        };
      }
      return ev;
    });

    saveEventsLocally(updated);
    setDraggedEvent(null);
  };

  // Navegación de Fechas
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Cálculo de días del mes
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const dayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Generar cuadrícula de días
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* ── HEADER BANNER: AGENDA DE PRODUCCIÓN DE CREADORA ── */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1a0533] via-[#0e011f] to-[#1a0533] border border-[#00C8D4]/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15 bg-[#00C8D4]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15 bg-[#FF0096]" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-[#00C8D4]/20 text-[#00C8D4] border border-[#00C8D4]/40">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>AGENDA DE PRODUCCIÓN & RESERVAS PÚBLICAS ({creatorName.toUpperCase()})</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-wide">
              Calendario de Rodajes, Drones & Reservas de tu Web App
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Gestiona tus rodajes y aprueba con un clic las solicitudes de reserva que hoteles, marcas y viajeros realizan directamente desde el calendario público de tu Web App.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => {
                const nextState = !googleConnected;
                setGoogleConnected(nextState);
                localStorage.setItem(`hdv_google_cal_creator_${establishmentId}`, String(nextState));
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                googleConnected
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                  : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
              }`}
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>{googleConnected ? "Google Calendar Conectado" : "Conectar Google Calendar"}</span>
            </button>

            <button
              onClick={() => handleOpenModal()}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF0096] to-[#00C8D4] hover:opacity-90 text-white font-black text-xs shadow-lg shadow-[#FF0096]/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Evento / Bloquear Fecha</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── BANDEJA DE SOLICITUDES DE RESERVA DESDE LA WEB APP PÚBLICA DEL INFLUENCER ── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#1a0533]/90 border border-[#FF0096]/30 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF0096] flex items-center justify-center text-white shrink-0">
              <CalendarCheck2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                Reservas de Servicios Recibidas desde tu Web App Pública
              </h3>
              <p className="text-xs text-slate-300">
                Acepta las solicitudes para confirmar y bloquear automáticamente esos días en tu calendario público
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[#00C8D4]/20 text-[#00C8D4] border border-[#00C8D4]/40">
            {publicBookings.filter((b) => b.status === "pendiente").length} Pendientes de Confirmar
          </span>
        </div>

        {publicBookings.length === 0 ? (
          <div className="p-6 rounded-2xl bg-black/30 border border-white/10 text-center space-y-1">
            <p className="text-xs font-bold text-slate-300">
              Aún no tienes solicitudes de reserva pendientes desde tu calendario público.
            </p>
            <p className="text-[11px] text-slate-400">
              Cuando un hotel, marca o seguidor seleccione fechas y un servicio en tu perfil público, aparecerán aquí para que las aceptes o rechaces.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicBookings.map((bk) => (
              <div
                key={bk.id}
                className="p-4 rounded-2xl bg-black/40 border border-white/15 flex flex-col justify-between gap-3"
              >
                <div className="space-y-2 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-white/10 text-[#00C8D4]">
                      {bk.confirmation_code}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        bk.status === "confirmada"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : bk.status === "rechazada"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {bk.status === "confirmada"
                        ? "Confirmada en Calendario"
                        : bk.status === "rechazada"
                        ? "Rechazada"
                        : "Pendiente de Aprobación"}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white">{bk.service_name}</h4>
                  <p className="text-xs text-slate-300">
                    <strong>Cliente / Marca:</strong> {bk.client_name}{" "}
                    {bk.client_brand ? `(${bk.client_brand})` : ""}
                  </p>
                  <p className="text-xs text-[#00C8D4] font-bold">
                    Fechas: {bk.start_date} al {bk.end_date} ({bk.days_count}{" "}
                    {bk.days_count === 1 ? "día" : "días"})
                  </p>
                  {bk.destination_location && (
                    <p className="text-[11px] text-slate-300">
                      <strong>Destino:</strong> {bk.destination_location}
                    </p>
                  )}
                  {bk.notes && <p className="text-[11px] text-slate-400 italic">"{bk.notes}"</p>}
                </div>

                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <a
                    href={`https://wa.me/${bk.client_phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Hola ${bk.client_name}! Soy ${creatorName}, recibí tu solicitud de reserva (${bk.confirmation_code}) para "${bk.service_name}" del ${bk.start_date} al ${bk.end_date}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>WhatsApp: {bk.client_phone}</span>
                  </a>

                  <div className="flex items-center gap-2">
                    {bk.status !== "confirmada" && (
                      <button
                        type="button"
                        onClick={() => handleUpdatePublicBookingStatus(bk, "confirmada")}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aceptar Reserva</span>
                      </button>
                    )}
                    {bk.status !== "rechazada" && (
                      <button
                        type="button"
                        onClick={() => handleUpdatePublicBookingStatus(bk, "rechazada")}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        Rechazar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── BARRA DE TIPOS DE EVENTO (RATE CARD DE PRODUCCIÓN) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        {EVENT_TYPES.map((type, idx) => {
          const Icon = type.icon;
          const count = events.filter(e => e.event_type === type.value).length;
          return (
            <div key={idx} className="p-2 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded-md flex items-center justify-center text-white" style={{ background: type.color }}>
                  <Icon className="w-3 h-3" />
                </div>
                <span className="font-mono text-xs font-black text-white">{count}</span>
              </div>
              <span className="text-[10px] text-slate-300 font-bold leading-tight line-clamp-2">{type.label}</span>
            </div>
          );
        })}
      </div>

      {/* ── CONTROLES DEL CALENDARIO (MES / FECHAS) ── */}
      <div className="p-5 rounded-3xl bg-[#1a0533]/80 border border-white/10 shadow-2xl backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold font-serif text-white">
              {monthNames[month]} {year}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#00C8D4]/20 text-[#00C8D4] border border-[#00C8D4]/40">
              Drag & Drop Activo
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
            >
              Hoy
            </button>
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* ── CUADRÍCULA DEL CALENDARIO (MES) ── */}
        <div className="grid grid-cols-7 gap-2">
          
          {dayLabels.map((lbl, idx) => (
            <div key={idx} className="p-2 text-center text-xs font-black uppercase tracking-wider text-slate-400 bg-black/40 rounded-xl">
              {lbl}
            </div>
          ))}

          {calendarDays.map((dayNum, idx) => {
            if (dayNum === null) {
              return <div key={`empty-${idx}`} className="min-h-[100px] rounded-2xl bg-white/[0.02] border border-transparent" />;
            }

            const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
            const dayEvents = events.filter(e => e.start_date.startsWith(dayStr));
            const isToday = new Date().toISOString().startsWith(dayStr);

            return (
              <div
                key={`day-${dayNum}`}
                onDragOver={handleDragOver}
                onDrop={() => handleDropOnDate(dayStr)}
                onClick={() => handleOpenModal(undefined, dayStr)}
                className={`min-h-[110px] p-2 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer group ${
                  isToday
                    ? "bg-[#FF0096]/10 border-[#FF0096]/50 ring-1 ring-[#FF0096]/30 shadow-lg"
                    : "bg-black/40 border-white/10 hover:border-[#00C8D4]/40 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black font-mono w-6 h-6 rounded-lg flex items-center justify-center ${
                    isToday ? "bg-[#FF0096] text-white" : "text-slate-300 group-hover:text-white"
                  }`}>
                    {dayNum}
                  </span>

                  <Plus className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity text-[#00C8D4]" />
                </div>

                <div className="space-y-1.5 mt-1.5 flex-1">
                  {dayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        handleDragStart(e, evt);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(evt);
                      }}
                      className="p-1.5 rounded-lg text-left text-[11px] font-bold text-white shadow transition-transform hover:scale-102 cursor-grab active:cursor-grabbing border border-white/20 truncate"
                      style={{ background: evt.color }}
                      title={`${evt.title} (${evt.start_date})`}
                    >
                      <span className="truncate block font-sans">{evt.title}</span>
                      {evt.location_target && (
                        <span className="text-[9px] opacity-90 block truncate font-mono">📍 {evt.location_target}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* ── MODAL NUEVO / EDITAR EVENTO DE PRODUCCIÓN ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1a0533] rounded-3xl w-full max-w-lg shadow-2xl border border-white/15 p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF0096] to-[#00C8D4] flex items-center justify-center text-white shadow-lg">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-white">
                    {selectedEvent ? "Editar Evento de Producción" : "Nuevo Evento de Rodaje / Expedición"}
                  </h3>
                  <p className="text-xs text-slate-300">Agenda especializada para creadora de contenido & auditorías HDV</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 mt-5 text-xs">
              
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Título del Evento / Pauta *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ej: Rodaje 4K Golden Hour en Bahía de Mochima"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Tipo de Evento
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => {
                      const val = e.target.value as CreatorAgendaEvent["event_type"];
                      setFormType(val);
                      const matching = EVENT_TYPES.find(t => t.value === val);
                      if (matching) setFormColor(matching.color);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white font-bold"
                  >
                    {EVENT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Estado de Producción
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white font-bold"
                  >
                    <option value="pendiente">⏳ Pendiente / Por Rodar</option>
                    <option value="en_progreso">🎬 En Rodaje / En Tránsito</option>
                    <option value="completado">✅ Completado & Listo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Destino / Locación
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Ej: Cayo Sombrero, Falcón"
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Posada / Marca Patrocinadora
                  </label>
                  <input
                    type="text"
                    value={formSponsor}
                    onChange={(e) => setFormSponsor(e.target.value)}
                    placeholder="Ej: Posada Perla Negra / HDV"
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Fecha & Hora Inicio
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Fecha & Hora Fin
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Notas de Producción & Tips de Luz
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Llevar filtros ND para drone, batería extra y trípode liviano..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                {selectedEvent ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#00C8D4] hover:opacity-90 text-white font-black shadow-lg"
                  >
                    {selectedEvent ? "Guardar Cambios" : "Agendar Evento"}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
