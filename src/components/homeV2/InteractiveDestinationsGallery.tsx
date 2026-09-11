import React from "react";
import { Link } from "wouter";
import { Map, ArrowUpRight, Compass, Sparkles } from "lucide-react";

export function InteractiveDestinationsGallery() {
  const destinations = [
    {
      id: "los-roques",
      name: "Los Roques",
      subtitle: "Archipiélago Caribeño",
      description: "Cayos de aguas turquesas cristalinas y posadas exclusivas en Gran Roque.",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000&auto=format&fit=crop",
      count: "38 Posadas",
      gridClass: "col-span-1 md:col-span-2 row-span-2 aspect-[4/3] md:aspect-auto h-[360px] md:h-[480px]",
      solidBg: "#00C8D4"
    },
    {
      id: "canaima",
      name: "Canaima & Tepuyes",
      subtitle: "Parque Nacional Gran Sabana",
      description: "El Salto Ángel y paisajes milenarios de la Amazonía venezolana.",
      image: "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=800&auto=format&fit=crop",
      count: "15 Campamentos",
      gridClass: "col-span-1 md:col-span-1 h-[230px]",
      solidBg: "#10b981"
    },
    {
      id: "morrocoy",
      name: "Parque Nacional Morrocoy",
      subtitle: "Tucacas & Chichiriviche",
      description: "Cayo Sombrero, Cayo Muerto y marinas náuticas con acceso a lancha.",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
      count: "42 Hospedajes",
      gridClass: "col-span-1 md:col-span-1 h-[230px]",
      solidBg: "#FF0096"
    },
    {
      id: "merida",
      name: "Andes & Mérida",
      subtitle: "Sierra Nevada & Cordillera",
      description: "Picos con nieve, pueblos de montaña y posadas acogedoras con chimenea.",
      image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop",
      count: "29 Posadas",
      gridClass: "col-span-1 md:col-span-1 h-[230px]",
      solidBg: "#9B00CC"
    },
    {
      id: "colonia-tovar",
      name: "Colonia Tovar & Galipán",
      subtitle: "Montañas del Ávila & Aragua",
      description: "Clima frío, gastronomía artesanal y cabañas boutique a minutos de la ciudad.",
      image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&fit=crop",
      count: "18 Cabañas",
      gridClass: "col-span-1 md:col-span-1 h-[230px]",
      solidBg: "#f59e0b"
    }
  ];

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      
      {/* Background Subtle Gradient & Grid */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0e011f] to-slate-950 opacity-90 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-10 text-left">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00C8D4]/15 border border-[#00C8D4]/30 text-[#00C8D4] text-xs font-black uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>REGIONES DE VENEZUELA</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
              Explora los Destinos más <span className="bg-gradient-to-r from-[#00C8D4] to-[#FF0096] bg-clip-text text-transparent">Emblemáticos</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              De los cayos cristalinos de Los Roques a los milenarios tepuyes de Canaima. Selecciona la zona de tus próximas vacaciones.
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

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {destinations.map(dest => (
            <Link
              key={dest.id}
              href={`/destinos/${dest.id}`}
              className={`group relative rounded-3xl overflow-hidden shadow-xl border border-white/10 block transition-transform duration-500 hover:scale-[1.01] ${dest.gridClass}`}
            >
              {/* Image */}
              <img
                src={dest.image}
                alt={dest.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

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
              <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 group-hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-colors">
                <ArrowUpRight className="w-4 h-4 text-white" />
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 z-10 space-y-1 text-left">
                <span className="text-[10px] uppercase font-black tracking-wider text-[#00C8D4]">
                  {dest.subtitle}
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-black text-white group-hover:text-amber-300 transition-colors">
                  {dest.name}
                </h3>
                <p className="text-xs text-slate-300 font-medium line-clamp-2 leading-relaxed opacity-90">
                  {dest.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
