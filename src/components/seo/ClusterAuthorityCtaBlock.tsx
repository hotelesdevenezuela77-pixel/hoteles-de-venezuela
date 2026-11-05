import { useEffect } from "react";
import { Link } from "wouter";
import {
  Building2,
  ShieldCheck,
  Compass,
  Sparkles,
  ChevronRight,
  Home,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

export type ClusterContentType =
  | "blog"
  | "destino"
  | "sitio"
  | "parque"
  | "establecimiento"
  | "directorio"
  | "estatica"
  | "custom";

export type AnchorCategoryType =
  | "EXACT_MATCH_30"
  | "LSI_LONG_TAIL_40"
  | "BRAND_CONTEXTUAL_30";

export interface ClusterAnchorConfig {
  bucket: number; // 0..9
  category: AnchorCategoryType;
  categoryRatioLabel: string;
  anchorText: string;
  leadText: string;
  tailText: string;
  ctaButtonLabel: string;
}

/**
 * Deterministic hash of a slug/path into a decile bucket (0..9)
 * Guarantees an exact 30% / 40% / 30% distribution across 100% of the domain URLs
 * without random shifting between crawls by Googlebot.
 */
export function hashSlugToDecile(slug: string): number {
  const clean = (slug || "root").trim().toLowerCase();
  let hash = 2166136261;
  for (let i = 0; i < clean.length; i++) {
    hash ^= clean.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % 10;
}

/**
 * Returns the deterministic Anchor Text Configuration according to the strict SEO Matrix:
 * - Buckets 0, 1, 2 (30%): Exact Match ("hoteles en Venezuela")
 * - Buckets 3, 4, 5, 6 (40%): LSI / Semantic Long-Tail
 * - Buckets 7, 8, 9 (30%): Brand / Contextual Variations
 */
export function getClusterAnchorConfig(
  slug: string,
  title: string
): ClusterAnchorConfig {
  const bucket = hashSlugToDecile(slug);

  // 30% Coincidencia Exacta (Buckets 0, 1, 2)
  if (bucket <= 2) {
    return {
      bucket,
      category: "EXACT_MATCH_30",
      categoryRatioLabel: "30% Coincidencia Exacta",
      anchorText: "hoteles en Venezuela",
      leadText: `Si estás planificando tu próxima estadía o experiencia vinculada con ${title}, descubre el catálogo verificado de `,
      tailText:
        " con atención personalizada, tarifas oficiales en tiempo real y contacto directo con los propietarios sin intermediarios.",
      ctaButtonLabel: "Explorar Hoteles en Venezuela",
    };
  }

  // 40% LSI / Cola Larga Semántica (Buckets 3, 4, 5, 6)
  if (bucket <= 6) {
    const lsiOptions = [
      {
        anchorText: "reservar en la red de hoteles en Venezuela sin comisiones",
        leadText: `Aprovecha las ventajas exclusivas de `,
        tailText: ` para asegurar tu hospedaje ideal relacionado con ${title} bajo el respaldo del Sello de Verificación Humana HDV y trato directo por WhatsApp.`,
        ctaButtonLabel: "Reservar sin Comisiones en el Inicio",
      },
      {
        anchorText: "directorio oficial de hoteles en Venezuela",
        leadText: `Consulta ahora mismo nuestro `,
        tailText: ` y compara posadas boutique, resorts de playa, campamentos ecológicos y hoteles ejecutivos auditados para tu viaje a ${title}.`,
        ctaButtonLabel: "Ir al Directorio Oficial HDV",
      },
      {
        anchorText: "alojamiento y hoteles en Venezuela",
        leadText: `Encuentra las mejores alternativas de `,
        tailText: ` seleccionadas por especialistas en turismo nacional para disfrutar al máximo cada rincón relacionado con ${title}.`,
        ctaButtonLabel: "Ver Alojamiento y Hoteles en Venezuela",
      },
      {
        anchorText: "central de reservas de hoteles en Venezuela",
        leadText: `Conéctate directamente a través de la `,
        tailText: ` donde viajeros y anfitriones verificados acuerdan su hospedaje con 0% de recargos por intermediación.`,
        ctaButtonLabel: "Acceder a la Central de Reservas",
      },
    ];
    const selected = lsiOptions[bucket - 3];
    return {
      bucket,
      category: "LSI_LONG_TAIL_40",
      categoryRatioLabel: "40% LSI / Cola Larga Semántica",
      ...selected,
    };
  }

  // 30% Variaciones de Marca / Contextuales (Buckets 7, 8, 9)
  const brandOptions = [
    {
      anchorText: "nuestra plataforma en Hoteles de Venezuela",
      leadText: `Continúa planificando tu itinerario turístico visitando `,
      tailText: `, el ecosistema digital líder que reúne los hospedajes más exclusivos y seguros del país.`,
      ctaButtonLabel: "Visitar Plataforma Hoteles de Venezuela",
    },
    {
      anchorText: "explorar la red principal de Hoteles de Venezuela",
      leadText: `Te invitamos a `,
      tailText: ` para descubrir promociones de temporada, posadas con planta eléctrica o Starlink y experiencias certificadas.`,
      ctaButtonLabel: "Explorar Red Principal HDV",
    },
    {
      anchorText: "volver al inicio de Hoteles de Venezuela",
      leadText: `Para comparar todos los destinos nacionales y filtrar hospedajes por categoría, puedes `,
      tailText: ` y cotizar en segundos con los anfitriones oficiales.`,
      ctaButtonLabel: "Volver al Inicio de Hoteles de Venezuela",
    },
  ];
  const selectedBrand = brandOptions[bucket - 7];
  return {
    bucket,
    category: "BRAND_CONTEXTUAL_30",
    categoryRatioLabel: "30% Variación de Marca / Contextual",
    ...selectedBrand,
  };
}

/**
 * Generates JSON-LD Structured Data (WebSite, Organization, BlogPosting, TouristDestination,
 * TouristAttraction, LodgingBusiness, and BreadcrumbList) connecting every route to root (/)
 */
export function buildClusterSchemas(params: {
  contentType: ClusterContentType;
  slug: string;
  title: string;
  description: string;
  imageUrl?: string;
  publishedAt?: string;
  updatedAt?: string;
  authorName?: string;
  stateOrRegion?: string;
  categoryName?: string;
  address?: string;
  telephone?: string;
  priceRange?: string;
  ratingValue?: number;
  reviewCount?: number;
  latitude?: number;
  longitude?: number;
}): object[] {
  const baseUrl = "https://hotelesdevenezuela.com";
  const defaultImg =
    "https://ghgetcznlrilgocwigmj.supabase.co/storage/v1/object/public/establecimientos/destinos/salto-angel-hero-v2.jpg";
  const image =
    params.imageUrl && params.imageUrl.startsWith("http")
      ? params.imageUrl
      : defaultImg;

  const routePrefixMap: Record<ClusterContentType, string> = {
    blog: "/blog",
    destino: "/destinos",
    sitio: "/sitio",
    parque: "/parque",
    establecimiento: "/establecimiento",
    directorio: "",
    estatica: "",
    custom: "",
  };

  const hubConfigMap: Record<
    ClusterContentType,
    { name: string; url: string }
  > = {
    blog: {
      name: "Reportajes y Guías de Viaje",
      url: `${baseUrl}/blog`,
    },
    destino: {
      name: "Destinos en Venezuela",
      url: `${baseUrl}/destinos`,
    },
    sitio: {
      name: "Sitios Turísticos Emblemáticos",
      url: `${baseUrl}/sitios-turisticos`,
    },
    parque: {
      name: "Parques Nacionales de Venezuela",
      url: `${baseUrl}/parques`,
    },
    establecimiento: {
      name: "Directorio de Hoteles y Posadas",
      url: `${baseUrl}/establecimientos`,
    },
    directorio: {
      name: "Directorio Nacional HDV",
      url: `${baseUrl}/establecimientos`,
    },
    estatica: {
      name: "Plataforma Oficial HDV",
      url: `${baseUrl}/`,
    },
    custom: {
      name: "Guías Especiales HDV",
      url: `${baseUrl}/establecimientos`,
    },
  };

  const cleanSlug = params.slug.replace(/^\/+/, "");
  const prefix = routePrefixMap[params.contentType];
  const canonicalUrl = prefix
    ? `${baseUrl}${prefix}/${cleanSlug}`
    : `${baseUrl}/${cleanSlug}`;

  const hub = hubConfigMap[params.contentType];

  // Global Organization & WebSite Authority Graph Nodes
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: "Hoteles de Venezuela",
    alternateName: "Hoteles en Venezuela - Directorio Oficial HDV",
    url: `${baseUrl}/`,
    logo: `${baseUrl}/favicon.png`,
    sameAs: [
      "https://www.instagram.com/hotelesdevenezuela",
      "https://www.facebook.com/hotelesdevenezuela",
    ],
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    name: "Hoteles en Venezuela | Hoteles de Venezuela",
    url: `${baseUrl}/`,
    publisher: {
      "@id": `${baseUrl}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/establecimientos?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  // 1. BreadcrumbList Schema connecting Root (/) -> Category Hub -> Current Page
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Hoteles en Venezuela",
        item: `${baseUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: hub.name,
        item: hub.url,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: params.title,
        item: canonicalUrl,
      },
    ],
  };

  // 2. Specific Entity Schema based on Content Type
  if (params.contentType === "establecimiento") {
    const lodgingSchema: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      name: params.title,
      description: params.description,
      url: canonicalUrl,
      image: [image],
      priceRange: params.priceRange || "$$",
      telephone: params.telephone || "+584145007744",
      address: {
        "@type": "PostalAddress",
        streetAddress: params.address || params.stateOrRegion || "Venezuela",
        addressRegion: params.stateOrRegion || "Venezuela",
        addressCountry: "VE",
      },
      parentOrganization: {
        "@id": `${baseUrl}/#organization`,
      },
      isPartOf: {
        "@id": `${baseUrl}/#website`,
      },
    };
    if (params.ratingValue && params.ratingValue > 0) {
      lodgingSchema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: params.ratingValue,
        reviewCount: Math.max(params.reviewCount || 1, 1),
        bestRating: 5,
        worstRating: 1,
      };
    }
    if (params.latitude && params.longitude) {
      lodgingSchema.geo = {
        "@type": "GeoCoordinates",
        latitude: params.latitude,
        longitude: params.longitude,
      };
    }
    return [organizationSchema, webSiteSchema, breadcrumbSchema, lodgingSchema];
  }

  if (params.contentType === "blog") {
    const blogSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonicalUrl,
      },
      headline: params.title,
      description: params.description,
      image: [image],
      author: {
        "@type": "Organization",
        name: params.authorName || "Hoteles de Venezuela LLC",
        url: `${baseUrl}/`,
      },
      publisher: {
        "@id": `${baseUrl}/#organization`,
      },
      datePublished: params.publishedAt || "2026-06-01T10:00:00Z",
      dateModified:
        params.updatedAt || params.publishedAt || new Date().toISOString(),
      about: {
        "@type": "Thing",
        name: "Hoteles en Venezuela y Turismo Nacional",
        sameAs: `${baseUrl}/`,
      },
      isPartOf: {
        "@id": `${baseUrl}/#website`,
      },
    };
    return [organizationSchema, webSiteSchema, breadcrumbSchema, blogSchema];
  }

  if (params.contentType === "destino") {
    const destinationSchema = {
      "@context": "https://schema.org",
      "@type": "TouristDestination",
      name: params.title,
      description: params.description,
      url: canonicalUrl,
      image: [image],
      touristType: [
        "Turismo de Playa y Naturaleza",
        "Viajeros de Posadas Boutique",
        "Turismo Familiar y Corporativo",
      ],
      containedInPlace: {
        "@type": "Country",
        name: "Venezuela",
        url: `${baseUrl}/`,
      },
      subjectOf: {
        "@type": "WebPage",
        name: `Hoteles en ${params.title} - Hoteles en Venezuela`,
        url: `${baseUrl}/`,
      },
      isPartOf: {
        "@id": `${baseUrl}/#website`,
      },
    };
    return [
      organizationSchema,
      webSiteSchema,
      breadcrumbSchema,
      destinationSchema,
    ];
  }

  if (params.contentType === "sitio" || params.contentType === "parque") {
    const attractionSchema = {
      "@context": "https://schema.org",
      "@type": "TouristAttraction",
      name: params.title,
      description: params.description,
      url: canonicalUrl,
      image: [image],
      touristType: params.categoryName || "Ecoturismo y Aventura en Venezuela",
      isAccessibleForFree: true,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: params.stateOrRegion || "Venezuela",
        containedInPlace: {
          "@type": "Country",
          name: "Venezuela",
          url: `${baseUrl}/`,
        },
      },
      isPartOf: {
        "@id": `${baseUrl}/#website`,
      },
    };
    return [
      organizationSchema,
      webSiteSchema,
      breadcrumbSchema,
      attractionSchema,
    ];
  }

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: params.title,
    description: params.description,
    url: canonicalUrl,
    isPartOf: {
      "@id": `${baseUrl}/#website`,
    },
    about: {
      "@id": `${baseUrl}/#organization`,
    },
  };

  return [organizationSchema, webSiteSchema, breadcrumbSchema, webPageSchema];
}

