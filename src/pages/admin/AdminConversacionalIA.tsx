import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Bot, 
  Sparkles, 
  Calendar, 
  Send, 
  Briefcase, 
  UserCheck, 
  ShieldCheck,
  CheckCircle,
  Clock,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Check,
  CheckCheck
} from "lucide-react";

// --- TIPADOS DE TYPESCRIPT ---
interface AIAgentConfig {
  id?: string;
  name: string;
  persona: string;
  model_name: string;
  is_active: boolean;
}

interface TimeSchedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_enabled: boolean;
}

interface ChatMessage {
  id: string;
  sender: "user" | "model";
  content: string;
  timestamp: string;
  status?: "sending" | "sent" | "read";
}

const DAYS_OF_WEEK = [
  "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"
];

export default function AdminConversacionalIA() {
  const [activeTab, setActiveTab] = useState<"persona" | "membresias" | "horarios" | "playground">("persona");
  const [loading, setLoading] = useState(false);
  
  // Estado 1: Persona del Bot
  const [agentConfig, setAgentConfig] = useState<AIAgentConfig>({
    name: "Asistente Hoteles de Venezuela",
    persona: "Eres el asistente virtual supreme de nuestro hotel. Tu objetivo es cerrar reservas directas y sin comisiones intermedias. Saluda cordialmente, destaca la hospitalidad local y sé sumamente persuasivo.",
    model_name: "gemini-1.5-flash",
    is_active: true
  });

  // Estado 2: Horarios Operativos
  const [schedules, setSchedules] = useState<TimeSchedule[]>(
    Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i,
      start_time: "08:00",
      end_time: "22:00",
      is_enabled: true
    }))
  );

  // Estado 3: Playground / Chat interactivo
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: "welcome-msg",
      sender: "model", 
      content: "¡Hola! Soy tu IA configurada. ¿En qué puedo ayudarte a gestionar tu reserva directa hoy?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "read"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- LÓGICA DE PERSISTENCIA (SUPABASE) ---
  const saveAgentPersona = async () => {
    setLoading(true);
    try {
      // Nota: Aquí mapeas el hotel_id real de tu sesión o contexto
      const { error } = await supabase
        .from("ai_agents")
        .upsert({ 
          name: agentConfig.name,
          persona: agentConfig.persona,
          model_name: agentConfig.model_name,
          is_active: agentConfig.is_active,
          hotel_id: "tu-uuid-de-hotel-aqui" 
        });

      if (error) throw error;
      alert("¡Configuración de Persona guardada en Supabase con éxito! 🚀");
    } catch (err: any) {
      console.error("Error al guardar en Supabase:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- SIMULACIÓN DEL CHAT DE PRUEBA (CONEXIÓN DIRECTA GOOGLE PRO) ---
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsgId = `msg-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    
    // 1. Agregar mensaje del usuario en estado 'sending'
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      content: text,
      timestamp,
      status: "sending"
    };
    
    setMessages(prev => [...prev, newMsg]);
    if (textToSend === undefined) {
      setInputMessage("");
    }

    // Simular el proceso de envío
    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => m.id === userMsgId ? { ...m, status: "sent" } : m)
      );
    }, 300);

    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => m.id === userMsgId ? { ...m, status: "read" } : m)
      );
      setIsLoading(true);
    }, 600);

    // 2. Simular la respuesta de la IA basada en la Persona y Nombre configurado
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let responseText = "";

      // Generador de respuestas dinámicas simuladas con la Persona
      if (lowerText.includes("precio") || lowerText.includes("tarifa") || lowerText.includes("costo") || lowerText.includes("habitación") || lowerText.includes("habitacion") || lowerText.includes("cuanto cuesta")) {
        responseText = `¡Hola! Como asistente virtual de ${agentConfig.name || "nuestro hotel"}, es un placer informarte. Al reservar directo con nosotros te garantizamos el 0% de comisiones intermedias. Disponemos de hermosas habitaciones equipadas y adaptadas a tu presupuesto. ¿Para qué fechas deseas cotizar?`;
      } else if (lowerText.includes("reserva") || lowerText.includes("cómo reservo") || lowerText.includes("como reservo") || lowerText.includes("reservar")) {
        responseText = `¡Excelente elección! Reservar directo es facilísimo y sin intermediarios. Solo dime qué fechas tienes planeadas y cuántas personas te acompañan. Te generaré la propuesta con nuestra garantía de tarifa directa libre de recargos de OTAs.`;
      } else if (lowerText.includes("wifi") || lowerText.includes("piscina") || lowerText.includes("servicio") || lowerText.includes("playa") || lowerText.includes("desayuno") || lowerText.includes("estacionamiento")) {
        responseText = `¡Claro que sí! Contamos con excelentes servicios para hacer tu estadía inolvidable. Respecto a tu consulta, ofrecemos servicios de primer nivel (como conectividad WiFi de alta velocidad, áreas recreativas y desayuno local). Todo esto coordinado bajo la directriz: "${agentConfig.persona.slice(0, 100)}..."`;
      } else if (lowerText.includes("hola") || lowerText.includes("buenas") || lowerText.includes("saludos") || lowerText.includes("buenos días")) {
        responseText = `¡Hola! Un gusto saludarte. Soy ${agentConfig.name}, tu asistente automatizado. Estoy listo para ayudarte a coordinar tu hospedaje ideal directamente, garantizando la hospitalidad venezolana y el mejor trato directo. ¿Cómo te puedo ayudar hoy?`;
      } else {
        responseText = `Entendido perfectamente. Siguiendo mis instrucciones de asistencia ("${agentConfig.persona.slice(0, 120)}..."), te reitero que nuestro canal directo es 100% libre de comisiones externas. ¿Hay alguna solicitud especial o duda específica de tu hospedaje que pueda aclarar en este momento?`;
      }

      const responseMsg: ChatMessage = {
        id: `msg-model-${Date.now()}`,
        sender: "model",
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "read"
      };

      setMessages(prev => [...prev, responseMsg]);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-cyan-950 text-[#e2e8f0] p-6 font-sans">
      {/* Encabezado del Módulo */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Bot className="text-cyan-400 h-7 w-7 animate-pulse" /> Módulo de IA Conversacional Multi-tenant
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1">
            Configura agentes independientes, tramos operativos y esquemas comerciales de reserva directa.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold text-cyan-400">Google AI Pro Conectado</span>
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <div className="flex gap-2 border-b border-white/10 mb-6">
        <button
          onClick={() => setActiveTab("persona")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "persona" ? "border-cyan-400 text-cyan-400 bg-cyan-500/5" : "border-transparent text-white/40 hover:text-white"
          }`}
        >
          <Sparkles className="h-4 w-4 text-fuchsia-400" /> Persona del Bot
        </button>
        <button
          onClick={() => setActiveTab("membresias")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "membresias" ? "border-cyan-400 text-cyan-400 bg-cyan-500/5" : "border-transparent text-white/40 hover:text-white"
          }`}
        >
          <Briefcase className="h-4 w-4 text-violet-400" /> Membresía Directa
        </button>
        <button
          onClick={() => setActiveTab("horarios")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "horarios" ? "border-cyan-400 text-cyan-400 bg-cyan-500/5" : "border-transparent text-white/40 hover:text-white"
          }`}
        >
          <Calendar className="h-4 w-4 text-blue-400" /> Tramos Horarios
        </button>
        <button
          onClick={() => setActiveTab("playground")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "playground" ? "border-cyan-400 text-cyan-400 bg-cyan-500/5" : "border-transparent text-white/40 hover:text-white"
          }`}
        >
          <Bot className="h-4 w-4 text-cyan-400" /> Playground (Pruebas)
        </button>
      </div>

      {/* --- CONTENIDO DE LAS PESTAÑAS --- */}
      <div className="bg-gradient-to-r from-fuchsia-500/5 to-cyan-500/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* PESTAÑA 1: PERSONA */}
        {activeTab === "persona" && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">Identidad y Comportamiento Relacional</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase mb-2">Nombre Comercial del Agente</label>
                <input 
                  type="text" 
                  value={agentConfig.name}
                  onChange={(e) => setAgentConfig({...agentConfig, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase mb-2">Modelo de Inteligencia Artificial</label>
                <select 
                  value={agentConfig.model_name}
                  onChange={(e) => setAgentConfig({...agentConfig, model_name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20"
                >
                  <option className="bg-[#181226]" value="gemini-1.5-flash">Gemini 1.5 Flash (Velocidad Suprema)</option>
                  <option className="bg-[#181226]" value="gemini-1.5-pro">Gemini 1.5 Pro (Razonamiento Complejo)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase mb-2">Persona e Instrucciones del Sistema (System Prompt)</label>
              <textarea 
                rows={6}
                value={agentConfig.persona}
                onChange={(e) => setAgentConfig({...agentConfig, persona: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 resize-none leading-relaxed text-sm"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button 
                onClick={saveAgentPersona}
                disabled={loading}
                className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 hover:opacity-90 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-lg shadow-fuchsia-950/20 cursor-pointer"
              >
                {loading ? "Guardando..." : "Guardar Identidad"}
              </button>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: MEMBRESÍAS (COMISIÓN CERO) */}
        {activeTab === "membresias" && (
          <div className="space-y-6">
            <div className="border-l-4 border-cyan-500 bg-cyan-500/10 p-4 rounded-r-lg">
              <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-cyan-400" /> Filosofía de Negocio: Canal de Venta Directo
              </h3>
              <p className="text-xs text-[#cbd5e1] mt-1 leading-relaxed">
                Este módulo opera bajo el pilar de comisiones al 0%. Los hoteles independientes no pagan intermediación; su acceso se valida a través de la suscripción central de Hoteles de Venezuela.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-cyan-500/20 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full font-bold">Activo</div>
                <h4 className="font-bold text-white text-base">Plan Aliado Fundador</h4>
                <p className="text-xs text-white/50 mt-2">Módulo conversacional desbloqueado de forma vitalicia para los primeros 50 hoteles emblemáticos.</p>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white font-medium">
                  <span>Comisión por Reserva:</span>
                  <span className="text-cyan-400 font-bold text-sm">0% Directo</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: HORARIOS OPERATIVOS */}
        {activeTab === "horarios" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">Tramos Horarios de Atención Automatizada</h2>
            <p className="text-xs text-white/50">Define en qué momentos la IA se encargará de interceptar y responder las dudas de los huéspedes de forma autónoma.</p>
            <div className="divide-y divide-white/5 mt-2">
              {schedules.map((sched, idx) => (
                <div key={idx} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={sched.is_enabled}
                      onChange={(e) => {
                        const updated = [...schedules];
                        updated[idx].is_enabled = e.target.checked;
                        setSchedules(updated);
                      }}
                      className="h-4 w-4 accent-cyan-400 bg-white/5 border-white/10 rounded"
                    />
                    <span className="text-sm font-semibold text-white w-24">{DAYS_OF_WEEK[sched.day_of_week]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-[#94a3b8]" />
                    <input 
                      type="time" 
                      value={sched.start_time}
                      disabled={!sched.is_enabled}
                      onChange={(e) => {
                        const updated = [...schedules];
                        updated[idx].start_time = e.target.value;
                        setSchedules(updated);
                      }}
                      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none disabled:opacity-40"
                    />
                    <span className="text-xs text-white/40">hasta</span>
                    <input 
                      type="time" 
                      value={sched.end_time}
                      disabled={!sched.is_enabled}
                      onChange={(e) => {
                        const updated = [...schedules];
                        updated[idx].end_time = e.target.value;
                        setSchedules(updated);
                      }}
                      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none disabled:opacity-40"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA 4: PLAYGROUND (ENTORNO DE PRUEBAS) */}
        {activeTab === "playground" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Bot className="text-cyan-400 h-5 w-5 animate-pulse" /> Playground Interactivo
              </h2>
              <span className="text-xs text-[#94a3b8] italic">Simula la conversación de un turista con tu bot de WhatsApp</span>
            </div>

            {/* Simulación del Teléfono / Interfaz WhatsApp */}
            <div className="max-w-2xl mx-auto border border-white/10 rounded-2xl overflow-hidden bg-black/40 backdrop-blur-md shadow-2xl flex flex-col h-[520px]">
              
              {/* WhatsApp Header */}
              <div className="bg-gradient-to-r from-purple-900/40 via-indigo-950/40 to-cyan-900/40 px-4 py-3 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-fuchsia-500 to-cyan-500 border border-white/15 flex items-center justify-center text-white font-bold text-sm tracking-wider">
                      {agentConfig.name ? agentConfig.name.substring(0, 2).toUpperCase() : "IA"}
                    </div>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-cyan-400 border-2 border-[#181226] animate-pulse" />
                  </div>
                  {/* Bot Info */}
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white leading-tight">
                      {agentConfig.name}
                    </span>
                    <span className="text-xs text-white/50 flex items-center gap-1">
                      {isLoading ? (
                        <span className="text-cyan-400 font-medium animate-pulse">escribiendo...</span>
                      ) : (
                        "En línea"
                      )}
                    </span>
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-4 text-white/60">
                  <button className="hover:text-white transition-colors" title="Llamada de Video (Simulada)">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="hover:text-white transition-colors" title="Llamada de Voz (Simulada)">
                    <Phone className="h-4 w-4" />
                  </button>
                  <div className="h-5 w-[1px] bg-white/10" />
                  <button className="hover:text-white transition-colors">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Chat Messages Container */}
              <div 
                className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col bg-gradient-to-b from-[#0b0c15] via-[#05060b] to-[#0c0f1d] relative"
                style={{
                  backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
                  backgroundSize: "20px 20px"
                }}
              >
                {/* Info Note Banner inside chat */}
                <div className="self-center bg-white/5 border border-white/5 text-cyan-300 text-[11px] px-3 py-1.5 rounded-lg text-center max-w-[85%]">
                  🔒 Las respuestas del asistente se generan en base a la pestaña <b>Persona del Bot</b>. Las tarifas simuladas no tienen comisiones intermedias.
                </div>

                {messages.map((msg) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div 
                      key={msg.id} 
                      className={`max-w-[75%] rounded-xl px-3 py-2 text-sm leading-relaxed relative flex flex-col ${
                        isUser 
                          ? "bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white self-end rounded-tr-none shadow-md shadow-fuchsia-950/20" 
                          : "bg-[#181326]/80 text-[#e9edef] self-start rounded-tl-none border border-purple-500/20 shadow-md shadow-purple-950/10"
                      }`}
                    >
                      <span className="pr-12 pb-2 block whitespace-pre-wrap">{msg.content}</span>
                      
                      {/* Meta (Time + Status Ticks) */}
                      <div className="absolute bottom-1 right-2 flex items-center gap-1 select-none">
                        <span className="text-[9px] text-white/40">{msg.timestamp}</span>
                        {isUser && (
                          <span>
                            {msg.status === "sending" && (
                              <Clock className="h-3 w-3 text-white/40" />
                            )}
                            {msg.status === "sent" && (
                              <Check className="h-3.5 w-3.5 text-white/40" />
                            )}
                            {msg.status === "read" && (
                              <CheckCheck className="h-3.5 w-3.5 text-cyan-400" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Simulated Typing Indicator */}
                {isLoading && (
                  <div className="bg-[#181326]/80 text-[#e9edef] self-start rounded-xl rounded-tl-none px-4 py-3 border border-purple-500/20 flex items-center gap-2 max-w-[75%] shadow-md shadow-purple-950/10">
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-white/40">El bot está redactando respuesta...</span>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Quick Chips suggestions bar */}
              <div className="bg-[#0f091a] px-4 py-2 border-t border-white/5 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-thin">
                <span className="text-[10px] uppercase font-bold text-white/40 mr-1 flex-shrink-0 select-none">Preguntar como Turista:</span>
                <button 
                  onClick={() => handleSendMessage("¿Hola, qué tal?")}
                  disabled={isLoading}
                  className="bg-white/5 hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-cyan-500 border border-white/10 text-white/70 hover:text-white transition-all text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 cursor-pointer disabled:opacity-50"
                >
                  👋 Saludo inicial
                </button>
                <button 
                  onClick={() => handleSendMessage("¿Qué precio tiene la habitación?")}
                  disabled={isLoading}
                  className="bg-white/5 hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-cyan-500 border border-white/10 text-white/70 hover:text-white transition-all text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 cursor-pointer disabled:opacity-50"
                >
                  💵 Tarifa y costos
                </button>
                <button 
                  onClick={() => handleSendMessage("¿Cómo realizo la reserva directa?")}
                  disabled={isLoading}
                  className="bg-white/5 hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-cyan-500 border border-white/10 text-white/70 hover:text-white transition-all text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 cursor-pointer disabled:opacity-50"
                >
                  🔑 Reservar directo
                </button>
                <button 
                  onClick={() => handleSendMessage("¿El hotel tiene wifi y piscina?")}
                  disabled={isLoading}
                  className="bg-white/5 hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-cyan-500 border border-white/10 text-white/70 hover:text-white transition-all text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 cursor-pointer disabled:opacity-50"
                >
                  🏊 Servicios activos
                </button>
              </div>

              {/* Input & Sending Action Area */}
              <div className="bg-[#181226] px-4 py-3 flex items-center gap-3 border-t border-white/10">
                <div className="flex gap-3 text-white/40">
                  <button className="hover:text-white transition-colors" title="Emojis (Simulado)">
                    <Smile className="h-6 w-6" />
                  </button>
                  <button className="hover:text-white transition-colors" title="Adjuntar (Simulado)">
                    <Paperclip className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={isLoading}
                    placeholder="Escribe un mensaje de prueba..."
                    className="w-full bg-white/5 text-[#e9edef] placeholder-white/20 rounded-xl px-4 py-2.5 text-sm border border-white/10 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30 disabled:opacity-60"
                  />
                </div>

                {inputMessage.trim() ? (
                  <button 
                    onClick={() => handleSendMessage()}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white p-2.5 rounded-full transition-all flex items-center justify-center shadow-lg shadow-fuchsia-500/20 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                ) : (
                  <button 
                    disabled={isLoading}
                    className="text-white/40 hover:text-white p-2.5 rounded-full transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}