import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";
import { 
  Award, Building2, Check, MapPin, Search, Sparkles, 
  Star, Shield, Loader2, HelpCircle, AlertTriangle 
} from "lucide-react";

// Paleta de colores oficial (para referencia y estilos inline/clases de Tailwind)
// Cian: #00C8D4, Magenta: #FF0096, Púrpura: #9B00CC
// Oscuros: #0e011f y #1a0533

interface Establishment {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  city: string | null;
  state: string | null;
  status: string;
  category_name: string | null;
  rating_avg: number | null;
  primary_image: string | null;
  address: string | null;
}

export function ExcelenciaLanding() {
  const [, setLocation] = useLocation();
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [hotel, setHotel] = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Establishment[]>([]);
  const [searching, setSearching] = useState(false);
  const [prestigeHotels, setPrestigeHotels] = useState<Establishment[]>([]);
  
  // Estatus de cupos (FOMO dinámico)
  const [cupos, setCupos] = useState(3);
  
  // Leer hotel_id de la URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("hotel_id");
    setHotelId(id);
  }, []);

  // Cargar hotel nominado o sugerencias
  useEffect(() => {
    async function loadLandingData() {
      try {
        setLoading(true);
        
        // Cargar algunos hoteles prestigiosos aprobados para mostrar por defecto si no hay ID
        const { data: popular, error: popErr } = await supabase
          .from("establishments")
          .select("id, name, slug, description, city, state, status, category_name, rating_avg, primary_image, address")
          .eq("status", "approved")
          .limit(6);
          
        if (!popErr && popular) {
          setPrestigeHotels(popular as Establishment[]);
        }

        if (hotelId) {
          const { data, error } = await supabase
            .from("establishments")
            .select("id, name, slug, description, city, state, status, category_name, rating_avg, primary_image, address")
            .eq("id", hotelId)
            .maybeSingle();

          if (error) throw error;
          if (data) {
            setHotel(data as Establishment);
            
            // Cupos dinámicos basados en la localización
            const randomSeed = data.city ? data.city.charCodeAt(0) % 3 + 2 : 3;
            setCupos(randomSeed);
          } else {
            console.warn("Hotel con ID especificado no encontrado.");
          }
        }
      } catch (err) {
        console.error("Error al cargar la información del hotel:", err);
      } finally {
        setLoading(false);
      }
    }

    loadLandingData();
  }, [hotelId]);

  // Manejar buscador en tiempo real
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearching(true);
      try {
        const { data, error } = await supabase
          .from("establishments")
          .select("id, name, slug, description, city, state, status, category_name, rating_avg, primary_image, address")
          .ilike("name", `%${searchQuery}%`)
          .eq("status", "approved")
          .limit(10);

        if (!error && data) {
          setSearchResults(data as Establishment[]);
        }
      } catch (err) {
        console.error("Error en la búsqueda:", err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Validar y publicar perfil
  const handleValidate = async () => {
    if (!hotel) return;
    setValidating(true);
    try {
      const { error } = await supabase
        .from("establishments")
        .update({ status: "pending_validation" })
        .eq("id", hotel.id);

      if (error) throw error;
      setValidated(true);
      
      // Registrar log o evento en consola
      console.log(`Hotel ${hotel.name} validado exitosamente.`);
    } catch (err) {
      console.error("Error al validar el establecimiento:", err);
      alert("Hubo un error al validar su establecimiento. Por favor intente de nuevo.");
    } finally {
      setValidating(false);
    }
  };

  // Enlace de WhatsApp para contacto
  const WHATSAPP_NUMBER = "584145069774";
  const getWhatsAppLink = (text: string) => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-white text-[#1e293b] font-sans pb-16">
      
      {/* ── BARRA DE ESTATUS DE COMITÉ (FOMO) ────────────────────────────────── */}
      <div 
        className="w-full text-white text-center py-2.5 px-4 text-xs md:text-sm font-semibold sticky top-0 z-50 shadow-md flex items-center justify-center gap-2 animate-pulse"
        style={{ background: "linear-gradient(90deg, #FF0096, #9B00CC)" }}
      >
        <Sparkles className="w-4 h-4 text-[#00C8D4] animate-spin" />
        <span>
          {hotel 
            ? `Solo quedan ${cupos} cupos de excelencia disponibles en ${hotel.city || "su zona"}`
            : "Comité de Excelencia 2026: Cupos de nominación limitados por región geográfica"}
        </span>
      </div>

      {/* ── HERO BANNER PORTADA (FULL-BLEED) ────────────────────────────────── */}
      <div className="w-full relative h-[450px] md:h-[550px] overflow-hidden bg-[#0e011f]">
        
        {/* Imagen del Banner con zoom de seguridad scale-[1.08] */}
        <img 
          src={hotel?.primary_image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=80"} 
          alt="Índice de Excelencia 2026"
          className="w-full h-full object-cover scale-[1.08] opacity-60"
        />

        {/* Degradado superior para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none" />

        {/* Degradado inferior blanco para fundirse con el fondo */}
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />

        {/* Contenido centrado del Banner */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
          <p className="text-[#00C8D4] text-xs md:text-sm font-black tracking-[0.4em] uppercase mb-4 drop-shadow-md">
            NOMINACIÓN EXCLUSIVA 2026
          </p>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-normal text-white mb-6 leading-tight max-w-4xl tracking-wide font-serif" style={{ fontFamily: "'Playfair Display', 'Cinzel', serif" }}>
            {hotel 
              ? `Bienvenido al Comité de Excelencia, ${hotel.name}`
              : "Índice de Excelencia 2026: Nominación de Establecimientos"}
          </h1>
          
          <p className="text-white/90 text-sm md:text-base max-w-2xl mx-auto font-sans leading-relaxed drop-shadow">
            {hotel 
              ? "Hemos pre-cargado sus datos en nuestro Índice de Excelencia 2026. Su única tarea es validar que la información represente la calidad de su establecimiento."
              : "La selección oficial de los hoteles más prestigiosos de cada zona geográfica de Venezuela. Valide el perfil borrador de su establecimiento para asegurar su publicación."}
          </p>
        </div>
      </div>

      {/* ── CUERPO PRINCIPAL ──────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 -mt-10 relative z-20">
        
        {loading ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="w-12 h-12 animate-spin text-[#FF0096] mb-4" />
            <p className="text-gray-500 font-medium">Buscando registro en la base de datos de excelencia...</p>
          </div>
        ) : !hotel ? (
          
          /* ── CASO 1: BUSCADOR DE HOTELES (SIN HOTEL_ID O INVÁLIDO) ── */
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
            <div className="max-w-2xl mx-auto text-center mb-8">
              <div className="inline-flex p-3 rounded-full bg-cyan-50 text-[#00C8D4] mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-3">
                Busque su Establecimiento Nominado
              </h2>
              <p className="text-gray-500 text-sm md:text-base">
                Si su hotel ha sido pre-seleccionado por nuestro comité de evaluación, su borrador de perfil estará listo para ser validado. Ingrese el nombre para buscarlo.
              </p>
            </div>

            {/* Input de Búsqueda */}
            <div className="max-w-xl mx-auto relative mb-12">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Escriba el nombre de su hotel o posada..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-[#00C8D4] focus:bg-white transition-all text-slate-800"
              />
              {searching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#00C8D4]" />
                </div>
              )}
            </div>

            {/* Resultados de Búsqueda */}
            {searchResults.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setHotelId(item.id.toString());
                      setHotel(item);
                      // Actualizar query param
                      const newUrl = `${window.location.pathname}?hotel_id=${item.id}`;
                      window.history.pushState({ path: newUrl }, "", newUrl);
                    }}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:border-[#00C8D4] hover:shadow-lg text-left transition-all group"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <img 
                        src={item.primary_image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=150&q=80"} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-[#00C8D4] transition-colors leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {item.city}, {item.state}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery.trim() && !searching ? (
              <div className="text-center py-8 text-gray-400">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                No se encontraron establecimientos nominados con ese nombre.
              </div>
            ) : null}

            {/* Lista Recomendada por Defecto */}
            <div className="border-t border-gray-100 pt-10">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center mb-6">
                Establecimientos Nominados Recientes
              </h3>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {prestigeHotels.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-40 bg-slate-100 relative">
                        <img 
                          src={item.primary_image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80"} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-[#0e011f] text-[#00C8D4] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#00C8D4]/30 shadow-md">
                          Pre-Seleccionado
                        </div>
                      </div>
                      <div className="p-5">
                        <h4 className="font-bold text-slate-800 mb-1 line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {item.city}, {item.state}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {item.description || "Información del establecimiento precargada para la auditoría de calidad de 2026."}
                        </p>
                      </div>
                    </div>
                    <div className="p-5 pt-0">
                      <button
                        onClick={() => {
                          setHotelId(item.id.toString());
                          setHotel(item);
                          const newUrl = `${window.location.pathname}?hotel_id=${item.id}`;
                          window.history.pushState({ path: newUrl }, "", newUrl);
                        }}
                        className="w-full py-2.5 bg-gray-50 hover:bg-[#00C8D4] hover:text-white rounded-xl text-xs font-bold text-[#00C8D4] border border-gray-100 hover:border-transparent transition-all text-center"
                      >
                        Validar Borrador
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          
          /* ── CASO 2: VISTA DETALLADA DEL HOTEL SELECCIONADO (FICHA DE AUDITORÍA) ── */
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Columna Izquierda/Central: Borrador y Proceso de Validación */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Tarjeta de Estado Validado o Pendiente */}
              {validated ? (
                <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100 text-center shadow-md animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-950 mb-2">
                    ¡Perfil Validado Correctamente!
                  </h2>
                  <p className="text-emerald-800 text-sm max-w-lg mx-auto mb-6">
                    El estatus del establecimiento ha sido actualizado a <strong className="font-semibold">pendiente de validación</strong>. Nuestro comité técnico revisará los datos definitivos y se comunicará vía WhatsApp para habilitar la publicación oficial y la insignia de excelencia.
                  </p>
                  <a
                    href={getWhatsAppLink(`Hola, acabo de validar mi hotel "${hotel.name}" (ID: ${hotel.id}) para el Índice de Excelencia 2026. Quisiera proceder con la revisión técnica.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba56] text-white font-bold rounded-2xl shadow-md transition-all text-sm"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.436.002 9.858-4.405 9.86-9.83.001-2.628-1.02-5.1-2.871-6.955C16.398 1.959 13.93 1.905 12.01 1.905c-5.438 0-9.86 4.405-9.864 9.83-.001 1.798.485 3.5 1.408 4.949l-1.02 3.735 3.834-1.009z" />
                    </svg>
                    Contactar al Comité por WhatsApp
                  </a>
                </div>
              ) : hotel.status === "pending_validation" ? (
                <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100 text-center shadow-md">
                  <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200">
                    <Shield className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-amber-950 mb-2">
                    Validación en Proceso
                  </h2>
                  <p className="text-amber-800 text-sm max-w-lg mx-auto mb-6">
                    Este establecimiento ya ha sido enviado para validación técnica. Su estatus actual es <strong className="font-semibold">pendiente de validación</strong>. Si necesita realizar modificaciones, contacte a soporte.
                  </p>
                  <a
                    href={getWhatsAppLink(`Hola, mi hotel "${hotel.name}" (ID: ${hotel.id}) está en estatus pendiente de validación. Me gustaría acelerar el proceso.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba56] text-white font-bold rounded-2xl shadow-md transition-all text-sm"
                  >
                    Solicitar Revisión Prioritaria
                  </a>
                </div>
              ) : null}

              {/* Ficha "Borrador de Auditoría" (Pre-visualización de Perfil) */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-[#0e011f] to-[#1a0533] text-white flex items-center justify-between border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#FF0096] text-white">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider font-sans">Borrador de Auditoría Interna</span>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-[#00C8D4] text-[#0e011f] px-2.5 py-1 rounded-full shadow-sm">
                    Pre-Cargado
                  </span>
                </div>

                {/* Previsualización del Hotel */}
                <div className="p-6 md:p-8 space-y-6">
                  
                  {/* Foto de Portada del Borrador */}
                  <div className="h-64 md:h-80 w-full rounded-2xl overflow-hidden bg-slate-100 relative shadow-inner">
                    <img 
                      src={hotel.primary_image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"} 
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Badge de Sello Calidad Virtual */}
                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-100 px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-1.5">
                      <Award className="w-5 h-5 text-[#FF0096]" />
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Excelencia 2026</span>
                    </div>
                  </div>

                  {/* Detalles de Texto */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-[#FF0096] uppercase tracking-wider bg-pink-50 px-2.5 py-1 rounded-md">
                          {hotel.category_name || "Hotel Prestigiado"}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-[#0f172a] mt-2 font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {hotel.name}
                        </h2>
                      </div>
                      
                      {/* Rating Mocked / Cargado */}
                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-extrabold text-amber-900">{hotel.rating_avg || "4.8"} / 5.0</span>
                      </div>
                    </div>

                    <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{hotel.address || `${hotel.city}, ${hotel.state}, Venezuela`}</span>
                    </p>

                    <div className="border-t border-b border-gray-100 py-5 my-4">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2.5">
                        Descripción de Calidad Registrada
                      </h4>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {hotel.description || `Este establecimiento ha sido auditado y pre-seleccionado bajo criterios de servicio excepcional, infraestructura premium y altos estándares de hospitalidad en la región de ${hotel.city}. La nominación le otorga el derecho de figurar de forma destacada en la plataforma líder de turismo nacional.`}
                      </p>
                    </div>

                    {/* Características / Servicios en Iconos Unicolor (Directriz AGENTS.md) */}
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">
                        Servicios Verificados del Establecimiento
                      </h4>
                      <div className="flex flex-wrap gap-4">
                        {[
                          { label: "Piscina Premium", icon: Star },
                          { label: "Wi-Fi de Alta Velocidad", icon: Shield },
                          { label: "Atención al Cliente VIP", icon: Award },
                          { label: "Ubicación Privilegiada", icon: MapPin }
                        ].map((serv, index) => {
                          const IconComp = serv.icon;
                          return (
                            <div key={index} className="flex items-center gap-2 bg-gray-50 pr-3.5 pl-1.5 py-1.5 rounded-xl border border-gray-100">
                              {/* Caja de fondo sólido de color con el vector SVG calado en blanco puro por dentro */}
                              <div className="p-1 rounded-lg bg-[#00C8D4] text-white flex items-center justify-center">
                                <IconComp className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-semibold text-slate-700">{serv.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Acciones del Borrador */}
                  {!validated && hotel.status !== "pending_validation" && (
                    <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-left">
                        <p className="text-xs text-gray-500">Publicación básica estándar</p>
                        <p className="text-lg font-black text-[#00C8D4] flex items-center gap-1.5">
                          Gratuito Permanente
                          <span className="text-xs font-normal text-slate-400 line-through">$120/año</span>
                        </p>
                      </div>

                      <button
                        onClick={handleValidate}
                        disabled={validating}
                        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-90 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group"
                      >
                        {validating ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Actualizando registro...
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Validar y Publicar Perfil (Espacio Gratuito)
                          </>
                        )}
                      </button>
                    </div>
                  )}

                </div>
              </div>

              {/* Botón para regresar al buscador en caso de querer cambiar de hotel */}
              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setHotel(null);
                    setHotelId(null);
                    const newUrl = window.location.pathname;
                    window.history.pushState({ path: newUrl }, "", newUrl);
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-[#FF0096] transition-colors"
                >
                  ← Seleccionar otro establecimiento nominado
                </button>
              </div>

            </div>

            {/* Columna Derecha: Información Institucional y FOMO */}
            <div className="space-y-6">
              
              {/* Tarjeta Destacada de Garantía (Directriz de AGENTS.md) */}
              <div className="bg-[#0e011f] rounded-3xl p-6 border border-purple-900/30 text-white shadow-xl relative overflow-hidden">
                {/* Capas decorativas de gradiente */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#9B00CC] blur-3xl opacity-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-[#00C8D4] blur-3xl opacity-10 pointer-events-none" />
                
                <div className="relative z-10 space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/30 text-[#00C8D4] flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-serif">Compromiso Oficial</h3>
                  <p className="text-xs text-white/70 leading-relaxed">
                    La validación de sus datos garantiza la presencia permanente de su establecimiento en el mapa nacional de excelencia turística de Venezuela.
                  </p>
                  <ul className="space-y-2.5 pt-2">
                    {[
                      "Acceso inmediato al portal de gestión",
                      "Visualización en el mapa de geolocalización",
                      "Indexación preferente en motores de búsqueda",
                      "Publicación sin costos de mantenimiento"
                    ].map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/90">
                        <Check className="w-4 h-4 text-[#00C8D4] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Preguntas Frecuentes Cortas */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Preguntas Frecuentes</h4>
                </div>
                
                <div className="space-y-4 divide-y divide-gray-100">
                  <div className="pt-3 first:pt-0">
                    <h5 className="text-xs font-bold text-slate-800 mb-1">¿Por qué es gratuito?</h5>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      El Índice de Excelencia 2026 busca cartografiar de forma neutral los establecimientos con mejor reputación. No hay cobros obligatorios por figurar en la base pública.
                    </p>
                  </div>
                  <div className="pt-3">
                    <h5 className="text-xs font-bold text-slate-800 mb-1">¿Qué es el estado de validación?</h5>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Al validar, usted confirma que representa la propiedad. Nuestro equipo técnico audita las fotos y la descripción final antes de publicarlo.
                    </p>
                  </div>
                  <div className="pt-3">
                    <h5 className="text-xs font-bold text-slate-800 mb-1">¿Cómo edito la información?</h5>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Una vez completado el proceso de validación, recibirá acceso a su panel propietario para actualizar fotos, tarifas y disponibilidad en tiempo real.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ── SECCIÓN DE CIERRE (BOTTOM CTA) (Directriz AGENTS.md) ──────────────── */}
        <div className="mt-16">
          <div 
            className="p-8 md:p-12 rounded-3xl text-center text-white relative overflow-hidden shadow-2xl"
            style={{ background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)" }}
          >
            {/* Elemento de fondo difuminado */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/25 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] bg-white/20 px-3.5 py-1.5 rounded-full inline-block">
                Soporte de Auditoría 24/7
              </span>
              
              <h2 className="text-2xl md:text-4xl font-normal leading-tight font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
                ¿Tiene dudas sobre el proceso o requiere ayuda con la carga de fotos?
              </h2>
              
              <p className="text-white/80 text-sm leading-relaxed max-w-lg mx-auto">
                Escriba directamente a la mesa técnica de validación de Hoteles de Venezuela. Uno de nuestros analistas le asistirá en tiempo real.
              </p>

              <div className="pt-4">
                <a
                  href={getWhatsAppLink(`Hola, necesito soporte con respecto a la validación de mi hotel para el Índice de Excelencia 2026.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-[#FF0096] font-bold rounded-2xl shadow-xl transition-all text-sm md:text-base group"
                >
                  {/* Icono de WhatsApp */}
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.436.002 9.858-4.405 9.86-9.83.001-2.628-1.02-5.1-2.871-6.955C16.398 1.959 13.93 1.905 12.01 1.905c-5.438 0-9.86 4.405-9.864 9.83-.001 1.798.485 3.5 1.408 4.949l-1.02 3.735 3.834-1.009z" />
                  </svg>
                  Atención por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
