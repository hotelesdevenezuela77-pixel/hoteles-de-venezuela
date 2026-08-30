import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

// ============ AUTH ============
app.post("/api/auth/login", async (c) => {
  const { username, password } = await c.req.json();
  
  // Credentials for Oleaje admin
  const validUsername = "admin@oleajerestaurantbeach.club";
  const validPassword = "Hola177*H";
  
  if (username === validUsername && password === validPassword) {
    return c.json({ success: true });
  }
  
  return c.json({ error: "Invalid credentials" }, 401);
});

// ============ ZONES ============
app.get("/api/zones", async (c) => {
  const zones = await c.env.DB.prepare("SELECT * FROM zones ORDER BY id").all();
  return c.json(zones.results);
});

// ============ TABLES ============
app.get("/api/tables", async (c) => {
  const zoneSlug = c.req.query("zone");
  
  let query = `
    SELECT t.*, z.name as zone_name, z.slug as zone_slug
    FROM tables t
    JOIN zones z ON t.zone_id = z.id
  `;
  
  if (zoneSlug) {
    query += ` WHERE z.slug = ?`;
    const tables = await c.env.DB.prepare(query).bind(zoneSlug).all();
    return c.json(tables.results);
  }
  
  const tables = await c.env.DB.prepare(query).all();
  return c.json(tables.results);
});

