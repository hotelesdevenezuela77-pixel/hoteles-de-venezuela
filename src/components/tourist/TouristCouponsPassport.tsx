import React, { useState } from "react";
import { 
  Ticket, 
  Award, 
  Copy, 
  Check, 
  QrCode, 
  Sparkles, 
  Compass, 
  MapPin, 
  ShieldCheck,
  Percent,
  Gift
} from "lucide-react";

export interface CouponItem {
  code: string;
  discount: string;
  description: string;
  validUntil: string;
  category: string;
}

export interface StateStamp {
  id: string;
  stateName: string;
  region: string;
  iconName: string;
  unlocked: boolean;
  visitDate?: string;
}

export function TouristCouponsPassport() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const coupons: CouponItem[] = [
    {
      code: "BIENVENIDAHDV",
      discount: "15% OFF",
      description: "Descuento en tu primera reserva de posada verificada en la plataforma.",
      validUntil: "31 de Diciembre, 2026",
      category: "Posadas & Hoteles"
    },
    {
      code: "ROQUESVIP2026",
      discount: "$50 USD Voucher",
      description: "Aplica para paquetes All-Inclusive a Los Roques superiores a 3 noches.",
      validUntil: "15 de Octubre, 2026",
      category: "Paquetes VIP"
    },
    {
      code: "CARNAVALES2026",
      discount: "10% OFF",
      description: "Válido para escapadas playeras a Mochima, Morrocoy y Margarita.",
      validUntil: "30 de Noviembre, 2026",
      category: "Escapadas de Playa"
    }
  ];

  const [stamps, setStamps] = useState<StateStamp[]>([
    { id: "roques", stateName: "Dependencias Federales", region: "Los Roques", iconName: "🏝️", unlocked: true, visitDate: "15 Mar 2026" },
    { id: "nueva_esparta", stateName: "Nueva Esparta", region: "Isla de Margarita", iconName: "🏖️", unlocked: true, visitDate: "10 Ene 2026" },
    { id: "falcon", stateName: "Falcón", region: "Morrocoy & Médanos", iconName: "🌵", unlocked: true, visitDate: "02 Feb 2026" },
    { id: "merida", stateName: "Mérida", region: "Sierra Nevada & Mukumbarí", iconName: "🏔️", unlocked: true, visitDate: "20 May 2026" },
    { id: "bolivar", stateName: "Bolívar", region: "Canaima & Salto Ángel", iconName: "🌊", unlocked: false },
    { id: "aragua", stateName: "Aragua", region: "Choroní & Henry Pittier", iconName: "🌴", unlocked: false },
    { id: "sucre", stateName: "Sucre", region: "Mochima & Playa Colorada", iconName: "🐬", unlocked: false },
    { id: "distrito_capital", stateName: "Distrito Capital", region: "Caracas & El Ávila", iconName: "🏙️", unlocked: true, visitDate: "05 Ago 2025" }
  ]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const toggleStamp = (id: string) => {
    setStamps(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          unlocked: !s.unlocked,
          visitDate: !s.unlocked ? new Date().toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" }) : undefined
        };
      }
      return s;
    }));
  };

  const unlockedCount = stamps.filter(s => s.unlocked).length;
  const progressPercent = Math.round((unlockedCount / stamps.length) * 100);

  return (
    <div className="space-y-8">
      {/* Sección 1: Cupones de Descuento */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00C8D4] flex items-center justify-center text-slate-950 shadow-md shadow-[#00C8D4]/20">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-slate-900">Mis Cupones de Viaje & Beneficios</h2>
              <p className="text-xs text-slate-500">Aplica estos códigos exclusivos en tus reservas directamente o preséntalos con tu QR.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coupons.map((coupon, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-2xl p-5 border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between group hover:border-[#00C8D4] transition-all"
            >
              {/* Decoración gráfica de ticket */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#FF0096]/10 rounded-full blur-xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00C8D4]/15 text-[#00C8D4] border border-[#00C8D4]/30">
                    {coupon.category}
                  </span>
                  <QrCode className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                </div>

                <div className="text-2xl font-black text-white font-serif mb-1 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#FF0096]" />
                  {coupon.discount}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {coupon.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block">Código Válido:</span>
                  <span className="font-mono text-xs font-bold text-[#00C8D4]">{coupon.code}</span>
                </div>

                <button
                  onClick={() => handleCopyCode(coupon.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    copiedCode === coupon.code
                      ? "bg-emerald-600 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sección 2: Pasaporte Turístico Gamificado */}
      <div className="bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl text-white space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF0096] to-[#9B00CC] flex items-center justify-center shadow-lg text-white">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black font-serif tracking-tight">Pasaporte Turístico de Venezuela</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  Explorador Élite
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Colecciona sellos interactivos desbloqueando los destinos y regiones que has visitado en el país.</p>
            </div>
          </div>

          <div className="w-full md:w-64 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-300">Progreso del Pasaporte:</span>
              <span className="text-[#00C8D4]">{unlockedCount} de {stamps.length} Sellos ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#00C8D4] via-[#FF0096] to-[#9B00CC] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Grid de Sellos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {stamps.map(stamp => (
            <div
              key={stamp.id}
              onClick={() => toggleStamp(stamp.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col items-center text-center relative group ${
                stamp.unlocked
                  ? "bg-slate-800/90 border-[#00C8D4]/50 hover:border-[#00C8D4] shadow-md"
                  : "bg-slate-950/40 border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700"
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-2 transition-transform group-hover:scale-110 ${
                stamp.unlocked ? "bg-[#00C8D4]/15 border-2 border-dashed border-[#00C8D4] shadow-inner" : "bg-slate-900 border border-slate-800 grayscale"
              }`}>
                {stamp.iconName}
              </div>

              <h4 className="text-xs font-bold text-slate-100">{stamp.region}</h4>
              <span className="text-[10px] text-slate-400 mt-0.5">{stamp.stateName}</span>

              <div className="mt-3 pt-2 border-t border-slate-800/80 w-full flex items-center justify-center gap-1">
                {stamp.unlocked ? (
                  <span className="text-[9px] font-bold text-[#00C8D4] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    {stamp.visitDate || "Sello Desbloqueado"}
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-500">Haz clic para marcar</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
