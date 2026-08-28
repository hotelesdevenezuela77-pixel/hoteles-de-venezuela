import React, { useState } from "react";
import { Link } from "wouter";
import { MapPin, Compass, Sparkles, Navigation, X, Star, Layers, ExternalLink, Map, DollarSign } from "lucide-react";
import { Establishment, getVirtualPrice } from "../layout/EstablishmentCard";

export interface ZoneRegion {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  borderColor: string;
  destinations: string[]; // slugs
  coordinates: { x: number; y: number }; // Porcentaje relativo en mapa SVG de Venezuela
}

export const TOURIST_ZONES: ZoneRegion[] = [
  {
    id: "caribe",
    name: "Caribe & Archipiélagos",
    subtitle: "Los Roques, Margarita, Coche, Morrocoy, Mochima",
    icon: "🌴",
    color: "from-cyan-500 to-blue-600",
    borderColor: "#00C8D4",
    destinations: ["los-roques", "margarita", "morrocoy", "mochima", "coche"],
    coordinates: { x: 68, y: 22 }
  },
  {
    id: "andes",
    name: "Andes & Montaña",
    subtitle: "Mérida, Sanare, Cubiro, Colonia Tovar, Galipán",
    icon: "⛰️",
    color: "from-emerald-500 to-teal-700",
    borderColor: "#10b981",
    destinations: ["merida", "sanare", "cubiro", "colonia-tovar", "galipan"],
    coordinates: { x: 34, y: 52 }
  },
  {
    id: "centro",
    name: "Centro & Capital",
    subtitle: "Caracas, Maracay, Valencia",
    icon: "🌆",
    color: "from-purple-600 to-indigo-800",
    borderColor: "#9B00CC",
    destinations: ["caracas", "maracay", "valencia"],
    coordinates: { x: 55, y: 38 }
  },
  {
    id: "llanos",
    name: "Gran Sabana & Llanos",
    subtitle: "Canaima, Amazonas, Apure, Barinas",
    icon: "🌿",
    color: "from-amber-500 to-orange-600",
    borderColor: "#f59e0b",
    destinations: ["canaima", "amazonas", "apure", "barinas"],
    coordinates: { x: 75, y: 72 }
  },
  {
    id: "nautica",
    name: "Ruta Náutica & Marinas",
    subtitle: "Tucacas, Chichiriviche, Higuerote, Puerto La Cruz",
    icon: "🚢",
    color: "from-pink-500 to-rose-600",
    borderColor: "#FF0096",
    destinations: ["tucacas", "chichiriviche", "higuerote", "puerto-la-cruz"],
    coordinates: { x: 60, y: 30 }
  }
];

interface ZoneMapFilterProps {
  establishments: Establishment[];
  selectedZone: string;
  onSelectZone: (zoneId: string) => void;
  selectedDestination: string;
  onSelectDestination: (destSlug: string) => void;
  onOpenMapView?: () => void;
}

