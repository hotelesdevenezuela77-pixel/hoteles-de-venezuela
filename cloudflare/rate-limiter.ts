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
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const hostname = url.hostname.toLowerCase();
    
    // 1. CONTROL DE SEGURIDAD: RATE LIMITING POR IP
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
