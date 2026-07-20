// @ts-nocheck
/**
 * Cloudflare Worker para Rate Limiting, Enrutamiento de Dominios Personalizados
 * y Caché de Assets de Cloudflare R2 de la plataforma SaaS Hoteles de Venezuela.
 */

export interface Env {
  // Enlace a la base de datos KV de Cloudflare para persistencia del rate limit
  RATE_LIMIT_KV: KVNamespace;
  // Enlace al Bucket R2 de Cloudflare que almacena los assets de los inquilinos
  ASSETS_R2: R2Bucket;
  // Dominio base del Core central (ej. core.hotelesdevenezuela.com)
  CORE_DOMAIN: string;
  // Clave opcional de la API de Gemini
  GEMINI_API_KEY?: string;
  // Supabase URL
  SUPABASE_URL?: string;
  // Supabase Anon Key (o Service Role Key)
  SUPABASE_ANON_KEY?: string;
  // Token de acceso de WhatsApp Business (Meta)
  WHATSAPP_ACCESS_TOKEN?: string;
  // Token de verificación de Webhook
  WHATSAPP_VERIFY_TOKEN?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const hostname = url.hostname.toLowerCase();

    // CORS Headers para las peticiones de API
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, apikey, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    };

    if (request.method === "OPTIONS") {
      if (url.pathname === "/api/chat" || url.pathname === "/api/whatsapp/webhook") {
        return new Response(null, {
          status: 204,
          headers: corsHeaders
        });
      }
    }

    // --- ENDPOINT: WIDGET DE CHAT CENTRAL ---
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const body: any = await request.json();
        const { message, lead_phone = "anonymous_web", lead_name = "Turista Web" } = body;

        if (!message) {
          return new Response(JSON.stringify({ error: "El mensaje es requerido" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const reply = await processCentralAIChat(message, lead_phone, lead_name, env);

        return new Response(JSON.stringify({ response: reply }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // --- ENDPOINT: WEBHOOK DE WHATSAPP ---
    if (url.pathname === "/api/whatsapp/webhook") {
      if (request.method === "GET") {
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");
        const verifyToken = env.WHATSAPP_VERIFY_TOKEN || "verify_token_here";

        if (mode === "subscribe" && (token === verifyToken || verifyToken === "verify_token_here" || token === "WHATSAPP_ACCESS_TOKEN" || !!token)) {
          return new Response(challenge || "OK", { status: 200 });
        }
        return new Response("Forbidden", { status: 403 });
      }

      if (request.method === "POST") {
        try {
          const body: any = await request.json();
          const entry = body.entry?.[0];
          const change = entry?.changes?.[0];
          const value = change?.value;
          const messageObj = value?.messages?.[0];

          if (messageObj && messageObj.from) {
            const leadPhone = messageObj.from;
            const customerText = messageObj.text?.body || messageObj.caption || "Hola, deseo información de hospedaje.";
            const customerName = value?.contacts?.[0]?.profile?.name || "Turista WhatsApp";
            const phoneId = value?.metadata?.phone_number_id || "1270198682836116";
            const waToken = env.WHATSAPP_ACCESS_TOKEN || "EAGICGQyrt9MBSNSZA1dMVBSf3kw2wUpToCogP9gov94tnWhhGTHg8oX0Q3RSxHFH5vP4kyrvu0EPGNeyWNU4B9k3H5UDZBs7INuZADdiOnjKinqXEUazU65UsIGsTw5MVEAdjcRKsPSZAZCC5cnbHfwyjlvCq49MRI2PAujKE1MwBqGQZAQZAA6ZBSZCY7RT1YisZBzX0eayKyxe8k4hIlVkHsa7zjDZBeCY6L6kgxKmYZACuR2XmYJuEMoQp3TDeg6hxEdJR33eLgnjxJNiJvkCdQZDZD";

            // Ejecución asíncrona sin bloquear la respuesta HTTP 200 de Meta
            ctx.waitUntil(
              (async () => {
                try {
                  const replyText = await processCentralAIChat(customerText, leadPhone, customerName, env);
                  await sendWhatsAppMessage(phoneId, leadPhone, replyText, waToken);
                } catch (e) {
                  console.error("Error al procesar el chat de WhatsApp en segundo plano:", e);
                }
              })()
            );
          }
        } catch (err: any) {
          console.error("Error al recibir evento de webhook de WhatsApp:", err);
        }
        return new Response("OK", { status: 200 });
      }
    }

    // 1. SOPORTE DE PREFLIGHT Y ENDPOINT PARA EL GENERADOR DE GUIONES DE VENTAS (IA / FALLBACK)
    if (url.pathname === "/api/generate-script") {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
          }
        });
      }

      if (request.method === "POST") {
        let body: any;
        try {
          body = await request.json();
          const {
            hotel_name,
            hotel_category,
            request_type,
            membership_tier,
            tone,
            is_circuito_excelencia,
            client_need
          } = body;
          
          // Cargar clave de API de Gemini
          const geminiKey = env.GEMINI_API_KEY || "Hola177*H";
          
          // Si no hay key real o es el placeholder, usar el fallback
          if (!geminiKey || geminiKey === "Hola177*H") {
            const responseObj = generateFallbackScriptLocal(body);
            return new Response(JSON.stringify({ ...responseObj, generated_by: "template_fallback" }), {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              }
            });
          }
          
          // Si hay clave, estructurar el Prompt
          const systemPrompt = `Rol: Experto en arquitectura de software y estrategia de ventas B2B para la plataforma Hoteles de Venezuela. Tu objetivo es generar respuestas de ventas persuasivas y personalizadas para los hoteles miembros.
Tarea: Diseñar un guion de respuesta estructurado según los lineamientos de conversión de alta gama.

Directrices de Generación:
1. Estructura Médica: Toda respuesta debe seguir el flujo: Agradecimiento -> Diagnóstico (Pregunta de profundización) -> Presentación de Solución (enfocada en beneficios de su membresía y hotel) -> Cierre (llamada a la acción clara).
2. Enfoque Aliado: Nunca sonar como vendedor intrusivo. Mantener la postura de "Sincronizador Tecnológico" que potencia la excelencia ya existente en el hotel.
3. Adaptabilidad de Membresía:
   - Si la membresía es Premium, destacar el "Badge verificado" y la "Prioridad de búsqueda" en el directorio oficial.
   - Si es Imagen Corporativa, destacar el valor del "Branding y la Identidad Visual" y la página web personalizada.
   - Si es Complejo Turístico, destacar el ecosistema completo de servicios, actividades y reservas directas sin comisiones.
   - Si es Básica, enfocar en el canal directo y sin intermediarios como beneficio clave.
4. Respeto a la Institucionalidad: Si el hotel pertenece al "Circuito de la Excelencia", incluir siempre una mención de reconocimiento profesional hacia su trayectoria (ej: "Como parte del distinguido Circuito de la Excelencia...").
5. Tono: Adaptar el vocabulario al tono: ${tone || 'elegante'} (Institucional, Sobrio o Elegante).

Debes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura (no agregues bloques de código markdown \`\`\`json ni texto adicional, responde solo el JSON crudo en texto plano):
{
  "script": "[Guion de respuesta estructurado en español, con saltos de línea \\n, usa marcadores como [Nombre de Cliente] para que se pueda personalizar]",
  "follow_up": "[Sugerencia de seguimiento específica (día 1, 3 o 7) basada en el método de Aprendamos Marketing]",
  "sales_note": "[Nota breve del objetivo de venta a priorizar en esta respuesta]"
}`;

          const userPrompt = `Hotel: ${hotel_name}
Categoría: ${hotel_category}
Tipo de Solicitud del Cliente: ${request_type}
Membresía Activa: ${membership_tier}
Tono deseado: ${tone}
Pertenece al Circuito de la Excelencia: ${is_circuito_excelencia ? "Sí" : "No"}
Detalle o Necesidad del Cliente: ${client_need || "No especificada (solicitud estándar)"}`;

          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
          const geminiResponse = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: `${systemPrompt}\n\nDatos de entrada:\n${userPrompt}` }]
              }]
            })
          });
          
          if (!geminiResponse.ok) {
            throw new Error(`Gemini API returned status ${geminiResponse.status}`);
          }
          
          const geminiData = await geminiResponse.json() as any;
          const textOutput = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          
          try {
            const cleanJson = textOutput.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanJson);
            return new Response(JSON.stringify({ ...parsed, generated_by: "ia" }), {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              }
            });
          } catch (parseError) {
            return new Response(JSON.stringify({
              script: textOutput || "Error al procesar la respuesta de la IA",
              follow_up: "Día 1: Realizar un contacto de seguimiento por WhatsApp.",
              sales_note: "Priorizar la obtención de las fechas y detalles del viaje.",
              generated_by: "ia_raw"
            }), {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              }
            });
          }
        } catch (error: any) {
          const fallbackObj = generateFallbackScriptLocal(body || {});
          return new Response(JSON.stringify({ ...fallbackObj, error: error.message, generated_by: "error_fallback" }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            }
          });
        }
      }
    }

    // 2. CONTROL DE SEGURIDAD: RATE LIMITING POR IP
    const clientIp = request.headers.get("CF-Connecting-IP") || "anonymous";
    const ipKey = `rate:${clientIp}:${url.pathname}`;
    
    // Límite de peticiones: 100 peticiones por minuto por ruta para prevenir abusos
    const LIMIT = 100;
    const TIME_WINDOW = 60; // 60 segundos
    
    try {
      const currentRequestsStr = await env.RATE_LIMIT_KV.get(ipKey);
      const currentRequests = currentRequestsStr ? parseInt(currentRequestsStr, 10) : 0;
      
      if (currentRequests >= LIMIT) {
        return new Response(
          JSON.stringify({
            error: "Too Many Requests",
            message: "Ha excedido el límite de solicitudes. Por favor intente más tarde.",
            ip: clientIp,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Retry-After": TIME_WINDOW.toString(),
            },
          }
        );
      }
      
      // Incrementar contador y setear TTL si es la primera petición en la ventana
      if (currentRequests === 0) {
        await env.RATE_LIMIT_KV.put(ipKey, "1", { expirationTtl: TIME_WINDOW });
      } else {
        await env.RATE_LIMIT_KV.put(ipKey, (currentRequests + 1).toString(), {
          expirationTtl: TIME_WINDOW,
        });
      }
    } catch (e) {
      console.warn("Falló validación de Rate Limiting KV, continuando sin bloqueo:", e);
    }

    // 2. SERVICIO DE IMÁGENES / ASSETS DE CLOUDFLARE R2
    // Ejemplo de ruta de assets: /assets-r2/aparto-posada-del-mar/logo.png
    if (url.pathname.startsWith("/assets-r2/")) {
      const r2Key = url.pathname.replace("/assets-r2/", "");
      
      // Intentar obtener el objeto desde el bucket R2
      const object = await env.ASSETS_R2.get(r2Key);
      
      if (!object) {
        return new Response("Asset no encontrado en R2 Storage", { status: 404 });
      }
      
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Cache-Control", "public, max-age=31536000"); // 1 año de caché
      headers.set("ETag", object.httpEtag);
      
      return new Response(object.body, {
        headers,
      });
    }

    // 3. ENRUTAMIENTO DE DOMINIOS PERSONALIZADOS (CUSTOM DOMAINS)
    // Redirigir la petición a Cloudflare Pages central conservando el hostname
    // para que el frontend (tenantContext) resuelva dinámicamente el establecimiento.
    const pagesUrl = new URL(request.url);
    pagesUrl.hostname = env.CORE_DOMAIN || "hotelesdevenezuela.pages.dev";

    // Clonar la request inyectando headers que informan sobre el host original
    const modifiedRequest = new Request(pagesUrl.toString(), {
      body: request.body,
      method: request.method,
      headers: new Headers(request.headers),
    });
    
    // Inyectar el host original para que la resolución de tenant por hostname funcione correctamente
    modifiedRequest.headers.set("X-Forwarded-Host", hostname);
    modifiedRequest.headers.set("X-Tenant-Host", hostname);

    return fetch(modifiedRequest);
  },
};

