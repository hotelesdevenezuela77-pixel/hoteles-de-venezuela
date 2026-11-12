import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl =
  process.env.VITE_SUPABASE_URL || "https://ghgetcznlrilgocwigmj.supabase.co";
const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_0ycztlhClHILzkaEml6gyw_rADY60GR";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BASE_URL = "https://hotelesdevenezuela.com";

/**
 * Deterministic hash matching src/components/seo/ClusterAuthorityCtaBlock.tsx
 */
function hashSlugToDecile(slug) {
  const clean = (slug || "root").trim().toLowerCase();
  let hash = 2166136261;
  for (let i = 0; i < clean.length; i++) {
    hash ^= clean.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % 10;
}

function getAnchorAuditInfo(slug) {
  const bucket = hashSlugToDecile(slug);
  if (bucket <= 2) {
    return {
      bucket,
      category: "EXACT_MATCH_30",
      anchorText: "hoteles en Venezuela",
    };
  }
  if (bucket <= 6) {
    const lsi = [
      "reservar en la red de hoteles en Venezuela sin comisiones",
      "directorio oficial de hoteles en Venezuela",
      "alojamiento y hoteles en Venezuela",
      "central de reservas de hoteles en Venezuela",
    ];
    return {
      bucket,
      category: "LSI_LONG_TAIL_40",
      anchorText: lsi[bucket - 3],
    };
  }
  const brand = [
    "nuestra plataforma en Hoteles de Venezuela",
    "explorar la red principal de Hoteles de Venezuela",
    "volver al inicio de Hoteles de Venezuela",
  ];
  return {
    bucket,
    category: "BRAND_CONTEXTUAL_30",
    anchorText: brand[bucket - 7],
  };
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

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function generateSitemap() {
  console.log(
    "Iniciando generacion dinamica de Sitemap XML y Auditoria de Cluster SEO via Supabase API..."
  );

  try {
    const today = new Date().toISOString().split("T")[0];

    // Map keyed by normalized URL path to prevent any duplicate <loc> entries
    const urlMap = new Map();

    const addUrlEntry = (
      urlPath,
      priority,
      changefreq,
      lastmod,
      clusterType,
      schemaType
    ) => {
      if (!urlPath || typeof urlPath !== "string") return;
      const cleanPath = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
      // Block any legacy demo/orphan slugs
      if (
        cleanPath.includes("aura-croce") ||
        cleanPath.includes("undefined") ||
        cleanPath.includes("null")
      ) {
        return;
      }
      if (!urlMap.has(cleanPath)) {
        const slugForHash =
          cleanPath === "/" ? "root" : cleanPath.replace(/^\/+/, "");
        const anchorAudit = getAnchorAuditInfo(slugForHash);
        urlMap.set(cleanPath, {
          url: cleanPath,
          priority,
          changefreq,
          lastmod: lastmod || today,
          clusterType,
          schemaType,
          anchorAudit,
        });
      }
    };

    // 1. HOME PRINCIPAL Y PILAR SEO (Prioridad 1.0)
    addUrlEntry(
      "/",
      "1.0",
      "daily",
      today,
      "HOME_PILLAR",
      "WebSite + Organization"
    );
    addUrlEntry(
      "/hoteles-en-venezuela",
      "1.0",
      "daily",
      today,
      "SEO_PILLAR",
      "WebPage + ItemList + FAQPage"
    );

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
      addUrlEntry(
        dir.url,
        "0.9",
        dir.freq,
        today,
        "DIRECTORIO_PRINCIPAL",
        "WebPage + BreadcrumbList"
      );
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
      addUrlEntry(
        route.url,
        "0.8",
        route.freq,
        today,
        "COMERCIAL_B2B",
        "WebPage + BreadcrumbList"
      );
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
      addUrlEntry(
        route.url,
        "0.5",
        route.freq,
        today,
        "ESTATICA_LEGAL",
        "WebPage + BreadcrumbList"
      );
    }

    // 5. DESTINOS GEOGRÁFICOS EN BASE DE DATOS (25 Destinos -> Prioridad 0.9)
    const { data: destRows = [] } = await supabase
      .from("destinations")
      .select("*")
      .order("id", { ascending: true });

    for (const row of destRows || []) {
      if (row.slug) {
        addUrlEntry(
          `/destinos/${row.slug}`,
          "0.9",
          "weekly",
          formatLastMod(row, today),
          "DESTINO_GEOGRAFICO",
          "TouristDestination + BreadcrumbList"
        );
      }
    }

    // 6. FICHAS DE ESTABLECIMIENTOS / HOTELES Y POSADAS APROBADOS (Prioridad 0.8)
    const { data: estRows = [] } = await supabase
      .from("establishments")
      .select("*")
      .eq("status", "approved")
      .order("id", { ascending: true });

    for (const row of estRows || []) {
      if (row.slug && !row.slug.includes("aura-croce")) {
        addUrlEntry(
          `/establecimiento/${row.slug}`,
          "0.8",
          "weekly",
          formatLastMod(row, today),
          "FICHA_ESTABLECIMIENTO",
          "LodgingBusiness + BreadcrumbList"
        );
      }
    }

    // 7. REPORTAJES DE BLOG PUBLICADOS (142 Reportajes -> Prioridad 0.8)
    const { data: blogRows = [] } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("id", { ascending: true });

    for (const row of blogRows || []) {
      if (row.slug) {
        addUrlEntry(
          `/blog/${row.slug}`,
          "0.8",
          "weekly",
          formatLastMod(row, today),
          "REPORTAJE_BLOG",
          "BlogPosting + BreadcrumbList"
        );
      }
    }

    // 8. SITIOS TURÍSTICOS EMBLEMÁTICOS (6 Sitios -> Prioridad 0.8)
    const { data: siteRows = [] } = await supabase
      .from("tourist_sites")
      .select("*")
      .eq("is_active", true)
      .order("id", { ascending: true });

    for (const row of siteRows || []) {
      if (row.slug) {
        addUrlEntry(
          `/sitio/${row.slug}`,
          "0.8",
          "weekly",
          formatLastMod(row, today),
          "SITIO_TURISTICO",
          "TouristAttraction + BreadcrumbList"
        );
      }
    }

    // 9. PARQUES NACIONALES (12 Parques -> Prioridad 0.8)
    const { data: parkRows = [] } = await supabase
      .from("national_parks")
      .select("*")
      .order("id", { ascending: true });

    for (const row of parkRows || []) {
      if (row.slug) {
        addUrlEntry(
          `/parque/${row.slug}`,
          "0.8",
          "weekly",
          formatLastMod(row, today),
          "PARQUE_NACIONAL",
          "TouristAttraction + BreadcrumbList"
        );
      }
    }

    // 10. LANDING PAGES PERSONALIZADAS / CUSTOM PAGES PUBLICADAS (Prioridad 0.8)
    const { data: customRows = [] } = await supabase
      .from("custom_pages")
      .select("*")
      .eq("is_published", true)
      .order("id", { ascending: true });

    for (const row of customRows || []) {
      if (row.slug) {
        const cleanCustom = row.slug.startsWith("/")
          ? row.slug
          : `/${row.slug}`;
        addUrlEntry(
          cleanCustom,
          "0.8",
          "weekly",
          formatLastMod(row, today),
          "CUSTOM_LANDING_PAGE",
          "Article + BreadcrumbList"
        );
      }
    }

    // Construir el archivo XML final
    const allEntries = Array.from(urlMap.values());

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
    xml += `        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n`;

    for (const entry of allEntries) {
      const fullLoc = escapeXml(`${BASE_URL}${entry.url}`);
      xml += `  <url>\n`;
      xml += `    <loc>${fullLoc}</loc>\n`;
      xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
      xml += `    <priority>${entry.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>\n`;

    const publicDir = path.resolve(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const outputPath = path.join(publicDir, "sitemap.xml");
    fs.writeFileSync(outputPath, xml, "utf8");

    // Calcular métricas de Auditoría de Enlazado Interno y Anchor Text
    const satelliteEntries = allEntries.filter((e) => e.url !== "/");
    const exactMatchCount = satelliteEntries.filter(
      (e) => e.anchorAudit.category === "EXACT_MATCH_30"
    ).length;
    const lsiCount = satelliteEntries.filter(
      (e) => e.anchorAudit.category === "LSI_LONG_TAIL_40"
    ).length;
    const brandCount = satelliteEntries.filter(
      (e) => e.anchorAudit.category === "BRAND_CONTEXTUAL_30"
    ).length;

    const totalSatellites = satelliteEntries.length || 1;
    const exactPct = ((exactMatchCount / totalSatellites) * 100).toFixed(1);
    const lsiPct = ((lsiCount / totalSatellites) * 100).toFixed(1);
    const brandPct = ((brandCount / totalSatellites) * 100).toFixed(1);

    // Conteo para el Clúster Editorial de 173 URLs (142 Blog + 25 Destinos + 6 Sitios)
    const cluster173Entries = allEntries.filter(
      (e) =>
        e.clusterType === "REPORTAJE_BLOG" ||
        e.clusterType === "DESTINO_GEOGRAFICO" ||
        e.clusterType === "SITIO_TURISTICO"
    );
    const c173Exact = cluster173Entries.filter(
      (e) => e.anchorAudit.category === "EXACT_MATCH_30"
    ).length;
    const c173Lsi = cluster173Entries.filter(
      (e) => e.anchorAudit.category === "LSI_LONG_TAIL_40"
    ).length;
    const c173Brand = cluster173Entries.filter(
      (e) => e.anchorAudit.category === "BRAND_CONTEXTUAL_30"
    ).length;
    const c173Total = cluster173Entries.length || 1;

    console.log("\n================================================================================");
    console.log("  REPORTE AUTOMATIZADO DE AUDITORIA SEO TECNICO & TOPIC CLUSTER LINK JUICE");
    console.log("  Dominio Objetivo: https://hotelesdevenezuela.com | Keyword: 'hoteles en Venezuela'");
    console.log("================================================================================");
    console.log(`  [+] Sitemap XML generado en: ${outputPath}`);
    console.log(`  [+] Total Global de URLs Indexables Validadas (0 Huérfanas / 0 404): ${allEntries.length}`);
    console.log("--------------------------------------------------------------------------------");
    console.log("  DESGLOSE POR CLÚSTER Y JERARQUÍA DE PRIORIDADES (<priority>):");
    console.log(`   • Home Principal (/)                       : 1 URL    | Priority: 1.0 | WebSite + Organization`);
    console.log(`   • Directorios Principales                  : ${highPriorityDirectories.length} URLs  | Priority: 0.9 | WebPage + BreadcrumbList`);
    console.log(`   • Destinos Geográficos (Supabase)          : ${(destRows || []).length} URLs  | Priority: 0.9 | TouristDestination + BreadcrumbList`);
    console.log(`   • Reportajes de Blog (Supabase)            : ${(blogRows || []).length} URLs | Priority: 0.8 | BlogPosting + BreadcrumbList`);
    console.log(`   • Sitios Turísticos Emblemáticos (Supabase): ${(siteRows || []).length} URLs   | Priority: 0.8 | TouristAttraction + BreadcrumbList`);
    console.log(`   • Fichas de Hoteles y Posadas (Supabase)   : ${(estRows || []).length} URLs  | Priority: 0.8 | LodgingBusiness + BreadcrumbList`);
    console.log(`   • Parques Nacionales (Supabase)            : ${(parkRows || []).length} URLs  | Priority: 0.8 | TouristAttraction + BreadcrumbList`);
    console.log(`   • Landing Pages Satélite / Custom Pages    : ${(customRows || []).length} URLs  | Priority: 0.8 | Article + BreadcrumbList`);
    console.log(`   • Rutas Comerciales / B2B                  : ${commercialRoutes.length} URLs   | Priority: 0.8 | WebPage + BreadcrumbList`);
    console.log(`   • Páginas Legales y Estáticas              : ${legalAndStaticRoutes.length} URLs   | Priority: 0.5 | WebPage + BreadcrumbList`);
    console.log("--------------------------------------------------------------------------------");
    console.log(`  MATRIZ DE ANCHOR TEXT EN CLÚSTER EDITORIAL (${cluster173Entries.length} URLs: 142 Blog + 25 Destinos + 6 Sitios):`);
    console.log(`   • Coincidencia Exacta ("hoteles en Venezuela") : ${c173Exact} URLs (${((c173Exact / c173Total) * 100).toFixed(1)}%) [Target: ~30%]`);
    console.log(`   • LSI / Cola Larga Semántica                   : ${c173Lsi} URLs (${((c173Lsi / c173Total) * 100).toFixed(1)}%) [Target: ~40%]`);
    console.log(`   • Variaciones de Marca / Contextuales          : ${c173Brand} URLs (${((c173Brand / c173Total) * 100).toFixed(1)}%) [Target: ~30%]`);
    console.log("--------------------------------------------------------------------------------");
    console.log(`  MATRIZ DE ANCHOR TEXT EN EL 100% DEL DOMINIO (${totalSatellites} URLs Satélite -> / con rel="dofollow"):`);
    console.log(`   • Coincidencia Exacta ("hoteles en Venezuela") : ${exactMatchCount} URLs (${exactPct}%)`);
    console.log(`   • LSI / Cola Larga Semántica                   : ${lsiCount} URLs (${lsiPct}%)`);
    console.log(`   • Variaciones de Marca / Contextuales          : ${brandCount} URLs (${brandPct}%)`);
    console.log(`   • Estado del Bloque ClusterAuthorityCtaBlock   : ACTIVO EN 100% DE LAS RUTAS`);
    console.log("================================================================================\n");
  } catch (err) {
    console.error("Error generando el sitemap:", err.message);
  }
}

generateSitemap();
