import { Link } from "wouter";
import { MapPin, Star, Wifi, Car, Waves, Utensils, TreePine, Dumbbell, Sparkles, Phone, BarChart3 } from "lucide-react";
import { TrackedWhatsAppButton } from "./TrackedWhatsAppButton";

export interface Establishment {
  id: number;
  slug: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  whatsapp: string;
  website: string;
  category_name?: string;
  category_slug?: string;
  destination_name?: string;
  destination_slug?: string;
  primary_image?: string;
  rating_avg: number;
  review_count: number;
  price_level: string;
  is_featured: boolean;
  services: string;
  membership_tier: string;
  has_hdv_seal?: boolean;
}

const tierConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  diamante: { label: "Diamante", color: "text-white", bgColor: "bg-gradient-to-r from-purple-500 to-pink-500" },
  oro: { label: "Oro", color: "text-white", bgColor: "bg-gradient-to-r from-yellow-500 to-amber-500" },
  plata: { label: "Plata", color: "text-white", bgColor: "bg-gradient-to-r from-slate-400 to-slate-500" },
  bronce: { label: "Bronce", color: "text-white", bgColor: "bg-gradient-to-r from-orange-600 to-orange-700" },
  basico: { label: "", color: "", bgColor: "" },
};

const serviceIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="w-3.5 h-3.5" />,
  estacionamiento: <Car className="w-3.5 h-3.5" />,
  piscina: <Waves className="w-3.5 h-3.5" />,
  restaurante: <Utensils className="w-3.5 h-3.5" />,
  jardin: <TreePine className="w-3.5 h-3.5" />,
  gimnasio: <Dumbbell className="w-3.5 h-3.5" />,
  spa: <Sparkles className="w-3.5 h-3.5" />,
};

function parseServices(services: string | null): string[] {
  if (!services) return [];
  try {
    const parsed = JSON.parse(services);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return services.split(",").map(s => s.trim().toLowerCase());
  }
}

