import React, { useState } from "react";
import { Users, Plus, FileText, Download, ShieldCheck, Heart, AlertCircle } from "lucide-react";
import type { AgencyPassenger, AgencyQuote } from "../../types/agencyTourOperator";

interface AgencyPassengerManifestProps {
  quotes: AgencyQuote[];
  passengers: AgencyPassenger[];
  onAddPassenger: (passenger: Partial<AgencyPassenger>) => void;
}

export const AgencyPassengerManifest: React.FC<AgencyPassengerManifestProps> = ({
  quotes,
  passengers,
  onAddPassenger
}) => {
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>(quotes[0]?.id || "");
  const selectedQuote = quotes.find((q) => q.id === selectedQuoteId) || quotes[0];

  const [fullName, setFullName] = useState("");
  const [docType, setDocType] = useState("Cédula");
  const [docNumber, setDocNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [nationality, setNationality] = useState("Venezolana");
  const [dietary, setDietary] = useState("Ninguna");
  const [medical, setMedical] = useState("Ninguna");
  const [emergency, setEmergency] = useState("");

  const manifestPassengers = passengers.filter((p) => p.quote_id === selectedQuoteId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !docNumber.trim()) return;

    onAddPassenger({
      quote_id: selectedQuoteId,
      full_name: fullName.trim(),
      document_type: docType,
      document_number: docNumber.trim(),
      birth_date: birthDate,
      nationality,
      dietary_restrictions: dietary.trim() || "Ninguna",
      medical_conditions: medical.trim() || "Ninguna",
      emergency_contact: emergency.trim()
    });

    setFullName("");
    setDocNumber("");
    setEmergency("");
  };

  return (
    <div className="rounded-3xl bg-[#1a0533]/80 border border-white/10 p-6 shadow-2xl backdrop-blur-md mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-5 mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF0096] flex items-center justify-center shadow-lg shadow-[#FF0096]/20">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Gestor de Pasajeros & Manifiesto de Viaje (Rooming List)</h3>
            <p className="text-xs text-slate-400">Fichas médicas, restricciones alimentarias y listas oficiales para Capitanía / Aerolíneas</p>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Expedición Seleccionada:
          </label>
          <select
            value={selectedQuoteId}
            onChange={(e) => setSelectedQuoteId(e.target.value)}
            className="w-full sm:w-72 bg-slate-900 border border-white/20 rounded-xl py-2 px-3 text-white text-xs font-bold focus:outline-none focus:border-[#FF0096]"
          >
            {quotes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.quote_number} - {q.client_name} ({q.package_title})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* FORMULARIO DE REGISTRO PASAJERO (Col 5) */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 bg-slate-900/70 p-5 rounded-2xl border border-white/10 space-y-4">
          <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center">
            <Plus className="w-4 h-4 text-[#FF0096] mr-1.5" /> Registrar Pasajero al Manifiesto
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Nombre Completo (Igual a Cédula/Pasaporte)
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej: Alejandro Magno Torrealba"
              className="w-full bg-slate-950 border border-white/15 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-[#FF0096]"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Documento</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-2 text-white text-xs font-bold"
              >
                <option value="Cédula">Cédula</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Número Documento</label>
              <input
                type="text"
                required
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="Ej: V-18.450.990"
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Fecha Nacimiento
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Nacionalidad
              </label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="Venezolana"
                className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Restricciones Alimentarias / Alergias
            </label>
            <input
              type="text"
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              placeholder="Ej: Alergia a mariscos / Vegetariano"
              className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-[#FF0096]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Condiciones Médicas / Medicamentos
            </label>
            <input
              type="text"
              value={medical}
              onChange={(e) => setMedical(e.target.value)}
              placeholder="Ej: Asma (inhalador) / Hipertensión"
              className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-[#FF0096]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Contacto de Emergencia (Nombre y Teléfono)
            </label>
            <input
              type="text"
              value={emergency}
              onChange={(e) => setEmergency(e.target.value)}
              placeholder="Ej: Maria Torrealba +58 414 111 2233"
              className="w-full bg-slate-950 border border-white/15 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-[#FF0096]"
            />
          </div>

          <button
            type="submit"
            disabled={!fullName.trim() || !docNumber.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white font-extrabold text-xs shadow-lg hover:opacity-95 disabled:opacity-50 transition-all uppercase tracking-wider"
          >
            AGREGAR PASAJERO AL MANIFIESTO
          </button>
        </form>

        {/* MANIFIESTO DE PASAJEROS CREADO (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center">
              <FileText className="w-4 h-4 text-[#00C8D4] mr-1.5" /> Manifiesto Oficial ({manifestPassengers.length} pax)
            </h4>

            <button
              onClick={() => alert("Generando Manifiesto PDF oficial para Capitanía y Autoridades...")}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#00C8D4]" />
              <span>Exportar PDF</span>
            </button>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {manifestPassengers.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2 hover:border-[#FF0096]/30 transition-all text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{p.full_name}</span>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">
                    {p.document_type}: {p.document_number}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Restricciones Alimentarias:</span>
                    <span className={p.dietary_restrictions !== "Ninguna" ? "text-amber-300 font-bold" : "text-slate-300"}>
                      {p.dietary_restrictions}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Condiciones Médicas:</span>
                    <span className={p.medical_conditions !== "Ninguna" ? "text-red-300 font-bold" : "text-slate-300"}>
                      {p.medical_conditions}
                    </span>
                  </div>
                </div>

                {p.emergency_contact && (
                  <div className="bg-black/30 p-2 rounded-xl border border-white/5 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Contacto Emergencia:</span>
                    <span className="font-bold text-white">{p.emergency_contact}</span>
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
