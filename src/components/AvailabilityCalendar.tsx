import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, X, Loader2 } from "lucide-react";

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
}

interface AvailabilityCalendarProps {
  establishmentId: number;
  establishmentName?: string;
}

export function AvailabilityCalendar({ establishmentId }: AvailabilityCalendarProps) {
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [rooms, setRooms] = useState<{ id: number; name: string }[]>([]);

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      setError(null);

      // Start & end date of the month
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const startDateStr = startOfMonth.toISOString().split("T")[0];
      const endDateStr = endOfMonth.toISOString().split("T")[0];

      // 1. Fetch rooms
      const { data: dbRooms, error: roomsErr } = await supabase
        .from("rooms")
        .select("*")
        .eq("establishment_id", establishmentId)
        .eq("is_active", true);

      if (roomsErr) throw roomsErr;
      
      let finalRooms = dbRooms || [];
      if (finalRooms.length === 0) {
        // Fallback mock rooms to ensure direct booking calendar is always testable
        finalRooms = [
          {
            id: 1001,
            establishment_id: establishmentId,
            name: "Habitación Matrimonial Standard",
            price_per_night: 80,
            quantity: 5,
            is_active: true
          },
          {
            id: 1002,
            establishment_id: establishmentId,
            name: "Suite Premium Vista al Mar",
            price_per_night: 150,
            quantity: 3,
            is_active: true
          },
          {
            id: 1003,
            establishment_id: establishmentId,
            name: "Presidential Suite Familiar",
            price_per_night: 280,
            quantity: 2,
            is_active: true
          }
        ];
      }

      const mappedRooms = finalRooms.map(r => ({ id: r.id, name: r.name, quantity: r.quantity, price: r.price_per_night }));
      setRooms(mappedRooms);
      if (!selectedRoom && mappedRooms.length > 0) {
        setSelectedRoom(mappedRooms[0].id);
      }

      // 2. Fetch reservations
      const { data: dbReservations, error: resErr } = await supabase
        .from("reservations")
        .select("*")
        .eq("establishment_id", establishmentId)
        .in("status", ["pending", "confirmed", "checked_in"])
        .lte("check_in_date", endDateStr)
        .gte("check_out_date", startDateStr);

      if (resErr) throw resErr;

      // Merge with localStorage mock reservations
      const localResKey = "hdv_mock_reservations";
      const localReservations = JSON.parse(localStorage.getItem(localResKey) || "[]")
        .filter((r: any) => 
          r.establishment_id === establishmentId &&
          ["pending", "confirmed", "checked_in"].includes(r.status) &&
          r.check_in_date <= endDateStr &&
          r.check_out_date >= startDateStr
        );

      const combinedReservations = [...(dbReservations || []), ...localReservations];

      // 3. Fetch seasonal pricing
      const { data: dbSeasons, error: seasonsErr } = await supabase
        .from("seasonal_pricing")
        .select("*")
        .eq("establishment_id", establishmentId)
        .eq("is_active", true);

      if (seasonsErr) throw seasonsErr;

      // Build Calendar data day by day
      const tempCalendar: CalendarDay[] = [];
      const currentDate = new Date(startOfMonth);
      const end = new Date(endOfMonth);

      while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split("T")[0];
        
        // Find season multiplier
        const activeSeason = (dbSeasons || []).find(s => {
          return dateStr >= s.start_date && dateStr <= s.end_date;
        });

        const multiplier = activeSeason ? activeSeason.price_multiplier : 1.0;
        const seasonName = activeSeason ? activeSeason.season_name : undefined;

        const roomsData = finalRooms.map(room => {
          // Count active reservations for this day
          const bookedCount = (combinedReservations || []).filter(r => {
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
          has_availability: roomsData.some(r => r.is_available),
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
  }, [establishmentId, currentMonth]);

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
    
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      grid.push(null);
    }
    
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = calendar.find(d => d.date === dateStr);
      grid.push(dayData || {
        date: dateStr,
        rooms: [],
        has_availability: false
      });
    }
    
    return grid;
  };

  const getRoomAvailability = (day: CalendarDay | null) => {
    if (!day || !selectedRoom) return null;
    return day.rooms.find(r => r.room_id === selectedRoom);
  };

  const today = new Date().toISOString().split("T")[0];

  if (error) {
    return (
      <div className="bg-white rounded-3xl border border-red-100 p-6 text-center shadow-sm">
        <CalendarIcon className="w-12 h-12 text-red-300 mx-auto mb-3" />
        <p className="text-red-500 text-xs font-bold leading-normal">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm text-left">
      {/* Header */}
      <div className="bg-gray-50/50 p-5 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-magenta/10 flex items-center justify-center border border-brand-magenta/5">
              <CalendarIcon className="w-5 h-5 text-brand-magenta" />
            </div>
            <div>
              <h3 className="font-black text-gray-800 text-sm">Calendario de Disponibilidad</h3>
              <p className="text-[10px] text-gray-400 font-medium">Verifica tarifas y plazas libres</p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-center">
            <button 
              onClick={prevMonth} 
              className="w-8 h-8 hover:bg-gray-100 border border-gray-200 text-gray-500 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-extrabold text-xs text-gray-700 min-w-[120px] text-center">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button 
              onClick={nextMonth} 
              className="w-8 h-8 hover:bg-gray-100 border border-gray-200 text-gray-500 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Room type selector */}
        {rooms.length > 1 && (
          <div className="flex gap-1.5 flex-wrap">
            {rooms.map(room => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedRoom === room.id
                    ? "bg-brand-magenta text-white shadow-sm"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-500"
                }`}
              >
                {room.name}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Calendar grid */}
      <div className="p-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-magenta" />
          </div>
        ) : (
          <>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-[10px] font-black uppercase text-gray-400 py-1">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {getCalendarGrid().map((day, index) => {
                if (!day) {
                  return <div key={index} className="aspect-square" />;
                }
                
                const roomData = getRoomAvailability(day);
                const isPast = day.date < today;
                const isToday = day.date === today;
                const hasAvailability = roomData?.is_available;
                
                return (
                  <div
                    key={index}
                    className={`aspect-square p-1.5 rounded-2xl border transition-all ${
                      isPast 
                        ? "bg-gray-100/50 border-transparent opacity-40 select-none" 
                        : hasAvailability
                          ? "bg-emerald-50/40 border-emerald-100/50 hover:bg-emerald-50"
                          : "bg-red-50/40 border-red-100/50 hover:bg-red-50"
                    } ${isToday ? "ring-2 ring-brand-magenta bg-white border-brand-magenta" : ""}`}
                  >
                    <div className="h-full flex flex-col justify-between text-left">
                      <span className={`text-[10px] font-black ${isToday ? "text-brand-magenta" : isPast ? "text-gray-400" : "text-gray-500"}`}>
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
                          <span className="text-[9px] text-gray-500 font-black mt-0.5">
                            ${roomData.price}
                          </span>
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
        <div className="flex items-center justify-center gap-6 mt-6 pt-5 border-t border-gray-50 text-[10px] font-bold">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <div className="w-4 h-4 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-emerald-500" />
            </div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-500">
            <div className="w-4 h-4 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
              <X className="w-2.5 h-2.5 text-red-400" />
            </div>
            <span>Agotado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
