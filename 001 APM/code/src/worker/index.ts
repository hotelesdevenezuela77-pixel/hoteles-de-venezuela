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
        c.set("user", { id: "admin", email: "admin@apartoposadadelmar.net" });
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
  const adminEmail = "admin@apartoposadadelmar.net";
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
    sameSite: "none",
    secure: true,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return c.json({ 
    success: true, 
    user: { id: "admin", email: adminEmail } 
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
        return c.json({ id: "admin", email: "admin@apartoposadadelmar.net" });
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
    sameSite: "none",
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
// FINANCE PAYMENTS API
// =====================

// Get all payment methods
app.get("/api/finance/payment-methods", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM payment_methods WHERE is_active = 1 ORDER BY name"
  ).all();
  return c.json(results);
});

// Get current exchange rate
app.get("/api/finance/exchange-rate", adminOrUserMiddleware, async (c) => {
  const today = new Date().toISOString().split("T")[0];
  const result = await c.env.DB.prepare(
    "SELECT rate FROM exchange_rates WHERE rate_date <= ? ORDER BY rate_date DESC LIMIT 1"
  ).bind(today).first() as any;
  return c.json({ rate: result?.rate || null });
});

// Get all exchange rates (history)
app.get("/api/finance/exchange-rates", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM exchange_rates ORDER BY rate_date DESC LIMIT 90"
  ).all();
  return c.json({ rates: results });
});

// Create exchange rate
app.post("/api/finance/exchange-rates", adminOrUserMiddleware, async (c) => {
  const body = await c.req.json();
  const { rate_date, rate, source } = body;
  
  // Check if rate for this date exists
  const existing = await c.env.DB.prepare(
    "SELECT id FROM exchange_rates WHERE rate_date = ?"
  ).bind(rate_date).first();
  
  if (existing) {
    // Update existing
    await c.env.DB.prepare(
      "UPDATE exchange_rates SET rate = ?, source = ?, updated_at = datetime('now') WHERE rate_date = ?"
    ).bind(rate, source || null, rate_date).run();
    return c.json({ success: true, updated: true });
  }
  
  // Create new
  const result = await c.env.DB.prepare(
    `INSERT INTO exchange_rates (rate_date, currency_from, currency_to, rate, source, created_at, updated_at)
     VALUES (?, 'USD', 'VES', ?, ?, datetime('now'), datetime('now'))`
  ).bind(rate_date, rate, source || null).run();
  
  return c.json({ id: result.meta.last_row_id, success: true });
});

// Delete exchange rate
app.delete("/api/finance/exchange-rates/:id", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM exchange_rates WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// =====================
// SUPPLIERS API
// =====================

// Get all suppliers
app.get("/api/finance/suppliers", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM suppliers WHERE is_active = 1 ORDER BY name"
  ).all();
  return c.json({ suppliers: results });
});

// Create supplier
app.post("/api/finance/suppliers", adminOrUserMiddleware, async (c) => {
  const body = await c.req.json();
  const { name, contact_name, phone, email, address, category, payment_terms, notes } = body;
  
  const result = await c.env.DB.prepare(
    `INSERT INTO suppliers (name, contact_name, phone, email, address, category, payment_terms, notes, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`
  ).bind(name, contact_name || null, phone || null, email || null, address || null, category || null, payment_terms || null, notes || null).run();
  
  return c.json({ id: result.meta.last_row_id, success: true });
});

// Update supplier
app.patch("/api/finance/suppliers/:id", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { name, contact_name, phone, email, address, category, payment_terms, notes } = body;
  
  await c.env.DB.prepare(
    `UPDATE suppliers SET name = ?, contact_name = ?, phone = ?, email = ?, address = ?, category = ?, payment_terms = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`
  ).bind(name, contact_name || null, phone || null, email || null, address || null, category || null, payment_terms || null, notes || null, id).run();
  
  return c.json({ success: true });
});

// Get supplier invoices
app.get("/api/finance/suppliers/:id/invoices", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM supplier_invoices WHERE supplier_id = ? ORDER BY invoice_date DESC"
  ).bind(id).all();
  return c.json({ invoices: results });
});

