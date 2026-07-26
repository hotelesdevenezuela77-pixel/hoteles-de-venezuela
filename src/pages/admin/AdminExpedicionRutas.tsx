import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Compass, MapPin, Play, Square, Plus, History, 
  ChevronRight, Loader2, Camera, AlertTriangle, Trash2, 
  Map, Save, PlusCircle, Building2, Sparkles, Clock, 
  Navigation, User, Check, RefreshCw, X
} from "lucide-react";

// Estructura de coordenadas con marca de tiempo
interface RouteCoordinate {
  lat: number;
  lng: number;
  timestamp: number;
}

// Estructura de Punto de Interés registrado en la expedición
interface RegisteredPoint {
  id: string;
  name: string;
  description: string;
  type: "establishment" | "tourist_site";
  category: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  created_at: string;
}

// Estructura de una Ruta de Expedición guardada
interface SavedExpedition {
  id: string;
  name: string;
  date: string;
  coords: RouteCoordinate[];
  points: RegisteredPoint[];
  distance: number; // en km
  duration: number; // en segundos
}

// Coordenadas por defecto de Venezuela
const VENEZUELA_CENTER: [number, number] = [10.4806, -66.9036]; // Caracas

export function AdminExpedicionRutas() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, nav] = useLocation();

  // Estados de control de la Expedición
  const [isTracking, setIsTracking] = useState(false);
  const [expeditions, setExpeditions] = useState<SavedExpedition[]>([]);
  const [selectedExpedition, setSelectedExpedition] = useState<SavedExpedition | null>(null);
  const [activeTab, setActiveTab] = useState<"activa" | "historial">("activa");
  const [mapType, setMapType] = useState<"streets" | "satellite">("streets");

  // Métricas en tiempo real
  const [routeCoords, setRouteCoords] = useState<RouteCoordinate[]>([]);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsSpeed, setGpsSpeed] = useState<number | null>(null); // en m/s o km/h
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distanceTraveled, setDistanceTraveled] = useState(0); // en km

  // Estado para capturar puntos de interés
  const [pointsInRoute, setPointsInRoute] = useState<RegisteredPoint[]>([]);
  const [showPointModal, setShowPointModal] = useState(false);
  const [pointForm, setPointForm] = useState({
    name: "",
    description: "",
    type: "tourist_site" as "establishment" | "tourist_site",
    category: "playas",
    image: ""
  });
  const [currentGpsPoint, setCurrentGpsPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [isSavingPoint, setIsSavingPoint] = useState(false);

  // Carga de establecimientos existentes para marcarlos en el mapa
  const [existingEsts, setExistingEsts] = useState<any[]>([]);
  const [loadingEsts, setLoadingEsts] = useState(false);

  // Referencias para el mapa Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const trackingMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const pointsGroupRef = useRef<L.FeatureGroup | null>(null);
  const establishmentsGroupRef = useRef<L.FeatureGroup | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Validar autorización de administrador
  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== "admin" && user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))) {
      nav("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading]);

  // Load saved expeditions on mount
  useEffect(() => {
    const saved = localStorage.getItem("hdv_expediciones");
    if (saved) {
      setExpeditions(JSON.parse(saved));
    }
    fetchExistingEstablishments();
  }, []);

  const fetchExistingEstablishments = async () => {
    try {
      setLoadingEsts(true);
      const { data, error } = await supabase
        .from("establishments")
        .select("id, name, latitude, longitude, category_slug, status")
        .eq("status", "approved");

      if (error) throw error;
      if (data) setExistingEsts(data);
    } catch (e) {
      console.warn("Error consultando establecimientos en Supabase para el mapa de expediciones:", e);
      // Fallback a mock si Supabase falla
      setExistingEsts([]);
    } finally {
      setLoadingEsts(false);
    }
  };

  // 2. Fórmulas de cálculo de distancia (Haversine)
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
  };

  // 3. Inicialización del Mapa
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Si ya existe una instancia de mapa, la eliminamos antes de volver a crearla
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Inicializar mapa en el centro de Caracas por defecto o en la ubicación GPS si ya se tiene
    const initialCenter = currentLocation || VENEZUELA_CENTER;
    const initialZoom = currentLocation ? 14 : 7;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true
    });

    mapRef.current = map;

    // Configurar capa de mapa base
    if (mapType === "satellite") {
      // Capa Satelital Esri
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri &mdash; Source: Esri"
      }).addTo(map);
      // Etiquetas y bordes satelitales
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}").addTo(map);
    } else {
      // Capa Calles Estándar
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
    }

    // Crear grupos de capas para organizar elementos
    pointsGroupRef.current = L.featureGroup().addTo(map);
    establishmentsGroupRef.current = L.featureGroup().addTo(map);

    // Dibujar establecimientos preexistentes
    drawExistingEstablishments();

    // Dibujar ruta e historial si hay seleccionada una expedición
    if (activeTab === "historial" && selectedExpedition) {
      drawSavedRoute(selectedExpedition);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapType, activeTab, selectedExpedition]);

  // Redibujar la polilínea en ruta activa cuando cambia el estado de coordenadas
  useEffect(() => {
    if (!mapRef.current || activeTab !== "activa") return;

    // Actualizar o crear polilínea del recorrido trazado
    const latLngs = routeCoords.map(c => [c.lat, c.lng] as [number, number]);
    
    if (routePolylineRef.current) {
      routePolylineRef.current.setLatLngs(latLngs);
    } else {
      routePolylineRef.current = L.polyline(latLngs, {
        color: "#FF0096", // Magenta Oficial
        weight: 5,
        opacity: 0.85
      }).addTo(mapRef.current);
    }

    // Actualizar marcador de posición GPS actual
    if (currentLocation) {
      const liveIcon = L.divIcon({
        className: "live-position-marker",
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-6 h-6 rounded-full bg-[#00C8D4]/30 animate-ping"></div>
            <div class="w-4.5 h-4.5 rounded-full bg-[#00C8D4] border-2 border-white shadow-md"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      if (trackingMarkerRef.current) {
        trackingMarkerRef.current.setLatLng(currentLocation);
      } else {
        trackingMarkerRef.current = L.marker(currentLocation, { icon: liveIcon }).addTo(mapRef.current);
      }
    }
  }, [routeCoords, currentLocation, activeTab]);

  // Dibujar puntos registrados en la expedición activa
  useEffect(() => {
    if (!mapRef.current || !pointsGroupRef.current || activeTab !== "activa") return;
    pointsGroupRef.current.clearLayers();

    pointsInRoute.forEach(pt => {
      const pinColor = pt.type === "establishment" ? "#00C8D4" : "#9B00CC";
      const icon = L.divIcon({
        className: "expedition-point-marker",
        html: `
          <div style="
            width: 28px;
            height: 28px;
            background: ${pinColor};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 3px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background: white;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      });

      const popupHtml = `
        <div style="min-width: 160px; font-family: sans-serif; text-align: left; padding: 4px;">
          <h4 style="margin: 0 0 4px 0; font-weight: 900; color: #1e293b; font-size: 13px;">${pt.name}</h4>
          <span style="font-size: 9px; font-weight: bold; text-transform: uppercase; color: #FF0096; background: #FF0096/10; padding: 2px 6px; border-radius: 4px;">
            ${pt.type === "establishment" ? "Establecimiento" : "Sitio Turístico"}
          </span>
          <p style="margin: 6px 0 0 0; font-size: 11px; color: #64748b; line-height: 1.3;">${pt.description}</p>
          ${pt.imageUrl ? `<img src="${pt.imageUrl}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 8px; margin-top: 8px;" />` : ""}
        </div>
      `;

      L.marker([pt.latitude, pt.longitude], { icon })
        .addTo(pointsGroupRef.current!)
        .bindPopup(popupHtml);
    });
  }, [pointsInRoute, activeTab]);

  // Dibujar establecimientos de la BD en el mapa
  const drawExistingEstablishments = () => {
    if (!mapRef.current || !establishmentsGroupRef.current) return;
    establishmentsGroupRef.current.clearLayers();

    existingEsts.forEach(est => {
      if (!est.latitude || !est.longitude) return;

      const markerIcon = L.divIcon({
        className: "db-hotel-marker",
        html: `
          <div class="w-6 h-6 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center shadow-lg" style="opacity: 0.65;">
            <span style="font-size: 10px;">🏨</span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([est.latitude, est.longitude], { icon: markerIcon })
        .addTo(establishmentsGroupRef.current!)
        .bindPopup(`<strong style="font-family: sans-serif; font-size:12px; color:#1e293b;">${est.name}</strong><br/><span style="font-size:10px; color:#94a3b8;">Establecimiento Registrado</span>`);
    });
  };

  // Dibujar recorrido histórico seleccionado
  const drawSavedRoute = (exp: SavedExpedition) => {
    if (!mapRef.current || !pointsGroupRef.current) return;
    pointsGroupRef.current.clearLayers();

    // Dibujar Trazado de Tramos
    const latLngs = exp.coords.map(c => [c.lat, c.lng] as [number, number]);
    if (latLngs.length > 0) {
      L.polyline(latLngs, {
        color: "#9B00CC", // Morado
        weight: 5,
        opacity: 0.75
      }).addTo(pointsGroupRef.current);

      // Centrar el mapa en la ruta guardada
      const bounds = L.latLngBounds(latLngs);
      mapRef.current.fitBounds(bounds, { padding: [30, 30] });

      // Marcar inicio y fin
      const startIcon = L.divIcon({
        html: '<div class="w-5 h-5 rounded-full bg-green-500 border-2 border-white shadow-md flex items-center justify-center font-black text-[9px] text-white">I</div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      const endIcon = L.divIcon({
        html: '<div class="w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow-md flex items-center justify-center font-black text-[9px] text-white">F</div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker(latLngs[0], { icon: startIcon }).addTo(pointsGroupRef.current).bindPopup("<strong>Punto de Partida</strong>");
      L.marker(latLngs[latLngs.length - 1], { icon: endIcon }).addTo(pointsGroupRef.current).bindPopup("<strong>Punto de Destino</strong>");
    }

    // Dibujar Puntos creados en esa expedición
    exp.points.forEach(pt => {
      const pinColor = pt.type === "establishment" ? "#00C8D4" : "#FF0096";
      const icon = L.divIcon({
        html: `
          <div style="
            width: 28px;
            height: 28px;
            background: ${pinColor};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 3px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background: white;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      });

      const popupHtml = `
        <div style="min-width: 160px; font-family: sans-serif; text-align: left; padding: 4px;">
          <h4 style="margin: 0 0 4px 0; font-weight: 900; color: #1e293b; font-size: 13px;">${pt.name}</h4>
          <span style="font-size: 9px; font-weight: bold; text-transform: uppercase; color: #FF0096; background: #FF0096/10; padding: 2px 6px; border-radius: 4px;">
            ${pt.type === "establishment" ? "Establecimiento" : "Sitio Turístico"}
          </span>
          <p style="margin: 6px 0 0 0; font-size: 11px; color: #64748b; line-height: 1.3;">${pt.description}</p>
          ${pt.imageUrl ? `<img src="${pt.imageUrl}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 8px; margin-top: 8px;" />` : ""}
        </div>
      `;

      L.marker([pt.latitude, pt.longitude], { icon })
        .addTo(pointsGroupRef.current!)
        .bindPopup(popupHtml);
    });
  };

  // 4. Iniciar y Detener Expedición
  const startExpedition = () => {
    if (!navigator.geolocation) {
      alert("Tu dispositivo no soporta geolocalización o GPS.");
      return;
    }

    setIsTracking(true);
    setRouteCoords([]);
    setPointsInRoute([]);
    setDistanceTraveled(0);
    setElapsedTime(0);
    setCurrentLocation(null);

    // Iniciar Reloj / Timer
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    // Activar Geolocalización de Alta Precisión
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed } = position.coords;
        const newCoord: RouteCoordinate = {
          lat: latitude,
          lng: longitude,
          timestamp: position.timestamp
        };

        setCurrentLocation([latitude, longitude]);
        setGpsAccuracy(accuracy);
        setGpsSpeed(speed !== null ? Math.round(speed * 3.6) : 0); // Convertir de m/s a km/h

        setRouteCoords(prev => {
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            // Calcular distancia con el último punto en km
            const delta = getDistance(last.lat, last.lng, latitude, longitude);
            
            // Filtrar saltos de señal espurios (sólo sumar si la precisión es decente y hay movimiento real)
            if (delta > 0.005) { // al menos 5 metros de movimiento
              setDistanceTraveled(d => parseFloat((d + delta).toFixed(3)));
              return [...prev, newCoord];
            }
            return prev;
          }
          return [newCoord];
        });

        // Autocentrar el mapa en la posición actual
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 15);
        }
      },
      (error) => {
        console.error("GPS Error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const stopAndSaveExpedition = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsTracking(false);

    // Solicitar nombre para la expedición
    const defaultName = `Expedición ${new Date().toLocaleDateString("es-VE")} - ${new Date().toLocaleTimeString("es-VE", { hour: '2-digit', minute: '2-digit' })}`;
    const routeName = prompt("Ingresa un nombre para guardar esta ruta:", defaultName);

    if (routeName === null) {
      // Cancelado
      return;
    }

    const nameToSave = routeName.trim() || defaultName;

    const newExpedition: SavedExpedition = {
      id: Math.random().toString(36).substring(2, 9),
      name: nameToSave,
      date: new Date().toISOString(),
      coords: routeCoords,
      points: pointsInRoute,
      distance: distanceTraveled,
      duration: elapsedTime
    };

    const updated = [newExpedition, ...expeditions];
    setExpeditions(updated);
    localStorage.setItem("hdv_expediciones", JSON.stringify(updated));

    // Sincronizar los nuevos puntos creados
    syncPointsWithDatabase(pointsInRoute);

    alert(`¡Expedición "${nameToSave}" guardada exitosamente! Se registraron ${pointsInRoute.length} nuevos puntos de interés.`);
    
    // Cambiar a la pestaña de historial para ver la ruta
    setSelectedExpedition(newExpedition);
    setActiveTab("historial");
  };

  // 5. Carga de Imágenes a Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen excede los 2MB. Por favor carga una foto comprimida.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPointForm(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // 6. Registro de Punto de Interés
  const openAddPointModal = () => {
    if (!currentLocation) {
      alert("Buscando señal GPS actual. Por favor espera a tener cobertura GPS.");
      return;
    }
    setCurrentGpsPoint({ lat: currentLocation[0], lng: currentLocation[1] });
    setPointForm({
      name: "",
      description: "",
      type: "tourist_site",
      category: "playas",
      image: ""
    });
    setShowPointModal(true);
  };

  const handleSavePointSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pointForm.name || !currentGpsPoint) return;

    setIsSavingPoint(true);
    const newPoint: RegisteredPoint = {
      id: Math.random().toString(36).substring(2, 9),
      name: pointForm.name,
      description: pointForm.description,
      type: pointForm.type,
      category: pointForm.category,
      latitude: currentGpsPoint.lat,
      longitude: currentGpsPoint.lng,
      imageUrl: pointForm.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300",
      created_at: new Date().toISOString()
    };

    setPointsInRoute(prev => [...prev, newPoint]);
    setShowPointModal(false);
    setIsSavingPoint(false);
  };

  // 7. Sincronizar puntos con Supabase
  const syncPointsWithDatabase = async (points: RegisteredPoint[]) => {
    for (const pt of points) {
      const slug = pt.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      
      if (pt.type === "establishment") {
        try {
          const payload = {
            name: pt.name,
            slug,
            description: pt.description,
            address: `Coordenadas: [${pt.latitude}, ${pt.longitude}]`,
            phone: "+58 414-0000000",
            whatsapp: "584140000000",
            website: "",
            rating_avg: 4.0,
            review_count: 1,
            price_level: "$$",
            is_featured: false,
            services: "[]",
            membership_tier: "basic",
            status: "approved",
            latitude: pt.latitude,
            longitude: pt.longitude
          };

          const { error } = await supabase.from("establishments").insert([payload]);
          if (error) throw error;
        } catch (err) {
          const localEstKey = "hdv_mock_establishments";
          const existing = JSON.parse(localStorage.getItem(localEstKey) || "[]");
          const mockItem = {
            id: Math.floor(Math.random() * 90000),
            name: pt.name,
            slug,
            description: pt.description,
            latitude: pt.latitude,
            longitude: pt.longitude,
            category_slug: pt.category,
            primary_image: pt.imageUrl,
            status: "approved",
            created_at: pt.created_at
          };
          localStorage.setItem(localEstKey, JSON.stringify([...existing, mockItem]));
        }
      } else {
        try {
          const payload = {
            name: pt.name,
            slug,
            short_description: pt.description.substring(0, 80),
            long_description: pt.description,
            image_url: pt.imageUrl,
            category: pt.category,
            is_featured: false,
            is_active: true,
            sort_order: 1
          };
          const { error } = await supabase.from("tourist_sites").insert([payload]);
          if (error) throw error;
        } catch (err) {
          const localSitesKey = "hdv_mock_tourist_sites";
          const existing = JSON.parse(localStorage.getItem(localSitesKey) || "[]");
          const mockItem = {
            id: Math.floor(Math.random() * 90000),
            name: pt.name,
            slug,
            short_description: pt.description.substring(0, 80),
            long_description: pt.description,
            image_url: pt.imageUrl,
            category: pt.category,
            latitude: pt.latitude,
            longitude: pt.longitude,
            is_featured: false,
            is_active: true,
            sort_order: 1,
            created_at: pt.created_at
          };
          localStorage.setItem(localSitesKey, JSON.stringify([...existing, mockItem]));
        }
      }
    }
    fetchExistingEstablishments();
  };

  const deleteExpedition = (id: string) => {
    if (!confirm("¿Deseas eliminar permanentemente esta expedición?")) return;
    const filtered = expeditions.filter(e => e.id !== id);
    setExpeditions(filtered);
    localStorage.setItem("hdv_expediciones", JSON.stringify(filtered));
    if (selectedExpedition?.id === id) {
      setSelectedExpedition(null);
    }
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [
      h > 0 ? String(h).padStart(2, "0") : null,
      String(m).padStart(2, "0"),
      String(s).padStart(2, "0")
    ].filter(Boolean).join(":");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0e011f] flex flex-col items-center justify-center gap-3 text-white">
        <Loader2 className="w-10 h-10 text-[#FF0096] animate-spin" />
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-left">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
               style={{ background: "linear-gradient(135deg, #FF0096 0%, #9B00CC 100%)" }}>
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>EXPEDICIÓN DE RUTAS GPS</span>
              {isTracking && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>Grabando</span>
                </span>
              )}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
              Rastrea trayectos, capta coordenadas de carretera y alimenta la base de datos en tiempo real
            </p>
          </div>
        </div>

        <div className="flex bg-slate-950/60 p-1 border border-white/5 rounded-2xl self-end md:self-auto">
          <button
            onClick={() => setActiveTab("activa")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "activa"
                ? "bg-[#FF0096] text-white shadow-lg shadow-[#FF0096]/20 font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Expedición</span>
          </button>
          <button
            onClick={() => setActiveTab("historial")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "historial"
                ? "bg-[#FF0096] text-white shadow-lg shadow-[#FF0096]/20 font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial ({expeditions.length})</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Controles e Indicadores */}
        <div className="space-y-6 lg:col-span-1">
          
          {activeTab === "activa" && (
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-md space-y-6">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <Play className="w-4 h-4 text-[#00C8D4]" />
                <span>Panel de Grabación</span>
              </h3>

              {!isTracking ? (
                <button
                  onClick={startExpedition}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white rounded-2xl font-black text-xs cursor-pointer shadow-lg shadow-[#FF0096]/15 hover:scale-102 transition-transform"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>INICIAR EXPEDICIÓN</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={openAddPointModal}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#00C8D4] hover:bg-[#00B4C0] text-slate-900 rounded-2xl font-black text-xs cursor-pointer shadow-lg transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>REGISTRAR PUNTO EN RUTA</span>
                  </button>

                  <button
                    onClick={stopAndSaveExpedition}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs cursor-pointer shadow-lg transition-colors"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>FINALIZAR Y GUARDAR</span>
                  </button>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-white/5 text-xs">
                <div className="flex justify-between items-center bg-slate-950/40 p-3.5 rounded-2xl border border-white/5">
                  <span className="font-bold text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#FF0096]" />
                    Duración:
                  </span>
                  <span className="font-mono font-black text-white text-md">{formatTime(elapsedTime)}</span>
                </div>

                <div className="flex justify-between items-center bg-slate-950/40 p-3.5 rounded-2xl border border-white/5">
                  <span className="font-bold text-slate-400 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#00C8D4]" />
                    Distancia:
                  </span>
                  <span className="font-mono font-black text-[#00C8D4] text-md">{distanceTraveled.toFixed(2)} km</span>
                </div>

                <div className="flex justify-between items-center bg-slate-950/40 p-3.5 rounded-2xl border border-white/5">
                  <span className="font-bold text-slate-400 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-yellow-500" />
                    Velocidad:
                  </span>
                  <span className="font-mono font-black text-white text-md">
                    {gpsSpeed !== null ? `${gpsSpeed} km/h` : "0 km/h"}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-slate-950/40 p-3.5 rounded-2xl border border-white/5">
                  <span className="font-bold text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-500" />
                    Puntos creados:
                  </span>
                  <span className="font-mono font-black text-white text-md">{pointsInRoute.length}</span>
                </div>

                <div className="flex justify-between items-center bg-slate-950/40 p-3.5 rounded-2xl border border-white/5">
                  <span className="font-bold text-slate-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Precisión GPS:
                  </span>
                  <span className="font-mono font-black text-white text-md">
                    {gpsAccuracy !== null ? `±${Math.round(gpsAccuracy)}m` : "Buscando señal..."}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-yellow-400 leading-normal">
                  <strong>IMPORTANTE:</strong> Asegúrate de tener el GPS activo. No operes la pantalla mientras conduces.
                </p>
              </div>
            </div>
          )}

          {activeTab === "historial" && (
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-md space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 mb-2">
                <History className="w-4 h-4 text-[#FF0096]" />
                <span>Rutas Guardadas</span>
              </h3>

              {expeditions.length === 0 ? (
                <div className="text-center py-10 bg-slate-950/20 border border-white/5 rounded-2xl p-6">
                  <Compass className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-400 text-xs font-bold">No hay rutas grabadas aún.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {expeditions.map(exp => {
                    const active = selectedExpedition?.id === exp.id;
                    return (
                      <div
                        key={exp.id}
                        onClick={() => setSelectedExpedition(exp)}
                        className={`p-4 border rounded-2xl cursor-pointer transition-all text-left ${
                          active
                            ? "bg-[#FF0096]/15 border-[#FF0096]"
                            : "bg-slate-950/30 border-white/5 hover:bg-slate-950/50"
                        }`}
                      >
                        <h4 className="text-xs font-black text-white leading-tight mb-1 truncate">{exp.name}</h4>
                        <span className="text-[9px] font-bold text-slate-400 block mb-2">
                          {new Date(exp.date).toLocaleDateString("es-VE")}
                        </span>
                        
                        <div className="flex justify-between items-center text-[10px] text-slate-300">
                          <span className="font-mono font-bold text-[#00C8D4]">{exp.distance.toFixed(2)} km</span>
                          <span className="font-mono">{formatTime(exp.duration)}</span>
                          <span className="font-mono bg-white/5 border border-white/5 px-2 py-0.5 rounded text-white text-[9px]">
                            {exp.points?.length || 0} pts
                          </span>
                        </div>

                        <div className="flex justify-end pt-3 mt-3 border-t border-white/5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteExpedition(exp.id);
                            }}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Mapa y Selector de Capas */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-4 backdrop-blur-md space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-2">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-[#00C8D4]" />
                <span className="text-xs font-bold text-slate-300">
                  {activeTab === "activa" ? "Mapa de Expedición Activa" : `Visualizando: ${selectedExpedition?.name || "Selecciona una ruta"}`}
                </span>
              </div>

              <div className="flex bg-slate-950/60 p-1 border border-white/5 rounded-xl shrink-0">
                <button
                  onClick={() => setMapType("streets")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    mapType === "streets" ? "bg-slate-800 text-white font-black" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Mapa Vial
                </button>
                <button
                  onClick={() => setMapType("satellite")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    mapType === "satellite" ? "bg-slate-800 text-[#00C8D4] font-black" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Satelital
                </button>
              </div>
            </div>

            <div className="relative w-full h-[580px] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
              <div ref={mapContainerRef} className="w-full h-full z-10" />

              <div className="absolute bottom-4 right-4 z-20 bg-slate-955/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-2.5 max-w-xs shadow-2xl text-[10px] text-left">
                <h4 className="font-bold text-white uppercase tracking-wider mb-1 text-[9px]">Leyenda</h4>
                
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00C8D4] inline-block shrink-0 animate-pulse"></span>
                  <span>Mi Posición GPS</span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF0096] inline-block shrink-0"></span>
                  <span>Ruta Recorrida</span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9B00CC] inline-block shrink-0"></span>
                  <span>Nuevo Punto Cargado</span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block shrink-0"></span>
                  <span>Establecimiento Aprobado</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Modal: Agregar Punto */}
      {showPointModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl space-y-6 text-left">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00C8D4]/15 text-[#00C8D4] flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-md">Registrar Punto</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">GPS Activo</p>
                </div>
              </div>
              <button
                onClick={() => setShowPointModal(false)}
                className="p-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePointSubmit} className="space-y-4">
              
              <div className="bg-slate-950/50 border border-white/5 p-3 rounded-2xl flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="font-sans font-bold uppercase text-slate-500">Coordenadas:</span>
                <span>{currentGpsPoint?.lat.toFixed(6)}, {currentGpsPoint?.lng.toFixed(6)}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nombre del Sitio</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Salto Llovizna, Cabañas El Portón"
                  value={pointForm.name}
                  onChange={e => setPointForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-955/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#FF0096] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tipo</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPointForm(prev => ({ ...prev, type: "tourist_site" }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      pointForm.type === "tourist_site"
                        ? "bg-[#FF0096]/20 border-[#FF0096] text-[#FF0096]"
                        : "bg-slate-950/30 border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span>Sitio Turístico</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPointForm(prev => ({ ...prev, type: "establishment" }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      pointForm.type === "establishment"
                        ? "bg-[#00C8D4]/20 border-[#00C8D4] text-[#00C8D4]"
                        : "bg-slate-950/30 border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Establecimiento</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Categoría</label>
                <select
                  value={pointForm.category}
                  onChange={e => setPointForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-slate-955/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 outline-none focus:border-[#FF0096] cursor-pointer"
                >
                  {pointForm.type === "establishment" ? (
                    <>
                      <option value="hoteles">Hoteles / Suites</option>
                      <option value="posadas">Posadas / Estancias</option>
                      <option value="restaurantes">Restaurantes</option>
                      <option value="cafes">Cafés y Bares</option>
                    </>
                  ) : (
                    <>
                      <option value="playas">Playas</option>
                      <option value="cascadas">Cascadas / Ríos</option>
                      <option value="montanas">Montañas / Senderismo</option>
                      <option value="aventura">Aventura y Deportes</option>
                      <option value="cultura">Cultura e Histórico</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Descripción o Reseña</label>
                <textarea
                  placeholder="Detalles sobre atractivos, servicios, etc..."
                  value={pointForm.description}
                  onChange={e => setPointForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-slate-955/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#FF0096] transition-colors resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Foto del Lugar (Cargar/Celular)</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950/85 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white cursor-pointer hover:border-[#FF0096] transition-all">
                    <Camera className="w-4 h-4 text-[#FF0096]" />
                    <span>Tomar Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  
                  {pointForm.image && (
                    <img
                      src={pointForm.image}
                      alt="Vista previa"
                      className="w-12 h-12 rounded-xl object-cover border border-white/10"
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowPointModal(false)}
                  className="flex-1 py-2.5 bg-slate-950 border border-white/5 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingPoint || !pointForm.name}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 text-center flex items-center justify-center gap-1.5"
                >
                  {isSavingPoint ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
