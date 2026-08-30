import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";

const app = new Hono<{ Bindings: Env }>();

// Admin session cookie name
const ADMIN_SESSION_COOKIE = "admin_session_token";

// Simple admin auth middleware (works alongside Google auth)
const adminOrUserMiddleware = async (c: any, next: any) => {
  // First check for admin session
  const adminToken = getCookie(c, ADMIN_SESSION_COOKIE);
  if (adminToken) {
    // Verify admin token (simple check - token should contain valid hash)
    const [timestamp, hash] = adminToken.split(".");
    if (timestamp && hash) {
      const expectedHash = btoa(`admin-${timestamp}-${(c.env as any).ADMIN_PASSWORD || ""}`).substring(0, 20);
      if (hash === expectedHash) {
        c.set("user", { id: "admin", email: "admin@posadaperlanegra.com" });
        return next();
      }
    }
  }
  
  // Fall back to Google auth
  return authMiddleware(c, next);
};

// =====================
// ADMIN AUTH API
// =====================

app.post("/api/auth/login", async (c) => {
  const body = await c.req.json();
  const { email, password } = body;

  // Check admin credentials
  const adminEmail = "admin@posadaperlanegra.com";
  const adminPassword = (c.env as any).ADMIN_PASSWORD;

  if (!adminPassword) {
    return c.json({ error: "Autenticación no configurada" }, 500);
  }

  if (email !== adminEmail || password !== adminPassword) {
    return c.json({ error: "Credenciales incorrectas" }, 401);
  }

  // Create simple session token
  const timestamp = Date.now().toString();
  const hash = btoa(`admin-${timestamp}-${adminPassword}`).substring(0, 20);
  const sessionToken = `${timestamp}.${hash}`;

  setCookie(c, ADMIN_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return c.json({ 
    success: true, 
    user: { id: "admin", email: "admin@posadaperlanegra.com" } 
  }, 200);
});

// Check admin session
app.get("/api/auth/me", async (c) => {
  const adminToken = getCookie(c, ADMIN_SESSION_COOKIE);
  
  if (adminToken) {
    const [timestamp, hash] = adminToken.split(".");
    if (timestamp && hash) {
      const expectedHash = btoa(`admin-${timestamp}-${(c.env as any).ADMIN_PASSWORD || ""}`).substring(0, 20);
      if (hash === expectedHash) {
        return c.json({ id: "admin", email: "admin@posadaperlanegra.com" });
      }
    }
  }
  
  return c.json({ error: "No autenticado" }, 401);
});

// Admin logout
app.post("/api/auth/logout", async (c) => {
  setCookie(c, ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true });
});

// =====================
// ROOMS API
// =====================

app.get("/api/rooms", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM rooms WHERE is_active = 1 ORDER BY code"
  ).all();
  return c.json(results);
});

// =====================
// AVAILABILITY & INVENTORY API
// =====================

