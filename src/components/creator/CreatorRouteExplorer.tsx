import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Compass, MapPin, Play, Square, Plus, History,
  ChevronRight, Loader2, Camera, AlertTriangle, Trash2,
  Map, Save, PlusCircle, Building2, Sparkles, Clock,
  Navigation, User, Check, RefreshCw, X, Download, Share2,
  Fuel, Eye, Layers, ShieldCheck, Activity, Gauge
} from "lucide-react";
import type { CreatorWaypoint, PointType, CreatorExpedition } from "../../types/creatorInfluencer";

interface CreatorRouteExplorerProps {
  establishmentId?: number;
  creatorName?: string;
  expeditions: CreatorExpedition[];
  waypoints: CreatorWaypoint[];
  onAddWaypoint?: (wp: Partial<CreatorWaypoint>) => void;
}

const VENEZUELA_CENTER: [number, number] = [10.4806, -66.9036]; // Caracas
const CIAN = "#00C8D4";
const FUCSIA = "#FF0096";
const PURPURA = "#9B00CC";

const WAYPOINT_ICONS: Record<PointType, { label: string; icon: string; color: string }> = {
  spot_fotografico: { label: "Spot Fotográfico / Drone", icon: "📸", color: "#FF0096" },
  gasolinera: { label: "Gasolinera Operativa", icon: "⛽", color: "#F59E0B" },
  mirador: { label: "Mirador Panorámico", icon: "🌄", color: "#10B981" },
  posada: { label: "Posada en Ruta", icon: "🏨", color: "#00C8D4" },
  restaurante: { label: "Parada Gastronómica", icon: "🍽️", color: "#EC4899" },
  alerta_vial: { label: "Alerta Vial / Vado", icon: "⚠️", color: "#EF4444" },
  sendero_offroad: { label: "Sendero Off-Road 4x4", icon: "🚙", color: "#8B5CF6" }
};