// Create invoice
app.post("/api/finance/invoices", adminOrUserMiddleware, async (c) => {
  const body = await c.req.json();
  const { supplier_id, invoice_number, invoice_date, due_date, total_amount, currency, notes } = body;
  
  const result = await c.env.DB.prepare(
    `INSERT INTO supplier_invoices (supplier_id, invoice_number, invoice_date, due_date, total_amount, paid_amount, currency, status, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 0, ?, 'pending', ?, datetime('now'), datetime('now'))`
  ).bind(supplier_id, invoice_number || null, invoice_date, due_date || null, total_amount, currency || 'USD', notes || null).run();
  
  return c.json({ id: result.meta.last_row_id, success: true });
});

// Delete invoice
app.delete("/api/finance/invoices/:id", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM supplier_payments WHERE supplier_invoice_id = ?").bind(id).run();
  await c.env.DB.prepare("DELETE FROM supplier_invoices WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Get invoice payments
app.get("/api/finance/invoices/:id/payments", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  const { results } = await c.env.DB.prepare(
    `SELECT sp.*, pm.name as method_name 
     FROM supplier_payments sp
     LEFT JOIN payment_methods pm ON sp.payment_method_id = pm.id
     WHERE sp.supplier_invoice_id = ?
     ORDER BY sp.payment_date DESC`
  ).bind(id).all();
  return c.json({ payments: results });
});

// Create payment for invoice
app.post("/api/finance/invoices/:id/payments", adminOrUserMiddleware, async (c) => {
  const invoiceId = c.req.param("id");
  const body = await c.req.json();
  const { amount, payment_date, reference_number, payment_method_id } = body;
  
  // Get invoice
  const invoice = await c.env.DB.prepare("SELECT * FROM supplier_invoices WHERE id = ?").bind(invoiceId).first();
  if (!invoice) return c.json({ error: "Invoice not found" }, 404);
  
  // Create payment
  await c.env.DB.prepare(
    `INSERT INTO supplier_payments (supplier_invoice_id, amount, currency, payment_date, payment_method_id, reference_number, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
  ).bind(invoiceId, amount, invoice.currency || 'USD', payment_date, payment_method_id || null, reference_number || null).run();
  
  // Update invoice
  const newPaidAmount = (invoice.paid_amount as number) + amount;
  const totalAmount = invoice.total_amount as number;
  let newStatus = newPaidAmount >= totalAmount ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'pending');
  
  await c.env.DB.prepare(
    "UPDATE supplier_invoices SET paid_amount = ?, status = ?, updated_at = datetime('now') WHERE id = ?"
  ).bind(newPaidAmount, newStatus, invoiceId).run();
  
  return c.json({ success: true });
});

// Get reservations with pending payments
app.get("/api/finance/reservations-pending", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT r.id, r.check_in_date, r.check_out_date, r.total_amount, r.deposit_amount,
           g.name as guest_name, rm.code as room_code
    FROM reservations r
    LEFT JOIN guests g ON r.guest_id = g.id
    LEFT JOIN rooms rm ON r.room_id = rm.id
    WHERE r.status IN ('pending', 'confirmed', 'checked_in')
    AND r.check_out_date >= date('now', '-30 days')
    ORDER BY r.check_in_date DESC
  `).all();
  return c.json(results);
});

// Get all payments
app.get("/api/finance/payments", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT fp.*, 
           g.name as guest_name, 
           rm.code as room_code,
           pm.name as method_name
    FROM finance_payments fp
    LEFT JOIN reservations r ON fp.reservation_id = r.id
    LEFT JOIN guests g ON r.guest_id = g.id
    LEFT JOIN rooms rm ON r.room_id = rm.id
    LEFT JOIN payment_methods pm ON fp.payment_method_id = pm.id
    ORDER BY fp.payment_date DESC, fp.created_at DESC
    LIMIT 200
  `).all();
  return c.json(results);
});

// Create payment
app.post("/api/finance/payments", adminOrUserMiddleware, async (c) => {
  const body = await c.req.json();
  const user = c.get("user") as { email: string } | undefined;
  
  const {
    reservation_id,
    payment_method_id,
    payment_type,
    amount,
    currency,
    amount_local,
    exchange_rate,
    reference_number,
    payment_date,
    notes,
  } = body;

  const result = await c.env.DB.prepare(`
    INSERT INTO finance_payments 
    (reservation_id, payment_method_id, payment_type, amount, currency, 
     amount_local, exchange_rate, reference_number, payment_date, notes, recorded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    reservation_id || null,
    payment_method_id,
    payment_type,
    amount,
    currency || 'USD',
    amount_local || null,
    exchange_rate || null,
    reference_number || null,
    payment_date,
    notes || null,
    user?.email || null
  ).run();

  // If linked to reservation, update payment status
  if (reservation_id) {
    // Get total paid for this reservation
    const paidResult = await c.env.DB.prepare(
      "SELECT COALESCE(SUM(amount), 0) as total_paid FROM finance_payments WHERE reservation_id = ?"
    ).bind(reservation_id).first() as any;
    
    const reservationResult = await c.env.DB.prepare(
      "SELECT total_amount FROM reservations WHERE id = ?"
    ).bind(reservation_id).first() as any;
    
    const totalPaid = paidResult?.total_paid || 0;
    const totalAmount = reservationResult?.total_amount || 0;
    
    let paymentStatus = 'pending';
    if (totalPaid >= totalAmount) {
      paymentStatus = 'paid';
    } else if (totalPaid > 0) {
      paymentStatus = 'partial';
    }
    
    await c.env.DB.prepare(
      "UPDATE reservations SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(paymentStatus, reservation_id).run();
  }

  return c.json({ success: true, id: result.meta.last_row_id });
});

// =====================
// FINANCE DASHBOARD API
// =====================

app.get("/api/finance/dashboard", adminOrUserMiddleware, async (c) => {
  const period = c.req.query("period") || "month";
  
  const now = new Date();
  let startDate: string;
  let endDate: string = now.toISOString().split("T")[0];
  
  if (period === "day") {
    startDate = endDate;
  } else if (period === "year") {
    startDate = `${now.getFullYear()}-01-01`;
  } else {
    // month (default)
    startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  }
  
  // Get total income from finance_payments
  const incomeResult = await c.env.DB.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM finance_payments 
     WHERE payment_type IN ('deposit', 'final_payment', 'full_payment')
     AND payment_date >= ? AND payment_date <= ?`
  ).bind(startDate, endDate).first() as any;
  
  // Get total expenses
  const expensesResult = await c.env.DB.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM expenses 
     WHERE expense_date >= ? AND expense_date <= ?`
  ).bind(startDate, endDate).first() as any;
  
  // Add payroll expenses
  const payrollResult = await c.env.DB.prepare(
    `SELECT COALESCE(SUM(total_amount), 0) as total FROM payroll 
     WHERE is_paid = 1 AND paid_date >= ? AND paid_date <= ?`
  ).bind(startDate, endDate).first() as any;
  
  // Add employee variable payments
  const empPaymentsResult = await c.env.DB.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total FROM employee_payments 
     WHERE is_paid = 1 AND paid_date >= ? AND paid_date <= ?`
  ).bind(startDate, endDate).first() as any;
  
  // Get pending receivables
  const receivablesResult = await c.env.DB.prepare(
    `SELECT COALESCE(SUM(total_amount - paid_amount), 0) as total FROM accounts_receivable 
     WHERE status = 'pending'`
  ).first() as any;
  
  // Get pending payables (supplier invoices)
  const payablesResult = await c.env.DB.prepare(
    `SELECT COALESCE(SUM(total_amount - paid_amount), 0) as total FROM supplier_invoices 
     WHERE status IN ('pending', 'partial')`
  ).first() as any;
  
  // Get reservations count
  const reservationsResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as count FROM reservations 
     WHERE check_in_date >= ? AND check_in_date <= ?`
  ).bind(startDate, endDate).first() as any;
  
  // Calculate occupancy rate (simplified)
  const daysInPeriod = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const totalRoomNights = 20 * daysInPeriod; // 20 rooms
  
  const bookedNightsResult = await c.env.DB.prepare(
    `SELECT COUNT(*) as count FROM room_inventory 
     WHERE is_available = 0 AND inventory_date >= ? AND inventory_date <= ?`
  ).bind(startDate, endDate).first() as any;
  
  const occupancyRate = totalRoomNights > 0 
    ? ((bookedNightsResult?.count || 0) / totalRoomNights) * 100 
    : 0;
  
  // Get average daily rate
  const avgRateResult = await c.env.DB.prepare(
    `SELECT AVG(total_amount / MAX(1, julianday(check_out_date) - julianday(check_in_date))) as avg_rate 
     FROM reservations 
     WHERE status IN ('confirmed', 'checked_in', 'checked_out')
     AND check_in_date >= ? AND check_in_date <= ?`
  ).bind(startDate, endDate).first() as any;
  
  // Get today's exchange rate
  const exchangeRateResult = await c.env.DB.prepare(
    `SELECT rate FROM exchange_rates WHERE rate_date <= ? ORDER BY rate_date DESC LIMIT 1`
  ).bind(endDate).first() as any;
  
  const totalExpenses = (expensesResult?.total || 0) + (payrollResult?.total || 0) + (empPaymentsResult?.total || 0);
  
  // Get recent transactions
  const recentPayments = await c.env.DB.prepare(
    `SELECT id, 'income' as type, 
            COALESCE((SELECT g.name FROM reservations r JOIN guests g ON r.guest_id = g.id WHERE r.id = fp.reservation_id), 'Pago directo') as description,
            amount, payment_date as date, payment_type as category
     FROM finance_payments fp 
     ORDER BY payment_date DESC, created_at DESC LIMIT 5`
  ).all();
  
  const recentExpenses = await c.env.DB.prepare(
    `SELECT e.id, 'expense' as type, e.description, e.amount, e.expense_date as date, 
            COALESCE(c.name, 'Gasto') as category
     FROM expenses e 
     LEFT JOIN expense_categories c ON e.category_id = c.id
     ORDER BY e.expense_date DESC, e.created_at DESC LIMIT 5`
  ).all();
  
  // Merge and sort transactions
  const allTransactions = [...(recentPayments.results || []), ...(recentExpenses.results || [])]
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
  
  // Cash flow data (last 6 periods)
  const cashFlow: { period: string; income: number; expenses: number }[] = [];
  
  if (period === "day") {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      
      const dayIncome = await c.env.DB.prepare(
        `SELECT COALESCE(SUM(amount), 0) as total FROM finance_payments WHERE payment_date = ?`
      ).bind(dateStr).first() as any;
      
      const dayExpenses = await c.env.DB.prepare(
        `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE expense_date = ?`
      ).bind(dateStr).first() as any;
      
      cashFlow.push({
        period: d.toLocaleDateString("es-VE", { weekday: "short", day: "numeric" }),
        income: dayIncome?.total || 0,
        expenses: dayExpenses?.total || 0,
      });
    }
  } else if (period === "year") {
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStart = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const monthEnd = nextMonth.toISOString().split("T")[0];
      
      const monthIncome = await c.env.DB.prepare(
        `SELECT COALESCE(SUM(amount), 0) as total FROM finance_payments WHERE payment_date >= ? AND payment_date <= ?`
      ).bind(monthStart, monthEnd).first() as any;
      
      const monthExpenses = await c.env.DB.prepare(
        `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE expense_date >= ? AND expense_date <= ?`
      ).bind(monthStart, monthEnd).first() as any;
      
      cashFlow.push({
        period: d.toLocaleDateString("es-VE", { month: "short" }),
        income: monthIncome?.total || 0,
        expenses: monthExpenses?.total || 0,
      });
    }
  } else {
    // Last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      
      const startStr = weekStart.toISOString().split("T")[0];
      const endStr = weekEnd.toISOString().split("T")[0];
      
      const weekIncome = await c.env.DB.prepare(
        `SELECT COALESCE(SUM(amount), 0) as total FROM finance_payments WHERE payment_date >= ? AND payment_date <= ?`
      ).bind(startStr, endStr).first() as any;
      
      const weekExpenses = await c.env.DB.prepare(
        `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE expense_date >= ? AND expense_date <= ?`
      ).bind(startStr, endStr).first() as any;
      
      cashFlow.push({
        period: `Sem ${4 - i}`,
        income: weekIncome?.total || 0,
        expenses: weekExpenses?.total || 0,
      });
    }
  }
  
  return c.json({
    stats: {
      totalIncome: incomeResult?.total || 0,
      totalExpenses,
      netCashFlow: (incomeResult?.total || 0) - totalExpenses,
      pendingReceivables: receivablesResult?.total || 0,
      pendingPayables: payablesResult?.total || 0,
      occupancyRate,
      avgDailyRate: avgRateResult?.avg_rate || 0,
      reservationsThisMonth: reservationsResult?.count || 0,
    },
    recentTransactions: allTransactions,
    cashFlow,
    exchangeRate: exchangeRateResult?.rate || null,
  });
});