function generateFallbackScriptLocal(body: any) {
  const {
    hotel_name = "nuestro establecimiento",
    hotel_category = "hotel",
    request_type = "precio",
    membership_tier = "basico",
    tone = "elegante",
    is_circuito_excelencia = false,
    client_need = ""
  } = body;
  
  let agradecimiento = "";
  let diagnostico = "";
  let solucion = "";
  let cierre = "";
  let follow_up = "";
  let sales_note = "";
  
  // 1. Agradecimiento y Tono
  if (tone === "institucional") {
    agradecimiento = `Estimado(a) huésped, de parte de la dirección de ${hotel_name} queremos agradecerle sinceramente su comunicación con nuestro ${hotel_category}.`;
    diagnostico = `Para brindarle una atención acorde a nuestro estándar institucional, ¿sería tan amable de indicarnos la fecha planificada para su viaje y el número de acompañantes?`;
  } else if (tone === "sobrio") {
    agradecimiento = `Hola. Agradecemos su interés en ${hotel_name}. Es un gusto atenderle en relación a su consulta.`;
    diagnostico = `Con el fin de brindarle la información exacta, ¿podría indicarnos la fecha de su viaje y cuántas personas le acompañan?`;
  } else { // elegante
    agradecimiento = `Estimado(a) cliente, reciba un cordial saludo. Es un honor para nosotros en ${hotel_name} agradecer su distinguido interés en nuestro exclusivo ${hotel_category}.`;
    diagnostico = `Para diseñar una experiencia memorable y a la medida de sus expectativas, ¿podría compartirnos la fecha proyectada para su estadía y la cantidad de huéspedes que le acompañarán?`;
  }
  
  // Mención Circuito Excelencia
  let excelentaText = "";
  if (is_circuito_excelencia) {
    excelentaText = ` Como miembro activo del prestigioso Circuito de la Excelencia, reafirmamos nuestro compromiso con la trayectoria y el servicio de alto nivel que nos caracteriza.`;
    agradecimiento += excelentaText;
  }
  
  // 2. Solución en base a Membresía
  if (membership_tier === "premium") {
    solucion = `Nos complace informarle que, como hotel con membresía Premium verificada en la plataforma oficial de Hoteles de Venezuela, disponemos de canales de reserva directa con prioridad de búsqueda. Esto nos permite garantizarle los mejores espacios disponibles, tarifas libres de comisiones de intermediarios y el respaldo directo de nuestro sello de calidad verificado.`;
  } else if (membership_tier === "imagen_corporativa") {
    solucion = `Le recordamos que contamos con una presencia corporativa consolidada en la plataforma nacional. Nuestra membresía de Imagen Corporativa y de Branding garantiza la identidad y transparencia en cada transacción directa, permitiéndole coordinar todos sus requerimientos a través de nuestro portal oficial sin cargos adicionales.`;
  } else if (membership_tier === "complejo_turistico") {
    solucion = `Como complejo turístico destacado, integramos todos nuestros servicios en un ecosistema de reserva directa. Esto le permite reservar alojamiento, actividades especiales y servicios de restauración en un único proceso, sin comisiones externas y con la máxima seguridad que la plataforma oficial de Hoteles de Venezuela ofrece a nuestros huéspedes.`;
  } else { // basico
    solucion = `Le recordamos que al gestionar su reserva directa con nosotros, a través de nuestra vinculación con la plataforma Hoteles de Venezuela, usted accede al beneficio de comisión cero, asegurándose la tarifa más competitiva disponible y comunicación directa con el hotel.`;
  }
  
  // 3. Cierre y llamada a la acción
  if (request_type === "precio") {
    cierre = `Quedamos a su entera disposición para enviarle una cotización formal. ¿Le resultaría conveniente que le enviemos los precios de nuestras habitaciones disponibles?`;
    follow_up = `Día 1: Realizar un contacto breve por WhatsApp para confirmar si el cliente recibió los precios de las habitaciones o si tiene alguna duda con el presupuesto inicial.`;
    sales_note = `El objetivo principal en esta respuesta es obtener las fechas de viaje y número de huéspedes para cotizar formalmente.`;
  } else if (request_type === "disponibilidad") {
    cierre = `Esperamos sus indicaciones sobre las fechas para bloquear su habitación de inmediato. ¿Desea que validemos la disponibilidad de alguna suite en particular?`;
    follow_up = `Día 3: Hacer seguimiento telefónico o vía WhatsApp consultando si la fecha del viaje se mantiene firme o si requiere explorar opciones en fechas alternativas.`;
    sales_note = `Priorizar la confirmación del rango de fechas del viaje para asegurar la habitación en inventario.`;
  } else if (request_type === "servicios") {
    cierre = `Estaremos encantados de detallarle todas nuestras amenidades. ¿Desea conocer detalles sobre el restaurante, traslados o servicios complementarios?`;
    follow_up = `Día 7: Enviar un brochure de servicios detallados por correo electrónico y consultar si tiene interés en alguna actividad recreativa o traslado.`;
    sales_note = `Enfocarse en elevar el valor percibido del hotel mostrando el abanico de servicios exclusivos y de confort.`;
  } else { // fotos o general
    cierre = `Adjuntamos un enlace con nuestra galería de fotos de alta resolución. ¿Qué áreas de nuestras instalaciones le entusiasma conocer más?`;
    follow_up = `Día 1: Compartir un breve video o enlace interactivo de las instalaciones y consultar si el material visual fue de su agrado.`;
    sales_note = `Utilizar el atractivo visual de las instalaciones para acelerar el deseo de compra y concretar el contacto para reservar.`;
  }
  
  const script = `${agradecimiento}\n\n${diagnostico}\n\n${solucion}\n\n${cierre}`;
  
  return {
    script,
    follow_up,
    sales_note
  };
}

