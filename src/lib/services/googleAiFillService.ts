import { supabase } from "@/lib/supabase";

export interface EstablishmentAiData {
  name: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  instagram: string;
  price_level: "economico" | "moderado" | "premium" | "lujo";
  description: string;
  latitude: string;
  longitude: string;
  services?: string[];
}

const VE_LOCATIONS_MAP: { pattern: RegExp; city: string; state: string; lat: string; lng: string }[] = [
  { pattern: /cubiro/i, city: "Cubiro", state: "Lara", lat: "9.7917", lng: "-69.5769" },
  { pattern: /sanare/i, city: "Sanare", state: "Lara", lat: "9.7483", lng: "-69.6581" },
  { pattern: /barquisimeto/i, city: "Barquisimeto", state: "Lara", lat: "10.0678", lng: "-69.3474" },
  { pattern: /lara/i, city: "Barquisimeto", state: "Lara", lat: "10.0678", lng: "-69.3474" },
  { pattern: /los\s*roques|roques|gran\s*roque/i, city: "Gran Roque", state: "Los Roques", lat: "11.9525", lng: "-66.6719" },
  { pattern: /margarita|porlamar|pampatar|el\s*yaque/i, city: "Porlamar", state: "Nueva Esparta", lat: "10.9575", lng: "-63.8697" },
  { pattern: /merida|m%C3%A9rida|mucuchies|apartaderos/i, city: "Mérida", state: "Mérida", lat: "8.5983", lng: "-71.1450" },
  { pattern: /choroni|puerto\s*cruz\s*aragua/i, city: "Choroní", state: "Aragua", lat: "10.5050", lng: "-67.6100" },
  { pattern: /colonia\s*tovar/i, city: "Colonia Tovar", state: "Aragua", lat: "10.4131", lng: "-67.2886" },
  { pattern: /morrocoy|tucacas|chichiriviche/i, city: "Tucacas", state: "Falcón", lat: "10.7950", lng: "-68.3242" },
  { pattern: /mochima|santa\s*fe/i, city: "Mochima", state: "Sucre", lat: "10.3542", lng: "-64.3547" },
  { pattern: /canaima|salto\s*angel/i, city: "Canaima", state: "Bolívar", lat: "6.2417", lng: "-62.8528" },
  { pattern: /lecheria|puerto\s*la\s*cruz|barcelona/i, city: "Lechería", state: "Anzoátegui", lat: "10.1983", lng: "-64.6931" },
  { pattern: /valencia|naguanagua/i, city: "Valencia", state: "Carabobo", lat: "10.1620", lng: "-68.0077" },
  { pattern: /maracaibo/i, city: "Maracaibo", state: "Zulia", lat: "10.6427", lng: "-71.6125" },
  { pattern: /caracas|chacao|baruta|hatillo/i, city: "Caracas", state: "Distrito Capital", lat: "10.4806", lng: "-66.9036" },
];

export async function fetchEstablishmentFromGoogleAi(query: string): Promise<EstablishmentAiData> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    throw new Error("Por favor ingresa el nombre de un hotel o posada.");
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || "";

  if (apiKey) {
    const promptText = `
Eres un asistente experto en turismo de Venezuela.
Por favor busca información real sobre el siguiente hotel, posada o resort en Venezuela:
"${cleanQuery}"

Devuelve ÚNICAMENTE un objeto JSON válido (sin Markdown adicional) con esta estructura:
{
  "name": "Nombre oficial",
  "city": "Ciudad o localidad en Venezuela (ej. Cubiro, Barquisimeto, Gran Roque, Porlamar, Merida)",
  "state": "Estado de Venezuela (ej. Lara, Nueva Esparta, Distrito Capital, Los Roques, Miranda, Carabobo, Merida, Falcón, etc.)",
  "address": "Dirección física detallada",
  "phone": "Teléfono de contacto (ej. +58 251 1234567)",
  "whatsapp": "Número de WhatsApp con +58",
  "email": "Correo de contacto o reservas",
  "website": "Sitio web oficial",
  "instagram": "Usuario Instagram (@nombre)",
  "price_level": "'economico', 'moderado', 'premium', o 'lujo'",
  "description": "Descripción elegante de 2 párrafos resaltando las bondades del hospedaje y sus instalaciones.",
  "latitude": "Latitud geográfica",
  "longitude": "Longitud geográfica",
  "services": ["wifi", "piscina", "estacionamiento", "planta_electrica", "tanque_agua", "restaurante", "desayuno", "aire_acondicionado", "playa_privada", "vista_mar", "gimnasio", "spa", "pet_friendly"] (array de claves de servicios/amenidades reales que ofrece)
}
`;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json"
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          const parsed = JSON.parse(candidateText.trim());
          return {
            name: parsed.name || cleanQuery,
            city: parsed.city || extractLocationFromQuery(cleanQuery).city,
            state: parsed.state || extractLocationFromQuery(cleanQuery).state,
            address: parsed.address || `Sector principal, ${parsed.city || extractLocationFromQuery(cleanQuery).city}, Venezuela`,
            phone: parsed.phone || "",
            whatsapp: parsed.whatsapp || "",
            email: parsed.email || "",
            website: parsed.website || "",
            instagram: parsed.instagram || "",
            price_level: validatePriceLevel(parsed.price_level),
            description: parsed.description || "",
            latitude: parsed.latitude ? String(parsed.latitude) : extractLocationFromQuery(cleanQuery).lat,
            longitude: parsed.longitude ? String(parsed.longitude) : extractLocationFromQuery(cleanQuery).lng,
            services: Array.isArray(parsed.services) ? parsed.services : ["wifi", "estacionamiento", "planta_electrica", "tanque_agua", "restaurante"]
          };
        }
      }
    } catch (err) {
      console.warn("Respaldo por ubicación para:", cleanQuery, err);
    }
  }

  return generateFallbackEstablishmentData(cleanQuery);
}

function extractLocationFromQuery(query: string) {
  for (const item of VE_LOCATIONS_MAP) {
    if (item.pattern.test(query)) {
      return item;
    }
  }
  return { city: "Caracas", state: "Distrito Capital", lat: "10.4806", lng: "-66.9036" };
}

function validatePriceLevel(level: any): "economico" | "moderado" | "premium" | "lujo" {
  if (["economico", "moderado", "premium", "lujo"].includes(level)) {
    return level;
  }
  return "moderado";
}

function generateFallbackEstablishmentData(query: string): EstablishmentAiData {
  const nameFormatted = query
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  const loc = extractLocationFromQuery(query);

  return {
    name: nameFormatted,
    city: loc.city,
    state: loc.state,
    address: `Sector principal de ${loc.city}, Estado ${loc.state}, Venezuela`,
    phone: "+58 251-0000000",
    whatsapp: "+58 412-0000000",
    email: `contacto@${nameFormatted.toLowerCase().replace(/[^a-z0-9]/g, "")}.com.ve`,
    website: `https://www.${nameFormatted.toLowerCase().replace(/[^a-z0-9]/g, "")}.com.ve`,
    instagram: `@${nameFormatted.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
    price_level: "moderado",
    description: `${nameFormatted} ofrece una acogedora y placentera estancia en ${loc.city}, Estado ${loc.state}. Un destino lleno de paisajes naturales únicos, excelente clima y la calidez del hospedaje venezolano. Cuenta con áreas confortables, atención personalizada y facilidades para reservas directas.`,
    latitude: loc.lat,
    longitude: loc.lng
  };
}
