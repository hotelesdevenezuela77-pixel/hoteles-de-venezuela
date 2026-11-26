const SUPABASE_URL = "https://ghgetcznlrilgocwigmj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_0ycztlhClHILzkaEml6gyw_rADY60GR";
const BASE_URL = "https://hotelesdevenezuela.com";
const HOME_TITLE = "Hoteles de Venezuela | Reservas sin intermediarios | Hoteles en Venezuela";
const DEFAULT_DESC = "Guía turística y directorio oficial de hoteles, posadas boutique, resorts y campamentos en Venezuela. Reserva directo sin intermediarios.";
const DEFAULT_OG_IMAGE = "https://ghgetcznlrilgocwigmj.supabase.co/storage/v1/object/public/establecimientos/destinos/salto-angel-hero-v2.jpg";

const STATIC_PUBLIC_ROUTES = new Set([
  "/",
  "/home-v2",
  "/home-v1",
  "/pre-registro",
  "/registro-rapido",
  "/hoteles-en-venezuela",
  "/establecimientos",
  "/explorar",
  "/destinos",
  "/mapa",
  "/parques",
  "/servicios-b2b",
  "/comparar",
  "/paquetes",
  "/links",
  "/blog",
  "/sitios-turisticos",
  "/membresias",
  "/reportar-pago",
  "/privacidad",
  "/terminos",
  "/terminos-y-condiciones",
  "/condiciones",
  "/prestigio-2026",
  "/top-10-hoteles",
  "/los-10-mejores-hoteles",
  "/mejores-hoteles-venezuela",
  "/50-fundadores",
  "/alianzas-para-agencias",
  "/sobre-nosotros",
  "/viaje-ia",
  "/soporte",
  "/soporte-tecnico",
  "/contacto",
  "/legal/upload-resolution",
  "/upload-resolution"
]);

function clampDescription(text) {
  const clean = String(text || DEFAULT_DESC).replace(/\s+/g, " ").trim();
  if (clean.length <= 160) return clean;
  return clean.slice(0, 157).trimEnd() + "...";
}