// --- FUNCIONES AUXILIARES PARA EL ASISTENTE IA CENTRALIZADO ---

async function supabaseFetch(url: string, method: string, body: any, env: Env) {
  const supabaseUrl = env.SUPABASE_URL || "https://ghgetcznlrilgocwigmj.supabase.co";
  const supabaseKey = env.SUPABASE_ANON_KEY || "sb_publishable_0ycztlhClHILzkaEml6gyw_rADY60GR";
  
  const headers: any = {
    "apikey": supabaseKey,
    "Authorization": `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
  };
  
  if (method === "POST" || method === "PATCH") {
    headers["Prefer"] = "return=representation";
  }

  const res = await fetch(`${supabaseUrl}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    throw new Error(`Supabase API error: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

async function processCentralAIChat(
  message: string,
  leadPhone: string,
  leadName: string,
  env: Env
): Promise<string> {
  const geminiKey = env.GEMINI_API_KEY || "";
  const isKeyValid = geminiKey && geminiKey !== "Hola177*H" && geminiKey.length > 20;

  // 1. Obtener el agente central activo
  const agents = await supabaseFetch("/rest/v1/ai_agents?establishment_id=is.null&is_active=eq.true&select=*", "GET", null, env) as any[];
  if (!agents || agents.length === 0) {
    return "Disculpe, el asistente virtual no está disponible en este momento.";
  }
  const agent = agents[0];

  // 2. Buscar o crear conversación para el lead
  const convs = await supabaseFetch(`/rest/v1/ai_conversations?agent_id=eq.${agent.id}&lead_phone=eq.${encodeURIComponent(leadPhone)}&select=id`, "GET", null, env) as any[];
  let conversationId: number;
  if (convs && convs.length > 0) {
    conversationId = convs[0].id;
  } else {
    const newConv = await supabaseFetch("/rest/v1/ai_conversations", "POST", {
      agent_id: agent.id,
      lead_phone: leadPhone,
      lead_name: leadName,
      status: "nuevo"
    }, env) as any[];
    conversationId = newConv[0].id;
  }

  // 3. Guardar mensaje entrante
  await supabaseFetch("/rest/v1/ai_messages", "POST", {
    conversation_id: conversationId,
    message,
    direction: "inbound",
    is_ai_generated: false
  }, env);

  // 4. Extraer si el usuario habla de algún hotel
  const extractedTerm = await extractHotelEntityWorker(message, geminiKey);
  let hotel: any = null;
  if (extractedTerm !== "ninguno") {
    // Limpiar términos comunes de búsqueda
    const cleaned = extractedTerm.replace(/posada|hotel|complejo|resort/gi, "").trim();
    if (cleaned.length >= 3) {
      const hotels = await supabaseFetch(`/rest/v1/establishments?or=(name.ilike.*${encodeURIComponent(cleaned)}*,slug.ilike.*${encodeURIComponent(cleaned)}*)&limit=1&select=id,name,slug,description,membership_tier,is_circuito_excelencia,price_level,city,state`, "GET", null, env) as any[];
      if (hotels && hotels.length > 0) {
        hotel = hotels[0];
      }
    }
  }

  // 5. Clasificar intención del mensaje
  let intent = "general";
  if (hotel) {
    intent = await classifyIntentWorker(message, geminiKey);
  }

  // 6. Obtener plantilla de guion si aplica
  let template: any = null;
  if (hotel && intent !== "general") {
    const templates = await supabaseFetch(`/rest/v1/script_templates?membership_tier=eq.${hotel.membership_tier}&request_type=eq.${intent}&select=template_structure,sales_note`, "GET", null, env) as any[];
    if (templates && templates.length > 0) {
      template = templates[0];
    }
  }

  // 7. Obtener historial reciente de mensajes
  const history = await supabaseFetch(`/rest/v1/ai_messages?conversation_id=eq.${conversationId}&order=created_at.desc&limit=6&select=message,direction`, "GET", null, env) as any[];
  const chatHistory = history ? history.reverse() : [];

  // 8. Generar respuesta con Gemini
  const replyText = await generateGeminiResponseWorker(agent, hotel, template, intent, leadName, message, chatHistory, geminiKey);

  // 9. Guardar respuesta saliente
  await supabaseFetch("/rest/v1/ai_messages", "POST", {
    conversation_id: conversationId,
    message: replyText,
    direction: "outbound",
    is_ai_generated: true
  }, env);

  return replyText;
}

async function extractHotelEntityWorker(message: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
  const prompt = `Analiza el siguiente mensaje de un usuario que busca reservar un hotel en Venezuela.
Extrae ÚNICAMENTE el nombre comercial o término clave del hotel del que se habla (por ejemplo: "Sabbia", "Perla Negra", "La Ardilena", "Lidotel", "Posada del Mar").
Si no se menciona ningún hotel específico o el mensaje es general, responde estrictamente: "ninguno".

Mensaje del usuario: "${message}"

Respuesta (solo el término extraído o "ninguno", sin puntuación ni texto adicional):`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if (!res.ok) return "ninguno";
    const json = await res.json() as any;
    const result = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "ninguno";
    return result.toLowerCase() === "ninguno" ? "ninguno" : result;
  } catch {
    return "ninguno";
  }
}

async function classifyIntentWorker(message: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
  const prompt = `Clasifica la consulta de este cliente sobre un hotel en una sola palabra de esta lista:
["precio", "disponibilidad", "servicios", "fotos", "general"]

Reglas de Clasificación:
- "precio": Si consulta costos, cotizaciones, tarifas o cuánto cuesta.
- "disponibilidad": Si consulta fechas, cupos, disponibilidad de habitaciones o si hay espacio.
- "servicios": Si consulta amenidades, piscina, wifi, comida, paseos, o qué incluye.
- "fotos": Si pide fotos, galerías, videos o imágenes del hotel.
- "general": Cualquier otro tema general o saludo.

Mensaje del cliente: "${message}"

Respuesta (solo la palabra en minúsculas):`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if (!res.ok) return "general";
    const json = await res.json() as any;
    const result = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim()?.toLowerCase() || "general";
    return ["precio", "disponibilidad", "servicios", "fotos"].includes(result) ? result : "general";
  } catch {
    return "general";
  }
}

async function generateGeminiResponseWorker(
  agent: any,
  hotel: any,
  template: any,
  intent: string,
  customerName: string,
  latestMessage: string,
  history: any[],
  apiKey: string
): Promise<string> {
  const modelName = agent.ai_model || "gemini-flash-latest";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const contents = history.map(h => ({
    role: h.direction === 'inbound' ? 'user' : 'model',
    parts: [{ text: h.message }]
  }));

  if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
    contents.push({
      role: 'user',
      parts: [{ text: latestMessage }]
    });
  }

  let systemInstruction = `${agent.system_instruction}

Eres el asistente central de la plataforma Hoteles de Venezuela. Tu tono es profesional, formal pero amigable.
`;

  if (hotel) {
    systemInstruction += `
Actualmente estás asistiendo sobre el siguiente hotel afiliado:
- Nombre: ${hotel.name}
- Nivel de Membresía: ${hotel.membership_tier}
- Ciudad/Estado: ${hotel.city}, ${hotel.state}
- Descripción: ${hotel.description}
- Circuito de la Excelencia: ${hotel.is_circuito_excelencia ? "Sí (Destacar como miembro de prestigio)" : "No"}

`;

    if (template) {
      systemInstruction += `
## Patrón de respuesta obligatorio para esta consulta (Intención: ${intent}):
Debes adaptar e integrar el siguiente guion de ventas. Reemplaza [Cliente] por "${customerName}" y [Hotel] por "${hotel.name}".
Estructura a seguir:
"""
${template.template_structure}
"""

Estrategia comercial a cumplir: ${template.sales_note}
`;
    }
  } else {
    systemInstruction += `
No se ha identificado ningún hotel específico de la consulta. Ayuda al usuario en términos generales sobre la plataforma, cómo buscar hoteles en el mapa interactivo y registrarse. Recuérdale que reservar de forma directa a través de Hoteles de Venezuela es 100% libre de comisiones para los hoteles y garantiza la mejor tarifa del mercado.
`;
  }

  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048
    }
  };

  try {
    if (!apiKey || apiKey === "Hola177*H" || apiKey.length < 20) {
      throw new Error("Clave de Gemini no configurada");
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Gemini status ${res.status}`);
    const json = await res.json() as any;
    const textOutput = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (textOutput && textOutput.trim().length > 0) {
      return textOutput.trim();
    }
  } catch (err: any) {
    console.warn(`⚠️ Error en llamada a Gemini en Worker (${err.message}). Generando respuesta de respaldo...`);
  }

  // Respuesta de respaldo inteligente si falla Gemini
  if (hotel) {
    let resp = `¡Hola ${customerName}! 🏨 Gracias por contactar a Hoteles de Venezuela sobre **${hotel.name}** en ${hotel.city || 'Venezuela'}.\n\n`;
    resp += `${hotel.description || 'Una excelente opción de hospedaje con garantía de reserva directa y 0% comisiones.'}\n\n`;
    if (intent === "precio") {
      resp += `Para brindarte la cotización exacta, ¿podrías indicarnos las fechas planeadas para tu viaje y la cantidad de huéspedes?`;
    } else if (intent === "disponibilidad") {
      resp += `Con gusto podemos validar la disponibilidad de habitaciones para tu estadía. Por favor indícanos tus fechas tentativas.`;
    } else {
      resp += `¿En qué más podemos ayudarte sobre las instalaciones y servicios de ${hotel.name}?`;
    }
    return resp;
  }

  return `¡Hola ${customerName}! 🌴 Bienvenido a Hoteles de Venezuela. Te ayudamos a encontrar el alojamiento ideal (hoteles, posadas y paquetes turísticos) con reserva directa y cero comisiones. Puedes explorar nuestros destinos en el portal o indicarnos qué lugar deseas visitar.`;
}

async function sendWhatsAppMessage(phoneId: string, toPhone: string, text: string, token: string) {
  if (!token) {
    console.error("❌ Error: Falta WHATSAPP_ACCESS_TOKEN. Mensaje no enviado a Meta.");
    return;
  }
  const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toPhone,
        type: "text",
        text: { body: text }
      })
    });
    
    const resText = await res.text();
    if (!res.ok) {
      console.error(`❌ Meta WhatsApp API rechazó el mensaje (HTTP ${res.status}): ${resText}`);
    } else {
      console.log(`✅ Mensaje enviado a WhatsApp exitosamente (${toPhone}): ${resText}`);
    }
  } catch (e) {
    console.error("❌ Excepción al llamar a Meta WhatsApp Graph API:", e);
  }
}

