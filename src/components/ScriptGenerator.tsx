import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { 
  Sparkles, Copy, Check, MessageSquare, Mail, 
  RefreshCw, AlertTriangle, ArrowRight, CheckCircle, 
  Award, Clock, Eye, ShieldCheck, HelpCircle
} from "lucide-react";

interface Establishment {
  id: number;
  name: string;
  slug: string;
  status: "pending" | "approved" | "rejected";
  category_name?: string;
  category_id?: number;
  destination_name?: string;
  destination_id?: number;
  membership_tier?: string;
  is_circuito_excelencia?: boolean;
}

interface ScriptGeneratorProps {
  establishments: Establishment[];
}

interface GeneratedResult {
  script: string;
  follow_up: string;
  sales_note: string;
  generated_by: string;
}

export function ScriptGenerator({ establishments }: ScriptGeneratorProps) {
  const [selectedEstId, setSelectedEstId] = useState<string>("");
  const [requestType, setRequestType] = useState<string>("precio");
  const [tone, setTone] = useState<string>("elegante");
  const [clientName, setClientName] = useState<string>("");
  const [clientNeed, setClientNeed] = useState<string>("");
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewFormat, setViewFormat] = useState<"whatsapp" | "email">("whatsapp");
  
  // Plantillas de base de datos para el fallback local
  const [dbTemplates, setDbTemplates] = useState<any[]>([]);

  // Cargar plantillas desde Supabase al iniciar
  useEffect(() => {
    async function loadTemplates() {
      try {
        const { data, error } = await supabase
          .from("script_templates")
          .select("*");
        if (data) {
          setDbTemplates(data);
        }
      } catch (err) {
        console.error("Error al cargar plantillas de base de datos:", err);
      }
    }
    loadTemplates();
  }, []);

  // Seleccionar automáticamente el primer hotel si está disponible
  useEffect(() => {
    if (establishments.length > 0 && !selectedEstId) {
      setSelectedEstId(establishments[0].id.toString());
    }
  }, [establishments, selectedEstId]);

  const selectedEst = establishments.find(e => e.id.toString() === selectedEstId);

  // Mapear membresía de base de datos a membresías del generador
  const getMappedMembership = (tier?: string): string => {
    if (!tier) return "basico";
    const cleanTier = tier.toLowerCase().trim();
    if (cleanTier === "premium" || cleanTier === "oro") return "premium";
    if (cleanTier === "imagen_corporativa" || cleanTier === "corporate_image") return "imagen_corporativa";
    if (cleanTier === "complejo_turistico" || cleanTier === "resort_complex" || cleanTier === "diamante") return "complejo_turistico";
    return "basico"; // basico, plata, etc.
  };

  const getMembershipLabel = (tier?: string): string => {
    const mapped = getMappedMembership(tier);
    switch (mapped) {
      case "premium": return "Socio Premium";
      case "imagen_corporativa": return "Socio Imagen Corporativa";
      case "complejo_turistico": return "Socio Complejo Turístico";
      default: return "Socio Básico";
    }
  };

  const getMembershipColorClass = (tier?: string): string => {
    const mapped = getMappedMembership(tier);
    switch (mapped) {
      case "premium": return "bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white";
      case "imagen_corporativa": return "bg-[#9B00CC] text-white";
      case "complejo_turistico": return "bg-[#00C8D4] text-slate-900";
      default: return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  // Simular pasos de carga para un efecto Wow Premium
  const startLoadingAnimations = async () => {
    setLoading(true);
    const steps = [
      "Analizando variables de solicitud...",
      "Sincronizando beneficios de membresía...",
      "Aplicando estructura relacional médica...",
      "Redactando guion de alta gama..."
    ];
    for (const step of steps) {
      setLoadingStep(step);
      await new Promise(r => setTimeout(r, 600));
    }
  };

  const handleGenerate = async () => {
    if (!selectedEst) {
      alert("Por favor seleccione un establecimiento.");
      return;
    }

    await startLoadingAnimations();

    const payload = {
      hotel_name: selectedEst.name,
      hotel_category: selectedEst.category_name || "Establecimiento de Excelencia",
      request_type: requestType,
      membership_tier: getMappedMembership(selectedEst.membership_tier),
      tone: tone,
      is_circuito_excelencia: !!selectedEst.is_circuito_excelencia,
      client_need: clientNeed
    };

    try {
      // Intentar llamar al Cloudflare Worker API
      // En desarrollo local puede estar en localhost:8787, en prod en la ruta relativa
      const apiHost = window.location.hostname === "localhost" ? "http://localhost:8787" : "";
      const res = await fetch(`${apiHost}/api/generate-script`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Worker request failed");
      }

      const data = await res.json() as any;
      
      // Personalizar el script inyectando el nombre del cliente si está definido
      let finalizedScript = data.script || "";
      if (clientName.trim()) {
        finalizedScript = finalizedScript.replace(/\[Cliente\]/g, clientName.trim());
      } else {
        finalizedScript = finalizedScript.replace(/\[Cliente\]/g, "huésped");
      }
      finalizedScript = finalizedScript
        .replace(/\[Hotel\]/g, selectedEst.name)
        .replace(/\[Categoria\]/g, selectedEst.category_name || "Establecimiento");

      setResult({
        script: finalizedScript,
        follow_up: data.follow_up || "Día 1: Realizar un seguimiento amistoso.",
        sales_note: data.sales_note || "Priorizar el trato directo.",
        generated_by: data.generated_by || "ia"
      });

    } catch (err) {
      console.warn("Fallo en la llamada a la API de IA en Cloudflare Worker. Iniciando Fallback Local con Supabase...", err);
      
      // FALLBACK LOCAL: Buscar en las plantillas cargadas de Supabase
      const mappedMembership = getMappedMembership(selectedEst.membership_tier);
      const template = dbTemplates.find(
        t => t.membership_tier === mappedMembership && t.request_type === requestType
      );

      // Si no se encuentra plantilla en Supabase, usar un esqueleto por defecto
      let baseStructure = template?.template_structure || "";
      let followUp = template?.follow_up_suggestion || "Día 1: Seguimiento por WhatsApp.";
      let salesNote = template?.sales_note || "Priorizar la cotización formal.";

      if (!baseStructure) {
        // Fallback duro en caso de que Supabase tampoco tenga datos
        baseStructure = `Estimado [Cliente],\n\nMuchas gracias por su comunicación con [Hotel]. Nos encantaría poder asistirle en nuestro [Categoria].\n\nCon el fin de personalizar su cotización, ¿nos podría indicar la fecha prevista de su estadía y el número de huéspedes?\n\nAl reservar directamente en nuestro canal de reserva directa de Hoteles de Venezuela, usted accede al beneficio de comisión cero, asegurando la mejor tarifa disponible y atención personalizada.\n\nQuedamos a su servicio. ¿Qué fechas tiene pensadas?`;
      }

      // Procesar e interpolar variables del fallback local
      let processedScript = baseStructure;
      
      // Mención especial del Circuito de la Excelencia si el hotel lo posee
      if (selectedEst.is_circuito_excelencia) {
        const excelsaMencion = "\n\nComo miembros distinguidos del prestigioso Circuito de la Excelencia, nos enorgullece brindarle una hospitalidad certificada con los más altos estándares de calidad de nuestro país.";
        // Inyectar después del agradecimiento (primer párrafo)
        const paragraphs = processedScript.split('\n\n');
        if (paragraphs.length > 0) {
          paragraphs[0] = paragraphs[0] + excelsaMencion;
          processedScript = paragraphs.join('\n\n');
        }
      }

      if (clientName.trim()) {
        processedScript = processedScript.replace(/\[Cliente\]/g, clientName.trim());
      } else {
        processedScript = processedScript.replace(/\[Cliente\]/g, "huésped");
      }
      processedScript = processedScript
        .replace(/\[Hotel\]/g, selectedEst.name)
        .replace(/\[Categoria\]/g, selectedEst.category_name || "Establecimiento");

      setResult({
        script: processedScript,
        follow_up: followUp,
        sales_note: salesNote,
        generated_by: "local_database_fallback"
      });
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const handleCopy = () => {
    if (!result) return;
    
    // Si es formato WhatsApp, podemos formatear el texto aplicando negritas de WhatsApp
    let textToCopy = result.script;
    if (viewFormat === "whatsapp") {
      // Reemplazar saltos de línea y formatear títulos cortos en negrita si los hay
      // Pero por lo general el texto ya viene listo
    }
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10 pb-16 font-sans">
      
      {/* Tarjeta de Entrada de Configuración del Generador */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#00C8D4]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FF0096]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
          <div className="w-10 h-10 bg-[#00C8D4]/10 rounded-2xl flex items-center justify-center border border-[#00C8D4]/25 shrink-0">
            <Sparkles className="w-5 h-5 text-[#00C8D4]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Generador de Respuestas Inteligentes</h2>
            <p className="text-xs text-slate-500 mt-0.5">Diseña guiones de ventas de alta conversión adaptados a tu hotel y tu membresía.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LADO IZQUIERDO: SELECCIÓN DE HOTEL Y DETALLES */}
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Selecciona tu Establecimiento</label>
              {establishments.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-3 rounded-2xl flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>Primero debes registrar un establecimiento para poder generar guiones de venta.</span>
                </div>
              ) : (
                <select 
                  value={selectedEstId}
                  onChange={(e) => setSelectedEstId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#00C8D4] focus:ring-1 focus:ring-[#00C8D4]/20 transition-all cursor-pointer"
                >
                  {establishments.map(est => (
                    <option key={est.id} value={est.id}>{est.name}</option>
                  ))}
                </select>
              )}
            </div>

            {selectedEst && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3.5">
                <span className="block text-[9px] uppercase font-black text-slate-400 tracking-widest">Información Detectada del Hotel</span>
                
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${getMembershipColorClass(selectedEst.membership_tier)}`}>
                    {getMembershipLabel(selectedEst.membership_tier)}
                  </span>
                  
                  {selectedEst.is_circuito_excelencia && (
                    <span className="inline-flex items-center gap-1 bg-[#1a0533] text-white border border-[#9B00CC]/20 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">
                      <Award className="w-3.5 h-3.5 text-[#00C8D4]" />
                      <span>Circuito Excelencia</span>
                    </span>
                  )}

                  {selectedEst.category_name && (
                    <span className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">
                      {selectedEst.category_name}
                    </span>
                  )}
                </div>
                
                <p className="text-[10px] text-slate-400 leading-normal">
                  * La membresía e institucionalidad influyen directamente en la estructura de beneficios que el guion destacará de forma persuasiva.
                </p>
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Nombre del Cliente / Huésped (Opcional)</label>
              <input 
                type="text" 
                placeholder="Ej: Carlos Mendoza"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs text-slate-700 focus:outline-none focus:border-[#00C8D4] focus:ring-1 focus:ring-[#00C8D4]/20 transition-all"
              />
            </div>

          </div>

          {/* LADO DERECHO: PARÁMETROS DEL GUION */}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Tipo de Solicitud</label>
                <select 
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#00C8D4] focus:ring-1 focus:ring-[#00C8D4]/20 transition-all cursor-pointer"
                >
                  <option value="precio">💵 Consulta de Precio</option>
                  <option value="disponibilidad">🔑 Disponibilidad</option>
                  <option value="servicios">🏊 Servicios y Amenidades</option>
                  <option value="fotos">📸 Petición de Fotos / Galería</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Tono de la Respuesta</label>
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#00C8D4] focus:ring-1 focus:ring-[#00C8D4]/20 transition-all cursor-pointer"
                >
                  <option value="elegante">✨ Elegante (Recomendado)</option>
                  <option value="sobrio">👔 Sobrio / Corporativo</option>
                  <option value="institucional">🏛️ Institucional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Detalle o Necesidad del Cliente (Opcional)</label>
              <textarea 
                rows={4}
                value={clientNeed}
                onChange={(e) => setClientNeed(e.target.value)}
                placeholder="Ej: Viaja con un perro mediano, pregunta si el Wi-Fi llega a la playa y tarifa de fin de semana..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-700 focus:outline-none focus:border-[#00C8D4] focus:ring-1 focus:ring-[#00C8D4]/20 transition-all resize-none leading-relaxed"
              />
            </div>

            <div className="pt-2">
              <button 
                onClick={handleGenerate}
                disabled={loading || establishments.length === 0}
                className="w-full bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white hover:opacity-95 active:scale-98 transition-all px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FF0096]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Generando Guion... ({loadingStep})</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#00C8D4] animate-pulse" />
                    <span>Generar Guion de Ventas Persuasivo</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* --- PANEL DE RESULTADOS (SOLO SI SE HA GENERADO UN GUION) --- */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
          
          {/* COLUMNA IZQUIERDA: EL GUION GENERADO (2/3 de ancho) */}
          <div className="lg:col-span-2 bg-[#0e011f] border border-[#9B00CC]/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
            
            {/* Header de Visualización del Guion */}
            <div className="bg-[#1a0533] px-5 py-4 border-b border-[#9B00CC]/15 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#FF0096] to-[#9B00CC] flex items-center justify-center text-white font-bold text-xs">
                  {selectedEst?.name.substring(0, 2).toUpperCase() || "HDV"}
                </div>
                <div>
                  <span className="text-white font-bold text-xs block leading-tight">{selectedEst?.name}</span>
                  <span className="text-[10px] text-[#00C8D4] font-semibold">Respuesta Estructurada</span>
                </div>
              </div>

              {/* Botón de Formato (WhatsApp vs Email) */}
              <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
                <button 
                  onClick={() => setViewFormat("whatsapp")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                    viewFormat === "whatsapp" 
                      ? "bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/25" 
                      : "text-slate-400 hover:text-white border border-transparent"
                  }`}
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>WhatsApp</span>
                </button>
                <button 
                  onClick={() => setViewFormat("email")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                    viewFormat === "email" 
                      ? "bg-[#00C8D4]/10 text-[#00C8D4] border border-[#00C8D4]/25" 
                      : "text-slate-400 hover:text-white border border-transparent"
                  }`}
                >
                  <Mail className="w-3 h-3" />
                  <span>Email</span>
                </button>
              </div>
            </div>

            {/* Caja de Texto del Guion */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#090014] text-slate-300 relative text-xs md:text-sm leading-relaxed whitespace-pre-wrap select-all">
              {viewFormat === "email" && (
                <div className="border-b border-white/10 pb-4 mb-4 font-mono text-[10px] text-slate-400">
                  <span className="font-bold text-[#FF0096]">Asunto Recomendado:</span> Consulta sobre su estadía en {selectedEst?.name} - Atención Directa Garantizada
                </div>
              )}
              {result.script}
            </div>

            {/* Barra de Acciones del Guion */}
            <div className="bg-[#1a0533] px-5 py-4 border-t border-[#9B00CC]/15 flex items-center justify-between flex-shrink-0">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Modo: {result.generated_by === "ia" ? "🤖 Inteligencia Artificial" : "⚙️ Plantilla del Directorio"}
              </span>
              
              <button 
                onClick={handleCopy}
                className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 transition-all px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer active:scale-97"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#FF0096]" />
                    <span>Copiar Guion</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* COLUMNA DERECHA: ESTRATEGIA DE SEGUIMIENTO (1/3 de ancho) */}
          <div className="space-y-6">
            
            {/* Tarjeta de Seguimiento */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 bg-[#00C8D4]/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-[#00C8D4]/10 rounded-lg flex items-center justify-center border border-[#00C8D4]/20">
                  <Clock className="w-4 h-4 text-[#00C8D4]" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Sugerencia de Seguimiento</h3>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-black text-[#FF0096] bg-[#FF0096]/5 px-2 py-0.5 rounded border border-[#FF0096]/15">
                    Planificación
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Método de Venta</span>
                </div>
                
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  {result.follow_up}
                </p>
              </div>

              <p className="text-[10px] text-slate-400 leading-normal mt-4">
                * Realizar un seguimiento a tiempo de forma no intrusiva duplica la conversión de consultas a reservas garantizadas.
              </p>
            </div>

            {/* Tarjeta de Nota Comercial */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 bg-[#9B00CC]/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-[#9B00CC]/10 rounded-lg flex items-center justify-center border border-[#9B00CC]/20">
                  <ShieldCheck className="w-4 h-4 text-[#9B00CC]" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Objetivo del Guion</h3>
              </div>

              <div className="bg-[#1a0533]/5 border border-[#9B00CC]/5 rounded-2xl p-4 space-y-2">
                <span className="block text-[9px] uppercase font-black text-[#9B00CC] tracking-widest">Enfoque Comercial</span>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                  {result.sales_note}
                </p>
              </div>

              <p className="text-[10px] text-slate-400 leading-normal mt-4">
                * Mantener la postura de <b>Sincronizador Tecnológico</b> incrementa la autoridad comercial del gerente del hotel.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* --- SECCIÓN DE CIERRE (BOTTOM CTA) --- */}
      <div className="bg-gradient-to-br from-[#FF0096] to-[#9B00CC] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-[#FF0096]/10">
        {/* Luces decorativas */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#00C8D4]/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black bg-white/20 text-white uppercase tracking-wider mb-3">
              <Award className="w-3 h-3 text-[#00C8D4]" />
              <span>Soporte Técnico de Conversión</span>
            </span>
            <h3 className="text-xl font-bold tracking-tight text-white font-serif">
              ¿Quieres optimizar tu tasa de cierre en WhatsApp?
            </h3>
            <p className="text-xs text-white/80 mt-1.5 leading-relaxed">
              Contacta con nuestro equipo de soporte corporativo B2B de Hoteles de Venezuela para recibir una consultoría de marketing conversacional personalizada y mejorar tus resultados.
            </p>
          </div>
          
          <a 
            href="https://wa.me/584242734537?text=Hola,%20quisiera%20recibir%20asesoria%20para%20mejorar%20las%20ventas%20de%20mi%20hotel%20miembro"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto bg-white hover:bg-slate-100 text-[#FF0096] hover:scale-102 transition-all px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-black/10 cursor-pointer"
          >
            {/* SVG de WhatsApp oficial unicolor magenta */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.381 9.805-9.768.002-2.612-1.012-5.066-2.856-6.912C16.378 2.079 13.927.95 11.312.95c-5.41 0-9.811 4.382-9.815 9.771-.002 1.799.487 3.553 1.42 5.12L1.886 20.89l5.35-1.4c1.55.882 3.11 1.322 4.411 1.324zM16.967 13.8c-.287-.143-1.696-.837-1.958-.933-.263-.096-.454-.143-.646.143-.191.286-.74.933-.907 1.12-.168.19-.335.213-.622.072-.287-.143-1.21-.447-2.306-1.427-.852-.76-1.427-1.7-1.594-1.986-.168-.287-.018-.442.126-.583.13-.127.287-.335.43-.502.143-.167.191-.287.287-.478.096-.19.048-.358-.024-.502-.072-.143-.646-1.555-.885-2.127-.233-.562-.47-.486-.646-.496-.167-.008-.359-.01-.55-.01s-.502.072-.765.307c-.263.234-1.004.981-1.004 2.392 0 1.41 1.028 2.77 1.171 2.962.143.192 2.024 3.09 4.903 4.33.685.295 1.219.471 1.636.6.688.22 1.313.19 1.808.116.55-.082 1.696-.693 1.936-1.361.24-.668.24-1.242.168-1.36-.072-.12-.263-.19-.55-.333z" />
            </svg>
            <span>Consultar por WhatsApp</span>
          </a>
        </div>
      </div>

    </div>
  );
}
