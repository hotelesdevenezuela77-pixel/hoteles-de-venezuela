import { useState } from "react";
import { 
  Sparkles, Copy, Check, MessageSquare, Mail, 
  RefreshCw, AlertTriangle, ArrowRight, CheckCircle, 
  Award, Clock, Eye, ShieldCheck, HelpCircle
} from "lucide-react";

interface GeneratedResult {
  script: string;
  follow_up: string;
  sales_note: string;
  generated_by: string;
}

const CATEGORIES = [
  "Agencias de Viajes",
  "Alquiler de Carros",
  "Alquiler de Yates",
  "Complejos Turísticos",
  "Entertainment Corporation",
  "Farmacias",
  "Hoteles",
  "Marinas",
  "Markets",
  "Parques Nacionales",
  "Posadas",
  "Restaurantes",
  "Sitios Turísticos",
  "Otra categoría..."
];

export function B2BScriptGenerator() {
  const [campana, setCampana] = useState<string>("prestigio_2026");
  const [nombreNegocio, setNombreNegocio] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("Hoteles");
  const [otraCategoria, setOtraCategoria] = useState<string>("");
  const [escenario, setEscenario] = useState<string>("reservas");
  const [mensajeONecesidad, setMensajeONecesidad] = useState<string>("");
  const [tono, setTono] = useState<string>("persuasivo");
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewFormat, setViewFormat] = useState<"whatsapp" | "email">("whatsapp");

  // Pasos de carga premium
  const startLoadingAnimations = async () => {
    setLoading(true);
    const steps = [
      "Analizando sector y propuesta de valor...",
      "Sincronizando beneficios de la campaña...",
      "Estructurando pitch de ventas persuasivo...",
      "Redactando guion comercial de alto impacto..."
    ];
    for (const step of steps) {
      setLoadingStep(step);
      await new Promise(r => setTimeout(r, 600));
    }
  };

  const handleGenerate = async () => {
    if (!nombreNegocio.trim()) {
      alert("Por favor ingrese el nombre del negocio prospecto.");
      return;
    }

    await startLoadingAnimations();

    const selectedCategory = categoria === "Otra categoría..." ? otraCategoria : categoria;

    const payload = {
      is_b2b: true,
      campana,
      nombre_negocio: nombreNegocio,
      categoria: selectedCategory || "Aliado Estratégico",
      escenario,
      mensaje_o_necesidad: mensajeONecesidad,
      tono
    };

    try {
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
      
      setResult({
        script: data.script || "",
        follow_up: data.follow_up || "Día 1: Realizar un contacto de seguimiento.",
        sales_note: data.sales_note || "Priorizar el contacto directo.",
        generated_by: data.generated_by || "ia"
      });

    } catch (err) {
      console.warn("Fallo en la llamada a la API de IA en Cloudflare Worker. Iniciando Fallback Local B2B...", err);
      
      // Fallback local B2B
      // Simular la respuesta usando las plantillas construidas localmente
      const responseObj = generateLocalFallback(payload);
      
      setResult({
        script: responseObj.script,
        follow_up: responseObj.follow_up,
        sales_note: responseObj.sales_note,
        generated_by: "local_database_fallback_b2b"
      });
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const generateLocalFallback = (p: any) => {
    const { nombre_negocio, categoria, campana, escenario, tono } = p;
    let script = "";
    let follow_up = "";
    let sales_note = "";

    const cleanCategory = categoria || "establecimiento";
    const linkLanding = campana === "prestigio_2026" 
      ? "https://hotelesdevenezuela.com/prestigio-2026"
      : campana === "50_fundadores"
      ? "https://hotelesdevenezuela.com/50-fundadores"
      : "https://hotelesdevenezuela.com/alianzas-para-agencias";

    if (escenario === "reservas") {
      // Escenario A: Canal de Reservas / Atención al Cliente
      if (tono === "elegante") {
        script = `Estimado equipo de *${nombre_negocio}*,\n\nReciban un saludo de la más alta distinción de parte de la dirección de *Hoteles de Venezuela*.\n\nHemos estado evaluando su trayectoria y destacada presencia en el sector de *${cleanCategory}*. Por este motivo, su establecimiento ha sido preseleccionado para incorporarse a nuestras exclusivas iniciativas de posicionamiento y captación digital.\n\nCon el fin de hacerles llegar la invitación y propuesta comercial correspondiente, ¿serían tan amables de facilitarnos el contacto directo (teléfono o correo electrónico) del propietario, director general o encargado del área comercial?\n\nAgradecemos de antemano su gentil atención y colaboración.\n\nAtentamente,\n*Director Comercial B2B*\nHoteles de Venezuela`;
      } else if (tono === "corporativo" || tono === "sobrio") {
        script = `Estimado equipo de *${nombre_negocio}*,\n\nDe parte de la dirección de *Hoteles de Venezuela LLC*, les extendemos un saludo institucional.\n\nSu negocio ha sido seleccionado para participar en el programa de visibilidad digital y reservas directas en la categoría de *${cleanCategory}*, debido a sus altos estándares de calidad.\n\nPara canalizar esta información con la persona adecuada, solicitamos formalmente el contacto directo (teléfono o correo electrónico) del propietario, gerente general o encargado comercial de la empresa.\n\nQuedamos atento a su respuesta para formalizar el envío de la propuesta.\n\nSaludos cordiales,\n*Dirección Comercial B2B*\nHoteles de Venezuela`;
      } else { // persuasivo / por defecto
        script = `¡Hola! Un saludo de parte del equipo de *Hoteles de Venezuela*.\n\nHemos estado siguiendo de cerca el excelente trabajo de *${nombreNegocio}* en el sector de *${cleanCategory}*. Su perfil califica perfectamente para los beneficios de nuestra plataforma nacional de promoción turística.\n\nPara enviarles la invitación formal con los detalles de visibilidad y captación sin comisiones, ¿con quién del equipo directivo o del área comercial podríamos comunicarnos directamente? Si nos facilitan su número de teléfono o correo, nos pondremos en contacto a la brevedad.\n\n¡Muchas gracias y feliz día!\n*Equipo Comercial B2B*\nHoteles de Venezuela`;
      }
      follow_up = "Día 1: Enviar un recordatorio por WhatsApp consultando si pudieron leer el mensaje previo o si prefieren que contactemos por correo electrónico.";
      sales_note = "El objetivo exclusivo es conseguir el contacto directo (teléfono/email) del tomador de decisiones del establecimiento.";
    } else {
      // Escenario B: Contacto Directo con el Tomador de Decisiones
      let propuestaValores = "";
      if (campana === "prestigio_2026") {
        propuestaValores = "nuestro exclusivo *Índice de Prestigio y Distinción 2026*. Esta iniciativa busca reconocer a los establecimientos de alta gama del país, potenciando su posicionamiento de marca de alto nivel y el efecto tractor para atraer viajeros selectos.";
      } else if (campana === "50_fundadores") {
        propuestaValores = "nuestra *Campaña de los 50 Hoteles Fundadores*. Es un programa premium de cupo limitado que otorga a los miembros fundadores una posición VIP destacada de por vida, visibilidad prioritaria y herramientas de automatización exclusivas.";
      } else {
        propuestaValores = `nuestro programa de *Alianzas Comerciales para Prestadores de Servicios*. Esta iniciativa busca integrar a los mejores actores del sector de *${cleanCategory}* para complementar el ecosistema turístico, permitiéndoles recibir contactos directos y reservas de viajeros 100% libres de comisiones.`;
      }

      if (tono === "elegante") {
        script = `Estimado(a) director(a) de *${nombre_negocio}*,\n\nEs un honor saludarle de parte de *Hoteles de Venezuela*.\n\nLe contactamos para presentarle formalmente la propuesta de valor de ${propuestaValores}\n\nEstamos convencidos de que la excelencia de sus servicios en la categoría de *${cleanCategory}* añade un valor extraordinario a nuestra guía oficial. Formar parte de esta alianza le permitirá conectar directamente con nuestra audiencia de viajeros, impulsando su canal de reservas directas sin costos de intermediación.\n\nPuede conocer todos los beneficios detallados y formalizar su membresía en el siguiente enlace:\n👉 ${linkLanding}\n\n¿Cuándo dispondría de 5 minutos para una breve conversación sobre los detalles de esta postulación?\n\nAtentamente,\n*Director Comercial B2B*\nHoteles de Venezuela`;
      } else if (tono === "corporativo" || tono === "sobrio") {
        script = `Estimado(a) gerente de *${nombre_negocio}*,\n\nDe parte de *Hoteles de Venezuela LLC*, nos comunicamos para presentarle la propuesta comercial de ${propuestaValores}\n\nLa integración de su empresa dentro del sector de *${cleanCategory}* es un paso estratégico para nuestro directorio. Al unirse, accederá a un perfil corporativo verificado, integración con nuestro WhatsApp CRM y captación de clientes de forma directa y sin comisiones.\n\nPuede ver la propuesta técnica y costos en nuestra landing page oficial:\n👉 ${linkLanding}\n\nQuedamos a su disposición para coordinar una llamada de presentación técnica de 5 minutos esta semana.\n\nAtentamente,\n*Dirección Comercial B2B*\nHoteles de Venezuela`;
      } else { // persuasivo / por defecto
        script = `¡Hola! Qué gusto saludarte de parte de *Hoteles de Venezuela*.\n\nTe escribo para presentarle una gran oportunidad para *${nombre_negocio}* a través de ${propuestaValores}\n\nAl unirte a nuestra red de prestadores en la categoría de *${cleanCategory}*, tendrás una ficha comercial con prioridad de búsqueda, acceso a leads reales y la posibilidad de potenciar tus ventas sin pagar comisiones por reserva.\n\nPuedes revisar todos los detalles y testimonios de otros aliados en nuestra web oficial:\n👉 ${linkLanding}\n\n¿Te parece si agendamos una llamada de 5 minutos hoy o mañana para explicarte el funcionamiento y activar tu perfil?\n\n¡Un saludo!\n*Equipo Comercial B2B*\nHoteles de Venezuela`;
      }
      follow_up = "Día 3: Realizar una llamada o enviar un mensaje consultando si tuvo oportunidad de revisar el enlace de la propuesta y si prefiere coordinar una demo.";
      sales_note = "Enfocarse en cerrar la llamada o videollamada para demostrar la plataforma y concretar la afiliación.";
    }

    return { script, follow_up, sales_note };
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10 pb-16 font-sans">
      
      {/* Entrada de Parámetros B2B */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#00C8D4]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FF0096]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
          <div className="w-10 h-10 bg-[#00C8D4]/10 rounded-2xl flex items-center justify-center border border-[#00C8D4]/25 shrink-0">
            <Sparkles className="w-5 h-5 text-[#00C8D4]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Generador de Guiones Comerciales B2B</h2>
            <p className="text-xs text-slate-500 mt-0.5">Centro de captación y afiliación de nuevos socios y prestadores de servicios.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LADO IZQUIERDO: DETALLES DEL PROSPECTO */}
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Nombre del Negocio Prospecto</label>
              <input 
                type="text" 
                placeholder="Ej. Posada Ara Merú, Yate Marina Club..."
                value={nombreNegocio}
                onChange={(e) => setNombreNegocio(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs text-slate-700 font-bold focus:outline-none focus:border-[#00C8D4] focus:ring-1 focus:ring-[#00C8D4]/20 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Categoría Comercial</label>
                <select 
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#00C8D4] focus:ring-1 focus:ring-[#00C8D4]/20 transition-all cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Campaña Activa</label>
                <select 
                  value={campana}
                  onChange={(e) => setCampana(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#00C8D4] focus:ring-1 focus:ring-[#00C8D4]/20 transition-all cursor-pointer"
                >
                  <option value="prestigio_2026">🏆 Campaña Prestigio 2026</option>
                  <option value="50_fundadores">⭐️ Campaña 50 Fundadores</option>
                  <option value="alianzas_comerciales">🤝 Alianzas Comerciales</option>
                </select>
              </div>
            </div>

            {categoria === "Otra categoría..." && (
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Especifica la Categoría (Comodín)</label>
                <input 
                  type="text" 
                  placeholder="Ej. Centros de Buceo, Transporte..."
                  value={otraCategoria}
                  onChange={(e) => setOtraCategoria(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs text-slate-700 font-bold focus:outline-none focus:border-[#00C8D4] focus:ring-1 focus:ring-[#00C8D4]/20 transition-all"
                />
                <span className="block text-[9px] text-[#00C8D4] font-bold mt-1.5">
                  * El sistema integrará esta categoría personalizada como un aliado estratégico complementario para la plataforma.
                </span>
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Escenario de Contacto B2B</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex flex-col p-3 rounded-2xl border transition-all cursor-pointer ${
                  escenario === "reservas" 
                    ? "border-[#00C8D4] bg-[#00C8D4]/5 text-slate-900" 
                    : "border-slate-200 hover:border-slate-300 text-slate-500"
                }`}>
                  <input 
                    type="radio" 
                    name="escenario" 
                    value="reservas" 
                    checked={escenario === "reservas"}
                    onChange={() => setEscenario("reservas")}
                    className="sr-only"
                  />
                  <span className="text-[11px] font-black uppercase tracking-wider">Escenario A</span>
                  <span className="text-[9px] mt-0.5 leading-normal font-bold">Atención al Cliente / Reservas</span>
                </label>

                <label className={`flex flex-col p-3 rounded-2xl border transition-all cursor-pointer ${
                  escenario === "directo" 
                    ? "border-[#00C8D4] bg-[#00C8D4]/5 text-slate-900" 
                    : "border-slate-200 hover:border-slate-300 text-slate-500"
                }`}>
                  <input 
                    type="radio" 
                    name="escenario" 
                    value="directo" 
                    checked={escenario === "directo"}
                    onChange={() => setEscenario("directo")}
                    className="sr-only"
                  />
                  <span className="text-[11px] font-black uppercase tracking-wider">Escenario B</span>
                  <span className="text-[9px] mt-0.5 leading-normal font-bold">Contacto Directo con Decisor</span>
                </label>
              </div>
            </div>
          </div>

          {/* LADO DERECHO: CONTEXTO Y REDACCIÓN */}
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Tono de Captación</label>
                <select 
                  value={tono}
                  onChange={(e) => setTono(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#00C8D4] focus:ring-1 focus:ring-[#00C8D4]/20 transition-all cursor-pointer"
                >
                  <option value="persuasivo">🔥 Altamente Persuasivo</option>
                  <option value="elegante">✨ Distinguido & Elegante</option>
                  <option value="corporativo">💼 Sobrio / Corporativo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Estado, Objeción o Mensaje del Prospecto (Opcional)</label>
              <textarea 
                rows={5}
                value={mensajeONecesidad}
                onChange={(e) => setMensajeONecesidad(e.target.value)}
                placeholder="Ej. Indican que no les interesa pagar comisiones, o que ya tienen su propia página web..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-700 focus:outline-none focus:border-[#00C8D4] focus:ring-1 focus:ring-[#00C8D4]/20 transition-all resize-none leading-relaxed font-bold"
              />
            </div>

            <div className="pt-1">
              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white hover:opacity-95 active:scale-98 transition-all px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FF0096]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Generando Propuesta... ({loadingStep})</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#00C8D4] animate-pulse" />
                    <span>Generar Guion B2B de Alta Conversión</span>
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
            
            {/* Header del Guion */}
            <div className="px-6 py-4 bg-slate-950/40 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00C8D4]" />
                <span className="text-[10px] uppercase font-black tracking-widest text-[#00C8D4]">Guion Comercial B2B Generado</span>
              </div>
              
              <div className="flex bg-slate-900 border border-white/10 rounded-xl p-0.5">
                <button 
                  onClick={() => setViewFormat("whatsapp")}
                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    viewFormat === "whatsapp" 
                      ? "bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  WhatsApp
                </button>
                <button 
                  onClick={() => setViewFormat("email")}
                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    viewFormat === "email" 
                      ? "bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Email / Copia
                </button>
              </div>
            </div>

            {/* Texto del Guion */}
            <div className="p-6 flex-1 overflow-y-auto min-h-0 bg-gradient-to-b from-transparent to-slate-950/20">
              <pre className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap select-text selection:bg-[#FF0096]/30">
                {result.script}
              </pre>
            </div>

            {/* Footer con Acciones */}
            <div className="px-6 py-4 bg-slate-950/40 border-t border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00C8D4]" />
                <span>Generado mediante {result.generated_by === "ia" ? "Inteligencia Artificial B2B" : "Fallback Local B2B de Seguridad"}</span>
              </div>

              <button 
                onClick={handleCopy}
                className="bg-white hover:bg-slate-100 text-[#FF0096] px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Guion</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* COLUMNA DERECHA: SEGUIMIENTO Y OBJETIVOS COMERCIALES (1/3 de ancho) */}
          <div className="space-y-6">
            
            {/* Tarjeta de Sugerencia de Seguimiento */}
            <div className="bg-[#0e011f] border border-[#9B00CC]/20 rounded-3xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#9B00CC]/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                <div className="w-7 h-7 bg-[#FF0096]/20 rounded-xl flex items-center justify-center border border-[#FF0096]/30 shrink-0">
                  <Clock className="w-4 h-4 text-[#FF0096]" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Seguimiento B2B</h3>
                  <span className="text-[9px] text-[#FF0096] uppercase tracking-widest font-black">Plan de Conversión</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 border border-white/5 rounded-2xl p-4 font-bold">
                {result.follow_up}
              </p>
            </div>

            {/* Tarjeta de Objetivos y Notas de Venta */}
            <div className="bg-[#0e011f] border border-[#9B00CC]/20 rounded-3xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#00C8D4]/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                <div className="w-7 h-7 bg-[#00C8D4]/20 rounded-xl flex items-center justify-center border border-[#00C8D4]/30 shrink-0">
                  <Award className="w-4 h-4 text-[#00C8D4]" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Objetivo Comercial</h3>
                  <span className="text-[9px] text-[#00C8D4] uppercase tracking-widest font-black">Cierre de Alianza</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 border border-white/5 rounded-2xl p-4 font-bold">
                {result.sales_note}
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
