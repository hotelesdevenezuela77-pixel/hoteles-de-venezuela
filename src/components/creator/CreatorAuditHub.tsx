import React, { useState } from "react";
import { ShieldCheck, Plus, Wifi, Zap, Droplets, Star, FileText } from "lucide-react";
import type { CreatorEstablishmentAudit } from "../../types/creatorInfluencer";

interface CreatorAuditHubProps {
  audits: CreatorEstablishmentAudit[];
  onAddAudit: (audit: Partial<CreatorEstablishmentAudit>) => void;
}

export const CreatorAuditHub: React.FC<CreatorAuditHubProps> = ({
  audits,
  onAddAudit
}) => {
  const [visitedName, setVisitedName] = useState("");
  const [wifiMbps, setWifiMbps] = useState("45");
  const [waterPressure, setWaterPressure] = useState<"excelente" | "aceptable" | "deficiente">("excelente");
  const [generator, setGenerator] = useState<"si_automatica" | "si_manual" | "no_tiene">("si_automatica");
  const [well, setWell] = useState<"si_pozo_propio" | "tanque_reserva" | "no_tiene">("si_pozo_propio");
  const [score, setScore] = useState(9.5);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitedName.trim()) return;

    onAddAudit({
      visited_establishment_name: visitedName.trim(),
      wifi_speed_mbps: parseFloat(wifiMbps) || 0,
      water_pressure_status: waterPressure,
      power_generator_status: generator,
      water_well_status: well,
      overall_score: score,
      notes: notes.trim()
    });

    setVisitedName("");
    setNotes("");
  };

  return (
    <div className="rounded-3xl bg-[#1a0533]/80 border border-white/10 p-6 shadow-2xl backdrop-blur-md mb-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#00C8D4] flex items-center justify-center shadow-lg shadow-[#00C8D4]/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Evaluador Profesional de Establecimientos (Audit Hub)</h3>
            <p className="text-xs text-slate-400">Auditoría técnica de Wi-Fi, planta eléctrica, pozo de agua y servicio para nómadas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* FORMULARIO AUDITORÍA (Col 6) */}
        <form onSubmit={handleSubmit} className="lg:col-span-6 bg-slate-900/70 p-5 rounded-2xl border border-white/10 space-y-4">
          <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center">
            <Plus className="w-4 h-4 text-[#00C8D4] mr-1.5" /> Registrar Nueva Auditoría Técnica
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Nombre del Establecimiento Visitado
            </label>
            <input
              type="text"
              required
              value={visitedName}
              onChange={(e) => setVisitedName(e.target.value)}
              placeholder="Ej: Posada VIP Gran Sabana Lodge"
              className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-[#00C8D4]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Velocidad Wi-Fi (Mbps)
              </label>
              <input
                type="number"
                step="0.1"
                value={wifiMbps}
                onChange={(e) => setWifiMbps(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Puntuación (1 a 10)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="10"
                value={score}
                onChange={(e) => setScore(parseFloat(e.target.value) || 9.0)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs font-bold text-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Agua Caliente / Presión</label>
              <select
                value={waterPressure}
                onChange={(e) => setWaterPressure(e.target.value as any)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-2 text-white text-[11px]"
              >
                <option value="excelente">Excelente</option>
                <option value="aceptable">Aceptable</option>
                <option value="deficiente">Deficiente</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Planta Eléctrica</label>
              <select
                value={generator}
                onChange={(e) => setGenerator(e.target.value as any)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-2 text-white text-[11px]"
              >
                <option value="si_automatica">Sí (Automática)</option>
                <option value="si_manual">Sí (Manual)</option>
                <option value="no_tiene">No tiene</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Pozo / Reserva Agua</label>
              <select
                value={well}
                onChange={(e) => setWell(e.target.value as any)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-2 text-white text-[11px]"
              >
                <option value="si_pozo_propio">Pozo Propio</option>
                <option value="tanque_reserva">Tanque Reserva</option>
                <option value="no_tiene">Sin Reserva</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Notas & Recomendación Profesional
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles de Wi-Fi, estabilidad eléctrica, limpieza y trato al turista..."
              className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-[#00C8D4]"
            />
          </div>

          <button
            type="submit"
            disabled={!visitedName.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00C8D4] via-[#9B00CC] to-[#FF0096] text-white font-extrabold text-xs shadow-lg hover:opacity-95 disabled:opacity-50 transition-all uppercase tracking-wider"
          >
            VINCULAR AUDITORÍA AL DIRECTORIO HDV
          </button>
        </form>

        {/* LISTADO DE AUDITORÍAS REALIZADAS (Col 6) */}
        <div className="lg:col-span-6 space-y-4">
          <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center">
            <ShieldCheck className="w-4 h-4 text-[#00C8D4] mr-1.5" /> Fichas Técnicas Publicadas ({audits.length})
          </h4>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {audits.map((aud) => (
              <div
                key={aud.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2 hover:border-[#00C8D4]/40 transition-all text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-extrabold text-white text-sm">{aud.visited_establishment_name}</h5>
                    <span className="text-[10px] text-slate-400 block">Auditado por el creador</span>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs flex items-center">
                    <Star className="w-3.5 h-3.5 mr-1 fill-amber-400 text-amber-400" /> {aud.overall_score} / 10
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-black/30 p-2.5 rounded-xl border border-white/5 text-[11px]">
                  <div className="flex items-center space-x-1 text-sky-300">
                    <Wifi className="w-3.5 h-3.5 shrink-0" />
                    <span>{aud.wifi_speed_mbps} Mbps</span>
                  </div>

                  <div className="flex items-center space-x-1 text-amber-300">
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    <span>{aud.power_generator_status.replace("_", " ")}</span>
                  </div>

                  <div className="flex items-center space-x-1 text-cyan-300">
                    <Droplets className="w-3.5 h-3.5 shrink-0" />
                    <span>{aud.water_well_status.replace("_", " ")}</span>
                  </div>
                </div>

                {aud.notes && (
                  <p className="text-slate-300 text-[11px] leading-relaxed pt-1">{aud.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
