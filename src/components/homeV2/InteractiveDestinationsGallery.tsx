import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Map, ArrowUpRight, Compass } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface DestinationItem {
  id: number | string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  count: string;
  solidBg: string;
}

const DEFAULT_DESTINATIONS: DestinationItem[] = [
  {
    id: "bahia-de-cata",
    slug: "bahia-de-cata",
    name: "Bahía de Cata",
    subtitle: "Aragua • Costa de Oro",
    description: "Aguas turquesas, arenas doradas y cocoteros rodeados de la majestuosa Cordillera de la Costa.",
    image: "https://ghgetcznlrilgocwigmj.supabase.co/storage/v1/object/public/establecimientos/destinos/main-1783185384396-m528d.jpg",
    count: "Bahía & Playa",
    solidBg: "#00C8D4"
  },
  {
    id: "los-roques",
    slug: "los-roques",
    name: "Los Roques",
    subtitle: "Dependencias Federales",
    description: "Cayos de aguas turquesas cristalinas y posadas exclusivas en Gran Roque.",
    image: "https://ghgetcznlrilgocwigmj.supabase.co/storage/v1/object/public/establecimientos/destinos/main-1783186885340-wqclx.jpg",
    count: "Posadas & Cayos",
    solidBg: "#FF0096"
  },
  {
    id: "canaima",
    slug: "canaima",
    name: "Canaima & Tepuyes",
    subtitle: "Bolívar • Gran Sabana",
    description: "El Salto Ángel y paisajes milenarios de la Amazonía venezolana.",
    image: "https://ghgetcznlrilgocwigmj.supabase.co/storage/v1/object/public/establecimientos/destinos/main-1783185563983-25j2c.jpg",
    count: "Campamentos",
    solidBg: "#10b981"
  },
  {
    id: "morrocoy",
    slug: "morrocoy",
    name: "Parque Nacional Morrocoy",
    subtitle: "Falcón • Tucacas & Chichiriviche",
    description: "Cayo Sombrero, Cayo Muerto y marinas náuticas con acceso a lancha.",
    image: "https://ghgetcznlrilgocwigmj.supabase.co/storage/v1/object/public/establecimientos/destinos/main-1783187512226-p6tmz.jpg",
    count: "Marinas & Hospedajes",
    solidBg: "#9B00CC"
  },
  {
    id: "merida",
    slug: "merida",
    name: "Andes & Mérida",
    subtitle: "Mérida • Cordillera Andina",
    description: "Picos con nieve, pueblos de montaña y posadas acogedoras con chimenea.",
    image: "https://ghgetcznlrilgocwigmj.supabase.co/storage/v1/object/public/establecimientos/destinos/main-1783187454493-boqoa.jpg",
    count: "Posadas Andinas",
    solidBg: "#f59e0b"
  },
  {
    id: "colonia-tovar",
    slug: "colonia-tovar",
    name: "Colonia Tovar & Galipán",
    subtitle: "Aragua • Montañas del Ávila",
    description: "Clima frío, gastronomía artesanal y cabañas boutique a minutos de la ciudad.",
    image: "https://ghgetcznlrilgocwigmj.supabase.co/storage/v1/object/public/establecimientos/destinos/main-1783186388404-ep90d.jpg",
    count: "Cabañas Boutique",
    solidBg: "#00C8D4"
  }
];

function getDestinationPhoto(slug: string, name: string, dbPhoto?: string | null): string {
  if (dbPhoto && dbPhoto.startsWith("http") && !dbPhoto.includes("localhost")) return dbPhoto;
  const lower = (slug + " " + name).toLowerCase();
  if (lower.includes("cata")) return "https://ghgetcznlrilgocwigmj.supabase.co/storage/v1/object/public/establecimientos/destinos/main-1783185384396-m528d.jpg";
  if (lower.includes("roques")) return "https://ghgetcznlrilgocwigmj.supabase.co/storage/v1/object/public/establecimientos/destinos/main-1783186885340-wqclx.jpg";
  if (lower.includes("canaima") || lower.includes("salto")) return "https://ghgetcznlrilgocwigmj.supabase.co/storage/v1/object/public/establecimientos/destinos/main-1783185563983-25j2c.jpg";
  if (lower.includes("morrocoy") || lower.includes("tucacas")) return "https://ghgetcznlrilgocwigmj.supabase.co/storage/v1/object/public/establecimientos/destinos/main-1783187512226-p6tmz.jpg";
  if (lower.includes("merida") || lower.includes("andes")) return "https://ghgetcznlrilgocwigmj.supabase.co/storage/v1/object/public/establecimientos/destinos/main-1783187454493-boqoa.jpg";
  if (lower.includes("tovar") || lower.includes("galipan")) return "https://ghgetcznlrilgocwigmj.supabase.co/storage/v1/object/public/establecimientos/destinos/main-1783186388404-ep90d.jpg";
  if (lower.includes("margarita")) return "https://ghgetcznlrilgocwigmj.supabase.co/storage/v1/object/public/establecimientos/destinos/main-1783186579172-mi21g.jpg";
  return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800";
}

