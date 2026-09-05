import React from "react";
import { QrCode, ShoppingBag, Ship, Wallet } from "lucide-react";

interface ParkQuickActionsProps {
  onOpenScanModal: () => void;
  onOpenPosModal: () => void;
  onOpenBoatModal: () => void;
  onOpenExpenseModal: () => void;
}

export const ParkQuickActions: React.FC<ParkQuickActionsProps> = ({
  onOpenScanModal,
  onOpenPosModal,
  onOpenBoatModal,
  onOpenExpenseModal
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-4">
      <div className="rounded-2xl bg-[#0e011f]/95 border border-[#00C8D4]/30 shadow-2xl shadow-[#00C8D4]/20 p-2.5 backdrop-blur-xl grid grid-cols-2 sm:grid-cols-4 gap-2">
        
        {/* 1. Validar Pase QR */}
        <button
          onClick={onOpenScanModal}
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-white font-extrabold text-xs shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            <QrCode className="w-4 h-4 text-white" />
          </div>
          <span className="truncate">Validar Pase QR</span>
        </button>

        {/* 2. Venta en Taquilla */}
        <button
          onClick={onOpenPosModal}
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white font-extrabold text-xs shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <span className="truncate">Venta en Taquilla</span>
        </button>

        {/* 3. Despachar Bote */}
        <button
          onClick={onOpenBoatModal}
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-900 border border-sky-500/40 text-sky-300 font-extrabold text-xs shadow-lg hover:bg-sky-950/60 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center">
            <Ship className="w-4 h-4 text-sky-400" />
          </div>
          <span className="truncate">Despachar Bote</span>
        </button>

        {/* 4. Cargar Gasto */}
        <button
          onClick={onOpenExpenseModal}
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-900 border border-red-500/40 text-red-300 font-extrabold text-xs shadow-lg hover:bg-red-950/60 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-red-400" />
          </div>
          <span className="truncate">Cargar Gasto</span>
        </button>

      </div>
    </div>
  );
};
