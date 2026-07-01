import { useEffect, useState } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { ESTABLISHMENTS_MOCK } from "../lib/establishmentsMock";
import { 
  ArrowLeft, Star, MapPin, Sparkles, Check, X, 
  Trash2, Phone, Globe, ShieldCheck, DollarSign 
} from "lucide-react";

interface ComparedEstablishment {
  id: number;
  slug: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  whatsapp: string;
  website: string;
  category_name: string;
  destination_name: string;
  primary_image?: string;
  rating_avg: number;
  review_count: number;
  price_level: string;
  is_featured: boolean;
  services: string[];
  membership_tier: string;
  has_hdv_seal?: boolean;
}

export function Comparar() {
  const [comparedHotels, setComparedHotels] = useState<ComparedEstablishment[]>(() => {
    const stored = localStorage.getItem("hdv_compare_list");
    if (!stored) return [];
    try {
      const compareIds: number[] = JSON.parse(stored);
      return ESTABLISHMENTS_MOCK.filter(e => compareIds.includes(e.id)).map(m => {
        let servicesArray: string[] = [];
        try {
          const parsed = JSON.parse(m.services);
          servicesArray = Array.isArray(parsed) ? parsed : [];
        } catch {
          servicesArray = m.services ? m.services.split(",").map((s: string) => s.trim().toLowerCase()) : [];
        }
        return {
          id: m.id,
          slug: m.slug,
          name: m.name,
          description: m.description || "",
          address: m.address || "",
          phone: m.phone || "",
          whatsapp: m.whatsapp || "",
          website: m.website || "",
          category_name: m.category_name || "Establecimiento",
          destination_name: m.destination_name || "Venezuela",
          primary_image: m.primary_image,
          rating_avg: m.rating_avg || 0,
          review_count: m.review_count || 0,
          price_level: m.price_level || "",
          is_featured: m.is_featured || false,
          services: servicesArray,
          membership_tier: m.membership_tier || "basic",
          has_hdv_seal: m.has_hdv_seal || false
        };
      }) as ComparedEstablishment[];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  const loadComparedHotels = async () => {
    try {
      const stored = localStorage.getItem("hdv_compare_list");
      if (!stored) {
        setComparedHotels([]);
        return;
      }

      const compareIds: number[] = JSON.parse(stored);
      if (compareIds.length === 0) {
        setComparedHotels([]);
        return;
      }

      // Query Supabase in background
      const { data, error } = await supabase
        .from("establishments")
        .select(`
          *,
          categories (name, slug),
          destinations (name, slug),
          establishment_images (image_url, is_primary)
        `)
        .in("id", compareIds);

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: ComparedEstablishment[] = data.map((item: any) => {
          const primaryImg = item.establishment_images?.find((img: any) => img.is_primary)?.image_url 
            || item.establishment_images?.[0]?.image_url 
            || "";

          let servicesArray: string[] = [];
          try {
            const parsed = JSON.parse(item.services);
            servicesArray = Array.isArray(parsed) ? parsed : [];
          } catch {
            servicesArray = item.services ? item.services.split(",").map((s: string) => s.trim().toLowerCase()) : [];
          }

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
            destination_name: item.destinations?.name || "",
            primary_image: primaryImg,
            rating_avg: item.rating_avg || 0,
            review_count: item.review_count || 0,
            price_level: item.price_level || "",
            is_featured: item.is_featured || false,
            services: servicesArray,
            membership_tier: item.membership_tier || "basic",
            has_hdv_seal: item.has_hdv_seal || false
          };
        });
        setComparedHotels(mapped);
      }
    } catch (e) {
      console.warn("Error loading compared hotels from Supabase in background:", e);
    }
  };

  useEffect(() => {
    loadComparedHotels();
  }, []);

  const handleRemove = (id: number) => {
    const stored = localStorage.getItem("hdv_compare_list");
    if (stored) {
      const compareIds: number[] = JSON.parse(stored);
      const filtered = compareIds.filter(item => item !== id);
      localStorage.setItem("hdv_compare_list", JSON.stringify(filtered));
      setComparedHotels(prev => prev.filter(hotel => hotel.id !== id));
      // Dispatch custom event to update navbar/floating bar
      window.dispatchEvent(new Event("hdv_compare_updated"));
    }
  };

  const allServices = Array.from(
    new Set(comparedHotels.flatMap(hotel => hotel.services))
  ).filter(Boolean);

  const priceLabels: Record<string, string> = {
    "$": "Económico ($)",
    "$$": "Moderado ($$)",
    "$$$": "Lujo ($$$)",
    "$$$$": "Ultra Lujo ($$$$)"
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/20 pt-24 pb-12 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-magenta"></div>
        <p className="text-gray-400 text-xs font-bold mt-4">Analizando establecimientos seleccionados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden py-12 bg-gradient-to-br from-brand-purple-dark via-brand-purple-deep to-black text-white text-center">
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-brand-magenta/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-brand-turquesa/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-4 justify-center">
            <Link href="/establecimientos" className="hover:text-brand-magenta transition-colors">Establecimientos</Link>
            <span>/</span>
            <span className="text-white">Comparador</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
            Comparador de <span className="bg-gradient-to-r from-brand-magenta to-brand-turquesa bg-clip-text text-transparent">Hospedajes</span>
          </h1>
          <p className="text-gray-300 text-xs max-w-xl mx-auto">
            Analiza las características, comodidades, valoraciones y datos de contacto de tus opciones preferidas antes de reservar.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 mt-10">
        
        {comparedHotels.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <Trash2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-1">No tienes hoteles para comparar</h3>
            <p className="text-gray-400 text-xs max-w-sm mx-auto leading-relaxed mb-6">
              Selecciona hasta 3 establecimientos en la guía de exploración para compararlos lado a lado.
            </p>
            <Link href="/establecimientos">
              <button className="btn-magenta-gradient px-8 py-3 rounded-full text-xs font-bold hover:scale-102 transition-all cursor-pointer shadow-md">
                Ir al Buscador
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Header / Back Button */}
            <div className="flex justify-between items-center">
              <Link href="/establecimientos">
                <button className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver al Explorador</span>
                </button>
              </Link>
              <span className="text-xs font-bold text-gray-400">{comparedHotels.length} de 3 seleccionados</span>
            </div>

            {/* Comparison Grid Table */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      {/* Column 0: Label */}
                      <th className="p-6 w-1/4 min-w-[200px] text-xs font-black text-gray-400 uppercase tracking-wider">Características</th>
                      
                      {/* Columns 1-3: Hotels */}
                      {comparedHotels.map(hotel => (
                        <th key={hotel.id} className="p-6 w-1/4 border-l border-gray-100 relative group">
                          
                          {/* Close button */}
                          <button
                            onClick={() => handleRemove(hotel.id)}
                            className="absolute top-4 right-4 w-7 h-7 bg-red-50 hover:bg-red-100 text-red-500 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                            title="Quitar de la lista"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          <div className="space-y-3">
                            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-100">
                              <img
                                src={hotel.primary_image || "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400"}
                                alt={hotel.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-extrabold text-brand-magenta uppercase tracking-wider">
                                {hotel.category_name}
                              </span>
                              <h3 className="font-black text-gray-800 text-sm leading-snug line-clamp-2">
                                {hotel.name}
                              </h3>
                              <div className="flex items-center gap-1.5 mt-1">
                                <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100 text-amber-700">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  <span className="text-xs font-black">{hotel.rating_avg > 0 ? hotel.rating_avg.toFixed(1) : "Nuevo"}</span>
                                </div>
                                {hotel.review_count > 0 && (
                                  <span className="text-[10px] text-gray-400 font-bold">({hotel.review_count} reseñas)</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </th>
                      ))}
                      
                      {/* Empty slots placeholders if compared length < 3 */}
                      {Array.from({ length: 3 - comparedHotels.length }).map((_, idx) => (
                        <th key={`empty-${idx}`} className="p-6 w-1/4 border-l border-gray-100 text-center bg-gray-50/20 text-gray-300">
                          <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-4">
                            <Sparkles className="w-6 h-6 text-gray-300 mb-2" />
                            <p className="text-[10px] font-bold">Ranura Libre</p>
                            <Link href="/establecimientos" className="text-[9px] text-brand-magenta font-black uppercase mt-2 hover:underline">Agregar Hotel</Link>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    
                    {/* Destination Row */}
                    <tr className="hover:bg-gray-50/30">
                      <td className="p-5 font-bold text-gray-400 uppercase tracking-wider text-[10px]">Ubicación / Destino</td>
                      {comparedHotels.map(hotel => (
                        <td key={hotel.id} className="p-5 border-l border-gray-100 text-gray-600 font-semibold">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-brand-turquesa shrink-0" />
                            <span>{hotel.destination_name || "Venezuela"}</span>
                          </div>
                          {hotel.address && <p className="text-[10px] text-gray-400 font-medium mt-1">{hotel.address}</p>}
                        </td>
                      ))}
                      {Array.from({ length: 3 - comparedHotels.length }).map((_, idx) => (
                        <td key={`empty-${idx}`} className="p-5 border-l border-gray-100"></td>
                      ))}
                    </tr>

                    {/* Price Level Row */}
                    <tr className="hover:bg-gray-50/30">
                      <td className="p-5 font-bold text-gray-400 uppercase tracking-wider text-[10px]">Rango de Precio</td>
                      {comparedHotels.map(hotel => (
                        <td key={hotel.id} className="p-5 border-l border-gray-100 text-gray-700 font-bold">
                          {priceLabels[hotel.price_level] || "No especificado"}
                        </td>
                      ))}
                      {Array.from({ length: 3 - comparedHotels.length }).map((_, idx) => (
                        <td key={`empty-${idx}`} className="p-5 border-l border-gray-100"></td>
                      ))}
                    </tr>

                    {/* Sello de Calidad HDV Row */}
                    <tr className="hover:bg-gray-50/30">
                      <td className="p-5 font-bold text-gray-400 uppercase tracking-wider text-[10px]">Garantía de Calidad</td>
                      {comparedHotels.map(hotel => (
                        <td key={hotel.id} className="p-5 border-l border-gray-100">
                          {hotel.has_hdv_seal ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-[9px] font-black uppercase tracking-widest rounded-lg">
                              🏆 Sello de Oro HDV
                            </span>
                          ) : (
                            <span className="text-gray-400 font-medium">Estándar</span>
                          )}
                        </td>
                      ))}
                      {Array.from({ length: 3 - comparedHotels.length }).map((_, idx) => (
                        <td key={`empty-${idx}`} className="p-5 border-l border-gray-100"></td>
                      ))}
                    </tr>

                    {/* Socio Tier Row */}
                    <tr className="hover:bg-gray-50/30">
                      <td className="p-5 font-bold text-gray-400 uppercase tracking-wider text-[10px]">Membresía Plataforma</td>
                      {comparedHotels.map(hotel => (
                        <td key={hotel.id} className="p-5 border-l border-gray-100 capitalize text-gray-600 font-bold">
                          {hotel.membership_tier !== "basic" ? (
                            <span className="text-brand-magenta font-black">Socio {hotel.membership_tier}</span>
                          ) : (
                            <span className="text-gray-400">Básico</span>
                          )}
                        </td>
                      ))}
                      {Array.from({ length: 3 - comparedHotels.length }).map((_, idx) => (
                        <td key={`empty-${idx}`} className="p-5 border-l border-gray-100"></td>
                      ))}
                    </tr>

                    {/* Contact & Support */}
                    <tr className="hover:bg-gray-50/30">
                      <td className="p-5 font-bold text-gray-400 uppercase tracking-wider text-[10px]">Contacto Directo</td>
                      {comparedHotels.map(hotel => (
                        <td key={hotel.id} className="p-5 border-l border-gray-100 space-y-2">
                          {hotel.whatsapp && (
                            <a
                              href={`https://wa.me/${hotel.whatsapp.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors font-bold"
                            >
                              <Phone className="w-3.5 h-3.5 fill-current" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          {hotel.website && (
                            <a
                              href={hotel.website.startsWith("http") ? hotel.website : `https://${hotel.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-50 border border-cyan-100 rounded-lg text-cyan-700 hover:bg-cyan-100 transition-colors font-bold ml-2"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span>Sitio Web</span>
                            </a>
                          )}
                        </td>
                      ))}
                      {Array.from({ length: 3 - comparedHotels.length }).map((_, idx) => (
                        <td key={`empty-${idx}`} className="p-5 border-l border-gray-100"></td>
                      ))}
                    </tr>

                    {/* Services/Amenities Title Row */}
                    <tr className="bg-gray-50/20 font-black text-gray-600">
                      <td className="p-4 uppercase tracking-widest text-[9px]">Comodidades y Servicios</td>
                      {comparedHotels.map(hotel => (
                        <td key={hotel.id} className="p-4 border-l border-gray-100"></td>
                      ))}
                      {Array.from({ length: 3 - comparedHotels.length }).map((_, idx) => (
                        <td key={`empty-${idx}`} className="p-4 border-l border-gray-100"></td>
                      ))}
                    </tr>

                    {/* Services rows dynamic list */}
                    {allServices.map(service => (
                      <tr key={service} className="hover:bg-gray-50/20">
                        <td className="p-3.5 pl-8 font-medium text-gray-500 capitalize">{service}</td>
                        {comparedHotels.map(hotel => {
                          const hasService = hotel.services.includes(service.toLowerCase());
                          return (
                            <td key={hotel.id} className="p-3.5 border-l border-gray-100 text-left">
                              {hasService ? (
                                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 bg-red-50 rounded-full flex items-center justify-center text-red-400">
                                  <X className="w-3 h-3" />
                                </div>
                              )}
                            </td>
                          );
                        })}
                        {Array.from({ length: 3 - comparedHotels.length }).map((_, idx) => (
                          <td key={`empty-${idx}`} className="p-3.5 border-l border-gray-100"></td>
                        ))}
                      </tr>
                    ))}

                    {/* Call-to-action Row */}
                    <tr className="bg-gray-50/10">
                      <td className="p-6"></td>
                      {comparedHotels.map(hotel => (
                        <td key={hotel.id} className="p-6 border-l border-gray-100">
                          <Link href={`/establecimiento/${hotel.slug}`}>
                            <button className="w-full btn-magenta-gradient text-xs font-black py-3 px-4 rounded-xl cursor-pointer hover:scale-102 transition-transform shadow-md">
                              Ver Ficha Completa
                            </button>
                          </Link>
                        </td>
                      ))}
                      {Array.from({ length: 3 - comparedHotels.length }).map((_, idx) => (
                        <td key={`empty-${idx}`} className="p-6 border-l border-gray-100"></td>
                      ))}
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
