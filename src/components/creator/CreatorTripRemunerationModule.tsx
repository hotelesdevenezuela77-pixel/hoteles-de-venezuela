import React, { useState } from "react";
import {
  DollarSign, MapPin, Calendar, CheckCircle, Clock,
  AlertCircle, Plus, FileText, Send, Share2, Copy, Check,
  Fuel, Utensils, Bed, Car, Compass, Package, ArrowRight,
  ShieldCheck, Wallet, ChevronRight, X, Trash2, Edit3,
  Receipt, Building2, User
} from "lucide-react";
import type {
  CreatorExpedition,
  ExpeditionPaymentStatus,
  ExpeditionPaymentMethod,
  ViaticosBreakdown,
  CreatorKpiSummary,
  InfluencerTravelAuthorization
} from "../../types/creatorInfluencer";

import { useBcvExchangeRate } from "../../hooks/useBcvExchangeRate";

interface CreatorTripRemunerationModuleProps {
  expeditions: CreatorExpedition[];
  travelAuthorizations?: InfluencerTravelAuthorization[];
  kpis: CreatorKpiSummary;
  creatorName?: string;
  onAddExpedition: (data: Partial<CreatorExpedition>) => void;
  onUpdateExpedition: (id: string, updates: Partial<CreatorExpedition>) => void;
  onUpdatePayment: (id: string, status: ExpeditionPaymentStatus, method?: ExpeditionPaymentMethod, ref?: string, date?: string) => void;
  onDeleteExpedition: (id: string) => void;
}

const CIAN = "#00C8D4";
const FUCSIA = "#FF0096";
const PURPURA = "#9B00CC";

const PAYMENT_METHODS: { id: ExpeditionPaymentMethod; label: string; icon: string }[] = [
  { id: "pago_movil", label: "Pago Móvil Interbancario", icon: "📱" },
  { id: "zelle", label: "Zelle USA", icon: "🇺🇸" },
  { id: "efectivo", label: "Efectivo USD (Cash)", icon: "💵" },
  { id: "transferencia", label: "Transferencia Bancaria", icon: "🏦" },
  { id: "binance_usdt", label: "Binance USDT (Cripto)", icon: "🟡" }
];