// =====================
// EXPENSES API
// =====================

// Get expense categories
app.get("/api/finance/expense-categories", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM expense_categories ORDER BY is_fixed DESC, name"
  ).all();
  return c.json(results);
});

// Create expense category
app.post("/api/finance/expense-categories", adminOrUserMiddleware, async (c) => {
  const body = await c.req.json();
  const { name, code, is_fixed } = body;
  
  const result = await c.env.DB.prepare(
    `INSERT INTO expense_categories (name, code, is_fixed, created_at, updated_at)
     VALUES (?, ?, ?, datetime('now'), datetime('now'))`
  ).bind(name, code || name.toLowerCase().replace(/\s/g, "_"), is_fixed ? 1 : 0).run();
  
  return c.json({ id: result.meta.last_row_id, name, code, is_fixed });
});

// Get suppliers
app.get("/api/finance/suppliers", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM suppliers WHERE is_active = 1 ORDER BY name"
  ).all();
  return c.json(results);
});

// Create supplier
app.post("/api/finance/suppliers", adminOrUserMiddleware, async (c) => {
  const body = await c.req.json();
  const { name, contact_name, phone, email, address, tax_id, notes } = body;
  
  const result = await c.env.DB.prepare(
    `INSERT INTO suppliers (name, contact_name, phone, email, address, tax_id, notes, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`
  ).bind(name, contact_name, phone, email, address, tax_id, notes).run();
  
  return c.json({ id: result.meta.last_row_id, name });
});

