import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  Compass, MapPin, Play, Square, Plus, History, 
  ChevronRight, Camera, AlertTriangle, Trash2, 
  Map, Save, Building2, Sparkles, Clock, 
  Navigation, User, Check, RefreshCw, X, Layers
} from "lucide-react";

interface RouteCoordinate {
  lat: number;
  lng: number;
  timestamp: number;
}

interface RegisteredPoint {
  id: string;
  name: string;
  description: string;
  category: "spot_fotografico" | "gasolinera" | "mirador" | "posada" | "restaurante" | "alerta_vial";
  latitude: number;
  longitude: number;
  created_at: string;
}

interface SavedCreatorExpedition {
  id: string;
  establishment_id: number;
  name: string;
  date: string;
  coords: RouteCoordinate[];
  points: RegisteredPoint[];
  distance: number; // in km
  duration: number; // in seconds
}

const VENEZUELA_CENTER: [number, number] = [10.4806, -66.9036]; // Caracas default

interface CreatorRouteExpeditionMapProps {
  establishmentId: number;
  creatorName?: string;
}

export const CreatorRouteExpeditionMap: React.FC<CreatorRouteExpeditionMapProps> = ({
  establishmentId,
  creatorName = "Aura Croce"
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [expeditions, setExpeditions] = useState<SavedCreatorExpedition[]>([]);
  const [selectedExpedition, setSelectedExpedition] = useState<SavedCreatorExpedition | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"activa" | "historial">("activa");
  const [mapType, setMapType] = useState<"streets" | "satellite">("streets");

  // Realtime Telemetry
  const [routeCoords, setRouteCoords] = useState<RouteCoordinate[]>([]);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsSpeed, setGpsSpeed] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distanceTraveled, setDistanceTraveled] = useState(0);

  // Points of Interest in route
  const [pointsInRoute, setPointsInRoute] = useState<RegisteredPoint[]>([]);
  const [showPointModal, setShowPointModal] = useState(false);
  const [pointForm, setPointForm] = useState({
    name: "",
    description: "",
    category: "spot_fotografico" as RegisteredPoint["category"]
  });

  const storageKey = `hdv_creator_expeditions_est_${establishmentId}`;

  // Leaflet Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const trackingMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const pointsGroupRef = useRef<L.FeatureGroup | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setExpeditions(JSON.parse(saved));
    }
  }, [establishmentId]);

  const saveExpeditionsToStorage = (updated: SavedCreatorExpedition[]) => {
    setExpeditions(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  // Haversine formula
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const initialCenter = currentLocation || VENEZUELA_CENTER;
    const initialZoom = currentLocation ? 14 : 7;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true
    });

    mapRef.current = map;

    if (mapType === "satellite") {
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri"
      }).addTo(map);
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}").addTo(map);
    } else {
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
    }

    pointsGroupRef.current = L.featureGroup().addTo(map);

    if (activeSubTab === "historial" && selectedExpedition) {
      drawSavedRoute(selectedExpedition);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapType, activeSubTab, selectedExpedition]);

  // Redraw polyline for active route
  useEffect(() => {
    if (!mapRef.current || activeSubTab !== "activa") return;

    const latLngs = routeCoords.map(c => [c.lat, c.lng] as [number, number]);

    if (routePolylineRef.current) {
      routePolylineRef.current.setLatLngs(latLngs);
    } else {
      routePolylineRef.current = L.polyline(latLngs, {
        color: "#FF0096", // Magenta Official
        weight: 5,
        opacity: 0.85
      }).addTo(mapRef.current);
    }

    if (currentLocation) {
      const liveIcon = L.divIcon({
        className: "live-position-marker",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: rgba(0,200,212,0.4); animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width: 14px; height: 14px; border-radius: 50%; background-color: #00C8D4; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>
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
  }, [routeCoords, currentLocation, activeSubTab]);

  // Draw points of interest
  useEffect(() => {
    if (!mapRef.current || !pointsGroupRef.current || activeSubTab !== "activa") return;
    pointsGroupRef.current.clearLayers();

    pointsInRoute.forEach(pt => {
      const icon = L.divIcon({
        className: "creator-point-marker",
        html: `
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: linear-gradient(135deg, #FF0096 0%, #9B00CC 100%);
            border: 2px solid white;
            box-shadow: 0 4px 10px rgba(255,0,150,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: font-black;
          ">📍</div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const m = L.marker([pt.latitude, pt.longitude], { icon })
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #1e293b; min-width: 160px;">
            <strong style="color: #FF0096; font-size: 13px;">${pt.name}</strong>
            <p style="margin: 4px 0 0 0; color: #64748b;">${pt.description || "Punto de interés de expedición"}</p>
            <span style="font-size: 10px; color: #00C8D4; font-weight: bold;">${pt.category.toUpperCase()}</span>
          </div>
        `);
      pointsGroupRef.current?.addLayer(m);
    });
  }, [pointsInRoute, activeSubTab]);

  // Start GPS tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización GPS.");
      return;
    }

    setIsTracking(true);
    setRouteCoords([]);
    setPointsInRoute([]);
    setElapsedTime(0);
    setDistanceTraveled(0);

    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed } = pos.coords;
        const newCoord: RouteCoordinate = { lat: latitude, lng: longitude, timestamp: Date.now() };

        setCurrentLocation([latitude, longitude]);
        setGpsAccuracy(accuracy ? Math.round(accuracy) : null);
        setGpsSpeed(speed !== null && speed !== undefined ? Math.round(speed * 3.6) : 0);

        setRouteCoords(prev => {
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const addedDist = getDistance(last.lat, last.lng, latitude, longitude);
            setDistanceTraveled(d => d + addedDist);
          }
          return [...prev, newCoord];
        });

        if (mapRef.current) {
          mapRef.current.panTo([latitude, longitude]);
        }
      },
      (err) => {
        console.warn("GPS Error:", err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // Stop tracking and save expedition
  const stopTracking = () => {
    setIsTracking(false);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (routeCoords.length < 2) {
      alert("La expedición registró muy pocas coordenadas. Se ha descartado.");
      return;
    }

    const name = prompt("Asigna un nombre a la expedición de ruta realizada:", `Expedición ${creatorName} - ${new Date().toLocaleDateString()}`);
    if (!name) return;

    const newExpedition: SavedCreatorExpedition = {
      id: `exp-${Date.now()}`,
      establishment_id: establishmentId,
      name,
      date: new Date().toISOString(),
      coords: routeCoords,
      points: pointsInRoute,
      distance: Number(distanceTraveled.toFixed(2)),
      duration: elapsedTime
    };

    saveExpeditionsToStorage([newExpedition, ...expeditions]);
    alert("¡Expedición de ruta guardada con éxito en tu bitácora personal!");
  };

  // Add Point of Interest
  const handleSavePoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pointForm.name.trim() || !currentLocation) {
      alert("Debes tener una ubicación GPS activa para marcar un punto.");
      return;
    }

    const newPt: RegisteredPoint = {
      id: `pt-${Date.now()}`,
      name: pointForm.name.trim(),
      description: pointForm.description.trim(),
      category: pointForm.category,
      latitude: currentLocation[0],
      longitude: currentLocation[1],
      created_at: new Date().toISOString()
    };

    setPointsInRoute(prev => [...prev, newPt]);
    setPointForm({ name: "", description: "", category: "spot_fotografico" });
    setShowPointModal(false);
  };

  // Draw saved route on map
  const drawSavedRoute = (exp: SavedCreatorExpedition) => {
    if (!mapRef.current || !exp.coords || exp.coords.length === 0) return;

    const latLngs = exp.coords.map(c => [c.lat, c.lng] as [number, number]);
    L.polyline(latLngs, { color: "#00C8D4", weight: 6, opacity: 0.9 }).addTo(mapRef.current);

    if (pointsGroupRef.current) {
      pointsGroupRef.current.clearLayers();
      (exp.points || []).forEach(pt => {
        const icon = L.divIcon({
          className: "saved-point-icon",
          html: `<div style="width: 24px; height: 24px; border-radius: 50%; background: #FF0096; border: 2px solid white;"></div>`,
          iconSize: [24, 24]
        });
        const m = L.marker([pt.latitude, pt.longitude], { icon })
          .bindPopup(`<b>${pt.name}</b><br/>${pt.description}`);
        pointsGroupRef.current?.addLayer(m);
      });
    }

    mapRef.current.fitBounds(L.latLngBounds(latLngs));
  };

  const formatDuration = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs > 0 ? hrs + "h " : ""}${mins}m ${secs}s`;
  };

  return (
    <div className="rounded-3xl bg-[#1a0533]/90 border border-white/10 p-6 shadow-2xl backdrop-blur-md mb-8 text-slate-100">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FF0096]/20 text-[#FF0096] border border-[#FF0096]/40">
              EXPEDICIÓN DE RUTAS GPS (CREADOR PERSONAL)
            </span>
            <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/40 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
              Bi-Satelital & Telemetría HDV
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-1">
            Mapeo & Rastreador de Rutas de {creatorName}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registra trayectos, capta coordenadas de carretera y alimenta tu bitácora exclusiva de creador en tiempo real.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-900 border border-white/10 rounded-2xl p-1">
            <button
              onClick={() => setActiveSubTab("activa")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === "activa" ? "bg-[#FF0096] text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Expedición Activa
            </button>
            <button
              onClick={() => setActiveSubTab("historial")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === "historial" ? "bg-[#FF0096] text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Historial ({expeditions.length})
            </button>
          </div>

          <button
            onClick={() => setMapType(m => m === "streets" ? "satellite" : "streets")}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-slate-300 hover:text-white"
          >
            <Layers className="w-4 h-4 text-[#00C8D4]" />
            <span>{mapType === "streets" ? "Ver Satelital" : "Ver Callejero"}</span>
          </button>
        </div>
      </div>

      {activeSubTab === "activa" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Telemetry Control Box */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-950/60 border border-white/10 rounded-3xl p-6 shadow-xl space-y-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#00C8D4]" />
                <span>Panel de Grabación</span>
              </h3>

              {!isTracking ? (
                <button
                  onClick={startTracking}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF0096] via-[#9B00CC] to-[#00C8D4] text-white font-extrabold text-sm shadow-xl hover:scale-105 transition-all flex items-center justify-center space-x-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>INICIAR EXPEDICIÓN</span>
                </button>
              ) : (
                <button
                  onClick={stopTracking}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-extrabold text-sm shadow-xl hover:scale-105 transition-all flex items-center justify-center space-x-2"
                >
                  <Square className="w-5 h-5 fill-current" />
                  <span>DETENER & GUARDAR</span>
                </button>
              )}

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-900/80 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Duración</p>
                  <p className="text-lg font-black text-white font-mono mt-0.5">{formatDuration(elapsedTime)}</p>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Distancia</p>
                  <p className="text-lg font-black text-[#00C8D4] font-mono mt-0.5">{distanceTraveled.toFixed(2)} km</p>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Velocidad</p>
                  <p className="text-lg font-black text-[#FF0096] font-mono mt-0.5">{gpsSpeed || 0} km/h</p>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Precisión GPS</p>
                  <p className="text-sm font-bold text-emerald-400 font-mono mt-1">
                    {gpsAccuracy ? `±${gpsAccuracy}m` : "Buscando..."}
                  </p>
                </div>
              </div>

              {/* Point of Interest Button */}
              {isTracking && (
                <button
                  onClick={() => setShowPointModal(true)}
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-white font-extrabold text-xs flex items-center justify-center space-x-2 transition-all"
                >
                  <MapPin className="w-4 h-4 text-[#00C8D4]" />
                  <span>Marcar Punto de Interés (+{pointsInRoute.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Leaflet Map */}
          <div className="lg:col-span-8">
            <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950">
              <div ref={mapContainerRef} className="w-full h-full z-0" />
            </div>
          </div>

        </div>
      ) : (
        /* HISTORIAL SUBTAB */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {expeditions.length === 0 ? (
              <div className="col-span-3 p-12 text-center bg-slate-950/40 rounded-3xl border border-white/5 text-slate-400">
                <Compass className="w-12 h-12 text-[#FF0096] mx-auto mb-3 opacity-80" />
                <p className="text-sm font-bold text-white">No tienes expediciones registradas todavía.</p>
                <p className="text-xs mt-1">Inicia la expedición en vivo para trazar tus trayectos en carretera.</p>
              </div>
            ) : (
              expeditions.map(exp => (
                <div
                  key={exp.id}
                  onClick={() => setSelectedExpedition(exp)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                    selectedExpedition?.id === exp.id
                      ? "bg-[#0e011f] border-[#00C8D4] ring-2 ring-[#00C8D4]/50 shadow-xl"
                      : "bg-slate-900/60 border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-extrabold text-white text-sm">{exp.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00C8D4]/20 text-[#00C8D4]">
                      {exp.distance} km
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>📅 {new Date(exp.date).toLocaleDateString()}</p>
                    <p>⏱️ Duración: {formatDuration(exp.duration)}</p>
                    <p>📍 Puntos registrados: {exp.points?.length || 0}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Point Modal */}
      {showPointModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a0533] border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl text-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-white text-base">Marcar Punto de Interés</h3>
              <button onClick={() => setShowPointModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePoint} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nombre del Punto</label>
                <input
                  type="text"
                  required
                  value={pointForm.name}
                  onChange={e => setPointForm({ ...pointForm, name: e.target.value })}
                  placeholder="Ej: Mirador El Chorrerón / Spot Atardecer"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Categoría</label>
                <select
                  value={pointForm.category}
                  onChange={e => setPointForm({ ...pointForm, category: e.target.value as any })}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                >
                  <option value="spot_fotografico">📸 Spot Fotográfico</option>
                  <option value="gasolinera">⛽ Gasolinera Operativa</option>
                  <option value="mirador">🏔️ Mirador Panoramic</option>
                  <option value="posada">🏨 Posada Auditada</option>
                  <option value="restaurante">🍽️ Parada Gastronómica</option>
                  <option value="alerta_vial">⚠️ Alerta Vial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Descripción / Notas</label>
                <textarea
                  rows={2}
                  value={pointForm.description}
                  onChange={e => setPointForm({ ...pointForm, description: e.target.value })}
                  placeholder="Detalles útiles para el reporte de expedición..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4] resize-none"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPointModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#00C8D4] text-white font-extrabold text-xs shadow-lg"
                >
                  Guardar Punto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
