# Arquitectura SaaS Multi-tenant: Nodos de Cliente

Este directorio contiene la arquitectura completa para la gestión y el despliegue de **nodos de cliente** (tenants/establecimientos) de forma independiente a partir del mismo repositorio git.

---

## 1. Funcionamiento del Sistema

Cada hotel o posada en la plataforma es una **instancia lógica** controlada mediante un archivo `config.json` propio.

El sistema resuelve qué configuración de hotel cargar a través de tres mecanismos ordenados por prioridad:
1. **Variable de Entorno en Compilación**: Si se define `VITE_TENANT_SLUG` en el pipeline de Cloudflare Pages (ideal para compilar un build estático dedicado al hotel).
2. **Parámetro URL de Prueba**: En local o desarrollo, añadir `?tenant=slug-del-hotel` para forzar la carga de ese inquilino.
3. **Detección Automática por Hostname**: Compara `window.location.hostname` con los dominios configurados en los archivos de los tenants.

---

## 2. Paso a Paso: Cómo Agregar un Nuevo Hotel

Para añadir un nuevo hotel a la red, simplemente debes seguir estos pasos sin necesidad de tocar la lógica del core:

### Paso 2.1: Crear la Carpeta del Establecimiento
Crea una carpeta en `src/tenants/instances/<slug-del-hotel>` y añade un archivo `config.json` con la siguiente estructura:

```json
{
  "establishment_id": 106,
  "slug": "nombre-del-hotel",
  "name": "Hotel Ejemplo Gourmet",
  "template": "A", 
  "domain": "hotelejemplogourmet.com",
  "branding": {
    "primary_color": "#00C8D4",
    "secondary_color": "#9B00CC",
    "accent_color": "#FF0096",
    "font_title": "Playfair Display",
    "font_body": "Montserrat",
    "logo_url": "https://r2.hotelesdevenezuela.com/nombre-del-hotel/logo.png",
    "banner_url": "https://images.unsplash.com/photo-xxxxxxx"
  },
  "modules": {
    "reservas": true,
    "pos": false,
    "galeria": true,
    "contacto": true
  },
  "contact": {
    "phone": "+58 412 111 2233",
    "whatsapp": "+58 412 111 2233",
    "email": "contacto@hotelejemplogourmet.com",
    "instagram": "@hotelejemplogourmet"
  }
}
```

### Paso 2.2: Registrar el Inquilino en el Registro Estático
Abre `src/tenants/tenantContext.tsx` e importa la nueva configuración estáticamente agregándola al objeto `TENANTS_REGISTRY`:

```typescript
import nuevoHotelConfig from "./instances/nombre-del-hotel/config.json";

export const TENANTS_REGISTRY = {
  // ...otros
  "nombre-del-hotel": nuevoHotelConfig,
};
```

---

## 3. Seguridad Lógica: Integración con Supabase

Para cumplir con el **aislamiento lógico estricto sin RLS**, está prohibido usar el cliente `supabase` global para las consultas del hotel. En su lugar, inicializa el cliente del tenant usando `createTenantClient`:

```typescript
import { useTenant } from "../tenantContext";
import { createTenantClient } from "../lib/supabaseTenant";

const { config } = useTenant();
const tenantClient = createTenantClient(config.establishment_id);

// Todas las consultas incluirán automáticamente .eq('establishment_id', config.establishment_id)
const { data: reservas } = await tenantClient.from("reservations").select("*");
```

---

## 4. Despliegue en Cloudflare Pages & R2

### Dominios y Enrutamiento (Cloudflare Worker)
El enrutador central del Worker (`cloudflare/rate-limiter.ts`) redirige las solicitudes de los dominios personalizados de los inquilinos hacia la app principal conservando el Hostname en los encabezados `X-Tenant-Host`.

Para desplegar el enrutador y rate limiter, ejecuta:
```bash
npx wrangler deploy
```

### Servir Imágenes desde Cloudflare R2
Las imágenes optimizadas deben cargarse en el Bucket R2 de Cloudflare `hoteles-de-venezuela-assets`. Se acceden públicamente a través de la ruta `/assets-r2/<hotel-slug>/<nombre-imagen>.jpg`, la cual es servida y cacheada por el mismo Worker a nivel perimetral.
