import React, { useState } from "react";
import { Link } from "wouter";
import { 
  MapPin, Star, ShieldCheck, Zap, Droplets, Wifi, Dog, ChevronLeft, ChevronRight, Eye, Sparkles
} from "lucide-react";
import type { Establishment } from "../layout/EstablishmentCard";
import { getVirtualPrice } from "../layout/EstablishmentCard";
import { TrackedWhatsAppButton } from "../layout/TrackedWhatsAppButton";

interface BoutiqueEstablishmentCardProps {
  establishment: Establishment;
}

export function BoutiqueEstablishmentCard({ establishment }: BoutiqueEstablishmentCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Extraer o generar array de fotos para el carrusel
  const images = React.useMemo(() => {
    const list: string[] = [];
    if (establishment.primary_image) list.push(establishment.primary_image);
    
    // Si viene de mock o backend con imágenes adicionales
    if ((establishment as any).establishment_images && Array.isArray((establishment as any).establishment_images)) {
      (establishment as any).establishment_images.forEach((img: any) => {
        const url = typeof img === "string" ? img : img.image_url;
        if (url && !list.includes(url)) list.push(url);
      });
    }

    // Fallbacks fotográficos elegantes si solo hay una foto
    if (list.length === 1) {
      if (establishment.category_slug === "posadas") {
        list.push("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop");
        list.push("https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop");
      } else {
        list.push("https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop");
        list.push("https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop");
      }
    }
    return list.slice(0, 4);
  }, [establishment]);

  const price = getVirtualPrice(establishment);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
  };

  // Detección de tarjetas destacadas / recomendadas con fondo de color sólido (Regla #3 AGENTS.md)
  const isFeaturedCard = establishment.is_featured || establishment.has_hdv_seal || establishment.membership_tier === "diamante" || establishment.membership_tier === "gold" || establishment.rating_avg >= 4.9;

  return (
    <div className={`group rounded-3xl overflow-hidden transition-all duration-300 flex flex-col h-full relative ${
      isFeaturedCard
        ? "bg-gradient-to-br from-[#0e011f] via-[#15062c] to-[#1a0533] text-white border border-[#9B00CC]/50 shadow-xl shadow-purple-950/30 hover:shadow-2xl hover:shadow-cyan-950/40"
        : "bg-white border border-slate-200/80 text-slate-800 shadow-sm hover:shadow-2xl hover:shadow-cyan-950/10"
    }`}>
      
      {/* Contenedor Superior: Carrusel Integrado en Foto */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900 select-none">
        
        {/* Imagen Actual */}
        <img
          src={images[currentImageIndex] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"}
          alt={establishment.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Capa de Gradiente sutil para legibilidad de badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/40 pointer-events-none" />

        {/* Flechas del Carrusel (Visibles en Hover en Desktop) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20 backdrop-blur-xs"
              title="Anterior foto"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20 backdrop-blur-xs"
              title="Siguiente foto"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Puntos (Dots) del carrusel */}
            <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-1 z-20">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? "w-4 bg-white shadow-sm" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Top Badges Operativos (Esquina Superior Izquierda) */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-20 max-w-[85%]">
          {establishment.has_hdv_seal && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-[#FF0096] text-white shadow-md">
              <div className="w-3 h-3 rounded-full bg-white/20 flex items-center justify-center">
                <ShieldCheck className="w-2 h-2 text-white stroke-[2.5]" />
              </div>
              <span>RECOMENDADO HDV</span>
            </span>
          )}

          {hasPlanta && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/90 text-white backdrop-blur-md shadow-xs">
              <Zap className="w-2.5 h-2.5 text-white fill-white" />
              <span>Planta 100%</span>
            </span>
          )}

          {hasAgua && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-600/90 text-white backdrop-blur-md shadow-xs">
              <Droplets className="w-2.5 h-2.5 text-white fill-white" />
              <span>Agua 24/7</span>
            </span>
          )}

          {hasStarlink && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-600/90 text-white backdrop-blur-md shadow-xs">
              <Wifi className="w-2.5 h-2.5 text-white" />
              <span>Starlink</span>
            </span>
          )}

          {isPetFriendly && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-600/90 text-white backdrop-blur-md shadow-xs">
              <Dog className="w-2.5 h-2.5 text-white" />
              <span>Pet Friendly</span>
            </span>
          )}
        </div>

        {/* Rating Badge (Esquina Superior Derecha) */}
        <div className="absolute top-3 right-3 z-20">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-white text-[10px] font-black shadow-md">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{establishment.rating_avg ? establishment.rating_avg.toFixed(1) : "4.8"}</span>
          </div>
        </div>
      </div>

      {/* Contenido Inferior de la Tarjeta */}
      <div className="p-4 flex flex-col justify-between flex-1 space-y-3 text-left">
        <div className="space-y-1.5">
          
          {/* Categoría & Destino */}
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
            <span className="text-[#00C8D4] font-extrabold">{establishment.category_name || "Hospedaje"}</span>
            <div className={`flex items-center gap-1 ${isFeaturedCard ? "text-slate-300" : "text-slate-500"}`}>
              <MapPin className="w-3 h-3 text-[#FF0096]" />
              <span className="truncate max-w-[130px]">{establishment.destination_name || "Venezuela"}</span>
            </div>
          </div>

          {/* Nombre del Establecimiento */}
          <Link href={`/establecimiento/${establishment.slug}`}>
            <h3 className={`text-sm sm:text-base font-black transition-colors line-clamp-1 cursor-pointer ${
              isFeaturedCard ? "text-white group-hover:text-[#00C8D4]" : "text-slate-900 group-hover:text-[#00C8D4]"
            }`}>
              {establishment.name}
            </h3>
          </Link>

          {/* Descripción corta */}
          <p className={`text-xs font-medium line-clamp-2 leading-relaxed ${
            isFeaturedCard ? "text-slate-300" : "text-slate-500"
          }`}>
            {establishment.description || "Posada boutique exclusiva con atención personalizada y reservación directa."}
          </p>
        </div>

        {/* Sección de Precio & CTA Buttons */}
        <div className={`pt-2 border-t space-y-3 ${isFeaturedCard ? "border-slate-800" : "border-slate-100"}`}>
          
          {/* Tarifa Desde $/noche */}
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Tarifa Directa</span>
            <div>
              <span className="text-xs text-slate-400 font-bold">Desde </span>
              <span className="text-lg font-black text-[#FF0096]">${price}</span>
              <span className={`text-[10px] font-normal ${isFeaturedCard ? "text-slate-400" : "text-slate-500"}`}> / noche</span>
            </div>
          </div>

          {/* Botones de Acción con Jerarquía Clara */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            
            {/* CTA Primario: WhatsApp Directo */}
            <TrackedWhatsAppButton
              whatsappNumber={establishment.whatsapp || establishment.phone || "+584141234567"}
              establishmentId={establishment.id}
              establishmentName={establishment.name}
              className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-[11px] py-2.5 px-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-500/20 transition-transform active:scale-98"
            >
              <span>WhatsApp</span>
            </TrackedWhatsAppButton>

            {/* CTA Secundario: Ver Ficha / Detalle */}
            <Link
              href={`/establecimiento/${establishment.slug}`}
              className={`w-full text-[11px] font-black py-2.5 px-2 rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                isFeaturedCard
                  ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950 border border-slate-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-[#00C8D4]" />
              <span>Ver Ficha</span>
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}