app.put("/api/tables/:id", async (c) => {
  const id = c.req.param("id");
  const { status } = await c.req.json();
  
  await c.env.DB.prepare(
    "UPDATE tables SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(status, id).run();
  
  return c.json({ success: true });
});

// ============ CATEGORIES ============
app.get("/api/categories", async (c) => {
  const categories = await c.env.DB.prepare(
    "SELECT * FROM categories ORDER BY sort_order"
  ).all();
  return c.json(categories.results);
});

// ============ PRODUCTS ============
app.get("/api/products", async (c) => {
  const categorySlug = c.req.query("category");
  
  let query = `
    SELECT p.*, c.slug as category_slug, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_available = 1
  `;
  
  if (categorySlug && categorySlug !== "all") {
    query += ` AND c.slug = ?`;
    const products = await c.env.DB.prepare(query).bind(categorySlug).all();
    return c.json(products.results);
  }
  
  query += ` ORDER BY c.sort_order, p.name`;
  const products = await c.env.DB.prepare(query).all();
  return c.json(products.results);
});

// ============ ORDERS ============
app.get("/api/orders", async (c) => {
  const status = c.req.query("status") || "open";
  const zoneSlug = c.req.query("zone");
  
  let query = `SELECT * FROM orders WHERE status = ?`;
  const params: string[] = [status];
  
  if (zoneSlug) {
    query += ` AND zone_slug = ?`;
    params.push(zoneSlug);
  }
  
  query += ` ORDER BY created_at DESC`;
  
  const orders = await c.env.DB.prepare(query).bind(...params).all();
  return c.json(orders.results);
});

app.get("/api/orders/:id", async (c) => {
  const id = c.req.param("id");
  
  const order = await c.env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first();
  if (!order) {
    return c.json({ error: "Order not found" }, 404);
  }
  
  const items = await c.env.DB.prepare(
    "SELECT * FROM order_items WHERE order_id = ? ORDER BY created_at"
  ).bind(id).all();
  
  return c.json({ ...order, items: items.results });
});

app.post("/api/orders", async (c) => {
  const { zone_slug, table_number, table_id, customer_name, customer_phone, customer_cedula } = await c.req.json();
  
  const result = await c.env.DB.prepare(`
    INSERT INTO orders (zone_slug, table_number, table_id, status, customer_name, customer_phone, customer_cedula)
    VALUES (?, ?, ?, 'open', ?, ?, ?)
  `).bind(zone_slug, table_number, table_id || null, customer_name || null, customer_phone || null, customer_cedula || null).run();
  
  // Update table status if table_id provided
  if (table_id) {
    await c.env.DB.prepare(
      "UPDATE tables SET status = 'occupied' WHERE id = ?"
    ).bind(table_id).run();
  }
  
  const order = await c.env.DB.prepare("SELECT * FROM orders WHERE id = ?")
    .bind(result.meta.last_row_id).first();
  
  return c.json(order, 201);
});

app.put("/api/orders/:id", async (c) => {
  const id = c.req.param("id");
  const { status, notes, customer_name, customer_phone, customer_cedula } = await c.req.json();
  
  const order = await c.env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first() as any;
  if (!order) {
    return c.json({ error: "Order not found" }, 404);
  }
  
  await c.env.DB.prepare(`
    UPDATE orders 
    SET status = COALESCE(?, status), 
        notes = COALESCE(?, notes),
        customer_name = COALESCE(?, customer_name),
        customer_phone = COALESCE(?, customer_phone),
        customer_cedula = COALESCE(?, customer_cedula),
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `).bind(status || null, notes || null, customer_name || null, customer_phone || null, customer_cedula || null, id).run();
  
  // If order is closed, free up the table
  if (status === 'paid' || status === 'cancelled') {
    if (order.table_id) {
      await c.env.DB.prepare(
        "UPDATE tables SET status = 'available' WHERE id = ?"
      ).bind(order.table_id).run();
    }
  }
  
  return c.json({ success: true });
});

// ============ ORDER ITEMS ============
app.post("/api/orders/:id/items", async (c) => {
  const orderId = c.req.param("id");
  const { product_id, product_name, quantity, unit_price, notes } = await c.req.json();
  
  const totalPrice = quantity * unit_price;
  
  await c.env.DB.prepare(`
    INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(orderId, product_id || null, product_name, quantity, unit_price, totalPrice, notes || null).run();
  
  // Recalculate order totals
  await recalculateOrderTotal(c.env.DB, orderId);
  
  const order = await c.env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(orderId).first();
  const items = await c.env.DB.prepare("SELECT * FROM order_items WHERE order_id = ?").bind(orderId).all();
  
  return c.json({ ...order, items: items.results });
});

app.put("/api/orders/:orderId/items/:itemId", async (c) => {
  const { orderId, itemId } = c.req.param();
  const { quantity, notes } = await c.req.json();
  
  const item = await c.env.DB.prepare("SELECT * FROM order_items WHERE id = ?").bind(itemId).first() as any;
  if (!item) {
    return c.json({ error: "Item not found" }, 404);
  }
  
  if (quantity <= 0) {
    await c.env.DB.prepare("DELETE FROM order_items WHERE id = ?").bind(itemId).run();
  } else {
    const totalPrice = quantity * item.unit_price;
    await c.env.DB.prepare(`
      UPDATE order_items 
      SET quantity = ?, total_price = ?, notes = COALESCE(?, notes), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(quantity, totalPrice, notes || null, itemId).run();
  }
  
  await recalculateOrderTotal(c.env.DB, orderId);
  
  const order = await c.env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(orderId).first();
  const items = await c.env.DB.prepare("SELECT * FROM order_items WHERE order_id = ?").bind(orderId).all();
  
  return c.json({ ...order, items: items.results });
});

app.delete("/api/orders/:orderId/items/:itemId", async (c) => {
  const { orderId, itemId } = c.req.param();
  
  await c.env.DB.prepare("DELETE FROM order_items WHERE id = ?").bind(itemId).run();
  await recalculateOrderTotal(c.env.DB, orderId);
  
  return c.json({ success: true });
});

// ============ DAILY SALES REPORT ============
app.get("/api/reports/daily", async (c) => {
  const date = c.req.query("date") || new Date().toISOString().split('T')[0];
  
  // Get all paid orders for the date
  const orders = await c.env.DB.prepare(`
    SELECT * FROM orders 
    WHERE status = 'paid' 
    AND DATE(created_at) = ?
    ORDER BY created_at DESC
  `).bind(date).all();
  
  // Calculate totals
  const summary = await c.env.DB.prepare(`
    SELECT 
      COUNT(*) as total_orders,
      COALESCE(SUM(subtotal), 0) as total_subtotal,
      COALESCE(SUM(service_charge), 0) as total_service,
      COALESCE(SUM(total), 0) as total_sales
    FROM orders 
    WHERE status = 'paid' 
    AND DATE(created_at) = ?
  `).bind(date).first();
  
  // Service points calculation (divide by 25)
  const servicePoints = ((summary as any)?.total_service || 0) / 25;
  
  return c.json({
    date,
    orders: orders.results,
    summary: {
      ...summary,
      service_points: servicePoints
    }
  });
});

// ============ SALES BY ZONE ============
app.get("/api/reports/by-zone", async (c) => {
  const date = c.req.query("date") || new Date().toISOString().split('T')[0];
  
  const result = await c.env.DB.prepare(`
    SELECT 
      zone_slug,
      COUNT(*) as order_count,
      COALESCE(SUM(subtotal), 0) as subtotal,
      COALESCE(SUM(service_charge), 0) as service,
      COALESCE(SUM(total), 0) as total
    FROM orders 
    WHERE status = 'paid' 
    AND DATE(created_at) = ?
    GROUP BY zone_slug
    ORDER BY total DESC
  `).bind(date).all();
  
  return c.json(result.results);
});

// ============ TOP SELLING PRODUCTS ============
app.get("/api/reports/top-products", async (c) => {
  const date = c.req.query("date") || new Date().toISOString().split('T')[0];
  const limit = parseInt(c.req.query("limit") || "10");
  
  const result = await c.env.DB.prepare(`
    SELECT 
      oi.product_name,
      SUM(oi.quantity) as total_quantity,
      SUM(oi.total_price) as total_revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status = 'paid' 
    AND DATE(o.created_at) = ?
    GROUP BY oi.product_name
    ORDER BY total_quantity DESC
    LIMIT ?
  `).bind(date, limit).all();
  
  return c.json(result.results);
});

// ============ HOURLY SALES ============
app.get("/api/reports/hourly", async (c) => {
  const date = c.req.query("date") || new Date().toISOString().split('T')[0];
  
  const result = await c.env.DB.prepare(`
    SELECT 
      strftime('%H', created_at) as hour,
      COUNT(*) as order_count,
      COALESCE(SUM(total), 0) as total_sales
    FROM orders 
    WHERE status = 'paid' 
    AND DATE(created_at) = ?
    GROUP BY strftime('%H', created_at)
    ORDER BY hour
  `).bind(date).all();
  
  return c.json(result.results);
});

// ============ WEEKLY SERVICE POINTS ============
app.get("/api/reports/weekly-points", async (c) => {
  const endDate = c.req.query("end_date") || new Date().toISOString().split('T')[0];
  
  // Calculate start of week (7 days ago)
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 6);
  const startDateStr = startDate.toISOString().split('T')[0];
  
  const result = await c.env.DB.prepare(`
    SELECT 
      DATE(created_at) as date,
      COALESCE(SUM(service_charge), 0) as daily_service,
      COALESCE(SUM(service_charge), 0) / 25 as daily_points
    FROM orders 
    WHERE status = 'paid' 
    AND DATE(created_at) BETWEEN ? AND ?
    GROUP BY DATE(created_at)
    ORDER BY date
  `).bind(startDateStr, endDate).all();
  
  const totalService = result.results.reduce((sum: number, r: any) => sum + (r.daily_service || 0), 0);
  const totalPoints = totalService / 25;
  
  return c.json({
    start_date: startDateStr,
    end_date: endDate,
    daily_breakdown: result.results,
    total_service: totalService,
    total_points: totalPoints
  });
});

// Helper function to recalculate order totals with 10% service charge
async function recalculateOrderTotal(db: D1Database, orderId: string) {
  const result = await db.prepare(`
    SELECT COALESCE(SUM(total_price), 0) as subtotal FROM order_items WHERE order_id = ?
  `).bind(orderId).first() as any;
  
  const subtotal = result?.subtotal || 0;
  const serviceCharge = subtotal * 0.10; // 10% service charge
  const total = subtotal + serviceCharge;
  
  await db.prepare(`
    UPDATE orders SET subtotal = ?, service_charge = ?, total = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(subtotal, serviceCharge, total, orderId).run();
}

export default app;
