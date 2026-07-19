import { useState, useEffect } from "react";
import { 
  Globe, Hotel, Palmtree, Building2, Map, Phone, Mail, ExternalLink,
  Sparkles, Crown
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { OFFICIAL_WHATSAPP_NUMBER } from "@/config/whatsapp";

interface CorporateLink {
  id: number;
  title: string;
  url: string;
  description: string;
  icon_type: string;
  bg_color: string;
  text_color: string;
  sort_order: number;
  is_active: boolean;
  clicks: number;
}

interface SiteSettings {
  instagram_url?: string;
  facebook_url?: string;
  youtube_url?: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  globe: <Globe className="w-6 h-6" />,
  hotel: <Hotel className="w-6 h-6" />,
  palmtree: <Palmtree className="w-6 h-6" />,
  building: <Building2 className="w-6 h-6" />,
  map: <Map className="w-6 h-6" />,
  phone: <Phone className="w-6 h-6" />,
  mail: <Mail className="w-6 h-6" />,
  instagram: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  ),
  facebook: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  ),
  youtube: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.56 49.56 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/>
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
    </svg>
  ),
  twitter: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
  ),
};

export function LinkHub() {
  const [links, setLinks] = useState<CorporateLink[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "HDV Corporación | Hoteles de Venezuela";

    async function loadData() {
      try {
        const [linksRes, settingsRes] = await Promise.all([
          supabase
            .from("corporate_links")
            .select("*")
            .order("sort_order", { ascending: true }),
          supabase
            .from("site_settings")
            .select("*")
        ]);

        if (linksRes.data) {
          setLinks(linksRes.data as CorporateLink[]);
        }

        const settingsObj: SiteSettings = {};
        (settingsRes.data || []).forEach((s: any) => {
          settingsObj[s.setting_key as keyof SiteSettings] = s.setting_value;
        });
        setSettings(settingsObj);
      } catch (err) {
        console.warn("Error cargando enlaces corporativos:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleClick = async (link: CorporateLink) => {
    try {
      await supabase
        .from("corporate_links")
        .update({ clicks: (link.clicks || 0) + 1 })
        .eq("id", link.id);
    } catch (e) {
      console.warn("Error actualizando clicks en base de datos:", e);
    }
    window.open(link.url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-4 py-12 md:py-20">
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 p-1 shadow-2xl shadow-pink-500/25">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden p-3">
                <img 
                  src="https://ghgetcznlrilgocwigmj.supabase.co/storage/v1/object/public/site-assets/logo-hdv.png"
                  alt="HDV"
                  className="w-16 h-16 object-contain"
                  onError={e => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=120";
                  }}
                />
              </div>
            </div>
            <div className="absolute -top-2 -right-2">
              <Crown className="w-8 h-8 text-amber-400 drop-shadow-lg animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-center">
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent uppercase tracking-wider font-sans">
              HDV Corporation
            </span>
          </h1>
          <p className="text-slate-400 text-center max-w-md font-medium text-xs uppercase tracking-widest">
            Red de portales turísticos de Venezuela
          </p>

          <div className="mt-6 text-center max-w-md bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
            <p className="text-white/95 text-base font-semibold italic mb-2">
              "Donde la hospitalidad venezolana se vuelve prestigio."
            </p>
            <p className="text-slate-350 text-xs leading-relaxed font-medium">
              Accede a la plataforma oficial que conecta a los viajeros con los destinos más icónicos del país. Seguridad, respaldo y las mejores tarifas en un solo lugar.
            </p>
            <p className="text-cyan-400 text-xs font-black uppercase tracking-wider mt-3">
              La autoridad en hoteles eres tú. Comienza ahora.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-full border border-amber-500/30">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-xs font-black uppercase tracking-widest">Reserva sin Intermediarios</span>
          </div>
        </div>

        {/* Links */}
        <div className="w-full max-w-md space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
            </div>
          ) : (
            links.filter(l => l.is_active).map((link, index) => (
              <button
                key={link.id}
                onClick={() => handleClick(link)}
                className="group w-full relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl cursor-pointer"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards",
                  opacity: 1
                }}
              >
                {/* Gradient border effect */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ 
                    background: `linear-gradient(135deg, ${link.bg_color || '#E91E63'}, transparent)`,
                    padding: "2px"
                  }}
                />
                
                <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50 group-hover:border-transparent transition-all duration-500">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shrink-0"
                      style={{ 
                        background: `linear-gradient(135deg, ${link.bg_color || '#E91E63'}, ${link.bg_color || '#E91E63'}88)`,
                        boxShadow: `0 8px 32px ${link.bg_color || '#E91E63'}40`
                      }}
                    >
                      {ICON_MAP[link.icon_type] || <Globe className="w-6 h-6" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-left">
                      <h3 className="text-white font-bold text-base group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 group-hover:bg-clip-text transition-all duration-300 leading-snug">
                        {link.title}
                      </h3>
                      {link.description && (
                        <p className="text-slate-400 text-xs mt-1 line-clamp-1 font-semibold">
                          {link.description}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:bg-white/10 group-hover:text-white transition-all duration-300 group-hover:translate-x-1 shrink-0">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Hover shine effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4">Síguenos en redes sociales</p>
          <div className="flex items-center justify-center gap-4">
            <a href={settings.instagram_url || "https://instagram.com/hotelesdevzla"} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg shadow-pink-500/25">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href={settings.facebook_url || "https://www.facebook.com/wpecca"} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg shadow-blue-500/25">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href={settings.youtube_url || "https://www.youtube.com/@HotelesdeVenezuela"} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg shadow-red-500/25">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.56 49.56 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
              </svg>
            </a>
            <a href={`https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=Hola%2C%20vengo%20de%20la%20p%C3%A1gina%20de%20enlaces%20HDV`} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg shadow-green-500/25">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800">
            <p className="text-slate-600 text-xs">
              © {new Date().getFullYear()} HDV Corporation
            </p>
            <p className="text-slate-700 text-[10px] mt-1 font-bold uppercase tracking-wider">
              Desarrollado por WebMasterPro
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
