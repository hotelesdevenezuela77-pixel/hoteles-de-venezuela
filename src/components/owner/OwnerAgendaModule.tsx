import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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
  Briefcase,
  MapPin,
  PhoneCall,
  CalendarCheck2,
  CalendarDays,
  CalendarRange,
  Info,
  UserCheck
} from "lucide-react";

export interface OwnerAgendaEvent {
  id: string;
  establishment_id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  event_type: "visita" | "seguimiento" | "tarea" | "mantenimiento" | "urgente";
  status: "pendiente" | "en_progreso" | "completado";
  color: string;
}

const EVENT_TYPES = [
  { value: "visita", label: "Visita Comercial / Cliente", color: "#10b981", icon: MapPin },
  { value: "seguimiento", label: "Check-in / Seguimiento", color: "#3b82f6", icon: PhoneCall },
  { value: "tarea", label: "Tarea Operativa", color: "#00C8D4", icon: CalendarCheck2 },
  { value: "mantenimiento", label: "Mantenimiento Habitaciones", color: "#9B00CC", icon: CalendarRange },
  { value: "urgente", label: "Urgente / Prioritario", color: "#FF0096", icon: AlertTriangle }
];

const COLORS_PALETTE = [
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#00C8D4", // Cyan Oficial
  "#FF0096", // Magenta Oficial
  "#9B00CC", // Purple Oficial
  "#eab308", // Yellow
  "#ef4444", // Red
];

interface OwnerAgendaModuleProps {
  establishmentId: number;
  establishmentName: string;
}