export function ZoneMapFilter({
  establishments,
  selectedZone,
  onSelectZone,
  selectedDestination,
  onSelectDestination,
  onOpenMapView
}: ZoneMapFilterProps) {
  // Helper para saber cuántas propiedades hay en una zona
  const getZoneCount = (zone: ZoneRegion) => {
    return establishments.filter(est => 
      zone.destinations.includes(est.destination_slug || "") ||
      zone.destinations.some(d => (est.address || "").toLowerCase().includes(d))
    ).length;
  };

  return (
    <div className="space-y-4">
      {/* 1. Mini Widget Tarjeta de Mapa de Venezuela */}
      <div className="relative rounded-2xl overflow-hidden border border-[#00C8D4]/40 bg-gradient-to-br from-slate-950 via-[#0e011f] to-slate-900 p-3.5 text-white shadow-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#00C8D4]/20 border border-[#00C8D4]/50 flex items-center justify-center text-[#00C8D4]">
              <MapPin className="w-3.5 h-3.5 animate-bounce" />
            </div>
            <span className="text-xs font-black text-white uppercase tracking-wider font-sans">
              Mapa Interactivo por Zona
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#00C8D4] text-slate-950">
            HDV Live
          </span>
        </div>

        {/* Vista previa miniatura del mapa interactivo */}
        <div 
          onClick={onOpenMapView} 
          className="relative h-28 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 flex items-center justify-center cursor-pointer group"
          title="Haz clic para abrir el Mapa Interactivo"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/40 via-purple-950/40 to-slate-950 opacity-90 group-hover:scale-105 transition-transform duration-500" />
          
          {/* Silueta vectorial de Venezuela */}
          <svg viewBox="0 0 400 250" className="w-full h-full opacity-30 fill-[#00C8D4]/20 stroke-[#00C8D4]">
            <path d="M 80 80 C 140 60, 240 50, 320 90 C 360 110, 380 160, 340 200 C 280 230, 180 220, 110 190 C 60 160, 50 110, 80 80 Z" />
          </svg>

          {/* Pins de precios neón simulados */}
          <div className="absolute top-[35%] left-[65%] flex items-center gap-0.5 bg-[#FF0096] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg shadow-[#FF0096]/50 animate-pulse">
            <DollarSign className="w-2.5 h-2.5" />100
          </div>
          <div className="absolute top-[55%] left-[32%] flex items-center gap-0.5 bg-[#00C8D4] text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg shadow-[#00C8D4]/50">
            <DollarSign className="w-2.5 h-2.5" />75
          </div>
          <div className="absolute top-[40%] left-[45%] flex items-center gap-0.5 bg-[#9B00CC] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg shadow-[#9B00CC]/50">
            <DollarSign className="w-2.5 h-2.5" />150
          </div>

          {/* Botón flotante al hover */}
          <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 flex items-center justify-center transition-colors">
            <span className="px-3 py-1.5 bg-gradient-to-r from-[#00C8D4] via-[#9B00CC] to-[#FF0096] text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-1.5 group-hover:scale-105 transition-transform">
              <Map className="w-3.5 h-3.5" />
              <span>Explorar Mapa en Vivo</span>
            </span>
          </div>
        </div>

        <p className="text-[10px] text-slate-300 font-medium">
          Filtra hospedajes y posadas directamente haciendo clic en el mapa de Venezuela o en las zonas estratégicas.
        </p>
      </div>

      {/* 2. Selector de Zonas Turísticas (Chips de Zonas) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#00C8D4]" />
            <span className="text-xs font-black tracking-wider uppercase text-gray-800 font-sans">
              Zonas Turísticas Estratégicas
            </span>
          </div>
          {selectedZone && (
            <button
              type="button"
              onClick={() => onSelectZone("")}
              className="text-[10px] text-[#FF0096] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" /> Limpiar zona
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {TOURIST_ZONES.map(zone => {
            const isSelected = selectedZone === zone.id;
            const count = getZoneCount(zone);
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => onSelectZone(isSelected ? "" : zone.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                  isSelected
                    ? "bg-slate-900 text-white border-[#00C8D4] shadow-md shadow-[#00C8D4]/20 scale-[1.01]"
                    : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base shrink-0">{zone.icon}</span>
                  <div className="min-w-0">
                    <span className={`text-xs font-black block truncate ${isSelected ? "text-[#00C8D4]" : "text-slate-800"}`}>
                      {zone.name}
                    </span>
                    <span className={`text-[9px] block truncate ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                      {zone.subtitle}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 ${
                    isSelected
                      ? "bg-[#FF0096] text-white"
                      : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 3. Mapa Interactivo de Pantalla Completa o Modal Integrado con Pines de Precios
export function InteractiveZoneMapView({
  establishments,
  selectedZone,
  onSelectZone,
  onClose
}: {
  establishments: Establishment[];
  selectedZone: string;
  onSelectZone: (zoneId: string) => void;
  onClose?: () => void;
}) {
  const [selectedPin, setSelectedPin] = useState<{ est: Establishment; price: number } | null>(null);
  const [mapMode, setMapMode] = useState<"satelite" | "noche">("noche");

  // Filtrar según zona activa si existe
  const activeZoneObj = TOURIST_ZONES.find(z => z.id === selectedZone);
  const displayEsts = activeZoneObj
    ? establishments.filter(est => 
        activeZoneObj.destinations.includes(est.destination_slug || "") ||
        activeZoneObj.destinations.some(d => (est.address || "").toLowerCase().includes(d))
      )
    : establishments;

  return (
    <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl space-y-0 text-white relative my-4">
      {/* Top Controls Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md px-4 py-3 border-b border-slate-800 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#00C8D4] to-[#FF0096] flex items-center justify-center text-white font-black shadow-md">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-wide text-white uppercase font-sans">
              Mapa de Precios & Zonas Turísticas de Venezuela
            </h3>
            <p className="text-[10px] text-slate-400">
              {displayEsts.length} hospedajes geolocalizados con tarifas $/noche en vivo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector Estilo de Mapa */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setMapMode("noche")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                mapMode === "noche" ? "bg-[#00C8D4] text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Noche HDV
            </button>
            <button
              type="button"
              onClick={() => setMapMode("satelite")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                mapMode === "satelite" ? "bg-[#FF0096] text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Satelital
            </button>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-600 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Canvas del Mapa de Venezuela Interactivo */}
      <div className="relative w-full h-[480px] bg-slate-950 overflow-hidden">
        {/* Fondo estilizado del mapa */}
        {mapMode === "noche" ? (
          <div className="absolute inset-0 bg-gradient-to-tr from-[#060112] via-[#0f0426] to-[#041624] opacity-95">
            {/* Rejilla Vectorial de Mapa */}
            <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00C8D4" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-black">
            <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop')] bg-cover bg-center" />
          </div>
        )}

        {/* Silueta Estilizada de Venezuela */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
          <svg viewBox="0 0 800 600" className="w-[85%] h-[85%] fill-[#00C8D4]/10 stroke-[#00C8D4]/30 stroke-2">
            <path d="M 150 200 C 250 150, 450 140, 600 220 C 680 260, 720 380, 650 480 C 550 540, 350 520, 220 460 C 120 400, 100 280, 150 200 Z" />
          </svg>
        </div>

        {/* Nodos / Zonas Destacadas en Mapa */}
        {TOURIST_ZONES.map(zone => {
          const isZoneActive = selectedZone === zone.id;
          return (
            <div
              key={zone.id}
              style={{ left: `${zone.coordinates.x}%`, top: `${zone.coordinates.y}%` }}
              onClick={() => onSelectZone(isZoneActive ? "" : zone.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group"
            >
              <div
                style={{ borderColor: zone.borderColor }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl backdrop-blur-md border transition-all duration-300 ${
                  isZoneActive
                    ? "bg-[#FF0096] text-white shadow-lg shadow-[#FF0096]/50 scale-110 ring-4 ring-[#FF0096]/30"
                    : "bg-slate-900/80 text-white hover:bg-slate-800 hover:scale-105"
                }`}
              >
                <span className="text-sm">{zone.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-wider">{zone.name}</span>
              </div>
            </div>
          );
        })}

        {/* Pins de Precio de Establecimientos sobre el Mapa */}
        {displayEsts.slice(0, 18).map((est, idx) => {
          const price = getVirtualPrice(est);
          const zone = TOURIST_ZONES.find(z => z.destinations.includes(est.destination_slug || "")) || TOURIST_ZONES[idx % TOURIST_ZONES.length];
          const offsetAngle = (idx * 137.5) * (Math.PI / 180);
          const radius = (idx % 4) * 4 + 3;
          const px = Math.max(12, Math.min(88, zone.coordinates.x + Math.cos(offsetAngle) * radius));
          const py = Math.max(12, Math.min(88, zone.coordinates.y + Math.sin(offsetAngle) * radius));

          const isSelected = selectedPin?.est.id === est.id;

          return (
            <div
              key={est.id}
              style={{ left: `${px}%`, top: `${py}%` }}
              onClick={() => setSelectedPin({ est, price })}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-15 cursor-pointer transition-all duration-300"
            >
              {/* Pin Flotante con Precio $/noche */}
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black shadow-lg transition-all duration-300 border ${
                  isSelected
                    ? "bg-[#FF0096] text-white border-white scale-125 z-30 shadow-[#FF0096]/80 animate-bounce"
                    : "bg-slate-900/90 text-[#00C8D4] border-[#00C8D4]/40 hover:bg-[#00C8D4] hover:text-slate-950 hover:scale-110"
                }`}
              >
                <DollarSign className="w-3 h-3" />
                <span>{price}</span>
              </div>
            </div>
          );
        })}

        {/* Preview Floating Card de la Ficha Seleccionada */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-40 animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-[#00C8D4]/50 p-4 shadow-2xl relative text-left">
              <button
                type="button"
                onClick={() => setSelectedPin(null)}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex gap-3">
                <img
                  src={selectedPin.est.primary_image || "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400"}
                  alt={selectedPin.est.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-700"
                />

                <div className="min-w-0 flex-1">
                  <span className="px-2 py-0.5 bg-[#00C8D4]/20 text-[#00C8D4] rounded-md text-[9px] font-black uppercase tracking-wider inline-block mb-1">
                    {selectedPin.est.category_name || "Hospedaje"}
                  </span>
                  <h4 className="text-xs font-black text-white truncate">{selectedPin.est.name}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-300 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#00C8D4]" />
                    <span className="truncate">{selectedPin.est.address || selectedPin.est.destination_name || "Venezuela"}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800">
                    <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{selectedPin.est.rating_avg.toFixed(1)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Desde</span>
                      <span className="text-xs font-black text-[#FF0096]">${selectedPin.price} <span className="text-[9px] text-slate-400 font-normal">/ noche</span></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex gap-2">
                <Link
                  href={`/establecimiento/${selectedPin.est.slug}`}
                  className="flex-1 bg-gradient-to-r from-[#00C8D4] to-[#FF0096] text-white text-[10px] font-black py-2 rounded-xl text-center uppercase tracking-wider flex items-center justify-center gap-1 hover:opacity-95"
                >
                  <span>Ver Ficha Completa</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