export const CreatorRouteExplorer: React.FC<CreatorRouteExplorerProps> = ({
  creatorName = "Aura Croce",
  expeditions,
  waypoints,
  onAddWaypoint
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const [mapType, setMapType] = useState<"satellite" | "streets">("satellite");
  const [isRecording, setIsRecording] = useState(false);
  const [activeExpedition, setActiveExpedition] = useState<CreatorExpedition | null>(expeditions[0] || null);

  // Telemetría de Ruta en Vivo
  const [currentKm, setCurrentKm] = useState(48.5);
  const [currentSpeed, setCurrentSpeed] = useState(65);
  const [currentAltitude, setCurrentAltitude] = useState(1150);
  const [elapsedSeconds, setElapsedSeconds] = useState(3840);

  // Modal para agregar waypoint georreferenciado
  const [showPointModal, setShowPointModal] = useState(false);
  const [pointForm, setPointForm] = useState({
    title: "",
    point_type: "spot_fotografico" as PointType,
    description: "",
    altitude_meters: 1150
  });

  // Temporizador de grabación
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
        setCurrentKm(prev => +(prev + 0.02).toFixed(2));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Inicializar Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [8.5, -66.0],
        zoom: 6,
        zoomControl: false
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Capa Satelital ESRI
      const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "Esri World Imagery" }
      );

      // Capa Calles OpenStreetMap
      const streetsLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "OpenStreetMap" }
      );

      if (mapType === "satellite") {
        satelliteLayer.addTo(map);
      } else {
        streetsLayer.addTo(map);
      }

      markersGroupRef.current = L.featureGroup().addTo(map);

      // Trazar ruta demo de Venezuela
      const demoCoords: [number, number][] = [
        [10.4806, -66.9036], // Caracas
        [10.2469, -67.5958], // Maracay
        [10.1800, -68.0000], // Valencia
        [10.8500, -68.3200], // Tucacas / Morrocoy
        [11.4045, -69.6734], // Coro
        [8.5983, -71.1449],  // Mérida
        [5.4851, -61.2145],  // Gran Sabana
      ];

      routePolylineRef.current = L.polyline(demoCoords, {
        color: "#00C8D4",
        weight: 4,
        dashArray: "8, 8",
        opacity: 0.9
      }).addTo(map);

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Actualizar marcadores de Waypoints en el mapa
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    // Marcadores de muestra distribuidos en rutas clave
    const demoWaypoints = [
      { lat: 10.85, lng: -68.32, title: "Cayo Sombrero - Morrocoy", type: "spot_fotografico" as PointType, alt: 5 },
      { lat: 5.48, lng: -61.21, title: "Salto Kama-Merú 4K", type: "spot_fotografico" as PointType, alt: 1250 },
      { lat: 8.59, lng: -71.14, title: "Teleférico Mukumbarí - Pico Espejo", type: "mirador" as PointType, alt: 4765 },
      { lat: 10.25, lng: -67.60, title: "E/S Autopista Regional del Centro", type: "gasolinera" as PointType, alt: 450 },
      { lat: 10.45, lng: -64.18, title: "Bahía de Mochima", type: "spot_fotografico" as PointType, alt: 10 },
      { lat: 4.88, lng: -61.12, title: "Paso Fronterizo Santa Elena", type: "alerta_vial" as PointType, alt: 980 }
    ];

    demoWaypoints.forEach(wp => {
      const info = WAYPOINT_ICONS[wp.type] || WAYPOINT_ICONS.spot_fotografico;
      
      const customHtml = `
        <div style="background: ${info.color}; color: white; width: 34px; height: 34px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); border: 2px solid white;">
          ${info.icon}
        </div>
      `;

      const icon = L.divIcon({
        html: customHtml,
        className: "custom-leaflet-marker",
        iconSize: [34, 34],
        iconAnchor: [17, 34]
      });

      const marker = L.marker([wp.lat, wp.lng], { icon });
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <b style="color: #0e011f; font-size: 13px;">${wp.title}</b>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">${info.label} • Alt: ${wp.alt}m</p>
          <span style="display: inline-block; margin-top: 6px; font-size: 10px; background: #00C8D4; color: white; padding: 2px 6px; border-radius: 6px; font-weight: bold;">Verificado por ${creatorName}</span>
        </div>
      `);

      markersGroupRef.current?.addLayer(marker);
    });
  }, [waypoints, creatorName]);

  // Cambiar capa satélite / calles
  const handleChangeMapLayer = (type: "satellite" | "streets") => {
    setMapType(type);
    if (!mapRef.current) return;

    mapRef.current.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        mapRef.current?.removeLayer(layer);
      }
    });

    if (type === "satellite") {
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Esri World Imagery"
      }).addTo(mapRef.current);
    } else {
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "OpenStreetMap"
      }).addTo(mapRef.current);
    }
  };

  const handleSaveWaypoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pointForm.title.trim()) return;

    if (onAddWaypoint) {
      onAddWaypoint({
        title: pointForm.title.trim(),
        point_type: pointForm.point_type,
        description: pointForm.description.trim(),
        altitude_meters: Number(pointForm.altitude_meters) || currentAltitude,
        latitude: 10.4806 + (Math.random() - 0.5) * 0.1,
        longitude: -66.9036 + (Math.random() - 0.5) * 0.1
      });
    }

    setShowPointModal(false);
    setPointForm({
      title: "",
      point_type: "spot_fotografico",
      description: "",
      altitude_meters: currentAltitude
    });
  };

  const formatSeconds = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* ── Banner Superior ── */}
      <div
        className="rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a0533 0%, #0e011f 100%)" }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: CIAN }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-[#00C8D4]/15 text-[#00C8D4] border border-[#00C8D4]/30 mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>ESTACIÓN SATELITAL & TRAZADOR GPS DE EXPEDICIÓN</span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-white">
              Explorador de Rutas & Waypoints Turísticos
            </h2>
            <p className="text-xs text-slate-300">
              Captura coordenadas satelitales, spots fotográficos de drone, estaciones de servicio y miradores en tiempo real durante tus viajes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
                isRecording
                  ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                  : "bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] hover:brightness-110 text-white"
              }`}
            >
              {isRecording ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRecording ? "Detener Grabación GPS" : "Iniciar Trazado GPS en Vivo"}</span>
            </button>

            <button
              onClick={() => setShowPointModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white text-xs font-bold shadow-md hover:brightness-110 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Capturar Spot</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── HUD DE TELEMETRÍA EN VIVO ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Distancia Recorrida</span>
            <Navigation className="w-4 h-4 text-[#00C8D4]" />
          </div>
          <div className="text-2xl font-black text-white">{currentKm} <span className="text-xs text-slate-400">KM</span></div>
          <div className="text-[10px] text-emerald-400 font-bold mt-0.5">Track Activo 4K</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Velocidad en Ruta</span>
            <Gauge className="w-4 h-4 text-[#FF0096]" />
          </div>
          <div className="text-2xl font-black text-white">{currentSpeed} <span className="text-xs text-slate-400">KM/H</span></div>
          <div className="text-[10px] text-slate-400 mt-0.5">Crucero Carretera</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Altitud GPS</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{currentAltitude} <span className="text-xs text-slate-400">MSNM</span></div>
          <div className="text-[10px] text-amber-300 mt-0.5">Cordillera Central</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Tiempo en Ruta</span>
            <Clock className="w-4 h-4 text-[#9B00CC]" />
          </div>
          <div className="text-2xl font-black font-mono text-white">{formatSeconds(elapsedSeconds)}</div>
          <div className="text-[10px] text-purple-300 mt-0.5">Cronómetro Satelital</div>
        </div>
      </div>

      {/* ── CONTENEDOR DEL MAPA LEAFLET ── */}
      <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl h-[520px] bg-slate-950">
        
        {/* Controles Flotantes del Mapa */}
        <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 bg-black/70 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
          <button
            onClick={() => handleChangeMapLayer("satellite")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              mapType === "satellite" ? "bg-[#00C8D4] text-slate-950 font-black shadow" : "text-slate-300 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Satélite HD (ESRI)</span>
          </button>
          <button
            onClick={() => handleChangeMapLayer("streets")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              mapType === "streets" ? "bg-[#00C8D4] text-slate-950 font-black shadow" : "text-slate-300 hover:text-white"
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Callejero & Relieve</span>
          </button>
        </div>

        {/* Legend Flotante */}
        <div className="absolute bottom-4 left-4 z-[400] bg-black/80 backdrop-blur-md p-3 rounded-2xl border border-white/20 hidden md:block max-w-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Puntos Georreferenciados:</div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5">📸 Spot Foto / Drone</span>
            <span className="flex items-center gap-1.5">⛽ Gasolinera 95</span>
            <span className="flex items-center gap-1.5">🏨 Posada en Ruta</span>
            <span className="flex items-center gap-1.5">🌄 Mirador</span>
          </div>
        </div>

        {/* Canvas del Mapa */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>

      {/* ── MODAL CAPTURAR WAYPOINT ── */}
      {showPointModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1a0533] rounded-3xl w-full max-w-lg shadow-2xl border border-white/15 p-6 text-slate-100">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF0096] flex items-center justify-center text-white">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-white">Capturar Punto de Interés (Waypoint)</h3>
                  <p className="text-xs text-slate-300">Registra un spot fotográfico, mirador o gasolinera en tu ruta</p>
                </div>
              </div>
              <button
                onClick={() => setShowPointModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWaypoint} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Nombre del Punto / Spot *
                </label>
                <input
                  type="text"
                  required
                  value={pointForm.title}
                  onChange={(e) => setPointForm({ ...pointForm, title: e.target.value })}
                  placeholder="Ej: Mirador Cayo de Agua 360°"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Tipo de Punto
                  </label>
                  <select
                    value={pointForm.point_type}
                    onChange={(e) => setPointForm({ ...pointForm, point_type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                  >
                    <option value="spot_fotografico">📸 Spot Fotográfico / Drone</option>
                    <option value="gasolinera">⛽ Gasolinera Operativa</option>
                    <option value="mirador">🌄 Mirador Panorámico</option>
                    <option value="posada">🏨 Posada en Ruta</option>
                    <option value="restaurante">🍽️ Parada Gastronómica</option>
                    <option value="alerta_vial">⚠️ Alerta Vial / Vado</option>
                    <option value="sendero_offroad">🚙 Sendero Off-Road 4x4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Altitud (MSNM)
                  </label>
                  <input
                    type="number"
                    value={pointForm.altitude_meters}
                    onChange={(e) => setPointForm({ ...pointForm, altitude_meters: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Descripción & Tips de Acceso
                </label>
                <textarea
                  rows={2}
                  value={pointForm.description}
                  onChange={(e) => setPointForm({ ...pointForm, description: e.target.value })}
                  placeholder="Hora ideal de luz para fotos, estado de la carretera, cobertura móvil..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowPointModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white text-xs font-bold shadow-md hover:brightness-110"
                >
                  Guardar Waypoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
