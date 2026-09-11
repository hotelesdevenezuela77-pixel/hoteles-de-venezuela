import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { supabase } from "../lib/supabase";
import { ESTABLISHMENTS_MOCK } from "../lib/establishmentsMock";
import type { Establishment } from "../components/layout/EstablishmentCard";

import { HeroSectionV2 } from "../components/homeV2/HeroSectionV2";
import { BoutiqueEstablishmentCard } from "../components/homeV2/BoutiqueEstablishmentCard";
import { InteractiveDestinationsGallery } from "../components/homeV2/InteractiveDestinationsGallery";
import { ReviewsCarouselV2 } from "../components/homeV2/ReviewsCarouselV2";
import { DirectBookingAuthorityBanner } from "../components/homeV2/DirectBookingAuthorityBanner";
import { B2BOwnerBannerV2 } from "../components/homeV2/B2BOwnerBannerV2";

import { Sparkles, ArrowRight, Compass, ShieldCheck, Waves, Mountain, Trees, Building2, Flame } from "lucide-react";

export function HomeV2() {
  const [, setLocation] = useLocation();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Fetch approved establishments from Supabase or fallback mock
  useEffect(() => {
    async function fetchEstablishments() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("establishments")
          .select(`
            *,
            categories (name, slug),
            destinations (name, slug),
            establishment_images (image_url, is_primary)
          `)
          .eq("status", "approved")
          .limit(12);

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: Establishment[] = data.map((item: any) => {
            const primaryImg = item.establishment_images?.find((img: any) => img.is_primary)?.image_url 
              || item.establishment_images?.[0]?.image_url 
              || "";

            return {
              id: item.id,
              slug: item.slug,
              name: item.name,
              description: item.description || "",
              address: item.address || "",
              phone: item.phone || "",
              whatsapp: item.whatsapp || "",
              website: item.website || "",
              category_name: item.categories?.name || "Establecimiento",
              category_slug: item.categories?.slug || "",
              destination_name: item.destinations?.name || "",
              destination_slug: item.destinations?.slug || "",
              primary_image: primaryImg,
              rating_avg: item.rating_avg || 4.8,
              review_count: item.review_count || 12,
              price_level: item.price_level || "$$",
              is_featured: item.is_featured || false,
              services: item.services || "[]",
              membership_tier: item.membership_tier || "basic",
              has_hdv_seal: item.has_hdv_seal || false,
              has_reservations_enabled: item.has_reservations_enabled || false,
              is_ads_enabled: item.is_ads_enabled || false
            };
          });
          setEstablishments(mapped);
        } else {
          setEstablishments(ESTABLISHMENTS_MOCK);
        }
      } catch (err) {
        console.warn("HomeV2: Usando datos de respaldo para demostración:", err);
        setEstablishments(ESTABLISHMENTS_MOCK);
      } finally {
        setLoading(false);
      }
    }
    fetchEstablishments();
  }, []);

  // Filter establishments based on selected active tab
  const filteredEstablishments = React.useMemo(() => {
    if (activeTab === "all") return establishments;
    if (activeTab === "playa") {
      return establishments.filter(est => 
        ["los-roques", "morrocoy", "mochima", "margarita", "coche"].includes(est.destination_slug || "") ||
        est.name.toLowerCase().includes("posada") || est.name.toLowerCase().includes("cayo")
      );
    }
    if (activeTab === "montana") {
      return establishments.filter(est => 
        ["merida", "colonia-tovar", "sanare", "galipan"].includes(est.destination_slug || "") ||
        est.name.toLowerCase().includes("andina") || est.name.toLowerCase().includes("montaña")
      );
    }
    if (activeTab === "selva") {
      return establishments.filter(est => 
        ["canaima", "amazonas"].includes(est.destination_slug || "") ||
        est.name.toLowerCase().includes("campamento") || est.name.toLowerCase().includes("tepuy")
      );
    }
    if (activeTab === "boutique") {
      return establishments.filter(est => est.has_hdv_seal || est.membership_tier === "diamante" || est.rating_avg >= 4.7);
    }
    return establishments;
  }, [establishments, activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[#00C8D4] selection:text-slate-950">
      
      {/* 1. Hero Section & Buscador Modular (Sección A) */}
      <HeroSectionV2 />

      {/* 2. Sección de Tarjetas Rediseñadas / Listing Cards (Sección B) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        
        {/* Encabezado y Categorías de Filtro */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/20 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SELECCIÓN EXCLUSIVA DE HOSPEDAJES</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
              Posadas y Hoteles <span className="text-gradient-brand">Destacados</span>
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl font-medium">
              Fotografía real, servicios operativos verificados y contacto directo por WhatsApp con los anfitriones.
            </p>
          </div>

          {/* Selector de Pestañas de Filtros Rápidos */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-200/60 p-1.5 rounded-2xl border border-slate-200">
            {[
              { id: "all", label: "Todos", icon: Flame, solidBg: "#FF0096" },
              { id: "playa", label: "Playa & Cayos", icon: Waves, solidBg: "#00C8D4" },
              { id: "montana", label: "Montaña & Frío", icon: Mountain, solidBg: "#10b981" },
              { id: "selva", label: "Canaima & Selva", icon: Trees, solidBg: "#f59e0b" },
              { id: "boutique", label: "Sello HDV", icon: ShieldCheck, solidBg: "#9B00CC" }
            ].map(tab => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-slate-900 shadow-md scale-[1.02]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <div 
                    className="w-4 h-4 rounded-md flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: tab.solidBg }}
                  >
                    <IconComp className="w-2.5 h-2.5 text-white stroke-[2.5]" />
                  </div>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid de Tarjetas Luxe (Sección B) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-3xl h-[420px] animate-pulse border border-slate-200 p-4 space-y-4">
                <div className="w-full h-48 bg-slate-200 rounded-2xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-10 bg-slate-200 rounded-xl mt-6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEstablishments.slice(0, 9).map(est => (
              <BoutiqueEstablishmentCard key={est.id} establishment={est} />
            ))}
          </div>
        )}

        {/* CTA Ver Catálogo Completo */}
        <div className="pt-6 text-center">
          <Link
            href="/establecimientos"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider shadow-xl hover:scale-105 transition-all cursor-pointer"
          >
            <span>Ver Todos los Alojamientos (+500)</span>
            <ArrowRight className="w-4 h-4 text-[#00C8D4]" />
          </Link>
        </div>

      </section>

      {/* 3. Sección de Destinos / Exploración Interactiva (Sección C) */}
      <InteractiveDestinationsGallery />

      {/* 4. Banner de Autoridad y Trato Directo (Sección E) */}
      <DirectBookingAuthorityBanner />

      {/* 5. Carrusel Interactivo de Testimonios (Sección D) */}
      <ReviewsCarouselV2 />

      {/* 6. Optimización B2B - Propietarios (Sección F) */}
      <B2BOwnerBannerV2 />

    </div>
  );
}
