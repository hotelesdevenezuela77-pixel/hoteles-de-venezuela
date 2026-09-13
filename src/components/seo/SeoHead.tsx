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

export function SeoHead({
  title = "Hoteles de Venezuela | Reservas Directas sin Intermediarios | Guía Turística Oficial",
  description = "Directorio y guía turística oficial de hoteles, posadas boutique, resorts y campamentos en Venezuela. Contacto directo por WhatsApp con los anfitriones y 0% comisiones.",
  keywords = "hoteles venezuela, posadas venezuela, reservas sin intermediarios, turismo venezuela, los roques, canaima, morrocoy, merida, posadas boutique, resorts venezuela, campamentos turismo",
  canonicalUrl = "https://hotelesdevenezuela.com/home-v2",
  ogImage = "https://ghgetcznlrilgocwigmj.supabase.co/storage/v1/object/public/establecimientos/destinos/salto-angel-hero-v2.jpg",
  ogType = "website",
  schemas = []
}: SeoHeadProps) {
  useEffect(() => {
    // 1. Update Title
    const originalTitle = document.title;
    document.title = title;

    // Helper to update/create meta tag
    const setMetaTag = (selector: string, attrName: string, attrVal: string, content: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Helper to update/create link canonical
    const setCanonical = (url: string) => {
      let el = document.querySelector("link[rel='canonical']");
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", "canonical");
        document.head.appendChild(el);
      }
      el.setAttribute("href", url);
    };

    // 2. Standard Meta Tags
    setMetaTag('meta[name="description"]', "name", "description", description);
    setMetaTag('meta[name="keywords"]', "name", "keywords", keywords);
    setMetaTag('meta[name="robots"]', "name", "robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    setMetaTag('meta[name="author"]', "name", "author", "Hoteles de Venezuela LLC");

    // 3. Open Graph Tags
    setMetaTag('meta[property="og:title"]', "property", "og:title", title);
    setMetaTag('meta[property="og:description"]', "property", "og:description", description);
    setMetaTag('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    setMetaTag('meta[property="og:type"]', "property", "og:type", ogType);
    setMetaTag('meta[property="og:image"]', "property", "og:image", ogImage);
    setMetaTag('meta[property="og:site_name"]', "property", "og:site_name", "Hoteles de Venezuela");
    setMetaTag('meta[property="og:locale"]', "property", "og:locale", "es_VE");

    // 4. Twitter Card Tags
    setMetaTag('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMetaTag('meta[name="twitter:title"]', "name", "twitter:title", title);
    setMetaTag('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMetaTag('meta[name="twitter:image"]', "name", "twitter:image", ogImage);

    // 5. Canonical Link
    setCanonical(canonicalUrl);

    // 6. JSON-LD Schema.org Structured Data
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
      // Cleanup custom JSON-LD script on unmount
      if (scriptEl && scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
      document.title = originalTitle;
    };
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, JSON.stringify(schemas)]);

  return null;
}
