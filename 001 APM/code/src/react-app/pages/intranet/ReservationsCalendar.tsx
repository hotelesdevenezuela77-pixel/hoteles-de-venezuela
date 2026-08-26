import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, X, User, Phone, Mail, FileText, LayoutGrid, LayoutList, Calendar as CalendarIcon } from "lucide-react";

interface Room {
  id: number;
  code: string;
  building: string;
  room_type: string;
  capacity: number;
}

interface Reservation {
  id: number;
  room_id: number;
  guest_name: string;
  guest_phone: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  num_guests: number;
}

const BUILDINGS = [
  { code: "A", name: "Edificio Principal" },
  { code: "B", name: "Edificio de la Piscina" },
  { code: "C", name: "Piscina Apartamentos" },
  { code: "D", name: "Edificio de Recepción" },
  { code: "E", name: "Recepción Apartamentos" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  confirmed: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300", dot: "bg-emerald-500" },
  pending: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300", dot: "bg-amber-500" },
  checked_in: { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-300", dot: "bg-cyan-500" },
  checked_out: { bg: "bg-slate-100", text: "text-slate-500", border: "border-slate-300", dot: "bg-slate-400" },
  cancelled: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", dot: "bg-red-500" },
};

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

type ViewMode = "calendar" | "timeline";

export default function ReservationsCalendar() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNewReservation, setShowNewReservation] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");

  const [formData, setFormData] = useState({
    guest_name: "",
    guest_phone: "",
    guest_email: "",
    check_in_date: "",
    check_out_date: "",
    num_guests: 1,
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, reservationsRes] = await Promise.all([
        fetch("/api/rooms"),
        fetch(`/api/reservations?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`),
      ]);
      
      if (roomsRes.ok) setRooms(await roomsRes.json());
      if (reservationsRes.ok) setReservations(await reservationsRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  }, [currentDate]);

  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  // Calendar grid data
  const calendarWeeks = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];
    
    // Fill empty days before month starts
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }
    
    // Fill days of month
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Fill remaining days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }
    
    return weeks;
  }, [currentDate, daysInMonth]);

  const getReservationsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return reservations.filter(r => r.check_in_date <= dateStr && r.check_out_date > dateStr);
  };

  const getReservationForCell = (roomId: number, day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return reservations.find(r => r.room_id === roomId && r.check_in_date <= dateStr && r.check_out_date > dateStr);
  };

  const isCheckInDay = (reservation: Reservation, day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return reservation.check_in_date === dateStr;
  };

  const getReservationSpan = (reservation: Reservation, day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (reservation.check_in_date !== dateStr) return 0;
    
    const checkIn = new Date(reservation.check_in_date);
    const checkOut = new Date(reservation.check_out_date);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const endDate = checkOut > monthEnd ? monthEnd : checkOut;
    const daysLeft = Math.ceil((endDate.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(daysLeft, daysInMonth - day + 1);
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleCellClick = (room: Room, day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (getReservationForCell(room.id, day)) return;
    
    setSelectedRoom(room);
    setFormData({ ...formData, check_in_date: dateStr, check_out_date: "" });
    setShowNewReservation(true);
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedRoom(null);
    setFormData({ ...formData, check_in_date: dateStr, check_out_date: "" });
    setShowNewReservation(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: selectedRoom.id, ...formData }),
      });

      if (res.ok) {
        setShowNewReservation(false);
        setFormData({ guest_name: "", guest_phone: "", guest_email: "", check_in_date: "", check_out_date: "", num_guests: 1, notes: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Error creating reservation:", error);
    }
  };

  const groupedRooms = useMemo(() => {
    const groups: Record<string, Room[]> = {};
    BUILDINGS.forEach(b => { groups[b.code] = []; });
    rooms.forEach(room => {
      const code = room.code.charAt(0);
      if (groups[code]) groups[code].push(room);
    });
    return groups;
  }, [rooms]);

  const getRoomById = (id: number) => rooms.find(r => r.id === id);

  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
  const todayDay = today.getDate();

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">Calendario de Reservaciones</h1>
          <p className="text-slate-500 mt-1 text-sm">Smarth Eco Systems - Hoteles de Venezuela</p>
        </div>
        <button
          onClick={() => { setSelectedRoom(null); setShowNewReservation(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl hover:opacity-90 transition-opacity w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Nueva Reservación</span>
        </button>
      </div>

      {/* Navigation & View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={goToToday} className="px-3 py-1 text-sm bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition-colors">
              Hoy
            </button>
          </div>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronRight className="w-6 h-6 text-slate-600" />
          </button>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === "calendar" ? "bg-white text-cyan-700 shadow-sm" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Calendario</span>
          </button>
          <button
            onClick={() => setViewMode("timeline")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === "timeline" ? "bg-white text-cyan-700 shadow-sm" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <LayoutList className="w-4 h-4" />
            <span className="hidden sm:inline">Timeline</span>
          </button>
        </div>
      </div>

      {/* Calendar Views */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
          Cargando...
        </div>
      ) : viewMode === "calendar" ? (
        /* Google Calendar Style View */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
            {WEEKDAYS.map((day, i) => (
              <div key={day} className={`p-3 text-center text-sm font-semibold ${i === 0 ? "text-red-500" : "text-slate-600"}`}>
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarWeeks.map((week, wi) =>
              week.map((day, di) => {
                const reservationsForDay = day ? getReservationsForDay(day) : [];
                const isToday = isCurrentMonth && day === todayDay;
                const isWeekend = di === 0 || di === 6;
                
                return (
                  <div
                    key={`${wi}-${di}`}
                    onClick={() => day && handleDayClick(day)}
                    className={`min-h-[100px] sm:min-h-[120px] border-b border-r border-slate-100 p-1 sm:p-2 cursor-pointer transition-colors ${
                      day ? "hover:bg-cyan-50" : "bg-slate-50/50"
                    } ${isWeekend && day ? "bg-red-50/30" : ""}`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                          isToday ? "bg-cyan-500 text-white" : isWeekend ? "text-red-500" : "text-slate-700"
                        }`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {reservationsForDay.slice(0, 3).map((res) => {
                            const room = getRoomById(res.room_id);
                            const colors = STATUS_COLORS[res.status] || STATUS_COLORS.pending;
                            return (
                              <div
                                key={res.id}
                                onClick={(e) => { e.stopPropagation(); setSelectedReservation(res); }}
                                className={`${colors.bg} ${colors.text} text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80`}
                                title={`${room?.code} - ${res.guest_name}`}
                              >
                                <span className="font-semibold">{room?.code}</span> {res.guest_name.split(" ")[0]}
                              </div>
                            );
                          })}
                          {reservationsForDay.length > 3 && (
                            <div className="text-xs text-slate-500 pl-2">
                              +{reservationsForDay.length - 3} más
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Timeline View (Original) */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="sticky left-0 z-10 bg-slate-50 border-b border-r border-slate-200 p-3 text-left text-sm font-semibold text-slate-600 w-32">
                    Habitación
                  </th>
                  {days.map(day => (
                    <th key={day} className={`border-b border-slate-200 p-2 text-center text-sm font-medium min-w-[40px] ${
                      isCurrentMonth && day === todayDay ? "bg-cyan-500 text-white" : "text-slate-600"
                    }`}>
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BUILDINGS.map(building => (
                  <>
                    <tr key={`header-${building.code}`}>
                      <td colSpan={daysInMonth + 1} className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-4 py-2 text-sm font-semibold">
                        {building.name}
                      </td>
                    </tr>
                    {groupedRooms[building.code]?.map(room => (
                      <tr key={room.id} className="hover:bg-slate-50/50">
                        <td className="sticky left-0 z-10 bg-white border-b border-r border-slate-200 p-2">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">{room.code}</span>
                            <span className="text-xs text-slate-500">{room.room_type}</span>
                          </div>
                        </td>
                        {days.map(day => {
                          const reservation = getReservationForCell(room.id, day);
                          const isCheckIn = reservation && isCheckInDay(reservation, day);
                          const span = reservation ? getReservationSpan(reservation, day) : 0;
                          const colors = reservation ? STATUS_COLORS[reservation.status] || STATUS_COLORS.pending : null;

                          if (reservation && !isCheckIn) return null;

                          return (
                            <td
                              key={day}
                              colSpan={span || 1}
                              onClick={() => !reservation && handleCellClick(room, day)}
                              className={`border-b border-slate-200 p-1 text-center ${
                                !reservation ? "cursor-pointer hover:bg-cyan-50" : ""
                              } ${isCurrentMonth && day === todayDay && !reservation ? "bg-cyan-50" : ""}`}
                            >
                              {reservation && isCheckIn && (
                                <div
                                  onClick={(e) => { e.stopPropagation(); setSelectedReservation(reservation); }}
                                  className={`${colors?.bg} ${colors?.text} ${colors?.border} border rounded-lg px-2 py-1 text-xs font-medium truncate cursor-pointer hover:opacity-80`}
                                  title={`${reservation.guest_name} - ${reservation.guest_phone}`}
                                >
                                  {reservation.guest_name}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        {Object.entries({ confirmed: "Confirmada", pending: "Pendiente", checked_in: "Check-in", checked_out: "Check-out", cancelled: "Cancelada" }).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${STATUS_COLORS[key].bg} ${STATUS_COLORS[key].border} border`}></div>
            <span className="text-slate-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Reservation Detail Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[selectedReservation.status]?.dot || "bg-slate-400"}`}></div>
                <h3 className="text-xl font-bold text-slate-800">Detalle de Reservación</h3>
              </div>
              <button onClick={() => setSelectedReservation(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <CalendarIcon className="w-5 h-5 text-cyan-600" />
                <div>
                  <p className="text-sm text-slate-500">Habitación</p>
                  <p className="font-semibold text-slate-800">{getRoomById(selectedReservation.room_id)?.code} - {getRoomById(selectedReservation.room_id)?.room_type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <User className="w-5 h-5 text-cyan-600" />
                <div>
                  <p className="text-sm text-slate-500">Huésped</p>
                  <p className="font-semibold text-slate-800">{selectedReservation.guest_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Phone className="w-5 h-5 text-cyan-600" />
                <div>
                  <p className="text-sm text-slate-500">Teléfono</p>
                  <p className="font-semibold text-slate-800">{selectedReservation.guest_phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50 rounded-xl text-center">
                  <p className="text-xs text-emerald-600">Check-in</p>
                  <p className="font-semibold text-emerald-800">{new Date(selectedReservation.check_in_date).toLocaleDateString("es-VE")}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl text-center">
                  <p className="text-xs text-red-600">Check-out</p>
                  <p className="font-semibold text-red-800">{new Date(selectedReservation.check_out_date).toLocaleDateString("es-VE")}</p>
                </div>
              </div>
              <a
                href={`https://wa.me/${selectedReservation.guest_phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
              >
                <img src="https://019ced02-15a3-7929-bb2a-56f48956faf5.mochausercontent.com/w-removebg-preview.png" className="w-6 h-6" alt="WhatsApp" />
                Contactar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* New Reservation Modal */}
      {showNewReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Nueva Reservación</h3>
              <button onClick={() => setShowNewReservation(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Habitación</label>
                <select
                  value={selectedRoom?.id || ""}
                  onChange={(e) => setSelectedRoom(rooms.find(r => r.id === parseInt(e.target.value)) || null)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar habitación</option>
                  {BUILDINGS.map(building => (
                    <optgroup key={building.code} label={building.name}>
                      {groupedRooms[building.code]?.map(room => (
                        <option key={room.id} value={room.id}>{room.code} - {room.room_type} ({room.capacity} personas)</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1"><User className="w-4 h-4 inline mr-1" />Nombre del Huésped</label>
                <input type="text" value={formData.guest_name} onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1"><Phone className="w-4 h-4 inline mr-1" />Teléfono</label>
                <input type="tel" value={formData.guest_phone} onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1"><Mail className="w-4 h-4 inline mr-1" />Email (opcional)</label>
                <input type="email" value={formData.guest_email} onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Check-in</label>
                  <input type="date" value={formData.check_in_date} onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Check-out</label>
                  <input type="date" value={formData.check_out_date} onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })} min={formData.check_in_date} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Número de Huéspedes</label>
                <input type="number" min="1" max={selectedRoom?.capacity || 5} value={formData.num_guests} onChange={(e) => setFormData({ ...formData, num_guests: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1"><FileText className="w-4 h-4 inline mr-1" />Notas (opcional)</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent" rows={3} />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowNewReservation(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:opacity-90">Crear Reservación</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-6 border-t border-slate-200 mt-8">
        <p className="text-slate-400 text-sm">Tecnología desarrollada por <span className="font-semibold text-slate-500">Webmasterpro Entertainment Corporation</span></p>
        <p className="text-slate-400 text-sm">Smarth Eco Systems — <span className="text-cyan-600">Israel de Jesús</span></p>
      </div>
    </div>
  );
}