export const CreatorTripRemunerationModule: React.FC<CreatorTripRemunerationModuleProps> = ({
  expeditions,
  travelAuthorizations = [],
  kpis,
  creatorName = "Aura Croce",
  onAddExpedition,
  onUpdateExpedition,
  onUpdatePayment,
  onDeleteExpedition
}) => {
  const { bcvRate, formatBs, convertToBs } = useBcvExchangeRate();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [liquidatingTrip, setLiquidatingTrip] = useState<CreatorExpedition | null>(null);
  const [viewingReceiptTrip, setViewingReceiptTrip] = useState<CreatorExpedition | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for New Trip
  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    km_distance: "450",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 3 * 24 * 3600000).toISOString().split("T")[0],
    base_fee_usd: 20.00, // Fixed $20 USD fee
    combustible: "50",
    comidas: "40",
    hospedaje: "0",
    peajes: "10",
    guias_lancheros: "30",
    otros: "15",
    payment_status: "pendiente" as ExpeditionPaymentStatus,
    payment_method: "pago_movil" as ExpeditionPaymentMethod,
    notes: ""
  });

  // Payment Settlement Form
  const [settlementMethod, setSettlementMethod] = useState<ExpeditionPaymentMethod>("pago_movil");
  const [settlementRef, setSettlementRef] = useState<string>("");
  const [settlementDate, setSettlementDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Compute form viáticos subtotal
  const formViaticosTotal =
    (parseFloat(formData.combustible) || 0) +
    (parseFloat(formData.comidas) || 0) +
    (parseFloat(formData.hospedaje) || 0) +
    (parseFloat(formData.peajes) || 0) +
    (parseFloat(formData.guias_lancheros) || 0) +
    (parseFloat(formData.otros) || 0);

  const formTotalRemuneration = formData.base_fee_usd + formViaticosTotal;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.destination.trim()) return;

    const breakdown: ViaticosBreakdown = {
      combustible: parseFloat(formData.combustible) || 0,
      comidas: parseFloat(formData.comidas) || 0,
      hospedaje: parseFloat(formData.hospedaje) || 0,
      peajes: parseFloat(formData.peajes) || 0,
      guias_lancheros: parseFloat(formData.guias_lancheros) || 0,
      otros: parseFloat(formData.otros) || 0
    };

    onAddExpedition({
      title: formData.title.trim(),
      destination: formData.destination.trim(),
      km_distance: parseFloat(formData.km_distance) || 0,
      start_date: formData.start_date,
      end_date: formData.end_date,
      base_fee_usd: 20.00, // Guaranteed $20 fee
      viaticos_usd: formViaticosTotal,
      viaticos_breakdown: breakdown,
      total_remuneration_usd: formTotalRemuneration,
      payment_status: formData.payment_status,
      payment_method: formData.payment_method,
      notes: formData.notes.trim() || `Honorarios $20.00 + Viáticos $${formViaticosTotal.toFixed(2)}`
    });

    setIsCreateModalOpen(false);
    // Reset form
    setFormData({
      title: "",
      destination: "",
      km_distance: "450",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 3 * 24 * 3600000).toISOString().split("T")[0],
      base_fee_usd: 20.00,
      combustible: "50",
      comidas: "40",
      hospedaje: "0",
      peajes: "10",
      guias_lancheros: "30",
      otros: "15",
      payment_status: "pendiente",
      payment_method: "pago_movil",
      notes: ""
    });
  };

  const handleConfirmSettlement = () => {
    if (!liquidatingTrip) return;
    onUpdatePayment(
      liquidatingTrip.id,
      "liquidado",
      settlementMethod,
      settlementRef.trim() || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      settlementDate
    );
    setLiquidatingTrip(null);
    setSettlementRef("");
  };

  const handleCopyWhatsAppSummary = (trip: CreatorExpedition) => {
    const fee = (trip.base_fee_usd || 20.00).toFixed(2);
    const viat = (trip.viaticos_usd || 0).toFixed(2);
    const totalNum = trip.total_remuneration_usd || (trip.base_fee_usd || 20) + (trip.viaticos_usd || 0);
    const total = totalNum.toFixed(2);
    const bsTotal = formatBs(totalNum);
    const b = trip.viaticos_breakdown || {};

    const msg = `🧾 *LIQUIDACIÓN DE VIAJE / INFLUENCER HDV*
🌟 *Creador:* ${creatorName}
📍 *Ruta / Destino:* ${trip.title} (${trip.destination})
🗓️ *Fechas:* ${trip.start_date} al ${trip.end_date}
💵 *Tasa BCV Oficial:* Bs. ${bcvRate.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / USD

💵 *DESGLOSE FINANCIERO:*
• *Honorarios Profesionales Fijos:* $${fee} USD (~Bs. ${formatBs(Number(fee))})
• *Viáticos de Ruta:* $${viat} USD (~Bs. ${formatBs(Number(viat))})
  - Combustible: $${(b.combustible || 0).toFixed(2)}
  - Comidas / Hidratación: $${(b.comidas || 0).toFixed(2)}
  - Lancheros / Guías: $${(b.guias_lancheros || 0).toFixed(2)}
  - Peajes / Estacionamientos: $${(b.peajes || 0).toFixed(2)}
  - Hospedaje / Posada: $${(b.hospedaje || 0).toFixed(2)}
  - Otros / Logística: $${(b.otros || 0).toFixed(2)}

💰 *TOTAL A LIQUIDAR:* *$${total} USD* (~Bs. ${bsTotal})
📌 *Estado de Pago:* ${trip.payment_status.toUpperCase()} ${trip.payment_reference ? `(Ref: ${trip.payment_reference})` : ''}

_Hoteles de Venezuela LLC • Plataforma de Expediciones Turísticas_`;

    navigator.clipboard.writeText(msg);
    setCopiedId(trip.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleStartExpeditionFromAuth = (auth: InfluencerTravelAuthorization) => {
    const b = auth.viaticos_budget_breakdown || {};
    setFormData({
      title: auth.title,
      destination: auth.destination_target,
      km_distance: "450",
      start_date: auth.start_date,
      end_date: auth.end_date,
      base_fee_usd: auth.fee_per_trip_usd || 20.00,
      combustible: String(b.combustible || 45),
      comidas: String(b.comidas || 35),
      hospedaje: String(b.hospedaje || 25),
      peajes: String(b.peajes || 5),
      guias_lancheros: String(b.guias_lancheros || 20),
      otros: String(b.otros || 0),
      payment_status: "aprobado",
      payment_method: "pago_movil",
      notes: `Habilitado por Administración HDV: ${auth.title}. ${auth.admin_notes || ''}`
    });
    setIsCreateModalOpen(true);
  };

  const filteredExpeditions = expeditions.filter(exp => {
    const matchesStatus = filterStatus === "all" || exp.payment_status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      exp.title.toLowerCase().includes(q) ||
      exp.destination.toLowerCase().includes(q) ||
      (exp.payment_reference && exp.payment_reference.toLowerCase().includes(q));
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-8 text-slate-100 font-sans">

      {/* ── Cabecera de la Sección ── */}
      <div
        className="rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a0533 0%, #0e011f 100%)" }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: CIAN }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ background: FUCSIA }} />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider"
                   style={{ backgroundColor: `${CIAN}15`, color: CIAN, border: `1px solid ${CIAN}30` }}>
                <Wallet className="w-3.5 h-3.5" />
                <span>Finanzas de Creador & Coberturas Turísticas</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-mono font-bold bg-white/10 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Tasa Oficial BCV: Bs. {bcvRate.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / USD</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-wide">
              Remuneraciones de Viaje & Viáticos
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Módulo oficial para la asignación y liquidación de <strong className="text-white">Honorarios Base de $20.00 USD por cada viaje (~Bs. {formatBs(20)})</strong> más el reembolso y anticipo de <strong className="text-white">Viáticos de Carretera (Combustible, Lancheros, Comidas y Peajes)</strong> liquidados en Bolívares a la tasa oficial del día.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 rounded-2xl text-xs font-black text-white shadow-xl hover:scale-103 active:scale-97 transition-all flex items-center gap-2 cursor-pointer border border-white/20"
              style={{ background: `linear-gradient(135deg, ${FUCSIA} 0%, ${PURPURA} 100%)` }}
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Viaje ($20 Honorarios + Viáticos)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4 Tarjetas de Métricas Ejecutivas (KPIs) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Honorarios Base ($20 / Viaje) */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Honorarios Base ($20/Viaje)</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: CIAN }}>
              <DollarSign className="w-4.5 h-4.5 text-slate-950 font-bold" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ${kpis.totalBaseFeesUsd.toFixed(2)} <span className="text-xs font-bold text-slate-400">USD</span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 mt-1 flex items-center justify-between">
            <span>{kpis.totalTripsCount} viajes registrados</span>
            <span className="text-[#00C8D4] font-mono">$20.00 × {kpis.totalTripsCount}</span>
          </div>
        </div>

        {/* KPI 2: Viáticos de Ruta Asignados */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Viáticos de Ruta</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: PURPURA }}>
              <Fuel className="w-4.5 h-4.5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            ${kpis.totalViaticosUsd.toFixed(2)} <span className="text-xs font-bold text-slate-400">USD</span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 mt-1 flex items-center justify-between">
            <span>Combustible, Comidas & Guías</span>
            <span className="text-purple-300 font-mono">Bs. {kpis.totalViaticosBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* KPI 3: Remuneración Total Consolidada */}
        <div className="p-5 rounded-2xl bg-white/5 border border-[#FF0096]/30 backdrop-blur-md shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Remuneración Global</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: FUCSIA }}>
              <Wallet className="w-4.5 h-4.5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#FF0096]">
            ${kpis.totalRemunerationUsd.toFixed(2)} <span className="text-xs font-bold text-slate-400">USD</span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 mt-1 flex items-center justify-between">
            <span>Honorarios + Viáticos</span>
            <span className="text-pink-300 font-mono">Bs. {kpis.totalRemunerationBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* KPI 4: Liquidados vs Pendientes */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estado de Pagos</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white bg-emerald-500">
              <CheckCircle className="w-4.5 h-4.5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            ${kpis.liquidatedRemunerationUsd.toFixed(2)} <span className="text-xs font-bold text-slate-400">USD</span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 mt-1 flex items-center justify-between">
            <span>Liquidado / Pagado</span>
            <span className="text-amber-400 font-bold">Pendiente: ${kpis.pendingRemunerationUsd.toFixed(2)}</span>
          </div>
        </div>

      </div>

      {/* ── VENTANAS DE VIAJE HABILITADAS POR ADMINISTRACIÓN CENTRAL HDV ── */}
      {travelAuthorizations && travelAuthorizations.length > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1a0533]/90 via-[#0e011f]/95 to-[#1a0533]/90 border border-[#00C8D4]/40 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00C8D4]/20 border border-[#00C8D4]/40 flex items-center justify-center text-[#00C8D4] shadow-md">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>Ventanas de Viaje Habilitadas por HDV</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#00C8D4]/20 text-[#00C8D4] border border-[#00C8D4]/40">
                    $20 Honorarios / Viaje
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  Periodos autorizados (días, semanas o meses) asignados desde la administración central con viáticos aprobados.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {travelAuthorizations.map((auth) => {
              const isEnabled = auth.status === "habilitado" || auth.status === "en_curso";
              const totalBudg = (auth.total_honorarios_usd || 20) + (auth.approved_viaticos_budget_usd || 0);

              return (
                <div
                  key={auth.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isEnabled
                      ? "bg-white/5 border-[#00C8D4]/40 hover:border-[#00C8D4] shadow-lg"
                      : "bg-white/2 border-white/10 opacity-75"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200">
                        {auth.period_type === "dias" && "📅 Días Específicos"}
                        {auth.period_type === "semanas" && "🗓️ Por Semana"}
                        {auth.period_type === "mes" && "📆 Mes Completo"}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isEnabled ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}>
                        {isEnabled ? "Habilitado" : "Programado"}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug line-clamp-1">{auth.title}</h4>
                    
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-2">
                      <MapPin className="w-3.5 h-3.5 text-[#FF0096] shrink-0" />
                      <span className="truncate">{auth.destination_target}</span>
                    </div>

                    <div className="mt-3 p-3 bg-black/40 rounded-xl border border-white/5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px]">Periodo:</span>
                        <span className="font-bold text-slate-200">
                          {auth.period_type === "dias" && `${auth.start_date} al ${auth.end_date}`}
                          {auth.period_type === "semanas" && (auth.assigned_week || `${auth.start_date} al ${auth.end_date}`)}
                          {auth.period_type === "mes" && (auth.assigned_month || "Mes Completo")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px]">Honorarios Base:</span>
                        <span className="font-bold text-[#FF0096]">${(auth.total_honorarios_usd || 20).toFixed(2)} USD</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[11px]">Viáticos Aprobados:</span>
                        <span className="font-bold text-[#9B00CC]">${(auth.approved_viaticos_budget_usd || 0).toFixed(2)} USD</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-white/10 font-bold">
                        <span className="text-slate-300 text-[11px]">Presupuesto Total:</span>
                        <span className="text-[#00C8D4]">${totalBudg.toFixed(2)} USD</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartExpeditionFromAuth(auth)}
                    className="w-full mt-4 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] hover:brightness-110 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Iniciar Expedición sobre esta Ventana
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Barra de Control: Filtros y Búsqueda ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 shadow-md">
        
        {/* Filtro por estado */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {[
            { id: "all", label: "Todos los Viajes" },
            { id: "pendiente", label: "Pendientes de Pago" },
            { id: "aprobado", label: "Aprobados / En Ruta" },
            { id: "liquidado", label: "Liquidados / Pagados" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterStatus === tab.id
                  ? "bg-[#00C8D4] text-slate-950 shadow-md font-black"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Buscar por destino, ruta o ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C8D4]"
          />
        </div>

      </div>

      {/* ── Lista de Viajes Remunerados ── */}
      <div className="space-y-4">
        {filteredExpeditions.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/5 border border-white/10">
            <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-300">No se encontraron viajes registrados</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Comienza registrando tu primer viaje con la tarifa base garantizada de $20.00 USD más el cálculo de viáticos.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg cursor-pointer inline-flex items-center gap-2"
              style={{ background: `linear-gradient(135deg, ${FUCSIA} 0%, ${PURPURA} 100%)` }}
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Viaje Ahora</span>
            </button>
          </div>
        ) : (
          filteredExpeditions.map((trip) => {
            const baseFee = trip.base_fee_usd || 20.00;
            const viat = trip.viaticos_usd || 0;
            const totalRemun = trip.total_remuneration_usd || (baseFee + viat);
            const b = trip.viaticos_breakdown || {};

            return (
              <div
                key={trip.id}
                className="p-6 rounded-3xl bg-gradient-to-r from-[#1a0533]/90 via-[#0e011f]/90 to-[#1a0533]/90 border border-white/10 hover:border-white/20 transition-all shadow-xl space-y-5"
              >
                {/* Fila 1: Encabezado de la Tarjeta */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-slate-950 bg-[#00C8D4]">
                        {trip.destination}
                      </span>
                      <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {trip.start_date} al {trip.end_date}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        • {trip.km_distance} km
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white font-serif">
                      {trip.title}
                    </h3>
                  </div>

                  {/* Badge de Estado de Pago */}
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                      trip.payment_status === "liquidado"
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                        : trip.payment_status === "aprobado"
                        ? "bg-sky-500/15 border-sky-500/30 text-sky-400"
                        : "bg-amber-500/15 border-amber-500/30 text-amber-400"
                    }`}>
                      {trip.payment_status === "liquidado" ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>Liquidado / Pagado</span>
                        </>
                      ) : trip.payment_status === "aprobado" ? (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>Aprobado / En Tránsito</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 animate-pulse" />
                          <span>Pendiente de Pago</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Fila 2: Bloques de Honorarios, Viáticos y Total */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Bloque A: Honorario Profesional Base ($20 USD) */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Honorarios Profesionales</span>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#00C8D4]/20 text-[#00C8D4] border border-[#00C8D4]/30">
                        Fijo por Viaje
                      </span>
                    </div>
                    <div className="text-xl font-black text-white font-mono flex items-baseline gap-1">
                      <span>${baseFee.toFixed(2)}</span>
                      <span className="text-xs text-slate-400">USD</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Compensación base garantizada por cobertura y auditoría de la ruta.
                    </p>
                  </div>

                  {/* Bloque B: Desglose de Viáticos Asignados */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Viáticos de Carretera</span>
                      <span className="text-xs font-black text-purple-300 font-mono">
                        ${viat.toFixed(2)} USD
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-300">
                      <span className="flex items-center gap-1 truncate" title="Combustible">
                        <Fuel className="w-3 h-3 text-[#00C8D4] shrink-0" />
                        <span>Gasolina: ${(b.combustible || 0).toFixed(0)}</span>
                      </span>
                      <span className="flex items-center gap-1 truncate" title="Comidas">
                        <Utensils className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>Comidas: ${(b.comidas || 0).toFixed(0)}</span>
                      </span>
                      <span className="flex items-center gap-1 truncate" title="Lancheros y Guías">
                        <Compass className="w-3 h-3 text-[#FF0096] shrink-0" />
                        <span>Guías: ${(b.guias_lancheros || 0).toFixed(0)}</span>
                      </span>
                      <span className="flex items-center gap-1 truncate" title="Peajes y Varios">
                        <Car className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>Peajes/Otros: ${((b.peajes || 0) + (b.otros || 0)).toFixed(0)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Bloque C: Total Remuneración a Percibir */}
                  <div className="p-4 rounded-2xl bg-gradient-to-tr from-[#1a0533] to-[#0e011f] border border-[#FF0096]/30 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-pink-300">Total Liquidación</span>
                      <span className="text-[9px] font-bold text-slate-400">Honorarios + Viáticos</span>
                    </div>
                    <div className="text-2xl font-black text-white font-mono">
                      ${totalRemun.toFixed(2)} <span className="text-xs font-bold text-[#FF0096]">USD</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                      <span>Ref. BCV ({bcvRate.toLocaleString("es-VE", { minimumFractionDigits: 2 })}):</span>
                      <span className="text-slate-200 font-bold">Bs. {formatBs(totalRemun)}</span>
                    </div>
                  </div>

                </div>

                {/* Fila 3: Información de Pago y Botones de Acción */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2 border-t border-white/5">
                  
                  {/* Detalles de Pago / Referencia */}
                  <div className="text-xs text-slate-400 space-y-0.5">
                    {trip.payment_reference ? (
                      <p className="flex items-center gap-2">
                        <span className="font-bold text-slate-300">Comprobante / Ref:</span>
                        <span className="font-mono text-[#00C8D4] bg-white/5 px-2 py-0.5 rounded border border-white/10">{trip.payment_reference}</span>
                        {trip.payment_date && <span className="text-[10px] text-slate-500">({trip.payment_date})</span>}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500">
                        {trip.notes || "Liquidación pendiente de asignación bancaria."}
                      </p>
                    )}
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* Botón WhatsApp */}
                    <button
                      type="button"
                      onClick={() => handleCopyWhatsAppSummary(trip)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 flex items-center gap-1.5 cursor-pointer transition-all"
                      title="Copiar resumen estructurado para WhatsApp"
                    >
                      {copiedId === trip.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copiar WhatsApp</span>
                        </>
                      )}
                    </button>

                    {/* Botón Ver Recibo */}
                    <button
                      type="button"
                      onClick={() => setViewingReceiptTrip(trip)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#00C8D4]/15 hover:bg-[#00C8D4]/25 text-[#00C8D4] border border-[#00C8D4]/30 flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Ver Recibo</span>
                    </button>

                    {/* Botón Liquidar Pago si no está liquidado */}
                    {trip.payment_status !== "liquidado" && (
                      <button
                        type="button"
                        onClick={() => {
                          setLiquidatingTrip(trip);
                          setSettlementRef(trip.payment_reference || "");
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-black text-white shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-103 transition-all"
                        style={{ background: `linear-gradient(135deg, ${FUCSIA} 0%, ${PURPURA} 100%)` }}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Liquidar Pago</span>
                      </button>
                    )}

                    {/* Botón Eliminar */}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Deseas eliminar el registro de este viaje "${trip.title}"?`)) {
                          onDeleteExpedition(trip.id);
                        }
                      }}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ── MODAL 1: Registrar Nuevo Viaje Remunerado ($20 Honorarios + Viáticos) ── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#1a0533] to-[#0e011f] border border-white/15 rounded-3xl p-6 md:p-8 text-white shadow-2xl space-y-6 my-8">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-[#00C8D4] tracking-wider">
                  NUEVA ASIGNACIÓN DE EXPEDICIÓN
                </span>
                <h3 className="text-xl font-bold font-serif text-white">
                  Registrar Viaje con Honorarios & Viáticos
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5">
              
              {/* Datos de Ruta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Nombre de la Expedición / Ruta
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Ruta Playera Morrocoy & Cayo Agua"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Destino Geográfico
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Tucacas - Chichiriviche, Falcón"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>
              </div>

              {/* Fechas y Distancia */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Fecha de Salida
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Fecha de Retorno
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Distancia Estimada (Km)
                  </label>
                  <input
                    type="number"
                    value={formData.km_distance}
                    onChange={(e) => setFormData({ ...formData, km_distance: e.target.value })}
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>
              </div>

              {/* Bloque de Honorarios Fijos $20 */}
              <div className="p-4 rounded-2xl bg-[#00C8D4]/10 border border-[#00C8D4]/30 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase text-[#00C8D4] tracking-wider">
                    HONORARIOS PROFESIONALES FIJOS
                  </span>
                  <p className="text-xs text-slate-300">
                    Tarifa garantizada por viaje para el creador
                  </p>
                </div>
                <div className="text-2xl font-black text-white font-mono bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                  $20.00 <span className="text-xs text-[#00C8D4]">USD</span>
                </div>
              </div>

              {/* Desglose de Viáticos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Desglose de Viáticos de Carretera ($ USD)
                  </label>
                  <span className="text-xs font-black text-purple-300 font-mono">
                    Subtotal Viáticos: ${formViaticosTotal.toFixed(2)} USD
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold mb-1">⛽ Combustible ($)</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.combustible}
                      onChange={(e) => setFormData({ ...formData, combustible: e.target.value })}
                      className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold mb-1">🍽️ Comidas / Hidratación ($)</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.comidas}
                      onChange={(e) => setFormData({ ...formData, comidas: e.target.value })}
                      className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold mb-1">🚤 Lancheros / Guías ($)</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.guias_lancheros}
                      onChange={(e) => setFormData({ ...formData, guias_lancheros: e.target.value })}
                      className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold mb-1">🚗 Peajes / Parking ($)</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.peajes}
                      onChange={(e) => setFormData({ ...formData, peajes: e.target.value })}
                      className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold mb-1">🏨 Hospedaje / Posada ($)</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.hospedaje}
                      onChange={(e) => setFormData({ ...formData, hospedaje: e.target.value })}
                      className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold mb-1">📦 Otros / Logística ($)</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.otros}
                      onChange={(e) => setFormData({ ...formData, otros: e.target.value })}
                      className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Total Consolidado Preview */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FF0096]/20 to-[#9B00CC]/20 border border-[#FF0096]/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-pink-300">TOTAL REMUNERACIÓN DEL VIAJE</span>
                  <div className="text-xs text-slate-300">$20.00 (Honorarios) + ${formViaticosTotal.toFixed(2)} (Viáticos)</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-white font-mono">
                    ${formTotalRemuneration.toFixed(2)} <span className="text-xs text-[#FF0096]">USD</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-300">
                    ~Bs. {formatBs(formTotalRemuneration)} BCV
                  </div>
                </div>
              </div>

              {/* Botón Submit */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-black text-white shadow-xl hover:scale-103 cursor-pointer"
                  style={{ background: `linear-gradient(135deg, ${FUCSIA} 0%, ${PURPURA} 100%)` }}
                >
                  Confirmar y Asignar Viaje
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ── MODAL 2: Liquidar Pago de Viaje ── */}
      {liquidatingTrip && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#1a0533] border border-white/20 rounded-3xl p-6 text-white shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold font-serif">
                Liquidar Remuneración de Viaje
              </h3>
              <button
                onClick={() => setLiquidatingTrip(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">{liquidatingTrip.destination}</span>
              <p className="font-bold text-white text-sm">{liquidatingTrip.title}</p>
              <div className="flex items-baseline justify-between pt-1">
                <div className="text-lg font-black text-[#00C8D4] font-mono">
                  Total: ${(liquidatingTrip.total_remuneration_usd || (liquidatingTrip.base_fee_usd + liquidatingTrip.viaticos_usd)).toFixed(2)} USD
                </div>
                <div className="text-xs font-mono text-slate-300 font-bold">
                  ~Bs. {formatBs(liquidatingTrip.total_remuneration_usd || (liquidatingTrip.base_fee_usd + liquidatingTrip.viaticos_usd))}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Método de Pago</label>
                <select
                  value={settlementMethod}
                  onChange={(e) => setSettlementMethod(e.target.value as ExpeditionPaymentMethod)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#00C8D4]"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                      {m.icon} {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Número de Referencia / Comprobante</label>
                <input
                  type="text"
                  placeholder="Ej: REF-PAGOMOVIL-902341"
                  value={settlementRef}
                  onChange={(e) => setSettlementRef(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#00C8D4]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Fecha de Liquidación</label>
                <input
                  type="date"
                  value={settlementDate}
                  onChange={(e) => setSettlementDate(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white focus:outline-none focus:border-[#00C8D4]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLiquidatingTrip(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSettlement}
                className="px-5 py-2 rounded-xl text-xs font-black text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg cursor-pointer"
              >
                Confirmar Pago Liquidado
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL 3: Recibo Oficial de Liquidación ── */}
      {viewingReceiptTrip && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white text-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            
            {/* Cabecera del Recibo */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#00C8D4] tracking-widest block">
                  HOTELES DE VENEZUELA LLC
                </span>
                <h3 className="text-xl font-black font-serif text-slate-900">
                  Comprobante Oficial de Liquidación
                </h3>
                <span className="text-xs text-slate-500">Expedición & Cobertura de Creador</span>
              </div>
              <button
                onClick={() => setViewingReceiptTrip(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Datos del Creador y Viaje */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Influencer / Creador</span>
                <strong className="text-slate-800">{creatorName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Destino</span>
                <strong className="text-slate-800">{viewingReceiptTrip.destination}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Fechas de Viaje</span>
                <span className="text-slate-700">{viewingReceiptTrip.start_date} al {viewingReceiptTrip.end_date}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Estado</span>
                <span className="font-bold text-emerald-600 uppercase">{viewingReceiptTrip.payment_status}</span>
              </div>
            </div>

            {/* Tabla de Desglose */}
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                  <th className="py-2">Concepto</th>
                  <th className="py-2 text-right">Monto USD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 font-bold text-slate-800">Honorarios Profesionales Base (Viaje)</td>
                  <td className="py-2.5 text-right font-mono font-bold">${(viewingReceiptTrip.base_fee_usd || 20.00).toFixed(2)}</td>
                </tr>
                {viewingReceiptTrip.viaticos_breakdown?.combustible ? (
                  <tr>
                    <td className="py-1.5 text-slate-600">Viáticos: Combustible 4x4 / Lancha</td>
                    <td className="py-1.5 text-right font-mono">${viewingReceiptTrip.viaticos_breakdown.combustible.toFixed(2)}</td>
                  </tr>
                ) : null}
                {viewingReceiptTrip.viaticos_breakdown?.comidas ? (
                  <tr>
                    <td className="py-1.5 text-slate-600">Viáticos: Alimentación e Hidratación</td>
                    <td className="py-1.5 text-right font-mono">${viewingReceiptTrip.viaticos_breakdown.comidas.toFixed(2)}</td>
                  </tr>
                ) : null}
                {viewingReceiptTrip.viaticos_breakdown?.guias_lancheros ? (
                  <tr>
                    <td className="py-1.5 text-slate-600">Viáticos: Pagos a Lancheros & Guías</td>
                    <td className="py-1.5 text-right font-mono">${viewingReceiptTrip.viaticos_breakdown.guias_lancheros.toFixed(2)}</td>
                  </tr>
                ) : null}
                {viewingReceiptTrip.viaticos_breakdown?.peajes ? (
                  <tr>
                    <td className="py-1.5 text-slate-600">Viáticos: Peajes & Estacionamientos</td>
                    <td className="py-1.5 text-right font-mono">${viewingReceiptTrip.viaticos_breakdown.peajes.toFixed(2)}</td>
                  </tr>
                ) : null}
                {viewingReceiptTrip.viaticos_breakdown?.hospedaje ? (
                  <tr>
                    <td className="py-1.5 text-slate-600">Viáticos: Hospedaje / Posada</td>
                    <td className="py-1.5 text-right font-mono">${viewingReceiptTrip.viaticos_breakdown.hospedaje.toFixed(2)}</td>
                  </tr>
                ) : null}
                {viewingReceiptTrip.viaticos_breakdown?.otros ? (
                  <tr>
                    <td className="py-1.5 text-slate-600">Viáticos: Imprevistos / Logística</td>
                    <td className="py-1.5 text-right font-mono">${viewingReceiptTrip.viaticos_breakdown.otros.toFixed(2)}</td>
                  </tr>
                ) : null}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900 font-bold text-sm">
                  <td className="py-3 text-slate-900">
                    <div>TOTAL LIQUIDADO</div>
                    <div className="text-[10px] text-slate-500 font-normal font-mono">Tasa Oficial BCV: Bs. {bcvRate.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / USD</div>
                  </td>
                  <td className="py-3 text-right font-mono text-[#FF0096]">
                    <div>${(viewingReceiptTrip.total_remuneration_usd || (viewingReceiptTrip.base_fee_usd || 20) + (viewingReceiptTrip.viaticos_usd || 0)).toFixed(2)} USD</div>
                    <div className="text-xs text-slate-700 font-bold">~Bs. {formatBs(viewingReceiptTrip.total_remuneration_usd || (viewingReceiptTrip.base_fee_usd || 20) + (viewingReceiptTrip.viaticos_usd || 0))}</div>
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Referencia de Pago */}
            {viewingReceiptTrip.payment_reference && (
              <div className="p-3 rounded-xl bg-slate-100 text-[11px] text-slate-600 flex justify-between items-center">
                <span>Comprobante: <strong>{viewingReceiptTrip.payment_reference}</strong></span>
                <span>{viewingReceiptTrip.payment_date}</span>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleCopyWhatsAppSummary(viewingReceiptTrip)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Resumen</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl text-xs font-black text-white bg-slate-900 hover:bg-slate-800 cursor-pointer flex items-center gap-1.5"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Imprimir Recibo</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
