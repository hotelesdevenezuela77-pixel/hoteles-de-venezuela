import { useState, useRef, useEffect } from "react";
import { X, Send, Phone, User, ChevronDown, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

/* ── config ─────────────────────────────────────────────── */
const WA_NUMBER = "584145069774";

/* ── auto-responses per visitor type ────────────────────── */
const BOT_GREET = {
  turista:     (name: string) => `¡Hola ${name.split(" ")[0]}! 🌴 Bienvenido a Hoteles de Venezuela. Soy tu asistente de viaje. Puedo ayudarte a encontrar hoteles, posadas, paquetes turísticos y más. ¿A qué destino piensas viajar?`,
  propietario: (name: string) => `¡Hola ${name.split(" ")[0]}! 🏨 Bienvenido a Hoteles de Venezuela. Soy tu asistente de negocios. Puedo ayudarte a registrar tu propiedad, conocer nuestros planes de membresía y maximizar tu visibilidad. ¿En qué puedo ayudarte?`,
};

const RULES_TURISTA = [
  { k: ["hola","buenos","buenas","hey"],            r: "¡Hola! 👋 Cuéntame, ¿a qué parte de Venezuela te gustaría viajar?" },
  { k: ["precio","costo","cuanto","cuánto","tarif"], r: "Los precios varían por temporada y establecimiento. Puedes ver tarifas en cada ficha. ¿Quieres que te oriente hacia un destino específico?" },
  { k: ["reserva","reservar","disponib","booking"],  r: "Para reservar, entra al perfil del establecimiento y haz clic en 'Reservar'. También puedes contactar directamente al hotel por WhatsApp. 📲" },
  { k: ["paquete","tour","excursion","plan"],        r: "¡Tenemos paquetes turísticos increíbles! ✈️ Visita /paquetes para ver opciones con todo incluido para familias y grupos." },
  { k: ["destino","playa","isla","montaña","selva"], r: "Venezuela tiene destinos únicos: Morrocoy 🏖️, Los Roques 🪸, Canaima 🌊, Mérida ⛰️, Margarita 🌅 y más. ¿Cuál te llama la atención?" },
  { k: ["hotel","posada","alojamiento","hospedaje"], r: "Tenemos una amplia selección de hoteles y posadas en todo el país. 🏨 Visita /establecimientos para filtrar por categoría y destino." },
  { k: ["gracias","thank","perfecto","excelente"],   r: "¡Con gusto! 😊 Que disfrutes tu viaje por Venezuela. ¿Algo más en lo que pueda ayudarte?" },
  { k: ["whatsapp","wa","llamar","contacto"],        r: "Puedes escribirnos por WhatsApp directamente desde este chat usando el botón 'Continuar por WhatsApp' de abajo. 📱" },
];

const RULES_PROPIETARIO = [
  { k: ["hola","buenos","buenas","hey"],            r: "¡Hola! 👋 ¿Cómo puedo ayudarte con tu negocio hoy?" },
  { k: ["registr","publicar","listar","poner"],     r: "Para registrar tu negocio visita /registro-negocio. El proceso es sencillo y tendrás visibilidad inmediata en toda la plataforma. 🚀" },
  { k: ["membresia","membresía","plan","precio"],   r: "Tenemos 3 planes: Básico (gratis), Premium y 50 Fundadores (cupo limitado con precio especial). Visita /membresias para ver beneficios de cada uno. 💼" },
  { k: ["beneficio","ventaja","visibilidad"],       r: "Al publicar en HDV obtienes: perfil profesional, reservas en línea, acceso al CRM de leads, analíticas, y más. ¿Quieres conocer los detalles?" },
  { k: ["reserva","booking","cliente"],             r: "Con tu perfil activo los turistas pueden reservar directamente o contactarte por WhatsApp. Tú controlas tu disponibilidad y precios. 📅" },
  { k: ["costo","precio","cuanto","cuánto","pago"], r: "El plan Básico es gratuito. Los planes Premium tienen inversión mensual según los beneficios. Te recomendamos los 50 Fundadores mientras haya cupo. ¿Necesitas más info?" },
  { k: ["gracias","thank","perfecto","excelente"],  r: "¡Con gusto! 😊 Esperamos pronto tenerte en nuestra red de establecimientos." },
  { k: ["whatsapp","wa","llamar","contacto"],       r: "Puedes escribirnos directamente por WhatsApp. Uno de nuestros asesores te atenderá. 📱" },
];

interface ChatbotRule {
  id: number;
  user_type: string;
  language: string;
  keywords: string[];
  response: string;
}

function autoReply(text: string, tipo: "turista" | "propietario", dbRules: ChatbotRule[]): string {
  const lower = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // 1. Intentar buscar en las reglas dinámicas de la base de datos primero
  const mappedUserType = tipo === "turista" ? "tourist" : "business";
  const matchedDbRule = dbRules.find(rule => {
    if (rule.user_type !== mappedUserType) return false;
    return rule.keywords.some(keyword => {
      const normalizedKeyword = keyword.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return lower.includes(normalizedKeyword);
    });
  });

  if (matchedDbRule) {
    return matchedDbRule.response;
  }

  // 2. Fallback a las reglas estáticas
  const rules = tipo === "turista" ? RULES_TURISTA : RULES_PROPIETARIO;
  for (const rule of rules) {
    if (rule.k.some(k => lower.includes(k))) return rule.r;
  }
  return tipo === "turista"
    ? "Entendido 😊 Para más información puedes ver nuestros destinos en /destinos u escribirnos por WhatsApp."
    : "Entendido 😊 Para más información sobre cómo listar tu negocio visita /registro-negocio o escríbenos por WhatsApp.";
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

/* ── track ───────────────────────────────────────────────── */
async function createLead(name: string, phone: string, tipo: "turista" | "propietario", source: string): Promise<number | null> {
  try {
    const clientIp = await getClientIp();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const { data, error } = await supabase
      .from("whatsapp_leads")
      .insert([{
        name,
        phone,
        source,
        status: "nuevo",
        lead_type: tipo,
        interest: `Widget ${source} · ${window.location.pathname}`,
        ip_address: clientIp,
        timezone: userTimeZone
      }])
      .select("id")
      .single();

    if (error) {
      console.warn("Supabase query failed for inserting whatsapp_lead, using local storage fallback");
      const localLeadsKey = "hdv_mock_whatsapp_leads";
      const localLeads = JSON.parse(localStorage.getItem(localLeadsKey) || "[]");
      const newId = Date.now();
      const newMockLead = {
        id: newId,
        name,
        phone,
        source,
        status: "nuevo",
        lead_type: tipo,
        interest: `Widget ${source} · ${window.location.pathname}`,
        ip_address: clientIp,
        timezone: userTimeZone,
        created_at: new Date().toISOString()
      };
      localStorage.setItem(localLeadsKey, JSON.stringify([...localLeads, newMockLead]));
      return newId;
    }
    return data?.id ?? null;
  } catch (err) {
    console.error("Catch error in createLead:", err);
    const clientIp = await getClientIp().catch(() => "127.0.0.1");
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localLeadsKey = "hdv_mock_whatsapp_leads";
    const localLeads = JSON.parse(localStorage.getItem(localLeadsKey) || "[]");
    const newId = Date.now();
    const newMockLead = {
      id: newId,
      name,
      phone,
      source,
      status: "nuevo",
      lead_type: tipo,
      interest: `Widget ${source} · ${window.location.pathname}`,
      ip_address: clientIp,
      timezone: userTimeZone,
      created_at: new Date().toISOString()
    };
    localStorage.setItem(localLeadsKey, JSON.stringify([...localLeads, newMockLead]));
    return newId;
  }
}

async function saveMessage(leadId: number, message: string, direction: "inbound" | "outbound", isAiGenerated = false) {
  try {
    const { error } = await supabase
      .from("whatsapp_messages")
      .insert([{
        lead_id: leadId,
        message,
        direction,
        is_ai_generated: isAiGenerated
      }]);
    if (error) {
      const localMsgKey = `hdv_mock_lead_messages_${leadId}`;
      const localMsgs = JSON.parse(localStorage.getItem(localMsgKey) || "[]");
      localStorage.setItem(localMsgKey, JSON.stringify([...localMsgs, { message, direction, isAiGenerated, created_at: new Date().toISOString() }]));
    }
  } catch (err) {
    console.warn("Error saving message:", err);
  }
}

async function trackEvent(eventType: string, name: string, phone: string, tipo: string) {
  try {
    const clientIp = await getClientIp();
    const payload = {
      event_type: eventType,
      page_url: window.location.href,
      device_type: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
      browser: navigator.userAgent.slice(0, 80),
      ip_hash: clientIp,
      extra_data: JSON.stringify({ name, phone, tipo, capturedAt: new Date().toISOString() })
    };

    const { error } = await supabase
      .from("lead_events")
      .insert([payload]);

    if (error) {
      console.warn("Supabase query failed for inserting lead_event, using local storage fallback:", error);
      const localKey = "hdv_mock_lead_events";
      const localEvents = JSON.parse(localStorage.getItem(localKey) || "[]");
      const newMockEvent = {
        id: Date.now(),
        event_type: eventType,
        page_url: window.location.href,
        device_type: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
        browser: navigator.userAgent.slice(0, 80),
        ip_hash: clientIp,
        extra_data: JSON.stringify({ name, phone, tipo, capturedAt: new Date().toISOString() }),
        created_at: new Date().toISOString()
      };
      localStorage.setItem(localKey, JSON.stringify([...localEvents, newMockEvent]));
    }
  } catch (err) {
    console.warn("Error tracking event:", err);
  }
}

/* ── types ───────────────────────────────────────────────── */
interface Msg { role: "bot" | "user"; text: string; ts: string }
type Tipo = "turista" | "propietario";
type Panel = "wa" | "chat" | null;

function ts() { return new Date().toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" }); }

/* ─────────────────────────────────────────────────────────
   MAIN WIDGET
   ───────────────────────────────────────────────────────── */
export function ChatWidget() {
  const [panel, setPanel]       = useState<Panel>(null);
  const [step, setStep]         = useState<"form" | "active">("form");

  /* shared form state */
  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [tipo, setTipo]         = useState<Tipo>("turista");

  /* chat state */
  const [leadId, setLeadId]     = useState<number | null>(null);
  const [msgs, setMsgs]         = useState<Msg[]>([]);
  const [input, setInput]       = useState("");
  const [typing, setTyping]     = useState(false);

  /* wa state */
  const [waDone, setWaDone]     = useState(false);

  /* db chatbot rules state */
  const [dbRules, setDbRules]   = useState<ChatbotRule[]>([]);

  useEffect(() => {
    async function loadRules() {
      try {
        const { data, error } = await supabase
          .from("chatbot_rules")
          .select("id, user_type, language, keywords, response");
        if (error) {
          console.warn("Could not fetch chatbot rules from Supabase:", error);
          return;
        }
        if (data) {
          setDbRules(data as ChatbotRule[]);
        }
      } catch (err) {
        console.warn("Error fetching chatbot rules:", err);
      }
    }
    loadRules();
  }, []);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  /* ── Open panel ── */
  function open(p: Panel) {
    setPanel(p);
    // reset step if we haven't submitted yet
    if (!leadId) setStep("form");
  }

  /* ── Submit pre-form (shared) ── */
  async function submitForm(target: "chat" | "wa") {
    if (!name.trim() || !phone.trim()) return;
    if (target === "chat") {
      const id = await createLead(name.trim(), phone.trim(), tipo, "web_chat");
      setLeadId(id);
      await trackEvent("chat_lead", name.trim(), phone.trim(), tipo);
      const greeting = BOT_GREET[tipo](name.trim());
      setMsgs([{ role: "bot", text: greeting, ts: ts() }]);
      if (id) await saveMessage(id, greeting, "outbound", true);
      setStep("active");
    } else {
      await createLead(name.trim(), phone.trim(), tipo, "whatsapp_widget");
      await trackEvent("whatsapp_lead", name.trim(), phone.trim(), tipo);
      const msg = encodeURIComponent(
        tipo === "turista"
          ? `Hola, soy ${name} (${phone}). Visité Hoteles de Venezuela y me gustaría información sobre hospedaje.`
          : `Hola, soy ${name} (${phone}), propietario de un establecimiento. Me gustaría registrarlo en Hoteles de Venezuela.`
      );
      window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
      setWaDone(true);
      setStep("active");
    }
  }

  /* ── Send chat message ── */
  async function sendMsg() {
    const txt = input.trim();
    if (!txt) return;
    setInput("");
    const userMsg: Msg = { role: "user", text: txt, ts: ts() };
    setMsgs(p => [...p, userMsg]);
    if (leadId) await saveMessage(leadId, txt, "inbound", false);
    setTyping(true);
    setTimeout(async () => {
      const reply = autoReply(txt, tipo, dbRules);
      setTyping(false);
      setMsgs(p => [...p, { role: "bot", text: reply, ts: ts() }]);
      if (leadId) await saveMessage(leadId, reply, "outbound", true);
    }, 800 + Math.random() * 500);
  }

  /* ── Continue to WA from chat ── */
  async function continueWa() {
    if (!waDone && name.trim() && phone.trim()) {
      await trackEvent("whatsapp_click", name.trim(), phone.trim(), tipo);
    }
    const msg = encodeURIComponent(
      tipo === "turista"
        ? `Hola, soy ${name} (${phone}). Vengo del chat de Hoteles de Venezuela y quisiera más información.`
        : `Hola, soy ${name} (${phone}), propietario. Vengo del chat de HDV y quisiera registrar mi establecimiento.`
    );
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
  }

  const isFormValid = name.trim().length > 0 && phone.trim().length > 0;



  /* ─────────── RENDER ─────────── */
  return (
    <>
      {/* ── Floating buttons ── */}
      <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-2.5">
        {/* WhatsApp button */}
        <div className="relative flex items-center justify-center">
          {panel !== "wa" && (
            <>
              <span className="absolute w-12 h-12 rounded-full animate-ping opacity-40"
                style={{ background: "#25D366", animationDuration: "2s", animationDelay: "0.3s" }} />
              <span className="absolute w-12 h-12 rounded-full animate-ping opacity-20"
                style={{ background: "#25D366", animationDuration: "2s", animationDelay: "0.9s" }} />
            </>
          )}
          <button
            onClick={() => panel === "wa" ? setPanel(null) : open("wa")}
            title="WhatsApp"
            className="relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer"
            style={{ background: panel === "wa" ? "#128C7E" : "#25D366" }}>
            <WaIcon />
          </button>
        </div>

        {/* Chat button */}
        <div className="relative flex items-center justify-center">
          {panel !== "chat" && (
            <>
              <span className="absolute w-14 h-14 rounded-full animate-ping opacity-50"
                style={{ background: "#FF0096", animationDuration: "1.8s" }} />
              <span className="absolute w-14 h-14 rounded-full animate-ping opacity-25"
                style={{ background: "#9B00CC", animationDuration: "1.8s", animationDelay: "0.6s" }} />
            </>
          )}
          <button
            onClick={() => panel === "chat" ? setPanel(null) : open("chat")}
            title="Chat"
            className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
            style={{ background: panel === "chat" ? "#7C3AED" : "linear-gradient(135deg, #FF0096, #9B00CC)" }}>
            {panel === "chat" ? <ChevronDown className="w-7 h-7 text-white" /> : <MessageCircle className="w-7 h-7 text-white" />}
          </button>
        </div>
      </div>

      {/* ── WhatsApp panel ── */}
      {panel === "wa" && (
        <FloatPanel title="WhatsApp" subtitle="Responde en minutos" onClose={() => setPanel(null)} accent="#25D366">
          {step === "form" ? (
            <PreForm
              target="wa"
              name={name}
              setName={setName}
              phone={phone}
              setPhone={setPhone}
              tipo={tipo}
              setTipo={setTipo}
              submitForm={submitForm}
              isFormValid={isFormValid}
            />
          ) : (
            <div className="p-5 text-center space-y-4">
              <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center" style={{ background: "#f0fdf4" }}>
                <WaIcon size={28} />
              </div>
              <p className="text-sm font-medium text-gray-800">¡Listo, {name.split(" ")[0]}! 🎉</p>
              <p className="text-xs text-gray-500">Se abrió WhatsApp con un mensaje personalizado. Si no se abrió automáticamente:</p>
              <button onClick={continueWa}
                className="w-full py-3.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                style={{ background: "#25D366" }}>
                <WaIcon /> Abrir WhatsApp de nuevo
              </button>
              <button onClick={() => { setStep("form"); setWaDone(false); }}
                className="w-full py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-50 cursor-pointer">
                Cambiar mis datos
              </button>
            </div>
          )}
        </FloatPanel>
      )}

      {/* ── Chat panel ── */}
      {panel === "chat" && (
        <FloatPanel title={`Chat HDV${name ? ` · ${name.split(" ")[0]}` : ""}`}
          subtitle={name ? `${tipo === "turista" ? "🌴 Turista" : "🏨 Propietario"} · En línea` : "Asistente virtual"}
          onClose={() => setPanel(null)} accent="#FF0096">
          {step === "form" ? (
            <PreForm
              target="chat"
              name={name}
              setName={setName}
              phone={phone}
              setPhone={setPhone}
              tipo={tipo}
              setTipo={setTipo}
              submitForm={submitForm}
              isFormValid={isFormValid}
            />
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-gray-50 flex flex-col" style={{ minHeight: 0 }}>
                {msgs.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs whitespace-pre-line leading-relaxed text-left ${
                      m.role === "user" ? "text-white rounded-br-sm shadow-xs" : "bg-white text-gray-700 rounded-bl-sm shadow-xs border border-slate-100"
                    }`} style={m.role === "user" ? { background: "linear-gradient(135deg, #FF0096, #9B00CC)" } : {}}>
                      {m.text}
                      <div className={`text-[9px] mt-1 ${m.role === "user" ? "text-white/60 text-right" : "text-gray-400"}`}>{m.ts}</div>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-xs border border-slate-100 flex gap-1 items-center">
                      {[0,150,300].map(d => (
                        <span key={d} className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-100 space-y-2 bg-white shrink-0">
                <div className="flex gap-2">
                  <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 text-xs focus:outline-none px-3 py-2.5 border border-gray-200 rounded-xl focus:border-pink-300 bg-white font-semibold text-gray-700" />
                  <button onClick={sendMsg} disabled={!input.trim()}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40 shrink-0 cursor-pointer active:scale-95"
                    style={{ background: "linear-gradient(135deg, #FF0096, #9B00CC)" }}>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button onClick={continueWa}
                  className="w-full py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  style={{ background: "#25D366" }}>
                  <WaIcon size={14} /> Continuar por WhatsApp
                </button>
              </div>
            </>
          )}
        </FloatPanel>
      )}
    </>
  );
}

interface PreFormProps {
  target: "chat" | "wa";
  name: string;
  setName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  tipo: "turista" | "propietario";
  setTipo: (val: "turista" | "propietario") => void;
  submitForm: (target: "chat" | "wa") => void;
  isFormValid: boolean;
}

function PreForm({ target, name, setName, phone, setPhone, tipo, setTipo, submitForm, isFormValid }: PreFormProps) {
  return (
    <div className="p-5 space-y-4 flex-1 overflow-y-auto">
      <p className="text-sm text-gray-650 leading-relaxed text-left">
        {target === "wa"
          ? "Déjanos tus datos y te abrimos WhatsApp con un mensaje personalizado:"
          : "Antes de chatear, cuéntanos quién eres:"}
      </p>

      {/* Visitor type */}
      <div>
        <p className="text-xs text-gray-500 font-bold mb-2 text-left">Soy...</p>
        <div className="grid grid-cols-2 gap-2">
          {(["turista", "propietario"] as ("turista" | "propietario")[]).map(t => (
            <button key={t} onClick={() => setTipo(t)}
              className={`py-3 rounded-xl border-2 text-sm font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                tipo === t ? "border-pink-500 bg-pink-50 text-pink-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}>
              <span className="text-lg">{t === "turista" ? "🌴" : "🏨"}</span>
              <span className="capitalize">{t}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 font-bold mb-1.5 block text-left">Nombre *</label>
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-pink-400 bg-white">
          <User className="w-3.5 h-3.5 text-gray-300 shrink-0" />
          <input value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && isFormValid && submitForm(target)}
            placeholder="Tu nombre" className="flex-1 text-sm focus:outline-none bg-transparent" />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 font-bold mb-1.5 block text-left">Teléfono *</label>
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-pink-400 bg-white">
          <Phone className="w-3.5 h-3.5 text-gray-300 shrink-0" />
          <input value={phone} onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === "Enter" && isFormValid && submitForm(target)}
            placeholder="+58 412..." type="tel" className="flex-1 text-sm focus:outline-none bg-transparent" />
        </div>
      </div>

      <button onClick={() => submitForm(target)} disabled={!isFormValid}
        className="w-full py-3.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity cursor-pointer active:scale-98"
        style={{ background: target === "wa" ? "#25D366" : "linear-gradient(90deg, #FF0096, #9B00CC)" }}>
        {target === "wa"
          ? (<><WaIcon /> Abrir WhatsApp →</>)
          : "Iniciar chat →"}
      </button>

      <p className="text-[10px] text-gray-400 text-center">
        Tus datos son confidenciales. Solo los usamos para contactarte.
      </p>
    </div>
  );
}

/* ── Sub-components ── */
function FloatPanel({ title, subtitle, onClose, accent, children }: {
  title: string; subtitle: string; onClose: () => void; accent: string; children: React.ReactNode;
}) {
  return (
    <div className="fixed bottom-24 right-4 z-50 w-[340px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-100"
      style={{ maxHeight: "min(540px, calc(100vh - 110px))" }}>
      {/* Header */}
      <div className="px-4 py-3 text-white flex items-center gap-3 shrink-0"
        style={{ background: "linear-gradient(135deg, #1a0533, #2d0d5c)" }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `${accent}40` }}>
          <span className="text-sm">🇻🇪</span>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="font-semibold text-sm truncate">{title}</p>
          <p className="text-[10px] text-white/60">{subtitle}</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" title="En línea" />
        <button onClick={onClose} className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center ml-1 cursor-pointer">
          <X className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
      {/* Body */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function WaIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className="fill-white shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}