// Get expenses list
app.get("/api/finance/expenses", adminOrUserMiddleware, async (c) => {
  const start = c.req.query("start");
  const end = c.req.query("end");
  
  let query = `
    SELECT e.*, 
           ec.name as category_name, ec.is_fixed,
           s.name as supplier_name
    FROM expenses e
    LEFT JOIN expense_categories ec ON e.category_id = ec.id
    LEFT JOIN suppliers s ON e.supplier_id = s.id
  `;
  
  const bindings: string[] = [];
  if (start && end) {
    query += " WHERE e.expense_date >= ? AND e.expense_date <= ?";
    bindings.push(start, end);
  }
  
  query += " ORDER BY e.expense_date DESC, e.created_at DESC";
  
  const stmt = bindings.length > 0 
    ? c.env.DB.prepare(query).bind(...bindings)
    : c.env.DB.prepare(query);
  
  const { results } = await stmt.all();
  return c.json(results);
});

// Create expense
app.post("/api/finance/expenses", adminOrUserMiddleware, async (c) => {
  const body = await c.req.json();
  const { 
    category_id, supplier_id, description, amount, currency,
    amount_local, exchange_rate, expense_date, invoice_number, notes 
  } = body;
  
  const result = await c.env.DB.prepare(
    `INSERT INTO expenses (
      category_id, supplier_id, description, amount, currency, 
      amount_local, exchange_rate, expense_date, invoice_number, notes,
      recorded_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'admin', datetime('now'), datetime('now'))`
  ).bind(
    category_id, supplier_id || null, description, amount, currency || "USD",
    amount_local || null, exchange_rate || null, expense_date, invoice_number || null, notes || null
  ).run();
  
  return c.json({ id: result.meta.last_row_id, success: true });
});

