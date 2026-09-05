import React, { useState } from "react";
import { X, Upload, MapPin, CheckCircle2, Compass } from "lucide-react";
import type { CreatorWaypoint } from "../../types/creatorInfluencer";

interface CreatorImportRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportWaypoints: (points: Partial<CreatorWaypoint>[]) => void;
}

export const CreatorImportRouteModal: React.FC<CreatorImportRouteModalProps> = ({
  isOpen,
  onClose,
  onImportWaypoints
}) => {
  const [gpxText, setGpxText] = useState("");

  if (!isOpen) return null;

  const handleSimulateImport = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate batch GPS Waypoints parsing from mobile GPX/KML
    const sampleBatch: Partial<CreatorWaypoint>[] = [
      {
        latitude: 5.48512,
        longitude: -61.2145,
        altitude_meters: 1250,
        point_type: "mirador",
        title: "Mirador Tepuy Roraima (GPS Móvil)",
        description: "Coordenada sincronizada desde la app de campo."
      },
      {
        latitude: 4.88124,
        longitude: -61.1203,
        altitude_meters: 980,
        point_type: "gasolinera",
        title: "Gasolinera Paragua (Sincro GPS)",
        description: "Registrado con 100% de señal satelital."
      }
    ];

    onImportWaypoints(sampleBatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#0e011f] border border-[#00C8D4]/30 shadow-2xl shadow-[#00C8D4]/10">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-[#1a0533] via-[#0e011f] to-[#1a0533]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#00C8D4] flex items-center justify-center shadow-lg shadow-[#00C8D4]/20">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Importar Ruta & Coordenadas GPS</h3>
              <p className="text-xs text-slate-400">Sincronización de trazados GPX / KML capturados desde móvil</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSimulateImport} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Pegar Código de Coordenadas GPX/KML o Cargar Archivo de Ruta Móvil
            </label>
            <textarea
              rows={5}
              value={gpxText}
              onChange={(e) => setGpxText(e.target.value)}
              placeholder="<gpx version='1.1'><wpt lat='5.48512' lon='-61.2145'><name>Mirador Kama</name></wpt></gpx>"
              className="w-full bg-slate-900 border border-white/20 rounded-2xl p-4 text-white font-mono text-xs placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00C8D4] via-[#9B00CC] to-[#FF0096] text-white font-extrabold text-xs shadow-xl uppercase tracking-wider hover:opacity-95 transition-all flex items-center justify-center space-x-2"
          >
            <Compass className="w-4 h-4" />
            <span>PROCESAR E IMPORTAR RUTAS SATELITALES</span>
          </button>
        </form>

      </div>
    </div>
  );
};