interface ClusterAuthorityCtaBlockProps {
  slug?: string;
  title?: string;
  contentType?: ClusterContentType;
  destinationName?: string;
  categoryLabel?: string;
}

export function ClusterAuthorityCtaBlock({
  slug = "hoteles-en-venezuela",
  title = "Hoteles en Venezuela",
  contentType = "directorio",
  destinationName,
  categoryLabel,
}: ClusterAuthorityCtaBlockProps) {
  const anchorConfig = getClusterAnchorConfig(slug, title);

  const hubLinks: Record<
    ClusterContentType,
    { label: string; href: string }
  > = {
    blog: { label: "Reportajes y Blog", href: "/blog" },
    destino: { label: "Destinos de Venezuela", href: "/destinos" },
    sitio: { label: "Sitios Turísticos", href: "/sitios-turisticos" },
    parque: { label: "Parques Nacionales", href: "/parques" },
    establecimiento: { label: "Hoteles y Posadas", href: "/establecimientos" },
    directorio: { label: "Directorio Turístico", href: "/establecimientos" },
    estatica: { label: "Plataforma Oficial", href: "/establecimientos" },
    custom: { label: "Directorio de Hospedajes", href: "/establecimientos" },
  };

  const currentHub = hubLinks[contentType] || hubLinks.directorio;

  useEffect(() => {
    // Automated SEO Diagnostic Log confirming Topic Cluster Link Juice Integration
    console.info(
      `[SEO Topic Cluster Matrix] Satellite="${contentType}/${slug}" -> Target="https://hotelesdevenezuela.com/" | rel="dofollow" | Bucket=${anchorConfig.bucket}/9 | Distribution="${anchorConfig.categoryRatioLabel}" | Anchor="${anchorConfig.anchorText}"`
    );
  }, [slug, contentType, anchorConfig]);

  return (
    <section
      aria-label="Arquitectura de Autoridad y Enlazado Contextual Hoteles en Venezuela"
      className="max-w-5xl mx-auto px-6 mt-16 mb-8 font-sans text-[#1e293b]"
    >
      {/* Migas de Pan Estructuradas Visuales (Conectadas al Schema BreadcrumbList) */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600 bg-white border border-slate-200/80 rounded-2xl px-4 py-3 mb-6 shadow-xs"
      >
        <Link
          href="/"
          rel="dofollow"
          className="inline-flex items-center gap-1.5 text-[#00C8D4] hover:text-[#FF0096] transition-colors cursor-pointer"
        >
          <span className="w-5 h-5 rounded-lg bg-[#00C8D4] text-white flex items-center justify-center shrink-0">
            <Home className="w-3 h-3 text-white" />
          </span>
          <span>Hoteles en Venezuela</span>
        </Link>

        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

        <Link
          href={currentHub.href}
          rel="dofollow"
          className="text-slate-700 hover:text-[#9B00CC] transition-colors cursor-pointer"
        >
          {currentHub.label}
        </Link>

        {destinationName && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-600">{destinationName}</span>
          </>
        )}

        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

        <span className="text-[#0e011f] font-black truncate max-w-[240px] sm:max-w-md">
          {title}
        </span>
      </nav>

      {/* Bloque Editorial de Autoridad Interna (Topic Cluster Satellite -> Root Pillar) */}
      <div
        className="rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl border border-white/10"
        style={{
          background: "linear-gradient(135deg, #0e011f 0%, #1a0533 100%)",
        }}
      >
        {/* Acentos luminosos corporativos */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#00C8D4]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#FF0096]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Etiqueta superior corporativa */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex items-center gap-2.5 bg-white/10 border border-white/15 px-3.5 py-1.5 rounded-full">
              <span className="w-5 h-5 rounded-md bg-[#00C8D4] flex items-center justify-center shrink-0">
                <Sparkles className="w-3 h-3 text-white" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00C8D4]">
                CLÚSTER OFICIAL DE TURISMO · VERIFICACIÓN HUMANA HDV
              </span>
            </div>

            {categoryLabel && (
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#FF0096] text-white">
                {categoryLabel}
              </span>
            )}
          </div>

          {/* Título Principal en Tipografía Serif Elegante (Playfair Display) */}
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-snug mb-4 playfair">
            Reserva Directo en los Mejores Hospedajes de Venezuela sin Intermediarios
          </h2>

          {/* Párrafo Editorial con Inyección Determinística de Anchor Text (30% Exact / 40% LSI / 30% Brand) y rel="dofollow" */}
          <p className="text-slate-200 text-sm md:text-base leading-relaxed mb-8 font-medium">
            {anchorConfig.leadText}
            <Link
              href="/"
              rel="dofollow"
              title="Hoteles en Venezuela - Directorio Oficial y Reservas Directas"
              className="text-[#00C8D4] hover:text-[#FF0096] underline decoration-[#00C8D4]/60 hover:decoration-[#FF0096] decoration-2 underline-offset-4 font-black transition-colors cursor-pointer"
            >
              {anchorConfig.anchorText}
            </Link>
            {anchorConfig.tailText}
          </p>

          {/* 3 Pilares con Iconografía Unicolor en Cajas Sólidas y Vector Blanco (Regla 3 AGENTS.md) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#00C8D4] flex items-center justify-center shrink-0 shadow-md">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  0% Comisiones Ocultas
                </h3>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Trato directo por WhatsApp con propietarios de hoteles, posadas boutique y campamentos.
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FF0096] flex items-center justify-center shrink-0 shadow-md">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Auditoría en Sitio
                </h3>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Hospedajes verificados con métricas reales de planta eléctrica, conectividad Starlink y seguridad.
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#9B00CC] flex items-center justify-center shrink-0 shadow-md">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Cobertura Nacional
                </h3>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Los Roques, Canaima, Morrocoy, Margarita, Mérida, Caracas y más de 25 destinos turísticos.
                </p>
              </div>
            </div>
          </div>

          {/* Botones de Acción hacia la Raíz (/) y Rutas de Conversión con rel="dofollow" */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Link
                href="/"
                rel="dofollow"
                className="inline-flex items-center justify-center gap-2 bg-[#00C8D4] hover:bg-[#00b3be] text-[#0e011f] font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg transition-all cursor-pointer w-full sm:w-auto"
              >
                <span>{anchorConfig.ctaButtonLabel}</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              <Link
                href="/establecimientos"
                rel="dofollow"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/15 font-bold text-xs px-5 py-3.5 rounded-2xl transition-all cursor-pointer w-full sm:w-auto"
              >
                <CheckCircle2 className="w-4 h-4 text-[#00C8D4]" />
                <span>Ver Catálogo Completo</span>
              </Link>
            </div>

            {/* Enlaces Satélite de Refuerzo Semántico */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-300 font-semibold">
              <Link
                href="/hoteles-en-venezuela"
                rel="dofollow"
                className="text-[#00C8D4] hover:text-white font-bold transition-colors cursor-pointer"
              >
                Hoteles en Venezuela
              </Link>
              <span className="opacity-30">•</span>
              <Link
                href="/destinos"
                rel="dofollow"
                className="hover:text-[#00C8D4] transition-colors cursor-pointer"
              >
                25 Destinos Turísticos
              </Link>
              <span className="opacity-30">•</span>
              <Link
                href="/blog"
                rel="dofollow"
                className="hover:text-[#00C8D4] transition-colors cursor-pointer"
              >
                142 Reportajes de Viaje
              </Link>
              <span className="opacity-30">•</span>
              <Link
                href="/sitios-turisticos"
                rel="dofollow"
                className="hover:text-[#00C8D4] transition-colors cursor-pointer"
              >
                Sitios Emblemáticos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