// Delete expense
app.delete("/api/finance/expenses/:id", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM expenses WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// =====================
// EMPLOYEES & PAYROLL API
// =====================

// Get all employees
app.get("/api/employees", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM employees ORDER BY name"
  ).all();
  return c.json(results);
});

// Create employee
app.post("/api/employees", adminOrUserMiddleware, async (c) => {
  const body = await c.req.json();
  const { name, document_id, phone, email, position, department, hire_date, base_salary, salary_currency, notes } = body;

  const result = await c.env.DB.prepare(
    `INSERT INTO employees (name, document_id, phone, email, position, department, hire_date, base_salary, salary_currency, notes, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
  ).bind(name, document_id || null, phone || null, email || null, position || null, department || null, hire_date || null, base_salary || null, salary_currency || "USD", notes || null).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

// Update employee
app.patch("/api/employees/:id", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { name, document_id, phone, email, position, department, hire_date, base_salary, salary_currency, notes } = body;

  await c.env.DB.prepare(
    `UPDATE employees SET name = ?, document_id = ?, phone = ?, email = ?, position = ?, department = ?, hire_date = ?, base_salary = ?, salary_currency = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).bind(name, document_id || null, phone || null, email || null, position || null, department || null, hire_date || null, base_salary || null, salary_currency || "USD", notes || null, id).run();

  return c.json({ success: true });
});

