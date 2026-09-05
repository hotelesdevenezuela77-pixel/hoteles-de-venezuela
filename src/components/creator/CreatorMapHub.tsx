import React, { useState } from "react";
import { Compass, MapPin, Upload, Plus, Globe, Camera, Fuel, ShieldCheck, Share2, Layers } from "lucide-react";
import type { CreatorWaypoint, CreatorExpedition, PointType } from "../../types/creatorInfluencer";

interface CreatorMapHubProps {
  expeditions: CreatorExpedition[];
  waypoints: CreatorWaypoint[];
  onImportWaypoints: (points: Partial<CreatorWaypoint>[]) => void;
}

const POINT_TYPE_BADGES: { [key in PointType]: { label: string; color: string } } = {
  spot_fotografico: { label: "📸 Spot Fotográfico", color: "bg-pink-500/20 text-pink-300 border-pink-500/40" },
  gasolinera: { label: "⛽ Gasolinera Operativa", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  mirador: { label: "🏔️ Mirador Panoramic", color: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
  posada: { label: "🏨 Posada Afiliada", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" },
  restaurante: { label: "🍽️ Parada Gastronómica", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  alerta_vial: { label: "⚠️ Alerta Vial / Precaución", color: "bg-red-500/20 text-red-300 border-red-500/40" },
  sendero_offroad: { label: "🚙 Paso 4x4 / Off-Road", color: "bg-sky-500/20 text-sky-300 border-sky-500/40" }
};

export const CreatorMapHub: React.FC<CreatorMapHubProps> = ({
  expeditions,
  waypoints,
  onImportWaypoints
}) => {
  const [selectedExpeditionId, setSelectedExpeditionId] = useState<string>(expeditions[0]?.id || "");
  const selectedExpedition = expeditions.find(e => e.id === selectedExpeditionId) || expeditions[0];

  const expeditionWaypoints = waypoints.filter(w => w.expedition_id === selectedExpeditionId);

  // Form agregar waypoint individual
  const [title, setTitle] = useState("");
  const [lat, setLat] = useState("5.48512");
  const [lng, setLng] = useState("-61.2145");
  const [altitude, setAltitude] = useState("1100");
  const [pointType, setPointType] = useState<PointType>("spot_fotografico");
  const [description, setDescription] = useState("");

  const handleAddWaypoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onImportWaypoints([{
      expedition_id: selectedExpeditionId,
      title: title.trim(),
      latitude: parseFloat(lat) || 0,
      longitude: parseFloat(lng) || 0,
      altitude_meters: parseFloat(altitude) || 0,
      point_type: pointType,
      description: description.trim()
    }]);

    setTitle("");
    setDescription("");
  };

  return (
    <div className="rounded-3xl bg-[#1a0533]/80 border border-white/10 p-6 shadow-2xl backdrop-blur-md mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-5 mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#00C8D4] flex items-center justify-center shadow-lg shadow-[#00C8D4]/20">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Explorador de Rutas Satelitales & Trazador GPS</h3>
            <p className="text-xs text-slate-400">Ingesta de geodatos móviles y publicación de guías navegables</p>
          </div>
        </div>

        {/* Selector de Expedición */}
        <div className="w-full sm:w-auto">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Expedición Activa:
          </label>
          <select
            value={selectedExpeditionId}
            onChange={(e) => setSelectedExpeditionId(e.target.value)}
            className="w-full sm:w-72 bg-slate-900 border border-white/20 rounded-xl py-2 px-3 text-white text-xs font-bold focus:outline-none focus:border-[#00C8D4]"
          >
            {expeditions.map((exp) => (
              <option key={exp.id} value={exp.id}>
                {exp.title} ({exp.km_distance} km)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* MAPA SATELITAL VISUALIZADOR (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-[#00C8D4]/30 bg-slate-950 h-80 flex flex-col justify-between p-4 shadow-xl">
            {/* Visual simulation of satellite map layer */}
            <div className="absolute inset-0 bg-[radial-gradient(#00C8D4_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
            
            <div className="flex items-center justify-between relative z-10">
              <span className="px-3 py-1 rounded-full bg-slate-900/90 border border-white/10 text-white font-mono text-xs font-bold flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-[#00C8D4]" />
                <span>CAPA SATELITAL DIGITAL 4K</span>
              </span>

              <button
                onClick={() => alert(`Publicando Guía de Ruta "${selectedExpedition?.title}" en el directorio oficial de Hoteles de Venezuela...`)}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-white font-extrabold text-xs shadow-lg hover:opacity-90 transition-all flex items-center space-x-1.5"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Publicar Guía en HDV</span>
              </button>
            </div>

            {/* Simulated Waypoints Markers on Map */}
            <div className="relative z-10 space-y-2">
              <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#00C8D4] font-mono font-bold uppercase">{selectedExpedition?.destination}</span>
                  <h4 className="font-extrabold text-white text-sm">{selectedExpedition?.title}</h4>
                </div>
                <span className="text-xs font-extrabold text-emerald-400 font-mono">
                  {expeditionWaypoints.length} waypoints fijados
                </span>
              </div>
            </div>
          </div>

          {/* Listado de Waypoints Georreferenciados */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center">
              <MapPin className="w-4 h-4 text-[#00C8D4] mr-1.5" /> Coordenadas & Waypoints Registrados
            </h4>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {expeditionWaypoints.map((wp) => {
                const badge = POINT_TYPE_BADGES[wp.point_type] || POINT_TYPE_BADGES.spot_fotografico;

                return (
                  <div
                    key={wp.id}
                    className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 text-xs flex items-center justify-between hover:border-[#00C8D4]/40 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {wp.latitude.toFixed(4)}°, {wp.longitude.toFixed(4)}° ({wp.altitude_meters}m)
                        </span>
                      </div>
                      <h5 className="font-bold text-white text-xs">{wp.title}</h5>
                      {wp.description && <p className="text-slate-300 text-[11px]">{wp.description}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FORMULARIO FIJAR WAYPOINT (Col 5) */}
        <div className="lg:col-span-5 bg-slate-900/70 p-5 rounded-2xl border border-white/10 space-y-4">
          <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center">
            <Plus className="w-4 h-4 text-[#00C8D4] mr-1.5" /> Fijar Punto GPS Manualmente
          </h4>

          <form onSubmit={handleAddWaypoint} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tipo de Punto Geográfico</label>
              <select
                value={pointType}
                onChange={(e) => setPointType(e.target.value as PointType)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-[#00C8D4]"
              >
                {Object.entries(POINT_TYPE_BADGES).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nombre / Título del Waypoint</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Mirador Salto Kama-Merú"
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-[#00C8D4]"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono">
              <div>
                <label className="block text-slate-300 text-[10px] mb-1 font-sans">Latitud</label>
                <input
                  type="text"
                  required
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl py-1.5 px-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-[10px] mb-1 font-sans">Longitud</label>
                <input
                  type="text"
                  required
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl py-1.5 px-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-[10px] mb-1 font-sans">Altitud (m)</label>
                <input
                  type="text"
                  value={altitude}
                  onChange={(e) => setAltitude(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl py-1.5 px-2 text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Notas / Recomendación para la Guía</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Condiciones del terreno, hora ideal para fotos, recomendación de tracción..."
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-[#00C8D4]"
              />
            </div>

            <button
              type="submit"
              disabled={!title.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-white font-extrabold text-xs shadow-lg hover:opacity-95 disabled:opacity-50 transition-all uppercase tracking-wider"
            >
              FIJAR WAYPOINT GPS
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
