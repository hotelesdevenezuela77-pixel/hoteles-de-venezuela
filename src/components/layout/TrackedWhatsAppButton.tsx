import { useState, useCallback } from "react";
import { MessageCircle, Loader2, X, User, Phone } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface TrackedWhatsAppButtonProps {
  whatsappNumber: string;
  establishmentId: number;
  establishmentName?: string;
  message?: string;
  className?: string;
  children?: React.ReactNode;
  iconOnly?: boolean;
  isPriority?: boolean;
}

let cachedIp = "";
async function getClientIp(): Promise<string> {
  if (cachedIp) return cachedIp;
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const json = await res.json();
    cachedIp = json.ip || "";
    return cachedIp;
  } catch {
    return "127.0.0.1";
  }
}

// Track analytics event directly in Supabase
export const trackEvent = async (
  eventType: string,
  establishmentId: number,
  extraData?: Record<string, any>
) => {
  try {
    const clientIp = await getClientIp().catch(() => "127.0.0.1");
    const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";
    const browser = navigator.userAgent.slice(0, 80);

    await supabase.from("analytics_events").insert([{
      event_type: eventType,
      establishment_id: establishmentId,
      page_url: window.location.href,
      referrer_url: document.referrer || null,
      device_type: deviceType,
      browser: browser,
      ip_address: clientIp,
      extra_data: extraData ? JSON.stringify(extraData) : null
    }]);
  } catch (e) {
    console.error("Analytics tracking error:", e);
  }
};

// Save WhatsApp lead in general lead list
const createWhatsAppLead = async (data: {
  visitor_name: string;
  visitor_phone: string;
  establishment_name?: string;
}): Promise<boolean> => {
  try {
    const clientIp = await getClientIp();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const { error } = await supabase
      .from("whatsapp_leads")
      .insert([{
        name: data.visitor_name,
        phone: data.visitor_phone,
        source: "whatsapp_establishment",
        status: "nuevo",
        lead_type: "turista",
        interest: `Establecimiento: ${data.establishment_name || "Negocio"}`,
        ip_address: clientIp,
        timezone: userTimeZone
      }]);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Error creating lead in whatsapp_leads:", e);
    return false;
  }
};

// Save WhatsApp lead in Supabase for the specific establishment
const saveWhatsAppLead = async (data: {
  establishment_id: number;
  establishment_name?: string;
  visitor_name: string;
  visitor_phone: string;
  message?: string;
}): Promise<boolean> => {
  try {
    const { error } = await supabase.from("establishment_whatsapp_leads").insert([{
      establishment_id: data.establishment_id,
      establishment_name: data.establishment_name,
      visitor_name: data.visitor_name,
      visitor_phone: data.visitor_phone,
      message: data.message || "",
      source_page: window.location.href
    }]);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Lead save error:", e);
    return false;
  }
};

export function TrackedWhatsAppButton({
  whatsappNumber,
  establishmentId,
  establishmentName,
  message,
  className = "",
  children,
  iconOnly = false,
  isPriority = false
}: TrackedWhatsAppButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; phone?: string } = {};

    if (!visitorName.trim()) {
      newErrors.name = "Por favor, ingresa tu nombre.";
    }

    if (!visitorPhone.trim()) {
      newErrors.phone = "Por favor, ingresa tu teléfono.";
    } else if (!/^[\d\s\-+()]{7,}$/.test(visitorPhone.trim())) {
      newErrors.phone = "Número de teléfono inválido.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openWhatsApp = useCallback((includeVisitorInfo: boolean = false) => {
    let formattedNumber = whatsappNumber.replace(/[^\d+]/g, "");
    if (!formattedNumber.startsWith("+")) {
      formattedNumber = `+${formattedNumber}`;
    }

    const baseMessage = `Hola, vi a ${establishmentName || "su negocio"} en la plataforma HOTELES DE VENEZUELA (hotelesdevenezuela.com) y me gustaría más información.`;

    let finalMessage: string;
    if (includeVisitorInfo && visitorName && visitorPhone) {
      finalMessage = `¡Hola! Mi nombre es ${visitorName.trim()} y mi teléfono es ${visitorPhone.trim()}. ${baseMessage}`;
    } else {
      finalMessage = baseMessage;
    }

    const whatsappUrl = `https://wa.me/${formattedNumber.replace("+", "")}?text=${encodeURIComponent(finalMessage)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }, [whatsappNumber, establishmentName, visitorName, visitorPhone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const [leadSaved] = await Promise.all([
      saveWhatsAppLead({
        establishment_id: establishmentId,
        establishment_name: establishmentName,
        visitor_name: visitorName.trim(),
        visitor_phone: visitorPhone.trim(),
        message: message
      }),
      createWhatsAppLead({
        visitor_name: visitorName.trim(),
        visitor_phone: visitorPhone.trim(),
        establishment_name: establishmentName
      }),
      trackEvent("whatsapp_lead", establishmentId, {
        establishment_name: establishmentName,
        whatsapp_number: whatsappNumber,
        visitor_name: visitorName.trim(),
        visitor_phone: visitorPhone.trim(),
        source: "whatsapp_establishment"
      })
    ]);

    if (!leadSaved) {
      console.warn("No se pudo registrar el contacto en base de datos, procediendo a abrir chat.");
    }

    setIsSubmitting(false);
    setShowModal(false);

    openWhatsApp(true);

    setVisitorName("");
    setVisitorPhone("");
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowModal(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVisitorName(e.target.value);
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVisitorPhone(e.target.value);
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const closeModal = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowModal(false);
  };

  const modalContent = showModal ? (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={() => closeModal()}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-extrabold text-sm tracking-wide">WhatsApp Directo</h3>
              <p className="text-white/80 text-xs truncate max-w-[200px] mt-0.5">{establishmentName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => closeModal()}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
          <p className="text-xs text-gray-500 leading-relaxed text-center">
            Conectamos directamente con el propietario. Déjanos tus datos para iniciar el chat en WhatsApp:
          </p>

          {/* Name Field */}
          <div>
            <label htmlFor="visitor-name" className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">
              Tu nombre completo
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                id="visitor-name"
                type="text"
                value={visitorName}
                onChange={handleNameChange}
                placeholder="Ej: María García"
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                  errors.name ? "border-red-500" : "border-gray-100"
                }`}
                autoComplete="name"
                required
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-[10px] font-semibold mt-1">{errors.name}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="visitor-phone" className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">
              Tu número de teléfono
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                id="visitor-phone"
                type="tel"
                value={visitorPhone}
                onChange={handlePhoneChange}
                placeholder="Ej: +58 414 1234567"
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                  errors.phone ? "border-red-500" : "border-gray-100"
                }`}
                autoComplete="tel"
                required
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-[10px] font-semibold mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-500/10 active:scale-98"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                <span>Abrir Chat de WhatsApp</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-gray-400 leading-normal">
            Al hacer clic, aceptas compartir tu información de contacto directamente con el establecimiento.
          </p>
        </form>
      </div>
    </div>
  ) : null;

  if (iconOnly) {
    return (
      <>
        <button
          type="button"
          onClick={handleButtonClick}
          className={`inline-flex items-center justify-center text-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer ${className}`}
          title="Contactar vía WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
        {modalContent}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleButtonClick}
        className={`w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
          isPriority ? "animate-whatsapp-priority" : ""
        } ${className}`}
      >
        <MessageCircle className="w-4 h-4" />
        {children || "WhatsApp"}
      </button>
      {modalContent}
    </>
  );
}

export default TrackedWhatsAppButton;
