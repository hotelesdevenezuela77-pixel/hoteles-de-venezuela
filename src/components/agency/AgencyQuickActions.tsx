import React from "react";
import { Ticket, Compass, FileCheck, Wallet } from "lucide-react";

interface AgencyQuickActionsProps {
  onOpenNewQuoteModal: () => void;
  onNavigateItinerary: () => void;
  onEmitVoucher: () => void;
  onOpenPaySupplierModal: () => void;
}

export const AgencyQuickActions: React.FC<AgencyQuickActionsProps> = ({
  onOpenNewQuoteModal,
  onNavigateItinerary,
  onEmitVoucher,
  onOpenPaySupplierModal
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-4">
      <div className="rounded-2xl bg-[#0e011f]/95 border border-[#00C8D4]/30 shadow-2xl shadow-[#00C8D4]/20 p-2.5 backdrop-blur-xl grid grid-cols-2 sm:grid-cols-4 gap-2">
        
        {/* 1. Nueva Cotización / Reserva */}
        <button
          onClick={onOpenNewQuoteModal}
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-white font-extrabold text-xs shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            <Ticket className="w-4 h-4 text-white" />
          </div>
          <span className="truncate">Nueva Cotización</span>
        </button>

        {/* 2. Diseñar Itinerario */}
        <button
          onClick={onNavigateItinerary}
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#9B00CC] to-[#FF0096] text-white font-extrabold text-xs shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <span className="truncate">Diseñar Itinerario</span>
        </button>

        {/* 3. Emitir Voucher / Contrato */}
        <button
          onClick={onEmitVoucher}
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-900 border border-[#00C8D4]/40 text-[#00C8D4] font-extrabold text-xs shadow-lg hover:bg-[#00C8D4]/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-[#00C8D4]/20 flex items-center justify-center">
            <FileCheck className="w-4 h-4 text-[#00C8D4]" />
          </div>
          <span className="truncate">Emitir Voucher QR</span>
        </button>

        {/* 4. Registrar Pago a Proveedor */}
        <button
          onClick={onOpenPaySupplierModal}
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-extrabold text-xs shadow-lg hover:bg-amber-950/60 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <span className="truncate">Pago Proveedor</span>
        </button>

      </div>
    </div>
  );
};