// Helper: Generate confirmation code
const generateConfirmationCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'APM-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Helper: Get dates between two dates
const getDatesBetween = (start: string, end: string): string[] => {
  const dates: string[] = [];
  const current = new Date(start);
  const endDate = new Date(end);
  while (current < endDate) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

// Public: Check availability for a date range
app.get("/api/availability", async (c) => {
  const checkIn = c.req.query("check_in");
  const checkOut = c.req.query("check_out");
  const roomType = c.req.query("room_type");

  if (!checkIn || !checkOut) {
    return c.json({ error: "check_in and check_out are required" }, 400);
  }

  // Get all active rooms, optionally filtered by type
  let roomsSql = "SELECT * FROM rooms WHERE is_active = 1";
  if (roomType) {
    roomsSql += ` AND room_type = '${roomType}'`;
  }
  const { results: rooms } = await c.env.DB.prepare(roomsSql).all();

  // Get all dates in the range
  const dates = getDatesBetween(checkIn, checkOut);
  
  // Check inventory for blocked dates
  const { results: blockedInventory } = await c.env.DB.prepare(`
    SELECT room_id, inventory_date FROM room_inventory 
    WHERE inventory_date >= ? AND inventory_date < ?
    AND (is_available = 0 OR is_blocked = 1)
  `).bind(checkIn, checkOut).all();

  // Check existing reservations that overlap
  const { results: existingReservations } = await c.env.DB.prepare(`
    SELECT room_id, check_in_date, check_out_date FROM reservations
    WHERE status IN ('pending', 'confirmed', 'checked_in')
    AND check_in_date < ? AND check_out_date > ?
    AND (expires_at IS NULL OR expires_at > datetime('now'))
  `).bind(checkOut, checkIn).all();

  // Build set of unavailable room IDs
  const unavailableRoomIds = new Set<number>();
  
  // Add rooms blocked in inventory
  blockedInventory.forEach((inv: any) => {
    unavailableRoomIds.add(inv.room_id);
  });

  // Add rooms with existing reservations
  existingReservations.forEach((res: any) => {
    unavailableRoomIds.add(res.room_id);
  });

  // Filter available rooms
  const availableRooms = rooms.filter((room: any) => !unavailableRoomIds.has(room.id));

  // Get pricing for the dates
  const { results: pricing } = await c.env.DB.prepare(`
    SELECT * FROM seasonal_pricing
    WHERE is_active = 1
    AND start_date <= ? AND end_date >= ?
  `).bind(checkOut, checkIn).all();

  return c.json({
    check_in: checkIn,
    check_out: checkOut,
    nights: dates.length,
    available_rooms: availableRooms,
    total_rooms: rooms.length,
    pricing: pricing
  });
});

// Public: Create a reservation hold (blocks room for 15 minutes until payment)
app.post("/api/reservations/hold", async (c) => {
  const body = await c.req.json();
  const { room_id, guest_name, guest_phone, guest_email, check_in_date, check_out_date, num_guests } = body;

  if (!room_id || !check_in_date || !check_out_date || !guest_name) {
    return c.json({ error: "room_id, check_in_date, check_out_date, and guest_name are required" }, 400);
  }

  // Verify room is still available
  const { results: conflicts } = await c.env.DB.prepare(`
    SELECT id FROM reservations
    WHERE room_id = ?
    AND status IN ('pending', 'confirmed', 'checked_in')
    AND check_in_date < ? AND check_out_date > ?
    AND (expires_at IS NULL OR expires_at > datetime('now'))
  `).bind(room_id, check_out_date, check_in_date).all();

  if (conflicts.length > 0) {
    return c.json({ error: "Room is no longer available for these dates" }, 409);
  }

  // Check inventory blocks
  const { results: blocked } = await c.env.DB.prepare(`
    SELECT id FROM room_inventory
    WHERE room_id = ?
    AND inventory_date >= ? AND inventory_date < ?
    AND (is_available = 0 OR is_blocked = 1)
  `).bind(room_id, check_in_date, check_out_date).all();

  if (blocked.length > 0) {
    return c.json({ error: "Room is blocked for some of these dates" }, 409);
  }

  // Create or find guest
  let guestId: number;
  const existingGuest = await c.env.DB.prepare(
    "SELECT id FROM guests WHERE phone = ?"
  ).bind(guest_phone).first();

  if (existingGuest) {
    guestId = existingGuest.id as number;
    await c.env.DB.prepare(
      "UPDATE guests SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(guest_name, guest_email || null, guestId).run();
  } else {
    const result = await c.env.DB.prepare(
      "INSERT INTO guests (name, phone, email) VALUES (?, ?, ?)"
    ).bind(guest_name, guest_phone || '', guest_email || null).run();
    guestId = result.meta.last_row_id as number;
  }

  // Generate confirmation code and expiry (15 minutes)
  const confirmationCode = generateConfirmationCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  // Create reservation with hold status
  const result = await c.env.DB.prepare(`
    INSERT INTO reservations (
      room_id, guest_id, check_in_date, check_out_date, num_guests,
      status, payment_status, confirmation_code, expires_at
    )
    VALUES (?, ?, ?, ?, ?, 'pending', 'awaiting_payment', ?, ?)
  `).bind(
    room_id, guestId, check_in_date, check_out_date, num_guests || 1,
    confirmationCode, expiresAt
  ).run();

  // Block dates in inventory
  const dates = getDatesBetween(check_in_date, check_out_date);
  for (const date of dates) {
    await c.env.DB.prepare(`
      INSERT INTO room_inventory (room_id, inventory_date, is_available, reservation_id)
      VALUES (?, ?, 0, ?)
    `).bind(room_id, date, result.meta.last_row_id).run();
  }

  return c.json({
    success: true,
    reservation_id: result.meta.last_row_id,
    confirmation_code: confirmationCode,
    expires_at: expiresAt,
    expires_in_minutes: 15
  });
});

// Auto-release expired reservations (can be called by cron or admin)
app.post("/api/reservations/release-expired", async (c) => {
  // Find expired pending reservations
  const { results: expired } = await c.env.DB.prepare(`
    SELECT id, room_id, check_in_date, check_out_date FROM reservations
    WHERE status = 'pending'
    AND payment_status = 'awaiting_payment'
    AND expires_at IS NOT NULL
    AND expires_at < datetime('now')
  `).all();

  let releasedCount = 0;

  for (const reservation of expired as any[]) {
    // Update reservation status to expired
    await c.env.DB.prepare(`
      UPDATE reservations 
      SET status = 'cancelled', 
          cancellation_reason = 'auto_expired',
          cancelled_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(reservation.id).run();

    // Release inventory
    await c.env.DB.prepare(`
      DELETE FROM room_inventory WHERE reservation_id = ?
    `).bind(reservation.id).run();

    releasedCount++;
  }

  return c.json({
    success: true,
    released_count: releasedCount,
    checked_at: new Date().toISOString()
  });
});

// Admin: Manually block/unblock dates
app.post("/api/inventory/block", adminOrUserMiddleware, async (c) => {
  const body = await c.req.json();
  const { room_id, start_date, end_date, reason, is_blocked } = body;

  const dates = getDatesBetween(start_date, end_date);
  
  for (const date of dates) {
    // Check if entry exists
    const existing = await c.env.DB.prepare(`
      SELECT id FROM room_inventory WHERE room_id = ? AND inventory_date = ?
    `).bind(room_id, date).first();

    if (existing) {
      await c.env.DB.prepare(`
        UPDATE room_inventory 
        SET is_blocked = ?, blocked_reason = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(is_blocked ? 1 : 0, reason || null, existing.id).run();
    } else if (is_blocked) {
      await c.env.DB.prepare(`
        INSERT INTO room_inventory (room_id, inventory_date, is_available, is_blocked, blocked_reason)
        VALUES (?, ?, 1, 1, ?)
      `).bind(room_id, date, reason || null).run();
    }
  }

  return c.json({ success: true, dates_affected: dates.length });
});

// Admin: Get inventory for a month
app.get("/api/inventory", adminOrUserMiddleware, async (c) => {
  const month = c.req.query("month");
  const year = c.req.query("year");
  const roomId = c.req.query("room_id");

  let sql = `
    SELECT ri.*, r.code as room_code, r.room_type
    FROM room_inventory ri
    JOIN rooms r ON ri.room_id = r.id
    WHERE 1=1
  `;

  if (month && year) {
    const startDate = `${year}-${month.padStart(2, "0")}-01`;
    const endDate = `${year}-${month.padStart(2, "0")}-31`;
    sql += ` AND ri.inventory_date >= '${startDate}' AND ri.inventory_date <= '${endDate}'`;
  }

  if (roomId) {
    sql += ` AND ri.room_id = ${roomId}`;
  }

  sql += " ORDER BY ri.inventory_date, r.code";

  const { results } = await c.env.DB.prepare(sql).all();
  return c.json(results);
});

// =====================
// RESERVATIONS API
// =====================

app.get("/api/reservations", adminOrUserMiddleware, async (c) => {
  const month = c.req.query("month");
  const year = c.req.query("year");

  let sql = `
    SELECT r.*, g.name as guest_name, g.phone as guest_phone, g.email as guest_email
    FROM reservations r
    LEFT JOIN guests g ON r.guest_id = g.id
    WHERE r.status != 'cancelled'
  `;

  if (month && year) {
    const startDate = `${year}-${month.padStart(2, "0")}-01`;
    const endDate = `${year}-${month.padStart(2, "0")}-31`;
    sql += ` AND (
      (r.check_in_date >= '${startDate}' AND r.check_in_date <= '${endDate}')
      OR (r.check_out_date >= '${startDate}' AND r.check_out_date <= '${endDate}')
      OR (r.check_in_date <= '${startDate}' AND r.check_out_date >= '${endDate}')
    )`;
  }

  sql += " ORDER BY r.check_in_date";

  const { results } = await c.env.DB.prepare(sql).all();
  return c.json(results);
});

app.post("/api/reservations", adminOrUserMiddleware, async (c) => {
  const body = await c.req.json();
  const { room_id, guest_name, guest_phone, guest_email, check_in_date, check_out_date, num_guests, notes } = body;

  // Create or find guest
  let guestId: number;
  
  const existingGuest = await c.env.DB.prepare(
    "SELECT id FROM guests WHERE phone = ?"
  ).bind(guest_phone).first();

  if (existingGuest) {
    guestId = existingGuest.id as number;
    // Update guest info
    await c.env.DB.prepare(
      "UPDATE guests SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(guest_name, guest_email || null, guestId).run();
  } else {
    const result = await c.env.DB.prepare(
      "INSERT INTO guests (name, phone, email) VALUES (?, ?, ?)"
    ).bind(guest_name, guest_phone, guest_email || null).run();
    guestId = result.meta.last_row_id as number;
  }

  // Create reservation
  const result = await c.env.DB.prepare(`
    INSERT INTO reservations (room_id, guest_id, check_in_date, check_out_date, num_guests, status, notes)
    VALUES (?, ?, ?, ?, ?, 'pending', ?)
  `).bind(room_id, guestId, check_in_date, check_out_date, num_guests, notes || null).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

app.patch("/api/reservations/:id", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { status } = body;

  await c.env.DB.prepare(
    "UPDATE reservations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(status, id).run();

  return c.json({ success: true });
});

// Register payment for a reservation and create financial transaction
app.post("/api/reservations/:id/payments", adminOrUserMiddleware, async (c) => {
  const reservationId = c.req.param("id");
  const body = await c.req.json();
  const { amount, payment_method, reference_number, notes } = body;

  // Get reservation details
  const reservation = await c.env.DB.prepare(`
    SELECT r.*, g.name as guest_name, rm.code as room_code, rm.room_type
    FROM reservations r
    LEFT JOIN guests g ON r.guest_id = g.id
    LEFT JOIN rooms rm ON r.room_id = rm.id
    WHERE r.id = ?
  `).bind(reservationId).first();

  if (!reservation) {
    return c.json({ error: "Reservación no encontrada" }, 404);
  }

  const today = new Date().toISOString().split("T")[0];

  // Create reservation payment record
  const paymentResult = await c.env.DB.prepare(`
    INSERT INTO reservation_payments (reservation_id, amount, payment_provider, status, paid_at, metadata, created_at, updated_at)
    VALUES (?, ?, 'manual', 'completed', CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(reservationId, amount, JSON.stringify({ payment_method, reference_number, notes })).run();

  // Create financial transaction linked to reservation
  const description = `Pago reservación #${reservationId} - ${(reservation as any).guest_name || 'Huésped'} - Hab. ${(reservation as any).room_code || ''}`;
  
  await c.env.DB.prepare(`
    INSERT INTO financial_transactions (transaction_type, category, description, amount, payment_method, reference_number, reservation_id, transaction_date, notes, created_at, updated_at)
    VALUES ('income', 'Hospedaje', ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(description, amount, payment_method, reference_number || null, reservationId, today, notes || null).run();

  // Update reservation with new deposit/payment amount
  const currentDeposit = (reservation as any).deposit_amount || 0;
  const newDeposit = currentDeposit + amount;
  const totalAmount = (reservation as any).total_amount || 0;
  
  let paymentStatus = 'partial';
  if (newDeposit >= totalAmount && totalAmount > 0) {
    paymentStatus = 'paid';
  } else if (newDeposit > 0) {
    paymentStatus = 'partial';
  }

  await c.env.DB.prepare(`
    UPDATE reservations 
    SET deposit_amount = ?, payment_status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(newDeposit, paymentStatus, reservationId).run();

  return c.json({ 
    success: true, 
    payment_id: paymentResult.meta.last_row_id,
    new_deposit: newDeposit,
    payment_status: paymentStatus
  });
});

// Get payments for a reservation
app.get("/api/reservations/:id/payments", adminOrUserMiddleware, async (c) => {
  const reservationId = c.req.param("id");
  
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM reservation_payments WHERE reservation_id = ? ORDER BY created_at DESC
  `).bind(reservationId).all();
  
  return c.json({ payments: results });
});

// =====================
// TASKS API
// =====================

app.get("/api/tasks", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT t.*, r.code as room_code
    FROM tasks t
    LEFT JOIN rooms r ON t.room_id = r.id
    ORDER BY 
      CASE t.status 
        WHEN 'pending' THEN 1 
        WHEN 'in_progress' THEN 2 
        ELSE 3 
      END,
      CASE t.priority 
        WHEN 'urgente' THEN 1 
        WHEN 'alta' THEN 2 
        WHEN 'normal' THEN 3 
        ELSE 4 
      END,
      t.created_at DESC
  `).all();
  return c.json(results);
});

app.post("/api/tasks", adminOrUserMiddleware, async (c) => {
  const body = await c.req.json();
  const { title, description, room_id, task_type, priority, assigned_to, due_date } = body;

  const result = await c.env.DB.prepare(`
    INSERT INTO tasks (title, description, room_id, task_type, priority, assigned_to, due_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
  `).bind(
    title,
    description || null,
    room_id || null,
    task_type || 'general',
    priority || 'normal',
    assigned_to || null,
    due_date || null
  ).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

app.patch("/api/tasks/:id", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { status } = body;

  let sql = "UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP";
  const params: (string | null)[] = [status];

  if (status === "completed") {
    sql += ", completed_at = CURRENT_TIMESTAMP";
  } else {
    sql += ", completed_at = NULL";
  }

  sql += " WHERE id = ?";
  params.push(id);

  await c.env.DB.prepare(sql).bind(...params).run();

  return c.json({ success: true });
});

app.delete("/api/tasks/:id", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM tasks WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// =====================
// LEADS API
// =====================

// Public endpoint - register WhatsApp click as lead (no auth)
app.post("/api/leads/whatsapp", async (c) => {
  const body = await c.req.json();
  const { source, room_type, name, email, phone, check_in, check_out } = body;

  const result = await c.env.DB.prepare(`
    INSERT INTO leads (name, email, phone, room_type_interest, check_in_date, check_out_date, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'nuevo')
  `).bind(
    name || 'Visitante Web',
    email || null,
    phone || null,
    room_type || null,
    check_in || null,
    check_out || null,
    `Contacto via WhatsApp - ${source || 'botón principal'}`
  ).run();

  // Add initial history entry
  await c.env.DB.prepare(`
    INSERT INTO lead_history (lead_id, action_type, description, contacted_via)
    VALUES (?, 'clic_whatsapp', 'Visitante hizo clic en botón de WhatsApp', 'whatsapp')
  `).bind(result.meta.last_row_id).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

app.get("/api/leads", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM leads
    ORDER BY 
      CASE status 
        WHEN 'nuevo' THEN 1 
        WHEN 'contactado' THEN 2 
        WHEN 'interesado' THEN 3 
        WHEN 'reservado' THEN 4 
        ELSE 5 
      END,
      created_at DESC
  `).all();
  return c.json(results);
});

app.post("/api/leads", adminOrUserMiddleware, async (c) => {
  const body = await c.req.json();
  const { name, phone, email, room_type_interest, check_in_date, check_out_date, notes } = body;

  const result = await c.env.DB.prepare(`
    INSERT INTO leads (name, phone, email, room_type_interest, check_in_date, check_out_date, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'nuevo')
  `).bind(
    name,
    phone || null,
    email || null,
    room_type_interest || null,
    check_in_date || null,
    check_out_date || null,
    notes || null
  ).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

app.patch("/api/leads/:id", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { status } = body;

  await c.env.DB.prepare(
    "UPDATE leads SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(status, id).run();

  return c.json({ success: true });
});

app.get("/api/leads/:id/history", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM lead_history WHERE lead_id = ? ORDER BY created_at DESC"
  ).bind(id).all();
  return c.json(results);
});

app.post("/api/leads/:id/history", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { action_type, description, contacted_via } = body;
  const user = c.get("user") as { email: string } | undefined;

  await c.env.DB.prepare(`
    INSERT INTO lead_history (lead_id, action_type, description, contacted_via, created_by)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    id,
    action_type || 'contacto',
    description || null,
    contacted_via || null,
    user?.email || null
  ).run();

  // Update last_contact_at on lead
  await c.env.DB.prepare(
    "UPDATE leads SET last_contact_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(id).run();

  return c.json({ success: true });
});

// =====================
// SEASONAL PRICING API
// =====================

app.get("/api/pricing", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM seasonal_pricing ORDER BY start_date
  `).all();
  return c.json(results);
});

app.post("/api/pricing", adminOrUserMiddleware, async (c) => {
  const body = await c.req.json();
  const { room_type, season_name, start_date, end_date, price_per_night } = body;

  const result = await c.env.DB.prepare(`
    INSERT INTO seasonal_pricing (room_type, season_name, start_date, end_date, price_per_night, is_active)
    VALUES (?, ?, ?, ?, ?, 1)
  `).bind(room_type, season_name, start_date, end_date, price_per_night).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

app.patch("/api/pricing/:id", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { room_type, season_name, start_date, end_date, price_per_night, is_active } = body;

  await c.env.DB.prepare(`
    UPDATE seasonal_pricing 
    SET room_type = ?, season_name = ?, start_date = ?, end_date = ?, 
        price_per_night = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(room_type, season_name, start_date, end_date, price_per_night, is_active ? 1 : 0, id).run();

  return c.json({ success: true });
});

app.delete("/api/pricing/:id", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM seasonal_pricing WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// =====================
// FINANCIAL API
// =====================

// Get financial transactions
app.get("/api/financial/transactions", adminOrUserMiddleware, async (c) => {
  const period = c.req.query("period") || "month";
  
  let dateFilter = "";
  
  if (period === "today") {
    dateFilter = `AND ft.transaction_date = date('now')`;
  } else if (period === "week") {
    dateFilter = `AND ft.transaction_date >= date('now', '-7 days')`;
  } else if (period === "month") {
    dateFilter = `AND ft.transaction_date >= date('now', '-30 days')`;
  } else if (period === "year") {
    dateFilter = `AND ft.transaction_date >= date('now', '-365 days')`;
  }
  
  const { results } = await c.env.DB.prepare(
    `SELECT ft.*, 
      r.check_in_date as reservation_check_in,
      r.check_out_date as reservation_check_out,
      g.name as guest_name,
      rm.code as room_code
    FROM financial_transactions ft
    LEFT JOIN reservations r ON ft.reservation_id = r.id
    LEFT JOIN guests g ON r.guest_id = g.id
    LEFT JOIN rooms rm ON r.room_id = rm.id
    WHERE 1=1 ${dateFilter} 
    ORDER BY ft.transaction_date DESC, ft.created_at DESC`
  ).all();
  
  return c.json({ transactions: results });
});

// Create financial transaction
app.post("/api/financial/transactions", adminOrUserMiddleware, async (c) => {
  const body = await c.req.json();
  const { transaction_type, category, description, amount, payment_method, reference_number, transaction_date, notes } = body;
  
  const result = await c.env.DB.prepare(
    `INSERT INTO financial_transactions (transaction_type, category, description, amount, payment_method, reference_number, transaction_date, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
  ).bind(transaction_type, category, description, amount, payment_method, reference_number, transaction_date, notes).run();
  
  return c.json({ success: true, id: result.meta.last_row_id });
});

// Get expense categories
app.get("/api/financial/categories", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM expense_categories WHERE is_active = 1 ORDER BY name"
  ).all();
  
  return c.json({ categories: results });
});

// Get financial summary
app.get("/api/financial/summary", adminOrUserMiddleware, async (c) => {
  const period = c.req.query("period") || "month";
  
  let dateFilter = "";
  if (period === "today") {
    dateFilter = `AND transaction_date = date('now')`;
  } else if (period === "week") {
    dateFilter = `AND transaction_date >= date('now', '-7 days')`;
  } else if (period === "month") {
    dateFilter = `AND transaction_date >= date('now', '-30 days')`;
  } else if (period === "year") {
    dateFilter = `AND transaction_date >= date('now', '-365 days')`;
  }
  
  // Get totals by transaction type
  const { results: totals } = await c.env.DB.prepare(
    `SELECT transaction_type, SUM(amount) as total FROM financial_transactions WHERE 1=1 ${dateFilter} GROUP BY transaction_type`
  ).all();
  
  const totalIncome = (totals.find((t: any) => t.transaction_type === "income") as any)?.total || 0;
  const totalExpenses = (totals.find((t: any) => t.transaction_type === "expense") as any)?.total || 0;
  
  // Get income by payment method
  const { results: incomeByMethodRows } = await c.env.DB.prepare(
    `SELECT payment_method, SUM(amount) as total FROM financial_transactions WHERE transaction_type = 'income' ${dateFilter} GROUP BY payment_method`
  ).all();
  
  const incomeByMethod: Record<string, number> = {};
  for (const row of incomeByMethodRows as any[]) {
    incomeByMethod[row.payment_method] = row.total;
  }
  
  // Get expenses by category
  const { results: expensesByCatRows } = await c.env.DB.prepare(
    `SELECT category, SUM(amount) as total FROM financial_transactions WHERE transaction_type = 'expense' ${dateFilter} GROUP BY category`
  ).all();
  
  const expensesByCategory: Record<string, number> = {};
  for (const row of expensesByCatRows as any[]) {
    expensesByCategory[row.category] = row.total;
  }
  
  // Get pending payments from reservations
  const { results: pendingRes } = await c.env.DB.prepare(
    `SELECT SUM(total_amount - COALESCE(deposit_amount, 0)) as pending 
     FROM reservations 
     WHERE payment_status IN ('pending', 'partial') AND status != 'cancelled'`
  ).all();
  
  const pendingPayments = (pendingRes[0] as any)?.pending || 0;
  
  return c.json({
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    pendingPayments,
    incomeByMethod,
    expensesByCategory,
  });
});

// Delete financial transaction
app.delete("/api/financial/transactions/:id", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM financial_transactions WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Get daily trends for charts
app.get("/api/financial/trends", adminOrUserMiddleware, async (c) => {
  const period = c.req.query("period") || "month";
  
  let days = 30;
  if (period === "today") days = 1;
  else if (period === "week") days = 7;
  else if (period === "year") days = 365;
  
  const { results } = await c.env.DB.prepare(
    `SELECT 
      transaction_date as date,
      SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END) as expenses
    FROM financial_transactions 
    WHERE transaction_date >= date('now', '-' || ? || ' days')
    GROUP BY transaction_date
    ORDER BY transaction_date ASC`
  ).bind(days).all();
  
  // Format dates for display
  const trends = (results as any[]).map(row => ({
    date: new Date(row.date).toLocaleDateString("es-VE", { day: "2-digit", month: "short" }),
    income: row.income || 0,
    expenses: row.expenses || 0,
  }));
  
  return c.json({ trends });
});

// =====================
// EMPLOYEES & PAYROLL API
// =====================

// Get all employees
app.get("/api/employees", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM employees ORDER BY is_active DESC, name ASC"
  ).all();
  return c.json({ employees: results });
});

// Create employee
app.post("/api/employees", adminOrUserMiddleware, async (c) => {
  const body = await c.req.json();
  const { name, position, department, phone, email, document_id, hire_date, salary, salary_type, bank_name, bank_account, notes } = body;
  
  const result = await c.env.DB.prepare(
    `INSERT INTO employees (name, position, department, phone, email, document_id, hire_date, salary, salary_type, bank_name, bank_account, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(name, position, department, phone, email, document_id, hire_date, salary, salary_type || "monthly", bank_name, bank_account, notes).run();
  
  return c.json({ success: true, id: result.meta.last_row_id });
});

// Update employee
app.put("/api/employees/:id", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { name, position, department, phone, email, document_id, hire_date, salary, salary_type, bank_name, bank_account, notes } = body;
  
  await c.env.DB.prepare(
    `UPDATE employees SET name = ?, position = ?, department = ?, phone = ?, email = ?, document_id = ?, hire_date = ?, salary = ?, salary_type = ?, bank_name = ?, bank_account = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).bind(name, position, department, phone, email, document_id, hire_date, salary, salary_type, bank_name, bank_account, notes, id).run();
  
  return c.json({ success: true });
});

// Toggle employee active status
app.patch("/api/employees/:id/toggle", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare(
    "UPDATE employees SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(id).run();
  return c.json({ success: true });
});

// Get all payroll payments
app.get("/api/payroll", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT p.*, e.name as employee_name 
     FROM payroll_payments p 
     LEFT JOIN employees e ON p.employee_id = e.id 
     ORDER BY p.payment_date DESC, p.created_at DESC`
  ).all();
  return c.json({ payments: results });
});

// Create payroll payment
app.post("/api/payroll", adminOrUserMiddleware, async (c) => {
  const body = await c.req.json();
  const { employee_id, pay_period_start, pay_period_end, base_salary, bonuses, deductions, payment_method, payment_date, notes } = body;
  
  const net_amount = (base_salary || 0) + (bonuses || 0) - (deductions || 0);
  
  const result = await c.env.DB.prepare(
    `INSERT INTO payroll_payments (employee_id, pay_period_start, pay_period_end, base_salary, bonuses, deductions, net_amount, payment_method, payment_date, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?)`
  ).bind(employee_id, pay_period_start, pay_period_end, base_salary, bonuses || 0, deductions || 0, net_amount, payment_method, payment_date, notes).run();
  
  // Also create a financial transaction for the payroll expense
  await c.env.DB.prepare(
    `INSERT INTO financial_transactions (transaction_type, category, description, amount, payment_method, transaction_date, notes)
     VALUES ('expense', 'Nómina', ?, ?, ?, ?, ?)`
  ).bind(`Pago de nómina - Empleado #${employee_id}`, net_amount, payment_method, payment_date, notes).run();
  
  return c.json({ success: true, id: result.meta.last_row_id });
});

// Update payroll payment status
app.patch("/api/payroll/:id", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { status } = body;
  
  await c.env.DB.prepare(
    "UPDATE payroll_payments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(status, id).run();
  
  return c.json({ success: true });
});

// =====================
// SUPPLIERS API
// =====================

// Get all suppliers
app.get("/api/suppliers", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM suppliers ORDER BY is_active DESC, name ASC"
  ).all();
  return c.json({ suppliers: results });
});

// Create supplier
app.post("/api/suppliers", adminOrUserMiddleware, async (c) => {
  const body = await c.req.json();
  const { name, contact_name, phone, email, address, category, tax_id, payment_terms, notes } = body;
  
  const result = await c.env.DB.prepare(
    `INSERT INTO suppliers (name, contact_name, phone, email, address, category, tax_id, payment_terms, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(name, contact_name, phone, email, address, category, tax_id, payment_terms, notes).run();
  
  return c.json({ success: true, id: result.meta.last_row_id });
});

// Update supplier
app.put("/api/suppliers/:id", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { name, contact_name, phone, email, address, category, tax_id, payment_terms, notes } = body;
  
  await c.env.DB.prepare(
    `UPDATE suppliers SET name = ?, contact_name = ?, phone = ?, email = ?, address = ?, category = ?, tax_id = ?, payment_terms = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).bind(name, contact_name, phone, email, address, category, tax_id, payment_terms, notes, id).run();
  
  return c.json({ success: true });
});

// Toggle supplier active status
app.patch("/api/suppliers/:id/toggle", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare(
    "UPDATE suppliers SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(id).run();
  return c.json({ success: true });
});

// Get all supplier invoices
app.get("/api/supplier-invoices", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT i.*, s.name as supplier_name 
     FROM supplier_invoices i 
     LEFT JOIN suppliers s ON i.supplier_id = s.id 
     ORDER BY i.status ASC, i.due_date ASC, i.created_at DESC`
  ).all();
  return c.json({ invoices: results });
});

// Create supplier invoice
app.post("/api/supplier-invoices", adminOrUserMiddleware, async (c) => {
  const body = await c.req.json();
  const { supplier_id, invoice_number, invoice_date, due_date, amount, description, notes } = body;
  
  const result = await c.env.DB.prepare(
    `INSERT INTO supplier_invoices (supplier_id, invoice_number, invoice_date, due_date, amount, description, notes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`
  ).bind(supplier_id, invoice_number, invoice_date, due_date, amount, description, notes).run();
  
  return c.json({ success: true, id: result.meta.last_row_id });
});

// Pay supplier invoice
app.post("/api/supplier-invoices/:id/pay", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { amount, payment_method, payment_date } = body;
  
  // Get current invoice
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM supplier_invoices WHERE id = ?"
  ).bind(id).all();
  
  if (results.length === 0) {
    return c.json({ error: "Invoice not found" }, 404);
  }
  
  const invoice = results[0] as any;
  const newAmountPaid = (invoice.amount_paid || 0) + amount;
  const newStatus = newAmountPaid >= invoice.amount ? "paid" : "partial";
  
  // Update invoice
  await c.env.DB.prepare(
    `UPDATE supplier_invoices SET amount_paid = ?, status = ?, payment_method = ?, payment_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).bind(newAmountPaid, newStatus, payment_method, payment_date, id).run();
  
  // Get supplier name for transaction description
  const { results: supResults } = await c.env.DB.prepare(
    "SELECT name FROM suppliers WHERE id = ?"
  ).bind(invoice.supplier_id).all();
  const supplierName = (supResults[0] as any)?.name || `Proveedor #${invoice.supplier_id}`;
  
  // Create financial transaction for the payment
  await c.env.DB.prepare(
    `INSERT INTO financial_transactions (transaction_type, category, description, amount, payment_method, transaction_date, notes)
     VALUES ('expense', 'Proveedores', ?, ?, ?, ?, ?)`
  ).bind(`Pago a ${supplierName} - Factura #${invoice.invoice_number || id}`, amount, payment_method, payment_date, invoice.description).run();
  
  return c.json({ success: true });
});

// =====================
// ACCOUNTS RECEIVABLE API
// =====================

// Get all accounts receivable
app.get("/api/accounts-receivable", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT ar.*, g.name as guest_name, g.phone as guest_phone, r.room_id, rm.code as room_code
     FROM accounts_receivable ar
     LEFT JOIN guests g ON ar.guest_id = g.id
     LEFT JOIN reservations r ON ar.reservation_id = r.id
     LEFT JOIN rooms rm ON r.room_id = rm.id
     ORDER BY ar.status ASC, ar.due_date ASC, ar.created_at DESC`
  ).all();
  return c.json({ accounts: results });
});

// Create account receivable
app.post("/api/accounts-receivable", adminOrUserMiddleware, async (c) => {
  const body = await c.req.json();
  const { guest_id, reservation_id, description, amount, due_date, notes } = body;
  
  const result = await c.env.DB.prepare(
    `INSERT INTO accounts_receivable (guest_id, reservation_id, description, amount, due_date, notes, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`
  ).bind(guest_id, reservation_id, description, amount, due_date, notes).run();
  
  return c.json({ success: true, id: result.meta.last_row_id });
});

// Pay account receivable
app.post("/api/accounts-receivable/:id/pay", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { amount, payment_method, payment_date } = body;
  
  // Get current account
  const { results } = await c.env.DB.prepare(
    `SELECT ar.*, g.name as guest_name FROM accounts_receivable ar LEFT JOIN guests g ON ar.guest_id = g.id WHERE ar.id = ?`
  ).bind(id).all();
  
  if (results.length === 0) {
    return c.json({ error: "Account not found" }, 404);
  }
  
  const account = results[0] as any;
  const newAmountPaid = (account.amount_paid || 0) + amount;
  const newStatus = newAmountPaid >= account.amount ? "paid" : "partial";
  
  // Update account
  await c.env.DB.prepare(
    `UPDATE accounts_receivable SET amount_paid = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).bind(newAmountPaid, newStatus, id).run();
  
  const guestName = account.guest_name || `Huésped #${account.guest_id}`;
  
  // Create financial transaction for the income
  await c.env.DB.prepare(
    `INSERT INTO financial_transactions (transaction_type, category, description, amount, payment_method, transaction_date, notes)
     VALUES ('income', 'Cobros', ?, ?, ?, ?, ?)`
  ).bind(`Cobro a ${guestName} - ${account.description}`, amount, payment_method, payment_date, account.notes).run();
  
  return c.json({ success: true });
});

// =====================
// EXCHANGE RATES API
// =====================

// Get all exchange rates
app.get("/api/exchange-rates", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM exchange_rates ORDER BY rate_date DESC, created_at DESC LIMIT 100"
  ).all();
  return c.json({ rates: results });
});

// Get current (latest) exchange rate
app.get("/api/exchange-rates/current", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM exchange_rates ORDER BY rate_date DESC, created_at DESC LIMIT 1"
  ).all();
  return c.json({ rate: results[0] || null });
});

// Create exchange rate
app.post("/api/exchange-rates", adminOrUserMiddleware, async (c) => {
  const body = await c.req.json();
  const { rate_date, rate, source } = body;
  
  const result = await c.env.DB.prepare(
    "INSERT INTO exchange_rates (rate_date, rate, source) VALUES (?, ?, ?)"
  ).bind(rate_date, rate, source || "bcv").run();
  
  return c.json({ success: true, id: result.meta.last_row_id });
});

// =====================
// SITE CONTENT API
// =====================

// Public endpoint - no auth required for landing page
app.get("/api/site-content", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM site_content ORDER BY section, content_key"
  ).all();
  return c.json(results);
});

