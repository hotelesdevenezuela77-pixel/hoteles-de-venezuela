import React from "react";
import { Upload, Award, Wallet, Calendar } from "lucide-react";

interface CreatorQuickActionsProps {
  onOpenImportModal: () => void;
  onNavigateDeals: () => void;
  onNavigateExpenses: () => void;
  onNavigateCalendar: () => void;
}

export const CreatorQuickActions: React.FC<CreatorQuickActionsProps> = ({
  onOpenImportModal,
  onNavigateDeals,
  onNavigateExpenses,
  onNavigateCalendar
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-4">
      <div className="rounded-2xl bg-[#0e011f]/95 border border-[#00C8D4]/30 shadow-2xl shadow-[#00C8D4]/20 p-2.5 backdrop-blur-xl grid grid-cols-2 sm:grid-cols-4 gap-2">
        
        {/* 1. Importar Ruta / Coordenadas */}
        <button
          onClick={onOpenImportModal}
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-white font-extrabold text-xs shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            <Upload className="w-4 h-4 text-white" />
          </div>
          <span className="truncate">Importar Ruta GPS</span>
        </button>

        {/* 2. Nuevo Contrato / Canje */}
        <button
          onClick={onNavigateDeals}
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#9B00CC] to-[#FF0096] text-white font-extrabold text-xs shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            <Award className="w-4 h-4 text-white" />
          </div>
          <span className="truncate">Nuevo Contrato</span>
        </button>

        {/* 3. Cargar Gasto de Ruta */}
        <button
          onClick={onNavigateExpenses}
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-900 border border-red-500/40 text-red-300 font-extrabold text-xs shadow-lg hover:bg-red-950/60 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-red-400" />
          </div>
          <span className="truncate">Cargar Gasto Ruta</span>
        </button>

        {/* 4. Nueva Tarea / Entregable */}
        <button
          onClick={onNavigateCalendar}
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-900 border border-sky-500/40 text-sky-300 font-extrabold text-xs shadow-lg hover:bg-sky-950/60 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <span className="truncate">Nueva Tarea</span>
        </button>

      </div>
    </div>
  );
};