const SOLID_COLORS = ["#00C8D4", "#FF0096", "#10b981", "#9B00CC", "#f59e0b"];

export function InteractiveDestinationsGallery() {
  const [destinations, setDestinations] = useState<DestinationItem[]>(DEFAULT_DESTINATIONS);

  useEffect(() => {
    async function loadRealDestinations() {
      try {
        const { data, error } = await supabase
          .from("destinations")
          .select("*")
          .order("id", { ascending: true })
          .limit(12);

        if (error) throw error;

        if (data && data.length > 0) {
          // Ordenar para garantizar que Bahía de Cata sea SIEMPRE el primer destino (índice 0)
          const sorted = [...data].sort((a, b) => {
            const aIsCata = a.slug.includes("cata") || a.name.toLowerCase().includes("cata");
            const bIsCata = b.slug.includes("cata") || b.name.toLowerCase().includes("cata");
            if (aIsCata) return -1;
            if (bIsCata) return 1;
            return 0;
          });

          const mapped: DestinationItem[] = sorted.slice(0, 6).map((item: any, idx: number) => ({
            id: item.id,
            slug: item.slug,
            name: item.name,
            subtitle: item.state ? `${item.state}` : "Destino Turístico",
            description: item.description || `Explora posadas y alojamientos verificados en ${item.name}.`,
            image: getDestinationPhoto(item.slug, item.name, item.image_url),
            count: `Destino HDV`,
            solidBg: SOLID_COLORS[idx % SOLID_COLORS.length]
          }));
          setDestinations(mapped);
        }
      } catch (err) {
        console.warn("InteractiveDestinationsGallery: usando destinos por defecto:", err);
      }
    }
    loadRealDestinations();
  }, []);

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Subtle Gradient & Grid */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0e011f] to-slate-950 opacity-90 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-10 text-left">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00C8D4]/15 border border-[#00C8D4]/30 text-[#00C8D4] text-xs font-black uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-[#00C8D4]" />
              <span>REGIONES DE VENEZUELA</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
              Explora los Destinos más <span className="bg-gradient-to-r from-[#00C8D4] to-[#FF0096] bg-clip-text text-transparent">Emblemáticos</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Fotografía real de las costas, montañas y parques naturales de Venezuela. Selecciona la zona de tus próximas vacaciones.
            </p>
          </div>

          {/* CTA para Mapa Interactivo */}
          <Link
            href="/mapa"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#00C8D4] via-[#9B00CC] to-[#FF0096] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#00C8D4]/20 hover:scale-105 transition-transform shrink-0"
          >
            <Map className="w-4 h-4 text-white" />
            <span>Explorar en Mapa Interactivo</span>
          </Link>
        </div>

        {/* Bento Grid Layout Dinámico con Destinos Reales de la DB */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {destinations.map((dest, idx) => {
            const isFirst = idx === 0;
            const gridClass = isFirst
              ? "col-span-1 md:col-span-2 row-span-2 aspect-[4/3] md:aspect-auto h-[340px] md:h-[460px]"
              : "col-span-1 md:col-span-1 h-[220px]";

            return (
              <Link
                key={dest.id}
                href={`/destinos/${dest.slug}`}
                className={`group relative rounded-3xl overflow-hidden shadow-xl border border-white/10 block transition-transform duration-500 hover:scale-[1.01] ${gridClass}`}
              >
                {/* Image sin filtro oscuro ni opacidades */}
                <img
                  src={dest.image}
                  alt={dest.name}
                  loading="lazy"
                  className="w-full h-full object-cover filter brightness-105 contrast-105 transition-transform duration-700 group-hover:scale-105"
                />

                {/* Gradient overlay ultra ligero solo abajo para legibilidad del texto */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                {/* Top Count Pill */}
                <div className="absolute top-4 left-4 z-10">
                  <span
                    className="px-3 py-1 rounded-full text-[10px] font-black text-white shadow-md backdrop-blur-md"
                    style={{ backgroundColor: dest.solidBg }}
                  >
                    {dest.count}
                  </span>
                </div>

                {/* Top Arrow Icon */}
                <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 group-hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-white stroke-[2.5]" />
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10 space-y-1 text-left">
                  <span className="text-[10px] uppercase font-black tracking-wider text-[#00C8D4] drop-shadow-md">
                    {dest.subtitle}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-black text-white group-hover:text-[#00C8D4] transition-colors drop-shadow-md">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-slate-200 font-semibold line-clamp-2 leading-relaxed drop-shadow-md">
                    {dest.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
