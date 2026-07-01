import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { supabase } from "../lib/supabase";
import { DESTINOS_MOCK } from "../lib/destinosMock";
import type { Destination } from "../lib/destinosMock";
import { 
  ArrowLeft, MapPin, Sun, Plane, Calendar, Utensils, 
  Compass, Loader2, Sparkles, Image as ImageIcon, ExternalLink 
} from "lucide-react";

export function DestinoDetalle() {
  const [, params] = useRoute("/destinos/:slug");
  const slug = (params as any)?.slug;
  
  const [destino, setDestino] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDestino() {
      if (!slug) return;
      try {
        setLoading(true);
        // Intentar consultar de Supabase
        const { data, error } = await supabase
          .from("destinations")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setDestino(data as Destination);
        } else {
          // Si no está, buscar en el mock
          const localDest = DESTINOS_MOCK.find(d => d.slug === slug);
          setDestino(localDest || null);
        }
      } catch (err) {
        console.warn("Error consultando Supabase, usando datos de mock:", err);
        const localDest = DESTINOS_MOCK.find(d => d.slug === slug);
        setDestino(localDest || null);
      } finally {
        setLoading(false);
      }
    }

    fetchDestino();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-magenta animate-spin" />
        <p className="text-gray-400 text-xs font-bold">Cargando detalles del destino...</p>
      </div>
    );
  }

  if (!destino) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-6">
        <Compass className="w-16 h-16 text-gray-300" />
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Destino no encontrado</h2>
        <p className="text-gray-400 text-xs max-w-md">
          El destino que estás buscando no existe o aún no ha sido aprobado por nuestro equipo de administración.
        </p>
        <Link href="/destinos" className="btn-magenta-gradient px-6 py-3 rounded-xl font-bold text-xs shadow-md">
          Volver a Destinos
        </Link>
      </div>
    );
  }

  // Parsear atracciones y galería (son strings separados por comas)
  const atraccionesArray = destino.attractions 
    ? destino.attractions.split(",").map(attr => attr.trim()).filter(Boolean)
    : [];

  const galeriaArray = destino.gallery_images
    ? destino.gallery_images.split(",").map(img => img.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-gray-50/20 pb-24">
      {/* Botón Flotante para Volver */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <Link href="/destinos" className="inline-flex items-center gap-2 text-xs font-black text-gray-500 hover:text-brand-magenta transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>VOLVER A DESTINOS</span>
        </Link>
      </div>

      {/* Hero Header */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[400px] md:h-[500px]">
          {/* Imagen Hero */}
          <img 
            src={
              (!destino.image_url || destino.image_url.startsWith("/") || destino.image_url.includes("localhost") || destino.image_url.includes("127.0.0.1") || destino.image_url.includes("/api/files/"))
                ? (DESTINOS_MOCK.find(m => m.slug === destino.slug)?.image_url || "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&q=80")
                : destino.image_url
            } 
            alt={destino.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&q=80";
            }}
          />
          {/* Overlay Oscuro */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/20"></div>

          {/* Información del Hero */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1 bg-brand-magenta text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase shadow-lg shadow-brand-magenta/20 mb-3">
                <MapPin className="w-3 h-3" />
                <span>{destino.state}</span>
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight drop-shadow-md">
                {destino.name}
              </h1>
              <p className="text-gray-200 text-xs md:text-sm leading-relaxed mt-4 drop-shadow">
                {destino.description}
              </p>
            </div>
            
            {/* Botón flotante para ver hoteles */}
            <Link href={`/establecimientos?destino=${destino.slug}`} className="shrink-0 btn-cyan-gradient px-6 py-3.5 rounded-2xl font-black text-xs shadow-lg shadow-brand-turquesa/10 flex items-center gap-2 cursor-pointer active:scale-98">
              <span>Buscar Hoteles</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Descripción Detallada */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        <div className="bg-white border border-gray-100/80 rounded-3xl p-8 md:p-10 shadow-lg shadow-gray-200/40">
          <h2 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-brand-magenta" />
            <span>Sobre {destino.name}</span>
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">
            {destino.long_description}
          </p>
        </div>
      </div>

      {/* Grid de Información Práctica */}
      <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Clima */}
        {destino.climate && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <h3 className="font-black text-gray-800 tracking-tight text-sm">Clima y Temperatura</h3>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              {destino.climate}
            </p>
          </div>
        )}

        {/* Cómo Llegar */}
        {destino.how_to_get_there && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center">
                <Plane className="w-5 h-5" />
              </div>
              <h3 className="font-black text-gray-800 tracking-tight text-sm">¿Cómo llegar?</h3>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed whitespace-pre-line">
              {destino.how_to_get_there}
            </p>
          </div>
        )}

        {/* Mejor Época */}
        {destino.best_time_to_visit && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-black text-gray-800 tracking-tight text-sm">Mejor época para visitar</h3>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              {destino.best_time_to_visit}
            </p>
          </div>
        )}

        {/* Gastronomía */}
        {destino.gastronomy && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <Utensils className="w-5 h-5" />
              </div>
              <h3 className="font-black text-gray-800 tracking-tight text-sm">Gastronomía Típica</h3>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed whitespace-pre-line">
              {destino.gastronomy}
            </p>
          </div>
        )}

      </div>

      {/* Atracciones Imperdibles */}
      {atraccionesArray.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-16">
          <h2 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2 mb-8">
            <Compass className="w-5 h-5 text-brand-purple" />
            <span>Lugares y Atracciones Imperdibles</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            {atraccionesArray.map((atraccion, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-gray-100/80 px-4 py-3 rounded-2xl shadow-sm text-xs font-bold text-gray-700 flex items-center gap-2 hover:border-brand-purple/20 transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center text-[10px] font-black">
                  {idx + 1}
                </span>
                <span>{atraccion}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Galería de Fotos */}
      {galeriaArray.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-16">
          <h2 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2 mb-8">
            <ImageIcon className="w-5 h-5 text-brand-magenta" />
            <span>Galería del Destino</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {galeriaArray.map((imgUrl, idx) => {
              const cleanedImgUrl = (!imgUrl || imgUrl.startsWith("/") || imgUrl.includes("localhost") || imgUrl.includes("127.0.0.1") || imgUrl.includes("/api/files/"))
                ? "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
                : imgUrl;
              return (
                <div key={idx} className="group relative rounded-3xl overflow-hidden shadow-md h-64 bg-gray-100 border border-gray-100">
                  <img 
                    src={cleanedImgUrl} 
                    alt={`${destino.name} Galería ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      // Fallback
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-[10px] text-white font-black tracking-widest uppercase">
                      {destino.name} #{idx + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Llamada a la Acción (CTA) Final */}
      <div className="max-w-7xl mx-auto px-6 mt-20">
        <div className="bg-gradient-to-r from-brand-purple-dark via-brand-purple-deep to-black rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-xl border border-brand-purple/20">
          {/* Brillos */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-brand-magenta/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-turquesa/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3">
              ¿Listo para planificar tu viaje?
            </h2>
            <p className="text-gray-300 text-xs md:text-sm leading-relaxed mb-8">
              Encuentra los mejores hoteles, posadas y restaurantes con el Sello de Calidad de Hoteles de Venezuela en {destino.name}.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={`/establecimientos?destino=${destino.slug}`} className="btn-magenta-gradient px-8 py-3.5 rounded-2xl font-black text-xs shadow-lg shadow-brand-magenta/15 w-full sm:w-auto text-center cursor-pointer active:scale-98">
                Ver Hospedajes en {destino.name}
              </Link>
              <Link href="/destinos" className="bg-white/10 hover:bg-white/15 px-8 py-3.5 rounded-2xl font-black text-xs border border-white/10 w-full sm:w-auto text-center transition-colors cursor-pointer">
                Ver otros destinos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
