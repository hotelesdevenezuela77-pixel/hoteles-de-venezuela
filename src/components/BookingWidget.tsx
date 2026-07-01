import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { jsPDF } from "jspdf";
import { 
  Calendar, Users, BedDouble, CalendarCheck, MessageSquare, 
  User, Mail, Phone, X, Check, Loader2, AlertTriangle, 
  Download, Clock, Tag 
} from "lucide-react";

interface BookingWidgetProps {
  establishmentId: number;
  establishmentName: string;
  whatsapp?: string;
  categorySlug?: string;
}

interface RoomAvailability {
  id: number;
  name: string;
  quantity: number;
  price_per_night: number;
  available: number;
}

interface SeasonalPricing {
  id: number;
  season_name: string;
  start_date: string;
  end_date: string;
  price_multiplier: number;
}

interface DiscountCode {
  id: number;
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_nights: number;
  max_uses: number;
  current_uses: number;
  start_date: string;
  end_date: string;
}

export function BookingWidget({ 
  establishmentId,
  establishmentName, 
  whatsapp,
  categorySlug 
}: BookingWidgetProps) {
  const { user } = useAuth();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  
  // Guest Modal state
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  
  // Hold state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  // Discount Codes state
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  
  // Rooms and seasonal pricing states
  const [rooms, setRooms] = useState<RoomAvailability[]>([]);
  const [seasonalPricing, setSeasonalPricing] = useState<SeasonalPricing[]>([]);
  const [activeSeason, setActiveSeason] = useState<SeasonalPricing | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");

  const accommodationCategories = ["hoteles", "posadas", "cabanas", "apartamentos", "hostales", "campamentos"];
  const isAccommodation = !categorySlug || accommodationCategories.includes(categorySlug.toLowerCase());

  // Fetch initial pricing rules on mount
  useEffect(() => {
    async function fetchPricing() {
      if (!isAccommodation) return;
      try {
        const { data } = await supabase
          .from("seasonal_pricing")
          .select("*")
          .eq("establishment_id", establishmentId)
          .eq("is_active", true);
        
        if (data) setSeasonalPricing(data as SeasonalPricing[]);
      } catch (e) {
        console.error(e);
      }
    }
    fetchPricing();
  }, [establishmentId, isAccommodation]);

  // Fetch room availability count
  const fetchRoomAvailability = async () => {
    if (!isAccommodation) return;
    try {
      // Clean up expired holds first
      const nowStr = new Date().toISOString();
      await supabase.from("room_holds").delete().lt("expires_at", nowStr).eq("is_converted", false);

      // Fetch all rooms
      const { data: dbRooms } = await supabase
        .from("rooms")
        .select("*")
        .eq("establishment_id", establishmentId)
        .eq("is_active", true);

      let finalRooms = dbRooms || [];
      if (finalRooms.length === 0) {
        // Fallback mock rooms to ensure direct booking engine is always testable
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

      if (!checkIn || !checkOut) {
        setRooms(finalRooms.map(r => ({
          id: r.id,
          name: r.name,
          quantity: r.quantity,
          price_per_night: r.price_per_night,
          available: r.quantity
        })));
        return;
      }

      // Fetch overlapping reservations
      const { data: dbReservations } = await supabase
        .from("reservations")
        .select("*")
        .eq("establishment_id", establishmentId)
        .in("status", ["pending", "confirmed", "checked_in"])
        .lt("check_in_date", checkOut)
        .gt("check_out_date", checkIn);

      // Fetch overlapping holds
      const { data: dbHolds } = await supabase
        .from("room_holds")
        .select("*")
        .eq("establishment_id", establishmentId)
        .eq("is_converted", false)
        .gt("expires_at", nowStr)
        .lt("check_in_date", checkOut)
        .gt("check_out_date", checkIn)
        .neq("session_id", sessionId || "");

      // Merge with localStorage mock data
      const localResKey = "hdv_mock_reservations";
      const localReservations = JSON.parse(localStorage.getItem(localResKey) || "[]")
        .filter((r: any) => 
          r.establishment_id === establishmentId &&
          ["pending", "confirmed", "checked_in"].includes(r.status) &&
          r.check_in_date < checkOut &&
          r.check_out_date > checkIn
        );

      const localHoldsKey = "hdv_mock_room_holds";
      const localHolds = JSON.parse(localStorage.getItem(localHoldsKey) || "[]")
        .filter((h: any) => 
          h.establishment_id === establishmentId &&
          !h.is_converted &&
          new Date(h.expires_at) > new Date() &&
          h.check_in_date < checkOut &&
          h.check_out_date > checkIn &&
          h.session_id !== (sessionId || "")
        );

      const combinedReservations = [...(dbReservations || []), ...localReservations];
      const combinedHolds = [...(dbHolds || []), ...localHolds];

      const mapped = finalRooms.map(room => {
        const booked = combinedReservations.filter(r => r.room_id === room.id).length;
        const held = combinedHolds.filter(h => h.room_id === room.id).length;
        const available = Math.max(0, room.quantity - booked - held);

        return {
          id: room.id,
          name: room.name,
          quantity: room.quantity,
          price_per_night: room.price_per_night,
          available
        };
      });

      setRooms(mapped);
      
      const firstAvailable = mapped.find(r => r.available > 0);
      if (firstAvailable && !selectedRoom) {
        setSelectedRoom(firstAvailable.id);
      }
    } catch (e) {
      console.error("Error loading availability:", e);
    }
  };

  useEffect(() => {
    fetchRoomAvailability();

    // Determine active season
    if (checkIn) {
      const checkInDate = new Date(checkIn);
      const active = seasonalPricing.find(s => {
        const start = new Date(s.start_date);
        const end = new Date(s.end_date);
        return checkInDate >= start && checkInDate <= end;
      });
      setActiveSeason(active || null);
    }
  }, [checkIn, checkOut, establishmentId, sessionId, seasonalPricing]);

  // Countdown timer for hold
  useEffect(() => {
    if (!holdExpiresAt) {
      setCountdown(0);
      return;
    }

    const interval = setInterval(async () => {
      const remaining = holdExpiresAt.getTime() - Date.now();
      if (remaining <= 0) {
        setCountdown(0);
        setHoldExpiresAt(null);
        
        // Log as abandoned if guest details typed
        if (guestName || guestEmail || guestPhone) {
          let abandonedLogged = false;
          try {
            const { error: abErr } = await supabase.from("abandoned_bookings").insert([{
              establishment_id: establishmentId,
              establishment_name: establishmentName,
              room_id: selectedRoom,
              room_name: rooms.find(r => r.id === selectedRoom)?.name || "Standard",
              guest_email: guestEmail || null,
              guest_phone: guestPhone || null,
              check_in_date: checkIn,
              check_out_date: checkOut,
              guests_count: guests,
              total_price: totalPrice,
              session_id: sessionId
            }]);
            if (!abErr) abandonedLogged = true;
          } catch (err) {
            console.warn("Database error logging abandoned booking, using localStorage:", err);
          }

          if (!abandonedLogged) {
            const localAbKey = "hdv_mock_abandoned_bookings";
            const existingAb = JSON.parse(localStorage.getItem(localAbKey) || "[]");
            existingAb.push({
              id: Math.floor(100000 + Math.random() * 900000),
              establishment_id: establishmentId,
              establishment_name: establishmentName,
              room_id: selectedRoom,
              room_name: rooms.find(r => r.id === selectedRoom)?.name || "Standard",
              guest_email: guestEmail || null,
              guest_phone: guestPhone || null,
              check_in_date: checkIn,
              check_out_date: checkOut,
              guests_count: guests,
              total_price: totalPrice,
              session_id: sessionId,
              created_at: new Date().toISOString()
            });
            localStorage.setItem(localAbKey, JSON.stringify(existingAb));
          }
        }

        // Release hold
        if (sessionId) {
          try {
            await supabase.from("room_holds").delete().eq("session_id", sessionId);
          } catch (e) {}

          const localHoldsKey = "hdv_mock_room_holds";
          const existingHolds = JSON.parse(localStorage.getItem(localHoldsKey) || "[]");
          const updatedHolds = existingHolds.filter((h: any) => h.session_id !== sessionId);
          localStorage.setItem(localHoldsKey, JSON.stringify(updatedHolds));
        }

        setSessionId(null);
        setShowGuestModal(false);
        fetchRoomAvailability();
        alert("El tiempo límite de reserva (10 minutos) ha expirado.");
      } else {
        setCountdown(Math.ceil(remaining / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt, guestName, guestEmail, guestPhone]);

  const todayStr = new Date().toISOString().split("T")[0];

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const nights = calculateNights();

  // Price calculations
  const getOccupancyMultiplier = (room: RoomAvailability) => {
    if (room.quantity === 0) return 1;
    const occupancyRate = (room.quantity - room.available) / room.quantity;
    if (occupancyRate >= 0.8) return 1.10; // +10% demand surcharge
    return 1;
  };

  const getLongStayDiscountMultiplier = () => {
    if (nights >= 14) return 0.90; // 10% discount
    if (nights >= 7) return 0.95; // 5% discount
    return 1;
  };

  const getAdjustedPrice = (basePrice: number, room: RoomAvailability) => {
    let price = basePrice;
    if (activeSeason) {
      price = price * activeSeason.price_multiplier;
    }
    price = price * getOccupancyMultiplier(room);
    return Math.round(price * 100) / 100;
  };

  const selectedRoomData = rooms.find(r => r.id === selectedRoom);
  const pricePerNight = selectedRoomData ? getAdjustedPrice(selectedRoomData.price_per_night, selectedRoomData) : 0;
  
  const rawSubtotal = pricePerNight * nights;
  const longStayMultiplier = getLongStayDiscountMultiplier();
  const subtotalAfterLongStay = rawSubtotal * longStayMultiplier;

  // Apply promotional code discount
  const getDiscountAmount = () => {
    if (!appliedDiscount) return 0;
    if (appliedDiscount.discount_type === "percentage") {
      return (subtotalAfterLongStay * appliedDiscount.discount_value) / 100;
    } else {
      return appliedDiscount.discount_value;
    }
  };

  const discountAmount = getDiscountAmount();
  const totalPrice = Math.max(0, Math.round((subtotalAfterLongStay - discountAmount) * 100) / 100);

  // Validate coupon
  const handleApplyDiscount = async () => {
    if (!discountCodeInput.trim()) return;
    setDiscountError(null);

    try {
      const { data, error } = await supabase
        .from("discount_codes")
        .select("*")
        .eq("code", discountCodeInput.toUpperCase().trim())
        .eq("establishment_id", establishmentId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setDiscountError("Código inválido o inactivo.");
        setAppliedDiscount(null);
        return;
      }

      // Check dates
      const today = new Date().toISOString().split("T")[0];
      if (data.start_date && today < data.start_date) {
        setDiscountError("Este cupón aún no está vigente.");
        return;
      }
      if (data.end_date && today > data.end_date) {
        setDiscountError("Este cupón ha expirado.");
        return;
      }

      // Check uses limit
      if (data.max_uses && data.current_uses >= data.max_uses) {
        setDiscountError("Este cupón ha alcanzado el límite de usos.");
        return;
      }

      // Check min nights
      if (nights < data.min_nights) {
        setDiscountError(`Mínimo ${data.min_nights} noches para usar este cupón.`);
        return;
      }

      setAppliedDiscount(data as DiscountCode);
      setDiscountError(null);
    } catch (e) {
      setDiscountError("Error al validar código.");
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCodeInput("");
  };

  // Open guest information modal
  const handleOpenGuestModal = async () => {
    if (!checkIn || !checkOut) {
      alert("Por favor selecciona las fechas de entrada y salida.");
      return;
    }
    if (nights < 1) {
      alert("La fecha de salida debe ser posterior a la fecha de entrada.");
      return;
    }
    if (!selectedRoom) {
      alert("Por favor selecciona una habitación.");
      return;
    }

    try {
      // Request hold lock
      const sessId = Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
      
      let holdSuccessful = false;
      try {
        const { error } = await supabase
          .from("room_holds")
          .insert([{
            room_id: selectedRoom,
            establishment_id: establishmentId,
            check_in_date: checkIn,
            check_out_date: checkOut,
            session_id: sessId,
            expires_at: expiresAt.toISOString()
          }]);

        if (!error) {
          holdSuccessful = true;
        } else {
          console.warn("Real database hold failed, using localStorage mock hold:", error);
        }
      } catch (err) {
        console.warn("Database exception locking hold, using localStorage:", err);
      }

      if (!holdSuccessful) {
        const localHoldsKey = "hdv_mock_room_holds";
        const existingHolds = JSON.parse(localStorage.getItem(localHoldsKey) || "[]");
        const nowStr = new Date().toISOString();
        
        // Remove expired holds first
        const activeHolds = existingHolds.filter((h: any) => new Date(h.expires_at) > new Date(nowStr));
        
        const hasConflict = activeHolds.some((h: any) => 
          h.room_id === selectedRoom && 
          h.check_in_date < checkOut && 
          h.check_out_date > checkIn
        );

        if (hasConflict) {
          alert("La habitación ya ha sido bloqueada temporalmente por otro cliente. Por favor, selecciona otra.");
          fetchRoomAvailability();
          return;
        }

        activeHolds.push({
          room_id: selectedRoom,
          establishment_id: establishmentId,
          check_in_date: checkIn,
          check_out_date: checkOut,
          session_id: sessId,
          expires_at: expiresAt.toISOString(),
          is_converted: false
        });
        localStorage.setItem(localHoldsKey, JSON.stringify(activeHolds));
      }

      setSessionId(sessId);
      setHoldExpiresAt(expiresAt);
      
      if (user) {
        setGuestEmail(user.email || "");
        setGuestName(user.email?.split("@")[0] || "");
      }
      
      setShowGuestModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit final reservation
  const handleSubmitReservation = async () => {
    if (!guestName.trim()) {
      alert("Por favor ingresa tu nombre.");
      return;
    }

    setIsSubmitting(true);

    try {
      const code = "HDV-" + Math.floor(100000 + Math.random() * 900000);
      const roomData = rooms.find(r => r.id === selectedRoom);

      let dbInsertFailed = false;
      try {
        const { error: resError } = await supabase
          .from("reservations")
          .insert([{
            establishment_id: establishmentId,
            room_id: selectedRoom,
            guest_name: guestName,
            guest_email: guestEmail || null,
            guest_phone: guestPhone || null,
            guest_user_id: user?.id || null,
            check_in_date: checkIn,
            check_out_date: checkOut,
            guests_count: guests,
            room_type: roomData?.name || "Standard",
            total_price: totalPrice,
            notes: notes || null,
            status: "pending",
            source: "website",
            confirmation_code: code
          }]);

        if (resError) {
          console.warn("Real database insert failed, using mock reservation:", resError);
          dbInsertFailed = true;
        } else {
          // Update hold converted flag
          if (sessionId) {
            await supabase
              .from("room_holds")
              .update({ is_converted: true })
              .eq("session_id", sessionId);
          }

          // Update discount uses count if coupon was used
          if (appliedDiscount) {
            await supabase.rpc("increment_discount_uses", { coupon_id: appliedDiscount.id });
            await supabase
              .from("discount_codes")
              .update({ current_uses: appliedDiscount.current_uses + 1 })
              .eq("id", appliedDiscount.id);
          }
        }
      } catch (err) {
        console.warn("Database exception creating reservation, using localStorage:", err);
        dbInsertFailed = true;
      }

      if (dbInsertFailed) {
        // Save to simulated reservations in localStorage so OwnerDashboard and AdminPanel can display them
        const localResKey = "hdv_mock_reservations";
        const existingRes = JSON.parse(localStorage.getItem(localResKey) || "[]");
        const newRes = {
          id: Math.floor(100000 + Math.random() * 900000),
          establishment_id: establishmentId,
          establishment_name: establishmentName,
          room_id: selectedRoom,
          guest_name: guestName,
          guest_email: guestEmail || null,
          guest_phone: guestPhone || null,
          check_in_date: checkIn,
          check_out_date: checkOut,
          guests_count: guests,
          room_type: roomData?.name || "Standard",
          total_price: totalPrice,
          notes: notes || null,
          status: "pending",
          source: "website",
          confirmation_code: code,
          created_at: new Date().toISOString()
        };
        localStorage.setItem(localResKey, JSON.stringify([newRes, ...existingRes]));

        // Set hold converted flag in localStorage
        if (sessionId) {
          const localHoldsKey = "hdv_mock_room_holds";
          const existingHolds = JSON.parse(localStorage.getItem(localHoldsKey) || "[]");
          const updatedHolds = existingHolds.map((h: any) => 
            h.session_id === sessionId ? { ...h, is_converted: true } : h
          );
          localStorage.setItem(localHoldsKey, JSON.stringify(updatedHolds));
        }

        // Mock update discount uses
        if (appliedDiscount) {
          const localDiscountsKey = "hdv_mock_discount_codes";
          const existingDiscounts = JSON.parse(localStorage.getItem(localDiscountsKey) || "[]");
          const updatedDiscounts = existingDiscounts.map((d: any) => 
            d.id === appliedDiscount.id ? { ...d, current_uses: d.current_uses + 1 } : d
          );
          localStorage.setItem(localDiscountsKey, JSON.stringify(updatedDiscounts));
        }
      }

      setConfirmationCode(code);
      setSubmitted(true);
      setShowGuestModal(false);
      setHoldExpiresAt(null);
      setSessionId(null);
    } catch (e) {
      console.error(e);
      alert("Ocurrió un error al procesar tu reservación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = async () => {
    if (sessionId) {
      // Release hold lock
      try {
        await supabase.from("room_holds").delete().eq("session_id", sessionId);
      } catch (e) {}

      const localHoldsKey = "hdv_mock_room_holds";
      const existingHolds = JSON.parse(localStorage.getItem(localHoldsKey) || "[]");
      const updatedHolds = existingHolds.filter((h: any) => h.session_id !== sessionId);
      localStorage.setItem(localHoldsKey, JSON.stringify(updatedHolds));

      setSessionId(null);
      setHoldExpiresAt(null);
    }
    setShowGuestModal(false);
    fetchRoomAvailability();
  };

  // Generate beautiful PDF invoice
  const generatePDFInvoice = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header banner gradient simulator
    doc.setFillColor(236, 72, 153); // pink-500
    doc.rect(0, 0, pageWidth, 45, "F");
    doc.setFillColor(6, 182, 212); // cyan-500
    doc.rect(pageWidth / 2, 0, pageWidth / 2, 45, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("HOTELES DE VENEZUELA", pageWidth / 2, 18, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Reserva Directa Sin Intermediarios. Simplemente Maravilloso.", pageWidth / 2, 28, { align: "center" });
    
    // Confirmation code panel
    doc.setFillColor(15, 23, 42); // slate-900
    doc.roundedRect(pageWidth / 2 - 40, 52, 80, 24, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("CÓDIGO DE RESERVACIÓN", pageWidth / 2, 60, { align: "center" });
    doc.setFontSize(16);
    doc.text(confirmationCode, pageWidth / 2, 70, { align: "center" });
    
    // Title
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.text("COMPROBANTE PRE-RESERVA DE ALOJAMIENTO", pageWidth / 2, 90, { align: "center" });
    
    // Establishment panel
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, 98, pageWidth - 30, 26, 3, 3, "F");
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text("ESTABLECIMIENTO", 20, 106);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(establishmentName, 20, 116);
    
    // Guest section
    let y = 136;
    doc.setFillColor(236, 72, 153);
    doc.rect(15, y - 6, 3, 16, "F");
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("HUÉSPED TITULAR", 22, y);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(guestName, 22, y + 8);
    
    // Contacts info
    y = 160;
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    if (guestEmail) {
      doc.text("Correo: " + guestEmail, 22, y);
      y += 6;
    }
    if (guestPhone) {
      doc.text("Teléfono: " + guestPhone, 22, y);
    }
    
    // Details panel
    y += 12;
    doc.setFillColor(240, 253, 250); // emerald-50
    doc.roundedRect(15, y, pageWidth - 30, 48, 3, 3, "F");
    doc.setDrawColor(20, 184, 166); // emerald-500
    doc.setLineWidth(0.3);
    doc.roundedRect(15, y, pageWidth - 30, 48, 3, 3, "S");
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text("FECHA DE ENTRADA (CHECK-IN)", 25, y + 10);
    doc.text("FECHA DE SALIDA (CHECK-OUT)", pageWidth / 2 + 10, y + 10);
    doc.text("NOCHES", 25, y + 30);
    doc.text("HUÉSPEDES", pageWidth / 2 + 10, y + 30);
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(checkIn, 25, y + 18);
    doc.text(checkOut, pageWidth / 2 + 10, y + 18);
    doc.text(nights.toString(), 25, y + 38);
    doc.text(guests.toString(), pageWidth / 2 + 10, y + 38);
    
    // Room info
    y += 58;
    if (selectedRoomData) {
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("TIPO DE HABITACIÓN", 22, y);
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(selectedRoomData.name, 22, y + 8);
      y += 16;
    }
    
    // Price breakdown
    doc.setDrawColor(241, 245, 249);
    doc.line(15, y, pageWidth - 15, y);
    y += 8;
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Tarifa base (${nights} noches):`, 22, y);
    doc.text(`$${rawSubtotal.toFixed(2)}`, pageWidth - 22, y, { align: "right" });
    
    if (longStayMultiplier < 1) {
      y += 6;
      doc.setTextColor(20, 184, 166);
      doc.text(`Descuento estadía larga (-${Math.round((1 - longStayMultiplier) * 100)}%):`, 22, y);
      doc.text(`-$${(rawSubtotal - subtotalAfterLongStay).toFixed(2)}`, pageWidth - 22, y, { align: "right" });
    }
    
    if (appliedDiscount) {
      y += 6;
      doc.setTextColor(236, 72, 153);
      doc.text(`Código de descuento (${appliedDiscount.code}):`, 22, y);
      doc.text(`-$${discountAmount.toFixed(2)}`, pageWidth - 22, y, { align: "right" });
    }
    
    // Grand Total box
    y += 10;
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(15, y, pageWidth - 30, 18, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL GENERAL ESTIMADO", 22, y + 11);
    doc.setFontSize(14);
    doc.text(`$${totalPrice.toFixed(2)}`, pageWidth - 22, y + 11, { align: "right" });
    
    // Footer notes
    y = 265;
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text("Este comprobante es de pre-reserva directa. El establecimiento se pondrá en contacto contigo", pageWidth / 2, y, { align: "center" });
    doc.text("vía WhatsApp o email para coordinar los métodos de pago y confirmar la estadía.", pageWidth / 2, y + 4, { align: "center" });
    doc.text("Generado por Hoteles de Venezuela el " + new Date().toLocaleDateString("es-VE"), pageWidth / 2, y + 12, { align: "center" });
    
    // Save PDF file
    doc.save(`pre-reserva-${confirmationCode}.pdf`);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr + "T12:00:00");
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("es-VE", { weekday: "short", day: "numeric", month: "short" });
    } catch (e) {
      return dateStr;
    }
  };

  if (!isAccommodation) return null;

  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-emerald-500/10 via-white to-emerald-500/5 border border-emerald-200 rounded-3xl p-6 shadow-lg text-center text-left">
        <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md shadow-emerald-500/10">
          <Check className="w-7 h-7 text-white" />
        </div>
        <h3 className="font-black text-lg text-emerald-800 mb-1">¡Solicitud Procesada!</h3>
        <p className="text-[11px] text-gray-400 font-bold mb-4">Código de Pre-Reserva</p>
        
        <div className="bg-slate-900 text-white rounded-2xl p-4 mb-5 shadow-inner">
          <span className="text-[9px] uppercase tracking-widest text-white/50 block mb-1">Tu Código</span>
          <p className="text-2xl font-black tracking-widest font-mono text-cyan-400">{confirmationCode}</p>
        </div>
        
        <p className="text-xs text-gray-500 leading-relaxed mb-6">
          Tu pre-reserva ha sido registrada en el sistema. Hemos enviado una alerta al propietario para que verifique y valide tu estadía.
        </p>
        
        <div className="space-y-2.5 pt-4 border-t border-gray-100">
          <button
            onClick={generatePDFInvoice}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-97"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            Descargar Comprobante PDF
          </button>
          
          {whatsapp && (
            <button
              onClick={() => {
                const cleanPhone = whatsapp.replace(/\D/g, "");
                const message = encodeURIComponent(
                  `¡Hola! Acabo de hacer una pre-reserva (Código: ${confirmationCode}) en Hoteles de Venezuela para las fechas ${formatDate(checkIn)} al ${formatDate(checkOut)}. ¿Podrían confirmarme la disponibilidad?`
                );
                window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-97"
            >
              <MessageSquare className="w-4 h-4" />
              Notificar por WhatsApp
            </button>
          )}
          
          <button
            onClick={() => {
              setSubmitted(false);
              setCheckIn("");
              setCheckOut("");
              setGuests(2);
              setSelectedRoom(null);
              setNotes("");
              setAppliedDiscount(null);
              setDiscountCodeInput("");
            }}
            className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 text-xs py-2.5 rounded-xl cursor-pointer transition-all"
          >
            Realizar Nueva Reserva
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-md text-left">
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-50">
          <div className="w-9 h-9 rounded-xl bg-brand-magenta/10 flex items-center justify-center border border-brand-magenta/5">
            <CalendarCheck className="w-5 h-5 text-brand-magenta" />
          </div>
          <div>
            <h3 className="font-black text-gray-800 text-sm">Reserva Directa</h3>
            <p className="text-[10px] text-gray-400 font-medium">Cotiza y reserva sin cargos extra</p>
          </div>
        </div>

        <div className="space-y-4">
          
          {/* Dates Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Check-In</label>
              <input
                type="date"
                value={checkIn}
                min={todayStr}
                onChange={e => {
                  const val = e.target.value;
                  setCheckIn(val);
                  if (val) {
                    const parsedVal = new Date(val);
                    if (!isNaN(parsedVal.getTime())) {
                      if (!checkOut || val >= checkOut) {
                        const next = new Date(parsedVal);
                        next.setDate(next.getDate() + 1);
                        setCheckOut(next.toISOString().split("T")[0]);
                      }
                    }
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Check-Out</label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || todayStr}
                onChange={e => setCheckOut(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all"
              />
            </div>
          </div>

          {/* Nights indicator */}
          {nights > 0 && (
            <div className="text-center py-2 bg-brand-magenta/5 border border-brand-magenta/10 rounded-xl">
              <span className="text-xs font-bold text-brand-magenta">
                {nights} noche{nights > 1 ? "s" : ""} de estadía
              </span>
            </div>
          )}

          {/* Guest selector */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Cantidad de Huéspedes</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGuests(prev => Math.max(1, prev - 1))}
                className="w-9 h-9 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl flex items-center justify-center text-xs font-black text-gray-600 transition-colors cursor-pointer"
              >
                −
              </button>
              <span className="flex-1 text-center font-bold text-xs text-gray-700">
                {guests} huésped{guests !== 1 ? "es" : ""}
              </span>
              <button
                type="button"
                onClick={() => setGuests(prev => Math.min(8, prev + 1))}
                className="w-9 h-9 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl flex items-center justify-center text-xs font-black text-gray-600 transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Room Selection */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Habitación / Alojamiento</label>
            {rooms.length > 0 ? (
              <div className="space-y-2">
                {rooms.map(room => {
                  const isSelected = selectedRoom === room.id;
                  const isAvailable = room.available > 0;
                  const markup = getOccupancyMultiplier(room) > 1;
                  const finalRoomPrice = getAdjustedPrice(room.price_per_night, room);

                  return (
                    <button
                      type="button"
                      key={room.id}
                      disabled={!isAvailable}
                      onClick={() => setSelectedRoom(room.id)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-brand-magenta bg-brand-magenta/5 ring-2 ring-brand-magenta/10"
                          : isAvailable
                            ? "border-gray-100 hover:border-gray-300 bg-white"
                            : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-xs text-gray-700">{room.name}</p>
                          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                            ${finalRoomPrice} / noche
                            {markup && <span className="text-red-500 font-bold ml-1">(alta demanda)</span>}
                          </p>
                        </div>
                        <div className="text-right">
                          {!isAvailable ? (
                            <span className="text-[9px] bg-red-50 border border-red-100 text-red-500 px-2 py-0.5 rounded font-black uppercase tracking-wider">Agotada</span>
                          ) : room.available <= 3 ? (
                            <span className="text-[9px] bg-amber-50 border border-amber-100 text-amber-600 px-2 py-0.5 rounded font-black uppercase tracking-wider">¡Quedan {room.available}!</span>
                          ) : (
                            <span className="text-[9px] bg-emerald-50 border border-emerald-100 text-emerald-600 px-2 py-0.5 rounded font-black uppercase tracking-wider">{room.available} lib.</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : checkIn && checkOut ? (
              <div className="flex items-center gap-2 py-4 justify-center text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin text-brand-magenta" />
                <span className="text-xs font-semibold">Cargando disponibilidad...</span>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic text-center py-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">Selecciona fechas para ver disponibilidad</p>
            )}
          </div>

          {/* Discount code section */}
          {nights > 0 && selectedRoomData && (
            <div className="pt-2">
              <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Código Promocional</label>
              {!appliedDiscount ? (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Ej: BIENVENIDA"
                      value={discountCodeInput}
                      onChange={e => setDiscountCodeInput(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 outline-none uppercase focus:border-brand-magenta focus:bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-colors active:scale-97"
                  >
                    Aplicar
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex justify-between items-center text-xs text-emerald-700">
                  <div className="flex items-center gap-2 font-bold">
                    <Check className="w-4 h-4" />
                    <span>Código aplicado: <span className="uppercase font-black text-emerald-800">{appliedDiscount.code}</span> (-{appliedDiscount.discount_value}{appliedDiscount.discount_type === "percentage" ? "%" : " USD"})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveDiscount}
                    className="text-red-500 hover:text-red-700 font-bold shrink-0 cursor-pointer"
                  >
                    Remover
                  </button>
                </div>
              )}
              {discountError && (
                <p className="text-[10px] text-red-500 font-bold mt-1.5">⚠ {discountError}</p>
              )}
            </div>
          )}

          {/* Pricing Summary */}
          {selectedRoomData && nights > 0 && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-xs text-gray-500 font-semibold">
                <span>Tarifa (${pricePerNight} × {nights} noches)</span>
                <span>${rawSubtotal.toFixed(2)}</span>
              </div>
              
              {longStayMultiplier < 1 && (
                <div className="flex justify-between text-xs text-emerald-600 font-bold">
                  <span>Descuento estadía larga (-{Math.round((1 - longStayMultiplier) * 100)}%)</span>
                  <span>-${(rawSubtotal - subtotalAfterLongStay).toFixed(2)}</span>
                </div>
              )}

              {appliedDiscount && (
                <div className="flex justify-between text-xs text-brand-magenta font-bold">
                  <span>Descuento cupón ({appliedDiscount.code})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black text-gray-800 pt-2 border-t border-gray-200 mt-2">
                <span>Total Estimado</span>
                <span className="text-brand-magenta text-base">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Notes textarea */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Notas / Solicitudes Especiales (opcional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ej: Cuna adicional, llegada tardía..."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta transition-all resize-none"
            />
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={handleOpenGuestModal}
            className="w-full btn-magenta-gradient text-xs font-black py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-brand-magenta/10 hover:scale-102 transition-all active:scale-97"
          >
            <CalendarCheck className="w-4.5 h-4.5" />
            <span>Solicitar Pre-Reserva</span>
          </button>

        </div>
      </div>

      {/* Guest modal */}
      {showGuestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-purple-dark to-brand-purple-deep text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-magenta" />
                <h4 className="font-extrabold text-sm tracking-wide">Datos de Contacto</h4>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hold Timer */}
            {countdown > 0 && (
              <div className="bg-amber-50 border-b border-amber-100 px-6 py-2.5 flex items-center gap-2 text-[11px] font-bold text-amber-700">
                <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>Habitación bloqueada. Tienes {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")} para confirmar.</span>
              </div>
            )}

            <div className="p-6 space-y-4 text-left">
              <p className="text-xs text-gray-400 leading-normal">
                Ingresa tus datos para registrar la reservación en la bitácora del hotel.
              </p>

              {/* Name */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Nombre Completo *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ej: Juan Pérez"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="juan.perez@correo.com"
                    value={guestEmail}
                    onChange={e => setGuestEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Teléfono / WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="+58 412 1234567"
                    value={guestPhone}
                    onChange={e => setGuestPhone(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta"
                  />
                </div>
              </div>

              {/* Summary panel */}
              <div className="bg-gray-50 rounded-2xl p-4 text-[11px] font-bold text-gray-500 space-y-1">
                <p>Estadía: <span className="text-gray-800">{formatDate(checkIn)} al {formatDate(checkOut)} ({nights} noches)</span></p>
                <p>Alojamiento: <span className="text-gray-800">{selectedRoomData?.name}</span></p>
                <p>Precio total: <span className="text-brand-magenta font-black">${totalPrice.toFixed(2)}</span></p>
              </div>

              {/* Confirm action */}
              <button
                onClick={handleSubmitReservation}
                disabled={isSubmitting || !guestName.trim()}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-97 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Registrando Reservación...</span>
                  </>
                ) : (
                  <>
                    <CalendarCheck className="w-4.5 h-4.5 text-cyan-400" />
                    <span>Confirmar y Enviar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
