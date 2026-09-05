import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, X, 
  Loader2, Check, Trash2, Sparkles, Globe, RefreshCw, AlertTriangle, 
  MapPin, PhoneCall, CalendarCheck2, Move
} from "lucide-react";

interface AgendaEvent {
  id: string;
  establishment_id?: number;
  title: string;
  description: string;
  start_date: string; // ISO String
  end_date: string;   // ISO String
  event_type: "visita" | "seguimiento" | "tarea" | "urgente" | "salida" | "fotografia";
  status: "pendiente" | "en_progreso" | "completado";
  color: string;
}

interface DashboardAgendaCalendarProps {
  establishmentId: number;
  portalTitle?: string;
  themeColor?: string;
}

const EVENT_TYPES = [
  { value: "visita", label: "Visita / Reunión", color: "#10b981" },
  { value: "seguimiento", label: "Llamada / Cliente", color: "#3b82f6" },
  { value: "tarea", label: "Tarea / Operación", color: "#eab308" },
  { value: "salida", label: "Salida / Expedición", color: "#9B00CC" },
  { value: "fotografia", label: "Sesión / Entregable", color: "#FF0096" },
  { value: "urgente", label: "Urgente", color: "#ef4444" }
];

const COLORS_PALETTE = [
  "#00C8D4", // Cyan
  "#FF0096", // Magenta
  "#9B00CC", // Purple
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#eab308", // Yellow
  "#ef4444"  // Red
];

