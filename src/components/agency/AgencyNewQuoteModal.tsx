import React, { useState } from "react";
import { X, Ticket, Calendar, DollarSign, UserCheck, Plus } from "lucide-react";
import type { AgencyQuote, AgencyPackage } from "../../types/agencyTourOperator";

interface AgencyNewQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: AgencyPackage[];
  onCreateQuote: (quote: Partial<AgencyQuote>) => Promise<AgencyQuote>;
}

export const AgencyNewQuoteModal: React.FC<AgencyNewQuoteModalProps> = ({
  isOpen,
  onClose,
  packages,
  onCreateQuote
}) => {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState<string>(packages[0]?.id || "");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3 * 24 * 3600000).toISOString().split("T")[0]);
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [totalSaleUsd, setTotalSaleUsd] = useState("850");
  const [depositUsd, setDepositUsd] = useState("500");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedPkg = packages.find((p) => p.id === selectedPackageId);
      await onCreateQuote({
        client_name: clientName.trim(),
        client_email: clientEmail.trim(),
        client_phone: clientPhone.trim(),
        package_id: selectedPackageId,
        package_title: selectedPkg?.title || "Paquete a Medida",
        travel_start_date: startDate,
        travel_end_date: endDate,
        adults_count: adultsCount,
        children_count: childrenCount,
        total_sale_usd: parseFloat(totalSaleUsd) || 500,
        deposit_paid_usd: parseFloat(depositUsd) || 0
      });
      onClose();
    } catch (err) {
      console.error("Error al crear reserva:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-[#0e011f] border border-[#00C8D4]/30 shadow-2xl shadow-[#00C8D4]/10">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-[#1a0533] via-[#0e011f] to-[#1a0533]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#00C8D4] flex items-center justify-center shadow-lg shadow-[#00C8D4]/20">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Nueva Cotización / Reserva de Viaje</h3>
              <p className="text-xs text-slate-400">Carga rápida de expediente de viaje y anticipos de pago</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Nombre Titular de la Reserva
            </label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ej: Dr. Carlos Silva / Familia Pérez"
              className="w-full bg-slate-900 border border-white/20 rounded-2xl py-2.5 px-4 text-white text-xs focus:outline-none focus:border-[#00C8D4]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Teléfono WhatsApp</label>
              <input
                type="text"
                required
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+58 414 123 4567"
                className="w-full bg-slate-900 border border-white/20 rounded-xl py-2 px-3 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="w-full bg-slate-900 border border-white/20 rounded-xl py-2 px-3 text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Paquete Turístico Asociado
            </label>
            <select
              value={selectedPackageId}
              onChange={(e) => setSelectedPackageId(e.target.value)}
              className="w-full bg-slate-900 border border-white/20 rounded-xl py-2.5 px-3 text-white text-xs font-bold"
            >
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (${p.price_per_person_usd} p/p)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Fecha Salida</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-white/20 rounded-xl py-2 px-3 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Fecha Retorno</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-900 border border-white/20 rounded-xl py-2 px-3 text-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Monto Venta Total ($)</label>
              <input
                type="number"
                required
                value={totalSaleUsd}
                onChange={(e) => setTotalSaleUsd(e.target.value)}
                className="w-full bg-slate-900 border border-white/20 rounded-xl py-2 px-3 text-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Anticipo Pagado ($)</label>
              <input
                type="number"
                value={depositUsd}
                onChange={(e) => setDepositUsd(e.target.value)}
                className="w-full bg-slate-900 border border-white/20 rounded-xl py-2 px-3 text-white text-xs font-bold text-emerald-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !clientName.trim()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00C8D4] via-[#9B00CC] to-[#FF0096] text-white font-extrabold text-xs shadow-xl uppercase tracking-wider hover:opacity-95 transition-all"
          >
            REGISTRAR COTIZACIÓN / RESERVA
          </button>
        </form>

      </div>
    </div>
  );
};
