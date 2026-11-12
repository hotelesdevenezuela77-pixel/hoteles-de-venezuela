const SUPABASE_URL = "https://ghgetcznlrilgocwigmj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_0ycztlhClHILzkaEml6gyw_rADY60GR";
const BASE_URL = "https://hotelesdevenezuela.com";

function escapeXml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatLastMod(row, fallbackDate) {
  const raw =
    row?.updated_at ||
    row?.published_at ||
    row?.created_at ||
    fallbackDate;
  if (!raw) return fallbackDate;
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return fallbackDate;
    return d.toISOString().split("T")[0];
  } catch {
    return fallbackDate;
  }
}

async function fetchSupabaseTable(tableAndQuery, env) {
  const url = `${env?.VITE_SUPABASE_URL || SUPABASE_URL}/rest/v1/${tableAndQuery}`;
  const key = env?.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;
  const res = await fetch(url, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase error ${res.status} on ${tableAndQuery}`);
  }
  return res.json();
}

export async function buildDynamicSitemapXml(env) {
  const today = new Date().toISOString().split("T")[0];
  const urlMap = new Map();

  const addUrlEntry = (urlPath, priority, changefreq, lastmod) => {
    if (!urlPath || typeof urlPath !== "string") return;
    const cleanPath = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
    if (
      cleanPath.includes("aura-croce") ||
      cleanPath.includes("undefined") ||
      cleanPath.includes("null")
    ) {
      return;
    }
    if (!urlMap.has(cleanPath)) {
      urlMap.set(cleanPath, {
        url: cleanPath,
        priority,
        changefreq,
        lastmod: lastmod || today,
      });
    }
  };

  // 1. HOME PRINCIPAL Y PILAR SEO (Prioridad 1.0)
  addUrlEntry("/", "1.0", "daily", today);
  addUrlEntry("/hoteles-en-venezuela", "1.0", "daily", today);

  // 2. DIRECTORIOS Y SECCIONES PRINCIPALES (Prioridad 0.9)
  const highPriorityDirectories = [
    { url: "/establecimientos", freq: "daily" },
    { url: "/explorar", freq: "daily" },
    { url: "/destinos", freq: "daily" },
    { url: "/blog", freq: "daily" },
    { url: "/sitios-turisticos", freq: "weekly" },
    { url: "/parques", freq: "weekly" },
    { url: "/mapa", freq: "weekly" },
    { url: "/paquetes", freq: "weekly" },
    { url: "/prestigio-2026", freq: "weekly" },
    { url: "/los-10-mejores-hoteles", freq: "weekly" },
    { url: "/top-10-hoteles", freq: "weekly" },
  ];
  for (const dir of highPriorityDirectories) {
    addUrlEntry(dir.url, "0.9", dir.freq, today);
  }

  // 3. PÁGINAS TRANSACCIONALES / B2B / HERRAMIENTAS (Prioridad 0.8)
  const commercialRoutes = [
    { url: "/servicios-b2b", freq: "weekly" },
    { url: "/comparar", freq: "weekly" },
    { url: "/viaje-ia", freq: "weekly" },
    { url: "/membresias", freq: "weekly" },
    { url: "/50-fundadores", freq: "weekly" },
    { url: "/alianzas-para-agencias", freq: "weekly" },
    { url: "/pre-registro", freq: "monthly" },
  ];
  for (const route of commercialRoutes) {
    addUrlEntry(route.url, "0.8", route.freq, today);
  }

  // 4. PÁGINAS LEGALES Y ESTÁTICAS (Prioridad 0.5)
  const legalAndStaticRoutes = [
    { url: "/sobre-nosotros", freq: "monthly" },
    { url: "/soporte", freq: "monthly" },
    { url: "/reportar-pago", freq: "monthly" },
    { url: "/privacidad", freq: "monthly" },
    { url: "/terminos", freq: "monthly" },
    { url: "/sitemap", freq: "weekly" },
    { url: "/links", freq: "monthly" },
  ];
  for (const route of legalAndStaticRoutes) {
    addUrlEntry(route.url, "0.5", route.freq, today);
  }

  // 5-10. CONSULTAS EN TIEMPO REAL A SUPABASE
  const [destRows, estRows, blogRows, siteRows, parkRows, customRows] =
    await Promise.all([
      fetchSupabaseTable("destinations?select=slug,updated_at,created_at&order=id.asc", env),
      fetchSupabaseTable("establishments?select=slug,updated_at,created_at&status=eq.approved&order=id.asc", env),
      fetchSupabaseTable("blog_posts?select=slug,updated_at,published_at,created_at&status=eq.published&order=id.asc", env),
      fetchSupabaseTable("tourist_sites?select=slug,updated_at,created_at&is_active=eq.true&order=id.asc", env),
      fetchSupabaseTable("national_parks?select=slug,updated_at,created_at&order=id.asc", env),
      fetchSupabaseTable("custom_pages?select=slug,updated_at,created_at&is_published=eq.true&order=id.asc", env),
    ]);

  for (const row of destRows || []) {
    if (row.slug) {
      addUrlEntry(`/destinos/${row.slug}`, "0.9", "weekly", formatLastMod(row, today));
    }
  }

  for (const row of estRows || []) {
    if (row.slug && !row.slug.includes("aura-croce")) {
      addUrlEntry(`/establecimiento/${row.slug}`, "0.8", "weekly", formatLastMod(row, today));
    }
  }

  for (const row of blogRows || []) {
    if (row.slug) {
      addUrlEntry(`/blog/${row.slug}`, "0.8", "weekly", formatLastMod(row, today));
    }
  }

  for (const row of siteRows || []) {
    if (row.slug) {
      addUrlEntry(`/sitio/${row.slug}`, "0.8", "weekly", formatLastMod(row, today));
    }
  }

  for (const row of parkRows || []) {
    if (row.slug) {
      addUrlEntry(`/parque/${row.slug}`, "0.8", "weekly", formatLastMod(row, today));
    }
  }

  for (const row of customRows || []) {
    if (row.slug) {
      const cleanCustom = row.slug.startsWith("/") ? row.slug : `/${row.slug}`;
      addUrlEntry(cleanCustom, "0.8", "weekly", formatLastMod(row, today));
    }
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
  xml += `        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n`;

  for (const entry of urlMap.values()) {
    const fullLoc = escapeXml(`${BASE_URL}${entry.url}`);
    xml += `  <url>\n`;
    xml += `    <loc>${fullLoc}</loc>\n`;
    xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

export async function onRequest(context) {
  try {
    const xml = await buildDynamicSitemapXml(context.env);
    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
        "X-Sitemap-Mode": "supabase-realtime-edge",
      },
    });
  } catch (err) {
    // Si hubiera algún corte momentáneo de red con Supabase, servir el public/sitemap.xml estático
    if (context.env && context.env.ASSETS) {
      return context.env.ASSETS.fetch(context.request);
    }
    return new Response(`<!-- Error fallback: ${err?.message || "unknown"} -->`, {
      status: 500,
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }
}

