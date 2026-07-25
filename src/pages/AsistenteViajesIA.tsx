import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import L from "leaflet";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import "leaflet/dist/leaflet.css";
import { 
  Sparkles, Send, Calendar, MapPin, DollarSign, Hotel, 
  Map, MessageSquare, Compass, Award, Loader2, ArrowLeft,
  X, Check, Info, ShieldCheck, HelpCircle
} from "lucide-react";

// --- Configuración Visual Oficial (AGENTS.md) ---
const THEME = {
  cyan: "#00C8D4",      // Acentos primarios
  magenta: "#FF0096",   // Botones premium, llamados de atención
  purple: "#9B00CC",    // Gradientes
  bgDeep: "#0e011f",    // Fondos oscuros primarios
  bgCard: "#1a0533",    // Tarjetas y paneles
  textSlate: "#cbd5e1",
};

interface Activity {
  dia: number;
  hotel_id: number;
  hotel_name: string;
  actividades: string[];
  coordenadas_lat_lng: [number, number];
  costo_estimado: number;
}

interface TravelItinerary {
  itinerary: Activity[];
  destination: string;
  days: number;
  total_cost: number;
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  isGenerating?: boolean;
}

// Catálogo de Hoteles del Inventario HDV con Coordenadas Reales
const HDV_HOTELS_INVENTORY = [
  { id: 101, name: "Posada La Gotera (Los Roques)", lat: 11.9525, lng: -66.6719, price: 150, image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80" },
  { id: 102, name: "Campamento Canaima (Salto Ángel)", lat: 6.2417, lng: -62.8528, price: 280, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80" },
  { id: 103, name: "Hotel Hesperia Isla Margarita (Pedro González)", lat: 11.0805, lng: -63.8895, price: 120, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80" },
  { id: 104, name: "Posada Rancho Grande (Choroní)", lat: 10.5050, lng: -67.6100, price: 85, image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=400&q=80" },
  { id: 105, name: "Cabañas Mucuambí (Apartaderos, Mérida)", lat: 8.7983, lng: -70.8450, price: 90, image: "https://images.unsplash.com/photo-1470165301023-58dab8118cc9?auto=format&fit=crop&w=400&q=80" },
  { id: 106, name: "Posada La Gotera (Morrocoy/Tucacas)", lat: 10.7950, lng: -68.3242, price: 110, image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=400&q=80" },
];

export function AsistenteViajesIA() {
  const [, setLocation] = useLocation();
  const { user, profile } = useAuth();
  const [establishmentsList, setEstablishmentsList] = useState<any[]>([]);

  useEffect(() => {
    async function loadRealHotels() {
      try {
        const { data, error } = await supabase
          .from("establishments")
          .select(`
            id,
            name,
            latitude,
            longitude,
            primary_image,
            price_level,
            destinations (name)
          `)
          .eq("status", "approved");
        
        if (error) throw error;
        if (data && data.length > 0) {
          const mapped = data.map((h: any) => ({
            id: h.id,
            name: h.name,
            lat: h.latitude || 10.5,
            lng: h.longitude || -66.9,
            price: h.price_level === "$$$" ? 180 : h.price_level === "$$" ? 110 : 65,
            image: h.primary_image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80",
            destination: h.destinations?.name || ""
          }));
          setEstablishmentsList(mapped);
        }
      } catch (e) {
        console.error("Error loading approved hotels from DB:", e);
      }
    }
    loadRealHotels();
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "ai", text: "¡Hola! Soy el planificador inteligente de Hoteles de Venezuela. Escribe adónde te gustaría viajar en Venezuela, cuántos días y tus gustos de viaje (ej: 'Quiero un viaje de 3 días a Mérida enfocado en aventura'). Diseñaré tu ruta en tiempo real." }
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [itineraryData, setItineraryData] = useState<TravelItinerary | null>(null);

  // Estados de reserva comercial
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Referencias del mapa Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // ── Inicializar Leaflet Mapa ──
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Crear mapa centrado en Venezuela
    const map = L.map(mapContainerRef.current, {
      center: [7.5, -66.0],
      zoom: 6,
      zoomControl: true,
    });

    // Agregar capa estilizada oscura (tipo cartodb dark para encajar en el dark mode)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Crear grupo para marcadores
    const markersGroup = L.featureGroup().addTo(map);

    mapInstanceRef.current = map;
    markersGroupRef.current = markersGroup;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, []);

  // ── Actualizar Marcadores y Polilíneas cuando cambia el Itinerario ──
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current || !itineraryData) return;

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;

    // Limpiar marcadores y polilíneas anteriores
    markersGroup.clearLayers();
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    const coords: [number, number][] = [];

    // Trazar nuevos puntos
    itineraryData.itinerary.forEach((item) => {
      const coord = item.coordenadas_lat_lng;
      coords.push(coord);

      // Crear icono numérico personalizado unicolor (Magenta oficial)
      const numIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, ${THEME.magenta}, ${THEME.purple});
            border-radius: 50%;
            border: 2.5px solid white;
            box-shadow: 0 4px 10px rgba(255,0,150,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: 900;
          ">
            ${item.dia}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(coord, { icon: numIcon });
      
      // Popup estilizado
      marker.bindPopup(`
        <div style="color: #1e293b; font-family: sans-serif; min-width: 140px;">
          <h4 style="margin: 0 0 5px 0; font-weight: bold; color: ${THEME.magenta};">Día ${item.dia}</h4>
          <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: bold;">🏨 ${item.hotel_name}</p>
          <p style="margin: 0; font-size: 10px; color: #64748b;">${item.actividades[0]}</p>
        </div>
      `);

      markersGroup.addLayer(marker);
    });

    // Crear línea de conexión (polilínea) con color corporativo
    if (coords.length > 1) {
      const line = L.polyline(coords, {
        color: THEME.cyan,
        weight: 3,
        opacity: 0.8,
        dashArray: "6, 6"
      }).addTo(map);
      routeLineRef.current = line;
    }

    // Centrar mapa dinámicamente en los puntos trazados con holgura
    try {
      const bounds = markersGroup.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    } catch (e) {
      console.warn("No se pudieron ajustar los bordes del mapa:", e);
    }
  }, [itineraryData]);

  // Centrar el mapa al hacer clic en un día específico de la línea de tiempo
  const handleSelectDay = (day: Activity) => {
    setActiveDay(day.dia);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(day.coordenadas_lat_lng, 12, { animate: true });
    }
  };

  // ── Integración real con Google Gemini Pro (1.5 Flash) ──
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || loading) return;

    const query = userInput.trim();
    setMessages(prev => [...prev, { sender: "user", text: query }]);
    setUserInput("");
    setLoading(true);

    const loaderMessageIndex = messages.length + 1;
    setMessages(prev => [...prev, { sender: "ai", text: "Analizando tu itinerario y mapeando rutas con IA...", isGenerating: true }]);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || "";
    const currentInventory = establishmentsList.length > 0 ? establishmentsList : HDV_HOTELS_INVENTORY;
    const promptText = `
Eres el Planificador de Viajes Inteligente de "Hoteles de Venezuela".
Procesa la siguiente solicitud de viaje del usuario en Venezuela:
"${query}"

A partir del catálogo de hoteles autorizados que te doy abajo, selecciona el que MEJOR se adapte geográficamente a cada día del viaje:
${JSON.stringify(currentInventory)}

Devuelve ÚNICAMENTE un objeto JSON válido (sin formato Markdown adicional, sin envoltorios de código como \`\`\`json, solo las llaves JSON) que responda a esta estructura:
{
  "destination": "Nombre de la ciudad o zona recomendada (ej. Los Roques, Mérida)",
  "days": 3, (número de días del itinerario)
  "total_cost": 360, (costo estimado total sumando noches de hotel y tours)
  "itinerary": [
    {
      "dia": 1,
      "hotel_id": 101, (id del hotel seleccionado del catálogo que te pasé)
      "hotel_name": "Nombre oficial del hotel seleccionado",
      "actividades": [
        "Llegada y check-in",
        "Paseo por el pueblo o atractivo cercano",
        "Cena sugerida en restaurante local"
      ],
      "coordenadas_lat_lng": [11.9525, -66.6719], (coordenadas GPS lat/lng reales de ese destino o del hotel seleccionado)
      "costo_estimado": 150 (costo en USD de la noche del hotel y actividades)
    }
  ]
}

Asegúrate de que las coordenadas correspondan a zonas geográficas reales dentro del estado o localidad en Venezuela sugerida.
`;

    let dataSuccess = false;
    let itineraryJson: TravelItinerary | null = null;
    let tokens = 0;

    if (apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json"
            }
          })
        });

        if (response.ok) {
          const resBody = await response.json();
          const candidateText = resBody?.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (candidateText) {
            const rawText = candidateText.trim();
            // Limpieza de posibles envoltorios markdown que ponga Gemini a pesar de pedirle JSON
            const jsonText = rawText.startsWith("```") 
              ? rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
              : rawText;

            itineraryJson = JSON.parse(jsonText);
            dataSuccess = true;

            // Telemetría de tokens estimados
            tokens = (query.length + promptText.length) * 0.35 + (candidateText.length * 0.35);
          }
        }
      } catch (err) {
        console.error("Gemini call failed, calling fallback local generator:", err);
      }
    }

    // Fallback generador inteligente si la API Key falla o no existe
    if (!dataSuccess) {
      itineraryJson = generateLocalFallbackItinerary(query);
      tokens = 250; // valor representativo
    }

    if (itineraryJson) {
      setItineraryData(itineraryJson);
      
      // Actualizar mensajes quitando la burbuja de cargando
      setMessages(prev => {
        const copy = [...prev];
        copy.splice(loaderMessageIndex, 1); // Remover loader
        return [
          ...copy,
          { 
            sender: "ai", 
            text: `He preparado un itinerario de ${itineraryJson.days} días en **${itineraryJson.destination}**. He mapeado la ruta en el mapa a tu derecha y sugerido los mejores alojamientos. Puedes revisar el cronograma en el panel central.` 
          }
        ];
      });

      // Guardar logs de telemetría de IA en localStorage para alimentar el backoffice en tiempo real
      saveTelemetryLog(query, itineraryJson, tokens);

    } else {
      setMessages(prev => {
        const copy = [...prev];
        copy.splice(loaderMessageIndex, 1);
        return [...copy, { sender: "ai", text: "Disculpa, tuve un problema al procesar la ruta en este momento. Por favor reescribe tu solicitud." }];
      });
    }

    setLoading(false);
  };

  // Generador local de respaldo para itinerarios basados en palabras clave
  const generateLocalFallbackItinerary = (query: string): TravelItinerary => {
    const isMérida = /merida|m%C3%A9rida|mucuchies|paramo|nieve|monta/i.test(query);
    const isRoques = /roque|cayo|coral|mar|isla/i.test(query);
    const isCanaima = /canaima|salto|angel|tepuy|bolivar/i.test(query);
    const isMargarita = /margarita|playa|esparta|pampatar/i.test(query);

    const currentInventory = establishmentsList.length > 0 ? establishmentsList : HDV_HOTELS_INVENTORY;
    let dest = "Morrocoy";
    let hotel = currentInventory.find((h: any) => h.destination.toLowerCase().includes("morrocoy") || h.name.toLowerCase().includes("morrocoy") || h.destination.toLowerCase().includes("tucacas")) || currentInventory[currentInventory.length - 1];
    let coords: [number, number] = [hotel.lat, hotel.lng];
    let activitiesDays = [
      ["Llegada a Tucacas y check-in", "Paseo en lancha privada a Cayo Sombrero", "Cena de mariscos a la orilla del mar"],
      ["Desayuno en posada", "Excursión a Cayo Pescadores para snorkel", "Puesta de sol en el velero"],
      ["Mañana de playa tranquila en Playuela", "Check-out y traslado al aeropuerto/terminal"]
    ];

    if (isMérida) {
      dest = "Mérida (Páramos)";
      hotel = currentInventory.find((h: any) => h.destination.toLowerCase().includes("merida") || h.destination.toLowerCase().includes("mérida") || h.name.toLowerCase().includes("mucu") || h.name.toLowerCase().includes("merida")) || currentInventory[4 % currentInventory.length];
      coords = [hotel.lat, hotel.lng];
      activitiesDays = [
        ["Llegada a Mérida y check-in en Apartaderos", "Paseo a caballo en Laguna de Mucubají", "Cena con chocolate caliente andino"],
        ["Visita al Teleférico Mukumbarí", "Senderismo por el bosque de frailejones", "Visita al monumento de la Loca Luz Caraballo"],
        ["Compras de artesanías andinas en San Rafael de Tabay", "Check-out y retorno"]
      ];
    } else if (isRoques) {
      dest = "Archipiélago de Los Roques";
      hotel = currentInventory.find((h: any) => h.destination.toLowerCase().includes("roque") || h.name.toLowerCase().includes("roque")) || currentInventory[0];
      coords = [hotel.lat, hotel.lng];
      activitiesDays = [
        ["Llegada en avioneta a Gran Roque y check-in", "Navegación en catamarán a Cayo Francisquí", "Snorkel en la piscina natural"],
        ["Desayuno a bordo", "Visita a Cayo de Agua (istmo de arena único)", "Observación de tortugas en el santuario de Dos Mosquises"],
        ["Caminata matutina al faro holandés", "Almuerzo caribeño", "Check-out y vuelo de regreso"]
      ];
    } else if (isCanaima) {
      dest = "Parque Nacional Canaima";
      hotel = currentInventory.find((h: any) => h.destination.toLowerCase().includes("canaima") || h.name.toLowerCase().includes("canaima") || h.name.toLowerCase().includes("salto")) || currentInventory[1 % currentInventory.length];
      coords = [hotel.lat, hotel.lng];
      activitiesDays = [
        ["Vuelo panorámico e ingreso al campamento", "Navegación en curiara por la Laguna de Canaima", "Caminata bajo el Salto El Hacha"],
        ["Excursión de día completo al Salto Ángel", "Almuerzo tipo picnic frente al Auyantepuy", "Cena tradicional y pernocta en hamaca frente al salto"],
        ["Retorno al campamento principal", "Relajación en las áreas verdes", "Check-out e inicio de vuelo de retorno"]
      ];
    } else if (isMargarita) {
      dest = "Isla de Margarita";
      hotel = currentInventory.find((h: any) => h.destination.toLowerCase().includes("margarita") || h.name.toLowerCase().includes("hesperia") || h.name.toLowerCase().includes("margarita")) || currentInventory[2 % currentInventory.length];
      coords = [hotel.lat, hotel.lng];
      activitiesDays = [
        ["Llegada al Aeropuerto de Santiago Mariño y check-in", "Tarde de relax en Playa El Agua", "Cena buffet internacional"],
        ["Excursión en bote por el Parque Nacional Laguna de La Restinga", "Paseo de compras por Porlamar (Puerto Libre)", "Cena y show en vivo"],
        ["Mañana deportiva en Playa El Yaque (Windsurf)", "Check-out y traslado de salida"]
      ];
    }

    const items: Activity[] = activitiesDays.map((act, i) => {
      // Dispersar ligeramente las coordenadas de los días para que no se superpongan
      const dispLat = coords[0] + (i * 0.015 - 0.015);
      const dispLng = coords[1] + (i * 0.015 - 0.015);
      
      return {
        dia: i + 1,
        hotel_id: hotel.id,
        hotel_name: hotel.name,
        actividades: act,
        coordenadas_lat_lng: [dispLat, dispLng],
        costo_estimado: hotel.price + 35 // costo hotel + paseos
      };
    });

    return {
      destination: dest,
      days: items.length,
      total_cost: items.reduce((sum, it) => sum + it.costo_estimado, 0),
      itinerary: items
    };
  };

  // Guardar log de telemetría en localStorage para el Backoffice
  const saveTelemetryLog = (query: string, result: TravelItinerary, tokens: number) => {
    const key = "hdv_ai_travel_logs";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    
    const newLog = {
      id: Math.floor(10000 + Math.random() * 90000),
      query: query,
      destination: result.destination,
      days: result.days,
      cost_usd: result.total_cost,
      tokens_consumed: Math.round(tokens),
      cost_tokens_usd: parseFloat((tokens * 0.000002).toFixed(6)), // costo simulado por token
      status: "generado", // generado, reservado_pagado
      created_at: new Date().toISOString()
    };

    localStorage.setItem(key, JSON.stringify([newLog, ...existing]));
  };

  // Simular reserva comercial completa
  const handleConfirmBooking = () => {
    if (!itineraryData) return;
    setBookingLoading(true);

    setTimeout(() => {
      // Actualizar el estado de conversión en la base de datos local (localStorage)
      const key = "hdv_ai_travel_logs";
      const logs = JSON.parse(localStorage.getItem(key) || "[]");
      if (logs.length > 0) {
        // Encontrar el log más reciente y marcarlo como pagado
        logs[0].status = "reservado_pagado";
        localStorage.setItem(key, JSON.stringify(logs));
      }

      // Agregar reserva al listado de reservas generales de la app
      const resKey = "hdv_mock_reservations";
      const existingRes = JSON.parse(localStorage.getItem(resKey) || "[]");
      const firstActivity = itineraryData.itinerary[0];
      
      const newRes = {
        id: Math.floor(1000 + Math.random() * 9000),
        status: "confirmed",
        total_price: itineraryData.total_cost,
        check_in_date: new Date().toISOString().split("T")[0],
        check_out_date: new Date(Date.now() + itineraryData.days * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        guest_name: profile?.name || "Turista Inteligente",
        guest_email: user?.email || "turista@viaje.ia",
        establishment_id: firstActivity.hotel_id,
        establishment_name: firstActivity.hotel_name,
        room_type: "Plan Completo Turístico IA",
        created_at: new Date().toISOString()
      };

      localStorage.setItem(resKey, JSON.stringify([newRes, ...existingRes]));

      setBookingLoading(false);
      setBookingSuccess(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans"
         style={{ backgroundColor: THEME.bgDeep }}>
      
      {/* HEADER SUPERIOR */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#14022a]/80 backdrop-blur-md relative z-20">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 cursor-pointer flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF0096] to-[#9B00CC] flex items-center justify-center text-white">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-sm font-serif font-black tracking-widest text-white leading-none">CENTAURUS IA</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded bg-[#00C8D4]/10 border border-[#00C8D4]/20 text-[#00C8D4]">
            Asistente de Viaje Pro
          </span>
        </div>
      </header>

      {/* CUERPO DE 3 COLUMNAS */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* ── COLUMNA 1: CHAT CONVERSACIONAL ── */}
        <section className="w-full md:w-1/3 flex flex-col border-r border-white/5 bg-[#14022a]/45 relative">
          <div className="p-4 border-b border-white/5 bg-black/10 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#00C8D4]" /> Chat Inteligente
            </span>
          </div>

          {/* Burbujas del Chat */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed border transition-all ${
                  m.sender === "user"
                    ? "bg-gradient-to-r from-[#FF0096]/20 to-[#9B00CC]/20 border-[#FF0096]/30 text-white font-semibold rounded-br-none"
                    : "bg-white/5 border-white/5 text-slate-200 font-medium rounded-bl-none"
                }`}>
                  {m.isGenerating ? (
                    <div className="flex items-center gap-2.5 text-slate-400 font-bold">
                      <Loader2 className="w-4.5 h-4.5 animate-spin text-[#00C8D4]" />
                      <span>{m.text}</span>
                    </div>
                  ) : (
                    <p dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Formulario de Entrada */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-black/20 flex gap-2.5">
            <input 
              type="text"
              placeholder="Ej: Planea 3 días en Los Roques..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-white/5 text-xs text-white placeholder-slate-500 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-[#00C8D4] focus:ring-0 font-semibold"
            />
            <button 
              type="submit"
              disabled={loading || !userInput.trim()}
              className="p-3 rounded-xl bg-gradient-to-tr from-[#FF0096] to-[#9B00CC] text-white hover:opacity-90 disabled:opacity-30 cursor-pointer flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>

        {/* ── COLUMNA 2: TIMELINE INTERACTIVO DÍA POR DÍA ── */}
        <section className="w-full md:w-1/3 flex flex-col border-r border-white/5 bg-[#14022a]/20">
          <div className="p-4 border-b border-white/5 bg-black/10 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#FF0096]" /> Itinerario Generado
            </span>
            {itineraryData && (
              <span className="text-[10px] font-black text-[#00C8D4]">
                {itineraryData.days} Días • ${itineraryData.total_cost} USD
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {!itineraryData ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Compass className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Sin Itinerario Activo</h3>
                <p className="text-[10px] text-slate-500 font-semibold mt-1 max-w-[200px]">
                  Escribe una consulta a la inteligencia artificial para dibujar tu ruta.
                </p>
              </div>
            ) : (
              <div className="space-y-6 relative border-l-2 border-dashed border-white/5 ml-3 pl-5 py-2">
                {itineraryData.itinerary.map((day) => {
                  const isActive = activeDay === day.dia;
                  const hotelImg = HDV_HOTELS_INVENTORY.find(h => h.id === day.hotel_id)?.image || "";
                  return (
                    <div 
                      key={day.dia} 
                      onClick={() => handleSelectDay(day)}
                      className={`relative rounded-2xl border p-4 transition-all cursor-pointer ${
                        isActive 
                          ? "bg-white/5 border-[#FF0096]/40 shadow-lg shadow-pink-950/10" 
                          : "bg-black/10 border-white/5 hover:border-white/10"
                      }`}
                    >
                      {/* Círculo indicador del día en el timeline */}
                      <span className="absolute -left-[27px] top-4 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white border-2 border-white/10"
                            style={{ 
                              backgroundColor: isActive ? THEME.magenta : "#475569",
                              boxShadow: isActive ? `0 0 10px ${THEME.magenta}` : "none"
                            }} />

                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-black uppercase tracking-wide" style={{ color: isActive ? THEME.magenta : "#94a3b8" }}>
                          Día {day.dia} • {itineraryData.destination}
                        </h4>
                        <span className="text-[10px] font-black text-white bg-black/35 px-2 py-0.5 rounded">
                          ${day.costo_estimado}
                        </span>
                      </div>

                      {/* Tarjeta del Hotel Sugerido */}
                      <div className="mt-3 flex gap-3 p-2 bg-black/25 rounded-xl border border-white/5">
                        {hotelImg && (
                          <img src={hotelImg} alt={day.hotel_name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        )}
                        <div className="min-w-0">
                          <span className="text-[8px] uppercase tracking-wider text-[#00C8D4] font-black">Hospedaje Recomendado</span>
                          <h5 className="text-[10px] font-bold text-white truncate">{day.hotel_name}</h5>
                        </div>
                      </div>

                      {/* Lista de Actividades */}
                      <ul className="mt-3.5 space-y-2">
                        {day.actividades.map((act, actIdx) => (
                          <li key={actIdx} className="text-[10px] text-slate-350 font-medium flex items-start gap-2">
                            <span className="text-[#00C8D4] mt-0.5 shrink-0">•</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}

                {/* BOTÓN DE CONVERSIÓN COMERCIAL */}
                <div className="pt-4 pr-2">
                  <button 
                    onClick={() => setShowBookingModal(true)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-transform hover:scale-102 cursor-pointer shadow-lg shadow-pink-500/10"
                  >
                    <Award className="w-4 h-4" /> Reservar Itinerario Completo
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── COLUMNA 3: MAPA DE RUTA GEOLOCALIZADO ── */}
        <section className="w-full md:w-1/3 h-64 md:h-auto relative z-10 flex flex-col">
          <div className="p-4 border-b border-white/5 bg-black/10 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Map className="w-4 h-4 text-[#00C8D4]" /> Geolocalización de Ruta
            </span>
          </div>
          <div ref={mapContainerRef} className="flex-1 w-full bg-[#0a0216] cursor-grab active:cursor-grabbing" />
        </section>

      </div>

      {/* ── MODAL PASARELA DE PAGO / RESERVA COMERCIAL ── */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-white/10 p-6 space-y-6 bg-[#1a0533] shadow-2xl relative">
            
            <button 
              onClick={() => { setShowBookingModal(false); setBookingSuccess(false); }}
              className="absolute top-4 right-4 p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {bookingSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/20">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-black text-white">¡Reserva Completada!</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-1">
                    Tu itinerario en **{itineraryData?.destination}** ha sido procesado. Se envió un correo con los detalles y los vouchers de los hoteles.
                  </p>
                </div>
                <div className="pt-2">
                  <button 
                    onClick={() => { setShowBookingModal(false); setBookingSuccess(false); }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-95 text-white font-black text-xs cursor-pointer border-none"
                  >
                    Excelente, gracias
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00C8D4]/10 border border-[#00C8D4]/20 flex items-center justify-center text-[#00C8D4]">
                    <Hotel className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase text-white tracking-wider">Confirmar Itinerario</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Hoteles de Venezuela LLC</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-xs font-semibold text-slate-350">
                  <div className="flex justify-between">
                    <span>Destino Planificado:</span>
                    <span className="text-white font-bold">{itineraryData?.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duración del Itinerario:</span>
                    <span className="text-white font-bold">{itineraryData?.days} Días</span>
                  </div>
                  <div className="space-y-1.5 border-y border-white/5 py-3">
                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-black block">Servicios y Noches Incluidas</span>
                    {itineraryData?.itinerary.map((d, i) => (
                      <div key={i} className="flex justify-between text-[11px]">
                        <span className="truncate max-w-[240px]">Día {d.dia}: {d.hotel_name}</span>
                        <span className="text-white font-bold">${d.costo_estimado}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm font-black pt-1">
                    <span className="text-white">Total a Pagar (IVA Incl.):</span>
                    <span className="text-[#00C8D4]">${itineraryData?.total_cost} USD</span>
                  </div>
                </div>

                {/* BOTÓN DE CONFIRMACIÓN */}
                <div className="pt-2">
                  <button 
                    onClick={handleConfirmBooking}
                    disabled={bookingLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-transform hover:scale-102 cursor-pointer disabled:opacity-50"
                  >
                    {bookingLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Procesando pago...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" /> Pagar con Tarjeta / Transferencia
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
