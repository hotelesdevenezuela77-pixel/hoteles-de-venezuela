import React, { useState } from "react";
import {
  FileText, Plus, DollarSign, Send, Check, CheckCircle2,
  Clock, Trash2, Edit2, Copy, Sparkles, Building2, User,
  Calendar, ArrowRight, Layers, Tag, X, ChevronRight, Award
} from "lucide-react";
import type { CreatorQuote, CreatorQuoteItem, QuoteStatus } from "../../types/creatorInfluencer";

interface CreatorQuotesManagerProps {
  quotes: CreatorQuote[];
  onAddQuote: (quote: Partial<CreatorQuote>) => void;
  onUpdateQuote: (id: string, updates: Partial<CreatorQuote>) => void;
  onDeleteQuote: (id: string) => void;
  onConvertToDeal: (id: string) => void;
  creatorName?: string;
}

import { useBcvExchangeRate } from "@/hooks/useBcvExchangeRate";

const CIAN = "#00C8D4";
const FUCSIA = "#FF0096";
const PURPURA = "#9B00CC";

// Servicios predefinidos del tarifario base del influencer
const BASE_SERVICES = [
  { name: "Reel Colaborativo en Instagram (4K Drone)", price: 150, desc: "Reel cinematográfico con tomas aéreas y recorrido de instalaciones" },
  { name: "Pack de 4 Stories con Enlace a Reservas HDV", price: 80, desc: "Historias con swipe-up directo a la ficha del negocio en la plataforma" },
  { name: "Video Completo YouTube / Reportaje Turístico", price: 350, desc: "Episodio dedicado de 8-12 minutos en canal de viajes" },
  { name: "Auditoría Técnica con Sello de Calidad HDV", price: 120, desc: "Evaluación de Wi-Fi, planta eléctrica y reporte para nómadas" },
  { name: "Cobertura Completa Fin de Semana (All-in-One)", price: 500, desc: "2 Reels + 8 Stories + Auditoría + Fotos de alta resolución" },
  { name: "Galería de 15 Fotografías Profesionales", price: 150, desc: "Fotografías de catálogo editadas con derechos comerciales de uso" }
];

