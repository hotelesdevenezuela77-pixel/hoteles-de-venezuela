import { useEffect } from "react";

export interface SeoHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  schemas?: object[];
}

function normalizeCanonicalUrl(rawUrl?: string): string {
  const baseOrigin = "https://hotelesdevenezuela.com";
  const fallback = `${baseOrigin}/`;
  if (!rawUrl || typeof rawUrl !== "string") return fallback;

  try {
    const parsed = rawUrl.startsWith("http")
      ? new URL(rawUrl)
      : new URL(rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`, baseOrigin);

    let pathname = parsed.pathname || "/";
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.replace(/\/+$/, "");
    }
    return `${baseOrigin}${pathname || "/"}`;
  } catch {
    const withoutQuery = rawUrl.split("?")[0].split("#")[0].trim();
    if (!withoutQuery || withoutQuery === "/") return fallback;
    const cleanPath = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
    const noTrailing = cleanPath.length > 1 ? cleanPath.replace(/\/+$/, "") : "/";
    return `${baseOrigin}${noTrailing}`;
  }
}

export function SeoHead({
  title = "Hoteles de Venezuela | Reservas sin intermediarios | Hoteles en Venezuela",
  description = "Guía turística y directorio oficial de hoteles, posadas boutique, resorts y campamentos en Venezuela. Reserva directo con los anfitriones por WhatsApp sin intermediarios.",
  keywords = "hoteles venezuela, posadas venezuela, reservas sin intermediarios, turismo venezuela, los roques, canaima, morrocoy, merida, posadas boutique, resorts venezuela, campamentos turismo",
  canonicalUrl = "https://hotelesdevenezuela.com/",
  ogImage = "https://ghgetcznlrilgocwigmj.supabase.co/storage/v1/object/public/establecimientos/destinos/salto-angel-hero-v2.jpg",
  ogType = "website",
  schemas = []
}: SeoHeadProps) {
  const cleanCanonical = normalizeCanonicalUrl(canonicalUrl);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = title;

    const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setCanonical = (url: string) => {
      let el = document.querySelector("link[rel='canonical']");
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", "canonical");
        document.head.appendChild(el);
      }
      el.setAttribute("href", url);
    };

    setMetaTag('meta[name="description"]', "name", "description", description);
    setMetaTag('meta[name="keywords"]', "name", "keywords", keywords);
    setMetaTag('meta[name="robots"]', "name", "robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    setMetaTag('meta[name="author"]', "name", "author", "Hoteles de Venezuela LLC");

    setMetaTag('meta[property="og:title"]', "property", "og:title", title);
    setMetaTag('meta[property="og:description"]', "property", "og:description", description);
    setMetaTag('meta[property="og:url"]', "property", "og:url", cleanCanonical);
    setMetaTag('meta[property="og:type"]', "property", "og:type", ogType);
    setMetaTag('meta[property="og:image"]', "property", "og:image", ogImage);
    setMetaTag('meta[property="og:site_name"]', "property", "og:site_name", "Hoteles de Venezuela");
    setMetaTag('meta[property="og:locale"]', "property", "og:locale", "es_VE");

    setMetaTag('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMetaTag('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMetaTag('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMetaTag('meta[name="twitter:image"]', "name", "twitter:image", ogImage);

    setCanonical(cleanCanonical);

    const scriptId = "hdv-jsonld-schema";
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = scriptId;
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }

    if (schemas && schemas.length > 0) {
      scriptEl.textContent = JSON.stringify(schemas, null, 2);
    }

    return () => {
      if (scriptEl && scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
      document.title = originalTitle;
    };
  }, [title, description, keywords, cleanCanonical, ogImage, ogType, JSON.stringify(schemas)]);

  return null;
}
