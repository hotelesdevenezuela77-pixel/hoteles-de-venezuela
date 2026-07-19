import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { supabase } from "../lib/supabase";
import { 
  Award, Building2, Check, MapPin, Search, Sparkles, 
  Star, Shield, Loader2, HelpCircle, AlertTriangle, Zap, 
  CheckCircle2, Compass, Phone, Users, Landmark, Globe, CheckCircle
} from "lucide-react";
import { TrackedWhatsAppButton } from "../components/layout/TrackedWhatsAppButton";
import { OFFICIAL_WHATSAPP_NUMBER } from "@/config/whatsapp";

// Paleta de colores oficial
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
  whatsapp?: string | null;
  phone?: string | null;
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
          .select("id, name, slug, description, city, state, status, category_name, rating_avg, primary_image, address, whatsapp, phone")
          .eq("status", "approved")
          .limit(6);
          
        if (!popErr && popular) {
          setPrestigeHotels(popular as Establishment[]);
        }

        if (hotelId) {
          const { data, error } = await supabase
            .from("establishments")
            .select("id, name, slug, description, city, state, status, category_name, rating_avg, primary_image, address, whatsapp, phone")
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
          .select("id, name, slug, description, city, state, status, category_name, rating_avg, primary_image, address, whatsapp, phone")
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

  // Validar y publicar perfil (actualiza status a pending_validation)
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
      
      console.log(`Hotel ${hotel.name} validado exitosamente.`);
    } catch (err) {
      console.error("Error al validar el establecimiento:", err);
      alert("Hubo un error al validar su establecimiento. Por favor intente de nuevo.");
    } finally {
      setValidating(false);
    }
  };

  const WHATSAPP_NUMBER = OFFICIAL_WHATSAPP_NUMBER;
  const getWhatsAppLink = (text: string) => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans pb-16">
      
      {/* ── BARRA DE ESTATUS DE COMITÉ (FOMO) ────────────────────────────────── */}
      <div 
        className="w-full text-white text-center py-2.5 px-4 text-xs md:text-sm font-semibold shadow-md flex items-center justify-center gap-2 animate-pulse"
        style={{ background: "linear-gradient(90deg, #FF0096, #9B00CC)" }}
      >
        <Sparkles className="w-4 h-4 text-[#00C8D4] animate-spin" />
        <span>
          {hotel 
            ? `Solo quedan ${cupos} cupos de distinción digital disponibles en ${hotel.city || "su zona"}`
            : "Sincronización abierta: Cupos de distinción digital limitados por región geográfica"}
        </span>
      </div>

      {/* ── HERO BANNER PORTADA (SPLIT MODERN HERO CON FONDO DE PLAYA) ─────────── */}
      <div className="w-full min-h-[500px] lg:min-h-[580px] relative overflow-hidden bg-[#0e011f] flex items-center pt-10 pb-20 lg:py-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/beach_parallax.png')" }}>
        
        {/* Capa de superposición para contraste y tinte de marca */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0e011f]/95 via-[#0e011f]/85 to-[#1a0533]/95 z-0" />
        
        {/* Luces y degradados de fondo neon */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#9B00CC] blur-[120px] opacity-25 pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00C8D4] blur-[120px] opacity-15 pointer-events-none z-0" />
        
        {/* Contenedor principal con grid */}
        <div className="max-w-6xl mx-auto px-6 w-full grid lg:grid-cols-12 gap-10 items-center relative z-10">
          
          {/* Lado izquierdo: Textos y Acciones */}
          <div className="lg:col-span-7 text-left space-y-6">
            <span className="text-[#00C8D4] text-xs md:text-sm font-black tracking-[0.3em] uppercase block">
              SINCRONIZACIÓN DE PRESTIGIO 2026
            </span>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-normal text-white leading-tight tracking-wide font-serif" style={{ fontFamily: "'Playfair Display', 'Cinzel', serif" }}>
              {hotel 
                ? <>Bienvenido al <span className="text-[#FF0096] font-bold">Comité de Prestigio</span>, {hotel.name}</>
                : <>Índice de <span className="text-[#FF0096]">Prestigio</span> y <span className="text-[#00C8D4]">Distinción</span> 2026</>}
            </h1>
            
            <p className="text-slate-300 text-sm md:text-base max-w-xl font-sans leading-relaxed">
              {hotel 
                ? "Reconocemos y honramos el prestigio de los establecimientos que ya lideran con los más altos estándares físicos del país. No somos una entidad de certificación de calidad; somos su complemento de captación digital moderna."
                : "Validamos la excelencia operativa de los hoteles y posadas de alta gama en Venezuela. Integre su distinción física con la infraestructura de visibilidad y conversión de nuestro ecosistema."}
            </p>

            {/* CTAs rápidos en el Hero */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {hotel ? (
                <button
                  onClick={() => {
                    const el = document.getElementById("ficha-distincion");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-3.5 bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white font-bold rounded-2xl shadow-lg hover:opacity-90 transition-all text-sm cursor-pointer"
                >
                  Ver Ficha de Distinción
                </button>
              ) : (
                <button
                  onClick={() => {
                    const el = document.getElementById("buscador-prestigio");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-3.5 bg-gradient-to-r from-[#00C8D4] to-[#009ba6] text-white font-bold rounded-2xl shadow-lg hover:opacity-90 transition-all text-sm cursor-pointer"
                >
                  Buscar mi Hotel Nominado
                </button>
              )}
              <a
                href={getWhatsAppLink("Hola, deseo más información sobre el Índice de Prestigio 2026.")}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 transition-all text-sm flex items-center gap-2"
              >
                Hablar con Asesor
              </a>
            </div>
          </div>

          {/* Lado derecho: Ficha Oficial Premium con efectos y borde animado */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative z-10 w-full">
            <div className="w-full max-w-[370px] priority-glow-card group shadow-2xl hover:shadow-[#FF0096]/20 transition-all duration-300">
              <div className="priority-glow-card-inner bg-gradient-to-br from-[#0e011f] to-[#1a0533] text-white flex flex-col h-full justify-between">
                <div>
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden bg-slate-800">
                    <img 
                      src={hotel ? (hotel.primary_image || "/images/landing.png") : "/images/beach_social.png"} 
                      alt={hotel ? hotel.name : "Hoteles de Venezuela 5 Estrellas"}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-3.5 left-3.5 flex flex-col gap-2">
                      <span className="px-3.5 py-1.5 bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-md flex items-center">
                        {hotel ? "HOTELES" : "RECOMENDADO"}
                      </span>
                    </div>

                    {/* Sello HDV */}
                    <img 
                      src="/images/sello-hdv.png" 
                      alt="Sello de Calidad Hoteles de Venezuela" 
                      className="absolute bottom-2 right-2 w-12 h-12 object-contain z-10 drop-shadow-md hover:scale-110 transition-transform duration-300 pointer-events-none" 
                    />
                  </div>

                  {/* Content Section */}
                  <div className="p-5 flex-1 flex flex-col text-left">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <h3 className="font-black text-base text-white group-hover:text-brand-turquesa transition-colors line-clamp-1 leading-tight">
                          {hotel ? hotel.name : "Hoteles de Venezuela"}
                        </h3>
                        <div className="flex items-center gap-1 text-xs mt-1">
                          <MapPin className="w-3.5 h-3.5 text-brand-turquesa shrink-0" />
                          <span className="truncate text-gray-300">
                            {hotel ? (hotel.address || `${hotel.city}, ${hotel.state}`) : "Directorio de Prestigio Nacional"}
                          </span>
                        </div>
                      </div>
                      <div className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shrink-0 self-center border bg-amber-500/10 border-amber-500/20 text-amber-300">
                        {hotel ? "SELLO HDV" : "5 ESTRELLAS"}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg border bg-amber-500/10 border-amber-500/20 text-amber-300">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-extrabold text-xs">{hotel ? (hotel.rating_avg || "4.7") : "5.0"}</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">
                        {hotel ? "(142 reseñas)" : "(2,500+ opiniones)"}
                      </span>
                    </div>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(hotel ? [
                        { label: "Wifi Gratis" },
                        { label: "Piscina" },
                        { label: "Estacionamiento" }
                      ] : [
                        { label: "Reserva Directa" },
                        { label: "Cero Comisiones" },
                        { label: "Soporte VIP" }
                      ]).map((serv, i) => (
                        <span key={i} className="flex items-center gap-1 px-2.5 py-0.5 text-[9px] rounded-full font-medium bg-white/5 text-white/70 border border-white/10">
                          <Sparkles className="w-3 h-3 text-brand-magenta" />
                          <span>{serv.label}</span>
                        </span>
                      ))}
                      {hotel ? (
                        <span className="px-2 py-0.5 text-[9px] rounded-full font-bold bg-white/5 text-white/50 border border-white/10">
                          +13
                        </span>
                      ) : null}
                    </div>

                    {/* Description */}
                    <p className="text-[11px] leading-relaxed line-clamp-2 text-gray-400">
                      {hotel ? hotel.description : "La plataforma de turismo líder de Venezuela. Conectamos directamente a los viajeros con los mejores hoteles, posadas y resorts del país sin intermediarios ni comisiones sorpresa."}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-5 pb-5">
                  <div className="flex gap-2.5 pt-4 border-t border-white/10 mt-4">
                    <div className="flex-1">
                      <TrackedWhatsAppButton
                        whatsappNumber={hotel ? (hotel.whatsapp || hotel.phone || OFFICIAL_WHATSAPP_NUMBER) : OFFICIAL_WHATSAPP_NUMBER}
                        establishmentId={hotel ? hotel.id : 9999}
                        establishmentName={hotel ? hotel.name : "Hoteles de Venezuela"}
                        isPriority={true}
                      />
                    </div>
                    
                    <button 
                      onClick={() => {
                        const el = document.getElementById("ficha-distincion");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="flex-1 w-full btn-cyan-gradient text-white text-xs font-extrabold py-2.5 px-4 rounded-xl flex items-center justify-center shadow-md shadow-brand-turquesa/10 hover:scale-102 transition-all cursor-pointer"
                    >
                      Ver Ficha
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Degradado inferior blanco para fundirse con el fondo de la página */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/40 to-transparent pointer-events-none" />
      </div>

      {/* ── SECCIÓN 1: FICHA DE DISTINCIÓN DIGITAL (EL BORRADOR DEL HOTEL) ── */}
      <div className="w-full bg-white py-12 relative z-20">
        <div id="ficha-distincion" className="max-w-5xl mx-auto px-6 -mt-24 relative z-20 mb-20">
        
        {loading ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="w-12 h-12 animate-spin text-[#FF0096] mb-4" />
            <p className="text-gray-500 font-medium">Buscando registro en la base de datos de prestigio...</p>
          </div>
        ) : !hotel ? (
          
          /* BUSCADOR DE HOTELES (SIN HOTEL_ID O INVÁLIDO) */
          <div id="buscador-prestigio" className="priority-glow-card group shadow-2xl transition-all duration-300 w-full animate-fade-in" style={{ padding: "3px", background: "white" }}>
            <div className="priority-glow-card-inner bg-white p-8 md:p-12 border border-gray-100 flex flex-col justify-between">
            <div className="max-w-2xl mx-auto text-center mb-8">
              <div className="inline-flex p-3 rounded-full bg-cyan-50 text-[#00C8D4] mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-3">
                Busque su Establecimiento Nominado
              </h2>
              <p className="text-gray-500 text-sm md:text-base">
                Si su establecimiento pertenece a asociaciones o grupos exclusivos de alta hospitalidad, su ficha pre-cargada ya está lista. Escriba el nombre a continuación para visualizarla y sincronizar su canal de reservas.
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
                        src={item.primary_image || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=150&q=80"} 
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
                No se encontraron establecimientos pre-cargados con ese nombre.
              </div>
            ) : null}

            {/* Lista Recomendada por Defecto */}
            <div className="border-t border-gray-100 pt-10">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center mb-6">
                Establecimientos Recientes Nominados
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
                          src={item.primary_image || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80"} 
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
                          {item.description || "Datos pre-cargados para la validación y sincronización de conversión digital en nuestro ecosistema de reservas."}
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
                        Revisar Ficha
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        ) : (
          
          /* DETALLE DEL HOTEL CON SU FICHA Y TARJETA DE ESTADÍSTICAS B2B */
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Lado izquierdo: Ficha del Borrador */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Tarjeta de estado */}
              {validated ? (
                <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100 text-center shadow-md animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-950 mb-2 font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
                    ¡Sincronización Recibida!
                  </h2>
                  <p className="text-emerald-800 text-sm max-w-lg mx-auto mb-6">
                    Su estado ha sido actualizado a <strong className="font-bold">pendiente de validación</strong>. El equipo técnico de Hoteles de Venezuela activará su redireccionamiento web y su enlace de WhatsApp directo.
                  </p>
                  <a
                    href={getWhatsAppLink(`Hola, acabo de sincronizar mi hotel "${hotel.name}" (ID: ${hotel.id}) para el Índice de Prestigio 2026. Quisiera configurar los enlaces de reserva directos.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba56] text-white font-bold rounded-2xl shadow-md transition-all text-sm"
                  >
                    Contactar Soporte Técnico por WhatsApp
                  </a>
                </div>
              ) : hotel.status === "pending_validation" ? (
                <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100 text-center shadow-md">
                  <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200">
                    <Shield className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-amber-950 mb-2 font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Sincronización en Progreso
                  </h2>
                  <p className="text-amber-800 text-sm max-w-lg mx-auto mb-6">
                    Esta propiedad se encuentra actualmente en estatus <strong className="font-bold">pendiente de validación</strong>. El equipo está auditando las imágenes y el direccionamiento de reservas.
                  </p>
                  <a
                    href={getWhatsAppLink(`Hola, solicito activar prioritariamente la Ficha de Distinción de mi hotel "${hotel.name}" (ID: ${hotel.id}).`)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba56] text-white font-bold rounded-2xl shadow-md transition-all text-sm"
                  >
                    Acelerar Activación
                  </a>
                </div>
              ) : null}

              {/* Ficha Principal de Borrador */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-[#0e011f] to-[#1a0533] text-white flex items-center justify-between border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#FF0096] text-white">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider font-sans">Borrador de Ficha de Distinción</span>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-[#00C8D4] text-[#0e011f] px-2.5 py-1 rounded-full shadow-sm">
                    Pre-Cargado
                  </span>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  
                  {/* Imagen */}
                  <div className="h-64 md:h-80 w-full rounded-2xl overflow-hidden bg-slate-100 relative shadow-inner">
                    <img 
                      src={hotel.primary_image || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"} 
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                    
                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-100 px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-1.5">
                      <Award className="w-5 h-5 text-[#FF0096]" />
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Distinción 2026</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-[#FF0096] uppercase tracking-wider bg-pink-50 px-2.5 py-1 rounded-md">
                          {hotel.category_name || "Establecimiento Nominado"}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-[#0f172a] mt-2 font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {hotel.name}
                        </h2>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-extrabold text-amber-900">{hotel.rating_avg || "4.9"} / 5.0</span>
                      </div>
                    </div>

                    <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{hotel.address || `${hotel.city}, ${hotel.state}, Venezuela`}</span>
                    </p>

                    <div className="border-t border-b border-gray-100 py-5 my-4">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2.5">
                        Descripción Auditada
                      </h4>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {hotel.description || `Establecimiento de alta hospitalidad auditado bajo criterios de servicio personalizado y excelencia operativa en ${hotel.city}. La sincronización de esta ficha habilitará de forma gratuita los canales de reserva directa.`}
                      </p>
                    </div>

                    {/* Características / Servicios en Iconos Unicolor */}
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">
                        Servicios y Atributos de Prestigio
                      </h4>
                      <div className="flex flex-wrap gap-4">
                        {[
                          { label: "Servicio de Alta Hospitalidad", icon: Star },
                          { label: "Seguridad y Privacidad", icon: Shield },
                          { label: "Experiencia Gourmet", icon: Award },
                          { label: "Ubicación Exclusiva", icon: MapPin }
                        ].map((serv, index) => {
                          const IconComp = serv.icon;
                          return (
                            <div key={index} className="flex items-center gap-2 bg-gray-50 pr-3.5 pl-1.5 py-1.5 rounded-xl border border-gray-100">
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

                  {/* Acciones */}
                  {!validated && hotel.status !== "pending_validation" && (
                    <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-left">
                        <p className="text-xs text-gray-500">Activación del espacio en el ecosistema</p>
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
                            Sincronizando...
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5" />
                            Sincronizar Presencia Digital (Canal Gratuito)
                          </>
                        )}
                      </button>
                    </div>
                  )}

                </div>
              </div>

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

            {/* Lado derecho: Tarjeta de datos/estadísticas (Como la tarjeta turquesa de la imagen) */}
            <div className="space-y-6">
              
              {/* Tarjeta de Métricas e Indicadores de Visibilidad */}
              <div className="rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden" 
                style={{ background: "linear-gradient(135deg, #00C8D4 0%, #009ba6 100%)" }}>
                
                {/* Decoración de fondo */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-2 text-white">
                    <Zap className="w-5 h-5 text-white fill-current" />
                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">Estadísticas 2026</span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-white leading-snug">Estatus del Ecosistema</h3>
                    <p className="text-white/80 text-xs mt-1">Estimaciones de conversión y visibilidad proyectadas en la plataforma.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
                    <div>
                      <span className="text-[10px] text-white/70 uppercase font-bold">Alcance Estimado</span>
                      <p className="text-2xl font-extrabold mt-1 font-serif">+25k</p>
                      <span className="text-[9px] text-white/60">búsquedas/mes</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/70 uppercase font-bold">Conversión Directa</span>
                      <p className="text-2xl font-extrabold mt-1 font-serif">4.8%</p>
                      <span className="text-[9px] text-white/60">leads a WhatsApp</span>
                    </div>
                  </div>

                  <div className="bg-white/15 rounded-2xl p-3 border border-white/10 text-center">
                    <span className="text-[10px] font-bold text-white/90">Sincronización Gratuita Permanente</span>
                  </div>
                </div>
              </div>

              {/* Caja de Compromiso */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#FF0096]" />
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">Garantía Tecnológica</h4>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  No calificamos la hospitalidad de su hotel: ese prestigio ya está consolidado. Nos encargamos de que la tecnología de reservas esté a la altura de su servicio físico.
                </p>
              </div>

            </div>

          </div>
        )}

        </div>
      </div>

      {/* ── SECCIÓN 2: ¿PARA QUIÉN ES ESTE ECOSISTEMA? ── */}
      <section className="py-20 bg-white border-t border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-normal text-slate-900 mb-4 font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
              ¿Para Quién es Este Ecosistema?
            </h2>
            <p className="text-gray-500 text-sm md:text-base">
              Diseñado exclusivamente para propiedades de alta hospitalidad en Venezuela que buscan maximizar sus canales de reserva directa.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Hoteles Boutique & de Colección",
                desc: "Propiedades exclusivas que ofrecen una experiencia íntima, diseño de autor y atención altamente personalizada.",
                icon: Landmark,
                features: ["Ficha de conversión avanzada", "Galería de imágenes premium", "Botón directo de reserva"],
                color: "#FF0096"
              },
              {
                title: "Posadas & Lodges de Alta Gama",
                desc: "Establecimientos en destinos naturales exclusivos (Los Roques, Canaima, Mérida) que requieren un canal de venta directo y sin comisiones.",
                icon: Compass,
                features: ["Ubicación precisa en el mapa", "Integración directa de WhatsApp", "Redireccionamiento web propio"],
                color: "#00C8D4"
              },
              {
                title: "Resorts & Complejos de Lujo",
                desc: "Establecimientos de alta infraestructura que necesitan complementar sus canales tradicionales de captación comercial.",
                icon: Building2,
                features: ["Sincronización multi-canal", "Visibilidad prioritaria en Google", "Acceso al panel de analíticas"],
                color: "#9B00CC"
              }
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-all">
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl text-white inline-block shadow-sm" style={{ backgroundColor: card.color }}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 font-serif">{card.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
                  </div>
                  
                  <ul className="space-y-2 border-t border-gray-100 pt-5 mt-6">
                    {card.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                        <Check className="w-4 h-4 text-[#FF0096] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 3: BENEFICIOS DE INTEGRACIÓN DIGITAL (PARALLAX BEACH BACKGROUND) ── */}
      <section className="py-24 relative overflow-hidden bg-fixed bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/beach_parallax.png')" }}>
        
        {/* Capa de superposición para contraste y tinte de marca */}
        <div className="absolute inset-0 bg-[#0e011f]/80 z-0" />
        
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-normal text-white mb-4 font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
              Beneficios de Sincronizar su Presencia
            </h2>
            <p className="text-slate-200 text-sm">
              La sinergia perfecta entre sus estándares de hospitalidad y nuestra infraestructura de marketing digital.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Posicionamiento en Google",
                desc: "Visibilidad garantizada en los términos de búsqueda más cotizados de hospitalidad en el país.",
                icon: Globe
              },
              {
                title: "Carga Edge en Cloudflare",
                desc: "Fichas técnicas alojadas en infraestructura perimetral de carga instantánea, reduciendo rebotes.",
                icon: Zap
              },
              {
                title: "Reservas sin Comisión",
                desc: "A diferencia de las OTAs convencionales, no cobramos porcentaje alguno sobre sus ventas directas.",
                icon: Award
              },
              {
                title: "Redireccionamiento Directo",
                desc: "Enlace su WhatsApp comercial y página web directamente para recibir leads calificados sin intermediarios.",
                icon: Phone
              },
              {
                title: "Geolocalización Turística",
                desc: "Aparezca en el mapa interactivo de destinos exclusivos de Venezuela con un pin preferente.",
                icon: MapPin
              },
              {
                title: "Panel Propietario Avanzado",
                desc: "Autonomía completa para actualizar fotos, tarifas, temporadas y servicios en tiempo real.",
                icon: Users
              }
            ].map((ben, i) => {
              const IconComp = ben.icon;
              return (
                <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100/80 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-[#00C8D4] text-white shrink-0 shadow-sm">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm">{ben.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{ben.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 4: ¿CÓMO FUNCIONA? (FONDO OSCURO) ── */}
      <section className="py-20 text-white relative overflow-hidden bg-[#0e011f]" style={{ background: "linear-gradient(135deg, #0e011f 0%, #1a0533 100%)" }}>
        
        {/* Luces difuminadas de fondo */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#9B00CC] blur-3xl opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#00C8D4] blur-3xl opacity-15 pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-normal text-white mb-4 font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
              ¿Cómo Funciona el Proceso?
            </h2>
            <p className="text-white/60 text-sm">
              Sincronizar la excelencia de su establecimiento en el ecosistema digital toma solo unos minutos.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                n: "01",
                title: "Ubique su Hotel",
                desc: "Busque su propiedad en la base de datos de nominación utilizando nuestro motor de búsqueda."
              },
              {
                n: "02",
                title: "Valide el Borrador",
                desc: "Verifique que las fotos, la descripción de alta gama y la localización reflejen su calidad."
              },
              {
                n: "03",
                title: "Enlace Canales",
                desc: "Conecte sus líneas comerciales de WhatsApp o enlaces web de reservas directas."
              },
              {
                n: "04",
                title: "Activación en Vivo",
                desc: "Su ficha se publica con insignia de distinción digital activa para reservas directas 2026."
              }
            ].map((step, i) => (
              <div key={i} className="space-y-4 relative group">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-extrabold font-serif text-[#00C8D4]" style={{ fontFamily: "'Playfair Display', serif" }}>{step.n}</span>
                  <div className="h-[2px] bg-gradient-to-r from-[#00C8D4] to-transparent flex-1" />
                </div>
                <h4 className="font-bold text-white text-base font-serif">{step.title}</h4>
                <p className="text-xs text-white/60 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 5: MODELOS DE PRESENCIA Y CAPTACIÓN ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-normal text-slate-900 mb-4 font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
              Modelos de Presencia y Captación
            </h2>
            <p className="text-gray-500 text-sm">
              Elija el nivel de integración tecnológica que requiere su propiedad dentro del ecosistema 2026.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            
            {/* Tarjeta 1: Sincronización Básica */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Espacio Básico</span>
                  <h3 className="text-xl font-bold text-slate-800 mt-1">Sincronización Básica</h3>
                </div>
                
                <div className="pt-2">
                  <p className="text-2xl font-black text-slate-900 font-serif">Gratuito</p>
                  <span className="text-xs text-slate-400">permanente sin cuota anual</span>
                </div>
                
                <p className="text-xs text-gray-500 leading-relaxed">
                  Ficha estándar en el buscador y el mapa interactivo nacional con datos y enlace de contacto básico.
                </p>

                <ul className="space-y-2.5 pt-4 border-t border-gray-100">
                  {["Visualización en el mapa", "Foto de perfil", "Enlace básico de reservas"].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <Check className="w-4 h-4 text-[#FF0096]" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button 
                  onClick={() => hotelId && setHotelId(hotelId)}
                  className="w-full py-3 bg-gray-50 hover:bg-[#00C8D4] hover:text-white rounded-2xl text-xs font-bold text-[#00C8D4] border border-gray-100 hover:border-transparent transition-all"
                >
                  Habilitar Ficha
                </button>
              </div>
            </div>

            {/* Tarjeta 2: Ficha de Distinción (Recomendado/Turquesa) */}
            <div className="rounded-3xl p-6 text-white flex flex-col justify-between hover:shadow-xl transition-all relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #00C8D4 0%, #009ba6 100%)" }}>
              
              <div className="absolute top-0 right-0 bg-[#FF0096] text-white text-[9px] font-black uppercase tracking-wider px-3.5 py-1 rounded-bl-2xl">
                Recomendado
              </div>

              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Destacado B2B</span>
                  <h3 className="text-xl font-bold text-white mt-1">Ficha de Distinción</h3>
                </div>
                
                <div className="pt-2">
                  <p className="text-2xl font-black text-white font-serif">$30 <span className="text-xs font-normal text-white/75">/ mes</span></p>
                  <span className="text-xs text-white/80">facturado anualmente</span>
                </div>
                
                <p className="text-xs text-white/90 leading-relaxed">
                  Posicionamiento preferente en destinos turísticos, galería ilimitada y redireccionamiento directo y prioritario a WhatsApp comercial.
                </p>

                <ul className="space-y-2.5 pt-4 border-t border-white/20">
                  {["Todo lo del plan básico", "Posición prioritaria en su zona", "Insignia de Prestigio Digital", "Analíticas de clics y leads"].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-white">
                      <Check className="w-4 h-4 text-white" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <a 
                  href={getWhatsAppLink("Hola, me interesa activar el plan 'Ficha de Distinción' para mi hotel.")}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full py-3 bg-white text-[#00C8D4] hover:bg-gray-50 rounded-2xl text-xs font-bold text-center shadow-md transition-all"
                >
                  Contactar Asesor
                </a>
              </div>
            </div>

            {/* Tarjeta 3: Ecosistema Corporativo (Fondo oscuro) */}
            <div className="bg-[#0e011f] rounded-3xl border border-purple-950 p-6 flex flex-col justify-between text-white hover:shadow-md transition-all relative">
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FF0096]">Socio Tecnológico</span>
                  <h3 className="text-xl font-bold text-white mt-1">Ecosistema SaaS</h3>
                </div>
                
                <div className="pt-2">
                  <p className="text-2xl font-black text-white font-serif">$80 <span className="text-xs font-normal text-white/75">/ mes</span></p>
                  <span className="text-xs text-white/60">con aplicación web incluida</span>
                </div>
                
                <p className="text-xs text-white/70 leading-relaxed">
                  Aplicación web y motor de reservas independiente para el hotel, integrado en el portal nacional de Hoteles de Venezuela.
                </p>

                <ul className="space-y-2.5 pt-4 border-t border-purple-900/50">
                  {["Todo lo anterior incluido", "App web personalizada propia", "Gestión de habitaciones y tarifas", "Soporte técnico dedicado 24/7"].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-white/90">
                      <Check className="w-4 h-4 text-[#FF0096]" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <a 
                  href={getWhatsAppLink("Hola, deseo solicitar una demo de la solución corporativa 'Ecosistema SaaS' para mi hotel.")}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full py-3 bg-[#FF0096] hover:bg-[#ff0096]/95 rounded-2xl text-xs font-bold text-center transition-all"
                >
                  Solicitar Demostración
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECCIÓN DE CIERRE (BOTTOM CTA) (Directriz AGENTS.md) ──────────────── */}
      <div className="max-w-5xl mx-auto px-6 mt-12">
        <div 
          className="p-8 md:p-12 rounded-3xl text-center text-white relative overflow-hidden shadow-2xl"
          style={{ background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)" }}
        >
          {/* Elemento de fondo difuminado */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/25 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] bg-white/20 px-3.5 py-1.5 rounded-full inline-block">
              Soporte de Integración 24/7
            </span>
            
            <h2 className="text-2xl md:text-4xl font-normal leading-tight font-serif text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              ¿Listo para Sincronizar su Presencia?
            </h2>
            
            <p className="text-white/80 text-sm leading-relaxed max-w-lg mx-auto">
              Consulte con un analista de integración para activar sus enlaces de reserva directo o resolver cualquier duda técnica de sincronización en tiempo real.
            </p>

            <div className="pt-4">
              <a
                href={getWhatsAppLink(`Hola, deseo contactar con un analista técnico para sincronizar y optimizar la Ficha de Distinción de mi hotel.`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-[#FF0096] font-bold rounded-2xl shadow-xl transition-all text-sm md:text-base group"
              >
                {/* Icono de WhatsApp */}
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.436.002 9.858-4.405 9.86-9.83.001-2.628-1.02-5.1-2.871-6.955C16.398 1.959 13.93 1.905 12.01 1.905c-5.438 0-9.86 4.405-9.864 9.83-.001 1.798.485 3.5 1.408 4.949l-1.02 3.735 3.834-1.009z" />
                </svg>
                Sincronizar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
