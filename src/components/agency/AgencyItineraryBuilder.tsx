import React, { useState } from "react";
import { Compass, Clock, MapPin, Plus, FileText, QrCode, Download, ShieldCheck, Sun, CheckCircle2 } from "lucide-react";
import type { AgencyQuote, AgencyItineraryDay } from "../../types/agencyTourOperator";

interface AgencyItineraryBuilderProps {
  quotes?: AgencyQuote[];
  itineraries?: AgencyItineraryDay[];
  onAddItineraryDay: (day: Partial<AgencyItineraryDay>) => void;
}

export const AgencyItineraryBuilder: React.FC<AgencyItineraryBuilderProps> = ({
  quotes = [],
  itineraries = [],
  onAddItineraryDay
}) => {
  const safeQuotes = quotes || [];
  const safeItineraries = itineraries || [];

  const [selectedQuoteId, setSelectedQuoteId] = useState<string>(safeQuotes[0]?.id || "");
  const selectedQuote = safeQuotes.find((q) => q.id === selectedQuoteId) || safeQuotes[0];

  const [dayNumber, setDayNumber] = useState(1);
  const [timeSchedule, setTimeSchedule] = useState("08:30 AM");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [outfit, setOutfit] = useState("");

  const quoteItineraries = safeItineraries.filter((it) => it.quote_id === selectedQuoteId);

  const handleAddDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onAddItineraryDay({
      quote_id: selectedQuoteId,
      day_number: dayNumber,
      time_schedule: timeSchedule.trim(),
      title: title.trim(),
      description: description.trim(),
      location_name: locationName.trim(),
      outfit_recommendations: outfit.trim()
    });

    setTitle("");
    setDescription("");
  };

  return (
    <div className="rounded-3xl bg-[#1a0533]/80 border border-white/10 p-6 shadow-2xl backdrop-blur-md mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-5 mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#9B00CC] flex items-center justify-center shadow-lg shadow-[#9B00CC]/20">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Generador de Itinerarios & Voucher Digital QR</h3>
            <p className="text-xs text-slate-400">Planificación cronológica de la expedición y orden de servicio</p>
          </div>
        </div>

        {/* Selector de Expedición / Reserva */}
        <div className="w-full sm:w-auto">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Seleccionar Expedición:
          </label>
          <select
            value={selectedQuoteId}
            onChange={(e) => setSelectedQuoteId(e.target.value)}
            className="w-full sm:w-72 bg-slate-900 border border-white/20 rounded-xl py-2 px-3 text-white text-xs font-bold focus:outline-none focus:border-[#9B00CC]"
          >
            {safeQuotes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.quote_number} - {q.client_name} ({q.package_title})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* FORMULARIO AGREGAR DÍA (Col 5) */}
        <form onSubmit={handleAddDay} className="lg:col-span-5 bg-slate-900/70 p-5 rounded-2xl border border-white/10 space-y-4">
          <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center">
            <Plus className="w-4 h-4 text-[#9B00CC] mr-1.5" /> Agregar Hito de Itinerario
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Día #
              </label>
              <input
                type="number"
                min="1"
                required
                value={dayNumber}
                onChange={(e) => setDayNumber(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Horario Programado
              </label>
              <input
                type="text"
                required
                value={timeSchedule}
                onChange={(e) => setTimeSchedule(e.target.value)}
                placeholder="Ej: 08:30 AM"
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Título de la Actividad / Zarpe
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Zarpe a Cayo Sombrero & Snorkel"
              className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-[#9B00CC]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Lugar / Punto de Encuentro
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Ej: Muelle Manto de María"
              className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-[#9B00CC]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Descripción Detallada
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explicación paso a paso de la actividad..."
              className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-[#9B00CC]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Recomendación de Vestimenta / Equipaje
            </label>
            <input
              type="text"
              value={outfit}
              onChange={(e) => setOutfit(e.target.value)}
              placeholder="Ej: Traje de baño, camisa protectora UV, calzado acuático"
              className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-[#9B00CC]"
            />
          </div>

          <button
            type="submit"
            disabled={!title.trim() || !description.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#9B00CC] to-[#00C8D4] text-white font-extrabold text-xs shadow-lg hover:opacity-95 disabled:opacity-50 transition-all uppercase tracking-wider"
          >
            AGREGAR DÍA AL ITINERARIO
          </button>
        </form>

        {/* VOUCHER DIGITAL & ITINERARIO VISUAL (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Tarjeta de Voucher Digital con QR */}
          <div className="bg-gradient-to-br from-[#0e011f] via-[#1a0533] to-[#0e011f] p-5 rounded-2xl border border-[#00C8D4]/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#00C8D4] font-bold uppercase">VOUCHER DE SERVICIO HDV-AGENCY</span>
                <h4 className="font-extrabold text-white text-base">{selectedQuote?.package_title}</h4>
              </div>
              <div className="w-12 h-12 bg-white p-1 rounded-xl shadow-lg shrink-0 flex items-center justify-center">
                <QrCode className="w-10 h-10 text-black" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Titular de la Reserva:</span>
                <span className="font-bold text-white">{selectedQuote?.client_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Pasajeros Confirmados:</span>
                <span className="font-bold text-white">{selectedQuote?.adults_count} Adultos, {selectedQuote?.children_count} Niños</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Fechas del Viaje:</span>
                <span className="font-bold text-emerald-400">{selectedQuote?.travel_start_date} al {selectedQuote?.travel_end_date}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Estado Financiero:</span>
                <span className="font-bold text-[#FF0096] uppercase">{selectedQuote?.status}</span>
              </div>
            </div>
          </div>

          {/* Lista Cronológica Día por Día */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center">
              <Clock className="w-4 h-4 text-[#00C8D4] mr-1.5" /> Cronograma de Viaje ({quoteItineraries.length} hitos)
            </h4>

            {quoteItineraries.map((it) => (
              <div
                key={it.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2 hover:border-[#9B00CC]/40 transition-all text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#9B00CC]/20 border border-[#9B00CC]/40 text-purple-300 font-extrabold font-mono text-[10px]">
                    DÍA {it.day_number} • {it.time_schedule}
                  </span>
                  {it.location_name && (
                    <span className="text-slate-400 flex items-center text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-[#00C8D4] mr-1 inline" /> {it.location_name}
                    </span>
                  )}
                </div>

                <h5 className="font-bold text-white text-sm">{it.title}</h5>
                <p className="text-slate-300 text-xs leading-relaxed">{it.description}</p>

                {it.outfit_recommendations && (
                  <div className="bg-black/30 p-2 rounded-xl border border-white/5 text-[11px] text-amber-300 flex items-center space-x-1.5">
                    <Sun className="w-3.5 h-3.5 shrink-0" />
                    <span>Equipaje sugerido: {it.outfit_recommendations}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