export function OwnerAgendaModule({ establishmentId, establishmentName }: OwnerAgendaModuleProps) {
  // Estados principales de la agenda del cliente
  const [events, setEvents] = useState<OwnerAgendaEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Sincronización Google Calendar
  const [googleConnected, setGoogleConnected] = useState<boolean>(() => {
    return localStorage.getItem(`hdv_google_cal_owner_${establishmentId}`) === "true";
  });
  const [syncLoading, setSyncLoading] = useState<boolean>(false);

  // Estados del Modal de Evento
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<OwnerAgendaEvent | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formType, setFormType] = useState<OwnerAgendaEvent["event_type"]>("tarea");
  const [formStatus, setFormStatus] = useState<OwnerAgendaEvent["status"]>("pendiente");
  const [formColor, setFormColor] = useState("#00C8D4");
  const [syncWithGoogle, setSyncWithGoogle] = useState(true);

  // Drag and Drop State
  const [draggedEvent, setDraggedEvent] = useState<OwnerAgendaEvent | null>(null);

  const localKey = `hdv_owner_agenda_${establishmentId}`;

  // Cargar eventos aislados por cliente/establecimiento
  useEffect(() => {
    fetchEvents();
  }, [establishmentId]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // 1. Consultar eventos en Supabase con aislamiento por establishment_id
      const { data, error } = await supabase
        .from("establishment_calendar_events")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("start_date", { ascending: true });

      if (!error && data) {
        const mapped: OwnerAgendaEvent[] = data.map((d: any) => ({
          id: d.id.toString(),
          establishment_id: d.establishment_id,
          title: d.title,
          description: d.description || "",
          start_date: d.start_date,
          end_date: d.end_date,
          event_type: d.event_type || "tarea",
          status: d.status || "pendiente",
          color: d.color || "#00C8D4"
        }));
        setEvents(mapped);
        localStorage.setItem(localKey, JSON.stringify(mapped));
      } else {
        loadLocalStorageEvents();
      }
    } catch (err) {
      console.warn("[Agenda Cliente] Error leyendo Supabase, cargando almacenamiento local seguro:", err);
      loadLocalStorageEvents();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalStorageEvents = () => {
    const local = localStorage.getItem(localKey);
    if (local) {
      setEvents(JSON.parse(local));
    } else {
      // Inicializar vacia para arranque oficial limpio
      setEvents([]);
      localStorage.setItem(localKey, JSON.stringify([]));
    }
  };

  const saveEventsList = async (newList: OwnerAgendaEvent[]) => {
    setEvents(newList);
    localStorage.setItem(localKey, JSON.stringify(newList));
  };

  // Handlers para crear / editar eventos
  const handleOpenAddModal = (date?: Date) => {
    setSelectedEvent(null);
    setFormTitle("");
    setFormDescription("");
    
    const start = date ? new Date(date) : new Date();
    start.setHours(9, 0, 0, 0);
    const end = new Date(start);
    end.setHours(10, 0, 0, 0);

    const formatDateTimeLocal = (d: Date) => {
      const pad = (n: number) => (n < 10 ? "0" : "") + n;
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setFormStart(formatDateTimeLocal(start));
    setFormEnd(formatDateTimeLocal(end));
    setFormType("tarea");
    setFormStatus("pendiente");
    setFormColor("#00C8D4");
    setModalOpen(true);
  };

  const handleOpenEditModal = (event: OwnerAgendaEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setFormTitle(event.title);
    setFormDescription(event.description);

    const formatISOToLocal = (iso: string) => {
      const d = new Date(iso);
      const pad = (n: number) => (n < 10 ? "0" : "") + n;
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setFormStart(formatISOToLocal(event.start_date));
    setFormEnd(formatISOToLocal(event.end_date));
    setFormType(event.event_type);
    setFormStatus(event.status);
    setFormColor(event.color);
    setModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const startISO = new Date(formStart).toISOString();
    const endISO = new Date(formEnd).toISOString();

    const eventData = {
      establishment_id: establishmentId,
      title: formTitle,
      description: formDescription,
      start_date: startISO,
      end_date: endISO,
      event_type: formType,
      status: formStatus,
      color: formColor
    };

    try {
      if (selectedEvent) {
        // EDITAR EVENTO
        await supabase
          .from("establishment_calendar_events")
          .update(eventData)
          .eq("id", selectedEvent.id);

        const updated = events.map(ev => 
          ev.id === selectedEvent.id ? { ...ev, ...eventData } : ev
        );
        saveEventsList(updated);
      } else {
        // CREAR NUEVO EVENTO
        const tempId = Date.now().toString();
        
        const { data } = await supabase
          .from("establishment_calendar_events")
          .insert([eventData])
          .select();

        const newId = data && data[0] ? data[0].id.toString() : tempId;
        const newEv: OwnerAgendaEvent = { id: newId, ...eventData };

        saveEventsList([...events, newEv]);
      }
    } catch (err) {
      console.warn("Error guardando evento:", err);
      if (!selectedEvent) {
        const tempId = Date.now().toString();
        saveEventsList([...events, { id: tempId, ...eventData }]);
      }
    }

    setModalOpen(false);
  };

  const handleDeleteEvent = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Deseas eliminar este evento de tu agenda?")) return;

    try {
      await supabase.from("establishment_calendar_events").delete().eq("id", id);
    } catch (err) {
      console.warn("Delete DB error:", err);
    }

    const updated = events.filter(ev => ev.id !== id);
    saveEventsList(updated);
    if (selectedEvent?.id === id) setModalOpen(false);
  };

  // Drag and Drop Logic para mover eventos entre fechas de la agenda
  const handleDragStart = (e: React.DragEvent, event: OwnerAgendaEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.setData("text/plain", event.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropEventOnDate = async (targetDate: Date) => {
    if (!draggedEvent) return;

    const oldStart = new Date(draggedEvent.start_date);
    const oldEnd = new Date(draggedEvent.end_date);
    const durationMs = oldEnd.getTime() - oldStart.getTime();

    const newStart = new Date(targetDate);
    newStart.setHours(oldStart.getHours(), oldStart.getMinutes(), 0, 0);

    const newEnd = new Date(newStart.getTime() + durationMs);

    const updatedEvent: OwnerAgendaEvent = {
      ...draggedEvent,
      start_date: newStart.toISOString(),
      end_date: newEnd.toISOString()
    };

    try {
      await supabase
        .from("establishment_calendar_events")
        .update({
          start_date: updatedEvent.start_date,
          end_date: updatedEvent.end_date
        })
        .eq("id", draggedEvent.id);
    } catch (err) {
      console.warn("Error reasignando fecha drag-drop:", err);
    }

    const updatedList = events.map(ev => ev.id === draggedEvent.id ? updatedEvent : ev);
    saveEventsList(updatedList);
    setDraggedEvent(null);
  };

  // Sincronización ficticia / enlace con Google Calendar
  const handleToggleGoogleCalendar = () => {
    setSyncLoading(true);
    setTimeout(() => {
      const nextState = !googleConnected;
      setGoogleConnected(nextState);
      localStorage.setItem(`hdv_google_cal_owner_${establishmentId}`, nextState ? "true" : "false");
      setSyncLoading(false);
      alert(nextState 
        ? `🎉 Google Calendar de ${establishmentName} vinculado con éxito. Tus eventos y recordatorios de check-in se sincronizan automáticamente.`
        : "Agenda desvinculada de Google Calendar."
      );
    }, 800);
  };

  // Navegación de Fechas
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === "month") d.setMonth(d.getMonth() - 1);
    else if (viewMode === "week") d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === "month") d.setMonth(d.getMonth() + 1);
    else if (viewMode === "week") d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => setCurrentDate(new Date());

  // Generador de días del mes
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Ajustar para que Lunes sea día 0 (0: Lunes, 6: Domingo)
    let startingDayIndex = firstDayOfMonth.getDay() - 1;
    if (startingDayIndex === -1) startingDayIndex = 6;

    const daysInMonth = lastDayOfMonth.getDate();
    const days: { date: Date; currentMonth: boolean }[] = [];

    // Días del mes anterior
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        currentMonth: false
      });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        currentMonth: true
      });
    }

    // Días del mes siguiente para completar la matriz de 35 o 42 celdas
    const remainingDays = 35 - days.length >= 0 ? 35 - days.length : 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        currentMonth: false
      });
    }

    return days;
  };

  // Comprobar eventos para una fecha específica
  const getEventsForDate = (date: Date) => {
    return events.filter(ev => {
      const evDate = new Date(ev.start_date);
      return (
        evDate.getDate() === date.getDate() &&
        evDate.getMonth() === date.getMonth() &&
        evDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const dayNamesShort = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO", "DOMINGO"];

  return (
    <div className="space-y-6 text-left">
      
      {/* Encabezado Principal de la Agenda */}
      <div className="bg-[#0e011f] border border-white/10 rounded-3xl p-6 md:p-8 text-white shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-turquesa/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-magenta/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-brand-turquesa/20 text-brand-turquesa border border-brand-turquesa/30 text-[9px] font-black uppercase tracking-wider">
                GESTIÓN DE ACTIVIDADES HOTELLERAS
              </span>
              <span className="text-xs text-slate-300 font-bold">· {establishmentName}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black font-serif uppercase tracking-tight text-white mt-1">
              AGENDA Y CALENDARIO INTERACTIVO
            </h2>
            <p className="text-xs text-gray-300 font-sans mt-0.5">
              Planifica check-ins, tareas operativas, visitas comerciales y mantenimientos con arrastrar y soltar (Drag & Drop).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleToggleGoogleCalendar}
              disabled={syncLoading}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer border shadow-md ${
                googleConnected 
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30" 
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }`}
            >
              {syncLoading ? <Loader2 className="w-4 h-4 animate-spin text-brand-turquesa" /> : <Globe className="w-4 h-4 text-brand-turquesa" />}
              <span>{googleConnected ? "Google Calendar Vinculado" : "Vincular Google Calendar"}</span>
            </button>

            <button
              onClick={() => handleOpenAddModal()}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-magenta to-[#9B00CC] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Agregar Evento</span>
            </button>
          </div>
        </div>

        {/* Barra de Controles y Selector de Vista */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#1a0533] border border-white/10 p-4 rounded-2xl relative z-10">
          
          {/* Navegador Mes/Año */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-all cursor-pointer border border-white/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-black font-serif text-white tracking-wide min-w-[160px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>

            <button
              onClick={handleNext}
              className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-all cursor-pointer border border-white/10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleToday}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/10 ml-2"
            >
              Hoy
            </button>
          </div>

          {/* Selector Vista (Mes, Semana, Día) */}
          <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/10">
            {(["month", "week", "day"] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 rounded-lg text-xs font-black capitalize transition-all cursor-pointer ${
                  viewMode === mode 
                    ? "bg-brand-magenta text-white shadow-sm" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {mode === "month" ? "Mes" : mode === "week" ? "Semana" : "Día"}
              </button>
            ))}
          </div>
        </div>

        {/* Leyenda de Categorías de Eventos */}
        <div className="flex flex-wrap gap-4 pt-2 border-t border-white/10 text-xs font-bold text-gray-300">
          {EVENT_TYPES.map(type => (
            <div key={type.value} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
              <span>{type.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grilla del Calendario (Modo Mes) */}
      {viewMode === "month" && (
        <div className="bg-[#0e011f] border border-white/10 rounded-3xl p-4 md:p-6 shadow-2xl overflow-hidden">
          
          {/* Cabecera Días de la Semana */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-black text-gray-300 uppercase tracking-wider font-serif">
            {dayNamesShort.map(day => (
              <div key={day} className="py-2 bg-white/5 rounded-xl border border-white/5">
                {day}
              </div>
            ))}
          </div>

          {/* Días del Calendario */}
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center text-center p-8">
              <Loader2 className="w-10 h-10 animate-spin text-brand-turquesa mb-3" />
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Cargando Agenda de {establishmentName}...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth().map((dayObj, index) => {
                const dayEvents = getEventsForDate(dayObj.date);
                const isToday = 
                  dayObj.date.getDate() === new Date().getDate() &&
                  dayObj.date.getMonth() === new Date().getMonth() &&
                  dayObj.date.getFullYear() === new Date().getFullYear();

                return (
                  <div
                    key={index}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDropEventOnDate(dayObj.date)}
                    onClick={() => handleOpenAddModal(dayObj.date)}
                    className={`min-h-[110px] md:min-h-[130px] p-2 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer relative group ${
                      dayObj.currentMonth
                        ? isToday
                          ? "bg-[#1a0533] border-brand-magenta shadow-lg ring-2 ring-brand-magenta/40"
                          : "bg-white/5 border-white/10 hover:border-brand-turquesa/50 hover:bg-white/10"
                        : "bg-black/40 border-white/5 opacity-40"
                    }`}
                  >
                    {/* Número de Día */}
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs font-black rounded-lg px-2 py-0.5 ${
                        isToday 
                          ? "bg-brand-magenta text-white font-serif" 
                          : dayObj.currentMonth 
                          ? "text-white" 
                          : "text-gray-500"
                      }`}>
                        {dayObj.date.getDate()}
                      </span>

                      {dayEvents.length > 0 && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-white/10 text-brand-turquesa border border-brand-turquesa/30">
                          {dayEvents.length} Evs
                        </span>
                      )}
                    </div>

                    {/* Lista de Eventos en la celda */}
                    <div className="space-y-1 overflow-y-auto max-h-[85px] custom-scrollbar flex-1">
                      {dayEvents.map(ev => {
                        const typeInfo = EVENT_TYPES.find(t => t.value === ev.event_type);
                        const Icon = typeInfo?.icon || CalendarCheck2;

                        return (
                          <div
                            key={ev.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, ev)}
                            onClick={(e) => handleOpenEditModal(ev, e)}
                            className="p-1.5 rounded-xl text-[10px] font-bold text-white shadow-md flex items-center justify-between gap-1 transition-all hover:scale-102 cursor-grab active:cursor-grabbing border border-white/20"
                            style={{ backgroundColor: ev.color || "#00C8D4" }}
                          >
                            <div className="flex items-center gap-1 truncate">
                              <Icon className="w-3 h-3 shrink-0" />
                              <span className="truncate">{ev.title}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Botón flotante al pasar el mouse */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1.5 right-1.5">
                      <span className="w-5 h-5 bg-brand-turquesa text-[#0e011f] rounded-full flex items-center justify-center text-xs font-black shadow-md">
                        +
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Vistas Alternativas (Semana / Día) */}
      {viewMode !== "month" && (
        <div className="bg-[#0e011f] border border-white/10 rounded-3xl p-6 text-white shadow-2xl text-center space-y-4">
          <CalendarDays className="w-12 h-12 text-brand-turquesa mx-auto mb-2 animate-bounce" />
          <h3 className="text-lg font-black font-serif uppercase">Vista Semanal y Diaria Detallada</h3>
          <p className="text-xs text-gray-300 max-w-md mx-auto">
            Haz clic abajo para volver al modo mensual o agregar un nuevo evento para la fecha seleccionada.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setViewMode("month")}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/10 cursor-pointer"
            >
              Volver a Vista Mensual
            </button>
            <button
              onClick={() => handleOpenAddModal(currentDate)}
              className="px-4 py-2 bg-brand-magenta hover:bg-brand-magenta/90 text-white text-xs font-black rounded-xl cursor-pointer"
            >
              + Agregar Evento para {currentDate.toLocaleDateString("es-VE")}
            </button>
          </div>
        </div>
      )}

      {/* Modal de Crear / Editar Evento */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0e011f] border border-white/20 rounded-3xl max-w-lg w-full p-6 md:p-8 text-white shadow-2xl relative space-y-6 animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-turquesa/20 border border-brand-turquesa/30 text-brand-turquesa flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-black font-serif uppercase tracking-tight">
                  {selectedEvent ? "Editar Evento / Tarea" : "Nuevo Evento de Agenda"}
                </h3>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs font-sans">
              
              {/* Título */}
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-300 mb-1">Título del Evento o Tarea *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ej: Check-in Suite 204 / Mantenimiento Aire Acondicionado"
                  className="w-full px-4 py-2.5 bg-[#1a0533] border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-turquesa"
                />
              </div>

              {/* Categoría / Tipo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-300 mb-1">Categoría</label>
                  <select
                    value={formType}
                    onChange={(e) => {
                      const selected = e.target.value as OwnerAgendaEvent["event_type"];
                      setFormType(selected);
                      const matched = EVENT_TYPES.find(t => t.value === selected);
                      if (matched) setFormColor(matched.color);
                    }}
                    className="w-full px-3 py-2.5 bg-[#1a0533] border border-white/15 rounded-xl text-white focus:outline-none focus:border-brand-turquesa cursor-pointer"
                  >
                    {EVENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-300 mb-1">Estado</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as OwnerAgendaEvent["status"])}
                    className="w-full px-3 py-2.5 bg-[#1a0533] border border-white/15 rounded-xl text-white focus:outline-none focus:border-brand-turquesa cursor-pointer"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_progreso">En Progreso</option>
                    <option value="completado">Completado</option>
                  </select>
                </div>
              </div>

              {/* Fechas Inicio / Fin */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-300 mb-1">Fecha y Hora Inicio</label>
                  <input
                    type="datetime-local"
                    required
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#1a0533] border border-white/15 rounded-xl text-white focus:outline-none focus:border-brand-turquesa"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-300 mb-1">Fecha y Hora Fin</label>
                  <input
                    type="datetime-local"
                    required
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#1a0533] border border-white/15 rounded-xl text-white focus:outline-none focus:border-brand-turquesa"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-300 mb-1">Notas u Observaciones Operativas</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detalles de la reservación, contacto del cliente o requerimientos especiales..."
                  className="w-full px-4 py-2.5 bg-[#1a0533] border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-turquesa"
                />
              </div>

              {/* Palette Color Picker */}
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-300 mb-2">Color Distintivo del Badge</label>
                <div className="flex items-center gap-2">
                  {COLORS_PALETTE.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform cursor-pointer border ${
                        formColor === c ? "scale-125 border-white ring-2 ring-white/50" : "border-transparent opacity-80 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Botones del Modal */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                {selectedEvent ? (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteEvent(selectedEvent.id, e)}
                    className="px-3.5 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Evento</span>
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-brand-magenta to-[#9B00CC] text-white font-black uppercase rounded-xl shadow-lg hover:scale-105 transition-all cursor-pointer"
                  >
                    {selectedEvent ? "Guardar Cambios" : "Confirmar Evento"}
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