export const DashboardAgendaCalendar: React.FC<DashboardAgendaCalendarProps> = ({
  establishmentId,
  portalTitle = "Agenda & Calendario Interactivo",
  themeColor = "#00C8D4"
}) => {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  // Drag & Drop tracking
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formType, setFormType] = useState<AgendaEvent["event_type"]>("tarea");
  const [formStatus, setFormStatus] = useState<AgendaEvent["status"]>("pendiente");
  const [formColor, setFormColor] = useState(themeColor);

  const storageKey = `hdv_agenda_events_est_${establishmentId}`;

  useEffect(() => {
    loadEvents();
  }, [establishmentId]);

  const loadEvents = () => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setEvents(JSON.parse(saved));
    } else {
      // Seed default events for this establishment
      const today = new Date();
      const seed: AgendaEvent[] = [
        {
          id: `seed-1-${establishmentId}`,
          establishment_id: establishmentId,
          title: "Reunión de Coordinación Operativa",
          description: "Revisión de itinerario y asignación de personal.",
          start_date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0).toISOString(),
          end_date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30).toISOString(),
          event_type: "visita",
          status: "pendiente",
          color: "#00C8D4"
        },
        {
          id: `seed-2-${establishmentId}`,
          establishment_id: establishmentId,
          title: "Entrega de Material Multimedia & Reporte",
          description: "Carga de fotos, reels e informes de gestión.",
          start_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 15, 0).toISOString(),
          end_date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 17, 0).toISOString(),
          event_type: "fotografia",
          status: "pendiente",
          color: "#FF0096"
        }
      ];
      setEvents(seed);
      localStorage.setItem(storageKey, JSON.stringify(seed));
    }
  };

  const saveEventsToStorage = (updatedEvents: AgendaEvent[]) => {
    setEvents(updatedEvents);
    localStorage.setItem(storageKey, JSON.stringify(updatedEvents));
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const todayMonth = () => setCurrentDate(new Date());

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfWeek = (y: number, m: number) => {
    const day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1; // Mon=0, Sun=6
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    setDraggedEventId(eventId);
    e.dataTransfer.setData("text/plain", eventId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropOnDay = (e: React.DragEvent, targetDayDate: Date) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData("text/plain") || draggedEventId;
    if (!eventId) return;

    const targetEvent = events.find(ev => ev.id === eventId);
    if (!targetEvent) return;

    const origStart = new Date(targetEvent.start_date);
    const origEnd = new Date(targetEvent.end_date);
    const durationMs = origEnd.getTime() - origStart.getTime();

    const newStart = new Date(
      targetDayDate.getFullYear(),
      targetDayDate.getMonth(),
      targetDayDate.getDate(),
      origStart.getHours(),
      origStart.getMinutes()
    );
    const newEnd = new Date(newStart.getTime() + durationMs);

    const updated = events.map(ev => 
      ev.id === eventId 
        ? { ...ev, start_date: newStart.toISOString(), end_date: newEnd.toISOString() } 
        : ev
    );

    saveEventsToStorage(updated);
    setDraggedEventId(null);
  };

  // Open Modal
  const openNewEventModal = (date?: Date) => {
    setSelectedEvent(null);
    setFormTitle("");
    setFormDescription("");
    const start = date || new Date();
    start.setHours(9, 0, 0, 0);
    const end = new Date(start);
    end.setHours(10, 0, 0, 0);

    setFormStart(start.toISOString().slice(0, 16));
    setFormEnd(end.toISOString().slice(0, 16));
    setFormType("tarea");
    setFormStatus("pendiente");
    setFormColor(themeColor);
    setModalOpen(true);
  };

  const openEditEventModal = (ev: AgendaEvent) => {
    setSelectedEvent(ev);
    setFormTitle(ev.title);
    setFormDescription(ev.description || "");
    setFormStart(new Date(ev.start_date).toISOString().slice(0, 16));
    setFormEnd(new Date(ev.end_date).toISOString().slice(0, 16));
    setFormType(ev.event_type);
    setFormStatus(ev.status);
    setFormColor(ev.color || themeColor);
    setModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (selectedEvent) {
      const updated = events.map(ev => 
        ev.id === selectedEvent.id 
          ? {
              ...ev,
              title: formTitle.trim(),
              description: formDescription.trim(),
              start_date: new Date(formStart).toISOString(),
              end_date: new Date(formEnd).toISOString(),
              event_type: formType,
              status: formStatus,
              color: formColor
            }
          : ev
      );
      saveEventsToStorage(updated);
    } else {
      const newEv: AgendaEvent = {
        id: `evt-${Date.now()}`,
        establishment_id: establishmentId,
        title: formTitle.trim(),
        description: formDescription.trim(),
        start_date: new Date(formStart).toISOString(),
        end_date: new Date(formEnd).toISOString(),
        event_type: formType,
        status: formStatus,
        color: formColor
      };
      saveEventsToStorage([...events, newEv]);
    }
    setModalOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter(ev => ev.id !== id);
    saveEventsToStorage(updated);
    setModalOpen(false);
  };

  return (
    <div className="rounded-3xl bg-[#1a0533]/90 border border-white/10 p-6 shadow-2xl backdrop-blur-md mb-8 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/20">
              AGENDA Y CALENDARIO INDEPENDIENTE
            </span>
            <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/40 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
              Drag & Drop Habilitado
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            {portalTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Arrastra y suelta eventos entre días para reprogramar automáticamente tus tareas, salidas y reuniones.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-900/90 border border-white/10 rounded-2xl p-1">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "month" ? "bg-[#FF0096] text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "week" ? "bg-[#FF0096] text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "day" ? "bg-[#FF0096] text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Día
            </button>
          </div>

          <button
            onClick={() => openNewEventModal()}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-extrabold text-xs text-white shadow-lg transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${themeColor} 0%, #9B00CC 100%)` }}
          >
            <Plus className="w-4 h-4" />
            <span>+ Agregar Evento</span>
          </button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button onClick={prevMonth} className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-lg font-black text-white px-2">
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={todayMonth} className="ml-2 px-3 py-1 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-slate-300 hover:text-white">
            Hoy
          </button>
        </div>

        <div className="hidden sm:flex items-center space-x-4 text-xs">
          {EVENT_TYPES.map(t => (
            <div key={t.value} className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }}></span>
              <span className="text-slate-300 text-[11px] font-semibold">{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MONTH GRID */}
      {viewMode === "month" && (
        <div className="grid grid-cols-7 gap-2">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(dayName => (
            <div key={dayName} className="text-center text-[11px] font-extrabold uppercase tracking-wider text-slate-400 py-2 bg-slate-900/40 rounded-xl border border-white/5">
              {dayName}
            </div>
          ))}

          {/* Empty preceding cells */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[110px] bg-slate-950/20 rounded-2xl border border-white/5 opacity-40"></div>
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayDate = new Date(year, month, dayNum);
            const isToday = dayDate.toDateString() === new Date().toDateString();

            const dayEvents = events.filter(ev => {
              const d = new Date(ev.start_date);
              return d.getDate() === dayNum && d.getMonth() === month && d.getFullYear() === year;
            });

            return (
              <div
                key={`day-${dayNum}`}
                onDragOver={handleDragOver}
                onDrop={e => handleDropOnDay(e, dayDate)}
                onClick={() => openNewEventModal(dayDate)}
                className={`min-h-[110px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isToday
                    ? "bg-[#0e011f] border-[#00C8D4] ring-1 ring-[#00C8D4]"
                    : "bg-slate-900/40 border-white/5 hover:border-white/20 hover:bg-slate-900/80"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-black ${isToday ? "text-[#00C8D4]" : "text-slate-300"}`}>
                    {dayNum}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[80px]">
                  {dayEvents.map(ev => (
                    <div
                      key={ev.id}
                      draggable
                      onDragStart={e => handleDragStart(e, ev.id)}
                      onClick={e => {
                        e.stopPropagation();
                        openEditEventModal(ev);
                      }}
                      className="p-1.5 rounded-xl text-[10px] font-bold text-white shadow-md flex items-center justify-between gap-1 transition-transform hover:scale-105 active:opacity-70 cursor-grab"
                      style={{ backgroundColor: ev.color || themeColor }}
                    >
                      <div className="flex items-center space-x-1 truncate">
                        <Move className="w-2.5 h-2.5 shrink-0 opacity-70" />
                        <span className="truncate">{ev.title}</span>
                      </div>
                      <span className="text-[8px] opacity-80 shrink-0">
                        {new Date(ev.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WEEK & DAY VIEWS (Simplified fallback layout) */}
      {(viewMode === "week" || viewMode === "day") && (
        <div className="p-8 text-center bg-slate-900/40 border border-white/5 rounded-3xl space-y-4">
          <CalendarIcon className="w-12 h-12 text-[#00C8D4] mx-auto animate-bounce" />
          <h3 className="text-lg font-bold text-white">Vista Detallada de {viewMode === "week" ? "Semana" : "Día"}</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Visualiza y arrastra eventos en la cuadrícula mensual para reorganizar rápidamente tus itinerarios.
          </p>
          <button onClick={() => setViewMode("month")} className="px-4 py-2 rounded-xl bg-[#00C8D4] text-slate-950 font-bold text-xs">
            Volver a Vista Mensual Drag & Drop
          </button>
        </div>
      )}

      {/* MODAL EDITAR / CREAR EVENTO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a0533] border border-white/15 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#00C8D4]" />
                <span>{selectedEvent ? "Editar Evento" : "Nuevo Evento de Agenda"}</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Título del Evento</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Ej: Salida de Lancha / Photoshoot VIP"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Fecha & Hora Inicio</label>
                  <input
                    type="datetime-local"
                    required
                    value={formStart}
                    onChange={e => setFormStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Fecha & Hora Fin</label>
                  <input
                    type="datetime-local"
                    required
                    value={formEnd}
                    onChange={e => setFormEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Categoría de Evento</label>
                <select
                  value={formType}
                  onChange={e => setFormType(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                >
                  {EVENT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Color de Evento</label>
                <div className="flex space-x-2">
                  {COLORS_PALETTE.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        formColor === c ? "border-white scale-110 shadow-lg" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Notas / Descripción</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Detalles operativos, ubicación o requerimientos..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4] resize-none"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                {selectedEvent ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="px-3 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-bold flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                ) : <div />}

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl font-extrabold text-xs text-white shadow-lg"
                    style={{ backgroundColor: formColor || themeColor }}
                  >
                    {selectedEvent ? "Guardar Cambios" : "Crear Evento"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