export function EstablishmentCard({ 
  establishment, 
  isComparing = false, 
  onCompareToggle,
  isPriority = false
}: { 
  establishment: Establishment; 
  isComparing?: boolean; 
  onCompareToggle?: () => void; 
  isPriority?: boolean;
}) {
  const placeholderImage = "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop";
  const tier = tierConfig[establishment.membership_tier?.toLowerCase()] || tierConfig.basico;
  const services = parseServices(establishment.services);

  const wrapperClass = isPriority
    ? "priority-glow-card group shadow-md hover:shadow-2xl hover:shadow-[#FF0096]/10 transition-all duration-300"
    : "group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full justify-between";

  return (
    <div className={wrapperClass}>
      <div className={isPriority ? "priority-glow-card-inner bg-gradient-to-br from-[#0e011f] to-[#1a0533] text-white flex flex-col h-full justify-between" : "flex flex-col h-full justify-between w-full h-full"}>
        <div>
          {/* Image Section */}
          <div className="relative h-52 overflow-hidden bg-gray-100">
            <img
              src={establishment.primary_image || placeholderImage}
              alt={establishment.name}
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = placeholderImage;
              }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {/* Top Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {tier.label && (
                <span className={`px-3 py-1 ${tier.bgColor} ${tier.color} text-[10px] font-black uppercase tracking-wider rounded-full shadow-md flex items-center gap-1`}>
                  <Sparkles className="w-3 h-3" />
                  {tier.label}
                </span>
              )}
              {establishment.category_name && (
                <span className="px-3.5 py-1.5 bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-md flex items-center">
                  {establishment.category_name}
                </span>
              )}
            </div>

            {/* Official HDV Seal Image (replaces "desde moderado / noche" button) */}
            {(establishment.has_hdv_seal || isPriority) && (
              <img 
                src="/images/sello-hdv.png" 
                alt="Sello de Calidad Hoteles de Venezuela" 
                className="absolute bottom-2.5 right-2.5 w-14 h-14 object-contain z-10 drop-shadow-md hover:scale-110 transition-transform duration-300 pointer-events-none" 
              />
            )}

            {/* Compare Checkbox */}
            {onCompareToggle && (
              <div className="absolute top-4 right-4 flex gap-2">
                <label className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/20 hover:bg-white/30 transition-all px-3 py-1.5 rounded-full text-white text-[10px] font-bold cursor-pointer shadow-md">
                  <input
                    type="checkbox"
                    checked={isComparing}
                    onChange={onCompareToggle}
                    className="hidden"
                  />
                  <BarChart3 className={`w-3.5 h-3.5 ${isComparing ? "text-white animate-pulse" : "text-white/60"}`} />
                  <span>Comparador</span>
                </label>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-5 flex-1 flex flex-col">
            {/* Title & Location with Seal */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <h3 className={`font-black text-lg transition-colors line-clamp-1 leading-tight ${isPriority ? "text-white group-hover:text-brand-turquesa" : "text-gray-800 group-hover:text-brand-magenta"}`}>
                  {establishment.name}
                </h3>

                <div className="flex items-center gap-1 text-xs mt-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-turquesa shrink-0" />
                  <span className={`truncate ${isPriority ? "text-gray-300" : "text-gray-400"}`}>{establishment.destination_name || establishment.address || "Venezuela"}</span>
                </div>
              </div>

              {/* HDV Seal */}
              {(establishment.has_hdv_seal || isPriority) && (
                <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest shrink-0 self-center border ${isPriority ? "bg-amber-500/10 border-amber-500/20 text-amber-300" : "bg-yellow-50 border border-yellow-200 text-yellow-600"}`}>
                  SELLO HDV
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border ${isPriority ? "bg-amber-500/10 border-amber-500/20 text-amber-300" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-extrabold text-xs">{establishment.rating_avg > 0 ? establishment.rating_avg.toFixed(1) : "Nuevo"}</span>
              </div>
              {establishment.review_count > 0 && (
                <span className={`text-[11px] font-bold ${isPriority ? "text-gray-400" : "text-gray-400"}`}>
                  ({establishment.review_count} reseña{establishment.review_count !== 1 ? "s" : ""})
                </span>
              )}
            </div>

            {/* Services/Amenities */}
            {services.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {services.slice(0, 3).map((service, i) => (
                  <span
                    key={i}
                    className={`flex items-center gap-1 px-2.5 py-0.5 text-[10px] rounded-full font-medium ${isPriority ? "bg-white/5 text-white/70 border border-white/10" : "bg-gray-50 text-gray-500 border border-gray-100"}`}
                  >
                    {serviceIcons[service.toLowerCase()] || <Sparkles className="w-3 h-3 text-brand-magenta" />}
                    <span className="capitalize">{service}</span>
                  </span>
                ))}
                {services.length > 3 && (
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${isPriority ? "bg-white/5 text-white/50 border border-white/10" : "bg-gray-50 text-gray-400 border border-gray-100"}`}>
                    +{services.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {establishment.description && (
              <p className={`text-xs leading-relaxed line-clamp-2 ${isPriority ? "text-gray-400" : "text-gray-400"}`}>
                {establishment.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-5 pb-5">
          <div className={`flex gap-2.5 pt-4 border-t mt-4 ${isPriority ? "border-white/10" : "border-gray-50"}`}>
            {establishment.whatsapp ? (
              <div className="flex-1">
                <TrackedWhatsAppButton
                  whatsappNumber={establishment.whatsapp}
                  establishmentId={establishment.id}
                  establishmentName={establishment.name}
                />
              </div>
            ) : establishment.phone ? (
              <a
                href={`tel:${establishment.phone}`}
                className="flex-1"
              >
                <button className="w-full bg-gradient-to-r from-[#00C8D4] to-[#008ba3] text-white text-xs font-extrabold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#00C8D4]/15 hover:scale-102 transition-all cursor-pointer border-none">
                  <Phone className="w-4 h-4" />
                  Llamar
                </button>
              </a>
            ) : null}

            <Link href={`/establecimiento/${establishment.slug}`} className="flex-1">
              <button className="w-full btn-magenta-gradient text-white text-xs font-extrabold py-2.5 px-4 rounded-xl flex items-center justify-center shadow-md shadow-brand-magenta/10 hover:scale-102 transition-all cursor-pointer">
                Ver Ficha
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EstablishmentListItem({ 
  establishment, 
  isComparing = false, 
  onCompareToggle,
  isPriority = false
}: { 
  establishment: Establishment; 
  isComparing?: boolean; 
  onCompareToggle?: () => void; 
  isPriority?: boolean;
}) {
  const placeholderImage = "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop";
  const tier = tierConfig[establishment.membership_tier?.toLowerCase()] || tierConfig.basico;
  const services = parseServices(establishment.services);

  const wrapperClass = isPriority
    ? "priority-glow-card group shadow-md hover:shadow-2xl hover:shadow-[#FF0096]/10 transition-all duration-300"
    : "group flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 p-2 md:p-3 gap-6";

  return (
    <div className={wrapperClass}>
      <div className={isPriority ? "priority-glow-card-inner bg-gradient-to-br from-[#0e011f] to-[#1a0533] text-white p-2 md:p-3 flex flex-col md:flex-row gap-6 h-full w-full" : "flex flex-col md:flex-row gap-6 w-full h-full items-stretch"}>
        {/* Image Section */}
        <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0 rounded-2xl overflow-hidden bg-gray-100">
          <img
            src={establishment.primary_image || placeholderImage}
            alt={establishment.name}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = placeholderImage;
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {tier.label && (
              <span className={`px-3 py-1 ${tier.bgColor} ${tier.color} text-[10px] font-black uppercase tracking-wider rounded-full shadow shadow-black/20 flex items-center gap-1`}>
                <Sparkles className="w-3 h-3" />
                {tier.label}
              </span>
            )}
          </div>

          {/* Official HDV Seal Image (replaces "desde moderado / noche" button) */}
          {(establishment.has_hdv_seal || isPriority) && (
            <img 
              src="/images/sello-hdv.png" 
              alt="Sello de Calidad Hoteles de Venezuela" 
              className="absolute bottom-2 right-2 w-12 h-12 object-contain z-10 drop-shadow-md hover:scale-110 transition-transform duration-300 pointer-events-none" 
            />
          )}

          {/* Compare Checkbox */}
          {onCompareToggle && (
            <div className="absolute top-3 right-3 flex gap-2">
              <label className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/20 hover:bg-white/30 transition-all px-3 py-1.5 rounded-full text-white text-[10px] font-bold cursor-pointer shadow-md">
                <input
                  type="checkbox"
                  checked={isComparing}
                  onChange={onCompareToggle}
                  className="hidden"
                />
                <BarChart3 className={`w-3.5 h-3.5 ${isComparing ? "text-white animate-pulse" : "text-white/60"}`} />
                <span>Comparador</span>
              </label>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-between py-2 text-left">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  {establishment.category_name && (
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isPriority ? "text-brand-turquesa" : "text-[#00C8D4]"}`}>
                      {establishment.category_name}
                    </span>
                  )}
                  {(establishment.has_hdv_seal || isPriority) && (
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${isPriority ? "bg-amber-500/10 border-amber-500/20 text-amber-300" : "bg-yellow-50 border border-yellow-200 text-yellow-600"}`}>
                      Sello HDV
                    </span>
                  )}
                </div>
                <h3 className={`font-black text-xl transition-colors mt-1 ${isPriority ? "text-white group-hover:text-brand-turquesa" : "text-gray-800 group-hover:text-brand-magenta"}`}>
                  {establishment.name}
                </h3>
                <div className="flex items-center gap-1 text-xs mt-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-turquesa shrink-0" />
                  <span className={isPriority ? "text-gray-300" : "text-gray-400"}>{establishment.destination_name || establishment.address || "Venezuela"}</span>
                </div>
              </div>

              {/* Rating */}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border self-start ${isPriority ? "bg-amber-500/10 border-amber-500/20 text-amber-300" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-black text-sm">{establishment.rating_avg > 0 ? establishment.rating_avg.toFixed(1) : "Nuevo"}</span>
                {establishment.review_count > 0 && (
                  <span className={`text-[10px] font-bold ml-1 ${isPriority ? "text-amber-400" : "text-amber-600"}`}>
                    ({establishment.review_count})
                  </span>
                )}
              </div>
            </div>

            {/* Services/Amenities */}
            {services.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {services.slice(0, 5).map((service, i) => (
                  <span
                    key={i}
                    className={`flex items-center gap-1 px-2.5 py-0.5 text-[10px] rounded-full font-medium ${isPriority ? "bg-white/5 text-white/70 border border-white/10" : "bg-gray-50 text-gray-500 border border-gray-100"}`}
                  >
                    {serviceIcons[service.toLowerCase()] || <Sparkles className="w-3 h-3 text-brand-magenta" />}
                    <span className="capitalize">{service}</span>
                  </span>
                ))}
                {services.length > 5 && (
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${isPriority ? "bg-white/5 text-white/50 border border-white/10" : "bg-gray-50 text-gray-400 border border-gray-100"}`}>
                    +{services.length - 5}
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {establishment.description && (
              <p className={`text-xs leading-relaxed line-clamp-2 ${isPriority ? "text-gray-400" : "text-gray-400"}`}>
                {establishment.description}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className={`flex gap-2.5 pt-4 border-t mt-4 max-w-sm ${isPriority ? "border-white/10" : "border-gray-50"}`}>
            {establishment.whatsapp ? (
              <div className="flex-1">
                <TrackedWhatsAppButton
                  whatsappNumber={establishment.whatsapp}
                  establishmentId={establishment.id}
                  establishmentName={establishment.name}
                />
              </div>
            ) : establishment.phone ? (
              <a
                href={`tel:${establishment.phone}`}
                className="flex-1"
              >
                <button className="w-full bg-gradient-to-r from-[#00C8D4] to-[#008ba3] text-white text-xs font-extrabold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#00C8D4]/15 hover:scale-102 transition-all cursor-pointer border-none">
                  <Phone className="w-4 h-4" />
                  Llamar
                </button>
              </a>
            ) : null}

            <Link href={`/establecimiento/${establishment.slug}`} className="flex-1">
              <button className="w-full btn-magenta-gradient text-white text-xs font-extrabold py-2.5 px-4 rounded-xl flex items-center justify-center shadow-md shadow-brand-magenta/10 hover:scale-102 transition-all cursor-pointer">
                Ver Detalles
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