app.patch("/api/site-content/:id", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { content_value } = body;

  await c.env.DB.prepare(
    "UPDATE site_content SET content_value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(content_value, id).run();

  return c.json({ success: true });
});

// =====================
// IMAGE UPLOAD API
// =====================

// Upload image to R2 (protected)
app.post("/api/upload", adminOrUserMiddleware, async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;
  
  if (!file) {
    return c.json({ error: "No file provided" }, 400);
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return c.json({ error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." }, 400);
  }

  // Generate unique filename with timestamp
  const timestamp = Date.now();
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `content/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

  // Upload to R2
  await c.env.R2_BUCKET.put(filename, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });

  return c.json({ 
    success: true, 
    url: `/api/images/${filename}`,
    filename 
  });
});

// Serve images from R2 (public)
app.get("/api/images/*", async (c) => {
  const path = c.req.path.replace("/api/images/", "");
  
  const object = await c.env.R2_BUCKET.get(path);
  
  if (!object) {
    return c.json({ error: "Image not found" }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000");

  return new Response(object.body, { headers });
});

// OAuth: Get Google redirect URL
app.get("/api/oauth/google/redirect_url", async (c) => {
  const redirectUrl = await getOAuthRedirectUrl("google", {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

// OAuth: Exchange code for session token
app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

// Get current user
app.get("/api/users/me", adminOrUserMiddleware, async (c) => {
  return c.json(c.get("user"));
});

// Logout
app.get("/api/logout", async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === "string") {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

export default app;