// Delete employee (soft delete - set is_active = 0)
app.delete("/api/employees/:id", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare(
    "UPDATE employees SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(id).run();
  return c.json({ success: true });
});

// Get payroll records
app.get("/api/payroll", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT p.*, e.name as employee_name
     FROM payroll p
     LEFT JOIN employees e ON p.employee_id = e.id
     ORDER BY p.period_year DESC, p.period_month DESC, e.name`
  ).all();
  return c.json(results);
});

// Create payroll record
app.post("/api/payroll", adminOrUserMiddleware, async (c) => {
  const body = await c.req.json();
  const { employee_id, period_month, period_year, base_amount, bonuses, deductions, total_amount, currency, notes } = body;

  const result = await c.env.DB.prepare(
    `INSERT INTO payroll (employee_id, period_month, period_year, base_amount, bonuses, deductions, total_amount, currency, is_paid, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
  ).bind(employee_id, period_month, period_year, base_amount || 0, bonuses || 0, deductions || 0, total_amount || 0, currency || "USD", notes || null).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

// Mark payroll as paid
app.post("/api/payroll/:id/pay", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { paid_date } = body;

  await c.env.DB.prepare(
    "UPDATE payroll SET is_paid = 1, paid_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(paid_date || new Date().toISOString().split("T")[0], id).run();

  return c.json({ success: true });
});

// =====================
// ACCOUNTS RECEIVABLE API
// =====================

// Get all accounts receivable
app.get("/api/finance/receivables", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT ar.*, g.name as guest_name 
     FROM accounts_receivable ar
     LEFT JOIN guests g ON ar.guest_id = g.id
     ORDER BY ar.status ASC, ar.due_date ASC`
  ).all();
  return c.json({ accounts: results });
});

// Get guests for dropdown
app.get("/api/finance/guests", adminOrUserMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, name, phone, email FROM guests ORDER BY name"
  ).all();
  return c.json({ guests: results });
});

// Create account receivable
app.post("/api/finance/receivables", adminOrUserMiddleware, async (c) => {
  const body = await c.req.json();
  const { 
    account_type, guest_id, company_name, company_contact, company_phone,
    reservation_id, description, total_amount, currency, due_date, notes 
  } = body;
  
  const result = await c.env.DB.prepare(
    `INSERT INTO accounts_receivable (
      account_type, guest_id, company_name, company_contact, company_phone,
      reservation_id, description, total_amount, paid_amount, currency, 
      due_date, status, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'pending', ?, datetime('now'), datetime('now'))`
  ).bind(
    account_type || "guest", guest_id || null, company_name || null, 
    company_contact || null, company_phone || null, reservation_id || null,
    description, total_amount, currency || "USD", due_date || null, notes || null
  ).run();
  
  return c.json({ id: result.meta.last_row_id, success: true });
});

// Register payment for account receivable
app.post("/api/finance/receivables/:id/payment", adminOrUserMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { amount } = body;
  
  // Get current account
  const account = await c.env.DB.prepare(
    "SELECT * FROM accounts_receivable WHERE id = ?"
  ).bind(id).first();
  
  if (!account) {
    return c.json({ error: "Account not found" }, 404);
  }
  
  const newPaidAmount = (account.paid_amount as number) + amount;
  const totalAmount = account.total_amount as number;
  
  // Determine new status
  let newStatus = "partial";
  if (newPaidAmount >= totalAmount) {
    newStatus = "paid";
  } else if (newPaidAmount > 0) {
    newStatus = "partial";
  }
  
  await c.env.DB.prepare(
    `UPDATE accounts_receivable 
     SET paid_amount = ?, status = ?, updated_at = datetime('now') 
     WHERE id = ?`
  ).bind(newPaidAmount, newStatus, id).run();
  
  return c.json({ success: true, new_paid_amount: newPaidAmount, status: newStatus });
});

// P&L Report
app.get("/api/finance/pl-report", adminOrUserMiddleware, async (c) => {
  const month = parseInt(c.req.query("month") || String(new Date().getMonth() + 1));
  const year = parseInt(c.req.query("year") || String(new Date().getFullYear()));
  const period = c.req.query("period") || "month";
  
  let startDate: string, endDate: string;
  
  if (period === "year") {
    startDate = `${year}-01-01`;
    endDate = `${year}-12-31`;
  } else if (period === "quarter") {
    const quarter = Math.ceil(month / 3);
    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = quarter * 3;
    startDate = `${year}-${String(startMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(year, endMonth, 0).getDate();
    endDate = `${year}-${String(endMonth).padStart(2, '0')}-${lastDay}`;
  } else {
    startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
  }
  
  // Get income from finance_payments
  const incomeResult = await c.env.DB.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total 
     FROM finance_payments 
     WHERE payment_date BETWEEN ? AND ?`
  ).bind(startDate, endDate).first();
  const income = (incomeResult?.total as number) || 0;
  
  // Get expenses
  const expensesResult = await c.env.DB.prepare(
    `SELECT COALESCE(SUM(amount), 0) as total 
     FROM expenses 
     WHERE expense_date BETWEEN ? AND ?`
  ).bind(startDate, endDate).first();
  const expenses = (expensesResult?.total as number) || 0;
  
  // Get payroll
  const payrollResult = await c.env.DB.prepare(
    `SELECT COALESCE(SUM(total_amount), 0) as total 
     FROM payroll 
     WHERE period_year = ? AND period_month BETWEEN ? AND ?`
  ).bind(
    year, 
    period === "year" ? 1 : (period === "quarter" ? (Math.ceil(month / 3) - 1) * 3 + 1 : month),
    period === "year" ? 12 : (period === "quarter" ? Math.ceil(month / 3) * 3 : month)
  ).first();
  const payroll = (payrollResult?.total as number) || 0;
  
  // Get pending receivables
  const receivablesResult = await c.env.DB.prepare(
    `SELECT COALESCE(SUM(total_amount - paid_amount), 0) as total 
     FROM accounts_receivable 
     WHERE status != 'paid'`
  ).first();
  const receivables_pending = (receivablesResult?.total as number) || 0;
  
  // Get expense breakdown by category
  const { results: expenseBreakdown } = await c.env.DB.prepare(
    `SELECT ec.name, COALESCE(SUM(e.amount), 0) as amount
     FROM expenses e
     LEFT JOIN expense_categories ec ON e.category_id = ec.id
     WHERE e.expense_date BETWEEN ? AND ?
     GROUP BY e.category_id
     ORDER BY amount DESC`
  ).bind(startDate, endDate).all();
  
  const totalExpenses = expenses + payroll;
  const expense_breakdown = expenseBreakdown.map((item: any) => ({
    name: item.name || "Sin categoría",
    amount: item.amount,
    percentage: totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0
  }));
  
  // Add payroll to breakdown
  if (payroll > 0) {
    expense_breakdown.push({
      name: "Nómina y Personal",
      amount: payroll,
      percentage: totalExpenses > 0 ? (payroll / totalExpenses) * 100 : 0
    });
  }
  
  return c.json({
    summary: {
      income,
      expenses,
      payroll,
      receivables_pending,
      net_profit: income - expenses - payroll
    },
    income_breakdown: [],
    expense_breakdown,
    monthly_data: []
  });
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
