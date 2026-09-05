import React, { useState, useEffect, useRef } from "react";
import { X, QrCode, ShieldAlert, CheckCircle2, AlertTriangle, User, Users, Ship, Utensils, Sparkles, RefreshCw } from "lucide-react";
import type { QRValidationResult, ParkTicket } from "../../types/parkComplex";

interface ParkQRValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidate: (code: string) => Promise<QRValidationResult>;
  recentTickets: ParkTicket[];
}

export const ParkQRValidationModal: React.FC<ParkQRValidationModalProps> = ({
  isOpen,
  onClose,
  onValidate,
  recentTickets
}) => {
  const [qrCodeInput, setQrCodeInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<QRValidationResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQrCodeInput("");
      setResult(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCodeInput.trim()) return;

    setIsValidating(true);
    setResult(null);
    try {
      const res = await onValidate(qrCodeInput);
      setResult(res);
      setQrCodeInput("");
    } catch (err) {
      setResult({
        success: false,
        error_code: "UNKNOWN",
        message: "Error de conexión al servidor de taquilla."
      });
    } finally {
      setIsValidating(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  };

  const handleQuickSelectRecent = async (code: string) => {
    setQrCodeInput(code);
    setIsValidating(true);
    setResult(null);
    try {
      const res = await onValidate(code);
      setResult(res);
      setQrCodeInput("");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-[#0e011f] border border-[#00C8D4]/30 shadow-2xl shadow-[#00C8D4]/10">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-[#1a0533] via-[#0e011f] to-[#1a0533]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#00C8D4] flex items-center justify-center shadow-lg shadow-[#00C8D4]/20">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Validación de Pase QR</h3>
              <p className="text-xs text-slate-400">Escáner de Taquilla & Mecanismo Antifraude Atómico</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Scanner Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Escanear Código QR o Tipear Código de Pase
              </label>
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={qrCodeInput}
                  onChange={(e) => setQrCodeInput(e.target.value)}
                  placeholder="Ej: HDV-MN-7704 (o escanee con el lector USB)"
                  className="w-full bg-slate-900/90 border border-white/20 rounded-2xl py-3.5 pl-4 pr-32 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-[#00C8D4] focus:ring-2 focus:ring-[#00C8D4]/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={isValidating || !qrCodeInput.trim()}
                  className="absolute right-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] text-white font-bold text-xs hover:opacity-95 disabled:opacity-50 transition-all flex items-center space-x-1"
                >
                  {isValidating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>VALIDAR</span>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Resultado de Validación */}
          {result && (
            <div className={`p-5 rounded-2xl border transition-all animate-slideUp ${
              result.success
                ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-100"
                : result.error_code === "ALREADY_USED"
                ? "bg-red-950/80 border-red-500/70 text-red-100 shadow-xl shadow-red-900/30"
                : "bg-amber-950/70 border-amber-500/50 text-amber-100"
            }`}>
              {/* Header Status */}
              <div className="flex items-start space-x-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                  result.success
                    ? "bg-emerald-500 text-white"
                    : result.error_code === "ALREADY_USED"
                    ? "bg-red-600 text-white animate-pulse"
                    : "bg-amber-500 text-white"
                }`}>
                  {result.success ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : result.error_code === "ALREADY_USED" ? (
                    <ShieldAlert className="w-6 h-6" />
                  ) : (
                    <AlertTriangle className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1">
                  <h4 className="font-extrabold text-base tracking-wide">
                    {result.success
                      ? "¡PASE AUTORIZADO - BIENVENIDO!"
                      : result.error_code === "ALREADY_USED"
                      ? "¡ALERTA ANTIFRAUDE! BOLETO YA CANJEADO"
                      : "¡TICKET INVÁLIDO RECHAZADO!"}
                  </h4>
                  <p className="text-xs opacity-90 mt-0.5">{result.message}</p>
                  
                  {result.used_at && (
                    <p className="text-[11px] font-mono mt-1 text-red-300 font-bold bg-red-900/40 px-2 py-0.5 rounded inline-block">
                      Canjeado el: {new Date(result.used_at).toLocaleString("es-VE")}
                    </p>
                  )}
                </div>
              </div>

              {/* Feedback Operativo si existe ticket */}
              {result.ticket && (
                <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="block text-[10px] opacity-70 uppercase font-semibold">Cliente Titular</span>
                    <span className="font-bold text-white text-sm">{result.ticket.guest_name}</span>
                  </div>

                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="block text-[10px] opacity-70 uppercase font-semibold">Composición del Grupo</span>
                    <span className="font-bold text-white text-sm">
                      {result.ticket.adults_count} Adulto(s) • {result.ticket.children_count} Niño(s)
                    </span>
                  </div>

                  <div className="col-span-2 bg-black/30 p-2.5 rounded-xl border border-white/5 flex flex-wrap gap-2">
                    <span className="block w-full text-[10px] opacity-70 uppercase font-semibold mb-1">Extras Incluidos</span>
                    
                    {result.ticket.has_boat_ride && (
                      <span className="px-2.5 py-1 rounded-lg bg-[#00C8D4]/20 border border-[#00C8D4]/40 text-[#00C8D4] font-bold text-[11px] flex items-center space-x-1">
                        <Ship className="w-3.5 h-3.5 inline mr-1" /> Paseo en Bote
                      </span>
                    )}

                    {result.ticket.has_food_package && (
                      <span className="px-2.5 py-1 rounded-lg bg-[#FF0096]/20 border border-[#FF0096]/40 text-[#FF0096] font-bold text-[11px] flex items-center space-x-1">
                        <Utensils className="w-3.5 h-3.5 inline mr-1" /> Combo Almuerzo
                      </span>
                    )}

                    {result.ticket.vip_access && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[11px] flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5 inline mr-1" /> Área VIP Relax
                      </span>
                    )}

                    {!result.ticket.has_boat_ride && !result.ticket.has_food_package && !result.ticket.vip_access && (
                      <span className="text-slate-400 italic text-[11px]">Entrada estándar general</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Demo Tickets Picker */}
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Pruebas Rápidas de Taquilla (Simular Canjes Web / Fraudes):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recentTickets.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleQuickSelectRecent(t.ticket_code)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    t.status === "used"
                      ? "bg-red-950/20 border-red-500/30 text-red-300 hover:bg-red-950/40"
                      : "bg-slate-900/60 border-white/10 text-slate-200 hover:border-[#00C8D4]/50"
                  }`}
                >
                  <div>
                    <span className="font-mono font-bold block">{t.ticket_code}</span>
                    <span className="text-[10px] opacity-75">{t.guest_name}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    t.status === "used" ? "bg-red-600 text-white" : "bg-[#00C8D4] text-white"
                  }`}>
                    {t.status === "used" ? "Canjeado" : "Pendiente"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-all"
          >
            Cerrar Escáner
          </button>
        </div>

      </div>
    </div>
  );
};