function escapeAttr(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function querySupabase(pathAndQuery, env) {
  try {
    const baseUrl = env?.VITE_SUPABASE_URL || SUPABASE_URL;
    const apiKey = env?.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;
    const res = await fetch(`${baseUrl}/rest/v1/${pathAndQuery}`, {
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json"
      }
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return Array.isArray(rows) ? rows : null;
  } catch {
    return null;
  }
}

async function resolveRouteSeo(pathname, env) {
  const cleanPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");

  if (cleanPath === "/") {
    return {
      exists: true,
      title: HOME_TITLE,
      description: clampDescription(
        "Guía turística y directorio oficial de hoteles, posadas boutique, resorts y campamentos en Venezuela. Reserva directo con los anfitriones por WhatsApp sin intermediarios."
      ),
      canonical: `${BASE_URL}/`,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: "website",
      schemas: [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Hoteles de Venezuela",
          url: `${BASE_URL}/`
        },
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Hoteles de Venezuela",
          url: `${BASE_URL}/`
        }
      ]
    };
  }

  const estMatch = cleanPath.match(/^\/(?:establecimiento|app|hotel|posada|restaurante)\/([^/]+)$/);
  if (estMatch) {
    const slug = decodeURIComponent(estMatch[1]);
    const rows = await querySupabase(
      `establishments?select=name,slug,short_description,description,city,state,main_image&slug=eq.${encodeURIComponent(slug)}&status=eq.approved&limit=1`,
      env
    );
    if (!rows || rows.length === 0) return { exists: false };
    const est = rows[0];
    const title = `${est.name} en ${est.city || est.state || "Venezuela"} | Hoteles de Venezuela`;
    const desc = clampDescription(
      est.short_description || est.description || `${est.name} en ${est.city || "Venezuela"}. Reserva directa sin comisiones con Hoteles de Venezuela.`
    );
    const canonical = `${BASE_URL}${cleanPath}`;
    return {
      exists: true,
      title,
      description: desc,
      canonical,
      ogImage: est.main_image || DEFAULT_OG_IMAGE,
      ogType: "hotel",
      schemas: [
        {
          "@context": "https://schema.org",
          "@type": "LodgingBusiness",
          name: est.name,
          url: canonical,
          image: est.main_image || DEFAULT_OG_IMAGE,
          address: {
            "@type": "PostalAddress",
            addressLocality: est.city || "",
            addressRegion: est.state || "",
            addressCountry: "VE"
          }
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: `${BASE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Hoteles en Venezuela", item: `${BASE_URL}/hoteles-en-venezuela` },
            { "@type": "ListItem", position: 3, name: est.name, item: canonical }
          ]
        }
      ]
    };
  }

  const destMatch = cleanPath.match(/^\/destinos\/([^/]+)$/);
  if (destMatch) {
    const slug = decodeURIComponent(destMatch[1]);
    const rows = await querySupabase(
      `destinations?select=name,slug,description,image_url&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      env
    );
    if (!rows || rows.length === 0) return { exists: false };
    const dest = rows[0];
    const title = `Hoteles en ${dest.name} | Hoteles de Venezuela`;
    const desc = clampDescription(
      dest.description || `Descubre hoteles, posadas y alojamientos en ${dest.name} con trato directo sin intermediarios en Hoteles de Venezuela.`
    );
    const canonical = `${BASE_URL}${cleanPath}`;
    return {
      exists: true,
      title,
      description: desc,
      canonical,
      ogImage: dest.image_url || DEFAULT_OG_IMAGE,
      ogType: "website",
      schemas: [
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: `${BASE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Destinos", item: `${BASE_URL}/destinos` },
            { "@type": "ListItem", position: 3, name: dest.name, item: canonical }
          ]
        }
      ]
    };
  }

  const blogMatch = cleanPath.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    const slug = decodeURIComponent(blogMatch[1]);
    const rows = await querySupabase(
      `blog_posts?select=title,slug,excerpt,meta_description,cover_image&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`,
      env
    );
    if (!rows || rows.length === 0) return { exists: false };
    const post = rows[0];
    const title = `${post.title} | Blog Hoteles de Venezuela`;
    const desc = clampDescription(
      post.meta_description || post.excerpt || `${post.title} — Guía y turismo en Venezuela con Hoteles de Venezuela.`
    );
    return {
      exists: true,
      title,
      description: desc,
      canonical: `${BASE_URL}${cleanPath}`,
      ogImage: post.cover_image || DEFAULT_OG_IMAGE,
      ogType: "article",
      schemas: []
    };
  }

  const siteMatch = cleanPath.match(/^\/sitio\/([^/]+)$/);
  if (siteMatch) {
    const slug = decodeURIComponent(siteMatch[1]);
    const rows = await querySupabase(
      `tourist_sites?select=name,slug,description,image_url&slug=eq.${encodeURIComponent(slug)}&is_active=eq.true&limit=1`,
      env
    );
    if (!rows || rows.length === 0) return { exists: false };
    const site = rows[0];
    return {
      exists: true,
      title: `${site.name} | Sitios Turísticos de Venezuela`,
      description: clampDescription(site.description || `Conoce ${site.name} y alojamientos cercanos sin comisiones en Hoteles de Venezuela.`),
      canonical: `${BASE_URL}${cleanPath}`,
      ogImage: site.image_url || DEFAULT_OG_IMAGE,
      ogType: "website",
      schemas: []
    };
  }

  const parkMatch = cleanPath.match(/^\/parque\/([^/]+)$/);
  if (parkMatch) {
    const slug = decodeURIComponent(parkMatch[1]);
    const rows = await querySupabase(
      `national_parks?select=name,slug,description,image_url&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      env
    );
    if (!rows || rows.length === 0) return { exists: false };
    const park = rows[0];
    return {
      exists: true,
      title: `${park.name} | Parques Nacionales de Venezuela`,
      description: clampDescription(park.description || `Guía del Parque Nacional ${park.name} y hospedajes cercanos en Hoteles de Venezuela.`),
      canonical: `${BASE_URL}${cleanPath}`,
      ogImage: park.image_url || DEFAULT_OG_IMAGE,
      ogType: "website",
      schemas: []
    };
  }

  if (STATIC_PUBLIC_ROUTES.has(cleanPath)) {
    const title = cleanPath === "/hoteles-en-venezuela"
      ? "Hoteles en Venezuela | Directorio Oficial sin Intermediarios"
      : `${cleanPath.replace(/^\//, "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())} | Hoteles de Venezuela`;
    return {
      exists: true,
      title,
      description: clampDescription(DEFAULT_DESC),
      canonical: `${BASE_URL}${cleanPath}`,
      ogImage: DEFAULT_OG_IMAGE,
      ogType: "website",
      schemas: []
    };
  }

  const customSlug = cleanPath.replace(/^\//, "");
  if (customSlug && !customSlug.includes("/")) {
    const customRows = await querySupabase(
      `custom_pages?select=title,slug,meta_description,featured_image&slug=eq.${encodeURIComponent(customSlug)}&is_published=eq.true&limit=1`,
      env
    );
    if (customRows && customRows.length > 0) {
      const page = customRows[0];
      return {
        exists: true,
        title: `${page.title} | Hoteles de Venezuela`,
        description: clampDescription(page.meta_description || DEFAULT_DESC),
        canonical: `${BASE_URL}${cleanPath}`,
        ogImage: page.featured_image || DEFAULT_OG_IMAGE,
        ogType: "website",
        schemas: []
      };
    }
  }

  return { exists: false };
}

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  if (url.hostname === "www.hotelesdevenezuela.com") {
    url.hostname = "hotelesdevenezuela.com";
    return Response.redirect(url.toString(), 301);
  }

  const pathname = url.pathname;

  if (
    pathname.startsWith("/api/") ||
    pathname.includes("webhook") ||
    pathname.startsWith("/verificar-registro/") ||
    pathname.startsWith("/pre-registro") ||
    pathname.startsWith("/admin") ||
    pathname === "/hdv-acceso-llc2027" ||
    pathname === "/sitemap.xml" ||
    /\.[a-zA-Z0-9]{2,6}$/.test(pathname)
  ) {
    return next();
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    url.pathname = pathname.replace(/\/+$/, "");
    return Response.redirect(url.toString(), 301);
  }

  const seoData = await resolveRouteSeo(pathname, env);
  const assetRequest = new Request(new URL("/index.html", url.origin).toString(), {
    method: "GET",
    headers: request.headers
  });

  const baseResponse = env?.ASSETS
    ? await env.ASSETS.fetch(assetRequest)
    : await next();

  const statusCode = seoData.exists ? 200 : 404;
  const canonicalHref = `${BASE_URL}${pathname === "/" ? "/" : pathname}`;
  const titleText = seoData.exists ? seoData.title : "404 — Página no encontrada | Hoteles de Venezuela";
  const descText = seoData.exists
    ? seoData.description
    : clampDescription("La página solicitada no existe. Explora hoteles en Venezuela sin intermediarios.");

  const rewriter = new HTMLRewriter()
    .on("title", {
      element(el) {
        el.setInnerContent(titleText);
      }
    })
    .on('meta[name="description"]', {
      element(el) {
        el.setAttribute("content", descText);
      }
    })
    .on('link[rel="canonical"]', {
      element(el) {
        el.setAttribute("href", canonicalHref);
      }
    })
    .on("head", {
      element(el) {
        if (!seoData.exists) {
          el.append('<meta name="robots" content="noindex, follow" />', { html: true });
        }
        el.append(`<meta property="og:title" content="${escapeAttr(titleText)}" />`, { html: true });
        el.append(`<meta property="og:description" content="${escapeAttr(descText)}" />`, { html: true });
        el.append(`<meta property="og:url" content="${escapeAttr(canonicalHref)}" />`, { html: true });
        el.append(`<meta property="og:image" content="${escapeAttr(seoData.ogImage || DEFAULT_OG_IMAGE)}" />`, { html: true });
        if (seoData.exists && Array.isArray(seoData.schemas) && seoData.schemas.length > 0) {
          el.append(
            `<script type="application/ld+json">${JSON.stringify(seoData.schemas)}</script>`,
            { html: true }
          );
        }
      }
    });

  const headers = new Headers(baseResponse.headers);
  headers.set("Content-Type", "text/html; charset=utf-8");

  return new Response(rewriter.transform(baseResponse).body, {
    status: statusCode,
    headers
  });
}
