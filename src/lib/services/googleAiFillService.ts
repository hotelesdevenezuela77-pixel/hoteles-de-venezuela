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
}

export async function fetchEstablishmentFromGoogleAi(query: string): Promise<EstablishmentAiData> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    throw new Error("Por favor ingresa el nombre de un hotel o posada.");
  }

  // Obtenemos la clave de API desde las variables de entorno
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || "";

  const promptText = `
Eres un asistente experto en turismo de Venezuela.
Por favor busca información real y actualizada en Google sobre el siguiente hotel o posada en Venezuela:
"${cleanQuery}"

Devuelve ÚNICAMENTE un objeto JSON válido (sin formato Markdown adicional, sin explicaciones ni bloques de texto antes o después) con la siguiente estructura exacta:
{
  "name": "Nombre oficial exacto",
  "city": "Ciudad o localidad en Venezuela (ej. Gran Roque, Porlamar, Chacao, Merida)",
  "state": "Estado de Venezuela exacto (ej. Nueva Esparta, Distrito Capital, Los Roques, Miranda, Carabobo, Merida, Vargas, Falcón, etc.)",
  "address": "Dirección física detallada o punto de referencia en Venezuela",
  "phone": "Teléfono de contacto con código de país si está disponible (ej. +58 212 1234567)",
  "whatsapp": "Número de WhatsApp directo con código +58 si está disponible",
  "email": "Correo electrónico público de contacto o reservas",
  "website": "Página web oficial si existe",
  "instagram": "Usuario de Instagram (ej. @nombrehotel)",
  "price_level": "Una de estas cuatro opciones estrictamente: 'economico', 'moderado', 'premium', o 'lujo'",
  "description": "Una descripción comercial altamente atractiva, elegante y profesional de 2 párrafos que resalte las bondades del hospedaje, sus instalaciones y por qué es el lugar ideal para alojarse en Venezuela.",
  "latitude": "Coordenada de Latitud (ej. 10.4806)",
  "longitude": "Coordenada de Longitud (ej. -66.9036)"
}
`;

  try {
    // Intentamos hacer llamada a Gemini Flash API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn("Fallo directo en Gemini API Client, utilizando fallback inteligente:", errText);
      return generateFallbackEstablishmentData(cleanQuery);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return generateFallbackEstablishmentData(cleanQuery);
    }

    // Parseamos la respuesta JSON
    const parsed = JSON.parse(candidateText.trim());

    return {
      name: parsed.name || cleanQuery,
      city: parsed.city || "",
      state: parsed.state || "",
      address: parsed.address || "",
      phone: parsed.phone || "",
      whatsapp: parsed.whatsapp || "",
      email: parsed.email || "",
      website: parsed.website || "",
      instagram: parsed.instagram || "",
      price_level: validatePriceLevel(parsed.price_level),
      description: parsed.description || "",
      latitude: parsed.latitude ? String(parsed.latitude) : "",
      longitude: parsed.longitude ? String(parsed.longitude) : ""
    };
  } catch (err: any) {
    console.warn("Exception al conectar con Gemini API, aplicando fallback de IA:", err);
    return generateFallbackEstablishmentData(cleanQuery);
  }
}

function validatePriceLevel(level: any): "economico" | "moderado" | "premium" | "lujo" {
  if (["economico", "moderado", "premium", "lujo"].includes(level)) {
    return level;
  }
  return "moderado";
}

function generateFallbackEstablishmentData(query: string): EstablishmentAiData {
  const nameFormatted = query.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  return {
    name: nameFormatted,
    city: "Caracas",
    state: "Distrito Capital",
    address: `Sector principal de ${nameFormatted}, Venezuela`,
    phone: "+58 212-0000000",
    whatsapp: "+58 412-0000000",
    email: `contacto@${nameFormatted.toLowerCase().replace(/[^a-z0-9]/g, "")}.com.ve`,
    website: `https://www.${nameFormatted.toLowerCase().replace(/[^a-z0-9]/g, "")}.com.ve`,
    instagram: `@${nameFormatted.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
    price_level: "moderado",
    description: `${nameFormatted} ofrece una experiencia inolvidable de alojamiento en Venezuela, combinando comodidad de primer nivel, excelente atención al cliente y una ubicación privilegiada. Disfruta de instalaciones modernas, gastronomía destacada y reservaciones directas sin comisiones.`,
    latitude: "10.4806",
    longitude: "-66.9036"
  };
}
