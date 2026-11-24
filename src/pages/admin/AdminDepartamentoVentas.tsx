import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  FileText,
  Filter,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users
} from "lucide-react";
import {
  getSalesCounters,
  getSalesReceipts,
  MAX_FOUNDERS_QUOTA,
  resetAllSalesAndFinanceCountersToZero,
  syncSalesStateFromSupabase,
  updateReceiptFinancialStatus,
  type FinancialStatus,
  type SalesCountersState,
  type SalesPreRegistrationReceipt
} from "@/lib/salesDepartmentStore";
import {
  PreRegistrationReceiptModal,
  printOfficialPreRegistrationReceipt,
  resolveReceiptEstablishmentImage
} from "@/components/sales/PreRegistrationReceiptModal";

export function AdminDepartamentoVentas() {
  const { user, profile, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [counters, setCounters] = useState<SalesCountersState>(() => getSalesCounters());
  const [receipts, setReceipts] = useState<SalesPreRegistrationReceipt[]>(() => getSalesReceipts());
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedReceipt, setSelectedReceipt] = useState<SalesPreRegistrationReceipt | null>(null);

  // Filtros de búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [modalityFilter, setModalityFilter] = useState<string>("all");
  const [originFilter, setOriginFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [consolidationFilter, setConsolidationFilter] = useState<string>("all");

  useEffect(() => {
    if (
      !authLoading &&
      (!user ||
        (profile?.role !== "admin" &&
          user?.email?.toLowerCase() !== "hotelesdevenezuela77@gmail.com"))
    ) {
      setLocation("/hdv-acceso-llc2027");
    }
  }, [user, profile, authLoading, setLocation]);

  const loadDepartmentData = async () => {
    setLoading(true);
    const synced = await syncSalesStateFromSupabase();
    setCounters(synced.counters);
    setReceipts(synced.receipts);
    setLoading(false);
  };

  useEffect(() => {
    loadDepartmentData();
    const handleUpdate = () => {
      setCounters(getSalesCounters());
      setReceipts(getSalesReceipts());
    };
    window.addEventListener("hdv_sales_v13_updated", handleUpdate);
    return () => window.removeEventListener("hdv_sales_v13_updated", handleUpdate);
  }, []);

  const handleResetCounters = async () => {
    const confirmed = window.confirm(
      "¿Confirmas reiniciar en CERO (0) todos los contadores de Pre-Registro, Cupos 50 Fundadores y Facturación Correlativa en Departamento de Ventas y Finanzas?"
    );
    if (!confirmed) return;
    const zero = await resetAllSalesAndFinanceCountersToZero();
    setCounters(zero);
    setReceipts([]);
  };

  const handleTogglePaymentStatus = async (
    receipt: SalesPreRegistrationReceipt,
    newStatus: FinancialStatus
  ) => {
    await updateReceiptFinancialStatus(receipt.folio, newStatus);
    setReceipts(getSalesReceipts());
  };

  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const match =
          r.folio.toLowerCase().includes(q) ||
          r.financialCorrelative.toLowerCase().includes(q) ||
          r.establishmentTitle.toLowerCase().includes(q) ||
          r.destinationName.toLowerCase().includes(q) ||
          r.whatsappNumber.toLowerCase().includes(q) ||
          r.registrantName.toLowerCase().includes(q) ||
          r.clientIp.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (modalityFilter !== "all" && r.modality !== modalityFilter) return false;
      if (originFilter !== "all" && r.origin !== originFilter) return false;
      if (statusFilter !== "all" && r.financialStatus !== statusFilter) return false;
      if (consolidationFilter === "consolidated" && !r.wasConsolidatedExisting) return false;
      if (consolidationFilter === "new" && r.wasConsolidatedExisting) return false;

      return true;
    });
  }, [receipts, searchQuery, modalityFilter, originFilter, statusFilter, consolidationFilter]);

  const foundersOccupied = Math.min(MAX_FOUNDERS_QUOTA, counters.foundersCounter);
  const foundersRemaining = Math.max(0, MAX_FOUNDERS_QUOTA - foundersOccupied);
  const foundersPct = Math.min(100, Math.round((foundersOccupied / MAX_FOUNDERS_QUOTA) * 100));

  const totalExonerated = receipts.filter((r) => r.financialStatus === "exonerado").length;
  const totalConsolidated = receipts.filter((r) => r.wasConsolidatedExisting).length;
  const totalInvoices = receipts.filter((r) => r.invoiceNumber !== null).length;
  const totalBilledUsd = receipts
    .filter((r) => r.financialStatus !== "exonerado")
    .reduce((acc, r) => acc + (r.monthlyAmountUsd || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Cabecera Oficial Departamento de Ventas */}
      <div className="bg-gradient-to-r from-[#0e011f] via-[#15062c] to-[#1a0533] text-white py-10 px-6 border-b-4 border-[#00C8D4]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-[#00C8D4]/40 text-[#00C8D4] text-[11px] font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#FF0096]" />
              <span>Marketing y Ventas • Sincronizado con Finanzas y CRM</span>
            </div>
            <h1
              className="text-2xl sm:text-4xl font-black text-white tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Departamento de Ventas & Control de Pre-Registros
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl">
              Trazabilidad de comprobantes con Código QR, auditoría de IP/dispositivo, control de
              cupos <strong>50 Fundadores ($0.00)</strong> y facturación correlativa automática{" "}
              <strong>HDV-FAC-2026-XXXX</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={loadDepartmentData}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Sincronizar</span>
            </button>

            <button
              type="button"
              onClick={handleResetCounters}
              className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-200 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Reiniciar todos los contadores en Cero (0)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar en Cero (0)</span>
            </button>

            <Link
              href="/pre-registro"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF0096] to-[#9B00CC] hover:opacity-95 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Pre-Registro V13</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {/* Barra de Progreso Oficial: Programa 50 Fundadores y Activación Post-50 */}
        <div className="rounded-3xl bg-gradient-to-br from-[#0e011f] to-[#1a0533] text-white p-6 sm:p-7 border border-[#00C8D4]/30 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FF0096] text-white flex items-center justify-center shrink-0 shadow-lg">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00C8D4] block">
                  Control Correlativo • Alianza 50 Fundadores
                </span>
                <h2
                  className="text-xl sm:text-2xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Cupos 50 Fundadores: {foundersOccupied} Ocupados / {foundersRemaining} Disponibles
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/15 text-right">
                <span className="block text-[10px] uppercase font-bold text-slate-300">
                  Estatus de Facturación Post-50
                </span>
                <span className="text-xs font-black text-[#00C8D4]">
                  {foundersOccupied < MAX_FOUNDERS_QUOTA
                    ? `Exoneración Activa ($0.00 USD • Restan ${foundersRemaining} cupos)`
                    : "50 Cupos Completados • Facturación Automática HDV-FAC Activa"}
                </span>
              </div>
            </div>
          </div>

          {/* Barra de Progreso Visual */}
          <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/15">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(2, foundersPct)}%`,
                background: "linear-gradient(90deg, #00C8D4 0%, #FF0096 100%)"
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mt-2">
            <span>Inicio en Cero (0 / 50)</span>
            <span>Progreso actual: {foundersPct}% ({foundersOccupied} / 50)</span>
            <span>Meta 50 Fundadores (Activación Facturación HDV-FAC)</span>
          </div>
        </div>

        {/* Tarjetas KPI de Operaciones Comerciales, Auditoría y Consolidación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total de Pre-Registros */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00C8D4] text-white flex items-center justify-center shrink-0 shadow-md">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Total Pre-Registros
              </span>
              <p className="text-2xl font-black text-slate-900 font-mono">
                {receipts.length}
              </p>
              <span className="text-[11px] font-bold text-[#008f99]">
                Último: {counters.preRegCounter > 0 ? `HDV-PR-2026-${String(counters.preRegCounter).padStart(4, "0")}` : "En Cero (0)"}
              </span>
            </div>
          </div>

          {/* 2. Cupos Utilizados Alianza 50 Fundadores */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF0096] text-white flex items-center justify-center shrink-0 shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Alianza 50 Fundadores
              </span>
              <p className="text-2xl font-black text-slate-900 font-mono">
                {foundersOccupied} <span className="text-sm text-slate-400">/ {MAX_FOUNDERS_QUOTA}</span>
              </p>
              <span className="text-[11px] font-bold text-[#FF0096]">
                {foundersRemaining} cupos disponibles
              </span>
            </div>
          </div>

          {/* 3. Registros Exonerados ($0.00) & Facturación */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#9B00CC] text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Registros Exonerados ($0.00)
              </span>
              <p className="text-2xl font-black text-slate-900 font-mono">
                {totalExonerated}
              </p>
              <span className="text-[11px] font-bold text-purple-700">
                Facturas HDV-FAC: {totalInvoices} (${totalBilledUsd.toFixed(0)} USD)
              </span>
            </div>
          </div>

          {/* 4. Fichas Consolidadas (Sin Duplicados) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Fichas Consolidadas
              </span>
              <p className="text-2xl font-black text-slate-900 font-mono">
                {totalConsolidated}
              </p>
              <span className="text-[11px] font-bold text-emerald-700">
                Upsert inteligente sin duplicados
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Accesos Rápidos entre Módulos Vinculados y Formulario /pre-registro */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1">
              Módulos Sincronizados:
            </span>
            <Link
              href="/admin/finanzas"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#00C8D4] hover:text-slate-950 text-slate-700 text-[11px] font-extrabold transition-colors"
            >
              Libro de Finanzas
            </Link>
            <Link
              href="/admin/comercial"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#FF0096] hover:text-white text-slate-700 text-[11px] font-extrabold transition-colors"
            >
              Pipeline CRM
            </Link>
            <Link
              href="/admin/clientes"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#00C8D4] hover:text-slate-950 text-slate-700 text-[11px] font-extrabold transition-colors"
            >
              Base de Clientes
            </Link>
            <Link
              href="/admin/logs"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#9B00CC] hover:text-white text-slate-700 text-[11px] font-extrabold transition-colors"
            >
              Auditoría de Logs (IP)
            </Link>
          </div>

          <Link
            href="/pre-registro"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0e011f] hover:bg-[#1a0533] text-[#00C8D4] text-xs font-black uppercase tracking-wider transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#FF0096]" />
            <span>Ir al Formulario /pre-registro (Crear o Consolidar)</span>
          </Link>
        </div>

        {/* Barra de Filtros y Buscador */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por Folio (HDV-PR-2026-0001), Factura (HDV-FAC), hotel, destino, agente o IP..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#00C8D4]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={modalityFilter}
                  onChange={(e) => setModalityFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">Todas las Modalidades</option>
                  <option value="fundadores_50">Programa 50 Fundadores</option>
                  <option value="exclusivo_prestigio">Cliente Exclusivo / Prestigio 2026</option>
                  <option value="comercial_estandar">Membresía Comercial / Estándar</option>
                </select>
              </div>

              <select
                value={originFilter}
                onChange={(e) => setOriginFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Todos los Orígenes</option>
                <option value="propietario">Propietario / Gerente</option>
                <option value="agente_ventas">Agente de Ventas HDV</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Todos los Estatus Financieros</option>
                <option value="exonerado">Exonerado ($0.00)</option>
                <option value="pendiente_pago">Factura Pendiente de Pago</option>
                <option value="pagado">Factura Pagada</option>
              </select>

              <select
                value={consolidationFilter}
                onChange={(e) => setConsolidationFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Todos los Tipos de Ficha</option>
                <option value="consolidated">Fichas Consolidadas (Existentes)</option>
                <option value="new">Fichas Nuevas</option>
              </select>
            </div>
          </div>

          {/* Tabla de Comprobantes Emitidos */}
          {filteredReceipts.length === 0 ? (
            <div className="py-14 text-center space-y-3 border-2 border-dashed border-slate-200 rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-[#00C8D4] text-white flex items-center justify-center mx-auto shadow-md">
                <QrCode className="w-6 h-6" />
              </div>
              <h3
                className="text-lg font-bold text-slate-900"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Contadores en Cero (0) • Sin Comprobantes Emitidos Aún
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                El sistema está limpio y listo para iniciar la secuencia oficial desde el folio{" "}
                <strong>HDV-PR-2026-0001</strong> sincronizado con el Módulo de Finanzas.
              </p>
              <div className="pt-2">
                <Link
                  href="/pre-registro"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF0096] text-white text-xs font-black uppercase tracking-wider shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Emitir Primer Pre-Registro (HDV-PR-2026-0001)</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-3">Folio & Finanzas</th>
                    <th className="py-3 px-3">Establecimiento, Categoría & Destino</th>
                    <th className="py-3 px-3">Modalidad / Cupo</th>
                    <th className="py-3 px-3">Originador & Términos Legales</th>
                    <th className="py-3 px-3">Fecha/Hora & IP</th>
                    <th className="py-3 px-3">Estatus Financiero</th>
                    <th className="py-3 px-3 text-right">Acciones Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredReceipts.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-[#0e011f] text-white font-mono font-black text-[11px]">
                          {r.folio}
                        </span>
                        <span className="block font-mono text-[10px] font-extrabold text-[#008f99] mt-1">
                          {r.financialCorrelative}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={resolveReceiptEstablishmentImage(r)}
                            alt={r.establishmentTitle}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-black text-slate-900 truncate">{r.establishmentTitle}</p>
                              {r.wasConsolidatedExisting && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                                  Consolidada
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-semibold block">
                              {r.categoryName} • {r.destinationName} ({r.city}, {r.state})
                            </span>
                            <span className="text-[10px] text-emerald-700 font-bold">
                              WhatsApp: {r.whatsappNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            r.modality === "fundadores_50"
                              ? "bg-pink-100 text-pink-700"
                              : r.modality === "exclusivo_prestigio"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-cyan-100 text-cyan-800"
                          }`}
                        >
                          {r.modalityLabel}
                        </span>
                        {r.founderSlotNumber && (
                          <span className="block text-[10px] font-extrabold text-[#FF0096] mt-1">
                            Cupo #{r.founderSlotNumber} / {MAX_FOUNDERS_QUOTA}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-bold text-slate-800 block">{r.registrantName}</span>
                        {r.termsAccepted !== false ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold mt-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Términos y Derechos de Imagen Aceptados</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-rose-600 font-bold">
                            Pendiente de confirmación
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-bold text-slate-800 block">
                          {r.createdAtFormatted}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 block">
                          IP: {r.clientIp}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        {r.financialStatus === "exonerado" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-black">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>EXONERADO ($0.00)</span>
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black ${
                                r.financialStatus === "pagado"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {r.financialStatus === "pagado" ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                              <span>
                                {r.financialStatus === "pagado" ? "PAGADO" : "PENDIENTE"} ($
                                {r.monthlyAmountUsd.toFixed(2)})
                              </span>
                            </span>

                            <div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleTogglePaymentStatus(
                                    r,
                                    r.financialStatus === "pagado" ? "pendiente_pago" : "pagado"
                                  )
                                }
                                className="text-[10px] font-extrabold text-[#008f99] hover:underline cursor-pointer"
                              >
                                Cambiar a{" "}
                                {r.financialStatus === "pagado" ? "Pendiente" : "Pagado"}
                              </button>
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(r)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#00C8D4] text-slate-950 text-[10px] font-black flex items-center gap-1 hover:opacity-90 cursor-pointer"
                            title="Ver Credencial / Comprobante con Código QR"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Ver QR</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => printOfficialPreRegistrationReceipt(r)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            title="Reimprimir Comprobante PDF en 1 Hoja"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <a
                            href={`/establecimiento/${r.establishmentSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-[#008f99]"
                            title="Abrir Ficha Pública del Establecimiento"
                          >
                            <Building2 className="w-3.5 h-3.5" />
                          </a>

                          <a
                            href={r.verificationPath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#9B00CC]"
                            title="Abrir Certificado Público de Verificación QR"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Comprobante Oficial con QR */}
      <PreRegistrationReceiptModal
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
}