export const CreatorQuotesManager: React.FC<CreatorQuotesManagerProps> = ({
  quotes,
  onAddQuote,
  onUpdateQuote,
  onDeleteQuote,
  onConvertToDeal,
  creatorName = "Aura Croce"
}) => {
  const { bcvRate, formatBs } = useBcvExchangeRate();
  const [filterStatus, setFilterStatus] = useState<QuoteStatus | "all">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estado del formulario de Cotización
  const [formData, setFormData] = useState({
    client_name: "",
    client_contact: "",
    destination_target: "",
    discount_usd: 0,
    valid_days: 30,
    notes: "",
    selectedServices: [] as { name: string; price: number; desc: string; qty: number }[]
  });

  const handleOpenCreate = () => {
    setFormData({
      client_name: "",
      client_contact: "",
      destination_target: "",
      discount_usd: 0,
      valid_days: 30,
      notes: "Tarifas válidas por 30 días continuos. Se requiere 50% de anticipo para reserva de fechas.",
      selectedServices: [
        { name: BASE_SERVICES[0].name, price: BASE_SERVICES[0].price, desc: BASE_SERVICES[0].desc, qty: 1 }
      ]
    });
    setShowCreateModal(true);
  };

  const handleToggleService = (srv: typeof BASE_SERVICES[0]) => {
    const exists = formData.selectedServices.find(s => s.name === srv.name);
    if (exists) {
      setFormData({
        ...formData,
        selectedServices: formData.selectedServices.filter(s => s.name !== srv.name)
      });
    } else {
      setFormData({
        ...formData,
        selectedServices: [...formData.selectedServices, { name: srv.name, price: srv.price, desc: srv.desc, qty: 1 }]
      });
    }
  };

  const formSubtotal = formData.selectedServices.reduce((acc, s) => acc + s.price * s.qty, 0);
  const formTotal = Math.max(0, formSubtotal - formData.discount_usd);

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_name.trim() || formData.selectedServices.length === 0) return;

    const items: CreatorQuoteItem[] = formData.selectedServices.map((s, idx) => ({
      id: `qi-${Date.now()}-${idx}`,
      service_name: s.name,
      description: s.desc,
      quantity: s.qty,
      unit_price_usd: s.price,
      total_usd: s.price * s.qty
    }));

    onAddQuote({
      client_name: formData.client_name.trim(),
      client_contact: formData.client_contact.trim(),
      destination_target: formData.destination_target.trim(),
      items,
      discount_usd: Number(formData.discount_usd) || 0,
      valid_until_date: new Date(Date.now() + formData.valid_days * 24 * 3600000).toISOString().split("T")[0],
      notes: formData.notes.trim(),
      status: "enviada"
    });

    setShowCreateModal(false);
  };

  const handleCopyWhatsAppQuote = (q: CreatorQuote) => {
    const itemsList = q.items.map(it => `• *${it.service_name}* (x${it.quantity}): $${it.total_usd.toFixed(2)} USD`).join("\n");
    const bsTotal = formatBs(q.total_usd);

    const text = `📋 *PROPUESTA COMERCIAL & COTIZACIÓN OFICIAL HDV* 🇻🇪\n` +
      `📄 *Cotización N°:* ${q.quote_number}\n` +
      `👤 *Creador(a):* ${creatorName} (Creadora Oficial Hoteles de Venezuela)\n` +
      `🏨 *Cliente / Establecimiento:* ${q.client_name}\n` +
      `📍 *Destino:* ${q.destination_target || 'Venezuela'}\n` +
      `🗓️ *Validez:* Hasta ${q.valid_until_date}\n` +
      `💵 *Tasa Oficial BCV:* Bs. ${bcvRate.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / USD\n\n` +
      `💼 *SERVICIOS INCLUIDOS EN LA COBERTURA:*\n` +
      `${itemsList}\n\n` +
      (q.discount_usd > 0 ? `🎟️ *Descuento Especial Convenio:* -$${q.discount_usd.toFixed(2)} USD\n` : '') +
      `💰 *MONTO TOTAL:* *$${q.total_usd.toFixed(2)} USD* (~Bs. ${bsTotal} BCV)\n\n` +
      `📌 *Condiciones:* ${q.notes || '50% para fijar fecha en agenda editorial y 50% contra entrega de material.'}\n\n` +
      `_Coordinación de Producción y Coberturas - Hoteles de Venezuela_`;

    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const filteredQuotes = quotes.filter(q => {
    if (filterStatus !== "all" && q.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-8 text-slate-100 font-sans">
      
      {/* ── Banner Principal ── */}
      <div
        className="rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a0533 0%, #0e011f 100%)" }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: PURPURA }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: FUCSIA }} />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-[#FF0096]/20 text-[#FF0096] border border-[#FF0096]/30">
              <FileText className="w-3.5 h-3.5" />
              <span>SISTEMA DE GESTIÓN COMERCIAL & TARIFARIO DE CREADOR</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-wide">
              Cotizaciones & Propuestas Comerciales
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Genera presupuestos formales para posadas, restaurantes y marcas patrocinadoras. Envía cotizaciones directas por WhatsApp y conviértelas en acuerdos comerciales con un solo clic.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-black text-white shadow-xl hover:scale-103 active:scale-97 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20 shrink-0"
            style={{ background: `linear-gradient(135deg, ${FUCSIA} 0%, ${PURPURA} 100%)` }}
          >
            <Plus className="w-4 h-4" />
            <span>Generar Nueva Cotización</span>
          </button>
        </div>
      </div>

      {/* ── TARIFARIO BASE DE REFERENCIA (RATE CARD) ── */}
      <div className="p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#00C8D4]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tarifario de Referencia de {creatorName}</h3>
          </div>
          <span className="text-xs text-slate-400">Precios base sugeridos para posadas & marcas</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BASE_SERVICES.map((srv, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-white line-clamp-1">{srv.name}</h4>
                  <span className="text-xs font-black text-[#FF0096]">${srv.price}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{srv.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FILTROS Y ESTADOS DE COTIZACIÓN ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: "all", label: "Todas las Cotizaciones" },
          { id: "enviada", label: "Enviadas / En Negociación" },
          { id: "aprobada", label: "Aprobadas / Pautadas" },
          { id: "cobrada", label: "Cobradas / Liquidadas" },
          { id: "borrador", label: "Borradores" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id as any)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
              filterStatus === tab.id
                ? "bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white border-white/30 shadow-md font-black"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── GRID DE COTIZACIONES ── */}
      {filteredQuotes.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/5 border border-dashed border-white/15">
          <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No hay cotizaciones en este estado</h4>
          <p className="text-xs text-slate-400 mt-1">Genera tu primera propuesta comercial para una posada o marca patrocinadora.</p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] text-white text-xs font-bold"
          >
            Nueva Cotización
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuotes.map(q => {
            const isApproved = q.status === "aprobada" || q.status === "cobrada";
            const isPending = q.status === "enviada";

            return (
              <div
                key={q.id}
                className={`rounded-3xl border p-5 shadow-xl backdrop-blur-md flex flex-col justify-between transition-all ${
                  isApproved
                    ? "bg-gradient-to-b from-emerald-950/40 to-black/60 border-emerald-500/40"
                    : isPending
                    ? "bg-gradient-to-b from-amber-950/40 to-black/60 border-amber-500/40"
                    : "bg-white/5 border-white/15"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[11px] font-black text-[#00C8D4] px-2.5 py-0.5 rounded-lg bg-black/40 border border-white/10">
                      {q.quote_number}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      isApproved ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}>
                      {q.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white font-serif">{q.client_name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">Destino: <strong className="text-slate-200">{q.destination_target || 'Venezuela'}</strong></div>

                  {/* Ítems cotizados */}
                  <div className="mt-3 p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1.5 text-xs">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Servicios Incluidos:</div>
                    {q.items.map(it => (
                      <div key={it.id} className="flex justify-between text-slate-300 text-[11px]">
                        <span className="truncate max-w-[180px]">• {it.service_name}</span>
                        <span className="font-bold text-white">${it.total_usd}</span>
                      </div>
                    ))}
                    
                    <div className="pt-2 mt-1 border-t border-white/10 flex justify-between font-bold text-xs">
                      <span className="text-slate-200">Total Cotizado:</span>
                      <span className="text-[#FF0096] text-sm">${q.total_usd.toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyWhatsAppQuote(q)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      {copiedId === q.id ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                      <span>{copiedId === q.id ? "¡Copiado!" : "Enviar por WhatsApp"}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm("¿Eliminar esta cotización?")) onDeleteQuote(q.id);
                      }}
                      className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {!q.converted_to_deal && q.status !== "rechazada" && (
                    <button
                      onClick={() => onConvertToDeal(q.id)}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#00C8D4] to-[#9B00CC] hover:brightness-110 text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Aprobar & Crear Acuerdo Comercial</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL: GENERADOR DE COTIZACIÓN ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#1a0533] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/15 p-6 md:p-8 text-slate-100">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF0096] to-[#9B00CC] flex items-center justify-center text-white shadow-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-serif text-white">Generador de Cotización Comercial</h3>
                  <p className="text-xs text-slate-300">Crea una propuesta de servicios para posada, restaurante o marca</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuote} className="space-y-4 mt-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Cliente / Posada Patrocinadora *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    placeholder="Ej: Posada Perla Negra"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Contacto / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.client_contact}
                    onChange={(e) => setFormData({ ...formData, client_contact: e.target.value })}
                    placeholder="Ej: Antonio (+58 412-1234567)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-[#00C8D4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Selecciona los Servicios a Incluir en la Propuesta:
                </label>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {BASE_SERVICES.map((srv, idx) => {
                    const isSelected = formData.selectedServices.some(s => s.name === srv.name);
                    return (
                      <div
                        key={idx}
                        onClick={() => handleToggleService(srv)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-[#00C8D4]/15 border-[#00C8D4] text-white"
                            : "bg-black/30 border-white/10 text-slate-300 hover:bg-black/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${isSelected ? 'bg-[#00C8D4] border-[#00C8D4] text-black font-bold' : 'border-white/30'}`}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold">{srv.name}</div>
                            <div className="text-[10px] text-slate-400">{srv.desc}</div>
                          </div>
                        </div>
                        <span className="text-xs font-black text-[#FF0096] shrink-0">${srv.price} USD</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Descuento Comercial ($ USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.discount_usd}
                    onChange={(e) => setFormData({ ...formData, discount_usd: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Total Cotización
                  </label>
                  <div className="px-3.5 py-2 rounded-xl bg-black/60 border border-[#00C8D4]/40 text-sm font-black text-[#00C8D4]">
                    ${formTotal.toFixed(2)} USD (~Bs. {formatBs(formTotal)})
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Condiciones / Términos de la Propuesta
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-[#FF0096]/20"
                >
                  Generar Cotización
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
