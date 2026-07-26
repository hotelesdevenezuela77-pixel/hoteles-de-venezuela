import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { TOP10_HOTELS_STATIC_DATA } from "../config/top10Hoteles";
import { MapPin, Award, Shield, Sparkles, Phone, ArrowLeft, Star, Compass } from "lucide-react";
import { OFFICIAL_WHATSAPP_NUMBER } from "@/config/whatsapp";

export function Top10Hoteles() {
  // SEO Metadata dynamic inject
  useEffect(() => {
    const originalTitle = document.title;
    document.title = "Los 10 Mejores Hoteles de Venezuela 2026 | Ranking Oficial";

    const updateMetaTag = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute("name", name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    updateMetaTag(
      "description",
      "Reportaje exhaustivo y guía turística oficial con los 10 mejores hoteles en Venezuela para 2026. Del lujo histórico en Caracas al confort boutique caribeño y andino."
    );
    updateMetaTag(
      "keywords",
      "mejores hoteles venezuela, hoteles de lujo venezuela, ranking hoteles 2026, posadas de lujo venezuela, hotel humboldt caracas, eurobuilding caracas, jw marriott caracas, lidotel barquisimeto, hesperia valencia, tibisay margarita, venetur maracaibo, wyndham margarita, parador merida"
    );

    return () => {
      document.title = originalTitle;
    };
  }, []);

  // Fetch site settings to get custom images if uploaded
  const { data: settings = [], isLoading } = useQuery<any[]>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("site_settings").select("*");
        if (error) throw error;
        return data || [];
      } catch (e) {
        console.warn("Error cargando configuración en Top10Hoteles:", e);
        return [];
      }
    }
  });

  const imagesSetting = settings.find(
    (s) => s.setting_key === "top_10_hotels_images" || s.settingKey === "top_10_hotels_images"
  );
  const uploadedImages = imagesSetting ? JSON.parse(imagesSetting.setting_value || "{}") : {};

  // Parse whatsapp link
  const cleanPhone = OFFICIAL_WHATSAPP_NUMBER.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=Hola,%20deseo%20obtener%20informaci%C3%B3n%20y%20tarifas%20de%20los%20mejores%20hoteles%20de%20Venezuela.`;

  return (
    <div className="min-h-screen bg-gray-50/30 pb-24 font-sans text-slate-800">
      {/* Banner de Portada (Full-Bleed) */}
      <div className="w-full relative h-[450px] md:h-[550px] overflow-hidden bg-[#0e011f]">
        <img
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80"
          alt="Paraíso en Venezuela"
          className="w-full h-full object-cover scale-[1.08] opacity-85"
        />

        {/* Capa de degradado superior y medio */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e011f]/60 via-[#1a0533]/40 to-transparent pointer-events-none" />

        {/* Degradado blanco en la parte inferior */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-gray-50/100 via-gray-50/50 to-transparent pointer-events-none" />

        {/* Título centrado horizontal y verticalmente */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="text-[#00C8D4] text-xs md:text-sm font-black tracking-[0.3em] uppercase mb-4 drop-shadow-md">
            INFORME DE AUTORIDAD TURÍSTICA
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight drop-shadow-2xl leading-none max-w-5xl playfair">
            Los 10 Mejores Hoteles en Venezuela
          </h1>
          <p className="text-white/95 text-sm md:text-lg font-bold tracking-wide uppercase mt-4 max-w-2xl drop-shadow-md font-sans">
            Guía Exclusiva y Reportaje Especializado 2026
          </p>
        </div>
      </div>

      {/* Cuerpo de la Página */}
      <div className="max-w-6xl mx-auto px-6 mt-4">
        {/* Volver al inicio breadcrumb */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-[#FF0096] transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            <span>VOLVER AL INICIO</span>
          </Link>
        </div>

        {/* Introducción SEO Semántica */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-10 shadow-xl mb-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#00C8D4]" />
          <div className="max-w-4xl">
            <h2 className="text-2xl font-black text-slate-900 mb-4 playfair">
              Excelencia, Seguridad y Lujo en el Sector Hotelero Nacional
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-4">
              Venezuela posee una riqueza geográfica y cultural inigualable que abarca desde la imponente majestuosidad de la Cordillera de los Andes y las sabanas guayanesas, hasta las paradisíacas costas del Mar Caribe y la vibrante modernidad de sus metrópolis. El sector hotelero nacional ha evolucionado profundamente, adaptándose a los estándares internacionales de hospitalidad, tecnología verde, lujo ejecutivo y experiencias ecoturísticas inmersivas.
            </p>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed font-bold">
              Este reportaje exhaustivo ha sido estructurado bajo rigurosos parámetros de optimización en motores de búsqueda (SEO semántico y de intención de usuario) para identificar, analizar y posicionar los <strong>10 mejores hoteles en Venezuela</strong>, sirviendo como la brújula definitiva para viajeros corporativos, turistas internacionales y nacionales que buscan excelencia, seguridad y confort.
            </p>
          </div>
        </div>

        {/* Listado de Hoteles */}
        <div className="space-y-12">
          {TOP10_HOTELS_STATIC_DATA.map((h, idx) => {
            const hasCustomImage = uploadedImages[h.id];
            const hotelImage = hasCustomImage || h.defaultImage;
            const isEven = idx % 2 === 0;

            return (
              <div 
                key={h.id}
                className={`bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col lg:flex-row ${
                  isEven ? "" : "lg:flex-row-reverse"
                }`}
              >
                {/* Imagen del Hotel */}
                <div className="w-full lg:w-1/2 h-[300px] md:h-[400px] relative overflow-hidden flex-shrink-0 bg-slate-950">
                  {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-4 border-[#0e011f] border-t-[#00C8D4] animate-spin" />
                    </div>
                  ) : (
                    <img 
                      src={hotelImage} 
                      alt={h.name} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  )}
                  {/* Número de Ranking */}
                  <div className="absolute top-6 left-6 w-14 h-14 bg-[#FF0096] text-white flex items-center justify-center rounded-2xl font-black text-xl shadow-lg border border-[#FF0096]/20">
                    #{h.id}
                  </div>
                  {/* Tag de Categoría encima de la imagen */}
                  <div className="absolute bottom-6 left-6 bg-[#0e011f]/85 backdrop-blur-md text-white text-[10px] font-black tracking-wider uppercase px-4 py-2 rounded-xl border border-white/10">
                    {h.category}
                  </div>
                </div>

                {/* Detalles del Hotel */}
                <div className="w-full lg:w-1/2 p-8 md:p-10 flex flex-col justify-between">
                  <div>
                    {/* Ubicación con icono unicolor en caja */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-[#00C8D4]/10 rounded-lg flex items-center justify-center border border-[#00C8D4]/20 flex-shrink-0">
                        <MapPin className="w-4 h-4 text-[#00C8D4]" />
                      </div>
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                        {h.location}
                      </span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-4 playfair">
                      {h.name}
                    </h3>

                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line mb-6">
                      {h.description}
                    </p>
                  </div>

                  {/* Atributos SEO */}
                  <div className="border-t border-slate-100 pt-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-3">
                      Atributos Clave / SEO
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {h.seoAttributes.map((attr, aIdx) => (
                        <span 
                          key={aIdx} 
                          className="bg-slate-50 text-slate-600 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-100"
                        >
                          #{attr}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sección de Cierre (Bottom CTA) */}
        <div className="mt-24 bg-gradient-to-br from-[#FF0096] to-[#9B00CC] rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          {/* Decorative glows */}
          <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-[#00C8D4]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase mb-6 border border-white/10">
              <Sparkles className="w-4 h-4 text-white" />
              EL VIAJE DE TUS SUEÑOS COMIENZA AQUÍ
            </span>
            <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight playfair leading-tight">
              ¿Planeando tu próxima estadía de lujo en Venezuela?
            </h2>
            <p className="text-white/90 text-sm md:text-base font-medium mb-8 max-w-xl mx-auto">
              Contáctanos de manera directa y obtén tarifas preferenciales, disponibilidad en tiempo real y asistencia personalizada sin intermediarios.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#FF0096] rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
              >
                <Phone className="w-4 h-4 fill-[#FF0096] text-[#FF0096]" />
                Reservar por WhatsApp
              </a>
              <Link
                href="/establecimientos"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                Explorar Más Hoteles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
