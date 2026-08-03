import React, { useState } from "react";
import { Link } from "wouter";
import { 
  Luggage, 
  Compass, 
  Clock, 
  Users, 
  Check, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  DollarSign, 
  MessageSquare,
  Plus,
  Trash2
} from "lucide-react";

export interface TouristPackageItem {
  id: string | number;
  title: string;
  destination: string;
  duration: string;
  priceUSD: number;
  image: string;
  status: "proximo" | "deseo" | "completado";
  includedServices: string[];
  departureDate?: string;
}

interface TouristPackagesProps {
  packages: TouristPackageItem[];
  onRemovePackage: (id: string | number) => void;
  onAddPackage: (pkg: TouristPackageItem) => void;
}

export function TouristPackages({
  packages,
  onRemovePackage,
  onAddPackage
}: TouristPackagesProps) {
  const [activeTab, setActiveTab] = useState<"todos" | "proximo" | "deseo" | "completado">("todos");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPkg, setNewPkg] = useState({
    title: "",
    destination: "",
    duration: "3 Días / 2 Noches",
    priceUSD: 290,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    status: "deseo" as const,
    includedServices: "Alojamiento, Desayunos, Paseo en Lancha",
    departureDate: "2026-09-01"
  });

  const filtered = packages.filter(p => {
    if (activeTab === "todos") return true;
    return p.status === activeTab;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkg.title) return;
    onAddPackage({
      id: "pkg_" + Date.now(),
      title: newPkg.title,
      destination: newPkg.destination,
      duration: newPkg.duration,
      priceUSD: Number(newPkg.priceUSD),
      image: newPkg.image,
      status: newPkg.status,
      includedServices: newPkg.includedServices.split(",").map(s => s.trim()),
      departureDate: newPkg.departureDate
    });
    setShowAddModal(false);
  };

  const getStatusBadge = (status: TouristPackageItem["status"]) => {
    switch (status) {
      case "proximo":
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#00C8D4] text-slate-950 shadow-xs">Próximo Viaje</span>;
      case "deseo":
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#FF0096] text-white shadow-xs">Lista de Deseos</span>;
      case "completado":
        return <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">Completado</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#9B00CC] flex items-center justify-center text-white shadow-md shadow-[#9B00CC]/20">
            <Luggage className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900">Mis Paquetes y Expediciones</h2>
            <p className="text-xs text-slate-500">Tus planes de viaje guardados, expediociones en Venezuela y cotizaciones personalizadas.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Tabs de estado */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab("todos")}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${activeTab === "todos" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}
            >
              Todos ({packages.length})
            </button>
            <button
              onClick={() => setActiveTab("proximo")}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${activeTab === "proximo" ? "bg-white text-[#00C8D4] shadow-xs" : "text-slate-500"}`}
            >
              Próximos
            </button>
            <button
              onClick={() => setActiveTab("deseo")}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${activeTab === "deseo" ? "bg-white text-[#FF0096] shadow-xs" : "text-slate-500"}`}
            >
              Deseos
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-[#00C8D4]" />
            Guardar Paquete
          </button>
        </div>
      </div>

      {/* Modal para guardar paquete personalizado */}
      {showAddModal && (
        <form onSubmit={handleAddSubmit} className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-[#00C8D4] uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#FF0096]" />
              Guardar Nuevo Paquete o Plan de Viaje
            </h3>
            <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-xs">
              ✕ Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nombre del Paquete</label>
              <input
                type="text"
                required
                placeholder="Ej. Gran Sabana Roraima 5D/4N"
                value={newPkg.title}
                onChange={e => setNewPkg({ ...newPkg, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Destino</label>
              <input
                type="text"
                placeholder="Ej. Parque Nacional Canaima"
                value={newPkg.destination}
                onChange={e => setNewPkg({ ...newPkg, destination: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Duración</label>
              <input
                type="text"
                placeholder="Ej. 4 Días / 3 Noches"
                value={newPkg.duration}
                onChange={e => setNewPkg({ ...newPkg, duration: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Precio Estimado p/p ($ USD)</label>
              <input
                type="number"
                value={newPkg.priceUSD}
                onChange={e => setNewPkg({ ...newPkg, priceUSD: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Estado</label>
              <select
                value={newPkg.status}
                onChange={e => setNewPkg({ ...newPkg, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
              >
                <option value="proximo">Próximo Viaje</option>
                <option value="deseo">En Lista de Deseos</option>
                <option value="completado">Completado</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Servicios Incluidos (separados por coma)</label>
              <input
                type="text"
                placeholder="Alojamiento, Vuelo, Guiatura"
                value={newPkg.includedServices}
                onChange={e => setNewPkg({ ...newPkg, includedServices: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#00C8D4] text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-[#00C8D4]/90 transition-all cursor-pointer"
            >
              Guardar Paquete
            </button>
          </div>
        </form>
      )}

      {/* Grid de Paquetes */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-xs">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#9B00CC]/10 text-[#9B00CC] flex items-center justify-center">
            <Luggage className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-serif mb-1">No hay paquetes en esta categoría</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Explora nuestros paquetes turísticos de temporada o guarda un paquete personalizado para planificar tu itinerario.
          </p>
          <Link
            href="/paquetes"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00C8D4] to-[#FF0096] text-white text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 transition-all"
          >
            <Compass className="w-4 h-4" />
            Explorar Catálogo de Paquetes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(pkg => {
            const waMsg = encodeURIComponent(`¡Hola! Quisiera solicitar cotización o reservar el paquete "${pkg.title}" (${pkg.duration}) en Hoteles de Venezuela.`);

            return (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-slate-900">
                    <img
                      src={pkg.image}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3">
                      {getStatusBadge(pkg.status)}
                    </div>

                    <button
                      onClick={() => onRemovePackage(pkg.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/60 backdrop-blur-md text-red-400 hover:text-red-500 hover:bg-white transition-all flex items-center justify-center shadow-xs cursor-pointer"
                      title="Quitar paquete guardado"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="flex items-center gap-1 font-medium text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-[#00C8D4]" />
                        {pkg.destination}
                      </span>
                      <span className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#00C8D4]">
                        <Clock className="w-3 h-3 text-[#FF0096]" />
                        {pkg.duration}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-[#9B00CC] transition-colors">
                      {pkg.title}
                    </h3>

                    {/* Servicios Incluidos */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Incluye:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {pkg.includedServices.map((srv, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold flex items-center gap-1"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            {srv}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Precio p/p desde:</span>
                    <span className="text-lg font-black text-[#00C8D4]">${pkg.priceUSD} <span className="text-xs font-normal text-slate-500">USD</span></span>
                  </div>

                  <a
                    href={`https://wa.me/584120000000?text=${waMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-white font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Cotizar
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
