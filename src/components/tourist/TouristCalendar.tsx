import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  MapPin, 
  Clock, 
  Compass, 
  GripVertical, 
  Sparkles,
  Share2,
  ChevronLeft,
  ChevronRight,
  Luggage,
  CalendarCheck
} from "lucide-react";

export interface TripEvent {
  id: string;
  title: string;
  location: string;
  date: string; // YYYY-MM-DD
  type: "hotel" | "flight" | "excursion" | "activity";
  status: "confirmado" | "reservado" | "cotizacion" | "deseado";
  cost: number;
  notes?: string;
}

interface TouristCalendarProps {
  events: TripEvent[];
  onAddEvent: (event: TripEvent) => void;
  onUpdateEventDate: (eventId: string, newDate: string) => void;
  onDeleteEvent: (eventId: string) => void;
}

export function TouristCalendar({
  events,
  onAddEvent,
  onUpdateEventDate,
  onDeleteEvent
}: TouristCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // Agosto 2026 por defecto
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    location: "",
    date: "2026-08-15",
    type: "hotel" as const,
    status: "reservado" as const,
    cost: 150,
    notes: ""
  });

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generar grid de días
  const daysGrid: ({ day: number; dateStr: string } | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    const monthStr = String(month + 1).padStart(2, "0");
    const dayStr = String(d).padStart(2, "0");
    daysGrid.push({
      day: d,
      dateStr: `${year}-${monthStr}-${dayStr}`
    });
  }

  // Handlers para Drag and Drop
  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    e.dataTransfer.setData("text/plain", eventId);
    setDraggedEventId(eventId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData("text/plain") || draggedEventId;
    if (eventId) {
      onUpdateEventDate(eventId, targetDateStr);
    }
    setDraggedEventId(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title) return;
    onAddEvent({
      id: "evt_" + Date.now(),
      ...newEvent
    });
    setNewEvent({
      title: "",
      location: "",
      date: "2026-08-15",
      type: "hotel",
      status: "reservado",
      cost: 150,
      notes: ""
    });
    setIsAdding(false);
  };

  const getStatusBadge = (status: TripEvent["status"]) => {
    switch (status) {
      case "confirmado":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00C8D4]/15 text-[#00C8D4] border border-[#00C8D4]/30">Confirmado</span>;
      case "reservado":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#9B00CC]/15 text-[#9B00CC] border border-[#9B00CC]/30">Reservado</span>;
      case "cotizacion":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 border border-amber-500/30">Cotización</span>;
      case "deseado":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF0096]/15 text-[#FF0096] border border-[#FF0096]/30">Lista Deseos</span>;
    }
  };

  const getTypeIcon = (type: TripEvent["type"]) => {
    switch (type) {
      case "hotel":
        return <Luggage className="w-3.5 h-3.5 text-[#00C8D4]" />;
      case "excursion":
        return <Compass className="w-3.5 h-3.5 text-[#FF0096]" />;
      case "flight":
        return <Clock className="w-3.5 h-3.5 text-[#9B00CC]" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del Calendario */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00C8D4] flex items-center justify-center text-white shadow-md shadow-[#00C8D4]/20">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-slate-900">Itinerario Drag & Drop de Viajes</h2>
              <p className="text-xs text-slate-500">Arrastra tus actividades y reservas a los días seleccionados para organizar tu viaje perfecto.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-white text-slate-700 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-black uppercase text-slate-900 tracking-wider">
              {months[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-white text-slate-700 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00C8D4] to-[#FF0096] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Agregar Evento
          </button>
        </div>
      </div>

      {/* Modal / Formulario de Nuevo Evento */}
      {isAdding && (
        <form onSubmit={handleCreateSubmit} className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-[#00C8D4] uppercase tracking-wider flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-[#FF0096]" />
              Planificar Nueva Fecha / Evento de Viaje
            </h3>
            <button 
              type="button" 
              onClick={() => setIsAdding(false)} 
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕ Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Título del Evento / Reserva</label>
              <input
                type="text"
                required
                placeholder="Ej. Check-in Posada Los Roques"
                value={newEvent.title}
                onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Ubicación / Destino</label>
              <input
                type="text"
                placeholder="Ej. Cayo Madrisquí, Los Roques"
                value={newEvent.location}
                onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Fecha Inicial</label>
              <input
                type="date"
                required
                value={newEvent.date}
                onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tipo de Actividad</label>
              <select
                value={newEvent.type}
                onChange={e => setNewEvent({ ...newEvent, type: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
              >
                <option value="hotel">Alojamiento / Posada</option>
                <option value="excursion">Excursión / Tour</option>
                <option value="flight">Vuelo / Traslado</option>
                <option value="activity">Actividad Libre</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Estado del Plan</label>
              <select
                value={newEvent.status}
                onChange={e => setNewEvent({ ...newEvent, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
              >
                <option value="confirmado">Confirmado</option>
                <option value="reservado">Reservado</option>
                <option value="cotizacion">En Cotización</option>
                <option value="deseado">Lista de Deseos</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Costo Estimado ($ USD)</label>
              <input
                type="number"
                min="0"
                value={newEvent.cost}
                onChange={e => setNewEvent({ ...newEvent, cost: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#00C8D4] text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-[#00C8D4]/90 transition-all cursor-pointer"
            >
              Guardar en Itinerario
            </button>
          </div>
        </form>
      )}

      {/* Grid Interactivo del Calendario */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <div className="min-w-[650px]">
            {/* Cabecera de días de semana */}
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center py-3 text-xs font-black text-slate-500 uppercase tracking-wider">
              {daysOfWeek.map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>

        {/* Días del Mes */}
        <div className="grid grid-cols-7 auto-rows-fr gap-px bg-slate-100">
          {daysGrid.map((item, index) => {
            if (!item) {
              return <div key={`empty_${index}`} className="bg-slate-50/50 min-h-[110px]" />;
            }

            const dayEvents = events.filter(e => e.date === item.dateStr);

            return (
              <div
                key={item.dateStr}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, item.dateStr)}
                className="bg-white p-2 min-h-[120px] transition-colors hover:bg-slate-50/80 flex flex-col justify-start relative group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold ${dayEvents.length > 0 ? "w-6 h-6 rounded-full bg-[#00C8D4] text-white flex items-center justify-center shadow-xs" : "text-slate-700"}`}>
                    {item.day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      {dayEvents.length} {dayEvents.length === 1 ? "plan" : "planes"}
                    </span>
                  )}
                </div>

                {/* Eventos dentro de este día */}
                <div className="space-y-1.5 overflow-y-auto max-h-[140px] pr-0.5">
                  {dayEvents.map(evt => (
                    <div
                      key={evt.id}
                      draggable
                      onDragStart={e => handleDragStart(e, evt.id)}
                      className="p-2 rounded-xl bg-slate-900 text-white shadow-xs cursor-grab active:cursor-grabbing border border-slate-800 hover:border-[#00C8D4] transition-all group/item text-left"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <GripVertical className="w-3 h-3 text-slate-500 shrink-0" />
                          {getTypeIcon(evt.type)}
                          <span className="text-[11px] font-bold truncate text-slate-100">{evt.title}</span>
                        </div>
                        <button
                          onClick={() => onDeleteEvent(evt.id)}
                          className="opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-red-400 transition-opacity p-0.5"
                          title="Eliminar evento"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {evt.location && (
                        <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-[#00C8D4]" />
                          {evt.location}
                        </p>
                      )}

                      <div className="mt-1 flex items-center justify-between">
                        {getStatusBadge(evt.status)}
                        {evt.cost > 0 && (
                          <span className="text-[10px] font-black text-[#00C8D4]">${evt.cost}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>

      {/* Lista Resumen de Próximos Eventos */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF0096]" />
            Cronograma Resumen de Viaje ({events.length} Eventos Agendados)
          </h3>
          <button 
            onClick={() => alert("Itinerario exportado en formato de viaje HDV.")}
            className="text-xs text-[#00C8D4] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            Compartir / Guardar Itinerario
          </button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Luggage className="w-10 h-10 mx-auto mb-2 text-slate-600 animate-bounce" />
            <p className="text-xs">No tienes fechas o eventos de viaje agendados aún.</p>
            <p className="text-[11px] text-slate-500 mt-1">Usa el botón de arriba o arrastra elementos para construir tu itinerario.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {events.map(e => (
              <div key={e.id} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-[#00C8D4]">{e.date}</span>
                    {getStatusBadge(e.status)}
                  </div>
                  <h4 className="text-xs font-bold text-white">{e.title}</h4>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-[#FF0096]" />
                    {e.location || "Destino Venezuela"}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Costo Est:</span>
                  <span className="font-black text-[#00C8D4]">${e.cost} USD</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
